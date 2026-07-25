import { expect, type Browser, type BrowserContext, type Page } from "@playwright/test";
import {
  createRoom,
  driveTableToPlay,
  emulatorReady,
  ensureTableOverlayClosed,
  getHandPhase,
  goToPrivateRooms,
  goToTable,
  joinRoomWithCode,
  openNewSession,
  readRoomInviteCode,
  signUpHost,
  signUpGuest,
  tryHandEnrollmentActions,
  waitForDrawPhase,
} from "./roomFlow";

export { emulatorReady };

const AUTH_CLEAR_URL =
  "http://127.0.0.1:9099/emulator/v1/projects/demo-national-bourre-league/accounts";
const FIRESTORE_CLEAR_URL =
  "http://127.0.0.1:8088/emulator/v1/projects/demo-national-bourre-league/databases/(default)/documents";
const FIRESTORE_DOCS_BASE = FIRESTORE_CLEAR_URL;
const PUBLIC_TABLE_INDEX_COLLECTION = "publicTableIndex";
/** Must match docs/firebase-config.js FIREBASE_SDK_VERSION. */
const FIREBASE_SDK_CDN = "https://www.gstatic.com/firebasejs/12.14.0";

/**
 * Emulator admin REST (`/emulator/v1/...`) supports DELETE only — GET list returns 404.
 * Poll publicTableIndex through the signed-in page's Firestore client instead.
 */
async function countPublicTableIndexFromPage(page: Page): Promise<number> {
  return page.evaluate(async (cdn) => {
    const { getApp } = await import(`${cdn}/firebase-app.js`);
    const { collection, getDocs, getFirestore } = await import(`${cdn}/firebase-firestore.js`);
    const db = getFirestore(getApp());
    const snap = await getDocs(collection(db, "publicTableIndex"));
    return snap.size;
  }, FIREBASE_SDK_CDN);
}

async function countEmulatorCollection(collection: string): Promise<number> {
  try {
    const res = await fetch(`${FIRESTORE_DOCS_BASE}/${collection}`, {
      signal: AbortSignal.timeout(3000),
    });
    if (res.status === 404) return 0;
    if (!res.ok) return -1;
    const data = (await res.json()) as { documents?: unknown[] };
    return data.documents?.length ?? 0;
  } catch {
    return -1;
  }
}

async function pollUntil(
  label: string,
  predicate: () => Promise<boolean>,
  timeoutMs = 15_000,
  intervalMs = 300,
) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await predicate()) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`Timed out waiting for ${label}`);
}

/** Wipe emulator Auth + Firestore between multi-user scenarios. */
export async function clearEmulatorData() {
  await fetch(AUTH_CLEAR_URL, { method: "DELETE" }).catch(() => {});
  await fetch(FIRESTORE_CLEAR_URL, { method: "DELETE" }).catch(() => {});
  try {
    await pollUntil(
      "emulator data cleared",
      async () => {
        const rooms = await countEmulatorCollection("rooms");
        const index = await countEmulatorCollection(PUBLIC_TABLE_INDEX_COLLECTION);
        if (rooms < 0 || index < 0) return true;
        return rooms === 0 && index === 0;
      },
      8_000,
    );
  } catch {
    // Best-effort — proceed if the emulator list API is slow after DELETE.
  }
}

/** Matchmaking indexes the host table before a guest can spectate (not create a new table). */
export async function waitForPublicTableIndex(
  page: Page,
  minCount = 1,
  timeoutMs = 45_000,
) {
  await pollUntil(
    `publicTableIndex (>= ${minCount})`,
    async () => (await countPublicTableIndexFromPage(page)) >= minCount,
    timeoutMs,
  );
}

function roomDetail(page: Page) {
  return page.locator("#room-detail-view:not([hidden])");
}

function visibleSetupPlayButton(page: Page) {
  return roomDetail(page)
    .getByTestId("open-table-play")
    .or(roomDetail(page).getByTestId("open-table-play-inline"));
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
  return bootstrapPlayerContext(context, label);
}

/** Open both human contexts sequentially to reduce shared-browser contention. */
export async function createPlayerPair(
  browser: Browser,
  hostLabel: string,
  guestLabel: string,
): Promise<[PlayerContext, PlayerContext]> {
  const hostContext = await browser.newContext();
  const host = await bootstrapPlayerContext(hostContext, hostLabel);
  const guestContext = await browser.newContext();
  const guest = await bootstrapPlayerContext(guestContext, guestLabel);
  return [host, guest];
}

async function bootstrapPlayerContext(
  context: BrowserContext,
  label: string,
): Promise<PlayerContext> {
  context.setDefaultTimeout(60_000);
  context.setDefaultNavigationTimeout(45_000);
  const page = await context.newPage();
  await page.goto("/", { waitUntil: "commit", timeout: 45_000 });
  if (/host/i.test(label)) {
    await signUpHost(page, label);
  } else {
    await signUpGuest(page, label);
  }
  await goToPrivateRooms(page);
  await expect(page.locator("#auth-modal")).toBeHidden({ timeout: 15_000 });
  await ensureTableOverlayClosed(page);
  return { context, page, label };
}

export async function closePlayerContext(player: PlayerContext) {
  await player.context.close().catch(() => {});
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
  if (await visibleSetupPlayButton(page).isVisible().catch(() => false)) return true;
  return (await roomDetail(page).locator(".session-tab").count()) > 0;
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
  await expect(roomDetail(page).locator(".room-detail__title")).toContainText(/.+/, {
    timeout: 20_000,
  });
  await ensureTableOverlayClosed(page);
  const tabs = roomDetail(page).locator(".session-tab");
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
    const card = page.locator("[data-open-room]").filter({ hasText: roomName }).first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.click();
    await expect(roomDetail(page).locator(".room-detail__title")).toContainText(roomName, {
      timeout: 15_000,
    });
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
  await ensureRoomDetailOpen(page);
  await roomDetail(page).getByTestId("add-player-robot").check();
  await roomDetail(page).getByTestId("session-add-player-pill").click();
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

export async function openTableFromSetup(page: Page, roomName?: string) {
  await ensureRoomDetailOpen(page, roomName);
  await ensureSessionOpen(page);
  await waitForPlayEnabled(page);

  const overlay = tableOverlay(page);
  if (await overlay.getByTestId("table-root").isVisible().catch(() => false)) return;

  const playInDetail = visibleSetupPlayButton(page);
  await playInDetail.click();

  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 60_000 });
}

/** Room list can stay visible while a hidden room-detail Play button remains in the DOM. */
export async function ensureRoomDetailOpen(page: Page, roomName?: string) {
  if (await roomDetail(page).isVisible().catch(() => false)) return;

  if (roomName) {
    const card = page.locator("[data-open-room]").filter({ hasText: roomName }).first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.click();
  } else {
    const card = page.locator("[data-open-room]").first();
    await expect(card).toBeVisible({ timeout: 15_000 });
    await card.click();
  }
  await expect(roomDetail(page).locator(".room-detail__title")).toBeVisible({ timeout: 20_000 });
}

/** Both players need Play enabled (≥2 roster entries) before opening the table. */
export async function waitForPlayEnabled(page: Page) {
  await ensureRoomDetailOpen(page);
  const playBtn = visibleSetupPlayButton(page);
  await expect(playBtn).toBeVisible({ timeout: 60_000 });
  await expect(playBtn).toBeEnabled({ timeout: 60_000 });
}

/** Host opens the table first, then guest — avoids overlay races on shared session state. */
export async function openPrivateRoomTablesSequential(
  hostPage: Page,
  guestPage: Page,
  roomName?: string,
) {
  await openTableFromSetup(hostPage, roomName);
  await expect(tableOverlay(hostPage).getByTestId("table-root")).toBeVisible({ timeout: 30_000 });
  await openTableFromSetup(guestPage, roomName);
  await expect(tableOverlay(guestPage).getByTestId("table-root")).toBeVisible({ timeout: 30_000 });
}

async function isPageInPlayPhase(page: Page): Promise<boolean> {
  const overlay = tableOverlay(page);
  if (!(await overlay.getByTestId("table-root").isVisible().catch(() => false))) return false;
  return (await getHandPhase(overlay)) === "play";
}

/**
 * Coordinate enrollment + draw across multiple human overlays on the same session.
 * Each player opts in and passes draw when their controls are visible.
 */
export async function driveLiveHumansToPlay(pages: Page[], deadlineMs = 240_000) {
  const deadline = Date.now() + deadlineMs;
  const enrollClicks = new WeakMap<Page, { at: number }>();

  while (Date.now() < deadline) {
    const playStates = await Promise.all(pages.map((p) => isPageInPlayPhase(p)));
    if (playStates.every(Boolean)) return;

    for (const page of pages) {
      const overlay = tableOverlay(page);
      if (!(await overlay.getByTestId("table-root").isVisible().catch(() => false))) continue;

      const phase = await getHandPhase(overlay);
      if (phase === "play") continue;
      if (phase === "reveal") continue;

      const clickState = enrollClicks.get(page) ?? { at: 0 };
      enrollClicks.set(page, clickState);
      if (await tryHandEnrollmentActions(page, overlay, clickState)) continue;

      if (phase !== "draw") continue;

      const passBtn = overlay.getByTestId("pass-draw-button");
      const drawBtn = overlay.getByTestId("draw-button");
      if (await passBtn.isVisible().catch(() => false)) {
        await passBtn.click({ timeout: 3000 }).catch(() => {});
      } else if (await drawBtn.isVisible().catch(() => false)) {
        await drawBtn.click({ timeout: 3000 }).catch(() => {});
      }
    }

    await nudgeBots(pages[0]);
    await pages[0].waitForTimeout(250);
  }

  const phases = await Promise.all(
    pages.map(async (p) => {
      try {
        return await getHandPhase(tableOverlay(p));
      } catch {
        return "unknown";
      }
    }),
  );
  throw new Error(`Live humans did not reach play phase (phases: ${phases.join(", ")})`);
}

/** Leave a public-table room (clears matchQueue + pendingJoin server-side). */
export async function leaveCurrentPublicRoom(page: Page) {
  await ensureTableOverlayClosed(page);
  page.once("dialog", (dialog) => dialog.accept());

  const detailLeave = page.locator("#leave-room");
  if (await detailLeave.isVisible().catch(() => false)) {
    await detailLeave.click();
  } else {
    const listLeave = page.locator("[data-leave-room]").first();
    await expect(listLeave).toBeVisible({ timeout: 15_000 });
    await listLeave.click();
  }
  await expect(page.locator("#view-rooms")).toBeVisible({ timeout: 20_000 });
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
  await expect(btn).toBeEnabled({ timeout: 30_000 });

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await btn.click();
      await expect(tableOverlay(page).getByTestId("table-root")).toBeVisible({ timeout: 120_000 });
      return;
    } catch (err) {
      lastError = err;
      const roomsError = (await page.locator("#rooms-error").textContent().catch(() => "")) ?? "";
      if (/failed|error/i.test(roomsError)) {
        throw new Error(`Play Now failed: ${roomsError}`);
      }
      if (attempt === 0) {
        await goToPrivateRooms(page);
        await expect(btn).toBeEnabled({ timeout: 15_000 });
      }
    }
  }
  throw lastError;
}

/** After leaving a public room, wait until Play Now is ready again. */
export async function waitForPlayNowReady(page: Page) {
  await goToPrivateRooms(page);
  await expect(page.getByTestId("play-now")).toBeEnabled({ timeout: 30_000 });
}

export async function joinPublicMixedTableAsSpectator(
  hostPage: Page,
  guestPage: Page,
  mode: PlayNowMode = "mixed",
) {
  await selectPlayNowMode(hostPage, mode);
  await selectPlayNowMode(guestPage, mode);
  await clickPlayNow(hostPage);
  await expect(tableOverlay(hostPage).getByTestId("table-root")).toBeVisible({ timeout: 60_000 });
  await waitForPublicTableIndex(hostPage, 1);
  await clickPlayNow(guestPage);
  await expectWatchOnlyTable(guestPage);
  await expectNoHeroTurnUrgency(guestPage);
}

/** Guest leaves a public table and re-queues as watch-only on the same indexed table. */
export async function rejoinPublicMixedAsSpectator(guestPage: Page, mode: PlayNowMode = "mixed") {
  await waitForPlayNowReady(guestPage);
  await selectPlayNowMode(guestPage, mode);
  await waitForPublicTableIndex(guestPage, 1);
  await clickPlayNow(guestPage);
  await expectWatchOnlyTable(guestPage);
  await expectNoHeroTurnUrgency(guestPage);
}

export async function expectWatchOnlyTable(page: Page) {
  const overlay = tableOverlay(page);
  const banner = overlay.getByTestId("watch-only-banner");
  await expect(banner).toBeVisible({ timeout: 30_000 });
  await expect(banner).toContainText(/watching this hand/i, { timeout: 15_000 });
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
  getHandPhase,
};
