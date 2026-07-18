//#region src/game/playerOrder.ts
function e(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function t(t, n, r) {
	let i = e(t, r), a = new Set(n);
	return i.filter((e) => a.has(e));
}
function n(e, t) {
	let n = e.indexOf(t);
	return n < 0 ? e[0] ?? null : e[(n + 1) % e.length] ?? null;
}
function r(e, n, r) {
	let i = t(e, n, r);
	return i.length ? e && i[0] === e ? i.find((t) => t !== e) ?? i[0] : i[0] : null;
}
var i = r;
function a(e, t) {
	return e.seatedIds?.length ? e.seatedIds : t?.length ? t : e.participantIds ?? [];
}
function o(e, n) {
	let r = e.participantIds ?? [];
	if (!r.length) return [];
	let i = a(e, n), o = i.length > 0 ? i : n?.length ? n : r, s = t(e.dealerId, r, o);
	if (s.length > 0) return s;
	if (e.dealerId) return t(e.dealerId, r, r);
	if (e.actionOrder?.length) {
		let t = e.actionOrder.filter((e) => r.includes(e));
		if (t.length > 0) return t;
	}
	return r;
}
var s = 5;
//#endregion
//#region src/game/handParticipants.ts
function c(e) {
	return e.participantIds ?? [];
}
function l(e) {
	return c(e).length;
}
function u(e) {
	let t = new Set(c(e));
	return (e.drawCompletedIds ?? []).filter((e) => t.has(e)).length;
}
function d(e) {
	let t = new Set(c(e));
	return (e.drawCompletedIds ?? []).filter((e) => !t.has(e));
}
function f(e) {
	let t = new Set(e.drawCompletedIds ?? []);
	return c(e).every((e) => t.has(e));
}
function p(e) {
	let t = c(e);
	return {
		eligibleIds: t,
		drawCompleted: u(e),
		drawTotal: t.length,
		actionOrder: o({
			participantIds: [...t],
			actionOrder: e.actionOrder,
			dealerId: e.dealerId,
			seatedIds: e.seatedIds
		})
	};
}
//#endregion
//#region src/types.ts
var m = {
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
}, h = (e, t) => ({
	rank: e,
	suit: t
}), g = [
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
], ee = [
	"spades",
	"hearts",
	"diamonds",
	"clubs"
];
function _() {
	let e = [];
	for (let t of ee) for (let n of g) e.push(h(n, t));
	return e;
}
function v(e) {
	let t = e >>> 0;
	return () => {
		t += 1831565813;
		let e = Math.imul(t ^ t >>> 15, 1 | t);
		return e ^= e + Math.imul(e ^ e >>> 7, 61 | e), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function y() {
	if (typeof crypto < "u" && crypto.getRandomValues) {
		let e = new Uint32Array(1);
		return crypto.getRandomValues(e), e[0] ?? Date.now();
	}
	return (Date.now() ^ Math.random() * 4294967296) >>> 0;
}
function b(e, t) {
	let n = [...e], r = v(t ?? y());
	for (let e = n.length - 1; e > 0; --e) {
		let t = Math.floor(r() * (e + 1));
		[n[e], n[t]] = [n[t], n[e]];
	}
	return n;
}
//#endregion
//#region src/game/deckState.ts
function te(e) {
	return b(_(), e);
}
function ne(e, t, n) {
	let r = e.slice(t, t + n);
	if (r.length < n) throw Error("Not enough cards left in deck");
	return {
		cards: r,
		deckNextIndex: t + n
	};
}
function re(e, t) {
	return Math.max(0, e.length - t);
}
//#endregion
//#region src/game/deal.ts
function ie(e) {
	let n = [...new Set(e.participantIds.filter(Boolean))];
	if (n.length < 2) throw Error("Need at least two participants to deal");
	let i = t(e.dealerId, n, e.sortedPlayerIds);
	if (i.length < 2) throw Error("Need at least two seated participants in deal order");
	let a = r(e.dealerId, n, e.sortedPlayerIds), o = e.seed ?? Date.now(), s = b(_(), o), c = Object.fromEntries(i.map((e) => [e, []])), l = 0;
	for (let e = 0; e < 5; e += 1) for (let e of i) c[e].push(s[l]), l += 1;
	let u = ae(e.dealerId, i), d = oe(u, c), f = Object.fromEntries(n.map((e) => [e, 0]));
	return {
		dealOrder: i,
		participantIds: n,
		privateHands: c,
		trumpHolderId: u,
		trumpUpcard: d,
		trumpSuit: d.suit,
		remainingDeck: s.slice(l),
		turnPlayerId: a ?? i[0],
		tricksByPlayer: f,
		deckSeed: o,
		deckNextIndex: l
	};
}
function ae(e, t) {
	return e && t.includes(e) ? e : t[t.length - 1];
}
function oe(e, t) {
	let n = t[e];
	if (n?.length === 5) return n[4];
	throw Error("Cannot assign trump upcard — trump holder has no fifth card");
}
//#endregion
//#region src/game/drawLimit.ts
function x(e, t) {
	if ((t ?? "").toLowerCase().includes("no draw")) return 0;
	let n = Math.max(2, e || 2);
	return n >= 8 ? 2 : n >= 7 ? 3 : n >= 6 ? 4 : 5;
}
//#endregion
//#region src/game/cardUtils.ts
function S(e) {
	return `${e.rank}:${e.suit}`;
}
function C(e, t) {
	return e.rank === t.rank && e.suit === t.suit;
}
function w(e) {
	return m[e.rank];
}
function T(e, t) {
	return e.suit === t;
}
function E(e, t) {
	return e.filter((e) => e.suit === t);
}
function se(e, t) {
	return e.filter((e, n) => n !== t);
}
function ce(e, t) {
	let n = [...new Set(t)].sort((e, t) => t - e), r = [...e];
	for (let e of n) e < 0 || e >= r.length || r.splice(e, 1);
	return r;
}
//#endregion
//#region src/game/drawPile.ts
function le() {
	return {
		stock: [],
		recyclePool: [],
		pendingDiscards: [],
		recycleShuffleCount: 0
	};
}
function ue(e) {
	return {
		stock: [...e],
		recyclePool: [],
		pendingDiscards: [],
		recycleShuffleCount: 0
	};
}
function D(e) {
	return e.stock.length + e.recyclePool.length;
}
function O(e) {
	return {
		stock: [...e.stock],
		recyclePool: [...e.recyclePool],
		pendingDiscards: [...e.pendingDiscards],
		recycleShuffleCount: e.recycleShuffleCount
	};
}
function de(e, t) {
	if (!e.recyclePool.length) return e;
	let n = (t ^ (e.recycleShuffleCount + 1) * 2654435769) >>> 0;
	return {
		stock: b(e.recyclePool, n),
		recyclePool: [],
		pendingDiscards: [...e.pendingDiscards],
		recycleShuffleCount: e.recycleShuffleCount + 1
	};
}
function fe(e, t, n) {
	if (t <= 0) return {
		pile: O(e),
		cards: []
	};
	let r = O(e), i = [];
	for (; i.length < t;) {
		if (r.stock.length === 0) {
			if (r.recyclePool.length === 0) throw Error(`Not enough cards in draw pile (${D(e)} available, tried to draw ${t})`);
			r = de(r, n);
		}
		let a = t - i.length, o = Math.min(a, r.stock.length);
		i.push(...r.stock.splice(0, o));
	}
	return {
		pile: r,
		cards: i
	};
}
function pe(e) {
	let t = e.drawCount;
	if (t === 0) return {
		pile: O(e.pile),
		replacements: []
	};
	let { pile: n, cards: r } = fe({
		...O(e.pile),
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
function me(e, t) {
	if (e.drawStock != null) return {
		stock: K(e.drawStock),
		recyclePool: K(e.recyclePool ?? []),
		pendingDiscards: K(e.pendingDrawDiscards ?? []),
		recycleShuffleCount: e.recycleShuffleCount ?? 0
	};
	let n = e.deckSeed, r = t ?? (n == null ? [] : te(n)), i = e.deckNextIndex ?? 0;
	return ue(r.slice(i));
}
function he(e, t) {
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
var ge = class extends Error {
	duplicates;
	constructor(e, t) {
		super(e), this.name = "CardUniquenessError", this.duplicates = t;
	}
};
function k(e, t, n) {
	let r = S(t);
	return e.get(r) ? [r] : (e.set(r, n), []);
}
function _e(e, t) {
	let n = [];
	for (let r = 0; r < t.stock.length; r += 1) n.push(...k(e, t.stock[r], `stock[${r}]`));
	for (let r = 0; r < t.recyclePool.length; r += 1) n.push(...k(e, t.recyclePool[r], `recycle[${r}]`));
	for (let r = 0; r < t.pendingDiscards.length; r += 1) n.push(...k(e, t.pendingDiscards[r], `pending[${r}]`));
	return n;
}
function ve(e) {
	let t = /* @__PURE__ */ new Map(), n = [];
	if (e.drawPile) n.push(..._e(t, e.drawPile));
	else if (e.deck != null && e.deckNextIndex != null) for (let r = e.deckNextIndex; r < e.deck.length; r += 1) n.push(...k(t, e.deck[r], `deck[${r}]`));
	for (let [r, i] of Object.entries(e.privateHands)) for (let e = 0; e < i.length; e += 1) n.push(...k(t, i[e], `hand:${r}[${e}]`));
	if (e.trumpUpcard) {
		let r = S(e.trumpUpcard);
		((e.trumpHolderId ? e.privateHands[e.trumpHolderId] : void 0)?.some((e) => S(e) === r) ?? !1) || n.push(...k(t, e.trumpUpcard, "trumpUpcard"));
	}
	for (let r of e.currentTrick?.plays ?? []) n.push(...k(t, r.card, `trick:${r.playerId}`));
	for (let r of e.playedCards ?? []) n.push(...k(t, r.card, `played:t${r.trickNumber}`));
	if (n.length) {
		let e = [...new Set(n)];
		throw new ge(`Duplicate card(s) in game state: ${e.map((e) => `${e} (${t.get(e)})`).join(", ")}`, e);
	}
}
function A(e) {
	return e.trumpHolderId ?? e.dealerId ?? null;
}
function ye(e) {
	return !!e.trumpUpcard;
}
function j(e, t, n) {
	let r = [...t], i = A(n), a = n.trumpUpcard;
	return !i || e !== i || !a ? r : r.some((e) => C(e, a)) ? r.filter((e) => !C(e, a)) : (r.push(a), r);
}
function M(e, t, n) {
	let r = A(n), i = n.trumpUpcard;
	return r && e === r && i && !t.some((e) => C(e, i)) ? [...t, i] : [...t];
}
function be(e, t, n, r) {
	let i = A(r);
	return !i || e !== i || !r.trumpUpcard ? !1 : t.some((e) => {
		let t = n[e];
		return t && C(t, r.trumpUpcard);
	});
}
function N(e, t) {
	return !!(t.trumpUpcard && C(e, t.trumpUpcard));
}
var xe = 5;
function Se(e, t) {
	let n = (e.playedCards ?? []).filter((e) => e.playerId === t).length, r = (e.currentTrick?.plays ?? []).filter((e) => e.playerId === t).length;
	return Math.max(0, xe - n - r);
}
function Ce(e, t, n = !1) {
	let r = Se(e, t);
	return n ? r : A(e) === t && ye(e) ? Math.max(0, r - 1) : r;
}
function we(e, t) {
	if (!e.trumpUpcard || !e.trumpHolderId) return !1;
	let n = t[e.trumpHolderId];
	return n?.length ? n.some((t) => C(t, e.trumpUpcard)) : !1;
}
function Te(e) {
	let t = (e.drawCompletedIds ?? []).length, n = (e.playedCards ?? []).length, r = (e.currentTrick?.plays ?? []).length, i = (e.foldedIds ?? []).length;
	return t === 0 && n === 0 && r === 0 && i === 0;
}
function P(e) {
	return !e.trumpUpcard || !Te(e) ? e : {
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
function Ee(e) {
	let t = [...new Set(e.discardIndices)].sort((e, t) => e - t);
	if (t.some((t) => t < 0 || t >= e.hand.length)) throw Error("Invalid discard selection");
	if (t.length > e.maxDiscards) throw Error(`You may discard at most ${e.maxDiscards} cards`);
	if (t.length > 0 && t.length > e.maxDiscards) throw Error(`Draw limit is ${e.maxDiscards}`);
	let n = t.map((t) => e.hand[t]), r = ce(e.hand, t), i = t.length;
	if (i === 0) return {
		hand: r,
		pile: e.pile,
		discarded: 0
	};
	let a = D(e.pile);
	if (a < i) throw Error(`Not enough cards left in draw pile (${a} remaining, tried to draw ${i})`);
	let { pile: o, replacements: s } = pe({
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
	return n(e, t);
}
function L(e, t, n, i) {
	let s = o(e, i).filter((e) => t.includes(e)), c = a(e, i), l = r(e.dealerId, t, c) ?? s[0] ?? null;
	if (!l) return null;
	let u = s.indexOf(l), d = u >= 0 ? [...s.slice(u), ...s.slice(0, u)] : s;
	for (let e of d) if (!n.includes(e)) return e;
	return l;
}
function R(e, t) {
	let n = new Set(t);
	return e.every((e) => n.has(e));
}
function De(e) {
	let t = e.publicHand.deckSeed ?? 0, n = me(e.publicHand, e.deck), r = j(e.playerId, e.privateHand, e.publicHand), i = Ee({
		hand: r,
		discardIndices: e.discardIndices,
		pile: n,
		deckSeed: t,
		maxDiscards: e.maxDiscards
	}), a = be(e.playerId, e.discardIndices, r, e.publicHand), o = he(e.publicHand, i.pile);
	return o = a ? {
		...o,
		trumpUpcard: null
	} : P(o), {
		privateHand: M(e.playerId, i.hand, o),
		publicHand: o,
		pile: i.pile,
		discarded: i.discarded
	};
}
function Oe(e, t) {
	let n = [...e.participantIds], r = o(e).filter((e) => n.includes(e)), i = Object.fromEntries(n.map((t) => [t, e.tricksByPlayer[t] ?? 0])), a = L(e, n, []);
	return {
		...e,
		phase: F.DRAW,
		participantIds: n,
		actionOrder: r,
		handDecision: null,
		drawCompletedIds: [],
		tricksByPlayer: i,
		turnPlayerId: a,
		maxDrawDiscards: x(n.length, t),
		pendingDrawDiscards: []
	};
}
function ke(e, t, n) {
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
		publicHand: Ae(c, o, n)
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
function Ae(e, t, n) {
	let i = [...new Set([...e.drawCompletedIds ?? [], n])], s = e.participantIds;
	if (!R(s, i)) {
		let r = L({
			...e,
			drawCompletedIds: i
		}, s, i) ?? I(t, n);
		return {
			...e,
			drawCompletedIds: i,
			turnPlayerId: r,
			pendingDrawDiscards: []
		};
	}
	let c = a(e), l = r(e.dealerId, s, c) ?? o(e)[0] ?? n;
	return {
		...e,
		phase: F.PLAY,
		drawCompletedIds: i,
		pendingDrawDiscards: [],
		turnPlayerId: l,
		currentTrick: {
			trickNumber: 1,
			leadPlayerId: l,
			leadSuit: null,
			plays: []
		},
		leadSuit: null
	};
}
//#endregion
//#region src/game/decision.ts
var je = 12, z = 12 * 1e3;
function B(t, n, r = !1, i = Date.now()) {
	return {
		active: r,
		orderedPlayerIds: e(n, t),
		currentIndex: 0,
		turnDeadlineMs: i + z,
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
function Me(e, t, n, r) {
	let i = o(e).filter((e) => t.includes(e)), a = x(t.length, r), s = t.filter((e) => (n[e] ?? 0) === 0), c = Object.fromEntries(t.map((t) => [t, e.tricksByPlayer[t] ?? 0]));
	return {
		...e,
		phase: F.DRAW,
		participantIds: [...t],
		actionOrder: i,
		maxDrawDiscards: a,
		tricksByPlayer: c,
		drawCompletedIds: s,
		turnPlayerId: L(e, t, s),
		handDecision: null,
		seatedIds: e.seatedIds
	};
}
function Ne(e, t = Date.now()) {
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
		publicHand: Me(e, n, i, a?.dealingRule)
	};
}
function Pe(e, t, n, r, i, a = Date.now()) {
	if (V(t) !== n) throw Error("Not your turn to decide yet");
	let o = x(e.participantIds.length, i?.dealingRule), s = Math.max(0, Math.min(o, Math.floor(r))), c = [...t.playingIds, n], l = {
		...t.plannedDiscards,
		[n]: s
	};
	return U(e, t, c, t.passedIds, l, i, a);
}
function Fe(e, t, n, r, i = Date.now()) {
	if (V(t) !== n) throw Error("Not your turn to pass yet");
	if (H(n, e.dealerId, e.trumpUpcard)) throw Error("Dealer must play when trump is an ace");
	if (t.passedIds.includes(n)) throw Error("Already passed this hand");
	let a = [...t.passedIds, n];
	return U(e, t, t.playingIds, a, t.plannedDiscards, r, i);
}
function Ie(e, t, n, r = Date.now()) {
	let i = V(t);
	if (!i) throw Error("No decision turn");
	if (H(i, e.dealerId, e.trumpUpcard)) return Pe(e, t, i, 0, n, r);
	let a = [...t.passedIds, i];
	return U(e, t, t.playingIds, a, t.plannedDiscards, n, r);
}
function Le(e) {
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
//#region src/game/serverActionSeq.ts
function Re() {
	return 1;
}
function ze(e, t) {
	let n = (t?.serverActionSeq ?? 0) + 1;
	return {
		...e,
		serverActionSeq: n
	};
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
function Be(e, t) {
	let n = typeof t == "object" && t ? t.dealerId : t, r = typeof t == "object" && t ? t.actionOrder : e.dealOrder, i = typeof t == "object" && t && t.maxDrawDiscards != null ? t.maxDrawDiscards : x(e.participantIds.length), a = typeof t == "object" && t ? t.cinchEnabled === !0 : !1, o = typeof t == "object" && t && t.initialPhase ? t.initialPhase : F.DRAW, s = typeof t == "object" && t ? t.handDecision ?? null : null, c = {
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
		handDecision: s,
		serverActionSeq: Re()
	}, l = {};
	for (let [t, n] of Object.entries(e.privateHands)) l[t] = { cards: G(n) };
	return {
		publicHand: c,
		privateHandsByPlayer: l
	};
}
function Ve(e, t) {
	let n = B(t.seatedIds?.length ? t.seatedIds : e.participantIds, t.dealerId, !1);
	return Be(e, {
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
function He(e, t) {
	let n = E(e, t);
	return n.length ? n.reduce((e, t) => w(t) >= w(e) ? t : e) : null;
}
function Ue(e) {
	if (!e.cinchEnabled) return !1;
	let t = E(e.hand, e.trumpSuit);
	return t.filter((e) => w(e) >= 13).length >= 3 && t.length > 0;
}
function We(e, t) {
	let n = He(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function Ge(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => K([e.card])[0]) : [];
}
function q(e) {
	let t = e.currentTrick ?? null, n = Ge(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function Ke(e) {
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
	if (e.isLeading || e.trickPlays.length === 0) return Ue(e) && !We(n, e) ? {
		allowed: !1,
		reason: "Cinch: play your highest trump",
		code: "CINCH_HIGHEST_TRUMP"
	} : { allowed: !0 };
	let r = e.leadSuit ?? e.trickPlays[0]?.suit;
	return r ? E(e.hand, r).length > 0 ? n.suit === r ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must follow suit",
		code: "MUST_FOLLOW_SUIT"
	} : E(e.hand, e.trumpSuit).length > 0 ? T(n, e.trumpSuit) ? { allowed: !0 } : {
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
function qe(e, t, n) {
	let r = e.filter((e) => !T(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => w(t) > w(e) ? t : e) : null;
}
function Je(e, t) {
	let n = e.filter((e) => T(e, t));
	return n.length ? n.reduce((e, t) => w(t) > w(e) ? t : e) : null;
}
function X(e, t) {
	return w(e) > w(t);
}
function Ye(e) {
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
	let n = Ye(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = J(n, r);
			i.allowed ? e.push(r) : Y(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? E(n.hand, r) : [], a = E(n.hand, n.trumpSuit), o = r ? qe(n.trickPlays, r, n.trumpSuit) : null, s = Je(n.trickPlays, n.trumpSuit), c;
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
function Xe(e, t, n = {}) {
	let r = Ye(e), i = J(r, t);
	if (Y(n, r, t, i), !i.allowed) return {
		ok: !1,
		code: i.code ?? "MUST_BEAT_LED_SUIT",
		message: i.reason ?? "Illegal play"
	};
	if (r.isLeading || r.trickPlays.length === 0) return { ok: !0 };
	if (!Z(e, n).includes(t)) {
		let n = e.hand[t], r = e.leadSuit, i = r ? E(e.hand, r) : [], a = E(e.hand, e.trumpSuit), o = r ? Je(e.trickPlays, e.trumpSuit) : null;
		return r && i.length && n.suit !== r ? {
			ok: !1,
			code: "MUST_FOLLOW_SUIT",
			message: "You must follow suit"
		} : r && !i.length && a.length && !T(n, e.trumpSuit) ? {
			ok: !1,
			code: "MUST_TRUMP",
			message: "You must play a trump when void in the led suit"
		} : o && T(n, e.trumpSuit) && !X(n, o) ? {
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
	let r = e.filter((e) => T(e.card, n));
	if (r.length) return r.reduce((e, t) => w(t.card) > w(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => w(t.card) > w(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
var Ze = 5;
function Qe(e) {
	let t = j(e.playerId, e.privateHand, e.publicHand), n = (e.publicHand.playedCards?.length ?? 0) === 0 && (e.publicHand.currentTrick?.plays?.length ?? 0) === 0 && Object.values(e.publicHand.tricksByPlayer ?? {}).every((e) => (e ?? 0) === 0), r = $e({
		publicHand: e.publicHand,
		playerHand: t,
		playerId: e.playerId,
		cardIndex: e.cardIndex,
		actionOrder: e.actionOrder,
		cinchEnabled: e.cinchEnabled
	}), i = t[e.cardIndex], a = r.publicHand;
	a = e.publicHand.trumpUpcard && (n || i && N(i, e.publicHand)) ? {
		...a,
		trumpUpcard: null
	} : P(a);
	let o = M(e.playerId, r.playerHand, a);
	return {
		...r,
		publicHand: a,
		privateHand: o,
		playerHand: o
	};
}
function $e(e) {
	let { publicHand: t, playerId: r, cardIndex: i } = e, a = e.actionOrder.length > 0 ? e.actionOrder : o(t);
	if (t.phase !== F.PLAY) throw Error("Not in trick-play phase");
	if (t.turnPlayerId !== r) throw Error("Not your turn");
	let s = t.currentTrick;
	if (!s) throw Error("No active trick");
	let { isLeading: c, leadSuit: l, trickIndex: u } = q(t), d = Xe(Ke({
		hand: e.playerHand,
		publicHand: t
	}), i, {
		dealerSeat: t.dealerId ?? null,
		leaderSeat: s.leadPlayerId ?? null,
		currentTurnSeat: r,
		trickIndex: u
	});
	if (!d.ok) throw Error(d.message);
	let f = e.playerHand[i], p = se(e.playerHand, i), m = {
		playerId: r,
		card: W(f)
	}, h = [...s.plays, m], g = c ? f.suit : l, ee = t.participantIds;
	if (!(h.length >= ee.length)) {
		let e = n(a, r), i = {
			...s,
			leadSuit: g,
			plays: h
		};
		return {
			publicHand: {
				...t,
				actionOrder: a,
				leadSuit: g,
				currentTrick: i,
				turnPlayerId: e
			},
			playerHand: p,
			trickResolved: !1,
			handComplete: !1
		};
	}
	let _ = Q(h.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})), g, t.trumpSuit), v = { ...t.tricksByPlayer };
	v[_] = (v[_] ?? 0) + 1;
	let y = [...t.playedCards, ...h.map((e) => ({
		...e,
		trickNumber: s.trickNumber
	}))];
	if (Object.values(v).reduce((e, t) => e + (t || 0), 0) >= Ze) return {
		publicHand: {
			...t,
			tricksByPlayer: v,
			playedCards: y,
			currentTrick: null,
			leadSuit: null,
			turnPlayerId: null
		},
		playerHand: p,
		trickResolved: !0,
		handComplete: !0
	};
	let b = s.trickNumber + 1;
	return {
		publicHand: {
			...t,
			actionOrder: a,
			tricksByPlayer: v,
			playedCards: y,
			leadSuit: null,
			turnPlayerId: _,
			currentTrick: {
				trickNumber: b,
				leadPlayerId: _,
				leadSuit: null,
				plays: []
			}
		},
		playerHand: p,
		trickResolved: !0,
		handComplete: !1
	};
}
function et(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: w(e),
		trump: T(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function tt(e, t) {
	let n = Z(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => w(e[n]) > w(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => w(e[n]) < w(e[t]) ? n : t);
	let i = n.filter((n) => Q([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => w(e[n]) < w(e[t]) ? n : t);
}
//#endregion
//#region src/game/botDecisions.ts
function $(e, t) {
	let n = 0;
	for (let r of e) {
		let e = w(r);
		T(r, t) ? n += 2.5 + e / 13 : e >= 12 ? n += 1.8 : e >= 11 ? n += 1.2 : e >= 10 ? n += .8 : e >= 9 ? n += .4 : e >= 7 && (n += .15);
	}
	return n;
}
function nt(e, t) {
	return e.length < 5 ? !1 : $(e, t) < 2.25;
}
function rt(e, t) {
	return e.length < 5 ? !1 : $(e, t) < 2;
}
//#endregion
export { s as CARDS_PER_PLAYER, ge as CardUniquenessError, z as HAND_DECISION_MS, je as HAND_DECISION_SECONDS, F as HAND_PHASE, Ne as activateHandDecision, t as activePlayerOrder, Ae as advanceAfterDraw, R as allDrawsComplete, f as allEligibleDrawsComplete, Fe as applyDecisionPass, Pe as applyDecisionPlay, Ie as applyDecisionTimeout, Ee as applyDraw, ke as applyDrawFold, pe as applyDrawPile, $e as applyPlayCard, De as applyPlayerDraw, Qe as applyPlayerPlayCard, ve as assertCardUniqueness, oe as assignTrumpUpcard, et as botDrawDiscardIndices, tt as botPlayCardIndex, nt as botShouldFoldDraw, rt as botShouldPassDecision, B as buildHandDecision, Ke as buildPlayValidationState, J as canPlayCard, p as canonicalHandDrawMetrics, S as cardKey, C as cardsEqual, Se as cardsRemainingInHand, P as clearTrumpUpcardIfFirstAction, _ as createDeck, ue as createDrawPileFromStock, V as currentDecisionPlayer, ie as dealInitialHand, H as dealerMustPlayTrumpAce, Le as decisionAsEnrollmentView, U as decisionPatchAfterStep, K as deserializeCards, Ce as displayHoleCardCount, ne as drawCardsFromDeck, u as drawCompletedAmongEligible, fe as drawFromPile, l as drawTotalEligible, be as effectiveIndexDiscardsTrump, j as effectivePlayerHand, le as emptyDrawPile, $ as estimateHandStrength, i as firstLeaderFromDealerLeft, L as firstUnresolvedDrawTurn, Z as getLegalPlayIndices, c as handEligibleParticipantIds, Re as initialServerActionSeq, Te as isBeforeFirstHandAction, T as isTrump, Y as logPlayValidation, x as maxDrawDiscards, n as nextActivePlayerClockwise, I as nextPlayerInOrder, q as normalizeTrickForPlay, r as openingLeaderId, me as pileFromPublicHand, N as playedTrumpUpcard, e as playerOrderFromDealer, M as privateHandFromEffective, he as publicHandWithPile, w as rankValue, re as remainingDeckCount, o as resolveActionOrder, a as resolveSeatRing, Q as resolveTrickWinner, Oe as revealToDraw, W as serializeCard, G as serializeCards, Be as serializeHandState, Ve as serializePagatRevealHand, b as shuffleDeck, te as shuffledDeckFromSeed, d as staleDrawCompletedIds, D as totalAvailableReplacements, ye as trumpOnTable, A as trumpOwnerId, we as trumpRevealMirroredInHolderHand, Xe as validatePlayIndex, ze as withServerActionSeq };
