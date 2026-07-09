import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pbx = readFileSync(join(root, "ios/App/App.xcodeproj/project.pbxproj"), "utf8");
const infoPlist = readFileSync(join(root, "ios/App/App/Info.plist"), "utf8");

test("Info.plist binds bundle version strings to Xcode build settings", () => {
  assert.match(infoPlist, /<key>CFBundleShortVersionString<\/key>\s*<string>\$\(MARKETING_VERSION\)<\/string>/);
  assert.match(infoPlist, /<key>CFBundleVersion<\/key>\s*<string>\$\(CURRENT_PROJECT_VERSION\)<\/string>/);
});

test("App target MARKETING_VERSION matches CURRENT_PROJECT_VERSION", () => {
  const marketing = [...pbx.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((m) => m[1]);
  const builds = [...pbx.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)].map((m) => m[1]);
  assert.equal(marketing.length, 2, "Debug + Release app configurations");
  assert.equal(builds.length, 2, "Debug + Release app configurations");
  assert.equal(new Set(marketing).size, 1);
  assert.equal(new Set(builds).size, 1);
  assert.equal(marketing[0], builds[0]);
});
