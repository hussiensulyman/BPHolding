"use client";

import { signOut } from "next-auth/react";
import { useState } from "react";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useAdminNotifications } from "@/components/admin/layout/AdminNotificationsProvider";

type TopBarProps = {
  locale: "ar" | "en";
  userName: string;
  userRole: string;
};

export function TopBar({ locale, userName, userRole }: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { submissionBadgeCount } = useAdminNotifications();

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 shadow-sm">
      {/* Left: title / page label placeholder */}
      <div className="flex items-center gap-2">
        {submissionBadgeCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {submissionBadgeCount} {locale === "ar" ? "طلبات جديدة" : "new submissions"}
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher compact />

        {/* User menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((s) => !s)}
            aria-expanded={menuOpen ? "true" : "false"}
            className="flex min-h-[40px] items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {/* Avatar */}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#052a42] text-xs font-bold text-white">
              {initials}
            </span>
            <span className="hidden text-sm font-semibold text-slate-700 sm:block">
              {userName}
            </span>
            <span className="hidden text-xs text-slate-400 sm:block">({userRole})</span>
            <span className="text-slate-400">▾</span>
          </button>

          {menuOpen && (
            <div className="absolute end-0 z-40 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">{userName}</p>
                <p className="text-xs text-slate-500">{userRole}</p>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: `/${locale}/admin/login` })}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <span>⎋</span>
                {locale === "ar" ? "تسجيل الخروج" : "Sign Out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
