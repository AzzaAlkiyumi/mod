import Link from "next/link";
import { Plus, RefreshCcw } from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductTable } from "@/components/products/product-table";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductViewToggle } from "@/components/products/product-view-toggle";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const params = await searchParams;
  const categoryId = typeof params.categoryId === "string" ? params.categoryId : undefined;
  const q = typeof params.q === "string" ? params.q.trim() : undefined;
  const view = params.view === "grid" ? "grid" : "list";

  const where: Prisma.ProductWhereInput = {
    AND: [
      categoryId ? { categoryId } : {},
      q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { nameAr: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { barcode: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { tax: true, category: true, unit: true, brand: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    prisma.category.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.products.list.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.products.list.subtitle}</p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
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
              href="/admin/products"
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
