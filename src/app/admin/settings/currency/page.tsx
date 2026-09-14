import { prisma } from "@/lib/prisma";
import { DEFAULT_CURRENCY_FORMAT } from "@/lib/utils";
import { CurrencySettingsForm } from "@/components/settings/currency-settings-form";

export const dynamic = "force-dynamic";

export default async function CurrencySettingsPage() {
  const row = await prisma.setting.findUnique({ where: { id: "singleton" } });
  const initial = row
    ? {
        code: row.currencyCode,
        symbol: row.currencySymbol,
        decimals: row.currencyDecimals,
        thousandsSeparator: row.thousandsSeparator,
        decimalSeparator: row.decimalSeparator,
        symbolBefore: row.symbolBeforeAmount,
      }
    : DEFAULT_CURRENCY_FORMAT;

  return <CurrencySettingsForm initial={initial} />;
}
