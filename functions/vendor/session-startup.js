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
r[1], r[2], r[3], r[4], r[5], r[6], r[1], r[6], r[4];
var i = {
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
}, a = {
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
i[1], i[2], i[3], i[4], i[5], i[6], a[1], a[2], a[3], a[4], a[5], a[6], i[1], i[6], i[4];
function o(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function s(e, t) {
	return o(e, t) >= 5;
}
//#endregion
//#region src/session/liveHand.ts
function c() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function l(e) {
	let t = e ?? c();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function u(e) {
	if (!e) return !1;
	let t = e.phase ?? null;
	if (t !== "draw" && t !== "play" && t !== "reveal" && t !== "decision") return !1;
	let n = e.participantIds ?? [];
	if (n.length === 0) return !1;
	let r = e.tricksByPlayer ?? {};
	return !(s(r, n) || o(r, n) >= 5);
}
function d(e) {
	if (!e) return 0;
	let t = e.phase ?? "", n = t === "play" ? 1e3 : t === "draw" ? 100 : t === "decision" ? 50 : t === "reveal" ? 25 : 0;
	n += (e.drawCompletedIds?.length ?? 0) * 10;
	let r = e.participantIds ?? [];
	n += o(e.tricksByPlayer ?? {}, r);
	let i = e.handDecision;
	return t === "decision" && i && (n += (i.currentIndex ?? 0) * 5, n += (i.playingIds?.length ?? 0) * 2, n += (i.passedIds?.length ?? 0) * 2), n;
}
function f(e, t) {
	return u(t) ? u(e) ? d(t) >= d(e) ? t : e : t : e;
}
function p(e) {
	let t = e?.phase ?? null;
	return t === "reveal" || t === "decision" || t === "draw" || t === "play";
}
function m(e) {
	return e ? p(e.currentHand) || p(e.liveEnrollment?.deal?.publicHand) ? !0 : p(h(e)) : !1;
}
function h(e) {
	let t = e?.currentHand ?? c(), n = e?.liveEnrollment?.deal?.publicHand, r = n?.phase ?? null;
	if (u(t) && u(n)) {
		let e = t.phase === "reveal" || t.phase === "decision", r = n?.drawCompletedIds?.length ?? 0, i = t.drawCompletedIds?.length ?? 0, a = o(n?.tricksByPlayer ?? {}, n?.participantIds ?? []), s = o(t.tricksByPlayer ?? {}, t.participantIds ?? []);
		return e && n?.phase === "draw" && s === 0 && a === 0 && r > 0 && i === 0 ? t : f(t, n);
	}
	if (u(t)) return t;
	if (r === "draw" || r === "play" || r === "reveal" || r === "decision") {
		if (u(n)) {
			let i = o(n?.tricksByPlayer ?? {}, n?.participantIds ?? []);
			return l(t) && i === 0 && r === "draw" && !e?.liveEnrollment?.active ? c() : n;
		}
		return n?.phase ? n : p(t) ? t : l(t) ? c() : t;
	}
	return r && n ? n : t;
}
function g(e) {
	let t = h(e), r = t?.phase ?? null;
	if (r === "reveal" || r === "draw" || r === "play") return null;
	if (r === "decision") {
		let e = n(t.handDecision ?? null);
		if (e?.active) return e;
	}
	let i = e?.liveEnrollment, a = i?.deal?.publicHand?.phase ?? null;
	return i?.active ? i : a === "draw" || a === "play" || a === "reveal" || a === "decision" ? null : e?.handEnrollment?.active ? e.handEnrollment : e?.handEnrollment ?? null;
}
function _(e) {
	return !e.cardsDealt && e.handParticipantCount === 0 && e.enrollmentActive;
}
function v(e, t) {
	return e === "decision" && t?.active === !0;
}
function y(e) {
	return e.legacyEnrollmentActive || e.pagatDecisionActive;
}
function b(e) {
	return e.pagatDecisionActive && e.handDecision ? (e.handDecision.orderedPlayerIds ?? [])[e.handDecision.currentIndex ?? 0] ?? null : e.legacyEnrollmentActive && e.enrollment?.active ? (e.enrollment.orderedPlayerIds ?? [])[e.enrollment.currentIndex ?? 0] ?? null : null;
}
function x(e) {
	return e.enrollmentGateActive && e.isSelf && !e.isFinal && e.playerId === e.currentChoicePlayerId && e.bankroll > 0 && !e.isOut;
}
//#endregion
//#region src/session/handPhaseMachine.ts
var S = {
	WAITING: "waiting",
	ENROLLMENT: "enrollment",
	DEAL: "deal",
	DRAW: "draw",
	PLAY: "play",
	SETTLE: "settle",
	NEXT_HAND_PREP: "next-hand-prep"
}, C = [
	{
		from: S.WAITING,
		event: "open_enrollment",
		to: S.ENROLLMENT
	},
	{
		from: S.WAITING,
		event: "deal_cards",
		to: S.DEAL
	},
	{
		from: S.NEXT_HAND_PREP,
		event: "open_enrollment",
		to: S.ENROLLMENT
	},
	{
		from: S.NEXT_HAND_PREP,
		event: "deal_cards",
		to: S.DEAL
	},
	{
		from: S.NEXT_HAND_PREP,
		event: "prep_complete",
		to: S.WAITING
	},
	{
		from: S.ENROLLMENT,
		event: "enrollment_step",
		to: S.ENROLLMENT
	},
	{
		from: S.ENROLLMENT,
		event: "enrollment_complete",
		to: S.DEAL
	},
	{
		from: S.ENROLLMENT,
		event: "solo_win",
		to: S.SETTLE
	},
	{
		from: S.ENROLLMENT,
		event: "decision_complete",
		to: S.DRAW
	},
	{
		from: S.DEAL,
		event: "advance_reveal",
		to: S.DRAW
	},
	{
		from: S.DEAL,
		event: "decision_step",
		to: S.ENROLLMENT
	},
	{
		from: S.DRAW,
		event: "submit_draw",
		to: S.DRAW
	},
	{
		from: S.DRAW,
		event: "draw_fold",
		to: S.DRAW
	},
	{
		from: S.DRAW,
		event: "draw_complete",
		to: S.PLAY
	},
	{
		from: S.DRAW,
		event: "solo_win",
		to: S.SETTLE
	},
	{
		from: S.PLAY,
		event: "play_card",
		to: S.PLAY
	},
	{
		from: S.PLAY,
		event: "hand_complete",
		to: S.SETTLE
	},
	{
		from: S.SETTLE,
		event: "cowin_pending",
		to: S.SETTLE
	},
	{
		from: S.SETTLE,
		event: "record_hand",
		to: S.NEXT_HAND_PREP
	},
	{
		from: S.NEXT_HAND_PREP,
		event: "session_final",
		to: S.WAITING
	}
], w = (e, t) => `${e}:${t}`, T = new Map(C.map((e) => [w(e.from, e.event), e.to]));
function E(e, t) {
	return T.has(w(e, t));
}
function ee(e, t) {
	return T.get(w(e, t)) ?? null;
}
function D(e) {
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
function O(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
function k(e, t) {
	return !e || !t ? !1 : e === t ? !0 : O(e);
}
function A() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function j(t) {
	let n = t.session, r = n ? h(n) : A(), i = r.phase ?? null, a = r.participantIds ?? [], c = r.tricksByPlayer ?? {}, u = o(c, a), d = a.length > 0 && s(c, a), f = !!n?.pendingCoWinSettlement?.winnerIds?.length, p = n ? g(n) : null, m = v(i, r.handDecision ?? null), y = _({
		cardsDealt: i === e.REVEAL || i === e.DECISION || i === e.DRAW || i === e.PLAY,
		handParticipantCount: a.length,
		enrollmentActive: !!p?.active
	}), b = y || m, x = M({
		sessionStatus: n?.status ?? null,
		handPhase: i,
		participantIds: a,
		trickCount: u,
		handComplete: d,
		pendingCoWin: f,
		enrollmentActive: b,
		handCount: n?.handCount ?? 0,
		clearedHand: l(r)
	});
	return {
		phase: x,
		handPhase: i,
		enrollmentActive: b,
		pagatDecisionActive: m,
		participantIds: a,
		turnPlayerId: N({
			phase: x,
			handPhase: i,
			hand: r,
			enrollment: p,
			pagatDecisionActive: m,
			legacyEnrollmentActive: y
		}),
		handComplete: d,
		pendingCoWin: f,
		trickCount: u
	};
}
function M(t) {
	if (t.sessionStatus === "final") return S.WAITING;
	if (t.pendingCoWin) return S.SETTLE;
	let n = t.handPhase ?? null, r = t.participantIds ?? [];
	return n === e.PLAY ? t.handComplete || (t.trickCount ?? 0) >= 5 ? S.SETTLE : S.PLAY : n === e.DRAW ? S.DRAW : n === e.REVEAL ? S.DEAL : n === e.DECISION || t.enrollmentActive ? S.ENROLLMENT : t.clearedHand !== !1 && r.length === 0 && (t.handCount ?? 0) > 0 && !t.enrollmentActive ? S.NEXT_HAND_PREP : S.WAITING;
}
function N(e) {
	let { phase: t, hand: n, enrollment: r, pagatDecisionActive: i, legacyEnrollmentActive: a } = e;
	return t === S.ENROLLMENT ? b({
		pagatDecisionActive: i,
		handDecision: n.handDecision ?? null,
		legacyEnrollmentActive: a,
		enrollment: r
	}) : t === S.DRAW || t === S.PLAY ? n.turnPlayerId ?? null : null;
}
function P(e) {
	let { snapshot: t, action: n, playerId: r, actorId: i, suppressTurn: a = !1 } = e, o = e.drawCompletedIds ?? [];
	if (!k(r, i)) return {
		ok: !1,
		reason: "actor_mismatch"
	};
	switch (n) {
		case "enrollment_in":
		case "enrollment_pass": return t.phase === S.ENROLLMENT ? t.turnPlayerId === r ? { ok: !0 } : {
			ok: !1,
			reason: "not_your_turn"
		} : {
			ok: !1,
			reason: "not_enrollment"
		};
		case "enrollment_timeout": return t.phase === S.ENROLLMENT ? { ok: !0 } : {
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
		case "advance_reveal": return t.phase === S.DEAL ? { ok: !0 } : {
			ok: !1,
			reason: "not_deal"
		};
		case "submit_draw":
		case "draw_fold": return t.phase === S.DRAW ? t.turnPlayerId === r ? o.includes(r) ? {
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
		case "play_card": return t.phase === S.PLAY ? t.handComplete ? {
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
		case "record_hand": return t.phase !== S.SETTLE && !t.handComplete ? {
			ok: !1,
			reason: "hand_not_ready_to_settle"
		} : { ok: !0 };
		default: return {
			ok: !1,
			reason: "unknown_action"
		};
	}
}
function F(e) {
	let { snapshot: n, session: r, nowMs: i } = e;
	if (n.pendingCoWin) {
		let e = r?.pendingCoWinSettlement?.winnerIds ?? [], t = r?.pendingCoWinSettlement?.votes ?? {}, n = e.find((e) => O(e) && t[e] !== "split" && t[e] !== "push");
		return n ? {
			kind: "cowin",
			turnPlayerId: n
		} : null;
	}
	if (n.phase === S.ENROLLMENT) {
		let e = r ? g(r) : null;
		if (!e?.active && !n.pagatDecisionActive) return null;
		if (n.pagatDecisionActive && r) {
			let e = h(r).handDecision;
			if (e?.active) {
				let n = t(e);
				if (!n) return null;
				if (i >= D(e)) return {
					kind: "decision_timeout",
					turnPlayerId: n
				};
				let r = e.playingIds ?? [], a = e.passedIds ?? [];
				if (O(n) && !r.includes(n) && !a.includes(n)) return {
					kind: "decision",
					turnPlayerId: n
				};
			}
			return null;
		}
		let a = (e?.orderedPlayerIds ?? [])[e?.currentIndex ?? 0] ?? null;
		if (!a) return null;
		if (i >= D(e)) return {
			kind: "enrollment_timeout",
			turnPlayerId: a
		};
		let o = e?.enrolledIds ?? [], s = e?.declinedIds ?? [];
		return O(a) && !o.includes(a) && !s.includes(a) ? {
			kind: "enrollment",
			turnPlayerId: a
		} : null;
	}
	if (n.phase === S.DRAW) {
		let e = n.turnPlayerId, t = r ? h(r).drawCompletedIds ?? [] : [];
		return e && O(e) && n.participantIds.includes(e) && !t.includes(e) ? {
			kind: "draw",
			turnPlayerId: e
		} : null;
	}
	if (n.phase === S.PLAY) {
		let e = n.turnPlayerId;
		return n.handComplete || n.trickCount >= 5 ? null : e && O(e) && n.participantIds.includes(e) ? {
			kind: "play",
			turnPlayerId: e
		} : null;
	}
	return null;
}
function I(e) {
	return F(e) != null;
}
function L(e) {
	let t = e.session;
	if (!t || t.status === "final") return !1;
	let n = j(e);
	return (n.phase === S.NEXT_HAND_PREP || n.phase === S.WAITING && (t.handCount ?? 0) > 0) && !n.pendingCoWin && !n.enrollmentActive;
}
function R(e) {
	return e.tablePlayOpen === !0 && L(e);
}
//#endregion
//#region src/session/invariantDebug.ts
var z = "nbl-invariants", B = !1;
function V(e = !0) {
	let t = B;
	return B = e, () => {
		B = t;
	};
}
function H() {
	if (B || typeof process < "u" && process.env?.NBL_INVARIANTS === "1" || typeof process < "u" && process.env.NODE_ENV === "test") return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(z) === "1" ? !0 : new URLSearchParams(window.location.search).has("invariants");
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
var te = {
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
		let e = i || a >= 5 ? S.SETTLE : S.PLAY;
		r !== e && r !== S.SETTLE && G("inconsistent_hand_phase", `card phase play maps to ${e}, got flow phase ${r}`, {
			handPhase: n,
			phase: r,
			handComplete: i,
			trickCount: a
		});
	} else n === e.DRAW && r !== S.DRAW ? G("inconsistent_hand_phase", `card phase draw requires flow phase draw, got ${r}`, {
		handPhase: n,
		phase: r
	}) : n === e.REVEAL && r !== S.DEAL ? G("inconsistent_hand_phase", `card phase reveal requires flow phase deal, got ${r}`, {
		handPhase: n,
		phase: r
	}) : n === e.DECISION && r !== S.ENROLLMENT && G("inconsistent_hand_phase", `card phase decision requires flow phase enrollment, got ${r}`, {
		handPhase: n,
		phase: r
	});
}
function J(e, t) {
	let n = h(t), r = e.phase === S.DRAW || e.phase === S.PLAY || e.phase === S.ENROLLMENT;
	if (!r) return;
	let i = n.turnPlayerId ?? null, a = e.turnPlayerId;
	(e.phase === S.DRAW || e.phase === S.PLAY) && (a !== i && G("turn_owner_mismatch", "Flow turn owner disagrees with currentHand.turnPlayerId", {
		flowTurn: a,
		handTurn: i,
		phase: e.phase
	}), i && e.participantIds.length && !e.participantIds.includes(i) && G("turn_owner_not_participant", "Turn player is not in participantIds", {
		handTurn: i,
		participantIds: e.participantIds
	})), e.phase === S.ENROLLMENT && !e.enrollmentActive && !e.pagatDecisionActive && a && G("orphan_enrollment_turn", "Turn owner set while enrollment gate is inactive", {
		flowTurn: a,
		phase: e.phase
	}), r && !a && e.participantIds.length > 0 && K(!1, "missing_turn_owner", "Active hand phase has no turn owner", {
		phase: e.phase,
		participantIds: e.participantIds
	});
}
function Y(e, t, n = {}) {
	E(e, t) || G("illegal_transition", `Transition not allowed: ${e} + ${t}`, {
		from: e,
		event: t,
		...n
	});
}
function X(e) {
	return te[e] ?? null;
}
function ne(e) {
	if (!e) return;
	let t = j({ session: e });
	q(t), J(t, e);
}
function Z(e, { settlement: t, allowIncomplete: n = !1 } = {}) {
	let r = j({ session: e });
	q(r);
	let i = new Set([
		"push",
		"co_win_carry",
		"non_winner_ante_up"
	]), a = t ?? null;
	n || a && i.has(a) || (r.phase === S.PLAY && !r.handComplete && G("settlement_before_play_complete", "Cannot settle a win/split while play is incomplete", {
		phase: r.phase,
		trickCount: r.trickCount,
		handComplete: r.handComplete,
		settlement: a
	}), r.phase !== S.SETTLE && !r.handComplete && !r.pendingCoWin && G("settlement_before_play_complete", "Hand is not ready to settle", {
		phase: r.phase,
		trickCount: r.trickCount,
		handComplete: r.handComplete,
		pendingCoWin: r.pendingCoWin,
		settlement: a
	}));
}
function re(e, t, n, r, i = []) {
	let a = j({ session: e });
	q(a);
	let o = P({
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
	s && (t === "draw_fold" ? E(a.phase, "draw_fold") || E(a.phase, "solo_win") || G("illegal_transition", `Draw fold not allowed from phase ${a.phase}`, {
		action: t,
		phase: a.phase
	}) : Y(a.phase, s, {
		action: t,
		playerId: n
	})), t === "record_hand" && Z(e, {});
}
function ie(e, t = {}) {
	e && K(!1, "duplicate_bot_advance", "Bot advance already in flight — duplicate execute blocked", t);
}
function ae(e, t, n = {}, r = 0) {
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
//#region src/session/tableStartup.ts
function Q(e) {
	let t = e?.liveEnrollment?.deal?.publicHand;
	return !t?.phase || g(e)?.active || e?.pendingCoWinSettlement || !l(e?.currentHand) ? !1 : s(t.tricksByPlayer ?? {}, t.participantIds ?? []);
}
function $(e) {
	if (!e?.liveEnrollment?.deal) return !1;
	if (Q(e)) return !0;
	let t = e.liveEnrollment.deal.publicHand?.phase ?? null, n = !!(e.liveEnrollment?.active || e.handEnrollment?.active);
	return (t === "draw" || t === "play") && !n ? l(e.currentHand) : t === "draw" || t === "play" ? !1 : l(e?.currentHand);
}
function oe(e, t) {
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
	let n = h(e).phase ?? null;
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
function se(e) {
	return e.needsEnrollment;
}
function ce(e, t) {
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
export { S as HAND_FLOW_PHASE, C as HAND_FLOW_TRANSITIONS, W as HandInvariantError, oe as analyzeTableStartup, ie as assertBotAdvanceNotInFlight, q as assertConsistentHandFlowPhase, re as assertHandActionAllowed, ne as assertHandFlowConsistent, Y as assertHandFlowTransition, ae as assertSessionChipConserved, Z as assertSettlementEntryAllowed, J as assertSingleTurnOwner, h as authoritativeCurrentHand, j as buildHandFlowSnapshot, k as canActForPlayer, I as canAdvanceBots, x as canPlayerShowHandChoice, P as canSubmitHandAction, K as checkInvariant, M as deriveHandFlowPhase, D as enrollmentDeadlineMs, G as failInvariant, X as flowEventForAction, V as forceInvariantsForTests, p as handPhaseStarted, l as isClearedPreDealHand, E as isHandFlowTransitionAllowed, H as isInvariantsStrict, _ as isLegacyEnrollmentActive, v as isPagatDecisionActive, O as isRobotPlayerId, Q as isStaleLiveDealSnapshot, U as logInvariantViolation, ee as nextHandFlowPhase, F as resolveBotAdvanceHint, b as resolveCurrentHandChoicePlayerId, N as resolveHandFlowTurnPlayerId, y as resolveTableEnrollmentActive, m as sessionHandDealStarted, R as shouldAutoOpenNextHand, $ as shouldClearOrphanLiveEnrollment, L as shouldOpenEnrollmentAfterSettle, se as tableStartupNeedsEnrollment, ce as tableStartupUserMessage };
