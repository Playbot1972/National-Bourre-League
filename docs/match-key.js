//#region src/game/playerOrder.ts
function e(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function t(t, n, r) {
	let i = e(t, r), a = new Set(n);
	return i.filter((e) => a.has(e));
}
function n(e, t) {
	return e.seatedIds?.length ? e.seatedIds : t?.length ? t : e.participantIds ?? [];
}
function r(e, r) {
	let i = e.participantIds ?? [];
	if (!i.length) return [];
	let a = n(e, r), o = a.length > 0 ? a : r?.length ? r : i, s = t(e.dealerId, i, o);
	if (s.length > 0) return s;
	if (e.dealerId) return t(e.dealerId, i, i);
	if (e.actionOrder?.length) {
		let t = e.actionOrder.filter((e) => i.includes(e));
		if (t.length > 0) return t;
	}
	return i;
}
//#endregion
//#region src/game/handParticipants.ts
function i(e) {
	return e.participantIds ?? [];
}
function a(e) {
	let t = new Set(i(e));
	return (e.drawCompletedIds ?? []).filter((e) => t.has(e)).length;
}
function o(e) {
	let t = i(e);
	return {
		eligibleIds: t,
		drawCompleted: a(e),
		drawTotal: t.length,
		actionOrder: r({
			participantIds: [...t],
			actionOrder: e.actionOrder,
			dealerId: e.dealerId,
			seatedIds: e.seatedIds
		})
	};
}
//#endregion
//#region src/table/gameFlowDebug.ts
var s = "nbl-game-flow-debug", c = !1, l = null;
function u() {
	if (c) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(s) === "1" ? !0 : new URLSearchParams(window.location.search).has("gameFlowDebug");
	} catch {
		return !1;
	}
}
function d(e, t, n) {
	if (!u()) return;
	let r = `[nbl-flow ${typeof performance < "u" ? `${performance.now().toFixed(1)}ms` : ""}] ${e} :: ${t}`;
	if (l) {
		l(r.trim(), n);
		return;
	}
	console.info(r, n ?? "");
}
//#endregion
//#region src/table/botThinkWindow.ts
function f(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
//#endregion
//#region src/table/matchKey.ts
function p(e) {
	if (e.serverActionSeq == null) throw Error("Missing authoritative serverActionSeq");
	return `${e.sessionId}-h${e.handNumber}-t${e.trickNumber ?? 0}-turn${e.turnIndex ?? 0}-aseq${e.serverActionSeq}`;
}
function m(e, t) {
	if (!t) return 0;
	let n = e.indexOf(t);
	return n >= 0 ? n : 0;
}
function h(e) {
	let { actionOrder: t } = o({
		participantIds: e.participantIds ? [...e.participantIds] : void 0,
		drawCompletedIds: e.drawCompletedIds ? [...e.drawCompletedIds] : void 0,
		actionOrder: e.actionOrder ? [...e.actionOrder] : void 0,
		dealerId: e.dealerId,
		seatedIds: e.seatedIds ? [...e.seatedIds] : void 0
	});
	return {
		sessionId: e.sessionId,
		handNumber: e.handNumber,
		trickNumber: e.trickNumber ?? 0,
		turnIndex: m(t, e.turnPlayerId ?? null),
		serverActionSeq: e.serverActionSeq,
		turnPlayerId: e.turnPlayerId ?? null
	};
}
function g(e) {
	return o(e);
}
function _(e, t) {
	return e !== t;
}
function v(e) {
	return e.phase === "live" && e.serverTrickPlays > 0 && e.revealedCount < e.revealTarget;
}
function y(e) {
	let t = !!(e.turnPlayerId && e.heroId && e.turnPlayerId === e.heroId), n = !!(e.turnPlayerId && e.botIds.has(e.turnPlayerId)), r = e.presentation.matchKey === e.matchKey && (e.presentation.pipelineActive || e.presentation.motionGateActive || e.presentation.revealCatchUp || e.presentation.handPresenting);
	return {
		isHeroTurn: t,
		isBotTurn: n,
		visualCatchUpBusy: r,
		canHeroAct: t && !r,
		needsBotDriver: n && !r
	};
}
function b(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) f(n) && t.add(n);
	return t;
}
function x(e) {
	if (e.isHeroTurn && e.isBotTurn) {
		let t = "Invariant violation: hero and bot cannot both own the turn";
		throw u() && d("matchKey", "invariant-violation", {
			message: t,
			input: e
		}), Error(t);
	}
	if (e.canHeroAct && e.needsBotDriver) {
		let t = "Invariant violation: hero and bot cannot both be active";
		throw u() && d("matchKey", "invariant-violation", {
			message: t,
			input: e
		}), Error(t);
	}
	e.presentation.matchKey !== e.matchKey && (e.presentation.pipelineActive || e.presentation.motionGateActive || e.presentation.revealCatchUp || e.presentation.handPresenting) && u() && d("matchKey", "stale-presentation-busy", {
		authoritative: e.matchKey,
		presentation: e.presentation.matchKey
	});
	let t = e.drawCompleted ?? 0, n = e.drawTotal ?? 0;
	if (n > 0 && t > n) {
		let r = `Invariant violation: drawCompleted (${t}) > drawTotal (${n})`;
		throw u() && d("matchKey", "invariant-violation", {
			message: r,
			input: e
		}), Error(r);
	}
}
//#endregion
export { x as assertMatchKeyInvariants, p as buildMatchKey, h as buildServerSnapshot, g as canonicalTableHandMetrics, b as collectBotIds, m as computeTurnIndex, y as deriveTableReadiness, v as isRevealCatchUpBusy, _ as isStaleMatchKey };
