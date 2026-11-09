import React from "react";
import { prisma } from "@/lib/db";
import { CartClient } from "./CartClient";


export default async function CartPage() {
  const [products, bundles, deliveryConfig] = await Promise.all([
    prisma.product.findMany({ where: { available: true }, orderBy: { sortOrder: "asc" } }),
    prisma.bundle.findMany(),
    prisma.deliveryConfig.findUnique({ where: { id: 1 } }),
  ]);

  return <CartClient products={products} bundles={bundles} deliveryConfig={deliveryConfig} />;
}
