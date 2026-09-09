-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "discountType" "DiscountType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN     "discountValue" DECIMAL(12,2) NOT NULL DEFAULT 0;
