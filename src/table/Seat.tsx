import { memo, useCallback, useState, type CSSProperties } from "react";
import { SmartHud } from "./SmartHud";
import { formatBankroll, type SeatRegion } from "./logic";
import type { HandLane } from "./layout/seatLayout";
import { SeatAvatarIdentity } from "./SeatAvatarIdentity";
import { SeatHoleCards } from "./SeatHoleCards";
import { SeatWonTrickPile } from "./SeatWonTrickPile";
import { seatPlayerVisualEqual } from "./seatPlayerEqual";
import type { TablePlayer } from "./types";

interface SeatProps {
  player: TablePlayer;
  region: SeatRegion;
  handLane?: HandLane;
  style: CSSProperties;
  clockwiseDealing?: boolean;
  countdownPlayerId?: string | null;
  onToggleInHand: () => void;
  onPassEnrollment?: () => void;
  onTrickDelta: (delta: number) => void;
  onReaction?: (emoji: string) => void;
}

function SeatInner({
  player,
  region,
  handLane = "below",
  style,
  clockwiseDealing = false,
  countdownPlayerId = null,
  onToggleInHand,
  onPassEnrollment,
  onTrickDelta,
  onReaction,
}: SeatProps) {
  const [avatarPeek, setAvatarPeek] = useState(false);
  const toggleAvatarPeek = useCallback(() => {
    setAvatarPeek((open) => !open);
  }, []);
  const blurAvatarPeek = useCallback(() => {
    setAvatarPeek(false);
  }, []);
  const handleTrickPlus = useCallback(() => {
    onTrickDelta(1);
  }, [onTrickDelta]);

  const trickCount = player.tricksThisHand;
  const cardsHeld = Math.max(0, player.holeCardCount ?? 0);
  const showWonTrickPile = trickCount > 0;
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
        player.isActiveActor ? "bseat--active-actor" : "",
        player.isActiveActor && player.inHand ? "bseat--play-origin-active" : "",
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
        player.isActiveActor && player.inHand ? player.playerId : undefined
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
      {player.inHand && (
        <span
          className="bseat__settle-chip-anchor"
          data-settle-chip-anchor={player.playerId}
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
            {player.inHand && !player.isSelf && (
              <span
                className="bseat__seat-motion-anchor"
                data-seat-motion-anchor={player.playerId}
                aria-hidden="true"
              />
            )}
            {showWonTrickPile && (
              <SeatWonTrickPile playerId={player.playerId} trickCount={trickCount} />
            )}
            {clockwiseDealing && player.inHand && !player.isSelf && cardsHeld > 0 && (
              <div className="bseat__deal-targets" aria-hidden="true">
                {Array.from({ length: cardsHeld }, (_, i) => (
                  <span
                    key={`deal-target-${i}`}
                    className="bseat__deal-target"
                    data-deal-seat={player.playerId}
                    data-deal-round={i}
                    style={{ ["--hole-i" as string]: i }}
                  />
                ))}
              </div>
            )}
            {showHoleCards && (
              <SeatHoleCards
                playerId={player.playerId}
                cardsHeld={cardsHeld}
                revealedTrumpIndex={player.revealedTrumpIndex}
                revealedTrumpUpcard={player.revealedTrumpUpcard}
                seatTrumpMergeActive={player.seatTrumpMergeActive}
              />
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
            <SeatAvatarIdentity
              displayName={player.displayName}
              photoURL={player.photoURL}
              isDealer={player.isDealer}
              dealerMoved={player.dealerMoved}
              inHand={player.inHand}
              bourrePressure={bourrePressure}
              bourrePulse={bourrePulse}
              countdownPlayerId={countdownPlayerId}
              peek={avatarPeek}
              onTogglePeek={toggleAvatarPeek}
              onBlurPeek={blurAvatarPeek}
            />
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
        <div className="bseat__info">
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

        <div
          className="bseat__meta"
          data-testid="seat-meta-panel"
          aria-hidden={!avatarPeek}
        >
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
              onClick={handleTrickPlus}
            >
              +
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function seatPropsEqual(prev: SeatProps, next: SeatProps): boolean {
  return (
    prev.region === next.region &&
    prev.handLane === next.handLane &&
    prev.clockwiseDealing === next.clockwiseDealing &&
    prev.countdownPlayerId === next.countdownPlayerId &&
    prev.style.left === next.style.left &&
    prev.style.top === next.style.top &&
    prev.onToggleInHand === next.onToggleInHand &&
    prev.onPassEnrollment === next.onPassEnrollment &&
    prev.onTrickDelta === next.onTrickDelta &&
    prev.onReaction === next.onReaction &&
    seatPlayerVisualEqual(prev.player, next.player)
  );
}

export const Seat = memo(SeatInner, seatPropsEqual);
