import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isPublicTableWatchOnly,
  isPublicTableSpectator,
  spectatorCanJoinNextDeal,
} from "../../docs/public-table-spectator.js";
import { resolveTableActiveActorId } from "./turnCountdown";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("watch-only presentation gating", () => {
  it("watch-only spectator state is independent of turn actor resolution inputs", () => {
    const session = {
      publicTable: true,
      pendingJoins: {
        guest: { status: "spectating", joinId: "j1", queuedAtHandCount: 1 },
      },
      currentHand: {
        phase: "play",
        turnPlayerId: "bot_fill",
        participantIds: ["host", "bot_fill"],
      },
    };
    assert.equal(isPublicTableWatchOnly(session, "guest", { scorePlayerIds: [] }), true);
    assert.equal(
      resolveTableActiveActorId({
        session: {
          phase: "play",
          turnPlayerId: "bot_fill",
          participantIds: ["host", "bot_fill"],
          tricksByPlayer: {},
          handNumber: 2,
        },
        suppressTurn: false,
        handComplete: false,
        watchOnly: true,
      }),
      null,
    );
  });

  it("seated promotion clears watch-only without affecting turn urgency for participants", () => {
    const session = {
      publicTable: true,
      pendingJoins: {
        guest: { status: "seated", joinId: "j1", queuedAtHandCount: 1 },
      },
    };
    assert.equal(isPublicTableWatchOnly(session, "guest", { scorePlayerIds: ["guest"] }), false);
    assert.equal(isPublicTableSpectator(session, "guest", { hasScoreRow: true }), false);
    assert.equal(
      resolveTableActiveActorId({
        session: {
          phase: "play",
          turnPlayerId: "guest",
          participantIds: ["host", "guest"],
          tricksByPlayer: {},
          handNumber: 2,
        },
        suppressTurn: false,
        handComplete: false,
        watchOnly: false,
      }),
      "guest",
    );
  });

  it("spectator promotion eligibility requires a replaceable fill bot", () => {
    const session = {
      publicTable: true,
      players: [
        { playerId: "host", displayName: "Host" },
        { playerId: "bot_fill", displayName: "Bot" },
      ],
    };
    const scoresWithFill = [
      { playerId: "host", bankroll: 1000 },
      { playerId: "bot_fill", bankroll: 1000, botRole: "fill" },
    ];
    const scoresWithoutFill = [{ playerId: "host", bankroll: 1000 }];
    assert.equal(spectatorCanJoinNextDeal(session, scoresWithFill), true);
    assert.equal(spectatorCanJoinNextDeal(session, scoresWithoutFill), false);
  });
});

describe("watch-only UI wiring", () => {
  it("useTurnTimerWarning arms audio only for the local player's turn", () => {
    const src = readFileSync(join(root, "src/table/hooks/useTurnTimerWarning.ts"), "utf8");
    assert.match(src, /isLocalTurn/);
    assert.match(src, /activeActorId === currentUserId/);
    assert.match(src, /if \(!isLocalTurn\)/);
    assert.match(src, /\[timer\] arming for hero turn/);
  });

  it("TableSessionView passes watchOnly into turn countdown and timer warning hooks", () => {
    const src = readFileSync(join(root, "src/table/TableSessionView.tsx"), "utf8");
    assert.match(src, /useTurnCountdown\(\{[\s\S]*watchOnly/);
    assert.match(src, /useTurnTimerWarning\(\{[\s\S]*watchOnly/);
    assert.match(src, /ENABLE_TURN_TOASTS &&[\s\S]*!watchOnly &&[\s\S]*showTurn/);
  });

  it("CardTable suppresses seat turn urgency when watchOnly", () => {
    const src = readFileSync(join(root, "src/table/CardTable.tsx"), "utf8");
    assert.match(src, /suppressTurnUrgency = suppressTurn \|\| watchOnly/);
    assert.match(src, /isOnTurn: suppressTurnUrgency/);
  });

  it("CardTable enables bot draw presentation classes during drawPlayer", () => {
    const cardTable = readFileSync(join(root, "src/table/CardTable.tsx"), "utf8");
    const mobileTable = readFileSync(join(root, "src/table/MobileCardTable.tsx"), "utf8");
    assert.match(cardTable, /drawAnimSubPhase: drawingNow \? handPresentation\.drawAnimSubPhase/);
    assert.match(mobileTable, /drawAnimSubPhase: drawingNow \? handPresentation\.drawAnimSubPhase/);
    assert.doesNotMatch(cardTable, /drawingNow && player\.isSelf \? handPresentation\.drawAnimSubPhase/);
  });

  it("Seat shows bot fold badge on enrollment pass pulse", () => {
    const seat = readFileSync(join(root, "src/table/Seat.tsx"), "utf8");
    assert.match(seat, /bseat--bot-fold-visual/);
    assert.match(seat, /seat-bot-fold-badge/);
  });

  it("CardTable applies spectator layout class and passes watchOnly to seat layout", () => {
    const cardTable = readFileSync(join(root, "src/table/CardTable.tsx"), "utf8");
    const mobileTable = readFileSync(join(root, "src/table/MobileCardTable.tsx"), "utf8");
    const seatLayout = readFileSync(join(root, "src/table/layout/seatLayout.ts"), "utf8");
    assert.match(cardTable, /btable-wrap--spectator/);
    assert.match(cardTable, /spectatorView: watchOnly/);
    assert.match(mobileTable, /btable-wrap--spectator/);
    assert.match(mobileTable, /watchOnly,\s*\)/);
    assert.match(seatLayout, /applySpectatorSeatLayoutGuard/);
    assert.doesNotMatch(cardTable, /table-center-cluster[\s\S]*Seat/);
  });
});
