import { z } from "zod";

export const unitCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Letters, numbers, and dashes only"),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});
export type UnitCategoryInput = z.infer<typeof unitCategorySchema>;

export const unitSchema = z.object({
  shortCode: z.string().trim().min(1, "Short code is required"),
  displayName: z.string().trim().min(1, "Display name is required"),
  measurementCategoryId: z.string().trim().min(1, "Measurement category is required"),
  baseUnitId: z.string().trim().optional(),
  conversionFactor: z.coerce.number().positive().optional(),
  active: z.boolean().default(true),
});
export type UnitInput = z.infer<typeof unitSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  iconColor: z.string().trim().default("orange"),
  taxId: z.string().trim().optional(),
  parentId: z.string().trim().optional(),
  active: z.boolean().default(true),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const brandSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  logoUrl: z.string().trim().optional(),
  description: z.string().trim().optional(),
  active: z.boolean().default(true),
});
export type BrandInput = z.infer<typeof brandSchema>;
