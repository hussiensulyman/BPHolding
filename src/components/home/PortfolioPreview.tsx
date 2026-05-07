import { getTranslations } from "next-intl/server";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { PortfolioPreviewClient } from "@/components/home/PortfolioPreviewClient";
import { SAMPLE_PROJECTS } from "@/lib/data/sample-projects";
import type { AppLocale } from "@/lib/config/app-config";

interface PortfolioPreviewProps {
  locale: AppLocale;
}

export async function PortfolioPreview({ locale }: PortfolioPreviewProps) {
  const t = await getTranslations({ locale, namespace: "home" });

  // Take up to 6 featured projects
  const featured = SAMPLE_PROJECTS.slice(0, 6);

  return (
    <SectionWrapper id="portfolio" className="portfolio-section-bg section-padding">
      <div className="section-container">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[var(--color-secondary)]">
            {t("portfolioSectionTitle")}
          </p>
          <h2 className="text-3xl font-extrabold text-[var(--color-primary)] sm:text-4xl">
            {t("portfolioSectionSubtitle")}
          </h2>
          <div
            className="section-gold-divider mx-auto mt-4 h-1 w-16 rounded-full"
            aria-hidden="true"
          />
        </div>

        <PortfolioPreviewClient
          projects={featured}
          locale={locale}
          labels={{
            filterAll: t("portfolioFilterAll"),
            filterResidential: t("portfolioFilterResidential"),
            filterCommercial: t("portfolioFilterCommercial"),
            filterInfrastructure: t("portfolioFilterEngineering"),
            portfolioCta: t("portfolioCta"),
            portfolioHref: `/${locale}/portfolio`,
          }}
        />
      </div>
    </SectionWrapper>
  );
}
