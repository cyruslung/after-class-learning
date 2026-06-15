import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { BigButton } from "@/components/BigButton";
import { PageTitle } from "@/components/PageTitle";
import { ZhuyinText } from "@/components/ZhuyinText";
import { renderStars } from "@/lib/game";
import type { DashboardData } from "@/lib/dashboard";

interface DashboardViewProps {
  data: DashboardData;
}

export function DashboardView({ data }: DashboardViewProps) {
  return (
    <div>
      <BackLink href="/" label="回首頁" />
      <PageTitle
        emoji="👨‍👩‍👧"
        title="學習進度報表"
        subtitle={`${data.userName} 的學習狀況一覽`}
      />

      {/* 總覽 */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold">
          <ZhuyinText>今日學習總覽</ZhuyinText>
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <OverviewCard
            emoji="🎯"
            label="今日完成關卡"
            value={`${data.todayCompletedLevels} 關`}
          />
          <OverviewCard emoji="⭐" label="累積星星" value={`${data.totalStars} 顆`} />
          <OverviewCard emoji="🪙" label="累積金幣" value={`${data.totalCoins} 枚`} />
          <OverviewCard
            emoji="📝"
            label="待複習錯題"
            value={`${data.recentWrongCount} 題`}
            highlight={data.recentWrongCount > 0}
          />
        </div>
      </section>

      {/* 建議複習 */}
      {data.suggestedUnits.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-bold">
            <ZhuyinText>建議複習單元</ZhuyinText>
          </h2>
          <div className="space-y-3">
            {data.suggestedUnits.map((item) => (
              <Link
                key={`${item.unitName}-${item.reason}`}
                href={item.href}
                className="flex items-center justify-between rounded-2xl border-2 border-yellow-200 bg-yellow-50 px-4 py-3 transition hover:bg-yellow-100"
              >
                <div>
                  <p className="font-bold">
                    <ZhuyinText>{item.subjectName}</ZhuyinText> · <ZhuyinText>{item.unitName}</ZhuyinText>
                  </p>
                  <p className="text-sm text-muted">
                    <ZhuyinText>{item.reason}</ZhuyinText>
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  <ZhuyinText>前往</ZhuyinText> →
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 科目進度 */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold">
          <ZhuyinText>各科完成進度</ZhuyinText>
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {data.subjects.map((subject) => (
            <div
              key={subject.code}
              className="rounded-2xl border-2 border-orange-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-2xl">{subject.emoji}</span>
                <span className="text-lg font-bold">
                  <ZhuyinText>{subject.name}</ZhuyinText>
                </span>
              </div>
              <p className="mb-2 text-2xl font-extrabold text-primary">
                {subject.completionRate}%
              </p>
              <ProgressBar percent={subject.completionRate} />
              <p className="mt-2 text-sm text-muted">
                <ZhuyinText>已完成</ZhuyinText> {subject.completedLevels} / {subject.totalLevels}{" "}
                <ZhuyinText>關</ZhuyinText>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 單元進度 */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold">
          <ZhuyinText>各單元學習狀況</ZhuyinText>
        </h2>
        {data.units.length === 0 ? (
          <p className="text-muted">
            <ZhuyinText>尚無單元資料</ZhuyinText>
          </p>
        ) : (
          <div className="space-y-4">
            {data.units.map((unit) => {
              const completionPercent =
                unit.totalLevels > 0
                  ? Math.round((unit.completedLevels / unit.totalLevels) * 100)
                  : 0;

              return (
                <div
                  key={unit.id}
                  className="rounded-2xl border-2 border-orange-200 bg-white p-4 sm:p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold">
                          <ZhuyinText>{unit.name}</ZhuyinText>
                        </h3>
                        <SubjectTag name={unit.subjectName} />
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-muted">
                          <ZhuyinText>{unit.gradeName}</ZhuyinText> ·{" "}
                          <ZhuyinText>{unit.semester === "S1" ? "上學期" : "下學期"}</ZhuyinText>
                        </span>
                      </div>
                    </div>
                    <span className="text-lg">{renderStars(Math.min(unit.stars, 3))}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <MiniStat
                      label="關卡進度"
                      value={`${unit.completedLevels} / ${unit.totalLevels}`}
                    />
                    <MiniStat
                      label="平均分數"
                      value={unit.averageScore > 0 ? `${unit.averageScore} 分` : "尚未挑戰"}
                    />
                    <MiniStat label="獲得星星" value={`${unit.stars} 顆`} />
                  </div>

                  <div className="mt-3">
                    <ProgressBar percent={completionPercent} />
                    <p className="mt-1 text-xs text-muted">
                      <ZhuyinText>完成</ZhuyinText> {completionPercent}%
                    </p>
                  </div>

                  <div className="mt-3">
                    <Link
                      href={`/units?grade=${unit.gradeCode}&semester=${unit.semester}&subject=${unit.subject}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      <ZhuyinText>查看闖關地圖</ZhuyinText> →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 錯題提醒 */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">
            <ZhuyinText>錯題提醒</ZhuyinText>
          </h2>
          {data.wrongAnswers.length > 0 && (
            <Link href="/review" className="text-sm font-semibold text-primary hover:underline">
              <ZhuyinText>查看全部</ZhuyinText> →
            </Link>
          )}
        </div>

        {data.wrongAnswers.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-green-200 bg-green-50 p-6 text-center">
            <p className="text-lg font-bold text-green-700">
              🎉 <ZhuyinText>目前沒有待複習的錯題！</ZhuyinText>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.wrongAnswers.map((item, idx) => (
              <div
                key={item.id}
                className="rounded-2xl border-2 border-red-100 bg-white p-4 sm:p-5"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-muted">
                    <ZhuyinText>錯題</ZhuyinText> {idx + 1}
                  </span>
                  <SubjectTag name={item.subjectName} />
                  <span className="text-sm text-muted">
                    <ZhuyinText>{item.unitName}</ZhuyinText>
                  </span>
                </div>
                <p className="font-bold leading-relaxed">
                  <ZhuyinText>{item.prompt}</ZhuyinText>
                </p>
                <p className="mt-2 text-sm text-muted">
                  💡 <ZhuyinText>{item.explanation}</ZhuyinText>
                </p>
                <div className="mt-3">
                  <BigButton href="/review" variant="outline">
                    前往複習
                  </BigButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function OverviewCard({
  emoji,
  label,
  value,
  highlight = false,
}: {
  emoji: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border-2 p-4 text-center shadow-sm ${
        highlight ? "border-red-200 bg-red-50" : "border-orange-200 bg-white"
      }`}
    >
      <span className="text-2xl">{emoji}</span>
      <p className="mt-1 text-xs font-semibold text-muted sm:text-sm">
        <ZhuyinText>{label}</ZhuyinText>
      </p>
      <p className="mt-1 text-lg font-extrabold sm:text-xl">
        <ZhuyinText>{value}</ZhuyinText>
      </p>
    </div>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-3 overflow-hidden rounded-full bg-orange-100">
      <div
        className="h-full rounded-full bg-secondary transition-all duration-500"
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-orange-50 px-3 py-2">
      <p className="text-xs font-semibold text-muted">
        <ZhuyinText>{label}</ZhuyinText>
      </p>
      <p className="text-sm font-bold">
        <ZhuyinText>{value}</ZhuyinText>
      </p>
    </div>
  );
}

function SubjectTag({ name }: { name: string }) {
  const colors: Record<string, string> = {
    國語: "bg-red-100 text-red-700",
    英文: "bg-blue-100 text-blue-700",
    數學: "bg-green-100 text-green-700",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-bold ${colors[name] ?? "bg-gray-100 text-gray-700"}`}
    >
      <ZhuyinText>{name}</ZhuyinText>
    </span>
  );
}
