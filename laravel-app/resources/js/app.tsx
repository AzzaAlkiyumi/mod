import "../css/app.css";
import { createRoot } from "react-dom/client";
import { createInertiaApp, router } from "@inertiajs/react";
import { DictionaryProvider } from "@/i18n/dictionary-context";
import { setCurrencyFormat, DEFAULT_CURRENCY_FORMAT, type CurrencyFormat } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob<{ default: React.ComponentType }>("./Pages/**/*.tsx", {
      eager: true,
    });
    return pages[`./Pages/${name}.tsx`];
  },
  setup({ el, App, props }) {
    const page = props.initialPage.props as {
      locale?: Locale;
      currencyFormat?: CurrencyFormat;
    };
    const locale: Locale = page.locale ?? "en";
    // No RSC/client-bundle split here (unlike the Next.js version) — Inertia
    // pages are plain client components, so one hydration on boot covers
    // every consumer of formatCurrency() for this page load.
    setCurrencyFormat(page.currencyFormat ?? DEFAULT_CURRENCY_FORMAT);

    // Every later client-side navigation re-shares currencyFormat too (see
    // HandleInertiaRequests) — keep the in-memory cache in sync so a saved
    // change on Settings > Currency is reflected the moment the next page
    // loads, without a full browser reload.
    router.on("success", (event) => {
      const props = event.detail.page.props as { currencyFormat?: CurrencyFormat };
      setCurrencyFormat(props.currencyFormat ?? DEFAULT_CURRENCY_FORMAT);
    });

    createRoot(el).render(
      <DictionaryProvider locale={locale}>
        <App {...props} />
      </DictionaryProvider>,
    );
  },
});
