import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Hand } from "../components/Hand";
import type { CardState } from "../components/PlayingCard";
import type { Card } from "../types";
import { formatHandPhase, isCardsDealtPhase, serializedToCard } from "./handUi";
import { useTableTheme } from "./theme/useTableTheme";
import type { SerializedCard, TableActionFeedback } from "./types";

interface HeroHandProps {
  cards: SerializedCard[];
  phase?: string | null;
  enrollmentActive?: boolean;
  isInHand?: boolean;
  isDealer?: boolean;
  signedIn?: boolean;
  isMyTurn?: boolean;
  drawCompleted?: boolean;
  maxDrawDiscards?: number;
  legalPlayIndices?: number[];
  handComplete?: boolean;
  actionFeedback?: TableActionFeedback | null;
  onSubmitDraw?: (discardIndices: number[]) => void | Promise<void>;
  onPassDraw?: () => void | Promise<void>;
  onPlayCard?: (cardIndex: number) => void | Promise<void>;
  privateHandReady?: boolean;
  className?: string;
}

export function HeroHand({
  cards,
  phase,
  enrollmentActive = false,
  isInHand = false,
  isDealer = false,
  signedIn = false,
  isMyTurn = false,
  drawCompleted = false,
  maxDrawDiscards = 4,
  legalPlayIndices,
  handComplete = false,
  actionFeedback,
  onSubmitDraw,
  onPassDraw,
  onPlayCard,
  privateHandReady = false,
  className = "",
}: HeroHandProps) {
  const { settings } = useTableTheme();
  const [selectedDraw, setSelectedDraw] = useState<Set<number>>(new Set());
  const [selectedPlay, setSelectedPlay] = useState<number | null>(null);
  const [peekIndex, setPeekIndex] = useState<number | null>(null);
  const [localBusy, setLocalBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dealing, setDealing] = useState(false);
  const prevCardKeyRef = useRef("");
  const dealtPhase = isCardsDealtPhase(phase);
  const typedCards: Card[] = useMemo(() => cards.map(serializedToCard), [cards]);
  const cardKey = cards.map((c) => `${c.rank}-${c.suit}`).join(",");

  useEffect(() => {
    if (!dealtPhase || cardKey.length === 0 || cardKey === prevCardKeyRef.current) return;
    prevCardKeyRef.current = cardKey;
    setDealing(true);
    const timer = window.setTimeout(() => setDealing(false), 520);
    return () => window.clearTimeout(timer);
  }, [cardKey, dealtPhase]);

  const inDrawPhase = phase === "draw";
  const inPlayPhase = phase === "play";
  const cardSize = settings.cardScale === "lg" ? "md" : "sm";
  const busy = localBusy || actionFeedback?.status === "loading";
  const feedbackError =
    actionFeedback?.status === "error" ? actionFeedback.message : localError;

  const toggleDrawIndex = (index: number) => {
    if (busy) return;
    setLocalError(null);
    setSelectedDraw((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else if (next.size < maxDrawDiscards) next.add(index);
      else setLocalError(`You may discard at most ${maxDrawDiscards} cards`);
      return next;
    });
  };

  const runDrawAction = useCallback(
    async (indices: number[]) => {
      if (!onSubmitDraw || busy) return;
      if (indices.length > maxDrawDiscards) {
        setLocalError(`You may discard at most ${maxDrawDiscards} cards`);
        return;
      }
      setLocalBusy(true);
      setLocalError(null);
      try {
        await onSubmitDraw(indices);
        setSelectedDraw(new Set());
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "Draw failed");
      } finally {
        setLocalBusy(false);
      }
    },
    [onSubmitDraw, busy, maxDrawDiscards],
  );

  const runPassDraw = useCallback(async () => {
    if (!onPassDraw || busy) return;
    setLocalBusy(true);
    setLocalError(null);
    try {
      await onPassDraw();
      setSelectedDraw(new Set());
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not stand pat");
    } finally {
      setLocalBusy(false);
    }
  }, [onPassDraw, busy]);

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
    if (handComplete) {
      if (enrollmentActive) {
        return null;
      }
      return (
        <div className={`btable-hero ${className}`.trim()} aria-live="polite">
          <p className="btable-hero__label muted small">Your hand</p>
          <p className="btable-hero__hint muted small">
            Hand complete — settling and opening the next deal…
          </p>
        </div>
      );
    }
    return (
      <div className={`btable-hero ${className}`.trim()} aria-live="polite">
        <p className="btable-hero__label muted small">Your hand</p>
        <p className="btable-hero__fallback muted small">
          {privateHandReady
            ? "Cards not available — leave and re-open the session, or refresh the page."
            : "Loading your cards…"}
        </p>
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

  if (cards.length === 0 && !isDealer) {
    return null;
  }

  const stateFor = (_: Card, i: number): CardState => {
    if (inDrawPhase && selectedDraw.has(i)) return "selected";
    if (inPlayPhase && selectedPlay === i) return "selected";
    if (inPlayPhase && legalPlayIndices && !legalPlayIndices.includes(i)) return "muted";
    return "default";
  };

  const handleCardClick = (_: Card, i: number) => {
    if (busy) return;
    if (inDrawPhase && isMyTurn && !drawCompleted) {
      toggleDrawIndex(i);
      return;
    }
    if (inPlayPhase && isMyTurn && onPlayCard) {
      if (legalPlayIndices && !legalPlayIndices.includes(i)) return;
      setSelectedPlay(i);
      void Promise.resolve(onPlayCard(i)).catch((err) => {
        setLocalError(err instanceof Error ? err.message : "Could not play card");
      });
    }
  };

  const enablePeek = dealtPhase && isInHand;
  const selectedCount = selectedDraw.size;

  return (
    <div
      className={`btable-hero btable-hero--scale-${settings.cardScale}${dealing ? " btable-hero--dealing" : ""} ${className}`.trim()}
      data-testid="hero-hand"
      aria-label="Your dealt cards"
    >
      <p className="btable-hero__label muted small">
        Your hand · {formatHandPhase(phase, enrollmentActive)}
        {inDrawPhase && !drawCompleted && isMyTurn && " · tap cards to discard"}
        {inPlayPhase && isMyTurn && " · tap a legal card to play"}
        {enablePeek && " · press and hold to peek"}
      </p>
      {isDealer && inDrawPhase && (
        <p className="btable-hero__trump-note muted small">
          Your trump upcard is on the table — not duplicated here
        </p>
      )}
      <div className="btable-hero__hand-3d">
        <Hand
          cards={typedCards}
          size={cardSize}
          fan
          stateFor={stateFor}
          peekIndex={peekIndex}
          onCardPeek={enablePeek ? setPeekIndex : undefined}
          onCardClick={inDrawPhase || inPlayPhase ? handleCardClick : undefined}
          cardTestId={inPlayPhase && isMyTurn ? "play-button" : undefined}
        />
      </div>
      {feedbackError && (
        <p className="btable-hero__error" role="alert">
          {feedbackError}
        </p>
      )}
      {actionFeedback?.status === "success" && actionFeedback.message && (
        <p className="btable-hero__success muted small" role="status">
          {actionFeedback.message}
        </p>
      )}
      {inDrawPhase && !drawCompleted && isMyTurn && (
        <div className="btable-hero__actions">
          <button
            type="button"
            className="btn btn--sm btn--primary"
            data-testid="draw-button"
            disabled={busy}
            aria-busy={busy}
            onClick={() => runDrawAction([...selectedDraw].sort((a, b) => a - b))}
          >
            {busy ? "Drawing…" : `Draw${selectedCount > 0 ? ` (${selectedCount})` : ""}`}
          </button>
          <button
            type="button"
            className="btn btn--sm"
            disabled={busy}
            onClick={() => runPassDraw()}
          >
            Stand pat
          </button>
          <span className="muted small">
            {selectedCount}/{maxDrawDiscards} selected
          </span>
        </div>
      )}
      {inDrawPhase && drawCompleted && (
        <p className="btable-hero__hint muted small">Draw complete — waiting for others</p>
      )}
      {inDrawPhase && !drawCompleted && !isMyTurn && (
        <p className="btable-hero__hint muted small">Waiting for your turn to draw</p>
      )}
      {inPlayPhase && !isMyTurn && (
        <p className="btable-hero__hint muted small">Waiting for your turn to play</p>
      )}
    </div>
  );
}
