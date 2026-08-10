import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { nativeVersionsFromPackage } from "./lib/native-version.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const expected = nativeVersionsFromPackage(pkg.version);
const pbx = readFileSync(join(root, "ios/App/App.xcodeproj/project.pbxproj"), "utf8");
const infoPlist = readFileSync(join(root, "ios/App/App/Info.plist"), "utf8");
const androidGradle = readFileSync(join(root, "android/app/build.gradle"), "utf8");

test("Info.plist binds bundle version strings to Xcode build settings", () => {
  assert.match(infoPlist, /<key>CFBundleShortVersionString<\/key>\s*<string>\$\(MARKETING_VERSION\)<\/string>/);
  assert.match(infoPlist, /<key>CFBundleVersion<\/key>\s*<string>\$\(CURRENT_PROJECT_VERSION\)<\/string>/);
});

test("iOS MARKETING_VERSION matches package.json and CURRENT_PROJECT_VERSION is monotonic build", () => {
  const marketing = [...pbx.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((m) => m[1].trim());
  const builds = [...pbx.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)].map((m) => m[1].trim());
  assert.equal(marketing.length, 2, "Debug + Release app configurations");
  assert.equal(builds.length, 2, "Debug + Release app configurations");
  assert.equal(new Set(marketing).size, 1);
  assert.equal(new Set(builds).size, 1);
  assert.equal(marketing[0], expected.marketingVersion);
  assert.equal(builds[0], expected.projectVersion);
});

test("Android versionName/versionCode match package.json native sync", () => {
  assert.match(androidGradle, new RegExp(`versionCode ${expected.versionCode}`));
  assert.match(androidGradle, new RegExp(`versionName "${expected.versionName.replace(/\./g, "\\.")}"`));
});
