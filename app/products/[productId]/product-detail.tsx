"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { fashionFilm, type Product } from "../../catalog";

export default function ProductDetail({ product }: { product: Product }) {
  const [activeImage, setActiveImage] = useState(0);
  const [showFilm, setShowFilm] = useState(false);

  function chooseImage(index: number) {
    setActiveImage(index);
    setShowFilm(false);
  }

  return (
    <main className="product-detail-page">
      <div className="announcement">COMPLIMENTARY SHIPPING ON ORDERS OVER $250</div>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Atelier home">ATELIER<span>.</span></Link>
        <nav className="main-nav" aria-label="Main navigation">
          <Link href="/#collection">NEW ARRIVALS</Link>
          <Link href="/#collection">READY TO WEAR</Link>
          <Link href="/#story">OUR WORLD</Link>
        </nav>
        <Link className="detail-journal" href="/#story">THE JOURNAL</Link>
      </header>

      <div className="detail-breadcrumb"><Link href="/">ATELIER</Link><span>/</span><Link href="/#collection">THE COLLECTION</Link><span>/</span>{product.name.toUpperCase()}</div>
      <section className="product-detail-layout">
        <motion.div className="product-detail-media" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }}>
          <div className="detail-image">
            {showFilm ? (
              <video controls muted loop playsInline poster={product.image} aria-label={`Editorial film for ${product.name}`}>
                <source src={fashionFilm} type="video/mp4" />
              </video>
            ) : (
              <Image src={product.gallery[activeImage]} alt={`${product.name}, gallery view ${activeImage + 1}`} fill priority unoptimized sizes="(max-width: 700px) 100vw, 58vw" />
            )}
            <span className="product-image-count">{showFilm ? "THE ATELIER FILM" : `0${activeImage + 1} / 0${product.gallery.length}`}</span>
          </div>
          <div className="detail-media-controls">
            {product.gallery.map((image, index) => (
              <button className={`detail-thumb ${!showFilm && activeImage === index ? "active" : ""}`} key={`${product.id}-${index}`} onClick={() => chooseImage(index)} aria-label={`View image ${index + 1} of ${product.name}`}>
                <Image src={image} alt="" fill unoptimized sizes="80px" />
              </button>
            ))}
            <button className={`film-toggle ${showFilm ? "active" : ""}`} onClick={() => setShowFilm(!showFilm)} aria-pressed={showFilm}>VIEW FILM <span>▶</span></button>
          </div>
          <p className="detail-gallery-caption">A CLOSER LOOK AT THE PIECE · {product.color.toUpperCase()}</p>
        </motion.div>

        <motion.div className="detail-copy product-detail-copy" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          <p className="eyebrow">THE NEW TAILORING</p>
          <h1>{product.name}</h1>
          <p className="product-subtitle">An exercise in beautiful restraint.</p>
          <strong className="detail-price">{product.price}</strong>
          <div className="product-rule" />
          <div className="option-label"><span>COLOR</span><strong>{product.color}</strong></div>
          <div className="swatches"><span aria-label={`${product.color} selected`} className={`swatch ${product.color === "Oat" ? "stone" : product.color === "Sky" ? "sky" : "terracotta"} selected`} /></div>
          <div className="product-rule size-rule" />
          <div className="option-label"><span>THE ATELIER EDIT</span><span>{product.garmentType.toUpperCase()}</span></div>
          <p className="product-detail-description">A considered silhouette, thoughtfully made for a life in motion. Wear it your way, and come back to it often. Designed with ease, finished with intention.</p>
          <Link className="try-on-cta detail-tryon" href={`/?tryOn=${encodeURIComponent(product.id)}`}><span>✦</span> TRY THIS OUTFIT ON YOURSELF <span>↗</span></Link>
          <p className="detail-privacy">Your own private fitting room. Your photo is never posted publicly.</p>
          <div className="product-detail-foot"><span>COMPLIMENTARY SHIPPING</span><span>VISUAL PREVIEW, NOT A FIT GUARANTEE</span></div>
          <Link className="back-to-edit" href="/#collection">← BACK TO THE EDIT</Link>
        </motion.div>
      </section>

      <section className="product-detail-story">
        <p>MADE TO MOVE WITH YOU</p>
        <h2>Considered in every detail.<br /><i>Effortless in every moment.</i></h2>
        <Link href="/#collection">DISCOVER THE COLLECTION <span>↗</span></Link>
      </section>
      <footer className="site-footer">
        <div className="footer-top"><Link className="wordmark" href="/">ATELIER<span>.</span></Link><p>Designed with intention.<br /><i>Worn your way.</i></p><nav><Link href="/#collection">THE COLLECTION</Link><Link href="/#story">OUR STORY</Link><Link href="/#privacy">PRIVACY &amp; AI</Link></nav></div>
        <div className="footer-bottom"><span>© ATELIER 2026</span><span>AI PREVIEWS GENERATED WITH FASHN VTON 1.5</span></div>
      </footer>
    </main>
  );
}
