-- Adds system-wide Settings (Administration > Settings), starting with the
-- Currency & formatting fields. A true singleton table: the app always
-- reads/writes the row with id = 'singleton'. Purely additive — no
-- existing table or column is touched.

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "currencyCode" TEXT NOT NULL DEFAULT 'OMR',
    "currencySymbol" TEXT NOT NULL DEFAULT 'OMR',
    "currencyDecimals" INTEGER NOT NULL DEFAULT 3,
    "thousandsSeparator" TEXT NOT NULL DEFAULT ',',
    "decimalSeparator" TEXT NOT NULL DEFAULT '.',
    "symbolBeforeAmount" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);
