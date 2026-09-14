"use client";

import { useState } from "react";

import { useDictionary } from "@/i18n/dictionary-context";
import { CategoriesPanel } from "@/components/product-setup/categories-panel";
import { BrandsPanel } from "@/components/product-setup/brands-panel";
import { UnitsPanel } from "@/components/product-setup/units-panel";
import { UnitCategoriesPanel } from "@/components/product-setup/unit-categories-panel";

const TABS = ["categories", "brands", "units", "unitCategories"] as const;
type Tab = (typeof TABS)[number];

export function ProductSetupTabs({
  categories,
  brands,
  units,
  unitCategories,
  taxes,
}: {
  categories: Parameters<typeof CategoriesPanel>[0]["initial"];
  brands: Parameters<typeof BrandsPanel>[0]["initial"];
  units: Parameters<typeof UnitsPanel>[0]["initial"];
  unitCategories: Parameters<typeof UnitCategoriesPanel>[0]["initial"];
  taxes: { id: string; name: string }[];
}) {
  const { t, locale } = useDictionary();
  const s = t.products.productSetup;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [tab, setTab] = useState<Tab>("categories");

  return (
    <div dir={dir} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{s.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{s.subtitle}</p>
      </div>

      <div className="flex gap-5 border-b border-border">
        {TABS.map((tb) => (
          <button
            key={tb}
            type="button"
            onClick={() => setTab(tb)}
            className={
              tab === tb
                ? "border-b-2 border-primary pb-2.5 text-sm font-semibold text-primary"
                : "border-b-2 border-transparent pb-2.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            }
          >
            {s.tabs[tb]}
          </button>
        ))}
      </div>

      {tab === "categories" && <CategoriesPanel initial={categories} taxes={taxes} />}
      {tab === "brands" && <BrandsPanel initial={brands} />}
      {tab === "units" && <UnitsPanel initial={units} unitCategories={unitCategories} />}
      {tab === "unitCategories" && <UnitCategoriesPanel initial={unitCategories} />}
    </div>
  );
}
