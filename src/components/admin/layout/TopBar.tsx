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

  return (
    <header className="surface-card flex items-center justify-between gap-3 px-4 py-3">
      <div>
        <p className="text-sm font-semibold text-primary">
          {locale === "ar" ? "مرحباً" : "Welcome"}, {userName}
        </p>
        <p className="text-xs uppercase tracking-wide text-slate-500">{userRole}</p>
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />

        <div className="relative">
          <button
            type="button"
            aria-label={locale === "ar" ? "الإشعارات" : "Notifications"}
            className="relative rounded-xl border border-primary/25 bg-white px-3 py-2 font-semibold text-primary"
          >
            {locale === "ar" ? "الإشعارات" : "Notifications"}
            {submissionBadgeCount > 0 ? (
              <span className="absolute -end-2 -top-2 rounded-full bg-secondary px-2 text-xs font-bold text-primary">
                {submissionBadgeCount}
              </span>
            ) : null}
          </button>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((state) => !state)}
            className="rounded-xl border border-primary/25 bg-white px-3 py-2 font-semibold text-primary"
          >
            {locale === "ar" ? "الملف الشخصي" : "Profile"}
          </button>

          {menuOpen ? (
            <div className="absolute end-0 z-20 mt-2 w-44 rounded-xl border border-primary/20 bg-white p-2 shadow-lg">
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: `/${locale}/admin/login` })}
                className="w-full rounded-lg px-3 py-2 text-start text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                {locale === "ar" ? "تسجيل الخروج" : "Logout"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
