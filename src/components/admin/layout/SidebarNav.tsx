"use client";

import type { Role } from "@prisma/client";
import { signOut } from "next-auth/react";
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
      className={`sticky top-0 flex h-screen flex-col bg-[#052a42] transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#df9a13] text-xs font-extrabold text-[#052a42]">
              BP
            </span>
            <span className="text-sm font-bold text-white">BP Holding</span>
          </div>
        )}
        {collapsed && (
          <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#df9a13] text-xs font-extrabold text-[#052a42]">
            BP
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((state) => !state)}
          aria-label={locale === "ar" ? "طي القائمة" : "Toggle sidebar"}
          className={`rounded-md p-1 text-white/60 transition hover:bg-white/10 hover:text-white ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? "▸" : "◂"}
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <div className="grid gap-0.5">
          {navItems.map((item) => {
            const localizedHref = `/${locale}${item.href}`;
            const isActive =
              pathname === localizedHref ||
              (item.href !== "/admin" && pathname.startsWith(`${localizedHref}/`));

            return (
              <LocalizedLink
                key={item.key}
                href={item.href}
                className={`flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "border-s-4 border-[#df9a13] bg-white/10 ps-2 text-white"
                    : "border-s-4 border-transparent text-white/60 hover:bg-white/8 hover:text-white ps-2"
                }`}
              >
                <span aria-hidden="true" className="shrink-0 text-lg leading-none">
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.key === "submissions" && submissionBadgeCount > 0 && (
                  <span className="ms-auto inline-flex min-w-[20px] items-center justify-center rounded-full bg-[#df9a13] px-1.5 py-0.5 text-xs font-bold text-[#052a42]">
                    {submissionBadgeCount}
                  </span>
                )}
                {collapsed && item.key === "submissions" && submissionBadgeCount > 0 && (
                  <span className="absolute end-1 top-1 h-2 w-2 rounded-full bg-[#df9a13]" />
                )}
              </LocalizedLink>
            );
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: `/${locale}/admin/login` })}
          className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-900/30 hover:text-red-300 ${collapsed ? "justify-center" : ""}`}
        >
          <span aria-hidden="true" className="shrink-0 text-lg leading-none">
            ⎋
          </span>
          {!collapsed && <span>{locale === "ar" ? "تسجيل الخروج" : "Logout"}</span>}
        </button>
      </div>
    </aside>
  );
}
