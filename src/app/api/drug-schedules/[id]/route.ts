import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { drugScheduleSchema } from "@/lib/validations/tax-management";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = drugScheduleSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const schedule = await prisma.drugSchedule.update({
      where: { id },
      data: {
        ...(input.shortCode !== undefined && { shortCode: input.shortCode }),
        ...(input.country !== undefined && { country: input.country }),
        ...(input.displayName !== undefined && { displayName: input.displayName }),
        ...(input.description !== undefined && { description: input.description || null }),
        ...(input.active !== undefined && { active: input.active }),
      },
    });
    return NextResponse.json({ data: schedule });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { error: { formErrors: ["Drug schedule not found"] } },
        { status: 404 },
      );
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: { formErrors: ["A drug schedule with this code already exists for this country"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  try {
    await prisma.drugSchedule.delete({ where: { id } });
    return NextResponse.json({ data: { id } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return NextResponse.json(
        { error: { formErrors: ["Drug schedule not found"] } },
        { status: 404 },
      );
    }
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return NextResponse.json(
        { error: { formErrors: ["Cannot delete — products still use this drug schedule"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
