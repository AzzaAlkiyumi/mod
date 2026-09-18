import { useEffect, useState } from "react";

import { POSView, type POSProduct } from "@/components/pos/pos-view";
import { api } from "@/lib/api";

interface StoreOption {
  id: string;
  name: string;
  isDefault: boolean;
}

export default function POSPage() {
  const [data, setData] = useState<{
    products: POSProduct[];
    stores: { id: string; name: string }[];
    defaultStoreId: string;
  } | null>(null);

  useEffect(() => {
    Promise.all([api.get("/products", { params: { take: "all" } }), api.get("/stores")]).then(
      ([productsRes, storesRes]) => {
        const products = (productsRes.data.data as {
          id: string;
          sku: string;
          barcode: string | null;
          name: string;
          unit: { displayName: string };
          price: number;
          imageUrl: string | null;
          category: { name: string } | null;
          tax: { rate: number } | null;
          featured: boolean;
          soldByWeight: boolean;
          availableForSale: boolean;
        }[]).map((p) => ({
          id: p.id,
          sku: p.sku,
          barcode: p.barcode,
          name: p.name,
          unit: p.unit.displayName,
          price: Number(p.price),
          imageUrl: p.imageUrl,
          category: p.category?.name ?? null,
          taxRate: p.tax ? Number(p.tax.rate) : 0,
          featured: p.featured,
          soldByWeight: p.soldByWeight,
          availableForSale: p.availableForSale,
        }));
        const stores = storesRes.data.data as StoreOption[];
        setData({
          products,
          stores: stores.map((s) => ({ id: s.id, name: s.name })),
          defaultStoreId: stores.find((s) => s.isDefault)?.id ?? stores[0]?.id ?? "",
        });
      },
    );
  }, []);

  if (!data) return null;

  return (
    <POSView products={data.products} stores={data.stores} defaultStoreId={data.defaultStoreId} />
  );
}
