import { Inter, Manrope, Cairo } from "next/font/google";
import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { APP_CONFIG } from "@/lib/config/app-config";
import { getLocaleDirection, isSupportedLocale } from "@/lib/utils/locale";
import NavigationDebugger from "@/components/layout/NavigationDebugger";

import "./globals.css";

// display:'optional' = no CLS, no render blocking. Fonts are self-hosted by
// next/font after first build; subsequent starts are instant from disk cache.
// preload:false avoids eager <link rel=preload> tags that stall the first
// dev-server compile while Google font files are being fetched.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-en-inter",
  display: "optional",
  preload: false,
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-en-manrope",
  display: "optional",
  preload: false,
  weight: ["400", "500", "600", "700"],
});

const cairo = Cairo({
  // Arabic subset is ~2 MB. Without preload:false this was downloaded eagerly
  // during dev compilation, adding 5-8 s to every cold start.
  subsets: ["arabic", "latin"],
  variable: "--font-ar-cairo",
  display: "optional",
  preload: false,
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
      className={`${inter.variable} ${manrope.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body className="font-fallback-vars min-h-screen antialiased">
        <NavigationDebugger />
        {children}
      </body>
    </html>
  );
}
