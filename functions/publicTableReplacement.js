/**
 * Phase 5 — hand-boundary bot replacement for queued public-table spectators.
 *
 * Server-authoritative only. Runs at handoff (between hands), before enrollment/deal.
 */

import { FieldValue } from "firebase-admin/firestore";
import {
  BOT_ROLE,
  MATCH_QUEUE_COLLECTION,
  MATCH_QUEUE_STATUS,
  PENDING_JOIN_STATUS,
  publicTableIndexKey,
  isPublicVisibility,
  roomHasMixedPublicTables,
} from "./vendor/public-table-schema.js";
import {
  isMixedPublicTablesServerEnabled,
  isPublicTableSession,
} from "./vendor/public-table-rollout.js";
import {
  buildSessionBuyInMoney,
  moneyEventsFromFirestoreDocs,
  nextMoneySequence,
  processBuyIn,
} from "./vendor/money-persistence.js";
import {
  deriveScoreNet,
  isMoneyEngineV1,
  MONEY_ENGINE_VERSION,
  resolveSessionBuyIn,
} from "./vendor/bourre-rules.js";

const MONEY_EVENTS_COLLECTION = "moneyEvents";

/** Mirror of publicTable.isSessionInHand — kept local to avoid circular imports. */
function isSessionInHand(sessionData) {
  if (!sessionData || sessionData.status === "final") return false;
  const hand = sessionData.currentHand ?? {};
  const phase = hand.phase ?? null;
  if (phase === "draw" || phase === "play" || phase === "reveal" || phase === "decision") {
    return true;
  }
  return (hand.participantIds?.length ?? 0) > 0;
}

function isRobotPlayerId(playerId) {
  return typeof playerId === "string" && playerId.startsWith("bot_");
}

function sessionDocRef(db, roomId, sessionId) {
  return db.collection("rooms").doc(roomId).collection("sessions").doc(sessionId);
}

function scoresCollection(db, roomId, sessionId) {
  return sessionDocRef(db, roomId, sessionId).collection("scores");
}

function privateHandDocRef(db, roomId, sessionId, playerId) {
  return sessionDocRef(db, roomId, sessionId).collection("privateHands").doc(playerId);
}

function moneyEventsCollection(db, roomId, sessionId) {
  return sessionDocRef(db, roomId, sessionId).collection(MONEY_EVENTS_COLLECTION);
}

function matchQueueDocRef(db, userId) {
  return db.collection(MATCH_QUEUE_COLLECTION).doc(userId);
}

/** True when session is between hands and safe for roster mutation. */
export function isHandoffWindow(sessionData) {
  if (!sessionData || sessionData.status === "final") return false;
  return !isSessionInHand(sessionData);
}

export function shouldRunPublicTableReplacement(roomData, sessionData) {
  if (!isMixedPublicTablesServerEnabled()) return false;
  if (!isPublicTableSession(sessionData)) return false;
  if (!isPublicVisibility(roomData) || !roomHasMixedPublicTables(roomData)) return false;
  return true;
}

function timestampMs(value) {
  if (value == null) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number") return value;
  return 0;
}

/**
 * FIFO queued spectators eligible for replacement at this boundary.
 * @param {Record<string, object>} pendingJoins
 * @param {object} [options]
 */
export function selectQueuedHumansFifo(pendingJoins, { appliedJoinIds = [], nowMs = Date.now() } = {}) {
  const applied = new Set(appliedJoinIds);
  return Object.entries(pendingJoins ?? {})
    .filter(([, entry]) => entry?.status === PENDING_JOIN_STATUS.SPECTATING)
    .filter(([, entry]) => entry?.joinId && !applied.has(entry.joinId))
    .filter(([, entry]) => {
      if (!entry.expiresAt) return true;
      return timestampMs(entry.expiresAt) > nowMs;
    })
    .sort((a, b) => {
      const ta =
        timestampMs(a[1].queuedAt) ||
        Number(a[1].queuedAtHandCount ?? 0) * 1_000_000;
      const tb =
        timestampMs(b[1].queuedAt) ||
        Number(b[1].queuedAtHandCount ?? 0) * 1_000_000;
      if (ta !== tb) return ta - tb;
      return a[0].localeCompare(b[0]);
    })
    .map(([uid, entry]) => ({
      uid,
      joinId: entry.joinId,
      displayName: entry.displayName || "Player",
      queuedAtHandCount: entry.queuedAtHandCount ?? 0,
    }));
}

/**
 * Fill bots eligible for replacement, in session.players seat order.
 */
export function selectEligibleFillBots(sessionPlayers, scoreById) {
  const result = [];
  for (let seatIndex = 0; seatIndex < (sessionPlayers ?? []).length; seatIndex += 1) {
    const p = sessionPlayers[seatIndex];
    const playerId = p?.playerId;
    if (!playerId || !isRobotPlayerId(playerId)) continue;
    const row = scoreById[playerId];
    if (!row || row.botRole !== BOT_ROLE.FILL) continue;
    if (row.spectator === true || row.out === true) continue;
    if ((row.bankroll ?? 0) <= 0) continue;
    result.push({
      playerId,
      seatIndex,
      displayName: row.displayName || p.displayName || "Bot",
    });
  }
  return result;
}

/** Pair queued humans with fill bots (FIFO × seat order). */
export function planReplacementPairs(queuedHumans, fillBots) {
  const count = Math.min(queuedHumans.length, fillBots.length);
  const pairs = [];
  for (let i = 0; i < count; i += 1) {
    pairs.push({ human: queuedHumans[i], bot: fillBots[i] });
  }
  return pairs;
}

function boundaryAppliedJoinIds(sessionData) {
  const handCount = sessionData.handCount ?? 0;
  const plan = sessionData.replacementPlan ?? {};
  if (plan.handCount !== handCount) return [];
  return Array.isArray(plan.appliedJoinIds) ? [...plan.appliedJoinIds] : [];
}

async function loadSessionMoneyEvents(db, roomId, sessionId) {
  const snap = await moneyEventsCollection(db, roomId, sessionId).get();
  return moneyEventsFromFirestoreDocs(snap.docs);
}

function buildReplacementBuyIn(sessionId, joinId, playerId, buyInAmount, existingEvents) {
  const actionId = `replacement:buyin:${sessionId}:${joinId}`;
  return processBuyIn({
    actionId,
    playerIds: [playerId],
    buyInAmount,
    existingEvents,
  });
}

/**
 * Apply queued spectator → fill-bot replacements at the hand boundary.
 * Idempotent per boundary handCount + joinId.
 */
export async function applyPendingReplacements(db, { roomId, sessionId, roomData, sessionData }) {
  if (!shouldRunPublicTableReplacement(roomData, sessionData)) {
    return { status: "skipped", reason: "not_enabled", replacedCount: 0, appliedJoinIds: [] };
  }
  if (!isHandoffWindow(sessionData)) {
    return { status: "skipped", reason: "not_handoff", replacedCount: 0, appliedJoinIds: [] };
  }

  const buyIn = resolveSessionBuyIn(sessionData, roomData?.bourreSettings ?? {});
  const existingMoneyEvents = await loadSessionMoneyEvents(db, roomId, sessionId);
  const skipped = [];
  let replacedCount = 0;
  const newlyAppliedJoinIds = [];

  const txResult = await db.runTransaction(async (tx) => {
    let replacedInTx = 0;
    const sessionRef = sessionDocRef(db, roomId, sessionId);
    const sessionSnap = await tx.get(sessionRef);
    if (!sessionSnap.exists) {
      return { status: "skipped", reason: "session_missing" };
    }
    const freshSession = sessionSnap.data();
    if (freshSession.status === "final") {
      return { status: "skipped", reason: "session_final" };
    }
    if (!isHandoffWindow(freshSession)) {
      return { status: "skipped", reason: "not_handoff" };
    }

    const scoreSnap = await tx.get(scoresCollection(db, roomId, sessionId));
    const scoreById = Object.fromEntries(scoreSnap.docs.map((d) => [d.id, d.data()]));
    const appliedJoinIds = boundaryAppliedJoinIds(freshSession);
    const queuedHumans = selectQueuedHumansFifo(freshSession.pendingJoins, { appliedJoinIds });
    const fillBots = selectEligibleFillBots(freshSession.players, scoreById);
    const pairs = planReplacementPairs(queuedHumans, fillBots);

    if (!pairs.length) {
      return { status: "noop", reason: "no_pairs", appliedJoinIds };
    }

    const pendingJoins = { ...(freshSession.pendingJoins ?? {}) };
    let players = [...(freshSession.players ?? [])];
    let tableOptInIds = [...(freshSession.tableOptInIds ?? [])];
    const moneyEventsToWrite = [];
    let moneyEventCount = 0;
    const sessionKey = publicTableIndexKey(roomId, sessionId);
    const localApplied = [...appliedJoinIds];

    for (const { human, bot } of pairs) {
      const { uid, joinId, displayName } = human;
      const { playerId: botId, seatIndex } = bot;

      if (localApplied.includes(joinId)) {
        skipped.push({ uid, reason: "already_applied" });
        continue;
      }

      const pending = pendingJoins[uid];
      if (!pending || pending.status !== PENDING_JOIN_STATUS.SPECTATING) {
        skipped.push({ uid, reason: "pending_join_missing_or_not_spectating" });
        continue;
      }
      if (pending.joinId !== joinId) {
        skipped.push({ uid, reason: "pending_join_id_mismatch" });
        continue;
      }

      const queueSnap = await tx.get(matchQueueDocRef(db, uid));
      if (!queueSnap.exists) {
        skipped.push({ uid, reason: "queue_missing" });
        continue;
      }
      const queue = queueSnap.data();
      if (queue.status !== MATCH_QUEUE_STATUS.SPECTATING) {
        skipped.push({ uid, reason: "queue_not_spectating" });
        continue;
      }
      if (queue.activeJoinId !== joinId) {
        skipped.push({ uid, reason: "active_join_id_mismatch" });
        continue;
      }
      if (queue.roomId !== roomId || queue.sessionId !== sessionId || queue.sessionKey !== sessionKey) {
        skipped.push({ uid, reason: "queue_session_mismatch" });
        continue;
      }

      const humanScoreSnap = await tx.get(scoresCollection(db, roomId, sessionId).doc(uid));
      if (humanScoreSnap.exists && humanScoreSnap.data()?.spectator !== true) {
        skipped.push({ uid, reason: "already_seated" });
        continue;
      }

      const botScoreSnap = await tx.get(scoresCollection(db, roomId, sessionId).doc(botId));
      if (!botScoreSnap.exists) {
        skipped.push({ uid, reason: "fill_bot_missing" });
        continue;
      }
      const botRow = botScoreSnap.data();
      if (botRow.botRole !== BOT_ROLE.FILL) {
        skipped.push({ uid, reason: "bot_not_fill_role" });
        continue;
      }

      if (seatIndex < 0 || seatIndex >= players.length || players[seatIndex]?.playerId !== botId) {
        skipped.push({ uid, reason: "seat_mismatch" });
        continue;
      }

      let bankroll = buyIn;
      if (isMoneyEngineV1(freshSession)) {
        const allEvents = [...existingMoneyEvents, ...moneyEventsToWrite];
        const buyInResult = buildReplacementBuyIn(sessionId, joinId, uid, buyIn, allEvents);
        if (!buyInResult.invariants?.ok) {
          skipped.push({ uid, reason: "bankroll_init_unsafe" });
          continue;
        }
        bankroll = buyInResult.newBankrolls[uid] ?? buyIn;
        if (buyInResult.newEvents.length) {
          moneyEventsToWrite.push(...buyInResult.newEvents);
          moneyEventCount += buyInResult.newEvents.length;
        }
      } else {
        const legacy = buildSessionBuyInMoney(sessionId, [uid], buyIn);
        if (legacy.newEvents?.length) {
          moneyEventsToWrite.push(...legacy.newEvents);
          moneyEventCount += legacy.newEvents.length;
        }
      }

      if (bankroll <= 0) {
        skipped.push({ uid, reason: "ante_eligibility_failure" });
        continue;
      }

      tx.delete(scoresCollection(db, roomId, sessionId).doc(botId));
      tx.delete(privateHandDocRef(db, roomId, sessionId, botId));

      tx.set(
        scoresCollection(db, roomId, sessionId).doc(uid),
        {
          sessionId,
          roomId,
          playerId: uid,
          displayName,
          bankroll,
          net: deriveScoreNet(bankroll, buyIn),
          tricksWon: 0,
          handsWon: 0,
          total: 0,
          joinedAtHandCount: freshSession.handCount ?? 0,
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      players[seatIndex] = { playerId: uid, displayName };
      tableOptInIds = tableOptInIds.map((id) => (id === botId ? uid : id));

      pendingJoins[uid] = {
        ...pending,
        status: PENDING_JOIN_STATUS.SEATED,
      };

      tx.set(
        matchQueueDocRef(db, uid),
        {
          sessionKey,
          roomId,
          sessionId,
          activeJoinId: joinId,
          status: MATCH_QUEUE_STATUS.SEATED,
          seatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );

      localApplied.push(joinId);
      replacedInTx += 1;
    }

    if (replacedInTx === 0) {
      return { status: "noop", reason: "no_safe_replacements", appliedJoinIds: localApplied, replacedCount: 0 };
    }

    if (moneyEventsToWrite.length) {
      const col = moneyEventsCollection(db, roomId, sessionId);
      for (const event of moneyEventsToWrite) {
        tx.set(col.doc(event.eventId), {
          ...event,
          metadata: event.metadata || {},
          createdAt: FieldValue.serverTimestamp(),
        });
      }
    }

    const sessionUpdate = {
      players,
      pendingJoins,
      replacementPlan: {
        handCount: freshSession.handCount ?? 0,
        appliedJoinIds: localApplied,
      },
      updatedAt: FieldValue.serverTimestamp(),
    };
    if (tableOptInIds.length) {
      sessionUpdate.tableOptInIds = tableOptInIds;
    }
    if (moneyEventCount > 0) {
      sessionUpdate.moneyEngineVersion = MONEY_ENGINE_VERSION;
      sessionUpdate.moneySequence = nextMoneySequence(freshSession, moneyEventCount);
    }
    tx.update(sessionRef, sessionUpdate);

    return { status: "applied", appliedJoinIds: localApplied, replacedCount: replacedInTx };
  });

  replacedCount = txResult.replacedCount ?? 0;
  if (Array.isArray(txResult.appliedJoinIds)) {
    newlyAppliedJoinIds.push(
      ...txResult.appliedJoinIds.filter((id) => !newlyAppliedJoinIds.includes(id)),
    );
  }

  if (txResult.status === "applied" && replacedCount > 0) {
    try {
      const { rebuildPublicTableIndex } = await import("./publicTable.js");
      await rebuildPublicTableIndex(db, roomId, sessionId);
    } catch (err) {
      console.warn("[public-table-replacement] index rebuild deferred", err?.message ?? err);
    }
  }

  return {
    status: txResult.status,
    reason: txResult.reason ?? null,
    replacedCount,
    appliedJoinIds: txResult.appliedJoinIds ?? newlyAppliedJoinIds,
    skipped,
  };
}
