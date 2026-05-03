import { Cairo, IBM_Plex_Sans_Arabic, Inter, Manrope } from "next/font/google";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { APP_CONFIG } from "@/lib/config/app-config";
import { getLocaleDirection, isSupportedLocale } from "@/lib/utils/locale";

import "./globals.css";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const requestedLocale = await getLocale().catch(() => APP_CONFIG.defaultLocale);
  const locale = isSupportedLocale(requestedLocale)
    ? requestedLocale
    : APP_CONFIG.defaultLocale;
  const dir = getLocaleDirection(locale);

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${enInter.variable} ${enManrope.variable} ${arCairo.variable} ${arPlex.variable}`}
    >
      <body className="font-fallback-vars min-h-screen antialiased">{children}</body>
    </html>
  );
}
