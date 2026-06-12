import { SUIT_SYMBOL, SUIT_LABEL, isRedSuit, type Card } from "../types";
import "./PlayingCard.css";

export type CardState = "default" | "trump" | "winner" | "muted" | "selected";

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  size?: "sm" | "md" | "lg";
  state?: CardState;
  badge?: string;
  onClick?: () => void;
  ariaLabel?: string;
}

export function PlayingCard({
  card,
  faceDown = false,
  size = "md",
  state = "default",
  badge,
  onClick,
  ariaLabel,
}: PlayingCardProps) {
  const interactive = typeof onClick === "function";
  const classes = [
    "pcard",
    `pcard--${size}`,
    `pcard--${state}`,
    interactive ? "pcard--interactive" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (faceDown || !card) {
    return (
      <div className={`${classes} pcard--back`} aria-label="Face-down card" role="img">
        <div className="pcard__back-pattern" />
      </div>
    );
  }

  const red = isRedSuit(card.suit);
  const symbol = SUIT_SYMBOL[card.suit];
  const label = ariaLabel ?? `${card.rank} of ${SUIT_LABEL[card.suit]}`;

  const content = (
    <>
      {badge && <span className="pcard__badge">{badge}</span>}
      <span className="pcard__corner pcard__corner--tl">
        <span className="pcard__rank">{card.rank}</span>
        <span className="pcard__suit">{symbol}</span>
      </span>
      <span className="pcard__center">{symbol}</span>
      <span className="pcard__corner pcard__corner--br">
        <span className="pcard__rank">{card.rank}</span>
        <span className="pcard__suit">{symbol}</span>
      </span>
    </>
  );

  if (interactive) {
    return (
      <button
        type="button"
        className={`${classes} ${red ? "pcard--red" : "pcard--black"}`}
        onClick={onClick}
        aria-label={label}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`${classes} ${red ? "pcard--red" : "pcard--black"}`}
      role="img"
      aria-label={label}
    >
      {content}
    </div>
  );
}
