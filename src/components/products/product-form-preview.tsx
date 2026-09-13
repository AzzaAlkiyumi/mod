"use client";

/**
 * PREVIEW of a redesigned "Add Product" form — see the header comment in
 * app/admin/product-preview/new/page.tsx for full context. Nothing here
 * saves to the database: "Create product" just confirms the values it
 * would have sent, so the layout/fields/bilingual behavior can be reviewed
 * before any of it is wired to the real Product model or a real API call.
 *
 * Field set is grounded in the reference site's real "New product" form
 * (Display name, Product type, SKU, Barcode, Short description,
 * Description, Category, Brand, Unit, Product image, Available for sale,
 * Featured) — nothing from that list was dropped. Layout/hierarchy
 * (a highlighted "required fields" card, Product type as its own card, an
 * "Optional details" disclosure for the rest) follows a separate
 * "improved layout" reference image the user supplied, adapted — not
 * copied — to this site's own card/spacing/typography language.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown, ImageOff, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatCurrency } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";

type Lang = "en" | "ar";

const COMMON_UNITS = ["pcs", "kg", "g", "L", "ml", "box", "pack", "set"];

const STRINGS = {
  en: {
    dir: "ltr" as const,
    previewBanner:
      "Preview — this page is for review only. Nothing here is saved, and the real Add Product page is not affected yet.",
    back: "Back to preview info",
    title: "New product",
    subtitle: "Improved layout — proposed. Catalog of everything you sell.",
    discard: "Discard",
    create: "Create product",
    uiLanguage: "Interface",
    contentLanguage: "Product content language",
    contentLanguageHint: "Fields below apply to this language only — switch to fill in the other.",
    filledBadge: "filled",
    requiredBanner: "REQUIRED — 4 FIELDS",
    displayName: "Display name",
    displayNamePlaceholder: "e.g. Coca-Cola 330ml Can",
    category: "Category",
    categoryPlaceholder: "Choose or type a category",
    unit: "Sold by (unit)",
    unitPlaceholder: "Choose a unit",
    unitOther: "Other (type custom)",
    unitCustomPlaceholder: "e.g. dozen",
    unitHint: "No unit is pre-filled — pick one on purpose.",
    price: "Price",
    pricePlaceholder: "0.000",
    productTypeTitle: "Product type",
    productTypeValue: "Simple — single SKU, single price",
    productTypeHint:
      "Variant (multiple sizes/colors) and Kit (bundle) types aren't supported yet — every product is Simple for now.",
    statusTitle: "Status",
    available: "Available for sale",
    availableHint: "When off, this product is hidden from the cashier catalog.",
    featured: "Featured (Quick Picks)",
    featuredHint: "Pin this item on the cashier's common-items rail.",
    optionalDetails: "Optional details",
    optionalDetailsHint: "SKU, barcode, descriptions, brand, and photo.",
    sku: "SKU",
    skuPlaceholder: "Leave blank to auto-generate",
    skuHint: "Your internal code for this product.",
    generate: "Generate",
    barcode: "Barcode",
    barcodePlaceholder: "Scan, enter, or generate",
    barcodeHint: "The manufacturer barcode, if this product has one.",
    shortDescription: "Short description",
    shortDescriptionPlaceholder: "One-line summary shown on receipts",
    description: "Description",
    descriptionPlaceholder: "Longer-form notes — visible inside the back office only",
    brand: "Brand",
    brandPlaceholder: "e.g. Coca-Cola",
    productImage: "Product image",
    productImageHint: "Paste a direct image link (JPG, PNG, or WebP).",
    imageUrlPlaceholder: "https://...",
    noImage: "No image yet",
    taxLabel: "Tax",
    taxNone: "No tax",
    errors: {
      displayName: "Display name is required",
      category: "Category is required",
      unit: "Choose a unit",
      price: "Enter a valid price",
    },
    createdToast: (name: string) => `Preview only — "${name}" was not actually saved.`,
    fixErrors: "Fix the highlighted required fields",
  },
  ar: {
    dir: "rtl" as const,
    previewBanner: "معاينة فقط — هذه الصفحة للمراجعة، لا يتم حفظ أي شيء، وصفحة إضافة المنتج الحقيقية لم تتأثر بعد.",
    back: "رجوع",
    title: "منتج جديد",
    subtitle: "تصميم محسّن — مقترح. كتالوج كل ما تبيعه.",
    discard: "تجاهل",
    create: "إنشاء المنتج",
    uiLanguage: "لغة الواجهة",
    contentLanguage: "لغة بيانات المنتج",
    contentLanguageHint: "الحقول أدناه تخص هذه اللغة فقط — بدّل لتعبئة اللغة الأخرى.",
    filledBadge: "معبّأ",
    requiredBanner: "مطلوب — 4 حقول",
    displayName: "الاسم المعروض",
    displayNamePlaceholder: "مثال: كوكاكولا 330 مل",
    category: "الفئة",
    categoryPlaceholder: "اختر أو اكتب فئة",
    unit: "يُباع حسب (الوحدة)",
    unitPlaceholder: "اختر وحدة",
    unitOther: "أخرى (اكتب وحدة مخصصة)",
    unitCustomPlaceholder: "مثال: دزينة",
    unitHint: "لا توجد وحدة معبأة مسبقًا — اخترها بنفسك عن قصد.",
    price: "السعر",
    pricePlaceholder: "0.000",
    productTypeTitle: "نوع المنتج",
    productTypeValue: "بسيط — SKU واحد وسعر واحد",
    productTypeHint: "أنواع المتغيرات (أحجام/ألوان متعددة) والحزم غير مدعومة بعد — كل منتج بسيط حاليًا.",
    statusTitle: "الحالة",
    available: "متاح للبيع",
    availableHint: "عند الإيقاف، يختفي هذا المنتج من كتالوج الكاشير.",
    featured: "مميز (اختيارات سريعة)",
    featuredHint: "تثبيت هذا العنصر في شريط العناصر الشائعة عند الكاشير.",
    optionalDetails: "تفاصيل اختيارية",
    optionalDetailsHint: "SKU، الباركود، الأوصاف، العلامة التجارية، والصورة.",
    sku: "SKU",
    skuPlaceholder: "اتركه فارغًا للتوليد التلقائي",
    skuHint: "الرمز الداخلي الخاص بك لهذا المنتج.",
    generate: "توليد",
    barcode: "الباركود",
    barcodePlaceholder: "امسح، أدخل، أو ولّد",
    barcodeHint: "باركود الشركة المصنّعة، إن وُجد.",
    shortDescription: "وصف مختصر",
    shortDescriptionPlaceholder: "ملخص من سطر واحد يظهر على الإيصالات",
    description: "الوصف",
    descriptionPlaceholder: "ملاحظات أطول — تظهر فقط داخل المكتب الخلفي",
    brand: "العلامة التجارية",
    brandPlaceholder: "مثال: كوكاكولا",
    productImage: "صورة المنتج",
    productImageHint: "الصق رابط صورة مباشر (JPG أو PNG أو WebP).",
    imageUrlPlaceholder: "https://...",
    noImage: "لا توجد صورة بعد",
    taxLabel: "الضريبة",
    taxNone: "بدون ضريبة",
    errors: {
      displayName: "الاسم المعروض مطلوب",
      category: "الفئة مطلوبة",
      unit: "اختر وحدة",
      price: "أدخل سعرًا صحيحًا",
    },
    createdToast: (name: string) => `معاينة فقط — لم يتم حفظ "${name}" فعليًا.`,
    fixErrors: "صحّح الحقول المطلوبة المظلّلة",
  },
};

interface TaxOption {
  id: string;
  name: string;
  rate: number;
}

export function ProductFormPreview({
  categories,
  units,
  taxes,
  initialLang,
}: {
  categories: string[];
  units: string[];
  taxes: TaxOption[];
  initialLang: Lang;
}) {
  // The interface always follows the site's real language switcher (header,
  // top-right) — no separate toggle here, consistent with every other admin
  // page. Only the product's own content language (name/description) has
  // its own control, since a product can hold both at once.
  const { locale: uiLang } = useDictionary();
  const [contentLang, setContentLang] = useState<Lang>(initialLang);
  const dir = uiLang === "ar" ? "rtl" : "ltr";
  const s = STRINGS[uiLang];

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [customUnit, setCustomUnit] = useState("");
  const [price, setPrice] = useState("");
  const [taxId, setTaxId] = useState<string>(taxes.find((t) => t.rate === 0) ? "" : "");
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [sku, setSku] = useState("");
  const [barcode, setBarcode] = useState("");
  const [shortDescEn, setShortDescEn] = useState("");
  const [shortDescAr, setShortDescAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [brand, setBrand] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const unitOptions = useMemo(
    () => Array.from(new Set([...COMMON_UNITS, ...units])).sort(),
    [units],
  );

  const name = contentLang === "en" ? nameEn : nameAr;
  const setName = contentLang === "en" ? setNameEn : setNameAr;
  const shortDesc = contentLang === "en" ? shortDescEn : shortDescAr;
  const setShortDesc = contentLang === "en" ? setShortDescEn : setShortDescAr;
  const desc = contentLang === "en" ? descEn : descAr;
  const setDesc = contentLang === "en" ? setDescEn : setDescAr;

  const effectiveUnit = unit === "__other__" ? customUnit : unit;

  function validate() {
    const next: Record<string, string> = {};
    if (!nameEn.trim() && !nameAr.trim()) next.name = s.errors.displayName;
    if (!category.trim()) next.category = s.errors.category;
    if (!effectiveUnit.trim()) next.unit = s.errors.unit;
    const priceNum = Number(price);
    if (!price || !Number.isFinite(priceNum) || priceNum < 0) next.price = s.errors.price;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleCreate() {
    if (!validate()) {
      toast.error(s.fixErrors);
      return;
    }
    toast.success(s.createdToast(nameEn || nameAr));
  }

  function generateSku() {
    setSku(`PRD-${Date.now().toString().slice(-6)}`);
  }

  function generateBarcode() {
    const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
    setBarcode(digits);
  }

  return (
    <div dir={dir} className="flex flex-col gap-4">
      <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning">
        {s.previewBanner}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/quotations"
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
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={() => toast.info(s.discard)}>
            {s.discard}
          </Button>
          <Button type="button" onClick={handleCreate}>
            {s.create}
          </Button>
        </div>
      </div>

      {/* Content language control — the product's own name/description can
          hold both languages; this picks which one the fields below edit. */}
      <Card>
        <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
          <Label className="normal-case tracking-normal text-foreground">
            {s.contentLanguage}
          </Label>
          <LangPills
            value={contentLang}
            onChange={setContentLang}
            dir={dir}
            filledEn={Boolean(nameEn.trim())}
            filledAr={Boolean(nameAr.trim())}
            filledBadge={s.filledBadge}
          />
        </CardContent>
        <CardContent className="pt-0 text-xs text-muted-foreground">
          {s.contentLanguageHint}
        </CardContent>
      </Card>

      {/* Required fields */}
      <Card className="border-primary/40 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">{s.requiredBanner}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="pf-name">
              {s.displayName} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={s.displayNamePlaceholder}
              dir={contentLang === "ar" ? "rtl" : "ltr"}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-category">
              {s.category} <span className="text-destructive">*</span>
            </Label>
            <Input
              id="pf-category"
              list="pf-category-options"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <Select value={unit} onValueChange={setUnit}>
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
            {unit === "__other__" && (
              <Input
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={s.pricePlaceholder}
              aria-invalid={Boolean(errors.price)}
            />
            {errors.price ? (
              <p className="text-xs text-destructive">{errors.price}</p>
            ) : price && Number.isFinite(Number(price)) ? (
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Number(price), uiLang)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pf-tax">{s.taxLabel}</Label>
            <Select value={taxId} onValueChange={setTaxId}>
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

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>{s.statusTitle}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <label className="flex items-start gap-2.5">
            <Checkbox checked={available} onCheckedChange={(v) => setAvailable(v === true)} />
            <span className="flex flex-col">
              <span className="text-sm font-medium">{s.available}</span>
              <span className="text-xs text-muted-foreground">{s.availableHint}</span>
            </span>
          </label>
          <label className="flex items-start gap-2.5">
            <Checkbox checked={featured} onCheckedChange={(v) => setFeatured(v === true)} />
            <span className="flex flex-col">
              <span className="text-sm font-medium">{s.featured}</span>
              <span className="text-xs text-muted-foreground">{s.featuredHint}</span>
            </span>
          </label>
        </CardContent>
      </Card>

      {/* Optional details */}
      <Card className="overflow-hidden py-0">
        <button
          type="button"
          onClick={() => setDetailsOpen((v) => !v)}
          className="flex w-full items-center justify-between px-6 py-4 text-start"
        >
          <span>
            <span className="block text-base font-semibold">{s.optionalDetails}</span>
            <span className="block text-sm text-muted-foreground">{s.optionalDetailsHint}</span>
          </span>
          <ChevronDown
            className={cn("size-4 shrink-0 text-muted-foreground transition-transform", detailsOpen && "rotate-180")}
          />
        </button>
        {detailsOpen && (
          <CardContent className="flex flex-col gap-4 border-t border-border pt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-sku">{s.sku}</Label>
                <div className="flex gap-1.5">
                  <Input
                    id="pf-sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder={s.skuPlaceholder}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={generateSku}>
                    <RefreshCw className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{s.skuHint}</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-barcode">{s.barcode}</Label>
                <div className="flex gap-1.5">
                  <Input
                    id="pf-barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder={s.barcodePlaceholder}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={generateBarcode}>
                    <RefreshCw className="size-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{s.barcodeHint}</p>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pf-short-desc">{s.shortDescription}</Label>
              <Input
                id="pf-short-desc"
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                placeholder={s.shortDescriptionPlaceholder}
                dir={contentLang === "ar" ? "rtl" : "ltr"}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pf-desc">{s.description}</Label>
              <Textarea
                id="pf-desc"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder={s.descriptionPlaceholder}
                dir={contentLang === "ar" ? "rtl" : "ltr"}
                rows={3}
              />
            </div>

            <div className="flex flex-col gap-1.5 sm:w-1/2">
              <Label htmlFor="pf-brand">{s.brand}</Label>
              <Input
                id="pf-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={s.brandPlaceholder}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label>{s.productImage}</Label>
              <div className="flex items-center gap-3">
                {imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- preview thumbnail for a pasted URL.
                  <img
                    src={imageUrl}
                    alt=""
                    className="size-16 shrink-0 rounded-md border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted text-muted-foreground">
                    <ImageOff className="size-5" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-1">
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder={s.imageUrlPlaceholder}
                  />
                  <p className="text-xs text-muted-foreground">{s.productImageHint}</p>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}

function LangPills({
  value,
  onChange,
  dir,
  filledEn,
  filledAr,
  filledBadge,
}: {
  value: Lang;
  onChange: (lang: Lang) => void;
  dir: "ltr" | "rtl";
  filledEn?: boolean;
  filledAr?: boolean;
  filledBadge?: string;
}) {
  return (
    <div className="flex overflow-hidden rounded-md border border-input" dir={dir}>
      {(["en", "ar"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
            value === l
              ? "bg-primary text-primary-foreground"
              : "bg-background text-muted-foreground hover:bg-accent",
          )}
        >
          {l === "en" ? "English" : "العربية"}
          {((l === "en" && filledEn) || (l === "ar" && filledAr)) && filledBadge && (
            <span className="rounded-full bg-success/20 px-1.5 py-0.5 text-[10px] text-success">
              {filledBadge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
