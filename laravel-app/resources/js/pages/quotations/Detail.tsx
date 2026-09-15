import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";

import { QuotationDetailView } from "@/components/quotation/quotation-detail-view";
import { QuotationForm, type QuotationFormInitialData } from "@/components/quotation/quotation-form";
import { isEditable } from "@/lib/quotation-rules";
import { useDictionary } from "@/i18n/dictionary-context";
import { api } from "@/lib/api";
import type { QuotationDetail } from "@/types/quotation";

function toFormInitialData(quotation: QuotationDetail): QuotationFormInitialData {
  return {
    id: quotation.id,
    number: quotation.number,
    storeId: quotation.store.id,
    customer: quotation.customer
      ? {
          id: quotation.customer.id,
          code: quotation.customer.code,
          name: quotation.customer.name,
          phone: quotation.customer.phone,
          email: quotation.customer.email,
          billingAddress: quotation.customer.billingAddress,
          shippingAddress: quotation.customer.shippingAddress,
          discountType: quotation.customer.discountType,
          discountValue: Number(quotation.customer.discountValue),
        }
      : null,
    prospectName: quotation.prospectName,
    prospectEmail: quotation.prospectEmail,
    prospectPhone: quotation.prospectPhone,
    billingAddress: quotation.billingAddress,
    shippingAddress: quotation.shippingAddress,
    issueDate: quotation.issueDate,
    validUntil: quotation.validUntil,
    expectedDeliveryDate: quotation.expectedDeliveryDate,
    termsAndConditions: quotation.termsAndConditions,
    customerNotes: quotation.customerNotes,
    items: quotation.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      sku: item.product.sku,
      unit: item.product.unit?.displayName ?? "",
      imageUrl: item.product.imageUrl,
      unitPrice: Number(item.unitPrice),
      taxRate: Number(item.taxRate),
      quantity: Number(item.quantity),
      discountType: item.discountType,
      discountValue: Number(item.discountValue),
    })),
  };
}

export default function QuotationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { t, locale } = useDictionary();
  const [quotation, setQuotation] = useState<QuotationDetail | null>(null);
  const [notFound, setNotFound] = useState(false);

  const wantsEdit = searchParams.get("edit") === "1";

  useEffect(() => {
    if (!id) return;
    api
      .get(`/quotations/${id}`)
      .then((res) => setQuotation(res.data.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return <p className="text-sm text-muted-foreground">Quotation not found.</p>;
  }
  if (!quotation) return null;

  if (wantsEdit) {
    if (!isEditable(quotation.status)) {
      return (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          {t.detail.notEditable(t.status[quotation.status])}
        </div>
      );
    }
    return <QuotationForm initial={toFormInitialData(quotation)} />;
  }

  return <QuotationDetailView quotation={quotation} t={t} locale={locale} />;
}
