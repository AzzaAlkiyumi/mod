"use client";

import { setCurrencyFormat, type CurrencyFormat } from "@/lib/utils";

/** Rendered once at the root layout, before any page content, so every
 * `formatCurrency()` call anywhere in the tree (server or client) sees the
 * saved system-wide currency format on this render pass. See
 * `src/lib/utils.ts` for why this is a synchronous in-memory cache
 * instead of an async fetch per call site. */
export function CurrencyFormatHydrator({ format }: { format: CurrencyFormat }) {
  setCurrencyFormat(format);
  return null;
}
