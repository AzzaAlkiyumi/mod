import type { Prisma } from "@/generated/prisma/client";

export type QuotationListItem = Prisma.QuotationGetPayload<{
  include: {
    store: true;
    customer: true;
    items: { include: { product: true } };
  };
}>;

export type QuotationDetail = Prisma.QuotationGetPayload<{
  include: {
    store: true;
    customer: true;
    createdBy: true;
    items: { include: { product: { include: { tax: true } } } };
  };
}>;

export type ProductWithTax = Prisma.ProductGetPayload<{ include: { tax: true } }>;
