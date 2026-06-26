/**
 * Rules regression — fixture tier (deterministic).
 *
 * Mounts real `table-session.js` + `bourre-rules.js` via `/e2e-fixtures/rules-regression`.
 * Does NOT run a Firestore hand lifecycle or bot-driven 5-trick play.
 *
 * Bourré coverage split:
 * - Settlement assignment + payment math → `bourre-rules.js` (see `scripts/bourre-rules.test.mjs`)
 * - Final-trick pressure logic → `src/table/logic.ts` (see `src/table/logic.test.ts`)
 * - This file → table UI reactions to fixture state (phase tags, pressure badges, trick counts)
 *
 * Product note: settled bourré badge (`bourre-marker-badge`) is rendered for `isSelf` only
 * (see `CardTable.tsx`). Opponent bourré after settlement is asserted via `bourreIds` fixture
 * state + trick-count badges — not via a visible opponent settled badge.
 *
 * See `e2e/README.md` § Bourré coverage pyramid.
 */
import { test, expect } from "./fixtures/consoleGuard";
import {
  advanceRulesFixture,
  expectNoBourreMarkers,
  expectNoSettledBourreBadge,
  expectOpponentTrickCount,
  expectPhaseTag,
  openRulesRegressionFixture,
  readRulesFixtureState,
  tableRoot,
} from "./helpers/rulesRegression";

test.describe("Rules regression — fixture (deterministic)", () => {
  test.describe("[fixture UI] premature bourré — no markers before trick play", () => {
    for (const phase of ["draw", "decision", "reveal"] as const) {
      test(`2-player ${phase} phase: no bourré UI before tricks complete`, async ({ page }) => {
        await openRulesRegressionFixture(page, "premature-bourre", { phase });
        await expectNoBourreMarkers(page);

        const state = await readRulesFixtureState(page);
        expect(state?.recentBourreIds).toEqual([]);
        expect(state?.bourreIds).toEqual([]);

        await expect(page.getByTestId("bourre-result-sting")).toHaveCount(0);
      });
    }
  });

  test.describe("[fixture + bourre-rules.js] settlement bourreIds", () => {
    test("assigns bourré to zero-trick stayed-in player only (passer and winner excluded)", async ({
      page,
    }) => {
      await openRulesRegressionFixture(page, "bourre-settlement");

      const root = tableRoot(page);
      const selfSeat = root.getByTestId("seat-bottom-self");
      const bourreBotSeat = root.locator(".bseat").filter({ hasText: "Bot 1" });
      const passerSeat = root.locator(".bseat").filter({ hasText: "Bot 2" });

      // Winner (self): no bourré pressure or settled badge at hand end.
      await expectNoSettledBourreBadge(selfSeat);
      await expect(selfSeat.getByTestId("bourre-pressure-badge")).toHaveCount(0);
      await expectOpponentTrickCount(selfSeat, 5);

      // Opponent with 0 tricks: evidence via trick-count badge, not settled marker (isSelf-only UI).
      await expectNoSettledBourreBadge(bourreBotSeat);
      await expect(bourreBotSeat.getByTestId("bourre-pressure-badge")).toHaveCount(0);
      await expectOpponentTrickCount(bourreBotSeat, 0);

      // Passer was not in the hand.
      await expect(passerSeat).not.toHaveClass(/bseat--in-hand/);

      // Authoritative assignment from bourre-rules.js bourrePlayerIds().
      const state = await readRulesFixtureState(page);
      expect(state?.bourreIds).toEqual(["p1"]);
      expect(state?.recentBourreIds).toEqual(["p1"]);
      expect(state?.declinedIds).toContain("p2");
      expect(state?.bourreIds).not.toContain("p0");
      expect(state?.bourreIds).not.toContain("p2");
    });
  });

  test.describe("[fixture UI] final-trick bourré pressure", () => {
    test("shows pressure badge on 0-trick opponent on trick 5 only (not settled marker)", async ({
      page,
    }) => {
      await openRulesRegressionFixture(page, "premature-bourre", { phase: "play" });
      // 4 tricks played → one trick remains; p1 has 0 tricks (see logic.ts playersAtBourreRisk).
      await advanceRulesFixture(page, "finalTrickRisk");

      const botSeat = tableRoot(page).getByTestId("seat-top");
      await expect(botSeat.getByTestId("bourre-pressure-badge")).toHaveCount(1);
      await expectNoSettledBourreBadge(botSeat);
      await expect(tableRoot(page).getByTestId("seat-bottom-self").getByTestId("bourre-pressure-badge")).toHaveCount(0);
    });
  });

  test.describe("[fixture UI] dealer turned-card draw", () => {
    test("dealer can discard merged trump card; trump suit stays locked", async ({ page }) => {
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

  test.describe("[fixture + bourre-rules.js] bourré payment next hand", () => {
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

  test.describe("[fixture UI] phase order", () => {
    test("reveal → decision → draw → play without skipping or premature bourré", async ({ page }) => {
      await openRulesRegressionFixture(page, "phase-sequence", { phase: "reveal" });
      await expectPhaseTag(page, /dealing/i);

      await advanceRulesFixture(page, "setPhase", { phase: "decision" });
      await expectPhaseTag(page, /choosing/i);
      await expect(page.getByTestId("seat-bottom-self").getByTestId("seat-opt-in")).toBeVisible();

      await page.getByTestId("seat-bottom-self").getByTestId("seat-opt-in").click();
      await expect(page.getByTestId("feedback-banner")).toContainText(/in/i);

      await advanceRulesFixture(page, "imIn");
      await expectPhaseTag(page, /draw/i);
      await expect(page.getByTestId("draw-button")).toBeVisible();

      await advanceRulesFixture(page, "setPhase", { phase: "play" });
      await expectPhaseTag(page, /playing/i);
      await expectNoBourreMarkers(page);
    });
  });

  test.describe("[fixture UI] low player count", () => {
    test("two-player table reaches draw with both seats in hand (not bourré failure state)", async ({
      page,
    }) => {
      await openRulesRegressionFixture(page, "two-player");
      await expectPhaseTag(page, /draw/i);

      await expect(tableRoot(page).locator(".bseat")).toHaveCount(2);
      await expect(tableRoot(page).getByTestId("seat-bottom-self")).toHaveClass(/bseat--in-hand/);
      await expect(tableRoot(page).getByTestId("seat-top")).toHaveClass(/bseat--in-hand/);
      await expectNoBourreMarkers(page);
    });
  });
});
