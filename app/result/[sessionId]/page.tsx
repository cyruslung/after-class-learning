import { notFound } from "next/navigation";
import { ResultClient } from "@/components/result/ResultClient";
import { type SessionAnswer } from "@/lib/game";
import { prisma } from "@/lib/prisma";
import {
  TRACK_EARLY_ADMISSION,
  appendTrack,
  isEarlyAdmissionUnit,
} from "@/lib/unitTrack";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ResultPage({ params }: PageProps) {
  const { sessionId } = await params;

  const session = await prisma.gameSession.findUnique({
    where: { id: sessionId },
    include: {
      level: {
        include: {
          unit: { include: { grade: true } },
        },
      },
    },
  });

  if (!session) notFound();

  const answers: SessionAnswer[] = JSON.parse(session.answers);
  const wrongSessionAnswers = answers.filter((a) => !a.isCorrect);

  const wrongQuestions =
    wrongSessionAnswers.length > 0
      ? await prisma.question.findMany({
          where: { id: { in: wrongSessionAnswers.map((a) => a.questionId) } },
        })
      : [];

  const questionMap = new Map(wrongQuestions.map((q) => [q.id, q]));

  const wrongAnswers = wrongSessionAnswers
    .map((wa) => {
      const q = questionMap.get(wa.questionId);
      if (!q) return null;
      return {
        questionId: wa.questionId,
        userAnswer: wa.userAnswer,
        prompt: q.prompt,
        type: q.type,
        answer: q.answer,
        explanation: q.explanation,
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  const track = isEarlyAdmissionUnit(session.level.unit.name)
    ? TRACK_EARLY_ADMISSION
    : undefined;
  const unitQuery = appendTrack(
    {
      grade: session.level.unit.grade.code,
      semester: session.level.unit.semester,
      subject: session.level.unit.subject,
    },
    track
  );

  return (
    <ResultClient
      sessionId={session.id}
      levelId={session.levelId}
      levelName={session.level.name}
      correctCount={session.correctCount}
      totalCount={session.totalCount}
      score={session.score}
      stars={session.stars}
      coins={session.coins}
      unitQuery={unitQuery}
      wrongAnswers={wrongAnswers}
    />
  );
}
