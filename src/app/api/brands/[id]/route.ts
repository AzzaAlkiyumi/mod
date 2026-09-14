import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { brandSchema } from "@/lib/validations/catalog";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = brandSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const brand = await prisma.brand.update({
      where: { id },
      data: {
        ...(input.name !== undefined && { name: input.name }),
        ...(input.logoUrl !== undefined && { logoUrl: input.logoUrl || null }),
        ...(input.description !== undefined && { description: input.description || null }),
        ...(input.active !== undefined && { active: input.active }),
      },
    });
    return NextResponse.json({ data: brand });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: { formErrors: ["Brand not found"] } }, { status: 404 });
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: { formErrors: ["Brand not found"] } }, { status: 404 });
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: { formErrors: ["Cannot delete — products still use this brand"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
