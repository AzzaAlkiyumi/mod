/**
 * PREVIEW ONLY — a redesigned "Add Product" form, reviewed here before any
 * change is made to real code. There is currently no Products admin page
 * in this app at all (only /api/products, used by the Quotation/POS item
 * search) — this preview is what a real /admin/products/new would become
 * once approved, not a modification of an existing page.
 *
 * Field set maps 1:1 to the real Product model (sku, barcode, name, unit,
 * price, imageUrl, category, taxId), plus bilingual Name/Description
 * fields shown together (no language toggle) per explicit direction —
 * those are the only new columns proposed, not yet applied to the schema.
 * Reads only existing Product/Tax data — no new tables. This preview uses
 * local component state so it can be reviewed without touching the
 * database or any other part of the app.
 */
import { prisma } from "@/lib/prisma";
import { ProductFormPreview } from "@/components/products/product-form-preview";

export const dynamic = "force-dynamic";

export default async function ProductFormPreviewPage() {
  const [products, taxes] = await Promise.all([
    prisma.product.findMany({ select: { category: true, unit: true } }),
    prisma.tax.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
  ]);

  const categories = Array.from(
    new Set(products.map((p) => p.category).filter((c): c is string => Boolean(c))),
  ).sort();
  const units = Array.from(new Set(products.map((p) => p.unit))).sort();

  return (
    <ProductFormPreview
      categories={categories}
      units={units}
      taxes={taxes.map((t) => ({ id: t.id, name: t.name, rate: Number(t.rate) }))}
    />
  );
}
