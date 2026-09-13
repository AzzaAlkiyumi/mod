"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImageOff, Loader2, RefreshCw, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";

const COMMON_UNITS = ["pcs", "kg", "g", "L", "ml", "box", "pack", "set"];

interface TaxOption {
  id: string;
  name: string;
  rate: number;
}

const emptyForm = {
  nameEn: "",
  nameAr: "",
  category: "",
  unit: "",
  customUnit: "",
  price: "",
  taxId: "",
  descriptionEn: "",
  descriptionAr: "",
  sku: "",
  barcode: "",
  imageUrl: "",
};

export function ProductForm({
  categories,
  units,
  taxes,
}: {
  categories: string[];
  units: string[];
  taxes: TaxOption[];
}) {
  const router = useRouter();
  const { t, locale } = useDictionary();
  const s = t.products.form;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const unitOptions = Array.from(new Set([...COMMON_UNITS, ...units])).sort();
  const effectiveUnit = form.unit === "__other__" ? form.customUnit : form.unit;

  function validate() {
    const next: Record<string, string> = {};
    if (!form.nameEn.trim()) next.nameEn = s.errors.nameEn;
    if (!form.category.trim()) next.category = s.errors.category;
    if (!effectiveUnit.trim()) next.unit = s.errors.unit;
    const priceNum = Number(form.price);
    if (!form.price || !Number.isFinite(priceNum) || priceNum < 0) next.price = s.errors.price;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleCreate() {
    if (submitting) return;
    if (!validate()) {
      toast.error(s.fixErrors);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.nameEn.trim(),
          nameAr: form.nameAr.trim() || undefined,
          category: form.category.trim(),
          unit: effectiveUnit.trim(),
          price: form.price,
          taxId: form.taxId || undefined,
          sku: form.sku.trim() || undefined,
          barcode: form.barcode.trim() || undefined,
          descriptionEn: form.descriptionEn.trim() || undefined,
          descriptionAr: form.descriptionAr.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        const fieldErrorList = Object.values(
          (json?.error?.fieldErrors ?? {}) as Record<string, string[]>,
        )[0];
        const message = json?.error?.formErrors?.[0] ?? fieldErrorList?.[0] ?? s.createFailed;
        throw new Error(message);
      }
      toast.success(s.createdToast(json.data.name));
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : s.createFailed);
    } finally {
      setSubmitting(false);
    }
  }

  function handleDiscard() {
    setForm(emptyForm);
    setErrors({});
    toast.info(s.discardedToast);
  }

  function generateSku() {
    set("sku", `PRD-${Date.now().toString().slice(-6)}`);
  }

  function generateBarcode() {
    const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
    set("barcode", digits);
  }

  return (
    <div dir={dir} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/products"
            className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            aria-label={s.back}
          >
            <ArrowLeft className={dir === "rtl" ? "size-4 -scale-x-100" : "size-4"} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{s.newTitle}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{s.newSubtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleDiscard} disabled={submitting}>
            {s.discard}
          </Button>
          <Button type="button" onClick={handleCreate} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? s.creating : s.create}
          </Button>
        </div>
      </div>

      {/* Required fields */}
      <Card className="border-primary/40 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">{s.requiredBanner}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-name-en">
              {s.nameEn} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pf-name-en"
              value={form.nameEn}
              onChange={(e) => set("nameEn", e.target.value)}
              placeholder={s.nameEnPlaceholder}
              dir="ltr"
              aria-invalid={Boolean(errors.nameEn)}
            />
            {errors.nameEn && <p className="text-xs text-destructive">{errors.nameEn}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-name-ar">{s.nameAr}</Label>
            <Input
              id="pf-name-ar"
              value={form.nameAr}
              onChange={(e) => set("nameAr", e.target.value)}
              placeholder={s.nameArPlaceholder}
              dir="rtl"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-category">
              {s.category} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pf-category"
              list="pf-category-options"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder={s.categoryPlaceholder}
              aria-invalid={Boolean(errors.category)}
            />
            <datalist id="pf-category-options">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-unit">
              {s.unit} <span className="text-destructive">*</span>
            </Label>
            <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
              <SelectTrigger id="pf-unit" aria-invalid={Boolean(errors.unit)}>
                <SelectValue placeholder={s.unitPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {unitOptions.map((u) => (
                  <SelectItem key={u} value={u}>
                    {u}
                  </SelectItem>
                ))}
                <SelectItem value="__other__">{s.unitOther}</SelectItem>
              </SelectContent>
            </Select>
            {form.unit === "__other__" && (
              <Input
                value={form.customUnit}
                onChange={(e) => set("customUnit", e.target.value)}
                placeholder={s.unitCustomPlaceholder}
                className="mt-1"
              />
            )}
            {errors.unit ? (
              <p className="text-xs text-destructive">{errors.unit}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{s.unitHint}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-price">
              {s.price} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pf-price"
              type="number"
              min={0}
              step="0.001"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder={s.pricePlaceholder}
              aria-invalid={Boolean(errors.price)}
            />
            {errors.price ? (
              <p className="text-xs text-destructive">{errors.price}</p>
            ) : form.price && Number.isFinite(Number(form.price)) ? (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Number(form.price), locale)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-tax">{s.taxLabel}</Label>
            <Select value={form.taxId} onValueChange={(v) => set("taxId", v)}>
              <SelectTrigger id="pf-tax">
                <SelectValue placeholder={s.taxNone} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{s.taxNone}</SelectItem>
                {taxes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} ({t.rate}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Product type */}
      <Card>
        <CardHeader>
          <CardTitle>{s.productTypeTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1.5">
          <div className="rounded-md border border-border bg-muted/40 px-3 py-2 text-sm font-medium">
            {s.productTypeValue}
          </div>
          <p className="text-xs text-muted-foreground">{s.productTypeHint}</p>
        </CardContent>
      </Card>

      {/* Description — English and Arabic together, no toggle */}
      <Card>
        <CardHeader>
          <CardTitle>{s.descriptionTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{s.descriptionSubtitle}</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-desc-en">{s.descriptionEn}</Label>
            <Textarea
              id="pf-desc-en"
              value={form.descriptionEn}
              onChange={(e) => set("descriptionEn", e.target.value)}
              placeholder={s.descriptionEnPlaceholder}
              dir="ltr"
              rows={3}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-desc-ar">{s.descriptionAr}</Label>
            <Textarea
              id="pf-desc-ar"
              value={form.descriptionAr}
              onChange={(e) => set("descriptionAr", e.target.value)}
              placeholder={s.descriptionArPlaceholder}
              dir="rtl"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Identifiers */}
      <Card>
        <CardHeader>
          <CardTitle>{s.identifiersTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{s.identifiersSubtitle}</p>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-sku">{s.sku}</Label>
            <div className="flex gap-1.5">
              <Input
                id="pf-sku"
                value={form.sku}
                onChange={(e) => set("sku", e.target.value)}
                placeholder={s.skuPlaceholder}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={generateSku}
                aria-label={s.generate}
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-barcode">{s.barcode}</Label>
            <div className="flex gap-1.5">
              <Input
                id="pf-barcode"
                value={form.barcode}
                onChange={(e) => set("barcode", e.target.value)}
                placeholder={s.barcodePlaceholder}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={generateBarcode}
                aria-label={s.generate}
              >
                <RefreshCw className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product image */}
      <Card>
        <CardHeader>
          <CardTitle>{s.imageTitle}</CardTitle>
          <p className="text-sm text-muted-foreground">{s.imageSubtitle}</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start">
          {form.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- thumbnail preview for a pasted URL.
            <img
              src={form.imageUrl}
              alt=""
              className="size-20 shrink-0 rounded-md border border-border object-cover"
            />
          ) : (
            <div className="flex size-20 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted text-muted-foreground">
              <ImageOff className="size-6" />
            </div>
          )}
          <div className="flex flex-1 flex-col gap-2">
            <Input
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder={s.imageUrlPlaceholder}
              dir="ltr"
            />
            {form.imageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-fit text-destructive hover:text-destructive"
                onClick={() => set("imageUrl", "")}
              >
                <X className="size-3.5" />
                {s.removeImage}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
