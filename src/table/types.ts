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
  perHandStake?: number;
  inHand: boolean;
  tricksThisHand: number;
  isSelf: boolean;
  isDealer: boolean;
  isLeading?: boolean;
  isWinner: boolean;
  enrollmentOnClock?: boolean;
  /** Fraction of enrollment window remaining (1 = full, 0 = expired). */
  enrollmentTimeLeft?: number;
  /** Seconds left when this player is on the enrollment clock. */
  enrollmentSecondsOnClock?: number;
  enrollmentSatOut?: boolean;
  enrollmentJoined?: boolean;
  isRobot?: boolean;
  canToggleInHand: boolean;
  canEditTricks: boolean;
  /** Opponent hole cards — face-down count only, never actual cards. */
  showHoleCards?: boolean;
  holeCardCount?: number;
  /** True when this player holds the turn (public state). */
  isOnTurn?: boolean;
  /** This hand's ante — only for the viewing player. */
  myHandContribution?: number;
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
  } | null;
}

export interface TableSessionActions {
  onToggleInHand: (inHand: boolean) => void;
  onTrickDelta: (delta: number) => void;
  onSettle: (choice: "push" | "split") => void;
  onSubmitDraw?: (discardIndices: number[]) => void;
  onPassDraw?: () => void;
  onPlayCard?: (cardIndex: number) => void;
}

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
  enrollmentSecondsLeft?: number;
  currentUserId: string | null;
  /** Indices of legal plays for the viewing player (computed from private hand). */
  legalPlayIndices?: number[] | null;
  /** Viewing player's dealt cards (private — never other players' hands). */
  heroCards?: SerializedCard[];
  actions: TableSessionActions;
}
