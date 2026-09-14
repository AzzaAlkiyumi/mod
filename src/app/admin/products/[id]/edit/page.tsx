import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/products/product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, units, brands, taxes, drugSchedules] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.unit.findMany({ where: { active: true }, orderBy: { displayName: "asc" } }),
    prisma.brand.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.taxGroup.findMany({
      where: { active: true },
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    }),
    prisma.drugSchedule.findMany({ where: { active: true }, orderBy: { displayName: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <ProductForm
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      units={units.map((u) => ({ id: u.id, name: u.displayName }))}
      brands={brands.map((b) => ({ id: b.id, name: b.name }))}
      taxes={taxes.map((t) => ({ id: t.id, name: t.name, rate: Number(t.rate) }))}
      drugSchedules={drugSchedules.map((d) => ({
        id: d.id,
        name: `${d.shortCode} — ${d.displayName}`,
      }))}
      product={{
        id: product.id,
        sku: product.sku,
        barcode: product.barcode,
        name: product.name,
        nameAr: product.nameAr,
        price: Number(product.price),
        taxId: product.taxId,
        unitId: product.unitId,
        categoryId: product.categoryId,
        brandId: product.brandId,
        imageUrl: product.imageUrl,
        descriptionEn: product.descriptionEn,
        descriptionAr: product.descriptionAr,
        shortDescription: product.shortDescription,
        availableForSale: product.availableForSale,
        featured: product.featured,
        trackStock: product.trackStock,
        soldByWeight: product.soldByWeight,
        trackBatches: product.trackBatches,
        trackExpiry: product.trackExpiry,
        expiryDate: product.expiryDate ? product.expiryDate.toISOString() : null,
        reorderAt: product.reorderAt,
        reorderQuantity: product.reorderQuantity,
        costPrice: product.costPrice !== null ? Number(product.costPrice) : null,
        mrp: product.mrp !== null ? Number(product.mrp) : null,
        priceIncludesTax: product.priceIncludesTax,
        hsnCode: product.hsnCode,
        drugScheduleId: product.drugScheduleId,
        genericName: product.genericName,
        manufacturer: product.manufacturer,
      }}
    />
  );
}
