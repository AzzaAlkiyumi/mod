"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { CustomerSelector, type CustomerOption } from "@/components/quotation/customer-selector";
import { QuotationItems } from "@/components/quotation/quotation-items";
import type { DraftItem } from "@/components/quotation/quotation-item-row";
import { QuotationSummary } from "@/components/quotation/quotation-summary";
import { useDictionary } from "@/i18n/dictionary-context";
import type { ProductWithTax } from "@/lib/types";

const DIAL_CODES = [
  { code: "+1", label: "+1" },
  { code: "+44", label: "+44" },
  { code: "+91", label: "+91" },
  { code: "+94", label: "+94" },
  { code: "+971", label: "+971" },
  { code: "+252", label: "+252" },
];

interface StoreOption {
  id: string;
  name: string;
}

export interface QuotationFormInitialData {
  id: string;
  number: string;
  storeId: string;
  customer: CustomerOption | null;
  prospectName: string | null;
  prospectEmail: string | null;
  prospectPhone: string | null;
  billingAddress: string | null;
  shippingAddress: string | null;
  issueDate: string;
  validUntil: string | null;
  expectedDeliveryDate: string | null;
  termsAndConditions: string | null;
  customerNotes: string | null;
  items: DraftItem[];
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function splitPhone(phone: string | null | undefined) {
  const found = DIAL_CODES.find((d) => phone?.startsWith(d.code));
  if (found) return { dial: found.code, rest: phone!.slice(found.code.length).trim() };
  return { dial: "+1", rest: phone ?? "" };
}

export function QuotationForm({ initial }: { initial?: QuotationFormInitialData }) {
  const router = useRouter();
  const { t } = useDictionary();
  const isEdit = Boolean(initial);

  const [stores, setStores] = useState<StoreOption[]>([]);
  const [storeId, setStoreId] = useState(initial?.storeId ?? "");
  const [customer, setCustomer] = useState<CustomerOption | null>(initial?.customer ?? null);

  const [issueDate, setIssueDate] = useState(initial?.issueDate?.slice(0, 10) ?? todayISO());
  const [validUntil, setValidUntil] = useState(initial?.validUntil?.slice(0, 10) ?? "");
  const [prospectName, setProspectName] = useState(initial?.prospectName ?? "");
  const [prospectEmail, setProspectEmail] = useState(initial?.prospectEmail ?? "");
  const initialPhone = splitPhone(initial?.prospectPhone);
  const [dialCode, setDialCode] = useState(initialPhone.dial);
  const [phoneRest, setPhoneRest] = useState(initialPhone.rest);
  const [billingAddress, setBillingAddress] = useState(initial?.billingAddress ?? "");
  const [shippingAddress, setShippingAddress] = useState(initial?.shippingAddress ?? "");

  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(
    initial?.expectedDeliveryDate?.slice(0, 10) ?? "",
  );
  const [termsAndConditions, setTermsAndConditions] = useState(initial?.termsAndConditions ?? "");
  const [customerNotes, setCustomerNotes] = useState(initial?.customerNotes ?? "");

  const [items, setItems] = useState<DraftItem[]>(initial?.items ?? []);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [totals, setTotals] = useState({ subtotal: 0, discountTotal: 0, taxTotal: 0, total: 0 });
  const [totalsPending, setTotalsPending] = useState(false);

  useEffect(() => {
    fetch("/api/stores")
      .then((r) => r.json())
      .then((json) => {
        setStores(json.data ?? []);
        if (!storeId && json.data?.[0]) setStoreId(json.data[0].id);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recompute totals on the server whenever items/customer discount changes.
  const totalsRequestId = useRef(0);
  useEffect(() => {
    const requestId = ++totalsRequestId.current;
    const timeout = setTimeout(async () => {
      if (requestId !== totalsRequestId.current) return;
      setTotalsPending(true);
      const res = await fetch("/api/quotations/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discountType: customer?.discountType ?? "FIXED",
          discountValue: customer?.discountValue ?? 0,
          items: items.map((i) => ({
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            discountType: i.discountType,
            discountValue: i.discountValue,
            taxRate: i.taxRate,
          })),
        }),
      });
      const json = await res.json();
      if (requestId === totalsRequestId.current) {
        if (json.data) setTotals(json.data);
        setTotalsPending(false);
      }
    }, 150);
    return () => clearTimeout(timeout);
  }, [items, customer]);

  function handleSelectCustomer(next: CustomerOption | null) {
    setCustomer(next);
    if (next) {
      setBillingAddress((prev) => prev || next.billingAddress || "");
      setShippingAddress((prev) => prev || next.shippingAddress || "");
    }
  }

  function handleAddProduct(product: ProductWithTax) {
    if (items.some((i) => i.productId === product.id)) {
      toast.error(t.form.items.duplicateToast(product.name));
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unit: product.unit,
        imageUrl: product.imageUrl,
        unitPrice: Number(product.price),
        taxRate: product.tax ? Number(product.tax.rate) : 0,
        quantity: 1,
        discountType: "FIXED",
        discountValue: 0,
      },
    ]);
  }

  const itemErrors = useMemo(() => {
    const out: Record<string, string> = {};
    for (const item of items) {
      if (!(item.quantity > 0)) out[item.productId] = t.form.errors.quantityPositive;
      else if (item.discountType === "PERCENT" && (item.discountValue < 0 || item.discountValue > 100)) {
        out[item.productId] = t.form.errors.discountPercentRange;
      } else if (item.discountValue < 0) {
        out[item.productId] = t.form.errors.discountNegative;
      }
    }
    return out;
  }, [items, t]);

  async function handleSave() {
    const fieldErrors: Record<string, string> = {};
    if (!storeId) fieldErrors.storeId = t.form.errors.storeRequired;
    if (!issueDate) fieldErrors.issueDate = t.form.errors.issueDateRequired;
    if (!customer && !prospectName.trim()) {
      fieldErrors.prospectName = t.form.errors.prospectOrCustomerRequired;
    }
    if (validUntil && issueDate && validUntil < issueDate) {
      fieldErrors.validUntil = t.form.errors.validUntilBeforeIssue;
    }
    if (items.length === 0) {
      fieldErrors.items = t.form.errors.itemsRequired;
    }
    if (Object.keys(itemErrors).length > 0) {
      fieldErrors.items = t.form.errors.itemsHaveErrors;
    }

    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      toast.error(t.form.errors.fixHighlighted);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        storeId,
        customerId: customer?.id ?? null,
        prospectName: customer ? undefined : prospectName,
        prospectEmail: customer ? undefined : prospectEmail || undefined,
        prospectPhone: customer ? undefined : phoneRest ? `${dialCode} ${phoneRest}` : undefined,
        billingAddress: billingAddress || undefined,
        shippingAddress: shippingAddress || undefined,
        issueDate,
        validUntil: validUntil || undefined,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        termsAndConditions: termsAndConditions || undefined,
        customerNotes: customerNotes || undefined,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discountType: i.discountType,
          discountValue: i.discountValue,
          taxRate: i.taxRate,
        })),
      };

      const res = await fetch(isEdit ? `/api/quotations/${initial!.id}` : "/api/quotations", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        const fieldErrorList = Object.values(
          (json?.error?.fieldErrors ?? {}) as Record<string, string[]>,
        )[0];
        const message =
          json?.error?.formErrors?.[0] ?? fieldErrorList?.[0] ?? t.form.errors.saveFailed;
        throw new Error(message);
      }
      toast.success(
        isEdit ? t.form.toasts.updated : t.form.toasts.savedAsDraft(json.data.number),
      );
      router.push(`/admin/quotations/${json.data.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.form.errors.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href="/admin/quotations"
            className="mt-1 flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            aria-label={t.common.backToQuotations}
          >
            <ArrowLeft className="size-4 rtl:-scale-x-100" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? t.form.editTitle(initial!.number) : t.form.newTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit ? t.form.editSubtitle : t.form.newSubtitle}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" asChild>
            <Link href="/admin/quotations">{t.common.discard}</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              t.form.saving
            ) : (
              <>
                <Check /> {t.form.saveDraft}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-info/20 bg-info/5 p-4 text-sm text-info">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>{t.form.infoBanner}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t.form.details.title}</CardTitle>
              <CardDescription>{t.form.details.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="storeId">{t.form.details.store}</Label>
                <Select value={storeId} onValueChange={setStoreId}>
                  <SelectTrigger id="storeId" aria-invalid={Boolean(errors.storeId)}>
                    <SelectValue placeholder={t.form.details.selectStore} />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.storeId && <p className="text-xs text-destructive">{errors.storeId}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label>{t.form.details.existingCustomer}</Label>
                <CustomerSelector value={customer} onChange={handleSelectCustomer} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="issueDate">{t.form.details.issueDate}</Label>
                <Input
                  id="issueDate"
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  aria-invalid={Boolean(errors.issueDate)}
                />
                {errors.issueDate && <p className="text-xs text-destructive">{errors.issueDate}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="validUntil">{t.form.details.validUntil}</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  aria-invalid={Boolean(errors.validUntil)}
                />
                {errors.validUntil && (
                  <p className="text-xs text-destructive">{errors.validUntil}</p>
                )}
              </div>

              {!customer && (
                <>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="prospectName">{t.form.details.prospectName}</Label>
                    <Input
                      id="prospectName"
                      value={prospectName}
                      onChange={(e) => setProspectName(e.target.value)}
                      aria-invalid={Boolean(errors.prospectName)}
                    />
                    {errors.prospectName && (
                      <p className="text-xs text-destructive">{errors.prospectName}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="prospectEmail">{t.form.details.email}</Label>
                    <Input
                      id="prospectEmail"
                      type="email"
                      value={prospectEmail}
                      onChange={(e) => setProspectEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="prospectPhone">{t.form.details.phone}</Label>
                    <div className="flex gap-1.5">
                      <Select value={dialCode} onValueChange={setDialCode}>
                        <SelectTrigger
                          className="w-20 shrink-0 px-2"
                          aria-label={t.form.details.countryCode}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DIAL_CODES.map((d) => (
                            <SelectItem key={d.code} value={d.code}>
                              {d.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        id="prospectPhone"
                        value={phoneRest}
                        onChange={(e) => setPhoneRest(e.target.value)}
                        placeholder="201-555-0123"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="billingAddress">{t.form.details.billingAddress}</Label>
                <Textarea
                  id="billingAddress"
                  rows={3}
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="shippingAddress">{t.form.details.shippingAddress}</Label>
                <Textarea
                  id="shippingAddress"
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <QuotationItems
            items={items}
            itemErrors={itemErrors}
            formError={errors.items}
            onAdd={handleAddProduct}
            onChange={(idx, next) =>
              setItems((prev) => prev.map((it, i) => (i === idx ? next : it)))
            }
            onRemove={(idx) => setItems((prev) => prev.filter((_, i) => i !== idx))}
          />

          <Card>
            <CardHeader>
              <CardTitle>{t.form.delivery.title}</CardTitle>
              <CardDescription>{t.form.delivery.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 sm:w-64">
                <Label htmlFor="expectedDeliveryDate">
                  {t.form.delivery.expectedDeliveryDate}
                </Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="termsAndConditions">{t.form.delivery.termsAndConditions}</Label>
                <Textarea
                  id="termsAndConditions"
                  rows={4}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="customerNotes">{t.form.delivery.customerNotes}</Label>
                <Textarea
                  id="customerNotes"
                  rows={3}
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <QuotationSummary {...totals} pending={totalsPending} />
        </div>
      </div>
    </div>
  );
}
