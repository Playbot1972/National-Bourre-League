import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("ensureSessionPlayer score create", () => {
  it("does not set lastActivityTimestamp on score create (rules forbid public score markers)", () => {
    const src = readFileSync(join(root, "docs/firestore.js"), "utf8");
    const fnStart = src.indexOf("export async function ensureSessionPlayer");
    assert.ok(fnStart >= 0);
    const fnBody = src.slice(fnStart, fnStart + 3_500);
    assert.doesNotMatch(fnBody, /lastActivityTimestamp/);
    assert.match(fnBody, /isRobot \? \{ isRobot: true \}/);
  });
});
