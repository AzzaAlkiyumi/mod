import { Link } from "@inertiajs/react";
import { Pencil } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductThumb } from "@/components/products/product-thumb";
import { ProductEmptyState } from "@/components/products/product-empty-state";
import { formatCurrency } from "@/lib/utils";
import type { Dictionary } from "@/i18n/dictionaries/en";
import type { Locale } from "@/i18n/config";
import type { ProductRow } from "@/types/product";

export function ProductTable({
  products,
  t,
  locale,
}: {
  products: ProductRow[];
  t: Dictionary;
  locale: Locale;
}) {
  if (products.length === 0) {
    return <ProductEmptyState t={t} />;
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
          <TableHead className="text-end">{t.products.list.columns.actions}</TableHead>
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
            <TableCell className="text-end">
              <Link
                href={`/admin/products/${product.id}/edit`}
                aria-label={t.products.list.editAria(product.name)}
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                <Pencil className="size-4" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
