"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Download, Monitor, Search } from "lucide-react";

import { NAV_GROUPS } from "@/components/layout/nav-config";
import { MobileNav } from "@/components/layout/mobile-nav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function useBreadcrumb() {
  const pathname = usePathname() ?? "";

  const navItem = NAV_GROUPS.flatMap((g) => g.items).find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  const crumbs: { label: string; href?: string }[] = [{ label: "Back office", href: "/admin" }];
  if (navItem) {
    const isDetailRoute = pathname !== navItem.href;
    crumbs.push({ label: navItem.label, href: isDetailRoute ? navItem.href : undefined });
    if (pathname.endsWith("/new")) {
      crumbs.push({ label: "New quotation" });
    } else if (isDetailRoute) {
      crumbs.push({ label: "Details" });
    }
  }
  return crumbs;
}

export function AppHeader() {
  const crumbs = useBreadcrumb();

  return (
    <header className="no-print flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      <MobileNav />
      <nav aria-label="Breadcrumb" className="hidden shrink-0 items-center gap-1.5 text-sm md:flex">
        {crumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-muted-foreground">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className="text-muted-foreground hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="relative ml-auto max-w-md flex-1 md:ml-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search products, orders, customers..."
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-14 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Select defaultValue="main">
          <SelectTrigger className="hidden h-9 w-40 lg:flex">
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Store
              </span>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Main Store</SelectItem>
            <SelectItem value="downtown">Downtown Branch</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="en">
          <SelectTrigger className="hidden h-9 w-32 xl:flex">
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Language
              </span>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ar">العربية</SelectItem>
          </SelectContent>
        </Select>

        <button
          type="button"
          aria-label="Notifications"
          className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="size-4.5" />
        </button>

        <button
          type="button"
          aria-label="Export"
          className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="size-4.5" />
        </button>
        <button
          type="button"
          aria-label="POS view"
          className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Monitor className="size-4.5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-accent">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              DC
            </span>
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-medium">Demo Cashier</span>
              <span className="text-[11px] text-muted-foreground">Administrator</span>
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Demo Cashier</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
