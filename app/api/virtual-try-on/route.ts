import { NextRequest, NextResponse } from "next/server";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_RESULT_SIZE = 15 * 1024 * 1024;
const CATALOG_IMAGE_TIMEOUT_MS = 30_000;
const COLAB_REQUEST_TIMEOUT_MS = 240_000;
export const maxDuration = 300;

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

const PRODUCT_GARMENT_PHOTO_TYPES = {
  "atelier-oversized-blazer": "flat-lay",
  "atelier-soft-structure": "model",
  "atelier-modern-layer": "model",
  "atelier-little-days": "model",
} as const satisfies Record<keyof typeof PRODUCT_CATALOG, "flat-lay" | "model">;

type ColabConfig = {
  endpoint: string;
  token: string;
};

type CatalogImage = {
  bytes: Buffer;
  contentType: string;
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

function getColabConfig(): ColabConfig | null {
  const rawUrl = process.env.COLAB_VTON_URL;
  const token = process.env.COLAB_VTON_API_TOKEN;
  if (!rawUrl || !token || token.length < 32) return null;

  try {
    const baseUrl = new URL(rawUrl);
    if (
      baseUrl.protocol !== "https:" ||
      baseUrl.username ||
      baseUrl.password ||
      baseUrl.search ||
      baseUrl.hash
    ) {
      return null;
    }
    return {
      endpoint: new URL("/virtual-try-on", baseUrl).toString(),
      token,
    };
  } catch {
    return null;
  }
}

class ImagePayloadTooLargeError extends Error {}

async function readBoundedResponse(response: Response, maxSize: number) {
  const contentLengthHeader = response.headers.get("content-length");
  const contentLength = contentLengthHeader === null ? NaN : Number(contentLengthHeader);
  if (Number.isFinite(contentLength) && contentLength > maxSize) {
    throw new ImagePayloadTooLargeError();
  }
  if (!response.body) throw new Error("The image response was empty.");

  const reader = response.body.getReader();
  const chunks: Buffer[] = [];
  let totalSize = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalSize += value.byteLength;
    if (totalSize > maxSize) {
      await reader.cancel();
      throw new ImagePayloadTooLargeError();
    }
    chunks.push(Buffer.from(value));
  }
  return Buffer.concat(chunks);
}

async function getCatalogImage(imageUrl: string): Promise<CatalogImage> {
  const url = new URL(imageUrl);
  if (url.protocol !== "https:" || url.hostname !== "images.unsplash.com" || url.username || url.password) {
    throw new Error("The catalog image URL is invalid.");
  }

  const response = await fetch(url, {
    headers: { Accept: "image/jpeg, image/png, image/webp" },
    signal: AbortSignal.timeout(CATALOG_IMAGE_TIMEOUT_MS),
    cache: "no-store",
    redirect: "error",
  });
  const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (!response.ok || !contentType || !["image/jpeg", "image/png", "image/webp"].includes(contentType)) {
    throw new Error("The catalog image could not be retrieved.");
  }
  const bytes = await readBoundedResponse(response, MAX_FILE_SIZE);
  if (!hasValidImageSignature(bytes, contentType)) {
    throw new Error("The catalog image data is invalid.");
  }
  return { bytes, contentType };
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return json({ error: "This request origin is not allowed." }, 403);
  }
  const colab = getColabConfig();
  if (!colab) {
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

  let garmentImage: CatalogImage;
  try {
    garmentImage = await getCatalogImage(product.image);
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    return json({
      error: timedOut
        ? "Retrieving the selected garment timed out. Please try again."
        : "The selected garment image is temporarily unavailable.",
    }, timedOut ? 504 : 502);
  }

  const upstreamForm = new FormData();
  upstreamForm.append("person_image", image, "person-image");
  upstreamForm.append(
    "garment_image",
    new Blob([new Uint8Array(garmentImage.bytes)], { type: garmentImage.contentType }),
    "garment-image",
  );
  upstreamForm.append("category", product.category);
  upstreamForm.append("garment_photo_type", PRODUCT_GARMENT_PHOTO_TYPES[productId]);

  let response: Response;
  try {
    response = await fetch(colab.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${colab.token}`,
        Accept: "image/png",
      },
      body: upstreamForm,
      signal: AbortSignal.timeout(COLAB_REQUEST_TIMEOUT_MS),
      cache: "no-store",
      redirect: "error",
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "TimeoutError";
    console.error("Colab virtual try-on request failed.", error);
    return json({
      error: timedOut
        ? "The fitting is taking longer than expected. Please try again."
        : "The AI fitting service is temporarily unavailable. Please try again later.",
    }, timedOut ? 504 : 503);
  }

  if (!response.ok) {
    if (response.status === 429 || response.status === 503) {
      return json({ error: "The AI fitting service is busy. Please try again shortly." }, 503);
    }
    if (response.status === 504) {
      return json({ error: "The fitting is taking longer than expected. Please try again." }, 504);
    }
    if (response.status === 413) {
      return json({ error: "The selected images exceed the fitting service's size limit." }, 413);
    }
    if (response.status === 401 || response.status === 403) {
      console.error("Colab virtual try-on rejected the configured server token.");
      return json({ error: "The AI fitting service is temporarily unavailable." }, 503);
    }
    return json({ error: "We couldn't create your preview. Please try again." }, 502);
  }

  const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "image/png") {
    return json({ error: "The AI service returned an invalid preview. Please try again." }, 502);
  }

  let resultBytes: Buffer;
  try {
    resultBytes = await readBoundedResponse(response, MAX_RESULT_SIZE);
  } catch (error) {
    if (error instanceof ImagePayloadTooLargeError) {
      return json({ error: "The generated preview is too large to return securely." }, 502);
    }
    console.error("Could not read the generated Colab preview.", error);
    return json({ error: "The generated preview could not be retrieved securely." }, 502);
  }

  if (!hasValidImageSignature(resultBytes, "image/png")) {
    return json({ error: "The AI service returned an invalid preview. Please try again." }, 502);
  }

  return json({
    status: "completed",
    imageUrl: `data:image/png;base64,${resultBytes.toString("base64")}`,
  });
}
