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

export async function createRoom(page: Page, name = "E2E Bot Flow Room") {
  await goToPrivateRooms(page);

  const title = page.locator(".room-detail__title");
  const modal = page.locator("#create-room-modal");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (await title.filter({ hasText: name }).isVisible().catch(() => false)) return;

    await page.locator("#create-room").click();
    await expect(modal).toBeVisible();
    await page.locator("#create-room-name").fill(name);
    await page.locator("#create-room-ante").selectOption({ index: 1 });
    await page.locator("#create-room-form").evaluate((form: HTMLFormElement) => form.requestSubmit());

    try {
      await expect(title).toContainText(name, { timeout: 15_000 });
      await expect(modal).toBeHidden({ timeout: 5_000 });
      return;
    } catch {
      if (await title.filter({ hasText: name }).isVisible().catch(() => false)) return;
      if (await modal.isVisible().catch(() => false)) {
        await page.locator("#create-room-modal .modal__close").click({ force: true });
        await expect(modal).toBeHidden({ timeout: 5_000 });
      }
      await page.waitForTimeout(400);
    }
  }

  await expect(title).toContainText(name, { timeout: 15_000 });
}

export async function openNewSession(page: Page) {
  await ensureTableOverlayClosed(page);
  await page.waitForTimeout(300);
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#new-session").click({ force: true });
  await expect(page.locator(".session-tab")).toHaveCount(1, { timeout: 15_000 });
  await expect(page.getByTestId("session-setup-window")).toBeVisible({ timeout: 15_000 });
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

/** Locator-based checks — matches smoke-draw-play-trace.mjs (avoids stale evaluate reads). */
async function isPlayPhaseReady(overlay: Locator): Promise<boolean> {
  const header =
    (await overlay.getByTestId("phase-tag").first().getAttribute("data-phase").catch(() => "")) ?? "";
  if (header === "play") return true;

  const center =
    (await overlay.getByTestId("phase-tag-center").getAttribute("data-phase").catch(() => "")) ??
    "";
  if (center === "play") return true;

  const headerText =
    (await overlay.getByTestId("phase-tag").first().textContent().catch(() => "")) ?? "";
  const centerText =
    (await overlay.getByTestId("phase-tag-center").textContent().catch(() => "")) ?? "";
  if (/playing/i.test(`${headerText} ${centerText}`)) return true;

  const heroLabel =
    (await overlay.getByTestId("hero-hand").getAttribute("aria-label").catch(() => "")) ?? "";
  return /playing/i.test(heroLabel);
}

async function isDrawPhaseReady(overlay: Locator): Promise<boolean> {
  if (await isPlayPhaseReady(overlay)) return false;
  if ((await phaseDataAttr(overlay, "phase-tag-center")) === "draw") return true;
  if ((await phaseDataAttr(overlay, "phase-tag")) === "draw") return true;

  const heroLabel =
    (await overlay.getByTestId("hero-hand").getAttribute("aria-label").catch(() => "")) ?? "";
  return /drawing/i.test(heroLabel);
}

async function isRevealPhaseActive(overlay: Locator): Promise<boolean> {
  if (await isPlayPhaseReady(overlay) || (await isDrawPhaseReady(overlay))) return false;
  const header = await phaseDataAttr(overlay, "phase-tag");
  const center = await phaseDataAttr(overlay, "phase-tag-center");
  if (header === "reveal" || center === "reveal") return true;
  const tagText =
    (await overlay.getByTestId("phase-tag").first().textContent().catch(() => "")) ?? "";
  return /dealing/i.test(tagText);
}

export async function getHandPhase(overlay: Locator): Promise<HandPhase> {
  if (await isPlayPhaseReady(overlay)) return "play";
  if (await isDrawPhaseReady(overlay)) return "draw";

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

export async function expectHandPhase(overlay: Locator, phase: Exclude<HandPhase, "">) {
  if (phase === "play") {
    await expect.poll(() => isPlayPhaseReady(overlay), { timeout: 30_000 }).toBe(true);
    return;
  }
  await expect.poll(async () => getHandPhase(overlay), { timeout: 30_000 }).toBe(phase);
}

async function readDataPhase(overlay: Locator): Promise<string> {
  return getHandPhase(overlay);
}

async function readPhaseTag(overlay: Locator) {
  const header =
    (await overlay.getByTestId("phase-tag").first().textContent().catch(() => ""))?.trim() ?? "";
  const center =
    (await overlay.getByTestId("phase-tag-center").textContent().catch(() => ""))?.trim() ?? "";
  const heroLabel =
    (await overlay.getByTestId("hero-hand").getAttribute("aria-label").catch(() => "")) ?? "";
  return [header, center, heroLabel].filter(Boolean).join(" | ");
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

  const dataPhase = await readDataPhase(overlay);
  if (dataPhase === "draw" || dataPhase === "play") return false;
  if (await isRevealPhaseActive(overlay)) return false;

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
  if (await isPlayPhaseReady(overlay)) return false;

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

/**
 * Wait through reveal (~5s trump hold), enrollment/decision, and draw opening.
 * Does not complete every player's draw — use `advanceThroughDrawPhase` after this.
 */
export async function waitForDrawPhase(page: Page) {
  const overlay = tableOverlay(page);
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });

  const deadline = Date.now() + 120_000;
  const lastActionClick = { at: 0 };
  while (Date.now() < deadline) {
    if (await isDrawPhaseReady(overlay)) return;

    if (await isRevealPhaseActive(overlay)) {
      await page.waitForTimeout(600);
      continue;
    }

    if (await tryHandEnrollmentActions(page, overlay, lastActionClick)) continue;

    const feedback =
      (await overlay.getByTestId("feedback-banner").textContent().catch(() => "")) ?? "";
    assertNoHandFailure(overlay, feedback);
    await page.waitForTimeout(400);
  }

  const phase = await readPhaseTag(overlay);
  throw new Error(`Draw phase did not start within 120s (last phase: ${phase || "unknown"})`);
}

/** Trace-parity loop: enrollment → draw passes → play (single deadline). */
export async function driveTableToPlay(page: Page, deadlineMs = 240_000) {
  const overlay = tableOverlay(page);
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });

  const deadline = Date.now() + deadlineMs;
  const lastEnrollClick = { at: 0 };
  let lastNudgeAt = 0;
  let lastProgressAt = Date.now();

  while (Date.now() < deadline) {
    if (await isPlayPhaseReady(overlay)) return;

    if (await isRevealPhaseActive(overlay)) {
      await page.waitForTimeout(600);
      continue;
    }

    if (await tryHandEnrollmentActions(page, overlay, lastEnrollClick)) {
      lastProgressAt = Date.now();
      continue;
    }

    const passVisible = await overlay.getByTestId("pass-draw-button").isVisible().catch(() => false);
    const drawVisible = await overlay.getByTestId("draw-button").isVisible().catch(() => false);
    const phase = await getHandPhase(overlay);
    if ((passVisible || drawVisible) && (phase === "draw" || phase === "play")) {
      if (phase === "play") return;
      const btn = passVisible
        ? overlay.getByTestId("pass-draw-button")
        : overlay.getByTestId("draw-button");
      try {
        await btn.evaluate((el) => (el as HTMLButtonElement).click());
      } catch {
        await btn.click({ force: true, timeout: 3000 }).catch(() => {});
      }
      await page.waitForTimeout(1000);
      lastProgressAt = Date.now();
    } else {
      await page.waitForTimeout(400);
    }

    const now = Date.now();
    if (phase === "draw" && now - lastNudgeAt > 5000 && now - lastProgressAt > 5000) {
      await page.evaluate(() => window.__nblE2E?.nudgeBots?.()).catch(() => {});
      lastNudgeAt = now;
    }

    const feedback =
      (await overlay.getByTestId("feedback-banner").textContent().catch(() => "")) ?? "";
    assertNoHandFailure(overlay, feedback);
  }

  const labels = await readPhaseTag(overlay);
  throw new Error(`Play phase not reached within ${deadlineMs / 1000}s (last: ${labels || "unknown"})`);
}

/** @deprecated Prefer driveTableToPlay — kept for callers that split draw/play waits. */
export async function advanceThroughDrawPhase(page: Page) {
  await driveTableToPlay(page);
}

/** Wait until the live hand is in trick play (draw complete). */
export async function waitForPlayPhase(page: Page) {
  await driveTableToPlay(page);
  await expectHandPhase(tableOverlay(page), "play");
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
