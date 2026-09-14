-- Stage 2 of the Tax Management migration. Requires
-- prisma/backfill-tax-management.ts to have been run first on any database
-- with existing Tax/Product/Category rows (it converts every Tax row into
-- a TaxGroup+TaxComponent and points Product.newTaxId/Category.newTaxId/
-- Product.drugScheduleId at the new rows) — otherwise this fails because
-- the old `taxId`/`drugSchedule` columns being dropped are still the only
-- ones with real data.
--
-- Idempotent: every statement here is safe to re-run, same reasoning as
-- 20260913205634_add_catalog_taxonomy_stage2 (`prisma migrate resolve
-- --rolled-back` does not undo DDL a failed attempt already committed).

-- DropForeignKey (old Product.taxId/Category.taxId -> Tax)
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_taxId_fkey";
ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_taxId_fkey";

-- Promote Product.newTaxId -> Product.taxId (pointing at TaxGroup instead of Tax)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Product' AND column_name = 'newTaxId'
  ) THEN
    ALTER TABLE "Product" DROP COLUMN IF EXISTS "taxId";
    ALTER TABLE "Product" RENAME COLUMN "newTaxId" TO "taxId";
  END IF;
END $$;

-- Promote Category.newTaxId -> Category.taxId (pointing at TaxGroup instead of Tax)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'Category' AND column_name = 'newTaxId'
  ) THEN
    ALTER TABLE "Category" DROP COLUMN IF EXISTS "taxId";
    ALTER TABLE "Category" RENAME COLUMN "newTaxId" TO "taxId";
  END IF;
END $$;

-- Drop the old free-text drug schedule column (replaced by drugScheduleId)
ALTER TABLE "Product" DROP COLUMN IF EXISTS "drugSchedule";

-- Drop the now-unused old Tax table
DROP TABLE IF EXISTS "Tax";

-- AddForeignKey: re-point taxId at TaxGroup
DO $$
BEGIN
  ALTER TABLE "Product" ADD CONSTRAINT "Product_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "TaxGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "Category" ADD CONSTRAINT "Category_taxId_fkey" FOREIGN KEY ("taxId") REFERENCES "TaxGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_taxId_idx" ON "Product"("taxId");
CREATE INDEX IF NOT EXISTS "Product_drugScheduleId_idx" ON "Product"("drugScheduleId");
