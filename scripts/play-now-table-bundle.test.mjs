import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tableSessionJs = readFileSync(join(root, "docs/table-session.js"), "utf8");

describe("Play Now table bundle integrity", () => {
  it("ships FeedbackSettings in table-session.js (TableSessionView footer)", () => {
    assert.match(tableSessionJs, /#region src\/table\/FeedbackSettings\.tsx/);
    assert.doesNotMatch(
      tableSessionJs,
      /\(0,\s*\w+\.jsx\)\(FeedbackSettings,/,
      "FeedbackSettings JSX must not reference an undefined global",
    );
    const regionStart = tableSessionJs.indexOf("#region src/table/FeedbackSettings.tsx");
    assert.ok(regionStart >= 0, "FeedbackSettings source region missing from bundle");
    const regionBody = tableSessionJs.slice(regionStart, regionStart + 4000);
    assert.match(regionBody, /function\s+\w+\(/, "FeedbackSettings component must be defined in bundle");
  });
});
