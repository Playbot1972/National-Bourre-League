import { useEffect } from "react";
import { disposeTurnCountdownEngine, syncTurnCountdownEngine } from "./turnCountdownStore";
import type { TurnCountdownInput } from "./turnCountdown";

/** Runs the table turn timer without forcing parent React state updates on each tick. */
export function TurnCountdownSync({ input }: { input: TurnCountdownInput }) {
  // Sync during render so seat rings read a populated config on the same pass.
  // useEffect-only sync left rings permanently null (store updated after paint).
  syncTurnCountdownEngine(input);

  useEffect(() => () => disposeTurnCountdownEngine(), []);

  return null;
}
