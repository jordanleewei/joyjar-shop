"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout/Shared";
import { Label, Btn } from "@/components/ui/components";
import { MemberCard, FishMawPet } from "@/components/club/MemberCard";
import { CardDesigner } from "@/components/club/CardDesigner";
import { Tiers } from "@/components/club/Tiers";
import { MissionsPanel } from "@/components/club/Missions";
import { PetPond } from "@/components/club/PetPond";
import { PetShop, PetState } from "@/components/club/PetShop";
import { TIERS, tierFor, parseCard, memberNo, CardDesign, ACCESSORIES, TREATS, MISSION_POINTS, REDEEM_BLOCK, REDEEM_VALUE } from "@/lib/club";
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

export function AccountClient({ member, orders, perks, pet }: { member: any; orders: any[]; perks: { welcome: boolean }; pet: PetState }) {
  const [petSt, setPetSt] = useState<PetState>(pet);
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
  const tabsAnchor = useRef<HTMLDivElement>(null);
  const tabsNav = useRef<HTMLElement>(null);
  const go = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", `#${t}`);
    // bring the new section into view: tabs sit at their sticky spot, content right below
    const a = tabsAnchor.current, n = tabsNav.current;
    if (!a || !n) return;
    const stickyTop = parseFloat(getComputedStyle(n).top) || 0;
    const y = a.getBoundingClientRect().top + window.scrollY - stickyTop;
    if (Math.abs(window.scrollY - y) > 4) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
    }
  };

  const t = tierFor(petSt.lifetime);
  const dirty = JSON.stringify([card, name]) !== savedCard;
  const since = new Date(member.createdAt).toLocaleDateString("en-SG", { month: "short", year: "numeric" });

  // feed a treat: update the count straight away, then save
  const feedTreat = (id: string) => {
    setPetSt((s) => ({ ...s, treats: { ...s.treats, [id]: Math.max(0, (s.treats[id] || 0) - 1) } }));
    fetch("/api/club/pet", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "feed", treat: id }) })
      .then((r) => r.ok ? r.json() : null).then((d) => d && setPetSt(d)).catch(() => {});
  };
  const wear = (id: string) => save({ ...card, accessory: id });

  const save = async (next?: CardDesign) => {
    const c0 = next || card;
    if (next) setCard(next);
    setStatus("saving");
    const res = await fetch("/api/club/card", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ card: c0, name }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { setStatus("error"); return; }
    const c = parseCard(data.card);
    setCard(c); setSavedCard(JSON.stringify([c, name])); setStatus("saved");
    router.refresh();
  };
  const logout = async () => { await fetch("/api/club/logout", { method: "POST" }); router.push("/club"); router.refresh(); };

  const SaveBar = (
    <div className="acct-save">
      <Btn onClick={() => save()} disabled={!dirty || status === "saving"}>{status === "saving" ? "Saving…" : "Save changes · 保存"}</Btn>
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
            <span className="acct-tier-pill">{t.tier.zh} · {t.tier.en} member</span>
            <div className="tier-progress">
              <div className="tier-bar"><span style={{ width: `${Math.round(t.progress * 100)}%` }} /></div>
              <p>{t.next
                ? <>Collect <strong>{t.toNext} more points</strong> to reach <strong>{t.next.en}</strong>.</>
                : <>You&apos;re at the top tier. Thank you for being a <strong>Diamond</strong> member 💎</>}
              </p>
            </div>
            <dl className="acct-stats">
              <div><dt>Member no.</dt><dd>{memberNo(member.num)}</dd></div>
              <div><dt>Member since</dt><dd>{since}</dd></div>
              <div><dt>Points to spend</dt><dd>{petSt.balance}</dd></div>
              <div><dt>Lifetime points</dt><dd>{petSt.lifetime}</dd></div>
            </dl>
          </div>
          <div className="acct-hero-card">
            <MemberCard d={card} name={name} num={member.num} tierIndex={t.index} />
          </div>
        </div>
      </section>

      {/* tabs */}
      <div ref={tabsAnchor} aria-hidden="true" />
      <nav ref={tabsNav} className="acct-tabs" aria-label="Account sections">
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
              <PerksPanel tierIndex={t.index} balance={petSt.balance} owned={petSt.owned} welcome={perks.welcome}
                onMissions={() => go("missions")} onPet={() => go("pet")} />
              <div className="acct-panel acct-pet-mini">
                <h3 className="ck-h">{card.petName} says hi 👋</h3>
                <div className="pet-stage pet-stage-sm"><FishMawPet colour={card.petColour} accessory={card.accessory} size={130} bounce /></div>
                <button type="button" className="link-quiet" data-nofish="1" onClick={() => go("pet")}>Dress up your pet →</button>
              </div>
              <div className="acct-panel">
                <h3 className="ck-h">Latest order · 最新订单</h3>
                {orders[0]
                  ? <p className="acct-latest"><strong>{orders[0].num}</strong> · {orders[0].date} · {priceStr(orders[0].total)} <em className={`st st-${orders[0].status}`}>{orders[0].status === "paid" ? "Paid" : "Unpaid"}</em></p>
                  : <p className="muted">No orders yet. Orders you place while logged in earn 1 point for every $1.</p>}
                <Btn onClick={() => router.push("/product/jar-6")}>Shop the jars · 选购</Btn>
              </div>
            </div>
          )}

          {tab === "missions" && <MissionsPanel />}

          {tab === "pet" && (
            <div className="acct-split">
              <div>
                <PetPond colour={card.petColour} accessory={card.accessory} name={card.petName} height={400} treats={petSt.treats} onTreat={feedTreat} />
                <p className="muted small" style={{ marginTop: 10 }}>{petSt.owned.length - 1} of {ACCESSORIES.length - 1} accessories unlocked{TREATS.some((x) => petSt.treats[x.id] > 0) ? " · pick a treat at the bottom of the pond to feed it" : ""}</p>
                <div className="acct-panel" style={{ marginTop: 18 }}>
                  <Label zh="我的宠物">Your fish maw pet</Label>
                  <CardDesigner d={card} onChange={(d) => { setCard(d); setStatus(""); }} tierIndex={t.index} only="pet" owned={petSt.owned} />
                  {SaveBar}
                </div>
              </div>
              <PetShop st={petSt} onChange={setPetSt} wearing={card.accessory} onWear={wear} />
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
                <p className="muted">No orders yet. Orders you place while logged in earn 1 point for every $1.</p>
              ) : (
                <ul className="club-orders">
                  {orders.map((o) => (
                    <li key={o.num}>
                      <span>{o.num}<em>{o.date}</em></span>
                      <span>{priceStr(o.total)}{o.discount > 0 && <em>saved {priceStr(o.discount)}</em>}{o.status === "paid" && o.pointsEarned > 0 && <em>+{o.pointsEarned} pts</em>}<em className={`st st-${o.status}`}>{o.status === "paid" ? "Paid" : "Unpaid"}</em></span>
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

// What the member has right now, plus a peek at what the next tier adds.
function PerksPanel({ tierIndex, balance, owned, welcome, onMissions, onPet }: { tierIndex: number; balance: number; owned: string[]; welcome: boolean; onMissions: () => void; onPet: () => void }) {
  const tier = TIERS[tierIndex];
  const next = TIERS[tierIndex + 1];
  const icon = (id: string) => (ACCESSORIES.find((a) => a.id === id)?.en || "").split(" ")[0];
  const worth = Math.floor(balance / REDEEM_BLOCK) * REDEEM_VALUE;
  const tiles: { k: string; icon: string; title: string; sub: string; action?: () => void; actionLabel?: string; dim?: boolean }[] = [
    { k: "pts", icon: "✨", title: `${balance} points`, sub: worth ? `Worth ${priceStr(worth)} off at checkout (${REDEEM_BLOCK} pts = ${priceStr(REDEEM_VALUE)})` : `${REDEEM_BLOCK - balance > 0 ? REDEEM_BLOCK - balance : 0} more for ${priceStr(REDEEM_VALUE)} off · 1 pt per $1` },
    welcome
      ? { k: "welcome", icon: "%", title: "5% off your first order", sub: "Welcome gift, pick it at checkout" }
      : { k: "welcome", icon: "%", title: "Welcome gift used", sub: "Thanks for your first order 💛", dim: true },
    { k: "missions", icon: "📸", title: `${MISSION_POINTS} points per mission`, sub: "Post about JoyJar or recommend a friend", action: onMissions, actionLabel: "See missions" },
    { k: "pet", icon: "🐟", title: `${owned.length - 1} of ${ACCESSORIES.length - 1} accessories unlocked`, sub: "Free with your tier · treats are 1 point each", action: onPet, actionLabel: "My pet" },
  ];
  return (
    <div className="acct-panel perks-panel">
      <div className="perks-head">
        <h3 className="ck-h">Your perks · 会员福利</h3>
        <span className="perks-tier">{tier.zh} · {tier.en}</span>
      </div>
      <ul className="perk-tiles">
        {tiles.map((x) => (
          <li key={x.k} className={`perk-tile ${x.dim ? "is-dim" : ""}`}>
            <span className="perk-icon" aria-hidden="true">{x.icon}</span>
            <div className="perk-text">
              <strong>{x.title}</strong><small>{x.sub}</small>
              {x.action && <button type="button" className="perk-act" data-nofish="1" onClick={x.action}>{x.actionLabel} →</button>}
            </div>
          </li>
        ))}
      </ul>
      {next ? (
        <div className="perk-next">
          <span className="perk-next-label">Next: {next.zh} · {next.en} at {next.min} pts</span>
          <div className="perk-next-chips">
            <span>{next.en} badge</span>
            <span>{next.unlocks.map(icon).join(" ")} accessories unlocked free</span>
          </div>
        </div>
      ) : (
        <div className="perk-next"><span className="perk-next-label">Top tier reached 💎 Every accessory is open to you.</span></div>
      )}
    </div>
  );
}
