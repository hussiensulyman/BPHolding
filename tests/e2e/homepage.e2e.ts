import { expect, test } from "@playwright/test";

test("homepage renders bilingual toggle", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("language-switcher")).toBeVisible();
});

test("language toggle switches locale and direction", async ({ page }) => {
  await page.goto("/ar");

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("نبني المستقبل");

  await page.getByTestId("language-switcher").selectOption("en");

  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "We Build the Future",
  );
});

test("portfolio page loads sample projects from seed data", async ({ page }) => {
  await page.goto("/ar/portfolio");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("استوديو المشاريع");
  await expect(page.getByTestId("portfolio-project-item")).toHaveCount(7);
});
