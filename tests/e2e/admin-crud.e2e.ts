import { expect, test } from "@playwright/test";

test("admin CRUD flow and RTL language switch", async ({ page }, testInfo) => {
  const suffix = `${Date.now()}-${testInfo.project.name.replace(/[^a-z0-9]/gi, "-")}`;
  const projectSlug = `e2e-admin-project-${suffix}`;
  const projectTitleEn = `E2E Admin Project ${suffix}`;

  await page.goto("/en/admin/login");

  await page.getByLabel("Email").fill("admin@bpholding.net");
  await page.getByLabel("Password").fill("Admin@12345");
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(/\/en\/admin$/);
  await expect(page.getByText("Admin Dashboard")).toBeVisible();

  await page.goto("/en/admin/projects");
  await page.getByPlaceholder("slug").fill(projectSlug);
  await page.getByPlaceholder("Title (EN)").fill(projectTitleEn);
  await page.getByPlaceholder("Title (AR)").fill("مشروع إداري تجريبي");
  await page
    .getByPlaceholder("Description (EN)")
    .fill("This project is created by Playwright for admin CRUD validation.");
  await page
    .getByPlaceholder("Description (AR)")
    .fill("تم إنشاء هذا المشروع عبر اختبارات Playwright للتحقق من CRUD.");
  await page.getByPlaceholder("Location").fill("Olaya District");
  await page.getByPlaceholder("City").fill("Riyadh");
  await page.getByPlaceholder("Year").fill("2026");
  await page.locator("form select").selectOption("PUBLISHED");

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/admin/projects") &&
        response.request().method() === "POST" &&
        response.ok(),
    ),
    page.locator("form").evaluate((formElement) => {
      (formElement as HTMLFormElement).requestSubmit();
    }),
  ]);

  await expect(page.getByText(projectTitleEn)).toBeVisible();

  await page.goto("/en/portfolio");
  await expect(page.getByText(projectTitleEn)).toBeVisible();

  await page.goto("/en/admin/submissions");
  const firstDetails = page.getByRole("button", { name: "Details" }).first();
  await firstDetails.click();
  await page.getByRole("button", { name: "Mark Contacted" }).click();
  await expect(page.locator("tbody tr").first()).toContainText("CONTACTED");

  await page.goto("/en/admin/certifications");
  const certificationsForm = page.locator("form").first();
  await certificationsForm.getByPlaceholder("Title (EN)").fill("E2E VAT Certificate");
  await certificationsForm
    .getByPlaceholder("Title (AR)")
    .fill("شهادة ضريبة القيمة المضافة");
  await certificationsForm.locator("select").first().selectOption("VAT");
  await certificationsForm.locator("input[type='date']").nth(0).fill("2026-01-01");
  await certificationsForm.locator("input[type='date']").nth(1).fill("2026-01-15");

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes("/api/admin/certifications") &&
        response.request().method() === "POST" &&
        response.ok(),
    ),
    certificationsForm.evaluate((formElement) => {
      (formElement as HTMLFormElement).requestSubmit();
    }),
  ]);

  await expect(page.getByText("Expiring Soon").first()).toBeVisible();

  await page.goto("/ar/admin");
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByText("لوحة التحكم")).toBeVisible();
});
