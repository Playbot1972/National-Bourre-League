import { expect, type Page } from "@playwright/test";

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

export async function readRoomInviteCode(page: Page) {
  const codeEl = page.getByTestId("room-invite-code");
  await expect(codeEl).toBeVisible({ timeout: 15_000 });
  const code = (await codeEl.textContent())?.trim() ?? "";
  expect(code).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
  return code;
}

export async function joinRoomWithCode(page: Page, code: string) {
  await page.getByRole("link", { name: "Private Rooms", exact: true }).click();
  await expect(page.locator("#view-rooms")).toBeVisible();
  await page.getByTestId("join-code-input").fill(code.replace(/\s+/g, ""));
  await page.getByTestId("join-code-submit").click();
}

export async function createRoom(page: Page, name = "E2E Bot Flow Room") {
  await page.getByRole("link", { name: "Private Rooms", exact: true }).click();
  await expect(page.locator("#view-rooms")).toBeVisible();

  const title = page.locator(".room-detail__title");
  const modal = page.locator("#create-room-modal");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    if (await title.filter({ hasText: name }).isVisible().catch(() => false)) return;

    await page.locator("#create-room").click();
    await expect(modal).toBeVisible();
    await page.locator("#create-room-name").fill(name);
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
  await expect(page.getByTestId("session-add-players")).toBeVisible({ timeout: 15_000 });
}

/** Host counts as one seat; add robots until `totalPlayers` are seated. */
export async function addRobotsUntilCount(page: Page, totalPlayers: number) {
  const botsNeeded = Math.max(0, totalPlayers - 1);
  for (let i = 0; i < botsNeeded; i += 1) {
    await page.getByTestId("add-player-robot").check();
    await page.getByTestId("add-player-submit").click();
    await expect(page.locator(".members__role").filter({ hasText: "robot" })).toHaveCount(i + 1, {
      timeout: 15_000,
    });
  }
}

export async function goToTable(page: Page) {
  const goBtn = page.getByTestId("open-table-play").first();
  await expect(goBtn).toBeEnabled({ timeout: 15_000 });
  await goBtn.click();
  const overlay = page.locator("#table-play-overlay");
  await expect(overlay).toBeVisible({ timeout: 15_000 });
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });
}

async function isDrawPhaseReady(overlay: ReturnType<Page["locator"]>) {
  const phaseTag =
    (await overlay.locator(".btable-session__phase-tag").textContent().catch(() => "")) ?? "";
  if (/draw/i.test(phaseTag)) return true;
  if (await overlay.getByTestId("trump-button").isVisible().catch(() => false)) return true;
  if (await overlay.getByTestId("draw-button").isVisible().catch(() => false)) return true;
  if (await overlay.getByTestId("pass-draw-button").isVisible().catch(() => false)) return true;
  const hero = (await overlay.getByTestId("hero-hand").textContent().catch(() => "")) ?? "";
  return /draw round|stand pat|discard/i.test(hero) && !/join window/i.test(hero);
}

/** Click I'm in when shown; wait until draw phase is active (not necessarily hero's draw turn). */
export async function waitForDrawPhase(page: Page) {
  const overlay = page.locator("#table-play-overlay");
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });

  const deadline = Date.now() + 90_000;
  let lastJoinClick = 0;
  while (Date.now() < deadline) {
    if (await isDrawPhaseReady(overlay)) return;

    const join = overlay
      .getByTestId("join-button")
      .or(overlay.getByTestId("seat-opt-in"))
      .first();
    const joinVisible = await join.isVisible().catch(() => false);
    const now = Date.now();
    if (joinVisible && now - lastJoinClick > 2500) {
      await join.click();
      lastJoinClick = now;
      await page.waitForTimeout(800);
      continue;
    }

    const feedback = (await overlay.getByTestId("feedback-banner").textContent().catch(() => "")) ?? "";
    if (/permission|could not/i.test(feedback)) {
      throw new Error(`Enrollment failed: ${feedback}`);
    }
    await page.waitForTimeout(400);
  }
  throw new Error("Draw phase did not start within 90s");
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
