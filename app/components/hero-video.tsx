"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

export type HeroVideoSource = {
  src: string;
  type: string;
};

export type HeroVideoClip = {
  sources: readonly HeroVideoSource[];
};

type Props = {
  clips: readonly HeroVideoClip[];
  poster: string;
  label: string;
};

function subscribeToMotionPreference(onChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function HeroVideo({ clips, poster, label }: Props) {
  const [activeSlot, setActiveSlot] = useState(0);
  const [clipIndices, setClipIndices] = useState([0, clips.length > 1 ? 1 : 0]);
  const prefersReducedMotion = useSyncExternalStore(subscribeToMotionPreference, getReducedMotionPreference, () => false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const switching = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      videoRefs.current.forEach((video) => video?.pause());
      return;
    }
    void videoRefs.current[activeSlot]?.play().catch(() => undefined);
  }, [activeSlot, prefersReducedMotion]);

  const advance = useCallback(async (slot: number) => {
    const activeVideo = videoRefs.current[slot];
    if (!activeVideo || slot !== activeSlot || switching.current || clips.length < 2) return;

    const timeRemaining = activeVideo.duration - activeVideo.currentTime;
    if (!Number.isFinite(timeRemaining) || timeRemaining > 1.5) return;

    const incomingSlot = 1 - slot;
    const incomingVideo = videoRefs.current[incomingSlot];
    if (!incomingVideo) return;

    switching.current = true;
    incomingVideo.currentTime = 0;
    try {
      await incomingVideo.play();
      setActiveSlot(incomingSlot);
    } catch {
      switching.current = false;
    }
  }, [activeSlot, clips.length]);

  const handleTransitionEnd = useCallback((slot: number, propertyName: string) => {
    if (propertyName !== "opacity" || slot === activeSlot || !switching.current) return;

    const previousVideo = videoRefs.current[slot];
    previousVideo?.pause();
    if (previousVideo) previousVideo.currentTime = 0;

    const nextClipIndex = (clipIndices[activeSlot] + 1) % clips.length;
    setClipIndices((current) => current.map((index, currentSlot) => currentSlot === slot ? nextClipIndex : index));
    switching.current = false;
  }, [activeSlot, clipIndices, clips.length]);

  return (
    <div className="hero-video-stack" role="img" aria-label={label}>
      {[0, 1].map((slot) => {
        const clip = clips[clipIndices[slot]];
        return (
          <video
            key={`${slot}-${clipIndices[slot]}`}
            ref={(element) => { videoRefs.current[slot] = element; }}
            className={`hero-video-layer ${activeSlot === slot ? "is-active" : "is-inactive"}`}
            autoPlay={slot === activeSlot && !prefersReducedMotion}
            muted
            loop
            playsInline
            preload={prefersReducedMotion ? "none" : "metadata"}
            poster={poster}
            onTimeUpdate={() => { void advance(slot); }}
            onTransitionEnd={(event) => handleTransitionEnd(slot, event.propertyName)}
            aria-hidden="true"
          >
            {clip.sources.map((source) => (
              <source key={source.src} src={source.src} type={source.type} />
            ))}
          </video>
        );
      })}
    </div>
  );
}
