import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { PageTitle } from "@/components/PageTitle";
import { ZhuyinText } from "@/components/ZhuyinText";
import {
  GRADE_CHARACTER_MAPS,
  TIER_META,
  countAllCharacters,
} from "@/data/writing/characterMap";

export default function CharacterMapPage() {
  const totalChars = countAllCharacters();

  return (
    <div>
      <BackLink href="/writing" label="回練字坊" />
      <PageTitle
        emoji="🗺️"
        title="每年級字量分級地圖"
        subtitle="基礎 → 進階 → 挑戰，依年級循序練字"
      />

      <div className="mb-8 rounded-2xl border-2 border-indigo-200 bg-indigo-50/60 p-5">
        <p className="text-sm text-indigo-900 sm:text-base">
          <ZhuyinText>
            {`全平台共收錄 ${totalChars} 個分級練字，涵蓋一年級到六年級。建議從「基礎」開始，熟練後再挑戰「進階」與「挑戰」。`}
          </ZhuyinText>
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {(Object.keys(TIER_META) as Array<keyof typeof TIER_META>).map((tier) => {
            const meta = TIER_META[tier];
            return (
              <span
                key={tier}
                className={`rounded-full border-2 px-3 py-1 text-sm font-bold ${meta.border} ${meta.bg} ${meta.color}`}
              >
                {meta.emoji} <ZhuyinText>{meta.label}</ZhuyinText>
              </span>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GRADE_CHARACTER_MAPS.map((map) => {
          const charCount = map.tiers.reduce((s, t) => s + t.characters.length, 0);
          return (
            <Link
              key={map.grade}
              href={`/writing/map/${map.grade}`}
              className="rounded-2xl border-2 border-orange-200 bg-white p-5 shadow-sm transition hover:scale-[1.02] hover:border-primary hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-xl font-bold">
                  <ZhuyinText>{map.gradeName}</ZhuyinText>
                </h3>
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-primary">
                  <ZhuyinText>{`${charCount} 字`}</ZhuyinText>
                </span>
              </div>
              <p className="mt-2 text-sm text-muted">
                <ZhuyinText>{map.summary}</ZhuyinText>
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {map.tiers.map((tier) => {
                  const meta = TIER_META[tier.id];
                  return (
                    <span
                      key={tier.id}
                      className={`rounded-lg border px-2 py-1 text-xs font-semibold ${meta.border} ${meta.bg} ${meta.color}`}
                    >
                      {meta.emoji} {tier.characters.length}
                    </span>
                  );
                })}
              </div>
              <p className="mt-3 text-sm font-semibold text-primary">
                <ZhuyinText>查看分級地圖</ZhuyinText> →
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
