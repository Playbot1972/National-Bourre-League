import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  isPublicTableWatchOnly,
  isPublicTableSpectator,
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
});

describe("watch-only UI wiring", () => {
  it("TableSessionView passes watchOnly into turn countdown and timer warning hooks", () => {
    const src = readFileSync(join(root, "src/table/TableSessionView.tsx"), "utf8");
    assert.match(src, /useTurnCountdown\(\{[\s\S]*watchOnly/);
    assert.match(src, /useTurnTimerWarning\(\{[\s\S]*watchOnly/);
    assert.match(src, /!watchOnly &&[\s\S]*showTurn/);
  });

  it("CardTable suppresses seat turn urgency when watchOnly", () => {
    const src = readFileSync(join(root, "src/table/CardTable.tsx"), "utf8");
    assert.match(src, /suppressTurnUrgency = suppressTurn \|\| watchOnly/);
    assert.match(src, /isOnTurn: suppressTurnUrgency/);
  });
});
