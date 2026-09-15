import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  Store,
  Image as ImageIcon,
  Globe,
  Banknote,
  Receipt,
  Monitor,
  Lock,
  Code2,
  Scale,
  Package,
  Users,
  Tag,
  Hash,
  Mail,
  MessageCircle,
  Wallet,
  CreditCard,
  Database,
  Clock,
  RefreshCw,
  Key,
  FileText,
  ChevronRight,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { useDictionary } from "@/i18n/dictionary-context";
import type { Dictionary } from "@/i18n/dictionaries/en";

interface SettingsCard {
  key: keyof Dictionary["settings"]["index"]["cards"];
  icon: LucideIcon;
  href: string;
}

/** Only Currency & formatting is backed by real data (Setting model) —
 * every other card routes to the shared Coming Soon placeholder, same
 * convention used throughout Administration for sections not yet built. */
const SETTINGS_CARDS: SettingsCard[] = [
  { key: "companyProfile", icon: Store, href: "/admin/coming-soon/settings-companyProfile" },
  { key: "brandingTheme", icon: ImageIcon, href: "/admin/coming-soon/settings-brandingTheme" },
  { key: "regional", icon: Globe, href: "/admin/coming-soon/settings-regional" },
  { key: "currencyFormatting", icon: Banknote, href: "/admin/settings/currency" },
  { key: "receiptTemplate", icon: Receipt, href: "/admin/coming-soon/settings-receiptTemplate" },
  { key: "cashierPos", icon: Monitor, href: "/admin/coming-soon/settings-cashierPos" },
  { key: "security", icon: Lock, href: "/admin/coming-soon/settings-security" },
  { key: "headerFooterScripts", icon: Code2, href: "/admin/coming-soon/settings-headerFooterScripts" },
  { key: "weighingScale", icon: Scale, href: "/admin/coming-soon/settings-weighingScale" },
  { key: "stockLocations", icon: Package, href: "/admin/coming-soon/settings-stockLocations" },
  { key: "loyaltyPoints", icon: Users, href: "/admin/coming-soon/settings-loyaltyPoints" },
  { key: "pricing", icon: Tag, href: "/admin/coming-soon/settings-pricing" },
  { key: "numbering", icon: Hash, href: "/admin/coming-soon/settings-numbering" },
  { key: "emailSmtp", icon: Mail, href: "/admin/coming-soon/settings-emailSmtp" },
  { key: "whatsapp", icon: MessageCircle, href: "/admin/coming-soon/settings-whatsapp" },
  { key: "paymentMethods", icon: Wallet, href: "/admin/coming-soon/settings-paymentMethods" },
  { key: "paymentGateways", icon: CreditCard, href: "/admin/coming-soon/settings-paymentGateways" },
  { key: "backup", icon: Database, href: "/admin/coming-soon/settings-backup" },
  { key: "schedulerCron", icon: Clock, href: "/admin/coming-soon/settings-schedulerCron" },
  { key: "updates", icon: RefreshCw, href: "/admin/coming-soon/settings-updates" },
  { key: "license", icon: Key, href: "/admin/coming-soon/settings-license" },
  { key: "privacyTerms", icon: FileText, href: "/admin/coming-soon/settings-privacyTerms" },
];

export default function SettingsIndexPage() {
  const { t } = useDictionary();
  const s = t.settings.index;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{s.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{s.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SETTINGS_CARDS.map(({ key, icon: Icon, href }) => (
          <Link key={key} to={href}>
            <Card className="flex h-full flex-row items-start gap-3 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-semibold">{s.cards[key].title}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.cards[key].description}</p>
              </div>
              <ChevronRight className="mt-1 size-4 shrink-0 text-muted-foreground" />
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
