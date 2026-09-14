"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ReceiptText, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_GROUPS, type NavItem } from "@/components/layout/nav-config";
import { useDictionary } from "@/i18n/dictionary-context";

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useDictionary();
  const [query, setQuery] = useState("");
  // A dropdown item always starts collapsed, even while on one of its own
  // pages — it only opens once the user explicitly clicks it.
  const [opened, setOpened] = useState<Set<string>>(new Set());

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_GROUPS;
    return NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items
        .map((item) => {
          const parentMatches = t.nav.items[item.key].toLowerCase().includes(q);
          if (!item.children) return parentMatches ? item : null;
          const matchingChildren = parentMatches
            ? item.children
            : item.children.filter((c) => t.nav.items[c.key].toLowerCase().includes(q));
          if (matchingChildren.length === 0) return null;
          return { ...item, children: matchingChildren };
        })
        .filter((item): item is NavItem => item !== null),
    })).filter((group) => group.items.length > 0);
  }, [query, t]);

  function toggle(key: string) {
    setOpened((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

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
                const Icon = item.icon;

                if (item.children) {
                  const isOpen = Boolean(query.trim()) || opened.has(item.key);
                  const active =
                    Boolean(item.href) &&
                    (pathname === item.href || pathname?.startsWith(`${item.href}/`));
                  return (
                    <li key={item.key}>
                      <div className="flex items-center gap-0.5">
                        {item.href ? (
                          <Link
                            href={item.href}
                            className={cn(
                              "flex flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors",
                              active
                                ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                                : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                            )}
                          >
                            <Icon className="size-4 shrink-0" />
                            <span className="truncate">{t.nav.items[item.key]}</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggle(item.key)}
                            aria-expanded={isOpen}
                            className="flex flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            <Icon className="size-4 shrink-0" />
                            <span className="flex-1 truncate text-start">
                              {t.nav.items[item.key]}
                            </span>
                            <ChevronDown
                              className={cn(
                                "size-3.5 shrink-0 transition-transform",
                                isOpen && "rotate-180",
                              )}
                            />
                          </button>
                        )}
                        {item.href && (
                          <button
                            type="button"
                            onClick={() => toggle(item.key)}
                            aria-expanded={isOpen}
                            aria-label={t.nav.items[item.key]}
                            className="flex shrink-0 items-center justify-center rounded-md p-2 text-sidebar-foreground outline-none transition-colors hover:bg-sidebar-accent/60 focus-visible:ring-2 focus-visible:ring-ring/50"
                          >
                            <ChevronDown
                              className={cn(
                                "size-3.5 shrink-0 transition-transform",
                                isOpen && "rotate-180",
                              )}
                            />
                          </button>
                        )}
                      </div>
                      {isOpen && (
                        <ul className="mt-0.5 flex flex-col gap-0.5 border-s border-sidebar-border ps-3.5">
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const active =
                              pathname === child.href || pathname?.startsWith(`${child.href}/`);
                            return (
                              <li key={child.href}>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                                    active
                                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                                      : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                                  )}
                                >
                                  <ChildIcon className="size-4 shrink-0" />
                                  <span className="truncate">{t.nav.items[child.key]}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href!}
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
