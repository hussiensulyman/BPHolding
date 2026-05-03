import { getTranslations } from "next-intl/server";

import { LocalizedLink } from "@/components/layout/LocalizedLink";
import { FilterBar } from "@/components/portfolio/FilterBar";
import { PortfolioGrid } from "@/components/portfolio/PortfolioGrid";
import type { AppLocale } from "@/lib/config/app-config";
import {
  createPortfolioService,
  type PortfolioListFilters,
} from "@/lib/data/portfolio-service";

export const revalidate = 3600;

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
    <main className="inline-pad mx-inline-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 py-10">
      <header className="surface-card px-inline-4 py-8">
        <h1 className="text-start text-4xl font-extrabold text-primary md:text-5xl">
          {t("studioTitle")}
        </h1>
        <p className="text-start mt-4 max-w-4xl text-lg leading-8 text-slate-700">
          {t("studioDescription")}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <LocalizedLink
            href="/"
            className="inline-flex items-center rounded-full border border-primary/30 px-5 py-2 font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            {t("backToHome")}
          </LocalizedLink>
        </div>
      </header>

      <FilterBar locale={activeLocale} availableYears={projects.availableYears} />

      <PortfolioGrid items={projects.items} locale={activeLocale} />

      <section className="flex items-center justify-between rounded-2xl border border-primary/15 bg-white px-4 py-3">
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
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              projects.page <= 1
                ? "pointer-events-none border-slate-300 text-slate-400"
                : "border-primary/30 text-primary hover:bg-primary hover:text-white"
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
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              projects.page >= projects.totalPages
                ? "pointer-events-none border-slate-300 text-slate-400"
                : "border-primary/30 text-primary hover:bg-primary hover:text-white"
            }`}
            aria-label={activeLocale === "ar" ? "الصفحة التالية" : "Next page"}
          >
            {activeLocale === "ar" ? "التالي" : "Next"}
          </LocalizedLink>
        </div>
      </section>
    </main>
  );
}
