import { useEffect, useState } from "react";

import { TaxClassificationsPanel } from "@/components/tax-management/tax-classifications-panel";
import { api } from "@/lib/api";

export default function TaxClassificationsPage() {
  const [items, setItems] = useState<Parameters<typeof TaxClassificationsPanel>[0]["initial"] | null>(null);

  useEffect(() => {
    api.get("/tax-classifications").then((res) => setItems(res.data.data));
  }, []);

  if (!items) return null;

  return <TaxClassificationsPanel initial={items} />;
}
