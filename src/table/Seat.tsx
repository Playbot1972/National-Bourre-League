import { useCallback, useState, type CSSProperties } from "react";
import { PlayingCard } from "../components/PlayingCard";
import { SmartHud } from "./SmartHud";
import { formatBankroll, initials, type SeatRegion } from "./logic";
import type { HandLane } from "./layout/seatLayout";
import type { Rank, Suit } from "../types";
import type { TablePlayer } from "./types";

interface SeatProps {
  player: TablePlayer;
  region: SeatRegion;
  handLane?: HandLane;
  style: CSSProperties;
  onToggleInHand: () => void;
  onPassEnrollment?: () => void;
  onTrickDelta: (delta: number) => void;
  onReaction?: (emoji: string) => void;
}

export function Seat({ player, region, handLane = "below", style, onToggleInHand, onPassEnrollment, onTrickDelta, onReaction }: SeatProps) {
  const [avatarPeek, setAvatarPeek] = useState(false);
  const toggleAvatarPeek = useCallback(() => {
    setAvatarPeek((open) => !open);
  }, []);

  const trickCount = player.tricksThisHand;
  const cardsHeld = Math.max(0, player.holeCardCount ?? 0);
  const showHoleCards = Boolean(player.showHoleCards && !player.isSelf && player.inHand && cardsHeld > 0);
  const showBankroll = player.bankroll != null;
  const bourrePulse = player.bourreAlert === "pulse";
  const bourreMarker = player.bourreAlert === "marker" || player.bourreAlert === "pulse";
  const bourrePressure = Boolean(player.bourrePressure);
  const bourrePressureSelf = bourrePressure && player.isSelf;
  const seatTrumpRevealed = player.revealedTrumpIndex != null && player.revealedTrumpUpcard;

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
        handLane === "side" ? "bseat--hand-side" : "bseat--hand-below",
        `player-${region}`,
        player.inHand ? "bseat--in-hand" : "",
        player.isSelf ? "bseat--self" : "",
        player.isLeading ? "bseat--leading" : "",
        player.isWinner ? "bseat--winner" : "",
        player.enrollmentSatOut ? "bseat--sat-out" : "",
        player.isOut ? "bseat--out" : "",
        player.isDealer ? "bseat--dealer" : "",
        player.trumpMerging ? "bseat--trump-merge" : "",
        player.isOnTurn ? "bseat--on-turn" : "",
        player.isOnTurn && player.inHand ? "bseat--play-origin-active" : "",
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
        seatTrumpRevealed ? "bseat--trump-reveal" : "",
        player.seatTrumpMergeActive ? "bseat--trump-merge" : "",
        avatarPeek ? "bseat--meta-open" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
      data-trick-play-origin-active={
        player.isOnTurn && player.inHand ? player.playerId : undefined
      }
    >
      {player.inHand && !player.isSelf && (
        <span
          className="bseat__play-origin"
          data-seat-play-origin={player.playerId}
          data-trick-play-origin={player.playerId}
          aria-hidden="true"
        />
      )}
      <div className="bseat__core">
        <div className="bseat__avatar-stage">
          <div
            className="bseat__avatar-stack"
            data-trick-play-origin={
              !player.isSelf && player.inHand && !showHoleCards ? player.playerId : undefined
            }
          >
            {player.inHand && (
              <span
                className={[
                  "bseat__trick-badge",
                  trickCount === 0 ? "bseat__trick-badge--zero" : "",
                  player.isWinner || player.isTrickCapture ? "bseat__trick-badge--tick" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`${trickCount} tricks won`}
                title={`${trickCount} trick${trickCount === 1 ? "" : "s"} won`}
              >
                {trickCount}
              </span>
            )}
            <div
              className="bseat__won-trick-pile"
              data-won-trick-pile-anchor={player.playerId}
              aria-hidden={trickCount <= 0}
              data-trick-count={trickCount}
            >
              {Array.from({ length: Math.min(trickCount, 5) }, (_, i) => (
                <div
                  key={i}
                  className="bseat__won-trick-pile-card"
                  style={{ ["--book-i" as string]: i }}
                >
                  <PlayingCard faceDown size="xs" />
                </div>
              ))}
            </div>
            {showHoleCards && (
              <div
                className="bseat__hole-cards bseat__hole-cards--crown"
                aria-label={`${cardsHeld} cards in hand`}
                data-trick-play-origin={player.playerId}
              >
                {Array.from({ length: cardsHeld }, (_, i) => {
                  const isTrumpSlot =
                    player.revealedTrumpIndex === i && player.revealedTrumpUpcard;
                  return (
                    <div
                      key={i}
                      className={[
                        "bseat__hole-card",
                        isTrumpSlot ? "bseat__hole-card--trump-revealed" : "",
                        isTrumpSlot && player.seatTrumpMergeActive
                          ? "bseat__hole-card--trump-merge"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={{ ["--hole-i" as string]: i }}
                    >
                      {isTrumpSlot ? (
                        <PlayingCard
                          card={{
                            rank: player.revealedTrumpUpcard!.rank as Rank,
                            suit: player.revealedTrumpUpcard!.suit as Suit,
                          }}
                          size="xs"
                          state="trump"
                        />
                      ) : (
                        <PlayingCard faceDown size="xs" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {bourrePressure && (
              <span
                className="bseat__bourre-pressure-badge"
                data-testid="bourre-pressure-badge"
                aria-label={bourrePressureSelf ? "You need this trick to avoid bourré" : "At risk of bourré"}
                title={bourrePressureSelf ? "Win this trick or go bourré" : "Must win this trick"}
              >
                {bourrePressureSelf ? "Bourré risk!" : "0 tricks"}
              </span>
            )}
            {bourreMarker && !bourrePressure && (
              <span className="bseat__bourre-badge" data-testid="bourre-marker-badge" aria-label="Bourré" title="Bourré">
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
              data-testid="seat-stack"
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
        <div
          className="bseat__meta"
          data-testid="seat-meta-panel"
          aria-hidden={!avatarPeek}
        >
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
              <span className="bseat__enroll-tag muted small">
                {player.decisionPlannedDiscards != null
                  ? `Play · draw ${player.decisionPlannedDiscards}`
                  : "Joined"}
              </span>
            )}
          </div>

          <SmartHud player={player} compact={region === "left" || region === "right"} />
        </div>

        {player.canToggleInHand && (
          <button
            type="button"
            className="bseat__opt-in btn btn--sm"
            data-testid="seat-opt-in"
            onClick={onToggleInHand}
          >
            {player.decisionPlannedDiscards != null && player.enrollmentJoined
              ? `Playing · ${player.decisionPlannedDiscards}`
              : player.canPassEnrollment
                ? "Play"
                : "I\u2019m in"}
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
