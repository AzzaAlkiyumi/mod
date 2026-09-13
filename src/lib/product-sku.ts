import { prisma } from "@/lib/prisma";

/** Sequential "PRD-000001" style SKU, used only when the admin leaves the
 * SKU field blank — mirrors generateQuotationNumber()/generateSaleNumber(). */
export async function generateProductSku(): Promise<string> {
  const count = await prisma.product.count();
  return `PRD-${String(count + 1).padStart(6, "0")}`;
}
