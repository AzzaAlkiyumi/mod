import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDictionary } from "@/i18n/dictionary-context";
import { api, apiErrorMessage } from "@/lib/api";
import type { QuotationStatus } from "@/lib/quotation-rules";

const NEXT_STATUSES: Record<QuotationStatus, QuotationStatus[]> = {
  DRAFT: ["SENT"],
  SENT: ["ACCEPTED", "REJECTED", "EXPIRED"],
  ACCEPTED: ["CONVERTED"],
  REJECTED: [],
  EXPIRED: [],
  CONVERTED: [],
};

export function QuotationStatusActions({
  id,
  status,
}: {
  id: string;
  status: QuotationStatus;
}) {
  const { t } = useDictionary();
  const [loading, setLoading] = useState(false);
  const options = NEXT_STATUSES[status];

  async function changeStatus(next: QuotationStatus) {
    setLoading(true);
    try {
      await api.patch(`/quotations/${id}/status`, { status: next });
      toast.success(
        next === "CONVERTED" ? t.detail.toasts.converted : t.detail.toasts.statusChanged(t.status[next]),
      );
      window.location.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, t.detail.toasts.statusFailed));
    } finally {
      setLoading(false);
    }
  }

  if (options.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? t.detail.actions.updating : t.detail.actions.changeStatus} <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((opt) => (
          <DropdownMenuItem key={opt} onSelect={() => changeStatus(opt)}>
            {t.detail.statusMenu.markAs(t.status[opt])}
            {opt === "CONVERTED" ? t.detail.statusMenu.convertSuffix : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
