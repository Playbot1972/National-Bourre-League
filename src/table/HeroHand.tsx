import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Hand } from "../components/Hand";
import type { CardGestureMode } from "../components/useCardGestureHandlers";
import type { CardState } from "../components/PlayingCard";
import type { Card } from "../types";
import { formatHandPhase, isCardsDealtPhase, serializedToCard } from "./handUi";
import { playFlyKey, snapshotHeroHandCardOrigin } from "./trickPlayFly";
import { MICRO_MS } from "./tableMicrointeractions";
import { playIllegalActionFeedback } from "./feedback";
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
  dealStaggerMs?: number;
  drawAnimSubPhase?: "discard" | "receive" | "done" | null;
  currentUserId?: string | null;
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
  dealStaggerMs = 120,
  drawAnimSubPhase = null,
  currentUserId = null,
}: HeroHandProps) {
  const { settings } = useTableTheme();
  const [selectedDraw, setSelectedDraw] = useState<Set<number>>(new Set());
  const [selectedPlay, setSelectedPlay] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [peekIndex, setPeekIndex] = useState<number | null>(null);
  const [localBusy, setLocalBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [illegalShakeIndex, setIllegalShakeIndex] = useState<number | null>(null);
  const [dealing, setDealing] = useState(false);
  const prevCardIdsRef = useRef<Set<string>>(new Set());
  const playLockRef = useRef(false);
  const dealtPhase = isCardsDealtPhase(phase);
  const typedCards: Card[] = useMemo(() => cards.map(serializedToCard), [cards]);

  useEffect(() => {
    if (!dealtPhase || cards.length === 0) return;
    const nextIds = new Set(cards.map((c) => `${c.rank}-${c.suit}`));
    const prev = prevCardIdsRef.current;
    const added = [...nextIds].some((id) => !prev.has(id));
    const isSubset =
      prev.size > 0 && [...prev].every((id) => nextIds.has(id));
    prevCardIdsRef.current = nextIds;
    if (!added || isSubset) return;
    setDealing(true);
    setPlayingIndex(null);
    setSelectedPlay(null);
    const timer = window.setTimeout(() => setDealing(false), 520);
    return () => window.clearTimeout(timer);
  }, [cards, dealtPhase]);

  useEffect(() => {
    if (actionFeedback?.status === "success" || actionFeedback?.status === "error") {
      setPlayingIndex(null);
      playLockRef.current = false;
    }
  }, [actionFeedback?.status]);

  const inDrawPhase = phase === "draw";
  const inPlayPhase = phase === "play";
  const cardSize = settings.cardScale === "lg" ? "md" : "sm";
  const busy =
    localBusy || actionFeedback?.status === "loading" || playingIndex !== null;
  const feedbackError =
    actionFeedback?.status === "error" ? actionFeedback.message : localError;

  const toggleDrawIndex = useCallback(
    (index: number) => {
      if (busy) return;
      setLocalError(null);
      setSelectedDraw((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else if (next.size < maxDrawDiscards) next.add(index);
        else setLocalError(`You may discard at most ${maxDrawDiscards} cards`);
        return next;
      });
    },
    [busy, maxDrawDiscards],
  );

  const triggerPlay = useCallback(
    async (index: number) => {
      if (playLockRef.current || busy || !onPlayCard) return;
      if (legalPlayIndices && !legalPlayIndices.includes(index)) {
        playIllegalActionFeedback();
        setIllegalShakeIndex(index);
        window.setTimeout(() => setIllegalShakeIndex(null), MICRO_MS.illegalShake);
        setLocalError("That card can't be played now");
        return;
      }
      playLockRef.current = true;
      setSelectedPlay(index);
      setPlayingIndex(index);
      setLocalError(null);
      const card = typedCards[index];
      if (currentUserId && card) {
        snapshotHeroHandCardOrigin(
          currentUserId,
          playFlyKey({
            playerId: currentUserId,
            card: { rank: String(card.rank), suit: String(card.suit) },
          }),
          index,
        );
      }
      try {
        await Promise.resolve(onPlayCard(index));
        // Parent often clears feedback without a success status after play.
        setPlayingIndex(null);
        playLockRef.current = false;
      } catch (err) {
        setLocalError(err instanceof Error ? err.message : "Could not play card");
        setPlayingIndex(null);
        playLockRef.current = false;
      }
    },
    [busy, legalPlayIndices, onPlayCard, currentUserId, typedCards],
  );

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

  const handleIllegalPlay = useCallback((index: number) => {
    playIllegalActionFeedback();
    setIllegalShakeIndex(index);
    window.setTimeout(() => setIllegalShakeIndex(null), MICRO_MS.illegalShake);
    setLocalError("That card can't be played now");
  }, []);

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
    if (playingIndex === i) return "selected";
    if (inDrawPhase && selectedDraw.has(i)) return "selected";
    if (inPlayPhase && selectedPlay === i) return "selected";
    if (inPlayPhase && !isMyTurn) return "disabled";
    if (inPlayPhase && legalPlayIndices && !legalPlayIndices.includes(i)) return "muted";
    return "default";
  };

  const enablePeek = dealtPhase && isInHand && !(inPlayPhase && isMyTurn);
  let gestureMode: CardGestureMode = "none";
  if (inPlayPhase && isMyTurn) gestureMode = "play";
  else if (inDrawPhase && isMyTurn && !drawCompleted) gestureMode = "draw-select";
  else if (enablePeek) gestureMode = "peek";

  const selectedCount = selectedDraw.size;

  return (
    <div
      className={[
        `btable-hero btable-hero--scale-${settings.cardScale}`,
        dealing ? "btable-hero--dealing" : "",
        drawAnimSubPhase === "discard" ? "btable-hero--draw-discard" : "",
        drawAnimSubPhase === "receive" ? "btable-hero--draw-receive" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ ["--deal-card-stagger-ms" as string]: `${dealStaggerMs}ms` }}
      data-testid="hero-hand"
      aria-label="Your dealt cards"
    >
      <p className="btable-hero__label muted small">
        Your hand · {formatHandPhase(phase, enrollmentActive)}
        {inDrawPhase && !drawCompleted && isMyTurn && " · tap cards to discard"}
        {inPlayPhase && isMyTurn && " · click or flick a legal card to play"}
        {enablePeek && " · press and hold to peek"}
      </p>
      {isDealer && inDrawPhase && (
        <p className="btable-hero__trump-note muted small">
          Your trump upcard is on the table — not duplicated here
        </p>
      )}
      <div className="btable-hero__hand-3d" data-trick-play-origin={currentUserId ?? undefined}>
        <Hand
          cards={typedCards}
          size={cardSize}
          fan
          stateFor={stateFor}
          peekIndex={peekIndex}
          onCardPeek={enablePeek ? setPeekIndex : undefined}
          cardTestId={inPlayPhase && isMyTurn ? "play-button" : undefined}
          cardInteraction={{
            mode: gestureMode,
            isMyTurn,
            legalPlayIndices,
            playingIndex,
            illegalShakeIndex,
            busy,
            trickPlayOriginPlayerId: currentUserId,
            onPlayCard: triggerPlay,
            onSelectCard: toggleDrawIndex,
            onIllegalPlay: handleIllegalPlay,
            onPeek: setPeekIndex,
          }}
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
            data-testid="pass-draw-button"
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
