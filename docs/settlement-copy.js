//#region src/table/layout/seatPresetAnchors.ts
var e = {
	0: {
		x: 50,
		y: 96,
		region: "bottom"
	},
	1: {
		x: 4,
		y: 99,
		region: "bottom"
	},
	2: {
		x: 2,
		y: 40.4,
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
};
e[1], e[2], e[3], e[4], e[5], e[6], e[1], e[6], e[4];
var t = {
	0: {
		x: 50,
		y: 88,
		region: "bottom"
	},
	1: {
		x: 8,
		y: 91,
		region: "bottom"
	},
	2: {
		x: 8,
		y: 40.4,
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
}, n = {
	0: {
		x: 50,
		y: 86,
		region: "bottom"
	},
	1: {
		x: 8,
		y: 89,
		region: "bottom"
	},
	2: {
		x: 8,
		y: 40.4,
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
		y: 89,
		region: "bottom"
	}
};
t[1], t[2], t[3], t[4], t[5], t[6], n[1], n[2], n[3], n[4], n[5], n[6], t[1], t[6], t[4];
function r(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function i(e, t) {
	return r(e, t) >= 5;
}
function a(e, t) {
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
function o(e) {
	return `$${e.toLocaleString("en-US")}`;
}
//#endregion
//#region src/table/settlementCopy.ts
function s(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function c(e, t) {
	return e.map((e) => s(e, t)).join(" & ");
}
function l(e, t) {
	return i(e, t) ? t.filter((t) => (e[t] ?? 0) === 0) : [];
}
function u(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: u = {} } = e, d = a(t, n), f = e.winnerIds?.length ? e.winnerIds : d.winnerIds, p = e.maxTricks ?? d.maxTricks, m = c(f, r), h = l(t, n), g = c(h, r), _ = o(i.maxWinThisHand), v = o(i.currentPot), y = i.carryIn > 0 ? o(i.carryIn) : null, b = `Pot this hand: ${v} (max win ${_})`;
	y && (b += ` — includes ${y} carried in`), i.limEnabled && i.overflow > 0 && (b += ` · LIM overflow ${o(i.overflow)} stays out of play`);
	let x = f.map((e) => {
		let n = t[e] ?? 0;
		return `${s(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), S = h.length > 0 ? `Bourré: ${g} took 0 tricks — each pays ${_} (${o(h.length * i.maxWinThisHand)} total for next deal)` : null, C = e.splitSharePerWinner, w = C > 0 && f.length >= 2 ? `If all co-winners agree to split: ${o(i.maxWinThisHand)} → ${o(C)} each` : null, T = f.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, E = `If any co-winner declines: full pot ${v} carries to the next hand · non-winners ante up`, D = f.map((e) => {
		let t = u[e], n = s(e, r);
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
function d(e) {
	let { settlement: t, winnerIds: n, participantIds: r, tricksByPlayer: i, players: a, potMaxWin: u, carryOverPot: d } = e, f = e.bourreIds ?? l(i, r), p = c(f, a), m = o(u), h = o(d), g = o(e.bourreCarryOver != null && e.bourreCarryOver > 0 ? e.bourreCarryOver : f.length * u), _ = [];
	if (t === "win" && n.length === 1) {
		let e = s(n[0], a), t = i[n[0]] ?? 0;
		return _.push(`${e} wins the table pot this hand (${t} tricks).`), _.push(`Pot won this hand: ${m} (added to ${e}'s chips).`), f.length && _.push(`Bourré: ${p} took 0 tricks — each paid ${m} (${g} seeded for the next deal).`), {
			headline: `${e} wins ${m} this hand`,
			detailLines: _,
			carryoverLine: d > 0 ? `Next pot seeded: ${h}${f.length ? ` (includes ${g} from bourré)` : ""}.` : null
		};
	}
	if (t === "split") {
		let e = c(n, a), t = n.length ? u / n.length : 0;
		return _.push(`${e} agreed to split — ${o(t)} each from max win ${m}.`), f.length && _.push(`Bourré: ${p} took 0 tricks.`), {
			headline: `Pot split — ${e}`,
			detailLines: _,
			carryoverLine: null
		};
	}
	if (t === "push") return _.push("No winner with tricks — everyone who stayed in is bourré'd."), f.length && _.push(`Bourré: ${p}.`), _.push(`Full pot ${m} carries forward.`), {
		headline: "Hand pushed — pot carries",
		detailLines: _,
		carryoverLine: `Next hand pot includes ${h}.`
	};
	if (t === "non_winner_ante_up") return _.push("Co-winners did not all agree to split."), _.push(`Pot ${m} carries to the next hand.`), _.push("Players who did not tie for the lead ante up next hand."), f.length && _.push(`Bourré: ${p} took 0 tricks.`), {
		headline: "No split agreement — pot pushed",
		detailLines: _,
		carryoverLine: `Next hand starts with ${h} in the pot.`
	};
	if (t === "co_win_carry") {
		let e = c(n, a);
		return _.push(`Tie for most tricks — ${e} (${n.length} co-winners).`), _.push(`No outright winner; full pot ${m} carries to the next deal.`), _.push("Hand ends; enrollment opens for the next deal. Seats may change between deals."), _.push("Tied leaders skip the ante for that deal; other seated players ante as usual."), _.push("New players seated in time for enrollment may join that deal."), f.length && _.push(`Bourré: ${p} took 0 tricks.`), {
			headline: "Tie — pot carries",
			detailLines: _,
			carryoverLine: `Next deal starts with ${h} in the pot.`
		};
	}
	return {
		headline: "Hand complete",
		detailLines: _,
		carryoverLine: d > 0 ? `Carryover: ${h}` : null
	};
}
function f(e, t) {
	return t.status === "pending" ? e === "split" ? "You agreed to split — waiting for other co-winner(s)." : "Vote recorded — waiting for other co-winner(s)." : t.settlement === "split" ? "All co-winners agreed — pot split evenly. Next hand enrollment is open." : t.settlement === "non_winner_ante_up" ? "Split declined — full pot carries to the next hand. Non-winners ante up." : "Settlement recorded.";
}
function p(e) {
	let t = d({
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
export { l as bourrePlayerIds, u as buildCoWinSettlementView, d as buildHandOutcomeView, p as formatHandHistoryPublicLine, f as formatVoteRecordedMessage };
