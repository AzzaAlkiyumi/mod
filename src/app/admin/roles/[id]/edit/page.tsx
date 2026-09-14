import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { RoleForm } from "@/components/roles/role-form";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditRolePage({ params }: PageProps) {
  const { id } = await params;
  const role = await prisma.role.findUnique({ where: { id } });
  if (!role) notFound();

  return (
    <RoleForm
      role={{
        id: role.id,
        name: role.name,
        description: role.description,
        isSystem: role.isSystem,
        permissions: role.permissions,
      }}
    />
  );
}
