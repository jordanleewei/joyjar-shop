import React from "react";
import { PrismaClient } from "@prisma/client";
import { CheckoutClient } from "./CheckoutClient";

const prisma = new PrismaClient();

export default async function CheckoutPage() {
  const [products, bundles, deliveryConfig, slots, zones] = await Promise.all([
    prisma.product.findMany(),
    prisma.bundle.findMany(),
    prisma.deliveryConfig.findUnique({ where: { id: 1 } }),
    prisma.deliverySlot.findMany({ orderBy: { orderIndex: "asc" } }),
    prisma.deliveryZone.findMany({ orderBy: { fee: "asc" } }),
  ]);

  return <CheckoutClient products={products} bundles={bundles} deliveryConfig={deliveryConfig} slots={slots} zones={zones} />;
}
