import { FileText } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QuotationStatusBadge } from "@/components/quotation/quotation-status-badge";
import { QuotationRowActions } from "@/components/quotation/quotation-row-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { QuotationListItem } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function QuotationTable({
  quotations,
  t,
}: {
  quotations: QuotationListItem[];
  t: Dictionary;
}) {
  if (quotations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <FileText className="size-5 text-muted-foreground" />
        </div>
        <p className="font-medium">{t.list.empty.title}</p>
        <p className="text-sm text-muted-foreground">{t.list.empty.subtitle}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.list.columns.number}</TableHead>
          <TableHead>{t.list.columns.customer}</TableHead>
          <TableHead>{t.list.columns.issueDate}</TableHead>
          <TableHead>{t.list.columns.validUntil}</TableHead>
          <TableHead>{t.list.columns.items}</TableHead>
          <TableHead>{t.list.columns.status}</TableHead>
          <TableHead className="text-end">{t.list.columns.total}</TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {quotations.map((quotation) => (
          <TableRow key={quotation.id}>
            <TableCell>
              <a
                href={`/admin/quotations/${quotation.id}`}
                className="font-medium text-primary hover:underline"
              >
                {quotation.number}
              </a>
            </TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">
                  {quotation.customer?.name ?? quotation.prospectName ?? "—"}
                </span>
                {quotation.customer?.code && (
                  <span className="text-xs text-muted-foreground">{quotation.customer.code}</span>
                )}
              </div>
            </TableCell>
            <TableCell>{formatDate(quotation.issueDate)}</TableCell>
            <TableCell>{formatDate(quotation.validUntil)}</TableCell>
            <TableCell className="text-muted-foreground">{quotation.items.length}</TableCell>
            <TableCell>
              <QuotationStatusBadge status={quotation.status} />
            </TableCell>
            <TableCell className="text-end font-medium">
              {formatCurrency(quotation.total)}
            </TableCell>
            <TableCell>
              <QuotationRowActions
                id={quotation.id}
                number={quotation.number}
                status={quotation.status}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
