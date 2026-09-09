import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { serialize } from "@/lib/serialize";
import { calculateQuotationTotals } from "@/lib/calculations";
import { quotationFormSchema, quotationStatusSchema } from "@/lib/validations/quotation";
import { generateQuotationNumber } from "@/lib/quotation-number";
import { getCurrentUser } from "@/lib/current-user";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const q = searchParams.get("q")?.trim();
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "20")));

  const where: Prisma.QuotationWhereInput = {};

  const statusParsed = status ? quotationStatusSchema.safeParse(status) : null;
  if (statusParsed?.success) {
    where.status = statusParsed.data;
  }

  if (from || to) {
    where.issueDate = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
    };
  }

  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { prospectName: { contains: q, mode: "insensitive" } },
      { customer: { name: { contains: q, mode: "insensitive" } } },
      { items: { some: { product: { name: { contains: q, mode: "insensitive" } } } } },
      { items: { some: { product: { sku: { contains: q, mode: "insensitive" } } } } },
    ];
  }

  const [total, quotations] = await Promise.all([
    prisma.quotation.count({ where }),
    prisma.quotation.findMany({
      where,
      include: {
        store: true,
        customer: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({
    data: serialize(quotations),
    meta: { total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) },
  });
}

export async function POST(request: Request) {
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

  // Discount is customer-level data, not something typed on the form — see
  // Customer.discountType/discountValue and QUOTATION_AUDIT.md.
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

  const store = await prisma.store.findUnique({ where: { id: input.storeId } });
  if (!store) {
    return NextResponse.json({ error: { formErrors: ["Selected store no longer exists"] } }, { status: 400 });
  }

  // Server is the source of truth for price + tax rate — never trust the client's copy.
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

  const currentUser = await getCurrentUser();
  const number = await generateQuotationNumber();

  const quotation = await prisma.quotation.create({
    data: {
      number,
      storeId: input.storeId,
      createdById: currentUser.id,
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
      status: "DRAFT",
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

  return NextResponse.json({ data: serialize(quotation) }, { status: 201 });
}
