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
  await page.waitForTimeout(300);
  page.once("dialog", (dialog) => dialog.accept());
  await page.locator("#new-session").click({ force: true });
  await expect(page.locator(".session-tab")).toHaveCount(1, { timeout: 15_000 });
  await expect(page.getByTestId("session-setup-window")).toBeVisible({ timeout: 15_000 });
}

/** Host counts as one seat; add robots until `totalPlayers` are seated. */
export async function addRobotsUntilCount(page: Page, totalPlayers: number) {
  const botsNeeded = Math.max(0, totalPlayers - 1);
  for (let i = 0; i < botsNeeded; i += 1) {
    await page.getByTestId("add-player-robot").check();
    await page.getByTestId("session-add-player-pill").click();
    await expect(page.locator(".members__role").filter({ hasText: "robot" })).toHaveCount(i + 1, {
      timeout: 15_000,
    });
  }
}

export async function goToTable(page: Page) {
  const overlay = page.locator("#table-play-overlay");
  if (!(await overlay.isVisible().catch(() => false))) {
    const goBtn = page.getByTestId("open-table-play").first();
    await expect(goBtn).toBeEnabled({ timeout: 15_000 });
    await goBtn.click();
  }
  await expect(overlay).toBeVisible({ timeout: 15_000 });
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });
}

function tableOverlay(page: Page) {
  return page.locator("#table-play-overlay");
}

async function readPhaseTag(overlay: Locator) {
  return (
    (await overlay.locator(".btable-session__phase-tag").textContent().catch(() => "")) ?? ""
  ).trim();
}

async function isDrawPhaseReady(overlay: Locator) {
  const phaseTag = await readPhaseTag(overlay);
  if (/draw round/i.test(phaseTag)) return true;
  if (await overlay.locator(".btable-session__phase-tag--draw").isVisible().catch(() => false)) {
    return true;
  }
  if (await overlay.getByTestId("trump-button").isVisible().catch(() => false)) return true;
  if (await overlay.getByTestId("draw-button").isVisible().catch(() => false)) return true;
  if (await overlay.getByTestId("pass-draw-button").isVisible().catch(() => false)) return true;
  const hero = (await overlay.getByTestId("hero-hand").textContent().catch(() => "")) ?? "";
  return /draw round|stand pat|discard/i.test(hero) && !/join window/i.test(hero);
}

async function isPlayPhaseReady(overlay: Locator) {
  const phaseTag = await readPhaseTag(overlay);
  if (/trick play/i.test(phaseTag)) return true;
  return overlay.locator(".btable-session__phase-tag--play").isVisible().catch(() => false);
}

async function isRevealPhaseActive(overlay: Locator) {
  const phaseTag = await readPhaseTag(overlay);
  if (/dealing/i.test(phaseTag)) return true;
  return overlay.locator(".btable-session__phase-tag--reveal").isVisible().catch(() => false);
}

/** Click enrollment / decision CTAs when shown. */
export async function tryHandEnrollmentActions(
  page: Page,
  overlay: Locator,
  lastActionClick: { at: number },
) {
  const now = Date.now();
  if (now - lastActionClick.at < 2500) return false;

  const decisionImIn = overlay.getByTestId("decision-im-in-button");
  if (await decisionImIn.isVisible().catch(() => false)) {
    await decisionImIn.click();
    lastActionClick.at = now;
    await page.waitForTimeout(800);
    return true;
  }

  const join = overlay
    .getByTestId("join-button")
    .or(overlay.getByTestId("seat-opt-in"))
    .first();
  if (await join.isVisible().catch(() => false)) {
    await join.click();
    lastActionClick.at = now;
    await page.waitForTimeout(800);
    return true;
  }

  return false;
}

/** Stand pat when the hero has the draw clock. */
async function tryPassDraw(page: Page, overlay: Locator, lastActionClick: { at: number }) {
  const now = Date.now();
  if (now - lastActionClick.at < 1500) return false;

  const passDraw = overlay
    .getByTestId("pass-draw-button")
    .or(overlay.getByRole("button", { name: /^stand pat$/i }));
  const drawBtn = overlay.getByTestId("draw-button");
  const target = (await passDraw.first().isVisible().catch(() => false))
    ? passDraw.first()
    : (await drawBtn.isVisible().catch(() => false))
      ? drawBtn
      : null;
  if (!target) return false;

  try {
    await target.click({ timeout: 8000 });
  } catch {
    await target.click({ force: true, timeout: 3000 });
  }
  lastActionClick.at = now;
  await page.waitForTimeout(900);

  const heroError = await overlay.locator(".btable-hero__error").textContent().catch(() => "");
  if (heroError && /not your turn|could not|failed|permission/i.test(heroError)) {
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

/** Pass hero draw turns and wait for bots until trick play begins. */
export async function advanceThroughDrawPhase(page: Page) {
  const overlay = tableOverlay(page);
  const deadline = Date.now() + 120_000;
  const lastActionClick = { at: 0 };

  while (Date.now() < deadline) {
    if (await isPlayPhaseReady(overlay)) return;

    if (await tryPassDraw(page, overlay, lastActionClick)) continue;

    const feedback =
      (await overlay.getByTestId("feedback-banner").textContent().catch(() => "")) ?? "";
    assertNoHandFailure(overlay, feedback);
    await page.waitForTimeout(400);
  }

  const phase = await readPhaseTag(overlay);
  throw new Error(`Play phase did not start within 120s (last phase: ${phase || "unknown"})`);
}

/** Wait until the live hand is in trick play (draw complete). */
export async function waitForPlayPhase(page: Page) {
  await waitForDrawPhase(page);
  await advanceThroughDrawPhase(page);

  const overlay = tableOverlay(page);
  await expect(overlay.locator(".btable-session__phase-tag")).toContainText(/trick play/i, {
    timeout: 15_000,
  });
}

/** Dealer seat must not hold the opening lead on trick 1. */
export async function expectOpeningLeadNotDealer(page: Page) {
  const root = page.locator("#table-play-overlay, #table-root");
  const dealer = root.locator(".bseat--dealer");
  const onTurn = root.locator(".bseat--on-turn");

  await expect(dealer).toHaveCount(1, { timeout: 15_000 });
  await expect(onTurn).toHaveCount(1, { timeout: 15_000 });

  const sameSeat = await page.evaluate(() => {
    const scope =
      document.querySelector("#table-play-overlay") ?? document.querySelector("#table-root");
    if (!scope) return true;
    const dealerEl = scope.querySelector(".bseat--dealer");
    const turnEl = scope.querySelector(".bseat--on-turn");
    return Boolean(dealerEl && turnEl && dealerEl === turnEl);
  });
  expect(sameSeat, "dealer must not lead trick 1").toBe(false);
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
