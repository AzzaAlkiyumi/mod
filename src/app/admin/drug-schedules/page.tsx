import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { DrugSchedulesPanel } from "@/components/tax-management/drug-schedules-panel";

export const dynamic = "force-dynamic";

export default async function DrugSchedulesPage() {
  const schedules = await prisma.drugSchedule.findMany({
    orderBy: [{ country: "asc" }, { displayName: "asc" }],
  });

  return <DrugSchedulesPanel initial={serialize(schedules)} />;
}
