import { NextResponse, type NextRequest } from "next/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, isLocale } from "@/i18n/config";

/** On a visitor's first request (no locale cookie yet), detect their preferred language
 * from Accept-Language and persist it as a cookie, so the language + text direction is
 * applied automatically without requiring them to pick it manually. A later explicit
 * choice from the language switcher simply overwrites this cookie. */
export function proxy(request: NextRequest) {
  const response = NextResponse.next();

  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(existing)) return response;

  const acceptLanguage = request.headers.get("accept-language");
  const detected =
    acceptLanguage
      ?.split(",")
      .map((part) => part.split(";")[0]?.trim().toLowerCase())
      .map((tag) => LOCALES.find((l) => l === tag || l === tag?.split("-")[0]))
      .find(Boolean) ?? DEFAULT_LOCALE;

  response.cookies.set(LOCALE_COOKIE, detected, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
