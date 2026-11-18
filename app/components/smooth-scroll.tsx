"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

export default function SmoothScroll() {
  useEffect(() => {
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    gsap.registerPlugin(ScrollTrigger);
    let lenis: Lenis | undefined;
    const updateScroll = (time: number) => lenis?.raf(time * 1000);
    const updateScrollTrigger = () => ScrollTrigger.update();

    function syncMotionPreference() {
      if (motionQuery.matches && lenis) {
        lenis.off("scroll", updateScrollTrigger);
        gsap.ticker.remove(updateScroll);
        lenis.destroy();
        lenis = undefined;
      } else if (!motionQuery.matches && !lenis) {
        lenis = new Lenis({ autoRaf: false, anchors: true });
        lenis.on("scroll", updateScrollTrigger);
        gsap.ticker.add(updateScroll);
      }
    }

    motionQuery.addEventListener("change", syncMotionPreference);
    syncMotionPreference();

    return () => {
      motionQuery.removeEventListener("change", syncMotionPreference);
      if (!lenis) return;
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(updateScroll);
      lenis.destroy();
    };
  }, []);

  return null;
}
