import { test, expect } from "./fixtures/consoleGuard";
import {
  ANTE_CHIP_MS,
  ANTE_DWELL_CI_SLACK_MS,
  BOT_PLAY_CI_SLACK_MS,
  BOT_PLAY_MAX_MS,
  BOT_PLAY_MIN_MS,
  ENROLLMENT_PULSE_MS,
  ENROLLMENT_STEP_CI_SLACK_MS,
  SEQUENCING_OVERLAP_MS,
  assertBotDelayInRange,
  pairDelays,
  tablePacingFixtureUrl,
  waitForPacingDone,
} from "./helpers/pacingTimings";

test.describe("Table pacing — bot play", () => {
  test("bot ring appears before submit and delay stays within 350–900 ms", async ({ page }) => {
    await page.goto(tablePacingFixtureUrl("bot-play", { rng: "0" }));
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const state = await waitForPacingDone(page);
    expect(state.config.botMinMs).toBe(BOT_PLAY_MIN_MS);
    expect(state.config.botMaxMs).toBe(BOT_PLAY_MAX_MS);

    const eligibleToSubmit = pairDelays(state.events, "bot-eligible", "bot-submit");
    expect(
      eligibleToSubmit.length,
      `expected 3 bot submits, got events: ${JSON.stringify(state.events.map((e) => e.type))}`,
    ).toBeGreaterThanOrEqual(3);

    for (const [i, delayMs] of eligibleToSubmit.entries()) {
      assertBotDelayInRange(delayMs, state.config, `bot turn ${i + 1}`);
      expect(
        delayMs,
        `bot turn ${i + 1}: submit must not be immediate (observed ${delayMs.toFixed(1)}ms)`,
      ).toBeGreaterThan(BOT_PLAY_MIN_MS - BOT_PLAY_CI_SLACK_MS);
    }

    const ringBeforeSubmit = state.events
      .filter((e) => e.type === "ring-visible")
      .map((ring) => {
        const submit = state.events.find(
          (e) => e.type === "bot-submit" && e.playerId === ring.playerId,
        );
        return submit ? submit.at - ring.at : null;
      })
      .filter((d): d is number => d != null);

    expect(ringBeforeSubmit.length).toBeGreaterThanOrEqual(2);
    for (const [i, delta] of ringBeforeSubmit.entries()) {
      expect(
        delta,
        `ring→submit gap ${i + 1}: ${delta.toFixed(1)}ms (ring must lead submit)`,
      ).toBeGreaterThan(0);
    }
  });
});

test.describe("Table pacing — ante reveal", () => {
  test("ante chip animation dwells before clearing (readable, not a jump-cut)", async ({ page }) => {
    await page.goto(tablePacingFixtureUrl("ante-reveal", { players: "4" }));
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const state = await waitForPacingDone(page, 12_000);
    const start = state.events.find((e) => e.type === "fixture-start");
    const anteStart = state.events.find((e) => e.type === "ante-anim-start");
    const anteEnd = state.events.find((e) => e.type === "ante-anim-end");

    expect(start, "fixture-start missing").toBeTruthy();
    expect(anteStart, "ante-anim-start missing — chips never began").toBeTruthy();
    expect(anteEnd, "ante-anim-end missing — ante cleared instantly").toBeTruthy();

    const leadMs = anteStart!.at - start!.at;
    expect(
      leadMs,
      `ante animation lead ${leadMs.toFixed(1)}ms — should not lag past presentation arm`,
    ).toBeLessThan(800);

    const dwellMs = anteEnd!.at - anteStart!.at;
    const minDwell = ANTE_CHIP_MS * 4 - ANTE_DWELL_CI_SLACK_MS;
    expect(
      dwellMs,
      `ante dwell ${dwellMs.toFixed(1)}ms (expected ≥ ${minDwell}ms for 4 seats × ${ANTE_CHIP_MS}ms chip travel)`,
    ).toBeGreaterThanOrEqual(minDwell);

    await expect(page.locator('[data-pacing-ante-active="true"]')).toHaveCount(0);
  });
});

test.describe("Table pacing — enrollment / ante-up sequencing", () => {
  test("seats activate one at a time with ring before commit", async ({ page }) => {
    await page.goto(tablePacingFixtureUrl("enrollment-step"));
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const state = await waitForPacingDone(page, 15_000);
    const actives = state.events.filter((e) => e.type === "seat-active");
    const commits = state.events.filter((e) => e.type === "seat-committed");

    expect(actives.length).toBe(4);
    expect(commits.length).toBe(4);

    for (let i = 1; i < actives.length; i += 1) {
      const gap = actives[i].at - commits[i - 1].at;
      expect(
        gap,
        `seat ${i} became active ${gap.toFixed(1)}ms after prior commit (expected sequential hand-off)`,
      ).toBeGreaterThan(-SEQUENCING_OVERLAP_MS);
    }

    const stepDwells = pairDelays(state.events, "seat-active", "seat-committed");
    for (const [i, dwell] of stepDwells.entries()) {
      expect(
        dwell,
        `seat step ${i + 1} dwell ${dwell.toFixed(1)}ms (expected ≥ ${ENROLLMENT_PULSE_MS}ms pulse)`,
      ).toBeGreaterThanOrEqual(ENROLLMENT_PULSE_MS - ENROLLMENT_STEP_CI_SLACK_MS);
    }

    const activeIds = actives.map((e) => e.playerId);
    expect(new Set(activeIds).size).toBe(4);
  });
});

test.describe("Table pacing — one-at-a-time bot sequencing", () => {
  test("no overlapping bot submits while timers are armed", async ({ page }) => {
    await page.goto(tablePacingFixtureUrl("bot-play", { rng: "0.99" }));
    await expect(page.getByTestId("table-root")).toBeVisible({ timeout: 15_000 });

    const state = await waitForPacingDone(page, 25_000);
    const submits = state.events.filter((e) => e.type === "bot-submit");

    expect(submits.length).toBeGreaterThanOrEqual(3);
    for (let i = 1; i < submits.length; i += 1) {
      const gap = submits[i].at - submits[i - 1].at;
      expect(
        gap,
        `submit ${i} followed ${gap.toFixed(1)}ms after prior (expected one-at-a-time, min ~${BOT_PLAY_MIN_MS}ms)`,
      ).toBeGreaterThan(BOT_PLAY_MIN_MS - BOT_PLAY_CI_SLACK_MS);
    }

    const overlap = await page.evaluate(() => {
      const events = window.__tablePacingFixture?.events ?? [];
      const eligibles = events.filter((e) => e.type === "bot-eligible");
      const submits = events.filter((e) => e.type === "bot-submit");
      for (let i = 0; i < eligibles.length; i += 1) {
        for (let j = i + 1; j < eligibles.length; j += 1) {
          const a = eligibles[i];
          const b = eligibles[j];
          const aEnd = submits.find((s) => s.playerId === a.playerId)?.at ?? a.at;
          const bEnd = submits.find((s) => s.playerId === b.playerId)?.at ?? b.at;
          if (a.at < bEnd && b.at < aEnd) return { a: a.playerId, b: b.playerId };
        }
      }
      return null;
    });
    expect(overlap, `overlapping bot turns detected: ${JSON.stringify(overlap)}`).toBeNull();
  });
});
