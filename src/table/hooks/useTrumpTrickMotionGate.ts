import { useEffect, useRef, useState } from "react";
import { CARD_LAND_MS } from "../trickTiming";
import type { SerializedCard } from "../types";

const TRUMP_TRICK_GATE_MS = CARD_LAND_MS + 320;

/**
 * Suppress trick-card fly animations while the center trump UI is settling
 * (upcard on table → opening lead clears trump → suit badge appears).
 */
export function useTrumpTrickMotionGate(
  phase: string | null | undefined,
  trumpUpcard: SerializedCard | null | undefined,
  trickCardCount: number,
): boolean {
  const sawTrumpUpcardRef = useRef(false);
  const [gateActive, setGateActive] = useState(false);

  useEffect(() => {
    if (phase !== "play") {
      sawTrumpUpcardRef.current = false;
      setGateActive(false);
      return;
    }

    if (trumpUpcard) {
      sawTrumpUpcardRef.current = true;
      setGateActive(true);
      return;
    }

    if (!sawTrumpUpcardRef.current) {
      setGateActive(false);
      return;
    }

    setGateActive(true);
    const id = window.setTimeout(() => {
      setGateActive(false);
      sawTrumpUpcardRef.current = false;
    }, TRUMP_TRICK_GATE_MS);
    return () => window.clearTimeout(id);
  }, [phase, trumpUpcard]);

  useEffect(() => {
    if (!gateActive || trumpUpcard || trickCardCount === 0) return;
    const id = window.setTimeout(() => {
      setGateActive(false);
      sawTrumpUpcardRef.current = false;
    }, TRUMP_TRICK_GATE_MS);
    return () => window.clearTimeout(id);
  }, [gateActive, trumpUpcard, trickCardCount]);

  return gateActive;
}
