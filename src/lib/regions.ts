// Singapore's 5 delivery regions. The postal code suggests one; customers can change it.
export const REGIONS = [
  { id: "central", en: "Central", zh: "中区", areas: "Orchard, Marina Bay, Bukit Merah, Queenstown, Toa Payoh, Bishan, Geylang, Kallang, Marine Parade" },
  { id: "east", en: "East", zh: "东区", areas: "Tampines, Bedok, Pasir Ris, Changi, Paya Lebar" },
  { id: "north", en: "North", zh: "北区", areas: "Woodlands, Yishun, Sembawang, Mandai, Sungei Kadut" },
  { id: "northeast", en: "North-East", zh: "东北区", areas: "Sengkang, Punggol, Hougang, Serangoon, Ang Mo Kio" },
  { id: "west", en: "West", zh: "西区", areas: "Jurong East, Jurong West, Clementi, Bukit Batok, Choa Chu Kang, Tuas" },
] as const;

export type RegionId = (typeof REGIONS)[number]["id"];

export function regionName(id: string) {
  const r = REGIONS.find((x) => x.id === id);
  return r ? `${r.en} · ${r.zh}` : "No region";
}

// First two digits of a postal code (the postal sector) -> region. A best guess only.
const SECTORS: Record<string, RegionId> = {};
const put = (from: number, to: number, r: RegionId) => { for (let i = from; i <= to; i++) SECTORS[String(i).padStart(2, "0")] = r; };
put(1, 10, "central");   // Raffles Place, Marina, Tanjong Pagar, Telok Blangah, HarbourFront
put(11, 13, "west");     // Pasir Panjang, West Coast, Clementi
put(14, 45, "central");  // Queenstown, Tiong Bahru, Orchard, Bukit Timah, Novena, Toa Payoh, Geylang, Kallang, Marine Parade
put(46, 52, "east");     // Bedok, Upper East Coast, Changi, Loyang, Tampines, Pasir Ris
put(53, 56, "northeast");// Hougang, Serangoon, Punggol, Sengkang, Ang Mo Kio
put(57, 59, "central");  // Bishan, Upper Bukit Timah
put(60, 71, "west");     // Jurong, Tuas, Bukit Batok, Choa Chu Kang, Bukit Panjang, Tengah
put(72, 78, "north");    // Kranji, Woodlands, Yishun, Sembawang, Upper Thomson, Mandai
put(79, 80, "northeast");// Seletar, Yio Chu Kang
SECTORS["81"] = "east";  // Changi
SECTORS["82"] = "northeast"; // Punggol, Sengkang

export function regionFromPostal(postal: string): RegionId | "" {
  const p = String(postal || "").trim();
  if (!/^\d{6}$/.test(p)) return "";
  return SECTORS[p.slice(0, 2)] || "";
}
