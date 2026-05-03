import { getTranslations } from "next-intl/server";

import { RFQAutoRedirect } from "@/components/forms/RFQAutoRedirect";
import { LocalizedLink } from "@/components/layout/LocalizedLink";
import type { AppLocale } from "@/lib/config/app-config";

type SearchParamValue = string | string[] | undefined;

function pickSearchParam(value: SearchParamValue): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function mapProjectTypeToPortfolioCategory(projectType: string): string {
  switch (projectType.trim()) {
    case "Residential":
      return "RESIDENTIAL";
    case "Commercial":
      return "COMMERCIAL";
    case "Renovation":
      return "RENOVATION";
    case "MEP":
      return "MEP";
    case "Engineering":
      return "ENGINEERING";
    default:
      return "RESIDENTIAL";
  }
}

export default async function RfqSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const activeLocale = locale as AppLocale;
  const t = await getTranslations({ locale: activeLocale });

  const referenceNumber =
    pickSearchParam(resolvedSearchParams.reference) ||
    `RFQ-${new Date().getUTCFullYear()}-00001`;
  const projectType = pickSearchParam(resolvedSearchParams.category) || "Residential";
  const portfolioCategory = mapProjectTypeToPortfolioCategory(projectType);

  const profilePdf =
    activeLocale === "ar"
      ? "/pdfs/BP-Holding-Profile-AR.pdf"
      : "/pdfs/BP-Holding-Profile-EN.pdf";

  return (
    <main className="inline-pad mx-inline-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 py-10">
      <section className="surface-card grid gap-5 px-inline-4 py-8">
        <h1 className="text-start text-4xl font-extrabold text-primary md:text-5xl">
          {t("forms.rfqSuccess.title")}
        </h1>
        <p className="text-start text-lg text-slate-700">
          {t("forms.rfqSuccess.subtitle")}
        </p>

        <div className="rounded-xl border border-primary/20 bg-white px-4 py-4">
          <p className="text-sm font-semibold text-slate-600">
            {t("forms.rfqSuccess.referenceLabel")}
          </p>
          <p className="mt-1 text-2xl font-extrabold text-primary">{referenceNumber}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href={profilePdf}
            download
            className="inline-flex items-center rounded-full bg-primary px-5 py-2 font-semibold text-white transition hover:bg-primary/90"
          >
            {t("forms.rfqSuccess.downloadProfile")}
          </a>

          <LocalizedLink
            href={`/portfolio?category=${portfolioCategory}`}
            className="inline-flex items-center rounded-full border border-primary/30 px-5 py-2 font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            {t("forms.rfqSuccess.browseSimilar")}
          </LocalizedLink>

          <LocalizedLink
            href={`/admin/rfq?mockRef=${encodeURIComponent(referenceNumber)}`}
            className="inline-flex items-center rounded-full border border-secondary/40 bg-secondary/15 px-5 py-2 font-semibold text-primary transition hover:bg-secondary/25"
          >
            {t("forms.rfqSuccess.openAdminMock")}
          </LocalizedLink>
        </div>

        <p className="text-sm text-slate-600">{t("forms.rfqSuccess.adminSyncMock")}</p>

        <RFQAutoRedirect
          locale={activeLocale}
          labelTemplate={t("forms.rfqSuccess.redirectIn", { seconds: "__SECONDS__" })}
        />
      </section>
    </main>
  );
}
