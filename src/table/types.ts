export interface TablePlayer {
  playerId: string;
  displayName: string;
  photoURL?: string | null;
  handsWon: number;
  net: number;
  perHandStake?: number;
  inHand: boolean;
  tricksThisHand: number;
  isSelf: boolean;
  isDealer: boolean;
  isLeading?: boolean;
  isWinner: boolean;
  enrollmentOnClock?: boolean;
  enrollmentSatOut?: boolean;
  enrollmentJoined?: boolean;
  canToggleInHand: boolean;
  canEditTricks: boolean;
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
}

export interface TableSessionViewProps {
  session: TableSessionData;
  players: TablePlayer[];
  potAmount: number;
  netTotal: number;
  leaderLabel: string;
  showCoWinSettlement: boolean;
  splitSharePerWinner?: number;
  voteStatus: string;
  enrollmentActive?: boolean;
  enrollmentSecondsLeft?: number;
  currentUserId: string | null;
  actions: TableSessionActions;
}
