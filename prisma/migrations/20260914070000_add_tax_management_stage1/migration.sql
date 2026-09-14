-- Stage 1 of the Tax Management migration (Tax -> TaxGroup/TaxComponent/
-- TaxClassification, Product.drugSchedule free-text -> DrugSchedule FK).
-- Purely additive: creates the new tables and nullable "landing" columns
-- alongside the still-live old `Tax` table and `Product.drugSchedule`
-- string column. Requires prisma/backfill-tax-management.ts to run next
-- (populates the new tables from the old data and fills every
-- newTaxId/drugScheduleId), then stage 2 drops the old shape. See
-- 20260913205435_add_catalog_taxonomy_stage1 for the same two-stage
-- pattern used for Product.category/unit.

-- CreateTable
CREATE TABLE "TaxClassification" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TaxClassification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxComponent" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(6,3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TaxComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxGroup" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "classificationId" TEXT NOT NULL,
    "rate" DECIMAL(6,3) NOT NULL,
    "pricesIncludeTax" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TaxGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxGroupComponent" (
    "id" TEXT NOT NULL,
    "taxGroupId" TEXT NOT NULL,
    "taxComponentId" TEXT NOT NULL,

    CONSTRAINT "TaxGroupComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DrugSchedule" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DrugSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxClassification_slug_key" ON "TaxClassification"("slug");
CREATE UNIQUE INDEX "TaxComponent_code_key" ON "TaxComponent"("code");
CREATE UNIQUE INDEX "TaxGroup_code_key" ON "TaxGroup"("code");
CREATE INDEX "TaxGroup_classificationId_idx" ON "TaxGroup"("classificationId");
CREATE UNIQUE INDEX "TaxGroupComponent_taxGroupId_taxComponentId_key" ON "TaxGroupComponent"("taxGroupId", "taxComponentId");
CREATE UNIQUE INDEX "DrugSchedule_shortCode_country_key" ON "DrugSchedule"("shortCode", "country");

-- AddForeignKey
ALTER TABLE "TaxGroup" ADD CONSTRAINT "TaxGroup_classificationId_fkey" FOREIGN KEY ("classificationId") REFERENCES "TaxClassification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaxGroupComponent" ADD CONSTRAINT "TaxGroupComponent_taxGroupId_fkey" FOREIGN KEY ("taxGroupId") REFERENCES "TaxGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaxGroupComponent" ADD CONSTRAINT "TaxGroupComponent_taxComponentId_fkey" FOREIGN KEY ("taxComponentId") REFERENCES "TaxComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: nullable landing columns for the new FK targets. `newTaxId`
-- is a temporary name so it can coexist with the still-live old `taxId`
-- (-> Tax) column; stage 2 drops the old one and renames this into place.
ALTER TABLE "Product" ADD COLUMN "newTaxId" TEXT;
ALTER TABLE "Product" ADD COLUMN "drugScheduleId" TEXT;
ALTER TABLE "Category" ADD COLUMN "newTaxId" TEXT;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_newTaxId_fkey" FOREIGN KEY ("newTaxId") REFERENCES "TaxGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Product" ADD CONSTRAINT "Product_drugScheduleId_fkey" FOREIGN KEY ("drugScheduleId") REFERENCES "DrugSchedule"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Category" ADD CONSTRAINT "Category_newTaxId_fkey" FOREIGN KEY ("newTaxId") REFERENCES "TaxGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
