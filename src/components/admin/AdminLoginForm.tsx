"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

type AdminLoginFormProps = {
  locale: "ar" | "en";
  callbackUrl: string;
};

const COPY = {
  en: {
    title: "Admin Login",
    subtitle: "Sign in to access BP Holding control center.",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    submitting: "Signing in...",
    invalid: "Invalid credentials. Please check your email and password.",
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
    hint: "حساب تجريبي: admin@bpholding.net / Admin@12345",
  },
} as const;

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

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (!result || result.error) {
      setError(text.invalid);
      return;
    }

    window.location.href = result.url ?? callbackUrl;
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="surface-card mx-auto grid w-full max-w-md gap-4 px-6 py-7"
    >
      <header className="space-y-2 text-start">
        <h1 className="text-2xl font-bold text-primary">{text.title}</h1>
        <p className="text-sm text-slate-600">{text.subtitle}</p>
      </header>

      <label className="grid gap-1 text-sm font-semibold text-primary">
        <span>{text.email}</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded-xl border border-primary/25 bg-white px-3 py-2 text-slate-800 outline-none ring-secondary/50 transition focus:ring-2"
          required
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-primary">
        <span>{text.password}</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="rounded-xl border border-primary/25 bg-white px-3 py-2 text-slate-800 outline-none ring-secondary/50 transition focus:ring-2"
          required
        />
      </label>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-xl bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? text.submitting : text.submit}
      </button>

      <p className="text-xs text-slate-500">{text.hint}</p>
    </form>
  );
}
