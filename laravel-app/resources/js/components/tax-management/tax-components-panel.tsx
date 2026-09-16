import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useDictionary } from "@/i18n/dictionary-context";
import { ConfirmDeleteDialog } from "@/components/product-setup/confirm-delete-dialog";
import { api, apiErrorMessage } from "@/lib/api";
import { trimTrailingZeros } from "@/lib/utils";

interface ComponentRow {
  id: string;
  code: string;
  name: string;
  rate: number;
  active: boolean;
}

const emptyForm = { code: "", name: "", rate: "", active: true };

export function TaxComponentsPanel({ initial }: { initial: ComponentRow[] }) {
  const { t, locale } = useDictionary();
  const s = t.products.taxManagement;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ComponentRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  function selectNew() {
    setSelectedId("new");
    setForm(emptyForm);
  }

  function selectExisting(row: ComponentRow) {
    setSelectedId(row.id);
    setForm({ code: row.code, name: row.name, rate: trimTrailingZeros(row.rate), active: row.active });
  }

  async function handleSave() {
    if (!form.code.trim() || !form.name.trim() || form.rate === "") {
      toast.error(s.common.fixRequired);
      return;
    }
    setSaving(true);
    try {
      const isNew = selectedId === "new";
      const payload = {
        code: form.code.trim(),
        name: form.name.trim(),
        rate: form.rate,
        active: form.active,
      };
      const res = isNew
        ? await api.post("/tax-components", payload)
        : await api.patch(`/tax-components/${selectedId}`, payload);
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
      await api.delete(`/tax-components/${deleteTarget.id}`);
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

  return (
    <div dir={dir} className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{s.components.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{s.components.subtitle}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="text-sm font-semibold">{s.components.countLabel(items.length)}</h2>
          <Button type="button" size="sm" onClick={selectNew}>
            <Plus className="size-4" /> {s.components.newItem}
          </Button>
        </div>
        <div className="divide-y divide-border border-t border-border">
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {s.components.empty}
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
                <div className="text-xs text-muted-foreground" dir="ltr">
                  {row.code} · {trimTrailingZeros(row.rate)}%
                </div>
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
              ? s.components.newItem
              : selectedId
                ? s.common.editTitle
                : s.common.selectPrompt}
          </CardTitle>
        </CardHeader>
        {selectedId && (
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tcm-code">{s.components.code}</Label>
              <Input
                id="tcm-code"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder={s.components.codePlaceholder}
                dir="ltr"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tcm-name">{s.components.name}</Label>
              <Input
                id="tcm-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tcm-rate">{s.components.rate}</Label>
              <div className="relative max-w-xs">
                <Input
                  id="tcm-rate"
                  type="number"
                  min={0}
                  step="0.001"
                  value={form.rate}
                  onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
                  className="pe-7"
                />
                <span className="pointer-events-none absolute inset-y-0 end-3 flex items-center text-sm text-muted-foreground">
                  %
                </span>
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
