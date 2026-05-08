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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bpholding.sa";

const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "BP Holding - Business Pioneers",
  alternateName: "بي بي القابضة",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logo.png`,
  description:
    "Premium construction and engineering solutions in Saudi Arabia. Over 20 years of excellence in MEP, contracting, and engineering consultancy.",
  foundingDate: "2021",
  address: {
    "@type": "PostalAddress",
    streetAddress: "King Fahad Rd, Al Olaya",
    addressLocality: "Riyadh",
    postalCode: "12211",
    addressCountry: "SA",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+966-11-000-0000",
    contactType: "Customer Service",
    availableLanguage: ["Arabic", "English"],
  },
  sameAs: [
    "https://www.linkedin.com/company/business-pioneers-holding/",
    "https://www.facebook.com/p/Business-Pioneers-Holding-PB-61584852089418/",
  ],
};

const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "BP Holding",
  priceRange: "$$$",
  openingHours: "Su-Th 08:00-17:00",
  department: [
    {
      "@type": "LocalBusiness",
      name: "BP Holding - Riyadh HQ",
      telephone: "+966-11-000-0000",
      address: {
        "@type": "PostalAddress",
        streetAddress: "King Fahad Rd, Al Olaya",
        addressLocality: "Riyadh",
        addressCountry: "SA",
      },
    },
    {
      "@type": "LocalBusiness",
      name: "BP Holding - Jeddah Branch",
      telephone: "+966-21-000-0000",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Tahlia St, Al Andalus",
        addressLocality: "Jeddah",
        addressCountry: "SA",
      },
    },
  ],
};

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
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(LOCAL_BUSINESS_SCHEMA) }}
      />

      <HeroSection />
      {/* Sections render in one RSC pass – no Suspense to avoid concurrent-render
          timing issues with SectionWrapper's useLayoutEffect viewport check. */}
      <AboutSection locale={activeLocale} />
      <ServicesSection locale={activeLocale} />
      <PortfolioPreview locale={activeLocale} />
      <WhyChooseUsSection locale={activeLocale} />
      <CertificationsSection locale={activeLocale} />
      <ContactSection />
    </main>
  );
}
