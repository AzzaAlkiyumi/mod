import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { TaxClassificationsPanel } from "@/components/tax-management/tax-classifications-panel";

export const dynamic = "force-dynamic";

export default async function TaxClassificationsPage() {
  const classifications = await prisma.taxClassification.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return <TaxClassificationsPanel initial={serialize(classifications)} />;
}
