"use client";

import { useLocale as useIntlLocale, useTranslations } from "next-intl";

import { APP_CONFIG } from "@/lib/config/app-config";
import { getLocaleDirection, isSupportedLocale } from "@/lib/utils/locale";

export function useLocale<Namespace extends string = string>(namespace?: Namespace) {
  const activeLocale = useIntlLocale();
  const locale = isSupportedLocale(activeLocale)
    ? activeLocale
    : APP_CONFIG.defaultLocale;
  const dir = getLocaleDirection(locale);
  const t = useTranslations(namespace);

  return {
    locale,
    dir,
    t,
  } as const;
}
