import { useEffect } from "react";
import { disposeTurnCountdownEngine, syncTurnCountdownEngine } from "./turnCountdownStore";
import type { TurnCountdownInput } from "./turnCountdown";

/** Runs the table turn timer without forcing parent React state updates on each tick. */
export function TurnCountdownSync({ input }: { input: TurnCountdownInput }) {
  useEffect(() => {
    syncTurnCountdownEngine(input);
  });

  useEffect(() => () => disposeTurnCountdownEngine(), []);

  return null;
}
