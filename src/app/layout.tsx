import { getLocale } from "next-intl/server";
import type { ReactNode } from "react";

import { APP_CONFIG } from "@/lib/config/app-config";
import { getLocaleDirection, isSupportedLocale } from "@/lib/utils/locale";

import "./globals.css";

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
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className="font-fallback-vars min-h-screen antialiased">{children}</body>
    </html>
  );
}
