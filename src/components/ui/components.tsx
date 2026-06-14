"use client";

import React from "react";
import Image from "next/image";

// Cinnabar seal stamp 印章 — auspicious brand mark
export function Seal({ size = 56, style = {} }: { size?: number, style?: React.CSSProperties }) {
  return (
    <div className="seal" style={{ width: size, height: size, ...style }} aria-hidden="true">
      <span className="seal-chars">小膠傲</span>
    </div>
  );
}

// Handmade circular logo badge (transparent PNG)
export function LogoMark({ size = 46, className = "", style = {} }: { size?: number, className?: string, style?: React.CSSProperties }) {
  return (
    <Image src="/assets/logo.png" width={size} height={size} alt="小膠傲 JoyJar"
         className={`logo-img ${className}`} style={style} draggable={false} unoptimized={false} priority={true} />
  );
}

// Thin auspicious wave / cloud divider
export function Wave({ className = "", color }: { className?: string, color?: string }) {
  return (
    <svg className={`wave ${className}`} viewBox="0 0 1200 40" preserveAspectRatio="none"
         style={color ? { color } : undefined} aria-hidden="true">
      <path d="M0,20 C50,4 100,4 150,20 C200,36 250,36 300,20 C350,4 400,4 450,20 C500,36 550,36 600,20 C650,4 700,4 750,20 C800,36 850,36 900,20 C950,4 1000,4 1050,20 C1100,36 1150,36 1200,20"
            fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
    </svg>
  );
}

// Tracked small-caps eyebrow label
export function Label({ children, zh, className = "" }: { children: React.ReactNode, zh?: string, className?: string }) {
  return (
    <div className={`eyebrow ${className}`}>
      {zh && <span className="eyebrow-zh">{zh}</span>}
      <span className="eyebrow-en">{children}</span>
    </div>
  );
}

// Button — carries [data-fish] so clicks spawn fish (unless data-nofish)
export function Btn({ children, variant = "primary", className = "", onClick, type = "button", disabled, ...rest }: any) {
  return (
    <button
      type={type}
      data-fish="1"
      disabled={disabled}
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      {...rest}
    >
      <span className="btn-label">{children}</span>
    </button>
  );
}

export function QtyStepper({ value, onChange, min = 1 }: { value: number, onChange: (v: number) => void, min?: number }) {
  return (
    <div className="qty">
      <button className="qty-btn" data-nofish="1" onClick={() => onChange(Math.max(min, value - 1))} aria-label="Decrease">−</button>
      <span className="qty-val">{value}</span>
      <button className="qty-btn" data-nofish="1" onClick={() => onChange(value + 1)} aria-label="Increase">+</button>
    </div>
  );
}

// ---- Small admin/form controls (shared) ----
export function Toggle({ on, onChange, labels = ["On", "Off"] }: { on: boolean, onChange: (v: boolean) => void, labels?: string[] }) {
  return (
    <button type="button" data-nofish="1" className={`toggle ${on ? "is-on" : ""}`} onClick={() => onChange(!on)}>
      <span className="toggle-track"><span className="toggle-knob" /></span>
      <span className="toggle-label">{on ? labels[0] : labels[1]}</span>
    </button>
  );
}

export function AdminField({ label, zh, value, onChange, placeholder, type = "text", wide, textarea }: any) {
  return (
    <label className={`afield ${wide ? "afield-wide" : ""}`}>
      <span className="afield-label">{label}{zh ? <em> {zh}</em> : null}</span>
      {textarea
        ? <textarea value={value} placeholder={placeholder} rows={2} onChange={(e) => onChange(e.target.value)} />
        : <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />}
    </label>
  );
}
