import { BackLink } from "@/components/BackLink";
import { CardButton } from "@/components/CardButton";
import { PageTitle } from "@/components/PageTitle";
import { GRADE_OPTIONS, SEMESTER_OPTIONS, SUBJECT_OPTIONS } from "@/lib/constants";
import { TRACK_EARLY_ADMISSION, appendTrack, getTrackLabel } from "@/lib/unitTrack";

interface PageProps {
  searchParams: Promise<{ grade?: string; semester?: string; track?: string }>;
}

function getGradeName(code: string): string {
  const all = [...GRADE_OPTIONS.kindergarten, ...GRADE_OPTIONS.elementary];
  return all.find((g) => g.code === code)?.name ?? code;
}

function getSemesterName(code: string): string {
  return SEMESTER_OPTIONS.find((s) => s.code === code)?.name ?? code;
}

export default async function SubjectsPage({ searchParams }: PageProps) {
  const { grade = "G1", semester = "S1", track } = await searchParams;
  const trackLabel = getTrackLabel(track);

  const subtitle = trackLabel
    ? `${trackLabel} · ${getSemesterName(semester)}`
    : `${getGradeName(grade)} · ${getSemesterName(semester)}`;

  return (
    <div>
      <BackLink href={`/select-semester?${appendTrack({ grade }, track)}`} />
      <PageTitle
        emoji={track === TRACK_EARLY_ADMISSION ? "🌟" : "📚"}
        title="選擇科目"
        subtitle={subtitle}
      />

      <div className="mx-auto grid max-w-lg grid-cols-1 gap-4">
        {SUBJECT_OPTIONS.map((subject) => (
          <CardButton
            key={subject.code}
            href={`/units?${appendTrack({ grade, semester, subject: subject.code }, track)}`}
            label={subject.name}
            emoji={subject.emoji}
            className={`border-2 ${subject.color}`}
          />
        ))}
      </div>
    </div>
  );
}
