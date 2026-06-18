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
  const bankrollKey = JSON.stringify(input.bankrollByPlayer);
  const bourreKey = JSON.stringify(input.bourrePlayerIds);

  useEffect(() => {
    const diff = diffMicrointeractions(prevRef.current, input);
    prevRef.current = createMicroPrevSnapshot(input);

    if (
      !diff.turnHandoffPlayerId &&
      !diff.dealerMovedPlayerId &&
      !diff.potTick &&
      Object.keys(diff.trickBadgeIncrements).length === 0 &&
      Object.keys(diff.bankrollChanges).length === 0 &&
      diff.bourrePlayerIds.length === 0 &&
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
      if (Object.keys(diff.bankrollChanges).length > 0) {
        next.bankrollTicks = { ...prev.bankrollTicks, ...diff.bankrollChanges };
      }
      if (diff.bourrePlayerIds.length > 0) {
        next.bourreAlerts = { ...prev.bourreAlerts };
        for (const playerId of diff.bourrePlayerIds) {
          next.bourreAlerts[playerId] = "pulse";
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

    for (const [playerId, direction] of Object.entries(diff.bankrollChanges)) {
      schedule(() => {
        setState((prev) => {
          if (prev.bankrollTicks[playerId] !== direction) return prev;
          const bankrollTicks = { ...prev.bankrollTicks };
          delete bankrollTicks[playerId];
          return { ...prev, bankrollTicks };
        });
      }, MICRO_MS.bankrollTick);
    }

    for (const playerId of diff.bourrePlayerIds) {
      schedule(() => {
        setState((prev) => {
          if (prev.bourreAlerts[playerId] !== "pulse") return prev;
          return {
            ...prev,
            bourreAlerts: { ...prev.bourreAlerts, [playerId]: "marker" },
          };
        });
      }, MICRO_MS.bourrePulse);

      schedule(() => {
        setState((prev) => {
          if (!prev.bourreAlerts[playerId]) return prev;
          const bourreAlerts = { ...prev.bourreAlerts };
          delete bourreAlerts[playerId];
          return { ...prev, bourreAlerts };
        });
      }, MICRO_MS.bourreMarker);
    }
  }, [
    input.turnPlayerId,
    input.dealerId,
    input.potAmount,
    tricksKey,
    bankrollKey,
    bourreKey,
    input.phase,
    input.showTrumpSuitReminder,
    input.suppressTurn,
    input.actionFeedbackStatus,
    input.trickWinnerSeatId,
    input.trickPhase,
  ]);

  return state;
}
