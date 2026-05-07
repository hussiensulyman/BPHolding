import { expect, test } from "@playwright/test";

test("portfolio flow supports filtering, detail navigation, RFQ prefill, and Arabic RTL", async ({
  page,
}) => {
  await page.goto("/en/portfolio");

  await expect(page.getByRole("heading", { level: 1 })).toContainText("Portfolio Studio");
  await expect(page.getByText("Al-Fursan Residential Compound - Riyadh")).toBeVisible();
  await expect(page.getByText("Al-Malqa Mixed-Use Development - Riyadh")).toBeVisible();

  await page.getByRole("button", { name: "Residential" }).click();

  await expect(page.getByText("Al-Fursan Residential Compound - Riyadh")).toBeVisible();
  await expect(page.getByText("Al-Arid Residential Expansion - Riyadh")).toBeVisible();

  const fursanCard = page
    .getByTestId("portfolio-project-item")
    .filter({ hasText: "Al-Fursan Residential Compound - Riyadh" })
    .first();

  await fursanCard.getByRole("link", { name: "View Project" }).click();
  await page.waitForURL(/\/en\/portfolio\/al-fursan-residential-compound-riyadh$/, {
    timeout: 15_000,
  });

  await expect(page).toHaveURL(/\/en\/portfolio\/al-fursan-residential-compound-riyadh$/);
  await expect(
    page
      .getByText(
        "Integrated residential delivery including civil works, MEP systems, and high-end interior finishing for villa clusters in Al-Fursan district.",
      )
      .first(),
  ).toBeVisible();
  await expect(
    page.getByText(
      "تسليم سكني متكامل يشمل الأعمال المدنية، أنظمة الميكانيكا والكهرباء والسباكة، وتشطيبات داخلية راقية لمجمعات الفلل في حي الفرسان.",
    ),
  ).toBeVisible();

  await page.getByRole("link", { name: "Request Similar Project" }).click();
  await page.waitForURL(/\/en\/rfq\?category=RESIDENTIAL$/, { timeout: 15_000 });

  await expect(page).toHaveURL(/\/en\/rfq\?category=RESIDENTIAL$/);
  await expect(
    page.getByText("Project category was prefilled from the selected portfolio project."),
  ).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Project Type" })).toHaveValue(
    "Residential",
  );

  await page.goto("/ar/portfolio");

  await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("استوديو المشاريع");
  await expect(page.getByText("مجمع الفرسان السكني - الرياض")).toBeVisible();
});
