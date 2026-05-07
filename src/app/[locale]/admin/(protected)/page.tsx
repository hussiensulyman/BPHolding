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

  const isAr = activeLocale === "ar";

  const statCards = [
    {
      key: "projects",
      label: isAr ? "إجمالي المشاريع" : "Total Projects",
      value: stats.totalProjects,
      icon: "▤",
      iconBg: "bg-[#052a42]",
      iconColor: "text-white",
      href: "/admin/projects",
    },
    {
      key: "rfqs",
      label: isAr ? "طلبات عروض الأسعار" : "Pending RFQs",
      value: stats.pendingRfqs,
      icon: "✉",
      iconBg: "bg-[#df9a13]",
      iconColor: "text-[#052a42]",
      href: "/admin/submissions",
    },
    {
      key: "jobs",
      label: isAr ? "طلبات الوظائف النشطة" : "Active Job Applications",
      value: stats.activeJobs,
      icon: "⚑",
      iconBg: "bg-emerald-500",
      iconColor: "text-white",
      href: "/admin/submissions",
    },
    {
      key: "certifications",
      label: isAr ? "الشهادات النشطة" : "Active Certifications",
      value: 0,
      icon: "⎙",
      iconBg: "bg-purple-500",
      iconColor: "text-white",
      href: "/admin/certifications",
    },
  ];

  const quickLinks = [
    {
      href: "/admin/projects",
      label: isAr ? "إدارة المشاريع" : "Manage Projects",
      icon: "▤",
    },
    {
      href: "/admin/submissions",
      label: isAr ? "صندوق الوارد" : "Submissions Inbox",
      icon: "✉",
    },
    {
      href: "/admin/certifications",
      label: isAr ? "الشهادات" : "Certifications",
      icon: "⎙",
    },
    { href: "/admin/content", label: isAr ? "المحتوى" : "Content", icon: "✎" },
  ];

  return (
    <div className="grid gap-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#052a42]">
          {isAr ? "لوحة الإدارة" : "Admin Dashboard"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {isAr
            ? "نظرة سريعة على مؤشرات الإدارة اليومية."
            : "Quick snapshot of daily operational indicators."}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <LocalizedLink
            key={card.key}
            href={card.href}
            className="group flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md hover:ring-[#df9a13]/40"
          >
            <span
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${card.iconBg} ${card.iconColor}`}
            >
              {card.icon}
            </span>
            <div>
              <p className="text-3xl font-extrabold text-[#052a42]">{card.value}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{card.label}</p>
            </div>
          </LocalizedLink>
        ))}
      </div>

      {/* Quick actions */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h2 className="mb-4 text-lg font-bold text-[#052a42]">
          {isAr ? "اختصارات سريعة" : "Quick Actions"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <LocalizedLink
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#052a42] transition hover:border-[#df9a13]/60 hover:bg-[#df9a13]/5"
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </LocalizedLink>
          ))}
        </div>
      </div>
    </div>
  );
}
