"use client";

import { useState } from "react";
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
import { CURRENCY_CATALOG } from "@/lib/currencies";
import { useDictionary } from "@/i18n/dictionary-context";

export function CurrencyCombobox({
  value,
  onChange,
}: {
  value: string;
  onChange: (code: string) => void;
}) {
  const { t } = useDictionary();
  const s = t.settings.currency;
  const [open, setOpen] = useState(false);
  const selected = CURRENCY_CATALOG.find((c) => c.code === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full justify-between font-normal"
        >
          <span className="truncate">
            {selected ? `${selected.code} — ${selected.name}` : s.baseCurrencyPlaceholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={s.baseCurrencySearchPlaceholder} />
          <CommandList>
            <CommandEmpty>{s.baseCurrencyEmpty}</CommandEmpty>
            <CommandGroup>
              {CURRENCY_CATALOG.map((currency) => (
                <CommandItem
                  key={currency.code}
                  value={`${currency.code} ${currency.name}`}
                  onSelect={() => {
                    onChange(currency.code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn("size-4", currency.code === value ? "opacity-100" : "opacity-0")}
                  />
                  {currency.code} — {currency.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
