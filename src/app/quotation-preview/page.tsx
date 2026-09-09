/** Convenience only: jumps to the most recently created quotation's preview
 * so this can be opened without knowing an id. Part of the isolated
 * preview route — see [id]/page.tsx. */
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function QuotationPreviewIndexPage() {
  const latest = await prisma.quotation.findFirst({ orderBy: { createdAt: "desc" } });

  if (!latest) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center text-center text-sm text-neutral-500">
        No quotations exist yet — create one in the app first.
      </div>
    );
  }

  redirect(`/quotation-preview/${latest.id}`);
}
