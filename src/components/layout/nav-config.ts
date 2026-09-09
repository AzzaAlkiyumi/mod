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
  BarChart3,
  Truck,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

/** Mirrors the sidebar observed in the reference recording (hyper-pos.eshopweb.store/admin).
 * Every item here was actually seen in a frame — see QUOTATION_AUDIT.md. */
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operations",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: LayoutGrid },
      { label: "POS", href: "/admin/pos", icon: Monitor },
      { label: "Shift History", href: "/admin/shift-history", icon: Clock },
      { label: "Cash Mismatch Reasons", href: "/admin/cash-mismatch-reasons", icon: Scale },
    ],
  },
  {
    label: "Sales",
    items: [
      { label: "Sales History", href: "/admin/sales-history", icon: ClipboardList },
      { label: "New sale", href: "/admin/sales/new", icon: Plus },
      { label: "Quotations", href: "/admin/quotations", icon: FileText },
      { label: "Kiosk orders", href: "/admin/kiosk-orders", icon: Tablet },
      { label: "Channel orders", href: "/admin/channel-orders", icon: ExternalLink },
      { label: "Customer payments", href: "/admin/customer-payments", icon: Wallet },
      { label: "Return reasons", href: "/admin/return-reasons", icon: RotateCcw },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Customers", href: "/admin/customers", icon: Users },
      { label: "Customer groups", href: "/admin/customer-groups", icon: LayoutList },
    ],
  },
  {
    label: "Products",
    items: [
      { label: "Products", href: "/admin/products", icon: Package },
      { label: "Print labels", href: "/admin/print-labels", icon: Tags },
    ],
  },
  {
    label: "Inventory",
    items: [{ label: "Inventory reports", href: "/admin/inventory-reports", icon: BarChart3 }],
  },
  {
    label: "Supply",
    items: [{ label: "Suppliers", href: "/admin/suppliers", icon: Truck }],
  },
];
