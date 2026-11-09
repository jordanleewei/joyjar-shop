// JoyJar Club — tiers, card options and helpers shared by client and server.
// Edit TIERS to change thresholds, discounts and perks.

export type Tier = {
  id: string; en: string; zh: string;
  min: number;        // lifetime spend (SGD, paid orders) needed to reach this tier
  discount: number;   // fraction off the jar subtotal
  perks: string[];
  unlocks: string[];  // pet accessories unlocked at this tier
};

export const TIERS: Tier[] = [
  { id: "fresh",  en: "Fresh Jar",  zh: "鲜罐", min: 0,   discount: 0,
    perks: ["Your own member card", "A fish maw pet to name", "Member-only news"], unlocks: ["none", "bow"] },
  { id: "bouncy", en: "Bouncy Jar", zh: "弹罐", min: 100, discount: 0.05,
    perks: ["5% off every order", "Leaf accessory for your pet"], unlocks: ["leaf"] },
  { id: "proud",  en: "Proud Jar",  zh: "傲罐", min: 250, discount: 0.10,
    perks: ["10% off every order", "Star accessory for your pet"], unlocks: ["star"] },
  { id: "golden", en: "Golden Jar", zh: "金罐", min: 500, discount: 0.15,
    perks: ["15% off every order", "Crown for your pet"], unlocks: ["crown"] },
];

export function tierFor(spend: number) {
  let idx = 0;
  TIERS.forEach((t, i) => { if (spend >= t.min) idx = i; });
  const tier = TIERS[idx];
  const next = TIERS[idx + 1] || null;
  const progress = next ? Math.min(1, (spend - tier.min) / (next.min - tier.min)) : 1;
  return { tier, next, progress, toNext: next ? Math.max(0, next.min - spend) : 0, index: idx };
}

export function unlockedAccessories(tierIndex: number) {
  return TIERS.slice(0, tierIndex + 1).flatMap((t) => t.unlocks);
}

// ---- card design ----
export const SKIN = ["#f6d7bd", "#eec39f", "#d9a37c", "#b67a55", "#8a5638"];
export const HAIR_COLOURS = ["#2c2420", "#5a3a26", "#9a6a3c", "#c9a36a", "#b34a30"];
export const HAIR_STYLES = [
  { id: "bob", en: "Bob" }, { id: "curly", en: "Curly" }, { id: "bun", en: "Bun" },
  { id: "long", en: "Long" }, { id: "short", en: "Short" },
];
export const TOPS = ["#6e9f5a", "#b34a30", "#3a3140", "#d48691", "#bfa063"];
export const CARD_THEMES = [
  { id: "rose",   en: "Rose",   bg: "#e8b9bf", deep: "#9a3f54", ink: "#3a1d24" },
  { id: "pandan", en: "Pandan", bg: "#bcd6a4", deep: "#3f6b3a", ink: "#1f3320" },
  { id: "calm",   en: "Calm",   bg: "#dfe1c4", deep: "#7d7a4a", ink: "#34331d" },
  { id: "noir",   en: "Noir",   bg: "#4a4150", deep: "#bfa063", ink: "#f4efe6" },
];
export const PET_COLOURS = [
  { id: "gold",  fill: "#f2c45a", shade: "#d49a2a" },
  { id: "cream", fill: "#f6ead0", shade: "#d9c49a" },
  { id: "pink",  fill: "#f4b7c2", shade: "#d48691" },
  { id: "green", fill: "#c4dca6", shade: "#88ad6a" },
];
export const ACCESSORIES = [
  { id: "none", en: "None" }, { id: "bow", en: "Bow" }, { id: "leaf", en: "Leaf" },
  { id: "star", en: "Star" }, { id: "crown", en: "Crown" },
];

export type CardDesign = {
  skin: number; hair: string; hairColour: number; top: number;
  theme: string; petName: string; petColour: string; accessory: string;
};

export const DEFAULT_CARD: CardDesign = {
  skin: 1, hair: "curly", hairColour: 0, top: 0,
  theme: "rose", petName: "Bouncy", petColour: "gold", accessory: "bow",
};

export function parseCard(raw: any): CardDesign {
  let c: any = raw;
  if (typeof raw === "string") { try { c = JSON.parse(raw); } catch { c = {}; } }
  return { ...DEFAULT_CARD, ...(c || {}) };
}

export function cleanCard(input: any): CardDesign {
  const c = parseCard(input);
  const clampIdx = (n: any, len: number) => Math.max(0, Math.min(len - 1, Number(n) | 0));
  return {
    skin: clampIdx(c.skin, SKIN.length),
    hair: HAIR_STYLES.some((h) => h.id === c.hair) ? c.hair : DEFAULT_CARD.hair,
    hairColour: clampIdx(c.hairColour, HAIR_COLOURS.length),
    top: clampIdx(c.top, TOPS.length),
    theme: CARD_THEMES.some((t) => t.id === c.theme) ? c.theme : DEFAULT_CARD.theme,
    petName: String(c.petName || "").trim().slice(0, 16) || DEFAULT_CARD.petName,
    petColour: PET_COLOURS.some((p) => p.id === c.petColour) ? c.petColour : DEFAULT_CARD.petColour,
    accessory: ACCESSORIES.some((a) => a.id === c.accessory) ? c.accessory : "none",
  };
}

export function memberNo(num: number) {
  return "JJ-" + String(num).padStart(6, "0");
}
