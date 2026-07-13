import { useCallback, useEffect, useRef } from "react";
import { dispatchCardAudio, clearCardAudioDedupe } from "../../audio/AudioManager";
import {
  buildCardPlayedPayload,
  buildLeadChangePayload,
  buildTrickCollectedPayload,
  buildTrickWonPayload,
  cardIdFromPlay,
  type CardLandedAudioInput,
  type TrickCollectedAudioInput,
} from "../../audio/audioEvents";
import type { TrickPresentation } from "./useTrickPresentation";

export interface UseCardAudioInput {
  trickPresentation: TrickPresentation;
  currentUserId?: string | null;
  participantCount: number;
  trickNumber: number;
  sessionPhase?: string | null;
}

export interface CardAudioHandlers {
  onCardLanded: (input: Omit<CardLandedAudioInput, "trickId" | "playerCount">) => void;
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
  sessionPhase = null,
}: UseCardAudioInput): CardAudioHandlers {
  const prevPhaseRef = useRef(trickPresentation.phase);
  const lastWonKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (sessionPhase !== "play") {
      clearCardAudioDedupe();
      lastWonKeyRef.current = null;
    }
  }, [sessionPhase, trickNumber]);

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
    (input: Omit<CardLandedAudioInput, "trickId" | "playerCount">) => {
      if (trickPresentation.phase !== "live") return;

      const landed: CardLandedAudioInput = {
        ...input,
        trickId: trickNumber,
        playerCount: participantCount,
      };

      dispatchCardAudio(buildCardPlayedPayload(landed));

      if (landed.takesLead && landed.cardIndex > 0) {
        dispatchCardAudio(buildLeadChangePayload(landed));
      }
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
