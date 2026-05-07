"use client";

import { Image as IKImage } from "@imagekit/next";
import { useMemo, useState } from "react";

import { LocalizedLink } from "@/components/layout/LocalizedLink";
import type { AppLocale } from "@/lib/config/app-config";
import { APP_CONFIG } from "@/lib/config/app-config";
import { IMAGEKIT_PUBLIC_URL } from "@/lib/imagekit";
import type { PortfolioProject } from "@/lib/data/portfolio-service";

type ProjectCardProps = {
  project: PortfolioProject;
  locale: AppLocale;
  prioritizeImage?: boolean;
};

const CATEGORY_LABELS: Record<PortfolioProject["category"], { en: string; ar: string }> =
  {
    RESIDENTIAL: { en: "Residential", ar: "سكني" },
    COMMERCIAL: { en: "Commercial", ar: "تجاري" },
    INTERIOR: { en: "Interior", ar: "داخلي" },
    ENGINEERING: { en: "Engineering", ar: "هندسي" },
    MEP: { en: "MEP", ar: "ميكانيكا وكهرباء وسباكة" },
    RENOVATION: { en: "Renovation", ar: "تجديد" },
  };

export function ProjectCard({
  project,
  locale,
  prioritizeImage = false,
}: ProjectCardProps) {
  const [showCta, setShowCta] = useState(false);

  const localizedTitle = locale === "ar" ? project.titleAr : project.titleEn;
  const localizedDescription =
    locale === "ar" ? project.descriptionAr : project.descriptionEn;
  const ctaText = locale === "ar" ? "عرض المشروع" : "View Project";

  const categoryLabel = useMemo(() => {
    const labels = CATEGORY_LABELS[project.category];

    return locale === "ar" ? labels.ar : labels.en;
  }, [locale, project.category]);

  return (
    <article
      className="group surface-card relative flex min-h-[400px] flex-col overflow-hidden cursor-pointer"
      dir={locale === "ar" ? "rtl" : "ltr"}
      onMouseEnter={() => setShowCta(true)}
      onMouseLeave={() => setShowCta(false)}
      aria-label={localizedTitle}
      data-testid={APP_CONFIG.testIds.portfolioProjectItem}
    >
      <div className="relative h-[280px] w-full overflow-hidden bg-slate-100 md:h-[320px]">
        {project.coverImagePath ? (
          <IKImage
            urlEndpoint={IMAGEKIT_PUBLIC_URL}
            src={project.coverImagePath}
            alt={localizedDescription}
            width={800}
            height={560}
            loading={prioritizeImage ? undefined : "lazy"}
            fetchPriority={prioritizeImage ? "high" : "auto"}
            transformation={[{ width: 800, quality: 85, format: "webp" }]}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
            <span className="select-none text-5xl font-extrabold text-primary/20">
              BP
            </span>
          </div>
        )}
      </div>

      <div className="space-y-4 px-5 py-5 text-start">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {categoryLabel}
          </span>
          <span className="rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold text-primary">
            {project.city}
          </span>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700">
            {project.year}
          </span>
        </div>

        <h3 className="text-xl font-bold text-primary">{localizedTitle}</h3>
        <p className="line-clamp-3 text-sm leading-7 text-slate-700">
          {localizedDescription}
        </p>

        <LocalizedLink
          href={`/portfolio/${project.slug}`}
          className="relative z-10 inline-flex cursor-pointer items-center rounded-full border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          aria-label={ctaText}
        >
          {ctaText}
        </LocalizedLink>
      </div>

      {/* Hover overlay with a real clickable link */}
      <div
        className={`absolute inset-0 flex items-center justify-center bg-primary/55 transition-opacity duration-200 ${
          showCta
            ? "opacity-100"
            : "pointer-events-none opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
        }`}
      >
        <LocalizedLink
          href={`/portfolio/${project.slug}`}
          className="z-20 cursor-pointer rounded-full bg-white px-5 py-2 text-sm font-bold text-primary shadow-md transition hover:bg-[var(--color-secondary)] hover:text-white"
          tabIndex={showCta ? 0 : -1}
          aria-hidden={!showCta}
        >
          {ctaText}
        </LocalizedLink>
      </div>
    </article>
  );
}
