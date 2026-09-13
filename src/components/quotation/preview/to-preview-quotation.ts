import type { QuotationDetail } from "@/lib/types";

/** Plain-value shape for the print preview — Prisma `Decimal`/`Date` instances
 * can't be passed from a Server Component into the Client Component that
 * renders this, so `toPreviewQuotation()` converts them once, at the server
 * boundary. Kept in its own plain module (no "use client") because a
 * function exported from a client-component file can't be called directly
 * from a Server Component — only rendered as a component. */
export interface PreviewQuotation {
  number: string;
  issueDate: string;
  validUntil: string | null;
  termsAndConditions: string | null;
  customerNotes: string | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  store: {
    name: string;
    legalNameEn: string | null;
    legalNameAr: string | null;
    crNumber: string | null;
    poBox: string | null;
    countryEn: string | null;
    countryAr: string | null;
    addressEn: string | null;
    addressAr: string | null;
    vatNumber: string | null;
    mobile: string | null;
    email: string | null;
    logoUrl: string | null;
  };
  customer: { name: string; code: string; phone: string | null } | null;
  prospectName: string | null;
  prospectEmail: string | null;
  prospectPhone: string | null;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    lineTotal: number;
    product: { sku: string; name: string; imageUrl: string | null };
  }[];
}

export function toPreviewQuotation(quotation: QuotationDetail): PreviewQuotation {
  return {
    number: quotation.number,
    issueDate: quotation.issueDate.toISOString(),
    validUntil: quotation.validUntil?.toISOString() ?? null,
    termsAndConditions: quotation.termsAndConditions,
    customerNotes: quotation.customerNotes,
    subtotal: Number(quotation.subtotal),
    discountTotal: Number(quotation.discountTotal),
    taxTotal: Number(quotation.taxTotal),
    total: Number(quotation.total),
    store: {
      name: quotation.store.name,
      legalNameEn: quotation.store.legalNameEn,
      legalNameAr: quotation.store.legalNameAr,
      crNumber: quotation.store.crNumber,
      poBox: quotation.store.poBox,
      countryEn: quotation.store.countryEn,
      countryAr: quotation.store.countryAr,
      addressEn: quotation.store.addressEn,
      addressAr: quotation.store.addressAr,
      vatNumber: quotation.store.vatNumber,
      mobile: quotation.store.mobile,
      email: quotation.store.email,
      logoUrl: quotation.store.logoUrl,
    },
    customer: quotation.customer
      ? {
          name: quotation.customer.name,
          code: quotation.customer.code,
          phone: quotation.customer.phone,
        }
      : null,
    prospectName: quotation.prospectName,
    prospectEmail: quotation.prospectEmail,
    prospectPhone: quotation.prospectPhone,
    items: quotation.items.map((item) => ({
      id: item.id,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      taxRate: Number(item.taxRate),
      lineTotal: Number(item.lineTotal),
      product: { sku: item.product.sku, name: item.product.name, imageUrl: item.product.imageUrl },
    })),
  };
}
