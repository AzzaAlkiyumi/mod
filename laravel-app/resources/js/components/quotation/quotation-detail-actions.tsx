import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { isDeletable, isEditable, type QuotationStatus } from "@/lib/quotation-rules";
import { useDictionary } from "@/i18n/dictionary-context";
import { api, apiErrorMessage } from "@/lib/api";

export function QuotationDetailActions({
  id,
  number,
  status,
}: {
  id: string;
  number: string;
  status: QuotationStatus;
}) {
  const navigate = useNavigate();
  const { t } = useDictionary();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.delete(`/quotations/${id}`);
      toast.success(t.list.toasts.deleted(number));
      navigate("/admin/quotations");
    } catch (err) {
      toast.error(apiErrorMessage(err, t.list.toasts.deleteFailed));
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 no-print">
        <Button variant="outline" asChild>
          <a href={`/quotation-preview/${id}`} target="_blank" rel="noopener noreferrer">
            <Printer /> {t.common.print}
          </a>
        </Button>
        {isEditable(status) && (
          <Button variant="outline" asChild>
            <Link to={`/admin/quotations/${id}?edit=1`}>
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
