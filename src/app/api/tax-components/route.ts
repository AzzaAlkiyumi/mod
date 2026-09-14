import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { taxComponentSchema } from "@/lib/validations/tax-management";

export async function GET() {
  const components = await prisma.taxComponent.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ data: components });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = taxComponentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const component = await prisma.taxComponent.create({
      data: { code: input.code, name: input.name, rate: input.rate, active: input.active },
    });
    return NextResponse.json({ data: component }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: { formErrors: ["A tax component with this code already exists"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
