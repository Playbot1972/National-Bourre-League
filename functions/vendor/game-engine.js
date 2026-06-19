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
	DRAW: "draw",
	PLAY: "play"
};
//#endregion
//#region src/game/serialize.ts
function y(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function b(e) {
	return e.map(y);
}
function x(e, t) {
	let n = typeof t == "object" && t ? t.dealerId : t, r = typeof t == "object" && t ? t.actionOrder : e.dealOrder, i = typeof t == "object" && t && t.maxDrawDiscards != null ? t.maxDrawDiscards : _(e.participantIds.length), a = typeof t == "object" && t ? t.cinchEnabled === !0 : !1, o = {
		phase: v.DRAW,
		participantIds: [...e.participantIds],
		dealerId: n,
		trumpHolderId: e.trumpHolderId,
		trumpSuit: e.trumpSuit,
		trumpUpcard: y(e.trumpUpcard),
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
	for (let [t, n] of Object.entries(e.privateHands)) s[t] = { cards: b(n) };
	return {
		publicHand: o,
		privateHandsByPlayer: s
	};
}
function S(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
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
function O(e, t) {
	return e.filter((e, n) => n !== t);
}
function k(e, t) {
	let n = [...new Set(t)].sort((e, t) => t - e), r = [...e];
	for (let e of n) e < 0 || e >= r.length || r.splice(e, 1);
	return r;
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
	let r = C(t);
	return e.get(r) ? [r] : (e.set(r, n), []);
}
function ee(e) {
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r = e.deckNextIndex; r < e.deck.length; r += 1) n.push(...j(t, e.deck[r], `deck[${r}]`));
	for (let [r, i] of Object.entries(e.privateHands)) for (let e = 0; e < i.length; e += 1) n.push(...j(t, i[e], `hand:${r}[${e}]`));
	if (e.trumpUpcard) {
		let r = C(e.trumpUpcard);
		((e.trumpHolderId ? e.privateHands[e.trumpHolderId] : void 0)?.some((e) => C(e) === r) ?? !1) || n.push(...j(t, e.trumpUpcard, "trumpUpcard"));
	}
	for (let r of e.currentTrick?.plays ?? []) n.push(...j(t, r.card, `trick:${r.playerId}`));
	for (let r of e.playedCards ?? []) n.push(...j(t, r.card, `played:t${r.trickNumber}`));
	if (n.length) {
		let e = [...new Set(n)];
		throw new A(`Duplicate card(s) in game state: ${e.map((e) => `${e} (${t.get(e)})`).join(", ")}`, e);
	}
}
function M(e) {
	return e.trumpHolderId ?? e.dealerId ?? null;
}
function N(e) {
	return !!e.trumpUpcard;
}
function P(e, t, n) {
	let r = [...t], i = M(n), a = n.trumpUpcard;
	return !i || e !== i || !a ? r : r.some((e) => w(e, a)) ? r.filter((e) => !w(e, a)) : (r.push(a), r);
}
function F(e, t, n) {
	let r = M(n), i = n.trumpUpcard;
	return r && e === r && i && !t.some((e) => w(e, i)) ? [...t, i] : [...t];
}
function I(e, t, n, r) {
	let i = M(r);
	return !i || e !== i || !r.trumpUpcard ? !1 : t.some((e) => {
		let t = n[e];
		return t && w(t, r.trumpUpcard);
	});
}
function L(e, t) {
	return !!(t.trumpUpcard && w(e, t.trumpUpcard));
}
var R = 5;
function z(e, t) {
	let n = (e.playedCards ?? []).filter((e) => e.playerId === t).length, r = (e.currentTrick?.plays ?? []).filter((e) => e.playerId === t).length;
	return Math.max(0, R - n - r);
}
function B(e, t, n = !1) {
	let r = z(e, t);
	return n ? r : M(e) === t && N(e) ? Math.max(0, r - 1) : r;
}
function V(e, t) {
	if (!e.trumpUpcard || !e.trumpHolderId) return !1;
	let n = t[e.trumpHolderId];
	return n?.length ? n.some((t) => w(t, e.trumpUpcard)) : !1;
}
//#endregion
//#region src/game/draw.ts
function H(e) {
	let t = [...new Set(e.discardIndices)].sort((e, t) => e - t);
	if (t.some((t) => t < 0 || t >= e.hand.length)) throw Error("Invalid discard selection");
	if (t.length > e.maxDiscards) throw Error(`You may discard at most ${e.maxDiscards} cards`);
	if (t.length > 0 && t.length > e.maxDiscards) throw Error(`Draw limit is ${e.maxDiscards}`);
	let n = k(e.hand, t), r = t.length;
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
function G(e) {
	let t = P(e.playerId, e.privateHand, e.publicHand), n = H({
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
function K(e, t, n) {
	let r = [...new Set([...e.drawCompletedIds ?? [], n])], i = e.participantIds;
	if (!W(i, r)) {
		let i = U(t, n);
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
function q(e, t, n) {
	let r = e.filter((e) => !E(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => T(t) > T(e) ? t : e) : null;
}
function J(e, t) {
	let n = e.filter((e) => E(e, t));
	return n.length ? n.reduce((e, t) => T(t) > T(e) ? t : e) : null;
}
function Y(e, t) {
	return T(e) > T(t);
}
function X(e) {
	let { hand: t, trumpSuit: n, leadSuit: r, trickPlays: i, isLeading: a } = e;
	if (!t.length) return [];
	if (a || !r || i.length === 0) {
		if (e.cinchEnabled && te(t, n) >= 3) {
			let e = D(t, n);
			if (e.length) {
				let n = e.reduce((e, t) => T(e) >= T(t) ? e : t), r = t.findIndex((e) => e.rank === n.rank && e.suit === n.suit);
				return r >= 0 ? [r] : [];
			}
		}
		return t.map((e, t) => t);
	}
	let o = D(t, r), s = D(t, n), c = q(i, r, n), l = J(i, n), u;
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
		let n = e.hand[t], r = e.leadSuit, i = r ? D(e.hand, r) : [], a = D(e.hand, e.trumpSuit), o = r ? J(e.trickPlays, e.trumpSuit) : null;
		return r && i.length && n.suit !== r ? {
			ok: !1,
			code: "MUST_FOLLOW_SUIT",
			message: "You must follow suit"
		} : r && !i.length && a.length && !E(n, e.trumpSuit) ? {
			ok: !1,
			code: "MUST_TRUMP",
			message: "You must play a trump when void in the led suit"
		} : o && E(n, e.trumpSuit) && !Y(n, o) ? {
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
function te(e, t) {
	return D(e, t).sort((e, t) => T(t) - T(e)).filter((e) => T(e) >= 13).length;
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
var ne = 5;
function re(e, t) {
	return e[(e.indexOf(t) + 1) % e.length];
}
function ie(e) {
	let t = P(e.playerId, e.privateHand, e.publicHand), n = (e.publicHand.playedCards?.length ?? 0) === 0 && (e.publicHand.currentTrick?.plays?.length ?? 0) === 0 && Object.values(e.publicHand.tricksByPlayer ?? {}).every((e) => (e ?? 0) === 0), r = $({
		publicHand: e.publicHand,
		playerHand: t,
		playerId: e.playerId,
		cardIndex: e.cardIndex,
		actionOrder: e.actionOrder,
		cinchEnabled: e.cinchEnabled
	}), i = t[e.cardIndex], a = r.publicHand;
	e.publicHand.trumpUpcard && (n || i && L(i, e.publicHand)) && (a = {
		...a,
		trumpUpcard: null
	});
	let o = F(e.playerId, r.playerHand, a);
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
	let d = e.playerHand[r], f = O(e.playerHand, r), p = {
		playerId: n,
		card: y(d)
	}, m = [...o.plays, p], h = c ? d.suit : l, g = t.participantIds;
	if (!(m.length >= g.length)) {
		let e = re(i, n), r = {
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
	})), h, t.trumpSuit), b = { ...t.tricksByPlayer };
	b[_] = (b[_] ?? 0) + 1;
	let x = [...t.playedCards, ...m.map((e) => ({
		...e,
		trickNumber: o.trickNumber
	}))];
	if (Object.values(b).reduce((e, t) => e + (t || 0), 0) >= ne) return {
		publicHand: {
			...t,
			tricksByPlayer: b,
			playedCards: x,
			currentTrick: null,
			leadSuit: null,
			turnPlayerId: null
		},
		playerHand: f,
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
			turnPlayerId: _,
			currentTrick: {
				trickNumber: S,
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
function ae(e, t, n) {
	return n <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: T(e),
		trump: E(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, n).map((e) => e.index);
}
function oe(e, t) {
	let n = X(t);
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
export { p as CARDS_PER_PLAYER, A as CardUniquenessError, v as HAND_PHASE, f as activePlayerOrder, K as advanceAfterDraw, W as allDrawsComplete, H as applyDraw, $ as applyPlayCard, G as applyPlayerDraw, ie as applyPlayerPlayCard, ee as assertCardUniqueness, g as assignTrumpUpcard, ae as botDrawDiscardIndices, oe as botPlayCardIndex, C as cardKey, w as cardsEqual, z as cardsRemainingInHand, i as createDeck, m as dealInitialHand, S as deserializeCards, B as displayHoleCardCount, l as drawCardsFromDeck, I as effectiveIndexDiscardsTrump, P as effectivePlayerHand, X as getLegalPlayIndices, E as isTrump, _ as maxDrawDiscards, U as nextPlayerInOrder, L as playedTrumpUpcard, d as playerOrderFromDealer, F as privateHandFromEffective, T as rankValue, u as remainingDeckCount, Q as resolveTrickWinner, y as serializeCard, b as serializeCards, x as serializeHandState, s as shuffleDeck, c as shuffledDeckFromSeed, N as trumpOnTable, M as trumpOwnerId, V as trumpRevealMirroredInHolderHand, Z as validatePlayIndex };
