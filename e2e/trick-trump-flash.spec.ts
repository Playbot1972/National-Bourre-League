import { test, expect } from "./fixtures/consoleGuard";
import { CARD_LAND_MS, CARD_REVEAL_STAGGER_MS } from "../src/table/trickTiming";

test.describe("Trick presentation — post-trump flash guard", () => {
  test("keeps trick cards stable when trump upcard clears mid-trick", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trump-trick-flash");
    await expect(page.getByTestId("table-trump-trick-flash-fixture")).toBeVisible({ timeout: 15_000 });

    await expect
      .poll(async () => page.evaluate(() => window.__trumpTrickFixture?.done === true), {
        timeout: 10_000,
      })
      .toBe(true);

    const metrics = await page.evaluate(() => window.__trumpTrickFixture);

    expect(metrics?.maxCardCount).toBeGreaterThanOrEqual(3);
    expect(metrics?.countDrops ?? 0).toBe(0);

    const trickRow = page.getByTestId("trick-row");
    await expect(trickRow).toHaveAttribute("data-trick-card-count", "3");
    await expect(trickRow.locator(".btrick__play .pcard")).toHaveCount(3);

    await page.waitForTimeout(CARD_REVEAL_STAGGER_MS + 200);
    await expect(trickRow.locator(".btrick__play--fly-pending")).toHaveCount(0);
  });

  test("defers trump suit badge until trick cards land after upcard clear", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-trump-trick-flash");
    await expect(page.getByTestId("table-trump-trick-flash-fixture")).toBeVisible({ timeout: 15_000 });

    await page.waitForTimeout(CARD_REVEAL_STAGGER_MS + 400);
    const duringTrick = await page.evaluate(() => ({
      trumpButton: document.querySelectorAll('[data-testid="trump-button"]').length,
      suitReminder: document.querySelectorAll('[data-testid="trump-suit-reminder"]').length,
      trickCards: document.querySelectorAll('[data-testid="trick-row"] .btrick__play .pcard').length,
    }));
    expect(duringTrick.trickCards).toBeGreaterThanOrEqual(1);
    expect(duringTrick.trumpButton + duringTrick.suitReminder).toBeGreaterThanOrEqual(1);

    await expect
      .poll(async () => page.evaluate(() => window.__trumpTrickFixture?.done === true), {
        timeout: 10_000,
      })
      .toBe(true);

    await page.waitForTimeout(CARD_LAND_MS + 300);
    await expect(page.getByTestId("trump-suit-reminder")).toBeVisible();
    await expect(page.getByTestId("trump-button")).toHaveCount(0);
  });
});
