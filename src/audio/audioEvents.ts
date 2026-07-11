/** Card-table audio event model — presentation only, no gameplay truth. */

export type CardAudioEventType =
  | "card:played"
  | "card:lead-change"
  | "trick:won"
  | "trick:collected";

export interface CardAudioEventPayload {
  type: CardAudioEventType;
  trickId: number;
  cardId?: string;
  playerCount: number;
  cardsInTrick: number;
  takesLead?: boolean;
  isLocalPlayer?: boolean;
  winningSeat?: string;
  intensityTier: number;
}

export interface CardLandedAudioInput {
  trickId: number;
  cardId: string;
  playerId: string;
  cardIndex: number;
  playerCount: number;
  cardsInTrick: number;
  takesLead: boolean;
  isLocalPlayer: boolean;
}

export interface TrickWonAudioInput {
  trickId: number;
  winningSeat: string;
  playerCount: number;
  isLocalPlayer: boolean;
}

export interface TrickCollectedAudioInput {
  trickId: number;
  winningSeat: string;
  playerCount: number;
}

/** Subtle escalation for lead-change sweeteners — biggest payoff stays on trick:won. */
export function deriveIntensityTier(playerCount: number, cardsInTrick: number): number {
  const clampedPlayers = Math.max(2, Math.min(8, playerCount));
  const playerFactor = Math.min(1, Math.floor((clampedPlayers - 2) / 3));
  const positionFactor = cardsInTrick <= 4 ? 0 : 1;
  return Math.min(2, playerFactor + positionFactor);
}

export function cardAudioDedupeKey(
  type: CardAudioEventType,
  trickId: number,
  suffix: string,
): string {
  return `${type}:${trickId}:${suffix}`;
}

export function cardIdFromPlay(playerId: string, rank: string, suit: string): string {
  return `${playerId}:${rank}:${suit}`;
}

export function buildCardPlayedPayload(input: CardLandedAudioInput): CardAudioEventPayload {
  return {
    type: "card:played",
    trickId: input.trickId,
    cardId: input.cardId,
    playerCount: input.playerCount,
    cardsInTrick: input.cardsInTrick,
    takesLead: input.takesLead,
    isLocalPlayer: input.isLocalPlayer,
    intensityTier: deriveIntensityTier(input.playerCount, input.cardsInTrick),
  };
}

export function buildLeadChangePayload(input: CardLandedAudioInput): CardAudioEventPayload {
  return {
    type: "card:lead-change",
    trickId: input.trickId,
    cardId: input.cardId,
    playerCount: input.playerCount,
    cardsInTrick: input.cardsInTrick,
    takesLead: true,
    isLocalPlayer: input.isLocalPlayer,
    intensityTier: deriveIntensityTier(input.playerCount, input.cardsInTrick),
  };
}

export function buildTrickWonPayload(input: TrickWonAudioInput): CardAudioEventPayload {
  return {
    type: "trick:won",
    trickId: input.trickId,
    winningSeat: input.winningSeat,
    playerCount: input.playerCount,
    cardsInTrick: 0,
    isLocalPlayer: input.isLocalPlayer,
    intensityTier: 2,
  };
}

export function buildTrickCollectedPayload(input: TrickCollectedAudioInput): CardAudioEventPayload {
  return {
    type: "trick:collected",
    trickId: input.trickId,
    winningSeat: input.winningSeat,
    playerCount: input.playerCount,
    cardsInTrick: 0,
    intensityTier: 1,
  };
}
