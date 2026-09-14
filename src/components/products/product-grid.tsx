import Link from "next/link";
import { Pencil } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ProductThumb } from "@/components/quotation/product-thumb";
import { ProductEmptyState } from "@/components/products/product-empty-state";
import { formatCurrency } from "@/lib/utils";
import type { ProductWithTax } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";

export function ProductGrid({
  products,
  t,
  locale,
}: {
  products: ProductWithTax[];
  t: Dictionary;
  locale: Locale;
}) {
  if (products.length === 0) {
    return <ProductEmptyState t={t} />;
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden py-0">
          <CardContent className="flex flex-col gap-2.5 p-3">
            <div className="flex items-start justify-between gap-2">
              <ProductThumb src={product.imageUrl} alt={product.name} size={56} />
              <Link
                href={`/admin/products/${product.id}/edit`}
                aria-label={t.products.list.editAria(product.name)}
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Pencil className="size-3.5" />
              </Link>
            </div>
            <div className="flex flex-col">
              <span className="truncate text-sm font-medium">{product.name}</span>
              {product.nameAr && (
                <span dir="rtl" className="truncate text-xs text-muted-foreground">
                  {product.nameAr}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
              <span className="truncate">{product.sku}</span>
              <span className="truncate">{product.category?.name ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground">
                {product.tax ? product.tax.name : t.products.list.noTax}
              </span>
              <span className="text-sm font-semibold">
                {formatCurrency(product.price, locale)}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
