import {
  yourTurnAttentionReducedMotion,
  type YourTurnAttentionPhase,
} from "./hooks/useYourTurnAttention";

interface YourTurnAttentionProps {
  phase: YourTurnAttentionPhase;
}

export function YourTurnAttention({
  phase,
  beat = 0,
}: YourTurnAttentionProps & { beat?: number }) {
  if (phase === "hidden") return null;

  const reduced = yourTurnAttentionReducedMotion();
  const urgency = Math.min(beat, 5);

  return (
    <div
      className={[
        "byour-turn",
        phase === "exit" ? "byour-turn--exit" : "byour-turn--pop",
        reduced ? "byour-turn--reduced" : "",
        urgency > 0 ? `byour-turn--urgency-${urgency}` : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-testid="your-turn-attention"
      role="status"
      aria-live="polite"
      aria-label="Your turn to play"
    >
      <span className="byour-turn__text">Your Turn!</span>
    </div>
  );
}
