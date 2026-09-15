import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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
import { QUOTATION_STATUSES } from "@/lib/quotation-rules";
import { useDictionary } from "@/i18n/dictionary-context";

export function QuotationFilters() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useDictionary();

  const [q, setQ] = useState(searchParams.get("q") ?? "");

  const status = searchParams.get("status") ?? "all";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function applyParam(key: string, value: string) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      return params;
    });
  }

  const hasFilters = status !== "all" || from || to || q;

  return (
    <div className="grid gap-4 border-b border-border p-4 md:grid-cols-[160px_160px_160px_1fr_auto] md:items-end">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.list.filters.status}
        </label>
        <Select value={status} onValueChange={(v) => applyParam("status", v === "all" ? "" : v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.list.filters.allStatuses}</SelectItem>
            {QUOTATION_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {t.status[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.list.filters.from}
        </label>
        <Input type="date" value={from} onChange={(e) => applyParam("from", e.target.value)} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {t.list.filters.to}
        </label>
        <Input type="date" value={to} onChange={(e) => applyParam("to", e.target.value)} />
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t.list.filters.searchPlaceholder}
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
        disabled={!hasFilters}
        onClick={() => {
          setQ("");
          setSearchParams(new URLSearchParams());
        }}
      >
        <X /> {t.common.resetFilters}
      </Button>
    </div>
  );
}
