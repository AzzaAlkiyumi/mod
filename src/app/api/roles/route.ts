import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { roleSchema } from "@/lib/validations/role";

export async function GET() {
  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  });
  return NextResponse.json({ data: roles });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = roleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const role = await prisma.role.create({
    data: {
      name: input.name,
      description: input.description || null,
      permissions: input.permissions,
    },
    include: { _count: { select: { users: true } } },
  });
  return NextResponse.json({ data: role }, { status: 201 });
}
