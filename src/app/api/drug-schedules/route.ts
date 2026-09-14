import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { drugScheduleSchema } from "@/lib/validations/tax-management";

export async function GET() {
  const schedules = await prisma.drugSchedule.findMany({
    orderBy: [{ country: "asc" }, { displayName: "asc" }],
  });
  return NextResponse.json({ data: schedules });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = drugScheduleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  try {
    const schedule = await prisma.drugSchedule.create({
      data: {
        shortCode: input.shortCode,
        country: input.country,
        displayName: input.displayName,
        description: input.description || null,
        active: input.active,
      },
    });
    return NextResponse.json({ data: schedule }, { status: 201 });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json(
        { error: { formErrors: ["A drug schedule with this code already exists for this country"] } },
        { status: 409 },
      );
    }
    throw err;
  }
}
