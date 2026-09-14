/**
 * The real print/PDF destination for a quotation (linked from the Print
 * button on `/admin/quotations/[id]` and the list's row actions).
 * Deliberately outside `/admin` so it renders with no sidebar/header
 * chrome (closest to true print output).
 */
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getLocale } from "@/i18n/get-locale";
import { QuotationPrintPreview } from "@/components/quotation/preview/quotation-print-preview";
import { toPreviewQuotation } from "@/components/quotation/preview/to-preview-quotation";

export const dynamic = "force-dynamic";

export default async function QuotationPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      store: true,
      customer: true,
      createdBy: true,
      items: {
        include: { product: { include: { tax: true, unit: true } } },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!quotation) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium">No quotation found for id &quot;{id}&quot;.</p>
        <Link href="/quotation-preview" className="text-sm text-neutral-500 underline">
          Jump to the most recent quotation instead
        </Link>
      </div>
    );
  }

  return <QuotationPrintPreview quotation={toPreviewQuotation(quotation)} initialLang={locale} />;
}
