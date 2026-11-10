"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Label, Btn } from "@/components/ui/components";
import { Jar } from "@/components/ui/Jars";
import { PROCESS, SLOGANS, FAQ } from "@/lib/constants";
import { SCENES } from "./Scenes";
import { MemberCard } from "@/components/club/MemberCard";
import { DEFAULT_CARD } from "@/lib/club";

/* ---------------- Slogan ticker ---------------- */
export function Marquee() {
  const row = SLOGANS.flatMap(([en, zh], i) => [
    <span key={"e" + i} className="mq-en">{en}</span>,
    <span key={"z" + i} className="mq-zh">{zh}</span>,
    <span key={"d" + i} className="mq-dot" aria-hidden="true">✦</span>,
  ]);
  return (
    <div className="marquee" aria-label={SLOGANS.map((s) => s[0]).join(", ")}>
      <div className="mq-track" aria-hidden="true">{row}{row}</div>
    </div>
  );
}

/* ---------------- Flavours ---------------- */
export function FlavourShowcase({ products }: { products: any[] }) {
  return (
    <section className="products flavours" id="flavours">
      <div className="wrap">
        <div className="section-head center">
          <Label zh="四款风味">Four Flavours</Label>
          <h2 className="section-title">Pick your jar of joy</h2>
          <p className="section-lede">Every flavour comes in Less Sugar or No Sugar. Enjoy it chilled, or steam it warm.</p>
        </div>
        <div className="flav-grid">
          {products.map((p) => (
            <article className={`flav-card flav-${p.tone}`} key={p.id}>
              <Link href={`/product/${p.id}`} className="flav-jar" data-nofish="1" aria-label={`View ${p.flavorEn}`}>
                <Jar tone={p.tone} size={0.68} label="小胶傲" labelEn={p.cap} />
              </Link>
              <div className="flav-body">
                <div className="flav-name"><h3>{p.flavorEn}</h3><span>{p.flavorZh}</span></div>
                {p.taglineZh && <p className="flav-tag-zh">{p.taglineZh}</p>}
                {p.tagline && <p className="flav-tag">{p.tagline}</p>}
                <p className="flav-blurb">{p.blurb}</p>
                <details className="flav-more">
                  <summary data-nofish="1">Ingredients &amp; allergens · 成分</summary>
                  <p><strong>Ingredients:</strong> {p.ingredients}</p>
                  {p.ingredientsZh && <p className="zh">{p.ingredientsZh}</p>}
                  <p><strong>Allergen advice:</strong> {p.allergens}</p>
                  <p className="muted">Made in Singapore.</p>
                </details>
                <Link href={`/product/${p.id}`} className="flavor-cta" data-nofish="1">Choose {p.flavorEn} · 选购 →</Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- Into our kitchen (autoplay journey) ---------------- */
const STEP_MS = 1500;

export function Journey() {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [cycle, setCycle] = useState(0); // restarts the progress timer
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPlaying(false);
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || !inView) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % PROCESS.length), STEP_MS);
    return () => clearTimeout(t);
  }, [active, playing, inView, cycle]);

  const go = (i: number) => { setActive(i); setCycle((c) => c + 1); };
  const Scene = SCENES[active];
  const s = PROCESS[active];
  const running = playing && inView;

  return (
    <section className="journey" id="kitchen" ref={ref}>
      <div className="wrap">
        <div className="section-head">
          <Label zh="鲜炖之旅">Into our kitchen</Label>
          <h2 className="section-title">Watch our jar <em>being made.</em></h2>
          <p className="section-lede">Seven slow steps, about two days from dried fish maw to your fridge.</p>
        </div>

        <div className="journey-grid">
          <div className="journey-stage">
            <div className="stage-card">
              <span className="stage-step">{String(active + 1).padStart(2, "0")} / {String(PROCESS.length).padStart(2, "0")}</span>
              <span className="stage-time">{s.time}</span>
              <svg viewBox="0 0 400 300" className="stage-svg" key={active} role="img" aria-label={s.en}>
                <Scene />
              </svg>
              <div className="stage-progress">
                <span key={`${active}-${cycle}`} className={running ? "is-running" : ""} style={{ animationDuration: `${STEP_MS}ms` }} />
              </div>
            </div>
            <div className="stage-rail" role="tablist" aria-label="Steps">
              {PROCESS.map((p, i) => (
                <button key={p.id} role="tab" aria-selected={i === active} aria-label={p.en} data-nofish="1"
                  className={`rail-dot ${i === active ? "is-on" : ""} ${i < active ? "is-done" : ""}`} onClick={() => go(i)}>
                  {p.cn}
                </button>
              ))}
            </div>
          </div>

          <div className="jpanel" aria-live="polite">
            <div className="jstep is-on" key={active}>
              <span className="jstep-num">Step {String(active + 1).padStart(2, "0")}</span>
              <h3 className="jstep-title">{s.en} <span>{s.zh}</span></h3>
              <p className="jstep-time">{s.time}</p>
              <p className="jstep-text">{s.text}</p>
              <p className="jstep-zh">{s.textZh}</p>
            </div>
            <div className="jcontrols">
              <button type="button" className="jbtn" data-nofish="1" onClick={() => go((active - 1 + PROCESS.length) % PROCESS.length)} aria-label="Previous step">‹</button>
              <button type="button" className="jbtn jbtn-play" data-nofish="1" onClick={() => { setPlaying((p) => !p); setCycle((c) => c + 1); }}>
                {playing ? "❚❚ Pause" : "▶ Play"}
              </button>
              <button type="button" className="jbtn" data-nofish="1" onClick={() => go((active + 1) % PROCESS.length)} aria-label="Next step">›</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Hear the pop ---------------- */
function playPop() {
  try {
    const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.09);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.5, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
    osc.connect(g).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.14);
    setTimeout(() => ctx.close(), 400);
  } catch {}
}

function PopJarArt() {
  const INK = "#2c2823";
  return (
    <svg viewBox="0 0 360 400" aria-hidden="true" className="pj-svg">
      <defs>
        <linearGradient id="pj-glass" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".14" stopColor="#fff" stopOpacity=".6" />
          <stop offset=".3" stopColor="#fff" stopOpacity=".05" /><stop offset=".86" stopColor="#fff" stopOpacity=".28" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="pj-metal" x1="0" x2="1">
          <stop offset="0" stopColor="#8f887b" /><stop offset=".2" stopColor="#ece7dc" /><stop offset=".5" stopColor="#bdb6a7" />
          <stop offset=".78" stopColor="#f3efe6" /><stop offset="1" stopColor="#8a8377" />
        </linearGradient>
        <radialGradient id="pj-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#e3c27a" stopOpacity=".35" /><stop offset="1" stopColor="#e3c27a" stopOpacity="0" />
        </radialGradient>
        <clipPath id="pj-body"><rect x="86" y="150" width="188" height="214" rx="34" /></clipPath>
      </defs>

      <circle cx="180" cy="230" r="170" fill="url(#pj-halo)" className="pj-halo" />
      <ellipse cx="180" cy="378" rx="104" ry="10" fill="#000" opacity=".35" />

      {/* jar body */}
      <rect x="86" y="150" width="188" height="214" rx="34" fill="#efece5" stroke={INK} strokeWidth="4" />
      <g clipPath="url(#pj-body)">
        <rect x="86" y="196" width="188" height="170" fill="#bcd6a4" />
        <path d="M86,198 C130,186 230,210 274,196 L274,222 L86,222 Z" fill="#d8e8c6" />
        {/* fish maw pieces suspended */}
        <g className="pj-maw">
          <path d="M120,320 c-6,-14 10,-22 24,-18 c14,4 16,16 6,22 c-10,6 -26,6 -30,-4 Z" fill="#f2c45a" stroke="#d49a2a" strokeWidth="2" />
          <path d="M214,334 c-6,-12 8,-20 20,-16 c12,4 14,14 4,20 c-8,4 -22,4 -24,-4 Z" fill="#f2c45a" stroke="#d49a2a" strokeWidth="2" />
          <circle cx="236" cy="296" r="5" fill="#b8322e" /><circle cx="128" cy="292" r="5" fill="#a8743c" />
          <circle cx="176" cy="344" r="4.5" fill="#7fa94a" /><circle cx="250" cy="352" r="4" fill="#7fa94a" />
        </g>
        {/* label */}
        <rect x="86" y="236" width="188" height="56" fill="#3f6b3a" />
        <rect x="86" y="236" width="188" height="56" fill="none" stroke="#bfa063" strokeWidth="1.5" strokeDasharray="2 5" />
        <text x="180" y="266" textAnchor="middle" fontFamily="'Noto Serif SC', serif" fontSize="22" fill="#f4f9ee" letterSpacing="4">小胶傲</text>
        <text x="180" y="284" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontSize="11" fill="#e3c27a" letterSpacing="3">JOYJAR · PANDAN</text>
      </g>
      <rect x="86" y="150" width="188" height="214" rx="34" fill="url(#pj-glass)" />
      <rect x="104" y="166" width="10" height="160" rx="5" fill="#fff" opacity=".35" />

      {/* lid (twists + lifts) */}
      <g className="pj-lid">
        <rect x="78" y="104" width="204" height="54" rx="14" fill="url(#pj-metal)" stroke={INK} strokeWidth="4" />
        {Array.from({ length: 17 }).map((_, i) => (
          <line key={i} className="pj-ridge" x1={92 + i * 11} y1="114" x2={92 + i * 11} y2="150" stroke="#6b6559" strokeWidth="2" opacity=".35" />
        ))}
        <rect x="78" y="104" width="204" height="10" rx="5" fill="#fff" opacity=".35" />
        {/* the safety button: dip when sealed, dome when popped */}
        <path className="pj-dip" d="M150,105 Q180,118 210,105" fill="#9a9386" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path className="pj-dome" d="M150,105 Q180,78 210,105" fill="#f3efe6" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* twist arrows */}
      <g className="pj-twist" fill="none" stroke="#e3c27a" strokeWidth="4" strokeLinecap="round">
        <path d="M58,116 C40,130 44,150 64,160" /><path d="M54,152 L66,162 L52,168" strokeLinejoin="round" />
        <path d="M302,160 C320,146 316,126 296,116" /><path d="M306,124 L294,114 L308,108" strokeLinejoin="round" />
      </g>

      {/* burst lines */}
      <g className="pj-rays" stroke="#e3c27a" strokeWidth="5" strokeLinecap="round">
        {[-70, -40, -12, 12, 40, 70].map((a) => {
          const r = (a - 90) * Math.PI / 180;
          return <line key={a} x1={180 + 46 * Math.cos(r)} y1={86 + 46 * Math.sin(r)} x2={180 + 76 * Math.cos(r)} y2={86 + 76 * Math.sin(r)} />;
        })}
      </g>
      <g className="pj-puffs" fill="#e3c27a" opacity=".85">
        <circle cx="132" cy="70" r="9" /><circle cx="232" cy="64" r="7" /><circle cx="250" cy="92" r="5" /><circle cx="114" cy="96" r="5" />
      </g>
    </svg>
  );
}

export function PopSection() {
  const [state, setState] = useState<"sealed" | "twist" | "popped">("sealed");
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const tap = () => {
    if (state !== "sealed") return;
    setState("twist");
    timers.current.push(window.setTimeout(() => { setState("popped"); playPop(); }, 750));
    timers.current.push(window.setTimeout(() => setState("sealed"), 3600));
  };

  return (
    <section className="pop" id="pop">
      <div className="wrap pop-inner">
        <div className="pop-copy">
          <Label zh="锁鲜小秘密">Freshness secret</Label>
          <h2 className="section-title pop-title">Hear the pop.<br /><em>Trust the pop.</em></h2>
          <p className="pop-lede">Every jar is hot-filled and vacuum sealed in our kitchen, which is why we don&apos;t need preservatives. Tap the jar to try it.</p>
          <ol className="pop-steps">
            <li><strong>Look.</strong> The button in the middle of the lid should be pressed down. That means the vacuum seal is perfect.</li>
            <li><strong>Twist &amp; listen.</strong> You&apos;ll hear a crisp &ldquo;POP!&rdquo; as the button springs up. That&apos;s your opening ceremony.</li>
            <li><strong>Button already up before you open?</strong> Don&apos;t eat it. Message us with your order number and we&apos;ll sort it out.</li>
          </ol>
        </div>
        <div className="pop-stage">
          <button className={`popjar is-${state}`} onClick={tap} data-nofish="1" aria-label="Tap to twist open the jar">
            <PopJarArt />
            <span className="pop-burst" aria-hidden="true">POP!<small>啵</small></span>
            <span className="pj-callout" aria-hidden="true">
              <svg viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="38" fill="#3a332d" stroke="#e3c27a" strokeWidth="2" />
                <rect x="6" y="42" width="68" height="16" fill="#cfc8b9" />
                <path className="pj-dip" d="M22,42 Q40,56 58,42" fill="#9a9386" stroke="#2c2823" strokeWidth="2.5" />
                <path className="pj-dome" d="M22,42 Q40,22 58,42" fill="#f3efe6" stroke="#2c2823" strokeWidth="2.5" />
              </svg>
              <b>{state === "popped" ? "Button up" : "Button down"}</b>
              <small>{state === "popped" ? "按钮弹起 · opened" : "按钮下陷 · sealed ✓"}</small>
            </span>
          </button>
          <p className="pop-hint" aria-live="polite">{state === "popped" ? "That's the sound of a fresh jar." : state === "twist" ? "Twisting…" : "Tap the jar · 点一下"}</p>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Club teaser ---------------- */
export function ClubTeaser() {
  return (
    <section className="club-teaser">
      <div className="wrap club-teaser-inner">
        <div className="club-teaser-card">
          <MemberCard d={DEFAULT_CARD} name="JoyJar" num={1} />
        </div>
        <div className="club-teaser-copy">
          <Label zh="小胶傲俱乐部">JoyJar Club</Label>
          <h2 className="section-title">Level up. Get a pet.<br /><em>Save on every jar.</em></h2>
          <p className="section-lede">Free to join. Design your own member card with your avatar and a cute fish maw pet. It lives in your account, forever.</p>
          <div className="club-chips">
            <span>5% off your first order</span>
            <span>Up to 35% off with tiers + missions</span>
            <span>Your avatar + a fish maw pet</span>
            <span>Pearl → Jade → Gold → Diamond</span>
          </div>
          <Link href="/club" passHref legacyBehavior>
            <Btn as="a">Join the club · 加入会员</Btn>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
export function Faq() {
  return (
    <section className="faq" id="faq">
      <div className="wrap faq-inner">
        <div className="section-head">
          <Label zh="问答">FAQ</Label>
          <p className="section-lede">Something else on your mind? Message us on WhatsApp after you order and we&apos;ll get back to you.</p>
        </div>
        <div className="faq-list">
          {FAQ.map((f, i) => (
            <details key={i} className="faq-item">
              <summary data-nofish="1"><span>{f.q}</span><em>{f.qZh}</em></summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
