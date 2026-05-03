import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { LocalizedLink } from "@/components/layout/LocalizedLink";
import { ProjectCard } from "@/components/portfolio/ProjectCard";
import { ProjectGalleryCarousel } from "@/components/portfolio/ProjectGalleryCarousel";
import type { AppLocale } from "@/lib/config/app-config";
import { createPortfolioService } from "@/lib/data/portfolio-service";

export const revalidate = 3600;

export default async function PortfolioProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const activeLocale = locale as AppLocale;

  const t = await getTranslations({ locale: activeLocale, namespace: "portfolio" });
  const portfolioService = createPortfolioService();

  const [project, relatedProjects] = await Promise.all([
    portfolioService.getProjectBySlug(slug),
    portfolioService.getRelatedProjects(slug, 3),
  ]);

  if (!project) {
    notFound();
  }

  const localizedTitle = activeLocale === "ar" ? project.titleAr : project.titleEn;
  const localizedDescription =
    activeLocale === "ar" ? project.descriptionAr : project.descriptionEn;
  const secondaryDescription =
    activeLocale === "ar" ? project.descriptionEn : project.descriptionAr;

  const rfqHref = `/rfq?category=${project.category}`;

  return (
    <main className="inline-pad mx-inline-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 py-10">
      <header className="surface-card px-inline-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-secondary">
              {project.city} · {project.year}
            </p>
            <h1 className="text-start mt-2 text-4xl font-extrabold text-primary md:text-5xl">
              {localizedTitle}
            </h1>
          </div>
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
            {project.category}
          </span>
        </div>

        <p className="text-start mt-5 max-w-4xl text-lg leading-8 text-slate-700">
          {localizedDescription}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <LocalizedLink
            href="/portfolio"
            className="inline-flex items-center rounded-full border border-primary/30 px-5 py-2 font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            {t("backToPortfolio")}
          </LocalizedLink>
          <LocalizedLink
            href={rfqHref}
            className="inline-flex items-center rounded-full bg-primary px-5 py-2 font-semibold text-white transition hover:bg-primary/90"
            aria-label={
              activeLocale === "ar"
                ? "طلب مشروع مماثل مع تعبئة الفئة تلقائياً"
                : "Request similar project with prefilled category"
            }
          >
            {activeLocale === "ar" ? "طلب مشروع مماثل" : "Request Similar Project"}
          </LocalizedLink>
        </div>
      </header>

      <ProjectGalleryCarousel
        images={project.gallery}
        locale={activeLocale}
        description={localizedDescription}
      />

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <details className="surface-card px-5 py-5" open>
          <summary className="cursor-pointer text-lg font-bold text-primary">
            {activeLocale === "ar" ? "وصف المشروع" : "Project Description"}
          </summary>
          <div className="mt-4 space-y-4 text-slate-700">
            <p className="leading-8">{localizedDescription}</p>
            <p className="rounded-xl bg-slate-100 px-4 py-3 leading-8">
              {secondaryDescription}
            </p>
          </div>
        </details>

        <section className="surface-card overflow-hidden" aria-label={t("specsTitle")}>
          <h2 className="border-b border-primary/15 px-5 py-4 text-lg font-bold text-primary">
            {t("specsTitle")}
          </h2>
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-primary/10">
                <th
                  className="px-5 py-3 text-start font-semibold text-slate-600"
                  scope="row"
                >
                  {activeLocale === "ar" ? "المساحة" : "Area"}
                </th>
                <td className="px-5 py-3 text-start text-slate-700">
                  {project.specs.area}
                </td>
              </tr>
              <tr className="border-b border-primary/10">
                <th
                  className="px-5 py-3 text-start font-semibold text-slate-600"
                  scope="row"
                >
                  {activeLocale === "ar" ? "الجدول الزمني" : "Timeline"}
                </th>
                <td className="px-5 py-3 text-start text-slate-700">
                  {activeLocale === "ar"
                    ? project.specs.timelineAr
                    : project.specs.timelineEn}
                </td>
              </tr>
              <tr>
                <th
                  className="px-5 py-3 text-start font-semibold text-slate-600"
                  scope="row"
                >
                  {activeLocale === "ar" ? "الخدمات المقدمة" : "Services Provided"}
                </th>
                <td className="px-5 py-3 text-start text-slate-700">
                  <ul className="grid gap-1">
                    {(activeLocale === "ar"
                      ? project.specs.servicesAr
                      : project.specs.servicesEn
                    ).map((service) => (
                      <li key={service}>• {service}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </section>

      <section aria-label={activeLocale === "ar" ? "مشاريع ذات صلة" : "Related projects"}>
        <h2 className="mb-4 text-2xl font-bold text-primary">
          {activeLocale === "ar" ? "مشاريع ذات صلة" : "Related Projects"}
        </h2>

        {relatedProjects.length === 0 ? (
          <p className="surface-card px-4 py-5 text-sm text-slate-600">
            {activeLocale === "ar"
              ? "لا توجد مشاريع مشابهة حالياً."
              : "No related projects available yet."}
          </p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {relatedProjects.map((relatedProject) => (
              <ProjectCard
                key={relatedProject.id}
                project={relatedProject}
                locale={activeLocale}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
