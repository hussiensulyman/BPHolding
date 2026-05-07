import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { RFQForm } from "@/components/forms/RFQForm";
import { LocalizedLink } from "@/components/layout/LocalizedLink";
import { APP_CONFIG, type AppLocale } from "@/lib/config/app-config";
import { getLocalizedAlternates, getLocalizedSeo } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = (
    APP_CONFIG.locales.includes(locale as never) ? locale : APP_CONFIG.defaultLocale
  ) as import("@/lib/config/app-config").AppLocale;
  const seo = getLocalizedSeo(activeLocale);

  const title =
    activeLocale === "ar"
      ? `طلب عرض سعر | ${seo.title}`
      : `Request a Quote | ${seo.title}`;
  const description =
    activeLocale === "ar"
      ? "أرسل تفاصيل مشروعك وسيتواصل معك فريق بي بي القابضة بعرض سعر مخصص."
      : "Submit your project details and BP Holding will contact you with a tailored proposal.";

  return {
    title,
    description,
    alternates: getLocalizedAlternates(activeLocale, "/rfq"),
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

type SearchParamValue = string | string[] | undefined;

function pickSearchParam(value: SearchParamValue): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function RfqPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const activeLocale = locale as AppLocale;
  const t = await getTranslations({ locale: activeLocale });
  const prefilledCategory =
    pickSearchParam(resolvedSearchParams.category) || "RESIDENTIAL";
  const hasPrefilledCategory = Boolean(pickSearchParam(resolvedSearchParams.category));

  return (
    <main className="flex min-h-screen flex-col">
      {/* Page Hero */}
      <div className="page-hero">
        <div className="page-hero-glow" aria-hidden="true" />
        <div className="page-hero-bottom" aria-hidden="true" />
        <div className="section-container relative z-10">
          <span className="page-hero-badge">
            {activeLocale === "ar" ? "تواصل معنا" : "Get in Touch"}
          </span>
          <h1 className="text-start text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
            {t("forms.rfq.title")}
          </h1>
          <p className="text-start mt-4 max-w-xl text-base leading-8 text-white/70 sm:text-lg">
            {t("forms.rfq.subtitle")}
          </p>
          {hasPrefilledCategory && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#df9a13]/40 bg-[#df9a13]/15 px-4 py-2 text-sm font-semibold text-[#df9a13]">
              {t("forms.rfq.prefilledCategory")}
            </div>
          )}
          <div className="mt-6">
            <LocalizedLink
              href="/"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white/80 transition hover:border-white hover:text-white"
            >
              {activeLocale === "ar" ? "← الرئيسية" : "← Home"}
            </LocalizedLink>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-[var(--color-background)] py-14">
        <div className="section-container max-w-3xl">
          <RFQForm initialCategory={prefilledCategory} />
        </div>
      </div>
    </main>
  );
}
