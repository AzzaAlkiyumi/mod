import { Link, useLocation } from "react-router-dom";
import { Bell, ChevronDown, Download, Monitor, Search } from "lucide-react";

import { NAV_GROUPS } from "@/lib/nav-config";
import { MobileNav } from "@/components/layout/mobile-nav";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
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
import { useDictionary } from "@/i18n/dictionary-context";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { useAuth } from "@/lib/auth-context";

function useBreadcrumb(t: Dictionary) {
  const pathname = useLocation().pathname ?? "";

  const navItem = NAV_GROUPS.flatMap((g) => g.items).find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  const crumbs: { label: string; href?: string }[] = [
    { label: t.header.backOffice, href: "/admin" },
  ];
  if (navItem) {
    const isDetailRoute = pathname !== navItem.href;
    crumbs.push({
      label: t.nav.items[navItem.key],
      href: isDetailRoute ? navItem.href : undefined,
    });
    if (pathname.endsWith("/new")) {
      crumbs.push({
        label:
          navItem.key === "products"
            ? t.products.form.newTitle
            : navItem.key === "roles"
              ? t.roles.form.newTitle
              : t.form.newTitle,
      });
    } else if (isDetailRoute) {
      crumbs.push({
        label:
          navItem.key === "roles"
            ? t.roles.form.editTitle
            : navItem.key === "settings"
              ? t.settings.currency.title
              : t.detail.details.title,
      });
    }
  }
  return crumbs;
}

export function AppHeader() {
  const { t } = useDictionary();
  const crumbs = useBreadcrumb(t);
  const { user, logout } = useAuth();
  const displayName = user?.name ?? t.header.userName;
  const displayRole = user?.roleName ?? t.header.role;
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="no-print flex h-16 shrink-0 items-center gap-4 border-b border-border bg-background px-4 md:px-6">
      <MobileNav />
      <nav
        aria-label={t.header.breadcrumbLabel}
        className="hidden shrink-0 items-center gap-1.5 text-sm md:flex"
      >
        {crumbs.map((crumb, idx) => (
          <span key={idx} className="flex items-center gap-1.5">
            {idx > 0 && <span className="text-muted-foreground">/</span>}
            {crumb.href ? (
              <Link to={crumb.href} className="text-muted-foreground hover:text-foreground">
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-foreground">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="relative ms-auto max-w-md flex-1 md:ms-4">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder={t.header.searchPlaceholder}
          className="h-9 w-full rounded-md border border-input bg-background ps-9 pe-14 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
        <kbd className="pointer-events-none absolute end-2 top-1/2 hidden -translate-y-1/2 items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:flex">
          ⌘K
        </kbd>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Select defaultValue="main">
          <SelectTrigger className="hidden h-9 w-40 lg:flex">
            <div className="flex flex-col items-start leading-tight">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {t.header.store}
              </span>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="main">Main Store</SelectItem>
            <SelectItem value="downtown">Downtown Branch</SelectItem>
          </SelectContent>
        </Select>

        <LanguageSwitcher />

        <button
          type="button"
          aria-label={t.header.notifications}
          className="relative flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <Bell className="size-4.5" />
        </button>

        <button
          type="button"
          aria-label={t.header.export}
          className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="size-4.5" />
        </button>
        <button
          type="button"
          aria-label={t.header.posView}
          className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Monitor className="size-4.5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-md py-1 ps-1 pe-2 hover:bg-accent">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
              {initials}
            </span>
            <span className="hidden flex-col items-start leading-tight sm:flex">
              <span className="text-sm font-medium">{displayName}</span>
              <span className="text-[11px] text-muted-foreground">{displayRole}</span>
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>{t.header.profile}</DropdownMenuItem>
            <DropdownMenuItem>{t.header.settings}</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onSelect={() => logout()}>
              {t.header.signOut}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
