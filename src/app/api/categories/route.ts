import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/catalog";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { tax: true, parent: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ data: categories });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
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
  if (input.parentId) {
    const parent = await prisma.category.findUnique({ where: { id: input.parentId } });
    if (!parent) {
      return NextResponse.json(
        { error: { formErrors: ["Selected parent category no longer exists"] } },
        { status: 400 },
      );
    }
  }

  const category = await prisma.category.create({
    data: {
      name: input.name,
      iconColor: input.iconColor,
      taxId: input.taxId || null,
      parentId: input.parentId || null,
      active: input.active,
    },
    include: { tax: true, parent: true },
  });
  return NextResponse.json({ data: category }, { status: 201 });
}
