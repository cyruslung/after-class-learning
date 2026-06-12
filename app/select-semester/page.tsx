import { BackLink } from "@/components/BackLink";
import { CardButton } from "@/components/CardButton";
import { PageTitle } from "@/components/PageTitle";
import { GRADE_OPTIONS, SEMESTER_OPTIONS } from "@/lib/constants";
import { TRACK_EARLY_ADMISSION, appendTrack, getTrackLabel } from "@/lib/unitTrack";

interface PageProps {
  searchParams: Promise<{ grade?: string; track?: string }>;
}

function getGradeName(code: string): string {
  const all = [...GRADE_OPTIONS.kindergarten, ...GRADE_OPTIONS.elementary];
  return all.find((g) => g.code === code)?.name ?? code;
}

export default async function SelectSemesterPage({ searchParams }: PageProps) {
  const { grade = "G1", track } = await searchParams;
  const gradeName = getGradeName(grade);
  const trackLabel = getTrackLabel(track);
  const subtitle = trackLabel
    ? `${trackLabel} · 建議大班以上`
    : `${gradeName}（${grade}）`;

  return (
    <div>
      <BackLink href="/select-grade" />
      <PageTitle emoji={track === TRACK_EARLY_ADMISSION ? "🌟" : "📅"} title="選擇學期" subtitle={subtitle} />

      <div className="mx-auto grid max-w-lg grid-cols-1 gap-4 sm:grid-cols-2">
        {SEMESTER_OPTIONS.map((semester) => (
          <CardButton
            key={semester.code}
            href={`/subjects?${appendTrack({ grade, semester: semester.code }, track)}`}
            label={semester.name}
            description={semester.code}
            emoji={semester.code === "S1" ? "🌸" : "🍂"}
            className="border-orange-200 bg-orange-50 hover:bg-orange-100"
          />
        ))}
      </div>
    </div>
  );
}
