import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { calculateQuotationTotals } from "@/lib/calculations";
import { quotationFormSchema } from "@/lib/validations/quotation";
import { isDeletable, isEditable } from "@/lib/quotation-rules";

type Params = { params: Promise<{ id: string }> };

async function loadQuotation(id: string) {
  return prisma.quotation.findUnique({
    where: { id },
    include: {
      store: true,
      customer: true,
      createdBy: true,
      items: { include: { product: { include: { tax: true } } }, orderBy: { sortOrder: "asc" } },
    },
  });
}

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const quotation = await loadQuotation(id);
  if (!quotation) {
    return NextResponse.json({ error: { formErrors: ["Quotation not found"] } }, { status: 404 });
  }
  return NextResponse.json({ data: serialize(quotation) });
}

export async function PUT(request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await loadQuotation(id);
  if (!existing) {
    return NextResponse.json({ error: { formErrors: ["Quotation not found"] } }, { status: 404 });
  }
  if (!isEditable(existing.status)) {
    return NextResponse.json(
      { error: { formErrors: [`A quotation with status "${existing.status}" can no longer be edited`] } },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = quotationFormSchema.safeParse(body);
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

  let customer = null;
  if (input.customerId) {
    customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
    if (!customer) {
      return NextResponse.json(
        { error: { formErrors: ["Selected customer no longer exists"] } },
        { status: 400 },
      );
    }
  }

  const lineInputs = input.items.map((item) => {
    const product = productMap.get(item.productId)!;
    return {
      quantity: item.quantity,
      unitPrice: Number(product.price),
      discountType: item.discountType,
      discountValue: item.discountValue,
      taxRate: product.tax ? Number(product.tax.rate) : 0,
    };
  });

  const discountType = customer?.discountType ?? "FIXED";
  const discountValue = customer ? Number(customer.discountValue) : 0;

  const totals = calculateQuotationTotals({
    lines: lineInputs,
    discountType,
    discountValue,
  });

  const quotation = await prisma.$transaction(async (tx) => {
    await tx.quotationItem.deleteMany({ where: { quotationId: id } });
    return tx.quotation.update({
      where: { id },
      data: {
        storeId: input.storeId,
        customerId: input.customerId || null,
        prospectName: input.customerId ? null : input.prospectName,
        prospectEmail: input.customerId ? null : input.prospectEmail,
        prospectPhone: input.customerId ? null : input.prospectPhone,
        billingAddress: input.billingAddress,
        shippingAddress: input.shippingAddress,
        issueDate: new Date(input.issueDate),
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
        expectedDeliveryDate: input.expectedDeliveryDate
          ? new Date(input.expectedDeliveryDate)
          : null,
        termsAndConditions: input.termsAndConditions,
        customerNotes: input.customerNotes,
        discountType,
        discountValue,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        items: {
          create: totals.lines.map((line, idx) => ({
            productId: input.items[idx].productId,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            discountType: line.discountType,
            discountValue: line.discountValue,
            taxRate: line.taxRate,
            subtotal: line.taxableAmount,
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
  });

  return NextResponse.json({ data: serialize(quotation) });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const existing = await prisma.quotation.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: { formErrors: ["Quotation not found"] } }, { status: 404 });
  }
  if (!isDeletable(existing.status)) {
    return NextResponse.json(
      { error: { formErrors: ["A converted quotation cannot be deleted"] } },
      { status: 409 },
    );
  }

  await prisma.quotation.delete({ where: { id } });
  return NextResponse.json({ data: { id } });
}
