// JoyJar Club — tiers, card options and helpers shared by client and server.
// Edit TIERS to change thresholds, discounts and perks.

export type Tier = {
  id: string; en: string; zh: string;
  min: number;        // lifetime points needed to reach this tier
  perks: string[];
  unlocks: string[];  // pet accessories this tier lets you buy in the pet shop
};

export const TIERS: Tier[] = [
  { id: "pearl",   en: "Pearl",   zh: "珍珠", min: 0,
    perks: ["5% welcome discount on your first order", "1 point for every $1 you spend", "5 points for every mission", "Pet shop: bow, flower, cap"],
    unlocks: ["none", "bow", "flower", "cap"] },
  { id: "jade",    en: "Jade",    zh: "翡翠", min: 200,
    perks: ["Jade badge on your member card", "Pet shop: leaf, glasses, bow tie"],
    unlocks: ["leaf", "glasses", "bowtie"] },
  { id: "gold",    en: "Gold",    zh: "黄金", min: 400,
    perks: ["Gold badge on your member card", "Pet shop: star, chef hat, headphones"],
    unlocks: ["star", "chef", "headphones"] },
  { id: "diamond", en: "Diamond", zh: "钻石", min: 600,
    perks: ["Diamond badge on your member card", "Pet shop: crown, tiara, halo"],
    unlocks: ["crown", "tiara", "halo"] },
];

// ---- points ----
export const POINTS_PER_DOLLAR = 1;  // on the jars, after any discount (not delivery)
export const MISSION_POINTS = 5;     // per approved mission
export const REDEEM_BLOCK = 100;     // points per redemption step…
export const REDEEM_VALUE = 5;       // …worth $5 off
export const WELCOME_RATE = 0.05;    // first order as a member

export function pointsFor(amount: number) {
  return Math.max(0, Math.floor(amount * POINTS_PER_DOLLAR + 1e-9));
}

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


// tier from lifetime points (spending points never lowers your tier)
export function tierFor(points: number) {
  let idx = 0;
  TIERS.forEach((t, i) => { if (points >= t.min) idx = i; });
  const tier = TIERS[idx];
  const next = TIERS[idx + 1] || null;
  const progress = next ? Math.min(1, (points - tier.min) / (next.min - tier.min)) : 1;
  return { tier, next, progress, toNext: next ? Math.max(0, next.min - points) : 0, index: idx };
}

export function tierOfAccessory(id: string) {
  return TIERS.findIndex((t) => t.unlocks.includes(id));
}

// accessories this tier is allowed to buy
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
// cost = points in the pet shop. "none" and the bow are free for everyone.
export const ACCESSORIES = [
  { id: "none", en: "None", cost: 0 },
  { id: "bow", en: "🎀 Bow", cost: 0 }, { id: "flower", en: "🌸 Flower", cost: 20 }, { id: "cap", en: "🧢 Cap", cost: 20 },
  { id: "leaf", en: "🌿 Leaf", cost: 40 }, { id: "glasses", en: "👓 Glasses", cost: 50 }, { id: "bowtie", en: "🤵 Bow tie", cost: 50 },
  { id: "star", en: "⭐ Star", cost: 80 }, { id: "chef", en: "👨‍🍳 Chef hat", cost: 80 }, { id: "headphones", en: "🎧 Headphones", cost: 100 },
  { id: "crown", en: "👑 Crown", cost: 150 }, { id: "tiara", en: "💎 Tiara", cost: 150 }, { id: "halo", en: "😇 Halo", cost: 200 },
];
export const FREE_ACCESSORIES = ACCESSORIES.filter((a) => a.cost === 0).map((a) => a.id);

// treats to feed your pet (bought in packs, eaten one at a time)
export const TREATS = [
  { id: "shrimp", emoji: "🦐", en: "Shrimp snacks", zh: "虾虾零食", pack: 5, cost: 5 },
  { id: "pudding", emoji: "🍮", en: "Mini puddings", zh: "迷你布丁", pack: 3, cost: 6 },
  { id: "mooncake", emoji: "🥮", en: "Mooncakes", zh: "月饼", pack: 2, cost: 8 },
  { id: "cake", emoji: "🍰", en: "Party cake", zh: "派对蛋糕", pack: 1, cost: 10 },
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
// One discount per order, no stacking: the first-order welcome 5% OR points (100 = $5 off).
export type DiscountOptions = {
  welcome: { rate: number; label: string } | null;
  points: number; // spendable balance
};
export type DiscountChoice = { kind?: "none" | "welcome" | "points"; blocks?: number };

export function maxBlocks(balance: number, subtotal: number) {
  return Math.max(0, Math.min(Math.floor(balance / REDEEM_BLOCK), Math.floor(subtotal / REDEEM_VALUE)));
}

// Pure: same maths on the client (preview) and the server (truth).
export function applyDiscount(opts: DiscountOptions | null, choice: DiscountChoice, subtotal: number) {
  const none = { kind: "none" as const, amount: 0, pointsUsed: 0, label: "" };
  if (!opts) return none;
  if (choice.kind === "welcome" && opts.welcome) {
    return { kind: "welcome" as const, amount: Math.round(subtotal * opts.welcome.rate * 100) / 100, pointsUsed: 0, label: opts.welcome.label };
  }
  if (choice.kind === "points") {
    const blocks = Math.max(0, Math.min(Math.floor(Number(choice.blocks) || 0), maxBlocks(opts.points, subtotal)));
    if (!blocks) return none;
    return { kind: "points" as const, amount: blocks * REDEEM_VALUE, pointsUsed: blocks * REDEEM_BLOCK, label: `${blocks * REDEEM_BLOCK} points` };
  }
  return none;
}
