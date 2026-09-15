import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { isDeletable, isEditable, type QuotationStatus } from "@/lib/quotation-rules";
import { useDictionary } from "@/i18n/dictionary-context";
import { api, apiErrorMessage } from "@/lib/api";

export function QuotationRowActions({
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
      setConfirmOpen(false);
      navigate(0);
    } catch (err) {
      toast.error(apiErrorMessage(err, t.list.toasts.deleteFailed));
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
            <Link to={`/admin/quotations/${id}`}>
              <Eye /> {t.list.actions.view}
            </Link>
          </DropdownMenuItem>
          {isEditable(status) && (
            <DropdownMenuItem asChild>
              <Link to={`/admin/quotations/${id}?edit=1`}>
                <Pencil /> {t.list.actions.edit}
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <a href={`/quotation-preview/${id}`} target="_blank" rel="noopener noreferrer">
              <Printer /> {t.list.actions.print}
            </a>
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
