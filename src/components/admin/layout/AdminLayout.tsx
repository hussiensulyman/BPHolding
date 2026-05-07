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
      <main className="inline-pad mx-inline-auto min-h-screen w-full max-w-[1600px] py-4">
        <div className="grid gap-4 lg:grid-cols-[auto,1fr]">
          <SidebarNav locale={locale} role={user.role} />
          <section className="grid content-start gap-4">
            <TopBar locale={locale} userName={user.name} userRole={user.role} />
            <Breadcrumb locale={locale} />
            <div className="surface-card min-h-[70vh] p-4">{children}</div>
          </section>
        </div>
      </main>
    </AdminNotificationsProvider>
  );
}
