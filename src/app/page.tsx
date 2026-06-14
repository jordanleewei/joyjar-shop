import React from "react";
import { PrismaClient } from "@prisma/client";
import { Header, Footer } from "@/components/layout/Shared";
import { Hero, BundleCard, FlavorCard, Benefits, GiftBlock } from "@/components/ui/ShopBlocks";
import { Wave, Label } from "@/components/ui/components";
import { FishProvider } from "@/components/ui/Fish";

const prisma = new PrismaClient();

export default async function ShopScreen() {
  const products = await prisma.product.findMany({ where: { available: true } });
  const bundles = await prisma.bundle.findMany();
  const deliveryConfig = await prisma.deliveryConfig.findUnique({ where: { id: 1 } });

  // Add the FishProvider to enable global clicks for fish bursts
  return (
    <div className="screen shop-screen">
      <FishProvider />
      <Header />
      <Hero heroLayout="split" bundles={bundles} deliveryConfig={deliveryConfig} />
      <Wave className="wave-sep" />
      <section className="bundles" id="bundles">
        <div className="wrap">
          <div className="section-head center">
            <Label zh="選購方案">Choose Your Jars</Label>
            <h2 className="section-title">Two ways to begin</h2>
          </div>
          <div className="bundle-grid">
            {bundles.sort((a, b) => b.qty - a.qty).map((b) => (
              <BundleCard key={b.id} b={b} deliveryConfig={deliveryConfig} />
            ))}
          </div>
        </div>
      </section>
      <section className="products" id="products">
        <div className="wrap">
          <div className="section-head center">
            <Label zh="六款風味">Six Flavours</Label>
            <h2 className="section-title">Choose your stew</h2>
            <p className="section-lede">Every jar can be made with sugar or none, served hot or cold.</p>
          </div>
          <div className="flavor-grid">
            {products.map((p) => (
              <FlavorCard key={p.id} p={p} />
            ))}
          </div>
        </div>
      </section>
      <Wave className="wave-sep" />
      <Benefits />
      <GiftBlock bundles={bundles} />
      <Footer />
    </div>
  );
}
