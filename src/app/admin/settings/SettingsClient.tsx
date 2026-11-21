"use client";

import { useState } from "react";

type EmailInfo = { provider: string | null; from: string; inbox: string };

function EmailCard({ email }: { email: EmailInfo }) {
  const [to, setTo] = useState(email.inbox);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const test = async () => {
    setBusy(true); setMsg(null);
    const res = await fetch("/api/admin/email-test", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ to }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setMsg(res.ok ? { ok: true, text: `Test email sent to ${data.to} ✓ Check the inbox (and Spam, the first time).` } : { ok: false, text: data.error || "Couldn't send." });
  };
  return (
    <section className="adm-card adm-settings">
      <h2>Emails · 邮件</h2>
      {email.provider ? (
        <p className="adm-ok-inline">✓ Switched on. Sending from <b>{email.from}</b></p>
      ) : (
        <p className="adm-warn">Not switched on yet{email.from ? ` for ${email.from}` : ""}. The Gmail app password still needs adding.</p>
      )}
      <ul className="adm-list">
        <li><b>Order confirmed</b> → customer, as soon as they pay</li>
        <li><b>New order</b> → {email.inbox || "your shop inbox"}</li>
        <li><b>On the way</b> → customer, when you tap “Mark packed”</li>
        <li><b>Delivered</b> → customer, when you tap “Mark delivered”</li>
      </ul>
      <p className="adm-muted">Only customers who typed an email at checkout get emails. Each email is sent once per order.</p>
      {email.provider && (
        <div className="prd-price-row">
          <label className="adm-field" style={{ flex: "1 1 220px" }}><span>Send a test to</span><input type="email" value={to} onChange={(e) => setTo(e.target.value)} /></label>
          <button type="button" className="adm-btn" data-nofish="1" disabled={busy || !to} onClick={test}>{busy ? "Sending…" : "Send test email"}</button>
        </div>
      )}
      {msg && <p className={msg.ok ? "adm-ok" : "adm-err"} role="status">{msg.text}</p>}
    </section>
  );
}

export function SettingsClient({ email }: { email: EmailInfo }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const mismatch = again.length > 0 && next !== again;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== again) { setMsg({ ok: false, text: "The two new passwords don't match." }); return; }
    setBusy(true); setMsg(null);
    const res = await fetch("/api/admin/password", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ current, next }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg({ ok: false, text: data.error || "Couldn't change the password." }); return; }
    setCurrent(""); setNext(""); setAgain("");
    setMsg({ ok: true, text: "Password changed ✓ Use the new one next time. Any other phones or computers signed in will need to sign in again." });
  };

  return (
    <main className="adm-wrap adm-main">
      <div className="adm-head"><div><h1>Settings · 设置</h1></div></div>
      <div className="adm-settings-grid">
      <EmailCard email={email} />
      <form className="adm-card adm-settings" onSubmit={submit}>
        <h2>Change admin password · 修改密码</h2>
        <p className="adm-muted">Everyone who helps with orders uses this one password. At least 8 characters.</p>
        <label className="adm-field">
          <span>Current password</span>
          <input type={show ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" required />
        </label>
        <label className="adm-field">
          <span>New password</span>
          <input type={show ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)} minLength={8} autoComplete="new-password" required />
        </label>
        <label className="adm-field">
          <span>New password again</span>
          <input type={show ? "text" : "password"} value={again} onChange={(e) => setAgain(e.target.value)} minLength={8} autoComplete="new-password" required aria-invalid={mismatch || undefined} />
        </label>
        {mismatch && <p className="adm-err">These don&apos;t match yet.</p>}
        <label className="stk-toggle"><input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} /> <span>Show passwords</span></label>
        {msg && <p className={msg.ok ? "adm-ok" : "adm-err"} role="status">{msg.text}</p>}
        <button className="adm-btn" type="submit" disabled={busy || mismatch}>{busy ? "Saving…" : "Change password"}</button>
      </form>
      </div>
    </main>
  );
}
