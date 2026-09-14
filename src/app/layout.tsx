import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

import { getLocale } from "@/i18n/get-locale";
import { dirFor } from "@/i18n/config";
import { DictionaryProvider } from "@/i18n/dictionary-context";
import { CurrencyFormatHydrator } from "@/components/settings/currency-format-hydrator";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CURRENCY_FORMAT, setCurrencyFormat } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Quotations · Hyper POS",
  description: "Prepare, share, revise, and convert customer quotations without changing stock.",
};

// Forces the currency-settings read below (and getLocale()'s cookie read)
// to run fresh on every request, matching the force-dynamic convention
// already used by every data-fetching page in this app — otherwise the
// root layout can be reused across navigations and formatCurrency() would
// keep hydrating with a stale currency after it's changed and saved.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dir = dirFor(locale);

  const settingRow = await prisma.setting.findUnique({ where: { id: "singleton" } });
  const currencyFormat = settingRow
    ? {
        code: settingRow.currencyCode,
        symbol: settingRow.currencySymbol,
        decimals: settingRow.currencyDecimals,
        thousandsSeparator: settingRow.thousandsSeparator,
        decimalSeparator: settingRow.decimalSeparator,
        symbolBefore: settingRow.symbolBeforeAmount,
      }
    : DEFAULT_CURRENCY_FORMAT;

  // Next.js bundles Server Components and Client Components separately, so
  // `utils.ts`'s module-level cache is really two different instances: one
  // for the RSC/server bundle (read directly here, and by any Server
  // Component that calls formatCurrency — e.g. ProductTable), one for the
  // client/SSR bundle (hydrated below by <CurrencyFormatHydrator>, read by
  // "use client" components like the POS view). Both need setting.
  setCurrencyFormat(currencyFormat);

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansArabic.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <CurrencyFormatHydrator format={currencyFormat} />
        <DictionaryProvider locale={locale}>{children}</DictionaryProvider>
      </body>
    </html>
  );
}
