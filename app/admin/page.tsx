import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { PageTitle } from "@/components/PageTitle";
import { CURRICULUM_SOURCES } from "@/data/questionBank";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [unitCount, levelCount, questionCount] = await Promise.all([
    prisma.unit.count(),
    prisma.level.count(),
    prisma.question.count(),
  ]);

  const recentUnits = await prisma.unit.findMany({
    take: 10,
    orderBy: { id: "desc" },
    include: {
      grade: true,
      levels: { include: { _count: { select: { questions: true } } } },
    },
  });

  return (
    <div>
      <BackLink href="/" label="回首頁" />
      <PageTitle emoji="⚙️" title="後台管理" subtitle="題庫管理與匯入" />

      <div className="mb-8 grid grid-cols-3 gap-4">
        <StatBox label="單元數" value={unitCount} />
        <StatBox label="關卡數" value={levelCount} />
        <StatBox label="題目數" value={questionCount} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Link
          href="/admin/import"
          className="flex min-h-[5rem] items-center justify-center rounded-2xl border-2 border-blue-200 bg-blue-50 text-lg font-bold transition hover:bg-blue-100 sm:text-xl"
        >
          📥 匯入題庫
        </Link>
        <Link
          href="/admin/import-tcool"
          className="flex min-h-[5rem] items-center justify-center rounded-2xl border-2 border-green-200 bg-green-50 text-lg font-bold transition hover:bg-green-100 sm:text-xl"
        >
          📄 tcool 考卷匯入
        </Link>
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold">📚 題庫資源說明</h2>
        <div className="space-y-3">
          {CURRICULUM_SOURCES.map((src) => (
            <div
              key={src.id}
              className="rounded-2xl border-2 border-gray-200 bg-white p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold">{src.name}</h3>
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  {src.grades.join("、")}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">{src.description}</p>
              <a
                href={src.referenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
              >
                參考資源 →
              </a>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted">
          本平台已內建康軒版單元架構與提早入學練習題（原創）。從{" "}
          <a href="https://www.tcool.cc/" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            中小學題庫網
          </a>{" "}
          下載的新北市段考卷，請手動轉成 JSON/CSV 後至「匯入題庫」頁面匯入。
        </p>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">題庫列表</h2>
        {recentUnits.length === 0 ? (
          <p className="text-muted">尚無題庫資料</p>
        ) : (
          <div className="space-y-3">
            {recentUnits.map((unit) => (
              <div
                key={unit.id}
                className="rounded-2xl border-2 border-gray-200 bg-white p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{unit.name}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold">
                    {unit.grade.code}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold">
                    {unit.semester}
                  </span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold">
                    {unit.subject}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{unit.description}</p>
                <p className="mt-2 text-sm font-semibold">
                  {unit.levels.length} 個關卡 ·{" "}
                  {unit.levels.reduce((sum, l) => sum + l._count.questions, 0)} 道題目
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border-2 border-orange-200 bg-white p-4 text-center">
      <p className="text-sm font-semibold text-muted">{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}
