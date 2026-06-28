/**
 * Session hand-flow invariants — pure checks at ownership boundaries.
 * Mutation guards always throw; observability checks warn unless strict mode is on.
 */

import { HAND_PHASE } from "../game/types";
import type { HandFlowAction, HandFlowEvent, HandFlowPhase, HandFlowSessionView } from "./handPhaseMachine";
import {
  HAND_FLOW_PHASE,
  buildHandFlowSnapshot,
  canSubmitHandAction,
  isHandFlowTransitionAllowed,
} from "./handPhaseMachine";
import type { HandFlowSnapshot } from "./handPhaseMachine";
import { authoritativeCurrentHand } from "./liveHand";
import { isInvariantsStrict, logInvariantViolation } from "./invariantDebug";

export class HandInvariantError extends Error {
  readonly code: string;
  readonly context: Record<string, unknown>;

  constructor(code: string, message: string, context: Record<string, unknown> = {}) {
    super(message);
    this.name = "HandInvariantError";
    this.code = code;
    this.context = context;
  }
}

/** Always throw — use at write boundaries where illegal state must be rejected. */
export function failInvariant(
  code: string,
  message: string,
  context: Record<string, unknown> = {},
): never {
  throw new HandInvariantError(code, message, context);
}

/** Throw in strict/dev/test; otherwise log a diagnostic warning. */
export function checkInvariant(
  condition: boolean,
  code: string,
  message: string,
  context: Record<string, unknown> = {},
): void {
  if (condition) return;
  if (isInvariantsStrict()) {
    failInvariant(code, message, context);
  }
  logInvariantViolation(code, message, context);
}

const ACTION_TO_FLOW_EVENT: Partial<Record<HandFlowAction, HandFlowEvent>> = {
  enrollment_in: "enrollment_step",
  enrollment_pass: "enrollment_step",
  enrollment_timeout: "enrollment_step",
  decision_play: "decision_step",
  decision_pass: "decision_step",
  advance_reveal: "advance_reveal",
  submit_draw: "submit_draw",
  draw_fold: "draw_fold",
  play_card: "play_card",
  vote_cowin: "cowin_pending",
  record_hand: "record_hand",
};

/**
 * Protects against contradictory session vs card-phase state (e.g. play phase with
 * flow phase still enrollment) that causes wrong UI turn highlights and bot hints.
 */
export function assertConsistentHandFlowPhase(snapshot: HandFlowSnapshot): void {
  const { handPhase, phase, handComplete, trickCount } = snapshot;

  if (handPhase === HAND_PHASE.PLAY) {
    const expected =
      handComplete || trickCount >= 5 ? HAND_FLOW_PHASE.SETTLE : HAND_FLOW_PHASE.PLAY;
    if (phase !== expected && phase !== HAND_FLOW_PHASE.SETTLE) {
      failInvariant(
        "inconsistent_hand_phase",
        `card phase play maps to ${expected}, got flow phase ${phase}`,
        { handPhase, phase, handComplete, trickCount },
      );
    }
  } else if (handPhase === HAND_PHASE.DRAW && phase !== HAND_FLOW_PHASE.DRAW) {
    failInvariant(
      "inconsistent_hand_phase",
      `card phase draw requires flow phase draw, got ${phase}`,
      { handPhase, phase },
    );
  } else if (handPhase === HAND_PHASE.REVEAL && phase !== HAND_FLOW_PHASE.DEAL) {
    failInvariant(
      "inconsistent_hand_phase",
      `card phase reveal requires flow phase deal, got ${phase}`,
      { handPhase, phase },
    );
  } else if (
    handPhase === HAND_PHASE.DECISION &&
    phase !== HAND_FLOW_PHASE.ENROLLMENT
  ) {
    failInvariant(
      "inconsistent_hand_phase",
      `card phase decision requires flow phase enrollment, got ${phase}`,
      { handPhase, phase },
    );
  }
}

/**
 * Protects against multiple or missing turn owners during draw/play/enrollment.
 */
export function assertSingleTurnOwner(
  snapshot: HandFlowSnapshot,
  session: HandFlowSessionView,
): void {
  const hand = authoritativeCurrentHand(session);
  const needsTurn =
    snapshot.phase === HAND_FLOW_PHASE.DRAW ||
    snapshot.phase === HAND_FLOW_PHASE.PLAY ||
    snapshot.phase === HAND_FLOW_PHASE.ENROLLMENT;

  if (!needsTurn) return;

  const handTurn = hand.turnPlayerId ?? null;
  const flowTurn = snapshot.turnPlayerId;

  if (snapshot.phase === HAND_FLOW_PHASE.DRAW || snapshot.phase === HAND_FLOW_PHASE.PLAY) {
    if (flowTurn !== handTurn) {
      failInvariant(
        "turn_owner_mismatch",
        "Flow turn owner disagrees with currentHand.turnPlayerId",
        { flowTurn, handTurn, phase: snapshot.phase },
      );
    }
    if (handTurn && snapshot.participantIds.length && !snapshot.participantIds.includes(handTurn)) {
      failInvariant(
        "turn_owner_not_participant",
        "Turn player is not in participantIds",
        { handTurn, participantIds: snapshot.participantIds },
      );
    }
  }

  if (snapshot.phase === HAND_FLOW_PHASE.ENROLLMENT) {
    if (!snapshot.enrollmentActive && !snapshot.pagatDecisionActive && flowTurn) {
      failInvariant(
        "orphan_enrollment_turn",
        "Turn owner set while enrollment gate is inactive",
        { flowTurn, phase: snapshot.phase },
      );
    }
  }

  if (needsTurn && !flowTurn && snapshot.participantIds.length > 0) {
    checkInvariant(
      false,
      "missing_turn_owner",
      "Active hand phase has no turn owner",
      { phase: snapshot.phase, participantIds: snapshot.participantIds },
    );
  }
}

/** Protects against executing writes that skip the documented transition table. */
export function assertHandFlowTransition(
  from: HandFlowPhase,
  event: HandFlowEvent,
  context: Record<string, unknown> = {},
): void {
  if (!isHandFlowTransitionAllowed(from, event)) {
    failInvariant(
      "illegal_transition",
      `Transition not allowed: ${from} + ${event}`,
      { from, event, ...context },
    );
  }
}

/** Map a guarded player action to its primary flow event for transition checks. */
export function flowEventForAction(action: HandFlowAction): HandFlowEvent | null {
  return ACTION_TO_FLOW_EVENT[action] ?? null;
}

/**
 * Composite read-model check — run on snapshots before rendering or orchestrating.
 */
export function assertHandFlowConsistent(session: HandFlowSessionView | null | undefined): void {
  if (!session) return;
  const snapshot = buildHandFlowSnapshot({ session });
  assertConsistentHandFlowPhase(snapshot);
  assertSingleTurnOwner(snapshot, session);
}

/**
 * Protects against settlement while tricks are still in progress unless the mode
 * explicitly allows early close (push / solo / co-win carry).
 */
export function assertSettlementEntryAllowed(
  session: HandFlowSessionView,
  {
    settlement,
    allowIncomplete = false,
  }: { settlement?: string | null; allowIncomplete?: boolean } = {},
): void {
  const snapshot = buildHandFlowSnapshot({ session });
  assertConsistentHandFlowPhase(snapshot);

  const earlyCloseModes = new Set([
    "push",
    "co_win_carry",
    "non_winner_ante_up",
  ]);
  const mode = settlement ?? null;
  if (allowIncomplete || (mode && earlyCloseModes.has(mode))) {
    return;
  }

  if (snapshot.phase === HAND_FLOW_PHASE.PLAY && !snapshot.handComplete) {
    failInvariant(
      "settlement_before_play_complete",
      "Cannot settle a win/split while play is incomplete",
      {
        phase: snapshot.phase,
        trickCount: snapshot.trickCount,
        handComplete: snapshot.handComplete,
        settlement: mode,
      },
    );
  }

  if (
    snapshot.phase !== HAND_FLOW_PHASE.SETTLE &&
    !snapshot.handComplete &&
    !snapshot.pendingCoWin
  ) {
    failInvariant(
      "settlement_before_play_complete",
      "Hand is not ready to settle",
      {
        phase: snapshot.phase,
        trickCount: snapshot.trickCount,
        handComplete: snapshot.handComplete,
        pendingCoWin: snapshot.pendingCoWin,
        settlement: mode,
      },
    );
  }
}

/**
 * Strengthens assertCanSubmitHandAction with transition-table enforcement.
 */
export function assertHandActionAllowed(
  session: HandFlowSessionView,
  action: HandFlowAction,
  playerId: string,
  actorId: string,
  drawCompletedIds: string[] = [],
): void {
  const snapshot = buildHandFlowSnapshot({ session });
  assertConsistentHandFlowPhase(snapshot);

  const result = canSubmitHandAction({
    snapshot,
    action,
    playerId,
    actorId,
    drawCompletedIds,
  });
  if (!result.ok) {
    failInvariant(
      "action_blocked",
      `Action ${action} blocked: ${result.reason ?? "unknown"}`,
      { action, playerId, actorId, reason: result.reason, phase: snapshot.phase },
    );
  }

  const event = flowEventForAction(action);
  if (event) {
    if (action === "draw_fold") {
      const allowed =
        isHandFlowTransitionAllowed(snapshot.phase, "draw_fold") ||
        isHandFlowTransitionAllowed(snapshot.phase, "solo_win");
      if (!allowed) {
        failInvariant(
          "illegal_transition",
          `Draw fold not allowed from phase ${snapshot.phase}`,
          { action, phase: snapshot.phase },
        );
      }
    } else {
      assertHandFlowTransition(snapshot.phase, event, { action, playerId });
    }
  }

  if (action === "record_hand") {
    assertSettlementEntryAllowed(session, {});
  }
}

/**
 * Protects against duplicate concurrent bot-advance executors (client request storm).
 * Coalesced schedule requests are expected; double-execute is not.
 */
export function assertBotAdvanceNotInFlight(
  inFlight: boolean,
  context: Record<string, unknown> = {},
): void {
  if (!inFlight) return;
  checkInvariant(
    false,
    "duplicate_bot_advance",
    "Bot advance already in flight — duplicate execute blocked",
    context,
  );
}

/**
 * Protects against chip creation/destruction during settlement.
 * @param tolerance — allow sub-cent float noise (default 0).
 */
export function assertSessionChipConserved(
  beforeTotal: number,
  afterTotal: number,
  context: Record<string, unknown> = {},
  tolerance = 0,
): void {
  const delta = Math.abs(beforeTotal - afterTotal);
  if (delta <= tolerance) return;
  const message = `Session chip total drifted: ${beforeTotal} → ${afterTotal} (Δ ${afterTotal - beforeTotal})`;
  if (isInvariantsStrict()) {
    failInvariant("chip_total_drift", message, { beforeTotal, afterTotal, ...context });
  }
  logInvariantViolation("chip_total_drift", message, { beforeTotal, afterTotal, ...context });
}
