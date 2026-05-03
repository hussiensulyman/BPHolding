import type { Metadata } from "next";

import { APP_CONFIG, type AppLocale } from "@/lib/config/app-config";
import { routing } from "@/i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bpholding.sa";

const SEO_COPY: Record<AppLocale, { title: string; description: string }> = {
  en: {
    title: "BP Holding | Premium Construction & Engineering",
    description:
      "BP Holding delivers integrated engineering, contracting, and MEP services aligned with Saudi Vision 2030.",
  },
  ar: {
    title: "بي بي القابضة | حلول هندسية وإنشائية متميزة",
    description:
      "تقدم بي بي القابضة خدمات هندسية وإنشائية وكهروميكانيكية متكاملة تتماشى مع رؤية السعودية 2030.",
  },
};

function normalizePathname(pathname: string) {
  if (!pathname || pathname === "/") {
    return "";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function getLocalizedSeo(locale: AppLocale) {
  return SEO_COPY[locale];
}

export function getLocalizedAlternates(
  locale: AppLocale,
  pathname = "/",
): Metadata["alternates"] {
  const normalizedPathname = normalizePathname(pathname);

  const languages = Object.fromEntries(
    routing.locales.map((candidate) => [
      candidate,
      `${SITE_URL}/${candidate}${normalizedPathname}`,
    ]),
  ) as Record<string, string>;

  return {
    canonical: `${SITE_URL}/${locale}${normalizedPathname}`,
    languages: {
      ...languages,
      "x-default": `${SITE_URL}/${APP_CONFIG.defaultLocale}${normalizedPathname}`,
    },
  };
}
