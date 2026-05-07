import { CheckCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import { StatCounter } from "@/components/ui/StatCounter";
import type { AppLocale } from "@/lib/config/app-config";

interface AboutSectionProps {
  locale: AppLocale;
}

export async function AboutSection({ locale }: AboutSectionProps) {
  const t = await getTranslations({ locale, namespace: "home" });

  const highlights = [t("missionTitle"), t("visionTitle"), "Saudi Vision 2030 Aligned"];

  return (
    <SectionWrapper id="about" className="section-padding bg-[var(--color-background)]">
      <div className="section-container">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Visual */}
          <div className="relative order-2 lg:order-1">
            {/* Primary image placeholder */}
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <div className="about-img-gradient absolute inset-0 flex items-center justify-center">
                {/* Placeholder pattern */}
                <div className="about-img-pattern absolute inset-0 opacity-20" />
                <span className="relative z-10 text-6xl font-extrabold text-[#df9a13] opacity-30">
                  BP
                </span>
              </div>
            </div>
            {/* Gold accent corner decoration */}
            <div
              className="about-corner-gold absolute -bottom-4 -end-4 h-24 w-24 rounded-xl"
              aria-hidden="true"
            />
            <div
              className="absolute -top-4 -start-4 h-16 w-16 rounded-xl border-4 border-[var(--color-primary)] bg-transparent"
              aria-hidden="true"
            />
          </div>

          {/* Right: Text */}
          <div className="order-1 lg:order-2">
            <p className="text-start mb-2 text-sm font-bold uppercase tracking-widest text-[var(--color-secondary)]">
              {t("aboutTitle")}
            </p>
            <h2 className="gold-accent-line text-start mb-5 text-3xl font-extrabold leading-snug text-[var(--color-primary)] sm:text-4xl">
              {t("aboutSubtitle")}
            </h2>
            <p className="text-start mb-8 text-base leading-8 text-slate-600">
              {t("aboutDescription")}
            </p>

            {/* Highlights */}
            <ul className="mb-8 flex flex-col gap-3" aria-label="Highlights">
              {highlights.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <CheckCircle
                    size={18}
                    className="shrink-0 text-[var(--color-secondary)]"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium text-slate-700">{item}</span>
                </li>
              ))}
            </ul>

            {/* Mission / Vision Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="surface-card p-5">
                <h3 className="text-start mb-2 text-base font-bold text-[var(--color-primary)]">
                  {t("missionTitle")}
                </h3>
                <p className="text-start text-sm leading-relaxed text-slate-600">
                  {t("mission")}
                </p>
              </div>
              <div className="surface-card p-5">
                <h3 className="text-start mb-2 text-base font-bold text-[var(--color-primary)]">
                  {t("visionTitle")}
                </h3>
                <p className="text-start text-sm leading-relaxed text-slate-600">
                  {t("vision")}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-[var(--color-border)] sm:grid-cols-4"
          aria-label="Company statistics"
        >
          {[
            { value: t("stat1Value"), label: t("stat1Label"), delay: 0 },
            { value: t("stat2Value"), label: t("stat2Label"), delay: 0.1 },
            { value: t("stat3Value"), label: t("stat3Label"), delay: 0.2 },
            { value: t("stat4Value"), label: t("stat4Label"), delay: 0.3 },
          ].map(({ value, label, delay }) => (
            <div key={label} className="bg-[var(--color-surface)]">
              <StatCounter value={value} label={label} delay={delay} />
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
