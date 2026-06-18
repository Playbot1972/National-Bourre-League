import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatInviteCodeDisplay,
  isValidInviteCodeFormat,
  normalizeInviteCode,
} from "../docs/invite-code.js";

describe("invite code normalization", () => {
  it("accepts ABC-D23 and ABCD23", () => {
    assert.equal(normalizeInviteCode("abc-d23"), "ABC-D23");
    assert.equal(normalizeInviteCode("abcd23"), "ABC-D23");
    assert.ok(isValidInviteCodeFormat("abcd23"));
  });

  it("strips spaces and unicode dashes", () => {
    assert.equal(normalizeInviteCode(" abc – d23 "), "ABC-D23");
    assert.equal(normalizeInviteCode("ABC\u2013D23"), "ABC-D23");
  });

  it("rejects too-short codes", () => {
    assert.equal(isValidInviteCodeFormat("AB-12"), false);
    assert.equal(isValidInviteCodeFormat(""), false);
  });

  it("formats display from messy input", () => {
    assert.equal(formatInviteCodeDisplay("  abcd23 "), "ABC-D23");
  });
});
