import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { removePlayerFromEnrollment } from "../docs/enrollment-roster.js";

describe("removePlayerFromEnrollment", () => {
  it("drops removed id from rotation and enrolled lists", () => {
    const enrollment = {
      active: true,
      orderedPlayerIds: ["host", "bot_1", "guest_2"],
      currentIndex: 1,
      enrolledIds: ["host", "bot_1"],
      declinedIds: [],
    };
    const next = removePlayerFromEnrollment(
      enrollment,
      "bot_1",
      "host",
      ["guest_2", "host"],
    );
    assert.equal(next.active, true);
    assert.deepEqual(next.enrolledIds, ["host"]);
    assert.deepEqual(next.declinedIds, []);
    assert.ok(!next.orderedPlayerIds.includes("bot_1"));
  });
});
