import React from "react";
import { prisma } from "@/lib/db";
import { CheckoutClient } from "./CheckoutClient";
import { currentMember } from "@/lib/auth";
import { discountOptions } from "@/lib/discounts";

export const dynamic = "force-dynamic";


export default async function CheckoutPage() {
  // catalog + member + member discounts all load in parallel
  const [products, bundles, deliveryConfig, slots, zones, member] = await Promise.all([
    prisma.product.findMany({ where: { available: true }, orderBy: { sortOrder: "asc" } }),
    prisma.bundle.findMany(),
    prisma.deliveryConfig.findUnique({ where: { id: 1 } }),
    prisma.deliverySlot.findMany({ orderBy: { orderIndex: "asc" } }),
    prisma.deliveryZone.findMany({ orderBy: { fee: "asc" } }),
    currentMember().then(async (m) => m
      ? { name: m.name, email: m.email, tierIndex: m.tierIndex, discounts: await discountOptions(m) }
      : null),
  ]);

  return <CheckoutClient products={products} bundles={bundles} deliveryConfig={deliveryConfig} slots={slots} zones={zones} member={member} />;
}
