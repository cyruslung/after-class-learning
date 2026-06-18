import { notFound } from "next/navigation";
import { BackLink } from "@/components/BackLink";
import { PageTitle } from "@/components/PageTitle";
import { HanziPracticeClient } from "@/components/writing/HanziPracticeClient";
import { getWritingSet } from "@/data/writing/sets";

interface PageProps {
  params: Promise<{ setId: string }>;
}

export default async function WritingSetPage({ params }: PageProps) {
  const { setId } = await params;
  const set = getWritingSet(setId);
  if (!set) notFound();

  return (
    <div>
      <BackLink href="/writing" label="回練字列表" />
      <PageTitle emoji={set.emoji} title={set.title} subtitle={set.description} />
      <HanziPracticeClient setId={set.id} setTitle={set.title} characters={set.characters} />
    </div>
  );
}
