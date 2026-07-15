import { useEffect, useMemo, useRef, useState } from "react";
import { activePlayerOrder } from "../../game/playerOrder";
import { buildAnteCoinDelayPlan } from "../../session/botActionTiming";
import {
  anteSeatCountdownKey,
  buildAnteSeatCountdownState,
} from "../anteSeatCountdown";
import { seatRingPlayerIds } from "../layout/seatOrder";
import {
  readAntePresentationClock,
  subscribePresentationMotionBusy,
} from "../presentationMotionBusy";
import { prefersReducedMotion } from "../trickTiming";
import type { TurnCountdownState } from "../turnCountdown";
import type { TableSessionData } from "../types";

export interface UseAnteSeatCountdownInput {
  anteAnimActive: boolean;
  session: TableSessionData;
}

/**
 * Drives the avatar countdown ring during ante — one seat at a time, clockwise,
 * using the same cached think delays as ante coin GSAP.
 */
export function useAnteSeatCountdown({
  anteAnimActive,
  session,
}: UseAnteSeatCountdownInput): TurnCountdownState | null {
  const startedAtRef = useRef<number | null>(null);
  const lastKeyRef = useRef<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [clockTick, setClockTick] = useState(0);

  const seatRing = useMemo(
    () => seatRingPlayerIds(session.participantIds, session),
    [session.participantIds, session],
  );
  const playerIds = useMemo(
    () =>
      activePlayerOrder(
        session.dealerId,
        session.participantIds,
        seatRing.length ? seatRing : session.participantIds,
      ),
    [session.dealerId, session.participantIds, seatRing],
  );

  const delayPlan = useMemo(() => {
    if (!anteAnimActive || playerIds.length < 1) return null;
    return buildAnteCoinDelayPlan({
      handNumber: session.handNumber,
      playerIds,
      reducedMotion: prefersReducedMotion(),
    });
  }, [anteAnimActive, session.handNumber, playerIds]);

  const activityKey = anteSeatCountdownKey(session.sessionId, session.handNumber, playerIds);
  const presentationClockKey = `${session.sessionId}:${session.handNumber}:ante`;

  useEffect(() => {
    if (!anteAnimActive || !delayPlan) {
      startedAtRef.current = null;
      lastKeyRef.current = null;
      return;
    }
    if (lastKeyRef.current !== activityKey) {
      const sharedStart = readAntePresentationClock(presentationClockKey);
      startedAtRef.current = sharedStart ?? Date.now();
      lastKeyRef.current = activityKey;
      setNowMs(Date.now());
    }
  }, [anteAnimActive, activityKey, delayPlan, presentationClockKey]);

  useEffect(() => {
    if (!anteAnimActive || !delayPlan) return;
    return subscribePresentationMotionBusy(() => {
      if (lastKeyRef.current !== activityKey) return;
      const sharedStart = readAntePresentationClock(presentationClockKey);
      if (sharedStart != null && startedAtRef.current !== sharedStart) {
        startedAtRef.current = sharedStart;
        setClockTick((tick) => tick + 1);
      }
    });
  }, [anteAnimActive, activityKey, delayPlan, presentationClockKey]);

  useEffect(() => {
    if (!anteAnimActive || !delayPlan || startedAtRef.current == null) return;
    const intervalMs = prefersReducedMotion() ? 50 : 32;
    const id = window.setInterval(() => setNowMs(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [anteAnimActive, activityKey, delayPlan, clockTick]);

  if (!anteAnimActive || !delayPlan || startedAtRef.current == null) {
    return null;
  }

  return buildAnteSeatCountdownState({
    playerIds,
    plan: delayPlan,
    startedAtMs: startedAtRef.current,
    nowMs,
  });
}
