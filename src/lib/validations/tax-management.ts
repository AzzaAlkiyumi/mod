import { z } from "zod";

export const taxClassificationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9_]+$/, "Lowercase letters, numbers, and underscores only"),
  description: z.string().trim().optional(),
  sortOrder: z.coerce.number().int().default(0),
  active: z.boolean().default(true),
});
export type TaxClassificationInput = z.infer<typeof taxClassificationSchema>;

export const taxComponentSchema = z.object({
  code: z.string().trim().min(1, "Code is required"),
  name: z.string().trim().min(1, "Name is required"),
  rate: z.coerce.number().nonnegative("Rate cannot be negative"),
  active: z.boolean().default(true),
});
export type TaxComponentInput = z.infer<typeof taxComponentSchema>;

export const taxGroupSchema = z.object({
  code: z.string().trim().min(1, "Code is required"),
  name: z.string().trim().min(1, "Name is required"),
  classificationId: z.string().trim().min(1, "Classification is required"),
  componentIds: z.array(z.string().trim()).min(1, "Select at least one tax component"),
  pricesIncludeTax: z.boolean().default(false),
  isDefault: z.boolean().default(false),
  active: z.boolean().default(true),
});
export type TaxGroupInput = z.infer<typeof taxGroupSchema>;

export const drugScheduleSchema = z.object({
  shortCode: z.string().trim().min(1, "Short code is required").max(16, "Max 16 characters"),
  country: z
    .string()
    .trim()
    .length(2, "Use a 2-letter country code")
    .transform((v) => v.toUpperCase()),
  displayName: z.string().trim().min(1, "Display name is required"),
  description: z.string().trim().optional(),
  active: z.boolean().default(true),
});
export type DrugScheduleInput = z.infer<typeof drugScheduleSchema>;
