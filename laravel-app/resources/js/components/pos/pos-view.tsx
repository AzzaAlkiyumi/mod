import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, ScanBarcode, Search, ShoppingCart, Tag, Trash2 } from "lucide-react";
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
import { CheckoutModal, type CheckoutResult } from "@/components/pos/checkout-modal";
import { SaleCompleteModal, type CompletedSale } from "@/components/pos/sale-complete-modal";
import { HeldSalesPopover, type HeldSaleSummary } from "@/components/pos/held-sales-popover";
import { DiscountPopover } from "@/components/pos/discount-popover";
import { WeightEntryModal } from "@/components/pos/weight-entry-modal";
import { cn, formatCurrency } from "@/lib/utils";
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
  featured: boolean;
  soldByWeight: boolean;
  availableForSale: boolean;
}

interface StoreOption {
  id: string;
  name: string;
}

interface CartLine {
  product: POSProduct;
  quantity: number;
}

interface RawHeldSale {
  id: string;
  reference: string | null;
  createdAt: string;
  cart: { productId: string; quantity: number }[];
  discountType: "FIXED" | "PERCENT";
  discountValue: number;
  customer: CustomerOption | null;
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
  const [submitting, setSubmitting] = useState(false);
  const [discountType, setDiscountType] = useState<"FIXED" | "PERCENT">("FIXED");
  const [discountValue, setDiscountValue] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [completedSale, setCompletedSale] = useState<CompletedSale | null>(null);
  const [weightProduct, setWeightProduct] = useState<POSProduct | null>(null);
  const [rawHeldSales, setRawHeldSales] = useState<RawHeldSale[]>([]);

  function refreshHeldSales() {
    api
      .get("/held-sales", { params: { storeId } })
      .then((res) => setRawHeldSales(res.data.data))
      .catch(() => {});
  }

  useEffect(() => {
    refreshHeldSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      if (!p.category) continue;
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [products]);

  const quickPicks = useMemo(() => products.filter((p) => p.featured).slice(0, 8), [products]);

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

  function addToCart(product: POSProduct, quantity = 1) {
    if (!product.availableForSale) return;
    if (product.soldByWeight) {
      setWeightProduct(product);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...prev, { product, quantity }];
    });
    toast.success(t.pos.addedToast(product.name));
  }

  function confirmWeight(weight: number) {
    if (!weightProduct) return;
    const product = weightProduct;
    setCart((prev) => {
      const existing = prev.find((l) => l.product.id === product.id);
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: round3(l.quantity + weight) } : l,
        );
      }
      return [...prev, { product, quantity: weight }];
    });
    toast.success(t.pos.addedToast(product.name));
    setWeightProduct(null);
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

  function clearOrder() {
    setCart([]);
    setCustomer(null);
    setDiscountType("FIXED");
    setDiscountValue(0);
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
    const discount = round3(
      discountType === "PERCENT" ? (subtotal * discountValue) / 100 : Math.min(discountValue, subtotal),
    );
    return { subtotal, tax, discount, total: round3(subtotal - discount + tax) };
  }, [cart, discountType, discountValue]);

  async function submitSale(result: CheckoutResult) {
    if (cart.length === 0) {
      toast.error(t.pos.toasts.emptyCart);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/sales", {
        storeId,
        customerId: customer?.id,
        paymentMethod: result.paymentMethod,
        paymentReference: result.paymentReference,
        discountType,
        discountValue,
        tenderedAmount: result.tenderedAmount,
        items: cart.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      });
      const sale = res.data.data;
      setCheckoutOpen(false);
      setCompletedSale({
        id: sale.id,
        number: sale.number,
        total: Number(sale.total),
        changeAmount: sale.changeAmount !== null ? Number(sale.changeAmount) : null,
      });
      clearOrder();
    } catch (err) {
      toast.error(apiErrorMessage(err, t.pos.toasts.failed));
    } finally {
      setSubmitting(false);
    }
  }

  async function holdOrder() {
    if (cart.length === 0) {
      toast.error(t.pos.toasts.emptyCart);
      return;
    }
    try {
      await api.post("/held-sales", {
        storeId,
        customerId: customer?.id,
        discountType,
        discountValue,
        cart: cart.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
      });
      toast.success(t.pos.hold.savedToast);
      clearOrder();
      refreshHeldSales();
    } catch (err) {
      toast.error(apiErrorMessage(err, t.pos.hold.failed));
    }
  }

  function resumeHeld(id: string) {
    const held = rawHeldSales.find((h) => h.id === id);
    if (!held) return;
    const lines: CartLine[] = [];
    for (const entry of held.cart) {
      const product = products.find((p) => p.id === entry.productId);
      if (product) lines.push({ product, quantity: entry.quantity });
    }
    setCart(lines);
    setCustomer(held.customer);
    setDiscountType(held.discountType);
    setDiscountValue(Number(held.discountValue));
    api.delete(`/held-sales/${id}`).finally(refreshHeldSales);
    toast.success(t.pos.hold.resumedToast);
  }

  function deleteHeld(id: string) {
    api
      .delete(`/held-sales/${id}`)
      .then(refreshHeldSales)
      .catch(() => {});
  }

  const heldSummaries: HeldSaleSummary[] = rawHeldSales.map((h) => {
    let total = 0;
    let itemCount = 0;
    for (const entry of h.cart) {
      const product = products.find((p) => p.id === entry.productId);
      if (!product) continue;
      total += entry.quantity * product.price;
      itemCount += 1;
    }
    return {
      id: h.id,
      reference: h.reference,
      createdAt: h.createdAt,
      itemCount,
      total: round3(total),
      customer: h.customer,
    };
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.pos.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.pos.subtitle}</p>
        </div>
        <HeldSalesPopover heldSales={heldSummaries} onResume={resumeHeld} onDelete={deleteHeld} />
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
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              <Button
                type="button"
                size="sm"
                variant={category === null ? "default" : "outline"}
                className="shrink-0"
                onClick={() => setCategory(null)}
              >
                {t.pos.allCategories}
                <span className="ms-1 opacity-70">{products.length}</span>
              </Button>
              {categories.map((c) => (
                <Button
                  key={c.name}
                  type="button"
                  size="sm"
                  variant={category === c.name ? "default" : "outline"}
                  className="shrink-0"
                  onClick={() => setCategory(c.name)}
                >
                  {c.name}
                  <span className="ms-1 opacity-70">{c.count}</span>
                </Button>
              ))}
            </div>
          )}

          {quickPicks.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {t.pos.quickPicks}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {quickPicks.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addToCart(p)}
                    className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm shadow-sm hover:border-primary/40 hover:bg-accent/40"
                  >
                    <span className="font-medium">{p.name}</span>
                    <span className="text-muted-foreground">{formatCurrency(p.price, locale)}</span>
                  </button>
                ))}
              </div>
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
                  disabled={!product.availableForSale}
                  onClick={() => addToCart(product)}
                  className={cn(
                    "relative flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3 text-start shadow-sm transition-colors",
                    product.availableForSale
                      ? "hover:border-primary/40 hover:bg-accent/40"
                      : "cursor-not-allowed opacity-60",
                  )}
                >
                  {!product.availableForSale && (
                    <span className="absolute end-2 top-2 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                      {t.pos.outOfStock}
                    </span>
                  )}
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
                  <span className="text-sm font-semibold">
                    {formatCurrency(product.price, locale)}
                    {product.soldByWeight && (
                      <span className="text-xs font-normal text-muted-foreground"> / {product.unit}</span>
                    )}
                  </span>
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
              <Button type="button" variant="ghost" size="sm" onClick={clearOrder}>
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
                  {line.product.soldByWeight ? (
                    <span className="w-16 text-center text-sm">
                      {line.quantity} {line.product.unit}
                    </span>
                  ) : (
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
                  )}
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

          <DiscountPopover
            discountType={discountType}
            discountValue={discountValue}
            onApply={(type, value) => {
              setDiscountType(type);
              setDiscountValue(value);
            }}
          >
            <button
              type="button"
              className="flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <Tag className="size-3.5" />
              {discountValue > 0
                ? `${t.pos.discount.label} · ${discountType === "PERCENT" ? `${discountValue}%` : formatCurrency(discountValue, locale)}`
                : t.pos.discount.label}
            </button>
          </DiscountPopover>

          <div className="flex flex-col gap-1 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t.pos.summary.subtotal}</span>
              <span>{formatCurrency(totals.subtotal, locale)}</span>
            </div>
            {totals.discount > 0 && (
              <div className="flex items-center justify-between text-muted-foreground">
                <span>{t.pos.summary.discount}</span>
                <span>-{formatCurrency(totals.discount, locale)}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-muted-foreground">
              <span>{t.pos.summary.tax}</span>
              <span>{formatCurrency(totals.tax, locale)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-base font-semibold">
              <span>{t.pos.summary.total}</span>
              <span>{formatCurrency(totals.total, locale)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              disabled={cart.length === 0}
              onClick={holdOrder}
            >
              {t.pos.hold.button}
            </Button>
            <Button
              type="button"
              size="lg"
              className="flex-[2]"
              disabled={cart.length === 0}
              onClick={() => setCheckoutOpen(true)}
            >
              {t.pos.completeSale}
            </Button>
          </div>
        </Card>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        total={totals.total}
        itemCount={cart.length}
        submitting={submitting}
        onSubmit={submitSale}
      />

      <SaleCompleteModal
        sale={completedSale}
        onClose={() => setCompletedSale(null)}
        onNewSale={() => setCompletedSale(null)}
      />

      <WeightEntryModal
        product={weightProduct}
        onClose={() => setWeightProduct(null)}
        onConfirm={confirmWeight}
      />
    </div>
  );
}
