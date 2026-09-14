-- Stage 2 of the catalog-taxonomy migration. Requires prisma/backfill-catalog.ts
-- to have been run first on any database with existing Product rows (it sets
-- every product's new unitId/categoryId from its old category/unit columns) —
-- otherwise the ALTER TABLE below fails with a NOT NULL violation on unitId.
--
-- Idempotent: every statement here is safe to re-run. `prisma migrate resolve
-- --rolled-back` only clears Prisma's own bookkeeping — it does NOT undo DDL a
-- failed attempt already committed (e.g. a dropped constraint from an earlier,
-- partially-successful run of this same file), so a retry must tolerate any of
-- these statements having already applied.

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_unitId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN IF EXISTS "category",
DROP COLUMN IF EXISTS "unit",
ALTER COLUMN "unitId" SET NOT NULL;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "Product" ADD CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
