// fish.jsx — original stylized koi + blue fish, plus the click-burst and
// checkout-swim animation engine. Exported to window.

// ---- Shared geometry (viewBox 0 0 140 96), fish faces RIGHT ----
const FISH_VIEWBOX = "0 0 140 96";

function fishInner(kind) {
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

function fishMarkup(kind) {
  return `<svg viewBox="${FISH_VIEWBOX}" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">${fishInner(kind)}</svg>`;
}

// React component for decorative use
function FishSVG({ kind = "koi", className = "", style = {} }) {
  return (
    <svg viewBox={FISH_VIEWBOX} className={className} style={style}
         dangerouslySetInnerHTML={{ __html: fishInner(kind) }} />
  );
}

// ---- Animation layer ----
function fishLayer() {
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

function makeFishEl(kind, size) {
  const el = document.createElement("div");
  el.className = "spawn-fish";
  el.style.cssText =
    `position:absolute;width:${size}px;height:${size * 0.69}px;` +
    `will-change:transform,opacity;filter:drop-shadow(0 6px 10px rgba(60,40,20,.18));`;
  el.innerHTML = fishMarkup(kind);
  return el;
}

const rnd = (a, b) => a + Math.random() * (b - a);
const pickKind = () => (Math.random() < 0.5 ? "koi" : "blue");

// Burst on button press. motion: "bubble" | "swim" | "auto"
function spawnBurst(x, y, motion = "auto", count = 5) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = fishLayer();
  for (let i = 0; i < count; i++) {
    const kind = pickKind();
    const size = rnd(28, 48);
    const el = makeFishEl(kind, size);
    const mode = motion === "auto" ? (Math.random() < 0.5 ? "bubble" : "swim") : motion;
    el.style.left = (x - size / 2) + "px";
    el.style.top = (y - size / 2) + "px";
    layer.appendChild(el);

    const dur = rnd(900, 1500);
    let frames;
    if (mode === "swim") {
      const dir = Math.random() < 0.5 ? -1 : 1;
      const dist = rnd(80, 180) * dir;
      const baseRot = dir < 0 ? 180 : 0; // face travel direction
      frames = [
        { transform: `translate(0,0) rotate(${baseRot}deg) scale(.4)`, opacity: 0 },
        { transform: `translate(${dist * 0.3}px, ${rnd(-26, -10)}px) rotate(${baseRot + 8 * dir}deg) scale(1)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${dist * 0.65}px, ${rnd(8, 24)}px) rotate(${baseRot - 8 * dir}deg) scale(1)`, opacity: 1, offset: 0.65 },
        { transform: `translate(${dist}px, ${rnd(-14, 6)}px) rotate(${baseRot}deg) scale(.85)`, opacity: 0 },
      ];
    } else {
      // bubble: rise with sway, face upward-ish
      const sway = rnd(-40, 40);
      const rise = rnd(140, 240);
      const rot = rnd(-90, -70);
      frames = [
        { transform: `translate(0,0) rotate(${rot}deg) scale(.35)`, opacity: 0 },
        { transform: `translate(${sway * 0.4}px, ${-rise * 0.4}px) rotate(${rot + 12}deg) scale(1)`, opacity: 1, offset: 0.35 },
        { transform: `translate(${sway}px, ${-rise}px) rotate(${rot - 12}deg) scale(.7)`, opacity: 0 },
      ];
    }
    const anim = el.animate(frames, {
      duration: dur, delay: i * 70, easing: "cubic-bezier(.33,.0,.2,1)", fill: "forwards",
    });
    anim.onfinish = () => el.remove();
  }
}

// Attach a burst to any click within elements carrying [data-fish]
function bindFishClicks(getMotion) {
  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-fish]");
    if (!trigger) return;
    spawnBurst(e.clientX, e.clientY, getMotion ? getMotion() : "auto", 5);
  });
}

// ---- Checkout swim: a school crosses the screen on a wavy path ----
function checkoutSwim(onDone, opts = {}) {
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { setTimeout(() => onDone && onDone(), 200); return; }
  const layer = fishLayer();
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
      duration: total, delay: i * 55, easing: "cubic-bezier(.4,0,.5,1)", fill: "forwards",
    });
    anim.onfinish = () => el.remove();
  }
  setTimeout(() => onDone && onDone(), total * 0.62);
}

Object.assign(window, { FishSVG, fishMarkup, spawnBurst, bindFishClicks, checkoutSwim });
