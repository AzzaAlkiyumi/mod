import { Badge } from "@/components/ui/badge";
import { STATUS_BADGE_VARIANT, type QuotationStatus } from "@/lib/quotation-rules";
import { useDictionary } from "@/i18n/dictionary-context";

export function QuotationStatusBadge({ status }: { status: QuotationStatus }) {
  const { t } = useDictionary();
  return (
    <Badge variant={STATUS_BADGE_VARIANT[status]}>
      <span className="size-1.5 rounded-full bg-current" />
      {t.status[status]}
    </Badge>
  );
}
