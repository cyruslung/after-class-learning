"use client";

import { useMemo, useState } from "react";
import { QuestionType } from "@prisma/client";
import { BigButton } from "@/components/BigButton";
import {
  CORRECT_MESSAGES,
  STREAK_REWARD_MESSAGE,
  WRONG_MESSAGES,
  pickRandomMessage,
} from "@/lib/game";
import {
  formatAnswerForDisplay,
  getQuestionFunLabel,
  getQuestionTypeLabel,
  isInteractiveType,
  parseOptions,
  type MatchingOptions,
  type MultipleChoiceOptions,
  type OrderingOptions,
} from "@/lib/question";

export interface GameQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  options: string | null;
  answer: string;
  explanation: string;
}

interface QuestionRendererProps {
  question: GameQuestion;
  currentIndex: number;
  totalCount: number;
  onSubmit: (userAnswer: string) => void;
}

export function QuestionRenderer({
  question,
  currentIndex,
  totalCount,
  onSubmit,
}: QuestionRendererProps) {
  const funLabel = getQuestionFunLabel(question.type);

  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-muted">
        <span className="flex items-center gap-2">
          {funLabel ? (
            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-purple-700">
              {funLabel}
            </span>
          ) : (
            getQuestionTypeLabel(question.type)
          )}
        </span>
        <span>
          第 {currentIndex + 1} 題 / 共 {totalCount} 題
        </span>
      </div>

      <h2 className="mb-6 text-lg font-bold leading-relaxed text-foreground sm:text-xl">
        {question.prompt}
      </h2>

      {isInteractiveType(question.type) ? (
        <InteractiveInput question={question} onSubmit={onSubmit} />
      ) : (
        <PlaceholderInput question={question} onSubmit={onSubmit} />
      )}
    </div>
  );
}

function InteractiveInput({
  question,
  onSubmit,
}: {
  question: GameQuestion;
  onSubmit: (userAnswer: string) => void;
}) {
  if (question.type === QuestionType.MULTIPLE_CHOICE) {
    return <MultipleChoiceInput question={question} onSubmit={onSubmit} />;
  }
  if (question.type === QuestionType.TRUE_FALSE) {
    return <TrueFalseInput onSubmit={onSubmit} />;
  }
  if (question.type === QuestionType.FILL_BLANK) {
    return <FillBlankInput onSubmit={onSubmit} />;
  }
  if (question.type === QuestionType.MATCHING) {
    return <MatchingInput question={question} onSubmit={onSubmit} />;
  }
  if (question.type === QuestionType.ORDERING) {
    return <OrderingInput question={question} onSubmit={onSubmit} />;
  }
  return null;
}

function MultipleChoiceInput({
  question,
  onSubmit,
}: {
  question: GameQuestion;
  onSubmit: (userAnswer: string) => void;
}) {
  const parsed = parseOptions<MultipleChoiceOptions>(question.options);
  const choices = parsed?.choices ?? [];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {choices.map((choice) => (
        <button
          key={choice}
          type="button"
          onClick={() => onSubmit(choice)}
          className="min-h-[3.5rem] rounded-2xl border-2 border-blue-200 bg-blue-50 px-4 py-3 text-lg font-bold transition hover:scale-[1.02] hover:bg-blue-100 active:scale-[0.98]"
        >
          {choice}
        </button>
      ))}
    </div>
  );
}

function TrueFalseInput({ onSubmit }: { onSubmit: (userAnswer: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onSubmit("true")}
        className="min-h-[4rem] rounded-2xl border-2 border-green-200 bg-green-50 text-xl font-bold transition hover:bg-green-100"
      >
        ✓ 是
      </button>
      <button
        type="button"
        onClick={() => onSubmit("false")}
        className="min-h-[4rem] rounded-2xl border-2 border-red-200 bg-red-50 text-xl font-bold transition hover:bg-red-100"
      >
        ✗ 否
      </button>
    </div>
  );
}

function FillBlankInput({ onSubmit }: { onSubmit: (userAnswer: string) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const value = String(formData.get("answer") ?? "").trim();
    if (value) onSubmit(value);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:flex-row">
      <input
        name="answer"
        type="text"
        placeholder="請輸入答案"
        className="min-h-[3.5rem] flex-1 rounded-2xl border-2 border-orange-200 px-4 text-lg focus:border-primary focus:outline-none"
        autoComplete="off"
      />
      <BigButton type="submit">送出答案</BigButton>
    </form>
  );
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function MatchingInput({
  question,
  onSubmit,
}: {
  question: GameQuestion;
  onSubmit: (userAnswer: string) => void;
}) {
  const parsed = parseOptions<MatchingOptions>(question.options);
  const left = parsed?.left ?? [];
  const right = useMemo(() => shuffleArray(parsed?.right ?? []), [question.id]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [pairs, setPairs] = useState<Record<string, string>>({});

  const pairedRights = new Set(Object.values(pairs));
  const allPaired = left.every((l) => pairs[l]);

  const handleLeft = (item: string) => {
    if (pairs[item]) return;
    setSelectedLeft(item);
  };

  const handleRight = (item: string) => {
    if (!selectedLeft || pairedRights.has(item)) return;
    setPairs((prev) => ({ ...prev, [selectedLeft]: item }));
    setSelectedLeft(null);
  };

  const clearPair = (leftKey: string) => {
    setPairs((prev) => {
      const next = { ...prev };
      delete next[leftKey];
      return next;
    });
  };

  return (
    <div>
      <p className="mb-4 text-center text-sm text-purple-700">
        👆 先點左邊，再點右邊完成配對！點已配對的項目可取消
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted">左邊</p>
          {left.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => (pairs[item] ? clearPair(item) : handleLeft(item))}
              className={`w-full min-h-[3rem] rounded-xl border-2 px-3 py-2 text-base font-bold transition ${
                pairs[item]
                  ? "border-green-400 bg-green-50 text-green-800"
                  : selectedLeft === item
                    ? "border-purple-500 bg-purple-100 scale-[1.02]"
                    : "border-blue-200 bg-blue-50 hover:bg-blue-100"
              }`}
            >
              {pairs[item] ? `${item} → ${pairs[item]}` : item}
            </button>
          ))}
        </div>
        <div className="space-y-2">
          <p className="text-xs font-bold text-muted">右邊</p>
          {right.map((item) => (
            <button
              key={item}
              type="button"
              disabled={pairedRights.has(item)}
              onClick={() => handleRight(item)}
              className={`w-full min-h-[3rem] rounded-xl border-2 px-3 py-2 text-base font-bold transition ${
                pairedRights.has(item)
                  ? "border-gray-200 bg-gray-100 text-gray-400"
                  : "border-pink-200 bg-pink-50 hover:bg-pink-100"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <BigButton
          onClick={() => onSubmit(JSON.stringify(pairs))}
          disabled={!allPaired}
          className={!allPaired ? "opacity-50" : ""}
        >
          {allPaired ? "完成配對 ✨" : `還差 ${left.length - Object.keys(pairs).length} 組`}
        </BigButton>
      </div>
    </div>
  );
}

function OrderingInput({
  question,
  onSubmit,
}: {
  question: GameQuestion;
  onSubmit: (userAnswer: string) => void;
}) {
  const parsed = parseOptions<OrderingOptions>(question.options);
  const pool = useMemo(() => shuffleArray(parsed?.items ?? []), [question.id]);
  const [order, setOrder] = useState<string[]>([]);

  const remaining = pool.filter((item) => !order.includes(item));
  const complete = order.length === pool.length;

  const addItem = (item: string) => {
    if (order.includes(item)) return;
    setOrder((prev) => [...prev, item]);
  };

  const removeLast = () => setOrder((prev) => prev.slice(0, -1));
  const reset = () => setOrder([]);

  return (
    <div>
      <p className="mb-4 text-center text-sm text-purple-700">
        👆 依正確順序點選項目，排好的會出現在下方
      </p>
      {order.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border-2 border-green-200 bg-green-50 p-3">
          <span className="text-xs font-bold text-green-700">你的順序：</span>
          {order.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="rounded-lg bg-white px-3 py-1 text-sm font-bold shadow-sm"
            >
              {i + 1}. {item}
            </span>
          ))}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {remaining.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => addItem(item)}
            className="min-h-[3rem] rounded-xl border-2 border-amber-200 bg-amber-50 px-2 py-2 text-sm font-bold transition hover:scale-[1.02] hover:bg-amber-100 sm:text-base"
          >
            {item}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={removeLast}
          disabled={order.length === 0}
          className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-bold disabled:opacity-40"
        >
          取消上一個
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={order.length === 0}
          className="rounded-xl border-2 border-gray-200 px-4 py-2 text-sm font-bold disabled:opacity-40"
        >
          全部重來
        </button>
      </div>
      <div className="mt-6">
        <BigButton
          onClick={() => onSubmit(JSON.stringify(order))}
          disabled={!complete}
          className={!complete ? "opacity-50" : ""}
        >
          {complete ? "送出順序 🎯" : `還需選 ${pool.length - order.length} 個`}
        </BigButton>
      </div>
    </div>
  );
}

function PlaceholderInput({
  question,
  onSubmit,
}: {
  question: GameQuestion;
  onSubmit: (userAnswer: string) => void;
}) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center">
      <p className="mb-2 text-lg font-bold text-muted">
        {getQuestionTypeLabel(question.type)} — 即將推出
      </p>
      <p className="mb-4 text-sm text-muted">
        此題型 UI 尚在開發中，MVP 先以跳過方式繼續。
      </p>
      <p className="mb-4 text-sm text-muted">
        正確答案：{formatAnswerForDisplay(question.type, question.answer)}
      </p>
      <BigButton onClick={() => onSubmit("")} variant="outline">
        跳過此題
      </BigButton>
    </div>
  );
}

interface FeedbackPanelProps {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  onNext: () => void;
  isLast: boolean;
  streakReward?: number;
  currentStreak?: number;
}

export function FeedbackPanel({
  isCorrect,
  correctAnswer,
  explanation,
  onNext,
  isLast,
  streakReward = 0,
  currentStreak = 0,
}: FeedbackPanelProps) {
  const message = isCorrect
    ? pickRandomMessage(CORRECT_MESSAGES)
    : pickRandomMessage(WRONG_MESSAGES);

  return (
    <div
      className={`feedback-panel mt-4 rounded-2xl border-2 p-5 sm:p-6 ${
        isCorrect ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50"
      }`}
    >
      <p className="text-2xl font-extrabold sm:text-3xl">
        {isCorrect ? `🎉 ${message}` : `💪 ${message}`}
      </p>

      {isCorrect && currentStreak >= 3 && (
        <p className="mt-2 text-base font-bold text-secondary">
          🔥 {currentStreak} 連勝中！
        </p>
      )}

      {streakReward > 0 && (
        <div className="streak-reward mt-3 rounded-xl border-2 border-yellow-400 bg-yellow-100 px-4 py-3 text-center">
          <p className="text-lg font-extrabold text-yellow-800">
            ⚡ {STREAK_REWARD_MESSAGE}
          </p>
          <p className="text-sm font-semibold text-yellow-700">
            獲得額外 🪙 {streakReward} 金幣！
          </p>
        </div>
      )}

      {!isCorrect && (
        <p className="mt-3 text-base font-semibold">
          正確答案：<span className="text-green-700">{correctAnswer}</span>
        </p>
      )}

      <div className="mt-4 rounded-xl bg-white/70 p-4">
        <p className="text-sm font-bold text-muted">💡 詳解</p>
        <p className="mt-1 text-base leading-relaxed">{explanation}</p>
      </div>

      <div className="mt-6">
        <button
          type="button"
          onClick={onNext}
          className={`flex w-full min-h-[3.5rem] items-center justify-center rounded-2xl border-2 px-8 py-4 text-xl font-extrabold shadow-md transition hover:scale-[1.02] active:scale-[0.98] sm:min-h-[4rem] sm:text-2xl ${
            isCorrect
              ? "border-primary bg-primary text-white hover:bg-primary-hover"
              : "border-secondary bg-secondary text-white hover:opacity-90"
          }`}
        >
          {isLast ? "查看結果 🏆" : "下一題 →"}
        </button>
      </div>
    </div>
  );
}
