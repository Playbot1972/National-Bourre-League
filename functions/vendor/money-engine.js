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
	let i = Object.values(e || {}).reduce((e, t) => e + m(t, r), 0), a = Object.values(n || {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
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
function p(e, t = 0) {
	let n = Math.max(0, Number(t) || 0);
	return Math.max(0, Number(e) || 0) - n;
}
function m(e, t = 0) {
	if (e?.bankroll != null && Number.isFinite(Number(e.bankroll))) return Math.max(0, Number(e.bankroll));
	let n = Math.max(0, Number(t) || 0), r = Number(e?.net) || 0;
	return n > 0 ? Math.max(0, n + r) : Math.max(0, r);
}
function h(e, t) {
	let n = Number(e?.fundingContribution);
	if (Number.isFinite(n) && n >= 0) return n;
	let r = Number(e?.bourreReplacementDue);
	if (Number.isFinite(r) && r > 0) return r;
	if (e?.skipNextAnte) return 0;
	let i = e?.perHandStake ?? t;
	return Math.max(.01, Number(i) || t);
}
function g(e, t, n, r = {}) {
	return (t || []).reduce((t, i) => {
		if (r != null && Object.prototype.hasOwnProperty.call(r, i)) return t + Math.max(0, Number(r[i]) || 0);
		let a = e?.[i];
		return a?.out === !0 ? t : t + h(a, n);
	}, 0);
}
function _(e, t, n, r, i = {}) {
	return Math.max(0, Number(e) || 0) + g(t, n, r, i);
}
function v({ playerId: e, mode: t, winners: n, bourreIds: r, settledPot: i, maxWinThisHand: a, bourreReplacementRemainder: o = null }) {
	let s = n.includes(e) && n.length >= 2 && (t === "co_win_carry" || t === "non_winner_ante_up"), c = r.includes(e), l = c && o != null && o > 0 ? o : null;
	return {
		skipNextAnte: s || c && l == null,
		bourreReplacementDue: l
	};
}
function y({ settledPot: e, bourreIds: t, participants: n, mode: r, winners: i, bourreRemaindersByPlayer: a = {} }) {
	let o = {};
	for (let s of n || []) o[s] = v({
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
function b(e, t) {
	if (!t?.byPlayer) return e || {};
	let n = { ...e || {} };
	for (let [e, r] of Object.entries(t.byPlayer)) {
		let t = { ...n[e] || {} };
		r.bourreReplacementDue != null && (t.bourreReplacementDue = r.bourreReplacementDue), r.skipNextAnte && (t.skipNextAnte = !0), r.fundingContribution != null && (t.fundingContribution = r.fundingContribution), n[e] = t;
	}
	return n;
}
function x({ carryOverPot: e = 0, participantIds: t, scoreById: n, sessionStake: r, buyInFallback: i = 0 }) {
	let a = A({
		participants: T(t, n, i),
		scoreById: n,
		buyInFallback: i,
		stakeForPlayer: (e) => h(n[e], r)
	}), o = Math.max(0, Number(e) || 0), s = Object.values(a.postedAntes).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), c = o + s;
	return {
		...a,
		carryIn: o,
		antePot: s,
		nextHandPot: c
	};
}
function S(e, t = {}) {
	if (!(typeof process < "u" && process.env?.BOURRE_ACCOUNTING_DEBUG === "1" || typeof location < "u" && (location.hostname === "localhost" || location.hostname === "127.0.0.1"))) return;
	let n = {
		event: e,
		...t
	};
	typeof console < "u" && console.info && console.info("[bourre-accounting]", n);
}
function C(e, t) {
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
function w(e) {
	return Math.max(0, Number(e) || 0) > 0;
}
function T(e, t, n = 0) {
	return (e || []).filter((e) => {
		let r = t?.[e];
		return r?.out === !0 ? !1 : w(m(r, n));
	});
}
function E(e = {}) {
	return Object.values(e).some((e) => (Number(e) || 0) > 0);
}
function D({ winnerId: e, carryIn: t = 0, postedAntes: n = {}, scoreById: r, buyInFallback: i = 0, participants: a }) {
	let o = Math.max(0, Number(t) || 0) + Object.values(n).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), s = {};
	for (let e of a) s[e] = m(r[e], i);
	return s[e] = (s[e] ?? m(r[e], i)) + o, {
		ready: !0,
		winnerId: e,
		pot: o,
		postedAntes: n,
		bankrolls: s,
		carryOverPot: 0
	};
}
function O(e) {
	let { winnerId: t, carryIn: n = 0, postedAntes: r = {}, scoreById: i, buyInFallback: a = 0, participants: o, sessionStake: s = 1, stakeForPlayer: c } = e;
	if (E(r)) {
		let e = D({
			winnerId: t,
			carryIn: n,
			postedAntes: r,
			scoreById: i,
			buyInFallback: a,
			participants: o
		}), s = { ...i };
		for (let t of o) {
			let n = e.bankrolls[t];
			n != null && (s[t] = {
				...s[t] || {},
				bankroll: n,
				net: p(n, a)
			});
		}
		let c = M({
			scoreById: s,
			participants: o,
			mode: "win",
			winners: [t],
			bourreIds: [],
			potState: { currentPot: e.pot }
		});
		return {
			...e,
			prefunded: !0,
			settledBankrolls: e.bankrolls,
			fundedScoreById: c.scoreById,
			nextDealFunding: c.nextDealFunding
		};
	}
	let l = k({
		winnerId: t,
		carryIn: n,
		scoreById: i,
		buyInFallback: a,
		stakeForPlayer: c ?? ((e) => h(i[e], s))
	});
	return {
		...l,
		prefunded: !1,
		settledBankrolls: l.ready ? l.bankrolls : void 0,
		fundedScoreById: null,
		nextDealFunding: null
	};
}
function k({ winnerId: e, carryIn: t = 0, scoreById: n, buyInFallback: r = 0, stakeForPlayer: i }) {
	let a = A({
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
function A({ participants: e, scoreById: t, buyInFallback: n = 0, stakeForPlayer: r }) {
	let i = {}, a = {}, o = [], s = [];
	for (let c of e) {
		let e = t[c], l = m(e, n);
		if (e?.out === !0 || !w(l)) continue;
		let u = Math.max(0, Number(r(c)) || 0);
		if (u <= 0) {
			i[c] = l, a[c] = 0, s.push(c);
			continue;
		}
		let d = C(l, -u);
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
function ee(e, t) {
	return e != null && Object.prototype.hasOwnProperty.call(e, t);
}
function te(e, t, n) {
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
function ne({ mode: e, winners: t, participants: n, nominalDeltas: r, scoreById: i, carryOverPot: a, buyInFallback: o = 0, stakeForPlayer: s = () => 0 }) {
	let c = {}, l = {}, u = [];
	for (let e of n) {
		let t = m(i[e], o), n = r[e] ?? 0;
		if (n < 0) {
			let r = C(t, n);
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
		l[e] = (l[e] ?? m(i[e], o)) + a, c[e] = (c[e] ?? 0) + a;
	} else if (e === "split" && t.length >= 2) {
		let e = (p > 0 ? p : t.reduce((e, t) => e + Math.max(0, r[t] ?? 0), 0)) / t.length;
		for (let n of t) {
			let t = l[n] ?? m(i[n], o), r = c[n] ?? 0;
			l[n] = t + e, c[n] = r + e;
		}
	} else for (let e of n) {
		let n = r[e] ?? 0;
		if (n > 0 && !t.includes(e)) {
			let t = C(l[e] ?? m(i[e], o), n);
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
function M({ scoreById: e, participants: t, mode: n, winners: r, bourreIds: i, potState: a, bourreRemaindersByPlayer: o = {} }) {
	let s = a.currentPot, c = { ...e }, l = {}, u = {};
	for (let e of t) {
		let t = { ...c[e] || {} };
		t.skipNextAnte && delete t.skipNextAnte, t.bourreReplacementDue != null && delete t.bourreReplacementDue;
		let a = v({
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
		nextDealFunding: y({
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
function N(e) {
	let t = Object.values(e.bankrolls || {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), n = Math.max(0, Number(e.carryOverPot) || 0), r = Object.values(e.postedAntes || {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
	return t + n + r;
}
function P(e) {
	let t = e.tolerance ?? .001, n = [], r = N(e.before), i = N(e.after) - r, a = Object.values(e.rebuyContributionByPlayer ?? {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), o = Object.values(e.bourrePenaltyToPotByPlayer ?? {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
	if (i <= t) return {
		ok: !0,
		errors: n
	};
	let s = a + o;
	if (Math.abs(i - s) > t) {
		let t = e.label ? `${e.label}: ` : "";
		n.push(`${t}chip total grew by ${i} (allowed ${s} = rebuy ${a} + bourré-to-pot ${o})`);
	}
	return {
		ok: n.length === 0,
		errors: n
	};
}
function re(e, t = {}) {
	let n = s(e, t);
	if (t.expectedTotal != null && n !== t.expectedTotal) {
		let e = t.label ? `${t.label}: ` : "";
		throw Error(`${e}chip conservation failed — total ${n}, expected ${t.expectedTotal}`);
	}
	return n;
}
function ie(e, t) {
	return s(e, t) === t.expectedTotal;
}
//#endregion
//#region src/game/money/canonical.ts
function ae(e, t, n) {
	return t && !n ? Math.max(0, Number(e) || 0) : 0;
}
function oe(e, t, n) {
	let r = Math.max(0, Number(e) || 0), i = t.filter((e) => n.includes(e)), a = {};
	if (!i.length || r <= 0) return a;
	let o = Math.floor(r / i.length), s = r - o * i.length, c = n.filter((e) => i.includes(e));
	for (let e of c) {
		let t = +(s > 0);
		s > 0 && --s, a[e] = o + t;
	}
	return a;
}
function se(e) {
	let { stackByPlayer: t, participantIds: n, rebuyEnabled: r, rebuyAmount: i, rebuyPlayerIds: a, outByPlayer: o = {} } = e, s = {}, c = [], l = Math.max(0, Number(i) || 0);
	if (!r || l <= 0) return {
		rebuyContributionByPlayer: s,
		rebuyPlayerIds: c
	};
	let u = a == null ? n.filter((e) => Math.max(0, Number(t[e]) || 0) <= 0 || o[e] === !0) : a.filter((e) => n.includes(e));
	for (let e of u) s[e] = l, c.push(e);
	return {
		rebuyContributionByPlayer: s,
		rebuyPlayerIds: c
	};
}
function F(e) {
	let { completedHandPot: t, stackByPlayer: n, participants: r, singleWinnerId: i = null, tiedWinnerIds: a = [], bourrePlayerIds: o = [], splitPot: s, potCarry: c = !1, seatOrder: l = e.participantOrder ?? r } = e, u = Math.max(0, Number(t) || 0), d = a.length >= 2 || c, f = {}, p = {}, m = {};
	for (let e of r) m[e] = Math.max(0, Number(n[e]) || 0), f[e] = 0, p[e] = 0;
	if (d && !s) return {
		completedHandPot: u,
		carryoverPot: ae(u, !0, !1),
		payoutByPlayer: f,
		splitPayoutByPlayer: p,
		settledStackByPlayer: m,
		splitPot: !1,
		tie: !0,
		singleWinnerId: null,
		tiedWinnerIds: [...a],
		bourrePlayerIds: [...o]
	};
	if (d && s) {
		let e = oe(u, a, l);
		for (let [t, n] of Object.entries(e)) p[t] = n, f[t] = n, m[t] = (m[t] ?? 0) + n;
		return {
			completedHandPot: u,
			carryoverPot: 0,
			payoutByPlayer: f,
			splitPayoutByPlayer: p,
			settledStackByPlayer: m,
			splitPot: !0,
			tie: !0,
			singleWinnerId: null,
			tiedWinnerIds: [...a],
			bourrePlayerIds: [...o]
		};
	}
	let h = i ?? a[0] ?? null;
	return h && r.includes(h) && (f[h] = u, m[h] = (m[h] ?? 0) + u), {
		completedHandPot: u,
		carryoverPot: 0,
		payoutByPlayer: f,
		splitPayoutByPlayer: p,
		settledStackByPlayer: m,
		splitPot: !1,
		tie: !1,
		singleWinnerId: h,
		tiedWinnerIds: [],
		bourrePlayerIds: [...o]
	};
}
function I(e) {
	let { completedHandPot: t, carryoverPot: n, anteAmount: r, participantIds: i, bourrePlayerIds: a, tiedWinnerIds: o, splitPot: s, tie: c, explicitExemptPlayerIds: l = [], bourreReplacementRemainderByPlayer: u = {} } = e, d = {}, f = {}, p = Math.max(0, Number(t) || 0), m = Math.max(.01, Number(r) || 1), h = new Set(l);
	for (let e of i) {
		let t = u[e];
		if (t != null && t > 0) {
			d[e] = t, f[e] = "bourre_full_pot_penalty";
			continue;
		}
		a.includes(e) ? (d[e] = p, f[e] = "bourre_full_pot_penalty") : c && !s && o.includes(e) ? (d[e] = 0, f[e] = "tie_carry_exempt") : h.has(e) ? (d[e] = 0, f[e] = "explicit_exempt") : (d[e] = m, f[e] = "normal_ante");
	}
	return {
		fundingContributionByPlayer: d,
		fundingReasonByPlayer: f
	};
}
function L(e) {
	let { settledStackByPlayer: t, carryoverPot: n, participantIds: r, rebuyContributionByPlayer: i = {} } = e, { fundingContributionByPlayer: a, fundingReasonByPlayer: o } = I(e), s = {};
	for (let e of r) s[e] = Math.max(0, Number(i[e]) || 0);
	let c = {};
	for (let e of r) {
		let n = Math.max(0, Number(t[e]) || 0), r = Math.max(0, Number(a[e]) || 0), i = s[e] ?? 0;
		c[e] = Math.max(0, n - r + i);
	}
	let l = r.reduce((e, t) => e + Math.max(0, Number(a[t]) || 0), 0);
	return {
		fundingContributionByPlayer: a,
		fundingReasonByPlayer: o,
		rebuyContributionByPlayer: s,
		nextStartStackByPlayer: c,
		nextPot: Math.max(0, Number(n) || 0) + l,
		carryoverPot: Math.max(0, Number(n) || 0)
	};
}
function R(e, t, n, r = {}) {
	let i = {};
	for (let e of n) {
		let n = t.fundingContributionByPlayer[e] ?? 0, a = t.fundingReasonByPlayer[e] ?? "normal_ante", o = r[e] ?? null, s = t.rebuyContributionByPlayer?.[e] ?? 0;
		i[e] = {
			fundingContribution: n,
			fundingReason: a,
			skipNextAnte: a === "tie_carry_exempt" || a === "explicit_exempt",
			bourreReplacementDue: o != null && o > 0 ? o : null,
			...s > 0 ? { rebuyContribution: s } : {}
		}, a === "bourre_full_pot_penalty" && (i[e].skipNextAnte = !0);
	}
	return {
		completedHandPot: e.completedHandPot,
		carryoverPot: e.carryoverPot,
		nextPot: t.nextPot,
		bourrePlayerIds: [...e.bourrePlayerIds],
		tiedWinnerIds: [...e.tiedWinnerIds],
		splitPot: e.splitPot,
		tie: e.tie,
		fundingContributionByPlayer: { ...t.fundingContributionByPlayer },
		fundingReasonByPlayer: { ...t.fundingReasonByPlayer },
		rebuyContributionByPlayer: { ...t.rebuyContributionByPlayer ?? {} },
		byPlayer: i
	};
}
function z(e, t, n) {
	return e === "split" ? {
		splitPot: !0,
		tie: t.length >= 2,
		tiedWinnerIds: [...t],
		singleWinnerId: null
	} : e === "push" ? {
		splitPot: !1,
		tie: !0,
		tiedWinnerIds: [...t],
		singleWinnerId: null,
		potCarry: !0
	} : e === "win" && t.length === 1 ? {
		splitPot: !1,
		tie: !1,
		tiedWinnerIds: [],
		singleWinnerId: t[0]
	} : [
		"co_win_carry",
		"non_winner_ante_up",
		"push"
	].includes(e) || t.length >= 2 ? {
		splitPot: n && e === "split",
		tie: !0,
		tiedWinnerIds: [...t],
		singleWinnerId: null
	} : {
		splitPot: !1,
		tie: !1,
		tiedWinnerIds: [],
		singleWinnerId: t[0] ?? null
	};
}
function ce(e, t, n, r, i = {}) {
	let a = {};
	for (let [o, s] of Object.entries(n)) {
		if (s !== "bourre_full_pot_penalty") continue;
		let n = Math.max(0, Number(r[o]) || 0), c = Math.max(0, Number(e[o]) || 0), l = Math.max(0, Number(t[o]) || 0), u = Math.max(0, Number(i[o]) || 0), d = n - Math.max(0, c - l + u);
		d > 0 && (a[o] = d);
	}
	return a;
}
function le(e) {
	let { result: t, participantIds: n, anteAmount: r, expectedChipTotal: i, stackBeforeSettlement: a, carryInBeforeSettlement: o = 0, postedAntesBeforeSettlement: s = {} } = e, c = [], l = t.completedHandPot;
	if (t.tie && !t.splitPot) {
		t.carryoverPot !== l && c.push(`tie carry: carryoverPot ${t.carryoverPot} !== completedHandPot ${l}`);
		let e = Object.values(t.payoutByPlayer).reduce((e, t) => e + t, 0);
		e !== 0 && c.push(`tie carry: expected zero immediate payout, got ${e}`);
	}
	if (!t.tie && t.singleWinnerId) {
		t.carryoverPot !== 0 && c.push(`single winner: carryoverPot must be 0, got ${t.carryoverPot}`);
		let e = t.payoutByPlayer[t.singleWinnerId] ?? 0;
		e !== l && c.push(`single winner: payout ${e} !== completedHandPot ${l}`);
	}
	if (t.tie && t.splitPot) {
		t.carryoverPot !== 0 && c.push(`split pot: carryoverPot must be 0, got ${t.carryoverPot}`);
		let e = Object.values(t.splitPayoutByPlayer).reduce((e, t) => e + t, 0);
		e !== l && c.push(`split pot: splitPayoutByPlayer ${e} !== completedHandPot ${l}`);
		for (let e of t.tiedWinnerIds) {
			let n = t.fundingReasonByPlayer[e];
			n !== "normal_ante" && n !== "bourre_full_pot_penalty" && n !== "explicit_exempt" && n === "tie_carry_exempt" && c.push(`${e}: tied split-pot winner must not be tie_carry_exempt`);
		}
	}
	let u = n.reduce((e, n) => e + (t.fundingContributionByPlayer[n] ?? 0), 0);
	t.nextPot !== t.carryoverPot + u && c.push(`nextPot ${t.nextPot} !== carryoverPot ${t.carryoverPot} + funding ${u}`);
	for (let e of n) {
		let n = t.fundingReasonByPlayer[e], r = t.fundingContributionByPlayer[e] ?? 0;
		n === "bourre_full_pot_penalty" && r > 0 && r !== l && (r < l || r !== l && c.push(`${e}: bourré contribution ${r} !== completedHandPot ${l}`)), n === "bourre_full_pot_penalty" && n === t.fundingReasonByPlayer[e] && t.fundingReasonByPlayer[e] === "normal_ante" && t.bourrePlayerIds.includes(e) && c.push(`${e}: charged both bourré penalty and normal ante`), t.bourrePlayerIds.includes(e) && n === "bourre_full_pot_penalty" && t.fundingReasonByPlayer[e] === "normal_ante" && c.push(`${e}: bourré player charged normal ante`);
	}
	for (let e of n) {
		let n = t.settledStackByPlayer[e] ?? 0, r = t.fundingContributionByPlayer[e] ?? 0, i = t.rebuyContributionByPlayer[e] ?? 0, a = t.nextStartStackByPlayer[e] ?? 0;
		a !== Math.max(0, n - r + i) && c.push(`${e}: nextStart ${a} !== settled ${n} - contrib ${r} + rebuy ${i}`);
	}
	let d = Object.fromEntries(n.map((e) => [e, t.rebuyContributionByPlayer[e] ?? 0])), f = Object.values(d).reduce((e, t) => e + t, 0);
	if (a) {
		let e = {
			bankrolls: a,
			carryOverPot: o,
			postedAntes: s
		}, r = {
			bankrolls: t.settledStackByPlayer,
			carryOverPot: t.carryoverPot,
			postedAntes: {}
		}, i = P({
			before: e,
			after: r,
			label: "settlement"
		});
		c.push(...i.errors);
		let l = Object.fromEntries(n.map((e) => [e, t.fundingContributionByPlayer[e] ?? 0])), u = ce(t.settledStackByPlayer, t.nextStartStackByPlayer, t.fundingReasonByPlayer, l, d), f = Object.values(u).reduce((e, t) => e + t, 0), p = P({
			before: r,
			after: {
				bankrolls: t.nextStartStackByPlayer,
				carryOverPot: t.nextPot,
				postedAntes: {}
			},
			rebuyContributionByPlayer: d,
			label: "next-hand funding"
		});
		c.push(...p.errors), f > .001 && c.push(`bourré penalty minted ${f} chips without bankroll deduction (only explicit rebuy may mint)`);
		let m = Object.values(t.payoutByPlayer).reduce((e, t) => e + t, 0), h = Object.values(t.settledStackByPlayer).reduce((e, t) => e + t, 0) - Object.values(a).reduce((e, t) => e + t, 0), g = Math.max(0, Number(o) || 0) + Object.values(s).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), _ = Math.max(0, Number(t.carryoverPot) || 0) - g;
		Math.abs(h + _) > .001 && c.push("settlement must be zero-sum (bankroll + pot unchanged)"), Math.abs(h - m) > .001 && g > 0 && c.push("settlement payout does not reconcile with stack deltas");
	}
	if (i != null && a) {
		let e = N({
			bankrolls: t.nextStartStackByPlayer,
			carryOverPot: t.carryoverPot,
			postedAntes: Object.fromEntries(n.map((e) => [e, t.fundingContributionByPlayer[e] ?? 0]))
		}), r = N({
			bankrolls: a,
			carryOverPot: o,
			postedAntes: s
		}), l = i + f;
		Math.abs(e - l) > .001 && Math.abs(e - r - f) > .001 && c.push(`session chip total ${e} !== start ${r} + rebuy ${f}`);
	}
	return {
		ok: c.length === 0,
		errors: c
	};
}
function ue(e) {
	let { mode: t, winners: n, participants: r, tricksByPlayer: i, scoreById: a, sessionStake: o, carryIn: s = 0, postedAntes: l = {}, buyInFallback: u = 100, limEnabled: d = !1, splitPotEnabled: p = !1, explicitExemptPlayerIds: h = [] } = e, g = c({
		anteAmount: o,
		limEnabled: d,
		carryIn: s,
		antePot: r.reduce((e, t) => l[t] == null ? e : e + Math.max(0, Number(l[t]) || 0), 0)
	}).maxWinThisHand, _ = f(i, r), v = z(t, n, p), y = {};
	for (let e of r) y[e] = m(a[e], u);
	let b = F({
		completedHandPot: g,
		stackByPlayer: y,
		participants: r,
		singleWinnerId: v.singleWinnerId,
		tiedWinnerIds: v.tiedWinnerIds,
		bourrePlayerIds: _,
		splitPot: v.splitPot,
		potCarry: v.potCarry === !0,
		participantOrder: r
	}), x = {}, S = L({
		settledStackByPlayer: { ...b.settledStackByPlayer },
		completedHandPot: g,
		carryoverPot: b.carryoverPot,
		anteAmount: o,
		participantIds: r,
		bourrePlayerIds: _,
		tiedWinnerIds: b.tiedWinnerIds,
		splitPot: b.splitPot,
		tie: b.tie,
		explicitExemptPlayerIds: h,
		bourreReplacementRemainderByPlayer: x
	}), C = R(b, S, r, x);
	return {
		...b,
		...S,
		nextDealFunding: C
	};
}
function B(e, t = 100) {
	let { fundingContributionByPlayer: n, fundingReasonByPlayer: r } = I(e), i = {}, a = {}, o = [], s = [], c = {};
	for (let t of e.participantIds) {
		let l = Math.max(0, Number(e.settledStackByPlayer[t]) || 0), u = Math.max(0, Number(n[t]) || 0);
		if (u <= 0) {
			i[t] = l, a[t] = 0, s.push(t);
			continue;
		}
		let d = C(l, -u);
		i[t] = d.newBankroll, a[t] = Math.abs(d.appliedDelta), d.busted ? (o.push(t), r[t] === "bourre_full_pot_penalty" && u > Math.abs(d.appliedDelta) && (c[t] = u - Math.abs(d.appliedDelta))) : s.push(t);
	}
	let l = e.participantIds.reduce((e, t) => e + (a[t] ?? 0), 0), u = Math.max(0, Number(e.carryoverPot) || 0) + l;
	return {
		collected: {
			bankrolls: i,
			postedAntes: a,
			outIds: [...new Set(o)],
			activeParticipants: s
		},
		nextPot: u,
		bourreReplacementRemainderByPlayer: c,
		fundingContributionByPlayer: n,
		fundingReasonByPlayer: r
	};
}
function de({ mode: e, winners: t, participants: n, tricksByPlayer: r, anteAmount: i, limEnabled: a = !1, carryIn: o = 0, stakeForPlayer: s, antePot: l, splitPotEnabled: u = !1 }) {
	let d = c({
		anteAmount: i,
		limEnabled: a,
		carryIn: o,
		antePot: l ?? n.reduce((e, t) => e + s(t), 0)
	}), p = f(r, n), m = z(e, t, u), h = Object.fromEntries(n.map((e) => [e, 100])), g = F({
		completedHandPot: d.maxWinThisHand,
		stackByPlayer: h,
		participants: n,
		singleWinnerId: m.singleWinnerId,
		tiedWinnerIds: m.tiedWinnerIds,
		bourrePlayerIds: p,
		splitPot: m.splitPot,
		potCarry: m.potCarry === !0,
		participantOrder: n
	}), _ = I({
		settledStackByPlayer: g.settledStackByPlayer,
		completedHandPot: d.maxWinThisHand,
		carryoverPot: g.carryoverPot,
		anteAmount: i,
		participantIds: n,
		bourrePlayerIds: p,
		tiedWinnerIds: g.tiedWinnerIds,
		splitPot: g.splitPot,
		tie: g.tie
	}), v = {};
	for (let t of n) v[t] = (g.payoutByPlayer[t] ?? 0) - s(t), p.includes(t) && g.carryoverPot === 0 && e === "win" && (v[t] -= _.fundingContributionByPlayer[t] ?? 0);
	let y = p.length * d.maxWinThisHand;
	return {
		deltas: v,
		carryOverPot: g.carryoverPot,
		bourreIds: p,
		bourreMatch: y,
		potState: d,
		pot: d.currentPot,
		cappedPot: d.maxWinThisHand,
		overflow: d.overflow
	};
}
//#endregion
//#region src/game/money/pipeline.ts
var fe = V;
function V(e) {
	let { mode: t, winners: n, participants: r, tricksByPlayer: i, scoreById: a, sessionStake: o = 1, limEnabled: s = !1, carryIn: l = 0, postedAntes: u = {}, buyInFallback: d = 100, splitPotEnabled: g = !1 } = e, _ = c({
		anteAmount: o,
		limEnabled: s,
		carryIn: l,
		antePot: r.reduce((e, t) => e + (u[t] ?? h(a[t], o)), 0)
	}), v = f(i, r), y = z(t, n, g), b = {};
	for (let e of r) b[e] = m(a[e], d);
	let x = F({
		completedHandPot: _.maxWinThisHand,
		stackByPlayer: b,
		participants: r,
		singleWinnerId: y.singleWinnerId,
		tiedWinnerIds: y.tiedWinnerIds,
		bourrePlayerIds: v,
		splitPot: y.splitPot,
		potCarry: y.potCarry === !0,
		participantOrder: r
	}), S = I({
		settledStackByPlayer: x.settledStackByPlayer,
		completedHandPot: _.maxWinThisHand,
		carryoverPot: x.carryoverPot,
		anteAmount: o,
		participantIds: r,
		bourrePlayerIds: v,
		tiedWinnerIds: x.tiedWinnerIds,
		splitPot: x.splitPot,
		tie: x.tie
	}), C = B({
		settledStackByPlayer: x.settledStackByPlayer,
		completedHandPot: _.maxWinThisHand,
		carryoverPot: x.carryoverPot,
		anteAmount: o,
		participantIds: r,
		bourrePlayerIds: v,
		tiedWinnerIds: x.tiedWinnerIds,
		splitPot: x.splitPot,
		tie: x.tie
	}, d), w = C.bourreReplacementRemainderByPlayer, T = R(x, {
		...S,
		nextStartStackByPlayer: C.collected.bankrolls,
		nextPot: C.nextPot,
		carryoverPot: x.carryoverPot
	}, r, w);
	for (let e of r) {
		let t = w[e];
		t != null && t > 0 && T.byPlayer[e] && (T.byPlayer[e].bourreReplacementDue = t, T.byPlayer[e].fundingContribution = t, T.byPlayer[e].fundingReason = "bourre_full_pot_penalty");
	}
	let E = {}, D = {};
	for (let e of r) {
		let t = b[e] ?? 0, n = x.settledStackByPlayer[e] ?? t;
		E[e] = n - t, D[e] = n;
	}
	let O = { ...a };
	for (let e of r) {
		let t = D[e] ?? m(O[e], d), n = {
			...O[e],
			bankroll: t,
			net: p(t, d)
		}, r = T.byPlayer[e];
		r?.skipNextAnte && (n.skipNextAnte = !0), r?.bourreReplacementDue != null && (n.bourreReplacementDue = r.bourreReplacementDue), r?.fundingContribution != null && (n.fundingContribution = r.fundingContribution), O[e] = n;
	}
	le({
		result: {
			...x,
			...S,
			rebuyContributionByPlayer: {},
			splitPayoutByPlayer: x.splitPayoutByPlayer,
			nextStartStackByPlayer: Object.fromEntries(r.map((e) => [e, Math.max(0, (x.settledStackByPlayer[e] ?? 0) - (S.fundingContributionByPlayer[e] ?? 0))])),
			nextPot: T.nextPot
		},
		participantIds: r,
		anteAmount: o,
		stackBeforeSettlement: b,
		carryInBeforeSettlement: l,
		postedAntesBeforeSettlement: u
	});
	let k = { ...E }, A = v.length * _.maxWinThisHand;
	return {
		mode: t,
		winners: n,
		participants: r,
		bourreIds: v,
		potState: _,
		grossPot: _.currentPot,
		cappedPot: _.maxWinThisHand,
		overflow: _.overflow,
		bourreMatch: A,
		nominalDeltas: k,
		appliedDeltas: E,
		carryOverPot: x.carryoverPot,
		bankrolls: D,
		bourreRemainders: w,
		scoreById: O,
		nextDealFunding: {
			...T,
			settledPot: _.maxWinThisHand
		},
		solvent: {
			appliedDeltas: E,
			bankrolls: D,
			bustedIds: [],
			outIds: r.filter((e) => (D[e] ?? 0) <= 0),
			carryOverPot: x.carryoverPot,
			shortfall: 0
		},
		debug: {
			settledPot: _.currentPot,
			settledHandPot: _.currentPot,
			carryOverPot: x.carryoverPot,
			activePlayers: [...r],
			bourrePlayers: [...v],
			bourreReplacementDuePersisted: w,
			fundingFlagsRead: Object.fromEntries(r.map((e) => [e, T.byPlayer[e] ?? {}]))
		}
	};
}
function H(e) {
	let { scoreById: t, nextDealFunding: n, carryOverPot: r = 0, participantIds: i, sessionStake: a = 1, buyInFallback: o = 100, staleScoreById: s = null } = e, c = b(s ?? t, n);
	if ((n?.fundingContributionByPlayer != null || Object.values(n?.byPlayer ?? {}).some((e) => e?.fundingContribution != null)) && n) {
		let e = {};
		for (let t of i) e[t] = m(c[t], o);
		let t = B({
			settledStackByPlayer: e,
			completedHandPot: n.completedHandPot ?? n.settledPot ?? 0,
			carryoverPot: r,
			anteAmount: a,
			participantIds: i,
			bourrePlayerIds: n.bourrePlayerIds ?? [],
			tiedWinnerIds: n.tiedWinnerIds ?? [],
			splitPot: n.splitPot === !0,
			tie: n.tie === !0,
			bourreReplacementRemainderByPlayer: Object.fromEntries(i.map((e) => [e, c[e]?.bourreReplacementDue ?? null]).filter(([, e]) => e != null && e > 0))
		}, o), l = Object.fromEntries(i.map((e) => [e, {
			bourreReplacementDue: c[e]?.bourreReplacementDue ?? null,
			skipNextAnte: c[e]?.skipNextAnte === !0,
			fundingContribution: n.byPlayer[e]?.fundingContribution ?? n.fundingContributionByPlayer?.[e] ?? null,
			fundingReason: n.byPlayer[e]?.fundingReason ?? null
		}]));
		return {
			collected: {
				...t.collected,
				carryIn: r,
				antePot: Object.values(t.collected.postedAntes).reduce((e, t) => e + t, 0),
				nextHandPot: t.nextPot
			},
			mergedScoreById: c,
			nextHandPot: t.nextPot,
			debug: {
				nextDealFundingFlagsReadFromStorage: l,
				finalAntesCollected: { ...t.collected.postedAntes },
				nextHandPot: t.nextPot,
				usedStaleRead: s != null,
				canonicalFunding: !0
			}
		};
	}
	let l = x({
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
			usedStaleRead: s != null,
			canonicalFunding: !1
		}
	};
}
var pe = H;
function me(e) {
	let t = e.carryOverPot ?? 0, n = H(e), r = n.collected, i = r.antePot ?? Object.values(r.postedAntes ?? {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
	return {
		bankrolls: r.bankrolls,
		postedAntes: r.postedAntes,
		activeParticipants: r.activeParticipants,
		outIds: r.outIds,
		nextHandPot: n.nextHandPot,
		carryIn: t,
		antePot: i
	};
}
function U(e, t = {}) {
	let n = V(e), r = t.staleDealRead ? Object.fromEntries(e.participants.map((e) => {
		let t = { ...n.scoreById[e] };
		return delete t.bourreReplacementDue, delete t.skipNextAnte, delete t.fundingContribution, [e, t];
	})) : null, i = H({
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
var he = U;
function ge(e, t) {
	return f(e, t);
}
//#endregion
//#region src/game/money/idempotency.ts
function W(e, t, n, r = "") {
	return `${e}:${t}:${n ?? "_session"}${r ? `:${r}` : ""}`;
}
function G(e, t) {
	return e.some((e) => e.actionId === t);
}
function K(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) t.has(r.eventId) || (t.add(r.eventId), n.push(r));
	return n;
}
function _e(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) t.has(r.actionId) || (t.add(r.actionId), n.push(r));
	return n;
}
//#endregion
//#region src/game/money/replay.ts
var ve = {
	session_start: 0,
	ante_collect: 1,
	hand_settlement: 2,
	rebuy: 3,
	next_deal: 4,
	session_finalize: 5
};
function ye(e) {
	if (e == null) return "00000000";
	let t = Number(e);
	return Number.isFinite(t) ? String(t).padStart(8, "0") : e;
}
function q(e) {
	return [...e].sort((e, t) => {
		let n = ye(e.handId), r = ye(t.handId);
		if (n !== r) return n.localeCompare(r);
		let i = ve[e.phase] ?? 99, a = ve[t.phase] ?? 99;
		return i === a ? e.sequence - t.sequence : i - a;
	});
}
function be(e = 100) {
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
function xe(e, t = {}) {
	let n = t.buyInFallback ?? 100, r = {}, i = {}, a = {};
	for (let [t, o] of Object.entries(e || {})) r[t] = m(o, n), i[t] = Number(o?.net) || 0, a[t] = {
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
function Se(e, t) {
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
function J(e, t) {
	return q(K(e)).reduce(Se, t);
}
function Y(e) {
	let t = Object.values(e.bankrolls).reduce((e, t) => e + t, 0), n = Object.values(e.postedAntes).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
	return t + e.carryOverPot + n;
}
//#endregion
//#region src/game/money/processor.ts
function X(e, t) {
	let n = t.reduce((e, t) => Math.max(e, t.sequence), 0);
	return Math.max(e.sequence, n) + 1;
}
function Z(e, t, n) {
	let r = Y(e), i = [], a = [];
	if (t != null && r !== t && i.push(`chip total ${r} !== expected ${t}`), n) {
		let t = {
			bankrolls: e.bankrolls,
			carryOverPot: e.carryOverPot,
			postedAntes: e.postedAntes
		}, r = P({
			before: n.before,
			after: t,
			rebuyContributionByPlayer: n.rebuyContributionByPlayer,
			bourrePenaltyToPotByPlayer: n.bourrePenaltyToPotByPlayer,
			label: n.label
		});
		i.push(...r.errors);
	}
	for (let [t, n] of Object.entries(e.bankrolls)) n < 0 && i.push(`negative bankroll for ${t}: ${n}`);
	return {
		ok: i.length === 0,
		chipTotal: r,
		expectedChipTotal: t,
		errors: i,
		warnings: a
	};
}
function Ce(e) {
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
	if (G(i, t)) {
		let e = J(i, a);
		return {
			delta: {},
			newEvents: [],
			newBankrolls: e.bankrolls,
			carryOverPot: e.carryOverPot,
			postedAntes: e.postedAntes,
			invariants: Z(e, n.length * r),
			version: "v1"
		};
	}
	let o = X(a, i), s = n.map((e) => ({
		eventId: W(t, "BUY_IN_APPLIED", e),
		actionId: t,
		handId: null,
		phase: "session_start",
		sequence: o++,
		type: "BUY_IN_APPLIED",
		playerId: e,
		amount: r,
		metadata: {},
		timestamp: Date.now()
	})), c = J([...i, ...s], a), l = n.length * r;
	return {
		delta: Object.fromEntries(n.map((e) => [e, r])),
		newEvents: s,
		newBankrolls: c.bankrolls,
		carryOverPot: 0,
		postedAntes: {},
		invariants: Z(c, l),
		version: "v1"
	};
}
function we(e) {
	let { actionId: t, handId: n, carryOverPot: r, participantIds: i, scoreById: a, sessionStake: o, buyInFallback: c, nextDealFunding: l = null, existingEvents: u = [], ledger: d = {
		version: "v1",
		buyInFallback: c,
		bankrolls: Object.fromEntries(Object.entries(a).map(([e, t]) => [e, m(t, c)])),
		nets: Object.fromEntries(Object.entries(a).map(([e, t]) => [e, Number(t?.net) || 0])),
		carryOverPot: r,
		postedAntes: {},
		scoreFlags: {},
		sequence: 0
	} } = e;
	if (G(u, t)) {
		let e = H({
			scoreById: a,
			nextDealFunding: l,
			carryOverPot: r,
			participantIds: i,
			sessionStake: o,
			buyInFallback: c
		}), t = J(u, d);
		return {
			delta: {},
			newEvents: [],
			newBankrolls: e.collected.bankrolls,
			carryOverPot: t.carryOverPot,
			postedAntes: e.collected.postedAntes,
			invariants: Z(t),
			version: "v1",
			collected: e.collected
		};
	}
	let f = s(a, {
		carryOverPot: r,
		buyInFallback: c
	}), p = {
		bankrolls: Object.fromEntries(i.map((e) => [e, m(a[e], c)])),
		carryOverPot: r,
		postedAntes: {}
	}, h = H({
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
	}), g = X(d, u), _ = [];
	for (let [e, r] of Object.entries(h.collected.postedAntes)) {
		let i = Math.max(0, Number(r) || 0);
		i > 0 && _.push({
			eventId: W(t, "ANTE_DEDUCTED", e),
			actionId: t,
			handId: n,
			phase: "ante_collect",
			sequence: g++,
			type: "ANTE_DEDUCTED",
			playerId: e,
			amount: i,
			metadata: { sessionStake: o },
			timestamp: Date.now()
		});
	}
	let v = Z(J([...u, ..._], {
		...d,
		carryOverPot: r
	}), f, {
		before: p,
		label: "ante_collect"
	});
	return {
		delta: Object.fromEntries(Object.entries(h.collected.bankrolls).map(([e, t]) => [e, t - m(a[e], c)])),
		newEvents: _,
		newBankrolls: h.collected.bankrolls,
		carryOverPot: 0,
		postedAntes: h.collected.postedAntes,
		invariants: v,
		version: "v1",
		collected: h.collected
	};
}
function Te(e, t) {
	return e ? `ante:${e}:${t}` : `ante:${t}`;
}
function Ee(e, t) {
	let { sessionId: n, handId: r, postedAntes: i, sessionStake: a, startSequence: o } = t, s = Te(n, r);
	if (G(e, s) || Object.values(i || {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0) <= 0 || e.filter((e) => e.type === "ANTE_DEDUCTED" && e.handId === r).length > 0) return [];
	let c = [], l = o;
	for (let [t, n] of Object.entries(i || {})) {
		let i = Math.max(0, Number(n) || 0);
		if (i <= 0) continue;
		let o = W(s, "ANTE_DEDUCTED", t);
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
	let { actionId: t, handId: n, sessionId: r, existingEvents: i = [], ledger: a, ...o } = e, c = o.buyInFallback ?? 100, l = a ?? be(c);
	if (G(i, t)) {
		let e = V(o), t = J(i, l);
		return {
			delta: {},
			newEvents: [],
			newBankrolls: t.bankrolls,
			carryOverPot: t.carryOverPot,
			postedAntes: {},
			invariants: Z(t),
			version: "v1",
			settlement: e
		};
	}
	let u = s(o.scoreById, {
		carryOverPot: o.carryIn ?? 0,
		postedAntes: o.postedAntes ?? {},
		buyInFallback: c
	}), d = V(o), f = X(l, i), p = Ee(i, {
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
				eventId: W(t, "BOURRE_LIABILITY", e),
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
				eventId: W(t, "SETTLEMENT_DEBIT", e),
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
				eventId: W(t, i, e),
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
		eventId: W(t, "CARRY_OVER_SET", null),
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
			eventId: W(t, "NEXT_DEAL_FUNDING", e),
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
	let h = Z(J([...i, ...m], l), u);
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
function De(e) {
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
	if (G(a, t)) {
		let e = J(a, o);
		return {
			delta: {},
			newEvents: [],
			newBankrolls: e.bankrolls,
			carryOverPot: e.carryOverPot,
			postedAntes: e.postedAntes,
			invariants: Z(e),
			version: "v1"
		};
	}
	let { rebuyContributionByPlayer: s } = se({
		stackByPlayer: o.bankrolls,
		participantIds: [n],
		rebuyEnabled: !0,
		rebuyAmount: r,
		rebuyPlayerIds: [n]
	}), c = s[n] ?? r, l = Y(o), u = X(o, a), d = [{
		eventId: W(t, "REBUY_APPLIED", n),
		actionId: t,
		handId: i,
		phase: "rebuy",
		sequence: u,
		type: "REBUY_APPLIED",
		playerId: n,
		amount: c,
		metadata: { fundingReason: "rebuy" },
		timestamp: Date.now()
	}], f = {
		bankrolls: Object.fromEntries(Object.keys(o.bankrolls).map((e) => [e, o.bankrolls[e] ?? 0])),
		carryOverPot: o.carryOverPot,
		postedAntes: { ...o.postedAntes }
	}, p = J([...a, ...d], o), m = Z(p, l + c, {
		before: f,
		rebuyContributionByPlayer: { [n]: c },
		label: "rebuy"
	});
	return {
		delta: { [n]: c },
		newEvents: d,
		newBankrolls: p.bankrolls,
		carryOverPot: p.carryOverPot,
		postedAntes: p.postedAntes,
		invariants: m,
		version: "v1"
	};
}
var Oe = we, ke = Q;
//#endregion
//#region src/game/money/explain.ts
function Ae(e, t = 100) {
	let n = q(e), r = [`Money event log (${n.length} events, buy-in ${t})`, ""], i = null;
	for (let e of n) {
		e.handId !== i && (i = e.handId, r.push(i == null ? "--- Session ---" : `--- Hand ${i} ---`));
		let t = e.playerId ?? "table", n = e.amount >= 0 ? "+" : "", a = Object.keys(e.metadata || {}).length > 0 ? ` ${JSON.stringify(e.metadata)}` : "";
		r.push(`  [${e.sequence}] ${e.phase} ${e.type} ${t}: ${n}${e.amount}${a}`);
	}
	return r.join("\n");
}
//#endregion
//#region src/game/money/finalize.ts
function $(e) {
	let t = e.buyInFallback ?? 100, n = e.initialLedger ?? xe(e.scoreById ?? {}, {
		buyInFallback: t,
		carryOverPot: e.carryOverPot ?? 0,
		postedAntes: e.postedAntes ?? {}
	}), r = J(e.events, n), i = Y(r), a = [], o = [];
	if (e.scoreById) for (let [n, i] of Object.entries(e.scoreById)) {
		let e = m(i, t), o = r.bankrolls[n];
		o != null && e !== o && a.push(`bankroll drift for ${n}: stored=${e}, replay=${o}`);
	}
	let c = e.playerCount == null ? e.scoreById ? s(e.scoreById, {
		carryOverPot: e.carryOverPot ?? 0,
		postedAntes: e.postedAntes ?? {},
		buyInFallback: t
	}) : void 0 : e.playerCount * t;
	c != null && i !== c && o.push(`chip total ${i} differs from session snapshot ${c} (may include rebuys)`);
	let l = Ae(e.events, t);
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
function je(e) {
	return e?.moneyEngineVersion === "v1";
}
function Me(e, t) {
	if (!e) throw Error("Session not found");
	if (e.status === "final") throw Error("Session is final");
	if (e.moneyEngineVersion && e.moneyEngineVersion !== "v1") throw Error(`Session uses money engine ${e.moneyEngineVersion}; cannot ${t} with v1`);
}
function Ne(e, t, n = {}) {
	let r = $({
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
export { r as DEFAULT_BOURRE_SETTINGS, n as DEFAULT_HAND_ANTE, l as MAX_TRICKS_PER_HAND, e as MONEY_ENGINE_VERSION, t as POT_CAP_MULTIPLIER, ee as anteAlreadyPosted, C as applyBankrollDelta, B as applyFundingWithSolvency, L as applyNextHandFunding, M as applyRecordHandFundingToScores, ne as applySolventSettlement, re as assertChipConservation, Me as assertMoneyEngineCompatible, ge as bourreIdsFromTricks, f as bourrePlayerIds, ce as bourrePotMintByPlayer, te as bourreRemaindersFromSettlement, Ee as buildMissingDealAnteEvents, R as buildNextDealFunding, y as buildNextDealFundingSnapshot, O as buildSoloWinSettlement, w as canEnrollWithBankroll, me as collectFundingForHandStart, A as collectHandAntes, x as collectNextHandAntes, ae as computeCarryoverPot, $ as computeFinalBankrolls, I as computeFundingContributionByPlayer, c as computeHandPotState, se as computeRebuyContributions, oe as computeSplitPotPayout, Te as dealAnteActionId, _e as dedupeEventsByActionId, K as dedupeEventsById, p as deriveScoreNet, T as eligibleIdsForAnteCollection, be as emptyLedgerState, Ae as explainMoneyEvents, h as handAnteContribution, G as hasActionBeenApplied, ie as isChipConserved, d as isHandComplete, je as isMoneyEngineV1, Y as ledgerChipTotal, xe as ledgerFromScoreById, S as logBourreAccounting, W as makeEventId, b as mergeNextDealFundingIntoScoreById, v as nextDealFundingFlags, i as normalizeBourreSettings, we as processAnte, ke as processBourreLiability, Ce as processBuyIn, Q as processHandSettlement, Oe as processNextDealFunding, De as processRebuy, _ as projectNextHandPot, V as recordHandSettlement, J as replayEvents, o as resolveSessionBuyIn, z as resolveSettlementBranch, ue as runCanonicalMoneyFlow, U as runHandMoneyFlow, he as runProductionSettlementDealFlow, m as scoreBankroll, s as sessionChipTotal, F as settleCompletedHand, de as settleHandDeltas, k as settleSoloDefaultWin, D as settleSoloPrefundedWin, j as settlementShortfall, pe as simulatePagatHandStartFunding, fe as simulateRecordHandSettlement, E as soloWinPotAlreadyFunded, q as sortMoneyEvents, a as splitPotVoteAllowed, H as startNextHandFunding, g as sumProjectedHandAntes, N as tableChipTotal, u as totalTricksPlayed, P as validateChipGrowthInvariant, le as validateMoneyInvariants, Ne as validateReplayMatchesDerived };
