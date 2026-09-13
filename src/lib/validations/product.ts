import { z } from "zod";

export const productCreateSchema = z.object({
  name: z.string().trim().min(1, "English product name is required"),
  nameAr: z.string().trim().optional(),
  category: z.string().trim().min(1, "Category is required"),
  unit: z.string().trim().min(1, "Unit is required"),
  price: z.coerce.number({ error: "Enter a valid price" }).nonnegative("Price cannot be negative"),
  taxId: z.string().optional(),
  sku: z.string().trim().optional(),
  barcode: z.string().trim().optional(),
  descriptionEn: z.string().trim().optional(),
  descriptionAr: z.string().trim().optional(),
  imageUrl: z.string().trim().optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
