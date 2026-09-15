import { router } from "@inertiajs/react";
import { LayoutGrid, List } from "lucide-react";

import { cn } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";

export function ProductViewToggle({ view }: { view: "list" | "grid" }) {
  const { t } = useDictionary();

  function setView(next: "list" | "grid") {
    const params = new URLSearchParams(window.location.search);
    if (next === "list") {
      params.delete("view");
    } else {
      params.set("view", next);
    }
    const qs = params.toString();
    router.get(`/admin/products${qs ? `?${qs}` : ""}`, undefined, {
      preserveState: true,
      preserveScroll: true,
      replace: true,
    });
  }

  return (
    <div className="flex items-center gap-0.5 rounded-md border border-border p-0.5">
      <button
        type="button"
        onClick={() => setView("list")}
        aria-label={t.products.list.viewList}
        aria-pressed={view === "list"}
        className={cn(
          "flex size-7 items-center justify-center rounded",
          view === "list"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => setView("grid")}
        aria-label={t.products.list.viewGrid}
        aria-pressed={view === "grid"}
        className={cn(
          "flex size-7 items-center justify-center rounded",
          view === "grid"
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-4" />
      </button>
    </div>
  );
}
