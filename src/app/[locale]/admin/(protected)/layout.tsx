import type { ReactNode } from "react";

import { AdminLayout } from "@/components/admin/layout/AdminLayout";

export default async function AdminProtectedLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale === "en" ? "en" : "ar";

  return <AdminLayout locale={activeLocale}>{children}</AdminLayout>;
}
