import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.requestLog.deleteMany();
  await prisma.queueTicket.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.apiKey.deleteMany();

  const skillTable = await prisma.restaurant.create({
    data: {
      name: "SkillTable Noodle Lab",
      latitude: 39.9847,
      longitude: 116.3184,
      address: "Haidian, Beijing (demo)",
      tags: JSON.stringify(["fast", "清淡", "商务"]),
      capabilities: JSON.stringify(["menu", "queue"]),
      provider: "SkillTable",
      externalUrl: "https://example.com/booking",
      categories: {
        create: [
          {
            name: "Noodles",
            sortOrder: 0,
            items: {
              create: [
                {
                  name: "Clear broth noodles",
                  priceCents: 2800,
                  spiceLevel: 0,
                  allergens: JSON.stringify(["gluten"]),
                  available: true,
                },
                {
                  name: "Mala noodles",
                  priceCents: 3200,
                  spiceLevel: 3,
                  allergens: JSON.stringify(["gluten", "peanut"]),
                  available: true,
                },
              ],
            },
          },
          {
            name: "Sides",
            sortOrder: 1,
            items: {
              create: [
                {
                  name: "Pickled cucumber",
                  priceCents: 1200,
                  spiceLevel: 0,
                  available: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.restaurant.create({
    data: {
      name: "Spicy Yard Hotpot",
      latitude: 39.99,
      longitude: 116.32,
      address: "Demo location B",
      tags: JSON.stringify(["川菜", "聚餐"]),
      capabilities: JSON.stringify(["menu"]),
      provider: "SkillTable",
      categories: {
        create: [
          {
            name: "Hotpot bases",
            sortOrder: 0,
            items: {
              create: [
                {
                  name: "Classic spicy pot",
                  priceCents: 8800,
                  spiceLevel: 3,
                  allergens: JSON.stringify(["soy"]),
                  available: true,
                },
                {
                  name: "Mushroom mild pot",
                  priceCents: 7800,
                  spiceLevel: 0,
                  available: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  await prisma.restaurant.create({
    data: {
      name: "Quiet Bento (Express)",
      latitude: 39.98,
      longitude: 116.31,
      address: "Demo location C",
      tags: JSON.stringify(["快", "便当", "孕妇友好"]),
      capabilities: JSON.stringify(["menu"]),
      provider: "SkillTable",
      categories: {
        create: [
          {
            name: "Sets",
            sortOrder: 0,
            items: {
              create: [
                {
                  name: "Grilled fish bento",
                  priceCents: 4200,
                  spiceLevel: 1,
                  available: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  const jinguyuan = await prisma.restaurant.create({
    data: {
      name: "金谷园饺子馆",
      latitude: 39.9625,
      longitude: 116.3568,
      address:
        "营业时间 10:00–22:00。北邮店：杏坛路文教产业园K座南2层；五道口店：五道口东源大厦4层。（菜单价格为平台示意，以门店为准）",
      tags: JSON.stringify([
        "饺子",
        "北邮",
        "金谷园",
        "排队",
        "外卖",
        "打包",
      ]),
      capabilities: JSON.stringify(["menu", "queue"]),
      provider: "jinguyuan-dumpling-skill",
      externalUrl: null,
      mcpStreamableUrl:
        "https://mcp-4g9gkps4c04addd0.service.tcloudbase.com/jgy-mcp",
      skillReferenceUrl:
        "https://github.com/JinGuYuan/jinguyuan-dumpling-skill",
      categories: {
        create: [
          {
            name: "饺子",
            sortOrder: 0,
            items: {
              create: [
                {
                  name: "鲅鱼饺子（两）",
                  priceCents: 1800,
                  spiceLevel: 0,
                  allergens: JSON.stringify(["fish", "gluten"]),
                  available: true,
                  description: "示意价",
                },
                {
                  name: "猪肉韭菜（两）",
                  priceCents: 1500,
                  spiceLevel: 1,
                  allergens: JSON.stringify(["gluten"]),
                  available: true,
                },
                {
                  name: "三鲜饺子（两）",
                  priceCents: 1600,
                  spiceLevel: 0,
                  allergens: JSON.stringify(["gluten", "shellfish"]),
                  available: true,
                },
              ],
            },
          },
          {
            name: "凉菜 / 小菜",
            sortOrder: 1,
            items: {
              create: [
                {
                  name: "葱麻鸡（小份）",
                  priceCents: 2800,
                  spiceLevel: 2,
                  available: true,
                },
                {
                  name: "皮蛋豆腐",
                  priceCents: 1600,
                  spiceLevel: 0,
                  available: true,
                },
              ],
            },
          },
          {
            name: "锅贴 / 其他",
            sortOrder: 2,
            items: {
              create: [
                {
                  name: "猪肉锅贴（两）",
                  priceCents: 1700,
                  spiceLevel: 1,
                  allergens: JSON.stringify(["gluten"]),
                  available: true,
                },
              ],
            },
          },
        ],
      },
    },
  });

  console.log("Seed OK:", {
    skillTableId: skillTable.id,
    jinguyuanId: jinguyuan.id,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
