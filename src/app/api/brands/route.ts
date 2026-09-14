import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { brandSchema } from "@/lib/validations/catalog";

export async function GET() {
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ data: brands });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const brand = await prisma.brand.create({
    data: {
      name: input.name,
      logoUrl: input.logoUrl || null,
      description: input.description || null,
      active: input.active,
    },
  });
  return NextResponse.json({ data: brand }, { status: 201 });
}
