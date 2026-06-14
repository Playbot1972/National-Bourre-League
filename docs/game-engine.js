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
	let l = h(e.dealerId, n, o), u = Object.fromEntries(t.map((e) => [e, 0]));
	return {
		dealOrder: n,
		participantIds: t,
		privateHands: o,
		trumpUpcard: l,
		trumpSuit: l.suit,
		remainingDeck: a.slice(c),
		turnPlayerId: n[0],
		tricksByPlayer: u,
		deckSeed: r,
		deckNextIndex: c
	};
}
function h(e, t, n) {
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
function g(e, t) {
	let n = (t ?? "").toLowerCase();
	if (n.includes("no draw")) return 0;
	let r = Math.max(2, e || 2);
	return r >= 8 ? 2 : r >= 7 ? 3 : r >= 6 || n.includes("up to 4") ? 4 : 5;
}
//#endregion
//#region src/game/types.ts
var _ = {
	DRAW: "draw",
	PLAY: "play"
};
//#endregion
//#region src/game/serialize.ts
function v(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function y(e) {
	return e.map(v);
}
function b(e, t) {
	let n = typeof t == "object" && t ? t.dealerId : t, r = typeof t == "object" && t ? t.actionOrder : e.dealOrder, i = typeof t == "object" && t && t.maxDrawDiscards != null ? t.maxDrawDiscards : g(e.participantIds.length), a = typeof t == "object" && t ? t.cinchEnabled === !0 : !1, o = {
		phase: _.DRAW,
		participantIds: [...e.participantIds],
		dealerId: n,
		trumpSuit: e.trumpSuit,
		trumpUpcard: v(e.trumpUpcard),
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
	for (let [t, n] of Object.entries(e.privateHands)) s[t] = { cards: y(n) };
	return {
		publicHand: o,
		privateHandsByPlayer: s
	};
}
function x(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/cardUtils.ts
function S(e) {
	return `${e.rank}:${e.suit}`;
}
function C(e, t) {
	return e.rank === t.rank && e.suit === t.suit;
}
function w(t) {
	return e[t.rank];
}
function T(e, t) {
	return e.suit === t;
}
function E(e, t) {
	return e.filter((e) => e.suit === t);
}
function D(e, t) {
	return e.filter((e, n) => n !== t);
}
function O(e, t) {
	let n = [...new Set(t)].sort((e, t) => t - e), r = [...e];
	for (let e of n) e < 0 || e >= r.length || r.splice(e, 1);
	return r;
}
//#endregion
//#region src/game/draw.ts
function k(e) {
	let t = [...new Set(e.discardIndices)].sort((e, t) => e - t);
	if (t.some((t) => t < 0 || t >= e.hand.length)) throw Error("Invalid discard selection");
	if (t.length > e.maxDiscards) throw Error(`You may discard at most ${e.maxDiscards} cards`);
	if (t.length > 0 && t.length > e.maxDiscards) throw Error(`Draw limit is ${e.maxDiscards}`);
	let n = O(e.hand, t), r = t.length;
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
function A(e, t) {
	let n = e.indexOf(t);
	return n < 0 ? e[0] ?? null : e[(n + 1) % e.length] ?? null;
}
function j(e, t) {
	let n = new Set(t);
	return e.every((e) => n.has(e));
}
function M(e, t, n) {
	let r = [...new Set([...e.drawCompletedIds ?? [], n])], i = e.participantIds;
	if (!j(i, r)) {
		let i = A(t, n);
		return {
			...e,
			drawCompletedIds: r,
			turnPlayerId: i
		};
	}
	let a = t[0] ?? n;
	return {
		...e,
		phase: _.PLAY,
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
function N(e, t, n) {
	let r = e.filter((e) => !T(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => w(t) > w(e) ? t : e) : null;
}
function P(e, t) {
	let n = e.filter((e) => T(e, t));
	return n.length ? n.reduce((e, t) => w(t) > w(e) ? t : e) : null;
}
function F(e, t) {
	return w(e) > w(t);
}
function I(e) {
	let { hand: t, trumpSuit: n, leadSuit: r, trickPlays: i, isLeading: a } = e;
	if (!t.length) return [];
	if (a || !r || i.length === 0) {
		if (e.cinchEnabled && R(t, n) >= 3) {
			let e = E(t, n);
			if (e.length) {
				let n = e.reduce((e, t) => w(e) >= w(t) ? e : t), r = t.findIndex((e) => e.rank === n.rank && e.suit === n.suit);
				return r >= 0 ? [r] : [];
			}
		}
		return t.map((e, t) => t);
	}
	let o = E(t, r), s = E(t, n), c = N(i, r, n), l = P(i, n), u;
	if (o.length > 0) {
		if (u = o, !l && c) {
			let e = o.filter((e) => F(e, c));
			e.length && (u = e);
		}
	} else if (s.length > 0) {
		if (u = s, l) {
			let e = s.filter((e) => F(e, l));
			e.length && (u = e);
		}
	} else u = [...t];
	let d = [];
	for (let e = 0; e < t.length; e += 1) u.some((n) => n.rank === t[e].rank && n.suit === t[e].suit) && d.push(e);
	return d;
}
function L(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		ok: !1,
		code: "INVALID_INDEX",
		message: "Invalid card selection"
	};
	if (!I(e).includes(t)) {
		let n = e.hand[t], r = e.leadSuit, i = r ? E(e.hand, r) : [], a = E(e.hand, e.trumpSuit), o = r ? P(e.trickPlays, e.trumpSuit) : null;
		return r && i.length && n.suit !== r ? {
			ok: !1,
			code: "MUST_FOLLOW_SUIT",
			message: "You must follow suit"
		} : r && !i.length && a.length && !T(n, e.trumpSuit) ? {
			ok: !1,
			code: "MUST_TRUMP",
			message: "You must play a trump when void in the led suit"
		} : o && T(n, e.trumpSuit) && !F(n, o) ? {
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
function R(e, t) {
	return E(e, t).sort((e, t) => w(t) - w(e)).filter((e) => w(e) >= 13).length;
}
//#endregion
//#region src/game/trick.ts
function z(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => T(e.card, n));
	if (r.length) return r.reduce((e, t) => w(t.card) > w(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => w(t.card) > w(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
var B = 5;
function V(e, t) {
	return e[(e.indexOf(t) + 1) % e.length];
}
function H(e) {
	let { publicHand: t, playerId: n, cardIndex: r, actionOrder: i, cinchEnabled: a } = e;
	if (t.phase !== _.PLAY) throw Error("Not in trick-play phase");
	if (t.turnPlayerId !== n) throw Error("Not your turn");
	let o = t.currentTrick;
	if (!o) throw Error("No active trick");
	let s = o.plays.map((e) => ({
		rank: e.card.rank,
		suit: e.card.suit
	})), c = o.plays.length === 0, l = o.leadSuit ?? (c ? null : s[0]?.suit), u = L({
		hand: e.playerHand,
		trumpSuit: t.trumpSuit,
		leadSuit: c ? null : l,
		trickPlays: s,
		isLeading: c,
		cinchEnabled: a
	}, r);
	if (!u.ok) throw Error(u.message);
	let d = e.playerHand[r], f = D(e.playerHand, r), p = {
		playerId: n,
		card: v(d)
	}, m = [...o.plays, p], h = c ? d.suit : l, g = t.participantIds;
	if (!(m.length >= g.length)) {
		let e = V(i, n), r = {
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
	let y = z(m.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})), h, t.trumpSuit), b = { ...t.tricksByPlayer };
	b[y] = (b[y] ?? 0) + 1;
	let x = [...t.playedCards, ...m.map((e) => ({
		...e,
		trickNumber: o.trickNumber
	}))];
	if (Object.values(b).reduce((e, t) => e + (t || 0), 0) >= B) return {
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
			turnPlayerId: y,
			currentTrick: {
				trickNumber: S,
				leadPlayerId: y,
				leadSuit: null,
				plays: []
			}
		},
		playerHand: f,
		trickResolved: !0,
		handComplete: !1
	};
}
function U(e, t, n) {
	return n <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: w(e),
		trump: T(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, n).map((e) => e.index);
}
function W(e, t) {
	let n = I(t);
	if (!n.length) return 0;
	let r = n[0], i = w(e[r]);
	for (let t of n) {
		let n = w(e[t]);
		n < i && (r = t, i = n);
	}
	return r;
}
//#endregion
export { p as CARDS_PER_PLAYER, _ as HAND_PHASE, f as activePlayerOrder, M as advanceAfterDraw, j as allDrawsComplete, k as applyDraw, H as applyPlayCard, h as assignTrumpUpcard, U as botDrawDiscardIndices, W as botPlayCardIndex, S as cardKey, C as cardsEqual, i as createDeck, m as dealInitialHand, x as deserializeCards, l as drawCardsFromDeck, I as getLegalPlayIndices, T as isTrump, g as maxDrawDiscards, A as nextPlayerInOrder, d as playerOrderFromDealer, w as rankValue, u as remainingDeckCount, z as resolveTrickWinner, v as serializeCard, y as serializeCards, b as serializeHandState, s as shuffleDeck, c as shuffledDeckFromSeed, L as validatePlayIndex };
