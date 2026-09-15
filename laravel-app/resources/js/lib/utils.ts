import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The system's base currency and how amounts are displayed everywhere —
 * configured on Administration > Settings > Currency & formatting and
 * persisted in the `Setting` singleton row (defaults to Omani Rial,
 * matching this business). */
export interface CurrencyFormat {
  code: string;
  symbol: string;
  decimals: number;
  thousandsSeparator: string;
  decimalSeparator: string;
  symbolBefore: boolean;
}

export const DEFAULT_CURRENCY_FORMAT: CurrencyFormat = {
  code: "OMR",
  symbol: "OMR",
  decimals: 3,
  thousandsSeparator: ",",
  decimalSeparator: ".",
  symbolBefore: true,
};

/** Process-wide cache of the current currency format, so `formatCurrency`
 * can stay a plain synchronous function usable from both server and
 * client components without threading the setting through every call
 * site. Hydrated once per request from the DB by `CurrencyFormatHydrator`
 * (rendered at the root layout) and updated immediately on save by the
 * settings API route — see QUOTATION_AUDIT.md. */
let currentCurrencyFormat: CurrencyFormat = DEFAULT_CURRENCY_FORMAT;

export function setCurrencyFormat(format: CurrencyFormat) {
  currentCurrencyFormat = format;
}

export function getCurrencyFormat(): CurrencyFormat {
  return currentCurrencyFormat;
}

/** Pure formatter used by both `formatCurrency` (the saved, system-wide
 * format) and the Currency & formatting page's live preview (the
 * in-progress, unsaved form state). Builds the string manually instead of
 * `Intl.NumberFormat` because the symbol/placement/separators are
 * independently admin-configured, not derived from an ISO currency code. */
export function formatAmountWithConfig(value: unknown, config: CurrencyFormat) {
  const num = Number(value);
  const amount = Number.isFinite(num) ? num : 0;
  const fixed = Math.abs(amount).toFixed(config.decimals);
  const [intPart, decPart] = fixed.split(".");
  const grouped = config.thousandsSeparator
    ? intPart.replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator)
    : intPart;
  const numeric = decPart ? `${grouped}${config.decimalSeparator}${decPart}` : grouped;
  const signed = `${amount < 0 ? "-" : ""}${numeric}`;
  return config.symbolBefore ? `${config.symbol}${signed}` : `${signed} ${config.symbol}`;
}

/** `locale` is kept for backward compatibility with every existing call
 * site — the format itself is now one global, admin-configured setting
 * (see Currency & formatting) rather than derived per-locale, so digits
 * render identically in English and Arabic (as they always did here). */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for call-site compatibility, see comment above
export function formatCurrency(value: unknown, locale: "en" | "ar" = "en") {
  return formatAmountWithConfig(value, currentCurrencyFormat);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA").format(date); // YYYY-MM-DD, matches reference UI
}
