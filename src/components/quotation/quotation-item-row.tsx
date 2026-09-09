"use client";

import { Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import type { DiscountType } from "@/lib/calculations";

export interface DraftItem {
  productId: string;
  name: string;
  sku: string;
  unit: string;
  unitPrice: number;
  taxRate: number;
  quantity: number;
  discountType: DiscountType;
  discountValue: number;
}

export function computeLinePreview(item: DraftItem) {
  const gross = item.quantity * item.unitPrice;
  const discount =
    item.discountType === "PERCENT" ? (gross * item.discountValue) / 100 : item.discountValue;
  const taxable = Math.max(gross - Math.min(discount, gross), 0);
  const tax = (taxable * item.taxRate) / 100;
  return { gross, taxable, tax, total: taxable + tax };
}

export function QuotationItemRow({
  item,
  error,
  onChange,
  onRemove,
}: {
  item: DraftItem;
  error?: string;
  onChange: (next: DraftItem) => void;
  onRemove: () => void;
}) {
  const preview = computeLinePreview(item);

  return (
    <TableRow>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{item.name}</span>
          <span className="text-xs text-muted-foreground">
            SKU {item.sku} · {formatCurrency(item.unitPrice)} / {item.unit}
          </span>
          {error && <span className="text-xs text-destructive">{error}</span>}
        </div>
      </TableCell>
      <TableCell className="w-24">
        <Input
          type="number"
          min={0}
          step="any"
          value={item.quantity}
          aria-label={`Quantity for ${item.name}`}
          onChange={(e) => onChange({ ...item, quantity: Number(e.target.value) })}
          className="text-right"
        />
      </TableCell>
      <TableCell className="w-40">
        <div className="flex gap-1">
          <Input
            type="number"
            min={0}
            step="any"
            value={item.discountValue}
            aria-label={`Discount for ${item.name}`}
            onChange={(e) => onChange({ ...item, discountValue: Number(e.target.value) })}
            className="text-right"
          />
          <Select
            value={item.discountType}
            onValueChange={(v) => onChange({ ...item, discountType: v as DiscountType })}
          >
            <SelectTrigger className="w-16 shrink-0" aria-label={`Discount type for ${item.name}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FIXED">$</SelectItem>
              <SelectItem value="PERCENT">%</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TableCell>
      <TableCell className="text-right text-muted-foreground">
        {item.taxRate > 0 ? `${item.taxRate}%` : "—"}
      </TableCell>
      <TableCell className="text-right font-medium">{formatCurrency(preview.total)}</TableCell>
      <TableCell>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Remove ${item.name}`}
          onClick={onRemove}
        >
          <Trash2 className="text-destructive" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
