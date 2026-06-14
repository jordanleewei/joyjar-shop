// data.jsx — JoyJar default catalog, options, tones, delivery, benefits.
// These are DEFAULTS; the live editable copies live in store.jsx (localStorage).

// ---- Jar tones (also used by the admin colour picker) ----
const TONES = {
  matcha:    { dessert:"#cdd9b4", dessertTop:"#e3ead0", label:"#7d6a3c", labelInk:"#fbf7ee", swatch:"#9bb068", nameEn:"Matcha",    nameZh:"抹茶" },
  sesame:    { dessert:"#6f6a66", dessertTop:"#8d8884", label:"#2f2c29", labelInk:"#ece9e4", swatch:"#4a4642", nameEn:"Sesame",    nameZh:"芝麻" },
  date:      { dessert:"#cf9a7a", dessertTop:"#e0b194", label:"#8a3b2c", labelInk:"#fbeee6", swatch:"#b25a3e", nameEn:"Red Date",  nameZh:"紅棗" },
  ginseng:   { dessert:"#e0cf9a", dessertTop:"#efe3bf", label:"#8a6f33", labelInk:"#fdf8e9", swatch:"#c9ad5f", nameEn:"Ginseng",   nameZh:"參" },
  coconut:   { dessert:"#ece5d3", dessertTop:"#f5f0e4", label:"#9a8a63", labelInk:"#fffdf7", swatch:"#ddd2b8", nameEn:"Coconut",   nameZh:"椰" },
  osmanthus: { dessert:"#ecd9a8", dessertTop:"#f4e8c6", label:"#9c7d2f", labelInk:"#fffaf0", swatch:"#e2c878", nameEn:"Osmanthus", nameZh:"桂花" },
  rose:      { dessert:"#e6bcc0", dessertTop:"#f1d4d7", label:"#9a3f54", labelInk:"#fff4f5", swatch:"#d48691", nameEn:"Rose",     nameZh:"玫瑰" },
};

// ---- Option groups (sweetness / temperature / milk) ----
const OPTION_GROUPS = {
  sweet: { id:"sweet", label:"Sweetness", labelZh:"糖度", def:"sugar",
    choices:[ {id:"sugar",label:"Sugar",zh:"加糖"}, {id:"no-sugar",label:"No Sugar",zh:"無糖"} ] },
  temp:  { id:"temp", label:"Serve", labelZh:"冷熱", def:"cold",
    choices:[ {id:"cold",label:"Cold",zh:"凍"}, {id:"hot",label:"Hot",zh:"熱"} ] },
  milk:  { id:"milk", label:"Milk", labelZh:"奶", def:"milk",
    choices:[ {id:"milk",label:"With Milk",zh:"加奶"}, {id:"soy",label:"Soy Milk",zh:"豆奶"} ] },
};
const OPTION_ORDER = ["sweet", "temp", "milk"];

function optionDefaults(product) {
  const o = {};
  OPTION_ORDER.forEach((k) => { if (product.options && product.options[k]) o[k] = OPTION_GROUPS[k].def; });
  return o;
}
function optionChoiceLabel(groupId, choiceId, lang) {
  const g = OPTION_GROUPS[groupId]; if (!g) return choiceId;
  const c = g.choices.find((x) => x.id === choiceId); if (!c) return choiceId;
  return lang === "zh" ? c.zh : c.label;
}
function optionSummary(options, lang) {
  if (!options) return "";
  return OPTION_ORDER.filter((k) => options[k])
    .map((k) => optionChoiceLabel(k, options[k], lang)).join(" · ");
}

// ---- Default catalog: 6 flavours ----
const DEFAULT_PRODUCTS = [
  { id:"matcha", tone:"matcha", cap:"MATCHA", available:true,
    name:"Matcha Lily Bulb Lotus Seed Fish Maw", nameZh:"抹茶百合蓮子花膠",
    flavorEn:"Matcha · Lily · Lotus", flavorZh:"抹茶百合蓮子",
    blurb:"Stone-ground matcha folded into silky collagen broth, with lily bulb and lotus seed.",
    blurbZh:"石磨抹茶融入絲滑花膠，佐百合與蓮子。",
    notes:["Stone-ground matcha","Lily bulb · Lotus seed","Collagen-rich"],
    notesZh:["石磨抹茶","鮮百合 · 蓮子","豐潤花膠"],
    options:{ sweet:true, temp:true, milk:true } },

  { id:"sesame", tone:"sesame", cap:"SESAME", available:true,
    name:"Black Sesame Walnut Fish Maw", nameZh:"黑芝麻核桃花膠",
    flavorEn:"Black Sesame · Walnut", flavorZh:"黑芝麻核桃",
    blurb:"Toasted black sesame and walnut, stone-ground into a velvety, nutty stew.",
    blurbZh:"炒香黑芝麻與核桃研磨，濃郁綿滑。",
    notes:["Toasted black sesame","Walnut","Velvety"],
    notesZh:["焙香黑芝麻","核桃","綿滑"],
    options:{ sweet:true, temp:true, milk:true } },

  { id:"date", tone:"date", cap:"RED DATE", available:true,
    name:"Red Date & Longan Fish Maw", nameZh:"紅棗桂圓花膠",
    flavorEn:"Red Date · Longan", flavorZh:"紅棗桂圓",
    blurb:"Warming red dates and dried longan stewed for a naturally sweet, blood-nourishing jar.",
    blurbZh:"紅棗桂圓慢燉，自然回甘，補血暖身。",
    notes:["Red dates","Dried longan","Naturally sweet"],
    notesZh:["紅棗","桂圓乾","自然回甘"],
    options:{ sweet:true, temp:true, milk:false } },

  { id:"ginseng", tone:"ginseng", cap:"GINSENG", available:true,
    name:"American Ginseng & Goji Fish Maw", nameZh:"花旗參枸杞花膠",
    flavorEn:"Ginseng · Goji", flavorZh:"花旗參枸杞",
    blurb:"Cooling American ginseng with goji berries — restorative without the heat.",
    blurbZh:"花旗參配枸杞，清補不燥。",
    notes:["American ginseng","Goji berry","Restorative"],
    notesZh:["花旗參","枸杞","清補"],
    options:{ sweet:true, temp:true, milk:false } },

  { id:"coconut", tone:"coconut", cap:"COCONUT", available:true,
    name:"Coconut Snow Fungus Fish Maw", nameZh:"椰皇雪耳花膠",
    flavorEn:"Coconut · Snow Fungus", flavorZh:"椰皇雪耳",
    blurb:"Fragrant coconut and snow fungus for a light, skin-loving, collagen-rich jar.",
    blurbZh:"椰皇雪耳，清潤養顏，膠質豐盈。",
    notes:["Coconut","Snow fungus","Light & fragrant"],
    notesZh:["椰皇","雪耳","清潤"],
    options:{ sweet:true, temp:true, milk:true } },

  { id:"osmanthus", tone:"osmanthus", cap:"OSMANTHUS", available:true,
    name:"Osmanthus & Snow Pear Fish Maw", nameZh:"桂花雪梨花膠",
    flavorEn:"Osmanthus · Snow Pear", flavorZh:"桂花雪梨",
    blurb:"Honeyed osmanthus and snow pear — throat-soothing and delicately floral.",
    blurbZh:"桂花蜜香配雪梨，潤喉清雅。",
    notes:["Osmanthus","Snow pear","Floral & moistening"],
    notesZh:["桂花","雪梨","潤燥"],
    options:{ sweet:true, temp:true, milk:false } },
];

// ---- Packs / pricing ----
const DEFAULT_BUNDLES = [
  { id:"jar-6", title:"Box of Six", titleZh:"六瓶禮盒", qty:6, price:68, featured:true,
    note:"Best value · gift-ready.", noteZh:"最超值 · 禮盒裝" },
  { id:"jar-1", title:"Single Jar", titleZh:"單瓶", qty:1, price:15.8,
    note:"One jar to taste the ritual.", noteZh:"單瓶淺嚐" },
];

// ---- Delivery configuration ----
const DEFAULT_DELIVERY = {
  freeThreshold: 50,
  baseFee: 6,
  slots: [
    "Tomorrow · 明日  10:00–13:00",
    "Tomorrow · 明日  18:00–21:00",
    "Sat · 週六  10:00–13:00",
    "Sun · 週日  14:00–17:00",
  ],
  zones: [
    { id:"central", name:"Central", nameZh:"中區", fee:6 },
    { id:"east",    name:"East",    nameZh:"東區", fee:6 },
    { id:"west",    name:"West",    nameZh:"西區", fee:8 },
    { id:"north",   name:"North / NE", nameZh:"北區", fee:8 },
  ],
  note: "We self-deliver every jar by hand, chilled and ready to enjoy.",
};

const BENEFITS = [
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

Object.assign(window, {
  TONES, OPTION_GROUPS, OPTION_ORDER, optionDefaults, optionChoiceLabel, optionSummary,
  DEFAULT_PRODUCTS, DEFAULT_BUNDLES, DEFAULT_DELIVERY, BENEFITS,
});
