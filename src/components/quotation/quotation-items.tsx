"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ProductSelector } from "@/components/quotation/product-selector";
import { QuotationItemRow, type DraftItem } from "@/components/quotation/quotation-item-row";
import type { ProductWithTax } from "@/lib/types";

export function QuotationItems({
  items,
  itemErrors,
  formError,
  onAdd,
  onChange,
  onRemove,
}: {
  items: DraftItem[];
  itemErrors?: Record<string, string>;
  formError?: string;
  onAdd: (product: ProductWithTax) => void;
  onChange: (index: number, next: DraftItem) => void;
  onRemove: (index: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Items</CardTitle>
        <CardDescription>Add catalog products and variants. Prices and taxes resolve automatically.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ProductSelector
          onSelect={(product) => onAdd(product)}
          excludeIds={items.map((i) => i.productId)}
        />

        {formError && <p className="text-sm text-destructive">{formError}</p>}

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Add at least one product to prepare the quotation.
          </p>
        ) : (
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="w-24">Qty</TableHead>
                  <TableHead className="w-40">Discount</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Line total</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, idx) => (
                  <QuotationItemRow
                    key={item.productId}
                    item={item}
                    error={itemErrors?.[item.productId]}
                    onChange={(next) => onChange(idx, next)}
                    onRemove={() => onRemove(idx)}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
