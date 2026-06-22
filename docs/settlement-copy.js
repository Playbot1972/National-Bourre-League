function e(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function t(t, n) {
	return e(t, n) >= 5;
}
function n(e, t) {
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
function r(e) {
	return `$${e.toLocaleString("en-US")}`;
}
//#endregion
//#region src/table/settlementCopy.ts
function i(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function a(e, t) {
	return e.map((e) => i(e, t)).join(" & ");
}
function o(e, n) {
	return t(e, n) ? n.filter((t) => (e[t] ?? 0) === 0) : [];
}
function s(e) {
	let { tricksByPlayer: t, participantIds: s, players: c, pot: l, pendingVotes: u = {} } = e, d = n(t, s), f = e.winnerIds?.length ? e.winnerIds : d.winnerIds, p = e.maxTricks ?? d.maxTricks, m = a(f, c), h = o(t, s), g = a(h, c), _ = r(l.maxWinThisHand), v = r(l.currentPot), y = l.carryIn > 0 ? r(l.carryIn) : null, b = `Pot this hand: ${v} (max win ${_})`;
	y && (b += ` — includes ${y} carried in`), l.limEnabled && l.overflow > 0 && (b += ` · LIM overflow ${r(l.overflow)} stays out of play`);
	let x = f.map((e) => {
		let n = t[e] ?? 0;
		return `${i(e, c)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), S = h.length > 0 ? `Bourré: ${g} took 0 tricks (extra penalty applies on settlement)` : null, C = e.splitSharePerWinner, w = C > 0 && f.length >= 2 ? `If all co-winners agree to split: ${r(l.maxWinThisHand)} → ${r(C)} each` : null, T = f.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, E = `If any co-winner declines: full pot ${v} carries to the next hand · non-winners ante up`, D = f.map((e) => {
		let t = u[e], n = i(e, c);
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
function c(e) {
	let { settlement: t, winnerIds: n, participantIds: s, tricksByPlayer: c, players: l, potMaxWin: u, carryOverPot: d } = e, f = e.bourreIds ?? o(c, s), p = a(f, l), m = r(u), h = r(d), g = [];
	if (t === "win" && n.length === 1) {
		let e = i(n[0], l), t = c[n[0]] ?? 0;
		return g.push(`${e} wins the pot (${t} tricks).`), f.length && g.push(`Bourré: ${p} took 0 tricks.`), {
			headline: `${e} wins ${m}`,
			detailLines: g,
			carryoverLine: d > 0 ? `Next hand starts with ${h} in the pot.` : null
		};
	}
	if (t === "split") {
		let e = a(n, l), t = n.length ? u / n.length : 0;
		return g.push(`${e} agreed to split — ${r(t)} each from max win ${m}.`), f.length && g.push(`Bourré: ${p} took 0 tricks.`), {
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
		let e = a(n, l);
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
function l(e, t) {
	return t.status === "pending" ? e === "split" ? "You agreed to split — waiting for other co-winner(s)." : "Vote recorded — waiting for other co-winner(s)." : t.settlement === "split" ? "All co-winners agreed — pot split evenly. Next hand enrollment is open." : t.settlement === "non_winner_ante_up" ? "Split declined — full pot carries to the next hand. Non-winners ante up." : "Settlement recorded.";
}
function u(e) {
	let t = c({
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
export { o as bourrePlayerIds, s as buildCoWinSettlementView, c as buildHandOutcomeView, u as formatHandHistoryPublicLine, l as formatVoteRecordedMessage };
