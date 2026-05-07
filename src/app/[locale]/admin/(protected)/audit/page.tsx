import { AuditLogViewer } from "@/components/admin/AuditLogViewer";

export default async function AdminAuditPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale === "en" ? "en" : "ar";

  return <AuditLogViewer locale={activeLocale} />;
}
