"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { departments } from "../catalog";

const imageVariants: Variants = {
  rest: { scale: 1, x: 0 },
  hover: {
    scale: 1.06,
    x: 5,
    transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
  },
};

const overlayVariants: Variants = {
  rest: { opacity: 0.55 },
  hover: { opacity: 1, transition: { duration: 0.65, ease: "easeOut" } },
};

const numberVariants: Variants = {
  rest: { x: 0, opacity: 0.72 },
  hover: { x: 5, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

const numberRuleVariants: Variants = {
  rest: { scaleX: 1 },
  hover: { scaleX: 1.45, transition: { duration: 0.45, ease: "easeOut" } },
};

const titleVariants: Variants = {
  rest: { y: 0 },
  hover: { y: -7, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const revealVariants: Variants = {
  rest: { y: 12, opacity: 0 },
  hover: { y: 0, opacity: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

const arrowVariants: Variants = {
  rest: { x: 0 },
  hover: { x: 6, transition: { duration: 0.35, ease: "easeOut" } },
};

const MotionLink = motion.create(Link);

function moveImageWithPointer(event: ReactPointerEvent<HTMLAnchorElement>, reducedMotion: boolean) {
  if (reducedMotion || event.pointerType !== "mouse") return;
  const bounds = event.currentTarget.getBoundingClientRect();
  const image = event.currentTarget.querySelector<HTMLElement>(".category-showcase__pointer-image");
  if (!image) return;

  image.style.setProperty("--pointer-x", ((event.clientX - bounds.left) / bounds.width - 0.5).toFixed(3));
  image.style.setProperty("--pointer-y", ((event.clientY - bounds.top) / bounds.height - 0.5).toFixed(3));
}

function resetImagePosition(event: ReactPointerEvent<HTMLAnchorElement>) {
  const image = event.currentTarget.querySelector<HTMLElement>(".category-showcase__pointer-image");
  image?.style.removeProperty("--pointer-x");
  image?.style.removeProperty("--pointer-y");
}

export default function CategoryShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.to(".category-showcase__parallax", {
        yPercent: 5,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }, sectionRef);

    return () => context.revert();
  }, [prefersReducedMotion]);

  return (
    <section
      className="category-showcase"
      id="category-edits"
      ref={sectionRef}
      aria-labelledby="category-title"
    >
      <motion.header
        className="category-showcase__heading"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
        whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <p className="category-showcase__subtitle">EXPLORE OUR WORLD OF FASHION</p>
        <h2 id="category-title">A WARDROBE FOR ALL OF US</h2>
        <motion.span
          className="category-showcase__divider"
          initial={prefersReducedMotion ? false : { scaleX: 0 }}
          whileInView={prefersReducedMotion ? undefined : { scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          aria-hidden="true"
        />
      </motion.header>

      <div className="category-showcase__grid">
        {departments.map((category, index) => {
          const isActive = !prefersReducedMotion && activeCategory === category.id;
          const activeVariant = isActive ? "hover" : "rest";

          return (
            <MotionLink
              className="category-showcase__card"
              href={category.href}
              key={category.id}
              aria-label={`${category.number} ${category.name}: ${category.description} Explore collection`}
              onHoverStart={() => setActiveCategory(category.id)}
              onHoverEnd={() => setActiveCategory(null)}
              onFocus={() => setActiveCategory(category.id)}
              onBlur={() => setActiveCategory(null)}
              onPointerMove={(event) => moveImageWithPointer(event, prefersReducedMotion)}
              onPointerLeave={resetImagePosition}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 34 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{ duration: 0.85, delay: index * 0.12, ease: "easeOut" }}
            >
              <motion.span
                className="category-showcase__image-frame"
                variants={imageVariants}
                animate={activeVariant}
                aria-hidden="true"
              >
                <span className="category-showcase__parallax">
                  <span className="category-showcase__pointer-image">
                    <Image
                      src={category.image}
                      alt=""
                      fill
                      sizes="(max-width: 680px) 50vw, (max-width: 1000px) 50vw, 25vw"
                      className="category-showcase__image"
                    />
                  </span>
                </span>
              </motion.span>
              <motion.span
                className="category-showcase__overlay"
                variants={overlayVariants}
                animate={activeVariant}
                aria-hidden="true"
              />
              <span className="category-showcase__copy">
                <motion.span className="category-showcase__number" variants={numberVariants} animate={activeVariant}>
                  <span>{category.number}</span>
                  <motion.span
                    className="category-showcase__number-rule"
                    variants={numberRuleVariants}
                    animate={activeVariant}
                    aria-hidden="true"
                  />
                </motion.span>
                <motion.span className="category-showcase__name" variants={titleVariants} animate={activeVariant}>{category.name}</motion.span>
                <motion.span className="category-showcase__description" variants={revealVariants} animate={activeVariant}>{category.description}</motion.span>
                <motion.span className="category-showcase__link" variants={revealVariants} animate={activeVariant}>
                  <span>EXPLORE COLLECTION</span>
                  <motion.svg
                    aria-hidden="true"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={arrowVariants}
                    animate={activeVariant}
                  >
                    <path d="M4 12h15" />
                    <path d="m13 6 6 6-6 6" />
                  </motion.svg>
                </motion.span>
              </span>
            </MotionLink>
          );
        })}
      </div>
    </section>
  );
}
