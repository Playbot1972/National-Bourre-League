//#region \0rolldown/runtime.js
var e = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), t = /* @__PURE__ */ e(((e) => {
	function t(e, t) {
		var n = e.length;
		e.push(t);
		a: for (; 0 < n;) {
			var r = n - 1 >>> 1, a = e[r];
			if (0 < i(a, t)) e[r] = t, e[n] = a, n = r;
			else break a;
		}
	}
	function n(e) {
		return e.length === 0 ? null : e[0];
	}
	function r(e) {
		if (e.length === 0) return null;
		var t = e[0], n = e.pop();
		if (n !== t) {
			e[0] = n;
			a: for (var r = 0, a = e.length, o = a >>> 1; r < o;) {
				var s = 2 * (r + 1) - 1, c = e[s], l = s + 1, u = e[l];
				if (0 > i(c, n)) l < a && 0 > i(u, c) ? (e[r] = u, e[l] = n, r = l) : (e[r] = c, e[s] = n, r = s);
				else if (l < a && 0 > i(u, n)) e[r] = u, e[l] = n, r = l;
				else break a;
			}
		}
		return t;
	}
	function i(e, t) {
		var n = e.sortIndex - t.sortIndex;
		return n === 0 ? e.id - t.id : n;
	}
	if (e.unstable_now = void 0, typeof performance == "object" && typeof performance.now == "function") {
		var a = performance;
		e.unstable_now = function() {
			return a.now();
		};
	} else {
		var o = Date, s = o.now();
		e.unstable_now = function() {
			return o.now() - s;
		};
	}
	var c = [], l = [], u = 1, d = null, f = 3, p = !1, m = !1, h = !1, g = !1, _ = typeof setTimeout == "function" ? setTimeout : null, v = typeof clearTimeout == "function" ? clearTimeout : null, y = typeof setImmediate < "u" ? setImmediate : null;
	function b(e) {
		for (var i = n(l); i !== null;) {
			if (i.callback === null) r(l);
			else if (i.startTime <= e) r(l), i.sortIndex = i.expirationTime, t(c, i);
			else break;
			i = n(l);
		}
	}
	function x(e) {
		if (h = !1, b(e), !m) if (n(c) !== null) m = !0, S || (S = !0, O());
		else {
			var t = n(l);
			t !== null && j(x, t.startTime - e);
		}
	}
	var S = !1, C = -1, w = 5, T = -1;
	function E() {
		return g ? !0 : !(e.unstable_now() - T < w);
	}
	function D() {
		if (g = !1, S) {
			var t = e.unstable_now();
			T = t;
			var i = !0;
			try {
				a: {
					m = !1, h && (h = !1, v(C), C = -1), p = !0;
					var a = f;
					try {
						b: {
							for (b(t), d = n(c); d !== null && !(d.expirationTime > t && E());) {
								var o = d.callback;
								if (typeof o == "function") {
									d.callback = null, f = d.priorityLevel;
									var s = o(d.expirationTime <= t);
									if (t = e.unstable_now(), typeof s == "function") {
										d.callback = s, b(t), i = !0;
										break b;
									}
									d === n(c) && r(c), b(t);
								} else r(c);
								d = n(c);
							}
							if (d !== null) i = !0;
							else {
								var u = n(l);
								u !== null && j(x, u.startTime - t), i = !1;
							}
						}
						break a;
					} finally {
						d = null, f = a, p = !1;
					}
					i = void 0;
				}
			} finally {
				i ? O() : S = !1;
			}
		}
	}
	var O;
	if (typeof y == "function") O = function() {
		y(D);
	};
	else if (typeof MessageChannel < "u") {
		var k = new MessageChannel(), A = k.port2;
		k.port1.onmessage = D, O = function() {
			A.postMessage(null);
		};
	} else O = function() {
		_(D, 0);
	};
	function j(t, n) {
		C = _(function() {
			t(e.unstable_now());
		}, n);
	}
	e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(e) {
		e.callback = null;
	}, e.unstable_forceFrameRate = function(e) {
		0 > e || 125 < e ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : w = 0 < e ? Math.floor(1e3 / e) : 5;
	}, e.unstable_getCurrentPriorityLevel = function() {
		return f;
	}, e.unstable_next = function(e) {
		switch (f) {
			case 1:
			case 2:
			case 3:
				var t = 3;
				break;
			default: t = f;
		}
		var n = f;
		f = t;
		try {
			return e();
		} finally {
			f = n;
		}
	}, e.unstable_requestPaint = function() {
		g = !0;
	}, e.unstable_runWithPriority = function(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 3:
			case 4:
			case 5: break;
			default: e = 3;
		}
		var n = f;
		f = e;
		try {
			return t();
		} finally {
			f = n;
		}
	}, e.unstable_scheduleCallback = function(r, i, a) {
		var o = e.unstable_now();
		switch (typeof a == "object" && a ? (a = a.delay, a = typeof a == "number" && 0 < a ? o + a : o) : a = o, r) {
			case 1:
				var s = -1;
				break;
			case 2:
				s = 250;
				break;
			case 5:
				s = 1073741823;
				break;
			case 4:
				s = 1e4;
				break;
			default: s = 5e3;
		}
		return s = a + s, r = {
			id: u++,
			callback: i,
			priorityLevel: r,
			startTime: a,
			expirationTime: s,
			sortIndex: -1
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, j(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, O()))), r;
	}, e.unstable_shouldYield = E, e.unstable_wrapCallback = function(e) {
		var t = f;
		return function() {
			var n = f;
			f = t;
			try {
				return e.apply(this, arguments);
			} finally {
				f = n;
			}
		};
	};
})), n = /* @__PURE__ */ e(((e, n) => {
	n.exports = t();
})), r = /* @__PURE__ */ e(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.portal"), r = Symbol.for("react.fragment"), i = Symbol.for("react.strict_mode"), a = Symbol.for("react.profiler"), o = Symbol.for("react.consumer"), s = Symbol.for("react.context"), c = Symbol.for("react.forward_ref"), l = Symbol.for("react.suspense"), u = Symbol.for("react.memo"), d = Symbol.for("react.lazy"), f = Symbol.for("react.activity"), p = Symbol.iterator;
	function m(e) {
		return typeof e != "object" || !e ? null : (e = p && e[p] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var h = {
		isMounted: function() {
			return !1;
		},
		enqueueForceUpdate: function() {},
		enqueueReplaceState: function() {},
		enqueueSetState: function() {}
	}, g = Object.assign, _ = {};
	function v(e, t, n) {
		this.props = e, this.context = t, this.refs = _, this.updater = n || h;
	}
	v.prototype.isReactComponent = {}, v.prototype.setState = function(e, t) {
		if (typeof e != "object" && typeof e != "function" && e != null) throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
		this.updater.enqueueSetState(this, e, t, "setState");
	}, v.prototype.forceUpdate = function(e) {
		this.updater.enqueueForceUpdate(this, e, "forceUpdate");
	};
	function y() {}
	y.prototype = v.prototype;
	function b(e, t, n) {
		this.props = e, this.context = t, this.refs = _, this.updater = n || h;
	}
	var x = b.prototype = new y();
	x.constructor = b, g(x, v.prototype), x.isPureReactComponent = !0;
	var S = Array.isArray;
	function C() {}
	var w = {
		H: null,
		A: null,
		T: null,
		S: null
	}, T = Object.prototype.hasOwnProperty;
	function E(e, n, r) {
		var i = r.ref;
		return {
			$$typeof: t,
			type: e,
			key: n,
			ref: i === void 0 ? null : i,
			props: r
		};
	}
	function D(e, t) {
		return E(e.type, t, e.props);
	}
	function O(e) {
		return typeof e == "object" && !!e && e.$$typeof === t;
	}
	function k(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var A = /\/+/g;
	function j(e, t) {
		return typeof e == "object" && e && e.key != null ? k("" + e.key) : t.toString(36);
	}
	function M(e) {
		switch (e.status) {
			case "fulfilled": return e.value;
			case "rejected": throw e.reason;
			default: switch (typeof e.status == "string" ? e.then(C, C) : (e.status = "pending", e.then(function(t) {
				e.status === "pending" && (e.status = "fulfilled", e.value = t);
			}, function(t) {
				e.status === "pending" && (e.status = "rejected", e.reason = t);
			})), e.status) {
				case "fulfilled": return e.value;
				case "rejected": throw e.reason;
			}
		}
		throw e;
	}
	function N(e, r, i, a, o) {
		var s = typeof e;
		(s === "undefined" || s === "boolean") && (e = null);
		var c = !1;
		if (e === null) c = !0;
		else switch (s) {
			case "bigint":
			case "string":
			case "number":
				c = !0;
				break;
			case "object": switch (e.$$typeof) {
				case t:
				case n:
					c = !0;
					break;
				case d: return c = e._init, N(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + j(e, 0) : a, S(o) ? (i = "", c != null && (i = c.replace(A, "$&/") + "/"), N(o, r, i, "", function(e) {
			return e;
		})) : o != null && (O(o) && (o = D(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(A, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (S(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + j(a, u), c += N(a, r, i, s, o);
		else if (u = m(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + j(a, u++), c += N(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return N(M(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function ee(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return N(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function te(e) {
		if (e._status === -1) {
			var t = e._result;
			t = t(), t.then(function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 1, e._result = t);
			}, function(t) {
				(e._status === 0 || e._status === -1) && (e._status = 2, e._result = t);
			}), e._status === -1 && (e._status = 0, e._result = t);
		}
		if (e._status === 1) return e._result.default;
		throw e._result;
	}
	var P = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, F = {
		map: ee,
		forEach: function(e, t, n) {
			ee(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return ee(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return ee(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!O(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = F, e.Component = v, e.Fragment = r, e.Profiler = a, e.PureComponent = b, e.StrictMode = i, e.Suspense = l, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w, e.__COMPILER_RUNTIME = {
		__proto__: null,
		c: function(e) {
			return w.H.useMemoCache(e);
		}
	}, e.cache = function(e) {
		return function() {
			return e.apply(null, arguments);
		};
	}, e.cacheSignal = function() {
		return null;
	}, e.cloneElement = function(e, t, n) {
		if (e == null) throw Error("The argument must be a React element, but you passed " + e + ".");
		var r = g({}, e.props), i = e.key;
		if (t != null) for (a in t.key !== void 0 && (i = "" + t.key), t) !T.call(t, a) || a === "key" || a === "__self" || a === "__source" || a === "ref" && t.ref === void 0 || (r[a] = t[a]);
		var a = arguments.length - 2;
		if (a === 1) r.children = n;
		else if (1 < a) {
			for (var o = Array(a), s = 0; s < a; s++) o[s] = arguments[s + 2];
			r.children = o;
		}
		return E(e.type, i, r);
	}, e.createContext = function(e) {
		return e = {
			$$typeof: s,
			_currentValue: e,
			_currentValue2: e,
			_threadCount: 0,
			Provider: null,
			Consumer: null
		}, e.Provider = e, e.Consumer = {
			$$typeof: o,
			_context: e
		}, e;
	}, e.createElement = function(e, t, n) {
		var r, i = {}, a = null;
		if (t != null) for (r in t.key !== void 0 && (a = "" + t.key), t) T.call(t, r) && r !== "key" && r !== "__self" && r !== "__source" && (i[r] = t[r]);
		var o = arguments.length - 2;
		if (o === 1) i.children = n;
		else if (1 < o) {
			for (var s = Array(o), c = 0; c < o; c++) s[c] = arguments[c + 2];
			i.children = s;
		}
		if (e && e.defaultProps) for (r in o = e.defaultProps, o) i[r] === void 0 && (i[r] = o[r]);
		return E(e, a, i);
	}, e.createRef = function() {
		return { current: null };
	}, e.forwardRef = function(e) {
		return {
			$$typeof: c,
			render: e
		};
	}, e.isValidElement = O, e.lazy = function(e) {
		return {
			$$typeof: d,
			_payload: {
				_status: -1,
				_result: e
			},
			_init: te
		};
	}, e.memo = function(e, t) {
		return {
			$$typeof: u,
			type: e,
			compare: t === void 0 ? null : t
		};
	}, e.startTransition = function(e) {
		var t = w.T, n = {};
		w.T = n;
		try {
			var r = e(), i = w.S;
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(C, P);
		} catch (e) {
			P(e);
		} finally {
			t !== null && n.types !== null && (t.types = n.types), w.T = t;
		}
	}, e.unstable_useCacheRefresh = function() {
		return w.H.useCacheRefresh();
	}, e.use = function(e) {
		return w.H.use(e);
	}, e.useActionState = function(e, t, n) {
		return w.H.useActionState(e, t, n);
	}, e.useCallback = function(e, t) {
		return w.H.useCallback(e, t);
	}, e.useContext = function(e) {
		return w.H.useContext(e);
	}, e.useDebugValue = function() {}, e.useDeferredValue = function(e, t) {
		return w.H.useDeferredValue(e, t);
	}, e.useEffect = function(e, t) {
		return w.H.useEffect(e, t);
	}, e.useEffectEvent = function(e) {
		return w.H.useEffectEvent(e);
	}, e.useId = function() {
		return w.H.useId();
	}, e.useImperativeHandle = function(e, t, n) {
		return w.H.useImperativeHandle(e, t, n);
	}, e.useInsertionEffect = function(e, t) {
		return w.H.useInsertionEffect(e, t);
	}, e.useLayoutEffect = function(e, t) {
		return w.H.useLayoutEffect(e, t);
	}, e.useMemo = function(e, t) {
		return w.H.useMemo(e, t);
	}, e.useOptimistic = function(e, t) {
		return w.H.useOptimistic(e, t);
	}, e.useReducer = function(e, t, n) {
		return w.H.useReducer(e, t, n);
	}, e.useRef = function(e) {
		return w.H.useRef(e);
	}, e.useState = function(e) {
		return w.H.useState(e);
	}, e.useSyncExternalStore = function(e, t, n) {
		return w.H.useSyncExternalStore(e, t, n);
	}, e.useTransition = function() {
		return w.H.useTransition();
	}, e.version = "19.2.7";
})), i = /* @__PURE__ */ e(((e, t) => {
	t.exports = r();
})), a = /* @__PURE__ */ e(((e) => {
	var t = i();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var a = {
		d: {
			f: r,
			r: function() {
				throw Error(n(522));
			},
			D: r,
			C: r,
			L: r,
			m: r,
			X: r,
			S: r,
			M: r
		},
		p: 0,
		findDOMNode: null
	}, o = Symbol.for("react.portal");
	function s(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: o,
			key: r == null ? null : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var c = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function l(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = a, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return s(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = c.T, n = a.p;
		try {
			if (c.T = null, a.p = 2, e) return e();
		} finally {
			c.T = t, a.p = n, a.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, a.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && a.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = l(n, t.crossOrigin), i = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? a.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: i,
				fetchPriority: o
			}) : n === "script" && a.d.X(e, {
				crossOrigin: r,
				integrity: i,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") if (typeof t == "object" && t) {
			if (t.as == null || t.as === "script") {
				var n = l(t.as, t.crossOrigin);
				a.d.M(e, {
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0
				});
			}
		} else t ?? a.d.M(e);
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = l(n, t.crossOrigin);
			a.d.L(e, n, {
				crossOrigin: r,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0,
				type: typeof t.type == "string" ? t.type : void 0,
				fetchPriority: typeof t.fetchPriority == "string" ? t.fetchPriority : void 0,
				referrerPolicy: typeof t.referrerPolicy == "string" ? t.referrerPolicy : void 0,
				imageSrcSet: typeof t.imageSrcSet == "string" ? t.imageSrcSet : void 0,
				imageSizes: typeof t.imageSizes == "string" ? t.imageSizes : void 0,
				media: typeof t.media == "string" ? t.media : void 0
			});
		}
	}, e.preloadModule = function(e, t) {
		if (typeof e == "string") if (t) {
			var n = l(t.as, t.crossOrigin);
			a.d.m(e, {
				as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
				crossOrigin: n,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0
			});
		} else a.d.m(e);
	}, e.requestFormReset = function(e) {
		a.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return c.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return c.H.useHostTransitionStatus();
	}, e.version = "19.2.7";
})), o = /* @__PURE__ */ e(((e, t) => {
	function n() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = a();
})), s = /* @__PURE__ */ e(((e) => {
	var t = n(), r = i(), a = o();
	function s(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function c(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function l(e) {
		var t = e, n = e;
		if (e.alternate) for (; t.return;) t = t.return;
		else {
			e = t;
			do
				t = e, t.flags & 4098 && (n = t.return), e = t.return;
			while (e);
		}
		return t.tag === 3 ? n : null;
	}
	function u(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function d(e) {
		if (e.tag === 31) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function f(e) {
		if (l(e) !== e) throw Error(s(188));
	}
	function p(e) {
		var t = e.alternate;
		if (!t) {
			if (t = l(e), t === null) throw Error(s(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var i = n.return;
			if (i === null) break;
			var a = i.alternate;
			if (a === null) {
				if (r = i.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (i.child === a.child) {
				for (a = i.child; a;) {
					if (a === n) return f(i), e;
					if (a === r) return f(i), t;
					a = a.sibling;
				}
				throw Error(s(188));
			}
			if (n.return !== r.return) n = i, r = a;
			else {
				for (var o = !1, c = i.child; c;) {
					if (c === n) {
						o = !0, n = i, r = a;
						break;
					}
					if (c === r) {
						o = !0, r = i, n = a;
						break;
					}
					c = c.sibling;
				}
				if (!o) {
					for (c = a.child; c;) {
						if (c === n) {
							o = !0, n = a, r = i;
							break;
						}
						if (c === r) {
							o = !0, r = a, n = i;
							break;
						}
						c = c.sibling;
					}
					if (!o) throw Error(s(189));
				}
			}
			if (n.alternate !== r) throw Error(s(190));
		}
		if (n.tag !== 3) throw Error(s(188));
		return n.stateNode.current === n ? e : t;
	}
	function m(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e;
		for (e = e.child; e !== null;) {
			if (t = m(e), t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	var h = Object.assign, g = Symbol.for("react.element"), _ = Symbol.for("react.transitional.element"), v = Symbol.for("react.portal"), y = Symbol.for("react.fragment"), b = Symbol.for("react.strict_mode"), x = Symbol.for("react.profiler"), S = Symbol.for("react.consumer"), C = Symbol.for("react.context"), w = Symbol.for("react.forward_ref"), T = Symbol.for("react.suspense"), E = Symbol.for("react.suspense_list"), D = Symbol.for("react.memo"), O = Symbol.for("react.lazy"), k = Symbol.for("react.activity"), A = Symbol.for("react.memo_cache_sentinel"), j = Symbol.iterator;
	function M(e) {
		return typeof e != "object" || !e ? null : (e = j && e[j] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var N = Symbol.for("react.client.reference");
	function ee(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === N ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case y: return "Fragment";
			case x: return "Profiler";
			case b: return "StrictMode";
			case T: return "Suspense";
			case E: return "SuspenseList";
			case k: return "Activity";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case v: return "Portal";
			case C: return e.displayName || "Context";
			case S: return (e._context.displayName || "Context") + ".Consumer";
			case w:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case D: return t = e.displayName || null, t === null ? ee(e.type) || "Memo" : t;
			case O:
				t = e._payload, e = e._init;
				try {
					return ee(e(t));
				} catch {}
		}
		return null;
	}
	var te = Array.isArray, P = r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, F = a.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, I = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, ne = [], L = -1;
	function R(e) {
		return { current: e };
	}
	function z(e) {
		0 > L || (e.current = ne[L], ne[L] = null, L--);
	}
	function B(e, t) {
		L++, ne[L] = e.current, e.current = t;
	}
	var V = R(null), H = R(null), re = R(null), ie = R(null);
	function U(e, t) {
		switch (B(re, t), B(H, e), B(V, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? Hd(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = Hd(t), e = Ud(t, e);
			else switch (e) {
				case "svg":
					e = 1;
					break;
				case "math":
					e = 2;
					break;
				default: e = 0;
			}
		}
		z(V), B(V, e);
	}
	function ae() {
		z(V), z(H), z(re);
	}
	function oe(e) {
		e.memoizedState !== null && B(ie, e);
		var t = V.current, n = Ud(t, e.type);
		t !== n && (B(H, e), B(V, n));
	}
	function se(e) {
		H.current === e && (z(V), z(H)), ie.current === e && (z(ie), $f._currentValue = I);
	}
	var ce, le;
	function ue(e) {
		if (ce === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			ce = t && t[1] || "", le = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + ce + e + le;
	}
	var de = !1;
	function fe(e, t) {
		if (!e || de) return "";
		de = !0;
		var n = Error.prepareStackTrace;
		Error.prepareStackTrace = void 0;
		try {
			var r = { DetermineComponentFrameRoot: function() {
				try {
					if (t) {
						var n = function() {
							throw Error();
						};
						if (Object.defineProperty(n.prototype, "props", { set: function() {
							throw Error();
						} }), typeof Reflect == "object" && Reflect.construct) {
							try {
								Reflect.construct(n, []);
							} catch (e) {
								var r = e;
							}
							Reflect.construct(e, [], n);
						} else {
							try {
								n.call();
							} catch (e) {
								r = e;
							}
							e.call(n.prototype);
						}
					} else {
						try {
							throw Error();
						} catch (e) {
							r = e;
						}
						(n = e()) && typeof n.catch == "function" && n.catch(function() {});
					}
				} catch (e) {
					if (e && r && typeof e.stack == "string") return [e.stack, r.stack];
				}
				return [null, null];
			} };
			r.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
			var i = Object.getOwnPropertyDescriptor(r.DetermineComponentFrameRoot, "name");
			i && i.configurable && Object.defineProperty(r.DetermineComponentFrameRoot, "name", { value: "DetermineComponentFrameRoot" });
			var a = r.DetermineComponentFrameRoot(), o = a[0], s = a[1];
			if (o && s) {
				var c = o.split("\n"), l = s.split("\n");
				for (i = r = 0; r < c.length && !c[r].includes("DetermineComponentFrameRoot");) r++;
				for (; i < l.length && !l[i].includes("DetermineComponentFrameRoot");) i++;
				if (r === c.length || i === l.length) for (r = c.length - 1, i = l.length - 1; 1 <= r && 0 <= i && c[r] !== l[i];) i--;
				for (; 1 <= r && 0 <= i; r--, i--) if (c[r] !== l[i]) {
					if (r !== 1 || i !== 1) do
						if (r--, i--, 0 > i || c[r] !== l[i]) {
							var u = "\n" + c[r].replace(" at new ", " at ");
							return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
						}
					while (1 <= r && 0 <= i);
					break;
				}
			}
		} finally {
			de = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? ue(n) : "";
	}
	function pe(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return ue(e.type);
			case 16: return ue("Lazy");
			case 13: return e.child !== t && t !== null ? ue("Suspense Fallback") : ue("Suspense");
			case 19: return ue("SuspenseList");
			case 0:
			case 15: return fe(e.type, !1);
			case 11: return fe(e.type.render, !1);
			case 1: return fe(e.type, !0);
			case 31: return ue("Activity");
			default: return "";
		}
	}
	function W(e) {
		try {
			var t = "", n = null;
			do
				t += pe(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var me = Object.prototype.hasOwnProperty, he = t.unstable_scheduleCallback, ge = t.unstable_cancelCallback, _e = t.unstable_shouldYield, ve = t.unstable_requestPaint, ye = t.unstable_now, be = t.unstable_getCurrentPriorityLevel, xe = t.unstable_ImmediatePriority, Se = t.unstable_UserBlockingPriority, Ce = t.unstable_NormalPriority, we = t.unstable_LowPriority, Te = t.unstable_IdlePriority, Ee = t.log, De = t.unstable_setDisableYieldValue, Oe = null, G = null;
	function ke(e) {
		if (typeof Ee == "function" && De(e), G && typeof G.setStrictMode == "function") try {
			G.setStrictMode(Oe, e);
		} catch {}
	}
	var Ae = Math.clz32 ? Math.clz32 : Ne, je = Math.log, Me = Math.LN2;
	function Ne(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (je(e) / Me | 0) | 0;
	}
	var Pe = 256, Fe = 262144, Ie = 4194304;
	function K(e) {
		var t = e & 42;
		if (t !== 0) return t;
		switch (e & -e) {
			case 1: return 1;
			case 2: return 2;
			case 4: return 4;
			case 8: return 8;
			case 16: return 16;
			case 32: return 32;
			case 64: return 64;
			case 128: return 128;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072: return e & 261888;
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return e & 3932160;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return e & 62914560;
			case 67108864: return 67108864;
			case 134217728: return 134217728;
			case 268435456: return 268435456;
			case 536870912: return 536870912;
			case 1073741824: return 0;
			default: return e;
		}
	}
	function Le(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = K(n))) : i = K(o) : i = K(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = K(n))) : i = K(o)) : i = K(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function Re(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function ze(e, t) {
		switch (e) {
			case 1:
			case 2:
			case 4:
			case 8:
			case 64: return t + 250;
			case 16:
			case 32:
			case 128:
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152: return t + 5e3;
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432: return -1;
			case 67108864:
			case 134217728:
			case 268435456:
			case 536870912:
			case 1073741824: return -1;
			default: return -1;
		}
	}
	function Be() {
		var e = Ie;
		return Ie <<= 1, !(Ie & 62914560) && (Ie = 4194304), e;
	}
	function Ve(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function He(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function Ue(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - Ae(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && We(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function We(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - Ae(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function Ge(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Ae(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function Ke(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : qe(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function qe(e) {
		switch (e) {
			case 2:
				e = 1;
				break;
			case 8:
				e = 4;
				break;
			case 32:
				e = 16;
				break;
			case 256:
			case 512:
			case 1024:
			case 2048:
			case 4096:
			case 8192:
			case 16384:
			case 32768:
			case 65536:
			case 131072:
			case 262144:
			case 524288:
			case 1048576:
			case 2097152:
			case 4194304:
			case 8388608:
			case 16777216:
			case 33554432:
				e = 128;
				break;
			case 268435456:
				e = 134217728;
				break;
			default: e = 0;
		}
		return e;
	}
	function Je(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function Ye() {
		var e = F.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : hp(e.type)) : e;
	}
	function Xe(e, t) {
		var n = F.p;
		try {
			return F.p = e, t();
		} finally {
			F.p = n;
		}
	}
	var Ze = Math.random().toString(36).slice(2), Qe = "__reactFiber$" + Ze, $e = "__reactProps$" + Ze, et = "__reactContainer$" + Ze, tt = "__reactEvents$" + Ze, nt = "__reactListeners$" + Ze, rt = "__reactHandles$" + Ze, it = "__reactResources$" + Ze, at = "__reactMarker$" + Ze;
	function ot(e) {
		delete e[Qe], delete e[$e], delete e[tt], delete e[nt], delete e[rt];
	}
	function st(e) {
		var t = e[Qe];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[et] || n[Qe]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = ff(e); e !== null;) {
					if (n = e[Qe]) return n;
					e = ff(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function ct(e) {
		if (e = e[Qe] || e[et]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function lt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(s(33));
	}
	function ut(e) {
		var t = e[it];
		return t ||= e[it] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function dt(e) {
		e[at] = !0;
	}
	var ft = /* @__PURE__ */ new Set(), pt = {};
	function mt(e, t) {
		ht(e, t), ht(e + "Capture", t);
	}
	function ht(e, t) {
		for (pt[e] = t, e = 0; e < t.length; e++) ft.add(t[e]);
	}
	var gt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), _t = {}, vt = {};
	function yt(e) {
		return me.call(vt, e) ? !0 : me.call(_t, e) ? !1 : gt.test(e) ? vt[e] = !0 : (_t[e] = !0, !1);
	}
	function bt(e, t, n) {
		if (yt(t)) if (n === null) e.removeAttribute(t);
		else {
			switch (typeof n) {
				case "undefined":
				case "function":
				case "symbol":
					e.removeAttribute(t);
					return;
				case "boolean":
					var r = t.toLowerCase().slice(0, 5);
					if (r !== "data-" && r !== "aria-") {
						e.removeAttribute(t);
						return;
					}
			}
			e.setAttribute(t, "" + n);
		}
	}
	function xt(e, t, n) {
		if (n === null) e.removeAttribute(t);
		else {
			switch (typeof n) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(t);
					return;
			}
			e.setAttribute(t, "" + n);
		}
	}
	function St(e, t, n, r) {
		if (r === null) e.removeAttribute(n);
		else {
			switch (typeof r) {
				case "undefined":
				case "function":
				case "symbol":
				case "boolean":
					e.removeAttribute(n);
					return;
			}
			e.setAttributeNS(t, n, "" + r);
		}
	}
	function Ct(e) {
		switch (typeof e) {
			case "bigint":
			case "boolean":
			case "number":
			case "string":
			case "undefined": return e;
			case "object": return e;
			default: return "";
		}
	}
	function wt(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function Tt(e, t, n) {
		var r = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
		if (!e.hasOwnProperty(t) && r !== void 0 && typeof r.get == "function" && typeof r.set == "function") {
			var i = r.get, a = r.set;
			return Object.defineProperty(e, t, {
				configurable: !0,
				get: function() {
					return i.call(this);
				},
				set: function(e) {
					n = "" + e, a.call(this, e);
				}
			}), Object.defineProperty(e, t, { enumerable: r.enumerable }), {
				getValue: function() {
					return n;
				},
				setValue: function(e) {
					n = "" + e;
				},
				stopTracking: function() {
					e._valueTracker = null, delete e[t];
				}
			};
		}
	}
	function Et(e) {
		if (!e._valueTracker) {
			var t = wt(e) ? "checked" : "value";
			e._valueTracker = Tt(e, t, "" + e[t]);
		}
	}
	function Dt(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = wt(e) ? e.checked ? "true" : "false" : e.value), e = r, e === n ? !1 : (t.setValue(e), !0);
	}
	function Ot(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	var kt = /[\n"\\]/g;
	function At(e) {
		return e.replace(kt, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function jt(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Ct(t)) : e.value !== "" + Ct(t) && (e.value = "" + Ct(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : Nt(e, o, Ct(n)) : Nt(e, o, Ct(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + Ct(s) : e.removeAttribute("name");
	}
	function Mt(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				Et(e);
				return;
			}
			n = n == null ? "" : "" + Ct(n), t = t == null ? n : "" + Ct(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), Et(e);
	}
	function Nt(e, t, n) {
		t === "number" && Ot(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
	}
	function Pt(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + Ct(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function Ft(e, t, n) {
		if (t != null && (t = "" + Ct(t), t !== e.value && (e.value = t), n == null)) {
			e.defaultValue !== t && (e.defaultValue = t);
			return;
		}
		e.defaultValue = n == null ? "" : "" + Ct(n);
	}
	function It(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(s(92));
				if (te(r)) {
					if (1 < r.length) throw Error(s(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = Ct(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), Et(e);
	}
	function Lt(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Rt = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function zt(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || Rt.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function Bt(e, t, n) {
		if (t != null && typeof t != "object") throw Error(s(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
			for (var i in t) r = t[i], t.hasOwnProperty(i) && n[i] !== r && zt(e, i, r);
		} else for (var a in t) t.hasOwnProperty(a) && zt(e, a, t[a]);
	}
	function Vt(e) {
		if (e.indexOf("-") === -1) return !1;
		switch (e) {
			case "annotation-xml":
			case "color-profile":
			case "font-face":
			case "font-face-src":
			case "font-face-uri":
			case "font-face-format":
			case "font-face-name":
			case "missing-glyph": return !1;
			default: return !0;
		}
	}
	var Ht = new Map([
		["acceptCharset", "accept-charset"],
		["htmlFor", "for"],
		["httpEquiv", "http-equiv"],
		["crossOrigin", "crossorigin"],
		["accentHeight", "accent-height"],
		["alignmentBaseline", "alignment-baseline"],
		["arabicForm", "arabic-form"],
		["baselineShift", "baseline-shift"],
		["capHeight", "cap-height"],
		["clipPath", "clip-path"],
		["clipRule", "clip-rule"],
		["colorInterpolation", "color-interpolation"],
		["colorInterpolationFilters", "color-interpolation-filters"],
		["colorProfile", "color-profile"],
		["colorRendering", "color-rendering"],
		["dominantBaseline", "dominant-baseline"],
		["enableBackground", "enable-background"],
		["fillOpacity", "fill-opacity"],
		["fillRule", "fill-rule"],
		["floodColor", "flood-color"],
		["floodOpacity", "flood-opacity"],
		["fontFamily", "font-family"],
		["fontSize", "font-size"],
		["fontSizeAdjust", "font-size-adjust"],
		["fontStretch", "font-stretch"],
		["fontStyle", "font-style"],
		["fontVariant", "font-variant"],
		["fontWeight", "font-weight"],
		["glyphName", "glyph-name"],
		["glyphOrientationHorizontal", "glyph-orientation-horizontal"],
		["glyphOrientationVertical", "glyph-orientation-vertical"],
		["horizAdvX", "horiz-adv-x"],
		["horizOriginX", "horiz-origin-x"],
		["imageRendering", "image-rendering"],
		["letterSpacing", "letter-spacing"],
		["lightingColor", "lighting-color"],
		["markerEnd", "marker-end"],
		["markerMid", "marker-mid"],
		["markerStart", "marker-start"],
		["overlinePosition", "overline-position"],
		["overlineThickness", "overline-thickness"],
		["paintOrder", "paint-order"],
		["panose-1", "panose-1"],
		["pointerEvents", "pointer-events"],
		["renderingIntent", "rendering-intent"],
		["shapeRendering", "shape-rendering"],
		["stopColor", "stop-color"],
		["stopOpacity", "stop-opacity"],
		["strikethroughPosition", "strikethrough-position"],
		["strikethroughThickness", "strikethrough-thickness"],
		["strokeDasharray", "stroke-dasharray"],
		["strokeDashoffset", "stroke-dashoffset"],
		["strokeLinecap", "stroke-linecap"],
		["strokeLinejoin", "stroke-linejoin"],
		["strokeMiterlimit", "stroke-miterlimit"],
		["strokeOpacity", "stroke-opacity"],
		["strokeWidth", "stroke-width"],
		["textAnchor", "text-anchor"],
		["textDecoration", "text-decoration"],
		["textRendering", "text-rendering"],
		["transformOrigin", "transform-origin"],
		["underlinePosition", "underline-position"],
		["underlineThickness", "underline-thickness"],
		["unicodeBidi", "unicode-bidi"],
		["unicodeRange", "unicode-range"],
		["unitsPerEm", "units-per-em"],
		["vAlphabetic", "v-alphabetic"],
		["vHanging", "v-hanging"],
		["vIdeographic", "v-ideographic"],
		["vMathematical", "v-mathematical"],
		["vectorEffect", "vector-effect"],
		["vertAdvY", "vert-adv-y"],
		["vertOriginX", "vert-origin-x"],
		["vertOriginY", "vert-origin-y"],
		["wordSpacing", "word-spacing"],
		["writingMode", "writing-mode"],
		["xmlnsXlink", "xmlns:xlink"],
		["xHeight", "x-height"]
	]), Ut = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function Wt(e) {
		return Ut.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function Gt() {}
	var Kt = null;
	function qt(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var Jt = null, Yt = null;
	function Xt(e) {
		var t = ct(e);
		if (t && (e = t.stateNode)) {
			var n = e[$e] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (jt(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + At("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var i = r[$e] || null;
								if (!i) throw Error(s(90));
								jt(r, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && Dt(r);
					}
					break a;
				case "textarea":
					Ft(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && Pt(e, !!n.multiple, t, !1);
			}
		}
	}
	var Zt = !1;
	function Qt(e, t, n) {
		if (Zt) return e(t, n);
		Zt = !0;
		try {
			return e(t);
		} finally {
			if (Zt = !1, (Jt !== null || Yt !== null) && (yu(), Jt && (t = Jt, e = Yt, Yt = Jt = null, Xt(t), e))) for (t = 0; t < e.length; t++) Xt(e[t]);
		}
	}
	function $t(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[$e] || null;
		if (r === null) return null;
		n = r[t];
		a: switch (t) {
			case "onClick":
			case "onClickCapture":
			case "onDoubleClick":
			case "onDoubleClickCapture":
			case "onMouseDown":
			case "onMouseDownCapture":
			case "onMouseMove":
			case "onMouseMoveCapture":
			case "onMouseUp":
			case "onMouseUpCapture":
			case "onMouseEnter":
				(r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
				break a;
			default: e = !1;
		}
		if (e) return null;
		if (n && typeof n != "function") throw Error(s(231, t, typeof n));
		return n;
	}
	var en = !(typeof window > "u" || window.document === void 0 || window.document.createElement === void 0), tn = !1;
	if (en) try {
		var nn = {};
		Object.defineProperty(nn, "passive", { get: function() {
			tn = !0;
		} }), window.addEventListener("test", nn, nn), window.removeEventListener("test", nn, nn);
	} catch {
		tn = !1;
	}
	var rn = null, an = null, on = null;
	function sn() {
		if (on) return on;
		var e, t = an, n = t.length, r, i = "value" in rn ? rn.value : rn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return on = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function cn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function ln() {
		return !0;
	}
	function un() {
		return !1;
	}
	function dn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? ln : un, this.isPropagationStopped = un, this;
		}
		return h(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = ln);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = ln);
			},
			persist: function() {},
			isPersistent: ln
		}), t;
	}
	var fn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, pn = dn(fn), mn = h({}, fn, {
		view: 0,
		detail: 0
	}), hn = dn(mn), gn, _n, vn, yn = h({}, mn, {
		screenX: 0,
		screenY: 0,
		clientX: 0,
		clientY: 0,
		pageX: 0,
		pageY: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		getModifierState: An,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== vn && (vn && e.type === "mousemove" ? (gn = e.screenX - vn.screenX, _n = e.screenY - vn.screenY) : _n = gn = 0, vn = e), gn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : _n;
		}
	}), bn = dn(yn), xn = dn(h({}, yn, { dataTransfer: 0 })), Sn = dn(h({}, mn, { relatedTarget: 0 })), Cn = dn(h({}, fn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), wn = dn(h({}, fn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Tn = dn(h({}, fn, { data: 0 })), En = {
		Esc: "Escape",
		Spacebar: " ",
		Left: "ArrowLeft",
		Up: "ArrowUp",
		Right: "ArrowRight",
		Down: "ArrowDown",
		Del: "Delete",
		Win: "OS",
		Menu: "ContextMenu",
		Apps: "ContextMenu",
		Scroll: "ScrollLock",
		MozPrintableKey: "Unidentified"
	}, Dn = {
		8: "Backspace",
		9: "Tab",
		12: "Clear",
		13: "Enter",
		16: "Shift",
		17: "Control",
		18: "Alt",
		19: "Pause",
		20: "CapsLock",
		27: "Escape",
		32: " ",
		33: "PageUp",
		34: "PageDown",
		35: "End",
		36: "Home",
		37: "ArrowLeft",
		38: "ArrowUp",
		39: "ArrowRight",
		40: "ArrowDown",
		45: "Insert",
		46: "Delete",
		112: "F1",
		113: "F2",
		114: "F3",
		115: "F4",
		116: "F5",
		117: "F6",
		118: "F7",
		119: "F8",
		120: "F9",
		121: "F10",
		122: "F11",
		123: "F12",
		144: "NumLock",
		145: "ScrollLock",
		224: "Meta"
	}, On = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function kn(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = On[e]) ? !!t[e] : !1;
	}
	function An() {
		return kn;
	}
	var jn = dn(h({}, mn, {
		key: function(e) {
			if (e.key) {
				var t = En[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = cn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Dn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: An,
		charCode: function(e) {
			return e.type === "keypress" ? cn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? cn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), Mn = dn(h({}, yn, {
		pointerId: 0,
		width: 0,
		height: 0,
		pressure: 0,
		tangentialPressure: 0,
		tiltX: 0,
		tiltY: 0,
		twist: 0,
		pointerType: 0,
		isPrimary: 0
	})), Nn = dn(h({}, mn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: An
	})), Pn = dn(h({}, fn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Fn = dn(h({}, yn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), In = dn(h({}, fn, {
		newState: 0,
		oldState: 0
	})), Ln = [
		9,
		13,
		27,
		32
	], Rn = en && "CompositionEvent" in window, zn = null;
	en && "documentMode" in document && (zn = document.documentMode);
	var Bn = en && "TextEvent" in window && !zn, Vn = en && (!Rn || zn && 8 < zn && 11 >= zn), Hn = " ", Un = !1;
	function Wn(e, t) {
		switch (e) {
			case "keyup": return Ln.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function Gn(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var Kn = !1;
	function qn(e, t) {
		switch (e) {
			case "compositionend": return Gn(t);
			case "keypress": return t.which === 32 ? (Un = !0, Hn) : null;
			case "textInput": return e = t.data, e === Hn && Un ? null : e;
			default: return null;
		}
	}
	function Jn(e, t) {
		if (Kn) return e === "compositionend" || !Rn && Wn(e, t) ? (e = sn(), on = an = rn = null, Kn = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return Vn && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var Yn = {
		color: !0,
		date: !0,
		datetime: !0,
		"datetime-local": !0,
		email: !0,
		month: !0,
		number: !0,
		password: !0,
		range: !0,
		search: !0,
		tel: !0,
		text: !0,
		time: !0,
		url: !0,
		week: !0
	};
	function Xn(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!Yn[e.type] : t === "textarea";
	}
	function Zn(e, t, n, r) {
		Jt ? Yt ? Yt.push(r) : Yt = [r] : Jt = r, t = Ed(t, "onChange"), 0 < t.length && (n = new pn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var Qn = null, $n = null;
	function er(e) {
		yd(e, 0);
	}
	function tr(e) {
		if (Dt(lt(e))) return e;
	}
	function nr(e, t) {
		if (e === "change") return t;
	}
	var rr = !1;
	if (en) {
		var ir;
		if (en) {
			var ar = "oninput" in document;
			if (!ar) {
				var or = document.createElement("div");
				or.setAttribute("oninput", "return;"), ar = typeof or.oninput == "function";
			}
			ir = ar;
		} else ir = !1;
		rr = ir && (!document.documentMode || 9 < document.documentMode);
	}
	function sr() {
		Qn && (Qn.detachEvent("onpropertychange", cr), $n = Qn = null);
	}
	function cr(e) {
		if (e.propertyName === "value" && tr($n)) {
			var t = [];
			Zn(t, $n, e, qt(e)), Qt(er, t);
		}
	}
	function lr(e, t, n) {
		e === "focusin" ? (sr(), Qn = t, $n = n, Qn.attachEvent("onpropertychange", cr)) : e === "focusout" && sr();
	}
	function ur(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return tr($n);
	}
	function dr(e, t) {
		if (e === "click") return tr(t);
	}
	function fr(e, t) {
		if (e === "input" || e === "change") return tr(t);
	}
	function pr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var mr = typeof Object.is == "function" ? Object.is : pr;
	function hr(e, t) {
		if (mr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!me.call(t, i) || !mr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function gr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function _r(e, t) {
		var n = gr(e);
		e = 0;
		for (var r; n;) {
			if (n.nodeType === 3) {
				if (r = e + n.textContent.length, e <= t && r >= t) return {
					node: n,
					offset: t - e
				};
				e = r;
			}
			a: {
				for (; n;) {
					if (n.nextSibling) {
						n = n.nextSibling;
						break a;
					}
					n = n.parentNode;
				}
				n = void 0;
			}
			n = gr(n);
		}
	}
	function vr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? vr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function yr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Ot(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Ot(e.document);
		}
		return t;
	}
	function br(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var xr = en && "documentMode" in document && 11 >= document.documentMode, Sr = null, Cr = null, wr = null, Tr = !1;
	function Er(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		Tr || Sr == null || Sr !== Ot(r) || (r = Sr, "selectionStart" in r && br(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), wr && hr(wr, r) || (wr = r, r = Ed(Cr, "onSelect"), 0 < r.length && (t = new pn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Sr)));
	}
	function Dr(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Or = {
		animationend: Dr("Animation", "AnimationEnd"),
		animationiteration: Dr("Animation", "AnimationIteration"),
		animationstart: Dr("Animation", "AnimationStart"),
		transitionrun: Dr("Transition", "TransitionRun"),
		transitionstart: Dr("Transition", "TransitionStart"),
		transitioncancel: Dr("Transition", "TransitionCancel"),
		transitionend: Dr("Transition", "TransitionEnd")
	}, kr = {}, Ar = {};
	en && (Ar = document.createElement("div").style, "AnimationEvent" in window || (delete Or.animationend.animation, delete Or.animationiteration.animation, delete Or.animationstart.animation), "TransitionEvent" in window || delete Or.transitionend.transition);
	function jr(e) {
		if (kr[e]) return kr[e];
		if (!Or[e]) return e;
		var t = Or[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in Ar) return kr[e] = t[n];
		return e;
	}
	var Mr = jr("animationend"), Nr = jr("animationiteration"), Pr = jr("animationstart"), Fr = jr("transitionrun"), Ir = jr("transitionstart"), Lr = jr("transitioncancel"), Rr = jr("transitionend"), zr = /* @__PURE__ */ new Map(), Br = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	Br.push("scrollEnd");
	function Vr(e, t) {
		zr.set(e, t), mt(t, [e]);
	}
	var Hr = typeof reportError == "function" ? reportError : function(e) {
		if (typeof window == "object" && typeof window.ErrorEvent == "function") {
			var t = new window.ErrorEvent("error", {
				bubbles: !0,
				cancelable: !0,
				message: typeof e == "object" && e && typeof e.message == "string" ? String(e.message) : String(e),
				error: e
			});
			if (!window.dispatchEvent(t)) return;
		} else if (typeof process == "object" && typeof process.emit == "function") {
			process.emit("uncaughtException", e);
			return;
		}
		console.error(e);
	}, Ur = [], Wr = 0, Gr = 0;
	function Kr() {
		for (var e = Wr, t = Gr = Wr = 0; t < e;) {
			var n = Ur[t];
			Ur[t++] = null;
			var r = Ur[t];
			Ur[t++] = null;
			var i = Ur[t];
			Ur[t++] = null;
			var a = Ur[t];
			if (Ur[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Xr(n, i, a);
		}
	}
	function qr(e, t, n, r) {
		Ur[Wr++] = e, Ur[Wr++] = t, Ur[Wr++] = n, Ur[Wr++] = r, Gr |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function Jr(e, t, n, r) {
		return qr(e, t, n, r), Zr(e);
	}
	function Yr(e, t) {
		return qr(e, null, null, t), Zr(e);
	}
	function Xr(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - Ae(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function Zr(e) {
		if (50 < uu) throw uu = 0, du = null, Error(s(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var Qr = {};
	function $r(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function ei(e, t, n, r) {
		return new $r(e, t, n, r);
	}
	function ti(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function ni(e, t) {
		var n = e.alternate;
		return n === null ? (n = ei(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function ri(e, t) {
		e.flags &= 65011714;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function ii(e, t, n, r, i, a) {
		var o = 0;
		if (r = e, typeof e == "function") ti(e) && (o = 1);
		else if (typeof e == "string") o = Wf(e, n, V.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (e) {
			case k: return e = ei(31, n, t, i), e.elementType = k, e.lanes = a, e;
			case y: return ai(n.children, i, a, t);
			case b:
				o = 8, i |= 24;
				break;
			case x: return e = ei(12, n, t, i | 2), e.elementType = x, e.lanes = a, e;
			case T: return e = ei(13, n, t, i), e.elementType = T, e.lanes = a, e;
			case E: return e = ei(19, n, t, i), e.elementType = E, e.lanes = a, e;
			default:
				if (typeof e == "object" && e) switch (e.$$typeof) {
					case C:
						o = 10;
						break a;
					case S:
						o = 9;
						break a;
					case w:
						o = 11;
						break a;
					case D:
						o = 14;
						break a;
					case O:
						o = 16, r = null;
						break a;
				}
				o = 29, n = Error(s(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = ei(o, n, t, i), t.elementType = e, t.type = r, t.lanes = a, t;
	}
	function ai(e, t, n, r) {
		return e = ei(7, e, r, t), e.lanes = n, e;
	}
	function oi(e, t, n) {
		return e = ei(6, e, null, t), e.lanes = n, e;
	}
	function si(e) {
		var t = ei(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function ci(e, t, n) {
		return t = ei(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var li = /* @__PURE__ */ new WeakMap();
	function ui(e, t) {
		if (typeof e == "object" && e) {
			var n = li.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: W(t)
			}, li.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: W(t)
		};
	}
	var di = [], fi = 0, pi = null, mi = 0, hi = [], gi = 0, _i = null, vi = 1, yi = "";
	function bi(e, t) {
		di[fi++] = mi, di[fi++] = pi, pi = e, mi = t;
	}
	function xi(e, t, n) {
		hi[gi++] = vi, hi[gi++] = yi, hi[gi++] = _i, _i = e;
		var r = vi;
		e = yi;
		var i = 32 - Ae(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Ae(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, vi = 1 << 32 - Ae(t) + i | n << i | r, yi = a + e;
		} else vi = 1 << a | n << i | r, yi = e;
	}
	function Si(e) {
		e.return !== null && (bi(e, 1), xi(e, 1, 0));
	}
	function Ci(e) {
		for (; e === pi;) pi = di[--fi], di[fi] = null, mi = di[--fi], di[fi] = null;
		for (; e === _i;) _i = hi[--gi], hi[gi] = null, yi = hi[--gi], hi[gi] = null, vi = hi[--gi], hi[gi] = null;
	}
	function wi(e, t) {
		hi[gi++] = vi, hi[gi++] = yi, hi[gi++] = _i, vi = t.id, yi = t.overflow, _i = e;
	}
	var Ti = null, Ei = null, Di = !1, Oi = null, ki = !1, Ai = Error(s(519));
	function ji(e) {
		throw Li(ui(Error(s(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), Ai;
	}
	function Mi(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[Qe] = e, t[$e] = r, n) {
			case "dialog":
				Q("cancel", t), Q("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				Q("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < _d.length; n++) Q(_d[n], t);
				break;
			case "source":
				Q("error", t);
				break;
			case "img":
			case "image":
			case "link":
				Q("error", t), Q("load", t);
				break;
			case "details":
				Q("toggle", t);
				break;
			case "input":
				Q("invalid", t), Mt(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), It(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || Md(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = Gt), t = !0) : t = !1, t || ji(e, !0);
	}
	function Ni(e) {
		for (Ti = e.return; Ti;) switch (Ti.tag) {
			case 5:
			case 31:
			case 13:
				ki = !1;
				return;
			case 27:
			case 3:
				ki = !0;
				return;
			default: Ti = Ti.return;
		}
	}
	function Pi(e) {
		if (e !== Ti) return !1;
		if (!Di) return Ni(e), Di = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || Wd(e.type, e.memoizedProps)), n = !n), n && Ei && ji(e), Ni(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			Ei = df(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			Ei = df(e);
		} else t === 27 ? (t = Ei, Qd(e.type) ? (e = uf, uf = null, Ei = e) : Ei = t) : Ei = Ti ? lf(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Fi() {
		Ei = Ti = null, Di = !1;
	}
	function Ii() {
		var e = Oi;
		return e !== null && (Xl === null ? Xl = e : Xl.push.apply(Xl, e), Oi = null), e;
	}
	function Li(e) {
		Oi === null ? Oi = [e] : Oi.push(e);
	}
	var Ri = R(null), zi = null, Bi = null;
	function Vi(e, t, n) {
		B(Ri, t._currentValue), t._currentValue = n;
	}
	function Hi(e) {
		e._currentValue = Ri.current, z(Ri);
	}
	function Ui(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Wi(e, t, n, r) {
		var i = e.child;
		for (i !== null && (i.return = e); i !== null;) {
			var a = i.dependencies;
			if (a !== null) {
				var o = i.child;
				a = a.firstContext;
				a: for (; a !== null;) {
					var c = a;
					a = i;
					for (var l = 0; l < t.length; l++) if (c.context === t[l]) {
						a.lanes |= n, c = a.alternate, c !== null && (c.lanes |= n), Ui(a.return, n, e), r || (o = null);
						break a;
					}
					a = c.next;
				}
			} else if (i.tag === 18) {
				if (o = i.return, o === null) throw Error(s(341));
				o.lanes |= n, a = o.alternate, a !== null && (a.lanes |= n), Ui(o, n, e), o = null;
			} else o = i.child;
			if (o !== null) o.return = i;
			else for (o = i; o !== null;) {
				if (o === e) {
					o = null;
					break;
				}
				if (i = o.sibling, i !== null) {
					i.return = o.return, o = i;
					break;
				}
				o = o.return;
			}
			i = o;
		}
	}
	function Gi(e, t, n, r) {
		e = null;
		for (var i = t, a = !1; i !== null;) {
			if (!a) {
				if (i.flags & 524288) a = !0;
				else if (i.flags & 262144) break;
			}
			if (i.tag === 10) {
				var o = i.alternate;
				if (o === null) throw Error(s(387));
				if (o = o.memoizedProps, o !== null) {
					var c = i.type;
					mr(i.pendingProps.value, o.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (i === ie.current) {
				if (o = i.alternate, o === null) throw Error(s(387));
				o.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [$f] : e.push($f));
			}
			i = i.return;
		}
		e !== null && Wi(t, e, n, r), t.flags |= 262144;
	}
	function Ki(e) {
		for (e = e.firstContext; e !== null;) {
			if (!mr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function qi(e) {
		zi = e, Bi = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function Ji(e) {
		return Xi(zi, e);
	}
	function Yi(e, t) {
		return zi === null && qi(e), Xi(e, t);
	}
	function Xi(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, Bi === null) {
			if (e === null) throw Error(s(308));
			Bi = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else Bi = Bi.next = t;
		return n;
	}
	var Zi = typeof AbortController < "u" ? AbortController : function() {
		var e = [], t = this.signal = {
			aborted: !1,
			addEventListener: function(t, n) {
				e.push(n);
			}
		};
		this.abort = function() {
			t.aborted = !0, e.forEach(function(e) {
				return e();
			});
		};
	}, Qi = t.unstable_scheduleCallback, $i = t.unstable_NormalPriority, q = {
		$$typeof: C,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function ea() {
		return {
			controller: new Zi(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function ta(e) {
		e.refCount--, e.refCount === 0 && Qi($i, function() {
			e.controller.abort();
		});
	}
	var na = null, ra = 0, ia = 0, aa = null;
	function oa(e, t) {
		if (na === null) {
			var n = na = [];
			ra = 0, ia = dd(), aa = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return ra++, t.then(sa, sa), t;
	}
	function sa() {
		if (--ra === 0 && na !== null) {
			aa !== null && (aa.status = "fulfilled");
			var e = na;
			na = null, ia = 0, aa = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function ca(e, t) {
		var n = [], r = {
			status: "pending",
			value: null,
			reason: null,
			then: function(e) {
				n.push(e);
			}
		};
		return e.then(function() {
			r.status = "fulfilled", r.value = t;
			for (var e = 0; e < n.length; e++) (0, n[e])(t);
		}, function(e) {
			for (r.status = "rejected", r.reason = e, e = 0; e < n.length; e++) (0, n[e])(void 0);
		}), r;
	}
	var la = P.S;
	P.S = function(e, t) {
		$l = ye(), typeof t == "object" && t && typeof t.then == "function" && oa(e, t), la !== null && la(e, t);
	};
	var ua = R(null);
	function da() {
		var e = ua.current;
		return e === null ? Il.pooledCache : e;
	}
	function fa(e, t) {
		t === null ? B(ua, ua.current) : B(ua, t.pool);
	}
	function pa() {
		var e = da();
		return e === null ? null : {
			parent: q._currentValue,
			pool: e
		};
	}
	var ma = Error(s(460)), ha = Error(s(474)), ga = Error(s(542)), _a = { then: function() {} };
	function va(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function ya(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Gt, Gt), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Ca(e), e;
			default:
				if (typeof t.status == "string") t.then(Gt, Gt);
				else {
					if (e = Il, e !== null && 100 < e.shellSuspendCounter) throw Error(s(482));
					e = t, e.status = "pending", e.then(function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "fulfilled", n.value = e;
						}
					}, function(e) {
						if (t.status === "pending") {
							var n = t;
							n.status = "rejected", n.reason = e;
						}
					});
				}
				switch (t.status) {
					case "fulfilled": return t.value;
					case "rejected": throw e = t.reason, Ca(e), e;
				}
				throw xa = t, ma;
		}
	}
	function ba(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (xa = e, ma) : e;
		}
	}
	var xa = null;
	function Sa() {
		if (xa === null) throw Error(s(459));
		var e = xa;
		return xa = null, e;
	}
	function Ca(e) {
		if (e === ma || e === ga) throw Error(s(483));
	}
	var wa = null, Ta = 0;
	function Ea(e) {
		var t = Ta;
		return Ta += 1, wa === null && (wa = []), ya(wa, e, t);
	}
	function Da(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function Oa(e, t) {
		throw t.$$typeof === g ? Error(s(525)) : (e = Object.prototype.toString.call(t), Error(s(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function ka(e) {
		function t(t, n) {
			if (e) {
				var r = t.deletions;
				r === null ? (t.deletions = [n], t.flags |= 16) : r.push(n);
			}
		}
		function n(n, r) {
			if (!e) return null;
			for (; r !== null;) t(n, r), r = r.sibling;
			return null;
		}
		function r(e) {
			for (var t = /* @__PURE__ */ new Map(); e !== null;) e.key === null ? t.set(e.index, e) : t.set(e.key, e), e = e.sibling;
			return t;
		}
		function i(e, t) {
			return e = ni(e, t), e.index = 0, e.sibling = null, e;
		}
		function a(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 67108866, n) : (r = r.index, r < n ? (t.flags |= 67108866, n) : r)) : (t.flags |= 1048576, n);
		}
		function o(t) {
			return e && t.alternate === null && (t.flags |= 67108866), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = oi(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === y ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === O && ba(a) === t.type) ? (t = i(t, n.props), Da(t, n), t.return = e, t) : (t = ii(n.type, n.key, n.props, null, e.mode, r), Da(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = ci(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = ai(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = oi("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case _: return n = ii(t.type, t.key, t.props, null, e.mode, n), Da(n, t), n.return = e, n;
					case v: return t = ci(t, e.mode, n), t.return = e, t;
					case O: return t = ba(t), f(e, t, n);
				}
				if (te(t) || M(t)) return t = ai(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, Ea(t), n);
				if (t.$$typeof === C) return f(e, Yi(e, t), n);
				Oa(e, t);
			}
			return null;
		}
		function p(e, t, n, r) {
			var i = t === null ? null : t.key;
			if (typeof n == "string" && n !== "" || typeof n == "number" || typeof n == "bigint") return i === null ? c(e, t, "" + n, r) : null;
			if (typeof n == "object" && n) {
				switch (n.$$typeof) {
					case _: return n.key === i ? l(e, t, n, r) : null;
					case v: return n.key === i ? u(e, t, n, r) : null;
					case O: return n = ba(n), p(e, t, n, r);
				}
				if (te(n) || M(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, Ea(n), r);
				if (n.$$typeof === C) return p(e, t, Yi(e, n), r);
				Oa(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case _: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case v: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case O: return r = ba(r), m(e, t, n, r, i);
				}
				if (te(r) || M(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, Ea(r), i);
				if (r.$$typeof === C) return m(e, t, n, Yi(t, r), i);
				Oa(t, r);
			}
			return null;
		}
		function h(i, o, s, c) {
			for (var l = null, u = null, d = o, h = o = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), o = a(_, o, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), Di && bi(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return Di && bi(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), Di && bi(i, h), l;
		}
		function g(i, o, c, l) {
			if (c == null) throw Error(s(151));
			for (var u = null, d = null, h = o, g = o = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(i, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(i, h), o = a(y, o, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(i, h), Di && bi(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
				return Di && bi(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), Di && bi(i, g), u;
		}
		function b(e, r, a, c) {
			if (typeof a == "object" && a && a.type === y && a.key === null && (a = a.props.children), typeof a == "object" && a) {
				switch (a.$$typeof) {
					case _:
						a: {
							for (var l = a.key; r !== null;) {
								if (r.key === l) {
									if (l = a.type, l === y) {
										if (r.tag === 7) {
											n(e, r.sibling), c = i(r, a.props.children), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === O && ba(l) === r.type) {
										n(e, r.sibling), c = i(r, a.props), Da(c, a), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								} else t(e, r);
								r = r.sibling;
							}
							a.type === y ? (c = ai(a.props.children, e.mode, c, a.key), c.return = e, e = c) : (c = ii(a.type, a.key, a.props, null, e.mode, c), Da(c, a), c.return = e, e = c);
						}
						return o(e);
					case v:
						a: {
							for (l = a.key; r !== null;) {
								if (r.key === l) if (r.tag === 4 && r.stateNode.containerInfo === a.containerInfo && r.stateNode.implementation === a.implementation) {
									n(e, r.sibling), c = i(r, a.children || []), c.return = e, e = c;
									break a;
								} else {
									n(e, r);
									break;
								}
								else t(e, r);
								r = r.sibling;
							}
							c = ci(a, e.mode, c), c.return = e, e = c;
						}
						return o(e);
					case O: return a = ba(a), b(e, r, a, c);
				}
				if (te(a)) return h(e, r, a, c);
				if (M(a)) {
					if (l = M(a), typeof l != "function") throw Error(s(150));
					return a = l.call(a), g(e, r, a, c);
				}
				if (typeof a.then == "function") return b(e, r, Ea(a), c);
				if (a.$$typeof === C) return b(e, r, Yi(e, a), c);
				Oa(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), c = i(r, a), c.return = e, e = c) : (n(e, r), c = oi(a, e.mode, c), c.return = e, e = c), o(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				Ta = 0;
				var i = b(e, t, n, r);
				return wa = null, i;
			} catch (t) {
				if (t === ma || t === ga) throw t;
				var a = ei(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var Aa = ka(!0), ja = ka(!1), Ma = !1;
	function Na(e) {
		e.updateQueue = {
			baseState: e.memoizedState,
			firstBaseUpdate: null,
			lastBaseUpdate: null,
			shared: {
				pending: null,
				lanes: 0,
				hiddenCallbacks: null
			},
			callbacks: null
		};
	}
	function Pa(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function Fa(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function Ia(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, Fl & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = Zr(e), Xr(e, null, n), t;
		}
		return qr(e, r, t, n), Zr(e);
	}
	function La(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Ge(e, n);
		}
	}
	function Ra(e, t) {
		var n = e.updateQueue, r = e.alternate;
		if (r !== null && (r = r.updateQueue, n === r)) {
			var i = null, a = null;
			if (n = n.firstBaseUpdate, n !== null) {
				do {
					var o = {
						lane: n.lane,
						tag: n.tag,
						payload: n.payload,
						callback: null,
						next: null
					};
					a === null ? i = a = o : a = a.next = o, n = n.next;
				} while (n !== null);
				a === null ? i = a = t : a = a.next = t;
			} else i = a = t;
			n = {
				baseState: r.baseState,
				firstBaseUpdate: i,
				lastBaseUpdate: a,
				shared: r.shared,
				callbacks: r.callbacks
			}, e.updateQueue = n;
			return;
		}
		e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
	}
	var za = !1;
	function Ba() {
		if (za) {
			var e = aa;
			if (e !== null) throw e;
		}
	}
	function Va(e, t, n, r) {
		za = !1;
		var i = e.updateQueue;
		Ma = !1;
		var a = i.firstBaseUpdate, o = i.lastBaseUpdate, s = i.shared.pending;
		if (s !== null) {
			i.shared.pending = null;
			var c = s, l = c.next;
			c.next = null, o === null ? a = l : o.next = l, o = c;
			var u = e.alternate;
			u !== null && (u = u.updateQueue, s = u.lastBaseUpdate, s !== o && (s === null ? u.firstBaseUpdate = l : s.next = l, u.lastBaseUpdate = c));
		}
		if (a !== null) {
			var d = i.baseState;
			o = 0, u = l = c = null, s = a;
			do {
				var f = s.lane & -536870913, p = f !== s.lane;
				if (p ? (Z & f) === f : (r & f) === f) {
					f !== 0 && f === ia && (za = !0), u !== null && (u = u.next = {
						lane: 0,
						tag: s.tag,
						payload: s.payload,
						callback: null,
						next: null
					});
					a: {
						var m = e, g = s;
						f = t;
						var _ = n;
						switch (g.tag) {
							case 1:
								if (m = g.payload, typeof m == "function") {
									d = m.call(_, d, f);
									break a;
								}
								d = m;
								break a;
							case 3: m.flags = m.flags & -65537 | 128;
							case 0:
								if (m = g.payload, f = typeof m == "function" ? m.call(_, d, f) : m, f == null) break a;
								d = h({}, d, f);
								break a;
							case 2: Ma = !0;
						}
					}
					f = s.callback, f !== null && (e.flags |= 64, p && (e.flags |= 8192), p = i.callbacks, p === null ? i.callbacks = [f] : p.push(f));
				} else p = {
					lane: f,
					tag: s.tag,
					payload: s.payload,
					callback: s.callback,
					next: null
				}, u === null ? (l = u = p, c = d) : u = u.next = p, o |= f;
				if (s = s.next, s === null) {
					if (s = i.shared.pending, s === null) break;
					p = s, s = p.next, p.next = null, i.lastBaseUpdate = p, i.shared.pending = null;
				}
			} while (1);
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), Wl |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function Ha(e, t) {
		if (typeof e != "function") throw Error(s(191, e));
		e.call(t);
	}
	function Ua(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) Ha(n[e], t);
	}
	var Wa = R(null), Ga = R(0);
	function Ka(e, t) {
		e = Hl, B(Ga, e), B(Wa, t), Hl = e | t.baseLanes;
	}
	function qa() {
		B(Ga, Hl), B(Wa, Wa.current);
	}
	function Ja() {
		Hl = Ga.current, z(Wa), z(Ga);
	}
	var Ya = R(null), Xa = null;
	function Za(e) {
		var t = e.alternate;
		B(no, no.current & 1), B(Ya, e), Xa === null && (t === null || Wa.current !== null || t.memoizedState !== null) && (Xa = e);
	}
	function Qa(e) {
		B(no, no.current), B(Ya, e), Xa === null && (Xa = e);
	}
	function $a(e) {
		e.tag === 22 ? (B(no, no.current), B(Ya, e), Xa === null && (Xa = e)) : eo(e);
	}
	function eo() {
		B(no, no.current), B(Ya, Ya.current);
	}
	function to(e) {
		z(Ya), Xa === e && (Xa = null), z(no);
	}
	var no = R(0);
	function ro(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || of(n) || sf(n))) return t;
			} else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
				if (t.flags & 128) return t;
			} else if (t.child !== null) {
				t.child.return = t, t = t.child;
				continue;
			}
			if (t === e) break;
			for (; t.sibling === null;) {
				if (t.return === null || t.return === e) return null;
				t = t.return;
			}
			t.sibling.return = t.return, t = t.sibling;
		}
		return null;
	}
	var io = 0, J = null, ao = null, oo = null, so = !1, co = !1, lo = !1, uo = 0, fo = 0, po = null, mo = 0;
	function ho() {
		throw Error(s(321));
	}
	function go(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!mr(e[n], t[n])) return !1;
		return !0;
	}
	function _o(e, t, n, r, i, a) {
		return io = a, J = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, P.H = e === null || e.memoizedState === null ? Ps : Fs, lo = !1, a = n(r, i), lo = !1, co && (a = yo(t, n, r, i)), vo(e), a;
	}
	function vo(e) {
		P.H = Ns;
		var t = ao !== null && ao.next !== null;
		if (io = 0, oo = ao = J = null, so = !1, fo = 0, po = null, t) throw Error(s(300));
		e === null || Zs || (e = e.dependencies, e !== null && Ki(e) && (Zs = !0));
	}
	function yo(e, t, n, r) {
		J = e;
		var i = 0;
		do {
			if (co && (po = null), fo = 0, co = !1, 25 <= i) throw Error(s(301));
			if (i += 1, oo = ao = null, e.updateQueue != null) {
				var a = e.updateQueue;
				a.lastEffect = null, a.events = null, a.stores = null, a.memoCache != null && (a.memoCache.index = 0);
			}
			P.H = Is, a = t(n, r);
		} while (co);
		return a;
	}
	function bo() {
		var e = P.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? Do(t) : t, e = e.useState()[0], (ao === null ? null : ao.memoizedState) !== e && (J.flags |= 1024), t;
	}
	function xo() {
		var e = uo !== 0;
		return uo = 0, e;
	}
	function So(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function Co(e) {
		if (so) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			so = !1;
		}
		io = 0, oo = ao = J = null, co = !1, fo = uo = 0, po = null;
	}
	function wo() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return oo === null ? J.memoizedState = oo = e : oo = oo.next = e, oo;
	}
	function To() {
		if (ao === null) {
			var e = J.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = ao.next;
		var t = oo === null ? J.memoizedState : oo.next;
		if (t !== null) oo = t, ao = e;
		else {
			if (e === null) throw J.alternate === null ? Error(s(467)) : Error(s(310));
			ao = e, e = {
				memoizedState: ao.memoizedState,
				baseState: ao.baseState,
				baseQueue: ao.baseQueue,
				queue: ao.queue,
				next: null
			}, oo === null ? J.memoizedState = oo = e : oo = oo.next = e;
		}
		return oo;
	}
	function Eo() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function Do(e) {
		var t = fo;
		return fo += 1, po === null && (po = []), e = ya(po, e, t), t = J, (oo === null ? t.memoizedState : oo.next) === null && (t = t.alternate, P.H = t === null || t.memoizedState === null ? Ps : Fs), e;
	}
	function Oo(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return Do(e);
			if (e.$$typeof === C) return Ji(e);
		}
		throw Error(s(438, String(e)));
	}
	function ko(e) {
		var t = null, n = J.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = J.alternate;
			r !== null && (r = r.updateQueue, r !== null && (r = r.memoCache, r != null && (t = {
				data: r.data.map(function(e) {
					return e.slice();
				}),
				index: 0
			})));
		}
		if (t ??= {
			data: [],
			index: 0
		}, n === null && (n = Eo(), J.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = A;
		return t.index++, n;
	}
	function Ao(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function jo(e) {
		return Mo(To(), ao, e);
	}
	function Mo(e, t, n) {
		var r = e.queue;
		if (r === null) throw Error(s(311));
		r.lastRenderedReducer = n;
		var i = e.baseQueue, a = r.pending;
		if (a !== null) {
			if (i !== null) {
				var o = i.next;
				i.next = a.next, a.next = o;
			}
			t.baseQueue = i = a, r.pending = null;
		}
		if (a = e.baseState, i === null) e.memoizedState = a;
		else {
			t = i.next;
			var c = o = null, l = null, u = t, d = !1;
			do {
				var f = u.lane & -536870913;
				if (f === u.lane ? (io & f) === f : (Z & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === ia && (d = !0);
					else if ((io & p) === p) {
						u = u.next, p === ia && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, o = a) : l = l.next = f, J.lanes |= p, Wl |= p;
					f = u.action, lo && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, o = a) : l = l.next = p, J.lanes |= f, Wl |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? o = a : l.next = c, !mr(a, e.memoizedState) && (Zs = !0, d && (n = aa, n !== null))) throw n;
			e.memoizedState = a, e.baseState = o, e.baseQueue = l, r.lastRenderedState = a;
		}
		return i === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function No(e) {
		var t = To(), n = t.queue;
		if (n === null) throw Error(s(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, a = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var o = i = i.next;
			do
				a = e(a, o.action), o = o.next;
			while (o !== i);
			mr(a, t.memoizedState) || (Zs = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function Po(e, t, n) {
		var r = J, i = To(), a = Di;
		if (a) {
			if (n === void 0) throw Error(s(407));
			n = n();
		} else n = t();
		var o = !mr((ao || i).memoizedState, n);
		if (o && (i.memoizedState = n, Zs = !0), i = i.queue, as(Lo.bind(null, r, i, e), [e]), i.getSnapshot !== t || o || oo !== null && oo.memoizedState.tag & 1) {
			if (r.flags |= 2048, es(9, { destroy: void 0 }, Io.bind(null, r, i, n, t), null), Il === null) throw Error(s(349));
			a || io & 127 || Fo(r, t, n);
		}
		return n;
	}
	function Fo(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = J.updateQueue, t === null ? (t = Eo(), J.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function Io(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Ro(t) && zo(e);
	}
	function Lo(e, t, n) {
		return n(function() {
			Ro(t) && zo(e);
		});
	}
	function Ro(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !mr(e, n);
		} catch {
			return !0;
		}
	}
	function zo(e) {
		var t = Yr(e, 2);
		t !== null && mu(t, e, 2);
	}
	function Bo(e) {
		var t = wo();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), lo) {
				ke(!0);
				try {
					n();
				} finally {
					ke(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Ao,
			lastRenderedState: e
		}, t;
	}
	function Vo(e, t, n, r) {
		return e.baseState = n, Mo(e, ao, typeof r == "function" ? r : Ao);
	}
	function Ho(e, t, n, r, i) {
		if (As(e)) throw Error(s(485));
		if (e = t.action, e !== null) {
			var a = {
				payload: i,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(e) {
					a.listeners.push(e);
				}
			};
			P.T === null ? a.isTransition = !1 : n(!0), r(a), n = t.pending, n === null ? (a.next = t.pending = a, Uo(t, a)) : (a.next = n.next, t.pending = n.next = a);
		}
	}
	function Uo(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = P.T, o = {};
			P.T = o;
			try {
				var s = n(i, r), c = P.S;
				c !== null && c(o, s), Wo(e, t, s);
			} catch (n) {
				Ko(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), P.T = a;
			}
		} else try {
			a = n(i, r), Wo(e, t, a);
		} catch (n) {
			Ko(e, t, n);
		}
	}
	function Wo(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Go(e, t, n);
		}, function(n) {
			return Ko(e, t, n);
		}) : Go(e, t, n);
	}
	function Go(e, t, n) {
		t.status = "fulfilled", t.value = n, qo(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Uo(e, n)));
	}
	function Ko(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, qo(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function qo(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function Jo(e, t) {
		return t;
	}
	function Yo(e, t) {
		if (Di) {
			var n = Il.formState;
			if (n !== null) {
				a: {
					var r = J;
					if (Di) {
						if (Ei) {
							b: {
								for (var i = Ei, a = ki; i.nodeType !== 8;) {
									if (!a) {
										i = null;
										break b;
									}
									if (i = lf(i.nextSibling), i === null) {
										i = null;
										break b;
									}
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								Ei = lf(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						ji(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = wo(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Jo,
			lastRenderedState: t
		}, n.queue = r, n = Ds.bind(null, J, r), r.dispatch = n, r = Bo(!1), a = ks.bind(null, J, !1, r.queue), r = wo(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Ho.bind(null, J, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function Xo(e) {
		return Zo(To(), ao, e);
	}
	function Zo(e, t, n) {
		if (t = Mo(e, t, Jo)[0], e = jo(Ao)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = Do(t);
		} catch (e) {
			throw e === ma ? ga : e;
		}
		else r = t;
		t = To();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (J.flags |= 2048, es(9, { destroy: void 0 }, Qo.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Qo(e, t) {
		e.action = t;
	}
	function $o(e) {
		var t = To(), n = ao;
		if (n !== null) return Zo(t, n, e);
		To(), t = t.memoizedState, n = To();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function es(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = J.updateQueue, t === null && (t = Eo(), J.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function ts() {
		return To().memoizedState;
	}
	function ns(e, t, n, r) {
		var i = wo();
		J.flags |= e, i.memoizedState = es(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function rs(e, t, n, r) {
		var i = To();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		ao !== null && r !== null && go(r, ao.memoizedState.deps) ? i.memoizedState = es(t, a, n, r) : (J.flags |= e, i.memoizedState = es(1 | t, a, n, r));
	}
	function is(e, t) {
		ns(8390656, 8, e, t);
	}
	function as(e, t) {
		rs(2048, 8, e, t);
	}
	function os(e) {
		J.flags |= 4;
		var t = J.updateQueue;
		if (t === null) t = Eo(), J.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function ss(e) {
		var t = To().memoizedState;
		return os({
			ref: t,
			nextImpl: e
		}), function() {
			if (Fl & 2) throw Error(s(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function cs(e, t) {
		return rs(4, 2, e, t);
	}
	function ls(e, t) {
		return rs(4, 4, e, t);
	}
	function us(e, t) {
		if (typeof t == "function") {
			e = e();
			var n = t(e);
			return function() {
				typeof n == "function" ? n() : t(null);
			};
		}
		if (t != null) return e = e(), t.current = e, function() {
			t.current = null;
		};
	}
	function ds(e, t, n) {
		n = n == null ? null : n.concat([e]), rs(4, 4, us.bind(null, t, e), n);
	}
	function fs() {}
	function ps(e, t) {
		var n = To();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && go(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function ms(e, t) {
		var n = To();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && go(t, r[1])) return r[0];
		if (r = e(), lo) {
			ke(!0);
			try {
				e();
			} finally {
				ke(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function hs(e, t, n) {
		return n === void 0 || io & 1073741824 && !(Z & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = pu(), J.lanes |= e, Wl |= e, n);
	}
	function gs(e, t, n, r) {
		return mr(n, t) ? n : Wa.current === null ? !(io & 42) || io & 1073741824 && !(Z & 261930) ? (Zs = !0, e.memoizedState = n) : (e = pu(), J.lanes |= e, Wl |= e, t) : (e = hs(e, n, r), mr(e, t) || (Zs = !0), e);
	}
	function _s(e, t, n, r, i) {
		var a = F.p;
		F.p = a !== 0 && 8 > a ? a : 8;
		var o = P.T, s = {};
		P.T = s, ks(e, !1, t, n);
		try {
			var c = i(), l = P.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? Os(e, t, ca(c, r), fu(e)) : Os(e, t, r, fu(e));
		} catch (n) {
			Os(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, fu());
		} finally {
			F.p = a, o !== null && s.types !== null && (o.types = s.types), P.T = o;
		}
	}
	function vs() {}
	function ys(e, t, n, r) {
		if (e.tag !== 5) throw Error(s(476));
		var i = bs(e).queue;
		_s(e, i, t, I, n === null ? vs : function() {
			return xs(e), n(r);
		});
	}
	function bs(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: I,
			baseState: I,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: Ao,
				lastRenderedState: I
			},
			next: null
		};
		var n = {};
		return t.next = {
			memoizedState: n,
			baseState: n,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: Ao,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function xs(e) {
		var t = bs(e);
		t.next === null && (t = e.alternate.memoizedState), Os(e, t.next.queue, {}, fu());
	}
	function Ss() {
		return Ji($f);
	}
	function Cs() {
		return To().memoizedState;
	}
	function ws() {
		return To().memoizedState;
	}
	function Ts(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = fu();
					e = Fa(n);
					var r = Ia(t, e, n);
					r !== null && (mu(r, t, n), La(r, t, n)), t = { cache: ea() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function Es(e, t, n) {
		var r = fu();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, As(e) ? js(t, n) : (n = Jr(e, t, n, r), n !== null && (mu(n, e, r), Ms(n, t, r)));
	}
	function Ds(e, t, n) {
		Os(e, t, n, fu());
	}
	function Os(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (As(e)) js(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, mr(s, o)) return qr(e, t, i, 0), Il === null && Kr(), !1;
			} catch {}
			if (n = Jr(e, t, i, r), n !== null) return mu(n, e, r), Ms(n, t, r), !0;
		}
		return !1;
	}
	function ks(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: dd(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, As(e)) {
			if (t) throw Error(s(479));
		} else t = Jr(e, n, r, 2), t !== null && mu(t, e, 2);
	}
	function As(e) {
		var t = e.alternate;
		return e === J || t !== null && t === J;
	}
	function js(e, t) {
		co = so = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function Ms(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Ge(e, n);
		}
	}
	var Ns = {
		readContext: Ji,
		use: Oo,
		useCallback: ho,
		useContext: ho,
		useEffect: ho,
		useImperativeHandle: ho,
		useLayoutEffect: ho,
		useInsertionEffect: ho,
		useMemo: ho,
		useReducer: ho,
		useRef: ho,
		useState: ho,
		useDebugValue: ho,
		useDeferredValue: ho,
		useTransition: ho,
		useSyncExternalStore: ho,
		useId: ho,
		useHostTransitionStatus: ho,
		useFormState: ho,
		useActionState: ho,
		useOptimistic: ho,
		useMemoCache: ho,
		useCacheRefresh: ho
	};
	Ns.useEffectEvent = ho;
	var Ps = {
		readContext: Ji,
		use: Oo,
		useCallback: function(e, t) {
			return wo().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Ji,
		useEffect: is,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), ns(4194308, 4, us.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return ns(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			ns(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = wo();
			t = t === void 0 ? null : t;
			var r = e();
			if (lo) {
				ke(!0);
				try {
					e();
				} finally {
					ke(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = wo();
			if (n !== void 0) {
				var i = n(t);
				if (lo) {
					ke(!0);
					try {
						n(t);
					} finally {
						ke(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = Es.bind(null, J, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = wo();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = Bo(e);
			var t = e.queue, n = Ds.bind(null, J, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: fs,
		useDeferredValue: function(e, t) {
			return hs(wo(), e, t);
		},
		useTransition: function() {
			var e = Bo(!1);
			return e = _s.bind(null, J, e.queue, !0, !1), wo().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = J, i = wo();
			if (Di) {
				if (n === void 0) throw Error(s(407));
				n = n();
			} else {
				if (n = t(), Il === null) throw Error(s(349));
				Z & 127 || Fo(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, is(Lo.bind(null, r, a, e), [e]), r.flags |= 2048, es(9, { destroy: void 0 }, Io.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = wo(), t = Il.identifierPrefix;
			if (Di) {
				var n = yi, r = vi;
				n = (r & ~(1 << 32 - Ae(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = uo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = mo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: Ss,
		useFormState: Yo,
		useActionState: Yo,
		useOptimistic: function(e) {
			var t = wo();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = ks.bind(null, J, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: ko,
		useCacheRefresh: function() {
			return wo().memoizedState = Ts.bind(null, J);
		},
		useEffectEvent: function(e) {
			var t = wo(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (Fl & 2) throw Error(s(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, Fs = {
		readContext: Ji,
		use: Oo,
		useCallback: ps,
		useContext: Ji,
		useEffect: as,
		useImperativeHandle: ds,
		useInsertionEffect: cs,
		useLayoutEffect: ls,
		useMemo: ms,
		useReducer: jo,
		useRef: ts,
		useState: function() {
			return jo(Ao);
		},
		useDebugValue: fs,
		useDeferredValue: function(e, t) {
			return gs(To(), ao.memoizedState, e, t);
		},
		useTransition: function() {
			var e = jo(Ao)[0], t = To().memoizedState;
			return [typeof e == "boolean" ? e : Do(e), t];
		},
		useSyncExternalStore: Po,
		useId: Cs,
		useHostTransitionStatus: Ss,
		useFormState: Xo,
		useActionState: Xo,
		useOptimistic: function(e, t) {
			return Vo(To(), ao, e, t);
		},
		useMemoCache: ko,
		useCacheRefresh: ws
	};
	Fs.useEffectEvent = ss;
	var Is = {
		readContext: Ji,
		use: Oo,
		useCallback: ps,
		useContext: Ji,
		useEffect: as,
		useImperativeHandle: ds,
		useInsertionEffect: cs,
		useLayoutEffect: ls,
		useMemo: ms,
		useReducer: No,
		useRef: ts,
		useState: function() {
			return No(Ao);
		},
		useDebugValue: fs,
		useDeferredValue: function(e, t) {
			var n = To();
			return ao === null ? hs(n, e, t) : gs(n, ao.memoizedState, e, t);
		},
		useTransition: function() {
			var e = No(Ao)[0], t = To().memoizedState;
			return [typeof e == "boolean" ? e : Do(e), t];
		},
		useSyncExternalStore: Po,
		useId: Cs,
		useHostTransitionStatus: Ss,
		useFormState: $o,
		useActionState: $o,
		useOptimistic: function(e, t) {
			var n = To();
			return ao === null ? (n.baseState = e, [e, n.queue.dispatch]) : Vo(n, ao, e, t);
		},
		useMemoCache: ko,
		useCacheRefresh: ws
	};
	Is.useEffectEvent = ss;
	function Ls(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : h({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var Y = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = fu(), i = Fa(r);
			i.payload = t, n != null && (i.callback = n), t = Ia(e, i, r), t !== null && (mu(t, e, r), La(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = fu(), i = Fa(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = Ia(e, i, r), t !== null && (mu(t, e, r), La(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = fu(), r = Fa(n);
			r.tag = 2, t != null && (r.callback = t), t = Ia(e, r, n), t !== null && (mu(t, e, n), La(t, e, n));
		}
	};
	function Rs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !hr(n, r) || !hr(i, a) : !0;
	}
	function zs(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Y.enqueueReplaceState(t, t.state, null);
	}
	function Bs(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = h({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Vs(e) {
		Hr(e);
	}
	function Hs(e) {
		console.error(e);
	}
	function Us(e) {
		Hr(e);
	}
	function Ws(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Gs(e, t, n) {
		try {
			var r = e.onCaughtError;
			r(n.value, {
				componentStack: n.stack,
				errorBoundary: t.tag === 1 ? t.stateNode : null
			});
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Ks(e, t, n) {
		return n = Fa(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Ws(e, t);
		}, n;
	}
	function qs(e) {
		return e = Fa(e), e.tag = 3, e;
	}
	function Js(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Gs(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Gs(t, n, r), typeof i != "function" && (nu === null ? nu = new Set([this]) : nu.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Ys(e, t, n, r, i) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Gi(t, n, i, !0), n = Ya.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return Xa === null ? Eu() : n.alternate === null && Ul === 0 && (Ul = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === _a ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = new Set([r]) : t.add(r), Gu(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === _a ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = new Set([r]) : n.add(r)), Gu(e, r, i)), !1;
				}
				throw Error(s(435, n.tag));
			}
			return Gu(e, r, i), Eu(), !1;
		}
		if (Di) return t = Ya.current, t === null ? (r !== Ai && (t = Error(s(423), { cause: r }), Li(ui(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = ui(r, n), i = Ks(e.stateNode, r, i), Ra(e, i), Ul !== 4 && (Ul = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== Ai && (e = Error(s(422), { cause: r }), Li(ui(e, n)))), !1;
		var a = Error(s(520), { cause: r });
		if (a = ui(a, n), Yl === null ? Yl = [a] : Yl.push(a), Ul !== 4 && (Ul = 2), t === null) return !0;
		r = ui(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = Ks(n.stateNode, r, e), Ra(n, e), !1;
				case 1: if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (nu === null || !nu.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = qs(i), Js(i, e, n, r), Ra(n, i), !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Xs = Error(s(461)), Zs = !1;
	function Qs(e, t, n, r) {
		t.child = e === null ? ja(t, null, n, r) : Aa(t, e.child, n, r);
	}
	function $s(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return qi(t), r = _o(e, t, n, o, a, i), s = xo(), e !== null && !Zs ? (So(e, t, i), Cc(e, t, i)) : (Di && s && Si(t), t.flags |= 1, Qs(e, t, r, i), t.child);
	}
	function ec(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ti(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, tc(e, t, a, r, i)) : (e = ii(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !wc(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? hr : n, n(o, r) && e.ref === t.ref) return Cc(e, t, i);
		}
		return t.flags |= 1, e = ni(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function tc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (hr(a, r) && e.ref === t.ref) if (Zs = !1, t.pendingProps = r = a, wc(e, i)) e.flags & 131072 && (Zs = !0);
			else return t.lanes = e.lanes, Cc(e, t, i);
		}
		return lc(e, t, n, r, i);
	}
	function nc(e, t, n, r) {
		var i = r.children, a = e === null ? null : e.memoizedState;
		if (e === null && t.stateNode === null && (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), r.mode === "hidden") {
			if (t.flags & 128) {
				if (a = a === null ? n : a.baseLanes | n, e !== null) {
					for (r = t.child = e.child, i = 0; r !== null;) i = i | r.lanes | r.childLanes, r = r.sibling;
					r = i & ~a;
				} else r = 0, t.child = null;
				return ic(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && fa(t, a === null ? null : a.cachePool), a === null ? qa() : Ka(t, a), $a(t);
			else return r = t.lanes = 536870912, ic(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && fa(t, null), qa(), eo(t)) : (fa(t, a.cachePool), Ka(t, a), eo(t), t.memoizedState = null);
		return Qs(e, t, i, n), t.child;
	}
	function rc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function ic(e, t, n, r, i) {
		var a = da();
		return a = a === null ? null : {
			parent: q._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && fa(t, null), qa(), $a(t), e !== null && Gi(e, t, r, !0), t.childLanes = i, null;
	}
	function ac(e, t) {
		return t = vc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function oc(e, t, n) {
		return Aa(t, e.child, null, n), e = ac(t, t.pendingProps), e.flags |= 2, to(t), t.memoizedState = null, e;
	}
	function sc(e, t, n) {
		var r = t.pendingProps, i = (t.flags & 128) != 0;
		if (t.flags &= -129, e === null) {
			if (Di) {
				if (r.mode === "hidden") return e = ac(t, r), t.lanes = 536870912, rc(null, e);
				if (Qa(t), (e = Ei) ? (e = af(e, ki), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: _i === null ? null : {
						id: vi,
						overflow: yi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = si(e), n.return = t, t.child = n, Ti = t, Ei = null)) : e = null, e === null) throw ji(t);
				return t.lanes = 536870912, null;
			}
			return ac(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var o = a.dehydrated;
			if (Qa(t), i) if (t.flags & 256) t.flags &= -257, t = oc(e, t, n);
			else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
			else throw Error(s(558));
			else if (Zs || Gi(e, t, n, !1), i = (n & e.childLanes) !== 0, Zs || i) {
				if (r = Il, r !== null && (o = Ke(r, n), o !== 0 && o !== a.retryLane)) throw a.retryLane = o, Yr(e, o), mu(r, e, o), Xs;
				Eu(), t = oc(e, t, n);
			} else e = a.treeContext, Ei = lf(o.nextSibling), Ti = t, Di = !0, Oi = null, ki = !1, e !== null && wi(t, e), t = ac(t, r), t.flags |= 4096;
			return t;
		}
		return e = ni(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function cc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(s(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function lc(e, t, n, r, i) {
		return qi(t), n = _o(e, t, n, r, void 0, i), r = xo(), e !== null && !Zs ? (So(e, t, i), Cc(e, t, i)) : (Di && r && Si(t), t.flags |= 1, Qs(e, t, n, i), t.child);
	}
	function uc(e, t, n, r, i, a) {
		return qi(t), t.updateQueue = null, n = yo(t, r, n, i), vo(e), r = xo(), e !== null && !Zs ? (So(e, t, a), Cc(e, t, a)) : (Di && r && Si(t), t.flags |= 1, Qs(e, t, n, a), t.child);
	}
	function dc(e, t, n, r, i) {
		if (qi(t), t.stateNode === null) {
			var a = Qr, o = n.contextType;
			typeof o == "object" && o && (a = Ji(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Y, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Na(t), o = n.contextType, a.context = typeof o == "object" && o ? Ji(o) : Qr, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Ls(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Y.enqueueReplaceState(a, a.state, null), Va(t, r, a, i), Ba(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Bs(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = Qr, typeof u == "object" && u && (o = Ji(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && zs(t, a, r, o), Ma = !1;
			var f = t.memoizedState;
			a.state = f, Va(t, r, a, i), Ba(), l = t.memoizedState, s || f !== l || Ma ? (typeof d == "function" && (Ls(t, n, d, r), l = t.memoizedState), (c = Ma || Rs(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Pa(e, t), o = t.memoizedProps, u = Bs(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = Qr, typeof l == "object" && l && (c = Ji(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && zs(t, a, r, c), Ma = !1, f = t.memoizedState, a.state = f, Va(t, r, a, i), Ba();
			var p = t.memoizedState;
			o !== d || f !== p || Ma || e !== null && e.dependencies !== null && Ki(e.dependencies) ? (typeof s == "function" && (Ls(t, n, s, r), p = t.memoizedState), (u = Ma || Rs(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Ki(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, cc(e, t), r = (t.flags & 128) != 0, a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = Aa(t, e.child, null, i), t.child = Aa(t, null, n, i)) : Qs(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = Cc(e, t, i), e;
	}
	function fc(e, t, n, r) {
		return Fi(), t.flags |= 256, Qs(e, t, n, r), t.child;
	}
	var pc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function mc(e) {
		return {
			baseLanes: e,
			cachePool: pa()
		};
	}
	function hc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ql), e;
	}
	function gc(e, t, n) {
		var r = t.pendingProps, i = !1, a = (t.flags & 128) != 0, o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : (no.current & 2) != 0), o && (i = !0, t.flags &= -129), o = (t.flags & 32) != 0, t.flags &= -33, e === null) {
			if (Di) {
				if (i ? Za(t) : eo(t), (e = Ei) ? (e = af(e, ki), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: _i === null ? null : {
						id: vi,
						overflow: yi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = si(e), n.return = t, t.child = n, Ti = t, Ei = null)) : e = null, e === null) throw ji(t);
				return sf(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var c = r.children;
			return r = r.fallback, i ? (eo(t), i = t.mode, c = vc({
				mode: "hidden",
				children: c
			}, i), r = ai(r, i, n, null), c.return = t, r.return = t, c.sibling = r, t.child = c, r = t.child, r.memoizedState = mc(n), r.childLanes = hc(e, o, n), t.memoizedState = pc, rc(null, r)) : (Za(t), _c(t, c));
		}
		var l = e.memoizedState;
		if (l !== null && (c = l.dehydrated, c !== null)) {
			if (a) t.flags & 256 ? (Za(t), t.flags &= -257, t = yc(e, t, n)) : t.memoizedState === null ? (eo(t), c = r.fallback, i = t.mode, r = vc({
				mode: "visible",
				children: r.children
			}, i), c = ai(c, i, n, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, Aa(t, e.child, null, n), r = t.child, r.memoizedState = mc(n), r.childLanes = hc(e, o, n), t.memoizedState = pc, t = rc(null, r)) : (eo(t), t.child = e.child, t.flags |= 128, t = null);
			else if (Za(t), sf(c)) {
				if (o = c.nextSibling && c.nextSibling.dataset, o) var u = o.dgst;
				o = u, r = Error(s(419)), r.stack = "", r.digest = o, Li({
					value: r,
					source: null,
					stack: null
				}), t = yc(e, t, n);
			} else if (Zs || Gi(e, t, n, !1), o = (n & e.childLanes) !== 0, Zs || o) {
				if (o = Il, o !== null && (r = Ke(o, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, Yr(e, r), mu(o, e, r), Xs;
				of(c) || Eu(), t = yc(e, t, n);
			} else of(c) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, Ei = lf(c.nextSibling), Ti = t, Di = !0, Oi = null, ki = !1, e !== null && wi(t, e), t = _c(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? (eo(t), c = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = ni(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (c = ai(c, i, n, null), c.flags |= 2) : c = ni(u, c), c.return = t, r.return = t, r.sibling = c, t.child = r, rc(null, r), r = t.child, c = e.child.memoizedState, c === null ? c = mc(n) : (i = c.cachePool, i === null ? i = pa() : (l = q._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), c = {
			baseLanes: c.baseLanes | n,
			cachePool: i
		}), r.memoizedState = c, r.childLanes = hc(e, o, n), t.memoizedState = pc, rc(e.child, r)) : (Za(t), n = e.child, e = n.sibling, n = ni(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function _c(e, t) {
		return t = vc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function vc(e, t) {
		return e = ei(22, e, null, t), e.lanes = 0, e;
	}
	function yc(e, t, n) {
		return Aa(t, e.child, null, n), e = _c(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function bc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Ui(e.return, t, n);
	}
	function xc(e, t, n, r, i, a) {
		var o = e.memoizedState;
		o === null ? e.memoizedState = {
			isBackwards: t,
			rendering: null,
			renderingStartTime: 0,
			last: r,
			tail: n,
			tailMode: i,
			treeForkCount: a
		} : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i, o.treeForkCount = a);
	}
	function Sc(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = no.current, s = (o & 2) != 0;
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, B(no, o), Qs(e, t, r, n), r = Di ? mi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && bc(e, n, t);
			else if (e.tag === 19) bc(e, n, t);
			else if (e.child !== null) {
				e.child.return = e, e = e.child;
				continue;
			}
			if (e === t) break a;
			for (; e.sibling === null;) {
				if (e.return === null || e.return === t) break a;
				e = e.return;
			}
			e.sibling.return = e.return, e = e.sibling;
		}
		switch (i) {
			case "forwards":
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && ro(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), xc(t, !1, i, n, a, r);
				break;
			case "backwards":
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && ro(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				xc(t, !0, n, null, a, r);
				break;
			case "together":
				xc(t, !1, null, null, void 0, r);
				break;
			default: t.memoizedState = null;
		}
		return t.child;
	}
	function Cc(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), Wl |= t.lanes, (n & t.childLanes) === 0) if (e !== null) {
			if (Gi(e, t, n, !1), (n & t.childLanes) === 0) return null;
		} else return null;
		if (e !== null && t.child !== e.child) throw Error(s(153));
		if (t.child !== null) {
			for (e = t.child, n = ni(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ni(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function wc(e, t) {
		return (e.lanes & t) === 0 ? (e = e.dependencies, !!(e !== null && Ki(e))) : !0;
	}
	function Tc(e, t, n) {
		switch (t.tag) {
			case 3:
				U(t, t.stateNode.containerInfo), Vi(t, q, e.memoizedState.cache), Fi();
				break;
			case 27:
			case 5:
				oe(t);
				break;
			case 4:
				U(t, t.stateNode.containerInfo);
				break;
			case 10:
				Vi(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, Qa(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (Za(t), e = Cc(e, t, n), e === null ? null : e.sibling) : gc(e, t, n) : (Za(t), t.flags |= 128, null);
				Za(t);
				break;
			case 19:
				var i = (e.flags & 128) != 0;
				if (r = (n & t.childLanes) !== 0, r ||= (Gi(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return Sc(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), B(no, no.current), r) break;
				return null;
			case 22: return t.lanes = 0, nc(e, t, n, t.pendingProps);
			case 24: Vi(t, q, e.memoizedState.cache);
		}
		return Cc(e, t, n);
	}
	function Ec(e, t, n) {
		if (e !== null) if (e.memoizedProps !== t.pendingProps) Zs = !0;
		else {
			if (!wc(e, n) && !(t.flags & 128)) return Zs = !1, Tc(e, t, n);
			Zs = !!(e.flags & 131072);
		}
		else Zs = !1, Di && t.flags & 1048576 && xi(t, mi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = ba(t.elementType), t.type = e, typeof e == "function") ti(e) ? (r = Bs(e, r), t.tag = 1, t = dc(null, t, e, r, n)) : (t.tag = 0, t = lc(null, t, e, r, n));
					else {
						if (e != null) {
							var i = e.$$typeof;
							if (i === w) {
								t.tag = 11, t = $s(null, t, e, r, n);
								break a;
							} else if (i === D) {
								t.tag = 14, t = ec(null, t, e, r, n);
								break a;
							}
						}
						throw t = ee(e) || e, Error(s(306, t, ""));
					}
				}
				return t;
			case 0: return lc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, i = Bs(r, t.pendingProps), dc(e, t, r, i, n);
			case 3:
				a: {
					if (U(t, t.stateNode.containerInfo), e === null) throw Error(s(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, Pa(e, t), Va(t, r, null, n);
					var o = t.memoizedState;
					if (r = o.cache, Vi(t, q, r), r !== a.cache && Wi(t, [q], n, !0), Ba(), r = o.element, a.isDehydrated) if (a = {
						element: r,
						isDehydrated: !1,
						cache: o.cache
					}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
						t = fc(e, t, r, n);
						break a;
					} else if (r !== i) {
						i = ui(Error(s(424)), t), Li(i), t = fc(e, t, r, n);
						break a;
					} else {
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (Ei = lf(e.firstChild), Ti = t, Di = !0, Oi = null, ki = !0, n = ja(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					}
					else {
						if (Fi(), r === i) {
							t = Cc(e, t, n);
							break a;
						}
						Qs(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return cc(e, t), e === null ? (n = Af(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : Di || (n = t.type, e = t.pendingProps, r = Vd(re.current).createElement(n), r[Qe] = t, r[$e] = e, Fd(r, n, e), dt(r), t.stateNode = r) : t.memoizedState = Af(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return oe(t), e === null && Di && (r = t.stateNode = pf(t.type, t.pendingProps, re.current), Ti = t, ki = !0, i = Ei, Qd(t.type) ? (uf = i, Ei = lf(r.firstChild)) : Ei = i), Qs(e, t, t.pendingProps.children, n), cc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && Di && ((i = r = Ei) && (r = nf(r, t.type, t.pendingProps, ki), r === null ? i = !1 : (t.stateNode = r, Ti = t, Ei = lf(r.firstChild), ki = !1, i = !0)), i || ji(t)), oe(t), i = t.type, a = t.pendingProps, o = e === null ? null : e.memoizedProps, r = a.children, Wd(i, a) ? r = null : o !== null && Wd(i, o) && (t.flags |= 32), t.memoizedState !== null && (i = _o(e, t, bo, null, null, n), $f._currentValue = i), cc(e, t), Qs(e, t, r, n), t.child;
			case 6: return e === null && Di && ((e = n = Ei) && (n = rf(n, t.pendingProps, ki), n === null ? e = !1 : (t.stateNode = n, Ti = t, Ei = null, e = !0)), e || ji(t)), null;
			case 13: return gc(e, t, n);
			case 4: return U(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Aa(t, null, r, n) : Qs(e, t, r, n), t.child;
			case 11: return $s(e, t, t.type, t.pendingProps, n);
			case 7: return Qs(e, t, t.pendingProps, n), t.child;
			case 8: return Qs(e, t, t.pendingProps.children, n), t.child;
			case 12: return Qs(e, t, t.pendingProps.children, n), t.child;
			case 10: return r = t.pendingProps, Vi(t, t.type, r.value), Qs(e, t, r.children, n), t.child;
			case 9: return i = t.type._context, r = t.pendingProps.children, qi(t), i = Ji(i), r = r(i), t.flags |= 1, Qs(e, t, r, n), t.child;
			case 14: return ec(e, t, t.type, t.pendingProps, n);
			case 15: return tc(e, t, t.type, t.pendingProps, n);
			case 19: return Sc(e, t, n);
			case 31: return sc(e, t, n);
			case 22: return nc(e, t, n, t.pendingProps);
			case 24: return qi(t), r = Ji(q), e === null ? (i = da(), i === null && (i = Il, a = ea(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, Na(t), Vi(t, q, i)) : ((e.lanes & n) !== 0 && (Pa(e, t), Va(t, null, null, n), Ba()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, Vi(t, q, r), r !== i.cache && Wi(t, [q], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), Vi(t, q, r))), Qs(e, t, t.pendingProps.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(s(156, t.tag));
	}
	function Dc(e) {
		e.flags |= 4;
	}
	function Oc(e, t, n, r, i) {
		if ((t = (e.mode & 32) != 0) && (t = !1), t) {
			if (e.flags |= 16777216, (i & 335544128) === i) if (e.stateNode.complete) e.flags |= 8192;
			else if (Cu()) e.flags |= 8192;
			else throw xa = _a, ha;
		} else e.flags &= -16777217;
	}
	function kc(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Gf(t)) if (Cu()) e.flags |= 8192;
		else throw xa = _a, ha;
	}
	function Ac(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : Be(), e.lanes |= t, Jl |= t);
	}
	function jc(e, t) {
		if (!Di) switch (e.tailMode) {
			case "hidden":
				t = e.tail;
				for (var n = null; t !== null;) t.alternate !== null && (n = t), t = t.sibling;
				n === null ? e.tail = null : n.sibling = null;
				break;
			case "collapsed":
				n = e.tail;
				for (var r = null; n !== null;) n.alternate !== null && (r = n), n = n.sibling;
				r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
		}
	}
	function Mc(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 65011712, r |= i.flags & 65011712, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function Nc(e, t, n) {
		var r = t.pendingProps;
		switch (Ci(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return Mc(t), null;
			case 1: return Mc(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Hi(q), ae(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Pi(t) ? Dc(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Ii())), Mc(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (Dc(t), a === null ? (Mc(t), Oc(t, i, null, r, n)) : (Mc(t), kc(t, a))) : a ? a === e.memoizedState ? (Mc(t), t.flags &= -16777217) : (Dc(t), Mc(t), kc(t, a)) : (e = e.memoizedProps, e !== r && Dc(t), Mc(t), Oc(t, i, e, r, n)), null;
			case 27:
				if (se(t), n = re.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Dc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Mc(t), null;
					}
					e = V.current, Pi(t) ? Mi(t, e) : (e = pf(i, r, n), t.stateNode = e, Dc(t));
				}
				return Mc(t), null;
			case 5:
				if (se(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Dc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Mc(t), null;
					}
					if (a = V.current, Pi(t)) Mi(t, a);
					else {
						var o = Vd(re.current);
						switch (a) {
							case 1:
								a = o.createElementNS("http://www.w3.org/2000/svg", i);
								break;
							case 2:
								a = o.createElementNS("http://www.w3.org/1998/Math/MathML", i);
								break;
							default: switch (i) {
								case "svg":
									a = o.createElementNS("http://www.w3.org/2000/svg", i);
									break;
								case "math":
									a = o.createElementNS("http://www.w3.org/1998/Math/MathML", i);
									break;
								case "script":
									a = o.createElement("div"), a.innerHTML = "<script><\/script>", a = a.removeChild(a.firstChild);
									break;
								case "select":
									a = typeof r.is == "string" ? o.createElement("select", { is: r.is }) : o.createElement("select"), r.multiple ? a.multiple = !0 : r.size && (a.size = r.size);
									break;
								default: a = typeof r.is == "string" ? o.createElement(i, { is: r.is }) : o.createElement(i);
							}
						}
						a[Qe] = t, a[$e] = r;
						a: for (o = t.child; o !== null;) {
							if (o.tag === 5 || o.tag === 6) a.appendChild(o.stateNode);
							else if (o.tag !== 4 && o.tag !== 27 && o.child !== null) {
								o.child.return = o, o = o.child;
								continue;
							}
							if (o === t) break a;
							for (; o.sibling === null;) {
								if (o.return === null || o.return === t) break a;
								o = o.return;
							}
							o.sibling.return = o.return, o = o.sibling;
						}
						t.stateNode = a;
						a: switch (Fd(a, i, r), i) {
							case "button":
							case "input":
							case "select":
							case "textarea":
								r = !!r.autoFocus;
								break a;
							case "img":
								r = !0;
								break a;
							default: r = !1;
						}
						r && Dc(t);
					}
				}
				return Mc(t), Oc(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && Dc(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(s(166));
					if (e = re.current, Pi(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = Ti, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[Qe] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || Md(e.nodeValue, n)), e || ji(t, !0);
					} else e = Vd(e).createTextNode(r), e[Qe] = t, t.stateNode = e;
				}
				return Mc(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Pi(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(s(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(557));
							e[Qe] = t;
						} else Fi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Mc(t), e = !1;
					} else n = Ii(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (to(t), t) : (to(t), null);
					if (t.flags & 128) throw Error(s(558));
				}
				return Mc(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = Pi(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(s(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(s(317));
							i[Qe] = t;
						} else Fi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Mc(t), i = !1;
					} else i = Ii(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (to(t), t) : (to(t), null);
				}
				return to(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Ac(t, t.updateQueue), Mc(t), null);
			case 4: return ae(), e === null && Sd(t.stateNode.containerInfo), Mc(t), null;
			case 10: return Hi(t.type), Mc(t), null;
			case 19:
				if (z(no), r = t.memoizedState, r === null) return Mc(t), null;
				if (i = (t.flags & 128) != 0, a = r.rendering, a === null) if (i) jc(r, !1);
				else {
					if (Ul !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
						if (a = ro(e), a !== null) {
							for (t.flags |= 128, jc(r, !1), e = a.updateQueue, t.updateQueue = e, Ac(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) ri(n, e), n = n.sibling;
							return B(no, no.current & 1 | 2), Di && bi(t, r.treeForkCount), t.child;
						}
						e = e.sibling;
					}
					r.tail !== null && ye() > eu && (t.flags |= 128, i = !0, jc(r, !1), t.lanes = 4194304);
				}
				else {
					if (!i) if (e = ro(a), e !== null) {
						if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Ac(t, e), jc(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !Di) return Mc(t), null;
					} else 2 * ye() - r.renderingStartTime > eu && n !== 536870912 && (t.flags |= 128, i = !0, jc(r, !1), t.lanes = 4194304);
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (Mc(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = ye(), e.sibling = null, n = no.current, B(no, i ? n & 1 | 2 : n & 1), Di && bi(t, r.treeForkCount), e);
			case 22:
			case 23: return to(t), Ja(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (Mc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Mc(t), n = t.updateQueue, n !== null && Ac(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && z(ua), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Hi(q), Mc(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(s(156, t.tag));
	}
	function Pc(e, t) {
		switch (Ci(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Hi(q), ae(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return se(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (to(t), t.alternate === null) throw Error(s(340));
					Fi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (to(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(s(340));
					Fi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return z(no), null;
			case 4: return ae(), null;
			case 10: return Hi(t.type), null;
			case 22:
			case 23: return to(t), Ja(), e !== null && z(ua), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Hi(q), null;
			case 25: return null;
			default: return null;
		}
	}
	function Fc(e, t) {
		switch (Ci(t), t.tag) {
			case 3:
				Hi(q), ae();
				break;
			case 26:
			case 27:
			case 5:
				se(t);
				break;
			case 4:
				ae();
				break;
			case 31:
				t.memoizedState !== null && to(t);
				break;
			case 13:
				to(t);
				break;
			case 19:
				z(no);
				break;
			case 10:
				Hi(t.type);
				break;
			case 22:
			case 23:
				to(t), Ja(), e !== null && z(ua);
				break;
			case 24: Hi(q);
		}
	}
	function Ic(e, t) {
		try {
			var n = t.updateQueue, r = n === null ? null : n.lastEffect;
			if (r !== null) {
				var i = r.next;
				n = i;
				do {
					if ((n.tag & e) === e) {
						r = void 0;
						var a = n.create, o = n.inst;
						r = a(), o.destroy = r;
					}
					n = n.next;
				} while (n !== i);
			}
		} catch (e) {
			Wu(t, t.return, e);
		}
	}
	function Lc(e, t, n) {
		try {
			var r = t.updateQueue, i = r === null ? null : r.lastEffect;
			if (i !== null) {
				var a = i.next;
				r = a;
				do {
					if ((r.tag & e) === e) {
						var o = r.inst, s = o.destroy;
						if (s !== void 0) {
							o.destroy = void 0, i = t;
							var c = n, l = s;
							try {
								l();
							} catch (e) {
								Wu(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			Wu(t, t.return, e);
		}
	}
	function Rc(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Ua(t, n);
			} catch (t) {
				Wu(e, e.return, t);
			}
		}
	}
	function zc(e, t, n) {
		n.props = Bs(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Wu(e, t, n);
		}
	}
	function Bc(e, t) {
		try {
			var n = e.ref;
			if (n !== null) {
				switch (e.tag) {
					case 26:
					case 27:
					case 5:
						var r = e.stateNode;
						break;
					case 30:
						r = e.stateNode;
						break;
					default: r = e.stateNode;
				}
				typeof n == "function" ? e.refCleanup = n(r) : n.current = r;
			}
		} catch (n) {
			Wu(e, t, n);
		}
	}
	function Vc(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) if (typeof r == "function") try {
			r();
		} catch (n) {
			Wu(e, t, n);
		} finally {
			e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
		}
		else if (typeof n == "function") try {
			n(null);
		} catch (n) {
			Wu(e, t, n);
		}
		else n.current = null;
	}
	function Hc(e) {
		var t = e.type, n = e.memoizedProps, r = e.stateNode;
		try {
			a: switch (t) {
				case "button":
				case "input":
				case "select":
				case "textarea":
					n.autoFocus && r.focus();
					break a;
				case "img": n.src ? r.src = n.src : n.srcSet && (r.srcset = n.srcSet);
			}
		} catch (t) {
			Wu(e, e.return, t);
		}
	}
	function Uc(e, t, n) {
		try {
			var r = e.stateNode;
			Id(r, e.type, n, t), r[$e] = t;
		} catch (t) {
			Wu(e, e.return, t);
		}
	}
	function Wc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Qd(e.type) || e.tag === 4;
	}
	function Gc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Wc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Qd(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Kc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Gt));
		else if (r !== 4 && (r === 27 && Qd(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null)) for (Kc(e, t, n), e = e.sibling; e !== null;) Kc(e, t, n), e = e.sibling;
	}
	function qc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (r === 27 && Qd(e.type) && (n = e.stateNode), e = e.child, e !== null)) for (qc(e, t, n), e = e.sibling; e !== null;) qc(e, t, n), e = e.sibling;
	}
	function Jc(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			Fd(t, r, n), t[Qe] = e, t[$e] = n;
		} catch (t) {
			Wu(e, e.return, t);
		}
	}
	var Yc = !1, Xc = !1, Zc = !1, Qc = typeof WeakSet == "function" ? WeakSet : Set, $c = null;
	function el(e, t) {
		if (e = e.containerInfo, zd = cp, e = yr(e), br(e)) {
			if ("selectionStart" in e) var n = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				n = (n = e.ownerDocument) && n.defaultView || window;
				var r = n.getSelection && n.getSelection();
				if (r && r.rangeCount !== 0) {
					n = r.anchorNode;
					var i = r.anchorOffset, a = r.focusNode;
					r = r.focusOffset;
					try {
						n.nodeType, a.nodeType;
					} catch {
						n = null;
						break a;
					}
					var o = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== n || i !== 0 && f.nodeType !== 3 || (c = o + i), f !== a || r !== 0 && f.nodeType !== 3 || (l = o + r), f.nodeType === 3 && (o += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === n && ++u === i && (c = o), p === a && ++d === r && (l = o), (m = f.nextSibling) !== null) break;
							f = p, p = f.parentNode;
						}
						f = m;
					}
					n = c === -1 || l === -1 ? null : {
						start: c,
						end: l
					};
				} else n = null;
			}
			n ||= {
				start: 0,
				end: 0
			};
		} else n = null;
		for (Bd = {
			focusedElem: e,
			selectionRange: n
		}, cp = !1, $c = t; $c !== null;) if (t = $c, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, $c = e;
		else for (; $c !== null;) {
			switch (t = $c, a = t.alternate, e = t.flags, t.tag) {
				case 0:
					if (e & 4 && (e = t.updateQueue, e = e === null ? null : e.events, e !== null)) for (n = 0; n < e.length; n++) i = e[n], i.ref.impl = i.nextImpl;
					break;
				case 11:
				case 15: break;
				case 1:
					if (e & 1024 && a !== null) {
						e = void 0, n = t, i = a.memoizedProps, a = a.memoizedState, r = n.stateNode;
						try {
							var h = Bs(n.type, i);
							e = r.getSnapshotBeforeUpdate(h, a), r.__reactInternalSnapshotBeforeUpdate = e;
						} catch (e) {
							Wu(n, n.return, e);
						}
					}
					break;
				case 3:
					if (e & 1024) {
						if (e = t.stateNode.containerInfo, n = e.nodeType, n === 9) tf(e);
						else if (n === 1) switch (e.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								tf(e);
								break;
							default: e.textContent = "";
						}
					}
					break;
				case 5:
				case 26:
				case 27:
				case 6:
				case 4:
				case 17: break;
				default: if (e & 1024) throw Error(s(163));
			}
			if (e = t.sibling, e !== null) {
				e.return = t.return, $c = e;
				break;
			}
			$c = t.return;
		}
	}
	function tl(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				gl(e, n), r & 4 && Ic(5, n);
				break;
			case 1:
				if (gl(e, n), r & 4) if (e = n.stateNode, t === null) try {
					e.componentDidMount();
				} catch (e) {
					Wu(n, n.return, e);
				}
				else {
					var i = Bs(n.type, t.memoizedProps);
					t = t.memoizedState;
					try {
						e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
					} catch (e) {
						Wu(n, n.return, e);
					}
				}
				r & 64 && Rc(n), r & 512 && Bc(n, n.return);
				break;
			case 3:
				if (gl(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						Ua(e, t);
					} catch (e) {
						Wu(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Jc(n);
			case 26:
			case 5:
				gl(e, n), t === null && r & 4 && Hc(n), r & 512 && Bc(n, n.return);
				break;
			case 12:
				gl(e, n);
				break;
			case 31:
				gl(e, n), r & 4 && sl(e, n);
				break;
			case 13:
				gl(e, n), r & 4 && cl(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = Ju.bind(null, n), cf(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || Yc, !r) {
					t = t !== null && t.memoizedState !== null || Xc, i = Yc;
					var a = Xc;
					Yc = r, (Xc = t) && !a ? vl(e, n, (n.subtreeFlags & 8772) != 0) : gl(e, n), Yc = i, Xc = a;
				}
				break;
			case 30: break;
			default: gl(e, n);
		}
	}
	function nl(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, nl(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && ot(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var rl = null, il = !1;
	function al(e, t, n) {
		for (n = n.child; n !== null;) ol(e, t, n), n = n.sibling;
	}
	function ol(e, t, n) {
		if (G && typeof G.onCommitFiberUnmount == "function") try {
			G.onCommitFiberUnmount(Oe, n);
		} catch {}
		switch (n.tag) {
			case 26:
				Xc || Vc(n, t), al(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				Xc || Vc(n, t);
				var r = rl, i = il;
				Qd(n.type) && (rl = n.stateNode, il = !1), al(e, t, n), mf(n.stateNode), rl = r, il = i;
				break;
			case 5: Xc || Vc(n, t);
			case 6:
				if (r = rl, i = il, rl = null, al(e, t, n), rl = r, il = i, rl !== null) if (il) try {
					(rl.nodeType === 9 ? rl.body : rl.nodeName === "HTML" ? rl.ownerDocument.body : rl).removeChild(n.stateNode);
				} catch (e) {
					Wu(n, t, e);
				}
				else try {
					rl.removeChild(n.stateNode);
				} catch (e) {
					Wu(n, t, e);
				}
				break;
			case 18:
				rl !== null && (il ? (e = rl, $d(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Pp(e)) : $d(rl, n.stateNode));
				break;
			case 4:
				r = rl, i = il, rl = n.stateNode.containerInfo, il = !0, al(e, t, n), rl = r, il = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Lc(2, n, t), Xc || Lc(4, n, t), al(e, t, n);
				break;
			case 1:
				Xc || (Vc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && zc(n, t, r)), al(e, t, n);
				break;
			case 21:
				al(e, t, n);
				break;
			case 22:
				Xc = (r = Xc) || n.memoizedState !== null, al(e, t, n), Xc = r;
				break;
			default: al(e, t, n);
		}
	}
	function sl(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Pp(e);
			} catch (e) {
				Wu(t, t.return, e);
			}
		}
	}
	function cl(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Pp(e);
		} catch (e) {
			Wu(t, t.return, e);
		}
	}
	function ll(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new Qc()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new Qc()), t;
			default: throw Error(s(435, e.tag));
		}
	}
	function ul(e, t) {
		var n = ll(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = Yu.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function dl(e, t) {
		var n = t.deletions;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r], a = e, o = t, c = o;
			a: for (; c !== null;) {
				switch (c.tag) {
					case 27:
						if (Qd(c.type)) {
							rl = c.stateNode, il = !1;
							break a;
						}
						break;
					case 5:
						rl = c.stateNode, il = !1;
						break a;
					case 3:
					case 4:
						rl = c.stateNode.containerInfo, il = !0;
						break a;
				}
				c = c.return;
			}
			if (rl === null) throw Error(s(160));
			ol(a, o, i), rl = null, il = !1, a = i.alternate, a !== null && (a.return = null), i.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) pl(t, e), t = t.sibling;
	}
	var fl = null;
	function pl(e, t) {
		var n = e.alternate, r = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				dl(t, e), ml(e), r & 4 && (Lc(3, e, e.return), Ic(3, e), Lc(5, e, e.return));
				break;
			case 1:
				dl(t, e), ml(e), r & 512 && (Xc || n === null || Vc(n, n.return)), r & 64 && Yc && (e = e.updateQueue, e !== null && (r = e.callbacks, r !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? r : n.concat(r))));
				break;
			case 26:
				var i = fl;
				if (dl(t, e), ml(e), r & 512 && (Xc || n === null || Vc(n, n.return)), r & 4) {
					var a = n === null ? null : n.memoizedState;
					if (r = e.memoizedState, n === null) if (r === null) if (e.stateNode === null) {
						a: {
							r = e.type, n = e.memoizedProps, i = i.ownerDocument || i;
							b: switch (r) {
								case "title":
									a = i.getElementsByTagName("title")[0], (!a || a[at] || a[Qe] || a.namespaceURI === "http://www.w3.org/2000/svg" || a.hasAttribute("itemprop")) && (a = i.createElement(r), i.head.insertBefore(a, i.querySelector("head > title"))), Fd(a, r, n), a[Qe] = e, dt(a), r = a;
									break a;
								case "link":
									var o = Hf("link", "href", i).get(r + (n.href || ""));
									if (o) {
										for (var c = 0; c < o.length; c++) if (a = o[c], a.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && a.getAttribute("rel") === (n.rel == null ? null : n.rel) && a.getAttribute("title") === (n.title == null ? null : n.title) && a.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
											o.splice(c, 1);
											break b;
										}
									}
									a = i.createElement(r), Fd(a, r, n), i.head.appendChild(a);
									break;
								case "meta":
									if (o = Hf("meta", "content", i).get(r + (n.content || ""))) {
										for (c = 0; c < o.length; c++) if (a = o[c], a.getAttribute("content") === (n.content == null ? null : "" + n.content) && a.getAttribute("name") === (n.name == null ? null : n.name) && a.getAttribute("property") === (n.property == null ? null : n.property) && a.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && a.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
											o.splice(c, 1);
											break b;
										}
									}
									a = i.createElement(r), Fd(a, r, n), i.head.appendChild(a);
									break;
								default: throw Error(s(468, r));
							}
							a[Qe] = e, dt(a), r = a;
						}
						e.stateNode = r;
					} else Uf(i, e.type, e.stateNode);
					else e.stateNode = Lf(i, r, e.memoizedProps);
					else a === r ? r === null && e.stateNode !== null && Uc(e, e.memoizedProps, n.memoizedProps) : (a === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : a.count--, r === null ? Uf(i, e.type, e.stateNode) : Lf(i, r, e.memoizedProps));
				}
				break;
			case 27:
				dl(t, e), ml(e), r & 512 && (Xc || n === null || Vc(n, n.return)), n !== null && r & 4 && Uc(e, e.memoizedProps, n.memoizedProps);
				break;
			case 5:
				if (dl(t, e), ml(e), r & 512 && (Xc || n === null || Vc(n, n.return)), e.flags & 32) {
					i = e.stateNode;
					try {
						Lt(i, "");
					} catch (t) {
						Wu(e, e.return, t);
					}
				}
				r & 4 && e.stateNode != null && (i = e.memoizedProps, Uc(e, i, n === null ? i : n.memoizedProps)), r & 1024 && (Zc = !0);
				break;
			case 6:
				if (dl(t, e), ml(e), r & 4) {
					if (e.stateNode === null) throw Error(s(162));
					r = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = r;
					} catch (t) {
						Wu(e, e.return, t);
					}
				}
				break;
			case 3:
				if (Vf = null, i = fl, fl = _f(t.containerInfo), dl(t, e), fl = i, ml(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					Pp(t.containerInfo);
				} catch (t) {
					Wu(e, e.return, t);
				}
				Zc && (Zc = !1, hl(e));
				break;
			case 4:
				r = fl, fl = _f(e.stateNode.containerInfo), dl(t, e), ml(e), fl = r;
				break;
			case 12:
				dl(t, e), ml(e);
				break;
			case 31:
				dl(t, e), ml(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ul(e, r)));
				break;
			case 13:
				dl(t, e), ml(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Ql = ye()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ul(e, r)));
				break;
			case 22:
				i = e.memoizedState !== null;
				var l = n !== null && n.memoizedState !== null, u = Yc, d = Xc;
				if (Yc = u || i, Xc = d || l, dl(t, e), Xc = d, Yc = u, ml(e), r & 8192) a: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || l || Yc || Xc || _l(e)), n = null, t = e;;) {
					if (t.tag === 5 || t.tag === 26) {
						if (n === null) {
							l = n = t;
							try {
								if (a = l.stateNode, i) o = a.style, typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none";
								else {
									c = l.stateNode;
									var f = l.memoizedProps.style, p = f != null && f.hasOwnProperty("display") ? f.display : null;
									c.style.display = p == null || typeof p == "boolean" ? "" : ("" + p).trim();
								}
							} catch (e) {
								Wu(l, l.return, e);
							}
						}
					} else if (t.tag === 6) {
						if (n === null) {
							l = t;
							try {
								l.stateNode.nodeValue = i ? "" : l.memoizedProps;
							} catch (e) {
								Wu(l, l.return, e);
							}
						}
					} else if (t.tag === 18) {
						if (n === null) {
							l = t;
							try {
								var m = l.stateNode;
								i ? ef(m, !0) : ef(l.stateNode, !1);
							} catch (e) {
								Wu(l, l.return, e);
							}
						}
					} else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
						t.child.return = t, t = t.child;
						continue;
					}
					if (t === e) break a;
					for (; t.sibling === null;) {
						if (t.return === null || t.return === e) break a;
						n === t && (n = null), t = t.return;
					}
					n === t && (n = null), t.sibling.return = t.return, t = t.sibling;
				}
				r & 4 && (r = e.updateQueue, r !== null && (n = r.retryQueue, n !== null && (r.retryQueue = null, ul(e, n))));
				break;
			case 19:
				dl(t, e), ml(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ul(e, r)));
				break;
			case 30: break;
			case 21: break;
			default: dl(t, e), ml(e);
		}
	}
	function ml(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Wc(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				if (n == null) throw Error(s(160));
				switch (n.tag) {
					case 27:
						var i = n.stateNode;
						qc(e, Gc(e), i);
						break;
					case 5:
						var a = n.stateNode;
						n.flags & 32 && (Lt(a, ""), n.flags &= -33), qc(e, Gc(e), a);
						break;
					case 3:
					case 4:
						var o = n.stateNode.containerInfo;
						Kc(e, Gc(e), o);
						break;
					default: throw Error(s(161));
				}
			} catch (t) {
				Wu(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function hl(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			hl(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
		}
	}
	function gl(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) tl(e, t.alternate, t), t = t.sibling;
	}
	function _l(e) {
		for (e = e.child; e !== null;) {
			var t = e;
			switch (t.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Lc(4, t, t.return), _l(t);
					break;
				case 1:
					Vc(t, t.return);
					var n = t.stateNode;
					typeof n.componentWillUnmount == "function" && zc(t, t.return, n), _l(t);
					break;
				case 27: mf(t.stateNode);
				case 26:
				case 5:
					Vc(t, t.return), _l(t);
					break;
				case 22:
					t.memoizedState === null && _l(t);
					break;
				case 30:
					_l(t);
					break;
				default: _l(t);
			}
			e = e.sibling;
		}
	}
	function vl(e, t, n) {
		for (n &&= (t.subtreeFlags & 8772) != 0, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags;
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					vl(i, a, n), Ic(4, a);
					break;
				case 1:
					if (vl(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Wu(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var s = r.stateNode;
						try {
							var c = i.shared.hiddenCallbacks;
							if (c !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < c.length; i++) Ha(c[i], s);
						} catch (e) {
							Wu(r, r.return, e);
						}
					}
					n && o & 64 && Rc(a), Bc(a, a.return);
					break;
				case 27: Jc(a);
				case 26:
				case 5:
					vl(i, a, n), n && r === null && o & 4 && Hc(a), Bc(a, a.return);
					break;
				case 12:
					vl(i, a, n);
					break;
				case 31:
					vl(i, a, n), n && o & 4 && sl(i, a);
					break;
				case 13:
					vl(i, a, n), n && o & 4 && cl(i, a);
					break;
				case 22:
					a.memoizedState === null && vl(i, a, n), Bc(a, a.return);
					break;
				case 30: break;
				default: vl(i, a, n);
			}
			t = t.sibling;
		}
	}
	function yl(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && ta(n));
	}
	function bl(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ta(e));
	}
	function xl(e, t, n, r) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) Sl(e, t, n, r), t = t.sibling;
	}
	function Sl(e, t, n, r) {
		var i = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				xl(e, t, n, r), i & 2048 && Ic(9, t);
				break;
			case 1:
				xl(e, t, n, r);
				break;
			case 3:
				xl(e, t, n, r), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ta(e)));
				break;
			case 12:
				if (i & 2048) {
					xl(e, t, n, r), e = t.stateNode;
					try {
						var a = t.memoizedProps, o = a.id, s = a.onPostCommit;
						typeof s == "function" && s(o, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0);
					} catch (e) {
						Wu(t, t.return, e);
					}
				} else xl(e, t, n, r);
				break;
			case 31:
				xl(e, t, n, r);
				break;
			case 13:
				xl(e, t, n, r);
				break;
			case 23: break;
			case 22:
				a = t.stateNode, o = t.alternate, t.memoizedState === null ? a._visibility & 2 ? xl(e, t, n, r) : (a._visibility |= 2, Cl(e, t, n, r, (t.subtreeFlags & 10256) != 0 || !1)) : a._visibility & 2 ? xl(e, t, n, r) : wl(e, t), i & 2048 && yl(o, t);
				break;
			case 24:
				xl(e, t, n, r), i & 2048 && bl(t.alternate, t);
				break;
			default: xl(e, t, n, r);
		}
	}
	function Cl(e, t, n, r, i) {
		for (i &&= (t.subtreeFlags & 10256) != 0 || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Cl(a, o, s, c, i), Ic(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Cl(a, o, s, c, i)) : u._visibility & 2 ? Cl(a, o, s, c, i) : wl(a, o), i && l & 2048 && yl(o.alternate, o);
					break;
				case 24:
					Cl(a, o, s, c, i), i && l & 2048 && bl(o.alternate, o);
					break;
				default: Cl(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function wl(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					wl(n, r), i & 2048 && yl(r.alternate, r);
					break;
				case 24:
					wl(n, r), i & 2048 && bl(r.alternate, r);
					break;
				default: wl(n, r);
			}
			t = t.sibling;
		}
	}
	var Tl = 8192;
	function El(e, t, n) {
		if (e.subtreeFlags & Tl) for (e = e.child; e !== null;) Dl(e, t, n), e = e.sibling;
	}
	function Dl(e, t, n) {
		switch (e.tag) {
			case 26:
				El(e, t, n), e.flags & Tl && e.memoizedState !== null && Kf(n, fl, e.memoizedState, e.memoizedProps);
				break;
			case 5:
				El(e, t, n);
				break;
			case 3:
			case 4:
				var r = fl;
				fl = _f(e.stateNode.containerInfo), El(e, t, n), fl = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Tl, Tl = 16777216, El(e, t, n), Tl = r) : El(e, t, n));
				break;
			default: El(e, t, n);
		}
	}
	function Ol(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function kl(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				$c = r, Ml(r, e);
			}
			Ol(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Al(e), e = e.sibling;
	}
	function Al(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				kl(e), e.flags & 2048 && Lc(9, e, e.return);
				break;
			case 3:
				kl(e);
				break;
			case 12:
				kl(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, jl(e)) : kl(e);
				break;
			default: kl(e);
		}
	}
	function jl(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				$c = r, Ml(r, e);
			}
			Ol(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Lc(8, t, t.return), jl(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, jl(t));
					break;
				default: jl(t);
			}
			e = e.sibling;
		}
	}
	function Ml(e, t) {
		for (; $c !== null;) {
			var n = $c;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					Lc(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: ta(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, $c = r;
			else a: for (n = e; $c !== null;) {
				r = $c;
				var i = r.sibling, a = r.return;
				if (nl(r), r === n) {
					$c = null;
					break a;
				}
				if (i !== null) {
					i.return = a, $c = i;
					break a;
				}
				$c = a;
			}
		}
	}
	var Nl = {
		getCacheForType: function(e) {
			var t = Ji(q), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Ji(q).controller.signal;
		}
	}, Pl = typeof WeakMap == "function" ? WeakMap : Map, Fl = 0, Il = null, X = null, Z = 0, Ll = 0, Rl = null, zl = !1, Bl = !1, Vl = !1, Hl = 0, Ul = 0, Wl = 0, Gl = 0, Kl = 0, ql = 0, Jl = 0, Yl = null, Xl = null, Zl = !1, Ql = 0, $l = 0, eu = Infinity, tu = null, nu = null, ru = 0, iu = null, au = null, ou = 0, su = 0, cu = null, lu = null, uu = 0, du = null;
	function fu() {
		return Fl & 2 && Z !== 0 ? Z & -Z : P.T === null ? Ye() : dd();
	}
	function pu() {
		if (ql === 0) if (!(Z & 536870912) || Di) {
			var e = Fe;
			Fe <<= 1, !(Fe & 3932160) && (Fe = 262144), ql = e;
		} else ql = 536870912;
		return e = Ya.current, e !== null && (e.flags |= 32), ql;
	}
	function mu(e, t, n) {
		(e === Il && (Ll === 2 || Ll === 9) || e.cancelPendingCommit !== null) && (xu(e, 0), vu(e, Z, ql, !1)), He(e, n), (!(Fl & 2) || e !== Il) && (e === Il && (!(Fl & 2) && (Gl |= n), Ul === 4 && vu(e, Z, ql, !1)), rd(e));
	}
	function hu(e, t, n) {
		if (Fl & 6) throw Error(s(327));
		var r = !n && (t & 127) == 0 && (t & e.expiredLanes) === 0 || Re(e, t), i = r ? ku(e, t) : Du(e, t, !0), a = r;
		do {
			if (i === 0) {
				Bl && !r && vu(e, t, 0, !1);
				break;
			} else {
				if (n = e.current.alternate, a && !_u(n)) {
					i = Du(e, t, !1), a = !1;
					continue;
				}
				if (i === 2) {
					if (a = t, e.errorRecoveryDisabledLanes & a) var o = 0;
					else o = e.pendingLanes & -536870913, o = o === 0 ? o & 536870912 ? 536870912 : 0 : o;
					if (o !== 0) {
						t = o;
						a: {
							var c = e;
							i = Yl;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (xu(c, o).flags |= 256), o = Du(c, o, !1), o !== 2) {
								if (Vl && !l) {
									c.errorRecoveryDisabledLanes |= a, Gl |= a, i = 4;
									break a;
								}
								a = Xl, Xl = i, a !== null && (Xl === null ? Xl = a : Xl.push.apply(Xl, a));
							}
							i = o;
						}
						if (a = !1, i !== 2) continue;
					}
				}
				if (i === 1) {
					xu(e, 0), vu(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, a = i, a) {
						case 0:
						case 1: throw Error(s(345));
						case 4: if ((t & 4194048) !== t) break;
						case 6:
							vu(r, t, ql, !zl);
							break a;
						case 2:
							Xl = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(s(329));
					}
					if ((t & 62914560) === t && (i = Ql + 300 - ye(), 10 < i)) {
						if (vu(r, t, ql, !zl), Le(r, 0, !0) !== 0) break a;
						ou = t, r.timeoutHandle = qd(gu.bind(null, r, n, Xl, tu, Zl, t, ql, Gl, Jl, zl, a, "Throttled", -0, 0), i);
						break a;
					}
					gu(r, n, Xl, tu, Zl, t, ql, Gl, Jl, zl, a, null, -0, 0);
				}
			}
			break;
		} while (1);
		rd(e);
	}
	function gu(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		if (e.timeoutHandle = -1, d = t.subtreeFlags, d & 8192 || (d & 16785408) == 16785408) {
			d = {
				stylesheets: null,
				count: 0,
				imgCount: 0,
				imgBytes: 0,
				suspenseyImages: [],
				waitingForImages: !0,
				waitingForViewTransition: !1,
				unsuspend: Gt
			}, Dl(t, a, d);
			var m = (a & 62914560) === a ? Ql - ye() : (a & 4194048) === a ? $l - ye() : 0;
			if (m = Jf(d, m), m !== null) {
				ou = a, e.cancelPendingCommit = m(Iu.bind(null, e, t, a, n, r, i, o, s, c, u, d, null, f, p)), vu(e, a, o, !l);
				return;
			}
		}
		Iu(e, t, a, n, r, i, o, s, c);
	}
	function _u(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!mr(a(), i)) return !1;
				} catch {
					return !1;
				}
			}
			if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
			else {
				if (t === e) break;
				for (; t.sibling === null;) {
					if (t.return === null || t.return === e) return !0;
					t = t.return;
				}
				t.sibling.return = t.return, t = t.sibling;
			}
		}
		return !0;
	}
	function vu(e, t, n, r) {
		t &= ~Kl, t &= ~Gl, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - Ae(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && We(e, n, t);
	}
	function yu() {
		return Fl & 6 ? !0 : (id(0, !1), !1);
	}
	function bu() {
		if (X !== null) {
			if (Ll === 0) var e = X.return;
			else e = X, Bi = zi = null, Co(e), wa = null, Ta = 0, e = X;
			for (; e !== null;) Fc(e.alternate, e), e = e.return;
			X = null;
		}
	}
	function xu(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, Jd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), ou = 0, bu(), Il = e, X = n = ni(e.current, null), Z = t, Ll = 0, Rl = null, zl = !1, Bl = Re(e, t), Vl = !1, Jl = ql = Kl = Gl = Wl = Ul = 0, Xl = Yl = null, Zl = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - Ae(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Hl = t, Kr(), n;
	}
	function Su(e, t) {
		J = null, P.H = Ns, t === ma || t === ga ? (t = Sa(), Ll = 3) : t === ha ? (t = Sa(), Ll = 4) : Ll = t === Xs ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Rl = t, X === null && (Ul = 1, Ws(e, ui(t, e.current)));
	}
	function Cu() {
		var e = Ya.current;
		return e === null ? !0 : (Z & 4194048) === Z ? Xa === null : (Z & 62914560) === Z || Z & 536870912 ? e === Xa : !1;
	}
	function wu() {
		var e = P.H;
		return P.H = Ns, e === null ? Ns : e;
	}
	function Tu() {
		var e = P.A;
		return P.A = Nl, e;
	}
	function Eu() {
		Ul = 4, zl || (Z & 4194048) !== Z && Ya.current !== null || (Bl = !0), !(Wl & 134217727) && !(Gl & 134217727) || Il === null || vu(Il, Z, ql, !1);
	}
	function Du(e, t, n) {
		var r = Fl;
		Fl |= 2;
		var i = wu(), a = Tu();
		(Il !== e || Z !== t) && (tu = null, xu(e, t)), t = !1;
		var o = Ul;
		a: do
			try {
				if (Ll !== 0 && X !== null) {
					var s = X, c = Rl;
					switch (Ll) {
						case 8:
							bu(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							Ya.current === null && (t = !0);
							var l = Ll;
							if (Ll = 0, Rl = null, Nu(e, s, c, l), n && Bl) {
								o = 0;
								break a;
							}
							break;
						default: l = Ll, Ll = 0, Rl = null, Nu(e, s, c, l);
					}
				}
				Ou(), o = Ul;
				break;
			} catch (t) {
				Su(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, Bi = zi = null, Fl = r, P.H = i, P.A = a, X === null && (Il = null, Z = 0, Kr()), o;
	}
	function Ou() {
		for (; X !== null;) ju(X);
	}
	function ku(e, t) {
		var n = Fl;
		Fl |= 2;
		var r = wu(), i = Tu();
		Il !== e || Z !== t ? (tu = null, eu = ye() + 500, xu(e, t)) : Bl = Re(e, t);
		a: do
			try {
				if (Ll !== 0 && X !== null) {
					t = X;
					var a = Rl;
					b: switch (Ll) {
						case 1:
							Ll = 0, Rl = null, Nu(e, t, a, 1);
							break;
						case 2:
						case 9:
							if (va(a)) {
								Ll = 0, Rl = null, Mu(t);
								break;
							}
							t = function() {
								Ll !== 2 && Ll !== 9 || Il !== e || (Ll = 7), rd(e);
							}, a.then(t, t);
							break a;
						case 3:
							Ll = 7;
							break a;
						case 4:
							Ll = 5;
							break a;
						case 7:
							va(a) ? (Ll = 0, Rl = null, Mu(t)) : (Ll = 0, Rl = null, Nu(e, t, a, 7));
							break;
						case 5:
							var o = null;
							switch (X.tag) {
								case 26: o = X.memoizedState;
								case 5:
								case 27:
									var c = X;
									if (o ? Gf(o) : c.stateNode.complete) {
										Ll = 0, Rl = null;
										var l = c.sibling;
										if (l !== null) X = l;
										else {
											var u = c.return;
											u === null ? X = null : (X = u, Pu(u));
										}
										break b;
									}
							}
							Ll = 0, Rl = null, Nu(e, t, a, 5);
							break;
						case 6:
							Ll = 0, Rl = null, Nu(e, t, a, 6);
							break;
						case 8:
							bu(), Ul = 6;
							break a;
						default: throw Error(s(462));
					}
				}
				Au();
				break;
			} catch (t) {
				Su(e, t);
			}
		while (1);
		return Bi = zi = null, P.H = r, P.A = i, Fl = n, X === null ? (Il = null, Z = 0, Kr(), Ul) : 0;
	}
	function Au() {
		for (; X !== null && !_e();) ju(X);
	}
	function ju(e) {
		var t = Ec(e.alternate, e, Hl);
		e.memoizedProps = e.pendingProps, t === null ? Pu(e) : X = t;
	}
	function Mu(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = uc(n, t, t.pendingProps, t.type, void 0, Z);
				break;
			case 11:
				t = uc(n, t, t.pendingProps, t.type.render, t.ref, Z);
				break;
			case 5: Co(t);
			default: Fc(n, t), t = X = ri(t, Hl), t = Ec(n, t, Hl);
		}
		e.memoizedProps = e.pendingProps, t === null ? Pu(e) : X = t;
	}
	function Nu(e, t, n, r) {
		Bi = zi = null, Co(t), wa = null, Ta = 0;
		var i = t.return;
		try {
			if (Ys(e, i, t, n, Z)) {
				Ul = 1, Ws(e, ui(n, e.current)), X = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw X = i, t;
			Ul = 1, Ws(e, ui(n, e.current)), X = null;
			return;
		}
		t.flags & 32768 ? (Di || r === 1 ? e = !0 : Bl || Z & 536870912 ? e = !1 : (zl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Ya.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Fu(t, e)) : Pu(t);
	}
	function Pu(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				Fu(t, zl);
				return;
			}
			e = t.return;
			var n = Nc(t.alternate, t, Hl);
			if (n !== null) {
				X = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				X = t;
				return;
			}
			X = t = e;
		} while (t !== null);
		Ul === 0 && (Ul = 5);
	}
	function Fu(e, t) {
		do {
			var n = Pc(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, X = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				X = e;
				return;
			}
			X = e = n;
		} while (e !== null);
		Ul = 6, X = null;
	}
	function Iu(e, t, n, r, i, a, o, c, l) {
		e.cancelPendingCommit = null;
		do
			Vu();
		while (ru !== 0);
		if (Fl & 6) throw Error(s(327));
		if (t !== null) {
			if (t === e.current) throw Error(s(177));
			if (a = t.lanes | t.childLanes, a |= Gr, Ue(e, n, a, o, c, l), e === Il && (X = Il = null, Z = 0), au = t, iu = e, ou = n, su = a, cu = i, lu = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Xu(Ce, function() {
				return Hu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = (t.flags & 13878) != 0, t.subtreeFlags & 13878 || r) {
				r = P.T, P.T = null, i = F.p, F.p = 2, o = Fl, Fl |= 4;
				try {
					el(e, t, n);
				} finally {
					Fl = o, F.p = i, P.T = r;
				}
			}
			ru = 1, Lu(), Ru(), zu();
		}
	}
	function Lu() {
		if (ru === 1) {
			ru = 0;
			var e = iu, t = au, n = (t.flags & 13878) != 0;
			if (t.subtreeFlags & 13878 || n) {
				n = P.T, P.T = null;
				var r = F.p;
				F.p = 2;
				var i = Fl;
				Fl |= 4;
				try {
					pl(t, e);
					var a = Bd, o = yr(e.containerInfo), s = a.focusedElem, c = a.selectionRange;
					if (o !== s && s && s.ownerDocument && vr(s.ownerDocument.documentElement, s)) {
						if (c !== null && br(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = _r(s, h), v = _r(s, g);
									if (_ && v && (p.rangeCount !== 1 || p.anchorNode !== _.node || p.anchorOffset !== _.offset || p.focusNode !== v.node || p.focusOffset !== v.offset)) {
										var y = d.createRange();
										y.setStart(_.node, _.offset), p.removeAllRanges(), h > g ? (p.addRange(y), p.extend(v.node, v.offset)) : (y.setEnd(v.node, v.offset), p.addRange(y));
									}
								}
							}
						}
						for (d = [], p = s; p = p.parentNode;) p.nodeType === 1 && d.push({
							element: p,
							left: p.scrollLeft,
							top: p.scrollTop
						});
						for (typeof s.focus == "function" && s.focus(), s = 0; s < d.length; s++) {
							var b = d[s];
							b.element.scrollLeft = b.left, b.element.scrollTop = b.top;
						}
					}
					cp = !!zd, Bd = zd = null;
				} finally {
					Fl = i, F.p = r, P.T = n;
				}
			}
			e.current = t, ru = 2;
		}
	}
	function Ru() {
		if (ru === 2) {
			ru = 0;
			var e = iu, t = au, n = (t.flags & 8772) != 0;
			if (t.subtreeFlags & 8772 || n) {
				n = P.T, P.T = null;
				var r = F.p;
				F.p = 2;
				var i = Fl;
				Fl |= 4;
				try {
					tl(e, t.alternate, t);
				} finally {
					Fl = i, F.p = r, P.T = n;
				}
			}
			ru = 3;
		}
	}
	function zu() {
		if (ru === 4 || ru === 3) {
			ru = 0, ve();
			var e = iu, t = au, n = ou, r = lu;
			t.subtreeFlags & 10256 || t.flags & 10256 ? ru = 5 : (ru = 0, au = iu = null, Bu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (nu = null), Je(n), t = t.stateNode, G && typeof G.onCommitFiberRoot == "function") try {
				G.onCommitFiberRoot(Oe, t, void 0, (t.current.flags & 128) == 128);
			} catch {}
			if (r !== null) {
				t = P.T, i = F.p, F.p = 2, P.T = null;
				try {
					for (var a = e.onRecoverableError, o = 0; o < r.length; o++) {
						var s = r[o];
						a(s.value, { componentStack: s.stack });
					}
				} finally {
					P.T = t, F.p = i;
				}
			}
			ou & 3 && Vu(), rd(e), i = e.pendingLanes, n & 261930 && i & 42 ? e === du ? uu++ : (uu = 0, du = e) : uu = 0, id(0, !1);
		}
	}
	function Bu(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, ta(t)));
	}
	function Vu() {
		return Lu(), Ru(), zu(), Hu();
	}
	function Hu() {
		if (ru !== 5) return !1;
		var e = iu, t = su;
		su = 0;
		var n = Je(ou), r = P.T, i = F.p;
		try {
			F.p = 32 > n ? 32 : n, P.T = null, n = cu, cu = null;
			var a = iu, o = ou;
			if (ru = 0, au = iu = null, ou = 0, Fl & 6) throw Error(s(331));
			var c = Fl;
			if (Fl |= 4, Al(a.current), Sl(a, a.current, o, n), Fl = c, id(0, !1), G && typeof G.onPostCommitFiberRoot == "function") try {
				G.onPostCommitFiberRoot(Oe, a);
			} catch {}
			return !0;
		} finally {
			F.p = i, P.T = r, Bu(e, t);
		}
	}
	function Uu(e, t, n) {
		t = ui(n, t), t = Ks(e.stateNode, t, 2), e = Ia(e, t, 2), e !== null && (He(e, 2), rd(e));
	}
	function Wu(e, t, n) {
		if (e.tag === 3) Uu(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				Uu(t, e, n);
				break;
			} else if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (nu === null || !nu.has(r))) {
					e = ui(n, e), n = qs(2), r = Ia(t, n, 2), r !== null && (Js(n, r, t, e), He(r, 2), rd(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function Gu(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Pl();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (Vl = !0, i.add(n), e = Ku.bind(null, e, t, n), t.then(e, e));
	}
	function Ku(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Il === e && (Z & n) === n && (Ul === 4 || Ul === 3 && (Z & 62914560) === Z && 300 > ye() - Ql ? !(Fl & 2) && xu(e, 0) : Kl |= n, Jl === Z && (Jl = 0)), rd(e);
	}
	function qu(e, t) {
		t === 0 && (t = Be()), e = Yr(e, t), e !== null && (He(e, t), rd(e));
	}
	function Ju(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), qu(e, n);
	}
	function Yu(e, t) {
		var n = 0;
		switch (e.tag) {
			case 31:
			case 13:
				var r = e.stateNode, i = e.memoizedState;
				i !== null && (n = i.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			case 22:
				r = e.stateNode._retryCache;
				break;
			default: throw Error(s(314));
		}
		r !== null && r.delete(t), qu(e, n);
	}
	function Xu(e, t) {
		return he(e, t);
	}
	var Zu = null, Qu = null, $u = !1, ed = !1, td = !1, nd = 0;
	function rd(e) {
		e !== Qu && e.next === null && (Qu === null ? Zu = Qu = e : Qu = Qu.next = e), ed = !0, $u || ($u = !0, ud());
	}
	function id(e, t) {
		if (!td && ed) {
			td = !0;
			do
				for (var n = !1, r = Zu; r !== null;) {
					if (!t) if (e !== 0) {
						var i = r.pendingLanes;
						if (i === 0) var a = 0;
						else {
							var o = r.suspendedLanes, s = r.pingedLanes;
							a = (1 << 31 - Ae(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
						}
						a !== 0 && (n = !0, ld(r, a));
					} else a = Z, a = Le(r, r === Il ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || Re(r, a) || (n = !0, ld(r, a));
					r = r.next;
				}
			while (n);
			td = !1;
		}
	}
	function ad() {
		od();
	}
	function od() {
		ed = $u = !1;
		var e = 0;
		nd !== 0 && Kd() && (e = nd);
		for (var t = ye(), n = null, r = Zu; r !== null;) {
			var i = r.next, a = sd(r, t);
			a === 0 ? (r.next = null, n === null ? Zu = i : n.next = i, i === null && (Qu = n)) : (n = r, (e !== 0 || a & 3) && (ed = !0)), r = i;
		}
		ru !== 0 && ru !== 5 || id(e, !1), nd !== 0 && (nd = 0);
	}
	function sd(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - Ae(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = ze(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Il, n = Z, n = Le(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Ll === 2 || Ll === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && ge(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || Re(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && ge(r), Je(n)) {
				case 2:
				case 8:
					n = Se;
					break;
				case 32:
					n = Ce;
					break;
				case 268435456:
					n = Te;
					break;
				default: n = Ce;
			}
			return r = cd.bind(null, e), n = he(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && ge(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function cd(e, t) {
		if (ru !== 0 && ru !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Vu() && e.callbackNode !== n) return null;
		var r = Z;
		return r = Le(e, e === Il ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (hu(e, r, t), sd(e, ye()), e.callbackNode != null && e.callbackNode === n ? cd.bind(null, e) : null);
	}
	function ld(e, t) {
		if (Vu()) return null;
		hu(e, t, !0);
	}
	function ud() {
		Xd(function() {
			Fl & 6 ? he(xe, ad) : od();
		});
	}
	function dd() {
		if (nd === 0) {
			var e = ia;
			e === 0 && (e = Pe, Pe <<= 1, !(Pe & 261888) && (Pe = 256)), nd = e;
		}
		return nd;
	}
	function fd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Wt("" + e);
	}
	function pd(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function md(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = fd((i[$e] || null).action), o = r.submitter;
			o && (t = (t = o[$e] || null) ? fd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new pn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (nd !== 0) {
								var e = o ? pd(i, o) : new FormData(i);
								ys(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = o ? pd(i, o) : new FormData(i), ys(n, {
							pending: !0,
							data: e,
							method: i.method,
							action: a
						}, a, e));
					},
					currentTarget: i
				}]
			});
		}
	}
	for (var hd = 0; hd < Br.length; hd++) {
		var gd = Br[hd];
		Vr(gd.toLowerCase(), "on" + (gd[0].toUpperCase() + gd.slice(1)));
	}
	Vr(Mr, "onAnimationEnd"), Vr(Nr, "onAnimationIteration"), Vr(Pr, "onAnimationStart"), Vr("dblclick", "onDoubleClick"), Vr("focusin", "onFocus"), Vr("focusout", "onBlur"), Vr(Fr, "onTransitionRun"), Vr(Ir, "onTransitionStart"), Vr(Lr, "onTransitionCancel"), Vr(Rr, "onTransitionEnd"), ht("onMouseEnter", ["mouseout", "mouseover"]), ht("onMouseLeave", ["mouseout", "mouseover"]), ht("onPointerEnter", ["pointerout", "pointerover"]), ht("onPointerLeave", ["pointerout", "pointerover"]), mt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), mt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), mt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), mt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), mt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), mt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var _d = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), vd = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(_d));
	function yd(e, t) {
		t = (t & 4) != 0;
		for (var n = 0; n < e.length; n++) {
			var r = e[n], i = r.event;
			r = r.listeners;
			a: {
				var a = void 0;
				if (t) for (var o = r.length - 1; 0 <= o; o--) {
					var s = r[o], c = s.instance, l = s.currentTarget;
					if (s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Hr(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Hr(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Q(e, t) {
		var n = t[tt];
		n === void 0 && (n = t[tt] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Cd(t, e, 2, !1), n.add(r));
	}
	function bd(e, t, n) {
		var r = 0;
		t && (r |= 4), Cd(n, e, r, t);
	}
	var xd = "_reactListening" + Math.random().toString(36).slice(2);
	function Sd(e) {
		if (!e[xd]) {
			e[xd] = !0, ft.forEach(function(t) {
				t !== "selectionchange" && (vd.has(t) || bd(t, !1, e), bd(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[xd] || (t[xd] = !0, bd("selectionchange", !1, t));
		}
	}
	function Cd(e, t, n, r) {
		switch (hp(t)) {
			case 2:
				var i = lp;
				break;
			case 8:
				i = up;
				break;
			default: i = dp;
		}
		n = i.bind(null, t, n, e), i = void 0, !tn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function wd(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var o = r.tag;
			if (o === 3 || o === 4) {
				var s = r.stateNode.containerInfo;
				if (s === i) break;
				if (o === 4) for (o = r.return; o !== null;) {
					var c = o.tag;
					if ((c === 3 || c === 4) && o.stateNode.containerInfo === i) return;
					o = o.return;
				}
				for (; s !== null;) {
					if (o = st(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6 || c === 26 || c === 27) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		Qt(function() {
			var r = a, i = qt(n), o = [];
			a: {
				var s = zr.get(e);
				if (s !== void 0) {
					var c = pn, u = e;
					switch (e) {
						case "keypress": if (cn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = jn;
							break;
						case "focusin":
							u = "focus", c = Sn;
							break;
						case "focusout":
							u = "blur", c = Sn;
							break;
						case "beforeblur":
						case "afterblur":
							c = Sn;
							break;
						case "click": if (n.button === 2) break a;
						case "auxclick":
						case "dblclick":
						case "mousedown":
						case "mousemove":
						case "mouseup":
						case "mouseout":
						case "mouseover":
						case "contextmenu":
							c = bn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = xn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = Nn;
							break;
						case Mr:
						case Nr:
						case Pr:
							c = Cn;
							break;
						case Rr:
							c = Pn;
							break;
						case "scroll":
						case "scrollend":
							c = hn;
							break;
						case "wheel":
							c = Fn;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = wn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							c = Mn;
							break;
						case "toggle":
						case "beforetoggle": c = In;
					}
					var d = (t & 4) != 0, f = !d && (e === "scroll" || e === "scrollend"), p = d ? s === null ? null : s + "Capture" : s;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = $t(m, p), g != null && d.push(Td(m, g, h))), f) break;
						m = m.return;
					}
					0 < d.length && (s = new c(s, u, null, n, i), o.push({
						event: s,
						listeners: d
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== Kt && (u = n.relatedTarget || n.fromElement) && (st(u) || u[et])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (u = n.relatedTarget || n.toElement, c = r, u = u ? st(u) : null, u !== null && (f = l(u), d = u.tag, u !== f || d !== 5 && d !== 27 && d !== 6) && (u = null)) : (c = null, u = r), c !== u)) {
						if (d = bn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = Mn, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? s : lt(c), h = u == null ? s : lt(u), s = new d(g, m + "leave", c, n, i), s.target = f, s.relatedTarget = h, g = null, st(i) === r && (d = new d(p, m + "enter", u, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, c && u) b: {
							for (d = Dd, p = c, m = u, h = 0, g = p; g; g = d(g)) h++;
							g = 0;
							for (var _ = m; _; _ = d(_)) g++;
							for (; 0 < h - g;) p = d(p), h--;
							for (; 0 < g - h;) m = d(m), g--;
							for (; h--;) {
								if (p === m || m !== null && p === m.alternate) {
									d = p;
									break b;
								}
								p = d(p), m = d(m);
							}
							d = null;
						}
						else d = null;
						c !== null && Od(o, s, c, d, !1), u !== null && f !== null && Od(o, f, u, d, !0);
					}
				}
				a: {
					if (s = r ? lt(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var v = nr;
					else if (Xn(s)) if (rr) v = fr;
					else {
						v = ur;
						var y = lr;
					}
					else c = s.nodeName, !c || c.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? r && Vt(r.elementType) && (v = nr) : v = dr;
					if (v &&= v(e, r)) {
						Zn(o, v, n, i);
						break a;
					}
					y && y(e, s, r), e === "focusout" && r && s.type === "number" && r.memoizedProps.value != null && Nt(s, "number", s.value);
				}
				switch (y = r ? lt(r) : window, e) {
					case "focusin":
						(Xn(y) || y.contentEditable === "true") && (Sr = y, Cr = r, wr = null);
						break;
					case "focusout":
						wr = Cr = Sr = null;
						break;
					case "mousedown":
						Tr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						Tr = !1, Er(o, n, i);
						break;
					case "selectionchange": if (xr) break;
					case "keydown":
					case "keyup": Er(o, n, i);
				}
				var b;
				if (Rn) b: {
					switch (e) {
						case "compositionstart":
							var x = "onCompositionStart";
							break b;
						case "compositionend":
							x = "onCompositionEnd";
							break b;
						case "compositionupdate":
							x = "onCompositionUpdate";
							break b;
					}
					x = void 0;
				}
				else Kn ? Wn(e, n) && (x = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (x = "onCompositionStart");
				x && (Vn && n.locale !== "ko" && (Kn || x !== "onCompositionStart" ? x === "onCompositionEnd" && Kn && (b = sn()) : (rn = i, an = "value" in rn ? rn.value : rn.textContent, Kn = !0)), y = Ed(r, x), 0 < y.length && (x = new Tn(x, e, null, n, i), o.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = Gn(n), b !== null && (x.data = b)))), (b = Bn ? qn(e, n) : Jn(e, n)) && (x = Ed(r, "onBeforeInput"), 0 < x.length && (y = new Tn("onBeforeInput", "beforeinput", null, n, i), o.push({
					event: y,
					listeners: x
				}), y.data = b)), md(o, e, r, n, i);
			}
			yd(o, t);
		});
	}
	function Td(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Ed(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = $t(e, n), i != null && r.unshift(Td(e, i, a)), i = $t(e, t), i != null && r.push(Td(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Dd(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Od(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = $t(n, a), l != null && o.unshift(Td(n, l, c))) : i || (l = $t(n, a), l != null && o.push(Td(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var kd = /\r\n?/g, Ad = /\u0000|\uFFFD/g;
	function jd(e) {
		return (typeof e == "string" ? e : "" + e).replace(kd, "\n").replace(Ad, "");
	}
	function Md(e, t) {
		return t = jd(t), jd(e) === t;
	}
	function Nd(e, t, n, r, i, a) {
		switch (n) {
			case "children":
				typeof r == "string" ? t === "body" || t === "textarea" && r === "" || Lt(e, r) : (typeof r == "number" || typeof r == "bigint") && t !== "body" && Lt(e, "" + r);
				break;
			case "className":
				xt(e, "class", r);
				break;
			case "tabIndex":
				xt(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				xt(e, n, r);
				break;
			case "style":
				Bt(e, r, a);
				break;
			case "data": if (t !== "object") {
				xt(e, "data", r);
				break;
			}
			case "src":
			case "href":
				if (r === "" && (t !== "a" || n !== "href")) {
					e.removeAttribute(n);
					break;
				}
				if (r == null || typeof r == "function" || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Wt("" + r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				} else typeof a == "function" && (n === "formAction" ? (t !== "input" && Nd(e, t, "name", i.name, i, null), Nd(e, t, "formEncType", i.formEncType, i, null), Nd(e, t, "formMethod", i.formMethod, i, null), Nd(e, t, "formTarget", i.formTarget, i, null)) : (Nd(e, t, "encType", i.encType, i, null), Nd(e, t, "method", i.method, i, null), Nd(e, t, "target", i.target, i, null)));
				if (r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Wt("" + r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = Gt);
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				break;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(s(61));
					if (n = r.__html, n != null) {
						if (i.children != null) throw Error(s(60));
						e.innerHTML = n;
					}
				}
				break;
			case "multiple":
				e.multiple = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "muted":
				e.muted = r && typeof r != "function" && typeof r != "symbol";
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "defaultValue":
			case "defaultChecked":
			case "innerHTML":
			case "ref": break;
			case "autoFocus": break;
			case "xlinkHref":
				if (r == null || typeof r == "function" || typeof r == "boolean" || typeof r == "symbol") {
					e.removeAttribute("xlink:href");
					break;
				}
				n = Wt("" + r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
				break;
			case "contentEditable":
			case "spellCheck":
			case "draggable":
			case "value":
			case "autoReverse":
			case "externalResourcesRequired":
			case "focusable":
			case "preserveAlpha":
				r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "" + r) : e.removeAttribute(n);
				break;
			case "inert":
			case "allowFullScreen":
			case "async":
			case "autoPlay":
			case "controls":
			case "default":
			case "defer":
			case "disabled":
			case "disablePictureInPicture":
			case "disableRemotePlayback":
			case "formNoValidate":
			case "hidden":
			case "loop":
			case "noModule":
			case "noValidate":
			case "open":
			case "playsInline":
			case "readOnly":
			case "required":
			case "reversed":
			case "scoped":
			case "seamless":
			case "itemScope":
				r && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
				break;
			case "capture":
			case "download":
				!0 === r ? e.setAttribute(n, "") : !1 !== r && r != null && typeof r != "function" && typeof r != "symbol" ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "cols":
			case "rows":
			case "size":
			case "span":
				r != null && typeof r != "function" && typeof r != "symbol" && !isNaN(r) && 1 <= r ? e.setAttribute(n, r) : e.removeAttribute(n);
				break;
			case "rowSpan":
			case "start":
				r == null || typeof r == "function" || typeof r == "symbol" || isNaN(r) ? e.removeAttribute(n) : e.setAttribute(n, r);
				break;
			case "popover":
				Q("beforetoggle", e), Q("toggle", e), bt(e, "popover", r);
				break;
			case "xlinkActuate":
				St(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				St(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				St(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				St(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				St(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				St(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				St(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				St(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				St(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				bt(e, "is", r);
				break;
			case "innerText":
			case "textContent": break;
			default: (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = Ht.get(n) || n, bt(e, n, r));
		}
	}
	function Pd(e, t, n, r, i, a) {
		switch (n) {
			case "style":
				Bt(e, r, a);
				break;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(s(61));
					if (n = r.__html, n != null) {
						if (i.children != null) throw Error(s(60));
						e.innerHTML = n;
					}
				}
				break;
			case "children":
				typeof r == "string" ? Lt(e, r) : (typeof r == "number" || typeof r == "bigint") && Lt(e, "" + r);
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				break;
			case "onClick":
				r != null && (e.onclick = Gt);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": break;
			case "innerText":
			case "textContent": break;
			default: if (!pt.hasOwnProperty(n)) a: {
				if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), a = e[$e] || null, a = a == null ? null : a[n], typeof a == "function" && e.removeEventListener(t, a, i), typeof r == "function")) {
					typeof a != "function" && a !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, i);
					break a;
				}
				n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : bt(e, n, r);
			}
		}
	}
	function Fd(e, t, n) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "img":
				Q("error", e), Q("load", e);
				var r = !1, i = !1, a;
				for (a in n) if (n.hasOwnProperty(a)) {
					var o = n[a];
					if (o != null) switch (a) {
						case "src":
							r = !0;
							break;
						case "srcSet":
							i = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(s(137, t));
						default: Nd(e, t, a, o, n, null);
					}
				}
				i && Nd(e, t, "srcSet", n.srcSet, n, null), r && Nd(e, t, "src", n.src, n, null);
				return;
			case "input":
				Q("invalid", e);
				var c = a = o = i = null, l = null, u = null;
				for (r in n) if (n.hasOwnProperty(r)) {
					var d = n[r];
					if (d != null) switch (r) {
						case "name":
							i = d;
							break;
						case "type":
							o = d;
							break;
						case "checked":
							l = d;
							break;
						case "defaultChecked":
							u = d;
							break;
						case "value":
							a = d;
							break;
						case "defaultValue":
							c = d;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (d != null) throw Error(s(137, t));
							break;
						default: Nd(e, t, r, d, n, null);
					}
				}
				Mt(e, a, c, l, u, o, i, !1);
				return;
			case "select":
				for (i in Q("invalid", e), r = o = a = null, n) if (n.hasOwnProperty(i) && (c = n[i], c != null)) switch (i) {
					case "value":
						a = c;
						break;
					case "defaultValue":
						o = c;
						break;
					case "multiple": r = c;
					default: Nd(e, t, i, c, n, null);
				}
				t = a, n = o, e.multiple = !!r, t == null ? n != null && Pt(e, !!r, n, !0) : Pt(e, !!r, t, !1);
				return;
			case "textarea":
				for (o in Q("invalid", e), a = i = r = null, n) if (n.hasOwnProperty(o) && (c = n[o], c != null)) switch (o) {
					case "value":
						r = c;
						break;
					case "defaultValue":
						i = c;
						break;
					case "children":
						a = c;
						break;
					case "dangerouslySetInnerHTML":
						if (c != null) throw Error(s(91));
						break;
					default: Nd(e, t, o, c, n, null);
				}
				It(e, r, i, a);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: Nd(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				Q("beforetoggle", e), Q("toggle", e), Q("cancel", e), Q("close", e);
				break;
			case "iframe":
			case "object":
				Q("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < _d.length; r++) Q(_d[r], e);
				break;
			case "image":
				Q("error", e), Q("load", e);
				break;
			case "details":
				Q("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": Q("error", e), Q("load", e);
			case "area":
			case "base":
			case "br":
			case "col":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "track":
			case "wbr":
			case "menuitem":
				for (u in n) if (n.hasOwnProperty(u) && (r = n[u], r != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML": throw Error(s(137, t));
					default: Nd(e, t, u, r, n, null);
				}
				return;
			default: if (Vt(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && Pd(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && Nd(e, t, c, r, n, null));
	}
	function Id(e, t, n, r) {
		switch (t) {
			case "div":
			case "span":
			case "svg":
			case "path":
			case "a":
			case "g":
			case "p":
			case "li": break;
			case "input":
				var i = null, a = null, o = null, c = null, l = null, u = null, d = null;
				for (m in n) {
					var f = n[m];
					if (n.hasOwnProperty(m) && f != null) switch (m) {
						case "checked": break;
						case "value": break;
						case "defaultValue": l = f;
						default: r.hasOwnProperty(m) || Nd(e, t, m, null, r, f);
					}
				}
				for (var p in r) {
					var m = r[p];
					if (f = n[p], r.hasOwnProperty(p) && (m != null || f != null)) switch (p) {
						case "type":
							a = m;
							break;
						case "name":
							i = m;
							break;
						case "checked":
							u = m;
							break;
						case "defaultChecked":
							d = m;
							break;
						case "value":
							o = m;
							break;
						case "defaultValue":
							c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(s(137, t));
							break;
						default: m !== f && Nd(e, t, p, m, r, f);
					}
				}
				jt(e, o, c, l, u, d, a, i);
				return;
			case "select":
				for (a in m = o = c = p = null, n) if (l = n[a], n.hasOwnProperty(a) && l != null) switch (a) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(a) || Nd(e, t, a, null, r, l);
				}
				for (i in r) if (a = r[i], l = n[i], r.hasOwnProperty(i) && (a != null || l != null)) switch (i) {
					case "value":
						p = a;
						break;
					case "defaultValue":
						c = a;
						break;
					case "multiple": o = a;
					default: a !== l && Nd(e, t, i, a, r, l);
				}
				t = c, n = o, r = m, p == null ? !!r != !!n && (t == null ? Pt(e, !!n, n ? [] : "", !1) : Pt(e, !!n, t, !0)) : Pt(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (i = n[c], n.hasOwnProperty(c) && i != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: Nd(e, t, c, null, r, i);
				}
				for (o in r) if (i = r[o], a = n[o], r.hasOwnProperty(o) && (i != null || a != null)) switch (o) {
					case "value":
						p = i;
						break;
					case "defaultValue":
						m = i;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (i != null) throw Error(s(91));
						break;
					default: i !== a && Nd(e, t, o, i, r, a);
				}
				Ft(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: Nd(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: Nd(e, t, l, p, r, m);
				}
				return;
			case "img":
			case "link":
			case "area":
			case "base":
			case "br":
			case "col":
			case "embed":
			case "hr":
			case "keygen":
			case "meta":
			case "param":
			case "source":
			case "track":
			case "wbr":
			case "menuitem":
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && Nd(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(s(137, t));
						break;
					default: Nd(e, t, u, p, r, m);
				}
				return;
			default: if (Vt(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && Pd(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || Pd(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && Nd(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || Nd(e, t, f, p, r, m);
	}
	function Ld(e) {
		switch (e) {
			case "css":
			case "script":
			case "font":
			case "img":
			case "image":
			case "input":
			case "link": return !0;
			default: return !1;
		}
	}
	function Rd() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && Ld(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && Ld(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var zd = null, Bd = null;
	function Vd(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function Hd(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function Ud(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function Wd(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var Gd = null;
	function Kd() {
		var e = window.event;
		return e && e.type === "popstate" ? e === Gd ? !1 : (Gd = e, !0) : (Gd = null, !1);
	}
	var qd = typeof setTimeout == "function" ? setTimeout : void 0, Jd = typeof clearTimeout == "function" ? clearTimeout : void 0, Yd = typeof Promise == "function" ? Promise : void 0, Xd = typeof queueMicrotask == "function" ? queueMicrotask : Yd === void 0 ? qd : function(e) {
		return Yd.resolve(null).then(e).catch(Zd);
	};
	function Zd(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Qd(e) {
		return e === "head";
	}
	function $d(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) if (n = i.data, n === "/$" || n === "/&") {
				if (r === 0) {
					e.removeChild(i), Pp(t);
					return;
				}
				r--;
			} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
			else if (n === "html") mf(e.ownerDocument.documentElement);
			else if (n === "head") {
				n = e.ownerDocument.head, mf(n);
				for (var a = n.firstChild; a;) {
					var o = a.nextSibling, s = a.nodeName;
					a[at] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
				}
			} else n === "body" && mf(e.ownerDocument.body);
			n = i;
		} while (n);
		Pp(t);
	}
	function ef(e, t) {
		var n = e;
		e = 0;
		do {
			var r = n.nextSibling;
			if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display, n.style.display = "none") : (n.style.display = n._stashedDisplay || "", n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue, n.nodeValue = "") : n.nodeValue = n._stashedText || ""), r && r.nodeType === 8) if (n = r.data, n === "/$") {
				if (e === 0) break;
				e--;
			} else n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
			n = r;
		} while (n);
	}
	function tf(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					tf(n), ot(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function nf(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) if (t === "input" && e.type === "hidden") {
				var a = i.name == null ? null : "" + i.name;
				if (i.type === "hidden" && e.getAttribute("name") === a) return e;
			} else return e;
			else if (!e[at]) switch (t) {
				case "meta":
					if (!e.hasAttribute("itemprop")) break;
					return e;
				case "link":
					if (a = e.getAttribute("rel"), a === "stylesheet" && e.hasAttribute("data-precedence") || a !== i.rel || e.getAttribute("href") !== (i.href == null || i.href === "" ? null : i.href) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin) || e.getAttribute("title") !== (i.title == null ? null : i.title)) break;
					return e;
				case "style":
					if (e.hasAttribute("data-precedence")) break;
					return e;
				case "script":
					if (a = e.getAttribute("src"), (a !== (i.src == null ? null : i.src) || e.getAttribute("type") !== (i.type == null ? null : i.type) || e.getAttribute("crossorigin") !== (i.crossOrigin == null ? null : i.crossOrigin)) && a && e.hasAttribute("async") && !e.hasAttribute("itemprop")) break;
					return e;
				default: return e;
			}
			if (e = lf(e.nextSibling), e === null) break;
		}
		return null;
	}
	function rf(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = lf(e.nextSibling), e === null)) return null;
		return e;
	}
	function af(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = lf(e.nextSibling), e === null)) return null;
		return e;
	}
	function of(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function sf(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function cf(e, t) {
		var n = e.ownerDocument;
		if (e.data === "$~") e._reactRetry = t;
		else if (e.data !== "$?" || n.readyState !== "loading") t();
		else {
			var r = function() {
				t(), n.removeEventListener("DOMContentLoaded", r);
			};
			n.addEventListener("DOMContentLoaded", r), e._reactRetry = r;
		}
	}
	function lf(e) {
		for (; e != null; e = e.nextSibling) {
			var t = e.nodeType;
			if (t === 1 || t === 3) break;
			if (t === 8) {
				if (t = e.data, t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F") break;
				if (t === "/$" || t === "/&") return null;
			}
		}
		return e;
	}
	var uf = null;
	function df(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return lf(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function ff(e) {
		e = e.previousSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
					if (t === 0) return e;
					t--;
				} else n !== "/$" && n !== "/&" || t++;
			}
			e = e.previousSibling;
		}
		return null;
	}
	function pf(e, t, n) {
		switch (t = Vd(n), e) {
			case "html":
				if (e = t.documentElement, !e) throw Error(s(452));
				return e;
			case "head":
				if (e = t.head, !e) throw Error(s(453));
				return e;
			case "body":
				if (e = t.body, !e) throw Error(s(454));
				return e;
			default: throw Error(s(451));
		}
	}
	function mf(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		ot(e);
	}
	var hf = /* @__PURE__ */ new Map(), gf = /* @__PURE__ */ new Set();
	function _f(e) {
		return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
	}
	var vf = F.d;
	F.d = {
		f: yf,
		r: bf,
		D: Cf,
		C: wf,
		L: Tf,
		m: Ef,
		X: Of,
		S: Df,
		M: kf
	};
	function yf() {
		var e = vf.f(), t = yu();
		return e || t;
	}
	function bf(e) {
		var t = ct(e);
		t !== null && t.tag === 5 && t.type === "form" ? xs(t) : vf.r(e);
	}
	var xf = typeof document > "u" ? null : document;
	function Sf(e, t, n) {
		var r = xf;
		if (r && typeof t == "string" && t) {
			var i = At(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), gf.has(i) || (gf.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), Fd(t, "link", e), dt(t), r.head.appendChild(t)));
		}
	}
	function Cf(e) {
		vf.D(e), Sf("dns-prefetch", e, null);
	}
	function wf(e, t) {
		vf.C(e, t), Sf("preconnect", e, t);
	}
	function Tf(e, t, n) {
		vf.L(e, t, n);
		var r = xf;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + At(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + At(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + At(n.imageSizes) + "\"]")) : i += "[href=\"" + At(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = jf(e);
					break;
				case "script": a = Ff(e);
			}
			hf.has(a) || (e = h({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), hf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Mf(a)) || t === "script" && r.querySelector(If(a)) || (t = r.createElement("link"), Fd(t, "link", e), dt(t), r.head.appendChild(t)));
		}
	}
	function Ef(e, t) {
		vf.m(e, t);
		var n = xf;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + At(r) + "\"][href=\"" + At(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = Ff(e);
			}
			if (!hf.has(a) && (e = h({
				rel: "modulepreload",
				href: e
			}, t), hf.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(If(a))) return;
				}
				r = n.createElement("link"), Fd(r, "link", e), dt(r), n.head.appendChild(r);
			}
		}
	}
	function Df(e, t, n) {
		vf.S(e, t, n);
		var r = xf;
		if (r && e) {
			var i = ut(r).hoistableStyles, a = jf(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(Mf(a))) s.loading = 5;
				else {
					e = h({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = hf.get(a)) && zf(e, n);
					var c = o = r.createElement("link");
					dt(c), Fd(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Rf(o, t, r);
				}
				o = {
					type: "stylesheet",
					instance: o,
					count: 1,
					state: s
				}, i.set(a, o);
			}
		}
	}
	function Of(e, t) {
		vf.X(e, t);
		var n = xf;
		if (n && e) {
			var r = ut(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = h({
				src: e,
				async: !0
			}, t), (t = hf.get(i)) && Bf(e, t), a = n.createElement("script"), dt(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function kf(e, t) {
		vf.M(e, t);
		var n = xf;
		if (n && e) {
			var r = ut(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = h({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = hf.get(i)) && Bf(e, t), a = n.createElement("script"), dt(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Af(e, t, n, r) {
		var i = (i = re.current) ? _f(i) : null;
		if (!i) throw Error(s(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = jf(n.href), n = ut(i).hoistableStyles, r = n.get(t), r || (r = {
				type: "style",
				instance: null,
				count: 0,
				state: null
			}, n.set(t, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			case "link":
				if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
					e = jf(n.href);
					var a = ut(i).hoistableStyles, o = a.get(e);
					if (o || (i = i.ownerDocument || i, o = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, a.set(e, o), (a = i.querySelector(Mf(e))) && !a._p && (o.instance = a, o.state.loading = 5), hf.has(e) || (n = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, hf.set(e, n), a || Pf(i, e, n, o.state))), t && r === null) throw Error(s(528, ""));
					return o;
				}
				if (t && r !== null) throw Error(s(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Ff(n), n = ut(i).hoistableScripts, r = n.get(t), r || (r = {
				type: "script",
				instance: null,
				count: 0,
				state: null
			}, n.set(t, r)), r) : {
				type: "void",
				instance: null,
				count: 0,
				state: null
			};
			default: throw Error(s(444, e));
		}
	}
	function jf(e) {
		return "href=\"" + At(e) + "\"";
	}
	function Mf(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Nf(e) {
		return h({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Pf(e, t, n, r) {
		e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]") ? r.loading = 1 : (t = e.createElement("link"), r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		}), Fd(t, "link", n), dt(t), e.head.appendChild(t));
	}
	function Ff(e) {
		return "[src=\"" + At(e) + "\"]";
	}
	function If(e) {
		return "script[async]" + e;
	}
	function Lf(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + At(n.href) + "\"]");
				if (r) return t.instance = r, dt(r), r;
				var i = h({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), dt(r), Fd(r, "style", i), Rf(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = jf(n.href);
				var a = e.querySelector(Mf(i));
				if (a) return t.state.loading |= 4, t.instance = a, dt(a), a;
				r = Nf(n), (i = hf.get(i)) && zf(r, i), a = (e.ownerDocument || e).createElement("link"), dt(a);
				var o = a;
				return o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Fd(a, "link", r), t.state.loading |= 4, Rf(a, n.precedence, e), t.instance = a;
			case "script": return a = Ff(n.src), (i = e.querySelector(If(a))) ? (t.instance = i, dt(i), i) : (r = n, (i = hf.get(a)) && (r = h({}, n), Bf(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), dt(i), Fd(i, "link", r), e.head.appendChild(i), t.instance = i);
			case "void": return null;
			default: throw Error(s(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Rf(r, n.precedence, e));
		return t.instance;
	}
	function Rf(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function zf(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function Bf(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Vf = null;
	function Hf(e, t, n) {
		if (Vf === null) {
			var r = /* @__PURE__ */ new Map(), i = Vf = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Vf, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[at] || a[Qe] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function Uf(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function Wf(e, t, n) {
		if (n === 1 || t.itemProp != null) return !1;
		switch (e) {
			case "meta":
			case "title": return !0;
			case "style":
				if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "") break;
				return !0;
			case "link":
				if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError) break;
				switch (t.rel) {
					case "stylesheet": return e = t.disabled, typeof t.precedence == "string" && e == null;
					default: return !0;
				}
			case "script": if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string") return !0;
		}
		return !1;
	}
	function Gf(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Kf(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = jf(r.href), a = t.querySelector(Mf(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Yf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, dt(a);
					return;
				}
				a = t.ownerDocument || t, r = Nf(r), (i = hf.get(i)) && zf(r, i), a = a.createElement("link"), dt(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Fd(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = Yf.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var qf = 0;
	function Jf(e, t) {
		return e.stylesheets && e.count === 0 && Zf(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && Zf(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && qf === 0 && (qf = 62500 * Rd());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Zf(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > qf ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function Yf() {
		if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
			if (this.stylesheets) Zf(this, this.stylesheets);
			else if (this.unsuspend) {
				var e = this.unsuspend;
				this.unsuspend = null, e();
			}
		}
	}
	var Xf = null;
	function Zf(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, Xf = /* @__PURE__ */ new Map(), t.forEach(Qf, e), Xf = null, Yf.call(e));
	}
	function Qf(e, t) {
		if (!(t.state.loading & 4)) {
			var n = Xf.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), Xf.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = Yf.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var $f = {
		$$typeof: C,
		Provider: null,
		Consumer: null,
		_currentValue: I,
		_currentValue2: I,
		_threadCount: 0
	};
	function ep(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Ve(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ve(0), this.hiddenUpdates = Ve(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function tp(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new ep(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = ei(3, null, null, t), e.current = a, a.stateNode = e, t = ea(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, Na(a), e;
	}
	function np(e) {
		return e ? (e = Qr, e) : Qr;
	}
	function rp(e, t, n, r, i, a) {
		i = np(i), r.context === null ? r.context = i : r.pendingContext = i, r = Fa(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = Ia(e, r, t), n !== null && (mu(n, e, t), La(n, e, t));
	}
	function ip(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function ap(e, t) {
		ip(e, t), (e = e.alternate) && ip(e, t);
	}
	function op(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Yr(e, 67108864);
			t !== null && mu(t, e, 67108864), ap(e, 67108864);
		}
	}
	function sp(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = fu();
			t = qe(t);
			var n = Yr(e, t);
			n !== null && mu(n, e, t), ap(e, t);
		}
	}
	var cp = !0;
	function lp(e, t, n, r) {
		var i = P.T;
		P.T = null;
		var a = F.p;
		try {
			F.p = 2, dp(e, t, n, r);
		} finally {
			F.p = a, P.T = i;
		}
	}
	function up(e, t, n, r) {
		var i = P.T;
		P.T = null;
		var a = F.p;
		try {
			F.p = 8, dp(e, t, n, r);
		} finally {
			F.p = a, P.T = i;
		}
	}
	function dp(e, t, n, r) {
		if (cp) {
			var i = fp(r);
			if (i === null) wd(e, t, r, pp, n), wp(e, r);
			else if (Ep(i, e, t, n, r)) r.stopPropagation();
			else if (wp(e, r), t & 4 && -1 < Cp.indexOf(e)) {
				for (; i !== null;) {
					var a = ct(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = K(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - Ae(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									rd(a), !(Fl & 6) && (eu = ye() + 500, id(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Yr(a, 2), s !== null && mu(s, a, 2), yu(), ap(a, 2);
					}
					if (a = fp(r), a === null && wd(e, t, r, pp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else wd(e, t, r, null, n);
		}
	}
	function fp(e) {
		return e = qt(e), mp(e);
	}
	var pp = null;
	function mp(e) {
		if (pp = null, e = st(e), e !== null) {
			var t = l(e);
			if (t === null) e = null;
			else {
				var n = t.tag;
				if (n === 13) {
					if (e = u(t), e !== null) return e;
					e = null;
				} else if (n === 31) {
					if (e = d(t), e !== null) return e;
					e = null;
				} else if (n === 3) {
					if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
					e = null;
				} else t !== e && (e = null);
			}
		}
		return pp = e, null;
	}
	function hp(e) {
		switch (e) {
			case "beforetoggle":
			case "cancel":
			case "click":
			case "close":
			case "contextmenu":
			case "copy":
			case "cut":
			case "auxclick":
			case "dblclick":
			case "dragend":
			case "dragstart":
			case "drop":
			case "focusin":
			case "focusout":
			case "input":
			case "invalid":
			case "keydown":
			case "keypress":
			case "keyup":
			case "mousedown":
			case "mouseup":
			case "paste":
			case "pause":
			case "play":
			case "pointercancel":
			case "pointerdown":
			case "pointerup":
			case "ratechange":
			case "reset":
			case "resize":
			case "seeked":
			case "submit":
			case "toggle":
			case "touchcancel":
			case "touchend":
			case "touchstart":
			case "volumechange":
			case "change":
			case "selectionchange":
			case "textInput":
			case "compositionstart":
			case "compositionend":
			case "compositionupdate":
			case "beforeblur":
			case "afterblur":
			case "beforeinput":
			case "blur":
			case "fullscreenchange":
			case "focus":
			case "hashchange":
			case "popstate":
			case "select":
			case "selectstart": return 2;
			case "drag":
			case "dragenter":
			case "dragexit":
			case "dragleave":
			case "dragover":
			case "mousemove":
			case "mouseout":
			case "mouseover":
			case "pointermove":
			case "pointerout":
			case "pointerover":
			case "scroll":
			case "touchmove":
			case "wheel":
			case "mouseenter":
			case "mouseleave":
			case "pointerenter":
			case "pointerleave": return 8;
			case "message": switch (be()) {
				case xe: return 2;
				case Se: return 8;
				case Ce:
				case we: return 32;
				case Te: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var gp = !1, _p = null, vp = null, yp = null, bp = /* @__PURE__ */ new Map(), xp = /* @__PURE__ */ new Map(), Sp = [], Cp = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function wp(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				_p = null;
				break;
			case "dragenter":
			case "dragleave":
				vp = null;
				break;
			case "mouseover":
			case "mouseout":
				yp = null;
				break;
			case "pointerover":
			case "pointerout":
				bp.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": xp.delete(t.pointerId);
		}
	}
	function Tp(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = ct(t), t !== null && op(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Ep(e, t, n, r, i) {
		switch (t) {
			case "focusin": return _p = Tp(_p, e, t, n, r, i), !0;
			case "dragenter": return vp = Tp(vp, e, t, n, r, i), !0;
			case "mouseover": return yp = Tp(yp, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return bp.set(a, Tp(bp.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, xp.set(a, Tp(xp.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Dp(e) {
		var t = st(e.target);
		if (t !== null) {
			var n = l(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = u(n), t !== null) {
						e.blockedOn = t, Xe(e.priority, function() {
							sp(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = d(n), t !== null) {
						e.blockedOn = t, Xe(e.priority, function() {
							sp(n);
						});
						return;
					}
				} else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
					e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
					return;
				}
			}
		}
		e.blockedOn = null;
	}
	function Op(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = fp(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				Kt = r, n.target.dispatchEvent(r), Kt = null;
			} else return t = ct(n), t !== null && op(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function kp(e, t, n) {
		Op(e) && n.delete(t);
	}
	function Ap() {
		gp = !1, _p !== null && Op(_p) && (_p = null), vp !== null && Op(vp) && (vp = null), yp !== null && Op(yp) && (yp = null), bp.forEach(kp), xp.forEach(kp);
	}
	function jp(e, n) {
		e.blockedOn === n && (e.blockedOn = null, gp || (gp = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, Ap)));
	}
	var Mp = null;
	function Np(e) {
		Mp !== e && (Mp = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			Mp === e && (Mp = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (mp(r || n) === null) continue;
					break;
				}
				var a = ct(n);
				a !== null && (e.splice(t, 3), t -= 3, ys(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Pp(e) {
		function t(t) {
			return jp(t, e);
		}
		_p !== null && jp(_p, e), vp !== null && jp(vp, e), yp !== null && jp(yp, e), bp.forEach(t), xp.forEach(t);
		for (var n = 0; n < Sp.length; n++) {
			var r = Sp[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < Sp.length && (n = Sp[0], n.blockedOn === null);) Dp(n), n.blockedOn === null && Sp.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[$e] || null;
			if (typeof a == "function") o || Np(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[$e] || null) s = o.formAction;
					else if (mp(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Np(n);
			}
		}
	}
	function Fp() {
		function e(e) {
			e.canIntercept && e.info === "react-transition" && e.intercept({
				handler: function() {
					return new Promise(function(e) {
						return i = e;
					});
				},
				focusReset: "manual",
				scroll: "manual"
			});
		}
		function t() {
			i !== null && (i(), i = null), r || setTimeout(n, 20);
		}
		function n() {
			if (!r && !navigation.transition) {
				var e = navigation.currentEntry;
				e && e.url != null && navigation.navigate(e.url, {
					state: e.getState(),
					info: "react-transition",
					history: "replace"
				});
			}
		}
		if (typeof navigation == "object") {
			var r = !1, i = null;
			return navigation.addEventListener("navigate", e), navigation.addEventListener("navigatesuccess", t), navigation.addEventListener("navigateerror", t), setTimeout(n, 100), function() {
				r = !0, navigation.removeEventListener("navigate", e), navigation.removeEventListener("navigatesuccess", t), navigation.removeEventListener("navigateerror", t), i !== null && (i(), i = null);
			};
		}
	}
	function Ip(e) {
		this._internalRoot = e;
	}
	Lp.prototype.render = Ip.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(s(409));
		var n = t.current;
		rp(n, fu(), e, t, null, null);
	}, Lp.prototype.unmount = Ip.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			rp(e.current, 2, null, e, null, null), yu(), t[et] = null;
		}
	};
	function Lp(e) {
		this._internalRoot = e;
	}
	Lp.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = Ye();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < Sp.length && t !== 0 && t < Sp[n].priority; n++);
			Sp.splice(n, 0, e), n === 0 && Dp(e);
		}
	};
	var Rp = r.version;
	if (Rp !== "19.2.7") throw Error(s(527, Rp, "19.2.7"));
	F.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(s(188)) : (e = Object.keys(e).join(","), Error(s(268, e)));
		return e = p(t), e = e === null ? null : m(e), e = e === null ? null : e.stateNode, e;
	};
	var zp = {
		bundleType: 0,
		version: "19.2.7",
		rendererPackageName: "react-dom",
		currentDispatcherRef: P,
		reconcilerVersion: "19.2.7"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Bp = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Bp.isDisabled && Bp.supportsFiber) try {
			Oe = Bp.inject(zp), G = Bp;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!c(e)) throw Error(s(299));
		var n = !1, r = "", i = Vs, a = Hs, o = Us;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = tp(e, 1, !1, null, null, n, r, null, i, a, o, Fp), e[et] = t.current, Sd(e), new Ip(t);
	};
})), c = /* @__PURE__ */ e(((e, t) => {
	function n() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = s();
})), l = i(), u = c(), d = {
	spades: "♠",
	hearts: "♥",
	diamonds: "♦",
	clubs: "♣"
}, f = {
	spades: "Spades",
	hearts: "Hearts",
	diamonds: "Diamonds",
	clubs: "Clubs"
}, p = {
	A: 14,
	K: 13,
	Q: 12,
	J: 11,
	10: 10,
	9: 9,
	8: 8,
	7: 7,
	6: 6,
	5: 5,
	4: 4,
	3: 3,
	2: 2
}, m = (e) => e === "hearts" || e === "diamonds", h = /* @__PURE__ */ e(((e) => {
	var t = Symbol.for("react.transitional.element"), n = Symbol.for("react.fragment");
	function r(e, n, r) {
		var i = null;
		if (r !== void 0 && (i = "" + r), n.key !== void 0 && (i = "" + n.key), "key" in n) for (var a in r = {}, n) a !== "key" && (r[a] = n[a]);
		else r = n;
		return n = r.ref, {
			$$typeof: t,
			type: e,
			key: i,
			ref: n === void 0 ? null : n,
			props: r
		};
	}
	e.Fragment = n, e.jsx = r, e.jsxs = r;
})), g = (/* @__PURE__ */ e(((e, t) => {
	t.exports = h();
})))();
function _({ card: e, faceDown: t = !1, size: n = "md", state: r = "default", badge: i, onClick: a, onPlayClick: o, pointerHandlers: s, pressed: c = !1, playing: l = !1, playable: u = !1, showPlayableHint: p = !0, illegalShake: h = !1, illegalFlash: _ = !1, disabled: v = !1, ariaLabel: y, "data-testid": b, "data-card-index": x, "data-playable": S }) {
	let C = !!s, w = (C || typeof a == "function") && !v, T = [
		"pcard",
		`pcard--${n}`,
		`pcard--${r}`,
		w ? "pcard--interactive" : "",
		u && p ? "pcard--playable" : "",
		c ? "pcard--pressed" : "",
		l ? "pcard--playing" : "",
		h ? "pcard--illegal-shake" : "",
		_ ? "pcard--illegal-flash" : "",
		v ? "pcard--disabled" : ""
	].filter(Boolean).join(" ");
	if (t || !e) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: `${T} pcard--back`,
		"aria-label": "Face-down card",
		role: "img",
		children: /* @__PURE__ */ (0, g.jsxs)("span", {
			className: "pcard__surface pcard__surface--back",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, g.jsx)("span", { className: "pcard__back-pattern" }), /* @__PURE__ */ (0, g.jsx)("span", {
				className: "pcard__back-emblem",
				"aria-hidden": "true"
			})]
		})
	});
	let E = m(e.suit), D = d[e.suit], O = y ?? `${e.rank} of ${f[e.suit]}`, k = `pcard--suit-${e.suit}`, A = /* @__PURE__ */ (0, g.jsxs)("span", {
		className: "pcard__surface",
		"aria-hidden": "true",
		children: [
			i && /* @__PURE__ */ (0, g.jsx)("span", {
				className: "pcard__badge",
				children: i
			}),
			/* @__PURE__ */ (0, g.jsxs)("span", {
				className: "pcard__corner pcard__corner--tl",
				children: [/* @__PURE__ */ (0, g.jsx)("span", {
					className: "pcard__rank",
					children: e.rank
				}), /* @__PURE__ */ (0, g.jsx)("span", {
					className: "pcard__suit",
					children: D
				})]
			}),
			/* @__PURE__ */ (0, g.jsx)("span", {
				className: "pcard__center",
				children: D
			}),
			/* @__PURE__ */ (0, g.jsxs)("span", {
				className: "pcard__corner pcard__corner--br",
				children: [/* @__PURE__ */ (0, g.jsx)("span", {
					className: "pcard__rank",
					children: e.rank
				}), /* @__PURE__ */ (0, g.jsx)("span", {
					className: "pcard__suit",
					children: D
				})]
			})
		]
	});
	return w ? /* @__PURE__ */ (0, g.jsx)("button", {
		type: "button",
		className: `${T} ${E ? "pcard--red" : "pcard--black"} ${k}`,
		onClick: C && u && o ? (e) => {
			e.preventDefault(), o();
		} : C ? void 0 : a,
		disabled: v,
		"aria-disabled": v || void 0,
		"aria-busy": l || void 0,
		"aria-label": O,
		"data-testid": b,
		"data-card-index": x,
		"data-playable": S,
		...s,
		children: A
	}) : /* @__PURE__ */ (0, g.jsx)("div", {
		className: `${T} ${E ? "pcard--red" : "pcard--black"} ${k}`,
		role: "img",
		"aria-label": O,
		"aria-disabled": v || void 0,
		"data-testid": b,
		"data-card-index": x,
		"data-playable": S,
		children: A
	});
}
//#endregion
//#region src/components/cardGesture.ts
var v = {
	HOLD_MS: 220,
	TAP_MOVE_PX: 12,
	SWIPE_UP_PX: 28,
	SWIPE_FLICK_PX: 36,
	SCROLL_CANCEL_PX: 48
};
function y(e, t) {
	return Math.hypot(e, t) <= v.TAP_MOVE_PX;
}
function b(e, t) {
	let n = Math.abs(e), r = Math.abs(t);
	return t <= -v.SWIPE_UP_PX && r > n;
}
function x(e, t) {
	let n = Math.abs(e), r = Math.abs(t);
	return t > 0 && r > v.SCROLL_CANCEL_PX && r > n;
}
function S(e, t) {
	return x(e, t) ? !1 : b(e, t) ? !0 : Math.hypot(e, t) >= v.SWIPE_FLICK_PX;
}
function C(e, t, n) {
	return {
		pointerId: e,
		startX: t,
		startY: n,
		fired: !1
	};
}
//#endregion
//#region src/components/useCardGestureHandlers.ts
function w({ disabled: e = !1, mode: t, onPlay: n, onSelect: r, onPeekStart: i, onPeekEnd: a, onPressChange: o }) {
	let s = (0, l.useRef)({
		disabled: e,
		mode: t,
		onPlay: n,
		onSelect: r,
		onPeekStart: i,
		onPeekEnd: a,
		onPressChange: o
	});
	s.current = {
		disabled: e,
		mode: t,
		onPlay: n,
		onSelect: r,
		onPeekStart: i,
		onPeekEnd: a,
		onPressChange: o
	};
	let c = (0, l.useRef)(null), u = (0, l.useRef)(null), d = (0, l.useRef)(!1), f = () => {
		u.current != null && (window.clearTimeout(u.current), u.current = null);
	}, p = () => {
		d.current && (d.current = !1, s.current.onPeekEnd?.());
	}, m = (e) => {
		let t = c.current;
		!t || t.fired || (t.fired = !0, f(), p(), s.current.onPlay?.(e));
	}, h = () => {
		let e = c.current;
		!e || e.fired || (e.fired = !0, f(), p(), s.current.onSelect?.());
	};
	return (0, l.useMemo)(() => {
		let e = (e, t) => {
			if (e instanceof HTMLElement && e.hasPointerCapture(t)) try {
				e.releasePointerCapture(t);
			} catch {}
		}, t = (t) => {
			f();
			let n = c.current;
			n && e(t, n.pointerId), c.current = null, s.current.onPressChange?.(!1), p();
		};
		return {
			onPointerDown(e) {
				let t = s.current;
				if (!(t.disabled || t.mode === "none" || e.button !== 0)) {
					if (f(), c.current = C(e.pointerId, e.clientX, e.clientY), d.current = !1, t.onPressChange?.(!0), e.currentTarget.setPointerCapture(e.pointerId), e.preventDefault(), t.mode === "peek") {
						d.current = !0, t.onPeekStart?.();
						return;
					}
					t.mode === "play" && (u.current = window.setTimeout(() => {
						u.current = null, m("hold");
					}, v.HOLD_MS));
				}
			},
			onPointerMove(e) {
				let t = c.current, n = s.current;
				if (!t || t.pointerId !== e.pointerId || n.disabled) return;
				let r = e.clientX - t.startX, i = e.clientY - t.startY;
				if (n.mode === "play" && !t.fired) {
					if (x(r, i)) {
						f(), p();
						return;
					}
					S(r, i) && m("swipe-flick");
				}
			},
			onPointerUp(t) {
				let n = c.current, r = s.current;
				if (!n || n.pointerId !== t.pointerId) return;
				let i = t.clientX - n.startX, a = t.clientY - n.startY;
				f(), n.fired || (r.mode === "play" && y(i, a) ? m("tap") : r.mode === "draw-select" && y(i, a) && h()), e(t.currentTarget, t.pointerId), c.current = null, r.onPressChange?.(!1), p();
			},
			onPointerCancel(e) {
				let n = c.current;
				!n || n.pointerId !== e.pointerId || t(e.currentTarget);
			},
			onPointerLeave(e) {
				let n = c.current, r = s.current;
				!n || n.pointerId !== e.pointerId || r.mode === "play" || r.mode === "draw-select" || t(e.currentTarget);
			}
		};
	}, []);
}
//#endregion
//#region src/game/cardUtils.ts
function T(e) {
	return `${e.rank}:${e.suit}`;
}
function E(e) {
	return p[e.rank];
}
function D(e, t) {
	return e.suit === t;
}
function O(e, t) {
	return e.filter((e) => e.suit === t);
}
//#endregion
//#region src/components/handLayout.ts
function k(e, t, n, r) {
	let i = r?.minVisiblePx ?? 30, a = r?.maxGapPx ?? 6, o = Math.max(0, t), s = Math.max(0, e), c = Math.max(1, n);
	if (o <= 1 || s <= 0) return 0;
	let l = Math.max(8, c - i), u = c + a, d = (s - c) / (o - 1);
	return Math.round(Math.min(u, Math.max(l, d)) - c);
}
function A(e) {
	return e === "lg" ? 96 : e === "md" ? 72 : 52;
}
//#endregion
//#region src/components/handPlayInteraction.ts
function j(e) {
	let t = e.isPlayMode && e.isMyTurn && e.legalPlay && !e.busy, n = e.isPlayMode && !e.isMyTurn && e.allowPlayPreselect && e.legalPlay && !e.busy, r = t || n, i = e.cardState === "play-preselected" || e.cardState === "play-recommended";
	return {
		playInteractive: r,
		playableOutline: e.playableHintFor?.(e.index) ?? (t && !i && e.showPlayableHint !== !1)
	};
}
//#endregion
//#region src/components/Hand.tsx
var M = (e) => T(e);
function N({ card: e, index: t, size: n, state: r, badge: i, cardTestId: a, cardInteraction: o, onCardClick: s, onCardPeek: c, peekActive: u, slotClassFor: d, dealSeatPlayerId: f, style: p }) {
	let [m, h] = (0, l.useState)(!1), v = o, y = v?.mode === "play", b = v?.mode === "draw-select", x = v?.mode === "peek", S = v?.isMyTurn === !0, C = !v?.legalPlayIndices || v.legalPlayIndices.includes(t), { playInteractive: T, playableOutline: E } = j({
		isPlayMode: y,
		isMyTurn: S,
		legalPlay: C,
		busy: !!v?.busy,
		allowPlayPreselect: !!v?.allowPlayPreselect,
		cardState: r,
		playableHintFor: v?.playableHintFor,
		showPlayableHint: v?.showPlayableHint,
		index: t
	}), D = v?.playingIndex === t, O = y && S && !C && !v?.busy && !D, k = b && r === "draw-selected", A = b && r === "draw-recommended", M = r === "play-preselected", N = r === "play-recommended", ee = !!v?.busy || D || y && !S && !T || b && !S, te = ee || y && !C && !T || b && !S, P = w({
		disabled: ee || !T && !b && !x && !O,
		mode: O ? "draw-select" : v?.mode ?? "none",
		onPlay: T ? (e) => v?.onPlayCard?.(t, e) : void 0,
		onSelect: b && S ? () => v?.onSelectCard?.(t) : O ? () => v?.onIllegalPlay?.(t) : void 0,
		onPeekStart: x ? () => c?.(t) : void 0,
		onPeekEnd: x ? () => c?.(null) : void 0,
		onPressChange: h
	}), F = !!v && (v?.mode !== "none" || O), I = y && S ? T ? a : "play-button-disabled" : a;
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: [
			"hand__slot",
			u ? "hand__slot--peek" : "",
			k ? "hand__slot--draw-selected" : "",
			A ? "hand__slot--draw-recommended" : "",
			M ? "hand__slot--play-preselected" : "",
			N ? "hand__slot--play-recommended" : "",
			d?.(e, t) ?? ""
		].filter(Boolean).join(" "),
		style: p,
		"aria-selected": k || A ? !0 : void 0,
		"data-draw-hint": A ? "suggested" : k ? "selected" : void 0,
		"data-trick-play-origin-active": v?.playingIndex === t && v.trickPlayOriginPlayerId ? v.trickPlayOriginPlayerId : void 0,
		"data-deal-seat": f ?? void 0,
		"data-deal-round": f == null ? void 0 : t,
		children: /* @__PURE__ */ (0, g.jsx)(_, {
			card: e,
			size: n,
			state: te && y && !O ? "disabled" : r,
			badge: i,
			onClick: !F && s ? () => s(e, t) : void 0,
			onPlayClick: F && T ? () => v?.onPlayCard?.(t, "tap") : void 0,
			pointerHandlers: F ? P : void 0,
			pressed: m,
			playing: D,
			playable: E,
			illegalShake: v?.illegalShakeIndex === t,
			illegalFlash: v?.illegalFlashIndex === t,
			showPlayableHint: v?.showPlayableHint !== !1,
			disabled: ee && (y || b) && !O,
			"data-testid": I,
			"data-card-index": t,
			"data-playable": y ? T ? "true" : "false" : void 0
		})
	});
}
function ee({ cards: e, size: t = "md", stateFor: n, badgeFor: r, onCardClick: i, onCardPeek: a, peekIndex: o = null, fan: s = !1, cardTestId: c, cardInteraction: u, slotClassFor: d, dealSeatPlayerId: f = null }) {
	let p = (0, l.useRef)(null);
	return (0, l.useLayoutEffect)(() => {
		if (!s || typeof window > "u") return;
		let n = p.current;
		if (!n) return;
		let r = A(t), i = () => {
			let t = k(n.clientWidth, e.length, r);
			n.style.setProperty("--hand-fan-overlap", `${t}px`), n.style.setProperty("--hand-card-w", `${r}px`);
		}, a = new ResizeObserver(i);
		return a.observe(n), i(), () => a.disconnect();
	}, [
		s,
		e.length,
		t
	]), /* @__PURE__ */ (0, g.jsx)("div", {
		ref: p,
		className: `hand ${s ? "hand--fan" : ""} ${u ? "hand--pointer" : ""}`,
		style: s ? { "--hand-count": e.length } : void 0,
		children: /* @__PURE__ */ (0, g.jsx)("div", {
			className: "hand__fan-stage",
			children: e.map((e, l) => /* @__PURE__ */ (0, g.jsx)(N, {
				card: e,
				index: l,
				style: s ? { "--card-i": l } : void 0,
				size: t,
				state: n?.(e, l) ?? "default",
				badge: r?.(e, l),
				fan: s,
				cardTestId: c,
				cardInteraction: u,
				onCardClick: i,
				onCardPeek: a,
				peekActive: o === l,
				slotClassFor: d,
				dealSeatPlayerId: f
			}, M(e)))
		})
	});
}
//#endregion
//#region src/table/animations/motionTokens.ts
var te = "power3.out", P = "power2.inOut", F = "back.out(1.35)", I = {
	deal: .72,
	dealStagger: .13,
	playToTable: .66,
	drawDiscard: .4,
	drawReceive: .68,
	drawReceiveStagger: .095,
	trumpReveal: .64,
	trumpMerge: .62,
	standPat: .68,
	foldOut: .56,
	hoverLift: .38
};
function ne(e = R()) {
	return e ? .35 : 1;
}
function L(e, t = R()) {
	return Math.max(.12, e * ne(t));
}
function R() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region node_modules/gsap/gsap-core.js
function z(e) {
	if (e === void 0) throw ReferenceError("this hasn't been initialised - super() hasn't been called");
	return e;
}
function B(e, t) {
	e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t;
}
var V = {
	autoSleep: 120,
	force3D: "auto",
	nullTargetWarn: 1,
	units: { lineHeight: "" }
}, H = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, re, ie, U, ae = 1e8, oe = 1 / ae, se = Math.PI * 2, ce = se / 4, le = 0, ue = Math.sqrt, de = Math.cos, fe = Math.sin, pe = function(e) {
	return typeof e == "string";
}, W = function(e) {
	return typeof e == "function";
}, me = function(e) {
	return typeof e == "number";
}, he = function(e) {
	return e === void 0;
}, ge = function(e) {
	return typeof e == "object";
}, _e = function(e) {
	return e !== !1;
}, ve = function() {
	return typeof window < "u";
}, ye = function(e) {
	return W(e) || pe(e);
}, be = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, xe = Array.isArray, Se = /(?:-?\.?\d|\.)+/gi, Ce = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, we = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, Te = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, Ee = /[+-]=-?[.\d]+/, De = /[^,'"\[\]\s]+/gi, Oe = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, G, ke, Ae, je, Me = {}, Ne = {}, Pe, Fe = function(e) {
	return (Ne = dt(e, Me)) && Mr;
}, Ie = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, K = function(e, t) {
	return !t && console.warn(e);
}, Le = function(e, t) {
	return e && (Me[e] = t) && Ne && (Ne[e] = t) || Me;
}, Re = function() {
	return 0;
}, ze = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, Be = {
	suppressEvents: !0,
	kill: !1
}, Ve = { suppressEvents: !0 }, He = {}, Ue = [], We = {}, Ge, Ke = {}, qe = {}, Je = 30, Ye = [], Xe = "", Ze = function(e) {
	var t = e[0], n, r;
	if (ge(t) || W(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = Ye.length; r-- && !Ye[r].targetTest(t););
		n = Ye[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new Hn(e[r], n))) || e.splice(r, 1);
	return e;
}, Qe = function(e) {
	return e._gsap || Ze(Jt(e))[0]._gsap;
}, $e = function(e, t, n) {
	return (n = e[t]) && W(n) ? e[t]() : he(n) && e.getAttribute && e.getAttribute(t) || n;
}, et = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, tt = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, nt = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, rt = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, it = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, at = function() {
	var e = Ue.length, t = Ue.slice(0), n, r;
	for (We = {}, Ue.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, ot = function(e, t, n, r) {
	Ue.length && !ie && at(), e.render(t, n, r || ie && t < 0 && (e._initted || e._startAt)), Ue.length && !ie && at();
}, st = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(De).length < 2 ? t : pe(e) ? e.trim() : e;
}, ct = function(e) {
	return e;
}, lt = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, ut = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, dt = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, ft = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = ge(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, pt = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, mt = function(e) {
	var t = e.parent || G, n = e.keyframes ? ut(xe(e.keyframes)) : lt;
	if (_e(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, ht = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, gt = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, _t = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, vt = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, yt = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, bt = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, xt = function(e, t, n, r) {
	return e._startAt && (ie ? e._startAt.revert(Be) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, St = function e(t) {
	return !t || t._ts && e(t.parent);
}, Ct = function(e) {
	return e._repeat ? wt(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, wt = function(e, t) {
	var n = Math.floor(e = nt(e / t));
	return e && n === e ? n - 1 : n;
}, Tt = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, Et = function(e) {
	return e._end = nt(e._start + (e._tDur / Math.abs(e._ts || e._rts || oe) || 0));
}, Dt = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = nt(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), Et(e), n._dirty || yt(n, e)), e;
}, Ot = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = Tt(e.rawTime(), t), (!t._dur || Ht(0, t.totalDuration(), n) - t._tTime > oe) && t.render(n, !0)), yt(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -oe;
	}
}, kt = function(e, t, n, r) {
	return t.parent && vt(t), t._start = nt((me(n) ? n : n || e !== G ? zt(e, n, t) : e._time) + t._delay), t._end = nt(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), gt(e, t, "_first", "_last", e._sort ? "_start" : 0), Nt(t) || (e._recent = t), r || Ot(e, t), e._ts < 0 && Dt(e, e._tTime), e;
}, At = function(e, t) {
	return (Me.ScrollTrigger || Ie("scrollTrigger", t)) && Me.ScrollTrigger.create(t, e);
}, jt = function(e, t, n, r, i) {
	if (Zn(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !ie && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && Ge !== Dn.frame) return Ue.push(e), e._lazy = [i, r], 1;
}, Mt = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, Nt = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, Pt = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && Mt(e) && !(!e._initted && Nt(e)) || (e._ts < 0 || e._dp._ts < 0) && !Nt(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = Ht(0, e._tDur, t), l = wt(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== wt(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || ie || r || e._zTime === oe || !t && e._zTime) {
		if (!e._initted && jt(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? oe : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && xt(e, t, n, !0), e._onUpdate && !n && fn(e, "onUpdate"), s && e._repeat && !n && e.parent && fn(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && vt(e, 1), !n && !ie && (fn(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, Ft = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, It = function(e, t, n, r) {
	var i = e._repeat, a = nt(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : nt(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && Dt(e, e._tTime = e._tDur * o), e.parent && Et(e), n || yt(e.parent, e), e;
}, Lt = function(e) {
	return e instanceof Wn ? yt(e) : It(e, e._dur);
}, Rt = {
	_start: 0,
	endTime: Re,
	totalDuration: Re
}, zt = function e(t, n, r) {
	var i = t.labels, a = t._recent || Rt, o = t.duration() >= ae ? a.endTime(!1) : t._dur, s, c, l;
	return pe(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (xe(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, Bt = function(e, t, n) {
	var r = me(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = _e(s.vars.inherit) && s.parent;
		a.immediateRender = _e(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new ir(t[0], a, t[i + 1]);
}, Vt = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, Ht = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, Ut = function(e, t) {
	return !pe(e) || !(t = Oe.exec(e)) ? "" : t[1];
}, Wt = function(e, t, n) {
	return Vt(n, function(n) {
		return Ht(e, t, n);
	});
}, Gt = [].slice, Kt = function(e, t) {
	return e && ge(e) && "length" in e && (!t && !e.length || e.length - 1 in e && ge(e[0])) && !e.nodeType && e !== ke;
}, qt = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return pe(e) && !t || Kt(e, 1) ? (r = n).push.apply(r, Jt(e)) : n.push(e);
	}) || n;
}, Jt = function(e, t, n) {
	return U && !t && U.selector ? U.selector(e) : pe(e) && !n && (Ae || !On()) ? Gt.call((t || je).querySelectorAll(e), 0) : xe(e) ? qt(e, n) : Kt(e) ? Gt.call(e, 0) : e ? [e] : [];
}, Yt = function(e) {
	return e = Jt(e)[0] || K("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return Jt(t, n.querySelectorAll ? n : n === e ? K("Invalid scope") || je.createElement("div") : e);
	};
}, Xt = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, Zt = function(e) {
	if (W(e)) return e;
	var t = ge(e) ? e : { each: e }, n = Ln(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return pe(r) ? l = u = {
		center: .5,
		edges: .5,
		end: 1
	}[r] || 0 : !o && s && (l = r[0], u = r[1]), function(e, o, d) {
		var f = (d || t).length, p = a[f], m, h, g, _, v, y, b, x, S;
		if (!p) {
			if (S = t.grid === "auto" ? 0 : (t.grid || [1, ae])[1], !S) {
				for (b = -ae; b < (b = d[S++].getBoundingClientRect().left) && S < f;);
				S < f && S--;
			}
			for (p = a[f] = [], m = s ? Math.min(S, f) * l - .5 : r % S, h = S === ae ? 0 : s ? f * u / S - .5 : r / S | 0, b = 0, x = ae, y = 0; y < f; y++) g = y % S - m, _ = h - (y / S | 0), p[y] = v = c ? Math.abs(c === "y" ? _ : g) : ue(g * g + _ * _), v > b && (b = v), v < x && (x = v);
			r === "random" && Xt(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = Ut(t.amount || t.each) || 0, n = n && f < 0 ? Fn(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, nt(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, Qt = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = nt(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (me(n) ? 0 : Ut(n));
	};
}, $t = function(e, t) {
	var n = xe(e), r, i;
	return !n && ge(e) && (r = n = e.radius || ae, e.values ? (e = Jt(e.values), (i = !me(e[0])) && (r *= r)) : e = Qt(e.increment)), Vt(t, n ? W(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = ae, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || me(t) ? s : s + Ut(t);
	} : Qt(e));
}, en = function(e, t, n, r) {
	return Vt(xe(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return xe(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, tn = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, nn = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || Ut(n));
	};
}, rn = function(e, t, n) {
	return ln(e, t, 0, 1, n);
}, an = function(e, t, n) {
	return Vt(n, function(n) {
		return e[~~t(n)];
	});
}, on = function e(t, n, r) {
	var i = n - t;
	return xe(t) ? an(t, e(0, t.length), n) : Vt(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, sn = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return xe(t) ? an(t, e(0, t.length - 1), n) : Vt(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, cn = function(e) {
	for (var t = 0, n = "", r, i, a, o; ~(r = e.indexOf("random(", t));) a = e.indexOf(")", r), o = e.charAt(r + 7) === "[", i = e.substr(r + 7, a - r - 7).match(o ? De : Se), n += e.substr(t, r - t) + en(o ? i : +i[0], o ? 0 : +i[1], +i[2] || 1e-5), t = a + 1;
	return n + e.substr(t, e.length - t);
}, ln = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return Vt(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, un = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = pe(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (xe(t) && !xe(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = dt(xe(t) ? [] : {}, t));
		if (!u) {
			for (c in n) Kn.call(s, t, c, "get", n[c]);
			a = function(e) {
				return pr(e, s) || (o ? t.p : t);
			};
		}
	}
	return Vt(r, a);
}, dn = function(e, t, n) {
	var r = e.labels, i = ae, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, fn = function(e, t, n) {
	var r = e.vars, i = r[t], a = U, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && Ue.length && at(), o && (U = o), l = s ? i.apply(c, s) : i.call(c), U = a, l;
}, pn = function(e) {
	return vt(e), e.scrollTrigger && e.scrollTrigger.kill(!!ie), e.progress() < 1 && fn(e, "onInterrupt"), e;
}, mn, hn = [], gn = function(e) {
	if (e) if (e = !e.name && e.default || e, ve() || e.headless) {
		var t = e.name, n = W(e), r = t && !n && e.init ? function() {
			this._props = [];
		} : e, i = {
			init: Re,
			render: pr,
			add: Kn,
			kill: hr,
			modifier: mr,
			rawVars: 0
		}, a = {
			targetTest: 0,
			get: 0,
			getSetter: lr,
			aliases: {},
			register: 0
		};
		if (On(), e !== r) {
			if (Ke[t]) return;
			lt(r, lt(pt(e, i), a)), dt(r.prototype, dt(i, pt(e, a))), Ke[r.prop = t] = r, e.targetTest && (Ye.push(r), He[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
		}
		Le(t, r), e.register && e.register(Mr, r, vr);
	} else hn.push(e);
}, _n = 255, vn = {
	aqua: [
		0,
		_n,
		_n
	],
	lime: [
		0,
		_n,
		0
	],
	silver: [
		192,
		192,
		192
	],
	black: [
		0,
		0,
		0
	],
	maroon: [
		128,
		0,
		0
	],
	teal: [
		0,
		128,
		128
	],
	blue: [
		0,
		0,
		_n
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		_n,
		_n,
		_n
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		_n,
		_n,
		0
	],
	orange: [
		_n,
		165,
		0
	],
	gray: [
		128,
		128,
		128
	],
	purple: [
		128,
		0,
		128
	],
	green: [
		0,
		128,
		0
	],
	red: [
		_n,
		0,
		0
	],
	pink: [
		_n,
		192,
		203
	],
	cyan: [
		0,
		_n,
		_n
	],
	transparent: [
		_n,
		_n,
		_n,
		0
	]
}, yn = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * _n + .5 | 0;
}, bn = function(e, t, n) {
	var r = e ? me(e) ? [
		e >> 16,
		e >> 8 & _n,
		e & _n
	] : 0 : vn.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), vn[e]) r = vn[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & _n,
				r & _n,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & _n,
				e & _n
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(Se), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = yn(s + 1 / 3, i, a), r[1] = yn(s, i, a), r[2] = yn(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(Ce), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(Se) || vn.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / _n, a = r[1] / _n, o = r[2] / _n, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, xn = function(e) {
	var t = [], n = [], r = -1;
	return e.split(Cn).forEach(function(e) {
		var i = e.match(we) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, Sn = function(e, t, n) {
	var r = "", i = (e + r).match(Cn), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = bn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = xn(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(Cn, "1").split(we), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(Cn), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, Cn = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in vn) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), wn = /hsl[a]?\(/, Tn = function(e) {
	var t = e.join(" "), n;
	if (Cn.lastIndex = 0, Cn.test(t)) return n = wn.test(t), e[1] = Sn(e[1], n), e[0] = Sn(e[0], n, xn(e[1])), !0;
}, En, Dn = function() {
	var e = Date.now, t = 500, n = 33, r = e(), i = r, a = 1e3 / 240, o = a, s = [], c, l, u, d, f, p, m = function u(m) {
		var h = e() - i, g = m === !0, _, v, y, b;
		if ((h > t || h < 0) && (r += h - n), i += h, y = i - r, _ = y - o, (_ > 0 || g) && (b = ++d.frame, f = y - d.time * 1e3, d.time = y /= 1e3, o += _ + (_ >= a ? 4 : a - _), v = 1), g || (c = l(u)), v) for (p = 0; p < s.length; p++) s[p](y, f, b, m);
	};
	return d = {
		time: 0,
		frame: 0,
		tick: function() {
			m(!0);
		},
		deltaRatio: function(e) {
			return f / (1e3 / (e || 60));
		},
		wake: function() {
			Pe && (!Ae && ve() && (ke = Ae = window, je = ke.document || {}, Me.gsap = Mr, (ke.gsapVersions ||= []).push(Mr.version), Fe(Ne || ke.GreenSockGlobals || !ke.gsap && ke || {}), hn.forEach(gn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, En = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), En = 0, l = Re;
		},
		lagSmoothing: function(e, r) {
			t = e || Infinity, n = Math.min(r || 33, t);
		},
		fps: function(e) {
			a = 1e3 / (e || 240), o = d.time * 1e3 + a;
		},
		add: function(e, t, n) {
			var r = t ? function(t, n, i, a) {
				e(t, n, i, a), d.remove(r);
			} : e;
			return d.remove(e), s[n ? "unshift" : "push"](r), On(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), On = function() {
	return !En && Dn.wake();
}, kn = {}, An = /^[\d.\-M][\d.\-,\s]/, jn = /["']/g, Mn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(jn, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, Nn = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, Pn = function(e) {
	var t = (e + "").split("("), n = kn[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [Mn(t[1])] : Nn(e).split(",").map(st)) : kn._CE && An.test(e) ? kn._CE("", e) : n;
}, Fn = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, In = function e(t, n) {
	for (var r = t._first, i; r;) r instanceof Wn ? e(r, n) : r.vars.yoyoEase && (!r._yoyo || !r._repeat) && r._yoyo !== n && (r.timeline ? e(r.timeline, n) : (i = r._ease, r._ease = r._yEase, r._yEase = i, r._yoyo = n)), r = r._next;
}, Ln = function(e, t) {
	return e && (W(e) ? e : kn[e] || Pn(e)) || t;
}, Rn = function(e, t, n, r) {
	n === void 0 && (n = function(e) {
		return 1 - t(1 - e);
	}), r === void 0 && (r = function(e) {
		return e < .5 ? t(e * 2) / 2 : 1 - t((1 - e) * 2) / 2;
	});
	var i = {
		easeIn: t,
		easeOut: n,
		easeInOut: r
	}, a;
	return et(e, function(e) {
		for (var t in kn[e] = Me[e] = i, kn[a = e.toLowerCase()] = n, i) kn[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = kn[e + "." + t] = i[t];
	}), i;
}, zn = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, Bn = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / se * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * fe((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : zn(s);
	return a = se / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, Vn = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : zn(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
et("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	Rn(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), kn.Linear.easeNone = kn.none = kn.Linear.easeIn, Rn("Elastic", Bn("in"), Bn("out"), Bn()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	Rn("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), Rn("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), Rn("Circ", function(e) {
	return -(ue(1 - e * e) - 1);
}), Rn("Sine", function(e) {
	return e === 1 ? 1 : -de(e * ce) + 1;
}), Rn("Back", Vn("in"), Vn("out"), Vn()), kn.SteppedEase = kn.steps = Me.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - oe;
	return function(e) {
		return ((r * Ht(0, a, e) | 0) + i) * n;
	};
} }, H.ease = kn["quad.out"], et("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return Xe += e + "," + e + "Params,";
});
var Hn = function(e, t) {
	this.id = le++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : $e, this.set = t ? t.getSetter : lr;
}, Un = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, It(this, +e.duration, 1, 1), this.data = e.data, U && (this._ctx = U, U.data.push(this)), En || Dn.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, It(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (On(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (Dt(this, e), !n._dp || n.parent || Ot(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && kt(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === oe || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), ot(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + Ct(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + Ct(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? wt(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -oe ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? Tt(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -oe ? 0 : this._rts, this.totalTime(Ht(-Math.abs(this._delay), this._tDur, n), t !== !1), Et(this), bt(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (On(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== oe && (this._tTime -= oe)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = e;
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && kt(t, this, e - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (_e(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? Tt(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = Ve);
		var t = ie;
		return ie = e, (this._initted || this._startAt) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), ie = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, Lt(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, Lt(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(zt(this, e), _e(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, _e(t)), this._dur || (this._zTime = -oe), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -oe : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -oe, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - oe);
	}, t.eventCallback = function(e, t, n) {
		var r = this.vars;
		return arguments.length > 1 ? (t ? (r[e] = t, n && (r[e + "Params"] = n), e === "onUpdate" && (this._onUpdate = t)) : delete r[e], this) : r[e];
	}, t.then = function(e) {
		var t = this;
		return new Promise(function(n) {
			var r = W(e) ? e : ct, i = function() {
				var e = t.then;
				t.then = null, W(r) && (r = r(t)) && (r.then || r === t) && (t.then = e), n(r), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? i() : t._prom = i;
		});
	}, t.kill = function() {
		pn(this);
	}, e;
}();
lt(Un.prototype, {
	_time: 0,
	_start: 0,
	_end: 0,
	_tTime: 0,
	_tDur: 0,
	_dirty: 0,
	_repeat: 0,
	_yoyo: !1,
	parent: null,
	_initted: !1,
	_rDelay: 0,
	_ts: 1,
	_dp: 0,
	ratio: 0,
	_zTime: -oe,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var Wn = /*#__PURE__*/ function(e) {
	B(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = _e(t.sortChildren), G && kt(t.parent || G, z(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && At(z(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return Bt(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return Bt(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return Bt(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, mt(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new ir(e, t, zt(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return kt(this, ir.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new ir(e, n, zt(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, mt(n).immediateRender = _e(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, mt(r).immediateRender = _e(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : nt(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== G && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = nt(o % f), o === i ? (d = this._repeat, c = a) : (_ = nt(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = wt(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : nt(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && fn(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
					In(this, y);
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = Ft(this, nt(r), nt(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && c && !t && !d && (fn(this, "onStart"), this._tTime !== o)) return this;
			if (c >= r && e >= 0) for (l = this._first; l;) {
				if (u = l._next, (l._act || c >= l._start) && l._ts && m !== l) {
					if (l.parent !== this) return this.render(e, t, n);
					if (l.render(l._ts > 0 ? (c - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (c - l._start) * l._ts, t, n), c !== this._time || !this._ts && !p) {
						m = 0, u && (o += this._zTime = -oe);
						break;
					}
				}
				l = u;
			}
			else {
				l = this._last;
				for (var S = e < 0 ? e : c; l;) {
					if (u = l._prev, (l._act || S <= l._end) && l._ts && m !== l) {
						if (l.parent !== this) return this.render(e, t, n);
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || ie && (l._initted || l._startAt)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -oe : oe);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -oe)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, Et(this), this.render(e, t, n);
			this._onUpdate && !t && fn(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && vt(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (fn(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (me(t) || (t = zt(this, t, e)), !(e instanceof Un)) {
			if (xe(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (pe(e)) return this.addLabel(e, t);
			if (W(e)) e = ir.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : kt(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -ae);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof ir ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return pe(e) ? this.removeLabel(e) : W(e) ? this.killTweensOf(e) : (e.parent === this && _t(this, e), e === this._recent && (this._recent = this._last), yt(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = nt(Dn.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = zt(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = ir.delayedCall(0, t || Re, n);
		return r.data = "isPause", this._hasPause = 1, kt(this, r, zt(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = zt(this, e); t;) t._start === e && t.data === "isPause" && vt(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) Yn !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = Jt(e), i = this._first, a = me(t), o; i;) i instanceof ir ? it(i._targets, r) && (a ? (!Yn || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = zt(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = ir.to(n, lt({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || oe,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && It(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, lt({ startAt: { time: zt(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), dn(this, zt(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), dn(this, zt(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + oe);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		for (var r = this._first, i = this.labels, a; r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return yt(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), yt(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = ae, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, kt(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += o / n._ts, n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			It(n, n === G && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (G._ts && (ot(G, Tt(e, G)), Ge = Dn.frame), Dn.frame >= Je) {
			Je += V.autoSleep || 120;
			var t = G._first;
			if ((!t || !t._ts) && V.autoSleep && Dn._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || Dn.sleep();
			}
		}
	}, t;
}(Un);
lt(Wn.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var Gn = function(e, t, n, r, i, a, o) {
	var s = new vr(this._pt, e, t, 0, 1, fr, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = cn(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(Te) || []; u = Te.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? rt(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = Te.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (Ee.test(r) || g) && (s.e = 0), this._pt = s, s;
}, Kn = function(e, t, n, r, i, a, o, s, c, l) {
	W(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? W(u) ? c ? e[t.indexOf("set") || !W(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = W(u) ? c ? sr : or : ar, p;
	if (pe(r) && (~r.indexOf("random(") && (r = cn(r)), r.charAt(1) === "=" && (p = rt(d, r) + (Ut(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || Xn) return !isNaN(d * r) && r !== "" ? (p = new vr(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? dr : ur, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && Ie(t, r), Gn.call(this, e, t, d, r, f, s || V.stringFilter, c));
}, qn = function(e, t, n, r, i) {
	if (W(e) && (e = tr(e, i, t, n, r)), !ge(e) || e.style && e.nodeType || xe(e) || be(e)) return pe(e) ? tr(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = tr(e[o], i, t, n, r);
	return a;
}, Jn = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (Ke[e] && (o = new Ke[e]()).init(i, o.rawVars ? t[e] : qn(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new vr(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== mn)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, Yn, Xn, Zn = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !re, b = t.timeline, x, S, C, w, T, E, D, O, k, A, j, M, N;
	if (b && (!f || !a) && (a = "none"), t._ease = Ln(a, H.ease), t._yEase = d ? Fn(Ln(d === !0 ? a : d, H.ease)) : 0, d && t._yoyo && !t._repeat && (d = t._yEase, t._yEase = t._ease, t._ease = d), t._from = !b && !!i.runBackwards, !b || f && !i.stagger) {
		if (O = g[0] ? Qe(g[0]).harness : 0, M = O && i[O.prop], x = pt(i, He), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? Be : ze), h._lazy = 0), o) {
			if (vt(t._startAt = ir.set(g, lt({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && _e(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return fn(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (ie || !s && !p) && t._startAt.revert(Be), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), C = lt({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && _e(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, x), M && (C[O.prop] = M), vt(t._startAt = ir.set(g, C)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (ie ? t._startAt.revert(Be) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, oe, oe);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && _e(c) || c && !m, S = 0; S < g.length; S++) {
			if (T = g[S], D = T._gsap || Ze(g)[S]._gsap, t._ptLookup[S] = A = {}, We[D.id] && Ue.length && at(), j = v === g ? S : v.indexOf(T), O && (k = new O()).init(T, M || x, t, j, v) !== !1 && (t._pt = w = new vr(t._pt, T, k.name, 0, 1, k.render, k, 0, k.priority), k._props.forEach(function(e) {
				A[e] = w;
			}), k.priority && (E = 1)), !O || M) for (C in x) Ke[C] && (k = Jn(C, x, t, j, T, v)) ? k.priority && (E = 1) : A[C] = w = Kn.call(t, T, C, "get", x[C], j, v, 0, i.stringFilter);
			t._op && t._op[S] && t.kill(T, t._op[S]), y && t._pt && (Yn = t, G.killTweensOf(T, A, t.globalTime(n)), N = !t.parent, Yn = 0), t._pt && c && (We[D.id] = 1);
		}
		E && _r(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !N, f && n <= 0 && b.render(ae, !0, !0);
}, Qn = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return Xn = 1, e.vars[t] = "+=0", Zn(e, o), Xn = 0, s ? K(t + " not eligible for reset") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e &&= tt(n) + Ut(u.e), u.b &&= l.s + Ut(u.b);
}, $n = function(e, t) {
	var n = e[0] ? Qe(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = dt({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, er = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (xe(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
		return o.push({
			t: n / (t.length - 1) * 100,
			v: e,
			e: i
		});
	});
	else for (a in t) o = n[a] || (n[a] = []), a === "ease" || o.push({
		t: parseFloat(e),
		v: t[a],
		e: i
	});
}, tr = function(e, t, n, r, i) {
	return W(e) ? e.call(t, n, r, i) : pe(e) && ~e.indexOf("random(") ? cn(e) : e;
}, nr = Xe + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", rr = {};
et(nr + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return rr[e] = 1;
});
var ir = /*#__PURE__*/ function(e) {
	B(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : mt(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = o.yoyoEase, g = n.parent || G, _ = (xe(t) || be(t) ? me(t[0]) : "length" in n) ? [t] : Jt(t), v, y, b, x, S, C, w, T;
		if (a._targets = _.length ? Ze(_) : K("GSAP target " + t + " not found. https://gsap.com", !V.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || ye(s) || ye(c)) {
			if (n = a.vars, v = a.timeline = new Wn({
				data: "nested",
				defaults: p || {},
				targets: g && g.data === "nested" ? g.vars.targets : _
			}), v.kill(), v.parent = v._dp = z(a), v._start = 0, u || ye(s) || ye(c)) {
				if (x = _.length, w = u && Zt(u), ge(u)) for (S in u) ~nr.indexOf(S) && (T ||= {}, T[S] = u[S]);
				for (y = 0; y < x; y++) b = pt(n, rr), b.stagger = 0, h && (b.yoyoEase = h), T && dt(b, T), C = _[y], b.duration = +tr(s, z(a), y, C, _), b.delay = (+tr(c, z(a), y, C, _) || 0) - a._delay, !u && x === 1 && b.delay && (a._delay = c = b.delay, a._start += c, b.delay = 0), v.to(C, b, w ? w(y, C, _) : 0), v._ease = kn.none;
				v.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				mt(lt(v.vars.defaults, { ease: "none" })), v._ease = Ln(f.ease || n.ease || "none");
				var E = 0, D, O, k;
				if (xe(f)) f.forEach(function(e) {
					return v.to(_, e, ">");
				}), v.duration();
				else {
					for (S in b = {}, f) S === "ease" || S === "easeEach" || er(S, f[S], b, f.easeEach);
					for (S in b) for (D = b[S].sort(function(e, t) {
						return e.t - t.t;
					}), E = 0, y = 0; y < D.length; y++) O = D[y], k = {
						ease: O.e,
						duration: (O.t - (y ? D[y - 1].t : 0)) / 100 * s
					}, k[S] = O.v, v.to(_, k, E), E += k.duration;
					v.duration() < s && v.to({}, { duration: s - v.duration() });
				}
			}
			s || a.duration(s = v.duration());
		} else a.timeline = 0;
		return d === !0 && !re && (Yn = z(a), G.killTweensOf(_), Yn = 0), kt(g, z(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === nt(g._time) && _e(l) && St(z(a)) && g.data !== "nested") && (a._tTime = -oe, a.render(Math.max(0, -c) || 0)), m && At(z(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - oe && !o ? i : e < oe ? 0 : e, c, l, u, d, f, p, m, h, g;
		if (!a) Pt(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = nt(s % d), s === i ? (u = this._repeat, c = a) : (f = nt(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (g = this._yEase, c = a - c), f = wt(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && (h && this._yEase && In(h, p), this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(nt(d * u), !0).invalidate()._lock = 0));
			}
			if (!this._initted) {
				if (jt(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
				if (r !== this._time && !(n && this.vars.repeatRefresh && u !== f)) return this;
				if (a !== this._dur) return this.render(e, t, n);
			}
			if (this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), this.ratio = m = (g || this._ease)(c / a), this._from && (this.ratio = m = 1 - m), c && !r && !t && !u && (fn(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && xt(this, e, t, n), fn(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && fn(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && xt(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && vt(this, 1), !t && !(o && !r) && (s || r || p) && (fn(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		En || Dn.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || Zn(this, a), o = this._ease(a / this._dur), Qn(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (Dt(this, 0), this.parent || gt(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? pn(this) : this.scrollTrigger && this.scrollTrigger.kill(!!ie), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, Yn && Yn.vars.overwrite !== !0)._first || pn(this), this.parent && n !== this.timeline.totalDuration() && It(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? Jt(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && ht(r, i)) return t === "all" && (this._pt = 0), pn(this);
		for (s = this._op = this._op || [], t !== "all" && (pe(t) && (d = {}, et(t, function(e) {
			return d[e] = 1;
		}), t = d), t = $n(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && _t(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && pn(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return Bt(1, arguments);
	}, t.delayedCall = function(e, n, r, i) {
		return new t(n, 0, {
			immediateRender: !1,
			lazy: !1,
			overwrite: !1,
			delay: e,
			onComplete: n,
			onReverseComplete: n,
			onCompleteParams: r,
			onReverseCompleteParams: r,
			callbackScope: i
		});
	}, t.fromTo = function(e, t, n) {
		return Bt(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return G.killTweensOf(e, t, n);
	}, t;
}(Un);
lt(ir.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), et("staggerTo,staggerFrom,staggerFromTo", function(e) {
	ir[e] = function() {
		var t = new Wn(), n = Gt.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var ar = function(e, t, n) {
	return e[t] = n;
}, or = function(e, t, n) {
	return e[t](n);
}, sr = function(e, t, n, r) {
	return e[t](r.fp, n);
}, cr = function(e, t, n) {
	return e.setAttribute(t, n);
}, lr = function(e, t) {
	return W(e[t]) ? or : he(e[t]) && e.setAttribute ? cr : ar;
}, ur = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, dr = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, fr = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, pr = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, mr = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, hr = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? _t(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, gr = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, _r = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, vr = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || ur, this.d = o || this, this.set = s || ar, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = gr, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
et(Xe + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(e) {
	return He[e] = 1;
}), Me.TweenMax = Me.TweenLite = ir, Me.TimelineLite = Me.TimelineMax = Wn, G = new Wn({
	sortChildren: !1,
	defaults: H,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), V.stringFilter = Tn;
var yr = [], br = {}, xr = [], Sr = 0, Cr = 0, wr = function(e) {
	return (br[e] || xr).map(function(e) {
		return e();
	});
}, Tr = function() {
	var e = Date.now(), t = [];
	e - Sr > 2 && (wr("matchMediaInit"), yr.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = ke.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), wr("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), Sr = e, wr("matchMedia"));
}, Er = /*#__PURE__*/ function() {
	function e(e, t) {
		this.selector = t && Yt(t), this.data = [], this._r = [], this.isReverted = !1, this.id = Cr++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		W(e) && (n = t, t = e, e = W);
		var r = this, i = function() {
			var e = U, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = Yt(n)), U = r, a = t.apply(r, arguments), W(a) && r._r.push(a), U = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === W ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = U;
		U = null, e(this), U = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof ir && !(n.parent && n.parent.data === "nested") && t.push(n);
		}), t;
	}, t.clear = function() {
		this._r.length = this.data.length = 0;
	}, t.kill = function(e, t) {
		var n = this;
		if (e ? (function() {
			for (var t = n.getTweens(), r = n.data.length, i; r--;) i = n.data[r], i.data === "isFlip" && (i.revert(), i.getChildren(!0, !0, !1).forEach(function(e) {
				return t.splice(t.indexOf(e), 1);
			}));
			for (t.map(function(e) {
				return {
					g: e._dur || e._delay || e._sat && !e._sat.vars.immediateRender ? e.globalTime(0) : -Infinity,
					t: e
				};
			}).sort(function(e, t) {
				return t.g - e.g || -Infinity;
			}).forEach(function(t) {
				return t.t.revert(e);
			}), r = n.data.length; r--;) i = n.data[r], i instanceof Wn ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof ir) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = yr.length; r--;) yr[r].id === this.id && yr.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), Dr = /*#__PURE__*/ function() {
	function e(e) {
		this.contexts = [], this.scope = e, U && U.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		ge(e) || (e = { matches: e });
		var r = new Er(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in U && !r.selector && (r.selector = U.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = ke.matchMedia(e[o]), a && (yr.indexOf(r) < 0 && yr.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(Tr) : a.addEventListener("change", Tr)));
		return s && t(r, function(e) {
			return r.add(null, e);
		}), this;
	}, t.revert = function(e) {
		this.kill(e || {});
	}, t.kill = function(e) {
		this.contexts.forEach(function(t) {
			return t.kill(e, !0);
		});
	}, e;
}(), Or = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return gn(e);
		});
	},
	timeline: function(e) {
		return new Wn(e);
	},
	getTweensOf: function(e, t) {
		return G.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		pe(e) && (e = Jt(e)[0]);
		var i = Qe(e || {}).get, a = n ? ct : st;
		return n === "native" && (n = ""), e && (t ? a((Ke[t] && Ke[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((Ke[t] && Ke[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = Jt(e), e.length > 1) {
			var r = e.map(function(e) {
				return Mr.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = Ke[t], o = Qe(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			mn._pt = 0, r.init(e, n ? t + n : t, mn, 0, [e]), r.render(1, r), mn._pt && pr(1, mn);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = Mr.to(e, lt((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return G.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = Ln(e.ease, H.ease)), ft(H, e || {});
	},
	config: function(e) {
		return ft(V, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !Ke[e] && !Me[e] && K(t + " effect requires " + e + " plugin.");
		}), qe[t] = function(e, t, r) {
			return n(Jt(e), lt(t || {}, i), r);
		}, a && (Wn.prototype[t] = function(e, n, r) {
			return this.add(qe[t](e, ge(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		kn[e] = Ln(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? Ln(e, t) : kn;
	},
	getById: function(e) {
		return G.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new Wn(e), r, i;
		for (n.smoothChildTiming = _e(e.smoothChildTiming), G.remove(n), n._dp = 0, n._time = n._tTime = G._time, r = G._first; r;) i = r._next, (t || !(!r._dur && r instanceof ir && r.vars.onComplete === r._targets[0])) && kt(n, r, r._start - r._delay), r = i;
		return kt(G, n, 0), n;
	},
	context: function(e, t) {
		return e ? new Er(e, t) : U;
	},
	matchMedia: function(e) {
		return new Dr(e);
	},
	matchMediaRefresh: function() {
		return yr.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || Tr();
	},
	addEventListener: function(e, t) {
		var n = br[e] || (br[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = br[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: on,
		wrapYoyo: sn,
		distribute: Zt,
		random: en,
		snap: $t,
		normalize: rn,
		getUnit: Ut,
		clamp: Wt,
		splitColor: bn,
		toArray: Jt,
		selector: Yt,
		mapRange: ln,
		pipe: tn,
		unitize: nn,
		interpolate: un,
		shuffle: Xt
	},
	install: Fe,
	effects: qe,
	ticker: Dn,
	updateRoot: Wn.updateRoot,
	plugins: Ke,
	globalTimeline: G,
	core: {
		PropTween: vr,
		globals: Le,
		Tween: ir,
		Timeline: Wn,
		Animation: Un,
		getCache: Qe,
		_removeLinkedListItem: _t,
		reverting: function() {
			return ie;
		},
		context: function(e) {
			return e && U && (U.data.push(e), e._ctx = U), U;
		},
		suppressOverwrites: function(e) {
			return re = e;
		}
	}
};
et("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return Or[e] = ir[e];
}), Dn.add(Wn.updateRoot), mn = Or.to({}, { duration: 0 });
var kr = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, Ar = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = kr(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, jr = function(e, t) {
	return {
		name: e,
		rawVars: 1,
		init: function(e, n, r) {
			r._onInit = function(e) {
				var r, i;
				if (pe(n) && (r = {}, et(n, function(e) {
					return r[e] = 1;
				}), n = r), t) {
					for (i in r = {}, n) r[i] = t(n[i]);
					n = r;
				}
				Ar(e, n);
			};
		}
	};
}, Mr = Or.registerPlugin({
	name: "attr",
	init: function(e, t, n, r, i) {
		var a, o, s;
		for (a in this.tween = n, t) s = e.getAttribute(a) || "", o = this.add(e, "setAttribute", (s || 0) + "", t[a], r, i, 0, 0, a), o.op = a, o.b = s, this._props.push(a);
	},
	render: function(e, t) {
		for (var n = t._pt; n;) ie ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, jr("roundProps", Qt), jr("modifiers"), jr("snap", $t)) || Or;
ir.version = Wn.version = Mr.version = "3.12.7", Pe = 1, ve() && On(), kn.Power0, kn.Power1, kn.Power2, kn.Power3, kn.Power4, kn.Linear, kn.Quad, kn.Cubic, kn.Quart, kn.Quint, kn.Strong, kn.Elastic, kn.Back, kn.SteppedEase, kn.Bounce, kn.Sine, kn.Expo, kn.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var Nr, Pr, Fr, Ir, Lr, Rr, zr, Br = function() {
	return typeof window < "u";
}, Vr = {}, Hr = 180 / Math.PI, Ur = Math.PI / 180, Wr = Math.atan2, Gr = 1e8, Kr = /([A-Z])/g, qr = /(left|right|width|margin|padding|x)/i, Jr = /[\s,\(]\S/, Yr = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, Xr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, Zr = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, Qr = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, $r = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, ei = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, ti = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, ni = function(e, t, n) {
	return e.style[t] = n;
}, ri = function(e, t, n) {
	return e.style.setProperty(t, n);
}, ii = function(e, t, n) {
	return e._gsap[t] = n;
}, ai = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, oi = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, si = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, ci = "transform", li = ci + "Origin", ui = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in Vr && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = Yr[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = ki(i, e);
		}) : this.tfm[t] = o.x ? o[t] : ki(i, t), t === li && (this.tfm.zOrigin = o.zOrigin);
		else return Yr.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(ci) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(li, n, "")), t = ci;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, di = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, fi = function() {
	var e = this.props, t = this.target, n = t.style, r = t._gsap, i, a;
	for (i = 0; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(Kr, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = zr(), (!i || !i.isStart) && !n[ci] && (di(n), r.zOrigin && n[li] && (n[li] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, pi = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: fi,
		save: ui
	};
	return e._gsap || Mr.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, mi, hi = function(e, t) {
	var n = Pr.createElementNS ? Pr.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : Pr.createElement(e);
	return n && n.style ? n : Pr.createElement(e);
}, gi = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(Kr, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, vi(n) || n, 1) || "";
}, _i = "O,Moz,ms,Ms,Webkit".split(","), vi = function(e, t, n) {
	var r = (t || Lr).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(_i[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? _i[i] : "") + e;
}, yi = function() {
	Br() && window.document && (Nr = window, Pr = Nr.document, Fr = Pr.documentElement, Lr = hi("div") || { style: {} }, hi("div"), ci = vi(ci), li = ci + "Origin", Lr.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", mi = !!vi("perspective"), zr = Mr.core.reverting, Ir = 1);
}, bi = function(e) {
	var t = e.ownerSVGElement, n = hi("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), Fr.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), Fr.removeChild(n), i;
}, xi = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, Si = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = bi(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = bi(e)), t && !t.width && !t.x && !t.y ? {
		x: +xi(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +xi(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, Ci = function(e) {
	return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && Si(e));
}, wi = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in Vr && t !== li && (t = ci), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(Kr, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, Ti = function(e, t, n, r, i, a) {
	var o = new vr(e._pt, t, n, 0, 1, a ? ti : ei);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, Ei = {
	deg: 1,
	rad: 1,
	turn: 1
}, Di = {
	grid: 1,
	flex: 1
}, Oi = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = Lr.style, c = qr.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || Ei[i] || Ei[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && Ci(t), (p || o === "%") && (Vr[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], tt(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === Pr || !h.appendChild) && (h = Pr.body), g = h._gsap, g && p && g.width && c && g.time === Dn.time && !g.uncache) return tt(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : wi(t, n);
	} else (p || o === "%") && !Di[gi(h, "display")] && (s.position = gi(t, "position")), h === t && (s.position = "static"), h.appendChild(Lr), m = Lr[u], h.removeChild(Lr), s.position = "absolute";
	return c && p && (g = Qe(h), g.time = Dn.time, g.width = h[u]), tt(f ? m * a / d : m && a ? d / m * a : 0);
}, ki = function(e, t, n, r) {
	var i;
	return Ir || yi(), t in Yr && t !== "transform" && (t = Yr[t], ~t.indexOf(",") && (t = t.split(",")[0])), Vr[t] && t !== "transform" ? (i = Vi(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : Hi(gi(e, li)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = Pi[t] && Pi[t](e, t, n) || gi(e, t) || $e(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? Oi(e, t, i, n) + n : i;
}, Ai = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = vi(t, e, 1), a = i && gi(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = gi(e, "borderTopColor"));
	}
	var o = new vr(this._pt, e.style, t, 0, 1, fr), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r === "auto" && (m = e.style[t], e.style[t] = r, r = gi(e, t) || r, m ? e.style[t] = m : wi(e, t)), l = [n, r], Tn(l), n = l[0], r = l[1], d = n.match(we) || [], b = r.match(we) || [], b.length) {
		for (; u = we.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = rt(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = we.lastIndex - v.length, v || (v = v || V.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = Oi(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? ti : ei;
	return Ee.test(r) && (o.e = 0), this._pt = o, o;
}, ji = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, Mi = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = ji[n] || n, t[1] = ji[r] || r, t.join(" ");
}, Ni = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], Vr[o] && (s = 1, o = o === "transformOrigin" ? li : ci), wi(n, o);
		s && (wi(n, ci), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", Vi(n, 1), a.uncache = 1, di(r)));
	}
}, Pi = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new vr(e._pt, t, n, 0, 0, Ni);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, Fi = [
	1,
	0,
	0,
	1,
	0,
	0
], Ii = {}, Li = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, Ri = function(e) {
	var t = gi(e, ci);
	return Li(t) ? Fi : t.substr(7).match(Ce).map(tt);
}, zi = function(e, t) {
	var n = e._gsap || Qe(e), r = e.style, i = Ri(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? Fi : i) : (i === Fi && !e.offsetParent && e !== Fr && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, Fr.appendChild(e)), i = Ri(e), s ? r.display = s : wi(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : Fr.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, Bi = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || zi(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== Fi && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = Si(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[li] = "0px 0px", a && (Ti(a, o, "xOrigin", c, y), Ti(a, o, "yOrigin", l, b), Ti(a, o, "xOffset", u, o.xOffset), Ti(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, Vi = function(e, t) {
	var n = e._gsap || new Hn(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = gi(e, li) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A, j, M, N, ee, te, P, F, I, ne, L;
	return n.svg = !!(e.getCTM && Ci(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[ci] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[ci] === "none" ? "" : s[ci])), r.scale = r.rotate = r.translate = "none"), S = zi(e, n.svg), n.svg && (n.uncache ? (N = e.getBBox(), c = n.xOrigin - N.x + "px " + (n.yOrigin - N.y) + "px", M = "") : M = !t && e.getAttribute("data-svg-origin"), Bi(e, M || c, !!M || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== Fi && (E = S[0], D = S[1], O = S[2], k = S[3], l = A = S[4], u = j = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? Wr(D, E) * Hr : 0, _ = O || k ? Wr(O, k) * Hr + m : 0, _ && (p *= Math.abs(Math.cos(_ * Ur))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (L = S[6], I = S[7], te = S[8], P = S[9], F = S[10], ne = S[11], l = S[12], u = S[13], d = S[14], C = Wr(L, F), h = C * Hr, C && (w = Math.cos(-C), T = Math.sin(-C), M = A * w + te * T, N = j * w + P * T, ee = L * w + F * T, te = A * -T + te * w, P = j * -T + P * w, F = L * -T + F * w, ne = I * -T + ne * w, A = M, j = N, L = ee), C = Wr(-O, F), g = C * Hr, C && (w = Math.cos(-C), T = Math.sin(-C), M = E * w - te * T, N = D * w - P * T, ee = O * w - F * T, ne = k * T + ne * w, E = M, D = N, O = ee), C = Wr(D, E), m = C * Hr, C && (w = Math.cos(C), T = Math.sin(C), M = E * w + D * T, N = A * w + j * T, D = D * w - E * T, j = j * w - A * T, E = M, A = N), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = tt(Math.sqrt(E * E + D * D + O * O)), p = tt(Math.sqrt(j * j + L * L)), C = Wr(A, j), _ = Math.abs(C) > 2e-4 ? C * Hr : 0, y = ne ? 1 / (ne < 0 ? -ne : ne) : 0), n.svg && (M = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !Li(gi(e, ci)), M && e.setAttribute("transform", M))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = tt(f), n.scaleY = tt(p), n.rotation = tt(m) + o, n.rotationX = tt(h) + o, n.rotationY = tt(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[li] = Hi(c)), n.xOffset = n.yOffset = 0, n.force3D = V.force3D, n.renderTransform = n.svg ? Yi : mi ? Ji : Wi, n.uncache = 0, n;
}, Hi = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, Ui = function(e, t, n) {
	var r = Ut(t);
	return tt(parseFloat(t) + parseFloat(Oi(e, "x", n + "px", r))) + r;
}, Wi = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, Ji(e, t);
}, Gi = "0deg", Ki = "0px", qi = ") ", Ji = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== Gi || l !== Gi)) {
		var x = parseFloat(l) * Ur, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * Ur, w = Math.cos(x), a = Ui(_, a, S * w * -v), o = Ui(_, o, -Math.sin(x) * -v), s = Ui(_, s, C * w * -v + v);
	}
	h !== Ki && (y += "perspective(" + h + qi), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== Ki || o !== Ki || s !== Ki) && (y += s !== Ki || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + qi), c !== Gi && (y += "rotate(" + c + qi), l !== Gi && (y += "rotateY(" + l + qi), u !== Gi && (y += "rotateX(" + u + qi), (d !== Gi || f !== Gi) && (y += "skew(" + d + ", " + f + qi), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + qi), _.style[ci] = y || "translate(0, 0)";
}, Yi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= Ur, c *= Ur, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= Ur, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = tt(b), x = tt(x), S = tt(S), C = tt(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = Oi(f, "x", a, "px"), y = Oi(f, "y", o, "px")), (p || m || h || g) && (v = tt(v + p - (p * b + m * S) + h), y = tt(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = tt(v + r / 100 * w.width), y = tt(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[ci] = w);
}, Xi = function(e, t, n, r, i) {
	var a = 360, o = pe(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? Hr : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * Gr) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * Gr) % a - ~~(s / a) * a)), e._pt = u = new vr(e._pt, t, n, r, s, Zr), u.e = c, u.u = "deg", e._props.push(n), u;
}, Zi = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, Qi = function(e, t, n) {
	var r = Zi({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[ci] = t, o = Vi(n, 1), wi(n, ci), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[ci], a[ci] = t, o = Vi(n, 1), a[ci] = c), Vr) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = Ut(c), p = Ut(l), u = f === p ? parseFloat(c) : Oi(n, s, c, p), d = parseFloat(l), e._pt = new vr(e._pt, o, s, u, d - u, Xr), e._pt.u = p || 0, e._props.push(s));
	Zi(o, r);
};
et("padding,margin,Width,Radius", function(e, t) {
	var n = "Top", r = "Right", i = "Bottom", a = "Left", o = (t < 3 ? [
		n,
		r,
		i,
		a
	] : [
		n + a,
		n + r,
		i + r,
		i + a
	]).map(function(n) {
		return t < 2 ? e + n : "border" + n + e;
	});
	Pi[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return ki(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var $i = {
	name: "css",
	register: yi,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C;
		for (m in Ir || yi(), this.styles = this.styles || pi(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(Ke[m] && Jn(m, t, n, r, e, i)))) {
			if (f = typeof l, p = Pi[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = cn(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", Cn.lastIndex = 0, Cn.test(c) || (h = Ut(c), g = Ut(l)), g ? h !== g && (c = Oi(e, m, c, g) + g) : h && (l += h), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], pe(c) && ~c.indexOf("random(") && (c = cn(c)), Ut(c + "") || c === "auto" || (c += V.units[m] || Ut(ki(e, m)) || ""), (c + "").charAt(1) === "=" && (c = ki(e, m))) : c = ki(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in Yr && (m === "autoAlpha" && (d === 1 && ki(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), Ti(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = Yr[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Vr, v) {
					if (this.styles.save(m), y || (b = e._gsap, b.renderTransform && !t.parseTransform || Vi(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new vr(this._pt, o, ci, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new vr(this._pt, b, "scaleY", b.scaleY, (_ ? rt(b.scaleY, _ + u) : u) - b.scaleY || 0, Xr), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(li, 0, o[li]), l = Mi(l), b.svg ? Bi(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && Ti(this, b, "zOrigin", b.zOrigin, g), Ti(this, o, m, Hi(c), Hi(l)));
						continue;
					} else if (m === "svgOrigin") {
						Bi(e, l, 1, x, 0, this);
						continue;
					} else if (m in Ii) {
						Xi(this, b, m, d, _ ? rt(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						Ti(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						Qi(this, l, e);
						continue;
					}
				} else m in o || (m = vi(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !Jr.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = Ut(l) || (m in V.units ? V.units[m] : h), h !== g && (d = Oi(e, m, c, g)), this._pt = new vr(this._pt, v ? b : o, m, d, (_ ? rt(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? $r : Xr), this._pt.u = g || 0, h !== g && g !== "%" && (this._pt.b = c, this._pt.r = Qr);
				else if (m in o) Ai.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					Ie(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && _r(this);
	},
	render: function(e, t) {
		if (t.tween._time || !zr()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: ki,
	aliases: Yr,
	getSetter: function(e, t, n) {
		var r = Yr[t];
		return r && r.indexOf(",") < 0 && (t = r), t in Vr && t !== li && (e._gsap.x || ki(e, "x")) ? n && Rr === n ? t === "scale" ? ai : ii : (Rr = n || {}) && (t === "scale" ? oi : si) : e.style && !he(e.style[t]) ? ni : ~t.indexOf("-") ? ri : lr(e, t);
	},
	core: {
		_removeProperty: wi,
		_getMatrix: zi
	}
};
Mr.utils.checkPrefix = vi, Mr.core.getStyleSaver = pi, (function(e, t, n, r) {
	var i = et(e + "," + t + "," + n, function(e) {
		Vr[e] = 1;
	});
	et(t, function(e) {
		V.units[e] = "deg", Ii[e] = 1;
	}), Yr[i[13]] = e + "," + t, et(r, function(e) {
		var t = e.split(":");
		Yr[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), et("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	V.units[e] = "px";
}), Mr.registerPlugin($i);
//#endregion
//#region node_modules/gsap/index.js
var q = Mr.registerPlugin($i) || Mr;
q.core.Tween;
//#endregion
//#region src/table/animations/flip.ts
function ea(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function ta(e) {
	return {
		x: e.left + e.width / 2,
		y: e.top + e.height / 2
	};
}
function na(e, t) {
	let n = ta(e), r = ta(t);
	return {
		x: n.x - r.x,
		y: n.y - r.y
	};
}
function ra(e, t) {
	let n = na(t, e);
	return {
		x: n.x,
		y: n.y
	};
}
function ia(e) {
	typeof window > "u" || ((e instanceof HTMLElement ? e : null) ?? document.querySelector(".btable-wrap") ?? document.querySelector(".btable-session"))?.setAttribute("data-gsap-motion", "true");
}
//#endregion
//#region src/table/discardPileModel.ts
function aa(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function oa(e, t) {
	return (e >>> t & 65535) / 65535;
}
function sa(e, t) {
	let n = aa(`${e}@${t}`), r = oa(n, 0), i = oa(n, 7), a = oa(n, 14), o = oa(n, 21), s = r >= .5 ? 1 : -1, c = i >= .5 ? 1 : -1, l = a >= .5 ? 1 : -1;
	return {
		offsetX: s * (12 + r * 6),
		offsetY: c * (12 + i * 6),
		rotation: l * (7 + a * 2),
		scale: .94 + o * .04,
		zIndex: t + 1
	};
}
function ca(e) {
	let t = sa(e.id, e.pileIndex);
	return {
		...e,
		...t
	};
}
function la(e) {
	let t = [];
	for (let n = 0; n < e.discardCount; n++) {
		let r = e.heroCardKeys?.[n];
		t.push(r ?? `${e.playerId}:h${e.handNumber}:d${e.pileStartIndex + n}`);
	}
	return t;
}
//#endregion
//#region src/table/animations/discardPileMotion.ts
var ua = /* @__PURE__ */ new Set(), da = I.drawDiscard;
function fa(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function pa(e = document) {
	let t = (e instanceof Document ? e : e.ownerDocument ?? document).querySelector("[data-discard-pile-anchor]");
	return t ? ea(t) : null;
}
function ma() {
	for (let e of ua) e.kill();
	ua.clear();
}
function ha(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function ga(e, t, n, r = {}) {
	ia(r.root ?? document);
	let i = R(), a = pa(r.root ?? document), o = L(da, i), s = i ? .03 : .055, c = q.timeline({ onComplete: () => {
		ua.delete(c), r.onComplete?.();
	} });
	ua.add(c), e.forEach((e, l) => {
		let u = sa(t[l] ?? `discard-${n + l}`, n + l), d = ea(e);
		if (q.set(e, {
			transformOrigin: "50% 50%",
			willChange: "transform,opacity",
			zIndex: 4
		}), !a || i) {
			c.to(e, {
				opacity: 0,
				scale: u.scale,
				duration: Math.min(o, .2),
				onComplete: () => {
					q.set(e, { clearProps: "transform,opacity,willChange,zIndex" }), r.onCardComplete?.(l);
				}
			}, l * s);
			return;
		}
		let f = a.left + a.width / 2 + u.offsetX, p = a.top + a.height / 2 + u.offsetY, m = d.left + d.width / 2, h = d.top + d.height / 2, g = f - m, _ = p - h, { midX: v, midY: y } = fa(g, _);
		q.set(e, {
			x: 0,
			y: 0,
			rotation: 0,
			scale: 1,
			opacity: 1
		}), c.to(e, {
			motionPath: {
				path: [
					{
						x: 0,
						y: 0
					},
					{
						x: v,
						y
					},
					{
						x: g,
						y: _
					}
				],
				curviness: 1.2
			},
			rotation: u.rotation,
			scale: u.scale,
			opacity: .92,
			duration: o,
			ease: te,
			onComplete: () => {
				q.set(e, { clearProps: "transform,opacity,willChange,zIndex" }), r.onCardComplete?.(l);
			}
		}, l * s);
	});
	let l = Math.round((e.length > 0 ? (e.length - 1) * s : 0) * 1e3 + o * 1e3 + 40);
	return ha(c, Math.min(420, Math.max(280, l))), c;
}
function _a(e, t, n, r, i = {}) {
	let a = [];
	for (let t = 0; t < e.length; t++) {
		let n = e[t], i = document.createElement("div");
		i.className = "discard-fly-ghost", i.setAttribute("aria-hidden", "true"), i.style.position = "fixed", i.style.left = `${n.left}px`, i.style.top = `${n.top}px`, i.style.width = `${n.width}px`, i.style.height = `${n.height}px`, i.style.pointerEvents = "none", i.style.zIndex = "4", r.appendChild(i), a.push(i);
	}
	let o = ga(a, t, n, {
		root: r,
		onComplete: () => {
			for (let e of a) e.remove();
			i.onComplete?.();
		}
	});
	return o.eventCallback("onInterrupt", () => {
		for (let e of a) e.remove();
	}), o;
}
function va(e, t, n) {
	let r = n.querySelector(`[data-seat-play-origin="${e}"]`) ?? n.querySelector(`[data-trick-play-origin="${e}"]`);
	if (!r) return [];
	let i = ea(r);
	return Array.from({ length: t }, (e, t) => ({
		...i,
		left: i.left + t * 3,
		top: i.top - t * 2
	}));
}
//#endregion
//#region src/table/animations/cardMotion.ts
function ya() {
	ia();
}
var ba = /* @__PURE__ */ new WeakMap();
function xa(e = document) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = t.querySelector("[data-testid=\"deal-button\"]") ?? t.querySelector(".deck-stack__pile") ?? t.querySelector(".deck-stack");
	return n ? ea(n) : null;
}
function Sa(e) {
	e && (ba.get(e)?.kill(), ba.delete(e), q.killTweensOf(e), q.set(e, { clearProps: "transform,opacity,filter" }));
}
function Ca(e, t, n = .22) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * n)
	};
}
function wa(e, t, n = I.dealStagger) {
	ya();
	let r = R(), i = q.timeline(), a = L(I.deal, r);
	return e.forEach((e, o) => {
		let { x: s, y: c } = ra(ea(e), t), { midX: l, midY: u } = Ca(s, c, .28);
		q.set(e, {
			transformOrigin: "50% 80%",
			willChange: "transform,opacity"
		}), q.set(e, {
			x: s,
			y: c,
			rotation: -14 + o * 2,
			rotationY: r ? 0 : -72,
			scale: .58,
			opacity: +!!r
		});
		let d = o * (r ? .04 : n), f = () => {
			q.set(e, { clearProps: "transform,opacity,willChange" });
		};
		r ? i.to(e, {
			x: 0,
			y: 0,
			rotation: 0,
			rotationY: 0,
			scale: 1,
			opacity: 1,
			duration: a,
			ease: te,
			onComplete: f
		}, d) : i.to(e, {
			motionPath: {
				path: [
					{
						x: s,
						y: c
					},
					{
						x: l,
						y: u
					},
					{
						x: 0,
						y: 0
					}
				],
				curviness: 1.2
			},
			rotation: 0,
			rotationY: 0,
			scale: 1,
			opacity: 1,
			duration: a,
			ease: te,
			onComplete: f
		}, d);
	}), i;
}
function Ta(e, t) {
	ya();
	let n = R(), r = q.timeline(), i = L(I.drawReceive, n), a = n ? .04 : I.drawReceiveStagger;
	return e.forEach((e, n) => {
		let { x: o, y: s } = ra(ea(e), t);
		q.set(e, {
			transformOrigin: "50% 80%",
			willChange: "transform,opacity"
		}), q.set(e, {
			x: o,
			y: s,
			rotationY: -80,
			scale: .76,
			opacity: 0
		}), r.to(e, {
			x: 0,
			y: 0,
			rotationY: 0,
			rotation: 0,
			scale: 1,
			opacity: 1,
			duration: i,
			ease: F,
			onComplete: () => {
				q.set(e, { transition: "none" }), q.set(e, { clearProps: "transform,opacity,willChange,transition" });
			}
		}, n * a);
	}), r;
}
function Ea(e) {
	ya();
	let t = q.timeline(), n = L(I.standPat);
	return e.forEach((e) => {
		t.fromTo(e, {
			y: 0,
			scale: 1
		}, {
			y: -5,
			scale: 1.02,
			duration: n * .45,
			ease: te,
			yoyo: !0,
			repeat: 1,
			onComplete: () => {
				q.set(e, { clearProps: "transform,willChange" });
			}
		}, 0);
	}), t;
}
function Da(e) {
	ya();
	let t = q.timeline(), n = L(I.foldOut);
	return e.forEach((e, r) => {
		q.set(e, {
			transformOrigin: "50% 50%",
			willChange: "transform,opacity"
		}), t.to(e, {
			x: -20 - r * 6,
			y: 48,
			rotation: -8,
			rotationX: 22,
			scale: .9,
			opacity: .3,
			filter: "grayscale(0.45) brightness(0.88)",
			duration: n,
			ease: P,
			onComplete: () => Sa(e)
		}, r * .04);
	}), t;
}
//#endregion
//#region src/table/animations/drawSeatMotion.ts
var Oa = /* @__PURE__ */ new Set();
function ka(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function Aa() {
	for (let e of Oa) e.kill();
	Oa.clear();
}
function ja(e) {
	let t = document.createElement("div");
	return t.className = "draw-receive-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function Ma(e, t, n, r = {}) {
	ia(n);
	let i = R(), a = L(I.drawReceive, i), o = i ? .04 : I.drawReceiveStagger, s = [];
	for (let r = 0; r < t.length; r++) {
		let t = ja(e);
		n.appendChild(t), s.push(t);
	}
	let c = q.timeline({ onComplete: () => {
		for (let e of s) e.remove();
		Oa.delete(c), window.clearTimeout(u), r.onComplete?.();
	} });
	Oa.add(c);
	let l = Math.round((s.length > 0 ? (s.length - 1) * o : 0) * 1e3 + a * 1e3 + 40), u = window.setTimeout(() => {
		c.progress() < 1 && c.progress(1);
	}, Math.min(680, Math.max(320, l)));
	return c.eventCallback("onInterrupt", () => {
		for (let e of s) e.remove();
		Oa.delete(c), window.clearTimeout(u);
	}), s.forEach((e, n) => {
		let r = t[n], s = ea(e), l = r.left + r.width / 2, u = r.top + r.height / 2, d = s.left + s.width / 2, f = s.top + s.height / 2, p = l - d, m = u - f, { midX: h, midY: g } = ka(p, m);
		if (q.set(e, {
			transformOrigin: "50% 80%",
			willChange: "transform,opacity",
			x: 0,
			y: 0,
			rotationY: i ? 0 : -72,
			scale: i ? 1 : .76,
			opacity: +!!i
		}), i) {
			c.to(e, {
				x: p,
				y: m,
				opacity: .5,
				duration: Math.min(a, .18)
			}, n * o), c.to(e, {
				opacity: 0,
				duration: Math.min(a, .08),
				onComplete: () => {
					q.set(e, { clearProps: "transform,opacity,willChange" });
				}
			}, n * o + Math.min(a, .18));
			return;
		}
		let _ = n * o, v = _ + a * .78;
		c.to(e, {
			motionPath: {
				path: [
					{
						x: 0,
						y: 0
					},
					{
						x: h,
						y: g
					},
					{
						x: p,
						y: m
					}
				],
				curviness: 1.2
			},
			rotationY: 0,
			scale: 1,
			opacity: .92,
			duration: a * .78,
			ease: F
		}, _), c.to(e, {
			opacity: 0,
			scale: .92,
			duration: a * .22,
			ease: "power1.in",
			onComplete: () => {
				q.set(e, { clearProps: "transform,opacity,willChange" });
			}
		}, v);
	}), c;
}
function Na(e) {
	let { playerId: t, replaceCount: n, root: r, onComplete: i } = e;
	if (n <= 0) {
		i?.();
		return;
	}
	let a = xa(r), o = va(t, n, r);
	if (!a || !o.length) {
		i?.();
		return;
	}
	Ma(a, o, r, { onComplete: i });
}
//#endregion
//#region src/table/hooks/useDiscardPileState.ts
function Pa({ handNumber: e, sessionPhase: t }) {
	let [n, r] = (0, l.useState)([]), i = (0, l.useRef)(0), a = (0, l.useRef)(e), o = (0, l.useRef)(t ?? null);
	return (0, l.useEffect)(() => {
		a.current !== e && (a.current = e, i.current = 0, ma(), Aa(), r([]));
	}, [e]), (0, l.useEffect)(() => {
		let e = t ?? null, n = o.current;
		o.current = e, n === "draw" && e === "play" && (ma(), Aa(), r([]));
	}, [t]), {
		cards: n,
		pileIndexRef: i,
		commitDiscardCards: (0, l.useCallback)((t) => {
			if (!t.length) return;
			let n = t.map((t) => ca({
				id: t.id,
				playerId: t.playerId,
				handNumber: e,
				pileIndex: i.current++
			}));
			r((e) => [...e, ...n]);
		}, [e])
	};
}
function Fa({ cardElements: e, cardKeys: t, playerId: n, pileStartIndex: r, root: i, onComplete: a }) {
	let o = [];
	ga(e, t, r, {
		root: i,
		onCardComplete: (e) => {
			o.push({
				id: t[e],
				playerId: n
			});
		},
		onComplete: () => a(o)
	});
}
function Ia({ playerId: e, handNumber: t, discardCount: n, pileStartIndex: r, root: i, onComplete: a }) {
	let o = la({
		playerId: e,
		handNumber: t,
		discardCount: n,
		pileStartIndex: r
	});
	if (!i || n <= 0 || !o.length) {
		a(o.map((t) => ({
			id: t,
			playerId: e
		})));
		return;
	}
	let s = va(e, n, i);
	if (!s.length) {
		a(o.map((t) => ({
			id: t,
			playerId: e
		})));
		return;
	}
	_a(s, o, r, i, { onComplete: () => a(o.map((t) => ({
		id: t,
		playerId: e
	}))) });
}
function La(e, t) {
	return t.map((t) => {
		let n = e[t];
		return n ? `${n.rank}-${n.suit}` : `idx-${t}`;
	});
}
function Ra(e, t) {
	if (!e) return [];
	let n = [...e.querySelectorAll(".hand__slot .pcard")];
	return t.length > 0 ? t.map((e) => n[e]).filter((e) => !!e) : [...e.querySelectorAll(".hand__slot--draw-selected .pcard, .hand__slot--draw-recommended .pcard")];
}
//#endregion
//#region src/table/animations/useHeroCardMotion.ts
function za(e) {
	return `${e.rank}-${e.suit}`;
}
function Ba(e) {
	return e ? [...e.querySelectorAll(".hand__slot .pcard")] : [];
}
function Va(e, { dealing: t, dealStaggerMs: n, drawAnimSubPhase: r, drawDiscardCount: i = 0, drawReplaceCount: a = 0, pendingDiscardIndices: o, standPatPulse: s, foldOutPulse: c, playingIndex: u, cards: d, handNumber: f = 0, playerId: p = null, tableRootRef: m, pileIndexRef: h, onDiscardCommitted: g, skipHeroDealMotion: _ = !1 }) {
	let v = (0, l.useRef)([]), y = (0, l.useRef)(!1), b = (0, l.useRef)(null), x = (0, l.useRef)(null), S = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		ia(e.current?.closest(".btable-wrap") ?? document);
	}, [e]), (0, l.useLayoutEffect)(() => {
		if (_) {
			y.current = !0;
			return;
		}
		if (!t || d.length === 0) {
			y.current = !1;
			return;
		}
		if (y.current) return;
		let r = e.current, i = Ba(r);
		if (!i.length) return;
		y.current = !0;
		let a = xa(r ?? document);
		a && wa(i, a, Math.max(.04, n / 1e3));
	}, [
		t,
		d.length,
		n,
		e,
		_
	]), (0, l.useLayoutEffect)(() => {
		if (r === "discard") {
			if (i <= 0) return;
			S.current = null, v.current = d.map(za);
			let t = e.current, n = m?.current ?? t?.closest(".btable-wrap"), r = Ra(t, o);
			if (!r.length || !n || !p) return;
			let a = `${f}:${p}:discard:${r.length}:${o.join(",")}`;
			if (x.current === a) return;
			x.current = a, Fa({
				cardElements: r,
				cardKeys: La(d, o.length ? o : r.map((e, t) => t)),
				playerId: p,
				pileStartIndex: h?.current ?? 0,
				root: n,
				onComplete: (e) => {
					h && (h.current += e.length), g?.(e);
				}
			});
			return;
		}
		if (r === "receive") {
			if (a <= 0) return;
			x.current = null;
			let t = e.current, n = Ba(t), r = new Set(v.current), i = d.map((e, t) => ({
				key: za(e),
				el: n[t]
			})).filter((e) => !!e.el && !r.has(e.key));
			if (!i.length) return;
			let o = i.map((e) => e.key).sort().join(","), s = `${f}:${p ?? ""}:receive:${a}:${o}`;
			if (S.current === s) return;
			S.current = s;
			let c = xa(t ?? document);
			c && Ta(i.map((e) => e.el), c);
			return;
		}
		(r === "done" || r === null) && (x.current = null, S.current = null, v.current = d.map(za));
	}, [
		r,
		i,
		a,
		d,
		o,
		e,
		f,
		p,
		m,
		h,
		g,
		_
	]), (0, l.useLayoutEffect)(() => {
		if (!s) return;
		let t = Ba(e.current);
		t.length && Ea(t);
	}, [s, e]), (0, l.useLayoutEffect)(() => {
		if (!c) return;
		let t = Ba(e.current);
		t.length && Da(t);
	}, [c, e]), (0, l.useLayoutEffect)(() => {
		let t = e.current, n = Ba(t);
		if (u === null) {
			if (b.current !== null) {
				let e = n[b.current];
				e && Sa(e), b.current = null;
			}
			return;
		}
		if (b.current === u) return;
		if (b.current !== null) {
			let e = n[b.current];
			e && Sa(e);
		}
		let r = n[u];
		r && (Sa(r), b.current = u);
	}, [
		u,
		d,
		e
	]), (0, l.useLayoutEffect)(() => () => {
		for (let t of Ba(e.current)) Sa(t);
	}, [e]);
}
function Ha(e, t) {
	let n = t / 1e3, r = Math.max(e - 1, 0) * n;
	return Math.round((r + I.deal) * 1e3);
}
//#endregion
//#region src/table/handUi.ts
function Ua(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function Wa(e, t) {
	if (t) return "Join hand";
	switch (e) {
		case "reveal": return "Deal";
		case "decision": return "Join hand";
		case "draw": return "Draw";
		case "play": return "Play card";
		default: return "Waiting";
	}
}
function Ga(e) {
	return {
		spades: "Spades",
		hearts: "Hearts",
		diamonds: "Diamonds",
		clubs: "Clubs"
	}[e ?? ""] ?? e ?? "—";
}
function Ka(e) {
	return e === "reveal" || e === "decision" || e === "draw" || e === "play";
}
function qa(e) {
	return e === "decision";
}
function Ja(e) {
	return e === "reveal";
}
function Ya(e, t) {
	if (!e) return null;
	let n = t.find((t) => t.playerId === e);
	return n ? n.isSelf ? "Your turn" : `${n.displayName}'s turn` : null;
}
//#endregion
//#region src/table/trickPlayFly.ts
var Xa = /* @__PURE__ */ new Map(), Za = /* @__PURE__ */ new Map();
function Qa(e) {
	return `${e.playerId}:${e.card.rank}:${e.card.suit}`;
}
function $a(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function eo(e) {
	return document.querySelector(`[data-seat-play-origin="${e}"]`);
}
function to(e) {
	let t = eo(e);
	return t ? $a(t) : null;
}
function no(e) {
	return document.querySelector(`[data-trick-play-origin-active="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin-active="${e}"]`) ?? document.querySelector(`[data-trick-play-origin="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin="${e}"]`) ?? eo(e);
}
function ro(e) {
	let t = no(e);
	return t ? $a(t) : null;
}
function io(e) {
	let t = ro(e);
	if (t) return Za.set(e, t), t;
	let n = to(e);
	return n ? (Za.set(e, n), n) : null;
}
function J(e) {
	for (let t of e) io(t);
}
function ao(e) {
	return Za.get(e);
}
function oo(e, t) {
	if (t) {
		let e = Xa.get(t);
		if (e) return e;
	}
	return ao(e) ?? ro(e) ?? to(e) ?? null;
}
function so(e, t) {
	let n = oo(e, t);
	return n && Xa.set(t, n), n;
}
function co(e, t, n) {
	let r = document.querySelector("[data-testid=\"hero-hand\"]")?.querySelectorAll(".hand__slot .pcard")[n];
	if (r) {
		let n = $a(r);
		return Xa.set(t, n), Za.set(e, n), n;
	}
	return so(e, t);
}
function lo(e, t, n) {
	let r = e.left + e.width / 2, i = e.top + e.height / 2, a = n.left + n.width / 2, o = n.top + n.height / 2;
	return {
		dx: r - a,
		dy: i - o
	};
}
function uo() {
	Xa.clear(), Za.clear();
}
//#endregion
//#region src/table/tableMicrointeractions.ts
var fo = {
	turnHandoff: 620,
	dealerMove: 720,
	potTick: 480,
	trickBadge: 450,
	trumpReminder: 900,
	feedbackPulse: 420,
	illegalShake: 340,
	illegalFlash: 420,
	autoPlayPreselect: 220,
	cardSelect: 380,
	winnerFlash: 520,
	bankrollTick: 900,
	bourrePulse: 1200,
	bourreMarker: 4500
}, po = {
	turnHandoffPlayerId: null,
	dealerMovedPlayerId: null,
	potTick: 0,
	trickBadgeTicks: {},
	bankrollTicks: {},
	bourreAlerts: {},
	trumpReminderPulse: 0,
	feedbackErrorPulse: 0,
	feedbackSuccessPulse: 0,
	winnerFlashPlayerId: null
};
function mo(e) {
	return {
		turnPlayerId: e.turnPlayerId,
		dealerId: e.dealerId,
		potAmount: e.potAmount,
		tricksByPlayer: { ...e.tricksByPlayer },
		bankrollByPlayer: { ...e.bankrollByPlayer },
		bourrePlayerIds: [...e.bourrePlayerIds],
		showTrumpSuitReminder: e.showTrumpSuitReminder,
		actionFeedbackStatus: e.actionFeedbackStatus,
		trickWinnerSeatId: e.trickWinnerSeatId,
		trickPhase: e.trickPhase
	};
}
function ho(e, t) {
	let n = {
		turnHandoffPlayerId: null,
		dealerMovedPlayerId: null,
		potTick: !1,
		trickBadgeIncrements: {},
		bankrollChanges: {},
		bourrePlayerIds: [],
		trumpReminderPulse: !1,
		feedbackErrorPulse: !1,
		feedbackSuccessPulse: !1,
		winnerFlashPlayerId: null
	};
	if (!e) return n;
	let r = !t.suppressTurn && t.turnPlayerId && t.turnPlayerId !== e.turnPlayerId && t.phase === "play" ? t.turnPlayerId : null, i = t.dealerId && t.dealerId !== e.dealerId ? t.dealerId : null, a = t.potAmount !== e.potAmount && t.potAmount > 0 && e.potAmount >= 0, o = {}, s = new Set([...Object.keys(e.tricksByPlayer), ...Object.keys(t.tricksByPlayer)]);
	for (let n of s) {
		let r = e.tricksByPlayer[n] ?? 0, i = t.tricksByPlayer[n] ?? 0;
		i > r && (o[n] = i - r);
	}
	let c = {}, l = new Set([...Object.keys(e.bankrollByPlayer), ...Object.keys(t.bankrollByPlayer)]);
	for (let n of l) {
		let r = e.bankrollByPlayer[n] ?? 0, i = t.bankrollByPlayer[n] ?? 0;
		i > r ? c[n] = "up" : i < r && (c[n] = "down");
	}
	return {
		turnHandoffPlayerId: r,
		dealerMovedPlayerId: i,
		potTick: a,
		trickBadgeIncrements: o,
		bankrollChanges: c,
		bourrePlayerIds: t.bourrePlayerIds.filter((t) => !e.bourrePlayerIds.includes(t)),
		trumpReminderPulse: t.showTrumpSuitReminder && !e.showTrumpSuitReminder,
		feedbackErrorPulse: t.actionFeedbackStatus === "error" && e.actionFeedbackStatus !== "error",
		feedbackSuccessPulse: t.actionFeedbackStatus === "success" && e.actionFeedbackStatus !== "success",
		winnerFlashPlayerId: t.trickWinnerSeatId && t.trickPhase === "winnerReveal" && (t.trickWinnerSeatId !== e.trickWinnerSeatId || e.trickPhase !== "winnerReveal") ? t.trickWinnerSeatId : null
	};
}
//#endregion
//#region src/table/bestPlayPrefs.ts
var go = "nbl-best-play";
function _o() {
	try {
		return localStorage.getItem(go) === "1";
	} catch {
		return !1;
	}
}
function vo(e) {
	try {
		localStorage.setItem(go, e ? "1" : "0");
	} catch {}
}
//#endregion
//#region src/game/playerOrder.ts
function yo(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function bo(e, t, n) {
	let r = yo(e, n), i = new Set(t);
	return r.filter((e) => i.has(e));
}
//#endregion
//#region src/game/types.ts
var xo = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
};
function So(e) {
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
//#region src/game/serialize.ts
function Co(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/playContext.ts
function wo(e, t) {
	let n = O(e, t);
	return n.length ? n.reduce((e, t) => E(t) >= E(e) ? t : e) : null;
}
function To(e) {
	if (!e.cinchEnabled) return !1;
	let t = O(e.hand, e.trumpSuit);
	return t.filter((e) => E(e) >= 13).length >= 3 && t.length > 0;
}
function Eo(e, t) {
	let n = wo(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function Do(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => Co([e.card])[0]) : [];
}
function Oo(e) {
	let t = e.currentTrick ?? null, n = Do(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function ko(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = Oo(e.publicHand);
	return {
		hand: e.hand,
		trumpSuit: e.publicHand.trumpSuit,
		leadSuit: r,
		trickPlays: t,
		isLeading: n,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	};
}
function Ao(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return To(e) && !Eo(n, e) ? {
		allowed: !1,
		reason: "Cinch: play your highest trump",
		code: "CINCH_HIGHEST_TRUMP"
	} : { allowed: !0 };
	let r = e.leadSuit ?? e.trickPlays[0]?.suit;
	return r ? O(e.hand, r).length > 0 ? n.suit === r ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must follow suit",
		code: "MUST_FOLLOW_SUIT"
	} : O(e.hand, e.trumpSuit).length > 0 ? D(n, e.trumpSuit) ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must play a trump when void in the led suit",
		code: "MUST_TRUMP"
	} : { allowed: !0 } : { allowed: !0 };
}
function jo(e, t, n, r) {
	if (typeof console > "u" || !console.debug) return;
	let i = n != null && n >= 0 && n < t.hand.length ? t.hand[n] : null;
	console.debug("[bourre-play]", {
		handNumber: e.handNumber ?? null,
		dealerSeat: e.dealerSeat ?? null,
		leaderSeat: e.leaderSeat ?? null,
		currentTurnSeat: e.currentTurnSeat ?? null,
		trickIndex: e.trickIndex ?? 0,
		trickCards: t.trickPlays.length,
		leadSuit: t.leadSuit,
		trumpSuit: t.trumpSuit,
		isLeading: t.isLeading,
		selectedCard: i,
		allowed: r.allowed,
		reason: r.reason ?? null
	});
}
//#endregion
//#region src/game/legal.ts
function Mo(e, t, n) {
	let r = e.filter((e) => !D(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => E(t) > E(e) ? t : e) : null;
}
function No(e, t) {
	let n = e.filter((e) => D(e, t));
	return n.length ? n.reduce((e, t) => E(t) > E(e) ? t : e) : null;
}
function Po(e, t) {
	return E(e) > E(t);
}
function Fo(e) {
	return {
		hand: e.hand,
		trumpSuit: e.trumpSuit,
		leadSuit: e.leadSuit,
		trickPlays: e.trickPlays,
		isLeading: e.isLeading,
		cinchEnabled: e.cinchEnabled
	};
}
function Io(e, t = {}) {
	let n = Fo(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = Ao(n, r);
			i.allowed ? e.push(r) : jo(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? O(n.hand, r) : [], a = O(n.hand, n.trumpSuit), o = r ? Mo(n.trickPlays, r, n.trumpSuit) : null, s = No(n.trickPlays, n.trumpSuit), c;
	if (i.length > 0) {
		if (c = i, !s && o) {
			let e = i.filter((e) => Po(e, o));
			e.length && (c = e);
		}
	} else if (a.length > 0) {
		if (c = a, s) {
			let e = a.filter((e) => Po(e, s));
			e.length && (c = e);
		}
	} else c = [...n.hand];
	let l = [];
	for (let e = 0; e < n.hand.length; e += 1) c.some((t) => t.rank === n.hand[e].rank && t.suit === n.hand[e].suit) && l.push(e);
	return l;
}
//#endregion
//#region src/game/trick.ts
function Lo(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => D(e.card, n));
	if (r.length) return r.reduce((e, t) => E(t.card) > E(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => E(t.card) > E(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
function Ro(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: E(e),
		trump: D(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function zo(e, t) {
	let n = Io(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => E(e[n]) > E(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => E(e[n]) < E(e[t]) ? n : t);
	let i = n.filter((n) => Lo([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => E(e[n]) < E(e[t]) ? n : t);
}
//#endregion
//#region src/table/heroHandPlayPreselect.ts
function Bo(e, t) {
	return e === t ? null : t;
}
function Vo(e) {
	let t = Bo(e.selectedPlay, e.tappedIndex), n = t === null && e.selectedPlay === e.tappedIndex;
	return {
		nextSelection: t,
		shouldImmediatePlay: t !== null && e.isMyTurn && e.isLegal && !n,
		shouldQueueSelection: t !== null && !e.isMyTurn && e.isLegal && !n,
		shouldCancelAutoplay: n || t !== e.selectedPlay,
		isDeselect: n
	};
}
function Ho(e, t) {
	return e && t;
}
function Uo(e) {
	return `${e.handNumber}:${e.trickNumber ?? 0}:${e.turnPlayerId ?? ""}:${e.phase ?? ""}`;
}
function Wo(e, t) {
	return e.handNumber !== t.handNumber || (e.phase ?? "") !== (t.phase ?? "");
}
function Go(e) {
	let [t, n, r, i] = e.split(":");
	return {
		handNumber: Number(t) || 0,
		trickNumber: n === "" || n === "0" ? null : Number(n),
		turnPlayerId: r || null,
		phase: i || null
	};
}
function Ko(e) {
	return e.showBestPlayControl && e.inPlayPhase && e.bestPlayEnabled && e.recommendedPlayIndex !== null && e.recommendedPlayIndex >= 0;
}
function qo(e) {
	return e.inPlayPhase ? e.selectedPlay === e.cardIndex ? "play-preselected" : e.showBestPlayRecommendation && e.recommendedPlayIndex === e.cardIndex ? "play-recommended" : e.isMyTurn && e.isLegal && !e.busy ? "legal-playable" : null : null;
}
function Jo(e, t) {
	return t ? t.includes(e) : !0;
}
function Yo(e, t, n) {
	if (!n?.length || !e.length) return null;
	let r = zo(e, ko({
		hand: e,
		publicHand: t
	}));
	return n.includes(r) ? r : n[0] ?? null;
}
function Xo(e, t, n, r = Infinity, i = []) {
	if (!e.length || n <= 0) return [];
	let a = new Set(i), o = e.map((e, t) => t).filter((e) => !a.has(e)).filter((n) => !D(e[n], t)).filter((t) => e[t].rank !== "A");
	return o.length ? Ro(o.map((t) => e[t]), t, n, r).map((e) => o[e]) : [];
}
function Zo(e) {
	return e.drawSelectionTouched ? [...e.selectedDraw].sort((e, t) => e - t) : e.bestPlayEnabled ? [...e.recommendedDiscardIndices].sort((e, t) => e - t) : [...e.selectedDraw].sort((e, t) => e - t);
}
//#endregion
//#region src/table/feedback/soundPacks.ts
var Qo = {
	classic: "Classic",
	wood: "Wood & Felt",
	arcade: "Arcade"
}, $o = "classic", es = [
	"card-place-normal",
	"card-place-heavy",
	"card-place-soft",
	"lead-sweetener-light",
	"lead-sweetener-strong",
	"trick-win-normal",
	"trick-win-big",
	"hand-win-stinger",
	"card-shuffle-normal",
	"card-shuffle-final",
	"card-select",
	"card-illegal",
	"ui-button-press",
	"coin-chime-light",
	"draw",
	"Fahhh"
], ts = {
	"card-place-normal": "card-place-normal.wav",
	"card-place-heavy": "card-place-heavy.wav",
	"card-place-soft": "card-place-soft.wav",
	"lead-sweetener-light": "lead-sweetener-light.wav",
	"lead-sweetener-strong": "lead-sweetener-strong.wav",
	"trick-win-normal": "trick-win-normal.wav",
	"trick-win-big": "trick-win-big.wav",
	"hand-win-stinger": "hand-win-stinger.wav",
	"card-shuffle-normal": "card-shuffle-normal.wav",
	"card-shuffle-final": "card-shuffle-final.wav",
	"card-select": "card-select.wav",
	"card-illegal": "card-illegal.wav",
	"ui-button-press": "ui-button-press.wav",
	"coin-chime-light": "coin-chime-light.wav",
	draw: "draw.wav",
	Fahhh: "Fahhh.wav"
}, ns = {
	classic: "",
	wood: "packs/wood/",
	arcade: "packs/arcade/"
};
function rs(e) {
	if (!e) return !1;
	let t = e.toLowerCase();
	return t.includes("audio/") || t.includes("application/octet-stream");
}
var is = "/sounds/";
function as(e) {
	return `${new URL(e).origin}${is}`;
}
function os(e, t) {
	let n = ns[e] ?? "";
	return `${typeof document < "u" ? as(document.baseURI) : is}${n}${ts[t]}`;
}
function ss(e = $o) {
	return es.map((t) => os(e, t));
}
function cs(e, t, n = {}) {
	let r = n.intensityTier ?? 0;
	switch (t) {
		case "shuffle":
		case "gameStart": return "card-shuffle-normal";
		case "shuffleFinal":
		case "openRoom": return "card-shuffle-final";
		case "draw": return "draw";
		case "cardPlace": return r >= 2 ? "card-place-heavy" : r === 1 ? "card-place-soft" : "card-place-normal";
		case "leadChange": return r >= 2 ? "lead-sweetener-strong" : "lead-sweetener-light";
		case "trickWin": return n.isLocalPlayer || (n.volumeScale ?? 1) > 1.02 ? "trick-win-big" : "trick-win-normal";
		case "trickCollect":
		case "handWin": return "coin-chime-light";
		case "potWin": return "hand-win-stinger";
		case "bourre": return "Fahhh";
		case "uiButton": return "ui-button-press";
		case "cardSelect": return "card-select";
		case "cardIllegal":
		case "deleteRoom": return "card-illegal";
		case "fold": return "card-place-heavy";
	}
}
function ls(e) {
	return e === "wood" || e === "arcade" ? e : $o;
}
var us = {
	shuffle: "animation",
	shuffleFinal: "animation",
	draw: "action",
	cardPlace: "animation",
	leadChange: "animation",
	trickWin: "animation",
	trickCollect: "animation",
	handWin: "outcome",
	potWin: "outcome",
	bourre: "outcome",
	gameStart: "action",
	openRoom: "action",
	deleteRoom: "action",
	fold: "action",
	cardSelect: "action",
	cardIllegal: "action",
	uiButton: "action"
}, ds = "nbl-feedback", fs = {
	soundMode: "on",
	soundPackId: $o,
	hapticsMode: "on"
};
function ps(e) {
	if (!e || typeof e != "object") return { ...fs };
	let t = e, n = t.hapticsMode, r = n === "off" || n === "minimal" || n === "on" ? n : t.hapticsEnabled === !1 ? "off" : "on", i;
	return i = t.soundMode === "on" || t.soundMode === "minimal" || t.soundMode === "off" ? t.soundMode : t.soundEnabled === !1 ? "off" : "on", {
		soundMode: i,
		soundPackId: ls(t.soundPackId),
		hapticsMode: r
	};
}
function ms() {
	try {
		let e = localStorage.getItem(ds);
		return e ? ps(JSON.parse(e)) : { ...fs };
	} catch {
		return { ...fs };
	}
}
function hs(e) {
	let t = {
		...ms(),
		...e
	};
	try {
		localStorage.setItem(ds, JSON.stringify(t));
	} catch {}
	return ys(t), t;
}
function gs(e, t) {
	return e === "off" ? !1 : e === "on" ? !0 : t === "trickWin" || t === "potWin" || t === "handWin" || t === "bourre";
}
var _s = /* @__PURE__ */ new Set();
function vs(e) {
	return _s.add(e), () => _s.delete(e);
}
function ys(e) {
	for (let t of _s) t(e);
}
function bs() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function xs(e, t) {
	return !(e === "off" || e === "minimal" && t === "light" || bs() && t === "light");
}
//#endregion
//#region src/table/feedback/audioAudit.ts
var Ss = 300;
function Cs() {
	if (typeof window > "u") return !1;
	try {
		if (localStorage.getItem("nbl-table-audio-debug") === "1") return !0;
	} catch {}
	return !1;
}
function ws(e, t) {
	Cs() && (t ? console.info("[table-audio]", e, t) : console.info("[table-audio]", e));
}
function Ts() {
	return typeof window > "u" ? [] : (window.__nblTableAudioAudit || (window.__nblTableAudioAudit = []), window.__nblTableAudioAudit);
}
function Es(e) {
	if (e) try {
		return new URL(e, "http://local").pathname.split("/").pop() || void 0;
	} catch {
		let t = e.split("/");
		return t[t.length - 1] || void 0;
	}
}
function Ds(e) {
	return e === "procedural-fallback" || e === "procedural-only";
}
function Os(e) {
	if (typeof window > "u") return;
	let t = {
		...e,
		filename: e.filename ?? Es(e.url),
		resolvedFile: e.resolvedFile ?? e.filename ?? Es(e.url),
		usedFallback: e.usedFallback ?? (e.result != null && Ds(e.result)),
		timestamp: Date.now()
	}, n = Ts();
	n.push(t), n.length > Ss && n.splice(0, n.length - Ss), ws("audit", t);
}
function ks() {
	typeof window > "u" || (window.__nblTableAudioAudit = [], ws("audit-reset"));
}
function As() {
	return [...Ts()];
}
function js(e = As()) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = [
			n.action ?? n.source ?? n.event,
			n.triggerType,
			n.event
		].join("|"), r = t.get(e);
		r || (r = {
			action: n.action ?? n.source,
			source: n.source,
			triggerType: n.triggerType,
			event: n.event,
			results: {},
			filenames: [],
			count: 0
		}, t.set(e, r)), r.count += 1, r.results[n.result] = (r.results[n.result] ?? 0) + 1, n.filename && !r.filenames.includes(n.filename) && r.filenames.push(n.filename);
	}
	return [...t.values()];
}
function Ms() {
	if (typeof window > "u") return;
	let e = js();
	if (!e.length) {
		console.info("[table-audio] audit summary: (empty)");
		return;
	}
	console.info("[table-audio] audit summary:");
	for (let t of e) {
		let e = t.action ?? t.event, n = Object.entries(t.results).map(([e, t]) => `${e} x${t}`).join(", "), r = t.filenames.length ? t.filenames.join(", ") : "(none)";
		console.info(`  ${e}\n    triggerType: ${t.triggerType}\n    event: ${t.event}\n    results: ${n}\n    filenames: ${r}`);
	}
}
function Ns(e) {
	typeof window > "u" || (window.__nblAudioPlayMonitor || (window.__nblAudioPlayMonitor = []), window.__nblAudioPlayMonitor.push({
		...e,
		filename: e.filename ?? Es(e.src),
		timestamp: Date.now()
	}));
}
function Ps() {
	typeof window > "u" || (window.__nblAudioPlayMonitor = []);
}
function Fs() {
	return typeof window > "u" ? [] : [...window.__nblAudioPlayMonitor ?? []];
}
function Is() {
	typeof window > "u" || (window.resetTableAudioAudit = ks, window.getTableAudioAudit = As, window.printTableAudioAuditSummary = Ms, window.resetAudioPlayMonitor = Ps, window.getAudioPlayMonitor = Fs);
}
//#endregion
//#region src/table/feedback/audio.ts
var Ls = null, Y = null, Rs = !1, zs = !1;
function Bs() {
	zs || typeof window > "u" || (Is(), zs = !0);
}
var Vs = /* @__PURE__ */ new Map(), Hs = /* @__PURE__ */ new Map(), Us = /* @__PURE__ */ new Set(), Ws = /* @__PURE__ */ new WeakSet();
function Gs() {
	return ms().soundPackId;
}
function Ks() {
	if (typeof window > "u") return null;
	try {
		let e = window.AudioContext ?? window.webkitAudioContext;
		return e ? (Ls || (Ls = new e(), Y = Ls.createGain(), Y.gain.value = .55, Y.connect(Ls.destination)), Ls) : null;
	} catch {
		return null;
	}
}
function qs(e, t, n = {}) {
	Ws.has(e) || (Ws.add(e), e.addEventListener("loadeddata", () => {
		ws("onload", {
			src: t,
			key: n.key,
			event: n.event
		});
	}), e.addEventListener("error", () => {
		ws("onloaderror", {
			src: t,
			key: n.key,
			event: n.event,
			mediaError: e.error?.code
		});
	}), e.addEventListener("playing", () => {
		ws("onplay", {
			src: t,
			key: n.key,
			event: n.event
		});
	}));
}
function Js(e, t = {}) {
	if (typeof window > "u") return null;
	try {
		let n = Vs.get(e);
		return n || (ws("resolve-src", {
			src: e,
			key: t.key,
			event: t.event
		}), n = new Audio(e), n.preload = "auto", qs(n, e, t), Vs.set(e, n)), n;
	} catch {
		return null;
	}
}
function Ys(e, t = {}) {
	let n = Js(e, t);
	if (!n) return null;
	if (n.paused && n.currentTime < .01) return n;
	try {
		ws("resolve-src", {
			src: e,
			key: t.key,
			event: t.event,
			clone: !0
		});
		let n = new Audio(e);
		return n.preload = "auto", qs(n, e, t), n;
	} catch {
		return null;
	}
}
async function Xs() {
	Bs(), Rs = !0, Hs.clear();
	let e = Ks();
	if (e) {
		if (e.state === "suspended") try {
			await e.resume();
		} catch {}
		tc();
	}
}
function Zs(e, t = 2500) {
	return e.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ? Promise.resolve() : new Promise((n, r) => {
		let i = window.setTimeout(() => {
			s(), r(/* @__PURE__ */ Error("canplay-timeout"));
		}, t), a = () => {
			s(), n();
		}, o = () => {
			s(), r(/* @__PURE__ */ Error("media-error"));
		}, s = () => {
			window.clearTimeout(i), e.removeEventListener("canplaythrough", a), e.removeEventListener("error", o);
		};
		e.addEventListener("canplaythrough", a, { once: !0 }), e.addEventListener("error", o, { once: !0 });
		try {
			e.load();
		} catch {
			s(), r(/* @__PURE__ */ Error("load-failed"));
		}
	});
}
async function Qs(e) {
	if (Us.has(e)) return !0;
	let t = Js(e);
	if (!t) return !1;
	try {
		await Zs(t);
		let n = t.volume;
		return t.volume = .001, t.currentTime = 0, await t.play(), t.pause(), t.currentTime = 0, t.volume = n, Us.add(e), ws("warmed", { src: e }), !0;
	} catch (t) {
		return ws("warmup-failed", {
			src: e,
			err: String(t)
		}), !1;
	}
}
async function $s(e) {
	if (Hs.get(e) === !0) return { ok: !0 };
	if (typeof window > "u") return {
		ok: !1,
		reason: "probe-failed"
	};
	try {
		let t = await fetch(e, {
			method: "HEAD",
			cache: "no-store"
		}), n = t.headers.get("content-type");
		if (t.ok && rs(n)) return Hs.set(e, !0), { ok: !0 };
		let r = await fetch(e, {
			headers: { Range: "bytes=0-15" },
			cache: "no-store"
		}), i = r.headers.get("content-type");
		return r.ok && rs(i) ? (ws("probe-get-ok", {
			src: e,
			contentType: i
		}), Hs.set(e, !0), { ok: !0 }) : r.ok && e.toLowerCase().endsWith(".wav") && !i?.toLowerCase().includes("text/html") ? (ws("probe-wav-extension-ok", {
			src: e,
			contentType: i
		}), Hs.set(e, !0), { ok: !0 }) : (ws("probe-failed", {
			src: e,
			headStatus: t.status,
			headContentType: n,
			getStatus: r.status,
			getContentType: i
		}), !t.ok && !r.ok ? {
			ok: !1,
			reason: "probe-failed"
		} : {
			ok: !1,
			reason: "bad-content-type"
		});
	} catch (t) {
		return ws("probe-network-error", {
			src: e,
			err: String(t)
		}), {
			ok: !1,
			reason: "probe-failed"
		};
	}
}
async function ec(e, t) {
	let n = [os(e, t)];
	return e !== "classic" && n.push(os("classic", t)), n;
}
async function tc(e) {
	if (!Rs) return;
	let t = e ?? Gs();
	await Promise.all(ss(t).map(async (e) => {
		if (!(await $s(e)).ok) return;
		let t = Js(e);
		if (t) {
			try {
				t.load();
			} catch {}
			await Qs(e);
		}
	}));
}
async function nc(e, t = .55, n = {}) {
	let r = n.key ?? n.event;
	if (ws("requested", {
		key: r,
		src: e,
		event: n.event
	}), !Rs) return ws("play-blocked", {
		key: r,
		src: e,
		reason: "audio-locked"
	}), {
		ok: !1,
		reason: "audio-locked"
	};
	let i = Ys(e, n);
	if (!i) return ws("play-blocked", {
		key: r,
		src: e,
		reason: "no-clip"
	}), {
		ok: !1,
		reason: "media-error"
	};
	try {
		i.readyState < HTMLMediaElement.HAVE_CURRENT_DATA && await Zs(i), i.volume = Math.min(1, Math.max(0, t)), i.currentTime = 0, await i.play();
		let n = Es(e);
		return ws("played-asset", {
			key: r,
			src: e,
			volume: t,
			filename: n
		}), Ns({
			src: e,
			filename: n,
			volume: t
		}), { ok: !0 };
	} catch (t) {
		return ws("onplayerror", {
			key: r,
			src: e,
			event: n.event,
			err: String(t)
		}), ws("play-rejected", {
			key: r,
			src: e,
			err: String(t)
		}), {
			ok: !1,
			reason: "play-rejected"
		};
	}
}
async function rc(e, t, n = .55, r) {
	let i = {
		key: r,
		event: r
	}, a = await ec(e, t), o;
	for (let e of a) {
		let t = await nc(e, n, i);
		if (t.ok) return Hs.set(e, !0), {
			ok: !0,
			src: e
		};
		o = t.reason ?? "play-rejected", ws("play-attempt-failed", {
			url: e,
			event: r,
			reason: o
		});
	}
	return {
		ok: !1,
		reason: o ?? "play-rejected",
		src: a[0]
	};
}
function ic(e, t, n, r, i, a, o = "sine") {
	let s = e.createOscillator(), c = e.createGain();
	s.type = o, s.frequency.setValueAtTime(n, r), c.gain.setValueAtTime(1e-4, r), c.gain.exponentialRampToValueAtTime(a, r + .008), c.gain.exponentialRampToValueAtTime(1e-4, r + i), s.connect(c), c.connect(t), s.start(r), s.stop(r + i + .02);
}
function ac(e, t, n, r, i, a = 1400) {
	let o = Math.max(256, Math.floor(e.sampleRate * r)), s = e.createBuffer(1, o, e.sampleRate), c = s.getChannelData(0);
	for (let e = 0; e < o; e += 1) c[e] = (Math.random() * 2 - 1) * (1 - e / o);
	let l = e.createBufferSource();
	l.buffer = s;
	let u = e.createBiquadFilter();
	u.type = "bandpass", u.frequency.value = a, u.Q.value = .6;
	let d = e.createGain();
	d.gain.setValueAtTime(i, n), d.gain.exponentialRampToValueAtTime(1e-4, n + r), l.connect(u), u.connect(d), d.connect(t), l.start(n), l.stop(n + r + .01);
}
function oc(e) {
	let t = Ks();
	if (!t || !Y) return;
	let n = t.currentTime, r = e === "arcade" ? [
		0,
		.04,
		.08,
		.14
	] : [
		0,
		.06,
		.12,
		.2,
		.28
	], i = e === "wood" ? 900 : 1400;
	for (let e of r) ac(t, Y, n + e, .05, .08 + Math.random() * .04, i);
}
function sc(e) {
	let t = Ks();
	if (!t || !Y) return;
	let n = t.currentTime;
	ac(t, Y, n, .04, .06, e === "wood" ? 700 : 1200), ic(t, Y, e === "arcade" ? 660 : 520, n + .05, .08, .05, "triangle");
}
function cc(e, t) {
	let n = Ks();
	if (!n || !Y) return;
	let r = n.currentTime, i = 1 + t * .06, a = e === "wood" ? 680 / i : e === "arcade" ? 1100 : 900;
	ac(n, Y, r, .035, .05, a), ic(n, Y, a * .55, r + .01, .04, .03, "triangle");
}
function lc(e, t) {
	let n = Ks();
	if (!n || !Y) return;
	let r = n.currentTime, i = 1 - t * .04;
	if (e === "arcade") {
		ic(n, Y, 880 * i, r, .07, .055, "square"), ic(n, Y, 1174.66 * i, r + .05, .1, .04, "square");
		return;
	}
	let a = (e === "wood" ? 620 : 740) * i;
	ic(n, Y, a, r, .08, .045, "sine"), ic(n, Y, a * 1.335, r + .05, .12, .035, "triangle");
}
function uc(e) {
	let t = Ks();
	if (!t || !Y) return;
	let n = t.currentTime;
	ac(t, Y, n, .08, .04, e === "wood" ? 520 : 760), ic(t, Y, e === "arcade" ? 440 : 330, n + .04, .14, .035, "sine");
}
function dc(e, t = 1) {
	let n = Ks();
	if (!n || !Y) return;
	let r = n.currentTime, i = Math.min(1.2, t);
	if (e === "arcade") {
		ic(n, Y, 1046.5, r, .1, .1 * i, "square"), ic(n, Y, 1318.51, r + .08, .14, .08 * i, "square");
		return;
	}
	let a = e === "wood" ? 740 : 880;
	ic(n, Y, a, r, .12, .09 * i, "sine"), ic(n, Y, a * 1.335, r + .07, .16, .07 * i, "triangle"), ic(n, Y, a * 2, r + .14, .1, .04 * i, "sine");
}
function fc(e) {
	let t = Ks();
	if (!t || !Y) return;
	let n = t.currentTime;
	if (e === "arcade") {
		ic(t, Y, 523.25, n, .12, .09, "square"), ic(t, Y, 659.25, n + .1, .16, .1, "square"), ic(t, Y, 783.99, n + .22, .2, .1, "square"), ic(t, Y, 1046.5, n + .34, .24, .07, "square");
		return;
	}
	let r = e === "wood" ? .92 : 1;
	ic(t, Y, 659.25 * r, n, .14, .08, "sine"), ic(t, Y, 830.61 * r, n + .1, .18, .09, "triangle"), ic(t, Y, 987.77 * r, n + .22, .22, .1, "sine"), ic(t, Y, 1318.51 * r, n + .34, .28, .06, "triangle");
}
function pc(e) {
	let t = Ks();
	if (!t || !Y) return;
	let n = t.currentTime, r = e === "arcade" ? "sawtooth" : "triangle";
	ic(t, Y, e === "wood" ? 180 : 220, n, .28, .1, r), ic(t, Y, e === "wood" ? 140 : 165, n + .18, .32, .08, r);
}
function mc(e) {
	let t = Ks();
	if (!t || !Y) return;
	let n = t.currentTime;
	ic(t, Y, e === "arcade" ? 520 : 440, n, .05, .04, "triangle");
}
function hc(e) {
	let t = Ks();
	if (!t || !Y) return;
	let n = t.currentTime;
	ic(t, Y, e === "wood" ? 560 : 640, n, .06, .035, "sine");
}
function gc(e) {
	let t = Ks();
	if (!t || !Y) return;
	let n = t.currentTime;
	ic(t, Y, e === "arcade" ? 180 : 220, n, .1, .07, "square"), ac(t, Y, n + .04, .06, .05, 400);
}
var _c = {
	shuffle: (e) => oc(e),
	shuffleFinal: (e) => oc(e),
	draw: (e) => sc(e),
	cardPlace: (e, t) => cc(e, t?.intensityTier ?? 0),
	leadChange: (e, t) => lc(e, t?.intensityTier ?? 0),
	trickWin: (e, t) => dc(e, t?.volumeScale ?? 1),
	trickCollect: (e) => uc(e),
	handWin: (e) => uc(e),
	potWin: (e) => fc(e),
	bourre: (e) => pc(e),
	gameStart: (e) => oc(e),
	openRoom: (e) => oc(e),
	deleteRoom: (e) => gc(e),
	fold: (e) => cc(e, 2),
	cardSelect: (e) => hc(e),
	cardIllegal: (e) => gc(e),
	uiButton: (e) => mc(e)
}, vc = {
	shuffle: { current: !1 },
	shuffleFinal: { current: !1 },
	draw: { current: !1 },
	cardPlace: { current: !1 },
	leadChange: { current: !1 },
	trickWin: { current: !1 },
	trickCollect: { current: !1 },
	handWin: { current: !1 },
	potWin: { current: !1 },
	bourre: { current: !1 },
	gameStart: { current: !1 },
	openRoom: { current: !1 },
	deleteRoom: { current: !1 },
	fold: { current: !1 },
	cardSelect: { current: !1 },
	cardIllegal: { current: !1 },
	uiButton: { current: !1 }
}, yc = {
	shuffle: 360,
	shuffleFinal: 420,
	draw: 280,
	cardPlace: 120,
	leadChange: 180,
	trickWin: 320,
	trickCollect: 280,
	handWin: 320,
	potWin: 580,
	bourre: 520,
	gameStart: 320,
	openRoom: 400,
	deleteRoom: 200,
	fold: 200,
	cardSelect: 100,
	cardIllegal: 200,
	uiButton: 120
}, bc = {
	shuffle: .55,
	shuffleFinal: .58,
	draw: .45,
	cardPlace: .38,
	leadChange: .42,
	trickWin: .55,
	trickCollect: .4,
	handWin: .4,
	potWin: .6,
	bourre: .5,
	gameStart: .42,
	openRoom: .5,
	deleteRoom: .4,
	fold: .42,
	cardSelect: .32,
	cardIllegal: .4,
	uiButton: .36
};
function xc(e, t, n, r, i = {}) {
	Os({
		triggerType: e,
		action: n.action,
		source: n.source,
		event: t,
		result: r,
		url: i.url,
		filename: i.filename ?? Es(i.url),
		resolvedFile: i.resolvedFile,
		assetId: i.assetId ?? void 0,
		usedFallback: i.usedFallback ?? Ds(r),
		fallbackReason: i.fallbackReason,
		tier: i.tier,
		variant: n.variant
	});
}
async function Sc(e, t, n = {}, r = {}) {
	Bs();
	let i = vc[e];
	if (i.current) {
		xc(t, e, r, "deduped", {
			fallbackReason: "deduped",
			tier: n.intensityTier
		});
		return;
	}
	i.current = !0;
	let a = Gs(), o = cs(a, e, n), s = null;
	if (!Rs) {
		ws("skip-locked", { event: e }), xc(t, e, r, "skipped-muted", {
			fallbackReason: "audio-locked",
			tier: n.intensityTier
		}), window.setTimeout(() => {
			i.current = !1;
		}, yc[e]);
		return;
	}
	try {
		let i = !1, c, l;
		if (!o) s = "procedural-only", ws("resolve", {
			event: e,
			key: e,
			assetId: null,
			reason: s,
			triggerType: t,
			...r
		});
		else {
			let u = e === "trickWin" ? bc[e] * (n.volumeScale ?? 1) : bc[e], d = ts[o], f = os(a, o);
			l = d, ws("requested", {
				key: e,
				event: e,
				assetId: o,
				resolvedFile: d,
				src: f,
				triggerType: t,
				...r
			}), ws("resolve", {
				key: e,
				event: e,
				assetId: o,
				resolvedFile: d,
				src: f,
				triggerType: t,
				...r
			});
			let p = await rc(a, o, u, e);
			i = p.ok, c = p.src, p.ok ? l = Es(c) ?? d : s = p.reason ?? "play-rejected";
		}
		if (i) {
			xc(t, e, r, "asset-played", {
				url: c,
				filename: l,
				resolvedFile: o ? ts[o] : l,
				assetId: o,
				usedFallback: !1,
				tier: n.intensityTier
			});
			return;
		}
		if (s === "audio-locked") return;
		let u = s === "procedural-only" ? "procedural-only" : "procedural-fallback";
		ws("fallback-procedural", {
			key: e,
			event: e,
			reason: s ?? "play-rejected",
			assetId: o,
			resolvedFile: o ? ts[o] : void 0,
			usedFallback: !0,
			triggerType: t,
			...r
		}), xc(t, e, r, u, {
			url: c,
			filename: l,
			resolvedFile: o ? ts[o] : void 0,
			assetId: o,
			usedFallback: !0,
			fallbackReason: s ?? void 0,
			tier: n.intensityTier
		}), _c[e](a, n);
	} catch (i) {
		ws("play-error", {
			event: e,
			err: String(i)
		}), xc(t, e, r, "procedural-fallback", {
			fallbackReason: String(i),
			tier: n.intensityTier
		}), Rs && _c[e](a, n);
	} finally {
		window.setTimeout(() => {
			i.current = !1;
		}, yc[e]);
	}
}
function Cc(e, t = {}, n = {}) {
	let r = us[e];
	r !== "action" && ws("trigger-mismatch", {
		event: e,
		expected: r,
		got: "action",
		...n
	}), Sc(e, "action", t, n);
}
function wc(e, t = {}, n = {}) {
	let r = us[e];
	r !== "animation" && ws("trigger-mismatch", {
		event: e,
		expected: r,
		got: "animation",
		...n
	}), Sc(e, "animation", t, n);
}
function Tc(e, t = {}, n = {}) {
	let r = us[e];
	r !== "outcome" && ws("trigger-mismatch", {
		event: e,
		expected: r,
		got: "outcome",
		...n
	}), Sc(e, "outcome", t, n);
}
function Ec(e = "normal", t = {}) {
	wc(e === "final" ? "shuffleFinal" : "shuffle", {}, {
		...t,
		variant: e,
		action: t.action ?? "deal-shuffle"
	});
}
function Dc(e = {}) {
	Cc("draw", {}, {
		...e,
		action: e.action ?? "draw-replace"
	});
}
function Oc(e = 0, t = {}) {
	wc("cardPlace", { intensityTier: e }, {
		...t,
		action: t.action ?? "card-land"
	});
}
function kc(e = 0, t = {}) {
	wc("leadChange", { intensityTier: e }, {
		...t,
		action: t.action ?? "take-lead"
	});
}
function Ac(e = {}) {
	wc("trickCollect", {}, {
		...e,
		action: e.action ?? "trick-collect"
	});
}
function jc(e = 1, t = !1, n = {}) {
	wc("trickWin", {
		volumeScale: e,
		isLocalPlayer: t
	}, {
		...n,
		action: n.action ?? "trick-won"
	});
}
function Mc(e = {}) {
	Tc("potWin", {}, {
		...e,
		action: e.action ?? "pot-win"
	});
}
function Nc(e = {}) {
	Tc("handWin", {}, {
		...e,
		action: e.action ?? "hand-win"
	});
}
function Pc(e = {}) {
	Tc("bourre", {}, {
		...e,
		action: e.action ?? "bourre"
	});
}
function Fc(e = {}) {
	Cc("gameStart", {}, {
		...e,
		action: e.action ?? "game-start"
	});
}
function Ic(e = {}) {
	Cc("openRoom", {}, {
		...e,
		action: e.action ?? "open-room"
	});
}
function Lc(e = {}) {
	Cc("deleteRoom", {}, {
		...e,
		action: e.action ?? "delete-room"
	});
}
function Rc(e = {}) {
	Cc("fold", {}, {
		...e,
		action: e.action ?? "fold"
	});
}
function zc(e = {}) {
	Cc("cardSelect", {}, {
		...e,
		action: e.action ?? "card-select"
	});
}
function Bc(e = {}) {
	Cc("cardIllegal", {}, {
		...e,
		action: e.action ?? "card-illegal"
	});
}
function Vc(e = {}) {
	Cc("uiButton", {}, {
		...e,
		action: e.action ?? "ui-button"
	});
}
function Hc() {
	return typeof window < "u" && !!(window.AudioContext ?? window.webkitAudioContext ?? typeof Audio < "u");
}
function Uc() {
	Hs.clear(), Us.clear(), Vs.clear();
}
//#endregion
//#region src/table/feedback/haptics.ts
function Wc() {
	return typeof navigator < "u" && typeof navigator.vibrate == "function";
}
function Gc(e) {
	let t = typeof window < "u" ? window.BourreHaptics : void 0;
	if (!t) return !1;
	try {
		if (t.notification && e === "strong") return t.notification("success"), !0;
		if (t.impact) {
			let n = e === "light" ? "light" : e === "medium" ? "medium" : "heavy";
			return t.impact(n), !0;
		}
	} catch {}
	return !1;
}
var Kc = {
	light: 12,
	medium: [
		18,
		40,
		28
	],
	strong: [
		30,
		50,
		40,
		50,
		60
	]
};
function qc(e) {
	try {
		return Gc(e) ? !0 : Wc() ? navigator.vibrate(Kc[e]) ?? !1 : !1;
	} catch {
		return !1;
	}
}
function Jc() {
	return Wc() || !!(typeof window < "u" && window.BourreHaptics);
}
var Yc = 700, Xc = 500, Zc = 450, Qc = 1200, $c = 800, el = 2e3, tl = 1500, nl = 1200, rl = 800, il = 400, al = 280, ol = 90, sl = 120, cl = 0, ll = 0, ul = 0, dl = 0, fl = 0, pl = 0, ml = 0, hl = 0, gl = 0, _l = 0, vl = 0, yl = 0, bl = 0, xl = null, Sl = !1;
function Cl() {
	return ms();
}
function wl(e) {
	xs(Cl().hapticsMode, e) && qc(e);
}
function Tl(e, t, n = { source: "service" }) {
	let r = Cl();
	if (!gs(r.soundMode, e)) {
		Os({
			triggerType: us[e],
			event: e,
			result: "skipped-muted",
			fallbackReason: `soundMode:${r.soundMode}`,
			source: n.source,
			action: n.action ?? e
		});
		return;
	}
	t();
}
function El() {
	if (Sl || typeof window > "u") return;
	Sl = !0;
	let e = () => {
		Xs();
	};
	window.addEventListener("pointerdown", e, {
		once: !0,
		passive: !0
	}), window.addEventListener("keydown", e, { once: !0 });
}
function Dl(e = {}) {
	if (Ol(), Date.now() - cl < Yc) return;
	xl &&= (clearTimeout(xl), null);
	let t = e.delayMs ?? (bs() ? 0 : 40);
	xl = window.setTimeout(() => {
		xl = null, cl = Date.now();
		let t = e.variant ?? "normal";
		Tl(t === "final" ? "shuffleFinal" : "shuffle", () => Ec(t, {
			source: "playShuffleFeedback",
			action: "deal-shuffle"
		}), {
			source: "playShuffleFeedback",
			action: "deal-shuffle"
		}), wl("light");
	}, t);
}
function Ol() {
	Xs();
}
function kl() {
	Ol();
	let e = Date.now();
	e - ll < Xc || (ll = e, Tl("draw", () => Dc({
		source: "playDrawFeedback",
		action: "draw"
	}), {
		source: "playDrawFeedback",
		action: "draw"
	}), wl("light"));
}
function Al() {
	let e = Date.now();
	e - ul < Zc || (ul = e, Tl("trickWin", () => jc(1, !0, {
		source: "playTrickWinFeedback",
		action: "trick-won"
	}), {
		source: "playTrickWinFeedback",
		action: "trick-won"
	}), wl("medium"));
}
function jl() {
	let e = Date.now();
	e - dl < Qc || (dl = e, Tl("potWin", () => Mc({
		source: "playPotWinFeedback",
		action: "pot-win"
	}), {
		source: "playPotWinFeedback",
		action: "pot-win"
	}), wl("strong"));
}
function Ml() {
	jl();
}
function Nl() {
	let e = Date.now();
	e - fl < $c || (fl = e, Tl("handWin", () => Nc({
		source: "playHandWinFeedback",
		action: "hand-win"
	}), {
		source: "playHandWinFeedback",
		action: "hand-win"
	}), wl("medium"));
}
function Pl() {
	let e = Date.now();
	e - pl < el || (pl = e, Tl("bourre", () => Pc({
		source: "playBourreFeedback",
		action: "bourre"
	}), {
		source: "playBourreFeedback",
		action: "bourre"
	}), wl("medium"));
}
function Fl() {
	Ol();
	let e = Date.now();
	e - ml < tl || (ml = e, Tl("gameStart", () => Fc({
		source: "playGameStartFeedback",
		action: "game-start"
	}), {
		source: "playGameStartFeedback",
		action: "game-start"
	}), wl("light"));
}
function Il() {
	Ol();
	let e = Date.now();
	e - hl < nl || (hl = e, Tl("openRoom", () => Ic({
		source: "playOpenRoomFeedback",
		action: "open-room"
	}), {
		source: "playOpenRoomFeedback",
		action: "open-room"
	}), wl("light"));
}
function X() {
	Ol();
	let e = Date.now();
	e - gl < rl || (gl = e, Tl("deleteRoom", () => Lc({
		source: "playDeleteRoomFeedback",
		action: "delete-room"
	}), {
		source: "playDeleteRoomFeedback",
		action: "delete-room"
	}), wl("light"));
}
function Z() {
	Ol();
	let e = Date.now();
	e - _l < il || (_l = e, Tl("fold", () => Rc({
		source: "playFoldFeedback",
		action: "fold"
	}), {
		source: "playFoldFeedback",
		action: "fold"
	}), wl("light"));
}
function Ll() {
	Ol();
	let e = Date.now();
	e - vl < al || (vl = e, Tl("cardIllegal", () => Bc({
		source: "playIllegalActionFeedback",
		action: "card-illegal"
	}), {
		source: "playIllegalActionFeedback",
		action: "card-illegal"
	}), wl("light"));
}
function Rl() {
	Ol();
	let e = Date.now();
	e - yl < ol || (yl = e, Tl("cardSelect", () => zc({
		source: "playCardSelectFeedback",
		action: "card-select"
	}), {
		source: "playCardSelectFeedback",
		action: "card-select"
	}));
}
function zl() {
	Ol();
	let e = Date.now();
	e - bl < sl || (bl = e, Tl("uiButton", () => Vc({
		source: "playUiButtonFeedback",
		action: "ui-button"
	}), {
		source: "playUiButtonFeedback",
		action: "ui-button"
	}));
}
function Bl() {
	wl("light");
}
//#endregion
//#region src/table/actionErrorCopy.ts
function Vl(e) {
	let t = String(e ?? "").trim();
	if (!t) return null;
	let n = t.toLowerCase();
	return n === "internal" || n.includes("internal error") ? "The server could not finish that table action. Refresh the page and try again." : t;
}
//#endregion
//#region src/table/theme/cardPacks.ts
var Hl = "classic";
function Ul(e) {
	return e === "elegant" || e === "casino" || e === "midnight" ? e : Hl;
}
//#endregion
//#region src/table/theme/settings.ts
var Wl = "nbl-table-settings", Gl = {
	focusTable: "F",
	toggleSettings: ",",
	standPat: "P",
	nextTable: "Tab"
}, Kl = {
	classic: "Classic",
	elegant: "Elegant",
	casino: "Casino",
	midnight: "Midnight"
}, ql = {
	themeId: "night-felt",
	cardPackId: Hl,
	deckMode: "classic",
	cardScale: "md",
	highContrast: !1,
	tableScale: 1,
	layoutMode: "single",
	hotkeys: { ...Gl }
}, Jl = {
	carbon: "Carbon",
	simple: "Simple",
	"night-felt": "Night Felt",
	arena: "Arena"
};
function Yl(e) {
	return Math.max(.85, Math.min(1.35, e));
}
function Xl() {
	try {
		let e = localStorage.getItem(Wl);
		if (!e) return {
			...ql,
			hotkeys: { ...Gl }
		};
		let t = JSON.parse(e);
		return {
			...ql,
			...t,
			cardPackId: Ul(t.cardPackId),
			tableScale: Yl(t.tableScale ?? ql.tableScale),
			hotkeys: {
				...Gl,
				...t.hotkeys
			}
		};
	} catch {
		return {
			...ql,
			hotkeys: { ...Gl }
		};
	}
}
function Zl(e) {
	try {
		localStorage.setItem(Wl, JSON.stringify(e));
	} catch {}
}
function Ql(e, t) {
	e.dataset.tableTheme = t.themeId, e.dataset.cardPack = t.cardPackId, e.dataset.deckMode = t.deckMode, e.dataset.cardScale = t.cardScale, e.dataset.highContrast = t.highContrast ? "true" : "false", e.dataset.layoutMode = t.layoutMode, e.style.setProperty("--table-scale", String(t.tableScale));
}
//#endregion
//#region src/table/theme/TableThemeContext.tsx
var $l = (0, l.createContext)(null);
function eu({ settings: e, children: t }) {
	let n = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		n.current && Ql(n.current, e);
	}, [e]), /* @__PURE__ */ (0, g.jsx)("div", {
		ref: n,
		className: "btable-room",
		children: t
	});
}
function tu({ children: e }) {
	let [t, n] = (0, l.useState)(() => Xl()), r = (0, l.useCallback)((e) => {
		n((t) => {
			let n = {
				...t,
				...e,
				hotkeys: {
					...t.hotkeys,
					...e.hotkeys
				}
			};
			return Zl(n), n;
		});
	}, []), i = (0, l.useCallback)(() => {
		let e = {
			...ql,
			hotkeys: { ...ql.hotkeys }
		};
		Zl(e), n(e);
	}, []), a = (0, l.useMemo)(() => ({
		settings: t,
		updateSettings: r,
		resetSettings: i
	}), [
		t,
		r,
		i
	]);
	return /* @__PURE__ */ (0, g.jsx)($l.Provider, {
		value: a,
		children: /* @__PURE__ */ (0, g.jsx)(eu, {
			settings: t,
			children: e
		})
	});
}
//#endregion
//#region src/table/theme/useTableTheme.ts
function nu() {
	let e = (0, l.useContext)($l);
	if (!e) throw Error("useTableTheme must be used within TableThemeProvider");
	return e;
}
//#endregion
//#region src/table/presentationMotionBusy.ts
var ru = !1, iu = !1, au = /* @__PURE__ */ new Set();
function ou() {
	for (let e of au) e();
}
function su(e) {
	ru !== e && (ru = e, ou());
}
function cu() {
	return ru;
}
function lu(e) {
	iu !== e && (iu = e, ou());
}
function uu() {
	return iu;
}
function du(e) {
	return au.add(e), () => au.delete(e);
}
function fu() {
	ru = !1, iu = !1, ou();
}
//#endregion
//#region src/table/gameFlowDebug.ts
var pu = "nbl-game-flow-debug", mu = !1, hu = null;
function gu() {
	if (mu) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(pu) === "1" ? !0 : new URLSearchParams(window.location.search).has("gameFlowDebug");
	} catch {
		return !1;
	}
}
function _u(e, t, n) {
	if (!gu()) return;
	let r = `[nbl-flow ${typeof performance < "u" ? `${performance.now().toFixed(1)}ms` : ""}] ${e} :: ${t}`;
	if (hu) {
		hu(r.trim(), n);
		return;
	}
	console.info(r, n ?? "");
}
var vu = {
	pipelineActive: !1,
	revealCatchUp: !1,
	motionGateActive: !1,
	peakPlayCount: 0,
	displayedPlayCount: 0,
	handPresenting: !1,
	handPresentationPhase: "idle",
	dealPresentationActive: !1,
	trickCollectionActive: !1
}, yu = vu, bu = /* @__PURE__ */ new Set(), xu = 0, Su = null;
function Cu(e, t) {
	return e.pipelineActive === t.pipelineActive && e.revealCatchUp === t.revealCatchUp && e.motionGateActive === t.motionGateActive && e.peakPlayCount === t.peakPlayCount && e.displayedPlayCount === t.displayedPlayCount && e.handPresenting === t.handPresenting && e.handPresentationPhase === t.handPresentationPhase && e.dealPresentationActive === t.dealPresentationActive && e.trickCollectionActive === t.trickCollectionActive;
}
function wu(e) {
	return e.dealPresentationActive ? "dealPresentationActive" : e.trickCollectionActive ? "trickCollectionActive" : e.handPresenting ? "handPresenting" : e.pipelineActive ? "pipelineActive" : e.revealCatchUp ? "revealCatchUp" : e.peakPlayCount > e.displayedPlayCount && e.peakPlayCount > 0 ? "peakPlayCatchUp" : null;
}
function Tu(e) {
	return wu(e) != null;
}
function Eu(e, t, n) {
	return !(!e || n === "play" || n === "draw" && (t === "drawPlayer" || t === "drawReady"));
}
function Du(e) {
	let t = { ...yu }, n = Su ? Date.now() - Su.since : 0, r = {
		...yu,
		pipelineActive: !1,
		revealCatchUp: !1,
		handPresenting: !1,
		handPresentationPhase: "idle",
		peakPlayCount: yu.displayedPlayCount,
		motionGateActive: !1,
		dealPresentationActive: !1,
		trickCollectionActive: !1
	};
	xu = Date.now() + 1500, Su = null, gu() && _u("trickAnimationBridge", "table-presentation-force-release", {
		source: e,
		blockedMs: n,
		from: t,
		to: r
	}), Au(r);
}
function Ou(e = Date.now()) {
	if (e < xu) return {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	let t = wu(yu);
	if (t == null) return Su = null, {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	(!Su || Su.reason !== t) && (Su = {
		reason: t,
		since: e,
		blockedLogged: !1
	});
	let n = e - Su.since;
	return n >= 7e3 ? (gu() && !Su.blockedLogged && _u("trickAnimationBridge", "gate-force-release", {
		reason: t,
		blockedMs: n
	}), Du("gate-timeout"), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !0
	}) : n >= 5500 ? (gu() && !Su.blockedLogged && (_u("trickAnimationBridge", "gate-soft-unblock", {
		reason: t,
		blockedMs: n
	}), Su.blockedLogged = !0), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !1
	}) : (gu() && !Su.blockedLogged && (_u("trickAnimationBridge", "gate-blocked", {
		reason: t,
		blockedMs: n
	}), Su.blockedLogged = !0), {
		blocked: !0,
		reason: t,
		blockedMs: n,
		softUnblock: !1,
		forceReleased: !1
	});
}
function ku(e = Date.now()) {
	return Ou(e).blocked;
}
function Au(e) {
	if (!Cu(yu, e)) {
		gu() && _u("trickAnimationBridge", "busy-state", {
			from: yu,
			to: e,
			busy: Tu(e),
			blockReason: wu(e),
			motionGateActive: e.motionGateActive,
			handPresentationPhase: e.handPresentationPhase
		}), yu = e, wu(e) ?? (Su = null);
		for (let e of bu) e();
	}
}
function ju() {
	xu = 0, Su = null, Au(vu);
}
function Mu() {
	return yu;
}
function Nu() {
	return yu.pipelineActive || yu.revealCatchUp || yu.motionGateActive || yu.trickCollectionActive || yu.peakPlayCount > yu.displayedPlayCount && yu.peakPlayCount > 0;
}
function Pu() {
	return Tu(yu);
}
function Fu(e) {
	return bu.add(e), () => bu.delete(e);
}
//#endregion
//#region src/table/stageFitMotionFreeze.ts
var Iu = !1, Lu = /* @__PURE__ */ new Set();
function Ru() {
	for (let e of Lu) e();
}
function zu(e) {
	Iu !== e && (Iu = e, Ru());
}
function Bu() {
	if (cu() || uu() || Iu || Nu()) return !0;
	let e = Mu();
	return !!(e.handPresenting && e.handPresentationPhase !== "idle");
}
function Vu(e) {
	Lu.add(e);
	let t = du(e), n = Fu(e);
	return () => {
		Lu.delete(e), t(), n();
	};
}
//#endregion
//#region src/table/HeroHand.tsx
function Hu(e, t, n = []) {
	return [
		`btable-hero btable-hero--bare btable-hero--scale-${e.cardScale}`,
		...n,
		t
	].filter(Boolean).join(" ");
}
function Uu({ className: e = "" }) {
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: `btable-hero btable-hero--bare btable-hero--reserved ${e}`.trim(),
		"aria-hidden": "true",
		"data-testid": "hero-hand"
	});
}
function Wu({ cards: e, phase: t, enrollmentActive: n = !1, isInHand: r = !1, isDealer: i = !1, signedIn: a = !1, isMyTurn: o = !1, drawCompleted: s = !1, maxDrawDiscards: c = 4, legalPlayIndices: u, recommendedPlayIndex: d = null, recommendedDiscardIndices: f = [], handComplete: p = !1, actionFeedback: m, onSubmitDraw: h, onPassDraw: _, onFoldDraw: v, onPlayCard: y, privateHandReady: b = !1, className: x = "", dealStaggerMs: S = 120, drawAnimSubPhase: C = null, drawDiscardCount: w = 0, drawReplaceCount: T = 0, currentUserId: E = null, revealedTrumpIndex: D = null, trumpMergeActive: O = !1, trumpDisabledIndex: k = null, handNumber: A = 0, trickNumber: j = null, turnPlayerId: M = null, tableRootRef: N, pileIndexRef: te, onDiscardCommitted: P, onUserActivity: F, skipHeroDealMotion: I = !1 }) {
	let { settings: ne } = nu(), [L, R] = (0, l.useState)(/* @__PURE__ */ new Set()), [z, B] = (0, l.useState)(null), [V, H] = (0, l.useState)(null), [re, ie] = (0, l.useState)(null), [U, ae] = (0, l.useState)(!1), [oe, se] = (0, l.useState)(null), [ce, le] = (0, l.useState)(null), [ue, de] = (0, l.useState)(null), [fe, pe] = (0, l.useState)(() => _o()), [W, me] = (0, l.useState)(!1), [he, ge] = (0, l.useState)(!1), [_e, ve] = (0, l.useState)(!1), [ye, be] = (0, l.useState)([]), xe = (0, l.useRef)(/* @__PURE__ */ new Set()), Se = (0, l.useRef)(null), Ce = (0, l.useRef)(!1), we = (0, l.useRef)(null), Te = (0, l.useRef)(null), Ee = (0, l.useRef)(0), De = (0, l.useRef)({
		handNumber: 0,
		trickNumber: null,
		turnPlayerId: null,
		isMyTurn: !1,
		busy: !1,
		selectedPlay: null
	}), Oe = Uo({
		handNumber: A,
		trickNumber: j,
		turnPlayerId: M,
		phase: t ?? null
	}), [G, ke] = (0, l.useState)(!1), Ae = (0, l.useRef)(async () => {}), je = Ka(t), Me = (0, l.useMemo)(() => e.map(Ua), [e]), Ne = (0, l.useMemo)(() => e.map((e) => `${e.rank}-${e.suit}`).join("|"), [e]), Pe = (0, l.useMemo)(() => f.slice().sort((e, t) => e - t).join(","), [f]), Fe = t === "draw", Ie = t === "play", K = U || m?.status === "loading" || V !== null;
	De.current = {
		handNumber: A,
		trickNumber: j,
		turnPlayerId: M,
		isMyTurn: o,
		busy: K,
		selectedPlay: z
	};
	let Le = (0, l.useCallback)((e, t) => D === t ? O ? "hand__slot--trump-merge-target" : "hand__slot--trump-revealed" : "", [D, O]);
	(0, l.useEffect)(() => {
		if (I || !je || e.length === 0) return;
		let t = new Set(e.map((e) => `${e.rank}-${e.suit}`)), n = xe.current, r = [...t].some((e) => !n.has(e));
		if (xe.current = t, !r || n.size > 0) return;
		me(!0), H(null), B(null);
		let i = Ha(e.length, S), a = window.setTimeout(() => me(!1), i);
		return () => window.clearTimeout(a);
	}, [
		e,
		je,
		S,
		I
	]), (0, l.useEffect)(() => {
		(C === "done" || C === null) && be([]);
	}, [C]), (0, l.useEffect)(() => (zu(V !== null), () => zu(!1)), [V]), Va(Se, {
		dealing: W,
		dealStaggerMs: S,
		drawAnimSubPhase: C,
		drawDiscardCount: w,
		drawReplaceCount: T,
		pendingDiscardIndices: ye,
		standPatPulse: he,
		foldOutPulse: _e,
		playingIndex: V,
		cards: e,
		handNumber: A,
		playerId: E,
		tableRootRef: N,
		pileIndexRef: te,
		onDiscardCommitted: P,
		skipHeroDealMotion: I
	});
	let Re = (0, l.useCallback)((e) => {
		if (we.current != null && (window.clearTimeout(we.current), we.current = null, e)) {
			let e = De.current;
			e.handNumber, e.trickNumber, e.turnPlayerId, e.selectedPlay, Ee.current, e.isMyTurn, Ce.current, e.busy;
		}
		Te.current = null;
	}, []), ze = (0, l.useCallback)(() => (Ee.current += 1, Ee.current), []);
	(0, l.useEffect)(() => () => Re(), [Re]), (0, l.useEffect)(() => {
		Re(), B(null), R(/* @__PURE__ */ new Set()), ke(!1), ie(null), le(null), de(null), se(null);
	}, [
		t,
		Ne,
		Re
	]), (0, l.useEffect)(() => {
		z !== null && (Jo(z, u) || (B(null), Te.current = null, Re()));
	}, [
		u,
		z,
		Re
	]), (0, l.useEffect)(() => {
		if (!fe || !Fe || s || G) return;
		let e = f;
		R((t) => t.size === e.length && e.every((e) => t.has(e)) ? t : new Set(e));
	}, [
		fe,
		Fe,
		s,
		G,
		Pe,
		f
	]);
	let Be = (0, l.useRef)(o);
	(0, l.useEffect)(() => {
		let e = o && !Be.current;
		if (Be.current = o, !(!e || !Ie || z === null || Ce.current || K)) {
			if (!Jo(z, u)) {
				B(null), Te.current = null;
				return;
			}
			Ae.current(z);
		}
	}, [
		Ie,
		o,
		z,
		u,
		K,
		A,
		j,
		M
	]);
	let Ve = (0, l.useRef)(Oe);
	(0, l.useEffect)(() => {
		if (Ve.current === Oe) return;
		let e = Go(Ve.current), t = Go(Oe);
		Ve.current = Oe, ze(), Re("play-activity-change"), Wo(e, t) && B(null);
	}, [
		Oe,
		ze,
		Re,
		A,
		j,
		M
	]), (0, l.useEffect)(() => {
		m?.status === "success" ? (H(null), Re(), Ce.current = !1) : m?.status === "error" && (H(null), Ce.current = !1);
	}, [m?.status, Re]);
	let He = (0, l.useRef)(void 0);
	(0, l.useEffect)(() => {
		let e = m?.status, t = He.current;
		He.current = e, t === "error" && e !== "error" && se(null);
	}, [m?.status]);
	let Ue = ne.cardScale === "lg" ? "md" : "sm", We = Vl(m?.status === "error" ? m.message : oe), Ge = Wa(t, n);
	(0, l.useEffect)(() => {
		F && Fe && L.size > 0 && F();
	}, [
		Fe,
		L.size,
		F
	]), (0, l.useEffect)(() => {
		F && Ie && z !== null && F();
	}, [
		Ie,
		z,
		F
	]);
	let Ke = (0, l.useCallback)(() => {
		F?.();
	}, [F]), qe = (0, l.useCallback)((e) => {
		K || k === e || (ke(!0), Ke(), Rl(), se(null), R((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.size < c ? n.add(e) : se(`You may discard at most ${c} cards`), n;
		}));
	}, [
		K,
		c,
		k,
		Ke
	]), Je = (0, l.useCallback)(async (e, t = "tap-autoplay") => {
		if (Ce.current || K || !y) {
			Ce.current;
			return;
		}
		if (!Jo(e, u)) return;
		ze(), Re(), Ce.current = !0, H(e), se(null), Ee.current;
		let n = Me[e];
		E && n && co(E, Qa({
			playerId: E,
			card: {
				rank: String(n.rank),
				suit: String(n.suit)
			}
		}), e);
		try {
			await Promise.resolve(y(e)), H(null), B(null), Ce.current = !1;
		} catch {
			H(null), Ce.current = !1;
		}
	}, [
		K,
		ze,
		Re,
		E,
		A,
		o,
		u,
		y,
		j,
		M,
		Me
	]), Ye = (0, l.useCallback)((e) => {
		if (Ce.current || K || !y || t !== "play") return;
		let n = Jo(e, u);
		if (!n) {
			o && (Ll(), ze(), Re("illegal"), B(null), le(e), de(e), window.setTimeout(() => {
				le(null), de(null);
			}, fo.illegalFlash), se("Illegal play"));
			return;
		}
		let r = Vo({
			selectedPlay: z,
			tappedIndex: e,
			isMyTurn: o,
			isLegal: n
		});
		if (r.isDeselect) {
			ze(), Re("deselect"), B(null);
			return;
		}
		if (r.shouldCancelAutoplay && z !== null && z !== e && (ze(), Re("selection-switch")), r.shouldImmediatePlay && r.nextSelection !== null) {
			B(r.nextSelection), se(null), Ke(), r.nextSelection, Je(r.nextSelection, "tap");
			return;
		}
		B(r.nextSelection), se(null), Ke(), Rl(), r.shouldQueueSelection, r.nextSelection;
	}, [
		ze,
		K,
		Re,
		Je,
		A,
		o,
		u,
		Ke,
		y,
		t,
		z,
		j,
		M
	]), Xe = (0, l.useCallback)((e) => {
		if (Ce.current || K || !y || t !== "play") return;
		let n = Jo(e, u);
		Ce.current, Ho(o, n) && (ze(), Re("swipe"), B(e), Je(e, "swipe"));
	}, [
		ze,
		K,
		Re,
		Je,
		A,
		o,
		u,
		y,
		t,
		j,
		M
	]), Ze = (0, l.useCallback)((e, t = "tap") => {
		if (t === "swipe-flick") {
			Xe(e);
			return;
		}
		if (t === "hold") {
			Xe(e);
			return;
		}
		Ye(e);
	}, [Xe, Ye]);
	Ae.current = (e) => Je(e, "tap-autoplay");
	let Qe = (0, l.useCallback)(async (e) => {
		if (!(!h || K)) {
			if (Ke(), e.length > c) {
				se(`You may discard at most ${c} cards`);
				return;
			}
			ae(!0), se(null), be([...e]);
			try {
				await h(e), R(/* @__PURE__ */ new Set());
			} catch {} finally {
				ae(!1);
			}
		}
	}, [
		h,
		K,
		c,
		Ke
	]), $e = (0, l.useCallback)(async () => {
		if (!(!_ || K)) {
			Ke(), ae(!0), se(null);
			try {
				await _(), R(/* @__PURE__ */ new Set()), ge(!0), window.setTimeout(() => ge(!1), 700);
			} catch {} finally {
				ae(!1);
			}
		}
	}, [
		_,
		K,
		Ke
	]), et = (0, l.useCallback)(async () => {
		if (!(!v || K)) {
			Ke(), ve(!0), ae(!0), se(null);
			try {
				await v(), R(/* @__PURE__ */ new Set());
			} catch {
				ve(!1);
			} finally {
				ae(!1);
			}
		}
	}, [
		v,
		K,
		Ke
	]), tt = (0, l.useCallback)((e) => {
		Ll(), Re(), B(null), le(e), de(e), window.setTimeout(() => {
			le(null), de(null);
		}, fo.illegalFlash), se("Illegal play");
	}, [Re]), nt = (0, l.useCallback)((e) => {
		if (pe(e), vo(e), e) {
			ke(!1);
			return;
		}
		G || R(/* @__PURE__ */ new Set());
	}, [G]), rt = a && r && (Fe || Ie), it = (0, l.useMemo)(() => Zo({
		selectedDraw: L,
		drawSelectionTouched: G,
		bestPlayEnabled: fe,
		recommendedDiscardIndices: f
	}), [
		L,
		G,
		fe,
		Pe,
		f
	]), at = () => rt ? /* @__PURE__ */ (0, g.jsxs)("label", {
		className: "btable-hero__best-play",
		children: [/* @__PURE__ */ (0, g.jsx)("input", {
			type: "checkbox",
			className: "btable-hero__best-play-input",
			checked: fe,
			onChange: (e) => nt(e.target.checked),
			"data-testid": "best-play-checkbox"
		}), /* @__PURE__ */ (0, g.jsx)("span", {
			className: "btable-hero__best-play-label",
			children: "Best Play"
		})]
	}) : null;
	if (!a) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: Hu(ne, x),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "Sign in to see your dealt cards."
		})
	});
	if (!r && !n && !je) return /* @__PURE__ */ (0, g.jsx)(Uu, { className: x });
	if (je && r && e.length === 0) return p && n ? /* @__PURE__ */ (0, g.jsx)(Uu, { className: x }) : /* @__PURE__ */ (0, g.jsxs)("div", {
		className: Hu(ne, x),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: [/* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: b ? "Cards not available — leave and re-open the session, or refresh the page." : "Loading your cards…"
		}), /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: at()
		})]
	});
	if (je && !r && (t === "draw" || t === "play")) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: Hu(ne, x),
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "You sat out this hand."
		})
	});
	if (e.length === 0 && !i) return rt ? /* @__PURE__ */ (0, g.jsx)("div", {
		className: Hu(ne, x, ["btable-hero--reserved"]),
		"data-testid": "hero-hand",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: at()
		})
	}) : /* @__PURE__ */ (0, g.jsx)(Uu, { className: x });
	let ot = Ko({
		showBestPlayControl: rt,
		inPlayPhase: Ie,
		bestPlayEnabled: fe,
		recommendedPlayIndex: d
	}), st = (0, l.useCallback)((e) => qo({
		inPlayPhase: Ie,
		isMyTurn: o,
		busy: K,
		cardIndex: e,
		selectedPlay: z,
		isLegal: Jo(e, u),
		showBestPlayRecommendation: ot,
		recommendedPlayIndex: d
	}), [
		K,
		Ie,
		o,
		u,
		d,
		z,
		ot
	]), ct = (e, t) => {
		if (D === t) return "trump";
		if (k === t && (Fe || Ie)) return "muted";
		if (V === t || ue === t || ce === t) return "default";
		if (Fe && L.has(t)) return "draw-selected";
		let n = st(t);
		return n === "play-preselected" ? "play-preselected" : n === "play-recommended" ? "play-recommended" : Ie && u && !u.includes(t) ? "muted" : "default";
	}, lt = je && r && !(Ie && o), ut = "none";
	Ie && r ? ut = "play" : Fe && r && !s ? ut = "draw-select" : lt && (ut = "peek");
	let dt = it.length, ft = Fe && !s && o;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: Hu(ne, x, [
			W && !I ? "btable-hero--dealing" : "",
			D === null ? "" : "btable-hero--trump-reveal",
			O ? "btable-hero--trump-merge" : "",
			Fe && o && !s ? "btable-hero--draw-select" : "",
			C === "discard" && w > 0 ? "btable-hero--draw-discard" : "",
			C === "receive" && T > 0 ? "btable-hero--draw-receive" : "",
			ft ? "btable-hero--draw-actions" : "",
			Fe && o && !s || Ie && o ? "btable-hero--your-turn" : "",
			(Fe || Ie) && r && !o ? "btable-hero--waiting-turn" : "",
			he ? "btable-hero--stand-pat" : "",
			_e ? "btable-hero--fold-out" : ""
		]),
		style: { "--deal-card-stagger-ms": `${S}ms` },
		"data-testid": "hero-hand",
		"aria-label": `Your dealt cards — ${Ge}`,
		children: [
			/* @__PURE__ */ (0, g.jsxs)("p", {
				className: "btable-sr-only",
				"aria-live": "polite",
				children: [
					Ge,
					Fe && !s && o && " — tap cards to discard; red border marks your selection",
					Ie && o && " — tap a legal card to play",
					fe && Ie && " — green outline marks Best Play suggestions"
				]
			}),
			/* @__PURE__ */ (0, g.jsxs)("div", {
				ref: Se,
				className: "btable-hero__hand-3d",
				"data-trick-play-origin": E ?? void 0,
				"data-trick-play-origin-active": Ie && o && E ? E : void 0,
				children: [/* @__PURE__ */ (0, g.jsx)("div", {
					className: "btable-hero__hand-row",
					"data-hero-play-turn": Ie && o ? "true" : void 0,
					children: /* @__PURE__ */ (0, g.jsx)(ee, {
						cards: Me,
						size: Ue,
						fan: !0,
						dealSeatPlayerId: E,
						stateFor: ct,
						slotClassFor: Le,
						peekIndex: re,
						onCardPeek: lt ? ie : void 0,
						cardTestId: Ie && o ? "play-button" : void 0,
						cardInteraction: {
							mode: ut,
							isMyTurn: o,
							legalPlayIndices: u,
							playingIndex: V,
							illegalShakeIndex: ce,
							illegalFlashIndex: ue,
							busy: K,
							showPlayableHint: !0,
							playableHintFor: (e) => st(e) === "legal-playable",
							allowPlayPreselect: Ie && r && !o,
							trickPlayOriginPlayerId: E,
							onPlayCard: Ze,
							onSelectCard: qe,
							onIllegalPlay: tt,
							onPeek: ie
						}
					})
				}), at()]
			}),
			Ie && !o && z !== null && /* @__PURE__ */ (0, g.jsx)("span", {
				className: "btable-sr-only",
				"data-testid": "play-preselect-hint",
				children: "Your selected card will play on your turn"
			}),
			We && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-hero__error",
				role: "alert",
				children: We
			}),
			/* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-hero__actions-slot",
				"aria-hidden": !ft,
				children: ft && /* @__PURE__ */ (0, g.jsxs)("div", {
					className: "btable-hero__actions btable-hero__actions--triple",
					children: [
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--action-draw",
							"data-testid": "draw-button",
							disabled: K,
							"aria-busy": K,
							onClick: () => {
								kl(), Qe(it);
							},
							children: K ? "Drawing…" : `Draw${dt > 0 ? ` (${dt})` : ""}`
						}),
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--action-pat",
							"data-testid": "pass-draw-button",
							disabled: K,
							onClick: () => {
								zl(), $e();
							},
							children: "Stand pat"
						}),
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--action-out",
							"data-testid": "im-out-button",
							disabled: K,
							onClick: () => {
								Z(), et();
							},
							children: "I'm Out"
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region src/table/BigPotBrewingIndicator.tsx
function Gu({ event: e, onDismiss: t }) {
	return (0, l.useEffect)(() => {
		let n = window.setTimeout(() => t(e.id), e.durationMs ?? 2e3);
		return () => window.clearTimeout(n);
	}, [
		e.id,
		e.durationMs,
		t
	]), /* @__PURE__ */ (0, g.jsxs)("div", {
		className: "bpot-brew",
		role: "status",
		"aria-live": "polite",
		"data-testid": "big-pot-brewing",
		children: [/* @__PURE__ */ (0, g.jsx)("div", {
			className: "bpot-brew__glow",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "bpot-brew__content",
			children: [
				e.emoji && /* @__PURE__ */ (0, g.jsx)("span", {
					className: "bpot-brew__emoji",
					children: e.emoji
				}),
				/* @__PURE__ */ (0, g.jsx)("p", {
					className: "bpot-brew__title",
					children: e.title
				}),
				e.subtitle && /* @__PURE__ */ (0, g.jsx)("p", {
					className: "bpot-brew__subtitle",
					children: e.subtitle
				})
			]
		})]
	});
}
//#endregion
//#region src/table/heroCardArea.ts
function Ku(e) {
	return (e?.length ?? 0) === 0;
}
//#endregion
//#region src/table/layout/seatPresetAnchors.ts
var qu = {
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
}, Ju = {
	sixBotBottomLeft: qu[1],
	sixBotBottomRight: qu[6],
	sixBotTopCenter: qu[4]
}, Yu = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: Ju.sixBotBottomLeft,
	2: qu[3],
	3: qu[5],
	4: Ju.sixBotBottomRight
}, Xu = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: Ju.sixBotBottomLeft,
	2: {
		x: 9.3,
		y: 27.5,
		region: "left"
	},
	3: {
		x: 50,
		y: 5,
		region: "top"
	},
	4: {
		x: 90.7,
		y: 27.5,
		region: "right"
	},
	5: Ju.sixBotBottomRight
}, Zu = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: Ju.sixBotBottomLeft,
	2: qu[2],
	3: qu[3],
	4: Ju.sixBotTopCenter,
	5: qu[5],
	6: {
		x: 98,
		y: 46.5,
		region: "right"
	},
	7: Ju.sixBotBottomRight
}, Qu = {
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
}, $u = {
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
}, ed = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: Qu[1],
	2: Qu[2],
	3: Qu[3],
	4: Qu[4],
	5: Qu[5],
	6: {
		x: 92,
		y: 46.5,
		region: "right"
	},
	7: Qu[6]
}, td = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: $u[1],
	2: $u[2],
	3: $u[3],
	4: $u[4],
	5: $u[5],
	6: {
		x: 92,
		y: 46.5,
		region: "right"
	},
	7: $u[6]
};
Qu[1], Qu[6], Qu[4];
function nd(e) {
	return e === "landscape" ? $u : Qu;
}
function rd(e) {
	return e === "landscape" ? td : ed;
}
function id(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function ad(e, t) {
	return id(e, t) >= 5;
}
function od(e, t, n) {
	if (n !== "play") return [];
	let r = [...new Set(t.filter(Boolean))];
	return r.length < 2 || 5 - id(e, r) != 1 ? [] : r.filter((t) => (e[t] ?? 0) === 0);
}
function sd(e, t, n, r) {
	return od(t, n, r).includes(e);
}
function cd(e, t) {
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
function ld(e) {
	return `$${e.toLocaleString("en-US")}`;
}
function ud(e) {
	let t = Math.round(Number(e) * 100) / 100;
	return !Number.isFinite(t) || t <= 0 ? "$0" : t < 1 ? `${Math.round(t * 100)}¢` : Math.round(t * 100) % 100 == 0 ? `$${Math.round(t).toLocaleString("en-US")}` : `$${t.toFixed(2)}`;
}
function dd(e) {
	let t = Number(e) || 0;
	return t > 0 ? `+${ld(t)}` : t < 0 ? `−${ld(Math.abs(t))}` : ld(0);
}
function fd(e) {
	return ld(Math.max(0, Number(e) || 0));
}
function pd(e, t, n) {
	return e == null || n.anteAlreadyPosted || !n.inHand || !n.anteAnimActive ? e : Math.max(0, e - Math.max(0, t));
}
function md(e) {
	return (e || "?").trim().replace(/\s+bot$/i, "").replace(/^bot\s+/i, "").trim() || "?";
}
function hd(e) {
	switch (Math.max(2, Math.min(8, e || 2))) {
		case 2: return {
			rx: 44,
			ry: 42,
			outset: 8
		};
		case 3: return {
			rx: 50,
			ry: 48,
			outset: 6
		};
		case 4: return {
			rx: 48,
			ry: 46,
			outset: 6
		};
		case 5: return {
			rx: 45,
			ry: 43,
			outset: 5
		};
		case 6: return {
			rx: 43,
			ry: 41,
			outset: 4
		};
		case 7: return {
			rx: 41,
			ry: 39,
			outset: 4
		};
		case 8: return {
			rx: 40,
			ry: 38,
			outset: 3
		};
		default: return {
			rx: 46,
			ry: 44,
			outset: 5
		};
	}
}
function gd(e) {
	let t = Math.cos(e), n = Math.sin(e);
	return Math.abs(n) >= Math.abs(t) ? n > 0 ? "bottom" : "top" : t > 0 ? "right" : "left";
}
var _d = Zu, vd = qu, yd = Yu, Q = Xu;
function bd(e, t) {
	let { rx: n, ry: r, outset: i } = hd(t), a = e / t * Math.PI * 2 + Math.PI / 2, o = Math.cos(a), s = Math.sin(a);
	return {
		x: 50 + n * o + o * i,
		y: 50 + r * s + s * i,
		region: gd(a)
	};
}
function xd(e, t) {
	let n = Math.max(2, Math.min(8, t || 2));
	if (n <= 0) return {
		x: 50,
		y: 50,
		region: "bottom"
	};
	if (n === 5) {
		let t = yd[e];
		if (t) return t;
	}
	if (n === 6) {
		let t = Q[e];
		if (t) return t;
	}
	if (n === 7) {
		let t = vd[e];
		if (t) return t;
	}
	if (n >= 8) {
		let t = _d[e];
		if (t) return t;
	}
	return bd(e, n);
}
function Sd(e) {
	let t = Math.max(2, Math.min(8, e || 2));
	return t === 2 ? 1.04 : t === 3 ? .94 : t === 4 ? .98 : t === 5 ? 1.08 : t === 6 ? 1.12 : t === 7 ? 1.16 : 1.2;
}
var Cd = 1850, wd = 2050, Td = 1080, Ed = 4e3;
function Dd(e) {
	return e !== "live";
}
function Od(e = !1) {
	let t = e ? .55 : 1;
	return {
		cardLandMs: Math.round(560 * t),
		postTrickReadMs: Math.round(Cd * t),
		winnerRevealMs: Math.round(400 * t),
		trickSweepMs: Math.round(Td * t),
		nextLeadGapMs: Math.round(230 * t),
		trumpBeatReadMs: Math.round(wd * t)
	};
}
function kd(e) {
	let t = Od(e.reducedMotion), n = e.trumpBeat ? t.trumpBeatReadMs : t.postTrickReadMs, r = Math.min(t.winnerRevealMs, n - 200), i = Math.max(200, n - r), a = t.trickSweepMs, o = t.nextLeadGapMs;
	return {
		readBeforeWinnerMs: i,
		winnerRevealMs: r,
		readTotalMs: n,
		sweepMs: a,
		nextLeadGapMs: o,
		pipelineMs: n + a + o
	};
}
function Ad(e, t, n) {
	let r = n.length > 0 ? n : [...new Set([...Object.keys(e), ...Object.keys(t)])];
	for (let n of r) if ((t[n] ?? 0) > (e[n] ?? 0)) return n;
	return null;
}
function jd(e, t, n) {
	return e.length > 0 ? e : [...new Set([...Object.keys(t), ...Object.keys(n)])];
}
function Md(e) {
	return e?.plays?.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
}
function Nd(e, t, n) {
	return e.length ? e.length === 1 ? e[0].playerId : !t || !n ? e[e.length - 1].playerId : Lo(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n) : null;
}
function Pd(e) {
	let t = Md(e.prevTrick), n = e.playedCards?.filter((t) => t.trickNumber === e.trickNumber).map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
	return n.length > t.length ? n : t;
}
function Fd(e, t, n) {
	if (!e.length || !t || !n || t === n) return !1;
	let r = Lo(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n), i = e.find((e) => e.playerId === r);
	return !!(i && D({
		rank: i.card.rank,
		suit: i.card.suit
	}, n));
}
function Id(e) {
	let { prevTricks: t, nextTricks: n, prevTrick: r, playedCards: i } = e, a = jd(e.participantIds, t, n), o = id(t, a), s = id(n, a);
	if (s <= o) return null;
	let c = Ad(t, n, a), l = r?.trickNumber ?? s, u = Pd({
		prevTrick: r,
		playedCards: i,
		trickNumber: l
	});
	return !c || !u.length ? null : {
		trickNumber: l,
		leadSuit: r?.leadSuit ?? null,
		plays: u,
		winnerId: c
	};
}
function Ld() {
	return typeof window > "u" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region src/table/TrickPlaySlot.tsx
function Rd(e, t, n, r, i, a) {
	if (r.current = !1, e(!0), t("static"), n(null), i && gu() && _u("TrickPlaySlot", "fly-complete", i), a?.onCardLandedRef.current && !a.audioFiredRef.current) {
		a.audioFiredRef.current = !0;
		let e = a.playRef.current, t = a.leaderPlayerIdRef.current, n = t != null && e.playerId === t;
		a.onCardLandedRef.current({
			cardId: `${e.playerId}:${e.card.rank}:${e.card.suit}`,
			playerId: e.playerId,
			cardIndex: a.indexRef.current,
			cardsInTrick: a.displayCountRef.current,
			takesLead: n,
			isLocalPlayer: a.currentUserIdRef.current === e.playerId
		});
	}
}
function zd({ play: e, index: t, presentationPhase: n, displayCount: r, playerName: i, leaderPlayerId: a = null, winnerPlayerId: o = null, instantPlace: s = !1, currentUserId: c = null, onCardLanded: u }) {
	let d = (0, l.useRef)(null), [f, p] = (0, l.useState)("static"), [m, h] = (0, l.useState)(null), [v, y] = (0, l.useState)(!1), b = (0, l.useRef)(!1), x = (0, l.useRef)(!1), S = (0, l.useRef)(u), C = (0, l.useRef)(a), w = (0, l.useRef)(c), T = (0, l.useRef)(r), E = (0, l.useRef)(t), D = (0, l.useRef)(e);
	S.current = u, C.current = a, w.current = c, T.current = r, E.current = t, D.current = e;
	let O = Qa(e), k = a != null && e.playerId === a, A = o != null && e.playerId === o, j = n === "live", M = t === r - 1 && j, N = v, ee = k && (n === "live" || n === "trickComplete"), te = ee || A && n !== "live" && n !== "trickComplete";
	(0, l.useLayoutEffect)(() => {
		gu() && _u("TrickPlaySlot", "play-enter", {
			playKey: O,
			index: t,
			instantPlace: s,
			isLanding: M
		}), y(!1), b.current = !1, x.current = !1, p("static"), h(null);
	}, [O]), (0, l.useLayoutEffect)(() => {
		if (v || b.current) return;
		let n = {
			onCardLandedRef: S,
			playRef: D,
			indexRef: E,
			displayCountRef: T,
			leaderPlayerIdRef: C,
			currentUserIdRef: w,
			audioFiredRef: x
		};
		if (s || !j) {
			Rd(y, p, h, b, {
				playKey: O,
				index: t
			}, n);
			return;
		}
		if (!M) {
			Rd(y, p, h, b, {
				playKey: O,
				index: t
			}, n);
			return;
		}
		if (typeof document > "u") return;
		let r = d.current;
		if (!r) return;
		let i = r.querySelector(".pcard");
		if (!i) return;
		let a = oo(e.playerId, O);
		if (!a) {
			Rd(y, p, h, b, {
				playKey: O,
				index: t
			}, n);
			return;
		}
		let o = Ld() ? 217 : 395;
		b.current = !0, h(lo(a, r.getBoundingClientRect(), i.getBoundingClientRect())), p("pending"), gu() && _u("TrickPlaySlot", "fly-start", {
			playKey: O,
			index: t,
			travelMs: o
		});
		let c = window.setTimeout(() => p("travel"), 0), l = window.setTimeout(() => {
			Rd(y, p, h, b, {
				playKey: O,
				index: t
			}, n);
		}, o);
		return () => {
			window.clearTimeout(c), window.clearTimeout(l);
		};
	}, [
		v,
		s,
		M,
		j,
		e.playerId,
		O
	]);
	let P = {
		"--slot-index": t,
		zIndex: 10 + t,
		...m ? {
			"--fly-dx": `${m.dx}px`,
			"--fly-dy": `${m.dy}px`
		} : {}
	};
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: d,
		className: [
			"btrick__play",
			v ? "btrick__play--landed" : "",
			N ? "btrick__play--settled" : "",
			v && f === "static" ? "btrick__play--static-landed" : "",
			f === "travel" ? "btrick__play--fly-from-hand" : "",
			f === "pending" ? "btrick__play--fly-pending" : "",
			f === "land" ? "btrick__play--land" : "",
			f === "settle" ? "btrick__play--settle" : "",
			ee ? "btrick__play--leading" : "",
			te ? "btrick__play--winner" : ""
		].filter(Boolean).join(" "),
		style: P,
		"data-slot-index": t,
		children: [/* @__PURE__ */ (0, g.jsx)(_, {
			card: Ua(e.card),
			size: "sm",
			state: te ? "winner" : "default"
		}), /* @__PURE__ */ (0, g.jsx)("span", {
			className: "btrick__name muted small",
			children: i
		})]
	});
}
//#endregion
//#region src/table/trickRowLayout.ts
function Bd(e, t, n) {
	let r = e > 0 || t > 0;
	return {
		layoutCardCount: Math.max(e, t, r ? n : 0, 1),
		trickActive: r
	};
}
//#endregion
//#region src/table/TrickRow.tsx
function Vd({ displayPlays: e = [], leaderPlayerId: t = null, winnerPlayerId: n = null, showWinnerTag: r = !1, presentationPhase: i = "live", playerNames: a = {}, variant: o = "live", instantTrickPlays: s = !1, peakCardCount: c = 0, participantCount: u = 0, currentUserId: d = null, onCardLanded: f }) {
	(0, l.useEffect)(() => {
		gu() && _u("TrickRow", e.length === 0 ? "trick-empty" : "trick-cards", {
			count: e.length,
			phase: i
		});
	}, [e.length, i]);
	let { layoutCardCount: p, trickActive: m } = Bd(e.length, c, u);
	if (e.length === 0 && !m) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: "btrick btrick--empty muted small",
		"aria-hidden": "true",
		"data-testid": "trick-row",
		"data-trick-phase": i,
		"data-trick-card-count": "0",
		"data-trick-variant": o,
		children: /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btrick__surface",
			children: /* @__PURE__ */ (0, g.jsx)("span", {
				className: "btrick__placeholder",
				children: "Trick"
			})
		})
	});
	if (e.length === 0 && m) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: "btrick btrick--reserved muted small",
		"aria-hidden": "true",
		"data-testid": "trick-row",
		"data-trick-phase": i,
		"data-trick-card-count": "0",
		"data-trick-layout-count": p,
		"data-trick-variant": o,
		children: /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btrick__surface",
			children: /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btrick__cards btrick__cards--reserved",
				style: { "--trick-card-count": p }
			})
		})
	});
	let h = n ? a[n] ?? "Player" : null, _ = i === "trickComplete" || i === "winnerReveal", v = i === "collectTrick", y = o === "echo";
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: [
			"btrick",
			y ? "btrick--echo-pipeline" : "",
			_ ? "btrick--hold" : "",
			v ? "btrick--rake" : ""
		].filter(Boolean).join(" "),
		"aria-label": y ? void 0 : "Current trick",
		"aria-hidden": y ? !0 : void 0,
		"aria-live": y ? void 0 : "polite",
		"data-testid": y ? "trick-row-echo" : "trick-row",
		"data-trick-phase": i,
		"data-trick-card-count": e.length,
		"data-trick-variant": o,
		children: /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "btrick__surface",
			children: [r && h && /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btrick__winner-tag",
				"data-testid": "trick-winner-tag",
				children: [h, " takes it"]
			}), /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btrick__cards",
				role: "list",
				"aria-label": "Cards in trick",
				style: { "--trick-card-count": p },
				children: e.map((r, o) => /* @__PURE__ */ (0, g.jsx)(zd, {
					play: r,
					index: o,
					presentationPhase: y ? "winnerReveal" : i,
					displayCount: e.length,
					playerName: a[r.playerId] ?? "Player",
					leaderPlayerId: t,
					winnerPlayerId: n,
					instantPlace: s,
					currentUserId: d,
					onCardLanded: f
				}, `${r.playerId}-${r.card.rank}-${r.card.suit}`))
			})]
		})
	});
}
//#endregion
//#region src/table/DiscardPile.tsx
function Hd({ cards: e }) {
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: "discard-pile",
		"data-discard-pile-anchor": !0,
		"data-testid": "discard-pile",
		"aria-label": `Discard pile, ${e.length} card${e.length === 1 ? "" : "s"}`,
		children: e.map((e) => /* @__PURE__ */ (0, g.jsx)("div", {
			className: "discard-pile__card",
			style: {
				"--pile-x": `${e.offsetX}px`,
				"--pile-y": `${e.offsetY}px`,
				"--pile-rot": `${e.rotation}deg`,
				"--pile-scale": String(e.scale),
				zIndex: e.zIndex
			},
			children: /* @__PURE__ */ (0, g.jsx)(_, {
				faceDown: !0,
				size: "sm"
			})
		}, e.id))
	});
}
//#endregion
//#region src/table/PotCenter.tsx
function Ud({ potMetrics: e, participantCount: t, trumpUpcard: n, trumpSuit: r, phase: i, enrollmentActive: a = !1, remainingDeckCount: o, trickDisplayPlays: s = [], trickLeadSuit: c = null, trickLeaderPlayerId: u = null, trickWinnerPlayerId: f = null, trickShowWinnerTag: p = !1, trickPresentationPhase: m = "live", trickEchoPlays: h = [], trickEchoWinnerId: v = null, trickEchoPhase: y = "live", showFinalTrickEcho: b = !1, playerNames: x = {}, anteAnimActive: S = !1, trumpRevealActive: C = !1, drawAnimPlayerId: w = null, drawAnimSubPhase: T = "done", drawDiscardCount: E = 0, settleAnimActive: D = !1, settleCarryOver: O = !1, potTick: k = 0, trumpReminderPulse: A = 0, hideCenterTrump: j = !1, trumpMergeActive: M = !1, showTrumpSuitReminder: N = !1, instantTrickPlays: ee = !1, peakTrickPlayCount: te = 0, discardPileCards: P = [], currentUserId: F = null, onCardLanded: I }) {
	let ne = Wa(i, a), L = u ?? ((m === "live" || m === "trickComplete") && s.length > 0 ? Nd(s, c ?? s[0]?.card.suit ?? null, r ?? null) : null), R = m !== "live" && m !== "nextLeadReady", z = s.length, B = z > 0 || te > z || ee, [V, H] = (0, l.useState)(n ?? null);
	(0, l.useEffect)(() => {
		if (n) {
			H(n);
			return;
		}
		if (V && !M) {
			if (B || R) {
				let e = window.setTimeout(() => H(null), 760);
				return () => window.clearTimeout(e);
			}
			H(null);
		}
	}, [
		n,
		B,
		R,
		V,
		M
	]);
	let re = !!V && !j, ie = N || !re && !!r && i === "play", U = re ? `${V.rank}-${V.suit}` : "trump-slot", ae = b || D && h.length > 0 && z === 0;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: "table-center-cluster",
		"aria-label": "Table center",
		children: [/* @__PURE__ */ (0, g.jsxs)("div", {
			className: "deck-stack",
			"aria-label": "Deck and trump",
			children: [re ? /* @__PURE__ */ (0, g.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"bpot__trump--deal",
					C ? "bpot__trump--reveal" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-button",
				"data-trump-deal-target": "",
				children: [/* @__PURE__ */ (0, g.jsx)(_, {
					card: {
						rank: V.rank,
						suit: V.suit
					},
					size: "sm",
					state: "trump"
				}), /* @__PURE__ */ (0, g.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, U) : ie ? /* @__PURE__ */ (0, g.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"deck-stack__trump--suit-reminder",
					A > 0 ? "deck-stack__trump--suit-reminder-pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-suit-reminder",
				"aria-label": `Trump suit: ${Ga(r)}`,
				children: [/* @__PURE__ */ (0, g.jsx)("div", {
					className: `trump-suit-badge trump-suit-badge--${r}`,
					"aria-hidden": "true",
					children: d[r]
				}), /* @__PURE__ */ (0, g.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, "trump-reminder") : /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "deck-stack__pile",
				"data-testid": "deal-button",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, g.jsx)("div", { className: "deck-stack__card deck-stack__card--back" }),
					/* @__PURE__ */ (0, g.jsx)("div", { className: "deck-stack__card deck-stack__card--back deck-stack__card--offset" }),
					/* @__PURE__ */ (0, g.jsx)("span", {
						className: "deck-stack__label muted small",
						children: a ? "Dealing" : "Deck"
					})
				]
			}), o != null && o > 0 && /* @__PURE__ */ (0, g.jsxs)("span", {
				className: "deck-stack__count muted small",
				children: [o, " left"]
			})]
		}), /* @__PURE__ */ (0, g.jsxs)("div", {
			className: [
				"center-play",
				S ? "center-play--ante-in" : "",
				D ? "center-play--settle" : "",
				O ? "center-play--carry" : "",
				R ? "center-play--trick-resolving" : "",
				ae ? "center-play--final-trick-echo" : ""
			].filter(Boolean).join(" "),
			"data-trick-phase": m,
			"data-trick-cards": z,
			"data-hand-settling": D ? "true" : "false",
			children: [
				S && /* @__PURE__ */ (0, g.jsx)("div", {
					className: "bpot__ante-chips",
					"aria-hidden": "true",
					children: Array.from({ length: Math.min(t, 8) }, (e, t) => /* @__PURE__ */ (0, g.jsx)("span", {
						className: "bpot__ante-chip",
						style: { "--ante-i": t }
					}, t))
				}),
				i === "draw" ? /* @__PURE__ */ (0, g.jsx)(Hd, { cards: P }) : null,
				/* @__PURE__ */ (0, g.jsxs)("div", {
					className: ["center-play__phase", i === "play" ? "center-play__phase--play" : ""].filter(Boolean).join(" "),
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, g.jsx)("span", {
							className: "btable-sr-only",
							"data-testid": "phase-tag-center",
							"data-phase": i ?? "waiting",
							children: ne
						}),
						re && r && /* @__PURE__ */ (0, g.jsx)("span", {
							className: "center-play__trump-suit muted small",
							children: Ga(r)
						}),
						ie && /* @__PURE__ */ (0, g.jsxs)("span", {
							className: "center-play__trump-suit center-play__trump-suit--reminder muted small",
							children: [Ga(r), " trump"]
						})
					]
				}),
				/* @__PURE__ */ (0, g.jsxs)("div", {
					className: "center-play__trick-stage",
					children: [/* @__PURE__ */ (0, g.jsx)("div", {
						className: "center-play__trick-live",
						children: /* @__PURE__ */ (0, g.jsx)(Vd, {
							displayPlays: s,
							leaderPlayerId: L,
							winnerPlayerId: f,
							showWinnerTag: p,
							presentationPhase: m,
							playerNames: x,
							instantTrickPlays: ee,
							peakCardCount: te,
							participantCount: t,
							currentUserId: F,
							onCardLanded: I
						})
					}), ae && /* @__PURE__ */ (0, g.jsx)("div", {
						className: "center-play__trick-echo",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, g.jsx)(Vd, {
							displayPlays: h,
							winnerPlayerId: v,
							showWinnerTag: !0,
							presentationPhase: y,
							playerNames: x,
							variant: "echo"
						})
					})]
				}),
				/* @__PURE__ */ (0, g.jsxs)("dl", {
					className: "center-play__stats",
					children: [
						/* @__PURE__ */ (0, g.jsxs)("div", {
							className: `bpot__stat bpot__stat--pot${k > 0 ? " bpot__stat--tick" : ""}`,
							"data-testid": "pot-display",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Table pot" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: ld(e.currentPot) })]
						}, k > 0 ? `pot-${k}` : "pot-static"),
						/* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat",
							"data-testid": "ante-display",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Ante / hand" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: ud(e.anteAmount) })]
						}),
						e.limEnabled && /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [/* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Cap" }), /* @__PURE__ */ (0, g.jsxs)("dd", { children: [ld(e.potCap), /* @__PURE__ */ (0, g.jsx)("span", {
								className: "bpot__lim-tag",
								children: "LmT"
							})] })]
						}), /* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat bpot__stat--highlight",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Max win" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: ld(e.maxWinThisHand) })]
						})] })
					]
				}),
				e.limEnabled && e.overflow > 0 && /* @__PURE__ */ (0, g.jsxs)("div", {
					className: "center-play__carry muted small",
					children: [
						"+",
						ld(e.overflow),
						" carry"
					]
				}),
				/* @__PURE__ */ (0, g.jsxs)("div", {
					className: "center-play__meta muted small",
					children: [t, " in hand"]
				})
			]
		})]
	});
}
//#endregion
//#region src/table/SmartHud.tsx
function Wd({ label: e, value: t, accent: n, title: r }) {
	return /* @__PURE__ */ (0, g.jsxs)("span", {
		className: `bhud__pill${n ? " bhud__pill--accent" : ""}`,
		title: r ?? `${e}: ${t}`,
		children: [/* @__PURE__ */ (0, g.jsx)("span", {
			className: "bhud__pill-label",
			children: e
		}), /* @__PURE__ */ (0, g.jsx)("span", {
			className: "bhud__pill-value",
			children: t
		})]
	});
}
function Gd({ player: e, compact: t = !1 }) {
	let n = e.apeScore != null && !e.isRobot;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: `bhud${t ? " bhud--compact" : ""}`,
		"aria-label": `${e.displayName} stats`,
		children: [n && /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
			/* @__PURE__ */ (0, g.jsx)(Wd, {
				label: "Ape",
				value: e.apeScore ?? 0,
				accent: !0,
				title: "Ape Score"
			}),
			e.apeClass && /* @__PURE__ */ (0, g.jsx)(Wd, {
				label: "Class",
				value: e.apeClass,
				title: "Ape Class"
			}),
			e.apeStatus && /* @__PURE__ */ (0, g.jsx)(Wd, {
				label: "Status",
				value: e.apeStatus,
				title: "Ape Status"
			})
		] }), e.sessionStreak != null && e.sessionStreak > 0 && /* @__PURE__ */ (0, g.jsx)(Wd, {
			label: "Streak",
			value: e.sessionStreak,
			title: "Hands won this session"
		})]
	});
}
//#endregion
//#region src/table/TurnCountdownRing.tsx
var Kd = 22, qd = 2 * Math.PI * Kd;
function Jd({ progress: e, segment: t, reducedMotion: n = Ld() }) {
	let r = qd * (1 - Math.max(0, Math.min(1, e)));
	return /* @__PURE__ */ (0, g.jsxs)("svg", {
		className: ["bseat__turn-countdown", n ? "bseat__turn-countdown--reduced" : ""].filter(Boolean).join(" "),
		viewBox: "0 0 48 48",
		"aria-hidden": "true",
		"data-testid": "turn-countdown-ring",
		"data-turn-segment": t,
		children: [/* @__PURE__ */ (0, g.jsx)("circle", {
			className: "bseat__turn-countdown-track",
			cx: "24",
			cy: "24",
			r: Kd,
			fill: "none"
		}), /* @__PURE__ */ (0, g.jsx)("circle", {
			className: `bseat__turn-countdown-progress bseat__turn-countdown-progress--${t}`,
			cx: "24",
			cy: "24",
			r: Kd,
			fill: "none",
			strokeDasharray: qd,
			strokeDashoffset: r,
			transform: "rotate(-90 24 24)"
		})]
	});
}
//#endregion
//#region src/table/Seat.tsx
function Yd({ player: e, region: t, handLane: n = "below", style: r, clockwiseDealing: i = !1, onToggleInHand: a, onPassEnrollment: o, onTrickDelta: s, onReaction: c }) {
	let [u, d] = (0, l.useState)(!1), f = (0, l.useCallback)(() => {
		d((e) => !e);
	}, []), p = e.tricksThisHand, m = Math.max(0, e.holeCardCount ?? 0), h = p > 0, v = !!(e.showHoleCards && !e.isSelf && e.inHand && m > 0), y = e.bankroll != null, b = e.bourreAlert === "pulse", x = e.bourreAlert === "marker" || e.bourreAlert === "pulse", S = !!e.bourrePressure, C = S && e.isSelf, w = e.revealedTrumpIndex != null && e.revealedTrumpUpcard, T = md(e.displayName);
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		"data-testid": e.isSelf ? "seat-bottom-self" : t === "top" ? "seat-top" : t === "left" ? "seat-left" : t === "right" ? "seat-right" : "seat-bottom",
		className: [
			"bseat",
			`bseat--${t}`,
			n === "side" ? "bseat--hand-side" : "bseat--hand-below",
			`player-${t}`,
			e.inHand ? "bseat--in-hand" : "",
			e.isSelf ? "bseat--self" : "",
			e.isLeading ? "bseat--leading" : "",
			e.isWinner ? "bseat--winner" : "",
			e.enrollmentSatOut ? "bseat--sat-out" : "",
			e.isOut ? "bseat--out" : "",
			e.isDealer ? "bseat--dealer" : "",
			e.trumpMerging ? "bseat--trump-merge" : "",
			e.isActiveActor ? "bseat--active-actor" : "",
			e.isActiveActor && e.inHand ? "bseat--play-origin-active" : "",
			e.isTrickCapture ? "bseat--trick-capture" : "",
			e.winnerFlash ? "bseat--winner-flash" : "",
			e.enrollmentPulse === "join" ? "bseat--enroll-join" : "",
			e.enrollmentPulse === "pass" ? "bseat--enroll-pass" : "",
			e.drawAnimSubPhase === "discard" ? "bseat--draw-discard" : "",
			e.drawAnimSubPhase === "receive" ? "bseat--draw-receive" : "",
			b ? "bseat--bourre-pulse" : "",
			x ? "bseat--bourre" : "",
			S ? "bseat--bourre-pressure" : "",
			C ? "bseat--bourre-pressure-self" : "",
			e.bankrollTick === "up" ? "bseat--bankroll-up" : "",
			e.bankrollTick === "down" ? "bseat--bankroll-down" : "",
			w ? "bseat--trump-reveal" : "",
			e.seatTrumpMergeActive ? "bseat--trump-merge" : "",
			u ? "bseat--meta-open" : ""
		].filter(Boolean).join(" "),
		style: r,
		"data-trick-play-origin-active": e.isActiveActor && e.inHand ? e.playerId : void 0,
		children: [
			e.inHand && !e.isSelf && /* @__PURE__ */ (0, g.jsx)("span", {
				className: "bseat__play-origin",
				"data-seat-play-origin": e.playerId,
				"data-trick-play-origin": e.playerId,
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, g.jsx)("div", {
				className: "bseat__core",
				children: /* @__PURE__ */ (0, g.jsxs)("div", {
					className: "bseat__avatar-stage",
					children: [
						/* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bseat__avatar-stack",
							"data-trick-play-origin": !e.isSelf && e.inHand && !v ? e.playerId : void 0,
							children: [
								e.inHand && /* @__PURE__ */ (0, g.jsx)("span", {
									className: [
										"bseat__trick-badge",
										p === 0 ? "bseat__trick-badge--zero" : "",
										S && p === 0 ? "bseat__trick-badge--bourre-risk" : "",
										e.isWinner || e.isTrickCapture ? "bseat__trick-badge--tick" : ""
									].filter(Boolean).join(" "),
									"aria-label": S ? C ? `${p} tricks won — you need this trick to avoid bourré` : `${p} tricks won — at risk of bourré` : `${p} tricks won`,
									title: S ? C ? "Win this trick or go bourré" : "Must win this trick" : `${p} trick${p === 1 ? "" : "s"} won`,
									"data-testid": "seat-trick-badge",
									children: p
								}),
								e.inHand && !e.isSelf && /* @__PURE__ */ (0, g.jsx)("span", {
									className: "bseat__seat-motion-anchor",
									"data-seat-motion-anchor": e.playerId,
									"aria-hidden": "true"
								}),
								h && /* @__PURE__ */ (0, g.jsx)("div", {
									className: "bseat__won-trick-pile",
									"data-won-trick-pile-anchor": e.playerId,
									"aria-hidden": !1,
									"data-trick-count": p,
									children: Array.from({ length: Math.min(p, 5) }, (e, t) => /* @__PURE__ */ (0, g.jsx)("div", {
										className: "bseat__won-trick-pile-card",
										style: { "--book-i": t },
										children: /* @__PURE__ */ (0, g.jsx)(_, {
											faceDown: !0,
											size: "xs"
										})
									}, t))
								}),
								i && e.inHand && !e.isSelf && m > 0 && /* @__PURE__ */ (0, g.jsx)("div", {
									className: "bseat__deal-targets",
									"aria-hidden": "true",
									children: Array.from({ length: m }, (t, n) => /* @__PURE__ */ (0, g.jsx)("span", {
										className: "bseat__deal-target",
										"data-deal-seat": e.playerId,
										"data-deal-round": n,
										style: { "--hole-i": n }
									}, `deal-target-${n}`))
								}),
								v && /* @__PURE__ */ (0, g.jsx)("div", {
									className: "bseat__hole-cards bseat__hole-cards--crown",
									"aria-label": `${m} cards in hand`,
									"data-trick-play-origin": e.playerId,
									children: Array.from({ length: m }, (t, n) => {
										let r = e.revealedTrumpIndex === n && e.revealedTrumpUpcard;
										return /* @__PURE__ */ (0, g.jsx)("div", {
											className: [
												"bseat__hole-card",
												r ? "bseat__hole-card--trump-revealed" : "",
												r && e.seatTrumpMergeActive ? "bseat__hole-card--trump-merge" : ""
											].filter(Boolean).join(" "),
											style: { "--hole-i": n },
											children: r ? /* @__PURE__ */ (0, g.jsx)(_, {
												card: {
													rank: e.revealedTrumpUpcard.rank,
													suit: e.revealedTrumpUpcard.suit
												},
												size: "xs",
												state: "trump"
											}) : /* @__PURE__ */ (0, g.jsx)(_, {
												faceDown: !0,
												size: "xs"
											})
										}, n);
									})
								}),
								x && !S && /* @__PURE__ */ (0, g.jsx)("span", {
									className: "bseat__bourre-badge",
									"data-testid": "bourre-marker-badge",
									"aria-label": "Bourré",
									title: "Bourré",
									children: "Bourré"
								}),
								/* @__PURE__ */ (0, g.jsxs)("div", {
									className: `bseat__avatar-wrap${u ? " bseat__avatar-wrap--peek" : ""}`,
									role: "button",
									tabIndex: 0,
									"aria-label": `${T} seat`,
									"aria-expanded": u,
									onClick: (e) => {
										e.stopPropagation(), f();
									},
									onKeyDown: (e) => {
										(e.key === "Enter" || e.key === " ") && (e.preventDefault(), f());
									},
									onBlur: () => d(!1),
									children: [
										e.isDealer && /* @__PURE__ */ (0, g.jsx)("span", {
											className: `bseat__dealer${e.dealerMoved ? " bseat__dealer--moved" : ""}`,
											children: "D"
										}),
										e.photoURL ? /* @__PURE__ */ (0, g.jsx)("img", {
											className: "bseat__avatar",
											src: e.photoURL,
											alt: ""
										}) : /* @__PURE__ */ (0, g.jsx)("span", {
											className: "bseat__avatar bseat__avatar--blank",
											"aria-hidden": "true"
										}),
										/* @__PURE__ */ (0, g.jsx)("span", {
											className: "bseat__name-plate",
											title: T,
											children: T
										}),
										e.inHand && /* @__PURE__ */ (0, g.jsx)("span", {
											className: "bseat__in-badge",
											title: "In this hand"
										}),
										b && !S && /* @__PURE__ */ (0, g.jsx)("span", {
											className: "bseat__bourre-ring",
											"aria-hidden": "true"
										}),
										e.turnCountdown && /* @__PURE__ */ (0, g.jsx)(Jd, {
											progress: e.turnCountdown.progress,
											segment: e.turnCountdown.segment
										})
									]
								})
							]
						}),
						y && /* @__PURE__ */ (0, g.jsx)("span", {
							className: `bseat__stack${e.isOut ? " bseat__stack--out" : ""}`,
							"data-testid": "seat-stack",
							"aria-label": `Chips ${fd(e.bankroll ?? 0)}`,
							title: `Chips ${fd(e.bankroll ?? 0)}`,
							children: fd(e.bankroll ?? 0)
						}),
						e.isSelf && c && /* @__PURE__ */ (0, g.jsx)("div", {
							className: "bseat__react-bar",
							children: [
								"👏",
								"😮",
								"🔥"
							].map((e) => /* @__PURE__ */ (0, g.jsx)("button", {
								type: "button",
								className: "bseat__react-btn",
								"aria-label": `React ${e}`,
								onClick: () => c(e),
								children: e
							}, e))
						})
					]
				})
			}),
			/* @__PURE__ */ (0, g.jsxs)("div", {
				className: "bseat__aux",
				children: [
					/* @__PURE__ */ (0, g.jsxs)("div", {
						className: "bseat__info",
						children: [
							e.isOut && /* @__PURE__ */ (0, g.jsx)("span", {
								className: "bseat__out-tag muted small",
								children: "Out"
							}),
							e.enrollmentSatOut && !e.isOut && /* @__PURE__ */ (0, g.jsx)("span", {
								className: "bseat__enroll-tag muted small",
								children: "Sat out"
							}),
							e.enrollmentJoined && !e.inHand && !e.isOut && /* @__PURE__ */ (0, g.jsx)("span", {
								className: "bseat__enroll-tag muted small",
								children: e.decisionPlannedDiscards == null ? "Joined" : `Play · draw ${e.decisionPlannedDiscards}`
							})
						]
					}),
					/* @__PURE__ */ (0, g.jsx)("div", {
						className: "bseat__meta",
						"data-testid": "seat-meta-panel",
						"aria-hidden": !u,
						children: /* @__PURE__ */ (0, g.jsx)(Gd, {
							player: e,
							compact: t === "left" || t === "right"
						})
					}),
					e.canToggleInHand && /* @__PURE__ */ (0, g.jsx)("button", {
						type: "button",
						className: "bseat__opt-in btn btn--sm",
						"data-testid": "seat-opt-in",
						onClick: a,
						children: e.decisionPlannedDiscards != null && e.enrollmentJoined ? `Playing · ${e.decisionPlannedDiscards}` : e.canPassEnrollment ? "Play" : "I’m in"
					}),
					e.canPassEnrollment && o && /* @__PURE__ */ (0, g.jsx)("button", {
						type: "button",
						className: "bseat__pass btn btn--sm btn--ghost",
						"data-testid": "seat-pass-enrollment",
						onClick: o,
						children: "Pass"
					}),
					e.canEditTricks && /* @__PURE__ */ (0, g.jsx)("div", {
						className: "bseat__controls",
						children: /* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "bseat__trick-btn bseat__trick-btn--plus",
							"aria-label": "Won a trick",
							disabled: p >= 5,
							onClick: () => s(1),
							children: "+"
						})
					})
				]
			})
		]
	});
}
//#endregion
//#region src/table/layout/seatOrder.ts
function Xd(e, t) {
	let n = [...new Set(e.filter(Boolean))];
	if (!n.length) return [];
	let r = t.seatedIds?.filter((e) => n.includes(e));
	if (r?.length === n.length) return r;
	let i = t.handEnrollment?.orderedPlayerIds?.filter((e) => n.includes(e));
	if (i?.length === n.length) return i;
	let a = yo(t.dealerId, n), o = n.filter((e) => !a.includes(e));
	return o.length ? [...a, ...o] : a;
}
function Zd(e, t, n) {
	let r = new Map(e.map((e) => [e.playerId, e])), i = Xd(e.map((e) => e.playerId), t);
	if (!i.length) return e;
	let a = n ?? e.find((e) => e.isSelf)?.playerId ?? null, o = a ? i.indexOf(a) : 0;
	return (o > 0 ? [...i.slice(o), ...i.slice(0, o)] : i).map((e) => r.get(e)).filter((e) => e != null);
}
//#endregion
//#region src/table/layout/sevenPlayerMobileSeatMap.ts
function Qd(e) {
	let t = nd(e);
	return {
		0: {
			seatIndex: 0,
			...t[0]
		},
		1: {
			seatIndex: 1,
			...t[1]
		},
		2: {
			seatIndex: 2,
			...t[2]
		},
		3: {
			seatIndex: 3,
			...t[3]
		},
		4: {
			seatIndex: 4,
			...t[4]
		},
		5: {
			seatIndex: 5,
			...t[5]
		},
		6: {
			seatIndex: 6,
			...t[6]
		}
	};
}
function $d(e) {
	return e === 7;
}
function ef(e, t) {
	return e < 0 || e > 6 ? null : Qd(t)[e] ?? null;
}
function tf(e, t, n) {
	let r = ef(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: bf(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 7
		})
	} : null;
}
//#endregion
//#region src/table/layout/eightPlayerMobileSeatMap.ts
function nf(e) {
	let t = rd(e);
	return {
		0: {
			seatIndex: 0,
			...t[0]
		},
		1: {
			seatIndex: 1,
			...t[1]
		},
		2: {
			seatIndex: 2,
			...t[2]
		},
		3: {
			seatIndex: 3,
			...t[3]
		},
		4: {
			seatIndex: 4,
			...t[4]
		},
		5: {
			seatIndex: 5,
			...t[5]
		},
		6: {
			seatIndex: 6,
			...t[6]
		},
		7: {
			seatIndex: 7,
			...t[7]
		}
	};
}
function rf(e) {
	return e >= 8;
}
function af(e, t) {
	return e < 0 || e > 7 ? null : nf(t)[e] ?? null;
}
function of(e, t, n) {
	let r = af(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: bf(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 8
		})
	} : null;
}
//#endregion
//#region src/table/layout/fourPlayerMobileSeatMap.ts
function sf(e) {
	return e === 5;
}
function cf(e) {
	let t = nd(e);
	return {
		0: t[0],
		1: t[1],
		2: t[3],
		3: t[5],
		4: t[6]
	};
}
function lf(e, t, n) {
	if (e < 0 || e > 4) return null;
	let r = cf(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: bf(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 5
		})
	} : null;
}
//#endregion
//#region src/table/layout/fivePlayerMobileSeatMap.ts
var uf = {
	min: 8,
	max: 92
};
function df(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function ff(e, t) {
	let n = t === "landscape" ? 54 : 56;
	return {
		...e,
		x: df(e.x, uf.min, uf.max),
		y: df(e.y, 8, n)
	};
}
function pf(e) {
	return e === 6;
}
function mf(e) {
	let t = nd(e), n = [
		2,
		3,
		4
	].map((t) => ff(xd(t, 6), e));
	return {
		0: t[0],
		1: t[1],
		2: n[0],
		3: n[1],
		4: n[2],
		5: t[6]
	};
}
function hf(e, t, n) {
	if (e < 0 || e > 5) return null;
	let r = mf(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: bf(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 6
		})
	} : null;
}
//#endregion
//#region src/table/layout/seatLayout.ts
var gf = {
	min: 8,
	max: 92
}, _f = 56, vf = 54;
function yf(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function bf(e, t) {
	return t.isSelf || t.isMobile ? "below" : t.total >= 6 && e.region === "left" && e.x < 14 || t.total >= 6 && e.region === "right" && e.x > 86 ? "side" : "below";
}
function xf(e, t) {
	let n = yf(e.x, gf.min, gf.max), r = t === "portrait" ? _f : vf, i = yf(e.y, 8, r);
	return {
		...e,
		x: n,
		y: i
	};
}
function Sf(e, t, n) {
	if (n.isMobile && n.orientation && sf(t)) {
		let t = lf(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && pf(t)) {
		let t = hf(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && $d(t)) {
		let t = tf(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && rf(t)) {
		let t = of(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	let r = xd(e, t), i = n.isMobile && n.orientation ? xf(r, n.orientation) : r;
	return {
		...i,
		seatIndex: e,
		handLane: bf(i, {
			isMobile: n.isMobile,
			isSelf: n.isSelf,
			total: t
		})
	};
}
function Cf(e, t, n) {
	return Sf(e + 1, t, {
		isMobile: !0,
		isSelf: !1,
		orientation: n
	});
}
function wf(e, t = "portrait") {
	if (sf(e)) {
		let e = lf(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (pf(e)) {
		let e = hf(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if ($d(e)) {
		let e = tf(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (rf(e)) {
		let e = of(0, t, { isSelf: !0 });
		if (e) return e;
	}
	let n = xd(0, Math.max(2, e));
	return {
		x: n.x,
		y: Math.min(n.y, 88),
		region: "bottom",
		seatIndex: 0,
		handLane: "below"
	};
}
var Tf = 5e3, Ef = 1e3, Df = 12e3, Of = 4e3, kf = 4e3;
function Af(e = Ld()) {
	let t = e ? .55 : 1, n = (e) => Math.max(80, Math.round(e * t));
	return {
		anteChipTravelMs: n(220),
		dealCardStaggerMs: n(130),
		dealFanMs: n(600),
		trumpRevealHoldMs: n(Tf),
		trumpMergeAnimMs: n(480),
		enrollmentSeatPulseMs: n(480),
		drawDiscardMs: n(400),
		drawReplaceMs: n(700),
		drawReadyBeatMs: n(500),
		settleHoldMs: n(Ef),
		nextHandResetMs: n(550),
		handResetMs: n(500)
	};
}
function jf(e, t, n = Ld()) {
	let r = Af(n), i = Math.max(0, e), a = Math.max(0, t);
	return i === 0 && a === 0 ? Math.max(120, Math.round(r.drawDiscardMs * .6)) : i * r.drawDiscardMs + a * r.drawReplaceMs + 80;
}
function Mf(e, t, n) {
	let r = Number.isFinite(e) && e > 0 ? e : 0, i = r > 0 ? Math.max(t, r) : t;
	return {
		height: Math.max(i > 0 ? i : n, n),
		peak: i
	};
}
function Nf(e, t, n, r) {
	let i = Mf(e, t, n), a = Math.max(152, n);
	return {
		height: i.peak > 0 ? Math.min(i.height, r) : Math.min(a, r),
		peak: i.peak
	};
}
function Pf(e, t, n = 72) {
	return Mf(e, t, n);
}
function Ff(e, t) {
	let n = Math.max(.75, e);
	return t.portrait ? Math.min(n, .98) : Math.min(n, 1.32);
}
function If(e) {
	let t = Math.max(2, Math.min(8, e || 4));
	return t <= 3 ? .7 : t <= 4 ? .68 : t <= 5 ? .62 : .56;
}
function Lf(e) {
	let { availWidth: t, availHeight: n, aspect: r, userScale: i, padX: a, padY: o, stageShare: s = .58 } = e, c = Math.max(.85, Math.min(1.35, i || 1)), l = Math.max(0, t * s - a * 2), u = Math.max(0, n - o * 2), d = l, f = d / r;
	f > u && (f = u, d = f * r);
	let p = Math.max(0, Math.min(1, l / (d * c), u / (f * c)));
	return {
		displayStageWidth: d * p,
		displayStageHeight: f * p,
		fitScale: p,
		effectiveScale: p * c
	};
}
function Rf(e) {
	let { availWidth: t, availHeight: n, aspect: r, userScale: i, padX: a, padY: o, heroMinHeight: s, gap: c } = e, l = Math.max(.85, Math.min(1.35, i || 1)), u = Math.max(0, t - a * 2), d = Math.max(0, n - o * 2), f = Math.max(120, d - s - c), p = u, m = p / r;
	m > f && (m = f, p = m * r);
	let h = p, g = m + c + s, _ = Math.max(0, Math.min(1, u / (h * l), d / (g * l))), v = p * _, y = m * _;
	return {
		stageWidth: p,
		stageHeight: m,
		fitScale: _,
		effectiveScale: _ * l,
		displayStageWidth: v,
		displayStageHeight: y
	};
}
function zf(e) {
	return {
		left: e.left,
		top: e.top,
		right: e.right,
		bottom: e.bottom,
		width: e.width,
		height: e.height
	};
}
function Bf(e, t, n = 2) {
	return e.left >= t.left - n && e.top >= t.top - n && e.right <= t.right + n && e.bottom <= t.bottom + n;
}
//#endregion
//#region src/table/useMobileTable.ts
var Vf = "(max-width: 900px), ((hover: none) and (pointer: coarse))";
function Hf() {
	let [e, t] = (0, l.useState)(() => typeof window < "u" && window.matchMedia("(max-width: 900px), ((hover: none) and (pointer: coarse))").matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Vf), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/table/hooks/useStageFit.ts
function Uf(e, t) {
	if (typeof window > "u") return t;
	let n = document.documentElement, r = getComputedStyle(n).getPropertyValue(e).trim(), i = parseFloat(r);
	return Number.isFinite(i) ? i : t;
}
function Wf(e, t) {
	let n = e.closest(".btable-session");
	if (!n) return 0;
	let r = n.querySelector(".btable-desktop");
	if (r) {
		let e = n.getBoundingClientRect(), i = r.getBoundingClientRect(), a = t ? 4 : 0;
		return Math.max(0, e.height - i.height) + a;
	}
	let i = 0, a = n.querySelector(".btable-session__head-row"), o = n.querySelector(".btable-session__status"), s = n.querySelector(".btable-session__foot"), c = n.querySelector(".btable-session__settle");
	return a && (i += a.getBoundingClientRect().height), o && (i += o.getBoundingClientRect().height), s && s.offsetParent !== null && (i += s.getBoundingClientRect().height), c && c.offsetParent !== null && (i += c.getBoundingClientRect().height), t && (i += 4), i;
}
function Gf(e) {
	let t = e.closest(".btable-session")?.querySelector(".btable-desktop");
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return n.width <= 0 || n.height <= 0 ? null : {
		width: n.width,
		height: n.height
	};
}
function Kf(e, t) {
	let n = !!e.closest(".table-play-overlay");
	if (t && n) {
		let t = e.closest(".table-play-overlay__main");
		if (t) return t;
	}
	return e.closest(".btable-desktop__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function qf({ aspect: e, enabled: t = !0, sessionKey: n }) {
	let r = (0, l.useRef)(null), i = (0, l.useRef)(0), a = (0, l.useRef)(0), o = (0, l.useRef)(n), { settings: s } = nu(), c = Hf();
	return (0, l.useLayoutEffect)(() => {
		if (!t || typeof window > "u") return;
		let l = r.current;
		if (!l) return;
		o.current !== n && (o.current = n, i.current = 0, a.current = 0);
		let u = l.closest(".btable-desktop__viewport") ?? l.closest(".table-play-overlay__main") ?? l.closest(".btable-session"), d = window.visualViewport, f = () => {
			if (Bu()) return;
			let t = !!l.closest(".table-play-overlay"), n = typeof window < "u" && window.matchMedia("(orientation: portrait)").matches, r = Kf(l, c).getBoundingClientRect(), o = l.querySelector(".hand-panel")?.getBoundingClientRect(), u = t && c && n ? 100 : t && !c ? 120 : c ? 112 : 148, f = t && c && n || t && !c ? 200 : c ? 210 : 280, p = o?.height ?? 0, m = Nf(p, i.current, u, f);
			i.current = m.peak;
			let h = m.height, g = c && t ? 12 : c ? 18 : t && !c ? 16 : 28, _ = Uf("--stage-fit-pad-x", c ? 8 : 16) + g, v = Uf("--stage-fit-pad-y", c ? 6 : 12) + g, y = Uf("--stage-fit-gap", c ? 8 : 12), b = d, x = Math.min(r.width, b?.width ?? window.innerWidth), S = Math.min(r.height, b?.height ?? window.innerHeight);
			if (t && c) {
				let e = Gf(l);
				if (e) x = e.width, S = e.height;
				else {
					let e = Pf(Wf(l, c), a.current, 72);
					a.current = e.peak, S = Math.max(160, S - e.height);
				}
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = t && c ? 1 : C, T = c ? Ff(e, { portrait: n }) : e, E = parseInt(getComputedStyle(l).getPropertyValue("--player-count").trim(), 10) || 4, D = t && c && !n, O = D ? {
				...Lf({
					availWidth: x,
					availHeight: S,
					aspect: T,
					userScale: w,
					padX: _,
					padY: v,
					stageShare: If(E)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Rf({
				availWidth: x,
				availHeight: S,
				aspect: T,
				userScale: w,
				padX: _,
				padY: v,
				heroMinHeight: h,
				gap: y
			});
			l.classList.toggle("btable-wrap--landscape-row", D);
			let k = c || t, A = k ? O.displayStageWidth : O.stageWidth, j = k ? O.displayStageHeight : O.stageHeight;
			if (t && c) {
				let e = Math.max(0, x - _ * 2), t = D ? Math.max(0, S - v * 2) : Math.max(120, S - v * 2 - h - y);
				A = Math.min(A * C, e), j = Math.min(j * C, t);
			}
			let M = t && !c ? C : c ? 1 : O.effectiveScale;
			if (l.style.setProperty("--stage-fit-width", `${Math.round(A)}px`), l.style.setProperty("--stage-fit-height", `${Math.round(j)}px`), l.style.setProperty("--stage-fit-scale", String(O.fitScale)), l.style.setProperty("--stage-effective-scale", String(M)), (l.closest(".btable-desktop__scale") ?? l.parentElement)?.style.setProperty("--stage-effective-scale", String(M)), localStorage.getItem("stageFitDebug") === "1") {
				let e = l.querySelector(".table-stage"), a = l.querySelectorAll(".bseat__avatar-wrap"), o = e ? zf(e.getBoundingClientRect()) : null, s = zf(document.documentElement.getBoundingClientRect()), u = [...a].filter((e) => !Bf(zf(e.getBoundingClientRect()), s, 1)).length;
				console.debug("[stage-fit]", {
					host: {
						w: r.width,
						h: r.height
					},
					hero: {
						measured: p,
						budget: h,
						peak: i.current
					},
					fit: O,
					stageBounds: o,
					seatOverflow: u,
					nativeMobile: c,
					inOverlay: t,
					portrait: n
				});
			}
		}, p = null, m = () => {
			Bu() || (p ??= window.requestAnimationFrame(() => {
				p = null, f();
			}));
		}, h = new ResizeObserver(m), g = Kf(l, c);
		g instanceof HTMLElement && h.observe(g), u instanceof HTMLElement && u !== g && h.observe(u);
		let _ = l.closest(".table-play-overlay__main");
		_ instanceof HTMLElement && _ !== g && h.observe(_), m();
		let v = Vu(() => {
			Bu() || m();
		}), y = () => m();
		return window.addEventListener("orientationchange", y), d?.addEventListener("resize", y), d?.addEventListener("scroll", y), () => {
			p != null && window.cancelAnimationFrame(p), v(), h.disconnect(), window.removeEventListener("orientationchange", y), d?.removeEventListener("resize", y), d?.removeEventListener("scroll", y);
		};
	}, [
		e,
		t,
		c,
		n,
		s.tableScale
	]), r;
}
//#endregion
//#region src/table/hooks/useTableDiscardFly.ts
function Jf({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r, pileIndexRef: i, onDiscardCommitted: a }) {
	let o = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		let s = e.animatingDrawPlayerId, c = e.drawAnimSubPhase, l = e.drawDiscardCount;
		if (c !== "discard" || !s || l <= 0) {
			c !== "discard" && (o.current = null);
			return;
		}
		if (s === n) return;
		let u = `${t}:${s}:${l}`;
		o.current !== u && (o.current = u, Ia({
			playerId: s,
			handNumber: t,
			discardCount: l,
			pileStartIndex: i.current,
			root: r.current ?? void 0,
			onComplete: (e) => {
				i.current += e.length, a(e);
			}
		}));
	}, [
		e.animatingDrawPlayerId,
		e.drawAnimSubPhase,
		e.drawDiscardCount,
		t,
		n,
		r,
		i,
		a
	]);
}
//#endregion
//#region src/table/hooks/useTableDrawReceiveFly.ts
function Yf({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r }) {
	let i = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		let a = e.animatingDrawPlayerId, o = e.drawAnimSubPhase, s = e.drawReplaceCount;
		if (o !== "receive" || !a || s <= 0) {
			o !== "receive" && (i.current = null);
			return;
		}
		if (a === n) return;
		let c = r.current;
		if (!c) return;
		let l = `${t}:${a}:receive:${s}`;
		i.current !== l && (i.current = l, Na({
			playerId: a,
			replaceCount: s,
			root: c
		}));
	}, [
		e.animatingDrawPlayerId,
		e.drawAnimSubPhase,
		e.drawReplaceCount,
		t,
		n,
		r
	]);
}
//#endregion
//#region src/table/animations/drawFlyCleanup.ts
function Xf(e = document) {
	ma(), Aa();
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = e instanceof Document ? t.body : e;
	for (let e of n.querySelectorAll(".discard-fly-ghost, .draw-receive-fly-ghost")) e.remove();
}
//#endregion
//#region src/table/hooks/useTableDrawMotionCleanup.ts
function Zf({ handNumber: e, sessionPhase: t, turnPlayerId: n, drawCompletedIds: r, currentUserId: i, handPresentation: a, tableRootRef: o }) {
	let s = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		let c = o.current;
		if (!c || !i) return;
		if (t !== "draw") {
			s.current = null;
			return;
		}
		if (!(n === i && !r.includes(i) && a.animatingDrawPlayerId !== i && a.drawAnimSubPhase === "done")) return;
		let l = `${e}:${i}:draw-wait`;
		s.current !== l && (s.current = l, Xf(c));
	}, [
		e,
		t,
		n,
		r,
		i,
		a.animatingDrawPlayerId,
		a.drawAnimSubPhase,
		o
	]), (0, l.useLayoutEffect)(() => {
		let e = o.current;
		e && (Xf(e), s.current = null);
	}, [e, o]);
}
var Qf = /* @__PURE__ */ new Set();
function $f(e, t = 5) {
	let n = [];
	for (let r = 0; r < t; r += 1) for (let t of e) n.push({
		playerId: t,
		roundIndex: r,
		stepIndex: n.length
	});
	return n;
}
function ep(e, t = R()) {
	if (e <= 0) return 0;
	let n = t ? .35 : 1, r = Math.round(780 * n), i = Math.round(540 * n);
	return (e - 1) * r + i + Math.round(130 * n);
}
function tp(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		let e = i.querySelector("[data-trump-deal-target]");
		if (e) return ea(e);
	}
	let a = i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`) ?? i.querySelector(`[data-deal-seat="${e}"] [data-deal-round="${t}"]`), o = a?.querySelector(".pcard") ?? a;
	return o ? ea(o) : null;
}
function np(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * .24)
	};
}
function rp(e) {
	let t = document.createElement("div");
	return t.className = "deal-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function ip(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		i.querySelector("[data-trump-deal-target]")?.classList.add("deal-card--revealed"), i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`)?.classList.add("deal-card--revealed");
		return;
	}
	i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`)?.classList.add("deal-card--revealed");
}
function ap(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".deal-card--revealed")) e.classList.remove("deal-card--revealed");
	for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
}
function op() {
	for (let e of Qf) e.kill();
	Qf.clear();
}
function sp({ steps: e, root: t, trumpHolderId: n = null, onStepComplete: r, onComplete: i }) {
	ia(t), op();
	let a = R(), o = L(540 / 1e3, a), s = L(130 / 1e3, a), c = a ? .04 : 110 / 1e3, l = xa(t), u = q.timeline({
		onComplete: () => {
			Qf.delete(u), i?.();
		},
		onInterrupt: () => {
			Qf.delete(u);
			for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
		}
	});
	if (Qf.add(u), !l || e.length === 0) {
		for (let r of e) ip(r.playerId, r.roundIndex, t, n);
		return u.call(() => i?.()), u;
	}
	e.forEach((e, i) => {
		let d = i * (o + s + c), f = tp(e.playerId, e.roundIndex, t, n);
		u.call(() => {
			if (!f) {
				ip(e.playerId, e.roundIndex, t, n), r?.(e);
				return;
			}
			let i = rp(l);
			t.appendChild(i);
			let c = ea(i), { x: u, y: d } = ra(c, l), p = f.left + f.width / 2, m = f.top + f.height / 2, h = c.left + c.width / 2, g = c.top + c.height / 2, _ = p - h, v = m - g, { midX: y, midY: b } = np(_, v);
			q.set(i, {
				transformOrigin: "50% 80%",
				willChange: "transform,opacity",
				x: u,
				y: d,
				rotation: -12,
				rotationY: a ? 0 : -68,
				scale: a ? 1 : .62,
				opacity: +!!a
			});
			let x = q.timeline({ onComplete: () => {
				i.remove(), ip(e.playerId, e.roundIndex, t, n), r?.(e);
			} });
			a ? x.to(i, {
				x: _,
				y: v,
				rotation: 0,
				rotationY: 0,
				scale: 1,
				opacity: 1,
				duration: o,
				ease: te
			}) : x.to(i, {
				motionPath: {
					path: [
						{
							x: u,
							y: d
						},
						{
							x: u + y,
							y: d + b
						},
						{
							x: _,
							y: v
						}
					],
					curviness: 1.2
				},
				rotation: 0,
				rotationY: 0,
				scale: 1,
				opacity: 1,
				duration: o,
				ease: te
			}), x.to(i, {
				scale: 1.02,
				duration: s * .45,
				yoyo: !0,
				repeat: 1,
				ease: F
			}, o);
		}, void 0, d);
	});
	let d = ep(e.length, a) + 120, f = window.setTimeout(() => {
		u.progress() < 1 && u.progress(1);
	}, d);
	return u.eventCallback("onComplete", () => window.clearTimeout(f)), u.eventCallback("onInterrupt", () => window.clearTimeout(f)), u;
}
//#endregion
//#region src/table/hooks/useTableDealPresentation.ts
function cp({ session: e, heroCards: t, privateHandReady: n = !1, tableRootRef: r }) {
	let [i, a] = (0, l.useState)(!1), o = (0, l.useRef)(null), s = (0, l.useRef)(e.handNumber);
	return (0, l.useLayoutEffect)(() => {
		let t = r.current;
		t && s.current !== e.handNumber && (s.current = e.handNumber, o.current = null, op(), ap(t), su(!1), a(!1));
	}, [e.handNumber, r]), (0, l.useLayoutEffect)(() => {
		let i = r.current;
		if (!i) return;
		let s = e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play", c = t.length;
		if (!s || !n || c < 5) return;
		let l = `${e.handNumber}:${c}:${e.participantIds.join(",")}`;
		if (o.current === l) return;
		let u = Xd(e.participantIds, e), d = bo(e.dealerId, e.participantIds, u.length ? u : e.participantIds);
		if (d.length < 2) return;
		let f = $f(d, 5);
		if (!f.length) return;
		o.current = l, op(), ap(i), i.classList.add("btable-wrap--clockwise-dealing"), a(!0), su(!0);
		let p = Ld(), m = window.requestAnimationFrame(() => {
			sp({
				steps: f,
				root: i,
				trumpHolderId: e.trumpHolderId ?? e.dealerId ?? null,
				onComplete: () => {
					i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), su(!1);
				}
			});
		}), h = window.setTimeout(() => {
			i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), su(!1);
		}, ep(f.length, p) + 400);
		return () => {
			window.cancelAnimationFrame(m), window.clearTimeout(h), op(), i.classList.remove("btable-wrap--clockwise-dealing"), su(!1), a(!1);
		};
	}, [
		e.handNumber,
		e.phase,
		e.dealerId,
		e.participantIds,
		t.length,
		n,
		r
	]), i;
}
//#endregion
//#region src/table/animations/trumpMergePresentation.ts
var lp = null;
function up() {
	lp?.kill(), lp = null;
}
function dp(e, t = {}) {
	ia(e), up();
	let n = e.querySelector("[data-trump-deal-target] .pcard"), r = e.querySelector(".hand__slot--trump-merge-target .pcard");
	if (!n || !r) return t.onComplete?.(), null;
	let i = ea(n), { x: a, y: o } = na(i, ea(r)), s = n.cloneNode(!0);
	s.className = `${s.className} trump-merge-fly-ghost`.trim(), s.setAttribute("aria-hidden", "true"), s.style.position = "fixed", s.style.left = `${i.left}px`, s.style.top = `${i.top}px`, s.style.width = `${i.width}px`, s.style.height = `${i.height}px`, s.style.margin = "0", s.style.pointerEvents = "none", s.style.zIndex = "6", s.style.transformOrigin = "50% 80%", document.body.appendChild(s);
	let c = n.closest("[data-trump-deal-target]");
	q.set(n, { opacity: 0 }), c && q.set(c, { opacity: 0 }), q.set(r, { opacity: 0 });
	let { x: l, y: u } = ra(ea(s), i);
	q.set(s, {
		x: l,
		y: u,
		force3D: !0
	});
	let d = L(I.trumpMerge), f = a * .45, p = o * .45 - Math.max(24, Math.hypot(a, o) * .18), m = q.timeline({
		onComplete: () => {
			s.remove(), q.set(r, { clearProps: "opacity" }), c && q.set(c, { clearProps: "opacity" }), q.set(n, { clearProps: "opacity" }), lp = null, t.onComplete?.();
		},
		onInterrupt: () => {
			s.remove(), q.set(r, { clearProps: "opacity" }), c && q.set(c, { clearProps: "opacity" }), q.set(n, { clearProps: "opacity" }), lp = null;
		}
	});
	return m.to(s, {
		motionPath: {
			path: [
				{
					x: l,
					y: u
				},
				{
					x: l + f,
					y: u + p
				},
				{
					x: l + a,
					y: u + o
				}
			],
			curviness: 1.2
		},
		rotation: 6,
		scale: 1.02,
		duration: d,
		ease: "power2.inOut"
	}), lp = m, m;
}
//#endregion
//#region src/table/hooks/useTrumpMergePresentation.ts
function fp({ tableRootRef: e, trumpMergeActive: t, isTrumpHolder: n, onComplete: r }) {
	let i = (0, l.useRef)(null), a = (0, l.useRef)(r);
	a.current = r, (0, l.useEffect)(() => {
		if (!t) {
			i.current = null;
			return;
		}
		let r = "active";
		if (i.current === r) return;
		i.current = r;
		let o = () => a.current();
		if (!n || Ld()) {
			o();
			return;
		}
		let s = !1, c = () => {
			if (s) return;
			let t = e.current ?? document.querySelector(".btable-wrap");
			if (!t) {
				o();
				return;
			}
			dp(t, { onComplete: () => {
				s || o();
			} }) || o();
		}, l = window.requestAnimationFrame(() => {
			window.requestAnimationFrame(c);
		});
		return () => {
			s = !0, window.cancelAnimationFrame(l), up();
		};
	}, [
		t,
		n,
		e
	]);
}
//#endregion
//#region src/table/wonTrickPileModel.ts
function pp(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function mp(e, t) {
	return (e >>> t & 65535) / 65535;
}
function hp(e, t) {
	let n = pp(`${e}@book${t}`), r = mp(n, 0), i = mp(n, 9), a = mp(n, 17), o = r >= .5 ? 1 : -1, s = i >= .5 ? 1 : -1;
	return {
		offsetX: o * (1.5 + r * 2.5) + t * 2.2,
		offsetY: t * -1.8 + i * 1.2,
		rotation: s * (4 + a * 5) + t * 2.5,
		scale: .88 - t * .02,
		zIndex: t + 1
	};
}
function gp(e) {
	return `${e.playerId}:h${e.handNumber}:t${e.trickNumber}`;
}
//#endregion
//#region src/table/animations/wonTrickPileMotion.ts
var _p = /* @__PURE__ */ new Set(), vp = /* @__PURE__ */ new Set(), yp = I.drawDiscard;
function bp(e, t) {
	return {
		midX: e * .5,
		midY: t * .5
	};
}
function xp(e, t = document) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document, r = n.querySelector(`[data-won-trick-pile-anchor="${e}"]`) ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`);
	return r ? ea(r) : null;
}
function Sp() {
	for (let e of vp) q.set(e, { clearProps: "opacity,transform,willChange,zIndex" });
	vp.clear();
}
function Cp(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) e.remove();
}
function wp(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".bseat--pile-reveal-ready")) e.classList.remove("bseat--pile-reveal-ready");
}
function Tp(e = document) {
	for (let e of _p) e.kill();
	_p.clear(), Cp(e), Sp(), wp(e);
}
function Ep() {
	for (let e of _p) e.kill();
	_p.clear(), Sp();
}
function Dp(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function Op(e, t) {
	let n = ea(e), r = document.createElement("div");
	r.className = "won-trick-fly-ghost", r.setAttribute("aria-hidden", "true"), r.style.position = "fixed", r.style.left = `${n.left}px`, r.style.top = `${n.top}px`, r.style.width = `${n.width}px`, r.style.height = `${n.height}px`, r.style.pointerEvents = "none", r.style.zIndex = "4", r.style.transformOrigin = "50% 50%";
	let i = e.cloneNode(!0);
	return i.style.width = "100%", i.style.height = "100%", r.appendChild(i), t.appendChild(r), r;
}
function kp(e, t) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document;
	(n.querySelector(`[data-won-trick-pile-anchor="${e}"]`)?.closest(".bseat") ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`)?.closest(".bseat"))?.classList.add("bseat--pile-reveal-ready");
}
function Ap(e, t) {
	ia(t.root ?? document);
	let n = R(), r = t.root ?? document, i = t.host ?? (r instanceof HTMLElement ? r : document.body), a = xp(t.winnerPlayerId, r), o = n ? .06 : 140 / 1e3, s = L(yp, n), c = n ? .03 : .05, l = [], u = (e) => {
		_p.delete(d);
		for (let e of l) e.remove();
		Sp(), e && kp(t.winnerPlayerId, r), t.onComplete?.();
	}, d = q.timeline({
		onComplete: () => u(!0),
		onInterrupt: () => u(!1)
	});
	_p.add(d), e.forEach((e, r) => {
		let u = hp(t.trickKey, t.bookIndex), f = Op(e, i);
		l.push(f), vp.add(e), q.set(e, { opacity: 0 });
		let p = ea(f);
		q.set(f, {
			transformOrigin: "50% 50%",
			willChange: "transform,opacity",
			x: 0,
			y: 0,
			rotation: 0,
			scale: 1,
			opacity: 1
		});
		let m = r * c;
		if (!a || n) {
			d.to(f, {
				opacity: 0,
				scale: u.scale,
				duration: Math.min(s, .18),
				onComplete: () => f.remove()
			}, m);
			return;
		}
		let h = a.left + a.width / 2 + u.offsetX, g = a.top + a.height / 2 + u.offsetY, _ = p.left + p.width / 2, v = p.top + p.height / 2, y = h - _, b = g - v, { midX: x, midY: S } = bp(y, b);
		d.to(f, {
			scale: .98,
			duration: o,
			ease: te
		}, m), d.to(f, {
			motionPath: {
				path: [
					{
						x: 0,
						y: 0
					},
					{
						x,
						y: S
					},
					{
						x: y,
						y: b
					}
				],
				curviness: 1.15
			},
			rotation: u.rotation,
			scale: u.scale,
			opacity: .95,
			duration: s,
			ease: te,
			onComplete: () => f.remove()
		}, m + o);
	});
	let f = Math.round((e.length > 0 ? (e.length - 1) * c : 0) * 1e3 + (o + s) * 1e3 + 60);
	return Dp(d, Math.min(760, Math.max(300, f))), d;
}
function jp() {
	return _p.size > 0;
}
function Mp(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = [...t.querySelectorAll("[data-trick-variant=\"live\"] .btrick__play .pcard, [data-testid=\"trick-row\"] .btrick__play .pcard")].filter((e) => e.closest("[data-trick-variant=\"echo\"]") == null);
	return n.length > 0 ? n : [...t.querySelectorAll("[data-trick-variant=\"echo\"] .btrick__play .pcard")];
}
//#endregion
//#region src/table/hooks/useWonTrickCollection.ts
var Np = new Set(["nextLeadReady", "live"]);
function Pp({ trickPresentation: e, handNumber: t, sessionPhase: n = null, handComplete: r = !1, tableRootRef: i, onTrickCollectionStart: a }) {
	let o = (0, l.useRef)(null), s = (0, l.useRef)(t), c = (0, l.useRef)(e.phase), u = (0, l.useRef)(null), d = () => {
		u.current != null && (window.clearTimeout(u.current), u.current = null);
	}, f = (e) => {
		d();
		let t = jp() ? 820 : 0;
		u.current = window.setTimeout(() => {
			u.current = null, Fp(e);
		}, t);
	};
	(0, l.useLayoutEffect)(() => {
		let e = i.current;
		if (e) {
			if (s.current !== t) {
				s.current = t, o.current = null, d(), Tp(e);
				return;
			}
			(r || n != null && n !== "play") && (o.current = null, d(), Tp(e));
		}
	}, [
		t,
		r,
		n,
		i
	]), (0, l.useLayoutEffect)(() => {
		let n = c.current, r = e.phase;
		c.current = r;
		let s = i.current;
		if (!s || (n === "collectTrick" && Np.has(r) && (o.current = null, f(s)), r !== "collectTrick")) return;
		let l = e.trickWinnerSeatId, u = e.frozenTrick;
		if (!l || !u) return;
		let p = `${u.trickNumber}:${l}:${u.plays.length}`;
		if (o.current === p) return;
		o.current = p, d(), Ep(), Ip(s);
		let m = Mp(s);
		if (!m.length) return;
		let h = Math.max(0, (e.displayTricksByPlayer[l] ?? 1) - 1), g = gp({
			playerId: l,
			handNumber: t,
			trickNumber: u.trickNumber
		});
		lu(!0);
		let _ = window.setTimeout(() => {
			a?.({
				trickId: u.trickNumber,
				winningSeat: l
			}), Ap(m, {
				winnerPlayerId: l,
				trickKey: g,
				bookIndex: h,
				root: s,
				host: s,
				onComplete: () => lu(!1)
			});
		}, 240);
		return () => {
			window.clearTimeout(_), lu(!1);
		};
	}, [
		e.phase,
		e.trickWinnerSeatId,
		e.frozenTrick,
		e.displayTricksByPlayer,
		t,
		i,
		a
	]), (0, l.useEffect)(() => () => d(), []), (0, l.useLayoutEffect)(() => {
		let e = i.current;
		return () => {
			d(), e ? Tp(e) : Ep();
		};
	}, [i]);
}
function Fp(e) {
	for (let t of e.querySelectorAll(".bseat--pile-reveal-ready")) t.classList.remove("bseat--pile-reveal-ready");
}
function Ip(e) {
	for (let t of e.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) t.remove();
}
//#endregion
//#region src/audio/audioEvents.ts
function Lp(e, t) {
	let n = Math.min(1, Math.floor((Math.max(2, Math.min(8, e)) - 2) / 3));
	return Math.min(2, n + (t <= 4 ? 0 : 1));
}
function Rp(e, t, n) {
	return `${e}:${t}:${n}`;
}
function zp(e) {
	return {
		type: "card:played",
		trickId: e.trickId,
		cardId: e.cardId,
		playerCount: e.playerCount,
		cardsInTrick: e.cardsInTrick,
		takesLead: e.takesLead,
		isLocalPlayer: e.isLocalPlayer,
		intensityTier: Lp(e.playerCount, e.cardsInTrick)
	};
}
function Bp(e) {
	return {
		type: "card:lead-change",
		trickId: e.trickId,
		cardId: e.cardId,
		playerCount: e.playerCount,
		cardsInTrick: e.cardsInTrick,
		takesLead: !0,
		isLocalPlayer: e.isLocalPlayer,
		intensityTier: Lp(e.playerCount, e.cardsInTrick)
	};
}
function Vp(e) {
	return {
		type: "trick:won",
		trickId: e.trickId,
		winningSeat: e.winningSeat,
		playerCount: e.playerCount,
		cardsInTrick: 0,
		isLocalPlayer: e.isLocalPlayer,
		intensityTier: 2
	};
}
function Hp(e) {
	return {
		type: "trick:collected",
		trickId: e.trickId,
		winningSeat: e.winningSeat,
		playerCount: e.playerCount,
		cardsInTrick: 0,
		intensityTier: 1
	};
}
//#endregion
//#region src/audio/AudioManager.ts
var Up = /* @__PURE__ */ new Map(), Wp = /* @__PURE__ */ new Map();
function Gp(e) {
	switch (e) {
		case "card:played": return "cardPlace";
		case "card:lead-change": return "leadChange";
		case "trick:won": return "trickWin";
		case "trick:collected": return "trickCollect";
	}
}
function Kp(e) {
	switch (e) {
		case "card:played": return 0;
		case "card:lead-change": return 0;
		case "trick:won": return 0;
		case "trick:collected": return 0;
	}
}
function qp(e) {
	switch (e.type) {
		case "card:played":
		case "card:lead-change": return e.cardId ?? "unknown";
		case "trick:won":
		case "trick:collected": return `${e.winningSeat ?? "unknown"}:${e.type}`;
	}
}
function Jp(e) {
	let t = Up.get(e);
	return t == null ? !1 : Date.now() - t > 9e4 ? (Up.delete(e), !1) : !0;
}
function Yp(e) {
	Up.set(e, Date.now());
}
function Xp() {
	Up.clear();
	for (let e of Wp.values()) clearTimeout(e);
	Wp.clear();
}
function Zp(e) {
	let t = ms(), n = Gp(e.type);
	if (!gs(t.soundMode, n)) return;
	ws("requested", {
		key: n,
		source: "AudioManager",
		action: e.type
	});
	let r = {
		source: "AudioManager",
		action: e.type
	};
	switch (e.type) {
		case "card:played":
			Oc(e.intensityTier, r);
			break;
		case "card:lead-change":
			kc(e.intensityTier, r);
			break;
		case "trick:won":
			jc(e.isLocalPlayer ? 1.08 : 1, !!e.isLocalPlayer, r);
			break;
		case "trick:collected":
			Ac(r);
			break;
	}
}
function Qp(e) {
	let t = ms();
	if (e.type === "trick:won" && e.isLocalPlayer) {
		xs(t.hapticsMode, "medium") && qc("medium");
		return;
	}
	e.type === "card:lead-change" && e.isLocalPlayer && xs(t.hapticsMode, "light") && qc("light");
}
function $p(e) {
	try {
		let t = Rp(e.type, e.trickId, qp(e));
		if (Jp(t)) return;
		let n = Kp(e.type), r = () => {
			Jp(t) || (Yp(t), Zp(e), Qp(e));
		};
		if (n <= 0) {
			r();
			return;
		}
		let i = t, a = Wp.get(i);
		a && clearTimeout(a);
		let o = setTimeout(() => {
			Wp.delete(i), r();
		}, n);
		Wp.set(i, o);
	} catch {}
}
//#endregion
//#region src/table/hooks/useCardAudio.ts
function em({ trickPresentation: e, currentUserId: t = null, participantCount: n, trickNumber: r, sessionPhase: i = null }) {
	let a = (0, l.useRef)(e.phase), o = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		i !== "play" && (Xp(), o.current = null);
	}, [i, r]), (0, l.useEffect)(() => {
		let r = a.current, i = e.phase;
		if (a.current = i, r === i || i !== "winnerReveal") return;
		let s = e.frozenTrick, c = s?.winnerId ?? e.trickWinnerSeatId;
		if (!c || !s) return;
		let l = `${s.trickNumber}:${c}:won`;
		o.current !== l && (o.current = l, $p(Vp({
			trickId: s.trickNumber,
			winningSeat: c,
			playerCount: n,
			isLocalPlayer: t === c
		})));
	}, [
		e.phase,
		e.frozenTrick,
		e.trickWinnerSeatId,
		n,
		t
	]), {
		onCardLanded: (0, l.useCallback)((t) => {
			if (e.phase !== "live") return;
			let i = {
				...t,
				trickId: r,
				playerCount: n
			};
			$p(zp(i)), i.takesLead && i.cardIndex > 0 && $p(Bp(i));
		}, [
			e.phase,
			r,
			n
		]),
		onTrickCollectionStart: (0, l.useCallback)((e) => {
			$p(Hp({
				...e,
				playerCount: n
			}));
		}, [n])
	};
}
//#endregion
//#region src/session/liveHand.ts
function tm() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function nm(e) {
	let t = e ?? tm();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function rm(e) {
	if (!e) return !1;
	let t = e.phase ?? null;
	if (t !== "draw" && t !== "play" && t !== "reveal" && t !== "decision") return !1;
	let n = e.participantIds ?? [];
	if (n.length === 0) return !1;
	let r = e.tricksByPlayer ?? {};
	return !(ad(r, n) || id(r, n) >= 5);
}
function im(e) {
	if (!e) return 0;
	let t = e.phase ?? "", n = t === "play" ? 1e3 : t === "draw" ? 100 : t === "decision" ? 50 : t === "reveal" ? 25 : 0;
	n += (e.drawCompletedIds?.length ?? 0) * 10;
	let r = e.participantIds ?? [];
	n += id(e.tricksByPlayer ?? {}, r);
	let i = e.handDecision;
	return t === "decision" && i && (n += (i.currentIndex ?? 0) * 5, n += (i.playingIds?.length ?? 0) * 2, n += (i.passedIds?.length ?? 0) * 2), n;
}
function am(e, t) {
	return rm(t) ? rm(e) ? im(t) >= im(e) ? t : e : t : e;
}
function om(e) {
	let t = e?.phase ?? null;
	return t === "reveal" || t === "decision" || t === "draw" || t === "play";
}
function sm(e) {
	let t = e?.currentHand ?? tm(), n = e?.liveEnrollment?.deal?.publicHand, r = n?.phase ?? null;
	if (nm(t) && n && !rm(n)) return tm();
	if (rm(t) && rm(n)) {
		let e = t.phase === "reveal" || t.phase === "decision", r = n?.drawCompletedIds?.length ?? 0, i = t.drawCompletedIds?.length ?? 0, a = id(n?.tricksByPlayer ?? {}, n?.participantIds ?? []), o = id(t.tricksByPlayer ?? {}, t.participantIds ?? []);
		return e && n?.phase === "draw" && o === 0 && a === 0 && r > 0 && i === 0 ? t : am(t, n);
	}
	if (rm(t)) return t;
	if (r === "draw" || r === "play" || r === "reveal" || r === "decision") {
		if (rm(n)) {
			let i = id(n?.tricksByPlayer ?? {}, n?.participantIds ?? []);
			return nm(t) && i === 0 && r === "draw" && !e?.liveEnrollment?.active ? tm() : n;
		}
		return n?.phase ? n : om(t) ? t : nm(t) ? tm() : t;
	}
	return r && n ? n : t;
}
function cm(e) {
	let t = sm(e), n = t?.phase ?? null;
	if (n === "reveal" || n === "draw" || n === "play") return null;
	if (n === "decision") {
		let e = So(t.handDecision ?? null);
		if (e?.active) return e;
	}
	let r = e?.liveEnrollment, i = r?.deal?.publicHand?.phase ?? null;
	return r?.active ? r : i === "draw" || i === "play" || i === "reveal" || i === "decision" ? null : e?.handEnrollment?.active ? e.handEnrollment : e?.handEnrollment ?? null;
}
function lm(e) {
	return !e.cardsDealt && e.handParticipantCount === 0 && e.enrollmentActive;
}
function um(e, t) {
	return e === "decision" && t?.active === !0;
}
function dm(e) {
	return e.pagatDecisionActive && e.handDecision ? (e.handDecision.orderedPlayerIds ?? [])[e.handDecision.currentIndex ?? 0] ?? null : e.legacyEnrollmentActive && e.enrollment?.active ? (e.enrollment.orderedPlayerIds ?? [])[e.enrollment.currentIndex ?? 0] ?? null : null;
}
function fm(e) {
	if (!e.participantIds?.includes(e.playerId)) return !1;
	let t = e.phase ?? null;
	return t === "draw" || t === "play";
}
//#endregion
//#region src/session/handPhaseMachine.ts
var $ = {
	WAITING: "waiting",
	ENROLLMENT: "enrollment",
	DEAL: "deal",
	DRAW: "draw",
	PLAY: "play",
	SETTLE: "settle",
	NEXT_HAND_PREP: "next-hand-prep"
}, pm = [
	{
		from: $.WAITING,
		event: "open_enrollment",
		to: $.ENROLLMENT
	},
	{
		from: $.WAITING,
		event: "deal_cards",
		to: $.DEAL
	},
	{
		from: $.NEXT_HAND_PREP,
		event: "open_enrollment",
		to: $.ENROLLMENT
	},
	{
		from: $.NEXT_HAND_PREP,
		event: "deal_cards",
		to: $.DEAL
	},
	{
		from: $.NEXT_HAND_PREP,
		event: "prep_complete",
		to: $.WAITING
	},
	{
		from: $.ENROLLMENT,
		event: "enrollment_step",
		to: $.ENROLLMENT
	},
	{
		from: $.ENROLLMENT,
		event: "enrollment_complete",
		to: $.DEAL
	},
	{
		from: $.ENROLLMENT,
		event: "solo_win",
		to: $.SETTLE
	},
	{
		from: $.ENROLLMENT,
		event: "decision_complete",
		to: $.DRAW
	},
	{
		from: $.DEAL,
		event: "advance_reveal",
		to: $.DRAW
	},
	{
		from: $.DEAL,
		event: "decision_step",
		to: $.ENROLLMENT
	},
	{
		from: $.DRAW,
		event: "submit_draw",
		to: $.DRAW
	},
	{
		from: $.DRAW,
		event: "draw_fold",
		to: $.DRAW
	},
	{
		from: $.DRAW,
		event: "draw_complete",
		to: $.PLAY
	},
	{
		from: $.DRAW,
		event: "solo_win",
		to: $.SETTLE
	},
	{
		from: $.PLAY,
		event: "play_card",
		to: $.PLAY
	},
	{
		from: $.PLAY,
		event: "hand_complete",
		to: $.SETTLE
	},
	{
		from: $.SETTLE,
		event: "cowin_pending",
		to: $.SETTLE
	},
	{
		from: $.SETTLE,
		event: "record_hand",
		to: $.NEXT_HAND_PREP
	},
	{
		from: $.NEXT_HAND_PREP,
		event: "session_final",
		to: $.WAITING
	}
], mm = (e, t) => `${e}:${t}`;
new Map(pm.map((e) => [mm(e.from, e.event), e.to]));
function hm(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
function gm(e, t) {
	return !e || !t ? !1 : e === t ? !0 : hm(e);
}
function _m() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function vm(e) {
	let t = e.session, n = t ? sm(t) : _m(), r = n.phase ?? null, i = n.participantIds ?? [], a = n.tricksByPlayer ?? {}, o = id(a, i), s = i.length > 0 && ad(a, i), c = !!t?.pendingCoWinSettlement?.winnerIds?.length, l = t ? cm(t) : null, u = um(r, n.handDecision ?? null), d = lm({
		cardsDealt: r === xo.REVEAL || r === xo.DECISION || r === xo.DRAW || r === xo.PLAY,
		handParticipantCount: i.length,
		enrollmentActive: !!l?.active
	}), f = d || u, p = ym({
		sessionStatus: t?.status ?? null,
		handPhase: r,
		participantIds: i,
		trickCount: o,
		handComplete: s,
		pendingCoWin: c,
		enrollmentActive: f,
		handCount: t?.handCount ?? 0,
		clearedHand: nm(n)
	});
	return {
		phase: p,
		handPhase: r,
		enrollmentActive: f,
		pagatDecisionActive: u,
		participantIds: i,
		turnPlayerId: bm({
			phase: p,
			handPhase: r,
			hand: n,
			enrollment: l,
			pagatDecisionActive: u,
			legacyEnrollmentActive: d
		}),
		handComplete: s,
		pendingCoWin: c,
		trickCount: o
	};
}
function ym(e) {
	if (e.sessionStatus === "final") return $.WAITING;
	if (e.pendingCoWin) return $.SETTLE;
	let t = e.handPhase ?? null, n = e.participantIds ?? [];
	return t === xo.PLAY ? e.handComplete || (e.trickCount ?? 0) >= 5 ? $.SETTLE : $.PLAY : t === xo.DRAW ? $.DRAW : t === xo.REVEAL ? $.DEAL : t === xo.DECISION || e.enrollmentActive ? $.ENROLLMENT : e.clearedHand !== !1 && n.length === 0 && (e.handCount ?? 0) > 0 && !e.enrollmentActive ? $.NEXT_HAND_PREP : $.WAITING;
}
function bm(e) {
	let { phase: t, hand: n, enrollment: r, pagatDecisionActive: i, legacyEnrollmentActive: a } = e;
	return t === $.ENROLLMENT ? dm({
		pagatDecisionActive: i,
		handDecision: n.handDecision ?? null,
		legacyEnrollmentActive: a,
		enrollment: r
	}) : t === $.DRAW || t === $.PLAY ? n.turnPlayerId ?? null : null;
}
function xm(e) {
	let { snapshot: t, action: n, playerId: r, actorId: i, suppressTurn: a = !1 } = e, o = e.drawCompletedIds ?? [];
	if (!gm(r, i)) return {
		ok: !1,
		reason: "actor_mismatch"
	};
	switch (n) {
		case "enrollment_in":
		case "enrollment_pass": return t.phase === $.ENROLLMENT ? t.turnPlayerId === r ? { ok: !0 } : {
			ok: !1,
			reason: "not_your_turn"
		} : {
			ok: !1,
			reason: "not_enrollment"
		};
		case "enrollment_timeout": return t.phase === $.ENROLLMENT ? { ok: !0 } : {
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
		case "advance_reveal": return t.phase === $.DEAL ? { ok: !0 } : {
			ok: !1,
			reason: "not_deal"
		};
		case "submit_draw":
		case "draw_fold": return t.phase === $.DRAW ? t.turnPlayerId === r ? o.includes(r) ? {
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
		case "play_card": return t.phase === $.PLAY ? t.handComplete ? {
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
		case "record_hand": return t.phase !== $.SETTLE && !t.handComplete ? {
			ok: !1,
			reason: "hand_not_ready_to_settle"
		} : { ok: !0 };
		default: return {
			ok: !1,
			reason: "unknown_action"
		};
	}
}
//#endregion
//#region src/table/localAction.ts
function Sm(e) {
	let t = e.currentUserId;
	if (!t || e.handComplete) return !1;
	let n = e.selfPlayer, r = fm({
		phase: e.session.phase,
		participantIds: e.session.participantIds,
		playerId: t
	});
	if (!n || !r && n.isOut || n.actionDeclared) return !1;
	let i = vm({
		session: {
			currentHand: {
				phase: e.session.phase ?? void 0,
				turnPlayerId: e.session.turnPlayerId ?? void 0,
				drawCompletedIds: e.session.drawCompletedIds,
				participantIds: e.session.participantIds ?? [],
				tricksByPlayer: {}
			},
			handEnrollment: e.session.handEnrollment ?? null
		},
		suppressTurn: e.suppressTurn
	});
	if (i.phase === $.ENROLLMENT || e.enrollmentActive) return !!(n.canToggleInHand || n.canPassEnrollment);
	if (i.phase === $.DEAL) return !1;
	let a = xm({
		snapshot: i,
		action: "submit_draw",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn,
		drawCompletedIds: e.session.drawCompletedIds
	});
	if (i.phase === $.DRAW && a.ok) return !0;
	let o = xm({
		snapshot: i,
		action: "play_card",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn
	});
	return !!(i.phase === $.PLAY && o.ok);
}
function Cm(e) {
	let t = e.currentUserId;
	if (!t || e.handComplete || e.suppressTurn) return !1;
	let n = vm({
		session: {
			currentHand: {
				phase: e.session.phase ?? void 0,
				turnPlayerId: e.session.turnPlayerId ?? void 0,
				drawCompletedIds: e.session.drawCompletedIds,
				participantIds: e.session.participantIds ?? [],
				tricksByPlayer: {}
			},
			handEnrollment: e.session.handEnrollment ?? null
		},
		suppressTurn: e.suppressTurn
	});
	return n.phase === $.DRAW ? xm({
		snapshot: n,
		action: "submit_draw",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn,
		drawCompletedIds: e.session.drawCompletedIds
	}).ok : n.phase === $.PLAY ? xm({
		snapshot: n,
		action: "play_card",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn
	}).ok : e.session.turnPlayerId === t;
}
function wm(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off";
	return [
		e.session.phase ?? "",
		e.session.turnPlayerId ?? "",
		n,
		e.selfPlayer?.actionDeclared ? "declared" : "open",
		e.session.drawCompletedIds?.join(",") ?? "",
		e.suppressTurn ? "1" : "0",
		Sm(e) ? "act" : "wait"
	].join("|");
}
//#endregion
//#region src/table/trumpHolderPresentation.ts
function Tm(e) {
	let t = e.trumpHolderId, n = !!e.trumpUpcard, { trumpMergeActive: r, trumpMergedIntoHand: i } = e.handPresentation;
	return {
		trumpHolderId: t,
		hasTrumpOnTable: n,
		hideCenterTrump: !1,
		showRevealedTrumpAtHolder: !1,
		showTrumpSuitReminder: i && !!e.trumpSuit && !e.trumpUpcard && (e.phase === "decision" || e.phase === "draw" || e.phase === "play"),
		trumpMergeActive: r,
		trumpMergedIntoHand: i
	};
}
function Em(e) {
	return e <= 0 ? null : e - 1;
}
function Dm(e, t, n, r, i) {
	if (i || !t.trumpHolderId || e !== t.trumpHolderId || r <= 0) return {
		revealedTrumpUpcard: null,
		revealedTrumpIndex: null,
		seatTrumpMergeActive: !1
	};
	let a = t.showRevealedTrumpAtHolder ? Em(r) : null;
	return {
		revealedTrumpUpcard: t.showRevealedTrumpAtHolder ? n : null,
		revealedTrumpIndex: a,
		seatTrumpMergeActive: t.trumpMergeActive
	};
}
//#endregion
//#region src/table/CardTable.tsx
function Om({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: _, recommendedDiscardIndices: v = [], handComplete: y = !1, actionFeedback: b, trickPresentation: x, handPresentation: S, microinteractions: C, instantTrickPlays: w = !1, turnCountdown: T = null, bigPotEvent: E = null, onDismissTableEvent: D, onToggleInHand: O, onPassEnrollment: k, onTrickDelta: A, onSubmitDraw: j, onPassDraw: M, onFoldDraw: N, onPlayCard: ee, onReaction: te, onHeroUserActivity: P }) {
	let F = t.map((e) => ({
		...e,
		isSelf: e.isSelf || m != null && e.playerId === m
	})), I = Zd(F, e, m), ne = I.length, L = `btable--p${Math.min(8, Math.max(2, ne))}`, R = Sd(ne), z = Object.fromEntries(F.map((e) => [e.playerId, e.displayName])), B = Af(), V = e.sessionId, H = qf({
		aspect: R,
		sessionKey: V
	});
	(0, l.useEffect)(() => {
		if (typeof window > "u" || localStorage.getItem("tableSeatDebug") !== "1") return;
		let e = H.current;
		if (!e) return;
		let n = [...e.querySelectorAll(".bseat__avatar-wrap")].filter((e) => {
			let t = e.getBoundingClientRect();
			return t.width > 0 && t.height > 0;
		}).length;
		console.debug("[table-seats]", {
			playersProp: t.length,
			feltPlayers: F.length,
			rotated: I.length,
			domSeats: e.querySelectorAll(".bseat").length,
			visibleAvatars: n,
			inOverlay: !!e.closest(".table-play-overlay"),
			desktopShell: !!e.closest(".btable-desktop")
		});
	}, [
		t.length,
		F.length,
		I.length,
		H
	]);
	let { cards: re, pileIndexRef: ie, commitDiscardCards: U } = Pa({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: H
	});
	Jf({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: H,
		pileIndexRef: ie,
		onDiscardCommitted: U
	}), Yf({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: H
	}), Zf({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: S,
		tableRootRef: H
	});
	let ae = cp({
		session: e,
		heroCards: a,
		privateHandReady: p,
		tableRootRef: H
	}), oe = e.trumpHolderId ?? e.dealerId ?? null, se = m != null && oe != null && m === oe;
	fp({
		tableRootRef: H,
		trumpMergeActive: S.trumpMergeActive,
		isTrumpHolder: se,
		onComplete: S.completeTrumpMerge
	});
	let ce = em({
		trickPresentation: x,
		currentUserId: m,
		participantCount: r,
		trickNumber: e.currentTrick?.trickNumber ?? x.frozenTrick?.trickNumber ?? 1,
		sessionPhase: e.phase
	});
	Pp({
		trickPresentation: x,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: y,
		tableRootRef: H,
		onTrickCollectionStart: ce.onTrickCollectionStart
	});
	let le = new Set(e.participantIds.filter((t) => sd(t, x.displayTricksByPlayer, e.participantIds, e.phase))), ue = F.map((t) => {
		let r = x.displayTricksByPlayer[t.playerId] ?? 0, i = x.trickWinnerSeatId === t.playerId, a = x.suppressTurnPlayerId || S.suppressTurnIndicator, o = x.phase === "collectTrick" && i, s = S.enrollmentPulse[t.playerId], c = S.animatingDrawPlayerId === t.playerId, l = Dm(t.playerId, f, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: pd(t.bankroll, n.anteAmount, {
				inHand: t.inHand,
				anteAnimActive: S.anteAnimActive,
				anteAlreadyPosted: e.postedAntes != null && Object.prototype.hasOwnProperty.call(e.postedAntes, t.playerId)
			}),
			tricksThisHand: r,
			isOnTurn: a ? !1 : t.isOnTurn,
			isActiveActor: a ? !1 : t.isActiveActor,
			isLeading: i && (x.phase === "winnerReveal" || x.phase === "collectTrick") ? !0 : a ? !1 : t.isLeading,
			isTrickCapture: o,
			enrollmentPulse: s,
			drawAnimSubPhase: c && t.isSelf ? S.drawAnimSubPhase : null,
			drawDiscardCount: c ? S.drawDiscardCount : 0,
			drawReplaceCount: c ? S.drawReplaceCount : 0,
			turnHandoff: !1,
			turnCountdown: T?.playerId === t.playerId ? {
				progress: T.progress,
				remainingMs: T.remainingMs,
				segment: T.segment
			} : null,
			dealerMoved: C.dealerMovedPlayerId === t.playerId,
			winnerFlash: C.winnerFlashPlayerId === t.playerId,
			bankrollTick: C.bankrollTicks[t.playerId] ?? null,
			bourreAlert: t.isSelf ? C.bourreAlerts[t.playerId] ?? null : null,
			bourrePressure: le.has(t.playerId)
		};
	}), de = F.find((e) => e.isSelf), fe = x.suppressTurnPlayerId || S.suppressTurnIndicator, pe = !!(m && e.drawCompletedIds?.includes(m));
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: H,
		className: [
			"btable-wrap btable-wrap--stage-fit",
			L,
			ue.some((e) => e.isActiveActor) ? "btable-wrap--has-active-turn" : "",
			ae ? "btable-wrap--clockwise-dealing" : ""
		].filter(Boolean).join(" "),
		"data-testid": "table-root",
		style: {
			"--player-count": ne,
			"--table-aspect": R,
			"--trick-card-travel-ms": "395ms",
			"--trick-card-settle-ms": "165ms",
			"--trick-card-shift-ms": "220ms",
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": `${Td}ms`,
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": `${Cd}ms`,
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": `${Cd + 400 + Td + 230}ms`,
			"--deal-card-stagger-ms": `${B.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${B.drawDiscardMs}ms`,
			"--draw-replace-ms": `${B.drawReplaceMs}ms`
		},
		children: [/* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-wrap__table-area",
			children: /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-wrap__stage-scaler",
				children: /* @__PURE__ */ (0, g.jsx)("div", {
					className: "table-stage-fit",
					children: /* @__PURE__ */ (0, g.jsxs)("div", {
						className: "table-stage",
						children: [
							/* @__PURE__ */ (0, g.jsxs)("div", {
								className: "table-oval",
								children: [/* @__PURE__ */ (0, g.jsx)("div", { className: "btable__rail" }), /* @__PURE__ */ (0, g.jsx)("div", {
									className: "btable__felt",
									"data-testid": "table-felt"
								})]
							}),
							/* @__PURE__ */ (0, g.jsx)("div", {
								className: "btable__play-zone",
								children: /* @__PURE__ */ (0, g.jsx)(Ud, {
									potMetrics: {
										...n,
										currentPot: S.displayPotAmount
									},
									participantCount: r,
									trumpUpcard: e.trumpUpcard,
									trumpSuit: e.trumpSuit,
									phase: e.phase,
									enrollmentActive: i,
									remainingDeckCount: e.remainingDeckCount,
									trickDisplayPlays: x.displayPlays,
									trickLeadSuit: e.currentTrick?.leadSuit ?? e.leadSuit ?? null,
									trickWinnerPlayerId: x.winnerPlayerId,
									trickShowWinnerTag: x.showWinnerTag,
									trickPresentationPhase: x.phase,
									trickEchoPlays: x.trickEchoPlays,
									trickEchoWinnerId: x.trickEchoWinnerId,
									trickEchoPhase: x.trickEchoPhase,
									showFinalTrickEcho: x.showFinalTrickEcho,
									playerNames: z,
									anteAnimActive: S.anteAnimActive,
									trumpRevealActive: S.trumpRevealActive,
									trumpMergeActive: S.trumpMergeActive,
									hideCenterTrump: u,
									showTrumpSuitReminder: d,
									drawAnimPlayerId: S.animatingDrawPlayerId,
									drawAnimSubPhase: S.drawAnimSubPhase,
									drawDiscardCount: S.drawDiscardCount,
									settleAnimActive: S.settleAnimActive,
									settleCarryOver: S.settleCarryOver,
									potTick: C.potTick,
									trumpReminderPulse: C.trumpReminderPulse,
									instantTrickPlays: w,
									peakTrickPlayCount: x.peakPlayCount,
									discardPileCards: re,
									currentUserId: m,
									onCardLanded: ce.onCardLanded
								})
							}),
							/* @__PURE__ */ (0, g.jsx)("div", {
								className: "btable__seats",
								"aria-label": "Players at the table",
								children: I.map((e, t) => {
									let n = Sf(t, I.length, {
										isMobile: !1,
										isSelf: e.isSelf
									}), r = ue.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, g.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										"data-seat-index": t,
										children: /* @__PURE__ */ (0, g.jsx)(Yd, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											clockwiseDealing: ae,
											style: {
												left: `${n.x}%`,
												top: `${n.y}%`
											},
											onToggleInHand: () => O(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
											onPassEnrollment: e.canPassEnrollment && k ? () => k(e.playerId) : void 0,
											onTrickDelta: (t) => A(e.playerId, t),
											onReaction: e.isSelf ? te : void 0
										})
									}, e.playerId);
								})
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "hand-panel",
			children: [E && Ku(a) && D && /* @__PURE__ */ (0, g.jsx)(Gu, {
				event: E,
				onDismiss: D
			}), /* @__PURE__ */ (0, g.jsx)(Wu, {
				cards: a,
				privateHandReady: p,
				phase: e.phase,
				enrollmentActive: i,
				isInHand: !!de?.inHand,
				isDealer: !!de?.isDealer,
				signedIn: !!m,
				isMyTurn: Cm({
					currentUserId: m,
					session: e,
					suppressTurn: !!fe,
					handComplete: y,
					enrollmentActive: i,
					selfPlayer: de
				}),
				dealStaggerMs: B.dealCardStaggerMs,
				drawAnimSubPhase: S.animatingDrawPlayerId === m ? S.drawAnimSubPhase : null,
				drawDiscardCount: S.animatingDrawPlayerId === m ? S.drawDiscardCount : 0,
				drawReplaceCount: S.animatingDrawPlayerId === m ? S.drawReplaceCount : 0,
				drawCompleted: pe,
				maxDrawDiscards: e.maxDrawDiscards ?? 4,
				legalPlayIndices: h ?? void 0,
				recommendedPlayIndex: _ ?? void 0,
				recommendedDiscardIndices: v,
				handComplete: y,
				actionFeedback: b,
				onSubmitDraw: j,
				onPassDraw: M,
				onFoldDraw: N,
				onPlayCard: ee,
				currentUserId: m,
				revealedTrumpIndex: o,
				trumpMergeActive: s,
				trumpDisabledIndex: c,
				handNumber: e.handNumber,
				trickNumber: e.currentTrick?.trickNumber ?? null,
				turnPlayerId: e.turnPlayerId,
				tableRootRef: H,
				pileIndexRef: ie,
				onDiscardCommitted: U,
				onUserActivity: P,
				skipHeroDealMotion: ae
			})]
		})]
	});
}
//#endregion
//#region src/table/layout/mobileSeatMap.ts
function km(e, t) {
	let n = Math.max(1, Math.min(7, e || 1));
	return t === "portrait" ? n <= 1 ? .8 : n <= 2 ? .82 : n <= 3 ? .86 : n <= 4 ? .9 : .94 : n <= 1 ? 1.02 : n <= 2 ? .98 : n <= 3 ? 1.02 : n <= 5 ? 1.16 : 1.26;
}
//#endregion
//#region src/table/layout/useTableLayoutMode.ts
var Am = "(orientation: portrait)";
function jm() {
	let e = Hf(), [t, n] = (0, l.useState)(() => typeof window < "u" && window.matchMedia(Am).matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Am), t = () => n(e.matches);
		return t(), e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []), e ? t ? "mobile-portrait" : "mobile-landscape" : "desktop";
}
//#endregion
//#region src/table/hooks/useMobileStageFit.ts
function Mm(e, t) {
	if (typeof window > "u") return t;
	let n = getComputedStyle(document.documentElement).getPropertyValue(e).trim(), r = parseFloat(n);
	return Number.isFinite(r) ? r : t;
}
function Nm(e) {
	let t = e.closest(".btable-session");
	if (!t) return 0;
	let n = t.querySelector(".btable-session__head-row"), r = t.querySelector(".btable-session__status"), i = 0;
	n && (i += n.getBoundingClientRect().height), r && (i += r.getBoundingClientRect().height);
	let a = t.querySelector(".btable-mobile");
	if (a) {
		let e = t.getBoundingClientRect(), n = a.getBoundingClientRect(), r = Math.max(0, n.top - e.top), o = Math.max(0, e.bottom - n.bottom);
		return Math.max(i, r + o) + 4;
	}
	return i + 4;
}
function Pm(e) {
	return e.closest(".btable-mobile__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function Fm({ aspect: e, sessionKey: t }) {
	let n = (0, l.useRef)(null), r = (0, l.useRef)(0), i = (0, l.useRef)(0), a = (0, l.useRef)(t), o = jm(), { settings: s } = nu(), c = o === "mobile-portrait";
	return (0, l.useLayoutEffect)(() => {
		if (typeof window > "u") return;
		let o = n.current;
		if (!o) return;
		a.current !== t && (a.current = t, r.current = 0, i.current = 0);
		let l = window.visualViewport, u = () => {
			if (Bu()) return;
			let t = Pm(o).getBoundingClientRect(), n = o.querySelector(".btable-mobile-hero-dock")?.getBoundingClientRect(), a = !!o.closest(".table-play-overlay"), u = c ? 104 : 92, d = c ? 210 : 168, f = Nf(n?.height ?? 0, r.current, u, d);
			r.current = f.peak;
			let p = f.height, m = parseInt(getComputedStyle(o).getPropertyValue("--player-count").trim(), 10) || 4, h = m <= 4, g = !c, _ = (g && h ? Mm("--mobile-fit-pad-x", 4) : Mm("--mobile-fit-pad-x", 8)) + (g && a ? 4 : 12), v = (g && h ? Mm("--mobile-fit-pad-y", 2) : Mm("--mobile-fit-pad-y", 6)) + (g && a ? 4 : 10), y = Mm("--mobile-fit-gap", c ? 8 : 6), b = l, x = Math.min(t.width, b?.width ?? window.innerWidth), S = Math.min(t.height, b?.height ?? window.innerHeight);
			if (a) {
				let e = Pf(Nm(o), i.current, 72);
				i.current = e.peak, S = Math.max(140, S - e.height);
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = g ? {
				...Lf({
					availWidth: x,
					availHeight: S,
					aspect: e,
					userScale: 1,
					padX: _,
					padY: v,
					stageShare: If(m)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Rf({
				availWidth: x,
				availHeight: S,
				aspect: e,
				userScale: 1,
				padX: _,
				padY: v,
				heroMinHeight: p,
				gap: y
			}), T = Math.max(0, x - _ * 2), E = g ? Math.max(0, S - v * 2) : Math.max(120, S - v * 2 - p - y), D = Math.min(w.displayStageWidth * C, T), O = Math.min(w.displayStageHeight * C, E);
			o.classList.toggle("btable-mobile-wrap--landscape-row", g), o.classList.toggle("btable-mobile-wrap--low-count", h), o.dataset.layout = c ? "portrait" : "landscape", o.style.setProperty("--stage-fit-width", `${Math.round(D)}px`), o.style.setProperty("--stage-fit-height", `${Math.round(O)}px`), o.style.setProperty("--stage-fit-scale", String(w.fitScale)), o.style.setProperty("--stage-effective-scale", "1");
		}, d = null, f = () => {
			Bu() || (d ??= window.requestAnimationFrame(() => {
				d = null, u();
			}));
		}, p = new ResizeObserver(f), m = Pm(o);
		m instanceof HTMLElement && p.observe(m), f();
		let h = Vu(() => {
			Bu() || f();
		}), g = () => f();
		return window.addEventListener("orientationchange", g), l?.addEventListener("resize", g), l?.addEventListener("scroll", g), () => {
			d != null && window.cancelAnimationFrame(d), h(), p.disconnect(), window.removeEventListener("orientationchange", g), l?.removeEventListener("resize", g), l?.removeEventListener("scroll", g);
		};
	}, [
		e,
		o,
		c,
		t,
		s.tableScale
	]), n;
}
//#endregion
//#region src/table/MobileCardTable.tsx
function Im({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: _, recommendedDiscardIndices: v = [], handComplete: y = !1, actionFeedback: b, trickPresentation: x, handPresentation: S, microinteractions: C, instantTrickPlays: w = !1, turnCountdown: T = null, bigPotEvent: E = null, onDismissTableEvent: D, onToggleInHand: O, onPassEnrollment: k, onTrickDelta: A, onSubmitDraw: j, onPassDraw: M, onFoldDraw: N, onPlayCard: ee, onHeroUserActivity: te }) {
	let P = jm() === "mobile-landscape" ? "landscape" : "portrait", F = t.map((e) => ({
		...e,
		isSelf: e.isSelf || m != null && e.playerId === m
	})), I = Zd(F, e, m), ne = I.filter((e) => !e.isSelf), L = I.find((e) => e.isSelf), R = L ? wf(I.length, P) : null, z = I.length, B = `btable--p${Math.min(8, Math.max(2, z))}`, V = km(ne.length, P), H = Object.fromEntries(t.map((e) => [e.playerId, e.displayName])), re = Af(), ie = e.sessionId, U = Fm({
		aspect: V,
		sessionKey: ie
	});
	(0, l.useEffect)(() => {
		if (typeof window > "u" || localStorage.getItem("tableSeatDebug") !== "1") return;
		let e = U.current;
		if (!e) return;
		let n = [...e.querySelectorAll(".bseat__avatar-wrap")].filter((e) => {
			let t = e.getBoundingClientRect();
			if (t.width <= 0 || t.height <= 0) return !1;
			let n = t.left + t.width / 2, r = t.top + t.height / 2;
			return !!document.elementFromPoint(n, r)?.closest(".bseat__avatar-wrap");
		}).length;
		console.debug("[table-seats-mobile]", {
			playersProp: t.length,
			rotated: I.length,
			domSeats: e.querySelectorAll(".bseat").length,
			paintedAvatars: n,
			inOverlay: !!e.closest(".table-play-overlay"),
			mobileShell: !!e.closest(".btable-mobile")
		});
	}, [
		t.length,
		I.length,
		U
	]);
	let { cards: ae, pileIndexRef: oe, commitDiscardCards: se } = Pa({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: U
	});
	Jf({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: U,
		pileIndexRef: oe,
		onDiscardCommitted: se
	}), Yf({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: U
	}), Zf({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: S,
		tableRootRef: U
	});
	let ce = cp({
		session: e,
		heroCards: a,
		privateHandReady: p,
		tableRootRef: U
	}), le = e.trumpHolderId ?? e.dealerId ?? null, ue = m != null && le != null && m === le;
	fp({
		tableRootRef: U,
		trumpMergeActive: S.trumpMergeActive,
		isTrumpHolder: ue,
		onComplete: S.completeTrumpMerge
	});
	let de = em({
		trickPresentation: x,
		currentUserId: m,
		participantCount: r,
		trickNumber: e.currentTrick?.trickNumber ?? x.frozenTrick?.trickNumber ?? 1,
		sessionPhase: e.phase
	});
	Pp({
		trickPresentation: x,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: y,
		tableRootRef: U,
		onTrickCollectionStart: de.onTrickCollectionStart
	});
	let fe = new Set(e.participantIds.filter((t) => sd(t, x.displayTricksByPlayer, e.participantIds, e.phase))), pe = F.map((t) => {
		let r = x.displayTricksByPlayer[t.playerId] ?? 0, i = x.trickWinnerSeatId === t.playerId, a = x.suppressTurnPlayerId || S.suppressTurnIndicator, o = x.phase === "collectTrick" && i, s = S.enrollmentPulse[t.playerId], c = S.animatingDrawPlayerId === t.playerId, l = Dm(t.playerId, f, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: pd(t.bankroll, n.anteAmount, {
				inHand: t.inHand,
				anteAnimActive: S.anteAnimActive,
				anteAlreadyPosted: e.postedAntes != null && Object.prototype.hasOwnProperty.call(e.postedAntes, t.playerId)
			}),
			tricksThisHand: r,
			isOnTurn: a ? !1 : t.isOnTurn,
			isActiveActor: a ? !1 : t.isActiveActor,
			isLeading: i && (x.phase === "winnerReveal" || x.phase === "collectTrick") ? !0 : a ? !1 : t.isLeading,
			isTrickCapture: o,
			enrollmentPulse: s,
			drawAnimSubPhase: c && t.isSelf ? S.drawAnimSubPhase : null,
			drawDiscardCount: c ? S.drawDiscardCount : 0,
			drawReplaceCount: c ? S.drawReplaceCount : 0,
			turnHandoff: !1,
			turnCountdown: T?.playerId === t.playerId ? {
				progress: T.progress,
				remainingMs: T.remainingMs,
				segment: T.segment
			} : null,
			dealerMoved: C.dealerMovedPlayerId === t.playerId,
			winnerFlash: C.winnerFlashPlayerId === t.playerId,
			bankrollTick: C.bankrollTicks[t.playerId] ?? null,
			bourreAlert: t.isSelf ? C.bourreAlerts[t.playerId] ?? null : null,
			bourrePressure: fe.has(t.playerId)
		};
	}), W = F.find((e) => e.isSelf), me = x.suppressTurnPlayerId || S.suppressTurnIndicator, he = !!(m && e.drawCompletedIds?.includes(m));
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: U,
		className: [
			"btable-mobile-wrap btable-mobile-wrap--stage-fit",
			B,
			pe.some((e) => e.isActiveActor) ? "btable-wrap--has-active-turn" : "",
			ce ? "btable-wrap--clockwise-dealing" : ""
		].filter(Boolean).join(" "),
		"data-testid": "table-root",
		"data-layout": P,
		style: {
			"--player-count": z,
			"--table-aspect": V,
			"--trick-card-travel-ms": "395ms",
			"--trick-card-settle-ms": "165ms",
			"--trick-card-shift-ms": "220ms",
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": `${Td}ms`,
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": `${Cd}ms`,
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": `${Cd + 400 + Td + 230}ms`,
			"--deal-card-stagger-ms": `${re.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${re.drawDiscardMs}ms`,
			"--draw-replace-ms": `${re.drawReplaceMs}ms`
		},
		children: [/* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-mobile__table-area",
			children: /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-mobile__stage-scaler",
				children: /* @__PURE__ */ (0, g.jsx)("div", {
					className: "btable-mobile-stage-fit",
					children: /* @__PURE__ */ (0, g.jsxs)("div", {
						className: "btable-mobile-stage table-stage",
						children: [
							/* @__PURE__ */ (0, g.jsxs)("div", {
								className: "table-oval btable-mobile-oval",
								children: [/* @__PURE__ */ (0, g.jsx)("div", { className: "btable__rail" }), /* @__PURE__ */ (0, g.jsx)("div", {
									className: "btable__felt",
									"data-testid": "table-felt"
								})]
							}),
							/* @__PURE__ */ (0, g.jsx)("div", {
								className: "btable__play-zone",
								children: /* @__PURE__ */ (0, g.jsx)(Ud, {
									potMetrics: {
										...n,
										currentPot: S.displayPotAmount
									},
									participantCount: r,
									trumpUpcard: e.trumpUpcard,
									trumpSuit: e.trumpSuit,
									phase: e.phase,
									enrollmentActive: i,
									remainingDeckCount: e.remainingDeckCount,
									trickDisplayPlays: x.displayPlays,
									trickLeadSuit: e.currentTrick?.leadSuit ?? e.leadSuit ?? null,
									trickWinnerPlayerId: x.winnerPlayerId,
									trickShowWinnerTag: x.showWinnerTag,
									trickPresentationPhase: x.phase,
									trickEchoPlays: x.trickEchoPlays,
									trickEchoWinnerId: x.trickEchoWinnerId,
									trickEchoPhase: x.trickEchoPhase,
									showFinalTrickEcho: x.showFinalTrickEcho,
									playerNames: H,
									anteAnimActive: S.anteAnimActive,
									trumpRevealActive: S.trumpRevealActive,
									trumpMergeActive: S.trumpMergeActive,
									hideCenterTrump: u,
									showTrumpSuitReminder: d,
									drawAnimPlayerId: S.animatingDrawPlayerId,
									drawAnimSubPhase: S.drawAnimSubPhase,
									drawDiscardCount: S.drawDiscardCount,
									settleAnimActive: S.settleAnimActive,
									settleCarryOver: S.settleCarryOver,
									potTick: C.potTick,
									trumpReminderPulse: C.trumpReminderPulse,
									instantTrickPlays: w,
									peakTrickPlayCount: x.peakPlayCount,
									discardPileCards: ae,
									currentUserId: m,
									onCardLanded: de.onCardLanded
								})
							}),
							/* @__PURE__ */ (0, g.jsxs)("div", {
								className: "btable__seats btable-mobile__seats",
								"aria-label": "Players at the table",
								children: [ne.map((e, t) => {
									let n = Cf(t, I.length, P), r = pe.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, g.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										"data-seat-index": t + 1,
										children: /* @__PURE__ */ (0, g.jsx)(Yd, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											clockwiseDealing: ce,
											style: {
												left: `${n.x}%`,
												top: `${n.y}%`
											},
											onToggleInHand: () => O(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
											onPassEnrollment: e.canPassEnrollment && k ? () => k(e.playerId) : void 0,
											onTrickDelta: (t) => A(e.playerId, t),
											onReaction: void 0
										})
									}, e.playerId);
								}), L && R && /* @__PURE__ */ (0, g.jsx)("div", {
									className: "btable__seat-slot btable__seat-slot--self",
									"data-seat-index": 0,
									children: /* @__PURE__ */ (0, g.jsx)(Yd, {
										player: pe.find((e) => e.playerId === L.playerId) ?? L,
										region: R.region,
										handLane: R.handLane,
										clockwiseDealing: ce,
										style: {
											left: `${R.x}%`,
											top: `${R.y}%`
										},
										onToggleInHand: () => O(L.playerId, L.canToggleInHand ? !0 : !L.inHand),
										onPassEnrollment: L.canPassEnrollment && k ? () => k(L.playerId) : void 0,
										onTrickDelta: (e) => A(L.playerId, e),
										onReaction: void 0
									})
								}, L.playerId)]
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-mobile-hero-dock hand-panel",
			children: /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btable-mobile-hero-dock__stack",
				children: [E && Ku(a) && D && /* @__PURE__ */ (0, g.jsx)(Gu, {
					event: E,
					onDismiss: D
				}), /* @__PURE__ */ (0, g.jsx)(Wu, {
					cards: a,
					privateHandReady: p,
					phase: e.phase,
					enrollmentActive: i,
					isInHand: !!W?.inHand,
					isDealer: !!W?.isDealer,
					signedIn: !!m,
					isMyTurn: Cm({
						currentUserId: m,
						session: e,
						suppressTurn: !!me,
						handComplete: y,
						enrollmentActive: i,
						selfPlayer: W
					}),
					dealStaggerMs: re.dealCardStaggerMs,
					drawAnimSubPhase: S.animatingDrawPlayerId === m ? S.drawAnimSubPhase : null,
					drawDiscardCount: S.animatingDrawPlayerId === m ? S.drawDiscardCount : 0,
					drawReplaceCount: S.animatingDrawPlayerId === m ? S.drawReplaceCount : 0,
					drawCompleted: he,
					maxDrawDiscards: e.maxDrawDiscards ?? 4,
					legalPlayIndices: h ?? void 0,
					recommendedPlayIndex: _ ?? void 0,
					recommendedDiscardIndices: v,
					handComplete: y,
					actionFeedback: b,
					onSubmitDraw: j,
					onPassDraw: M,
					onFoldDraw: N,
					onPlayCard: ee,
					currentUserId: m,
					revealedTrumpIndex: o,
					trumpMergeActive: s,
					trumpDisabledIndex: c,
					handNumber: e.handNumber,
					trickNumber: e.currentTrick?.trickNumber ?? null,
					turnPlayerId: e.turnPlayerId,
					tableRootRef: U,
					pileIndexRef: oe,
					onDiscardCommitted: se,
					onUserActivity: te,
					skipHeroDealMotion: ce
				})]
			})
		})]
	});
}
//#endregion
//#region src/table/CinematicSplash.tsx
var Lm = new Set(["pot-cap", "hand-win"]);
function Rm({ events: e, onDismiss: t }) {
	let n = [...e].reverse().find((e) => Lm.has(e.kind));
	return (0, l.useEffect)(() => {
		if (!n) return;
		let e = window.setTimeout(() => t(n.id), n.durationMs ?? 2200);
		return () => window.clearTimeout(e);
	}, [n, t]), n ? /* @__PURE__ */ (0, g.jsxs)("div", {
		className: `bsplash bsplash--${n.kind}`,
		role: "status",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, g.jsx)("div", {
			className: "bsplash__glow",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "bsplash__content",
			children: [
				n.emoji && /* @__PURE__ */ (0, g.jsx)("span", {
					className: "bsplash__emoji",
					children: n.emoji
				}),
				/* @__PURE__ */ (0, g.jsx)("p", {
					className: "bsplash__title",
					children: n.title
				}),
				n.subtitle && /* @__PURE__ */ (0, g.jsx)("p", {
					className: "bsplash__subtitle",
					children: n.subtitle
				})
			]
		})]
	}) : null;
}
//#endregion
//#region src/table/DesktopLayoutShell.tsx
function zm({ children: e }) {
	let { settings: t } = nu(), n = t.layoutMode === "tiled", r = Hf();
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: [
			"btable-desktop",
			n ? "btable-desktop--tiled" : "btable-desktop--single",
			r ? "btable-desktop--native-mobile" : ""
		].join(" "),
		children: /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "btable-desktop__viewport",
			children: [/* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-desktop__scale",
				children: e
			}), n && /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btable-desktop__tile-placeholder muted small",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, g.jsx)("span", { children: "Multi-room tile slot" }), /* @__PURE__ */ (0, g.jsx)("span", { children: "Monitor additional tables here in a future release" })]
			})]
		})
	});
}
//#endregion
//#region src/table/MobileLayoutShell.tsx
function Bm({ children: e }) {
	let t = jm();
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: ["btable-mobile", `btable-mobile--${t === "mobile-landscape" ? "landscape" : "portrait"}`].join(" "),
		"data-layout-mode": t,
		children: /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-mobile__viewport",
			children: /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-mobile__frame",
				children: /* @__PURE__ */ (0, g.jsx)("div", {
					className: "btable-mobile__layout",
					children: e
				})
			})
		})
	});
}
//#endregion
//#region src/table/EventReactions.tsx
function Vm({ events: e, onDismiss: t }) {
	let n = e.filter((e) => e.emoji && e.kind === "reaction");
	return (0, l.useEffect)(() => {
		let e = n.map((e) => window.setTimeout(() => t(e.id), e.durationMs ?? 1600));
		return () => e.forEach((e) => window.clearTimeout(e));
	}, [n, t]), n.length ? /* @__PURE__ */ (0, g.jsx)("div", {
		className: "breactions",
		"aria-hidden": "true",
		children: n.map((e, t) => /* @__PURE__ */ (0, g.jsx)("div", {
			className: "breactions__burst",
			style: { "--burst-i": t },
			children: /* @__PURE__ */ (0, g.jsx)("span", {
				className: "breactions__emoji",
				children: e.emoji
			})
		}, e.id))
	}) : null;
}
//#endregion
//#region src/table/FeedbackSettings.tsx
function Hm({ compact: e = !1 }) {
	let [t, n] = (0, l.useState)(() => ms()), [r, i] = (0, l.useState)(!1);
	(0, l.useEffect)(() => vs(n), []);
	let a = Hc(), o = Jc();
	function s(e) {
		hs({ soundMode: e });
	}
	function c(e) {
		hs({ soundPackId: e }), Uc(), tc(e);
	}
	function u(e) {
		hs({ hapticsMode: e });
	}
	let d = /* @__PURE__ */ (0, g.jsxs)("div", {
		className: `bfeedback-settings${e ? " bfeedback-settings--compact" : ""}`,
		children: [
			/* @__PURE__ */ (0, g.jsxs)("fieldset", {
				className: "bfeedback-settings__fieldset",
				children: [
					/* @__PURE__ */ (0, g.jsx)("legend", {
						className: "bfeedback-settings__label",
						children: "Sound level"
					}),
					/* @__PURE__ */ (0, g.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, g.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "on",
							disabled: !a,
							onChange: () => s("on")
						}), "On"]
					}),
					/* @__PURE__ */ (0, g.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, g.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "minimal",
							disabled: !a,
							onChange: () => s("minimal")
						}), "Minimal"]
					}),
					/* @__PURE__ */ (0, g.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, g.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "off",
							onChange: () => s("off")
						}), "Off"]
					})
				]
			}),
			!a && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "bfeedback-settings__note muted small",
				children: "Audio not supported in this browser."
			}),
			/* @__PURE__ */ (0, g.jsxs)("label", {
				className: "bfeedback-settings__row",
				children: [/* @__PURE__ */ (0, g.jsx)("span", {
					className: "bfeedback-settings__label",
					children: "Sound theme"
				}), /* @__PURE__ */ (0, g.jsx)("select", {
					value: t.soundPackId,
					disabled: !a || t.soundMode === "off",
					onChange: (e) => c(e.target.value),
					children: Object.keys(Qo).map((e) => /* @__PURE__ */ (0, g.jsx)("option", {
						value: e,
						children: Qo[e]
					}, e))
				})]
			}),
			/* @__PURE__ */ (0, g.jsxs)("fieldset", {
				className: "bfeedback-settings__fieldset",
				children: [
					/* @__PURE__ */ (0, g.jsx)("legend", {
						className: "bfeedback-settings__label",
						children: "Haptics"
					}),
					/* @__PURE__ */ (0, g.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, g.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "on",
							disabled: !o,
							onChange: () => u("on")
						}), "On"]
					}),
					/* @__PURE__ */ (0, g.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, g.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "minimal",
							disabled: !o,
							onChange: () => u("minimal")
						}), "Minimal"]
					}),
					/* @__PURE__ */ (0, g.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, g.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "off",
							onChange: () => u("off")
						}), "Off"]
					})
				]
			}),
			!o && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "bfeedback-settings__note muted small",
				children: "Vibration unavailable on this device."
			})
		]
	});
	return e ? /* @__PURE__ */ (0, g.jsxs)("div", {
		className: "bfeedback-settings-wrap",
		children: [/* @__PURE__ */ (0, g.jsx)("button", {
			type: "button",
			className: "bfeedback-settings__toggle btn btn--sm",
			"aria-expanded": r,
			"aria-controls": "table-feedback-settings",
			onClick: () => i((e) => !e),
			children: r ? "Hide feedback" : "Sound & haptics"
		}), r && /* @__PURE__ */ (0, g.jsx)("div", {
			id: "table-feedback-settings",
			className: "bfeedback-settings__popover",
			children: d
		})]
	}) : d;
}
//#endregion
//#region src/table/feedback/SoundDebugButton.tsx
function Um() {
	return /* @__PURE__ */ (0, g.jsx)("button", {
		type: "button",
		className: "btn btn--sm btn--ghost btable-sound-debug",
		"data-testid": "sound-debug-button",
		title: `Play ${os("classic", "card-select")}`,
		onClick: () => Rl(),
		children: "Test card-select.wav"
	});
}
//#endregion
//#region src/table/feedback/SoundAuditPanel.tsx
var Wm = 20;
function Gm(e) {
	let t = e.filename ?? e.resolvedFile ?? "—", n = e.usedFallback ? " [FALLBACK]" : "", r = e.fallbackReason ? ` (${e.fallbackReason})` : "";
	return `${e.event} → ${t} [${e.result}]${n}${r}`;
}
function Km() {
	let [e, t] = (0, l.useState)([]);
	return (0, l.useEffect)(() => {
		if (!Cs()) return;
		let e = () => t(As().slice(-20));
		e();
		let n = window.setInterval(e, 500);
		return () => window.clearInterval(n);
	}, []), Cs() ? /* @__PURE__ */ (0, g.jsxs)("div", {
		className: "btable-sound-audit muted small",
		"data-testid": "sound-audit-panel",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, g.jsxs)("div", {
			className: "btable-sound-audit__title",
			children: [
				"Audio audit (last ",
				Wm,
				")"
			]
		}), /* @__PURE__ */ (0, g.jsx)("ol", {
			className: "btable-sound-audit__list",
			reversed: !0,
			children: [...e].reverse().map((e, t) => /* @__PURE__ */ (0, g.jsx)("li", {
				className: e.result === "asset-played" && !e.usedFallback ? "btable-sound-audit__ok" : e.usedFallback || e.result.includes("procedural") ? "btable-sound-audit__fallback" : void 0,
				children: Gm(e)
			}, `${e.timestamp}-${e.event}-${t}`))
		})]
	}) : null;
}
//#endregion
//#region src/table/TableSettingsPanel.tsx
function qm({ open: e, onClose: t }) {
	let { settings: n, updateSettings: r, resetSettings: i } = nu();
	return e ? /* @__PURE__ */ (0, g.jsxs)("div", {
		className: "bsettings",
		role: "dialog",
		"aria-label": "Table appearance",
		"data-testid": "settings-panel",
		children: [/* @__PURE__ */ (0, g.jsxs)("div", {
			className: "bsettings__panel",
			children: [
				/* @__PURE__ */ (0, g.jsxs)("header", {
					className: "bsettings__head",
					children: [/* @__PURE__ */ (0, g.jsx)("h6", {
						className: "bsettings__title",
						children: "Table room"
					}), /* @__PURE__ */ (0, g.jsx)("button", {
						type: "button",
						className: "bsettings__close",
						onClick: t,
						"aria-label": "Close",
						children: "×"
					})]
				}),
				/* @__PURE__ */ (0, g.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, g.jsx)("span", { children: "Theme" }), /* @__PURE__ */ (0, g.jsx)("select", {
						value: n.themeId,
						onChange: (e) => r({ themeId: e.target.value }),
						children: Object.keys(Jl).map((e) => /* @__PURE__ */ (0, g.jsx)("option", {
							value: e,
							children: Jl[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, g.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, g.jsx)("span", { children: "Card style" }), /* @__PURE__ */ (0, g.jsx)("select", {
						value: n.cardPackId,
						onChange: (e) => r({ cardPackId: e.target.value }),
						children: Object.keys(Kl).map((e) => /* @__PURE__ */ (0, g.jsx)("option", {
							value: e,
							children: Kl[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, g.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, g.jsx)("span", { children: "Deck" }), /* @__PURE__ */ (0, g.jsxs)("select", {
						value: n.deckMode,
						onChange: (e) => r({ deckMode: e.target.value }),
						children: [/* @__PURE__ */ (0, g.jsx)("option", {
							value: "classic",
							children: "Classic two-color"
						}), /* @__PURE__ */ (0, g.jsx)("option", {
							value: "four-color",
							children: "Four-color contrast"
						})]
					})]
				}),
				/* @__PURE__ */ (0, g.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, g.jsx)("span", { children: "Card size" }), /* @__PURE__ */ (0, g.jsxs)("select", {
						value: n.cardScale,
						onChange: (e) => r({ cardScale: e.target.value }),
						children: [
							/* @__PURE__ */ (0, g.jsx)("option", {
								value: "sm",
								children: "Compact"
							}),
							/* @__PURE__ */ (0, g.jsx)("option", {
								value: "md",
								children: "Standard"
							}),
							/* @__PURE__ */ (0, g.jsx)("option", {
								value: "lg",
								children: "Large"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, g.jsxs)("label", {
					className: "bsettings__field bsettings__field--row",
					children: [
						/* @__PURE__ */ (0, g.jsx)("span", { children: "Table scale" }),
						/* @__PURE__ */ (0, g.jsx)("input", {
							type: "range",
							min: .85,
							max: 1.35,
							step: .05,
							value: n.tableScale,
							onChange: (e) => r({ tableScale: Number(e.target.value) })
						}),
						/* @__PURE__ */ (0, g.jsxs)("span", {
							className: "bsettings__range-val",
							children: [Math.round(n.tableScale * 100), "%"]
						})
					]
				}),
				/* @__PURE__ */ (0, g.jsxs)("label", {
					className: "bsettings__check",
					children: [/* @__PURE__ */ (0, g.jsx)("input", {
						type: "checkbox",
						checked: n.highContrast,
						onChange: (e) => r({ highContrast: e.target.checked })
					}), "High contrast"]
				}),
				/* @__PURE__ */ (0, g.jsxs)("fieldset", {
					className: "bsettings__fieldset",
					children: [
						/* @__PURE__ */ (0, g.jsx)("legend", { children: "Layout (scaffold)" }),
						/* @__PURE__ */ (0, g.jsxs)("label", {
							className: "bsettings__check",
							children: [/* @__PURE__ */ (0, g.jsx)("input", {
								type: "radio",
								name: "layout",
								checked: n.layoutMode === "single",
								onChange: () => r({ layoutMode: "single" })
							}), "Single table"]
						}),
						/* @__PURE__ */ (0, g.jsxs)("label", {
							className: "bsettings__check bsettings__check--muted",
							children: [/* @__PURE__ */ (0, g.jsx)("input", {
								type: "radio",
								name: "layout",
								checked: n.layoutMode === "tiled",
								onChange: () => r({ layoutMode: "tiled" })
							}), "Tiled multi-room (preview)"]
						})
					]
				}),
				/* @__PURE__ */ (0, g.jsxs)("details", {
					className: "bsettings__hotkeys",
					children: [/* @__PURE__ */ (0, g.jsx)("summary", { children: "Hotkeys (scaffold)" }), /* @__PURE__ */ (0, g.jsxs)("ul", {
						className: "bsettings__hotkey-list muted small",
						children: [
							/* @__PURE__ */ (0, g.jsxs)("li", { children: [/* @__PURE__ */ (0, g.jsx)("kbd", { children: n.hotkeys.focusTable }), " Focus table"] }),
							/* @__PURE__ */ (0, g.jsxs)("li", { children: [/* @__PURE__ */ (0, g.jsx)("kbd", { children: n.hotkeys.toggleSettings }), " Settings"] }),
							/* @__PURE__ */ (0, g.jsxs)("li", { children: [/* @__PURE__ */ (0, g.jsx)("kbd", { children: n.hotkeys.standPat }), " Stand pat (reserved)"] }),
							/* @__PURE__ */ (0, g.jsxs)("li", { children: [/* @__PURE__ */ (0, g.jsx)("kbd", { children: n.hotkeys.nextTable }), " Next table (reserved)"] })
						]
					})]
				}),
				/* @__PURE__ */ (0, g.jsx)("footer", {
					className: "bsettings__foot",
					children: /* @__PURE__ */ (0, g.jsx)("button", {
						type: "button",
						className: "btn btn--sm",
						onClick: i,
						children: "Reset defaults"
					})
				})
			]
		}), /* @__PURE__ */ (0, g.jsx)("button", {
			type: "button",
			className: "bsettings__backdrop",
			onClick: t,
			"aria-label": "Close"
		})]
	}) : null;
}
//#endregion
//#region src/table/hooks/useTableEvents.ts
var Jm = 0;
function Ym() {
	return Jm += 1, `evt-${Jm}-${Date.now()}`;
}
function Xm(e, t, n) {
	let r = t.currentPot, i = [];
	return r >= t.potCap && t.limEnabled && r > e.pot ? i.push({
		id: Ym(),
		kind: "pot-cap",
		title: "Pot cap reached",
		subtitle: "LmT engaged",
		emoji: "🔒",
		durationMs: 2200
	}) : r >= t.anteAmount * Math.max(n.length, 2) * 2 && r > e.pot && i.push({
		id: Ym(),
		kind: "big-pot",
		title: "Big pot brewing",
		emoji: "💰",
		durationMs: 2e3
	}), i;
}
function Zm({ session: e, potMetrics: t, participantIds: n }) {
	let [r, i] = (0, l.useState)([]), a = (0, l.useRef)(null), o = JSON.stringify({
		handNumber: e.handNumber,
		pot: t.currentPot,
		cap: t.potCap,
		lim: t.limEnabled,
		participants: n
	});
	return (0, l.useEffect)(() => {
		a.current = null;
	}, [e.handNumber]), (0, l.useEffect)(() => {
		let e = t.currentPot, r = a.current;
		if (a.current = { pot: e }, !r) return;
		let o = Xm(r, t, n);
		if (!o.length) return;
		let s = requestAnimationFrame(() => {
			i((e) => [...e, ...o]);
		});
		return () => cancelAnimationFrame(s);
	}, [
		o,
		t,
		n
	]), {
		events: r,
		dismissEvent: (e) => {
			i((t) => t.filter((t) => t.id !== e));
		},
		pushReaction: (e, t) => {
			i((n) => [...n, {
				id: Ym(),
				kind: "reaction",
				title: "",
				emoji: e,
				playerId: t,
				durationMs: 1400
			}]);
		}
	};
}
//#endregion
//#region src/table/handPresentationMachine.ts
function Qm(e) {
	return !e?.rank || !e?.suit ? "" : `${e.rank}-${e.suit}`;
}
function $m(e) {
	return e === "handReset" || e === "ante" || e === "trumpReveal" || e === "trumpMerge" || e === "drawPlayer" || e === "drawReady" || e === "settle" || e === "nextHandReset";
}
function eh(e) {
	return {
		sessionKey: e.sessionId,
		handNumber: e.handNumber,
		phase: e.phase ?? null,
		enrollmentActive: e.enrollmentActive === !0,
		participantIds: [...e.participantIds],
		actionOrder: [...e.actionOrder ?? e.participantIds],
		drawCompletedIds: [...e.drawCompletedIds ?? []],
		turnPlayerId: e.turnPlayerId ?? null,
		trumpUpcard: e.trumpUpcard ?? null,
		dealerId: e.dealerId ?? null,
		handComplete: e.handComplete === !0,
		potAmount: e.potAmount,
		carryOverPot: e.carryOverPot ?? 0,
		enrolledIds: [...e.enrolledIds ?? []],
		declinedIds: [...e.declinedIds ?? []]
	};
}
function th(e) {
	return e.phase === "play" ? "play" : e.phase === "draw" ? "drawPlayer" : e.phase === "decision" ? "decision" : e.phase === "reveal" ? "ante" : e.enrollmentActive ? "enrollment" : "idle";
}
function nh(e) {
	return {
		phase: th(e),
		sessionKey: e.sessionKey,
		handNumber: e.handNumber,
		displayDrawCompletedIds: [],
		animatingDrawPlayerId: null,
		drawAnimSubPhase: "done",
		drawDiscardCount: 0,
		drawReplaceCount: 0,
		trumpRevealActive: !1,
		trumpMergeActive: !1,
		trumpMergedIntoHand: !1,
		anteAnimActive: !1,
		dealStaggerCount: 0,
		enrollmentPulse: {},
		settleAnimActive: !1,
		settleCarryOver: !1,
		nextHandResetActive: !1,
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		displayPotAmount: e.potAmount,
		prevSnapshot: e,
		pendingSnapshot: null,
		phaseStartedAt: Date.now(),
		drawPresentationConsumedIds: []
	};
}
function rh(e, t, n = {}) {
	return {
		...e,
		...n,
		phase: t,
		phaseStartedAt: Date.now()
	};
}
function ih(e, t) {
	let n = {};
	for (let r of t.enrolledIds) e.enrolledIds.includes(r) || (n[r] = "join");
	for (let r of t.declinedIds) e.declinedIds.includes(r) || (n[r] = "pass");
	return n;
}
function ah(e, t, n) {
	for (let r of n.drawCompletedIds) if (!oh(e, r) && !e.displayDrawCompletedIds.includes(r) && !t.drawCompletedIds.includes(r)) return r;
	return null;
}
function oh(e, t) {
	return e.drawPresentationConsumedIds.includes(t);
}
function sh(e) {
	return e.phase === "drawPlayer" && e.animatingDrawPlayerId != null && e.drawAnimSubPhase !== "done";
}
function ch(e, t) {
	if (t.phase !== "draw" || !sh(e)) return null;
	let n = e.animatingDrawPlayerId, r = t.turnPlayerId;
	return !n || !r || t.drawCompletedIds.includes(r) || n === r && !t.drawCompletedIds.includes(n) ? null : (gu() && _u("handPresentation", "fast-forward-stale-draw", {
		animating: n,
		turnId: r,
		drawCompleted: t.drawCompletedIds
	}), {
		...mh(e, t),
		pendingSnapshot: t,
		prevSnapshot: t
	});
}
function lh(e, t) {
	return !t || oh(e, t) ? e.drawPresentationConsumedIds : [...e.drawPresentationConsumedIds, t];
}
function uh(e, t) {
	return [...new Set([...e.drawPresentationConsumedIds, ...t])];
}
function dh(e, t, n) {
	for (let r of t.actionOrder) if (t.participantIds.includes(r) && t.drawCompletedIds.includes(r) && !n.includes(r) && !oh(e, r)) return r;
	return null;
}
function fh(e, t, n, r) {
	gu() && _u("handPresentation", "draw-candidate-resolve", {
		handNumber: e.handNumber,
		candidates: [...t.drawCompletedIds],
		consumed: [...e.drawPresentationConsumedIds],
		displayCompleted: [...e.displayDrawCompletedIds],
		inFlight: e.animatingDrawPlayerId,
		inFlightSubPhase: e.drawAnimSubPhase,
		chosen: n,
		reason: r
	});
}
function ph(e, t, n) {
	gu() && _u("handPresentation", `draw-receive-commit-${e}`, {
		handNumber: t.handNumber,
		inFlight: t.animatingDrawPlayerId,
		inFlightSubPhase: t.drawAnimSubPhase,
		displayCompleted: [...t.displayDrawCompletedIds],
		...n ? {
			commitPlayerId: n.playerId,
			commitNextCompleted: [...n.nextCompleted],
			nextChosen: n.nextChosen
		} : {}
	});
}
function mh(e, t) {
	let n = e.animatingDrawPlayerId;
	if (!n) return e.drawAnimSubPhase === "done" ? e : {
		...e,
		drawAnimSubPhase: "done"
	};
	let r = e.displayDrawCompletedIds.includes(n) ? e.displayDrawCompletedIds : [...e.displayDrawCompletedIds, n], i = lh(e, n), a = t == null ? e.prevSnapshot : {
		...t,
		drawCompletedIds: [...r]
	};
	return ph("payload", e, {
		playerId: n,
		nextCompleted: r,
		nextChosen: null
	}), {
		...e,
		displayDrawCompletedIds: r,
		animatingDrawPlayerId: null,
		drawAnimSubPhase: "done",
		prevSnapshot: a ?? e.prevSnapshot,
		drawPresentationConsumedIds: i
	};
}
function hh(e, t) {
	return e > 0 ? "discard" : t > 0 ? "receive" : "done";
}
function gh(e, t, n, r, i, a) {
	return oh(e, n) ? (fh(e, t, null, `consumed-skip:${n}:${a}`), e) : sh(e) && e.animatingDrawPlayerId !== n ? (fh(e, t, null, `in-flight-skip:${a}`), e) : (fh(e, t, n, a), rh(e, "drawPlayer", {
		animatingDrawPlayerId: n,
		drawAnimSubPhase: hh(r, i),
		drawDiscardCount: r,
		drawReplaceCount: i,
		prevSnapshot: t,
		drawPresentationConsumedIds: lh(e, n)
	}));
}
function _h(e) {
	if (!e.pendingHandSettle || e.phase !== "play") return e;
	let t = e.handSettleSnapshot ?? e.prevSnapshot;
	return t ? rh(e, "settle", {
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		settleAnimActive: !0,
		settleCarryOver: t.carryOverPot > 0,
		prevSnapshot: t,
		displayPotAmount: t.potAmount
	}) : e;
}
function vh(e, t) {
	return rh(e, "ante", {
		trumpRevealActive: !!t.trumpUpcard,
		trumpMergeActive: !1,
		trumpMergedIntoHand: !1,
		anteAnimActive: !0,
		dealStaggerCount: Math.max(e.dealStaggerCount, t.participantIds.length),
		prevSnapshot: t,
		displayPotAmount: t.potAmount,
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		pendingSnapshot: null
	});
}
function yh(e, t, n, r) {
	let i = ah(e, {
		...t,
		drawCompletedIds: []
	}, t);
	return i ? gh(e, t, i, n, r, "beginDrawSequence") : rh(e, "drawPlayer", {
		displayDrawCompletedIds: e.displayDrawCompletedIds,
		prevSnapshot: t
	});
}
function bh(e, t) {
	let n = xh(e, t);
	return gu() && (e.phase !== n.phase || e.handNumber !== n.handNumber || e.trumpRevealActive !== n.trumpRevealActive || t.type === "serverUpdate") && _u("handPresentation", t.type, {
		phase: `${e.phase} -> ${n.phase}`,
		handNumber: `${e.handNumber} -> ${n.handNumber}`,
		trumpRevealActive: `${e.trumpRevealActive} -> ${n.trumpRevealActive}`,
		drawSubPhase: `${e.drawAnimSubPhase} -> ${n.drawAnimSubPhase}`,
		drawAnim: `${e.animatingDrawPlayerId ?? ""} -> ${n.animatingDrawPlayerId ?? ""}`,
		drawConsumed: n.drawPresentationConsumedIds.length,
		serverPhase: t.type === "serverUpdate" ? t.snapshot.phase : void 0,
		drawCompleted: t.type === "serverUpdate" ? t.snapshot.drawCompletedIds.length : void 0
	}), n;
}
function xh(e, t) {
	switch (t.type) {
		case "reset": return nh(t.snapshot);
		case "dealCardRevealed": return {
			...e,
			dealStaggerCount: Math.max(e.dealStaggerCount, t.count)
		};
		case "clearEnrollmentPulse": return Object.keys(e.enrollmentPulse).length ? {
			...e,
			enrollmentPulse: {}
		} : e;
		case "completeTrumpMerge": return e.trumpMergeActive ? {
			...e,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			phase: e.phase === "trumpMerge" ? "drawPlayer" : e.phase
		} : e;
		case "watchdog": return e.pendingHandSettle && e.phase === "play" ? _h(e) : Date.now() - e.phaseStartedAt < 12e3 ? e : Sh({
			...e,
			pendingSnapshot: e.pendingSnapshot ?? e.prevSnapshot
		});
		case "tryBeginHandSettle": return _h(e);
		case "advancePhase": return Sh(e);
		case "serverUpdate": {
			let { snapshot: n, heroDrawDiscardCount: r = 0, heroDrawReplaceCount: i = 0 } = t, a = e.prevSnapshot ?? n;
			if (e.sessionKey !== n.sessionKey) {
				let e = nh(n);
				return n.phase === "reveal" ? vh(e, n) : e;
			}
			if (e.phase === "play" && n.participantIds.length === 0 && !n.phase && !n.enrollmentActive && (a.participantIds.length > 0 || a.phase === "play")) {
				let t = e.handSettleSnapshot ?? a;
				return {
					...e,
					handNumber: n.handNumber,
					pendingHandSettle: !0,
					handSettleSnapshot: t,
					pendingSnapshot: n,
					prevSnapshot: n,
					displayPotAmount: n.potAmount
				};
			}
			if (e.handNumber !== n.handNumber) {
				let e = nh(n);
				return n.phase === "reveal" ? vh(e, n) : e;
			}
			let o = Qm(a.trumpUpcard), s = Qm(n.trumpUpcard);
			if (o && !s && !e.trumpMergedIntoHand && !e.trumpMergeActive) return {
				...e,
				trumpRevealActive: !1,
				trumpMergeActive: !0,
				trumpMergedIntoHand: !1,
				prevSnapshot: n,
				pendingSnapshot: n
			};
			if (n.phase === "play" && e.phase !== "play") return rh(e, "play", {
				displayDrawCompletedIds: [...n.drawCompletedIds],
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				trumpRevealActive: !1,
				trumpMergeActive: !1,
				trumpMergedIntoHand: !0,
				anteAnimActive: !1,
				prevSnapshot: n,
				pendingSnapshot: null
			});
			if ($m(e.phase) && e.phase !== "drawPlayer" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done") return {
				...e,
				pendingSnapshot: n
			};
			if (n.handComplete && n.phase === "play" && e.phase === "play") return {
				...e,
				pendingHandSettle: !0,
				handSettleSnapshot: n,
				pendingSnapshot: n,
				prevSnapshot: n,
				displayPotAmount: n.potAmount
			};
			if (e.pendingHandSettle && e.phase === "play") return {
				...e,
				pendingSnapshot: n
			};
			let c = ih(a, n), l = Object.keys(c).length > 0;
			if (n.enrollmentActive || n.phase === "decision") return {
				...e,
				phase: n.phase === "decision" ? "decision" : "enrollment",
				enrollmentPulse: l ? {
					...e.enrollmentPulse,
					...c
				} : e.enrollmentPulse,
				prevSnapshot: n,
				displayPotAmount: n.potAmount
			};
			if (n.phase === "reveal" && a.phase !== "reveal" && (e.phase === "idle" || e.phase === "nextHandReset" || e.phase === "enrollment" || e.phase === "settle" || e.phase === "play")) return vh(e, n);
			if (n.phase === "draw" && a.enrollmentActive && !n.enrollmentActive && e.phase === "enrollment") {
				let t = !!n.trumpUpcard;
				return rh(e, t ? "trumpReveal" : "ante", {
					trumpRevealActive: t,
					anteAnimActive: !0,
					dealStaggerCount: Math.max(e.dealStaggerCount, n.participantIds.length),
					prevSnapshot: n,
					displayPotAmount: n.potAmount
				});
			}
			if (n.phase === "draw" && (e.phase === "decision" || a.phase === "decision") && e.drawPresentationConsumedIds.length === 0 && e.displayDrawCompletedIds.length === 0 && e.phase !== "drawPlayer" && e.phase !== "drawReady") return yh(e, n, 0, 0);
			if (n.phase === "draw") {
				let t = ch(e, n);
				t && (e = t);
				let o = ah(e, a, n);
				if (o && e.phase !== "drawReady") {
					let t = e.phase === "drawPlayer" && e.animatingDrawPlayerId === o && e.drawAnimSubPhase !== "done";
					if (!t && !sh(e)) {
						let t = r > 0 || i > 0, a = t ? r : o === n.turnPlayerId ? 0 : 1;
						return gh(e, n, o, a, t ? i : a, "serverUpdate");
					}
					t ? fh(e, n, null, "serverUpdate:animating-same-player") : sh(e) && fh(e, n, null, "serverUpdate:in-flight-other-player");
				} else o || fh(e, n, null, "serverUpdate:no-candidate");
				if (n.drawCompletedIds.length === n.participantIds.length && n.participantIds.length > 0 && e.phase === "drawPlayer" && e.drawAnimSubPhase === "done") return rh(e, "drawReady", { prevSnapshot: n });
			}
			return {
				...e,
				prevSnapshot: n,
				displayPotAmount: n.potAmount,
				handNumber: n.handNumber,
				enrollmentPulse: l ? {
					...e.enrollmentPulse,
					...c
				} : e.enrollmentPulse
			};
		}
		default: return e;
	}
}
function Sh(e) {
	let t = e.pendingSnapshot ?? e.prevSnapshot;
	switch (e.phase) {
		case "handReset": return rh(e, "ante", {
			anteAnimActive: !0,
			pendingSnapshot: null
		});
		case "ante": return e.trumpRevealActive || t?.trumpUpcard ? rh(e, "trumpReveal", {
			trumpRevealActive: !0,
			anteAnimActive: !1,
			pendingSnapshot: null
		}) : t?.phase === "draw" ? yh(e, t, 0, 0) : rh(e, "drawPlayer", {
			anteAnimActive: !1,
			pendingSnapshot: null
		});
		case "trumpReveal": return t?.phase === "draw" ? {
			...yh(e, t, 0, 0),
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !1,
			pendingSnapshot: null
		} : rh(e, "drawPlayer", {
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !1,
			pendingSnapshot: null
		});
		case "trumpMerge": return e;
		case "drawPlayer": {
			if (e.drawAnimSubPhase === "discard" && e.drawReplaceCount > 0) return {
				...e,
				drawAnimSubPhase: "receive"
			};
			ph("before", e);
			let n = e.animatingDrawPlayerId, r = mh(e, t);
			ph("after", r);
			let i = t ?? r.prevSnapshot;
			if (i && r.displayDrawCompletedIds.length >= i.participantIds.length) return rh(r, "drawReady", {
				displayDrawCompletedIds: r.displayDrawCompletedIds,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				pendingSnapshot: null,
				prevSnapshot: {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				},
				drawPresentationConsumedIds: uh(r, r.displayDrawCompletedIds)
			});
			if (i) {
				let e = {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				}, t = dh(r, i, r.displayDrawCompletedIds);
				if (ph("after", r, {
					playerId: n,
					nextCompleted: r.displayDrawCompletedIds,
					nextChosen: t
				}), t) return fh(r, i, t, "advancePhase:nextPlayer"), gh(r, e, t, 1, 1, "advancePhase:nextPlayer");
				fh(r, i, null, "advancePhase:no-next-player");
			}
			return r;
		}
		case "drawReady": return rh(e, "play", { pendingSnapshot: null });
		case "settle": return rh(e, "nextHandReset", {
			settleAnimActive: !1,
			nextHandResetActive: !0,
			pendingSnapshot: null
		});
		case "nextHandReset": return t ? nh(t) : rh(e, "idle", { nextHandResetActive: !1 });
		default: return e;
	}
}
function Ch(e) {
	return {
		phase: e.phase,
		displayDrawCompletedIds: e.displayDrawCompletedIds,
		animatingDrawPlayerId: e.animatingDrawPlayerId,
		drawAnimSubPhase: e.drawAnimSubPhase,
		drawDiscardCount: e.drawDiscardCount,
		drawReplaceCount: e.drawReplaceCount,
		trumpRevealActive: e.trumpRevealActive,
		trumpMergeActive: e.trumpMergeActive,
		trumpMergedIntoHand: e.trumpMergedIntoHand,
		anteAnimActive: e.anteAnimActive,
		dealStaggerCount: e.dealStaggerCount,
		enrollmentPulse: e.enrollmentPulse,
		settleAnimActive: e.settleAnimActive,
		settleCarryOver: e.settleCarryOver,
		nextHandResetActive: e.nextHandResetActive,
		pendingHandSettle: e.pendingHandSettle,
		suppressTurnIndicator: e.pendingHandSettle || e.phase === "trumpReveal" || e.phase === "trumpMerge" || e.phase === "ante" || e.phase === "drawReady" || e.phase === "settle" || e.phase === "nextHandReset" || e.phase === "handReset" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done",
		displayPotAmount: e.displayPotAmount,
		isPresenting: $m(e.phase)
	};
}
function wh(e, t = !1) {
	let n = Af(t);
	switch (e.phase) {
		case "handReset": return n.handResetMs;
		case "ante": return n.anteChipTravelMs * Math.max(1, Math.min(e.dealStaggerCount, 8));
		case "trumpReveal": return n.trumpRevealHoldMs;
		case "trumpMerge": return n.trumpMergeAnimMs;
		case "drawPlayer": return e.drawAnimSubPhase === "done" ? 0 : jf(e.drawAnimSubPhase === "receive" ? 0 : e.drawDiscardCount, e.drawAnimSubPhase === "receive" ? e.drawReplaceCount : 0, t);
		case "drawReady": return n.drawReadyBeatMs;
		case "settle": return n.settleHoldMs;
		case "nextHandReset": return n.nextHandResetMs;
		default: return 0;
	}
}
//#endregion
//#region src/table/hooks/useHandPresentation.ts
var Th = [], Eh = [];
function Dh(e, t) {
	let n = new Set(e), r = new Set(t);
	return {
		discardCount: [...n].filter((e) => !r.has(e)).length,
		replaceCount: [...r].filter((e) => !n.has(e)).length
	};
}
function Oh({ session: e, enrollmentActive: t, potAmount: n, handComplete: r, trickPipelineActive: i = !1, forceTrickHandEndDrain: a, heroCards: o = Eh, enrolledIds: s = Th, declinedIds: c = Th, actionOrder: u }) {
	let d = (0, l.useMemo)(() => eh({
		sessionId: e.sessionId,
		handNumber: e.handNumber,
		phase: e.phase,
		enrollmentActive: t,
		participantIds: e.participantIds,
		actionOrder: u ?? e.participantIds,
		drawCompletedIds: e.drawCompletedIds,
		turnPlayerId: e.turnPlayerId,
		trumpUpcard: e.trumpUpcard,
		dealerId: e.dealerId,
		handComplete: r,
		potAmount: n,
		carryOverPot: e.carryOverPot,
		enrolledIds: s,
		declinedIds: c
	}), [
		e,
		t,
		n,
		r,
		s,
		c,
		u
	]), [f, p] = (0, l.useReducer)(bh, d, nh), m = (0, l.useRef)([]), h = (0, l.useRef)([]), g = (0, l.useRef)(null), _ = (0, l.useRef)(f);
	_.current = f;
	let v = () => {
		for (let e of m.current) window.clearTimeout(e);
		m.current = [], g.current = null;
	}, y = (e, t) => {
		let n = window.setTimeout(e, t);
		m.current.push(n);
	};
	(0, l.useEffect)(() => () => v(), []), (0, l.useEffect)(() => {
		let e = o.map((e) => `${e.rank}-${e.suit}`), t = Dh(h.current, e);
		h.current = e, p({
			type: "serverUpdate",
			snapshot: d,
			heroDrawDiscardCount: t.discardCount,
			heroDrawReplaceCount: t.replaceCount
		}), gu() && _u("useHandPresentation", "serverUpdate-effect", {
			handNumber: d.handNumber,
			serverPhase: d.phase,
			drawCompleted: d.drawCompletedIds.length,
			participantCount: d.participantIds.length,
			trumpUpcard: !!d.trumpUpcard,
			turnPlayerId: d.turnPlayerId
		});
	}, [d, o]), (0, l.useEffect)(() => {
		if (!Object.values(f.enrollmentPulse).some(Boolean)) return;
		let e = window.setTimeout(() => p({ type: "clearEnrollmentPulse" }), 480);
		return () => window.clearTimeout(e);
	}, [JSON.stringify(f.enrollmentPulse)]), (0, l.useEffect)(() => {
		let e = Ld(), t = `${f.handNumber}:${f.phase}:${f.animatingDrawPlayerId ?? ""}:${f.drawAnimSubPhase}:${f.phaseStartedAt}`;
		if (g.current === t) {
			gu() && _u("useHandPresentation", "advancePhase-timer-skip-duplicate", { phaseKey: t });
			return;
		}
		v();
		let n = wh(f, e);
		if (n <= 0) return;
		let r = {
			handNumber: f.handNumber,
			phase: f.phase,
			animatingDrawPlayerId: f.animatingDrawPlayerId,
			drawAnimSubPhase: f.drawAnimSubPhase,
			phaseStartedAt: f.phaseStartedAt
		};
		g.current = t, gu() && _u("useHandPresentation", "advancePhase-timer-armed", {
			phaseKey: t,
			delay: n,
			fromPhase: f.phase,
			drawAnimSubPhase: f.drawAnimSubPhase
		}), y(() => {
			if (g.current !== t) return;
			g.current = null;
			let e = _.current;
			if (e.handNumber !== r.handNumber || e.phase !== r.phase || e.animatingDrawPlayerId !== r.animatingDrawPlayerId || e.drawAnimSubPhase !== r.drawAnimSubPhase || e.phaseStartedAt !== r.phaseStartedAt) {
				gu() && _u("useHandPresentation", "advancePhase-timer-stale", {
					armedAt: r,
					current: {
						handNumber: e.handNumber,
						phase: e.phase,
						animatingDrawPlayerId: e.animatingDrawPlayerId,
						drawAnimSubPhase: e.drawAnimSubPhase,
						phaseStartedAt: e.phaseStartedAt
					}
				});
				return;
			}
			gu() && _u("useHandPresentation", "advancePhase-timer", {
				fromPhase: r.phase,
				delay: n,
				animatingDrawPlayerId: r.animatingDrawPlayerId,
				drawAnimSubPhase: r.drawAnimSubPhase
			}), p({ type: "advancePhase" });
		}, n), y(() => p({ type: "watchdog" }), f.phase === "drawPlayer" || f.phase === "drawReady" ? Of : Df);
	}, [
		f.handNumber,
		f.phase,
		f.animatingDrawPlayerId,
		f.drawAnimSubPhase,
		f.phaseStartedAt
	]), (0, l.useEffect)(() => {
		if (e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play") {
			let e = o.length;
			e > 0 && p({
				type: "dealCardRevealed",
				count: e
			});
		}
	}, [o.length, e.phase]), (0, l.useEffect)(() => {
		i || p({ type: "tryBeginHandSettle" });
	}, [i]), (0, l.useEffect)(() => {
		if (f.phase !== "play" || !f.pendingHandSettle) return;
		if (!i) {
			p({ type: "tryBeginHandSettle" });
			return;
		}
		let e = window.setTimeout(() => {
			let e = _.current;
			e.phase !== "play" || !e.pendingHandSettle || (gu() && _u("useHandPresentation", "hand-end-convergence-force", { trickPipelineActive: !0 }), a?.(), p({ type: "tryBeginHandSettle" }));
		}, kf);
		return () => window.clearTimeout(e);
	}, [
		f.phase,
		f.pendingHandSettle,
		i,
		a
	]);
	let b = (0, l.useCallback)(() => {
		p({ type: "completeTrumpMerge" });
	}, []);
	return {
		...Ch(f),
		completeTrumpMerge: b
	};
}
//#endregion
//#region src/table/turnCountdown.ts
var kh = 15e3, Ah = new Set([
	$.ENROLLMENT,
	$.DRAW,
	$.PLAY
]);
function jh(e) {
	return e > 1e4 ? "green" : e > 5e3 ? "yellow" : "red";
}
function Mh(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off";
	return [
		e.session.phase ?? "",
		e.activeActorId ?? "",
		n,
		e.session.drawCompletedIds?.join(",") ?? "",
		e.suppressTurn ? "1" : "0",
		e.handComplete ? "1" : "0"
	].join("|");
}
function Nh(e) {
	let { session: t } = e;
	return {
		status: null,
		handCount: t.handNumber,
		pendingCoWinSettlement: t.pendingCoWinSettlement ?? null,
		handEnrollment: t.handEnrollment ?? null,
		currentHand: {
			phase: t.phase ?? void 0,
			turnPlayerId: t.turnPlayerId ?? void 0,
			drawCompletedIds: t.drawCompletedIds,
			participantIds: t.participantIds ?? [],
			tricksByPlayer: t.tricksByPlayer ?? {}
		}
	};
}
function Ph(e) {
	if (e.handComplete || e.suppressTurn) return null;
	let t = vm({
		session: Nh(e),
		suppressTurn: e.suppressTurn
	});
	return Ah.has(t.phase) ? t.turnPlayerId : null;
}
function Fh(e, t, n) {
	let r = kh - Math.max(0, n - t) % kh;
	return {
		playerId: e,
		remainingMs: r,
		progress: r / kh,
		segment: jh(r)
	};
}
//#endregion
//#region src/table/hooks/useTurnCountdown.ts
function Ih(e) {
	let t = Ph(e), n = Mh({
		...e,
		activeActorId: t
	}), r = (0, l.useRef)(null), i = (0, l.useRef)(""), [a, o] = (0, l.useState)(() => Date.now());
	return (0, l.useEffect)(() => {
		if (!t) {
			r.current = null, i.current = n;
			return;
		}
		(n !== i.current || r.current == null) && (r.current = Date.now(), i.current = n, o(Date.now()));
	}, [t, n]), (0, l.useEffect)(() => {
		if (!t || r.current == null) return;
		let e = () => o(Date.now()), n = Ld() ? 250 : 100, i = window.setInterval(e, n);
		return () => window.clearInterval(i);
	}, [t, n]), {
		countdown: t && r.current != null ? Fh(t, r.current, a) : null,
		reducedMotion: Ld()
	};
}
//#endregion
//#region src/table/hooks/useTableMicrointeractions.ts
function Lh(e) {
	let [t, n] = (0, l.useState)(po), r = (0, l.useRef)(null), i = (0, l.useRef)([]), a = () => {
		for (let e of i.current) window.clearTimeout(e);
		i.current = [];
	}, o = (e, t) => {
		let n = window.setTimeout(e, t);
		i.current.push(n);
	};
	(0, l.useEffect)(() => () => a(), []);
	let s = JSON.stringify(e.tricksByPlayer), c = JSON.stringify(e.bankrollByPlayer), u = JSON.stringify(e.bourrePlayerIds);
	return (0, l.useEffect)(() => {
		let t = ho(r.current, e);
		if (r.current = mo(e), !(!t.turnHandoffPlayerId && !t.dealerMovedPlayerId && !t.potTick && Object.keys(t.trickBadgeIncrements).length === 0 && Object.keys(t.bankrollChanges).length === 0 && t.bourrePlayerIds.length === 0 && !t.trumpReminderPulse && !t.feedbackErrorPulse && !t.feedbackSuccessPulse && !t.winnerFlashPlayerId)) {
			n((e) => {
				let n = { ...e };
				if (t.turnHandoffPlayerId && (n.turnHandoffPlayerId = t.turnHandoffPlayerId), t.dealerMovedPlayerId && (n.dealerMovedPlayerId = t.dealerMovedPlayerId), t.potTick && (n.potTick += 1), t.trumpReminderPulse && (n.trumpReminderPulse += 1), t.feedbackErrorPulse && (n.feedbackErrorPulse += 1), t.feedbackSuccessPulse && (n.feedbackSuccessPulse += 1), t.winnerFlashPlayerId && (n.winnerFlashPlayerId = t.winnerFlashPlayerId), Object.keys(t.trickBadgeIncrements).length > 0) {
					n.trickBadgeTicks = { ...e.trickBadgeTicks };
					for (let [r, i] of Object.entries(t.trickBadgeIncrements)) n.trickBadgeTicks[r] = (e.trickBadgeTicks[r] ?? 0) + i;
				}
				if (Object.keys(t.bankrollChanges).length > 0 && (n.bankrollTicks = {
					...e.bankrollTicks,
					...t.bankrollChanges
				}), t.bourrePlayerIds.length > 0) {
					n.bourreAlerts = { ...e.bourreAlerts };
					for (let e of t.bourrePlayerIds) n.bourreAlerts[e] = "pulse";
				}
				return n;
			}), t.turnHandoffPlayerId && o(() => {
				n((e) => e.turnHandoffPlayerId === t.turnHandoffPlayerId ? {
					...e,
					turnHandoffPlayerId: null
				} : e);
			}, fo.turnHandoff), t.dealerMovedPlayerId && o(() => {
				n((e) => e.dealerMovedPlayerId === t.dealerMovedPlayerId ? {
					...e,
					dealerMovedPlayerId: null
				} : e);
			}, fo.dealerMove), t.winnerFlashPlayerId && o(() => {
				n((e) => e.winnerFlashPlayerId === t.winnerFlashPlayerId ? {
					...e,
					winnerFlashPlayerId: null
				} : e);
			}, fo.winnerFlash);
			for (let [e, r] of Object.entries(t.bankrollChanges)) o(() => {
				n((t) => {
					if (t.bankrollTicks[e] !== r) return t;
					let n = { ...t.bankrollTicks };
					return delete n[e], {
						...t,
						bankrollTicks: n
					};
				});
			}, fo.bankrollTick);
			for (let e of t.bourrePlayerIds) o(() => {
				n((t) => t.bourreAlerts[e] === "pulse" ? {
					...t,
					bourreAlerts: {
						...t.bourreAlerts,
						[e]: "marker"
					}
				} : t);
			}, fo.bourrePulse), o(() => {
				n((t) => {
					if (!t.bourreAlerts[e]) return t;
					let n = { ...t.bourreAlerts };
					return delete n[e], {
						...t,
						bourreAlerts: n
					};
				});
			}, fo.bourreMarker);
		}
	}, [
		e.turnPlayerId,
		e.dealerId,
		e.potAmount,
		s,
		c,
		u,
		e.phase,
		e.showTrumpSuitReminder,
		e.suppressTurn,
		e.actionFeedbackStatus,
		e.trickWinnerSeatId,
		e.trickPhase
	]), t;
}
//#endregion
//#region src/table/BourreResultSting.tsx
function Rh({ active: e, displayName: t }) {
	let [n, r] = (0, l.useState)(!1), i = Ld();
	return (0, l.useEffect)(() => {
		if (!e) {
			r(!1);
			return;
		}
		r(!0);
		let t = i ? 900 : 1400, n = window.setTimeout(() => r(!1), t);
		return () => window.clearTimeout(n);
	}, [e, i]), n ? /* @__PURE__ */ (0, g.jsxs)("div", {
		className: ["bbourre-sting", i ? "bbourre-sting--reduced" : ""].filter(Boolean).join(" "),
		"data-testid": "bourre-result-sting",
		role: "status",
		"aria-live": "polite",
		"aria-label": t ? `${t} went bourré` : "Bourré",
		children: [/* @__PURE__ */ (0, g.jsx)("div", {
			className: "bbourre-sting__wash",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "bbourre-sting__badge",
			children: [/* @__PURE__ */ (0, g.jsx)("span", {
				className: "bbourre-sting__label",
				children: "Bourré"
			}), t ? /* @__PURE__ */ (0, g.jsx)("span", {
				className: "bbourre-sting__name muted small",
				children: t
			}) : null]
		})]
	}) : null;
}
//#endregion
//#region src/table/hooks/useYourTurnAttention.ts
var zh = kh, Bh = [
	12e3,
	18e3,
	24e3
];
function Vh(e) {
	let [t, n] = (0, l.useState)("hidden"), [r, i] = (0, l.useState)(0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(null), c = (0, l.useRef)(0), u = (0, l.useRef)(e.actionRequired);
	u.current = e.actionRequired;
	let d = () => {
		a.current != null && (window.clearTimeout(a.current), a.current = null), o.current != null && (window.clearTimeout(o.current), o.current = null), s.current != null && (window.clearTimeout(s.current), s.current = null);
	}, f = (0, l.useCallback)(() => {
		let e = c.current;
		if (e === 0) return;
		let t = Bh[Math.min(e - 1, Bh.length - 1)];
		a.current = window.setTimeout(() => {
			a.current = null, u.current && (i(e), n("pop"), c.current = e + 1);
		}, t);
	}, []);
	return (0, l.useEffect)(() => (d(), c.current = 0, e.actionRequired ? (a.current = window.setTimeout(() => {
		a.current = null, u.current && (i(0), n("pop"), c.current = 1);
	}, zh), d) : (n("hidden"), i(0), d)), [e.activityKey, e.actionRequired]), (0, l.useEffect)(() => {
		if (t !== "pop") return;
		let e = Ld() ? 280 : 420;
		return o.current = window.setTimeout(() => {
			o.current = null, n("exit");
		}, 380 + e), () => {
			o.current != null && (window.clearTimeout(o.current), o.current = null);
		};
	}, [t, r]), (0, l.useEffect)(() => {
		if (t !== "exit") return;
		let e = Ld() ? 240 : 620;
		return s.current = window.setTimeout(() => {
			s.current = null, n("hidden"), u.current && f();
		}, e), () => {
			s.current != null && (window.clearTimeout(s.current), s.current = null);
		};
	}, [
		t,
		e.actionRequired,
		f
	]), {
		phase: t,
		beat: r
	};
}
function Hh() {
	return Ld();
}
//#endregion
//#region src/table/YourTurnAttention.tsx
function Uh({ actionRequired: e, activityKey: t }) {
	let { phase: n, beat: r } = Vh({
		actionRequired: e,
		activityKey: t
	});
	if (n === "hidden") return null;
	let i = Hh(), a = Math.min(r, 5);
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: [
			"byour-turn",
			n === "exit" ? "byour-turn--exit" : "byour-turn--pop",
			i ? "byour-turn--reduced" : "",
			a > 0 ? `byour-turn--urgency-${a}` : ""
		].filter(Boolean).join(" "),
		"data-testid": "your-turn-attention",
		role: "status",
		"aria-live": "polite",
		"aria-label": "Your turn",
		children: /* @__PURE__ */ (0, g.jsx)("span", {
			className: "byour-turn__text",
			children: "Your Turn"
		})
	});
}
//#endregion
//#region src/table/TableSceneOverlay.tsx
function Wh({ actionFeedback: e, feedbackErrorPulse: t = 0, feedbackSuccessPulse: n = 0, turnLabel: r = null, isMyTurn: i = !1, showTurn: a = !1 }) {
	let o = e && e.status !== "idle" && !(e.status === "loading" && !e.message?.trim()), s = a && !!r;
	return !o && !s ? null : /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [o && /* @__PURE__ */ (0, g.jsx)("div", {
		className: "btable-stage__overlay btable-stage__overlay--chrome",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, g.jsx)("div", {
			className: [
				`btable-stage__feedback btable-stage__feedback--${e.status}`,
				e.status === "error" ? "btable-stage__feedback--pulse-error" : "",
				e.status === "success" ? "btable-stage__feedback--pulse" : ""
			].filter(Boolean).join(" "),
			"data-testid": "feedback-banner",
			role: e.status === "error" ? "alert" : "status",
			children: e.message
		}, e.status === "error" ? `feedback-error-${t}` : e.status === "success" ? `feedback-success-${n}` : `feedback-${e.status}`)
	}), s && /* @__PURE__ */ (0, g.jsx)("div", {
		className: "btable-stage__overlay btable-stage__overlay--turn",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, g.jsx)("p", {
			className: ["btable-stage__turn", i ? "btable-stage__turn--yours" : "btable-stage__turn--waiting"].join(" "),
			"data-testid": "turn-indicator",
			children: r
		})
	})] });
}
//#endregion
//#region src/table/hooks/useTrumpTrickMotionGate.ts
var Gh = 880;
function Kh(e, t, n) {
	let r = (0, l.useRef)(!1), [i, a] = (0, l.useState)(!1);
	return (0, l.useEffect)(() => {
		if (e !== "play") {
			r.current = !1, a(!1);
			return;
		}
		if (t) {
			r.current = !0, a(!0);
			return;
		}
		if (!r.current) {
			a(!1);
			return;
		}
		a(!0);
		let n = window.setTimeout(() => {
			a(!1), r.current = !1;
		}, Gh);
		return () => window.clearTimeout(n);
	}, [e, t]), (0, l.useEffect)(() => {
		if (!i || t || n === 0) return;
		let e = window.setTimeout(() => {
			a(!1), r.current = !1;
		}, Gh);
		return () => window.clearTimeout(e);
	}, [
		i,
		t,
		n
	]), i;
}
//#endregion
//#region src/table/trickPresentationMachine.ts
function qh(e, t) {
	return {
		phase: "live",
		frozenTrick: null,
		revealedCount: 0,
		showWinnerTag: !1,
		displayTricksByPlayer: { ...e },
		prevTricks: { ...e },
		prevTrick: t,
		pendingServer: null,
		resolvedTricks: null,
		pendingResolution: null,
		peakTrickPlays: Md(t),
		displayRevealFloor: 0
	};
}
function Jh(e, t) {
	if (t.length < e.length) return !1;
	for (let n = 0; n < e.length; n++) if (Qa(e[n]) !== Qa(t[n])) return !1;
	return !0;
}
function Yh(e, t, n) {
	let r = t.currentTrick?.trickNumber ?? null, i = e.prevTrick?.trickNumber ?? null, a = r != null && i != null && r !== i ? [] : [...e.peakTrickPlays ?? []];
	for (let t of [
		n,
		Md(e.prevTrick),
		e.peakTrickPlays ?? []
	]) t.length > a.length && Jh(a, t) && (a = t);
	return a;
}
function Xh(e, t) {
	return e.phase === "live" ? e : {
		...e,
		pendingServer: t
	};
}
function Zh(e) {
	return Math.max(e.pendingResolution?.frozen.plays.length ?? 0, Md(e.prevTrick).length, e.peakTrickPlays?.length ?? 0);
}
function Qh(e, t) {
	let n = Md(t.currentTrick), r = Md(e.prevTrick), i = Yh(e, t, n), a = e.phase === "live" && !e.pendingResolution && (n.length < e.revealedCount && r.length >= e.revealedCount || n.length < i.length && r.length >= i.length), o = t.currentTrick?.trickNumber ?? null, s = e.prevTrick?.trickNumber ?? null, c = o != null && s != null && o !== s;
	return {
		...e,
		prevTricks: { ...t.tricksByPlayer },
		prevTrick: a ? e.prevTrick : t.currentTrick,
		displayTricksByPlayer: { ...t.tricksByPlayer },
		pendingServer: null,
		resolvedTricks: null,
		peakTrickPlays: i,
		displayRevealFloor: c ? 0 : e.displayRevealFloor
	};
}
function $h(e, t, n, r) {
	return {
		...e,
		phase: "trickComplete",
		frozenTrick: t,
		revealedCount: t.plays.length,
		showWinnerTag: !1,
		displayTricksByPlayer: { ...e.prevTricks },
		resolvedTricks: { ...n },
		pendingServer: {
			currentTrick: r,
			tricksByPlayer: n
		},
		peakTrickPlays: t.plays
	};
}
function eg(e, t) {
	let n = tg(e, t);
	if (gu()) {
		let r = Md(e.prevTrick).length, i = Md(n.prevTrick).length;
		(e.phase !== n.phase || e.revealedCount !== n.revealedCount || r !== i || !!e.pendingResolution != !!n.pendingResolution || t.type === "serverUpdate") && _u("trickPresentation", t.type, {
			phase: `${e.phase} -> ${n.phase}`,
			revealedCount: `${e.revealedCount} -> ${n.revealedCount}`,
			prevTrickPlays: `${r} -> ${i}`,
			peakPlays: n.peakTrickPlays?.length ?? 0,
			pendingResolution: !!n.pendingResolution,
			livePlays: t.type === "serverUpdate" ? t.snapshot.currentTrick?.plays?.length : void 0
		});
	}
	return n;
}
function tg(e, t) {
	switch (t.type) {
		case "reset":
		case "reinit": return qh(t.type === "reinit" ? t.snapshot.tricksByPlayer : e.displayTricksByPlayer, t.type === "reinit" ? t.snapshot.currentTrick : null);
		case "revealNextCard": {
			if (e.phase !== "live") return e;
			let t = Zh(e);
			if (e.revealedCount >= t) return e;
			let n = e.revealedCount + 1;
			return {
				...e,
				revealedCount: n,
				displayRevealFloor: Math.max(e.displayRevealFloor, n)
			};
		}
		case "clampRevealedCount": {
			if (e.phase !== "live" || e.pendingResolution) return e;
			let n = Math.max(t.target, e.peakTrickPlays?.length ?? 0);
			return e.revealedCount <= n ? e : {
				...e,
				revealedCount: n
			};
		}
		case "commitTrickResolution": {
			let t = e.pendingResolution;
			return !t || e.phase !== "live" ? e : $h({
				...e,
				pendingResolution: null
			}, t.frozen, t.snapshot.tricksByPlayer, t.snapshot.currentTrick);
		}
		case "forceHandEndDrain": {
			let t = e;
			if (t.phase === "live" && t.pendingResolution && (t = $h({
				...t,
				pendingResolution: null
			}, t.pendingResolution.frozen, t.pendingResolution.snapshot.tricksByPlayer, t.pendingResolution.snapshot.currentTrick)), t.phase === "live" && !t.pendingResolution) return t;
			let n = t.pendingServer, r = n?.tricksByPlayer ?? {}, i = Object.values(r).some((e) => (e ?? 0) > 0), a = i ? { ...r } : { ...t.displayTricksByPlayer }, o = Md(n?.currentTrick).length;
			return {
				...t,
				phase: "live",
				frozenTrick: null,
				showWinnerTag: !1,
				revealedCount: o,
				resolvedTricks: null,
				pendingResolution: null,
				pendingServer: null,
				prevTricks: i ? { ...r } : t.prevTricks,
				prevTrick: n?.currentTrick ?? t.prevTrick,
				displayTricksByPlayer: a,
				peakTrickPlays: Md(n?.currentTrick),
				displayRevealFloor: o
			};
		}
		case "advancePhase": switch (e.phase) {
			case "trickComplete": return {
				...e,
				phase: "winnerReveal",
				showWinnerTag: !0
			};
			case "winnerReveal": return {
				...e,
				phase: "collectTrick",
				displayTricksByPlayer: { ...e.resolvedTricks ?? e.displayTricksByPlayer }
			};
			case "collectTrick": return {
				...e,
				phase: "nextLeadReady"
			};
			case "nextLeadReady": {
				let t = e.pendingServer, n = Md(t?.currentTrick).length;
				return {
					...e,
					phase: "live",
					frozenTrick: null,
					showWinnerTag: !1,
					revealedCount: n,
					resolvedTricks: null,
					pendingServer: null,
					prevTricks: t ? { ...t.tricksByPlayer } : e.prevTricks,
					prevTrick: t?.currentTrick ?? e.prevTrick,
					displayTricksByPlayer: t ? { ...t.tricksByPlayer } : e.displayTricksByPlayer,
					peakTrickPlays: Md(t?.currentTrick),
					displayRevealFloor: n
				};
			}
			default: return e;
		}
		case "serverUpdate": {
			let { snapshot: n, participantIds: r } = t;
			if (e.pendingResolution) return {
				...e,
				pendingResolution: {
					frozen: e.pendingResolution.frozen,
					snapshot: n
				}
			};
			if (e.phase !== "live") return Xh(e, n);
			let i = Id({
				prevTricks: e.prevTricks,
				nextTricks: n.tricksByPlayer,
				participantIds: r,
				prevTrick: e.prevTrick,
				playedCards: n.playedCards
			});
			return i ? {
				...e,
				pendingResolution: {
					frozen: i,
					snapshot: n
				}
			} : Qh(e, n);
		}
		default: return e;
	}
}
function ng(e, t) {
	let n = e.pendingResolution?.frozen.plays ?? [];
	if (n.length > 0) return n;
	let r = Md(e.prevTrick), i = e.peakTrickPlays ?? [];
	return e.phase === "live" ? i.length > t.length ? i : r.length > t.length ? r : t.length > 0 ? t : r : t.length > 0 ? t : r.length > 0 ? r : i;
}
function rg(e, t) {
	let n = ng(e, Md(t)), r = e.displayRevealFloor, i = n.length >= r ? n : (e.peakTrickPlays?.length ?? 0) >= r ? e.peakTrickPlays : n, a = e.phase === "live" ? e.pendingResolution ? Math.max(e.revealedCount, i.length) : Math.min(e.revealedCount, i.length) : i.length, o = e.phase === "live" && !e.pendingResolution ? Math.max(a, r) : a, s = e.phase === "live" ? i.slice(0, o) : e.frozenTrick?.plays ?? [], c = e.frozenTrick?.plays ?? [], l = e.frozenTrick?.winnerId ?? null, u = e.phase, d = c.length > 0 && s.length === 0 && e.phase !== "live", f = e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null, p = e.showWinnerTag && (e.phase === "winnerReveal" || e.phase === "collectTrick"), m = e.peakTrickPlays?.length ?? 0, h = e.phase === "live" ? Zh(e) : e.revealedCount;
	return {
		phase: e.phase,
		displayPlays: s,
		winnerPlayerId: f,
		showWinnerTag: p,
		displayTricksByPlayer: e.displayTricksByPlayer,
		suppressTurnPlayerId: Dd(e.phase),
		trickWinnerSeatId: e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null,
		revealedCount: e.revealedCount,
		isResolving: e.phase !== "live",
		isPipelineActive: e.phase !== "live" || !!e.pendingResolution,
		peakPlayCount: m,
		revealTarget: h,
		trickEchoPlays: c,
		trickEchoWinnerId: l,
		trickEchoPhase: u,
		showFinalTrickEcho: d,
		frozenTrick: e.frozenTrick
	};
}
//#endregion
//#region src/table/hooks/useTrickPresentation.ts
function ig({ phase: e, currentTrick: t, tricksByPlayer: n, participantIds: r, trumpSuit: i, playedCards: a, turnPlayerId: o, handComplete: s = !1 }) {
	let [c, u] = (0, l.useReducer)(eg, n, (e) => qh(e, t)), d = (0, l.useRef)([]), f = (0, l.useRef)(null), p = (0, l.useRef)(/* @__PURE__ */ new Set()), m = (0, l.useRef)(!1), h = (0, l.useRef)(null), g = (0, l.useRef)(0), _ = (0, l.useRef)(!1), v = (0, l.useRef)(c);
	v.current = c;
	let y = c.phase !== "live" || !!c.pendingResolution;
	m.current = y;
	let b = e === "play", x = (e) => {
		for (let t of e) {
			let e = Qa(t);
			p.current.has(e) || (p.current.add(e), so(t.playerId, e));
		}
	}, S = () => {
		for (let e of d.current) window.clearTimeout(e);
		d.current = [];
	}, C = (e, t) => {
		let n = window.setTimeout(e, t);
		d.current.push(n);
	};
	(0, l.useEffect)(() => () => S(), []), (0, l.useEffect)(() => {
		let c = b && !_.current;
		_.current = b;
		let l = s || e == null && r.length === 0;
		if (c || !b && !m.current && !l) {
			S(), f.current = null, p.current.clear(), uo(), u({
				type: "reinit",
				snapshot: {
					currentTrick: t,
					tricksByPlayer: n,
					playedCards: a
				}
			}), gu() && _u("useTrickPresentation", c ? "reinit-play-entry" : "reinit-idle", {
				trickNumber: t?.trickNumber,
				trickPlays: t?.plays?.length ?? 0
			});
			return;
		}
		u({
			type: "serverUpdate",
			snapshot: {
				currentTrick: t,
				tricksByPlayer: n,
				playedCards: a
			},
			participantIds: r,
			trumpSuit: i,
			reducedMotion: Ld()
		}), gu() && _u("useTrickPresentation", "serverUpdate-effect", {
			sessionPhase: e,
			trickNumber: t?.trickNumber,
			livePlays: t?.plays?.length ?? 0,
			turnPlayerId: o
		});
	}, [
		e,
		t,
		n,
		r,
		i,
		a,
		b,
		s,
		r.length
	]), (0, l.useLayoutEffect)(() => {
		if (!b && !y) return;
		J(r), o && J([o]);
		let e = t?.plays ?? [];
		e.length > 0 && x(e);
		let n = c.pendingResolution?.frozen.plays ?? [];
		n.length > 0 && x(n);
	}, [
		b,
		y,
		r,
		o,
		t?.plays,
		c.pendingResolution?.frozen.plays
	]), (0, l.useEffect)(() => {
		if (!b && !y || c.phase !== "trickComplete" || !c.frozenTrick) return;
		let e = `${c.frozenTrick.trickNumber}:${c.frozenTrick.winnerId}:${c.frozenTrick.plays.length}`;
		if (f.current === e) return;
		f.current = e, S();
		let t = c.frozenTrick, n = kd({
			trumpBeat: Fd(t.plays, t.leadSuit, i),
			reducedMotion: Ld()
		});
		C(() => u({ type: "advancePhase" }), n.readBeforeWinnerMs), C(() => u({ type: "advancePhase" }), n.readTotalMs), C(() => u({ type: "advancePhase" }), n.readTotalMs + n.sweepMs), C(() => u({ type: "advancePhase" }), n.pipelineMs);
	}, [
		b,
		y,
		c.phase,
		c.frozenTrick,
		i
	]), (0, l.useEffect)(() => {
		if (!b && !y || c.phase !== "live" || !c.pendingResolution) return;
		let e = c.pendingResolution.frozen.plays.length;
		if (c.revealedCount < e) return;
		let t = Ld() ? 308 : 560, n = window.setTimeout(() => u({ type: "commitTrickResolution" }), t);
		return () => window.clearTimeout(n);
	}, [
		b,
		y,
		c.phase,
		c.pendingResolution,
		c.revealedCount
	]), (0, l.useEffect)(() => {
		c.phase === "live" && (f.current = null);
	}, [c.phase]), (0, l.useEffect)(() => {
		let t = s || e == null && r.length === 0;
		if (!y || !t || b && !s) return;
		let n = Ld(), i = n ? 60 : 160, a = n ? 80 : 220, o = [], l = (e, t) => {
			o.push(window.setTimeout(e, t));
		};
		gu() && _u("useTrickPresentation", "hand-end-drain-armed", {
			phase: c.phase,
			pendingResolution: !!c.pendingResolution
		}), c.phase === "live" && c.pendingResolution && l(() => u({ type: "commitTrickResolution" }), a);
		let d = (c.phase === "live" && c.pendingResolution ? a : 0) + i;
		for (let e = 0; e < 6; e++) l(() => {
			let e = v.current;
			e.phase === "live" && !e.pendingResolution || u({ type: "advancePhase" });
		}, d), d += i;
		return l(() => {
			let e = v.current;
			e.phase === "live" && !e.pendingResolution || (gu() && _u("useTrickPresentation", "hand-end-drain-force", {
				phase: e.phase,
				pendingResolution: !!e.pendingResolution
			}), u({ type: "forceHandEndDrain" }));
		}, Ed), () => {
			for (let e of o) window.clearTimeout(e);
		};
	}, [
		b,
		y,
		c.phase,
		c.pendingResolution,
		s,
		e,
		r.length
	]);
	let w = c.phase === "live" ? Math.max(c.pendingResolution?.frozen.plays.length ?? 0, t?.plays?.length ?? 0, c.peakTrickPlays?.length ?? 0) : c.revealedCount;
	g.current = w;
	let T = () => {
		h.current != null && (window.clearTimeout(h.current), h.current = null);
	}, E = () => {
		if (!b && !m.current || c.phase !== "live") {
			T();
			return;
		}
		if (c.revealedCount >= g.current) {
			T();
			return;
		}
		if (h.current != null) return;
		let e = Ld() ? 369 : 670;
		h.current = window.setTimeout(() => {
			h.current = null, gu() && _u("useTrickPresentation", "revealNextCard-timer", {
				revealedCount: c.revealedCount,
				targetReveal: g.current
			}), u({ type: "revealNextCard" });
		}, e);
	};
	return (0, l.useEffect)(() => (E(), T), [
		b,
		y,
		c.phase,
		c.revealedCount
	]), (0, l.useEffect)(() => {
		E();
	}, [w]), (0, l.useEffect)(() => {
		!b && !y || c.phase !== "live" || c.pendingResolution || c.revealedCount <= w || u({
			type: "clampRevealedCount",
			target: w
		});
	}, [
		b,
		y,
		c.phase,
		c.pendingResolution,
		w,
		c.revealedCount
	]), {
		...rg(c, t),
		forceHandEndDrain: () => u({ type: "forceHandEndDrain" })
	};
}
//#endregion
//#region src/table/settlementCopy.ts
function ag(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function og(e, t) {
	return e.map((e) => ag(e, t)).join(" & ");
}
function sg(e, t) {
	return ad(e, t) ? t.filter((t) => (e[t] ?? 0) === 0) : [];
}
function cg(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: a = {} } = e, o = cd(t, n), s = e.winnerIds?.length ? e.winnerIds : o.winnerIds, c = e.maxTricks ?? o.maxTricks, l = og(s, r), u = sg(t, n), d = og(u, r), f = ld(i.maxWinThisHand), p = ld(i.currentPot), m = i.carryIn > 0 ? ld(i.carryIn) : null, h = `Pot this hand: ${p} (max win ${f})`;
	m && (h += ` — includes ${m} carried in`), i.limEnabled && i.overflow > 0 && (h += ` · LIM overflow ${ld(i.overflow)} stays out of play`);
	let g = s.map((e) => {
		let n = t[e] ?? 0;
		return `${ag(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), _ = u.length > 0 ? `Bourré: ${d} took 0 tricks — each pays ${f} at settlement (seeds next deal)` : null, v = e.splitSharePerWinner, y = v > 0 && s.length >= 2 ? `If all co-winners agree to split: ${ld(i.maxWinThisHand)} → ${ld(v)} each` : null, b = s.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, x = `If any co-winner declines: full pot ${p} carries to the next hand · non-winners ante up`, S = s.map((e) => {
		let t = a[e], n = ag(e, r);
		return t === "split" ? `${n}: Agreed to split ✓` : t === "push" ? `${n}: Declined split ✓` : `${n}: Waiting to vote…`;
	}), C = e.currentUserId != null && s.includes(e.currentUserId);
	return {
		headline: `Tie — ${l} (${c} tricks each)`,
		subhead: "Co-winners must vote before the next hand can start.",
		winnerLines: g,
		bourreLine: _,
		potLine: h,
		carryoverIfSplitLine: b,
		carryoverIfPushLine: x,
		splitPreviewLine: y,
		rulesLine: "One Decline pushes the pot. All co-winners must Agree to split the max win.",
		voteLines: S,
		observerHint: !C && e.currentUserId ? "You are not a co-winner — waiting for their vote." : null,
		voterHint: C ? "You tied for the lead — cast your vote below." : null
	};
}
//#endregion
//#region src/table/SettlementCoWinPanel.tsx
function lg({ session: e, players: t, potMetrics: n, splitSharePerWinner: r, currentUserId: i, isCoWinner: a, onSettle: o }) {
	let s = cg({
		tricksByPlayer: e.tricksByPlayer,
		participantIds: e.participantIds,
		players: t.map((e) => ({
			playerId: e.playerId,
			displayName: e.displayName
		})),
		pot: {
			currentPot: n.currentPot,
			maxWinThisHand: n.maxWinThisHand,
			carryIn: e.carryOverPot ?? 0,
			limEnabled: n.limEnabled,
			overflow: n.overflow
		},
		pendingVotes: e.pendingCoWinSettlement?.votes,
		splitSharePerWinner: r,
		currentUserId: i,
		winnerIds: e.pendingCoWinSettlement?.winnerIds
	});
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: "btable-session__settle",
		"data-testid": "settlement-panel",
		role: "region",
		"aria-label": "Co-winner settlement vote",
		children: [
			/* @__PURE__ */ (0, g.jsx)("h6", {
				className: "btable-session__settle-title",
				"data-testid": "settlement-headline",
				children: s.headline
			}),
			/* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-sub",
				"data-testid": "settlement-subhead",
				children: s.subhead
			}),
			/* @__PURE__ */ (0, g.jsx)("ul", {
				className: "btable-session__settle-list",
				"data-testid": "settlement-winners",
				children: s.winnerLines.map((e) => /* @__PURE__ */ (0, g.jsx)("li", { children: e }, e))
			}),
			s.bourreLine && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-bourre",
				"data-testid": "settlement-bourre",
				children: s.bourreLine
			}),
			/* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-pot",
				"data-testid": "settlement-pot",
				children: s.potLine
			}),
			s.splitPreviewLine && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__split-preview",
				"data-testid": "settlement-split-preview",
				children: s.splitPreviewLine
			}),
			/* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-carry muted small",
				"data-testid": "settlement-carry-push",
				children: s.carryoverIfPushLine
			}),
			s.carryoverIfSplitLine && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-carry muted small",
				"data-testid": "settlement-carry-split",
				children: s.carryoverIfSplitLine
			}),
			/* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-rules muted small",
				"data-testid": "settlement-rules",
				children: s.rulesLine
			}),
			/* @__PURE__ */ (0, g.jsx)("ul", {
				className: "btable-session__settle-votes",
				"data-testid": "settlement-votes",
				children: s.voteLines.map((e) => /* @__PURE__ */ (0, g.jsx)("li", { children: e }, e))
			}),
			s.voterHint && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-hint",
				"data-testid": "settlement-voter-hint",
				children: s.voterHint
			}),
			s.observerHint && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-hint muted small",
				"data-testid": "settlement-observer-hint",
				children: s.observerHint
			}),
			/* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btable-session__settle-btns",
				children: [/* @__PURE__ */ (0, g.jsx)("button", {
					type: "button",
					className: "btn btn--sm",
					disabled: !a,
					"data-testid": "settlement-decline-btn",
					onClick: () => o("push"),
					children: "Decline split · push pot"
				}), /* @__PURE__ */ (0, g.jsxs)("button", {
					type: "button",
					className: "btn btn--sm btn--primary",
					disabled: !a,
					"data-testid": "settlement-agree-btn",
					onClick: () => o("split"),
					children: [
						"Agree to split · ",
						ld(r),
						" each"
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/table/SplitPotDecisionToast.tsx
var ug = 3e3;
function dg(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function fg({ session: e, players: t, splitSharePerWinner: n, currentUserId: r, isCoWinner: i, onAgreeSplit: a, onDeclineSplit: o, onCarryover: s }) {
	let c = e.pendingCoWinSettlement?.winnerIds ?? [], u = e.pendingCoWinSettlement?.votes ?? {}, [d, f] = (0, l.useState)(ug), [p, m] = (0, l.useState)(!1), h = (0, l.useRef)(null), _ = (0, l.useRef)(!1), v = (0, l.useMemo)(() => `${c.join(",")}:${e.handNumber ?? 0}`, [c, e.handNumber]);
	(0, l.useEffect)(() => {
		h.current = Date.now(), _.current = !1, f(ug), m(!1);
	}, [v]);
	let y = c.length >= 2 && c.every((e) => u[e] === "split"), b = (0, l.useCallback)(() => {
		_.current || (_.current = !0, s());
	}, [s]);
	if ((0, l.useEffect)(() => {
		if (c.length < 2) return;
		let e = window.setInterval(() => {
			let e = h.current ?? Date.now(), t = Date.now() - e, n = Math.max(0, ug - t);
			f(n), n <= 0 && !y && b();
		}, 100);
		return () => window.clearInterval(e);
	}, [
		c.length,
		y,
		b,
		v
	]), (0, l.useEffect)(() => {
		y && (_.current = !0);
	}, [y]), c.length < 2) return null;
	let x = Math.max(0, Math.ceil(d / 1e3)), S = c.map((e) => dg(e, t)).join(" & "), C = (e) => {
		!i || _.current || (m(e), e ? a() : o());
	};
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: "btable-split-toast",
		"data-testid": "split-pot-toast",
		role: "dialog",
		"aria-label": "Split pot decision",
		"aria-live": "polite",
		children: [
			/* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-split-toast__title",
				children: "Tie — split the pot?"
			}),
			/* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-split-toast__names",
				children: S
			}),
			/* @__PURE__ */ (0, g.jsxs)("p", {
				className: "btable-split-toast__share muted small",
				children: [ld(n), " each if all agree"]
			}),
			i ? /* @__PURE__ */ (0, g.jsxs)("label", {
				className: "btable-split-toast__choice",
				children: [/* @__PURE__ */ (0, g.jsx)("input", {
					type: "checkbox",
					checked: p || u[r ?? ""] === "split",
					onChange: (e) => C(e.target.checked),
					"data-testid": "split-pot-agree"
				}), /* @__PURE__ */ (0, g.jsx)("span", { children: "Yes — split pot" })]
			}) : /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-split-toast__wait muted small",
				children: "Waiting for tied leaders…"
			}),
			/* @__PURE__ */ (0, g.jsxs)("p", {
				className: "btable-split-toast__timer muted small",
				"data-testid": "split-pot-timer",
				children: [x, "s — carryover if not all agree"]
			})
		]
	});
}
//#endregion
//#region src/table/heroHandDisplay.ts
function pg(e, t) {
	return t == null || e < t ? e : e + 1;
}
function mg(e, t) {
	return t == null ? e : e === t ? null : e > t ? e - 1 : e;
}
function hg(e, t) {
	return e.map((e) => pg(e, t));
}
function gg(e, t) {
	return e.map((e) => mg(e, t)).filter((e) => e != null).sort((e, t) => e - t);
}
function _g(e) {
	let t = !!(e.playerId && e.trumpHolderId && e.playerId === e.trumpHolderId), n = !!e.trumpUpcard, { trumpMergeActive: r, trumpMergedIntoHand: i } = e.handPresentation, a = !n && !!e.trumpSuit && e.phase === "play";
	if (!t) return {
		displayCards: e.effectiveHeroCards,
		revealedTrumpIndex: null,
		trumpMergeActive: !1,
		trumpMergedIntoHand: !1,
		hideCenterTrumpForHolder: !1,
		showTrumpSuitReminder: a,
		trumpDisabledIndex: null,
		indexMode: "effective"
	};
	if (r && !n) {
		let t = Math.max(0, e.effectiveHeroCards.length - 1);
		return {
			displayCards: e.effectiveHeroCards,
			revealedTrumpIndex: t,
			trumpMergeActive: !0,
			trumpMergedIntoHand: !1,
			hideCenterTrumpForHolder: !1,
			showTrumpSuitReminder: !1,
			trumpDisabledIndex: t,
			indexMode: "display"
		};
	}
	return n ? {
		displayCards: e.effectiveHeroCards,
		revealedTrumpIndex: null,
		trumpMergeActive: !1,
		trumpMergedIntoHand: i,
		hideCenterTrumpForHolder: !1,
		showTrumpSuitReminder: !1,
		trumpDisabledIndex: null,
		indexMode: "effective"
	} : {
		displayCards: e.effectiveHeroCards,
		revealedTrumpIndex: null,
		trumpMergeActive: !1,
		trumpMergedIntoHand: i,
		hideCenterTrumpForHolder: !1,
		showTrumpSuitReminder: a,
		trumpDisabledIndex: null,
		indexMode: "effective"
	};
}
//#endregion
//#region src/table/TableSessionView.tsx
var vg = [], yg = [], bg = [];
function xg({ session: e, players: t, potMetrics: n, mySessionNet: r, leaderLabel: i, showCoWinSettlement: a, splitPotEnabled: o = !1, rebuyEnabled: s = !1, splitSharePerWinner: c = 0, enrollmentActive: u = !1, currentUserId: d, heroCards: f = yg, rawHeroCards: p = yg, privateHandReady: m = !1, legalPlayIndices: h, recentBourreIds: _ = bg, handComplete: v = !1, actionFeedback: y, actions: b }) {
	let { settings: x } = nu(), S = Hf(), [C, w] = (0, l.useState)(!1), T = e.participantIds.length, { events: E, dismissEvent: D, pushReaction: O } = Zm({
		session: e,
		potMetrics: n,
		participantIds: e.participantIds
	}), k = (0, l.useMemo)(() => [...E].reverse().find((e) => e.kind === "big-pot") ?? null, [E]), A = d != null && (e.pendingCoWinSettlement?.winnerIds || []).includes(d), j = ig({
		phase: e.phase,
		currentTrick: e.currentTrick,
		tricksByPlayer: e.tricksByPlayer,
		participantIds: e.participantIds,
		trumpSuit: e.trumpSuit,
		playedCards: e.playedCards,
		turnPlayerId: e.turnPlayerId,
		handComplete: v
	}), M = j.forceHandEndDrain, N = Oh({
		session: e,
		enrollmentActive: u,
		potAmount: n.currentPot,
		handComplete: v,
		trickPipelineActive: j.isPipelineActive,
		forceTrickHandEndDrain: M,
		heroCards: f,
		enrolledIds: e.handEnrollment?.enrolledIds ?? vg,
		declinedIds: e.handEnrollment?.declinedIds ?? vg,
		actionOrder: e.actionOrder ?? e.handEnrollment?.orderedPlayerIds ?? e.participantIds
	}), ee = Kh(e.phase, e.trumpUpcard, j.displayPlays.length), te = Eu(N.isPresenting, N.phase, e.phase), [P, F] = (0, l.useState)(0);
	(0, l.useEffect)(() => du(() => F((e) => e + 1)), []), (0, l.useEffect)(() => {
		Au({
			pipelineActive: j.isPipelineActive,
			revealCatchUp: j.phase === "live" && j.revealedCount < j.revealTarget,
			motionGateActive: ee,
			peakPlayCount: j.peakPlayCount,
			displayedPlayCount: j.displayPlays.length,
			handPresenting: te,
			handPresentationPhase: N.phase,
			dealPresentationActive: cu(),
			trickCollectionActive: uu()
		});
	}, [
		j.isPipelineActive,
		j.phase,
		j.revealedCount,
		j.revealTarget,
		j.peakPlayCount,
		j.displayPlays.length,
		ee,
		te,
		N.phase,
		e.phase,
		P
	]);
	let I = Ka(e.phase), ne = (0, l.useMemo)(() => Tm({
		trumpHolderId: e.trumpHolderId ?? e.dealerId,
		trumpUpcard: e.trumpUpcard ?? null,
		trumpSuit: e.trumpSuit ?? null,
		phase: e.phase ?? null,
		handPresentation: {
			trumpRevealActive: N.trumpRevealActive,
			trumpMergeActive: N.trumpMergeActive,
			trumpMergedIntoHand: N.trumpMergedIntoHand
		}
	}), [
		e.trumpHolderId,
		e.dealerId,
		e.trumpUpcard,
		e.trumpSuit,
		e.phase,
		N.trumpRevealActive,
		N.trumpMergeActive,
		N.trumpMergedIntoHand
	]), L = (0, l.useMemo)(() => _g({
		rawHeroCards: p,
		effectiveHeroCards: f,
		playerId: d,
		trumpHolderId: e.trumpHolderId ?? e.dealerId,
		trumpUpcard: e.trumpUpcard ?? null,
		trumpSuit: e.trumpSuit ?? null,
		phase: e.phase ?? null,
		handPresentation: {
			trumpRevealActive: N.trumpRevealActive,
			trumpMergeActive: N.trumpMergeActive,
			trumpMergedIntoHand: N.trumpMergedIntoHand
		}
	}), [
		p,
		f,
		d,
		e.trumpHolderId,
		e.dealerId,
		e.trumpUpcard,
		e.trumpSuit,
		e.phase,
		N.trumpRevealActive,
		N.trumpMergeActive,
		N.trumpMergedIntoHand
	]), R = L.displayCards, z = (0, l.useMemo)(() => !h?.length || L.indexMode === "effective" ? h : hg(h, L.trumpDisabledIndex), [
		h,
		L.indexMode,
		L.trumpDisabledIndex
	]), B = (0, l.useMemo)(() => {
		if (!h?.length || !f.length) return null;
		let t = Yo(f.map(Ua), {
			trumpSuit: e.trumpSuit ?? "clubs",
			currentTrick: e.currentTrick ?? null,
			leadSuit: e.leadSuit ?? null,
			cinchEnabled: e.cinchEnabled === !0
		}, h);
		return t == null ? null : L.indexMode === "effective" ? t : hg([t], L.trumpDisabledIndex)[0] ?? null;
	}, [
		h,
		f,
		e.trumpSuit,
		e.currentTrick,
		e.leadSuit,
		e.cinchEnabled,
		L.indexMode,
		L.trumpDisabledIndex
	]), V = (0, l.useMemo)(() => {
		if (e.phase !== "draw" || !f.length) return [];
		let t = f.map(Ua), n = L.indexMode === "display" && L.trumpDisabledIndex != null ? gg([L.trumpDisabledIndex], L.trumpDisabledIndex) : L.trumpDisabledIndex == null ? [] : [L.trumpDisabledIndex], r = Xo(t, e.trumpSuit ?? "clubs", e.maxDrawDiscards ?? 4, e.remainingDeckCount ?? Infinity, n);
		return L.indexMode === "effective" ? r : hg(r, L.trumpDisabledIndex);
	}, [
		e.phase,
		f,
		e.trumpSuit,
		e.maxDrawDiscards,
		e.remainingDeckCount,
		L.indexMode,
		L.trumpDisabledIndex
	]), H = j.suppressTurnPlayerId || N.suppressTurnIndicator, re = Wa(e.phase, u), ie = H ? null : Ya(e.turnPlayerId, t), U = t.find((e) => e.isSelf), ae = d != null && e.participantIds.includes(d) && (e.phase === "draw" || e.phase === "play"), oe = s && !e.isFinal && !ae && !a && U?.isOut === !0 && !!b.onRebuy, se = Cm({
		currentUserId: d,
		session: e,
		suppressTurn: !!H,
		handComplete: v,
		enrollmentActive: u,
		selfPlayer: U
	}), ce = Sm({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: U,
		session: e,
		suppressTurn: !!H,
		handComplete: v
	}), le = wm({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: U,
		session: e,
		suppressTurn: !!H,
		handComplete: v
	}), { countdown: ue } = Ih({
		session: e,
		suppressTurn: !!H,
		handComplete: v
	}), de = ne.showTrumpSuitReminder || !e.trumpUpcard && !!e.trumpSuit && e.phase === "play", fe = (0, l.useMemo)(() => ({ ...j.displayTricksByPlayer }), [j.displayTricksByPlayer]), pe = (0, l.useMemo)(() => Object.fromEntries(t.map((e) => [e.playerId, Math.max(0, Number(e.bankroll) || 0)])), [t]), W = Lh({
		turnPlayerId: e.turnPlayerId ?? null,
		dealerId: e.dealerId,
		potAmount: N.displayPotAmount,
		tricksByPlayer: fe,
		bankrollByPlayer: pe,
		bourrePlayerIds: _ ?? [],
		phase: e.phase ?? null,
		showTrumpSuitReminder: de,
		suppressTurn: !!H,
		actionFeedbackStatus: y?.status ?? "idle",
		trickWinnerSeatId: j.trickWinnerSeatId,
		trickPhase: j.phase
	}), me = !!U?.playerId && (_ ?? []).includes(U.playerId) && W.bourreAlerts[U.playerId] === "pulse", he = (0, l.useRef)(0), ge = (0, l.useRef)(0);
	(0, l.useEffect)(() => {
		W.feedbackErrorPulse > he.current && Ll(), he.current = W.feedbackErrorPulse;
	}, [W.feedbackErrorPulse]), (0, l.useEffect)(() => {
		W.feedbackSuccessPulse > ge.current && Bl(), ge.current = W.feedbackSuccessPulse;
	}, [W.feedbackSuccessPulse]);
	let _e = (0, l.useCallback)((e) => {
		O(e, d ?? void 0);
	}, [O, d]), ve = (0, l.useMemo)(() => ({
		onToggleInHand: (e, n) => {
			t.find((t) => t.playerId === e)?.isSelf && b.onToggleInHand(n);
		},
		onPassEnrollment: (e) => {
			t.find((t) => t.playerId === e)?.isSelf && b.onPassEnrollment && b.onPassEnrollment();
		},
		onTrickDelta: (e, n) => {
			t.find((t) => t.playerId === e)?.isSelf && b.onTrickDelta(n);
		},
		onSubmitDraw: (e) => {
			if (!b.onSubmitDraw) return;
			let t = L.indexMode === "display" ? gg(e, L.trumpDisabledIndex) : e;
			return b.onSubmitDraw(t);
		},
		onPassDraw: b.onPassDraw,
		onFoldDraw: b.onFoldDraw,
		onPlayCard: (e) => {
			if (!b.onPlayCard) return;
			if (L.indexMode !== "display") return b.onPlayCard(e);
			let t = gg([e], L.trumpDisabledIndex)[0];
			if (t != null) return b.onPlayCard(t);
		},
		onReaction: _e
	}), [
		b,
		_e,
		t,
		L.indexMode,
		L.trumpDisabledIndex
	]), ye = {
		session: e,
		players: t,
		potMetrics: n,
		participantCount: T,
		enrollmentActive: u,
		heroCards: R,
		revealedTrumpIndex: L.revealedTrumpIndex,
		trumpMergeActive: L.trumpMergeActive,
		trumpDisabledIndex: L.trumpDisabledIndex,
		hideCenterTrump: L.hideCenterTrumpForHolder,
		showTrumpSuitReminder: de,
		trumpHolderPresentation: ne,
		privateHandReady: m,
		currentUserId: d,
		legalPlayIndices: z,
		recommendedPlayIndex: B,
		recommendedDiscardIndices: V,
		handComplete: v,
		actionFeedback: y,
		trickPresentation: j,
		handPresentation: N,
		microinteractions: W,
		instantTrickPlays: ee,
		turnCountdown: ue,
		bigPotEvent: k,
		onDismissTableEvent: D,
		...ve
	}, be = /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
		/* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-session__attention-layer",
			"aria-live": "polite",
			children: /* @__PURE__ */ (0, g.jsx)(Uh, {
				actionRequired: ce,
				activityKey: le
			})
		}),
		/* @__PURE__ */ (0, g.jsx)(Rh, {
			active: me,
			displayName: U?.displayName
		}),
		/* @__PURE__ */ (0, g.jsx)(Vm, {
			events: E,
			onDismiss: D
		}),
		/* @__PURE__ */ (0, g.jsx)(Rm, {
			events: E,
			onDismiss: D
		}),
		S ? /* @__PURE__ */ (0, g.jsx)(Im, { ...ye }) : /* @__PURE__ */ (0, g.jsx)(Om, { ...ye })
	] }), xe = (0, l.useRef)(!1);
	return (0, l.useEffect)(() => {
		xe.current = !1;
	}, [e.handNumber, e.sessionId]), (0, l.useEffect)(() => {
		if (e.phase !== "reveal" || N.anteAnimActive || N.trumpRevealActive || N.phase !== "drawPlayer" && N.phase !== "drawReady" || xe.current || !b.onAdvanceReveal) return;
		let t = b.onAdvanceReveal();
		Promise.resolve(t).then(() => {
			xe.current = !0;
		}, () => {
			xe.current = !1;
		});
	}, [
		e.phase,
		e.handNumber,
		e.sessionId,
		N.anteAnimActive,
		N.trumpRevealActive,
		N.phase,
		b
	]), (0, l.useEffect)(() => {
		let e = (e) => {
			(e.key === x.hotkeys.toggleSettings || e.key === "," && e.metaKey) && w((e) => !e), e.key === x.hotkeys.focusTable && document.querySelector(".btable-wrap")?.scrollIntoView({
				block: "center",
				behavior: "smooth"
			});
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [x.hotkeys]), (0, l.useEffect)(() => {
		let e = () => w(!0);
		return window.addEventListener("nbl-open-table-settings", e), () => window.removeEventListener("nbl-open-table-settings", e);
	}, []), /* @__PURE__ */ (0, g.jsxs)("div", {
		className: [
			"btable-session",
			S ? "btable-session--native-mobile btable-session--mobile-layout" : "",
			C ? "btable-session--settings-open" : "",
			Ja(e.phase) ? "btable-session--reveal-phase" : "",
			qa(e.phase) ? "btable-session--decision-phase" : ""
		].filter(Boolean).join(" "),
		"data-trick-resolving": j.isPipelineActive ? "true" : "false",
		"data-hand-settling": N.settleAnimActive ? "true" : "false",
		"data-hand-complete": v ? "true" : "false",
		children: [
			/* @__PURE__ */ (0, g.jsx)("header", {
				className: "btable-session__head",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, g.jsx)("span", {
					className: "btable-sr-only",
					"data-testid": "phase-tag",
					"data-phase": e.phase ?? "waiting",
					children: re
				})
			}),
			!S && /* @__PURE__ */ (0, g.jsxs)("p", {
				className: "btable-session__rotate-hint",
				role: "note",
				children: [
					"Rotate your phone to ",
					/* @__PURE__ */ (0, g.jsx)("strong", { children: "landscape" }),
					" for the full table (up to 8 players)."
				]
			}),
			S ? /* @__PURE__ */ (0, g.jsx)(Bm, { children: /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btable-stage",
				children: [/* @__PURE__ */ (0, g.jsx)(Wh, {
					actionFeedback: y,
					feedbackErrorPulse: W.feedbackErrorPulse,
					feedbackSuccessPulse: W.feedbackSuccessPulse,
					turnLabel: ie,
					isMyTurn: se,
					showTurn: !!(ie && I && j.phase === "live")
				}), be]
			}) }) : /* @__PURE__ */ (0, g.jsx)(zm, { children: /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btable-stage",
				children: [/* @__PURE__ */ (0, g.jsx)(Wh, {
					actionFeedback: y,
					feedbackErrorPulse: W.feedbackErrorPulse,
					feedbackSuccessPulse: W.feedbackSuccessPulse,
					turnLabel: ie,
					isMyTurn: se,
					showTurn: !!(ie && I && j.phase === "live")
				}), be]
			}) }),
			/* @__PURE__ */ (0, g.jsx)(qm, {
				open: C,
				onClose: () => w(!1)
			}),
			a && !e.isFinal && o && /* @__PURE__ */ (0, g.jsx)(fg, {
				session: e,
				players: t,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: A,
				onAgreeSplit: () => b.onSettle("split"),
				onDeclineSplit: () => b.onSettle("push"),
				onCarryover: () => b.onSettleCarryover?.()
			}),
			a && !e.isFinal && !o && /* @__PURE__ */ (0, g.jsx)(lg, {
				session: e,
				players: t,
				potMetrics: n,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: A,
				onSettle: (e) => b.onSettle(e)
			}),
			/* @__PURE__ */ (0, g.jsxs)("footer", {
				className: "btable-session__foot muted small",
				children: [
					/* @__PURE__ */ (0, g.jsx)(Hm, { compact: !0 }),
					/* @__PURE__ */ (0, g.jsx)(Um, {}),
					/* @__PURE__ */ (0, g.jsx)(Km, {}),
					oe && /* @__PURE__ */ (0, g.jsxs)("div", {
						className: "btable-session__rebuy-offer",
						children: [/* @__PURE__ */ (0, g.jsx)("p", {
							className: "btable-session__rebuy-copy",
							children: "You're out — rebuy to join the next hand."
						}), /* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--primary",
							"data-testid": "rebuy-button",
							onClick: () => void b.onRebuy?.(),
							children: "Rebuy"
						})]
					}),
					r == null ? /* @__PURE__ */ (0, g.jsx)(g.Fragment, { children: "Shared pot and game state only · sign in to track your ledger" }) : /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: ["Your session profit/loss ", dd(r)] })
				]
			})
		]
	});
}
//#endregion
//#region src/table/mount.tsx
var Sg = null, Cg = null;
function wg(e, t) {
	El(), ia(e), Cg !== e && (Sg?.unmount(), Sg = (0, u.createRoot)(e), Cg = e), Sg.render(/* @__PURE__ */ (0, g.jsx)(tu, { children: /* @__PURE__ */ (0, g.jsx)(xg, { ...t }) }));
}
function Tg() {
	Cg && (Tp(Cg), Xf(Cg)), Sg?.unmount(), Sg = null, Cg = null, ju(), fu();
}
//#endregion
export { Xf as clearDrawFlyGhosts, Tp as clearWonTrickCollectionArtifacts, Ou as evaluateBotPresentationGate, Du as forceReleasePresentationForBots, Fs as getAudioPlayMonitor, ms as getFeedbackPrefs, As as getTableAudioAudit, wu as getTablePresentationBlockReason, Mu as getTrickAnimationBusyState, Eu as handPresentingBlocksBots, El as initGameFeedback, Pu as isTablePresentationBusy, ku as isTablePresentationBusyForBots, Nu as isTrickAnimationBusy, wg as mountTableSession, Cc as playActionSound, wc as playAnimationSound, Ml as playBigWinFeedback, Pl as playBourreFeedback, Rl as playCardSelectFeedback, X as playDeleteRoomFeedback, kl as playDrawFeedback, Z as playFoldFeedback, Fl as playGameStartFeedback, Nl as playHandWinFeedback, Ll as playIllegalActionFeedback, Il as playOpenRoomFeedback, Tc as playOutcomeSound, jl as playPotWinFeedback, Dl as playShuffleFeedback, Al as playTrickWinFeedback, zl as playUiButtonFeedback, Ps as resetAudioPlayMonitor, Uc as resetSoundAssetCache, ks as resetTableAudioAudit, hs as saveFeedbackPrefs, vs as subscribeFeedbackPrefs, Fu as subscribeTrickAnimationBusy, Xs as unlockAudio, Tg as unmountTableSession };
