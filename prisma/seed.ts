import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { calculateQuotationTotals } from "../src/lib/calculations";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.quotationItem.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.saleItem.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.unit.deleteMany();
  await prisma.unitCategory.deleteMany();
  await prisma.taxGroupComponent.deleteMany();
  await prisma.taxGroup.deleteMany();
  await prisma.taxComponent.deleteMany();
  await prisma.taxClassification.deleteMany();
  await prisma.drugSchedule.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();
  await prisma.store.deleteMany();

  // Real company/legal details, as given by the user (from their own TECHNICAL
  // LINE / TIS invoice) — used on the Quotation print document's header. Both
  // stores are branches of the same legal company, so both carry it.
  const companyInfo = {
    legalNameEn: "TECHNICAL LINE",
    legalNameAr: null,
    crNumber: "1614921",
    poBox: "311",
    countryEn: "Sultanate of Oman",
    countryAr: "سلطنة عمان",
    addressEn: "North Al Batinah, Sohar Al Waqibah",
    addressAr: "شمال الباطنة، صحار الوقيبة",
    vatNumber: "2238547",
    mobile: "97295225",
    email: "3zan901@gmail.com",
  };

  const mainStore = await prisma.store.create({
    data: { name: "Main Store", code: "MAIN", isDefault: true, ...companyInfo },
  });
  const downtown = await prisma.store.create({
    data: { name: "Downtown Branch", code: "DOWNTOWN", ...companyInfo },
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

  // Tax Management — classifications drive filing/reporting, tax groups are
  // the thing actually applied to products/categories (built from one or
  // more tax components). Mirrors the reference site's Tax Management pages.
  const [taxableClassification, zeroRatedClassification] = await Promise.all([
    prisma.taxClassification.create({ data: { name: "Taxable", slug: "taxable", sortOrder: 0 } }),
    prisma.taxClassification.create({
      data: { name: "Zero Rated", slug: "zero_rated", sortOrder: 2 },
    }),
  ]);
  await prisma.taxClassification.createMany({
    data: [
      { name: "Nil Rated", slug: "nil_rated", sortOrder: 1 },
      { name: "Exempt", slug: "exempt", sortOrder: 3 },
      { name: "Composition", slug: "composition", sortOrder: 4 },
      { name: "Reverse Charge", slug: "reverse_charge", sortOrder: 5 },
    ],
  });

  // Oman's actual VAT rate is 5% (matches the reference invoice's "VAT 5%").
  const standardVatComponent = await prisma.taxComponent.create({
    data: { code: "VAT_5", name: "VAT 5%", rate: 5 },
  });
  const standardTax = await prisma.taxGroup.create({
    data: {
      code: "STANDARD_VAT",
      name: "Standard VAT",
      classificationId: taxableClassification.id,
      rate: 5,
      isDefault: true,
      components: { create: [{ taxComponentId: standardVatComponent.id }] },
    },
  });
  const zeroRatedComponent = await prisma.taxComponent.create({
    data: { code: "ZERO", name: "Zero Rated", rate: 0 },
  });
  const zeroTax = await prisma.taxGroup.create({
    data: {
      code: "ZERO_RATED",
      name: "Zero Rated",
      classificationId: zeroRatedClassification.id,
      rate: 0,
      components: { create: [{ taxComponentId: zeroRatedComponent.id }] },
    },
  });

  await prisma.drugSchedule.createMany({
    data: [
      { shortCode: "OTC", country: "IN", displayName: "Over-the-Counter" },
      { shortCode: "H", country: "IN", displayName: "Schedule H" },
      { shortCode: "H1", country: "IN", displayName: "Schedule H1" },
      { shortCode: "X", country: "IN", displayName: "Schedule X" },
      { shortCode: "G", country: "IN", displayName: "Schedule G" },
    ],
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

  // Catalog taxonomy (Product Setup) — measurement categories, units,
  // product categories. Mirrors the reference site's Product Setup pages.
  const countUnitCategory = await prisma.unitCategory.create({
    data: { name: "Count", slug: "count", sortOrder: 0 },
  });
  await prisma.unitCategory.createMany({
    data: [
      { name: "Weight", slug: "weight", sortOrder: 1 },
      { name: "Volume", slug: "volume", sortOrder: 2 },
      { name: "Length", slug: "length", sortOrder: 3 },
      { name: "Time", slug: "time", sortOrder: 4 },
    ],
  });
  const pcsUnit = await prisma.unit.create({
    data: { shortCode: "pcs", displayName: "pcs", measurementCategoryId: countUnitCategory.id },
  });

  const categoryNames = ["Peripherals", "Displays", "Cables", "Accessories"] as const;
  const categories = Object.fromEntries(
    await Promise.all(
      categoryNames.map(async (name) => [name, await prisma.category.create({ data: { name } })]),
    ),
  ) as Record<(typeof categoryNames)[number], { id: string }>;

  const products = await Promise.all(
    [
      { sku: "SKU-1001", barcode: "8901030875021", name: "Wireless Mouse", unitId: pcsUnit.id, price: 12.99, taxId: standardTax.id, imageUrl: "/products/wireless-mouse.svg", categoryId: categories.Peripherals.id },
      { sku: "SKU-1002", barcode: "8901030875038", name: "Mechanical Keyboard", unitId: pcsUnit.id, price: 45.5, taxId: standardTax.id, imageUrl: "/products/mechanical-keyboard.svg", categoryId: categories.Peripherals.id },
      // Intentionally left without an image to exercise the "no photo yet" placeholder path.
      { sku: "SKU-1003", barcode: "8901030875045", name: '24" LED Monitor', unitId: pcsUnit.id, price: 129.0, taxId: standardTax.id, categoryId: categories.Displays.id },
      { sku: "SKU-1004", barcode: "8901030875052", name: "USB-C Cable 1m", unitId: pcsUnit.id, price: 4.25, taxId: zeroTax.id, imageUrl: "/products/usb-c-cable.svg", categoryId: categories.Cables.id },
      { sku: "SKU-1005", barcode: "8901030875069", name: "Laptop Stand", unitId: pcsUnit.id, price: 22.0, taxId: standardTax.id, imageUrl: "/products/laptop-stand.svg", categoryId: categories.Accessories.id },
      { sku: "SKU-1006", barcode: "8901030875076", name: "USB-C Hub 7-in-1", unitId: pcsUnit.id, price: 34.0, taxId: standardTax.id, imageUrl: "/products/usb-hub.svg", categoryId: categories.Peripherals.id },
      { sku: "SKU-1007", barcode: "8901030875083", name: "HD Webcam 1080p", unitId: pcsUnit.id, price: 39.99, taxId: standardTax.id, imageUrl: "/products/webcam.svg", categoryId: categories.Peripherals.id },
      { sku: "SKU-1008", barcode: "8901030875090", name: "HDMI Cable 2m", unitId: pcsUnit.id, price: 7.5, taxId: zeroTax.id, categoryId: categories.Cables.id },
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
