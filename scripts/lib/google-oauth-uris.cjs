/**
 * OAuth JavaScript origins + redirect URIs for Firebase Google sign-in.
 */

function normalizeDomain(domain) {
  return domain.replace(/^www\./, "").toLowerCase();
}

function buildGoogleOAuthUris(projectId, domain = "booray.win") {
  const apex = normalizeDomain(domain);
  const hosts = [`https://${apex}`, `https://www.${apex}`];
  const firebaseHosts = [
    `https://${projectId}.firebaseapp.com`,
    `https://${projectId}.web.app`,
  ];

  const javascriptOrigins = [...new Set([...hosts, ...firebaseHosts])].sort();

  const redirectUris = [
    ...hosts.map((h) => `${h}/__/auth/handler`),
    ...firebaseHosts.map((h) => `${h}/__/auth/handler`),
  ].sort();

  return { apex, javascriptOrigins, redirectUris };
}

function firebaseGoogleProviderUrl(projectId) {
  return `https://console.firebase.google.com/project/${projectId}/authentication/providers/google`;
}

function gcpCredentialsUrl(projectId) {
  return `https://console.cloud.google.com/apis/credentials?project=${projectId}`;
}

function gcpOAuthClientUrl(projectId, clientId) {
  if (!clientId) return gcpCredentialsUrl(projectId);
  return `https://console.cloud.google.com/apis/credentials/oauthclient/${encodeURIComponent(clientId)}?project=${projectId}`;
}

module.exports = {
  buildGoogleOAuthUris,
  firebaseGoogleProviderUrl,
  gcpCredentialsUrl,
  gcpOAuthClientUrl,
};
