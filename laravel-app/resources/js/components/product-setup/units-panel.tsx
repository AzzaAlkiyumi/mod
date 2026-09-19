import { useState } from "react";
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
import { api, apiErrorMessage } from "@/lib/api";

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
    // A unit is either a base unit (neither field set) or converts to one
    // (both set) — half-filled would silently save a broken conversion.
    if (form.baseUnitId && !form.conversionFactor.trim()) {
      toast.error(s.common.fixRequired);
      return;
    }
    setSaving(true);
    try {
      const isNew = selectedId === "new";
      const payload = {
        shortCode: form.shortCode.trim(),
        displayName: form.displayName.trim(),
        measurementCategoryId: form.measurementCategoryId,
        // Explicit null (not an omitted key) so clearing the base unit or
        // factor on an existing row actually persists — omitting the key
        // here would leave the previously-saved value untouched instead.
        baseUnitId: form.baseUnitId || null,
        conversionFactor: form.baseUnitId ? form.conversionFactor.trim() : null,
        active: form.active,
      };
      const res = isNew
        ? await api.post("/units", payload)
        : await api.patch(`/units/${selectedId}`, payload);
      toast.success(isNew ? s.common.createdToast : s.common.updatedToast);
      setSelectedId(null);
      setItems((prev) => {
        if (isNew) {
          return [...prev, res.data.data].sort((a, b) => a.displayName.localeCompare(b.displayName));
        }
        return prev.map((it) => (it.id === res.data.data.id ? res.data.data : it));
      });
    } catch (err) {
      toast.error(apiErrorMessage(err, s.common.saveFailed));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/units/${deleteTarget.id}`);
      toast.success(s.common.deletedToast);
      setItems((prev) => prev.filter((it) => it.id !== deleteTarget.id));
      if (selectedId === deleteTarget.id) setSelectedId(null);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, s.common.deleteFailed));
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
                <Label htmlFor="unit-factor">
                  {s.units.conversionFactor} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="unit-factor"
                  type="number"
                  step="0.000001"
                  min="0"
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
