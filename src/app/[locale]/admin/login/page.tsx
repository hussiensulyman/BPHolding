import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

type SearchParamValue = string | string[] | undefined;

function pickValue(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export default async function AdminLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, SearchParamValue>>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const activeLocale = locale === "en" ? "en" : "ar";
  const callbackUrl =
    pickValue(resolvedSearchParams.callbackUrl) ?? `/${activeLocale}/admin`;

  return (
    <main className="inline-pad mx-inline-auto flex min-h-screen w-full max-w-7xl items-center py-10">
      <AdminLoginForm locale={activeLocale} callbackUrl={callbackUrl} />
    </main>
  );
}
