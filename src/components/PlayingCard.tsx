import type { MutableRefObject, PointerEventHandler } from "react";
import { SUIT_SYMBOL, SUIT_LABEL, isRedSuit, type Card } from "../types";
import { consumeSuppressNextClick } from "./cardGesture";
import "./PlayingCard.css";

export type CardState =
  | "default"
  | "trump"
  | "winner"
  | "muted"
  | "selected"
  | "play-recommended"
  | "play-preselected"
  | "draw-recommended"
  | "draw-selected"
  | "trick-leading"
  | "disabled";

interface PlayingCardProps {
  card?: Card;
  faceDown?: boolean;
  size?: "xs" | "sm" | "md" | "lg";
  state?: CardState;
  badge?: string;
  /** @deprecated Use pointerHandlers — kept for non-table tutorial cards. */
  onClick?: () => void;
  /** After pointer-up handled play, skip the synthetic click that follows. */
  /** Click fallback when pointerHandlers are active (keyboard activation). */
  onPlayClick?: () => void;
  suppressNextClickRef?: MutableRefObject<boolean>;
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
  /** When false, legal cards skip the ambient playable hint animation (hero hand). */
  showPlayableHint?: boolean;
  illegalShake?: boolean;
  illegalFlash?: boolean;
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
  suppressNextClickRef,
  pointerHandlers,
  pressed = false,
  playing = false,
  playable = false,
  showPlayableHint = true,
  illegalShake = false,
  illegalFlash = false,
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
    playable && showPlayableHint ? "pcard--playable" : "",
    pressed ? "pcard--pressed" : "",
    playing ? "pcard--playing" : "",
    illegalShake ? "pcard--illegal-shake" : "",
    illegalFlash ? "pcard--illegal-flash" : "",
    disabled ? "pcard--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (faceDown || !card) {
    return (
      <div className={`${classes} pcard--back`} aria-label="Face-down card" role="img">
        <span className="pcard__surface pcard__surface--back" aria-hidden="true">
          <span className="pcard__back-pattern" />
          <span className="pcard__back-emblem" aria-hidden="true" />
        </span>
      </div>
    );
  }

  const red = isRedSuit(card.suit);
  const symbol = SUIT_SYMBOL[card.suit];
  const label = ariaLabel ?? `${card.rank} of ${SUIT_LABEL[card.suit]}`;
  const suitClass = `pcard--suit-${card.suit}`;

  const content = (
    <span className="pcard__surface" aria-hidden="true">
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
    </span>
  );

  if (interactive) {
    return (
      <button
        type="button"
        className={`${classes} ${red ? "pcard--red" : "pcard--black"} ${suitClass}`}
        onClick={
          pointerInteractive && onPlayClick
            ? (event) => {
                if (suppressNextClickRef && consumeSuppressNextClick(suppressNextClickRef)) {
                  event.preventDefault();
                  return;
                }
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
