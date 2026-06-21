import { test, expect } from "@playwright/test";
import {
  emulatorReady,
  expectOpeningLeadNotDealer,
  goToTable,
  setupRoomWithBots,
  waitForPlayPhase,
} from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Gameplay rules — emulator live hand", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(180_000);

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test("opening lead is left of dealer, not the dealer (2 players)", async ({ page }) => {
    await setupRoomWithBots(page, 2);
    await goToTable(page);
    await waitForPlayPhase(page);
    await expectOpeningLeadNotDealer(page);

    const overlay = page.locator("#table-play-overlay");
    await expect(overlay.locator(".btable-session__phase-tag")).toContainText(/trick play/i);
    const trickPlays = await overlay.locator(".btrick__play").count();
    expect(trickPlays, "no cards should be played yet on trick 1 opener check").toBe(0);
  });
});
