import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Download, MoreVertical, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteDialog } from "@/components/product-setup/confirm-delete-dialog";
import { useDictionary } from "@/i18n/dictionary-context";
import { api, apiErrorMessage } from "@/lib/api";

export interface RoleRow {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  usersCount: number;
}

type SortKey = "name" | "permissions" | "users";

function toCsv(rows: RoleRow[]): string {
  const header = ["Name", "System", "Description", "Permissions", "Users"];
  const lines = rows.map((r) =>
    [
      r.name,
      r.isSystem ? "Yes" : "No",
      r.description ?? "",
      String(r.permissions.length),
      String(r.usersCount),
    ]
      .map((cell) => `"${cell.replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function RolesList({ initial }: { initial: RoleRow[] }) {
  const navigate = useNavigate();
  const { t, locale } = useDictionary();
  const s = t.roles.list;
  const dir = locale === "ar" ? "rtl" : "ltr";

  const [items, setItems] = useState(initial);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [deleteTarget, setDeleteTarget] = useState<RoleRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? items.filter(
          (r) =>
            r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q),
        )
      : items;
    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === "permissions") return b.permissions.length - a.permissions.length;
      if (sortKey === "users") return b.usersCount - a.usersCount;
      return a.name.localeCompare(b.name);
    });
    return sorted;
  }, [items, query, sortKey]);

  function handleExport() {
    const csv = toCsv(visible);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "roles.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/roles/${deleteTarget.id}`);
      toast.success(s.deletedToast(deleteTarget.name));
      setItems((prev) => prev.filter((it) => it.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      toast.error(apiErrorMessage(err, s.deleteFailed));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div dir={dir} className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{s.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{s.subtitle}</p>
        </div>
        <Button asChild>
          <Link to="/admin/roles/new">
            <Plus /> {s.newRole}
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden py-0">
        <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold">{s.countLabel(items.length)}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={s.searchPlaceholder}
              className="h-8 w-56"
            />
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="h-8 w-36" aria-label={s.sort}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">{s.sortByName}</SelectItem>
                <SelectItem value="permissions">{s.sortByPermissions}</SelectItem>
                <SelectItem value="users">{s.sortByUsers}</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4" /> {s.export}
            </Button>
            <button
              type="button"
              onClick={() => navigate(0)}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              aria-label={s.refresh}
            >
              <RefreshCcw className="size-4" />
            </button>
          </div>
        </div>

        <div className="mt-4">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
              <p className="font-medium">{s.empty.title}</p>
              <p className="text-sm text-muted-foreground">{s.empty.subtitle}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{s.columns.role}</TableHead>
                  <TableHead className="text-end">{s.columns.permissions}</TableHead>
                  <TableHead className="text-end">{s.columns.users}</TableHead>
                  <TableHead className="text-end">{s.columns.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        {role.isSystem && <Badge variant="muted">{s.system}</Badge>}
                      </div>
                      {role.description && (
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-end">{role.permissions.length}</TableCell>
                    <TableCell className="text-end">{role.usersCount}</TableCell>
                    <TableCell className="text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label={s.columns.actions}
                          >
                            <MoreVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link to={`/admin/roles/${role.id}/edit`}>
                              <Pencil className="size-4" /> {s.menuEdit}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={role.isSystem}
                            onSelect={() => !role.isSystem && setDeleteTarget(role)}
                          >
                            <Trash2 className="size-4" /> {s.menuDelete}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={s.confirmDeleteTitle(deleteTarget?.name ?? "")}
        description={s.confirmDeleteDescription}
        onConfirm={handleDelete}
        deleting={deleting}
      />
    </div>
  );
}
