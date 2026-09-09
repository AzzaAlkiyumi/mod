"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReceiptText } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_GROUPS } from "@/components/layout/nav-config";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="no-print hidden w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <ReceiptText className="size-4.5" />
        </div>
        <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
          HYPER POS
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
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
                      <span className="truncate">{item.label}</span>
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
          <span className="text-xs font-medium text-sidebar-foreground">All systems online</span>
          <span className="text-[11px] text-muted-foreground">v1.1.1</span>
        </div>
      </div>
    </aside>
  );
}
