//#region src/game/types.ts
var e = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
};
function t(e) {
	return e.orderedPlayerIds[e.currentIndex] ?? null;
}
function n(e) {
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
var r = {
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
}, i = {
	sixBotBottomLeft: r[1],
	sixBotBottomRight: r[6],
	sixBotTopCenter: r[4]
};
i.sixBotBottomLeft, r[3], r[5], i.sixBotBottomRight, i.sixBotBottomLeft, i.sixBotBottomRight, i.sixBotBottomLeft, r[2], r[3], i.sixBotTopCenter, r[5], i.sixBotBottomRight;
var a = {
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
}, o = {
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
a[1], a[2], a[3], a[4], a[5], a[6], o[1], o[2], o[3], o[4], o[5], o[6], a[1], a[6], a[4];
function s(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function c(e, t) {
	return s(e, t) >= 5;
}
//#endregion
//#region src/session/liveHand.ts
function l() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function u(e) {
	let t = e ?? l();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function d(e) {
	if (!e) return !1;
	let t = e.phase ?? null;
	if (t !== "draw" && t !== "play" && t !== "reveal" && t !== "decision") return !1;
	let n = e.participantIds ?? [];
	if (n.length === 0) return !1;
	let r = e.tricksByPlayer ?? {};
	return !(c(r, n) || s(r, n) >= 5);
}
function f(e) {
	if (!e) return 0;
	let t = e.phase ?? "", n = t === "play" ? 1e3 : t === "draw" ? 100 : t === "decision" ? 50 : t === "reveal" ? 25 : 0;
	n += (e.drawCompletedIds?.length ?? 0) * 10;
	let r = e.participantIds ?? [];
	n += s(e.tricksByPlayer ?? {}, r);
	let i = e.handDecision;
	return t === "decision" && i && (n += (i.currentIndex ?? 0) * 5, n += (i.playingIds?.length ?? 0) * 2, n += (i.passedIds?.length ?? 0) * 2), n;
}
function p(e, t) {
	return d(t) ? d(e) ? f(t) >= f(e) ? t : e : t : e;
}
function m(e) {
	if (!e || typeof e != "object") return null;
	let t = e;
	return typeof t.rank != "string" || typeof t.suit != "string" || !t.rank.trim() || !t.suit.trim() ? null : {
		rank: t.rank,
		suit: t.suit
	};
}
function h(e, ...t) {
	let n = m(e.trumpUpcard), r = e.trumpSuit ?? null, i = e.trumpHolderId ?? null;
	for (let e of t) e && (n ||= m(e.trumpUpcard), !r && e.trumpSuit && (r = e.trumpSuit), !i && e.trumpHolderId && (i = e.trumpHolderId));
	return !r && n?.suit && (r = n.suit), n === m(e.trumpUpcard) && r === (e.trumpSuit ?? null) && i === (e.trumpHolderId ?? null) ? e : {
		...e,
		...n ? { trumpUpcard: n } : {},
		...r ? { trumpSuit: r } : {},
		...i ? { trumpHolderId: i } : {}
	};
}
function g(e, t) {
	return u(t) ? t : h(t, e?.currentHand, e?.liveEnrollment?.deal?.publicHand);
}
function _(e) {
	let t = e?.phase ?? null;
	return t === "reveal" || t === "decision" || t === "draw" || t === "play";
}
function v(e) {
	if (!e) return !1;
	let t = y(e), n = t.participantIds ?? [];
	if (n.length < 2) return !1;
	let r = t.phase ?? null;
	return r !== "play" && r !== "draw" ? !1 : c(t.tricksByPlayer ?? {}, n);
}
function ee(e) {
	return !e || v(e) ? !1 : _(e.currentHand) || _(e.liveEnrollment?.deal?.publicHand) ? !0 : _(y(e));
}
function y(e) {
	let t = e?.currentHand ?? l(), n = e?.liveEnrollment?.deal?.publicHand, r = n?.phase ?? null, i;
	if (u(t) && n && !d(n)) i = l();
	else if (d(t) && d(n)) {
		let e = t.phase === "reveal" || t.phase === "decision", r = n?.drawCompletedIds?.length ?? 0, a = t.drawCompletedIds?.length ?? 0, o = s(n?.tricksByPlayer ?? {}, n?.participantIds ?? []), c = s(t.tricksByPlayer ?? {}, t.participantIds ?? []);
		i = e && n?.phase === "draw" && c === 0 && o === 0 && r > 0 && a === 0 ? t : p(t, n);
	} else if (d(t)) i = t;
	else if (r === "draw" || r === "play" || r === "reveal" || r === "decision") if (d(n)) {
		let a = s(n?.tricksByPlayer ?? {}, n?.participantIds ?? []);
		i = u(t) && a === 0 && r === "draw" && !e?.liveEnrollment?.active ? l() : n;
	} else i = n?.phase ? n : _(t) ? t : u(t) ? l() : t;
	else i = r && n ? n : t;
	return g(e, i);
}
function b(e) {
	return typeof e == "object" && !!e && ("orderedPlayerIds" in e || "enrolledIds" in e || "currentIndex" in e);
}
function x(e) {
	let t = y(e), r = t?.phase ?? null;
	if (r === "reveal" || r === "draw" || r === "play") return null;
	if (r === "decision") {
		let e = n(t.handDecision ?? null);
		if (e?.active) return e;
	}
	let i = e?.liveEnrollment, a = i?.deal?.publicHand?.phase ?? null;
	return i?.active ? i : a === "draw" || a === "play" || a === "reveal" || a === "decision" ? null : e?.handEnrollment?.active ? e.handEnrollment : e?.handEnrollment ?? null;
}
function S(e) {
	return !e.cardsDealt && e.handParticipantCount === 0 && e.enrollmentActive;
}
function C(e, t) {
	return e === "decision" && t?.active === !0;
}
function te(e) {
	return e.legacyEnrollmentActive || e.pagatDecisionActive;
}
function w(e) {
	return e.pagatDecisionActive && e.handDecision ? (e.handDecision.orderedPlayerIds ?? [])[e.handDecision.currentIndex ?? 0] ?? null : e.legacyEnrollmentActive && e.enrollment?.active ? (e.enrollment.orderedPlayerIds ?? [])[e.enrollment.currentIndex ?? 0] ?? null : null;
}
function ne(e) {
	return e.enrollmentGateActive && e.isSelf && !e.isFinal && e.playerId === e.currentChoicePlayerId && e.bankroll > 0 && !e.isOut;
}
//#endregion
//#region src/session/handPhaseMachine.ts
var T = {
	WAITING: "waiting",
	ENROLLMENT: "enrollment",
	DEAL: "deal",
	DRAW: "draw",
	PLAY: "play",
	SETTLE: "settle",
	NEXT_HAND_PREP: "next-hand-prep"
}, E = [
	{
		from: T.WAITING,
		event: "open_enrollment",
		to: T.ENROLLMENT
	},
	{
		from: T.WAITING,
		event: "deal_cards",
		to: T.DEAL
	},
	{
		from: T.NEXT_HAND_PREP,
		event: "open_enrollment",
		to: T.ENROLLMENT
	},
	{
		from: T.NEXT_HAND_PREP,
		event: "deal_cards",
		to: T.DEAL
	},
	{
		from: T.NEXT_HAND_PREP,
		event: "prep_complete",
		to: T.WAITING
	},
	{
		from: T.ENROLLMENT,
		event: "enrollment_step",
		to: T.ENROLLMENT
	},
	{
		from: T.ENROLLMENT,
		event: "enrollment_complete",
		to: T.DEAL
	},
	{
		from: T.ENROLLMENT,
		event: "solo_win",
		to: T.SETTLE
	},
	{
		from: T.ENROLLMENT,
		event: "decision_complete",
		to: T.DRAW
	},
	{
		from: T.DEAL,
		event: "advance_reveal",
		to: T.DRAW
	},
	{
		from: T.DEAL,
		event: "decision_step",
		to: T.ENROLLMENT
	},
	{
		from: T.DRAW,
		event: "submit_draw",
		to: T.DRAW
	},
	{
		from: T.DRAW,
		event: "draw_fold",
		to: T.DRAW
	},
	{
		from: T.DRAW,
		event: "draw_complete",
		to: T.PLAY
	},
	{
		from: T.DRAW,
		event: "solo_win",
		to: T.SETTLE
	},
	{
		from: T.PLAY,
		event: "play_card",
		to: T.PLAY
	},
	{
		from: T.PLAY,
		event: "hand_complete",
		to: T.SETTLE
	},
	{
		from: T.SETTLE,
		event: "cowin_pending",
		to: T.SETTLE
	},
	{
		from: T.SETTLE,
		event: "record_hand",
		to: T.NEXT_HAND_PREP
	},
	{
		from: T.NEXT_HAND_PREP,
		event: "session_final",
		to: T.WAITING
	}
], D = (e, t) => `${e}:${t}`, O = new Map(E.map((e) => [D(e.from, e.event), e.to]));
function k(e, t) {
	return O.has(D(e, t));
}
function re(e, t) {
	return O.get(D(e, t)) ?? null;
}
function A(e) {
	let t = e?.turnDeadlineMs;
	if (t == null) return 0;
	if (typeof t == "number" && Number.isFinite(t)) return t;
	if (typeof t == "object" && t && "toMillis" in t) {
		let e = t.toMillis;
		if (typeof e == "function") return e.call(t);
	}
	if (typeof t == "object" && t && "seconds" in t) {
		let e = t.seconds ?? 0, n = t.nanoseconds ?? 0;
		return e * 1e3 + Math.floor(n / 1e6);
	}
	let n = Number(t);
	return Number.isFinite(n) ? n : 0;
}
function j(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
function M(e, t) {
	return !e || !t ? !1 : e === t ? !0 : j(e);
}
function N() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function P(t) {
	let n = t.session, r = n ? y(n) : N(), i = r.phase ?? null, a = r.participantIds ?? [], o = r.tricksByPlayer ?? {}, l = s(o, a), d = a.length > 0 && c(o, a), f = !!n?.pendingCoWinSettlement?.winnerIds?.length, p = n ? x(n) : null, m = C(i, r.handDecision ?? null), h = S({
		cardsDealt: i === e.REVEAL || i === e.DECISION || i === e.DRAW || i === e.PLAY,
		handParticipantCount: a.length,
		enrollmentActive: !!p?.active
	}), g = h || m, _ = F({
		sessionStatus: n?.status ?? null,
		handPhase: i,
		participantIds: a,
		trickCount: l,
		handComplete: d,
		pendingCoWin: f,
		enrollmentActive: g,
		handCount: n?.handCount ?? 0,
		clearedHand: u(r)
	});
	return {
		phase: _,
		handPhase: i,
		enrollmentActive: g,
		pagatDecisionActive: m,
		participantIds: a,
		turnPlayerId: I({
			phase: _,
			handPhase: i,
			hand: r,
			enrollment: p,
			pagatDecisionActive: m,
			legacyEnrollmentActive: h
		}),
		handComplete: d,
		pendingCoWin: f,
		trickCount: l
	};
}
function F(t) {
	if (t.sessionStatus === "final") return T.WAITING;
	if (t.pendingCoWin) return T.SETTLE;
	let n = t.handPhase ?? null, r = t.participantIds ?? [];
	return n === e.PLAY ? t.handComplete || (t.trickCount ?? 0) >= 5 ? T.SETTLE : T.PLAY : n === e.DRAW ? T.DRAW : n === e.REVEAL ? T.DEAL : n === e.DECISION || t.enrollmentActive ? T.ENROLLMENT : t.clearedHand !== !1 && r.length === 0 && (t.handCount ?? 0) > 0 && !t.enrollmentActive ? T.NEXT_HAND_PREP : T.WAITING;
}
function I(e) {
	let { phase: t, hand: n, enrollment: r, pagatDecisionActive: i, legacyEnrollmentActive: a } = e;
	return t === T.ENROLLMENT ? w({
		pagatDecisionActive: i,
		handDecision: n.handDecision ?? null,
		legacyEnrollmentActive: a,
		enrollment: r
	}) : t === T.DRAW || t === T.PLAY ? n.turnPlayerId ?? null : null;
}
function L(e) {
	let { snapshot: t, action: n, playerId: r, actorId: i, suppressTurn: a = !1 } = e, o = e.drawCompletedIds ?? [];
	if (!M(r, i)) return {
		ok: !1,
		reason: "actor_mismatch"
	};
	switch (n) {
		case "enrollment_in":
		case "enrollment_pass": return t.phase === T.ENROLLMENT ? t.turnPlayerId === r ? { ok: !0 } : {
			ok: !1,
			reason: "not_your_turn"
		} : {
			ok: !1,
			reason: "not_enrollment"
		};
		case "enrollment_timeout": return t.phase === T.ENROLLMENT ? { ok: !0 } : {
			ok: !1,
			reason: "not_enrollment"
		};
		case "decision_play":
		case "decision_pass": return t.pagatDecisionActive ? t.turnPlayerId === r ? { ok: !0 } : {
			ok: !1,
			reason: "not_your_turn"
		} : {
			ok: !1,
			reason: "not_decision"
		};
		case "advance_reveal": return t.phase === T.DEAL ? { ok: !0 } : {
			ok: !1,
			reason: "not_deal"
		};
		case "submit_draw":
		case "draw_fold": return t.phase === T.DRAW ? t.turnPlayerId === r ? o.includes(r) ? {
			ok: !1,
			reason: "draw_already_complete"
		} : a ? {
			ok: !1,
			reason: "presentation_blocked"
		} : { ok: !0 } : {
			ok: !1,
			reason: "not_your_turn"
		} : {
			ok: !1,
			reason: "not_draw"
		};
		case "play_card": return t.phase === T.PLAY ? t.handComplete ? {
			ok: !1,
			reason: "hand_complete"
		} : t.turnPlayerId === r ? a ? {
			ok: !1,
			reason: "presentation_blocked"
		} : { ok: !0 } : {
			ok: !1,
			reason: "not_your_turn"
		} : {
			ok: !1,
			reason: "not_play"
		};
		case "vote_cowin": return t.pendingCoWin ? { ok: !0 } : {
			ok: !1,
			reason: "no_cowin_vote"
		};
		case "record_hand": return t.phase !== T.SETTLE && !t.handComplete ? {
			ok: !1,
			reason: "hand_not_ready_to_settle"
		} : { ok: !0 };
		default: return {
			ok: !1,
			reason: "unknown_action"
		};
	}
}
function R(e) {
	let { snapshot: n, session: r, nowMs: i } = e;
	if (n.pendingCoWin) {
		let e = r?.pendingCoWinSettlement?.winnerIds ?? [], t = r?.pendingCoWinSettlement?.votes ?? {}, n = e.find((e) => j(e) && t[e] !== "split" && t[e] !== "push");
		return n ? {
			kind: "cowin",
			turnPlayerId: n
		} : null;
	}
	if (n.phase === T.ENROLLMENT) {
		let e = r ? x(r) : null;
		if (!e?.active && !n.pagatDecisionActive) return null;
		if (n.pagatDecisionActive && r) {
			let e = y(r).handDecision;
			if (e?.active) {
				let n = t(e);
				if (!n) return null;
				if (i >= A(e)) return {
					kind: "decision_timeout",
					turnPlayerId: n
				};
				let r = e.playingIds ?? [], a = e.passedIds ?? [];
				if (j(n) && !r.includes(n) && !a.includes(n)) return {
					kind: "decision",
					turnPlayerId: n
				};
			}
			return null;
		}
		if (!b(e)) return null;
		let a = (e.orderedPlayerIds ?? [])[e.currentIndex ?? 0] ?? null;
		if (!a) return null;
		if (i >= A(e)) return {
			kind: "enrollment_timeout",
			turnPlayerId: a
		};
		let o = e.enrolledIds ?? [], s = e.declinedIds ?? [];
		return j(a) && !o.includes(a) && !s.includes(a) ? {
			kind: "enrollment",
			turnPlayerId: a
		} : null;
	}
	if (n.phase === T.DEAL) {
		let e = (r ? y(r) : N()).turnPlayerId ?? n.participantIds.find((e) => j(e)) ?? n.participantIds[0] ?? null;
		return e ? {
			kind: "advance_reveal",
			turnPlayerId: e
		} : null;
	}
	if (n.phase === T.DRAW) {
		let e = n.turnPlayerId, t = r ? y(r).drawCompletedIds ?? [] : [];
		return e && j(e) && n.participantIds.includes(e) && !t.includes(e) ? {
			kind: "draw",
			turnPlayerId: e
		} : null;
	}
	if (n.phase === T.PLAY) {
		let e = n.turnPlayerId;
		return n.handComplete || n.trickCount >= 5 ? null : e && j(e) && n.participantIds.includes(e) ? {
			kind: "play",
			turnPlayerId: e
		} : null;
	}
	return null;
}
function ie(e) {
	return R(e) != null;
}
function ae(e) {
	if (R(e)) return "has_hint";
	let { snapshot: n, session: r, nowMs: i } = e;
	if (n.pendingCoWin) return "pending_cowin_human_vote";
	if (n.phase === T.SETTLE) return "settling";
	if (n.phase === T.WAITING) return "waiting";
	if (n.phase === T.NEXT_HAND_PREP) return "next_hand_prep";
	if (n.phase === T.ENROLLMENT) {
		let e = r ? x(r) : null;
		if (!e?.active && !n.pagatDecisionActive) return "enrollment_inactive";
		if (n.pagatDecisionActive && r) {
			let e = y(r).handDecision;
			if (e?.active) {
				let n = t(e);
				return n ? i >= A(e) ? "decision_timeout_pending" : j(n) ? "decision_bot_waiting" : "decision_human_turn" : "decision_no_turn";
			}
		}
		let a = (b(e) ? e.orderedPlayerIds ?? [] : [])[b(e) ? e.currentIndex ?? 0 : 0] ?? null;
		return a ? i >= A(e) ? "enrollment_timeout_pending" : j(a) ? "enrollment_bot_waiting" : "enrollment_human_turn" : "enrollment_no_turn";
	}
	if (n.phase === T.DEAL) return "reveal_missing_leader";
	if (n.phase === T.DRAW) {
		let e = n.turnPlayerId;
		return e ? j(e) ? (r ? y(r).drawCompletedIds ?? [] : []).includes(e) ? "draw_turn_already_complete" : n.participantIds.includes(e) ? "draw_blocked" : "draw_turn_not_in_hand" : "draw_human_turn" : "draw_no_turn";
	}
	if (n.phase === T.PLAY) {
		if (n.handComplete || n.trickCount >= 5) return "play_hand_complete";
		let e = n.turnPlayerId;
		return e ? j(e) ? n.participantIds.includes(e) ? "play_blocked" : "play_turn_not_in_hand" : "play_human_turn" : "play_no_turn";
	}
	return "no_bot_hint";
}
function z(e) {
	let t = e.session;
	if (!t || t.status === "final") return !1;
	let n = P(e);
	return (n.phase === T.NEXT_HAND_PREP || n.phase === T.WAITING && (t.handCount ?? 0) > 0) && !n.pendingCoWin && !n.enrollmentActive;
}
function oe(e) {
	return e.tablePlayOpen === !0 && z(e);
}
//#endregion
//#region src/session/invariantDebug.ts
var se = "nbl-invariants", B = !1;
function ce(e = !0) {
	let t = B;
	return B = e, () => {
		B = t;
	};
}
function V(e) {
	return globalThis.process?.env?.[e];
}
function H() {
	if (B || V("NBL_INVARIANTS") === "1" || V("NODE_ENV") === "test") return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(se) === "1" ? !0 : new URLSearchParams(window.location.search).has("invariants");
	} catch {
		return !1;
	}
}
function U(e, t, n) {
	console.warn("[nbl-invariant]", e, t, n ?? {});
}
//#endregion
//#region src/session/handInvariants.ts
var W = class extends Error {
	code;
	context;
	constructor(e, t, n = {}) {
		super(t), this.name = "HandInvariantError", this.code = e, this.context = n;
	}
};
function G(e, t, n = {}) {
	throw new W(e, t, n);
}
function K(e, t, n, r = {}) {
	e || (H() && G(t, n, r), U(t, n, r));
}
var le = {
	enrollment_in: "enrollment_step",
	enrollment_pass: "enrollment_step",
	enrollment_timeout: "enrollment_step",
	decision_play: "decision_step",
	decision_pass: "decision_step",
	advance_reveal: "advance_reveal",
	submit_draw: "submit_draw",
	draw_fold: "draw_fold",
	play_card: "play_card",
	vote_cowin: "cowin_pending",
	record_hand: "record_hand"
};
function q(t) {
	let { handPhase: n, phase: r, handComplete: i, trickCount: a } = t;
	if (n === e.PLAY) {
		let e = i || a >= 5 ? T.SETTLE : T.PLAY;
		r !== e && r !== T.SETTLE && G("inconsistent_hand_phase", `card phase play maps to ${e}, got flow phase ${r}`, {
			handPhase: n,
			phase: r,
			handComplete: i,
			trickCount: a
		});
	} else n === e.DRAW && r !== T.DRAW ? G("inconsistent_hand_phase", `card phase draw requires flow phase draw, got ${r}`, {
		handPhase: n,
		phase: r
	}) : n === e.REVEAL && r !== T.DEAL ? G("inconsistent_hand_phase", `card phase reveal requires flow phase deal, got ${r}`, {
		handPhase: n,
		phase: r
	}) : n === e.DECISION && r !== T.ENROLLMENT && G("inconsistent_hand_phase", `card phase decision requires flow phase enrollment, got ${r}`, {
		handPhase: n,
		phase: r
	});
}
function J(e, t) {
	let n = y(t), r = e.phase === T.DRAW || e.phase === T.PLAY || e.phase === T.ENROLLMENT;
	if (!r) return;
	let i = n.turnPlayerId ?? null, a = e.turnPlayerId;
	(e.phase === T.DRAW || e.phase === T.PLAY) && (a !== i && G("turn_owner_mismatch", "Flow turn owner disagrees with currentHand.turnPlayerId", {
		flowTurn: a,
		handTurn: i,
		phase: e.phase
	}), i && e.participantIds.length && !e.participantIds.includes(i) && G("turn_owner_not_participant", "Turn player is not in participantIds", {
		handTurn: i,
		participantIds: e.participantIds
	})), e.phase === T.ENROLLMENT && !e.enrollmentActive && !e.pagatDecisionActive && a && G("orphan_enrollment_turn", "Turn owner set while enrollment gate is inactive", {
		flowTurn: a,
		phase: e.phase
	}), r && !a && e.participantIds.length > 0 && K(!1, "missing_turn_owner", "Active hand phase has no turn owner", {
		phase: e.phase,
		participantIds: e.participantIds
	});
}
function Y(e, t, n = {}) {
	k(e, t) || G("illegal_transition", `Transition not allowed: ${e} + ${t}`, {
		from: e,
		event: t,
		...n
	});
}
function X(e) {
	return le[e] ?? null;
}
function ue(e) {
	if (!e) return;
	let t = P({ session: e });
	q(t), J(t, e);
}
function Z(e, { settlement: t, allowIncomplete: n = !1 } = {}) {
	let r = P({ session: e });
	q(r);
	let i = new Set([
		"push",
		"co_win_carry",
		"non_winner_ante_up"
	]), a = t ?? null;
	n || a && i.has(a) || (r.phase === T.PLAY && !r.handComplete && G("settlement_before_play_complete", "Cannot settle a win/split while play is incomplete", {
		phase: r.phase,
		trickCount: r.trickCount,
		handComplete: r.handComplete,
		settlement: a
	}), r.phase !== T.SETTLE && !r.handComplete && !r.pendingCoWin && G("settlement_before_play_complete", "Hand is not ready to settle", {
		phase: r.phase,
		trickCount: r.trickCount,
		handComplete: r.handComplete,
		pendingCoWin: r.pendingCoWin,
		settlement: a
	}));
}
function de(e, t, n, r, i = []) {
	let a = P({ session: e });
	q(a);
	let o = L({
		snapshot: a,
		action: t,
		playerId: n,
		actorId: r,
		drawCompletedIds: i
	});
	o.ok || G("action_blocked", `Action ${t} blocked: ${o.reason ?? "unknown"}`, {
		action: t,
		playerId: n,
		actorId: r,
		reason: o.reason,
		phase: a.phase
	});
	let s = X(t);
	s && (t === "draw_fold" ? k(a.phase, "draw_fold") || k(a.phase, "solo_win") || G("illegal_transition", `Draw fold not allowed from phase ${a.phase}`, {
		action: t,
		phase: a.phase
	}) : Y(a.phase, s, {
		action: t,
		playerId: n
	})), t === "record_hand" && Z(e, {});
}
function fe(e, t = {}) {
	e && K(!1, "duplicate_bot_advance", "Bot advance already in flight — duplicate execute blocked", t);
}
function pe(e, t, n = {}, r = 0) {
	if (Math.abs(e - t) <= r) return;
	let i = `Session chip total drifted: ${e} → ${t} (Δ ${t - e})`;
	H() && G("chip_total_drift", i, {
		beforeTotal: e,
		afterTotal: t,
		...n
	}), U("chip_total_drift", i, {
		beforeTotal: e,
		afterTotal: t,
		...n
	});
}
//#endregion
//#region src/session/sessionSolvency.ts
function Q(e, t = 0) {
	if (e?.bankroll != null && Number.isFinite(Number(e.bankroll))) return Math.max(0, Number(e.bankroll));
	let n = Math.max(0, Number(t) || 0), r = Number(e?.net) || 0;
	return n > 0 ? Math.max(0, n + r) : Math.max(0, r);
}
function me(e, t = 0) {
	let n = Math.max(0, Number(t) || 0);
	return Math.max(0, Number(e) || 0) - n;
}
function he(e, t, n = 0) {
	return (e || []).filter((e) => {
		let r = t?.[e];
		return r?.out === !0 || r?.sitOut === !0 ? !1 : Q(r, n) > 0;
	});
}
function ge(e, t, n = 0) {
	return he(e, t, n).length;
}
function _e(e) {
	return e >= 2;
}
function ve(e) {
	return e === 1;
}
function ye(e) {
	let { winnerId: t, carryIn: n = 0, postedAntes: r = {}, scoreById: i, buyInFallback: a = 0, sortedPlayerIds: o } = e, s = Math.max(0, Number(n) || 0) + Object.values(r).reduce((e, t) => e + Math.max(0, Number(t) || 0), 0), c = {};
	for (let e of o) {
		let n = Q(i[e], a), r = e === t ? n + s : n, o = {
			bankroll: r,
			net: me(r, a)
		};
		e === t && s > 0 && (o.handsWon = (i[e]?.handsWon ?? 0) + 1), c[e] = o;
	}
	return {
		winnerId: t,
		potAwarded: s,
		scorePatches: c
	};
}
//#endregion
//#region src/session/tableStartup.ts
function be(e) {
	let t = e?.liveEnrollment?.deal?.publicHand;
	return !t?.phase || x(e)?.active || e?.pendingCoWinSettlement || !u(e?.currentHand) ? !1 : c(t.tricksByPlayer ?? {}, t.participantIds ?? []);
}
function $(e) {
	if (!e?.liveEnrollment?.deal) return !1;
	if (be(e)) return !0;
	let t = e.liveEnrollment.deal.publicHand?.phase ?? null, n = !!(e.liveEnrollment?.active || e.handEnrollment?.active);
	return (t === "draw" || t === "play") && !n ? u(e.currentHand) : t === "draw" || t === "play" ? !1 : u(e?.currentHand);
}
function xe(e, t) {
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
	let n = y(e).phase ?? null;
	return n === "reveal" || n === "decision" || n === "draw" || n === "play" ? {
		kind: "ready_mid_hand",
		canOpenTable: !0,
		needsEnrollment: !1,
		shouldRepair: $(e),
		reason: "hand_in_progress",
		recovery: "refresh"
	} : $(e) ? {
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
function Se(e) {
	return e.needsEnrollment;
}
function Ce(e, t) {
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
export { T as HAND_FLOW_PHASE, E as HAND_FLOW_TRANSITIONS, W as HandInvariantError, xe as analyzeTableStartup, fe as assertBotAdvanceNotInFlight, q as assertConsistentHandFlowPhase, de as assertHandActionAllowed, ue as assertHandFlowConsistent, Y as assertHandFlowTransition, pe as assertSessionChipConserved, Z as assertSettlementEntryAllowed, J as assertSingleTurnOwner, y as authoritativeCurrentHand, P as buildHandFlowSnapshot, ye as buildSoleSurvivorSessionEnd, M as canActForPlayer, ie as canAdvanceBots, ne as canPlayerShowHandChoice, L as canSubmitHandAction, K as checkInvariant, ge as countEligibleForNextHand, F as deriveHandFlowPhase, A as enrollmentDeadlineMs, G as failInvariant, X as flowEventForAction, ce as forceInvariantsForTests, _ as handPhaseStarted, u as isClearedPreDealHand, v as isHandAwaitingSettlement, k as isHandFlowTransitionAllowed, H as isInvariantsStrict, S as isLegacyEnrollmentActive, C as isPagatDecisionActive, j as isRobotPlayerId, be as isStaleLiveDealSnapshot, U as logInvariantViolation, re as nextHandFlowPhase, ae as resolveBotAdvanceEmptyReason, R as resolveBotAdvanceHint, w as resolveCurrentHandChoicePlayerId, I as resolveHandFlowTurnPlayerId, te as resolveTableEnrollmentActive, ee as sessionHandDealStarted, oe as shouldAutoOpenNextHand, $ as shouldClearOrphanLiveEnrollment, ve as shouldFinalizeForSoleSurvivor, z as shouldOpenEnrollmentAfterSettle, _e as shouldOpenNextHandEnrollment, Se as tableStartupNeedsEnrollment, Ce as tableStartupUserMessage };
