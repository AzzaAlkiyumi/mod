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

  function changeLocale(next: Locale) {
    if (next === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    // A full reload is the simplest way to re-hydrate every dictionary
    // consumer in the tree at once — locale is a client-only cookie read
    // once at boot (see app.tsx), not server-shared per navigation.
    window.location.reload();
  }

  return (
    <Select value={locale} onValueChange={(v) => changeLocale(v as Locale)}>
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
