import { test, expect } from "./fixtures/consoleGuard";

test.describe("Turn clarity visuals", () => {
  test("decision phase shows Choosing label, active seat glow, and action cue", async ({
    page,
  }) => {
    await page.goto("/e2e-fixtures/table-session?players=4&bots=2&phase=decision");
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    await expect(page.getByTestId("phase-tag")).toHaveText(/choosing/i);
    await expect(page.getByTestId("action-cue")).toContainText(/i'm in or pass/i);

    const selfSeat = page.getByTestId("seat-bottom-self");
    await expect(selfSeat).toHaveClass(/bseat--active-actor/);
    await expect(selfSeat.locator(".bseat__turn-tag")).toContainText(/your turn/i);
    await expect(page.getByTestId("table-root")).toHaveClass(/btable-wrap--has-active-turn/);
  });

  test("play phase does not show immediate Your Turn graphic", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-06-19T12:00:00Z") });
    await page.goto("/e2e-fixtures/table-flows?scenario=your-turn&phase=play");

    await expect(page.getByTestId("your-turn-attention")).toHaveCount(0);
    await expect(page.getByTestId("phase-tag")).toHaveText(/playing/i);
  });

  test("draw phase highlights hero hand on local draw turn", async ({ page }) => {
    await page.goto("/e2e-fixtures/table-session?players=4&bots=0&phase=draw&tick=0");
    await expect(page.getByTestId("hero-hand")).toBeVisible();
    await expect(page.getByTestId("hero-hand")).toHaveClass(/btable-hero--your-turn/);
    await expect(page.getByTestId("draw-button")).toBeVisible();
  });
});
