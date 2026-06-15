import { PrismaClient } from "@prisma/client";
import { seedCurriculumUnits } from "../lib/seedCurriculum";

const prisma = new PrismaClient();

const DEMO_USER_ID = "demo-user";

async function main() {
  // PostgreSQL：用 TRUNCATE 一次清空，避免外鍵刪除順序問題
  await prisma.$executeRawUnsafe(`
    TRUNCATE "WrongAnswer", "GameSession", "Progress", "Question", "Level", "Unit", "Grade", "User" CASCADE;
  `);

  await prisma.user.create({
    data: { id: DEMO_USER_ID, name: "小學霸" },
  });

  const grades = [
    { code: "K1", name: "小班", category: "KINDERGARTEN", sortOrder: 1 },
    { code: "K2", name: "中班", category: "KINDERGARTEN", sortOrder: 2 },
    { code: "K3", name: "大班", category: "KINDERGARTEN", sortOrder: 3 },
    { code: "G1", name: "一年級", category: "ELEMENTARY", sortOrder: 4 },
    { code: "G2", name: "二年級", category: "ELEMENTARY", sortOrder: 5 },
    { code: "G3", name: "三年級", category: "ELEMENTARY", sortOrder: 6 },
    { code: "G4", name: "四年級", category: "ELEMENTARY", sortOrder: 7 },
    { code: "G5", name: "五年級", category: "ELEMENTARY", sortOrder: 8 },
    { code: "G6", name: "六年級", category: "ELEMENTARY", sortOrder: 9 },
  ];

  for (const g of grades) {
    await prisma.grade.create({ data: g });
  }

  const stats = await seedCurriculumUnits(prisma);

  console.log("✅ Seed completed successfully!");
  console.log(`   📦 新增單元：${stats.unitCount}`);
  console.log(`   🎯 新增關卡：${stats.levelCount}`);
  console.log(`   📝 新增題目：${stats.questionCount}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
