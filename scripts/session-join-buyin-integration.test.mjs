import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  runV1JoinBuyIn,
  applyBuyInToBaseline,
  baselineFromSessionDoc,
  initialSessionBaseline,
  buildSessionChipSnapshot,
  assertTableChipInvariant,
} from "../docs/money-persistence.js";
import { resolveSessionBuyIn } from "../docs/money-engine.js";

const BUY_IN = 100;
const ANTE = 20;

describe("session join buy-in resolution and ledger", () => {
  it("resolveSessionBuyIn prefers session buy-in, then room settings, then canonical fallback", () => {
    assert.equal(
      resolveSessionBuyIn({ buyInAmount: BUY_IN, handStake: ANTE }, { buyInAmount: 50 }),
      BUY_IN,
    );
    assert.equal(
      resolveSessionBuyIn({ handStake: ANTE }, { buyInAmount: BUY_IN, anteAmount: ANTE }),
      BUY_IN,
    );
    assert.equal(resolveSessionBuyIn({ handStake: ANTE }, { anteAmount: ANTE }), ANTE);
  });

  it("mid-session join emits one BUY_IN_APPLIED and bumps tableStartingTotal; retry is idempotent", () => {
    const sessionId = "join_sess";
    const hostId = "host";
    const joinId = "joiner";
    const existingEvents = [];
    const baseline = initialSessionBaseline(1, BUY_IN);
    const ledger = {
      version: "v1",
      buyInFallback: BUY_IN,
      bankrolls: { [hostId]: BUY_IN },
      nets: {},
      carryOverPot: 0,
      postedAntes: {},
      scoreFlags: {},
      sequence: 0,
    };

    const join1 = runV1JoinBuyIn({
      sessionId,
      playerId: joinId,
      buyInAmount: BUY_IN,
      existingEvents,
      ledger,
    });
    assert.equal(join1.newEvents.length, 1);
    assert.equal(join1.newEvents[0].type, "BUY_IN_APPLIED");
    assert.equal(join1.newEvents[0].playerId, joinId);
    assert.equal(join1.newEvents[0].amount, BUY_IN);
    assert.equal(join1.newBankrolls[joinId], BUY_IN);

    const join2 = runV1JoinBuyIn({
      sessionId,
      playerId: joinId,
      buyInAmount: BUY_IN,
      existingEvents: [...existingEvents, ...join1.newEvents],
      ledger: {
        ...ledger,
        bankrolls: { ...ledger.bankrolls, [joinId]: BUY_IN },
        sequence: join1.newEvents.length,
      },
    });
    assert.equal(join2.newEvents.length, 0);
    assert.equal(join2.newBankrolls[joinId], BUY_IN);

    const newBaseline = applyBuyInToBaseline(baseline, BUY_IN);
    assert.equal(newBaseline.tableStartingTotal, baseline.tableStartingTotal + BUY_IN);

    const scoreById = {
      [hostId]: { bankroll: BUY_IN },
      [joinId]: { bankroll: BUY_IN },
    };
    const snapshot = buildSessionChipSnapshot(scoreById, { carryOverPot: 0, currentHand: {} }, {
      buyInFallback: BUY_IN,
      playerIds: [hostId, joinId],
    });
    const invariant = assertTableChipInvariant(
      snapshot,
      baselineFromSessionDoc(newBaseline, join1.newEvents),
      { roomId: "room", sessionId, label: "after-join" },
    );
    assert.equal(invariant.ok, true);
    assert.equal(invariant.actual, invariant.expected);
  });
});
