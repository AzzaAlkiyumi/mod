import Link from "next/link";
import { Plus, RefreshCcw } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuotationFilters } from "@/components/quotation/quotation-filters";
import { QuotationTable } from "@/components/quotation/quotation-table";
import { quotationStatusSchema } from "@/lib/validations/quotation";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function QuotationsPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : undefined;
  const from = typeof params.from === "string" ? params.from : undefined;
  const to = typeof params.to === "string" ? params.to : undefined;
  const q = typeof params.q === "string" ? params.q.trim() : undefined;

  const where: Prisma.QuotationWhereInput = {};
  const statusParsed = status ? quotationStatusSchema.safeParse(status) : null;
  if (statusParsed?.success) where.status = statusParsed.data;
  if (from || to) {
    where.issueDate = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(`${to}T23:59:59.999Z`) } : {}),
    };
  }
  if (q) {
    where.OR = [
      { number: { contains: q, mode: "insensitive" } },
      { prospectName: { contains: q, mode: "insensitive" } },
      { customer: { name: { contains: q, mode: "insensitive" } } },
      { items: { some: { product: { name: { contains: q, mode: "insensitive" } } } } },
      { items: { some: { product: { sku: { contains: q, mode: "insensitive" } } } } },
    ];
  }

  const quotations = await prisma.quotation.findMany({
    where,
    include: { store: true, customer: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.list.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.list.subtitle}</p>
        </div>
        <Button asChild>
          <Link href="/admin/quotations/new">
            <Plus /> {t.list.newQuotation}
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-sm font-semibold">{t.list.countLabel(quotations.length)}</h2>
          <Link
            href="/admin/quotations"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            aria-label={t.list.refresh}
          >
            <RefreshCcw className="size-4" />
          </Link>
        </div>
        <QuotationFilters />
        <QuotationTable quotations={quotations} t={t} locale={locale} />
      </Card>
    </div>
  );
}
