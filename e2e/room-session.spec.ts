import { test, expect } from "@playwright/test";
import { createRoom, emulatorReady, openNewSession, signUpHost } from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Room ante dropdown and + New session", () => {
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

  test("room ante dropdown keeps selected value after change", async ({ page }) => {
    const roomAnte = page.locator("#room-ante-amount");
    await expect(roomAnte).toBeVisible();
    await roomAnte.selectOption("5");
    await expect(roomAnte).toHaveValue("5");
    await page.waitForTimeout(400);
    await expect(roomAnte).toHaveValue("5");
  });

  test("new session ante dropdown keeps selected value after change", async ({ page }) => {
    const sessionAnte = page.locator("#new-session-stake");
    await expect(sessionAnte).toBeVisible();
    await sessionAnte.selectOption("10");
    await expect(sessionAnte).toHaveValue("10");
    await page.waitForTimeout(400);
    await expect(sessionAnte).toHaveValue("10");
  });

  test("+ New session opens a regional tab after confirm", async ({ page }) => {
    await page.waitForTimeout(300);
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#new-session").click({ force: true });
    await expect(page.locator(".session-tab")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator(".session-tab").first()).toContainText(/hand/i);
    await expect(page.getByTestId("session-add-players")).toBeVisible();
    await expect(page.getByTestId("add-player-robot")).toBeVisible();
  });

  test("add robot form is in session panel while waiting for players", async ({ page }) => {
    await page.waitForTimeout(300);
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#new-session").click({ force: true });
    await expect(page.getByTestId("session-add-players")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("add-player-robot")).toBeVisible();
    await page.getByTestId("add-player-robot").check();
    await page.getByTestId("add-player-submit").click();
    await expect(page.locator(".members__role").filter({ hasText: "robot" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
