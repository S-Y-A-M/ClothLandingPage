"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { categoryEdits, fashionFilm, heroPoster, heroVideoClips, products, storePoster } from "../catalog";

type VideoStory = {
  id: string;
  title: string;
  src: string;
  poster: string;
  className: string;
};

const videoStories: readonly VideoStory[] = [
  {
    id: "women",
    title: "The new season, in motion",
    src: heroVideoClips[0].sources[0].src,
    poster: heroPoster,
    className: "fashion-video-card--women",
  },
  {
    id: "men",
    title: "Modern layers",
    src: heroVideoClips[1].sources[0].src,
    poster: categoryEdits[0].image,
    className: "fashion-video-card--men",
  },
  {
    id: "fabric",
    title: "Texture and movement",
    src: fashionFilm,
    poster: products[0].image,
    className: "fashion-video-card--fabric",
  },
];

function subscribeToMotionPreference(onChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getReducedMotionPreference() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function FashionVideoCard({ story }: { story: VideoStory }) {
  const cardRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToMotionPreference,
    getReducedMotionPreference,
    () => false,
  );

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!isInView || prefersReducedMotion || videoUnavailable) {
      video.pause();
      return;
    }

    void video.play().catch(() => setVideoUnavailable(true));
  }, [isInView, prefersReducedMotion, videoUnavailable]);

  return (
    <figure
      ref={cardRef}
      className={`fashion-video-card ${story.className}${videoUnavailable ? " is-fallback" : ""}`}
      aria-label={story.title}
    >
      <Image
        className="fashion-video-poster"
        src={story.poster}
        alt=""
        fill
        priority={story.id === "women"}
        unoptimized={story.poster.startsWith("https://")}
        sizes="(max-width: 680px) 48vw, (max-width: 1000px) 29vw, 22vw"
      />
      <video
        ref={videoRef}
        className="fashion-video"
        autoPlay={isInView && !prefersReducedMotion && !videoUnavailable}
        muted
        loop
        playsInline
        preload={isInView ? "metadata" : "none"}
        poster={story.poster}
        aria-hidden="true"
        onError={() => setVideoUnavailable(true)}
      >
        <source src={story.src} type="video/mp4" />
      </video>
      <figcaption>{story.title}</figcaption>
    </figure>
  );
}

function VideoGallery() {
  return (
    <div className="fashion-video-gallery" aria-label="Atelier campaign films">
      {videoStories.map((story) => <FashionVideoCard key={story.id} story={story} />)}
    </div>
  );
}

function HeroContent() {
  return (
    <div className="fashion-hero__content">
      <p className="fashion-hero__eyebrow"><span /> THE ATELIER · NEW SEASON</p>
      <h1 id="fashion-hero-title">Style that<br /><i>speaks.</i></h1>
      <p className="fashion-hero__description">
        Discover everyday essentials, curated for your lifestyle.
      </p>
      <div className="fashion-hero__actions">
        <Link className="fashion-hero__shop" href="#collection">
          Shop collection <span aria-hidden="true">↗</span>
        </Link>
        <Link className="fashion-hero__explore" href="#category-edits">
          Explore the edit <span aria-hidden="true">↓</span>
        </Link>
      </div>
    </div>
  );
}

function HeroNavigation() {
  return (
    <nav className="fashion-hero__navigation" aria-label="Explore collections">
      {[
        { label: "MEN", href: "/men" },
        { label: "WOMEN", href: "/women" },
        { label: "KIDS", href: "/kids" },
        { label: "ACCESSORIES", href: "/accessories" },
      ].map((item, index) => (
        <Link href={item.href} key={item.label}>
          <span>0{index + 1}</span>{item.label}<i aria-hidden="true">↗</i>
        </Link>
      ))}
    </nav>
  );
}

export default function FashionHero() {
  const heroRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.fromTo(
        ".fashion-hero__content > *",
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power2.out" },
      );
      gsap.fromTo(
        ".fashion-video-card",
        { autoAlpha: 0, y: 24, scale: 0.98 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 1, stagger: 0.11, ease: "power2.out", delay: 0.2 },
      );
      gsap.to(".fashion-hero__backdrop img", {
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: true },
      });
    }, heroRef);

    return () => context.revert();
  }, []);

  return (
    <section className="fashion-hero" ref={heroRef} aria-labelledby="fashion-hero-title">
      <div className="fashion-hero__backdrop">
        <Image
          src={storePoster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="fashion-hero__image"
        />
      </div>
      <div className="fashion-hero__shade" />
      <div className="fashion-hero__topline" aria-hidden="true">
        <span>A. <i>ATELIER</i></span>
        <span>CONSIDERED STYLE, IN MOTION <b>—</b> 2026</span>
      </div>
      <HeroContent />
      <VideoGallery />
      <HeroNavigation />
      <span className="fashion-hero__index" aria-hidden="true">CAMPAIGN FILM <i>01 / 06</i></span>
    </section>
  );
}
