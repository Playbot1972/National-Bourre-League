import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { PlayingCard, type CardState } from "./PlayingCard";
import type { Card } from "../types";
import type { CardGestureKind } from "./cardGesture";
import type { CardGestureMode } from "./useCardGestureHandlers";
import { useCardGestureHandlers } from "./useCardGestureHandlers";
import { cardKey } from "../game/cardUtils";
import { cardWidthForHandSize, computeHandFanOverlapPx } from "./handLayout";
import { resolveHandPlayCardInteraction } from "./handPlayInteraction";
import "./Hand.css";

export interface HandCardInteraction {
  mode: CardGestureMode;
  isMyTurn?: boolean;
  legalPlayIndices?: number[];
  playingIndex?: number | null;
  illegalShakeIndex?: number | null;
  illegalFlashIndex?: number | null;
  busy?: boolean;
  /** Per-card legal-play outline (tier 3); overrides default playable when set. */
  playableHintFor?: (index: number) => boolean;
  /** Skip ambient playable hint when playableHintFor is not provided. */
  showPlayableHint?: boolean;
  /** Allow queueing a play selection before it is the local player's turn. */
  allowPlayPreselect?: boolean;
  trickPlayOriginPlayerId?: string | null;
  onPlayCard?: (index: number, gesture?: CardGestureKind) => void;
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
  /** Player id for clockwise deal targeting. */
  dealSeatPlayerId?: string | null;
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
  dealSeatPlayerId?: string | null;
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
  dealSeatPlayerId,
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
  const { playInteractive, playableOutline } = resolveHandPlayCardInteraction({
    isPlayMode,
    isMyTurn,
    legalPlay,
    busy: Boolean(interaction?.busy),
    allowPlayPreselect: Boolean(interaction?.allowPlayPreselect),
    cardState: state,
    playableHintFor: interaction?.playableHintFor,
    showPlayableHint: interaction?.showPlayableHint,
    index,
  });
  const playing = interaction?.playingIndex === index;
  const illegalTarget =
    isPlayMode && isMyTurn && !legalPlay && !interaction?.busy && !playing;
  const isDrawSelected = isDrawMode && state === "draw-selected";
  const isDrawRecommended = isDrawMode && state === "draw-recommended";
  const isPlayPreselected = state === "play-preselected";
  const isPlayRecommended = state === "play-recommended";
  const gestureDisabled =
    Boolean(interaction?.busy) ||
    playing ||
    (isPlayMode && !isMyTurn && !playInteractive) ||
    (isDrawMode && !isMyTurn);
  const disabled =
    gestureDisabled ||
    (isPlayMode && !legalPlay && !playInteractive) ||
    (isDrawMode && !isMyTurn);

  const pointerHandlers = useCardGestureHandlers({
    disabled:
      gestureDisabled ||
      (!playInteractive && !isDrawMode && !isPeekMode && !illegalTarget),
    mode: illegalTarget ? "draw-select" : (interaction?.mode ?? "none"),
    onPlay: playInteractive
      ? (kind) => interaction?.onPlayCard?.(index, kind)
      : undefined,
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
      ? playInteractive
        ? cardTestId
        : "play-button-disabled"
      : cardTestId;

  return (
    <div
      className={[
        "hand__slot",
        peekActive ? "hand__slot--peek" : "",
        isDrawSelected ? "hand__slot--draw-selected" : "",
        isDrawRecommended ? "hand__slot--draw-recommended" : "",
        isPlayPreselected ? "hand__slot--play-preselected" : "",
        isPlayRecommended ? "hand__slot--play-recommended" : "",
        slotClassFor?.(card, index) ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      aria-selected={isDrawSelected || isDrawRecommended ? true : undefined}
      data-draw-hint={
        isDrawRecommended ? "suggested" : isDrawSelected ? "selected" : undefined
      }
      data-trick-play-origin-active={
        interaction?.playingIndex === index && interaction.trickPlayOriginPlayerId
          ? interaction.trickPlayOriginPlayerId
          : undefined
      }
      data-deal-seat={dealSeatPlayerId ?? undefined}
      data-deal-round={dealSeatPlayerId != null ? index : undefined}
    >
      <PlayingCard
        card={card}
        size={size}
        state={disabled && isPlayMode && !illegalTarget ? "disabled" : state}
        badge={badge}
        onClick={!usePointer && onCardClick ? () => onCardClick(card, index) : undefined}
        onPlayClick={
          usePointer && playInteractive
            ? () => interaction?.onPlayCard?.(index, "tap")
            : undefined
        }
        pointerHandlers={usePointer ? pointerHandlers : undefined}
        pressed={pressed}
        playing={playing}
        playable={playableOutline}
        illegalShake={interaction?.illegalShakeIndex === index}
        illegalFlash={interaction?.illegalFlashIndex === index}
        showPlayableHint={interaction?.showPlayableHint !== false}
        disabled={gestureDisabled && (isPlayMode || isDrawMode) && !illegalTarget}
        data-testid={testId}
        data-card-index={index}
        data-playable={isPlayMode ? (playInteractive ? "true" : "false") : undefined}
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
  dealSeatPlayerId = null,
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
          dealSeatPlayerId={dealSeatPlayerId}
        />
      ))}
      </div>
    </div>
  );
}
