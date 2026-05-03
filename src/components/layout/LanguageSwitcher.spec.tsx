import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import type { AppLocale } from "@/lib/config/app-config";

type TestState = {
  locale: AppLocale;
  dir: "rtl" | "ltr";
};

const mockState: TestState = {
  locale: "ar",
  dir: "rtl",
};

const replaceMock = vi.fn();

const languageSwitcherMessages = {
  ar: {
    label: "اللغة",
    arabicOption: "🇸🇦 العربية (Arabic)",
    englishOption: "🇺🇸 English (الإنجليزية)",
  },
  en: {
    label: "Language",
    arabicOption: "🇸🇦 العربية (Arabic)",
    englishOption: "🇺🇸 English (الإنجليزية)",
  },
} as const;

vi.mock("@/lib/hooks/use-locale", () => ({
  useLocale: () => ({
    locale: mockState.locale,
    dir: mockState.dir,
    t: (key: keyof (typeof languageSwitcherMessages)["ar"]) =>
      languageSwitcherMessages[mockState.locale][key],
  }),
}));

vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/portfolio",
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

describe("LanguageSwitcher", () => {
  it("switches locale and updates visible label text", () => {
    const { rerender } = render(<LanguageSwitcher />);

    const select = screen.getByRole("combobox");
    expect(screen.getByText("اللغة")).toBeInTheDocument();
    expect(select).toHaveValue("ar");

    fireEvent.change(select, { target: { value: "en" } });

    expect(replaceMock).toHaveBeenCalledWith("/portfolio", { locale: "en" });

    mockState.locale = "en";
    mockState.dir = "ltr";

    rerender(<LanguageSwitcher />);

    expect(screen.getByText("Language")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("en");
  });
});
