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
		return r?.out === !0 || r?.sitOut === !0 ? !1 : w(m(r, n));
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
		let c = ie({
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
		let e = ne(t[i] ?? 0, n[i] ?? 0);
		e > 0 && (r[i] = e);
	}
	return r;
}
function ne(e, t) {
	let n = Number(e) || 0, r = Number(t) || 0;
	return n < 0 && r > n ? r - n : 0;
}
function re({ mode: e, winners: t, participants: n, nominalDeltas: r, scoreById: i, carryOverPot: a, buyInFallback: o = 0, stakeForPlayer: s = () => 0 }) {
	let c = {}, l = {}, u = [];
	for (let e of n) {
		let t = m(i[e], o), n = r[e] ?? 0;
		if (n < 0) {
			let r = C(t, n);
			c[e] = r.appliedDelta, l[e] = r.newBankroll, r.busted && u.push(e);
		} else c[e] = 0, l[e] = t;
	}
	let d = 0;
	for (let e of n) d += ne(r[e] ?? 0, c[e] ?? 0);
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
function ie({ scoreById: e, participants: t, mode: n, winners: r, bourreIds: i, potState: a, bourreRemaindersByPlayer: o = {} }) {
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
function j(e) {
	let t = Object.values(e.bankrolls || {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), n = Math.max(0, Number(e.carryOverPot) || 0), r = Object.values(e.postedAntes || {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
	return t + n + r;
}
function M(e) {
	let t = e.tolerance ?? .001, n = [], r = j(e.before), i = j(e.after) - r, a = Object.values(e.rebuyContributionByPlayer ?? {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), o = Object.values(e.bourrePenaltyToPotByPlayer ?? {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
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
function ae(e, t = {}) {
	let n = s(e, t);
	if (t.expectedTotal != null && n !== t.expectedTotal) {
		let e = t.label ? `${t.label}: ` : "";
		throw Error(`${e}chip conservation failed — total ${n}, expected ${t.expectedTotal}`);
	}
	return n;
}
function oe(e, t) {
	return s(e, t) === t.expectedTotal;
}
//#endregion
//#region src/game/money/canonical.ts
function se(e, t, n) {
	return t && !n ? Math.max(0, Number(e) || 0) : 0;
}
function ce(e, t, n) {
	let r = Math.max(0, Number(e) || 0), i = t.filter((e) => n.includes(e)), a = {};
	if (!i.length || r <= 0) return a;
	let o = Math.floor(r / i.length), s = r - o * i.length, c = n.filter((e) => i.includes(e));
	for (let e of c) {
		let t = +(s > 0);
		s > 0 && --s, a[e] = o + t;
	}
	return a;
}
function le(e) {
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
function N(e) {
	let { completedHandPot: t, stackByPlayer: n, participants: r, singleWinnerId: i = null, tiedWinnerIds: a = [], bourrePlayerIds: o = [], splitPot: s, potCarry: c = !1, seatOrder: l = e.participantOrder ?? r } = e, u = Math.max(0, Number(t) || 0), d = a.length >= 2 || c, f = {}, p = {}, m = {};
	for (let e of r) m[e] = Math.max(0, Number(n[e]) || 0), f[e] = 0, p[e] = 0;
	if (d && !s) return {
		completedHandPot: u,
		carryoverPot: se(u, !0, !1),
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
		let e = ce(u, a, l);
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
function P(e) {
	let { completedHandPot: t, carryoverPot: n, anteAmount: r, participantIds: i, bourrePlayerIds: a, tiedWinnerIds: o, splitPot: s, tie: c, explicitExemptPlayerIds: l = [], bourreReplacementRemainderByPlayer: u = {} } = e, d = {}, f = {}, p = Math.max(0, Number(t) || 0), m = Math.max(.01, Number(r) || 1), h = new Set(l);
	for (let e of i) {
		let t = u[e];
		a.includes(e) ? (d[e] = p, f[e] = "bourre_full_pot_penalty") : t != null && t > 0 ? (d[e] = t, f[e] = "bourre_full_pot_penalty") : c && !s && o.includes(e) ? (d[e] = 0, f[e] = "tie_carry_exempt") : h.has(e) ? (d[e] = 0, f[e] = "explicit_exempt") : (d[e] = m, f[e] = "normal_ante");
	}
	return {
		fundingContributionByPlayer: d,
		fundingReasonByPlayer: f
	};
}
function ue(e) {
	let { settledStackByPlayer: t, carryoverPot: n, participantIds: r, rebuyContributionByPlayer: i = {} } = e, { fundingContributionByPlayer: a, fundingReasonByPlayer: o } = P(e), s = {};
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
function de(e, t, n, r = {}) {
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
function F(e, t, n) {
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
function I(e, t, n, r, i = {}) {
	let a = {};
	for (let [o, s] of Object.entries(n)) {
		if (s !== "bourre_full_pot_penalty") continue;
		let n = Math.max(0, Number(r[o]) || 0), c = Math.max(0, Number(e[o]) || 0), l = Math.max(0, Number(t[o]) || 0), u = Math.max(0, Number(i[o]) || 0), d = n - Math.max(0, c - l + u);
		d > 0 && (a[o] = d);
	}
	return a;
}
function fe(e) {
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
		}, i = M({
			before: e,
			after: r,
			label: "settlement"
		});
		c.push(...i.errors);
		let l = Object.fromEntries(n.map((e) => [e, t.fundingContributionByPlayer[e] ?? 0])), u = I(t.settledStackByPlayer, t.nextStartStackByPlayer, t.fundingReasonByPlayer, l, d), f = Object.values(u).reduce((e, t) => e + t, 0), p = M({
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
		let e = j({
			bankrolls: t.nextStartStackByPlayer,
			carryOverPot: t.carryoverPot,
			postedAntes: Object.fromEntries(n.map((e) => [e, t.fundingContributionByPlayer[e] ?? 0]))
		}), r = j({
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
function pe(e) {
	let { mode: t, winners: n, participants: r, tricksByPlayer: i, scoreById: a, sessionStake: o, carryIn: s = 0, postedAntes: l = {}, buyInFallback: u = 100, limEnabled: d = !1, splitPotEnabled: p = !1, explicitExemptPlayerIds: h = [] } = e, g = c({
		anteAmount: o,
		limEnabled: d,
		carryIn: s,
		antePot: r.reduce((e, t) => l[t] == null ? e : e + Math.max(0, Number(l[t]) || 0), 0)
	}).maxWinThisHand, _ = f(i, r), v = F(t, n, p), y = {};
	for (let e of r) y[e] = m(a[e], u);
	let b = N({
		completedHandPot: g,
		stackByPlayer: y,
		participants: r,
		singleWinnerId: v.singleWinnerId,
		tiedWinnerIds: v.tiedWinnerIds,
		bourrePlayerIds: _,
		splitPot: v.splitPot,
		potCarry: v.potCarry === !0,
		participantOrder: r
	}), x = {}, S = ue({
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
	}), C = de(b, S, r, x);
	return {
		...b,
		...S,
		nextDealFunding: C
	};
}
function me(e, t = 100) {
	let { fundingContributionByPlayer: n, fundingReasonByPlayer: r } = P(e), i = {}, a = {}, o = [], s = [], c = {};
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
function he({ mode: e, winners: t, participants: n, tricksByPlayer: r, anteAmount: i, limEnabled: a = !1, carryIn: o = 0, stakeForPlayer: s, antePot: l, splitPotEnabled: u = !1 }) {
	let d = c({
		anteAmount: i,
		limEnabled: a,
		carryIn: o,
		antePot: l ?? n.reduce((e, t) => e + s(t), 0)
	}), p = f(r, n), m = F(e, t, u), h = Object.fromEntries(n.map((e) => [e, 100])), g = N({
		completedHandPot: d.maxWinThisHand,
		stackByPlayer: h,
		participants: n,
		singleWinnerId: m.singleWinnerId,
		tiedWinnerIds: m.tiedWinnerIds,
		bourrePlayerIds: p,
		splitPot: m.splitPot,
		potCarry: m.potCarry === !0,
		participantOrder: n
	}), _ = P({
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
//#region src/game/money/settlementAudit.ts
var L = typeof process < "u" && process.env?.BOURRE_SETTLEMENT_AUDIT === "1" || !1;
function ge(e) {
	return Math.max(0, Number(e.carryOverPot) || 0) + Object.values(e.postedAntes ?? {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
}
function _e(e, t, n = .001) {
	let r = e.payout;
	Math.abs(e.settlementDelta - r) > n && t.push(`${e.playerId}: settlement delta ${e.settlementDelta} !== payout ${r}`);
	let i = e.bankrollAfterSettlement - e.fundingContribution - e.bankrollAfterFunding;
	Math.abs(i) > n && t.push(`${e.playerId}: funding ${e.fundingContribution} does not reconcile (${e.bankrollAfterSettlement} → ${e.bankrollAfterFunding})`);
	let a = e.bankrollAfterFunding - e.bankrollStart;
	Math.abs(e.netDelta - a) > n && t.push(`${e.playerId}: net delta ${e.netDelta} !== end-start ${a}`);
}
function ve(e) {
	let t = e.buyInFallback ?? 100, n = e.sessionStake ?? 20, r = e.carryIn ?? 0, i = e.mode ?? "win", a = e.allPlayerIds ?? e.participants, o = [], s = {};
	for (let n of a) s[n] = m(e.scoreById[n], t);
	let c = A({
		participants: e.participants,
		scoreById: e.scoreById,
		buyInFallback: t,
		stakeForPlayer: () => n
	}), l = c.postedAntes, u = { ...e.scoreById };
	for (let n of e.participants) {
		let r = c.bankrolls[n] ?? m(e.scoreById[n], t);
		u[n] = {
			...u[n],
			bankroll: r,
			net: p(r, t)
		};
	}
	let d = {
		bankrolls: { ...s },
		carryOverPot: r,
		postedAntes: {}
	}, h = {
		bankrolls: Object.fromEntries(a.map((t) => [t, e.participants.includes(t) ? c.bankrolls[t] ?? s[t] : s[t]])),
		carryOverPot: r,
		postedAntes: l
	}, g = j(d), _ = ge(h), v = Ce({
		mode: i,
		winners: e.winners,
		participants: e.participants,
		tricksByPlayer: e.tricksByPlayer,
		scoreById: u,
		sessionStake: n,
		carryIn: r,
		postedAntes: l,
		buyInFallback: t,
		splitPotEnabled: e.splitPotEnabled
	}), y = v.settlement, b = v.deal.collected, x = f(e.tricksByPlayer, e.participants), S = {
		bankrolls: Object.fromEntries(a.map((n) => [n, e.participants.includes(n) ? y.bankrolls[n] ?? m(u[n], t) : s[n]])),
		carryOverPot: y.carryOverPot,
		postedAntes: {}
	}, C = Object.fromEntries(a.map((t) => [t, e.participants.includes(t) ? b.bankrolls[t] ?? S.bankrolls[t] ?? 0 : s[t]]));
	b.postedAntes;
	let w = v.deal.nextHandPot ?? (b.carryIn ?? 0) + Object.values(b.postedAntes ?? {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), T = j(S), E = Object.values(C).reduce((e, t) => e + t, 0) + w, D = ge(S), O = w;
	Math.abs(T - g) > .001 && o.push(`settlement not zero-sum: chips ${g} → ${T}`), Math.abs(E - g) > .001 && o.push(`full cycle not zero-sum: chips ${g} → ${E}`), Math.abs(D + Object.values(S.bankrolls).reduce((e, t) => e + t, 0) - T) > .001 && o.push("potAfterSettlement does not reconcile with chip total");
	let k = e.participants.map((n) => {
		let r = c.bankrolls[n] ?? s[n], i = y.bankrolls[n] ?? r, a = b.bankrolls[n] ?? i, u = y.nextDealFunding.byPlayer[n], d = y.appliedDeltas[n] ?? i - r, f = {
			playerId: n,
			bankrollStart: s[n] ?? t,
			postedAnte: l[n] ?? 0,
			bankrollAfterAnte: r,
			tricks: e.tricksByPlayer[n] ?? 0,
			isWinner: e.winners.includes(n),
			isBourre: x.includes(n),
			payout: d,
			bankrollAfterSettlement: i,
			settlementDelta: i - r,
			fundingContribution: b.postedAntes[n] ?? u?.fundingContribution ?? 0,
			fundingReason: u?.fundingReason ?? null,
			bankrollAfterFunding: a,
			fundingDelta: a - i,
			netDelta: a - (s[n] ?? t)
		};
		return _e(f, o), f;
	}), ee = {
		scenarioId: e.scenarioId,
		playerCount: e.participants.length,
		mode: i,
		participants: e.participants,
		winners: e.winners,
		ok: o.length === 0,
		errors: o,
		carryIn: r,
		potBefore: _,
		potAfterSettlement: D,
		potAfterFunding: O,
		chipTotalBefore: g,
		chipTotalAfterSettlement: T,
		chipTotalAfterFunding: E,
		players: k,
		settlement: y
	};
	return L && console.info("[settlement-audit]", be(ee)), ee;
}
function ye(e) {
	let t = e.buyInFallback ?? 100, n = e.sessionStake ?? 20, r = [], i = Object.fromEntries(e.participants.map((n) => {
		let r = e.postedAntes[n] ?? 0;
		return [n, m(e.scoreById[n], t) + r];
	})), a = O({
		winnerId: e.winnerId,
		carryIn: e.carryIn ?? 0,
		postedAntes: e.postedAntes,
		scoreById: e.scoreById,
		buyInFallback: t,
		participants: e.participants,
		sessionStake: n
	});
	if (!a.ready) return {
		scenarioId: e.scenarioId,
		playerCount: e.participants.length,
		mode: "win",
		participants: e.participants,
		winners: [e.winnerId],
		ok: !1,
		errors: [`solo win not ready: ${a.reason ?? "unknown"}`],
		carryIn: e.carryIn ?? 0,
		potBefore: 0,
		potAfterSettlement: 0,
		potAfterFunding: 0,
		chipTotalBefore: s(e.scoreById, { buyInFallback: t }),
		chipTotalAfterSettlement: 0,
		chipTotalAfterFunding: 0,
		players: [],
		settlement: {},
		soloReady: !1
	};
	let o = a.settledBankrolls ?? a.bankrolls ?? {}, c = Object.values(i).reduce((e, t) => e + t, 0) + (e.carryIn ?? 0), l = Object.values(o).reduce((e, t) => e + (Number(t) || 0), 0);
	Math.abs(c - l) > .001 && r.push(`solo win settlement not zero-sum: ${c} → ${l}`);
	let u = B({
		scoreById: a.fundedScoreById ?? e.scoreById,
		nextDealFunding: a.nextDealFunding,
		carryOverPot: 0,
		participantIds: e.participants,
		sessionStake: n,
		buyInFallback: t
	}), d = Object.values(u.bankrolls).reduce((e, t) => e + (Number(t) || 0), 0) + (u.nextHandPot ?? 0);
	Math.abs(c - d) > .001 && r.push(`solo win full cycle not zero-sum: ${c} → ${d}`);
	let f = e.participants.map((n) => {
		let r = i[n] ?? t, a = e.postedAntes[n] ?? 0, s = m(e.scoreById[n], t), c = o[n] ?? s, l = u.bankrolls[n] ?? c, d = u.postedAntes[n] ?? 0;
		return {
			playerId: n,
			bankrollStart: r,
			postedAnte: a,
			bankrollAfterAnte: s,
			tricks: 0,
			isWinner: n === e.winnerId,
			isBourre: !1,
			payout: c - s,
			bankrollAfterSettlement: c,
			settlementDelta: c - s,
			fundingContribution: d,
			fundingReason: null,
			bankrollAfterFunding: l,
			fundingDelta: l - c,
			netDelta: l - r
		};
	});
	for (let t of e.participants) if (t !== e.winnerId && f.find((e) => e.playerId === t)) {
		let e = f.find((e) => e.playerId === t);
		if (e.settlementDelta !== 0 && r.push(`${t}: folded player should have zero settlement delta, got ${e.settlementDelta}`), e.postedAnte > 0 && e.netDelta !== -e.postedAnte - (u.postedAntes[t] ?? 0)) {
			let n = -e.postedAnte - (u.postedAntes[t] ?? 0);
			Math.abs(e.netDelta - n) > .001 && r.push(`${t}: fold path net delta ${e.netDelta} !== -ante -nextAnte (${n})`);
		}
	}
	let p = {
		scenarioId: e.scenarioId,
		playerCount: e.participants.length,
		mode: "win",
		participants: e.participants,
		winners: [e.winnerId],
		ok: r.length === 0,
		errors: r,
		carryIn: e.carryIn ?? 0,
		potBefore: (e.carryIn ?? 0) + Object.values(e.postedAntes).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0),
		potAfterSettlement: 0,
		potAfterFunding: u.nextHandPot,
		chipTotalBefore: c,
		chipTotalAfterSettlement: l,
		chipTotalAfterFunding: d,
		players: f,
		settlement: {}
	};
	return L && console.info("[settlement-audit]", be(p)), {
		...p,
		soloReady: !0
	};
}
function be(e) {
	let t = [
		`=== ${e.scenarioId} (${e.playerCount}p, mode=${e.mode}) ===`,
		`ok=${e.ok} errors=${e.errors.length}`,
		`pot: ${e.potBefore} → settle:${e.potAfterSettlement} → fund:${e.potAfterFunding}`,
		`chips: ${e.chipTotalBefore} → ${e.chipTotalAfterSettlement} → ${e.chipTotalAfterFunding}`,
		`winners=[${e.winners.join(",")}] participants=[${e.participants.join(",")}]`
	];
	if (e.errors.length) {
		t.push("ERRORS:");
		for (let n of e.errors) t.push(`  - ${n}`);
	}
	for (let n of e.players) t.push(`  ${n.playerId}: start=${n.bankrollStart} ante=${n.postedAnte} tricks=${n.tricks} settleΔ=${n.settlementDelta} fund=${n.fundingContribution}(${n.fundingReason}) end=${n.bankrollAfterFunding} netΔ=${n.netDelta}${n.isBourre ? " BOURRÉ" : ""}${n.isWinner ? " WIN" : ""}`);
	return t.join("\n");
}
//#endregion
//#region src/game/money/pipeline.ts
var xe = R;
function R(e) {
	let { mode: t, winners: n, participants: r, tricksByPlayer: i, scoreById: a, sessionStake: o = 1, limEnabled: s = !1, carryIn: l = 0, postedAntes: u = {}, buyInFallback: d = 100, splitPotEnabled: g = !1 } = e, _ = c({
		anteAmount: o,
		limEnabled: s,
		carryIn: l,
		antePot: r.reduce((e, t) => e + (u[t] ?? h(a[t], o)), 0)
	}), v = f(i, r), y = F(t, n, g), b = {};
	for (let e of r) b[e] = m(a[e], d);
	let x = N({
		completedHandPot: _.maxWinThisHand,
		stackByPlayer: b,
		participants: r,
		singleWinnerId: y.singleWinnerId,
		tiedWinnerIds: y.tiedWinnerIds,
		bourrePlayerIds: v,
		splitPot: y.splitPot,
		potCarry: y.potCarry === !0,
		participantOrder: r
	}), S = P({
		settledStackByPlayer: x.settledStackByPlayer,
		completedHandPot: _.maxWinThisHand,
		carryoverPot: x.carryoverPot,
		anteAmount: o,
		participantIds: r,
		bourrePlayerIds: v,
		tiedWinnerIds: x.tiedWinnerIds,
		splitPot: x.splitPot,
		tie: x.tie
	}), C = me({
		settledStackByPlayer: x.settledStackByPlayer,
		completedHandPot: _.maxWinThisHand,
		carryoverPot: x.carryoverPot,
		anteAmount: o,
		participantIds: r,
		bourrePlayerIds: v,
		tiedWinnerIds: x.tiedWinnerIds,
		splitPot: x.splitPot,
		tie: x.tie
	}, d), w = C.bourreReplacementRemainderByPlayer, T = de(x, {
		...S,
		nextStartStackByPlayer: C.collected.bankrolls,
		nextPot: C.nextPot,
		carryoverPot: x.carryoverPot
	}, r, w);
	for (let e of r) {
		let t = w[e];
		t != null && t > 0 && T.byPlayer[e] && (T.byPlayer[e].bourreReplacementDue = t);
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
	fe({
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
	}), L && (console.info("[settlement-audit:pre-settle]", {
		mode: t,
		winners: n,
		participants: r,
		carryIn: l,
		postedAntes: u,
		stackByPlayer: b,
		completedHandPot: _.maxWinThisHand,
		bourreIds: v
	}), console.info("[settlement-audit:post-settle]", {
		carryOverPot: x.carryoverPot,
		bankrolls: D,
		appliedDeltas: E,
		nextDealFunding: {
			nextPot: T.nextPot,
			bourrePlayerIds: T.bourrePlayerIds,
			fundingContributionByPlayer: T.fundingContributionByPlayer
		}
	}));
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
function z(e) {
	let { scoreById: t, nextDealFunding: n, carryOverPot: r = 0, participantIds: i, sessionStake: a = 1, buyInFallback: o = 100, staleScoreById: s = null } = e, c = b(s ?? t, n);
	if ((n?.fundingContributionByPlayer != null || Object.values(n?.byPlayer ?? {}).some((e) => e?.fundingContribution != null)) && n) {
		let e = {};
		for (let t of i) e[t] = m(c[t], o);
		let t = me({
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
var Se = z;
function B(e) {
	let t = e.carryOverPot ?? 0, n = z(e), r = n.collected, i = r.antePot ?? Object.values(r.postedAntes ?? {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
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
function Ce(e, t = {}) {
	let n = R(e), r = t.staleDealRead ? Object.fromEntries(e.participants.map((e) => {
		let t = { ...n.scoreById[e] };
		return delete t.bourreReplacementDue, delete t.skipNextAnte, delete t.fundingContribution, [e, t];
	})) : null, i = z({
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
var we = Ce;
function Te(e, t) {
	return f(e, t);
}
//#endregion
//#region src/game/money/idempotency.ts
function V(e, t, n, r = "") {
	return `${e}:${t}:${n ?? "_session"}${r ? `:${r}` : ""}`;
}
function H(e, t) {
	return e.some((e) => e.actionId === t);
}
function Ee(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) t.has(r.eventId) || (t.add(r.eventId), n.push(r));
	return n;
}
function De(e) {
	let t = /* @__PURE__ */ new Set(), n = [];
	for (let r of e) t.has(r.actionId) || (t.add(r.actionId), n.push(r));
	return n;
}
//#endregion
//#region src/game/money/replay.ts
var Oe = {
	session_start: 0,
	ante_collect: 1,
	hand_settlement: 2,
	rebuy: 3,
	next_deal: 4,
	session_finalize: 5
};
function ke(e) {
	if (e == null) return "00000000";
	let t = Number(e);
	return Number.isFinite(t) ? String(t).padStart(8, "0") : e;
}
function Ae(e) {
	return [...e].sort((e, t) => {
		let n = ke(e.handId), r = ke(t.handId);
		if (n !== r) return n.localeCompare(r);
		let i = Oe[e.phase] ?? 99, a = Oe[t.phase] ?? 99;
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
function je(e, t) {
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
		case "CASH_OUT_APPLIED":
			if (r) {
				let e = n.bankrolls[r] ?? 0;
				n.bankrolls[r] = Math.max(0, e - i), n.bankrolls[r] <= 0 && (n.scoreFlags[r] = {
					...n.scoreFlags[r],
					out: !0
				});
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
	return Ae(Ee(e)).reduce(je, t);
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
function J(e, t, n) {
	let r = K(e), i = [], a = [];
	if (t != null && r !== t && i.push(`chip total ${r} !== expected ${t}`), n) {
		let t = {
			bankrolls: e.bankrolls,
			carryOverPot: e.carryOverPot,
			postedAntes: e.postedAntes
		}, r = M({
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
function Me(e) {
	let { actionId: t, playerIds: n, buyInAmount: r, existingEvents: i = [], ledger: a = {
		version: "v1",
		buyInFallback: r,
		bankrolls: {},
		nets: {},
		carryOverPot: 0,
		postedAntes: {},
		scoreFlags: {},
		sequence: 0
	} } = e, o = G(i, a), s = K(o);
	if (H(i, t)) {
		let e = G(i, a);
		return {
			delta: {},
			newEvents: [],
			newBankrolls: e.bankrolls,
			carryOverPot: e.carryOverPot,
			postedAntes: e.postedAntes,
			invariants: J(e, s),
			version: "v1"
		};
	}
	let c = q(o, i), l = n.map((e) => ({
		eventId: V(t, "BUY_IN_APPLIED", e),
		actionId: t,
		handId: null,
		phase: "session_start",
		sequence: c++,
		type: "BUY_IN_APPLIED",
		playerId: e,
		amount: r,
		metadata: {},
		timestamp: Date.now()
	})), u = G([...i, ...l], a), d = s + n.length * r;
	return {
		delta: Object.fromEntries(n.map((e) => [e, r])),
		newEvents: l,
		newBankrolls: u.bankrolls,
		carryOverPot: 0,
		postedAntes: {},
		invariants: J(u, d),
		version: "v1"
	};
}
function Ne(e) {
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
	if (H(u, t)) {
		let e = z({
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
			newBankrolls: e.collected.bankrolls,
			carryOverPot: t.carryOverPot,
			postedAntes: e.collected.postedAntes,
			invariants: J(t),
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
	}, h = z({
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
	}), g = q(d, u), _ = [];
	for (let [e, r] of Object.entries(h.collected.postedAntes)) {
		let i = Math.max(0, Number(r) || 0);
		i > 0 && _.push({
			eventId: V(t, "ANTE_DEDUCTED", e),
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
	let v = J(G([...u, ..._], {
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
function Pe(e, t) {
	return e ? `ante:${e}:${t}` : `ante:${t}`;
}
function Fe(e, t) {
	let { sessionId: n, handId: r, postedAntes: i, sessionStake: a, startSequence: o } = t, s = Pe(n, r);
	if (H(e, s) || Object.values(i || {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0) <= 0 || e.filter((e) => e.type === "ANTE_DEDUCTED" && e.handId === r).length > 0) return [];
	let c = [], l = o;
	for (let [t, n] of Object.entries(i || {})) {
		let i = Math.max(0, Number(n) || 0);
		if (i <= 0) continue;
		let o = V(s, "ANTE_DEDUCTED", t);
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
function Y(e) {
	let { actionId: t, handId: n, sessionId: r, existingEvents: i = [], ledger: a, ...o } = e, s = o.buyInFallback ?? 100, c = a ?? U(s);
	if (H(i, t)) {
		let e = R(o), t = G(i, c);
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
	let l = K(G(i, c)), u = R(o), d = q(c, i), f = Fe(i, {
		sessionId: r,
		handId: n,
		postedAntes: o.postedAntes ?? {},
		sessionStake: o.sessionStake ?? 1,
		startSequence: d
	});
	d += f.length;
	let p = [...f];
	for (let e of u.participants) {
		let r = u.appliedDeltas[e] ?? 0, i = u.bourreIds.includes(e);
		if (r < 0) {
			let a = Math.abs(r);
			i ? p.push({
				eventId: V(t, "BOURRE_LIABILITY", e),
				actionId: t,
				handId: n,
				phase: "hand_settlement",
				sequence: d++,
				type: "BOURRE_LIABILITY",
				playerId: e,
				amount: a,
				metadata: { mode: u.mode },
				timestamp: Date.now()
			}) : p.push({
				eventId: V(t, "SETTLEMENT_DEBIT", e),
				actionId: t,
				handId: n,
				phase: "hand_settlement",
				sequence: d++,
				type: "SETTLEMENT_DEBIT",
				playerId: e,
				amount: a,
				metadata: { mode: u.mode },
				timestamp: Date.now()
			});
		} else if (r > 0) {
			let i = u.mode === "split" ? "SPLIT_POT_APPLIED" : "WINNER_CREDITED";
			p.push({
				eventId: V(t, i, e),
				actionId: t,
				handId: n,
				phase: "hand_settlement",
				sequence: d++,
				type: i,
				playerId: e,
				amount: r,
				metadata: { mode: u.mode },
				timestamp: Date.now()
			});
		}
	}
	p.push({
		eventId: V(t, "CARRY_OVER_SET", null),
		actionId: t,
		handId: n,
		phase: "hand_settlement",
		sequence: d++,
		type: "CARRY_OVER_SET",
		playerId: null,
		amount: u.carryOverPot,
		metadata: { bourreMatch: u.bourreMatch },
		timestamp: Date.now()
	});
	for (let e of u.participants) {
		let r = u.nextDealFunding.byPlayer[e];
		r && p.push({
			eventId: V(t, "NEXT_DEAL_FUNDING", e),
			actionId: t,
			handId: n,
			phase: "next_deal",
			sequence: d++,
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
	let m = J(G([...i, ...p], c), l);
	return {
		delta: u.appliedDeltas,
		newEvents: p,
		newBankrolls: u.bankrolls,
		carryOverPot: u.carryOverPot,
		postedAntes: {},
		invariants: m,
		version: "v1",
		settlement: u
	};
}
function Ie(e) {
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
	if (H(a, t)) {
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
	let { rebuyContributionByPlayer: s } = le({
		stackByPlayer: o.bankrolls,
		participantIds: [n],
		rebuyEnabled: !0,
		rebuyAmount: r,
		rebuyPlayerIds: [n]
	}), c = s[n] ?? r, l = K(o), u = q(o, a), d = [{
		eventId: V(t, "REBUY_APPLIED", n),
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
	}, p = G([...a, ...d], o), m = J(p, l + c, {
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
var Le = Ne, Re = Y;
function ze(e) {
	let { actionId: t, playerId: n, amount: r, handId: i = null, reason: a = "player_removal", existingEvents: o = [], ledger: s = U(100) } = e, c = Math.max(0, Number(r) || 0);
	if (c <= 0) throw Error("cash-out amount must be positive");
	if (H(o, t)) {
		let e = G(o, s);
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
	let l = s.bankrolls[n] ?? 0;
	if (c > l) throw Error(`cash-out overdraft: ${n} has ${l}, requested ${c}`);
	let u = K(s), d = q(s, o), f = [{
		eventId: V(t, "CASH_OUT_APPLIED", n),
		actionId: t,
		handId: i,
		phase: "session_finalize",
		sequence: d,
		type: "CASH_OUT_APPLIED",
		playerId: n,
		amount: c,
		metadata: { reason: a },
		timestamp: Date.now()
	}], p = G([...o, ...f], s), m = J(p, u - c);
	return {
		delta: { [n]: -c },
		newEvents: f,
		newBankrolls: p.bankrolls,
		carryOverPot: p.carryOverPot,
		postedAntes: p.postedAntes,
		invariants: m,
		version: "v1"
	};
}
function Be(e) {
	let { actionId: t, handId: n, winnerId: r, carryIn: i = 0, postedAntes: a = {}, scoreById: o, buyInFallback: s = 100, participants: c, sessionStake: l = 1, limEnabled: u = !1, stakeForPlayer: d, existingEvents: f = [], ledger: p } = e, m = O({
		winnerId: r,
		carryIn: i,
		postedAntes: a,
		scoreById: o,
		buyInFallback: s,
		participants: c,
		sessionStake: l,
		stakeForPlayer: d
	});
	if (!m.ready && !m.prefunded) throw Error(`solo win not ready: ${m.reason ?? "unknown"}`);
	let h = m.prefunded ? a : m.postedAntes ?? {}, g = m.prefunded ? Object.keys(h).filter((e) => (h[e] || 0) > 0) : [r], _ = g.length > 0 ? g : [r], v = p ?? W(o, {
		buyInFallback: s,
		carryOverPot: i,
		postedAntes: {}
	});
	return Y({
		actionId: t,
		handId: n,
		sessionId: e.sessionId,
		mode: "win",
		winners: [r],
		participants: _,
		tricksByPlayer: Object.fromEntries(_.map((e) => [e, 0])),
		scoreById: o,
		sessionStake: l,
		limEnabled: u,
		carryIn: i,
		postedAntes: h,
		buyInFallback: s,
		splitPotEnabled: !1,
		existingEvents: f,
		ledger: v
	});
}
function Ve(e) {
	let { actionId: t, winnerId: n, carryIn: r = 0, postedAntes: i = {}, scoreById: a, buyInFallback: o = 100, sortedPlayerIds: s, existingEvents: c = [], ledger: l = W(a, {
		buyInFallback: o,
		carryOverPot: r,
		postedAntes: i
	}) } = e, u = Math.max(0, Number(r) || 0) + Object.values(i).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
	if (H(c, t)) {
		let e = G(c, l);
		return {
			delta: {},
			newEvents: [],
			newBankrolls: e.bankrolls,
			carryOverPot: e.carryOverPot,
			postedAntes: e.postedAntes,
			invariants: J(e),
			version: "v1",
			potAwarded: u
		};
	}
	let d = K(l), f = q(l, c), p = [];
	u > 0 && p.push({
		eventId: V(t, "WINNER_CREDITED", n),
		actionId: t,
		handId: null,
		phase: "session_finalize",
		sequence: f++,
		type: "WINNER_CREDITED",
		playerId: n,
		amount: u,
		metadata: { reason: "sole_survivor" },
		timestamp: Date.now()
	}), p.push({
		eventId: V(t, "CARRY_OVER_SET", null),
		actionId: t,
		handId: null,
		phase: "session_finalize",
		sequence: f++,
		type: "CARRY_OVER_SET",
		playerId: null,
		amount: 0,
		metadata: { reason: "sole_survivor" },
		timestamp: Date.now()
	});
	let m = G([...c, ...p], l), h = J(m, d);
	return {
		delta: u > 0 ? { [n]: u } : {},
		newEvents: p,
		newBankrolls: m.bankrolls,
		carryOverPot: 0,
		postedAntes: {},
		invariants: h,
		version: "v1",
		potAwarded: u
	};
}
//#endregion
//#region src/game/money/explain.ts
function He(e, t = 100) {
	let n = Ae(e), r = [`Money event log (${n.length} events, buy-in ${t})`, ""], i = null;
	for (let e of n) {
		e.handId !== i && (i = e.handId, r.push(i == null ? "--- Session ---" : `--- Hand ${i} ---`));
		let t = e.playerId ?? "table", n = e.amount >= 0 ? "+" : "", a = Object.keys(e.metadata || {}).length > 0 ? ` ${JSON.stringify(e.metadata)}` : "";
		r.push(`  [${e.sequence}] ${e.phase} ${e.type} ${t}: ${n}${e.amount}${a}`);
	}
	return r.join("\n");
}
//#endregion
//#region src/game/money/finalize.ts
function Ue(e) {
	let t = e.buyInFallback ?? 100, n = e.initialLedger ?? W(e.scoreById ?? {}, {
		buyInFallback: t,
		carryOverPot: e.carryOverPot ?? 0,
		postedAntes: e.postedAntes ?? {}
	}), r = G(e.events, n), i = K(r), a = [], o = [];
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
	let l = He(e.events, t);
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
function We(e) {
	return e?.moneyEngineVersion === "v1";
}
function Ge(e, t) {
	if (!e) throw Error("Session not found");
	if (e.status === "final") throw Error("Session is final");
	if (e.moneyEngineVersion && e.moneyEngineVersion !== "v1") throw Error(`Session uses money engine ${e.moneyEngineVersion}; cannot ${t} with v1`);
}
function Ke(e, t, n = {}) {
	let r = Ue({
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
//#region src/game/money/settlementRules.ts
var qe = [
	"session_buy_in",
	"hand_enrollment",
	"ante_collect",
	"hand_play",
	"phase1_settlement",
	"phase2_next_funding",
	"rebuy_or_elimination",
	"session_finalize"
];
function Je(e) {
	return {
		bourreIds: f(e.tricksByPlayer, e.participants),
		branch: F(e.mode, e.winners, e.splitPotEnabled === !0)
	};
}
function Ye(e) {
	let t = R(e), n = B({
		scoreById: t.scoreById,
		nextDealFunding: t.nextDealFunding,
		carryOverPot: t.carryOverPot,
		participantIds: e.participants,
		sessionStake: e.sessionStake ?? 1,
		buyInFallback: e.buyInFallback ?? 100
	}), r = e.buyInFallback ?? 100, i = s(Object.fromEntries(e.participants.map((e) => [e, { bankroll: t.bankrolls[e] ?? m(t.scoreById[e], r) }])), {
		carryOverPot: t.carryOverPot,
		postedAntes: {},
		buyInFallback: r
	}), a = s(Object.fromEntries(e.participants.map((e) => [e, { bankroll: n.bankrolls[e] ?? 0 }])), {
		carryOverPot: 0,
		postedAntes: n.postedAntes,
		buyInFallback: r
	});
	return {
		settlement: t,
		deal: n,
		bourreIds: t.bourreIds,
		chipTotalAfterSettlement: i,
		chipTotalAfterFunding: a
	};
}
var Xe = Ye;
function Ze(e, t, n = 100) {
	return t.filter((t) => {
		let r = e[t];
		return r?.out === !0 ? !1 : w(m(r, n));
	});
}
function Qe(e, t, n = 100) {
	let r = Ze(e, t, n);
	return r.length === 1 ? {
		ended: !0,
		winnerId: r[0]
	} : {
		ended: !1,
		winnerId: null
	};
}
function $e(e, t, n, r = []) {
	let i = { ...e };
	for (let [e, a] of Object.entries(t)) {
		let t = { ...i[e] || {} };
		t.bankroll = Math.max(0, a), t.net = p(t.bankroll, n), r.includes(e) || t.bankroll <= 0 ? t.out = !0 : delete t.out, delete t.skipNextAnte, delete t.bourreReplacementDue, delete t.fundingContribution, i[e] = t;
	}
	return i;
}
//#endregion
//#region src/game/money/tableInvariant.ts
var et = "No cash-out API exists in production — netCashOut is always 0; elimination sets out:true only.", tt = "When bourré penalty exceeds available bankroll, the engine mints chips into the next pot; tracked via netBourreMint.";
function nt() {
	return {
		tableStartingTotal: 0,
		netCashIn: 0,
		netCashOut: 0,
		netBourreMint: 0
	};
}
function rt(e) {
	return Math.max(0, e.tableStartingTotal) + Math.max(0, e.netCashIn) + Math.max(0, e.netBourreMint) - Math.max(0, e.netCashOut);
}
function X(e = {}) {
	return Object.values(e).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
}
function it(e, t) {
	return Math.max(0, Number(e) || 0) + X(t ?? {});
}
function Z(e) {
	return Object.values(e).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
}
function at(e, t = {}) {
	let n = t.buyInFallback ?? 100, r = t.playerIds ?? Object.keys(e || {}).filter((t) => e[t] != null), i = {};
	for (let t of r) i[t] = m(e[t], n);
	return {
		bankrolls: i,
		carryOverPot: Math.max(0, Number(t.carryOverPot) || 0),
		postedAntes: { ...t.postedAntes ?? {} }
	};
}
function ot(e) {
	let t = nt();
	for (let n of Ee(e)) {
		let e = Math.max(0, Number(n.amount) || 0);
		switch (n.type) {
			case "BUY_IN_APPLIED":
				t.tableStartingTotal += e;
				break;
			case "REBUY_APPLIED":
				t.netCashIn += e;
				break;
			case "CASH_OUT_APPLIED":
				t.netCashOut += e;
				break;
			default: break;
		}
		let r = Number(n.metadata?.bourrePotMint);
		Number.isFinite(r) && r > 0 && (t.netBourreMint += r);
	}
	return t;
}
function Q(e, t) {
	return {
		tableStartingTotal: e.tableStartingTotal + (t.tableStartingTotal ?? 0),
		netCashIn: e.netCashIn + (t.netCashIn ?? 0),
		netCashOut: e.netCashOut + (t.netCashOut ?? 0),
		netBourreMint: e.netBourreMint + (t.netBourreMint ?? 0)
	};
}
function st(e, t, n = .001) {
	let r = Z(e.bankrolls), i = X(e.postedAntes), a = Math.max(0, Number(e.carryOverPot) || 0), o = r + i + a, s = rt(t), c = [];
	Math.abs(o - s) > n && c.push(`invariant failed: actual=${o} expected=${s} (bankrolls=${r} posted=${i} carry=${a})`);
	for (let [t, r] of Object.entries(e.bankrolls)) r < -n && c.push(`negative bankroll ${t}=${r}`);
	return {
		ok: c.length === 0,
		actual: o,
		expected: s,
		bankrollSum: r,
		potSum: i,
		carryPot: a,
		errors: c,
		snapshot: e,
		baseline: { ...t }
	};
}
function ct() {
	let e = globalThis;
	if (e.process?.env?.NBL_INVARIANTS === "1" || e.process?.env?.NODE_ENV === "test") return !0;
	if (typeof window < "u") try {
		return window.localStorage?.getItem("nbl-invariants") === "1" ? !0 : new URLSearchParams(window.location.search).has("invariants");
	} catch {
		return !1;
	}
	return !1;
}
function lt(e, t) {
	let n = {
		ok: t.ok,
		label: e.label,
		tableId: e.tableId ?? e.roomId ?? null,
		sessionId: e.sessionId ?? null,
		handId: e.handId ?? null,
		actual: t.actual,
		expected: t.expected,
		bankrollSum: t.bankrollSum,
		potSum: t.potSum,
		carryPot: t.carryPot,
		baseline: t.baseline,
		errors: t.errors
	};
	if (t.ok) {
		typeof console < "u" && console.info && console.info("[nbl-table-invariant]", n);
		return;
	}
	typeof console < "u" && console.error && console.error("[nbl-table-invariant]", n);
}
function ut(e, t, n, r = .001) {
	let i = st(e, t, r);
	if (lt(n, i), !i.ok && ct()) throw Error(`[${n.label}] ${i.errors.join("; ")} ` + JSON.stringify({
		tableId: n.tableId ?? n.roomId,
		sessionId: n.sessionId,
		handId: n.handId
	}));
	return i;
}
function dt(e, t, n, r = .001) {
	let i = st(e, t, r);
	if (lt(n, i), !i.ok) throw Error(`[fail-closed:${n.label}] ${i.errors.join("; ")} ` + JSON.stringify({
		tableId: n.tableId ?? n.roomId,
		sessionId: n.sessionId,
		handId: n.handId
	}));
	return i;
}
function ft(e, t, n) {
	return ut(e, t, n);
}
//#endregion
//#region src/game/money/ledgerAudit.ts
function pt(e) {
	return X(e.postedAntes) + Math.max(0, Number(e.carryOverPot) || 0);
}
function mt(e) {
	return Z(e.bankrolls) + pt(e);
}
function ht(e) {
	return e.tableStartingTotal + Math.max(0, e.netCashIn) + Math.max(0, e.netBourreMint ?? 0) - Math.max(0, e.netCashOut);
}
function gt(e, t = .001) {
	let n = Z(e.bankrolls), r = X(e.postedAntes), i = Math.max(0, Number(e.carryOverPot) || 0), a = n + r + i, o = ht(e.context), s = [];
	Math.abs(a - o) > t && s.push(`[${e.label}] invariant failed: actual=${a} expected=${o} (bankrolls=${n} posted=${r} carry=${i})`);
	for (let [n, r] of Object.entries(e.bankrolls)) r < -t && s.push(`[${e.label}] negative bankroll ${n}=${r}`);
	return {
		ok: s.length === 0,
		actual: a,
		expected: o,
		bankrollSum: n,
		potSum: r,
		carryPot: i,
		errors: s
	};
}
function _t(e, t = .001) {
	let n = gt(e, t);
	if (!n.ok) throw Error(n.errors.join("; "));
}
function $(e, t, n, r) {
	return {
		stage: t,
		label: n,
		bankrolls: { ...e.bankrolls },
		carryOverPot: Math.max(0, Number(e.carryOverPot) || 0),
		postedAntes: { ...e.postedAntes ?? {} },
		context: { ...r }
	};
}
function vt(e, t, n, r) {
	return $({
		bankrolls: e.bankrolls,
		carryOverPot: e.carryOverPot ?? 0,
		postedAntes: e.postedAntes ?? {}
	}, t, n, r);
}
function yt(e, t, n, r) {
	return $(e, t, n, r);
}
function bt(e, t) {
	let n = {};
	for (let [r, i] of Object.entries(e.bankrolls)) {
		let a = e.scoreFlags[r];
		n[r] = {
			bankroll: i,
			net: p(i, t),
			...a?.skipNextAnte ? { skipNextAnte: !0 } : {},
			...a?.bourreReplacementDue == null ? {} : { bourreReplacementDue: a.bourreReplacementDue },
			...a?.out ? { out: !0 } : {},
			...a?.perHandStake == null ? {} : { perHandStake: a.perHandStake }
		};
	}
	return n;
}
var xt = class {
	constructor(e) {
		this.events = [], this.seatedBankrolls = {}, this.carryOverPot = 0, this.nextDealFunding = null, this.handCount = 0, this.allSnapshots = [], this.playerIds = e.playerIds, this.buyInAmount = e.buyInAmount ?? 100, this.sessionStake = e.sessionStake ?? 20, this.ledger = U(this.buyInAmount), this.context = {
			tableStartingTotal: 0,
			netCashIn: 0,
			netCashOut: 0,
			netBourreMint: 0
		};
	}
	fullBankrolls(e = {}, t) {
		let n = {};
		for (let r of this.playerIds) n[r] = e[r] != null && (!t || t.includes(r)) ? e[r] : this.seatedBankrolls[r] ?? this.ledger.bankrolls[r] ?? 0;
		return n;
	}
	syncSeatedBankrolls(e = {}, t) {
		this.seatedBankrolls = this.fullBankrolls(e, t), this.ledger.bankrolls = { ...this.seatedBankrolls };
	}
	record(e) {
		this.allSnapshots.push(e), _t(e);
	}
	snap(e, t, n) {
		return $({
			bankrolls: n?.bankrolls ?? this.fullBankrolls(),
			carryOverPot: n?.carryOverPot ?? this.carryOverPot,
			postedAntes: n?.postedAntes ?? this.ledger.postedAntes
		}, e, t, this.context);
	}
	startSession(e = "buyin:session") {
		let t = Me({
			actionId: e,
			playerIds: this.playerIds,
			buyInAmount: this.buyInAmount,
			existingEvents: this.events,
			ledger: this.ledger
		});
		this.events = [...this.events, ...t.newEvents], this.ledger = G(this.events, U(this.buyInAmount)), this.syncSeatedBankrolls(t.newBankrolls);
		for (let e of this.playerIds) this.seatedBankrolls[e] ?? (this.seatedBankrolls[e] = this.buyInAmount);
		this.ledger.bankrolls = { ...this.seatedBankrolls }, this.context.tableStartingTotal = this.playerIds.length * this.buyInAmount, this.record(this.snap("session_start", "after buy-in"));
	}
	rebuy(e, t) {
		let n = t ?? `rebuy:${e}:${this.events.length}`, r = this.carryOverPot, i = { ...this.ledger.postedAntes }, a = Ie({
			actionId: n,
			playerId: e,
			buyInAmount: this.buyInAmount,
			existingEvents: this.events,
			ledger: {
				...this.ledger,
				bankrolls: this.fullBankrolls(),
				carryOverPot: r,
				postedAntes: i
			}
		}), o = a.newEvents[0]?.amount ?? 0;
		a.newEvents.length > 0 && (this.context.netCashIn += o, this.events = [...this.events, ...a.newEvents], this.syncSeatedBankrolls({ [e]: a.newBankrolls[e] ?? (this.seatedBankrolls[e] ?? 0) + o }, [e]), this.carryOverPot = r, this.ledger.carryOverPot = r, this.ledger.postedAntes = i), this.reconcileChipDrift(`rebuy ${e}`);
	}
	simulateCashOut(e, t) {
		if (t <= 0) return;
		let n = this.seatedBankrolls[e] ?? 0;
		if (t > n) throw Error(`cash-out overdraft: ${e} has ${n}, requested ${t}`);
		this.syncSeatedBankrolls({ [e]: n - t }), this.context.netCashOut += t, this.record(this.snap("after_cash_out", `cash-out ${e}:${t}`));
	}
	playHand(e) {
		let t = e.handId, n = e.participants, r = bt({
			...this.ledger,
			bankrolls: this.fullBankrolls()
		}, this.buyInAmount);
		if (this.nextDealFunding) for (let [e, t] of Object.entries(this.nextDealFunding.byPlayer)) r[e] && (t.skipNextAnte && (r[e].skipNextAnte = !0), t.bourreReplacementDue != null && (r[e].bourreReplacementDue = t.bourreReplacementDue), t.fundingContribution != null && (r[e].fundingContribution = t.fundingContribution));
		this.record(this.snap("before_ante", `${t} before ante`, {
			carryOverPot: e.carryIn ?? this.carryOverPot,
			postedAntes: { ...this.ledger.postedAntes }
		}));
		let i = it(e.carryIn ?? this.carryOverPot, this.ledger.postedAntes), a = Ne({
			actionId: `ante:${t}`,
			handId: t,
			carryOverPot: i,
			participantIds: n,
			scoreById: r,
			sessionStake: this.sessionStake,
			buyInFallback: this.buyInAmount,
			nextDealFunding: this.nextDealFunding,
			existingEvents: this.events,
			ledger: {
				...this.ledger,
				bankrolls: this.fullBankrolls()
			}
		});
		this.events = [...this.events, ...a.newEvents], this.ledger = G(this.events, U(this.buyInAmount));
		let o = { ...a.postedAntes }, s = X(o), c = a.collected?.nextHandPot ?? i + n.reduce((e, t) => {
			let n = m(r[t], this.buyInAmount), i = a.newBankrolls[t] ?? n;
			return e + Math.max(0, n - i);
		}, 0), l = Math.max(0, c - s);
		this.syncSeatedBankrolls(a.newBankrolls, n), this.ledger.postedAntes = o, this.carryOverPot = l, this.ledger.carryOverPot = l, this.record(this.snap("after_ante", `${t} after ante`, {
			postedAntes: o,
			carryOverPot: l
		}));
		let u = {};
		for (let e of this.playerIds) {
			let t = r[e];
			if (!t) continue;
			let i = a.newBankrolls[e] ?? (n.includes(e) ? m(t, this.buyInAmount) : this.seatedBankrolls[e] ?? 0);
			u[e] = {
				...t,
				bankroll: i,
				net: p(i, this.buyInAmount)
			};
		}
		let d = Y({
			actionId: `settle:${t}`,
			handId: t,
			mode: e.mode ?? "win",
			winners: e.winners,
			participants: n,
			tricksByPlayer: e.tricksByPlayer,
			scoreById: u,
			sessionStake: this.sessionStake,
			carryIn: i,
			postedAntes: a.postedAntes,
			buyInFallback: this.buyInAmount,
			splitPotEnabled: e.splitPotEnabled,
			existingEvents: this.events,
			ledger: {
				...this.ledger,
				bankrolls: this.fullBankrolls()
			}
		});
		this.events = [...this.events, ...d.newEvents], this.ledger = G(this.events, U(this.buyInAmount)), this.carryOverPot = d.carryOverPot, this.nextDealFunding = d.settlement.nextDealFunding, this.handCount += 1;
		let f = this.fullBankrolls(d.newBankrolls, n);
		this.syncSeatedBankrolls(f), this.record(this.snap("after_settlement", `${t} after settlement`, {
			bankrolls: f,
			carryOverPot: d.carryOverPot,
			postedAntes: {}
		}));
		let h = z({
			scoreById: d.settlement.scoreById,
			nextDealFunding: d.settlement.nextDealFunding,
			carryOverPot: d.carryOverPot,
			participantIds: n,
			sessionStake: this.sessionStake,
			buyInFallback: this.buyInAmount
		}), g = this.fullBankrolls(h.collected.bankrolls, n), _ = { ...h.collected.postedAntes }, v = X(_), y = h.nextHandPot ?? h.collected.nextHandPot ?? v, b = Math.max(0, y - v), x = I(f, g, Object.fromEntries(n.map((e) => [e, d.settlement.nextDealFunding.byPlayer[e]?.fundingReason ?? "normal_ante"])), _), S = Object.values(x).reduce((e, t) => e + t, 0);
		return S > 0 && (this.context.netBourreMint += S), this.syncSeatedBankrolls(g), this.ledger.postedAntes = _, this.carryOverPot = b, this.ledger.carryOverPot = b, this.record(this.snap("after_funding", `${t} after funding`, {
			bankrolls: g,
			carryOverPot: b,
			postedAntes: _
		})), {
			handId: t,
			snapshots: this.allSnapshots.slice(-4),
			settlement: d.settlement,
			scoreById: d.settlement.scoreById,
			carryOverPot: d.carryOverPot,
			nextDealFunding: d.settlement.nextDealFunding
		};
	}
	persistAndReload() {
		let e = { ...this.seatedBankrolls }, t = this.carryOverPot, n = { ...this.ledger.postedAntes }, r = Z(e) + X(n) + t, i = JSON.stringify(this.events), a = JSON.parse(i);
		this.events = a, this.syncSeatedBankrolls(e), this.carryOverPot = t, this.ledger.postedAntes = { ...n }, this.ledger.carryOverPot = t;
		let o = Z(this.seatedBankrolls) + X(this.ledger.postedAntes) + this.carryOverPot;
		if (Math.abs(r - o) > .001) throw Error(`persistence replay drift: ${r} → ${o}`);
		this.assertInvariant("after persist/reload");
	}
	currentChipTotal() {
		return K({
			...this.ledger,
			bankrolls: this.fullBankrolls()
		});
	}
	assertInvariant(e) {
		this.record(this.snap("session_start", e)), this.allSnapshots.pop();
	}
	setSeatedBankrolls(e) {
		this.syncSeatedBankrolls(e);
	}
	reconcileChipDrift(e) {
		let t = this.context.tableStartingTotal + this.context.netCashIn + (this.context.netBourreMint ?? 0) - this.context.netCashOut, n = this.currentChipTotal() - t;
		n > .001 && (this.context.netBourreMint = (this.context.netBourreMint ?? 0) + n), this.assertInvariant(e);
	}
	seatedBankroll(e) {
		return this.seatedBankrolls[e] ?? 0;
	}
};
function St(e, t, n) {
	if (n < 0) throw Error("credit amount must be non-negative");
	return n === 0 ? e : {
		...e,
		bankrolls: {
			...e.bankrolls,
			[t]: (e.bankrolls[t] ?? 0) + n
		}
	};
}
function Ct(e, t, n) {
	if (n < 0) throw Error("debit amount must be non-negative");
	if (n === 0) return {
		ledger: e,
		applied: 0,
		overdraft: !1
	};
	let r = e.bankrolls[t] ?? 0;
	if (n > r) throw Error(`debit overdraft: ${t} has ${r}, requested ${n}`);
	return {
		ledger: {
			...e,
			bankrolls: {
				...e.bankrolls,
				[t]: r - n
			}
		},
		applied: n,
		overdraft: !1
	};
}
function wt(e, t) {
	if (t < 0) throw Error("carry pot must be non-negative");
	return {
		...e,
		carryOverPot: t,
		postedAntes: {}
	};
}
function Tt(e, t, n) {
	if (n < 0) throw Error("ante amount must be non-negative");
	if (n === 0) return {
		ledger: e,
		applied: 0
	};
	let r = e.bankrolls[t] ?? 0, i = Math.min(r, n);
	return {
		ledger: {
			...e,
			bankrolls: {
				...e.bankrolls,
				[t]: r - i
			},
			postedAntes: {
				...e.postedAntes,
				[t]: (e.postedAntes[t] ?? 0) + i
			}
		},
		applied: i
	};
}
function Et(e) {
	let t = e >>> 0;
	return () => {
		t += 1831565813;
		let e = Math.imul(t ^ t >>> 15, 1 | t);
		return e ^= e + Math.imul(e ^ e >>> 7, 61 | e), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function Dt(e, t, n = []) {
	let r = Object.fromEntries(e.map((e) => [e, 0])), i = e.filter((e) => !n.includes(e));
	i.indexOf(t);
	let a = i.filter((e) => e !== t);
	r[t] = Math.max(1, 5 - a.length);
	let o = 5 - r[t];
	for (let e of a) {
		let t = +(o > 0);
		r[e] = t, o -= t;
	}
	return r;
}
function Ot(e, t = 2) {
	let n = Object.fromEntries(e.map((e) => [e, 0])), r = e.slice(0, t), i = Math.floor(5 / t), a = 5 - i * t;
	for (let e of r) n[e] = i + +(a > 0), a > 0 && --a;
	return n;
}
//#endregion
//#region src/game/money/sessionLedger.ts
function kt(e, t = []) {
	return e && e.tableStartingTotal != null ? {
		tableStartingTotal: Math.max(0, Number(e.tableStartingTotal) || 0),
		netCashIn: Math.max(0, Number(e.netCashIn) || 0),
		netCashOut: Math.max(0, Number(e.netCashOut) || 0),
		netBourreMint: Math.max(0, Number(e.netBourreMint) || 0)
	} : ot(t);
}
function At(e) {
	return { ...e };
}
function jt(e, t) {
	return {
		tableStartingTotal: Math.max(0, e) * Math.max(0, t),
		netCashIn: 0,
		netCashOut: 0,
		netBourreMint: 0
	};
}
function Mt(e, t, n, r = {}) {
	let i = I(e, t, n, r);
	return Object.values(i).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0);
}
function Nt(e, t, n = {}) {
	let r = t.currentHand?.postedAntes ?? {};
	return at(e, {
		carryOverPot: t.carryOverPot ?? 0,
		postedAntes: r,
		buyInFallback: n.buyInFallback,
		playerIds: n.playerIds
	});
}
function Pt(e, t) {
	return Q(e, { netCashIn: Math.max(0, t) });
}
function Ft(e, t) {
	return Q(e, { netBourreMint: Math.max(0, t) });
}
function It(e, t) {
	return Q(e, { netCashOut: Math.max(0, t) });
}
function Lt(e, t, n = .001) {
	let r = Object.values(e.bankrolls).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), i = Object.values(t.bankrolls).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), a = Math.max(0, Number(e.pot) || 0), o = Object.values(t.postedAntes ?? {}).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0) + Math.max(0, Number(t.carryOverPot) || 0);
	return Math.abs(r - i) <= n && Math.abs(a - o) <= n;
}
function Rt(e, t, n = 100) {
	let r = {};
	for (let [e, i] of Object.entries(t || {})) r[e] = m(i, n);
	return {
		version: "v1",
		buyInFallback: n,
		bankrolls: r,
		nets: {},
		carryOverPot: Math.max(0, Number(e.carryOverPot) || 0),
		postedAntes: { ...e.currentHand?.postedAntes ?? {} },
		scoreFlags: {},
		sequence: Number(e.moneySequence) || 0
	};
}
function zt(e) {
	let { scoreById: t, nextDealFunding: n, carryOverPot: r, participantIds: i, sessionStake: a, buyInFallback: o } = e, s = {};
	for (let e of i) s[e] = m(t[e], o);
	let c = B({
		scoreById: t,
		nextDealFunding: n,
		carryOverPot: r,
		participantIds: i,
		sessionStake: a,
		buyInFallback: o
	}), l = Object.fromEntries(i.map((e) => [e, n?.byPlayer?.[e]?.fundingReason ?? "normal_ante"]));
	return Mt(s, c.bankrolls, l, c.postedAntes ?? {});
}
function Bt(e, t) {
	let n = zt(t);
	return n > 0 ? Ft(e, n) : e;
}
function Vt(e) {
	let { plan: t, sessionId: n, handNumber: r, buyInAmount: i, ledger: a, baseline: o, existingEvents: s } = e, c = [], l = {}, u = {
		...a,
		bankrolls: { ...a.bankrolls },
		postedAntes: { ...a.postedAntes }
	}, d = o;
	for (let e of t) {
		let t = Ie({
			actionId: `rebuy:${n}:${e.playerId}:${r}`,
			playerId: e.playerId,
			buyInAmount: i,
			handId: String(r),
			existingEvents: [...s, ...c],
			ledger: { ...u }
		});
		c.push(...t.newEvents);
		let a = t.newBankrolls[e.playerId] ?? i;
		u.bankrolls[e.playerId] = a;
		let o = t.newEvents[0]?.amount ?? i;
		d = Pt(d, o), l[e.playerId] = {
			bankroll: a,
			net: p(a, i),
			displayName: e.displayName
		};
	}
	return {
		rebuyEvents: c,
		scorePatches: l,
		ledger: u,
		baseline: d
	};
}
//#endregion
export { r as DEFAULT_BOURRE_SETTINGS, n as DEFAULT_HAND_ANTE, xt as LedgerAuditSession, l as MAX_TRICKS_PER_HAND, e as MONEY_ENGINE_VERSION, tt as OPEN_RULE_BOURRE_MINT, et as OPEN_RULE_CASH_OUT, t as POT_CAP_MULTIPLIER, L as SETTLEMENT_AUDIT_DEBUG, qe as SETTLEMENT_STAGES, Tt as addLedgerPostedAnte, ee as anteAlreadyPosted, C as applyBankrollDelta, Ft as applyBourreMintToBaseline, It as applyCashOutToBaseline, me as applyFundingWithSolvency, St as applyLedgerCredit, Ct as applyLedgerDebit, ue as applyNextHandFunding, Pt as applyRebuyToBaseline, ie as applyRecordHandFundingToScores, re as applySolventSettlement, ae as assertChipConservation, _t as assertLedgerInvariant, Ge as assertMoneyEngineCompatible, ut as assertTableChipInvariant, dt as assertTableChipInvariantFailClosed, At as baselineDocFromBaseline, kt as baselineFromSessionDoc, Te as bourreIdsFromTricks, f as bourrePlayerIds, I as bourrePotMintByPlayer, te as bourreRemaindersFromSettlement, Rt as buildLedgerStateFromSession, Fe as buildMissingDealAnteEvents, de as buildNextDealFunding, y as buildNextDealFundingSnapshot, Nt as buildSessionChipSnapshot, O as buildSoloWinSettlement, at as buildTableChipSnapshot, Bt as bumpBaselineForNextHandFunding, w as canEnrollWithBankroll, $ as captureLedgerSnapshot, gt as checkLedgerInvariant, st as checkTableChipInvariant, B as collectFundingForHandStart, A as collectHandAntes, x as collectNextHandAntes, Lt as compareUiToLedgerSnapshot, it as computeCarryForAnte, se as computeCarryoverPot, Ue as computeFinalBankrolls, P as computeFundingContributionByPlayer, c as computeHandPotState, ot as computeLedgerBaselineFromEvents, zt as computeNextHandFundingMintDelta, le as computeRebuyContributions, ce as computeSplitPotPayout, Et as createSeededRng, Pe as dealAnteActionId, De as dedupeEventsByActionId, Ee as dedupeEventsById, p as deriveScoreNet, Mt as detectBourreMintDelta, T as eligibleIdsForAnteCollection, nt as emptyLedgerBaseline, U as emptyLedgerState, Vt as executeBotRebuyPlanLedgerAware, rt as expectedChipTotalFromBaseline, ht as expectedLedgerTotal, He as explainMoneyEvents, be as formatSettlementAuditTrace, h as handAnteContribution, H as hasActionBeenApplied, jt as initialSessionBaseline, oe as isChipConserved, d as isHandComplete, We as isMoneyEngineV1, Qe as isSoleSurvivor, Z as ledgerBankrollSum, K as ledgerChipTotal, W as ledgerFromScoreById, X as ledgerPostedPotSum, pt as ledgerTablePot, mt as ledgerTotalChips, S as logBourreAccounting, lt as logTableChipInvariant, ft as logTableInvariant, V as makeEventId, Q as mergeLedgerBaseline, b as mergeNextDealFundingIntoScoreById, v as nextDealFundingFlags, i as normalizeBourreSettings, Ne as processAnte, Re as processBourreLiability, Me as processBuyIn, ze as processCashOut, Y as processHandSettlement, Le as processNextDealFunding, Ie as processRebuy, Ve as processSoleSurvivorEnd, Be as processSoloWinSettlement, _ as projectNextHandPot, R as recordHandSettlement, G as replayEvents, Je as resolveHandOutcome, o as resolveSessionBuyIn, F as resolveSettlementBranch, pe as runCanonicalMoneyFlow, Ce as runHandMoneyFlow, Xe as runHandSettlementCycle, we as runProductionSettlementDealFlow, ve as runSettlementAudit, Ye as runSettlementLifecycle, ye as runSoloWinAudit, m as scoreBankroll, $e as scoreByIdAfterFunding, s as sessionChipTotal, wt as setLedgerCarryPot, N as settleCompletedHand, he as settleHandDeltas, k as settleSoloDefaultWin, D as settleSoloPrefundedWin, ne as settlementShortfall, Se as simulatePagatHandStartFunding, xe as simulateRecordHandSettlement, yt as snapshotFromLedgerState, vt as snapshotFromTableChip, E as soloWinPotAlreadyFunded, Ze as solventPlayerIds, Ae as sortMoneyEvents, a as splitPotVoteAllowed, z as startNextHandFunding, g as sumProjectedHandAntes, j as tableChipTotal, u as totalTricksPlayed, Ot as tricksTie, Dt as tricksWithWinner, M as validateChipGrowthInvariant, fe as validateMoneyInvariants, Ke as validateReplayMatchesDerived };
