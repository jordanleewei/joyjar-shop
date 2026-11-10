import React from "react";
import { prisma } from "@/lib/db";
import { Header, Footer } from "@/components/layout/Shared";
import { Hero, BundleCard, Benefits } from "@/components/ui/ShopBlocks";
import { Wave, Label } from "@/components/ui/components";
import { Marquee, FlavourShowcase, Journey, PopSection, ClubTeaser, Faq } from "@/components/story/Story";

export const revalidate = 3600; // Cache for 1 hour

export default async function ShopScreen() {
  const products = await prisma.product.findMany({ where: { available: true }, orderBy: { sortOrder: "asc" } });
  const bundles = await prisma.bundle.findMany();
  const deliveryConfig = await prisma.deliveryConfig.findUnique({ where: { id: 1 } });

  return (
    <div className="screen shop-screen">
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
      <Wave className="wave-sep" />
      <Faq />
      <Footer />
    </div>
  );
}
