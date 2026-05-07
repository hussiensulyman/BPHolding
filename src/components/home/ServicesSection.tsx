import { Cpu, HardHat, Settings, Wrench } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { FeatureCard } from "@/components/ui/FeatureCard";
import { SectionWrapper } from "@/components/ui/SectionWrapper";
import type { AppLocale } from "@/lib/config/app-config";

interface ServicesSectionProps {
  locale: AppLocale;
}

const SERVICE_ICONS = [HardHat, Wrench, Settings, Cpu] as const;

export async function ServicesSection({ locale }: ServicesSectionProps) {
  const t = await getTranslations({ locale, namespace: "home" });

  const services = [
    {
      Icon: SERVICE_ICONS[0],
      titleKey: "service1Title" as const,
      descKey: "service1Desc" as const,
    },
    {
      Icon: SERVICE_ICONS[1],
      titleKey: "service2Title" as const,
      descKey: "service2Desc" as const,
    },
    {
      Icon: SERVICE_ICONS[2],
      titleKey: "service3Title" as const,
      descKey: "service3Desc" as const,
    },
    {
      Icon: SERVICE_ICONS[3],
      titleKey: "service4Title" as const,
      descKey: "service4Desc" as const,
    },
  ];

  return (
    <SectionWrapper
      id="services"
      className="services-section-bg section-padding relative overflow-hidden"
    >
      {/* Background geo pattern */}
      <div className="geo-bg-dots absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[var(--color-secondary)]">
            {t("servicesTitle")}
          </p>
          <h2 className="text-3xl font-extrabold text-[var(--color-primary)] sm:text-4xl">
            {t("servicesSubtitle")}
          </h2>
          <div
            className="section-gold-divider mx-auto mt-4 h-1 w-16 rounded-full"
            aria-hidden="true"
          />
        </div>

        {/* Cards grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map(({ Icon, titleKey, descKey }) => (
            <FeatureCard
              key={titleKey}
              Icon={Icon}
              title={t(titleKey)}
              description={t(descKey)}
            />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
