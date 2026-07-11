import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { PlayingCard } from "../components/PlayingCard";
import { serializedToCard } from "./handUi";
import {
  flyOffsetToSlot,
  playFlyKey,
  resolvePlayOrigin,
} from "./trickPlayFly";
import {
  prefersReducedMotion,
  TRICK_CARD_SETTLE_MS,
  TRICK_CARD_TRAVEL_MS,
} from "./trickTiming";
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
  /** Skip fly animation (trump UI / layout settling). */
  instantPlace?: boolean;
  currentUserId?: string | null;
  onCardLanded?: (input: CardLandedAudioCallbackInput) => void;
}

function completeFlight(
  setHasLanded: (value: boolean) => void,
  setFlyMode: (mode: FlyMode) => void,
  setCssFly: (value: { dx: number; dy: number } | null) => void,
  flightStartedRef: { current: boolean },
  debug?: { playKey: string; index: number },
  audio?: {
    onCardLanded?: TrickPlaySlotProps["onCardLanded"];
    play: TrickPlay;
    index: number;
    displayCount: number;
    leaderPlayerId?: string | null;
    currentUserId?: string | null;
    audioFiredRef: { current: boolean };
  },
) {
  flightStartedRef.current = false;
  setHasLanded(true);
  setFlyMode("static");
  setCssFly(null);
  if (debug && isGameFlowDebugEnabled()) {
    logGameFlow("TrickPlaySlot", "fly-complete", debug);
  }
  if (audio?.onCardLanded && !audio.audioFiredRef.current) {
    audio.audioFiredRef.current = true;
    const takesLead =
      audio.leaderPlayerId != null && audio.play.playerId === audio.leaderPlayerId;
    audio.onCardLanded({
      cardId: `${audio.play.playerId}:${audio.play.card.rank}:${audio.play.card.suit}`,
      playerId: audio.play.playerId,
      cardIndex: audio.index,
      cardsInTrick: audio.displayCount,
      takesLead,
      isLocalPlayer: audio.currentUserId === audio.play.playerId,
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
  instantPlace = false,
  currentUserId = null,
  onCardLanded,
}: TrickPlaySlotProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [flyMode, setFlyMode] = useState<FlyMode>("static");
  const [cssFly, setCssFly] = useState<{ dx: number; dy: number } | null>(null);
  const [hasLanded, setHasLanded] = useState(false);
  const flightStartedRef = useRef(false);
  const audioFiredRef = useRef(false);
  const playKey = playFlyKey(play);
  const isLeading = leaderPlayerId != null && play.playerId === leaderPlayerId;
  const isWinner = winnerPlayerId != null && play.playerId === winnerPlayerId;
  const isLivePhase = presentationPhase === "live";
  const isLanding = index === displayCount - 1 && isLivePhase;
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

  useLayoutEffect(() => {
    if (isGameFlowDebugEnabled()) {
      logGameFlow("TrickPlaySlot", "play-enter", {
        playKey,
        index,
        instantPlace,
        isLanding,
      });
    }
    setHasLanded(false);
    flightStartedRef.current = false;
    audioFiredRef.current = false;
    setFlyMode("static");
    setCssFly(null);
  }, [playKey]);

  useLayoutEffect(() => {
    if (hasLanded) return;

    const audioCtx = {
      onCardLanded,
      play,
      index,
      displayCount,
      leaderPlayerId,
      currentUserId,
      audioFiredRef,
    };

    if (instantPlace || !isLivePhase) {
      completeFlight(setHasLanded, setFlyMode, setCssFly, flightStartedRef, {
        playKey,
        index,
      }, audioCtx);
      return;
    }

    if (!isLanding) {
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

    const origin = resolvePlayOrigin(play.playerId, playKey);
    if (!origin) {
      completeFlight(setHasLanded, setFlyMode, setCssFly, flightStartedRef, {
        playKey,
        index,
      }, audioCtx);
      return;
    }

    const reduced = prefersReducedMotion();
    const travelMs = reduced ? Math.round(TRICK_CARD_TRAVEL_MS * 0.55) : TRICK_CARD_TRAVEL_MS;
    const settleMs = reduced ? Math.round(TRICK_CARD_SETTLE_MS * 0.55) : TRICK_CARD_SETTLE_MS;
    flightStartedRef.current = true;

    const slotRect = slot.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();
    const offset = flyOffsetToSlot(origin, slotRect, cardRect);
    setCssFly(offset);
    setFlyMode("pending");

    if (isGameFlowDebugEnabled()) {
      logGameFlow("TrickPlaySlot", "fly-start", { playKey, index, travelMs, settleMs });
    }

    const showTimer = window.setTimeout(() => setFlyMode("travel"), 0);
    const settleTimer = window.setTimeout(() => setFlyMode("settle"), travelMs);
    const doneTimer = window.setTimeout(() => {
      completeFlight(setHasLanded, setFlyMode, setCssFly, flightStartedRef, {
        playKey,
        index,
      }, audioCtx);
    }, travelMs + settleMs);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(doneTimer);
    };
  }, [hasLanded, instantPlace, isLanding, isLivePhase, play.playerId, playKey, onCardLanded, leaderPlayerId, currentUserId, displayCount, index, play]);

  const flyStyle: CSSProperties = {
    ["--slot-index" as string]: index,
    zIndex: 10 + index,
    ...(cssFly
      ? {
          ["--fly-dx" as string]: `${cssFly.dx}px`,
          ["--fly-dy" as string]: `${cssFly.dy}px`,
        }
      : {}),
  };

  return (
    <div
      ref={slotRef}
      className={[
        "btrick__play",
        hasLanded ? "btrick__play--landed" : "",
        isSettled ? "btrick__play--settled" : "",
        hasLanded && flyMode === "static" ? "btrick__play--static-landed" : "",
        flyMode === "travel" ? "btrick__play--fly-from-hand" : "",
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
