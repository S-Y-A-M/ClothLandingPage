# ATELIER.

An editorial fashion showcase with a cinematic, video-led homepage hero, Men/Women/Kids/Accessories collection routes, motion-led product discovery, and dedicated product galleries at `/products/[productId]`. There is no cart, checkout, or payment flow. Product pages offer a private, provider-backed AI virtual try-on.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Homepage campaign hero

The homepage hero combines the supplied store interior at `public/Vibrant Modern Clothing Store Interior.png` with editorial video panels. The existing women’s and men’s campaign clips, plus the fashion film, stream from the URLs in `app/catalog.ts`; videos are muted, inline, looped, and paused when their panels leave view. Reduced-motion preferences leave the image posters visible.

Optional local clips use these paths and gracefully show their poster images until the files are added:

```text
public/videos/fashion-styling-hands.mp4
public/videos/clothing-racks.mp4
public/videos/boutique-interior.mp4
```

Add browser-playable MP4 files at those paths to activate the additional panels. The rack photo at `public/showroom-clothing-racks.jpg` and the existing catalog/store photography provide the still-image fallbacks. The header, collection navigation, and sections below the hero remain part of the homepage.

## Configure virtual try-on

The try-on uses the open-source FASHN VTON 1.5 model in your Google Colab GPU runtime. Start the existing FASHN setup, then run `fashn_vton_fastapi.ipynb` in that same runtime. The notebook starts an authenticated FastAPI service on port 8000 and provides cells to start and test a temporary Cloudflare Quick Tunnel.

Copy the `https://...trycloudflare.com` URL printed by the notebook and set these **server-only** variables in the local `.env.local` file:

```text
COLAB_VTON_URL=https://your-tunnel-url
COLAB_VTON_API_TOKEN=your-random-shared-token
```

Generate a long random token and enter the same value at the notebook's hidden token prompt. Never use a `NEXT_PUBLIC_` prefix or commit the actual URL/token. `.env*` files are ignored by Git. Quick Tunnel URLs change when the tunnel or Colab runtime restarts; update `COLAB_VTON_URL` and restart the Next.js server after that happens. Colab is a temporary development environment, not permanent hosting. The paid hosted FASHN API is not used.

The browser sends `personImage` (JPEG, PNG, or WebP, up to 10 MB), `productId`, `category`, and `productColor` to `app/api/virtual-try-on/route.ts`. The Next.js route retains the same-origin, image-signature, file-size, and catalog checks; it retrieves the selected garment image from the existing fixed catalog and sends both images to Colab as multipart data. On success it returns `{ "status": "completed", "imageUrl": "data:image/png;base64,..." }`, so the existing frontend can display the result without a design or response-contract change. The route does not expose the Colab URL or token to the browser. The current catalog marks the hanger image as `flat-lay` and the model-worn images as `model`.

Uploaded and generated images are not intentionally saved to an application database or persistent storage. The Colab FastAPI multipart handler may temporarily buffer uploaded files while processing, and the notebook's manual test cell writes a result under `/content`; Colab runtime storage is ephemeral. The API returns the generated PNG as private, non-cacheable data rather than exposing a result URL. Deleting a preview clears the browser copy but cannot erase data already temporarily buffered by a running Colab session. The user-facing privacy copy explains this processing flow.

The result is a visual preview, not a guarantee of garment fit or size accuracy. Keep the Colab runtime and tunnel running while using virtual try-on; stop them when finished.
