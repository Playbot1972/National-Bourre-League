/**
 * Play Now opens the table on a single click (no second tap required).
 */
import { test, expect } from "@playwright/test";
import { emulatorReady, goToPrivateRooms, signUpHost } from "./helpers/roomFlow";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";

test.describe("Play Now single click", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(180_000);

  test.beforeAll(async () => {
    test.skip(!(await emulatorReady()), "Firebase emulator UI not reachable on :4000");
  });

  test("one Play Now click mounts the live table", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    await signUpHost(page, "Play Now Single Click");
    await goToPrivateRooms(page);

    await page.locator('[data-testid="play-now-mode"] input[value="mixed"]').check();
    const playNow = page.locator('[data-testid="play-now"]');
    await expect(playNow).toBeEnabled({ timeout: 15_000 });

    const clickCount = await playNow.evaluate((el) => {
      let clicks = 0;
      el.addEventListener(
        "click",
        () => {
          clicks += 1;
        },
        { once: false },
      );
      el.click();
      return clicks;
    });

    expect(clickCount).toBe(1);

    const overlay = page.locator("#table-play-overlay");
    await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 90_000 });
    await expect(playNow).not.toHaveAttribute("aria-busy", "true");
  });

  test("partial join code does not disable Play Now", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    await signUpHost(page, "Join Code Partial");
    await goToPrivateRooms(page);

    await page.getByTestId("join-code-input").fill("A");
    const playNow = page.locator('[data-testid="play-now"]');
    await expect(playNow).toBeEnabled();
  });
});
