import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/products/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const [products, taxes] = await Promise.all([
    prisma.product.findMany({ select: { category: true, unit: true } }),
    prisma.tax.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
  ]);

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c))),
  ).sort();
  const units = Array.from(new Set(products.map((p) => p.unit))).sort();

  return (
    <ProductForm
      categories={categories}
      units={units}
      taxes={taxes.map((t) => ({ id: t.id, name: t.name, rate: Number(t.rate) }))}
    />
  );
}
