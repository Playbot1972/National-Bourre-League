//#region src/types.ts
var e = {
	spades: "♠",
	hearts: "♥",
	diamonds: "♦",
	clubs: "♣"
}, t = {
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
}, n = (e, t) => ({
	rank: e,
	suit: t
}), r = [
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
], i = [
	"spades",
	"hearts",
	"diamonds",
	"clubs"
];
function a() {
	let e = [];
	for (let t of i) for (let i of r) e.push(n(i, t));
	return e;
}
function o(e) {
	let t = e >>> 0;
	return () => {
		t += 1831565813;
		let e = Math.imul(t ^ t >>> 15, 1 | t);
		return e ^= e + Math.imul(e ^ e >>> 7, 61 | e), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function s() {
	if (typeof crypto < "u" && crypto.getRandomValues) {
		let e = new Uint32Array(1);
		return crypto.getRandomValues(e), e[0] ?? Date.now();
	}
	return (Date.now() ^ Math.random() * 4294967296) >>> 0;
}
function c(e, t) {
	let n = [...e], r = o(t ?? s());
	for (let e = n.length - 1; e > 0; --e) {
		let t = Math.floor(r() * (e + 1));
		[n[e], n[t]] = [n[t], n[e]];
	}
	return n;
}
//#endregion
//#region src/game/deckState.ts
function l(e) {
	return c(a(), e);
}
function u(e, t, n) {
	let r = e.slice(t, t + n);
	if (r.length < n) throw Error("Not enough cards left in deck");
	return {
		cards: r,
		deckNextIndex: t + n
	};
}
function d(e, t) {
	return Math.max(0, e.length - t);
}
//#endregion
//#region src/game/playerOrder.ts
function f(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function p(e, t, n) {
	let r = f(e, n), i = new Set(t);
	return r.filter((e) => i.has(e));
}
function m(e, t) {
	let n = e.indexOf(t);
	return n < 0 ? e[0] ?? null : e[(n + 1) % e.length] ?? null;
}
function h(e, t, n) {
	let r = p(e, t, n);
	return r.length ? e && r[0] === e ? r.find((t) => t !== e) ?? r[0] : r[0] : null;
}
var ee = h;
function g(e, t) {
	return e.seatedIds?.length ? e.seatedIds : t?.length ? t : e.participantIds ?? [];
}
function _(e, t) {
	let n = e.participantIds ?? [];
	if (!n.length) return [];
	let r = g(e, t), i = r.length > 0 ? r : t?.length ? t : n, a = p(e.dealerId, n, i);
	if (a.length > 0) return a;
	if (e.dealerId) return p(e.dealerId, n, n);
	if (e.actionOrder?.length) {
		let t = e.actionOrder.filter((e) => n.includes(e));
		if (t.length > 0) return t;
	}
	return n;
}
var v = 5;
//#endregion
//#region src/game/deal.ts
function y(e) {
	let t = [...new Set(e.participantIds.filter(Boolean))];
	if (t.length < 2) throw Error("Need at least two participants to deal");
	let n = p(e.dealerId, t, e.sortedPlayerIds);
	if (n.length < 2) throw Error("Need at least two seated participants in deal order");
	let r = h(e.dealerId, t, e.sortedPlayerIds), i = e.seed ?? Date.now(), o = c(a(), i), s = Object.fromEntries(n.map((e) => [e, []])), l = 0;
	for (let e = 0; e < 5; e += 1) for (let e of n) s[e].push(o[l]), l += 1;
	let u = te(e.dealerId, n), d = ne(u, s), f = Object.fromEntries(t.map((e) => [e, 0]));
	return {
		dealOrder: n,
		participantIds: t,
		privateHands: s,
		trumpHolderId: u,
		trumpUpcard: d,
		trumpSuit: d.suit,
		remainingDeck: o.slice(l),
		turnPlayerId: r ?? n[0],
		tricksByPlayer: f,
		deckSeed: i,
		deckNextIndex: l
	};
}
function te(e, t) {
	return e && t.includes(e) ? e : t[t.length - 1];
}
function ne(e, t) {
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
function C(e) {
	return t[e.rank];
}
function w(e, t) {
	return e.suit === t;
}
function T(e, t) {
	return e.filter((e) => e.suit === t);
}
function re(e, t) {
	return e.filter((e, n) => n !== t);
}
function ie(e, t) {
	let n = [...new Set(t)].sort((e, t) => t - e), r = [...e];
	for (let e of n) e < 0 || e >= r.length || r.splice(e, 1);
	return r;
}
//#endregion
//#region src/game/drawPile.ts
function ae() {
	return {
		stock: [],
		recyclePool: [],
		pendingDiscards: [],
		recycleShuffleCount: 0
	};
}
function oe(e) {
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
function se(e, t) {
	if (!e.recyclePool.length) return e;
	let n = (t ^ (e.recycleShuffleCount + 1) * 2654435769) >>> 0;
	return {
		stock: c(e.recyclePool, n),
		recyclePool: [],
		pendingDiscards: [...e.pendingDiscards],
		recycleShuffleCount: e.recycleShuffleCount + 1
	};
}
function ce(e, t, n) {
	if (t <= 0) return {
		pile: D(e),
		cards: []
	};
	let r = D(e), i = [];
	for (; i.length < t;) {
		if (r.stock.length === 0) {
			if (r.recyclePool.length === 0) throw Error(`Not enough cards in draw pile (${E(e)} available, tried to draw ${t})`);
			r = se(r, n);
		}
		let a = t - i.length, o = Math.min(a, r.stock.length);
		i.push(...r.stock.splice(0, o));
	}
	return {
		pile: r,
		cards: i
	};
}
function le(e) {
	let t = e.drawCount;
	if (t === 0) return {
		pile: D(e.pile),
		replacements: []
	};
	let { pile: n, cards: r } = ce({
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
function ue(e, t) {
	if (e.drawStock != null) return {
		stock: W(e.drawStock),
		recyclePool: W(e.recyclePool ?? []),
		pendingDiscards: W(e.pendingDrawDiscards ?? []),
		recycleShuffleCount: e.recycleShuffleCount ?? 0
	};
	let n = e.deckSeed, r = t ?? (n == null ? [] : l(n)), i = e.deckNextIndex ?? 0;
	return oe(r.slice(i));
}
function de(e, t) {
	return {
		...e,
		drawStock: U(t.stock),
		recyclePool: U(t.recyclePool),
		pendingDrawDiscards: U(t.pendingDiscards),
		recycleShuffleCount: t.recycleShuffleCount,
		remainingDeckCount: t.stock.length
	};
}
//#endregion
//#region src/game/invariants.ts
var fe = class extends Error {
	duplicates;
	constructor(e, t) {
		super(e), this.name = "CardUniquenessError", this.duplicates = t;
	}
};
function O(e, t, n) {
	let r = x(t);
	return e.get(r) ? [r] : (e.set(r, n), []);
}
function pe(e, t) {
	let n = [];
	for (let r = 0; r < t.stock.length; r += 1) n.push(...O(e, t.stock[r], `stock[${r}]`));
	for (let r = 0; r < t.recyclePool.length; r += 1) n.push(...O(e, t.recyclePool[r], `recycle[${r}]`));
	for (let r = 0; r < t.pendingDiscards.length; r += 1) n.push(...O(e, t.pendingDiscards[r], `pending[${r}]`));
	return n;
}
function me(e) {
	let t = /* @__PURE__ */ new Map(), n = [];
	if (e.drawPile) n.push(...pe(t, e.drawPile));
	else if (e.deck != null && e.deckNextIndex != null) for (let r = e.deckNextIndex; r < e.deck.length; r += 1) n.push(...O(t, e.deck[r], `deck[${r}]`));
	for (let [r, i] of Object.entries(e.privateHands)) for (let e = 0; e < i.length; e += 1) n.push(...O(t, i[e], `hand:${r}[${e}]`));
	if (e.trumpUpcard) {
		let r = x(e.trumpUpcard);
		((e.trumpHolderId ? e.privateHands[e.trumpHolderId] : void 0)?.some((e) => x(e) === r) ?? !1) || n.push(...O(t, e.trumpUpcard, "trumpUpcard"));
	}
	for (let r of e.currentTrick?.plays ?? []) n.push(...O(t, r.card, `trick:${r.playerId}`));
	for (let r of e.playedCards ?? []) n.push(...O(t, r.card, `played:t${r.trickNumber}`));
	if (n.length) {
		let e = [...new Set(n)];
		throw new fe(`Duplicate card(s) in game state: ${e.map((e) => `${e} (${t.get(e)})`).join(", ")}`, e);
	}
}
function k(e) {
	return e.trumpHolderId ?? e.dealerId ?? null;
}
function he(e) {
	return !!e.trumpUpcard;
}
function A(e, t, n) {
	let r = [...t], i = k(n), a = n.trumpUpcard;
	return !i || e !== i || !a ? r : r.some((e) => S(e, a)) ? r.filter((e) => !S(e, a)) : (r.push(a), r);
}
function j(e, t, n) {
	let r = k(n), i = n.trumpUpcard;
	return r && e === r && i && !t.some((e) => S(e, i)) ? [...t, i] : [...t];
}
function ge(e, t, n, r) {
	let i = k(r);
	return !i || e !== i || !r.trumpUpcard ? !1 : t.some((e) => {
		let t = n[e];
		return t && S(t, r.trumpUpcard);
	});
}
function _e(e, t) {
	return !!(t.trumpUpcard && S(e, t.trumpUpcard));
}
var ve = 5;
function ye(e, t) {
	let n = (e.playedCards ?? []).filter((e) => e.playerId === t).length, r = (e.currentTrick?.plays ?? []).filter((e) => e.playerId === t).length;
	return Math.max(0, ve - n - r);
}
function be(e, t, n = !1) {
	let r = ye(e, t);
	return n ? r : k(e) === t && he(e) ? Math.max(0, r - 1) : r;
}
function xe(e, t) {
	if (!e.trumpUpcard || !e.trumpHolderId) return !1;
	let n = t[e.trumpHolderId];
	return n?.length ? n.some((t) => S(t, e.trumpUpcard)) : !1;
}
function Se(e) {
	let t = (e.drawCompletedIds ?? []).length, n = (e.playedCards ?? []).length, r = (e.currentTrick?.plays ?? []).length, i = (e.foldedIds ?? []).length;
	return t === 0 && n === 0 && r === 0 && i === 0;
}
function M(e) {
	return !e.trumpUpcard || !Se(e) ? e : {
		...e,
		trumpUpcard: null
	};
}
//#endregion
//#region src/game/types.ts
var N = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
};
//#endregion
//#region src/game/draw.ts
function Ce(e) {
	let t = [...new Set(e.discardIndices)].sort((e, t) => e - t);
	if (t.some((t) => t < 0 || t >= e.hand.length)) throw Error("Invalid discard selection");
	if (t.length > e.maxDiscards) throw Error(`You may discard at most ${e.maxDiscards} cards`);
	if (t.length > 0 && t.length > e.maxDiscards) throw Error(`Draw limit is ${e.maxDiscards}`);
	let n = t.map((t) => e.hand[t]), r = ie(e.hand, t), i = t.length;
	if (i === 0) return {
		hand: r,
		pile: e.pile,
		discarded: 0
	};
	let a = E(e.pile);
	if (a < i) throw Error(`Not enough cards left in draw pile (${a} remaining, tried to draw ${i})`);
	let { pile: o, replacements: s } = le({
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
function P(e, t) {
	return m(e, t);
}
function F(e, t, n, r) {
	let i = _(e, r).filter((e) => t.includes(e)), a = g(e, r), o = h(e.dealerId, t, a) ?? i[0] ?? null;
	if (!o) return null;
	let s = i.indexOf(o), c = s >= 0 ? [...i.slice(s), ...i.slice(0, s)] : i;
	for (let e of c) if (!n.includes(e)) return e;
	return o;
}
function I(e, t) {
	let n = new Set(t);
	return e.every((e) => n.has(e));
}
function we(e) {
	let t = e.publicHand.deckSeed ?? 0, n = ue(e.publicHand, e.deck), r = A(e.playerId, e.privateHand, e.publicHand), i = Ce({
		hand: r,
		discardIndices: e.discardIndices,
		pile: n,
		deckSeed: t,
		maxDiscards: e.maxDiscards
	}), a = ge(e.playerId, e.discardIndices, r, e.publicHand), o = de(e.publicHand, i.pile);
	return o = a ? {
		...o,
		trumpUpcard: null
	} : M(o), {
		privateHand: j(e.playerId, i.hand, o),
		publicHand: o,
		pile: i.pile,
		discarded: i.discarded
	};
}
function Te(e, t) {
	let n = [...e.participantIds], r = _(e).filter((e) => n.includes(e)), i = Object.fromEntries(n.map((t) => [t, e.tricksByPlayer[t] ?? 0])), a = F(e, n, []);
	return {
		...e,
		phase: N.DRAW,
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
function Ee(e, t, n) {
	let r = M(e), i = r.participantIds.filter((e) => e !== n), a = [...r.foldedIds ?? [], n], o = t.filter((e) => i.includes(e)), s = [...new Set([...r.drawCompletedIds ?? [], n])], c = {
		...r,
		participantIds: i,
		actionOrder: o,
		drawCompletedIds: s,
		foldedIds: a,
		tricksByPlayer: Object.fromEntries(i.map((e) => [e, r.tricksByPlayer[e] ?? 0]))
	};
	if (i.length === 1) return {
		kind: "soloWin",
		winnerId: i[0],
		publicHand: {
			...c,
			handDecision: null
		}
	};
	if (i.length === 0) throw Error("No players remain in hand");
	if (I(i, s)) return {
		kind: "continue",
		publicHand: De(c, o, n)
	};
	let l = P(o, n), u = new Set(s), d = 0;
	for (; l && u.has(l) && d < o.length + 1;) l = P(o, l), d += 1;
	return {
		kind: "continue",
		publicHand: {
			...c,
			turnPlayerId: l
		}
	};
}
function De(e, t, n) {
	let r = [...new Set([...e.drawCompletedIds ?? [], n])], i = e.participantIds;
	if (!I(i, r)) {
		let a = F({
			...e,
			drawCompletedIds: r
		}, i, r) ?? P(t, n);
		return {
			...e,
			drawCompletedIds: r,
			turnPlayerId: a,
			pendingDrawDiscards: []
		};
	}
	let a = g(e), o = h(e.dealerId, i, a) ?? _(e)[0] ?? n;
	return {
		...e,
		phase: N.PLAY,
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
var Oe = 12, L = 12 * 1e3;
function R(e, t, n = !1, r = Date.now()) {
	return {
		active: n,
		orderedPlayerIds: f(t, e),
		currentIndex: 0,
		turnDeadlineMs: r + L,
		playingIds: [],
		passedIds: [],
		plannedDiscards: {}
	};
}
function z(e) {
	return e.orderedPlayerIds[e.currentIndex] ?? null;
}
function B(e, t, n) {
	return e === t && n?.rank === "A" && !!n?.suit;
}
function ke(e, t, n, r) {
	let i = _(e).filter((e) => t.includes(e)), a = b(t.length, r), o = t.filter((e) => (n[e] ?? 0) === 0), s = Object.fromEntries(t.map((t) => [t, e.tricksByPlayer[t] ?? 0]));
	return {
		...e,
		phase: N.DRAW,
		participantIds: [...t],
		actionOrder: i,
		maxDrawDiscards: a,
		tricksByPlayer: s,
		drawCompletedIds: o,
		turnPlayerId: F(e, t, o),
		handDecision: null,
		seatedIds: e.seatedIds
	};
}
function Ae(e, t = Date.now()) {
	if (e.phase === N.DECISION && e.handDecision?.active === !0) return e;
	let n = e.handDecision ?? R(e.seatedIds ?? e.participantIds, e.dealerId, !0, t);
	return {
		...e,
		phase: N.DECISION,
		handDecision: {
			...n,
			active: !0,
			turnDeadlineMs: t + L
		}
	};
}
function V(e, t, n, r, i, a, o = Date.now()) {
	let s = t.currentIndex + 1;
	if (s < t.orderedPlayerIds.length) return {
		kind: "continue",
		handDecision: {
			...t,
			playingIds: n,
			passedIds: r,
			plannedDiscards: i,
			currentIndex: s,
			turnDeadlineMs: o + L
		},
		publicHand: {
			...e,
			handDecision: {
				...t,
				playingIds: n,
				passedIds: r,
				plannedDiscards: i,
				currentIndex: s,
				turnDeadlineMs: o + L
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
		let t = R(e.participantIds, e.dealerId, !0, o);
		return {
			kind: "restart",
			handDecision: t,
			publicHand: {
				...e,
				phase: N.DECISION,
				handDecision: t
			}
		};
	}
	return {
		kind: "draw",
		handDecision: null,
		publicHand: ke(e, n, i, a?.dealingRule)
	};
}
function je(e, t, n, r, i, a = Date.now()) {
	if (z(t) !== n) throw Error("Not your turn to decide yet");
	let o = b(e.participantIds.length, i?.dealingRule), s = Math.max(0, Math.min(o, Math.floor(r))), c = [...t.playingIds, n], l = {
		...t.plannedDiscards,
		[n]: s
	};
	return V(e, t, c, t.passedIds, l, i, a);
}
function Me(e, t, n, r, i = Date.now()) {
	if (z(t) !== n) throw Error("Not your turn to pass yet");
	if (B(n, e.dealerId, e.trumpUpcard)) throw Error("Dealer must play when trump is an ace");
	if (t.passedIds.includes(n)) throw Error("Already passed this hand");
	let a = [...t.passedIds, n];
	return V(e, t, t.playingIds, a, t.plannedDiscards, r, i);
}
function Ne(e, t, n, r = Date.now()) {
	let i = z(t);
	if (!i) throw Error("No decision turn");
	if (B(i, e.dealerId, e.trumpUpcard)) return je(e, t, i, 0, n, r);
	let a = [...t.passedIds, i];
	return V(e, t, t.playingIds, a, t.plannedDiscards, n, r);
}
function Pe(e) {
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
function H(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function U(e) {
	return e.map(H);
}
function Fe(e, t) {
	let n = typeof t == "object" && t ? t.dealerId : t, r = typeof t == "object" && t ? t.actionOrder : e.dealOrder, i = typeof t == "object" && t && t.maxDrawDiscards != null ? t.maxDrawDiscards : b(e.participantIds.length), a = typeof t == "object" && t ? t.cinchEnabled === !0 : !1, o = typeof t == "object" && t && t.initialPhase ? t.initialPhase : N.DRAW, s = typeof t == "object" && t ? t.handDecision ?? null : null, c = {
		phase: o,
		participantIds: [...e.participantIds],
		seatedIds: typeof t == "object" && t && t.seatedIds?.length ? [...t.seatedIds] : [...e.participantIds],
		dealerId: n,
		trumpHolderId: e.trumpHolderId,
		trumpSuit: e.trumpSuit,
		trumpUpcard: H(e.trumpUpcard),
		remainingDeckCount: e.remainingDeck.length,
		currentTrick: null,
		leadSuit: null,
		playedCards: [],
		turnPlayerId: e.turnPlayerId,
		tricksByPlayer: { ...e.tricksByPlayer },
		deckSeed: e.deckSeed,
		deckNextIndex: e.deckNextIndex,
		drawStock: U(e.remainingDeck),
		recyclePool: [],
		pendingDrawDiscards: [],
		recycleShuffleCount: 0,
		actionOrder: [...r],
		drawCompletedIds: [],
		maxDrawDiscards: i,
		cinchEnabled: a,
		handDecision: s
	}, l = {};
	for (let [t, n] of Object.entries(e.privateHands)) l[t] = { cards: U(n) };
	return {
		publicHand: c,
		privateHandsByPlayer: l
	};
}
function Ie(e, t) {
	let n = R([...e.participantIds], t.dealerId, !1);
	return Fe(e, {
		...t,
		initialPhase: N.REVEAL,
		handDecision: n
	});
}
function W(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/playContext.ts
function Le(e, t) {
	let n = T(e, t);
	return n.length ? n.reduce((e, t) => C(t) >= C(e) ? t : e) : null;
}
function Re(e) {
	if (!e.cinchEnabled) return !1;
	let t = T(e.hand, e.trumpSuit);
	return t.filter((e) => C(e) >= 13).length >= 3 && t.length > 0;
}
function ze(e, t) {
	let n = Le(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function Be(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => W([e.card])[0]) : [];
}
function G(e) {
	let t = e.currentTrick ?? null, n = Be(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function Ve(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = G(e.publicHand);
	return {
		hand: e.hand,
		trumpSuit: e.publicHand.trumpSuit,
		leadSuit: r,
		trickPlays: t,
		isLeading: n,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	};
}
function K(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return Re(e) && !ze(n, e) ? {
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
function q(e, t, n, r) {
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
function He(e, t, n) {
	let r = e.filter((e) => !w(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => C(t) > C(e) ? t : e) : null;
}
function Ue(e, t) {
	let n = e.filter((e) => w(e, t));
	return n.length ? n.reduce((e, t) => C(t) > C(e) ? t : e) : null;
}
function J(e, t) {
	return C(e) > C(t);
}
function We(e) {
	return {
		hand: e.hand,
		trumpSuit: e.trumpSuit,
		leadSuit: e.leadSuit,
		trickPlays: e.trickPlays,
		isLeading: e.isLeading,
		cinchEnabled: e.cinchEnabled
	};
}
function Y(e, t = {}) {
	let n = We(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = K(n, r);
			i.allowed ? e.push(r) : q(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? T(n.hand, r) : [], a = T(n.hand, n.trumpSuit), o = r ? He(n.trickPlays, r, n.trumpSuit) : null, s = Ue(n.trickPlays, n.trumpSuit), c;
	if (i.length > 0) {
		if (c = i, !s && o) {
			let e = i.filter((e) => J(e, o));
			e.length && (c = e);
		}
	} else if (a.length > 0) {
		if (c = a, s) {
			let e = a.filter((e) => J(e, s));
			e.length && (c = e);
		}
	} else c = [...n.hand];
	let l = [];
	for (let e = 0; e < n.hand.length; e += 1) c.some((t) => t.rank === n.hand[e].rank && t.suit === n.hand[e].suit) && l.push(e);
	return l;
}
function Ge(e, t, n = {}) {
	let r = We(e), i = K(r, t);
	if (q(n, r, t, i), !i.allowed) return {
		ok: !1,
		code: i.code ?? "MUST_BEAT_LED_SUIT",
		message: i.reason ?? "Illegal play"
	};
	if (r.isLeading || r.trickPlays.length === 0) return { ok: !0 };
	if (!Y(e, n).includes(t)) {
		let n = e.hand[t], r = e.leadSuit, i = r ? T(e.hand, r) : [], a = T(e.hand, e.trumpSuit), o = r ? Ue(e.trickPlays, e.trumpSuit) : null;
		return r && i.length && n.suit !== r ? {
			ok: !1,
			code: "MUST_FOLLOW_SUIT",
			message: "You must follow suit"
		} : r && !i.length && a.length && !w(n, e.trumpSuit) ? {
			ok: !1,
			code: "MUST_TRUMP",
			message: "You must play a trump when void in the led suit"
		} : o && w(n, e.trumpSuit) && !J(n, o) ? {
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
function X(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => w(e.card, n));
	if (r.length) return r.reduce((e, t) => C(t.card) > C(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => C(t.card) > C(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/botDecisions.ts
function Ke(e, t) {
	let n = 0;
	for (let r of e) {
		let e = C(r);
		w(r, t) ? n += 2.5 + e / 13 : e >= 12 ? n += 1.8 : e >= 11 ? n += 1.2 : e >= 10 ? n += .8 : e >= 9 ? n += .4 : e >= 7 && (n += .15);
	}
	return n;
}
//#endregion
//#region src/game/botPlayFold.ts
function Z(e) {
	return C(e) >= 11;
}
function Q(e, t) {
	let n = Ke(e, t), r = e.filter((e) => w(e, t)).length, i = e.filter(Z).length;
	return n + r * .4 + i * .25;
}
function qe(t) {
	return t.map((t) => `${t.rank}${e[t.suit]}`).join(" ");
}
function Je(e, t) {
	if (e.length < 5 || e.some((e) => w(e, t) && e.rank === "A")) return !0;
	let n = e.filter(Z), r = Q(e, t);
	return n.length >= 2 ? r >= 1.8 : r >= 2.5;
}
//#endregion
//#region src/game/botDrawChoice.ts
function Ye(e, t, n) {
	let r = C(e);
	return w(e, t) ? e.rank === "A" || r >= 11 : !!(r >= 13 || r >= 12 && n);
}
function Xe(e, t) {
	let n = e.some((e) => w(e, t) && e.rank === "A"), r = e.filter(Z).length;
	if (n && r >= 3) return [];
	let i = Q(e, t) < 3;
	return e.filter((e) => !Ye(e, t, i)).sort((e, n) => {
		let r = w(e, t);
		return r === w(n, t) ? C(e) - C(n) : r ? 1 : -1;
	}).slice(0, 5);
}
function Ze(e, t) {
	let n = /* @__PURE__ */ new Set(), r = [];
	for (let i of e) {
		let e = t.findIndex((e, t) => !n.has(t) && S(e, i));
		e >= 0 && (n.add(e), r.push(e));
	}
	return r.sort((e, t) => e - t);
}
//#endregion
//#region src/game/botSearch.ts
function $(e, t, n) {
	try {
		console.log("[nbl-bot-ai] Bot %s | Hand: %s | Trump: %s | Strength: %d | Decision: %s | Discard: %d (%s)", n.botId ?? "?", qe(e), t, Math.round(n.strength * 100) / 100, n.play ? "PLAY" : "FOLD", n.discard.length, qe(n.discard));
	} catch {}
}
function Qe(e, t, n, r) {
	let i = Je(e, t);
	return $(e, t, {
		botId: r,
		play: i,
		discard: [],
		strength: Q(e, t)
	}), !i;
}
function $e(e, t, n) {
	let r = Je(e, t);
	return $(e, t, {
		botId: n,
		play: r,
		discard: [],
		strength: Q(e, t)
	}), !r;
}
function et(e, t, n, r = Infinity, i) {
	let a = Math.min(n, Math.max(0, r), 5), o = Xe(e, t).slice(0, a), s = Ze(o, e);
	return $(e, t, {
		botId: i,
		play: !0,
		discard: o,
		strength: Q(e, t)
	}), s;
}
//#endregion
//#region src/game/play.ts
var tt = 5;
function nt(e) {
	let t = A(e.playerId, e.privateHand, e.publicHand), n = (e.publicHand.playedCards?.length ?? 0) === 0 && (e.publicHand.currentTrick?.plays?.length ?? 0) === 0 && Object.values(e.publicHand.tricksByPlayer ?? {}).every((e) => (e ?? 0) === 0), r = rt({
		publicHand: e.publicHand,
		playerHand: t,
		playerId: e.playerId,
		cardIndex: e.cardIndex,
		actionOrder: e.actionOrder,
		cinchEnabled: e.cinchEnabled
	}), i = t[e.cardIndex], a = r.publicHand;
	a = e.publicHand.trumpUpcard && (n || i && _e(i, e.publicHand)) ? {
		...a,
		trumpUpcard: null
	} : M(a);
	let o = j(e.playerId, r.playerHand, a);
	return {
		...r,
		publicHand: a,
		privateHand: o,
		playerHand: o
	};
}
function rt(e) {
	let { publicHand: t, playerId: n, cardIndex: r } = e, i = e.actionOrder.length > 0 ? e.actionOrder : _(t);
	if (t.phase !== N.PLAY) throw Error("Not in trick-play phase");
	if (t.turnPlayerId !== n) throw Error("Not your turn");
	let a = t.currentTrick;
	if (!a) throw Error("No active trick");
	let { isLeading: o, leadSuit: s, trickIndex: c } = G(t), l = Ge(Ve({
		hand: e.playerHand,
		publicHand: t
	}), r, {
		dealerSeat: t.dealerId ?? null,
		leaderSeat: a.leadPlayerId ?? null,
		currentTurnSeat: n,
		trickIndex: c
	});
	if (!l.ok) throw Error(l.message);
	let u = e.playerHand[r], d = re(e.playerHand, r), f = {
		playerId: n,
		card: H(u)
	}, p = [...a.plays, f], h = o ? u.suit : s, ee = t.participantIds;
	if (!(p.length >= ee.length)) {
		let e = m(i, n), r = {
			...a,
			leadSuit: h,
			plays: p
		};
		return {
			publicHand: {
				...t,
				actionOrder: i,
				leadSuit: h,
				currentTrick: r,
				turnPlayerId: e
			},
			playerHand: d,
			trickResolved: !1,
			handComplete: !1
		};
	}
	let g = X(p.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})), h, t.trumpSuit), v = { ...t.tricksByPlayer };
	v[g] = (v[g] ?? 0) + 1;
	let y = [...t.playedCards, ...p.map((e) => ({
		...e,
		trickNumber: a.trickNumber
	}))];
	if (Object.values(v).reduce((e, t) => e + (t || 0), 0) >= tt) return {
		publicHand: {
			...t,
			tricksByPlayer: v,
			playedCards: y,
			currentTrick: null,
			leadSuit: null,
			turnPlayerId: null
		},
		playerHand: d,
		trickResolved: !0,
		handComplete: !0
	};
	let te = a.trickNumber + 1;
	return {
		publicHand: {
			...t,
			actionOrder: i,
			tricksByPlayer: v,
			playedCards: y,
			leadSuit: null,
			turnPlayerId: g,
			currentTrick: {
				trickNumber: te,
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
function it(e, t) {
	let n = Y(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => C(e[n]) > C(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => C(e[n]) < C(e[t]) ? n : t);
	let i = n.filter((n) => X([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => C(e[n]) < C(e[t]) ? n : t);
}
//#endregion
export { v as CARDS_PER_PLAYER, fe as CardUniquenessError, L as HAND_DECISION_MS, Oe as HAND_DECISION_SECONDS, N as HAND_PHASE, Ae as activateHandDecision, p as activePlayerOrder, De as advanceAfterDraw, I as allDrawsComplete, Me as applyDecisionPass, je as applyDecisionPlay, Ne as applyDecisionTimeout, Ce as applyDraw, Ee as applyDrawFold, le as applyDrawPile, rt as applyPlayCard, we as applyPlayerDraw, nt as applyPlayerPlayCard, me as assertCardUniqueness, ne as assignTrumpUpcard, et as botDrawDiscardIndices, it as botPlayCardIndex, $e as botShouldFoldDraw, Qe as botShouldPassDecision, R as buildHandDecision, Ve as buildPlayValidationState, K as canPlayCard, x as cardKey, S as cardsEqual, ye as cardsRemainingInHand, M as clearTrumpUpcardIfFirstAction, a as createDeck, oe as createDrawPileFromStock, z as currentDecisionPlayer, y as dealInitialHand, B as dealerMustPlayTrumpAce, Pe as decisionAsEnrollmentView, V as decisionPatchAfterStep, W as deserializeCards, be as displayHoleCardCount, u as drawCardsFromDeck, ce as drawFromPile, ge as effectiveIndexDiscardsTrump, A as effectivePlayerHand, ae as emptyDrawPile, Ke as estimateHandStrength, ee as firstLeaderFromDealerLeft, F as firstUnresolvedDrawTurn, Y as getLegalPlayIndices, Se as isBeforeFirstHandAction, w as isTrump, q as logPlayValidation, b as maxDrawDiscards, m as nextActivePlayerClockwise, P as nextPlayerInOrder, G as normalizeTrickForPlay, h as openingLeaderId, ue as pileFromPublicHand, _e as playedTrumpUpcard, f as playerOrderFromDealer, j as privateHandFromEffective, de as publicHandWithPile, C as rankValue, d as remainingDeckCount, _ as resolveActionOrder, g as resolveSeatRing, X as resolveTrickWinner, Te as revealToDraw, H as serializeCard, U as serializeCards, Fe as serializeHandState, Ie as serializePagatRevealHand, c as shuffleDeck, l as shuffledDeckFromSeed, E as totalAvailableReplacements, he as trumpOnTable, k as trumpOwnerId, xe as trumpRevealMirroredInHolderHand, Ge as validatePlayIndex };
