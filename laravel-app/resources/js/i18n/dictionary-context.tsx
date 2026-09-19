
import { createContext, useContext, type ReactNode } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";

import { dirFor, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

// Only the locale (a plain string) crosses the server→client boundary here — the
// dictionary itself contains functions (for parameterized strings like "QT-000006
// deleted"), and functions can't be serialized from a Server Component into a Client
// Component. Each side independently calls the pure `getDictionary(locale)` instead.
const LocaleContext = createContext<Locale | null>(null);

export function DictionaryProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>
      {/* Radix's popper-based components (DropdownMenu, Select, Popover...)
       * don't read the page's dir="rtl" from the DOM — without this they
       * always position themselves as if the page were LTR, which is what
       * threw the dropdown/select menus miles off in Arabic. */}
      <DirectionProvider dir={dirFor(locale)}>{children}</DirectionProvider>
    </LocaleContext.Provider>
  );
}

/** Client-component hook: `const { t, locale } = useDictionary();` */
export function useDictionary() {
  const locale = useContext(LocaleContext);
  if (!locale) {
    throw new Error("useDictionary() must be used within a <DictionaryProvider>");
  }
  return { t: getDictionary(locale), locale };
}
