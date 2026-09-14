import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { unitSchema } from "@/lib/validations/catalog";

export async function GET() {
  const units = await prisma.unit.findMany({
    include: { measurementCategory: true, baseUnit: true },
    orderBy: { displayName: "asc" },
  });
  return NextResponse.json({ data: units });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = unitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const measurementCategory = await prisma.unitCategory.findUnique({
    where: { id: input.measurementCategoryId },
  });
  if (!measurementCategory) {
    return NextResponse.json(
      { error: { formErrors: ["Selected measurement category no longer exists"] } },
      { status: 400 },
    );
  }
  if (input.baseUnitId) {
    const baseUnit = await prisma.unit.findUnique({ where: { id: input.baseUnitId } });
    if (!baseUnit) {
      return NextResponse.json(
        { error: { formErrors: ["Selected base unit no longer exists"] } },
        { status: 400 },
      );
    }
  }

  try {
    const unit = await prisma.unit.create({
      data: {
        shortCode: input.shortCode,
        displayName: input.displayName,
        measurementCategoryId: input.measurementCategoryId,
        baseUnitId: input.baseUnitId || null,
        conversionFactor: input.conversionFactor ?? null,
        active: input.active,
      },
      include: { measurementCategory: true, baseUnit: true },
    });
    return NextResponse.json({ data: unit }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: { formErrors: ["A unit with this short code already exists"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
