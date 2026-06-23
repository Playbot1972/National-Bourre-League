import { test, expect } from "./fixtures/consoleGuard";
import { horizontalOverflow, isElementInViewport, openTableFixture } from "./helpers/tableSmoke";

test.describe("Bourré table smoke — desktop", () => {
  test("app home loads without runtime crash", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    await expect(page.locator("#app-version")).toContainText(/^v\d+\.\d{2}\.\d{2}$/);
  });

  test("table fixture renders felt, pot, and seats", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 1, phase: "decision" });

    await expect(page.getByTestId("table-root")).toBeVisible();
    await expect(page.getByTestId("table-felt")).toBeVisible();
    await expect(page.getByTestId("pot-display")).toBeVisible();
    await expect(page.getByTestId("seat-bottom-self").getByTestId("seat-opt-in")).toBeVisible();

    await expect(page.locator(".bseat")).toHaveCount(4);
    await expect(page.locator(".bseat__avatar").first()).toBeVisible();
    for (const id of ["seat-top", "seat-left", "seat-right", "seat-bottom-self"] as const) {
      await expect(page.getByTestId(id)).toBeAttached();
    }

    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(2);
  });

  test("seat metadata hidden by default and reveals on hover", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 1, phase: "decision", tick: false });

    const selfSeat = page.getByTestId("seat-bottom-self");
    const selfMeta = selfSeat.getByTestId("seat-meta-panel");
    await expect(selfMeta).toBeHidden();
    await selfSeat.locator(".bseat__avatar").hover();
    await expect(selfMeta).toBeVisible();
    await expect(selfMeta.locator(".bhud__pill-label", { hasText: "Ape" })).toBeVisible();

    const opponent = page.getByTestId("seat-left");
    const opponentMeta = opponent.getByTestId("seat-meta-panel");
    await expect(opponentMeta).toBeHidden();
    await opponent.locator(".bseat__avatar").hover();
    await expect(opponentMeta).toBeVisible();
  });

  test("ante value appears once on the felt", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 1, phase: "decision", tick: false });

    await expect(page.getByTestId("ante-display")).toBeVisible();
    await expect(page.getByTestId("ante-display")).toContainText("$1");
    await expect(page.getByTestId("table-root").getByText(/\(\$/)).toHaveCount(0);
  });

  test("decision I'm in is clickable and shows feedback", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 0, phase: "decision", tick: false });

    const imIn = page.getByTestId("seat-bottom-self").getByTestId("seat-opt-in");
    await expect(imIn).toBeVisible();
    await expect(imIn).toBeEnabled();
    await imIn.evaluate((el) => (el as HTMLButtonElement).click());

    await expect(page.getByTestId("feedback-banner")).toBeVisible();
    await expect(page.getByTestId("feedback-banner")).toContainText(/in|hand/i);
  });

  test("settings gear opens and closes the panel", async ({ page }) => {
    await openTableFixture(page, { phase: "draw" });

    await page.getByTestId("settings-button").click();
    await expect(page.getByTestId("settings-panel")).toBeVisible();

    await page.getByRole("button", { name: "Close" }).first().click();
    await expect(page.getByTestId("settings-panel")).toBeHidden();
  });

  test("draw phase exposes trump, hero hand, and draw controls", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 1, phase: "draw", tick: false });

    await expect(page.getByTestId("trump-button")).toBeVisible();
    await expect(page.getByTestId("hero-hand")).toBeVisible();
    await expect(page.getByTestId("draw-button")).toBeVisible();
    await expect(page.getByTestId("draw-button")).toBeEnabled();

    await page.getByTestId("draw-button").click();
    await expect(page.getByTestId("feedback-banner")).toContainText(/stand pat|drew|draw/i);
  });

  test("play phase exposes clickable play cards", async ({ page }) => {
    await openTableFixture(page, { players: 4, bots: 1, phase: "play", tick: false });

    await expect(page.getByTestId("hero-hand")).toBeVisible();
    const playCard = page.getByTestId("play-button").first();
    await expect(playCard).toBeVisible();
    await expect(playCard).toBeEnabled();
    await playCard.evaluate((el) => (el as HTMLButtonElement).click());
    await expect(page.getByTestId("feedback-banner")).toContainText(/played|play/i);
  });

  test("hero hand does not stay on loading copy after deal", async ({ page }) => {
    await openTableFixture(page, { phase: "draw", tick: false });

    await expect(page.getByTestId("hero-hand")).toBeVisible();
    await expect(page.getByTestId("hero-hand")).not.toContainText("Loading your cards");
  });

  test("co-win settlement panel renders with vote controls", async ({ page }) => {
    await page.goto("/e2e-fixtures/settlement-cowin?role=cowinner");
    const panel = page.getByTestId("settlement-panel");
    await expect(panel).toBeVisible();
    await expect(page.getByTestId("settlement-headline")).toBeVisible();
    await expect(page.getByTestId("settlement-agree-btn")).toBeEnabled();
    await expect(page.getByTestId("settlement-decline-btn")).toBeEnabled();
  });
});
