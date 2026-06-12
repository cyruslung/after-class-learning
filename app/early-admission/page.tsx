import { EarlyAdmissionHub } from "@/components/early-admission/EarlyAdmissionHub";

export default async function EarlyAdmissionPage({
  searchParams,
}: {
  searchParams: Promise<{ completed?: string }>;
}) {
  const { completed } = await searchParams;
  return <EarlyAdmissionHub completedBanner={completed} />;
}
