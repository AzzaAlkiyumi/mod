import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { taxClassificationSchema } from "@/lib/validations/tax-management";

export async function GET() {
  const classifications = await prisma.taxClassification.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: classifications });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = taxClassificationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const classification = await prisma.taxClassification.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description || null,
        sortOrder: input.sortOrder,
        active: input.active,
      },
    });
    return NextResponse.json({ data: classification }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: { formErrors: ["A classification with this slug already exists"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
