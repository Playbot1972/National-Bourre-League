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
//#endregion
//#region src/table/layout/seatPresetAnchors.ts
var t = {
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
t[1], t[2], t[3], t[4], t[5], t[6], t[1], t[6], t[4];
var n = {
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
}, r = {
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
n[1], n[2], n[3], n[4], n[5], n[6], r[1], r[2], r[3], r[4], r[5], r[6], n[1], n[6], n[4];
function i(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function a(e, t) {
	return i(e, t) >= 5;
}
//#endregion
//#region src/session/liveHand.ts
function o() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function s(e) {
	let t = e ?? o();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function c(e) {
	if (!e) return !1;
	let t = e.phase ?? null;
	if (t !== "draw" && t !== "play" && t !== "reveal" && t !== "decision") return !1;
	let n = e.participantIds ?? [];
	if (n.length === 0) return !1;
	let r = e.tricksByPlayer ?? {};
	return !(a(r, n) || i(r, n) >= 5);
}
function l(e) {
	if (!e) return 0;
	let t = e.phase ?? "", n = t === "play" ? 1e3 : t === "draw" ? 100 : t === "decision" ? 50 : t === "reveal" ? 25 : 0;
	n += (e.drawCompletedIds?.length ?? 0) * 10;
	let r = e.participantIds ?? [];
	n += i(e.tricksByPlayer ?? {}, r);
	let a = e.handDecision;
	return t === "decision" && a && (n += (a.currentIndex ?? 0) * 5, n += (a.playingIds?.length ?? 0) * 2, n += (a.passedIds?.length ?? 0) * 2), n;
}
function u(e, t) {
	return c(t) ? c(e) ? l(t) >= l(e) ? t : e : t : e;
}
function d(e) {
	let t = e?.phase ?? null;
	return t === "reveal" || t === "decision" || t === "draw" || t === "play";
}
function f(e) {
	return e ? d(e.currentHand) || d(e.liveEnrollment?.deal?.publicHand) ? !0 : d(p(e)) : !1;
}
function p(e) {
	let t = e?.currentHand ?? o(), n = e?.liveEnrollment?.deal?.publicHand, r = n?.phase ?? null;
	if (c(t) && c(n)) {
		let e = t.phase === "reveal" || t.phase === "decision", r = n?.drawCompletedIds?.length ?? 0, a = t.drawCompletedIds?.length ?? 0, o = i(n?.tricksByPlayer ?? {}, n?.participantIds ?? []), s = i(t.tricksByPlayer ?? {}, t.participantIds ?? []);
		return e && n?.phase === "draw" && s === 0 && o === 0 && r > 0 && a === 0 ? t : u(t, n);
	}
	if (c(t)) return t;
	if (r === "draw" || r === "play" || r === "reveal" || r === "decision") {
		if (c(n)) {
			let a = i(n?.tricksByPlayer ?? {}, n?.participantIds ?? []);
			return s(t) && a === 0 && r === "draw" && !e?.liveEnrollment?.active ? o() : n;
		}
		return n?.phase ? n : d(t) ? t : s(t) ? o() : t;
	}
	return r && n ? n : t;
}
function m(t) {
	let n = p(t), r = n?.phase ?? null;
	if (r === "reveal" || r === "draw" || r === "play") return null;
	if (r === "decision") {
		let t = e(n.handDecision ?? null);
		if (t?.active) return t;
	}
	let i = t?.liveEnrollment, a = i?.deal?.publicHand?.phase ?? null;
	return i?.active ? i : a === "draw" || a === "play" || a === "reveal" || a === "decision" ? null : t?.handEnrollment?.active ? t.handEnrollment : t?.handEnrollment ?? null;
}
function h(e) {
	return !e.cardsDealt && e.handParticipantCount === 0 && e.enrollmentActive;
}
function g(e, t) {
	return e === "decision" && t?.active === !0;
}
function _(e) {
	return e.legacyEnrollmentActive || e.pagatDecisionActive;
}
function v(e) {
	return e.pagatDecisionActive && e.handDecision ? (e.handDecision.orderedPlayerIds ?? [])[e.handDecision.currentIndex ?? 0] ?? null : e.legacyEnrollmentActive && e.enrollment?.active ? (e.enrollment.orderedPlayerIds ?? [])[e.enrollment.currentIndex ?? 0] ?? null : null;
}
function y(e) {
	return e.enrollmentGateActive && e.isSelf && !e.isFinal && e.playerId === e.currentChoicePlayerId && e.bankroll > 0 && !e.isOut;
}
//#endregion
//#region src/session/botDecisionClock.ts
var b = 400, x = 2500;
function S(e, t, n) {
	return `${e}:${t}:${n}`;
}
function C(e, t = Date.now()) {
	return {
		playerId: e,
		deadlineMs: t + (400 + Math.random() * (x - 400))
	};
}
function w(e, t) {
	if (!t) return {
		expired: !0,
		secondsLeft: 0
	};
	let n = Math.max(0, t.deadlineMs - e);
	return {
		expired: n <= 0,
		secondsLeft: Math.max(0, Math.ceil(n / 1e3))
	};
}
//#endregion
//#region src/session/tableStartup.ts
function T(e) {
	let t = e?.liveEnrollment?.deal?.publicHand;
	return !t?.phase || m(e)?.active || e?.pendingCoWinSettlement || !s(e?.currentHand) ? !1 : a(t.tricksByPlayer ?? {}, t.participantIds ?? []);
}
function E(e) {
	if (!e?.liveEnrollment?.deal) return !1;
	if (T(e)) return !0;
	let t = e.liveEnrollment.deal.publicHand?.phase ?? null, n = !!(e.liveEnrollment?.active || e.handEnrollment?.active);
	return (t === "draw" || t === "play") && !n ? s(e.currentHand) : t === "draw" || t === "play" ? !1 : s(e?.currentHand);
}
function D(e, t) {
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
	let n = p(e).phase ?? null;
	return n === "reveal" || n === "decision" || n === "draw" || n === "play" ? {
		kind: "ready_mid_hand",
		canOpenTable: !0,
		needsEnrollment: !1,
		shouldRepair: E(e),
		reason: "hand_in_progress",
		recovery: "refresh"
	} : E(e) ? {
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
function O(e) {
	return e.needsEnrollment;
}
function k(e, t) {
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
export { x as BOT_DECISION_DELAY_MAX_MS, b as BOT_DECISION_DELAY_MIN_MS, D as analyzeTableStartup, p as authoritativeCurrentHand, S as botDecisionClockKey, y as canPlayerShowHandChoice, w as computeBotDecisionCountdown, d as handPhaseStarted, s as isClearedPreDealHand, h as isLegacyEnrollmentActive, g as isPagatDecisionActive, T as isStaleLiveDealSnapshot, v as resolveCurrentHandChoicePlayerId, _ as resolveTableEnrollmentActive, f as sessionHandDealStarted, E as shouldClearOrphanLiveEnrollment, C as startBotDecisionClock, O as tableStartupNeedsEnrollment, k as tableStartupUserMessage };
