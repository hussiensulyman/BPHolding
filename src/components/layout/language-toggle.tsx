"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { APP_CONFIG } from "@/lib/config/app-config";
import { useLocaleDirection } from "@/lib/hooks/use-locale-direction";

export function LanguageToggle() {
  const t = useTranslations("home");
  const { locale, direction } = useLocaleDirection();
  const nextLocale = locale === "ar" ? "en" : "ar";

  return (
    <Link
      href={`/${nextLocale}`}
      aria-label={t("toggleLabel")}
      data-testid={APP_CONFIG.testIds.languageToggle}
      className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-white px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
    >
      <span className="icon-flip" aria-hidden="true">
        {direction === "rtl" ? "→" : "←"}
      </span>
      <span>{t("switchTo")}</span>
    </Link>
  );
}