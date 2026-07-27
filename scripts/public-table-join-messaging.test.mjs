import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  publicTableJoinStatusMessage,
  publicTableWatchOnlyBannerMessage,
} from "../docs/public-table-join.js";

describe("public-table join messaging", () => {
  it("promises next deal only when server says promotion path exists", () => {
    const withPath = publicTableJoinStatusMessage({
      status: "spectating",
      queueMode: "mixed",
      canPromoteAtNextBoundary: true,
    });
    assert.match(withPath, /you'll join the next deal/i);

    const withoutPath = publicTableJoinStatusMessage({
      status: "spectating",
      queueMode: "mixed",
      canPromoteAtNextBoundary: false,
    });
    assert.match(withoutPath, /waiting for an open seat/i);
    assert.doesNotMatch(withoutPath, /you'll join the next deal/i);
  });

  it("watch-only banner mirrors promotion eligibility", () => {
    assert.match(
      publicTableWatchOnlyBannerMessage({ mode: "mixed", canPromoteAtNextBoundary: true }),
      /you'll join the next deal/i,
    );
    assert.match(
      publicTableWatchOnlyBannerMessage({ mode: "mixed", canPromoteAtNextBoundary: false }),
      /waiting for an open seat/i,
    );
  });

  it("immediate seat messages do not use watch-only copy", () => {
    const seated = publicTableJoinStatusMessage({
      status: "seated",
      queueMode: "mixed",
      joinDisposition: "immediate_fill_bot",
    });
    assert.match(seated, /you are seated/i);
    assert.doesNotMatch(seated, /watching/i);
  });
});
