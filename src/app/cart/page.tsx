import React from "react";
import { PrismaClient } from "@prisma/client";
import { CartClient } from "./CartClient";

const prisma = new PrismaClient();

export default async function CartPage() {
  const [products, bundles, deliveryConfig] = await Promise.all([
    prisma.product.findMany(),
    prisma.bundle.findMany(),
    prisma.deliveryConfig.findUnique({ where: { id: 1 } }),
  ]);

  return <CartClient products={products} bundles={bundles} deliveryConfig={deliveryConfig} />;
}
