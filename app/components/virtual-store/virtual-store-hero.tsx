"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useRef, useState, type PointerEvent } from "react";
import { storePoster } from "../../catalog";
import HeroSection from "./hero-section";
import IntroAnimation from "./intro-animation";
import ScrollController from "./scroll-controller";
import { initialCamera, type CameraMotion } from "./store-layout";

const StoreScene = dynamic(() => import("./store-scene"), {
  ssr: false,
  loading: () => null,
});

const chapters = [
  "STORE INTRODUCTION",
  "ENTER THE BOUTIQUE",
  "THE CENTRAL EDIT",
  "DEEPER INSIDE",
  "THE COLLECTION",
];

export default function VirtualStoreHero() {
  const stage = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const parallax = useRef({ x: 0, y: 0 });
  const motion = useRef<CameraMotion>({ ...initialCamera });
  const [chapter, setChapter] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const handleChapter = useCallback((next: number) => setChapter(next), []);
  const handleReady = useCallback(() => setSceneReady(true), []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    parallax.current.x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 2;
    parallax.current.y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -2;
  }

  function handlePointerLeave() {
    parallax.current.x = 0;
    parallax.current.y = 0;
  }

  return (
    <section className="virtual-store-stage" ref={stage} aria-label="Scroll to walk through the Atelier boutique">
      <h1 className="sr-only">Atelier boutique</h1>
      <div className="virtual-store-sticky">
        <div className={`store-poster ${sceneReady ? "is-hidden" : ""}`}>
          <Image className="store-fallback-image" src={storePoster} alt="" fill priority sizes="100vw" />
        </div>
        <div
          className="store-canvas-interaction"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
        >
          <StoreScene motion={motion} parallax={parallax} onReady={handleReady} />
        </div>
        <div className="store-vignette" />
        <div className="store-reveal-veil" />
        <IntroAnimation />
        <HeroSection />
        <div className="store-progress" aria-hidden="true"><span className="store-progress-fill" /></div>
        <div className="store-journey-ui">
          <span>{chapters[chapter]}</span>
          <p className="store-scroll-cue"><i />{chapter === 4 ? "SCROLL FOR THE COLLECTION" : "SCROLL TO WALK THROUGH"}</p>
        </div>
      </div>
      <ScrollController stage={stage} motion={motion} progress={progress} onChapter={handleChapter} />
    </section>
  );
}
