"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminLogin({ ready }: { ready: boolean }) {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setErr(data.error || "Couldn't sign in."); return; }
    router.push("/admin"); router.refresh();
  };
  return (
    <div className="adm-login">
      <form className="adm-card" onSubmit={submit}>
        <p className="adm-brand"><b>小胶傲</b> JoyJar Admin</p>
        <h1>Sign in · 登录</h1>
        <p className="adm-muted">Orders, delivery labels and stock. For the JoyJar team only.</p>
        {!ready && <p className="adm-warn">The admin password hasn&apos;t been set up yet.</p>}
        <label className="adm-field">
          <span>Password</span>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" autoFocus required />
        </label>
        {err && <p className="adm-err" role="alert">{err}</p>}
        <button className="adm-btn" type="submit" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </div>
  );
}
