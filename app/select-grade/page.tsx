import { BackLink } from "@/components/BackLink";
import { CardButton } from "@/components/CardButton";
import { PageTitle } from "@/components/PageTitle";
import { EARLY_ADMISSION_ENTRY, GRADE_OPTIONS } from "@/lib/constants";
import { appendTrack } from "@/lib/unitTrack";

export default function SelectGradePage() {
  return (
    <div>
      <BackLink href="/" label="回首頁" />
      <PageTitle emoji="🎓" title="選擇年級" subtitle="請選擇你的年級" />

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-foreground sm:text-xl">🏫 幼兒園</h2>
        <div className="mb-4">
          <CardButton
            href="/kindergarten/gallery"
            label="注音圖庫"
            description="小一先修完整 37 音 — 看圖學注音"
            emoji="🔤"
            className="border-purple-200 bg-purple-50 hover:bg-purple-100"
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {GRADE_OPTIONS.kindergarten.map((grade) => (
            <CardButton
              key={grade.code}
              href={`/select-semester?${appendTrack({ grade: grade.code })}`}
              label={grade.name}
              emoji="🧸"
              className="border-pink-200 bg-pink-50 hover:bg-pink-100"
            />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-foreground sm:text-xl">🌟 特殊練習</h2>
        <CardButton
          href="/early-admission"
          label={EARLY_ADMISSION_ENTRY.label}
          description={EARLY_ADMISSION_ENTRY.description}
          emoji={EARLY_ADMISSION_ENTRY.emoji}
          className="border-yellow-300 bg-yellow-50 hover:bg-yellow-100"
        />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-bold text-foreground sm:text-xl">📚 國小</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {GRADE_OPTIONS.elementary.map((grade) => (
            <CardButton
              key={grade.code}
              href={`/select-semester?${appendTrack({ grade: grade.code })}`}
              label={grade.name}
              emoji="✏️"
              className="border-blue-200 bg-blue-50 hover:bg-blue-100"
            />
          ))}
        </div>
      </section>
    </div>
  );
}
