/**
 * Rules regression — emulator tier (partial Firestore integration).
 *
 * Real room → session → table via Firebase emulators. Validates hand phase order and
 * absence of premature bourré UI during enrollment / draw / early play.
 *
 * NOT covered here (intentionally — slow, bot-dependent, or covered elsewhere):
 * - Full 5-trick hand ending in zero-trick bourré through Firestore
 * - Post-hand bourré settlement assignment (→ `scripts/bourre-rules.test.mjs` + fixture tier)
 * - Bourré replacement payment on next deal (→ fixture `bourre-payment` scenario)
 * - Settled bourré badge on opponents (product renders badge for `isSelf` only)
 *
 * See `e2e/README.md` § Bourré coverage pyramid.
 */
import { test, expect } from "@playwright/test";
import {
  driveTableToPlay,
  emulatorReady,
  expectHandPhase,
  getHandPhase,
  goToTable,
  setupRoomWithBots,
  tryHandEnrollmentActions,
  waitForDrawPhase,
} from "./helpers/roomFlow";
import { expectNoBourreMarkers, expectPhaseTag } from "./helpers/rulesRegression";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

function tableOverlay(page: import("@playwright/test").Page) {
  return page.locator("#table-play-overlay");
}

test.describe("Rules regression — emulator (partial integration)", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(300_000);

  test.beforeEach(async () => {
    await fetch(
      "http://127.0.0.1:9099/emulator/v1/projects/demo-national-bourre-league/accounts",
      { method: "DELETE" },
    ).catch(() => {});
    await fetch(
      "http://127.0.0.1:8088/emulator/v1/projects/demo-national-bourre-league/databases/(default)/documents",
      { method: "DELETE" },
    ).catch(() => {});
  });

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test("[emulator] 2p: no premature bourré UI through enrollment into draw", async ({ page }) => {
    await setupRoomWithBots(page, 2);
    await goToTable(page);

    const overlay = tableOverlay(page);
    await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });

    const deadline = Date.now() + 90_000;
    const lastActionClick = { at: 0 };
    while (Date.now() < deadline) {
      await expectNoBourreMarkers(page);
      await expect(overlay.getByTestId("bourre-result-sting")).toHaveCount(0);

      if ((await getHandPhase(overlay)) === "draw") break;

      await tryHandEnrollmentActions(page, overlay, lastActionClick);
      await page.waitForTimeout(500);
    }

    await waitForDrawPhase(page);
    await expectNoBourreMarkers(page);
    await expect(overlay.getByTestId("hero-hand")).toBeVisible();
    await expect(overlay.getByTestId("hero-hand")).not.toContainText(/bourr/i);
  });

  test("[emulator] 2p: phase order draw → trick play (no premature bourré)", async ({ page }) => {
    await setupRoomWithBots(page, 2);
    await goToTable(page);
    await waitForDrawPhase(page);

    const overlay = tableOverlay(page);
    await expectPhaseTag(page, /draw/i);
    await expect(overlay.getByTestId("draw-button").or(overlay.getByTestId("pass-draw-button")).first()).toBeVisible();

    await driveTableToPlay(page);
    await expectHandPhase(overlay, "play");
    await expectNoBourreMarkers(page);
  });

  test("[emulator] 2p: play phase reachable after I'm in (no dead-end draw)", async ({ page }) => {
    await setupRoomWithBots(page, 2);
    await goToTable(page);
    await waitForDrawPhase(page);

    const overlay = tableOverlay(page);
    await expect(overlay.getByTestId("draw-button").or(overlay.getByTestId("pass-draw-button")).first()).toBeVisible();
    await driveTableToPlay(page);
    await expectHandPhase(overlay, "play");
    await expect(overlay.getByTestId("hero-hand")).toBeVisible();
    await expect(overlay.locator(".btable-hero__error")).toHaveCount(0);
    await expectNoBourreMarkers(page);
  });
});
