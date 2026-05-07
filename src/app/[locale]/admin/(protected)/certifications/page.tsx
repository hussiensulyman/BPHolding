import { CertificationsManager } from "@/components/admin/certifications/CertificationsManager";

export default async function AdminCertificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale === "en" ? "en" : "ar";

  return <CertificationsManager locale={activeLocale} />;
}
