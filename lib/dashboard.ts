import { PrismaClient } from "@prisma/client";
import { DEMO_USER_ID, SUBJECT_OPTIONS } from "./constants";

export interface SubjectProgress {
  code: string;
  name: string;
  emoji: string;
  completedLevels: number;
  totalLevels: number;
  completionRate: number;
}

export interface UnitProgress {
  id: string;
  name: string;
  subject: string;
  subjectName: string;
  gradeCode: string;
  semester: string;
  completedLevels: number;
  totalLevels: number;
  averageScore: number;
  stars: number;
  gradeName: string;
}

export interface WrongAnswerItem {
  id: string;
  subject: string;
  subjectName: string;
  unitName: string;
  prompt: string;
  explanation: string;
  createdAt: Date;
}

export interface SuggestedUnit {
  unitName: string;
  subjectName: string;
  reason: string;
  href: string;
}

export interface DashboardData {
  userName: string;
  todayCompletedLevels: number;
  totalStars: number;
  totalCoins: number;
  recentWrongCount: number;
  subjects: SubjectProgress[];
  units: UnitProgress[];
  wrongAnswers: WrongAnswerItem[];
  suggestedUnits: SuggestedUnit[];
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function getSubjectName(code: string): string {
  return SUBJECT_OPTIONS.find((s) => s.code === code)?.name ?? code;
}

export async function getDashboardData(prisma: PrismaClient): Promise<DashboardData> {
  const today = startOfToday();

  const user = await prisma.user.findUnique({
    where: { id: DEMO_USER_ID },
  });

  const [sessions, units, wrongAnswers] = await Promise.all([
    prisma.gameSession.findMany({
      where: { userId: DEMO_USER_ID },
      include: {
        level: {
          include: {
            unit: { include: { grade: true } },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    }),
    prisma.unit.findMany({
      include: {
        grade: true,
        levels: { select: { id: true } },
        progress: { where: { userId: DEMO_USER_ID } },
      },
      orderBy: [{ grade: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    }),
    prisma.wrongAnswer.findMany({
      where: { userId: DEMO_USER_ID, reviewed: false },
      include: {
        question: {
          include: {
            level: {
              include: {
                unit: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const todayLevelIds = new Set(
    sessions
      .filter((s) => s.completedAt >= today)
      .map((s) => s.levelId)
  );

  const levelBestStars = new Map<string, number>();
  const levelCompleted = new Set<string>();
  const unitScores = new Map<string, number[]>();
  let totalCoins = 0;

  for (const session of sessions) {
    totalCoins += session.coins;
    levelCompleted.add(session.levelId);

    const prevStars = levelBestStars.get(session.levelId) ?? 0;
    levelBestStars.set(session.levelId, Math.max(prevStars, session.stars));

    const unitId = session.level.unitId;
    const scores = unitScores.get(unitId) ?? [];
    scores.push(session.score);
    unitScores.set(unitId, scores);
  }

  const totalStars = [...levelBestStars.values()].reduce((sum, s) => sum + s, 0);

  const subjectStats = new Map<string, { completed: number; total: number }>();
  for (const subject of SUBJECT_OPTIONS) {
    subjectStats.set(subject.code, { completed: 0, total: 0 });
  }

  const unitProgressList: UnitProgress[] = units.map((unit) => {
    const totalLevels = unit.levels.length;
    const completedLevels = unit.levels.filter((l) => levelCompleted.has(l.id)).length;

    const subjectStat = subjectStats.get(unit.subject)!;
    subjectStat.total += totalLevels;
    subjectStat.completed += completedLevels;

    const scores = unitScores.get(unit.id) ?? [];
    const averageScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    const stars = unit.levels.reduce(
      (sum, l) => sum + (levelBestStars.get(l.id) ?? 0),
      0
    );

    return {
      id: unit.id,
      name: unit.name,
      subject: unit.subject,
      subjectName: getSubjectName(unit.subject),
      gradeCode: unit.grade.code,
      gradeName: unit.grade.name,
      semester: unit.semester,
      completedLevels,
      totalLevels,
      averageScore,
      stars,
    };
  });

  const subjects: SubjectProgress[] = SUBJECT_OPTIONS.map((subject) => {
    const stat = subjectStats.get(subject.code)!;
    const completionRate =
      stat.total > 0 ? Math.round((stat.completed / stat.total) * 100) : 0;
    return {
      code: subject.code,
      name: subject.name,
      emoji: subject.emoji,
      completedLevels: stat.completed,
      totalLevels: stat.total,
      completionRate,
    };
  });

  const wrongAnswerItems: WrongAnswerItem[] = wrongAnswers.map((wa) => ({
    id: wa.id,
    subject: wa.question.level.unit.subject,
    subjectName: getSubjectName(wa.question.level.unit.subject),
    unitName: wa.question.level.unit.name,
    prompt: wa.question.prompt,
    explanation: wa.question.explanation,
    createdAt: wa.createdAt,
  }));

  const recentWrongCount = await prisma.wrongAnswer.count({
    where: { userId: DEMO_USER_ID, reviewed: false },
  });

  const suggestedUnits = buildSuggestedUnits(unitProgressList, wrongAnswerItems);

  return {
    userName: user?.name ?? "學員",
    todayCompletedLevels: todayLevelIds.size,
    totalStars,
    totalCoins,
    recentWrongCount,
    subjects,
    units: unitProgressList,
    wrongAnswers: wrongAnswerItems,
    suggestedUnits,
  };
}

function buildSuggestedUnits(
  units: UnitProgress[],
  wrongAnswers: WrongAnswerItem[]
): SuggestedUnit[] {
  const suggestions: SuggestedUnit[] = [];
  const seen = new Set<string>();

  const unitsWithWrong = new Map<string, number>();
  for (const wa of wrongAnswers) {
    const key = wa.unitName;
    unitsWithWrong.set(key, (unitsWithWrong.get(key) ?? 0) + 1);
  }

  for (const [unitName, count] of unitsWithWrong) {
    const unit = units.find((u) => u.name === unitName);
    if (!unit) continue;
    suggestions.push({
      unitName,
      subjectName: unit.subjectName,
      reason: `有 ${count} 題錯題待複習`,
      href: `/units?grade=${unit.gradeCode}&semester=${unit.semester}&subject=${unit.subject}`,
    });
    seen.add(unit.id);
  }

  const incomplete = units
    .filter((u) => u.totalLevels > 0 && u.completedLevels < u.totalLevels)
    .sort((a, b) => a.averageScore - b.averageScore);

  for (const unit of incomplete) {
    if (seen.has(unit.id) || suggestions.length >= 3) continue;
    if (unit.averageScore > 0 && unit.averageScore < 75) {
      suggestions.push({
        unitName: unit.name,
        subjectName: unit.subjectName,
        reason: `平均分 ${unit.averageScore} 分，建議再練一次`,
        href: `/units?grade=${unit.gradeCode}&semester=${unit.semester}&subject=${unit.subject}`,
      });
    } else if (unit.completedLevels === 0) {
      suggestions.push({
        unitName: unit.name,
        subjectName: unit.subjectName,
        reason: "尚未開始，可以先從這裡著手",
        href: `/units?grade=${unit.gradeCode}&semester=${unit.semester}&subject=${unit.subject}`,
      });
    }
    seen.add(unit.id);
  }

  return suggestions.slice(0, 3);
}
