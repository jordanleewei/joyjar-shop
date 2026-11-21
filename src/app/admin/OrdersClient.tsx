"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { REGIONS } from "@/lib/regions";
import { formatDate } from "@/lib/dates";
import type { AdminOrder } from "@/lib/adminData";

type View = "new" | "packed" | "delivered" | "all" | "unpaid";
const VIEWS: { id: View; en: string; zh: string }[] = [
  { id: "new", en: "To pack", zh: "待打包" },
  { id: "packed", en: "Packed", zh: "已打包" },
  { id: "delivered", en: "Delivered", zh: "已送达" },
  { id: "all", en: "All paid", zh: "全部" },
  { id: "unpaid", en: "Unpaid", zh: "未付款" },
];
const REGION_ORDER = [...REGIONS.map((r) => r.id as string), ""];
const money = (n: number) => "$" + Number(n || 0).toFixed(2);
const when = (iso: string) => new Date(iso).toLocaleString("en-SG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
const regionLabel = (id: string) => { const r = REGIONS.find((x) => x.id === id); return r ? `${r.en} · ${r.zh}` : "No region"; };
const waLink = (phone: string) => {
  let d = phone.replace(/\D/g, "");
  if (d.length === 8) d = "65" + d;
  return `https://wa.me/${d}`;
};

export function OrdersClient({ paid, unpaid }: { paid: AdminOrder[]; unpaid: AdminOrder[] }) {
  const router = useRouter();
  const [orders, setOrders] = useState(paid);
  const [view, setView] = useState<View>("new");
  const [region, setRegion] = useState<string>("all");
  const [day, setDay] = useState<string>("all");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const inView = (o: AdminOrder) => view === "all" || view === "unpaid" || o.fulfil === view;
  const base = view === "unpaid" ? unpaid : orders.filter(inView);
  const matches = (o: AdminOrder) => {
    const s = q.trim().toLowerCase();
    if (!s) return true;
    return [o.num, o.name, o.phone, o.postal, o.addr, o.email].some((v) => v.toLowerCase().includes(s));
  };
  const days = [...new Set(base.map((o) => o.date))].sort((a, b) => (a || "9").localeCompare(b || "9"));
  const searched = base.filter(matches).filter((o) => day === "all" || o.date === day);
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: searched.length };
    for (const o of searched) c[o.region] = (c[o.region] || 0) + 1;
    return c;
  }, [searched]);
  const shown = searched.filter((o) => region === "all" || o.region === region);

  // group by region, then by postal code so nearby addresses sit together
  const groups = REGION_ORDER.map((r) => ({
    id: r,
    list: shown.filter((o) => o.region === r).sort((a, b) => (a.date || "9").localeCompare(b.date || "9") || a.postal.localeCompare(b.postal) || a.createdAt.localeCompare(b.createdAt)),
  })).filter((g) => g.list.length);

  const viewCount = (v: View) => v === "unpaid" ? unpaid.length : v === "all" ? orders.length : orders.filter((o) => o.fulfil === v).length;
  const toggle = (num: string) => setSel((s) => { const n = new Set(s); n.has(num) ? n.delete(num) : n.add(num); return n; });
  const selectList = (list: AdminOrder[], on: boolean) => setSel((s) => { const n = new Set(s); list.forEach((o) => on ? n.add(o.num) : n.delete(o.num)); return n; });
  const printLabels = (nums: string[]) => { if (nums.length) window.open(`/admin/labels?nums=${encodeURIComponent(nums.join(","))}`, "_blank"); };

  const patch = async (nums: string[], data: { fulfil?: string; region?: string }, note: string) => {
    if (!nums.length) return;
    setBusy(true); setMsg("");
    const res = await fetch("/api/admin/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nums, ...data }) });
    setBusy(false);
    if (!res.ok) { setMsg("Couldn't save that. Please try again."); return; }
    const out = await res.json().catch(() => ({}));
    if (out.emailed) note += ` · ${out.emailed} customer${out.emailed === 1 ? "" : "s"} emailed`;
    setOrders((list) => list.map((o) => nums.includes(o.num) ? { ...o, ...data } as AdminOrder : o));
    if (data.fulfil) setSel(new Set());
    setMsg(note);
    router.refresh();
  };

  const selNums = [...sel];
  const jarsToPack = orders.filter((o) => o.fulfil === "new").reduce((s, o) => s + o.jars, 0);

  return (
    <main className="adm-wrap adm-main">
      <div className="adm-head">
        <div>
          <h1>Orders · 订单</h1>
          <p className="adm-muted">{viewCount("new")} to pack ({jarsToPack} jars) · {viewCount("packed")} packed, out for delivery</p>
        </div>
        <select className="adm-day" value={day} onChange={(e) => { setDay(e.target.value); setSel(new Set()); }} aria-label="Delivery date">
          <option value="all">All delivery dates</option>
          {days.map((d) => <option key={d || "none"} value={d}>{d ? formatDate(d) : "No date"} ({base.filter((o) => o.date === d).length})</option>)}
        </select>
        <input className="adm-search" type="search" placeholder="Search name, phone, postal code, order no." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="adm-tabs" role="tablist">
        {VIEWS.map((v) => (
          <button key={v.id} type="button" role="tab" aria-selected={view === v.id} data-nofish="1"
            className={`adm-tab ${view === v.id ? "is-on" : ""}`} onClick={() => { setView(v.id); setSel(new Set()); }}>
            {v.en} <small>{v.zh}</small> <b>{viewCount(v.id)}</b>
          </button>
        ))}
      </div>

      <div className="adm-regions">
        <button type="button" data-nofish="1" className={`adm-chip ${region === "all" ? "is-on" : ""}`} onClick={() => setRegion("all")}>All regions <b>{counts.all || 0}</b></button>
        {REGIONS.map((r) => (
          <button key={r.id} type="button" data-nofish="1" className={`adm-chip ${region === r.id ? "is-on" : ""}`} onClick={() => setRegion(r.id)}>
            {r.en} <small>{r.zh}</small> <b>{counts[r.id] || 0}</b>
          </button>
        ))}
        {(counts[""] || 0) > 0 && <button type="button" data-nofish="1" className={`adm-chip ${region === "" ? "is-on" : ""}`} onClick={() => setRegion("")}>No region <b>{counts[""]}</b></button>}
      </div>

      {view === "unpaid" && <p className="adm-note">These customers started checkout in the last 7 days but didn&apos;t finish paying. Don&apos;t send these out. You may want to WhatsApp them.</p>}
      {msg && <p className="adm-ok" role="status">{msg}</p>}

      {groups.length === 0 && <div className="adm-empty">{q ? "No orders match your search." : view === "new" ? "Nothing to pack right now 🎉" : "No orders here yet."}</div>}

      {groups.map((g) => {
        const allOn = g.list.every((o) => sel.has(o.num));
        return (
          <section key={g.id || "none"} className="adm-group">
            <div className="adm-group-head">
              <label className="adm-check"><input type="checkbox" checked={allOn} onChange={(e) => selectList(g.list, e.target.checked)} /> <h2>{regionLabel(g.id)}</h2></label>
              <span className="adm-muted">{g.list.length} order{g.list.length === 1 ? "" : "s"} · {g.list.reduce((s, o) => s + o.jars, 0)} jars</span>
              {view !== "unpaid" && <button type="button" className="adm-btn adm-btn-ghost" data-nofish="1" onClick={() => printLabels(g.list.map((o) => o.num))}>🖨 Print {g.list.length} label{g.list.length === 1 ? "" : "s"}</button>}
            </div>
            <div className="adm-orders">
              {g.list.map((o) => (
                <article key={o.num} className={`adm-order ${sel.has(o.num) ? "is-sel" : ""}`}>
                  <div className="adm-order-top">
                    <label className="adm-check"><input type="checkbox" checked={sel.has(o.num)} onChange={() => toggle(o.num)} aria-label={`Select ${o.num}`} /> <strong>{o.num}</strong></label>
                    {o.date && <span className="adm-date">🗓 {formatDate(o.date)}</span>}
                    <span className="adm-muted">ordered {when(o.createdAt)}</span>
                    {view !== "unpaid" && <span className={`adm-st adm-st-${o.fulfil}`}>{o.fulfil === "new" ? "To pack" : o.fulfil === "packed" ? "Packed" : "Delivered"}</span>}
                  </div>
                  <div className="adm-order-body">
                    <div className="adm-addr">
                      <p className="adm-name">{o.name}</p>
                      <p>{o.addr}{o.unit ? `, ${o.unit}` : ""}</p>
                      <p>Singapore {o.postal}</p>
                      <p className="adm-contact">
                        <a href={`tel:${o.phone.replace(/\s/g, "")}`} data-nofish="1">📞 {o.phone}</a>
                        <a href={waLink(o.phone)} target="_blank" rel="noreferrer" data-nofish="1">WhatsApp</a>
                      </p>
                      {o.email && <p className="adm-muted">{o.email}</p>}
                    </div>
                    <div className="adm-items">
                      <ul>{o.lines.map((l, i) => <li key={i}>{l}</li>)}</ul>
                      {o.note && <p className="adm-onote">📝 {o.note}</p>}
                      <p className="adm-muted">{money(o.total)} · {o.method === "card" ? "Card" : "PayNow"}{o.discount ? ` · −${money(o.discount)} discount` : ""}{o.deliveryFee ? ` · delivery ${money(o.deliveryFee)}` : " · free delivery"}{o.member ? " · member" : ""}</p>
                    </div>
                  </div>
                  <div className="adm-order-actions">
                    <select value={o.region} onChange={(e) => patch([o.num], { region: e.target.value }, `${o.num} moved to ${regionLabel(e.target.value)}`)} aria-label="Region" disabled={view === "unpaid"}>
                      <option value="">No region</option>
                      {REGIONS.map((r) => <option key={r.id} value={r.id}>{r.en} · {r.zh}</option>)}
                    </select>
                    {view !== "unpaid" && <>
                      <button type="button" className="adm-btn adm-btn-ghost" data-nofish="1" onClick={() => printLabels([o.num])}>🖨 Label</button>
                      {o.fulfil === "new" && <button type="button" className="adm-btn" data-nofish="1" disabled={busy} onClick={() => patch([o.num], { fulfil: "packed" }, `${o.num} marked packed`)}>Mark packed</button>}
                      {o.fulfil === "packed" && <button type="button" className="adm-btn" data-nofish="1" disabled={busy} onClick={() => patch([o.num], { fulfil: "delivered" }, `${o.num} marked delivered`)}>Mark delivered</button>}
                      {o.fulfil !== "new" && <button type="button" className="adm-link" data-nofish="1" disabled={busy} onClick={() => patch([o.num], { fulfil: o.fulfil === "delivered" ? "packed" : "new" }, `${o.num} moved back`)}>Undo</button>}
                    </>}
                  </div>
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {selNums.length > 0 && view !== "unpaid" && (
        <div className="adm-selbar">
          <span><b>{selNums.length}</b> selected</span>
          <button type="button" className="adm-btn adm-btn-light" data-nofish="1" onClick={() => printLabels(selNums)}>🖨 Print labels</button>
          {view !== "packed" && view !== "delivered" && <button type="button" className="adm-btn adm-btn-light" data-nofish="1" disabled={busy} onClick={() => patch(selNums, { fulfil: "packed" }, `${selNums.length} marked packed`)}>Mark packed</button>}
          {view !== "delivered" && <button type="button" className="adm-btn adm-btn-light" data-nofish="1" disabled={busy} onClick={() => patch(selNums, { fulfil: "delivered" }, `${selNums.length} marked delivered`)}>Mark delivered</button>}
          <button type="button" className="adm-link adm-link-light" data-nofish="1" onClick={() => setSel(new Set())}>Clear</button>
        </div>
      )}
    </main>
  );
}
