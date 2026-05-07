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

const HR_ALLOWED_ADMIN_SECTIONS = new Set(["submissions", "certifications", "audit"]);

export function hasMinimumRole(currentRole: Role, requiredRole: Role): boolean {
  return (ROLE_PRIORITY[currentRole] ?? 0) >= (ROLE_PRIORITY[requiredRole] ?? 0);
}

export function canManageProjects(currentRole: Role): boolean {
  return hasMinimumRole(currentRole, "ADMIN");
}

export function isAdminRole(currentRole: Role): boolean {
  return currentRole === "ADMIN" || currentRole === "HR";
}

export function canAccessAdminSection(currentRole: Role, section: string): boolean {
  if (currentRole === "ADMIN") {
    return true;
  }

  if (currentRole !== "HR") {
    return false;
  }

  const normalized = section.trim().toLowerCase();

  if (!normalized || normalized === "dashboard") {
    return true;
  }

  return HR_ALLOWED_ADMIN_SECTIONS.has(normalized);
}
