import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { unitCategorySchema } from "@/lib/validations/catalog";

export async function GET() {
  const unitCategories = await prisma.unitCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: unitCategories });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = unitCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  try {
    const unitCategory = await prisma.unitCategory.create({ data: parsed.data });
    return NextResponse.json({ data: unitCategory }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: { formErrors: ["A unit category with this slug already exists"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
