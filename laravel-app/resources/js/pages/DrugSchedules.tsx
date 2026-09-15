import { useEffect, useState } from "react";

import { DrugSchedulesPanel } from "@/components/tax-management/drug-schedules-panel";
import { api } from "@/lib/api";

export default function DrugSchedulesPage() {
  const [items, setItems] = useState<Parameters<typeof DrugSchedulesPanel>[0]["initial"] | null>(null);

  useEffect(() => {
    api.get("/drug-schedules").then((res) => setItems(res.data.data));
  }, []);

  if (!items) return null;

  return <DrugSchedulesPanel initial={items} />;
}
