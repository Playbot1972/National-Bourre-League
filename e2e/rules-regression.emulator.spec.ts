import { test, expect } from "@playwright/test";
import {
  advanceThroughDrawPhase,
  emulatorReady,
  goToTable,
  setupRoomWithBots,
  tryHandEnrollmentActions,
  waitForDrawPhase,
  waitForPlayPhase,
} from "./helpers/roomFlow";
import { expectNoBourreMarkers, expectPhaseTag } from "./helpers/rulesRegression";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

function tableOverlay(page: import("@playwright/test").Page) {
  return page.locator("#table-play-overlay");
}

test.describe("Rules regression — emulator live hand", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(180_000);

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test("1 human + 1 robot: no premature bourré before draw completes", async ({ page }) => {
    await setupRoomWithBots(page, 2);
    await goToTable(page);

    const overlay = tableOverlay(page);
    await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });

    const deadline = Date.now() + 90_000;
    const lastActionClick = { at: 0 };
    while (Date.now() < deadline) {
      await expectNoBourreMarkers(page);
      await expect(overlay.getByTestId("bourre-result-sting")).toHaveCount(0);

      const phaseText =
        (await overlay.getByTestId("phase-tag").textContent().catch(() => "")) ?? "";
      if (/draw round/i.test(phaseText)) break;

      await tryHandEnrollmentActions(page, overlay, lastActionClick);
      await page.waitForTimeout(500);
    }

    await waitForDrawPhase(page);
    await expectNoBourreMarkers(page);
    await expect(overlay.getByTestId("hero-hand")).toBeVisible();
    await expect(overlay.getByTestId("hero-hand")).not.toContainText(/bourr/i);
  });

  test("2 players: phase order reaches draw then trick play", async ({ page }) => {
    await setupRoomWithBots(page, 2);
    await goToTable(page);
    await waitForDrawPhase(page);

    const overlay = tableOverlay(page);
    await expectPhaseTag(page, /draw/i);
    await expect(overlay.getByTestId("draw-button").or(overlay.getByTestId("pass-draw-button"))).toBeVisible();

    await advanceThroughDrawPhase(page);
    await expect(overlay.getByTestId("phase-tag")).toContainText(/trick play/i, { timeout: 30_000 });
    await expectNoBourreMarkers(page);
  });

  test("2 players: valid hand play does not dead-end after I'm in", async ({ page }) => {
    await setupRoomWithBots(page, 2);
    await goToTable(page);
    await waitForPlayPhase(page);

    const overlay = tableOverlay(page);
    await expect(overlay.getByTestId("phase-tag")).toContainText(/trick play/i);
    await expect(overlay.getByTestId("hero-hand")).toBeVisible();
    await expect(overlay.locator(".btable-hero__error")).toHaveCount(0);
    await expectNoBourreMarkers(page);
  });
});
