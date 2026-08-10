// Stamp native store versions from package.json → android/app/build.gradle, ios/App/App.xcodeproj/project.pbxproj
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  applyAndroidGradleVersions,
  applyIosPbxVersions,
  nativeVersionsFromPackage,
} from "./lib/native-version.mjs";
import { isAppVersion } from "./lib/version-format.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const version = pkg.version;

if (!isAppVersion(version)) {
  console.warn(`sync-native-version: package.json version expected N.NN.NN, got: ${version}`);
}

const native = nativeVersionsFromPackage(version);

const androidGradlePath = join(root, "android", "app", "build.gradle");
const androidGradle = readFileSync(androidGradlePath, "utf8");
writeFileSync(
  androidGradlePath,
  applyAndroidGradleVersions(androidGradle, {
    versionCode: native.versionCode,
    versionName: native.versionName,
  }),
);

const iosPbxPath = join(root, "ios", "App", "App.xcodeproj", "project.pbxproj");
const iosPbx = readFileSync(iosPbxPath, "utf8");
writeFileSync(
  iosPbxPath,
  applyIosPbxVersions(iosPbx, {
    marketingVersion: native.marketingVersion,
    projectVersion: native.projectVersion,
  }),
);

console.log(
  `Native versions stamped: Android ${native.versionName} (${native.versionCode}), iOS ${native.marketingVersion} (${native.projectVersion})`,
);
