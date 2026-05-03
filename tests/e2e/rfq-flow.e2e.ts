import { expect, test } from "@playwright/test";

test("EN RFQ flow submits and appears in mock admin dashboard", async ({ page }) => {
  await page.goto("/en/rfq");

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Request for Quotation",
  );

  await page.getByLabel("Project Location").fill("Al Olaya District");
  await page
    .getByLabel(/Project Description/)
    .fill("Integrated residential build with MEP coordination and phased handover.");

  await page.getByRole("button", { name: /^Next$/ }).click();

  await expect(page.getByRole("heading", { name: "Contact Information" })).toBeVisible();

  await page.getByLabel("Contact Name").fill("Hussien Al-Harbi");
  await page.getByLabel("Email").fill("hussien@example.com");
  await page.getByLabel("Phone (+966)").fill("+966512345678");

  await page.getByRole("button", { name: /^Next$/ }).click();

  await expect(page.getByRole("heading", { name: "Files and Review" })).toBeVisible();

  await page.getByTestId("rfq-file-input").setInputFiles({
    name: "brief.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("dummy-pdf"),
  });

  await expect(page.getByText("brief.pdf")).toBeVisible();

  try {
    await expect(page).toHaveURL(/\/en\/rfq\/success\?reference=/, {
      timeout: 2000,
    });
  } catch {
    const submitButton = page.getByRole("button", { name: "Submit RFQ" });
    await expect(submitButton).toBeEnabled({ timeout: 15000 });
    await submitButton.click();
    await expect(page).toHaveURL(/\/en\/rfq\/success\?reference=/, {
      timeout: 15000,
    });
  }

  const reference =
    (await page.locator("text=/RFQ-\\d{4}-\\d{5}/").first().textContent()) ?? "";
  expect(reference).toMatch(/RFQ-\d{4}-\d{5}/);

  await page.getByRole("link", { name: "Open Admin Dashboard (Mock)" }).click();

  await expect(page).toHaveURL(/\/en\/admin\/rfq\?mockRef=/);
  await expect(page.getByTestId("mock-admin-reference")).toHaveText(reference);
});

test("Arabic RFQ flow keeps RTL and validates Saudi phone format", async ({ page }) => {
  await page.goto("/ar/rfq");

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("طلب عرض سعر");

  await page.getByLabel("موقع المشروع").fill("الرياض");
  await page
    .getByLabel(/وصف المشروع/)
    .fill("مشروع تطوير متكامل مع أنظمة كهروميكانيكية وتسليم مرحلي.");

  await page.getByRole("button", { name: "التالي" }).click();

  await expect(page.getByRole("heading", { name: "بيانات التواصل" })).toBeVisible();

  await page.getByLabel("اسم جهة التواصل").fill("أحمد الشهري");
  await page.getByLabel("البريد الإلكتروني").fill("ahmed@example.com");
  await page.getByLabel("رقم الجوال (+966)").fill("0501234567");

  await page.getByRole("button", { name: "التالي" }).click();
  await expect(
    page.getByText("يجب أن يكون رقم الجوال سعوديا صحيحا بصيغة +966."),
  ).toBeVisible();

  await page.getByLabel("رقم الجوال (+966)").fill("+966512345678");
  await page.getByRole("button", { name: "التالي" }).click();

  await expect(page.getByRole("heading", { name: "الملفات والمراجعة" })).toBeVisible();
});
