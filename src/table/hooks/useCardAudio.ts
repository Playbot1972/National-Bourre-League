import { useCallback, useEffect, useRef } from "react";
import { dispatchCardAudio, clearCardAudioDedupe } from "../../audio/AudioManager";
import { resetWinningCardSequenceCount, incrementWinningCardSequenceCount } from "../../audio/winningCardSweetener";
import { scheduleWinningCardSweetenerAfterCardPlace } from "../feedback/service";
import { shouldPlayKungfuCardPlace } from "../trickTiming";
import {
  buildCardPlayedPayload,
  buildTrickCollectedPayload,
  buildTrickWonPayload,
  cardIdFromPlay,
  type CardLandedAudioInput,
  type TrickCollectedAudioInput,
} from "../../audio/audioEvents";
import type { CardLandedAudioCallbackInput } from "../TrickPlaySlot";
import type { TrickPresentation } from "./useTrickPresentation";

export interface UseCardAudioInput {
  trickPresentation: TrickPresentation;
  currentUserId?: string | null;
  participantCount: number;
  trickNumber: number;
  handNumber?: number;
  sessionPhase?: string | null;
}

export interface CardAudioHandlers {
  onCardLanded: (input: CardLandedAudioCallbackInput) => void;
  onTrickCollectionStart: (input: Omit<TrickCollectedAudioInput, "playerCount">) => void;
}

/**
 * Event-driven card audio — syncs to animation milestones, not server snapshots.
 */
export function useCardAudio({
  trickPresentation,
  currentUserId = null,
  participantCount,
  trickNumber,
  handNumber = 0,
  sessionPhase = null,
}: UseCardAudioInput): CardAudioHandlers {
  const prevPhaseRef = useRef(trickPresentation.phase);
  const lastWonKeyRef = useRef<string | null>(null);

  useEffect(() => {
    resetWinningCardSequenceCount();
  }, [handNumber]);

  useEffect(() => {
    if (sessionPhase !== "play") {
      clearCardAudioDedupe();
      lastWonKeyRef.current = null;
      resetWinningCardSequenceCount();
    }
  }, [sessionPhase]);

  useEffect(() => {
    const prev = prevPhaseRef.current;
    const phase = trickPresentation.phase;
    prevPhaseRef.current = phase;

    if (prev === phase) return;
    if (phase !== "winnerReveal") return;

    const frozen = trickPresentation.frozenTrick;
    const winnerId = frozen?.winnerId ?? trickPresentation.trickWinnerSeatId;
    if (!winnerId || !frozen) return;

    const wonKey = `${frozen.trickNumber}:${winnerId}:won`;
    if (lastWonKeyRef.current === wonKey) return;
    lastWonKeyRef.current = wonKey;

    dispatchCardAudio(
      buildTrickWonPayload({
        trickId: frozen.trickNumber,
        winningSeat: winnerId,
        playerCount: participantCount,
        isLocalPlayer: currentUserId === winnerId,
      }),
    );
  }, [
    trickPresentation.phase,
    trickPresentation.frozenTrick,
    trickPresentation.trickWinnerSeatId,
    participantCount,
    currentUserId,
  ]);

  const onCardLanded = useCallback(
    (input: CardLandedAudioCallbackInput) => {
      if (trickPresentation.phase !== "live") return;

      const landed: CardLandedAudioInput = {
        cardId: input.cardId,
        playerId: input.playerId,
        cardIndex: input.cardIndex,
        cardsInTrick: input.cardsInTrick,
        takesLead: input.takesLead,
        isLocalPlayer: input.isLocalPlayer,
        trickId: trickNumber,
        playerCount: participantCount,
      };

      // Always play card-hit-table thock first (unchanged).
      dispatchCardAudio(buildCardPlayedPayload(landed));

      const isNewWinningCard = landed.takesLead && landed.cardIndex > 0;
      if (!isNewWinningCard) return;

      const lastCardTrickWin =
        input.playsInTrick != null &&
        input.participantCount != null &&
        shouldPlayKungfuCardPlace({
          trickNumber: input.trickNumber ?? trickNumber,
          playerId: input.playerId,
          playsInTrick: input.playsInTrick,
          leadSuit: input.leadSuit,
          trumpSuit: input.trumpSuit,
          participantCount: input.participantCount,
        });

      const sequenceCount = incrementWinningCardSequenceCount();

      scheduleWinningCardSweetenerAfterCardPlace({
        sequenceCount,
        lastCardTrickWin,
        isLocalPlayer: input.isLocalPlayer,
      });
    },
    [trickPresentation.phase, trickNumber, participantCount],
  );

  const onTrickCollectionStart = useCallback(
    (input: Omit<TrickCollectedAudioInput, "playerCount">) => {
      dispatchCardAudio(
        buildTrickCollectedPayload({
          ...input,
          playerCount: participantCount,
          isLocalPlayer:
            input.isLocalPlayer ??
            (currentUserId != null && currentUserId === input.winningSeat),
        }),
      );
    },
    [participantCount, currentUserId],
  );

  return { onCardLanded, onTrickCollectionStart };
}

export { cardIdFromPlay };
