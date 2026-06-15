//#region src/table/logic.ts
function e(e, t) {
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
function t(e) {
	return `$${e.toLocaleString("en-US")}`;
}
//#endregion
//#region src/table/settlementCopy.ts
function n(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function r(e, t) {
	return e.map((e) => n(e, t)).join(" & ");
}
function i(e, t) {
	return t.filter((t) => (e[t] ?? 0) === 0);
}
function a(a) {
	let { tricksByPlayer: o, participantIds: s, players: c, pot: l, pendingVotes: u = {} } = a, d = e(o, s), f = a.winnerIds?.length ? a.winnerIds : d.winnerIds, p = a.maxTricks ?? d.maxTricks, m = r(f, c), h = i(o, s), g = r(h, c), _ = t(l.maxWinThisHand), v = t(l.currentPot), y = l.carryIn > 0 ? t(l.carryIn) : null, b = `Pot this hand: ${v} (max win ${_})`;
	y && (b += ` — includes ${y} carried in`), l.limEnabled && l.overflow > 0 && (b += ` · LIM overflow ${t(l.overflow)} stays out of play`);
	let x = f.map((e) => {
		let t = o[e] ?? 0;
		return `${n(e, c)} — ${t} trick${t === 1 ? "" : "s"}`;
	}), S = h.length > 0 ? `Bourré: ${g} took 0 tricks (extra penalty applies on settlement)` : null, C = a.splitSharePerWinner, w = C > 0 && f.length >= 2 ? `If all co-winners agree to split: ${t(l.maxWinThisHand)} → ${t(C)} each` : null, T = f.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, E = `If any co-winner declines: full pot ${v} carries to the next hand · non-winners ante up`, D = f.map((e) => {
		let t = u[e], r = n(e, c);
		return t === "split" ? `${r}: Agreed to split ✓` : t === "push" ? `${r}: Declined split ✓` : `${r}: Waiting to vote…`;
	}), O = a.currentUserId != null && f.includes(a.currentUserId);
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
		observerHint: !O && a.currentUserId ? "You are not a co-winner — waiting for their vote." : null,
		voterHint: O ? "You tied for the lead — cast your vote below." : null
	};
}
function o(e) {
	let { settlement: a, winnerIds: o, participantIds: s, tricksByPlayer: c, players: l, potMaxWin: u, carryOverPot: d } = e, f = e.bourreIds ?? i(c, s), p = r(f, l), m = t(u), h = t(d), g = [];
	if (a === "win" && o.length === 1) {
		let e = n(o[0], l), t = c[o[0]] ?? 0;
		return g.push(`${e} wins the pot (${t} tricks).`), f.length && g.push(`Bourré: ${p} took 0 tricks.`), {
			headline: `${e} wins ${m}`,
			detailLines: g,
			carryoverLine: d > 0 ? `Next hand starts with ${h} in the pot.` : null
		};
	}
	if (a === "split") {
		let e = r(o, l), n = o.length ? u / o.length : 0;
		return g.push(`${e} agreed to split — ${t(n)} each from max win ${m}.`), f.length && g.push(`Bourré: ${p} took 0 tricks.`), {
			headline: `Pot split — ${e}`,
			detailLines: g,
			carryoverLine: null
		};
	}
	return a === "push" ? (g.push("No winner with tricks — everyone who stayed in is bourré'd."), f.length && g.push(`Bourré: ${p}.`), g.push(`Full pot ${m} carries forward.`), {
		headline: "Hand pushed — pot carries",
		detailLines: g,
		carryoverLine: `Next hand pot includes ${h}.`
	}) : a === "non_winner_ante_up" ? (g.push("Co-winners did not all agree to split."), g.push(`Pot ${m} carries to the next hand.`), g.push("Players who did not tie for the lead ante up next hand."), f.length && g.push(`Bourré: ${p} took 0 tricks.`), {
		headline: "No split agreement — pot pushed",
		detailLines: g,
		carryoverLine: `Next hand starts with ${h} in the pot.`
	}) : {
		headline: "Hand complete",
		detailLines: g,
		carryoverLine: d > 0 ? `Carryover: ${h}` : null
	};
}
function s(e, t) {
	return t.status === "pending" ? e === "split" ? "You agreed to split — waiting for other co-winner(s)." : "Vote recorded — waiting for other co-winner(s)." : t.settlement === "split" ? "All co-winners agreed — pot split evenly. Next hand enrollment is open." : t.settlement === "non_winner_ante_up" ? "Split declined — full pot carries to the next hand. Non-winners ante up." : "Settlement recorded.";
}
function c(e) {
	let t = o({
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
export { i as bourrePlayerIds, a as buildCoWinSettlementView, o as buildHandOutcomeView, c as formatHandHistoryPublicLine, s as formatVoteRecordedMessage };
