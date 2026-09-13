import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

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
