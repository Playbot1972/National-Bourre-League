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
}

function completeFlight(
  setHasLanded: (value: boolean) => void,
  setFlyMode: (mode: FlyMode) => void,
  setCssFly: (value: { dx: number; dy: number } | null) => void,
  flightStartedRef: { current: boolean },
  debug?: { playKey: string; index: number },
) {
  flightStartedRef.current = false;
  setHasLanded(true);
  setFlyMode("static");
  setCssFly(null);
  if (debug && isGameFlowDebugEnabled()) {
    logGameFlow("TrickPlaySlot", "fly-complete", debug);
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
}: TrickPlaySlotProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [flyMode, setFlyMode] = useState<FlyMode>("static");
  const [cssFly, setCssFly] = useState<{ dx: number; dy: number } | null>(null);
  const [hasLanded, setHasLanded] = useState(false);
  const flightStartedRef = useRef(false);
  const playKey = playFlyKey(play);
  const isLeading = leaderPlayerId != null && play.playerId === leaderPlayerId;
  const isWinner = winnerPlayerId != null && play.playerId === winnerPlayerId;
  const isLivePhase = presentationPhase === "live";
  const isLanding = index === displayCount - 1 && isLivePhase;
  /** Shift transition only after a completed land — never during fly keyframes. */
  const isSettled = hasLanded;
  const showLeadingCard =
    isLeading &&
    (presentationPhase === "live" || presentationPhase === "trickComplete");
  const showWinnerCard =
    isWinner && presentationPhase !== "live" && presentationPhase !== "trickComplete";

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
    setFlyMode("static");
    setCssFly(null);
  }, [playKey]);

  useLayoutEffect(() => {
    if (hasLanded) return;

    if (instantPlace || !isLivePhase) {
      completeFlight(setHasLanded, setFlyMode, setCssFly, flightStartedRef, {
        playKey,
        index,
      });
      return;
    }

    if (!isLanding) {
      completeFlight(setHasLanded, setFlyMode, setCssFly, flightStartedRef, {
        playKey,
        index,
      });
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
      });
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
      });
    }, travelMs + settleMs);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(settleTimer);
      window.clearTimeout(doneTimer);
    };
  }, [hasLanded, instantPlace, isLanding, isLivePhase, play.playerId, playKey]);

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
        showLeadingCard ? "btrick__play--leading" : "",
        isWinner && showWinnerCard ? "btrick__play--winner" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={flyStyle}
      data-slot-index={index}
    >
      <PlayingCard
        card={serializedToCard(play.card)}
        size="sm"
        state={
          showWinnerCard && isWinner
            ? "winner"
            : showLeadingCard && isLeading
              ? "trick-leading"
              : "default"
        }
      />
      <span className="btrick__name muted small">{playerName}</span>
    </div>
  );
}
