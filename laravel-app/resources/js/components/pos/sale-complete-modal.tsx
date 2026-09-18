import { Check, MessageCircle, Printer, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";

export interface CompletedSale {
  id: string;
  number: string;
  total: number;
  changeAmount: number | null;
}

export function SaleCompleteModal({
  sale,
  onClose,
  onNewSale,
}: {
  sale: CompletedSale | null;
  onClose: () => void;
  onNewSale: () => void;
}) {
  const { t, locale } = useDictionary();
  const s = t.pos.saleComplete;

  const receiptUrl = sale ? `/pos-receipt/${sale.id}` : "#";

  function whatsappHref() {
    if (!sale) return "#";
    const text = `${s.title} ${sale.number} — ${formatCurrency(sale.total, locale)}`;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }

  return (
    <Dialog open={!!sale} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm text-center">
        <DialogTitle className="sr-only">{s.title}</DialogTitle>
        {sale && (
          <div className="flex flex-col items-center gap-2 py-2">
            <span className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
              <Check className="size-7 text-emerald-600 dark:text-emerald-400" />
            </span>
            <h2 className="mt-1 text-lg font-semibold">{s.title}</h2>
            <p className="font-mono text-xs text-muted-foreground">{sale.number}</p>
            <p className="mt-2 text-3xl font-bold">{formatCurrency(sale.total, locale)}</p>
            {sale.changeAmount !== null && sale.changeAmount > 0 && (
              <p className="text-sm text-muted-foreground">
                {s.change(formatCurrency(sale.changeAmount, locale))}
              </p>
            )}

            <div className="mt-4 grid w-full grid-cols-3 gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={receiptUrl} target="_blank" rel="noreferrer">
                  <Receipt className="size-4" />
                  {s.viewReceipt}
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(receiptUrl, "_blank")}
              >
                <Printer className="size-4" />
                {s.printReceipt}
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href={whatsappHref()} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" />
                  {s.whatsapp}
                </a>
              </Button>
            </div>

            <Button size="lg" className="mt-2 w-full" onClick={onNewSale}>
              {s.newSale}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
