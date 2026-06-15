import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveTrickWinner } from "./trick";
import type { Card } from "../types";

const c = (rank: string, suit: string): Card =>
  ({ rank, suit }) as Card;

describe("trick winner resolution", () => {
  it("highest led suit wins when no trump played", () => {
    const winner = resolveTrickWinner(
      [
        { playerId: "p1", card: c("5", "clubs") },
        { playerId: "p2", card: c("K", "clubs") },
        { playerId: "p3", card: c("2", "clubs") },
      ],
      "clubs",
      "hearts",
    );
    assert.equal(winner, "p2");
  });

  it("highest trump wins when trump is played", () => {
    const winner = resolveTrickWinner(
      [
        { playerId: "p1", card: c("A", "clubs") },
        { playerId: "p2", card: c("5", "hearts") },
        { playerId: "p3", card: c("K", "hearts") },
      ],
      "clubs",
      "hearts",
    );
    assert.equal(winner, "p3");
  });

  it("trump beats led suit", () => {
    const winner = resolveTrickWinner(
      [
        { playerId: "p1", card: c("2", "hearts") },
        { playerId: "p2", card: c("A", "clubs") },
      ],
      "clubs",
      "hearts",
    );
    assert.equal(winner, "p1");
  });
});
