"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState, type PointerEvent as ReactPointerEvent } from "react";
import type { Product } from "../catalog";

type Props = {
  product: Product;
  index: number;
  label: string;
  onTryOn: () => void;
};

function setPointerPosition(event: ReactPointerEvent<HTMLAnchorElement>, reducedMotion: boolean | null) {
  if (reducedMotion || event.pointerType !== "mouse") return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const image = event.currentTarget.querySelector<HTMLElement>(".product-image-pan");
  if (!image) return;

  image.style.setProperty("--pointer-x", ((event.clientX - bounds.left) / bounds.width - 0.5).toFixed(3));
  image.style.setProperty("--pointer-y", ((event.clientY - bounds.top) / bounds.height - 0.5).toFixed(3));
}

function clearPointerPosition(event: ReactPointerEvent<HTMLAnchorElement>) {
  const image = event.currentTarget.querySelector<HTMLElement>(".product-image-pan");
  image?.style.removeProperty("--pointer-x");
  image?.style.removeProperty("--pointer-y");
}

function ArrowIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12h15" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export default function ProductEditorialCard({ product, index, label, onTryOn }: Props) {
  const prefersReducedMotion = useReducedMotion();
  const [isActive, setIsActive] = useState(false);
  const layoutClass = index === 0 ? "collection-card--featured" : index === 3 ? "collection-card--wide" : "collection-card--support";
  const imageSizes = index === 0 || index === 3
    ? "(max-width: 680px) 90vw, (max-width: 900px) 90vw, 66vw"
    : "(max-width: 680px) 90vw, (max-width: 900px) 43vw, 32vw";

  return (
    <motion.article
      className={`collection-card ${layoutClass} card-${index + 1}`}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 30 }}
      whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{ duration: 0.65, delay: index * 0.13, ease: "easeOut" }}
      whileHover={prefersReducedMotion ? undefined : { y: -5 }}
    >
      <Link
        className="product-card-image"
        href={`/products/${product.id}`}
        aria-label={`View ${product.name}`}
        onMouseEnter={() => setIsActive(true)}
        onMouseLeave={() => setIsActive(false)}
        onFocus={() => setIsActive(true)}
        onBlur={() => setIsActive(false)}
        onPointerMove={(event) => setPointerPosition(event, prefersReducedMotion)}
        onPointerLeave={clearPointerPosition}
      >
        <span className="product-image-parallax" aria-hidden="true">
          <span className="product-image-pan">
            <motion.span
              className="product-image-layer"
              animate={{
                scale: isActive && !prefersReducedMotion ? 1.06 : 1,
                opacity: isActive && !prefersReducedMotion ? 0 : 1,
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={product.image}
                alt=""
                fill
                sizes={imageSizes}
              />
            </motion.span>
            <motion.span
              className="product-image-layer product-image-layer--alternate"
              animate={{
                scale: isActive && !prefersReducedMotion ? 1.06 : 1,
                opacity: isActive && !prefersReducedMotion ? 1 : 0,
              }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Image
                src={product.gallery[1]}
                alt=""
                fill
                sizes={imageSizes}
              />
            </motion.span>
          </span>
        </span>
        <span className="product-tag">{label}</span>
        <motion.span
          className="product-image-shade"
          animate={{ opacity: isActive && !prefersReducedMotion ? 1 : 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          aria-hidden="true"
        />
        <motion.span
          className="product-image-copy"
          animate={{
            opacity: isActive && !prefersReducedMotion ? 1 : 0,
            y: isActive && !prefersReducedMotion ? 0 : 12,
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <span className="product-image-copy__label">{label}</span>
          <strong>{product.name}</strong>
          <motion.span
            className="product-image-copy__rule"
            animate={{ width: isActive && !prefersReducedMotion ? 42 : 22 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            aria-hidden="true"
          />
          <span className="product-image-explore">
            EXPLORE PIECE
            <motion.span
              animate={{ x: isActive && !prefersReducedMotion ? 5 : 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <ArrowIcon />
            </motion.span>
          </span>
        </motion.span>
      </Link>

      <div className="product-card-meta">
        <div>
          <span className="product-meta-label">{label}</span>
          <h3>{product.name}</h3>
          <span>{product.color} · {product.garmentType}</span>
          <Link className="product-meta-explore" href={`/products/${product.id}`}>
            EXPLORE PIECE <ArrowIcon />
          </Link>
        </div>
        <strong>{product.price}</strong>
      </div>
      <button className="card-tryon" onClick={onTryOn}>
        TRY ON WITH AI <ArrowIcon />
      </button>
    </motion.article>
  );
}
