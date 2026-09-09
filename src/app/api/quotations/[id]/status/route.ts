import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { quotationStatusUpdateSchema } from "@/lib/validations/quotation";
import { canTransition, isConvertible } from "@/lib/quotation-rules";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.quotation.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!existing) {
    return NextResponse.json({ error: { formErrors: ["Quotation not found"] } }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = quotationStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status: nextStatus } = parsed.data;

  if (!canTransition(existing.status, nextStatus)) {
    return NextResponse.json(
      {
        error: {
          formErrors: [`Cannot move a quotation from "${existing.status}" to "${nextStatus}"`],
        },
      },
      { status: 409 },
    );
  }

  // "A quotation does not reserve or deduct stock. Availability is checked
  // when it is converted to a sale." — this app has no Sale/stock model, so
  // conversion is a status-only stub; see QUOTATION_AUDIT.md "Unknown Behavior".
  if (nextStatus === "CONVERTED" && !isConvertible(existing.status)) {
    return NextResponse.json(
      { error: { formErrors: ["Only an accepted quotation can be converted to a sale"] } },
      { status: 409 },
    );
  }

  const quotation = await prisma.quotation.update({
    where: { id },
    data: {
      status: nextStatus,
      convertedAt: nextStatus === "CONVERTED" ? new Date() : existing.convertedAt,
    },
    include: {
      store: true,
      customer: true,
      items: { include: { product: true } },
    },
  });

  return NextResponse.json({ data: serialize(quotation) });
}
