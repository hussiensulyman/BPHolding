"use client";

import { createContext, useContext, useEffect, type ReactNode } from "react";

import type { AppLocale } from "@/lib/config/app-config";

type LocaleDirectionContextValue = {
  locale: AppLocale;
  direction: "rtl" | "ltr";
};

const LocaleDirectionContext = createContext<LocaleDirectionContextValue | null>(null);

type LocaleDirectionProviderProps = {
  locale: AppLocale;
  direction: "rtl" | "ltr";
  children: ReactNode;
};

export function LocaleDirectionProvider({
  locale,
  direction,
  children,
}: LocaleDirectionProviderProps) {
  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
  }, [locale, direction]);

  return (
    <LocaleDirectionContext.Provider value={{ locale, direction }}>
      {children}
    </LocaleDirectionContext.Provider>
  );
}

export function useLocaleDirectionContext() {
  const context = useContext(LocaleDirectionContext);

  if (!context) {
    throw new Error(
      "useLocaleDirectionContext must be used within LocaleDirectionProvider",
    );
  }

  return context;
}
