"use client";

import React, { useState } from "react";
import { ACCESSORIES, TREATS, TIERS, tierOfAccessory } from "@/lib/club";

export type PetState = { balance: number; lifetime: number; tierIndex: number; owned: string[]; treats: Record<string, number> };

// Spend points on accessories (tier-locked) and treats to feed your pet.
export function PetShop({ st, onChange, wearing, onWear }: { st: PetState; onChange: (s: PetState) => void; wearing: string; onWear: (id: string) => void }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const buy = async (item: string, label: string) => {
    setBusy(item); setMsg(null);
    const res = await fetch("/api/club/pet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "buy", item }) });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) { setMsg({ ok: false, text: data.error || "Couldn't buy that right now." }); return; }
    onChange(data);
    setMsg({ ok: true, text: `${label} added ✓` });
  };

  return (
    <div className="petshop">
      <div className="petshop-head">
        <div>
          <h3 className="ck-h">Pet shop · 宠物商店</h3>
          <p className="muted small">Spend your points on treats and accessories. Fancier accessories unlock as you move up a tier.</p>
        </div>
        <div className="voucher-pill"><b>{st.balance}</b><span>points</span></div>
      </div>

      <h4 className="petshop-sub">Treats · 零食 <small>tap one in the pond, then tap the water to feed</small></h4>
      <div className="petshop-grid">
        {TREATS.map((t) => {
          const short = st.balance < t.cost;
          return (
            <div key={t.id} className="ps-item">
              <span className="ps-emoji" aria-hidden="true">{t.emoji}</span>
              <strong>{t.en}</strong><small>{t.zh} · ×{t.pack}</small>
              {st.treats[t.id] > 0 && <span className="ps-have">You have {st.treats[t.id]}</span>}
              <button type="button" className="ps-buy" data-nofish="1" disabled={short || busy === "treat:" + t.id}
                onClick={() => buy("treat:" + t.id, t.en)}>
                {busy === "treat:" + t.id ? "…" : short ? `${t.cost} pts` : `Buy · ${t.cost} pts`}
              </button>
            </div>
          );
        })}
      </div>

      <h4 className="petshop-sub">Accessories · 配饰</h4>
      <div className="petshop-grid">
        {ACCESSORIES.filter((a) => a.id !== "none").map((a) => {
          const [emoji, ...rest] = a.en.split(" ");
          const name = rest.join(" ");
          const need = tierOfAccessory(a.id);
          const locked = need > st.tierIndex;
          const own = st.owned.includes(a.id);
          const short = st.balance < a.cost;
          return (
            <div key={a.id} className={`ps-item ${locked ? "is-locked" : ""} ${own ? "is-owned" : ""}`}>
              <span className="ps-emoji" aria-hidden="true">{emoji}</span>
              <strong>{name}</strong><small>{TIERS[need]?.en} tier</small>
              {own ? (
                wearing === a.id
                  ? <span className="ps-have">Wearing ✓</span>
                  : <button type="button" className="ps-buy is-wear" data-nofish="1" onClick={() => onWear(a.id)}>Wear</button>
              ) : locked ? (
                <span className="ps-lock">🔒 Reach {TIERS[need].en}</span>
              ) : (
                <button type="button" className="ps-buy" data-nofish="1" disabled={short || busy === a.id} onClick={() => buy(a.id, name)}>
                  {busy === a.id ? "…" : a.cost === 0 ? "Free" : short ? `${a.cost} pts` : `Buy · ${a.cost} pts`}
                </button>
              )}
            </div>
          );
        })}
      </div>
      {msg && <p className={msg.ok ? "save-ok" : "form-err"} role="status">{msg.text}</p>}
    </div>
  );
}
