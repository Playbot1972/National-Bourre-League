import type { APIRequestContext } from "@playwright/test";

const PROJECT_ID = "demo-national-bourre-league";
const AUTH_EMULATOR = `http://127.0.0.1:9099`;
const FIRESTORE_EMULATOR = `http://127.0.0.1:8088`;

export async function clearEmulatorAuthAndFirestore(request: APIRequestContext) {
  await request
    .delete(`${AUTH_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/accounts`)
    .catch(() => {});
  await request
    .delete(
      `${FIRESTORE_EMULATOR}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
    )
    .catch(() => {});
}

export async function emulatorSuiteReady(): Promise<boolean> {
  try {
    const [ui, auth, firestore] = await Promise.all([
      fetch("http://127.0.0.1:4000", { signal: AbortSignal.timeout(1500) }),
      fetch(`${AUTH_EMULATOR}/`, { signal: AbortSignal.timeout(1500) }),
      fetch(`${FIRESTORE_EMULATOR}/`, { signal: AbortSignal.timeout(1500) }),
    ]);
    return ui.ok && (auth.ok || auth.status === 404) && (firestore.ok || firestore.status === 404);
  } catch {
    return false;
  }
}

export type AuthAccount = { localId: string; email: string };

export async function listAuthAccounts(request: APIRequestContext): Promise<AuthAccount[]> {
  const res = await request.post(
    `${AUTH_EMULATOR}/identitytoolkit.googleapis.com/v1/accounts:query?key=fake-api-key`,
    { data: { returnUserInfo: true } },
  );
  if (!res.ok()) return [];
  const body = (await res.json()) as {
    userInfo?: { localId: string; email: string }[];
  };
  return (body.userInfo ?? []).map((u) => ({ localId: u.localId, email: u.email }));
}

export async function readPageAuthUid(page: import("@playwright/test").Page): Promise<string | null> {
  return page.evaluate(async () => {
    try {
      const { currentUser } = await import("./auth.js");
      return currentUser()?.uid ?? null;
    } catch {
      return null;
    }
  });
}

export async function findUidByEmailPrefix(
  request: APIRequestContext,
  prefix: string,
): Promise<string | null> {
  const slug = prefix.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const accounts = await listAuthAccounts(request);
  const match = accounts.find((a) => a.email.startsWith(slug));
  return match?.localId ?? null;
}

export type MatchQueueDoc = {
  sessionKey?: string;
  roomId?: string;
  sessionId?: string;
  status?: string;
};

export async function readMatchQueueForPage(page: import("@playwright/test").Page): Promise<MatchQueueDoc | null> {
  return page.evaluate(async () => {
    const { currentUser } = await import("./auth.js");
    const uid = currentUser()?.uid;
    if (!uid) return null;
    const { FIREBASE_SDK_VERSION } = await import("./firebase-config.js");
    const { getApps } = await import(
      `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`
    );
    const { getFirestore, doc, getDoc } = await import(
      `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
    );
    const app = getApps()[0];
    if (!app) return null;
    const db = getFirestore(app);
    const snap = await getDoc(doc(db, "matchQueue", uid));
    if (!snap.exists()) return null;
    return snap.data() as MatchQueueDoc;
  });
}

export async function scoreRowExistsForPage(
  page: import("@playwright/test").Page,
  roomId: string,
  sessionId: string,
  playerId: string,
): Promise<boolean> {
  return page.evaluate(
    async ({ roomId: rid, sessionId: sid, playerId: pid }) => {
      const { FIREBASE_SDK_VERSION } = await import("./firebase-config.js");
      const { getApps } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`
      );
      const { getFirestore, doc, getDoc } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
      );
      const app = getApps()[0];
      if (!app) return false;
      const db = getFirestore(app);
      const snap = await getDoc(doc(db, "rooms", rid, "sessions", sid, "scores", pid));
      return snap.exists();
    },
    { roomId, sessionId, playerId },
  );
}

/** @deprecated prefer readMatchQueueForPage — unauthenticated REST reads are denied by rules */
export async function readMatchQueue(
  request: APIRequestContext,
  uid: string,
): Promise<MatchQueueDoc | null> {
  const res = await request.get(
    `${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/matchQueue/${uid}`,
  );
  if (!res.ok()) return null;
  const body = (await res.json()) as {
    fields?: Record<string, { stringValue?: string }>;
  };
  const fields = body.fields ?? {};
  return {
    sessionKey: fields.sessionKey?.stringValue,
    roomId: fields.roomId?.stringValue,
    sessionId: fields.sessionId?.stringValue,
    status: fields.status?.stringValue,
  };
}

export async function patchSessionCurrentHand(
  request: APIRequestContext,
  roomId: string,
  sessionId: string,
  currentHand: Record<string, unknown>,
) {
  const url = new URL(
    `${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/rooms/${roomId}/sessions/${sessionId}`,
  );
  url.searchParams.append("updateMask.fieldPaths", "currentHand");
  const fields: Record<string, unknown> = {
    currentHand: { mapValue: { fields: firestoreMapFields(currentHand) } },
  };
  const res = await request.patch(url.toString(), {
    data: { fields },
  });
  if (!res.ok()) {
    throw new Error(`patchSessionCurrentHand failed: ${res.status()} ${await res.text()}`);
  }
}

function firestoreMapFields(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === "string") out[key] = { stringValue: value };
    else if (typeof value === "number") out[key] = { integerValue: String(value) };
    else if (Array.isArray(value)) {
      out[key] = {
        arrayValue: {
          values: value.map((v) =>
            typeof v === "string" ? { stringValue: v } : { stringValue: String(v) },
          ),
        },
      };
    } else if (typeof value === "object") {
      out[key] = { mapValue: { fields: firestoreMapFields(value as Record<string, unknown>) } };
    }
  }
  return out;
}

export async function scoreRowExists(
  request: APIRequestContext,
  roomId: string,
  sessionId: string,
  playerId: string,
): Promise<boolean> {
  const res = await request.get(
    `${FIRESTORE_EMULATOR}/v1/projects/${PROJECT_ID}/databases/(default)/documents/rooms/${roomId}/sessions/${sessionId}/scores/${playerId}`,
  );
  return res.ok();
}
