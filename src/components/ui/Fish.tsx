"use client";

import React, { useEffect } from "react";

// ---- Shared geometry (viewBox 0 0 140 96), fish faces RIGHT ----
const FISH_VIEWBOX = "0 0 140 96";

function fishInner(kind: "koi" | "blue") {
  const koi = {
    body: "#fbf6ee", belly: "#ffffff", fin: "#f1dcc6",
    patchA: "#c2452c", patchB: "#b58440", line: "#e7c9a6", eye: "#2c2823",
  };
  const blue = {
    body: "#6f9cc4", belly: "#cfe0ee", fin: "#a7c6e0",
    patchA: "#34567d", patchB: "#5a87b4", line: "#bcd6ea", eye: "#1f2d3a",
  };
  const c = kind === "blue" ? blue : koi;
  return `
    <!-- tail -->
    <path d="M46,48 C30,34 18,28 7,30 C15,40 16,44 14,48 C16,52 15,56 7,66 C18,68 31,60 46,48 Z"
          fill="${c.fin}" opacity="0.92"/>
    <!-- dorsal fin -->
    <path d="M70,26 C80,12 95,11 102,18 C93,21 86,25 81,31 Z" fill="${c.fin}" opacity="0.92"/>
    <!-- pelvic fin -->
    <path d="M82,64 C82,78 93,82 100,77 C93,73 90,69 90,63 Z" fill="${c.fin}" opacity="0.92"/>
    <!-- body -->
    <path d="M120,48 C110,28 88,21 66,25 C53,27 45,36 43,48 C45,60 53,69 66,71 C88,75 110,68 120,48 Z"
          fill="${c.body}"/>
    <!-- belly highlight -->
    <path d="M66,71 C53,69 45,60 43,48 C58,54 86,56 116,53 C108,65 88,75 66,71 Z"
          fill="${c.belly}" opacity="0.55"/>
    <!-- patches -->
    <ellipse cx="86" cy="40" rx="11" ry="8" fill="${c.patchA}" opacity="0.92"/>
    <ellipse cx="66" cy="52" rx="8" ry="6" fill="${c.patchB}" opacity="0.85"/>
    <circle cx="100" cy="56" r="4.5" fill="${c.patchA}" opacity="0.7"/>
    <!-- gill line -->
    <path d="M104,33 C100,42 100,54 105,62" stroke="${c.line}" stroke-width="2"
          fill="none" stroke-linecap="round" opacity="0.8"/>
    <!-- eye -->
    <circle cx="113" cy="44" r="3.4" fill="${c.eye}"/>
    <circle cx="114.2" cy="42.8" r="1.1" fill="#fff" opacity="0.85"/>
  `;
}

export function fishMarkup(kind: "koi" | "blue") {
  return `<svg viewBox="${FISH_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">${fishInner(kind)}</svg>`;
}

// React component for decorative use
export function FishSVG({ kind = "koi", className = "", style = {} }: { kind?: "koi" | "blue", className?: string, style?: React.CSSProperties }) {
  return (
    <svg viewBox={FISH_VIEWBOX} className={className} style={style}
         dangerouslySetInnerHTML={{ __html: fishInner(kind) }} />
  );
}

// ---- Animation layer ----
function fishLayer() {
  if (typeof window === "undefined") return null;
  let layer = document.getElementById("fish-layer");
  if (!layer) {
    layer = document.createElement("div");
    layer.id = "fish-layer";
    layer.style.cssText =
      "position:fixed;inset:0;pointer-events:none;z-index:9000;overflow:hidden;";
    document.body.appendChild(layer);
  }
  return layer;
}

function makeFishEl(kind: "koi" | "blue", size: number) {
  const el = document.createElement("div");
  el.className = "spawn-fish";
  el.style.cssText =
    `position:absolute;width:${size}px;height:${size * 0.69}px;` +
    `will-change:transform,opacity;filter:drop-shadow(0 6px 10px rgba(60,40,20,.18));`;
  el.innerHTML = fishMarkup(kind);
  return el;
}

const rnd = (a: number, b: number) => a + Math.random() * (b - a);
const pickKind = () => (Math.random() < 0.5 ? "koi" : "blue");

// Splash on click: a ripple ring, a few droplets and a ring of fish darting outward.
export function spawnBurst(x: number, y: number, _motion = "auto", count = 6) {
  if (typeof window === "undefined") return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = fishLayer();
  if (!layer) return;
  const ease = "cubic-bezier(.12,.75,.3,1)"; // fast pop, soft landing

  // ripple ring
  const ring = document.createElement("div");
  ring.style.cssText = `position:absolute;left:${x - 22}px;top:${y - 22}px;width:44px;height:44px;border-radius:50%;` +
    `border:2px solid rgba(111,156,196,.55);box-shadow:0 0 0 1px rgba(191,160,99,.25) inset;pointer-events:none;`;
  layer.appendChild(ring);
  ring.animate([
    { transform: "scale(.2)", opacity: 0.9 },
    { transform: "scale(2.6)", opacity: 0 },
  ], { duration: 650, easing: "cubic-bezier(.2,.7,.3,1)", fill: "both" }).onfinish = () => ring.remove();

  // droplets
  for (let i = 0; i < 7; i++) {
    const a = rnd(0, Math.PI * 2), dist = rnd(26, 58), r = rnd(3, 6);
    const d = document.createElement("div");
    d.style.cssText = `position:absolute;left:${x - r}px;top:${y - r}px;width:${r * 2}px;height:${r * 2}px;border-radius:50%;` +
      `background:${Math.random() < 0.5 ? "rgba(111,156,196,.7)" : "rgba(231,201,166,.85)"};pointer-events:none;`;
    layer.appendChild(d);
    d.animate([
      { transform: "translate(0,0) scale(.4)", opacity: 1 },
      { transform: `translate(${Math.cos(a) * dist}px, ${Math.sin(a) * dist + 14}px) scale(1)`, opacity: 0 },
    ], { duration: rnd(420, 620), easing: ease, fill: "both" }).onfinish = () => d.remove();
  }

  // fish fan out evenly around the point, each facing the way it swims
  const base = rnd(0, 360);
  for (let i = 0; i < count; i++) {
    const kind = pickKind();
    const size = rnd(30, 46);
    const h = size * 0.69;
    const el = makeFishEl(kind, size);
    el.style.left = (x - size / 2) + "px";
    el.style.top = (y - h / 2) + "px";
    layer.appendChild(el);

    const deg = base + (360 / count) * i + rnd(-14, 14);
    const rad = deg * Math.PI / 180;
    const dist = rnd(70, 120);
    const dx = Math.cos(rad) * dist, dy = Math.sin(rad) * dist;
    const flip = Math.cos(rad) < 0 ? " scaleY(-1)" : ""; // keep fish upright when heading left
    const wig = rnd(6, 12);
    const frames = [
      { transform: `translate(0px,0px) rotate(${deg}deg)${flip} scale(.15)`, opacity: 0 },
      { transform: `translate(${dx * 0.45}px,${dy * 0.45}px) rotate(${deg + wig}deg)${flip} scale(1)`, opacity: 1, offset: 0.28 },
      { transform: `translate(${dx * 0.8}px,${dy * 0.8 + 6}px) rotate(${deg - wig}deg)${flip} scale(.95)`, opacity: 1, offset: 0.62 },
      { transform: `translate(${dx}px,${dy + 18}px) rotate(${deg}deg)${flip} scale(.7)`, opacity: 0 },
    ];
    el.animate(frames, { duration: rnd(780, 980), delay: i * 18, easing: ease, fill: "both" }).onfinish = () => el.remove();
  }
}

// ---- Checkout swim: a school crosses the screen on a wavy path ----
export function checkoutSwim(onDone?: () => void, opts: any = {}) {
  if (typeof window === "undefined") return;
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { setTimeout(() => onDone && onDone(), 200); return; }
  const layer = fishLayer();
  if (!layer) return;
  
  const W = window.innerWidth, H = window.innerHeight;
  const count = opts.count || 16;
  const fromBottom = Math.random() < 0.5;
  // travel diagonally across, covering ~half the screen height in a wave
  const startX = -120, endX = W + 120;
  const baseY = fromBottom ? H * 0.82 : H * 0.18;
  const targetY = fromBottom ? H * 0.20 : H * 0.80;
  const total = opts.duration || 2600;

  for (let i = 0; i < count; i++) {
    const kind = pickKind();
    const size = rnd(40, 74);
    const el = makeFishEl(kind, size);
    layer.appendChild(el);
    const lane = (i / count);
    const yJitter = rnd(-60, 60);
    const y0 = baseY + lane * (targetY - baseY) + yJitter;
    const amp = rnd(34, 70) * (fromBottom ? 1 : -1);
    const phase = rnd(0, Math.PI * 2);
    const sx = startX - i * rnd(40, 110);
    // sample a wavy path
    const N = 24, frames = [];
    for (let s = 0; s <= N; s++) {
      const p = s / N;
      const px = sx + (endX - sx) * p;
      const drift = (targetY - baseY) * p * 0.35;
      const py = y0 + drift + Math.sin(p * Math.PI * 3 + phase) * amp;
      const next = Math.min(1, p + 0.02);
      const nx = sx + (endX - sx) * next;
      const ny = y0 + (targetY - baseY) * next * 0.35 + Math.sin(next * Math.PI * 3 + phase) * amp;
      const ang = Math.atan2(ny - py, nx - px) * 180 / Math.PI;
      frames.push({
        transform: `translate(${px}px, ${py}px) rotate(${ang}deg) scale(1)`,
        opacity: p < 0.04 ? 0 : (p > 0.94 ? 0 : 1),
        offset: p,
      });
    }
    const anim = el.animate(frames, {
      duration: total, delay: i * 55, easing: "cubic-bezier(.4,0,.5,1)", fill: "both",
    });
    anim.onfinish = () => el.remove();
  }
  setTimeout(() => onDone && onDone(), total * 0.62);
}

export function FishProvider() {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      // fish on every click, anywhere — except while typing in a form field
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable='true']")) return;
      if (e.clientX === 0 && e.clientY === 0) return; // keyboard-triggered clicks
      spawnBurst(e.clientX, e.clientY, "auto", t.closest("[data-fish]") ? 7 : 5);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);
  
  return null;
}
