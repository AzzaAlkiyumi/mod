import { prisma } from "@/lib/prisma";
import { RolesList } from "@/components/roles/roles-list";

export const dynamic = "force-dynamic";

export default async function RolesPage() {
  const roles = await prisma.role.findMany({
    include: { _count: { select: { users: true } } },
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  });

  return (
    <RolesList
      initial={roles.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
        permissions: r.permissions,
        _count: r._count,
      }))}
    />
  );
}
