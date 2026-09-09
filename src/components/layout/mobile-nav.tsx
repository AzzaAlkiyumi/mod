"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/components/layout/nav-config";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useDictionary } from "@/i18n/dictionary-context";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useDictionary();

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
      <DialogContent className="left-0 top-0 h-dvh max-w-72 translate-x-0 translate-y-0 rounded-none border-e border-s-0 border-t-0 border-b-0 p-0 rtl:left-auto rtl:right-0 sm:max-w-72">
        <DialogTitle className="sr-only">{t.header.backOffice}</DialogTitle>
        <nav className="flex h-full flex-col overflow-y-auto px-2 py-4">
          {NAV_GROUPS.map((group) => (
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
