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
  await ensureTableOverlayClosed(page);
  const botsNeeded = Math.max(0, totalPlayers - 1);
  for (let i = 0; i < botsNeeded; i += 1) {
    await page.getByTestId("add-player-robot").check();
    const pill = page.getByTestId("session-add-player-pill");
    try {
      await pill.click({ timeout: 8000 });
    } catch {
      await ensureTableOverlayClosed(page);
      await pill.click({ force: true, timeout: 5000 });
    }
    await expect(page.locator(".game-setup-roster__role").filter({ hasText: "robot" })).toHaveCount(i + 1, {
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

type HandPhase = "reveal" | "decision" | "draw" | "play" | "waiting" | "";

/** Single DOM read — avoids duplicate phase-tag strict-mode failures. */
async function readHandPhase(overlay: Locator): Promise<{ phase: HandPhase; labels: string }> {
  return overlay.evaluate(() => {
    const scope = document.querySelector("#table-play-overlay") ?? document;
    const tagEls = [
      ...scope.querySelectorAll('[data-testid="phase-tag"]'),
      ...scope.querySelectorAll('[data-testid="phase-tag-center"]'),
    ];
    const phases = tagEls
      .map((el) => (el.getAttribute("data-phase") ?? "").trim())
      .filter(Boolean);
    const texts = tagEls.map((el) => (el.textContent ?? "").trim()).filter(Boolean);
    const hero = scope.querySelector('[data-testid="hero-hand"]');
    const heroLabel = hero?.getAttribute("aria-label") ?? "";
    const heroText = hero?.textContent ?? "";
    const centerText =
      scope.querySelector('[data-testid="phase-tag-center"]')?.textContent?.trim() ?? "";
    const hasPlayButtons = scope.querySelectorAll('[data-testid="play-button"]').length > 0;
    const trickInFlight = Boolean(scope.querySelector('[aria-label="Cards in trick"] li, [aria-label="Current trick"]'));

    if (
      phases.includes("play") ||
      /playing/i.test(heroLabel) ||
      /playing/i.test(heroText) ||
      /playing/i.test(centerText) ||
      hasPlayButtons ||
      trickInFlight
    ) {
      return { phase: "play", labels: texts.join(" | ") || centerText || heroLabel };
    }
    if (
      phases.includes("draw") ||
      /drawing/i.test(heroLabel) ||
      /drawing/i.test(heroText)
    ) {
      return { phase: "draw", labels: texts.join(" | ") || heroLabel };
    }
    if (phases.includes("decision") || /choosing/i.test(texts.join(" "))) {
      return { phase: "decision", labels: texts.join(" | ") };
    }
    if (phases.includes("reveal") || /dealing/i.test(texts.join(" "))) {
      return { phase: "reveal", labels: texts.join(" | ") };
    }
    const waiting = phases.includes("waiting") || /waiting to deal/i.test(texts.join(" "));
    if (waiting) return { phase: "waiting", labels: texts.join(" | ") };
    const first = phases[0];
    const phase =
      first === "play" || first === "draw" || first === "decision" || first === "reveal" || first === "waiting"
        ? first
        : "";
    return { phase, labels: texts.join(" | ") || heroLabel };
  });
}

export async function getHandPhase(overlay: Locator): Promise<HandPhase> {
  return (await readHandPhase(overlay)).phase;
}

export async function expectHandPhase(overlay: Locator, phase: Exclude<HandPhase, "">) {
  await expect
    .poll(async () => getHandPhase(overlay), { timeout: 30_000 })
    .toBe(phase);
}

async function readDataPhase(overlay: Locator): Promise<string> {
  return (await readHandPhase(overlay)).phase;
}

async function readPhaseTag(overlay: Locator) {
  return (await readHandPhase(overlay)).labels;
}

/** Close live table overlay so session setup controls are clickable. */
export async function ensureTableOverlayClosed(page: Page) {
  const overlay = page.locator("#table-play-overlay");
  if (!(await overlay.isVisible().catch(() => false))) return;
  const close = page.locator("#close-table-play");
  if (await close.isVisible().catch(() => false)) {
    await close.click({ force: true });
  } else {
    await page.keyboard.press("Escape");
  }
  await expect(overlay).toBeHidden({ timeout: 15_000 });
}

async function isDrawPhaseReady(overlay: Locator) {
  const { phase } = await readHandPhase(overlay);
  if (phase === "draw") return true;
  if (await overlay.getByTestId("trump-button").isVisible().catch(() => false)) return true;
  return false;
}

async function isPlayPhaseReady(overlay: Locator) {
  return (await readHandPhase(overlay)).phase === "play";
}

async function isRevealPhaseActive(overlay: Locator) {
  return (await readHandPhase(overlay)).phase === "reveal";
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
  const passDraw = overlay.getByTestId("pass-draw-button");
  const drawBtn = overlay.getByTestId("draw-button");

  const hasPass = await passDraw.isVisible().catch(() => false);
  const hasDraw = await drawBtn.isVisible().catch(() => false);
  if (!hasPass && !hasDraw) return false;
  if ((await getHandPhase(overlay)) === "play") return false;

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

/** Pass hero draw turns and wait for bots until trick play begins. */
export async function advanceThroughDrawPhase(page: Page) {
  const overlay = tableOverlay(page);
  const deadline = Date.now() + 180_000;
  const lastActionClick = { at: 0 };
  let lastDrawProgressAt = Date.now();

  while (Date.now() < deadline) {
    if (await isPlayPhaseReady(overlay)) return;

    const { phase: dataPhase } = await readHandPhase(overlay);
    const phaseBefore = dataPhase;

    if (await tryPassDraw(page, overlay, lastActionClick)) {
      lastDrawProgressAt = Date.now();
      continue;
    }

    const feedback =
      (await overlay.getByTestId("feedback-banner").textContent().catch(() => "")) ?? "";
    assertNoHandFailure(overlay, feedback);

    const { phase: phaseAfter } = await readHandPhase(overlay);
    if (phaseAfter === "play") return;
    if (phaseAfter !== phaseBefore) {
      lastDrawProgressAt = Date.now();
    }

    const waitMs =
      dataPhase === "draw" && Date.now() - lastDrawProgressAt > 4_000 ? 1000 : 400;
    await page.waitForTimeout(waitMs);
  }

  const { phase, labels } = await readHandPhase(overlay);
  throw new Error(
    `Play phase did not start within 180s (last phase: ${labels || phase || "unknown"})`,
  );
}

/** Wait until the live hand is in trick play (draw complete). */
export async function waitForPlayPhase(page: Page) {
  await waitForDrawPhase(page);
  await advanceThroughDrawPhase(page);

  const overlay = tableOverlay(page);
  await expectHandPhase(overlay, "play");
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
