import type { Role } from "@prisma/client";

const ROLE_PRIORITY: Record<Role, number> = {
  CLIENT: 1,
  SALES: 2,
  HR: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
};

export function hasMinimumRole(currentRole: Role, requiredRole: Role): boolean {
  return ROLE_PRIORITY[currentRole] >= ROLE_PRIORITY[requiredRole];
}

export function canManageProjects(currentRole: Role): boolean {
  return hasMinimumRole(currentRole, "ADMIN");
}