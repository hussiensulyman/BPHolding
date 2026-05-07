import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

type SearchParamValue = string | string[] | undefined;

function pickValue(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function normalizeCallbackUrl(rawValue: string | undefined, locale: "en" | "ar"): string {
  const fallback = `/${locale}/admin`;

  if (!rawValue) {
    return fallback;
  }

  const decodedOnce = safeDecode(rawValue);
  const decodedTwice = safeDecode(decodedOnce);
  const callbackUrl = decodedTwice.trim();

  if (!callbackUrl.startsWith("/") || callbackUrl.startsWith("//")) {
    return fallback;
  }

  if (
    callbackUrl === "/admin/login" ||
    callbackUrl.startsWith("/admin/login?") ||
    callbackUrl === `/${locale}/admin/login` ||
    callbackUrl.startsWith(`/${locale}/admin/login?`)
  ) {
    return fallback;
  }

  return callbackUrl;
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
  const callbackUrl = normalizeCallbackUrl(
    pickValue(resolvedSearchParams.callbackUrl),
    activeLocale,
  );

  return (
    <main className="inline-pad mx-inline-auto flex min-h-screen w-full max-w-7xl items-center py-10">
      <AdminLoginForm locale={activeLocale} callbackUrl={callbackUrl} />
    </main>
  );
}
