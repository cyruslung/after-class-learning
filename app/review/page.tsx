import { BackLink } from "@/components/BackLink";
import { PageTitle } from "@/components/PageTitle";
import { ReviewQuizClient } from "@/components/review/ReviewQuizClient";
import type { ReviewItem } from "@/components/review/ReviewClient";
import { DEMO_USER_ID } from "@/lib/constants";
import { type SessionAnswer } from "@/lib/game";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ session?: string }>;
}

export default async function ReviewPage({ searchParams }: PageProps) {
  const { session } = await searchParams;

  let items: ReviewItem[] = [];
  let sessionLabel: string | undefined;

  if (session) {
    const gameSession = await prisma.gameSession.findUnique({
      where: { id: session },
      include: { level: true },
    });

    if (gameSession) {
      const answers: SessionAnswer[] = JSON.parse(gameSession.answers);
      const wrongQuestionIds = answers
        .filter((a) => !a.isCorrect)
        .map((a) => a.questionId);

      sessionLabel = `本次闖關「${gameSession.level.name}」的錯題`;

      if (wrongQuestionIds.length > 0) {
        const wrongAnswers = await prisma.wrongAnswer.findMany({
          where: {
            userId: DEMO_USER_ID,
            questionId: { in: wrongQuestionIds },
            reviewed: false,
          },
          include: { question: true },
          orderBy: { createdAt: "desc" },
        });

        items = wrongAnswers.map((wa) => ({
          id: wa.id,
          userAnswer: wa.userAnswer,
          reviewed: wa.reviewed,
          createdAt: wa.createdAt.toISOString(),
          question: {
            id: wa.question.id,
            type: wa.question.type,
            prompt: wa.question.prompt,
            answer: wa.question.answer,
            explanation: wa.question.explanation,
            options: wa.question.options ?? null,
          },
        }));
      }
    }
  } else {
    const wrongAnswers = await prisma.wrongAnswer.findMany({
      where: { userId: DEMO_USER_ID, reviewed: false },
      include: { question: true },
      orderBy: { createdAt: "desc" },
    });

    items = wrongAnswers.map((wa) => ({
      id: wa.id,
      userAnswer: wa.userAnswer,
      reviewed: wa.reviewed,
      createdAt: wa.createdAt.toISOString(),
      question: {
        id: wa.question.id,
        type: wa.question.type,
        prompt: wa.question.prompt,
        answer: wa.question.answer,
        explanation: wa.question.explanation,
        options: wa.question.options ?? null,
      },
    }));
  }

  return (
    <div>
      <BackLink href={session ? `/result/${session}` : "/"} label={session ? "回結果頁" : "回首頁"} />
      <PageTitle emoji="📝" title="錯題複習" subtitle="答對後自動標記為已複習！" />
      <ReviewQuizClient items={items} sessionLabel={sessionLabel} />
    </div>
  );
}
