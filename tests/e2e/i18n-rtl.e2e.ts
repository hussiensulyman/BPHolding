import { expect, test } from "@playwright/test";

test("Arabic locale applies RTL direction and flips directional icon", async ({
  page,
}) => {
  await page.goto("/ar");

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");

  const transform = await page
    .getByTestId("language-switcher-icon")
    .evaluate((element) => getComputedStyle(element).transform);

  expect(transform).toContain("matrix(-1");
});

test("English locale remains LTR", async ({ page }) => {
  await page.goto("/en");

  await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
});
