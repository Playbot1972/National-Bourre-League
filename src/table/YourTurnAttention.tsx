import {
  yourTurnAttentionReducedMotion,
  type YourTurnAttentionPhase,
} from "./hooks/useYourTurnAttention";

interface YourTurnAttentionProps {
  phase: YourTurnAttentionPhase;
  cycleIndex?: number;
}

export function YourTurnAttention({ phase, cycleIndex = 0 }: YourTurnAttentionProps) {
  if (phase === "hidden") return null;

  const reduced = yourTurnAttentionReducedMotion();

  return (
    <div
      className={[
        "byour-turn",
        phase === "exit" ? "byour-turn--exit" : "byour-turn--pop",
        reduced ? "byour-turn--reduced" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="your-turn-attention"
      data-your-turn-cycle={String(cycleIndex + 1)}
      role="status"
      aria-live="polite"
      aria-label="Your turn to play"
    >
      <span className="byour-turn__text">Your Turn!</span>
    </div>
  );
}
