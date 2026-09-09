import { prisma } from "@/lib/prisma";

/** Sequential "QT-000001" style number, mirroring the "S-000017" supplier
 * code format observed in the reference UI. */
export async function generateQuotationNumber(): Promise<string> {
  const count = await prisma.quotation.count();
  return `QT-${String(count + 1).padStart(6, "0")}`;
}
