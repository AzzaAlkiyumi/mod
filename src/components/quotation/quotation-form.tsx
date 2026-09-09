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
      toast.error(`${product.name} is already on this quotation — adjust the quantity instead`);
      return;
    }
    setItems((prev) => [
      ...prev,
      {
        productId: product.id,
        name: product.name,
        sku: product.sku,
        unit: product.unit,
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
      if (!(item.quantity > 0)) out[item.productId] = "Quantity must be greater than 0";
      else if (item.discountType === "PERCENT" && (item.discountValue < 0 || item.discountValue > 100)) {
        out[item.productId] = "Percentage discount must be between 0 and 100";
      } else if (item.discountValue < 0) {
        out[item.productId] = "Discount cannot be negative";
      }
    }
    return out;
  }, [items]);

  async function handleSave() {
    const fieldErrors: Record<string, string> = {};
    if (!storeId) fieldErrors.storeId = "Store is required";
    if (!issueDate) fieldErrors.issueDate = "Issue date is required";
    if (!customer && !prospectName.trim()) {
      fieldErrors.prospectName = "Select an existing customer or enter a prospect name";
    }
    if (validUntil && issueDate && validUntil < issueDate) {
      fieldErrors.validUntil = "Valid until must be on or after the issue date";
    }
    if (items.length === 0) {
      fieldErrors.items = "Add at least one product to prepare the quotation";
    }
    if (Object.keys(itemErrors).length > 0) {
      fieldErrors.items = "Fix the highlighted items before saving";
    }

    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) {
      toast.error("Please fix the highlighted fields");
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
          json?.error?.formErrors?.[0] ?? fieldErrorList?.[0] ?? "Failed to save quotation";
        throw new Error(message);
      }
      toast.success(isEdit ? "Quotation updated" : `${json.data.number} saved as draft`);
      router.push(`/admin/quotations/${json.data.id}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save quotation");
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
            aria-label="Back to quotations"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? `Edit ${initial!.number}` : "New quotation"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit
                ? "Update customer, items, or delivery details for this quotation."
                : "Build a formal offer using the same product pricing and tax rules as a sale."}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" asChild>
            <Link href="/admin/quotations">Discard</Link>
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : (
              <>
                <Check /> Save draft
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-info/20 bg-info/5 p-4 text-sm text-info">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>A quotation does not reserve or deduct stock. Availability is checked when it is converted to a sale.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quotation details</CardTitle>
              <CardDescription>
                Store, customer or prospect, document dates, and delivery addresses.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="storeId">Store *</Label>
                <Select value={storeId} onValueChange={setStoreId}>
                  <SelectTrigger id="storeId" aria-invalid={Boolean(errors.storeId)}>
                    <SelectValue placeholder="Select a store" />
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
                <Label>Existing customer</Label>
                <CustomerSelector value={customer} onChange={handleSelectCustomer} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="issueDate">Issue date *</Label>
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
                <Label htmlFor="validUntil">Valid until</Label>
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
                    <Label htmlFor="prospectName">Prospect name *</Label>
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
                    <Label htmlFor="prospectEmail">Email</Label>
                    <Input
                      id="prospectEmail"
                      type="email"
                      value={prospectEmail}
                      onChange={(e) => setProspectEmail(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="prospectPhone">Phone</Label>
                    <div className="flex gap-1.5">
                      <Select value={dialCode} onValueChange={setDialCode}>
                        <SelectTrigger className="w-20 shrink-0 px-2" aria-label="Country code">
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
                <Label htmlFor="billingAddress">Billing address</Label>
                <Textarea
                  id="billingAddress"
                  rows={3}
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="shippingAddress">Shipping address</Label>
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
              <CardTitle>Delivery, terms, and notes</CardTitle>
              <CardDescription>Customer-facing conditions plus private staff notes.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 sm:w-64">
                <Label htmlFor="expectedDeliveryDate">Expected delivery date</Label>
                <Input
                  id="expectedDeliveryDate"
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="termsAndConditions">Terms and conditions</Label>
                <Textarea
                  id="termsAndConditions"
                  rows={4}
                  value={termsAndConditions}
                  onChange={(e) => setTermsAndConditions(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="customerNotes">Customer notes</Label>
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
