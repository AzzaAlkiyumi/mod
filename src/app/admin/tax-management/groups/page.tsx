import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { TaxGroupsPanel } from "@/components/tax-management/tax-groups-panel";

export const dynamic = "force-dynamic";

export default async function TaxGroupsPage() {
  const [groups, classifications, components] = await Promise.all([
    prisma.taxGroup.findMany({
      include: {
        classification: true,
        components: { include: { taxComponent: true } },
        _count: { select: { products: true, categories: true } },
      },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
    prisma.taxClassification.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.taxComponent.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <TaxGroupsPanel
      initial={groups.map((g) => ({
        ...serialize(g),
        rate: Number(g.rate),
        components: g.components.map((gc) => ({
          taxComponent: { ...serialize(gc.taxComponent), rate: Number(gc.taxComponent.rate) },
        })),
      }))}
      classifications={classifications.map((c) => ({ id: c.id, name: c.name }))}
      components={components.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        rate: Number(c.rate),
      }))}
    />
  );
}
