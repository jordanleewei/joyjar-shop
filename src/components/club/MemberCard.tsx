"use client";

import React from "react";
import {
  SKIN, HAIR_COLOURS, TOPS, CARD_THEMES, PET_COLOURS, TIERS,
  CardDesign, memberNo,
} from "@/lib/club";

export function Avatar({ d, size = 100 }: { d: CardDesign; size?: number }) {
  const skin = SKIN[d.skin] || SKIN[0];
  const hair = HAIR_COLOURS[d.hairColour] || HAIR_COLOURS[0];
  const top = TOPS[d.top] || TOPS[0];
  const male = d.look === "m";
  const back = (() => {
    switch (d.hair) {
      case "long": return <path d="M24,46 C22,24 36,14 50,14 C64,14 78,24 76,46 L80,86 L20,86 Z" fill={hair} />;
      case "curly": return (
        <g fill={hair}>
          {[[30,30],[40,20],[52,17],[64,21],[72,32],[76,45],[24,44],[22,57],[78,58],[27,68],[73,69]].map(([x, y], i) =>
            <circle key={i} cx={x} cy={y} r={11} />)}
        </g>);
      case "bob": return <path d="M25,50 C23,26 36,16 50,16 C64,16 77,26 75,50 L76,66 C70,70 30,70 24,66 Z" fill={hair} />;
      default: return null;
    }
  })();
  const front = (() => {
    switch (d.hair) {
      case "bob": return <path d="M30,40 C32,26 42,21 50,21 C60,21 70,27 70,40 C62,34 48,33 40,36 C36,37 33,39 30,40 Z" fill={hair} />;
      case "bun": return (
        <g fill={hair}>
          <circle cx="50" cy="14" r="10" />
          <path d="M30,42 C30,25 40,19 50,19 C60,19 70,25 70,42 C64,33 56,30 50,30 C44,30 36,33 30,42 Z" />
        </g>);
      case "short": return <path d="M30,42 C29,25 40,18 51,18 C63,18 72,26 70,42 C66,34 58,29 50,30 C42,30 34,35 30,42 Z" fill={hair} />;
      case "long": return <path d="M31,42 C33,27 42,21 50,21 C59,21 68,27 69,42 C62,32 54,29 50,29 C46,33 38,37 31,42 Z" fill={hair} />;
      case "curly": return (
        <g fill={hair}>
          {[[36,30],[46,26],[56,26],[65,31]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={8} />)}
        </g>);
      // ---- him ----
      case "crew": return <path d="M30,42 C29,25 39,19 50,19 C61,19 71,25 70,42 C67,35 62,31 56,31 C50,29 42,30 36,33 C33,35 31,38 30,42 Z" fill={hair} />;
      case "buzz": return <path d="M30,42 C29,25 39,20 50,20 C61,20 71,25 70,42 C64,34 58,31 50,31 C42,31 36,34 30,42 Z" fill={hair} opacity=".6" />;
      case "side": return (
        <g fill={hair}>
          <path d="M29,44 C27,24 41,16 54,17 C67,18 73,28 71,44 C68,35 62,30 54,30 C50,28 47,27 44,26 C38,30 33,36 29,44 Z" />
          <path d="M44,26 C50,22 60,22 66,27" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="1.5" />
        </g>);
      case "spiky": return <path d="M30,43 L30,30 L36,32 L38,20 L45,27 L50,15 L55,26 L62,19 L64,30 L70,29 L70,43 C64,33 56,30 50,30 C43,30 35,34 30,43 Z" fill={hair} />;
      case "mcurly": return (
        <g fill={hair}>
          {[[33,34],[38,25],[46,21],[55,21],[63,25],[68,33],[42,30],[52,28],[60,31]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} />)}
        </g>);
      default: return null;
    }
  })();
  const facial = (() => {
    if (!male) return null;
    switch (d.facial) {
      case "stubble": return <path d="M33,52 C34,64 42,70 50,70 C58,70 66,64 67,52 C62,60 56,62 50,62 C44,62 38,60 33,52 Z" fill={hair} opacity=".22" />;
      case "moustache": return <path d="M42,56 C45,53 48,53 50,55 C52,53 55,53 58,56 C55,57 52,57 50,56 C48,57 45,57 42,56 Z" fill={hair} />;
      case "beard": return (
        <g fill={hair}>
          <path d="M31,48 C31,64 40,72 50,72 C60,72 69,64 69,48 C66,58 60,62 50,62 C40,62 34,58 31,48 Z" />
          <path d="M42,56 C45,53 48,53 50,55 C52,53 55,53 58,56 C55,57 52,57 50,56 C48,57 45,57 42,56 Z" />
        </g>);
      default: return null;
    }
  })();
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="avatar-svg">
      <defs><clipPath id="av-clip"><circle cx="50" cy="50" r="48" /></clipPath></defs>
      <circle cx="50" cy="50" r="48" fill="#fbf6ee" />
      <g clipPath="url(#av-clip)">
        {back}
        <path d={male ? "M14,100 C14,79 30,71 50,71 C70,71 86,79 86,100 Z" : "M18,100 C18,80 32,72 50,72 C68,72 82,80 82,100 Z"} fill={top} />
        {male
          ? <g fill="#fff" fillOpacity=".55"><path d="M40,72 L50,80 L45,86 Z" /><path d="M60,72 L50,80 L55,86 Z" /></g>
          : <path d="M42,72 L50,82 L58,72" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />}
        <rect x={male ? 43 : 44} y="60" width={male ? 14 : 12} height="14" rx="5" fill={skin} />
        {male
          ? <path d="M30,46 C30,30 39,24 50,24 C61,24 70,30 70,46 C70,60 62,68 50,68 C38,68 30,60 30,46 Z" fill={skin} />
          : <ellipse cx="50" cy="46" rx="20" ry="22" fill={skin} />}
        {front}
        {male && <g stroke={hair} strokeWidth="2.6" strokeLinecap="round"><line x1="38" y1="42" x2="46" y2="41" /><line x1="54" y1="41" x2="62" y2="42" /></g>}
        <path d="M40,48 q3,-3 6,0" stroke="#2c2823" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M54,48 q3,-3 6,0" stroke="#2c2823" strokeWidth="2" fill="none" strokeLinecap="round" />
        {!male && <g stroke="#2c2823" strokeWidth="1.4" strokeLinecap="round"><line x1="40" y1="47" x2="38.5" y2="45.5" /><line x1="60" y1="47" x2="61.5" y2="45.5" /></g>}
        <ellipse cx="38" cy="55" rx="4" ry="2.6" fill="#e78a8a" opacity={male ? ".3" : ".55"} />
        <ellipse cx="62" cy="55" rx="4" ry="2.6" fill="#e78a8a" opacity={male ? ".3" : ".55"} />
        {facial}
        <path d="M45,58 q5,5 10,0" stroke="#9a3f3f" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <circle cx="50" cy="50" r="48" fill="none" stroke="#2c2823" strokeOpacity=".18" strokeWidth="1.5" />
    </svg>
  );
}

export function FishMawPet({ colour = "gold", accessory = "none", size = 90, bounce = false }: { colour?: string; accessory?: string; size?: number; bounce?: boolean }) {
  const c = PET_COLOURS.find((p) => p.id === colour) || PET_COLOURS[0];
  return (
    <svg viewBox="0 0 110 90" width={size} height={size * 90 / 110} aria-hidden="true" className={`pet-svg ${bounce ? "pet-bounce" : ""}`}>
      {/* tail fin */}
      <path d="M86,50 C96,40 104,40 106,44 C102,50 102,56 106,62 C102,66 94,64 86,56 Z" fill={c.shade} />
      {/* puffy curled body */}
      <path d="M16,56 C10,36 28,20 52,20 C74,20 92,32 90,52 C88,70 70,78 50,78 C32,78 20,70 16,56 Z" fill={c.fill} stroke={c.shade} strokeWidth="2" />
      <path d="M30,64 C40,72 62,72 74,62" fill="none" stroke={c.shade} strokeWidth="2" strokeLinecap="round" opacity=".7" />
      <path d="M58,26 C66,30 70,36 70,42" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".6" />
      {/* face */}
      <circle cx="40" cy="48" r="3.6" fill="#2c2823" />
      <circle cx="58" cy="48" r="3.6" fill="#2c2823" />
      <circle cx="41.2" cy="46.6" r="1.1" fill="#fff" />
      <circle cx="59.2" cy="46.6" r="1.1" fill="#fff" />
      <ellipse cx="34" cy="56" rx="4.5" ry="2.8" fill="#e78a8a" opacity=".55" />
      <ellipse cx="64" cy="56" rx="4.5" ry="2.8" fill="#e78a8a" opacity=".55" />
      <path d="M45,55 q4,4 8,0" stroke="#2c2823" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* accessory */}
      {accessory === "bow" && (
        <g transform="translate(30 20) rotate(-14)">
          <path d="M0,0 C-10,-8 -12,6 0,2 C12,6 10,-8 0,0 Z" fill="#b34a30" />
          <circle cx="0" cy="1" r="2.6" fill="#8a2f1c" />
        </g>
      )}
      {accessory === "leaf" && (
        <g transform="translate(52 20)">
          <path d="M0,0 L0,-8" stroke="#3f6b3a" strokeWidth="2" />
          <path d="M0,-8 C-10,-16 -14,-6 0,-8 Z" fill="#6e9f5a" />
          <path d="M0,-8 C10,-18 14,-8 0,-8 Z" fill="#88ad6a" />
        </g>
      )}
      {accessory === "star" && (
        <path transform="translate(70 18) scale(.9)" d="M0,-10 L3,-3 L10,-3 L4,2 L6,9 L0,5 L-6,9 L-4,2 L-10,-3 L-3,-3 Z" fill="#bfa063" stroke="#8a6f33" strokeWidth="1" />
      )}
      {accessory === "flower" && (
        <g transform="translate(32 21)">
          {[0, 72, 144, 216, 288].map((r) => <circle key={r} cx={5 * Math.cos(r * Math.PI / 180)} cy={5 * Math.sin(r * Math.PI / 180)} r="4" fill="#f4a3b7" stroke="#d6738c" strokeWidth=".8" />)}
          <circle r="3" fill="#f2c45a" />
        </g>
      )}
      {accessory === "cap" && (
        <g>
          <path d="M36,25 C36,10 66,8 68,24 Z" fill="#3b6fd8" stroke="#2c2823" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M38,24 C30,24 22,26 20,29 C28,30 36,28 40,26 Z" fill="#2f59b0" stroke="#2c2823" strokeWidth="1.4" strokeLinejoin="round" />
          <circle cx="52" cy="11" r="2" fill="#2f59b0" />
        </g>
      )}
      {accessory === "glasses" && (
        <g fill="rgba(255,255,255,.28)" stroke="#2c2823" strokeWidth="2">
          <circle cx="40" cy="48" r="7.5" /><circle cx="58" cy="48" r="7.5" />
          <path d="M47.5,47 Q49,45 50.5,47" fill="none" />
          <path d="M65.5,47 L74,44" fill="none" />
        </g>
      )}
      {accessory === "bowtie" && (
        <g transform="translate(49 70)">
          <path d="M0,0 L-10,-6 L-10,6 Z M0,0 L10,-6 L10,6 Z" fill="#b34a30" stroke="#2c2823" strokeWidth="1.2" strokeLinejoin="round" />
          <circle r="2.6" fill="#8a2f1c" stroke="#2c2823" strokeWidth="1" />
        </g>
      )}
      {accessory === "chef" && (
        <g stroke="#2c2823" strokeWidth="1.3">
          <rect x="40" y="16" width="22" height="9" rx="2" fill="#fff" />
          <circle cx="43" cy="12" r="6" fill="#fff" /><circle cx="51" cy="8" r="7" fill="#fff" /><circle cx="59" cy="12" r="6" fill="#fff" />
          <path d="M40,16 L62,16" stroke="#fff" strokeWidth="3" />
        </g>
      )}
      {accessory === "headphones" && (
        <g stroke="#2c2823" strokeWidth="1.4">
          <path d="M28,42 C26,14 74,12 72,42" fill="none" stroke="#3a3140" strokeWidth="4" />
          <rect x="22" y="38" width="9" height="14" rx="4" fill="#b34a30" />
          <rect x="69" y="38" width="9" height="14" rx="4" fill="#b34a30" />
        </g>
      )}
      {accessory === "tiara" && (
        <g>
          <path d="M36,23 L39,13 L44,19 L50,9 L56,19 L61,13 L64,23 Z" fill="#e8e8f0" stroke="#9aa0b8" strokeWidth="1.2" strokeLinejoin="round" />
          <circle cx="50" cy="15" r="2.6" fill="#d48691" /><circle cx="42" cy="19" r="1.4" fill="#9cc3cf" /><circle cx="58" cy="19" r="1.4" fill="#9cc3cf" />
        </g>
      )}
      {accessory === "halo" && (
        <g>
          <ellipse cx="50" cy="8" rx="17" ry="5" fill="none" stroke="#f2c45a" strokeWidth="6" opacity=".35" />
          <ellipse cx="50" cy="8" rx="17" ry="5" fill="none" stroke="#e7c25a" strokeWidth="3" />
        </g>
      )}
      {accessory === "crown" && (
        <path d="M38,22 L40,8 L47,16 L52,4 L57,16 L64,8 L66,22 Z" fill="#e7c25a" stroke="#8a6f33" strokeWidth="1.4" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export function MemberCard({ d, name, num, tierIndex = 0, className = "" }: { d: CardDesign; name: string; num?: number | null; tierIndex?: number; className?: string }) {
  const th = CARD_THEMES.find((t) => t.id === d.theme) || CARD_THEMES[0];
  const tier = TIERS[tierIndex] || TIERS[0];
  return (
    <div className={`mcard ${className}`} style={{ "--mc-bg": th.bg, "--mc-deep": th.deep, "--mc-ink": th.ink } as React.CSSProperties}>
      <div className="mcard-scallop" aria-hidden="true" />
      <div className="mcard-top">
        <span className="mcard-brand"><b>小胶傲</b> JOYJAR CLUB</span>
        <span className="mcard-tier">{tier.zh} · {tier.en}</span>
      </div>
      <div className="mcard-body">
        <div className="mcard-avatar"><Avatar d={d} size={96} /></div>
        <div className="mcard-id">
          <strong className="mcard-name">{name || "JoyJar"}</strong>
          <span className="mcard-no">{num ? memberNo(num) : "JJ-······"}</span>
          <span className="mcard-pill">Pudding lover · 花胶控</span>
        </div>
      </div>
      <div className="mcard-pet">
        <FishMawPet colour={d.petColour} accessory={d.accessory} size={70} bounce />
        <span className="mcard-petname">{d.petName}</span>
      </div>
    </div>
  );
}
