"use client";

import React from "react";
import Link from "next/link";
import { Label, Btn, Wave } from "./components";
import { Jar } from "./Jars";
import { WellnessGiftBox } from "./GiftBox3D";
import { BENEFITS } from "@/lib/constants";

export function priceStr(n: number) {
  return "$" + (Number.isInteger(n) ? n : Number(n).toFixed(2));
}

export function Hero({ heroLayout = "split", bundles, deliveryConfig }: any) {
  const six = bundles.find((b: any) => b.qty > 1) || bundles[0] || { price: 68 };
  const one = bundles.find((b: any) => b.qty === 1) || bundles[0] || { price: 15.8 };
  return (
    <section className={`hero hero-${heroLayout}`}>
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <Label zh="花膠 · 甜品">Fish Maw Dessert, in a Jar</Label>
          <h1 className="hero-title">
            Collagen of the<br /><em>Eight Treasures</em>,<br />gently stewed.
          </h1>
          <p className="hero-zh">小膠傲 · 六款花膠甜品 · 瓶中心意</p>
          <p className="hero-lede">
            Six recipes — matcha, black sesame, red date, ginseng, coconut and osmanthus —
            slow-stewed with collagen-rich fish maw. A beauty ritual sealed in a jar.
          </p>
          <div className="hero-cta">
            <Btn onClick={() => {
              document.getElementById("bundles")?.scrollIntoView({ behavior: "smooth" });
            }}>Shop the Jars · 選購</Btn>
            <Btn variant="ghost" onClick={() => {
              document.getElementById("gift")?.scrollIntoView({ behavior: "smooth" });
            }}>Gifting · 送禮</Btn>
          </div>
          <div className="hero-meta">
            <span><strong>{priceStr(six.price)}</strong> / box of 6</span>
            <span className="dot">·</span>
            <span>{priceStr(one.price)} / single jar</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-halo" />
          <Jar tone="matcha" size={1.15} floating label="小膠傲" labelEn="MATCHA" />
          <Jar tone="sesame" size={0.82} floating label="小膠傲" labelEn="SESAME" />
        </div>
      </div>
    </section>
  );
}

export function BundleCard({ b, deliveryConfig }: any) {
  const free = b.price >= (deliveryConfig?.freeThreshold || 50);
  return (
    <div className={`bundle-card ${b.featured ? "is-featured" : ""}`}>
      {b.featured && <span className="ribbon">最超值 · Best Value</span>}
      <div className="bundle-top">
        <span className="bundle-zh">{b.titleZh}</span>
        <h3 className="bundle-title">{b.title}</h3>
      </div>
      <div className="bundle-price">
        <span className="bundle-amt">{priceStr(b.price)}</span>
        <span className="bundle-unit">/ {b.qty} {b.qty > 1 ? "jars" : "jar"}</span>
      </div>
      <p className="bundle-note">{b.note}</p>
      <p className="bundle-ship">{free ?
        "Free delivery 免運費" :
        `+ ${priceStr(deliveryConfig?.baseFee || 6)} delivery · free over ${priceStr(deliveryConfig?.freeThreshold || 50)}`}</p>
      <Link href={`/product/${b.id}`} passHref legacyBehavior>
        <Btn variant={b.featured ? "primary" : "ghost"} as="a">Choose · 選擇</Btn>
      </Link>
    </div>
  );
}

export function FlavorCard({ p }: any) {
  return (
    <Link href={`/product/${p.id}`} className="flavor-card" data-nofish="1">
      <div className="flavor-jar"><Jar tone={p.tone} size={0.72} label="小膠傲" labelEn={p.cap} /></div>
      <div className="flavor-body">
        <h3 className="flavor-name">{p.flavorEn}</h3>
        <p className="flavor-zh">{p.flavorZh}</p>
        <p className="flavor-blurb">{p.blurb}</p>
        <span className="flavor-cta">View jar · 查看 →</span>
      </div>
    </Link>
  );
}

export function Benefits() {
  return (
    <section className="benefits" id="benefits">
      <div className="wrap">
        <div className="section-head">
          <Label zh="海八珍">The Eight Treasures of the Sea</Label>
          <h2 className="section-title">Why fish maw, four ways</h2>
          <p className="section-lede">
            Fish maw — dried fish bladder — is prized among the sea's eight treasures for its
            high-grade collagen, vitamins, and trace calcium and zinc.
          </p>
        </div>
        <div className="benefit-grid">
          {BENEFITS.map((b: any, i: number) =>
            <div className="benefit-card" key={i}>
              <span className="benefit-num">{String(i + 1).padStart(2, "0")}</span>
              <h4 className="benefit-zh">{b.zh}</h4>
              <p className="benefit-en-title">{b.en}</p>
              <p className="benefit-body">{b.body}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function GiftBlock({ bundles }: any) {
  const boxBundle = bundles.find((b: any) => b.qty > 1) || bundles[0] || {};
  return (
    <section className="gift" id="gift">
      <div className="wrap gift-inner">
        <div className="gift-art">
          <WellnessGiftBox />
        </div>
        <div className="gift-copy">
          <Label zh="送禮 · 心意">A Gift of Wellness</Label>
          <h2 className="section-title">Sealed with intention, ready to give.</h2>
          <p className="section-lede">
            A box of six arrives gift-ready with free delivery — a considered gesture for the
            women in your life who treasure beauty and care, and for partners gifting on their behalf.
          </p>
          <Link href={`/product/${boxBundle.id}`} passHref legacyBehavior>
            <Btn as="a">Send a box · 送出禮盒</Btn>
          </Link>
        </div>
      </div>
    </section>
  );
}
