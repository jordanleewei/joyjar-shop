"use client";

import { useState } from "react";
import { TONES } from "@/lib/constants";

type Row = { id: string; name: string; zh: string; tone: string; stock: number | null; available: boolean; sold30: number; toPack: number };
const LOW = 6;

export function StockClient({ rows }: { rows: Row[] }) {
  return (
    <main className="adm-wrap adm-main">
      <div className="adm-head">
        <div>
          <h1>Stock · 库存</h1>
          <p className="adm-muted">Jars in stock go down by themselves when an order is paid. When a flavour hits 0 it shows as sold out in the shop.</p>
        </div>
      </div>
      <div className="stk-grid">
        {rows.filter((r) => r.available).map((r) => <StockRow key={r.id} r={r} />)}
      </div>
      {rows.some((r) => !r.available) && (
        <details className="stk-hidden">
          <summary>Hidden flavours ({rows.filter((r) => !r.available).length}) · not shown in the shop</summary>
          <div className="stk-grid">
            {rows.filter((r) => !r.available).map((r) => <StockRow key={r.id} r={r} />)}
          </div>
        </details>
      )}
    </main>
  );
}

function StockRow({ r }: { r: Row }) {
  const [track, setTrack] = useState(r.stock !== null);
  const [stock, setStock] = useState<number>(r.stock ?? 0);
  const [available, setAvailable] = useState(r.available);
  const [saved, setSaved] = useState({ track: r.stock !== null, stock: r.stock ?? 0, available: r.available });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = track !== saved.track || available !== saved.available || (track && stock !== saved.stock);
  const swatch = (TONES as any)[r.tone]?.swatch || "#cdd9b4";

  const save = async () => {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/admin/stock", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, stock: track ? stock : null, available }) });
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, text: "Couldn't save. Try again?" }); return; }
    setSaved({ track, stock, available });
    setMsg({ ok: true, text: "Saved ✓" });
  };
  const bump = (n: number) => { setStock((s) => Math.max(0, s + n)); setMsg(null); };
  const status = !available ? { t: "Hidden", c: "off" } : !track ? { t: "Not counting", c: "na" } : stock <= 0 ? { t: "Sold out", c: "out" } : stock <= LOW ? { t: "Low", c: "low" } : { t: "In stock", c: "ok" };

  return (
    <div className="stk-card">
      <div className="stk-top">
        <i className="stk-swatch" style={{ background: swatch }} />
        <div><strong>{r.name}</strong><small>{r.zh}</small></div>
        <span className={`stk-badge stk-${status.c}`}>{status.t}</span>
      </div>
      <label className="stk-toggle">
        <input type="checkbox" checked={available} onChange={(e) => { setAvailable(e.target.checked); setMsg(null); }} />
        <span>Show in shop</span>
      </label>
      <label className="stk-toggle">
        <input type="checkbox" checked={track} onChange={(e) => { setTrack(e.target.checked); setMsg(null); }} />
        <span>Count stock for this flavour</span>
      </label>
      {track && (
        <div className="stk-count">
          <button type="button" data-nofish="1" onClick={() => bump(-1)} aria-label="One less">−</button>
          <input type="number" min={0} inputMode="numeric" value={stock} onChange={(e) => { setStock(Math.max(0, Math.floor(Number(e.target.value) || 0))); setMsg(null); }} aria-label={`${r.name} jars in stock`} />
          <button type="button" data-nofish="1" onClick={() => bump(1)} aria-label="One more">+</button>
          <span className="stk-unit">jars</span>
          <div className="stk-quick">
            <button type="button" data-nofish="1" onClick={() => bump(6)}>+6</button>
            <button type="button" data-nofish="1" onClick={() => bump(12)}>+12</button>
            <button type="button" data-nofish="1" onClick={() => bump(24)}>+24</button>
          </div>
        </div>
      )}
      <p className="adm-muted stk-meta">{r.toPack} jar{r.toPack === 1 ? "" : "s"} waiting to be packed · {r.sold30} sold in the last 30 days</p>
      <div className="stk-save">
        <button type="button" className="adm-btn" data-nofish="1" disabled={!dirty || busy} onClick={save}>{busy ? "Saving…" : "Save"}</button>
        {msg && <span className={msg.ok ? "adm-ok-inline" : "adm-err"}>{msg.text}</span>}
        {dirty && !busy && !msg && <span className="adm-muted">Unsaved</span>}
      </div>
    </div>
  );
}
