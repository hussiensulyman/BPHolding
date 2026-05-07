import type { Role } from "@prisma/client";

import { canAccessAdminSection, isAdminRole } from "@/lib/auth/role-guard";

export function canAccessAdminRoute(
  role: Role | null | undefined,
  section: string,
): boolean {
  if (!role) {
    return false;
  }

  if (!isAdminRole(role)) {
    return false;
  }

  return canAccessAdminSection(role, section);
}
