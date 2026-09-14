import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { taxComponentSchema } from "@/lib/validations/tax-management";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = taxComponentSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const component = await prisma.taxComponent.update({
      where: { id },
      data: {
        ...(input.code !== undefined && { code: input.code }),
        ...(input.name !== undefined && { name: input.name }),
        ...(input.rate !== undefined && { rate: input.rate }),
        ...(input.active !== undefined && { active: input.active }),
      },
    });

    // Keep every TaxGroup that includes this component in sync with its new rate.
    if (input.rate !== undefined) {
      const groups = await prisma.taxGroup.findMany({
        where: { components: { some: { taxComponentId: id } } },
        include: { components: { include: { taxComponent: true } } },
      });
      for (const group of groups) {
        const rate = group.components.reduce((sum, c) => sum + Number(c.taxComponent.rate), 0);
        await prisma.taxGroup.update({ where: { id: group.id }, data: { rate } });
      }
    }

    return NextResponse.json({ data: component });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { error: { formErrors: ["Tax component not found"] } },
        { status: 404 },
      );
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: { formErrors: ["A tax component with this code already exists"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.taxComponent.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { error: { formErrors: ["Tax component not found"] } },
        { status: 404 },
      );
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: { formErrors: ["Cannot delete — tax groups still use this component"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
