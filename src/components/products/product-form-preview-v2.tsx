"use client";

/**
 * PREVIEW of the expanded Add Product form (General/Inventory/Pricing &
 * Tax/Compliance tabs), modeled on the reference site's real New Product
 * page. Nothing here saves for real and none of these fields exist on the
 * Product schema yet — "Create product" simulates a save so the UX can be
 * reviewed before any migration is written. See QUOTATION_AUDIT.md for the
 * exact column list proposed for this.
 *
 * Deliberately excluded per explicit direction: per-store pricing and
 * per-store shelf locations (the reference's "Per-store pricing" and
 * "Shelf locations" sections) — this business runs single pricing across
 * stores, so those sections are not part of this preview.
 */

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImageOff, Loader2, RefreshCw, Upload, X } from "lucide-react";
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
import { formatCurrency } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";

const COMMON_UNITS = ["pcs", "kg", "g", "L", "ml", "box", "pack", "set"];

const DRUG_SCHEDULE_OPTIONS = [
  { value: "NOT_SCHEDULED", en: "— Not a scheduled drug", ar: "— ليس دواءً مصنّفًا" },
  { value: "OTC", en: "OTC — Over the counter", ar: "OTC — يُصرف بدون وصفة" },
  { value: "H", en: "H — Schedule H", ar: "H — تصنيف H" },
  { value: "H1", en: "H1 — Schedule H1", ar: "H1 — تصنيف H1" },
  { value: "X", en: "X — Schedule X", ar: "X — تصنيف X" },
  { value: "G", en: "G — Schedule G", ar: "G — تصنيف G" },
];

const TABS = ["general", "inventory", "pricing", "compliance"] as const;
type Tab = (typeof TABS)[number];

const STRINGS = {
  en: {
    dir: "ltr" as const,
    previewBanner:
      "Preview page — not yet wired to a real save; none of these fields exist on the schema yet.",
    back: "Back",
    title: "New product",
    subtitle: "Catalog of everything you sell — name it once, ring it everywhere.",
    discard: "Discard",
    discardedToast: "Form cleared",
    create: "Create product",
    creating: "Creating…",
    tabs: { general: "General", inventory: "Inventory", pricing: "Pricing & Tax", compliance: "Compliance" },
    requiredBanner: "Required fields",
    nameEn: "Product name — English",
    nameEnPlaceholder: "e.g. Coca-Cola 330ml Can",
    nameAr: "Product name — Arabic",
    nameArPlaceholder: "مثال: كوكاكولا 330 مل",
    category: "Category",
    categoryPlaceholder: "Choose or type a category",
    unit: "Sold by (unit)",
    unitPlaceholder: "Choose a unit",
    unitOther: "Other (type custom)",
    unitCustomPlaceholder: "e.g. dozen",
    unitHint: "No unit is pre-filled — pick one on purpose.",
    price: "Price",
    pricePlaceholder: "0.000",
    taxLabel: "Tax",
    taxNone: "No tax",
    productTypeTitle: "Product type",
    productTypeValue: "Simple — single SKU, single price",
    productTypeHint: "Variant and Kit product types aren't supported yet — every product is Simple for now.",
    shortDescTitle: "Short description",
    shortDescSubtitle: "Optional. A one-line summary shown in product pickers.",
    shortDescPlaceholder: "e.g. Assorted milk chocolate gift box, 400g",
    statusTitle: "Status",
    availableForSale: "Available for sale",
    availableForSaleHint: "When off, this product is hidden from the cashier catalog.",
    featured: "Featured (Quick Picks)",
    featuredHint: "Pin this item on the cashier's common-items rail.",
    descriptionTitle: "Description",
    descriptionSubtitle: "Optional. Shown inside the back office only.",
    descriptionEn: "Description — English",
    descriptionEnPlaceholder: "Notes about this product, in English",
    descriptionAr: "Description — Arabic",
    descriptionArPlaceholder: "ملاحظات عن هذا المنتج، بالعربية",
    identifiersTitle: "Identifiers",
    identifiersSubtitle: "Optional — leave blank to auto-generate.",
    sku: "SKU",
    skuPlaceholder: "Leave blank to auto-generate",
    barcode: "Barcode",
    barcodePlaceholder: "Scan, enter, or generate",
    generate: "Generate",
    imageTitle: "Product image",
    imageSubtitle: "Optional. Upload a file or paste a direct image link (JPG, PNG, or WebP).",
    imageUrlPlaceholder: "https://...",
    uploadImage: "Upload",
    removeImage: "Remove image",
    inventoryTitle: "Inventory settings",
    inventorySubtitle: "How this product is counted and replenished.",
    trackStock: "Track stock for this product",
    soldByWeight: "Sold by weight (scale integration)",
    trackBatches: "Track batches / lot numbers",
    trackExpiry: "Track expiry dates",
    expiryDate: "Expiry date",
    expiryDateHint: "Default expiry for this product.",
    reorderAt: "Reorder at",
    reorderAtHint: "When on-hand stock drops to this number, it's flagged as low.",
    reorderQuantity: "Reorder quantity",
    reorderQuantityHint: "How many units to order each time the reorder level is hit.",
    pricingTitle: "Cost & margin",
    pricingSubtitle: "Optional — for tracking profit only, doesn't affect the selling price.",
    costPrice: "Cost",
    mrp: "MRP",
    margin: "Margin",
    markup: "Markup",
    profitPerUnit: "Profit / unit",
    priceIncludesTax: "Selling price already includes tax",
    complianceTitle: "Compliance",
    complianceSubtitle: "Optional — tax codes, drug schedules, manufacturer details.",
    hsnCode: "HSN / Tax code",
    drugSchedule: "Drug schedule",
    genericName: "Generic name",
    manufacturer: "Manufacturer",
    errors: {
      nameEn: "English product name is required",
      category: "Category is required",
      unit: "Choose a unit",
      price: "Enter a valid price",
    },
    createdToast: (name: string) => `"${name}" created`,
    fixErrors: "Fix the highlighted required fields",
  },
  ar: {
    dir: "rtl" as const,
    previewBanner: "صفحة معاينة — غير مربوطة بعد بحفظ حقيقي؛ هذه الحقول غير موجودة في قاعدة البيانات بعد.",
    back: "رجوع",
    title: "منتج جديد",
    subtitle: "كتالوج كل ما تبيعه — سمِّه مرة واحدة، واستخدمه في كل مكان.",
    discard: "تجاهل",
    discardedToast: "تم مسح النموذج",
    create: "إنشاء المنتج",
    creating: "جارٍ الإنشاء…",
    tabs: { general: "عام", inventory: "المخزون", pricing: "التسعير والضريبة", compliance: "الامتثال" },
    requiredBanner: "الحقول المطلوبة",
    nameEn: "اسم المنتج — إنجليزي",
    nameEnPlaceholder: "e.g. Coca-Cola 330ml Can",
    nameAr: "اسم المنتج — عربي",
    nameArPlaceholder: "مثال: كوكاكولا 330 مل",
    category: "الفئة",
    categoryPlaceholder: "اختر أو اكتب فئة",
    unit: "يُباع حسب (الوحدة)",
    unitPlaceholder: "اختر وحدة",
    unitOther: "أخرى (اكتب وحدة مخصصة)",
    unitCustomPlaceholder: "مثال: دزينة",
    unitHint: "لا توجد وحدة معبأة مسبقًا — اخترها بنفسك عن قصد.",
    price: "السعر",
    pricePlaceholder: "0.000",
    taxLabel: "الضريبة",
    taxNone: "بدون ضريبة",
    productTypeTitle: "نوع المنتج",
    productTypeValue: "بسيط — SKU واحد وسعر واحد",
    productTypeHint: "أنواع المتغيرات والحزم غير مدعومة بعد — كل منتج بسيط حاليًا.",
    shortDescTitle: "وصف قصير",
    shortDescSubtitle: "اختياري. ملخص من سطر واحد يظهر في قوائم اختيار المنتج.",
    shortDescPlaceholder: "مثال: علبة شوكولاتة حليب متنوعة، 400 جم",
    statusTitle: "الحالة",
    availableForSale: "متاح للبيع",
    availableForSaleHint: "عند الإيقاف، يُخفى المنتج من كتالوج الكاشير.",
    featured: "مميز (اختيارات سريعة)",
    featuredHint: "تثبيت هذا المنتج في شريط العناصر الشائعة للكاشير.",
    descriptionTitle: "الوصف",
    descriptionSubtitle: "اختياري. يظهر داخل المكتب الخلفي فقط.",
    descriptionEn: "الوصف — إنجليزي",
    descriptionEnPlaceholder: "Notes about this product, in English",
    descriptionAr: "الوصف — عربي",
    descriptionArPlaceholder: "ملاحظات عن هذا المنتج، بالعربية",
    identifiersTitle: "المعرّفات",
    identifiersSubtitle: "اختياري — اتركها فارغة للتوليد التلقائي.",
    sku: "SKU",
    skuPlaceholder: "اتركه فارغًا للتوليد التلقائي",
    barcode: "الباركود",
    barcodePlaceholder: "امسح، أدخل، أو ولّد",
    generate: "توليد",
    imageTitle: "صورة المنتج",
    imageSubtitle: "اختياري. ارفع ملفًا أو الصق رابط صورة مباشر (JPG أو PNG أو WebP).",
    imageUrlPlaceholder: "https://...",
    uploadImage: "رفع",
    removeImage: "إزالة الصورة",
    inventoryTitle: "إعدادات المخزون",
    inventorySubtitle: "كيف يُحصى هذا المنتج ويُعاد تعبئته.",
    trackStock: "تتبع المخزون لهذا المنتج",
    soldByWeight: "يُباع بالوزن (ميزان متصل)",
    trackBatches: "تتبع الدفعات / أرقام التشغيلة",
    trackExpiry: "تتبع تاريخ الانتهاء",
    expiryDate: "تاريخ الانتهاء",
    expiryDateHint: "تاريخ الانتهاء الافتراضي لهذا المنتج.",
    reorderAt: "حد إعادة الطلب",
    reorderAtHint: "عندما ينخفض المخزون المتاح لهذا الرقم، يُعلَّم كمنخفض.",
    reorderQuantity: "كمية إعادة الطلب",
    reorderQuantityHint: "عدد الوحدات المطلوب طلبها في كل مرة يُصل فيها حد إعادة الطلب.",
    pricingTitle: "التكلفة والهامش",
    pricingSubtitle: "اختياري — لتتبع الربح فقط، لا يؤثر على سعر البيع.",
    costPrice: "التكلفة",
    mrp: "السعر الأقصى المقترح",
    margin: "الهامش",
    markup: "نسبة الزيادة",
    profitPerUnit: "الربح / الوحدة",
    priceIncludesTax: "سعر البيع يشمل الضريبة بالفعل",
    complianceTitle: "الامتثال",
    complianceSubtitle: "اختياري — رموز ضريبية، تصنيفات دوائية، بيانات الشركة المصنّعة.",
    hsnCode: "رمز HSN / الرمز الضريبي",
    drugSchedule: "التصنيف الدوائي",
    genericName: "الاسم العلمي",
    manufacturer: "الشركة المصنّعة",
    errors: {
      nameEn: "اسم المنتج بالإنجليزية مطلوب",
      category: "الفئة مطلوبة",
      unit: "اختر وحدة",
      price: "أدخل سعرًا صحيحًا",
    },
    createdToast: (name: string) => `تم إنشاء "${name}"`,
    fixErrors: "صحّح الحقول المطلوبة المظلّلة",
  },
};

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
  shortDescription: "",
  availableForSale: true,
  featured: false,
  trackStock: true,
  soldByWeight: false,
  trackBatches: false,
  trackExpiry: false,
  expiryDate: "",
  reorderAt: "",
  reorderQuantity: "",
  costPrice: "",
  mrp: "",
  priceIncludesTax: false,
  hsnCode: "",
  drugSchedule: "NOT_SCHEDULED",
  genericName: "",
  manufacturer: "",
};

export function ProductFormPreviewV2({
  categories,
  units,
  taxes,
}: {
  categories: string[];
  units: string[];
  taxes: TaxOption[];
}) {
  const { locale } = useDictionary();
  const dir = locale === "ar" ? "rtl" : "ltr";
  const s = STRINGS[locale];

  const [tab, setTab] = useState<Tab>("general");
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const unitOptions = Array.from(new Set([...COMMON_UNITS, ...units])).sort();
  const effectiveUnit = form.unit === "__other__" ? form.customUnit : form.unit;

  const priceNum = Number(form.price) || 0;
  const costNum = Number(form.costPrice) || 0;
  const profitPerUnit = priceNum - costNum;
  const marginPct = priceNum > 0 ? (profitPerUnit / priceNum) * 100 : 0;
  const markupPct = costNum > 0 ? (profitPerUnit / costNum) * 100 : null;

  function validate() {
    const next: Record<string, string> = {};
    if (!form.nameEn.trim()) next.nameEn = s.errors.nameEn;
    if (!form.category.trim()) next.category = s.errors.category;
    if (!effectiveUnit.trim()) next.unit = s.errors.unit;
    if (!form.price || !Number.isFinite(priceNum) || priceNum < 0) next.price = s.errors.price;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleCreate() {
    if (submitting) return;
    if (!validate()) {
      toast.error(s.fixErrors);
      setTab("general");
      return;
    }
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitting(false);
    toast.success(s.createdToast(form.nameEn));
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
      <div className="rounded-lg border border-warning/30 bg-warning/10 px-4 py-2.5 text-xs text-warning">
        {s.previewBanner}
      </div>

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
            <h1 className="text-2xl font-semibold tracking-tight">{s.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{s.subtitle}</p>
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

      {/* Tab bar */}
      <div className="flex gap-5 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={
              tab === t
                ? "border-b-2 border-primary pb-2.5 text-sm font-semibold text-primary"
                : "border-b-2 border-transparent pb-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {s.tabs[t]}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <>
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

          <Card>
            <CardHeader>
              <CardTitle>{s.statusTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <label className="flex items-start gap-2.5">
                <Checkbox
                  checked={form.availableForSale}
                  onCheckedChange={(v) => set("availableForSale", v === true)}
                />
                <span>
                  <span className="block text-sm font-medium">{s.availableForSale}</span>
                  <span className="block text-xs text-muted-foreground">{s.availableForSaleHint}</span>
                </span>
              </label>
              <label className="flex items-start gap-2.5">
                <Checkbox
                  checked={form.featured}
                  onCheckedChange={(v) => set("featured", v === true)}
                />
                <span>
                  <span className="block text-sm font-medium">{s.featured}</span>
                  <span className="block text-xs text-muted-foreground">{s.featuredHint}</span>
                </span>
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{s.shortDescTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{s.shortDescSubtitle}</p>
            </CardHeader>
            <CardContent>
              <Input
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                placeholder={s.shortDescPlaceholder}
                dir={dir}
              />
            </CardContent>
          </Card>

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
                  <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={generateSku} aria-label={s.generate}>
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
                  <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={generateBarcode} aria-label={s.generate}>
                    <RefreshCw className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{s.imageTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{s.imageSubtitle}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start">
              {form.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- preview thumbnail for a pasted URL.
                <img src={form.imageUrl} alt="" className="size-20 shrink-0 rounded-md border border-border object-cover" />
              ) : (
                <div className="flex size-20 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted text-muted-foreground">
                  <ImageOff className="size-6" />
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex gap-1.5">
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => set("imageUrl", e.target.value)}
                    placeholder={s.imageUrlPlaceholder}
                    dir="ltr"
                  />
                  <Button type="button" variant="outline" className="shrink-0">
                    <Upload className="size-4" /> {s.uploadImage}
                  </Button>
                </div>
                {form.imageUrl && (
                  <Button type="button" variant="ghost" size="sm" className="w-fit text-destructive hover:text-destructive" onClick={() => set("imageUrl", "")}>
                    <X className="size-3.5" /> {s.removeImage}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "inventory" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{s.inventoryTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{s.inventorySubtitle}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <label className="flex items-center gap-2.5">
                <Checkbox checked={form.trackStock} onCheckedChange={(v) => set("trackStock", v === true)} />
                <span className="text-sm font-medium">{s.trackStock}</span>
              </label>
              <label className="flex items-center gap-2.5">
                <Checkbox checked={form.soldByWeight} onCheckedChange={(v) => set("soldByWeight", v === true)} />
                <span className="text-sm font-medium">{s.soldByWeight}</span>
              </label>
              <label className="flex items-center gap-2.5">
                <Checkbox checked={form.trackBatches} onCheckedChange={(v) => set("trackBatches", v === true)} />
                <span className="text-sm font-medium">{s.trackBatches}</span>
              </label>
              <label className="flex items-center gap-2.5">
                <Checkbox checked={form.trackExpiry} onCheckedChange={(v) => set("trackExpiry", v === true)} />
                <span className="text-sm font-medium">{s.trackExpiry}</span>
              </label>

              <div className="mt-2 flex flex-col gap-1.5">
                <Label htmlFor="pf-expiry">{s.expiryDate}</Label>
                <Input id="pf-expiry" type="date" value={form.expiryDate} onChange={(e) => set("expiryDate", e.target.value)} className="max-w-xs" />
                <p className="text-xs text-muted-foreground">{s.expiryDateHint}</p>
              </div>

              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pf-reorder-at">{s.reorderAt}</Label>
                  <Input id="pf-reorder-at" type="number" min={0} value={form.reorderAt} onChange={(e) => set("reorderAt", e.target.value)} />
                  <p className="text-xs text-muted-foreground">{s.reorderAtHint}</p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pf-reorder-qty">{s.reorderQuantity}</Label>
                  <Input id="pf-reorder-qty" type="number" min={0} value={form.reorderQuantity} onChange={(e) => set("reorderQuantity", e.target.value)} />
                  <p className="text-xs text-muted-foreground">{s.reorderQuantityHint}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "pricing" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{s.pricingTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{s.pricingSubtitle}</p>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pf-cost">{s.costPrice}</Label>
                  <Input id="pf-cost" type="number" min={0} step="0.001" value={form.costPrice} onChange={(e) => set("costPrice", e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="pf-mrp">{s.mrp}</Label>
                  <Input id="pf-mrp" type="number" min={0} step="0.001" value={form.mrp} onChange={(e) => set("mrp", e.target.value)} />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{s.margin}</div>
                  <div className="text-sm font-semibold">{costNum > 0 || priceNum > 0 ? `${marginPct.toFixed(0)}%` : "—"}</div>
                </div>
                <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{s.markup}</div>
                  <div className="text-sm font-semibold">{markupPct === null ? "∞" : `${markupPct.toFixed(0)}%`}</div>
                </div>
                <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                  <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{s.profitPerUnit}</div>
                  <div className="text-sm font-semibold">{formatCurrency(profitPerUnit, locale)}</div>
                </div>
              </div>

              <label className="flex items-center gap-2.5">
                <Checkbox checked={form.priceIncludesTax} onCheckedChange={(v) => set("priceIncludesTax", v === true)} />
                <span className="text-sm font-medium">{s.priceIncludesTax}</span>
              </label>
            </CardContent>
          </Card>
        </>
      )}

      {tab === "compliance" && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{s.complianceTitle}</CardTitle>
              <p className="text-sm text-muted-foreground">{s.complianceSubtitle}</p>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-hsn">{s.hsnCode}</Label>
                <Input id="pf-hsn" value={form.hsnCode} onChange={(e) => set("hsnCode", e.target.value)} dir="ltr" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-drug-schedule">{s.drugSchedule}</Label>
                <Select value={form.drugSchedule} onValueChange={(v) => set("drugSchedule", v)}>
                  <SelectTrigger id="pf-drug-schedule">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DRUG_SCHEDULE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {locale === "ar" ? opt.ar : opt.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-generic-name">{s.genericName}</Label>
                <Input id="pf-generic-name" value={form.genericName} onChange={(e) => set("genericName", e.target.value)} dir={dir} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-manufacturer">{s.manufacturer}</Label>
                <Input id="pf-manufacturer" value={form.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} dir={dir} />
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
