import { test, expect } from "@playwright/test";

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
  await expect(page.locator("#auth-name")).toBeVisible();
  const email = `host-${Date.now()}@example.com`;
  await page.locator("#auth-name").fill("E2E Host");
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill("test-pass-123456");
  await expect(page.locator("#auth-password")).toHaveValue("test-pass-123456");
  await page.locator("#auth-submit").click();
  await expect(page.locator("#auth-modal")).toBeHidden({ timeout: 15_000 });
}

async function createRoom(page: import("@playwright/test").Page) {
  await page.getByRole("link", { name: "Private Rooms", exact: true }).click();
  await expect(page.locator("#view-rooms")).toBeVisible();
  await page.locator("#create-room").click();
  await expect(page.locator("#create-room-modal")).toBeVisible();
  await page.locator("#create-room-name").fill("E2E Session Room");
  await page.locator("#create-room-form").evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(page.locator(".room-detail__title")).toContainText("E2E Session Room", {
    timeout: 15_000,
  });
}

test.describe("Room ante dropdown and + New session", () => {
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

  test("room ante dropdown keeps selected value after change", async ({ page }) => {
    const roomAnte = page.locator("#room-ante-amount");
    await expect(roomAnte).toBeVisible();
    await roomAnte.selectOption("5");
    await expect(roomAnte).toHaveValue("5");
    await page.waitForTimeout(400);
    await expect(roomAnte).toHaveValue("5");
  });

  test("new session ante dropdown keeps selected value after change", async ({ page }) => {
    const sessionAnte = page.locator("#new-session-stake");
    await expect(sessionAnte).toBeVisible();
    await sessionAnte.selectOption("10");
    await expect(sessionAnte).toHaveValue("10");
    await page.waitForTimeout(400);
    await expect(sessionAnte).toHaveValue("10");
  });

  test("+ New session opens a regional tab after confirm", async ({ page }) => {
    await page.waitForTimeout(300);
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#new-session").click({ force: true });
    await expect(page.locator(".session-tab")).toHaveCount(1, { timeout: 15_000 });
    await expect(page.locator(".session-tab").first()).toContainText(/hand/i);
    await expect(page.getByTestId("session-add-players")).toBeVisible();
    await expect(page.getByTestId("add-player-robot")).toBeVisible();
  });

  test("add robot form is in session panel while waiting for players", async ({ page }) => {
    await page.waitForTimeout(300);
    page.once("dialog", (dialog) => dialog.accept());
    await page.locator("#new-session").click({ force: true });
    await expect(page.getByTestId("session-add-players")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId("add-player-robot")).toBeVisible();
    await page.getByTestId("add-player-robot").check();
    await page.getByTestId("add-player-submit").click();
    await expect(page.locator(".members__role").filter({ hasText: "robot" })).toBeVisible({
      timeout: 15_000,
    });
  });
});
