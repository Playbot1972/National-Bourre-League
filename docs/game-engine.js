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
var p = 5;
//#endregion
//#region src/game/deal.ts
function m(e) {
	let t = [...new Set(e.participantIds.filter(Boolean))];
	if (t.length < 2) throw Error("Need at least two participants to deal");
	let n = f(e.dealerId, t, e.sortedPlayerIds);
	if (n.length < 2) throw Error("Need at least two seated participants in deal order");
	let r = e.seed ?? Date.now(), a = s(i(), r), o = Object.fromEntries(n.map((e) => [e, []])), c = 0;
	for (let e = 0; e < 5; e += 1) for (let e of n) o[e].push(a[c]), c += 1;
	let l = h(e.dealerId, n), u = g(l, o), d = Object.fromEntries(t.map((e) => [e, 0]));
	return {
		dealOrder: n,
		participantIds: t,
		privateHands: o,
		trumpHolderId: l,
		trumpUpcard: u,
		trumpSuit: u.suit,
		remainingDeck: a.slice(c),
		turnPlayerId: n[0],
		tricksByPlayer: d,
		deckSeed: r,
		deckNextIndex: c
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
function ee(e, t) {
	for (let n of e) if (!t.includes(n)) return n;
	return e[0] ?? null;
}
function te(e, t, n, r) {
	let i = (e.actionOrder ?? e.participantIds).filter((e) => t.includes(e)), a = _(t.length, r), o = t.filter((e) => (n[e] ?? 0) === 0), s = Object.fromEntries(t.map((t) => [t, e.tricksByPlayer[t] ?? 0]));
	return {
		...e,
		phase: v.DRAW,
		participantIds: [...t],
		actionOrder: i,
		maxDrawDiscards: a,
		tricksByPlayer: s,
		drawCompletedIds: o,
		turnPlayerId: ee(i, o),
		handDecision: null,
		seatedIds: e.seatedIds
	};
}
function ne(e, t = Date.now()) {
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
		publicHand: te(e, n, i, a?.dealingRule)
	};
}
function re(e, t, n, r, i, a = Date.now()) {
	if (S(t) !== n) throw Error("Not your turn to decide yet");
	let o = _(e.participantIds.length, i?.dealingRule), s = Math.max(0, Math.min(o, Math.floor(r))), c = [...t.playingIds, n], l = {
		...t.plannedDiscards,
		[n]: s
	};
	return w(e, t, c, t.passedIds, l, i, a);
}
function ie(e, t, n, r, i = Date.now()) {
	if (S(t) !== n) throw Error("Not your turn to pass yet");
	if (C(n, e.dealerId, e.trumpUpcard)) throw Error("Dealer must play when trump is an ace");
	if (t.passedIds.includes(n)) throw Error("Already passed this hand");
	let a = [...t.passedIds, n];
	return w(e, t, t.playingIds, a, t.plannedDiscards, r, i);
}
function ae(e, t, n, r = Date.now()) {
	let i = S(t);
	if (!i) throw Error("No decision turn");
	if (C(i, e.dealerId, e.trumpUpcard)) return re(e, t, i, 0, n, r);
	let a = [...t.passedIds, i];
	return w(e, t, t.playingIds, a, t.plannedDiscards, n, r);
}
function oe(e) {
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
function se(e, t) {
	let n = x(e.participantIds, t.dealerId, !1);
	return D(e, {
		...t,
		initialPhase: v.REVEAL,
		handDecision: n
	});
}
function O(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/cardUtils.ts
function k(e) {
	return `${e.rank}:${e.suit}`;
}
function A(e, t) {
	return e.rank === t.rank && e.suit === t.suit;
}
function j(t) {
	return e[t.rank];
}
function M(e, t) {
	return e.suit === t;
}
function N(e, t) {
	return e.filter((e) => e.suit === t);
}
function ce(e, t) {
	return e.filter((e, n) => n !== t);
}
function le(e, t) {
	let n = [...new Set(t)].sort((e, t) => t - e), r = [...e];
	for (let e of n) e < 0 || e >= r.length || r.splice(e, 1);
	return r;
}
//#endregion
//#region src/game/invariants.ts
var P = class extends Error {
	duplicates;
	constructor(e, t) {
		super(e), this.name = "CardUniquenessError", this.duplicates = t;
	}
};
function F(e, t, n) {
	let r = k(t);
	return e.get(r) ? [r] : (e.set(r, n), []);
}
function ue(e) {
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r = e.deckNextIndex; r < e.deck.length; r += 1) n.push(...F(t, e.deck[r], `deck[${r}]`));
	for (let [r, i] of Object.entries(e.privateHands)) for (let e = 0; e < i.length; e += 1) n.push(...F(t, i[e], `hand:${r}[${e}]`));
	if (e.trumpUpcard) {
		let r = k(e.trumpUpcard);
		((e.trumpHolderId ? e.privateHands[e.trumpHolderId] : void 0)?.some((e) => k(e) === r) ?? !1) || n.push(...F(t, e.trumpUpcard, "trumpUpcard"));
	}
	for (let r of e.currentTrick?.plays ?? []) n.push(...F(t, r.card, `trick:${r.playerId}`));
	for (let r of e.playedCards ?? []) n.push(...F(t, r.card, `played:t${r.trickNumber}`));
	if (n.length) {
		let e = [...new Set(n)];
		throw new P(`Duplicate card(s) in game state: ${e.map((e) => `${e} (${t.get(e)})`).join(", ")}`, e);
	}
}
function I(e) {
	return e.trumpHolderId ?? e.dealerId ?? null;
}
function L(e) {
	return !!e.trumpUpcard;
}
function R(e, t, n) {
	let r = [...t], i = I(n), a = n.trumpUpcard;
	return !i || e !== i || !a ? r : r.some((e) => A(e, a)) ? r.filter((e) => !A(e, a)) : (r.push(a), r);
}
function z(e, t, n) {
	let r = I(n), i = n.trumpUpcard;
	return r && e === r && i && !t.some((e) => A(e, i)) ? [...t, i] : [...t];
}
function B(e, t, n, r) {
	let i = I(r);
	return !i || e !== i || !r.trumpUpcard ? !1 : t.some((e) => {
		let t = n[e];
		return t && A(t, r.trumpUpcard);
	});
}
function V(e, t) {
	return !!(t.trumpUpcard && A(e, t.trumpUpcard));
}
var de = 5;
function H(e, t) {
	let n = (e.playedCards ?? []).filter((e) => e.playerId === t).length, r = (e.currentTrick?.plays ?? []).filter((e) => e.playerId === t).length;
	return Math.max(0, de - n - r);
}
function fe(e, t, n = !1) {
	let r = H(e, t);
	return n ? r : I(e) === t && L(e) ? Math.max(0, r - 1) : r;
}
function pe(e, t) {
	if (!e.trumpUpcard || !e.trumpHolderId) return !1;
	let n = t[e.trumpHolderId];
	return n?.length ? n.some((t) => A(t, e.trumpUpcard)) : !1;
}
//#endregion
//#region src/game/draw.ts
function U(e) {
	let t = [...new Set(e.discardIndices)].sort((e, t) => e - t);
	if (t.some((t) => t < 0 || t >= e.hand.length)) throw Error("Invalid discard selection");
	if (t.length > e.maxDiscards) throw Error(`You may discard at most ${e.maxDiscards} cards`);
	if (t.length > 0 && t.length > e.maxDiscards) throw Error(`Draw limit is ${e.maxDiscards}`);
	let n = le(e.hand, t), r = t.length;
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
function W(e, t) {
	let n = e.indexOf(t);
	return n < 0 ? e[0] ?? null : e[(n + 1) % e.length] ?? null;
}
function G(e, t) {
	let n = new Set(t);
	return e.every((e) => n.has(e));
}
function me(e) {
	let t = R(e.playerId, e.privateHand, e.publicHand), n = U({
		hand: t,
		discardIndices: e.discardIndices,
		deck: e.deck,
		deckNextIndex: e.deckNextIndex,
		maxDiscards: e.maxDiscards
	}), r = B(e.playerId, e.discardIndices, t, e.publicHand), i = {
		...e.publicHand,
		deckNextIndex: n.deckNextIndex,
		remainingDeckCount: Math.max(0, e.deck.length - n.deckNextIndex)
	};
	return r && (i = {
		...i,
		trumpUpcard: null
	}), {
		privateHand: z(e.playerId, n.hand, i),
		publicHand: i,
		deckNextIndex: n.deckNextIndex,
		discarded: n.discarded
	};
}
function he(e, t) {
	let n = [...e.participantIds], r = (e.actionOrder ?? e.participantIds).filter((e) => n.includes(e)), i = Object.fromEntries(n.map((t) => [t, e.tricksByPlayer[t] ?? 0]));
	return {
		...e,
		phase: v.DRAW,
		participantIds: n,
		actionOrder: r,
		handDecision: null,
		drawCompletedIds: [],
		tricksByPlayer: i,
		turnPlayerId: r[0] ?? null,
		maxDrawDiscards: _(n.length, t)
	};
}
function ge(e, t, n) {
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
	if (G(r, o)) return {
		kind: "continue",
		publicHand: K(s, a, n)
	};
	let c = W(a, n), l = new Set(o), u = 0;
	for (; c && l.has(c) && u < a.length + 1;) c = W(a, c), u += 1;
	return {
		kind: "continue",
		publicHand: {
			...s,
			turnPlayerId: c
		}
	};
}
function K(e, t, n) {
	let r = [...new Set([...e.drawCompletedIds ?? [], n])], i = e.participantIds;
	if (!G(i, r)) {
		let i = W(t, n);
		return {
			...e,
			drawCompletedIds: r,
			turnPlayerId: i
		};
	}
	let a = t[0] ?? n;
	return {
		...e,
		phase: v.PLAY,
		drawCompletedIds: r,
		turnPlayerId: a,
		currentTrick: {
			trickNumber: 1,
			leadPlayerId: a,
			leadSuit: null,
			plays: []
		},
		leadSuit: null
	};
}
//#endregion
//#region src/game/playContext.ts
function _e(e, t) {
	let n = N(e, t);
	return n.length ? n.reduce((e, t) => j(t) >= j(e) ? t : e) : null;
}
function ve(e) {
	if (!e.cinchEnabled) return !1;
	let t = N(e.hand, e.trumpSuit);
	return t.filter((e) => j(e) >= 13).length >= 3 && t.length > 0;
}
function ye(e, t) {
	let n = _e(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function be(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => O([e.card])[0]) : [];
}
function q(e) {
	let t = e.currentTrick ?? null, n = be(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function J(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = q(e.publicHand);
	return {
		hand: e.hand,
		trumpSuit: e.publicHand.trumpSuit,
		leadSuit: r,
		trickPlays: t,
		isLeading: n,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	};
}
function Y(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return ve(e) && !ye(n, e) ? {
		allowed: !1,
		reason: "Cinch: play your highest trump",
		code: "CINCH_HIGHEST_TRUMP"
	} : { allowed: !0 };
	let r = e.leadSuit ?? e.trickPlays[0]?.suit;
	return r ? N(e.hand, r).length > 0 ? n.suit === r ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must follow suit",
		code: "MUST_FOLLOW_SUIT"
	} : N(e.hand, e.trumpSuit).length > 0 ? M(n, e.trumpSuit) ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must play a trump when void in the led suit",
		code: "MUST_TRUMP"
	} : { allowed: !0 } : { allowed: !0 };
}
function X(e, t, n, r) {
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
function xe(e, t, n) {
	let r = e.filter((e) => !M(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => j(t) > j(e) ? t : e) : null;
}
function Se(e, t) {
	let n = e.filter((e) => M(e, t));
	return n.length ? n.reduce((e, t) => j(t) > j(e) ? t : e) : null;
}
function Z(e, t) {
	return j(e) > j(t);
}
function Ce(e) {
	return {
		hand: e.hand,
		trumpSuit: e.trumpSuit,
		leadSuit: e.leadSuit,
		trickPlays: e.trickPlays,
		isLeading: e.isLeading,
		cinchEnabled: e.cinchEnabled
	};
}
function Q(e, t = {}) {
	let n = Ce(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = Y(n, r);
			i.allowed ? e.push(r) : X(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? N(n.hand, r) : [], a = N(n.hand, n.trumpSuit), o = r ? xe(n.trickPlays, r, n.trumpSuit) : null, s = Se(n.trickPlays, n.trumpSuit), c;
	if (i.length > 0) {
		if (c = i, !s && o) {
			let e = i.filter((e) => Z(e, o));
			e.length && (c = e);
		}
	} else if (a.length > 0) {
		if (c = a, s) {
			let e = a.filter((e) => Z(e, s));
			e.length && (c = e);
		}
	} else c = [...n.hand];
	let l = [];
	for (let e = 0; e < n.hand.length; e += 1) c.some((t) => t.rank === n.hand[e].rank && t.suit === n.hand[e].suit) && l.push(e);
	return l;
}
function we(e, t, n = {}) {
	let r = Ce(e), i = Y(r, t);
	if (X(n, r, t, i), !i.allowed) return {
		ok: !1,
		code: i.code ?? "MUST_BEAT_LED_SUIT",
		message: i.reason ?? "Illegal play"
	};
	if (r.isLeading || r.trickPlays.length === 0) return { ok: !0 };
	if (!Q(e, n).includes(t)) {
		let n = e.hand[t], r = e.leadSuit, i = r ? N(e.hand, r) : [], a = N(e.hand, e.trumpSuit), o = r ? Se(e.trickPlays, e.trumpSuit) : null;
		return r && i.length && n.suit !== r ? {
			ok: !1,
			code: "MUST_FOLLOW_SUIT",
			message: "You must follow suit"
		} : r && !i.length && a.length && !M(n, e.trumpSuit) ? {
			ok: !1,
			code: "MUST_TRUMP",
			message: "You must play a trump when void in the led suit"
		} : o && M(n, e.trumpSuit) && !Z(n, o) ? {
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
function $(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => M(e.card, n));
	if (r.length) return r.reduce((e, t) => j(t.card) > j(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => j(t.card) > j(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
var Te = 5;
function Ee(e, t) {
	return e[(e.indexOf(t) + 1) % e.length];
}
function De(e) {
	let t = R(e.playerId, e.privateHand, e.publicHand), n = (e.publicHand.playedCards?.length ?? 0) === 0 && (e.publicHand.currentTrick?.plays?.length ?? 0) === 0 && Object.values(e.publicHand.tricksByPlayer ?? {}).every((e) => (e ?? 0) === 0), r = Oe({
		publicHand: e.publicHand,
		playerHand: t,
		playerId: e.playerId,
		cardIndex: e.cardIndex,
		actionOrder: e.actionOrder,
		cinchEnabled: e.cinchEnabled
	}), i = t[e.cardIndex], a = r.publicHand;
	e.publicHand.trumpUpcard && (n || i && V(i, e.publicHand)) && (a = {
		...a,
		trumpUpcard: null
	});
	let o = z(e.playerId, r.playerHand, a);
	return {
		...r,
		publicHand: a,
		privateHand: o,
		playerHand: o
	};
}
function Oe(e) {
	let { publicHand: t, playerId: n, cardIndex: r, actionOrder: i, cinchEnabled: a } = e;
	if (t.phase !== v.PLAY) throw Error("Not in trick-play phase");
	if (t.turnPlayerId !== n) throw Error("Not your turn");
	let o = t.currentTrick;
	if (!o) throw Error("No active trick");
	let { trickPlays: s, isLeading: c, leadSuit: l, trickIndex: u } = q(t), d = we(J({
		hand: e.playerHand,
		publicHand: t
	}), r, {
		dealerSeat: t.dealerId ?? null,
		leaderSeat: o.leadPlayerId ?? null,
		currentTurnSeat: n,
		trickIndex: u
	});
	if (!d.ok) throw Error(d.message);
	let f = e.playerHand[r], p = ce(e.playerHand, r), m = {
		playerId: n,
		card: T(f)
	}, h = [...o.plays, m], g = c ? f.suit : l, _ = t.participantIds;
	if (!(h.length >= _.length)) {
		let e = Ee(i, n), r = {
			...o,
			leadSuit: g,
			plays: h
		};
		return {
			publicHand: {
				...t,
				leadSuit: g,
				currentTrick: r,
				turnPlayerId: e
			},
			playerHand: p,
			trickResolved: !1,
			handComplete: !1
		};
	}
	let y = $(h.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})), g, t.trumpSuit), b = { ...t.tricksByPlayer };
	b[y] = (b[y] ?? 0) + 1;
	let x = [...t.playedCards, ...h.map((e) => ({
		...e,
		trickNumber: o.trickNumber
	}))];
	if (Object.values(b).reduce((e, t) => e + (t || 0), 0) >= Te) return {
		publicHand: {
			...t,
			tricksByPlayer: b,
			playedCards: x,
			currentTrick: null,
			leadSuit: null,
			turnPlayerId: null
		},
		playerHand: p,
		trickResolved: !0,
		handComplete: !0
	};
	let S = o.trickNumber + 1;
	return {
		publicHand: {
			...t,
			tricksByPlayer: b,
			playedCards: x,
			leadSuit: null,
			turnPlayerId: y,
			currentTrick: {
				trickNumber: S,
				leadPlayerId: y,
				leadSuit: null,
				plays: []
			}
		},
		playerHand: p,
		trickResolved: !0,
		handComplete: !1
	};
}
function ke(e, t, n) {
	return n <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: j(e),
		trump: M(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, n).map((e) => e.index);
}
function Ae(e, t) {
	let n = Q(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => j(e[n]) > j(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => j(e[n]) < j(e[t]) ? n : t);
	let i = n.filter((n) => $([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => j(e[n]) < j(e[t]) ? n : t);
}
//#endregion
export { p as CARDS_PER_PLAYER, P as CardUniquenessError, b as HAND_DECISION_MS, y as HAND_DECISION_SECONDS, v as HAND_PHASE, ne as activateHandDecision, f as activePlayerOrder, K as advanceAfterDraw, G as allDrawsComplete, ie as applyDecisionPass, re as applyDecisionPlay, ae as applyDecisionTimeout, U as applyDraw, ge as applyDrawFold, Oe as applyPlayCard, me as applyPlayerDraw, De as applyPlayerPlayCard, ue as assertCardUniqueness, g as assignTrumpUpcard, ke as botDrawDiscardIndices, Ae as botPlayCardIndex, x as buildHandDecision, J as buildPlayValidationState, Y as canPlayCard, k as cardKey, A as cardsEqual, H as cardsRemainingInHand, i as createDeck, S as currentDecisionPlayer, m as dealInitialHand, C as dealerMustPlayTrumpAce, oe as decisionAsEnrollmentView, w as decisionPatchAfterStep, O as deserializeCards, fe as displayHoleCardCount, l as drawCardsFromDeck, B as effectiveIndexDiscardsTrump, R as effectivePlayerHand, Q as getLegalPlayIndices, M as isTrump, X as logPlayValidation, _ as maxDrawDiscards, W as nextPlayerInOrder, q as normalizeTrickForPlay, V as playedTrumpUpcard, d as playerOrderFromDealer, z as privateHandFromEffective, j as rankValue, u as remainingDeckCount, $ as resolveTrickWinner, he as revealToDraw, T as serializeCard, E as serializeCards, D as serializeHandState, se as serializePagatRevealHand, s as shuffleDeck, c as shuffledDeckFromSeed, L as trumpOnTable, I as trumpOwnerId, pe as trumpRevealMirroredInHolderHand, we as validatePlayIndex };
