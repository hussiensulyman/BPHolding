"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import type { KeyboardEvent } from "react";

import type { AppLocale } from "@/lib/config/app-config";

type FilterBarProps = {
  locale: AppLocale;
  availableYears: number[];
};

type CategoryFilter =
  | "ALL"
  | "RESIDENTIAL"
  | "COMMERCIAL"
  | "INTERIOR"
  | "ENGINEERING"
  | "MEP";

type LocationFilter = "ALL" | "Riyadh" | "Jeddah";

const CATEGORY_OPTIONS: CategoryFilter[] = [
  "ALL",
  "RESIDENTIAL",
  "COMMERCIAL",
  "INTERIOR",
  "ENGINEERING",
  "MEP",
];

const locationLabels: Record<LocationFilter, { en: string; ar: string }> = {
  ALL: { en: "All", ar: "الكل" },
  Riyadh: { en: "Riyadh", ar: "الرياض" },
  Jeddah: { en: "Jeddah", ar: "جدة" },
};

const categoryLabels: Record<CategoryFilter, { en: string; ar: string }> = {
  ALL: { en: "All", ar: "الكل" },
  RESIDENTIAL: { en: "Residential", ar: "سكني" },
  COMMERCIAL: { en: "Commercial", ar: "تجاري" },
  INTERIOR: { en: "Interior", ar: "داخلي" },
  ENGINEERING: { en: "Engineering", ar: "هندسي" },
  MEP: { en: "MEP", ar: "ميكانيكا وكهرباء وسباكة" },
};

function getSearchParam(searchParams: URLSearchParams, key: string): string {
  return searchParams.get(key)?.trim() ?? "";
}

export function FilterBar({ locale, availableYears }: FilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeCategory = (searchParams.get("category") ?? "ALL") as CategoryFilter;
  const activeLocation = (searchParams.get("location") ?? "ALL") as LocationFilter;
  const activeYear = searchParams.get("year") ?? "";
  const activeSearch = getSearchParam(searchParams, "q");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const categoryRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const labels = useMemo(
    () => ({
      searchPlaceholder:
        locale === "ar" ? "ابحث عن مشروع أو موقع..." : "Search by project or location...",
      reset: locale === "ar" ? "إعادة التعيين" : "Reset",
      year: locale === "ar" ? "السنة" : "Year",
      location: locale === "ar" ? "المدينة" : "Location",
      search: locale === "ar" ? "بحث" : "Search",
      category: locale === "ar" ? "الفئة" : "Category",
    }),
    [locale],
  );

  const applyFilters = (partial: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(partial)) {
      if (!value || value === "ALL") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }

    if (Object.keys(partial).some((key) => key !== "page")) {
      params.delete("page");
    }

    const nextQuery = params.toString();
    const target = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    router.replace(target as never, { scroll: false });
  };

  useEffect(
    () => () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
      }
    },
    [],
  );

  const handleSearchChange = (nextValue: string) => {
    const normalizedValue = nextValue.trim();

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(() => {
      if (normalizedValue === activeSearch) {
        return;
      }

      applyFilters({ q: normalizedValue || null });
    }, 350);
  };

  const handleChipKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") {
      return;
    }

    event.preventDefault();

    const delta = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + delta + CATEGORY_OPTIONS.length) % CATEGORY_OPTIONS.length;
    categoryRefs.current[nextIndex]?.focus();
  };

  return (
    <section className="surface-card px-4 py-4" aria-label={labels.category}>
      <div className="grid gap-4 lg:grid-cols-[2fr,1fr,1fr,auto]">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">{labels.category}</p>
          <div
            className="flex flex-wrap gap-2"
            role="toolbar"
            aria-label={labels.category}
          >
            {CATEGORY_OPTIONS.map((category, index) => {
              const isActive = activeCategory === category;

              return (
                <button
                  key={category}
                  ref={(element) => {
                    categoryRefs.current[index] = element;
                  }}
                  type="button"
                  onClick={() => applyFilters({ category })}
                  onKeyDown={(event) => handleChipKeyDown(event, index)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive
                      ? "border-primary bg-primary text-white"
                      : "border-primary/30 bg-white text-primary hover:border-primary"
                  }`}
                >
                  {locale === "ar"
                    ? categoryLabels[category].ar
                    : categoryLabels[category].en}
                </button>
              );
            })}
          </div>
        </div>

        <label className="flex flex-col gap-2 text-sm font-semibold text-primary">
          {labels.location}
          <select
            value={activeLocation}
            onChange={(event) => applyFilters({ location: event.target.value })}
            className="rounded-xl border border-primary/25 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            aria-label={labels.location}
          >
            {(Object.keys(locationLabels) as LocationFilter[]).map((option) => (
              <option key={option} value={option}>
                {locale === "ar" ? locationLabels[option].ar : locationLabels[option].en}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold text-primary">
          {labels.year}
          <select
            value={activeYear}
            onChange={(event) => applyFilters({ year: event.target.value || null })}
            className="rounded-xl border border-primary/25 bg-white px-3 py-2 text-sm font-medium text-slate-700"
            aria-label={labels.year}
          >
            <option value="">{locale === "ar" ? "كل السنوات" : "All years"}</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => {
            if (searchDebounceRef.current) {
              clearTimeout(searchDebounceRef.current);
            }

            if (searchInputRef.current) {
              searchInputRef.current.value = "";
            }

            router.replace(pathname as never, { scroll: false });
          }}
          className="self-end rounded-xl border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={labels.reset}
        >
          {labels.reset}
        </button>
      </div>

      <label className="mt-4 flex flex-col gap-2 text-sm font-semibold text-primary">
        {labels.search}
        <input
          ref={searchInputRef}
          type="search"
          defaultValue={activeSearch}
          onChange={(event) => handleSearchChange(event.target.value)}
          placeholder={labels.searchPlaceholder}
          className="rounded-xl border border-primary/25 bg-white px-3 py-2 text-sm text-slate-700"
          aria-label={labels.search}
        />
      </label>
    </section>
  );
}
