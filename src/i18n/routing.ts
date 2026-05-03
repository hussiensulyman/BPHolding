import { defineRouting } from "next-intl/routing";

import { APP_CONFIG } from "@/lib/config/app-config";

export const routing = defineRouting({
  locales: [...APP_CONFIG.locales],
  defaultLocale: APP_CONFIG.defaultLocale,
  localePrefix: "always",
});