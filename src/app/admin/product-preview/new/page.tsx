/**
 * PREVIEW ONLY — a redesigned "Add Product" form, reviewed here before any
 * change is made to real code. There is currently no Products admin page
 * in this app at all (only /api/products, used by the Quotation/POS item
 * search) — this preview is what a real /admin/products/new would become
 * once approved, not a modification of an existing page.
 *
 * Field set is grounded in a screen recording of the reference site's real
 * "New product" form (General tab); layout/hierarchy is modeled on a
 * separate "improved layout" reference image the user supplied. Reads only
 * existing Product/Tax data — no new tables, and the handful of proposed
 * new Product columns (bilingual name/description, brand, status flags)
 * are NOT yet applied to the schema; this preview uses local component
 * state so it can be reviewed without touching the database.
 */
import { prisma } from "@/lib/prisma";
import { ProductFormPreview } from "@/components/products/product-form-preview";
import { getLocale } from "@/i18n/get-locale";

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

  const locale = await getLocale();

  return (
    <ProductFormPreview
      categories={categories}
      units={units}
      taxes={taxes.map((t) => ({ id: t.id, name: t.name, rate: Number(t.rate) }))}
      initialLang={locale}
    />
  );
}
