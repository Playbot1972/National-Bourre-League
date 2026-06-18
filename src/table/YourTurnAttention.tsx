import { yourTurnAttentionReducedMotion } from "./hooks/useYourTurnAttention";

interface YourTurnAttentionProps {
  visible: boolean;
}

export function YourTurnAttention({ visible }: YourTurnAttentionProps) {
  if (!visible) return null;

  const reduced = yourTurnAttentionReducedMotion();

  return (
    <div
      className={[
        "byour-turn",
        reduced ? "byour-turn--reduced" : "byour-turn--pop",
      ].join(" ")}
      data-testid="your-turn-attention"
      role="status"
      aria-live="polite"
      aria-label="Your turn to play"
    >
      <span className="byour-turn__text">Your Turn!</span>
    </div>
  );
}
