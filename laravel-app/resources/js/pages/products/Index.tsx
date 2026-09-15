import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductTable } from "@/components/products/product-table";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductViewToggle } from "@/components/products/product-view-toggle";
import { useDictionary } from "@/i18n/dictionary-context";
import { api } from "@/lib/api";
import type { ProductRow } from "@/types/product";

interface CatalogResponse {
  products: ProductRow[];
  categories: { id: string; name: string }[];
}

export default function ProductsIndexPage() {
  const { t, locale } = useDictionary();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState<CatalogResponse | null>(null);

  const q = searchParams.get("q") ?? "";
  const categoryId = searchParams.get("categoryId") ?? "";
  const view = searchParams.get("view") === "grid" ? "grid" : "list";

  useEffect(() => {
    let cancelled = false;
    api
      .get<{ data: CatalogResponse }>("/products/catalog", { params: { q, categoryId } })
      .then((res) => {
        if (!cancelled) setData(res.data.data);
      });
    return () => {
      cancelled = true;
    };
  }, [q, categoryId]);

  const products = data?.products ?? [];
  const categories = data?.categories ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.products.list.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.products.list.subtitle}</p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus /> {t.products.list.newProduct}
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between px-4 pt-4">
          <h2 className="text-sm font-semibold">{t.products.list.countLabel(products.length)}</h2>
          <div className="flex items-center gap-2">
            <ProductViewToggle />
            <Link
              to="/admin/products"
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label={t.products.list.refresh}
            >
              <RefreshCcw className="size-4" />
            </Link>
          </div>
        </div>
        <ProductFilters categories={categories} />
        {view === "grid" ? (
          <ProductGrid products={products} t={t} locale={locale} />
        ) : (
          <ProductTable products={products} t={t} locale={locale} />
        )}
      </Card>
    </div>
  );
}
