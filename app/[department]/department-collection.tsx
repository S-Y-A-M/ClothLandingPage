import Image from "next/image";
import Link from "next/link";
import { departments, products } from "../catalog";

type Department = (typeof departments)[number];
type Product = (typeof products)[number];

export default function DepartmentCollection({ department, products: arrivals }: { department: Department; products: Product[] }) {
  return (
    <main className="department-page">
      <div className="announcement">A CONSIDERED WARDROBE, ALWAYS</div>
      <header className="site-header">
        <Link className="wordmark" href="/" aria-label="Atelier home">ATELIER<span>.</span></Link>
        <nav className="main-nav" aria-label="Department navigation">
          {departments.map((item) => <Link className={item.id === department.id ? "is-current" : ""} href={item.href} key={item.id}>{item.name}</Link>)}
        </nav>
        <Link className="detail-journal" href="/">THE ATELIER WORLD</Link>
      </header>
      <nav className="department-mobile-nav" aria-label="Department navigation">
        {departments.map((item) => <Link className={item.id === department.id ? "is-current" : ""} href={item.href} key={item.id}>{item.name}</Link>)}
      </nav>

      <section className="department-hero">
        <Image src={department.image} alt={`${department.name.toLowerCase()} collection campaign`} fill priority unoptimized sizes="100vw" />
        <span className="department-hero-shade" />
        <div className="department-hero-copy">
          <p>THE ATELIER EDIT · {department.number}</p>
          <h1>{department.name.toLowerCase()}<br /><i>with intention.</i></h1>
          <span>{department.description}</span>
          <a href="#arrivals">DISCOVER THE COLLECTION <b>↓</b></a>
        </div>
        <span className="department-hero-side">A STUDY IN<br />EVERYDAY ELEGANCE</span>
      </section>

      <section className="department-arrivals" id="arrivals">
        <div className="department-heading">
          <div><p className="eyebrow">THE PIECES WE KEEP</p><h2>New to<br /><i>the edit.</i></h2></div>
          <p>Considered silhouettes, thoughtful details, and pieces to live in for a long time.</p>
        </div>
        {arrivals.length > 0 ? (
          <div className="department-product-grid">
            {arrivals.map((product, index) => (
              <article className="department-product-card" key={product.id}>
                <Link className="department-product-image" href={`/products/${product.id}`} aria-label={`Discover ${product.name}`}>
                  <Image src={product.image} alt={`${product.name} in ${product.color}`} fill unoptimized sizes="(max-width: 680px) 90vw, 33vw" />
                  <span>{index === 0 ? "THE ATELIER SIGNATURE" : "NEW SEASON"}</span>
                  <b>DISCOVER PIECE ↗</b>
                </Link>
                <div><span>{product.department.toUpperCase()} · {product.garmentType.toUpperCase()}</span><strong>{product.name}</strong><small>{product.color} <i /> {product.price}</small></div>
              </article>
            ))}
          </div>
        ) : (
          <div className="department-empty-state">
            <p>THE ATELIER ACCESSORIES EDIT</p>
            <h2>Small details.<br /><i>Considered carefully.</i></h2>
            <span>Our first accessories pieces are being curated. Explore the other Atelier edits in the meantime.</span>
            <Link href="/">RETURN TO THE ATELIER <b>↗</b></Link>
          </div>
        )}
        <div className="department-return">
          <span>CURATED WITH CARE, WORN YOUR WAY.</span>
          <Link href="/">RETURN TO THE ATELIER <b>↗</b></Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="footer-top"><Link className="wordmark" href="/">ATELIER<span>.</span></Link><p>Designed with intention.<br /><i>Worn your way.</i></p><nav>{departments.map((item) => <Link href={item.href} key={item.id}>{item.name}</Link>)}<Link href="/#story">OUR STORY</Link></nav></div>
        <div className="footer-bottom"><span>© ATELIER 2026</span><span>AI PREVIEWS PROCESSED PRIVATELY BY FASHN</span></div>
      </footer>
    </main>
  );
}
