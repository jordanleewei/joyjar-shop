"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductPhoto } from "@/components/ui/ProductPhoto";

type Row = { id: string; flavorEn: string; flavorZh: string; name: string; tone: string; cap: string; imageVer: number; price: number | null; available: boolean; archived: boolean; stock: number | null; tagline: string };
const money = (n: number) => "$" + Number(n).toFixed(2);

export function ProductsClient({ rows, single, box }: { rows: Row[]; single: number; box: number }) {
  const router = useRouter();
  const live = rows.filter((r) => !r.archived);
  const removed = rows.filter((r) => r.archived);
  const [busy, setBusy] = useState("");

  const restore = async (id: string) => {
    setBusy(id);
    await fetch(`/api/admin/products/${encodeURIComponent(id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ restore: true }) });
    setBusy(""); router.refresh();
  };

  return (
    <main className="adm-wrap adm-main">
      <div className="adm-head">
        <div>
          <h1>Products · 产品</h1>
          <p className="adm-muted">Photos, details and prices. Changes show in the shop within a few seconds.</p>
        </div>
        <Link href="/admin/products/new" className="adm-btn adm-btn-link" data-nofish="1">+ Add product</Link>
      </div>

      <Prices single={single} box={box} />

      <div className="prd-grid">
        {live.map((r) => (
          <Link key={r.id} href={`/admin/products/${encodeURIComponent(r.id)}`} className={`prd-card ${r.available ? "" : "is-hidden"}`} data-nofish="1">
            <div className="prd-photo"><ProductPhoto p={r} size={0.5} /></div>
            <div className="prd-body">
              <strong>{r.flavorEn} <span>{r.flavorZh}</span></strong>
              <small>{r.name}</small>
              <span className="prd-price">{money(r.price ?? single)}{r.price == null ? <em> standard</em> : <em> own price</em>}</span>
              <span className={`stk-badge ${r.available ? "stk-ok" : "stk-off"}`}>{r.available ? "In the shop" : "Hidden"}</span>
            </div>
            <span className="prd-edit">Edit →</span>
          </Link>
        ))}
      </div>

      {removed.length > 0 && (
        <details className="stk-hidden">
          <summary>Removed products ({removed.length}) · kept because they&apos;re in past orders</summary>
          <div className="prd-grid">
            {removed.map((r) => (
              <div key={r.id} className="prd-card is-hidden">
                <div className="prd-photo"><ProductPhoto p={r} size={0.5} /></div>
                <div className="prd-body"><strong>{r.flavorEn} <span>{r.flavorZh}</span></strong><small>{r.name}</small></div>
                <button type="button" className="adm-btn adm-btn-ghost" data-nofish="1" disabled={busy === r.id} onClick={() => restore(r.id)}>Restore</button>
              </div>
            ))}
          </div>
        </details>
      )}
    </main>
  );
}

function Prices({ single, box }: { single: number; box: number }) {
  const router = useRouter();
  const [s, setS] = useState(single.toFixed(2));
  const [b, setB] = useState(box.toFixed(2));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = Number(s) !== single || Number(b) !== box;
  const save = async () => {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/admin/bundles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ single: s, box: b }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, text: data.error || "Couldn't save." }); return; }
    setMsg({ ok: true, text: "Prices saved ✓" }); router.refresh();
  };
  return (
    <section className="prd-prices">
      <h2>Standard prices · 价格</h2>
      <div className="prd-price-row">
        <label className="adm-field"><span>Single jar</span><div className="adm-money"><b>$</b><input inputMode="decimal" value={s} onChange={(e) => { setS(e.target.value); setMsg(null); }} /></div></label>
        <label className="adm-field"><span>Box of Six (any mix)</span><div className="adm-money"><b>$</b><input inputMode="decimal" value={b} onChange={(e) => { setB(e.target.value); setMsg(null); }} /></div></label>
        <button type="button" className="adm-btn" data-nofish="1" disabled={!dirty || busy} onClick={save}>{busy ? "Saving…" : "Save prices"}</button>
      </div>
      <p className="adm-muted">A flavour can also have its own single-jar price. Open it and fill in “Own price”.</p>
      {msg && <p className={msg.ok ? "adm-ok-inline" : "adm-err"}>{msg.text}</p>}
    </section>
  );
}
