import { DashboardView } from "@/components/dashboard/DashboardView";
import { getDashboardData } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData(prisma);
  return <DashboardView data={data} />;
}
