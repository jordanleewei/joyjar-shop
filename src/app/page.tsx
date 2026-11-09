import React from "react";
import { prisma } from "@/lib/db";
import { Header, Footer } from "@/components/layout/Shared";
import { Hero, BundleCard, Benefits, GiftBlock } from "@/components/ui/ShopBlocks";
import { Wave, Label } from "@/components/ui/components";
import { FishProvider } from "@/components/ui/Fish";
import { Marquee, FlavourShowcase, Journey, PopSection, ClubTeaser, Faq } from "@/components/story/Story";

export const revalidate = 3600; // Cache for 1 hour

export default async function ShopScreen() {
  const products = await prisma.product.findMany({ where: { available: true }, orderBy: { sortOrder: "asc" } });
  const bundles = await prisma.bundle.findMany();
  const deliveryConfig = await prisma.deliveryConfig.findUnique({ where: { id: 1 } });

  // Add the FishProvider to enable global clicks for fish bursts
  return (
    <div className="screen shop-screen">
      <FishProvider />
      <Header />
      <Hero heroLayout="split" bundles={bundles} deliveryConfig={deliveryConfig} />
      <Marquee />
      <section className="bundles" id="shop">
        <div className="wrap">
          <div className="section-head center">
            <Label zh="选购方案">Choose Your Jars</Label>
            <h2 className="section-title">Two ways to begin</h2>
          </div>
          <div className="bundle-grid">
            {bundles.sort((a, b) => b.qty - a.qty).map((b) => (
              <BundleCard key={b.id} b={b} deliveryConfig={deliveryConfig} />
            ))}
          </div>
        </div>
      </section>
      <FlavourShowcase products={products} />
      <Journey />
      <PopSection />
      <Benefits />
      <ClubTeaser />
      <GiftBlock bundles={bundles} />
      <Wave className="wave-sep" />
      <Faq />
      <Footer />
    </div>
  );
}
