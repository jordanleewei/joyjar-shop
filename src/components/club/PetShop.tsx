"use client";

import React, { useState } from "react";
import { ACCESSORIES, TREATS, TIERS, tierOfAccessory } from "@/lib/club";

export type PetState = { balance: number; lifetime: number; tierIndex: number; owned: string[]; treats: Record<string, number> };

// Treats cost 1 point each. Accessories unlock free with your tier.
export function PetShop({ st, onChange, wearing, onWear }: { st: PetState; onChange: (s: PetState) => void; wearing: string; onWear: (id: string) => void }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const buy = async (id: string, qty: number, label: string) => {
    setBusy(id + qty); setMsg(null);
    const res = await fetch("/api/club/pet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "buy", item: "treat:" + id, qty }) });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) { setMsg({ ok: false, text: data.error || "Couldn't get that right now." }); return; }
    onChange(data);
    setMsg({ ok: true, text: `${qty} ${label.toLowerCase()}${qty > 1 ? "s" : ""} added ✓ Pick it at the bottom of the pond to feed.` });
  };

  return (
    <div className="petshop">
      <div className="petshop-head">
        <div>
          <h3 className="ck-h">Treats &amp; accessories · 零食与配饰</h3>
          <p className="muted small">Treats are 1 point each. Accessories are free and unlock as you move up a tier.</p>
        </div>
        <div className="voucher-pill"><b>{st.balance}</b><span>points</span></div>
      </div>

      <h4 className="petshop-sub">Treats · 零食 <small>1 point each</small></h4>
      <div className="petshop-grid">
        {TREATS.map((t) => (
          <div key={t.id} className="ps-item">
            <span className="ps-emoji" aria-hidden="true">{t.emoji}</span>
            <strong>{t.en}</strong><small>{t.zh}</small>
            {st.treats[t.id] > 0 && <span className="ps-have">You have {st.treats[t.id]}</span>}
            <div className="ps-buys">
              <button type="button" className="ps-buy" data-nofish="1" disabled={st.balance < 1 || !!busy} onClick={() => buy(t.id, 1, t.en)}>{busy === t.id + 1 ? "…" : "+1 · 1 pt"}</button>
              <button type="button" className="ps-buy is-quiet" data-nofish="1" disabled={st.balance < 5 || !!busy} onClick={() => buy(t.id, 5, t.en)}>{busy === t.id + 5 ? "…" : "×5"}</button>
            </div>
          </div>
        ))}
      </div>

      <h4 className="petshop-sub">Accessories · 配饰 <small>free once your tier unlocks them</small></h4>
      <div className="petshop-grid">
        {ACCESSORIES.filter((a) => a.id !== "none").map((a) => {
          const [emoji, ...rest] = a.en.split(" ");
          const name = rest.join(" ");
          const need = tierOfAccessory(a.id);
          const open = need <= st.tierIndex;
          return (
            <div key={a.id} className={`ps-item ${open ? "is-owned" : "is-locked"}`}>
              <span className="ps-emoji" aria-hidden="true">{emoji}</span>
              <strong>{name}</strong><small>{TIERS[need]?.en} tier</small>
              {!open ? (
                <span className="ps-lock">🔒 Reach {TIERS[need].en}</span>
              ) : wearing === a.id ? (
                <span className="ps-have">Wearing ✓</span>
              ) : (
                <button type="button" className="ps-buy is-wear" data-nofish="1" onClick={() => onWear(a.id)}>Wear</button>
              )}
            </div>
          );
        })}
      </div>
      {wearing !== "none" && <p className="muted small" style={{ marginTop: 10 }}><button type="button" className="link-quiet" data-nofish="1" onClick={() => onWear("none")}>Take off accessory</button></p>}
      {msg && <p className={msg.ok ? "save-ok" : "form-err"} role="status">{msg.text}</p>}
    </div>
  );
}
