"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pencil, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QuotationStatusActions } from "@/components/quotation/quotation-status-actions";
import { isDeletable, isEditable } from "@/lib/quotation-rules";
import type { QuotationStatus } from "@/generated/prisma/enums";

export function QuotationDetailActions({
  id,
  number,
  status,
}: {
  id: string;
  number: string;
  status: QuotationStatus;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.formErrors?.[0] ?? "Failed to delete quotation");
      toast.success(`${number} deleted`);
      router.push("/admin/quotations");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete quotation");
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer /> Print
        </Button>
        {isEditable(status) && (
          <Button variant="outline" asChild>
            <Link href={`/admin/quotations/${id}?edit=1`}>
              <Pencil /> Edit
            </Link>
          </Button>
        )}
        <QuotationStatusActions id={id} status={status} />
        {isDeletable(status) && (
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="text-destructive" /> Delete
          </Button>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {number}?</DialogTitle>
            <DialogDescription>
              This permanently deletes the quotation and its line items. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
