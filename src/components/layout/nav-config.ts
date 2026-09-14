import type { LucideIcon } from "lucide-react";
import {
  LayoutGrid,
  Monitor,
  Clock,
  Scale,
  ClipboardList,
  Plus,
  FileText,
  Tablet,
  ExternalLink,
  Wallet,
  RotateCcw,
  Users,
  LayoutList,
  Package,
  Tags,
  Settings,
  BarChart3,
  Truck,
  Percent,
} from "lucide-react";

import type { Dictionary } from "@/i18n/dictionaries/en";

export interface NavChild {
  key: keyof Dictionary["nav"]["items"];
  href: string;
}

/** A plain link has `href`; a group with `children` instead expands/collapses
 * in place (no href of its own) — used for Tax Management, matching the
 * reference site's real dropdown, unlike Product Setup which we deliberately
 * built as single-page tabs instead. */
export interface NavItem {
  key: keyof Dictionary["nav"]["items"];
  href?: string;
  icon: LucideIcon;
  children?: NavChild[];
}

export interface NavGroup {
  key: keyof Dictionary["nav"]["groups"];
  items: NavItem[];
}

/** Mirrors the sidebar observed in the reference recording (hyper-pos.eshopweb.store/admin).
 * Every item here was actually seen in a frame — see QUOTATION_AUDIT.md. Labels are
 * translation keys resolved against src/i18n/dictionaries at render time. */
export const NAV_GROUPS: NavGroup[] = [
  {
    key: "operations",
    items: [
      { key: "dashboard", href: "/admin/dashboard", icon: LayoutGrid },
      { key: "pos", href: "/admin/pos", icon: Monitor },
      { key: "shiftHistory", href: "/admin/shift-history", icon: Clock },
      { key: "cashMismatchReasons", href: "/admin/cash-mismatch-reasons", icon: Scale },
    ],
  },
  {
    key: "sales",
    items: [
      { key: "salesHistory", href: "/admin/sales-history", icon: ClipboardList },
      { key: "newSale", href: "/admin/sales/new", icon: Plus },
      { key: "quotations", href: "/admin/quotations", icon: FileText },
      { key: "kioskOrders", href: "/admin/kiosk-orders", icon: Tablet },
      { key: "channelOrders", href: "/admin/channel-orders", icon: ExternalLink },
      { key: "customerPayments", href: "/admin/customer-payments", icon: Wallet },
      { key: "returnReasons", href: "/admin/return-reasons", icon: RotateCcw },
    ],
  },
  {
    key: "customers",
    items: [
      { key: "customers", href: "/admin/customers", icon: Users },
      { key: "customerGroups", href: "/admin/customer-groups", icon: LayoutList },
    ],
  },
  {
    key: "products",
    items: [
      { key: "products", href: "/admin/products", icon: Package },
      { key: "printLabels", href: "/admin/print-labels", icon: Tags },
      { key: "productSetup", href: "/admin/product-setup", icon: Settings },
      {
        key: "taxManagement",
        icon: Percent,
        children: [
          { key: "taxComponents", href: "/admin/tax-management/components" },
          { key: "taxGroups", href: "/admin/tax-management/groups" },
          { key: "taxClassifications", href: "/admin/tax-management/classifications" },
          { key: "drugSchedules", href: "/admin/drug-schedules" },
        ],
      },
    ],
  },
  {
    key: "inventory",
    items: [{ key: "inventoryReports", href: "/admin/inventory-reports", icon: BarChart3 }],
  },
  {
    key: "supply",
    items: [{ key: "suppliers", href: "/admin/suppliers", icon: Truck }],
  },
];
