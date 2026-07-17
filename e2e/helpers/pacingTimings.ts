import { expect, type Locator, type Page } from "@playwright/test";
import {
  BOT_PLAY_DELAY_MAX_MS,
  BOT_PLAY_DELAY_MIN_MS,
} from "../../docs/bot-play-delay.js";
import { CARDS_PER_PLAYER } from "../../src/game/playerOrder";
import {
  ANTE_CHIP_STAGGER_MS,
  ANTE_CHIP_TRAVEL_MS,
  ANTE_POST_HOLD_MS,
  antePresentationScheduleMs,
  ENROLLMENT_SEAT_PULSE_MS,
  TRUMP_REVEAL_HOLD_MS,
} from "../../src/table/handPresentationTiming";
import { POST_TRICK_READ_MS, trickResolutionScheduleMs } from "../../src/table/trickTiming";

/** Mirror src/table/animations/dealPresentationMotion.ts (avoid gsap import in e2e). */
const DEAL_STEP_TRAVEL_MS = 255;
const DEAL_STEP_GAP_MS = 63;
const DEAL_STEP_SETTLE_MS = 50;

export interface PacingEvent {
  type: string;
  at: number;
  [key: string]: unknown;
}

export interface PacingFixtureConfig {
  scenario: string;
  botMinMs: number;
  botMaxMs: number;
  anteChipTravelMs: number;
  enrollmentSeatPulseMs: number;
}

export interface PacingFixtureState {
  config: PacingFixtureConfig;
  events: PacingEvent[];
  done: boolean;
}

export const BOT_PLAY_MIN_MS = BOT_PLAY_DELAY_MIN_MS;
export const BOT_PLAY_MAX_MS = BOT_PLAY_DELAY_MAX_MS;
export const ANTE_CHIP_MS = ANTE_CHIP_TRAVEL_MS;
export const ANTE_STAGGER_MS = ANTE_CHIP_STAGGER_MS;
export const ANTE_POST_HOLD = ANTE_POST_HOLD_MS;
export const TRUMP_HOLD_MS = TRUMP_REVEAL_HOLD_MS;
export const ENROLLMENT_PULSE_MS = ENROLLMENT_SEAT_PULSE_MS;
export const POST_TRICK_READ = POST_TRICK_READ_MS;

/** CI jitter allowance on top of configured minimums. */
export const BOT_PLAY_CI_SLACK_MS = 120;
export const ANTE_DWELL_CI_SLACK_MS = 200;
export const TRUMP_HOLD_CI_SLACK_MS = 250;
export const DEAL_CADENCE_CI_SLACK_MS = 400;
export const ENROLLMENT_STEP_CI_SLACK_MS = 200;
export const SEQUENCING_OVERLAP_MS = 80;

export function anteScheduleMs(playerCount: number): number {
  return antePresentationScheduleMs(playerCount, false);
}

export function sixSeatDealDurationMs(): number {
  const steps = 6 * CARDS_PER_PLAYER;
  return (steps - 1) * DEAL_STEP_GAP_MS + DEAL_STEP_TRAVEL_MS + DEAL_STEP_SETTLE_MS;
}

export function trickResolutionSchedule() {
  return trickResolutionScheduleMs({});
}

export function tablePacingFixtureUrl(scenario: string, extra: Record<string, string> = {}): string {
  const qs = new URLSearchParams({ scenario, ...extra });
  return `/e2e-fixtures/table-pacing?${qs}`;
}

export async function readPacingFixture(page: Page): Promise<PacingFixtureState | null> {
  return page.evaluate(() => window.__tablePacingFixture ?? null);
}

export async function waitForPacingDone(page: Page, timeoutMs = 20_000): Promise<PacingFixtureState> {
  let last: PacingFixtureState | null = null;
  await expect
    .poll(
      async () => {
        last = await readPacingFixture(page);
        return last?.done === true;
      },
      { timeout: timeoutMs },
    )
    .toBe(true);
  return last!;
}

export async function performanceNow(page: Page): Promise<number> {
  return page.evaluate(() => performance.now());
}

export async function activeActorLocator(page: Page): Promise<Locator> {
  return page.locator('.bseat[data-pacing-active-actor="true"]').first();
}

export async function measureRingBeforeSubmit(page: Page): Promise<{
  ringVisibleAt: number | null;
  submitAt: number | null;
  deltaMs: number | null;
}> {
  return page.evaluate(() => {
    const events = window.__tablePacingFixture?.events ?? [];
    const ring = events.find((e) => e.type === "ring-visible");
    const submit = events.find((e) => e.type === "bot-submit");
    const ringAt = ring?.at ?? null;
    const submitAt = submit?.at ?? null;
    return {
      ringVisibleAt: ringAt,
      submitAt,
      deltaMs: ringAt != null && submitAt != null ? submitAt - ringAt : null,
    };
  });
}

export function assertBotDelayInRange(
  delayMs: number,
  config: Pick<PacingFixtureConfig, "botMinMs" | "botMaxMs">,
  label: string,
): void {
  const minAllowed = config.botMinMs - BOT_PLAY_CI_SLACK_MS;
  const maxAllowed = config.botMaxMs + BOT_PLAY_CI_SLACK_MS;
  expect(
    delayMs,
    `${label}: observed ${delayMs.toFixed(1)}ms (expected ${config.botMinMs}–${config.botMaxMs}ms ± slack)`,
  ).toBeGreaterThanOrEqual(minAllowed);
  expect(
    delayMs,
    `${label}: observed ${delayMs.toFixed(1)}ms (expected ${config.botMinMs}–${config.botMaxMs}ms ± slack)`,
  ).toBeLessThanOrEqual(maxAllowed);
}

export function pairDelays(events: PacingEvent[], fromType: string, toType: string): number[] {
  const delays: number[] = [];
  const starts = events.filter((e) => e.type === fromType);
  const ends = events.filter((e) => e.type === toType);
  for (let i = 0; i < Math.min(starts.length, ends.length); i += 1) {
    const start = starts[i];
    const end = ends[i];
    if (start.playerId === end.playerId) {
      delays.push(end.at - start.at);
    }
  }
  return delays;
}
