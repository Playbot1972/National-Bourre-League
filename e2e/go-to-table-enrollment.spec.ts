import { test, expect } from "./fixtures/consoleGuard";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

async function emulatorReady(): Promise<boolean> {
  try {
    const res = await fetch("http://127.0.0.1:4000", { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch {
    return false;
  }
}

async function signUpHost(page: import("@playwright/test").Page) {
  await page.locator("#hero-signup").click();
  await expect(page.locator("#auth-modal")).toBeVisible();
  const email = `host-${Date.now()}@example.com`;
  await page.locator("#auth-name").fill("E2E Host");
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill("test-pass-123456");
  await page.locator("#auth-submit").click();
  await expect(page.locator("#auth-modal")).toBeHidden({ timeout: 15_000 });
}

async function createRoom(page: import("@playwright/test").Page) {
  await page.getByRole("link", { name: "Private Rooms", exact: true }).click();
  await expect(page.locator("#view-rooms")).toBeVisible();
  await page.locator("#create-room").click();
  await expect(page.locator("#create-room-modal")).toBeVisible();
  await page.locator("#create-room-name").fill("E2E Go To Table");
  await page.locator("#create-room-form").evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator(".room-detail__title")).toContainText("E2E Go To Table", {
    timeout: 15_000,
  });
}

async function addRobot(page: import("@playwright/test").Page) {
  await page.getByTestId("add-player-robot").check();
  await page.getByTestId("add-player-submit").click();
  await expect(page.getByTestId("roster-entry-robot")).toBeVisible({ timeout: 10_000 });
}

test.describe("Go to Table enrollment (PR #148)", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    await signUpHost(page);
    await createRoom(page);
  });

  test("bots + Go to Table opens Join window with I'm in timer (not Waiting to deal)", async ({
    page,
  }) => {
    await page.locator("#new-session").click({ force: true });
    await expect(page.locator(".session-tab")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.getByTestId("session-add-players")).toBeVisible();

    await addRobot(page);

    const goToTable = page.getByTestId("open-table-play").first();
    await expect(goToTable).toBeEnabled({ timeout: 10_000 });
    await goToTable.click();

    const overlay = page.locator("#table-play-overlay");
    await expect(overlay).toBeVisible({ timeout: 15_000 });
    const table = overlay.getByTestId("table-root");
    await expect(table).toBeVisible({ timeout: 15_000 });
    await expect(overlay.locator(".btable-session__phase-tag")).toContainText(/Join window/i, {
      timeout: 15_000,
    });
    await expect(overlay.locator(".btable-session__phase-tag")).not.toContainText(
      /Waiting to deal/i,
    );
    await expect(overlay.locator(".bseat__enroll-timer")).toContainText(/\d+s/);

    const join = overlay.locator(".bseat__opt-in").first();
    await expect(join).toBeVisible({ timeout: 10_000 });
    await expect(join).toBeEnabled();
    await join.click();
    await expect(overlay.getByTestId("feedback-banner")).toContainText(/joined|in/i, {
      timeout: 10_000,
    });
  });
});
