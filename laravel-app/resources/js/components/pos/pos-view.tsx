import { useMemo, useState } from "react";
import { Minus, Plus, ScanBarcode, Search, ShoppingCart, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductThumb } from "@/components/products/product-thumb";
import { CustomerSelector, type CustomerOption } from "@/components/quotation/customer-selector";
import { formatCurrency } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";
import { api, apiErrorMessage } from "@/lib/api";

export interface POSProduct {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  unit: string;
  price: number;
  imageUrl: string | null;
  category: string | null;
  taxRate: number;
}

interface StoreOption {
  id: string;
  name: string;
}

interface CartLine {
  product: POSProduct;
  quantity: number;
}

function round3(value: number) {
  return Math.round((value + Number.EPSILON) * 1000) / 1000;
}

export function POSView({
  products,
  stores,
  defaultStoreId,
}: {
  products: POSProduct[];
  stores: StoreOption[];
  defaultStoreId: string;
}) {
  const { t, locale } = useDictionary();
  const [query, setQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [customer, setCustomer] = useState<CustomerOption | null>(null);
  const [storeId, setStoreId] = useState(defaultStoreId);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");
  const [submitting, setSubmitting] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) if (p.category) set.add(p.category);
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (category && p.category !== category) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, query, category]);

  function addToCart(product: POSProduct) {
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    toast.success(t.pos.addedToast(product.name));
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.product.id !== productId)
        : prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l)),
    );
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((l) => l.product.id !== productId));
  }

  function handleBarcodeSubmit() {
    const code = barcode.trim();
    if (!code) return;
    const match = products.find((p) => p.barcode === code || p.sku === code);
    if (match) {
      addToCart(match);
    } else {
      toast.error(t.form.items.barcodeNotFound(code));
    }
    setBarcode("");
  }

  const totals = useMemo(() => {
    let subtotal = 0;
    let tax = 0;
    for (const line of cart) {
      const gross = line.quantity * line.product.price;
      tax += (gross * line.product.taxRate) / 100;
      subtotal += gross;
    }
    subtotal = round3(subtotal);
    tax = round3(tax);
    return { subtotal, tax, total: round3(subtotal + tax) };
  }, [cart]);

  async function handleCompleteSale() {
    if (cart.length === 0) {
      toast.error(t.pos.toasts.emptyCart);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/sales", {
        storeId,
        customerId: customer?.id,
        paymentMethod,
        items: cart.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      });
      toast.success(t.pos.toasts.completed(res.data.data.number));
      setCart([]);
      setCustomer(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, t.pos.toasts.failed));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{t.pos.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.pos.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* Browse / search */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.pos.searchPlaceholder}
                className="ps-9"
              />
            </div>
            <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 shadow-sm sm:w-72">
              <ScanBarcode className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleBarcodeSubmit();
                  }
                }}
                placeholder={t.pos.scanBarcode}
                className="h-9 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                size="sm"
                variant={category === null ? "default" : "outline"}
                onClick={() => setCategory(null)}
              >
                {t.pos.allCategories}
              </Button>
              {categories.map((c) => (
                <Button
                  key={c}
                  type="button"
                  size="sm"
                  variant={category === c ? "default" : "outline"}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </Button>
              ))}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <p className="rounded-md border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {t.pos.noProductsFound}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => addToCart(product)}
                  className="flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3 text-start shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
                >
                  <ProductThumb
                    src={product.imageUrl}
                    alt={product.name}
                    size={56}
                    className="rounded-lg"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium leading-tight">{product.name}</span>
                    <span className="text-xs text-muted-foreground">SKU {product.sku}</span>
                  </div>
                  <span className="text-sm font-semibold">{formatCurrency(product.price, locale)}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart / checkout */}
        <Card className="flex h-fit flex-col gap-4 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">{t.pos.cart.title}</h2>
              {cart.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {t.pos.cart.itemCount(cart.length)}
                </span>
              )}
            </div>
            {cart.length > 0 && (
              <Button type="button" variant="ghost" size="sm" onClick={() => setCart([])}>
                {t.pos.cart.clear}
              </Button>
            )}
          </div>

          {cart.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t.pos.cart.empty}</p>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.map((line) => (
                <div key={line.product.id} className="flex items-center gap-2.5">
                  <ProductThumb src={line.product.imageUrl} alt={line.product.name} size={36} />
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">{line.product.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(line.product.price, locale)} / {line.product.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7"
                      aria-label={t.pos.cart.decreaseQty(line.product.name)}
                      onClick={() => updateQuantity(line.product.id, line.quantity - 1)}
                    >
                      <Minus className="size-3.5" />
                    </Button>
                    <span className="w-6 text-center text-sm">{line.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="size-7"
                      aria-label={t.pos.cart.increaseQty(line.product.name)}
                      onClick={() => updateQuantity(line.product.id, line.quantity + 1)}
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label={t.pos.cart.remove(line.product.name)}
                    onClick={() => removeLine(line.product.id)}
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1.5 border-t border-border pt-3">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.pos.customer.label}
            </label>
            <CustomerSelector
              value={customer}
              onChange={setCustomer}
              emptyLabel={t.pos.customer.walkIn}
            />
          </div>

          {stores.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {t.pos.store}
              </label>
              <Select value={storeId} onValueChange={setStoreId}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {t.pos.payment.label}
            </label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as "CASH" | "CARD")}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">{t.pos.payment.CASH}</SelectItem>
                <SelectItem value="CARD">{t.pos.payment.CARD}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t.pos.summary.subtotal}</span>
              <span>{formatCurrency(totals.subtotal, locale)}</span>
            </div>
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t.pos.summary.tax}</span>
              <span>{formatCurrency(totals.tax, locale)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-base font-semibold">
              <span>{t.pos.summary.total}</span>
              <span>{formatCurrency(totals.total, locale)}</span>
            </div>
          </div>

          <Button
            type="button"
            size="lg"
            disabled={submitting || cart.length === 0}
            onClick={handleCompleteSale}
          >
            {submitting ? t.pos.completing : t.pos.completeSale}
          </Button>
        </Card>
      </div>
    </div>
  );
}
