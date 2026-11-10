"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout/Shared";
import { Label, Btn } from "@/components/ui/components";
import { MemberCard, FishMawPet } from "@/components/club/MemberCard";
import { CardDesigner } from "@/components/club/CardDesigner";
import { Tiers } from "@/components/club/Tiers";
import { MissionsPanel } from "@/components/club/Missions";
import { PetPond } from "@/components/club/PetPond";
import { TIERS, tierFor, parseCard, memberNo, unlockedAccessories, CardDesign } from "@/lib/club";
import { priceStr } from "@/components/ui/ShopBlocks";

type Tab = "overview" | "missions" | "pet" | "card" | "orders" | "settings";
const TABS: { id: Tab; en: string; zh: string }[] = [
  { id: "overview", en: "Overview", zh: "总览" },
  { id: "missions", en: "Missions", zh: "任务" },
  { id: "pet", en: "My pet", zh: "宠物" },
  { id: "card", en: "My card", zh: "卡面" },
  { id: "orders", en: "Orders", zh: "订单" },
  { id: "settings", en: "Settings", zh: "设置" },
];

export function AccountClient({ member, orders }: { member: any; orders: any[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [card, setCard] = useState<CardDesign>(() => parseCard(member.card));
  const [name, setName] = useState<string>(member.name);
  const [savedCard, setSavedCard] = useState<string>(() => JSON.stringify([parseCard(member.card), member.name]));
  const [status, setStatus] = useState<"" | "saving" | "saved" | "error">("");

  // open a tab from the URL hash, e.g. /account#pet
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.replace("#", "") as Tab;
      if (TABS.some((t) => t.id === h)) setTab(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);
  const go = (t: Tab) => { setTab(t); history.replaceState(null, "", `#${t}`); };

  const t = tierFor(member.spend);
  const dirty = JSON.stringify([card, name]) !== savedCard;
  const unlocked = unlockedAccessories(t.index);
  const since = new Date(member.createdAt).toLocaleDateString("en-SG", { month: "short", year: "numeric" });

  const save = async () => {
    setStatus("saving");
    const res = await fetch("/api/club/card", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ card, name }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setStatus("error"); return; }
    const c = parseCard(data.card);
    setCard(c); setSavedCard(JSON.stringify([c, name])); setStatus("saved");
    router.refresh();
  };
  const logout = async () => { await fetch("/api/club/logout", { method: "POST" }); router.push("/club"); router.refresh(); };

  const SaveBar = (
    <div className="acct-save">
      <Btn onClick={save} disabled={!dirty || status === "saving"}>{status === "saving" ? "Saving…" : "Save changes · 保存"}</Btn>
      {status === "saved" && !dirty && <span className="save-ok">Saved ✓</span>}
      {status === "error" && <span className="form-err">Couldn&apos;t save. Try again?</span>}
      {dirty && status !== "saving" && <span className="muted small">Unsaved changes</span>}
    </div>
  );

  return (
    <div className="screen account-screen">
      <Header />

      {/* hero: greeting, tier, live card */}
      <section className="acct-hero">
        <div className="wrap acct-hero-inner">
          <div>
            <Label zh="我的会员">My JoyJar Club</Label>
            <h1 className="section-title club-title">Hello, {name.split(" ")[0] || "friend"}.</h1>
            <span className="acct-tier-pill">{t.tier.zh} · {t.tier.en}{t.tier.discount ? ` · ${Math.round(t.tier.discount * 100)}% off` : ""}</span>
            <div className="tier-progress">
              <div className="tier-bar"><span style={{ width: `${Math.round(t.progress * 100)}%` }} /></div>
              <p>{t.next
                ? <>Spend <strong>{priceStr(Math.ceil(t.toNext * 100) / 100)}</strong> more to reach <strong>{t.next.en}</strong> ({Math.round(t.next.discount * 100)}% off).</>
                : <>You&apos;re at the top. <strong>{Math.round(t.tier.discount * 100)}% off</strong> every order.</>}
              </p>
            </div>
            <dl className="acct-stats">
              <div><dt>Member no.</dt><dd>{memberNo(member.num)}</dd></div>
              <div><dt>Member since</dt><dd>{since}</dd></div>
              <div><dt>Total spent</dt><dd>{priceStr(member.spend)}</dd></div>
              <div><dt>Your discount</dt><dd>{t.tier.discount ? `${Math.round(t.tier.discount * 100)}%` : "—"}</dd></div>
            </dl>
          </div>
          <div className="acct-hero-card">
            <MemberCard d={card} name={name} num={member.num} tierIndex={t.index} />
          </div>
        </div>
      </section>

      {/* tabs */}
      <nav className="acct-tabs" aria-label="Account sections">
        <div className="wrap acct-tabs-inner">
          {TABS.map((x) => (
            <button key={x.id} type="button" data-nofish="1" className={`acct-tab ${tab === x.id ? "is-on" : ""}`} onClick={() => go(x.id)}>
              {x.en}<small>{x.zh}</small>
            </button>
          ))}
        </div>
      </nav>

      <section className="acct-body">
        <div className="wrap">
          {tab === "overview" && (
            <div className="acct-overview">
              <div className="acct-panel">
                <h3 className="ck-h">Your perks · 会员福利</h3>
                <ul className="tier-perks">{TIERS.slice(0, t.index + 1).flatMap((x) => x.perks).map((p) => <li key={p}>{p}</li>)}</ul>
                {t.next && (
                  <p className="muted small acct-next">Next up at <strong>{t.next.en}</strong>: {t.next.perks.join(" · ")}</p>
                )}
              </div>
              <div className="acct-panel acct-pet-mini">
                <h3 className="ck-h">{card.petName} says hi 👋</h3>
                <div className="pet-stage pet-stage-sm"><FishMawPet colour={card.petColour} accessory={card.accessory} size={130} bounce /></div>
                <button type="button" className="link-quiet" data-nofish="1" onClick={() => go("pet")}>Dress up your pet →</button>
              </div>
              <div className="acct-panel">
                <h3 className="ck-h">Latest order · 最新订单</h3>
                {orders[0]
                  ? <p className="acct-latest"><strong>{orders[0].num}</strong> · {orders[0].date} · {priceStr(orders[0].total)} <em className={`st st-${orders[0].status}`}>{orders[0].status === "paid" ? "Paid" : "Unpaid"}</em></p>
                  : <p className="muted">No orders yet. Orders you place while logged in count towards your tier.</p>}
                <Btn onClick={() => router.push("/product/jar-6")}>Shop the jars · 选购</Btn>
              </div>
            </div>
          )}

          {tab === "missions" && <MissionsPanel />}

          {tab === "pet" && (
            <div className="acct-split">
              <div>
                <PetPond colour={card.petColour} accessory={card.accessory} name={card.petName} height={400} />
                <p className="muted small" style={{ marginTop: 10 }}>{unlocked.length - 1} of 4 accessories unlocked · more unlock as you move up tiers</p>
              </div>
              <div>
                <Label zh="我的宠物">Your fish maw pet</Label>
                <CardDesigner d={card} onChange={(d) => { setCard(d); setStatus(""); }} tierIndex={t.index} only="pet" />
                {SaveBar}
              </div>
            </div>
          )}

          {tab === "card" && (
            <div className="acct-split">
              <div className="acct-card-preview">
                <MemberCard d={card} name={name} num={member.num} tierIndex={t.index} />
                <p className="club-preview-cap">Live preview · 实时预览</p>
              </div>
              <div className="acct-card-edit">
                <Label zh="设计卡面">Your member card</Label>
                <label className="field">
                  <span className="field-label">Name on card <em>卡面名字</em></span>
                  <input value={name} maxLength={40} onChange={(e) => { setName(e.target.value); setStatus(""); }} />
                </label>
                <CardDesigner d={card} onChange={(d) => { setCard(d); setStatus(""); }} tierIndex={t.index} only="you" />
                <CardDesigner d={card} onChange={(d) => { setCard(d); setStatus(""); }} tierIndex={t.index} only="card" />
                {SaveBar}
              </div>
            </div>
          )}

          {tab === "orders" && (
            <div className="acct-panel">
              <h3 className="ck-h">Your orders · 订单</h3>
              {orders.length === 0 ? (
                <p className="muted">No orders yet. Orders you place while logged in count towards your tier.</p>
              ) : (
                <ul className="club-orders">
                  {orders.map((o) => (
                    <li key={o.num}>
                      <span>{o.num}<em>{o.date}</em></span>
                      <span>{priceStr(o.total)}{o.discount > 0 && <em>saved {priceStr(o.discount)}</em>}<em className={`st st-${o.status}`}>{o.status === "paid" ? "Paid" : "Unpaid"}</em></span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {tab === "settings" && <Settings email={member.email} onLogout={logout} />}
        </div>
      </section>

      <Tiers current={t.index} />
      <Footer />
    </div>
  );
}

function Settings({ email, onLogout }: { email: string; onLogout: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const res = await fetch("/api/club/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current, next }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) { setMsg({ ok: true, text: "Password updated ✓" }); setCurrent(""); setNext(""); }
    else setMsg({ ok: false, text: data.error || "Couldn't update your password." });
  };

  return (
    <div className="acct-overview">
      <div className="acct-panel">
        <h3 className="ck-h">Account · 账户</h3>
        <p className="muted">Signed in as</p>
        <p><strong>{email}</strong></p>
        <Btn variant="ghost" onClick={onLogout}>Log out · 登出</Btn>
      </div>
      <form className="acct-panel" onSubmit={change}>
        <h3 className="ck-h">Change password · 修改密码</h3>
        <label className="field">
          <span className="field-label">Current password</span>
          <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </label>
        <label className="field">
          <span className="field-label">New password</span>
          <input type="password" value={next} onChange={(e) => setNext(e.target.value)} minLength={8} autoComplete="new-password" placeholder="At least 8 characters" required />
        </label>
        {msg && <p className={msg.ok ? "save-ok" : "form-err"}>{msg.text}</p>}
        <Btn type="submit" disabled={busy}>{busy ? "Saving…" : "Update password"}</Btn>
      </form>
      <div className="acct-panel">
        <h3 className="ck-h">Need help? · 帮助</h3>
        <p className="muted">Questions about an order or your membership? Message us on WhatsApp with your member number.</p>
        <Link href="/#faq" className="link-quiet">Read the FAQ →</Link>
      </div>
    </div>
  );
}
