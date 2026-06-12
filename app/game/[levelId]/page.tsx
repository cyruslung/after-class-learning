import { notFound } from "next/navigation";
import { GameClient } from "@/components/game/GameClient";
import { prisma } from "@/lib/prisma";
import {
  TRACK_EARLY_ADMISSION,
  appendTrack,
  isEarlyAdmissionUnit,
} from "@/lib/unitTrack";

interface PageProps {
  params: Promise<{ levelId: string }>;
}

export default async function GamePage({ params }: PageProps) {
  const { levelId } = await params;

  const level = await prisma.level.findUnique({
    where: { id: levelId },
    include: {
      questions: { orderBy: { sortOrder: "asc" } },
      unit: { include: { grade: true } },
    },
  });

  if (!level) notFound();

  const track = isEarlyAdmissionUnit(level.unit.name) ? TRACK_EARLY_ADMISSION : undefined;
  const unitQuery = appendTrack(
    {
      grade: level.unit.grade.code,
      semester: level.unit.semester,
      subject: level.unit.subject,
    },
    track
  );

  return (
    <GameClient
      levelId={level.id}
      levelName={level.name}
      unitQuery={unitQuery}
      questions={level.questions}
    />
  );
}
