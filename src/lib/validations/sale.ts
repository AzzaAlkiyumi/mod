import { z } from "zod";

export const paymentMethodSchema = z.enum(["CASH", "CARD"]);

export const saleItemInputSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  quantity: z.coerce
    .number({ error: "Quantity is required" })
    .positive("Quantity must be greater than 0"),
});

export const saleFormSchema = z
  .object({
    storeId: z.string().min(1, "Store is required"),
    customerId: z.string().optional().nullable(),
    paymentMethod: paymentMethodSchema,
    items: z.array(saleItemInputSchema).min(1, "Add at least one product to complete a sale"),
  })
  .refine(
    (data) => {
      const productIds = data.items.map((i) => i.productId);
      return new Set(productIds).size === productIds.length;
    },
    { message: "Each product can only appear once — adjust the quantity instead", path: ["items"] },
  );

export type SaleFormInput = z.infer<typeof saleFormSchema>;
