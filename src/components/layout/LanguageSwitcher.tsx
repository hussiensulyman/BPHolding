"use client";

import { useCallback, useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { APP_CONFIG, type AppLocale } from "@/lib/config/app-config";
import { useLocale } from "@/lib/hooks/use-locale";

export function LanguageSwitcher() {
  const { locale, dir, t } = useLocale("languageSwitcher");
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = useCallback(
    (nextLocale: AppLocale) => {
      if (nextLocale === locale) {
        return;
      }

      startTransition(() => {
        router.replace(pathname, { locale: nextLocale });
      });
    },
    [locale, pathname, router],
  );

  return (
    <label className="text-flow-start flex flex-col gap-2 text-sm font-semibold text-primary">
      <span>{t("label")}</span>
      <div className="relative inline-flex">
        <span
          aria-hidden="true"
          data-testid={APP_CONFIG.testIds.languageSwitcherIcon}
          className="icon-flip pointer-events-none absolute inset-inline-start-3 top-1/2 -translate-y-1/2"
        >
          {locale === "ar" ? "🇸🇦" : "🇺🇸"}
        </span>
        <select
          aria-label={t("label")}
          data-testid={APP_CONFIG.testIds.languageSwitcher}
          className="appearance-none rounded-full border border-primary/30 bg-white py-2 pe-10 ps-11 text-start text-sm font-semibold text-primary shadow-sm transition hover:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-70"
          value={locale}
          dir={dir}
          onChange={(event) => switchLocale(event.target.value as AppLocale)}
          disabled={isPending}
        >
          <option value="ar">{t("arabicOption")}</option>
          <option value="en">{t("englishOption")}</option>
        </select>
        <span
          aria-hidden="true"
          className="icon-flip pointer-events-none absolute inset-inline-end-3 top-1/2 -translate-y-1/2 text-xs"
        >
          ▾
        </span>
      </div>
    </label>
  );
}
