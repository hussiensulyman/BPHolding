import { expect, test } from "@playwright/test";

test("homepage renders bilingual toggle", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByTestId("language-toggle")).toBeVisible();
});