import { useEffect, useState } from "react";

import { TaxGroupsPanel } from "@/components/tax-management/tax-groups-panel";
import { api } from "@/lib/api";

export default function TaxGroupsPage() {
  const [data, setData] = useState<{
    groups: Parameters<typeof TaxGroupsPanel>[0]["initial"];
    classifications: Parameters<typeof TaxGroupsPanel>[0]["classifications"];
    components: Parameters<typeof TaxGroupsPanel>[0]["components"];
  } | null>(null);

  useEffect(() => {
    Promise.all([
      api.get("/tax-groups"),
      api.get("/tax-classifications"),
      api.get("/tax-components"),
    ]).then(([groups, classifications, components]) => {
      setData({
        groups: groups.data.data,
        classifications: (classifications.data.data as { id: string; name: string; active: boolean }[])
          .filter((c) => c.active)
          .map((c) => ({ id: c.id, name: c.name })),
        components: (components.data.data as { id: string; name: string; code: string; rate: number; active: boolean }[])
          .filter((c) => c.active)
          .map((c) => ({ id: c.id, name: c.name, code: c.code, rate: c.rate })),
      });
    });
  }, []);

  if (!data) return null;

  return (
    <TaxGroupsPanel
      initial={data.groups}
      classifications={data.classifications}
      components={data.components}
    />
  );
}
