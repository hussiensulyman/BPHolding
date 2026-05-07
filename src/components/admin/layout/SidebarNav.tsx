"use client";

import type { Role } from "@prisma/client";
import { useState } from "react";

import { LocalizedLink } from "@/components/layout/LocalizedLink";
import { usePathname } from "@/i18n/navigation";
import { filterAdminNavByRole } from "@/components/admin/layout/admin-nav";
import { useAdminNotifications } from "@/components/admin/layout/AdminNotificationsProvider";

type SidebarNavProps = {
  locale: "ar" | "en";
  role: Role;
};

export function SidebarNav({ locale, role }: SidebarNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const { submissionBadgeCount } = useAdminNotifications();
  const navItems = filterAdminNavByRole(role, locale);

  return (
    <aside
      className={`surface-card sticky top-4 h-[calc(100vh-2rem)] transition-all ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <h2 className={`text-primary font-bold ${collapsed ? "hidden" : "block"}`}>
            {locale === "ar" ? "لوحة الإدارة" : "Admin Panel"}
          </h2>
          <button
            type="button"
            onClick={() => setCollapsed((state) => !state)}
            aria-label={locale === "ar" ? "طي القائمة" : "Toggle sidebar"}
            className="rounded-lg border border-primary/25 bg-white px-2 py-1 text-primary"
          >
            {collapsed ? "▸" : "◂"}
          </button>
        </div>

        <nav className="grid gap-1">
          {navItems.map((item) => {
            const localizedHref = `/${locale}${item.href}`;
            const isActive =
              pathname === localizedHref ||
              (item.href !== "/admin" && pathname.startsWith(`${localizedHref}/`));

            return (
              <LocalizedLink
                key={item.key}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-primary text-white" : "text-primary hover:bg-primary/10"
                }`}
              >
                <span aria-hidden="true" className="text-lg leading-none">
                  {item.icon}
                </span>
                <span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>
                {item.key === "submissions" && submissionBadgeCount > 0 ? (
                  <span
                    className={`ml-auto inline-flex min-w-6 items-center justify-center rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-primary ${
                      collapsed ? "hidden" : "inline-flex"
                    }`}
                  >
                    {submissionBadgeCount}
                  </span>
                ) : null}
              </LocalizedLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
