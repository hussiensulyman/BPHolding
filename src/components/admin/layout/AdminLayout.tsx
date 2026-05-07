import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { getAdminSessionUser } from "@/lib/auth/admin-session";
import { AdminNotificationsProvider } from "@/components/admin/layout/AdminNotificationsProvider";
import { Breadcrumb } from "@/components/admin/layout/Breadcrumb";
import { SidebarNav } from "@/components/admin/layout/SidebarNav";
import { TopBar } from "@/components/admin/layout/TopBar";

type AdminLayoutProps = {
  locale: "ar" | "en";
  children: ReactNode;
};

export async function AdminLayout({ locale, children }: AdminLayoutProps) {
  const user = await getAdminSessionUser();

  if (!user) {
    const loginUrl = `/${locale}/admin/login?callbackUrl=${encodeURIComponent(`/${locale}/admin`)}`;
    redirect(loginUrl as never);
  }

  return (
    <AdminNotificationsProvider locale={locale}>
      <div className="flex min-h-screen bg-slate-50">
        {/* Sidebar */}
        <SidebarNav locale={locale} role={user.role} />

        {/* Main area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar locale={locale} userName={user.name} userRole={user.role} />

          <main className="flex-1 p-6">
            <Breadcrumb locale={locale} />
            <div className="mt-5">{children}</div>
          </main>
        </div>
      </div>
    </AdminNotificationsProvider>
  );
}
