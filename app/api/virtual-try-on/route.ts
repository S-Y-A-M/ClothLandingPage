import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_RESULT_SIZE = 15 * 1024 * 1024;
const PRODUCT_CATALOG = {
  "atelier-oversized-blazer": {
    category: "tops",
    color: "Terracotta",
    image:
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1400&q=88",
  },
  "atelier-soft-structure": {
    category: "tops",
    color: "Oat",
    image:
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1400&q=88",
  },
  "atelier-modern-layer": {
    category: "one-pieces",
    color: "Sky",
    image:
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1400&q=88",
  },
  "atelier-little-days": {
    category: "tops",
    color: "Sage",
    image:
      "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=1400&q=88",
  },
} as const;

type ProviderStatus = {
  id?: string;
  status?: string;
  output?: string[] | null;
  error?: string | null;
};

function json(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store, private" },
  });
}

function hasValidImageSignature(bytes: Buffer, mimeType: string) {
  if (mimeType === "image/jpeg") {
    return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  return mimeType === "image/webp" &&
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP";
}

function isProductId(id: FormDataEntryValue | null): id is keyof typeof PRODUCT_CATALOG {
  return typeof id === "string" && Object.hasOwn(PRODUCT_CATALOG, id);
}

function isProviderImageUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

async function getPrivateResultDataUrl(imageUrl: string) {
  const response = await fetch(imageUrl, {
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  });
  const contentType = response.headers.get("content-type")?.split(";")[0].toLowerCase();
  if (!response.ok || !contentType || !["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    throw new Error("The generated preview could not be retrieved. Please try again.");
  }
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_RESULT_SIZE) {
    throw new Error("The generated preview is too large to return securely.");
  }
  if (!response.body) throw new Error("The generated preview was empty. Please try again.");

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let totalSize = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalSize += value.byteLength;
    if (totalSize > MAX_RESULT_SIZE) {
      await reader.cancel();
      throw new Error("The generated preview is too large to return securely.");
    }
    chunks.push(Buffer.from(value));
  }
  return `data:${contentType};base64,${Buffer.concat(chunks).toString("base64")}`;
}

async function providerRequest(path: string, init?: RequestInit) {
  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) throw new Error("Virtual try-on is temporarily unavailable. Please try again later.");

  const response = await fetch(`https://api.fashn.ai/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(init?.headers ?? {}),
    },
    signal: AbortSignal.timeout(60_000),
    cache: "no-store",
  });
  if (!response.ok) {
    if (response.status === 401 || response.status === 403 || response.status >= 500) {
      throw new Error("The AI fitting service is temporarily unavailable. Please try again later.");
    }
    throw new Error("The AI fitting service could not process this request.");
  }
  return (await response.json()) as ProviderStatus;
}

async function formatProviderResult(result: ProviderStatus) {
  if (result.status === "failed" || result.error) {
    return json({ error: "We couldn't create your preview. Please try another photo or try again." }, 502);
  }
  if (result.status === "completed") {
    const imageUrl = result.output?.[0];
    if (!isProviderImageUrl(imageUrl)) {
      return json({ error: "The AI service returned an invalid preview. Please try again." }, 502);
    }
    try {
      return json({ status: "completed", imageUrl: await getPrivateResultDataUrl(imageUrl) });
    } catch {
      return json({ error: "The generated preview could not be retrieved securely. Please try again." }, 502);
    }
  }
  if (!result.id || !/^[A-Za-z0-9_-]{1,128}$/.test(result.id)) {
    return json({ error: "The AI service returned an invalid processing status." }, 502);
  }
  return json({ status: "processing", jobId: result.id }, 202);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return json({ error: "This request origin is not allowed." }, 403);
  }
  const apiKey = process.env.FASHN_API_KEY;
  if (!apiKey) {
    return json({ error: "Virtual try-on is not configured yet. Please check back soon." }, 503);
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_FILE_SIZE + 64 * 1024) {
    return json({ error: "Your photo must be smaller than 10 MB." }, 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "Please upload a valid image file." }, 400);
  }
  const image = form.get("personImage");
  const productId = form.get("productId");
  const category = form.get("category");
  const productColor = form.get("productColor");

  if (!(image instanceof File)) return json({ error: "Please upload your photograph." }, 400);
  if (!["image/jpeg", "image/png", "image/webp"].includes(image.type)) {
    return json({ error: "Please upload a JPG, PNG, or WebP image." }, 415);
  }
  if (image.size === 0 || image.size > MAX_FILE_SIZE) {
    return json({ error: "Your photo must be between 1 byte and 10 MB." }, 413);
  }
  if (!isProductId(productId)) {
    return json({ error: "The selected product is not available for virtual try-on." }, 400);
  }
  const product = PRODUCT_CATALOG[productId];
  if (category !== product.category || productColor !== product.color) {
    return json({ error: "The selected product details do not match our catalog." }, 400);
  }

  const bytes = Buffer.from(await image.arrayBuffer());
  if (!hasValidImageSignature(bytes, image.type)) {
    return json({ error: "This image file appears to be damaged or mislabeled." }, 415);
  }

  try {
    const result = await providerRequest("run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model_name: "tryon-v1.6",
        inputs: {
          model_image: `data:${image.type};base64,${bytes.toString("base64")}`,
          garment_image: product.image,
          category: product.category,
        },
      }),
    });
    return await formatProviderResult(result);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return json({
      error: timedOut
        ? "The fitting is taking longer than expected. Please try again."
        : error instanceof Error
          ? error.message
          : "The AI fitting service is temporarily unavailable.",
    }, timedOut ? 504 : 502);
  }
}

export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("jobId");
  if (!jobId || !/^[A-Za-z0-9_-]{1,128}$/.test(jobId)) {
    return json({ error: "A valid processing ID is required." }, 400);
  }
  try {
    const result = await providerRequest(`status/${encodeURIComponent(jobId)}`);
    return await formatProviderResult(result);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return json({
      error: timedOut
        ? "Checking the fitting status timed out. Please try again."
        : error instanceof Error
          ? error.message
          : "The AI fitting service is temporarily unavailable.",
    }, timedOut ? 504 : 502);
  }
}
