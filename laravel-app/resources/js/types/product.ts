export interface ProductRow {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  nameAr: string | null;
  price: number;
  imageUrl: string | null;
  category: { id: string; name: string } | null;
  unit: { id: string; displayName: string };
  brand: { id: string; name: string } | null;
  tax: { id: string; name: string; rate: number } | null;
}
