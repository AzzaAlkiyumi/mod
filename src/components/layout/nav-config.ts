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
  SquarePen,
  CheckCheck,
  ArrowLeftRight,
  File,
  Database,
  AlertTriangle,
  AlertOctagon,
  RefreshCw,
  ShoppingCart,
  CreditCard,
  Receipt,
  Tag,
  PieChart,
  Star,
  BookOpen,
  List,
  Lock,
  User,
  Shield,
  Store,
  Printer,
  ShieldCheck,
  Globe,
} from "lucide-react";

import type { Dictionary } from "@/i18n/dictionaries/en";

export interface NavChild {
  key: keyof Dictionary["nav"]["items"];
  href: string;
  icon: LucideIcon;
}

/** A plain item has `href` only. An item with `children` gains a nested
 * dropdown: if it has no `href` of its own, the whole row is the
 * expand/collapse toggle (e.g. the "Tax Management" item, or "Accounting
 * Setup"); if it has *both* `href` and `children` (e.g. "Inventory
 * reports"), the label stays a normal working link to its own page and a
 * separate small chevron next to it independently toggles the children —
 * so an already-linked item can gain a dropdown without losing its link. */
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
      {
        key: "salesHistory",
        icon: ClipboardList,
        children: [{ key: "newSale", href: "/admin/sales/new", icon: Plus }],
      },
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
    items: [
      { key: "stockAdjustments", href: "/admin/coming-soon/stockAdjustments", icon: SquarePen },
      {
        key: "stockReconciliation",
        href: "/admin/coming-soon/stockReconciliation",
        icon: CheckCheck,
      },
      { key: "stockTransfers", href: "/admin/coming-soon/stockTransfers", icon: ArrowLeftRight },
      { key: "adjustmentReasons", href: "/admin/coming-soon/adjustmentReasons", icon: File },
      {
        key: "inventoryReports",
        href: "/admin/inventory-reports",
        icon: BarChart3,
        children: [
          {
            key: "availableStock",
            href: "/admin/coming-soon/availableStock",
            icon: Database,
          },
          { key: "lowStock", href: "/admin/coming-soon/lowStock", icon: AlertTriangle },
          {
            key: "oversoldItems",
            href: "/admin/coming-soon/oversoldItems",
            icon: AlertOctagon,
          },
          { key: "batchesExpiry", href: "/admin/coming-soon/batchesExpiry", icon: Clock },
          { key: "stockActivity", href: "/admin/coming-soon/stockActivity", icon: RefreshCw },
        ],
      },
    ],
  },
  {
    key: "purchasingExpenses",
    items: [
      { key: "purchases", href: "/admin/coming-soon/purchases", icon: ShoppingCart },
      { key: "suppliers", href: "/admin/coming-soon/suppliers", icon: Truck },
      { key: "purchaseReturns", href: "/admin/coming-soon/purchaseReturns", icon: RotateCcw },
      {
        key: "supplierPayments",
        href: "/admin/coming-soon/supplierPayments",
        icon: CreditCard,
      },
      { key: "expenses", href: "/admin/coming-soon/expenses", icon: Receipt },
      { key: "expenseCategories", href: "/admin/coming-soon/expenseCategories", icon: Tag },
    ],
  },
  {
    key: "reports",
    items: [
      { key: "allReports", href: "/admin/coming-soon/allReports", icon: PieChart },
      { key: "savedReports", href: "/admin/coming-soon/savedReports", icon: Star },
      { key: "scheduledReports", href: "/admin/coming-soon/scheduledReports", icon: Clock },
      { key: "syncLog", href: "/admin/coming-soon/syncLog", icon: RefreshCw },
    ],
  },
  {
    key: "accounting",
    items: [
      { key: "journal", href: "/admin/coming-soon/journal", icon: BookOpen },
      { key: "chartOfAccounts", href: "/admin/coming-soon/chartOfAccounts", icon: List },
      {
        key: "accountingSetup",
        icon: Settings,
        children: [
          {
            key: "businessMappings",
            href: "/admin/coming-soon/businessMappings",
            icon: ExternalLink,
          },
          { key: "fiscalPeriods", href: "/admin/coming-soon/fiscalPeriods", icon: Lock },
          {
            key: "openingBalances",
            href: "/admin/coming-soon/openingBalances",
            icon: Landmark,
          },
        ],
      },
    ],
  },
  {
    key: "administration",
    items: [
      { key: "users", href: "/admin/coming-soon/users", icon: User },
      { key: "roles", href: "/admin/roles", icon: Shield },
      { key: "stores", href: "/admin/coming-soon/stores", icon: Store },
      { key: "terminals", href: "/admin/coming-soon/terminals", icon: Monitor },
      { key: "salesChannels", href: "/admin/coming-soon/salesChannels", icon: ExternalLink },
      { key: "hardware", href: "/admin/coming-soon/hardware", icon: Printer },
      { key: "systemHealth", href: "/admin/coming-soon/systemHealth", icon: ShieldCheck },
      { key: "languages", href: "/admin/coming-soon/languages", icon: Globe },
      { key: "settings", href: "/admin/coming-soon/settings", icon: Settings },
    ],
  },
];
