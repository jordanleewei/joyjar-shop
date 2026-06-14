import React from "react";
import { PrismaClient } from "@prisma/client";
import { ProductClient } from "./ProductClient";
import { notFound } from "next/navigation";

const prisma = new PrismaClient();

export const revalidate = 3600; // Cache for 1 hour

export async function generateStaticParams() {
  const products = await prisma.product.findMany({ select: { id: true } });
  const bundles = await prisma.bundle.findMany({ select: { id: true } });
  return [
    ...products.map((p) => ({ id: p.id })),
    ...bundles.map((b) => ({ id: b.id })),
  ];
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const [products, bundles, delivery] = await Promise.all([
    prisma.product.findMany({ where: { available: true } }),
    prisma.bundle.findMany(),
    prisma.deliveryConfig.findUnique({ where: { id: 1 } }),
  ]);

  const { id } = await params;
  
  const product = products.find((p) => p.id === id);
  const bundle = bundles.find((b) => b.id === id);

  if (!product && !bundle) {
    notFound();
  }

  return (
    <ProductClient
      initialProduct={product || products[0]}
      initialBundle={bundle || null}
      products={products}
      bundles={bundles}
    />
  );
}
