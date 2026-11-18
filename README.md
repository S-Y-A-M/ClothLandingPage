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

The try-on uses FASHN AI's `tryon-v1.6` model. Set `FASHN_API_KEY` in the server environment (for local development, use an untracked `.env.local` file):

```text
FASHN_API_KEY=your_server_side_key
```

Keep the key server-side; it is only read by `app/api/virtual-try-on/route.ts`. Without a key, the storefront remains usable and the try-on flow reports that processing is not configured. It does not generate a mock result.

The API accepts a `personImage` multipart file (JPEG, PNG, or WebP, up to 10 MB), `productId`, `category`, and `productColor`. The server validates the image signature and checks the product/category/color against its catalog before sending the photo and server-selected garment reference to FASHN. The reference image represents the selected product and color; it is deliberately resolved on the server rather than trusting a client-supplied image URL. Pending FASHN jobs are polled through the same endpoint. The API includes a same-origin check; production deployments should also apply their normal abuse controls and rate limits at the edge.

Uploaded bytes and the generated result are held in memory only and are not written to this application's disk or database. The server fetches the provider result and returns it as private, non-cacheable image data rather than exposing the provider's result URL. This app does not control provider-side retention or offer provider-side deletion; deleting the preview clears the local browser preview, while the provider processes and retains its copies according to its own policy. Update the consent and privacy copy if the provider or its retention terms change.

The result is a visual preview, not a guarantee of garment fit or size accuracy.
