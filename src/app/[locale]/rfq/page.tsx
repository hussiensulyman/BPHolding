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
  const prefilledCategory =
    pickSearchParam(resolvedSearchParams.category) || "RESIDENTIAL";

  return (
    <main className="inline-pad mx-inline-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 py-10">
      <header className="surface-card px-inline-4 py-8">
        <h1 className="text-start text-4xl font-extrabold text-primary md:text-5xl">
          {activeLocale === "ar" ? "طلب عرض سعر" : "Request for Quotation"}
        </h1>
        <p className="text-start mt-4 text-lg text-slate-700">
          {activeLocale === "ar"
            ? "تم تعبئة فئة المشروع تلقائياً بناءً على المشروع المحدد."
            : "Project category has been prefilled from the selected portfolio project."}
        </p>
      </header>

      <form className="surface-card grid gap-4 px-5 py-5" aria-label="rfq-form">
        <label className="grid gap-1 text-sm font-semibold text-primary">
          {activeLocale === "ar" ? "فئة المشروع" : "Project Category"}
          <input
            type="text"
            name="projectCategory"
            defaultValue={prefilledCategory}
            readOnly
            className="rounded-xl border border-primary/20 bg-slate-50 px-3 py-2 text-slate-700"
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-primary">
          {activeLocale === "ar" ? "الاسم الكامل" : "Full Name"}
          <input
            type="text"
            name="fullName"
            className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-primary">
          {activeLocale === "ar" ? "البريد الإلكتروني" : "Email"}
          <input
            type="email"
            name="email"
            className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-primary">
          {activeLocale === "ar" ? "رسالة المشروع" : "Project Message"}
          <textarea
            name="message"
            rows={4}
            className="rounded-xl border border-primary/20 bg-white px-3 py-2 text-slate-700"
          />
        </label>

        <button
          type="submit"
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          {activeLocale === "ar" ? "إرسال الطلب" : "Submit Request"}
        </button>
      </form>
    </main>
  );
}
