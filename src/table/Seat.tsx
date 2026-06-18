import { useCallback, useState, type CSSProperties } from "react";
import { PlayingCard } from "../components/PlayingCard";
import { SmartHud } from "./SmartHud";
import { formatBankroll, initials, type SeatRegion } from "./logic";
import type { TablePlayer } from "./types";

interface SeatProps {
  player: TablePlayer;
  region: SeatRegion;
  style: CSSProperties;
  onToggleInHand: () => void;
  onPassEnrollment?: () => void;
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

export function Seat({ player, region, style, onToggleInHand, onPassEnrollment, onTrickDelta, onReaction }: SeatProps) {
  const [avatarPeek, setAvatarPeek] = useState(false);
  const toggleAvatarPeek = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) {
      setAvatarPeek((open) => !open);
    }
  }, []);

  const trickCount = player.tricksThisHand;
  const cardsHeld = Math.max(0, player.holeCardCount ?? 0);
  const showHoleCards = Boolean(player.showHoleCards && !player.isSelf && player.inHand && cardsHeld > 0);
  const showBankroll = player.bankroll != null;
  const bourrePulse = player.bourreAlert === "pulse";
  const bourreMarker = player.bourreAlert === "marker" || player.bourreAlert === "pulse";
  const bourrePressure = Boolean(player.bourrePressure);
  const bourrePressureSelf = bourrePressure && player.isSelf;

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
        player.isOut ? "bseat--out" : "",
        player.isDealer ? "bseat--dealer" : "",
        player.trumpMerging ? "bseat--trump-merge" : "",
        player.isOnTurn ? "bseat--on-turn" : "",
        player.turnHandoff ? "bseat--turn-handoff" : "",
        player.isTrickCapture ? "bseat--trick-capture" : "",
        player.winnerFlash ? "bseat--winner-flash" : "",
        player.enrollmentPulse === "join" ? "bseat--enroll-join" : "",
        player.enrollmentPulse === "pass" ? "bseat--enroll-pass" : "",
        player.drawAnimSubPhase === "discard" ? "bseat--draw-discard" : "",
        player.drawAnimSubPhase === "receive" ? "bseat--draw-receive" : "",
        bourrePulse ? "bseat--bourre-pulse" : "",
        bourreMarker ? "bseat--bourre" : "",
        bourrePressure ? "bseat--bourre-pressure" : "",
        bourrePressureSelf ? "bseat--bourre-pressure-self" : "",
        player.bankrollTick === "up" ? "bseat--bankroll-up" : "",
        player.bankrollTick === "down" ? "bseat--bankroll-down" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <div className="bseat__core">
        {showHoleCards && (
          <div
            className="bseat__hole-cards"
            aria-label={`${cardsHeld} cards in hand`}
            data-trick-play-origin={player.playerId}
          >
            {Array.from({ length: cardsHeld }, (_, i) => (
              <div key={i} className="bseat__hole-card" style={{ ["--hole-i" as string]: i }}>
                <PlayingCard faceDown size="xs" />
              </div>
            ))}
          </div>
        )}

        <div className="bseat__avatar-stage">
          <div
            className="bseat__avatar-stack"
            data-trick-play-origin={
              !player.isSelf && player.inHand && !showHoleCards ? player.playerId : undefined
            }
          >
            {player.enrollmentOnClock && player.enrollmentTimeLeft != null && (
              <EnrollmentTimerRing fraction={player.enrollmentTimeLeft} />
            )}
            {bourrePressure && (
              <span
                className="bseat__bourre-pressure-badge"
                aria-label={bourrePressureSelf ? "You need this trick to avoid bourré" : "At risk of bourré"}
                title={bourrePressureSelf ? "Win this trick or go bourré" : "Must win this trick"}
              >
                {bourrePressureSelf ? "Bourré risk!" : "0 tricks"}
              </span>
            )}
            {bourreMarker && !bourrePressure && (
              <span className="bseat__bourre-badge" aria-label="Bourré" title="Bourré">
                Bourré
              </span>
            )}
            <div
              className={`bseat__avatar-wrap${avatarPeek ? " bseat__avatar-wrap--peek" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`${player.displayName} seat`}
              aria-expanded={avatarPeek}
              onClick={(e) => {
                e.stopPropagation();
                toggleAvatarPeek();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleAvatarPeek();
                }
              }}
              onBlur={() => setAvatarPeek(false)}
            >
              {player.isDealer && (
                <span
                  className={`bseat__dealer${player.dealerMoved ? " bseat__dealer--moved" : ""}`}
                >
                  D
                </span>
              )}
              {player.photoURL ? (
                <img className="bseat__avatar" src={player.photoURL} alt="" />
              ) : (
                <span className="bseat__avatar bseat__avatar--initials" aria-hidden="true">
                  {initials(player.displayName)}
                </span>
              )}
              {player.inHand && <span className="bseat__in-badge" title="In this hand" />}
              {bourrePressure && (
                <span className="bseat__bourre-pressure-ring" aria-hidden="true" />
              )}
              {bourrePulse && !bourrePressure && (
                <span className="bseat__bourre-ring" aria-hidden="true" />
              )}
            </div>
          </div>
          {showBankroll && (
            <span
              className={`bseat__stack${player.isOut ? " bseat__stack--out" : ""}`}
              aria-label={`Chips ${formatBankroll(player.bankroll ?? 0)}`}
              title={`Chips ${formatBankroll(player.bankroll ?? 0)}`}
            >
              {formatBankroll(player.bankroll ?? 0)}
            </span>
          )}
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
          {player.isOut && (
            <span className="bseat__out-tag muted small">Out</span>
          )}
          {player.enrollmentSatOut && !player.isOut && (
            <span className="bseat__enroll-tag muted small">Sat out</span>
          )}
          {player.enrollmentJoined && !player.inHand && !player.isOut && (
            <span className="bseat__enroll-tag muted small">Joined</span>
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
          <button
            type="button"
            className="bseat__opt-in btn btn--sm"
            data-testid="seat-opt-in"
            onClick={onToggleInHand}
          >
            I&apos;m in
          </button>
        )}

        {player.canPassEnrollment && onPassEnrollment && (
          <button
            type="button"
            className="bseat__pass btn btn--sm btn--ghost"
            data-testid="seat-pass-enrollment"
            onClick={onPassEnrollment}
          >
            Pass
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
