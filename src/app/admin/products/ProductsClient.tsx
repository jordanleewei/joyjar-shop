"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductPhoto, photoUrl } from "@/components/ui/ProductPhoto";
import { GiftBox3D } from "@/components/ui/GiftBox3D";

type Row = { id: string; flavorEn: string; flavorZh: string; name: string; tone: string; cap: string; imageVer: number; price: number | null; available: boolean; archived: boolean; stock: number | null; tagline: string };
const money = (n: number) => "$" + Number(n).toFixed(2);

type BoxInfo = { id: string; title: string; titleZh: string; note: string; price: number; imageVer: number; qty: number } | null;

export function ProductsClient({ rows, single, box, boxInfo }: { rows: Row[]; single: number; box: number; boxInfo: BoxInfo }) {
  const router = useRouter();
  const live = rows.filter((r) => !r.archived && r.available);
  const hidden = rows.filter((r) => !r.archived && !r.available);
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

      <Prices single={single} />

      {boxInfo && <>
        <h2 className="prd-divider">Gift box · 礼盒</h2>
        <div className="prd-grid">
          <Link href="/admin/products/box" className="prd-card" data-nofish="1">
            <div className="prd-photo prd-photo-box">{boxInfo.imageVer > 0 ? <img src={photoUrl(boxInfo)} alt="" /> : <GiftBox3D caption={false} />}</div>
            <div className="prd-body">
              <strong>{boxInfo.title} <span>{boxInfo.titleZh}</span></strong>
              <small>{boxInfo.note || `Any ${boxInfo.qty} jars, mix and match`}</small>
              <span className="prd-price">{money(boxInfo.price)}<em> per box</em></span>
            </div>
            <span className="prd-edit">Edit →</span>
          </Link>
        </div>
      </>}

      <h2 className="prd-divider">In the shop · 在售 <span>{live.length}</span></h2>
      {live.length === 0 && <div className="adm-empty">No products in the shop. Open one below and tick “Show in the shop”.</div>}
      <div className="prd-grid">
        {live.map((r) => <Card key={r.id} r={r} single={single} />)}
      </div>

      {hidden.length > 0 && <>
        <h2 className="prd-divider">Hidden · 未上架 <span>{hidden.length}</span><small>Not shown to customers. Open one and tick “Show in the shop” to sell it.</small></h2>
        <div className="prd-grid">
          {hidden.map((r) => <Card key={r.id} r={r} single={single} />)}
        </div>
      </>}

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

function Card({ r, single }: { r: Row; single: number }) {
  return (
    <Link href={`/admin/products/${encodeURIComponent(r.id)}`} className={`prd-card ${r.available ? "" : "is-hidden"}`} data-nofish="1">
      <div className="prd-photo"><ProductPhoto p={r} size={0.5} /></div>
      <div className="prd-body">
        <strong>{r.flavorEn} <span>{r.flavorZh}</span></strong>
        <small>{r.name}</small>
        <span className="prd-price">{money(r.price ?? single)}{r.price == null ? <em> standard</em> : <em> own price</em>}</span>
        <span className={`stk-badge ${r.available ? "stk-ok" : "stk-off"}`}>{r.available ? "In the shop" : "Hidden"}</span>
      </div>
      <span className="prd-edit">Edit →</span>
    </Link>
  );
}

function Prices({ single }: { single: number }) {
  const router = useRouter();
  const [s, setS] = useState(single.toFixed(2));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const dirty = Number(s) !== single;
  const save = async () => {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/admin/bundles", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ single: s }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, text: data.error || "Couldn't save." }); return; }
    setMsg({ ok: true, text: "Prices saved ✓" }); router.refresh();
  };
  return (
    <section className="prd-prices">
      <h2>Standard single-jar price · 单瓶价格</h2>
      <div className="prd-price-row">
        <label className="adm-field"><span>Single jar</span><div className="adm-money"><b>$</b><input inputMode="decimal" value={s} onChange={(e) => { setS(e.target.value); setMsg(null); }} /></div></label>
        <button type="button" className="adm-btn" data-nofish="1" disabled={!dirty || busy} onClick={save}>{busy ? "Saving…" : "Save prices"}</button>
      </div>
      <p className="adm-muted">Used by every flavour unless it has its own price. The Box of Six price is set on the gift box below.</p>
      {msg && <p className={msg.ok ? "adm-ok-inline" : "adm-err"}>{msg.text}</p>}
    </section>
  );
}
