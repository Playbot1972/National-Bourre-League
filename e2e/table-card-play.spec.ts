import { test, expect } from "./fixtures/consoleGuard";
import { openTableFixture } from "./helpers/tableSmoke";
import {
  fixturePlayLog,
  holdPlayCard,
  nonPlayableCardLocator,
  playCardLocator,
  swipeUpPlayCard,
  tapPlayCard,
} from "./helpers/cardPlay";

test.describe("Bourré card play gestures", () => {
  const useTouch = (projectName: string) => projectName.includes("mobile");

  test.beforeEach(async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 1, phase: "play", tick: false });
    await page.evaluate(() => {
      window.__fixturePlayLog = [];
    });
  });

  test("tap on a playable card plays once", async ({ page }, testInfo) => {
    const touch = useTouch(testInfo.project.name);
    const card = await playCardLocator(page, 0);
    await expect(card).toBeVisible();
    await expect(card).toHaveAttribute("data-playable", "true");

    await tapPlayCard(page, card, { useTouch: touch });

    await expect(page.getByTestId("feedback-banner")).toContainText(/played|play/i);
    const log = await fixturePlayLog(page);
    expect(log).toHaveLength(1);
    expect(log[0]?.index).toBe(0);
  });

  test("press-and-hold on a playable card plays once", async ({ page }, testInfo) => {
    const touch = useTouch(testInfo.project.name);
    const card = await playCardLocator(page, 1);
    await expect(card).toBeVisible();

    await holdPlayCard(page, card, { useTouch: touch });

    await expect(page.getByTestId("feedback-banner")).toContainText(/played|play/i);
    const log = await fixturePlayLog(page);
    expect(log).toHaveLength(1);
    expect(log[0]?.index).toBe(1);
  });

  test("swipe up on a playable card plays once", async ({ page }, testInfo) => {
    const touch = useTouch(testInfo.project.name);
    const card = await playCardLocator(page, 2);
    await expect(card).toBeVisible();

    await swipeUpPlayCard(page, card, { useTouch: touch });

    await expect(page.getByTestId("feedback-banner")).toContainText(/played|play/i);
    const log = await fixturePlayLog(page);
    expect(log).toHaveLength(1);
    expect(log[0]?.index).toBe(2);
  });

  test("non-playable cards do not fire play", async ({ page }, testInfo) => {
    const touch = useTouch(testInfo.project.name);
    const blocked = await nonPlayableCardLocator(page, 3);
    await expect(blocked).toBeVisible();
    await expect(blocked).toHaveAttribute("data-playable", "false");

    await tapPlayCard(page, blocked, { useTouch: touch });
    await holdPlayCard(page, blocked, { useTouch: touch, holdMs: 280 });

    const log = await fixturePlayLog(page);
    expect(log).toHaveLength(0);
    await expect(page.getByTestId("feedback-banner")).toHaveCount(0);
  });

  test("one gesture cannot play the same card twice", async ({ page }, testInfo) => {
    const touch = useTouch(testInfo.project.name);
    const card = await playCardLocator(page, 0);

    await holdPlayCard(page, card, { useTouch: touch, holdMs: 300 });

    const log = await fixturePlayLog(page);
    expect(log).toHaveLength(1);
  });
});
