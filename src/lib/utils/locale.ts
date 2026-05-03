import { APP_CONFIG, LOCALE_DIRECTION, type AppLocale } from "@/lib/config/app-config";

export function isSupportedLocale(locale: string): locale is AppLocale {
  return APP_CONFIG.locales.includes(locale as AppLocale);
}

export function getLocaleDirection(locale: string): "rtl" | "ltr" {
  if (!isSupportedLocale(locale)) {
    return LOCALE_DIRECTION[APP_CONFIG.defaultLocale];
  }

  return LOCALE_DIRECTION[locale];
}