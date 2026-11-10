"use client";

import React from "react";
import { Label } from "@/components/ui/components";
import { TIERS } from "@/lib/club";
import { priceStr } from "@/components/ui/ShopBlocks";

export function Tiers({ current = -1 }: { current?: number }) {
  return (
    <section className="club-tiers">
      <div className="wrap">
        <div className="section-head center">
          <Label zh="会员等级">Four tiers</Label>
          <h2 className="section-title">Unlock discounts with free membership.</h2>
          <p className="section-lede">Your tier goes up automatically with every paid order while you&apos;re logged in. Discounts come off the jars, every time.</p>
        </div>
        <div className="tier-grid">
          {TIERS.map((t, i) => (
            <div key={t.id} className={`tier-card ${i === current ? "is-current" : ""} ${i < current ? "is-done" : ""}`}>
              {i === current && <span className="ribbon">You&apos;re here · 当前</span>}
              <span className="tier-zh">{t.zh}</span>
              <h3 className="tier-name">{t.en}</h3>
              <p className="tier-off">{t.discount ? `${Math.round(t.discount * 100)}% off` : "Free to join"}</p>
              <p className="tier-min">{t.min ? `From ${priceStr(t.min)} spent` : "Sign up"}</p>
              <ul className="tier-perks">{t.perks.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

