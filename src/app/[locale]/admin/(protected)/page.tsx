import { LocalizedLink } from "@/components/layout/LocalizedLink";
import { createAdminServicesContext } from "@/lib/services/admin";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale === "en" ? "en" : "ar";

  const { repository } = createAdminServicesContext();
  const stats = await repository.listDashboardStats();

  const cards = [
    {
      key: "projects",
      label: activeLocale === "ar" ? "إجمالي المشاريع" : "Total Projects",
      value: stats.totalProjects,
    },
    {
      key: "rfqs",
      label: activeLocale === "ar" ? "طلبات RFQ المعلقة" : "Pending RFQs",
      value: stats.pendingRfqs,
    },
    {
      key: "jobs",
      label: activeLocale === "ar" ? "طلبات الوظائف النشطة" : "Active Jobs",
      value: stats.activeJobs,
    },
  ];

  return (
    <section className="grid gap-4">
      <header className="rounded-xl border border-primary/15 bg-white px-4 py-4">
        <h1 className="text-2xl font-bold text-primary">
          {activeLocale === "ar" ? "لوحة الإدارة" : "Admin Dashboard"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {activeLocale === "ar"
            ? "نظرة سريعة على مؤشرات الإدارة اليومية."
            : "Quick snapshot of daily operational indicators."}
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        {cards.map((card) => (
          <article
            key={card.key}
            className="rounded-xl border border-primary/15 bg-white px-4 py-4"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-1 text-3xl font-black text-primary">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-primary/15 bg-white px-4 py-4">
        <h2 className="text-lg font-bold text-primary">
          {activeLocale === "ar" ? "اختصارات سريعة" : "Quick Actions"}
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <LocalizedLink
            href="/admin/projects"
            className="rounded-lg border border-primary/20 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            {activeLocale === "ar" ? "إدارة المشاريع" : "Manage Projects"}
          </LocalizedLink>
          <LocalizedLink
            href="/admin/submissions"
            className="rounded-lg border border-primary/20 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            {activeLocale === "ar" ? "الوارد" : "Submissions Inbox"}
          </LocalizedLink>
          <LocalizedLink
            href="/admin/certifications"
            className="rounded-lg border border-primary/20 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
          >
            {activeLocale === "ar" ? "الشهادات" : "Certifications"}
          </LocalizedLink>
        </div>
      </div>
    </section>
  );
}
