import { getTranslations } from "next-intl/server";

import { RFQForm } from "@/components/forms/RFQForm";
import type { AppLocale } from "@/lib/config/app-config";

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
    <main className="inline-pad mx-inline-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 py-10">
      <header className="surface-card px-inline-4 py-8">
        <h1 className="text-start text-4xl font-extrabold text-primary md:text-5xl">
          {t("forms.rfq.title")}
        </h1>
        <p className="text-start mt-4 text-lg text-slate-700">
          {t("forms.rfq.subtitle")}
        </p>
        {hasPrefilledCategory ? (
          <p className="mt-3 rounded-xl bg-secondary/10 px-3 py-2 text-sm text-primary">
            {t("forms.rfq.prefilledCategory")}
          </p>
        ) : null}
      </header>

      <RFQForm initialCategory={prefilledCategory} />
    </main>
  );
}
