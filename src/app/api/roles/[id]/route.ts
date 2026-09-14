import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { roleSchema } from "@/lib/validations/role";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const role = await prisma.role.findUnique({
    where: { id },
    include: { _count: { select: { users: true } } },
  });
  if (!role) {
    return NextResponse.json({ error: { formErrors: ["Role not found"] } }, { status: 404 });
  }
  return NextResponse.json({ data: role });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = roleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: { formErrors: ["Role not found"] } }, { status: 404 });
  }
  if (existing.isSystem && input.name !== undefined && input.name !== existing.name) {
    return NextResponse.json(
      { error: { formErrors: ["System roles can't be renamed"] } },
      { status: 400 },
    );
  }

  const role = await prisma.role.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.description !== undefined && { description: input.description || null }),
      ...(input.permissions !== undefined && { permissions: input.permissions }),
    },
    include: { _count: { select: { users: true } } },
  });
  return NextResponse.json({ data: role });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  const existing = await prisma.role.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: { formErrors: ["Role not found"] } }, { status: 404 });
  }
  if (existing.isSystem) {
    return NextResponse.json(
      { error: { formErrors: ["System roles can't be deleted"] } },
      { status: 409 },
    );
  }

  try {
    await prisma.role.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json({ error: { formErrors: ["Role not found"] } }, { status: 404 });
    }
    throw err;
  }
}
