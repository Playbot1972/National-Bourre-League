import { expect, type Locator, type Page } from "@playwright/test";

export async function emulatorReady(): Promise<boolean> {
  try {
    const res = await fetch("http://127.0.0.1:4000", { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function signUpHost(page: Page, label = "E2E Host") {
  await signUpUser(page, label);
}

export async function signUpGuest(page: Page, label = "E2E Guest") {
  await signUpUser(page, label);
}

async function signUpUser(page: Page, label: string) {
  await page.locator("#hero-signup").click();
  await expect(page.locator("#auth-modal")).toBeVisible();
  await expect(page.locator("#auth-name")).toBeVisible();
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const email = `${slug}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.com`;
  await page.locator("#auth-name").fill(label);
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill("test-pass-123456");
  await page.locator("#auth-submit").click();
  await expect(page.locator("#auth-modal")).toBeHidden({ timeout: 15_000 });
}

/** Open the protected Rooms view (nav renamed from legacy "Private Rooms" link). */
export async function goToPrivateRooms(page: Page) {
  const roomsView = page.locator("#view-rooms");
  if (await roomsView.isVisible().catch(() => false)) return;

  const navRooms = page.locator('a.nav__link[href="#rooms"]');
  if (await navRooms.isVisible().catch(() => false)) {
    await navRooms.click();
  } else {
    await page.getByRole("link", { name: /go to your rooms/i }).click();
  }
  await expect(roomsView).toBeVisible({ timeout: 15_000 });
}

export async function readRoomInviteCode(page: Page) {
  const codeEl = page.getByTestId("room-invite-code");
  await expect(codeEl).toBeVisible({ timeout: 15_000 });
  const code = (await codeEl.textContent())?.trim() ?? "";
  expect(code).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
  return code;
}

export async function joinRoomWithCode(page: Page, code: string) {
  await goToPrivateRooms(page);
  await page.getByTestId("join-code-input").fill(code.replace(/\s+/g, ""));
  await page.getByTestId("join-code-submit").click();
}

/** Regional table session tabs only — not room-scope tabs (My rooms / Practice room). */
function regionalSessionTabs(page: Page) {
  return page.locator(".session-tabs--preset [data-open-session]");
}

async function waitForRegionalSessionReady(page: Page) {
  await expect(page.getByTestId("game-setup-panel")).toBeVisible({ timeout: 30_000 });
  await expect(regionalSessionTabs(page)).toHaveCount(1, { timeout: 30_000 });
}

export async function createRoom(page: Page, name = "E2E Bot Flow Room") {
  await goToPrivateRooms(page);

  const title = page.locator(".room-detail__title");
  const modal = page.locator("#create-room-modal");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (await title.filter({ hasText: name }).isVisible().catch(() => false)) {
      await waitForRegionalSessionReady(page);
      return;
    }

    await page.locator("#create-room").click();
    await expect(modal).toBeVisible();
    await page.locator("#create-room-name").fill(name);
    await page.locator("#create-room-form").evaluate((form: HTMLFormElement) => form.requestSubmit());
    await page.locator("#create-room-ante").selectOption({ index: 1 });
    await page.locator("#create-room-form").evaluate((form: HTMLFormElement) => form.requestSubmit());

    try {
      await expect(title).toContainText(name, { timeout: 15_000 });
      await expect(modal).toBeHidden({ timeout: 5_000 });
      await waitForRegionalSessionReady(page);
      return;
    } catch {
      if (await title.filter({ hasText: name }).isVisible().catch(() => false)) {
        await waitForRegionalSessionReady(page);
        return;
      }
      if (await modal.isVisible().catch(() => false)) {
        await page.locator("#create-room-modal .modal__close").click({ force: true });
        await expect(modal).toBeHidden({ timeout: 5_000 });
      }
      await page.waitForTimeout(400);
    }
  }

  await expect(title).toContainText(name, { timeout: 15_000 });
  await waitForRegionalSessionReady(page);
}

export async function openNewSession(page: Page) {
  await ensureTableOverlayClosed(page);
  await page.waitForTimeout(300);
  const setupWindow = page.getByTestId("session-setup-window");
  if (await setupWindow.isVisible().catch(() => false)) {
    await expect(regionalSessionTabs(page)).toHaveCount(1, { timeout: 15_000 });
    return;
  }
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#new-session").click({ force: true });
  await expect(regionalSessionTabs(page)).toHaveCount(1, { timeout: 15_000 });
  await expect(setupWindow).toBeVisible({ timeout: 15_000 });
}

/** Host counts as one seat; add robots until `totalPlayers` are seated. */
export async function addRobotsUntilCount(page: Page, totalPlayers: number) {
  const botsNeeded = Math.max(0, totalPlayers - 1);
  const robotRoles = () =>
    page.locator(".game-setup-roster__role").filter({ hasText: "robot" });

  for (let i = 0; i < botsNeeded; i += 1) {
    await ensureTableOverlayClosed(page);
    await page.getByTestId("add-player-robot").check();
    const pill = page.getByTestId("session-add-player-pill");
    await expect(pill).toBeVisible({ timeout: 15_000 });

    const isSeventhRobot = i + 1 >= 7;
    for (let attempt = 0; attempt < (isSeventhRobot ? 2 : 1); attempt += 1) {
      if (attempt > 0) await ensureTableOverlayClosed(page);
      try {
        await pill.click({ timeout: 8000 });
      } catch {
        await ensureTableOverlayClosed(page);
        await pill.evaluate((el) => (el as HTMLButtonElement).click());
      }
      const countTimeout = isSeventhRobot ? 30_000 : 15_000;
      try {
        await expect(robotRoles()).toHaveCount(i + 1, { timeout: countTimeout });
        break;
      } catch (err) {
        if (attempt === 1 || !isSeventhRobot) throw err;
      }
    }
  }

  // 7th robot triggers instant table open — allow roster snapshot to settle.
  if (botsNeeded >= 7) {
    await expect(robotRoles()).toHaveCount(botsNeeded, { timeout: 30_000 });
  }
  if (botsNeeded > 0) {
    await expect(page.getByTestId("open-table-play").first()).toBeEnabled({ timeout: 30_000 });
  }
}

export async function goToTable(page: Page) {
  const overlay = page.locator("#table-play-overlay");
  if (!(await overlay.isVisible().catch(() => false))) {
    // 7+ bots may have triggered instant play — wait before clicking Play through body lock.
    try {
      await expect(overlay).toBeVisible({ timeout: 10_000 });
    } catch {
      await ensureTableOverlayClosed(page);
      const goBtn = page.getByTestId("open-table-play").first();
      await expect(goBtn).toBeEnabled({ timeout: 15_000 });
      await goBtn.evaluate((el) => (el as HTMLButtonElement).click());
      await expect(overlay).toBeVisible({ timeout: 15_000 });
    }
  }
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });
}

function tableOverlay(page: Page) {
  return page.locator("#table-play-overlay");
}

type HandPhase = "reveal" | "decision" | "draw" | "play" | "waiting" | "";

async function phaseDataAttr(overlay: Locator, testId: string): Promise<string> {
  return (await overlay.getByTestId(testId).first().getAttribute("data-phase").catch(() => "")) ?? "";
}

/** Server hand phase — authoritative when presentation UI lags behind Firestore. */
async function authoritativeHandPhase(page: Page): Promise<string | null> {
  return page
    .evaluate(async () => {
      const { FIREBASE_SDK_VERSION } = await import("./firebase-config.js");
      const { getApps } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`
      );
      const { getAuth } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`
      );
      const { getFirestore, collection, query, where, getDocs } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
      );
      const app = getApps()[0];
      if (!app) return null;
      const auth = getAuth(app);
      await auth.authStateReady();
      const uid = auth.currentUser?.uid;
      if (!uid) return null;
      const db = getFirestore(app);
      const memberSnap = await getDocs(query(collection(db, "roomMembers"), where("userId", "==", uid)));
      const roomId = memberSnap.docs[0]?.data()?.roomId as string | undefined;
      if (!roomId) return null;
      const sessionsSnap = await getDocs(collection(db, "rooms", roomId, "sessions"));
      const sessionDoc =
        sessionsSnap.docs.find((d) => d.data().status !== "final") ?? sessionsSnap.docs[0];
      if (!sessionDoc) return null;
      const hand = sessionDoc.data().currentHand as { phase?: string } | undefined;
      return hand?.phase ?? null;
    })
    .catch(() => null);
}

/** Locator-based checks — matches smoke-draw-play-trace.mjs (avoids stale evaluate reads). */
async function isPlayPhaseReady(page: Page): Promise<boolean> {
  const authPhase = await authoritativeHandPhase(page);
  if (authPhase === "play") return true;

  const overlay = tableOverlay(page);

  const liveStatus =
    (await page.locator(".session-live-card__status").textContent().catch(() => "")) ?? "";
  if (/live play/i.test(liveStatus)) return true;

  const header = await phaseDataAttr(overlay, "phase-tag");
  if (header === "play") return true;

  const center = await phaseDataAttr(overlay, "phase-tag-center");
  if (center === "play") return true;

  const headerText =
    (await overlay.getByTestId("phase-tag").first().textContent().catch(() => "")) ?? "";
  const centerText =
    (await overlay.getByTestId("phase-tag-center").textContent().catch(() => "")) ?? "";
  if (/play card|playing/i.test(`${headerText} ${centerText}`)) return true;

  const heroLabel =
    (await overlay.getByTestId("hero-hand").getAttribute("aria-label").catch(() => "")) ?? "";
  if (/play card|playing/i.test(heroLabel)) return true;

  const drawControlsVisible =
    (await overlay.getByTestId("pass-draw-button").isVisible().catch(() => false)) ||
    (await overlay.getByTestId("draw-button").isVisible().catch(() => false));
  const trickLive =
    await overlay.locator('[aria-label="Current trick"]').isVisible().catch(() => false);
  if (trickLive && !drawControlsVisible) return true;

  return false;
}

async function isDrawPhaseReady(page: Page): Promise<boolean> {
  if (await isPlayPhaseReady(page)) return false;
  const overlay = tableOverlay(page);
  if ((await phaseDataAttr(overlay, "phase-tag-center")) === "draw") return true;
  if ((await phaseDataAttr(overlay, "phase-tag")) === "draw") return true;

  const liveStatus =
    (await page.locator(".session-live-card__status").textContent().catch(() => "")) ?? "";
  if (/draw phase/i.test(liveStatus)) return true;

  const heroLabel =
    (await overlay.getByTestId("hero-hand").getAttribute("aria-label").catch(() => "")) ?? "";
  if (/play card|playing/i.test(heroLabel)) return false;
  return /\bdraw\b/i.test(heroLabel);
}

async function isRevealPhaseActive(page: Page): Promise<boolean> {
  const overlay = tableOverlay(page);
  if (await isPlayPhaseReady(page) || (await isDrawPhaseReady(page))) return false;
  const header = await phaseDataAttr(overlay, "phase-tag");
  const center = await phaseDataAttr(overlay, "phase-tag-center");
  if (header === "reveal" || center === "reveal") return true;
  const tagText =
    (await overlay.getByTestId("phase-tag").first().textContent().catch(() => "")) ?? "";
  return /dealing/i.test(tagText);
}

export async function getHandPhase(page: Page): Promise<HandPhase> {
  if (await isPlayPhaseReady(page)) return "play";
  if (await isDrawPhaseReady(page)) return "draw";

  const overlay = tableOverlay(page);
  const header = await phaseDataAttr(overlay, "phase-tag");
  const center = await phaseDataAttr(overlay, "phase-tag-center");
  const phase = header || center;
  if (phase === "decision" || phase === "reveal" || phase === "waiting") return phase;

  const tagText =
    (await overlay.getByTestId("phase-tag").first().textContent().catch(() => "")) ?? "";
  if (/choosing/i.test(tagText)) return "decision";
  if (/dealing/i.test(tagText)) return "reveal";
  if (/waiting to deal/i.test(tagText)) return "waiting";
  return "";
}

export async function expectHandPhase(page: Page, phase: Exclude<HandPhase, "">) {
  if (phase === "play") {
    await expect.poll(() => isPlayPhaseReady(page), { timeout: 30_000 }).toBe(true);
    return;
  }
  await expect.poll(async () => getHandPhase(page), { timeout: 30_000 }).toBe(phase);
}

async function readDataPhase(page: Page): Promise<string> {
  return getHandPhase(page);
}

async function readPhaseTag(page: Page) {
  const overlay = tableOverlay(page);
  const header =
    (await overlay.getByTestId("phase-tag").first().textContent().catch(() => ""))?.trim() ?? "";
  const center =
    (await overlay.getByTestId("phase-tag-center").textContent().catch(() => ""))?.trim() ?? "";
  const heroLabel =
    (await overlay.getByTestId("hero-hand").getAttribute("aria-label").catch(() => "")) ?? "";
  const liveStatus =
    (await page.locator(".session-live-card__status").textContent().catch(() => ""))?.trim() ?? "";
  return [liveStatus, header, center, heroLabel].filter(Boolean).join(" | ");
}

/** Server-authoritative bot advance when client presentation gates stall draw/play. */
async function advanceBotsAuthoritative(page: Page) {
  await page.evaluate(async () => {
    const { FIREBASE_SDK_VERSION } = await import("./firebase-config.js");
    const { getApps } = await import(
      `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`
    );
    const { getAuth } = await import(
      `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`
    );
    const { getFirestore, collection, query, where, getDocs } = await import(
      `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
    );
    const app = getApps()[0];
    if (!app) return;
    const auth = getAuth(app);
    await auth.authStateReady();
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const db = getFirestore(app);
    const memberSnap = await getDocs(query(collection(db, "roomMembers"), where("userId", "==", uid)));
    const roomId = memberSnap.docs[0]?.data()?.roomId as string | undefined;
    if (!roomId) return;
    const sessionsSnap = await getDocs(collection(db, "rooms", roomId, "sessions"));
    const sessionDoc =
      sessionsSnap.docs.find((d) => d.data().status !== "final") ?? sessionsSnap.docs[0];
    if (!sessionDoc) return;
    const { gameAdvanceBots } = await import("./game-functions.js");
    await gameAdvanceBots(roomId, sessionDoc.id, {});
  }).catch(() => {});
}

/** Close live table overlay so session setup controls are clickable. */
export async function ensureTableOverlayClosed(page: Page) {
  const overlay = page.locator("#table-play-overlay");
  const bodyLocked = await page.evaluate(() =>
    document.body.classList.contains("table-play-active"),
  );
  const overlayVisible = await overlay.isVisible().catch(() => false);

  if (overlayVisible || bodyLocked) {
    const close = page.locator("#close-table-play");
    if (await close.isVisible().catch(() => false)) {
      await close.click({ force: true });
    } else {
      await page.keyboard.press("Escape");
    }
    await expect(overlay).toBeHidden({ timeout: 15_000 });
  }

  await page.evaluate(() => {
    document.body.classList.remove("table-play-active");
    const el = document.querySelector("#table-play-overlay");
    if (el instanceof HTMLElement) el.hidden = true;
  });
}

/** Click enrollment / decision CTAs when shown. */
export async function tryHandEnrollmentActions(
  page: Page,
  overlay: Locator,
  lastActionClick: { at: number },
) {
  const now = Date.now();
  if (now - lastActionClick.at < 1500) return false;

  const dataPhase = await readDataPhase(page);
  if (dataPhase === "draw" || dataPhase === "play") return false;
  if (await isRevealPhaseActive(page)) return false;

  const seatOptIn = overlay.getByTestId("seat-opt-in").first();
  if (!(await seatOptIn.isVisible().catch(() => false))) return false;

  try {
    await seatOptIn.click({ timeout: 5000 });
  } catch {
    await seatOptIn.click({ force: true, timeout: 3000 });
  }
  lastActionClick.at = now;
  await page.waitForTimeout(800);
  return true;
}

/** Stand pat when the hero has the draw clock. */
async function tryPassDraw(page: Page, overlay: Locator, lastActionClick: { at: number }) {
  if (await isPlayPhaseReady(page)) return false;

  const passDraw = overlay.getByTestId("pass-draw-button");
  const drawBtn = overlay.getByTestId("draw-button");

  const hasPass = await passDraw.isVisible().catch(() => false);
  const hasDraw = await drawBtn.isVisible().catch(() => false);
  if (!hasPass && !hasDraw) return false;

  const now = Date.now();
  if (now - lastActionClick.at < 1500) return false;

  const target = hasPass ? passDraw : drawBtn;
  try {
    await target.evaluate((el) => (el as HTMLButtonElement).click());
  } catch {
    try {
      await target.click({ timeout: 5000 });
    } catch {
      await target.click({ force: true, timeout: 3000 });
    }
  }
  lastActionClick.at = now;
  await page.waitForTimeout(1200);

  const heroError = await overlay.locator(".btable-hero__error").textContent().catch(() => "");
  if (heroError && /not your turn/i.test(heroError)) {
    return false;
  }
  if (heroError && /could not|failed|permission/i.test(heroError)) {
    throw new Error(`Draw action failed: ${heroError}`);
  }
  return true;
}

function assertNoHandFailure(overlay: Locator, feedback: string) {
  if (/permission|could not|failed/i.test(feedback)) {
    throw new Error(`Hand action failed: ${feedback}`);
  }
}

export async function waitForDrawPhase(page: Page) {
  const overlay = tableOverlay(page);
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });

  const deadline = Date.now() + 120_000;
  const lastActionClick = { at: 0 };
  while (Date.now() < deadline) {
    if (await isDrawPhaseReady(page)) return;

    if (await isRevealPhaseActive(page)) {
      await page.waitForTimeout(600);
      continue;
    }

    if (await tryHandEnrollmentActions(page, overlay, lastActionClick)) continue;

    const feedback =
      (await overlay.getByTestId("feedback-banner").textContent().catch(() => "")) ?? "";
    assertNoHandFailure(overlay, feedback);
    await page.waitForTimeout(400);
  }

  const phase = await readPhaseTag(page);
  throw new Error(`Draw phase did not start within 120s (last phase: ${phase || "unknown"})`);
}

export async function submitHeroStandPat(page: Page) {
  const overlay = tableOverlay(page);
  const pass = overlay.getByTestId("pass-draw-button");
  await expect(pass).toBeVisible({ timeout: 30_000 });
  try {
    await pass.evaluate((el) => (el as HTMLButtonElement).click());
  } catch {
    await pass.click({ force: true });
  }
  await page.waitForTimeout(600);
}

/** After hero stand pat, advance bots until Firestore/UI report trick play. */
export async function waitForAuthoritativePlayPhase(page: Page, timeoutMs = 180_000) {
  await expect
    .poll(
      async () => {
        if (await isPlayPhaseReady(page)) return true;
        await advanceBotsAuthoritative(page);
        await page.evaluate(() => window.__nblE2E?.nudgeBots?.()).catch(() => {});
        return false;
      },
      { timeout: timeoutMs, intervals: [1000, 500] },
    )
    .toBe(true);
}

/** Poll until hero draw controls render for the local player's legal draw turn. */
export async function waitForHeroDrawControls(overlay: Locator, timeoutMs = 60_000) {
  await expect
    .poll(
      async () => {
        const draw = await overlay.getByTestId("draw-button").isVisible().catch(() => false);
        const pat = await overlay.getByTestId("pass-draw-button").isVisible().catch(() => false);
        return draw || pat;
      },
      { timeout: timeoutMs },
    )
    .toBe(true);
}

/** Trace-parity loop: enrollment → draw passes → play (single deadline). */
export async function driveTableToPlay(page: Page, deadlineMs = 360_000) {
  const overlay = tableOverlay(page);
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });

  const deadline = Date.now() + deadlineMs;
  const lastEnrollClick = { at: 0 };
  const lastPassClick = { at: 0 };
  let lastNudgeAt = 0;
  let lastProgressAt = Date.now();

  await tryPassDraw(page, overlay, lastPassClick);

  while (Date.now() < deadline) {
    if (await isPlayPhaseReady(page)) return;

    if (await isRevealPhaseActive(page)) {
      await page.waitForTimeout(600);
      continue;
    }

    if (await tryHandEnrollmentActions(page, overlay, lastEnrollClick)) {
      lastProgressAt = Date.now();
      continue;
    }

    const passVisible = await overlay.getByTestId("pass-draw-button").isVisible().catch(() => false);
    const drawVisible = await overlay.getByTestId("draw-button").isVisible().catch(() => false);
    const phase = await getHandPhase(page);
    if ((passVisible || drawVisible) && (phase === "draw" || phase === "play")) {
      if (phase === "play") return;
      if (await tryPassDraw(page, overlay, lastPassClick)) {
        lastProgressAt = Date.now();
        continue;
      }
    } else {
      await page.waitForTimeout(400);
    }

    const now = Date.now();
    if (now - lastNudgeAt > 5000 && now - lastProgressAt > 5000) {
      await page.evaluate(() => window.__nblE2E?.nudgeBots?.()).catch(() => {});
      await advanceBotsAuthoritative(page);
      lastNudgeAt = now;
    }

    const feedback =
      (await overlay.getByTestId("feedback-banner").textContent().catch(() => "")) ?? "";
    assertNoHandFailure(overlay, feedback);
  }

  const labels = await readPhaseTag(page);
  const authPhase = await authoritativeHandPhase(page);
  const liveStatus =
    (await page.locator(".session-live-card__status").textContent().catch(() => "")) ?? "";
  throw new Error(
    `Play phase not reached within ${deadlineMs / 1000}s (auth=${authPhase ?? "null"}, live=${liveStatus || "none"}, ui=${labels || "unknown"})`,
  );
}

/** @deprecated Prefer driveTableToPlay — kept for callers that split draw/play waits. */
export async function advanceThroughDrawPhase(page: Page) {
  await driveTableToPlay(page);
}

/** Wait until the live hand is in trick play (draw complete). */
export async function waitForPlayPhase(page: Page) {
  await driveTableToPlay(page);
  await expectHandPhase(page, "play");
}

/** Dealer seat must not hold the opening lead on trick 1. */
export async function expectOpeningLeadNotDealer(page: Page) {
  const root = page.locator("#table-play-overlay, #table-root");
  const dealer = root.locator(".bseat--dealer");
  await expect(dealer).toHaveCount(1, { timeout: 15_000 });

  const selfSeat = root.getByTestId("seat-bottom-self");
  const opponentSeat = root.getByTestId("seat-top");
  await expect(selfSeat).toHaveClass(/bseat--dealer/);
  await expect(opponentSeat).toHaveClass(/bseat--active-actor/);
  await expect(selfSeat).not.toHaveClass(/bseat--active-actor/);
}

/** @deprecated Use waitForDrawPhase */
export async function completeEnrollmentToDraw(page: Page, totalPlayers: number) {
  await expect(page.locator("#table-play-overlay").locator(".bseat")).toHaveCount(totalPlayers, {
    timeout: 30_000,
  });
  await waitForDrawPhase(page);
}

export async function setupRoomWithBots(page: Page, totalPlayers: number) {
  await page.goto("/");
  await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
  await signUpHost(page);
  await createRoom(page);
  await openNewSession(page);
  await addRobotsUntilCount(page, totalPlayers);
}

declare global {
  interface Window {
    __nblE2E?: {
      nudgeBots?: () => Promise<unknown>;
    };
  }
}
