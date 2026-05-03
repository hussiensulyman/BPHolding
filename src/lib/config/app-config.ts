export const APP_CONFIG = {
  brandName: "BP Holding",
  locales: ["ar", "en"] as const,
  defaultLocale: "ar",
  brandColors: {
    primary: "#052a42",
    secondary: "#df9a13",
  },
  testIds: {
    languageToggle: "language-toggle",
  },
} as const;

export type AppLocale = (typeof APP_CONFIG.locales)[number];

export const LOCALE_DIRECTION: Record<AppLocale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};