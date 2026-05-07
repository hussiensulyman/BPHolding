import { ProjectsManager } from "@/components/admin/projects/ProjectsManager";

export default async function AdminProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale === "en" ? "en" : "ar";

  return <ProjectsManager locale={activeLocale} />;
}
