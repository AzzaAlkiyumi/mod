import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/products/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [categories, units, brands, taxes, drugSchedules] = await Promise.all([
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.unit.findMany({ where: { active: true }, orderBy: { displayName: "asc" } }),
    prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.taxGroup.findMany({
      where: { active: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
    prisma.drugSchedule.findMany({ where: { active: true }, orderBy: { displayName: "asc" } }),
  ]);

  return (
    <ProductForm
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      units={units.map((u) => ({ id: u.id, name: u.displayName }))}
      brands={brands.map((b) => ({ id: b.id, name: b.name }))}
      taxes={taxes.map((t) => ({ id: t.id, name: t.name, rate: Number(t.rate) }))}
      drugSchedules={drugSchedules.map((d) => ({ id: d.id, name: `${d.shortCode} — ${d.displayName}` }))}
    />
  );
}
