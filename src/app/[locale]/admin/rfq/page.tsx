import { getTranslations } from "next-intl/server";

import { LocalizedLink } from "@/components/layout/LocalizedLink";
import type { AppLocale } from "@/lib/config/app-config";

type SearchParamValue = string | string[] | undefined;

function pickSearchParam(value: SearchParamValue): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function AdminRfqMockPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const activeLocale = locale as AppLocale;
  const t = await getTranslations({ locale: activeLocale });

  const mockReference = pickSearchParam(resolvedSearchParams.mockRef);

  return (
    <main className="inline-pad mx-inline-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 py-10">
      <section className="surface-card grid gap-4 px-inline-4 py-8">
        <h1 className="text-start text-3xl font-extrabold text-primary">
          {t("forms.rfqSuccess.adminDashboardMockTitle")}
        </h1>
        <p className="text-start text-slate-700">
          {t("forms.rfqSuccess.adminDashboardMockSubtitle")}
        </p>

        <div className="overflow-hidden rounded-xl border border-primary/15 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 text-start">
                  {t("forms.rfqSuccess.referenceLabel")}
                </th>
                <th className="px-4 py-3 text-start">
                  {t("forms.rfqSuccess.adminStatus")}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  className="px-4 py-3 font-semibold text-primary"
                  data-testid="mock-admin-reference"
                >
                  {mockReference || "-"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {t("forms.rfqSuccess.adminStatusValue")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div>
          <LocalizedLink
            href="/rfq"
            className="inline-flex items-center rounded-full border border-primary/30 px-4 py-2 font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            {t("forms.rfqSuccess.backToRfq")}
          </LocalizedLink>
        </div>
      </section>
    </main>
  );
}
