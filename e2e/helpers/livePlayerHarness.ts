import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import {
  createRoom,
  driveTableToPlay,
  emulatorReady,
  ensureTableOverlayClosed,
  goToPrivateRooms,
  goToTable,
  joinRoomWithCode,
  openNewSession,
  readRoomInviteCode,
  signUpHost,
  signUpGuest,
  waitForDrawPhase,
} from "./roomFlow";

export { emulatorReady };

const AUTH_CLEAR_URL =
  "http://127.0.0.1:9099/emulator/v1/projects/demo-national-bourre-league/accounts";
const FIRESTORE_CLEAR_URL =
  "http://127.0.0.1:8088/emulator/v1/projects/demo-national-bourre-league/databases/(default)/documents";

/** Wipe emulator Auth + Firestore between multi-user scenarios. */
export async function clearEmulatorData() {
  await fetch(AUTH_CLEAR_URL, { method: "DELETE" }).catch(() => {});
  await fetch(FIRESTORE_CLEAR_URL, { method: "DELETE" }).catch(() => {});
  await new Promise((r) => setTimeout(r, 400));
}

export type PlayerContext = {
  context: BrowserContext;
  page: Page;
  label: string;
};

/** Isolated browser context with a fresh signed-up user. */
export async function createPlayerContext(
  browser: Browser,
  label: string,
): Promise<PlayerContext> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("/");
  await expect(page.locator("#hero-signup")).toBeVisible({ timeout: 30_000 });
  if (/host/i.test(label)) {
    await signUpHost(page, label);
  } else {
    await signUpGuest(page, label);
  }
  return { context, page, label };
}

export async function closePlayerContext(player: PlayerContext) {
  await player.context.close();
}

function tableOverlay(page: Page) {
  return page.locator("#table-play-overlay");
}

/** Session setup roster rows (seated players on the score sheet). */
export async function waitForSetupRosterCount(page: Page, count: number) {
  await expect(page.getByTestId("setup-roster-entry")).toHaveCount(count, { timeout: 45_000 });
}

/** True when an in-progress session tab/roster is showing (not just the idle setup shell). */
async function hasActiveSessionUi(page: Page): Promise<boolean> {
  if (await page.getByTestId("game-setup-roster").isVisible().catch(() => false)) return true;
  if (await page.getByTestId("open-table-play").isVisible().catch(() => false)) return true;
  return (await page.locator(".session-tab").count()) > 0;
}

/** Open the first session tab or create one when no active session is visible. */
export async function ensureSessionOpen(page: Page) {
  if (await hasActiveSessionUi(page)) return;

  const tabs = page.locator(".session-tab");
  const tabCount = await tabs.count();
  if (tabCount > 0) {
    await tabs.first().click();
    await expect(page.getByTestId("game-setup-roster").or(page.getByTestId("open-table-play"))).toBeVisible({
      timeout: 15_000,
    });
    return;
  }

  const openBtn = page.getByTestId("open-table-btn");
  if (await openBtn.isVisible().catch(() => false)) {
    page.once("dialog", (dialog) => dialog.accept());
    await openBtn.click({ force: true });
    await expect(page.locator(".session-tab")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.getByTestId("game-setup-roster").or(page.getByTestId("open-table-play"))).toBeVisible({
      timeout: 15_000,
    });
    return;
  }

  await openNewSession(page);
}

/** Host flow: private room + open session tab (matches setupRoomWithBots). */
export async function hostPrivateSession(page: Page, roomName = "Live Player E2E Room") {
  await createRoom(page, roomName);
  await openNewSession(page);
}

/** Guest flow: join an existing private room by invite code and open the active session. */
export async function guestJoinPrivateRoom(page: Page, inviteCode: string) {
  await joinRoomWithCode(page, inviteCode);
  await expect(page.locator(".room-detail__title")).toContainText(/.+/, { timeout: 20_000 });
  await ensureTableOverlayClosed(page);
  const tabs = page.locator(".session-tab");
  if ((await tabs.count()) > 0) {
    await tabs.first().click();
  }
  await expect(tabs.first()).toBeAttached({ timeout: 30_000 });
}

/** Re-open the room detail view so membership snapshots refresh on the host. */
export async function refreshHostRoomDetail(page: Page, roomName: string) {
  await ensureTableOverlayClosed(page);
  const back = page.locator("#back-to-rooms");
  if (await back.isVisible().catch(() => false)) {
    await back.click();
    await page.locator(".mini-card__title").filter({ hasText: roomName }).click();
    await expect(page.locator(".room-detail__title")).toContainText(roomName, { timeout: 15_000 });
  }
}

/** Guest joins; host sees the guest in members and Play enables for both. */
export async function syncPrivateRoomPair(
  hostPage: Page,
  guestPage: Page,
  inviteCode: string,
  roomName: string,
  guestLabel: string,
) {
  await guestJoinPrivateRoom(guestPage, inviteCode);
  await waitForRoomMember(guestPage, guestLabel);
  await refreshHostRoomDetail(hostPage, roomName);
  await waitForRoomMember(hostPage, guestLabel);
  await waitForPlayEnabled(hostPage);
  await waitForPlayEnabled(guestPage);
}

/** Host adds one robot to the open session roster. */
export async function hostAddOneRobot(page: Page) {
  await page.getByTestId("add-player-robot").check();
  await page.getByTestId("session-add-player-pill").click();
  await expect(page.locator(".game-setup-roster__role").filter({ hasText: "robot" })).toHaveCount(1, {
    timeout: 15_000,
  });
}

/** Wait until a display name appears in the room members panel (Firestore membership sync). */
export async function waitForRoomMember(page: Page, displayName: string) {
  await expect
    .poll(async () => page.locator(".members__name").filter({ hasText: displayName }).count(), {
      timeout: 60_000,
    })
    .toBeGreaterThanOrEqual(1);
}

/** Both players need Play enabled (≥2 roster entries) before opening the table. */
export async function waitForPlayEnabled(page: Page) {
  const playBtn = page.getByTestId("open-table-play").or(page.getByTestId("open-table-play-inline"));
  await expect(playBtn.first()).toBeEnabled({ timeout: 60_000 });
}

export async function openTableFromSetup(page: Page) {
  await waitForPlayEnabled(page);
  await goToTable(page);
  const overlay = tableOverlay(page);
  if (!(await overlay.isVisible().catch(() => false))) {
    const goBtn = page.getByTestId("open-table-play").or(page.getByTestId("open-table-play-inline")).first();
    await goBtn.evaluate((el) => (el as HTMLButtonElement).click());
  }
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });
}

export type PlayNowMode = "mixed" | "bots_only";

export async function selectPlayNowMode(page: Page, mode: PlayNowMode) {
  await goToPrivateRooms(page);
  const value = mode === "bots_only" ? "bots_only" : "mixed";
  await page.locator(`input[name="play-now-mode"][value="${value}"]`).check();
}

export async function clickPlayNow(page: Page) {
  await goToPrivateRooms(page);
  const btn = page.getByTestId("play-now");
  await expect(btn).toBeEnabled({ timeout: 15_000 });
  await btn.click();
  await expect(tableOverlay(page).getByTestId("table-root")).toBeVisible({ timeout: 120_000 });
}

export async function expectWatchOnlyTable(page: Page) {
  const overlay = tableOverlay(page);
  await expect(overlay.getByTestId("watch-only-banner")).toBeVisible({ timeout: 30_000 });
  await expect(overlay.getByTestId("watch-only-banner")).toContainText(/watching this hand/i);
}

export async function expectSeatedTable(page: Page) {
  const overlay = tableOverlay(page);
  await expect(overlay.getByTestId("watch-only-banner")).toHaveCount(0);
}

/** Spectators and idle sit-out players must not see hero enrollment / draw / turn urgency. */
export async function expectNoHeroTurnUrgency(page: Page) {
  const overlay = tableOverlay(page);
  await expect(overlay.getByTestId("seat-opt-in")).toHaveCount(0);
  await expect(overlay.getByTestId("draw-button")).toHaveCount(0);
  await expect(overlay.getByTestId("pass-draw-button")).toHaveCount(0);
  const heroCountdown = overlay.getByTestId("seat-bottom-self").getByTestId("turn-countdown-ring");
  await expect(heroCountdown).toHaveCount(0);
}

export async function nudgeBots(page: Page) {
  await page.evaluate(() => window.__nblE2E?.nudgeBots?.()).catch(() => {});
}

/** Poll phase until leaving reveal (for public tables with bot fill). */
export async function waitPastRevealPhase(page: Page, timeoutMs = 90_000) {
  const overlay = tableOverlay(page);
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const header =
      (await overlay.getByTestId("phase-tag").first().getAttribute("data-phase").catch(() => "")) ??
      "";
    const center =
      (await overlay.getByTestId("phase-tag-center").getAttribute("data-phase").catch(() => "")) ??
      "";
    if (header !== "reveal" && center !== "reveal") return;
    await nudgeBots(page);
    await page.waitForTimeout(800);
  }
  throw new Error("Table stayed in reveal phase too long");
}

export {
  readRoomInviteCode,
  waitForDrawPhase,
  driveTableToPlay,
  goToTable,
};
