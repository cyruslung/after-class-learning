"use client";

import { useEffect, useState } from "react";
import { BigButton } from "@/components/BigButton";
import { ZhuyinText } from "@/components/ZhuyinText";
import { BackLink } from "@/components/BackLink";
import {
  getBadge,
  getEncouragementMessage,
  renderStars,
  type Badge,
} from "@/lib/game";
import { formatAnswerForDisplay } from "@/lib/question";
import { QuestionType } from "@prisma/client";

interface WrongAnswerItem {
  questionId: string;
  userAnswer: string;
  prompt: string;
  type: QuestionType;
  answer: string;
  explanation: string;
}

interface ResultClientProps {
  sessionId: string;
  levelId: string;
  levelName: string;
  correctCount: number;
  totalCount: number;
  score: number;
  stars: number;
  coins: number;
  unitQuery: string;
  wrongAnswers: WrongAnswerItem[];
}

export function ResultClient({
  sessionId,
  levelId,
  levelName,
  correctCount,
  totalCount,
  score,
  stars,
  coins,
  unitQuery,
  wrongAnswers,
}: ResultClientProps) {
  const [showStars, setShowStars] = useState(false);
  const badge: Badge = getBadge(score, stars);
  const encouragement = getEncouragementMessage(score);

  useEffect(() => {
    const timer = setTimeout(() => setShowStars(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <div className="mb-6 text-center">
        <p className="text-sm font-semibold text-muted">
          <ZhuyinText>{levelName}</ZhuyinText>
        </p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">
          🎊 <ZhuyinText>闖關結果</ZhuyinText>
        </h1>
      </div>

      {/* Badge */}
      <div className="result-badge mb-6 flex flex-col items-center rounded-2xl border-2 border-yellow-300 bg-gradient-to-b from-yellow-50 to-orange-50 p-6 text-center">
        <span className="text-6xl sm:text-7xl">{badge.emoji}</span>
        <p className="mt-3 text-xl font-extrabold text-foreground">
          <ZhuyinText>{badge.title}</ZhuyinText>
        </p>
        <p className="mt-1 text-sm text-muted">
          <ZhuyinText>{badge.description}</ZhuyinText>
        </p>
      </div>

      {/* Stars animation */}
      <div className="mb-6 flex justify-center gap-2 sm:gap-3">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={`text-4xl transition-all duration-500 sm:text-5xl ${
              showStars && i <= stars ? "star-pop" : "opacity-30 grayscale"
            }`}
            style={{ animationDelay: `${i * 200}ms` }}
          >
            ⭐
          </span>
        ))}
      </div>

      {/* Encouragement */}
      <p className="mb-6 text-center text-lg font-bold text-primary sm:text-xl">
        <ZhuyinText>{encouragement}</ZhuyinText>
      </p>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="答對題數" value={`${correctCount}/${totalCount}`} />
        <StatCard label="分數" value={`${score} 分`} />
        <StatCard label="星星" value={renderStars(stars)} />
        <StatCard label="金幣" value={`🪙 ${coins}`} />
      </div>

      {/* Wrong answers */}
      {wrongAnswers.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-xl font-bold">
            ❌ <ZhuyinText>錯題回顧</ZhuyinText>（{wrongAnswers.length} <ZhuyinText>題</ZhuyinText>）
          </h2>
          <div className="space-y-3">
            {wrongAnswers.map((wa, idx) => (
              <div
                key={wa.questionId}
                className="rounded-2xl border-2 border-red-200 bg-white p-4 sm:p-5"
              >
                <p className="text-sm font-semibold text-muted">
                  <ZhuyinText>錯題</ZhuyinText> {idx + 1}
                </p>
                <p className="mt-1 font-bold">
                  <ZhuyinText>{wa.prompt}</ZhuyinText>
                </p>
                <p className="mt-2 text-sm">
                  <ZhuyinText>你的答案：</ZhuyinText>
                  <span className="font-semibold text-red-600">
                    {wa.userAnswer ? (
                      <ZhuyinText>{wa.userAnswer}</ZhuyinText>
                    ) : (
                      <ZhuyinText>（未作答）</ZhuyinText>
                    )}
                  </span>
                </p>
                <p className="text-sm">
                  <ZhuyinText>正確答案：</ZhuyinText>
                  <span className="font-semibold text-green-600">
                    <ZhuyinText>{formatAnswerForDisplay(wa.type, wa.answer)}</ZhuyinText>
                  </span>
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <BigButton href={`/review?session=${sessionId}`} variant="secondary">
              立即複習錯題 📝
            </BigButton>
          </div>
        </section>
      )}

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
        <BigButton href={`/game/${levelId}`}>再玩一次 🔄</BigButton>
        <BigButton href={`/units?${unitQuery}`} variant="outline">
          回闖關地圖
        </BigButton>
      </div>

      <div className="mt-6 text-center">
        <BackLink href="/review" label="查看所有錯題複習" />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-white p-4 text-center shadow-sm">
      <p className="text-sm font-semibold text-muted">
        <ZhuyinText>{label}</ZhuyinText>
      </p>
      <p className="mt-1 text-xl font-extrabold sm:text-2xl">{value}</p>
    </div>
  );
}
