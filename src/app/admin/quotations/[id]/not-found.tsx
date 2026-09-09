import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const t = getDictionary(await getLocale());

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="size-5 text-muted-foreground" />
      </div>
      <p className="font-medium">{t.notFound.title}</p>
      <p className="text-sm text-muted-foreground">{t.notFound.subtitle}</p>
      <Button asChild className="mt-2">
        <Link href="/admin/quotations">{t.common.backToQuotations}</Link>
      </Button>
    </div>
  );
}
