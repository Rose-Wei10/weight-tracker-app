import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";
test("private tracking flows, session reload, language and dark mode", async ({
  page,
}) => {
  const historical = await page.evaluate(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 2, 15);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-15`;
  });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  mkdirSync("docs/screenshots", { recursive: true });
  await page.goto("/");
  await page.getByLabel("Email", { exact: true }).fill("preview@example.test");
  await page.getByLabel("Password", { exact: true }).fill("Preview-only-2026");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByText("A little care, every day.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("880", { exact: true })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/home.png" });
  await page.reload();
  await expect(
    page.getByText("A little care, every day.", { exact: true }),
  ).toBeVisible();
  await page.goto("/progress");
  await expect(page.getByText("Your progress", { exact: true })).toBeVisible();
  await page.getByLabel("Date · YYYY-MM-DD", { exact: true }).fill(historical);
  await page.getByLabel("Weight · kg", { exact: true }).fill("71.5");
  await page
    .getByRole("button", { name: "Save check-in", exact: true })
    .click();
  await expect(page.getByText("Weight saved.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "‹", exact: true }).click();
  await page.getByRole("button", { name: "‹", exact: true }).click();
  let row = page
    .getByText(`${historical} · 71.5 kg`, { exact: true })
    .locator("..");
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Weight · kg", { exact: true }).fill("71.7");
  await page
    .getByRole("button", { name: "Save check-in", exact: true })
    .click();
  row = page
    .getByText(`${historical} · 71.7 kg`, { exact: true })
    .locator("..");
  await row.getByRole("button", { name: "Delete entry", exact: true }).click();
  await row
    .getByRole("button", { name: "Confirm deletion", exact: true })
    .click();
  await expect(
    page.getByText(`${historical} · 71.7 kg`, { exact: true }),
  ).toHaveCount(0);
  await page.goto("/progress");
  await expect(page.getByText("100%", { exact: true })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/progress.png" });
  await page.goto("/calories");
  await expect(page.getByText("Food diary", { exact: true })).toBeVisible();
  await expect(page.getByText("880", { exact: true })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/diary.png" });
  await page
    .getByRole("button", { name: "+ Custom food", exact: true })
    .click();
  await page.getByLabel("Food or meal name", { exact: true }).fill("E2E snack");
  await page.getByLabel("Calories · kcal", { exact: true }).fill("150");
  await page.getByLabel("Protein · g", { exact: true }).fill("10");
  await page.getByLabel("Carbs · g", { exact: true }).fill("20");
  await page.getByLabel("Fat · g", { exact: true }).fill("3");
  await page
    .getByLabel("Servings · changing scales all totals", { exact: true })
    .fill("2");
  await page
    .getByRole("button", { name: "Confirm & save to diary", exact: true })
    .click();
  row = page
    .getByText("E2E snack × 2", { exact: true })
    .locator("..")
    .locator("..");
  await expect(row).toBeVisible();
  await expect(page.getByText("1180", { exact: true })).toBeVisible();
  await row.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByLabel("Calories · kcal", { exact: true }).fill("320");
  await page
    .getByRole("button", { name: "Confirm & save to diary", exact: true })
    .click();
  await expect(page.getByText("1200", { exact: true })).toBeVisible();
  row = page
    .getByText("E2E snack × 2", { exact: true })
    .locator("..")
    .locator("..");
  await row.getByRole("button", { name: "Delete food", exact: true }).click();
  await row
    .getByRole("button", { name: "Confirm deletion", exact: true })
    .click();
  await expect(page.getByText("880", { exact: true })).toBeVisible();
  await page.goto("/assistant");
  await expect(
    page.getByRole("button", { name: "Get AI support", exact: true }),
  ).toBeDisabled();
  await page.goto("/account");
  await page.getByRole("button", { name: "中文", exact: true }).click();
  await expect(page.getByText("我的健康空间", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "English", exact: true }).click();
  await expect(page.getByText("Make it yours", { exact: true })).toBeVisible();
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/home");
  await expect(page.getByText("880", { exact: true })).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/home-dark.png" });
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.screenshot({ path: "docs/screenshots/home-tablet-dark.png" });
  expect(errors).toEqual([]);
});
