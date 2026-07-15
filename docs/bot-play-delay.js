//#region src/session/botActionTiming.ts
var e = 250, t = 700, n = 100, r = 300, i = 150;
function a({ handNumber: e, trickNumber: t, turnPlayerId: n }) {
	return `${e ?? 0}:${t ?? 0}:${n ?? ""}`;
}
function o(e, t) {
	return `ante:${e}:${t}`;
}
function s(e, t, n = Math.random) {
	let r = t - e + 1;
	return e + Math.floor(n() * r);
}
function c(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = Math.imul(31, t) + e.charCodeAt(n) >>> 0;
	return t === 0 && (t = 2654435769), () => (t = Math.imul(1664525, t) + 1013904223 >>> 0, t / 4294967295);
}
function l(e, t = Math.random) {
	let n = e === 1;
	return {
		chosenDelayMs: n ? s(100, 300, t) : s(250, 700, t),
		isLastCard: n,
		remainingHandCount: e ?? null
	};
}
function u(e, t) {
	return `${e}:r${t ?? "?"}`;
}
function d(e = {}) {
	let t = e.rng ?? Math.random, n = null, r = null, i = 0, s = /* @__PURE__ */ new Map();
	function c(e) {
		n !== e && (n = e, r = null, i = 0, s.clear());
	}
	function d(e) {
		c(e.handNumber);
		let t = a(e);
		return r !== t && (r = t, i = e.nowMs), t;
	}
	function f(e, n) {
		let r = u(e, n), i = s.get(r), a = null;
		return i ?? (a = l(n, t), i = a.chosenDelayMs, s.set(r, i)), a ||= {
			chosenDelayMs: i,
			isLastCard: n === 1,
			remainingHandCount: n ?? null
		}, a;
	}
	function p(e) {
		c(e.handNumber);
		let t = d({
			handNumber: e.handNumber,
			trickNumber: e.trickNumber,
			turnPlayerId: e.turnPlayerId,
			nowMs: e.nowMs
		}), n = f(t, e.remainingHandCount), r = n.chosenDelayMs, a = e.nowMs - i;
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
	function m(e, n) {
		c(e);
		let r = u(o(e, n), 5), i = s.get(r);
		return i ?? (i = l(5, t).chosenDelayMs, s.set(r, i)), i;
	}
	return {
		syncHand: c,
		markTurnEligible: d,
		resolvePlayDelayMs: p,
		resolveAntePostDelayMs: m,
		delayByTurnKey: s
	};
}
function f(e) {
	if (e.handPhase === "play") return {
		...e.playDelayState.resolvePlayDelayMs({
			handNumber: e.ctx.handNumber,
			trickNumber: e.ctx.trickNumber,
			turnPlayerId: e.ctx.turnPlayerId,
			remainingHandCount: e.ctx.remainingHandCount,
			nowMs: e.nowMs
		}),
		handPhase: "play"
	};
	if (e.handPhase === "ante") {
		let t = o(e.ctx.handNumber, e.ctx.turnPlayerId ?? ""), n = e.playDelayState.resolveAntePostDelayMs(e.ctx.handNumber, e.ctx.turnPlayerId ?? "");
		return {
			handPhase: "ante",
			turnKey: t,
			chosenDelayMs: n,
			elapsedSinceTurnMs: 0,
			trickGapRemainingMs: 0,
			delayMs: n,
			remainingHandCount: 5,
			isLastCard: !1
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
var p = /* @__PURE__ */ new Map();
function m(e, t, n) {
	return `${e}:${t.join(",")}:${n ? "rm" : "full"}`;
}
function h(e) {
	let t = e.reducedMotion ?? !1, n = m(e.handNumber, e.playerIds, t), r = p.get(n);
	if (r) return r;
	let i = t ? .35 : 1, a = e.travelMs ?? Math.round(220 * i), o = e.settleMs ?? Math.round(80 * i), s = d({ rng: e.rng ?? c(n) }), l = e.playerIds.map((t) => {
		let n = s.resolveAntePostDelayMs(e.handNumber, t);
		return Math.round(n * i);
	}), u = l.reduce((e, t) => e + t, 0), f = u + e.playerIds.length * a + (e.playerIds.length > 0 ? o : 0), h = {
		handNumber: e.handNumber,
		playerIds: [...e.playerIds],
		thinkBeforeMs: l,
		totalThinkMs: u,
		travelMs: a,
		settleMs: o,
		totalDurationMs: f
	};
	return p.set(n, h), h;
}
function g(e, t = !1, n = 220) {
	let r = Math.max(1, e), i = t ? .35 : 1, a = Math.round(n * i), o = Math.round(80 * i);
	return r * Math.round(700 * i) + r * a + o;
}
function _(e, t, n = !1, r = 220) {
	return t.length < 1 ? g(1, n, r) : h({
		handNumber: e,
		playerIds: t,
		reducedMotion: n,
		travelMs: r
	}).totalDurationMs;
}
function v() {
	p.clear();
}
function y(e = {}) {
	let t = d(e), n = null, r = 0, i = null, o = null;
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
export { i as BOT_ADVANCE_DEBOUNCE_MS, t as BOT_PLAY_DELAY_MAX_MS, e as BOT_PLAY_DELAY_MIN_MS, r as BOT_PLAY_LAST_CARD_MAX_MS, n as BOT_PLAY_LAST_CARD_MIN_MS, o as antePostTurnKey, _ as antePresentationDurationMs, g as antePresentationWorstCaseDurationMs, a as botPlayTurnKey, h as buildAnteCoinDelayPlan, v as clearAntePlanCacheForTests, d as createBotPlayDelayState, y as createBotThinkScheduleState, c as createSeededRng, l as pickBotPlayDelayMs, s as randomIntInclusive, f as resolveBotAdvanceDelayMs };
