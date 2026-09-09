import { cookies, headers } from "next/headers";

import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, isLocale, type Locale } from "@/i18n/config";

/** Parses an Accept-Language header and returns the best-matching supported locale, if any. */
function detectFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const preferred = header
    .split(",")
    .map((part) => part.split(";")[0]?.trim().toLowerCase())
    .filter(Boolean);

  for (const tag of preferred) {
    const base = tag.split("-")[0];
    const match = LOCALES.find((l) => l === base || l === tag);
    if (match) return match;
  }
  return null;
}

/** Server-side locale resolution: explicit cookie (set by the language switcher, or by
 * middleware on first visit) wins; otherwise falls back to the browser's Accept-Language,
 * then to the default. */
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;

  const headerStore = await headers();
  const detected = detectFromAcceptLanguage(headerStore.get("accept-language"));
  return detected ?? DEFAULT_LOCALE;
}
