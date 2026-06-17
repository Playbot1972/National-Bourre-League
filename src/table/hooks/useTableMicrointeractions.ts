import { useEffect, useRef, useState } from "react";
import {
  MICRO_MS,
  createMicroPrevSnapshot,
  diffMicrointeractions,
  EMPTY_MICRO_STATE,
  type MicroTrackInput,
  type MicroTrackState,
} from "../tableMicrointeractions";

export type TableMicrointeractions = MicroTrackState;

export function useTableMicrointeractions(input: MicroTrackInput): TableMicrointeractions {
  const [state, setState] = useState<MicroTrackState>(EMPTY_MICRO_STATE);
  const prevRef = useRef<ReturnType<typeof createMicroPrevSnapshot> | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => () => clearTimers(), []);

  const tricksKey = JSON.stringify(input.tricksByPlayer);

  useEffect(() => {
    const diff = diffMicrointeractions(prevRef.current, input);
    prevRef.current = createMicroPrevSnapshot(input);

    if (
      !diff.turnHandoffPlayerId &&
      !diff.dealerMovedPlayerId &&
      !diff.potTick &&
      Object.keys(diff.trickBadgeIncrements).length === 0 &&
      !diff.trumpReminderPulse &&
      !diff.feedbackErrorPulse &&
      !diff.feedbackSuccessPulse &&
      !diff.winnerFlashPlayerId
    ) {
      return;
    }

    setState((prev) => {
      const next: MicroTrackState = { ...prev };
      if (diff.turnHandoffPlayerId) next.turnHandoffPlayerId = diff.turnHandoffPlayerId;
      if (diff.dealerMovedPlayerId) next.dealerMovedPlayerId = diff.dealerMovedPlayerId;
      if (diff.potTick) next.potTick += 1;
      if (diff.trumpReminderPulse) next.trumpReminderPulse += 1;
      if (diff.feedbackErrorPulse) next.feedbackErrorPulse += 1;
      if (diff.feedbackSuccessPulse) next.feedbackSuccessPulse += 1;
      if (diff.winnerFlashPlayerId) next.winnerFlashPlayerId = diff.winnerFlashPlayerId;
      if (Object.keys(diff.trickBadgeIncrements).length > 0) {
        next.trickBadgeTicks = { ...prev.trickBadgeTicks };
        for (const [playerId, delta] of Object.entries(diff.trickBadgeIncrements)) {
          next.trickBadgeTicks[playerId] = (prev.trickBadgeTicks[playerId] ?? 0) + delta;
        }
      }
      return next;
    });

    if (diff.turnHandoffPlayerId) {
      schedule(() => {
        setState((prev) =>
          prev.turnHandoffPlayerId === diff.turnHandoffPlayerId
            ? { ...prev, turnHandoffPlayerId: null }
            : prev,
        );
      }, MICRO_MS.turnHandoff);
    }

    if (diff.dealerMovedPlayerId) {
      schedule(() => {
        setState((prev) =>
          prev.dealerMovedPlayerId === diff.dealerMovedPlayerId
            ? { ...prev, dealerMovedPlayerId: null }
            : prev,
        );
      }, MICRO_MS.dealerMove);
    }

    if (diff.winnerFlashPlayerId) {
      schedule(() => {
        setState((prev) =>
          prev.winnerFlashPlayerId === diff.winnerFlashPlayerId
            ? { ...prev, winnerFlashPlayerId: null }
            : prev,
        );
      }, MICRO_MS.winnerFlash);
    }
  }, [
    input.turnPlayerId,
    input.dealerId,
    input.potAmount,
    tricksKey,
    input.phase,
    input.showTrumpSuitReminder,
    input.suppressTurn,
    input.actionFeedbackStatus,
    input.trickWinnerSeatId,
    input.trickPhase,
  ]);

  return state;
}
