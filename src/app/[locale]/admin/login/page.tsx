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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#052a42] px-4 py-12">
      {/* Geometric background elements */}
      <div className="pointer-events-none absolute inset-0">
        {/* Gold diagonal bar */}
        <div className="absolute bottom-0 left-0 h-1 w-full bg-[#df9a13]/60" />
        {/* Top-right gold glow */}
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#df9a13]/10" />
        {/* Bottom-left navy pattern */}
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-white/5" />
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Diagonal slash */}
        <div
          className="absolute inset-y-0 right-1/4 w-px bg-[#df9a13]/20"
          style={{ transform: "skewX(-12deg)" }}
        />
      </div>

      <AdminLoginForm locale={activeLocale} callbackUrl={callbackUrl} />
    </main>
  );
}
