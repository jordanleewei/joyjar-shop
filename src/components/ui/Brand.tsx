"use client";

import React from "react";
import { Seal, LogoMark } from "./components";

export const LOGO_STYLES = ["seal", "circle", "jar", "monogram", "wave", "stacked", "handmade"];
const CINNABAR = "#b34a30", GOLD_B = "#bfa063", GOLD_BD = "#8a6f33", PAPER_B = "#fbf9f5";

// circular cinnabar seal with a single brand char
export function CircleSeal({ size = 44 }: { size?: number }) {
  return (
    <span className="mark mark-circle" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width="100%" height="100%">
        <circle cx="24" cy="24" r="23" fill="none" stroke={GOLD_B} strokeWidth="1.5" />
        <circle cx="24" cy="24" r="20" fill={CINNABAR} />
        <text x="24" y="32" textAnchor="middle" fontFamily="'Noto Serif TC', serif" fontWeight="600" fontSize="24" fill={PAPER_B}>膠</text>
      </svg>
    </span>
  );
}

// minimalist jar glyph (gold linework, echoes the handmade jar)
export function JarGlyph({ size = 44 }: { size?: number }) {
  return (
    <span className="mark mark-jar" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width="100%" height="100%" fill="none" stroke={GOLD_BD} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round">
        <path d="M14,18 C14,13 18,11 24,11 C30,11 34,13 34,18 L34,37 C34,40 31,42 27,42 L21,42 C17,42 14,40 14,37 Z" />
        <path d="M16,18 C18,15 30,15 32,18" />
        <line x1="24" y1="11" x2="24" y2="8" stroke={CINNABAR} />
        <circle cx="24" cy="29" r="3.2" fill={CINNABAR} stroke="none" />
      </svg>
    </span>
  );
}

// serif monogram in a gold ring
export function Monogram({ size = 44 }: { size?: number }) {
  return (
    <span className="mark mark-monogram" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width="100%" height="100%">
        <circle cx="24" cy="24" r="22.5" fill={PAPER_B} stroke={GOLD_B} strokeWidth="1.5" />
        <circle cx="24" cy="24" r="18.5" fill="none" stroke={GOLD_B} strokeWidth="0.8" opacity="0.6" />
        <text x="24" y="33" textAnchor="middle" fontFamily="'Cormorant Garamond', serif" fontStyle="italic" fontWeight="600" fontSize="26" fill={CINNABAR}>J</text>
      </svg>
    </span>
  );
}

// seigaiha wave badge (gold fans on paper) — directly references the logo pattern
export function WaveBadge({ size = 44 }: { size?: number }) {
  const arcs: any[] = [];
  const fan = (cx: number, cy: number) => [9, 6, 3].forEach((rr, k) =>
    arcs.push(<path key={cx + "-" + cy + "-" + k} d={`M ${cx - rr},${cy} A ${rr} ${rr} 0 0 1 ${cx + rr},${cy}`}
      fill="none" stroke={GOLD_B} strokeWidth="1.1" opacity={0.85 - k * 0.18} />));
  [[14, 22], [24, 22], [34, 22], [19, 30], [29, 30], [24, 38]].forEach(([x, y]) => fan(x, y));
  return (
    <span className="mark mark-wave" style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 48 48" width="100%" height="100%">
        <circle cx="24" cy="24" r="22.5" fill={PAPER_B} stroke={GOLD_B} strokeWidth="1.5" />
        <clipPath id="wavebadge-clip"><circle cx="24" cy="24" r="20.5" /></clipPath>
        <g clipPath="url(#wavebadge-clip)">{arcs}</g>
      </svg>
    </span>
  );
}

function renderMark(style: string, size: number) {
  switch (style) {
    case "circle": return <CircleSeal size={size} />;
    case "jar": return <JarGlyph size={size} />;
    case "monogram": return <Monogram size={size} />;
    case "wave": return <WaveBadge size={size} />;
    case "handmade": return <LogoMark size={size} />;
    case "seal":
    default: return <Seal size={size} />;
  }
}

export function Logo({ onClick, compact = false }: { onClick?: () => void, compact?: boolean }) {
  const style = "circle"; // Fixed brand choice from README
  const size = compact ? 36 : 44;
  return (
    <button className={`logo logo-${style}`} onClick={onClick} data-nofish="1" aria-label="JoyJar home">
      {renderMark(style, size)}
      <span className="logo-text">
        <span className="logo-zh">小膠傲</span>
        <span className="logo-en">JoyJar</span>
      </span>
    </button>
  );
}
