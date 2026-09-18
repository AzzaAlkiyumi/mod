import { PauseCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";

export interface HeldSaleSummary {
  id: string;
  reference: string | null;
  createdAt: string;
  itemCount: number;
  total: number;
  customer: { name: string } | null;
}

export function HeldSalesPopover({
  heldSales,
  onResume,
  onDelete,
}: {
  heldSales: HeldSaleSummary[];
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { t, locale } = useDictionary();
  const s = t.pos.hold;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="relative">
          <PauseCircle className="size-4" />
          {heldSales.length > 0 && (
            <span className="absolute -top-1.5 -end-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
              {heldSales.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-2">
        <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {s.listTitle}
        </p>
        {heldSales.length === 0 ? (
          <p className="px-2 py-3 text-sm text-muted-foreground">{s.listEmpty}</p>
        ) : (
          <div className="flex max-h-72 flex-col gap-1 overflow-y-auto">
            {heldSales.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-accent"
              >
                <div className="flex flex-1 flex-col overflow-hidden">
                  <span className="truncate text-sm font-medium">
                    {h.reference || h.customer?.name || formatDate(h.createdAt)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {h.itemCount} · {formatCurrency(h.total, locale)}
                  </span>
                </div>
                <Button type="button" size="sm" variant="outline" onClick={() => onResume(h.id)}>
                  {s.resume}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  aria-label={s.delete}
                  onClick={() => onDelete(h.id)}
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
