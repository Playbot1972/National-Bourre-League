//#region src/game/money/core.ts
var e = 20, t = 1, n = {
	buyInAmount: 100,
	anteAmount: 1,
	limEnabled: !1,
	rebuyEnabled: !1,
	splitPotEnabled: !1
};
function r(e = {}) {
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
function i(e) {
	return r(e).splitPotEnabled === !0;
}
function a(e, t) {
	let n = e?.buyInAmount;
	return n != null && Number(n) > 0 ? Math.max(1, Number(n) || 1) : r(t).buyInAmount;
}
function o(e, { carryOverPot: t = 0, postedAntes: n = {}, buyInFallback: r = 0 } = {}) {
	let i = Object.values(e || {}).reduce((e, t) => e + p(t, r), 0), a = Object.values(n || {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
	return i + Math.max(0, Number(t) || 0) + a;
}
function s({ anteAmount: e, limEnabled: t = !1, carryIn: n = 0, antePot: r }) {
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
var c = 5;
function l(e, t) {
	return (t || []).reduce((t, n) => t + (e?.[n] ?? 0), 0);
}
function u(e, t) {
	return l(e, t) >= 5;
}
function d(e, t) {
	return !e || !t?.length || !u(e, t) ? [] : t.filter((t) => (e[t] ?? 0) === 0);
}
function f({ mode: e, winners: t, participants: n, tricksByPlayer: r, anteAmount: i, limEnabled: a = !1, carryIn: o = 0, stakeForPlayer: c, antePot: l }) {
	let u = a === !0, f = s({
		anteAmount: i,
		limEnabled: u,
		carryIn: o,
		antePot: l ?? n.reduce((e, t) => e + c(t), 0)
	}), { currentPot: p, winnerTake: m, bourrePenalty: h, overflow: g } = f, _ = d(r, n), v = _.length * h, y = {}, b = 0;
	if (e === "push" || e === "non_winner_ante_up" || e === "co_win_carry") b = p + v, n.forEach((e) => {
		let t = c(e), n = _.includes(e) ? h : 0;
		y[e] = -t - n;
	}), u && (b = g + p + v);
	else if (e === "split") {
		let e = m / t.length;
		n.forEach((n) => {
			let r = c(n), i = _.includes(n) ? h : 0;
			t.includes(n) ? y[n] = e - r - i : y[n] = -r - i;
		}), b = (u ? g : 0) + v;
	} else {
		let e = t[0];
		n.forEach((t) => {
			let n = c(t);
			t === e ? y[t] = m - n : _.includes(t) ? y[t] = -h - n : y[t] = -n;
		}), b = (u ? g : 0) + v;
	}
	return {
		deltas: y,
		carryOverPot: b,
		bourreIds: _,
		bourreMatch: v,
		potState: f,
		pot: p,
		cappedPot: m,
		overflow: g
	};
}
function p(e, t = 0) {
	let n = Math.max(0, Number(t) || 0), r = Number(e?.net) || 0, i = n > 0 ? Math.max(0, n + r) : Math.max(0, r);
	if (e?.bankroll != null && Number.isFinite(Number(e.bankroll))) {
		let t = Math.max(0, Number(e.bankroll));
		return r !== 0 && n > 0 && t === n ? i : t;
	}
	return i;
}
function m(e, t) {
	let n = Number(e?.bourreReplacementDue);
	if (Number.isFinite(n) && n > 0) return n;
	if (e?.skipNextAnte) return 0;
	let r = e?.perHandStake ?? t;
	return Math.max(.01, Number(r) || t);
}
function h(e, t, n, r = {}) {
	return (t || []).reduce((t, i) => {
		if (r != null && Object.prototype.hasOwnProperty.call(r, i)) return t + Math.max(0, Number(r[i]) || 0);
		let a = e?.[i];
		return a?.out === !0 ? t : t + m(a, n);
	}, 0);
}
function g(e, t, n, r, i = {}) {
	return Math.max(0, Number(e) || 0) + h(t, n, r, i);
}
function _({ playerId: e, mode: t, winners: n, bourreIds: r, settledPot: i, maxWinThisHand: a, bourreReplacementRemainder: o = null }) {
	let s = n.includes(e) && n.length >= 2 && (t === "co_win_carry" || t === "non_winner_ante_up"), c = r.includes(e), l = c && o != null && o > 0 ? o : null;
	return {
		skipNextAnte: s || c && l == null,
		bourreReplacementDue: l
	};
}
function v({ settledPot: e, bourreIds: t, participants: n, mode: r, winners: i, bourreRemaindersByPlayer: a = {} }) {
	let o = {};
	for (let s of n || []) o[s] = _({
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
function y(e, t) {
	if (!t?.byPlayer) return e || {};
	let n = { ...e || {} };
	for (let [e, r] of Object.entries(t.byPlayer)) {
		let t = { ...n[e] || {} };
		r.bourreReplacementDue != null && (t.bourreReplacementDue = r.bourreReplacementDue), r.skipNextAnte && (t.skipNextAnte = !0), n[e] = t;
	}
	return n;
}
function b({ carryOverPot: e = 0, participantIds: t, scoreById: n, sessionStake: r, buyInFallback: i = 0 }) {
	let a = E({
		participants: w(t, n, i),
		scoreById: n,
		buyInFallback: i,
		stakeForPlayer: (e) => m(n[e], r)
	}), o = Math.max(0, Number(e) || 0), s = Object.values(a.postedAntes).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), c = o + s;
	return {
		...a,
		carryIn: o,
		antePot: s,
		nextHandPot: c
	};
}
function x(e, t = {}) {
	if (!(typeof process < "u" && process.env?.BOURRE_ACCOUNTING_DEBUG === "1" || typeof location < "u" && (location.hostname === "localhost" || location.hostname === "127.0.0.1"))) return;
	let n = {
		event: e,
		...t
	};
	typeof console < "u" && console.info && console.info("[bourre-accounting]", n);
}
function S(e, t) {
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
function C(e) {
	return Math.max(0, Number(e) || 0) > 0;
}
function w(e, t, n = 0) {
	return (e || []).filter((e) => {
		let r = t?.[e];
		return r?.out === !0 ? !1 : C(p(r, n));
	});
}
function T({ winnerId: e, carryIn: t = 0, scoreById: n, buyInFallback: r = 0, stakeForPlayer: i }) {
	let a = E({
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
function E({ participants: e, scoreById: t, buyInFallback: n = 0, stakeForPlayer: r }) {
	let i = {}, a = {}, o = [], s = [];
	for (let c of e) {
		let e = t[c], l = p(e, n);
		if (e?.out === !0 || !C(l)) continue;
		let u = Math.max(0, Number(r(c)) || 0);
		if (u <= 0) {
			i[c] = l, a[c] = 0, s.push(c);
			continue;
		}
		let d = S(l, -u);
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
function D(e, t) {
	return e != null && Object.prototype.hasOwnProperty.call(e, t);
}
function O(e, t, n) {
	let r = {};
	for (let i of e || []) {
		let e = k(t[i] ?? 0, n[i] ?? 0);
		e > 0 && (r[i] = e);
	}
	return r;
}
function k(e, t) {
	let n = Number(e) || 0, r = Number(t) || 0;
	return n < 0 && r > n ? r - n : 0;
}
function A({ mode: e, winners: t, participants: n, nominalDeltas: r, scoreById: i, carryOverPot: a, buyInFallback: o = 0, stakeForPlayer: s = () => 0 }) {
	let c = {}, l = {}, u = [];
	for (let e of n) {
		let t = p(i[e], o), n = r[e] ?? 0;
		if (n < 0) {
			let r = S(t, n);
			c[e] = r.appliedDelta, l[e] = r.newBankroll, r.busted && u.push(e);
		} else c[e] = 0, l[e] = t;
	}
	for (let e of n) {
		let t = Math.max(0, Number(s(e)) || 0);
		if (t <= 0 || (r[e] ?? 0) < 0) continue;
		let n = S(l[e] ?? p(i[e], o), -t);
		c[e] = (c[e] ?? 0) + n.appliedDelta, l[e] = n.newBankroll, n.busted && u.push(e);
	}
	let d = 0;
	for (let e of n) d += k(r[e] ?? 0, c[e] ?? 0);
	let f = Math.max(0, Number(a) || 0), m = n.reduce((e, t) => {
		let n = c[t] ?? 0;
		return n < 0 ? e + Math.abs(n) : e;
	}, 0);
	if (e === "win" && t.length === 1) {
		let e = t[0], n = r[e] ?? 0, a = n > 0 ? n : m > 0 ? m : 0;
		l[e] = p(i[e], o) + a, c[e] = (c[e] ?? 0) + a;
	} else if (e === "split" && t.length >= 2) {
		let e = (m > 0 ? m : t.reduce((e, t) => e + Math.max(0, r[t] ?? 0), 0)) / t.length;
		for (let n of t) {
			let t = p(i[n], o), r = c[n] ?? 0;
			l[n] = t + e, c[n] = r + e;
		}
	} else for (let e of n) {
		let n = r[e] ?? 0;
		if (n > 0 && !t.includes(e)) {
			let t = S(l[e] ?? p(i[e], o), n);
			c[e] = t.appliedDelta, l[e] = t.newBankroll;
		}
	}
	let h = n.filter((e) => (l[e] ?? 0) <= 0);
	return {
		appliedDeltas: c,
		bankrolls: l,
		bustedIds: [...new Set(u)],
		outIds: h,
		carryOverPot: Math.max(0, f - d),
		shortfall: d
	};
}
function j({ scoreById: e, participants: t, mode: n, winners: r, bourreIds: i, potState: a, bourreRemaindersByPlayer: o = {} }) {
	let s = a.currentPot, c = { ...e }, l = {}, u = {};
	for (let e of t) {
		let t = { ...c[e] || {} };
		t.skipNextAnte && delete t.skipNextAnte, t.bourreReplacementDue != null && delete t.bourreReplacementDue;
		let a = _({
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
		nextDealFunding: v({
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
function M(e, t = {}) {
	let n = o(e, t);
	if (t.expectedTotal != null && n !== t.expectedTotal) {
		let e = t.label ? `${t.label}: ` : "";
		throw Error(`${e}chip conservation failed — total ${n}, expected ${t.expectedTotal}`);
	}
	return n;
}
function N(e, t) {
	return o(e, t) === t.expectedTotal;
}
//#endregion
//#region src/game/money/pipeline.ts
var P = F;
function F(e) {
	let { mode: t, winners: n, participants: r, tricksByPlayer: i, scoreById: a, sessionStake: o = 1, limEnabled: s = !1, carryIn: c = 0, postedAntes: l = {}, buyInFallback: u = 100 } = e, d = r.reduce((e, t) => e + (l[t] ?? m(a[t], o)), 0), h = (e) => D(l, e) ? 0 : m(a[e], o), { deltas: g, carryOverPot: _, bourreIds: v, bourreMatch: y, potState: b, pot: x, cappedPot: S, overflow: C } = f({
		mode: t,
		winners: n,
		participants: r,
		tricksByPlayer: i,
		anteAmount: o,
		limEnabled: s,
		carryIn: c,
		antePot: d,
		stakeForPlayer: h
	}), w = A({
		mode: t,
		winners: n,
		participants: r,
		nominalDeltas: g,
		scoreById: a,
		carryOverPot: _,
		buyInFallback: u,
		stakeForPlayer: h
	}), T = O(v, g, w.appliedDeltas), E = { ...a };
	for (let e of r) E[e] = {
		...E[e],
		bankroll: w.bankrolls[e] ?? p(E[e], u),
		net: (E[e]?.net || 0) + (w.appliedDeltas[e] ?? 0)
	};
	let k = j({
		scoreById: E,
		participants: r,
		mode: t,
		winners: n,
		bourreIds: v,
		potState: b,
		bourreRemaindersByPlayer: T
	});
	return {
		mode: t,
		winners: n,
		participants: r,
		bourreIds: v,
		potState: b,
		grossPot: x,
		cappedPot: S,
		overflow: C,
		bourreMatch: y,
		nominalDeltas: g,
		appliedDeltas: w.appliedDeltas,
		carryOverPot: w.carryOverPot,
		bankrolls: w.bankrolls,
		bourreRemainders: T,
		scoreById: k.scoreById,
		nextDealFunding: k.nextDealFunding,
		solvent: w,
		debug: {
			...k.debug,
			settledHandPot: b.currentPot,
			carryOverPot: w.carryOverPot
		}
	};
}
function I(e) {
	let { scoreById: t, nextDealFunding: n, carryOverPot: r = 0, participantIds: i, sessionStake: a = 1, buyInFallback: o = 100, staleScoreById: s = null } = e, c = y(s ?? t, n), l = b({
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
var L = I;
function R(e, t = {}) {
	let n = F(e), r = t.staleDealRead ? Object.fromEntries(e.participants.map((e) => {
		let t = { ...n.scoreById[e] };
		return delete t.bourreReplacementDue, delete t.skipNextAnte, [e, t];
	})) : null, i = I({
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
var z = R;
function B(e, t) {
	return d(e, t);
}
//#endregion
export { n as DEFAULT_BOURRE_SETTINGS, t as DEFAULT_HAND_ANTE, c as MAX_TRICKS_PER_HAND, e as POT_CAP_MULTIPLIER, D as anteAlreadyPosted, S as applyBankrollDelta, j as applyRecordHandFundingToScores, A as applySolventSettlement, M as assertChipConservation, B as bourreIdsFromTricks, d as bourrePlayerIds, O as bourreRemaindersFromSettlement, v as buildNextDealFundingSnapshot, C as canEnrollWithBankroll, E as collectHandAntes, b as collectNextHandAntes, s as computeHandPotState, w as eligibleIdsForAnteCollection, m as handAnteContribution, N as isChipConserved, u as isHandComplete, x as logBourreAccounting, y as mergeNextDealFundingIntoScoreById, _ as nextDealFundingFlags, r as normalizeBourreSettings, g as projectNextHandPot, F as recordHandSettlement, a as resolveSessionBuyIn, R as runHandMoneyFlow, z as runProductionSettlementDealFlow, p as scoreBankroll, o as sessionChipTotal, f as settleHandDeltas, T as settleSoloDefaultWin, k as settlementShortfall, L as simulatePagatHandStartFunding, P as simulateRecordHandSettlement, i as splitPotVoteAllowed, I as startNextHandFunding, h as sumProjectedHandAntes, l as totalTricksPlayed };
