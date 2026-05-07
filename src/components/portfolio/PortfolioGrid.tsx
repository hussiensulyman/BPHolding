"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { AppLocale } from "@/lib/config/app-config";
import type { PortfolioProject } from "@/lib/data/portfolio-service";

import { ProjectCard } from "./ProjectCard";

type PortfolioGridProps = {
  items: PortfolioProject[];
  locale: AppLocale;
};

const INITIAL_VISIBLE_ITEMS = 18;
const VIRTUAL_BATCH_SIZE = 12;

export function PortfolioGrid({ items, locale }: PortfolioGridProps) {
  const [visibleCount, setVisibleCount] = useState(
    Math.min(items.length, INITIAL_VISIBLE_ITEMS),
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || visibleCount >= items.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];

        if (!firstEntry?.isIntersecting) {
          return;
        }

        setVisibleCount((current) =>
          Math.min(current + VIRTUAL_BATCH_SIZE, items.length),
        );
      },
      { rootMargin: "500px 0px" },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [items.length, visibleCount]);

  const visibleItems = useMemo(
    () => items.slice(0, Math.max(visibleCount, VIRTUAL_BATCH_SIZE)),
    [items, visibleCount],
  );

  if (items.length === 0) {
    return (
      <p className="surface-card px-4 py-6 text-center text-sm text-slate-600">
        {locale === "ar"
          ? "لا توجد مشاريع مطابقة للمرشحات الحالية."
          : "No projects matched the selected filters."}
      </p>
    );
  }

  return (
    <section aria-label={locale === "ar" ? "شبكة المشاريع" : "Portfolio projects grid"}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {visibleItems.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            locale={locale}
            prioritizeImage={index < 2}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-2 w-full" aria-hidden="true" />
    </section>
  );
}
