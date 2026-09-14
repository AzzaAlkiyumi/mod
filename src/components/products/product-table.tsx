import { PackageSearch } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductThumb } from "@/components/quotation/product-thumb";
import { formatCurrency } from "@/lib/utils";
import type { ProductWithTax } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";

export function ProductTable({
  products,
  t,
  locale,
}: {
  products: ProductWithTax[];
  t: Dictionary;
  locale: Locale;
}) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <PackageSearch className="size-5 text-muted-foreground" />
        </div>
        <p className="font-medium">{t.products.list.empty.title}</p>
        <p className="text-sm text-muted-foreground">{t.products.list.empty.subtitle}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.products.list.columns.product}</TableHead>
          <TableHead>{t.products.list.columns.sku}</TableHead>
          <TableHead>{t.products.list.columns.category}</TableHead>
          <TableHead>{t.products.list.columns.unit}</TableHead>
          <TableHead>{t.products.list.columns.tax}</TableHead>
          <TableHead className="text-end">{t.products.list.columns.price}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <ProductThumb src={product.imageUrl} alt={product.name} size={36} />
                <div className="flex flex-col">
                  <span className="font-medium">{product.name}</span>
                  {product.nameAr && (
                    <span dir="rtl" className="text-xs text-muted-foreground">
                      {product.nameAr}
                    </span>
                  )}
                </div>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">{product.sku}</TableCell>
            <TableCell className="text-muted-foreground">{product.category?.name ?? "—"}</TableCell>
            <TableCell className="text-muted-foreground">{product.unit.displayName}</TableCell>
            <TableCell className="text-muted-foreground">
              {product.tax ? product.tax.name : t.products.list.noTax}
            </TableCell>
            <TableCell className="text-end font-medium">
              {formatCurrency(product.price, locale)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
