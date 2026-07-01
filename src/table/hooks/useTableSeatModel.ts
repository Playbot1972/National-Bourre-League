import { useMemo, type CSSProperties } from "react";
import { useExternalStoreSelector } from "./useExternalStoreSelector";
import {
  getTrickPresentationSnapshot,
  subscribeTrickPresentation,
} from "../trickPresentationStore";
import {
  selectTrickSeatOverlay,
  trickSeatOverlayEqual,
} from "../trickPresentationSelectors";
import {
  CARD_LAND_MS,
  NEXT_LEAD_GAP_MS,
  POST_TRICK_READ_MS,
  TRICK_CARD_SETTLE_MS,
  TRICK_CARD_SHIFT_MS,
  TRICK_CARD_TRAVEL_MS,
  TRICK_RAKE_MS,
  TRICK_SWEEP_MS,
  WINNER_HIGHLIGHT_MS,
} from "../trickTiming";
import { handTimingScale } from "../handPresentationTiming";
import { orderPlayersForTable } from "../layout/seatOrder";
import { mobileTableAspect, type MobileOrientation } from "../layout/mobileSeatMap";
import { displayLiveBankroll, isPlayerAtBourreRisk, tableAspectForPlayers } from "../logic";
import { resolveSeatTrumpDisplay } from "../trumpHolderPresentation";
import type { HandPresentation } from "./useHandPresentation";
import type { TableMicrointeractions } from "./useTableMicrointeractions";
import type { TrumpHolderPresentation } from "../trumpHolderPresentation";
import type { PotMetrics, TablePlayer, TableSessionData } from "../types";

export interface UseTableSeatModelInput {
  session: TableSessionData;
  players: TablePlayer[];
  currentUserId?: string | null;
  potMetrics: PotMetrics;
  handPresentation: HandPresentation;
  microinteractions: TableMicrointeractions;
  trumpHolderPresentation: TrumpHolderPresentation;
  /** When set, uses mobile felt aspect instead of desktop table aspect. */
  mobileOrientation?: MobileOrientation | null;
}

export function useTableSeatModel({
  session,
  players,
  currentUserId = null,
  potMetrics,
  handPresentation,
  microinteractions,
  trumpHolderPresentation,
  mobileOrientation = null,
}: UseTableSeatModelInput) {
  const trickSeat = useExternalStoreSelector(
    subscribeTrickPresentation,
    getTrickPresentationSnapshot,
    selectTrickSeatOverlay,
    trickSeatOverlayEqual,
  );
  const feltPlayers = useMemo(
    () =>
      players.map((player) => ({
        ...player,
        isSelf: player.isSelf || (currentUserId != null && player.playerId === currentUserId),
      })),
    [players, currentUserId],
  );

  const rotated = useMemo(
    () => orderPlayersForTable(feltPlayers, session, currentUserId),
    [feltPlayers, session, currentUserId],
  );

  const playerCount = rotated.length;
  const opponents = useMemo(() => rotated.filter((p) => !p.isSelf), [rotated]);
  const countClass = `btable--p${Math.min(8, Math.max(2, playerCount))}`;
  const tableAspect =
    mobileOrientation != null
      ? mobileTableAspect(opponents.length, mobileOrientation)
      : tableAspectForPlayers(playerCount);
  const handTiming = handTimingScale();

  const playerNames = useMemo(
    () => Object.fromEntries(feltPlayers.map((p) => [p.playerId, p.displayName])),
    [feltPlayers],
  );

  const bourreRiskIds = useMemo(
    () =>
      new Set(
        session.participantIds.filter((pid) =>
          isPlayerAtBourreRisk(
            pid,
            trickSeat.displayTricksByPlayer,
            session.participantIds,
            session.phase,
          ),
        ),
      ),
    [session.participantIds, session.phase, trickSeat.displayTricksByPlayer],
  );

  const suppressTurn = Boolean(
    trickSeat.suppressTurnPlayerId || handPresentation.suppressTurnIndicator,
  );

  const displayPlayersById = useMemo(() => {
    const map = new Map<string, TablePlayer>();
    for (const player of feltPlayers) {
      const tricksThisHand = trickSeat.displayTricksByPlayer[player.playerId] ?? 0;
      const trickWinnerSeat = trickSeat.trickWinnerSeatId === player.playerId;
      const capturingTrick = trickSeat.phase === "collectTrick" && trickWinnerSeat;
      const enrollmentPulse = handPresentation.enrollmentPulse[player.playerId];
      const drawingNow = handPresentation.animatingDrawPlayerId === player.playerId;
      const seatTrump = resolveSeatTrumpDisplay(
        player.playerId,
        trumpHolderPresentation,
        session.trumpUpcard ?? null,
        player.holeCardCount ?? 0,
        player.isSelf,
      );
      map.set(player.playerId, {
        ...player,
        ...seatTrump,
        bankroll: displayLiveBankroll(player.bankroll, potMetrics.anteAmount, {
          inHand: player.inHand,
          anteAnimActive: handPresentation.anteAnimActive,
          anteAlreadyPosted:
            session.postedAntes != null &&
            Object.prototype.hasOwnProperty.call(session.postedAntes, player.playerId),
        }),
        tricksThisHand,
        isOnTurn: suppressTurn ? false : player.isOnTurn,
        isActiveActor: suppressTurn ? false : player.isActiveActor,
        isLeading:
          trickWinnerSeat &&
          (trickSeat.phase === "winnerReveal" || trickSeat.phase === "collectTrick")
            ? true
            : suppressTurn
              ? false
              : player.isLeading,
        isTrickCapture: capturingTrick,
        enrollmentPulse,
        drawAnimSubPhase:
          drawingNow && player.isSelf ? handPresentation.drawAnimSubPhase : null,
        drawDiscardCount: drawingNow ? handPresentation.drawDiscardCount : 0,
        drawReplaceCount: drawingNow ? handPresentation.drawReplaceCount : 0,
        turnHandoff: false,
        dealerMoved: microinteractions.dealerMovedPlayerId === player.playerId,
        winnerFlash: microinteractions.winnerFlashPlayerId === player.playerId,
        bankrollTick: microinteractions.bankrollTicks[player.playerId] ?? null,
        bourreAlert: player.isSelf
          ? (microinteractions.bourreAlerts[player.playerId] ?? null)
          : null,
        bourrePressure: bourreRiskIds.has(player.playerId),
      });
    }
    return map;
  }, [
    feltPlayers,
    trickSeat.displayTricksByPlayer,
    trickSeat.trickWinnerSeatId,
    trickSeat.phase,
    handPresentation.enrollmentPulse,
    handPresentation.animatingDrawPlayerId,
    handPresentation.drawAnimSubPhase,
    handPresentation.drawDiscardCount,
    handPresentation.drawReplaceCount,
    handPresentation.anteAnimActive,
    trumpHolderPresentation,
    session.trumpUpcard,
    session.postedAntes,
    potMetrics.anteAmount,
    suppressTurn,
    microinteractions.dealerMovedPlayerId,
    microinteractions.winnerFlashPlayerId,
    microinteractions.bankrollTicks,
    microinteractions.bourreAlerts,
    bourreRiskIds,
  ]);

  const selfPlayer = useMemo(
    () => feltPlayers.find((p) => p.isSelf),
    [feltPlayers],
  );

  const drawCompleted = useMemo(
    () =>
      Boolean(currentUserId && session.drawCompletedIds?.includes(currentUserId)),
    [currentUserId, session.drawCompletedIds],
  );

  const hasActiveTurn = useMemo(
    () => [...displayPlayersById.values()].some((p) => p.isActiveActor),
    [displayPlayersById],
  );

  const potMetricsForCenter = useMemo(
    () => ({
      ...potMetrics,
      currentPot: handPresentation.displayPotAmount,
    }),
    [potMetrics, handPresentation.displayPotAmount],
  );

  const wrapStyle = useMemo(
    () =>
      ({
        ["--player-count" as string]: playerCount,
        ["--table-aspect" as string]: tableAspect,
        ["--trick-card-travel-ms" as string]: `${TRICK_CARD_TRAVEL_MS}ms`,
        ["--trick-card-settle-ms" as string]: `${TRICK_CARD_SETTLE_MS}ms`,
        ["--trick-card-shift-ms" as string]: `${TRICK_CARD_SHIFT_MS}ms`,
        ["--trick-card-land-ms" as string]: `${CARD_LAND_MS}ms`,
        ["--trick-winner-highlight-ms" as string]: `${WINNER_HIGHLIGHT_MS}ms`,
        ["--trick-sweep-ms" as string]: `${TRICK_SWEEP_MS}ms`,
        ["--trick-rake-ms" as string]: `${TRICK_RAKE_MS}ms`,
        ["--trick-post-read-ms" as string]: `${POST_TRICK_READ_MS}ms`,
        ["--trick-next-lead-gap-ms" as string]: `${NEXT_LEAD_GAP_MS}ms`,
        ["--trick-final-pipeline-ms" as string]: `${POST_TRICK_READ_MS + WINNER_HIGHLIGHT_MS + TRICK_SWEEP_MS + NEXT_LEAD_GAP_MS}ms`,
        ["--deal-card-stagger-ms" as string]: `${handTiming.dealCardStaggerMs}ms`,
        ["--draw-discard-ms" as string]: `${handTiming.drawDiscardMs}ms`,
        ["--draw-replace-ms" as string]: `${handTiming.drawReplaceMs}ms`,
      }) as CSSProperties,
    [
      playerCount,
      tableAspect,
      handTiming.dealCardStaggerMs,
      handTiming.drawDiscardMs,
      handTiming.drawReplaceMs,
    ],
  );

  return {
    feltPlayers,
    rotated,
    opponents,
    playerCount,
    countClass,
    tableAspect,
    handTiming,
    playerNames,
    displayPlayersById,
    selfPlayer,
    suppressTurn,
    drawCompleted,
    hasActiveTurn,
    potMetricsForCenter,
    wrapStyle,
  };
}
