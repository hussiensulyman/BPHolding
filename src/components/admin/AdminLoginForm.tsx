"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

type AdminLoginFormProps = {
  locale: "ar" | "en";
  callbackUrl: string;
};

function normalizeRedirectUrl(
  rawUrl: string | null | undefined,
  fallback: string,
): string {
  if (!rawUrl) {
    return fallback;
  }

  if (rawUrl.startsWith("/") && !rawUrl.startsWith("//")) {
    return rawUrl;
  }

  try {
    const parsed = new URL(rawUrl);
    const relative = `${parsed.pathname}${parsed.search}${parsed.hash}`;

    if (relative.startsWith("/") && !relative.startsWith("//")) {
      return relative;
    }
  } catch {
    return fallback;
  }

  return fallback;
}

const COPY = {
  en: {
    title: "Admin Login",
    subtitle: "Sign in to access BP Holding control center.",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    submitting: "Signing in...",
    invalid: "Invalid credentials. Please check your email and password.",
    unavailable: "Sign in service is temporarily unavailable. Please try again.",
    hint: "Demo seeded account: admin@bpholding.net / Admin@12345",
  },
  ar: {
    title: "تسجيل دخول الإدارة",
    subtitle: "سجل الدخول للوصول إلى لوحة تحكم بي بي القابضة.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    submit: "تسجيل الدخول",
    submitting: "جارٍ تسجيل الدخول...",
    invalid: "بيانات الدخول غير صحيحة. يرجى مراجعة البريد وكلمة المرور.",
    unavailable: "خدمة تسجيل الدخول غير متاحة مؤقتاً. يرجى المحاولة مرة أخرى.",
    hint: "حساب تجريبي: admin@bpholding.net / Admin@12345",
  },
} as const;

const SIGN_IN_TIMEOUT_MS = 15000;

export function AdminLoginForm({ locale, callbackUrl }: AdminLoginFormProps) {
  const [email, setEmail] = useState("admin@bpholding.net");
  const [password, setPassword] = useState("Admin@12345");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = COPY[locale];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    let timeoutId: number | undefined;

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = window.setTimeout(() => {
          reject(new Error("SIGN_IN_TIMEOUT"));
        }, SIGN_IN_TIMEOUT_MS);
      });

      const result = await Promise.race([
        signIn("credentials", {
          redirect: false,
          email,
          password,
          callbackUrl,
        }),
        timeoutPromise,
      ]);

      if (!result || result.error) {
        setError(text.invalid);
        return;
      }

      const safeRedirect = normalizeRedirectUrl(result.url, callbackUrl);
      window.location.replace(safeRedirect);
    } catch {
      setError(text.unavailable);
    } finally {
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      setIsSubmitting(false);
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="relative z-10 mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-sm"
    >
      {/* BP Logo */}
      <div className="mb-6 flex flex-col items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#df9a13] text-xl font-extrabold text-[#052a42] shadow-lg">
          BP
        </span>
        <div className="text-center">
          <h1 className="text-xl font-extrabold text-white">{text.title}</h1>
          <p className="mt-0.5 text-sm text-white/60">{text.subtitle}</p>
        </div>
      </div>

      <label className="mb-4 grid gap-1.5 text-sm font-semibold text-white/80">
        <span>{text.email}</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/30 outline-none ring-[#df9a13]/60 transition focus:border-[#df9a13]/60 focus:ring-2"
          required
        />
      </label>

      <label className="mb-4 grid gap-1.5 text-sm font-semibold text-white/80">
        <span>{text.password}</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/30 outline-none ring-[#df9a13]/60 transition focus:border-[#df9a13]/60 focus:ring-2"
          required
        />
      </label>

      <label className="mb-6 flex cursor-pointer items-center gap-2.5 text-sm text-white/70">
        <input
          type="checkbox"
          className="h-4 w-4 rounded accent-[#df9a13] cursor-pointer"
        />
        {locale === "ar" ? "تذكرني" : "Remember me"}
      </label>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-[#df9a13] px-4 py-3 font-bold text-[#052a42] transition hover:bg-[#df9a13]/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? text.submitting : text.submit}
      </button>

      {/* Demo credentials */}
      <div className="mt-6 rounded-xl border border-[#df9a13]/20 bg-[#df9a13]/10 p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#df9a13]">
          {locale === "ar" ? "حساب تجريبي" : "Demo Credentials"}
        </p>
        <div className="grid gap-1 text-xs text-white/70">
          <div className="flex items-center gap-2">
            <span className="w-20 font-semibold text-white/50">
              {locale === "ar" ? "البريد" : "Email"}
            </span>
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-white">
              admin@bpholding.net
            </code>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-20 font-semibold text-white/50">
              {locale === "ar" ? "كلمة السر" : "Password"}
            </span>
            <code className="rounded bg-white/10 px-1.5 py-0.5 text-white">
              Admin@12345
            </code>
          </div>
        </div>
      </div>
    </form>
  );
}
