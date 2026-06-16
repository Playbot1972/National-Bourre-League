import { test, expect } from "./fixtures/consoleGuard";
import { horizontalOverflow, isElementInViewport, openTableFixture } from "./helpers/tableSmoke";

test.describe("Bourré table smoke — mobile", () => {
  test("table layout fits viewport without horizontal scroll", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 2, phase: "draw", tick: false });
    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(2);
  });

  test("critical controls stay visible and tappable on a phone viewport", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 1, phase: "enrollment", tick: false });

    for (const id of ["table-root", "pot-display", "join-button", "settings-button"] as const) {
      const el = page.getByTestId(id).first();
      await expect(el).toBeVisible();
      expect(await isElementInViewport(page, id)).toBe(true);
    }

    await page.getByTestId("join-button").evaluate((el) => (el as HTMLButtonElement).click());
    await expect(page.getByTestId("feedback-banner")).toBeVisible();
  });

  test("draw phase keeps hero hand and draw button accessible", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 1, phase: "draw", tick: false });

    await expect(page.getByTestId("hero-hand")).toBeVisible();
    const drawBtn = page.getByTestId("draw-button");
    await drawBtn.scrollIntoViewIfNeeded();
    await expect(drawBtn).toBeVisible();
    await drawBtn.click();
    await expect(page.getByTestId("feedback-banner")).toBeVisible();
  });

  test("settings panel opens on mobile without crashing", async ({ page }) => {
    await openTableFixture(page, { phase: "play", tick: false });

    await page.getByTestId("settings-button").click();
    await expect(page.getByTestId("settings-panel")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).first().click();
    await expect(page.getByTestId("settings-panel")).toBeHidden();
  });

  test("settlement panel renders on mobile", async ({ page }) => {
    await page.goto("/e2e-fixtures/settlement-cowin?role=cowinner");
    const panel = page.getByTestId("settlement-panel");
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toBeVisible();
    await expect(page.getByTestId("settlement-agree-btn")).toBeEnabled();
  });
});
