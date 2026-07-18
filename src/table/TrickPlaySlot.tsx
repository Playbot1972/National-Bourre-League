import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { PlayingCard } from "../components/PlayingCard";
import { serializedToCard } from "./handUi";
import {
  enhanceShallowFlyOffset,
  flyOffsetToSlot,
  playFlyKey,
  readSeatPlayOrigin,
  resolvePlayOrigin,
  shallowFlyTravelMs,
} from "./trickPlayFly";
import {
  completeHeroPlayHandoff,
  shouldDeferOpponentFly,
  subscribeHeroPlayHandoff,
} from "./heroPlayHandoff";
import {
  prefersReducedMotion,
  batchTrickFlyStaggerMs,
  trickCardSettleMs,
  trickCardTravelMs,
  type TrickPresentationTimingMode,
} from "./trickTiming";
import {
  trickSlotAwaitingFly,
  trickSlotHeroHandoffClass,
} from "./trickPlaySlotFlyState";
import type { TrickPlay, TrickPresentationPhase } from "./trickTiming";
import { isGameFlowDebugEnabled, logGameFlow } from "./gameFlowDebug";

export interface CardLandedAudioCallbackInput {
  cardId: string;
  playerId: string;
  cardIndex: number;
  cardsInTrick: number;
  takesLead: boolean;
  isLocalPlayer: boolean;
}

type FlyMode = "pending" | "travel" | "settle" | "land" | "static";

interface TrickPlaySlotProps {
  play: TrickPlay;
  index: number;
  presentationPhase: TrickPresentationPhase;
  displayCount: number;
  playerName: string;
  leaderPlayerId?: string | null;
  winnerPlayerId?: string | null;
  /** Skip fly animation for non-live echo / hold rows only. */
  instantPlace?: boolean;
  /** Compress fly timing while draining authoritative backlog. */
  revealCatchUp?: boolean;
  currentUserId?: string | null;
  onCardLanded?: (input: CardLandedAudioCallbackInput) => void;
}

function initialFlyMode(phase: TrickPresentationPhase): FlyMode {
  return phase === "live" ? "pending" : "static";
}

function completeFlight(
  setHasLanded: (value: boolean) => void,
  setFlyMode: (mode: FlyMode) => void,
  setCssFly: (value: { dx: number; dy: number } | null) => void,
  flightStartedRef: { current: boolean },
  debug?: { playKey: string; index: number },
  audio?: {
    onCardLandedRef: { current: TrickPlaySlotProps["onCardLanded"] };
    playRef: { current: TrickPlay };
    indexRef: { current: number };
    displayCountRef: { current: number };
    leaderPlayerIdRef: { current: string | null | undefined };
    currentUserIdRef: { current: string | null | undefined };
    audioFiredRef: { current: boolean };
    playKey: string;
  },
) {
  flightStartedRef.current = false;
  setHasLanded(true);
  setFlyMode("static");
  setCssFly(null);
  if (debug && isGameFlowDebugEnabled()) {
    logGameFlow("TrickPlaySlot", "fly-complete", debug);
  }
  if (
    audio?.playKey &&
    audio.currentUserIdRef.current != null &&
    audio.playRef.current.playerId === audio.currentUserIdRef.current
  ) {
    completeHeroPlayHandoff(audio.playKey);
  }
  if (audio?.onCardLandedRef.current && !audio.audioFiredRef.current) {
    audio.audioFiredRef.current = true;
    const landedPlay = audio.playRef.current;
    const leaderPlayerId = audio.leaderPlayerIdRef.current;
    const takesLead =
      leaderPlayerId != null && landedPlay.playerId === leaderPlayerId;
    audio.onCardLandedRef.current({
      cardId: `${landedPlay.playerId}:${landedPlay.card.rank}:${landedPlay.card.suit}`,
      playerId: landedPlay.playerId,
      cardIndex: audio.indexRef.current,
      cardsInTrick: audio.displayCountRef.current,
      takesLead,
      isLocalPlayer: audio.currentUserIdRef.current === landedPlay.playerId,
    });
  }
}

export function TrickPlaySlot({
  play,
  index,
  presentationPhase,
  displayCount,
  playerName,
  leaderPlayerId = null,
  winnerPlayerId = null,
  instantPlace: _instantPlace = false,
  revealCatchUp = false,
  currentUserId = null,
  onCardLanded,
}: TrickPlaySlotProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const isLivePhase = presentationPhase === "live";
  const [flyMode, setFlyMode] = useState<FlyMode>(() => initialFlyMode(presentationPhase));
  const [cssFly, setCssFly] = useState<{ dx: number; dy: number } | null>(null);
  const [flyShallow, setFlyShallow] = useState(false);
  const [flyTravelMs, setFlyTravelMs] = useState<number | null>(null);
  const [hasLanded, setHasLanded] = useState(false);
  const [handoffGateTick, setHandoffGateTick] = useState(0);
  const flightStartedRef = useRef(false);
  const audioFiredRef = useRef(false);
  const onCardLandedRef = useRef(onCardLanded);
  const leaderPlayerIdRef = useRef(leaderPlayerId);
  const currentUserIdRef = useRef(currentUserId);
  const displayCountRef = useRef(displayCount);
  const indexRef = useRef(index);
  const playRef = useRef(play);
  onCardLandedRef.current = onCardLanded;
  leaderPlayerIdRef.current = leaderPlayerId;
  currentUserIdRef.current = currentUserId;
  displayCountRef.current = displayCount;
  indexRef.current = index;
  playRef.current = play;
  const playKey = playFlyKey(play);
  const timingMode: TrickPresentationTimingMode = revealCatchUp ? "catch-up" : "live";
  const settleMs = trickCardSettleMs(timingMode, prefersReducedMotion());
  const isLeading = leaderPlayerId != null && play.playerId === leaderPlayerId;
  const isWinner = winnerPlayerId != null && play.playerId === winnerPlayerId;
  /** Shift transition only after a completed land — never during fly keyframes. */
  const isSettled = hasLanded;
  /** Current trick leader — green winner border immediately during live play. */
  const showLiveLeaderHighlight =
    isLeading && (presentationPhase === "live" || presentationPhase === "trickComplete");
  const showResolvedWinnerHighlight =
    isWinner &&
    presentationPhase !== "live" &&
    presentationPhase !== "trickComplete";
  const showWinnerCard = showLiveLeaderHighlight || showResolvedWinnerHighlight;
  const isLocalHeroPlay =
    isLivePhase && currentUserId != null && play.playerId === currentUserId;
  const awaitingFly = trickSlotAwaitingFly({
    isLivePhase,
    hasLanded,
    flyMode,
  });

  useLayoutEffect(() => {
    if (isGameFlowDebugEnabled()) {
      logGameFlow("TrickPlaySlot", "play-enter", {
        playKey,
        index,
        instantPlace: _instantPlace,
        isLivePhase,
      });
    }
    setHasLanded(false);
    flightStartedRef.current = false;
    audioFiredRef.current = false;
    setFlyMode(initialFlyMode(presentationPhase));
    setCssFly(null);
    setFlyShallow(false);
    setFlyTravelMs(null);
  }, [playKey, presentationPhase]);

  useLayoutEffect(() => {
    if (hasLanded) return;
    if (flightStartedRef.current) return;

    const audioCtx = {
      onCardLandedRef,
      playRef,
      indexRef,
      displayCountRef,
      leaderPlayerIdRef,
      currentUserIdRef,
      audioFiredRef,
      playKey,
    };

    if (shouldDeferOpponentFly(index)) {
      const unsub = subscribeHeroPlayHandoff(() => {
        setHandoffGateTick((tick) => tick + 1);
      });
      return unsub;
    }

    if (!isLivePhase) {
      completeFlight(setHasLanded, setFlyMode, setCssFly, flightStartedRef, {
        playKey,
        index,
      }, audioCtx);
      return;
    }

    if (typeof document === "undefined") return;

    const slot = slotRef.current;
    if (!slot) return;

    const cardEl = slot.querySelector(".pcard") as HTMLElement | null;
    if (!cardEl) return;

    const origin =
      resolvePlayOrigin(play.playerId, playKey) ?? readSeatPlayOrigin(play.playerId);
    if (!origin) {
      completeFlight(setHasLanded, setFlyMode, setCssFly, flightStartedRef, {
        playKey,
        index,
      }, audioCtx);
      return;
    }

    const reduced = prefersReducedMotion();
    const heroTravelScale = isLocalHeroPlay ? 1.18 : 1;
    const baseTravelMs = Math.round(trickCardTravelMs(timingMode, reduced) * heroTravelScale);
    const landMs = baseTravelMs + trickCardSettleMs(timingMode, reduced);
    const flyStaggerStep = batchTrickFlyStaggerMs(timingMode);
    const flyStaggerMs =
      displayCountRef.current > 1 && index < displayCountRef.current - 1
        ? index * flyStaggerStep
        : 0;

    const startFlight = () => {
      if (flightStartedRef.current) return;
      const liveSlot = slotRef.current;
      if (!liveSlot) return;
      const liveCard = liveSlot.querySelector(".pcard") as HTMLElement | null;
      if (!liveCard) return;

      flightStartedRef.current = true;
      const slotRect = liveSlot.getBoundingClientRect();
      const cardRect = liveCard.getBoundingClientRect();
      const rawOffset = flyOffsetToSlot(origin, slotRect, cardRect);
      const enhanced = enhanceShallowFlyOffset(rawOffset);
      const travelMs = shallowFlyTravelMs(
        baseTravelMs,
        enhanced.rawMagnitude,
        enhanced.shallowBoosted,
      );
      setCssFly({ dx: enhanced.dx, dy: enhanced.dy });
      setFlyShallow(enhanced.shallowBoosted);
      setFlyTravelMs(enhanced.shallowBoosted ? travelMs : null);

      if (isGameFlowDebugEnabled()) {
        logGameFlow("TrickPlaySlot", "fly-start", {
          playKey,
          index,
          travelMs,
          flyStaggerMs,
          shallowBoosted: enhanced.shallowBoosted,
          rawMagnitude: enhanced.rawMagnitude,
          magnitude: enhanced.magnitude,
          localHero:
            currentUserIdRef.current != null &&
            playRef.current.playerId === currentUserIdRef.current,
        });
      }

      setFlyMode("pending");
      const showTimer = window.setTimeout(() => {
        setFlyMode("travel");
      }, 0);
      const doneTimer = window.setTimeout(() => {
        completeFlight(setHasLanded, setFlyMode, setCssFly, flightStartedRef, {
          playKey,
          index,
        }, audioCtx);
      }, landMs);

      return () => {
        window.clearTimeout(showTimer);
        window.clearTimeout(doneTimer);
      };
    };

    if (flyStaggerMs > 0) {
      setFlyMode("pending");
      let innerCleanup: (() => void) | undefined;
      const staggerTimer = window.setTimeout(() => {
        innerCleanup = startFlight();
      }, flyStaggerMs);
      return () => {
        window.clearTimeout(staggerTimer);
        innerCleanup?.();
      };
    }

    return startFlight();
  }, [
    hasLanded,
    isLivePhase,
    index,
    play.playerId,
    playKey,
    handoffGateTick,
    revealCatchUp,
    timingMode,
  ]);

  const flyStyle: CSSProperties = {
    ["--slot-index" as string]: index,
    zIndex: 10 + index,
    ...(cssFly
      ? {
          ["--fly-dx" as string]: `${cssFly.dx}px`,
          ["--fly-dy" as string]: `${cssFly.dy}px`,
        }
      : {}),
    ...(flyTravelMs != null
      ? { ["--trick-card-travel-ms" as string]: `${flyTravelMs}ms` }
      : {}),
    ["--trick-card-settle-ms" as string]: `${settleMs}ms`,
  };

  return (
    <div
      ref={slotRef}
      className={[
        "btrick__play",
        hasLanded ? "btrick__play--landed" : "",
        isSettled ? "btrick__play--settled" : "",
        hasLanded && flyMode === "static" ? "btrick__play--static-landed" : "",
        awaitingFly ? "btrick__play--awaiting-fly" : "",
        flyMode === "travel" ? "btrick__play--fly-from-hand" : "",
        trickSlotHeroHandoffClass({ isLocalHeroPlay, flyMode })
          ? "btrick__play--hero-handoff"
          : "",
        flyShallow ? "btrick__play--fly-shallow" : "",
        flyMode === "pending" ? "btrick__play--fly-pending" : "",
        flyMode === "land" ? "btrick__play--land" : "",
        flyMode === "settle" ? "btrick__play--settle" : "",
        showLiveLeaderHighlight ? "btrick__play--leading" : "",
        showWinnerCard ? "btrick__play--winner" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={flyStyle}
      data-slot-index={index}
    >
      <PlayingCard
        card={serializedToCard(play.card)}
        size="sm"
        state={showWinnerCard ? "winner" : "default"}
      />
      <span className="btrick__name muted small">{playerName}</span>
    </div>
  );
}
