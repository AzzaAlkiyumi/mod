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
import { STATUS_LABELS } from "@/lib/quotation-rules";
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
      if (!res.ok) throw new Error(json?.error?.formErrors?.[0] ?? "Failed to update status");
      toast.success(
        next === "CONVERTED"
          ? "Quotation converted to a sale"
          : `Status changed to ${STATUS_LABELS[next]}`,
      );
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setLoading(false);
    }
  }

  if (options.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={loading}>
          {loading ? "Updating…" : "Change status"} <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map((opt) => (
          <DropdownMenuItem key={opt} onSelect={() => changeStatus(opt)}>
            Mark as {STATUS_LABELS[opt]}
            {opt === "CONVERTED" ? " (convert to sale)" : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
