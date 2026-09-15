import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PERMISSION_CATALOG } from "@/lib/permissions";
import { useDictionary } from "@/i18n/dictionary-context";
import { api, apiErrorMessage } from "@/lib/api";

/** Shape of a role after the API's camelization middleware runs it through
 * — not the raw Eloquent model attributes. */
export interface EditableRole {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
}

export function RoleForm({ role }: { role?: EditableRole }) {
  const navigate = useNavigate();
  const { t, locale } = useDictionary();
  const s = t.roles.form;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const isEdit = Boolean(role);
  const isSystem = role?.isSystem ?? false;

  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [permissions, setPermissions] = useState<Set<string>>(
    () => new Set(role?.permissions ?? []),
  );
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const selectedCount = permissions.size;

  function toggleCategory(categoryKey: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(categoryKey)) next.delete(categoryKey);
      else next.add(categoryKey);
      return next;
    });
  }

  function togglePermission(key: string) {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleCategoryAll(categoryKey: string, checked: boolean) {
    const category = PERMISSION_CATALOG.find((c) => c.key === categoryKey);
    if (!category) return;
    setPermissions((prev) => {
      const next = new Set(prev);
      for (const p of category.permissions) {
        if (checked) next.add(p.key);
        else next.delete(p.key);
      }
      return next;
    });
  }

  const categorySelectedCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const category of PERMISSION_CATALOG) {
      counts.set(category.key, category.permissions.filter((p) => permissions.has(p.key)).length);
    }
    return counts;
  }, [permissions]);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error(s.fixRequired);
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...(!isSystem && { name: name.trim() }),
        description: description.trim(),
        permissions: Array.from(permissions),
      };
      const res = isEdit
        ? await api.patch(`/roles/${role!.id}`, payload)
        : await api.post("/roles", payload);
      toast.success(isEdit ? s.updatedToast(res.data.data.name) : s.createdToast(res.data.data.name));
      navigate("/admin/roles");
    } catch (err) {
      toast.error(apiErrorMessage(err, isEdit ? s.updateFailed : s.createFailed));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div dir={dir} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            to="/admin/roles"
            className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
            aria-label={s.back}
          >
            <ArrowLeft className={dir === "rtl" ? "size-4 -scale-x-100" : "size-4"} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEdit ? s.editTitle : s.newTitle}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEdit ? s.editSubtitle : s.newSubtitle}
            </p>
          </div>
        </div>
        <Button type="button" onClick={handleSubmit} disabled={submitting}>
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {submitting ? (isEdit ? s.saving : s.creating) : isEdit ? s.saveChanges : s.create}
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr] lg:items-start">
        <Card className="flex flex-col gap-4 p-4 lg:sticky lg:top-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role-name">{s.nameLabel} *</Label>
            <Input
              id="role-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={s.namePlaceholder}
              disabled={isSystem}
            />
            {isSystem && <p className="text-xs text-muted-foreground">{s.nameLockedHint}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="role-description">{s.descriptionLabel}</Label>
            <Textarea
              id="role-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={s.descriptionPlaceholder}
              rows={4}
            />
          </div>
          <p className="text-sm text-muted-foreground">{s.selectedCount(selectedCount)}</p>
        </Card>

        <div className="flex flex-col gap-4">
          {PERMISSION_CATALOG.map((category) => {
            const isOpen = !collapsed.has(category.key);
            const total = category.permissions.length;
            const selected = categorySelectedCounts.get(category.key) ?? 0;
            const allSelected = selected === total;
            return (
              <Card key={category.key} className="overflow-hidden py-0">
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.key)}
                    aria-expanded={isOpen}
                    className="flex flex-1 items-center gap-2 text-start outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                  >
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        !isOpen && (dir === "rtl" ? "rotate-90" : "-rotate-90"),
                      )}
                    />
                    <span className="text-sm font-semibold">
                      {locale === "ar" ? category.labelAr : category.labelEn}
                    </span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {selected}/{total}
                    </span>
                  </button>
                  <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(v) => toggleCategoryAll(category.key, v === true)}
                    />
                    {s.selectAll}
                  </label>
                </div>
                {isOpen && (
                  <div className="grid gap-x-6 gap-y-3 border-t border-border px-4 py-4 sm:grid-cols-2">
                    {category.permissions.map((permission) => (
                      <label key={permission.key} className="flex items-start gap-2.5">
                        <Checkbox
                          className="mt-0.5"
                          checked={permissions.has(permission.key)}
                          onCheckedChange={() => togglePermission(permission.key)}
                        />
                        <span className="flex flex-col">
                          <span className="flex items-center gap-1.5 text-sm">
                            {locale === "ar" ? permission.labelAr : permission.labelEn}
                            {permission.dangerous && (
                              <Badge variant="destructive" className="uppercase">
                                {s.dangerous}
                              </Badge>
                            )}
                          </span>
                          <span dir="ltr" className="text-xs text-muted-foreground">
                            {permission.key}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
