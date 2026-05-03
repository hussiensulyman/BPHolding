export const APP_CONFIG = {
  brandName: "BP Holding",
  locales: ["en", "ar"] as const,
  defaultLocale: "ar",
  brandColors: {
    primary: "#052a42",
    secondary: "#df9a13",
  },
  testIds: {
    languageSwitcher: "language-switcher",
    languageSwitcherIcon: "language-switcher-icon",
    portfolioProjectItem: "portfolio-project-item",
  },
} as const;

export type AppLocale = (typeof APP_CONFIG.locales)[number];

export const LOCALE_DIRECTION: Record<AppLocale, "rtl" | "ltr"> = {
  ar: "rtl",
  en: "ltr",
};
