import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { taxGroupSchema } from "@/lib/validations/tax-management";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = taxGroupSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  if (input.classificationId !== undefined) {
    const classification = await prisma.taxClassification.findUnique({
      where: { id: input.classificationId },
    });
    if (!classification) {
      return NextResponse.json(
        { error: { formErrors: ["Selected classification no longer exists"] } },
        { status: 400 },
      );
    }
  }

  let rate: number | undefined;
  if (input.componentIds !== undefined) {
    const components = await prisma.taxComponent.findMany({
      where: { id: { in: input.componentIds } },
    });
    if (components.length !== input.componentIds.length) {
      return NextResponse.json(
        { error: { formErrors: ["One or more selected tax components no longer exist"] } },
        { status: 400 },
      );
    }
    rate = components.reduce((sum, c) => sum + Number(c.rate), 0);
  }

  try {
    const group = await prisma.$transaction(async (tx) => {
      if (input.isDefault) {
        await tx.taxGroup.updateMany({
          where: { isDefault: true, id: { not: id } },
          data: { isDefault: false },
        });
      }
      if (input.componentIds !== undefined) {
        await tx.taxGroupComponent.deleteMany({ where: { taxGroupId: id } });
      }
      return tx.taxGroup.update({
        where: { id },
        data: {
          ...(input.code !== undefined && { code: input.code }),
          ...(input.name !== undefined && { name: input.name }),
          ...(input.classificationId !== undefined && {
            classificationId: input.classificationId,
          }),
          ...(rate !== undefined && { rate }),
          ...(input.pricesIncludeTax !== undefined && {
            pricesIncludeTax: input.pricesIncludeTax,
          }),
          ...(input.isDefault !== undefined && { isDefault: input.isDefault }),
          ...(input.active !== undefined && { active: input.active }),
          ...(input.componentIds !== undefined && {
            components: { create: input.componentIds.map((taxComponentId) => ({ taxComponentId })) },
          }),
        },
        include: { classification: true, components: { include: { taxComponent: true } } },
      });
    });
    return NextResponse.json({ data: group });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: { formErrors: ["Tax group not found"] } }, { status: 404 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: { formErrors: ["A tax group with this code already exists"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.taxGroup.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: { formErrors: ["Tax group not found"] } }, { status: 404 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: { formErrors: ["Cannot delete — products or categories still use this tax group"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
