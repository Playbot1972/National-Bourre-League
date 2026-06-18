import {
  yourTurnAttentionReducedMotion,
  type YourTurnAttentionPhase,
} from "./hooks/useYourTurnAttention";

interface YourTurnAttentionProps {
  phase: YourTurnAttentionPhase;
}

export function YourTurnAttention({ phase }: YourTurnAttentionProps) {
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
      role="status"
      aria-live="polite"
      aria-label="Your turn to play"
    >
      <span className="byour-turn__text">Your Turn!</span>
    </div>
  );
}
