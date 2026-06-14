// jars.jsx — JoyJar product jar, six switchable designs. Exported to window.
// Styles: classic · jam · apothecary · premium · mason · minimal
// Reads window.__jarStyle (set from Tweaks) unless a `style` prop is given.

const JAR_STYLES = ["classic", "jam", "apothecary", "premium", "mason", "minimal"];
const GOLD = "#bfa063", GOLD_LT = "#e7d3a0", GOLD_DK = "#8a6f33";

function jarColors(tone) {
  const T = window.TONES || {};
  return T[tone] || T.matcha || { dessert: "#cdd9b4", dessertTop: "#e3ead0", label: "#7d6a3c", labelInk: "#fbf7ee" };
}

// label text on the band
function BandText({ cx, cy, label, labelEn, ink, big = 21, font = "'Noto Serif TC', serif", enColor }) {
  return (
    <React.Fragment>
      <text x={cx} y={cy} textAnchor="middle" fontFamily={font} fontSize={big} fill={ink} letterSpacing="2">{label}</text>
      {labelEn ? (
        <text x={cx} y={cy + 19} textAnchor="middle" fontFamily="'Cormorant Garamond', serif"
              fontSize="11.5" fill={enColor || ink} letterSpacing="3" opacity="0.9">{labelEn}</text>
      ) : null}
    </React.Fragment>
  );
}

// a little seigaiha (fish-scale) fan motif — references the handmade logo
function Scales({ x, y, w, color, rows = 1 }) {
  const r = 7, gap = r * 2;
  const cols = Math.floor(w / gap);
  const arcs = [];
  for (let row = 0; row < rows; row++) {
    for (let i = 0; i <= cols; i++) {
      const cx = x + i * gap + (row % 2 ? r : 0);
      const cyy = y + row * r;
      [r, r * 0.62, r * 0.28].forEach((rr, k) => {
        arcs.push(<path key={row + "-" + i + "-" + k}
          d={`M ${cx - rr},${cyy} A ${rr} ${rr} 0 0 1 ${cx + rr},${cyy}`}
          fill="none" stroke={color} strokeWidth="1" opacity={0.55 - k * 0.12} />);
      });
    }
  }
  return <g>{arcs}</g>;
}

function GlassSheen({ id, x, y, w, h, rx }) {
  return <rect x={x} y={y} width={w} height={h} rx={rx} fill={`url(#${id})`} />;
}

function Defs({ tone, st }) {
  const sid = `${st}-${tone}`;
  return (
    <defs>
      <linearGradient id={`glass-${sid}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#fff" stopOpacity="0" />
        <stop offset="0.16" stopColor="#fff" stopOpacity="0.55" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0.05" />
        <stop offset="0.85" stopColor="#fff" stopOpacity="0.3" />
        <stop offset="1" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={`metal-${sid}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#9a9489" /><stop offset="0.22" stopColor="#e6e1d6" />
        <stop offset="0.5" stopColor="#c2bcae" /><stop offset="0.78" stopColor="#efebe1" />
        <stop offset="1" stopColor="#928c81" />
      </linearGradient>
      <linearGradient id={`gold-${sid}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={GOLD_DK} /><stop offset="0.25" stopColor={GOLD_LT} />
        <stop offset="0.55" stopColor={GOLD} /><stop offset="0.8" stopColor={GOLD_LT} />
        <stop offset="1" stopColor={GOLD_DK} />
      </linearGradient>
      <linearGradient id={`cork-${sid}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#9c7440" /><stop offset="0.3" stopColor="#c79a5e" />
        <stop offset="0.7" stopColor="#b3884e" /><stop offset="1" stopColor="#8a6536" />
      </linearGradient>
    </defs>
  );
}

function renderJar(st, tone, label, labelEn) {
  const c = jarColors(tone);
  const sid = `${st}-${tone}`;

  if (st === "jam") {
    return (
      <React.Fragment>
        <Defs tone={tone} st={st} />
        {/* body */}
        <path d="M28,96 C28,84 38,78 52,78 L116,78 C130,78 140,84 140,96 L140,206 C140,219 130,226 116,226 L52,226 C38,226 28,219 28,206 Z" fill="#efece5" />
        {/* dessert */}
        <path d="M34,112 L134,112 L134,200 C134,212 126,218 116,218 L52,218 C42,218 34,212 34,200 Z" fill={c.dessert} />
        <rect x="34" y="112" width="100" height="18" fill={c.dessertTop} />
        {/* label band */}
        <rect x="28" y="142" width="112" height="64" fill={c.label} />
        <BandText cx={84} cy={172} label={label} labelEn={labelEn} ink={c.labelInk} />
        <GlassSheen id={`glass-${sid}`} x={28} y={78} w={112} h={148} rx={20} />
        {/* cloth cover */}
        <path d="M40,80 C40,64 54,52 84,52 C114,52 128,64 128,80 C120,74 110,74 104,80 C98,73 88,72 84,72 C80,72 70,73 64,80 C58,74 48,74 40,80 Z" fill="#f4ede0" />
        <path d="M40,80 C40,64 54,52 84,52 C114,52 128,64 128,80" fill="none" stroke={GOLD} strokeWidth="1.4" opacity="0.5" />
        <g opacity="0.7"><Scales x={52} y={62} w={64} color={GOLD} /></g>
        {/* string tie + bow */}
        <rect x="50" y="80" width="68" height="7" rx="3.5" fill={GOLD} opacity="0.9" />
        <circle cx="84" cy="83.5" r="5" fill="none" stroke={GOLD_DK} strokeWidth="2.4" />
        <path d="M84,84 C74,78 66,80 70,86 C73,90 80,88 84,84 Z" fill={GOLD} />
        <path d="M84,84 C94,78 102,80 98,86 C95,90 88,88 84,84 Z" fill={GOLD} />
      </React.Fragment>
    );
  }

  if (st === "apothecary") {
    return (
      <React.Fragment>
        <Defs tone={tone} st={st} />
        {/* cork */}
        <rect x="44" y="34" width="80" height="22" rx="5" fill={`url(#cork-${sid})`} />
        <rect x="50" y="30" width="68" height="10" rx="5" fill={`url(#cork-${sid})`} />
        <g opacity="0.25" fill="#5e4220">
          <circle cx="62" cy="45" r="1.4" /><circle cx="86" cy="48" r="1.2" /><circle cx="104" cy="43" r="1.3" />
        </g>
        {/* neck */}
        <rect x="58" y="54" width="52" height="16" fill="#e9e5dd" />
        {/* body */}
        <rect x="36" y="68" width="96" height="158" rx="14" fill="#efece5" />
        <rect x="42" y="96" width="84" height="124" rx="10" fill={c.dessert} />
        <rect x="42" y="96" width="84" height="18" fill={c.dessertTop} />
        {/* kraft label */}
        <rect x="36" y="128" width="96" height="74" fill="#d8c3a0" />
        <line x1="36" y1="135" x2="132" y2="135" stroke={GOLD_DK} strokeWidth="0.8" opacity="0.5" />
        <line x1="36" y1="195" x2="132" y2="195" stroke={GOLD_DK} strokeWidth="0.8" opacity="0.5" />
        <BandText cx={84} cy={166} label={label} labelEn={labelEn} ink="#6d5530" />
        <GlassSheen id={`glass-${sid}`} x={36} y={68} w={96} h={158} rx={14} />
      </React.Fragment>
    );
  }

  if (st === "premium") {
    return (
      <React.Fragment>
        <Defs tone={tone} st={st} />
        {/* tapered crystal body */}
        <path d="M34,84 L134,84 L126,214 C125,222 119,226 111,226 L57,226 C49,226 43,222 42,214 Z" fill="#edeae3" />
        <path d="M44,108 L124,108 L118,206 C117,212 113,216 107,216 L61,216 C55,216 51,212 50,206 Z" fill={c.dessert} />
        <rect x="44" y="108" width="80" height="16" fill={c.dessertTop} />
        {/* facet highlights */}
        <path d="M34,84 L134,84 L130,98 L38,98 Z" fill="#fff" opacity="0.25" />
        {/* gold band + seigaiha */}
        <rect x="42" y="138" width="84" height="58" fill="#22201c" />
        <rect x="42" y="138" width="84" height="58" fill={`url(#gold-${sid})`} opacity="0.18" />
        <rect x="42" y="138" width="84" height="3" fill={`url(#gold-${sid})`} />
        <rect x="42" y="193" width="84" height="3" fill={`url(#gold-${sid})`} />
        <g opacity="0.8"><Scales x={50} y={150} w={68} color={GOLD_LT} /></g>
        <BandText cx={84} cy={182} label={label} labelEn={labelEn} ink={GOLD_LT} enColor={GOLD} />
        <GlassSheen id={`glass-${sid}`} x={42} y={84} w={92} h={142} rx={4} />
        {/* gold lid */}
        <rect x="40" y="40" width="88" height="44" rx="9" fill={`url(#gold-${sid})`} />
        <rect x="40" y="40" width="88" height="9" rx="4.5" fill="#fff" opacity="0.3" />
        <rect x="56" y="30" width="56" height="14" rx="7" fill={`url(#gold-${sid})`} />
        {/* gold base ring */}
        <ellipse cx="84" cy="226" rx="42" ry="5" fill={`url(#gold-${sid})`} opacity="0.55" />
      </React.Fragment>
    );
  }

  if (st === "mason") {
    return (
      <React.Fragment>
        <Defs tone={tone} st={st} />
        {/* lid disc + band */}
        <rect x="30" y="24" width="108" height="30" rx="7" fill={`url(#metal-${sid})`} />
        <rect x="26" y="50" width="116" height="20" rx="7" fill={`url(#metal-${sid})`} />
        <rect x="30" y="24" width="108" height="7" rx="3.5" fill="#fff" opacity="0.3" />
        {/* body */}
        <rect x="22" y="70" width="124" height="156" rx="20" fill="#efece5" />
        {/* ribbed shoulder */}
        <g stroke="#d9d4ca" strokeWidth="2" opacity="0.8">
          <line x1="30" y1="80" x2="138" y2="80" /><line x1="30" y1="86" x2="138" y2="86" /><line x1="30" y1="92" x2="138" y2="92" />
        </g>
        <rect x="28" y="104" width="112" height="116" rx="14" fill={c.dessert} />
        <rect x="28" y="104" width="112" height="18" fill={c.dessertTop} />
        {/* embossed label panel */}
        <rect x="34" y="136" width="100" height="70" rx="8" fill={c.label} />
        <rect x="34" y="136" width="100" height="70" rx="8" fill="none" stroke="#fff" strokeWidth="1" opacity="0.18" />
        <BandText cx={84} cy={170} label={label} labelEn={labelEn} ink={c.labelInk} />
        <GlassSheen id={`glass-${sid}`} x={22} y={70} w={124} h={156} rx={20} />
      </React.Fragment>
    );
  }

  if (st === "minimal") {
    const frost = `color-mix(in srgb, ${c.dessert} 60%, #f3f1ec)`;
    return (
      <React.Fragment>
        <Defs tone={tone} st={st} />
        {/* flat cap */}
        <rect x="42" y="42" width="84" height="20" rx="7" fill={c.label} />
        <rect x="48" y="38" width="72" height="9" rx="4.5" fill={c.label} opacity="0.85" />
        {/* frosted cylinder */}
        <rect x="38" y="60" width="92" height="166" rx="16" fill={frost} />
        <rect x="38" y="120" width="92" height="106" rx="16" fill={c.dessert} opacity="0.5" />
        {/* debossed wordmark */}
        <BandText cx={84} cy={150} label={label} labelEn={labelEn} ink={c.label} big={20} />
        <rect x="38" y="60" width="92" height="166" rx="16" fill="#fff" opacity="0.14" />
        <rect x="52" y="60" width="10" height="166" fill="#fff" opacity="0.22" />
      </React.Fragment>
    );
  }

  // classic (default)
  return (
    <React.Fragment>
      <Defs tone={tone} st="classic" />
      <rect x="20" y="64" width="128" height="160" rx="22" fill="#efece5" />
      <rect x="26" y="96" width="116" height="122" rx="14" fill={c.dessert} />
      <rect x="26" y="96" width="116" height="22" rx="11" fill={c.dessertTop} />
      <rect x="20" y="132" width="128" height="72" fill={c.label} />
      <BandText cx={84} cy={166} label={label} labelEn={labelEn} ink={c.labelInk} big={22} />
      <GlassSheen id={`glass-classic-${tone}`} x={20} y={64} w={128} h={160} rx={22} />
      <rect x="26" y="18" width="116" height="52" rx="12" fill={`url(#metal-classic-${tone})`} />
      <rect x="26" y="18" width="116" height="10" rx="5" fill="#fff" opacity="0.35" />
      <ellipse cx="84" cy="44" rx="40" ry="12" fill="#fff" opacity="0.12" />
    </React.Fragment>
  );
}

function Jar({ tone = "matcha", size = 1, label = "小膠傲", labelEn = "JoyJar", floating = false, style }) {
  const st = JAR_STYLES.includes(style) ? style : (window.__jarStyle || "classic");
  const w = 168 * size, h = 240 * size;
  return (
    <div className={`jar jar-${st} ${floating ? "jar-float" : ""}`} style={{ width: w, height: h }} aria-hidden="true">
      <svg viewBox="0 0 168 240" width="100%" height="100%">{renderJar(st, tone, label, labelEn)}</svg>
    </div>
  );
}

Object.assign(window, { Jar, JAR_STYLES });
