import { useEffect, useLayoutEffect, useRef } from "react";
import { useTrickPresentation, type UseTrickPresentationInput } from "./hooks/useTrickPresentation";
import {
  disposeTrickPresentationStore,
  publishTrickPresentation,
} from "./trickPresentationStore";

/**
 * Headless trick presentation runner — owns reducer/timers and publishes
 * snapshots without forcing the main table tree to rerender on each tick.
 */
export function TrickPresentationSync(input: UseTrickPresentationInput) {
  const presentation = useTrickPresentation(input);
  const forceDrainRef = useRef(presentation.forceHandEndDrain);
  forceDrainRef.current = presentation.forceHandEndDrain;

  useLayoutEffect(() => {
    publishTrickPresentation({
      ...presentation,
      forceHandEndDrain: () => forceDrainRef.current(),
    });
  });

  useEffect(() => () => disposeTrickPresentationStore(), []);

  return null;
}
