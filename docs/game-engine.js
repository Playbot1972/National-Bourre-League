//#region src/types.ts
var e = {
	A: 14,
	K: 13,
	Q: 12,
	J: 11,
	10: 10,
	9: 9,
	8: 8,
	7: 7,
	6: 6,
	5: 5,
	4: 4,
	3: 3,
	2: 2
}, t = (e, t) => ({
	rank: e,
	suit: t
}), n = [
	"A",
	"K",
	"Q",
	"J",
	"10",
	"9",
	"8",
	"7",
	"6",
	"5",
	"4",
	"3",
	"2"
], r = [
	"spades",
	"hearts",
	"diamonds",
	"clubs"
];
function i() {
	let e = [];
	for (let i of r) for (let r of n) e.push(t(r, i));
	return e;
}
function a(e) {
	let t = e >>> 0;
	return () => {
		t += 1831565813;
		let e = Math.imul(t ^ t >>> 15, 1 | t);
		return e ^= e + Math.imul(e ^ e >>> 7, 61 | e), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function o() {
	if (typeof crypto < "u" && crypto.getRandomValues) {
		let e = new Uint32Array(1);
		return crypto.getRandomValues(e), e[0] ?? Date.now();
	}
	return (Date.now() ^ Math.random() * 4294967296) >>> 0;
}
function s(e, t) {
	let n = [...e], r = a(t ?? o());
	for (let e = n.length - 1; e > 0; --e) {
		let t = Math.floor(r() * (e + 1));
		[n[e], n[t]] = [n[t], n[e]];
	}
	return n;
}
//#endregion
//#region src/game/deckState.ts
function c(e) {
	return s(i(), e);
}
function l(e, t, n) {
	let r = e.slice(t, t + n);
	if (r.length < n) throw Error("Not enough cards left in deck");
	return {
		cards: r,
		deckNextIndex: t + n
	};
}
function u(e, t) {
	return Math.max(0, e.length - t);
}
//#endregion
//#region src/game/playerOrder.ts
function d(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function f(e, t, n) {
	let r = d(e, n), i = new Set(t);
	return r.filter((e) => i.has(e));
}
function p(e, t, n) {
	let r = f(e, t, n);
	return r.length ? e && r[0] === e ? r.find((t) => t !== e) ?? r[0] : r[0] : null;
}
var m = 5;
//#endregion
//#region src/game/deal.ts
function ee(e) {
	let t = [...new Set(e.participantIds.filter(Boolean))];
	if (t.length < 2) throw Error("Need at least two participants to deal");
	let n = f(e.dealerId, t, e.sortedPlayerIds);
	if (n.length < 2) throw Error("Need at least two seated participants in deal order");
	let r = p(e.dealerId, t, e.sortedPlayerIds), a = e.seed ?? Date.now(), o = s(i(), a), c = Object.fromEntries(n.map((e) => [e, []])), l = 0;
	for (let e = 0; e < 5; e += 1) for (let e of n) c[e].push(o[l]), l += 1;
	let u = h(e.dealerId, n), d = g(u, c), m = Object.fromEntries(t.map((e) => [e, 0]));
	return {
		dealOrder: n,
		participantIds: t,
		privateHands: c,
		trumpHolderId: u,
		trumpUpcard: d,
		trumpSuit: d.suit,
		remainingDeck: o.slice(l),
		turnPlayerId: r ?? n[0],
		tricksByPlayer: m,
		deckSeed: a,
		deckNextIndex: l
	};
}
function h(e, t) {
	return e && t.includes(e) ? e : t[t.length - 1];
}
function g(e, t) {
	let n = t[e];
	if (n?.length === 5) return n[4];
	throw Error("Cannot assign trump upcard — trump holder has no fifth card");
}
//#endregion
//#region src/game/drawLimit.ts
function _(e, t) {
	if ((t ?? "").toLowerCase().includes("no draw")) return 0;
	let n = Math.max(2, e || 2);
	return n >= 8 ? 2 : n >= 7 ? 3 : n >= 6 ? 4 : 5;
}
//#endregion
//#region src/game/types.ts
var v = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
}, y = 12, b = 12 * 1e3;
function x(e, t, n = !1, r = Date.now()) {
	return {
		active: n,
		orderedPlayerIds: d(t, e),
		currentIndex: 0,
		turnDeadlineMs: r + b,
		playingIds: [],
		passedIds: [],
		plannedDiscards: {}
	};
}
function S(e) {
	return e.orderedPlayerIds[e.currentIndex] ?? null;
}
function C(e, t, n) {
	return e === t && n?.rank === "A" && !!n?.suit;
}
function te(e, t) {
	for (let n of e) if (!t.includes(n)) return n;
	return e[0] ?? null;
}
function ne(e, t, n, r) {
	let i = (e.actionOrder ?? e.participantIds).filter((e) => t.includes(e)), a = _(t.length, r), o = t.filter((e) => (n[e] ?? 0) === 0), s = Object.fromEntries(t.map((t) => [t, e.tricksByPlayer[t] ?? 0]));
	return {
		...e,
		phase: v.DRAW,
		participantIds: [...t],
		actionOrder: i,
		maxDrawDiscards: a,
		tricksByPlayer: s,
		drawCompletedIds: o,
		turnPlayerId: te(i, o),
		handDecision: null,
		seatedIds: e.seatedIds
	};
}
function re(e, t = Date.now()) {
	let n = e.handDecision ?? x(e.seatedIds ?? e.participantIds, e.dealerId, !0, t);
	return {
		...e,
		phase: v.DECISION,
		handDecision: {
			...n,
			active: !0,
			turnDeadlineMs: t + b
		}
	};
}
function w(e, t, n, r, i, a, o = Date.now()) {
	let s = t.currentIndex + 1;
	if (s < t.orderedPlayerIds.length) return {
		kind: "continue",
		handDecision: {
			...t,
			playingIds: n,
			passedIds: r,
			plannedDiscards: i,
			currentIndex: s,
			turnDeadlineMs: o + b
		},
		publicHand: {
			...e,
			handDecision: {
				...t,
				playingIds: n,
				passedIds: r,
				plannedDiscards: i,
				currentIndex: s,
				turnDeadlineMs: o + b
			}
		}
	};
	if (n.length < 2) {
		if (n.length === 1) return {
			kind: "soloWin",
			winnerId: n[0],
			handDecision: null,
			publicHand: {
				...e,
				participantIds: [...n],
				handDecision: null
			}
		};
		let t = x(e.seatedIds ?? e.participantIds, e.dealerId, !0, o);
		return {
			kind: "restart",
			handDecision: t,
			publicHand: {
				...e,
				phase: v.DECISION,
				handDecision: t
			}
		};
	}
	return {
		kind: "draw",
		handDecision: null,
		publicHand: ne(e, n, i, a?.dealingRule)
	};
}
function ie(e, t, n, r, i, a = Date.now()) {
	if (S(t) !== n) throw Error("Not your turn to decide yet");
	let o = _(e.participantIds.length, i?.dealingRule), s = Math.max(0, Math.min(o, Math.floor(r))), c = [...t.playingIds, n], l = {
		...t.plannedDiscards,
		[n]: s
	};
	return w(e, t, c, t.passedIds, l, i, a);
}
function ae(e, t, n, r, i = Date.now()) {
	if (S(t) !== n) throw Error("Not your turn to pass yet");
	if (C(n, e.dealerId, e.trumpUpcard)) throw Error("Dealer must play when trump is an ace");
	if (t.passedIds.includes(n)) throw Error("Already passed this hand");
	let a = [...t.passedIds, n];
	return w(e, t, t.playingIds, a, t.plannedDiscards, r, i);
}
function oe(e, t, n, r = Date.now()) {
	let i = S(t);
	if (!i) throw Error("No decision turn");
	if (C(i, e.dealerId, e.trumpUpcard)) return ie(e, t, i, 0, n, r);
	let a = [...t.passedIds, i];
	return w(e, t, t.playingIds, a, t.plannedDiscards, n, r);
}
function se(e) {
	return e ? {
		active: e.active,
		orderedPlayerIds: e.orderedPlayerIds,
		currentIndex: e.currentIndex,
		turnDeadlineMs: e.turnDeadlineMs,
		enrolledIds: e.playingIds,
		declinedIds: e.passedIds
	} : null;
}
//#endregion
//#region src/game/serialize.ts
function T(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function E(e) {
	return e.map(T);
}
function D(e, t) {
	let n = typeof t == "object" && t ? t.dealerId : t, r = typeof t == "object" && t ? t.actionOrder : e.dealOrder, i = typeof t == "object" && t && t.maxDrawDiscards != null ? t.maxDrawDiscards : _(e.participantIds.length), a = typeof t == "object" && t ? t.cinchEnabled === !0 : !1, o = typeof t == "object" && t && t.initialPhase ? t.initialPhase : v.DRAW, s = typeof t == "object" && t ? t.handDecision ?? null : null, c = {
		phase: o,
		participantIds: [...e.participantIds],
		seatedIds: [...e.participantIds],
		dealerId: n,
		trumpHolderId: e.trumpHolderId,
		trumpSuit: e.trumpSuit,
		trumpUpcard: T(e.trumpUpcard),
		remainingDeckCount: e.remainingDeck.length,
		currentTrick: null,
		leadSuit: null,
		playedCards: [],
		turnPlayerId: e.turnPlayerId,
		tricksByPlayer: { ...e.tricksByPlayer },
		deckSeed: e.deckSeed,
		deckNextIndex: e.deckNextIndex,
		actionOrder: [...r],
		drawCompletedIds: [],
		maxDrawDiscards: i,
		cinchEnabled: a,
		handDecision: s
	}, l = {};
	for (let [t, n] of Object.entries(e.privateHands)) l[t] = { cards: E(n) };
	return {
		publicHand: c,
		privateHandsByPlayer: l
	};
}
function ce(e, t) {
	let n = x(e.participantIds, t.dealerId, !1);
	return D(e, {
		...t,
		initialPhase: v.REVEAL,
		handDecision: n
	});
}
function le(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/cardUtils.ts
function O(e) {
	return `${e.rank}:${e.suit}`;
}
function k(e, t) {
	return e.rank === t.rank && e.suit === t.suit;
}
function A(t) {
	return e[t.rank];
}
function j(e, t) {
	return e.suit === t;
}
function M(e, t) {
	return e.filter((e) => e.suit === t);
}
function ue(e, t) {
	return e.filter((e, n) => n !== t);
}
function de(e, t) {
	let n = [...new Set(t)].sort((e, t) => t - e), r = [...e];
	for (let e of n) e < 0 || e >= r.length || r.splice(e, 1);
	return r;
}
//#endregion
//#region src/game/invariants.ts
var N = class extends Error {
	duplicates;
	constructor(e, t) {
		super(e), this.name = "CardUniquenessError", this.duplicates = t;
	}
};
function P(e, t, n) {
	let r = O(t);
	return e.get(r) ? [r] : (e.set(r, n), []);
}
function fe(e) {
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r = e.deckNextIndex; r < e.deck.length; r += 1) n.push(...P(t, e.deck[r], `deck[${r}]`));
	for (let [r, i] of Object.entries(e.privateHands)) for (let e = 0; e < i.length; e += 1) n.push(...P(t, i[e], `hand:${r}[${e}]`));
	if (e.trumpUpcard) {
		let r = O(e.trumpUpcard);
		((e.trumpHolderId ? e.privateHands[e.trumpHolderId] : void 0)?.some((e) => O(e) === r) ?? !1) || n.push(...P(t, e.trumpUpcard, "trumpUpcard"));
	}
	for (let r of e.currentTrick?.plays ?? []) n.push(...P(t, r.card, `trick:${r.playerId}`));
	for (let r of e.playedCards ?? []) n.push(...P(t, r.card, `played:t${r.trickNumber}`));
	if (n.length) {
		let e = [...new Set(n)];
		throw new N(`Duplicate card(s) in game state: ${e.map((e) => `${e} (${t.get(e)})`).join(", ")}`, e);
	}
}
function F(e) {
	return e.trumpHolderId ?? e.dealerId ?? null;
}
function I(e) {
	return !!e.trumpUpcard;
}
function L(e, t, n) {
	let r = [...t], i = F(n), a = n.trumpUpcard;
	return !i || e !== i || !a ? r : r.some((e) => k(e, a)) ? r.filter((e) => !k(e, a)) : (r.push(a), r);
}
function R(e, t, n) {
	let r = F(n), i = n.trumpUpcard;
	return r && e === r && i && !t.some((e) => k(e, i)) ? [...t, i] : [...t];
}
function z(e, t, n, r) {
	let i = F(r);
	return !i || e !== i || !r.trumpUpcard ? !1 : t.some((e) => {
		let t = n[e];
		return t && k(t, r.trumpUpcard);
	});
}
function B(e, t) {
	return !!(t.trumpUpcard && k(e, t.trumpUpcard));
}
var pe = 5;
function V(e, t) {
	let n = (e.playedCards ?? []).filter((e) => e.playerId === t).length, r = (e.currentTrick?.plays ?? []).filter((e) => e.playerId === t).length;
	return Math.max(0, pe - n - r);
}
function me(e, t, n = !1) {
	let r = V(e, t);
	return n ? r : F(e) === t && I(e) ? Math.max(0, r - 1) : r;
}
function he(e, t) {
	if (!e.trumpUpcard || !e.trumpHolderId) return !1;
	let n = t[e.trumpHolderId];
	return n?.length ? n.some((t) => k(t, e.trumpUpcard)) : !1;
}
//#endregion
//#region src/game/draw.ts
function H(e) {
	let t = [...new Set(e.discardIndices)].sort((e, t) => e - t);
	if (t.some((t) => t < 0 || t >= e.hand.length)) throw Error("Invalid discard selection");
	if (t.length > e.maxDiscards) throw Error(`You may discard at most ${e.maxDiscards} cards`);
	if (t.length > 0 && t.length > e.maxDiscards) throw Error(`Draw limit is ${e.maxDiscards}`);
	let n = de(e.hand, t), r = t.length;
	if (r === 0) return {
		hand: n,
		deckNextIndex: e.deckNextIndex,
		discarded: 0
	};
	let { cards: i, deckNextIndex: a } = l(e.deck, e.deckNextIndex, r);
	return {
		hand: [...n, ...i],
		deckNextIndex: a,
		discarded: r
	};
}
function U(e, t) {
	let n = e.indexOf(t);
	return n < 0 ? e[0] ?? null : e[(n + 1) % e.length] ?? null;
}
function W(e, t) {
	let n = new Set(t);
	return e.every((e) => n.has(e));
}
function ge(e) {
	let t = L(e.playerId, e.privateHand, e.publicHand), n = H({
		hand: t,
		discardIndices: e.discardIndices,
		deck: e.deck,
		deckNextIndex: e.deckNextIndex,
		maxDiscards: e.maxDiscards
	}), r = z(e.playerId, e.discardIndices, t, e.publicHand), i = {
		...e.publicHand,
		deckNextIndex: n.deckNextIndex,
		remainingDeckCount: Math.max(0, e.deck.length - n.deckNextIndex)
	};
	return r && (i = {
		...i,
		trumpUpcard: null
	}), {
		privateHand: R(e.playerId, n.hand, i),
		publicHand: i,
		deckNextIndex: n.deckNextIndex,
		discarded: n.discarded
	};
}
function _e(e, t) {
	let n = [...e.participantIds], r = (e.actionOrder ?? e.participantIds).filter((e) => n.includes(e)), i = Object.fromEntries(n.map((t) => [t, e.tricksByPlayer[t] ?? 0])), a = e.seatedIds ?? e.actionOrder ?? n, o = p(e.dealerId, n, a) ?? r[0] ?? null;
	return {
		...e,
		phase: v.DRAW,
		participantIds: n,
		actionOrder: r,
		handDecision: null,
		drawCompletedIds: [],
		tricksByPlayer: i,
		turnPlayerId: o,
		maxDrawDiscards: _(n.length, t)
	};
}
function ve(e, t, n) {
	let r = e.participantIds.filter((e) => e !== n), i = [...e.foldedIds ?? [], n], a = t.filter((e) => r.includes(e)), o = [...new Set([...e.drawCompletedIds ?? [], n])], s = {
		...e,
		participantIds: r,
		actionOrder: a,
		drawCompletedIds: o,
		foldedIds: i,
		tricksByPlayer: Object.fromEntries(r.map((t) => [t, e.tricksByPlayer[t] ?? 0]))
	};
	if (r.length === 1) return {
		kind: "soloWin",
		winnerId: r[0],
		publicHand: {
			...s,
			handDecision: null
		}
	};
	if (r.length === 0) throw Error("No players remain in hand");
	if (W(r, o)) return {
		kind: "continue",
		publicHand: G(s, a, n)
	};
	let c = U(a, n), l = new Set(o), u = 0;
	for (; c && l.has(c) && u < a.length + 1;) c = U(a, c), u += 1;
	return {
		kind: "continue",
		publicHand: {
			...s,
			turnPlayerId: c
		}
	};
}
function G(e, t, n) {
	let r = [...new Set([...e.drawCompletedIds ?? [], n])], i = e.participantIds;
	if (!W(i, r)) {
		let i = U(t, n);
		return {
			...e,
			drawCompletedIds: r,
			turnPlayerId: i
		};
	}
	let a = e.seatedIds ?? t ?? i, o = p(e.dealerId, i, a) ?? t[0] ?? n;
	return {
		...e,
		phase: v.PLAY,
		drawCompletedIds: r,
		turnPlayerId: o,
		currentTrick: {
			trickNumber: 1,
			leadPlayerId: o,
			leadSuit: null,
			plays: []
		},
		leadSuit: null
	};
}
//#endregion
//#region src/game/playContext.ts
function ye(e, t) {
	let n = M(e, t);
	return n.length ? n.reduce((e, t) => A(t) >= A(e) ? t : e) : null;
}
function be(e) {
	if (!e.cinchEnabled) return !1;
	let t = M(e.hand, e.trumpSuit);
	return t.filter((e) => A(e) >= 13).length >= 3 && t.length > 0;
}
function xe(e, t) {
	let n = ye(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function Se(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => le([e.card])[0]) : [];
}
function K(e) {
	let t = e.currentTrick ?? null, n = Se(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function Ce(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = K(e.publicHand);
	return {
		hand: e.hand,
		trumpSuit: e.publicHand.trumpSuit,
		leadSuit: r,
		trickPlays: t,
		isLeading: n,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	};
}
function q(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return be(e) && !xe(n, e) ? {
		allowed: !1,
		reason: "Cinch: play your highest trump",
		code: "CINCH_HIGHEST_TRUMP"
	} : { allowed: !0 };
	let r = e.leadSuit ?? e.trickPlays[0]?.suit;
	return r ? M(e.hand, r).length > 0 ? n.suit === r ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must follow suit",
		code: "MUST_FOLLOW_SUIT"
	} : M(e.hand, e.trumpSuit).length > 0 ? j(n, e.trumpSuit) ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must play a trump when void in the led suit",
		code: "MUST_TRUMP"
	} : { allowed: !0 } : { allowed: !0 };
}
function J(e, t, n, r) {
	if (typeof console > "u" || !console.debug) return;
	let i = n != null && n >= 0 && n < t.hand.length ? t.hand[n] : null;
	console.debug("[bourre-play]", {
		handNumber: e.handNumber ?? null,
		dealerSeat: e.dealerSeat ?? null,
		leaderSeat: e.leaderSeat ?? null,
		currentTurnSeat: e.currentTurnSeat ?? null,
		trickIndex: e.trickIndex ?? 0,
		trickCards: t.trickPlays.length,
		leadSuit: t.leadSuit,
		trumpSuit: t.trumpSuit,
		isLeading: t.isLeading,
		selectedCard: i,
		allowed: r.allowed,
		reason: r.reason ?? null
	});
}
//#endregion
//#region src/game/legal.ts
function we(e, t, n) {
	let r = e.filter((e) => !j(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => A(t) > A(e) ? t : e) : null;
}
function Y(e, t) {
	let n = e.filter((e) => j(e, t));
	return n.length ? n.reduce((e, t) => A(t) > A(e) ? t : e) : null;
}
function X(e, t) {
	return A(e) > A(t);
}
function Te(e) {
	return {
		hand: e.hand,
		trumpSuit: e.trumpSuit,
		leadSuit: e.leadSuit,
		trickPlays: e.trickPlays,
		isLeading: e.isLeading,
		cinchEnabled: e.cinchEnabled
	};
}
function Z(e, t = {}) {
	let n = Te(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = q(n, r);
			i.allowed ? e.push(r) : J(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? M(n.hand, r) : [], a = M(n.hand, n.trumpSuit), o = r ? we(n.trickPlays, r, n.trumpSuit) : null, s = Y(n.trickPlays, n.trumpSuit), c;
	if (i.length > 0) {
		if (c = i, !s && o) {
			let e = i.filter((e) => X(e, o));
			e.length && (c = e);
		}
	} else if (a.length > 0) {
		if (c = a, s) {
			let e = a.filter((e) => X(e, s));
			e.length && (c = e);
		}
	} else c = [...n.hand];
	let l = [];
	for (let e = 0; e < n.hand.length; e += 1) c.some((t) => t.rank === n.hand[e].rank && t.suit === n.hand[e].suit) && l.push(e);
	return l;
}
function Ee(e, t, n = {}) {
	let r = Te(e), i = q(r, t);
	if (J(n, r, t, i), !i.allowed) return {
		ok: !1,
		code: i.code ?? "MUST_BEAT_LED_SUIT",
		message: i.reason ?? "Illegal play"
	};
	if (r.isLeading || r.trickPlays.length === 0) return { ok: !0 };
	if (!Z(e, n).includes(t)) {
		let n = e.hand[t], r = e.leadSuit, i = r ? M(e.hand, r) : [], a = M(e.hand, e.trumpSuit), o = r ? Y(e.trickPlays, e.trumpSuit) : null;
		return r && i.length && n.suit !== r ? {
			ok: !1,
			code: "MUST_FOLLOW_SUIT",
			message: "You must follow suit"
		} : r && !i.length && a.length && !j(n, e.trumpSuit) ? {
			ok: !1,
			code: "MUST_TRUMP",
			message: "You must play a trump when void in the led suit"
		} : o && j(n, e.trumpSuit) && !X(n, o) ? {
			ok: !1,
			code: "MUST_OVERTRUMP",
			message: "You must overtrump if you can"
		} : e.cinchEnabled ? {
			ok: !1,
			code: "CINCH_HIGHEST_TRUMP",
			message: "Cinch: play your highest trump"
		} : {
			ok: !1,
			code: "MUST_BEAT_LED_SUIT",
			message: "You must beat the highest card if you can"
		};
	}
	return { ok: !0 };
}
//#endregion
//#region src/game/trick.ts
function Q(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => j(e.card, n));
	if (r.length) return r.reduce((e, t) => A(t.card) > A(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => A(t.card) > A(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
var De = 5;
function Oe(e, t) {
	return e[(e.indexOf(t) + 1) % e.length];
}
function ke(e) {
	let t = L(e.playerId, e.privateHand, e.publicHand), n = (e.publicHand.playedCards?.length ?? 0) === 0 && (e.publicHand.currentTrick?.plays?.length ?? 0) === 0 && Object.values(e.publicHand.tricksByPlayer ?? {}).every((e) => (e ?? 0) === 0), r = $({
		publicHand: e.publicHand,
		playerHand: t,
		playerId: e.playerId,
		cardIndex: e.cardIndex,
		actionOrder: e.actionOrder,
		cinchEnabled: e.cinchEnabled
	}), i = t[e.cardIndex], a = r.publicHand;
	e.publicHand.trumpUpcard && (n || i && B(i, e.publicHand)) && (a = {
		...a,
		trumpUpcard: null
	});
	let o = R(e.playerId, r.playerHand, a);
	return {
		...r,
		publicHand: a,
		privateHand: o,
		playerHand: o
	};
}
function $(e) {
	let { publicHand: t, playerId: n, cardIndex: r, actionOrder: i } = e;
	if (t.phase !== v.PLAY) throw Error("Not in trick-play phase");
	if (t.turnPlayerId !== n) throw Error("Not your turn");
	let a = t.currentTrick;
	if (!a) throw Error("No active trick");
	let { isLeading: o, leadSuit: s, trickIndex: c } = K(t), l = Ee(Ce({
		hand: e.playerHand,
		publicHand: t
	}), r, {
		dealerSeat: t.dealerId ?? null,
		leaderSeat: a.leadPlayerId ?? null,
		currentTurnSeat: n,
		trickIndex: c
	});
	if (!l.ok) throw Error(l.message);
	let u = e.playerHand[r], d = ue(e.playerHand, r), f = {
		playerId: n,
		card: T(u)
	}, p = [...a.plays, f], m = o ? u.suit : s, ee = t.participantIds;
	if (!(p.length >= ee.length)) {
		let e = Oe(i, n), r = {
			...a,
			leadSuit: m,
			plays: p
		};
		return {
			publicHand: {
				...t,
				leadSuit: m,
				currentTrick: r,
				turnPlayerId: e
			},
			playerHand: d,
			trickResolved: !1,
			handComplete: !1
		};
	}
	let h = Q(p.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})), m, t.trumpSuit), g = { ...t.tricksByPlayer };
	g[h] = (g[h] ?? 0) + 1;
	let _ = [...t.playedCards, ...p.map((e) => ({
		...e,
		trickNumber: a.trickNumber
	}))];
	if (Object.values(g).reduce((e, t) => e + (t || 0), 0) >= De) return {
		publicHand: {
			...t,
			tricksByPlayer: g,
			playedCards: _,
			currentTrick: null,
			leadSuit: null,
			turnPlayerId: null
		},
		playerHand: d,
		trickResolved: !0,
		handComplete: !0
	};
	let y = a.trickNumber + 1;
	return {
		publicHand: {
			...t,
			tricksByPlayer: g,
			playedCards: _,
			leadSuit: null,
			turnPlayerId: h,
			currentTrick: {
				trickNumber: y,
				leadPlayerId: h,
				leadSuit: null,
				plays: []
			}
		},
		playerHand: d,
		trickResolved: !0,
		handComplete: !1
	};
}
function Ae(e, t, n) {
	return n <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: A(e),
		trump: j(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, n).map((e) => e.index);
}
function je(e, t) {
	let n = Z(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => A(e[n]) > A(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => A(e[n]) < A(e[t]) ? n : t);
	let i = n.filter((n) => Q([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => A(e[n]) < A(e[t]) ? n : t);
}
//#endregion
export { m as CARDS_PER_PLAYER, N as CardUniquenessError, b as HAND_DECISION_MS, y as HAND_DECISION_SECONDS, v as HAND_PHASE, re as activateHandDecision, f as activePlayerOrder, G as advanceAfterDraw, W as allDrawsComplete, ae as applyDecisionPass, ie as applyDecisionPlay, oe as applyDecisionTimeout, H as applyDraw, ve as applyDrawFold, $ as applyPlayCard, ge as applyPlayerDraw, ke as applyPlayerPlayCard, fe as assertCardUniqueness, g as assignTrumpUpcard, Ae as botDrawDiscardIndices, je as botPlayCardIndex, x as buildHandDecision, Ce as buildPlayValidationState, q as canPlayCard, O as cardKey, k as cardsEqual, V as cardsRemainingInHand, i as createDeck, S as currentDecisionPlayer, ee as dealInitialHand, C as dealerMustPlayTrumpAce, se as decisionAsEnrollmentView, w as decisionPatchAfterStep, le as deserializeCards, me as displayHoleCardCount, l as drawCardsFromDeck, z as effectiveIndexDiscardsTrump, L as effectivePlayerHand, Z as getLegalPlayIndices, j as isTrump, J as logPlayValidation, _ as maxDrawDiscards, U as nextPlayerInOrder, K as normalizeTrickForPlay, p as openingLeaderId, B as playedTrumpUpcard, d as playerOrderFromDealer, R as privateHandFromEffective, A as rankValue, u as remainingDeckCount, Q as resolveTrickWinner, _e as revealToDraw, T as serializeCard, E as serializeCards, D as serializeHandState, ce as serializePagatRevealHand, s as shuffleDeck, c as shuffledDeckFromSeed, I as trumpOnTable, F as trumpOwnerId, he as trumpRevealMirroredInHolderHand, Ee as validatePlayIndex };
