import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { ProductSetupTabs } from "@/components/product-setup/product-setup-tabs";

export const dynamic = "force-dynamic";

export default async function ProductSetupPage() {
  const [categories, brands, units, unitCategories, taxes] = await Promise.all([
    prisma.category.findMany({
      include: { tax: true, parent: true },
      orderBy: { name: "asc" },
    }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.unit.findMany({
      include: { measurementCategory: true, baseUnit: true },
      orderBy: { displayName: "asc" },
    }),
    prisma.unitCategory.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.taxGroup.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
  ]);

  return (
    <ProductSetupTabs
      categories={serialize(categories)}
      brands={serialize(brands)}
      units={units.map((u) => ({
        ...serialize(u),
        conversionFactor: u.conversionFactor !== null ? Number(u.conversionFactor) : null,
      }))}
      unitCategories={serialize(unitCategories)}
      taxes={taxes.map((t) => ({ id: t.id, name: t.name }))}
    />
  );
}
