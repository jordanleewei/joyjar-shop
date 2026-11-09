"use client";

import React from "react";
import Link from "next/link";
import { Label, Btn, Wave } from "./components";
import { Jar } from "./Jars";
import { WellnessGiftBox } from "./GiftBox3D";
import { BENEFITS, DISCLAIMER, DISCLAIMER_ZH } from "@/lib/constants";

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
          <Label zh="鲜炖花胶 · 新加坡制作">Fresh fish maw, in a jar</Label>
          <h1 className="hero-title">
            Slow-stewed joy,<br /><em>sealed in a jar.</em>
          </h1>
          <p className="hero-zh">一罐花胶，满满胶傲</p>
          <p className="hero-lede">
            Golden fish maw, double-boiled for a full hour with real ingredients and fresh milk.
            Four flavours, no preservatives, made fresh in Singapore.
          </p>
          <div className="hero-cta">
            <Btn onClick={() => {
              document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
            }}>Shop the jars · 选购</Btn>
            <Btn variant="ghost" onClick={() => {
              document.getElementById("kitchen")?.scrollIntoView({ behavior: "smooth" });
            }}>See how it&apos;s made · 制作过程</Btn>
          </div>
          <div className="hero-meta">
            <span><strong>{priceStr(six.price)}</strong> / box of 6</span>
            <span className="dot">·</span>
            <span>{priceStr(one.price)} / single jar</span>
            <span className="dot">·</span>
            <span>Free delivery over {priceStr(deliveryConfig?.freeThreshold || 50)}</span>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-halo" />
          <Jar tone="pandan" size={1.15} floating label="小胶傲" labelEn="PANDAN" />
          <Jar tone="rose" size={0.82} floating label="小胶傲" labelEn="ROSE" />
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
        "Free delivery 免运费" :
        `+ ${priceStr(deliveryConfig?.baseFee || 6)} delivery · free over ${priceStr(deliveryConfig?.freeThreshold || 50)}`}</p>
      <Link href={`/product/${b.id}`} passHref legacyBehavior>
        <Btn variant={b.featured ? "primary" : "ghost"} as="a">Choose · 选择</Btn>
      </Link>
    </div>
  );
}

export function FlavorCard({ p }: any) {
  return (
    <Link href={`/product/${p.id}`} className="flavor-card" data-nofish="1">
      <div className="flavor-jar"><Jar tone={p.tone} size={0.72} label="小胶傲" labelEn={p.cap} /></div>
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
          <h2 className="section-title">Why we love fish maw</h2>
          <p className="section-lede">
            Fish maw has been a treasured ingredient in Chinese kitchens for generations.
            We keep it simple: good maw, real ingredients, slow heat and nothing artificial.
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
        <p className="benefit-disclaimer">{DISCLAIMER}<br /><span>{DISCLAIMER_ZH}</span></p>
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
          <Label zh="送礼 · 心意">A Gift of Wellness</Label>
          <h2 className="section-title">Sealed with intention, ready to give.</h2>
          <p className="section-lede">
            A box of six arrives gift-ready with free delivery — mix and match the four flavours
            for someone who deserves a little joy (yourself included).
          </p>
          <Link href={`/product/${boxBundle.id}`} passHref legacyBehavior>
            <Btn as="a">Send a box · 送出礼盒</Btn>
          </Link>
        </div>
      </div>
    </section>
  );
}
