/**
 * Recon: reveal → draw handoff across hands 1–5 (presentation FSM + client retry).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createHandPresentationStore,
  reduceHandPresentation,
  snapshotFromSession,
  type HandPresentationStore,
  type HandServerSnapshot,
} from "./handPresentationMachine";
import {
  ANTE_DEAL_STALL_MS,
  HAND_RESET_MS,
  TRUMP_REVEAL_HOLD_MS,
} from "./handPresentationTiming";
import {
  revealPresentationReady,
  traceRevealHandoffState,
  type RevealHandoffTrace,
} from "./revealHandoffTrace";

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

function settleHandToNextHandReset(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
): HandPresentationStore {
  let next = reduceHandPresentation(store, {
    type: "serverUpdate",
    snapshot: { ...snapshot, phase: "play", handComplete: false },
  });
  next = reduceHandPresentation(next, {
    type: "serverUpdate",
    snapshot: { ...snapshot, phase: "play", handComplete: true },
  });
  next = reduceHandPresentation(next, { type: "tryBeginHandSettle" });
  while (next.phase === "settle") {
    next = reduceHandPresentation(next, { type: "advancePhase" });
  }
  assert.equal(next.phase, "nextHandReset");
  return next;
}

function openNextHandReveal(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
): HandPresentationStore {
  let next = reduceHandPresentation(store, {
    type: "serverUpdate",
    snapshot,
  });
  if (next.phase === "handReset") {
    next = reduceHandPresentation(next, { type: "advancePhase" });
  }
  return next;
}

/** Mirrors TableSessionView retry effect scheduling (without React). */
function simulateRevealAdvanceRetry(input: {
  serverPhase: string;
  handNumber: number;
  revealPresentationReady: boolean;
  onAdvanceReveal: () => void;
  advanceServerOnCall?: boolean;
  advanceMs?: number;
  maxMs?: number;
}): { callTimes: number[]; finalServerPhase: string; attemptCount: number } {
  const callTimes: number[] = [];
  const advanceMs = input.advanceMs ?? REVEAL_ADVANCE_RETRY_MS;
  const maxMs = input.maxMs ?? 12_000;
  const advanceServer = input.advanceServerOnCall !== false;
  let serverPhase = input.serverPhase;
  let attemptCount = 0;
  let cancelled = false;
  let elapsed = 0;

  const tryAdvance = () => {
    if (cancelled) return;
    callTimes.push(elapsed);
    attemptCount += 1;
    input.onAdvanceReveal();
    if (advanceServer && serverPhase === "reveal") serverPhase = "draw";
  };

  if (input.serverPhase !== "reveal" || !input.revealPresentationReady) {
    return { callTimes, finalServerPhase: serverPhase, attemptCount };
  }

  tryAdvance();

  while (elapsed < maxMs && serverPhase === "reveal") {
    elapsed += advanceMs;
    tryAdvance();
  }

  cancelled = true;
  return { callTimes, finalServerPhase: serverPhase, attemptCount };
}

describe("reveal→draw handoff recon (hands 1–5)", () => {
  it("hands 1–5: repeated settlement→reveal resets flags and reaches drawPlayer-ready", () => {
    const traces: RevealHandoffTrace[] = [];
    let store = createHandPresentationStore(snapForHand(1));

    for (let hand = 1; hand <= 5; hand += 1) {
      const trumpUpcard =
        hand === 3 ? null : ({ rank: String(hand), suit: "hearts" } as const);
      const snapshot = snapForHand(hand, { trumpUpcard, turnPlayerId: "p0" });

      if (hand === 1) {
        store = openNextHandReveal(store, snapshot);
      } else {
        store = settleHandToNextHandReset(store, snapForHand(hand - 1, { phase: "play" }));
        store = openNextHandReveal(store, snapshot);
      }

      assert.equal(store.handNumber, hand, `hand ${hand} store handNumber`);
      assert.equal(store.phase, "ante", `hand ${hand} starts ante after handReset`);
      assert.equal(store.trumpMergedIntoHand, false, `hand ${hand} trumpMergedIntoHand reset`);
      assert.equal(store.dealPresentationComplete, false, `hand ${hand} dealPresentationComplete reset`);
      assert.ok(store.phaseStartedAt > 0, `hand ${hand} phaseStartedAt set`);

      store = walkRevealToDrawPlayerReady(snapshot);
      traces.push(traceRevealHandoffState(store, snapshot));

      const ready = revealPresentationReady(store, snapshot);
      assert.ok(ready, `hand ${hand} revealPresentationReady`);

      const { finalServerPhase, attemptCount } = simulateRevealAdvanceRetry({
        serverPhase: "reveal",
        handNumber: hand,
        revealPresentationReady: ready,
        onAdvanceReveal: () => {},
        maxMs: 0,
      });
      assert.equal(finalServerPhase, "draw", `hand ${hand} server should leave reveal`);
      assert.equal(attemptCount, 1, `hand ${hand} should attempt advance once`);

      const drawSnap = { ...snapshot, phase: "draw" as const };
      store = reduceHandPresentation(store, {
        type: "serverUpdate",
        snapshot: drawSnap,
      });
      assert.notEqual(store.phase, "trumpReveal", `hand ${hand} should not stick in trumpReveal`);
    }

    assert.equal(traces.length, 5);
    for (const trace of traces) {
      assert.equal(trace.presentationPhase, "drawPlayer");
      assert.equal(trace.trumpMergedIntoHand, true);
      assert.equal(trace.dealPresentationComplete, true);
    }
  });

  it("hands 1–5: presentation reaches drawPlayer-ready; server leaves reveal on first advance", () => {
    for (let hand = 1; hand <= 5; hand += 1) {
      const trumpUpcard =
        hand === 3 ? null : ({ rank: "7", suit: "hearts" } as const);
      const snapshot = snapForHand(hand, { trumpUpcard });
      const store = walkRevealToDrawPlayerReady(snapshot);

      const { callTimes, finalServerPhase } = simulateRevealAdvanceRetry({
        serverPhase: "reveal",
        handNumber: hand,
        revealPresentationReady: revealPresentationReady(store, snapshot),
        onAdvanceReveal: () => {},
        maxMs: 8_000,
      });

      assert.equal(finalServerPhase, "draw", `hand ${hand} should reach draw`);
      assert.equal(callTimes[0], 0, `hand ${hand} immediate first attempt`);

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

    const { callTimes, finalServerPhase } = simulateRevealAdvanceRetry({
      serverPhase: "reveal",
      handNumber: 1,
      revealPresentationReady: revealPresentationReady(store, snapshot),
      onAdvanceReveal: () => {},
      advanceServerOnCall: false,
      maxMs: 7_600,
    });

    assert.equal(finalServerPhase, "reveal");
    assert.deepEqual(callTimes.slice(0, 4), [0, 2_500, 5_000, 7_500]);
  });

  it("hand 2+ advances to drawPlayer when server clears trump during trumpReveal", () => {
    for (const hand of [2, 3, 4, 5]) {
      let store = createHandPresentationStore(snapForHand(hand));
      store = reduceHandPresentation(store, { type: "advancePhase" });
      store = reduceHandPresentation(store, { type: "dealPresentationComplete" });
      store = reduceHandPresentation(store, { type: "advancePhase" });
      assert.equal(store.phase, "trumpReveal", `hand ${hand} should be in trumpReveal`);

      const trumpCleared = {
        ...snapForHand(hand, { trumpUpcard: null }),
        phase: "reveal" as const,
      };
      store = reduceHandPresentation(store, { type: "serverUpdate", snapshot: trumpCleared });

      assert.equal(store.phase, "drawPlayer", `hand ${hand} should leave trumpReveal`);
      assert.ok(
        revealPresentationReady(store, trumpCleared),
        `hand ${hand} revealPresentationReady after trump clear`,
      );
    }
  });

  it("hand 2 repeated trump-clear snapshots do not reset reveal advance gate", () => {
    let store = createHandPresentationStore(snapForHand(2));
    store = reduceHandPresentation(store, { type: "advancePhase" });
    store = reduceHandPresentation(store, { type: "dealPresentationComplete" });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "trumpReveal");

    const trumpCleared = { ...snapForHand(2, { trumpUpcard: null }), phase: "reveal" as const };
    for (let i = 0; i < 6; i += 1) {
      store = reduceHandPresentation(store, {
        type: "serverUpdate",
        snapshot: { ...trumpCleared, potAmount: 3 + i },
      });
      assert.equal(store.phase, "drawPlayer", `churn snapshot ${i} should stay drawPlayer`);
      assert.ok(revealPresentationReady(store, trumpCleared));
    }
  });

  it("hand 2 trumpReveal watchdog recovers after stale phaseStartedAt shift", () => {
    let store = createHandPresentationStore(snapForHand(2));
    store = reduceHandPresentation(store, { type: "advancePhase" });
    store = reduceHandPresentation(store, { type: "dealPresentationComplete" });
    store = reduceHandPresentation(store, { type: "advancePhase" });
    assert.equal(store.phase, "trumpReveal");

    const shiftedStartedAt = Date.now() - TRUMP_REVEAL_HOLD_MS - 200;
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: { ...snapForHand(2), potAmount: store.displayPotAmount },
    });
    store = { ...store, phaseStartedAt: shiftedStartedAt };

    store = reduceHandPresentation(store, { type: "watchdog" });
    assert.equal(store.phase, "drawPlayer");
    assert.ok(revealPresentationReady(store, snapForHand(2)));
  });

  it("hand 3 handReset watchdog advances into ante when timer lost", () => {
    let store = settleHandToNextHandReset(
      createHandPresentationStore({ ...snapForHand(2), phase: "play" }),
      snapForHand(2, { phase: "play" }),
    );
    store = reduceHandPresentation(store, {
      type: "serverUpdate",
      snapshot: snapForHand(3),
    });
    assert.equal(store.phase, "handReset");

    store = {
      ...store,
      phaseStartedAt: Date.now() - HAND_RESET_MS - 100,
    };
    store = reduceHandPresentation(store, { type: "watchdog" });
    assert.equal(store.phase, "ante");
    assert.equal(store.trumpMergedIntoHand, false);
    assert.equal(store.dealPresentationComplete, false);
  });

  it("hand 2 ante watchdog still force-completes deal stall across hands", () => {
    let store = openNextHandReveal(
      settleHandToNextHandReset(
        createHandPresentationStore({ ...snapForHand(1), phase: "play" }),
        snapForHand(1, { phase: "play" }),
      ),
      snapForHand(2),
    );
    assert.equal(store.phase, "ante");
    assert.equal(store.dealPresentationComplete, false);

    store = {
      ...store,
      phaseStartedAt: Date.now() - ANTE_DEAL_STALL_MS - 100,
    };
    store = reduceHandPresentation(store, { type: "watchdog" });
    assert.equal(store.dealPresentationComplete, true);
    assert.equal(store.phase, "trumpReveal");
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
