// brand.jsx — JoyJar logo variants, Logo component, and the premium GiftBox.
// Logo reads window.__logoStyle (set from Tweaks). Default "seal".

const LOGO_STYLES = ["seal", "circle", "jar", "monogram", "wave", "stacked", "handmade"];
const CINNABAR = "#b34a30", GOLD_B = "#bfa063", GOLD_BD = "#8a6f33", PAPER_B = "#fbf9f5";

// circular cinnabar seal with a single brand char
function CircleSeal({ size = 44 }) {
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
function JarGlyph({ size = 44 }) {
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
function Monogram({ size = 44 }) {
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
function WaveBadge({ size = 44 }) {
  const arcs = [];
  const fan = (cx, cy) => [9, 6, 3].forEach((rr, k) =>
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

function renderMark(style, size) {
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

function Logo({ onClick, compact = false }) {
  const style = LOGO_STYLES.includes(window.__logoStyle) ? window.__logoStyle : "seal";
  const size = compact ? 36 : 44;
  if (style === "stacked") {
    return (
      <button className="logo logo-stacked" onClick={onClick} data-nofish="1" aria-label="JoyJar home">
        <span className="logo-stack">
          <span className="logo-rule" />
          <span className="logo-stack-zh">小膠傲</span>
          <span className="logo-stack-en">JoyJar</span>
          <span className="logo-rule" />
        </span>
      </button>
    );
  }
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

Object.assign(window, { Logo, LOGO_STYLES, CircleSeal, JarGlyph, Monogram, WaveBadge });
