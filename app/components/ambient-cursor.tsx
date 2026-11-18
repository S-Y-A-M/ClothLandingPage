"use client";

import { useEffect, useRef } from "react";

export default function AmbientCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLSpanElement>(null);
  const ringRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const pointerQuery = window.matchMedia("(pointer: fine) and (min-width: 681px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cursorNode = cursorRef.current;
    const dotNode = dotRef.current;
    const ringNode = ringRef.current;
    const labelNode = labelRef.current;
    if (!cursorNode || !dotNode || !ringNode || !labelNode) return;
    const cursor = cursorNode!;
    const dot = dotNode!;
    const ring = ringNode!;
    const label = labelNode!;

    let enabled = false;
    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let ringX = 0;
    let ringY = 0;

    function animateRing() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;

      if (Math.abs(targetX - ringX) > 0.2 || Math.abs(targetY - ringY) > 0.2) {
        frame = window.requestAnimationFrame(animateRing);
      } else {
        ring.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
        frame = 0;
      }
    }

    function handlePointerMove(event: PointerEvent) {
      targetX = event.clientX;
      targetY = event.clientY;
      dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      cursor.classList.add("is-visible");
      if (!frame) frame = window.requestAnimationFrame(animateRing);
    }

    function handlePointerOver(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const interactive = target.closest<HTMLElement>(
        "a, button, [role='button'], summary, input, textarea, select, [contenteditable='true']",
      );
      if (!interactive) return;

      ring.classList.add("is-interactive");
      if (interactive.classList.contains("category-showcase__card")) {
        ring.classList.add("is-category");
        ring.classList.remove("is-product");
        label.textContent = "EXPLORE";
      } else if (interactive.classList.contains("product-card-image")) {
        ring.classList.remove("is-category");
        ring.classList.add("is-product");
        label.textContent = "VIEW";
      } else {
        ring.classList.remove("is-category", "is-product");
        label.textContent = "";
      }
    }

    function handlePointerOut(event: PointerEvent) {
      const target = event.target;
      const nextTarget = event.relatedTarget;
      if (!(target instanceof Element)) return;
      const interactive = target.closest("a, button, [role='button'], summary, input, textarea, select, [contenteditable='true']");
      if (interactive && nextTarget instanceof Node && interactive.contains(nextTarget)) return;
      if (!nextTarget) cursor.classList.remove("is-visible");
      ring.classList.remove("is-interactive", "is-category", "is-product");
      label.textContent = "";
    }

    function handleMediaChange() {
      const shouldEnable = pointerQuery.matches && !motionQuery.matches;
      if (shouldEnable === enabled) return;

      if (shouldEnable) {
        enabled = true;
        document.body.classList.add("has-ambient-cursor");
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        document.addEventListener("pointerover", handlePointerOver);
        document.addEventListener("pointerout", handlePointerOut);
      } else {
        enabled = false;
        document.body.classList.remove("has-ambient-cursor");
        window.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerover", handlePointerOver);
        document.removeEventListener("pointerout", handlePointerOut);
        window.cancelAnimationFrame(frame);
        frame = 0;
        cursor.classList.remove("is-visible");
        ring.classList.remove("is-interactive", "is-category", "is-product");
      }
    }

    pointerQuery.addEventListener("change", handleMediaChange);
    motionQuery.addEventListener("change", handleMediaChange);
    window.addEventListener("resize", handleMediaChange, { passive: true });
    handleMediaChange();

    return () => {
      pointerQuery.removeEventListener("change", handleMediaChange);
      motionQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("resize", handleMediaChange);
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerover", handlePointerOver);
      document.removeEventListener("pointerout", handlePointerOut);
      window.cancelAnimationFrame(frame);
      document.body.classList.remove("has-ambient-cursor");
    };
  }, []);

  return (
    <div className="ambient-cursor" ref={cursorRef} aria-hidden="true">
      <span className="ambient-cursor__dot" ref={dotRef} />
      <span className="ambient-cursor__ring" ref={ringRef}>
        <span ref={labelRef} />
      </span>
    </div>
  );
}
