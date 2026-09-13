-- Widen monetary Decimal columns from 2 to 3 decimal places (OMR uses baisa,
-- 1/1000 of a rial). Widening precision is a safe, non-lossy cast.
ALTER TABLE "Customer" ALTER COLUMN "discountValue" TYPE DECIMAL(12,3);

ALTER TABLE "Product" ALTER COLUMN "price" TYPE DECIMAL(12,3);

ALTER TABLE "Quotation" ALTER COLUMN "discountValue" TYPE DECIMAL(12,3);
ALTER TABLE "Quotation" ALTER COLUMN "subtotal" TYPE DECIMAL(12,3);
ALTER TABLE "Quotation" ALTER COLUMN "discountTotal" TYPE DECIMAL(12,3);
ALTER TABLE "Quotation" ALTER COLUMN "taxTotal" TYPE DECIMAL(12,3);
ALTER TABLE "Quotation" ALTER COLUMN "total" TYPE DECIMAL(12,3);

ALTER TABLE "QuotationItem" ALTER COLUMN "unitPrice" TYPE DECIMAL(12,3);
ALTER TABLE "QuotationItem" ALTER COLUMN "discountValue" TYPE DECIMAL(12,3);
ALTER TABLE "QuotationItem" ALTER COLUMN "subtotal" TYPE DECIMAL(12,3);
ALTER TABLE "QuotationItem" ALTER COLUMN "taxAmount" TYPE DECIMAL(12,3);
ALTER TABLE "QuotationItem" ALTER COLUMN "lineTotal" TYPE DECIMAL(12,3);

ALTER TABLE "Sale" ALTER COLUMN "subtotal" TYPE DECIMAL(12,3);
ALTER TABLE "Sale" ALTER COLUMN "taxTotal" TYPE DECIMAL(12,3);
ALTER TABLE "Sale" ALTER COLUMN "total" TYPE DECIMAL(12,3);

ALTER TABLE "SaleItem" ALTER COLUMN "unitPrice" TYPE DECIMAL(12,3);
ALTER TABLE "SaleItem" ALTER COLUMN "taxAmount" TYPE DECIMAL(12,3);
ALTER TABLE "SaleItem" ALTER COLUMN "lineTotal" TYPE DECIMAL(12,3);

-- Company/legal data for the print header, per the user's real invoice.
ALTER TABLE "Store" ADD COLUMN "legalNameEn" TEXT;
ALTER TABLE "Store" ADD COLUMN "legalNameAr" TEXT;
ALTER TABLE "Store" ADD COLUMN "crNumber" TEXT;
ALTER TABLE "Store" ADD COLUMN "poBox" TEXT;
ALTER TABLE "Store" ADD COLUMN "countryEn" TEXT;
ALTER TABLE "Store" ADD COLUMN "countryAr" TEXT;
ALTER TABLE "Store" ADD COLUMN "addressEn" TEXT;
ALTER TABLE "Store" ADD COLUMN "addressAr" TEXT;
ALTER TABLE "Store" ADD COLUMN "vatNumber" TEXT;
ALTER TABLE "Store" ADD COLUMN "mobile" TEXT;
ALTER TABLE "Store" ADD COLUMN "email" TEXT;
ALTER TABLE "Store" ADD COLUMN "logoUrl" TEXT;
