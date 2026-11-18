"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef } from "react";
import { applyCameraTimeline, chapterFromProgress } from "./camera-path";
import type { CameraMotion } from "./store-layout";

export default function ScrollController({
  stage,
  motion,
  progress,
  onChapter,
}: {
  stage: React.RefObject<HTMLElement | null>;
  motion: React.RefObject<CameraMotion>;
  progress: React.RefObject<number>;
  onChapter: (chapter: number) => void;
}) {
  const onChapterRef = useRef(onChapter);
  onChapterRef.current = onChapter;

  useLayoutEffect(() => {
    const section = stage.current;
    const cameraMotion = motion.current;
    if (!section || !cameraMotion) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let chapter = -1;
    const publish = (value: number) => {
      progress.current = value;
      const next = chapterFromProgress(value);
      if (next !== chapter) {
        chapter = next;
        onChapterRef.current(next);
      }
    };

    const context = gsap.context(() => {
      if (reduceMotion) {
        gsap.set(cameraMotion, { x: -0.03, y: 1.55, z: -0.38, lx: 0, ly: 1.5, lz: -2.52 });
        gsap.set(".store-intro-logo, .store-reveal-veil, .store-journey-ui", { autoAlpha: 0 });
        gsap.set(".store-finale", { autoAlpha: 1, y: 0 });
        gsap.set(".store-progress-fill", { scaleY: 0.62 });
        publish(0.62);
        return;
      }

      gsap.set(".store-intro-logo", { autoAlpha: 1 });
      gsap.set(".store-reveal-veil", { autoAlpha: 0.88 });
      gsap.set(".store-finale", { autoAlpha: 1, y: 0 });
      gsap.set(".store-progress-fill", { scaleY: 0, transformOrigin: "top center" });

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.75,
          onUpdate: (self) => {
            const value = self.progress;
            publish(value);
            const intro = 1 - gsap.utils.clamp(0, 1, (value - 0.035) / 0.12);
            gsap.set(".store-intro-logo", { autoAlpha: intro });
            gsap.set(".store-reveal-veil", { autoAlpha: Math.max(0, 0.88 * (1 - gsap.utils.clamp(0, 1, value / 0.18))) });
            const introHero = 1 - gsap.utils.clamp(0, 1, value / 0.14);
            const finale = Math.max(introHero, gsap.utils.clamp(0, 1, (value - 0.8) / 0.12));
            gsap.set(".store-finale", { autoAlpha: finale, y: 28 * (1 - finale) });
            gsap.set(".store-journey-ui", { autoAlpha: 1 - gsap.utils.clamp(0, 1, (value - 0.76) / 0.1) });
            gsap.set(".store-progress-fill", { scaleY: value });
          },
        },
      });
      applyCameraTimeline(timeline, cameraMotion);
    }, section);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => {
      window.clearTimeout(refresh);
      context.revert();
    };
  }, [motion, progress, stage]);

  return null;
}
