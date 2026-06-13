/**
 * Fetch Firebase Hosting custom-domain DNS records (A, TXT, CNAME).
 */

const { Client } = require("firebase-tools/lib/apiv2");
const { hostingApiOrigin } = require("firebase-tools/lib/api");
const hostingApi = require("firebase-tools/lib/hosting/api");

function hostLabel(domainName, apex) {
  if (!domainName) return "@";
  const d = domainName.replace(/\.$/, "");
  if (d === apex || d === "@") return "@";
  if (d.endsWith(`.${apex}`)) {
    const sub = d.slice(0, -(apex.length + 1));
    return sub || "@";
  }
  return d;
}

function collectRecords(domainRecord, apex) {
  const rows = [];
  const desired = domainRecord?.requiredDnsUpdates?.desired;
  if (Array.isArray(desired)) {
    for (const set of desired) {
      for (const rec of set.records || []) {
        rows.push({
          type: (rec.type || "").toUpperCase(),
          host: hostLabel(rec.domainName, apex),
          value: rec.rdata,
        });
      }
    }
  }
  const prov = domainRecord?.provisioning;
  if (prov?.dnsUpdates?.length) {
    for (const u of prov.dnsUpdates) {
      rows.push({
        type: (u.type || u.recordType || "").toUpperCase(),
        host: hostLabel(u.host || u.domainName, apex),
        value: u.rdata || u.value || u.requiredValue,
      });
    }
  }
  return rows;
}

function createHostingClient() {
  return new Client({
    urlPrefix: hostingApiOrigin(),
    apiVersion: "v1beta1",
    auth: true,
  });
}

async function getCustomDomain(hostingClient, projectId, siteId, domainName) {
  try {
    const res = await hostingClient.get(
      `/projects/${projectId}/sites/${siteId}/customDomains/${domainName}`,
    );
    return res.body;
  } catch {
    return null;
  }
}

async function listCustomDomains(hostingClient, projectId, siteId) {
  try {
    const res = await hostingClient.get(
      `/projects/${projectId}/sites/${siteId}/customDomains`,
    );
    return res.body.customDomains || [];
  } catch {
    return [];
  }
}

async function listLegacyDomains(projectId, siteId) {
  try {
    return await hostingApi.getSiteDomains(projectId, siteId);
  } catch {
    return [];
  }
}

/**
 * @returns {Promise<{ records: { type: string, host: string, value: string, domain: string }[], states: Record<string, string> }>}
 */
async function fetchFirebaseHostingDns({
  projectId,
  siteId,
  apexDomain,
  wwwDomain = `www.${apexDomain.replace(/^www\./, "")}`,
}) {
  const apex = apexDomain.replace(/^www\./, "");
  const www = wwwDomain.startsWith("www.") ? wwwDomain : `www.${apex}`;
  const hostingClient = createHostingClient();
  /** @type {{ type: string, host: string, value: string, domain: string }[]} */
  const records = [];
  const states = {};

  const addRows = (label, detail) => {
    if (!detail) return;
    states[label] = detail.hostState || detail.ownershipState || detail.status || "pending";
    for (const row of collectRecords(detail, apex)) {
      records.push({ domain: label, ...row });
    }
  };

  for (const d of [apex, www]) {
    const detail = await getCustomDomain(hostingClient, projectId, siteId, d);
    if (detail) {
      addRows(d, detail);
      continue;
    }
    const legacy = (await listLegacyDomains(projectId, siteId)).find((x) => x.domainName === d);
    if (legacy) {
      addRows(d, legacy);
    } else {
      states[d] = "not_found";
    }
  }

  if (!records.length) {
    const listed = await listCustomDomains(hostingClient, projectId, siteId);
    for (const d of listed) {
      const id = d.name?.split("/").pop();
      const detail = id ? await getCustomDomain(hostingClient, projectId, siteId, id) : d;
      const label = id || "custom";
      addRows(label, detail || d);
    }
  }

  return { records, states };
}

function printRegistrarTable(domainLabel, rows) {
  if (!rows.length) return false;
  console.log(`\n╔══════════════════════════════════════════════════════════════╗`);
  console.log(`║  DNS for ${domainLabel.padEnd(50)}║`);
  console.log(`╠════════╤══════════════════╤════════════════════════════════╣`);
  console.log(`║  Type  │  Host / Name     │  Value / Points to             ║`);
  console.log(`╠════════╪══════════════════╪════════════════════════════════╣`);
  for (const r of rows) {
    const type = (r.type || "").padEnd(6);
    const host = (r.host || "@").padEnd(16);
    const val = (r.value || "").slice(0, 30);
    console.log(`║  ${type} │  ${host} │  ${val.padEnd(30)} ║`);
    if ((r.value || "").length > 30) {
      console.log(`║        │                  │  ${r.value.slice(30).padEnd(30)} ║`);
    }
  }
  console.log(`╚════════╧══════════════════╧════════════════════════════════╝`);
  return true;
}

module.exports = {
  hostLabel,
  collectRecords,
  fetchFirebaseHostingDns,
  printRegistrarTable,
};
