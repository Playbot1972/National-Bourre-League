#!/usr/bin/env node
/**
 * One-time backfill: assign sessionNamePool to rooms missing it and name legacy sessions.
 *
 * Usage:
 *   node scripts/backfill-session-name-pools.cjs [project-id]
 */

const { initFirebaseSession } = require("./lib/firebase-session.cjs");
const firebaseAuth = require("firebase-tools/lib/auth");

const PRESET = ["Dirty South", "Wild West", "East Coast", "Midwest"];
const MAX = 4;

const projectId = process.argv[2] || "national-bourre-league";

function seededPresetOrder(seedText) {
  let seed = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
  }
  const rng = () => {
    seed = (seed * 1103515245 + 12345) >>> 0;
    return seed / 0x80000000;
  };
  const pool = [...PRESET];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function isValidPool(pool) {
  if (!Array.isArray(pool) || pool.length !== MAX) return false;
  if (new Set(pool).size !== MAX) return false;
  const sorted = [...pool].sort();
  const expected = [...PRESET].sort();
  return sorted.every((name, i) => name === expected[i]);
}

async function getAccessToken() {
  const account = firebaseAuth.getGlobalDefaultAccount();
  return firebaseAuth.getAccessToken(account.tokens.refresh_token, [
    "https://www.googleapis.com/auth/cloud-platform",
  ]);
}

async function runQuery(token, structuredQuery) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ structuredQuery }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(body.error?.message || res.statusText);
  return body;
}

function fieldString(value) {
  return value?.stringValue ?? null;
}

function patchFields(fields) {
  return { fields };
}

async function patchDoc(token, path, fields) {
  const url = `https://firestore.googleapis.com/v1/${path}?updateMask.fieldPaths=${Object.keys(fields).join("&updateMask.fieldPaths=")}`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const body = await res.json();
    throw new Error(body.error?.message || res.statusText);
  }
}

async function main() {
  await initFirebaseSession();
  const token = await getAccessToken();
  const rooms = await runQuery(token, {
    from: [{ collectionId: "rooms" }],
  });

  let roomsPatched = 0;
  let sessionsPatched = 0;
  for (const row of rooms) {
    const doc = row.document;
    if (!doc?.name) continue;
    const roomId = doc.name.split("/").pop();
    const data = doc.fields || {};
    let pool = (data.sessionNamePool?.arrayValue?.values || [])
      .map((v) => v.stringValue)
      .filter(Boolean);
    if (!isValidPool(pool)) {
      pool = seededPresetOrder(roomId);
      await patchDoc(
        token,
        doc.name,
        patchFields({
          sessionNamePool: {
            arrayValue: { values: pool.map((name) => ({ stringValue: name })) },
          },
        }),
      );
      roomsPatched += 1;
      console.log(`room ${roomId}: initialized sessionNamePool`);
    } else {
      console.log(`room ${roomId}: pool already set — skipped`);
    }

    const sessions = await runQuery(token, {
      from: [{ collectionId: "sessions", allDescendants: false }],
      where: {
        fieldFilter: {
          field: { fieldPath: "roomId" },
          op: "EQUAL",
          value: { stringValue: roomId },
        },
      },
    }).catch(() =>
      runQuery(token, {
        from: [
          {
            collectionId: "rooms",
            allDescendants: true,
          },
        ],
        where: {
          fieldFilter: {
            field: { fieldPath: "roomId" },
            op: "EQUAL",
            value: { stringValue: roomId },
          },
        },
      }),
    );

    const sessionDocs = sessions
      .filter((r) => r.document?.name?.includes(`/rooms/${roomId}/sessions/`))
      .map((r) => ({
        path: r.document.name,
        id: r.document.name.split("/").pop(),
        sessionName: fieldString(r.document.fields?.sessionName),
        createdAt: r.document.createTime || "",
      }))
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt));

    const claimed = new Set(sessionDocs.map((s) => s.sessionName).filter(Boolean));
    const available = pool.filter((name) => !claimed.has(name));
    for (const s of sessionDocs) {
      if (s.sessionName) continue;
      const name = available.shift();
      if (!name) break;
      await patchDoc(
        token,
        s.path,
        patchFields({ sessionName: { stringValue: name } }),
      );
      claimed.add(name);
      sessionsPatched += 1;
      console.log(`  session ${s.id}: assigned ${name}`);
    }

    const claimedSessionNames = [...claimed];
    await patchDoc(
      token,
      doc.name,
      patchFields({
        claimedSessionNames: {
          arrayValue: {
            values: claimedSessionNames.map((name) => ({ stringValue: name })),
          },
        },
      }),
    );
    console.log(`  room ${roomId}: claimedSessionNames = ${claimedSessionNames.join(", ") || "(none)"}`);
  }

  console.log(`Done. Rooms patched: ${roomsPatched}, sessions named: ${sessionsPatched}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
