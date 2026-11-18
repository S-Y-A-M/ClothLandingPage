"use client";

import Image from "next/image";
import Link from "next/link";
import { departments, storePoster } from "../../catalog";

export default function HeroSection() {
  return (
    <div className="store-finale">
      <Image
        className="store-finale-image"
        src={storePoster}
        alt=""
        fill
        priority
        sizes="100vw"
      />
      <div className="store-finale-shade" />
      <div className="store-finale-copy store-hero-copy">
        <p className="store-hero-kicker">THE ATELIER · NEW SEASON</p>
        <h2>Make room<br /><i>for more color.</i></h2>
        <p className="store-hero-description">Explore expressive layers, considered silhouettes, and the pieces that make a wardrobe your own.</p>
        <div className="store-hero-actions">
          <a className="store-cta store-cta-primary" href="#collection">Explore the collection <span aria-hidden="true">→</span></a>
        </div>
        <nav className="store-department-row" aria-label="Departments">
          {departments.map((department, index) => (
            <Link key={department.id} href={department.href}>
              <span>0{index + 1}</span>{department.name}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
