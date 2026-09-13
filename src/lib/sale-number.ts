import { prisma } from "@/lib/prisma";

/** Sequential "SE-000001" style number, mirroring generateQuotationNumber(). */
export async function generateSaleNumber(): Promise<string> {
  const count = await prisma.sale.count();
  return `SE-${String(count + 1).padStart(6, "0")}`;
}
