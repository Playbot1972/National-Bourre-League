import { test, expect } from "./fixtures/consoleGuard";
import { CARD_REVEAL_STAGGER_MS } from "../src/table/trickTiming";

test.describe("Trick presentation — rapid multi-bot snapshot churn", () => {
  test("keeps trick cards stable under fast stale snapshots", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-rapid-bot-plays");
    await expect(page.getByTestId("table-rapid-bot-plays-fixture")).toBeVisible({ timeout: 15_000 });

    await expect
      .poll(async () => page.evaluate(() => window.__rapidBotPlaysFixture?.done === true), {
        timeout: 10_000,
      })
      .toBe(true);

    const metrics = await page.evaluate(() => window.__rapidBotPlaysFixture);

    expect(metrics?.maxCardCount).toBeGreaterThanOrEqual(3);
    expect(metrics?.countDrops ?? 0).toBe(0);

    const trickRow = page.getByTestId("trick-row");
    await expect(trickRow).toHaveAttribute("data-trick-card-count", "4");
    await expect(trickRow.locator(".btrick__play .pcard")).toHaveCount(4);

    await page.waitForTimeout(CARD_REVEAL_STAGGER_MS + 200);
    await expect(trickRow.locator(".btrick__play--fly-pending")).toHaveCount(0);
  });
});
