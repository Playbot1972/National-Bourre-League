import { useMemo, useState } from "react";
import { Hand } from "../components/Hand";
import type { CardState } from "../components/PlayingCard";
import type { Card } from "../types";
import { formatHandPhase, isCardsDealtPhase, serializedToCard } from "./handUi";
import type { SerializedCard } from "./types";

interface HeroHandProps {
  cards: SerializedCard[];
  phase?: string | null;
  enrollmentActive?: boolean;
  isInHand?: boolean;
  signedIn?: boolean;
  isMyTurn?: boolean;
  drawCompleted?: boolean;
  maxDrawDiscards?: number;
  legalPlayIndices?: number[];
  onSubmitDraw?: (discardIndices: number[]) => void;
  onPassDraw?: () => void;
  onPlayCard?: (cardIndex: number) => void;
  className?: string;
}

export function HeroHand({
  cards,
  phase,
  enrollmentActive = false,
  isInHand = false,
  signedIn = false,
  isMyTurn = false,
  drawCompleted = false,
  maxDrawDiscards = 4,
  legalPlayIndices,
  onSubmitDraw,
  onPassDraw,
  onPlayCard,
  className = "",
}: HeroHandProps) {
  const [selectedDraw, setSelectedDraw] = useState<Set<number>>(new Set());
  const [selectedPlay, setSelectedPlay] = useState<number | null>(null);
  const dealtPhase = isCardsDealtPhase(phase);
  const typedCards: Card[] = useMemo(() => cards.map(serializedToCard), [cards]);
  const inDrawPhase = phase === "draw";
  const inPlayPhase = phase === "play";

  const toggleDrawIndex = (index: number) => {
    setSelectedDraw((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else if (next.size < maxDrawDiscards) next.add(index);
      return next;
    });
  };

  if (!signedIn) {
    return (
      <div className={`btable-hero ${className}`.trim()} aria-live="polite">
        <p className="btable-hero__label muted small">Your hand</p>
        <p className="btable-hero__fallback muted small">Sign in to see your dealt cards.</p>
      </div>
    );
  }

  if (!isInHand && !enrollmentActive && !dealtPhase) {
    return null;
  }

  if (dealtPhase && isInHand && cards.length === 0) {
    return (
      <div className={`btable-hero ${className}`.trim()} aria-live="polite">
        <p className="btable-hero__label muted small">Your hand</p>
        <p className="btable-hero__fallback muted small">Loading your cards…</p>
      </div>
    );
  }

  if (dealtPhase && !isInHand) {
    return (
      <div className={`btable-hero ${className}`.trim()}>
        <p className="btable-hero__fallback muted small">You sat out this hand.</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return null;
  }

  const stateFor = (_: Card, i: number): CardState => {
    if (inDrawPhase && selectedDraw.has(i)) return "selected";
    if (inPlayPhase && selectedPlay === i) return "selected";
    if (inPlayPhase && legalPlayIndices && !legalPlayIndices.includes(i)) return "muted";
    return "default";
  };

  const handleCardClick = (_: Card, i: number) => {
    if (inDrawPhase && isMyTurn && !drawCompleted) {
      toggleDrawIndex(i);
      return;
    }
    if (inPlayPhase && isMyTurn && onPlayCard) {
      if (legalPlayIndices && !legalPlayIndices.includes(i)) return;
      setSelectedPlay(i);
      onPlayCard(i);
    }
  };

  return (
    <div className={`btable-hero ${className}`.trim()} aria-label="Your dealt cards">
      <p className="btable-hero__label muted small">
        Your hand · {formatHandPhase(phase, enrollmentActive)}
        {inDrawPhase && !drawCompleted && isMyTurn && " · select cards to discard"}
        {inPlayPhase && isMyTurn && " · tap a legal card to play"}
      </p>
      <Hand
        cards={typedCards}
        size="sm"
        fan
        stateFor={stateFor}
        onCardClick={inDrawPhase || inPlayPhase ? handleCardClick : undefined}
      />
      {inDrawPhase && !drawCompleted && isMyTurn && (
        <div className="btable-hero__actions">
          <button
            type="button"
            className="btn btn--sm btn--primary"
            onClick={() => onSubmitDraw?.([...selectedDraw].sort((a, b) => a - b))}
          >
            Draw {selectedDraw.size > 0 ? `(${selectedDraw.size})` : ""}
          </button>
          <button type="button" className="btn btn--sm" onClick={() => onPassDraw?.()}>
            Stand pat
          </button>
          <span className="muted small">Up to {maxDrawDiscards} discards</span>
        </div>
      )}
      {inDrawPhase && drawCompleted && (
        <p className="btable-hero__hint muted small">Draw complete — waiting for others</p>
      )}
      {inPlayPhase && !isMyTurn && (
        <p className="btable-hero__hint muted small">Waiting for your turn to play</p>
      )}
    </div>
  );
}
