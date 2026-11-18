import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { departments, products } from "../catalog";
import DepartmentCollection from "./department-collection";

type Props = {
  params: Promise<{ department: string }>;
};

export function generateStaticParams() {
  return departments.map(({ id }) => ({ department: id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { department: id } = await params;
  const department = departments.find((item) => item.id === id);
  if (!department) return { title: "Collection not found — ATELIER." };
  return {
    title: `${department.name} — ATELIER.`,
    description: department.description,
  };
}

async function DepartmentContent({ params }: Props) {
  const { department: id } = await params;
  const department = departments.find((item) => item.id === id);
  if (!department) notFound();

  const arrivals = products.filter((product) => product.department === department.id);
  return <DepartmentCollection department={department} products={arrivals} />;
}

export default function DepartmentPage({ params }: Props) {
  return (
    <Suspense fallback={<p className="department-loading" aria-live="polite">Loading collection…</p>}>
      <DepartmentContent params={params} />
    </Suspense>
  );
}
