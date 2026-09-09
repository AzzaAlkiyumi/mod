"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useDictionary } from "@/i18n/dictionary-context";
import type { QuotationStatus } from "@/generated/prisma/enums";

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
  const router = useRouter();
  const { t } = useDictionary();
  const [loading, setLoading] = useState(false);
  const options = NEXT_STATUSES[status];

  async function changeStatus(next: QuotationStatus) {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotations/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.formErrors?.[0] ?? t.detail.toasts.statusFailed);
      toast.success(
        next === "CONVERTED"
          ? t.detail.toasts.converted
          : t.detail.toasts.statusChanged(t.status[next]),
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.detail.toasts.statusFailed);
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
