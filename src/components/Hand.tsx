import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { PlayingCard, type CardState } from "./PlayingCard";
import type { Card } from "../types";
import type { CardGestureMode } from "./useCardGestureHandlers";
import { useCardGestureHandlers } from "./useCardGestureHandlers";
import { cardKey } from "../game/cardUtils";
import { cardWidthForHandSize, computeHandFanOverlapPx } from "./handLayout";
import "./Hand.css";

export interface HandCardInteraction {
  mode: CardGestureMode;
  isMyTurn?: boolean;
  legalPlayIndices?: number[];
  playingIndex?: number | null;
  illegalShakeIndex?: number | null;
  illegalFlashIndex?: number | null;
  busy?: boolean;
  /** Skip ambient playable hint animation on hero hand. */
  showPlayableHint?: boolean;
  trickPlayOriginPlayerId?: string | null;
  onPlayCard?: (index: number) => void;
  onSelectCard?: (index: number) => void;
  onIllegalPlay?: (index: number) => void;
  onPeek?: (index: number | null) => void;
}

interface HandProps {
  cards: Card[];
  size?: "sm" | "md" | "lg";
  stateFor?: (card: Card, index: number) => CardState;
  badgeFor?: (card: Card, index: number) => string | undefined;
  slotClassFor?: (card: Card, index: number) => string;
  /** @deprecated Use cardInteraction — tutorial only. */
  onCardClick?: (card: Card, index: number) => void;
  onCardPeek?: (index: number | null) => void;
  peekIndex?: number | null;
  fan?: boolean;
  cardTestId?: string;
  cardInteraction?: HandCardInteraction;
}

const keyFor = (c: Card) => cardKey(c);

interface HandCardProps {
  card: Card;
  index: number;
  size: "sm" | "md" | "lg";
  state: CardState;
  badge?: string;
  fan: boolean;
  cardTestId?: string;
  cardInteraction?: HandCardInteraction;
  onCardClick?: (card: Card, index: number) => void;
  onCardPeek?: (index: number | null) => void;
  peekActive: boolean;
  slotClassFor?: (card: Card, index: number) => string;
  style?: CSSProperties;
}

function HandCard({
  card,
  index,
  size,
  state,
  badge,
  cardTestId,
  cardInteraction,
  onCardClick,
  onCardPeek,
  peekActive,
  slotClassFor,
  style,
}: HandCardProps) {
  const [pressed, setPressed] = useState(false);
  const interaction = cardInteraction;
  const isPlayMode = interaction?.mode === "play";
  const isDrawMode = interaction?.mode === "draw-select";
  const isPeekMode = interaction?.mode === "peek";
  const isMyTurn = interaction?.isMyTurn === true;
  const legalPlay =
    !interaction?.legalPlayIndices || interaction.legalPlayIndices.includes(index);
  const playable = isPlayMode && isMyTurn && legalPlay && !interaction?.busy;
  const playing = interaction?.playingIndex === index;
  const illegalTarget =
    isPlayMode && isMyTurn && !legalPlay && !interaction?.busy && !playing;
  const isDrawSelected = isDrawMode && state === "draw-selected";
  const isPlayRecommended = state === "play-recommended";
  const gestureDisabled =
    Boolean(interaction?.busy) ||
    playing ||
    (isPlayMode && !isMyTurn) ||
    (isDrawMode && !isMyTurn);
  const disabled =
    gestureDisabled ||
    (isPlayMode && !legalPlay) ||
    (isDrawMode && !isMyTurn);

  const pointerHandlers = useCardGestureHandlers({
    disabled: gestureDisabled || (!playable && !isDrawMode && !isPeekMode && !illegalTarget),
    mode: illegalTarget ? "draw-select" : (interaction?.mode ?? "none"),
    onPlay: playable ? () => interaction?.onPlayCard?.(index) : undefined,
    onSelect:
      isDrawMode && isMyTurn
        ? () => interaction?.onSelectCard?.(index)
        : illegalTarget
          ? () => interaction?.onIllegalPlay?.(index)
          : undefined,
    onPeekStart: isPeekMode ? () => onCardPeek?.(index) : undefined,
    onPeekEnd: isPeekMode ? () => onCardPeek?.(null) : undefined,
    onPressChange: setPressed,
  });

  const usePointer =
    Boolean(interaction) &&
    (interaction?.mode !== "none" || illegalTarget);
  const testId =
    isPlayMode && isMyTurn
      ? playable
        ? cardTestId
        : "play-button-disabled"
      : cardTestId;

  return (
    <div
      className={[
        "hand__slot",
        peekActive ? "hand__slot--peek" : "",
        isDrawSelected ? "hand__slot--draw-selected" : "",
        isPlayRecommended ? "hand__slot--play-recommended" : "",
        slotClassFor?.(card, index) ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-selected={isDrawSelected ? true : undefined}
      data-trick-play-origin-active={
        interaction?.playingIndex === index && interaction.trickPlayOriginPlayerId
          ? interaction.trickPlayOriginPlayerId
          : undefined
      }
    >
      <PlayingCard
        card={card}
        size={size}
        state={disabled && isPlayMode && !illegalTarget ? "disabled" : state}
        badge={badge}
        onClick={!usePointer && onCardClick ? () => onCardClick(card, index) : undefined}
        onPlayClick={usePointer && playable ? () => interaction?.onPlayCard?.(index) : undefined}
        pointerHandlers={usePointer ? pointerHandlers : undefined}
        pressed={pressed}
        playing={playing}
        playable={playable}
        illegalShake={interaction?.illegalShakeIndex === index}
        illegalFlash={interaction?.illegalFlashIndex === index}
        showPlayableHint={interaction?.showPlayableHint !== false}
        disabled={gestureDisabled && (isPlayMode || isDrawMode) && !illegalTarget}
        data-testid={testId}
        data-card-index={index}
        data-playable={isPlayMode ? (playable ? "true" : "false") : undefined}
      />
    </div>
  );
}

export function Hand({
  cards,
  size = "md",
  stateFor,
  badgeFor,
  onCardClick,
  onCardPeek,
  peekIndex = null,
  fan = false,
  cardTestId,
  cardInteraction,
  slotClassFor,
}: HandProps) {
  const handRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!fan || typeof window === "undefined") return;
    const el = handRef.current;
    if (!el) return;

    const cardW = cardWidthForHandSize(size);
    const apply = () => {
      const overlap = computeHandFanOverlapPx(el.clientWidth, cards.length, cardW);
      el.style.setProperty("--hand-fan-overlap", `${overlap}px`);
      el.style.setProperty("--hand-card-w", `${cardW}px`);
    };

    const ro = new ResizeObserver(apply);
    ro.observe(el);
    apply();
    return () => ro.disconnect();
  }, [fan, cards.length, size]);

  return (
    <div
      ref={handRef}
      className={`hand ${fan ? "hand--fan" : ""} ${cardInteraction ? "hand--pointer" : ""}`}
      style={
        fan
          ? ({ ["--hand-count" as string]: cards.length } as CSSProperties)
          : undefined
      }
    >
      <div className="hand__fan-stage">
      {cards.map((c, i) => (
        <HandCard
          key={keyFor(c)}
          card={c}
          index={i}
          style={fan ? ({ ["--card-i" as string]: i } as CSSProperties) : undefined}
          size={size}
          state={stateFor?.(c, i) ?? "default"}
          badge={badgeFor?.(c, i)}
          fan={fan}
          cardTestId={cardTestId}
          cardInteraction={cardInteraction}
          onCardClick={onCardClick}
          onCardPeek={onCardPeek}
          peekActive={peekIndex === i}
          slotClassFor={slotClassFor}
        />
      ))}
      </div>
    </div>
  );
}
