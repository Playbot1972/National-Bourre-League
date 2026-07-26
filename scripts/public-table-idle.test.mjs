import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  publicTableHeroIdleBanner,
  publicTableIdleSeatLabel,
  publicTableIdleSeatStatus,
} from "../docs/public-table-idle.js";

describe("public-table idle UI helpers", () => {
  it('shows "Sitting Out" for idle sit-out score rows', () => {
    assert.equal(publicTableIdleSeatStatus({ sitOut: true }), "sitting_out");
    assert.equal(publicTableIdleSeatLabel({ sitOut: true }), "Sitting Out");
  });

  it('shows "Removed – Seat Open" for removed rows', () => {
    assert.equal(publicTableIdleSeatStatus({ idleRemovedAt: new Date() }), "removed");
    assert.equal(publicTableIdleSeatLabel({ idleRemovedAt: new Date() }), "Removed – Seat Open");
  });

  it("hero banner prompts rejoin after removal", () => {
    const session = { publicTable: true };
    assert.match(
      publicTableHeroIdleBanner(session, "u1", { idleRemovedAt: new Date() }) ?? "",
      /Play Now/i,
    );
  });

  it("hero banner explains sit-out recovery before removal", () => {
    const session = { publicTable: true };
    assert.match(
      publicTableHeroIdleBanner(session, "u1", { sitOut: true }) ?? "",
      /Sitting out/i,
    );
  });
});
