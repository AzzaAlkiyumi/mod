/**
 * Recovery/backfill tool for the catalog-taxonomy migration
 * (20260913205435_add_catalog_taxonomy_stage1 -> ..._stage2).
 *
 * Converts every Product's old free-text `unit`/`category` columns into
 * real Unit/Category rows and sets unitId/categoryId accordingly. Must be
 * run against a database that has stage 1 applied but NOT yet stage 2
 * (stage 2 drops the old `unit`/`category` columns and makes unitId
 * required — it will fail with a NOT NULL violation if any product still
 * has a null unitId, which is exactly what this script fixes).
 *
 * Uses raw SQL to read the old `unit`/`category` columns because the
 * committed schema.prisma is already at its final, post-migration shape
 * (no `unit`/`category` scalar fields) — the generated Prisma Client has
 * no typed way to read columns that no longer exist in the schema, even
 * though they still physically exist in a database stuck between the two
 * migrations. Safe to re-run — every write here is idempotent.
 *
 * Usage: npx tsx prisma/backfill-catalog.ts
 * Then:  npx prisma migrate deploy --config prisma7.config.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const UNIT_CATEGORIES = [
  { name: "Count", slug: "count", sortOrder: 0 },
  { name: "Weight", slug: "weight", sortOrder: 1 },
  { name: "Volume", slug: "volume", sortOrder: 2 },
  { name: "Length", slug: "length", sortOrder: 3 },
  { name: "Time", slug: "time", sortOrder: 4 },
];

const WEIGHT_UNITS = new Set(["kg", "g", "mg", "lb", "oz"]);
const VOLUME_UNITS = new Set(["l", "ml"]);
const LENGTH_UNITS = new Set(["m", "cm", "mm", "ft", "in", "yd"]);

function categorySlugFor(unit: string): string {
  const lower = unit.toLowerCase();
  if (WEIGHT_UNITS.has(lower)) return "weight";
  if (VOLUME_UNITS.has(lower)) return "volume";
  if (LENGTH_UNITS.has(lower)) return "length";
  return "count";
}

async function main() {
  const legacyProducts = await prisma.$queryRaw<
    { id: string; unit: string; category: string | null }[]
  >`SELECT id, unit, category FROM "Product"`;

  if (legacyProducts.length === 0) {
    console.log("No products found — nothing to backfill (or stage 2 already ran).");
    return;
  }

  const unitCategoryBySlug = new Map<string, string>();
  for (const uc of UNIT_CATEGORIES) {
    const row = await prisma.unitCategory.upsert({
      where: { slug: uc.slug },
      update: {},
      create: uc,
    });
    unitCategoryBySlug.set(uc.slug, row.id);
  }

  const distinctUnits = [...new Set(legacyProducts.map((p) => p.unit))];
  const unitIdByShortCode = new Map<string, string>();
  for (const unit of distinctUnits) {
    const slug = categorySlugFor(unit);
    const row = await prisma.unit.upsert({
      where: { shortCode: unit },
      update: {},
      create: {
        shortCode: unit,
        displayName: unit,
        measurementCategoryId: unitCategoryBySlug.get(slug)!,
      },
    });
    unitIdByShortCode.set(unit, row.id);
  }

  const distinctCategories = [
    ...new Set(legacyProducts.map((p) => p.category).filter((c): c is string => Boolean(c))),
  ];
  const categoryIdByName = new Map<string, string>();
  for (const category of distinctCategories) {
    const existing = await prisma.category.findFirst({ where: { name: category } });
    const row = existing ?? (await prisma.category.create({ data: { name: category } }));
    categoryIdByName.set(category, row.id);
  }

  for (const p of legacyProducts) {
    await prisma.product.update({
      where: { id: p.id },
      data: {
        unitId: unitIdByShortCode.get(p.unit),
        categoryId: p.category ? categoryIdByName.get(p.category) : null,
      },
    });
  }

  const stillMissingUnit = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM "Product" WHERE "unitId" IS NULL
  `;
  console.log(`Backfilled ${legacyProducts.length} products.`);
  console.log(`Units created: ${unitIdByShortCode.size}, Categories created: ${categoryIdByName.size}`);
  console.log(`Products still missing unitId: ${stillMissingUnit[0].count}`);
  if (Number(stillMissingUnit[0].count) > 0) {
    console.error("Some products are still missing unitId — do NOT run migrate deploy yet.");
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
