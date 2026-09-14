/**
 * Backfill for the Tax Management migration
 * (20260914070000_add_tax_management_stage1 -> ..._stage2).
 *
 * Converts every old `Tax` row into a `TaxGroup` + one `TaxComponent`
 * (linked via `TaxGroupComponent`), points every Product/Category's new
 * `newTaxId` landing column at the matching TaxGroup, and converts every
 * Product's old free-text `drugSchedule` value into a real `DrugSchedule`
 * row + `drugScheduleId`. Must be run against a database that has stage 1
 * applied but NOT yet stage 2 (stage 2 drops the old `Tax` table and
 * `Product.drugSchedule` column and promotes `newTaxId` -> `taxId` — any
 * product/category whose `newTaxId` is still null at that point will
 * silently lose its tax link, since taxId stays nullable, so this script
 * must run first).
 *
 * Uses raw SQL for the old `Tax` table and old `Product.drugSchedule`
 * string column because the committed schema.prisma is already at its
 * final, post-migration shape (no `Tax` model, and `drugSchedule` is now a
 * relation field name, not a string column) — the generated Prisma Client
 * has no typed way to read those, even though they still physically exist
 * in a database stuck between the two migrations. `newTaxId` is likewise
 * written via raw SQL since it's a temporary staging column with no model
 * field. Safe to re-run — every write here is idempotent.
 *
 * Usage: npx tsx prisma/backfill-tax-management.ts
 * Then:  npx prisma migrate deploy --config prisma7.config.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const TAX_CLASSIFICATIONS = [
  { name: "Taxable", slug: "taxable", sortOrder: 0 },
  { name: "Nil Rated", slug: "nil_rated", sortOrder: 1 },
  { name: "Zero Rated", slug: "zero_rated", sortOrder: 2 },
  { name: "Exempt", slug: "exempt", sortOrder: 3 },
  { name: "Composition", slug: "composition", sortOrder: 4 },
  { name: "Reverse Charge", slug: "reverse_charge", sortOrder: 5 },
];

const DRUG_SCHEDULES_IN = [
  { shortCode: "OTC", displayName: "Over-the-Counter" },
  { shortCode: "H", displayName: "Schedule H" },
  { shortCode: "H1", displayName: "Schedule H1" },
  { shortCode: "X", displayName: "Schedule X" },
  { shortCode: "G", displayName: "Schedule G" },
];

function codeFor(name: string, usedCodes: Set<string>): string {
  const base = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "TAX";
  let code = base;
  let n = 2;
  while (usedCodes.has(code)) {
    code = `${base}_${n}`;
    n += 1;
  }
  usedCodes.add(code);
  return code;
}

async function main() {
  const legacyTaxes = await prisma.$queryRaw<
    { id: string; name: string; rate: string; isDefault: boolean }[]
  >`SELECT id, name, rate, "isDefault" FROM "Tax"`;

  for (const c of TAX_CLASSIFICATIONS) {
    await prisma.taxClassification.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }
  const taxableClassification = await prisma.taxClassification.findFirstOrThrow({
    where: { slug: "taxable" },
  });

  const usedCodes = new Set<string>(
    (await prisma.taxGroup.findMany({ select: { code: true } })).map((g) => g.code),
  );
  const usedComponentCodes = new Set<string>(
    (await prisma.taxComponent.findMany({ select: { code: true } })).map((c) => c.code),
  );

  const taxGroupIdByLegacyTaxId = new Map<string, string>();
  for (const legacyTax of legacyTaxes) {
    const existingGroup = await prisma.taxGroup.findFirst({ where: { name: legacyTax.name } });
    if (existingGroup) {
      taxGroupIdByLegacyTaxId.set(legacyTax.id, existingGroup.id);
      continue;
    }

    const component = await prisma.taxComponent.create({
      data: {
        code: codeFor(legacyTax.name, usedComponentCodes),
        name: legacyTax.name,
        rate: legacyTax.rate,
        active: true,
      },
    });
    const group = await prisma.taxGroup.create({
      data: {
        code: codeFor(legacyTax.name, usedCodes),
        name: legacyTax.name,
        classificationId: taxableClassification.id,
        rate: legacyTax.rate,
        isDefault: legacyTax.isDefault,
        active: true,
        components: { create: [{ taxComponentId: component.id }] },
      },
    });
    taxGroupIdByLegacyTaxId.set(legacyTax.id, group.id);
  }

  const products = await prisma.product.findMany({ select: { id: true, taxId: true } });
  const legacyDrugSchedules = await prisma.$queryRaw<
    { id: string; drugSchedule: string }[]
  >`SELECT id, "drugSchedule" FROM "Product"`;
  const legacyDrugScheduleById = new Map(legacyDrugSchedules.map((p) => [p.id, p.drugSchedule]));

  const drugScheduleIdByShortCode = new Map<string, string>();
  for (const ds of DRUG_SCHEDULES_IN) {
    const row = await prisma.drugSchedule.upsert({
      where: { shortCode_country: { shortCode: ds.shortCode, country: "IN" } },
      update: {},
      create: { ...ds, country: "IN" },
    });
    drugScheduleIdByShortCode.set(ds.shortCode, row.id);
  }

  let productsUpdated = 0;
  for (const p of products) {
    const newTaxId = p.taxId ? (taxGroupIdByLegacyTaxId.get(p.taxId) ?? null) : null;
    const legacyDrugSchedule = legacyDrugScheduleById.get(p.id) ?? "NOT_SCHEDULED";
    const drugScheduleId =
      legacyDrugSchedule && legacyDrugSchedule !== "NOT_SCHEDULED"
        ? (drugScheduleIdByShortCode.get(legacyDrugSchedule) ?? null)
        : null;
    await prisma.$executeRaw`
      UPDATE "Product" SET "newTaxId" = ${newTaxId}, "drugScheduleId" = ${drugScheduleId}
      WHERE id = ${p.id}
    `;
    productsUpdated += 1;
  }

  const categories = await prisma.category.findMany({ select: { id: true, taxId: true } });
  let categoriesUpdated = 0;
  for (const c of categories) {
    const newTaxId = c.taxId ? (taxGroupIdByLegacyTaxId.get(c.taxId) ?? null) : null;
    await prisma.$executeRaw`UPDATE "Category" SET "newTaxId" = ${newTaxId} WHERE id = ${c.id}`;
    categoriesUpdated += 1;
  }

  console.log(`Converted ${legacyTaxes.length} legacy Tax rows into TaxGroup+TaxComponent.`);
  console.log(`Updated ${productsUpdated} products, ${categoriesUpdated} categories.`);
  console.log(`Drug schedules seeded: ${drugScheduleIdByShortCode.size}.`);

  const mismatches = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM "Product" WHERE "taxId" IS NOT NULL AND "newTaxId" IS NULL
  `;
  if (Number(mismatches[0].count) > 0) {
    console.error(
      `${mismatches[0].count} products have a legacy taxId that failed to map to a TaxGroup — do NOT run migrate deploy yet.`,
    );
    process.exit(1);
  }
  console.log("Safe to run: npx prisma migrate deploy --config prisma7.config.ts");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
