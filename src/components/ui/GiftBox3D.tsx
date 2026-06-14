"use client";

import React, { useRef } from "react";
import { TONES } from "@/lib/constants";
import { Jar } from "./Jars";

// Six CLASSIC jars arranged 3×2 inside a tilted lacquer box. Every piece is a
// CSS-3D plane, but jars are counter-rotated to face the camera so the whole
// thing animates like a flat 2D illustration.

// 3×2 layout — back row sits further/higher, front row closer/lower.
// Note: cy has been made negative to raise the back row up on the Y-axis.
export const GB3_LAYOUT = [
  { tone: "matcha", row: "back", cx: -86, cy: -75, cz: 0, s: 0.98, i: 3 },
  { tone: "coconut", row: "back", cx: 0, cy: -75, cz: 0, s: 0.98, i: 4 },
  { tone: "osmanthus", row: "back", cx: 86, cy: -75, cz: 0, s: 0.98, i: 5 },
  { tone: "ginseng", row: "front", cx: -92, cy: -20, cz: 70, s: 1, i: 0 },
  { tone: "date", row: "front", cx: 0, cy: -20, cz: 70, s: 1, i: 1 },
  { tone: "sesame", row: "front", cx: 92, cy: -20, cz: 70, s: 1, i: 2 },
];

const GB3_FLOOR = 78; // must match --floorY in giftbox3d.css

function gb3JarStyle({ cx, cy = 0, cz, s, i }: any) {
  const base = (dy: number, extra = "") =>
    `translate(-50%,-100%) translate3d(${cx}px, ${GB3_FLOOR + dy + cy}px, ${cz}px) rotateX(calc(-1 * var(--tilt))) scale(${s})${extra}`;
  return {
    "--i": i,
    "--rest": base(0),
    "--rest-up": base(-8),
    "--rest-down": base(34),
    transform: base(0),
  } as React.CSSProperties;
}

export function GiftBox3D({ caption = true, slots, fill }: { caption?: boolean, slots?: any[], fill?: boolean }) {
  const T: any = TONES || {};
  // when slots are supplied (PDP), fill front row first then back, by anim index
  const order = slots ? [...GB3_LAYOUT].sort((a, b) => a.i - b.i) : GB3_LAYOUT;

  return (
    <div className={`gb3 ${fill ? "gb3-slots" : ""}`} role="img" aria-label="Auspicious gift box of six fish maw dessert jars">
      <div className="gb3-halo" />
      <div className="gb3-shadow" />
      <div className="gb3-stage">
        <div className="gb3-rig">
          {/* shell */}
          <div className="gb3-panel gb3-back" />
          <div className="gb3-panel gb3-lining" />
          <div className="gb3-panel gb3-side l" />
          <div className="gb3-panel gb3-side r" />
          <div className="gb3-panel gb3-floor" />

          {/* jars — 3×2 (real or ghost when slots are supplied) */}
          {order.map((j, idx) => {
            const slot = slots ? slots[idx] : { tone: j.tone };
            const tone = slot ? slot.tone : null;
            const t = T[tone] || {};
            return (
              <div className="gb3-jar" data-row={j.row} key={j.i} style={gb3JarStyle(j)}>
                {slot
                  ? <Jar tone={tone} size={0.54} style="classic" label={t.nameZh || ""} labelEn={(t.nameEn || "").toUpperCase()} />
                  : <span className="gb3-ghost" />}
              </div>
            );
          })}

          {/* low front reveal with gold plaque */}
          <div className="gb3-panel gb3-front">
            <div className="gb3-sheen" />
            <div className="gb3-plaque">
              <span className="gb3-plaque-zh">養生六味</span>
              <span className="gb3-plaque-en">Wellness</span>
            </div>
          </div>

          {/* lifted lacquer lid */}
          <div className="gb3-lid">
            <div className="gb3-seigaiha" />
            <div className="gb3-rib-h" />
            <div className="gb3-bow"><i /><i /></div>
            <div className="gb3-seal">膠</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// click to replay the open animation
export function gb3Replay(el: Element | null | undefined) {
  if (!el) return;
  el.classList.remove("play");
  void (el as HTMLElement).offsetWidth; // force reflow
  el.classList.add("play");
}

// Self-contained, drop-in component: the gift box + tap-to-replay wrapper.
export function WellnessGiftBox() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      className="boxwrap"
      role="button"
      tabIndex={0}
      aria-label="Replay the gift box opening"
      onClick={() => gb3Replay(ref.current?.querySelector(".gb3"))}
      ref={ref}
    >
      <GiftBox3D />
    </div>
  );
}
