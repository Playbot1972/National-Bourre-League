import { useEffect, useMemo, useRef, useState } from "react";
import { activePlayerOrder } from "../../game/playerOrder";
import { buildAnteCoinDelayPlan } from "../../session/botActionTiming";
import { buildAntePresentationSchedule } from "../antePresentationSchedule";
import { buildAnteSeatCountdownState } from "../anteSeatCountdown";
import { seatRingPlayerIds } from "../layout/seatOrder";
import {
  readAntePresentationTimelineSec,
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
 * Drives the avatar countdown ring from the live GSAP ante timeline — no parallel
 * wall-clock simulation.
 */
export function useAnteSeatCountdown({
  anteAnimActive,
  session,
}: UseAnteSeatCountdownInput): TurnCountdownState | null {
  const [elapsedSec, setElapsedSec] = useState<number | null>(null);
  const rafRef = useRef(0);

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

  const reducedMotion = prefersReducedMotion();
  const presentationKey = `${session.sessionId}:${session.handNumber}:ante`;

  const schedule = useMemo(() => {
    if (!anteAnimActive || playerIds.length < 1) return null;
    const plan = buildAnteCoinDelayPlan({
      handNumber: session.handNumber,
      playerIds,
      reducedMotion,
    });
    return buildAntePresentationSchedule(plan, reducedMotion);
  }, [anteAnimActive, session.handNumber, playerIds, reducedMotion]);

  useEffect(() => {
    if (!anteAnimActive || !schedule) {
      setElapsedSec(null);
      return;
    }

    const sample = () => {
      const next = readAntePresentationTimelineSec(presentationKey);
      setElapsedSec(next);
      rafRef.current = window.requestAnimationFrame(sample);
    };

    const unsubscribe = subscribePresentationMotionBusy(() => {
      const next = readAntePresentationTimelineSec(presentationKey);
      setElapsedSec(next);
    });

    rafRef.current = window.requestAnimationFrame(sample);
    return () => {
      unsubscribe();
      window.cancelAnimationFrame(rafRef.current);
    };
  }, [anteAnimActive, presentationKey, schedule]);

  if (!anteAnimActive || !schedule || elapsedSec == null) {
    return null;
  }

  return buildAnteSeatCountdownState({ schedule, elapsedSec });
}
