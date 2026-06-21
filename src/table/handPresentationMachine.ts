import type { SerializedCard } from "./types";
import {
  type DrawAnimSubPhase,
  type HandPresentationPhase,
  drawPlayerScheduleMs,
  handTimingScale,
  PRESENTATION_WATCHDOG_MS,
} from "./handPresentationTiming";

export interface HandServerSnapshot {
  sessionKey: string;
  handNumber: number;
  phase: string | null;
  enrollmentActive: boolean;
  participantIds: string[];
  actionOrder: string[];
  drawCompletedIds: string[];
  turnPlayerId: string | null;
  trumpUpcard: SerializedCard | null;
  dealerId: string | null;
  handComplete: boolean;
  potAmount: number;
  carryOverPot: number;
  enrolledIds: string[];
  declinedIds: string[];
}

export interface HandPresentationModel {
  phase: HandPresentationPhase;
  displayDrawCompletedIds: string[];
  animatingDrawPlayerId: string | null;
  drawAnimSubPhase: DrawAnimSubPhase;
  drawDiscardCount: number;
  drawReplaceCount: number;
  trumpRevealActive: boolean;
  trumpMergeActive: boolean;
  trumpMergedIntoHand: boolean;
  anteAnimActive: boolean;
  dealStaggerCount: number;
  enrollmentPulse: Record<string, "join" | "pass" | null>;
  settleAnimActive: boolean;
  settleCarryOver: boolean;
  nextHandResetActive: boolean;
  suppressTurnIndicator: boolean;
  displayPotAmount: number;
  isPresenting: boolean;
}

export interface HandPresentationStore {
  phase: HandPresentationPhase;
  sessionKey: string;
  handNumber: number;
  displayDrawCompletedIds: string[];
  animatingDrawPlayerId: string | null;
  drawAnimSubPhase: DrawAnimSubPhase;
  drawDiscardCount: number;
  drawReplaceCount: number;
  trumpRevealActive: boolean;
  trumpMergeActive: boolean;
  trumpMergedIntoHand: boolean;
  anteAnimActive: boolean;
  dealStaggerCount: number;
  enrollmentPulse: Record<string, "join" | "pass" | null>;
  settleAnimActive: boolean;
  settleCarryOver: boolean;
  nextHandResetActive: boolean;
  displayPotAmount: number;
  prevSnapshot: HandServerSnapshot | null;
  pendingSnapshot: HandServerSnapshot | null;
  phaseStartedAt: number;
}

export function trumpKey(card: SerializedCard | null): string {
  if (!card?.rank || !card?.suit) return "";
  return `${card.rank}-${card.suit}`;
}

export function isHandPresentingPhase(phase: HandPresentationPhase): boolean {
  return (
    phase === "handReset" ||
    phase === "ante" ||
    phase === "trumpReveal" ||
    phase === "trumpMerge" ||
    phase === "drawPlayer" ||
    phase === "drawReady" ||
    phase === "settle" ||
    phase === "nextHandReset"
  );
}

export function snapshotFromSession(input: {
  sessionId: string;
  handNumber: number;
  phase?: string | null;
  enrollmentActive?: boolean;
  participantIds: string[];
  actionOrder?: string[];
  drawCompletedIds?: string[];
  turnPlayerId?: string | null;
  trumpUpcard?: SerializedCard | null;
  dealerId?: string | null;
  handComplete?: boolean;
  potAmount: number;
  carryOverPot?: number;
  enrolledIds?: string[];
  declinedIds?: string[];
}): HandServerSnapshot {
  return {
    sessionKey: input.sessionId,
    handNumber: input.handNumber,
    phase: input.phase ?? null,
    enrollmentActive: input.enrollmentActive === true,
    participantIds: [...input.participantIds],
    actionOrder: [...(input.actionOrder ?? input.participantIds)],
    drawCompletedIds: [...(input.drawCompletedIds ?? [])],
    turnPlayerId: input.turnPlayerId ?? null,
    trumpUpcard: input.trumpUpcard ?? null,
    dealerId: input.dealerId ?? null,
    handComplete: input.handComplete === true,
    potAmount: input.potAmount,
    carryOverPot: input.carryOverPot ?? 0,
    enrolledIds: [...(input.enrolledIds ?? [])],
    declinedIds: [...(input.declinedIds ?? [])],
  };
}

function deriveInitialPhase(snapshot: HandServerSnapshot): HandPresentationPhase {
  if (snapshot.phase === "play") return "play";
  if (snapshot.phase === "draw") return "drawPlayer";
  if (snapshot.phase === "decision") return "decision";
  if (snapshot.phase === "reveal") return "ante";
  if (snapshot.enrollmentActive) return "enrollment";
  return "idle";
}

export function createHandPresentationStore(
  snapshot: HandServerSnapshot,
): HandPresentationStore {
  return {
    phase: deriveInitialPhase(snapshot),
    sessionKey: snapshot.sessionKey,
    handNumber: snapshot.handNumber,
    displayDrawCompletedIds: [],
    animatingDrawPlayerId: null,
    drawAnimSubPhase: "done",
    drawDiscardCount: 0,
    drawReplaceCount: 0,
    trumpRevealActive: false,
    trumpMergeActive: false,
    trumpMergedIntoHand: false,
    anteAnimActive: false,
    dealStaggerCount: 0,
    enrollmentPulse: {},
    settleAnimActive: false,
    settleCarryOver: false,
    nextHandResetActive: false,
    displayPotAmount: snapshot.potAmount,
    prevSnapshot: snapshot,
    pendingSnapshot: null,
    phaseStartedAt: Date.now(),
  };
}

function withPhase(
  store: HandPresentationStore,
  phase: HandPresentationPhase,
  patch: Partial<HandPresentationStore> = {},
): HandPresentationStore {
  return {
    ...store,
    ...patch,
    phase,
    phaseStartedAt: Date.now(),
  };
}

function enrollmentDiffPulse(
  prev: HandServerSnapshot,
  next: HandServerSnapshot,
): Record<string, "join" | "pass" | null> {
  const pulse: Record<string, "join" | "pass" | null> = {};
  for (const id of next.enrolledIds) {
    if (!prev.enrolledIds.includes(id)) pulse[id] = "join";
  }
  for (const id of next.declinedIds) {
    if (!prev.declinedIds.includes(id)) pulse[id] = "pass";
  }
  return pulse;
}

function nextDrawCompleter(
  prev: HandServerSnapshot,
  next: HandServerSnapshot,
): string | null {
  for (const id of next.drawCompletedIds) {
    if (!prev.drawCompletedIds.includes(id)) return id;
  }
  return null;
}

function beginDrawPlayerAnim(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
  playerId: string,
  discardCount: number,
  replaceCount: number,
): HandPresentationStore {
  return withPhase(store, "drawPlayer", {
    animatingDrawPlayerId: playerId,
    drawAnimSubPhase: "discard",
    drawDiscardCount: discardCount,
    drawReplaceCount: replaceCount,
    prevSnapshot: snapshot,
  });
}

function beginDrawSequence(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
  discardCount: number,
  replaceCount: number,
): HandPresentationStore {
  const prevEmpty = { ...snapshot, drawCompletedIds: [] };
  const first = nextDrawCompleter(prevEmpty, snapshot);
  if (first) {
    return beginDrawPlayerAnim(store, snapshot, first, discardCount, replaceCount);
  }
  return withPhase(store, "drawPlayer", {
    displayDrawCompletedIds: [],
    prevSnapshot: snapshot,
  });
}

export type HandPresentationEvent =
  | { type: "reset"; snapshot: HandServerSnapshot }
  | {
      type: "serverUpdate";
      snapshot: HandServerSnapshot;
      heroDrawDiscardCount?: number;
      heroDrawReplaceCount?: number;
    }
  | { type: "advancePhase" }
  | { type: "watchdog" }
  | { type: "dealCardRevealed"; count: number }
  | { type: "clearEnrollmentPulse" };

export function reduceHandPresentation(
  store: HandPresentationStore,
  event: HandPresentationEvent,
): HandPresentationStore {
  switch (event.type) {
    case "reset":
      return createHandPresentationStore(event.snapshot);

    case "dealCardRevealed":
      return { ...store, dealStaggerCount: Math.max(store.dealStaggerCount, event.count) };

    case "clearEnrollmentPulse":
      if (!Object.keys(store.enrollmentPulse).length) return store;
      return { ...store, enrollmentPulse: {} };

    case "watchdog":
      if (Date.now() - store.phaseStartedAt < PRESENTATION_WATCHDOG_MS) return store;
      return advanceHandPhase({ ...store, pendingSnapshot: store.pendingSnapshot ?? store.prevSnapshot });

    case "advancePhase":
      return advanceHandPhase(store);

    case "serverUpdate": {
      const { snapshot, heroDrawDiscardCount = 0, heroDrawReplaceCount = 0 } = event;
      const prev = store.prevSnapshot ?? snapshot;

      if (store.sessionKey !== snapshot.sessionKey) {
        return createHandPresentationStore(snapshot);
      }

      // Authoritative play phase must not wait on draw/trump presentation.
      if (snapshot.phase === "play" && store.phase !== "play") {
        return withPhase(store, "play", {
          displayDrawCompletedIds: [...snapshot.drawCompletedIds],
          animatingDrawPlayerId: null,
          drawAnimSubPhase: "done",
          trumpRevealActive: false,
          trumpMergeActive: false,
          trumpMergedIntoHand: true,
          anteAnimActive: false,
          prevSnapshot: snapshot,
          pendingSnapshot: null,
        });
      }

      if (isHandPresentingPhase(store.phase) && store.phase !== "drawPlayer") {
        return { ...store, pendingSnapshot: snapshot };
      }

      if (store.phase === "drawPlayer" && store.drawAnimSubPhase !== "done") {
        return { ...store, pendingSnapshot: snapshot };
      }

      const pulse = enrollmentDiffPulse(prev, snapshot);
      const hasPulse = Object.keys(pulse).length > 0;

      if (snapshot.enrollmentActive || snapshot.phase === "decision") {
        return {
          ...store,
          phase: snapshot.phase === "decision" ? "decision" : "enrollment",
          enrollmentPulse: hasPulse ? { ...store.enrollmentPulse, ...pulse } : store.enrollmentPulse,
          prevSnapshot: snapshot,
          displayPotAmount: snapshot.potAmount,
        };
      }

      if (
        snapshot.phase === "reveal" &&
        prev.phase !== "reveal" &&
        (store.phase === "idle" ||
          store.phase === "nextHandReset" ||
          store.phase === "enrollment")
      ) {
        const hasTrump = Boolean(snapshot.trumpUpcard);
        return withPhase(store, "ante", {
          trumpRevealActive: hasTrump,
          anteAnimActive: true,
          dealStaggerCount: Math.max(store.dealStaggerCount, snapshot.participantIds.length),
          prevSnapshot: snapshot,
          displayPotAmount: snapshot.potAmount,
        });
      }

      if (
        snapshot.phase === "draw" &&
        prev.enrollmentActive &&
        !snapshot.enrollmentActive &&
        store.phase === "enrollment"
      ) {
        const hasTrump = Boolean(snapshot.trumpUpcard);
        return withPhase(store, hasTrump ? "trumpReveal" : "ante", {
          trumpRevealActive: hasTrump,
          anteAnimActive: true,
          dealStaggerCount: Math.max(store.dealStaggerCount, snapshot.participantIds.length),
          prevSnapshot: snapshot,
          displayPotAmount: snapshot.potAmount,
        });
      }

      if (
        snapshot.phase === "draw" &&
        (store.phase === "decision" || prev.phase === "decision")
      ) {
        return beginDrawSequence(store, snapshot, 0, 0);
      }

      if (snapshot.phase === "draw") {
        const completed = nextDrawCompleter(prev, snapshot);
        if (completed && store.phase !== "drawReady") {
          const isHeroEvent = heroDrawDiscardCount > 0 || heroDrawReplaceCount > 0;
          const discards = isHeroEvent ? heroDrawDiscardCount : completed === snapshot.turnPlayerId ? 0 : 1;
          const replacements = isHeroEvent ? heroDrawReplaceCount : discards;
          return beginDrawPlayerAnim(store, snapshot, completed, discards, replacements);
        }

        if (
          snapshot.drawCompletedIds.length === snapshot.participantIds.length &&
          snapshot.participantIds.length > 0 &&
          store.phase === "drawPlayer" &&
          store.drawAnimSubPhase === "done"
        ) {
          return withPhase(store, "drawReady", { prevSnapshot: snapshot });
        }
      }

      if (snapshot.handComplete && snapshot.phase === "play" && store.phase === "play") {
        return withPhase(store, "settle", {
          settleAnimActive: true,
          settleCarryOver: snapshot.carryOverPot > 0,
          prevSnapshot: snapshot,
          displayPotAmount: snapshot.potAmount,
        });
      }

      return {
        ...store,
        prevSnapshot: snapshot,
        displayPotAmount: snapshot.potAmount,
        handNumber: snapshot.handNumber,
        enrollmentPulse: hasPulse ? { ...store.enrollmentPulse, ...pulse } : store.enrollmentPulse,
      };
    }

    default:
      return store;
  }
}

function advanceHandPhase(store: HandPresentationStore): HandPresentationStore {
  const pending = store.pendingSnapshot;
  const snap = pending ?? store.prevSnapshot;

  switch (store.phase) {
    case "handReset":
      return withPhase(store, "ante", { anteAnimActive: true, pendingSnapshot: null });

    case "ante":
      if (store.trumpRevealActive || snap?.trumpUpcard) {
        return withPhase(store, "trumpReveal", {
          trumpRevealActive: true,
          anteAnimActive: false,
          pendingSnapshot: null,
        });
      }
      if (snap?.phase === "draw") {
        return beginDrawSequence(store, snap, 0, 0);
      }
      return withPhase(store, "drawPlayer", { anteAnimActive: false, pendingSnapshot: null });

    case "trumpReveal": {
      if (snap?.phase === "draw") {
        return {
          ...beginDrawSequence(store, snap, 0, 0),
          trumpRevealActive: false,
          trumpMergeActive: false,
          trumpMergedIntoHand: true,
          pendingSnapshot: null,
        };
      }
      return withPhase(store, "drawPlayer", {
        trumpRevealActive: false,
        trumpMergeActive: false,
        trumpMergedIntoHand: true,
        pendingSnapshot: null,
      });
    }

    case "trumpMerge":
      if (snap?.phase === "draw") {
        return {
          ...beginDrawSequence(store, snap, 0, 0),
          trumpMergeActive: false,
          trumpMergedIntoHand: true,
        };
      }
      return withPhase(store, "drawPlayer", {
        trumpRevealActive: false,
        trumpMergeActive: false,
        trumpMergedIntoHand: true,
        pendingSnapshot: null,
      });

    case "drawPlayer": {
      if (store.drawAnimSubPhase === "discard" && store.drawReplaceCount > 0) {
        return { ...store, drawAnimSubPhase: "receive" };
      }
      const playerId = store.animatingDrawPlayerId;
      const nextCompleted = playerId
        ? [...store.displayDrawCompletedIds, playerId]
        : store.displayDrawCompletedIds;
      const ref = snap ?? store.prevSnapshot;
      if (ref && nextCompleted.length >= ref.participantIds.length) {
        return withPhase(store, "drawReady", {
          displayDrawCompletedIds: nextCompleted,
          animatingDrawPlayerId: null,
          drawAnimSubPhase: "done",
          pendingSnapshot: null,
        });
      }
      if (ref) {
        const prevDraw = { ...ref, drawCompletedIds: nextCompleted };
        const nextPlayer = ref.actionOrder.find(
          (id) => ref.participantIds.includes(id) && !nextCompleted.includes(id),
        );
        if (nextPlayer && ref.drawCompletedIds.includes(nextPlayer)) {
          return beginDrawPlayerAnim(store, ref, nextPlayer, 1, 1);
        }
        void prevDraw;
      }
      return {
        ...store,
        displayDrawCompletedIds: nextCompleted,
        animatingDrawPlayerId: null,
        drawAnimSubPhase: "done",
      };
    }

    case "drawReady":
      return withPhase(store, "play", { pendingSnapshot: null });

    case "settle":
      return withPhase(store, "nextHandReset", {
        settleAnimActive: false,
        nextHandResetActive: true,
        pendingSnapshot: null,
      });

    case "nextHandReset":
      if (snap) return createHandPresentationStore(snap);
      return withPhase(store, "idle", { nextHandResetActive: false });

    default:
      return store;
  }
}

export function buildHandPresentationModel(
  store: HandPresentationStore,
): HandPresentationModel {
  return {
    phase: store.phase,
    displayDrawCompletedIds: store.displayDrawCompletedIds,
    animatingDrawPlayerId: store.animatingDrawPlayerId,
    drawAnimSubPhase: store.drawAnimSubPhase,
    drawDiscardCount: store.drawDiscardCount,
    drawReplaceCount: store.drawReplaceCount,
    trumpRevealActive: store.trumpRevealActive,
    trumpMergeActive: store.trumpMergeActive,
    trumpMergedIntoHand: store.trumpMergedIntoHand,
    anteAnimActive: store.anteAnimActive,
    dealStaggerCount: store.dealStaggerCount,
    enrollmentPulse: store.enrollmentPulse,
    settleAnimActive: store.settleAnimActive,
    settleCarryOver: store.settleCarryOver,
    nextHandResetActive: store.nextHandResetActive,
    suppressTurnIndicator:
      store.phase === "trumpReveal" ||
      store.phase === "trumpMerge" ||
      store.phase === "ante" ||
      store.phase === "drawReady" ||
      store.phase === "settle" ||
      store.phase === "nextHandReset" ||
      store.phase === "handReset" ||
      (store.phase === "drawPlayer" && store.drawAnimSubPhase !== "done"),
    displayPotAmount: store.displayPotAmount,
    isPresenting: isHandPresentingPhase(store.phase),
  };
}

export function phaseScheduleMs(
  store: HandPresentationStore,
  reducedMotion = false,
): number {
  const t = handTimingScale(reducedMotion);
  switch (store.phase) {
    case "handReset":
      return t.handResetMs;
    case "ante":
      return t.anteChipTravelMs * Math.max(1, Math.min(store.dealStaggerCount, 8));
    case "trumpReveal":
      return t.trumpRevealHoldMs;
    case "trumpMerge":
      return t.trumpMergeAnimMs;
    case "drawPlayer":
      return drawPlayerScheduleMs(
        store.drawAnimSubPhase === "receive" ? 0 : store.drawDiscardCount,
        store.drawAnimSubPhase === "receive" ? store.drawReplaceCount : 0,
        reducedMotion,
      );
    case "drawReady":
      return t.drawReadyBeatMs;
    case "settle":
      return t.settleHoldMs;
    case "nextHandReset":
      return t.nextHandResetMs;
    default:
      return 0;
  }
}
