"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
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

interface ComponentOption {
  id: string;
  name: string;
  code: string;
  rate: number;
}

interface ClassificationOption {
  id: string;
  name: string;
}

interface GroupRow {
  id: string;
  code: string;
  name: string;
  classificationId: string;
  classification: ClassificationOption;
  components: { taxComponent: ComponentOption }[];
  rate: number;
  pricesIncludeTax: boolean;
  isDefault: boolean;
  active: boolean;
  _count: { products: number; categories: number };
}

const emptyForm = {
  code: "",
  name: "",
  classificationId: "",
  componentIds: [] as string[],
  pricesIncludeTax: false,
  isDefault: false,
  active: true,
};

export function TaxGroupsPanel({
  initial,
  classifications,
  components,
}: {
  initial: GroupRow[];
  classifications: ClassificationOption[];
  components: ComponentOption[];
}) {
  const router = useRouter();
  const { t, locale } = useDictionary();
  const s = t.products.taxManagement;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<GroupRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const combinedRate = useMemo(
    () =>
      components
        .filter((c) => form.componentIds.includes(c.id))
        .reduce((sum, c) => sum + c.rate, 0),
    [components, form.componentIds],
  );

  function selectNew() {
    setSelectedId("new");
    setForm(emptyForm);
  }

  function selectExisting(row: GroupRow) {
    setSelectedId(row.id);
    setForm({
      code: row.code,
      name: row.name,
      classificationId: row.classificationId,
      componentIds: row.components.map((c) => c.taxComponent.id),
      pricesIncludeTax: row.pricesIncludeTax,
      isDefault: row.isDefault,
      active: row.active,
    });
  }

  function toggleComponent(id: string) {
    setForm((f) => ({
      ...f,
      componentIds: f.componentIds.includes(id)
        ? f.componentIds.filter((c) => c !== id)
        : [...f.componentIds, id],
    }));
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim() || !form.classificationId || form.componentIds.length === 0) {
      toast.error(s.common.fixRequired);
      return;
    }
    setSaving(true);
    try {
      const isNew = selectedId === "new";
      const res = await fetch(isNew ? "/api/tax-groups" : `/api/tax-groups/${selectedId}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim(),
          name: form.name.trim(),
          classificationId: form.classificationId,
          componentIds: form.componentIds,
          pricesIncludeTax: form.pricesIncludeTax,
          isDefault: form.isDefault,
          active: form.active,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.formErrors?.[0] ?? s.common.saveFailed);
      }
      toast.success(isNew ? s.common.createdToast : s.common.updatedToast);
      setSelectedId(null);
      router.refresh();
      setItems((prev) => {
        const withoutOldDefault = form.isDefault
          ? prev.map((it) => ({ ...it, isDefault: it.id === json.data.id ? true : false }))
          : prev;
        if (isNew) return [...withoutOldDefault, json.data].sort((a, b) => a.name.localeCompare(b.name));
        return withoutOldDefault.map((it) => (it.id === json.data.id ? json.data : it));
      });
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
      const res = await fetch(`/api/tax-groups/${deleteTarget.id}`, { method: "DELETE" });
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

  return (
    <div dir={dir} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{s.groups.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{s.groups.subtitle}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="text-sm font-semibold">{s.groups.countLabel(items.length)}</h2>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/tax-management/classifications"
              className="text-xs text-muted-foreground underline-offset-2 hover:underline"
            >
              {s.groups.viewClassifications}
            </Link>
            <Button type="button" size="sm" onClick={selectNew}>
              <Plus className="size-4" /> {s.groups.newItem}
            </Button>
          </div>
        </div>
        <div className="divide-y divide-border border-t border-border">
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {s.groups.empty}
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
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-medium">
                  {row.name}
                  {row.isDefault && (
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {s.groups.useAsDefault}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground" dir="ltr">
                  {row.code} · {row.classification.name} · {row.rate}%
                </div>
              </div>
              <span className="text-xs text-muted-foreground">
                {s.groups.inUse((row._count?.products ?? 0) + (row._count?.categories ?? 0))}
              </span>
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
              ? s.groups.newItem
              : selectedId
                ? s.common.editTitle
                : s.common.selectPrompt}
          </CardTitle>
        </CardHeader>
        {selectedId && (
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tg-code">{s.groups.code}</Label>
              <Input
                id="tg-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder={s.groups.codePlaceholder}
                dir="ltr"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tg-name">{s.groups.name}</Label>
              <Input
                id="tg-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tg-classification">{s.groups.classification}</Label>
              <Select
                value={form.classificationId}
                onValueChange={(v) => setForm((f) => ({ ...f, classificationId: v }))}
              >
                <SelectTrigger id="tg-classification">
                  <SelectValue placeholder={s.groups.classificationPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {classifications.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>{s.groups.componentsLabel}</Label>
              <div className="flex max-h-40 flex-col gap-1.5 overflow-y-auto rounded-md border border-border p-2.5">
                {components.map((c) => (
                  <label key={c.id} className="flex items-center gap-2.5">
                    <Checkbox
                      checked={form.componentIds.includes(c.id)}
                      onCheckedChange={() => toggleComponent(c.id)}
                    />
                    <span className="text-sm">
                      {c.name} <span className="text-muted-foreground">({c.rate}%)</span>
                    </span>
                  </label>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{s.groups.componentsHint}</p>
              <div className="mt-1 flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {s.groups.combinedRate}
                </span>
                <span className="text-sm font-semibold">{combinedRate}%</span>
              </div>
            </div>
            <label className="flex items-center gap-2.5">
              <Checkbox
                checked={form.pricesIncludeTax}
                onCheckedChange={(v) => setForm((f) => ({ ...f, pricesIncludeTax: v === true }))}
              />
              <span className="text-sm font-medium">{s.groups.pricesIncludeTax}</span>
            </label>
            <label className="flex items-center gap-2.5">
              <Checkbox
                checked={form.isDefault}
                onCheckedChange={(v) => setForm((f) => ({ ...f, isDefault: v === true }))}
              />
              <span className="text-sm font-medium">{s.groups.useAsDefault}</span>
            </label>
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
      </div>

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
