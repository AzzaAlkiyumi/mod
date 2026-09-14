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
  Layers,
  ListTree,
  Pill,
  Landmark,
} from "lucide-react";

import type { Dictionary } from "@/i18n/dictionaries/en";

export interface NavChild {
  key: keyof Dictionary["nav"]["items"];
  href: string;
  icon: LucideIcon;
}

/** A plain item has `href`; an item with `children` instead becomes its own
 * click-to-expand/collapse toggle (no href of its own) — a real nested
 * dropdown *inside* a normal, always-static group header, matching the
 * reference site's "Tax Management" section: the group header itself is
 * plain (like "PRODUCTS"), and one item within it ("Tax Management" again,
 * with a chevron) is the actual dropdown that reveals the rest. */
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
    ],
  },
  {
    key: "taxManagement",
    items: [
      {
        key: "taxManagement",
        icon: Landmark,
        children: [
          { key: "taxComponents", href: "/admin/tax-management/components", icon: Percent },
          { key: "taxGroups", href: "/admin/tax-management/groups", icon: Layers },
          { key: "taxClassifications", href: "/admin/tax-management/classifications", icon: ListTree },
          { key: "drugSchedules", href: "/admin/drug-schedules", icon: Pill },
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
