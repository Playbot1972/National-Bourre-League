function e(e) {
	return e ? {
		active: e.active,
		orderedPlayerIds: e.orderedPlayerIds,
		currentIndex: e.currentIndex,
		turnDeadlineMs: e.turnDeadlineMs,
		enrolledIds: e.playingIds,
		declinedIds: e.passedIds
	} : null;
}
function t(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function n(e, n) {
	return t(e, n) >= 5;
}
//#endregion
//#region src/session/liveHand.ts
function r() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function i(e) {
	let t = e ?? r();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function a(e) {
	if (!e) return !1;
	let r = e.phase ?? null;
	if (r !== "draw" && r !== "play" && r !== "reveal" && r !== "decision") return !1;
	let i = e.participantIds ?? [];
	if (i.length === 0) return !1;
	let a = e.tricksByPlayer ?? {};
	return !(n(a, i) || t(a, i) >= 5);
}
function o(e) {
	if (!e) return 0;
	let n = e.phase ?? "", r = n === "play" ? 1e3 : n === "draw" ? 100 : n === "decision" ? 50 : n === "reveal" ? 25 : 0;
	r += (e.drawCompletedIds?.length ?? 0) * 10;
	let i = e.participantIds ?? [];
	return r += t(e.tricksByPlayer ?? {}, i), r;
}
function s(e, t) {
	return a(t) ? a(e) ? o(t) >= o(e) ? t : e : t : e;
}
function c(e) {
	let n = e?.currentHand ?? r(), o = e?.liveEnrollment?.deal?.publicHand, c = o?.phase ?? null;
	if (a(n) && a(o)) return s(n, o);
	if (a(n)) return n;
	if (c === "draw" || c === "play" || c === "reveal" || c === "decision") {
		if (a(o)) {
			let a = t(o?.tricksByPlayer ?? {}, o?.participantIds ?? []);
			return i(n) && a === 0 && c === "draw" && !e?.liveEnrollment?.active ? r() : o;
		}
		return i(n) ? r() : n;
	}
	return c && o ? o : n;
}
function l(t) {
	let n = c(t), r = n?.phase ?? null;
	if (r === "reveal" || r === "draw" || r === "play") return null;
	if (r === "decision") {
		let t = e(n.handDecision ?? null);
		if (t?.active) return t;
	}
	let i = t?.liveEnrollment, a = i?.deal?.publicHand?.phase ?? null;
	return i?.active ? i : a === "draw" || a === "play" || a === "reveal" || a === "decision" ? null : t?.handEnrollment?.active ? t.handEnrollment : t?.handEnrollment ?? null;
}
//#endregion
//#region src/session/tableStartup.ts
function u(e) {
	let t = e?.liveEnrollment?.deal?.publicHand;
	return !t?.phase || l(e)?.active || e?.pendingCoWinSettlement || !i(e?.currentHand) ? !1 : n(t.tricksByPlayer ?? {}, t.participantIds ?? []);
}
function d(e) {
	if (!e?.liveEnrollment?.deal) return !1;
	if (u(e)) return !0;
	let t = e.liveEnrollment.deal.publicHand?.phase ?? null, n = !!(e.liveEnrollment?.active || e.handEnrollment?.active);
	return (t === "draw" || t === "play") && !n ? i(e.currentHand) : t === "draw" || t === "play" ? !1 : i(e?.currentHand);
}
function f(e, t) {
	if (!e) return {
		kind: "session_missing",
		canOpenTable: !1,
		needsEnrollment: !1,
		shouldRepair: !1,
		reason: "session_not_found",
		recovery: "return_to_room"
	};
	if (e.status === "final") return {
		kind: "session_final",
		canOpenTable: !1,
		needsEnrollment: !1,
		shouldRepair: !1,
		reason: "session_final",
		recovery: "return_to_room"
	};
	if (t < 2) return {
		kind: "insufficient_players",
		canOpenTable: !1,
		needsEnrollment: !1,
		shouldRepair: !1,
		reason: "fewer_than_two_players",
		recovery: "return_to_room"
	};
	let n = c(e).phase ?? null;
	return n === "reveal" || n === "decision" || n === "draw" || n === "play" ? {
		kind: "ready_mid_hand",
		canOpenTable: !0,
		needsEnrollment: !1,
		shouldRepair: d(e),
		reason: "hand_in_progress",
		recovery: "refresh"
	} : d(e) ? {
		kind: "stale_live_deal",
		canOpenTable: !0,
		needsEnrollment: !0,
		shouldRepair: !0,
		reason: "orphan_live_enrollment_deal",
		recovery: "refresh"
	} : {
		kind: "ready_enrollment",
		canOpenTable: !0,
		needsEnrollment: !0,
		shouldRepair: !1,
		reason: "handoff_needs_deal",
		recovery: "refresh"
	};
}
function p(e) {
	return e.needsEnrollment;
}
function m(e, t) {
	let n = String(t?.message ?? "").toLowerCase();
	if (t?.code === "permission-denied" || t?.code === "PERMISSION_DENIED" || t?.code === "functions/permission-denied" || n.includes("missing or insufficient permissions") || n.includes("insufficient permissions")) return "This table could not be opened because of a permissions problem. Refresh the page and try Go to Table again.";
	switch (e.kind) {
		case "session_final": return "This session is finished. Return to the room and start a new table.";
		case "insufficient_players": return "Need at least two players at the table before opening the live view.";
		case "session_missing": return "This session is no longer available. Return to the room and pick an active session.";
		case "stale_live_deal": return "This table had leftover data from an older version. Refresh the page, then tap Go to Table again.";
		case "enrollment_failed": return "Could not deal the first hand for this table. Wait a moment, then tap Go to Table again.";
		case "ready_mid_hand": return "This hand is still in progress but the table could not load. Refresh and tap Go to Table again.";
		case "ready_enrollment": return "Could not open this table. Wait a moment, then tap Go to Table again.";
		default: return "Could not open this table safely. Return to the room and try again.";
	}
}
//#endregion
export { f as analyzeTableStartup, c as authoritativeCurrentHand, i as isClearedPreDealHand, u as isStaleLiveDealSnapshot, d as shouldClearOrphanLiveEnrollment, p as tableStartupNeedsEnrollment, m as tableStartupUserMessage };
