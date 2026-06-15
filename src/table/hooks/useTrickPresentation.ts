import { useEffect, useRef, useState } from "react";
import {
  CARD_LAND_MS,
  detectTrickResolution,
  isMobileViewport,
  postTrickHoldMs,
  serializedPlays,
  TRICK_SWEEP_MS,
  trumpBeatLedSuit,
  type FrozenTrick,
  type TrickPlay,
  type TrickPresentationPhase,
} from "../trickTiming";
import type { CurrentTrickState } from "../types";

interface UseTrickPresentationInput {
  phase?: string | null;
  currentTrick?: CurrentTrickState | null;
  tricksByPlayer: Record<string, number>;
  participantIds: string[];
  trumpSuit?: string | null;
}

export interface TrickPresentation {
  phase: TrickPresentationPhase;
  displayPlays: TrickPlay[];
  winnerPlayerId: string | null;
  showWinnerTag: boolean;
  displayTricksByPlayer: Record<string, number>;
  suppressTurnPlayerId: boolean;
  trickWinnerSeatId: string | null;
}

export function useTrickPresentation({
  phase,
  currentTrick,
  tricksByPlayer,
  participantIds,
  trumpSuit,
}: UseTrickPresentationInput): TrickPresentation {
  const [presentationPhase, setPresentationPhase] = useState<TrickPresentationPhase>("live");
  const [frozenTrick, setFrozenTrick] = useState<FrozenTrick | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showWinnerTag, setShowWinnerTag] = useState(false);
  const [displayTricksByPlayer, setDisplayTricksByPlayer] = useState(tricksByPlayer);
  const [mobile, setMobile] = useState(isMobileViewport);

  const prevTricksRef = useRef(tricksByPlayer);
  const prevTrickRef = useRef(currentTrick);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
  };

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px), (pointer: coarse)");
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    return () => clearTimers();
  }, []);

  useEffect(() => {
    if (phase !== "play") {
      clearTimers();
      setPresentationPhase("live");
      setFrozenTrick(null);
      setRevealedCount(0);
      setShowWinnerTag(false);
      setDisplayTricksByPlayer(tricksByPlayer);
      prevTricksRef.current = tricksByPlayer;
      prevTrickRef.current = currentTrick;
      return;
    }

    if (presentationPhase !== "live") return;

    const resolved = detectTrickResolution({
      prevTricks: prevTricksRef.current,
      nextTricks: tricksByPlayer,
      participantIds,
      prevTrick: prevTrickRef.current,
    });

    if (resolved) {
      clearTimers();
      setFrozenTrick(resolved);
      setRevealedCount(resolved.plays.length);
      setShowWinnerTag(true);
      setPresentationPhase("hold");
      setDisplayTricksByPlayer(prevTricksRef.current);

      const holdMs = postTrickHoldMs({
        mobile,
        trumpBeat: trumpBeatLedSuit(resolved.plays, resolved.leadSuit, trumpSuit),
      });

      schedule(() => {
        setPresentationPhase("sweep");
        setDisplayTricksByPlayer(tricksByPlayer);
        schedule(() => {
          setPresentationPhase("live");
          setFrozenTrick(null);
          setShowWinnerTag(false);
          setDisplayTricksByPlayer(tricksByPlayer);
          prevTricksRef.current = tricksByPlayer;
          prevTrickRef.current = currentTrick;
          setRevealedCount(0);
        }, TRICK_SWEEP_MS);
      }, holdMs);

      return;
    }

    prevTricksRef.current = tricksByPlayer;
    prevTrickRef.current = currentTrick;
    setDisplayTricksByPlayer(tricksByPlayer);
  }, [
    phase,
    currentTrick,
    tricksByPlayer,
    participantIds,
    trumpSuit,
    mobile,
    presentationPhase,
  ]);

  const livePlays = serializedPlays(currentTrick);
  const targetReveal = livePlays.length;

  useEffect(() => {
    if (presentationPhase !== "live" || phase !== "play") return;
    if (revealedCount >= targetReveal) return;

    const id = window.setTimeout(() => {
      setRevealedCount((count) => Math.min(count + 1, targetReveal));
    }, CARD_LAND_MS);

    return () => window.clearTimeout(id);
  }, [presentationPhase, phase, revealedCount, targetReveal]);

  useEffect(() => {
    if (presentationPhase !== "live" || phase !== "play") return;
    if (targetReveal < revealedCount) {
      setRevealedCount(targetReveal);
    }
  }, [presentationPhase, phase, targetReveal, revealedCount]);

  const displayPlays =
    presentationPhase === "live"
      ? livePlays.slice(0, revealedCount)
      : frozenTrick?.plays ?? [];

  const winnerPlayerId =
    presentationPhase === "live"
      ? null
      : frozenTrick?.winnerId ?? null;

  return {
    phase: presentationPhase,
    displayPlays,
    winnerPlayerId,
    showWinnerTag: showWinnerTag && presentationPhase !== "live",
    displayTricksByPlayer,
    suppressTurnPlayerId: presentationPhase !== "live",
    trickWinnerSeatId: presentationPhase === "live" ? null : frozenTrick?.winnerId ?? null,
  };
}
