"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BigButton } from "@/components/BigButton";
import { ZhuyinText } from "@/components/ZhuyinText";
import { formatAnswerForDisplay } from "@/lib/question";
import { QuestionType } from "@prisma/client";

export interface ReviewItem {
  id: string;
  userAnswer: string;
  reviewed: boolean;
  createdAt: string;
  question: {
    id: string;
    type: QuestionType;
    prompt: string;
    answer: string;
    explanation: string;
    options: string | null;
  };
}

interface ReviewClientProps {
  items: ReviewItem[];
}

export function ReviewClient({ items: initialItems }: ReviewClientProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleMarkReviewed = async (id: string) => {
    setLoadingId(id);
    try {
      await fetch(`/api/review/${id}`, { method: "PATCH" });
      setItems((prev) => prev.filter((item) => item.id !== id));
      router.refresh();
    } catch {
      alert("標記失敗，請再試一次");
    } finally {
      setLoadingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-green-200 bg-green-50 p-8 text-center">
        <div className="text-5xl">🎉</div>
        <p className="mt-4 text-xl font-bold">
          <ZhuyinText>太棒了！目前沒有錯題需要複習</ZhuyinText>
        </p>
        <p className="mt-2 text-muted">
          <ZhuyinText>繼續加油，保持全對！</ZhuyinText>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className={`rounded-2xl border-2 bg-white p-5 shadow-sm sm:p-6 ${
            item.reviewed ? "border-gray-200 opacity-60" : "border-orange-200"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-muted">
              <ZhuyinText>錯題</ZhuyinText> {idx + 1}
            </span>
            {item.reviewed && (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                <ZhuyinText>已複習</ZhuyinText>
              </span>
            )}
          </div>
          <p className="text-lg font-bold">
            <ZhuyinText>{item.question.prompt}</ZhuyinText>
          </p>
          <div className="mt-3 space-y-1 text-sm sm:text-base">
            <p>
              <ZhuyinText>你的答案：</ZhuyinText>
              <span className="ml-1 font-semibold text-red-600">
                {item.userAnswer ? (
                  <ZhuyinText>{item.userAnswer}</ZhuyinText>
                ) : (
                  <ZhuyinText>（未作答）</ZhuyinText>
                )}
              </span>
            </p>
            <p>
              <ZhuyinText>正確答案：</ZhuyinText>
              <span className="ml-1 font-semibold text-green-600">
                <ZhuyinText>
                  {formatAnswerForDisplay(item.question.type, item.question.answer)}
                </ZhuyinText>
              </span>
            </p>
            <p className="text-muted">
              💡 <ZhuyinText>{item.question.explanation}</ZhuyinText>
            </p>
          </div>
          {!item.reviewed && (
            <div className="mt-4">
              <BigButton
                onClick={() => handleMarkReviewed(item.id)}
                disabled={loadingId === item.id}
                variant="secondary"
              >
                {loadingId === item.id ? "處理中..." : "標記為已複習 ✓"}
              </BigButton>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
