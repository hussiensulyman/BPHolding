import { ContentManager } from "@/components/admin/content/ContentManager";

export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale === "en" ? "en" : "ar";

  return <ContentManager locale={activeLocale} />;
}
