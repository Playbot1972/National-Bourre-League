import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appVersionToBuildNumber,
  applyAndroidGradleVersions,
  applyIosPbxVersions,
  nativeVersionsFromPackage,
  parseAndroidGradleVersions,
  parseIosPbxVersions,
} from "./lib/native-version.mjs";

describe("native version helpers", () => {
  it("appVersionToBuildNumber maps N.NN.NN to monotonic integer", () => {
    assert.equal(appVersionToBuildNumber("1.04.78"), 10478);
    assert.equal(appVersionToBuildNumber("1.00.99"), 10099);
    assert.equal(appVersionToBuildNumber("2.10.05"), 21005);
  });

  it("rejects invalid app versions", () => {
    assert.throws(() => appVersionToBuildNumber("1.0.78"), /N\.NN\.NN/);
  });

  it("nativeVersionsFromPackage sets marketing and build numbers", () => {
    const v = nativeVersionsFromPackage("1.04.78");
    assert.equal(v.versionName, "1.04.78");
    assert.equal(v.versionCode, 10478);
    assert.equal(v.marketingVersion, "1.04.78");
    assert.equal(v.projectVersion, "10478");
  });

  it("applyAndroidGradleVersions updates versionCode and versionName", () => {
    const input = `defaultConfig {
        versionCode 1
        versionName "1.0"
    }`;
    const out = applyAndroidGradleVersions(input, { versionCode: 10478, versionName: "1.04.78" });
    assert.match(out, /versionCode 10478/);
    assert.match(out, /versionName "1\.04\.78"/);
    const parsed = parseAndroidGradleVersions(out);
    assert.deepEqual(parsed, { versionCode: 10478, versionName: "1.04.78" });
  });

  it("applyIosPbxVersions updates marketing and project versions", () => {
    const input = `MARKETING_VERSION = 46;
CURRENT_PROJECT_VERSION = 46;
MARKETING_VERSION = 46;
CURRENT_PROJECT_VERSION = 46;`;
    const out = applyIosPbxVersions(input, {
      marketingVersion: "1.04.78",
      projectVersion: "10478",
    });
    const parsed = parseIosPbxVersions(out);
    assert.deepEqual(parsed, {
      marketingVersion: "1.04.78",
      projectVersion: "10478",
    });
  });
});
