/**
 * Bankroll + settlement — emulator E2E (authoritative Firestore assertions).
 *
 * Hybrid boundary (documented):
 * - Win case: server seed (host + bot_1) + browser table flow; callable gameSubmitDraw when draw
 *   presentation gates hide hero controls after server-side bot draw; gameAdvanceBots for bot tricks.
 * - Settlement runs via finalizeHandFromCardPlay → handleRecordHand (money engine v1).
 * - Bourré case uses server seed (live-emulator-settlement-trace fixture) + gameRecordHand callable;
 *   browser provides authenticated session only (5-trick bourré not deterministic in UI today).
 *
 * Requires:
 *   npm run emulators
 *   PLAYWRIGHT_EMULATORS=1 npx playwright test e2e/bankroll-settlement.emulator.spec.ts
 */
import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertChipConservation,
  assertEmulatorSuiteReady,
  attachFailureDiagnostics,
  BUY_IN,
  callCallableFromPage,
  emulatorCleanup,
  formatDiagnostics,
  HAND_ANTE,
  isHandSettled,
  potFromSession,
  readAuthoritativeState,
  sumPostedAntes,
  sumTricks,
  type AuthoritativeState,
  advanceToPlayPhase,
  advancePlayTurnViaCallable,
  bourreIdsFromFunding,
  waitForPlayButtonEnabled,
} from "./helpers/bankrollSettlementEmulator";
import {
  goToTable,
  signUpHost,
  waitForDrawPhase,
} from "./helpers/roomFlow";
import { tapPlayCard } from "./helpers/cardPlay";

const useEmulators = process.env.PLAYWRIGHT_EMULATORS === "1";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function tableOverlay(page: Page) {
  return page.locator("#table-play-overlay");
}

async function expectWithDiagnostics(
  page: Page,
  state: AuthoritativeState,
  testInfo: import("@playwright/test").TestInfo,
  assertion: () => void | Promise<void>,
) {
  try {
    await assertion();
  } catch (err) {
    await attachFailureDiagnostics(page, state, testInfo);
    throw err;
  }
}

async function tryHeroPlayCard(page: Page): Promise<boolean> {
  const overlay = tableOverlay(page);
  const selectors = [
    '[data-testid="hero-hand"] [data-testid="play-button"]',
    '[data-testid="hero-hand"] [data-playable="true"]',
    '[data-testid="hero-hand"] button[data-card-index]',
  ];
  for (const selector of selectors) {
    const card = overlay.locator(selector).first();
    if (!(await card.isVisible().catch(() => false))) continue;
    if (!(await card.isEnabled().catch(() => false))) continue;
    await tapPlayCard(page, card, { useTouch: false });
    return true;
  }
  return false;
}

/** Re-open table after callable draw so presentation catches up with authoritative hand state. */
async function resyncTableAfterCallableDraw(page: Page, roomLabel: string) {
  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.locator("#app-version")).toBeVisible({ timeout: 30_000 });
  await page.goto("/#rooms");
  await expect(page.getByText(roomLabel)).toBeVisible({ timeout: 15_000 });
  await page.getByText(roomLabel).click();
  await goToTable(page);
  const overlay = tableOverlay(page);
  await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });
  await expect
    .poll(
      async () =>
        overlay.locator('[data-testid="hero-hand"] [data-testid="play-button"]').first().isVisible().catch(
          () => false,
        ),
      { timeout: 90_000 },
    )
    .toBe(true);
}

/**
 * Complete trick play: one browser play, then authoritative callable advancement.
 */
async function advanceBotsUntilSettled(
  page: Page,
  roomId: string,
  sessionId: string,
  hostUid: string,
  options: { allowHeroPlay?: boolean; initialHeroPlayed?: boolean } = {},
) {
  const deadline = Date.now() + 120_000;
  let heroPlayed =
    options.initialHeroPlayed ?? (options.allowHeroPlay ? false : true);

  while (Date.now() < deadline) {
    const state = await readAuthoritativeState(page, roomId, sessionId, hostUid);
    if (isHandSettled(state.session)) return state;

    const tricks = sumTricks(state.session?.currentHand?.tricksByPlayer);
    const phase = state.session?.currentHand?.phase;
    const turn = state.session?.currentHand?.turnPlayerId ?? null;
    if (phase === "play" && tricks >= 5) {
      await callCallableFromPage(page, "gameAdvanceBots", { roomId, sessionId });
      await page.waitForTimeout(500);
      const after = await readAuthoritativeState(page, roomId, sessionId, hostUid);
      if (isHandSettled(after.session)) return after;
    }

    if (!heroPlayed && options.allowHeroPlay && (await tryHeroPlayCard(page))) {
      heroPlayed = true;
      await page.waitForTimeout(600);
      continue;
    }

    await callCallableFromPage(page, "gameAdvanceBots", { roomId, sessionId });
    await page.waitForTimeout(300);

    const afterBots = await readAuthoritativeState(page, roomId, sessionId, hostUid);
    if (isHandSettled(afterBots.session)) return afterBots;

    const tricksAfter = sumTricks(afterBots.session?.currentHand?.tricksByPlayer);
    const phaseAfter = afterBots.session?.currentHand?.phase;
    const turnAfter = afterBots.session?.currentHand?.turnPlayerId ?? null;

    if (phaseAfter === "play" && tricksAfter < 5 && turnAfter) {
      await advancePlayTurnViaCallable(page, roomId, sessionId, turnAfter);
      await page.waitForTimeout(300);
    }
  }

  const finalState = await readAuthoritativeState(page, roomId, sessionId, hostUid);
  throw new Error(
    `Hand did not settle within deadline.\n${formatDiagnostics(finalState)}`,
  );
}

function runWinSeed(hostUid: string) {
  return JSON.parse(
    execFileSync("node", ["e2eBankrollWinSeed.mjs", hostUid], {
      cwd: resolve(repoRoot, "functions"),
      env: {
        ...process.env,
        FIRESTORE_EMULATOR_HOST: "127.0.0.1:8088",
      },
      encoding: "utf8",
    }),
  ) as {
    roomId: string;
    sessionId: string;
    hostUid: string;
    botId: string;
    expected: { buyIn: number; ante: number };
  };
}

function runBourreSeed(hostUid: string) {
  return JSON.parse(
    execFileSync("node", ["e2eBankrollSettlementSeed.mjs", hostUid], {
      cwd: resolve(repoRoot, "functions"),
      env: {
        ...process.env,
        FIRESTORE_EMULATOR_HOST: "127.0.0.1:8088",
      },
      encoding: "utf8",
    }),
  ) as {
    roomId: string;
    sessionId: string;
    ids: { HOST: string; P2: string; P3: string; P4: string };
    tricksByPlayer: Record<string, number>;
    participantIds: string[];
    expected: {
      buyIn: number;
      ante: number;
      carryIn: number;
      settledPot: number;
      bourrePlayerId: string;
      foldedPlayerId: string;
      nextDealPosted: Record<string, number>;
    };
  };
}

test.describe("Bankroll settlement — emulator E2E", () => {
  test.skip(!useEmulators, "Set PLAYWRIGHT_EMULATORS=1 with npm run emulators running");
  test.setTimeout(360_000);

  test.beforeAll(async () => {
    await assertEmulatorSuiteReady();
  });

  test.beforeEach(async ({ request }) => {
    await emulatorCleanup(request);
  });

  test("[emulator] clean win hand — browser action + authoritative settlement", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    await signUpHost(page, "Bankroll Host");
    const hostUid = await page.evaluate(async () => {
      const { FIREBASE_SDK_VERSION } = await import("./firebase-config.js");
      const { getApps } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app.js`
      );
      const { getAuth } = await import(
        `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-auth.js`
      );
      const app = getApps()[0];
      if (!app) return null;
      await getAuth(app).authStateReady();
      return getAuth(app).currentUser?.uid ?? null;
    });
    expect(hostUid).toBeTruthy();

    const seed = runWinSeed(hostUid!);
    const { roomId, sessionId, botId } = seed;

    await page.goto("/#rooms");
    await expect(page.getByText("Bankroll Win E2E")).toBeVisible({ timeout: 15_000 });
    await page.getByText("Bankroll Win E2E").click();
    await expect(page.getByTestId("game-setup-panel")).toBeVisible({ timeout: 30_000 });
    await waitForPlayButtonEnabled(page);

    const playerIds = [hostUid!, botId];
    const beforeTableState = await readAuthoritativeState(page, roomId, sessionId, hostUid!);
    for (const pid of playerIds) {
      expect(beforeTableState.scoreById[pid]?.bankroll).toBe(BUY_IN);
    }

    await goToTable(page);

    const overlay = tableOverlay(page);
    await expect(overlay.getByTestId("table-root")).toBeVisible({ timeout: 30_000 });

    await waitForDrawPhase(page);

    const afterAnteState = await readAuthoritativeState(page, roomId, sessionId, hostUid);
    await expectWithDiagnostics(page, afterAnteState, testInfo, async () => {
      const posted = afterAnteState.session?.currentHand?.postedAntes ?? {};
      expect(sumPostedAntes(posted)).toBe(HAND_ANTE * 2);
      for (const pid of playerIds) {
        expect(posted[pid]).toBe(HAND_ANTE);
        expect(afterAnteState.scoreById[pid]?.bankroll).toBe(BUY_IN - HAND_ANTE);
      }
      expect(potFromSession(afterAnteState.session)).toBe(HAND_ANTE * 2);
      await assertChipConservation(page, afterAnteState, "after-ante", playerIds);
    });

    const playPhaseState = await advanceToPlayPhase(page, roomId, sessionId, hostUid!);
    await expectWithDiagnostics(page, playPhaseState, testInfo, async () => {
      expect(playPhaseState.session?.currentHand?.phase).toBe("play");
      const drawCounts = playPhaseState.session?.currentHand?.drawDiscardCountsByPlayer ?? {};
      if (drawCounts[botId] != null) {
        expect(drawCounts[botId]).toBeGreaterThanOrEqual(0);
      }
      await assertChipConservation(page, playPhaseState, "after-draw", playerIds);
    });

    await resyncTableAfterCallableDraw(page, "Bankroll Win E2E");
    const heroBrowserPlayed = await tryHeroPlayCard(page);

    const settledState = await advanceBotsUntilSettled(page, roomId, sessionId, hostUid, {
      allowHeroPlay: true,
      initialHeroPlayed: heroBrowserPlayed,
    });

    await expectWithDiagnostics(page, settledState, testInfo, async () => {
      expect(settledState.session?.handCount).toBe(1);
      expect(settledState.handLedgerCount).toBe(1);
      expect(settledState.settlementEventCount).toBeGreaterThanOrEqual(1);
      expect(settledState.session?.nextDealFunding).toBeTruthy();

      const hostBankroll = settledState.scoreById[hostUid]?.bankroll ?? 0;
      const botId = playerIds.find((id) => id !== hostUid)!;
      const botBankroll = settledState.scoreById[botId]?.bankroll ?? 0;
      const pot = HAND_ANTE * 2;
      const postAnteBankroll = BUY_IN - HAND_ANTE;
      const sortedBankrolls = [hostBankroll, botBankroll].sort((a, b) => b - a);
      expect(sortedBankrolls[0]).toBe(postAnteBankroll + pot);
      expect(sortedBankrolls[1]).toBe(postAnteBankroll);
      expect(hostBankroll + botBankroll).toBe(BUY_IN * 2);
      expect(settledState.session?.carryOverPot ?? 0).toBe(0);

      await assertChipConservation(page, settledState, "after-settlement", playerIds);
    });

    const snapshot = {
      bankrolls: { ...settledState.scoreById },
      carryOverPot: settledState.session?.carryOverPot ?? 0,
      nextDealFunding: settledState.session?.nextDealFunding,
      moneyEventCount: settledState.moneyEventCount,
      settlementEventCount: settledState.settlementEventCount,
      handLedgerCount: settledState.handLedgerCount,
      handCount: settledState.session?.handCount,
    };

    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 30_000 });

    const afterReload = await readAuthoritativeState(page, roomId, sessionId, hostUid);
    await expectWithDiagnostics(page, afterReload, testInfo, async () => {
      expect(afterReload.scoreById[hostUid]?.bankroll).toBe(
        snapshot.bankrolls[hostUid]?.bankroll,
      );
      expect(afterReload.session?.carryOverPot).toBe(snapshot.carryOverPot);
      expect(afterReload.moneyEventCount).toBe(snapshot.moneyEventCount);
      expect(afterReload.settlementEventCount).toBe(snapshot.settlementEventCount);
      expect(afterReload.handLedgerCount).toBe(snapshot.handLedgerCount);
      expect(afterReload.session?.handCount).toBe(snapshot.handCount);
    });

    const opponentId = playerIds.find((id) => id !== hostUid)!;
    const duplicate = await callCallableFromPage(page, "gameRecordHand", {
      roomId,
      sessionId,
      winnerIds: [hostUid],
      participantIds: playerIds,
      settlement: "win",
      recordedBy: hostUid,
      tricksByPlayer: { [hostUid]: 3, [opponentId]: 2 },
    });
    expect(duplicate.ok).toBe(false);
    expect(duplicate.error ?? "").toMatch(
      /not ready|blocked|settle|complete|cleared|internal|failed|hand/i,
    );

    const afterDuplicate = await readAuthoritativeState(page, roomId, sessionId, hostUid);
    expect(afterDuplicate.moneyEventCount).toBe(snapshot.moneyEventCount);
    expect(afterDuplicate.scoreById[hostUid]?.bankroll).toBe(
      snapshot.bankrolls[hostUid]?.bankroll,
    );

    const enroll = await callCallableFromPage(page, "gameEnsureHandEnrollment", {
      roomId,
      sessionId,
    });
    expect(enroll.ok).toBe(true);

    const afterNextDeal = await readAuthoritativeState(page, roomId, sessionId, hostUid);
    await expectWithDiagnostics(page, afterNextDeal, testInfo, async () => {
      const posted = afterNextDeal.session?.currentHand?.postedAntes ?? {};
      const settledHost = snapshot.bankrolls[hostUid]?.bankroll ?? 0;
      const settledBot = snapshot.bankrolls[botId]?.bankroll ?? 0;
      const hostPosted = posted[hostUid] ?? 0;
      const botPosted = posted[botId] ?? 0;
      expect(hostPosted).toBeGreaterThan(0);
      expect(botPosted).toBeGreaterThan(0);
      expect(sumPostedAntes(posted)).toBe(hostPosted + botPosted);
      expect(afterNextDeal.scoreById[hostUid]?.bankroll).toBe(settledHost - hostPosted);
      expect(afterNextDeal.scoreById[botId]?.bankroll).toBe(settledBot - botPosted);
      await assertChipConservation(page, afterNextDeal, "next-deal-ante", playerIds);
    });
  });

  test("[emulator hybrid] bourré settlement — server seed + authoritative Firestore", async ({
    page,
  }, testInfo) => {
    await page.goto("/");
    await expect(page.locator("#app-version")).toBeVisible({ timeout: 15_000 });
    await signUpHost(page, "Bourre Host");
    const hostUid = await page.evaluate(async () => {
      const { currentUser } = await import("./auth.js");
      return currentUser()?.uid ?? null;
    });
    expect(hostUid).toBeTruthy();

    const seed = runBourreSeed(hostUid!);
    const { roomId, sessionId, ids, tricksByPlayer, participantIds, expected } = seed;

    const record = await callCallableFromPage(page, "gameRecordHand", {
      roomId,
      sessionId,
      winnerIds: [ids.HOST],
      participantIds,
      settlement: "win",
      recordedBy: ids.HOST,
      tricksByPlayer,
    });
    expect(record.ok, record.ok ? "" : (record as { error: string }).error).toBe(true);

    let settledState = await readAuthoritativeState(page, roomId, sessionId, hostUid!);
    await expectWithDiagnostics(page, settledState, testInfo, async () => {
      expect(settledState.session?.handCount).toBe(1);
      expect(settledState.handLedgerCount).toBe(1);
      expect(settledState.settlementEventCount).toBeGreaterThanOrEqual(1);
      const bourreIds = bourreIdsFromFunding(settledState.session?.nextDealFunding);
      expect(
        bourreIds.includes(expected.bourrePlayerId) ||
          settledState.handLedger?.bourreIds?.includes(expected.bourrePlayerId),
      ).toBe(true);
      expect(settledState.scoreById[expected.bourrePlayerId]?.skipNextAnte).toBe(true);
      expect(settledState.session?.carryOverPot ?? 0).toBe(0);
      await assertChipConservation(
        page,
        settledState,
        "bourre-after-settlement",
        Object.keys(settledState.scoreById),
      );
    });

    const snapshot = {
      moneyEventCount: settledState.moneyEventCount,
      settlementEventCount: settledState.settlementEventCount,
      bankrolls: Object.fromEntries(
        Object.entries(settledState.scoreById).map(([pid, row]) => [pid, row.bankroll]),
      ),
      nextDealFunding: settledState.session?.nextDealFunding,
    };

    const duplicate = await callCallableFromPage(page, "gameRecordHand", {
      roomId,
      sessionId,
      winnerIds: [ids.HOST],
      participantIds,
      settlement: "win",
      recordedBy: ids.HOST,
      tricksByPlayer,
    });
    expect(duplicate.ok).toBe(false);

    const enroll = await callCallableFromPage(page, "gameEnsureHandEnrollment", {
      roomId,
      sessionId,
    });
    expect(enroll.ok).toBe(true);

    const nextDealPreview = await page.evaluate(
      async ({ scoreById, nextDealFunding, carryOverPot, participantIds, ante, buyIn }) => {
        const { mergeNextDealFundingIntoScoreById, collectFundingForHandStart } = await import(
          "./money-persistence.js"
        );
        const merged = mergeNextDealFundingIntoScoreById(scoreById, nextDealFunding);
        const collected = collectFundingForHandStart({
          carryOverPot,
          participantIds,
          scoreById: merged,
          sessionStake: ante,
          buyInFallback: buyIn,
        });
        return collected.postedAntes;
      },
      {
        scoreById: settledState.scoreById,
        nextDealFunding: settledState.session?.nextDealFunding,
        carryOverPot: settledState.session?.carryOverPot ?? 0,
        participantIds: Object.keys(settledState.scoreById),
        ante: expected.ante,
        buyIn: expected.buyIn,
      },
    );

    const bourrePosted = nextDealPreview[expected.bourrePlayerId];
    expect(bourrePosted).not.toBe(expected.ante);
    expect([0, expected.settledPot].includes(bourrePosted)).toBe(true);
    expect(nextDealPreview[expected.foldedPlayerId]).toBe(expected.ante);
    expect(nextDealPreview[ids.HOST]).toBe(expected.ante);
    expect(nextDealPreview[ids.P2]).toBe(expected.ante);
  });
});
