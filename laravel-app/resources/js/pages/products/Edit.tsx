import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { ProductForm, type EditableProduct } from "@/components/products/product-form";
import { api } from "@/lib/api";

interface FormOptions {
  categories: { id: string; name: string }[];
  units: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  taxes: { id: string; name: string; rate: number }[];
  drugSchedules: { id: string; name: string }[];
  product: EditableProduct;
}

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [options, setOptions] = useState<FormOptions | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<{ data: FormOptions }>(`/products/${id}/form-options`).then((res) => setOptions(res.data.data));
  }, [id]);

  if (!options) return null;

  return (
    <ProductForm
      categories={options.categories}
      units={options.units}
      brands={options.brands}
      taxes={options.taxes}
      drugSchedules={options.drugSchedules}
      product={options.product}
    />
  );
}
