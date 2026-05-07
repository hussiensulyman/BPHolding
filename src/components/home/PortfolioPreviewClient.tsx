"use client";

import { motion } from "framer-motion";
import { useState } from "react";

import type { AppLocale } from "@/lib/config/app-config";

interface Project {
  id: string;
  slug: string;
  sector: string;
  title: { en: string; ar: string };
  summary: { en: string; ar: string };
}

interface PortfolioPreviewClientProps {
  projects: Project[];
  locale: AppLocale;
  labels: {
    filterAll: string;
    filterResidential: string;
    filterCommercial: string;
    filterInfrastructure: string;
    portfolioCta: string;
    portfolioHref: string;
  };
}

const SECTOR_MAP: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  infrastructure: "Infrastructure",
  interior: "Interior",
  engineering: "Engineering",
};

export function PortfolioPreviewClient({
  projects,
  locale,
  labels,
}: PortfolioPreviewClientProps) {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = [
    { key: "all", label: labels.filterAll },
    { key: "residential", label: labels.filterResidential },
    { key: "commercial", label: labels.filterCommercial },
    { key: "infrastructure", label: labels.filterInfrastructure },
  ];

  const filtered =
    activeFilter === "all" ? projects : projects.filter((p) => p.sector === activeFilter);

  return (
    <>
      {/* Filter Tabs */}
      <div
        className="mb-8 flex flex-wrap gap-2 justify-center"
        role="tablist"
        aria-label="Portfolio filter"
      >
        {filters.map(({ key, label }) => (
          <button
            key={key}
            role="tab"
            aria-selected={activeFilter === key ? "true" : "false"}
            onClick={() => setActiveFilter(key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors min-h-[44px] ${
              activeFilter === key
                ? "bg-[var(--color-primary)] text-white"
                : "bg-[var(--color-surface)] text-slate-600 hover:bg-[var(--color-primary)]/8 border border-[var(--color-border)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project, i) => {
          const title = locale === "ar" ? project.title.ar : project.title.en;
          const summary = locale === "ar" ? project.summary.ar : project.summary.en;
          const sectorLabel = SECTOR_MAP[project.sector] ?? project.sector;

          return (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="portfolio-card aspect-[4/3]"
            >
              {/* Background */}
              <div className={`pf-bg-${i % 6} absolute inset-0`}>
                <div className="pf-card-pattern absolute inset-0 opacity-20" />
                <span className="absolute inset-0 flex items-center justify-center text-7xl font-extrabold text-white/10">
                  BP
                </span>
              </div>

              {/* Overlay */}
              <div className="portfolio-card-overlay">
                <span className="mb-1.5 inline-block rounded-full bg-[var(--color-secondary)] px-2.5 py-0.5 text-xs font-bold text-[var(--color-primary)]">
                  {sectorLabel}
                </span>
                <h3 className="text-start text-base font-bold text-white leading-snug">
                  {title}
                </h3>
                <p className="text-start mt-1 text-xs leading-relaxed text-white/75 line-clamp-2">
                  {summary}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <a href={labels.portfolioHref} className="btn-primary inline-flex">
          {labels.portfolioCta}
        </a>
      </div>
    </>
  );
}
