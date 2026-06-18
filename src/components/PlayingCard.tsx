import type { PointerEventHandler } from "react";
import { SUIT_SYMBOL, SUIT_LABEL, isRedSuit, type Card } from "../types";
import "./PlayingCard.css";

export type CardState =
  | "default"
  | "trump"
  | "winner"
  | "muted"
  | "selected"
  | "draw-selected"
  | "disabled";

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  state?: CardState;
  badge?: string;
  /** @deprecated Use pointerHandlers — kept for non-table tutorial cards. */
  onClick?: () => void;
  /** Click fallback when pointerHandlers are active (tap + mouse click). */
  onPlayClick?: () => void;
  pointerHandlers?: {
    onPointerDown?: PointerEventHandler<HTMLElement>;
    onPointerMove?: PointerEventHandler<HTMLElement>;
    onPointerUp?: PointerEventHandler<HTMLElement>;
    onPointerCancel?: PointerEventHandler<HTMLElement>;
    onPointerLeave?: PointerEventHandler<HTMLElement>;
  };
  pressed?: boolean;
  playing?: boolean;
  playable?: boolean;
  illegalShake?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
  "data-testid"?: string;
  "data-card-index"?: number;
  "data-playable"?: "true" | "false";
}

export function PlayingCard({
  card,
  faceDown = false,
  size = "md",
  state = "default",
  badge,
  onClick,
  onPlayClick,
  pointerHandlers,
  pressed = false,
  playing = false,
  playable = false,
  illegalShake = false,
  disabled = false,
  ariaLabel,
  "data-testid": dataTestId,
  "data-card-index": dataCardIndex,
  "data-playable": dataPlayable,
}: PlayingCardProps) {
  const pointerInteractive = Boolean(pointerHandlers);
  const clickInteractive = typeof onClick === "function";
  const interactive = (pointerInteractive || clickInteractive) && !disabled;
  const classes = [
    "pcard",
    `pcard--${size}`,
    `pcard--${state}`,
    interactive ? "pcard--interactive" : "",
    playable ? "pcard--playable" : "",
    pressed ? "pcard--pressed" : "",
    playing ? "pcard--playing" : "",
    illegalShake ? "pcard--illegal-shake" : "",
    disabled ? "pcard--disabled" : "",
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
  const suitClass = `pcard--suit-${card.suit}`;

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
        className={`${classes} ${red ? "pcard--red" : "pcard--black"} ${suitClass}`}
        onClick={
          pointerInteractive && playable && onPlayClick
            ? (event) => {
                event.preventDefault();
                onPlayClick();
              }
            : pointerInteractive
              ? undefined
              : onClick
        }
        disabled={disabled}
        aria-disabled={disabled || undefined}
        aria-busy={playing || undefined}
        aria-label={label}
        data-testid={dataTestId}
        data-card-index={dataCardIndex}
        data-playable={dataPlayable}
        {...pointerHandlers}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={`${classes} ${red ? "pcard--red" : "pcard--black"} ${suitClass}`}
      role="img"
      aria-label={label}
      aria-disabled={disabled || undefined}
      data-testid={dataTestId}
      data-card-index={dataCardIndex}
      data-playable={dataPlayable}
    >
      {content}
    </div>
  );
}
