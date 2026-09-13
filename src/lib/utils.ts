import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** The business runs in Oman, so every amount in the app is Omani Rial
 * (OMR — 3 decimal places, baisa precision), not USD. `locale` only
 * changes which side of the currency symbol/word is used ("OMR 12.990" in
 * English vs "12.990 ر.ع." in Arabic) — the amount itself is unaffected.
 * `numberingSystem: "latn"` keeps digits in Western/Hindu-Arabic form in
 * both languages, matching how the business's own paperwork is written. */
export function formatCurrency(value: unknown, locale: "en" | "ar" = "en") {
  const num = Number(value);
  const amount = Number.isFinite(num) ? num : 0;
  return new Intl.NumberFormat(locale === "ar" ? "ar-OM" : "en-OM", {
    style: "currency",
    currency: "OMR",
    numberingSystem: "latn",
  }).format(amount);
}

export function formatDate(value: Date | string | null | undefined) {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-CA").format(date); // YYYY-MM-DD, matches reference UI
}
