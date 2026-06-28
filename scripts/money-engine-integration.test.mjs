import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  processHandSettlement,
  processBuyIn,
  replayEvents,
  computeFinalBankrolls,
  ledgerFromScoreById,
  sortMoneyEvents,
} from "../docs/money-engine.js";

const buyIn = 100;
const ante = 20;
const three = ["a", "b", "c"];

describe("money-engine bundle integration", () => {
  it("idempotent settlement action produces no duplicate events", () => {
    const scoreById = Object.fromEntries(three.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    const input = {
      actionId: "settle:test:1",
      handId: "1",
      mode: "win",
      winners: ["a"],
      participants: three,
      tricksByPlayer: { a: 3, b: 2, c: 0 },
      scoreById,
      sessionStake: ante,
      buyInFallback: buyIn,
    };
    const r1 = processHandSettlement(input);
    const r2 = processHandSettlement({ ...input, existingEvents: r1.newEvents });
    assert.equal(r2.newEvents.length, 0);
  });

  it("full session replay from buy-in + settlement", () => {
    const buyInEv = processBuyIn({
      actionId: "buyin",
      playerIds: three,
      buyInAmount: buyIn,
    });
    const scoreById = Object.fromEntries(three.map((pid) => [pid, { bankroll: buyIn, net: 0 }]));
    const settle = processHandSettlement({
      actionId: "settle:1",
      handId: "1",
      mode: "win",
      winners: ["a"],
      participants: three,
      tricksByPlayer: { a: 3, b: 2, c: 0 },
      scoreById,
      sessionStake: ante,
      buyInFallback: buyIn,
    });
    const events = sortMoneyEvents([...buyInEv.newEvents, ...settle.newEvents]);
    const final = computeFinalBankrolls({
      events,
      scoreById: settle.settlement.scoreById,
      buyInFallback: buyIn,
    });
    assert.equal(final.invariants.ok, true);
    assert.equal(final.bankrolls.a, settle.settlement.scoreById.a.bankroll);
  });
});
