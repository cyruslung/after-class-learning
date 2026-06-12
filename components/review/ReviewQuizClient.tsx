"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { QuestionType } from "@prisma/client";
import { BigButton } from "@/components/BigButton";
import { WRONG_MESSAGES, pickRandomMessage } from "@/lib/game";
import { checkAnswer, formatAnswerForDisplay, parseOptions, type MultipleChoiceOptions } from "@/lib/question";
import type { ReviewItem } from "./ReviewClient";

interface ReviewQuizClientProps {
  items: ReviewItem[];
  sessionLabel?: string;
}

type Phase = "quiz" | "feedback" | "done";

export function ReviewQuizClient({ items: initialItems, sessionLabel }: ReviewQuizClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [lastCorrect, setLastCorrect] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const current = items[currentIndex];

  const handleAnswer = async (answer: string) => {
    if (!current) return;

    const isCorrect = checkAnswer(current.question.type, current.question.answer, answer);
    setLastCorrect(isCorrect);
    setPhase("feedback");

    if (isCorrect) {
      setLoading(true);
      try {
        await fetch(`/api/review/${current.id}`, { method: "PATCH" });
        setReviewedCount((c) => c + 1);
      } catch {
        alert("標記失敗，請再試一次");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNext = () => {
    if (lastCorrect) {
      const newItems = items.filter((item) => item.id !== current?.id);
      setItems(newItems);
      if (newItems.length === 0) {
        setPhase("done");
        router.refresh();
        return;
      }
      if (currentIndex >= newItems.length) {
        setCurrentIndex(0);
      }
    }

    setPhase("quiz");
    setUserInput("");
    setLastCorrect(false);
  };

  if (items.length === 0 || phase === "done") {
    return (
      <div className="rounded-2xl border-2 border-dashed border-green-200 bg-green-50 p-8 text-center">
        <div className="text-5xl">🎉</div>
        <p className="mt-4 text-xl font-bold">
          {reviewedCount > 0 ? `太棒了！已複習 ${reviewedCount} 題錯題` : "複習完成！"}
        </p>
        <p className="mt-2 text-muted">繼續加油，保持全對！</p>
      </div>
    );
  }

  if (!current) return null;

  const q = current.question;
  const isLast = items.length === 1;

  return (
    <div>
      {sessionLabel && (
        <p className="mb-4 text-center text-sm font-semibold text-muted">{sessionLabel}</p>
      )}

      <div className="mb-4 flex items-center justify-between text-sm font-semibold text-muted">
        <span>錯題複習</span>
        <span>
          第 {currentIndex + 1} 題 / 共 {items.length} 題
        </span>
      </div>

      {phase === "quiz" && (
        <div className="rounded-2xl border-2 border-orange-200 bg-white p-5 sm:p-6">
          <p className="mb-4 text-lg font-bold leading-relaxed sm:text-xl">{q.prompt}</p>
          <p className="mb-4 text-sm text-muted">
            上次答案：
            <span className="font-semibold text-red-600">
              {current.userAnswer || "（未作答）"}
            </span>
          </p>

          {q.type === QuestionType.MULTIPLE_CHOICE ? (
            <MultipleChoiceReview question={q} onAnswer={handleAnswer} />
          ) : q.type === QuestionType.TRUE_FALSE ? (
            <TrueFalseReview onAnswer={handleAnswer} />
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (userInput.trim()) handleAnswer(userInput.trim());
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="請輸入答案"
                className="min-h-[3rem] flex-1 rounded-2xl border-2 border-orange-200 px-4 text-lg focus:border-primary focus:outline-none"
                autoComplete="off"
              />
              <BigButton type="submit">送出</BigButton>
            </form>
          )}
        </div>
      )}

      {phase === "feedback" && (
        <div
          className={`rounded-2xl border-2 p-5 sm:p-6 ${
            lastCorrect ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50"
          }`}
        >
          <p className="text-xl font-extrabold sm:text-2xl">
            {lastCorrect ? "🎉 答對了！已標記為已複習" : `💪 ${pickRandomMessage(WRONG_MESSAGES)}`}
          </p>
          {!lastCorrect && (
            <>
              <p className="mt-2 font-semibold">
                正確答案：
                <span className="text-green-700">
                  {formatAnswerForDisplay(q.type, q.answer)}
                </span>
              </p>
              <p className="mt-2 text-sm text-muted">💡 {q.explanation}</p>
            </>
          )}
          <div className="mt-4">
            <BigButton onClick={handleNext} disabled={loading}>
              {lastCorrect
                ? isLast
                  ? "完成複習 ✓"
                  : "下一題 →"
                : "再答一次 →"}
            </BigButton>
          </div>
        </div>
      )}
    </div>
  );
}

function MultipleChoiceReview({
  question,
  onAnswer,
}: {
  question: ReviewItem["question"];
  onAnswer: (answer: string) => void;
}) {
  const parsed = parseOptions<MultipleChoiceOptions>(question.options);
  const choices = parsed?.choices ?? [];

  if (choices.length === 0) {
    return <p className="text-sm text-muted">無法載入選項，請至題庫檢查</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {choices.map((choice) => (
        <button
          key={choice}
          type="button"
          onClick={() => onAnswer(choice)}
          className="min-h-[3rem] rounded-2xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-lg font-bold transition hover:bg-blue-100"
        >
          {choice}
        </button>
      ))}
    </div>
  );
}

function TrueFalseReview({ onAnswer }: { onAnswer: (answer: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onAnswer("true")}
        className="min-h-[3.5rem] rounded-2xl border-2 border-green-200 bg-green-50 text-lg font-bold hover:bg-green-100"
      >
        ✓ 是
      </button>
      <button
        type="button"
        onClick={() => onAnswer("false")}
        className="min-h-[3.5rem] rounded-2xl border-2 border-red-200 bg-red-50 text-lg font-bold hover:bg-red-100"
      >
        ✗ 否
      </button>
    </div>
  );
}
