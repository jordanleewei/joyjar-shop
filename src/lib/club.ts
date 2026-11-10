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
  { id: "pearl",   en: "Pearl",   zh: "珍珠", min: 0,   discount: 0,
    perks: ["5% welcome discount on your first order", "Your own member card & fish maw pet", "Earn 5% vouchers by completing missions", "Pet accessories: bow, flower, cap"],
    unlocks: ["none", "bow", "flower", "cap"] },
  { id: "jade",    en: "Jade",    zh: "翡翠", min: 100, discount: 0.05,
    perks: ["5% off every order", "Free delivery on every order", "Pet accessories: leaf, glasses, bow tie"],
    unlocks: ["leaf", "glasses", "bowtie"] },
  { id: "gold",    en: "Gold",    zh: "黄金", min: 250, discount: 0.10,
    perks: ["10% off every order", "Free delivery on every order", "Pet accessories: star, chef hat, headphones"],
    unlocks: ["star", "chef", "headphones"] },
  { id: "diamond", en: "Diamond", zh: "钻石", min: 500, discount: 0.15,
    perks: ["15% off every order", "Free delivery on every order", "Pet accessories: crown, tiara, halo"],
    unlocks: ["crown", "tiara", "halo"] },
];

export const MAX_STACKED = 0.35;   // most a member can take off one order
export const WELCOME_RATE = 0.05;  // first order as a member
export const VOUCHER_RATE = 0.05;  // per approved mission
export const FREE_DELIVERY_FROM_TIER = 1; // Jade and up

export type Mission = {
  id: string; en: string; zh: string; platform: string; how: string;
  repeat: false | { max: number; days: number };
};
export const MISSIONS: Mission[] = [
  { id: "ig_story", en: "Instagram Story", zh: "IG 快拍", platform: "Instagram",
    how: "Share an Instagram Story with your JoyJar and tag or mention JoyJar.", repeat: false },
  { id: "ig_post", en: "Instagram post", zh: "IG 贴文", platform: "Instagram",
    how: "Post a photo or reel of your JoyJar on your Instagram feed and tag JoyJar.", repeat: false },
  { id: "facebook", en: "Facebook post", zh: "脸书贴文", platform: "Facebook",
    how: "Post about JoyJar on Facebook with a photo of your jar.", repeat: false },
  { id: "tiktok", en: "TikTok video", zh: "抖音视频", platform: "TikTok",
    how: "Post a TikTok featuring JoyJar (an unboxing, a taste test, the POP!).", repeat: false },
  { id: "xhs", en: "Xiaohongshu note", zh: "小红书笔记", platform: "Xiaohongshu",
    how: "Share a 小红书 note recommending JoyJar.", repeat: false },
  { id: "refer", en: "Recommend a friend", zh: "推荐好友", platform: "Chat",
    how: "Recommend JoyJar to a friend in a chat (WhatsApp, Telegram, WeChat…) and upload a screenshot of the message.",
    repeat: { max: 3, days: 30 } },
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
export const LOOKS = [{ id: "f", en: "Her", zh: "她" }, { id: "m", en: "Him", zh: "他" }, { id: "t", en: "They", zh: "中性" }];
// looks: which avatar looks offer the style ("They" can pick any style except NOT_THEY)
export const HAIR_STYLES = [
  { id: "bob", en: "Bob", looks: ["f"] }, { id: "curly", en: "Curly", looks: ["f"] }, { id: "bun", en: "Bun", looks: ["f"] },
  { id: "long", en: "Long", looks: ["f"] }, { id: "short", en: "Short", looks: ["f"] },
  { id: "ponytail", en: "Ponytail", looks: ["f"] }, { id: "braids", en: "Braids", looks: ["f"] }, { id: "wavy", en: "Wavy", looks: ["f"] },
  { id: "crew", en: "Crew", looks: ["m"] }, { id: "side", en: "Side part", looks: ["m"] }, { id: "spiky", en: "Spiky", looks: ["m"] },
  { id: "mcurly", en: "Short curls", looks: ["m"] }, { id: "buzz", en: "Buzz", looks: ["m"] },
  { id: "quiff", en: "Quiff", looks: ["m"] }, { id: "manbun", en: "Top knot", looks: ["m"] }, { id: "bowl", en: "Fringe", looks: ["m"] },
  { id: "afro", en: "Afro", looks: ["f", "m"] },
];
const NOT_THEY = ["long", "wavy"];
export function hairFor(look: string) {
  return HAIR_STYLES.filter((h) => look === "t" ? !NOT_THEY.includes(h.id) : h.looks.includes(look));
}
export const FACIAL = [
  { id: "none", en: "None" }, { id: "stubble", en: "Stubble" }, { id: "moustache", en: "Moustache" }, { id: "beard", en: "Beard" },
];
export const DEFAULT_HAIR: Record<string, string> = { f: "curly", m: "crew", t: "short" };
export const TOPS = ["#6e9f5a", "#b34a30", "#3a3140", "#d48691", "#bfa063", "#6f93b8", "#f3ecdf"];
// everyday, wholesome outfits only
export const CLOTHES = [
  { id: "tee", en: "T-shirt", zh: "T恤" }, { id: "shirt", en: "Collared shirt", zh: "衬衫" },
  { id: "hoodie", en: "Hoodie", zh: "卫衣" }, { id: "sweater", en: "Knit sweater", zh: "毛衣" },
  { id: "cardigan", en: "Cardigan", zh: "开衫" }, { id: "tang", en: "Mandarin collar", zh: "唐装" },
  { id: "apron", en: "Kitchen apron", zh: "围裙" }, { id: "overalls", en: "Overalls", zh: "背带裤" },
];
export const CARD_PATTERNS = [
  { id: "plain", en: "Plain", zh: "素色" }, { id: "dots", en: "Polka dots", zh: "波点" },
  { id: "stripes", en: "Stripes", zh: "条纹" }, { id: "waves", en: "Waves", zh: "海浪" },
  { id: "clouds", en: "Lucky clouds", zh: "祥云" }, { id: "blossom", en: "Plum blossom", zh: "梅花" },
  { id: "scales", en: "Fish scales", zh: "鱼鳞" }, { id: "checks", en: "Gingham", zh: "格纹" },
];
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
  { id: "none", en: "None" },
  { id: "bow", en: "🎀 Bow" }, { id: "flower", en: "🌸 Flower" }, { id: "cap", en: "🧢 Cap" },
  { id: "leaf", en: "🌿 Leaf" }, { id: "glasses", en: "👓 Glasses" }, { id: "bowtie", en: "🤵 Bow tie" },
  { id: "star", en: "⭐ Star" }, { id: "chef", en: "👨‍🍳 Chef hat" }, { id: "headphones", en: "🎧 Headphones" },
  { id: "crown", en: "👑 Crown" }, { id: "tiara", en: "💎 Tiara" }, { id: "halo", en: "😇 Halo" },
];

export type CardDesign = {
  look: string; facial: string;
  skin: number; hair: string; hairColour: number; top: number; clothes: string;
  theme: string; pattern: string; petName: string; petColour: string; accessory: string;
};

export const DEFAULT_CARD: CardDesign = {
  look: "f", facial: "none",
  skin: 1, hair: "curly", hairColour: 0, top: 0, clothes: "tee",
  theme: "rose", pattern: "plain", petName: "Bouncy", petColour: "gold", accessory: "bow",
};

export function parseCard(raw: any): CardDesign {
  let c: any = raw;
  if (typeof raw === "string") { try { c = JSON.parse(raw); } catch { c = {}; } }
  return { ...DEFAULT_CARD, ...(c || {}) };
}

export function cleanCard(input: any): CardDesign {
  const c = parseCard(input);
  const clampIdx = (n: any, len: number) => Math.max(0, Math.min(len - 1, Number(n) | 0));
  const look = c.look === "m" || c.look === "t" ? c.look : "f";
  return {
    look,
    facial: look !== "f" && FACIAL.some((f) => f.id === c.facial) ? c.facial : "none",
    skin: clampIdx(c.skin, SKIN.length),
    hair: hairFor(look).some((h) => h.id === c.hair) ? c.hair : DEFAULT_HAIR[look],
    hairColour: clampIdx(c.hairColour, HAIR_COLOURS.length),
    top: clampIdx(c.top, TOPS.length),
    clothes: CLOTHES.some((x) => x.id === c.clothes) ? c.clothes : "tee",
    theme: CARD_THEMES.some((t) => t.id === c.theme) ? c.theme : DEFAULT_CARD.theme,
    pattern: CARD_PATTERNS.some((x) => x.id === c.pattern) ? c.pattern : "plain",
    petName: String(c.petName || "").trim().slice(0, 16) || DEFAULT_CARD.petName,
    petColour: PET_COLOURS.some((p) => p.id === c.petColour) ? c.petColour : DEFAULT_CARD.petColour,
    accessory: ACCESSORIES.some((a) => a.id === c.accessory) ? c.accessory : "none",
  };
}

export function memberNo(num: number) {
  return "JJ-" + String(num).padStart(6, "0");
}

// ---- member discounts (shared by checkout page and server) ----
export type DiscountOptions = {
  tier: { rate: number; label: string } | null;
  welcome: { rate: number; label: string } | null;
  vouchers: { id: string; rate: number; label: string }[];
  freeDelivery: boolean;
  cap: number;
};

export type DiscountChoice = { tier?: boolean; welcome?: boolean; vouchers?: string[] };

// Pure: same maths on the client (preview) and server (truth). Applies tier, then
// welcome, then vouchers until the cap; vouchers that wouldn't fit aren't used.
export function stackDiscounts(opts: DiscountOptions, choice: DiscountChoice) {
  const parts: { kind: string; label: string; rate: number; id?: string }[] = [];
  let rate = 0;
  const add = (p: { kind: string; label: string; rate: number; id?: string }) => {
    if (rate + p.rate > opts.cap + 1e-9) return false;
    parts.push(p); rate += p.rate; return true;
  };
  if (choice.tier && opts.tier) add({ kind: "tier", ...opts.tier });
  if (choice.welcome && opts.welcome) add({ kind: "welcome", ...opts.welcome });
  const wanted = new Set(choice.vouchers || []);
  for (const v of opts.vouchers) if (wanted.has(v.id)) add({ kind: "voucher", ...v });
  return { rate: Math.round(rate * 100) / 100, parts };
}

