import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { unitSchema } from "@/lib/validations/catalog";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = unitSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const unit = await prisma.unit.update({
      where: { id },
      data: {
        ...(input.shortCode !== undefined && { shortCode: input.shortCode }),
        ...(input.displayName !== undefined && { displayName: input.displayName }),
        ...(input.measurementCategoryId !== undefined && {
          measurementCategoryId: input.measurementCategoryId,
        }),
        ...(input.baseUnitId !== undefined && { baseUnitId: input.baseUnitId || null }),
        ...(input.conversionFactor !== undefined && {
          conversionFactor: input.conversionFactor,
        }),
        ...(input.active !== undefined && { active: input.active }),
      },
      include: { measurementCategory: true, baseUnit: true },
    });
    return NextResponse.json({ data: unit });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: { formErrors: ["Unit not found"] } }, { status: 404 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: { formErrors: ["A unit with this short code already exists"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.unit.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: { formErrors: ["Unit not found"] } }, { status: 404 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: { formErrors: ["Cannot delete — products still use this unit"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
