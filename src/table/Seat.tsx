import type { CSSProperties } from "react";
import { PlayingCard } from "../components/PlayingCard";
import { SmartHud } from "./SmartHud";
import { formatNet, initials, type SeatRegion } from "./logic";
import type { TablePlayer } from "./types";

interface SeatProps {
  player: TablePlayer;
  region: SeatRegion;
  style: CSSProperties;
  onToggleInHand: () => void;
  onTrickDelta: (delta: number) => void;
  onReaction?: (emoji: string) => void;
}

function EnrollmentTimerRing({ fraction }: { fraction: number }) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const size = 56;
  const stroke = 3;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped);
  const urgent = clamped <= 0.25;

  return (
    <svg
      className={`bseat__timer-ring${urgent ? " bseat__timer-ring--urgent" : ""}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
    >
      <circle
        className="bseat__timer-ring__track"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
      />
      <circle
        className="bseat__timer-ring__progress"
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  );
}

export function Seat({ player, region, style, onToggleInHand, onTrickDelta, onReaction }: SeatProps) {
  const trickCount = player.tricksThisHand;
  const cardsHeld = Math.max(0, player.holeCardCount ?? 0);
  const showTrickBadge = player.inHand;
  const showHoleCards = Boolean(player.showHoleCards && !player.isSelf && player.inHand && cardsHeld > 0);

  const seatTestId = player.isSelf
    ? "seat-bottom-self"
    : region === "top"
      ? "seat-top"
      : region === "left"
        ? "seat-left"
        : region === "right"
          ? "seat-right"
          : "seat-bottom";

  return (
    <div
      data-testid={seatTestId}
      className={[
        "bseat",
        `bseat--${region}`,
        `player-${region}`,
        player.inHand ? "bseat--in-hand" : "",
        player.isSelf ? "bseat--self" : "",
        player.isLeading ? "bseat--leading" : "",
        player.isWinner ? "bseat--winner" : "",
        player.enrollmentOnClock ? "bseat--enroll-clock" : "",
        player.enrollmentSatOut ? "bseat--sat-out" : "",
        player.isDealer ? "bseat--dealer" : "",
        player.isOnTurn ? "bseat--on-turn" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <div className="bseat__core">
        {showTrickBadge && (
          <div
            className={`bseat__trick-badge${trickCount === 0 ? " bseat__trick-badge--zero" : ""}`}
            aria-label={`${trickCount} trick${trickCount === 1 ? "" : "s"} won`}
            title={`${trickCount} trick${trickCount === 1 ? "" : "s"}`}
          >
            {trickCount}
          </div>
        )}

        {showHoleCards && (
          <div className="bseat__hole-cards" aria-label={`${cardsHeld} cards in hand`}>
            {Array.from({ length: cardsHeld }, (_, i) => (
              <div key={i} className="bseat__hole-card" style={{ ["--hole-i" as string]: i }}>
                <PlayingCard faceDown size="xs" />
              </div>
            ))}
          </div>
        )}

        <div className="bseat__avatar-stage">
          <div className="bseat__avatar-stack">
            {player.enrollmentOnClock && player.enrollmentTimeLeft != null && (
              <EnrollmentTimerRing fraction={player.enrollmentTimeLeft} />
            )}
            <div className="bseat__avatar-wrap">
              {player.isDealer && <span className="bseat__dealer">D</span>}
              {player.photoURL ? (
                <img className="bseat__avatar" src={player.photoURL} alt="" />
              ) : (
                <span className="bseat__avatar bseat__avatar--initials" aria-hidden="true">
                  {initials(player.displayName)}
                </span>
              )}
              {player.inHand && <span className="bseat__in-badge" title="In this hand" />}
            </div>
          </div>
          {player.isSelf && onReaction && (
            <div className="bseat__react-bar">
              {["👏", "😮", "🔥"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="bseat__react-btn"
                  aria-label={`React ${emoji}`}
                  onClick={() => onReaction(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bseat__aux">
        <div className="bseat__info">
          <span className="bseat__name">{player.displayName}</span>
          {player.isRobot && <span className="bseat__robot-tag muted small">Bot</span>}
          {player.enrollmentSatOut && (
            <span className="bseat__enroll-tag muted small">Sat out</span>
          )}
          {player.enrollmentJoined && !player.inHand && (
            <span className="bseat__enroll-tag muted small">Joined</span>
          )}
          {player.isSelf && player.net != null && (
            <span className={`bseat__net ${player.net > 0 ? "up" : player.net < 0 ? "down" : ""}`}>
              {formatNet(player.net)}
            </span>
          )}
        </div>

        <SmartHud player={player} compact={region === "left" || region === "right"} />

        {player.enrollmentOnClock && (
          <span className="bseat__enroll-timer" aria-live="polite">
            {player.isSelf
              ? `Tap I'm in · ${player.enrollmentSecondsOnClock ?? "?"}s`
              : `${player.enrollmentSecondsOnClock ?? "?"}s`}
          </span>
        )}

        {player.canToggleInHand && (
          <button type="button" className="bseat__opt-in btn btn--sm" onClick={onToggleInHand}>
            I&apos;m in
          </button>
        )}

        {player.canEditTricks && (
          <div className="bseat__controls">
            <button
              type="button"
              className="bseat__trick-btn bseat__trick-btn--plus"
              aria-label="Won a trick"
              disabled={trickCount >= 5}
              onClick={() => onTrickDelta(1)}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
