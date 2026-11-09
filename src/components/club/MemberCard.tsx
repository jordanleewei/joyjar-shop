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
      default: return null;
    }
  })();
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" className="avatar-svg">
      <defs><clipPath id="av-clip"><circle cx="50" cy="50" r="48" /></clipPath></defs>
      <circle cx="50" cy="50" r="48" fill="#fbf6ee" />
      <g clipPath="url(#av-clip)">
        {back}
        <path d="M18,100 C18,80 32,72 50,72 C68,72 82,80 82,100 Z" fill={top} />
        <path d="M42,72 L50,82 L58,72" fill="none" stroke="#fff" strokeOpacity=".5" strokeWidth="2" />
        <rect x="44" y="60" width="12" height="14" rx="5" fill={skin} />
        <ellipse cx="50" cy="46" rx="20" ry="22" fill={skin} />
        {front}
        <path d="M40,48 q3,-3 6,0" stroke="#2c2823" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M54,48 q3,-3 6,0" stroke="#2c2823" strokeWidth="2" fill="none" strokeLinecap="round" />
        <ellipse cx="38" cy="55" rx="4" ry="2.6" fill="#e78a8a" opacity=".55" />
        <ellipse cx="62" cy="55" rx="4" ry="2.6" fill="#e78a8a" opacity=".55" />
        <path d="M45,57 q5,5 10,0" stroke="#9a3f3f" strokeWidth="2" fill="none" strokeLinecap="round" />
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
