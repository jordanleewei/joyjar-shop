// Turning the admin product form into a database row (server only).
import { TONES } from "./constants";

const str = (v: any, max: number) => String(v ?? "").trim().slice(0, max);
const lines = (v: any) => JSON.stringify(String(v ?? "").split(/\n/).map((x) => x.trim()).filter(Boolean).slice(0, 8).map((x) => x.slice(0, 80)));

export function productData(b: any) {
  const flavorEn = str(b.flavorEn, 40);
  if (!flavorEn) throw new Error("Add the flavour name (English).");
  const priceRaw = String(b.price ?? "").trim();
  let price: number | null = null;
  if (priceRaw !== "") {
    price = Math.round(Number(priceRaw) * 100) / 100;
    if (!isFinite(price) || price <= 0 || price > 999) throw new Error("Price should be a number like 15.80.");
  }
  const tone = TONES[b.tone] ? String(b.tone) : "matcha";
  return {
    flavorEn,
    flavorZh: str(b.flavorZh, 20),
    name: str(b.name, 80) || `${flavorEn} Fish Maw`,
    nameZh: str(b.nameZh, 40),
    tagline: str(b.tagline, 140),
    taglineZh: str(b.taglineZh, 80),
    blurb: str(b.blurb, 600),
    blurbZh: str(b.blurbZh, 300),
    ingredients: str(b.ingredients, 600),
    ingredientsZh: str(b.ingredientsZh, 300),
    allergens: str(b.allergens, 400),
    notes: lines(b.notes),
    notesZh: lines(b.notesZh),
    options: JSON.stringify(b.sweet === false ? {} : { sweet: true }),
    tone,
    cap: str(b.cap, 14).toUpperCase() || flavorEn.toUpperCase().slice(0, 14),
    available: b.available !== false,
    sortOrder: Math.max(0, Math.min(999, Math.floor(Number(b.sortOrder) || 0))),
    price,
  };
}

export function slugify(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30) || "flavour";
}
