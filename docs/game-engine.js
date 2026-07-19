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
	let u = b(e.dealerId, n), d = x(u, c), p = Object.fromEntries(t.map((e) => [e, 0]));
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
function b(e, t) {
	return e && t.includes(e) ? e : t[t.length - 1];
}
function x(e, t) {
	let n = t[e];
	if (n?.length === 5) return n[4];
	throw Error("Cannot assign trump upcard — trump holder has no fifth card");
}
//#endregion
//#region src/game/drawLimit.ts
function S(e, t) {
	if ((t ?? "").toLowerCase().includes("no draw")) return 0;
	let n = Math.max(2, e || 2);
	return n >= 8 ? 2 : n >= 7 ? 3 : n >= 6 ? 4 : 5;
}
//#endregion
//#region src/game/cardUtils.ts
function C(e) {
	return `${e.rank}:${e.suit}`;
}
function w(e, t) {
	return e.rank === t.rank && e.suit === t.suit;
}
function T(t) {
	return e[t.rank];
}
function E(e, t) {
	return e.suit === t;
}
function D(e, t) {
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
function O(e) {
	return e.stock.length + e.recyclePool.length;
}
function k(e) {
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
		pile: k(e),
		cards: []
	};
	let r = k(e), i = [];
	for (; i.length < t;) {
		if (r.stock.length === 0) {
			if (r.recyclePool.length === 0) throw Error(`Not enough cards in draw pile (${O(e)} available, tried to draw ${t})`);
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
		pile: k(e.pile),
		replacements: []
	};
	let { pile: n, cards: r } = ae({
		...k(e.pile),
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
		stock: K(e.drawStock),
		recyclePool: K(e.recyclePool ?? []),
		pendingDiscards: K(e.pendingDrawDiscards ?? []),
		recycleShuffleCount: e.recycleShuffleCount ?? 0
	};
	let n = e.deckSeed, r = t ?? (n == null ? [] : c(n)), i = e.deckNextIndex ?? 0;
	return re(r.slice(i));
}
function ce(e, t) {
	return {
		...e,
		drawStock: G(t.stock),
		recyclePool: G(t.recyclePool),
		pendingDrawDiscards: G(t.pendingDiscards),
		recycleShuffleCount: t.recycleShuffleCount,
		remainingDeckCount: t.stock.length
	};
}
//#endregion
//#region src/game/invariants.ts
var le = class extends Error {
	duplicates;
	constructor(e, t) {
		super(e), this.name = "CardUniquenessError", this.duplicates = t;
	}
};
function A(e, t, n) {
	let r = C(t);
	return e.get(r) ? [r] : (e.set(r, n), []);
}
function ue(e, t) {
	let n = [];
	for (let r = 0; r < t.stock.length; r += 1) n.push(...A(e, t.stock[r], `stock[${r}]`));
	for (let r = 0; r < t.recyclePool.length; r += 1) n.push(...A(e, t.recyclePool[r], `recycle[${r}]`));
	for (let r = 0; r < t.pendingDiscards.length; r += 1) n.push(...A(e, t.pendingDiscards[r], `pending[${r}]`));
	return n;
}
function de(e) {
	let t = /* @__PURE__ */ new Map(), n = [];
	if (e.drawPile) n.push(...ue(t, e.drawPile));
	else if (e.deck != null && e.deckNextIndex != null) for (let r = e.deckNextIndex; r < e.deck.length; r += 1) n.push(...A(t, e.deck[r], `deck[${r}]`));
	for (let [r, i] of Object.entries(e.privateHands)) for (let e = 0; e < i.length; e += 1) n.push(...A(t, i[e], `hand:${r}[${e}]`));
	if (e.trumpUpcard) {
		let r = C(e.trumpUpcard);
		((e.trumpHolderId ? e.privateHands[e.trumpHolderId] : void 0)?.some((e) => C(e) === r) ?? !1) || n.push(...A(t, e.trumpUpcard, "trumpUpcard"));
	}
	for (let r of e.currentTrick?.plays ?? []) n.push(...A(t, r.card, `trick:${r.playerId}`));
	for (let r of e.playedCards ?? []) n.push(...A(t, r.card, `played:t${r.trickNumber}`));
	if (n.length) {
		let e = [...new Set(n)];
		throw new le(`Duplicate card(s) in game state: ${e.map((e) => `${e} (${t.get(e)})`).join(", ")}`, e);
	}
}
function j(e) {
	return e.trumpHolderId ?? e.dealerId ?? null;
}
function fe(e) {
	return !!e.trumpUpcard;
}
function M(e, t, n) {
	let r = [...t], i = j(n), a = n.trumpUpcard;
	return !i || e !== i || !a ? r : r.some((e) => w(e, a)) ? r.filter((e) => !w(e, a)) : (r.push(a), r);
}
function N(e, t, n) {
	let r = j(n), i = n.trumpUpcard;
	return r && e === r && i && !t.some((e) => w(e, i)) ? [...t, i] : [...t];
}
function pe(e, t, n, r) {
	let i = j(r);
	return !i || e !== i || !r.trumpUpcard ? !1 : t.some((e) => {
		let t = n[e];
		return t && w(t, r.trumpUpcard);
	});
}
function me(e, t) {
	return !!(t.trumpUpcard && w(e, t.trumpUpcard));
}
var he = 5;
function ge(e, t) {
	let n = (e.playedCards ?? []).filter((e) => e.playerId === t).length, r = (e.currentTrick?.plays ?? []).filter((e) => e.playerId === t).length;
	return Math.max(0, he - n - r);
}
function _e(e, t, n = !1) {
	let r = ge(e, t);
	return n ? r : j(e) === t && fe(e) ? Math.max(0, r - 1) : r;
}
function ve(e, t) {
	if (!e.trumpUpcard || !e.trumpHolderId) return !1;
	let n = t[e.trumpHolderId];
	return n?.length ? n.some((t) => w(t, e.trumpUpcard)) : !1;
}
function ye(e) {
	let t = (e.drawCompletedIds ?? []).length, n = (e.playedCards ?? []).length, r = (e.currentTrick?.plays ?? []).length, i = (e.foldedIds ?? []).length;
	return t === 0 && n === 0 && r === 0 && i === 0;
}
function P(e) {
	return !e.trumpUpcard || !ye(e) ? e : {
		...e,
		trumpUpcard: null
	};
}
//#endregion
//#region src/game/types.ts
var F = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
};
//#endregion
//#region src/game/draw.ts
function be(e) {
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
	let a = O(e.pile);
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
	return p(e, t);
}
function L(e, t, n, r) {
	let i = _(e, r).filter((e) => t.includes(e)), a = g(e, r), o = m(e.dealerId, t, a) ?? i[0] ?? null;
	if (!o) return null;
	let s = i.indexOf(o), c = s >= 0 ? [...i.slice(s), ...i.slice(0, s)] : i;
	for (let e of c) if (!n.includes(e)) return e;
	return o;
}
function R(e, t) {
	let n = new Set(t);
	return e.every((e) => n.has(e));
}
function xe(e) {
	let t = e.publicHand.deckSeed ?? 0, n = se(e.publicHand, e.deck), r = M(e.playerId, e.privateHand, e.publicHand), i = be({
		hand: r,
		discardIndices: e.discardIndices,
		pile: n,
		deckSeed: t,
		maxDiscards: e.maxDiscards
	}), a = pe(e.playerId, e.discardIndices, r, e.publicHand), o = ce(e.publicHand, i.pile);
	return o = a ? {
		...o,
		trumpUpcard: null
	} : P(o), {
		privateHand: N(e.playerId, i.hand, o),
		publicHand: o,
		pile: i.pile,
		discarded: i.discarded
	};
}
function Se(e, t) {
	let n = [...e.participantIds], r = _(e).filter((e) => n.includes(e)), i = Object.fromEntries(n.map((t) => [t, e.tricksByPlayer[t] ?? 0])), a = L(e, n, []);
	return {
		...e,
		phase: F.DRAW,
		participantIds: n,
		actionOrder: r,
		handDecision: null,
		drawCompletedIds: [],
		tricksByPlayer: i,
		turnPlayerId: a,
		maxDrawDiscards: S(n.length, t),
		pendingDrawDiscards: []
	};
}
function Ce(e, t, n) {
	let r = P(e), i = r.participantIds.filter((e) => e !== n), a = [...r.foldedIds ?? [], n], o = t.filter((e) => i.includes(e)), s = [...new Set([...r.drawCompletedIds ?? [], n])], c = {
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
	if (R(i, s)) return {
		kind: "continue",
		publicHand: we(c, o, n)
	};
	let l = I(o, n), u = new Set(s), d = 0;
	for (; l && u.has(l) && d < o.length + 1;) l = I(o, l), d += 1;
	return {
		kind: "continue",
		publicHand: {
			...c,
			turnPlayerId: l
		}
	};
}
function we(e, t, n) {
	let r = [...new Set([...e.drawCompletedIds ?? [], n])], i = e.participantIds;
	if (!R(i, r)) {
		let a = L({
			...e,
			drawCompletedIds: r
		}, i, r) ?? I(t, n);
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
		phase: F.PLAY,
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
function H(e, t, n) {
	return e === t && n?.rank === "A" && !!n?.suit;
}
function Ee(e, t, n, r) {
	let i = _(e).filter((e) => t.includes(e)), a = S(t.length, r), o = t.filter((e) => (n[e] ?? 0) === 0), s = Object.fromEntries(t.map((t) => [t, e.tricksByPlayer[t] ?? 0]));
	return {
		...e,
		phase: F.DRAW,
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
function De(e, t = Date.now()) {
	if (e.phase === F.DECISION && e.handDecision?.active === !0) return e;
	let n = e.handDecision ?? B(e.seatedIds ?? e.participantIds, e.dealerId, !0, t);
	return {
		...e,
		phase: F.DECISION,
		handDecision: {
			...n,
			active: !0,
			turnDeadlineMs: t + z
		}
	};
}
function U(e, t, n, r, i, a, o = Date.now()) {
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
		let t = B(e.seatedIds ?? e.participantIds, e.dealerId, !0, o);
		return {
			kind: "restart",
			handDecision: t,
			publicHand: {
				...e,
				phase: F.DECISION,
				handDecision: t
			}
		};
	}
	return {
		kind: "draw",
		handDecision: null,
		publicHand: Ee(e, n, i, a?.dealingRule)
	};
}
function Oe(e, t, n, r, i, a = Date.now()) {
	if (V(t) !== n) throw Error("Not your turn to decide yet");
	let o = S(e.participantIds.length, i?.dealingRule), s = Math.max(0, Math.min(o, Math.floor(r))), c = [...t.playingIds, n], l = {
		...t.plannedDiscards,
		[n]: s
	};
	return U(e, t, c, t.passedIds, l, i, a);
}
function ke(e, t, n, r, i = Date.now()) {
	if (V(t) !== n) throw Error("Not your turn to pass yet");
	if (H(n, e.dealerId, e.trumpUpcard)) throw Error("Dealer must play when trump is an ace");
	if (t.passedIds.includes(n)) throw Error("Already passed this hand");
	let a = [...t.passedIds, n];
	return U(e, t, t.playingIds, a, t.plannedDiscards, r, i);
}
function Ae(e, t, n, r = Date.now()) {
	let i = V(t);
	if (!i) throw Error("No decision turn");
	if (H(i, e.dealerId, e.trumpUpcard)) return Oe(e, t, i, 0, n, r);
	let a = [...t.passedIds, i];
	return U(e, t, t.playingIds, a, t.plannedDiscards, n, r);
}
function je(e) {
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
function W(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function G(e) {
	return e.map(W);
}
function Me(e, t) {
	let n = typeof t == "object" && t ? t.dealerId : t, r = typeof t == "object" && t ? t.actionOrder : e.dealOrder, i = typeof t == "object" && t && t.maxDrawDiscards != null ? t.maxDrawDiscards : S(e.participantIds.length), a = typeof t == "object" && t ? t.cinchEnabled === !0 : !1, o = typeof t == "object" && t && t.initialPhase ? t.initialPhase : F.DRAW, s = typeof t == "object" && t ? t.handDecision ?? null : null, c = {
		phase: o,
		participantIds: [...e.participantIds],
		seatedIds: typeof t == "object" && t && t.seatedIds?.length ? [...t.seatedIds] : [...e.participantIds],
		dealerId: n,
		trumpHolderId: e.trumpHolderId,
		trumpSuit: e.trumpSuit,
		trumpUpcard: W(e.trumpUpcard),
		remainingDeckCount: e.remainingDeck.length,
		currentTrick: null,
		leadSuit: null,
		playedCards: [],
		turnPlayerId: e.turnPlayerId,
		tricksByPlayer: { ...e.tricksByPlayer },
		deckSeed: e.deckSeed,
		deckNextIndex: e.deckNextIndex,
		drawStock: G(e.remainingDeck),
		recyclePool: [],
		pendingDrawDiscards: [],
		recycleShuffleCount: 0,
		actionOrder: [...r],
		drawCompletedIds: [],
		maxDrawDiscards: i,
		cinchEnabled: a,
		handDecision: s
	}, l = {};
	for (let [t, n] of Object.entries(e.privateHands)) l[t] = { cards: G(n) };
	return {
		publicHand: c,
		privateHandsByPlayer: l
	};
}
function Ne(e, t) {
	let n = B(t.seatedIds?.length ? t.seatedIds : e.participantIds, t.dealerId, !1);
	return Me(e, {
		...t,
		initialPhase: F.REVEAL,
		handDecision: n
	});
}
function K(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/playContext.ts
function Pe(e, t) {
	let n = D(e, t);
	return n.length ? n.reduce((e, t) => T(t) >= T(e) ? t : e) : null;
}
function Fe(e) {
	if (!e.cinchEnabled) return !1;
	let t = D(e.hand, e.trumpSuit);
	return t.filter((e) => T(e) >= 13).length >= 3 && t.length > 0;
}
function Ie(e, t) {
	let n = Pe(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function Le(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => K([e.card])[0]) : [];
}
function q(e) {
	let t = e.currentTrick ?? null, n = Le(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function Re(e) {
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
function J(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return Fe(e) && !Ie(n, e) ? {
		allowed: !1,
		reason: "Cinch: play your highest trump",
		code: "CINCH_HIGHEST_TRUMP"
	} : { allowed: !0 };
	let r = e.leadSuit ?? e.trickPlays[0]?.suit;
	return r ? D(e.hand, r).length > 0 ? n.suit === r ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must follow suit",
		code: "MUST_FOLLOW_SUIT"
	} : D(e.hand, e.trumpSuit).length > 0 ? E(n, e.trumpSuit) ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must play a trump when void in the led suit",
		code: "MUST_TRUMP"
	} : { allowed: !0 } : { allowed: !0 };
}
function Y(e, t, n, r) {
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
function ze(e, t, n) {
	let r = e.filter((e) => !E(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => T(t) > T(e) ? t : e) : null;
}
function Be(e, t) {
	let n = e.filter((e) => E(e, t));
	return n.length ? n.reduce((e, t) => T(t) > T(e) ? t : e) : null;
}
function X(e, t) {
	return T(e) > T(t);
}
function Ve(e) {
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
	let n = Ve(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = J(n, r);
			i.allowed ? e.push(r) : Y(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? D(n.hand, r) : [], a = D(n.hand, n.trumpSuit), o = r ? ze(n.trickPlays, r, n.trumpSuit) : null, s = Be(n.trickPlays, n.trumpSuit), c;
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
function He(e, t, n = {}) {
	let r = Ve(e), i = J(r, t);
	if (Y(n, r, t, i), !i.allowed) return {
		ok: !1,
		code: i.code ?? "MUST_BEAT_LED_SUIT",
		message: i.reason ?? "Illegal play"
	};
	if (r.isLeading || r.trickPlays.length === 0) return { ok: !0 };
	if (!Z(e, n).includes(t)) {
		let n = e.hand[t], r = e.leadSuit, i = r ? D(e.hand, r) : [], a = D(e.hand, e.trumpSuit), o = r ? Be(e.trickPlays, e.trumpSuit) : null;
		return r && i.length && n.suit !== r ? {
			ok: !1,
			code: "MUST_FOLLOW_SUIT",
			message: "You must follow suit"
		} : r && !i.length && a.length && !E(n, e.trumpSuit) ? {
			ok: !1,
			code: "MUST_TRUMP",
			message: "You must play a trump when void in the led suit"
		} : o && E(n, e.trumpSuit) && !X(n, o) ? {
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
	let r = e.filter((e) => E(e.card, n));
	if (r.length) return r.reduce((e, t) => T(t.card) > T(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => T(t.card) > T(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
var Ue = 5;
function We(e) {
	let t = M(e.playerId, e.privateHand, e.publicHand), n = (e.publicHand.playedCards?.length ?? 0) === 0 && (e.publicHand.currentTrick?.plays?.length ?? 0) === 0 && Object.values(e.publicHand.tricksByPlayer ?? {}).every((e) => (e ?? 0) === 0), r = Ge({
		publicHand: e.publicHand,
		playerHand: t,
		playerId: e.playerId,
		cardIndex: e.cardIndex,
		actionOrder: e.actionOrder,
		cinchEnabled: e.cinchEnabled
	}), i = t[e.cardIndex], a = r.publicHand;
	a = e.publicHand.trumpUpcard && (n || i && me(i, e.publicHand)) ? {
		...a,
		trumpUpcard: null
	} : P(a);
	let o = N(e.playerId, r.playerHand, a);
	return {
		...r,
		publicHand: a,
		privateHand: o,
		playerHand: o
	};
}
function Ge(e) {
	let { publicHand: t, playerId: n, cardIndex: r } = e, i = e.actionOrder.length > 0 ? e.actionOrder : _(t);
	if (t.phase !== F.PLAY) throw Error("Not in trick-play phase");
	if (t.turnPlayerId !== n) throw Error("Not your turn");
	let a = t.currentTrick;
	if (!a) throw Error("No active trick");
	let { isLeading: o, leadSuit: s, trickIndex: c } = q(t), l = He(Re({
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
		card: W(u)
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
	let v = Q(m.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})), h, t.trumpSuit), y = { ...t.tricksByPlayer };
	y[v] = (y[v] ?? 0) + 1;
	let b = [...t.playedCards, ...m.map((e) => ({
		...e,
		trickNumber: a.trickNumber
	}))];
	if (Object.values(y).reduce((e, t) => e + (t || 0), 0) >= Ue) return {
		publicHand: {
			...t,
			tricksByPlayer: y,
			playedCards: b,
			currentTrick: null,
			leadSuit: null,
			turnPlayerId: null
		},
		playerHand: d,
		trickResolved: !0,
		handComplete: !0
	};
	let x = a.trickNumber + 1;
	return {
		publicHand: {
			...t,
			actionOrder: i,
			tricksByPlayer: y,
			playedCards: b,
			leadSuit: null,
			turnPlayerId: v,
			currentTrick: {
				trickNumber: x,
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
function Ke(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: T(e),
		trump: E(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function qe(e, t) {
	let n = Z(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => T(e[n]) > T(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => T(e[n]) < T(e[t]) ? n : t);
	let i = n.filter((n) => Q([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => T(e[n]) < T(e[t]) ? n : t);
}
//#endregion
//#region src/game/botDecisions.ts
function $(e, t) {
	let n = 0;
	for (let r of e) {
		let e = T(r);
		E(r, t) ? n += 2.5 + e / 13 : e >= 12 ? n += 1.8 : e >= 11 ? n += 1.2 : e >= 10 ? n += .8 : e >= 9 ? n += .4 : e >= 7 && (n += .15);
	}
	return n;
}
function Je(e, t) {
	return e.length < 5 ? !1 : $(e, t) < 2.25;
}
function Ye(e, t) {
	return e.length < 5 ? !1 : $(e, t) < 2;
}
//#endregion
export { v as CARDS_PER_PLAYER, le as CardUniquenessError, z as HAND_DECISION_MS, Te as HAND_DECISION_SECONDS, F as HAND_PHASE, De as activateHandDecision, f as activePlayerOrder, we as advanceAfterDraw, R as allDrawsComplete, ke as applyDecisionPass, Oe as applyDecisionPlay, Ae as applyDecisionTimeout, be as applyDraw, Ce as applyDrawFold, oe as applyDrawPile, Ge as applyPlayCard, xe as applyPlayerDraw, We as applyPlayerPlayCard, de as assertCardUniqueness, x as assignTrumpUpcard, Ke as botDrawDiscardIndices, qe as botPlayCardIndex, Je as botShouldFoldDraw, Ye as botShouldPassDecision, B as buildHandDecision, Re as buildPlayValidationState, J as canPlayCard, C as cardKey, w as cardsEqual, ge as cardsRemainingInHand, P as clearTrumpUpcardIfFirstAction, i as createDeck, re as createDrawPileFromStock, V as currentDecisionPlayer, y as dealInitialHand, H as dealerMustPlayTrumpAce, je as decisionAsEnrollmentView, U as decisionPatchAfterStep, K as deserializeCards, _e as displayHoleCardCount, l as drawCardsFromDeck, ae as drawFromPile, pe as effectiveIndexDiscardsTrump, M as effectivePlayerHand, ne as emptyDrawPile, $ as estimateHandStrength, h as firstLeaderFromDealerLeft, L as firstUnresolvedDrawTurn, Z as getLegalPlayIndices, ye as isBeforeFirstHandAction, E as isTrump, Y as logPlayValidation, S as maxDrawDiscards, p as nextActivePlayerClockwise, I as nextPlayerInOrder, q as normalizeTrickForPlay, m as openingLeaderId, se as pileFromPublicHand, me as playedTrumpUpcard, d as playerOrderFromDealer, N as privateHandFromEffective, ce as publicHandWithPile, T as rankValue, u as remainingDeckCount, _ as resolveActionOrder, g as resolveSeatRing, Q as resolveTrickWinner, Se as revealToDraw, W as serializeCard, G as serializeCards, Me as serializeHandState, Ne as serializePagatRevealHand, s as shuffleDeck, c as shuffledDeckFromSeed, O as totalAvailableReplacements, fe as trumpOnTable, j as trumpOwnerId, ve as trumpRevealMirroredInHolderHand, He as validatePlayIndex };
