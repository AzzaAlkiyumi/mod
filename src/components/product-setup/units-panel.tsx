"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDictionary } from "@/i18n/dictionary-context";
import { ConfirmDeleteDialog } from "@/components/product-setup/confirm-delete-dialog";

interface UnitRow {
  id: string;
  shortCode: string;
  displayName: string;
  measurementCategoryId: string;
  measurementCategory: { id: string; name: string };
  baseUnitId: string | null;
  baseUnit: { id: string; displayName: string } | null;
  conversionFactor: number | null;
  active: boolean;
}

const emptyForm = {
  shortCode: "",
  displayName: "",
  measurementCategoryId: "",
  baseUnitId: "",
  conversionFactor: "",
  active: true,
};

export function UnitsPanel({
  initial,
  unitCategories,
}: {
  initial: UnitRow[];
  unitCategories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { t } = useDictionary();
  const s = t.products.productSetup;

  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UnitRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  function selectNew() {
    setSelectedId("new");
    setForm(emptyForm);
  }

  function selectExisting(row: UnitRow) {
    setSelectedId(row.id);
    setForm({
      shortCode: row.shortCode,
      displayName: row.displayName,
      measurementCategoryId: row.measurementCategoryId,
      baseUnitId: row.baseUnitId ?? "",
      conversionFactor: row.conversionFactor !== null ? String(row.conversionFactor) : "",
      active: row.active,
    });
  }

  async function handleSave() {
    if (!form.shortCode.trim() || !form.displayName.trim() || !form.measurementCategoryId) {
      toast.error(s.common.fixRequired);
      return;
    }
    setSaving(true);
    try {
      const isNew = selectedId === "new";
      const res = await fetch(isNew ? "/api/units" : `/api/units/${selectedId}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shortCode: form.shortCode.trim(),
          displayName: form.displayName.trim(),
          measurementCategoryId: form.measurementCategoryId,
          baseUnitId: form.baseUnitId || undefined,
          conversionFactor: form.conversionFactor || undefined,
          active: form.active,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.formErrors?.[0] ?? s.common.saveFailed);
      }
      toast.success(isNew ? s.common.createdToast : s.common.updatedToast);
      setSelectedId(null);
      setItems((prev) => {
        if (isNew) return [...prev, json.data].sort((a, b) => a.displayName.localeCompare(b.displayName));
        return prev.map((it) => (it.id === json.data.id ? json.data : it));
      });
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : s.common.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/units/${deleteTarget.id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.formErrors?.[0] ?? s.common.deleteFailed);
      }
      toast.success(s.common.deletedToast);
      setItems((prev) => prev.filter((it) => it.id !== deleteTarget.id));
      if (selectedId === deleteTarget.id) setSelectedId(null);
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : s.common.deleteFailed);
    } finally {
      setDeleting(false);
    }
  }

  const otherUnits = items.filter((it) => it.id !== selectedId);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="text-sm font-semibold">{s.units.countLabel(items.length)}</h2>
          <Button type="button" size="sm" onClick={selectNew}>
            <Plus className="size-4" /> {s.units.newItem}
          </Button>
        </div>
        <div className="divide-y divide-border border-t border-border">
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">{s.units.empty}</p>
          )}
          {items.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => selectExisting(row)}
              className={
                "flex w-full items-center justify-between px-4 py-3 text-start hover:bg-accent " +
                (selectedId === row.id ? "bg-accent" : "")
              }
            >
              <div>
                <div className="text-sm font-medium">
                  {row.displayName} <span className="text-muted-foreground">({row.shortCode})</span>
                </div>
                <div className="text-xs text-muted-foreground">{row.measurementCategory.name}</div>
              </div>
              {!row.active && (
                <span className="text-xs text-muted-foreground">{s.common.inactive}</span>
              )}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedId === "new"
              ? s.units.newItem
              : selectedId
                ? s.common.editTitle
                : s.common.selectPrompt}
          </CardTitle>
        </CardHeader>
        {selectedId && (
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit-code">{s.units.shortCode}</Label>
              <Input
                id="unit-code"
                value={form.shortCode}
                onChange={(e) => setForm((f) => ({ ...f, shortCode: e.target.value }))}
                placeholder={s.units.shortCodePlaceholder}
                dir="ltr"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit-display">{s.units.displayName}</Label>
              <Input
                id="unit-display"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder={s.units.displayNamePlaceholder}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit-category">{s.units.measurementCategory}</Label>
              <Select
                value={form.measurementCategoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, measurementCategoryId: v }))}
              >
                <SelectTrigger id="unit-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {unitCategories.map((uc) => (
                    <SelectItem key={uc.id} value={uc.id}>
                      {uc.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="unit-base">{s.units.baseUnit}</Label>
              <Select
                value={form.baseUnitId}
                onValueChange={(v) => setForm((f) => ({ ...f, baseUnitId: v }))}
              >
                <SelectTrigger id="unit-base">
                  <SelectValue placeholder={s.units.noBaseUnit} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{s.units.noBaseUnit}</SelectItem>
                  {otherUnits.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{s.units.baseUnitHint}</p>
            </div>
            {form.baseUnitId && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="unit-factor">{s.units.conversionFactor}</Label>
                <Input
                  id="unit-factor"
                  type="number"
                  step="0.000001"
                  value={form.conversionFactor}
                  onChange={(e) => setForm((f) => ({ ...f, conversionFactor: e.target.value }))}
                />
              </div>
            )}
            <label className="flex items-center gap-2.5">
              <Checkbox
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v === true }))}
              />
              <span className="text-sm font-medium">{s.common.active}</span>
            </label>

            <div className="flex items-center justify-between border-t border-border pt-4">
              {selectedId !== "new" ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => {
                    const row = items.find((it) => it.id === selectedId);
                    if (row) setDeleteTarget(row);
                  }}
                >
                  <Trash2 className="size-4" /> {s.common.delete}
                </Button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setSelectedId(null)}>
                  {s.common.discard}
                </Button>
                <Button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? s.common.saving : s.common.save}
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={s.common.confirmDeleteTitle(deleteTarget?.displayName ?? "")}
        description={s.common.confirmDeleteDescription}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
