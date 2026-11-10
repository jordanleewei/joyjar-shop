"use client";

import React, { useId } from "react";
import {
  SKIN, HAIR_COLOURS, TOPS, CARD_THEMES, PET_COLOURS, TIERS,
  CardDesign, memberNo,
} from "@/lib/club";

export function Avatar({ d, size = 100 }: { d: CardDesign; size?: number }) {
  const clip = "av" + useId().replace(/:/g, "");
  const skin = SKIN[d.skin] || SKIN[0];
  const hair = HAIR_COLOURS[d.hairColour] || HAIR_COLOURS[0];
  const top = TOPS[d.top] || TOPS[0];
  const male = d.look === "m";
  const they = d.look === "t";
  const back = (() => {
    switch (d.hair) {
      case "ponytail": return (
        <g fill={hair}>
          <path d="M66,30 C84,30 86,52 80,70 C77,78 72,80 70,76 C76,62 76,44 64,36 Z" />
        </g>);
      case "braids": return (
        <g fill={hair}>
          <path d="M28,44 C26,26 38,17 50,17 C62,17 74,26 72,44 Z" />
          {[50, 58, 66, 74].map((y) => <React.Fragment key={y}><ellipse cx="27" cy={y} rx="5.2" ry="4.6" /><ellipse cx="73" cy={y} rx="5.2" ry="4.6" /></React.Fragment>)}
          <circle cx="27" cy="80" r="2.4" fill="#b34a30" /><circle cx="73" cy="80" r="2.4" fill="#b34a30" />
        </g>);
      case "wavy": return <path d="M24,46 C22,24 36,14 50,14 C64,14 78,24 76,46 Q83,56 76,65 Q83,75 76,84 L24,84 Q17,75 24,65 Q17,56 24,46 Z" fill={hair} />;
      case "afro": return <circle cx="50" cy="37" r="32" fill={hair} />;
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
      case "ponytail": return (
        <g fill={hair}>
          <path d="M30,42 C29,25 40,18 51,18 C63,18 72,26 70,42 C66,33 58,28 50,29 C42,29 34,34 30,42 Z" />
          <rect x="64" y="30" width="6" height="5" rx="2" fill="#b34a30" transform="rotate(30 67 32)" />
        </g>);
      case "braids": return <path d="M30,42 C30,25 40,19 50,19 C60,19 70,25 70,42 C66,32 56,26 50,25 C44,26 34,32 30,42 Z" fill={hair} />;
      case "wavy": return <path d="M31,44 C31,26 42,20 51,20 C60,20 69,27 69,40 C63,30 55,28 49,30 C45,36 38,40 31,44 Z" fill={hair} />;
      case "afro": return (
        <g fill={hair}>
          {[[35,30],[43,25],[51,24],[59,25],[66,30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} />)}
        </g>);
      // ---- him ----
      case "quiff": return <path d="M30,42 C29,29 35,22 43,19 C48,10 62,9 68,17 C72,23 71,32 70,42 C66,34 60,30 54,30 C46,30 36,34 30,42 Z" fill={hair} />;
      case "manbun": return (
        <g fill={hair}>
          <circle cx="50" cy="13" r="7.5" />
          <path d="M30,42 C29,25 39,20 50,20 C61,20 71,25 70,42 C64,32 56,28 50,28 C44,28 36,32 30,42 Z" />
        </g>);
      case "bowl": return <path d="M28,47 C27,24 39,16 50,16 C61,16 73,24 72,47 L70,40 C62,37 38,37 30,40 Z" fill={hair} />;
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
  const shoulders = male ? "M14,100 C14,79 30,71 50,71 C70,71 86,79 86,100 Z"
    : they ? "M16,100 C16,80 31,72 50,72 C69,72 84,80 84,100 Z"
    : "M18,100 C18,80 32,72 50,72 C68,72 82,80 82,100 Z";
  const W = "#fff", CREAM = "#fbf6ee", GOLD = "#e7c25a";
  // parts drawn under the neck, then trims drawn over it
  const { clothesUnder, clothesOver } = (() => {
    switch (d.clothes) {
      case "shirt": return {
        clothesUnder: <g fill={W} fillOpacity=".5"><circle cx="50" cy="86" r="1.3" /><circle cx="50" cy="93" r="1.3" /></g>,
        clothesOver: <g fill={W} fillOpacity=".75" stroke="#2c2823" strokeOpacity=".15" strokeWidth=".6"><path d="M41,71 L50,79 L44,84 Z" /><path d="M59,71 L50,79 L56,84 Z" /></g>,
      };
      case "hoodie": return {
        clothesUnder: <g>
          <path d="M34,76 C36,70 64,70 66,76 C62,84 38,84 34,76 Z" fill="#000" fillOpacity=".14" />
          <path d="M36,93 L64,93 L62,100 L38,100 Z" fill="#000" fillOpacity=".1" />
        </g>,
        clothesOver: <g stroke={W} strokeOpacity=".8" strokeWidth="1.4" strokeLinecap="round"><line x1="46" y1="77" x2="45" y2="87" /><line x1="54" y1="77" x2="55" y2="87" /></g>,
      };
      case "sweater": return {
        clothesUnder: <path d="M22,88 l4,-3 l4,3 l4,-3 l4,3 l4,-3 l4,3 l4,-3 l4,3 l4,-3 l4,3 l4,-3 l4,3 l4,-3" fill="none" stroke={W} strokeOpacity=".45" strokeWidth="1.6" strokeLinejoin="round" />,
        clothesOver: <path d="M41,72 Q50,79 59,72" fill="none" stroke="#000" strokeOpacity=".18" strokeWidth="3.5" strokeLinecap="round" />,
      };
      case "cardigan": return {
        clothesUnder: <g>
          <path d="M45,72 L55,72 L53,100 L47,100 Z" fill={CREAM} />
          <g fill={W} fillOpacity=".8"><circle cx="44" cy="84" r="1.3" /><circle cx="44" cy="92" r="1.3" /></g>
        </g>,
        clothesOver: <path d="M44,72 Q50,77 56,72" fill="none" stroke={CREAM} strokeWidth="2" />,
      };
      case "tang": return {
        clothesUnder: <g stroke={GOLD} strokeWidth="1.6" strokeLinecap="round">
          <line x1="50" y1="76" x2="50" y2="100" strokeOpacity=".7" />
          <line x1="46" y1="82" x2="54" y2="82" /><line x1="46" y1="88" x2="54" y2="88" /><line x1="46" y1="94" x2="54" y2="94" />
        </g>,
        clothesOver: <rect x="42" y="69" width="16" height="6" rx="2.5" fill={top} stroke={GOLD} strokeWidth="1.4" />,
      };
      case "apron": return {
        clothesUnder: <g>
          <path d="M38,80 L62,80 L65,100 L35,100 Z" fill={CREAM} stroke="#2c2823" strokeOpacity=".15" strokeWidth=".8" />
          <path d="M46,88 h8 v5 h-8 Z" fill="none" stroke="#d48691" strokeWidth="1.2" />
        </g>,
        clothesOver: <g stroke={CREAM} strokeWidth="2.2" strokeLinecap="round"><line x1="39" y1="80" x2="42" y2="73" /><line x1="61" y1="80" x2="58" y2="73" /></g>,
      };
      case "overalls": return {
        clothesUnder: <g>
          <path d={shoulders} fill={CREAM} />
          <path d="M39,83 L61,83 L63,100 L37,100 Z" fill={top} />
          <path d="M45,88 h10 v5 h-10 Z" fill="#000" fillOpacity=".12" />
        </g>,
        clothesOver: <g>
          <g stroke={top} strokeWidth="3.2" strokeLinecap="round"><line x1="40" y1="84" x2="38" y2="73" /><line x1="60" y1="84" x2="62" y2="73" /></g>
          <circle cx="40" cy="83" r="1.6" fill={GOLD} /><circle cx="60" cy="83" r="1.6" fill={GOLD} />
        </g>,
      };
      default: return { // tee
        clothesUnder: null,
        clothesOver: <path d="M43,72 Q50,78 57,72" fill="none" stroke={W} strokeOpacity=".55" strokeWidth="2" />,
      };
    }
  })();
  const facial = (() => {
    if (d.look === "f") return null;
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
      <defs><clipPath id={clip}><circle cx="50" cy="50" r="48" /></clipPath></defs>
      <circle cx="50" cy="50" r="48" fill="#fbf6ee" />
      <g clipPath={`url(#${clip})`}>
        {back}
        <path d={shoulders} fill={top} />
        {clothesUnder}
        <rect x={male ? 43 : 44} y="60" width={male ? 14 : 12} height="14" rx="5" fill={skin} />
        {clothesOver}
        {male
          ? <path d="M30,46 C30,30 39,24 50,24 C61,24 70,30 70,46 C70,60 62,68 50,68 C38,68 30,60 30,46 Z" fill={skin} />
          : <ellipse cx="50" cy="46" rx="20" ry="22" fill={skin} />}
        {front}
        {they && <g stroke={hair} strokeWidth="1.8" strokeLinecap="round"><path d="M38,42 q4,-2 8,0" fill="none" /><path d="M54,42 q4,-2 8,0" fill="none" /></g>}
        {male && <g stroke={hair} strokeWidth="2.6" strokeLinecap="round"><line x1="38" y1="42" x2="46" y2="41" /><line x1="54" y1="41" x2="62" y2="42" /></g>}
        <path d="M40,48 q3,-3 6,0" stroke="#2c2823" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M54,48 q3,-3 6,0" stroke="#2c2823" strokeWidth="2" fill="none" strokeLinecap="round" />
        {!male && <g stroke="#2c2823" strokeWidth="1.4" strokeLinecap="round"><line x1="40" y1="47" x2="38.5" y2="45.5" /><line x1="60" y1="47" x2="61.5" y2="45.5" /></g>}
        <ellipse cx="38" cy="55" rx="4" ry="2.6" fill="#e78a8a" opacity={male ? ".3" : they ? ".42" : ".55"} />
        <ellipse cx="62" cy="55" rx="4" ry="2.6" fill="#e78a8a" opacity={male ? ".3" : they ? ".42" : ".55"} />
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

export function CardPattern({ id, colour }: { id: string; colour: string }) {
  const pid = "pt" + useId().replace(/:/g, "");
  if (!id || id === "plain") return null;
  const tile = (() => {
    switch (id) {
      case "dots": return { w: 18, h: 18, el: <><circle cx="4.5" cy="4.5" r="2.2" /><circle cx="13.5" cy="13.5" r="2.2" /></> };
      case "stripes": return { w: 14, h: 14, el: <path d="M-2,16 L16,-2 M-2,2 L2,-2 M12,16 L16,12" stroke={colour} strokeWidth="3" fill="none" /> };
      case "waves": return { w: 28, h: 14, el: <path d="M0,10 Q7,2 14,10 T28,10" stroke={colour} strokeWidth="1.8" fill="none" /> };
      case "clouds": return { w: 44, h: 30, el: <path d="M6,20 c0,-6 8,-6 8,-1 c0,-7 10,-7 10,0 c4,-3 8,1 5,4 M24,19 c0,4 -6,4 -6,0" stroke={colour} strokeWidth="1.6" fill="none" strokeLinecap="round" /> };
      case "blossom": return { w: 36, h: 36, el: <g transform="translate(10 10)">{[0, 72, 144, 216, 288].map((r) => <circle key={r} cx={3.6 * Math.cos(r * Math.PI / 180)} cy={3.6 * Math.sin(r * Math.PI / 180)} r="2.6" />)}<circle r="1.2" fill="#fff" fillOpacity=".7" /><g transform="translate(18 18) scale(.6)">{[0, 72, 144, 216, 288].map((r) => <circle key={r} cx={3.6 * Math.cos(r * Math.PI / 180)} cy={3.6 * Math.sin(r * Math.PI / 180)} r="2.6" />)}</g></g> };
      case "scales": return { w: 16, h: 10, el: <><path d="M0,10 A8,8 0 0 1 16,10" stroke={colour} strokeWidth="1.4" fill="none" /><path d="M-8,5 A8,8 0 0 1 8,5 M8,5 A8,8 0 0 1 24,5" stroke={colour} strokeWidth="1.4" fill="none" /></> };
      case "checks": return { w: 16, h: 16, el: <><rect width="8" height="16" /><rect width="16" height="8" /></> };
      default: return null;
    }
  })();
  if (!tile) return null;
  return (
    <svg className="mcard-pattern" aria-hidden="true" width="100%" height="100%">
      <defs><pattern id={pid} width={tile.w} height={tile.h} patternUnits="userSpaceOnUse">
        <g fill={colour}>{tile.el}</g>
      </pattern></defs>
      <rect width="100%" height="100%" fill={`url(#${pid})`} />
    </svg>
  );
}

export function MemberCard({ d, name, num, tierIndex = 0, className = "" }: { d: CardDesign; name: string; num?: number | null; tierIndex?: number; className?: string }) {
  const th = CARD_THEMES.find((t) => t.id === d.theme) || CARD_THEMES[0];
  const tier = TIERS[tierIndex] || TIERS[0];
  return (
    <div className={`mcard ${className}`} style={{ "--mc-bg": th.bg, "--mc-deep": th.deep, "--mc-ink": th.ink } as React.CSSProperties}>
      <CardPattern id={d.pattern} colour={th.deep} />
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
