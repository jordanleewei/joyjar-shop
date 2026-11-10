"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout/Shared";
import { Label, Btn } from "@/components/ui/components";
import { MemberCard } from "@/components/club/MemberCard";
import { CardDesigner } from "@/components/club/CardDesigner";
import { TIERS, tierFor, parseCard, DEFAULT_CARD, CardDesign } from "@/lib/club";
import { priceStr } from "@/components/ui/ShopBlocks";

function Tiers({ current = -1 }: { current?: number }) {
  return (
    <section className="club-tiers">
      <div className="wrap">
        <div className="section-head center">
          <Label zh="会员等级">Four tiers</Label>
          <h2 className="section-title">The more you scoop, the more you save.</h2>
          <p className="section-lede">Your tier goes up automatically with every paid order while you&apos;re logged in. Discounts come off the jars, every time.</p>
        </div>
        <div className="tier-grid">
          {TIERS.map((t, i) => (
            <div key={t.id} className={`tier-card ${i === current ? "is-current" : ""} ${i < current ? "is-done" : ""}`}>
              {i === current && <span className="ribbon">You&apos;re here · 当前</span>}
              <span className="tier-zh">{t.zh}</span>
              <h3 className="tier-name">{t.en}</h3>
              <p className="tier-off">{t.discount ? `${Math.round(t.discount * 100)}% off` : "Free to join"}</p>
              <p className="tier-min">{t.min ? `From ${priceStr(t.min)} spent` : "Sign up"}</p>
              <ul className="tier-perks">{t.perks.map((p) => <li key={p}>{p}</li>)}</ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function JoinForm({ card, name, setName }: { card: CardDesign; name: string; setName: (s: string) => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"join" | "login">("join");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    const res = await fetch(`/api/club/${mode === "join" ? "signup" : "login"}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, card }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setErr(data.error || "Something went wrong."); return; }
    router.refresh();
  };

  return (
    <form className="join-form" onSubmit={submit}>
      <h3 className="ck-h">{mode === "join" ? "Join the club · 加入会员" : "Welcome back · 会员登录"}</h3>
      {mode === "join" && (
        <label className="field">
          <span className="field-label">Name on card <em>卡面名字</em></span>
          <input value={name} maxLength={40} onChange={(e) => setName(e.target.value)} placeholder="JoyJar" required />
        </label>
      )}
      <label className="field">
        <span className="field-label">Email <em>邮箱</em></span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="joyjar@email.com" autoComplete="email" required />
      </label>
      <label className="field">
        <span className="field-label">Password <em>密码</em></span>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8}
          autoComplete={mode === "join" ? "new-password" : "current-password"} placeholder={mode === "join" ? "At least 8 characters" : ""} required />
      </label>
      {err && <p className="form-err" role="alert">{err}</p>}
      <Btn type="submit" disabled={busy}>{busy ? "One moment…" : mode === "join" ? "Join the club · 免费加入" : "Log in · 登录"}</Btn>
      <button type="button" className="link-quiet" data-nofish="1" onClick={() => { setErr(""); setMode(mode === "join" ? "login" : "join"); }}>
        {mode === "join" ? "Already a member? Log in" : "New here? Join the club"}
      </button>
    </form>
  );
}

export function ClubClient({ member, orders }: { member: any; orders: any[] }) {
  const router = useRouter();
  const [card, setCard] = useState<CardDesign>(() => member ? parseCard(member.card) : DEFAULT_CARD);
  const [name, setName] = useState<string>(member?.name || "");
  const [saved, setSaved] = useState<"" | "saving" | "saved" | "error">("");

  const t = member ? tierFor(member.spend) : null;

  const save = async () => {
    setSaved("saving");
    const res = await fetch("/api/club/card", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ card, name }) });
    setSaved(res.ok ? "saved" : "error");
    if (res.ok) router.refresh();
  };
  const logout = async () => { await fetch("/api/club/logout", { method: "POST" }); router.refresh(); };

  return (
    <div className="screen club-screen">
      <Header />
      <section className="club-hero">
        <div className="wrap club-hero-inner">
          <div className="club-hero-copy">
            {member ? (
              <>
                <Label zh="小胶傲俱乐部">JoyJar Club</Label>
                <h1 className="section-title club-title">Hello, {member.name.split(" ")[0]}.<br /><em>{t!.tier.en}</em> member.</h1>
                <div className="tier-progress">
                  <div className="tier-bar"><span style={{ width: `${Math.round(t!.progress * 100)}%` }} /></div>
                  <p>{t!.next
                    ? <>Spend <strong>{priceStr(Math.ceil(t!.toNext * 100) / 100)}</strong> more to reach <strong>{t!.next.en}</strong> ({Math.round(t!.next.discount * 100)}% off).</>
                    : <>You&apos;re at the top. <strong>{Math.round(t!.tier.discount * 100)}% off</strong> every order, forever.</>}
                  </p>
                  <p className="tier-spend">Total spent {priceStr(member.spend)}{t!.tier.discount ? ` · your ${Math.round(t!.tier.discount * 100)}% applies at checkout automatically` : ""}</p>
                </div>
              </>
            ) : (
              <>
                <Label zh="小胶傲俱乐部">JoyJar Club</Label>
                <h1 className="section-title club-title">Level up. Get a pet.<br /><em>Save on every jar.</em></h1>
                <p className="section-lede">Free to join. Design your own member card with your avatar and a cute fish maw pet. It lives in your account, forever.</p>
                <div className="club-chips">
                  <span>4 tiers, up to 15% off</span>
                  <span>Your avatar + a fish maw pet</span>
                  <span>Accessories unlock as you level up</span>
                </div>
              </>
            )}
          </div>
          <div className="club-hero-card">
            <MemberCard d={card} name={name} num={member?.num} tierIndex={member?.tierIndex || 0} />
          </div>
        </div>
      </section>

      <section className="club-make">
        <div className="wrap club-make-inner">
          <div className="club-preview">
            <div className="club-preview-sticky">
              <MemberCard d={card} name={name} num={member?.num} tierIndex={member?.tierIndex || 0} />
              <p className="club-preview-cap">Live preview · 实时预览</p>
            </div>
          </div>
          <div className="club-make-main">
          <div className="club-make-design">
            <Label zh="设计卡面">{member ? "Edit your card" : "Step 1 · Design your card"}</Label>
            {member && (
              <label className="field">
                <span className="field-label">Name on card <em>卡面名字</em></span>
                <input value={name} maxLength={40} onChange={(e) => { setName(e.target.value); setSaved(""); }} />
              </label>
            )}
            <CardDesigner d={card} onChange={(d) => { setCard(d); setSaved(""); }} tierIndex={member?.tierIndex || 0} />
            {member && (
              <div className="club-save">
                <Btn onClick={save} disabled={saved === "saving"}>{saved === "saving" ? "Saving…" : "Save my card · 保存"}</Btn>
                {saved === "saved" && <span className="save-ok">Saved ✓</span>}
                {saved === "error" && <span className="form-err">Couldn&apos;t save. Try again?</span>}
              </div>
            )}
          </div>
          <div className="club-make-side">
            {member ? (
              <div className="club-account">
                <h3 className="ck-h">Your orders · 订单</h3>
                {orders.length === 0 ? (
                  <p className="muted">No orders yet. Orders you place while logged in count towards your tier.</p>
                ) : (
                  <ul className="club-orders">
                    {orders.map((o) => (
                      <li key={o.num}><span>{o.num}<em>{o.date}</em></span><span>{priceStr(o.total)}<em className={`st st-${o.status}`}>{o.status === "paid" ? "Paid" : o.status === "pending" ? "Unpaid" : o.status}</em></span></li>
                    ))}
                  </ul>
                )}
                <p className="muted small">Signed in as {member.email}</p>
                <div className="club-acct-actions">
                  <Btn onClick={() => router.push("/product/jar-6")}>Shop the jars · 选购</Btn>
                  <Btn variant="ghost" onClick={logout}>Log out · 登出</Btn>
                </div>
              </div>
            ) : (
              <>
                <Label zh="加入">Step 2 · Save it to your account</Label>
                <JoinForm card={card} name={name} setName={setName} />
              </>
            )}
          </div>
          </div>
        </div>
      </section>

      <Tiers current={member ? member.tierIndex : -1} />
      <Footer />
    </div>
  );
}
