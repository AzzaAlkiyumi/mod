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
import { ProductThumb } from "@/components/quotation/product-thumb";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { QuotationDetail } from "@/lib/types";
import type { Dictionary } from "@/i18n/dictionaries/en";

export function QuotationDetailView({
  quotation,
  t,
}: {
  quotation: QuotationDetail;
  t: Dictionary;
}) {
  return (
    <div className="flex flex-col gap-6 print:gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{quotation.number}</h1>
            <QuotationStatusBadge status={quotation.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {t.detail.issuedFrom(formatDate(quotation.issueDate), quotation.store.name)}
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
              <CardTitle>{t.detail.details.title}</CardTitle>
              <CardDescription>{t.detail.details.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <Field label={t.detail.fields.customer}>
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
              <Field label={t.detail.fields.store}>{quotation.store.name}</Field>
              <Field label={t.detail.fields.issueDate}>{formatDate(quotation.issueDate)}</Field>
              <Field label={t.detail.fields.validUntil}>{formatDate(quotation.validUntil)}</Field>
              <Field label={t.detail.fields.expectedDelivery}>
                {formatDate(quotation.expectedDeliveryDate)}
              </Field>
              <Field label={t.detail.fields.createdBy}>{quotation.createdBy.name}</Field>
              <Field label={t.detail.fields.billingAddress}>
                {quotation.billingAddress || "—"}
              </Field>
              <Field label={t.detail.fields.shippingAddress}>
                {quotation.shippingAddress || "—"}
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.detail.items.title}</CardTitle>
              <CardDescription>{t.detail.items.count(quotation.items.length)}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.detail.items.columns.product}</TableHead>
                      <TableHead className="text-end">{t.detail.items.columns.qty}</TableHead>
                      <TableHead className="text-end">
                        {t.detail.items.columns.unitPrice}
                      </TableHead>
                      <TableHead className="text-end">
                        {t.detail.items.columns.discount}
                      </TableHead>
                      <TableHead className="text-end">{t.detail.items.columns.tax}</TableHead>
                      <TableHead className="text-end">
                        {t.detail.items.columns.lineTotal}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quotation.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <ProductThumb
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              size={32}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{item.product.name}</span>
                              <span className="text-xs text-muted-foreground">
                                SKU {item.product.sku}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-end">{Number(item.quantity)}</TableCell>
                        <TableCell className="text-end">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell className="text-end">
                          {Number(item.discountValue) > 0
                            ? item.discountType === "PERCENT"
                              ? `${Number(item.discountValue)}%`
                              : formatCurrency(item.discountValue)
                            : "—"}
                        </TableCell>
                        <TableCell className="text-end">
                          {Number(item.taxRate) > 0 ? `${Number(item.taxRate)}%` : "—"}
                        </TableCell>
                        <TableCell className="text-end font-medium">
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
                <CardTitle>{t.detail.deliveryTitle}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 text-sm">
                {quotation.termsAndConditions && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.detail.termsAndConditions}
                    </p>
                    <p className="whitespace-pre-wrap">{quotation.termsAndConditions}</p>
                  </div>
                )}
                {quotation.customerNotes && (
                  <div>
                    <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {t.detail.customerNotes}
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
              <CardTitle>{t.detail.summaryTitle}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <Row label={t.form.summary.subtotal} value={formatCurrency(quotation.subtotal)} />
              <Row label={t.form.summary.discount} value={formatCurrency(quotation.discountTotal)} />
              <Row label={t.form.summary.tax} value={formatCurrency(quotation.taxTotal)} />
              <Separator />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>{t.form.summary.total}</span>
                <span>{formatCurrency(quotation.total)}</span>
              </div>
              {quotation.status === "CONVERTED" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.detail.convertedOn(formatDate(quotation.convertedAt))}
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
