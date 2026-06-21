import { useLayoutEffect, useRef, useState } from "react";
import { PlayingCard } from "../components/PlayingCard";
import { animateCardToTable } from "./animations/cardMotion";
import { initCardMotion } from "./animations/initMotion";
import { serializedToCard } from "./handUi";
import {
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
}

export function TrickPlaySlot({
  play,
  index,
  presentationPhase,
  displayCount,
  playerName,
  winnerPlayerId = null,
}: TrickPlaySlotProps) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [flyReady, setFlyReady] = useState(false);
  const [gsapFlying, setGsapFlying] = useState(false);
  const isWinner = winnerPlayerId != null && play.playerId === winnerPlayerId;
  const isLanding = index === displayCount - 1 && presentationPhase === "live";
  const showWinnerCard =
    isWinner && presentationPhase !== "live" && presentationPhase !== "trickComplete";

  useLayoutEffect(() => {
    if (!isLanding || typeof document === "undefined") {
      setFlyReady(true);
      setGsapFlying(false);
      return;
    }
    const slot = slotRef.current;
    if (!slot) return;

    const cardEl = slot.querySelector(".pcard") as HTMLElement | null;
    if (!cardEl) return;

    const playKey = playFlyKey(play);
    const origin =
      readCachedPlayOrigin(playKey) ?? readLivePlayOrigin(play.playerId);

    initCardMotion(slot.closest(".btable-wrap") ?? document);

    if (!origin) {
      setFlyReady(true);
      setGsapFlying(false);
      return;
    }

    setGsapFlying(true);
    setFlyReady(true);
    animateCardToTable(cardEl, origin, {
      onComplete: () => setGsapFlying(false),
    });
  }, [isLanding, play]);

  const isPending = isLanding && !flyReady;

  return (
    <div
      ref={slotRef}
      className={[
        "btrick__play",
        gsapFlying ? "btrick__play--gsap-fly" : "",
        isPending ? "btrick__play--fly-pending" : "",
        isWinner && showWinnerCard ? "btrick__play--winner" : "",
      ]
        .filter(Boolean)
        .join(" ")}
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
