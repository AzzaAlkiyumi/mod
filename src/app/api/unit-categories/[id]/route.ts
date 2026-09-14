import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { unitCategorySchema } from "@/lib/validations/catalog";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = unitCategorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const unitCategory = await prisma.unitCategory.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ data: unitCategory });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { error: { formErrors: ["Unit category not found"] } },
        { status: 404 },
      );
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: { formErrors: ["A unit category with this slug already exists"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.unitCategory.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { error: { formErrors: ["Unit category not found"] } },
        { status: 404 },
      );
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: { formErrors: ["Cannot delete — units still use this category"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
