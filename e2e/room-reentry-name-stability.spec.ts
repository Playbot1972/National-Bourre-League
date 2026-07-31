/**
 * Re-entering a room after Play Now should not flash host name or jitter the page.
 */
import { test, expect } from "@playwright/test";
import { emulatorReady, ensureTableOverlayClosed, goToPrivateRooms, signUpHost } from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Room re-entry name stability", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(180_000);

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test("host name stays stable after leaving and re-opening the room", async ({ page }) => {
    const displayLabel = "player1000";
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });

    await page.locator("#hero-signup").click();
    await expect(page.locator("#auth-modal")).toBeVisible();
    await page.locator("#auth-name").fill(displayLabel);
    const email = `reentry-${Date.now()}@example.com`;
    await page.locator("#auth-email").fill(email);
    await page.locator("#auth-password").fill("test-pass-123456");
    await page.locator("#auth-submit").click();
    await expect(page.locator("#auth-modal")).toBeHidden({ timeout: 15_000 });

    await goToPrivateRooms(page);
    await page.locator('[data-testid="play-now-mode"] input[value="mixed"]').check();
    const playNow = page.locator('[data-testid="play-now"]');
    await expect(playNow).toBeEnabled({ timeout: 15_000 });
    await playNow.click();

    const overlay = page.locator("#table-play-overlay");
    await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 90_000 });

    await ensureTableOverlayClosed(page);
    await goToPrivateRooms(page);

    const roomCard = page.locator("[data-open-room]").first();
    await expect(roomCard).toBeVisible({ timeout: 15_000 });
    await roomCard.click();

    await expect(page.getByTestId("session-setup-window")).toBeVisible({ timeout: 15_000 });
    const rosterName = page
      .locator('[data-testid="setup-roster-entry"] .game-setup-roster__name')
      .first();
    await expect(rosterName).toContainText(displayLabel, { timeout: 15_000 });

    for (let i = 0; i < 8; i += 1) {
      await page.waitForTimeout(350);
      await expect(rosterName).toContainText(displayLabel);
      await expect(rosterName).not.toHaveText("Player");
    }
  });
});
