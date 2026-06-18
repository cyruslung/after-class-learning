import Link from "next/link";
import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { PageTitle } from "@/components/PageTitle";
import { ZhuyinText } from "@/components/ZhuyinText";
import {
  TIER_META,
  countGradeCharacters,
  getGradeCharacterMap,
} from "@/data/writing/characterMap";

interface PageProps {
  params: Promise<{ grade: string }>;
}

export default async function GradeCharacterMapPage({ params }: PageProps) {
  const { grade } = await params;
  const map = getGradeCharacterMap(grade);
  if (!map) notFound();

  const total = countGradeCharacters(grade);

  return (
    <div>
      <BackLink href="/writing/map" label="回分級地圖" />
      <PageTitle
        emoji="📋"
        title={`${map.gradeName}字量地圖`}
        subtitle={map.summary}
      />

      <p className="mb-6 text-center text-sm font-semibold text-muted">
        <ZhuyinText>{`本級共 ${total} 字 · 建議依序練習`}</ZhuyinText>
      </p>

      <div className="space-y-6">
        {map.tiers.map((tier, index) => {
          const meta = TIER_META[tier.id];
          const prevTier = index > 0 ? map.tiers[index - 1] : null;

          return (
            <section
              key={tier.id}
              className={`rounded-2xl border-2 p-5 shadow-sm ${meta.border} ${meta.bg}`}
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className={`text-xl font-bold ${meta.color}`}>
                    {meta.emoji} <ZhuyinText>{tier.label}</ZhuyinText>
                    <span className="ml-2 text-base font-semibold text-muted">
                      <ZhuyinText>{`(${tier.characters.length} 字)`}</ZhuyinText>
                    </span>
                  </h2>
                  <p className="mt-1 text-sm">
                    <ZhuyinText>{tier.description}</ZhuyinText>
                  </p>
                  <p className="mt-1 text-xs font-semibold text-muted">
                    🎯 <ZhuyinText>目標：</ZhuyinText>
                    <ZhuyinText>{tier.goal}</ZhuyinText>
                  </p>
                </div>
                <Link
                  href={`/writing/tier/${grade}/${tier.id}`}
                  className="rounded-xl border-2 border-primary bg-white px-4 py-2 text-sm font-bold text-primary transition hover:bg-primary hover:text-white"
                >
                  <ZhuyinText>開始練字</ZhuyinText> →
                </Link>
              </div>

              {prevTier && (
                <p className="mb-3 text-xs text-muted">
                  ↑ <ZhuyinText>建議先完成</ZhuyinText>「<ZhuyinText>{prevTier.label}</ZhuyinText>」
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {tier.characters.map((item) => (
                  <span
                    key={item.char}
                    className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-white bg-white text-xl font-bold shadow-sm"
                    title={item.hint}
                  >
                    {item.char}
                  </span>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50/50 p-5 text-center">
        <p className="text-sm text-muted">
          <ZhuyinText>想挑戰寫字速度？到「速度挑戰」模式連續書寫，刷新個人紀錄！</ZhuyinText>
        </p>
        <Link
          href={`/writing/tier/${grade}/challenge`}
          className="mt-3 inline-block rounded-xl bg-primary px-6 py-2 text-sm font-bold text-white transition hover:opacity-90"
        >
          ⚡ <ZhuyinText>挑戰級速度練習</ZhuyinText>
        </Link>
      </div>
    </div>
  );
}
