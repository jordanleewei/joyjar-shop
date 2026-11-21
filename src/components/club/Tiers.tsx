"use client";

import React from "react";
import { Label } from "@/components/ui/components";
import { TIERS } from "@/lib/club";
import { POINTS_PER_DOLLAR, MISSION_POINTS, REDEEM_BLOCK, REDEEM_VALUE } from "@/lib/club";

export function Tiers({ current = -1 }: { current?: number }) {
  return (
    <section className="club-tiers">
      <div className="wrap">
        <div className="section-head center">
          <Label zh="会员等级">Four tiers</Label>
          <h2 className="section-title">Collect points with free membership.</h2>
          <p className="section-lede">Earn {POINTS_PER_DOLLAR} point for every $1 you spend while logged in, plus {MISSION_POINTS} points for each mission. Your tier goes up as points add up, and every {REDEEM_BLOCK} points is ${REDEEM_VALUE} off. Spending points never lowers your tier.</p>
        </div>
        <div className="tier-grid">
          {TIERS.map((t, i) => (
            <div key={t.id} className={`tier-card ${i === current ? "is-current" : ""} ${i < current ? "is-done" : ""}`}>
              {i === current && <span className="ribbon">You&apos;re here · 当前</span>}
              <span className="tier-zh">{t.zh}</span>
              <h3 className="tier-name">{t.en}</h3>
              <p className="tier-off">{t.min ? `${t.min} pts` : "Free to join"}</p>
              <p className="tier-min">{t.min ? `Collect ${t.min} points` : "Sign up"}</p>
              <ul className="tier-perks">{t.perks.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

