"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Btn } from "@/components/ui/components";
import { MISSIONS, VOUCHER_RATE, MAX_STACKED } from "@/lib/club";

const BADGE: Record<string, { t: string; bg: string }> = {
  ig_story: { t: "IG", bg: "linear-gradient(135deg,#f5b24f,#d6457a,#7a4fc9)" },
  ig_post: { t: "IG", bg: "linear-gradient(135deg,#f5b24f,#d6457a,#7a4fc9)" },
  facebook: { t: "f", bg: "#3b6fd8" },
  tiktok: { t: "♪", bg: "#1f1b1f" },
  xhs: { t: "小红书", bg: "#e8394a" },
  refer: { t: "💬", bg: "#3f6b3a" },
};

type State = {
  missions: { id: string; done: boolean; left: number }[];
  vouchers: number;
  history: { id: string; mission: string; status: string; reason: string; date: string; used: boolean }[];
};

// Shrink the screenshot in the browser before sending (keeps uploads small).
async function shrink(file: File): Promise<Blob> {
  try {
    const url = URL.createObjectURL(file);
    const img = await new Promise<HTMLImageElement>((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
    const s = Math.min(1, 1600 / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    return await new Promise<Blob>((ok) => c.toBlob((b) => ok(b || file), "image/jpeg", 0.85));
  } catch { return file; }
}

function MissionCard({ m, st, onResult }: { m: typeof MISSIONS[number]; st?: { done: boolean; left: number }; onResult: (s: State) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const b = BADGE[m.id];
  const locked = st ? st.left === 0 : false;

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const pick = (f?: File | null) => {
    setResult(null);
    if (!f) return;
    if (preview) URL.revokeObjectURL(preview);
    setFile(f); setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!file) return;
    setBusy(true); setResult(null);
    const fd = new FormData();
    fd.append("mission", m.id);
    fd.append("proof", await shrink(file), "proof.jpg");
    const res = await fetch("/api/club/missions", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setResult({ ok: false, text: data.error || "Something went wrong." }); return; }
    setResult({ ok: data.approved, text: data.approved ? `Approved! +5% voucher added. ${data.reason}` : `Not approved: ${data.reason}` });
    if (data.approved) { setFile(null); if (preview) URL.revokeObjectURL(preview); setPreview(null); }
    if (data.state) onResult(data.state);
  };

  return (
    <div className={`mission ${st?.done ? "is-done" : ""}`}>
      <div className="mission-top">
        <span className="mission-badge" style={{ background: b.bg }}>{b.t}</span>
        <div className="mission-title"><strong>{m.en}</strong><small>{m.zh}</small></div>
        <span className="mission-reward">+{Math.round(VOUCHER_RATE * 100)}%</span>
      </div>
      <p className="mission-how">{m.how}</p>
      {m.repeat && <p className="mission-meta">Up to {m.repeat.max}× every {m.repeat.days} days{st ? ` · ${st.left} left` : ""}</p>}
      {st?.done ? (
        <p className="mission-done">Completed ✓</p>
      ) : locked ? (
        <p className="mission-meta">Limit reached for now. Check back soon.</p>
      ) : st ? (
        <div className="mission-proof">
          <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} />
          {preview ? (
            <div className="mission-preview">
              {/* local preview only, never uploaded for storage */}
              <img src={preview} alt="Your screenshot" />
              <div className="mission-actions">
                <Btn onClick={submit} disabled={busy}>{busy ? "Checking…" : "Check & claim"}</Btn>
                <button type="button" className="link-quiet" data-nofish="1" onClick={() => input.current?.click()} disabled={busy}>Change</button>
              </div>
            </div>
          ) : (
            <Btn variant="ghost" onClick={() => input.current?.click()}>Upload screenshot · 上传截图</Btn>
          )}
          {busy && <p className="mission-meta">Our AI is checking your screenshot, this takes a few seconds…</p>}
        </div>
      ) : null}
      {result && <p className={result.ok ? "save-ok" : "form-err"}>{result.text}</p>}
    </div>
  );
}

// Members: do missions, see vouchers and recent results.
export function MissionsPanel() {
  const [state, setState] = useState<State | null>(null);
  useEffect(() => { fetch("/api/club/missions").then((r) => r.json()).then(setState).catch(() => {}); }, []);
  const label = (id: string) => MISSIONS.find((m) => m.id === id)?.en || id;

  return (
    <div className="missions">
      <div className="missions-head">
        <div>
          <h3 className="ck-h">Missions · 任务</h3>
          <p className="muted">Each approved mission gives you a one-time <strong>5% off voucher</strong>. Use them at checkout on top of your tier discount, up to <strong>{Math.round(MAX_STACKED * 100)}% off</strong> per order.</p>
        </div>
        <div className="voucher-pill"><b>{state?.vouchers ?? "–"}</b><span>voucher{state?.vouchers === 1 ? "" : "s"} ready</span></div>
      </div>
      <div className="mission-grid">
        {MISSIONS.map((m) => (
          <MissionCard key={m.id} m={m} st={state?.missions.find((x) => x.id === m.id) || { done: false, left: 1 }} onResult={setState} />
        ))}
      </div>
      {state && state.history.length > 0 && (
        <div className="mission-history">
          <h4>Recent submissions</h4>
          <ul>
            {state.history.map((h) => (
              <li key={h.id}>
                <span className={`st st-${h.status}`}>{h.status === "approved" ? (h.used ? "Used" : "Approved") : "Not approved"}</span>
                <strong>{label(h.mission)}</strong>
                <em>{h.reason}</em>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="muted small">Screenshots are checked automatically and are not stored. We only keep whether the mission was approved.</p>
    </div>
  );
}

// Visitors: what missions exist.
export function MissionsPreview() {
  return (
    <section className="missions-section">
      <div className="wrap">
        <div className="section-head center">
          <span className="eyebrow center-eyebrow"><span className="eyebrow-zh">会员任务</span><span className="eyebrow-en">Missions</span></span>
          <h2 className="section-title">Share the joy, earn <em>5% off</em>.</h2>
          <p className="section-lede">Post about JoyJar or recommend us to a friend, upload a screenshot, and get a 5% voucher for each. Stack them with your tier discount, up to {Math.round(MAX_STACKED * 100)}% off an order.</p>
        </div>
        <div className="mission-grid">
          {MISSIONS.map((m) => <MissionCard key={m.id} m={m} onResult={() => {}} />)}
        </div>
        <p className="center muted" style={{ marginTop: 22 }}>
          <Link href="/account/login" className="link-quiet">Already a member? Log in to start missions →</Link>
        </p>
      </div>
    </section>
  );
}
