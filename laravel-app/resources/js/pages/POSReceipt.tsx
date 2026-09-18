import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";
import { api } from "@/lib/api";

interface ReceiptSaleItem {
  id: string;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  lineTotal: number;
  product: { name: string; nameAr: string | null };
}

interface ReceiptSale {
  id: string;
  number: string;
  createdAt: string;
  paymentMethod: string;
  paymentReference: string | null;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  total: number;
  tenderedAmount: number | null;
  changeAmount: number | null;
  store: { name: string; addressEn: string | null };
  customer: { name: string } | null;
  createdBy: { name: string } | null;
  items: ReceiptSaleItem[];
}

/** The printable receipt destination for a completed POS sale (linked from
 * the sale-complete modal's View/Print receipt buttons). Deliberately
 * outside /admin so it renders with no sidebar/header chrome, matching the
 * reference video's dedicated receipt window. */
export default function POSReceiptPage() {
  const { id } = useParams<{ id: string }>();
  const { t, locale } = useDictionary();
  const s = t.pos.receipt;
  const [sale, setSale] = useState<ReceiptSale | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/sales/${id}`)
      .then((res) => setSale(res.data.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-center">
        <p className="text-sm font-medium">{s.notFound(id ?? "")}</p>
      </div>
    );
  }

  if (!sale) return null;

  return (
    <div className="flex min-h-dvh flex-col items-center gap-6 bg-muted/40 p-6">
      <div className="no-print flex w-full max-w-sm items-center justify-between">
        <Button variant="outline" onClick={() => window.close()}>
          {s.back}
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="size-4" />
          {s.print}
        </Button>
      </div>

      <div className="w-full max-w-sm rounded-lg border border-border bg-white p-6 font-mono text-sm text-black shadow-sm print:border-0 print:shadow-none">
        <div className="flex flex-col items-center gap-0.5 text-center">
          <span className="text-base font-bold">Hyper POS</span>
          <span className="font-semibold">{sale.store.name}</span>
          {sale.store.addressEn && <span className="text-xs">{sale.store.addressEn}</span>}
        </div>

        <div className="mt-3 flex items-center justify-between text-xs">
          <span>{sale.number}</span>
          <span>{formatDate(sale.createdAt)}</span>
        </div>
        <div className="text-xs">
          {s.cashier}: {sale.createdBy?.name ?? "—"}
        </div>
        {sale.customer && <div className="text-xs">{sale.customer.name}</div>}

        <div className="my-3 border-t border-dashed border-black/40" />

        <div className="flex flex-col gap-2">
          {sale.items.map((item) => (
            <div key={item.id}>
              <div className="font-semibold">
                {locale === "ar" && item.product.nameAr ? item.product.nameAr : item.product.name}
              </div>
              <div className="flex items-center justify-between">
                <span>
                  {item.quantity} x {formatCurrency(item.unitPrice, locale)}
                </span>
                <span>{formatCurrency(item.lineTotal, locale)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="my-3 border-t border-dashed border-black/40" />

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <span>{s.subtotal}</span>
            <span>{formatCurrency(sale.subtotal, locale)}</span>
          </div>
          {sale.discountTotal > 0 && (
            <div className="flex items-center justify-between">
              <span>{s.discount}</span>
              <span>-{formatCurrency(sale.discountTotal, locale)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span>{s.tax}</span>
            <span>{formatCurrency(sale.taxTotal, locale)}</span>
          </div>
        </div>

        <div className="my-3 border-t border-dashed border-black/40" />

        <div className="flex items-center justify-between text-base font-bold">
          <span>{s.total}</span>
          <span>{formatCurrency(sale.total, locale)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span>{t.pos.payment[sale.paymentMethod as keyof typeof t.pos.payment] ?? sale.paymentMethod}</span>
          <span>{formatCurrency(sale.total, locale)}</span>
        </div>
        {sale.paymentReference && (
          <div className="flex items-center justify-between text-xs">
            <span>Ref</span>
            <span>{sale.paymentReference}</span>
          </div>
        )}
        {sale.tenderedAmount !== null && (
          <div className="flex items-center justify-between text-xs">
            <span>{s.tendered}</span>
            <span>{formatCurrency(sale.tenderedAmount, locale)}</span>
          </div>
        )}
        {sale.changeAmount !== null && (
          <div className="flex items-center justify-between text-xs">
            <span>{s.change}</span>
            <span>{formatCurrency(sale.changeAmount, locale)}</span>
          </div>
        )}

        <div className="my-4 flex flex-col items-center gap-1">
          <div className="flex h-10 items-end gap-[2px]">
            {Array.from({ length: 40 }, (_, i) => (
              <span
                key={i}
                className="bg-black"
                style={{ width: (i * 7) % 3 === 0 ? 2 : 1, height: (i * 13) % 2 === 0 ? "100%" : "70%" }}
              />
            ))}
          </div>
          <span className="text-xs">{sale.number}</span>
        </div>
      </div>
    </div>
  );
}
