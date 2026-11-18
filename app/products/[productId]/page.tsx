import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products } from "../../catalog";
import ProductDetail from "./product-detail";

type Props = {
  params: Promise<{ productId: string }>;
};

export function generateStaticParams() {
  return products.map(({ id }) => ({ productId: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { productId } = await params;
  const product = products.find((item) => item.id === productId);
  if (!product) return { title: "Piece not found — ATELIER." };
  return {
    title: `${product.name} — ATELIER.`,
    description: `Explore ${product.name} in ${product.color}. See the editorial, browse the gallery, and preview it with a private AI try-on.`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { productId } = await params;
  const product = products.find((item) => item.id === productId);
  if (!product) notFound();

  return <ProductDetail product={product} />;
}
