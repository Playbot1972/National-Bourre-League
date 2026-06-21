import { test, expect } from "@playwright/test";
import {
  emulatorReady,
  goToTable,
  setupRoomWithBots,
  waitForDrawPhase,
} from "./helpers/roomFlow";
import {
  expectOverlayStageFillsViewport,
  expectTableScaleAffectsStage,
} from "./helpers/overlayLayout";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

const PLAYER_COUNTS = [2, 3, 4, 5, 6, 7, 8] as const;

test.describe("Go to Table — bot flow (2–8 players)", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(90_000);

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  for (const totalPlayers of PLAYER_COUNTS) {
    test(`${totalPlayers} players: add bots, Go to Table, table mounts`, async ({ page }) => {
      await setupRoomWithBots(page, totalPlayers);
      await goToTable(page);

      const overlay = page.locator("#table-play-overlay");
      await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });
      await expect(overlay.locator(".bseat")).toHaveCount(totalPlayers, { timeout: 30_000 });
    });
  }

  test("2 players: enrollment completes to draw phase", async ({ page }) => {
    test.setTimeout(120_000);
    await setupRoomWithBots(page, 2);
    await goToTable(page);
    await waitForDrawPhase(page);

    const overlay = page.locator("#table-play-overlay");
    await expect(overlay.getByTestId("hero-hand")).toBeVisible({ timeout: 15_000 });
    await expect(overlay.locator(".btable-session__phase-tag")).toContainText(/draw/i);
    await expect(overlay.getByTestId("hero-hand")).not.toContainText("Loading your cards", {
      timeout: 30_000,
    });
  });
});

test.describe("Go to Table — room buttons smoke", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(90_000);

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test("table overlay opens and returns to session panel", async ({ page }) => {
    await setupRoomWithBots(page, 2);
    await goToTable(page);

    const overlay = page.locator("#table-play-overlay");
    await expect(overlay.getByTestId("table-root")).toBeVisible();

    await overlay.locator("#close-table-play").click();
    await expect(overlay).toBeHidden();

    await expect(page.getByTestId("open-table-play").first()).toBeVisible();
    await expect(page.getByTestId("session-add-players")).toBeVisible();
  });

  test("overlay stage fills viewport and table scale changes size", async ({ page }) => {
    await setupRoomWithBots(page, 4);
    await goToTable(page);

    const overlay = page.locator("#table-play-overlay");
    await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });
    await expect(overlay.getByTestId("table-felt")).toBeVisible();

    await expectOverlayStageFillsViewport(page, { minWidthRatio: 0.3 });
    await expectTableScaleAffectsStage(page);
  });
});
