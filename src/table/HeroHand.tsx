import { memo, useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Hand } from "../components/Hand";
import type { CardGestureMode } from "../components/useCardGestureHandlers";
import type { CardState } from "../components/PlayingCard";
import type { Card } from "../types";
import { dealMotionWindowMs, useHeroCardMotion } from "./animations/useHeroCardMotion";
import { formatHandPhase, isCardsDealtPhase, serializedToCard } from "./handUi";
import { playFlyKey, snapshotHeroHandCardOrigin } from "./trickPlayFly";
import { MICRO_MS } from "./tableMicrointeractions";
import { getBestPlayEnabled, saveBestPlayEnabled } from "./bestPlayPrefs";
import {
  effectiveDrawDiscardIndices,
  isLegalPlayIndex,
  isPreselectContextValid,
  type PreselectPlayContext,
  togglePlayPreselectIndex,
} from "./heroHandPlayPreselect";
import { playIllegalActionFeedback } from "./feedback";
import { scrubInternalActionMessage } from "./actionErrorCopy";
import { useTableTheme } from "./theme/useTableTheme";
import { logPlayClick } from "./playClickDebug";
import { HeroHandActionButtons } from "./HeroHandActionButtons";
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
  recommendedPlayIndex?: number | null;
  recommendedDiscardIndices?: number[];
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
  drawDiscardCount?: number;
  drawReplaceCount?: number;
  currentUserId?: string | null;
  revealedTrumpIndex?: number | null;
  trumpMergeActive?: boolean;
  trumpDisabledIndex?: number | null;
  handNumber?: number;
  trickNumber?: number | null;
  turnPlayerId?: string | null;
  tableRootRef?: RefObject<HTMLElement | null>;
  pileIndexRef?: RefObject<number>;
  onDiscardCommitted?: (entries: { id: string; playerId: string }[]) => void;
  /** Fired on any local hand interaction (selection, draw/play action). */
  onUserActivity?: () => void;
  /** Table-wide clockwise deal — disables hero-only deal motion. */
  skipHeroDealMotion?: boolean;
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

export const HeroHand = memo(function HeroHand({
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
  recommendedPlayIndex = null,
  recommendedDiscardIndices = [],
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
  drawDiscardCount = 0,
  drawReplaceCount = 0,
  currentUserId = null,
  revealedTrumpIndex = null,
  trumpMergeActive = false,
  trumpDisabledIndex = null,
  handNumber = 0,
  trickNumber = null,
  turnPlayerId = null,
  tableRootRef,
  pileIndexRef,
  onDiscardCommitted,
  onUserActivity,
  skipHeroDealMotion = false,
}: HeroHandProps) {
  const { settings } = useTableTheme();
  const [selectedDraw, setSelectedDraw] = useState<Set<number>>(new Set());
  const [selectedPlay, setSelectedPlay] = useState<number | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [peekIndex, setPeekIndex] = useState<number | null>(null);
  const [localBusy, setLocalBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [illegalShakeIndex, setIllegalShakeIndex] = useState<number | null>(null);
  const [illegalFlashIndex, setIllegalFlashIndex] = useState<number | null>(null);
  const [bestPlayEnabled, setBestPlayEnabled] = useState(() => getBestPlayEnabled());
  const [dealing, setDealing] = useState(false);
  const [standPatPulse, setStandPatPulse] = useState(false);
  const [foldOutPulse, setFoldOutPulse] = useState(false);
  const [pendingDiscardIndices, setPendingDiscardIndices] = useState<number[]>([]);
  const prevCardIdsRef = useRef<Set<string>>(new Set());
  const handRootRef = useRef<HTMLDivElement>(null);
  const playLockRef = useRef(false);
  const preselectTimerRef = useRef<number | null>(null);
  const pendingPlayIndexRef = useRef<number | null>(null);
  const queuedOffTurnRef = useRef(false);
  const preselectContextRef = useRef<PreselectPlayContext | null>(null);
  const [drawSelectionTouched, setDrawSelectionTouched] = useState(false);
  const executePlayRef = useRef<(index: number) => Promise<void>>(async () => {});
  const dealtPhase = isCardsDealtPhase(phase);
  const typedCards: Card[] = useMemo(() => cards.map(serializedToCard), [cards]);
  const handCardKey = useMemo(
    () => cards.map((c) => `${c.rank}-${c.suit}`).join("|"),
    [cards],
  );
  const recommendedDiscardKey = useMemo(
    () => recommendedDiscardIndices.slice().sort((a, b) => a - b).join(","),
    [recommendedDiscardIndices],
  );
  const inDrawPhase = phase === "draw";
  const inPlayPhase = phase === "play";
  const busy =
    localBusy || actionFeedback?.status === "loading" || playingIndex !== null;

  const slotClassFor = useCallback(
    (_: Card, i: number) => {
      if (revealedTrumpIndex !== i) return "";
      return trumpMergeActive ? "hand__slot--trump-merge-target" : "hand__slot--trump-revealed";
    },
    [revealedTrumpIndex, trumpMergeActive],
  );

  useEffect(() => {
    if (skipHeroDealMotion) return;
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
    const dealMs = dealMotionWindowMs(cards.length, dealStaggerMs);
    const timer = window.setTimeout(() => setDealing(false), dealMs);
    return () => window.clearTimeout(timer);
  }, [cards, dealtPhase, dealStaggerMs, skipHeroDealMotion]);

  useEffect(() => {
    if (drawAnimSubPhase === "done" || drawAnimSubPhase === null) {
      setPendingDiscardIndices([]);
    }
  }, [drawAnimSubPhase]);

  useHeroCardMotion(handRootRef, {
    dealing,
    dealStaggerMs,
    drawAnimSubPhase,
    drawDiscardCount,
    drawReplaceCount,
    pendingDiscardIndices,
    standPatPulse,
    foldOutPulse,
    playingIndex,
    cards,
    handNumber,
    playerId: currentUserId,
    tableRootRef,
    pileIndexRef,
    onDiscardCommitted,
    skipHeroDealMotion,
  });

  const clearPreselectTimer = useCallback(() => {
    if (preselectTimerRef.current != null) {
      window.clearTimeout(preselectTimerRef.current);
      preselectTimerRef.current = null;
    }
    pendingPlayIndexRef.current = null;
    queuedOffTurnRef.current = false;
    preselectContextRef.current = null;
  }, []);

  const buildPreselectContext = useCallback(
    (): PreselectPlayContext => ({
      phase,
      handNumber,
      trickNumber,
      turnPlayerId,
      playerId: currentUserId,
    }),
    [phase, handNumber, trickNumber, turnPlayerId, currentUserId],
  );

  const canFirePreselect = useCallback(
    (index: number, armedContext: PreselectPlayContext | null) => {
      if (armedContext == null) return false;
      if (!isPreselectContextValid(armedContext, buildPreselectContext())) return false;
      if (phase !== "play" || !currentUserId || turnPlayerId !== currentUserId) return false;
      if (!isLegalPlayIndex(index, legalPlayIndices)) return false;
      if (playLockRef.current || busy) return false;
      return true;
    },
    [
      buildPreselectContext,
      phase,
      currentUserId,
      turnPlayerId,
      legalPlayIndices,
      busy,
    ],
  );

  const snapshotPreselectOrigin = useCallback(
    (index: number) => {
      if (!currentUserId) return;
      const card = typedCards[index];
      if (!card) return;
      snapshotHeroHandCardOrigin(
        currentUserId,
        playFlyKey({
          playerId: currentUserId,
          card: { rank: String(card.rank), suit: String(card.suit) },
        }),
        index,
      );
    },
    [currentUserId, typedCards],
  );

  const armPreselectPlayTimer = useCallback(
    (index: number, queuedOffTurn: boolean) => {
      clearPreselectTimer();
      pendingPlayIndexRef.current = index;
      queuedOffTurnRef.current = queuedOffTurn;
      preselectContextRef.current = buildPreselectContext();
      const delay = queuedOffTurn ? MICRO_MS.turnHandoff : MICRO_MS.autoPlayPreselect;
      logPlayClick(queuedOffTurn ? "preselectEffect:armTurnHandoff" : "preselectEffect:armTimer", {
        index,
        delay,
      });
      preselectTimerRef.current = window.setTimeout(() => {
        preselectTimerRef.current = null;
        const pending = pendingPlayIndexRef.current;
        const armedContext = preselectContextRef.current;
        pendingPlayIndexRef.current = null;
        queuedOffTurnRef.current = false;
        preselectContextRef.current = null;
        logPlayClick("preselectEffect:timerFire", { pending, index });
        if (pending === index && canFirePreselect(pending, armedContext)) {
          void executePlayRef.current(pending);
        }
      }, delay);
    },
    [clearPreselectTimer, buildPreselectContext, canFirePreselect],
  );

  useEffect(() => {
    return () => clearPreselectTimer();
  }, [clearPreselectTimer]);

  useEffect(() => {
    clearPreselectTimer();
    setSelectedPlay(null);
    setSelectedDraw(new Set());
    setDrawSelectionTouched(false);
    setPeekIndex(null);
    setIllegalShakeIndex(null);
    setIllegalFlashIndex(null);
    setLocalError(null);
  }, [phase, handCardKey, handNumber, trickNumber, turnPlayerId, clearPreselectTimer]);

  useEffect(() => {
    if (selectedPlay === null) return;
    if (!isLegalPlayIndex(selectedPlay, legalPlayIndices)) {
      setSelectedPlay(null);
      pendingPlayIndexRef.current = null;
      clearPreselectTimer();
    }
  }, [legalPlayIndices, selectedPlay, clearPreselectTimer]);

  useEffect(() => {
    if (selectedPlay === null || preselectTimerRef.current == null) return;
    const armed = preselectContextRef.current;
    if (!armed || isPreselectContextValid(armed, buildPreselectContext())) return;
    clearPreselectTimer();
    setSelectedPlay(null);
  }, [
    selectedPlay,
    phase,
    handNumber,
    trickNumber,
    turnPlayerId,
    currentUserId,
    buildPreselectContext,
    clearPreselectTimer,
  ]);

  useEffect(() => {
    if (
      !bestPlayEnabled ||
      !inDrawPhase ||
      drawCompleted ||
      drawSelectionTouched
    ) {
      return;
    }
    setSelectedDraw(new Set(recommendedDiscardIndices));
  }, [
    bestPlayEnabled,
    inDrawPhase,
    drawCompleted,
    drawSelectionTouched,
    recommendedDiscardKey,
    recommendedDiscardIndices,
  ]);

  useEffect(() => {
    if (!inPlayPhase || !isMyTurn || selectedPlay === null || playLockRef.current || busy) {
      return;
    }
    if (!isLegalPlayIndex(selectedPlay, legalPlayIndices)) {
      setSelectedPlay(null);
      pendingPlayIndexRef.current = null;
      return;
    }
    if (preselectTimerRef.current != null) return;
    snapshotPreselectOrigin(selectedPlay);
    armPreselectPlayTimer(selectedPlay, queuedOffTurnRef.current);
  }, [
    inPlayPhase,
    isMyTurn,
    selectedPlay,
    legalPlayIndices,
    busy,
    armPreselectPlayTimer,
    snapshotPreselectOrigin,
  ]);

  useEffect(() => {
    if (actionFeedback?.status === "success" || actionFeedback?.status === "error") {
      setPlayingIndex(null);
      setSelectedPlay(null);
      clearPreselectTimer();
      playLockRef.current = false;
    }
  }, [actionFeedback?.status, clearPreselectTimer]);

  /** Clear hero-local mirror once parent action feedback recovers from an error. */
  const prevFeedbackStatusRef = useRef<TableActionFeedback["status"] | undefined>(undefined);
  useEffect(() => {
    const status = actionFeedback?.status;
    const prev = prevFeedbackStatusRef.current;
    prevFeedbackStatusRef.current = status;
    if (prev === "error" && status !== "error") {
      setLocalError(null);
    }
  }, [actionFeedback?.status]);

  const cardSize = settings.cardScale === "lg" ? "md" : "sm";
  const feedbackError = scrubInternalActionMessage(
    actionFeedback?.status === "error" ? actionFeedback.message : localError,
  );
  const phaseStatus = formatHandPhase(phase, enrollmentActive);

  useEffect(() => {
    if (!onUserActivity) return;
    if (inDrawPhase && selectedDraw.size > 0) {
      onUserActivity();
    }
  }, [inDrawPhase, selectedDraw.size, onUserActivity]);

  useEffect(() => {
    if (!onUserActivity) return;
    if (inPlayPhase && selectedPlay !== null) {
      onUserActivity();
    }
  }, [inPlayPhase, selectedPlay, onUserActivity]);

  const notifyUserActivity = useCallback(() => {
    onUserActivity?.();
  }, [onUserActivity]);

  const toggleDrawIndex = useCallback(
    (index: number) => {
      if (busy || trumpDisabledIndex === index) return;
      setDrawSelectionTouched(true);
      notifyUserActivity();
      setLocalError(null);
      setSelectedDraw((prev) => {
        const next = new Set(prev);
        if (next.has(index)) next.delete(index);
        else if (next.size < maxDrawDiscards) next.add(index);
        else setLocalError(`You may discard at most ${maxDrawDiscards} cards`);
        return next;
      });
    },
    [busy, maxDrawDiscards, trumpDisabledIndex, notifyUserActivity],
  );

  const executePlay = useCallback(
    async (index: number) => {
      if (playLockRef.current || busy || !onPlayCard) return;
      if (!isLegalPlayIndex(index, legalPlayIndices)) return;
      clearPreselectTimer();
      playLockRef.current = true;
      setSelectedPlay(null);
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
      } catch {
        // Play errors surface via actionFeedback from onPlayCard — avoid duplicate bottom banner.
        setPlayingIndex(null);
        playLockRef.current = false;
      }
    },
    [busy, legalPlayIndices, onPlayCard, currentUserId, typedCards, clearPreselectTimer],
  );

  const preselectCard = useCallback(
    (index: number) => {
      logPlayClick("preselectCard:enter", {
        index,
        isMyTurn,
        busy,
        playLock: playLockRef.current,
        phase,
        selectedPlay,
        hasOnPlayCard: Boolean(onPlayCard),
        legal: isLegalPlayIndex(index, legalPlayIndices),
      });
      if (playLockRef.current || busy || !onPlayCard || phase !== "play") {
        logPlayClick("preselectCard:blocked", {
          index,
          reason: playLockRef.current
            ? "playLock"
            : busy
              ? "busy"
              : !onPlayCard
                ? "noOnPlayCard"
                : "phase",
        });
        return;
      }
      if (!isLegalPlayIndex(index, legalPlayIndices)) {
        if (isMyTurn) {
          playIllegalActionFeedback();
          clearPreselectTimer();
          setSelectedPlay(null);
          setIllegalShakeIndex(index);
          setIllegalFlashIndex(index);
          window.setTimeout(() => {
            setIllegalShakeIndex(null);
            setIllegalFlashIndex(null);
          }, MICRO_MS.illegalFlash);
          setLocalError("Illegal play");
        }
        logPlayClick("preselectCard:illegal", { index, isMyTurn });
        return;
      }
      const nextSelection = isMyTurn
        ? index
        : togglePlayPreselectIndex(selectedPlay, index);
      logPlayClick("preselectCard:toggle", { index, nextSelection, isMyTurn, selectedPlay });
      clearPreselectTimer();
      setSelectedPlay(nextSelection);
      setLocalError(null);
      notifyUserActivity();
      if (nextSelection === null) {
        pendingPlayIndexRef.current = null;
        logPlayClick("preselectCard:deselected", { index });
        return;
      }
      pendingPlayIndexRef.current = nextSelection;
      if (!isMyTurn) {
        queuedOffTurnRef.current = true;
        snapshotPreselectOrigin(nextSelection);
        logPlayClick("preselectCard:queued", { index: nextSelection });
        return;
      }
      snapshotPreselectOrigin(nextSelection);
      armPreselectPlayTimer(nextSelection, false);
    },
    [
      busy,
      clearPreselectTimer,
      isMyTurn,
      legalPlayIndices,
      onPlayCard,
      phase,
      notifyUserActivity,
      selectedPlay,
      armPreselectPlayTimer,
      snapshotPreselectOrigin,
    ],
  );

  executePlayRef.current = executePlay;

  const runDrawAction = useCallback(
    async (indices: number[]) => {
      if (!onSubmitDraw || busy) return;
      notifyUserActivity();
      if (indices.length > maxDrawDiscards) {
        setLocalError(`You may discard at most ${maxDrawDiscards} cards`);
        return;
      }
      setLocalBusy(true);
      setLocalError(null);
      setPendingDiscardIndices([...indices]);
      try {
        await onSubmitDraw(indices);
        setSelectedDraw(new Set());
      } catch {
        // Draw errors surface via actionFeedback from onSubmitDraw.
      } finally {
        setLocalBusy(false);
      }
    },
    [onSubmitDraw, busy, maxDrawDiscards, notifyUserActivity],
  );

  const runPassDraw = useCallback(async () => {
    if (!onPassDraw || busy) return;
    notifyUserActivity();
    setLocalBusy(true);
    setLocalError(null);
    try {
      await onPassDraw();
      setSelectedDraw(new Set());
      setStandPatPulse(true);
      window.setTimeout(() => setStandPatPulse(false), 700);
    } catch {
      // Pass errors surface via actionFeedback from onPassDraw.
    } finally {
      setLocalBusy(false);
    }
  }, [onPassDraw, busy, notifyUserActivity]);

  const runFoldDraw = useCallback(async () => {
    if (!onFoldDraw || busy) return;
    notifyUserActivity();
    setFoldOutPulse(true);
    setLocalBusy(true);
    setLocalError(null);
    try {
      await onFoldDraw();
      setSelectedDraw(new Set());
    } catch {
      setFoldOutPulse(false);
    } finally {
      setLocalBusy(false);
    }
  }, [onFoldDraw, busy, notifyUserActivity]);

  const handleIllegalPlay = useCallback(
    (index: number) => {
      playIllegalActionFeedback();
      clearPreselectTimer();
      setSelectedPlay(null);
      setIllegalShakeIndex(index);
      setIllegalFlashIndex(index);
      window.setTimeout(() => {
        setIllegalShakeIndex(null);
        setIllegalFlashIndex(null);
      }, MICRO_MS.illegalFlash);
      setLocalError("Illegal play");
    },
    [clearPreselectTimer],
  );

  const handleBestPlayChange = useCallback(
    (enabled: boolean) => {
      setBestPlayEnabled(enabled);
      saveBestPlayEnabled(enabled);
      if (enabled) {
        setDrawSelectionTouched(false);
        if (inDrawPhase && !drawCompleted) {
          setSelectedDraw(new Set(recommendedDiscardIndices));
        }
        return;
      }
      if (!drawSelectionTouched) {
        setSelectedDraw(new Set());
      }
    },
    [drawSelectionTouched, inDrawPhase, drawCompleted, recommendedDiscardIndices],
  );

  const showBestPlayControl =
    signedIn && isInHand && (inDrawPhase || inPlayPhase);

  const drawSubmitIndices = useMemo(
    () =>
      effectiveDrawDiscardIndices({
        selectedDraw,
        drawSelectionTouched,
        bestPlayEnabled,
        recommendedDiscardIndices,
      }),
    [
      selectedDraw,
      drawSelectionTouched,
      bestPlayEnabled,
      recommendedDiscardKey,
      recommendedDiscardIndices,
    ],
  );

  const showBestPlayRecommendation =
    showBestPlayControl &&
    inPlayPhase &&
    bestPlayEnabled &&
    selectedPlay === null &&
    recommendedPlayIndex !== null &&
    recommendedPlayIndex >= 0;

  const stateFor = useCallback(
    (_: Card, i: number): CardState => {
      if (revealedTrumpIndex === i) return "trump";
      if (trumpDisabledIndex === i && (inDrawPhase || inPlayPhase)) return "muted";
      if (playingIndex === i) return "default";
      if (illegalFlashIndex === i || illegalShakeIndex === i) return "default";
      if (inDrawPhase && selectedDraw.has(i)) return "draw-selected";
      if (inPlayPhase && selectedPlay === i) return "play-preselected";
      if (showBestPlayRecommendation && recommendedPlayIndex === i) return "play-recommended";
      if (inPlayPhase && legalPlayIndices && !legalPlayIndices.includes(i)) return "muted";
      return "default";
    },
    [
      revealedTrumpIndex,
      trumpDisabledIndex,
      inDrawPhase,
      inPlayPhase,
      playingIndex,
      illegalFlashIndex,
      illegalShakeIndex,
      selectedDraw,
      selectedPlay,
      showBestPlayRecommendation,
      recommendedPlayIndex,
      legalPlayIndices,
    ],
  );

  const gestureMode = useMemo((): CardGestureMode => {
    const enablePeek = dealtPhase && isInHand && !(inPlayPhase && isMyTurn);
    if (inPlayPhase && isInHand) return "play";
    if (inDrawPhase && isInHand && !drawCompleted) return "draw-select";
    if (enablePeek) return "peek";
    return "none";
  }, [dealtPhase, isInHand, inPlayPhase, isMyTurn, inDrawPhase, drawCompleted]);

  const enablePeek = dealtPhase && isInHand && !(inPlayPhase && isMyTurn);

  const handleHandPlayCard = useCallback(
    (index: number) => {
      logPlayClick("Hand.onPlayCard", { index, isMyTurn, gestureMode });
      preselectCard(index);
    },
    [gestureMode, isMyTurn, preselectCard],
  );

  const cardInteraction = useMemo(
    () => ({
      mode: gestureMode,
      isMyTurn,
      legalPlayIndices,
      playingIndex,
      illegalShakeIndex,
      illegalFlashIndex,
      busy,
      showPlayableHint: false,
      allowPlayPreselect: inPlayPhase && isInHand && !isMyTurn,
      trickPlayOriginPlayerId: currentUserId,
      onPlayCard: handleHandPlayCard,
      onSelectCard: toggleDrawIndex,
      onIllegalPlay: handleIllegalPlay,
      onPeek: setPeekIndex,
    }),
    [
      gestureMode,
      isMyTurn,
      legalPlayIndices,
      playingIndex,
      illegalShakeIndex,
      illegalFlashIndex,
      busy,
      inPlayPhase,
      isInHand,
      currentUserId,
      handleHandPlayCard,
      toggleDrawIndex,
      handleIllegalPlay,
    ],
  );

  const selectedCount = drawSubmitIndices.length;
  const showDrawActions = inDrawPhase && !drawCompleted && isMyTurn;

  const handleDrawSubmit = useCallback(() => {
    void runDrawAction(drawSubmitIndices);
  }, [runDrawAction, drawSubmitIndices]);

  const handlePassDrawClick = useCallback(() => {
    void runPassDraw();
  }, [runPassDraw]);

  const handleFoldDrawClick = useCallback(() => {
    void runFoldDraw();
  }, [runFoldDraw]);

  const renderBestPlayCheckbox = () =>
    showBestPlayControl ? (
      <label className="btable-hero__best-play">
        <input
          type="checkbox"
          className="btable-hero__best-play-input"
          checked={bestPlayEnabled}
          onChange={(e) => handleBestPlayChange(e.target.checked)}
          data-testid="best-play-checkbox"
        />
        <span className="btable-hero__best-play-label">Best Play</span>
      </label>
    ) : null;

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
        <div className="btable-hero__hand-3d btable-hero__hand-3d--chrome-only">
          {renderBestPlayCheckbox()}
        </div>
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
    if (showBestPlayControl) {
      return (
        <div
          className={heroShellClass(settings, className, ["btable-hero--reserved"])}
          data-testid="hero-hand"
          aria-live="polite"
        >
          <div className="btable-hero__hand-3d btable-hero__hand-3d--chrome-only">
            {renderBestPlayCheckbox()}
          </div>
        </div>
      );
    }
    return <HeroHandReserve className={className} />;
  }

  return (
    <div
      className={heroShellClass(settings, className, [
        dealing && !skipHeroDealMotion ? "btable-hero--dealing" : "",
        revealedTrumpIndex !== null ? "btable-hero--trump-reveal" : "",
        trumpMergeActive ? "btable-hero--trump-merge" : "",
        inDrawPhase && isMyTurn && !drawCompleted ? "btable-hero--draw-select" : "",
        drawAnimSubPhase === "discard" && drawDiscardCount > 0 ? "btable-hero--draw-discard" : "",
        drawAnimSubPhase === "receive" && drawReplaceCount > 0 ? "btable-hero--draw-receive" : "",
        showDrawActions ? "btable-hero--draw-actions" : "",
        (inDrawPhase && isMyTurn && !drawCompleted) || (inPlayPhase && isMyTurn)
          ? "btable-hero--your-turn"
          : "",
        (inDrawPhase || inPlayPhase) && isInHand && !isMyTurn ? "btable-hero--waiting-turn" : "",
        standPatPulse ? "btable-hero--stand-pat" : "",
        foldOutPulse ? "btable-hero--fold-out" : "",
      ])}
      style={{ ["--deal-card-stagger-ms" as string]: `${dealStaggerMs}ms` }}
      data-testid="hero-hand"
      aria-label={`Your dealt cards — ${phaseStatus}`}
    >
      <p className="btable-sr-only" aria-live="polite">
        {phaseStatus}
        {inDrawPhase && !drawCompleted && isMyTurn && " — tap cards to discard; red border marks your selection"}
        {inPlayPhase && isMyTurn && " — tap a legal card to play"}
        {bestPlayEnabled && inPlayPhase && " — green outline marks Best Play suggestions"}
      </p>
      <div
        ref={handRootRef}
        className="btable-hero__hand-3d"
        data-trick-play-origin={currentUserId ?? undefined}
        data-trick-play-origin-active={
          inPlayPhase && isMyTurn && currentUserId ? currentUserId : undefined
        }
      >
        <div
          className="btable-hero__hand-row"
          data-hero-play-turn={inPlayPhase && isMyTurn ? "true" : undefined}
        >
        <Hand
          cards={typedCards}
          size={cardSize}
          fan
          dealSeatPlayerId={currentUserId}
          stateFor={stateFor}
          slotClassFor={slotClassFor}
          peekIndex={peekIndex}
          onCardPeek={enablePeek ? setPeekIndex : undefined}
          cardTestId={inPlayPhase && isMyTurn ? "play-button" : undefined}
          cardInteraction={cardInteraction}
        />
        </div>
        {renderBestPlayCheckbox()}
      </div>
      {inPlayPhase && !isMyTurn && selectedPlay !== null && (
        <p className="btable-hero__hint" data-testid="play-preselect-hint">
          Your selected card will play on your turn
        </p>
      )}
      {feedbackError && (
        <p className="btable-hero__error" role="alert">
          {feedbackError}
        </p>
      )}
      <HeroHandActionButtons
        visible={showDrawActions}
        busy={busy}
        selectedCount={selectedCount}
        onDraw={handleDrawSubmit}
        onPassDraw={handlePassDrawClick}
        onFoldDraw={handleFoldDrawClick}
      />
    </div>
  );
});
