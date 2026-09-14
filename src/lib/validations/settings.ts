import { z } from "zod";

export const currencySettingsSchema = z.object({
  currencyCode: z.string().trim().min(1, "Currency is required"),
  currencySymbol: z.string().trim().min(1, "Symbol is required"),
  currencyDecimals: z.coerce.number().int().min(0).max(4),
  thousandsSeparator: z.string().max(1).default(""),
  decimalSeparator: z.string().trim().min(1, "Decimal separator is required").max(1),
  symbolBeforeAmount: z.boolean().default(true),
});
export type CurrencySettingsInput = z.infer<typeof currencySettingsSchema>;
