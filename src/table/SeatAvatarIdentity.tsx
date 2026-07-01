import { memo, useCallback, type KeyboardEvent, type MouseEvent } from "react";
import { formatSeatDisplayName } from "./logic";
import { ConnectedTurnCountdownRing } from "./ConnectedTurnCountdownRing";

export interface SeatAvatarIdentityProps {
  displayName: string;
  photoURL?: string | null;
  isDealer?: boolean;
  dealerMoved?: boolean;
  inHand?: boolean;
  bourrePressure?: boolean;
  bourrePulse?: boolean;
  /** When set, this seat shows the isolated turn countdown ring. */
  countdownPlayerId?: string | null;
  peek?: boolean;
  onTogglePeek: () => void;
  onBlurPeek: () => void;
}

function SeatAvatarIdentityInner({
  displayName,
  photoURL,
  isDealer = false,
  dealerMoved = false,
  inHand = false,
  bourrePressure = false,
  bourrePulse = false,
  countdownPlayerId = null,
  peek = false,
  onTogglePeek,
  onBlurPeek,
}: SeatAvatarIdentityProps) {
  const seatDisplayName = formatSeatDisplayName(displayName);
  const imageUrl = photoURL?.trim() || null;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onTogglePeek();
      }
    },
    [onTogglePeek],
  );

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      event.stopPropagation();
      onTogglePeek();
    },
    [onTogglePeek],
  );

  return (
    <div className="bseat__avatar-unit">
      <div
        className={`bseat__avatar-wrap${peek ? " bseat__avatar-wrap--peek" : ""}`}
        role="button"
        tabIndex={0}
        aria-label={`${seatDisplayName} seat`}
        aria-expanded={peek}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onBlur={onBlurPeek}
      >
        <div className="bseat__avatar-frame" data-testid="seat-avatar-frame">
          <div className="bseat__avatar-media">
            {imageUrl ? (
              <img
                className="bseat__avatar bseat__avatar--image"
                src={imageUrl}
                alt=""
                decoding="async"
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="bseat__avatar bseat__avatar--fallback" aria-hidden="true" />
            )}
          </div>
          {isDealer && (
            <span className={`bseat__dealer${dealerMoved ? " bseat__dealer--moved" : ""}`}>
              D
            </span>
          )}
          {inHand && <span className="bseat__in-badge" title="In this hand" />}
          {bourrePressure && (
            <span className="bseat__bourre-pressure-ring" aria-hidden="true" />
          )}
          {bourrePulse && !bourrePressure && (
            <span className="bseat__bourre-ring" aria-hidden="true" />
          )}
          {countdownPlayerId && <ConnectedTurnCountdownRing playerId={countdownPlayerId} />}
        </div>
      </div>
      <span className="bseat__avatar-label" title={seatDisplayName}>
        {seatDisplayName}
      </span>
    </div>
  );
}

export const SeatAvatarIdentity = memo(SeatAvatarIdentityInner);
