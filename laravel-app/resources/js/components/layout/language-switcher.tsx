import { router } from "@inertiajs/react";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDictionary } from "@/i18n/dictionary-context";
import { LOCALES, LOCALE_COOKIE, LOCALE_LABEL, type Locale } from "@/i18n/config";

export function LanguageSwitcher() {
  const { t, locale } = useDictionary();
  const [pending, startTransition] = useTransition();

  function changeLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    startTransition(() => {
      router.reload();
    });
  }

  return (
    <Select value={locale} onValueChange={(v) => changeLocale(v as Locale)} disabled={pending}>
      <SelectTrigger className="hidden h-9 w-32 xl:flex">
        <div className="flex flex-col items-start leading-tight">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
            {t.header.language}
          </span>
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((l) => (
          <SelectItem key={l} value={l}>
            {LOCALE_LABEL[l]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
