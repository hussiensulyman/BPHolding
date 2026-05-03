import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export const i18nRouting = {
  locales: ["en", "ar"],
  defaultLocale: "ar",
} as const;

const nextConfig: NextConfig = {
  typedRoutes: true,
};

export default withNextIntl(nextConfig);
