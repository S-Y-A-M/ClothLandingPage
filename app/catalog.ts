export const products = [
  {
    id: "atelier-oversized-blazer",
    name: "The Atelier Jacket",
    color: "Terracotta",
    category: "tops",
    garmentType: "Jacket",
    department: "men",
    price: "$428",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1400&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=88",
    ],
  },
  {
    id: "atelier-soft-structure",
    name: "Soft Structure Jacket",
    color: "Oat",
    category: "tops",
    garmentType: "Jacket",
    department: "men",
    price: "$365",
    image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1400&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1400&q=88",
    ],
  },
  {
    id: "atelier-modern-layer",
    name: "The Daylight Dress",
    color: "Sky",
    category: "one-pieces",
    garmentType: "Dress",
    department: "women",
    price: "$390",
    image: "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1400&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1591369822096-ffd140ec948f?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1400&q=88",
    ],
  },
  {
    id: "atelier-little-days",
    name: "The Little Days Set",
    color: "Sage",
    category: "tops",
    garmentType: "Kidswear",
    department: "kids",
    price: "$165",
    image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=1400&q=88",
    gallery: [
      "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1400&q=88",
      "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&w=1400&q=88",
    ],
  },
] as const;

export type Product = (typeof products)[number];

export const fashionFilm =
  "https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4";

const heroWomenVideo =
  process.env.NEXT_PUBLIC_HERO_WOMEN_VIDEO_URL ??
  "https://videos.pexels.com/video-files/9509328/9509328-uhd_2732_1440_25fps.mp4";
const heroMenVideo =
  process.env.NEXT_PUBLIC_HERO_MEN_VIDEO_URL ??
  "https://videos.pexels.com/video-files/3206297/3206297-hd_1920_1080_25fps.mp4";

export const heroPoster =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=2400&q=85";

export const storePoster =
  "/Vibrant Modern Clothing Store Interior.png";

export const heroVideoClips = [
  { sources: [{ src: heroWomenVideo, type: "video/mp4" }] },
  { sources: [{ src: heroMenVideo, type: "video/mp4" }] },
] as const;

export const categoryEdits = [
  {
    name: "MEN",
    href: "/men",
    caption: "A quieter kind of confidence.",
    image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=88",
    className: "category-men",
  },
  {
    name: "WOMEN",
    href: "/women",
    caption: "Considered pieces for every day.",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1200&q=88",
    className: "category-women",
  },
  {
    name: "KIDS",
    href: "/kids",
    caption: "Little things, made to last.",
    image: "https://images.unsplash.com/photo-1503919005314-30d93d07d823?auto=format&fit=crop&w=1200&q=88",
    className: "category-kids",
  },
] as const;

export const departments = [
  {
    id: "men",
    number: "01",
    name: "MEN",
    description: "Modern layers, made for the everyday.",
    image: categoryEdits[0].image,
    href: "/men",
  },
  {
    id: "women",
    number: "02",
    name: "WOMEN",
    description: "Expressive silhouettes, effortlessly yours.",
    image: categoryEdits[1].image,
    href: "/women",
  },
  {
    id: "kids",
    number: "03",
    name: "KIDS",
    description: "Thoughtful little pieces for big days.",
    image: categoryEdits[2].image,
    href: "/kids",
  },
  {
    id: "accessories",
    number: "04",
    name: "ACCESSORIES",
    description: "The finishing touches, chosen with care.",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=88",
    href: "/accessories",
  },
] as const;
