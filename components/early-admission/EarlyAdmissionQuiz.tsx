"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { BigButton } from "@/components/BigButton";
import { PageTitle } from "@/components/PageTitle";
import {
  FeedbackPanel,
  QuestionRenderer,
  type GameQuestion,
} from "@/components/game/QuestionRenderer";
import {
  checkAnswer,
  formatAnswerForDisplay,
} from "@/lib/question";
import { saveProgress } from "@/lib/earlyAdmissionProgress";

interface EarlyAdmissionQuizProps {
  phase: "group" | "individual";
  title: string;
  introTips: string[];
  passScore: number;
  questions: GameQuestion[];
  backHref: string;
}

type Step = "intro" | "quiz" | "result";
type Phase = "answering" | "feedback";

export function EarlyAdmissionQuiz({
  phase,
  title,
  introTips,
  passScore,
  questions,
  backHref,
}: EarlyAdmissionQuizProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [quizPhase, setQuizPhase] = useState<Phase>("answering");
  const correctRef = useRef(0);
  const [lastAnswer, setLastAnswer] = useState<{
    userAnswer: string;
    isCorrect: boolean;
  } | null>(null);
  const [finalScore, setFinalScore] = useState(0);
  const [passed, setPassed] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const progressPercent = useMemo(() => {
    if (step !== "quiz") return 0;
    return ((currentIndex + (quizPhase === "feedback" ? 1 : 0)) / questions.length) * 100;
  }, [currentIndex, quizPhase, questions.length, step]);

  const handleSubmit = (userAnswer: string) => {
    const isCorrect = checkAnswer(
      currentQuestion.type,
      currentQuestion.answer,
      userAnswer
    );
    if (isCorrect) correctRef.current += 1;
    setLastAnswer({ userAnswer, isCorrect });
    setQuizPhase("feedback");
  };

  const handleNext = () => {
    if (isLast) {
      const score = Math.round((correctRef.current / questions.length) * 100);
      const didPass = score >= passScore;
      setFinalScore(score);
      setPassed(didPass);

      if (phase === "group") {
        saveProgress({
          groupTestPassed: didPass,
          groupTestScore: score,
        });
      } else {
        saveProgress({
          individualTestPassed: didPass,
          individualTestScore: score,
        });
      }
      setStep("result");
      return;
    }
    setCurrentIndex((i) => i + 1);
    setQuizPhase("answering");
    setLastAnswer(null);
  };

  if (step === "intro") {
    return (
      <div>
        <BackLink href={backHref} label="回提早入學首頁" />
        <PageTitle emoji={phase === "group" ? "👥" : "🧩"} title={title} subtitle="開始前先看一下小提示" />
        <ul className="mb-6 space-y-3">
          {introTips.map((tip, i) => (
            <li
              key={tip}
              className="flex gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4"
            >
              <span className="font-bold text-primary">{i + 1}.</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
        <p className="mb-4 text-center text-sm text-gray-600">
          模擬通過標準：答對率 {passScore}% 以上（共 {questions.length} 題）
        </p>
        <BigButton onClick={() => setStep("quiz")}>我準備好了，開始測驗 🚀</BigButton>
      </div>
    );
  }

  if (step === "result") {
    const nextHref =
      phase === "group"
        ? passed
          ? "/early-admission/individual-test"
          : "/early-admission/group-test"
        : "/early-admission";

    return (
      <div className="text-center">
        <BackLink href="/early-admission" label="回提早入學首頁" />
        <div className="py-8">
          <div className="text-6xl">{passed ? "🎉" : "💪"}</div>
          <h2 className="mt-4 text-2xl font-bold">
            {passed ? "模擬通過！" : "再練習一次吧"}
          </h2>
          <p className="mt-2 text-lg">
            得分：<span className="font-bold text-primary">{finalScore}%</span>
            （{Math.round((finalScore / 100) * questions.length)} / {questions.length} 題）
          </p>
          <p className="mt-4 text-gray-600">
            {passed
              ? phase === "group"
                ? "恭喜通過初選！可以進入複選｜個別智力測驗。"
                : "你完成了整個模擬鑑定流程，太棒了！"
              : `未達模擬通過標準（${passScore}%），熟悉題型後再挑戰一次。`}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <BigButton onClick={() => router.push(nextHref)}>
              {passed
                ? phase === "group"
                  ? "前往複選測驗 →"
                  : "回首頁查看成果"
                : "再試一次"}
            </BigButton>
            {!passed && (
              <BigButton
                variant="secondary"
                onClick={() => router.push("/early-admission")}
              >
                先休息，回首頁
              </BigButton>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <BackLink href={backHref} label="回提早入學首頁" />
      <PageTitle emoji="🎯" title={title} subtitle="盡力回答，不用緊張～" />

      <QuestionRenderer
        question={currentQuestion}
        currentIndex={currentIndex}
        totalCount={questions.length}
        onSubmit={handleSubmit}
      />

      {quizPhase === "feedback" && lastAnswer && (
        <FeedbackPanel
          isCorrect={lastAnswer.isCorrect}
          correctAnswer={formatAnswerForDisplay(
            currentQuestion.type,
            currentQuestion.answer
          )}
          explanation={currentQuestion.explanation}
          onNext={handleNext}
          isLast={isLast}
          streakReward={0}
          currentStreak={0}
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
