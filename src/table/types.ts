export interface SerializedCard {
  rank: string;
  suit: string;
}

export interface PlayedCardEntry {
  playerId: string;
  card: SerializedCard;
  trickNumber: number;
}

export interface CurrentTrickState {
  trickNumber: number;
  leadPlayerId: string;
  leadSuit: string | null;
  plays: Array<{ playerId: string; card: SerializedCard }>;
}

export interface TablePlayer {
  playerId: string;
  displayName: string;
  photoURL?: string | null;
  handsWon: number;
  /** Session net — only populated for the viewing player. */
  net?: number;
  /** Live stack — public to all observers. */
  bankroll?: number | null;
  /** True when bankroll is zero and player cannot enroll without rebuy. */
  isOut?: boolean;
  /** Brief pulse after bankroll changes at settlement. */
  bankrollTick?: "up" | "down" | null;
  /** Bourré avatar alert — pulse then stable marker (post-settlement). */
  bourreAlert?: "pulse" | "marker" | null;
  /** In-hand bourré risk — must win final trick (live play only). */
  bourrePressure?: boolean;
  perHandStake?: number;
  inHand: boolean;
  /** Tricks won this hand — from session.currentHand.tricksByPlayer[playerId]. */
  tricksThisHand: number;
  isSelf: boolean;
  isDealer: boolean;
  isLeading?: boolean;
  isWinner: boolean;
  enrollmentSatOut?: boolean;
  enrollmentJoined?: boolean;
  isRobot?: boolean;
  canToggleInHand: boolean;
  /** Explicit pass/fold during play-or-pass enrollment window. */
  canPassEnrollment?: boolean;
  /** Declared draw count when player chose to stay in (decision phase). */
  decisionPlannedDiscards?: number;
  canEditTricks: boolean;
  /** Opponent hole cards — face-down count only, never actual cards. */
  showHoleCards?: boolean;
  /** Remaining hole cards (from public play history via cardsRemainingInHand). */
  holeCardCount?: number;
  /** Face-up trump on holder seat during reveal (opponent/bot dealer). */
  revealedTrumpUpcard?: SerializedCard | null;
  revealedTrumpIndex?: number | null;
  seatTrumpMergeActive?: boolean;
  /** True when this player holds the turn (public state). */
  isOnTurn?: boolean;
  /** Enrollment or play/draw turn — stronger seat emphasis than isOnTurn alone. */
  isActiveActor?: boolean;
  /** Local player declared an action; awaiting server confirmation. */
  actionDeclared?: boolean;
  /** Brief pulse when a captured trick is swept to this seat. */
  isTrickCapture?: boolean;
  /** Enrollment join/pass pulse from presentation layer. */
  enrollmentPulse?: "join" | "pass" | null;
  /** Active draw animation sub-phase at this seat. */
  drawAnimSubPhase?: "discard" | "receive" | "done" | null;
  drawDiscardCount?: number;
  drawReplaceCount?: number;
  /** Ape Score ranking — public leaderboard data, not private hand info. */
  apeScore?: number | null;
  apeClass?: string | null;
  apeStatus?: string | null;
  /** Session hands won streak proxy. */
  sessionStreak?: number;
  /** This hand's ante — only for the viewing player. */
  myHandContribution?: number;
  /** Brief pulse when turn passes to this seat. */
  turnHandoff?: boolean;
  /** Active 15s turn countdown ring — only on the current required actor. */
  turnCountdown?: {
    progress: number;
    remainingMs: number;
    segment: "green" | "yellow" | "red";
  } | null;
  /** Dealer badge just moved to this seat. */
  dealerMoved?: boolean;
  /** Trump reveal merging into dealer hand (presentation only). */
  trumpMerging?: boolean;
  /** Incrementing key retriggers trick badge tick animation. */
  trickBadgeTick?: number;
  /** Brief winner flash during trick reveal. */
  winnerFlash?: boolean;
}

export interface PotMetrics {
  anteAmount: number;
  potCap: number;
  currentPot: number;
  maxWinThisHand: number;
  limEnabled: boolean;
  overflow: number;
}

export interface TableSessionData {
  sessionId: string;
  handNumber: number;
  handStake: number;
  carryOverPot: number;
  isFinal: boolean;
  dealerId: string | null;
  participantIds: string[];
  tricksByPlayer: Record<string, number>;
  phase?: string | null;
  /** Player who holds the flipped trump card (usually the dealer). */
  trumpHolderId?: string | null;
  trumpSuit?: string | null;
  trumpUpcard?: SerializedCard | null;
  turnPlayerId?: string | null;
  remainingDeckCount?: number | null;
  leadSuit?: string | null;
  currentTrick?: CurrentTrickState | null;
  playedCards?: PlayedCardEntry[];
  drawCompletedIds?: string[];
  maxDrawDiscards?: number | null;
  cinchEnabled?: boolean;
  postedAntes?: Record<string, number>;
  /** Clockwise draw/play order (dealer-relative seat ring). */
  actionOrder?: string[];
  /** Full table seat ring — not join order. */
  seatedIds?: string[];
  pendingCoWinSettlement?: {
    winnerIds: string[];
    votes?: Record<string, string>;
  } | null;
  handEnrollment?: {
    active?: boolean;
    orderedPlayerIds?: string[];
    currentIndex?: number;
    turnDeadlineMs?: number;
    enrolledIds?: string[];
    declinedIds?: string[];
    plannedDiscards?: Record<string, number>;
  } | null;
}

export interface TableSessionActions {
  onToggleInHand: (inHand: boolean) => void;
  onPassEnrollment?: () => void | Promise<void>;
  /** Pagat post-reveal play/pass with optional declared discard count. */
  onDecisionPlay?: (discardCount: number) => void | Promise<void>;
  /** After trump reveal presentation, open the play/pass clock on the server. */
  onAdvanceReveal?: () => void | Promise<void>;
  onTrickDelta: (delta: number) => void;
  onSettle: (choice: "push" | "split") => void;
  onSubmitDraw?: (discardIndices: number[]) => void | Promise<void>;
  onPassDraw?: () => void | Promise<void>;
  onFoldDraw?: () => void | Promise<void>;
  onPlayCard?: (cardIndex: number) => void | Promise<void>;
}

export type TableActionFeedback = {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
};

export interface TableSessionViewProps {
  session: TableSessionData;
  players: TablePlayer[];
  potMetrics: PotMetrics;
  /** Viewing player's session net only (never an aggregate of all players). */
  mySessionNet: number | null;
  /** Viewing player's ante this hand (private). */
  myHandContribution: number | null;
  leaderLabel: string;
  showCoWinSettlement: boolean;
  splitSharePerWinner?: number;
  voteStatus: string;
  enrollmentActive?: boolean;
  currentUserId: string | null;
  /** Indices of legal plays for the viewing player (computed from private hand). */
  legalPlayIndices?: number[] | null;
  /** Bourré players from the most recently settled hand (drives avatar alert). */
  recentBourreIds?: string[];
  /** Viewing player's dealt cards (private — never other players' hands). */
  heroCards?: SerializedCard[];
  /** Unadjusted private hand — presentation uses this for trump-holder fan. */
  rawHeroCards?: SerializedCard[];
  /** True after the first privateHand snapshot (or error) for this session. */
  privateHandReady?: boolean;
  /** True when all five tricks are recorded for the current hand. */
  handComplete?: boolean;
  actionFeedback?: TableActionFeedback | null;
  actions: TableSessionActions;
}
