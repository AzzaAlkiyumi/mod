/**
 * PREVIEW ONLY — the expanded 4-tab Add Product form (General/Inventory/
 * Pricing & Tax/Compliance), reviewed here before any schema change or
 * change to the real /admin/products/new page. See QUOTATION_AUDIT.md for
 * the proposed column list this is modeling.
 */
import { prisma } from "@/lib/prisma";
import { ProductFormPreviewV2 } from "@/components/products/product-form-preview-v2";

export const dynamic = "force-dynamic";

export default async function ProductFormPreviewV2Page() {
  const [products, taxes] = await Promise.all([
    prisma.product.findMany({ select: { category: true, unit: true } }),
    prisma.tax.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
  ]);

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c))),
  ).sort();
  const units = Array.from(new Set(products.map((p) => p.unit))).sort();

  return (
    <ProductFormPreviewV2
      categories={categories}
      units={units}
      taxes={taxes.map((t) => ({ id: t.id, name: t.name, rate: Number(t.rate) }))}
    />
  );
}
