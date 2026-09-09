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
import { useDictionary } from "@/i18n/dictionary-context";
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
  const { t } = useDictionary();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.formErrors?.[0] ?? t.list.toasts.deleteFailed);
      toast.success(t.list.toasts.deleted(number));
      router.push("/admin/quotations");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.list.toasts.deleteFailed);
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer /> {t.common.print}
        </Button>
        {isEditable(status) && (
          <Button variant="outline" asChild>
            <Link href={`/admin/quotations/${id}?edit=1`}>
              <Pencil /> {t.common.edit}
            </Link>
          </Button>
        )}
        <QuotationStatusActions id={id} status={status} />
        {isDeletable(status) && (
          <Button variant="outline" onClick={() => setConfirmOpen(true)}>
            <Trash2 className="text-destructive" /> {t.common.delete}
          </Button>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.list.deleteDialog.title(number)}</DialogTitle>
            <DialogDescription>{t.list.deleteDialog.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
              {t.common.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? t.common.deleting : t.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
