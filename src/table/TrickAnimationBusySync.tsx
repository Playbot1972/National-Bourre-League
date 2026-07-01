import { useEffect, useRef } from "react";
import {
  isDealPresentationActive,
  isTrickCollectionActive,
  subscribePresentationMotionBusy,
} from "./presentationMotionBusy";
import {
  setTrickAnimationBusyState,
  type TrickAnimationBusyState,
} from "./trickAnimationBridge";

export interface TrickAnimationBusyInput {
  pipelineActive: boolean;
  revealCatchUp: boolean;
  motionGateActive: boolean;
  peakPlayCount: number;
  displayedPlayCount: number;
  handPresenting: boolean;
  handPresentationPhase: string;
}

/** Pure merge of session/trick inputs with live motion-busy module flags. */
export function buildTrickAnimationBusyState(
  input: TrickAnimationBusyInput,
): TrickAnimationBusyState {
  return {
    pipelineActive: input.pipelineActive,
    revealCatchUp: input.revealCatchUp,
    motionGateActive: input.motionGateActive,
    peakPlayCount: input.peakPlayCount,
    displayedPlayCount: input.displayedPlayCount,
    handPresenting: input.handPresenting,
    handPresentationPhase: input.handPresentationPhase,
    dealPresentationActive: isDealPresentationActive(),
    trickCollectionActive: isTrickCollectionActive(),
  };
}

export function syncTrickAnimationBusyState(input: TrickAnimationBusyInput): void {
  setTrickAnimationBusyState(buildTrickAnimationBusyState(input));
}

/**
 * Headless bot-gate sync — publishes trick animation busy flags without
 * forcing TableSessionView rerenders on deal/trick motion boundaries.
 */
export function TrickAnimationBusySync({ input }: { input: TrickAnimationBusyInput }) {
  const inputRef = useRef(input);
  inputRef.current = input;

  useEffect(() => {
    syncTrickAnimationBusyState(inputRef.current);
  });

  useEffect(() => {
    return subscribePresentationMotionBusy(() => {
      syncTrickAnimationBusyState(inputRef.current);
    });
  }, []);

  return null;
}
