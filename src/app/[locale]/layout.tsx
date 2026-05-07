import type { Metadata } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { routing } from "@/i18n/routing";
import { APP_CONFIG, type AppLocale } from "@/lib/config/app-config";
import { LocaleDirectionProvider } from "@/lib/contexts/locale-direction-context";
import { getLocalizedAlternates, getLocalizedSeo } from "@/lib/seo";
import { getLocaleDirection } from "@/lib/utils/locale";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = hasLocale(routing.locales, locale)
    ? (locale as AppLocale)
    : APP_CONFIG.defaultLocale;
  const seo = getLocalizedSeo(activeLocale);

  return {
    title: seo.title,
    description: seo.description,
    alternates: getLocalizedAlternates(activeLocale),
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
  const activeLocale = locale as AppLocale;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleDirectionProvider locale={activeLocale} direction={direction}>
        <Header />
        {children}
        <Footer locale={activeLocale} />
      </LocaleDirectionProvider>
    </NextIntlClientProvider>
  );
}
