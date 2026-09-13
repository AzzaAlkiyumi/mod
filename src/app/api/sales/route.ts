import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { calculateQuotationTotals } from "@/lib/calculations";
import { saleFormSchema } from "@/lib/validations/sale";
import { generateSaleNumber } from "@/lib/sale-number";
import { getCurrentUser } from "@/lib/current-user";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = saleFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const products = await prisma.product.findMany({
    where: { id: { in: input.items.map((i) => i.productId) } },
    include: { tax: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of input.items) {
    if (!productMap.has(item.productId)) {
      return NextResponse.json(
        { error: { formErrors: [`Unknown product: ${item.productId}`] } },
        { status: 400 },
      );
    }
  }

  const store = await prisma.store.findUnique({ where: { id: input.storeId } });
  if (!store) {
    return NextResponse.json(
      { error: { formErrors: ["Selected store no longer exists"] } },
      { status: 400 },
    );
  }

  if (input.customerId) {
    const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) {
      return NextResponse.json(
        { error: { formErrors: ["Selected customer no longer exists"] } },
        { status: 400 },
      );
    }
  }

  // Server is the source of truth for price + tax rate — never trust the client's copy.
  const lineInputs = input.items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      quantity: item.quantity,
      unitPrice: Number(product.price),
      discountType: "FIXED" as const,
      discountValue: 0,
      taxRate: product.tax ? Number(product.tax.rate) : 0,
    };
  });

  // A POS sale has no discount (see the Sale model's doc comment) — this
  // reuses calculateQuotationTotals purely for its per-line math.
  const totals = calculateQuotationTotals({
    lines: lineInputs,
    discountType: "FIXED",
    discountValue: 0,
  });

  const currentUser = await getCurrentUser();
  const number = await generateSaleNumber();

  const sale = await prisma.sale.create({
    data: {
      number,
      storeId: input.storeId,
      createdById: currentUser.id,
      customerId: input.customerId || null,
      paymentMethod: input.paymentMethod,
      subtotal: totals.subtotal,
      taxTotal: totals.taxTotal,
      total: totals.total,
      items: {
        create: totals.lines.map((line, idx) => ({
          productId: input.items[idx].productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          taxRate: line.taxRate,
          taxAmount: line.taxAmount,
          lineTotal: line.lineTotal,
          sortOrder: idx,
        })),
      },
    },
    include: {
      store: true,
      customer: true,
      items: { include: { product: true } },
    },
  });

  return NextResponse.json({ data: serialize(sale) }, { status: 201 });
}
