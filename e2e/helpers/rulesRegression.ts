/**
 * Helpers for the rules-regression fixture tier (`/e2e-fixtures/rules-regression`).
 *
 * These utilities assert table UI + fixture `readState()` snapshots. They do not
 * substitute for `bourre-rules.js` unit tests or a full Firestore hand lifecycle.
 */
import { expect, type Locator, type Page } from "@playwright/test";

export type RulesScenario =
  | "premature-bourre"
  | "bourre-settlement"
  | "dealer-trump-draw"
  | "bourre-payment"
  | "phase-sequence"
  | "two-player";

export interface RulesFixtureState {
  scenario: string;
  phase: string;
  handNumber: number;
  tricksByPlayer: Record<string, number>;
  recentBourreIds: string[];
  /** From bourre-rules.js `bourrePlayerIds()` — authoritative settlement assignment. */
  bourreIds: string[];
  enrolledIds: string[];
  declinedIds: string[];
  bankrolls: Record<string, number>;
  trumpSuit: string | null;
  trumpUpcard: { rank: string; suit: string } | null;
  drawDiscardedTrump: boolean;
  anteBreakdown: {
    postedAntes: Record<string, number>;
    antePot: number;
    contributions: Record<string, number>;
  };
  pot: number;
  carryOverPot: number;
}

export function rulesRegressionFixtureUrl(
  scenario: RulesScenario,
  extras: Record<string, string> = {},
): string {
  const qs = new URLSearchParams({ scenario, ...extras });
  return `/e2e-fixtures/rules-regression?${qs}`;
}

export async function openRulesRegressionFixture(
  page: Page,
  scenario: RulesScenario,
  extras: Record<string, string> = {},
) {
  await page.goto(rulesRegressionFixtureUrl(scenario, extras));
  await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });
}

export async function readRulesFixtureState(page: Page): Promise<RulesFixtureState | null> {
  return page.evaluate(() => window.__rulesRegressionFixture?.readState?.() ?? null);
}

export async function advanceRulesFixture(
  page: Page,
  action: string,
  payload?: Record<string, unknown>,
) {
  await page.evaluate(
    ([act, data]) => window.__rulesRegressionFixture?.advance?.(act, data),
    [action, payload ?? {}] as const,
  );
  await page.waitForTimeout(150);
}

export function tableRoot(page: Page): Locator {
  return page.getByTestId("table-root");
}

export async function expectPhaseTag(page: Page, pattern: RegExp) {
  const tag = page.getByTestId("phase-tag").first();
  await expect(tag).toContainText(pattern);
  await expect(tag).toHaveAttribute("data-phase", /.+/);
}

/**
 * No bourré pressure or settled marker anywhere on the table.
 * Use during pre-settlement phases (draw, decision, reveal, early play).
 */
export async function expectNoBourreMarkers(page: Page) {
  const root = tableRoot(page);
  await expect(root.getByTestId("bourre-marker-badge")).toHaveCount(0);
  await expect(root.getByTestId("bourre-pressure-badge")).toHaveCount(0);
  await expect(root.locator(".bseat--bourre")).toHaveCount(0);
  await expect(root.locator(".bseat--bourre-pressure")).toHaveCount(0);
}

/**
 * Settled bourré badge (`bourre-marker-badge`) — production renders this for `isSelf`
 * only (`CardTable.tsx` gates `bourreAlert`). Opponents after settlement should be
 * checked via `expectOpponentTrickCount` + fixture `bourreIds`, not this badge.
 */
export async function expectNoSettledBourreBadge(seat: Locator) {
  await expect(seat.getByTestId("bourre-marker-badge")).toHaveCount(0);
}

/** Trick-count badge on a seat — valid opponent bourré evidence in fixture/E2E tests. */
export async function expectOpponentTrickCount(seat: Locator, tricks: number) {
  const label = tricks === 1 ? "1 trick won" : `${tricks} tricks won`;
  await expect(seat.getByLabel(label)).toBeVisible();
}

export async function readPotDisplay(page: Page): Promise<string> {
  return (await page.getByTestId("pot-display").locator("dd").textContent())?.trim() ?? "";
}

export async function readAnteDisplay(page: Page): Promise<string> {
  return (await page.getByTestId("ante-display").locator("dd").textContent())?.trim() ?? "";
}

declare global {
  interface Window {
    __rulesRegressionFixture?: {
      readState: () => RulesFixtureState;
      advance: (action: string, payload?: Record<string, unknown>) => void;
    };
  }
}
