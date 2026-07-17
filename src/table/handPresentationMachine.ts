import type { SerializedCard } from "./types";
import { isGameFlowDebugEnabled, logGameFlow } from "./gameFlowDebug";
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
  /** False while ante coins are in flight — pot preview stays pre-ante. */
  antePotRevealed: boolean;
  /** Seats whose ante coin has landed this hand. */
  anteLandedPlayerIds: string[];
  dealStaggerCount: number;
  enrollmentPulse: Record<string, "join" | "pass" | null>;
  settleAnimActive: boolean;
  settleCarryOver: boolean;
  nextHandResetActive: boolean;
  /** Latched when the server reports handComplete; cleared when settle begins. */
  pendingHandSettle: boolean;
  suppressTurnIndicator: boolean;
  displayPotAmount: number;
  isPresenting: boolean;
  /** True after ante/trump-reveal presentation completes — gates clockwise deal GSAP. */
  dealPresentationAllowed: boolean;
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
  /** False while ante coins are in flight — pot preview stays pre-ante. */
  antePotRevealed: boolean;
  /** Seats whose ante coin has landed this hand. */
  anteLandedPlayerIds: string[];
  dealStaggerCount: number;
  enrollmentPulse: Record<string, "join" | "pass" | null>;
  settleAnimActive: boolean;
  settleCarryOver: boolean;
  nextHandResetActive: boolean;
  pendingHandSettle: boolean;
  handSettleSnapshot: HandServerSnapshot | null;
  displayPotAmount: number;
  prevSnapshot: HandServerSnapshot | null;
  pendingSnapshot: HandServerSnapshot | null;
  phaseStartedAt: number;
  /** Players whose draw presentation fully finished this hand (dedupe key: handNumber + playerId). */
  drawPresentationConsumedIds: string[];
  dealPresentationAllowed: boolean;
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

/** Reveal-chain phases that must not outlive an authoritative server draw phase. */
const STALE_REVEAL_PRESENTATION_PHASES = new Set<HandPresentationPhase>([
  "handReset",
  "ante",
  "trumpReveal",
  "trumpMerge",
]);

function catchUpRevealPresentationToDraw(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
): HandPresentationStore {
  if (isGameFlowDebugEnabled()) {
    logGameFlow("handPresentation", "catch-up-reveal-to-draw", {
      fromPhase: store.phase,
      serverPhase: snapshot.phase,
      drawCompleted: snapshot.drawCompletedIds.length,
      participantCount: snapshot.participantIds.length,
      turnPlayerId: snapshot.turnPlayerId,
      anteAnimActive: store.anteAnimActive,
      trumpRevealActive: store.trumpRevealActive,
    });
  }

  const consumed = mergeDrawPresentationConsumed(store, snapshot.drawCompletedIds);
  const allDrew =
    snapshot.participantIds.length > 0 &&
    snapshot.drawCompletedIds.length >= snapshot.participantIds.length;

  let caught: HandPresentationStore = {
    ...createHandPresentationStore(snapshot),
    drawPresentationConsumedIds: consumed,
    displayDrawCompletedIds: [...snapshot.drawCompletedIds],
    animatingDrawPlayerId: null,
    drawAnimSubPhase: "done",
    prevSnapshot: snapshot,
    pendingSnapshot: null,
  };

  if (allDrew) {
    caught = withPhase(caught, "drawReady", {});
  }

  if (isGameFlowDebugEnabled()) {
    logGameFlow("handPresentation", "catch-up-reveal-to-draw-done", {
      toPhase: caught.phase,
      isPresenting: isHandPresentingPhase(caught.phase),
      displayDrawCompleted: caught.displayDrawCompletedIds.length,
    });
  }

  return caught;
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
  const store: HandPresentationStore = {
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
    antePotRevealed: true,
    anteLandedPlayerIds: [],
    dealStaggerCount: 0,
    enrollmentPulse: {},
    settleAnimActive: false,
    settleCarryOver: false,
    nextHandResetActive: false,
    pendingHandSettle: false,
    handSettleSnapshot: null,
    displayPotAmount: snapshot.potAmount,
    prevSnapshot: snapshot,
    pendingSnapshot: null,
    phaseStartedAt: Date.now(),
    drawPresentationConsumedIds: [],
    dealPresentationAllowed:
      snapshot.phase === "draw" ||
      snapshot.phase === "play" ||
      snapshot.phase === "decision",
  };
  if (snapshot.phase === "reveal") {
    return beginRevealPresentation(store, snapshot);
  }
  return store;
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

/** Next player needing draw presentation — skips fully consumed players even if prev regressed. */
export function nextDrawPresentationTarget(
  store: HandPresentationStore,
  prev: HandServerSnapshot,
  next: HandServerSnapshot,
): string | null {
  for (const id of next.drawCompletedIds) {
    if (isDrawPresentationConsumed(store, id)) continue;
    if (store.displayDrawCompletedIds.includes(id)) continue;
    if (!prev.drawCompletedIds.includes(id)) return id;
  }
  return null;
}

function isDrawPresentationConsumed(store: HandPresentationStore, playerId: string): boolean {
  return store.drawPresentationConsumedIds.includes(playerId);
}

function isDrawPresentationInFlight(store: HandPresentationStore): boolean {
  return (
    store.phase === "drawPlayer" &&
    store.animatingDrawPlayerId != null &&
    store.drawAnimSubPhase !== "done"
  );
}

/** Server advanced to another draw seat — skip lagging peer animation. */
function fastForwardStaleDrawPresentation(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
): HandPresentationStore | null {
  if (snapshot.phase !== "draw") return null;
  if (!isDrawPresentationInFlight(store)) return null;
  const animating = store.animatingDrawPlayerId;
  const turnId = snapshot.turnPlayerId;
  if (!animating || !turnId) return null;
  if (snapshot.drawCompletedIds.includes(turnId)) return null;
  if (animating === turnId && !snapshot.drawCompletedIds.includes(animating)) {
    return null;
  }
  if (isGameFlowDebugEnabled()) {
    logGameFlow("handPresentation", "fast-forward-stale-draw", {
      animating,
      turnId,
      drawCompleted: snapshot.drawCompletedIds,
    });
  }
  const committed = commitDrawPlayerReceiveComplete(store, snapshot);
  return {
    ...committed,
    pendingSnapshot: snapshot,
    prevSnapshot: snapshot,
  };
}

function markDrawPresentationConsumed(
  store: HandPresentationStore,
  playerId: string | null | undefined,
): string[] {
  if (!playerId || isDrawPresentationConsumed(store, playerId)) {
    return store.drawPresentationConsumedIds;
  }
  return [...store.drawPresentationConsumedIds, playerId];
}

function mergeDrawPresentationConsumed(
  store: HandPresentationStore,
  playerIds: string[],
): string[] {
  const merged = new Set([...store.drawPresentationConsumedIds, ...playerIds]);
  return [...merged];
}

/** Pick next server-completed player who still needs draw presentation this hand. */
function pickNextDrawPresentationPlayer(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
  nextCompleted: string[],
): string | null {
  for (const id of snapshot.actionOrder) {
    if (!snapshot.participantIds.includes(id)) continue;
    if (!snapshot.drawCompletedIds.includes(id)) continue;
    if (nextCompleted.includes(id)) continue;
    if (isDrawPresentationConsumed(store, id)) continue;
    return id;
  }
  return null;
}

function logDrawCandidateResolution(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
  chosen: string | null,
  reason: string,
): void {
  if (!isGameFlowDebugEnabled()) return;
  logGameFlow("handPresentation", "draw-candidate-resolve", {
    handNumber: store.handNumber,
    candidates: [...snapshot.drawCompletedIds],
    consumed: [...store.drawPresentationConsumedIds],
    displayCompleted: [...store.displayDrawCompletedIds],
    inFlight: store.animatingDrawPlayerId,
    inFlightSubPhase: store.drawAnimSubPhase,
    chosen,
    reason,
  });
}

function logDrawReceiveCommit(
  stage: "before" | "payload" | "after",
  store: HandPresentationStore,
  payload?: {
    playerId: string | null;
    nextCompleted: string[];
    nextChosen: string | null;
  },
): void {
  if (!isGameFlowDebugEnabled()) return;
  logGameFlow("handPresentation", `draw-receive-commit-${stage}`, {
    handNumber: store.handNumber,
    inFlight: store.animatingDrawPlayerId,
    inFlightSubPhase: store.drawAnimSubPhase,
    displayCompleted: [...store.displayDrawCompletedIds],
    ...(payload
      ? {
          commitPlayerId: payload.playerId,
          commitNextCompleted: [...payload.nextCompleted],
          nextChosen: payload.nextChosen,
        }
      : {}),
  });
}

/** Commit discard/receive presentation for the in-flight player; idempotent per playerId. */
function commitDrawPlayerReceiveComplete(
  store: HandPresentationStore,
  snap: HandServerSnapshot | null,
): HandPresentationStore {
  const playerId = store.animatingDrawPlayerId;
  if (!playerId) {
    return store.drawAnimSubPhase === "done"
      ? store
      : { ...store, drawAnimSubPhase: "done" };
  }

  const alreadyDisplayed = store.displayDrawCompletedIds.includes(playerId);
  const nextCompleted = alreadyDisplayed
    ? store.displayDrawCompletedIds
    : [...store.displayDrawCompletedIds, playerId];
  const consumedIds = markDrawPresentationConsumed(store, playerId);
  const syncedPrev =
    snap != null ? { ...snap, drawCompletedIds: [...nextCompleted] } : store.prevSnapshot;

  logDrawReceiveCommit("payload", store, {
    playerId,
    nextCompleted,
    nextChosen: null,
  });

  return {
    ...store,
    displayDrawCompletedIds: nextCompleted,
    animatingDrawPlayerId: null,
    drawAnimSubPhase: "done",
    prevSnapshot: syncedPrev ?? store.prevSnapshot,
    drawPresentationConsumedIds: consumedIds,
  };
}

function initialDrawAnimSubPhase(
  discardCount: number,
  replaceCount: number,
): DrawAnimSubPhase {
  if (discardCount > 0) return "discard";
  if (replaceCount > 0) return "receive";
  return "done";
}

function beginDrawPlayerAnim(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
  playerId: string,
  discardCount: number,
  replaceCount: number,
  reason: string,
): HandPresentationStore {
  if (isDrawPresentationConsumed(store, playerId)) {
    logDrawCandidateResolution(store, snapshot, null, `consumed-skip:${playerId}:${reason}`);
    return store;
  }
  if (
    isDrawPresentationInFlight(store) &&
    store.animatingDrawPlayerId !== playerId
  ) {
    logDrawCandidateResolution(store, snapshot, null, `in-flight-skip:${reason}`);
    return store;
  }
  logDrawCandidateResolution(store, snapshot, playerId, reason);
  return withPhase(store, "drawPlayer", {
    animatingDrawPlayerId: playerId,
    drawAnimSubPhase: initialDrawAnimSubPhase(discardCount, replaceCount),
    drawDiscardCount: discardCount,
    drawReplaceCount: replaceCount,
    prevSnapshot: snapshot,
    drawPresentationConsumedIds: markDrawPresentationConsumed(store, playerId),
  });
}

function beginHandSettleFromPending(store: HandPresentationStore): HandPresentationStore {
  if (!store.pendingHandSettle || store.phase !== "play") return store;
  const snap = store.handSettleSnapshot ?? store.prevSnapshot;
  if (!snap) return store;
  return withPhase(store, "settle", {
    pendingHandSettle: false,
    handSettleSnapshot: null,
    settleAnimActive: true,
    settleCarryOver: snap.carryOverPot > 0,
    prevSnapshot: snap,
    displayPotAmount: snap.potAmount,
  });
}

function beginRevealPresentation(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
): HandPresentationStore {
  const hasTrump = Boolean(snapshot.trumpUpcard);
  return withPhase(store, "ante", {
    trumpRevealActive: hasTrump,
    trumpMergeActive: false,
    trumpMergedIntoHand: false,
    anteAnimActive: true,
    antePotRevealed: false,
    anteLandedPlayerIds: [],
    dealPresentationAllowed: false,
    dealStaggerCount: Math.max(store.dealStaggerCount, snapshot.participantIds.length),
    prevSnapshot: snapshot,
    displayPotAmount: snapshot.potAmount,
    pendingHandSettle: false,
    handSettleSnapshot: null,
    pendingSnapshot: null,
  });
}

function beginDrawSequence(
  store: HandPresentationStore,
  snapshot: HandServerSnapshot,
  discardCount: number,
  replaceCount: number,
): HandPresentationStore {
  const prevEmpty = { ...snapshot, drawCompletedIds: [] };
  const first = nextDrawPresentationTarget(store, prevEmpty, snapshot);
  if (first) {
    return beginDrawPlayerAnim(store, snapshot, first, discardCount, replaceCount, "beginDrawSequence");
  }
  return withPhase(store, "drawPlayer", {
    displayDrawCompletedIds: store.displayDrawCompletedIds,
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
  | { type: "completeTrumpMerge" }
  | { type: "watchdog" }
  | { type: "tryBeginHandSettle" }
  | { type: "dealCardRevealed"; count: number }
  | { type: "anteCoinLanded"; playerId: string }
  | { type: "anteSequenceComplete" }
  | { type: "clearEnrollmentPulse" };

export function reduceHandPresentation(
  store: HandPresentationStore,
  event: HandPresentationEvent,
): HandPresentationStore {
  const next = reduceHandPresentationCore(store, event);
  if (isGameFlowDebugEnabled()) {
    if (
      store.phase !== next.phase ||
      store.handNumber !== next.handNumber ||
      store.trumpRevealActive !== next.trumpRevealActive ||
      event.type === "serverUpdate"
    ) {
      logGameFlow("handPresentation", event.type, {
        phase: `${store.phase} -> ${next.phase}`,
        handNumber: `${store.handNumber} -> ${next.handNumber}`,
        trumpRevealActive: `${store.trumpRevealActive} -> ${next.trumpRevealActive}`,
        drawSubPhase: `${store.drawAnimSubPhase} -> ${next.drawAnimSubPhase}`,
        drawAnim: `${store.animatingDrawPlayerId ?? ""} -> ${next.animatingDrawPlayerId ?? ""}`,
        drawConsumed: next.drawPresentationConsumedIds.length,
        serverPhase: event.type === "serverUpdate" ? event.snapshot.phase : undefined,
        drawCompleted: event.type === "serverUpdate" ? event.snapshot.drawCompletedIds.length : undefined,
      });
    }
  }
  return next;
}

function reduceHandPresentationCore(
  store: HandPresentationStore,
  event: HandPresentationEvent,
): HandPresentationStore {
  switch (event.type) {
    case "reset":
      return createHandPresentationStore(event.snapshot);

    case "dealCardRevealed":
      return { ...store, dealStaggerCount: Math.max(store.dealStaggerCount, event.count) };

    case "anteCoinLanded": {
      if (!store.anteAnimActive || store.anteLandedPlayerIds.includes(event.playerId)) {
        return store;
      }
      return {
        ...store,
        anteLandedPlayerIds: [...store.anteLandedPlayerIds, event.playerId],
      };
    }

    case "anteSequenceComplete":
      return {
        ...store,
        antePotRevealed: true,
        anteAnimActive: false,
      };

    case "clearEnrollmentPulse":
      if (!Object.keys(store.enrollmentPulse).length) return store;
      return { ...store, enrollmentPulse: {} };

    case "completeTrumpMerge":
      if (!store.trumpMergeActive) return store;
      return {
        ...store,
        trumpMergeActive: false,
        trumpMergedIntoHand: true,
        phase: store.phase === "trumpMerge" ? "drawPlayer" : store.phase,
      };

    case "watchdog":
      if (store.pendingHandSettle && store.phase === "play") {
        return beginHandSettleFromPending(store);
      }
      if (Date.now() - store.phaseStartedAt < PRESENTATION_WATCHDOG_MS) return store;
      return advanceHandPhase({ ...store, pendingSnapshot: store.pendingSnapshot ?? store.prevSnapshot });

    case "tryBeginHandSettle":
      return beginHandSettleFromPending(store);

    case "advancePhase":
      return advanceHandPhase(store);

    case "serverUpdate": {
      const { snapshot, heroDrawDiscardCount = 0, heroDrawReplaceCount = 0 } = event;
      const prev = store.prevSnapshot ?? snapshot;

      if (store.sessionKey !== snapshot.sessionKey) {
        const fresh = createHandPresentationStore(snapshot);
        return snapshot.phase === "reveal" ? beginRevealPresentation(fresh, snapshot) : fresh;
      }

      const handClearedOnServer =
        store.phase === "play" &&
        snapshot.participantIds.length === 0 &&
        !snapshot.phase &&
        !snapshot.enrollmentActive &&
        (prev.participantIds.length > 0 || prev.phase === "play");

      if (handClearedOnServer) {
        const settleSnap = store.handSettleSnapshot ?? prev;
        return {
          ...store,
          handNumber: snapshot.handNumber,
          pendingHandSettle: true,
          handSettleSnapshot: settleSnap,
          pendingSnapshot: snapshot,
          prevSnapshot: snapshot,
          displayPotAmount: snapshot.potAmount,
        };
      }

      if (store.handNumber !== snapshot.handNumber) {
        // recordHand bumps handCount while the final trick may still be presenting.
        if (store.pendingHandSettle && store.phase === "play") {
          return {
            ...store,
            pendingSnapshot: snapshot,
            prevSnapshot: snapshot,
            displayPotAmount: snapshot.potAmount,
          };
        }
        const fresh = createHandPresentationStore(snapshot);
        return snapshot.phase === "reveal" ? beginRevealPresentation(fresh, snapshot) : fresh;
      }

      const prevTrump = trumpKey(prev.trumpUpcard);
      const nextTrump = trumpKey(snapshot.trumpUpcard);
      if (prevTrump && !nextTrump && !store.trumpMergedIntoHand && !store.trumpMergeActive) {
        return {
          ...store,
          trumpRevealActive: false,
          trumpMergeActive: true,
          trumpMergedIntoHand: false,
          prevSnapshot: snapshot,
          pendingSnapshot: snapshot,
        };
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
          dealPresentationAllowed: true,
          prevSnapshot: snapshot,
          pendingSnapshot: null,
        });
      }

      // Authoritative draw phase must not stay stuck in ante/trump presentation.
      if (
        snapshot.phase === "draw" &&
        STALE_REVEAL_PRESENTATION_PHASES.has(store.phase)
      ) {
        return catchUpRevealPresentationToDraw(store, snapshot);
      }

      if (
        snapshot.phase === "reveal" &&
        store.phase === "ante" &&
        !store.anteAnimActive &&
        !store.trumpRevealActive
      ) {
        return beginRevealPresentation(store, snapshot);
      }

      if (isHandPresentingPhase(store.phase) && store.phase !== "drawPlayer") {
        return { ...store, pendingSnapshot: snapshot };
      }

      if (store.phase === "drawPlayer" && store.drawAnimSubPhase !== "done") {
        return { ...store, pendingSnapshot: snapshot };
      }

      if (snapshot.handComplete && snapshot.phase === "play" && store.phase === "play") {
        return {
          ...store,
          pendingHandSettle: true,
          handSettleSnapshot: snapshot,
          pendingSnapshot: snapshot,
          prevSnapshot: snapshot,
          displayPotAmount: snapshot.potAmount,
        };
      }

      if (store.pendingHandSettle && store.phase === "play") {
        const serverLeftPlay = snapshot.phase !== "play" && snapshot.phase != null;
        const serverEnrollment = snapshot.enrollmentActive === true;
        if (serverLeftPlay || serverEnrollment) {
          const settled = beginHandSettleFromPending(store);
          if (settled.phase === "settle") {
            return {
              ...settled,
              pendingSnapshot: snapshot,
              prevSnapshot: snapshot,
              displayPotAmount: snapshot.potAmount,
            };
          }
        }
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
          store.phase === "enrollment" ||
          store.phase === "settle" ||
          store.phase === "play")
      ) {
        return beginRevealPresentation(store, snapshot);
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
          antePotRevealed: false,
          anteLandedPlayerIds: [],
          dealPresentationAllowed: false,
          dealStaggerCount: Math.max(store.dealStaggerCount, snapshot.participantIds.length),
          prevSnapshot: snapshot,
          displayPotAmount: snapshot.potAmount,
        });
      }

      if (
        snapshot.phase === "draw" &&
        (store.phase === "decision" || prev.phase === "decision") &&
        store.drawPresentationConsumedIds.length === 0 &&
        store.displayDrawCompletedIds.length === 0 &&
        store.phase !== "drawPlayer" &&
        store.phase !== "drawReady"
      ) {
        return beginDrawSequence(store, snapshot, 0, 0);
      }

      if (snapshot.phase === "draw") {
        const fastForwarded = fastForwardStaleDrawPresentation(store, snapshot);
        if (fastForwarded) {
          store = fastForwarded;
        }

        const completed = nextDrawPresentationTarget(store, prev, snapshot);
        if (completed && store.phase !== "drawReady") {
          const animatingNow =
            store.phase === "drawPlayer" &&
            store.animatingDrawPlayerId === completed &&
            store.drawAnimSubPhase !== "done";
          if (!animatingNow && !isDrawPresentationInFlight(store)) {
            const isHeroEvent = heroDrawDiscardCount > 0 || heroDrawReplaceCount > 0;
            const discards = isHeroEvent ? heroDrawDiscardCount : completed === snapshot.turnPlayerId ? 0 : 1;
            const replacements = isHeroEvent ? heroDrawReplaceCount : discards;
            return beginDrawPlayerAnim(
              store,
              snapshot,
              completed,
              discards,
              replacements,
              "serverUpdate",
            );
          }
          if (animatingNow) {
            logDrawCandidateResolution(store, snapshot, null, "serverUpdate:animating-same-player");
          } else if (isDrawPresentationInFlight(store)) {
            logDrawCandidateResolution(store, snapshot, null, "serverUpdate:in-flight-other-player");
          }
        } else if (!completed) {
          logDrawCandidateResolution(store, snapshot, null, "serverUpdate:no-candidate");
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
      return withPhase(store, "ante", {
        anteAnimActive: true,
        antePotRevealed: false,
        anteLandedPlayerIds: [],
        dealPresentationAllowed: false,
        pendingSnapshot: null,
      });

    case "ante":
      if (store.trumpRevealActive || snap?.trumpUpcard) {
        return withPhase(store, "trumpReveal", {
          trumpRevealActive: true,
          anteAnimActive: false,
          dealPresentationAllowed: false,
          pendingSnapshot: null,
        });
      }
      if (snap?.phase === "draw") {
        return { ...beginDrawSequence(store, snap, 0, 0), dealPresentationAllowed: true };
      }
      return withPhase(store, "drawPlayer", {
        anteAnimActive: false,
        dealPresentationAllowed: true,
        pendingSnapshot: null,
      });

    case "trumpReveal": {
      if (snap?.phase === "draw") {
        return {
          ...beginDrawSequence(store, snap, 0, 0),
          trumpRevealActive: false,
          trumpMergeActive: false,
          trumpMergedIntoHand: false,
          dealPresentationAllowed: true,
          pendingSnapshot: null,
        };
      }
      return withPhase(store, "drawPlayer", {
        trumpRevealActive: false,
        trumpMergeActive: false,
        trumpMergedIntoHand: false,
        dealPresentationAllowed: true,
        pendingSnapshot: null,
      });
    }

    case "trumpMerge":
      return store;

    case "drawPlayer": {
      if (store.drawAnimSubPhase === "discard" && store.drawReplaceCount > 0) {
        return { ...store, drawAnimSubPhase: "receive" };
      }

      logDrawReceiveCommit("before", store);
      const completingPlayerId = store.animatingDrawPlayerId;
      const committed = commitDrawPlayerReceiveComplete(store, snap);
      logDrawReceiveCommit("after", committed);

      const ref = snap ?? committed.prevSnapshot;
      if (ref && committed.displayDrawCompletedIds.length >= ref.participantIds.length) {
        return withPhase(committed, "drawReady", {
          displayDrawCompletedIds: committed.displayDrawCompletedIds,
          animatingDrawPlayerId: null,
          drawAnimSubPhase: "done",
          pendingSnapshot: null,
          prevSnapshot: { ...ref, drawCompletedIds: [...committed.displayDrawCompletedIds] },
          drawPresentationConsumedIds: mergeDrawPresentationConsumed(
            committed,
            committed.displayDrawCompletedIds,
          ),
        });
      }

      if (ref) {
        const syncedPrev = { ...ref, drawCompletedIds: [...committed.displayDrawCompletedIds] };
        const nextPlayer = pickNextDrawPresentationPlayer(
          committed,
          ref,
          committed.displayDrawCompletedIds,
        );
        logDrawReceiveCommit("after", committed, {
          playerId: completingPlayerId,
          nextCompleted: committed.displayDrawCompletedIds,
          nextChosen: nextPlayer,
        });
        if (nextPlayer) {
          logDrawCandidateResolution(committed, ref, nextPlayer, "advancePhase:nextPlayer");
          return beginDrawPlayerAnim(
            committed,
            syncedPrev,
            nextPlayer,
            1,
            1,
            "advancePhase:nextPlayer",
          );
        }
        logDrawCandidateResolution(committed, ref, null, "advancePhase:no-next-player");
      }

      return committed;
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
    antePotRevealed: store.antePotRevealed,
    anteLandedPlayerIds: store.anteLandedPlayerIds,
    dealStaggerCount: store.dealStaggerCount,
    enrollmentPulse: store.enrollmentPulse,
    settleAnimActive: store.settleAnimActive,
    settleCarryOver: store.settleCarryOver,
    nextHandResetActive: store.nextHandResetActive,
    pendingHandSettle: store.pendingHandSettle,
    suppressTurnIndicator:
      store.pendingHandSettle ||
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
    dealPresentationAllowed: store.dealPresentationAllowed,
  };
}

/** Gates clockwise deal GSAP — independent of hero hand card count. */
export function canStartDealPresentation(
  dealPresentationAllowed: boolean,
  sessionPhase: string | null | undefined,
  privateHandReady: boolean,
): boolean {
  const inDealPhase =
    sessionPhase === "reveal" ||
    sessionPhase === "decision" ||
    sessionPhase === "draw" ||
    sessionPhase === "play";
  return dealPresentationAllowed && inDealPhase && privateHandReady;
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
      return 0;
    case "trumpReveal":
      return t.trumpRevealHoldMs;
    case "trumpMerge":
      return t.trumpMergeAnimMs;
    case "drawPlayer":
      if (store.drawAnimSubPhase === "done") {
        return 0;
      }
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
