import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { QuotationStatusBadge } from "@/components/quotation/quotation-status-badge";
import { QuotationDetailActions } from "@/components/quotation/quotation-detail-actions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { QuotationDetail } from "@/lib/types";

export function QuotationDetailView({ quotation }: { quotation: QuotationDetail }) {
  return (
    <div className="flex flex-col gap-6 print:gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{quotation.number}</h1>
            <QuotationStatusBadge status={quotation.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Issued {formatDate(quotation.issueDate)} from {quotation.store.name}
          </p>
        </div>
        <QuotationDetailActions
          id={quotation.id}
          number={quotation.number}
          status={quotation.status}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Quotation details</CardTitle>
              <CardDescription>Customer, dates, and delivery addresses.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label="Customer">
                {quotation.customer ? (
                  <>
                    {quotation.customer.name}
                    <span className="block text-xs text-muted-foreground">
                      {quotation.customer.code} · {quotation.customer.phone ?? "—"}
                    </span>
                  </>
                ) : (
                  <>
                    {quotation.prospectName}
                    <span className="block text-xs text-muted-foreground">
                      {quotation.prospectEmail ?? "—"} · {quotation.prospectPhone ?? "—"}
                    </span>
                  </>
                )}
              </Field>
              <Field label="Store">{quotation.store.name}</Field>
              <Field label="Issue date">{formatDate(quotation.issueDate)}</Field>
              <Field label="Valid until">{formatDate(quotation.validUntil)}</Field>
              <Field label="Expected delivery">{formatDate(quotation.expectedDeliveryDate)}</Field>
              <Field label="Created by">{quotation.createdBy.name}</Field>
              <Field label="Billing address">{quotation.billingAddress || "—"}</Field>
              <Field label="Shipping address">{quotation.shippingAddress || "—"}</Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
              <CardDescription>{quotation.items.length} line item(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit price</TableHead>
                      <TableHead className="text-right">Discount</TableHead>
                      <TableHead className="text-right">Tax</TableHead>
                      <TableHead className="text-right">Line total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotation.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{item.product.name}</span>
                            <span className="text-xs text-muted-foreground">
                              SKU {item.product.sku}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{Number(item.quantity)}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(item.discountValue) > 0
                            ? item.discountType === "PERCENT"
                              ? `${Number(item.discountValue)}%`
                              : formatCurrency(item.discountValue)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {Number(item.taxRate) > 0 ? `${Number(item.taxRate)}%` : "—"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(item.lineTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {(quotation.termsAndConditions || quotation.customerNotes) && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery, terms, and notes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm">
                {quotation.termsAndConditions && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Terms and conditions
                    </p>
                    <p className="whitespace-pre-wrap">{quotation.termsAndConditions}</p>
                  </div>
                )}
                {quotation.customerNotes && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Customer notes
                    </p>
                    <p className="whitespace-pre-wrap">{quotation.customerNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Quotation summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <Row label="Subtotal" value={formatCurrency(quotation.subtotal)} />
              <Row label="Discount" value={formatCurrency(quotation.discountTotal)} />
              <Row label="Tax" value={formatCurrency(quotation.taxTotal)} />
              <Separator />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatCurrency(quotation.total)}</span>
              </div>
              {quotation.status === "CONVERTED" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Converted {formatDate(quotation.convertedAt)}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm">{children}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
