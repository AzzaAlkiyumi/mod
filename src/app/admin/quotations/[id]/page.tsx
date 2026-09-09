import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { QuotationDetailView } from "@/components/quotation/quotation-detail-view";
import { QuotationForm, type QuotationFormInitialData } from "@/components/quotation/quotation-form";
import { isEditable } from "@/lib/quotation-rules";
import type { QuotationDetail } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function toFormInitialData(quotation: QuotationDetail): QuotationFormInitialData {
  return {
    id: quotation.id,
    number: quotation.number,
    storeId: quotation.storeId,
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
    issueDate: quotation.issueDate.toISOString(),
    validUntil: quotation.validUntil?.toISOString() ?? null,
    expectedDeliveryDate: quotation.expectedDeliveryDate?.toISOString() ?? null,
    termsAndConditions: quotation.termsAndConditions,
    customerNotes: quotation.customerNotes,
    items: quotation.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      sku: item.product.sku,
      unit: item.product.unit,
      unitPrice: Number(item.unitPrice),
      taxRate: Number(item.taxRate),
      quantity: Number(item.quantity),
      discountType: item.discountType,
      discountValue: Number(item.discountValue),
    })),
  };
}

export default async function QuotationDetailPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const search = await searchParams;

  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      store: true,
      customer: true,
      createdBy: true,
      items: { include: { product: { include: { tax: true } } }, orderBy: { sortOrder: "asc" } },
    },
  });

  if (!quotation) notFound();

  const wantsEdit = search.edit === "1";

  if (wantsEdit) {
    if (!isEditable(quotation.status)) {
      return (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          A quotation with status &quot;{quotation.status}&quot; can no longer be edited.
        </div>
      );
    }
    return <QuotationForm initial={toFormInitialData(quotation)} />;
  }

  return <QuotationDetailView quotation={quotation} />;
}
