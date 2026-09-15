import type { QuotationStatus } from "@/lib/quotation-rules";

export interface QuotationItemRecord {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  taxRate: number;
  subtotal: number;
  taxAmount: number;
  lineTotal: number;
  sortOrder: number;
  product: {
    id: string;
    sku: string;
    name: string;
    nameAr: string | null;
    imageUrl: string | null;
    descriptionEn: string | null;
    descriptionAr: string | null;
    unit?: { id: string; displayName: string };
    tax?: { id: string; rate: number } | null;
  };
}

export interface QuotationListItem {
  id: string;
  number: string;
  status: QuotationStatus;
  issueDate: string;
  validUntil: string | null;
  total: number;
  store: { id: string; name: string };
  customer: { id: string; name: string; code: string } | null;
  prospectName: string | null;
  items: QuotationItemRecord[];
}

export interface QuotationDetail extends QuotationListItem {
  createdBy: { id: string; name: string };
  prospectEmail: string | null;
  prospectPhone: string | null;
  billingAddress: string | null;
  shippingAddress: string | null;
  expectedDeliveryDate: string | null;
  termsAndConditions: string | null;
  customerNotes: string | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  convertedAt: string | null;
  store: {
    id: string;
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
  customer:
    | (QuotationListItem["customer"] & {
        phone: string | null;
        email: string | null;
        billingAddress: string | null;
        shippingAddress: string | null;
        discountType: "PERCENT" | "FIXED";
        discountValue: number;
      })
    | null;
}
