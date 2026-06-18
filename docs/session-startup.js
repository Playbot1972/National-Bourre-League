function e(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function t(t, n) {
	return e(t, n) >= 5;
}
//#endregion
//#region src/session/liveHand.ts
function n() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function r(e) {
	let t = e ?? n();
	if (t.phase === "draw" || t.phase === "play" || (t.participantIds?.length ?? 0) > 0) return !1;
	let r = t.tricksByPlayer ?? {};
	return !Object.values(r).some((e) => (e || 0) > 0);
}
function i(n) {
	if (!n) return !1;
	let r = n.phase ?? null;
	if (r !== "draw" && r !== "play") return !1;
	let i = n.participantIds ?? [];
	if (i.length === 0) return !1;
	let a = n.tricksByPlayer ?? {};
	return !(t(a, i) || e(a, i) >= 5);
}
function a(t) {
	if (!t) return 0;
	let n = t.phase ?? "", r = n === "play" ? 1e3 : n === "draw" ? 100 : 0;
	r += (t.drawCompletedIds?.length ?? 0) * 10;
	let i = t.participantIds ?? [];
	return r += e(t.tricksByPlayer ?? {}, i), r;
}
function o(e, t) {
	return i(t) ? i(e) ? a(t) >= a(e) ? t : e : t : e;
}
function s(t) {
	let a = t?.currentHand ?? n(), s = t?.liveEnrollment?.deal?.publicHand, c = s?.phase ?? null;
	if (i(a) && i(s)) return o(a, s);
	if (i(a)) return a;
	if (c === "draw" || c === "play") {
		if (i(s)) {
			let i = e(s?.tricksByPlayer ?? {}, s?.participantIds ?? []);
			return r(a) && i === 0 && c === "draw" && !t?.liveEnrollment?.active ? n() : s;
		}
		return r(a) ? n() : a;
	}
	return c && s ? s : a;
}
function c(e) {
	let t = e?.liveEnrollment, n = t?.deal?.publicHand?.phase ?? null;
	return t?.active ? t : n === "draw" || n === "play" ? null : e?.handEnrollment?.active ? e.handEnrollment : e?.handEnrollment ?? null;
}
//#endregion
//#region src/session/tableStartup.ts
function l(e) {
	let n = e?.liveEnrollment?.deal?.publicHand;
	return !n?.phase || c(e)?.active || e?.pendingCoWinSettlement || !r(e?.currentHand) ? !1 : t(n.tricksByPlayer ?? {}, n.participantIds ?? []);
}
function u(e) {
	if (!e?.liveEnrollment?.deal) return !1;
	if (l(e)) return !0;
	let t = e.liveEnrollment.deal.publicHand?.phase ?? null, n = !!(e.liveEnrollment?.active || e.handEnrollment?.active);
	return (t === "draw" || t === "play") && !n ? r(e.currentHand) : t === "draw" || t === "play" ? !1 : r(e?.currentHand);
}
function d(e, t) {
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
	let n = s(e).phase ?? null;
	return n === "draw" || n === "play" ? {
		kind: "ready_mid_hand",
		canOpenTable: !0,
		needsEnrollment: !1,
		shouldRepair: u(e),
		reason: "hand_in_progress",
		recovery: "refresh"
	} : u(e) ? {
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
		reason: "handoff_needs_join_window",
		recovery: "refresh"
	};
}
function f(e) {
	return e.needsEnrollment;
}
function p(e, t) {
	let n = String(t?.message ?? "").toLowerCase();
	if (t?.code === "permission-denied" || t?.code === "PERMISSION_DENIED" || t?.code === "functions/permission-denied" || n.includes("missing or insufficient permissions") || n.includes("insufficient permissions")) return "This table could not be opened because of a permissions problem. Refresh the page and try Go to Table again.";
	switch (e.kind) {
		case "session_final": return "This session is finished. Return to the room and start a new table.";
		case "insufficient_players": return "Need at least two players at the table before opening the live view.";
		case "session_missing": return "This session is no longer available. Return to the room and pick an active session.";
		case "stale_live_deal": return "This table had leftover data from an older version. Refresh the page, then tap Go to Table again.";
		case "enrollment_failed": return "The join window could not start for this table. Refresh the page, return to the room, and tap Go to Table again.";
		case "ready_mid_hand": return "This hand is still in progress but the table could not load. Refresh and tap Go to Table again.";
		case "ready_enrollment": return "Could not open this table. Refresh the page and tap Go to Table again.";
		default: return "Could not open this table safely. Return to the room and try again.";
	}
}
//#endregion
export { d as analyzeTableStartup, s as authoritativeCurrentHand, r as isClearedPreDealHand, l as isStaleLiveDealSnapshot, u as shouldClearOrphanLiveEnrollment, f as tableStartupNeedsEnrollment, p as tableStartupUserMessage };
