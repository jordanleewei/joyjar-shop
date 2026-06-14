export const TONES: Record<string, any> = {
  matcha:    { dessert:"#cdd9b4", dessertTop:"#e3ead0", label:"#7d6a3c", labelInk:"#fbf7ee", swatch:"#9bb068", nameEn:"Matcha",    nameZh:"抹茶" },
  sesame:    { dessert:"#6f6a66", dessertTop:"#8d8884", label:"#2f2c29", labelInk:"#ece9e4", swatch:"#4a4642", nameEn:"Sesame",    nameZh:"芝麻" },
  date:      { dessert:"#cf9a7a", dessertTop:"#e0b194", label:"#8a3b2c", labelInk:"#fbeee6", swatch:"#b25a3e", nameEn:"Red Date",  nameZh:"紅棗" },
  ginseng:   { dessert:"#e0cf9a", dessertTop:"#efe3bf", label:"#8a6f33", labelInk:"#fdf8e9", swatch:"#c9ad5f", nameEn:"Ginseng",   nameZh:"參" },
  coconut:   { dessert:"#ece5d3", dessertTop:"#f5f0e4", label:"#9a8a63", labelInk:"#fffdf7", swatch:"#ddd2b8", nameEn:"Coconut",   nameZh:"椰" },
  osmanthus: { dessert:"#ecd9a8", dessertTop:"#f4e8c6", label:"#9c7d2f", labelInk:"#fffaf0", swatch:"#e2c878", nameEn:"Osmanthus", nameZh:"桂花" },
  rose:      { dessert:"#e6bcc0", dessertTop:"#f1d4d7", label:"#9a3f54", labelInk:"#fff4f5", swatch:"#d48691", nameEn:"Rose",     nameZh:"玫瑰" },
};

export const OPTION_GROUPS: Record<string, any> = {
  sweet: { id:"sweet", label:"Sweetness", labelZh:"糖度", def:"sugar",
    choices:[ {id:"sugar",label:"Sugar",zh:"加糖"}, {id:"no-sugar",label:"No Sugar",zh:"無糖"} ] },
  temp:  { id:"temp", label:"Serve", labelZh:"冷熱", def:"cold",
    choices:[ {id:"cold",label:"Cold",zh:"凍"}, {id:"hot",label:"Hot",zh:"熱"} ] },
  milk:  { id:"milk", label:"Milk", labelZh:"奶", def:"milk",
    choices:[ {id:"milk",label:"With Milk",zh:"加奶"}, {id:"soy",label:"Soy Milk",zh:"豆奶"} ] },
};

export const OPTION_ORDER = ["sweet", "temp", "milk"];

export function optionDefaults(optionsObj: any) {
  const o: any = {};
  OPTION_ORDER.forEach((k) => { if (optionsObj && optionsObj[k]) o[k] = OPTION_GROUPS[k].def; });
  return o;
}

export function optionChoiceLabel(groupId: string, choiceId: string, lang: string) {
  const g = OPTION_GROUPS[groupId]; if (!g) return choiceId;
  const c = g.choices.find((x: any) => x.id === choiceId); if (!c) return choiceId;
  return lang === "zh" ? c.zh : c.label;
}

export function optionSummary(options: any, lang: string) {
  if (!options) return "";
  return OPTION_ORDER.filter((k) => options[k])
    .map((k) => optionChoiceLabel(k, options[k], lang)).join(" · ");
}

export const BENEFITS = [
  { en:"Nourishing & Anti-aging", zh:"養顏抗衰",
    body:"Rich in easily-absorbed collagen, promoting skin regeneration for smooth, supple, elastic skin while softening wrinkles.",
    bodyZh:"富含易吸收膠原蛋白，促進肌膚再生，維持光滑緊緻彈性，淡化細紋。" },
  { en:"Kidney-tonifying & Essence-boosting", zh:"補腎益精",
    body:"Per the Compendium of Materia Medica, fish maw nourishes the kidneys and tendons — for those with lower-back fatigue and mental exhaustion.",
    bodyZh:"《本草綱目》載花膠補腎益精、養筋脈，宜腰膝痠軟、神疲乏力者。" },
  { en:"Yin-nourishing & Moistening", zh:"滋陰潤燥",
    body:"Sweet and neutral in nature — nourishes yin, moistens the lungs and replenishes qi and blood. A balm for dry skin, mouth and throat.",
    bodyZh:"性味甘平，滋陰潤肺、補益氣血，緩解肌膚乾燥、口乾咽燥。" },
  { en:"Strengthening & Repairing", zh:"強身修復",
    body:"High-protein, low-fat and easily absorbed — supporting recovery after illness, surgery, or childbirth.",
    bodyZh:"高蛋白低脂、易於吸收，助病後、術後與產後調養修復。" },
];
