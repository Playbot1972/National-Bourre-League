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
function T(e, t, n, r, i, a = Date.now()) {
	if (S(t) !== n) throw Error("Not your turn to decide yet");
	let o = _(e.participantIds.length, i?.dealingRule), s = Math.max(0, Math.min(o, Math.floor(r))), c = [...t.playingIds, n], l = {
		...t.plannedDiscards,
		[n]: s
	};
	return w(e, t, c, t.passedIds, l, i, a);
}
function re(e, t, n, r, i = Date.now()) {
	if (S(t) !== n) throw Error("Not your turn to pass yet");
	if (C(n, e.dealerId, e.trumpUpcard)) throw Error("Dealer must play when trump is an ace");
	if (t.passedIds.includes(n)) throw Error("Already passed this hand");
	let a = [...t.passedIds, n];
	return w(e, t, t.playingIds, a, t.plannedDiscards, r, i);
}
function ie(e, t, n, r = Date.now()) {
	let i = S(t);
	if (!i) throw Error("No decision turn");
	if (C(i, e.dealerId, e.trumpUpcard)) return T(e, t, i, 0, n, r);
	let a = [...t.passedIds, i];
	return w(e, t, t.playingIds, a, t.plannedDiscards, n, r);
}
function ae(e) {
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
function E(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function D(e) {
	return e.map(E);
}
function O(e, t) {
	let n = typeof t == "object" && t ? t.dealerId : t, r = typeof t == "object" && t ? t.actionOrder : e.dealOrder, i = typeof t == "object" && t && t.maxDrawDiscards != null ? t.maxDrawDiscards : _(e.participantIds.length), a = typeof t == "object" && t ? t.cinchEnabled === !0 : !1, o = typeof t == "object" && t && t.initialPhase ? t.initialPhase : v.DRAW, s = typeof t == "object" && t ? t.handDecision ?? null : null, c = {
		phase: o,
		participantIds: [...e.participantIds],
		seatedIds: [...e.participantIds],
		dealerId: n,
		trumpHolderId: e.trumpHolderId,
		trumpSuit: e.trumpSuit,
		trumpUpcard: E(e.trumpUpcard),
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
	for (let [t, n] of Object.entries(e.privateHands)) l[t] = { cards: D(n) };
	return {
		publicHand: c,
		privateHandsByPlayer: l
	};
}
function oe(e, t) {
	let n = x(e.participantIds, t.dealerId, !1);
	return O(e, {
		...t,
		initialPhase: v.REVEAL,
		handDecision: n
	});
}
function se(e) {
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
var H = 5;
function U(e, t) {
	let n = (e.playedCards ?? []).filter((e) => e.playerId === t).length, r = (e.currentTrick?.plays ?? []).filter((e) => e.playerId === t).length;
	return Math.max(0, H - n - r);
}
function de(e, t, n = !1) {
	let r = U(e, t);
	return n ? r : I(e) === t && L(e) ? Math.max(0, r - 1) : r;
}
function fe(e, t) {
	if (!e.trumpUpcard || !e.trumpHolderId) return !1;
	let n = t[e.trumpHolderId];
	return n?.length ? n.some((t) => A(t, e.trumpUpcard)) : !1;
}
//#endregion
//#region src/game/draw.ts
function W(e) {
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
function G(e, t) {
	let n = e.indexOf(t);
	return n < 0 ? e[0] ?? null : e[(n + 1) % e.length] ?? null;
}
function K(e, t) {
	let n = new Set(t);
	return e.every((e) => n.has(e));
}
function pe(e) {
	let t = R(e.playerId, e.privateHand, e.publicHand), n = W({
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
function me(e, t) {
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
function he(e, t, n) {
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
	if (K(r, o)) return {
		kind: "continue",
		publicHand: q(s, a, n)
	};
	let c = G(a, n), l = new Set(o), u = 0;
	for (; c && l.has(c) && u < a.length + 1;) c = G(a, c), u += 1;
	return {
		kind: "continue",
		publicHand: {
			...s,
			turnPlayerId: c
		}
	};
}
function q(e, t, n) {
	let r = [...new Set([...e.drawCompletedIds ?? [], n])], i = e.participantIds;
	if (!K(i, r)) {
		let i = G(t, n);
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
//#region src/game/legal.ts
function ge(e, t, n) {
	let r = e.filter((e) => !M(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => j(t) > j(e) ? t : e) : null;
}
function J(e, t) {
	let n = e.filter((e) => M(e, t));
	return n.length ? n.reduce((e, t) => j(t) > j(e) ? t : e) : null;
}
function Y(e, t) {
	return j(e) > j(t);
}
function X(e) {
	let { hand: t, trumpSuit: n, leadSuit: r, trickPlays: i, isLeading: a } = e;
	if (!t.length) return [];
	if (a || !r || i.length === 0) {
		if (e.cinchEnabled && _e(t, n) >= 3) {
			let e = N(t, n);
			if (e.length) {
				let n = e.reduce((e, t) => j(e) >= j(t) ? e : t), r = t.findIndex((e) => e.rank === n.rank && e.suit === n.suit);
				return r >= 0 ? [r] : [];
			}
		}
		return t.map((e, t) => t);
	}
	let o = N(t, r), s = N(t, n), c = ge(i, r, n), l = J(i, n), u;
	if (o.length > 0) {
		if (u = o, !l && c) {
			let e = o.filter((e) => Y(e, c));
			e.length && (u = e);
		}
	} else if (s.length > 0) {
		if (u = s, l) {
			let e = s.filter((e) => Y(e, l));
			e.length && (u = e);
		}
	} else u = [...t];
	let d = [];
	for (let e = 0; e < t.length; e += 1) u.some((n) => n.rank === t[e].rank && n.suit === t[e].suit) && d.push(e);
	return d;
}
function Z(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		ok: !1,
		code: "INVALID_INDEX",
		message: "Invalid card selection"
	};
	if (!X(e).includes(t)) {
		let n = e.hand[t], r = e.leadSuit, i = r ? N(e.hand, r) : [], a = N(e.hand, e.trumpSuit), o = r ? J(e.trickPlays, e.trumpSuit) : null;
		return r && i.length && n.suit !== r ? {
			ok: !1,
			code: "MUST_FOLLOW_SUIT",
			message: "You must follow suit"
		} : r && !i.length && a.length && !M(n, e.trumpSuit) ? {
			ok: !1,
			code: "MUST_TRUMP",
			message: "You must play a trump when void in the led suit"
		} : o && M(n, e.trumpSuit) && !Y(n, o) ? {
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
function _e(e, t) {
	return N(e, t).sort((e, t) => j(t) - j(e)).filter((e) => j(e) >= 13).length;
}
//#endregion
//#region src/game/trick.ts
function Q(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => M(e.card, n));
	if (r.length) return r.reduce((e, t) => j(t.card) > j(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => j(t.card) > j(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
var ve = 5;
function ye(e, t) {
	return e[(e.indexOf(t) + 1) % e.length];
}
function be(e) {
	let t = R(e.playerId, e.privateHand, e.publicHand), n = (e.publicHand.playedCards?.length ?? 0) === 0 && (e.publicHand.currentTrick?.plays?.length ?? 0) === 0 && Object.values(e.publicHand.tricksByPlayer ?? {}).every((e) => (e ?? 0) === 0), r = $({
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
function $(e) {
	let { publicHand: t, playerId: n, cardIndex: r, actionOrder: i, cinchEnabled: a } = e;
	if (t.phase !== v.PLAY) throw Error("Not in trick-play phase");
	if (t.turnPlayerId !== n) throw Error("Not your turn");
	let o = t.currentTrick;
	if (!o) throw Error("No active trick");
	let s = o.plays.map((e) => ({
		rank: e.card.rank,
		suit: e.card.suit
	})), c = o.plays.length === 0, l = o.leadSuit ?? (c ? null : s[0]?.suit), u = Z({
		hand: e.playerHand,
		trumpSuit: t.trumpSuit,
		leadSuit: c ? null : l,
		trickPlays: s,
		isLeading: c,
		cinchEnabled: a
	}, r);
	if (!u.ok) throw Error(u.message);
	let d = e.playerHand[r], f = ce(e.playerHand, r), p = {
		playerId: n,
		card: E(d)
	}, m = [...o.plays, p], h = c ? d.suit : l, g = t.participantIds;
	if (!(m.length >= g.length)) {
		let e = ye(i, n), r = {
			...o,
			leadSuit: h,
			plays: m
		};
		return {
			publicHand: {
				...t,
				leadSuit: h,
				currentTrick: r,
				turnPlayerId: e
			},
			playerHand: f,
			trickResolved: !1,
			handComplete: !1
		};
	}
	let _ = Q(m.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})), h, t.trumpSuit), y = { ...t.tricksByPlayer };
	y[_] = (y[_] ?? 0) + 1;
	let b = [...t.playedCards, ...m.map((e) => ({
		...e,
		trickNumber: o.trickNumber
	}))];
	if (Object.values(y).reduce((e, t) => e + (t || 0), 0) >= ve) return {
		publicHand: {
			...t,
			tricksByPlayer: y,
			playedCards: b,
			currentTrick: null,
			leadSuit: null,
			turnPlayerId: null
		},
		playerHand: f,
		trickResolved: !0,
		handComplete: !0
	};
	let x = o.trickNumber + 1;
	return {
		publicHand: {
			...t,
			tricksByPlayer: y,
			playedCards: b,
			leadSuit: null,
			turnPlayerId: _,
			currentTrick: {
				trickNumber: x,
				leadPlayerId: _,
				leadSuit: null,
				plays: []
			}
		},
		playerHand: f,
		trickResolved: !0,
		handComplete: !1
	};
}
function xe(e, t, n) {
	return n <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: j(e),
		trump: M(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, n).map((e) => e.index);
}
function Se(e, t) {
	let n = X(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => j(e[n]) > j(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => j(e[n]) < j(e[t]) ? n : t);
	let i = n.filter((n) => Q([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => j(e[n]) < j(e[t]) ? n : t);
}
//#endregion
export { p as CARDS_PER_PLAYER, P as CardUniquenessError, b as HAND_DECISION_MS, y as HAND_DECISION_SECONDS, v as HAND_PHASE, ne as activateHandDecision, f as activePlayerOrder, q as advanceAfterDraw, K as allDrawsComplete, re as applyDecisionPass, T as applyDecisionPlay, ie as applyDecisionTimeout, W as applyDraw, he as applyDrawFold, $ as applyPlayCard, pe as applyPlayerDraw, be as applyPlayerPlayCard, ue as assertCardUniqueness, g as assignTrumpUpcard, xe as botDrawDiscardIndices, Se as botPlayCardIndex, x as buildHandDecision, k as cardKey, A as cardsEqual, U as cardsRemainingInHand, i as createDeck, S as currentDecisionPlayer, m as dealInitialHand, C as dealerMustPlayTrumpAce, ae as decisionAsEnrollmentView, w as decisionPatchAfterStep, se as deserializeCards, de as displayHoleCardCount, l as drawCardsFromDeck, B as effectiveIndexDiscardsTrump, R as effectivePlayerHand, X as getLegalPlayIndices, M as isTrump, _ as maxDrawDiscards, G as nextPlayerInOrder, V as playedTrumpUpcard, d as playerOrderFromDealer, z as privateHandFromEffective, j as rankValue, u as remainingDeckCount, Q as resolveTrickWinner, me as revealToDraw, E as serializeCard, D as serializeCards, O as serializeHandState, oe as serializePagatRevealHand, s as shuffleDeck, c as shuffledDeckFromSeed, L as trumpOnTable, I as trumpOwnerId, fe as trumpRevealMirroredInHolderHand, Z as validatePlayIndex };
