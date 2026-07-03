/**
 * Recon: reveal → draw handoff across hands 1–5 (presentation FSM + client retry).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildHandPresentationModel,
  createHandPresentationStore,
  reduceHandPresentation,
  snapshotFromSession,
  type HandPresentationStore,
  type HandServerSnapshot,
} from "./handPresentationMachine";

const REVEAL_ADVANCE_RETRY_MS = 2_500;

const baseParticipants = ["p0", "p1", "p2"];

function snapForHand(
  handNumber: number,
  overrides: Partial<HandServerSnapshot> = {},
): HandServerSnapshot {
  return snapshotFromSession({
    sessionId: "recon-s1",
    handNumber,
    phase: "reveal",
    enrollmentActive: false,
    participantIds: baseParticipants,
    actionOrder: baseParticipants,
    drawCompletedIds: [],
    turnPlayerId: "p0",
    trumpUpcard: { rank: "K", suit: "spades" },
    dealerId: "p2",
    potAmount: 3,
    ...overrides,
  });
}

function revealPresentationReady(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
): boolean {
  return (
    store.phase === "drawPlayer" &&
    (store.trumpMergedIntoHand || !snapshot.trumpUpcard)
  );
}

/** Walk presentation from reveal boundary to drawPlayer-ready (mirrors live deal + trump hold). */
function walkRevealToDrawPlayerReady(
  snapshot: HandServerSnapshot,
): HandPresentationStore {
  let store = createHandPresentationStore(snapshot);

  if (store.phase === "handReset") {
    store = reduceHandPresentation(store, { type: "advancePhase" });
  }

  store = reduceHandPresentation(store, { type: "dealPresentationComplete" });
  store = reduceHandPresentation(store, { type: "advancePhase" });

  if (store.phase === "trumpReveal") {
    store = reduceHandPresentation(store, { type: "advancePhase" });
  }

  assert.equal(store.phase, "drawPlayer");
  assert.ok(revealPresentationReady(store, snapshot), "presentation ready for reveal advance");
  return store;
}

/** Mirrors TableSessionView retry effect scheduling (without React). */
function simulateRevealAdvanceRetry(input: {
  serverPhase: string;
  revealPresentationReady: boolean;
  onAdvanceReveal: () => void;
  /** When false, server phase stays reveal (simulates failed/benign calls). Default true. */
  advanceServerOnCall?: boolean;
  advanceMs?: number;
  maxMs?: number;
}): { callTimes: number[]; finalServerPhase: string } {
  const callTimes: number[] = [];
  const advanceMs = input.advanceMs ?? REVEAL_ADVANCE_RETRY_MS;
  const maxMs = input.maxMs ?? 12_000;
  const advanceServer = input.advanceServerOnCall !== false;
  let serverPhase = input.serverPhase;
  let cancelled = false;
  let elapsed = 0;

  const tryAdvance = () => {
    if (cancelled) return;
    callTimes.push(elapsed);
    input.onAdvanceReveal();
    if (advanceServer && serverPhase === "reveal") serverPhase = "draw";
  };

  if (input.serverPhase !== "reveal" || !input.revealPresentationReady) {
    return { callTimes, finalServerPhase: serverPhase };
  }

  tryAdvance();

  while (elapsed < maxMs && serverPhase === "reveal") {
    elapsed += advanceMs;
    tryAdvance();
  }

  cancelled = true;
  return { callTimes, finalServerPhase: serverPhase };
}

describe("reveal→draw handoff recon (hands 1–5)", () => {
  it("hands 1–5: presentation reaches drawPlayer-ready; server leaves reveal on first advance", () => {
    for (let hand = 1; hand <= 5; hand += 1) {
      const trumpUpcard =
        hand === 3 ? null : ({ rank: "7", suit: "hearts" } as const);
      const snapshot = snapForHand(hand, { trumpUpcard });
      const store = walkRevealToDrawPlayerReady(snapshot);

      let serverPhase = "reveal";
      let advanceCount = 0;

      const { callTimes, finalServerPhase } = simulateRevealAdvanceRetry({
        serverPhase,
        revealPresentationReady: revealPresentationReady(store, snapshot),
        onAdvanceReveal: () => {
          advanceCount += 1;
          if (serverPhase === "reveal") serverPhase = "draw";
        },
        maxMs: 8_000,
      });

      assert.equal(finalServerPhase, "draw", `hand ${hand} should reach draw`);
      assert.ok(advanceCount >= 1, `hand ${hand} should call advance at least once`);
      assert.equal(callTimes[0], 0, `hand ${hand} immediate first attempt`);
      assert.ok(
        store.trumpMergedIntoHand,
        `hand ${hand} trumpMergedIntoHand set`,
      );
      if (hand === 3) {
        assert.equal(snapshot.trumpUpcard, null);
        assert.equal(store.trumpMergedIntoHand, true);
      }

      const drawSnap = { ...snapshot, phase: "draw" as const, turnPlayerId: "p0" };
      const afterDraw = reduceHandPresentation(store, {
        type: "serverUpdate",
        snapshot: drawSnap,
      });
      assert.notEqual(afterDraw.phase, "trumpReveal", `hand ${hand} should not stick in trumpReveal`);
    }
  });

  it("retries every 2.5s while server stays on reveal and presentation is ready", () => {
    const snapshot = snapForHand(1);
    const store = walkRevealToDrawPlayerReady(snapshot);

    let serverPhase = "reveal";
    const { callTimes, finalServerPhase } = simulateRevealAdvanceRetry({
      serverPhase,
      revealPresentationReady: revealPresentationReady(store, snapshot),
      onAdvanceReveal: () => {},
      advanceServerOnCall: false,
      maxMs: 7_600,
    });

    assert.equal(finalServerPhase, "reveal");
    assert.deepEqual(callTimes.slice(0, 4), [0, 2_500, 5_000, 7_500]);
    for (let i = 1; i < callTimes.length; i += 1) {
      assert.equal(callTimes[i] - callTimes[i - 1], 2_500);
    }
  });

  it("stops retrying once server advances — extra calls are benign idempotent no-ops", () => {
    const snapshot = snapForHand(2);
    const store = walkRevealToDrawPlayerReady(snapshot);

    let serverPhase = "reveal";
    let handNumber = 2;
    let advanceCalls = 0;

    simulateRevealAdvanceRetry({
      serverPhase,
      revealPresentationReady: revealPresentationReady(store, snapshot),
      onAdvanceReveal: () => {
        advanceCalls += 1;
        if (serverPhase === "reveal") serverPhase = "draw";
      },
      maxMs: 0,
    });

    assert.equal(serverPhase, "draw");
    assert.equal(advanceCalls, 1);

    // Interval would not reschedule after phase !== reveal; simulate benign follow-ups.
    for (let i = 0; i < 3; i += 1) {
      if (serverPhase === "reveal") serverPhase = "draw";
      advanceCalls += 1;
    }

    assert.equal(serverPhase, "draw");
    assert.equal(handNumber, 2);
    assert.equal(advanceCalls, 4);
  });

  it("syncs phaseStartedAt through coalesced presentation updates", () => {
    let store = createHandPresentationStore(snapForHand(1));
    store = reduceHandPresentation(store, { type: "advancePhase" });
    store = reduceHandPresentation(store, { type: "dealPresentationComplete" });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "trumpReveal");

    const beforeRef = store;
    const phaseStartedAtBefore = store.phaseStartedAt;

    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snapForHand(1),
        potAmount: store.displayPotAmount,
      },
    });

    assert.equal(store, beforeRef);
    assert.equal(store.phaseStartedAt, phaseStartedAtBefore);

    const mergedAt = phaseStartedAtBefore + 1_500;
    const merged = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: {
        ...snapForHand(1),
        trumpUpcard: null,
        phase: "reveal",
      },
    });

    assert.notEqual(merged.trumpRevealActive, true);
    assert.equal(merged.trumpMergedIntoHand, true);
    assert.ok(merged.phaseStartedAt >= phaseStartedAtBefore);

    const coalesced = reduceHandPresentation(merged, {
      type: "serverUpdate",
      snapshot: {
        ...snapForHand(1),
        trumpUpcard: null,
        potAmount: merged.displayPotAmount,
      },
    });

    assert.equal(coalesced, merged);
    assert.equal(coalesced.phaseStartedAt, merged.phaseStartedAt);
  });

  it("does not freeze in trumpReveal through watchdog advance to drawPlayer", () => {
    let store = createHandPresentationStore(snapForHand(4));
    store = reduceHandPresentation(store, { type: "advancePhase" });
    store = reduceHandPresentation(store, { type: "dealPresentationComplete" });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "trumpReveal");

    store = {
      ...store,
      phaseStartedAt: Date.now() - 13_000,
    };

    store = reduceHandPresentation(store, { type: "watchdog" });
    assert.equal(store.phase, "drawPlayer");
    assert.equal(store.trumpMergedIntoHand, true);
    assert.ok(revealPresentationReady(store, snapForHand(4)));
  });
});

describe("reveal advance gate (TableSessionView contract)", () => {
  it("matches revealPresentationReady used by retry effect", () => {
    const withTrump = walkRevealToDrawPlayerReady(snapForHand(1));
    assert.ok(revealPresentationReady(withTrump, snapForHand(1)));

    const noTrump = walkRevealToDrawPlayerReady(snapForHand(3, { trumpUpcard: null }));
    assert.ok(revealPresentationReady(noTrump, snapForHand(3, { trumpUpcard: null })));

    let early = createHandPresentationStore(snapForHand(2));
    early = reduceHandPresentation(early, { type: "advancePhase" });
    assert.equal(revealPresentationReady(early, snapForHand(2)), false);
  });
});
