"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReceiptText, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/components/layout/nav-config";
import { useDictionary } from "@/i18n/dictionary-context";

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useDictionary();
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_GROUPS;
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.filter((item) => t.nav.items[item.key].toLowerCase().includes(q)),
    })).filter((group) => group.items.length > 0);
  }, [query, t]);

  return (
    <aside className="no-print hidden w-64 shrink-0 flex-col border-e border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ReceiptText className="size-4.5" />
        </div>
        <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
          HYPER POS
        </span>
      </div>

      <div className="border-b border-sidebar-border px-3 py-2.5">
        <div className="relative">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.nav.searchPlaceholder}
            aria-label={t.nav.searchPlaceholder}
            className="h-8 w-full rounded-md border border-sidebar-border bg-background ps-8 pe-7 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label={t.nav.clearSearch}
              className="absolute end-1.5 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {filteredGroups.length === 0 && (
          <p className="px-2.5 py-2 text-xs text-muted-foreground">{t.nav.noResults}</p>
        )}
        {filteredGroups.map((group) => (
          <div key={group.key} className="mb-4">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t.nav.groups[group.key]}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                        active
                          ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                      )}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span className="truncate">{t.nav.items[item.key]}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-2 border-t border-sidebar-border px-4 py-3">
        <span className="size-2 rounded-full bg-success" />
        <div className="flex flex-col leading-tight">
          <span className="text-xs font-medium text-sidebar-foreground">
            {t.nav.systemsOnline}
          </span>
          <span className="text-[11px] text-muted-foreground">v1.1.1</span>
        </div>
      </div>
    </aside>
  );
}
