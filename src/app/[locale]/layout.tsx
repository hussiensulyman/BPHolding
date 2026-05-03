import type { Metadata } from "next";
import {
  Cairo,
  IBM_Plex_Sans_Arabic,
  Inter,
  Manrope,
} from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { routing } from "@/i18n/routing";
import { APP_CONFIG, type AppLocale } from "@/lib/config/app-config";
import { LocaleDirectionProvider } from "@/lib/contexts/locale-direction-context";
import { getLocaleDirection } from "@/lib/utils/locale";

import "../globals.css";

const enInter = Inter({
  variable: "--font-en-inter",
  subsets: ["latin"],
});

const enManrope = Manrope({
  variable: "--font-en-manrope",
  subsets: ["latin"],
});

const arCairo = Cairo({
  variable: "--font-ar-cairo",
  subsets: ["arabic", "latin"],
});

const arPlex = IBM_Plex_Sans_Arabic({
  variable: "--font-ar-plex",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const fallback = APP_CONFIG.defaultLocale;
  const activeLocale = hasLocale(routing.locales, locale) ? locale : fallback;

  const t = await getTranslations({ locale: activeLocale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const direction = getLocaleDirection(locale);

  return (
    <html
      lang={locale}
      dir={direction}
      suppressHydrationWarning
      className={`${enInter.variable} ${enManrope.variable} ${arCairo.variable} ${arPlex.variable}`}
    >
      <body className="min-h-screen antialiased">
        <NextIntlClientProvider messages={messages}>
          <LocaleDirectionProvider locale={locale as AppLocale} direction={direction}>
            {children}
          </LocaleDirectionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}