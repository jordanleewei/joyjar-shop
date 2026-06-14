import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

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

const DEFAULT_BUNDLES = [
  { id:"jar-6", title:"Box of Six", titleZh:"六瓶禮盒", qty:6, price:68, featured:true,
    note:"Best value · gift-ready.", noteZh:"最超值 · 禮盒裝" },
  { id:"jar-1", title:"Single Jar", titleZh:"單瓶", qty:1, price:15.8, featured:false,
    note:"One jar to taste the ritual.", noteZh:"單瓶淺嚐" },
];

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

async function main() {
  console.log("Seeding database...")

  // Clear existing data
  await prisma.product.deleteMany()
  await prisma.bundle.deleteMany()
  await prisma.deliveryConfig.deleteMany()
  await prisma.deliverySlot.deleteMany()
  await prisma.deliveryZone.deleteMany()

  // Seed Products
  for (const product of DEFAULT_PRODUCTS) {
    await prisma.product.create({
      data: {
        id: product.id,
        name: product.name,
        nameZh: product.nameZh,
        flavorEn: product.flavorEn,
        flavorZh: product.flavorZh,
        blurb: product.blurb,
        blurbZh: product.blurbZh,
        notes: JSON.stringify(product.notes),
        notesZh: JSON.stringify(product.notesZh),
        options: JSON.stringify(product.options),
        tone: product.tone,
        cap: product.cap,
        available: product.available,
      }
    })
  }

  // Seed Bundles
  for (const bundle of DEFAULT_BUNDLES) {
    await prisma.bundle.create({
      data: {
        id: bundle.id,
        title: bundle.title,
        titleZh: bundle.titleZh,
        qty: bundle.qty,
        price: bundle.price,
        featured: bundle.featured,
        note: bundle.note,
        noteZh: bundle.noteZh,
      }
    })
  }

  // Seed Delivery Config
  await prisma.deliveryConfig.create({
    data: {
      id: 1,
      freeThreshold: DEFAULT_DELIVERY.freeThreshold,
      baseFee: DEFAULT_DELIVERY.baseFee,
      note: DEFAULT_DELIVERY.note,
    }
  })

  // Seed Delivery Slots
  for (let i = 0; i < DEFAULT_DELIVERY.slots.length; i++) {
    await prisma.deliverySlot.create({
      data: {
        text: DEFAULT_DELIVERY.slots[i],
        orderIndex: i,
      }
    })
  }

  // Seed Delivery Zones
  for (const zone of DEFAULT_DELIVERY.zones) {
    await prisma.deliveryZone.create({
      data: {
        id: zone.id,
        name: zone.name,
        nameZh: zone.nameZh,
        fee: zone.fee,
      }
    })
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
