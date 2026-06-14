import { useState } from "react";
import { Hand } from "../components/Hand";
import type { Card } from "../types";
import { formatHandPhase, isCardsDealtPhase, serializedToCard } from "./handUi";
import type { SerializedCard } from "./types";

interface HeroHandProps {
  cards: SerializedCard[];
  phase?: string | null;
  enrollmentActive?: boolean;
  isInHand?: boolean;
  signedIn?: boolean;
  className?: string;
}

export function HeroHand({
  cards,
  phase,
  enrollmentActive = false,
  isInHand = false,
  signedIn = false,
  className = "",
}: HeroHandProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const dealtPhase = isCardsDealtPhase(phase);
  const typedCards: Card[] = cards.map(serializedToCard);

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

  return (
    <div className={`btable-hero ${className}`.trim()} aria-label="Your dealt cards">
      <p className="btable-hero__label muted small">
        Your hand · {formatHandPhase(phase, enrollmentActive)}
      </p>
      <Hand
        cards={typedCards}
        size="sm"
        fan
        stateFor={(_, i) => (selectedIndex === i ? "selected" : "default")}
        onCardClick={(_, i) => setSelectedIndex((prev) => (prev === i ? null : i))}
      />
      {phase === "draw" && (
        <p className="btable-hero__hint muted small">Tap a card to select · draw coming in next update</p>
      )}
    </div>
  );
}
