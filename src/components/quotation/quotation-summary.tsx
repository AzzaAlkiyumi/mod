"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";

export function QuotationSummary({
  subtotal,
  discountTotal,
  taxTotal,
  total,
  pending,
}: {
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  pending?: boolean;
}) {
  const { t } = useDictionary();

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>{t.form.summary.title}</CardTitle>
      </CardHeader>
      <CardContent
        className={`flex flex-col gap-3 text-sm transition-opacity ${pending ? "opacity-60" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t.form.summary.subtotal}</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t.form.summary.discount}</span>
          <span>{formatCurrency(discountTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">{t.form.summary.tax}</span>
          <span>{formatCurrency(taxTotal)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-base font-semibold">
          <span>{t.form.summary.total}</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{t.form.summary.note}</p>
      </CardContent>
    </Card>
  );
}
