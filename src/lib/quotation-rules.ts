/**
 * Quotation status workflow and edit/delete permissions.
 *
 * Not directly observed on the reference site (the recorded session never
 * reached a saved quotation), so this is a documented assumption based on
 * standard POS/quotation conventions and the two facts we DID observe:
 *   1. "A quotation does not reserve or deduct stock. Availability is
 *      checked when it is converted to a sale." -> conversion is a distinct,
 *      one-way action gated on stock availability at conversion time.
 *   2. The list page has a "Status" filter, implying a fixed status enum.
 * See QUOTATION_AUDIT.md "Business Logic" and "Unknown Behavior".
 */
import type { QuotationStatus } from "@/generated/prisma/enums";

export const QUOTATION_STATUSES: QuotationStatus[] = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED",
];

/** English fallback labels, used only for API error messages and other non-UI text.
 * UI components should read the translated label from `dict.status[status]` instead
 * (see src/i18n/dictionaries) so status names follow the active language. */
export const STATUS_LABELS: Record<QuotationStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  EXPIRED: "Expired",
  CONVERTED: "Converted",
};

export const STATUS_BADGE_VARIANT: Record<
  QuotationStatus,
  "muted" | "info" | "success" | "destructive" | "warning"
> = {
  DRAFT: "muted",
  SENT: "info",
  ACCEPTED: "success",
  REJECTED: "destructive",
  EXPIRED: "warning",
  CONVERTED: "success",
};

const ALLOWED_TRANSITIONS: Record<QuotationStatus, QuotationStatus[]> = {
  DRAFT: ["SENT"],
  SENT: ["ACCEPTED", "REJECTED", "EXPIRED"],
  ACCEPTED: ["CONVERTED"],
  REJECTED: [],
  EXPIRED: [],
  CONVERTED: [],
};

export function canTransition(from: QuotationStatus, to: QuotationStatus) {
  if (from === to) return true;
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

export function isEditable(status: QuotationStatus) {
  return status === "DRAFT" || status === "SENT";
}

export function isDeletable(status: QuotationStatus) {
  return status !== "CONVERTED";
}

export function isConvertible(status: QuotationStatus) {
  return status === "ACCEPTED";
}
