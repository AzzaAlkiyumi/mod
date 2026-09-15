import { Construction } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { useDictionary } from "@/i18n/dictionary-context";
import type { Dictionary } from "@/i18n/dictionaries/en";
import AdminLayout from "@/Layouts/AdminLayout";
import type { ReactElement } from "react";

function isNavItemKey(key: string, items: Dictionary["nav"]["items"]): key is keyof typeof items {
  return key in items;
}

/** Shared placeholder for every sidebar link that doesn't have a real page
 * behind it yet. `slug` is the first path segment after /admin/coming-soon/,
 * expected to be a `nav.items` dictionary key so the title is always
 * correctly translated; falls back to the raw slug for any stray link. */
export default function ComingSoonPage({ slug }: { slug: string }) {
  const { t } = useDictionary();
  const key = slug ?? "";
  const title = isNavItemKey(key, t.nav.items) ? t.nav.items[key] : key;

  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-10">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Construction className="size-6" />
          </div>
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">{t.nav.comingSoon}</p>
        </CardContent>
      </Card>
    </div>
  );
}

ComingSoonPage.layout = (page: ReactElement) => <AdminLayout>{page}</AdminLayout>;
