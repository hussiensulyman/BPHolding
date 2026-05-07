import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { LocalizedLink } from "@/components/layout/LocalizedLink";
import { FilterBar } from "@/components/portfolio/FilterBar";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import { APP_CONFIG, type AppLocale } from "@/lib/config/app-config";
import {
  createPortfolioService,
  type PortfolioListFilters,
} from "@/lib/data/portfolio-service";
import { getLocalizedAlternates, getLocalizedSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = (
    APP_CONFIG.locales.includes(locale as never) ? locale : APP_CONFIG.defaultLocale
  ) as import("@/lib/config/app-config").AppLocale;
  const seo = getLocalizedSeo(activeLocale);

  const title =
    activeLocale === "ar"
      ? `استوديو المشاريع | ${seo.title}`
      : `Portfolio Studio | ${seo.title}`;
  const description =
    activeLocale === "ar"
      ? "تصفح مشاريع بي بي القابضة مع فلاتر ذكية حسب الفئة والمدينة والسنة."
      : "Browse BP Holding projects with smart filters by category, city, year, and search.";

  return {
    title,
    description,
    alternates: getLocalizedAlternates(activeLocale, "/portfolio"),
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export const revalidate = 0;

function readSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string {
  const value = searchParams[key];

  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function buildPaginationHref(
  page: number,
  searchParams: Record<string, string | string[] | undefined>,
): string {
  const params = new URLSearchParams();

  const category = readSearchParam(searchParams, "category");
  const location = readSearchParam(searchParams, "location");
  const year = readSearchParam(searchParams, "year");
  const search = readSearchParam(searchParams, "q");

  if (category) {
    params.set("category", category);
  }

  if (location) {
    params.set("location", location);
  }

  if (year) {
    params.set("year", year);
  }

  if (search) {
    params.set("q", search);
  }

  params.set("page", String(page));

  return `/portfolio?${params.toString()}`;
}

export default async function PortfolioPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const activeLocale = locale as AppLocale;
  const t = await getTranslations({ locale: activeLocale, namespace: "portfolio" });

  const rawCategory = readSearchParam(resolvedSearchParams, "category");
  const rawLocation = readSearchParam(resolvedSearchParams, "location");
  const rawYear = Number.parseInt(readSearchParam(resolvedSearchParams, "year"), 10);
  const rawSearch = readSearchParam(resolvedSearchParams, "q");
  const rawPage = Number.parseInt(readSearchParam(resolvedSearchParams, "page"), 10);

  const filters: PortfolioListFilters = {
    category:
      rawCategory && rawCategory !== "ALL"
        ? (rawCategory as PortfolioListFilters["category"])
        : undefined,
    location: rawLocation && rawLocation !== "ALL" ? rawLocation : undefined,
    year: Number.isNaN(rawYear) ? undefined : rawYear,
    search: rawSearch || undefined,
    page: Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage),
    pageSize: 12,
  };

  const portfolioService = createPortfolioService();
  const projects = await portfolioService.listProjects(filters);

  return (
    <main className="flex min-h-screen flex-col">
      {/* Page Hero */}
      <div className="page-hero">
        <div className="page-hero-glow" aria-hidden="true" />
        <div className="page-hero-bottom" aria-hidden="true" />
        <div className="section-container relative z-10">
          <span className="page-hero-badge">{t("studioTitle")}</span>
          <h1 className="text-start text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            {t("studioTitle")}
          </h1>
          <p className="text-start mt-4 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
            {t("studioDescription")}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LocalizedLink
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
            >
              {t("backToHome")}
            </LocalizedLink>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-background)] flex flex-col gap-8 pt-10 pb-16">
        <div className="section-container">
          <Suspense
            fallback={<div className="h-40 animate-pulse rounded-2xl bg-slate-200" />}
          >
            <FilterBar locale={activeLocale} availableYears={projects.availableYears} />
          </Suspense>
        </div>

        <div id="projects-grid" className="section-container">
          <PortfolioGrid items={projects.items} locale={activeLocale} />
        </div>

        {/* Pagination */}
        <div className="section-container">
          <div className="flex items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
            <p className="text-sm text-slate-600">
              {activeLocale === "ar"
                ? `صفحة ${projects.page} من ${projects.totalPages}`
                : `Page ${projects.page} of ${projects.totalPages}`}
            </p>
            <div className="flex items-center gap-2">
              <LocalizedLink
                href={buildPaginationHref(
                  Math.max(1, projects.page - 1),
                  resolvedSearchParams,
                )}
                className={`min-h-[40px] rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  projects.page <= 1
                    ? "pointer-events-none border-slate-300 text-slate-400"
                    : "border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                }`}
                aria-label={activeLocale === "ar" ? "الصفحة السابقة" : "Previous page"}
              >
                {activeLocale === "ar" ? "السابق" : "Previous"}
              </LocalizedLink>
              <LocalizedLink
                href={buildPaginationHref(
                  Math.min(projects.totalPages, projects.page + 1),
                  resolvedSearchParams,
                )}
                className={`min-h-[40px] rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  projects.page >= projects.totalPages
                    ? "pointer-events-none border-slate-300 text-slate-400"
                    : "border-[var(--color-primary)]/30 text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                }`}
                aria-label={activeLocale === "ar" ? "الصفحة التالية" : "Next page"}
              >
                {activeLocale === "ar" ? "التالي" : "Next"}
              </LocalizedLink>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
