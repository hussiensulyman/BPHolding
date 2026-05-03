import type { Role } from "@prisma/client";

const ROLE_PRIORITY: Record<string, number> = {
  PUBLIC: 0,
  CLIENT: 1,
  CONTRACTOR: 2,
  SALES: 2,
  EMPLOYEE: 3,
  HR: 3,
  ADMIN: 4,
  SUPER_ADMIN: 5,
};

export function hasMinimumRole(currentRole: Role, requiredRole: Role): boolean {
  return (ROLE_PRIORITY[currentRole] ?? 0) >= (ROLE_PRIORITY[requiredRole] ?? 0);
}

export function canManageProjects(currentRole: Role): boolean {
  return hasMinimumRole(currentRole, "ADMIN");
}
