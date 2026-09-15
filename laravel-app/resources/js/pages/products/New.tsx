import { useEffect, useState } from "react";

import { ProductForm } from "@/components/products/product-form";
import { api } from "@/lib/api";

interface FormOptions {
  categories: { id: string; name: string }[];
  units: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  taxes: { id: string; name: string; rate: number }[];
  drugSchedules: { id: string; name: string }[];
}

export default function NewProductPage() {
  const [options, setOptions] = useState<FormOptions | null>(null);

  useEffect(() => {
    api.get<{ data: FormOptions }>("/products/form-options").then((res) => setOptions(res.data.data));
  }, []);

  if (!options) return null;

  return (
    <ProductForm
      categories={options.categories}
      units={options.units}
      brands={options.brands}
      taxes={options.taxes}
      drugSchedules={options.drugSchedules}
    />
  );
}
