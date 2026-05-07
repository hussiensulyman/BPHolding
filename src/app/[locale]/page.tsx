import { Suspense } from "react";

import type { AppLocale } from "@/lib/config/app-config";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { CertificationsSection } from "@/components/home/CertificationsSection";
import { ContactSection } from "@/components/home/ContactSection";

// Force re-render on every navigation to prevent back-nav blank screen
export const dynamic = "force-dynamic";

function SectionFallback({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`section-padding animate-pulse ${dark ? "bg-[var(--color-primary)]/5" : "bg-[var(--color-surface)]"}`}
      aria-hidden="true"
    />
  );
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale as AppLocale;

  return (
    <main className="flex min-h-screen flex-col" key={activeLocale}>
      <HeroSection />
      <Suspense fallback={<SectionFallback />}>
        <AboutSection locale={activeLocale} />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <ServicesSection locale={activeLocale} />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <PortfolioPreview locale={activeLocale} />
      </Suspense>
      <Suspense fallback={<SectionFallback dark />}>
        <WhyChooseUsSection locale={activeLocale} />
      </Suspense>
      <Suspense fallback={<SectionFallback />}>
        <CertificationsSection locale={activeLocale} />
      </Suspense>
      <ContactSection />
    </main>
  );
}
