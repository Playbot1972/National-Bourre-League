import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { PlayingCard } from "../components/PlayingCard";
import { animateCardToTable } from "./animations/cardMotion";
import { initCardMotion, isCardMotionReady } from "./animations/initMotion";
import { serializedToCard } from "./handUi";
import {
  flyOffsetToSlot,
  playFlyKey,
  resolvePlayOrigin,
} from "./trickPlayFly";
import { CARD_LAND_MS, prefersReducedMotion } from "./trickTiming";
import type { TrickPlay, TrickPresentationPhase } from "./trickTiming";

type FlyMode = "pending" | "gsap" | "css" | "land" | "static";

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
  const [flyMode, setFlyMode] = useState<FlyMode>("static");
  const [cssFly, setCssFly] = useState<{ dx: number; dy: number } | null>(null);
  const isWinner = winnerPlayerId != null && play.playerId === winnerPlayerId;
  const isLanding = index === displayCount - 1 && presentationPhase === "live";
  const showWinnerCard =
    isWinner && presentationPhase !== "live" && presentationPhase !== "trickComplete";

  useLayoutEffect(() => {
    if (!isLanding || typeof document === "undefined") {
      setFlyMode("static");
      setCssFly(null);
      return;
    }

    setFlyMode("pending");
    const slot = slotRef.current;
    if (!slot) return;

    const cardEl = slot.querySelector(".pcard") as HTMLElement | null;
    if (!cardEl) return;

    const playKey = playFlyKey(play);
    const origin = resolvePlayOrigin(play.playerId, playKey);
    const tableRoot = slot.closest(".btable-wrap") ?? document;
    initCardMotion(tableRoot);

    if (!origin) {
      setFlyMode("land");
      setCssFly(null);
      return;
    }

    if (isCardMotionReady() && typeof window !== "undefined") {
      setFlyMode("gsap");
      setCssFly(null);
      animateCardToTable(cardEl, origin, {
        onComplete: () => setFlyMode("static"),
      });
      return;
    }

    const slotRect = slot.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();
    const offset = flyOffsetToSlot(origin, slotRect, cardRect);
    setCssFly(offset);
    setFlyMode("css");

    const landMs = prefersReducedMotion()
      ? Math.round(CARD_LAND_MS * 0.55)
      : CARD_LAND_MS;
    const timer = window.setTimeout(() => {
      setFlyMode("static");
      setCssFly(null);
    }, landMs);
    return () => window.clearTimeout(timer);
  }, [isLanding, play]);

  const flyStyle: CSSProperties | undefined =
    flyMode === "css" && cssFly
      ? {
          ["--fly-dx" as string]: `${cssFly.dx}px`,
          ["--fly-dy" as string]: `${cssFly.dy}px`,
        }
      : undefined;

  return (
    <div
      ref={slotRef}
      className={[
        "btrick__play",
        flyMode === "gsap" ? "btrick__play--gsap-fly" : "",
        flyMode === "css" ? "btrick__play--fly-from-hand" : "",
        flyMode === "pending" ? "btrick__play--fly-pending" : "",
        flyMode === "land" ? "btrick__play--land" : "",
        isWinner && showWinnerCard ? "btrick__play--winner" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={flyStyle}
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
