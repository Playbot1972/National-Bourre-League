import { test, expect } from "@playwright/test";

test.describe("Social UI buttons", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
  });

  test("auth entry buttons open and close the sign-in modal", async ({ page }) => {
    const modal = page.locator("#auth-modal");
    await expect(modal).toBeHidden();

    await page.locator("#open-signin").click();
    await expect(modal).toBeVisible();
    await expect(page.locator("#auth-title")).toHaveText(/sign in/i);

    await page.locator("#close-auth").click();
    await expect(modal).toBeHidden();
  });

  test("hero and header auth buttons switch modal mode", async ({ page }) => {
    await page.locator("#hero-signup").click();
    await expect(page.locator("#auth-modal")).toBeVisible();
    await expect(page.locator("#auth-title")).toHaveText(/create account/i);

    await page.locator("#tab-signin").click();
    await expect(page.locator("#auth-title")).toHaveText(/sign in/i);

    await page.locator("#tab-signup").click();
    await expect(page.locator("#auth-title")).toHaveText(/create account/i);
  });

  test("theme toggle updates pressed state", async ({ page }) => {
    const toggle = page.locator("#theme-toggle");
    const before = await toggle.getAttribute("aria-pressed");
    await toggle.click();
    const after = await toggle.getAttribute("aria-pressed");
    expect(after).not.toBe(before);
  });

  test("primary navigation switches views", async ({ page }) => {
    await page.getByRole("link", { name: "Rules", exact: true }).click();
    await expect(page.locator("#view-rules")).toBeVisible();
    await expect(page.locator("#view-home")).toBeHidden();

    await page.getByRole("link", { name: "Home", exact: true }).click();
    await expect(page.locator("#view-home")).toBeVisible();
  });

  test("protected nav opens sign-in when logged out", async ({ page }) => {
    await page.getByRole("link", { name: "Private Rooms", exact: true }).click();
    await expect(page.locator("#auth-modal")).toBeVisible();
    await expect(page.locator("#view-home")).toBeVisible();

    await page.locator("#close-auth").click();
    await page.getByRole("link", { name: "Leagues", exact: true }).click();
    await expect(page.locator("#auth-modal")).toBeVisible();
  });

  test("forgot password link switches auth modal to reset mode", async ({ page }) => {
    await page.locator("#open-signin").click();
    await page.locator("#forgot-password").click();
    await expect(page.locator("#auth-title")).toHaveText(/reset password/i);
    await expect(page.locator("#reset-confirm-password")).toBeVisible();
  });
});
