import type { AppLocale } from "@/lib/config/app-config";
import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { PortfolioPreview } from "@/components/home/PortfolioPreview";
import { WhyChooseUsSection } from "@/components/home/WhyChooseUsSection";
import { CertificationsSection } from "@/components/home/CertificationsSection";
import { ContactSection } from "@/components/home/ContactSection";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const activeLocale = locale as AppLocale;

  return (
    <main className="flex min-h-screen flex-col">
      <HeroSection />
      <AboutSection locale={activeLocale} />
      <ServicesSection locale={activeLocale} />
      <PortfolioPreview locale={activeLocale} />
      <WhyChooseUsSection locale={activeLocale} />
      <CertificationsSection locale={activeLocale} />
      <ContactSection />
    </main>
  );
}
