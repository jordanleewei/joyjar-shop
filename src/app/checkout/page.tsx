import React from "react";
import { prisma } from "@/lib/db";
import { CheckoutClient } from "./CheckoutClient";
import { currentMember } from "@/lib/auth";

export const dynamic = "force-dynamic";


export default async function CheckoutPage() {
  const [products, bundles, deliveryConfig, slots, zones] = await Promise.all([
    prisma.product.findMany({ where: { available: true }, orderBy: { sortOrder: "asc" } }),
    prisma.bundle.findMany(),
    prisma.deliveryConfig.findUnique({ where: { id: 1 } }),
    prisma.deliverySlot.findMany({ orderBy: { orderIndex: "asc" } }),
    prisma.deliveryZone.findMany({ orderBy: { fee: "asc" } }),
  ]);
  const m = await currentMember();
  const member = m ? { name: m.name, email: m.email, discount: m.discount, tierIndex: m.tierIndex } : null;

  return <CheckoutClient products={products} bundles={bundles} deliveryConfig={deliveryConfig} slots={slots} zones={zones} member={member} />;
}
