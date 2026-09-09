import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_VARIANT, STATUS_LABELS } from "@/lib/quotation-rules";
import type { QuotationStatus } from "@/generated/prisma/enums";

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]}>
      <span className="size-1.5 rounded-full bg-current" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}
