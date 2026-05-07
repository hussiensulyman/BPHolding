import type { Role } from "@prisma/client";

import { auth } from "@/auth";
import { canAccessAdminSection, isAdminRole } from "@/lib/auth/role-guard";

export type AdminSessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export async function getAdminSessionUser(
  section: string = "dashboard",
): Promise<AdminSessionUser | null> {
  const session = await auth();
  const user = session?.user;

  if (!user?.id || !user.email || !user.name || !user.role) {
    return null;
  }

  if (!isAdminRole(user.role)) {
    return null;
  }

  if (!canAccessAdminSection(user.role, section)) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
