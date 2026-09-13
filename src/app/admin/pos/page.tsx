import { prisma } from "@/lib/prisma";
import { POSView, type POSProduct } from "@/components/pos/pos-view";

export const dynamic = "force-dynamic";

export default async function POSPage() {
  const [products, stores] = await Promise.all([
    prisma.product.findMany({
      include: { tax: true },
      orderBy: { name: "asc" },
    }),
    prisma.store.findMany({ orderBy: [{ isDefault: "desc" }, { name: "asc" }] }),
  ]);

  const posProducts: POSProduct[] = products.map((p) => ({
    id: p.id,
    sku: p.sku,
    barcode: p.barcode,
    name: p.name,
    unit: p.unit,
    price: Number(p.price),
    imageUrl: p.imageUrl,
    category: p.category,
    taxRate: p.tax ? Number(p.tax.rate) : 0,
  }));

  return (
    <POSView
      products={posProducts}
      stores={stores.map((s) => ({ id: s.id, name: s.name }))}
      defaultStoreId={stores.find((s) => s.isDefault)?.id ?? stores[0]?.id ?? ""}
    />
  );
}
