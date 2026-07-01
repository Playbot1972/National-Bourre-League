import { memo, useSyncExternalStore } from "react";
import { TurnCountdownRing } from "./TurnCountdownRing";
import {
  getTurnCountdownConfig,
  subscribeTurnCountdownConfig,
} from "./turnCountdownStore";

interface ConnectedTurnCountdownRingProps {
  playerId: string;
}

function ConnectedTurnCountdownRingInner({ playerId }: ConnectedTurnCountdownRingProps) {
  const config = useSyncExternalStore(subscribeTurnCountdownConfig, getTurnCountdownConfig);
  if (!config || config.playerId !== playerId) return null;
  return (
    <TurnCountdownRing
      activityKey={config.activityKey}
      startedAtMs={config.startedAtMs}
    />
  );
}

export const ConnectedTurnCountdownRing = memo(ConnectedTurnCountdownRingInner);
