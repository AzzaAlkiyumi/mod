import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { productCreateSchema } from "@/lib/validations/product";
import { generateProductSku } from "@/lib/product-sku";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();
  const category = searchParams.get("category")?.trim();
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
        category ? { category } : {},
      ],
    },
    include: { tax: true },
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

  const sku = input.sku || (await generateProductSku());

  try {
    const product = await prisma.product.create({
      data: {
        sku,
        barcode: input.barcode || null,
        name: input.name,
        nameAr: input.nameAr || null,
        unit: input.unit,
        price: input.price,
        taxId: input.taxId || null,
        category: input.category,
        imageUrl: input.imageUrl || null,
        descriptionEn: input.descriptionEn || null,
        descriptionAr: input.descriptionAr || null,
      },
      include: { tax: true },
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
