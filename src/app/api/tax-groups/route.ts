import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { taxGroupSchema } from "@/lib/validations/tax-management";

export async function GET() {
  const groups = await prisma.taxGroup.findMany({
    include: {
      classification: true,
      components: { include: { taxComponent: true } },
      _count: { select: { products: true, categories: true } },
    },
    orderBy: [{ isDefault: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: groups });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = taxGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const classification = await prisma.taxClassification.findUnique({
    where: { id: input.classificationId },
  });
  if (!classification) {
    return NextResponse.json(
      { error: { formErrors: ["Selected classification no longer exists"] } },
      { status: 400 },
    );
  }

  const components = await prisma.taxComponent.findMany({
    where: { id: { in: input.componentIds } },
  });
  if (components.length !== input.componentIds.length) {
    return NextResponse.json(
      { error: { formErrors: ["One or more selected tax components no longer exist"] } },
      { status: 400 },
    );
  }
  const rate = components.reduce((sum, c) => sum + Number(c.rate), 0);

  try {
    const group = await prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.taxGroup.updateMany({ where: { isDefault: true }, data: { isDefault: false } });
      }
      return tx.taxGroup.create({
        data: {
          code: input.code,
          name: input.name,
          classificationId: input.classificationId,
          rate,
          pricesIncludeTax: input.pricesIncludeTax,
          isDefault: input.isDefault,
          active: input.active,
          components: { create: input.componentIds.map((taxComponentId) => ({ taxComponentId })) },
        },
        include: { classification: true, components: { include: { taxComponent: true } } },
      });
    });
    return NextResponse.json({ data: group }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: { formErrors: ["A tax group with this code already exists"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
