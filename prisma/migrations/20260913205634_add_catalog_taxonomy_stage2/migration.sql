-- Stage 2 of the catalog-taxonomy migration. Every Product row was already
-- backfilled onto the new Unit/Category tables (prisma/backfill-catalog.ts,
-- run and removed after use) before this migration was written — the old
-- "category"/"unit" string columns below are dropped only because their
-- data already lives in Category/Unit via categoryId/unitId.

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_unitId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "category",
DROP COLUMN "unit",
ALTER COLUMN "unitId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
