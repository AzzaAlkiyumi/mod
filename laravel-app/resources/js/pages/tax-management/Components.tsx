import { useEffect, useState } from "react";

import { TaxComponentsPanel } from "@/components/tax-management/tax-components-panel";
import { api } from "@/lib/api";

export default function TaxComponentsPage() {
  const [items, setItems] = useState<Parameters<typeof TaxComponentsPanel>[0]["initial"] | null>(null);

  useEffect(() => {
    api.get("/tax-components").then((res) => setItems(res.data.data));
  }, []);

  if (!items) return null;

  return <TaxComponentsPanel initial={items} />;
}
