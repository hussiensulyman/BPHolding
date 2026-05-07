import { SubmissionsInbox } from "@/components/admin/submissions/SubmissionsInbox";

export default async function AdminSubmissionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale === "en" ? "en" : "ar";

  return <SubmissionsInbox locale={activeLocale} />;
}
