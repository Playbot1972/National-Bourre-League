/**
 * Apply Firebase Hosting DNS records at common registrars.
 *
 * Provider via REGISTRAR_DNS_PROVIDER or --provider:
 *   cloudflare | namecheap | porkbun
 */

const CLOUDFLARE_API = "https://api.cloudflare.com/client/v4";
const NAMECHEAP_API = "https://api.namecheap.com/xml.response";
const PORKBUN_API = "https://api.porkbun.com/api/json/v3";

function normalizeHost(host, apex) {
  const h = (host || "@").replace(/\.$/, "").toLowerCase();
  if (!h || h === "@" || h === apex) return "@";
  if (h.endsWith(`.${apex}`)) return h.slice(0, -(apex.length + 1)) || "@";
  return h;
}

function recordKey(type, host) {
  return `${type.toUpperCase()}|${host}`;
}

async function httpJson(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok) {
    const detail =
      typeof body === "object" && body !== null
        ? body.errors?.[0]?.message || body.message || JSON.stringify(body)
        : text.slice(0, 200);
    throw new Error(`${res.status} ${detail}`);
  }
  return body;
}

async function cloudflareZoneId(token, apex) {
  if (process.env.CLOUDFLARE_ZONE_ID) return process.env.CLOUDFLARE_ZONE_ID;
  const data = await httpJson(`${CLOUDFLARE_API}/zones?name=${encodeURIComponent(apex)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const zone = data.result?.[0];
  if (!zone?.id) {
    throw new Error(
      `Cloudflare zone not found for ${apex}. Add the domain to Cloudflare or set CLOUDFLARE_ZONE_ID.`,
    );
  }
  return zone.id;
}

function cloudflareRecordName(host, apex) {
  return host === "@" ? apex : `${host}.${apex}`;
}

async function applyCloudflare(apex, records, { dryRun }) {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!token) {
    throw new Error("Set CLOUDFLARE_API_TOKEN (DNS Edit permission for the zone).");
  }
  const zoneId = await cloudflareZoneId(token, apex);
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const existingRes = await httpJson(
    `${CLOUDFLARE_API}/zones/${zoneId}/dns_records?per_page=500`,
    { headers },
  );
  const existing = existingRes.result || [];

  const wanted = records.map((r) => ({
    type: r.type.toUpperCase(),
    host: normalizeHost(r.host, apex),
    value: r.value,
    name: cloudflareRecordName(normalizeHost(r.host, apex), apex),
  }));

  const results = [];

  for (const rec of wanted) {
    const sameTypeHost = existing.filter(
      (e) => e.type === rec.type && e.name.toLowerCase() === rec.name.toLowerCase(),
    );
    const exact = sameTypeHost.find((e) => e.content === rec.value);

    if (exact) {
      results.push({ action: "exists", ...rec });
      continue;
    }

    for (const old of sameTypeHost) {
      if (dryRun) {
        results.push({ action: "would_delete", id: old.id, ...rec, oldValue: old.content });
      } else {
        await httpJson(`${CLOUDFLARE_API}/zones/${zoneId}/dns_records/${old.id}`, {
          method: "DELETE",
          headers,
        });
        results.push({ action: "deleted", id: old.id, ...rec, oldValue: old.content });
      }
    }

    const payload = {
      type: rec.type,
      name: rec.name,
      content: rec.value,
      ttl: 1,
      proxied: false,
    };

    if (dryRun) {
      results.push({ action: "would_create", ...rec });
    } else {
      const created = await httpJson(`${CLOUDFLARE_API}/zones/${zoneId}/dns_records`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      results.push({ action: "created", id: created.result?.id, ...rec });
    }
  }

  return results;
}

function parseNamecheapXml(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "gi");
  const values = [];
  let m;
  while ((m = re.exec(xml))) values.push(m[1]);
  return values;
}

async function namecheapRequest(params) {
  const user = process.env.NAMECHEAP_API_USER;
  const key = process.env.NAMECHEAP_API_KEY;
  const clientIp = process.env.NAMECHEAP_CLIENT_IP;
  if (!user || !key || !clientIp) {
    throw new Error(
      "Set NAMECHEAP_API_USER, NAMECHEAP_API_KEY, and NAMECHEAP_CLIENT_IP (whitelisted in Namecheap API settings).",
    );
  }
  const qs = new URLSearchParams({
    ApiUser: user,
    ApiKey: key,
    UserName: user,
    ClientIp: clientIp,
    ...params,
  });
  const res = await fetch(`${NAMECHEAP_API}?${qs}`);
  const xml = await res.text();
  if (/Status="ERROR"/i.test(xml)) {
    const err = parseNamecheapXml(xml, "Error")[0] || xml.slice(0, 200);
    throw new Error(err);
  }
  return xml;
}

async function applyNamecheap(apex, records, { dryRun }) {
  const parts = apex.split(".");
  const sld = parts.slice(0, -1).join(".") || parts[0];
  const tld = parts[parts.length - 1];

  const hostsXml = await namecheapRequest({
    Command: "namecheap.domains.dns.getHosts",
    SLD: sld,
    TLD: tld,
  });

  /** @type {{ name: string, type: string, address: string, ttl: string }[]} */
  const hosts = [];
  const hostBlocks = hostsXml.match(/<host[^/>]*\/>|<host[^>]*>[^<]*<\/host>/gi) || [];
  for (const block of hostBlocks) {
    const name = block.match(/Name="([^"]*)"/)?.[1];
    const type = block.match(/Type="([^"]*)"/)?.[1];
    const address = block.match(/Address="([^"]*)"/)?.[1];
    const ttl = block.match(/TTL="([^"]*)"/)?.[1] || "1800";
    if (name && type && address) hosts.push({ name, type: type.toUpperCase(), address, ttl });
  }

  const wanted = records.map((r) => ({
    name: normalizeHost(r.host, apex) === "@" ? "@" : normalizeHost(r.host, apex),
    type: r.type.toUpperCase(),
    address: r.value,
    ttl: "1800",
  }));

  const wantedKeys = new Set(wanted.map((r) => recordKey(r.type, r.name)));
  const merged = [
    ...hosts.filter((h) => !wantedKeys.has(recordKey(h.type, h.name))),
    ...wanted,
  ];

  const results = wanted.map((rec) => {
    const prev = hosts.find((h) => h.type === rec.type && h.name === rec.name);
    if (prev?.address === rec.address) return { action: "exists", ...rec };
    if (prev) return { action: dryRun ? "would_replace" : "replaced", oldValue: prev.address, ...rec };
    return { action: dryRun ? "would_create" : "created", ...rec };
  });

  if (dryRun) return results;

  const hostParams = { Command: "namecheap.domains.dns.setHosts", SLD: sld, TLD: tld };
  merged.forEach((h, i) => {
    const n = i + 1;
    hostParams[`HostName${n}`] = h.name;
    hostParams[`RecordType${n}`] = h.type;
    hostParams[`Address${n}`] = h.address;
    hostParams[`TTL${n}`] = h.ttl;
  });
  await namecheapRequest(hostParams);
  return results;
}

async function applyPorkbun(apex, records, { dryRun }) {
  const apiKey = process.env.PORKBUN_API_KEY;
  const secret = process.env.PORKBUN_SECRET_API_KEY;
  if (!apiKey || !secret) {
    throw new Error("Set PORKBUN_API_KEY and PORKBUN_SECRET_API_KEY.");
  }

  const list = await httpJson(`${PORKBUN_API}/dns/retrieve/${apex}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apikey: apiKey, secretapikey: secret }),
  });
  const existing = list.records || [];
  const results = [];

  for (const rec of records) {
    const host = normalizeHost(rec.host, apex);
    const name = host === "@" ? "" : host;
    const type = rec.type.toUpperCase();
    const match = existing.find(
      (e) =>
        (e.name || "").toLowerCase() === name.toLowerCase() &&
        (e.type || "").toUpperCase() === type,
    );

    if (match?.content === rec.value) {
      results.push({ action: "exists", type, host, value: rec.value });
      continue;
    }

    if (match) {
      if (dryRun) {
        results.push({
          action: "would_replace",
          type,
          host,
          value: rec.value,
          oldValue: match.content,
          id: match.id,
        });
        continue;
      }
      await httpJson(`${PORKBUN_API}/dns/edit/${apex}/${match.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apikey: apiKey,
          secretapikey: secret,
          type,
          content: rec.value,
          name,
        }),
      });
      results.push({ action: "replaced", type, host, value: rec.value, id: match.id });
      continue;
    }

    if (dryRun) {
      results.push({ action: "would_create", type, host, value: rec.value });
      continue;
    }

    const created = await httpJson(`${PORKBUN_API}/dns/create/${apex}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey: apiKey,
        secretapikey: secret,
        type,
        content: rec.value,
        name,
      }),
    });
    results.push({ action: "created", type, host, value: rec.value, id: created.id });
  }

  return results;
}

const PROVIDERS = {
  cloudflare: applyCloudflare,
  namecheap: applyNamecheap,
  porkbun: applyPorkbun,
};

function providerHelp() {
  return `Supported registrars (REGISTRAR_DNS_PROVIDER):

  cloudflare  CLOUDFLARE_API_TOKEN  (+ optional CLOUDFLARE_ZONE_ID)
  namecheap   NAMECHEAP_API_USER, NAMECHEAP_API_KEY, NAMECHEAP_CLIENT_IP
  porkbun     PORKBUN_API_KEY, PORKBUN_SECRET_API_KEY`;
}

async function applyRegistrarDns(provider, apexDomain, records, options = {}) {
  const name = (provider || process.env.REGISTRAR_DNS_PROVIDER || "").toLowerCase();
  const fn = PROVIDERS[name];
  if (!fn) {
    throw new Error(`Unknown registrar "${name || "(none)"}".\n\n${providerHelp()}`);
  }
  if (!records.length) {
    throw new Error("No DNS records to apply.");
  }
  return fn(apexDomain.replace(/^www\./, ""), records, options);
}

function printApplyResults(results, { dryRun, provider }) {
  console.log(`\n==> Registrar DNS (${provider}${dryRun ? ", dry-run" : ""})\n`);
  for (const r of results) {
    const label = r.host === "@" ? "@" : r.host;
    const extra = r.oldValue ? ` (was ${r.oldValue})` : "";
    console.log(`    ${r.action}: ${r.type} ${label} → ${r.value}${extra}`);
  }
}

module.exports = {
  applyRegistrarDns,
  printApplyResults,
  providerHelp,
  normalizeHost,
};
