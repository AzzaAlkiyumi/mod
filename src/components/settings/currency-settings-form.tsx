"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyCombobox } from "@/components/settings/currency-combobox";
import { formatAmountWithConfig, type CurrencyFormat } from "@/lib/utils";
import { findCurrency } from "@/lib/currencies";
import { useDictionary } from "@/i18n/dictionary-context";

const DECIMAL_OPTIONS = [0, 1, 2, 3, 4];
const PREVIEW_AMOUNT = 1234567.5;

export function CurrencySettingsForm({ initial }: { initial: CurrencyFormat }) {
  const router = useRouter();
  const { t, locale } = useDictionary();
  const s = t.settings.currency;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);

  function handleCurrencyChange(code: string) {
    const match = findCurrency(code);
    setForm((f) => ({
      ...f,
      code,
      symbol: match?.symbol ?? f.symbol,
      decimals: match?.decimals ?? f.decimals,
    }));
  }

  async function handleSave() {
    if (!form.symbol.trim() || !form.decimalSeparator.trim()) {
      toast.error(s.fixRequired);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings/currency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currencyCode: form.code,
          currencySymbol: form.symbol.trim(),
          currencyDecimals: form.decimals,
          thousandsSeparator: form.thousandsSeparator,
          decimalSeparator: form.decimalSeparator.trim(),
          symbolBeforeAmount: form.symbolBefore,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.formErrors?.[0] ?? s.saveFailed);
      }
      toast.success(s.savedToast);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : s.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  const previewOn = formatAmountWithConfig(PREVIEW_AMOUNT, { ...form, symbolBefore: true });
  const previewOff = formatAmountWithConfig(PREVIEW_AMOUNT, { ...form, symbolBefore: false });

  return (
    <div dir={dir} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/settings"
            className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            aria-label={s.back}
          >
            <ArrowLeft className={dir === "rtl" ? "size-4 -scale-x-100" : "size-4"} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{s.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{s.subtitle}</p>
          </div>
        </div>
        <Button type="button" onClick={handleSave} disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {saving ? s.saving : s.save}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-4 p-5">
            <div>
              <h2 className="text-sm font-semibold">{s.baseCurrencySectionTitle}</h2>
              <p className="text-xs text-muted-foreground">{s.baseCurrencySectionSubtitle}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{s.baseCurrencyLabel} *</Label>
              <CurrencyCombobox value={form.code} onChange={handleCurrencyChange} />
            </div>
          </Card>

          <Card className="flex flex-col gap-4 p-5">
            <div>
              <h2 className="text-sm font-semibold">{s.displayFormatSectionTitle}</h2>
              <p className="text-xs text-muted-foreground">{s.displayFormatSectionSubtitle}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currency-symbol">{s.symbolLabel} *</Label>
                <Input
                  id="currency-symbol"
                  dir="ltr"
                  value={form.symbol}
                  onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>{s.decimalPlacesLabel} *</Label>
                <Select
                  value={String(form.decimals)}
                  onValueChange={(v) => setForm((f) => ({ ...f, decimals: Number(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DECIMAL_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currency-thousands">{s.thousandsSeparatorLabel}</Label>
                <Input
                  id="currency-thousands"
                  dir="ltr"
                  maxLength={1}
                  value={form.thousandsSeparator}
                  onChange={(e) => setForm((f) => ({ ...f, thousandsSeparator: e.target.value }))}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="currency-decimal-sep">{s.decimalSeparatorLabel} *</Label>
                <Input
                  id="currency-decimal-sep"
                  dir="ltr"
                  maxLength={1}
                  value={form.decimalSeparator}
                  onChange={(e) => setForm((f) => ({ ...f, decimalSeparator: e.target.value }))}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{s.separatorHint}</p>
            <label className="flex items-center gap-2.5">
              <Checkbox
                checked={form.symbolBefore}
                onCheckedChange={(v) => setForm((f) => ({ ...f, symbolBefore: v === true }))}
              />
              <span className="flex flex-col">
                <span className="text-sm font-medium">{s.symbolBeforeLabel}</span>
                <span dir="ltr" className="text-xs text-muted-foreground">
                  {s.symbolBeforeHint(previewOn, previewOff)}
                </span>
              </span>
            </label>
          </Card>
        </div>

        <Card className="flex flex-col gap-2 p-5">
          <h2 className="text-sm font-semibold">{s.previewTitle}</h2>
          <p dir="ltr" className="text-3xl font-bold tabular-nums">
            {formatAmountWithConfig(PREVIEW_AMOUNT, form)}
          </p>
        </Card>
      </div>
    </div>
  );
}
