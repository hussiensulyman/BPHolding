import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { LocalizedLink } from "@/components/layout/LocalizedLink";
import { NewsletterForm } from "@/components/layout/NewsletterForm";
import type { AppLocale } from "@/lib/config/app-config";

const QUICK_LINKS = [
  { href: "/", labelKey: "home" },
  { href: "/#about", labelKey: "about" },
  { href: "/#services", labelKey: "services" },
  { href: "/portfolio", labelKey: "portfolio" },
] as const;

const SERVICE_LINKS = [
  "Engineering Consultancy",
  "General Contracting",
  "MEP Services",
  "Renovation",
] as const;

interface FooterProps {
  locale: AppLocale;
}

export async function Footer({ locale }: FooterProps) {
  const t = await getTranslations({ locale, namespace: "footer" });
  const tHome = await getTranslations({ locale, namespace: "home" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  return (
    <footer className="bg-[var(--color-primary)] text-white">
      {/* Main footer body */}
      <div className="section-container py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2.5">
              <span className="bp-logo-gold flex h-9 w-9 items-center justify-center rounded-lg text-sm font-extrabold">
                BP
              </span>
              <span className="font-bold text-base text-white">BP Holding</span>
            </div>
            <p className="text-start mb-5 text-sm leading-relaxed text-white/70">
              {t("description")}
            </p>
            {/* Social */}
            <div className="flex gap-3">
              <a
                href="https://www.linkedin.com/company/bpholding"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("linkedin")}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/70 transition hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://www.facebook.com/bpholding"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("facebook")}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/70 transition hover:bg-[var(--color-secondary)] hover:text-[var(--color-primary)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  width="16"
                  height="16"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-start mb-4 text-sm font-bold uppercase tracking-wider text-[var(--color-secondary)]">
              {t("quickLinks")}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map(({ href, labelKey }) => (
                <li key={labelKey}>
                  <LocalizedLink
                    href={href}
                    className="text-start block text-sm text-white/70 transition hover:text-[var(--color-secondary)]"
                  >
                    {tNav(labelKey)}
                  </LocalizedLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-start mb-4 text-sm font-bold uppercase tracking-wider text-[var(--color-secondary)]">
              {t("services")}
            </h3>
            <ul className="flex flex-col gap-2.5">
              {SERVICE_LINKS.map((s) => (
                <li key={s}>
                  <span className="text-start block text-sm text-white/70">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-start mb-4 text-sm font-bold uppercase tracking-wider text-[var(--color-secondary)]">
              {tNav("contact")}
            </h3>
            <address className="not-italic flex flex-col gap-3">
              <a
                href={`tel:${tHome("contactPhone1").replace(/\s/g, "")}`}
                className="flex items-start gap-2.5 text-sm text-white/70 transition hover:text-[var(--color-secondary)]"
              >
                <Phone size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{tHome("contactPhone1")}</span>
              </a>
              <a
                href={`mailto:${tHome("contactEmail1")}`}
                className="flex items-start gap-2.5 text-sm text-white/70 transition hover:text-[var(--color-secondary)]"
              >
                <Mail size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>{tHome("contactEmail1")}</span>
              </a>
              <div className="flex items-start gap-2.5 text-sm text-white/70">
                <MapPin size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span className="text-start">{tHome("contactRiyadhAddress")}</span>
              </div>
            </address>

            {/* Newsletter */}
            <div className="mt-6">
              <p className="text-start mb-2 text-sm font-semibold text-white/80">
                {t("newsletter")}
              </p>
              <NewsletterForm
                emailPlaceholder={t("emailPlaceholder")}
                subscribeLabel={t("subscribe")}
                ariaLabel={t("newsletter")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="section-container py-4 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50">
          <span>
            © {new Date().getFullYear()} BP Holding. {t("rights")}
          </span>
          <div className="flex gap-4">
            <LocalizedLink
              href="/privacy"
              className="transition hover:text-[var(--color-secondary)]"
            >
              {t("privacyPolicy")}
            </LocalizedLink>
            <LocalizedLink
              href="/terms"
              className="transition hover:text-[var(--color-secondary)]"
            >
              {t("termsOfService")}
            </LocalizedLink>
          </div>
        </div>
      </div>
    </footer>
  );
}
