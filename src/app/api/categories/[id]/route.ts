import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/validations/catalog";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  if (input.parentId === id) {
    return NextResponse.json(
      { error: { formErrors: ["A category cannot be its own parent"] } },
      { status: 400 },
    );
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.iconColor !== undefined && { iconColor: input.iconColor }),
        ...(input.taxId !== undefined && { taxId: input.taxId || null }),
        ...(input.parentId !== undefined && { parentId: input.parentId || null }),
        ...(input.active !== undefined && { active: input.active }),
      },
      include: { tax: true, parent: true },
    });
    return NextResponse.json({ data: category });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: { formErrors: ["Category not found"] } }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: { formErrors: ["Category not found"] } }, { status: 404 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        {
          error: {
            formErrors: ["Cannot delete — products or sub-categories still use this category"],
          },
        },
        { status: 409 },
      );
    }
    throw err;
  }
}
