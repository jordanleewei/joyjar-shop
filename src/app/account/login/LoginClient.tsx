"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header, Footer } from "@/components/layout/Shared";
import { Label, Btn } from "@/components/ui/components";
import { MemberCard } from "@/components/club/MemberCard";
import { DEFAULT_CARD } from "@/lib/club";

export function LoginClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    const res = await fetch("/api/club/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setErr(data.error || "Something went wrong."); return; }
    router.push("/account");
    router.refresh();
  };

  return (
    <div className="screen account-screen">
      <Header />
      <section className="login-wrap">
        <div className="wrap login-inner">
          <div className="login-card-art">
            <MemberCard d={DEFAULT_CARD} name="JoyJar" num={1} />
          </div>
          <form className="join-form login-form" onSubmit={submit}>
            <Label zh="会员登录">Member log in</Label>
            <h1 className="section-title login-title">Welcome back.</h1>
            <p className="muted">Log in to see your tier, your card and your fish maw pet.</p>
            <label className="field">
              <span className="field-label">Email <em>邮箱</em></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="joyjar@email.com" autoComplete="email" required />
            </label>
            <label className="field">
              <span className="field-label">Password <em>密码</em></span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </label>
            {err && <p className="form-err" role="alert">{err}</p>}
            <Btn type="submit" disabled={busy}>{busy ? "One moment…" : "Log in · 登录"}</Btn>
            <p className="login-alt">New here? <Link href="/club">Join the club, it&apos;s free →</Link></p>
          </form>
        </div>
      </section>
      <Footer />
    </div>
  );
}
