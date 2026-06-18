/** @param {string} current */
export function nextAppVersion(current) {
  const match = /^(\d+)\.(\d{2})\.(\d{2})$/.exec(current);
  if (!match) {
    throw new Error(`Version format expected N.NN.NN, got: ${current}`);
  }
  let major = Number(match[1]);
  let minor = Number(match[2]);
  let patch = Number(match[3]) + 1;
  if (patch > 99) {
    patch = 0;
    minor += 1;
  }
  if (minor > 99) {
    minor = 0;
    major += 1;
  }
  return `${major}.${String(minor).padStart(2, "0")}.${String(patch).padStart(2, "0")}`;
}

/** @param {string} version */
export function isAppVersion(version) {
  return /^\d+\.\d{2}\.\d{2}$/.test(version);
}

/**
 * @param {string} version
 * @param {string} buildId
 * @param {"dev"|"production"} channel
 */
export function formatVersionLabel(version, buildId, channel) {
  const base = `v${version}+${buildId}`;
  return channel === "dev" ? `${base} dev` : base;
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
export function compareAppVersion(a, b) {
  const pa = parseAppVersion(a);
  const pb = parseAppVersion(b);
  if (!pa || !pb) return 0;
  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  return pa.patch - pb.patch;
}

/** @param {string} version */
export function parseAppVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}
