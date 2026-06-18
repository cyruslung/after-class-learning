import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { PageTitle } from "@/components/PageTitle";
import { HanziPracticeClient } from "@/components/writing/HanziPracticeClient";
import {
  TIER_META,
  getGradeCharacterMap,
  getTierInfo,
  type DifficultyTier,
} from "@/data/writing/characterMap";

interface PageProps {
  params: Promise<{ grade: string; tier: string }>;
}

const VALID_TIERS: DifficultyTier[] = ["basic", "intermediate", "challenge"];

export default async function TierPracticePage({ params }: PageProps) {
  const { grade, tier } = await params;
  if (!VALID_TIERS.includes(tier as DifficultyTier)) notFound();

  const map = getGradeCharacterMap(grade);
  const tierInfo = getTierInfo(grade, tier as DifficultyTier);
  if (!map || !tierInfo) notFound();

  const meta = TIER_META[tier as DifficultyTier];
  const title = `${map.gradeName}｜${tierInfo.label}`;

  return (
    <div>
      <BackLink href={`/writing/map/${grade}`} label={`回${map.gradeName}地圖`} />
      <PageTitle emoji={meta.emoji} title={title} subtitle={tierInfo.description} />
      <HanziPracticeClient
        setId={`${grade}-${tier}`}
        setTitle={title}
        characters={tierInfo.characters}
      />
    </div>
  );
}
