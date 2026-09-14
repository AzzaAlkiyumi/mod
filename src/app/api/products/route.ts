import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { productCreateSchema } from "@/lib/validations/product";
import { generateProductSku } from "@/lib/product-sku";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const categoryId = searchParams.get("categoryId")?.trim();
  // The quotation item search wants a short, fast dropdown (default 20); the
  // POS product grid wants the whole catalog at once — pass take=all for that.
  const takeParam = searchParams.get("take");
  const take = takeParam === "all" ? undefined : Math.min(200, Number(takeParam) || 20);

  const products = await prisma.product.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { sku: { contains: q, mode: "insensitive" } },
                { barcode: { contains: q, mode: "insensitive" } },
              ],
            }
          : {},
        categoryId ? { categoryId } : {},
      ],
    },
    include: { tax: true, category: true, unit: true, brand: true },
    orderBy: { name: "asc" },
    take,
  });

  return NextResponse.json({ data: products });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  if (input.taxId) {
    const tax = await prisma.tax.findUnique({ where: { id: input.taxId } });
    if (!tax) {
      return NextResponse.json(
        { error: { formErrors: ["Selected tax no longer exists"] } },
        { status: 400 },
      );
    }
  }

  const unit = await prisma.unit.findUnique({ where: { id: input.unitId } });
  if (!unit) {
    return NextResponse.json(
      { error: { formErrors: ["Selected unit no longer exists"] } },
      { status: 400 },
    );
  }
  if (input.categoryId) {
    const category = await prisma.category.findUnique({ where: { id: input.categoryId } });
    if (!category) {
      return NextResponse.json(
        { error: { formErrors: ["Selected category no longer exists"] } },
        { status: 400 },
      );
    }
  }
  if (input.brandId) {
    const brand = await prisma.brand.findUnique({ where: { id: input.brandId } });
    if (!brand) {
      return NextResponse.json(
        { error: { formErrors: ["Selected brand no longer exists"] } },
        { status: 400 },
      );
    }
  }

  const sku = input.sku || (await generateProductSku());

  try {
    const product = await prisma.product.create({
      data: {
        sku,
        barcode: input.barcode || null,
        name: input.name,
        nameAr: input.nameAr || null,
        unitId: input.unitId,
        price: input.price,
        taxId: input.taxId || null,
        categoryId: input.categoryId || null,
        brandId: input.brandId || null,
        imageUrl: input.imageUrl || null,
        descriptionEn: input.descriptionEn || null,
        descriptionAr: input.descriptionAr || null,
        shortDescription: input.shortDescription || null,
        availableForSale: input.availableForSale,
        featured: input.featured,
        trackStock: input.trackStock,
        soldByWeight: input.soldByWeight,
        trackBatches: input.trackBatches,
        trackExpiry: input.trackExpiry,
        expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        reorderAt: input.reorderAt ?? null,
        reorderQuantity: input.reorderQuantity ?? null,
        costPrice: input.costPrice ?? null,
        mrp: input.mrp ?? null,
        priceIncludesTax: input.priceIncludesTax,
        hsnCode: input.hsnCode || null,
        drugSchedule: input.drugSchedule,
        genericName: input.genericName || null,
        manufacturer: input.manufacturer || null,
      },
      include: { tax: true, category: true, unit: true, brand: true },
    });
    return NextResponse.json({ data: product }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      const target = (err.meta?.target as string[] | undefined)?.join(", ") ?? "sku/barcode";
      return NextResponse.json(
        { error: { formErrors: [`A product with this ${target} already exists`] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
