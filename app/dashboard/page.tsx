import { DashboardView } from "@/components/dashboard/DashboardView";
import { getDashboardData } from "@/lib/dashboard";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const data = await getDashboardData(prisma);
  return <DashboardView data={data} />;
}
