"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { PageTitle } from "@/components/PageTitle";
import {
  FeedbackPanel,
  GameQuestion,
  QuestionRenderer,
} from "@/components/game/QuestionRenderer";
import { getStreakRewardEarned } from "@/lib/game";
import {
  checkAnswer,
  formatAnswerForDisplay,
  getQuestionFunLabel,
} from "@/lib/question";

interface GameClientProps {
  levelId: string;
  levelName: string;
  unitQuery: string;
  questions: GameQuestion[];
}

type Phase = "answering" | "feedback";

export function GameClient({
  levelId,
  levelName,
  unitQuery,
  questions,
}: GameClientProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("answering");
  const [lastAnswer, setLastAnswer] = useState<{ userAnswer: string; isCorrect: boolean } | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; userAnswer: string }[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalStreakBonus, setTotalStreakBonus] = useState(0);
  const [lastStreakReward, setLastStreakReward] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const progressPercent = useMemo(
    () => ((currentIndex + (phase === "feedback" ? 1 : 0)) / questions.length) * 100,
    [currentIndex, phase, questions.length]
  );

  const handleSubmit = (userAnswer: string) => {
    const isCorrect = checkAnswer(
      currentQuestion.type,
      currentQuestion.answer,
      userAnswer
    );

    const prevStreak = streak;
    const newStreak = isCorrect ? streak + 1 : 0;
    const reward = isCorrect ? getStreakRewardEarned(prevStreak, newStreak) : 0;

    setStreak(newStreak);
    if (reward > 0) {
      setTotalStreakBonus((b) => b + reward);
      setLastStreakReward(reward);
    } else {
      setLastStreakReward(0);
    }

    setLastAnswer({ userAnswer, isCorrect });
    setAnswers((prev) => [...prev, { questionId: currentQuestion.id, userAnswer }]);
    setPhase("feedback");
  };

  const handleNext = async () => {
    if (isLast) {
      setSubmitting(true);
      const hasCurrent = answers.some((a) => a.questionId === currentQuestion.id);
      const finalAnswers = hasCurrent
        ? answers
        : lastAnswer
          ? [...answers, { questionId: currentQuestion.id, userAnswer: lastAnswer.userAnswer }]
          : answers;
      try {
        const res = await fetch("/api/game/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ levelId, answers: finalAnswers, streakBonus: totalStreakBonus }),
        });
        const data = await res.json();
        if (data.sessionId) {
          router.push(`/result/${data.sessionId}`);
        }
      } catch {
        alert("提交失敗，請再試一次");
        setSubmitting(false);
      }
      return;
    }

    setCurrentIndex((i) => i + 1);
    setPhase("answering");
    setLastAnswer(null);
  };

  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="text-5xl animate-bounce">⏳</div>
        <p className="mt-4 text-xl font-bold">計算成績中...</p>
      </div>
    );
  }

  return (
    <div>
      <BackLink href={`/units?${unitQuery}`} label="回闖關地圖" />
      <PageTitle
        emoji="🎯"
        title={levelName}
        subtitle={
          getQuestionFunLabel(currentQuestion.type)
            ? "輕鬆玩、快樂學！"
            : "加油，你可以的！"
        }
      />

      {streak >= 2 && (
        <div className="mb-4 rounded-full bg-orange-100 px-4 py-2 text-center text-sm font-bold text-orange-700">
          🔥 連勝 {streak} 題！{streak === 2 && "再答對一題就有連勝獎勵！"}
        </div>
      )}

      <QuestionRenderer
        question={currentQuestion}
        currentIndex={currentIndex}
        totalCount={questions.length}
        onSubmit={handleSubmit}
      />

      {phase === "feedback" && lastAnswer && (
        <FeedbackPanel
          isCorrect={lastAnswer.isCorrect}
          correctAnswer={formatAnswerForDisplay(
            currentQuestion.type,
            currentQuestion.answer
          )}
          explanation={currentQuestion.explanation}
          onNext={handleNext}
          isLast={isLast}
          streakReward={lastStreakReward}
          currentStreak={streak}
        />
      )}

      <div className="mt-6">
        <div className="h-3 overflow-hidden rounded-full bg-orange-100">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
