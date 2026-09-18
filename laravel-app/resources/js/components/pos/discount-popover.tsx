import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDictionary } from "@/i18n/dictionary-context";

export function DiscountPopover({
  discountType,
  discountValue,
  onApply,
  children,
}: {
  discountType: "FIXED" | "PERCENT";
  discountValue: number;
  onApply: (type: "FIXED" | "PERCENT", value: number) => void;
  children: React.ReactNode;
}) {
  const { t } = useDictionary();
  const s = t.pos.discount;
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<"FIXED" | "PERCENT">(discountType);
  const [value, setValue] = useState(String(discountValue || ""));

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setType(discountType);
          setValue(discountValue ? String(discountValue) : "");
        }
      }}
    >
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent align="start" className="flex w-64 flex-col gap-3">
        <p className="text-sm font-semibold">{s.title}</p>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {s.type}
          </label>
          <Select value={type} onValueChange={(v) => setType(v as "FIXED" | "PERCENT")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FIXED">{s.fixed}</SelectItem>
              <SelectItem value="PERCENT">{s.percent}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {s.value}
          </label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            step="0.01"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
        <div className="flex gap-2">
          {discountValue > 0 && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                onApply("FIXED", 0);
                setOpen(false);
              }}
            >
              {s.remove}
            </Button>
          )}
          <Button
            type="button"
            className="flex-1"
            onClick={() => {
              onApply(type, Number(value) || 0);
              setOpen(false);
            }}
          >
            {s.apply}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
