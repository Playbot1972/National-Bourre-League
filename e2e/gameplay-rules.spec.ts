import { test, expect } from "@playwright/test";
import {
  emulatorReady,
  expectOpeningLeadNotDealer,
  goToTable,
  setupRoomWithBots,
  waitForDrawPhase,
} from "./helpers/roomFlow";
import { openTableFlowsFixture } from "./helpers/tableFlows";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Gameplay rules — fixture (trick 1 opening lead)", () => {
  test("dealer does not hold the opening lead on trick 1", async ({ page }) => {
    await openTableFlowsFixture(page, { scenario: "opening-lead", phase: "play" });
    await expectOpeningLeadNotDealer(page);

    const table = page.locator("#table-root");
    await expect(table.locator(".btable-session__phase-tag")).toContainText(/trick play/i);
  });
});

test.describe("Gameplay rules — emulator live hand", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(120_000);

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test("live hand reaches draw phase with dealt hero cards (2 players)", async ({ page }) => {
    await setupRoomWithBots(page, 2);
    await goToTable(page);
    await waitForDrawPhase(page);

    const overlay = page.locator("#table-play-overlay");
    await expect(overlay.getByTestId("hero-hand")).toBeVisible({ timeout: 15_000 });
    await expect(overlay.locator(".btable-session__phase-tag")).toContainText(/draw/i);
    await expect(overlay.getByTestId("draw-button").first()).toBeVisible();
  });
});
