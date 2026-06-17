import { useState } from "react";
import { PlayingCard, type CardState } from "./PlayingCard";
import type { Card } from "../types";
import type { CardGestureMode } from "./useCardGestureHandlers";
import { useCardGestureHandlers } from "./useCardGestureHandlers";
import { cardKey } from "../game/cardUtils";
import "./Hand.css";

export interface HandCardInteraction {
  mode: CardGestureMode;
  isMyTurn?: boolean;
  legalPlayIndices?: number[];
  playingIndex?: number | null;
  busy?: boolean;
  onPlayCard?: (index: number) => void;
  onSelectCard?: (index: number) => void;
  onPeek?: (index: number | null) => void;
}

interface HandProps {
  cards: Card[];
  size?: "sm" | "md" | "lg";
  stateFor?: (card: Card, index: number) => CardState;
  badgeFor?: (card: Card, index: number) => string | undefined;
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
  const disabled =
    Boolean(interaction?.busy) ||
    playing ||
    (isPlayMode && (!isMyTurn || !legalPlay)) ||
    (isDrawMode && !isMyTurn);

  const pointerHandlers = useCardGestureHandlers({
    disabled: disabled || (!playable && !isDrawMode && !isPeekMode),
    mode: interaction?.mode ?? "none",
    onPlay: playable ? () => interaction?.onPlayCard?.(index) : undefined,
    onSelect: isDrawMode && isMyTurn ? () => interaction?.onSelectCard?.(index) : undefined,
    onPeekStart: isPeekMode ? () => onCardPeek?.(index) : undefined,
    onPeekEnd: isPeekMode ? () => onCardPeek?.(null) : undefined,
    onPressChange: setPressed,
  });

  const usePointer = Boolean(interaction) && interaction?.mode !== "none";
  const testId =
    isPlayMode && isMyTurn
      ? playable
        ? cardTestId
        : "play-button-disabled"
      : cardTestId;

  return (
    <div className={["hand__slot", peekActive ? "hand__slot--peek" : ""].filter(Boolean).join(" ")}>
      <PlayingCard
        card={card}
        size={size}
        state={disabled && isPlayMode ? "disabled" : state}
        badge={badge}
        onClick={!usePointer && onCardClick ? () => onCardClick(card, index) : undefined}
        onPlayClick={usePointer && playable ? () => interaction?.onPlayCard?.(index) : undefined}
        pointerHandlers={usePointer ? pointerHandlers : undefined}
        pressed={pressed}
        playing={playing}
        playable={playable}
        disabled={disabled && (isPlayMode || isDrawMode)}
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
}: HandProps) {
  return (
    <div className={`hand ${fan ? "hand--fan" : ""} ${cardInteraction ? "hand--pointer" : ""}`}>
      {cards.map((c, i) => (
        <HandCard
          key={keyFor(c)}
          card={c}
          index={i}
          size={size}
          state={stateFor?.(c, i) ?? "default"}
          badge={badgeFor?.(c, i)}
          fan={fan}
          cardTestId={cardTestId}
          cardInteraction={cardInteraction}
          onCardClick={onCardClick}
          onCardPeek={onCardPeek}
          peekActive={peekIndex === i}
        />
      ))}
    </div>
  );
}
