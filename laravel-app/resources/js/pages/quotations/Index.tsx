import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuotationFilters } from "@/components/quotation/quotation-filters";
import { QuotationTable } from "@/components/quotation/quotation-table";
import { useDictionary } from "@/i18n/dictionary-context";
import { api } from "@/lib/api";
import type { QuotationListItem } from "@/types/quotation";

export default function QuotationsIndexPage() {
  const { t, locale } = useDictionary();
  const [searchParams] = useSearchParams();
  const [quotations, setQuotations] = useState<QuotationListItem[]>([]);

  const status = searchParams.get("status") ?? undefined;
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;
  const q = searchParams.get("q") ?? undefined;

  useEffect(() => {
    let cancelled = false;
    api
      .get("/quotations", { params: { status, from, to, q, pageSize: 50 } })
      .then((res) => {
        if (!cancelled) setQuotations(res.data.data ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [status, from, to, q]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.list.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.list.subtitle}</p>
        </div>
        <Button asChild>
          <Link to="/admin/quotations/new">
            <Plus /> {t.list.newQuotation}
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-sm font-semibold">{t.list.countLabel(quotations.length)}</h2>
          <Link
            to="/admin/quotations"
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
