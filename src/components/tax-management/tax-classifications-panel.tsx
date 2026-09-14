"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useDictionary } from "@/i18n/dictionary-context";
import { ConfirmDeleteDialog } from "@/components/product-setup/confirm-delete-dialog";

interface ClassificationRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  active: boolean;
}

const emptyForm = { name: "", slug: "", description: "", sortOrder: "0", active: true };

export function TaxClassificationsPanel({ initial }: { initial: ClassificationRow[] }) {
  const router = useRouter();
  const { t, locale } = useDictionary();
  const s = t.products.taxManagement;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassificationRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  function selectNew() {
    setSelectedId("new");
    setForm(emptyForm);
  }

  function selectExisting(row: ClassificationRow) {
    setSelectedId(row.id);
    setForm({
      name: row.name,
      slug: row.slug,
      description: row.description ?? "",
      sortOrder: String(row.sortOrder),
      active: row.active,
    });
  }

  async function handleSave() {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error(s.common.fixRequired);
      return;
    }
    setSaving(true);
    try {
      const isNew = selectedId === "new";
      const res = await fetch(
        isNew ? "/api/tax-classifications" : `/api/tax-classifications/${selectedId}`,
        {
          method: isNew ? "POST" : "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            slug: form.slug.trim(),
            description: form.description.trim() || undefined,
            sortOrder: form.sortOrder,
            active: form.active,
          }),
        },
      );
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.formErrors?.[0] ?? s.common.saveFailed);
      }
      toast.success(isNew ? s.common.createdToast : s.common.updatedToast);
      setSelectedId(null);
      setItems((prev) => {
        if (isNew) return [...prev, json.data].sort((a, b) => a.sortOrder - b.sortOrder);
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
      const res = await fetch(`/api/tax-classifications/${deleteTarget.id}`, {
        method: "DELETE",
      });
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
        <h1 className="text-2xl font-semibold tracking-tight">{s.classifications.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{s.classifications.subtitle}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="text-sm font-semibold">{s.classifications.countLabel(items.length)}</h2>
          <Button type="button" size="sm" onClick={selectNew}>
            <Plus className="size-4" /> {s.classifications.newItem}
          </Button>
        </div>
        <div className="divide-y divide-border border-t border-border">
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {s.classifications.empty}
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
                <div className="text-sm font-medium">{row.name}</div>
                <div className="text-xs text-muted-foreground">{row.slug}</div>
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
              ? s.classifications.newItem
              : selectedId
                ? s.common.editTitle
                : s.common.selectPrompt}
          </CardTitle>
        </CardHeader>
        {selectedId && (
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tc-name">{s.classifications.name}</Label>
              <Input
                id="tc-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tc-slug">{s.classifications.slug}</Label>
              <Input
                id="tc-slug"
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">{s.classifications.slugHint}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tc-description">{s.classifications.description}</Label>
              <Textarea
                id="tc-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tc-sort">{s.classifications.sortOrder}</Label>
              <Input
                id="tc-sort"
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))}
                className="max-w-xs"
              />
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
