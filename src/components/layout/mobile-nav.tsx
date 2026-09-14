"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_GROUPS, type NavItem } from "@/components/layout/nav-config";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDictionary } from "@/i18n/dictionary-context";

function itemMatchesChild(item: NavItem, pathname: string | null) {
  return Boolean(
    item.children?.some((c) => pathname === c.href || pathname?.startsWith(`${c.href}/`)),
  );
}

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useDictionary();
  const [query, setQuery] = useState("");
  // A group defaults open when the current page is one of its children;
  // `overrides` records an explicit click that flips away from that
  // default, so collapsing works even while a child route stays active
  // (and re-clicking re-opens it again).
  const [overrides, setOverrides] = useState<Map<string, boolean>>(new Map());

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

  function toggle(key: string, defaultOpen: boolean) {
    setOverrides((prev) => {
      const next = new Map(prev);
      const current = next.has(key) ? next.get(key)! : defaultOpen;
      next.set(key, !current);
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        type="button"
        aria-label={t.nav.openNav}
        onClick={() => setOpen(true)}
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent md:hidden"
      >
        <Menu className="size-5" />
      </button>
      <DialogContent className="left-0 top-0 flex h-dvh max-w-72 translate-x-0 translate-y-0 flex-col rounded-none border-e border-s-0 border-t-0 border-b-0 p-0 rtl:left-auto rtl:right-0 sm:max-w-72">
        <DialogTitle className="sr-only">{t.header.backOffice}</DialogTitle>
        <div className="shrink-0 border-b border-border px-3 py-2.5">
          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.nav.searchPlaceholder}
              aria-label={t.nav.searchPlaceholder}
              className="h-8 w-full rounded-md border border-border bg-background ps-8 pe-7 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
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
        <nav className="flex flex-1 flex-col overflow-y-auto px-2 py-4">
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
                    const childActive = itemMatchesChild(item, pathname);
                    const defaultOpen = childActive;
                    const isOpen =
                      Boolean(query.trim()) ||
                      (overrides.has(item.key) ? overrides.get(item.key)! : defaultOpen);
                    return (
                      <li key={item.key}>
                        <button
                          type="button"
                          onClick={() => toggle(item.key, defaultOpen)}
                          aria-expanded={isOpen}
                          className={cn(
                            "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm",
                            childActive
                              ? "font-medium text-accent-foreground"
                              : "text-foreground hover:bg-accent/60",
                          )}
                        >
                          <Icon className="size-4 shrink-0" />
                          <span className="flex-1 truncate text-start">{t.nav.items[item.key]}</span>
                          <ChevronDown
                            className={cn(
                              "size-3.5 shrink-0 transition-transform",
                              isOpen && "rotate-180",
                            )}
                          />
                        </button>
                        {isOpen && (
                          <ul className="mt-0.5 flex flex-col gap-0.5 border-s border-border ps-3.5">
                            {item.children.map((child) => {
                              const active =
                                pathname === child.href || pathname?.startsWith(`${child.href}/`);
                              return (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                      "flex items-center rounded-md px-2.5 py-1.5 text-sm",
                                      active
                                        ? "bg-accent font-medium text-accent-foreground"
                                        : "text-foreground hover:bg-accent/60",
                                    )}
                                  >
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
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm",
                          active
                            ? "bg-accent font-medium text-accent-foreground"
                            : "text-foreground hover:bg-accent/60",
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
      </DialogContent>
    </Dialog>
  );
}
