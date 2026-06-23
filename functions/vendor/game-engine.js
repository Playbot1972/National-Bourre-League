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
function m(e, t) {
	return e.seatedIds?.length ? e.seatedIds : t?.length ? t : e.actionOrder?.length ? e.actionOrder : e.participantIds ?? [];
}
function h(e, t) {
	let n = e.participantIds ?? [];
	if (e.actionOrder?.length) return e.actionOrder.filter((e) => n.includes(e));
	let r = m(e, t);
	return f(e.dealerId, n, r);
}
var g = 5;
//#endregion
//#region src/game/deal.ts
function _(e) {
	let t = [...new Set(e.participantIds.filter(Boolean))];
	if (t.length < 2) throw Error("Need at least two participants to deal");
	let n = f(e.dealerId, t, e.sortedPlayerIds);
	if (n.length < 2) throw Error("Need at least two seated participants in deal order");
	let r = p(e.dealerId, t, e.sortedPlayerIds), a = e.seed ?? Date.now(), o = s(i(), a), c = Object.fromEntries(n.map((e) => [e, []])), l = 0;
	for (let e = 0; e < 5; e += 1) for (let e of n) c[e].push(o[l]), l += 1;
	let u = v(e.dealerId, n), d = y(u, c), m = Object.fromEntries(t.map((e) => [e, 0]));
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
function v(e, t) {
	return e && t.includes(e) ? e : t[t.length - 1];
}
function y(e, t) {
	let n = t[e];
	if (n?.length === 5) return n[4];
	throw Error("Cannot assign trump upcard — trump holder has no fifth card");
}
//#endregion
//#region src/game/drawLimit.ts
function b(e, t) {
	if ((t ?? "").toLowerCase().includes("no draw")) return 0;
	let n = Math.max(2, e || 2);
	return n >= 8 ? 2 : n >= 7 ? 3 : n >= 6 ? 4 : 5;
}
//#endregion
//#region src/game/cardUtils.ts
function x(e) {
	return `${e.rank}:${e.suit}`;
}
function S(e, t) {
	return e.rank === t.rank && e.suit === t.suit;
}
function C(t) {
	return e[t.rank];
}
function w(e, t) {
	return e.suit === t;
}
function T(e, t) {
	return e.filter((e) => e.suit === t);
}
function ee(e, t) {
	return e.filter((e, n) => n !== t);
}
function te(e, t) {
	let n = [...new Set(t)].sort((e, t) => t - e), r = [...e];
	for (let e of n) e < 0 || e >= r.length || r.splice(e, 1);
	return r;
}
//#endregion
//#region src/game/drawPile.ts
function ne() {
	return {
		stock: [],
		recyclePool: [],
		pendingDiscards: [],
		recycleShuffleCount: 0
	};
}
function re(e) {
	return {
		stock: [...e],
		recyclePool: [],
		pendingDiscards: [],
		recycleShuffleCount: 0
	};
}
function E(e) {
	return e.stock.length + e.recyclePool.length;
}
function D(e) {
	return {
		stock: [...e.stock],
		recyclePool: [...e.recyclePool],
		pendingDiscards: [...e.pendingDiscards],
		recycleShuffleCount: e.recycleShuffleCount
	};
}
function ie(e, t) {
	if (!e.recyclePool.length) return e;
	let n = (t ^ (e.recycleShuffleCount + 1) * 2654435769) >>> 0;
	return {
		stock: s(e.recyclePool, n),
		recyclePool: [],
		pendingDiscards: [...e.pendingDiscards],
		recycleShuffleCount: e.recycleShuffleCount + 1
	};
}
function ae(e, t, n) {
	if (t <= 0) return {
		pile: D(e),
		cards: []
	};
	let r = D(e), i = [];
	for (; i.length < t;) {
		if (r.stock.length === 0) {
			if (r.recyclePool.length === 0) throw Error(`Not enough cards in draw pile (${E(e)} available, tried to draw ${t})`);
			r = ie(r, n);
		}
		let a = t - i.length, o = Math.min(a, r.stock.length);
		i.push(...r.stock.splice(0, o));
	}
	return {
		pile: r,
		cards: i
	};
}
function oe(e) {
	let t = e.drawCount;
	if (t === 0) return {
		pile: D(e.pile),
		replacements: []
	};
	let { pile: n, cards: r } = ae({
		...D(e.pile),
		pendingDiscards: [...e.discardedCards]
	}, t, e.deckSeed);
	return {
		pile: {
			...n,
			recyclePool: [...n.recyclePool, ...n.pendingDiscards],
			pendingDiscards: []
		},
		replacements: r
	};
}
function se(e, t) {
	if (e.drawStock != null) return {
		stock: q(e.drawStock),
		recyclePool: q(e.recyclePool ?? []),
		pendingDiscards: q(e.pendingDrawDiscards ?? []),
		recycleShuffleCount: e.recycleShuffleCount ?? 0
	};
	let n = e.deckSeed, r = t ?? (n == null ? [] : c(n)), i = e.deckNextIndex ?? 0;
	return re(r.slice(i));
}
function ce(e, t) {
	return {
		...e,
		drawStock: K(t.stock),
		recyclePool: K(t.recyclePool),
		pendingDrawDiscards: K(t.pendingDiscards),
		recycleShuffleCount: t.recycleShuffleCount,
		remainingDeckCount: t.stock.length
	};
}
//#endregion
//#region src/game/invariants.ts
var O = class extends Error {
	duplicates;
	constructor(e, t) {
		super(e), this.name = "CardUniquenessError", this.duplicates = t;
	}
};
function k(e, t, n) {
	let r = x(t);
	return e.get(r) ? [r] : (e.set(r, n), []);
}
function le(e, t) {
	let n = [];
	for (let r = 0; r < t.stock.length; r += 1) n.push(...k(e, t.stock[r], `stock[${r}]`));
	for (let r = 0; r < t.recyclePool.length; r += 1) n.push(...k(e, t.recyclePool[r], `recycle[${r}]`));
	for (let r = 0; r < t.pendingDiscards.length; r += 1) n.push(...k(e, t.pendingDiscards[r], `pending[${r}]`));
	return n;
}
function ue(e) {
	let t = /* @__PURE__ */ new Map(), n = [];
	if (e.drawPile) n.push(...le(t, e.drawPile));
	else if (e.deck != null && e.deckNextIndex != null) for (let r = e.deckNextIndex; r < e.deck.length; r += 1) n.push(...k(t, e.deck[r], `deck[${r}]`));
	for (let [r, i] of Object.entries(e.privateHands)) for (let e = 0; e < i.length; e += 1) n.push(...k(t, i[e], `hand:${r}[${e}]`));
	if (e.trumpUpcard) {
		let r = x(e.trumpUpcard);
		((e.trumpHolderId ? e.privateHands[e.trumpHolderId] : void 0)?.some((e) => x(e) === r) ?? !1) || n.push(...k(t, e.trumpUpcard, "trumpUpcard"));
	}
	for (let r of e.currentTrick?.plays ?? []) n.push(...k(t, r.card, `trick:${r.playerId}`));
	for (let r of e.playedCards ?? []) n.push(...k(t, r.card, `played:t${r.trickNumber}`));
	if (n.length) {
		let e = [...new Set(n)];
		throw new O(`Duplicate card(s) in game state: ${e.map((e) => `${e} (${t.get(e)})`).join(", ")}`, e);
	}
}
function A(e) {
	return e.trumpHolderId ?? e.dealerId ?? null;
}
function j(e) {
	return !!e.trumpUpcard;
}
function M(e, t, n) {
	let r = [...t], i = A(n), a = n.trumpUpcard;
	return !i || e !== i || !a || r.some((e) => S(e, a)) || r.push(a), r;
}
function N(e, t, n) {
	let r = A(n), i = n.trumpUpcard;
	return r && e === r && i && !t.some((e) => S(e, i)) ? [...t, i] : [...t];
}
function de(e, t, n, r) {
	let i = A(r);
	return !i || e !== i || !r.trumpUpcard ? !1 : t.some((e) => {
		let t = n[e];
		return t && S(t, r.trumpUpcard);
	});
}
function fe(e, t) {
	return !!(t.trumpUpcard && S(e, t.trumpUpcard));
}
var pe = 5;
function me(e, t) {
	let n = (e.playedCards ?? []).filter((e) => e.playerId === t).length, r = (e.currentTrick?.plays ?? []).filter((e) => e.playerId === t).length;
	return Math.max(0, pe - n - r);
}
function he(e, t, n = !1) {
	let r = me(e, t);
	return n ? r : A(e) === t && j(e) ? Math.max(0, r - 1) : r;
}
function ge(e, t) {
	if (!e.trumpUpcard || !e.trumpHolderId) return !1;
	let n = t[e.trumpHolderId];
	return n?.length ? n.some((t) => S(t, e.trumpUpcard)) : !1;
}
//#endregion
//#region src/game/types.ts
var P = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
};
//#endregion
//#region src/game/draw.ts
function F(e) {
	let t = [...new Set(e.discardIndices)].sort((e, t) => e - t);
	if (t.some((t) => t < 0 || t >= e.hand.length)) throw Error("Invalid discard selection");
	if (t.length > e.maxDiscards) throw Error(`You may discard at most ${e.maxDiscards} cards`);
	if (t.length > 0 && t.length > e.maxDiscards) throw Error(`Draw limit is ${e.maxDiscards}`);
	let n = t.map((t) => e.hand[t]), r = te(e.hand, t), i = t.length;
	if (i === 0) return {
		hand: r,
		pile: e.pile,
		discarded: 0
	};
	let a = E(e.pile);
	if (a < i) throw Error(`Not enough cards left in draw pile (${a} remaining, tried to draw ${i})`);
	let { pile: o, replacements: s } = oe({
		pile: e.pile,
		discardedCards: n,
		drawCount: i,
		deckSeed: e.deckSeed
	});
	return {
		hand: [...r, ...s],
		pile: o,
		discarded: i
	};
}
function I(e, t) {
	let n = e.indexOf(t);
	return n < 0 ? e[0] ?? null : e[(n + 1) % e.length] ?? null;
}
function L(e, t, n, r) {
	let i = h(e, r).filter((e) => t.includes(e)), a = m(e, r), o = p(e.dealerId, t, a) ?? i[0] ?? null;
	if (!o) return null;
	let s = i.indexOf(o), c = s >= 0 ? [...i.slice(s), ...i.slice(0, s)] : i;
	for (let e of c) if (!n.includes(e)) return e;
	return o;
}
function R(e, t) {
	let n = new Set(t);
	return e.every((e) => n.has(e));
}
function _e(e) {
	let t = e.publicHand.deckSeed ?? 0, n = se(e.publicHand, e.deck), r = M(e.playerId, e.privateHand, e.publicHand), i = F({
		hand: r,
		discardIndices: e.discardIndices,
		pile: n,
		deckSeed: t,
		maxDiscards: e.maxDiscards
	}), a = de(e.playerId, e.discardIndices, r, e.publicHand), o = ce(e.publicHand, i.pile);
	return a && (o = {
		...o,
		trumpUpcard: null
	}), {
		privateHand: N(e.playerId, i.hand, o),
		publicHand: o,
		pile: i.pile,
		discarded: i.discarded
	};
}
function ve(e, t) {
	let n = [...e.participantIds], r = h(e).filter((e) => n.includes(e)), i = Object.fromEntries(n.map((t) => [t, e.tricksByPlayer[t] ?? 0])), a = L(e, n, []);
	return {
		...e,
		phase: P.DRAW,
		participantIds: n,
		actionOrder: r,
		handDecision: null,
		drawCompletedIds: [],
		tricksByPlayer: i,
		turnPlayerId: a,
		maxDrawDiscards: b(n.length, t),
		pendingDrawDiscards: []
	};
}
function ye(e, t, n) {
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
	if (R(r, o)) return {
		kind: "continue",
		publicHand: z(s, a, n)
	};
	let c = I(a, n), l = new Set(o), u = 0;
	for (; c && l.has(c) && u < a.length + 1;) c = I(a, c), u += 1;
	return {
		kind: "continue",
		publicHand: {
			...s,
			turnPlayerId: c
		}
	};
}
function z(e, t, n) {
	let r = [...new Set([...e.drawCompletedIds ?? [], n])], i = e.participantIds;
	if (!R(i, r)) {
		let i = I(t, n);
		return {
			...e,
			drawCompletedIds: r,
			turnPlayerId: i,
			pendingDrawDiscards: []
		};
	}
	let a = m(e), o = p(e.dealerId, i, a) ?? h(e)[0] ?? n;
	return {
		...e,
		phase: P.PLAY,
		drawCompletedIds: r,
		pendingDrawDiscards: [],
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
//#region src/game/decision.ts
var be = 15, B = 15 * 1e3;
function V(e, t, n = !1, r = Date.now()) {
	return {
		active: n,
		orderedPlayerIds: d(t, e),
		currentIndex: 0,
		turnDeadlineMs: r + B,
		playingIds: [],
		passedIds: [],
		plannedDiscards: {}
	};
}
function H(e) {
	return e.orderedPlayerIds[e.currentIndex] ?? null;
}
function U(e, t, n) {
	return e === t && n?.rank === "A" && !!n?.suit;
}
function xe(e, t, n, r) {
	let i = (e.actionOrder ?? e.participantIds).filter((e) => t.includes(e)), a = b(t.length, r), o = t.filter((e) => (n[e] ?? 0) === 0), s = Object.fromEntries(t.map((t) => [t, e.tricksByPlayer[t] ?? 0]));
	return {
		...e,
		phase: P.DRAW,
		participantIds: [...t],
		actionOrder: i,
		maxDrawDiscards: a,
		tricksByPlayer: s,
		drawCompletedIds: o,
		turnPlayerId: L(e, t, o),
		handDecision: null,
		seatedIds: e.seatedIds
	};
}
function Se(e, t = Date.now()) {
	if (e.phase === P.DECISION && e.handDecision?.active === !0) return e;
	let n = e.handDecision ?? V(e.seatedIds ?? e.participantIds, e.dealerId, !0, t);
	return {
		...e,
		phase: P.DECISION,
		handDecision: {
			...n,
			active: !0,
			turnDeadlineMs: t + B
		}
	};
}
function W(e, t, n, r, i, a, o = Date.now()) {
	let s = t.currentIndex + 1;
	if (s < t.orderedPlayerIds.length) return {
		kind: "continue",
		handDecision: {
			...t,
			playingIds: n,
			passedIds: r,
			plannedDiscards: i,
			currentIndex: s,
			turnDeadlineMs: o + B
		},
		publicHand: {
			...e,
			handDecision: {
				...t,
				playingIds: n,
				passedIds: r,
				plannedDiscards: i,
				currentIndex: s,
				turnDeadlineMs: o + B
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
		let t = V(e.seatedIds ?? e.participantIds, e.dealerId, !0, o);
		return {
			kind: "restart",
			handDecision: t,
			publicHand: {
				...e,
				phase: P.DECISION,
				handDecision: t
			}
		};
	}
	return {
		kind: "draw",
		handDecision: null,
		publicHand: xe(e, n, i, a?.dealingRule)
	};
}
function Ce(e, t, n, r, i, a = Date.now()) {
	if (H(t) !== n) throw Error("Not your turn to decide yet");
	let o = b(e.participantIds.length, i?.dealingRule), s = Math.max(0, Math.min(o, Math.floor(r))), c = [...t.playingIds, n], l = {
		...t.plannedDiscards,
		[n]: s
	};
	return W(e, t, c, t.passedIds, l, i, a);
}
function we(e, t, n, r, i = Date.now()) {
	if (H(t) !== n) throw Error("Not your turn to pass yet");
	if (U(n, e.dealerId, e.trumpUpcard)) throw Error("Dealer must play when trump is an ace");
	if (t.passedIds.includes(n)) throw Error("Already passed this hand");
	let a = [...t.passedIds, n];
	return W(e, t, t.playingIds, a, t.plannedDiscards, r, i);
}
function Te(e, t, n, r = Date.now()) {
	let i = H(t);
	if (!i) throw Error("No decision turn");
	if (U(i, e.dealerId, e.trumpUpcard)) return Ce(e, t, i, 0, n, r);
	let a = [...t.passedIds, i];
	return W(e, t, t.playingIds, a, t.plannedDiscards, n, r);
}
function Ee(e) {
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
function G(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function K(e) {
	return e.map(G);
}
function De(e, t) {
	let n = typeof t == "object" && t ? t.dealerId : t, r = typeof t == "object" && t ? t.actionOrder : e.dealOrder, i = typeof t == "object" && t && t.maxDrawDiscards != null ? t.maxDrawDiscards : b(e.participantIds.length), a = typeof t == "object" && t ? t.cinchEnabled === !0 : !1, o = typeof t == "object" && t && t.initialPhase ? t.initialPhase : P.DRAW, s = typeof t == "object" && t ? t.handDecision ?? null : null, c = {
		phase: o,
		participantIds: [...e.participantIds],
		seatedIds: typeof t == "object" && t && t.seatedIds?.length ? [...t.seatedIds] : [...e.participantIds],
		dealerId: n,
		trumpHolderId: e.trumpHolderId,
		trumpSuit: e.trumpSuit,
		trumpUpcard: G(e.trumpUpcard),
		remainingDeckCount: e.remainingDeck.length,
		currentTrick: null,
		leadSuit: null,
		playedCards: [],
		turnPlayerId: e.turnPlayerId,
		tricksByPlayer: { ...e.tricksByPlayer },
		deckSeed: e.deckSeed,
		deckNextIndex: e.deckNextIndex,
		drawStock: K(e.remainingDeck),
		recyclePool: [],
		pendingDrawDiscards: [],
		recycleShuffleCount: 0,
		actionOrder: [...r],
		drawCompletedIds: [],
		maxDrawDiscards: i,
		cinchEnabled: a,
		handDecision: s
	}, l = {};
	for (let [t, n] of Object.entries(e.privateHands)) l[t] = { cards: K(n) };
	return {
		publicHand: c,
		privateHandsByPlayer: l
	};
}
function Oe(e, t) {
	let n = V(e.participantIds, t.dealerId, !1);
	return De(e, {
		...t,
		initialPhase: P.REVEAL,
		handDecision: n
	});
}
function q(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/playContext.ts
function ke(e, t) {
	let n = T(e, t);
	return n.length ? n.reduce((e, t) => C(t) >= C(e) ? t : e) : null;
}
function Ae(e) {
	if (!e.cinchEnabled) return !1;
	let t = T(e.hand, e.trumpSuit);
	return t.filter((e) => C(e) >= 13).length >= 3 && t.length > 0;
}
function je(e, t) {
	let n = ke(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function Me(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => q([e.card])[0]) : [];
}
function J(e) {
	let t = e.currentTrick ?? null, n = Me(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function Ne(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = J(e.publicHand);
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
	if (e.isLeading || e.trickPlays.length === 0) return Ae(e) && !je(n, e) ? {
		allowed: !1,
		reason: "Cinch: play your highest trump",
		code: "CINCH_HIGHEST_TRUMP"
	} : { allowed: !0 };
	let r = e.leadSuit ?? e.trickPlays[0]?.suit;
	return r ? T(e.hand, r).length > 0 ? n.suit === r ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must follow suit",
		code: "MUST_FOLLOW_SUIT"
	} : T(e.hand, e.trumpSuit).length > 0 ? w(n, e.trumpSuit) ? { allowed: !0 } : {
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
function Pe(e, t, n) {
	let r = e.filter((e) => !w(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => C(t) > C(e) ? t : e) : null;
}
function Fe(e, t) {
	let n = e.filter((e) => w(e, t));
	return n.length ? n.reduce((e, t) => C(t) > C(e) ? t : e) : null;
}
function Z(e, t) {
	return C(e) > C(t);
}
function Ie(e) {
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
	let n = Ie(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = Y(n, r);
			i.allowed ? e.push(r) : X(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? T(n.hand, r) : [], a = T(n.hand, n.trumpSuit), o = r ? Pe(n.trickPlays, r, n.trumpSuit) : null, s = Fe(n.trickPlays, n.trumpSuit), c;
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
function Le(e, t, n = {}) {
	let r = Ie(e), i = Y(r, t);
	if (X(n, r, t, i), !i.allowed) return {
		ok: !1,
		code: i.code ?? "MUST_BEAT_LED_SUIT",
		message: i.reason ?? "Illegal play"
	};
	if (r.isLeading || r.trickPlays.length === 0) return { ok: !0 };
	if (!Q(e, n).includes(t)) {
		let n = e.hand[t], r = e.leadSuit, i = r ? T(e.hand, r) : [], a = T(e.hand, e.trumpSuit), o = r ? Fe(e.trickPlays, e.trumpSuit) : null;
		return r && i.length && n.suit !== r ? {
			ok: !1,
			code: "MUST_FOLLOW_SUIT",
			message: "You must follow suit"
		} : r && !i.length && a.length && !w(n, e.trumpSuit) ? {
			ok: !1,
			code: "MUST_TRUMP",
			message: "You must play a trump when void in the led suit"
		} : o && w(n, e.trumpSuit) && !Z(n, o) ? {
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
	let r = e.filter((e) => w(e.card, n));
	if (r.length) return r.reduce((e, t) => C(t.card) > C(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => C(t.card) > C(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
var Re = 5;
function ze(e, t) {
	return e[(e.indexOf(t) + 1) % e.length];
}
function Be(e) {
	let t = M(e.playerId, e.privateHand, e.publicHand), n = (e.publicHand.playedCards?.length ?? 0) === 0 && (e.publicHand.currentTrick?.plays?.length ?? 0) === 0 && Object.values(e.publicHand.tricksByPlayer ?? {}).every((e) => (e ?? 0) === 0), r = Ve({
		publicHand: e.publicHand,
		playerHand: t,
		playerId: e.playerId,
		cardIndex: e.cardIndex,
		actionOrder: e.actionOrder,
		cinchEnabled: e.cinchEnabled
	}), i = t[e.cardIndex], a = r.publicHand;
	e.publicHand.trumpUpcard && (n || i && fe(i, e.publicHand)) && (a = {
		...a,
		trumpUpcard: null
	});
	let o = N(e.playerId, r.playerHand, a);
	return {
		...r,
		publicHand: a,
		privateHand: o,
		playerHand: o
	};
}
function Ve(e) {
	let { publicHand: t, playerId: n, cardIndex: r, actionOrder: i } = e;
	if (t.phase !== P.PLAY) throw Error("Not in trick-play phase");
	if (t.turnPlayerId !== n) throw Error("Not your turn");
	let a = t.currentTrick;
	if (!a) throw Error("No active trick");
	let { isLeading: o, leadSuit: s, trickIndex: c } = J(t), l = Le(Ne({
		hand: e.playerHand,
		publicHand: t
	}), r, {
		dealerSeat: t.dealerId ?? null,
		leaderSeat: a.leadPlayerId ?? null,
		currentTurnSeat: n,
		trickIndex: c
	});
	if (!l.ok) throw Error(l.message);
	let u = e.playerHand[r], d = ee(e.playerHand, r), f = {
		playerId: n,
		card: G(u)
	}, p = [...a.plays, f], m = o ? u.suit : s, h = t.participantIds;
	if (!(p.length >= h.length)) {
		let e = ze(i, n), r = {
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
	let g = $(p.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})), m, t.trumpSuit), _ = { ...t.tricksByPlayer };
	_[g] = (_[g] ?? 0) + 1;
	let v = [...t.playedCards, ...p.map((e) => ({
		...e,
		trickNumber: a.trickNumber
	}))];
	if (Object.values(_).reduce((e, t) => e + (t || 0), 0) >= Re) return {
		publicHand: {
			...t,
			tricksByPlayer: _,
			playedCards: v,
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
			tricksByPlayer: _,
			playedCards: v,
			leadSuit: null,
			turnPlayerId: g,
			currentTrick: {
				trickNumber: y,
				leadPlayerId: g,
				leadSuit: null,
				plays: []
			}
		},
		playerHand: d,
		trickResolved: !0,
		handComplete: !1
	};
}
function He(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: C(e),
		trump: w(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function Ue(e, t) {
	let n = Q(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => C(e[n]) > C(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => C(e[n]) < C(e[t]) ? n : t);
	let i = n.filter((n) => $([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => C(e[n]) < C(e[t]) ? n : t);
}
//#endregion
export { g as CARDS_PER_PLAYER, O as CardUniquenessError, B as HAND_DECISION_MS, be as HAND_DECISION_SECONDS, P as HAND_PHASE, Se as activateHandDecision, f as activePlayerOrder, z as advanceAfterDraw, R as allDrawsComplete, we as applyDecisionPass, Ce as applyDecisionPlay, Te as applyDecisionTimeout, F as applyDraw, ye as applyDrawFold, oe as applyDrawPile, Ve as applyPlayCard, _e as applyPlayerDraw, Be as applyPlayerPlayCard, ue as assertCardUniqueness, y as assignTrumpUpcard, He as botDrawDiscardIndices, Ue as botPlayCardIndex, V as buildHandDecision, Ne as buildPlayValidationState, Y as canPlayCard, x as cardKey, S as cardsEqual, me as cardsRemainingInHand, i as createDeck, re as createDrawPileFromStock, H as currentDecisionPlayer, _ as dealInitialHand, U as dealerMustPlayTrumpAce, Ee as decisionAsEnrollmentView, W as decisionPatchAfterStep, q as deserializeCards, he as displayHoleCardCount, l as drawCardsFromDeck, ae as drawFromPile, de as effectiveIndexDiscardsTrump, M as effectivePlayerHand, ne as emptyDrawPile, L as firstUnresolvedDrawTurn, Q as getLegalPlayIndices, w as isTrump, X as logPlayValidation, b as maxDrawDiscards, I as nextPlayerInOrder, J as normalizeTrickForPlay, p as openingLeaderId, se as pileFromPublicHand, fe as playedTrumpUpcard, d as playerOrderFromDealer, N as privateHandFromEffective, ce as publicHandWithPile, C as rankValue, u as remainingDeckCount, h as resolveActionOrder, m as resolveSeatRing, $ as resolveTrickWinner, ve as revealToDraw, G as serializeCard, K as serializeCards, De as serializeHandState, Oe as serializePagatRevealHand, s as shuffleDeck, c as shuffledDeckFromSeed, E as totalAvailableReplacements, j as trumpOnTable, A as trumpOwnerId, ge as trumpRevealMirroredInHolderHand, Le as validatePlayIndex };
