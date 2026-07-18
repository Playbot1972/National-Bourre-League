//#region src/table/gameFlowDebug.ts
var e = "nbl-game-flow-debug", t = !1, n = null;
function r() {
	if (t) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(e) === "1" ? !0 : new URLSearchParams(window.location.search).has("gameFlowDebug");
	} catch {
		return !1;
	}
}
function i(e, t, i) {
	if (!r()) return;
	let a = `[nbl-flow ${typeof performance < "u" ? `${performance.now().toFixed(1)}ms` : ""}] ${e} :: ${t}`;
	if (n) {
		n(a.trim(), i);
		return;
	}
	console.info(a, i ?? "");
}
//#endregion
//#region src/table/botThinkWindow.ts
function a(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
//#endregion
//#region src/table/matchKey.ts
function o(e) {
	if (e.serverActionSeq == null) throw Error("Missing authoritative serverActionSeq");
	return `${e.sessionId}-h${e.handNumber}-t${e.trickNumber ?? 0}-turn${e.turnIndex ?? 0}-aseq${e.serverActionSeq}`;
}
function s(e, t) {
	if (!t) return 0;
	let n = e.indexOf(t);
	return n >= 0 ? n : 0;
}
function c(e) {
	let t = e.actionOrder && e.actionOrder.length > 0 ? e.actionOrder : e.participantIds ?? [];
	return {
		sessionId: e.sessionId,
		handNumber: e.handNumber,
		trickNumber: e.trickNumber ?? 0,
		turnIndex: s(t, e.turnPlayerId ?? null),
		serverActionSeq: e.serverActionSeq,
		turnPlayerId: e.turnPlayerId ?? null
	};
}
function l(e, t) {
	return e !== t;
}
function u(e) {
	return e.phase === "live" && e.serverTrickPlays > 0 && e.revealedCount < e.revealTarget;
}
function d(e) {
	let t = !!(e.turnPlayerId && e.heroId && e.turnPlayerId === e.heroId), n = !!(e.turnPlayerId && e.botIds.has(e.turnPlayerId)), r = e.presentation.matchKey === e.matchKey && (e.presentation.pipelineActive || e.presentation.motionGateActive || e.presentation.revealCatchUp || e.presentation.handPresenting);
	return {
		isHeroTurn: t,
		isBotTurn: n,
		visualCatchUpBusy: r,
		canHeroAct: t && !r,
		needsBotDriver: n && !r
	};
}
function f(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) a(n) && t.add(n);
	return t;
}
function p(e) {
	if (e.isHeroTurn && e.isBotTurn) {
		let t = "Invariant violation: hero and bot cannot both own the turn";
		throw r() && i("matchKey", "invariant-violation", {
			message: t,
			input: e
		}), Error(t);
	}
	if (e.canHeroAct && e.needsBotDriver) {
		let t = "Invariant violation: hero and bot cannot both be active";
		throw r() && i("matchKey", "invariant-violation", {
			message: t,
			input: e
		}), Error(t);
	}
	e.presentation.matchKey !== e.matchKey && (e.presentation.pipelineActive || e.presentation.motionGateActive || e.presentation.revealCatchUp || e.presentation.handPresenting) && r() && i("matchKey", "stale-presentation-busy", {
		authoritative: e.matchKey,
		presentation: e.presentation.matchKey
	});
	let t = e.drawCompleted ?? 0, n = e.drawTotal ?? 0;
	if (n > 0 && t > n) {
		let a = `Invariant violation: drawCompleted (${t}) > drawTotal (${n})`;
		throw r() && i("matchKey", "invariant-violation", {
			message: a,
			input: e
		}), Error(a);
	}
}
//#endregion
export { p as assertMatchKeyInvariants, o as buildMatchKey, c as buildServerSnapshot, f as collectBotIds, s as computeTurnIndex, d as deriveTableReadiness, u as isRevealCatchUpBusy, l as isStaleMatchKey };
