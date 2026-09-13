"use client";

import { useEffect, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDictionary } from "@/i18n/dictionary-context";

export interface CustomerOption {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  billingAddress: string | null;
  shippingAddress: string | null;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
}

export function CustomerSelector({
  value,
  onChange,
  emptyLabel,
}: {
  value: CustomerOption | null;
  onChange: (customer: CustomerOption | null) => void;
  /** Label shown for "no customer selected", both as the trigger placeholder
   * and the clear option. Defaults to the quotation form's "use prospect
   * details" copy; pass something like "Walk-in customer" for a context
   * (e.g. POS) that has no prospect-details fields of its own. */
  emptyLabel?: string;
}) {
  const { t } = useDictionary();
  const empty = emptyLabel ?? t.form.details.useProspectDetails;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      if (cancelled) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (!cancelled) setCustomers(json.data ?? []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [open, query]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-9 w-full justify-between font-normal"
        >
          <span className={cn("truncate", !value && "text-muted-foreground")}>
            {value
              ? `${value.name} · ${value.phone ?? value.code}`
              : empty}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={t.form.details.searchCustomers}
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {!loading && <CommandEmpty>{t.form.details.noCustomersFound}</CommandEmpty>}
            <CommandGroup>
              <CommandItem
                value="__prospect__"
                onSelect={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                <Check className={cn("size-4", value ? "opacity-0" : "opacity-100")} />
                {empty}
              </CommandItem>
              {customers.map((customer) => (
                <CommandItem
                  key={customer.id}
                  value={customer.id}
                  onSelect={() => {
                    onChange(customer);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("size-4", value?.id === customer.id ? "opacity-100" : "opacity-0")}
                  />
                  <span className="flex flex-col">
                    <span>
                      {customer.name} · {customer.phone ?? customer.code}
                    </span>
                    <span className="text-xs text-muted-foreground">{customer.code}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
