export type QuotationStatus = "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED" | "CONVERTED";

export const QUOTATION_STATUSES: QuotationStatus[] = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "REJECTED",
  "EXPIRED",
  "CONVERTED",
];

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
