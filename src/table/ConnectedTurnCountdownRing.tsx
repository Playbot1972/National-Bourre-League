import { useSyncExternalStore } from "react";
import { TurnCountdownRing } from "./TurnCountdownRing";
import {
  getTurnCountdownConfig,
  subscribeTurnCountdownConfig,
} from "./turnCountdownStore";

interface ConnectedTurnCountdownRingProps {
  playerId: string;
}

/** Must not be memo()'d — useSyncExternalStore updates would be swallowed. */
export function ConnectedTurnCountdownRing({ playerId }: ConnectedTurnCountdownRingProps) {
  const config = useSyncExternalStore(
    subscribeTurnCountdownConfig,
    getTurnCountdownConfig,
    getTurnCountdownConfig,
  );
  if (!config || config.playerId !== playerId) return null;
  return (
    <TurnCountdownRing
      activityKey={config.activityKey}
      startedAtMs={config.startedAtMs}
      durationMs={config.durationMs}
    />
  );
}
