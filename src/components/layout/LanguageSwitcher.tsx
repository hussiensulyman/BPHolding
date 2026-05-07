"use client";

import { useCallback, useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { APP_CONFIG, type AppLocale } from "@/lib/config/app-config";
import { useLocale } from "@/lib/hooks/use-locale";

interface LanguageSwitcherProps {
  /** Render in compact mode (used inside header) */
  compact?: boolean;
}

const LANG_CONFIG: Record<AppLocale, { flag: string; short: string; label: string }> = {
  ar: { flag: "🇸🇦", short: "AR", label: "العربية" },
  en: { flag: "🇺🇸", short: "EN", label: "English" },
};

export function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { locale, t } = useLocale("languageSwitcher");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const nextLocale: AppLocale = locale === "ar" ? "en" : "ar";
  const current = LANG_CONFIG[locale];
  const next = LANG_CONFIG[nextLocale];

  const switchLocale = useCallback(() => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }, [nextLocale, pathname, router]);

  return (
    <button
      type="button"
      data-testid={APP_CONFIG.testIds.languageSwitcher}
      aria-label={`${t("label")}: ${next.label}`}
      title={`Switch to ${next.label}`}
      onClick={switchLocale}
      disabled={isPending}
      className={`inline-flex items-center gap-1.5 rounded-full border border-[var(--color-primary)]/25 bg-white/90 px-3 py-1.5 text-xs font-bold text-[var(--color-primary)] shadow-sm transition-all duration-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${compact ? "" : "text-sm"}`}
    >
      <span data-testid={APP_CONFIG.testIds.languageSwitcherIcon} aria-hidden="true">
        {current.flag}
      </span>
      <span>{current.short}</span>
      {isPending && (
        <span
          className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
