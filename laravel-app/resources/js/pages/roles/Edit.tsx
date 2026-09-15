import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { RoleForm, type EditableRole } from "@/components/roles/role-form";
import { api } from "@/lib/api";

export default function EditRolePage() {
  const { id } = useParams<{ id: string }>();
  const [role, setRole] = useState<EditableRole | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .get(`/roles/${id}`)
      .then((res) => setRole(res.data.data))
      .catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return <p className="text-sm text-muted-foreground">Role not found.</p>;
  }
  if (!role) return null;

  return <RoleForm role={role} />;
}
