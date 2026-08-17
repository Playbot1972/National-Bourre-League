import { expect, type Page, type APIRequestContext } from "@playwright/test";
import { goToPrivateRooms } from "./roomFlow";
import { emulatorSuiteReady, clearEmulatorAuthAndFirestore } from "./publicTableEmulator";

const PROJECT_ID = "demo-national-bourre-league";
const FUNCTIONS_BASE = `http://127.0.0.1:5001/${PROJECT_ID}/us-central1`;

export const BUY_IN = 100;
export const HAND_ANTE = 20;

export type ScoreRow = {
  bankroll?: number;
  net?: number;
  tricksWon?: number;
  handsWon?: number;
  skipNextAnte?: boolean;
  bourreReplacementDue?: number | null;
  out?: boolean;
  playerId?: string;
};

export type SessionSnapshot = {
  handCount?: number;
  handStake?: number;
  carryOverPot?: number;
  nextDealFunding?: {
    settledPot?: number;
    bourreIds?: string[];
    bourrePlayerIds?: string[];
    byPlayer?: Record<string, { skipNextAnte?: boolean; bourreReplacementDue?: number | null }>;
  } | null;
  currentHand?: {
    phase?: string | null;
    participantIds?: string[];
    tricksByPlayer?: Record<string, number>;
    postedAntes?: Record<string, number>;
    turnPlayerId?: string | null;
    drawDiscardCountsByPlayer?: Record<string, number>;
    drawCompletedIds?: string[];
    deckNextIndex?: number;
  } | null;
  moneyLedgerBaseline?: Record<string, unknown> | null;
  moneySequence?: number;
  dealerId?: string;
  players?: Array<{ playerId: string; displayName?: string }>;
};

export type AuthoritativeState = {
  roomId: string;
  sessionId: string;
  hostUid: string;
  session: SessionSnapshot | null;
  scoreById: Record<string, ScoreRow>;
  moneyEventCount: number;
  settlementEventCount: number;
  handLedgerCount: number;
  handLedger?: { bourreIds?: string[]; settlement?: string } | null;
  moneyEvents: Array<{ actionId?: string; type?: string; handId?: string | number }>;
};

const LOOPBACK_BASE_URL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

/** Reject non-loopback Playwright base URLs before any browser/Firebase/callable work. */
export function assertLoopbackPlaywrightBaseUrl(baseUrl = process.env.PLAYWRIGHT_BASE_URL) {
  if (process.env.PLAYWRIGHT_EMULATORS !== "1") return;

  const raw = (baseUrl ?? "http://localhost:8080").trim();
  if (!raw) {
    throw new Error("PLAYWRIGHT_BASE_URL must be a loopback http URL when PLAYWRIGHT_EMULATORS=1");
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `PLAYWRIGHT_BASE_URL is malformed (${raw}); use http://localhost:8080 or http://127.0.0.1:8080 when PLAYWRIGHT_EMULATORS=1`,
    );
  }

  if (parsed.protocol !== "http:") {
    throw new Error(
      `PLAYWRIGHT_BASE_URL must use http:// on loopback when PLAYWRIGHT_EMULATORS=1, got ${parsed.protocol}//${parsed.host}`,
    );
  }

  const hostname = parsed.hostname.toLowerCase();
  if (!LOOPBACK_BASE_URL_HOSTS.has(hostname)) {
    throw new Error(
      `PLAYWRIGHT_BASE_URL must point to localhost, 127.0.0.1, or [::1] when PLAYWRIGHT_EMULATORS=1, got ${parsed.href}`,
    );
  }
}

export function assertLoopbackEmulatorEnv() {
  if (process.env.PLAYWRIGHT_EMULATORS !== "1") {
    throw new Error("PLAYWRIGHT_EMULATORS=1 is required for bankroll settlement emulator tests");
  }
  assertLoopbackPlaywrightBaseUrl();
  for (const key of ["FIRESTORE_EMULATOR_HOST", "FIREBASE_AUTH_EMULATOR_HOST", "FUNCTIONS_EMULATOR"]) {
    const raw = process.env[key];
    if (!raw) continue;
    const host = raw.includes(":") ? raw.split(":")[0] : raw;
    if (host !== "127.0.0.1" && host !== "localhost") {
      throw new Error(`${key} must point to loopback, got ${raw}`);
    }
  }
}

export async function assertEmulatorSuiteReady() {
  assertLoopbackEmulatorEnv();
  const ready = await emulatorSuiteReady();
  expect(ready, "Firebase emulators (auth + firestore + functions + UI :4000) must be running").toBe(
    true,
  );
}

export async function emulatorCleanup(request: APIRequestContext) {
  await clearEmulatorAuthAndFirestore(request);
}

export async function resolveSessionContext(page: Page): Promise<{
  roomId: string;
  sessionId: string;
  hostUid: string;
}> {
  return page.evaluate(async () => {
    const { FIREBASE_SDK_VERSION } = await import("./firebase-config.js");
    const { getApps } = await import(
      `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`
    );
    const { getAuth } = await import(
      `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`
    );
    const app = getApps()[0];
    if (!app) throw new Error("Firebase app not initialized");
    const auth = getAuth(app);
    await auth.authStateReady();
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("No authenticated user on page");

    const { getFirestore, collection, query, where, getDocs } = await import(
      `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
    );
    const db = getFirestore(app);

    let roomId: string | null = null;
    const memberSnap = await getDocs(query(collection(db, "roomMembers"), where("userId", uid)));
    if (!memberSnap.empty) {
      roomId = memberSnap.docs[0].data().roomId as string;
    }
    if (!roomId) {
      const roomsSnap = await getDocs(query(collection(db, "rooms"), where("ownerId", uid)));
      if (!roomsSnap.empty) {
        roomId = roomsSnap.docs[0].id;
      }
    }
    if (!roomId) throw new Error("No room found for current user");

    const sessionsSnap = await getDocs(collection(db, "rooms", roomId, "sessions"));
    if (sessionsSnap.empty) throw new Error("No sessions under room");
    const active =
      sessionsSnap.docs.find((d) => d.data().status !== "final") ?? sessionsSnap.docs[0];
    return { roomId, sessionId: active.id, hostUid: uid };
  });
}

export async function readAuthoritativeState(
  page: Page,
  roomId: string,
  sessionId: string,
  hostUid: string,
): Promise<AuthoritativeState> {
  return page.evaluate(
    async ({ roomId: rid, sessionId: sid }) => {
      const { FIREBASE_SDK_VERSION } = await import("./firebase-config.js");
      const { getApps } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`
      );
      const { getFirestore, doc, getDoc, collection, getDocs } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-firestore.js`
      );
      const app = getApps()[0];
      if (!app) throw new Error("Firebase app not initialized");
      const db = getFirestore(app);

      const sessionSnap = await getDoc(doc(db, "rooms", rid, "sessions", sid));
      const session = sessionSnap.exists() ? sessionSnap.data() : null;

      const scoresSnap = await getDocs(collection(db, "rooms", rid, "sessions", sid, "scores"));
      const scoreById = Object.fromEntries(
        scoresSnap.docs.map((d) => [d.id, d.data() as Record<string, unknown>]),
      );

      const moneySnap = await getDocs(collection(db, "rooms", rid, "sessions", sid, "moneyEvents"));
      const moneyEvents = moneySnap.docs.map((d) => d.data() as Record<string, unknown>);
      const settlementEventCount = moneyEvents.filter(
        (e) =>
          String(e.type ?? "").includes("settlement") ||
          String(e.actionId ?? "").startsWith("settle:"),
      ).length;

      const handsSnap = await getDocs(collection(db, "rooms", rid, "sessions", sid, "hands"));
      const handLedgerCount = handsSnap.size;
      const handCount = Number(session?.handCount ?? 0);
      const handLedgerSnap =
        handCount > 0
          ? await getDoc(doc(db, "rooms", rid, "sessions", sid, "hands", String(handCount)))
          : null;
      const handLedger = handLedgerSnap?.exists() ? handLedgerSnap.data() : null;

      return {
        session,
        scoreById,
        moneyEventCount: moneyEvents.length,
        settlementEventCount,
        handLedgerCount,
        handLedger,
        moneyEvents: moneyEvents.map((e) => ({
          actionId: e.actionId as string | undefined,
          type: e.type as string | undefined,
          handId: e.handId as string | number | undefined,
        })),
      };
    },
    { roomId, sessionId },
  ).then((partial) => ({
    roomId,
    sessionId,
    hostUid,
    session: (partial.session as SessionSnapshot | null) ?? null,
    scoreById: partial.scoreById as Record<string, ScoreRow>,
    moneyEventCount: partial.moneyEventCount,
    settlementEventCount: partial.settlementEventCount,
    handLedgerCount: partial.handLedgerCount,
    handLedger: partial.handLedger as AuthoritativeState["handLedger"],
    moneyEvents: partial.moneyEvents,
  }));
}

export async function advancePlayTurnViaCallable(
  page: Page,
  roomId: string,
  sessionId: string,
  playerId: string,
): Promise<{ ok: true; result: unknown } | { ok: false; error: string }> {
  for (let cardIndex = 0; cardIndex < 5; cardIndex += 1) {
    const result = await callCallableFromPage(page, "gamePlayCard", {
      roomId,
      sessionId,
      playerId,
      cardIndex,
    });
    if (result.ok) return result;
    const err = (result as { error: string }).error ?? "";
    if (!/illegal|must follow|cannot|invalid|not legal|not your turn/i.test(err)) {
      return result as { ok: false; error: string };
    }
  }
  return { ok: false, error: "no legal play card index for " + playerId };
}

/**
 * Complete draw via authoritative callables when presentation gates hide hero draw controls
 * (e.g. bot already drew server-side before draw-sequence animation consumed).
 */
export async function advanceToPlayPhase(
  page: Page,
  roomId: string,
  sessionId: string,
  hostUid: string,
): Promise<AuthoritativeState> {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const state = await readAuthoritativeState(page, roomId, sessionId, hostUid);
    const hand = state.session?.currentHand;
    const phase = hand?.phase;
    if (phase === "play") return state;
    if (phase !== "draw") {
      await page.waitForTimeout(400);
      continue;
    }

    const turn = hand?.turnPlayerId ?? null;
    const drawCompleted = hand?.drawCompletedIds ?? [];
    const participants = hand?.participantIds ?? [];

    if (turn && !drawCompleted.includes(turn)) {
      const draw = await callCallableFromPage(page, "gameSubmitDraw", {
        roomId,
        sessionId,
        playerId: turn,
        discardIndices: [],
      });
      if (!draw.ok) {
        await callCallableFromPage(page, "gameAdvanceBots", { roomId, sessionId });
      }
      await page.waitForTimeout(350);
      continue;
    }

    const pending = participants.filter((pid) => !drawCompleted.includes(pid));
    if (pending.length > 0) {
      for (const pid of pending) {
        await callCallableFromPage(page, "gameSubmitDraw", {
          roomId,
          sessionId,
          playerId: pid,
          discardIndices: [],
        });
      }
      await page.waitForTimeout(350);
      continue;
    }

    await callCallableFromPage(page, "gameAdvanceBots", { roomId, sessionId });
    await page.waitForTimeout(400);
  }

  const finalState = await readAuthoritativeState(page, roomId, sessionId, hostUid);
  throw new Error(
    `Draw phase did not advance to play.\n${formatDiagnostics(finalState)}`,
  );
}

export async function waitForPlayButtonEnabled(page: Page, timeoutMs = 60_000) {
  await expect.poll(
    async () => page.getByTestId("open-table-play").first().isEnabled(),
    { timeout: timeoutMs },
  ).toBe(true);
}

/** Add a robot via Firestore client API (avoids flaky roster pill when regional tabs re-render). */
export async function addSessionRobotFromPage(
  page: Page,
  roomId: string,
  sessionId: string,
  displayName = "E2E Bot",
) {
  await page.evaluate(
    async ({ rid, sid, name }) => {
      const { addSessionRobot } = await import("./firestore.js");
      await addSessionRobot(rid, sid, name);
    },
    { rid: roomId, sid: sessionId, name: displayName },
  );
  await page.waitForTimeout(500);
}

export function bourreIdsFromFunding(
  funding: SessionSnapshot["nextDealFunding"],
): string[] {
  if (!funding) return [];
  if (Array.isArray(funding.bourreIds)) return funding.bourreIds;
  if (Array.isArray(funding.bourrePlayerIds)) return funding.bourrePlayerIds;
  return [];
}

export async function callCallableFromPage(
  page: Page,
  name: string,
  data: Record<string, unknown>,
): Promise<{ ok: true; result: unknown } | { ok: false; error: string }> {
  return page.evaluate(
    async ({ fnName, fnData, base }) => {
      const { FIREBASE_SDK_VERSION } = await import("./firebase-config.js");
      const { getApps } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`
      );
      const { getAuth } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`
      );
      const app = getApps()[0];
      if (!app) return { ok: false as const, error: "no firebase app" };
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) return { ok: false as const, error: "no authenticated user" };
      const token = await user.getIdToken();
      const res = await fetch(`${base}/${fnName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: fnData }),
      });
      const body = await res.json();
      if (!res.ok || body.error) {
        return {
          ok: false as const,
          error: body.error?.message || JSON.stringify(body),
        };
      }
      return { ok: true as const, result: body.result };
    },
    { fnName: name, fnData: data, base: FUNCTIONS_BASE },
  );
}

export function sumPostedAntes(posted: Record<string, number> | undefined): number {
  return Object.values(posted ?? {}).reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);
}

export function sumTricks(tricks: Record<string, number> | undefined): number {
  return Object.values(tricks ?? {}).reduce((sum, n) => sum + Math.max(0, Number(n) || 0), 0);
}

export function potFromSession(session: SessionSnapshot | null): number {
  const carry = Math.max(0, Number(session?.carryOverPot) || 0);
  const posted = sumPostedAntes(session?.currentHand?.postedAntes);
  return carry + posted;
}

export function playerIdsFromScores(scoreById: Record<string, ScoreRow>): string[] {
  return Object.keys(scoreById);
}

export function formatDiagnostics(state: AuthoritativeState): string {
  const phase = state.session?.currentHand?.phase ?? "cleared";
  const turn = state.session?.currentHand?.turnPlayerId ?? "—";
  const tricks = JSON.stringify(state.session?.currentHand?.tricksByPlayer ?? {});
  const bankrolls = Object.fromEntries(
    Object.entries(state.scoreById).map(([pid, row]) => [pid, row.bankroll]),
  );
  return [
    `sessionId=${state.sessionId}`,
    `handCount=${state.session?.handCount ?? 0}`,
    `phase=${phase}`,
    `turn=${turn}`,
    `tricks=${tricks}`,
    `bankrolls=${JSON.stringify(bankrolls)}`,
    `carryOverPot=${state.session?.carryOverPot ?? 0}`,
    `postedAntes=${JSON.stringify(state.session?.currentHand?.postedAntes ?? {})}`,
    `nextDealFunding=${JSON.stringify(state.session?.nextDealFunding ?? null)}`,
    `moneyEvents=${state.moneyEventCount} settlementEvents=${state.settlementEventCount}`,
    `handLedgers=${state.handLedgerCount}`,
    `latestMoney=${JSON.stringify(state.moneyEvents.slice(-3))}`,
  ].join("\n");
}

export async function assertChipConservation(
  page: Page,
  state: AuthoritativeState,
  label: string,
  playerIds: string[],
) {
  const result = await page.evaluate(
    async ({ session, scoreById, playerIds: ids, buyIn, label: lbl }) => {
      const { assertTableChipInvariant, buildSessionChipSnapshot, baselineFromSessionDoc } =
        await import("./money-persistence.js");
      const baseline = baselineFromSessionDoc(session?.moneyLedgerBaseline ?? null, []);
      if (!session?.moneyLedgerBaseline) {
        baseline.tableStartingTotal = buyIn * ids.length;
      }
      const postedAntes = session?.currentHand?.postedAntes ?? {};
      const snapshot = buildSessionChipSnapshot(scoreById, {
        carryOverPot: session?.carryOverPot ?? 0,
        currentHand: { postedAntes },
      }, { buyInFallback: buyIn, playerIds: ids });
      const invariant = assertTableChipInvariant(snapshot, baseline, {
        roomId: "e2e",
        sessionId: session?.sessionId ?? "e2e",
        label: lbl,
        handId: session?.handCount ?? 0,
      });
      return invariant;
    },
    {
      session: { ...state.session, sessionId: state.sessionId },
      scoreById: state.scoreById,
      playerIds,
      buyIn: BUY_IN,
      label,
    },
  );
  expect(result.ok, `${label}: chip conservation failed — ${JSON.stringify(result)}`).toBe(true);
}

export async function attachFailureDiagnostics(page: Page, state: AuthoritativeState, testInfo: {
  attach: (name: string, body: Buffer, options?: { contentType?: string }) => Promise<void>;
}) {
  const text = formatDiagnostics(state);
  await testInfo.attach("firestore-state.txt", {
    body: Buffer.from(text, "utf8"),
    contentType: "text/plain",
  });
  const screenshot = await page.screenshot({ fullPage: true }).catch(() => null);
  if (screenshot) {
    await testInfo.attach("failure-screenshot.png", {
      body: screenshot,
      contentType: "image/png",
    });
  }
}

export function isHandSettled(session: SessionSnapshot | null): boolean {
  if (!session) return false;
  const hand = session.currentHand;
  const phase = hand?.phase;
  const participants = hand?.participantIds ?? [];
  if (!phase && participants.length === 0) return (session.handCount ?? 0) > 0;
  if (phase === null || phase === undefined) return (session.handCount ?? 0) > 0;
  return participants.length === 0 && (session.handCount ?? 0) > 0;
}

export async function setRoomAnte(page: Page, ante: number) {
  const roomAnte = page.locator("#room-ante-amount");
  await expect(roomAnte).toBeVisible({ timeout: 15_000 });
  await roomAnte.selectOption(String(ante));
  await page.waitForTimeout(300);
}

/** Create room with chosen ante before the auto-opened regional session is created. */
export async function createRoomWithAnte(page: Page, name: string, ante: number) {
  await goToPrivateRooms(page);
  const title = page.locator(".room-detail__title");
  const modal = page.locator("#create-room-modal");
  await page.locator("#create-room").click();
  await expect(modal).toBeVisible();
  await page.locator("#create-room-name").fill(name);
  await page.locator("#create-room-form").evaluate((form: HTMLFormElement) => form.requestSubmit());
  await page.locator("#create-room-ante").selectOption(String(ante));
  await page.locator("#create-room-form").evaluate((form: HTMLFormElement) => form.requestSubmit());
  await expect(title).toContainText(name, { timeout: 15_000 });
  await expect(modal).toBeHidden({ timeout: 10_000 });
}
