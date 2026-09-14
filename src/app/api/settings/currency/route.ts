import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { setCurrencyFormat, DEFAULT_CURRENCY_FORMAT } from "@/lib/utils";
import { currencySettingsSchema } from "@/lib/validations/settings";

export async function GET() {
  const row = await prisma.setting.findUnique({ where: { id: "singleton" } });
  if (!row) {
    return NextResponse.json({ data: DEFAULT_CURRENCY_FORMAT });
  }
  return NextResponse.json({
    data: {
      code: row.currencyCode,
      symbol: row.currencySymbol,
      decimals: row.currencyDecimals,
      thousandsSeparator: row.thousandsSeparator,
      decimalSeparator: row.decimalSeparator,
      symbolBefore: row.symbolBeforeAmount,
    },
  });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = currencySettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  const row = await prisma.setting.upsert({
    where: { id: "singleton" },
    update: {
      currencyCode: input.currencyCode,
      currencySymbol: input.currencySymbol,
      currencyDecimals: input.currencyDecimals,
      thousandsSeparator: input.thousandsSeparator,
      decimalSeparator: input.decimalSeparator,
      symbolBeforeAmount: input.symbolBeforeAmount,
    },
    create: {
      id: "singleton",
      currencyCode: input.currencyCode,
      currencySymbol: input.currencySymbol,
      currencyDecimals: input.currencyDecimals,
      thousandsSeparator: input.thousandsSeparator,
      decimalSeparator: input.decimalSeparator,
      symbolBeforeAmount: input.symbolBeforeAmount,
    },
  });

  const format = {
    code: row.currencyCode,
    symbol: row.currencySymbol,
    decimals: row.currencyDecimals,
    thousandsSeparator: row.thousandsSeparator,
    decimalSeparator: row.decimalSeparator,
    symbolBefore: row.symbolBeforeAmount,
  };
  // Take effect immediately for the rest of this process, not just on the
  // next request — formatCurrency() reads this in-memory cache.
  setCurrencyFormat(format);

  return NextResponse.json({ data: format });
}
