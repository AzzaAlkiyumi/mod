import { z } from "zod";

export const DRUG_SCHEDULE_VALUES = ["NOT_SCHEDULED", "OTC", "H", "H1", "X", "G"] as const;

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

  // General — status & short description
  shortDescription: z.string().trim().optional(),
  availableForSale: z.boolean().default(true),
  featured: z.boolean().default(false),

  // Inventory
  trackStock: z.boolean().default(true),
  soldByWeight: z.boolean().default(false),
  trackBatches: z.boolean().default(false),
  trackExpiry: z.boolean().default(false),
  expiryDate: z.string().trim().optional(),
  reorderAt: z.coerce.number().int().nonnegative().optional(),
  reorderQuantity: z.coerce.number().int().nonnegative().optional(),

  // Pricing & Tax
  costPrice: z.coerce.number().nonnegative().optional(),
  mrp: z.coerce.number().nonnegative().optional(),
  priceIncludesTax: z.boolean().default(false),

  // Compliance
  hsnCode: z.string().trim().optional(),
  drugSchedule: z.enum(DRUG_SCHEDULE_VALUES).default("NOT_SCHEDULED"),
  genericName: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
});

export type ProductCreateInput = z.infer<typeof productCreateSchema>;
