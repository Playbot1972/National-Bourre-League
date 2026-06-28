//#region src/game/money/types.ts
var e = "v1", t = 20, n = 1, r = {
	buyInAmount: 100,
	anteAmount: 1,
	limEnabled: !1,
	rebuyEnabled: !1,
	splitPotEnabled: !1
};
function i(e = {}) {
	let t = e.buyInAmount != null, n = Math.max(1, Number(t ? e.buyInAmount : e.anteAmount ?? e.handStake) || 1), r = t ? Math.max(.01, Number(e.anteAmount ?? 1) || 1) : 1;
	return {
		buyInAmount: n,
		anteAmount: r,
		potCap: r * 20,
		limEnabled: e.limEnabled === !0,
		rebuyEnabled: e.rebuyEnabled === !0,
		splitPotEnabled: e.splitPotEnabled === !0
	};
}
function a(e) {
	return i(e).splitPotEnabled === !0;
}
function o(e, t) {
	let n = e?.buyInAmount;
	return n != null && Number(n) > 0 ? Math.max(1, Number(n) || 1) : i(t).buyInAmount;
}
function s(e, { carryOverPot: t = 0, postedAntes: n = {}, buyInFallback: r = 0 } = {}) {
	let i = Object.values(e || {}).reduce((e, t) => e + h(t, r), 0), a = Object.values(n || {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
	return i + Math.max(0, Number(t) || 0) + a;
}
function c({ anteAmount: e, limEnabled: t = !1, carryIn: n = 0, antePot: r }) {
	let i = t === !0, a = Math.max(.01, Number(e) || 1), o = a * 20, s = Math.max(0, Number(r) || 0) + Math.max(0, Number(n) || 0), c = i ? Math.min(s, o) : s;
	return {
		anteAmount: a,
		limEnabled: i,
		potCap: o,
		currentPot: s,
		maxWinThisHand: c,
		winnerTake: c,
		bourrePenalty: c,
		overflow: i ? Math.max(0, s - o) : 0
	};
}
var l = 5;
function u(e, t) {
	return (t || []).reduce((t, n) => t + (e?.[n] ?? 0), 0);
}
function d(e, t) {
	return u(e, t) >= 5;
}
function f(e, t) {
	return !e || !t?.length || !d(e, t) ? [] : t.filter((t) => (e[t] ?? 0) === 0);
}
function p({ mode: e, winners: t, participants: n, tricksByPlayer: r, anteAmount: i, limEnabled: a = !1, carryIn: o = 0, stakeForPlayer: s, antePot: l }) {
	let u = a === !0, d = c({
		anteAmount: i,
		limEnabled: u,
		carryIn: o,
		antePot: l ?? n.reduce((e, t) => e + s(t), 0)
	}), { currentPot: p, winnerTake: m, bourrePenalty: h, overflow: g } = d, _ = f(r, n), v = _.length * h, y = {}, b = 0;
	if (e === "push" || e === "non_winner_ante_up" || e === "co_win_carry") b = p + v, n.forEach((e) => {
		let t = s(e), n = _.includes(e) ? h : 0;
		y[e] = -t - n;
	}), u && (b = g + p + v);
	else if (e === "split") {
		let e = m / t.length;
		n.forEach((n) => {
			let r = s(n), i = _.includes(n) ? h : 0;
			t.includes(n) ? y[n] = e - r - i : y[n] = -r - i;
		}), b = (u ? g : 0) + v;
	} else {
		let e = t[0];
		n.forEach((t) => {
			let n = s(t);
			t === e ? y[t] = m - n : _.includes(t) ? y[t] = -h - n : y[t] = -n;
		}), b = (u ? g : 0) + v;
	}
	return {
		deltas: y,
		carryOverPot: b,
		bourreIds: _,
		bourreMatch: v,
		potState: d,
		pot: p,
		cappedPot: m,
		overflow: g
	};
}
function m(e, t = 0) {
	let n = Math.max(0, Number(t) || 0);
	return Math.max(0, Number(e) || 0) - n;
}
function h(e, t = 0) {
	if (e?.bankroll != null && Number.isFinite(Number(e.bankroll))) return Math.max(0, Number(e.bankroll));
	let n = Math.max(0, Number(t) || 0), r = Number(e?.net) || 0;
	return n > 0 ? Math.max(0, n + r) : Math.max(0, r);
}
function g(e, t) {
	let n = Number(e?.bourreReplacementDue);
	if (Number.isFinite(n) && n > 0) return n;
	if (e?.skipNextAnte) return 0;
	let r = e?.perHandStake ?? t;
	return Math.max(.01, Number(r) || t);
}
function _(e, t, n, r = {}) {
	return (t || []).reduce((t, i) => {
		if (r != null && Object.prototype.hasOwnProperty.call(r, i)) return t + Math.max(0, Number(r[i]) || 0);
		let a = e?.[i];
		return a?.out === !0 ? t : t + g(a, n);
	}, 0);
}
function v(e, t, n, r, i = {}) {
	return Math.max(0, Number(e) || 0) + _(t, n, r, i);
}
function y({ playerId: e, mode: t, winners: n, bourreIds: r, settledPot: i, maxWinThisHand: a, bourreReplacementRemainder: o = null }) {
	let s = n.includes(e) && n.length >= 2 && (t === "co_win_carry" || t === "non_winner_ante_up"), c = r.includes(e), l = c && o != null && o > 0 ? o : null;
	return {
		skipNextAnte: s || c && l == null,
		bourreReplacementDue: l
	};
}
function b({ settledPot: e, bourreIds: t, participants: n, mode: r, winners: i, bourreRemaindersByPlayer: a = {} }) {
	let o = {};
	for (let s of n || []) o[s] = y({
		playerId: s,
		mode: r,
		winners: i,
		bourreIds: t,
		settledPot: e,
		bourreReplacementRemainder: a[s] ?? null
	});
	return {
		settledPot: Math.max(0, Number(e) || 0),
		bourreIds: [...t || []],
		byPlayer: o
	};
}
function x(e, t) {
	if (!t?.byPlayer) return e || {};
	let n = { ...e || {} };
	for (let [e, r] of Object.entries(t.byPlayer)) {
		let t = { ...n[e] || {} };
		r.bourreReplacementDue != null && (t.bourreReplacementDue = r.bourreReplacementDue), r.skipNextAnte && (t.skipNextAnte = !0), n[e] = t;
	}
	return n;
}
function S({ carryOverPot: e = 0, participantIds: t, scoreById: n, sessionStake: r, buyInFallback: i = 0 }) {
	let a = O({
		participants: E(t, n, i),
		scoreById: n,
		buyInFallback: i,
		stakeForPlayer: (e) => g(n[e], r)
	}), o = Math.max(0, Number(e) || 0), s = Object.values(a.postedAntes).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), c = o + s;
	return {
		...a,
		carryIn: o,
		antePot: s,
		nextHandPot: c
	};
}
function C(e, t = {}) {
	if (!(typeof process < "u" && process.env?.BOURRE_ACCOUNTING_DEBUG === "1" || typeof location < "u" && (location.hostname === "localhost" || location.hostname === "127.0.0.1"))) return;
	let n = {
		event: e,
		...t
	};
	typeof console < "u" && console.info && console.info("[bourre-accounting]", n);
}
function w(e, t) {
	let n = Math.max(0, Number(e) || 0), r = Number(t) || 0;
	if (r >= 0) return {
		newBankroll: n + r,
		appliedDelta: r,
		busted: !1
	};
	let i = Math.abs(r), a = Math.min(n, i);
	return {
		newBankroll: n - a,
		appliedDelta: -a,
		busted: i > 0 && a < i
	};
}
function T(e) {
	return Math.max(0, Number(e) || 0) > 0;
}
function E(e, t, n = 0) {
	return (e || []).filter((e) => {
		let r = t?.[e];
		return r?.out === !0 ? !1 : T(h(r, n));
	});
}
function D({ winnerId: e, carryIn: t = 0, scoreById: n, buyInFallback: r = 0, stakeForPlayer: i }) {
	let a = O({
		participants: [e],
		scoreById: n,
		buyInFallback: r,
		stakeForPlayer: i
	});
	if (!a.activeParticipants.includes(e)) return {
		ready: !1,
		reason: "solo_player_busted",
		bankrolls: a.bankrolls,
		postedAntes: a.postedAntes,
		outIds: a.outIds
	};
	let o = a.postedAntes[e] ?? 0, s = Math.max(0, Number(t) || 0) + o, c = a.bankrolls[e] ?? 0;
	return {
		ready: !0,
		winnerId: e,
		pot: s,
		postedAntes: a.postedAntes,
		bankrolls: { [e]: c + s },
		outIds: a.outIds,
		carryOverPot: 0
	};
}
function O({ participants: e, scoreById: t, buyInFallback: n = 0, stakeForPlayer: r }) {
	let i = {}, a = {}, o = [], s = [];
	for (let c of e) {
		let e = t[c], l = h(e, n);
		if (e?.out === !0 || !T(l)) continue;
		let u = Math.max(0, Number(r(c)) || 0);
		if (u <= 0) {
			i[c] = l, a[c] = 0, s.push(c);
			continue;
		}
		let d = w(l, -u);
		if (i[c] = d.newBankroll, a[c] = Math.abs(d.appliedDelta), d.busted) {
			o.push(c);
			continue;
		}
		s.push(c);
	}
	return {
		bankrolls: i,
		postedAntes: a,
		outIds: [...new Set(o)],
		activeParticipants: s,
		uncollectedPenalties: 0
	};
}
function k(e, t) {
	return e != null && Object.prototype.hasOwnProperty.call(e, t);
}
function A(e, t, n) {
	let r = {};
	for (let i of e || []) {
		let e = j(t[i] ?? 0, n[i] ?? 0);
		e > 0 && (r[i] = e);
	}
	return r;
}
function j(e, t) {
	let n = Number(e) || 0, r = Number(t) || 0;
	return n < 0 && r > n ? r - n : 0;
}
function M({ mode: e, winners: t, participants: n, nominalDeltas: r, scoreById: i, carryOverPot: a, buyInFallback: o = 0, stakeForPlayer: s = () => 0 }) {
	let c = {}, l = {}, u = [];
	for (let e of n) {
		let t = h(i[e], o), n = r[e] ?? 0;
		if (n < 0) {
			let r = w(t, n);
			c[e] = r.appliedDelta, l[e] = r.newBankroll, r.busted && u.push(e);
		} else c[e] = 0, l[e] = t;
	}
	let d = 0;
	for (let e of n) d += j(r[e] ?? 0, c[e] ?? 0);
	let f = Math.max(0, Number(a) || 0), p = n.reduce((e, t) => {
		let n = c[t] ?? 0;
		return n < 0 ? e + Math.abs(n) : e;
	}, 0);
	if (e === "win" && t.length === 1) {
		let e = t[0], n = r[e] ?? 0, a = n > 0 ? n : p > 0 ? p : 0;
		l[e] = (l[e] ?? h(i[e], o)) + a, c[e] = (c[e] ?? 0) + a;
	} else if (e === "split" && t.length >= 2) {
		let e = (p > 0 ? p : t.reduce((e, t) => e + Math.max(0, r[t] ?? 0), 0)) / t.length;
		for (let n of t) {
			let t = l[n] ?? h(i[n], o), r = c[n] ?? 0;
			l[n] = t + e, c[n] = r + e;
		}
	} else for (let e of n) {
		let n = r[e] ?? 0;
		if (n > 0 && !t.includes(e)) {
			let t = w(l[e] ?? h(i[e], o), n);
			c[e] = t.appliedDelta, l[e] = t.newBankroll;
		}
	}
	let m = n.filter((e) => (l[e] ?? 0) <= 0);
	return {
		appliedDeltas: c,
		bankrolls: l,
		bustedIds: [...new Set(u)],
		outIds: m,
		carryOverPot: Math.max(0, f - d),
		shortfall: d
	};
}
function N({ scoreById: e, participants: t, mode: n, winners: r, bourreIds: i, potState: a, bourreRemaindersByPlayer: o = {} }) {
	let s = a.currentPot, c = { ...e }, l = {}, u = {};
	for (let e of t) {
		let t = { ...c[e] || {} };
		t.skipNextAnte && delete t.skipNextAnte, t.bourreReplacementDue != null && delete t.bourreReplacementDue;
		let a = y({
			playerId: e,
			mode: n,
			winners: r,
			bourreIds: i,
			settledPot: s,
			bourreReplacementRemainder: o[e] ?? null
		});
		u[e] = { ...a }, a.bourreReplacementDue != null && (t.bourreReplacementDue = a.bourreReplacementDue, l[e] = a.bourreReplacementDue), a.skipNextAnte && (t.skipNextAnte = !0), c[e] = t;
	}
	return {
		scoreById: c,
		nextDealFunding: b({
			settledPot: s,
			bourreIds: i,
			participants: t,
			mode: n,
			winners: r,
			bourreRemaindersByPlayer: o
		}),
		debug: {
			settledPot: s,
			activePlayers: [...t],
			bourrePlayers: [...i],
			bourreReplacementDuePersisted: l,
			fundingFlagsRead: u
		}
	};
}
//#endregion
//#region src/game/money/conservation.ts
function ee(e, t = {}) {
	let n = s(e, t);
	if (t.expectedTotal != null && n !== t.expectedTotal) {
		let e = t.label ? `${t.label}: ` : "";
		throw Error(`${e}chip conservation failed — total ${n}, expected ${t.expectedTotal}`);
	}
	return n;
}
function te(e, t) {
	return s(e, t) === t.expectedTotal;
}
//#endregion
//#region src/game/money/pipeline.ts
var ne = P;
function P(e) {
	let { mode: t, winners: n, participants: r, tricksByPlayer: i, scoreById: a, sessionStake: o = 1, limEnabled: s = !1, carryIn: c = 0, postedAntes: l = {}, buyInFallback: u = 100 } = e, d = r.reduce((e, t) => e + (l[t] ?? g(a[t], o)), 0), f = (e) => k(l, e) ? 0 : g(a[e], o), { deltas: _, carryOverPot: v, bourreIds: y, bourreMatch: b, potState: x, pot: S, cappedPot: C, overflow: w } = p({
		mode: t,
		winners: n,
		participants: r,
		tricksByPlayer: i,
		anteAmount: o,
		limEnabled: s,
		carryIn: c,
		antePot: d,
		stakeForPlayer: f
	}), T = M({
		mode: t,
		winners: n,
		participants: r,
		nominalDeltas: _,
		scoreById: a,
		carryOverPot: v,
		buyInFallback: u,
		stakeForPlayer: f
	}), E = A(y, _, T.appliedDeltas), D = { ...a };
	for (let e of r) {
		let t = T.bankrolls[e] ?? h(D[e], u);
		D[e] = {
			...D[e],
			bankroll: t,
			net: m(t, u)
		};
	}
	let O = N({
		scoreById: D,
		participants: r,
		mode: t,
		winners: n,
		bourreIds: y,
		potState: x,
		bourreRemaindersByPlayer: E
	});
	return {
		mode: t,
		winners: n,
		participants: r,
		bourreIds: y,
		potState: x,
		grossPot: S,
		cappedPot: C,
		overflow: w,
		bourreMatch: b,
		nominalDeltas: _,
		appliedDeltas: T.appliedDeltas,
		carryOverPot: T.carryOverPot,
		bankrolls: T.bankrolls,
		bourreRemainders: E,
		scoreById: O.scoreById,
		nextDealFunding: O.nextDealFunding,
		solvent: T,
		debug: {
			...O.debug,
			settledHandPot: x.currentPot,
			carryOverPot: T.carryOverPot
		}
	};
}
function F(e) {
	let { scoreById: t, nextDealFunding: n, carryOverPot: r = 0, participantIds: i, sessionStake: a = 1, buyInFallback: o = 100, staleScoreById: s = null } = e, c = x(s ?? t, n), l = S({
		carryOverPot: r,
		participantIds: i,
		scoreById: c,
		sessionStake: a,
		buyInFallback: o
	}), u = Object.fromEntries(i.map((e) => [e, {
		bourreReplacementDue: c[e]?.bourreReplacementDue ?? null,
		skipNextAnte: c[e]?.skipNextAnte === !0
	}]));
	return {
		collected: l,
		mergedScoreById: c,
		nextHandPot: l.nextHandPot,
		debug: {
			nextDealFundingFlagsReadFromStorage: u,
			finalAntesCollected: { ...l.postedAntes },
			nextHandPot: l.nextHandPot,
			usedStaleRead: s != null
		}
	};
}
var re = F;
function I(e, t = {}) {
	let n = P(e), r = t.staleDealRead ? Object.fromEntries(e.participants.map((e) => {
		let t = { ...n.scoreById[e] };
		return delete t.bourreReplacementDue, delete t.skipNextAnte, [e, t];
	})) : null, i = F({
		scoreById: n.scoreById,
		nextDealFunding: n.nextDealFunding,
		carryOverPot: n.carryOverPot,
		participantIds: e.participants,
		sessionStake: e.sessionStake ?? 1,
		buyInFallback: e.buyInFallback ?? 100,
		staleScoreById: r
	});
	return {
		settlement: n,
		deal: i,
		debug: {
			settledHandPot: n.debug.settledHandPot,
			activePlayers: n.debug.activePlayers,
			bourrePlayers: n.debug.bourrePlayers,
			bourreReplacementDuePersisted: n.debug.bourreReplacementDuePersisted,
			nextDealFundingSnapshot: n.nextDealFunding,
			nextDealFundingFlagsReadFromStorage: i.debug.nextDealFundingFlagsReadFromStorage,
			finalAntesCollected: i.debug.finalAntesCollected,
			nextHandPot: i.debug.nextHandPot,
			staleReadRecovered: t.staleDealRead === !0
		}
	};
}
var ie = I;
function ae(e, t) {
	return f(e, t);
}
//#endregion
//#region src/game/money/idempotency.ts
function L(e, t, n, r = "") {
	return `${e}:${t}:${n ?? "_session"}${r ? `:${r}` : ""}`;
}
function R(e, t) {
	return e.some((e) => e.actionId === t);
}
function z(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) t.has(r.eventId) || (t.add(r.eventId), n.push(r));
	return n;
}
function oe(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) t.has(r.actionId) || (t.add(r.actionId), n.push(r));
	return n;
}
//#endregion
//#region src/game/money/replay.ts
var B = {
	session_start: 0,
	ante_collect: 1,
	hand_settlement: 2,
	rebuy: 3,
	next_deal: 4,
	session_finalize: 5
};
function V(e) {
	if (e == null) return "00000000";
	let t = Number(e);
	return Number.isFinite(t) ? String(t).padStart(8, "0") : e;
}
function H(e) {
	return [...e].sort((e, t) => {
		let n = V(e.handId), r = V(t.handId);
		if (n !== r) return n.localeCompare(r);
		let i = B[e.phase] ?? 99, a = B[t.phase] ?? 99;
		return i === a ? e.sequence - t.sequence : i - a;
	});
}
function U(e = 100) {
	return {
		version: "v1",
		buyInFallback: e,
		bankrolls: {},
		nets: {},
		carryOverPot: 0,
		postedAntes: {},
		scoreFlags: {},
		sequence: 0
	};
}
function W(e, t = {}) {
	let n = t.buyInFallback ?? 100, r = {}, i = {}, a = {};
	for (let [t, o] of Object.entries(e || {})) r[t] = h(o, n), i[t] = Number(o?.net) || 0, a[t] = {
		skipNextAnte: o?.skipNextAnte === !0,
		bourreReplacementDue: o?.bourreReplacementDue,
		out: o?.out === !0,
		perHandStake: o?.perHandStake
	};
	return {
		version: "v1",
		buyInFallback: n,
		bankrolls: r,
		nets: i,
		carryOverPot: Math.max(0, Number(t.carryOverPot) || 0),
		postedAntes: { ...t.postedAntes || {} },
		scoreFlags: a,
		sequence: 0
	};
}
function se(e, t) {
	let n = {
		...e,
		bankrolls: { ...e.bankrolls },
		nets: { ...e.nets },
		postedAntes: { ...e.postedAntes },
		scoreFlags: { ...e.scoreFlags },
		sequence: Math.max(e.sequence, t.sequence)
	}, r = t.playerId, i = Number(t.amount) || 0;
	switch (t.type) {
		case "BUY_IN_APPLIED":
			r && (n.bankrolls[r] = i, n.nets[r] = 0, n.scoreFlags[r] = {
				...n.scoreFlags[r],
				out: !1
			});
			break;
		case "ANTE_DEDUCTED":
			if (r) {
				let e = n.bankrolls[r] ?? 0;
				n.bankrolls[r] = Math.max(0, e - i), n.postedAntes[r] = (n.postedAntes[r] ?? 0) + i;
			}
			break;
		case "POT_FUNDED":
			n.carryOverPot = Math.max(0, n.carryOverPot + i);
			break;
		case "SETTLEMENT_DEBIT":
		case "BOURRE_LIABILITY":
			if (r) {
				let e = n.bankrolls[r] ?? 0;
				n.bankrolls[r] = Math.max(0, e - i), n.nets[r] = (n.nets[r] ?? 0) - i, n.bankrolls[r] <= 0 && (n.scoreFlags[r] = {
					...n.scoreFlags[r],
					out: !0
				});
			}
			break;
		case "WINNER_CREDITED":
		case "SPLIT_POT_APPLIED":
		case "REBUY_APPLIED":
			if (r) {
				let e = n.bankrolls[r] ?? 0;
				n.bankrolls[r] = e + i, t.type === "REBUY_APPLIED" ? (n.nets[r] = 0, n.scoreFlags[r] = {
					...n.scoreFlags[r],
					out: !1
				}) : n.nets[r] = (n.nets[r] ?? 0) + i;
			}
			break;
		case "CARRY_OVER_SET":
			n.carryOverPot = Math.max(0, i), n.postedAntes = {};
			break;
		case "NEXT_DEAL_FUNDING":
			if (r) {
				let e = t.metadata || {};
				n.scoreFlags[r] = {
					...n.scoreFlags[r],
					skipNextAnte: e.skipNextAnte === !0,
					bourreReplacementDue: e.bourreReplacementDue == null ? void 0 : Number(e.bourreReplacementDue)
				};
			}
			break;
		case "ADJUSTMENT_RECONCILIATION":
			r && t.metadata?.bankroll != null && (n.bankrolls[r] = Math.max(0, Number(t.metadata.bankroll))), t.metadata?.carryOverPot != null && (n.carryOverPot = Math.max(0, Number(t.metadata.carryOverPot)));
			break;
		default: break;
	}
	return n;
}
function G(e, t) {
	return H(z(e)).reduce(se, t);
}
function K(e) {
	let t = Object.values(e.bankrolls).reduce((e, t) => e + t, 0), n = Object.values(e.postedAntes).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
	return t + e.carryOverPot + n;
}
//#endregion
//#region src/game/money/processor.ts
function q(e, t) {
	let n = t.reduce((e, t) => Math.max(e, t.sequence), 0);
	return Math.max(e.sequence, n) + 1;
}
function J(e, t) {
	let n = K(e), r = [], i = [];
	t != null && n !== t && r.push(`chip total ${n} !== expected ${t}`);
	for (let [t, n] of Object.entries(e.bankrolls)) n < 0 && r.push(`negative bankroll for ${t}: ${n}`);
	return {
		ok: r.length === 0,
		chipTotal: n,
		expectedChipTotal: t,
		errors: r,
		warnings: i
	};
}
function ce(e) {
	let { actionId: t, playerIds: n, buyInAmount: r, existingEvents: i = [], ledger: a = {
		version: "v1",
		buyInFallback: r,
		bankrolls: {},
		nets: {},
		carryOverPot: 0,
		postedAntes: {},
		scoreFlags: {},
		sequence: 0
	} } = e;
	if (R(i, t)) {
		let e = G(i, a);
		return {
			delta: {},
			newEvents: [],
			newBankrolls: e.bankrolls,
			carryOverPot: e.carryOverPot,
			postedAntes: e.postedAntes,
			invariants: J(e, n.length * r),
			version: "v1"
		};
	}
	let o = q(a, i), s = n.map((e) => ({
		eventId: L(t, "BUY_IN_APPLIED", e),
		actionId: t,
		handId: null,
		phase: "session_start",
		sequence: o++,
		type: "BUY_IN_APPLIED",
		playerId: e,
		amount: r,
		metadata: {},
		timestamp: Date.now()
	})), c = G([...i, ...s], a), l = n.length * r;
	return {
		delta: Object.fromEntries(n.map((e) => [e, r])),
		newEvents: s,
		newBankrolls: c.bankrolls,
		carryOverPot: 0,
		postedAntes: {},
		invariants: J(c, l),
		version: "v1"
	};
}
function Y(e) {
	let { actionId: t, handId: n, carryOverPot: r, participantIds: i, scoreById: a, sessionStake: o, buyInFallback: c, nextDealFunding: l = null, existingEvents: u = [], ledger: d = {
		version: "v1",
		buyInFallback: c,
		bankrolls: Object.fromEntries(Object.entries(a).map(([e, t]) => [e, h(t, c)])),
		nets: Object.fromEntries(Object.entries(a).map(([e, t]) => [e, Number(t?.net) || 0])),
		carryOverPot: r,
		postedAntes: {},
		scoreFlags: {},
		sequence: 0
	} } = e;
	if (R(u, t)) {
		let e = F({
			scoreById: a,
			nextDealFunding: l,
			carryOverPot: r,
			participantIds: i,
			sessionStake: o,
			buyInFallback: c
		}), t = G(u, d);
		return {
			delta: {},
			newEvents: [],
			newBankrolls: t.bankrolls,
			carryOverPot: t.carryOverPot,
			postedAntes: t.postedAntes,
			invariants: J(t),
			version: "v1",
			collected: e.collected
		};
	}
	let f = s(a, {
		carryOverPot: r,
		buyInFallback: c
	}), p = F({
		scoreById: a,
		nextDealFunding: l ?? {
			settledPot: 0,
			bourreIds: [],
			byPlayer: {}
		},
		carryOverPot: r,
		participantIds: i,
		sessionStake: o,
		buyInFallback: c
	}), m = q(d, u), g = [];
	for (let [e, r] of Object.entries(p.collected.postedAntes)) {
		let i = Math.max(0, Number(r) || 0);
		i > 0 && g.push({
			eventId: L(t, "ANTE_DEDUCTED", e),
			actionId: t,
			handId: n,
			phase: "ante_collect",
			sequence: m++,
			type: "ANTE_DEDUCTED",
			playerId: e,
			amount: i,
			metadata: { sessionStake: o },
			timestamp: Date.now()
		});
	}
	let _ = J(G([...u, ...g], {
		...d,
		carryOverPot: r
	}), f);
	return {
		delta: Object.fromEntries(Object.entries(p.collected.bankrolls).map(([e, t]) => [e, t - h(a[e], c)])),
		newEvents: g,
		newBankrolls: p.collected.bankrolls,
		carryOverPot: 0,
		postedAntes: p.collected.postedAntes,
		invariants: _,
		version: "v1",
		collected: p.collected
	};
}
function X(e, t) {
	return e ? `ante:${e}:${t}` : `ante:${t}`;
}
function Z(e, t) {
	let { sessionId: n, handId: r, postedAntes: i, sessionStake: a, startSequence: o } = t, s = X(n, r);
	if (R(e, s) || Object.values(i || {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0) <= 0 || e.filter((e) => e.type === "ANTE_DEDUCTED" && e.handId === r).length > 0) return [];
	let c = [], l = o;
	for (let [t, n] of Object.entries(i || {})) {
		let i = Math.max(0, Number(n) || 0);
		if (i <= 0) continue;
		let o = L(s, "ANTE_DEDUCTED", t);
		e.some((e) => e.eventId === o) || c.push({
			eventId: o,
			actionId: s,
			handId: r,
			phase: "ante_collect",
			sequence: l++,
			type: "ANTE_DEDUCTED",
			playerId: t,
			amount: i,
			metadata: {
				sessionStake: a,
				source: "settlement_sync"
			},
			timestamp: Date.now()
		});
	}
	return c;
}
function Q(e) {
	let { actionId: t, handId: n, sessionId: r, existingEvents: i = [], ledger: a, ...o } = e, c = o.buyInFallback ?? 100, l = a ?? U(c);
	if (R(i, t)) {
		let e = P(o), t = G(i, l);
		return {
			delta: {},
			newEvents: [],
			newBankrolls: t.bankrolls,
			carryOverPot: t.carryOverPot,
			postedAntes: {},
			invariants: J(t),
			version: "v1",
			settlement: e
		};
	}
	let u = s(o.scoreById, {
		carryOverPot: o.carryIn ?? 0,
		postedAntes: o.postedAntes ?? {},
		buyInFallback: c
	}), d = P(o), f = q(l, i), p = Z(i, {
		sessionId: r,
		handId: n,
		postedAntes: o.postedAntes ?? {},
		sessionStake: o.sessionStake ?? 1,
		startSequence: f
	});
	f += p.length;
	let m = [...p];
	for (let e of d.participants) {
		let r = d.appliedDeltas[e] ?? 0, i = d.bourreIds.includes(e);
		if (r < 0) {
			let a = Math.abs(r);
			i ? m.push({
				eventId: L(t, "BOURRE_LIABILITY", e),
				actionId: t,
				handId: n,
				phase: "hand_settlement",
				sequence: f++,
				type: "BOURRE_LIABILITY",
				playerId: e,
				amount: a,
				metadata: { mode: d.mode },
				timestamp: Date.now()
			}) : m.push({
				eventId: L(t, "SETTLEMENT_DEBIT", e),
				actionId: t,
				handId: n,
				phase: "hand_settlement",
				sequence: f++,
				type: "SETTLEMENT_DEBIT",
				playerId: e,
				amount: a,
				metadata: { mode: d.mode },
				timestamp: Date.now()
			});
		} else if (r > 0) {
			let i = d.mode === "split" ? "SPLIT_POT_APPLIED" : "WINNER_CREDITED";
			m.push({
				eventId: L(t, i, e),
				actionId: t,
				handId: n,
				phase: "hand_settlement",
				sequence: f++,
				type: i,
				playerId: e,
				amount: r,
				metadata: { mode: d.mode },
				timestamp: Date.now()
			});
		}
	}
	m.push({
		eventId: L(t, "CARRY_OVER_SET", null),
		actionId: t,
		handId: n,
		phase: "hand_settlement",
		sequence: f++,
		type: "CARRY_OVER_SET",
		playerId: null,
		amount: d.carryOverPot,
		metadata: { bourreMatch: d.bourreMatch },
		timestamp: Date.now()
	});
	for (let e of d.participants) {
		let r = d.nextDealFunding.byPlayer[e];
		r && m.push({
			eventId: L(t, "NEXT_DEAL_FUNDING", e),
			actionId: t,
			handId: n,
			phase: "next_deal",
			sequence: f++,
			type: "NEXT_DEAL_FUNDING",
			playerId: e,
			amount: 0,
			metadata: {
				skipNextAnte: r.skipNextAnte,
				bourreReplacementDue: r.bourreReplacementDue
			},
			timestamp: Date.now()
		});
	}
	let h = J(G([...i, ...m], l), u);
	return {
		delta: d.appliedDeltas,
		newEvents: m,
		newBankrolls: d.bankrolls,
		carryOverPot: d.carryOverPot,
		postedAntes: {},
		invariants: h,
		version: "v1",
		settlement: d
	};
}
function le(e) {
	let { actionId: t, playerId: n, buyInAmount: r, handId: i = null, existingEvents: a = [], ledger: o = {
		version: "v1",
		buyInFallback: r,
		bankrolls: {},
		nets: {},
		carryOverPot: 0,
		postedAntes: {},
		scoreFlags: {},
		sequence: 0
	} } = e;
	if (R(a, t)) {
		let e = G(a, o);
		return {
			delta: {},
			newEvents: [],
			newBankrolls: e.bankrolls,
			carryOverPot: e.carryOverPot,
			postedAntes: e.postedAntes,
			invariants: J(e),
			version: "v1"
		};
	}
	let s = K(o), c = q(o, a), l = [{
		eventId: L(t, "REBUY_APPLIED", n),
		actionId: t,
		handId: i,
		phase: "rebuy",
		sequence: c,
		type: "REBUY_APPLIED",
		playerId: n,
		amount: r,
		metadata: {},
		timestamp: Date.now()
	}], u = G([...a, ...l], o), d = J(u, s + r);
	return {
		delta: { [n]: r },
		newEvents: l,
		newBankrolls: u.bankrolls,
		carryOverPot: u.carryOverPot,
		postedAntes: u.postedAntes,
		invariants: d,
		version: "v1"
	};
}
var ue = Y, de = Q;
//#endregion
//#region src/game/money/explain.ts
function $(e, t = 100) {
	let n = H(e), r = [`Money event log (${n.length} events, buy-in ${t})`, ""], i = null;
	for (let e of n) {
		e.handId !== i && (i = e.handId, r.push(i == null ? "--- Session ---" : `--- Hand ${i} ---`));
		let t = e.playerId ?? "table", n = e.amount >= 0 ? "+" : "", a = Object.keys(e.metadata || {}).length > 0 ? ` ${JSON.stringify(e.metadata)}` : "";
		r.push(`  [${e.sequence}] ${e.phase} ${e.type} ${t}: ${n}${e.amount}${a}`);
	}
	return r.join("\n");
}
//#endregion
//#region src/game/money/finalize.ts
function fe(e) {
	let t = e.buyInFallback ?? 100, n = e.initialLedger ?? W(e.scoreById ?? {}, {
		buyInFallback: t,
		carryOverPot: e.carryOverPot ?? 0,
		postedAntes: e.postedAntes ?? {}
	}), r = G(e.events, n), i = K(r), a = [], o = [];
	if (e.scoreById) for (let [n, i] of Object.entries(e.scoreById)) {
		let e = h(i, t), o = r.bankrolls[n];
		o != null && e !== o && a.push(`bankroll drift for ${n}: stored=${e}, replay=${o}`);
	}
	let c = e.playerCount == null ? e.scoreById ? s(e.scoreById, {
		carryOverPot: e.carryOverPot ?? 0,
		postedAntes: e.postedAntes ?? {},
		buyInFallback: t
	}) : void 0 : e.playerCount * t;
	c != null && i !== c && o.push(`chip total ${i} differs from session snapshot ${c} (may include rebuys)`);
	let l = $(e.events, t);
	return {
		bankrolls: r.bankrolls,
		nets: r.nets,
		carryOverPot: r.carryOverPot,
		chipTotal: i,
		invariants: {
			ok: a.length === 0,
			chipTotal: i,
			expectedChipTotal: c,
			errors: a,
			warnings: o
		},
		explanation: l
	};
}
function pe(e) {
	return e?.moneyEngineVersion === "v1";
}
function me(e, t) {
	if (!e) throw Error("Session not found");
	if (e.status === "final") throw Error("Session is final");
	if (e.moneyEngineVersion && e.moneyEngineVersion !== "v1") throw Error(`Session uses money engine ${e.moneyEngineVersion}; cannot ${t} with v1`);
}
function he(e, t, n = {}) {
	let r = fe({
		events: e,
		scoreById: t,
		buyInFallback: n.buyInFallback ?? 100,
		carryOverPot: n.carryOverPot,
		postedAntes: n.postedAntes
	});
	return {
		ok: r.invariants.ok,
		mismatches: r.invariants.errors
	};
}
//#endregion
export { r as DEFAULT_BOURRE_SETTINGS, n as DEFAULT_HAND_ANTE, l as MAX_TRICKS_PER_HAND, e as MONEY_ENGINE_VERSION, t as POT_CAP_MULTIPLIER, k as anteAlreadyPosted, w as applyBankrollDelta, N as applyRecordHandFundingToScores, M as applySolventSettlement, ee as assertChipConservation, me as assertMoneyEngineCompatible, ae as bourreIdsFromTricks, f as bourrePlayerIds, A as bourreRemaindersFromSettlement, Z as buildMissingDealAnteEvents, b as buildNextDealFundingSnapshot, T as canEnrollWithBankroll, O as collectHandAntes, S as collectNextHandAntes, fe as computeFinalBankrolls, c as computeHandPotState, X as dealAnteActionId, oe as dedupeEventsByActionId, z as dedupeEventsById, m as deriveScoreNet, E as eligibleIdsForAnteCollection, U as emptyLedgerState, $ as explainMoneyEvents, g as handAnteContribution, R as hasActionBeenApplied, te as isChipConserved, d as isHandComplete, pe as isMoneyEngineV1, K as ledgerChipTotal, W as ledgerFromScoreById, C as logBourreAccounting, L as makeEventId, x as mergeNextDealFundingIntoScoreById, y as nextDealFundingFlags, i as normalizeBourreSettings, Y as processAnte, de as processBourreLiability, ce as processBuyIn, Q as processHandSettlement, ue as processNextDealFunding, le as processRebuy, v as projectNextHandPot, P as recordHandSettlement, G as replayEvents, o as resolveSessionBuyIn, I as runHandMoneyFlow, ie as runProductionSettlementDealFlow, h as scoreBankroll, s as sessionChipTotal, p as settleHandDeltas, D as settleSoloDefaultWin, j as settlementShortfall, re as simulatePagatHandStartFunding, ne as simulateRecordHandSettlement, H as sortMoneyEvents, a as splitPotVoteAllowed, F as startNextHandFunding, _ as sumProjectedHandAntes, u as totalTricksPlayed, he as validateReplayMatchesDerived };
