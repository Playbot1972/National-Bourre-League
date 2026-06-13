#!/usr/bin/env node
/**
 * Create inviteLookups docs for rooms that existed before the join fix.
 * Run after deploying firestore.rules + updated firestore.js.
 *
 * Usage:
 *   node scripts/backfill-invite-lookups.cjs [project-id]
 */

const { initFirebaseSession } = require("./lib/firebase-session.cjs");
const firebaseAuth = require("firebase-tools/lib/auth");

const projectId = process.argv[2] || "national-bourre-league";

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
  if (!res.ok) {
    throw new Error(body.error?.message || res.statusText);
  }
  return body;
}

function docFields(doc) {
  return doc?.fields || {};
}

function fieldString(fields, name) {
  return fields[name]?.stringValue || "";
}

async function patchLookup(token, inviteCode, roomId, ownerId) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/inviteLookups/${encodeURIComponent(inviteCode)}?updateMask.fieldPaths=roomId&updateMask.fieldPaths=ownerId`;
  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fields: {
        roomId: { stringValue: roomId },
        ownerId: { stringValue: ownerId },
      },
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || res.statusText);
  }
}

async function getRoom(token, roomId) {
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/rooms/${roomId}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 404) return null;
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error?.message || res.statusText);
  }
  return res.json();
}

async function main() {
  const email = initFirebaseSession();
  const token = await getAccessToken();
  const account = firebaseAuth.getGlobalDefaultAccount();
  const uid = account.user.uid;

  console.log(`==> Account: ${email}`);
  console.log(`==> Project: ${projectId}\n`);
  console.log("==> Finding rooms you own…\n");

  const memberQuery = {
    from: [{ collectionId: "roomMembers" }],
    where: {
      compositeFilter: {
        op: "AND",
        filters: [
          {
            fieldFilter: {
              field: { fieldPath: "userId" },
              op: "EQUAL",
              value: { stringValue: uid },
            },
          },
          {
            fieldFilter: {
              field: { fieldPath: "role" },
              op: "EQUAL",
              value: { stringValue: "owner" },
            },
          },
        ],
      },
    },
  };

  const rows = await runQuery(token, memberQuery);
  let created = 0;
  let skipped = 0;

  for (const row of rows) {
    const member = row.document;
    if (!member) continue;
    const fields = docFields(member);
    const roomId = fieldString(fields, "roomId");
    if (!roomId) continue;

    const room = await getRoom(token, roomId);
    if (!room) {
      console.log(`    skip ${roomId} — room doc missing`);
      skipped += 1;
      continue;
    }
    const roomFields = docFields(room);
    const inviteCode = fieldString(roomFields, "inviteCode");
    const ownerId = fieldString(roomFields, "ownerId") || uid;
    if (!inviteCode) {
      console.log(`    skip ${roomId} — no inviteCode`);
      skipped += 1;
      continue;
    }

    await patchLookup(token, inviteCode, roomId, ownerId);
    console.log(`    ✓ inviteLookups/${inviteCode} → ${roomId}`);
    created += 1;
  }

  if (created === 0) {
    console.log("\n    No owned rooms found (or none needed backfill).");
    console.log("    Create a new room in the app after deploy — new rooms include lookups automatically.");
  } else {
    console.log(`\n==> Backfilled ${created} invite lookup(s).`);
  }
}

main().catch((err) => {
  console.error("Failed:", err.message || err);
  process.exit(1);
});
