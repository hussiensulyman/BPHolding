import { Layers, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import type { AppLocale } from "@/lib/config/app-config";

interface WhyChooseUsSectionProps {
  locale: AppLocale;
}

export async function WhyChooseUsSection({ locale }: WhyChooseUsSectionProps) {
  const t = await getTranslations({ locale, namespace: "home" });

  const features = [
    {
      Icon: ShieldCheck,
      titleKey: "why1Title" as const,
      descKey: "why1Desc" as const,
    },
    {
      Icon: Zap,
      titleKey: "why2Title" as const,
      descKey: "why2Desc" as const,
    },
    {
      Icon: Sparkles,
      titleKey: "why3Title" as const,
      descKey: "why3Desc" as const,
    },
    {
      Icon: Layers,
      titleKey: "why4Title" as const,
      descKey: "why4Desc" as const,
    },
  ];

  return (
    <SectionWrapper
      id="why-us"
      className="why-section-bg section-padding relative overflow-hidden"
    >
      {/* Geometric grid overlay */}
      <div className="geo-bg-grid absolute inset-0 opacity-25" aria-hidden="true" />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[var(--color-secondary)]">
            {t("whyTitle")}
          </p>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            {t("whySubtitle")}
          </h2>
          <div
            className="section-gold-divider mx-auto mt-4 h-1 w-16 rounded-full"
            aria-hidden="true"
          />
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="group rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition hover:border-[var(--color-secondary)]/50 hover:bg-white/10"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-secondary)]/15 text-[var(--color-secondary)] transition group-hover:bg-[var(--color-secondary)] group-hover:text-[var(--color-primary)]">
                <Icon size={22} aria-hidden="true" />
              </div>
              <h3 className="text-start mb-2 text-base font-bold text-white">
                {t(titleKey)}
              </h3>
              <p className="text-start text-sm leading-relaxed text-white/65">
                {t(descKey)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
