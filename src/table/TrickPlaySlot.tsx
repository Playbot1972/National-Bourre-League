import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { PlayingCard } from "../components/PlayingCard";
import { serializedToCard } from "./handUi";
import {
  flyOffsetToSlot,
  playFlyKey,
  readCachedPlayOrigin,
  readLivePlayOrigin,
} from "./trickPlayFly";
import type { TrickPlay, TrickPresentationPhase } from "./trickTiming";

interface TrickPlaySlotProps {
  play: TrickPlay;
  index: number;
  presentationPhase: TrickPresentationPhase;
  displayCount: number;
  playerName: string;
  winnerPlayerId?: string | null;
  showWinnerTag?: boolean;
}

export function TrickPlaySlot({
  play,
  index,
  presentationPhase,
  displayCount,
  playerName,
  winnerPlayerId = null,
  showWinnerTag = false,
}: TrickPlaySlotProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [flyStyle, setFlyStyle] = useState<CSSProperties | null>(null);
  const [flyReady, setFlyReady] = useState(false);
  const isWinner = winnerPlayerId != null && play.playerId === winnerPlayerId;
  const isLanding = index === displayCount - 1 && presentationPhase === "live";
  const showWinnerCard =
    isWinner && presentationPhase !== "live" && presentationPhase !== "trickComplete";

  useLayoutEffect(() => {
    if (!isLanding || typeof document === "undefined") {
      setFlyReady(true);
      setFlyStyle(null);
      return;
    }
    const slot = slotRef.current;
    if (!slot) return;

    const cardEl = slot.querySelector(".pcard");
    if (!cardEl) return;

    const playKey = playFlyKey(play);
    const origin =
      readCachedPlayOrigin(playKey) ?? readLivePlayOrigin(play.playerId);
    setFlyReady(true);
    if (!origin) {
      setFlyStyle(null);
      return;
    }

    const cardRect = cardEl.getBoundingClientRect();
    const slotRect = slot.getBoundingClientRect();
    const { dx, dy } = flyOffsetToSlot(origin, slotRect, cardRect);
    setFlyStyle({
      ["--fly-dx" as string]: `${dx}px`,
      ["--fly-dy" as string]: `${dy}px`,
    });
  }, [isLanding, play]);

  const isFlying = isLanding && flyReady && flyStyle != null;
  const isPending = isLanding && !flyReady;

  return (
    <div
      ref={slotRef}
      className={[
        "btrick__play",
        isFlying ? "btrick__play--fly-from-hand" : "",
        isPending ? "btrick__play--fly-pending" : "",
        isWinner && showWinnerCard ? "btrick__play--winner" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={isFlying ? flyStyle ?? undefined : undefined}
    >
      <PlayingCard
        card={serializedToCard(play.card)}
        size="sm"
        state={showWinnerCard && isWinner ? "winner" : "default"}
      />
      <span className="btrick__name muted small">{playerName}</span>
    </div>
  );
}
