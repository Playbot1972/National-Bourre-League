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
//#region src/game/cardUtils.ts
function d(e) {
	return `${e.rank}:${e.suit}`;
}
function f(e, t) {
	return e.rank === t.rank && e.suit === t.suit;
}
function p(t) {
	return e[t.rank];
}
function m(e, t) {
	return e.suit === t;
}
function h(e, t) {
	return e.filter((e) => e.suit === t);
}
function g(e, t) {
	return e.findIndex((e) => f(e, t));
}
function _(e, t) {
	return e.filter((e, n) => n !== t);
}
function v(e, t) {
	let n = [...new Set(t)].sort((e, t) => t - e), r = [...e];
	for (let e of n) e < 0 || e >= r.length || r.splice(e, 1);
	return r;
}
//#endregion
//#region src/game/playerOrder.ts
function y(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function b(e, t, n) {
	let r = y(e, n), i = new Set(t);
	return r.filter((e) => i.has(e));
}
var x = 5;
//#endregion
//#region src/game/deal.ts
function S(e) {
	let t = [...new Set(e.participantIds.filter(Boolean))];
	if (t.length < 2) throw Error("Need at least two participants to deal");
	let n = b(e.dealerId, t, e.sortedPlayerIds);
	if (n.length < 2) throw Error("Need at least two seated participants in deal order");
	let r = e.seed ?? Date.now(), a = s(i(), r), o = Object.fromEntries(n.map((e) => [e, []])), c = 0;
	for (let e = 0; e < 5; e += 1) for (let e of n) o[e].push(a[c]), c += 1;
	let l = C(e.dealerId, n, o), u = o[e.dealerId && n.includes(e.dealerId) ? e.dealerId : n[n.length - 1]], d = g(u, l);
	d >= 0 && u.splice(d, 1);
	let f = Object.fromEntries(t.map((e) => [e, 0]));
	return {
		dealOrder: n,
		participantIds: t,
		privateHands: o,
		trumpUpcard: l,
		trumpSuit: l.suit,
		remainingDeck: a.slice(c),
		turnPlayerId: n[0],
		tricksByPlayer: f,
		deckSeed: r,
		deckNextIndex: c
	};
}
function C(e, t, n) {
	if (e && t.includes(e)) {
		let t = n[e];
		if (t?.length === 5) return t[4];
	}
	let r = n[t[t.length - 1]];
	if (!r?.length) throw Error("Cannot assign trump upcard — no cards dealt");
	return r[r.length - 1];
}
//#endregion
//#region src/game/drawLimit.ts
function w(e, t) {
	let n = (t ?? "").toLowerCase();
	if (n.includes("no draw")) return 0;
	let r = Math.max(2, e || 2);
	return r >= 8 ? 2 : r >= 7 ? 3 : r >= 6 || n.includes("up to 4") ? 4 : 5;
}
//#endregion
//#region src/game/types.ts
var T = {
	DRAW: "draw",
	PLAY: "play"
};
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
	let n = typeof t == "object" && t ? t.dealerId : t, r = typeof t == "object" && t ? t.actionOrder : e.dealOrder, i = typeof t == "object" && t && t.maxDrawDiscards != null ? t.maxDrawDiscards : w(e.participantIds.length), a = typeof t == "object" && t ? t.cinchEnabled === !0 : !1, o = {
		phase: T.DRAW,
		participantIds: [...e.participantIds],
		dealerId: n,
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
		cinchEnabled: a
	}, s = {};
	for (let [t, n] of Object.entries(e.privateHands)) s[t] = { cards: D(n) };
	return {
		publicHand: o,
		privateHandsByPlayer: s
	};
}
function k(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/invariants.ts
var A = class extends Error {
	duplicates;
	constructor(e, t) {
		super(e), this.name = "CardUniquenessError", this.duplicates = t;
	}
};
function j(e, t, n) {
	let r = d(t);
	return e.get(r) ? [r] : (e.set(r, n), []);
}
function M(e) {
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r = e.deckNextIndex; r < e.deck.length; r += 1) n.push(...j(t, e.deck[r], `deck[${r}]`));
	e.trumpUpcard && n.push(...j(t, e.trumpUpcard, "trumpUpcard"));
	for (let [r, i] of Object.entries(e.privateHands)) for (let e = 0; e < i.length; e += 1) n.push(...j(t, i[e], `hand:${r}[${e}]`));
	for (let r of e.currentTrick?.plays ?? []) n.push(...j(t, r.card, `trick:${r.playerId}`));
	for (let r of e.playedCards ?? []) n.push(...j(t, r.card, `played:t${r.trickNumber}`));
	if (n.length) {
		let e = [...new Set(n)];
		throw new A(`Duplicate card(s) in game state: ${e.map((e) => `${e} (${t.get(e)})`).join(", ")}`, e);
	}
}
function N(e) {
	return e.dealerId ?? null;
}
function P(e, t, n) {
	let r = [...t], i = N(n);
	return i && e === i && n.trumpUpcard && !r.some((e) => f(e, n.trumpUpcard)) && r.push(n.trumpUpcard), r;
}
function F(e, t, n) {
	let r = N(n);
	return !r || e !== r || !n.trumpUpcard ? [...t] : t.filter((e) => !f(e, n.trumpUpcard));
}
function I(e, t, n, r) {
	let i = N(r);
	return !i || e !== i || !r.trumpUpcard ? !1 : t.some((e) => {
		let t = n[e];
		return t && f(t, r.trumpUpcard);
	});
}
function L(e, t) {
	return !!(t.trumpUpcard && f(e, t.trumpUpcard));
}
//#endregion
//#region src/game/draw.ts
function R(e) {
	let t = [...new Set(e.discardIndices)].sort((e, t) => e - t);
	if (t.some((t) => t < 0 || t >= e.hand.length)) throw Error("Invalid discard selection");
	if (t.length > e.maxDiscards) throw Error(`You may discard at most ${e.maxDiscards} cards`);
	if (t.length > 0 && t.length > e.maxDiscards) throw Error(`Draw limit is ${e.maxDiscards}`);
	let n = v(e.hand, t), r = t.length;
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
function z(e, t) {
	let n = e.indexOf(t);
	return n < 0 ? e[0] ?? null : e[(n + 1) % e.length] ?? null;
}
function B(e, t) {
	let n = new Set(t);
	return e.every((e) => n.has(e));
}
function V(e) {
	let t = P(e.playerId, e.privateHand, e.publicHand), n = R({
		hand: t,
		discardIndices: e.discardIndices,
		deck: e.deck,
		deckNextIndex: e.deckNextIndex,
		maxDiscards: e.maxDiscards
	}), r = I(e.playerId, e.discardIndices, t, e.publicHand), i = {
		...e.publicHand,
		deckNextIndex: n.deckNextIndex,
		remainingDeckCount: Math.max(0, e.deck.length - n.deckNextIndex)
	};
	return r && (i = {
		...i,
		trumpUpcard: null
	}), {
		privateHand: F(e.playerId, n.hand, i),
		publicHand: i,
		deckNextIndex: n.deckNextIndex,
		discarded: n.discarded
	};
}
function H(e, t, n) {
	let r = [...new Set([...e.drawCompletedIds ?? [], n])], i = e.participantIds;
	if (!B(i, r)) {
		let i = z(t, n);
		return {
			...e,
			drawCompletedIds: r,
			turnPlayerId: i
		};
	}
	let a = t[0] ?? n;
	return {
		...e,
		phase: T.PLAY,
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
function U(e, t, n) {
	let r = e.filter((e) => !m(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => p(t) > p(e) ? t : e) : null;
}
function W(e, t) {
	let n = e.filter((e) => m(e, t));
	return n.length ? n.reduce((e, t) => p(t) > p(e) ? t : e) : null;
}
function G(e, t) {
	return p(e) > p(t);
}
function K(e) {
	let { hand: t, trumpSuit: n, leadSuit: r, trickPlays: i, isLeading: a } = e;
	if (!t.length) return [];
	if (a || !r || i.length === 0) {
		if (e.cinchEnabled && J(t, n) >= 3) {
			let e = h(t, n);
			if (e.length) {
				let n = e.reduce((e, t) => p(e) >= p(t) ? e : t), r = t.findIndex((e) => e.rank === n.rank && e.suit === n.suit);
				return r >= 0 ? [r] : [];
			}
		}
		return t.map((e, t) => t);
	}
	let o = h(t, r), s = h(t, n), c = U(i, r, n), l = W(i, n), u;
	if (o.length > 0) {
		if (u = o, !l && c) {
			let e = o.filter((e) => G(e, c));
			e.length && (u = e);
		}
	} else if (s.length > 0) {
		if (u = s, l) {
			let e = s.filter((e) => G(e, l));
			e.length && (u = e);
		}
	} else u = [...t];
	let d = [];
	for (let e = 0; e < t.length; e += 1) u.some((n) => n.rank === t[e].rank && n.suit === t[e].suit) && d.push(e);
	return d;
}
function q(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		ok: !1,
		code: "INVALID_INDEX",
		message: "Invalid card selection"
	};
	if (!K(e).includes(t)) {
		let n = e.hand[t], r = e.leadSuit, i = r ? h(e.hand, r) : [], a = h(e.hand, e.trumpSuit), o = r ? W(e.trickPlays, e.trumpSuit) : null;
		return r && i.length && n.suit !== r ? {
			ok: !1,
			code: "MUST_FOLLOW_SUIT",
			message: "You must follow suit"
		} : r && !i.length && a.length && !m(n, e.trumpSuit) ? {
			ok: !1,
			code: "MUST_TRUMP",
			message: "You must play a trump when void in the led suit"
		} : o && m(n, e.trumpSuit) && !G(n, o) ? {
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
function J(e, t) {
	return h(e, t).sort((e, t) => p(t) - p(e)).filter((e) => p(e) >= 13).length;
}
//#endregion
//#region src/game/trick.ts
function Y(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => m(e.card, n));
	if (r.length) return r.reduce((e, t) => p(t.card) > p(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => p(t.card) > p(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
var X = 5;
function Z(e, t) {
	return e[(e.indexOf(t) + 1) % e.length];
}
function Q(e) {
	let t = P(e.playerId, e.privateHand, e.publicHand), n = $({
		publicHand: e.publicHand,
		playerHand: t,
		playerId: e.playerId,
		cardIndex: e.cardIndex,
		actionOrder: e.actionOrder,
		cinchEnabled: e.cinchEnabled
	}), r = t[e.cardIndex], i = n.publicHand;
	r && L(r, e.publicHand) && (i = {
		...i,
		trumpUpcard: null
	});
	let a = F(e.playerId, n.playerHand, i);
	return {
		...n,
		publicHand: i,
		privateHand: a,
		playerHand: a
	};
}
function $(e) {
	let { publicHand: t, playerId: n, cardIndex: r, actionOrder: i, cinchEnabled: a } = e;
	if (t.phase !== T.PLAY) throw Error("Not in trick-play phase");
	if (t.turnPlayerId !== n) throw Error("Not your turn");
	let o = t.currentTrick;
	if (!o) throw Error("No active trick");
	let s = o.plays.map((e) => ({
		rank: e.card.rank,
		suit: e.card.suit
	})), c = o.plays.length === 0, l = o.leadSuit ?? (c ? null : s[0]?.suit), u = q({
		hand: e.playerHand,
		trumpSuit: t.trumpSuit,
		leadSuit: c ? null : l,
		trickPlays: s,
		isLeading: c,
		cinchEnabled: a
	}, r);
	if (!u.ok) throw Error(u.message);
	let d = e.playerHand[r], f = _(e.playerHand, r), p = {
		playerId: n,
		card: E(d)
	}, m = [...o.plays, p], h = c ? d.suit : l, g = t.participantIds;
	if (!(m.length >= g.length)) {
		let e = Z(i, n), r = {
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
	let v = Y(m.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})), h, t.trumpSuit), y = { ...t.tricksByPlayer };
	y[v] = (y[v] ?? 0) + 1;
	let b = [...t.playedCards, ...m.map((e) => ({
		...e,
		trickNumber: o.trickNumber
	}))];
	if (Object.values(y).reduce((e, t) => e + (t || 0), 0) >= X) return {
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
			turnPlayerId: v,
			currentTrick: {
				trickNumber: x,
				leadPlayerId: v,
				leadSuit: null,
				plays: []
			}
		},
		playerHand: f,
		trickResolved: !0,
		handComplete: !1
	};
}
function ee(e, t, n) {
	return n <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: p(e),
		trump: m(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, n).map((e) => e.index);
}
function te(e, t) {
	let n = K(t);
	if (!n.length) return 0;
	let r = n[0], i = p(e[r]);
	for (let t of n) {
		let n = p(e[t]);
		n < i && (r = t, i = n);
	}
	return r;
}
//#endregion
export { x as CARDS_PER_PLAYER, A as CardUniquenessError, T as HAND_PHASE, b as activePlayerOrder, H as advanceAfterDraw, B as allDrawsComplete, R as applyDraw, $ as applyPlayCard, V as applyPlayerDraw, Q as applyPlayerPlayCard, M as assertCardUniqueness, C as assignTrumpUpcard, ee as botDrawDiscardIndices, te as botPlayCardIndex, d as cardKey, f as cardsEqual, i as createDeck, S as dealInitialHand, k as deserializeCards, l as drawCardsFromDeck, I as effectiveIndexDiscardsTrump, P as effectivePlayerHand, K as getLegalPlayIndices, m as isTrump, w as maxDrawDiscards, z as nextPlayerInOrder, L as playedTrumpUpcard, y as playerOrderFromDealer, F as privateHandFromEffective, p as rankValue, u as remainingDeckCount, Y as resolveTrickWinner, E as serializeCard, D as serializeCards, O as serializeHandState, s as shuffleDeck, c as shuffledDeckFromSeed, q as validatePlayIndex };
