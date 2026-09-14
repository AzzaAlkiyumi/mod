/** Static catalog of major world currencies for the Currency & formatting
 * settings page's base-currency dropdown. Picking one autofills sensible
 * symbol/decimal defaults, which the admin can still override — matches
 * the reference site's `/admin/settings/currency` page. Not exhaustive
 * (every ISO 4217 currency), but covers every major economy plus every
 * GCC currency (OMR included, as required). */

export interface CurrencyDef {
  code: string;
  name: string;
  symbol: string;
  decimals: number;
}

export const CURRENCY_CATALOG: CurrencyDef[] = [
  { code: "AED", name: "UAE Dirham", symbol: "AED", decimals: 2 },
  { code: "ARS", name: "Argentine Peso", symbol: "$", decimals: 2 },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", decimals: 2 },
  { code: "BDT", name: "Bangladeshi Taka", symbol: "৳", decimals: 2 },
  { code: "BHD", name: "Bahraini Dinar", symbol: "BHD", decimals: 3 },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", decimals: 2 },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", decimals: 2 },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF", decimals: 2 },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", decimals: 2 },
  { code: "CZK", name: "Czech Koruna", symbol: "Kč", decimals: 2 },
  { code: "DKK", name: "Danish Krone", symbol: "kr", decimals: 2 },
  { code: "EGP", name: "Egyptian Pound", symbol: "E£", decimals: 2 },
  { code: "EUR", name: "Euro", symbol: "€", decimals: 2 },
  { code: "GBP", name: "British Pound", symbol: "£", decimals: 2 },
  { code: "GHS", name: "Ghanaian Cedi", symbol: "GH₵", decimals: 2 },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$", decimals: 2 },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", decimals: 0 },
  { code: "ILS", name: "Israeli New Shekel", symbol: "₪", decimals: 2 },
  { code: "INR", name: "Indian Rupee", symbol: "₹", decimals: 2 },
  { code: "JOD", name: "Jordanian Dinar", symbol: "JOD", decimals: 3 },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", decimals: 0 },
  { code: "KES", name: "Kenyan Shilling", symbol: "KSh", decimals: 2 },
  { code: "KRW", name: "South Korean Won", symbol: "₩", decimals: 0 },
  { code: "KWD", name: "Kuwaiti Dinar", symbol: "KWD", decimals: 3 },
  { code: "LKR", name: "Sri Lankan Rupee", symbol: "Rs", decimals: 2 },
  { code: "MAD", name: "Moroccan Dirham", symbol: "MAD", decimals: 2 },
  { code: "MXN", name: "Mexican Peso", symbol: "Mex$", decimals: 2 },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", decimals: 2 },
  { code: "NGN", name: "Nigerian Naira", symbol: "₦", decimals: 2 },
  { code: "NOK", name: "Norwegian Krone", symbol: "kr", decimals: 2 },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$", decimals: 2 },
  { code: "OMR", name: "Omani Rial", symbol: "OMR", decimals: 3 },
  { code: "PHP", name: "Philippine Peso", symbol: "₱", decimals: 2 },
  { code: "PKR", name: "Pakistani Rupee", symbol: "Rs", decimals: 2 },
  { code: "PLN", name: "Polish Złoty", symbol: "zł", decimals: 2 },
  { code: "QAR", name: "Qatari Riyal", symbol: "QAR", decimals: 2 },
  { code: "RUB", name: "Russian Ruble", symbol: "₽", decimals: 2 },
  { code: "SAR", name: "Saudi Riyal", symbol: "SAR", decimals: 2 },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", decimals: 2 },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", decimals: 2 },
  { code: "THB", name: "Thai Baht", symbol: "฿", decimals: 2 },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", decimals: 2 },
  { code: "TWD", name: "New Taiwan Dollar", symbol: "NT$", decimals: 2 },
  { code: "USD", name: "United States Dollar", symbol: "$", decimals: 2 },
  { code: "VND", name: "Vietnamese Dong", symbol: "₫", decimals: 0 },
  { code: "ZAR", name: "South African Rand", symbol: "R", decimals: 2 },
];

export function findCurrency(code: string): CurrencyDef | undefined {
  return CURRENCY_CATALOG.find((c) => c.code === code);
}
