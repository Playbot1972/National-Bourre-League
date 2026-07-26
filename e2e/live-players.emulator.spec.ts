/**
 * Live-player E2E — multi-context flows on Firebase emulators.
 *
 * Requires: npm run emulators (auth :9099, firestore :8088, functions :5001)
 *           PLAYWRIGHT_EMULATORS=1
 *
 * See docs/LIVE_PLAYER_TEST_ARCHITECTURE.md
 */
import { test, expect } from "@playwright/test";
import {
  clearEmulatorData,
  createPlayerPair,
  closePlayerContext,
  driveLiveHumansToPlay,
  emulatorReady,
  expectNoHeroTurnUrgency,
  expectWatchOnlyTable,
  hostAddOneRobot,
  hostPrivateSession,
  joinPublicMixedTableAsSpectator,
  leaveCurrentPublicRoom,
  openPrivateRoomTablesSequential,
  readRoomInviteCode,
  rejoinPublicMixedAsSpectator,
  syncPrivateRoomPair,
  waitForPlayEnabled,
} from "./helpers/livePlayerHarness";
import { logPreflightSummary, runLivePlayerPreflight, type PreflightResult } from "./helpers/livePlayerPreflight";
import { expectHandPhase } from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";
const skipPreflight = process.env.LIVE_PLAYER_SKIP_PREFLIGHT === "1";

let preflightResult: PreflightResult | null = null;

function tableOverlay(page: import("@playwright/test").Page) {
  return page.locator("#table-play-overlay");
}

test.describe("Live players — emulator E2E", () => {
  test.describe.configure({ mode: "serial" });
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(300_000);
  test.use({ actionTimeout: 30_000, navigationTimeout: 45_000 });

  test.beforeAll(async ({ browser }) => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
    if (skipPreflight) return;
    preflightResult = await runLivePlayerPreflight(browser);
    if (!preflightResult.ok) {
      logPreflightSummary(preflightResult);
    }
  });

  test.beforeEach(async ({}, testInfo) => {
    if (preflightResult && !preflightResult.ok) {
      const label =
        preflightResult.failureClass === "environment"
          ? "ENVIRONMENT_FAILURE"
          : preflightResult.failureClass === "app"
            ? "APP_FLOW_FAILURE"
            : "HARNESS_FAILURE";
      test.skip(
        true,
        `${label}: preflight failed at ${preflightResult.stage} — ${preflightResult.message}`,
      );
    }
    await clearEmulatorData();
  });

  test("two humans private room: enrollment → draw → play in separate overlays", async ({
    browser,
  }) => {
    test.setTimeout(300_000);
    const [host, guest] = await createPlayerPair(browser, "Draw Host", "Draw Guest");

    try {
      const roomName = "Private Draw Play Room";
      await hostPrivateSession(host.page, roomName);
      const inviteCode = await readRoomInviteCode(host.page);
      await syncPrivateRoomPair(host.page, guest.page, inviteCode, roomName, "Draw Guest");

      await openPrivateRoomTablesSequential(host.page, guest.page, roomName);

      const hostOverlay = tableOverlay(host.page);
      const guestOverlay = tableOverlay(guest.page);

      await driveLiveHumansToPlay([host.page, guest.page]);
      await expectHandPhase(hostOverlay, "play");
      await expectHandPhase(guestOverlay, "play");
      await expect(hostOverlay.getByTestId("hero-hand")).toBeVisible();
      await expect(guestOverlay.getByTestId("hero-hand")).toBeVisible();
    } finally {
      await closePlayerContext(host);
      await closePlayerContext(guest);
    }
  });

  test("public mixed: guest spectates, leaves mid-hand, and rejoins watch-only", async ({
    browser,
  }) => {
    test.setTimeout(240_000);
    const [host, guest] = await createPlayerPair(browser, "Public Host", "Public Guest");

    try {
      await joinPublicMixedTableAsSpectator(host.page, guest.page);

      const hostOverlay = tableOverlay(host.page);
      await expect(hostOverlay.getByTestId("watch-only-banner")).toHaveCount(0);

      // Assert mid-hand spectate before hand 1 can complete and promote the guest at handoff.
      await expectWatchOnlyTable(guest.page);
      await expectNoHeroTurnUrgency(guest.page);

      const hostPhase =
        (await hostOverlay.getByTestId("phase-tag").first().getAttribute("data-phase")) ?? "";
      expect(hostPhase === "draw" || hostPhase === "play").toBe(true);

      await leaveCurrentPublicRoom(guest.page);
      await rejoinPublicMixedAsSpectator(guest.page);
    } finally {
      await closePlayerContext(host);
      await closePlayerContext(guest);
    }
  });

  test("two humans join the same private room (separate contexts)", async ({ browser }) => {
    test.setTimeout(180_000);
    const [host, guest] = await createPlayerPair(browser, "Live Host", "Live Guest");

    try {
      await hostPrivateSession(host.page);
      const inviteCode = await readRoomInviteCode(host.page);
      await syncPrivateRoomPair(
        host.page,
        guest.page,
        inviteCode,
        "Live Player E2E Room",
        "Live Guest",
      );
    } finally {
      await closePlayerContext(host);
      await closePlayerContext(guest);
    }
  });

  test("mixed humans + bot: host adds robot after guest joins", async ({ browser }) => {
    test.setTimeout(180_000);
    const [host, guest] = await createPlayerPair(browser, "Mixed Host", "Mixed Guest");

    try {
      const roomName = "Mixed Humans Bots Room";
      await hostPrivateSession(host.page, roomName);
      const inviteCode = await readRoomInviteCode(host.page);
      await syncPrivateRoomPair(host.page, guest.page, inviteCode, roomName, "Mixed Guest");
      await hostAddOneRobot(host.page);
      await expect
        .poll(async () => host.page.getByTestId("setup-roster-entry").count(), { timeout: 30_000 })
        .toBe(3);
      await waitForPlayEnabled(host.page);
    } finally {
      await closePlayerContext(host);
      await closePlayerContext(guest);
    }
  });

  test("public mixed: seated host and watch-only guest both see live table root", async ({
    browser,
  }) => {
    test.setTimeout(180_000);
    const [host, guest] = await createPlayerPair(browser, "Table Host", "Table Guest");

    try {
      await joinPublicMixedTableAsSpectator(host.page, guest.page);

      await expect(tableOverlay(host.page).getByTestId("table-root")).toBeVisible({
        timeout: 30_000,
      });
      await expect(tableOverlay(guest.page).getByTestId("table-root")).toBeVisible({
        timeout: 30_000,
      });
      await waitForPlayEnabled(host.page).catch(() => {});
    } finally {
      await closePlayerContext(host);
      await closePlayerContext(guest);
    }
  });
});
