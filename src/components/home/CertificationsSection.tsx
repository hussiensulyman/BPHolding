import { Award, Download } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SectionWrapper } from "@/components/ui/SectionWrapper";
import type { AppLocale } from "@/lib/config/app-config";

interface CertificationsSectionProps {
  locale: AppLocale;
}

const CERT_ICONS: Record<string, string> = {
  cert1: "✓",
  cert2: "✓",
  cert3: "✓",
  cert4: "✓",
  cert5: "✓",
  cert6: "ISO",
};

export async function CertificationsSection({ locale }: CertificationsSectionProps) {
  const t = await getTranslations({ locale, namespace: "home" });

  const certs = ["cert1", "cert2", "cert3", "cert4", "cert5", "cert6"] as const;

  return (
    <SectionWrapper
      id="credentials"
      className="section-padding bg-[var(--color-background)]"
    >
      <div className="section-container">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[var(--color-secondary)]">
            {t("certsTitle")}
          </p>
          <h2 className="text-3xl font-extrabold text-[var(--color-primary)] sm:text-4xl">
            {t("certsSubtitle")}
          </h2>
          <div
            className="section-gold-divider mx-auto mt-4 h-1 w-16 rounded-full"
            aria-hidden="true"
          />
        </div>

        {/* Cert badges */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {certs.map((key) => (
            <div key={key} className="cert-badge">
              <div
                className="cert-icon-bg flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                aria-hidden="true"
              >
                {CERT_ICONS[key] ?? <Award size={18} />}
              </div>
              <span className="text-center text-xs font-semibold leading-snug text-[var(--color-primary)]">
                {t(key)}
              </span>
            </div>
          ))}
        </div>

        {/* Download CTA */}
        <div className="flex justify-center">
          <a
            href="/pdfs/bp-holding-profile.pdf"
            download
            className="btn-primary inline-flex items-center gap-2.5"
            aria-label={t("downloadProfile")}
          >
            <Download size={18} aria-hidden="true" />
            {t("downloadProfile")}
          </a>
        </div>
      </div>
    </SectionWrapper>
  );
}
