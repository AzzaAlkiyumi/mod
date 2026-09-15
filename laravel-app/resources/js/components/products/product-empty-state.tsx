import { PackageSearch } from "lucide-react";

import type { Dictionary } from "@/i18n/dictionaries/en";

export function ProductEmptyState({ t }: { t: Dictionary }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <PackageSearch className="size-5 text-muted-foreground" />
      </div>
      <p className="font-medium">{t.products.list.empty.title}</p>
      <p className="text-sm text-muted-foreground">{t.products.list.empty.subtitle}</p>
    </div>
  );
}
