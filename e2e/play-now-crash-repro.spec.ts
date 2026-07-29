/**
 * Repro: post-success Play Now client crash (pageerror listener).
 * Run: PLAYWRIGHT_EMULATORS=1 npx playwright test e2e/play-now-crash-repro.spec.ts
 */
import { test, expect } from "@playwright/test";
import { goToPrivateRooms } from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

async function signUp(page: import("@playwright/test").Page, label: string) {
  await page.goto("/");
  await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
  await page.locator("#hero-signup").click();
  await expect(page.locator("#auth-modal")).toBeVisible();
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const email = `${slug}-${Date.now()}@example.com`;
  await page.locator("#auth-name").fill(label);
  await page.locator("#auth-email").fill(email);
  await page.locator("#auth-password").fill("test-pass-123456");
  await page.locator("#auth-submit").click();
  await expect(page.locator("#auth-modal")).toBeHidden({ timeout: 30_000 });
}

async function runPlayNow(page: import("@playwright/test").Page, mode: "mixed" | "bots_only") {
  const errors: string[] = [];
  page.on("pageerror", (err) => {
    errors.push(err.message);
    console.error("PAGEERROR:", err.message, err.stack);
  });

  await goToPrivateRooms(page);
  await page.locator(`[data-testid="play-now-mode"] label:has(input[value="${mode}"])`).click();
  const playNow = page.locator('[data-testid="play-now"]');
  await expect(playNow).toBeEnabled({ timeout: 15_000 });
  await playNow.click();

  const overlay = page.locator("#table-play-overlay");
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 120_000 });
  await page.waitForTimeout(3000);

  const indexOfCrash = errors.filter((m) => /indexOf/i.test(m));
  expect(indexOfCrash, `page errors: ${errors.join(" | ")}`).toEqual([]);
}

test.describe("Play Now post-success crash", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1");
  test.setTimeout(180_000);

  test("private mode — no indexOf crash after success", async ({ page, request }) => {
    await request.delete(
      "http://127.0.0.1:9099/emulator/v1/projects/demo-national-bourre-league/accounts",
    );
    await request.delete(
      "http://127.0.0.1:8088/emulator/v1/projects/demo-national-bourre-league/databases/(default)/documents",
    );
    await signUp(page, "PN Private");
    await runPlayNow(page, "mixed");
  });

  test("bots_only mode — no indexOf crash after success", async ({ page, request }) => {
    await request.delete(
      "http://127.0.0.1:9099/emulator/v1/projects/demo-national-bourre-league/accounts",
    );
    await request.delete(
      "http://127.0.0.1:8088/emulator/v1/projects/demo-national-bourre-league/databases/(default)/documents",
    );
    await signUp(page, "PN Bots");
    await runPlayNow(page, "bots_only");
  });
});
