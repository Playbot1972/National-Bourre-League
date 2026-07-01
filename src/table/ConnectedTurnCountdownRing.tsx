import { memo, useSyncExternalStore } from "react";
import { TurnCountdownRing } from "./TurnCountdownRing";
import { getTurnCountdownSnapshot, subscribeTurnCountdown } from "./turnCountdownStore";

interface ConnectedTurnCountdownRingProps {
  playerId: string;
}

function ConnectedTurnCountdownRingInner({ playerId }: ConnectedTurnCountdownRingProps) {
  const state = useSyncExternalStore(subscribeTurnCountdown, getTurnCountdownSnapshot);
  if (!state || state.playerId !== playerId) return null;
  return <TurnCountdownRing progress={state.progress} segment={state.segment} />;
}

export const ConnectedTurnCountdownRing = memo(ConnectedTurnCountdownRingInner);
