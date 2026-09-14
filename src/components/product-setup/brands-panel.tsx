"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImageOff, Loader2, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useDictionary } from "@/i18n/dictionary-context";
import { ConfirmDeleteDialog } from "@/components/product-setup/confirm-delete-dialog";

interface BrandRow {
  id: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  active: boolean;
}

const emptyForm = { name: "", logoUrl: "", description: "", active: true };

export function BrandsPanel({ initial }: { initial: BrandRow[] }) {
  const router = useRouter();
  const { t } = useDictionary();
  const s = t.products.productSetup;

  const [items, setItems] = useState(initial);
  const [selectedId, setSelectedId] = useState<string | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<BrandRow | null>(null);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function selectNew() {
    setSelectedId("new");
    setForm(emptyForm);
  }

  function selectExisting(row: BrandRow) {
    setSelectedId(row.id);
    setForm({
      name: row.name,
      logoUrl: row.logoUrl ?? "",
      description: row.description ?? "",
      active: row.active,
    });
  }

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/uploads/brands", { method: "POST", body });
      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error?.formErrors?.[0] ?? s.common.uploadFailed);
      }
      setForm((f) => ({ ...f, logoUrl: json.data.url }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : s.common.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error(s.common.fixRequired);
      return;
    }
    setSaving(true);
    try {
      const isNew = selectedId === "new";
      const res = await fetch(isNew ? "/api/brands" : `/api/brands/${selectedId}`, {
        method: isNew ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          logoUrl: form.logoUrl.trim() || undefined,
          description: form.description.trim() || undefined,
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
        if (isNew) return [...prev, json.data].sort((a, b) => a.name.localeCompare(b.name));
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
      const res = await fetch(`/api/brands/${deleteTarget.id}`, { method: "DELETE" });
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
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card className="overflow-hidden py-0">
        <div className="flex items-center justify-between px-4 pt-4 pb-3">
          <h2 className="text-sm font-semibold">{s.brands.countLabel(items.length)}</h2>
          <Button type="button" size="sm" onClick={selectNew}>
            <Plus className="size-4" /> {s.brands.newItem}
          </Button>
        </div>
        <div className="divide-y divide-border border-t border-border">
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">{s.brands.empty}</p>
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
              {row.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- fixed-size catalog thumbnail.
                <img
                  src={row.logoUrl}
                  alt=""
                  className="size-8 shrink-0 rounded-md border border-border object-cover"
                />
              ) : (
                <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted">
                  <ImageOff className="size-4 text-muted-foreground" />
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm font-medium">{row.name}</div>
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
              ? s.brands.newItem
              : selectedId
                ? s.common.editTitle
                : s.common.selectPrompt}
          </CardTitle>
        </CardHeader>
        {selectedId && (
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brand-name">{s.brands.name}</Label>
              <Input
                id="brand-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{s.brands.logo}</Label>
              <div className="flex items-start gap-3">
                {form.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- thumbnail preview for a pasted/uploaded URL.
                  <img
                    src={form.logoUrl}
                    alt=""
                    className="size-16 shrink-0 rounded-md border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-dashed border-border bg-muted text-muted-foreground">
                    <ImageOff className="size-6" />
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex gap-1.5">
                    <Input
                      value={form.logoUrl}
                      onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
                      placeholder={s.brands.logoUrlPlaceholder}
                      dir="ltr"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleFileSelected}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                      aria-label={s.common.upload}
                    >
                      {uploading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Upload className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="brand-desc">{s.brands.description}</Label>
              <Textarea
                id="brand-desc"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={3}
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
