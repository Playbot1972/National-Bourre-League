import { useEffect, useLayoutEffect, useRef } from "react";
import type { TrickPresentation } from "./useTrickPresentation";
import type { TrickCollectedAudioInput } from "../../audio/audioEvents";
import {
  animateTrickCardsToWonPile,
  clearWonTrickCollectionArtifacts,
  hasActiveWonTrickFlights,
  killWonTrickFlights,
  readTrickRowCardElements,
  WON_TRICK_FLY_MAX_MS,
} from "../animations/wonTrickPileMotion";
import { setTrickCollectionActive } from "../presentationMotionBusy";
import { TRICK_RAKE_MS } from "../trickTiming";
import { wonTrickBookKey } from "../wonTrickPileModel";
import { presentationScopeKey } from "../presentationScope";

export interface UseWonTrickCollectionInput {
  trickPresentation: TrickPresentation;
  handNumber: number;
  sessionPhase?: string | null;
  handComplete?: boolean;
  tableRootRef: React.RefObject<HTMLElement | null>;
  onTrickCollectionStart?: (input: Omit<TrickCollectedAudioInput, "playerCount">) => void;
  onCollectionComplete?: () => void;
}

const TRICK_RESOLVED_PHASES = new Set(["nextLeadReady", "live"]);

/**
 * GSAP trick collection — blocks bots until the packet reaches the won-tricks pile.
 */
export function useWonTrickCollection({
  trickPresentation,
  handNumber,
  sessionPhase = null,
  handComplete = false,
  tableRootRef,
  onTrickCollectionStart,
  onCollectionComplete,
}: UseWonTrickCollectionInput): void {
  const lastCollectKeyRef = useRef<string | null>(null);
  const handNumberRef = useRef(handNumber);
  const prevPhaseRef = useRef(trickPresentation.phase);
  const trickCleanupTimerRef = useRef<number | null>(null);
  const onCollectionCompleteRef = useRef(onCollectionComplete);
  onCollectionCompleteRef.current = onCollectionComplete;

  const clearTrickCleanupTimer = () => {
    if (trickCleanupTimerRef.current != null) {
      window.clearTimeout(trickCleanupTimerRef.current);
      trickCleanupTimerRef.current = null;
    }
  };

  const scheduleTrickArtifactCleanup = (root: HTMLElement) => {
    clearTrickCleanupTimer();
    const delay = hasActiveWonTrickFlights() ? WON_TRICK_FLY_MAX_MS + 60 : 0;
    trickCleanupTimerRef.current = window.setTimeout(() => {
      trickCleanupTimerRef.current = null;
      clearAllPileRevealFlags(root);
    }, delay);
  };

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    if (!root) return;

    if (handNumberRef.current !== handNumber) {
      handNumberRef.current = handNumber;
      lastCollectKeyRef.current = null;
      clearTrickCleanupTimer();
      clearWonTrickCollectionArtifacts(root);
      return;
    }

    const handEndedWhileCollecting =
      handComplete &&
      trickPresentation.phase !== "collectTrick" &&
      trickPresentation.phase !== "winnerReveal";
    if (
      handEndedWhileCollecting ||
      (sessionPhase != null && sessionPhase !== "play")
    ) {
      lastCollectKeyRef.current = null;
      clearTrickCleanupTimer();
      clearWonTrickCollectionArtifacts(root);
    }
  }, [handNumber, handComplete, sessionPhase, trickPresentation.phase, tableRootRef]);

  useLayoutEffect(() => {
    const prev = prevPhaseRef.current;
    const phase = trickPresentation.phase;
    prevPhaseRef.current = phase;

    const root = tableRootRef.current;
    if (!root) return;

    if (prev === "collectTrick" && TRICK_RESOLVED_PHASES.has(phase)) {
      lastCollectKeyRef.current = null;
      scheduleTrickArtifactCleanup(root);
    }

    if (phase !== "collectTrick") {
      return;
    }

    const winnerId = trickPresentation.trickWinnerSeatId;
    const frozen = trickPresentation.frozenTrick;
    if (!winnerId || !frozen) return;

    const collectKey = `${frozen.trickNumber}:${winnerId}:${frozen.plays.length}`;
    if (lastCollectKeyRef.current === collectKey) return;
    lastCollectKeyRef.current = collectKey;

    clearTrickCleanupTimer();
    killWonTrickFlights();
    removeStaleGhosts(root);

    const cardEls = readTrickRowCardElements(root);
    const finishCollection = () => onCollectionCompleteRef.current?.();

    if (!cardEls.length) {
      finishCollection();
      return;
    }

    const bookIndex = Math.max(
      0,
      (trickPresentation.displayTricksByPlayer[winnerId] ?? 1) - 1,
    );
    const trickKey = wonTrickBookKey({
      playerId: winnerId,
      handNumber,
      trickNumber: frozen.trickNumber,
    });
    const collectionScopeKey = presentationScopeKey(handNumber, frozen.trickNumber);

    const rakeDelay = TRICK_RAKE_MS;
    setTrickCollectionActive(true, collectionScopeKey);
    const rakeTimer = window.setTimeout(() => {
      onTrickCollectionStart?.({
        trickId: frozen.trickNumber,
        winningSeat: winnerId,
      });
      animateTrickCardsToWonPile(cardEls, {
        winnerPlayerId: winnerId,
        trickKey,
        bookIndex,
        root,
        host: root,
        onComplete: () => {
          setTrickCollectionActive(false, collectionScopeKey);
          finishCollection();
        },
      });
    }, rakeDelay);

    return () => {
      window.clearTimeout(rakeTimer);
      setTrickCollectionActive(false, collectionScopeKey);
    };
  }, [
    trickPresentation.phase,
    trickPresentation.trickWinnerSeatId,
    trickPresentation.frozenTrick,
    trickPresentation.displayTricksByPlayer,
    handNumber,
    tableRootRef,
    onTrickCollectionStart,
    onCollectionComplete,
  ]);

  useEffect(() => () => clearTrickCleanupTimer(), []);

  useLayoutEffect(() => {
    const root = tableRootRef.current;
    return () => {
      clearTrickCleanupTimer();
      if (root) clearWonTrickCollectionArtifacts(root);
      else killWonTrickFlights();
    };
  }, [tableRootRef]);
}

function clearAllPileRevealFlags(root: ParentNode): void {
  for (const seat of root.querySelectorAll(".bseat--pile-reveal-ready")) {
    seat.classList.remove("bseat--pile-reveal-ready");
  }
}

function removeStaleGhosts(root: ParentNode): void {
  for (const ghost of root.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) {
    ghost.remove();
  }
}
