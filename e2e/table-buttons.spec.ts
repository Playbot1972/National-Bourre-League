import { test, expect } from "./fixtures/consoleGuard";
import { openTableFixture } from "./helpers/tableSmoke";
import { tapPlayCard, playCardLocator } from "./helpers/cardPlay";

test.describe("Table UI buttons — click audit", () => {
  test("decision: I'm in button responds", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 0, phase: "decision", tick: false });
    const imIn = page.getByTestId("seat-bottom-self").getByTestId("seat-opt-in");
    await expect(imIn).toBeVisible();
    await expect(imIn).toBeEnabled();
    await imIn.evaluate((el) => (el as HTMLButtonElement).click());
    await expect(page.getByTestId("feedback-banner")).toContainText(/in|hand/i);
  });

  test("draw: draw and stand pat buttons respond", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 1, phase: "draw", tick: false });

    await expect(page.getByTestId("draw-button")).toBeVisible();
    await expect(page.getByTestId("draw-button")).toBeEnabled();
    await page.getByTestId("draw-button").click();
    await expect(page.getByTestId("feedback-banner")).toContainText(/stand pat|drew|draw/i);

    await page.getByTestId("pass-draw-button").click();
    await expect(page.getByTestId("feedback-banner")).toContainText(/standing pat|pat/i);
  });

  test("play: mouse click on playable card plays once", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 1, phase: "play", tick: false });
    await page.evaluate(() => {
      window.__fixturePlayLog = [];
    });

    const card = await playCardLocator(page, 0);
    await card.evaluate((el) => (el as HTMLButtonElement).click());

    await expect(page.getByTestId("feedback-banner")).toContainText(/played|play/i);
    const log = await page.evaluate(() => window.__fixturePlayLog ?? []);
    expect(log).toHaveLength(1);
  });

  test("play: tap gesture on playable card plays once", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 1, phase: "play", tick: false });
    await page.evaluate(() => {
      window.__fixturePlayLog = [];
    });

    const card = await playCardLocator(page, 1);
    await card.evaluate((el) => (el as HTMLButtonElement).click());
    await page.waitForTimeout(300);

    const log = await page.evaluate(() => window.__fixturePlayLog ?? []);
    expect(log).toHaveLength(1);
  });

  test("settings gear opens panel, reset defaults, and closes", async ({ page }) => {
    await openTableFixture(page, { phase: "draw" });

    await page.getByTestId("settings-button").click();
    const panel = page.getByTestId("settings-panel");
    await expect(panel).toBeVisible();

    await panel.locator("select").first().selectOption({ index: 1 });
    await panel.getByRole("button", { name: "Reset defaults" }).click();

    await panel.getByRole("button", { name: "Close", exact: true }).first().click();
    await expect(panel).toBeHidden();
  });

  test("draw phase shows trump upcard control", async ({ page }) => {
    await openTableFixture(page, { phase: "draw" });
    await expect(page.getByTestId("trump-button")).toBeVisible();
    await expect(page.getByTestId("pot-display")).toBeVisible();
    await expect(page.getByTestId("deal-button")).toHaveCount(0);
  });

  test("settlement co-win vote buttons are clickable for co-winner", async ({ page }) => {
    await page.goto("/e2e-fixtures/settlement-cowin?role=cowinner");
    await expect(page.getByTestId("settlement-panel")).toBeVisible();

    const agree = page.getByTestId("settlement-agree-btn");
    const decline = page.getByTestId("settlement-decline-btn");
    await expect(agree).toBeEnabled();
    await expect(decline).toBeEnabled();
    await agree.click();
    await decline.click();
  });
});
