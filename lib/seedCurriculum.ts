import { PrismaClient } from "@prisma/client";
import { ALL_CURRICULUM_UNITS, serializeQuestion } from "@/data/questionBank";
import { DEMO_USER_ID } from "./constants";

export async function seedCurriculumUnits(prisma: PrismaClient) {
  const gradeMap = new Map(
    (await prisma.grade.findMany()).map((g) => [g.code, g.id])
  );

  let unitCount = 0;
  let levelCount = 0;
  let questionCount = 0;

  for (const unitData of ALL_CURRICULUM_UNITS) {
    const gradeId = gradeMap.get(unitData.grade);
    if (!gradeId) {
      console.warn(`⚠️ 跳過單元「${unitData.name}」：找不到年級 ${unitData.grade}`);
      continue;
    }

    const existing = await prisma.unit.findFirst({
      where: {
        gradeId,
        semester: unitData.semester,
        subject: unitData.subject,
        name: unitData.name,
      },
    });

    if (existing) continue;

    const maxSort = await prisma.unit.aggregate({
      where: { gradeId, semester: unitData.semester, subject: unitData.subject },
      _max: { sortOrder: true },
    });

    const description = `${unitData.description}\n📚 題庫來源：${unitData.source}`;

    const unit = await prisma.unit.create({
      data: {
        gradeId,
        semester: unitData.semester,
        subject: unitData.subject,
        name: unitData.name,
        description,
        sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      },
    });

    await prisma.progress.upsert({
      where: { userId_unitId: { userId: DEMO_USER_ID, unitId: unit.id } },
      create: { userId: DEMO_USER_ID, unitId: unit.id, completedLevels: 0, totalStars: 0 },
      update: {},
    });

    unitCount++;

    for (let li = 0; li < unitData.levels.length; li++) {
      const levelData = unitData.levels[li];
      const level = await prisma.level.create({
        data: {
          unitId: unit.id,
          name: levelData.name,
          sortOrder: li + 1,
        },
      });
      levelCount++;

      for (let qi = 0; qi < levelData.questions.length; qi++) {
        const q = serializeQuestion(levelData.questions[qi]);
        await prisma.question.create({
          data: {
            levelId: level.id,
            type: q.type,
            prompt: q.prompt,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation,
            sortOrder: qi + 1,
          },
        });
        questionCount++;
      }
    }
  }

  return { unitCount, levelCount, questionCount };
}
