"use client";

import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

import { useLocale } from "@/lib/hooks/use-locale";

export function ContactSection() {
  const { t } = useLocale("home");
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    // Simulate async action
    await new Promise((r) => setTimeout(r, 1200));
    setStatus("success");
  }

  const offices = [
    {
      city: t("contactRiyadh"),
      address: t("contactRiyadhAddress"),
      phone: t("contactPhone1"),
    },
    {
      city: t("contactJeddah"),
      address: t("contactJeddahAddress"),
      phone: t("contactPhone2"),
    },
  ];

  return (
    <section
      id="contact"
      className="contact-section-bg section-padding relative overflow-hidden"
    >
      {/* Geo bg */}
      <div className="geo-bg-diagonals absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-bold uppercase tracking-widest text-[var(--color-secondary)]">
            {t("contactTitle")}
          </p>
          <h2 className="text-3xl font-extrabold text-[var(--color-primary)] sm:text-4xl">
            {t("contactSubtitle")}
          </h2>
          <div
            className="section-gold-divider mx-auto mt-4 h-1 w-16 rounded-full"
            aria-hidden="true"
          />
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          {/* Form */}
          <div className="surface-card p-8">
            {status === "success" ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="contact-success-icon flex h-16 w-16 items-center justify-center rounded-full">
                  <Send
                    size={28}
                    className="text-[var(--color-secondary)]"
                    aria-hidden="true"
                  />
                </div>
                <p className="text-base font-semibold text-[var(--color-primary)]">
                  {t("contactSuccess")}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="text-start mb-1.5 block text-sm font-semibold text-[var(--color-primary)]"
                    >
                      {t("contactName")}
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      minLength={2}
                      className="form-input"
                      placeholder={t("contactName")}
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="text-start mb-1.5 block text-sm font-semibold text-[var(--color-primary)]"
                    >
                      {t("contactEmail")}
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      className="form-input"
                      placeholder={t("contactEmail")}
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="text-start mb-1.5 block text-sm font-semibold text-[var(--color-primary)]"
                  >
                    {t("contactPhone")}
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    className="form-input"
                    placeholder="+966 5X XXX XXXX"
                    autoComplete="tel"
                    pattern="^\+9665[0-9]{8}$"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="text-start mb-1.5 block text-sm font-semibold text-[var(--color-primary)]"
                  >
                    {t("contactMessage")}
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    minLength={10}
                    className="form-input"
                    placeholder={t("contactMessage")}
                    rows={4}
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="btn-primary w-full justify-center"
                  aria-busy={status === "submitting" ? "true" : "false"}
                >
                  {status === "submitting" ? (
                    <>
                      <span
                        className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                        aria-hidden="true"
                      />
                      {t("contactSubmitting")}
                    </>
                  ) : (
                    <>
                      <Send size={16} aria-hidden="true" />
                      {t("contactSubmit")}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Offices */}
          <div className="flex flex-col gap-6">
            {offices.map(({ city, address, phone }) => (
              <div key={city} className="surface-card p-6">
                <h3 className="text-start mb-4 text-base font-bold text-[var(--color-primary)]">
                  {city}
                </h3>
                <div className="flex flex-col gap-3">
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="flex items-start gap-3 text-sm text-slate-600 transition hover:text-[var(--color-primary)]"
                  >
                    <Phone
                      size={15}
                      className="mt-0.5 shrink-0 text-[var(--color-secondary)]"
                      aria-hidden="true"
                    />
                    <span>{phone}</span>
                  </a>
                  <div className="flex items-start gap-3 text-sm text-slate-600">
                    <MapPin
                      size={15}
                      className="mt-0.5 shrink-0 text-[var(--color-secondary)]"
                      aria-hidden="true"
                    />
                    <span className="text-start">{address}</span>
                  </div>
                  <a
                    href={`mailto:${t("contactEmail1")}`}
                    className="flex items-start gap-3 text-sm text-slate-600 transition hover:text-[var(--color-primary)]"
                  >
                    <Mail
                      size={15}
                      className="mt-0.5 shrink-0 text-[var(--color-secondary)]"
                      aria-hidden="true"
                    />
                    <span>{t("contactEmail1")}</span>
                  </a>
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div
              className="h-[180px] overflow-hidden rounded-2xl border border-[var(--color-border)]"
              aria-label="Map placeholder"
            >
              <div className="contact-map-placeholder flex h-full items-center justify-center">
                <span className="flex flex-col items-center gap-2 text-[var(--color-primary)]/50">
                  <MapPin size={32} aria-hidden="true" />
                  <span className="text-xs font-medium">Riyadh, Saudi Arabia</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
