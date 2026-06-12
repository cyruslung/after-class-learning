import { NextRequest, NextResponse } from "next/server";
import { DEMO_USER_ID } from "@/lib/constants";
import {
  calculateCoins,
  calculateScore,
  calculateStars,
  type SessionAnswer,
} from "@/lib/game";
import { checkAnswer } from "@/lib/question";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { levelId, answers, streakBonus = 0 } = body as {
      levelId: string;
      answers: { questionId: string; userAnswer: string }[];
      streakBonus?: number;
    };

    if (!levelId || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const level = await prisma.level.findUnique({
      where: { id: levelId },
      include: {
        questions: true,
        unit: { include: { grade: true } },
      },
    });

    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    const questionMap = new Map(level.questions.map((q) => [q.id, q]));
    const sessionAnswers: SessionAnswer[] = [];
    let correctCount = 0;

    for (const ans of answers) {
      const question = questionMap.get(ans.questionId);
      if (!question) continue;

      const isCorrect = checkAnswer(question.type, question.answer, ans.userAnswer);
      if (isCorrect) correctCount++;

      sessionAnswers.push({
        questionId: ans.questionId,
        userAnswer: ans.userAnswer,
        isCorrect,
      });

      if (!isCorrect) {
        await prisma.wrongAnswer.create({
          data: {
            userId: DEMO_USER_ID,
            questionId: ans.questionId,
            userAnswer: ans.userAnswer,
          },
        });
      }
    }

    const totalCount = sessionAnswers.length;
    const score = calculateScore(correctCount, totalCount);
    const stars = calculateStars(score);
    const safeStreakBonus = Math.max(0, Math.min(Number(streakBonus) || 0, 100));
    const coins = calculateCoins(correctCount, stars, safeStreakBonus);

    const session = await prisma.gameSession.create({
      data: {
        userId: DEMO_USER_ID,
        levelId,
        correctCount,
        totalCount,
        score,
        stars,
        coins,
        answers: JSON.stringify(sessionAnswers),
      },
    });

    const existingProgress = await prisma.progress.findUnique({
      where: {
        userId_unitId: { userId: DEMO_USER_ID, unitId: level.unitId },
      },
    });

    if (existingProgress) {
      await prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
          completedLevels: existingProgress.completedLevels + 1,
          totalStars: existingProgress.totalStars + stars,
        },
      });
    } else {
      await prisma.progress.create({
        data: {
          userId: DEMO_USER_ID,
          unitId: level.unitId,
          completedLevels: 1,
          totalStars: stars,
        },
      });
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Submit error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
