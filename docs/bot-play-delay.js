//#region src/session/botActionTiming.ts
var e = 250, t = 700, n = 100, r = 300, i = 150;
function a({ handNumber: e, trickNumber: t, turnPlayerId: n }) {
	return `${e ?? 0}:${t ?? 0}:${n ?? ""}`;
}
function o(e) {
	return e === "play" || e === "ante" || e === "reveal";
}
function s(e, t) {
	return e === "play" ? {
		handNumber: t.handNumber,
		trickNumber: t.trickNumber,
		turnPlayerId: t.turnPlayerId,
		remainingHandCount: t.remainingHandCount,
		nowMs: 0
	} : {
		handNumber: t.handNumber,
		trickNumber: 0,
		turnPlayerId: t.turnPlayerId,
		remainingHandCount: t.remainingHandCount ?? 5,
		nowMs: 0
	};
}
function c(e, t, n = Math.random) {
	let r = t - e + 1;
	return e + Math.floor(n() * r);
}
function l(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = Math.imul(31, t) + e.charCodeAt(n) >>> 0;
	return t === 0 && (t = 2654435769), () => (t = Math.imul(1664525, t) + 1013904223 >>> 0, t / 4294967295);
}
function u(e, t = Math.random) {
	let n = e === 1;
	return {
		chosenDelayMs: n ? c(100, 300, t) : c(250, 700, t),
		isLastCard: n,
		remainingHandCount: e ?? null
	};
}
function d(e, t) {
	return `${e}:r${t ?? "?"}`;
}
function f(e = {}) {
	let t = e.rng ?? Math.random, n = null, r = null, i = 0, o = /* @__PURE__ */ new Map();
	function s(e) {
		n !== e && (n = e, r = null, i = 0, o.clear());
	}
	function c(e) {
		s(e.handNumber);
		let t = a(e);
		return r !== t && (r = t, i = e.nowMs), t;
	}
	function l(e, n) {
		let r = d(e, n), i = o.get(r), a = null;
		return i ?? (a = u(n, t), i = a.chosenDelayMs, o.set(r, i)), a ||= {
			chosenDelayMs: i,
			isLastCard: n === 1,
			remainingHandCount: n ?? null
		}, a;
	}
	function f(e) {
		s(e.handNumber);
		let t = c({
			handNumber: e.handNumber,
			trickNumber: e.trickNumber,
			turnPlayerId: e.turnPlayerId,
			nowMs: e.nowMs
		}), n = l(t, e.remainingHandCount), r = n.chosenDelayMs, a = e.nowMs - i;
		return {
			turnKey: t,
			chosenDelayMs: r,
			elapsedSinceTurnMs: a,
			trickGapRemainingMs: 0,
			delayMs: Math.max(0, r - a),
			remainingHandCount: n.remainingHandCount,
			isLastCard: n.isLastCard
		};
	}
	return {
		syncHand: s,
		markTurnEligible: c,
		resolvePlayDelayMs: f,
		delayByTurnKey: o
	};
}
function p(e) {
	if (o(e.handPhase)) {
		let t = s(e.handPhase, e.ctx);
		return {
			...e.playDelayState.resolvePlayDelayMs({
				...t,
				nowMs: e.nowMs
			}),
			handPhase: e.handPhase ?? null
		};
	}
	return {
		handPhase: e.handPhase ?? null,
		turnKey: null,
		chosenDelayMs: 150,
		elapsedSinceTurnMs: 0,
		trickGapRemainingMs: 0,
		delayMs: 150,
		remainingHandCount: null,
		isLastCard: !1
	};
}
var m = /* @__PURE__ */ new Map();
function h(e, t, n) {
	return `${e}:${t.join(",")}:${n ? "rm" : "full"}`;
}
function g(e) {
	let t = e.reducedMotion ?? !1, n = h(e.handNumber, e.playerIds, t), r = m.get(n);
	if (r) return r;
	let i = t ? .35 : 1, a = e.travelMs ?? Math.round(220 * i), o = e.settleMs ?? Math.round(80 * i), s = f({ rng: e.rng ?? l(n) }), c = e.playerIds.map((t) => {
		let n = s.resolvePlayDelayMs({
			handNumber: e.handNumber,
			trickNumber: 0,
			turnPlayerId: t,
			remainingHandCount: 5,
			nowMs: 0
		}).chosenDelayMs;
		return Math.round(n * i);
	}), u = c.reduce((e, t) => e + t, 0), d = u + e.playerIds.length * a + (e.playerIds.length > 0 ? o : 0), p = {
		handNumber: e.handNumber,
		playerIds: [...e.playerIds],
		thinkBeforeMs: c,
		totalThinkMs: u,
		travelMs: a,
		settleMs: o,
		totalDurationMs: d
	};
	return m.set(n, p), p;
}
function _(e, t = !1) {
	return Math.max(1, e) * Math.round(700 * (t ? .35 : 1));
}
function v(e, t = !1, n = 220) {
	let r = Math.max(1, e), i = t ? .35 : 1, a = Math.round(n * i), o = Math.round(80 * i);
	return r * Math.round(700 * i) + r * a + o;
}
function y(e, t, n = !1, r = 220) {
	return t.length < 1 ? _(1, n) : g({
		handNumber: e,
		playerIds: t,
		reducedMotion: n,
		travelMs: r
	}).totalThinkMs;
}
function b(e, t, n = !1, r = 220) {
	return t.length < 1 ? v(1, n, r) : g({
		handNumber: e,
		playerIds: t,
		reducedMotion: n,
		travelMs: r
	}).totalDurationMs;
}
function x(e, t, n = !1, r = 220) {
	return y(e, t, n, r);
}
function S() {
	m.clear();
}
function C(e = {}) {
	let t = f(e), n = null, r = 0, i = null, o = null;
	function s() {
		n &&= (clearTimeout(n), null);
	}
	function c({ reason: e = "canceled", onCanceled: t } = {}) {
		if (!n && !i) return !1;
		r += 1;
		let a = {
			reason: e,
			turnKey: i,
			generation: r,
			chosenDelayMs: o
		};
		return s(), i = null, o = null, t?.(a), !0;
	}
	function l({ ctx: e, nowMs: s, shouldFire: l, onFire: u, log: d }) {
		let f = a(e);
		if (n && i === f) return d?.coalesced?.({
			turnKey: f,
			generation: r,
			chosenDelayMs: o,
			remainingHandCount: e.remainingHandCount ?? null
		}), {
			action: "coalesced",
			turnKey: f,
			generation: r,
			chosenDelayMs: o ?? 0,
			elapsedSinceTurnMs: 0,
			trickGapRemainingMs: 0,
			delayMs: 0,
			remainingHandCount: e.remainingHandCount ?? null,
			isLastCard: e.remainingHandCount === 1
		};
		(n || i) && c({
			reason: "superseded",
			onCanceled: (e) => d?.canceled?.({
				...e,
				trigger: "superseded"
			})
		});
		let p = t.resolvePlayDelayMs({
			handNumber: e.handNumber,
			trickNumber: e.trickNumber,
			turnPlayerId: e.turnPlayerId,
			remainingHandCount: e.remainingHandCount,
			nowMs: s
		}), m = r;
		return i = f, o = p.chosenDelayMs, d?.delayChosen?.({
			turnKey: f,
			generation: m,
			chosenDelayMs: p.chosenDelayMs,
			delayMs: p.delayMs,
			remainingHandCount: p.remainingHandCount,
			isLastCard: p.isLastCard,
			handPhase: "play"
		}), d?.armed?.({
			turnKey: f,
			generation: m,
			chosenDelayMs: p.chosenDelayMs,
			delayMs: p.delayMs,
			elapsedSinceTurnMs: p.elapsedSinceTurnMs,
			remainingHandCount: p.remainingHandCount,
			isLastCard: p.isLastCard,
			handPhase: "play"
		}), n = setTimeout(() => {
			if (n = null, m === r && i === f) {
				if (i = null, o = null, !l()) {
					d?.rejected?.({
						turnKey: f,
						generation: m,
						chosenDelayMs: p.chosenDelayMs,
						remainingHandCount: p.remainingHandCount,
						isLastCard: p.isLastCard,
						handPhase: "play"
					});
					return;
				}
				d?.accepted?.({
					turnKey: f,
					generation: m,
					chosenDelayMs: p.chosenDelayMs,
					delayMs: p.delayMs,
					remainingHandCount: p.remainingHandCount,
					isLastCard: p.isLastCard,
					handPhase: "play"
				}), u({
					turnKey: f,
					generation: m,
					plan: p
				});
			}
		}, p.delayMs), {
			action: "armed",
			generation: m,
			turnKey: f,
			chosenDelayMs: p.chosenDelayMs,
			elapsedSinceTurnMs: p.elapsedSinceTurnMs,
			trickGapRemainingMs: p.trickGapRemainingMs,
			delayMs: p.delayMs,
			remainingHandCount: p.remainingHandCount,
			isLastCard: p.isLastCard
		};
	}
	return {
		playDelayState: t,
		armPlayThink: l,
		cancelPending: c,
		get pendingTurnKey() {
			return i;
		},
		get generation() {
			return r;
		}
	};
}
//#endregion
export { i as BOT_ADVANCE_DEBOUNCE_MS, t as BOT_PLAY_DELAY_MAX_MS, e as BOT_PLAY_DELAY_MIN_MS, r as BOT_PLAY_LAST_CARD_MAX_MS, n as BOT_PLAY_LAST_CARD_MIN_MS, x as antePresentationDurationMs, v as antePresentationWorstCaseDurationMs, y as anteThinkDurationMs, _ as anteThinkWorstCaseDurationMs, b as anteVisualPresentationDurationMs, a as botPlayTurnKey, s as botThinkContextForPhase, g as buildAnteCoinDelayPlan, S as clearAntePlanCacheForTests, f as createBotPlayDelayState, C as createBotThinkScheduleState, l as createSeededRng, o as isBotPlayThinkPhase, u as pickBotPlayDelayMs, c as randomIntInclusive, p as resolveBotAdvanceDelayMs };
