import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { scrubInternalActionMessage } from "./actionErrorCopy.ts";

describe("actionErrorCopy", () => {
  it("scrubs raw INTERNAL", () => {
    assert.match(
      scrubInternalActionMessage("INTERNAL") ?? "",
      /server could not finish/,
    );
  });
});
