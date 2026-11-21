"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GiftBox3D } from "@/components/ui/GiftBox3D";
import { photoUrl } from "@/components/ui/ProductPhoto";

type Box = { id: string; qty: number; title: string; titleZh: string; note: string; noteZh: string; blurb: string; blurbZh: string; price: string; imageVer: number };

async function shrink(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
    const s = Math.min(1, 1200 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    return await new Promise<Blob>((ok) => c.toBlob((b) => ok(b || file), "image/jpeg", 0.85));
  } finally { URL.revokeObjectURL(url); }
}

function Field({ label, zh, hint, children }: { label: string; zh?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="adm-field">
      <span>{label}{zh && <em> {zh}</em>}</span>
      {children}
      {hint && <small className="adm-hint">{hint}</small>}
    </label>
  );
}

export function BoxForm({ initial }: { initial: Box }) {
  const router = useRouter();
  const [f, setF] = useState<Box>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [imageVer, setImageVer] = useState(initial.imageVer);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileIn = useRef<HTMLInputElement>(null);
  const set = (k: keyof Box) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF((x) => ({ ...x, [k]: e.target.value })); setMsg(null); };
  const dirty = JSON.stringify({ ...f, imageVer: initial.imageVer }) !== saved;

  const pickPhoto = async (file?: File | null) => {
    if (!file) return;
    setBusy("photo"); setMsg(null);
    const fd = new FormData();
    fd.append("photo", await shrink(file).catch(() => file), "photo.jpg");
    const res = await fetch(`/api/admin/products/${encodeURIComponent(f.id)}/image`, { method: "PUT", body: fd });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) { setMsg({ ok: false, text: data.error || "Couldn't upload the photo." }); return; }
    setImageVer(data.imageVer); setMsg({ ok: true, text: "Photo updated ✓" }); router.refresh();
  };
  const removePhoto = async () => {
    setBusy("photo");
    await fetch(`/api/admin/products/${encodeURIComponent(f.id)}/image`, { method: "DELETE" });
    setImageVer(0); setBusy(""); setMsg({ ok: true, text: "Photo removed. The illustrated gift box shows instead." }); router.refresh();
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("save"); setMsg(null);
    const res = await fetch(`/api/admin/bundles/${encodeURIComponent(f.id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    const data = await res.json().catch(() => ({}));
    setBusy("");
    if (!res.ok) { setMsg({ ok: false, text: data.error || "Couldn't save." }); return; }
    setSaved(JSON.stringify({ ...f, imageVer: initial.imageVer })); setMsg({ ok: true, text: "Saved ✓ The shop is updated." }); router.refresh();
  };

  return (
    <main className="adm-wrap adm-main">
      <Link href="/admin/products" className="adm-back" data-nofish="1">← All products</Link>
      <div className="adm-head">
        <div><h1>{f.title || "Gift box"} <span className="adm-zh">{f.titleZh}</span></h1>
        <p className="adm-muted">Customers pick any {f.qty} jars from the flavours in the shop.</p></div>
        <a className="adm-btn adm-btn-ghost adm-btn-link" href={`/product/${encodeURIComponent(f.id)}`} target="_blank" rel="noreferrer" data-nofish="1">View in shop ↗</a>
      </div>
      <form className="prd-form" onSubmit={save}>
        <section className="prd-sec">
          <h2>Photo · 照片</h2>
          <div className="prd-photo-edit">
            <div className="prd-photo-big">{imageVer > 0 ? <img src={photoUrl({ id: f.id, imageVer })} alt="" /> : <GiftBox3D caption={false} />}</div>
            <div className="prd-photo-actions">
              <input ref={fileIn} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />
              <button type="button" className="adm-btn" data-nofish="1" disabled={busy === "photo"} onClick={() => fileIn.current?.click()}>{busy === "photo" ? "Uploading…" : imageVer > 0 ? "Change photo" : "Upload photo"}</button>
              {imageVer > 0 && <button type="button" className="adm-link" data-nofish="1" onClick={removePhoto}>Remove photo</button>}
              <p className="adm-muted">Shows on the homepage card, and on the box page until the customer starts picking jars (then the illustrated box fills up as they choose).</p>
            </div>
          </div>
        </section>
        <section className="prd-sec">
          <h2>Name &amp; price · 名称与价格</h2>
          <div className="prd-two">
            <Field label="Name" zh="英文"><input value={f.title} onChange={set("title")} required maxLength={60} /></Field>
            <Field label="Name" zh="中文"><input value={f.titleZh} onChange={set("titleZh")} maxLength={30} /></Field>
            <Field label="Price for the box"><div className="adm-money"><b>$</b><input inputMode="decimal" value={f.price} onChange={set("price")} required /></div></Field>
            <div />
            <Field label="Short note" zh="英文" hint="Shown on the homepage card, e.g. Best value · gift-ready."><input value={f.note} onChange={set("note")} maxLength={120} /></Field>
            <Field label="Short note" zh="中文"><input value={f.noteZh} onChange={set("noteZh")} maxLength={60} /></Field>
          </div>
        </section>
        <section className="prd-sec">
          <h2>Description · 详情</h2>
          <div className="prd-two">
            <Field label="Description" zh="英文" hint="Shown at the top of the box page"><textarea rows={4} value={f.blurb} onChange={set("blurb")} maxLength={600} /></Field>
            <Field label="Description" zh="中文"><textarea rows={4} value={f.blurbZh} onChange={set("blurbZh")} maxLength={300} /></Field>
          </div>
        </section>
        <div className="prd-savebar">
          <button type="submit" className="adm-btn" data-nofish="1" disabled={busy === "save" || !dirty}>{busy === "save" ? "Saving…" : "Save changes"}</button>
          {msg && <span className={msg.ok ? "adm-ok-inline" : "adm-err"} role="status">{msg.text}</span>}
          {!msg && dirty && <span className="adm-muted">Unsaved changes</span>}
        </div>
      </form>
    </main>
  );
}
