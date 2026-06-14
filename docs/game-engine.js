//#region src/types.ts
var e = (e, t) => ({
	rank: e,
	suit: t
}), t = [
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
], n = [
	"spades",
	"hearts",
	"diamonds",
	"clubs"
];
function r() {
	let r = [];
	for (let i of n) for (let n of t) r.push(e(n, i));
	return r;
}
function i(e) {
	let t = e >>> 0;
	return () => {
		t += 1831565813;
		let e = Math.imul(t ^ t >>> 15, 1 | t);
		return e ^= e + Math.imul(e ^ e >>> 7, 61 | e), ((e ^ e >>> 14) >>> 0) / 4294967296;
	};
}
function a() {
	if (typeof crypto < "u" && crypto.getRandomValues) {
		let e = new Uint32Array(1);
		return crypto.getRandomValues(e), e[0] ?? Date.now();
	}
	return (Date.now() ^ Math.random() * 4294967296) >>> 0;
}
function o(e, t) {
	let n = [...e], r = i(t ?? a());
	for (let e = n.length - 1; e > 0; --e) {
		let t = Math.floor(r() * (e + 1));
		[n[e], n[t]] = [n[t], n[e]];
	}
	return n;
}
//#endregion
//#region src/game/playerOrder.ts
function s(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function c(e, t, n) {
	let r = s(e, n), i = new Set(t);
	return r.filter((e) => i.has(e));
}
var l = 5;
//#endregion
//#region src/game/deal.ts
function u(e) {
	let t = [...new Set(e.participantIds.filter(Boolean))];
	if (t.length < 2) throw Error("Need at least two participants to deal");
	let n = c(e.dealerId, t, e.sortedPlayerIds);
	if (n.length < 2) throw Error("Need at least two seated participants in deal order");
	let i = o(r(), e.seed), a = Object.fromEntries(n.map((e) => [e, []])), s = 0;
	for (let e = 0; e < 5; e += 1) for (let e of n) a[e].push(i[s]), s += 1;
	let l = d(e.dealerId, n, a), u = Object.fromEntries(t.map((e) => [e, 0]));
	return {
		dealOrder: n,
		participantIds: t,
		privateHands: a,
		trumpUpcard: l,
		trumpSuit: l.suit,
		remainingDeck: i.slice(s),
		turnPlayerId: n[0],
		tricksByPlayer: u
	};
}
function d(e, t, n) {
	if (e && t.includes(e)) {
		let t = n[e];
		if (t?.length === 5) return t[4];
	}
	let r = n[t[t.length - 1]];
	if (!r?.length) throw Error("Cannot assign trump upcard — no cards dealt");
	return r[r.length - 1];
}
//#endregion
//#region src/game/types.ts
var f = {
	DRAW: "draw",
	PLAY: "play"
};
//#endregion
//#region src/game/serialize.ts
function p(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function m(e) {
	return e.map(p);
}
function h(e, t) {
	let n = {
		phase: f.DRAW,
		participantIds: [...e.participantIds],
		dealerId: t,
		trumpSuit: e.trumpSuit,
		trumpUpcard: p(e.trumpUpcard),
		remainingDeckCount: e.remainingDeck.length,
		currentTrick: null,
		leadSuit: null,
		playedCards: [],
		turnPlayerId: e.turnPlayerId,
		tricksByPlayer: { ...e.tricksByPlayer }
	}, r = {};
	for (let [t, n] of Object.entries(e.privateHands)) r[t] = { cards: m(n) };
	return {
		publicHand: n,
		privateHandsByPlayer: r
	};
}
//#endregion
export { l as CARDS_PER_PLAYER, f as HAND_PHASE, c as activePlayerOrder, d as assignTrumpUpcard, r as createDeck, u as dealInitialHand, s as playerOrderFromDealer, p as serializeCard, m as serializeCards, h as serializeHandState, o as shuffleDeck };
