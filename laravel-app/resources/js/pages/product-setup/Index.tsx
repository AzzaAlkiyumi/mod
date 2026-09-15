import { useEffect, useState } from "react";

import { ProductSetupTabs } from "@/components/product-setup/product-setup-tabs";
import { api } from "@/lib/api";

interface SetupData {
  categories: Parameters<typeof ProductSetupTabs>[0]["categories"];
  brands: Parameters<typeof ProductSetupTabs>[0]["brands"];
  units: Parameters<typeof ProductSetupTabs>[0]["units"];
  unitCategories: Parameters<typeof ProductSetupTabs>[0]["unitCategories"];
}

export default function ProductSetupPage() {
  const [data, setData] = useState<SetupData | null>(null);
  const [taxes, setTaxes] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    Promise.all([
      api.get("/categories"),
      api.get("/brands"),
      api.get("/units"),
      api.get("/unit-categories"),
      api.get("/products/form-options"),
    ]).then(([categories, brands, units, unitCategories, formOptions]) => {
      setData({
        categories: categories.data.data,
        brands: brands.data.data,
        units: units.data.data,
        unitCategories: unitCategories.data.data,
      });
      setTaxes(formOptions.data.data.taxes);
    });
  }, []);

  if (!data) return null;

  return (
    <ProductSetupTabs
      categories={data.categories}
      brands={data.brands}
      units={data.units}
      unitCategories={data.unitCategories}
      taxes={taxes}
    />
  );
}
