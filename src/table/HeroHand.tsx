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
  onFoldDraw?: () => void | Promise<void>;
  onPlayCard?: (cardIndex: number) => void | Promise<void>;
  privateHandReady?: boolean;
  className?: string;
  dealStaggerMs?: number;
  drawAnimSubPhase?: "discard" | "receive" | "done" | null;
  currentUserId?: string | null;
  revealedTrumpIndex?: number | null;
  trumpMergeActive?: boolean;
  trumpDisabledIndex?: number | null;
}

function heroShellClass(
  settings: { cardScale: string },
  className: string,
  extras: string[] = [],
): string {
  return [
    `btable-hero btable-hero--bare btable-hero--scale-${settings.cardScale}`,
    ...extras,
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Stable placeholder — reserves hand dock height without visible chrome. */
function HeroHandReserve({ className = "" }: { className?: string }) {
  return (
    <div
      className={`btable-hero btable-hero--bare btable-hero--reserved ${className}`.trim()}
      aria-hidden="true"
      data-testid="hero-hand"
    />
  );
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
  onFoldDraw,
  onPlayCard,
  privateHandReady = false,
  className = "",
  dealStaggerMs = 120,
  drawAnimSubPhase = null,
  currentUserId = null,
  revealedTrumpIndex = null,
  trumpMergeActive = false,
  trumpDisabledIndex = null,
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

  const slotClassFor = useCallback(
    (_: Card, i: number) => {
      if (revealedTrumpIndex !== i) return "";
      return trumpMergeActive ? "hand__slot--trump-merge-target" : "hand__slot--trump-revealed";
    },
    [revealedTrumpIndex, trumpMergeActive],
  );

  useEffect(() => {
    if (!dealtPhase || cards.length === 0) return;
    const nextIds = new Set(cards.map((c) => `${c.rank}-${c.suit}`));
    const prev = prevCardIdsRef.current;
    const added = [...nextIds].some((id) => !prev.has(id));
    prevCardIdsRef.current = nextIds;
    if (!added) return;
    if (prev.size > 0) return;
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
  const phaseStatus = formatHandPhase(phase, enrollmentActive);

  const toggleDrawIndex = useCallback(
    (index: number) => {
      if (busy || trumpDisabledIndex === index) return;
      setLocalError(null);
      setSelectedDraw((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else if (next.size < maxDrawDiscards) next.add(index);
        else setLocalError(`You may discard at most ${maxDrawDiscards} cards`);
        return next;
      });
    },
    [busy, maxDrawDiscards, trumpDisabledIndex],
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

  const runFoldDraw = useCallback(async () => {
    if (!onFoldDraw || busy) return;
    setLocalBusy(true);
    setLocalError(null);
    try {
      await onFoldDraw();
      setSelectedDraw(new Set());
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Could not fold out");
    } finally {
      setLocalBusy(false);
    }
  }, [onFoldDraw, busy]);

  const handleIllegalPlay = useCallback((index: number) => {
    playIllegalActionFeedback();
    setIllegalShakeIndex(index);
    window.setTimeout(() => setIllegalShakeIndex(null), MICRO_MS.illegalShake);
    setLocalError("That card can't be played now");
  }, []);

  if (!signedIn) {
    return (
      <div className={heroShellClass(settings, className)} aria-live="polite" data-testid="hero-hand">
        <p className="btable-hero__fallback muted small">Sign in to see your dealt cards.</p>
      </div>
    );
  }

  if (!isInHand && !enrollmentActive && !dealtPhase) {
    return <HeroHandReserve className={className} />;
  }

  if (dealtPhase && isInHand && cards.length === 0) {
    if (handComplete && enrollmentActive) {
      return <HeroHandReserve className={className} />;
    }
    return (
      <div className={heroShellClass(settings, className)} aria-live="polite" data-testid="hero-hand">
        <p className="btable-hero__fallback muted small">
          {privateHandReady
            ? "Cards not available — leave and re-open the session, or refresh the page."
            : "Loading your cards…"}
        </p>
      </div>
    );
  }

  if (dealtPhase && !isInHand && (phase === "draw" || phase === "play")) {
    return (
      <div className={heroShellClass(settings, className)} data-testid="hero-hand">
        <p className="btable-hero__fallback muted small">You sat out this hand.</p>
      </div>
    );
  }

  if (cards.length === 0 && !isDealer) {
    return <HeroHandReserve className={className} />;
  }

  const stateFor = (_: Card, i: number): CardState => {
    if (revealedTrumpIndex === i) return "trump";
    if (trumpDisabledIndex === i && (inDrawPhase || inPlayPhase)) return "muted";
    if (playingIndex === i) return "selected";
    if (inDrawPhase && selectedDraw.has(i)) return "draw-selected";
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
  const showDrawActions = inDrawPhase && !drawCompleted && isMyTurn;

  return (
    <div
      className={heroShellClass(settings, className, [
        dealing ? "btable-hero--dealing" : "",
        revealedTrumpIndex !== null ? "btable-hero--trump-reveal" : "",
        trumpMergeActive ? "btable-hero--trump-merge" : "",
        inDrawPhase && isMyTurn && !drawCompleted ? "btable-hero--draw-select" : "",
        drawAnimSubPhase === "discard" ? "btable-hero--draw-discard" : "",
        drawAnimSubPhase === "receive" ? "btable-hero--draw-receive" : "",
        showDrawActions ? "btable-hero--draw-actions" : "",
      ])}
      style={{ ["--deal-card-stagger-ms" as string]: `${dealStaggerMs}ms` }}
      data-testid="hero-hand"
      aria-label={`Your dealt cards — ${phaseStatus}`}
    >
      <p className="btable-sr-only" aria-live="polite">
        {phaseStatus}
        {inDrawPhase && !drawCompleted && isMyTurn && " — tap cards to discard"}
        {inPlayPhase && isMyTurn && " — select a legal card to play"}
      </p>
      <div className="btable-hero__hand-3d" data-trick-play-origin={currentUserId ?? undefined}>
        <div className="btable-hero__hand-row">
        <Hand
          cards={typedCards}
          size={cardSize}
          fan
          stateFor={stateFor}
          slotClassFor={slotClassFor}
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
      </div>
      {feedbackError && (
        <p className="btable-hero__error" role="alert">
          {feedbackError}
        </p>
      )}
      <div
        className="btable-hero__actions-slot"
        aria-hidden={!showDrawActions}
      >
        {showDrawActions && (
          <div className="btable-hero__actions btable-hero__actions--triple">
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
            <button
              type="button"
              className="btn btn--sm"
              data-testid="im-out-button"
              disabled={busy}
              onClick={() => runFoldDraw()}
            >
              I&apos;m Out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
