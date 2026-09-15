import { useCallback, useState, useTransition } from "react";
import { router } from "@inertiajs/react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDictionary } from "@/i18n/dictionary-context";

export function ProductFilters({
  categories,
  filters,
}: {
  categories: { id: string; name: string }[];
  filters: { q?: string; categoryId?: string };
}) {
  const [isPending, startTransition] = useTransition();
  const { t } = useDictionary();

  const [q, setQ] = useState(filters.q ?? "");
  const categoryId = filters.categoryId ?? "all";

  const applyParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      startTransition(() => {
        router.get(`/admin/products?${params.toString()}`, undefined, {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        });
      });
    },
    [],
  );

  const hasFilters = categoryId !== "all" || q;

  return (
    <div className="grid gap-4 border-b border-border p-4 md:grid-cols-[200px_1fr_auto] md:items-end">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.products.list.columns.category}
        </label>
        <Select
          value={categoryId}
          onValueChange={(v) => applyParam("categoryId", v === "all" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.products.list.allCategories}</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t.products.list.searchPlaceholder}
          className="ps-9"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") applyParam("q", q);
          }}
          onBlur={() => applyParam("q", q)}
        />
      </div>

      <Button
        variant="outline"
        disabled={!hasFilters || isPending}
        onClick={() => {
          setQ("");
          startTransition(() => {
            router.get("/admin/products", undefined, { preserveScroll: true, replace: true });
          });
        }}
      >
        <X /> {t.common.resetFilters}
      </Button>
    </div>
  );
}
