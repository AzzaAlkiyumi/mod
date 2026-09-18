import { useMemo, useState } from "react";
import {
    Banknote,
    Building2,
    CreditCard,
    QrCode,
    Receipt,
    Smartphone,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn, formatCurrency } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";

export type PaymentMethod =
    | "CASH"
    | "QR"
    | "CARD"
    | "UPI"
    | "BANK_TRANSFER"
    | "CHEQUE";

export interface CheckoutResult {
    paymentMethod: PaymentMethod;
    paymentReference?: string;
    tenderedAmount?: number;
}

const REFERENCE_METHODS: PaymentMethod[] = [
    "CARD",
    "UPI",
    "BANK_TRANSFER",
    "CHEQUE",
];

function roundUp(value: number) {
    return Math.max(Math.ceil(value), 1);
}

/** Purely decorative placeholder QR — the video's "Charge via QR" step is a
 * mocked/shape-only flow per product decision (no real payment gateway or
 * WhatsApp Business API integration exists), so this renders a stable
 * pseudo-random grid instead of a scannable code. */
function FakeQrCode({ seed }: { seed: string }) {
    const cells = useMemo(() => {
        let h = 0;
        for (let i = 0; i < seed.length; i++)
            h = (h * 31 + seed.charCodeAt(i)) >>> 0;
        const result: boolean[] = [];
        for (let i = 0; i < 121; i++) {
            h = (h * 1103515245 + 12345) >>> 0;
            result.push((h >> 16) % 3 !== 0);
        }
        return result;
    }, [seed]);

    return (
        <div className="grid aspect-square w-full max-w-[220px] grid-cols-11 gap-0.5 rounded-lg border border-border bg-white p-3">
            {cells.map((filled, i) => (
                <div
                    key={i}
                    className={cn(
                        "aspect-square rounded-[1px]",
                        filled ? "bg-black" : "bg-white",
                    )}
                />
            ))}
        </div>
    );
}

/** Owns all of the payment-method/amount/reference state — mounted fresh
 * each time the dialog opens (see `open && <CheckoutForm .../>` below), so
 * the cash-given field always starts synced to the current total instead of
 * a value captured whenever this component instance first mounted. */
function CheckoutForm({
    onOpenChange,
    total,
    itemCount,
    onSubmit,
    submitting,
}: {
    onOpenChange: (open: boolean) => void;
    total: number;
    itemCount: number;
    onSubmit: (result: CheckoutResult) => void;
    submitting: boolean;
}) {
    const { t, locale } = useDictionary();
    const s = t.pos.checkout;
    const [method, setMethod] = useState<PaymentMethod>("CASH");
    const [cashGiven, setCashGiven] = useState(() => String(total));
    const [reference, setReference] = useState("");
    const [qrConfirming, setQrConfirming] = useState(false);

    const cashGivenNumber = Number(cashGiven) || 0;
    const changeDue = Math.max(cashGivenNumber - total, 0);
    const quickAmounts = useMemo(() => {
        const amounts = [total, roundUp(total), 50, 100, 500].map(
            (a) => Math.round(a * 100) / 100,
        );
        return Array.from(new Set(amounts)).slice(0, 4);
    }, [total]);

    const methods: {
        id: PaymentMethod;
        label: string;
        hint: string;
        icon: React.ReactNode;
    }[] = [
        {
            id: "CASH",
            label: t.pos.payment.CASH,
            hint: s.withChange,
            icon: <Banknote className="size-4" />,
        },
        {
            id: "QR",
            label: t.pos.payment.QR,
            hint: s.customerPicksGateway,
            icon: <QrCode className="size-4" />,
        },
        {
            id: "CARD",
            label: t.pos.payment.CARD,
            hint: s.withReference,
            icon: <CreditCard className="size-4" />,
        },
        {
            id: "UPI",
            label: t.pos.payment.UPI,
            hint: s.withReference,
            icon: <Smartphone className="size-4" />,
        },
        {
            id: "BANK_TRANSFER",
            label: t.pos.payment.BANK_TRANSFER,
            hint: s.withReference,
            icon: <Building2 className="size-4" />,
        },
        {
            id: "CHEQUE",
            label: t.pos.payment.CHEQUE,
            hint: s.withReference,
            icon: <Receipt className="size-4" />,
        },
    ];

    function handleSubmit() {
        if (method === "CASH") {
            onSubmit({
                paymentMethod: "CASH",
                tenderedAmount: cashGivenNumber,
            });
            return;
        }
        if (method === "QR") {
            onSubmit({ paymentMethod: "QR" });
            return;
        }
        onSubmit({
            paymentMethod: method,
            paymentReference: reference.trim() || undefined,
        });
    }

    return (
        <>
            <div className="col-span-full border-b border-border p-5">
                <DialogTitle>{s.title}</DialogTitle>
                <p className="text-sm text-muted-foreground">
                    {s.draftItems(itemCount)}
                </p>
            </div>

            <div className="flex flex-col gap-1 border-e border-border p-3">
                {methods.map((m) => (
                    <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                            setMethod(m.id);
                            setQrConfirming(false);
                        }}
                        className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2.5 text-start transition-colors",
                            method === m.id
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-accent",
                        )}
                    >
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
                            {m.icon}
                        </span>
                        <span className="flex flex-col">
                            <span className="text-sm font-medium">
                                {m.label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {m.hint}
                            </span>
                        </span>
                    </button>
                ))}
            </div>

            <div className="flex flex-col gap-4 p-5">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {s.totalDue}
                    </span>
                    <span className="text-2xl font-semibold">
                        {formatCurrency(total, locale)}
                    </span>
                </div>

                {method === "CASH" && (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {s.cashGiven}
                            </label>
                            <div className="flex items-center gap-2 rounded-md border border-primary/50 bg-background px-3 shadow-sm ring-2 ring-primary/20">
                                <span className="text-sm text-muted-foreground">
                                    $
                                </span>
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    min={0}
                                    step="0.01"
                                    value={cashGiven}
                                    onChange={(e) =>
                                        setCashGiven(e.target.value)
                                    }
                                    className="h-11 flex-1 bg-transparent text-lg font-medium outline-none"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {quickAmounts.map((amount) => (
                                <Button
                                    key={amount}
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCashGiven(String(amount))}
                                >
                                    {formatCurrency(amount, locale)}
                                </Button>
                            ))}
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-3">
                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {s.changeDue}
                            </span>
                            <span className="text-lg font-semibold">
                                {formatCurrency(changeDue, locale)}
                            </span>
                        </div>
                        <Button
                            size="lg"
                            disabled={submitting || cashGivenNumber < total}
                            onClick={handleSubmit}
                        >
                            {submitting ? s.submitting : s.acceptCash}
                        </Button>
                    </>
                )}

                {method === "QR" && (
                    <div className="flex flex-col items-center gap-3 py-2 text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                            <span className="size-1.5 animate-pulse rounded-full bg-amber-500" />
                            {s.qrWaiting}
                        </span>
                        <FakeQrCode seed={`${total}-${itemCount}`} />
                        <p className="max-w-xs text-xs text-muted-foreground">
                            {s.qrHelp}
                        </p>
                        <div className="mt-2 flex w-full flex-col gap-2">
                            <Button
                                size="lg"
                                disabled={submitting}
                                onClick={() => {
                                    setQrConfirming(true);
                                    onSubmit({ paymentMethod: "QR" });
                                }}
                            >
                                {submitting || qrConfirming
                                    ? s.submitting
                                    : s.qrConfirm}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                            >
                                {s.cancelPayment}
                            </Button>
                        </div>
                    </div>
                )}

                {REFERENCE_METHODS.includes(method) && (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                {s.reference}
                            </label>
                            <Input
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder={s.referencePlaceholder}
                            />
                            <p className="text-xs text-muted-foreground">
                                {s.referenceHelp}
                            </p>
                        </div>
                        <Button
                            size="lg"
                            disabled={submitting}
                            onClick={handleSubmit}
                        >
                            {submitting ? s.submitting : s.takePayment}
                        </Button>
                    </>
                )}
            </div>
        </>
    );
}

export function CheckoutModal({
    open,
    onOpenChange,
    total,
    itemCount,
    onSubmit,
    submitting,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    total: number;
    itemCount: number;
    onSubmit: (result: CheckoutResult) => void;
    submitting: boolean;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="grid max-w-3xl gap-0 overflow-hidden p-0 sm:grid-cols-[240px_1fr]">
                {open && (
                    <CheckoutForm
                        onOpenChange={onOpenChange}
                        total={total}
                        itemCount={itemCount}
                        onSubmit={onSubmit}
                        submitting={submitting}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
