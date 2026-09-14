import { z } from "zod";

import { isValidPermissionKey } from "@/lib/permissions";

export const roleSchema = z.object({
  name: z.string().trim().min(1, "Role name is required"),
  description: z.string().trim().optional(),
  permissions: z
    .array(z.string().trim())
    .default([])
    .refine((keys) => keys.every(isValidPermissionKey), "Unknown permission key"),
});
export type RoleInput = z.infer<typeof roleSchema>;
