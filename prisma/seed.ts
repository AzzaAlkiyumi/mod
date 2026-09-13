import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { calculateQuotationTotals } from "../src/lib/calculations";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.tax.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  const mainStore = await prisma.store.create({
    data: { name: "Main Store", code: "MAIN", isDefault: true },
  });
  const downtown = await prisma.store.create({
    data: { name: "Downtown Branch", code: "DOWNTOWN" },
  });

  const admin = await prisma.user.create({
    data: {
      name: "admin",
      email: "admin@hyperpos.local",
      role: "ADMINISTRATOR",
      storeId: mainStore.id,
    },
  });
  const cashier = await prisma.user.create({
    data: {
      name: "Demo Cashier",
      email: "cashier@hyperpos.local",
      role: "ADMINISTRATOR",
      storeId: mainStore.id,
    },
  });

  const standardTax = await prisma.tax.create({
    data: { name: "Standard VAT", rate: 15, isDefault: true },
  });
  const zeroTax = await prisma.tax.create({
    data: { name: "Zero Rated", rate: 0 },
  });

  const customers = await Promise.all(
    [
      { code: "C-000043", name: "Aarav Singh", phone: "+91 87654 32100", email: "aarav.singh@example.com", discountType: "PERCENT" as const, discountValue: 5 },
      { code: "C-000056", name: "Diana Fernandes", phone: "+94 96543 23456", email: "diana.f@example.com" },
      { code: "C-000061", name: "Abaas Muuse", phone: "+252 61 234 5678", email: "abaas.muuse@example.com" },
      { code: "C-000072", name: "Mohan Pillai", phone: "+91 98765 43277", email: "mohan.pillai@example.com", discountType: "FIXED" as const, discountValue: 3 },
    ].map((c) =>
      prisma.customer.create({
        data: {
          ...c,
          billingAddress: "221B Baker Street, Colombo 03, Sri Lanka",
          shippingAddress: "221B Baker Street, Colombo 03, Sri Lanka",
        },
      }),
    ),
  );

  const products = await Promise.all(
    [
      { sku: "SKU-1001", barcode: "8901030875021", name: "Wireless Mouse", unit: "pcs", price: 12.99, taxId: standardTax.id, imageUrl: "/products/wireless-mouse.svg" },
      { sku: "SKU-1002", barcode: "8901030875038", name: "Mechanical Keyboard", unit: "pcs", price: 45.5, taxId: standardTax.id, imageUrl: "/products/mechanical-keyboard.svg" },
      // Intentionally left without an image to exercise the "no photo yet" placeholder path.
      { sku: "SKU-1003", barcode: "8901030875045", name: '24" LED Monitor', unit: "pcs", price: 129.0, taxId: standardTax.id },
      { sku: "SKU-1004", barcode: "8901030875052", name: "USB-C Cable 1m", unit: "pcs", price: 4.25, taxId: zeroTax.id, imageUrl: "/products/usb-c-cable.svg" },
      { sku: "SKU-1005", barcode: "8901030875069", name: "Laptop Stand", unit: "pcs", price: 22.0, taxId: standardTax.id, imageUrl: "/products/laptop-stand.svg" },
    ].map((p) => prisma.product.create({ data: p })),
  );

  async function createQuotation(opts: {
    number: string;
    status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED";
    customerId?: string;
    prospectName?: string;
    prospectEmail?: string;
    prospectPhone?: string;
    daysAgo: number;
    lines: { productIndex: number; quantity: number; discountValue?: number }[];
  }) {
    const issueDate = new Date();
    issueDate.setDate(issueDate.getDate() - opts.daysAgo);
    const validUntil = new Date(issueDate);
    validUntil.setDate(validUntil.getDate() + 7);

    const lineInputs = opts.lines.map((line) => {
      const product = products[line.productIndex];
      const taxRate = Number(
        product.taxId === standardTax.id ? standardTax.rate : zeroTax.rate,
      );
      return {
        quantity: line.quantity,
        unitPrice: Number(product.price),
        discountType: "FIXED" as const,
        discountValue: line.discountValue ?? 0,
        taxRate,
      };
    });

    const customer = opts.customerId
      ? customers.find((c) => c.id === opts.customerId)
      : undefined;

    const totals = calculateQuotationTotals({
      lines: lineInputs,
      discountType: customer?.discountType ?? "FIXED",
      discountValue: customer ? Number(customer.discountValue) : 0,
    });

    const itemsData = totals.lines.map((line, idx) => ({
      productId: products[opts.lines[idx].productIndex].id,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discountType: line.discountType,
      discountValue: line.discountValue,
      taxRate: line.taxRate,
      subtotal: line.taxableAmount,
      taxAmount: line.taxAmount,
      lineTotal: line.lineTotal,
      sortOrder: idx,
    }));

    return prisma.quotation.create({
      data: {
        number: opts.number,
        storeId: mainStore.id,
        createdById: opts.status === "DRAFT" ? cashier.id : admin.id,
        customerId: opts.customerId,
        prospectName: opts.prospectName,
        prospectEmail: opts.prospectEmail,
        prospectPhone: opts.prospectPhone,
        billingAddress: "221B Baker Street, Colombo 03, Sri Lanka",
        shippingAddress: "221B Baker Street, Colombo 03, Sri Lanka",
        issueDate,
        validUntil,
        status: opts.status,
        discountType: customer?.discountType ?? "FIXED",
        discountValue: customer ? customer.discountValue : 0,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        convertedAt: opts.status === "CONVERTED" ? new Date() : null,
        items: { create: itemsData },
      },
    });
  }

  await createQuotation({
    number: "QT-000001",
    status: "DRAFT",
    customerId: customers[0].id,
    daysAgo: 1,
    lines: [
      { productIndex: 0, quantity: 2 },
      { productIndex: 3, quantity: 3, discountValue: 1 },
    ],
  });

  await createQuotation({
    number: "QT-000002",
    status: "SENT",
    customerId: customers[1].id,
    daysAgo: 3,
    lines: [{ productIndex: 2, quantity: 1 }, { productIndex: 4, quantity: 1 }],
  });

  await createQuotation({
    number: "QT-000003",
    status: "ACCEPTED",
    prospectName: "Walk-in Customer",
    prospectEmail: "walkin@example.com",
    prospectPhone: "+1 201-555-0199",
    daysAgo: 6,
    lines: [{ productIndex: 1, quantity: 4, discountValue: 5 }],
  });

  await createQuotation({
    number: "QT-000004",
    status: "CONVERTED",
    customerId: customers[2].id,
    daysAgo: 12,
    lines: [
      { productIndex: 0, quantity: 5 },
      { productIndex: 1, quantity: 2 },
      { productIndex: 2, quantity: 1 },
    ],
  });

  await createQuotation({
    number: "QT-000005",
    status: "EXPIRED",
    customerId: customers[3].id,
    daysAgo: 20,
    lines: [{ productIndex: 4, quantity: 2 }],
  });

  console.log("Seed complete:", {
    stores: [mainStore.name, downtown.name],
    users: [admin.name, cashier.name],
    customers: customers.length,
    products: products.length,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
