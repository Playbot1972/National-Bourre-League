//#region src/table/layout/seatPresetAnchors.ts
var e = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: {
		x: 4,
		y: 99,
		region: "bottom"
	},
	2: {
		x: 2,
		y: 46.5,
		region: "left"
	},
	3: {
		x: 8,
		y: 9,
		region: "top"
	},
	4: {
		x: 50,
		y: 9,
		region: "top"
	},
	5: {
		x: 92,
		y: 9,
		region: "top"
	},
	6: {
		x: 96,
		y: 99,
		region: "bottom"
	}
}, t = {
	sixBotBottomLeft: e[1],
	sixBotBottomRight: e[6],
	sixBotTopCenter: e[4]
};
t.sixBotBottomLeft, e[3], e[5], t.sixBotBottomRight, t.sixBotBottomLeft, t.sixBotBottomRight, t.sixBotBottomLeft, e[2], e[3], t.sixBotTopCenter, e[5], t.sixBotBottomRight;
var n = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: {
		x: 8,
		y: 91,
		region: "bottom"
	},
	2: {
		x: 8,
		y: 46.5,
		region: "left"
	},
	3: {
		x: 8,
		y: 9,
		region: "top"
	},
	4: {
		x: 50,
		y: 9,
		region: "top"
	},
	5: {
		x: 92,
		y: 9,
		region: "top"
	},
	6: {
		x: 92,
		y: 91,
		region: "bottom"
	}
}, r = {
	0: {
		x: 50,
		y: 90,
		region: "bottom"
	},
	1: {
		x: 8,
		y: 91,
		region: "bottom"
	},
	2: {
		x: 8,
		y: 46.5,
		region: "left"
	},
	3: {
		x: 8,
		y: 9,
		region: "top"
	},
	4: {
		x: 50,
		y: 9,
		region: "top"
	},
	5: {
		x: 92,
		y: 9,
		region: "top"
	},
	6: {
		x: 92,
		y: 91,
		region: "bottom"
	}
};
n[1], n[2], n[3], n[4], n[5], n[6], r[1], r[2], r[3], r[4], r[5], r[6], n[1], n[6], n[4];
function i(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function a(e, t) {
	return i(e, t) >= 5;
}
function o(e, t) {
	let n = [...new Set(t.filter(Boolean))];
	if (n.length < 2) return {
		ready: !1,
		winnerIds: [],
		maxTricks: 0
	};
	let r = 0;
	for (let t of n) r = Math.max(r, e[t] || 0);
	return r === 0 ? {
		ready: !1,
		winnerIds: [],
		maxTricks: r
	} : {
		ready: !0,
		winnerIds: n.filter((t) => (e[t] || 0) === r),
		maxTricks: r
	};
}
function s(e) {
	return `$${e.toLocaleString("en-US")}`;
}
//#endregion
//#region src/table/settlementCopy.ts
function c(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function l(e, t) {
	return e.map((e) => c(e, t)).join(" & ");
}
function u(e, t) {
	return a(e, t) ? t.filter((t) => (e[t] ?? 0) === 0) : [];
}
function d(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: a = {} } = e, d = o(t, n), f = e.winnerIds?.length ? e.winnerIds : d.winnerIds, p = e.maxTricks ?? d.maxTricks, m = l(f, r), h = u(t, n), g = l(h, r), _ = s(i.maxWinThisHand), v = s(i.currentPot), y = i.carryIn > 0 ? s(i.carryIn) : null, b = `Pot this hand: ${v} (max win ${_})`;
	y && (b += ` — includes ${y} carried in`), i.limEnabled && i.overflow > 0 && (b += ` · LIM overflow ${s(i.overflow)} stays out of play`);
	let x = f.map((e) => {
		let n = t[e] ?? 0;
		return `${c(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), S = h.length > 0 ? `Bourré: ${g} took 0 tricks — each pays ${_} at settlement (seeds next deal)` : null, C = e.splitSharePerWinner, w = C > 0 && f.length >= 2 ? `If all co-winners agree to split: ${s(i.maxWinThisHand)} → ${s(C)} each` : null, T = f.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, E = `If any co-winner declines: full pot ${v} carries to the next hand · non-winners ante up`, D = f.map((e) => {
		let t = a[e], n = c(e, r);
		return t === "split" ? `${n}: Agreed to split ✓` : t === "push" ? `${n}: Declined split ✓` : `${n}: Waiting to vote…`;
	}), O = e.currentUserId != null && f.includes(e.currentUserId);
	return {
		headline: `Tie — ${m} (${p} tricks each)`,
		subhead: "Co-winners must vote before the next hand can start.",
		winnerLines: x,
		bourreLine: S,
		potLine: b,
		carryoverIfSplitLine: T,
		carryoverIfPushLine: E,
		splitPreviewLine: w,
		rulesLine: "One Decline pushes the pot. All co-winners must Agree to split the max win.",
		voteLines: D,
		observerHint: !O && e.currentUserId ? "You are not a co-winner — waiting for their vote." : null,
		voterHint: O ? "You tied for the lead — cast your vote below." : null
	};
}
function f(e) {
	let { settlement: t, winnerIds: n, participantIds: r, tricksByPlayer: i, players: a, potMaxWin: o, carryOverPot: d } = e, f = e.bourreIds ?? u(i, r), p = l(f, a), m = s(o), h = s(d), g = [];
	if (t === "win" && n.length === 1) {
		let e = c(n[0], a), t = i[n[0]] ?? 0;
		return g.push(`${e} wins the table pot this hand (${t} tricks).`), g.push(`Pot won this hand: ${m} (added to ${e}'s chips).`), f.length && g.push(`Bourré: ${p} took 0 tricks — ${m} each paid at settlement (seeds next deal).`), {
			headline: `${e} wins ${m} this hand`,
			detailLines: g,
			carryoverLine: d > 0 ? `${h} seeded for the next deal (bourré pot match).` : null
		};
	}
	if (t === "split") {
		let e = l(n, a), t = n.length ? o / n.length : 0;
		return g.push(`${e} agreed to split — ${s(t)} each from max win ${m}.`), f.length && g.push(`Bourré: ${p} took 0 tricks.`), {
			headline: `Pot split — ${e}`,
			detailLines: g,
			carryoverLine: null
		};
	}
	if (t === "push") return g.push("No winner with tricks — everyone who stayed in is bourré'd."), f.length && g.push(`Bourré: ${p}.`), g.push(`Full pot ${m} carries forward.`), {
		headline: "Hand pushed — pot carries",
		detailLines: g,
		carryoverLine: `Next hand pot includes ${h}.`
	};
	if (t === "non_winner_ante_up") return g.push("Co-winners did not all agree to split."), g.push(`Pot ${m} carries to the next hand.`), g.push("Players who did not tie for the lead ante up next hand."), f.length && g.push(`Bourré: ${p} took 0 tricks.`), {
		headline: "No split agreement — pot pushed",
		detailLines: g,
		carryoverLine: `Next hand starts with ${h} in the pot.`
	};
	if (t === "co_win_carry") {
		let e = l(n, a);
		return g.push(`Tie for most tricks — ${e} (${n.length} co-winners).`), g.push(`No outright winner; full pot ${m} carries to the next deal.`), g.push("Hand ends; enrollment opens for the next deal. Seats may change between deals."), g.push("Tied leaders skip the ante for that deal; other seated players ante as usual."), g.push("New players seated in time for enrollment may join that deal."), f.length && g.push(`Bourré: ${p} took 0 tricks.`), {
			headline: "Tie — pot carries",
			detailLines: g,
			carryoverLine: `Next deal starts with ${h} in the pot.`
		};
	}
	return {
		headline: "Hand complete",
		detailLines: g,
		carryoverLine: d > 0 ? `Carryover: ${h}` : null
	};
}
function p(e, t) {
	return t.status === "pending" ? e === "split" ? "You agreed to split — waiting for other co-winner(s)." : "Vote recorded — waiting for other co-winner(s)." : t.settlement === "split" ? "All co-winners agreed — pot split evenly. Next hand enrollment is open." : t.settlement === "non_winner_ante_up" ? "Split declined — full pot carries to the next hand. Non-winners ante up." : "Settlement recorded.";
}
function m(e) {
	let t = f({
		settlement: e.settlement,
		winnerIds: e.winnerIds,
		participantIds: e.participantIds,
		tricksByPlayer: e.tricksByPlayer,
		players: e.players,
		potMaxWin: e.cappedPot ?? e.potMaxWin,
		carryOverPot: 0,
		bourreIds: e.bourreIds
	}), n = e.participantIds.length, r = e.cappedPot != null && e.grossPot != null && e.cappedPot < e.grossPot ? " (LIM cap)" : "";
	return `#${e.handNumber} ${t.headline}${r} · ${n} players`;
}
//#endregion
export { u as bourrePlayerIds, d as buildCoWinSettlementView, f as buildHandOutcomeView, m as formatHandHistoryPublicLine, p as formatVoteRecordedMessage };
