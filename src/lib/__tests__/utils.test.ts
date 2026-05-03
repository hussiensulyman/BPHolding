import { describe, expect, it } from "vitest";

import { APP_CONFIG } from "@/lib/config/app-config";
import { getLocaleDirection, isSupportedLocale } from "@/lib/utils/locale";

describe("locale utilities", () => {
  it("returns rtl for Arabic locale", () => {
    expect(getLocaleDirection("ar")).toBe("rtl");
  });

  it("returns ltr for English locale", () => {
    expect(getLocaleDirection("en")).toBe("ltr");
  });

  it("falls back to default locale direction for unsupported locale", () => {
    expect(getLocaleDirection("fr")).toBe(
      getLocaleDirection(APP_CONFIG.defaultLocale),
    );
  });

  it("checks supported locale guard", () => {
    expect(isSupportedLocale("ar")).toBe(true);
    expect(isSupportedLocale("en")).toBe(true);
    expect(isSupportedLocale("fr")).toBe(false);
  });
});