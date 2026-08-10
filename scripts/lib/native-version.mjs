/**
 * Native store version helpers — package.json N.NN.NN is the human-readable source.
 * Build numbers are monotonic integers derived from semver segments (store-safe).
 */

/** @param {string} version */
export function appVersionToBuildNumber(version) {
  const match = /^(\d+)\.(\d{2})\.(\d{2})$/.exec(version);
  if (!match) {
    throw new Error(`Native build number requires N.NN.NN, got: ${version}`);
  }
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (major > 210000 || minor > 99 || patch > 99) {
    throw new Error(`Native build number out of range for version: ${version}`);
  }
  return major * 10000 + minor * 100 + patch;
}

/**
 * @param {string} gradleText
 * @returns {{ versionCode: number, versionName: string } | null}
 */
export function parseAndroidGradleVersions(gradleText) {
  const versionCodeMatch = /versionCode\s+(\d+)/.exec(gradleText);
  const versionNameMatch = /versionName\s+"([^"]+)"/.exec(gradleText);
  if (!versionCodeMatch || !versionNameMatch) return null;
  return {
    versionCode: Number(versionCodeMatch[1]),
    versionName: versionNameMatch[1],
  };
}

/**
 * @param {string} gradleText
 * @param {{ versionCode: number, versionName: string }} versions
 */
export function applyAndroidGradleVersions(gradleText, versions) {
  let next = gradleText.replace(/versionCode\s+\d+/, `versionCode ${versions.versionCode}`);
  next = next.replace(/versionName\s+"[^"]*"/, `versionName "${versions.versionName}"`);
  return next;
}

/**
 * @param {string} pbxText
 * @returns {{ marketingVersion: string, projectVersion: string } | null}
 */
export function parseIosPbxVersions(pbxText) {
  const marketing = [...pbxText.matchAll(/MARKETING_VERSION = ([^;]+);/g)].map((m) => m[1].trim());
  const project = [...pbxText.matchAll(/CURRENT_PROJECT_VERSION = ([^;]+);/g)].map((m) => m[1].trim());
  if (marketing.length === 0 || project.length === 0) return null;
  const marketingSet = new Set(marketing);
  const projectSet = new Set(project);
  if (marketingSet.size !== 1 || projectSet.size !== 1) return null;
  return {
    marketingVersion: marketing[0],
    projectVersion: project[0],
  };
}

/**
 * @param {string} pbxText
 * @param {{ marketingVersion: string, projectVersion: string }} versions
 */
export function applyIosPbxVersions(pbxText, versions) {
  return pbxText
    .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${versions.marketingVersion};`)
    .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${versions.projectVersion};`);
}

/**
 * @param {string} packageVersion
 * @returns {{ versionName: string, versionCode: number, marketingVersion: string, projectVersion: string }}
 */
export function nativeVersionsFromPackage(packageVersion) {
  const versionCode = appVersionToBuildNumber(packageVersion);
  return {
    versionName: packageVersion,
    versionCode,
    marketingVersion: packageVersion,
    projectVersion: String(versionCode),
  };
}
