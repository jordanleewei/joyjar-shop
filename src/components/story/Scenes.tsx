"use client";

import React from "react";

// Hand-drawn kitchen scenes for the "Into our kitchen" journey. viewBox 400×300.
const INK = "#2c2823", GOLD = "#bfa063", GOLD_DK = "#8a6f33", CIN = "#b34a30", PAPER = "#fbf9f5", MAW = "#f2c45a", MAW_DK = "#d49a2a";
const sw = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Counter() {
  return (
    <g>
      <rect x="0" y="250" width="400" height="50" fill="#efe6d6" />
      <line x1="0" y1="250" x2="400" y2="250" {...sw} />
      {[40, 120, 200, 280, 360].map((x) => <line key={x} x1={x} y1="262" x2={x - 20} y2="300" stroke={GOLD} strokeWidth="1.2" opacity=".5" />)}
    </g>
  );
}

function Maw({ x, y, s = 1, r = 0 }: { x: number; y: number; s?: number; r?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M-22,4 C-24,-10 -8,-16 4,-14 C18,-12 26,-2 20,8 C14,16 -16,16 -22,4 Z" fill={MAW} stroke={MAW_DK} strokeWidth="2" />
      <path d="M-12,4 C-4,10 8,10 14,2" fill="none" stroke={MAW_DK} strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Steam({ x, y, n = 3 }: { x: number; y: number; n?: number }) {
  return (
    <g className="sc-steam">
      {Array.from({ length: n }).map((_, i) => (
        <path key={i} d={`M${x + i * 26},${y} c-10,-14 10,-22 0,-38 c-8,-12 6,-20 2,-30`} fill="none" stroke={GOLD} strokeWidth="3" strokeLinecap="round"
          style={{ animationDelay: `${i * 0.5}s` }} />
      ))}
    </g>
  );
}

function Ginger({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="0" rx="14" ry="9" fill="#f3dfa8" stroke={GOLD_DK} strokeWidth="2" />
      <ellipse cx="0" cy="0" rx="7" ry="4" fill="none" stroke={GOLD_DK} strokeWidth="1.2" opacity=".6" />
    </g>
  );
}

export function SceneSteam() {
  return (
    <g>
      <Counter />
      <Steam x={168} y={92} n={3} />
      {/* pot */}
      <path d="M118,200 L282,200 L272,248 L128,248 Z" fill="#4a4048" {...sw} />
      <rect x="104" y="196" width="22" height="10" rx="5" fill="#4a4048" {...sw} />
      <rect x="274" y="196" width="22" height="10" rx="5" fill="#4a4048" {...sw} />
      {/* bamboo steamer tiers */}
      <rect x="126" y="160" width="148" height="40" rx="8" fill="#e8c88a" {...sw} />
      <line x1="134" y1="180" x2="266" y2="180" stroke={GOLD_DK} strokeWidth="2" strokeDasharray="7 6" />
      <rect x="126" y="120" width="148" height="40" rx="8" fill="#e8c88a" {...sw} />
      <line x1="134" y1="140" x2="266" y2="140" stroke={GOLD_DK} strokeWidth="2" strokeDasharray="7 6" />
      <path d="M126,120 C140,96 260,96 274,120 Z" fill="#d9b06a" {...sw} />
      <circle cx="200" cy="100" r="6" fill={CIN} {...sw} />
      <Ginger x={320} y={238} />
      <Ginger x={346} y={242} />
      <Maw x={70} y={236} s={0.9} r={-8} />
    </g>
  );
}

export function SceneChill() {
  return (
    <g>
      <Counter />
      {/* bowl */}
      <path d="M90,150 L310,150 C306,210 268,248 200,248 C132,248 94,210 90,150 Z" fill="#dcebf0" {...sw} />
      <path d="M100,166 C150,176 250,176 300,166" fill="none" stroke="#9cc3cf" strokeWidth="3" />
      <g className="sc-bob">
        <Maw x={160} y={196} s={0.9} r={10} />
        <Maw x={232} y={204} s={0.85} r={-12} />
      </g>
      <g className="sc-bob sc-bob-2">
        {[[130, 160], [190, 156], [256, 162], [214, 176]].map(([x, y], i) => (
          <rect key={i} x={x} y={y} width="26" height="26" rx="5" fill="#fff" stroke="#9cc3cf" strokeWidth="2.5" transform={`rotate(${i * 13} ${x + 13} ${y + 13})`} opacity=".92" />
        ))}
        <g transform="translate(286 170)">
          <circle r="16" fill="#f6e27a" stroke={GOLD_DK} strokeWidth="2.5" />
          {[0, 60, 120].map((a) => <line key={a} x1="0" y1="0" x2={14 * Math.cos(a * Math.PI / 180)} y2={14 * Math.sin(a * Math.PI / 180)} stroke={GOLD_DK} strokeWidth="1.5" />)}
        </g>
      </g>
      {/* snowflake + timer */}
      <g transform="translate(72 84)" className="sc-spin" stroke="#7fb0c0" strokeWidth="3" strokeLinecap="round">
        {[0, 60, 120].map((a) => <line key={a} x1={-16 * Math.cos(a * Math.PI / 180)} y1={-16 * Math.sin(a * Math.PI / 180)} x2={16 * Math.cos(a * Math.PI / 180)} y2={16 * Math.sin(a * Math.PI / 180)} />)}
      </g>
      <g transform="translate(320 80)">
        <circle r="30" fill={PAPER} {...sw} />
        <path d="M0,-30 A30,30 0 1,1 -26,15 L0,0 Z" fill={GOLD} opacity=".35" />
        <line x1="0" y1="0" x2="0" y2="-20" {...sw} className="sc-hand" />
        <text y="52" textAnchor="middle" fontSize="15" fontFamily="Hanken Grotesk, sans-serif" fill={INK} fontWeight="600">12–24 h</text>
      </g>
    </g>
  );
}

export function ScenePrep() {
  const bowl = (x: number, fill: string, children: React.ReactNode) => (
    <g transform={`translate(${x} 0)`}>
      {children}
      <path d="M-50,196 L50,196 C46,228 28,246 0,246 C-28,246 -46,228 -50,196 Z" fill={fill} {...sw} />
    </g>
  );
  return (
    <g>
      <Counter />
      {bowl(90, "#f1ede5", <g className="sc-pop">{[[-26, 188], [-12, 182], [4, 186], [18, 180], [30, 188], [-4, 176], [10, 190], [-20, 194]].map(([x, y], i) =>
        <ellipse key={i} cx={x} cy={y} rx="7" ry="5.5" fill="#7fa94a" stroke="#4d6e2a" strokeWidth="1.5" />)}</g>)}
      {bowl(200, "#f1ede5", <g className="sc-pop" style={{ animationDelay: ".3s" }}>{[[-24, 186], [-6, 180], [12, 186], [28, 190], [2, 192], [-16, 194]].map(([x, y], i) =>
        <ellipse key={i} cx={x} cy={y} rx="10" ry="7" fill="#b8322e" stroke="#7a1f1c" strokeWidth="1.5" transform={`rotate(${i * 25} ${x} ${y})`} />)}</g>)}
      {bowl(310, "#f1ede5", <g className="sc-pop" style={{ animationDelay: ".6s" }}>{[[-22, 188], [-4, 182], [14, 188], [28, 192], [4, 194], [-16, 195]].map(([x, y], i) =>
        <circle key={i} cx={x} cy={y} r="8" fill="#a8743c" stroke="#6b4520" strokeWidth="1.5" />)}</g>)}
      {[["绿豆", 90], ["红枣", 200], ["桂圆", 310]].map(([t, x]) => (
        <text key={t as string} x={x as number} y="282" textAnchor="middle" fontSize="16" fontFamily="'Noto Serif SC', serif" fill={INK}>{t}</text>
      ))}
      {/* water drops */}
      <g className="sc-drip" fill="#9cc3cf">
        <path d="M150,70 c-6,10 -8,14 -8,18 a8,8 0 0,0 16,0 c0,-4 -2,-8 -8,-18 Z" />
        <path d="M250,96 c-5,8 -6,11 -6,14 a6,6 0 0,0 12,0 c0,-3 -1,-6 -6,-14 Z" />
      </g>
    </g>
  );
}

export function SceneStew() {
  return (
    <g>
      <Counter />
      {/* flame */}
      <g className="sc-flame">
        <path d="M170,250 C164,236 176,228 174,216 C186,226 188,240 182,250 Z" fill="#f2a33a" />
        <path d="M196,250 C188,232 202,222 200,206 C216,220 216,240 208,250 Z" fill={CIN} />
        <path d="M222,250 C216,236 228,228 226,216 C238,226 240,240 234,250 Z" fill="#f2a33a" />
      </g>
      {/* outer pot */}
      <path d="M100,110 L300,110 L290,214 C288,224 280,230 270,230 L130,230 C120,230 112,224 110,214 Z" fill="#4a4048" {...sw} />
      <rect x="84" y="118" width="22" height="12" rx="6" fill="#4a4048" {...sw} />
      <rect x="294" y="118" width="22" height="12" rx="6" fill="#4a4048" {...sw} />
      <path d="M108,140 C150,148 250,148 292,140" fill="none" stroke="#9cc3cf" strokeWidth="3" />
      {/* inner stewing pot 炖盅 */}
      <path d="M150,96 L250,96 L244,200 C243,208 236,212 228,212 L172,212 C164,212 157,208 156,200 Z" fill={PAPER} {...sw} />
      <rect x="150" y="150" width="100" height="18" fill={CIN} opacity=".85" />
      <text x="200" y="164" textAnchor="middle" fontSize="13" fontFamily="'Noto Serif SC', serif" fill={PAPER} letterSpacing="3">小胶傲</text>
      <path d="M142,96 C150,74 250,74 258,96 Z" fill={PAPER} {...sw} />
      <circle cx="200" cy="74" r="7" fill={GOLD} {...sw} />
      <g className="sc-bubbles" fill="#fff" stroke="#9cc3cf" strokeWidth="2">
        <circle cx="126" cy="170" r="5" /><circle cx="276" cy="186" r="4" /><circle cx="132" cy="196" r="3.5" style={{ animationDelay: ".8s" }} />
      </g>
      <Steam x={124} y={96} n={1} />
      <Steam x={268} y={96} n={1} />
      <g transform="translate(340 70)">
        <circle r="26" fill={PAPER} {...sw} />
        <line x1="0" y1="0" x2="0" y2="-16" {...sw} />
        <line x1="0" y1="0" x2="12" y2="0" {...sw} className="sc-hand" />
        <text y="46" textAnchor="middle" fontSize="15" fontFamily="Hanken Grotesk, sans-serif" fill={INK} fontWeight="600">1 hour</text>
      </g>
    </g>
  );
}

export function SceneFinish() {
  return (
    <g>
      <Counter />
      {/* open stewing pot */}
      <path d="M130,150 L270,150 L262,236 C261,244 254,248 246,248 L154,248 C146,248 139,244 138,236 Z" fill={PAPER} {...sw} />
      <ellipse cx="200" cy="152" rx="70" ry="12" fill="#f4ecd6" {...sw} />
      <Maw x={178} y={152} s={0.6} r={-6} />
      <Maw x={222} y={154} s={0.55} r={12} />
      {/* milk jug pouring */}
      <g transform="rotate(-28 280 70)">
        <path d="M250,40 L310,40 L306,110 C305,118 298,122 290,122 L270,122 C262,122 255,118 254,110 Z" fill="#fff" {...sw} />
        <path d="M250,40 L240,32" {...sw} />
        <path d="M310,56 C330,58 330,92 308,94" fill="none" {...sw} />
        <rect x="254" y="70" width="52" height="40" fill="#f6efe0" />
      </g>
      <path className="sc-pour" d="M222,64 C214,90 210,112 208,146" fill="none" stroke="#f6efe0" strokeWidth="8" strokeLinecap="round" />
      <path className="sc-pour" d="M222,64 C214,90 210,112 208,146" fill="none" stroke={INK} strokeWidth="1" opacity=".2" />
      {/* sugar spoon */}
      <g transform="translate(80 200) rotate(-20)">
        <ellipse cx="0" cy="0" rx="22" ry="13" fill="#f6efe0" {...sw} />
        <line x1="20" y1="4" x2="70" y2="20" {...sw} strokeWidth="5" />
        {[[-8, -4], [0, -6], [8, -3], [-2, 2]].map(([x, y], i) => <rect key={i} x={x} y={y} width="6" height="6" fill="#fff" stroke={GOLD_DK} strokeWidth="1" />)}
      </g>
      <text x="80" y="160" textAnchor="middle" fontSize="15" fontFamily="'Noto Serif SC', serif" fill={CIN}>少糖 / 无糖</text>
    </g>
  );
}

export function SceneSeal() {
  return (
    <g>
      <Counter />
      <g className="sc-heat" stroke={CIN} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7">
        <path d="M110,200 c-8,-10 8,-18 0,-30 c-6,-10 6,-16 2,-26" />
        <path d="M290,200 c-8,-10 8,-18 0,-30 c-6,-10 6,-16 2,-26" style={{ animationDelay: ".6s" }} />
      </g>
      {/* jar */}
      <rect x="140" y="104" width="120" height="144" rx="20" fill="#efece5" {...sw} />
      <rect x="146" y="132" width="108" height="110" rx="14" fill="#bcd6a4" />
      <rect x="140" y="168" width="120" height="50" fill="#3f6b3a" />
      <text x="200" y="198" textAnchor="middle" fontSize="18" fontFamily="'Noto Serif SC', serif" fill="#f4f9ee" letterSpacing="2">小胶傲</text>
      {/* lid */}
      <rect x="146" y="78" width="108" height="32" rx="9" fill="#d8d3c8" {...sw} />
      <g className="sc-button">
        <ellipse cx="200" cy="78" rx="18" ry="6" fill="#c2bcae" {...sw} />
      </g>
      <g className="sc-arrow" stroke={GOLD_DK} strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M200,22 L200,56" /><path d="M190,46 L200,58 L210,46" />
      </g>
      <text x="318" y="96" fontSize="14" fontFamily="Hanken Grotesk, sans-serif" fill={INK} fontWeight="600">vacuum</text>
      <text x="318" y="114" fontSize="14" fontFamily="Hanken Grotesk, sans-serif" fill={INK} fontWeight="600">sealed ✓</text>
    </g>
  );
}

export function SceneFridge() {
  const tones = [["#bcd6a4", "#3f6b3a"], ["#5b5260", "#2a2330"], ["#d8dcb8", "#7d7a4a"], ["#e6bcc0", "#9a3f54"]];
  const jar = (x: number, y: number, t: string[]) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="8" width="30" height="36" rx="6" fill="#efece5" stroke={INK} strokeWidth="2" />
      <rect x="2" y="16" width="26" height="26" rx="4" fill={t[0]} />
      <rect x="0" y="24" width="30" height="10" fill={t[1]} />
      <rect x="2" y="0" width="26" height="10" rx="3" fill="#d8d3c8" stroke={INK} strokeWidth="2" />
    </g>
  );
  return (
    <g>
      <Counter />
      <rect x="110" y="30" width="180" height="220" rx="16" fill="#eef4f5" {...sw} />
      <line x1="110" y1="100" x2="290" y2="100" {...sw} />
      <line x1="122" y1="160" x2="278" y2="160" stroke={INK} strokeWidth="2" opacity=".5" />
      <line x1="122" y1="214" x2="278" y2="214" stroke={INK} strokeWidth="2" opacity=".5" />
      {tones.map((t, i) => jar(130 + i * 38, 116, t))}
      {tones.map((t, i) => jar(130 + i * 38, 170, tones[(i + 2) % 4]))}
      {/* open door */}
      <path d="M290,30 L350,48 L350,236 L290,250 Z" fill="#e2ecee" {...sw} />
      <line x1="338" y1="110" x2="338" y2="160" {...sw} strokeWidth="5" />
      {/* frost */}
      <g className="sc-twinkle" fill="#fff" stroke="#9cc3cf" strokeWidth="1.5">
        <circle cx="140" cy="60" r="4" /><circle cx="250" cy="70" r="3" style={{ animationDelay: ".5s" }} /><circle cx="200" cy="50" r="2.5" style={{ animationDelay: "1s" }} />
      </g>
      <g transform="translate(60 120)">
        <rect x="-8" y="-50" width="16" height="90" rx="8" fill={PAPER} {...sw} />
        <circle cx="0" cy="50" r="14" fill="#7fb0c0" {...sw} />
        <rect x="-3" y="0" width="6" height="44" fill="#7fb0c0" />
        <text x="0" y="90" textAnchor="middle" fontSize="15" fontFamily="Hanken Grotesk, sans-serif" fill={INK} fontWeight="600">0–4°C</text>
      </g>
    </g>
  );
}

export const SCENES = [SceneSteam, SceneChill, ScenePrep, SceneStew, SceneFinish, SceneSeal, SceneFridge];
