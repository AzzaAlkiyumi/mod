"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Printer, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isDeletable, isEditable } from "@/lib/quotation-rules";
import { useDictionary } from "@/i18n/dictionary-context";
import type { QuotationStatus } from "@/generated/prisma/enums";

export function QuotationRowActions({
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
      if (!res.ok) {
        throw new Error(json?.error?.formErrors?.[0] ?? t.list.toasts.deleteFailed);
      }
      toast.success(t.list.toasts.deleted(number));
      setConfirmOpen(false);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.list.toasts.deleteFailed);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t.list.actions.menuFor(number)}>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/admin/quotations/${id}`}>
              <Eye /> {t.list.actions.view}
            </Link>
          </DropdownMenuItem>
          {isEditable(status) && (
            <DropdownMenuItem asChild>
              <Link href={`/admin/quotations/${id}?edit=1`}>
                <Pencil /> {t.list.actions.edit}
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href={`/admin/quotations/${id}?print=1`}>
              <Printer /> {t.list.actions.print}
            </Link>
          </DropdownMenuItem>
          {isDeletable(status) && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
                <Trash2 /> {t.list.actions.delete}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
