import { test, expect } from "@playwright/test";
import { createRoom, emulatorReady, openNewSession, signUpHost } from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Room buy-in and session ante dropdowns", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    await signUpHost(page);
    await createRoom(page);
  });

  test("room buy-in input keeps selected value after change", async ({ page }) => {
    const roomBuyIn = page.locator("#room-buy-in-amount");
    await expect(roomBuyIn).toBeVisible();
    await expect(roomBuyIn).toHaveValue("100");
    await roomBuyIn.fill("5");
    await expect(roomBuyIn).toHaveValue("5");
    await page.waitForTimeout(400);
    await expect(roomBuyIn).toHaveValue("5");
    await expect(page.locator("#new-session-stake")).toBeVisible();
    await expect(page.locator("#new-session-stake")).not.toHaveValue("5");
  });

  test("bourré settings and regional tables ante controls mirror sub-dollar values", async ({ page }) => {
    const bourreAnte = page.locator("#room-ante-amount");
    const regionalAnte = page.locator("#new-session-stake");
    await expect(bourreAnte).toBeVisible();
    await expect(regionalAnte).toBeVisible();

    await bourreAnte.selectOption("0.25");
    await page.waitForTimeout(400);
    await expect(bourreAnte).toHaveValue("0.25");
    await expect(regionalAnte).toHaveValue("0.25");

    await regionalAnte.selectOption("0.01");
    await page.waitForTimeout(400);
    await expect(regionalAnte).toHaveValue("0.01");
    await expect(bourreAnte).toHaveValue("0.01");

    await regionalAnte.selectOption("1");
    await page.waitForTimeout(400);
    await expect(regionalAnte).toHaveValue("1");
    await expect(bourreAnte).toHaveValue("1");
  });

  test("new session ante dropdown keeps selected value after change", async ({ page }) => {
    const sessionAnte = page.locator("#new-session-stake");
    await expect(sessionAnte).toBeVisible();
    await sessionAnte.selectOption("10");
    await expect(sessionAnte).toHaveValue("10");
    await page.waitForTimeout(400);
    await expect(sessionAnte).toHaveValue("10");
    await expect(page.locator("#room-buy-in-amount")).not.toHaveValue("10");
  });

  test("+ New session opens a regional tab after confirm", async ({ page }) => {
    await page.waitForTimeout(300);
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#new-session").click({ force: true });
    await expect(page.locator(".session-tab")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator(".session-tab").first()).toContainText(/hand/i);
    await expect(page.getByTestId("session-setup-window")).toBeVisible();
    await expect(page.getByTestId("add-player-robot")).toBeVisible();
  });

  test("add robot form is in session panel while waiting for players", async ({ page }) => {
    await page.waitForTimeout(300);
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#new-session").click({ force: true });
    await expect(page.getByTestId("session-setup-window")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("add-player-robot")).toBeVisible();
    await page.getByTestId("add-player-robot").check();
    await page.getByTestId("session-add-player-pill").click();
    await expect(page.locator(".members__role").filter({ hasText: "robot" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
