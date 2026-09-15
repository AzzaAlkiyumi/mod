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
import { cn } from "@/lib/utils";
import { useDictionary } from "@/i18n/dictionary-context";
import { ConfirmDeleteDialog } from "@/components/product-setup/confirm-delete-dialog";
import { api, apiErrorMessage } from "@/lib/api";

const ICON_COLORS = ["orange", "indigo", "green", "yellow", "pink", "cyan", "purple", "gray"];
const ICON_COLOR_CLASS: Record<string, string> = {
  orange: "bg-orange-500",
  indigo: "bg-indigo-500",
  green: "bg-green-500",
  yellow: "bg-yellow-400",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
  purple: "bg-purple-500",
  gray: "bg-gray-400",
};

interface CategoryRow {
  id: string;
  name: string;
  iconColor: string;
  taxId: string | null;
  tax: { id: string; name: string } | null;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  active: boolean;
}

const emptyForm = { name: "", iconColor: "orange", taxId: "", parentId: "", active: true };

export function CategoriesPanel({
  initial,
  taxes,
}: {
  initial: CategoryRow[];
  taxes: { id: string; name: string }[];
}) {
  const { t } = useDictionary();
  const s = t.products.productSetup;

  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  function selectNew() {
    setSelectedId("new");
    setForm(emptyForm);
  }

  function selectExisting(row: CategoryRow) {
    setSelectedId(row.id);
    setForm({
      name: row.name,
      iconColor: row.iconColor,
      taxId: row.taxId ?? "",
      parentId: row.parentId ?? "",
      active: row.active,
    });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error(s.common.fixRequired);
      return;
    }
    setSaving(true);
    try {
      const isNew = selectedId === "new";
      const payload = {
        name: form.name.trim(),
        iconColor: form.iconColor,
        taxId: form.taxId || undefined,
        parentId: form.parentId || undefined,
        active: form.active,
      };
      const res = isNew
        ? await api.post("/categories", payload)
        : await api.patch(`/categories/${selectedId}`, payload);
      toast.success(isNew ? s.common.createdToast : s.common.updatedToast);
      setSelectedId(null);
      setItems((prev) => {
        if (isNew) return [...prev, res.data.data].sort((a, b) => a.name.localeCompare(b.name));
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
      await api.delete(`/categories/${deleteTarget.id}`);
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

  const otherCategories = items.filter((it) => it.id !== selectedId);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="text-sm font-semibold">{s.categories.countLabel(items.length)}</h2>
          <Button type="button" size="sm" onClick={selectNew}>
            <Plus className="size-4" /> {s.categories.newItem}
          </Button>
        </div>
        <div className="divide-y divide-border border-t border-border">
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {s.categories.empty}
            </p>
          )}
          {items.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => selectExisting(row)}
              className={
                "flex w-full items-center gap-3 px-4 py-3 text-start hover:bg-accent " +
                (selectedId === row.id ? "bg-accent" : "")
              }
            >
              <span
                className={cn(
                  "size-2.5 shrink-0 rounded-full",
                  ICON_COLOR_CLASS[row.iconColor] ?? ICON_COLOR_CLASS.gray,
                )}
              />
              <div className="flex-1">
                <div className="text-sm font-medium">{row.name}</div>
                {row.parent && (
                  <div className="text-xs text-muted-foreground">
                    {s.categories.under(row.parent.name)}
                  </div>
                )}
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
              ? s.categories.newItem
              : selectedId
                ? s.common.editTitle
                : s.common.selectPrompt}
          </CardTitle>
        </CardHeader>
        {selectedId && (
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-name">{s.categories.name}</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-parent">{s.categories.parentCategory}</Label>
              <Select
                value={form.parentId}
                onValueChange={(v) => setForm((f) => ({ ...f, parentId: v }))}
              >
                <SelectTrigger id="cat-parent">
                  <SelectValue placeholder={s.categories.noParent} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{s.categories.noParent}</SelectItem>
                  {otherCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cat-tax">{s.categories.taxRule}</Label>
              <Select
                value={form.taxId}
                onValueChange={(v) => setForm((f) => ({ ...f, taxId: v }))}
              >
                <SelectTrigger id="cat-tax">
                  <SelectValue placeholder={s.categories.noTaxOverride} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{s.categories.noTaxOverride}</SelectItem>
                  {taxes.map((tx) => (
                    <SelectItem key={tx.id} value={tx.id}>
                      {tx.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{s.categories.iconColor}</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, iconColor: color }))}
                    className={cn(
                      "size-6 rounded-full ring-offset-2 ring-offset-background",
                      ICON_COLOR_CLASS[color],
                      form.iconColor === color && "ring-2 ring-primary",
                    )}
                    aria-label={color}
                  />
                ))}
              </div>
            </div>
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
        title={s.common.confirmDeleteTitle(deleteTarget?.name ?? "")}
        description={s.common.confirmDeleteDescription}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
