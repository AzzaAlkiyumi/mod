import { z } from "zod";

export const discountTypeSchema = z.enum(["PERCENT", "FIXED"]);

export const quotationItemInputSchema = z
  .object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.coerce
      .number({ error: "Quantity is required" })
      .positive("Quantity must be greater than 0"),
    unitPrice: z.coerce
      .number({ error: "Price is required" })
      .nonnegative("Price cannot be negative"),
    discountType: discountTypeSchema.default("FIXED"),
    discountValue: z.coerce
      .number()
      .nonnegative("Discount cannot be negative")
      .default(0),
    taxRate: z.coerce.number().nonnegative().default(0),
  })
  .refine(
    (item) =>
      item.discountType !== "PERCENT" ||
      (item.discountValue >= 0 && item.discountValue <= 100),
    { message: "Percentage discount must be between 0 and 100", path: ["discountValue"] },
  );

export const quotationFormSchema = z
  .object({
    storeId: z.string().min(1, "Store is required"),
    customerId: z.string().optional().nullable(),
    prospectName: z.string().optional(),
    prospectEmail: z
      .string()
      .optional()
      .refine((v) => !v || z.string().email().safeParse(v).success, {
        message: "Invalid email address",
      }),
    prospectPhone: z.string().optional(),
    billingAddress: z.string().optional(),
    shippingAddress: z.string().optional(),
    issueDate: z.string().min(1, "Issue date is required"),
    validUntil: z.string().optional(),
    expectedDeliveryDate: z.string().optional(),
    termsAndConditions: z.string().optional(),
    customerNotes: z.string().optional(),
    items: z.array(quotationItemInputSchema).min(1, "Add at least one product to prepare the quotation"),
  })
  .refine((data) => data.customerId || (data.prospectName && data.prospectName.trim().length > 0), {
    message: "Select an existing customer or enter a prospect name",
    path: ["prospectName"],
  })
  .refine(
    (data) =>
      !data.validUntil || new Date(data.validUntil) >= new Date(data.issueDate),
    { message: "Valid until must be on or after the issue date", path: ["validUntil"] },
  )
  .refine(
    (data) => {
      const productIds = data.items.map((i) => i.productId);
      return new Set(productIds).size === productIds.length;
    },
    { message: "Each product can only appear once — adjust the quantity instead", path: ["items"] },
  );

export type QuotationFormInput = z.infer<typeof quotationFormSchema>;

export const quotationStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED",
]);

export const quotationStatusUpdateSchema = z.object({
  status: quotationStatusSchema,
});
