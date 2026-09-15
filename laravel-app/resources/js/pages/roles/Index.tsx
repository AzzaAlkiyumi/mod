import { useEffect, useState } from "react";

import { RolesList, type RoleRow } from "@/components/roles/roles-list";
import { api } from "@/lib/api";

export default function RolesIndexPage() {
  const [roles, setRoles] = useState<RoleRow[] | null>(null);

  useEffect(() => {
    api.get("/roles").then((res) => setRoles(res.data.data));
  }, []);

  if (!roles) return null;

  return <RolesList initial={roles} />;
}
