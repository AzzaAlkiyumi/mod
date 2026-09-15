import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { api, apiErrorMessage } from "@/lib/api";

const TABS = ["general", "inventory", "pricing", "compliance"] as const;
type Tab = (typeof TABS)[number];

interface TaxOption {
  id: string;
  name: string;
  rate: number;
}

interface NamedOption {
  id: string;
  name: string;
}

/** Shape of a product as returned by the API (Product model JSON: numeric
 * fields already come back as native numbers/strings, not Prisma Decimal). */
export interface EditableProduct {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  nameAr: string | null;
  price: number;
  taxId: string | null;
  unitId: string;
  categoryId: string | null;
  brandId: string | null;
  imageUrl: string | null;
  descriptionEn: string | null;
  descriptionAr: string | null;
  shortDescription: string | null;
  availableForSale: boolean;
  featured: boolean;
  trackStock: boolean;
  soldByWeight: boolean;
  trackBatches: boolean;
  trackExpiry: boolean;
  expiryDate: string | null;
  reorderAt: number | null;
  reorderQuantity: number | null;
  costPrice: number | null;
  mrp: number | null;
  priceIncludesTax: boolean;
  hsnCode: string | null;
  drugScheduleId: string | null;
  genericName: string | null;
  manufacturer: string | null;
}

const emptyForm = {
  nameEn: "",
  nameAr: "",
  categoryId: "",
  unitId: "",
  brandId: "",
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
  drugScheduleId: "",
  genericName: "",
  manufacturer: "",
};

function productToForm(product: EditableProduct): typeof emptyForm {
  return {
    nameEn: product.name,
    nameAr: product.nameAr ?? "",
    categoryId: product.categoryId ?? "",
    unitId: product.unitId,
    brandId: product.brandId ?? "",
    price: String(product.price),
    taxId: product.taxId ?? "",
    descriptionEn: product.descriptionEn ?? "",
    descriptionAr: product.descriptionAr ?? "",
    sku: product.sku,
    barcode: product.barcode ?? "",
    imageUrl: product.imageUrl ?? "",
    shortDescription: product.shortDescription ?? "",
    availableForSale: product.availableForSale,
    featured: product.featured,
    trackStock: product.trackStock,
    soldByWeight: product.soldByWeight,
    trackBatches: product.trackBatches,
    trackExpiry: product.trackExpiry,
    expiryDate: product.expiryDate ? product.expiryDate.slice(0, 10) : "",
    reorderAt: product.reorderAt !== null ? String(product.reorderAt) : "",
    reorderQuantity: product.reorderQuantity !== null ? String(product.reorderQuantity) : "",
    costPrice: product.costPrice !== null ? String(product.costPrice) : "",
    mrp: product.mrp !== null ? String(product.mrp) : "",
    priceIncludesTax: product.priceIncludesTax,
    hsnCode: product.hsnCode ?? "",
    drugScheduleId: product.drugScheduleId ?? "",
    genericName: product.genericName ?? "",
    manufacturer: product.manufacturer ?? "",
  };
}

export function ProductForm({
  categories,
  units,
  brands,
  taxes,
  drugSchedules,
  product,
}: {
  categories: NamedOption[];
  units: NamedOption[];
  brands: NamedOption[];
  taxes: TaxOption[];
  drugSchedules: NamedOption[];
  /** When provided, the form edits this existing product (PATCH) instead of
   * creating a new one (POST). */
  product?: EditableProduct;
}) {
  const navigate = useNavigate();
  const { t, locale } = useDictionary();
  const s = t.products.form;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isEdit = Boolean(product);
  const initialForm = product ? productToForm(product) : emptyForm;

  const [tab, setTab] = useState<Tab>("general");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const priceNum = Number(form.price) || 0;
  const costNum = Number(form.costPrice) || 0;
  const profitPerUnit = priceNum - costNum;
  const marginPct = priceNum > 0 ? (profitPerUnit / priceNum) * 100 : 0;
  const markupPct = costNum > 0 ? (profitPerUnit / costNum) * 100 : null;

  function validate() {
    const next: Record<string, string> = {};
    if (!form.nameEn.trim()) next.nameEn = s.errors.nameEn;
    if (!form.categoryId) next.categoryId = s.errors.category;
    if (!form.unitId) next.unitId = s.errors.unit;
    if (!form.price || !Number.isFinite(priceNum) || priceNum < 0) next.price = s.errors.price;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit() {
    if (submitting) return;
    if (!validate()) {
      toast.error(s.fixErrors);
      setTab("general");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.nameEn.trim(),
        nameAr: form.nameAr.trim() || undefined,
        categoryId: form.categoryId,
        unitId: form.unitId,
        brandId: form.brandId || undefined,
        price: form.price,
        taxId: form.taxId || undefined,
        sku: form.sku.trim() || undefined,
        barcode: form.barcode.trim() || undefined,
        descriptionEn: form.descriptionEn.trim() || undefined,
        descriptionAr: form.descriptionAr.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
        shortDescription: form.shortDescription.trim() || undefined,
        availableForSale: form.availableForSale,
        featured: form.featured,
        trackStock: form.trackStock,
        soldByWeight: form.soldByWeight,
        trackBatches: form.trackBatches,
        trackExpiry: form.trackExpiry,
        expiryDate: form.expiryDate || undefined,
        reorderAt: form.reorderAt || undefined,
        reorderQuantity: form.reorderQuantity || undefined,
        costPrice: form.costPrice || undefined,
        mrp: form.mrp || undefined,
        priceIncludesTax: form.priceIncludesTax,
        hsnCode: form.hsnCode.trim() || undefined,
        drugScheduleId: form.drugScheduleId || undefined,
        genericName: form.genericName.trim() || undefined,
        manufacturer: form.manufacturer.trim() || undefined,
      };
      const res = isEdit
        ? await api.patch(`/products/${product!.id}`, payload)
        : await api.post("/products", payload);
      toast.success(isEdit ? s.updatedToast(res.data.data.name) : s.createdToast(res.data.data.name));
      navigate("/admin/products");
    } catch (err) {
      toast.error(apiErrorMessage(err, isEdit ? s.updateFailed : s.createFailed));
    } finally {
      setSubmitting(false);
    }
  }

  function handleDiscard() {
    setForm(initialForm);
    setErrors({});
    toast.info(isEdit ? s.resetToast : s.discardedToast);
  }

  function generateSku() {
    set("sku", `PRD-${Date.now().toString().slice(-6)}`);
  }

  function generateBarcode() {
    const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join("");
    set("barcode", digits);
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await api.post("/uploads/products", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set("imageUrl", res.data.data.url);
    } catch (err) {
      toast.error(apiErrorMessage(err, s.uploadFailed));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div dir={dir} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            to="/admin/products"
            className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            aria-label={s.back}
          >
            <ArrowLeft className={dir === "rtl" ? "size-4 -scale-x-100" : "size-4"} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? s.editTitle : s.newTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit ? s.editSubtitle : s.newSubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={handleDiscard} disabled={submitting}>
            {s.discard}
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? (isEdit ? s.saving : s.creating) : isEdit ? s.saveChanges : s.create}
          </Button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-5 border-b border-border">
        {TABS.map((tb) => (
          <button
            key={tb}
            type="button"
            onClick={() => setTab(tb)}
            className={
              tab === tb
                ? "border-b-2 border-primary pb-2.5 text-sm font-semibold text-primary"
                : "border-b-2 border-transparent pb-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {s.tabs[tb]}
          </button>
        ))}
      </div>

      {tab === "general" && (
        <>
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
                <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
                  <SelectTrigger id="pf-category" aria-invalid={Boolean(errors.categoryId)}>
                    <SelectValue placeholder={s.categoryPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && (
                  <p className="text-xs text-destructive">{errors.categoryId}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-unit">
                  {s.unit} <span className="text-destructive">*</span>
                </Label>
                <Select value={form.unitId} onValueChange={(v) => set("unitId", v)}>
                  <SelectTrigger id="pf-unit" aria-invalid={Boolean(errors.unitId)}>
                    <SelectValue placeholder={s.unitPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {units.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.unitId ? (
                  <p className="text-xs text-destructive">{errors.unitId}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">{s.unitHint}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-brand">{s.brand}</Label>
                <Select value={form.brandId} onValueChange={(v) => set("brandId", v)}>
                  <SelectTrigger id="pf-brand">
                    <SelectValue placeholder={s.brandNone} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{s.brandNone}</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                    {taxes.map((tx) => (
                      <SelectItem key={tx.id} value={tx.id}>
                        {tx.name} ({tx.rate}%)
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
                <Checkbox checked={form.featured} onCheckedChange={(v) => set("featured", v === true)} />
                <span>
                  <span className="block text-sm font-medium">{s.featured}</span>
                  <span className="block text-xs text-muted-foreground">{s.featuredHint}</span>
                </span>
              </label>
            </CardContent>
          </Card>

          {/* Short description */}
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
                <div className="flex gap-1.5">
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => set("imageUrl", e.target.value)}
                    placeholder={s.imageUrlPlaceholder}
                    dir="ltr"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileSelected}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                    {uploading ? s.uploading : s.uploadImage}
                  </Button>
                </div>
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
        </>
      )}

      {tab === "inventory" && (
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
              <Checkbox
                checked={form.soldByWeight}
                onCheckedChange={(v) => set("soldByWeight", v === true)}
              />
              <span className="text-sm font-medium">{s.soldByWeight}</span>
            </label>
            <label className="flex items-center gap-2.5">
              <Checkbox
                checked={form.trackBatches}
                onCheckedChange={(v) => set("trackBatches", v === true)}
              />
              <span className="text-sm font-medium">{s.trackBatches}</span>
            </label>
            <label className="flex items-center gap-2.5">
              <Checkbox
                checked={form.trackExpiry}
                onCheckedChange={(v) => set("trackExpiry", v === true)}
              />
              <span className="text-sm font-medium">{s.trackExpiry}</span>
            </label>

            <div className="mt-2 flex flex-col gap-1.5">
              <Label htmlFor="pf-expiry">{s.expiryDate}</Label>
              <Input
                id="pf-expiry"
                type="date"
                value={form.expiryDate}
                onChange={(e) => set("expiryDate", e.target.value)}
                className="max-w-xs"
              />
              <p className="text-xs text-muted-foreground">{s.expiryDateHint}</p>
            </div>

            <div className="mt-2 grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-reorder-at">{s.reorderAt}</Label>
                <Input
                  id="pf-reorder-at"
                  type="number"
                  min={0}
                  value={form.reorderAt}
                  onChange={(e) => set("reorderAt", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{s.reorderAtHint}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-reorder-qty">{s.reorderQuantity}</Label>
                <Input
                  id="pf-reorder-qty"
                  type="number"
                  min={0}
                  value={form.reorderQuantity}
                  onChange={(e) => set("reorderQuantity", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">{s.reorderQuantityHint}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "pricing" && (
        <Card>
          <CardHeader>
            <CardTitle>{s.pricingTitle}</CardTitle>
            <p className="text-sm text-muted-foreground">{s.pricingSubtitle}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-cost">{s.costPrice}</Label>
                <Input
                  id="pf-cost"
                  type="number"
                  min={0}
                  step="0.001"
                  value={form.costPrice}
                  onChange={(e) => set("costPrice", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="pf-mrp">{s.mrp}</Label>
                <Input
                  id="pf-mrp"
                  type="number"
                  min={0}
                  step="0.001"
                  value={form.mrp}
                  onChange={(e) => set("mrp", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {s.margin}
                </div>
                <div className="text-sm font-semibold">
                  {costNum > 0 || priceNum > 0 ? `${marginPct.toFixed(0)}%` : "—"}
                </div>
              </div>
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {s.markup}
                </div>
                <div className="text-sm font-semibold">
                  {markupPct === null ? "∞" : `${markupPct.toFixed(0)}%`}
                </div>
              </div>
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {s.profitPerUnit}
                </div>
                <div className="text-sm font-semibold">{formatCurrency(profitPerUnit, locale)}</div>
              </div>
            </div>

            <label className="flex items-center gap-2.5">
              <Checkbox
                checked={form.priceIncludesTax}
                onCheckedChange={(v) => set("priceIncludesTax", v === true)}
              />
              <span className="text-sm font-medium">{s.priceIncludesTax}</span>
            </label>
          </CardContent>
        </Card>
      )}

      {tab === "compliance" && (
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
              <Select
                value={form.drugScheduleId}
                onValueChange={(v) => set("drugScheduleId", v)}
              >
                <SelectTrigger id="pf-drug-schedule">
                  <SelectValue placeholder={s.drugScheduleNone} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{s.drugScheduleNone}</SelectItem>
                  {drugSchedules.map((ds) => (
                    <SelectItem key={ds.id} value={ds.id}>
                      {ds.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pf-generic-name">{s.genericName}</Label>
              <Input
                id="pf-generic-name"
                value={form.genericName}
                onChange={(e) => set("genericName", e.target.value)}
                dir={dir}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pf-manufacturer">{s.manufacturer}</Label>
              <Input
                id="pf-manufacturer"
                value={form.manufacturer}
                onChange={(e) => set("manufacturer", e.target.value)}
                dir={dir}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
