"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type DragEvent, type ReactNode } from "react";
import { products } from "./catalog";
import CategoryShowcase from "./components/category-showcase";
import ProductEditorialCard from "./components/product-editorial-card";
import FashionHero from "./components/fashion-hero";

type TryOnState = "upload" | "processing" | "result" | "error";
type ApiResult = { status: "processing"; jobId: string } | { status: "completed"; imageUrl: string };

function subscribeToTryOnQuery(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

function getTryOnProductId() {
  return new URLSearchParams(window.location.search).get("tryOn");
}

function Icon({
  name,
  size = 20,
}: {
  name: "close" | "upload" | "sparkle" | "arrow" | "check" | "trash" | "download" | "share" | "refresh" | "lock";
  size?: number;
}) {
  const paths: Record<typeof name, ReactNode> = {
    close: <path d="m6 6 12 12M18 6 6 18" />,
    upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M20 16.5v2A1.5 1.5 0 0 1 18.5 20h-13A1.5 1.5 0 0 1 4 18.5v-2" /></>,
    sparkle: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2L12 3Z" /><path d="m19 14 1 2.5 2 1-2 1L19 21l-1-2.5-2-1 2-1 1-2.5Z" /></>,
    arrow: <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    trash: <><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
    download: <><path d="M12 3v12m0 0 5-5m-5 5-5-5" /><path d="M4 17v3h16v-3" /></>,
    share: <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="m8.7 10.7 6.6-4.4m-6.6 7 6.6 4.4" /></>,
    refresh: <><path d="M20 7v5h-5" /><path d="M4 17v-5h5" /><path d="M5.5 9A7 7 0 0 1 18 6l2 6M4 12l2 6a7 7 0 0 0 12.5-3" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  };
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export default function Home() {
  const [manualProduct, setManualProduct] = useState<(typeof products)[number]>(products[0]);
  const tryOnProductId = useSyncExternalStore(subscribeToTryOnQuery, getTryOnProductId, () => null);
  const queryProduct = products.find((item) => item.id === tryOnProductId);
  const selectedProduct = queryProduct ?? manualProduct;
  const [modalOpen, setModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [state, setState] = useState<TryOnState>("upload");
  const [consent, setConsent] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [comparison, setComparison] = useState(50);
  const [status, setStatus] = useState("Preparing your fitting room");
  const fileInput = useRef<HTMLInputElement>(null);
  const pageRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".scroll-reveal").forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 34 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 88%", once: true },
          },
        );
      });
      gsap.to(".feature-image img", {
        yPercent: 8,
        ease: "none",
        scrollTrigger: { trigger: ".feature-story", start: "top bottom", end: "bottom top", scrub: true },
      });
      gsap.utils.toArray<HTMLElement>(".product-image-parallax").forEach((image) => {
        gsap.to(image, {
          yPercent: window.matchMedia("(max-width: 900px)").matches ? 2 : 5,
          ease: "none",
          scrollTrigger: { trigger: image, start: "top bottom", end: "bottom top", scrub: true },
        });
      });
    }, pageRef);
    return () => context.revert();
  }, []);

  useEffect(() => {
    return () => {
      if (photoUrl.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  function choosePhoto(file?: File) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Your photo must be smaller than 10 MB.");
      return;
    }
    setError("");
    setPhoto(file);
    setPhotoUrl(URL.createObjectURL(file));
    setResultUrl("");
    setState("upload");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    choosePhoto(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    choosePhoto(event.dataTransfer.files[0]);
  }

  function removePhoto() {
    if (photoUrl.startsWith("blob:")) URL.revokeObjectURL(photoUrl);
    setPhoto(null);
    setPhotoUrl("");
    setResultUrl("");
    setState("upload");
    setConsent(false);
    setError("");
  }

  async function submitTryOn() {
    if (!photo || !consent) return;
    setState("processing");
    setStatus("Sending your photo securely");
    setError("");
    try {
      const body = new FormData();
      body.append("personImage", photo);
      body.append("productId", selectedProduct.id);
      body.append("category", selectedProduct.category);
      body.append("productColor", selectedProduct.color);
      const response = await fetch("/api/virtual-try-on", { method: "POST", body });
      let data = await readApiResult(response);
      for (let attempt = 0; data.status === "processing"; attempt += 1) {
        if (attempt >= 90) throw new Error("Your fitting is taking longer than expected. Please try again.");
        setStatus("Our AI is tailoring the look to you");
        await new Promise((resolve) => setTimeout(resolve, 2200));
        const poll = await fetch(`/api/virtual-try-on?jobId=${encodeURIComponent(data.jobId)}`, { cache: "no-store" });
        data = await readApiResult(poll);
      }
      setResultUrl(data.imageUrl);
      setState("result");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
      setState("error");
    }
  }

  async function readApiResult(response: Response): Promise<ApiResult> {
    const payload = await response.json() as { status?: string; jobId?: string; imageUrl?: string; error?: string };
    if (!response.ok) throw new Error(payload.error ?? "The fitting could not be completed.");
    if (payload.status === "processing" && typeof payload.jobId === "string") {
      return { status: "processing", jobId: payload.jobId };
    }
    if (payload.status === "completed" && typeof payload.imageUrl === "string") {
      return { status: "completed", imageUrl: payload.imageUrl };
    }
    throw new Error("The fitting service returned an unexpected response. Please try again.");
  }

  function resetForAnotherOutfit() {
    setResultUrl("");
    setState("upload");
    setError("");
    clearTryOnQuery();
    setModalOpen(false);
    window.setTimeout(() => document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  function clearTryOnQuery() {
    if (!queryProduct) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("tryOn");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  async function downloadResult() {
    try {
      const response = await fetch(resultUrl);
      if (!response.ok) throw new Error("The result is no longer available.");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "atelier-virtual-try-on.png";
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    } catch {
      setError("We couldn't download this image. Please try generating it again.");
    }
  }

  async function shareResult() {
    try {
      if (navigator.share) {
        const response = await fetch(resultUrl);
        if (!response.ok) throw new Error("The result is no longer available.");
        const image = new File([await response.blob()], "atelier-virtual-try-on.png", { type: "image/png" });
        if (navigator.canShare?.({ files: [image] })) {
          await navigator.share({ title: "My virtual try-on", files: [image] });
        } else {
          await navigator.share({ title: "My virtual try-on", text: "A look from The Atelier." });
        }
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setError("Page link copied. Generated images are private and are not included in the link.");
      }
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return;
      setError(cause instanceof Error ? cause.message : "The result could not be shared.");
    }
  }

  function closeModal() {
    clearTryOnQuery();
    setModalOpen(false);
  }

  return (
    <main ref={pageRef}>
      <div className="announcement">COMPLIMENTARY SHIPPING ON ORDERS OVER $250 <span>·</span> A CONSIDERED WARDROBE, ALWAYS</div>
      <header className="site-header">
        <button className="menu-button" aria-label="Open menu" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}><span /><span /></button>
        <a className="wordmark" href="#" aria-label="Atelier home">ATELIER<span>.</span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/men">MEN</Link><Link href="/women">WOMEN</Link><Link href="/kids">KIDS</Link><Link href="/accessories">ACCESSORIES</Link>
        </nav>
        <div className="header-actions"><a href="#collection">THE COLLECTION</a></div>
      </header>
      {mobileMenuOpen && <nav className="mobile-nav" aria-label="Mobile navigation"><Link href="/men" onClick={() => setMobileMenuOpen(false)}>MEN</Link><Link href="/women" onClick={() => setMobileMenuOpen(false)}>WOMEN</Link><Link href="/kids" onClick={() => setMobileMenuOpen(false)}>KIDS</Link><Link href="/accessories" onClick={() => setMobileMenuOpen(false)}>ACCESSORIES</Link></nav>}

      <FashionHero />

      <section className="intro-strip"><span>LESS, BUT BETTER</span><i /><p>Modern heirlooms for the way you live now.</p><i /><span>MADE TO BE WORN</span></section>

      <CategoryShowcase />

      <section className="collection-section" id="collection">
        <div className="section-heading scroll-reveal">
          <div>
            <p className="eyebrow">THE PIECES WE KEEP</p>
            <h2>
              <motion.span
                className="collection-heading-word"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.04, ease: "easeOut" }}
              >Meet </motion.span>
              <motion.span
                className="collection-heading-word"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.12, ease: "easeOut" }}
              >your </motion.span>
              <motion.span
                className="collection-heading-word"
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, delay: 0.2, ease: "easeOut" }}
              >new</motion.span>
              <br />
              <motion.i
                initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
                whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.28, ease: "easeOut" }}
              >old favorites.</motion.i>
            </h2>
          </div>
          <p className="section-aside">A thoughtful edit of everyday signatures,<br />cut to feel as good as they look.</p>
          <a href="#all-pieces" className="text-link">VIEW ALL PIECES <Icon name="arrow" size={15} /></a>
        </div>
        <div className="collection-grid" id="all-pieces">
          {products.map((item, index) => (
            <ProductEditorialCard
              key={item.id}
              product={item}
              index={index}
              label={index === 0 ? "THE SIGNATURE" : "NEW SEASON"}
              onTryOn={() => { setManualProduct(item); setModalOpen(true); setError(""); }}
            />
          ))}
        </div>
      </section>

      <section className="feature-story" id="story">
        <div className="feature-image">
          <Image src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1500&q=90" alt="An effortless look from the Atelier collection" fill unoptimized sizes="(max-width: 700px) 100vw, 55vw" />
          <span>THE ATELIER POINT OF VIEW · NO. 04</span>
        </div>
        <motion.div className="feature-copy scroll-reveal" initial={{ opacity: 0, x: 25 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.75 }}>
          <p className="eyebrow">A LITTLE MORE PERSONAL</p>
          <h2>Style is a feeling.<br /><i>Start with yours.</i></h2>
          <p>Good clothes should feel like they already know you. Find the shape, color, and pieces that feel right—then make them unmistakably your own.</p>
          <button className="story-tryon" onClick={() => { setManualProduct(products[0]); setModalOpen(true); setError(""); }}><Icon name="sparkle" size={17} /> TRY THE ATELIER JACKET ON YOU <Icon name="arrow" size={16} /></button>
          <span className="feature-footnote">A private AI preview. Your photo is never posted publicly.</span>
        </motion.div>
      </section>

      <section className="craft-section scroll-reveal">
        <p className="eyebrow">THE ART OF ENOUGH</p>
        <h2>Fewer things.<br /><i>More feeling.</i></h2>
        <p>We believe the best wardrobe isn’t the biggest one. It’s the one that makes getting dressed feel a little like coming home.</p>
        <a className="text-link" href="#collection">A NOTE ON HOW WE MAKE <Icon name="arrow" size={15} /></a>
        <span className="craft-mark">A.</span>
      </section>

      <section className="newsletter">
        <p className="eyebrow">A LETTER FROM THE ATELIER</p>
        <h2>Good things, occasionally.</h2>
        <p>New pieces, small stories, and notes on making them yours.</p>
        <a className="text-link" href="#story">READ THE JOURNAL <Icon name="arrow" size={15} /></a>
      </section>

      <footer className="site-footer">
        <div className="footer-top"><a className="wordmark" href="#">ATELIER<span>.</span></a><p>Designed with intention.<br /><i>Worn your way.</i></p><nav><a href="#collection">SHOP THE EDIT</a><a href="#story">OUR STORY</a><a href="#privacy">PRIVACY &amp; AI</a><details className="footer-privacy" id="privacy"><summary>HOW TRY-ON USES YOUR PHOTO</summary><p>Your photo is sent through our server to FASHN VTON 1.5 running in a temporary Colab runtime. The application does not save uploads to a database, though Colab may temporarily buffer files during processing.</p></details></nav></div>
        <div className="footer-bottom"><span>© ATELIER 2026</span><span>COMPLIMENTARY SHIPPING OVER $250</span><span>AI PREVIEWS GENERATED WITH FASHN VTON 1.5</span></div>
      </footer>

      {(modalOpen || Boolean(queryProduct)) && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className={`tryon-modal ${state === "result" ? "result-modal" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <button className="modal-close" onClick={closeModal} aria-label="Close try-on"><Icon name="close" /></button>
            <div className="modal-heading">
              <p className="eyebrow"><Icon name="sparkle" size={15} /> YOUR PRIVATE FITTING ROOM</p>
              <h2 id="modal-title">{state === "result" ? "A look, made yours." : "See it on you."}</h2>
              <p>{state === "result" ? `A little preview of ${selectedProduct.name}, styled your way.` : "A new perspective on a piece you love."}</p>
            </div>

            {state === "result" && resultUrl ? (
              <>
                <div className="comparison-wrap">
                  <div className="comparison-images">
                    <Image src={resultUrl} alt="AI-generated virtual try-on result" fill unoptimized sizes="(max-width: 700px) 100vw, 680px" />
                    <div className="comparison-before" style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }}>
                      <Image src={photoUrl} alt="Your original photograph" fill unoptimized sizes="(max-width: 700px) 100vw, 680px" />
                    </div>
                    <span className="compare-label before-label">BEFORE</span><span className="compare-label after-label">AFTER</span>
                    <div className="compare-divider" style={{ left: `${comparison}%` }}><span>↔</span></div>
                    <input className="compare-range" aria-label="Compare original and virtual try-on" type="range" min="0" max="100" value={comparison} onChange={(event) => setComparison(Number(event.target.value))} />
                  </div>
                </div>
                <div className="comparison-pair">
                  <div><span>YOUR PHOTO</span><Image src={photoUrl} alt="Your original photograph" fill unoptimized sizes="160px" /></div>
                  <div><span>AI PREVIEW</span><Image src={resultUrl} alt="Your generated virtual try-on" fill unoptimized sizes="160px" /></div>
                </div>
                <p className="preview-disclaimer">A visual preview, not a guarantee of garment fit or size accuracy.</p>
                <div className="result-actions">
                  <button className="download-button" onClick={downloadResult}><Icon name="download" size={17} /> DOWNLOAD IMAGE</button>
                  <button className="share-button" onClick={shareResult}><Icon name="share" size={17} /> SHARE</button>
                </div>
                <div className="result-secondary">
                  <button onClick={resetForAnotherOutfit}><Icon name="refresh" size={16} /> TRY ANOTHER OUTFIT</button>
                  <button onClick={removePhoto}>UPLOAD ANOTHER PHOTO</button>
                  <button onClick={removePhoto}><Icon name="trash" size={15} /> DELETE MY IMAGES</button>
                </div>
              </>
            ) : (
              <>
                <div className="selected-product">
                  <Image src={selectedProduct.image} alt={selectedProduct.name} width={66} height={78} unoptimized />
                  <div><span>YOUR SELECTED PIECE</span><strong>{selectedProduct.name}</strong><small>{selectedProduct.color} · {selectedProduct.garmentType}</small></div>
                  <Icon name="check" size={17} />
                </div>
                {photoUrl ? (
                  <div className="photo-preview">
                    <Image src={photoUrl} alt="Preview of your uploaded photo" fill unoptimized sizes="(max-width: 700px) 90vw, 500px" />
                    <div className="preview-overlay"><span>YOUR PHOTO</span><button onClick={() => fileInput.current?.click()} aria-label="Replace photo"><Icon name="refresh" size={16} /> REPLACE</button><button onClick={removePhoto} aria-label="Remove photo"><Icon name="trash" size={16} /></button></div>
                  </div>
                ) : (
                  <div className={`upload-zone ${dragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
                    <div className="upload-icon"><Icon name="upload" size={22} /></div>
                    <strong>Drop your photo here</strong>
                    <span>or</span>
                    <button className="choose-photo" onClick={() => fileInput.current?.click()}>CHOOSE A PHOTO</button>
                    <small>JPG, PNG or WebP · Up to 10 MB</small>
                  </div>
                )}
                <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} hidden />
                <div className="photo-guidance"><span>✳</span><p><strong>For the best results, upload a clear, front-facing, full-body photograph with good lighting.</strong><br />Stand naturally against a simple background for the most realistic preview.</p></div>
                <label className="consent-row"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>I agree to send my photo through our server to FASHN VTON 1.5 running in Colab. The photo is used to generate a preview and may be temporarily buffered in the Colab runtime. It is never posted publicly. <a href="#privacy">Privacy details</a></span></label>
                <details className="privacy-details" id="privacy-modal"><summary>How your photo is used</summary><p>Your photo is sent through our server to the FASHN VTON 1.5 service running in a temporary Colab runtime. The application does not save uploaded photos or generated previews to a database. Colab may temporarily buffer request files while processing. Deleting here clears the browser preview; it cannot clear data already temporarily buffered by the runtime.</p></details>
                {error && <p className="tryon-error" role="alert">{error}</p>}
                {state === "processing" ? (
                  <div className="processing-state"><div className="processing-orbit"><Icon name="sparkle" size={22} /></div><strong>{status}</strong><span>This usually takes under a minute. Please keep this window open.</span><div className="progress-track"><i /></div></div>
                ) : (
                  <button className="generate-button" disabled={!photo || !consent} onClick={submitTryOn}><Icon name="sparkle" size={18} /> GENERATE MY PREVIEW <Icon name="arrow" size={18} /></button>
                )}
                {state === "error" && <button className="retry-button" onClick={submitTryOn}>TRY AGAIN</button>}
                <div className="privacy-footnote"><Icon name="lock" size={14} /> Delete clears the browser preview. Colab may temporarily buffer request files during processing.</div>
              </>
            )}
            <p className="modal-bottom-note">AI styling preview only. Results may vary and do not represent actual fit or sizing.</p>
          </section>
        </div>
      )}
    </main>
  );
}
