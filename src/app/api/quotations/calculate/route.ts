import { NextResponse } from "next/server";
import { z } from "zod";

import { calculateQuotationTotals } from "@/lib/calculations";
import { discountTypeSchema } from "@/lib/validations/quotation";

const calculateSchema = z.object({
  discountType: discountTypeSchema.default("FIXED"),
  discountValue: z.coerce.number().nonnegative().default(0),
  items: z.array(
    z.object({
      quantity: z.coerce.number().nonnegative().default(0),
      unitPrice: z.coerce.number().nonnegative().default(0),
      discountType: discountTypeSchema.default("FIXED"),
      discountValue: z.coerce.number().nonnegative().default(0),
      taxRate: z.coerce.number().nonnegative().default(0),
    }),
  ),
});

/** Live totals preview while a quotation is being drafted in the UI. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = calculateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const totals = calculateQuotationTotals({
    lines: parsed.data.items,
    discountType: parsed.data.discountType,
    discountValue: parsed.data.discountValue,
  });

  return NextResponse.json({ data: totals });
}
