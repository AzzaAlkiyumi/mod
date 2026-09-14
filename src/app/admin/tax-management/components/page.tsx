import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { TaxComponentsPanel } from "@/components/tax-management/tax-components-panel";

export const dynamic = "force-dynamic";

export default async function TaxComponentsPage() {
  const components = await prisma.taxComponent.findMany({ orderBy: { name: "asc" } });

  return (
    <TaxComponentsPanel
      initial={components.map((c) => ({ ...serialize(c), rate: Number(c.rate) }))}
    />
  );
}
