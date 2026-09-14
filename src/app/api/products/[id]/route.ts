import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { productUpdateSchema } from "@/lib/validations/product";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { tax: true, category: true, unit: true, brand: true },
  });
  if (!product) {
    return NextResponse.json({ error: { formErrors: ["Product not found"] } }, { status: 404 });
  }
  return NextResponse.json({ data: product });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  if (input.taxId) {
    const tax = await prisma.taxGroup.findUnique({ where: { id: input.taxId } });
    if (!tax) {
      return NextResponse.json(
        { error: { formErrors: ["Selected tax no longer exists"] } },
        { status: 400 },
      );
    }
  }
  if (input.drugScheduleId) {
    const drugSchedule = await prisma.drugSchedule.findUnique({
      where: { id: input.drugScheduleId },
    });
    if (!drugSchedule) {
      return NextResponse.json(
        { error: { formErrors: ["Selected drug schedule no longer exists"] } },
        { status: 400 },
      );
    }
  }
  if (input.unitId) {
    const unit = await prisma.unit.findUnique({ where: { id: input.unitId } });
    if (!unit) {
      return NextResponse.json(
        { error: { formErrors: ["Selected unit no longer exists"] } },
        { status: 400 },
      );
    }
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

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(input.sku !== undefined && { sku: input.sku }),
        ...(input.barcode !== undefined && { barcode: input.barcode || null }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.nameAr !== undefined && { nameAr: input.nameAr || null }),
        ...(input.unitId !== undefined && { unitId: input.unitId }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.taxId !== undefined && { taxId: input.taxId || null }),
        ...(input.categoryId !== undefined && { categoryId: input.categoryId || null }),
        ...(input.brandId !== undefined && { brandId: input.brandId || null }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl || null }),
        ...(input.descriptionEn !== undefined && { descriptionEn: input.descriptionEn || null }),
        ...(input.descriptionAr !== undefined && { descriptionAr: input.descriptionAr || null }),
        ...(input.shortDescription !== undefined && {
          shortDescription: input.shortDescription || null,
        }),
        ...(input.availableForSale !== undefined && {
          availableForSale: input.availableForSale,
        }),
        ...(input.featured !== undefined && { featured: input.featured }),
        ...(input.trackStock !== undefined && { trackStock: input.trackStock }),
        ...(input.soldByWeight !== undefined && { soldByWeight: input.soldByWeight }),
        ...(input.trackBatches !== undefined && { trackBatches: input.trackBatches }),
        ...(input.trackExpiry !== undefined && { trackExpiry: input.trackExpiry }),
        ...(input.expiryDate !== undefined && {
          expiryDate: input.expiryDate ? new Date(input.expiryDate) : null,
        }),
        ...(input.reorderAt !== undefined && { reorderAt: input.reorderAt ?? null }),
        ...(input.reorderQuantity !== undefined && {
          reorderQuantity: input.reorderQuantity ?? null,
        }),
        ...(input.costPrice !== undefined && { costPrice: input.costPrice ?? null }),
        ...(input.mrp !== undefined && { mrp: input.mrp ?? null }),
        ...(input.priceIncludesTax !== undefined && {
          priceIncludesTax: input.priceIncludesTax,
        }),
        ...(input.hsnCode !== undefined && { hsnCode: input.hsnCode || null }),
        ...(input.drugScheduleId !== undefined && {
          drugScheduleId: input.drugScheduleId || null,
        }),
        ...(input.genericName !== undefined && { genericName: input.genericName || null }),
        ...(input.manufacturer !== undefined && { manufacturer: input.manufacturer || null }),
      },
      include: { tax: true, category: true, unit: true, brand: true },
    });
    return NextResponse.json({ data: product });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: { formErrors: ["Product not found"] } }, { status: 404 });
    }
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
