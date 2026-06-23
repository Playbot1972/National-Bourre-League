import { test, expect } from "./fixtures/consoleGuard";
import {
  advanceRulesFixture,
  expectNoBourreMarkers,
  expectPhaseTag,
  openRulesRegressionFixture,
  readRulesFixtureState,
  tableRoot,
} from "./helpers/rulesRegression";

test.describe("Rules regression — fixture scenarios", () => {
  test.describe("1 — Premature bourré", () => {
    for (const phase of ["draw", "decision", "reveal"] as const) {
      test(`2-player hand in ${phase} does not show bourré before trick play`, async ({ page }) => {
        await openRulesRegressionFixture(page, "premature-bourre", { phase });
        await expectNoBourreMarkers(page);

        const state = await readRulesFixtureState(page);
        expect(state?.recentBourreIds).toEqual([]);
        expect(state?.bourreIds).toEqual([]);

        await expect(page.getByTestId("bourre-result-sting")).toHaveCount(0);
      });
    }
  });

  test.describe("2 — Bourré correctness", () => {
    test("zero-trick stayed-in player is bourré after settlement; passer and winner are not", async ({
      page,
    }) => {
      await openRulesRegressionFixture(page, "bourre-settlement");

      const root = tableRoot(page);
      const selfSeat = root.getByTestId("seat-bottom-self");
      const bourreBotSeat = root.locator(".bseat").filter({ hasText: "Bot 1" });
      const passerSeat = root.locator(".bseat").filter({ hasText: "Bot 2" });

      await expect(selfSeat.getByTestId("bourre-marker-badge")).toHaveCount(0);
      await expect(selfSeat.getByTestId("bourre-pressure-badge")).toHaveCount(0);
      await expect(bourreBotSeat.getByTestId("bourre-marker-badge")).toHaveCount(0);
      await expect(bourreBotSeat.getByTestId("bourre-pressure-badge")).toHaveCount(0);
      await expect(selfSeat.getByLabel("5 tricks won")).toBeVisible();
      await expect(bourreBotSeat.getByLabel("0 tricks won")).toBeVisible();
      await expect(passerSeat).not.toHaveClass(/bseat--in-hand/);

      const state = await readRulesFixtureState(page);
      expect(state?.bourreIds).toEqual(["p1"]);
      expect(state?.recentBourreIds).toEqual(["p1"]);
      expect(state?.declinedIds).toContain("p2");
      expect(state?.bourreIds).not.toContain("p0");
      expect(state?.bourreIds).not.toContain("p2");
    });

    test("bourré pressure appears only on final trick for zero-trick player", async ({ page }) => {
      await openRulesRegressionFixture(page, "premature-bourre", { phase: "play" });
      await advanceRulesFixture(page, "finalTrickRisk");

      const botSeat = tableRoot(page).getByTestId("seat-top");
      await expect(botSeat.getByTestId("bourre-pressure-badge")).toHaveCount(1);
      await expect(botSeat.getByTestId("bourre-marker-badge")).toHaveCount(0);
      await expect(tableRoot(page).getByTestId("seat-bottom-self").getByTestId("bourre-pressure-badge")).toHaveCount(0);
    });
  });

  test.describe("3 — Dealer turned-card draw rule", () => {
    test("dealer can discard revealed trump and trump suit stays locked", async ({ page }) => {
      await openRulesRegressionFixture(page, "dealer-trump-draw");

      await expectPhaseTag(page, /draw/i);
      await expect(page.getByTestId("trump-button")).toHaveCount(0);
      await expect(page.getByTestId("phase-tag-center")).toHaveAttribute("data-phase", "draw");

      const trumpCard = tableRoot(page).getByTestId("hero-hand").locator('[data-card-index="4"]');
      await expect(trumpCard).toBeVisible();
      await expect(trumpCard).toContainText("7");

      await trumpCard.click();
      await expect(tableRoot(page).locator(".hand__slot--draw-selected")).toHaveCount(1);

      await page.getByTestId("draw-button").click();
      await expect(page.getByTestId("feedback-banner")).toContainText(/replacement|drew/i);

      const state = await readRulesFixtureState(page);
      expect(state?.drawDiscardedTrump).toBe(true);
      expect(state?.trumpSuit).toBe("hearts");
      expect(state?.trumpUpcard).toBeNull();
    });
  });

  test.describe("4 — Bourré payment next hand", () => {
    test("bourré player pays replacement only; others pay normal ante", async ({ page }) => {
      await openRulesRegressionFixture(page, "bourre-payment");

      const state = await readRulesFixtureState(page);
      expect(state?.anteBreakdown.contributions.p0).toBe(1);
      expect(state?.anteBreakdown.contributions.p1).toBe(5);
      expect(state?.anteBreakdown.contributions.p2).toBe(1);
      expect(state?.anteBreakdown.antePot).toBe(7);
      expect(state?.carryOverPot).toBe(5);

      await advanceRulesFixture(page, "applyNextHandAntes");
      const after = await readRulesFixtureState(page);
      expect(after?.bankrolls.p0).toBe(18);
      expect(after?.bankrolls.p1).toBe(9);
      expect(after?.bankrolls.p2).toBe(18);
      expect(after?.pot).toBe(7);
    });
  });

  test.describe("5 — Phase order", () => {
    test("phases advance reveal → decision → draw → play without skipping", async ({ page }) => {
      await openRulesRegressionFixture(page, "phase-sequence", { phase: "reveal" });
      await expectPhaseTag(page, /dealing/i);

      await advanceRulesFixture(page, "setPhase", { phase: "decision" });
      await expectPhaseTag(page, /play or pass/i);
      await expect(page.getByTestId("decision-panel")).toBeVisible();

      await page.getByTestId("decision-im-in-button").click();
      await expect(page.getByTestId("feedback-banner")).toContainText(/in/i);

      await advanceRulesFixture(page, "imIn");
      await expectPhaseTag(page, /draw/i);
      await expect(page.getByTestId("draw-button")).toBeVisible();

      await advanceRulesFixture(page, "setPhase", { phase: "play" });
      await expectPhaseTag(page, /trick play/i);
      await expectNoBourreMarkers(page);
    });
  });

  test.describe("6 — Low player count", () => {
    test("two-player fixture reaches draw with both seats in hand", async ({ page }) => {
      await openRulesRegressionFixture(page, "two-player");
      await expectPhaseTag(page, /draw/i);

      await expect(tableRoot(page).locator(".bseat")).toHaveCount(2);
      await expect(tableRoot(page).getByTestId("seat-bottom-self")).toHaveClass(/bseat--in-hand/);
      await expect(tableRoot(page).getByTestId("seat-top")).toHaveClass(/bseat--in-hand/);
      await expectNoBourreMarkers(page);
    });
  });
});
