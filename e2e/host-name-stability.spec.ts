/**
 * Host display name stays stable on the Add Guest/Robot setup screen.
 */
import { test, expect } from "@playwright/test";
import { emulatorReady, goToPrivateRooms, signUpHost } from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Host name stability on setup screen", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(120_000);

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test("roster shows auth name consistently (not Player placeholder)", async ({ page }) => {
    const displayLabel = "player1000";
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });

    await page.locator("#hero-signup").click();
    await expect(page.locator("#auth-modal")).toBeVisible();
    await page.locator("#auth-name").fill(displayLabel);
    const email = `player1000-${Date.now()}@example.com`;
    await page.locator("#auth-email").fill(email);
    await page.locator("#auth-password").fill("test-pass-123456");
    await page.locator("#auth-submit").click();
    await expect(page.locator("#auth-modal")).toBeHidden({ timeout: 15_000 });

    await goToPrivateRooms(page);

    const modal = page.locator("#create-room-modal");
    await page.locator("#create-room").click();
    await expect(modal).toBeVisible();
    await page.locator("#create-room-name").fill("Name Stability Room");
    await page.locator("#create-room-form").evaluate((form: HTMLFormElement) => form.requestSubmit());
    await page.locator("#create-room-ante").selectOption({ index: 1 });
    await page.locator("#create-room-form").evaluate((form: HTMLFormElement) => form.requestSubmit());
    await expect(modal).toBeHidden({ timeout: 15_000 });

    await expect(page.getByTestId("session-setup-window")).toBeVisible({ timeout: 15_000 });

    const rosterName = page.locator('[data-testid="setup-roster-entry"] .game-setup-roster__name').first();
    await expect(rosterName).toContainText(displayLabel, { timeout: 15_000 });

    for (let i = 0; i < 5; i += 1) {
      await page.waitForTimeout(400);
      await expect(rosterName).toContainText(displayLabel);
      await expect(rosterName).not.toContainText(/^Player$/);
    }
  });
});
