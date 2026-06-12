import { BackLink } from "@/components/BackLink";
import { BigButton } from "@/components/BigButton";
import { PageTitle } from "@/components/PageTitle";
import { LevelMap } from "@/components/units/LevelMap";
import { DEMO_USER_ID, GRADE_OPTIONS, SEMESTER_OPTIONS, SUBJECT_OPTIONS } from "@/lib/constants";
import { renderStars } from "@/lib/game";
import { buildLevelMap } from "@/lib/levelProgress";
import { prisma } from "@/lib/prisma";
import { TRACK_EARLY_ADMISSION, appendTrack, filterUnitsByTrack, getTrackLabel } from "@/lib/unitTrack";

interface PageProps {
  searchParams: Promise<{ grade?: string; semester?: string; subject?: string; track?: string }>;
}

function getLabel<T extends { code: string; name: string }>(items: readonly T[], code: string) {
  return items.find((i) => i.code === code)?.name ?? code;
}

export default async function UnitsPage({ searchParams }: PageProps) {
  const { grade = "G1", semester = "S1", subject = "CHINESE", track } = await searchParams;

  const gradeRecord = await prisma.grade.findUnique({ where: { code: grade } });

  const allUnits = gradeRecord
    ? await prisma.unit.findMany({
        where: { gradeId: gradeRecord.id, semester, subject },
        include: {
          levels: { orderBy: { sortOrder: "asc" }, select: { id: true, name: true, sortOrder: true } },
          progress: { where: { userId: DEMO_USER_ID } },
        },
        orderBy: { sortOrder: "asc" },
      })
    : [];

  const units = filterUnitsByTrack(allUnits, track);

  const allLevelIds = units.flatMap((u) => u.levels.map((l) => l.id));
  const sessions =
    allLevelIds.length > 0
      ? await prisma.gameSession.findMany({
          where: { userId: DEMO_USER_ID, levelId: { in: allLevelIds } },
          select: { levelId: true, stars: true },
        })
      : [];

  const subjectName = getLabel(SUBJECT_OPTIONS, subject);
  const gradeName = getLabel([...GRADE_OPTIONS.kindergarten, ...GRADE_OPTIONS.elementary], grade);
  const semesterName = getLabel(SEMESTER_OPTIONS, semester);
  const trackLabel = getTrackLabel(track);

  const subtitle = trackLabel
    ? `${trackLabel} · ${subjectName} · ${semesterName}`
    : `${gradeName} · ${semesterName}`;

  return (
    <div>
      <BackLink href={`/subjects?${appendTrack({ grade, semester }, track)}`} />
      <PageTitle
        emoji={
          track === TRACK_EARLY_ADMISSION
            ? "🌟"
            : (SUBJECT_OPTIONS.find((s) => s.code === subject)?.emoji ?? "📖")
        }
        title={track === TRACK_EARLY_ADMISSION ? "提早入學單元" : `${subjectName}單元`}
        subtitle={subtitle}
      />

      {units.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-orange-200 bg-white p-8 text-center">
          <p className="text-lg text-muted">
            {track === TRACK_EARLY_ADMISSION
              ? "此科目尚無提早入學練習單元"
              : "這個年級/學期/科目還沒有單元資料"}
          </p>
          <p className="mt-2 text-sm text-muted">
            {track === TRACK_EARLY_ADMISSION
              ? "請執行 npm run db:seed 匯入題庫"
              : "請到後台匯入題庫，或選擇其他年級試試看！"}
          </p>
          <div className="mt-4">
            <BigButton href="/admin/import" variant="outline">
              前往匯入題庫
            </BigButton>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {units.map((unit) => {
            const progress = unit.progress[0];
            const completedLevels = progress?.completedLevels ?? 0;
            const totalStars = progress?.totalStars ?? 0;
            const unitLevelIds = new Set(unit.levels.map((l) => l.id));
            const unitSessions = sessions.filter((s) => unitLevelIds.has(s.levelId));
            const mapNodes = buildLevelMap(unit.levels, unitSessions);
            const firstUnlocked = mapNodes.find((n) => n.unlocked && !n.completed) ?? mapNodes.find((n) => n.unlocked);

            return (
              <div
                key={unit.id}
                className="rounded-2xl border-2 border-orange-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2 className="text-xl font-bold text-foreground">{unit.name}</h2>
                <p className="mt-1 text-sm text-muted sm:text-base">{unit.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm sm:text-base">
                  <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                    已完成 {completedLevels}/{unit.levels.length} 關
                  </span>
                  <span className="text-lg">{renderStars(totalStars > 3 ? 3 : totalStars)}</span>
                </div>

                <LevelMap levels={mapNodes} />

                {firstUnlocked && (
                  <div className="mt-6 text-center">
                    <BigButton href={`/game/${firstUnlocked.id}`}>
                      {firstUnlocked.completed ? "再玩一次 🔄" : "開始闖關 🎯"}
                    </BigButton>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
