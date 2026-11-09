import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Safe to re-run: everything is upserted. Flavours not listed here are hidden
// (available = false) rather than deleted, so old orders still make sense.

const ALLERGENS = "Contains milk, fish products, and wheat products containing gluten."
const ALLERGENS_CALM = "Contains milk, fish products, tree nuts (almond), and wheat products containing gluten."

const DEFAULT_PRODUCTS = [
  { id: "pandan", tone: "pandan", cap: "PANDAN", sortOrder: 1,
    name: "Pandan Fish Maw", nameZh: "班兰花胶",
    flavorEn: "Pandan", flavorZh: "班兰",
    tagline: "A taste of Nanyang, a radiant glow of confidence.", taglineZh: "一罐南洋风，双重胶傲美",
    blurb: "Golden fish maw slow-stewed with mung beans, red dates and longan, finished in fresh pandan juice and milk, sweetened with coconut sugar.",
    blurbZh: "花胶慢炖绿豆、红枣与桂圆，融入新鲜班兰汁与牛奶，以椰糖轻轻提甜。",
    ingredients: "Milk, Fish Maw, Pandan Juice, Mung Beans, Red Dates, Dried Longan, and Coconut Sugar",
    ingredientsZh: "牛奶、花胶、班兰汁、绿豆、红枣、桂圆干、椰糖",
    notes: ["Fresh pandan juice", "Mung bean · Red date · Longan", "Coconut sugar"],
    notesZh: ["新鲜班兰汁", "绿豆 · 红枣 · 桂圆", "椰糖"] },

  { id: "noir", tone: "noir", cap: "NOIR", sortOrder: 2,
    name: "Noir Fish Maw", nameZh: "墨玉花胶",
    flavorEn: "Noir", flavorZh: "墨玉",
    tagline: "Late nights, BEGONE! Peak state, ON!", taglineZh: "熬夜退退退，状态对对对！",
    blurb: "Fish maw with purple rice, red dates and longan, set in a toasty black bean and sesame milk with rock sugar.",
    blurbZh: "花胶配紫米、红枣与桂圆，融入香浓黑豆芝麻奶，冰糖调味。",
    ingredients: "Milk, Fish Maw, Black Bean Sesame Powder, Purple Rice, Red Dates, Dried Longan, and Rock Sugar",
    ingredientsZh: "牛奶、花胶、黑豆芝麻粉、紫米、红枣、桂圆干、冰糖",
    notes: ["Black bean & sesame", "Purple rice · Red date · Longan", "Rock sugar"],
    notesZh: ["黑豆芝麻", "紫米 · 红枣 · 桂圆", "冰糖"] },

  { id: "calm", tone: "calm", cap: "CALM", sortOrder: 3, allergens: ALLERGENS_CALM,
    name: "Calm Fish Maw", nameZh: "清心花胶",
    flavorEn: "Calm", flavorZh: "清心",
    tagline: "Keep calm and scoop on.", taglineZh: "清心一口，烦恼退退退",
    blurb: "Fish maw with oat groats, longan and red dates in a gentle matcha almond milk, lightly sweetened with rock sugar.",
    blurbZh: "花胶配燕麦粒、桂圆与红枣，融入清新抹茶杏仁奶，冰糖淡甜。",
    ingredients: "Milk, Fish Maw, Matcha and Almond Powder, Oat Groats, Dried Longan, Red Dates, and Rock Sugar",
    ingredientsZh: "牛奶、花胶、抹茶杏仁粉、燕麦粒、桂圆干、红枣、冰糖",
    notes: ["Matcha & almond", "Oat groats · Longan · Red date", "Rock sugar"],
    notesZh: ["抹茶杏仁", "燕麦粒 · 桂圆 · 红枣", "冰糖"] },

  { id: "rose", tone: "rose", cap: "ROSE", sortOrder: 4,
    name: "Rose Fish Maw", nameZh: "玫瑰花胶",
    flavorEn: "Rose", flavorZh: "玫瑰",
    tagline: "Rosy cheeks, zero filter needed.", taglineZh: "玫瑰一口，素颜也胶傲",
    blurb: "Fish maw with red beans, longan and red dates in a fragrant rose milk, sweetened with coconut sugar.",
    blurbZh: "花胶配红豆、桂圆与红枣，融入芬芳玫瑰奶，椰糖调味。",
    ingredients: "Milk, Fish Maw, Rose Powder, Red Beans, Dried Longan, Red Dates, and Coconut Sugar",
    ingredientsZh: "牛奶、花胶、玫瑰粉、红豆、桂圆干、红枣、椰糖",
    notes: ["Rose powder", "Red bean · Longan · Red date", "Coconut sugar"],
    notesZh: ["玫瑰粉", "红豆 · 桂圆 · 红枣", "椰糖"] },
];

const DEFAULT_BUNDLES = [
  { id: "jar-6", title: "Box of Six", titleZh: "六瓶礼盒", qty: 6, price: 68, featured: true,
    note: "Best value · gift-ready.", noteZh: "最超值 · 礼盒装" },
  { id: "jar-1", title: "Single Jar", titleZh: "单瓶", qty: 1, price: 15.8, featured: false,
    note: "One jar to taste the ritual.", noteZh: "单瓶浅尝" },
];

const DEFAULT_DELIVERY = {
  freeThreshold: 50,
  baseFee: 6,
  slots: [
    "Tomorrow · 明日  10:00–13:00",
    "Tomorrow · 明日  18:00–21:00",
    "Sat · 周六  10:00–13:00",
    "Sun · 周日  14:00–17:00",
  ],
  zones: [
    { id: "central", name: "Central", nameZh: "中区", fee: 6 },
    { id: "east", name: "East", nameZh: "东区", fee: 6 },
    { id: "west", name: "West", nameZh: "西区", fee: 8 },
    { id: "north", name: "North / NE", nameZh: "北区", fee: 8 },
  ],
  note: "We self-deliver every jar by hand, chilled and ready to enjoy.",
};

async function main() {
  console.log("Seeding database...")

  const ids = DEFAULT_PRODUCTS.map((p) => p.id)
  for (const p of DEFAULT_PRODUCTS) {
    const data = {
      name: p.name, nameZh: p.nameZh, flavorEn: p.flavorEn, flavorZh: p.flavorZh,
      blurb: p.blurb, blurbZh: p.blurbZh,
      notes: JSON.stringify(p.notes), notesZh: JSON.stringify(p.notesZh),
      options: JSON.stringify({ sweet: true }),
      tone: p.tone, cap: p.cap, available: true,
      tagline: p.tagline, taglineZh: p.taglineZh,
      ingredients: p.ingredients, ingredientsZh: p.ingredientsZh,
      allergens: (p as any).allergens || ALLERGENS, sortOrder: p.sortOrder,
    }
    await prisma.product.upsert({ where: { id: p.id }, update: data, create: { id: p.id, ...data } })
  }
  // hide retired flavours (matcha, sesame, …) instead of deleting them
  await prisma.product.updateMany({ where: { id: { notIn: ids } }, data: { available: false } })

  for (const b of DEFAULT_BUNDLES) {
    const { id, ...data } = b
    await prisma.bundle.upsert({ where: { id }, update: data, create: b })
  }

  const cfg = { freeThreshold: DEFAULT_DELIVERY.freeThreshold, baseFee: DEFAULT_DELIVERY.baseFee, note: DEFAULT_DELIVERY.note }
  await prisma.deliveryConfig.upsert({ where: { id: 1 }, update: cfg, create: { id: 1, ...cfg } })

  await prisma.deliverySlot.deleteMany()
  for (let i = 0; i < DEFAULT_DELIVERY.slots.length; i++) {
    await prisma.deliverySlot.create({ data: { text: DEFAULT_DELIVERY.slots[i], orderIndex: i } })
  }

  for (const z of DEFAULT_DELIVERY.zones) {
    const { id, ...data } = z
    await prisma.deliveryZone.upsert({ where: { id }, update: data, create: z })
  }

  console.log("Database seeded!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
