import { test, expect } from "./fixtures/consoleGuard";
import {
  expectMobileOverlayGameplayFits,
  openOverlayFixture,
  overlayHorizontalOverflow,
  readOverlayGameplayMetrics,
} from "./helpers/overlayLayout";
import { openTableFlowsFixture, advanceFixture, readFixtureState } from "./helpers/tableFlows";
import {
  YOUR_TURN_FIRST_MS,
  YOUR_TURN_REPEAT_MS,
  YOUR_TURN_EXIT_MS,
  YOUR_TURN_HOLD_MS,
  YOUR_TURN_POP_MS,
} from "../src/table/hooks/useYourTurnAttention";

const PORTRAIT = { width: 390, height: 844 };
const LANDSCAPE = { width: 844, height: 390 };

test.describe("1 — Mobile layout / orientation", () => {
  test("portrait has no horizontal panning; landscape expands; portrait returns cleanly", async ({
    page,
  }) => {
    await page.setViewportSize(PORTRAIT);
    await openOverlayFixture(page, { players: 4, bots: 1, phase: "draw" });
    expect(await overlayHorizontalOverflow(page)).toBeLessThanOrEqual(2);

    const portraitBefore = await readOverlayGameplayMetrics(page);
    expect(portraitBefore?.layoutMode).toBe("portrait");

    await page.setViewportSize(LANDSCAPE);
    await page.waitForTimeout(200);
    const landscape = await readOverlayGameplayMetrics(page);
    expect(landscape?.landscapeRow).toBe(true);
    expect(landscape!.gameplayWidthRatio).toBeGreaterThan(0.82);
    expect(landscape!.stageW).toBeGreaterThan(180);

    await page.setViewportSize(PORTRAIT);
    await page.waitForTimeout(200);
    await expectMobileOverlayGameplayFits(page, { portrait: true });
    expect(await overlayHorizontalOverflow(page)).toBeLessThanOrEqual(2);
  });
});

test.describe("2 — Room / session flow", () => {
  test("decision only on initial room entry; auto-in on next hand; leaving excludes player", async ({
    page,
  }) => {
    await openTableFlowsFixture(page, {
      scenario: "room-session",
      handNumber: 1,
      phase: "decision",
    });
    await expect(page.getByTestId("seat-bottom-self").getByTestId("seat-opt-in")).toBeVisible();
    await page.getByTestId("seat-bottom-self").getByTestId("seat-opt-in").click();
    await expect(page.getByTestId("feedback-banner")).toContainText(/in|hand/i);

    await advanceFixture(page, "nextHand");
    await page.waitForTimeout(150);
    await expect(page.getByTestId("seat-bottom-self").getByTestId("seat-opt-in")).toHaveCount(0);
    const mid = await readFixtureState(page);
    expect(mid?.roomOptedIn).toBe(true);
    expect(mid?.enrolledIds ?? mid?.playingIds).toContain("p0");

    await advanceFixture(page, "leaveRoom");
    await page.waitForTimeout(150);
    await expect(page.getByTestId("seat-bottom-self").getByTestId("seat-opt-in")).toHaveCount(0);
    const afterLeave = await readFixtureState(page);
    expect(afterLeave?.inRoom).toBe(false);
    expect(afterLeave?.enrolledIds).not.toContain("p0");
  });
});

test.describe("3 — Bankroll / ante / broke-out", () => {
  test("ante reduces bankroll and grows pot; broke player is out", async ({ page }) => {
    await openTableFlowsFixture(page, { scenario: "bankroll", phase: "draw" });
    const selfStack = page.getByTestId("seat-bottom-self").locator(".bseat__stack");
    await expect(selfStack).toContainText("$20");

    await advanceFixture(page, "postAnte");
    await page.waitForTimeout(100);
    await expect(selfStack).toContainText("$19");
    await expect(page.getByTestId("pot-display")).toContainText("$");

    await advanceFixture(page, "broke", { playerId: "p2" });
    await page.waitForTimeout(100);
    const brokeSeat = page.locator(".bseat").filter({ hasText: "Bot 2" });
    await expect(brokeSeat.locator(".bseat__out-tag")).toBeVisible();
    await expect(brokeSeat).toHaveClass(/bseat--out/);
  });
});

test.describe("4 — Pass / draw decision", () => {
  test("decision pass vs draw stand pat are distinct", async ({ page }) => {
    await openTableFlowsFixture(page, { scenario: "pass-draw", phase: "decision" });
    await expect(page.getByTestId("seat-bottom-self").getByTestId("seat-pass-enrollment")).toBeVisible();
    await page.getByTestId("seat-bottom-self").getByTestId("seat-pass-enrollment").click();
    await expect(page.getByTestId("feedback-banner")).toContainText(/passed this hand/i);
    await expect(page.getByTestId("seat-bottom-self")).toHaveClass(/bseat--sat-out/);
    await expect(page.getByTestId("seat-bottom-self").locator(".bseat__out-tag")).toHaveCount(0);

    await openTableFlowsFixture(page, { scenario: "pass-draw", phase: "draw" });
    await expect(page.getByTestId("pass-draw-button")).toBeVisible();
    await page.getByTestId("pass-draw-button").click();
    await expect(page.getByTestId("feedback-banner")).toContainText(/standing pat/i);
    const afterPat = await readFixtureState(page);
    expect(afterPat?.passedDraw).toBe(true);
  });
});

test.describe("5 — Dealer trump presentation", () => {
  test("bot dealer shows red hole-card fan; center trump visible", async ({ page }) => {
    await openTableFlowsFixture(page, { scenario: "dealer-trump", phase: "draw" });
    const dealerSeat = page.locator(".bseat--dealer");
    await expect(dealerSeat).toBeAttached();

    await expect(dealerSeat.locator(".bseat__hole-cards--crown")).toBeAttached({ timeout: 3_000 });
    await expect(dealerSeat.locator(".bseat__hole-card")).toHaveCount(5);
    await expect(page.getByTestId("trump-button")).toBeVisible({ timeout: 3_000 });
  });
});

test.describe("6 — Turn reminder cadence", () => {
  test("Your Turn appears only for local player on 15s + repeat cadence", async ({ page }) => {
    await page.clock.install({ time: new Date("2026-06-19T12:00:00Z") });
    await openTableFlowsFixture(page, { scenario: "your-turn", phase: "play" });

    await expect(page.getByTestId("your-turn-attention")).toHaveCount(0);

    await page.clock.runFor(YOUR_TURN_FIRST_MS);
    await expect(page.getByTestId("your-turn-attention")).toBeVisible();
    await expect(page.getByTestId("your-turn-attention")).toContainText("Your Turn");

    const cueMs = YOUR_TURN_POP_MS + YOUR_TURN_HOLD_MS + YOUR_TURN_EXIT_MS;
    await page.clock.runFor(cueMs);
    await expect(page.getByTestId("your-turn-attention")).toHaveCount(0);

    await page.clock.runFor(YOUR_TURN_REPEAT_MS[0]!);
    await expect(page.getByTestId("your-turn-attention")).toBeVisible();

    await page.getByTestId("play-button").first().evaluate((el) => (el as HTMLButtonElement).click());
    await page.clock.runFor(500);
    await expect(page.getByTestId("your-turn-attention")).toHaveCount(0);
  });
});

test.describe("7 — Bourré result animation", () => {
  test("only the bourré player sees the brief result animation", async ({ page }) => {
    await openTableFlowsFixture(page, { scenario: "bourre", phase: "play" });
    await advanceFixture(page, "bourre");
    await page.waitForTimeout(100);

    await expect(page.getByTestId("seat-bottom-self")).toHaveClass(/bseat--bourre-pulse/);
    await expect(page.locator(".bseat").filter({ hasText: "Bot 1" })).not.toHaveClass(/bseat--bourre-pulse/);

    await page.waitForTimeout(1500);
    await expect(page.getByTestId("seat-bottom-self")).not.toHaveClass(/bseat--bourre-pulse/);
  });
});

test.describe("8 — Zero-bankroll rules", () => {
  test("zero bankroll marks player out and excludes from hand", async ({ page }) => {
    await openTableFlowsFixture(page, { scenario: "zero-bankroll", phase: "decision" });
    await advanceFixture(page, "broke", { playerId: "p0" });
    await page.waitForTimeout(100);

    const self = page.getByTestId("seat-bottom-self");
    await expect(self).toHaveClass(/bseat--out/);
    await expect(self.locator(".bseat__out-tag")).toBeVisible();
    await expect(page.getByTestId("seat-bottom-self").getByTestId("seat-opt-in")).toHaveCount(0);
  });
});

test.describe("9 — Live bankroll display", () => {
  test("bankroll updates immediately when ante is posted", async ({ page }) => {
    await openTableFlowsFixture(page, { scenario: "live-bankroll", phase: "draw" });
    const stack = page.getByTestId("seat-bottom-self").locator(".bseat__stack");
    const before = await stack.textContent();
    await advanceFixture(page, "postAnte");
    await page.waitForTimeout(50);
    const after = await stack.textContent();
    expect(before).not.toEqual(after);
    expect(after).toMatch(/\$19/);
  });
});

test.describe("10 — Pass/fold state isolation", () => {
  test("pass/fold state is separate from broke/out state", async ({ page }) => {
    await openTableFlowsFixture(page, { scenario: "pass-fold", phase: "decision" });
    await page.getByTestId("seat-bottom-self").getByTestId("seat-pass-enrollment").click();
    await expect(page.getByTestId("seat-bottom-self")).toHaveClass(/bseat--sat-out/);
    await expect(page.getByTestId("seat-bottom-self").locator(".bseat__out-tag")).toHaveCount(0);

    await advanceFixture(page, "broke", { playerId: "p1" });
    await page.waitForTimeout(100);
    const bot = page.locator(".bseat").filter({ hasText: "Bot 1" });
    await expect(bot).toHaveClass(/bseat--out/);
    await expect(bot.locator(".bseat__out-tag")).toBeVisible();
    await expect(bot).not.toHaveClass(/bseat--sat-out/);
  });
});
