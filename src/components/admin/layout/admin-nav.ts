import type { Role } from "@prisma/client";

import { canAccessAdminSection } from "@/lib/auth/role-guard";

export type AdminNavItem = {
  key: "dashboard" | "projects" | "submissions" | "content" | "certifications" | "audit";
  href: string;
  icon: string;
  labels: {
    en: string;
    ar: string;
  };
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    key: "dashboard",
    href: "/admin",
    icon: "▦",
    labels: { en: "Dashboard", ar: "لوحة التحكم" },
  },
  {
    key: "projects",
    href: "/admin/projects",
    icon: "▤",
    labels: { en: "Projects", ar: "المشاريع" },
  },
  {
    key: "submissions",
    href: "/admin/submissions",
    icon: "✉",
    labels: { en: "Submissions", ar: "الوارد" },
  },
  {
    key: "content",
    href: "/admin/content",
    icon: "✎",
    labels: { en: "Content", ar: "المحتوى" },
  },
  {
    key: "certifications",
    href: "/admin/certifications",
    icon: "⎙",
    labels: { en: "Certifications", ar: "الشهادات" },
  },
  {
    key: "audit",
    href: "/admin/audit",
    icon: "⌁",
    labels: { en: "Audit Log", ar: "سجل التدقيق" },
  },
];

export function filterAdminNavByRole(role: Role, locale: "en" | "ar") {
  return ADMIN_NAV_ITEMS.filter((item) => canAccessAdminSection(role, item.key)).map(
    (item) => ({
      ...item,
      label: item.labels[locale],
    }),
  );
}
