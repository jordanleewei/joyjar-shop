"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TONES } from "@/lib/constants";
import { Jar } from "@/components/ui/Jars";
import { photoUrl } from "@/components/ui/ProductPhoto";

type Form = {
  flavorEn: string; flavorZh: string; name: string; nameZh: string; tagline: string; taglineZh: string;
  blurb: string; blurbZh: string; ingredients: string; ingredientsZh: string; allergens: string;
  notes: string; notesZh: string; sweet: boolean; tone: string; cap: string; available: boolean; sortOrder: number; price: string;
};
const EMPTY: Form = {
  flavorEn: "", flavorZh: "", name: "", nameZh: "", tagline: "", taglineZh: "", blurb: "", blurbZh: "",
  ingredients: "", ingredientsZh: "", allergens: "Contains milk, fish products, and wheat products containing gluten.",
  notes: "", notesZh: "", sweet: true, tone: "matcha", cap: "", available: false, sortOrder: 0, price: "",
};

// Shrink the photo in the browser so uploads stay small and pages stay fast.
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

export function ProductForm({ initial, single }: { initial: (Form & { id: string; imageVer: number }) | null; single: number }) {
  const router = useRouter();
  const isNew = !initial;
  const [f, setF] = useState<Form>(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [saved, setSaved] = useState(JSON.stringify(initial ? { ...EMPTY, ...initial } : EMPTY));
  const [imageVer, setImageVer] = useState(initial?.imageVer || 0);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState<{ blob: Blob; url: string } | null>(null); // photo picked before first save
  const fileIn = useRef<HTMLInputElement>(null);
  const [created, setCreated] = useState(false);
  useEffect(() => { setCreated(new URLSearchParams(window.location.search).has("created")); }, []);
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setF((x) => ({ ...x, [k]: e.target.value })); setMsg(null); };
  const dirty = JSON.stringify(f) !== saved || !!pending;

  const uploadPhoto = async (id: string, blob: Blob) => {
    const fd = new FormData();
    fd.append("photo", blob, "photo.jpg");
    const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}/image`, { method: "PUT", body: fd });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Couldn't upload the photo.");
    setImageVer(data.imageVer);
  };

  const pickPhoto = async (file?: File | null) => {
    if (!file) return;
    setMsg(null);
    const blob = await shrink(file).catch(() => file);
    if (isNew) { if (pending) URL.revokeObjectURL(pending.url); setPending({ blob, url: URL.createObjectURL(blob) }); return; }
    setBusy("photo");
    try { await uploadPhoto(initial!.id, blob); setMsg({ ok: true, text: "Photo updated ✓" }); router.refresh(); }
    catch (e: any) { setMsg({ ok: false, text: e.message }); }
    setBusy("");
  };

  const removePhoto = async () => {
    if (isNew) { if (pending) URL.revokeObjectURL(pending.url); setPending(null); return; }
    setBusy("photo");
    await fetch(`/api/admin/products/${encodeURIComponent(initial!.id)}/image`, { method: "DELETE" });
    setImageVer(0); setBusy(""); setMsg({ ok: true, text: "Photo removed. The illustrated jar shows instead." }); router.refresh();
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy("save"); setMsg(null);
    const res = await fetch(isNew ? "/api/admin/products" : `/api/admin/products/${encodeURIComponent(initial!.id)}`, {
      method: isNew ? "POST" : "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setBusy(""); setMsg({ ok: false, text: data.error || "Couldn't save." }); return; }
    if (isNew) {
      if (pending) { try { await uploadPhoto(data.id, pending.blob); } catch {} }
      router.push(`/admin/products/${encodeURIComponent(data.id)}?created=1`);
      router.refresh();
      return;
    }
    setBusy(""); setSaved(JSON.stringify(f)); setMsg({ ok: true, text: "Saved ✓ The shop is updated." }); router.refresh();
  };

  const remove = async () => {
    if (isNew) return;
    if (!window.confirm(`Remove ${f.flavorEn || "this product"} from the shop?`)) return;
    setBusy("remove");
    const res = await fetch(`/api/admin/products/${encodeURIComponent(initial!.id)}`, { method: "DELETE" });
    setBusy("");
    if (res.ok) { router.push("/admin/products"); router.refresh(); }
    else setMsg({ ok: false, text: "Couldn't remove it. Please try again." });
  };

  const photo = pending ? pending.url : imageVer > 0 && initial ? photoUrl({ id: initial.id, imageVer }) : "";

  return (
    <main className="adm-wrap adm-main">
      <Link href="/admin/products" className="adm-back" data-nofish="1">← All products</Link>
      <div className="adm-head">
        <div>
          <h1>{isNew ? "Add a product · 新产品" : `${f.flavorEn || "Product"} ${f.flavorZh}`}</h1>
          {created && <p className="adm-ok-inline">Product added ✓ {f.available ? "It's now in the shop." : "It's hidden until you tick “Show in the shop” and save."}</p>}
        </div>
        {!isNew && <a className="adm-btn adm-btn-ghost adm-btn-link" href={`/product/${encodeURIComponent(initial!.id)}`} target="_blank" rel="noreferrer" data-nofish="1">View in shop ↗</a>}
      </div>

      <form className="prd-form" onSubmit={save}>
        <section className="prd-sec">
          <h2>Photo · 照片</h2>
          <div className="prd-photo-edit">
            <div className="prd-photo-big">
              {photo ? <img src={photo} alt="" /> : <Jar tone={f.tone} size={0.9} label="小胶傲" labelEn={f.cap || f.flavorEn.toUpperCase()} />}
            </div>
            <div className="prd-photo-actions">
              <input ref={fileIn} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ""; }} />
              <button type="button" className="adm-btn" data-nofish="1" disabled={busy === "photo"} onClick={() => fileIn.current?.click()}>{busy === "photo" ? "Uploading…" : photo ? "Change photo" : "Upload photo"}</button>
              {photo && <button type="button" className="adm-link" data-nofish="1" onClick={removePhoto}>Remove photo</button>}
              <p className="adm-muted">A square photo works best. Without a photo, the shop shows the illustrated jar in the colour below.</p>
            </div>
          </div>
        </section>

        <section className="prd-sec">
          <h2>Name · 名称</h2>
          <div className="prd-two">
            <Field label="Flavour" zh="英文" hint="Short name used on buttons, e.g. Pandan"><input value={f.flavorEn} onChange={set("flavorEn")} required maxLength={40} /></Field>
            <Field label="Flavour" zh="中文" hint="e.g. 班兰"><input value={f.flavorZh} onChange={set("flavorZh")} maxLength={20} /></Field>
            <Field label="Full name" zh="英文" hint={`Leave empty for “${f.flavorEn || "Flavour"} Fish Maw”`}><input value={f.name} onChange={set("name")} maxLength={80} /></Field>
            <Field label="Full name" zh="中文" hint="e.g. 班兰花胶"><input value={f.nameZh} onChange={set("nameZh")} maxLength={40} /></Field>
            <Field label="Tagline" zh="英文" hint="One fun line"><input value={f.tagline} onChange={set("tagline")} maxLength={140} /></Field>
            <Field label="Tagline" zh="中文"><input value={f.taglineZh} onChange={set("taglineZh")} maxLength={80} /></Field>
          </div>
        </section>

        <section className="prd-sec">
          <h2>Price · 价格</h2>
          <div className="prd-two">
            <Field label="Own price for a single jar" hint={`Leave empty to use the standard price (${"$" + single.toFixed(2)}). The Box of Six price is the same for every mix.`}>
              <div className="adm-money"><b>$</b><input inputMode="decimal" value={f.price} onChange={set("price")} placeholder={single.toFixed(2)} /></div>
            </Field>
          </div>
        </section>

        <section className="prd-sec">
          <h2>Details · 详情</h2>
          <div className="prd-two">
            <Field label="Description" zh="英文"><textarea rows={4} value={f.blurb} onChange={set("blurb")} maxLength={600} /></Field>
            <Field label="Description" zh="中文"><textarea rows={4} value={f.blurbZh} onChange={set("blurbZh")} maxLength={300} /></Field>
            <Field label="Ingredients" zh="英文"><textarea rows={3} value={f.ingredients} onChange={set("ingredients")} maxLength={600} /></Field>
            <Field label="Ingredients" zh="中文"><textarea rows={3} value={f.ingredientsZh} onChange={set("ingredientsZh")} maxLength={300} /></Field>
            <Field label="Allergens"><textarea rows={2} value={f.allergens} onChange={set("allergens")} maxLength={400} /></Field>
            <div />
            <Field label="Tasting notes" zh="英文" hint="One per line"><textarea rows={3} value={f.notes} onChange={set("notes")} /></Field>
            <Field label="Tasting notes" zh="中文" hint="One per line"><textarea rows={3} value={f.notesZh} onChange={set("notesZh")} /></Field>
          </div>
          <label className="stk-toggle"><input type="checkbox" checked={f.sweet} onChange={(e) => setF((x) => ({ ...x, sweet: e.target.checked }))} /> <span>Offer Less Sugar / No Sugar</span></label>
        </section>

        <section className="prd-sec">
          <h2>Jar look · 外观</h2>
          <p className="adm-muted">Used for the illustrated jar (when there&apos;s no photo) and in the gift box.</p>
          <div className="prd-tones" role="radiogroup" aria-label="Jar colour">
            {Object.entries(TONES).map(([id, t]: any) => (
              <button key={id} type="button" role="radio" aria-checked={f.tone === id} data-nofish="1" className={`prd-tone ${f.tone === id ? "is-on" : ""}`} onClick={() => setF((x) => ({ ...x, tone: id }))}>
                <i style={{ background: t.dessert, borderColor: t.label }} />{t.nameEn}
              </button>
            ))}
          </div>
          <div className="prd-two">
            <Field label="Text on the jar label" hint="Short, in capitals, e.g. PANDAN"><input value={f.cap} onChange={(e) => setF((x) => ({ ...x, cap: e.target.value.toUpperCase() }))} maxLength={14} placeholder={f.flavorEn.toUpperCase()} /></Field>
            <Field label="Order in the shop" hint="Lower numbers show first"><input type="number" min={0} value={f.sortOrder} onChange={(e) => setF((x) => ({ ...x, sortOrder: Number(e.target.value) || 0 }))} /></Field>
          </div>
        </section>

        <div className="prd-savebar">
          <label className="stk-toggle prd-show"><input type="checkbox" checked={f.available} onChange={(e) => setF((x) => ({ ...x, available: e.target.checked }))} /> <span><b>Show in the shop</b></span></label>
          <button type="submit" className="adm-btn" data-nofish="1" disabled={busy === "save" || (!isNew && !dirty)}>{busy === "save" ? "Saving…" : isNew ? "Add product" : "Save changes"}</button>
          {msg && <span className={msg.ok ? "adm-ok-inline" : "adm-err"} role="status">{msg.text}</span>}
          {!msg && dirty && !isNew && <span className="adm-muted">Unsaved changes</span>}
          {!isNew && <button type="button" className="adm-link prd-remove" data-nofish="1" disabled={busy === "remove"} onClick={remove}>Remove product</button>}
        </div>
      </form>
    </main>
  );
}
