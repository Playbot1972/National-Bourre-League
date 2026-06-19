import { test, expect } from "@playwright/test";

test.describe("Social app smoke", () => {
  test("loads social home and shows app version", async ({ page }) => {
    await page.goto("/");
    const version = page.locator("#app-version");
    await expect(version).toBeVisible({ timeout: 15_000 });
    await expect(version).toContainText(/^v\d+\.\d{2}\.\d{2}(\+[0-9a-f]+)?$/);
  });

  test("shows sign-in entry when logged out", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /sign in|log in|google/i }).first()).toBeVisible({
      timeout: 15_000,
    });
  });
});
