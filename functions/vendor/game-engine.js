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
function p(e, t) {
	let n = e.indexOf(t);
	return n < 0 ? e[0] ?? null : e[(n + 1) % e.length] ?? null;
}
function m(e, t, n) {
	let r = f(e, t, n);
	return r.length ? e && r[0] === e ? r.find((t) => t !== e) ?? r[0] : r[0] : null;
}
var h = m;
function g(e, t) {
	return e.seatedIds?.length ? e.seatedIds : t?.length ? t : e.participantIds ?? [];
}
function _(e, t) {
	let n = e.participantIds ?? [];
	if (!n.length) return [];
	let r = g(e, t), i = r.length > 0 ? r : t?.length ? t : n, a = f(e.dealerId, n, i);
	if (a.length > 0) return a;
	if (e.dealerId) return f(e.dealerId, n, n);
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
	let n = f(e.dealerId, t, e.sortedPlayerIds);
	if (n.length < 2) throw Error("Need at least two seated participants in deal order");
	let r = m(e.dealerId, t, e.sortedPlayerIds), a = e.seed ?? Date.now(), o = s(i(), a), c = Object.fromEntries(n.map((e) => [e, []])), l = 0;
	for (let e = 0; e < 5; e += 1) for (let e of n) c[e].push(o[l]), l += 1;
	let u = ee(e.dealerId, n), d = te(u, c), p = Object.fromEntries(t.map((e) => [e, 0]));
	return {
		dealOrder: n,
		participantIds: t,
		privateHands: c,
		trumpHolderId: u,
		trumpUpcard: d,
		trumpSuit: d.suit,
		remainingDeck: o.slice(l),
		turnPlayerId: r ?? n[0],
		tricksByPlayer: p,
		deckSeed: a,
		deckNextIndex: l
	};
}
function ee(e, t) {
	return e && t.includes(e) ? e : t[t.length - 1];
}
function te(e, t) {
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
function ne(e, t) {
	return e.filter((e, n) => n !== t);
}
function re(e, t) {
	let n = [...new Set(t)].sort((e, t) => t - e), r = [...e];
	for (let e of n) e < 0 || e >= r.length || r.splice(e, 1);
	return r;
}
//#endregion
//#region src/game/drawPile.ts
function ie() {
	return {
		stock: [],
		recyclePool: [],
		pendingDiscards: [],
		recycleShuffleCount: 0
	};
}
function ae(e) {
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
function oe(e, t) {
	if (!e.recyclePool.length) return e;
	let n = (t ^ (e.recycleShuffleCount + 1) * 2654435769) >>> 0;
	return {
		stock: s(e.recyclePool, n),
		recyclePool: [],
		pendingDiscards: [...e.pendingDiscards],
		recycleShuffleCount: e.recycleShuffleCount + 1
	};
}
function se(e, t, n) {
	if (t <= 0) return {
		pile: D(e),
		cards: []
	};
	let r = D(e), i = [];
	for (; i.length < t;) {
		if (r.stock.length === 0) {
			if (r.recyclePool.length === 0) throw Error(`Not enough cards in draw pile (${E(e)} available, tried to draw ${t})`);
			r = oe(r, n);
		}
		let a = t - i.length, o = Math.min(a, r.stock.length);
		i.push(...r.stock.splice(0, o));
	}
	return {
		pile: r,
		cards: i
	};
}
function ce(e) {
	let t = e.drawCount;
	if (t === 0) return {
		pile: D(e.pile),
		replacements: []
	};
	let { pile: n, cards: r } = se({
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
function O(e, t) {
	if (e.drawStock != null) return {
		stock: G(e.drawStock),
		recyclePool: G(e.recyclePool ?? []),
		pendingDiscards: G(e.pendingDrawDiscards ?? []),
		recycleShuffleCount: e.recycleShuffleCount ?? 0
	};
	let n = e.deckSeed, r = t ?? (n == null ? [] : c(n)), i = e.deckNextIndex ?? 0;
	return ae(r.slice(i));
}
function le(e, t) {
	return {
		...e,
		drawStock: W(t.stock),
		recyclePool: W(t.recyclePool),
		pendingDrawDiscards: W(t.pendingDiscards),
		recycleShuffleCount: t.recycleShuffleCount,
		remainingDeckCount: t.stock.length
	};
}
//#endregion
//#region src/game/invariants.ts
var ue = class extends Error {
	duplicates;
	constructor(e, t) {
		super(e), this.name = "CardUniquenessError", this.duplicates = t;
	}
};
function k(e, t, n) {
	let r = x(t);
	return e.get(r) ? [r] : (e.set(r, n), []);
}
function de(e, t) {
	let n = [];
	for (let r = 0; r < t.stock.length; r += 1) n.push(...k(e, t.stock[r], `stock[${r}]`));
	for (let r = 0; r < t.recyclePool.length; r += 1) n.push(...k(e, t.recyclePool[r], `recycle[${r}]`));
	for (let r = 0; r < t.pendingDiscards.length; r += 1) n.push(...k(e, t.pendingDiscards[r], `pending[${r}]`));
	return n;
}
function fe(e) {
	let t = /* @__PURE__ */ new Map(), n = [];
	if (e.drawPile) n.push(...de(t, e.drawPile));
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
		throw new ue(`Duplicate card(s) in game state: ${e.map((e) => `${e} (${t.get(e)})`).join(", ")}`, e);
	}
}
function A(e) {
	return e.trumpHolderId ?? e.dealerId ?? null;
}
function pe(e) {
	return !!e.trumpUpcard;
}
function j(e, t, n) {
	let r = [...t], i = A(n), a = n.trumpUpcard;
	return !i || e !== i || !a ? r : r.some((e) => S(e, a)) ? r.filter((e) => !S(e, a)) : (r.push(a), r);
}
function me(e, t, n) {
	let r = A(n), i = n.trumpUpcard;
	return r && e === r && i && !t.some((e) => S(e, i)) ? [...t, i] : [...t];
}
function he(e, t, n, r) {
	let i = A(r);
	return !i || e !== i || !r.trumpUpcard ? !1 : t.some((e) => {
		let t = n[e];
		return t && S(t, r.trumpUpcard);
	});
}
function ge(e, t) {
	return !!(t.trumpUpcard && S(e, t.trumpUpcard));
}
var _e = 5;
function ve(e, t) {
	let n = (e.playedCards ?? []).filter((e) => e.playerId === t).length, r = (e.currentTrick?.plays ?? []).filter((e) => e.playerId === t).length;
	return Math.max(0, _e - n - r);
}
function ye(e, t, n = !1) {
	let r = ve(e, t);
	return n ? r : A(e) === t && pe(e) ? Math.max(0, r - 1) : r;
}
function be(e, t) {
	if (!e.trumpUpcard || !e.trumpHolderId) return !1;
	let n = t[e.trumpHolderId];
	return n?.length ? n.some((t) => S(t, e.trumpUpcard)) : !1;
}
function xe(e) {
	let t = (e.drawCompletedIds ?? []).length, n = (e.playedCards ?? []).length, r = (e.currentTrick?.plays ?? []).length, i = (e.foldedIds ?? []).length;
	return t === 0 && n === 0 && r === 0 && i === 0;
}
function M(e) {
	return !e.trumpUpcard || !xe(e) ? e : {
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
function Se(e) {
	let t = [...new Set(e.discardIndices)].sort((e, t) => e - t);
	if (t.some((t) => t < 0 || t >= e.hand.length)) throw Error("Invalid discard selection");
	if (t.length > e.maxDiscards) throw Error(`You may discard at most ${e.maxDiscards} cards`);
	if (t.length > 0 && t.length > e.maxDiscards) throw Error(`Draw limit is ${e.maxDiscards}`);
	let n = t.map((t) => e.hand[t]), r = re(e.hand, t), i = t.length;
	if (i === 0) return {
		hand: r,
		pile: e.pile,
		discarded: 0
	};
	let a = E(e.pile);
	if (a < i) throw Error(`Not enough cards left in draw pile (${a} remaining, tried to draw ${i})`);
	let { pile: o, replacements: s } = ce({
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
	return p(e, t);
}
function F(e, t, n, r) {
	let i = _(e, r).filter((e) => t.includes(e)), a = g(e, r), o = m(e.dealerId, t, a) ?? i[0] ?? null;
	if (!o) return null;
	let s = i.indexOf(o), c = s >= 0 ? [...i.slice(s), ...i.slice(0, s)] : i;
	for (let e of c) if (!n.includes(e)) return e;
	return o;
}
function I(e, t) {
	let n = new Set(t);
	return e.every((e) => n.has(e));
}
function L(e) {
	let t = e.publicHand.deckSeed ?? 0, n = O(e.publicHand, e.deck), r = j(e.playerId, e.privateHand, e.publicHand), i = Se({
		hand: r,
		discardIndices: e.discardIndices,
		pile: n,
		deckSeed: t,
		maxDiscards: e.maxDiscards
	}), a = he(e.playerId, e.discardIndices, r, e.publicHand), o = le(e.publicHand, i.pile);
	return o = a ? {
		...o,
		trumpUpcard: null
	} : M(o), {
		privateHand: me(e.playerId, i.hand, o),
		publicHand: o,
		pile: i.pile,
		discarded: i.discarded
	};
}
function Ce(e, t) {
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
function we(e, t, n) {
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
		publicHand: R(c, o, n)
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
function R(e, t, n) {
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
	let a = g(e), o = m(e.dealerId, i, a) ?? _(e)[0] ?? n;
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
var Te = 12, z = 12 * 1e3;
function B(e, t, n = !1, r = Date.now()) {
	return {
		active: n,
		orderedPlayerIds: d(t, e),
		currentIndex: 0,
		turnDeadlineMs: r + z,
		playingIds: [],
		passedIds: [],
		plannedDiscards: {}
	};
}
function V(e) {
	return e.orderedPlayerIds[e.currentIndex] ?? null;
}
function Ee(e, t, n) {
	return e === t && n?.rank === "A" && !!n?.suit;
}
function De(e, t, n, r) {
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
function Oe(e, t = Date.now()) {
	if (e.phase === N.DECISION && e.handDecision?.active === !0) return e;
	let n = e.handDecision ?? B(e.seatedIds ?? e.participantIds, e.dealerId, !0, t);
	return {
		...e,
		phase: N.DECISION,
		handDecision: {
			...n,
			active: !0,
			turnDeadlineMs: t + z
		}
	};
}
function H(e, t, n, r, i, a, o = Date.now()) {
	let s = t.currentIndex + 1;
	if (s < t.orderedPlayerIds.length) return {
		kind: "continue",
		handDecision: {
			...t,
			playingIds: n,
			passedIds: r,
			plannedDiscards: i,
			currentIndex: s,
			turnDeadlineMs: o + z
		},
		publicHand: {
			...e,
			handDecision: {
				...t,
				playingIds: n,
				passedIds: r,
				plannedDiscards: i,
				currentIndex: s,
				turnDeadlineMs: o + z
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
		let t = B(e.participantIds, e.dealerId, !0, o);
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
		publicHand: De(e, n, i, a?.dealingRule)
	};
}
function ke(e, t, n, r, i, a = Date.now()) {
	if (V(t) !== n) throw Error("Not your turn to decide yet");
	let o = b(e.participantIds.length, i?.dealingRule), s = Math.max(0, Math.min(o, Math.floor(r))), c = [...t.playingIds, n], l = {
		...t.plannedDiscards,
		[n]: s
	};
	return H(e, t, c, t.passedIds, l, i, a);
}
function Ae(e, t, n, r, i = Date.now()) {
	if (V(t) !== n) throw Error("Not your turn to pass yet");
	if (Ee(n, e.dealerId, e.trumpUpcard)) throw Error("Dealer must play when trump is an ace");
	if (t.passedIds.includes(n)) throw Error("Already passed this hand");
	let a = [...t.passedIds, n];
	return H(e, t, t.playingIds, a, t.plannedDiscards, r, i);
}
function je(e, t, n, r = Date.now()) {
	let i = V(t);
	if (!i) throw Error("No decision turn");
	if (Ee(i, e.dealerId, e.trumpUpcard)) return ke(e, t, i, 0, n, r);
	let a = [...t.passedIds, i];
	return H(e, t, t.playingIds, a, t.plannedDiscards, n, r);
}
function Me(e) {
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
function U(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function W(e) {
	return e.map(U);
}
function Ne(e, t) {
	let n = typeof t == "object" && t ? t.dealerId : t, r = typeof t == "object" && t ? t.actionOrder : e.dealOrder, i = typeof t == "object" && t && t.maxDrawDiscards != null ? t.maxDrawDiscards : b(e.participantIds.length), a = typeof t == "object" && t ? t.cinchEnabled === !0 : !1, o = typeof t == "object" && t && t.initialPhase ? t.initialPhase : N.DRAW, s = typeof t == "object" && t ? t.handDecision ?? null : null, c = {
		phase: o,
		participantIds: [...e.participantIds],
		seatedIds: typeof t == "object" && t && t.seatedIds?.length ? [...t.seatedIds] : [...e.participantIds],
		dealerId: n,
		trumpHolderId: e.trumpHolderId,
		trumpSuit: e.trumpSuit,
		trumpUpcard: U(e.trumpUpcard),
		remainingDeckCount: e.remainingDeck.length,
		currentTrick: null,
		leadSuit: null,
		playedCards: [],
		turnPlayerId: e.turnPlayerId,
		tricksByPlayer: { ...e.tricksByPlayer },
		deckSeed: e.deckSeed,
		deckNextIndex: e.deckNextIndex,
		drawStock: W(e.remainingDeck),
		recyclePool: [],
		pendingDrawDiscards: [],
		recycleShuffleCount: 0,
		actionOrder: [...r],
		drawCompletedIds: [],
		maxDrawDiscards: i,
		cinchEnabled: a,
		handDecision: s
	}, l = {};
	for (let [t, n] of Object.entries(e.privateHands)) l[t] = { cards: W(n) };
	return {
		publicHand: c,
		privateHandsByPlayer: l
	};
}
function Pe(e, t) {
	let n = B([...e.participantIds], t.dealerId, !1);
	return Ne(e, {
		...t,
		initialPhase: N.REVEAL,
		handDecision: n
	});
}
function G(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/playContext.ts
function Fe(e, t) {
	let n = T(e, t);
	return n.length ? n.reduce((e, t) => C(t) >= C(e) ? t : e) : null;
}
function Ie(e) {
	if (!e.cinchEnabled) return !1;
	let t = T(e.hand, e.trumpSuit);
	return t.filter((e) => C(e) >= 13).length >= 3 && t.length > 0;
}
function Le(e, t) {
	let n = Fe(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function Re(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => G([e.card])[0]) : [];
}
function ze(e) {
	let t = e.currentTrick ?? null, n = Re(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function K(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = ze(e.publicHand);
	return {
		hand: e.hand,
		trumpSuit: e.publicHand.trumpSuit,
		leadSuit: r,
		trickPlays: t,
		isLeading: n,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	};
}
function Be(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return Ie(e) && !Le(n, e) ? {
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
function Ve(e, t, n) {
	let r = e.filter((e) => !w(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => C(t) > C(e) ? t : e) : null;
}
function He(e, t) {
	let n = e.filter((e) => w(e, t));
	return n.length ? n.reduce((e, t) => C(t) > C(e) ? t : e) : null;
}
function Ue(e, t) {
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
function J(e, t = {}) {
	let n = We(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = Be(n, r);
			i.allowed ? e.push(r) : q(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? T(n.hand, r) : [], a = T(n.hand, n.trumpSuit), o = r ? Ve(n.trickPlays, r, n.trumpSuit) : null, s = He(n.trickPlays, n.trumpSuit), c;
	if (i.length > 0) {
		if (c = i, !s && o) {
			let e = i.filter((e) => Ue(e, o));
			e.length && (c = e);
		}
	} else if (a.length > 0) {
		if (c = a, s) {
			let e = a.filter((e) => Ue(e, s));
			e.length && (c = e);
		}
	} else c = [...n.hand];
	let l = [];
	for (let e = 0; e < n.hand.length; e += 1) c.some((t) => t.rank === n.hand[e].rank && t.suit === n.hand[e].suit) && l.push(e);
	return l;
}
function Ge(e, t, n = {}) {
	let r = We(e), i = Be(r, t);
	if (q(n, r, t, i), !i.allowed) return {
		ok: !1,
		code: i.code ?? "MUST_BEAT_LED_SUIT",
		message: i.reason ?? "Illegal play"
	};
	if (r.isLeading || r.trickPlays.length === 0) return { ok: !0 };
	if (!J(e, n).includes(t)) {
		let n = e.hand[t], r = e.leadSuit, i = r ? T(e.hand, r) : [], a = T(e.hand, e.trumpSuit), o = r ? He(e.trickPlays, e.trumpSuit) : null;
		return r && i.length && n.suit !== r ? {
			ok: !1,
			code: "MUST_FOLLOW_SUIT",
			message: "You must follow suit"
		} : r && !i.length && a.length && !w(n, e.trumpSuit) ? {
			ok: !1,
			code: "MUST_TRUMP",
			message: "You must play a trump when void in the led suit"
		} : o && w(n, e.trumpSuit) && !Ue(n, o) ? {
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
function Ke(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => w(e.card, n));
	if (r.length) return r.reduce((e, t) => C(t.card) > C(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => C(t.card) > C(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
var qe = 5;
function Je(e) {
	let t = j(e.playerId, e.privateHand, e.publicHand), n = (e.publicHand.playedCards?.length ?? 0) === 0 && (e.publicHand.currentTrick?.plays?.length ?? 0) === 0 && Object.values(e.publicHand.tricksByPlayer ?? {}).every((e) => (e ?? 0) === 0), r = Ye({
		publicHand: e.publicHand,
		playerHand: t,
		playerId: e.playerId,
		cardIndex: e.cardIndex,
		actionOrder: e.actionOrder,
		cinchEnabled: e.cinchEnabled
	}), i = t[e.cardIndex], a = r.publicHand;
	a = e.publicHand.trumpUpcard && (n || i && ge(i, e.publicHand)) ? {
		...a,
		trumpUpcard: null
	} : M(a);
	let o = me(e.playerId, r.playerHand, a);
	return {
		...r,
		publicHand: a,
		privateHand: o,
		playerHand: o
	};
}
function Ye(e) {
	let { publicHand: t, playerId: n, cardIndex: r } = e, i = e.actionOrder.length > 0 ? e.actionOrder : _(t);
	if (t.phase !== N.PLAY) throw Error("Not in trick-play phase");
	if (t.turnPlayerId !== n) throw Error("Not your turn");
	let a = t.currentTrick;
	if (!a) throw Error("No active trick");
	let { isLeading: o, leadSuit: s, trickIndex: c } = ze(t), l = Ge(K({
		hand: e.playerHand,
		publicHand: t
	}), r, {
		dealerSeat: t.dealerId ?? null,
		leaderSeat: a.leadPlayerId ?? null,
		currentTurnSeat: n,
		trickIndex: c
	});
	if (!l.ok) throw Error(l.message);
	let u = e.playerHand[r], d = ne(e.playerHand, r), f = {
		playerId: n,
		card: U(u)
	}, m = [...a.plays, f], h = o ? u.suit : s, g = t.participantIds;
	if (!(m.length >= g.length)) {
		let e = p(i, n), r = {
			...a,
			leadSuit: h,
			plays: m
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
	let v = Ke(m.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})), h, t.trumpSuit), y = { ...t.tricksByPlayer };
	y[v] = (y[v] ?? 0) + 1;
	let ee = [...t.playedCards, ...m.map((e) => ({
		...e,
		trickNumber: a.trickNumber
	}))];
	if (Object.values(y).reduce((e, t) => e + (t || 0), 0) >= qe) return {
		publicHand: {
			...t,
			tricksByPlayer: y,
			playedCards: ee,
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
			tricksByPlayer: y,
			playedCards: ee,
			leadSuit: null,
			turnPlayerId: v,
			currentTrick: {
				trickNumber: te,
				leadPlayerId: v,
				leadSuit: null,
				plays: []
			}
		},
		playerHand: d,
		trickResolved: !0,
		handComplete: !1
	};
}
//#endregion
//#region src/game/botHeuristic.ts
function Y(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: C(e),
		trump: w(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function Xe(e, t) {
	let n = J(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => C(e[n]) > C(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => C(e[n]) < C(e[t]) ? n : t);
	let i = n.filter((n) => Ke([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => C(e[n]) < C(e[t]) ? n : t);
}
function Ze(e, t, n) {
	let r = J(t);
	return r.length ? r[Math.floor(n() * r.length)] : 0;
}
function Qe(e, t, n, r) {
	let i = Math.min(t, Math.max(0, n)), a = [[]];
	for (let t = 1; t <= i; t += 1) {
		let n = [], r = (t, i) => {
			if (i === 0) {
				a.push([...n]);
				return;
			}
			for (let a = t; a <= e.length - i; a += 1) n.push(a), r(a + 1, i - 1), n.pop();
		};
		r(0, t);
	}
	return a[Math.floor(r() * a.length)] ?? [];
}
//#endregion
//#region src/game/botRollout.ts
var $e = 12;
function et(e, t, n, r, i) {
	let a = { ...i ?? {} };
	return a[e] = t, {
		playerId: e,
		publicHand: n,
		privateHands: a,
		deck: r,
		seed: n.deckSeed ?? void 0
	};
}
function X(e) {
	return {
		publicHand: structuredClone(e.publicHand),
		privateHands: Object.fromEntries(Object.entries(e.privateHands).map(([e, t]) => [e, [...t]])),
		deck: [...e.deck]
	};
}
function tt(e, t) {
	return e.publicHand.tricksByPlayer[t] ?? 0;
}
function nt(e) {
	let t = e >>> 0;
	return () => {
		t += 1831565813;
		let e = Math.imul(t ^ t >>> 15, 1 | t);
		return e ^= e + Math.imul(e ^ e >>> 7, 61 | e), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function rt(e) {
	let t = 2166136261;
	for (let n of e) {
		let e = String(n ?? "");
		for (let n = 0; n < e.length; n += 1) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	}
	return t >>> 0;
}
function it(e, t) {
	return A(t) === e && t.trumpUpcard ? 4 : 5;
}
function at(e, t) {
	let n = /* @__PURE__ */ new Set();
	for (let e of Object.values(t)) for (let t of e) n.add(x(t));
	return e.trumpUpcard && n.add(x(e.trumpUpcard)), n;
}
function ot(e, t) {
	let { playerId: n, publicHand: r, privateHands: a = {} } = e, o = r.participantIds, s = {};
	for (let e of o) a[e]?.length && (s[e] = [...a[e]]);
	let c = o.filter((e) => !s[e]?.length);
	if (!c.length) return s;
	let l = at(r, s), u = i().filter((e) => !l.has(x(e))), d = nt(rt([
		e.seed ?? r.deckSeed,
		n,
		t,
		"deal"
	]));
	for (let e = u.length - 1; e > 0; --e) {
		let t = Math.floor(d() * (e + 1));
		[u[e], u[t]] = [u[t], u[e]];
	}
	let f = 0;
	for (let e of c) {
		let t = it(e, r);
		s[e] = u.slice(f, f + t), f += t;
	}
	return s;
}
function st(e, t = 0) {
	let n = e.deck ?? c(e.publicHand.deckSeed ?? e.seed ?? 42);
	return {
		publicHand: structuredClone(e.publicHand),
		privateHands: ot(e, t),
		deck: [...n]
	};
}
function ct(e, t, n, r) {
	return e === t || n === "heuristic" ? "heuristic" : n === "randomLegal" || r % 2 == 0 ? "randomLegal" : "heuristic";
}
function lt(e, t) {
	let n = j(t, e.privateHands[t], e.publicHand), r = E(O(e.publicHand, e.deck)), i = e.publicHand.maxDrawDiscards ?? 5, a = e.publicHand.trumpSuit;
	if (Math.min(i, Math.max(0, r)) <= 0 || !n.length) return [];
	let o = Y(n, a, i, r);
	return !o.length || o.length >= n.length ? [] : o.slice(0, Math.min(2, o.length));
}
function ut(e, t, n, r, i, a) {
	if (i) return i;
	if (a && t === a) return lt(e, a);
	let o = j(t, e.privateHands[t], e.publicHand), s = E(O(e.publicHand, e.deck)), c = e.publicHand.maxDrawDiscards ?? 5;
	return n === "randomLegal" ? Qe(o, c, s, r) : Y(o, e.publicHand.trumpSuit, c, s);
}
function dt(e, t, n, r, i) {
	if (i != null) return i;
	let a = j(t, e.privateHands[t], e.publicHand), o = K({
		hand: a,
		publicHand: e.publicHand
	});
	return n === "randomLegal" ? Ze(a, o, r) : Xe(a, o);
}
function ft(e, t) {
	let { heroId: n, opponentPolicy: r = "mixed", rolloutIndex: i = 0, heroDrawDiscard: a, heroPlayIndex: o } = t, s = nt(rt([
		e.publicHand.deckSeed,
		n,
		i,
		"play"
	])), c = X(e), l = 0;
	for (; c.publicHand.phase === N.DRAW && l < 40;) {
		l += 1;
		let e = c.publicHand.turnPlayerId;
		if (!e) break;
		let t = ct(e, n, r, i), o = ut(c, e, t, s, e === n ? a : void 0, n), u = c.publicHand.maxDrawDiscards ?? 5, d = L({
			playerId: e,
			privateHand: c.privateHands[e],
			publicHand: c.publicHand,
			discardIndices: o,
			deck: c.deck,
			maxDiscards: u
		}), f = c.publicHand.actionOrder ?? c.publicHand.participantIds;
		c = {
			...c,
			publicHand: R(d.publicHand, f, e),
			privateHands: {
				...c.privateHands,
				[e]: d.privateHand
			}
		};
	}
	for (l = 0; l < 200 && (l += 1, !(Object.values(c.publicHand.tricksByPlayer).reduce((e, t) => e + (t || 0), 0) >= 5 && c.publicHand.currentTrick === null || c.publicHand.phase !== N.PLAY));) {
		let e = c.publicHand.turnPlayerId;
		if (!e) break;
		let t = J(K({
			hand: j(e, c.privateHands[e], c.publicHand),
			publicHand: c.publicHand
		})), a = ct(e, n, r, i), l = dt(c, e, a, s, e === n && o != null ? o : void 0);
		t.includes(l) || (l = t[0] ?? 0);
		let u = Je({
			publicHand: c.publicHand,
			privateHand: c.privateHands[e],
			playerId: e,
			cardIndex: l,
			actionOrder: c.publicHand.actionOrder ?? c.publicHand.participantIds,
			cinchEnabled: c.publicHand.cinchEnabled === !0
		});
		c = {
			...c,
			publicHand: u.publicHand,
			privateHands: {
				...c.privateHands,
				[e]: u.privateHand
			}
		};
	}
	return c;
}
function pt(e, t, n = {}) {
	let r = n.rollouts ?? $e, i = n.opponentPolicy ?? "mixed", a = 0, o = 0;
	for (let s = 0; s < r; s += 1) {
		let r = tt(ft(X(e), {
			heroId: t,
			opponentPolicy: i,
			rolloutIndex: s + (n.seed ?? 0)
		}), t);
		r >= 1 && (a += 1), o += r;
	}
	return {
		pAtLeastOne: a / r,
		expectedTricks: o / r
	};
}
function mt(e, t) {
	let n = X(e), r = 0;
	for (; n.publicHand.phase === N.DRAW && r < 40;) {
		r += 1;
		let e = n.publicHand.turnPlayerId;
		if (!e || e === t || (n.publicHand.drawCompletedIds ?? []).includes(t)) break;
		let i = nt(rt([
			n.publicHand.deckSeed,
			t,
			r,
			"adv"
		])), a = ct(e, t, "mixed", r), o = ut(n, e, a, i), s = n.publicHand.maxDrawDiscards ?? 5, c = L({
			playerId: e,
			privateHand: n.privateHands[e],
			publicHand: n.publicHand,
			discardIndices: o,
			deck: n.deck,
			maxDiscards: s
		}), l = n.publicHand.actionOrder ?? n.publicHand.participantIds;
		n = {
			...n,
			publicHand: R(c.publicHand, l, e),
			privateHands: {
				...n.privateHands,
				[e]: c.privateHand
			}
		};
	}
	return n;
}
function ht(e, t, n) {
	let r = e.publicHand.maxDrawDiscards ?? 5, i = L({
		playerId: t,
		privateHand: e.privateHands[t],
		publicHand: e.publicHand,
		discardIndices: n,
		deck: e.deck,
		maxDiscards: r
	}), a = e.publicHand.actionOrder ?? e.publicHand.participantIds;
	return {
		...e,
		publicHand: R(i.publicHand, a, t),
		privateHands: {
			...e.privateHands,
			[t]: i.privateHand
		}
	};
}
function gt(e, t, n) {
	let r = Je({
		publicHand: e.publicHand,
		privateHand: e.privateHands[t],
		playerId: t,
		cardIndex: n,
		actionOrder: e.publicHand.actionOrder ?? e.publicHand.participantIds,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	});
	return {
		...e,
		publicHand: r.publicHand,
		privateHands: {
			...e.privateHands,
			[t]: r.privateHand
		}
	};
}
function _t(e) {
	return [...e].sort((e, t) => e - t).join(",");
}
function vt(e, t) {
	let n = [[]], r = [], i = (t, a) => {
		if (a === 0) {
			n.push([...r]);
			return;
		}
		for (let n = t; n <= e - a; n += 1) r.push(n), i(n + 1, a - 1), r.pop();
	};
	for (let e = 1; e <= t; e += 1) i(0, e);
	return n;
}
//#endregion
//#region src/game/botSearch.ts
var yt = .12, bt = .15, xt = .05, St = 16, Z = 10, Ct = 10, Q = /* @__PURE__ */ new Map();
function wt(e, t, n = "") {
	let r = j(t.playerId, t.privateHands?.[t.playerId] ?? [], t.publicHand).map((e) => `${e.rank}${e.suit[0]}`).join(",");
	return [
		e,
		t.playerId,
		t.publicHand.phase,
		t.publicHand.deckSeed,
		t.publicHand.turnPlayerId,
		r,
		n
	].join("|");
}
function Tt(e, t, n, r) {
	let i = wt("outlook", {
		playerId: t,
		publicHand: e.publicHand,
		privateHands: e.privateHands,
		seed: n.seed
	}, `${n.rollouts}:${r}`), a = Q.get(i);
	if (a) return a;
	let o = pt(e, t, n);
	return Q.size > 500 && Q.clear(), Q.set(i, o), o;
}
function $(e) {
	return st(e, 0);
}
function Et(e, t, n) {
	let r = 0, i = 0;
	for (let a = 0; a < Z; a += 1) {
		let o = tt(ft(ht(mt(st({
			playerId: t,
			publicHand: e.publicHand,
			privateHands: e.privateHands,
			deck: e.deck,
			seed: (e.publicHand.deckSeed ?? 0) + a
		}, a), t), t, n), {
			heroId: t,
			opponentPolicy: "mixed",
			rolloutIndex: a
		}), t);
		o >= 1 && (r += 1), i += o;
	}
	return {
		pAtLeastOne: r / Z,
		expectedTricks: i / Z
	};
}
function Dt(e, t) {
	return Math.abs(e.pAtLeastOne - t.pAtLeastOne) > .001 ? e.pAtLeastOne - t.pAtLeastOne : e.expectedTricks - t.expectedTricks;
}
function Ot(e, t, n) {
	return e.length ? n ? Tt($(n), n.playerId, {
		rollouts: St,
		opponentPolicy: "mixed",
		seed: n.seed
	}, "fold").pAtLeastOne < yt : At(e, t) : !1;
}
function kt(e, t, n) {
	return e.length ? n ? Tt($(n), n.playerId, {
		rollouts: St,
		opponentPolicy: "mixed",
		seed: n.seed
	}, "pass").pAtLeastOne < bt : At(e, t, !0) : !1;
}
function At(e, t, n = !1) {
	let r = 0;
	for (let n of e) {
		let e = C(n);
		w(n, t) ? r += 2.5 + e / 13 : e >= 12 ? r += 1.8 : e >= 11 ? r += 1.2 : e >= 10 ? r += .8 : e >= 9 ? r += .4 : e >= 7 && (r += .15);
	}
	return r < (n ? 2 : 2.25);
}
function jt(e, t, n, r = Infinity, i) {
	let a = Math.min(n, Math.max(0, r));
	if (a <= 0 || !e.length) return [];
	if (!i) return Y(e, t, n, r);
	let o = mt($(i), i.playerId), s = vt(e.length, a), c = Y(e, t, n, r), l = _t(c);
	s.some((e) => _t(e) === l) || s.push(c);
	let u = s[0] ?? [], d = Et(o, i.playerId, u);
	for (let e of s) {
		let t = Et(o, i.playerId, e);
		Dt(t, d) > 0 && (u = e, d = t);
	}
	return [...u].sort((e, t) => e - t);
}
function Mt(e, t, n) {
	let r = 0;
	for (let i = 0; i < Ct; i += 1) {
		let a = ft(gt(X(e), t, n), {
			heroId: t,
			opponentPolicy: "mixed",
			rolloutIndex: i
		});
		r += tt(a, t);
	}
	return r / Ct;
}
function Nt(e, t, n) {
	let r = J(t);
	if (!r.length) return 0;
	if (!n) return Xe(e, t);
	let i = $(n), a = r[0], o = -1;
	for (let s of r) {
		let r = Mt(i, n.playerId, s);
		r > o + .05 ? (o = r, a = s) : Math.abs(r - o) <= .05 && (a = Pt(e, t, a, s));
	}
	return a;
}
function Pt(e, t, n, r) {
	return Xe(e, t) === r ? r : n;
}
function Ft(e, t) {
	let n = 0;
	for (let r of e) {
		let e = C(r);
		w(r, t) ? n += 2.5 + e / 13 : e >= 12 ? n += 1.8 : e >= 11 ? n += 1.2 : e >= 10 ? n += .8 : e >= 9 ? n += .4 : e >= 7 && (n += .15);
	}
	return n;
}
function It(e, t, n, r) {
	return {
		playCtx: K({
			hand: j(e, t, n),
			publicHand: n
		}),
		moveCtx: et(e, t, n, r)
	};
}
//#endregion
export { yt as BOT_FOLD_P_THRESHOLD, bt as BOT_PASS_P_THRESHOLD, xt as BOT_PLAY_EV_TIE, v as CARDS_PER_PLAYER, ue as CardUniquenessError, z as HAND_DECISION_MS, Te as HAND_DECISION_SECONDS, N as HAND_PHASE, Oe as activateHandDecision, f as activePlayerOrder, R as advanceAfterDraw, I as allDrawsComplete, Ae as applyDecisionPass, ke as applyDecisionPlay, je as applyDecisionTimeout, Se as applyDraw, we as applyDrawFold, ce as applyDrawPile, Ye as applyPlayCard, L as applyPlayerDraw, Je as applyPlayerPlayCard, fe as assertCardUniqueness, te as assignTrumpUpcard, jt as botDrawDiscardIndices, Nt as botPlayCardIndex, It as botPlayContextFromState, Ot as botShouldFoldDraw, kt as botShouldPassDecision, et as buildBotMoveContext, B as buildHandDecision, K as buildPlayValidationState, Be as canPlayCard, x as cardKey, S as cardsEqual, ve as cardsRemainingInHand, M as clearTrumpUpcardIfFirstAction, i as createDeck, ae as createDrawPileFromStock, V as currentDecisionPlayer, y as dealInitialHand, Ee as dealerMustPlayTrumpAce, Me as decisionAsEnrollmentView, H as decisionPatchAfterStep, G as deserializeCards, ye as displayHoleCardCount, l as drawCardsFromDeck, se as drawFromPile, he as effectiveIndexDiscardsTrump, j as effectivePlayerHand, ie as emptyDrawPile, Ft as estimateHandStrength, h as firstLeaderFromDealerLeft, F as firstUnresolvedDrawTurn, J as getLegalPlayIndices, xe as isBeforeFirstHandAction, w as isTrump, q as logPlayValidation, b as maxDrawDiscards, p as nextActivePlayerClockwise, P as nextPlayerInOrder, ze as normalizeTrickForPlay, m as openingLeaderId, O as pileFromPublicHand, ge as playedTrumpUpcard, d as playerOrderFromDealer, me as privateHandFromEffective, le as publicHandWithPile, C as rankValue, u as remainingDeckCount, _ as resolveActionOrder, g as resolveSeatRing, Ke as resolveTrickWinner, Ce as revealToDraw, U as serializeCard, W as serializeCards, Ne as serializeHandState, Pe as serializePagatRevealHand, s as shuffleDeck, c as shuffledDeckFromSeed, E as totalAvailableReplacements, pe as trumpOnTable, A as trumpOwnerId, be as trumpRevealMirroredInHolderHand, Ge as validatePlayIndex };
