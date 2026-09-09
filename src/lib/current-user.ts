import { prisma } from "@/lib/prisma";

/**
 * Authentication itself is out of scope for this rebuild (the task is
 * scoped to the Quotation page only, and the reference site's login could
 * not be reached — see QUOTATION_AUDIT.md "Unknown Behavior"). This stub
 * returns a single seeded user so `createdBy` / `store` context still work
 * end-to-end, standing in for a real session.
 */
export async function getCurrentUser() {
  const user = await prisma.user.findFirst({ orderBy: { createdAt: "asc" }, include: { store: true } });
  if (!user) {
    throw new Error("No seeded user found. Run `npx prisma db seed`.");
  }
  return user;
}
