import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

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
  return (
    <Card className="sticky top-6">
      <CardHeader>
        <CardTitle>Quotation summary</CardTitle>
      </CardHeader>
      <CardContent
        className={`flex flex-col gap-3 text-sm transition-opacity ${pending ? "opacity-60" : ""}`}
      >
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Discount</span>
          <span>{formatCurrency(discountTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span>{formatCurrency(taxTotal)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between text-base font-semibold">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Totals are calculated by the server using the selected store, customer discount, and
          current tax rules.
        </p>
      </CardContent>
    </Card>
  );
}
