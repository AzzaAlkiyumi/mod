"use client";

import { useEffect, useState } from "react";
import { Camera, ScanBarcode } from "lucide-react";
import { toast } from "sonner";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import type { ProductWithTax } from "@/lib/types";

export function ProductSelector({
  onSelect,
  excludeIds,
}: {
  onSelect: (product: ProductWithTax) => void;
  excludeIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [barcode, setBarcode] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<ProductWithTax[]>([]);

  useEffect(() => {
    if (!query) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/products?q=${encodeURIComponent(query)}`);
      const json = await res.json();
      if (!cancelled) setResults(json.data ?? []);
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [query]);

  async function handleBarcodeSubmit() {
    if (!barcode.trim()) return;
    const res = await fetch(`/api/products?q=${encodeURIComponent(barcode.trim())}`);
    const json = await res.json();
    const products: ProductWithTax[] = json.data ?? [];
    const exact = products.find((p) => p.barcode === barcode.trim() || p.sku === barcode.trim());
    if (exact) {
      if (excludeIds.includes(exact.id)) {
        toast.error(`${exact.name} is already on this quotation — adjust the quantity instead`);
      } else {
        onSelect(exact);
        toast.success(`${exact.name} added`);
      }
    } else {
      toast.error(`No product matches barcode "${barcode}"`);
    }
    setBarcode("");
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 rounded-md border border-input bg-background px-3 shadow-sm">
        <ScanBarcode className="size-4 text-muted-foreground" />
        <input
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleBarcodeSubmit();
            }
          }}
          placeholder="Scan a product barcode"
          className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          F8
        </kbd>
        <button
          type="button"
          aria-label="Scan with camera"
          title="Camera barcode scanning is not implemented in this rebuild — see QUOTATION_AUDIT.md"
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
          onClick={() =>
            toast.info("Camera scanning isn't wired up in this rebuild — type or paste a barcode instead.")
          }
        >
          <Camera className="size-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Add product
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverAnchor asChild>
            <Input
              placeholder="Search product, SKU, or barcode..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => query && setOpen(true)}
            />
          </PopoverAnchor>
          <PopoverContent
            className="w-(--radix-popover-anchor-width) p-0"
            align="start"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false}>
              <CommandList>
                <CommandEmpty>No products found.</CommandEmpty>
                <CommandGroup>
                  {(query ? results : []).map((product) => {
                    const alreadyAdded = excludeIds.includes(product.id);
                    return (
                      <CommandItem
                        key={product.id}
                        disabled={alreadyAdded}
                        onSelect={() => {
                          onSelect(product);
                          setQuery("");
                          setResults([]);
                          setOpen(false);
                        }}
                      >
                        <span className="flex flex-1 flex-col">
                          <span>{product.name}</span>
                          <span className="text-xs text-muted-foreground">
                            SKU {product.sku}
                            {product.barcode ? ` · ${product.barcode}` : ""}
                            {alreadyAdded ? " · already added" : ""}
                          </span>
                        </span>
                        <span className="text-sm font-medium">
                          {formatCurrency(product.price)}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
