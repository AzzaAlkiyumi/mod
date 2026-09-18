import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";

type WeightProduct = { name: string; price: number; unit: string };

/** Owns the weight input's local state — mounted fresh (via a `key`) each
 * time a different product opens, so the field always starts at "1"
 * without needing an effect to reset it. */
function WeightForm({
  product,
  onConfirm,
}: {
  product: WeightProduct;
  onConfirm: (weight: number) => void;
}) {
  const { t, locale } = useDictionary();
  const s = t.pos.weight;
  const [weight, setWeight] = useState("1");
  const weightNumber = Number(weight) || 0;
  const lineTotal = weightNumber * product.price;

  return (
    <>
      <DialogTitle>{s.dialogTitle(product.name)}</DialogTitle>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {s.label} ({product.unit})
        </label>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step="0.001"
          autoFocus
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && weightNumber > 0) onConfirm(weightNumber);
          }}
          className="h-11 rounded-md border border-input bg-background px-3 text-lg font-medium outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{s.lineTotal}</span>
        <span className="font-semibold">{formatCurrency(lineTotal, locale)}</span>
      </div>
      <Button size="lg" disabled={weightNumber <= 0} onClick={() => onConfirm(weightNumber)}>
        {s.add}
      </Button>
    </>
  );
}

export function WeightEntryModal({
  product,
  onClose,
  onConfirm,
}: {
  product: (WeightProduct & { id: string }) | null;
  onClose: () => void;
  onConfirm: (weight: number) => void;
}) {
  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xs">
        {product && <WeightForm key={product.id} product={product} onConfirm={onConfirm} />}
      </DialogContent>
    </Dialog>
  );
}
