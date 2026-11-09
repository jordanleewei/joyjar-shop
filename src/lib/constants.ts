export const TONES: Record<string, any> = {
  matcha:    { dessert:"#cdd9b4", dessertTop:"#e3ead0", label:"#7d6a3c", labelInk:"#fbf7ee", swatch:"#9bb068", nameEn:"Matcha",    nameZh:"抹茶" },
  sesame:    { dessert:"#6f6a66", dessertTop:"#8d8884", label:"#2f2c29", labelInk:"#ece9e4", swatch:"#4a4642", nameEn:"Sesame",    nameZh:"芝麻" },
  date:      { dessert:"#cf9a7a", dessertTop:"#e0b194", label:"#8a3b2c", labelInk:"#fbeee6", swatch:"#b25a3e", nameEn:"Red Date",  nameZh:"红枣" },
  ginseng:   { dessert:"#e0cf9a", dessertTop:"#efe3bf", label:"#8a6f33", labelInk:"#fdf8e9", swatch:"#c9ad5f", nameEn:"Ginseng",   nameZh:"参" },
  coconut:   { dessert:"#ece5d3", dessertTop:"#f5f0e4", label:"#9a8a63", labelInk:"#fffdf7", swatch:"#ddd2b8", nameEn:"Coconut",   nameZh:"椰" },
  osmanthus: { dessert:"#ecd9a8", dessertTop:"#f4e8c6", label:"#9c7d2f", labelInk:"#fffaf0", swatch:"#e2c878", nameEn:"Osmanthus", nameZh:"桂花" },
  rose:      { dessert:"#e6bcc0", dessertTop:"#f1d4d7", label:"#9a3f54", labelInk:"#fff4f5", swatch:"#d48691", nameEn:"Rose",     nameZh:"玫瑰" },
  // current line-up
  pandan:    { dessert:"#bcd6a4", dessertTop:"#d8e8c6", label:"#3f6b3a", labelInk:"#f4f9ee", swatch:"#6e9f5a", nameEn:"Pandan",   nameZh:"班兰" },
  noir:      { dessert:"#5b5260", dessertTop:"#7a7180", label:"#2a2330", labelInk:"#efe9f2", swatch:"#3a3140", nameEn:"Noir",     nameZh:"墨玉" },
  calm:      { dessert:"#d8dcb8", dessertTop:"#e9ebd4", label:"#7d7a4a", labelInk:"#fbfaf0", swatch:"#a8ad78", nameEn:"Calm",     nameZh:"清心" },
};

export const OPTION_GROUPS: Record<string, any> = {
  sweet: { id:"sweet", label:"Sweetness", labelZh:"糖度", def:"less",
    choices:[ {id:"less",label:"Less Sugar",zh:"少糖"}, {id:"none",label:"No Sugar",zh:"无糖"} ] },
  temp:  { id:"temp", label:"Serve", labelZh:"冷热", def:"cold",
    choices:[ {id:"cold",label:"Cold",zh:"冻"}, {id:"hot",label:"Hot",zh:"热"} ] },
  milk:  { id:"milk", label:"Milk", labelZh:"奶", def:"milk",
    choices:[ {id:"milk",label:"With Milk",zh:"加奶"}, {id:"soy",label:"Soy Milk",zh:"豆奶"} ] },
};

export const OPTION_ORDER = ["sweet", "temp", "milk"];
// options offered for whole boxes (per-flavour options come from product.options)
export const BOX_OPTIONS = ["sweet"];

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
  { en:"Naturally rich in collagen", zh:"天然胶原",
    body:"Fish maw is one of the sea's eight treasures, loved for its natural collagen and protein. It's what gives every jar that bouncy, duang-duang bite.",
    bodyZh:"花胶是海八珍之一，天然富含胶原蛋白与蛋白质，造就每一口Q弹口感。" },
  { en:"Double-boiled, never rushed", zh:"隔水慢炖",
    body:"Every jar is double-boiled for a full hour, the traditional way. No shortcuts, no powders pretending to be the real thing.",
    bodyZh:"每一罐都隔水慢炖整整一小时，传统做法，不走捷径。" },
  { en:"No preservatives", zh:"零防腐剂",
    body:"Hot-filled and vacuum sealed in our kitchen, so the lid does the preserving. Keep it chilled and enjoy within 6–7 days.",
    bodyZh:"高温灌装、真空密封，无需防腐剂。冷藏保存，6–7天内享用。" },
  { en:"Less sugar or none", zh:"少糖或无糖",
    body:"Sweetened gently with coconut sugar or rock sugar, and every jar can be made with no sugar at all. You choose.",
    bodyZh:"以椰糖或冰糖轻轻调味，每一款都可选无糖。" },
];

export const DISCLAIMER = "Our jars are traditional dietary food intended to support general well-being. They are not intended to diagnose, treat, cure, or prevent any disease.";
export const DISCLAIMER_ZH = "本产品为传统膳食食品，旨在支持日常身体保养，并非用于诊断、治疗、治愈或预防任何疾病。";

export const PROCESS = [
  { id:"steam",  cn:"蒸", zh:"蒸",       en:"Steam",            time:"5–8 min",
    text:"Dried fish maw is rinsed and steamed over high heat with ginger. It softens, shrinks and curls up naturally.",
    textZh:"干花胶洗净后加姜片大火蒸，自然收缩卷起。" },
  { id:"chill",  cn:"冰", zh:"冰镇",     en:"Ice bath",         time:"12–24 h",
    text:"Straight into iced water with ginger and lemon, sealed and chilled overnight. This is how we get zero fishy taste.",
    textZh:"放入加了姜片和柠檬的冰水，密封冷藏一夜，去腥的秘诀。" },
  { id:"prep",   cn:"备", zh:"备料",     en:"Prep the extras",  time:"2–3 h soak",
    text:"Beans, grains, red dates and longan are soaked and pre-cooked, so everything turns tender at the same time.",
    textZh:"豆类、谷物、红枣与桂圆提前浸泡预煮，让每样食材同时软糯。" },
  { id:"stew",   cn:"炖", zh:"隔水慢炖", en:"Double-boil",      time:"1 hour",
    text:"Maw and ingredients go into a stewing pot that sits inside a pot of water. Slow, gentle heat for a full hour.",
    textZh:"花胶与配料放入炖盅，隔水小火慢炖整整一小时。" },
  { id:"finish", cn:"收", zh:"收尾",     en:"Finish",           time:"10–15 min",
    text:"Milk, pandan, matcha, rose or sesame goes in last with the sugar of your choice. Lid on, one final stew.",
    textZh:"最后加入牛奶与风味，再按你的糖度调味，盖上盖子再炖一会。" },
  { id:"seal",   cn:"封", zh:"热灌装",   en:"Hot-fill & seal",  time:"Peak heat",
    text:"Filled while piping hot and vacuum sealed. As it cools, the lid button sucks down. No preservatives needed.",
    textZh:"趁热灌装、真空密封。冷却后瓶盖中间的小按钮会自动下陷。" },
  { id:"fridge", cn:"藏", zh:"冷藏",     en:"Into your fridge", time:"0–4°C",
    text:"We deliver it chilled. Keep it at 0–4°C and enjoy within 6–7 days. Eat it cold, or steam 10–15 minutes to serve warm.",
    textZh:"冷藏配送。0–4°C保存，6–7天内享用。冷吃或隔水蒸10–15分钟热吃。" },
];

export const SLOGANS = [
  ["Slow-stewed, never rushed", "慢炖不将就"],
  ["Zero fishy taste", "零腥味"],
  ["No preservatives", "零防腐剂"],
  ["Hear the pop", "听见啵一声"],
  ["Made fresh in Singapore", "新加坡新鲜制作"],
  ["Duang duang bouncy", "Q弹胶傲"],
];

export const FAQ = [
  { q:"Does it taste fishy?", qZh:"会有腥味吗？",
    a:"No. Every piece of fish maw is steamed with ginger, then soaked in iced ginger-lemon water for 12–24 hours before we cook it. That step is all about removing the fishy taste." },
  { q:"How do I store it and how long does it last?", qZh:"怎么保存？可以放多久？",
    a:"Refrigerate at 0–4°C as soon as it arrives and enjoy within 6–7 days. Please don't freeze it." },
  { q:"Hot or cold?", qZh:"冷吃还是热吃？",
    a:"Both. Eat it chilled straight from the fridge for the bounciest bite, or steam the jar for 10–15 minutes to enjoy it warm." },
  { q:"What sugar options do you have?", qZh:"有什么糖度选择？",
    a:"Every flavour comes in Less Sugar or No Sugar. Pandan and Rose use coconut sugar; Noir and Calm use rock sugar." },
  { q:"What are the allergens?", qZh:"有什么过敏原？",
    a:"All jars contain milk, fish products, and wheat products containing gluten. Calm also contains tree nuts (almond). Check each flavour's full ingredient list before ordering if you have allergies." },
  { q:"The lid button was already up when I got it.", qZh:"收到时瓶盖按钮已经弹起？",
    a:"Please don't eat it. That means the vacuum seal has broken. Message us with your order number and we'll sort it out." },
  { q:"How does delivery work?", qZh:"怎么配送？",
    a:"We deliver every jar ourselves, chilled, around Singapore. Delivery is free over $50, or you can self pick-up from our studio." },
  { q:"What do JoyJar Club members get?", qZh:"会员有什么福利？",
    a:"Joining is free. You design your own member card with an avatar and a fish maw pet, and you get up to 15% off as you level up through four tiers." },
];
