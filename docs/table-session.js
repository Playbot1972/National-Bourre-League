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
	}, L = [], R = -1;
	function z(e) {
		return { current: e };
	}
	function B(e) {
		0 > R || (e.current = L[R], L[R] = null, R--);
	}
	function V(e, t) {
		R++, L[R] = e.current, e.current = t;
	}
	var H = z(null), U = z(null), ne = z(null), re = z(null);
	function W(e, t) {
		switch (V(ne, t), V(U, e), V(H, null), t.nodeType) {
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
		B(H), V(H, e);
	}
	function ie() {
		B(H), B(U), B(ne);
	}
	function G(e) {
		e.memoizedState !== null && V(re, e);
		var t = H.current, n = Ud(t, e.type);
		t !== n && (V(U, e), V(H, n));
	}
	function ae(e) {
		U.current === e && (B(H), B(U)), re.current === e && (B(re), $f._currentValue = I);
	}
	var oe, se;
	function ce(e) {
		if (oe === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			oe = t && t[1] || "", se = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + oe + e + se;
	}
	var le = !1;
	function ue(e, t) {
		if (!e || le) return "";
		le = !0;
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
			le = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? ce(n) : "";
	}
	function de(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return ce(e.type);
			case 16: return ce("Lazy");
			case 13: return e.child !== t && t !== null ? ce("Suspense Fallback") : ce("Suspense");
			case 19: return ce("SuspenseList");
			case 0:
			case 15: return ue(e.type, !1);
			case 11: return ue(e.type.render, !1);
			case 1: return ue(e.type, !0);
			case 31: return ce("Activity");
			default: return "";
		}
	}
	function fe(e) {
		try {
			var t = "", n = null;
			do
				t += de(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var pe = Object.prototype.hasOwnProperty, me = t.unstable_scheduleCallback, he = t.unstable_cancelCallback, ge = t.unstable_shouldYield, _e = t.unstable_requestPaint, ve = t.unstable_now, ye = t.unstable_getCurrentPriorityLevel, be = t.unstable_ImmediatePriority, xe = t.unstable_UserBlockingPriority, Se = t.unstable_NormalPriority, Ce = t.unstable_LowPriority, we = t.unstable_IdlePriority, Te = t.log, Ee = t.unstable_setDisableYieldValue, De = null, K = null;
	function Oe(e) {
		if (typeof Te == "function" && Ee(e), K && typeof K.setStrictMode == "function") try {
			K.setStrictMode(De, e);
		} catch {}
	}
	var ke = Math.clz32 ? Math.clz32 : Me, Ae = Math.log, je = Math.LN2;
	function Me(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Ae(e) / je | 0) | 0;
	}
	var Ne = 256, Pe = 262144, Fe = 4194304;
	function q(e) {
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
	function Ie(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = q(n))) : i = q(o) : i = q(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = q(n))) : i = q(o)) : i = q(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function Le(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function Re(e, t) {
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
	function ze() {
		var e = Fe;
		return Fe <<= 1, !(Fe & 62914560) && (Fe = 4194304), e;
	}
	function Be(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function Ve(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function He(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - ke(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && Ue(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function Ue(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - ke(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function We(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - ke(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function Ge(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : Ke(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function Ke(e) {
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
	function qe(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function Je() {
		var e = F.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : hp(e.type)) : e;
	}
	function Ye(e, t) {
		var n = F.p;
		try {
			return F.p = e, t();
		} finally {
			F.p = n;
		}
	}
	var Xe = Math.random().toString(36).slice(2), Ze = "__reactFiber$" + Xe, Qe = "__reactProps$" + Xe, $e = "__reactContainer$" + Xe, et = "__reactEvents$" + Xe, tt = "__reactListeners$" + Xe, nt = "__reactHandles$" + Xe, rt = "__reactResources$" + Xe, it = "__reactMarker$" + Xe;
	function at(e) {
		delete e[Ze], delete e[Qe], delete e[et], delete e[tt], delete e[nt];
	}
	function ot(e) {
		var t = e[Ze];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[$e] || n[Ze]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = ff(e); e !== null;) {
					if (n = e[Ze]) return n;
					e = ff(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function st(e) {
		if (e = e[Ze] || e[$e]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function ct(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(s(33));
	}
	function lt(e) {
		var t = e[rt];
		return t ||= e[rt] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function ut(e) {
		e[it] = !0;
	}
	var dt = /* @__PURE__ */ new Set(), ft = {};
	function pt(e, t) {
		mt(e, t), mt(e + "Capture", t);
	}
	function mt(e, t) {
		for (ft[e] = t, e = 0; e < t.length; e++) dt.add(t[e]);
	}
	var ht = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), gt = {}, _t = {};
	function vt(e) {
		return pe.call(_t, e) ? !0 : pe.call(gt, e) ? !1 : ht.test(e) ? _t[e] = !0 : (gt[e] = !0, !1);
	}
	function yt(e, t, n) {
		if (vt(t)) if (n === null) e.removeAttribute(t);
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
	function bt(e, t, n) {
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
	function xt(e, t, n, r) {
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
	function St(e) {
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
	function Ct(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function wt(e, t, n) {
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
	function Tt(e) {
		if (!e._valueTracker) {
			var t = Ct(e) ? "checked" : "value";
			e._valueTracker = wt(e, t, "" + e[t]);
		}
	}
	function Et(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = Ct(e) ? e.checked ? "true" : "false" : e.value), e = r, e === n ? !1 : (t.setValue(e), !0);
	}
	function Dt(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	var Ot = /[\n"\\]/g;
	function kt(e) {
		return e.replace(Ot, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function At(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + St(t)) : e.value !== "" + St(t) && (e.value = "" + St(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : Mt(e, o, St(n)) : Mt(e, o, St(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + St(s) : e.removeAttribute("name");
	}
	function jt(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				Tt(e);
				return;
			}
			n = n == null ? "" : "" + St(n), t = t == null ? n : "" + St(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), Tt(e);
	}
	function Mt(e, t, n) {
		t === "number" && Dt(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
	}
	function Nt(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + St(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function Pt(e, t, n) {
		if (t != null && (t = "" + St(t), t !== e.value && (e.value = t), n == null)) {
			e.defaultValue !== t && (e.defaultValue = t);
			return;
		}
		e.defaultValue = n == null ? "" : "" + St(n);
	}
	function Ft(e, t, n, r) {
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
		n = St(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), Tt(e);
	}
	function It(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Lt = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function Rt(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || Lt.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function zt(e, t, n) {
		if (t != null && typeof t != "object") throw Error(s(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
			for (var i in t) r = t[i], t.hasOwnProperty(i) && n[i] !== r && Rt(e, i, r);
		} else for (var a in t) t.hasOwnProperty(a) && Rt(e, a, t[a]);
	}
	function Bt(e) {
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
	var Vt = new Map([
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
	]), Ht = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function Ut(e) {
		return Ht.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function Wt() {}
	var Gt = null;
	function Kt(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var qt = null, Jt = null;
	function Yt(e) {
		var t = st(e);
		if (t && (e = t.stateNode)) {
			var n = e[Qe] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (At(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + kt("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var i = r[Qe] || null;
								if (!i) throw Error(s(90));
								At(r, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && Et(r);
					}
					break a;
				case "textarea":
					Pt(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && Nt(e, !!n.multiple, t, !1);
			}
		}
	}
	var Xt = !1;
	function Zt(e, t, n) {
		if (Xt) return e(t, n);
		Xt = !0;
		try {
			return e(t);
		} finally {
			if (Xt = !1, (qt !== null || Jt !== null) && (yu(), qt && (t = qt, e = Jt, Jt = qt = null, Yt(t), e))) for (t = 0; t < e.length; t++) Yt(e[t]);
		}
	}
	function Qt(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[Qe] || null;
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
	var $t = !(typeof window > "u" || window.document === void 0 || window.document.createElement === void 0), en = !1;
	if ($t) try {
		var tn = {};
		Object.defineProperty(tn, "passive", { get: function() {
			en = !0;
		} }), window.addEventListener("test", tn, tn), window.removeEventListener("test", tn, tn);
	} catch {
		en = !1;
	}
	var nn = null, rn = null, an = null;
	function on() {
		if (an) return an;
		var e, t = rn, n = t.length, r, i = "value" in nn ? nn.value : nn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return an = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function sn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function cn() {
		return !0;
	}
	function ln() {
		return !1;
	}
	function un(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? cn : ln, this.isPropagationStopped = ln, this;
		}
		return h(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = cn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = cn);
			},
			persist: function() {},
			isPersistent: cn
		}), t;
	}
	var dn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, fn = un(dn), pn = h({}, dn, {
		view: 0,
		detail: 0
	}), mn = un(pn), hn, gn, _n, vn = h({}, pn, {
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
		getModifierState: kn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== _n && (_n && e.type === "mousemove" ? (hn = e.screenX - _n.screenX, gn = e.screenY - _n.screenY) : gn = hn = 0, _n = e), hn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : gn;
		}
	}), yn = un(vn), bn = un(h({}, vn, { dataTransfer: 0 })), xn = un(h({}, pn, { relatedTarget: 0 })), Sn = un(h({}, dn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Cn = un(h({}, dn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), wn = un(h({}, dn, { data: 0 })), Tn = {
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
	}, En = {
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
	}, Dn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function On(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Dn[e]) ? !!t[e] : !1;
	}
	function kn() {
		return On;
	}
	var An = un(h({}, pn, {
		key: function(e) {
			if (e.key) {
				var t = Tn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = sn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? En[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: kn,
		charCode: function(e) {
			return e.type === "keypress" ? sn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? sn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), jn = un(h({}, vn, {
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
	})), Mn = un(h({}, pn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: kn
	})), Nn = un(h({}, dn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Pn = un(h({}, vn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), Fn = un(h({}, dn, {
		newState: 0,
		oldState: 0
	})), In = [
		9,
		13,
		27,
		32
	], Ln = $t && "CompositionEvent" in window, Rn = null;
	$t && "documentMode" in document && (Rn = document.documentMode);
	var zn = $t && "TextEvent" in window && !Rn, Bn = $t && (!Ln || Rn && 8 < Rn && 11 >= Rn), Vn = " ", Hn = !1;
	function Un(e, t) {
		switch (e) {
			case "keyup": return In.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function Wn(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var Gn = !1;
	function Kn(e, t) {
		switch (e) {
			case "compositionend": return Wn(t);
			case "keypress": return t.which === 32 ? (Hn = !0, Vn) : null;
			case "textInput": return e = t.data, e === Vn && Hn ? null : e;
			default: return null;
		}
	}
	function qn(e, t) {
		if (Gn) return e === "compositionend" || !Ln && Un(e, t) ? (e = on(), an = rn = nn = null, Gn = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return Bn && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var Jn = {
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
	function Yn(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!Jn[e.type] : t === "textarea";
	}
	function Xn(e, t, n, r) {
		qt ? Jt ? Jt.push(r) : Jt = [r] : qt = r, t = Ed(t, "onChange"), 0 < t.length && (n = new fn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var Zn = null, Qn = null;
	function $n(e) {
		yd(e, 0);
	}
	function er(e) {
		if (Et(ct(e))) return e;
	}
	function tr(e, t) {
		if (e === "change") return t;
	}
	var nr = !1;
	if ($t) {
		var rr;
		if ($t) {
			var ir = "oninput" in document;
			if (!ir) {
				var ar = document.createElement("div");
				ar.setAttribute("oninput", "return;"), ir = typeof ar.oninput == "function";
			}
			rr = ir;
		} else rr = !1;
		nr = rr && (!document.documentMode || 9 < document.documentMode);
	}
	function or() {
		Zn && (Zn.detachEvent("onpropertychange", sr), Qn = Zn = null);
	}
	function sr(e) {
		if (e.propertyName === "value" && er(Qn)) {
			var t = [];
			Xn(t, Qn, e, Kt(e)), Zt($n, t);
		}
	}
	function cr(e, t, n) {
		e === "focusin" ? (or(), Zn = t, Qn = n, Zn.attachEvent("onpropertychange", sr)) : e === "focusout" && or();
	}
	function lr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return er(Qn);
	}
	function ur(e, t) {
		if (e === "click") return er(t);
	}
	function dr(e, t) {
		if (e === "input" || e === "change") return er(t);
	}
	function fr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var pr = typeof Object.is == "function" ? Object.is : fr;
	function mr(e, t) {
		if (pr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!pe.call(t, i) || !pr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function hr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function gr(e, t) {
		var n = hr(e);
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
			n = hr(n);
		}
	}
	function _r(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? _r(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function vr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Dt(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Dt(e.document);
		}
		return t;
	}
	function yr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var br = $t && "documentMode" in document && 11 >= document.documentMode, xr = null, Sr = null, Cr = null, wr = !1;
	function Tr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		wr || xr == null || xr !== Dt(r) || (r = xr, "selectionStart" in r && yr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Cr && mr(Cr, r) || (Cr = r, r = Ed(Sr, "onSelect"), 0 < r.length && (t = new fn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = xr)));
	}
	function Er(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Dr = {
		animationend: Er("Animation", "AnimationEnd"),
		animationiteration: Er("Animation", "AnimationIteration"),
		animationstart: Er("Animation", "AnimationStart"),
		transitionrun: Er("Transition", "TransitionRun"),
		transitionstart: Er("Transition", "TransitionStart"),
		transitioncancel: Er("Transition", "TransitionCancel"),
		transitionend: Er("Transition", "TransitionEnd")
	}, Or = {}, kr = {};
	$t && (kr = document.createElement("div").style, "AnimationEvent" in window || (delete Dr.animationend.animation, delete Dr.animationiteration.animation, delete Dr.animationstart.animation), "TransitionEvent" in window || delete Dr.transitionend.transition);
	function Ar(e) {
		if (Or[e]) return Or[e];
		if (!Dr[e]) return e;
		var t = Dr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in kr) return Or[e] = t[n];
		return e;
	}
	var jr = Ar("animationend"), Mr = Ar("animationiteration"), Nr = Ar("animationstart"), Pr = Ar("transitionrun"), Fr = Ar("transitionstart"), Ir = Ar("transitioncancel"), Lr = Ar("transitionend"), Rr = /* @__PURE__ */ new Map(), zr = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	zr.push("scrollEnd");
	function Br(e, t) {
		Rr.set(e, t), pt(t, [e]);
	}
	var Vr = typeof reportError == "function" ? reportError : function(e) {
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
	}, Hr = [], Ur = 0, Wr = 0;
	function Gr() {
		for (var e = Ur, t = Wr = Ur = 0; t < e;) {
			var n = Hr[t];
			Hr[t++] = null;
			var r = Hr[t];
			Hr[t++] = null;
			var i = Hr[t];
			Hr[t++] = null;
			var a = Hr[t];
			if (Hr[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Yr(n, i, a);
		}
	}
	function Kr(e, t, n, r) {
		Hr[Ur++] = e, Hr[Ur++] = t, Hr[Ur++] = n, Hr[Ur++] = r, Wr |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function qr(e, t, n, r) {
		return Kr(e, t, n, r), Xr(e);
	}
	function Jr(e, t) {
		return Kr(e, null, null, t), Xr(e);
	}
	function Yr(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - ke(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function Xr(e) {
		if (50 < uu) throw uu = 0, du = null, Error(s(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var Zr = {};
	function Qr(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function $r(e, t, n, r) {
		return new Qr(e, t, n, r);
	}
	function ei(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function ti(e, t) {
		var n = e.alternate;
		return n === null ? (n = $r(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function ni(e, t) {
		e.flags &= 65011714;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function ri(e, t, n, r, i, a) {
		var o = 0;
		if (r = e, typeof e == "function") ei(e) && (o = 1);
		else if (typeof e == "string") o = Wf(e, n, H.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (e) {
			case k: return e = $r(31, n, t, i), e.elementType = k, e.lanes = a, e;
			case y: return ii(n.children, i, a, t);
			case b:
				o = 8, i |= 24;
				break;
			case x: return e = $r(12, n, t, i | 2), e.elementType = x, e.lanes = a, e;
			case T: return e = $r(13, n, t, i), e.elementType = T, e.lanes = a, e;
			case E: return e = $r(19, n, t, i), e.elementType = E, e.lanes = a, e;
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
		return t = $r(o, n, t, i), t.elementType = e, t.type = r, t.lanes = a, t;
	}
	function ii(e, t, n, r) {
		return e = $r(7, e, r, t), e.lanes = n, e;
	}
	function ai(e, t, n) {
		return e = $r(6, e, null, t), e.lanes = n, e;
	}
	function oi(e) {
		var t = $r(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function si(e, t, n) {
		return t = $r(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var ci = /* @__PURE__ */ new WeakMap();
	function li(e, t) {
		if (typeof e == "object" && e) {
			var n = ci.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: fe(t)
			}, ci.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: fe(t)
		};
	}
	var ui = [], di = 0, fi = null, pi = 0, mi = [], hi = 0, gi = null, _i = 1, vi = "";
	function yi(e, t) {
		ui[di++] = pi, ui[di++] = fi, fi = e, pi = t;
	}
	function bi(e, t, n) {
		mi[hi++] = _i, mi[hi++] = vi, mi[hi++] = gi, gi = e;
		var r = _i;
		e = vi;
		var i = 32 - ke(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - ke(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, _i = 1 << 32 - ke(t) + i | n << i | r, vi = a + e;
		} else _i = 1 << a | n << i | r, vi = e;
	}
	function xi(e) {
		e.return !== null && (yi(e, 1), bi(e, 1, 0));
	}
	function Si(e) {
		for (; e === fi;) fi = ui[--di], ui[di] = null, pi = ui[--di], ui[di] = null;
		for (; e === gi;) gi = mi[--hi], mi[hi] = null, vi = mi[--hi], mi[hi] = null, _i = mi[--hi], mi[hi] = null;
	}
	function Ci(e, t) {
		mi[hi++] = _i, mi[hi++] = vi, mi[hi++] = gi, _i = t.id, vi = t.overflow, gi = e;
	}
	var wi = null, Ti = null, Ei = !1, Di = null, Oi = !1, ki = Error(s(519));
	function Ai(e) {
		throw Ii(li(Error(s(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), ki;
	}
	function ji(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[Ze] = e, t[Qe] = r, n) {
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
				Q("invalid", t), jt(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), Ft(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || Md(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = Wt), t = !0) : t = !1, t || Ai(e, !0);
	}
	function Mi(e) {
		for (wi = e.return; wi;) switch (wi.tag) {
			case 5:
			case 31:
			case 13:
				Oi = !1;
				return;
			case 27:
			case 3:
				Oi = !0;
				return;
			default: wi = wi.return;
		}
	}
	function Ni(e) {
		if (e !== wi) return !1;
		if (!Ei) return Mi(e), Ei = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || Wd(e.type, e.memoizedProps)), n = !n), n && Ti && Ai(e), Mi(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			Ti = df(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			Ti = df(e);
		} else t === 27 ? (t = Ti, Qd(e.type) ? (e = uf, uf = null, Ti = e) : Ti = t) : Ti = wi ? lf(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Pi() {
		Ti = wi = null, Ei = !1;
	}
	function Fi() {
		var e = Di;
		return e !== null && (Xl === null ? Xl = e : Xl.push.apply(Xl, e), Di = null), e;
	}
	function Ii(e) {
		Di === null ? Di = [e] : Di.push(e);
	}
	var Li = z(null), Ri = null, zi = null;
	function Bi(e, t, n) {
		V(Li, t._currentValue), t._currentValue = n;
	}
	function Vi(e) {
		e._currentValue = Li.current, B(Li);
	}
	function Hi(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Ui(e, t, n, r) {
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
						a.lanes |= n, c = a.alternate, c !== null && (c.lanes |= n), Hi(a.return, n, e), r || (o = null);
						break a;
					}
					a = c.next;
				}
			} else if (i.tag === 18) {
				if (o = i.return, o === null) throw Error(s(341));
				o.lanes |= n, a = o.alternate, a !== null && (a.lanes |= n), Hi(o, n, e), o = null;
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
	function Wi(e, t, n, r) {
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
					pr(i.pendingProps.value, o.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (i === re.current) {
				if (o = i.alternate, o === null) throw Error(s(387));
				o.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [$f] : e.push($f));
			}
			i = i.return;
		}
		e !== null && Ui(t, e, n, r), t.flags |= 262144;
	}
	function Gi(e) {
		for (e = e.firstContext; e !== null;) {
			if (!pr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function Ki(e) {
		Ri = e, zi = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function qi(e) {
		return Yi(Ri, e);
	}
	function Ji(e, t) {
		return Ri === null && Ki(e), Yi(e, t);
	}
	function Yi(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, zi === null) {
			if (e === null) throw Error(s(308));
			zi = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else zi = zi.next = t;
		return n;
	}
	var Xi = typeof AbortController < "u" ? AbortController : function() {
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
	}, Zi = t.unstable_scheduleCallback, Qi = t.unstable_NormalPriority, J = {
		$$typeof: C,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function $i() {
		return {
			controller: new Xi(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function ea(e) {
		e.refCount--, e.refCount === 0 && Zi(Qi, function() {
			e.controller.abort();
		});
	}
	var ta = null, na = 0, ra = 0, ia = null;
	function aa(e, t) {
		if (ta === null) {
			var n = ta = [];
			na = 0, ra = dd(), ia = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return na++, t.then(oa, oa), t;
	}
	function oa() {
		if (--na === 0 && ta !== null) {
			ia !== null && (ia.status = "fulfilled");
			var e = ta;
			ta = null, ra = 0, ia = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function sa(e, t) {
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
	var ca = P.S;
	P.S = function(e, t) {
		$l = ve(), typeof t == "object" && t && typeof t.then == "function" && aa(e, t), ca !== null && ca(e, t);
	};
	var la = z(null);
	function ua() {
		var e = la.current;
		return e === null ? Il.pooledCache : e;
	}
	function da(e, t) {
		t === null ? V(la, la.current) : V(la, t.pool);
	}
	function fa() {
		var e = ua();
		return e === null ? null : {
			parent: J._currentValue,
			pool: e
		};
	}
	var pa = Error(s(460)), ma = Error(s(474)), ha = Error(s(542)), ga = { then: function() {} };
	function _a(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function va(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Wt, Wt), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Sa(e), e;
			default:
				if (typeof t.status == "string") t.then(Wt, Wt);
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
					case "rejected": throw e = t.reason, Sa(e), e;
				}
				throw ba = t, pa;
		}
	}
	function ya(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (ba = e, pa) : e;
		}
	}
	var ba = null;
	function xa() {
		if (ba === null) throw Error(s(459));
		var e = ba;
		return ba = null, e;
	}
	function Sa(e) {
		if (e === pa || e === ha) throw Error(s(483));
	}
	var Ca = null, wa = 0;
	function Ta(e) {
		var t = wa;
		return wa += 1, Ca === null && (Ca = []), va(Ca, e, t);
	}
	function Ea(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function Da(e, t) {
		throw t.$$typeof === g ? Error(s(525)) : (e = Object.prototype.toString.call(t), Error(s(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function Oa(e) {
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
			return e = ti(e, t), e.index = 0, e.sibling = null, e;
		}
		function a(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 67108866, n) : (r = r.index, r < n ? (t.flags |= 67108866, n) : r)) : (t.flags |= 1048576, n);
		}
		function o(t) {
			return e && t.alternate === null && (t.flags |= 67108866), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = ai(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === y ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === O && ya(a) === t.type) ? (t = i(t, n.props), Ea(t, n), t.return = e, t) : (t = ri(n.type, n.key, n.props, null, e.mode, r), Ea(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = si(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = ii(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = ai("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case _: return n = ri(t.type, t.key, t.props, null, e.mode, n), Ea(n, t), n.return = e, n;
					case v: return t = si(t, e.mode, n), t.return = e, t;
					case O: return t = ya(t), f(e, t, n);
				}
				if (te(t) || M(t)) return t = ii(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, Ta(t), n);
				if (t.$$typeof === C) return f(e, Ji(e, t), n);
				Da(e, t);
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
					case O: return n = ya(n), p(e, t, n, r);
				}
				if (te(n) || M(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, Ta(n), r);
				if (n.$$typeof === C) return p(e, t, Ji(e, n), r);
				Da(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case _: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case v: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case O: return r = ya(r), m(e, t, n, r, i);
				}
				if (te(r) || M(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, Ta(r), i);
				if (r.$$typeof === C) return m(e, t, n, Ji(t, r), i);
				Da(t, r);
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
			if (h === s.length) return n(i, d), Ei && yi(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return Ei && yi(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), Ei && yi(i, h), l;
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
			if (v.done) return n(i, h), Ei && yi(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
				return Ei && yi(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), Ei && yi(i, g), u;
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
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === O && ya(l) === r.type) {
										n(e, r.sibling), c = i(r, a.props), Ea(c, a), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								} else t(e, r);
								r = r.sibling;
							}
							a.type === y ? (c = ii(a.props.children, e.mode, c, a.key), c.return = e, e = c) : (c = ri(a.type, a.key, a.props, null, e.mode, c), Ea(c, a), c.return = e, e = c);
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
							c = si(a, e.mode, c), c.return = e, e = c;
						}
						return o(e);
					case O: return a = ya(a), b(e, r, a, c);
				}
				if (te(a)) return h(e, r, a, c);
				if (M(a)) {
					if (l = M(a), typeof l != "function") throw Error(s(150));
					return a = l.call(a), g(e, r, a, c);
				}
				if (typeof a.then == "function") return b(e, r, Ta(a), c);
				if (a.$$typeof === C) return b(e, r, Ji(e, a), c);
				Da(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), c = i(r, a), c.return = e, e = c) : (n(e, r), c = ai(a, e.mode, c), c.return = e, e = c), o(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				wa = 0;
				var i = b(e, t, n, r);
				return Ca = null, i;
			} catch (t) {
				if (t === pa || t === ha) throw t;
				var a = $r(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var ka = Oa(!0), Aa = Oa(!1), ja = !1;
	function Ma(e) {
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
	function Na(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function Pa(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function Fa(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, Fl & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = Xr(e), Yr(e, null, n), t;
		}
		return Kr(e, r, t, n), Xr(e);
	}
	function Ia(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, We(e, n);
		}
	}
	function La(e, t) {
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
	var Ra = !1;
	function za() {
		if (Ra) {
			var e = ia;
			if (e !== null) throw e;
		}
	}
	function Ba(e, t, n, r) {
		Ra = !1;
		var i = e.updateQueue;
		ja = !1;
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
					f !== 0 && f === ra && (Ra = !0), u !== null && (u = u.next = {
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
							case 2: ja = !0;
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
	function Va(e, t) {
		if (typeof e != "function") throw Error(s(191, e));
		e.call(t);
	}
	function Ha(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) Va(n[e], t);
	}
	var Ua = z(null), Wa = z(0);
	function Ga(e, t) {
		e = Hl, V(Wa, e), V(Ua, t), Hl = e | t.baseLanes;
	}
	function Ka() {
		V(Wa, Hl), V(Ua, Ua.current);
	}
	function qa() {
		Hl = Wa.current, B(Ua), B(Wa);
	}
	var Ja = z(null), Ya = null;
	function Xa(e) {
		var t = e.alternate;
		V(to, to.current & 1), V(Ja, e), Ya === null && (t === null || Ua.current !== null || t.memoizedState !== null) && (Ya = e);
	}
	function Za(e) {
		V(to, to.current), V(Ja, e), Ya === null && (Ya = e);
	}
	function Qa(e) {
		e.tag === 22 ? (V(to, to.current), V(Ja, e), Ya === null && (Ya = e)) : $a(e);
	}
	function $a() {
		V(to, to.current), V(Ja, Ja.current);
	}
	function eo(e) {
		B(Ja), Ya === e && (Ya = null), B(to);
	}
	var to = z(0);
	function no(e) {
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
	var ro = 0, Y = null, io = null, ao = null, oo = !1, so = !1, co = !1, lo = 0, uo = 0, fo = null, po = 0;
	function mo() {
		throw Error(s(321));
	}
	function ho(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!pr(e[n], t[n])) return !1;
		return !0;
	}
	function go(e, t, n, r, i, a) {
		return ro = a, Y = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, P.H = e === null || e.memoizedState === null ? Ns : Ps, co = !1, a = n(r, i), co = !1, so && (a = vo(t, n, r, i)), _o(e), a;
	}
	function _o(e) {
		P.H = Ms;
		var t = io !== null && io.next !== null;
		if (ro = 0, ao = io = Y = null, oo = !1, uo = 0, fo = null, t) throw Error(s(300));
		e === null || Zs || (e = e.dependencies, e !== null && Gi(e) && (Zs = !0));
	}
	function vo(e, t, n, r) {
		Y = e;
		var i = 0;
		do {
			if (so && (fo = null), uo = 0, so = !1, 25 <= i) throw Error(s(301));
			if (i += 1, ao = io = null, e.updateQueue != null) {
				var a = e.updateQueue;
				a.lastEffect = null, a.events = null, a.stores = null, a.memoCache != null && (a.memoCache.index = 0);
			}
			P.H = Fs, a = t(n, r);
		} while (so);
		return a;
	}
	function yo() {
		var e = P.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? Eo(t) : t, e = e.useState()[0], (io === null ? null : io.memoizedState) !== e && (Y.flags |= 1024), t;
	}
	function bo() {
		var e = lo !== 0;
		return lo = 0, e;
	}
	function xo(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function So(e) {
		if (oo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			oo = !1;
		}
		ro = 0, ao = io = Y = null, so = !1, uo = lo = 0, fo = null;
	}
	function Co() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return ao === null ? Y.memoizedState = ao = e : ao = ao.next = e, ao;
	}
	function wo() {
		if (io === null) {
			var e = Y.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = io.next;
		var t = ao === null ? Y.memoizedState : ao.next;
		if (t !== null) ao = t, io = e;
		else {
			if (e === null) throw Y.alternate === null ? Error(s(467)) : Error(s(310));
			io = e, e = {
				memoizedState: io.memoizedState,
				baseState: io.baseState,
				baseQueue: io.baseQueue,
				queue: io.queue,
				next: null
			}, ao === null ? Y.memoizedState = ao = e : ao = ao.next = e;
		}
		return ao;
	}
	function To() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function Eo(e) {
		var t = uo;
		return uo += 1, fo === null && (fo = []), e = va(fo, e, t), t = Y, (ao === null ? t.memoizedState : ao.next) === null && (t = t.alternate, P.H = t === null || t.memoizedState === null ? Ns : Ps), e;
	}
	function Do(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return Eo(e);
			if (e.$$typeof === C) return qi(e);
		}
		throw Error(s(438, String(e)));
	}
	function Oo(e) {
		var t = null, n = Y.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = Y.alternate;
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
		}, n === null && (n = To(), Y.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = A;
		return t.index++, n;
	}
	function ko(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function Ao(e) {
		return jo(wo(), io, e);
	}
	function jo(e, t, n) {
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
				if (f === u.lane ? (ro & f) === f : (Z & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === ra && (d = !0);
					else if ((ro & p) === p) {
						u = u.next, p === ra && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, o = a) : l = l.next = f, Y.lanes |= p, Wl |= p;
					f = u.action, co && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, o = a) : l = l.next = p, Y.lanes |= f, Wl |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? o = a : l.next = c, !pr(a, e.memoizedState) && (Zs = !0, d && (n = ia, n !== null))) throw n;
			e.memoizedState = a, e.baseState = o, e.baseQueue = l, r.lastRenderedState = a;
		}
		return i === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function Mo(e) {
		var t = wo(), n = t.queue;
		if (n === null) throw Error(s(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, a = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var o = i = i.next;
			do
				a = e(a, o.action), o = o.next;
			while (o !== i);
			pr(a, t.memoizedState) || (Zs = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function No(e, t, n) {
		var r = Y, i = wo(), a = Ei;
		if (a) {
			if (n === void 0) throw Error(s(407));
			n = n();
		} else n = t();
		var o = !pr((io || i).memoizedState, n);
		if (o && (i.memoizedState = n, Zs = !0), i = i.queue, is(Io.bind(null, r, i, e), [e]), i.getSnapshot !== t || o || ao !== null && ao.memoizedState.tag & 1) {
			if (r.flags |= 2048, $o(9, { destroy: void 0 }, Fo.bind(null, r, i, n, t), null), Il === null) throw Error(s(349));
			a || ro & 127 || Po(r, t, n);
		}
		return n;
	}
	function Po(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = Y.updateQueue, t === null ? (t = To(), Y.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function Fo(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Lo(t) && Ro(e);
	}
	function Io(e, t, n) {
		return n(function() {
			Lo(t) && Ro(e);
		});
	}
	function Lo(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !pr(e, n);
		} catch {
			return !0;
		}
	}
	function Ro(e) {
		var t = Jr(e, 2);
		t !== null && mu(t, e, 2);
	}
	function zo(e) {
		var t = Co();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), co) {
				Oe(!0);
				try {
					n();
				} finally {
					Oe(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: ko,
			lastRenderedState: e
		}, t;
	}
	function Bo(e, t, n, r) {
		return e.baseState = n, jo(e, io, typeof r == "function" ? r : ko);
	}
	function Vo(e, t, n, r, i) {
		if (ks(e)) throw Error(s(485));
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
			P.T === null ? a.isTransition = !1 : n(!0), r(a), n = t.pending, n === null ? (a.next = t.pending = a, Ho(t, a)) : (a.next = n.next, t.pending = n.next = a);
		}
	}
	function Ho(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = P.T, o = {};
			P.T = o;
			try {
				var s = n(i, r), c = P.S;
				c !== null && c(o, s), Uo(e, t, s);
			} catch (n) {
				Go(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), P.T = a;
			}
		} else try {
			a = n(i, r), Uo(e, t, a);
		} catch (n) {
			Go(e, t, n);
		}
	}
	function Uo(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Wo(e, t, n);
		}, function(n) {
			return Go(e, t, n);
		}) : Wo(e, t, n);
	}
	function Wo(e, t, n) {
		t.status = "fulfilled", t.value = n, Ko(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Ho(e, n)));
	}
	function Go(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, Ko(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function Ko(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function qo(e, t) {
		return t;
	}
	function Jo(e, t) {
		if (Ei) {
			var n = Il.formState;
			if (n !== null) {
				a: {
					var r = Y;
					if (Ei) {
						if (Ti) {
							b: {
								for (var i = Ti, a = Oi; i.nodeType !== 8;) {
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
								Ti = lf(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						Ai(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = Co(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: qo,
			lastRenderedState: t
		}, n.queue = r, n = Es.bind(null, Y, r), r.dispatch = n, r = zo(!1), a = Os.bind(null, Y, !1, r.queue), r = Co(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Vo.bind(null, Y, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function Yo(e) {
		return Xo(wo(), io, e);
	}
	function Xo(e, t, n) {
		if (t = jo(e, t, qo)[0], e = Ao(ko)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = Eo(t);
		} catch (e) {
			throw e === pa ? ha : e;
		}
		else r = t;
		t = wo();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (Y.flags |= 2048, $o(9, { destroy: void 0 }, Zo.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function Zo(e, t) {
		e.action = t;
	}
	function Qo(e) {
		var t = wo(), n = io;
		if (n !== null) return Xo(t, n, e);
		wo(), t = t.memoizedState, n = wo();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function $o(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = Y.updateQueue, t === null && (t = To(), Y.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function es() {
		return wo().memoizedState;
	}
	function ts(e, t, n, r) {
		var i = Co();
		Y.flags |= e, i.memoizedState = $o(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function ns(e, t, n, r) {
		var i = wo();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		io !== null && r !== null && ho(r, io.memoizedState.deps) ? i.memoizedState = $o(t, a, n, r) : (Y.flags |= e, i.memoizedState = $o(1 | t, a, n, r));
	}
	function rs(e, t) {
		ts(8390656, 8, e, t);
	}
	function is(e, t) {
		ns(2048, 8, e, t);
	}
	function as(e) {
		Y.flags |= 4;
		var t = Y.updateQueue;
		if (t === null) t = To(), Y.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function os(e) {
		var t = wo().memoizedState;
		return as({
			ref: t,
			nextImpl: e
		}), function() {
			if (Fl & 2) throw Error(s(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function ss(e, t) {
		return ns(4, 2, e, t);
	}
	function cs(e, t) {
		return ns(4, 4, e, t);
	}
	function ls(e, t) {
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
	function us(e, t, n) {
		n = n == null ? null : n.concat([e]), ns(4, 4, ls.bind(null, t, e), n);
	}
	function ds() {}
	function fs(e, t) {
		var n = wo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && ho(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function ps(e, t) {
		var n = wo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && ho(t, r[1])) return r[0];
		if (r = e(), co) {
			Oe(!0);
			try {
				e();
			} finally {
				Oe(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function ms(e, t, n) {
		return n === void 0 || ro & 1073741824 && !(Z & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = pu(), Y.lanes |= e, Wl |= e, n);
	}
	function hs(e, t, n, r) {
		return pr(n, t) ? n : Ua.current === null ? !(ro & 42) || ro & 1073741824 && !(Z & 261930) ? (Zs = !0, e.memoizedState = n) : (e = pu(), Y.lanes |= e, Wl |= e, t) : (e = ms(e, n, r), pr(e, t) || (Zs = !0), e);
	}
	function gs(e, t, n, r, i) {
		var a = F.p;
		F.p = a !== 0 && 8 > a ? a : 8;
		var o = P.T, s = {};
		P.T = s, Os(e, !1, t, n);
		try {
			var c = i(), l = P.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? Ds(e, t, sa(c, r), fu(e)) : Ds(e, t, r, fu(e));
		} catch (n) {
			Ds(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, fu());
		} finally {
			F.p = a, o !== null && s.types !== null && (o.types = s.types), P.T = o;
		}
	}
	function _s() {}
	function vs(e, t, n, r) {
		if (e.tag !== 5) throw Error(s(476));
		var i = ys(e).queue;
		gs(e, i, t, I, n === null ? _s : function() {
			return bs(e), n(r);
		});
	}
	function ys(e) {
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
				lastRenderedReducer: ko,
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
				lastRenderedReducer: ko,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function bs(e) {
		var t = ys(e);
		t.next === null && (t = e.alternate.memoizedState), Ds(e, t.next.queue, {}, fu());
	}
	function xs() {
		return qi($f);
	}
	function Ss() {
		return wo().memoizedState;
	}
	function Cs() {
		return wo().memoizedState;
	}
	function ws(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = fu();
					e = Pa(n);
					var r = Fa(t, e, n);
					r !== null && (mu(r, t, n), Ia(r, t, n)), t = { cache: $i() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function Ts(e, t, n) {
		var r = fu();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, ks(e) ? As(t, n) : (n = qr(e, t, n, r), n !== null && (mu(n, e, r), js(n, t, r)));
	}
	function Es(e, t, n) {
		Ds(e, t, n, fu());
	}
	function Ds(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (ks(e)) As(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, pr(s, o)) return Kr(e, t, i, 0), Il === null && Gr(), !1;
			} catch {}
			if (n = qr(e, t, i, r), n !== null) return mu(n, e, r), js(n, t, r), !0;
		}
		return !1;
	}
	function Os(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: dd(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, ks(e)) {
			if (t) throw Error(s(479));
		} else t = qr(e, n, r, 2), t !== null && mu(t, e, 2);
	}
	function ks(e) {
		var t = e.alternate;
		return e === Y || t !== null && t === Y;
	}
	function As(e, t) {
		so = oo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function js(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, We(e, n);
		}
	}
	var Ms = {
		readContext: qi,
		use: Do,
		useCallback: mo,
		useContext: mo,
		useEffect: mo,
		useImperativeHandle: mo,
		useLayoutEffect: mo,
		useInsertionEffect: mo,
		useMemo: mo,
		useReducer: mo,
		useRef: mo,
		useState: mo,
		useDebugValue: mo,
		useDeferredValue: mo,
		useTransition: mo,
		useSyncExternalStore: mo,
		useId: mo,
		useHostTransitionStatus: mo,
		useFormState: mo,
		useActionState: mo,
		useOptimistic: mo,
		useMemoCache: mo,
		useCacheRefresh: mo
	};
	Ms.useEffectEvent = mo;
	var Ns = {
		readContext: qi,
		use: Do,
		useCallback: function(e, t) {
			return Co().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: qi,
		useEffect: rs,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), ts(4194308, 4, ls.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return ts(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			ts(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = Co();
			t = t === void 0 ? null : t;
			var r = e();
			if (co) {
				Oe(!0);
				try {
					e();
				} finally {
					Oe(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = Co();
			if (n !== void 0) {
				var i = n(t);
				if (co) {
					Oe(!0);
					try {
						n(t);
					} finally {
						Oe(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = Ts.bind(null, Y, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = Co();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = zo(e);
			var t = e.queue, n = Es.bind(null, Y, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: ds,
		useDeferredValue: function(e, t) {
			return ms(Co(), e, t);
		},
		useTransition: function() {
			var e = zo(!1);
			return e = gs.bind(null, Y, e.queue, !0, !1), Co().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = Y, i = Co();
			if (Ei) {
				if (n === void 0) throw Error(s(407));
				n = n();
			} else {
				if (n = t(), Il === null) throw Error(s(349));
				Z & 127 || Po(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, rs(Io.bind(null, r, a, e), [e]), r.flags |= 2048, $o(9, { destroy: void 0 }, Fo.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = Co(), t = Il.identifierPrefix;
			if (Ei) {
				var n = vi, r = _i;
				n = (r & ~(1 << 32 - ke(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = lo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = po++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: xs,
		useFormState: Jo,
		useActionState: Jo,
		useOptimistic: function(e) {
			var t = Co();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = Os.bind(null, Y, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: Oo,
		useCacheRefresh: function() {
			return Co().memoizedState = ws.bind(null, Y);
		},
		useEffectEvent: function(e) {
			var t = Co(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (Fl & 2) throw Error(s(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, Ps = {
		readContext: qi,
		use: Do,
		useCallback: fs,
		useContext: qi,
		useEffect: is,
		useImperativeHandle: us,
		useInsertionEffect: ss,
		useLayoutEffect: cs,
		useMemo: ps,
		useReducer: Ao,
		useRef: es,
		useState: function() {
			return Ao(ko);
		},
		useDebugValue: ds,
		useDeferredValue: function(e, t) {
			return hs(wo(), io.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Ao(ko)[0], t = wo().memoizedState;
			return [typeof e == "boolean" ? e : Eo(e), t];
		},
		useSyncExternalStore: No,
		useId: Ss,
		useHostTransitionStatus: xs,
		useFormState: Yo,
		useActionState: Yo,
		useOptimistic: function(e, t) {
			return Bo(wo(), io, e, t);
		},
		useMemoCache: Oo,
		useCacheRefresh: Cs
	};
	Ps.useEffectEvent = os;
	var Fs = {
		readContext: qi,
		use: Do,
		useCallback: fs,
		useContext: qi,
		useEffect: is,
		useImperativeHandle: us,
		useInsertionEffect: ss,
		useLayoutEffect: cs,
		useMemo: ps,
		useReducer: Mo,
		useRef: es,
		useState: function() {
			return Mo(ko);
		},
		useDebugValue: ds,
		useDeferredValue: function(e, t) {
			var n = wo();
			return io === null ? ms(n, e, t) : hs(n, io.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Mo(ko)[0], t = wo().memoizedState;
			return [typeof e == "boolean" ? e : Eo(e), t];
		},
		useSyncExternalStore: No,
		useId: Ss,
		useHostTransitionStatus: xs,
		useFormState: Qo,
		useActionState: Qo,
		useOptimistic: function(e, t) {
			var n = wo();
			return io === null ? (n.baseState = e, [e, n.queue.dispatch]) : Bo(n, io, e, t);
		},
		useMemoCache: Oo,
		useCacheRefresh: Cs
	};
	Fs.useEffectEvent = os;
	function Is(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : h({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var Ls = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = fu(), i = Pa(r);
			i.payload = t, n != null && (i.callback = n), t = Fa(e, i, r), t !== null && (mu(t, e, r), Ia(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = fu(), i = Pa(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = Fa(e, i, r), t !== null && (mu(t, e, r), Ia(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = fu(), r = Pa(n);
			r.tag = 2, t != null && (r.callback = t), t = Fa(e, r, n), t !== null && (mu(t, e, n), Ia(t, e, n));
		}
	};
	function Rs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !mr(n, r) || !mr(i, a) : !0;
	}
	function zs(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Ls.enqueueReplaceState(t, t.state, null);
	}
	function Bs(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = h({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Vs(e) {
		Vr(e);
	}
	function Hs(e) {
		console.error(e);
	}
	function Us(e) {
		Vr(e);
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
		return n = Pa(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Ws(e, t);
		}, n;
	}
	function qs(e) {
		return e = Pa(e), e.tag = 3, e;
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
			if (t = n.alternate, t !== null && Wi(t, n, i, !0), n = Ja.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return Ya === null ? Eu() : n.alternate === null && Ul === 0 && (Ul = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === ga ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = new Set([r]) : t.add(r), Gu(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === ga ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = new Set([r]) : n.add(r)), Gu(e, r, i)), !1;
				}
				throw Error(s(435, n.tag));
			}
			return Gu(e, r, i), Eu(), !1;
		}
		if (Ei) return t = Ja.current, t === null ? (r !== ki && (t = Error(s(423), { cause: r }), Ii(li(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = li(r, n), i = Ks(e.stateNode, r, i), La(e, i), Ul !== 4 && (Ul = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== ki && (e = Error(s(422), { cause: r }), Ii(li(e, n)))), !1;
		var a = Error(s(520), { cause: r });
		if (a = li(a, n), Yl === null ? Yl = [a] : Yl.push(a), Ul !== 4 && (Ul = 2), t === null) return !0;
		r = li(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = Ks(n.stateNode, r, e), La(n, e), !1;
				case 1: if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (nu === null || !nu.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = qs(i), Js(i, e, n, r), La(n, i), !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Xs = Error(s(461)), Zs = !1;
	function Qs(e, t, n, r) {
		t.child = e === null ? Aa(t, null, n, r) : ka(t, e.child, n, r);
	}
	function $s(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Ki(t), r = go(e, t, n, o, a, i), s = bo(), e !== null && !Zs ? (xo(e, t, i), Cc(e, t, i)) : (Ei && s && xi(t), t.flags |= 1, Qs(e, t, r, i), t.child);
	}
	function ec(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ei(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, tc(e, t, a, r, i)) : (e = ri(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !wc(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? mr : n, n(o, r) && e.ref === t.ref) return Cc(e, t, i);
		}
		return t.flags |= 1, e = ti(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function tc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (mr(a, r) && e.ref === t.ref) if (Zs = !1, t.pendingProps = r = a, wc(e, i)) e.flags & 131072 && (Zs = !0);
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
			}, e !== null && da(t, a === null ? null : a.cachePool), a === null ? Ka() : Ga(t, a), Qa(t);
			else return r = t.lanes = 536870912, ic(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && da(t, null), Ka(), $a(t)) : (da(t, a.cachePool), Ga(t, a), $a(t), t.memoizedState = null);
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
		var a = ua();
		return a = a === null ? null : {
			parent: J._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && da(t, null), Ka(), Qa(t), e !== null && Wi(e, t, r, !0), t.childLanes = i, null;
	}
	function ac(e, t) {
		return t = vc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function oc(e, t, n) {
		return ka(t, e.child, null, n), e = ac(t, t.pendingProps), e.flags |= 2, eo(t), t.memoizedState = null, e;
	}
	function sc(e, t, n) {
		var r = t.pendingProps, i = (t.flags & 128) != 0;
		if (t.flags &= -129, e === null) {
			if (Ei) {
				if (r.mode === "hidden") return e = ac(t, r), t.lanes = 536870912, rc(null, e);
				if (Za(t), (e = Ti) ? (e = af(e, Oi), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: gi === null ? null : {
						id: _i,
						overflow: vi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = oi(e), n.return = t, t.child = n, wi = t, Ti = null)) : e = null, e === null) throw Ai(t);
				return t.lanes = 536870912, null;
			}
			return ac(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var o = a.dehydrated;
			if (Za(t), i) if (t.flags & 256) t.flags &= -257, t = oc(e, t, n);
			else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
			else throw Error(s(558));
			else if (Zs || Wi(e, t, n, !1), i = (n & e.childLanes) !== 0, Zs || i) {
				if (r = Il, r !== null && (o = Ge(r, n), o !== 0 && o !== a.retryLane)) throw a.retryLane = o, Jr(e, o), mu(r, e, o), Xs;
				Eu(), t = oc(e, t, n);
			} else e = a.treeContext, Ti = lf(o.nextSibling), wi = t, Ei = !0, Di = null, Oi = !1, e !== null && Ci(t, e), t = ac(t, r), t.flags |= 4096;
			return t;
		}
		return e = ti(e.child, {
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
		return Ki(t), n = go(e, t, n, r, void 0, i), r = bo(), e !== null && !Zs ? (xo(e, t, i), Cc(e, t, i)) : (Ei && r && xi(t), t.flags |= 1, Qs(e, t, n, i), t.child);
	}
	function uc(e, t, n, r, i, a) {
		return Ki(t), t.updateQueue = null, n = vo(t, r, n, i), _o(e), r = bo(), e !== null && !Zs ? (xo(e, t, a), Cc(e, t, a)) : (Ei && r && xi(t), t.flags |= 1, Qs(e, t, n, a), t.child);
	}
	function dc(e, t, n, r, i) {
		if (Ki(t), t.stateNode === null) {
			var a = Zr, o = n.contextType;
			typeof o == "object" && o && (a = qi(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Ls, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Ma(t), o = n.contextType, a.context = typeof o == "object" && o ? qi(o) : Zr, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Is(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Ls.enqueueReplaceState(a, a.state, null), Ba(t, r, a, i), za(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Bs(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = Zr, typeof u == "object" && u && (o = qi(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && zs(t, a, r, o), ja = !1;
			var f = t.memoizedState;
			a.state = f, Ba(t, r, a, i), za(), l = t.memoizedState, s || f !== l || ja ? (typeof d == "function" && (Is(t, n, d, r), l = t.memoizedState), (c = ja || Rs(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Na(e, t), o = t.memoizedProps, u = Bs(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = Zr, typeof l == "object" && l && (c = qi(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && zs(t, a, r, c), ja = !1, f = t.memoizedState, a.state = f, Ba(t, r, a, i), za();
			var p = t.memoizedState;
			o !== d || f !== p || ja || e !== null && e.dependencies !== null && Gi(e.dependencies) ? (typeof s == "function" && (Is(t, n, s, r), p = t.memoizedState), (u = ja || Rs(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Gi(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, cc(e, t), r = (t.flags & 128) != 0, a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = ka(t, e.child, null, i), t.child = ka(t, null, n, i)) : Qs(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = Cc(e, t, i), e;
	}
	function fc(e, t, n, r) {
		return Pi(), t.flags |= 256, Qs(e, t, n, r), t.child;
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
			cachePool: fa()
		};
	}
	function hc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ql), e;
	}
	function gc(e, t, n) {
		var r = t.pendingProps, i = !1, a = (t.flags & 128) != 0, o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : (to.current & 2) != 0), o && (i = !0, t.flags &= -129), o = (t.flags & 32) != 0, t.flags &= -33, e === null) {
			if (Ei) {
				if (i ? Xa(t) : $a(t), (e = Ti) ? (e = af(e, Oi), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: gi === null ? null : {
						id: _i,
						overflow: vi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = oi(e), n.return = t, t.child = n, wi = t, Ti = null)) : e = null, e === null) throw Ai(t);
				return sf(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var c = r.children;
			return r = r.fallback, i ? ($a(t), i = t.mode, c = vc({
				mode: "hidden",
				children: c
			}, i), r = ii(r, i, n, null), c.return = t, r.return = t, c.sibling = r, t.child = c, r = t.child, r.memoizedState = mc(n), r.childLanes = hc(e, o, n), t.memoizedState = pc, rc(null, r)) : (Xa(t), _c(t, c));
		}
		var l = e.memoizedState;
		if (l !== null && (c = l.dehydrated, c !== null)) {
			if (a) t.flags & 256 ? (Xa(t), t.flags &= -257, t = yc(e, t, n)) : t.memoizedState === null ? ($a(t), c = r.fallback, i = t.mode, r = vc({
				mode: "visible",
				children: r.children
			}, i), c = ii(c, i, n, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, ka(t, e.child, null, n), r = t.child, r.memoizedState = mc(n), r.childLanes = hc(e, o, n), t.memoizedState = pc, t = rc(null, r)) : ($a(t), t.child = e.child, t.flags |= 128, t = null);
			else if (Xa(t), sf(c)) {
				if (o = c.nextSibling && c.nextSibling.dataset, o) var u = o.dgst;
				o = u, r = Error(s(419)), r.stack = "", r.digest = o, Ii({
					value: r,
					source: null,
					stack: null
				}), t = yc(e, t, n);
			} else if (Zs || Wi(e, t, n, !1), o = (n & e.childLanes) !== 0, Zs || o) {
				if (o = Il, o !== null && (r = Ge(o, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, Jr(e, r), mu(o, e, r), Xs;
				of(c) || Eu(), t = yc(e, t, n);
			} else of(c) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, Ti = lf(c.nextSibling), wi = t, Ei = !0, Di = null, Oi = !1, e !== null && Ci(t, e), t = _c(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? ($a(t), c = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = ti(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (c = ii(c, i, n, null), c.flags |= 2) : c = ti(u, c), c.return = t, r.return = t, r.sibling = c, t.child = r, rc(null, r), r = t.child, c = e.child.memoizedState, c === null ? c = mc(n) : (i = c.cachePool, i === null ? i = fa() : (l = J._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), c = {
			baseLanes: c.baseLanes | n,
			cachePool: i
		}), r.memoizedState = c, r.childLanes = hc(e, o, n), t.memoizedState = pc, rc(e.child, r)) : (Xa(t), n = e.child, e = n.sibling, n = ti(n, {
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
		return e = $r(22, e, null, t), e.lanes = 0, e;
	}
	function yc(e, t, n) {
		return ka(t, e.child, null, n), e = _c(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function bc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Hi(e.return, t, n);
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
		var o = to.current, s = (o & 2) != 0;
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, V(to, o), Qs(e, t, r, n), r = Ei ? pi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
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
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && no(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), xc(t, !1, i, n, a, r);
				break;
			case "backwards":
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && no(e) === null) {
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
			if (Wi(e, t, n, !1), (n & t.childLanes) === 0) return null;
		} else return null;
		if (e !== null && t.child !== e.child) throw Error(s(153));
		if (t.child !== null) {
			for (e = t.child, n = ti(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ti(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function wc(e, t) {
		return (e.lanes & t) === 0 ? (e = e.dependencies, !!(e !== null && Gi(e))) : !0;
	}
	function Tc(e, t, n) {
		switch (t.tag) {
			case 3:
				W(t, t.stateNode.containerInfo), Bi(t, J, e.memoizedState.cache), Pi();
				break;
			case 27:
			case 5:
				G(t);
				break;
			case 4:
				W(t, t.stateNode.containerInfo);
				break;
			case 10:
				Bi(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, Za(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (Xa(t), e = Cc(e, t, n), e === null ? null : e.sibling) : gc(e, t, n) : (Xa(t), t.flags |= 128, null);
				Xa(t);
				break;
			case 19:
				var i = (e.flags & 128) != 0;
				if (r = (n & t.childLanes) !== 0, r ||= (Wi(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return Sc(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), V(to, to.current), r) break;
				return null;
			case 22: return t.lanes = 0, nc(e, t, n, t.pendingProps);
			case 24: Bi(t, J, e.memoizedState.cache);
		}
		return Cc(e, t, n);
	}
	function Ec(e, t, n) {
		if (e !== null) if (e.memoizedProps !== t.pendingProps) Zs = !0;
		else {
			if (!wc(e, n) && !(t.flags & 128)) return Zs = !1, Tc(e, t, n);
			Zs = !!(e.flags & 131072);
		}
		else Zs = !1, Ei && t.flags & 1048576 && bi(t, pi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = ya(t.elementType), t.type = e, typeof e == "function") ei(e) ? (r = Bs(e, r), t.tag = 1, t = dc(null, t, e, r, n)) : (t.tag = 0, t = lc(null, t, e, r, n));
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
					if (W(t, t.stateNode.containerInfo), e === null) throw Error(s(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, Na(e, t), Ba(t, r, null, n);
					var o = t.memoizedState;
					if (r = o.cache, Bi(t, J, r), r !== a.cache && Ui(t, [J], n, !0), za(), r = o.element, a.isDehydrated) if (a = {
						element: r,
						isDehydrated: !1,
						cache: o.cache
					}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
						t = fc(e, t, r, n);
						break a;
					} else if (r !== i) {
						i = li(Error(s(424)), t), Ii(i), t = fc(e, t, r, n);
						break a;
					} else {
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (Ti = lf(e.firstChild), wi = t, Ei = !0, Di = null, Oi = !0, n = Aa(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					}
					else {
						if (Pi(), r === i) {
							t = Cc(e, t, n);
							break a;
						}
						Qs(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return cc(e, t), e === null ? (n = Af(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : Ei || (n = t.type, e = t.pendingProps, r = Vd(ne.current).createElement(n), r[Ze] = t, r[Qe] = e, Fd(r, n, e), ut(r), t.stateNode = r) : t.memoizedState = Af(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return G(t), e === null && Ei && (r = t.stateNode = pf(t.type, t.pendingProps, ne.current), wi = t, Oi = !0, i = Ti, Qd(t.type) ? (uf = i, Ti = lf(r.firstChild)) : Ti = i), Qs(e, t, t.pendingProps.children, n), cc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && Ei && ((i = r = Ti) && (r = nf(r, t.type, t.pendingProps, Oi), r === null ? i = !1 : (t.stateNode = r, wi = t, Ti = lf(r.firstChild), Oi = !1, i = !0)), i || Ai(t)), G(t), i = t.type, a = t.pendingProps, o = e === null ? null : e.memoizedProps, r = a.children, Wd(i, a) ? r = null : o !== null && Wd(i, o) && (t.flags |= 32), t.memoizedState !== null && (i = go(e, t, yo, null, null, n), $f._currentValue = i), cc(e, t), Qs(e, t, r, n), t.child;
			case 6: return e === null && Ei && ((e = n = Ti) && (n = rf(n, t.pendingProps, Oi), n === null ? e = !1 : (t.stateNode = n, wi = t, Ti = null, e = !0)), e || Ai(t)), null;
			case 13: return gc(e, t, n);
			case 4: return W(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = ka(t, null, r, n) : Qs(e, t, r, n), t.child;
			case 11: return $s(e, t, t.type, t.pendingProps, n);
			case 7: return Qs(e, t, t.pendingProps, n), t.child;
			case 8: return Qs(e, t, t.pendingProps.children, n), t.child;
			case 12: return Qs(e, t, t.pendingProps.children, n), t.child;
			case 10: return r = t.pendingProps, Bi(t, t.type, r.value), Qs(e, t, r.children, n), t.child;
			case 9: return i = t.type._context, r = t.pendingProps.children, Ki(t), i = qi(i), r = r(i), t.flags |= 1, Qs(e, t, r, n), t.child;
			case 14: return ec(e, t, t.type, t.pendingProps, n);
			case 15: return tc(e, t, t.type, t.pendingProps, n);
			case 19: return Sc(e, t, n);
			case 31: return sc(e, t, n);
			case 22: return nc(e, t, n, t.pendingProps);
			case 24: return Ki(t), r = qi(J), e === null ? (i = ua(), i === null && (i = Il, a = $i(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, Ma(t), Bi(t, J, i)) : ((e.lanes & n) !== 0 && (Na(e, t), Ba(t, null, null, n), za()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, Bi(t, J, r), r !== i.cache && Ui(t, [J], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), Bi(t, J, r))), Qs(e, t, t.pendingProps.children, n), t.child;
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
			else throw ba = ga, ma;
		} else e.flags &= -16777217;
	}
	function kc(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Gf(t)) if (Cu()) e.flags |= 8192;
		else throw ba = ga, ma;
	}
	function Ac(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : ze(), e.lanes |= t, Jl |= t);
	}
	function jc(e, t) {
		if (!Ei) switch (e.tailMode) {
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
		switch (Si(t), t.tag) {
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
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Vi(J), ie(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Ni(t) ? Dc(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Fi())), Mc(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (Dc(t), a === null ? (Mc(t), Oc(t, i, null, r, n)) : (Mc(t), kc(t, a))) : a ? a === e.memoizedState ? (Mc(t), t.flags &= -16777217) : (Dc(t), Mc(t), kc(t, a)) : (e = e.memoizedProps, e !== r && Dc(t), Mc(t), Oc(t, i, e, r, n)), null;
			case 27:
				if (ae(t), n = ne.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Dc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Mc(t), null;
					}
					e = H.current, Ni(t) ? ji(t, e) : (e = pf(i, r, n), t.stateNode = e, Dc(t));
				}
				return Mc(t), null;
			case 5:
				if (ae(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Dc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Mc(t), null;
					}
					if (a = H.current, Ni(t)) ji(t, a);
					else {
						var o = Vd(ne.current);
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
						a[Ze] = t, a[Qe] = r;
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
					if (e = ne.current, Ni(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = wi, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[Ze] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || Md(e.nodeValue, n)), e || Ai(t, !0);
					} else e = Vd(e).createTextNode(r), e[Ze] = t, t.stateNode = e;
				}
				return Mc(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Ni(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(s(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(557));
							e[Ze] = t;
						} else Pi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Mc(t), e = !1;
					} else n = Fi(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (eo(t), t) : (eo(t), null);
					if (t.flags & 128) throw Error(s(558));
				}
				return Mc(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = Ni(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(s(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(s(317));
							i[Ze] = t;
						} else Pi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Mc(t), i = !1;
					} else i = Fi(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (eo(t), t) : (eo(t), null);
				}
				return eo(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Ac(t, t.updateQueue), Mc(t), null);
			case 4: return ie(), e === null && Sd(t.stateNode.containerInfo), Mc(t), null;
			case 10: return Vi(t.type), Mc(t), null;
			case 19:
				if (B(to), r = t.memoizedState, r === null) return Mc(t), null;
				if (i = (t.flags & 128) != 0, a = r.rendering, a === null) if (i) jc(r, !1);
				else {
					if (Ul !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
						if (a = no(e), a !== null) {
							for (t.flags |= 128, jc(r, !1), e = a.updateQueue, t.updateQueue = e, Ac(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) ni(n, e), n = n.sibling;
							return V(to, to.current & 1 | 2), Ei && yi(t, r.treeForkCount), t.child;
						}
						e = e.sibling;
					}
					r.tail !== null && ve() > eu && (t.flags |= 128, i = !0, jc(r, !1), t.lanes = 4194304);
				}
				else {
					if (!i) if (e = no(a), e !== null) {
						if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Ac(t, e), jc(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !Ei) return Mc(t), null;
					} else 2 * ve() - r.renderingStartTime > eu && n !== 536870912 && (t.flags |= 128, i = !0, jc(r, !1), t.lanes = 4194304);
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (Mc(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = ve(), e.sibling = null, n = to.current, V(to, i ? n & 1 | 2 : n & 1), Ei && yi(t, r.treeForkCount), e);
			case 22:
			case 23: return eo(t), qa(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (Mc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Mc(t), n = t.updateQueue, n !== null && Ac(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && B(la), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Vi(J), Mc(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(s(156, t.tag));
	}
	function Pc(e, t) {
		switch (Si(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Vi(J), ie(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return ae(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (eo(t), t.alternate === null) throw Error(s(340));
					Pi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (eo(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(s(340));
					Pi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return B(to), null;
			case 4: return ie(), null;
			case 10: return Vi(t.type), null;
			case 22:
			case 23: return eo(t), qa(), e !== null && B(la), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Vi(J), null;
			case 25: return null;
			default: return null;
		}
	}
	function Fc(e, t) {
		switch (Si(t), t.tag) {
			case 3:
				Vi(J), ie();
				break;
			case 26:
			case 27:
			case 5:
				ae(t);
				break;
			case 4:
				ie();
				break;
			case 31:
				t.memoizedState !== null && eo(t);
				break;
			case 13:
				eo(t);
				break;
			case 19:
				B(to);
				break;
			case 10:
				Vi(t.type);
				break;
			case 22:
			case 23:
				eo(t), qa(), e !== null && B(la);
				break;
			case 24: Vi(J);
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
				Ha(t, n);
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
			Id(r, e.type, n, t), r[Qe] = t;
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
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Wt));
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
			Fd(t, r, n), t[Ze] = e, t[Qe] = n;
		} catch (t) {
			Wu(e, e.return, t);
		}
	}
	var Yc = !1, Xc = !1, Zc = !1, Qc = typeof WeakSet == "function" ? WeakSet : Set, $c = null;
	function el(e, t) {
		if (e = e.containerInfo, zd = cp, e = vr(e), yr(e)) {
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
						Ha(e, t);
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
		t !== null && (e.alternate = null, nl(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && at(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var rl = null, il = !1;
	function al(e, t, n) {
		for (n = n.child; n !== null;) ol(e, t, n), n = n.sibling;
	}
	function ol(e, t, n) {
		if (K && typeof K.onCommitFiberUnmount == "function") try {
			K.onCommitFiberUnmount(De, n);
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
									a = i.getElementsByTagName("title")[0], (!a || a[it] || a[Ze] || a.namespaceURI === "http://www.w3.org/2000/svg" || a.hasAttribute("itemprop")) && (a = i.createElement(r), i.head.insertBefore(a, i.querySelector("head > title"))), Fd(a, r, n), a[Ze] = e, ut(a), r = a;
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
							a[Ze] = e, ut(a), r = a;
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
						It(i, "");
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
				dl(t, e), ml(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Ql = ve()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ul(e, r)));
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
						n.flags & 32 && (It(a, ""), n.flags &= -33), qc(e, Gc(e), a);
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
							if (c !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < c.length; i++) Va(c[i], s);
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
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && ea(n));
	}
	function bl(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ea(e));
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
				xl(e, t, n, r), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ea(e)));
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
				case 24: ea(n.memoizedState.cache);
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
			var t = qi(J), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return qi(J).controller.signal;
		}
	}, Pl = typeof WeakMap == "function" ? WeakMap : Map, Fl = 0, Il = null, X = null, Z = 0, Ll = 0, Rl = null, zl = !1, Bl = !1, Vl = !1, Hl = 0, Ul = 0, Wl = 0, Gl = 0, Kl = 0, ql = 0, Jl = 0, Yl = null, Xl = null, Zl = !1, Ql = 0, $l = 0, eu = Infinity, tu = null, nu = null, ru = 0, iu = null, au = null, ou = 0, su = 0, cu = null, lu = null, uu = 0, du = null;
	function fu() {
		return Fl & 2 && Z !== 0 ? Z & -Z : P.T === null ? Je() : dd();
	}
	function pu() {
		if (ql === 0) if (!(Z & 536870912) || Ei) {
			var e = Pe;
			Pe <<= 1, !(Pe & 3932160) && (Pe = 262144), ql = e;
		} else ql = 536870912;
		return e = Ja.current, e !== null && (e.flags |= 32), ql;
	}
	function mu(e, t, n) {
		(e === Il && (Ll === 2 || Ll === 9) || e.cancelPendingCommit !== null) && (xu(e, 0), vu(e, Z, ql, !1)), Ve(e, n), (!(Fl & 2) || e !== Il) && (e === Il && (!(Fl & 2) && (Gl |= n), Ul === 4 && vu(e, Z, ql, !1)), rd(e));
	}
	function hu(e, t, n) {
		if (Fl & 6) throw Error(s(327));
		var r = !n && (t & 127) == 0 && (t & e.expiredLanes) === 0 || Le(e, t), i = r ? ku(e, t) : Du(e, t, !0), a = r;
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
					if ((t & 62914560) === t && (i = Ql + 300 - ve(), 10 < i)) {
						if (vu(r, t, ql, !zl), Ie(r, 0, !0) !== 0) break a;
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
				unsuspend: Wt
			}, Dl(t, a, d);
			var m = (a & 62914560) === a ? Ql - ve() : (a & 4194048) === a ? $l - ve() : 0;
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
					if (!pr(a(), i)) return !1;
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
			var a = 31 - ke(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && Ue(e, n, t);
	}
	function yu() {
		return Fl & 6 ? !0 : (id(0, !1), !1);
	}
	function bu() {
		if (X !== null) {
			if (Ll === 0) var e = X.return;
			else e = X, zi = Ri = null, So(e), Ca = null, wa = 0, e = X;
			for (; e !== null;) Fc(e.alternate, e), e = e.return;
			X = null;
		}
	}
	function xu(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, Jd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), ou = 0, bu(), Il = e, X = n = ti(e.current, null), Z = t, Ll = 0, Rl = null, zl = !1, Bl = Le(e, t), Vl = !1, Jl = ql = Kl = Gl = Wl = Ul = 0, Xl = Yl = null, Zl = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - ke(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Hl = t, Gr(), n;
	}
	function Su(e, t) {
		Y = null, P.H = Ms, t === pa || t === ha ? (t = xa(), Ll = 3) : t === ma ? (t = xa(), Ll = 4) : Ll = t === Xs ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Rl = t, X === null && (Ul = 1, Ws(e, li(t, e.current)));
	}
	function Cu() {
		var e = Ja.current;
		return e === null ? !0 : (Z & 4194048) === Z ? Ya === null : (Z & 62914560) === Z || Z & 536870912 ? e === Ya : !1;
	}
	function wu() {
		var e = P.H;
		return P.H = Ms, e === null ? Ms : e;
	}
	function Tu() {
		var e = P.A;
		return P.A = Nl, e;
	}
	function Eu() {
		Ul = 4, zl || (Z & 4194048) !== Z && Ja.current !== null || (Bl = !0), !(Wl & 134217727) && !(Gl & 134217727) || Il === null || vu(Il, Z, ql, !1);
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
							Ja.current === null && (t = !0);
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
		return t && e.shellSuspendCounter++, zi = Ri = null, Fl = r, P.H = i, P.A = a, X === null && (Il = null, Z = 0, Gr()), o;
	}
	function Ou() {
		for (; X !== null;) ju(X);
	}
	function ku(e, t) {
		var n = Fl;
		Fl |= 2;
		var r = wu(), i = Tu();
		Il !== e || Z !== t ? (tu = null, eu = ve() + 500, xu(e, t)) : Bl = Le(e, t);
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
							if (_a(a)) {
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
							_a(a) ? (Ll = 0, Rl = null, Mu(t)) : (Ll = 0, Rl = null, Nu(e, t, a, 7));
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
		return zi = Ri = null, P.H = r, P.A = i, Fl = n, X === null ? (Il = null, Z = 0, Gr(), Ul) : 0;
	}
	function Au() {
		for (; X !== null && !ge();) ju(X);
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
			case 5: So(t);
			default: Fc(n, t), t = X = ni(t, Hl), t = Ec(n, t, Hl);
		}
		e.memoizedProps = e.pendingProps, t === null ? Pu(e) : X = t;
	}
	function Nu(e, t, n, r) {
		zi = Ri = null, So(t), Ca = null, wa = 0;
		var i = t.return;
		try {
			if (Ys(e, i, t, n, Z)) {
				Ul = 1, Ws(e, li(n, e.current)), X = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw X = i, t;
			Ul = 1, Ws(e, li(n, e.current)), X = null;
			return;
		}
		t.flags & 32768 ? (Ei || r === 1 ? e = !0 : Bl || Z & 536870912 ? e = !1 : (zl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Ja.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Fu(t, e)) : Pu(t);
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
			if (a = t.lanes | t.childLanes, a |= Wr, He(e, n, a, o, c, l), e === Il && (X = Il = null, Z = 0), au = t, iu = e, ou = n, su = a, cu = i, lu = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Xu(Se, function() {
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
					var a = Bd, o = vr(e.containerInfo), s = a.focusedElem, c = a.selectionRange;
					if (o !== s && s && s.ownerDocument && _r(s.ownerDocument.documentElement, s)) {
						if (c !== null && yr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = gr(s, h), v = gr(s, g);
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
			ru = 0, _e();
			var e = iu, t = au, n = ou, r = lu;
			t.subtreeFlags & 10256 || t.flags & 10256 ? ru = 5 : (ru = 0, au = iu = null, Bu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (nu = null), qe(n), t = t.stateNode, K && typeof K.onCommitFiberRoot == "function") try {
				K.onCommitFiberRoot(De, t, void 0, (t.current.flags & 128) == 128);
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
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, ea(t)));
	}
	function Vu() {
		return Lu(), Ru(), zu(), Hu();
	}
	function Hu() {
		if (ru !== 5) return !1;
		var e = iu, t = su;
		su = 0;
		var n = qe(ou), r = P.T, i = F.p;
		try {
			F.p = 32 > n ? 32 : n, P.T = null, n = cu, cu = null;
			var a = iu, o = ou;
			if (ru = 0, au = iu = null, ou = 0, Fl & 6) throw Error(s(331));
			var c = Fl;
			if (Fl |= 4, Al(a.current), Sl(a, a.current, o, n), Fl = c, id(0, !1), K && typeof K.onPostCommitFiberRoot == "function") try {
				K.onPostCommitFiberRoot(De, a);
			} catch {}
			return !0;
		} finally {
			F.p = i, P.T = r, Bu(e, t);
		}
	}
	function Uu(e, t, n) {
		t = li(n, t), t = Ks(e.stateNode, t, 2), e = Fa(e, t, 2), e !== null && (Ve(e, 2), rd(e));
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
					e = li(n, e), n = qs(2), r = Fa(t, n, 2), r !== null && (Js(n, r, t, e), Ve(r, 2), rd(r));
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
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Il === e && (Z & n) === n && (Ul === 4 || Ul === 3 && (Z & 62914560) === Z && 300 > ve() - Ql ? !(Fl & 2) && xu(e, 0) : Kl |= n, Jl === Z && (Jl = 0)), rd(e);
	}
	function qu(e, t) {
		t === 0 && (t = ze()), e = Jr(e, t), e !== null && (Ve(e, t), rd(e));
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
		return me(e, t);
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
							a = (1 << 31 - ke(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
						}
						a !== 0 && (n = !0, ld(r, a));
					} else a = Z, a = Ie(r, r === Il ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || Le(r, a) || (n = !0, ld(r, a));
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
		for (var t = ve(), n = null, r = Zu; r !== null;) {
			var i = r.next, a = sd(r, t);
			a === 0 ? (r.next = null, n === null ? Zu = i : n.next = i, i === null && (Qu = n)) : (n = r, (e !== 0 || a & 3) && (ed = !0)), r = i;
		}
		ru !== 0 && ru !== 5 || id(e, !1), nd !== 0 && (nd = 0);
	}
	function sd(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - ke(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = Re(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Il, n = Z, n = Ie(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Ll === 2 || Ll === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && he(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || Le(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && he(r), qe(n)) {
				case 2:
				case 8:
					n = xe;
					break;
				case 32:
					n = Se;
					break;
				case 268435456:
					n = we;
					break;
				default: n = Se;
			}
			return r = cd.bind(null, e), n = me(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && he(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function cd(e, t) {
		if (ru !== 0 && ru !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Vu() && e.callbackNode !== n) return null;
		var r = Z;
		return r = Ie(e, e === Il ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (hu(e, r, t), sd(e, ve()), e.callbackNode != null && e.callbackNode === n ? cd.bind(null, e) : null);
	}
	function ld(e, t) {
		if (Vu()) return null;
		hu(e, t, !0);
	}
	function ud() {
		Xd(function() {
			Fl & 6 ? me(be, ad) : od();
		});
	}
	function dd() {
		if (nd === 0) {
			var e = ra;
			e === 0 && (e = Ne, Ne <<= 1, !(Ne & 261888) && (Ne = 256)), nd = e;
		}
		return nd;
	}
	function fd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Ut("" + e);
	}
	function pd(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function md(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = fd((i[Qe] || null).action), o = r.submitter;
			o && (t = (t = o[Qe] || null) ? fd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new fn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (nd !== 0) {
								var e = o ? pd(i, o) : new FormData(i);
								vs(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = o ? pd(i, o) : new FormData(i), vs(n, {
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
	for (var hd = 0; hd < zr.length; hd++) {
		var gd = zr[hd];
		Br(gd.toLowerCase(), "on" + (gd[0].toUpperCase() + gd.slice(1)));
	}
	Br(jr, "onAnimationEnd"), Br(Mr, "onAnimationIteration"), Br(Nr, "onAnimationStart"), Br("dblclick", "onDoubleClick"), Br("focusin", "onFocus"), Br("focusout", "onBlur"), Br(Pr, "onTransitionRun"), Br(Fr, "onTransitionStart"), Br(Ir, "onTransitionCancel"), Br(Lr, "onTransitionEnd"), mt("onMouseEnter", ["mouseout", "mouseover"]), mt("onMouseLeave", ["mouseout", "mouseover"]), mt("onPointerEnter", ["pointerout", "pointerover"]), mt("onPointerLeave", ["pointerout", "pointerover"]), pt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), pt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), pt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), pt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), pt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), pt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
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
						Vr(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Vr(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Q(e, t) {
		var n = t[et];
		n === void 0 && (n = t[et] = /* @__PURE__ */ new Set());
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
			e[xd] = !0, dt.forEach(function(t) {
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
		n = i.bind(null, t, n, e), i = void 0, !en || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
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
					if (o = ot(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6 || c === 26 || c === 27) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		Zt(function() {
			var r = a, i = Kt(n), o = [];
			a: {
				var s = Rr.get(e);
				if (s !== void 0) {
					var c = fn, u = e;
					switch (e) {
						case "keypress": if (sn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = An;
							break;
						case "focusin":
							u = "focus", c = xn;
							break;
						case "focusout":
							u = "blur", c = xn;
							break;
						case "beforeblur":
						case "afterblur":
							c = xn;
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
							c = yn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = bn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = Mn;
							break;
						case jr:
						case Mr:
						case Nr:
							c = Sn;
							break;
						case Lr:
							c = Nn;
							break;
						case "scroll":
						case "scrollend":
							c = mn;
							break;
						case "wheel":
							c = Pn;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = Cn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							c = jn;
							break;
						case "toggle":
						case "beforetoggle": c = Fn;
					}
					var d = (t & 4) != 0, f = !d && (e === "scroll" || e === "scrollend"), p = d ? s === null ? null : s + "Capture" : s;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = Qt(m, p), g != null && d.push(Td(m, g, h))), f) break;
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
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== Gt && (u = n.relatedTarget || n.fromElement) && (ot(u) || u[$e])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (u = n.relatedTarget || n.toElement, c = r, u = u ? ot(u) : null, u !== null && (f = l(u), d = u.tag, u !== f || d !== 5 && d !== 27 && d !== 6) && (u = null)) : (c = null, u = r), c !== u)) {
						if (d = yn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = jn, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? s : ct(c), h = u == null ? s : ct(u), s = new d(g, m + "leave", c, n, i), s.target = f, s.relatedTarget = h, g = null, ot(i) === r && (d = new d(p, m + "enter", u, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, c && u) b: {
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
					if (s = r ? ct(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var v = tr;
					else if (Yn(s)) if (nr) v = dr;
					else {
						v = lr;
						var y = cr;
					}
					else c = s.nodeName, !c || c.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? r && Bt(r.elementType) && (v = tr) : v = ur;
					if (v &&= v(e, r)) {
						Xn(o, v, n, i);
						break a;
					}
					y && y(e, s, r), e === "focusout" && r && s.type === "number" && r.memoizedProps.value != null && Mt(s, "number", s.value);
				}
				switch (y = r ? ct(r) : window, e) {
					case "focusin":
						(Yn(y) || y.contentEditable === "true") && (xr = y, Sr = r, Cr = null);
						break;
					case "focusout":
						Cr = Sr = xr = null;
						break;
					case "mousedown":
						wr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						wr = !1, Tr(o, n, i);
						break;
					case "selectionchange": if (br) break;
					case "keydown":
					case "keyup": Tr(o, n, i);
				}
				var b;
				if (Ln) b: {
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
				else Gn ? Un(e, n) && (x = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (x = "onCompositionStart");
				x && (Bn && n.locale !== "ko" && (Gn || x !== "onCompositionStart" ? x === "onCompositionEnd" && Gn && (b = on()) : (nn = i, rn = "value" in nn ? nn.value : nn.textContent, Gn = !0)), y = Ed(r, x), 0 < y.length && (x = new wn(x, e, null, n, i), o.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = Wn(n), b !== null && (x.data = b)))), (b = zn ? Kn(e, n) : qn(e, n)) && (x = Ed(r, "onBeforeInput"), 0 < x.length && (y = new wn("onBeforeInput", "beforeinput", null, n, i), o.push({
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
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = Qt(e, n), i != null && r.unshift(Td(e, i, a)), i = Qt(e, t), i != null && r.push(Td(e, i, a))), e.tag === 3) return r;
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
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = Qt(n, a), l != null && o.unshift(Td(n, l, c))) : i || (l = Qt(n, a), l != null && o.push(Td(n, l, c)))), n = n.return;
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
				typeof r == "string" ? t === "body" || t === "textarea" && r === "" || It(e, r) : (typeof r == "number" || typeof r == "bigint") && t !== "body" && It(e, "" + r);
				break;
			case "className":
				bt(e, "class", r);
				break;
			case "tabIndex":
				bt(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				bt(e, n, r);
				break;
			case "style":
				zt(e, r, a);
				break;
			case "data": if (t !== "object") {
				bt(e, "data", r);
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
				r = Ut("" + r), e.setAttribute(n, r);
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
				r = Ut("" + r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = Wt);
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
				n = Ut("" + r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
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
				Q("beforetoggle", e), Q("toggle", e), yt(e, "popover", r);
				break;
			case "xlinkActuate":
				xt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				xt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				xt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				xt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				xt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				xt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				xt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				xt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				xt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				yt(e, "is", r);
				break;
			case "innerText":
			case "textContent": break;
			default: (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = Vt.get(n) || n, yt(e, n, r));
		}
	}
	function Pd(e, t, n, r, i, a) {
		switch (n) {
			case "style":
				zt(e, r, a);
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
				typeof r == "string" ? It(e, r) : (typeof r == "number" || typeof r == "bigint") && It(e, "" + r);
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				break;
			case "onClick":
				r != null && (e.onclick = Wt);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": break;
			case "innerText":
			case "textContent": break;
			default: if (!ft.hasOwnProperty(n)) a: {
				if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), a = e[Qe] || null, a = a == null ? null : a[n], typeof a == "function" && e.removeEventListener(t, a, i), typeof r == "function")) {
					typeof a != "function" && a !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, i);
					break a;
				}
				n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : yt(e, n, r);
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
				jt(e, a, c, l, u, o, i, !1);
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
				t = a, n = o, e.multiple = !!r, t == null ? n != null && Nt(e, !!r, n, !0) : Nt(e, !!r, t, !1);
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
				Ft(e, r, i, a);
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
			default: if (Bt(t)) {
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
				At(e, o, c, l, u, d, a, i);
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
				t = c, n = o, r = m, p == null ? !!r != !!n && (t == null ? Nt(e, !!n, n ? [] : "", !1) : Nt(e, !!n, t, !0)) : Nt(e, !!n, p, !1);
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
				Pt(e, p, m);
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
			default: if (Bt(t)) {
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
					a[it] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
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
					tf(n), at(n);
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
			else if (!e[it]) switch (t) {
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
		at(e);
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
		var t = st(e);
		t !== null && t.tag === 5 && t.type === "form" ? bs(t) : vf.r(e);
	}
	var xf = typeof document > "u" ? null : document;
	function Sf(e, t, n) {
		var r = xf;
		if (r && typeof t == "string" && t) {
			var i = kt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), gf.has(i) || (gf.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), Fd(t, "link", e), ut(t), r.head.appendChild(t)));
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
			var i = "link[rel=\"preload\"][as=\"" + kt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + kt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + kt(n.imageSizes) + "\"]")) : i += "[href=\"" + kt(e) + "\"]";
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
			}, n), hf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Mf(a)) || t === "script" && r.querySelector(If(a)) || (t = r.createElement("link"), Fd(t, "link", e), ut(t), r.head.appendChild(t)));
		}
	}
	function Ef(e, t) {
		vf.m(e, t);
		var n = xf;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + kt(r) + "\"][href=\"" + kt(e) + "\"]", a = i;
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
				r = n.createElement("link"), Fd(r, "link", e), ut(r), n.head.appendChild(r);
			}
		}
	}
	function Df(e, t, n) {
		vf.S(e, t, n);
		var r = xf;
		if (r && e) {
			var i = lt(r).hoistableStyles, a = jf(e);
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
					ut(c), Fd(c, "link", e), c._p = new Promise(function(e, t) {
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
			var r = lt(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = h({
				src: e,
				async: !0
			}, t), (t = hf.get(i)) && Bf(e, t), a = n.createElement("script"), ut(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
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
			var r = lt(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = h({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = hf.get(i)) && Bf(e, t), a = n.createElement("script"), ut(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Af(e, t, n, r) {
		var i = (i = ne.current) ? _f(i) : null;
		if (!i) throw Error(s(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = jf(n.href), n = lt(i).hoistableStyles, r = n.get(t), r || (r = {
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
					var a = lt(i).hoistableStyles, o = a.get(e);
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
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Ff(n), n = lt(i).hoistableScripts, r = n.get(t), r || (r = {
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
		return "href=\"" + kt(e) + "\"";
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
		}), Fd(t, "link", n), ut(t), e.head.appendChild(t));
	}
	function Ff(e) {
		return "[src=\"" + kt(e) + "\"]";
	}
	function If(e) {
		return "script[async]" + e;
	}
	function Lf(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + kt(n.href) + "\"]");
				if (r) return t.instance = r, ut(r), r;
				var i = h({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), ut(r), Fd(r, "style", i), Rf(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = jf(n.href);
				var a = e.querySelector(Mf(i));
				if (a) return t.state.loading |= 4, t.instance = a, ut(a), a;
				r = Nf(n), (i = hf.get(i)) && zf(r, i), a = (e.ownerDocument || e).createElement("link"), ut(a);
				var o = a;
				return o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Fd(a, "link", r), t.state.loading |= 4, Rf(a, n.precedence, e), t.instance = a;
			case "script": return a = Ff(n.src), (i = e.querySelector(If(a))) ? (t.instance = i, ut(i), i) : (r = n, (i = hf.get(a)) && (r = h({}, n), Bf(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), ut(i), Fd(i, "link", r), e.head.appendChild(i), t.instance = i);
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
			if (!(a[it] || a[Ze] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
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
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Yf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, ut(a);
					return;
				}
				a = t.ownerDocument || t, r = Nf(r), (i = hf.get(i)) && zf(r, i), a = a.createElement("link"), ut(a);
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
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Be(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Be(0), this.hiddenUpdates = Be(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function tp(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new ep(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = $r(3, null, null, t), e.current = a, a.stateNode = e, t = $i(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, Ma(a), e;
	}
	function np(e) {
		return e ? (e = Zr, e) : Zr;
	}
	function rp(e, t, n, r, i, a) {
		i = np(i), r.context === null ? r.context = i : r.pendingContext = i, r = Pa(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = Fa(e, r, t), n !== null && (mu(n, e, t), Ia(n, e, t));
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
			var t = Jr(e, 67108864);
			t !== null && mu(t, e, 67108864), ap(e, 67108864);
		}
	}
	function sp(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = fu();
			t = Ke(t);
			var n = Jr(e, t);
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
					var a = st(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = q(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - ke(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									rd(a), !(Fl & 6) && (eu = ve() + 500, id(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Jr(a, 2), s !== null && mu(s, a, 2), yu(), ap(a, 2);
					}
					if (a = fp(r), a === null && wd(e, t, r, pp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else wd(e, t, r, null, n);
		}
	}
	function fp(e) {
		return e = Kt(e), mp(e);
	}
	var pp = null;
	function mp(e) {
		if (pp = null, e = ot(e), e !== null) {
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
			case "message": switch (ye()) {
				case be: return 2;
				case xe: return 8;
				case Se:
				case Ce: return 32;
				case we: return 268435456;
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
		}, t !== null && (t = st(t), t !== null && op(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
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
		var t = ot(e.target);
		if (t !== null) {
			var n = l(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = u(n), t !== null) {
						e.blockedOn = t, Ye(e.priority, function() {
							sp(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = d(n), t !== null) {
						e.blockedOn = t, Ye(e.priority, function() {
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
				Gt = r, n.target.dispatchEvent(r), Gt = null;
			} else return t = st(n), t !== null && op(t), e.blockedOn = n, !1;
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
				var a = st(n);
				a !== null && (e.splice(t, 3), t -= 3, vs(a, {
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
			var i = n[r], a = n[r + 1], o = i[Qe] || null;
			if (typeof a == "function") o || Np(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[Qe] || null) s = o.formAction;
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
			rp(e.current, 2, null, e, null, null), yu(), t[$e] = null;
		}
	};
	function Lp(e) {
		this._internalRoot = e;
	}
	Lp.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = Je();
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
			De = Bp.inject(zp), K = Bp;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!c(e)) throw Error(s(299));
		var n = !1, r = "", i = Vs, a = Hs, o = Us;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = tp(e, 1, !1, null, null, n, r, null, i, a, o, Fp), e[$e] = t.current, Sd(e), new Ip(t);
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
function L(e = z()) {
	return e ? .35 : 1;
}
function R(e, t = z()) {
	return Math.max(.12, e * L(t));
}
function z() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region node_modules/gsap/gsap-core.js
function B(e) {
	if (e === void 0) throw ReferenceError("this hasn't been initialised - super() hasn't been called");
	return e;
}
function V(e, t) {
	e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t;
}
var H = {
	autoSleep: 120,
	force3D: "auto",
	nullTargetWarn: 1,
	units: { lineHeight: "" }
}, U = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, ne, re, W, ie = 1e8, G = 1 / ie, ae = Math.PI * 2, oe = ae / 4, se = 0, ce = Math.sqrt, le = Math.cos, ue = Math.sin, de = function(e) {
	return typeof e == "string";
}, fe = function(e) {
	return typeof e == "function";
}, pe = function(e) {
	return typeof e == "number";
}, me = function(e) {
	return e === void 0;
}, he = function(e) {
	return typeof e == "object";
}, ge = function(e) {
	return e !== !1;
}, _e = function() {
	return typeof window < "u";
}, ve = function(e) {
	return fe(e) || de(e);
}, ye = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, be = Array.isArray, xe = /(?:-?\.?\d|\.)+/gi, Se = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, Ce = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, we = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, Te = /[+-]=-?[.\d]+/, Ee = /[^,'"\[\]\s]+/gi, De = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, K, Oe, ke, Ae, je = {}, Me = {}, Ne, Pe = function(e) {
	return (Me = ut(e, je)) && jr;
}, Fe = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, q = function(e, t) {
	return !t && console.warn(e);
}, Ie = function(e, t) {
	return e && (je[e] = t) && Me && (Me[e] = t) || je;
}, Le = function() {
	return 0;
}, Re = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, ze = {
	suppressEvents: !0,
	kill: !1
}, Be = { suppressEvents: !0 }, Ve = {}, He = [], Ue = {}, We, Ge = {}, Ke = {}, qe = 30, Je = [], Ye = "", Xe = function(e) {
	var t = e[0], n, r;
	if (he(t) || fe(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = Je.length; r-- && !Je[r].targetTest(t););
		n = Je[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new Vn(e[r], n))) || e.splice(r, 1);
	return e;
}, Ze = function(e) {
	return e._gsap || Xe(qt(e))[0]._gsap;
}, Qe = function(e, t, n) {
	return (n = e[t]) && fe(n) ? e[t]() : me(n) && e.getAttribute && e.getAttribute(t) || n;
}, $e = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, et = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, tt = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, nt = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, rt = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, it = function() {
	var e = He.length, t = He.slice(0), n, r;
	for (Ue = {}, He.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, at = function(e, t, n, r) {
	He.length && !re && it(), e.render(t, n, r || re && t < 0 && (e._initted || e._startAt)), He.length && !re && it();
}, ot = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(Ee).length < 2 ? t : de(e) ? e.trim() : e;
}, st = function(e) {
	return e;
}, ct = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, lt = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, ut = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, dt = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = he(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, ft = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, pt = function(e) {
	var t = e.parent || K, n = e.keyframes ? lt(be(e.keyframes)) : ct;
	if (ge(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, mt = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, ht = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, gt = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, _t = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, vt = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, yt = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, bt = function(e, t, n, r) {
	return e._startAt && (re ? e._startAt.revert(ze) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, xt = function e(t) {
	return !t || t._ts && e(t.parent);
}, St = function(e) {
	return e._repeat ? Ct(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, Ct = function(e, t) {
	var n = Math.floor(e = tt(e / t));
	return e && n === e ? n - 1 : n;
}, wt = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, Tt = function(e) {
	return e._end = tt(e._start + (e._tDur / Math.abs(e._ts || e._rts || G) || 0));
}, Et = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = tt(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), Tt(e), n._dirty || vt(n, e)), e;
}, Dt = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = wt(e.rawTime(), t), (!t._dur || Vt(0, t.totalDuration(), n) - t._tTime > G) && t.render(n, !0)), vt(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -G;
	}
}, Ot = function(e, t, n, r) {
	return t.parent && _t(t), t._start = tt((pe(n) ? n : n || e !== K ? Rt(e, n, t) : e._time) + t._delay), t._end = tt(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), ht(e, t, "_first", "_last", e._sort ? "_start" : 0), Mt(t) || (e._recent = t), r || Dt(e, t), e._ts < 0 && Et(e, e._tTime), e;
}, kt = function(e, t) {
	return (je.ScrollTrigger || Fe("scrollTrigger", t)) && je.ScrollTrigger.create(t, e);
}, At = function(e, t, n, r, i) {
	if (Xn(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !re && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && We !== En.frame) return He.push(e), e._lazy = [i, r], 1;
}, jt = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, Mt = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, Nt = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && jt(e) && !(!e._initted && Mt(e)) || (e._ts < 0 || e._dp._ts < 0) && !Mt(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = Vt(0, e._tDur, t), l = Ct(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== Ct(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || re || r || e._zTime === G || !t && e._zTime) {
		if (!e._initted && At(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? G : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && bt(e, t, n, !0), e._onUpdate && !n && dn(e, "onUpdate"), s && e._repeat && !n && e.parent && dn(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && _t(e, 1), !n && !re && (dn(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, Pt = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, Ft = function(e, t, n, r) {
	var i = e._repeat, a = tt(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : tt(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && Et(e, e._tTime = e._tDur * o), e.parent && Tt(e), n || vt(e.parent, e), e;
}, It = function(e) {
	return e instanceof Un ? vt(e) : Ft(e, e._dur);
}, Lt = {
	_start: 0,
	endTime: Le,
	totalDuration: Le
}, Rt = function e(t, n, r) {
	var i = t.labels, a = t._recent || Lt, o = t.duration() >= ie ? a.endTime(!1) : t._dur, s, c, l;
	return de(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (be(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, zt = function(e, t, n) {
	var r = pe(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = ge(s.vars.inherit) && s.parent;
		a.immediateRender = ge(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new rr(t[0], a, t[i + 1]);
}, Bt = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, Vt = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, Ht = function(e, t) {
	return !de(e) || !(t = De.exec(e)) ? "" : t[1];
}, Ut = function(e, t, n) {
	return Bt(n, function(n) {
		return Vt(e, t, n);
	});
}, Wt = [].slice, Gt = function(e, t) {
	return e && he(e) && "length" in e && (!t && !e.length || e.length - 1 in e && he(e[0])) && !e.nodeType && e !== Oe;
}, Kt = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return de(e) && !t || Gt(e, 1) ? (r = n).push.apply(r, qt(e)) : n.push(e);
	}) || n;
}, qt = function(e, t, n) {
	return W && !t && W.selector ? W.selector(e) : de(e) && !n && (ke || !Dn()) ? Wt.call((t || Ae).querySelectorAll(e), 0) : be(e) ? Kt(e, n) : Gt(e) ? Wt.call(e, 0) : e ? [e] : [];
}, Jt = function(e) {
	return e = qt(e)[0] || q("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return qt(t, n.querySelectorAll ? n : n === e ? q("Invalid scope") || Ae.createElement("div") : e);
	};
}, Yt = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, Xt = function(e) {
	if (fe(e)) return e;
	var t = he(e) ? e : { each: e }, n = In(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return de(r) ? l = u = {
		center: .5,
		edges: .5,
		end: 1
	}[r] || 0 : !o && s && (l = r[0], u = r[1]), function(e, o, d) {
		var f = (d || t).length, p = a[f], m, h, g, _, v, y, b, x, S;
		if (!p) {
			if (S = t.grid === "auto" ? 0 : (t.grid || [1, ie])[1], !S) {
				for (b = -ie; b < (b = d[S++].getBoundingClientRect().left) && S < f;);
				S < f && S--;
			}
			for (p = a[f] = [], m = s ? Math.min(S, f) * l - .5 : r % S, h = S === ie ? 0 : s ? f * u / S - .5 : r / S | 0, b = 0, x = ie, y = 0; y < f; y++) g = y % S - m, _ = h - (y / S | 0), p[y] = v = c ? Math.abs(c === "y" ? _ : g) : ce(g * g + _ * _), v > b && (b = v), v < x && (x = v);
			r === "random" && Yt(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = Ht(t.amount || t.each) || 0, n = n && f < 0 ? Pn(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, tt(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, Zt = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = tt(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (pe(n) ? 0 : Ht(n));
	};
}, Qt = function(e, t) {
	var n = be(e), r, i;
	return !n && he(e) && (r = n = e.radius || ie, e.values ? (e = qt(e.values), (i = !pe(e[0])) && (r *= r)) : e = Zt(e.increment)), Bt(t, n ? fe(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = ie, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || pe(t) ? s : s + Ht(t);
	} : Zt(e));
}, $t = function(e, t, n, r) {
	return Bt(be(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return be(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, en = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, tn = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || Ht(n));
	};
}, nn = function(e, t, n) {
	return cn(e, t, 0, 1, n);
}, rn = function(e, t, n) {
	return Bt(n, function(n) {
		return e[~~t(n)];
	});
}, an = function e(t, n, r) {
	var i = n - t;
	return be(t) ? rn(t, e(0, t.length), n) : Bt(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, on = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return be(t) ? rn(t, e(0, t.length - 1), n) : Bt(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, sn = function(e) {
	for (var t = 0, n = "", r, i, a, o; ~(r = e.indexOf("random(", t));) a = e.indexOf(")", r), o = e.charAt(r + 7) === "[", i = e.substr(r + 7, a - r - 7).match(o ? Ee : xe), n += e.substr(t, r - t) + $t(o ? i : +i[0], o ? 0 : +i[1], +i[2] || 1e-5), t = a + 1;
	return n + e.substr(t, e.length - t);
}, cn = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return Bt(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, ln = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = de(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (be(t) && !be(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = ut(be(t) ? [] : {}, t));
		if (!u) {
			for (c in n) Gn.call(s, t, c, "get", n[c]);
			a = function(e) {
				return fr(e, s) || (o ? t.p : t);
			};
		}
	}
	return Bt(r, a);
}, un = function(e, t, n) {
	var r = e.labels, i = ie, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, dn = function(e, t, n) {
	var r = e.vars, i = r[t], a = W, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && He.length && it(), o && (W = o), l = s ? i.apply(c, s) : i.call(c), W = a, l;
}, fn = function(e) {
	return _t(e), e.scrollTrigger && e.scrollTrigger.kill(!!re), e.progress() < 1 && dn(e, "onInterrupt"), e;
}, pn, mn = [], hn = function(e) {
	if (e) if (e = !e.name && e.default || e, _e() || e.headless) {
		var t = e.name, n = fe(e), r = t && !n && e.init ? function() {
			this._props = [];
		} : e, i = {
			init: Le,
			render: fr,
			add: Gn,
			kill: mr,
			modifier: pr,
			rawVars: 0
		}, a = {
			targetTest: 0,
			get: 0,
			getSetter: cr,
			aliases: {},
			register: 0
		};
		if (Dn(), e !== r) {
			if (Ge[t]) return;
			ct(r, ct(ft(e, i), a)), ut(r.prototype, ut(i, ft(e, a))), Ge[r.prop = t] = r, e.targetTest && (Je.push(r), Ve[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
		}
		Ie(t, r), e.register && e.register(jr, r, _r);
	} else mn.push(e);
}, gn = 255, _n = {
	aqua: [
		0,
		gn,
		gn
	],
	lime: [
		0,
		gn,
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
		gn
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		gn,
		gn,
		gn
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		gn,
		gn,
		0
	],
	orange: [
		gn,
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
		gn,
		0,
		0
	],
	pink: [
		gn,
		192,
		203
	],
	cyan: [
		0,
		gn,
		gn
	],
	transparent: [
		gn,
		gn,
		gn,
		0
	]
}, vn = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * gn + .5 | 0;
}, yn = function(e, t, n) {
	var r = e ? pe(e) ? [
		e >> 16,
		e >> 8 & gn,
		e & gn
	] : 0 : _n.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), _n[e]) r = _n[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & gn,
				r & gn,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & gn,
				e & gn
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(xe), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = vn(s + 1 / 3, i, a), r[1] = vn(s, i, a), r[2] = vn(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(Se), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(xe) || _n.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / gn, a = r[1] / gn, o = r[2] / gn, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, bn = function(e) {
	var t = [], n = [], r = -1;
	return e.split(Sn).forEach(function(e) {
		var i = e.match(Ce) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, xn = function(e, t, n) {
	var r = "", i = (e + r).match(Sn), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = yn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = bn(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(Sn, "1").split(Ce), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(Sn), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, Sn = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in _n) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), Cn = /hsl[a]?\(/, wn = function(e) {
	var t = e.join(" "), n;
	if (Sn.lastIndex = 0, Sn.test(t)) return n = Cn.test(t), e[1] = xn(e[1], n), e[0] = xn(e[0], n, bn(e[1])), !0;
}, Tn, En = function() {
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
			Ne && (!ke && _e() && (Oe = ke = window, Ae = Oe.document || {}, je.gsap = jr, (Oe.gsapVersions ||= []).push(jr.version), Pe(Me || Oe.GreenSockGlobals || !Oe.gsap && Oe || {}), mn.forEach(hn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, Tn = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), Tn = 0, l = Le;
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
			return d.remove(e), s[n ? "unshift" : "push"](r), Dn(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), Dn = function() {
	return !Tn && En.wake();
}, On = {}, kn = /^[\d.\-M][\d.\-,\s]/, An = /["']/g, jn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(An, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, Mn = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, Nn = function(e) {
	var t = (e + "").split("("), n = On[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [jn(t[1])] : Mn(e).split(",").map(ot)) : On._CE && kn.test(e) ? On._CE("", e) : n;
}, Pn = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, Fn = function e(t, n) {
	for (var r = t._first, i; r;) r instanceof Un ? e(r, n) : r.vars.yoyoEase && (!r._yoyo || !r._repeat) && r._yoyo !== n && (r.timeline ? e(r.timeline, n) : (i = r._ease, r._ease = r._yEase, r._yEase = i, r._yoyo = n)), r = r._next;
}, In = function(e, t) {
	return e && (fe(e) ? e : On[e] || Nn(e)) || t;
}, Ln = function(e, t, n, r) {
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
	return $e(e, function(e) {
		for (var t in On[e] = je[e] = i, On[a = e.toLowerCase()] = n, i) On[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = On[e + "." + t] = i[t];
	}), i;
}, Rn = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, zn = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / ae * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * ue((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : Rn(s);
	return a = ae / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, Bn = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : Rn(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
$e("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	Ln(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), On.Linear.easeNone = On.none = On.Linear.easeIn, Ln("Elastic", zn("in"), zn("out"), zn()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	Ln("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), Ln("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), Ln("Circ", function(e) {
	return -(ce(1 - e * e) - 1);
}), Ln("Sine", function(e) {
	return e === 1 ? 1 : -le(e * oe) + 1;
}), Ln("Back", Bn("in"), Bn("out"), Bn()), On.SteppedEase = On.steps = je.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - G;
	return function(e) {
		return ((r * Vt(0, a, e) | 0) + i) * n;
	};
} }, U.ease = On["quad.out"], $e("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return Ye += e + "," + e + "Params,";
});
var Vn = function(e, t) {
	this.id = se++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : Qe, this.set = t ? t.getSetter : cr;
}, Hn = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, Ft(this, +e.duration, 1, 1), this.data = e.data, W && (this._ctx = W, W.data.push(this)), Tn || En.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, Ft(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (Dn(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (Et(this, e), !n._dp || n.parent || Dt(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && Ot(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === G || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), at(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + St(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + St(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? Ct(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -G ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? wt(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -G ? 0 : this._rts, this.totalTime(Vt(-Math.abs(this._delay), this._tDur, n), t !== !1), Tt(this), yt(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (Dn(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== G && (this._tTime -= G)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = e;
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && Ot(t, this, e - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (ge(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? wt(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = Be);
		var t = re;
		return re = e, (this._initted || this._startAt) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), re = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, It(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, It(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(Rt(this, e), ge(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, ge(t)), this._dur || (this._zTime = -G), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -G : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -G, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - G);
	}, t.eventCallback = function(e, t, n) {
		var r = this.vars;
		return arguments.length > 1 ? (t ? (r[e] = t, n && (r[e + "Params"] = n), e === "onUpdate" && (this._onUpdate = t)) : delete r[e], this) : r[e];
	}, t.then = function(e) {
		var t = this;
		return new Promise(function(n) {
			var r = fe(e) ? e : st, i = function() {
				var e = t.then;
				t.then = null, fe(r) && (r = r(t)) && (r.then || r === t) && (t.then = e), n(r), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? i() : t._prom = i;
		});
	}, t.kill = function() {
		fn(this);
	}, e;
}();
ct(Hn.prototype, {
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
	_zTime: -G,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var Un = /*#__PURE__*/ function(e) {
	V(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = ge(t.sortChildren), K && Ot(t.parent || K, B(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && kt(B(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return zt(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return zt(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return zt(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, pt(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new rr(e, t, Rt(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return Ot(this, rr.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new rr(e, n, Rt(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, pt(n).immediateRender = ge(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, pt(r).immediateRender = ge(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : tt(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== K && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = tt(o % f), o === i ? (d = this._repeat, c = a) : (_ = tt(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = Ct(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : tt(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && dn(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
					Fn(this, y);
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = Pt(this, tt(r), tt(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && c && !t && !d && (dn(this, "onStart"), this._tTime !== o)) return this;
			if (c >= r && e >= 0) for (l = this._first; l;) {
				if (u = l._next, (l._act || c >= l._start) && l._ts && m !== l) {
					if (l.parent !== this) return this.render(e, t, n);
					if (l.render(l._ts > 0 ? (c - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (c - l._start) * l._ts, t, n), c !== this._time || !this._ts && !p) {
						m = 0, u && (o += this._zTime = -G);
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
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || re && (l._initted || l._startAt)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -G : G);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -G)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, Tt(this), this.render(e, t, n);
			this._onUpdate && !t && dn(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && _t(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (dn(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (pe(t) || (t = Rt(this, t, e)), !(e instanceof Hn)) {
			if (be(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (de(e)) return this.addLabel(e, t);
			if (fe(e)) e = rr.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : Ot(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -ie);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof rr ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return de(e) ? this.removeLabel(e) : fe(e) ? this.killTweensOf(e) : (e.parent === this && gt(this, e), e === this._recent && (this._recent = this._last), vt(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = tt(En.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = Rt(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = rr.delayedCall(0, t || Le, n);
		return r.data = "isPause", this._hasPause = 1, Ot(this, r, Rt(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = Rt(this, e); t;) t._start === e && t.data === "isPause" && _t(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) Jn !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = qt(e), i = this._first, a = pe(t), o; i;) i instanceof rr ? rt(i._targets, r) && (a ? (!Jn || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = Rt(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = rr.to(n, ct({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || G,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && Ft(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, ct({ startAt: { time: Rt(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), un(this, Rt(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), un(this, Rt(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + G);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		for (var r = this._first, i = this.labels, a; r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return vt(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), vt(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = ie, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, Ot(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += o / n._ts, n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			Ft(n, n === K && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (K._ts && (at(K, wt(e, K)), We = En.frame), En.frame >= qe) {
			qe += H.autoSleep || 120;
			var t = K._first;
			if ((!t || !t._ts) && H.autoSleep && En._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || En.sleep();
			}
		}
	}, t;
}(Hn);
ct(Un.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var Wn = function(e, t, n, r, i, a, o) {
	var s = new _r(this._pt, e, t, 0, 1, dr, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = sn(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(we) || []; u = we.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? nt(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = we.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (Te.test(r) || g) && (s.e = 0), this._pt = s, s;
}, Gn = function(e, t, n, r, i, a, o, s, c, l) {
	fe(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? fe(u) ? c ? e[t.indexOf("set") || !fe(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = fe(u) ? c ? or : ar : ir, p;
	if (de(r) && (~r.indexOf("random(") && (r = sn(r)), r.charAt(1) === "=" && (p = nt(d, r) + (Ht(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || Yn) return !isNaN(d * r) && r !== "" ? (p = new _r(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? ur : lr, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && Fe(t, r), Wn.call(this, e, t, d, r, f, s || H.stringFilter, c));
}, Kn = function(e, t, n, r, i) {
	if (fe(e) && (e = er(e, i, t, n, r)), !he(e) || e.style && e.nodeType || be(e) || ye(e)) return de(e) ? er(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = er(e[o], i, t, n, r);
	return a;
}, qn = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (Ge[e] && (o = new Ge[e]()).init(i, o.rawVars ? t[e] : Kn(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new _r(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== pn)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, Jn, Yn, Xn = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !ne, b = t.timeline, x, S, C, w, T, E, D, O, k, A, j, M, N;
	if (b && (!f || !a) && (a = "none"), t._ease = In(a, U.ease), t._yEase = d ? Pn(In(d === !0 ? a : d, U.ease)) : 0, d && t._yoyo && !t._repeat && (d = t._yEase, t._yEase = t._ease, t._ease = d), t._from = !b && !!i.runBackwards, !b || f && !i.stagger) {
		if (O = g[0] ? Ze(g[0]).harness : 0, M = O && i[O.prop], x = ft(i, Ve), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? ze : Re), h._lazy = 0), o) {
			if (_t(t._startAt = rr.set(g, ct({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && ge(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return dn(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (re || !s && !p) && t._startAt.revert(ze), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), C = ct({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && ge(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, x), M && (C[O.prop] = M), _t(t._startAt = rr.set(g, C)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (re ? t._startAt.revert(ze) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, G, G);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && ge(c) || c && !m, S = 0; S < g.length; S++) {
			if (T = g[S], D = T._gsap || Xe(g)[S]._gsap, t._ptLookup[S] = A = {}, Ue[D.id] && He.length && it(), j = v === g ? S : v.indexOf(T), O && (k = new O()).init(T, M || x, t, j, v) !== !1 && (t._pt = w = new _r(t._pt, T, k.name, 0, 1, k.render, k, 0, k.priority), k._props.forEach(function(e) {
				A[e] = w;
			}), k.priority && (E = 1)), !O || M) for (C in x) Ge[C] && (k = qn(C, x, t, j, T, v)) ? k.priority && (E = 1) : A[C] = w = Gn.call(t, T, C, "get", x[C], j, v, 0, i.stringFilter);
			t._op && t._op[S] && t.kill(T, t._op[S]), y && t._pt && (Jn = t, K.killTweensOf(T, A, t.globalTime(n)), N = !t.parent, Jn = 0), t._pt && c && (Ue[D.id] = 1);
		}
		E && gr(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !N, f && n <= 0 && b.render(ie, !0, !0);
}, Zn = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return Yn = 1, e.vars[t] = "+=0", Xn(e, o), Yn = 0, s ? q(t + " not eligible for reset") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e &&= et(n) + Ht(u.e), u.b &&= l.s + Ht(u.b);
}, Qn = function(e, t) {
	var n = e[0] ? Ze(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = ut({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, $n = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (be(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
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
}, er = function(e, t, n, r, i) {
	return fe(e) ? e.call(t, n, r, i) : de(e) && ~e.indexOf("random(") ? sn(e) : e;
}, tr = Ye + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", nr = {};
$e(tr + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return nr[e] = 1;
});
var rr = /*#__PURE__*/ function(e) {
	V(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : pt(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = o.yoyoEase, g = n.parent || K, _ = (be(t) || ye(t) ? pe(t[0]) : "length" in n) ? [t] : qt(t), v, y, b, x, S, C, w, T;
		if (a._targets = _.length ? Xe(_) : q("GSAP target " + t + " not found. https://gsap.com", !H.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || ve(s) || ve(c)) {
			if (n = a.vars, v = a.timeline = new Un({
				data: "nested",
				defaults: p || {},
				targets: g && g.data === "nested" ? g.vars.targets : _
			}), v.kill(), v.parent = v._dp = B(a), v._start = 0, u || ve(s) || ve(c)) {
				if (x = _.length, w = u && Xt(u), he(u)) for (S in u) ~tr.indexOf(S) && (T ||= {}, T[S] = u[S]);
				for (y = 0; y < x; y++) b = ft(n, nr), b.stagger = 0, h && (b.yoyoEase = h), T && ut(b, T), C = _[y], b.duration = +er(s, B(a), y, C, _), b.delay = (+er(c, B(a), y, C, _) || 0) - a._delay, !u && x === 1 && b.delay && (a._delay = c = b.delay, a._start += c, b.delay = 0), v.to(C, b, w ? w(y, C, _) : 0), v._ease = On.none;
				v.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				pt(ct(v.vars.defaults, { ease: "none" })), v._ease = In(f.ease || n.ease || "none");
				var E = 0, D, O, k;
				if (be(f)) f.forEach(function(e) {
					return v.to(_, e, ">");
				}), v.duration();
				else {
					for (S in b = {}, f) S === "ease" || S === "easeEach" || $n(S, f[S], b, f.easeEach);
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
		return d === !0 && !ne && (Jn = B(a), K.killTweensOf(_), Jn = 0), Ot(g, B(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === tt(g._time) && ge(l) && xt(B(a)) && g.data !== "nested") && (a._tTime = -G, a.render(Math.max(0, -c) || 0)), m && kt(B(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - G && !o ? i : e < G ? 0 : e, c, l, u, d, f, p, m, h, g;
		if (!a) Nt(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = tt(s % d), s === i ? (u = this._repeat, c = a) : (f = tt(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (g = this._yEase, c = a - c), f = Ct(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && (h && this._yEase && Fn(h, p), this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(tt(d * u), !0).invalidate()._lock = 0));
			}
			if (!this._initted) {
				if (At(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
				if (r !== this._time && !(n && this.vars.repeatRefresh && u !== f)) return this;
				if (a !== this._dur) return this.render(e, t, n);
			}
			if (this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), this.ratio = m = (g || this._ease)(c / a), this._from && (this.ratio = m = 1 - m), c && !r && !t && !u && (dn(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && bt(this, e, t, n), dn(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && dn(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && bt(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && _t(this, 1), !t && !(o && !r) && (s || r || p) && (dn(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		Tn || En.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || Xn(this, a), o = this._ease(a / this._dur), Zn(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (Et(this, 0), this.parent || ht(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? fn(this) : this.scrollTrigger && this.scrollTrigger.kill(!!re), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, Jn && Jn.vars.overwrite !== !0)._first || fn(this), this.parent && n !== this.timeline.totalDuration() && Ft(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? qt(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && mt(r, i)) return t === "all" && (this._pt = 0), fn(this);
		for (s = this._op = this._op || [], t !== "all" && (de(t) && (d = {}, $e(t, function(e) {
			return d[e] = 1;
		}), t = d), t = Qn(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && gt(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && fn(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return zt(1, arguments);
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
		return zt(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return K.killTweensOf(e, t, n);
	}, t;
}(Hn);
ct(rr.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), $e("staggerTo,staggerFrom,staggerFromTo", function(e) {
	rr[e] = function() {
		var t = new Un(), n = Wt.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var ir = function(e, t, n) {
	return e[t] = n;
}, ar = function(e, t, n) {
	return e[t](n);
}, or = function(e, t, n, r) {
	return e[t](r.fp, n);
}, sr = function(e, t, n) {
	return e.setAttribute(t, n);
}, cr = function(e, t) {
	return fe(e[t]) ? ar : me(e[t]) && e.setAttribute ? sr : ir;
}, lr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, ur = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, dr = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, fr = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, pr = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, mr = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? gt(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, hr = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, gr = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, _r = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || lr, this.d = o || this, this.set = s || ir, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = hr, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
$e(Ye + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(e) {
	return Ve[e] = 1;
}), je.TweenMax = je.TweenLite = rr, je.TimelineLite = je.TimelineMax = Un, K = new Un({
	sortChildren: !1,
	defaults: U,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), H.stringFilter = wn;
var vr = [], yr = {}, br = [], xr = 0, Sr = 0, Cr = function(e) {
	return (yr[e] || br).map(function(e) {
		return e();
	});
}, wr = function() {
	var e = Date.now(), t = [];
	e - xr > 2 && (Cr("matchMediaInit"), vr.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = Oe.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), Cr("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), xr = e, Cr("matchMedia"));
}, Tr = /*#__PURE__*/ function() {
	function e(e, t) {
		this.selector = t && Jt(t), this.data = [], this._r = [], this.isReverted = !1, this.id = Sr++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		fe(e) && (n = t, t = e, e = fe);
		var r = this, i = function() {
			var e = W, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = Jt(n)), W = r, a = t.apply(r, arguments), fe(a) && r._r.push(a), W = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === fe ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = W;
		W = null, e(this), W = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof rr && !(n.parent && n.parent.data === "nested") && t.push(n);
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
			}), r = n.data.length; r--;) i = n.data[r], i instanceof Un ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof rr) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = vr.length; r--;) vr[r].id === this.id && vr.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), Er = /*#__PURE__*/ function() {
	function e(e) {
		this.contexts = [], this.scope = e, W && W.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		he(e) || (e = { matches: e });
		var r = new Tr(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in W && !r.selector && (r.selector = W.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = Oe.matchMedia(e[o]), a && (vr.indexOf(r) < 0 && vr.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(wr) : a.addEventListener("change", wr)));
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
}(), Dr = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return hn(e);
		});
	},
	timeline: function(e) {
		return new Un(e);
	},
	getTweensOf: function(e, t) {
		return K.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		de(e) && (e = qt(e)[0]);
		var i = Ze(e || {}).get, a = n ? st : ot;
		return n === "native" && (n = ""), e && (t ? a((Ge[t] && Ge[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((Ge[t] && Ge[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = qt(e), e.length > 1) {
			var r = e.map(function(e) {
				return jr.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = Ge[t], o = Ze(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			pn._pt = 0, r.init(e, n ? t + n : t, pn, 0, [e]), r.render(1, r), pn._pt && fr(1, pn);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = jr.to(e, ct((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return K.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = In(e.ease, U.ease)), dt(U, e || {});
	},
	config: function(e) {
		return dt(H, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !Ge[e] && !je[e] && q(t + " effect requires " + e + " plugin.");
		}), Ke[t] = function(e, t, r) {
			return n(qt(e), ct(t || {}, i), r);
		}, a && (Un.prototype[t] = function(e, n, r) {
			return this.add(Ke[t](e, he(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		On[e] = In(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? In(e, t) : On;
	},
	getById: function(e) {
		return K.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new Un(e), r, i;
		for (n.smoothChildTiming = ge(e.smoothChildTiming), K.remove(n), n._dp = 0, n._time = n._tTime = K._time, r = K._first; r;) i = r._next, (t || !(!r._dur && r instanceof rr && r.vars.onComplete === r._targets[0])) && Ot(n, r, r._start - r._delay), r = i;
		return Ot(K, n, 0), n;
	},
	context: function(e, t) {
		return e ? new Tr(e, t) : W;
	},
	matchMedia: function(e) {
		return new Er(e);
	},
	matchMediaRefresh: function() {
		return vr.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || wr();
	},
	addEventListener: function(e, t) {
		var n = yr[e] || (yr[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = yr[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: an,
		wrapYoyo: on,
		distribute: Xt,
		random: $t,
		snap: Qt,
		normalize: nn,
		getUnit: Ht,
		clamp: Ut,
		splitColor: yn,
		toArray: qt,
		selector: Jt,
		mapRange: cn,
		pipe: en,
		unitize: tn,
		interpolate: ln,
		shuffle: Yt
	},
	install: Pe,
	effects: Ke,
	ticker: En,
	updateRoot: Un.updateRoot,
	plugins: Ge,
	globalTimeline: K,
	core: {
		PropTween: _r,
		globals: Ie,
		Tween: rr,
		Timeline: Un,
		Animation: Hn,
		getCache: Ze,
		_removeLinkedListItem: gt,
		reverting: function() {
			return re;
		},
		context: function(e) {
			return e && W && (W.data.push(e), e._ctx = W), W;
		},
		suppressOverwrites: function(e) {
			return ne = e;
		}
	}
};
$e("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return Dr[e] = rr[e];
}), En.add(Un.updateRoot), pn = Dr.to({}, { duration: 0 });
var Or = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, kr = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = Or(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, Ar = function(e, t) {
	return {
		name: e,
		rawVars: 1,
		init: function(e, n, r) {
			r._onInit = function(e) {
				var r, i;
				if (de(n) && (r = {}, $e(n, function(e) {
					return r[e] = 1;
				}), n = r), t) {
					for (i in r = {}, n) r[i] = t(n[i]);
					n = r;
				}
				kr(e, n);
			};
		}
	};
}, jr = Dr.registerPlugin({
	name: "attr",
	init: function(e, t, n, r, i) {
		var a, o, s;
		for (a in this.tween = n, t) s = e.getAttribute(a) || "", o = this.add(e, "setAttribute", (s || 0) + "", t[a], r, i, 0, 0, a), o.op = a, o.b = s, this._props.push(a);
	},
	render: function(e, t) {
		for (var n = t._pt; n;) re ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, Ar("roundProps", Zt), Ar("modifiers"), Ar("snap", Qt)) || Dr;
rr.version = Un.version = jr.version = "3.12.7", Ne = 1, _e() && Dn(), On.Power0, On.Power1, On.Power2, On.Power3, On.Power4, On.Linear, On.Quad, On.Cubic, On.Quart, On.Quint, On.Strong, On.Elastic, On.Back, On.SteppedEase, On.Bounce, On.Sine, On.Expo, On.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var Mr, Nr, Pr, Fr, Ir, Lr, Rr, zr = function() {
	return typeof window < "u";
}, Br = {}, Vr = 180 / Math.PI, Hr = Math.PI / 180, Ur = Math.atan2, Wr = 1e8, Gr = /([A-Z])/g, Kr = /(left|right|width|margin|padding|x)/i, qr = /[\s,\(]\S/, Jr = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, Yr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, Xr = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, Zr = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, Qr = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, $r = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, ei = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, ti = function(e, t, n) {
	return e.style[t] = n;
}, ni = function(e, t, n) {
	return e.style.setProperty(t, n);
}, ri = function(e, t, n) {
	return e._gsap[t] = n;
}, ii = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, ai = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, oi = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, si = "transform", ci = si + "Origin", li = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in Br && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = Jr[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = Oi(i, e);
		}) : this.tfm[t] = o.x ? o[t] : Oi(i, t), t === ci && (this.tfm.zOrigin = o.zOrigin);
		else return Jr.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(si) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(ci, n, "")), t = si;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, ui = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, di = function() {
	var e = this.props, t = this.target, n = t.style, r = t._gsap, i, a;
	for (i = 0; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(Gr, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = Rr(), (!i || !i.isStart) && !n[si] && (ui(n), r.zOrigin && n[ci] && (n[ci] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, fi = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: di,
		save: li
	};
	return e._gsap || jr.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, pi, mi = function(e, t) {
	var n = Nr.createElementNS ? Nr.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : Nr.createElement(e);
	return n && n.style ? n : Nr.createElement(e);
}, hi = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(Gr, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, _i(n) || n, 1) || "";
}, gi = "O,Moz,ms,Ms,Webkit".split(","), _i = function(e, t, n) {
	var r = (t || Ir).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(gi[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? gi[i] : "") + e;
}, vi = function() {
	zr() && window.document && (Mr = window, Nr = Mr.document, Pr = Nr.documentElement, Ir = mi("div") || { style: {} }, mi("div"), si = _i(si), ci = si + "Origin", Ir.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", pi = !!_i("perspective"), Rr = jr.core.reverting, Fr = 1);
}, yi = function(e) {
	var t = e.ownerSVGElement, n = mi("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), Pr.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), Pr.removeChild(n), i;
}, bi = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, xi = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = yi(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = yi(e)), t && !t.width && !t.x && !t.y ? {
		x: +bi(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +bi(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, Si = function(e) {
	return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && xi(e));
}, Ci = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in Br && t !== ci && (t = si), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(Gr, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, wi = function(e, t, n, r, i, a) {
	var o = new _r(e._pt, t, n, 0, 1, a ? ei : $r);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, Ti = {
	deg: 1,
	rad: 1,
	turn: 1
}, Ei = {
	grid: 1,
	flex: 1
}, Di = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = Ir.style, c = Kr.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || Ti[i] || Ti[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && Si(t), (p || o === "%") && (Br[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], et(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === Nr || !h.appendChild) && (h = Nr.body), g = h._gsap, g && p && g.width && c && g.time === En.time && !g.uncache) return et(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : Ci(t, n);
	} else (p || o === "%") && !Ei[hi(h, "display")] && (s.position = hi(t, "position")), h === t && (s.position = "static"), h.appendChild(Ir), m = Ir[u], h.removeChild(Ir), s.position = "absolute";
	return c && p && (g = Ze(h), g.time = En.time, g.width = h[u]), et(f ? m * a / d : m && a ? d / m * a : 0);
}, Oi = function(e, t, n, r) {
	var i;
	return Fr || vi(), t in Jr && t !== "transform" && (t = Jr[t], ~t.indexOf(",") && (t = t.split(",")[0])), Br[t] && t !== "transform" ? (i = Bi(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : Vi(hi(e, ci)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = Ni[t] && Ni[t](e, t, n) || hi(e, t) || Qe(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? Di(e, t, i, n) + n : i;
}, ki = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = _i(t, e, 1), a = i && hi(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = hi(e, "borderTopColor"));
	}
	var o = new _r(this._pt, e.style, t, 0, 1, dr), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r === "auto" && (m = e.style[t], e.style[t] = r, r = hi(e, t) || r, m ? e.style[t] = m : Ci(e, t)), l = [n, r], wn(l), n = l[0], r = l[1], d = n.match(Ce) || [], b = r.match(Ce) || [], b.length) {
		for (; u = Ce.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = nt(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = Ce.lastIndex - v.length, v || (v = v || H.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = Di(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? ei : $r;
	return Te.test(r) && (o.e = 0), this._pt = o, o;
}, Ai = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, ji = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = Ai[n] || n, t[1] = Ai[r] || r, t.join(" ");
}, Mi = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], Br[o] && (s = 1, o = o === "transformOrigin" ? ci : si), Ci(n, o);
		s && (Ci(n, si), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", Bi(n, 1), a.uncache = 1, ui(r)));
	}
}, Ni = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new _r(e._pt, t, n, 0, 0, Mi);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, Pi = [
	1,
	0,
	0,
	1,
	0,
	0
], Fi = {}, Ii = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, Li = function(e) {
	var t = hi(e, si);
	return Ii(t) ? Pi : t.substr(7).match(Se).map(et);
}, Ri = function(e, t) {
	var n = e._gsap || Ze(e), r = e.style, i = Li(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? Pi : i) : (i === Pi && !e.offsetParent && e !== Pr && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, Pr.appendChild(e)), i = Li(e), s ? r.display = s : Ci(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : Pr.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, zi = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || Ri(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== Pi && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = xi(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[ci] = "0px 0px", a && (wi(a, o, "xOrigin", c, y), wi(a, o, "yOrigin", l, b), wi(a, o, "xOffset", u, o.xOffset), wi(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, Bi = function(e, t) {
	var n = e._gsap || new Vn(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = hi(e, ci) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A, j, M, N, ee, te, P, F, I, L, R;
	return n.svg = !!(e.getCTM && Si(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[si] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[si] === "none" ? "" : s[si])), r.scale = r.rotate = r.translate = "none"), S = Ri(e, n.svg), n.svg && (n.uncache ? (N = e.getBBox(), c = n.xOrigin - N.x + "px " + (n.yOrigin - N.y) + "px", M = "") : M = !t && e.getAttribute("data-svg-origin"), zi(e, M || c, !!M || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== Pi && (E = S[0], D = S[1], O = S[2], k = S[3], l = A = S[4], u = j = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? Ur(D, E) * Vr : 0, _ = O || k ? Ur(O, k) * Vr + m : 0, _ && (p *= Math.abs(Math.cos(_ * Hr))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (R = S[6], I = S[7], te = S[8], P = S[9], F = S[10], L = S[11], l = S[12], u = S[13], d = S[14], C = Ur(R, F), h = C * Vr, C && (w = Math.cos(-C), T = Math.sin(-C), M = A * w + te * T, N = j * w + P * T, ee = R * w + F * T, te = A * -T + te * w, P = j * -T + P * w, F = R * -T + F * w, L = I * -T + L * w, A = M, j = N, R = ee), C = Ur(-O, F), g = C * Vr, C && (w = Math.cos(-C), T = Math.sin(-C), M = E * w - te * T, N = D * w - P * T, ee = O * w - F * T, L = k * T + L * w, E = M, D = N, O = ee), C = Ur(D, E), m = C * Vr, C && (w = Math.cos(C), T = Math.sin(C), M = E * w + D * T, N = A * w + j * T, D = D * w - E * T, j = j * w - A * T, E = M, A = N), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = et(Math.sqrt(E * E + D * D + O * O)), p = et(Math.sqrt(j * j + R * R)), C = Ur(A, j), _ = Math.abs(C) > 2e-4 ? C * Vr : 0, y = L ? 1 / (L < 0 ? -L : L) : 0), n.svg && (M = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !Ii(hi(e, si)), M && e.setAttribute("transform", M))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = et(f), n.scaleY = et(p), n.rotation = et(m) + o, n.rotationX = et(h) + o, n.rotationY = et(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[ci] = Vi(c)), n.xOffset = n.yOffset = 0, n.force3D = H.force3D, n.renderTransform = n.svg ? Ji : pi ? qi : Ui, n.uncache = 0, n;
}, Vi = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, Hi = function(e, t, n) {
	var r = Ht(t);
	return et(parseFloat(t) + parseFloat(Di(e, "x", n + "px", r))) + r;
}, Ui = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, qi(e, t);
}, Wi = "0deg", Gi = "0px", Ki = ") ", qi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== Wi || l !== Wi)) {
		var x = parseFloat(l) * Hr, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * Hr, w = Math.cos(x), a = Hi(_, a, S * w * -v), o = Hi(_, o, -Math.sin(x) * -v), s = Hi(_, s, C * w * -v + v);
	}
	h !== Gi && (y += "perspective(" + h + Ki), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== Gi || o !== Gi || s !== Gi) && (y += s !== Gi || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + Ki), c !== Wi && (y += "rotate(" + c + Ki), l !== Wi && (y += "rotateY(" + l + Ki), u !== Wi && (y += "rotateX(" + u + Ki), (d !== Wi || f !== Wi) && (y += "skew(" + d + ", " + f + Ki), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + Ki), _.style[si] = y || "translate(0, 0)";
}, Ji = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= Hr, c *= Hr, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= Hr, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = et(b), x = et(x), S = et(S), C = et(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = Di(f, "x", a, "px"), y = Di(f, "y", o, "px")), (p || m || h || g) && (v = et(v + p - (p * b + m * S) + h), y = et(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = et(v + r / 100 * w.width), y = et(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[si] = w);
}, Yi = function(e, t, n, r, i) {
	var a = 360, o = de(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? Vr : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * Wr) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * Wr) % a - ~~(s / a) * a)), e._pt = u = new _r(e._pt, t, n, r, s, Xr), u.e = c, u.u = "deg", e._props.push(n), u;
}, Xi = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, Zi = function(e, t, n) {
	var r = Xi({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[si] = t, o = Bi(n, 1), Ci(n, si), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[si], a[si] = t, o = Bi(n, 1), a[si] = c), Br) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = Ht(c), p = Ht(l), u = f === p ? parseFloat(c) : Di(n, s, c, p), d = parseFloat(l), e._pt = new _r(e._pt, o, s, u, d - u, Yr), e._pt.u = p || 0, e._props.push(s));
	Xi(o, r);
};
$e("padding,margin,Width,Radius", function(e, t) {
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
	Ni[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return Oi(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var Qi = {
	name: "css",
	register: vi,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C;
		for (m in Fr || vi(), this.styles = this.styles || fi(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(Ge[m] && qn(m, t, n, r, e, i)))) {
			if (f = typeof l, p = Ni[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = sn(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", Sn.lastIndex = 0, Sn.test(c) || (h = Ht(c), g = Ht(l)), g ? h !== g && (c = Di(e, m, c, g) + g) : h && (l += h), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], de(c) && ~c.indexOf("random(") && (c = sn(c)), Ht(c + "") || c === "auto" || (c += H.units[m] || Ht(Oi(e, m)) || ""), (c + "").charAt(1) === "=" && (c = Oi(e, m))) : c = Oi(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in Jr && (m === "autoAlpha" && (d === 1 && Oi(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), wi(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = Jr[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Br, v) {
					if (this.styles.save(m), y || (b = e._gsap, b.renderTransform && !t.parseTransform || Bi(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new _r(this._pt, o, si, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new _r(this._pt, b, "scaleY", b.scaleY, (_ ? nt(b.scaleY, _ + u) : u) - b.scaleY || 0, Yr), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(ci, 0, o[ci]), l = ji(l), b.svg ? zi(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && wi(this, b, "zOrigin", b.zOrigin, g), wi(this, o, m, Vi(c), Vi(l)));
						continue;
					} else if (m === "svgOrigin") {
						zi(e, l, 1, x, 0, this);
						continue;
					} else if (m in Fi) {
						Yi(this, b, m, d, _ ? nt(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						wi(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						Zi(this, l, e);
						continue;
					}
				} else m in o || (m = _i(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !qr.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = Ht(l) || (m in H.units ? H.units[m] : h), h !== g && (d = Di(e, m, c, g)), this._pt = new _r(this._pt, v ? b : o, m, d, (_ ? nt(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? Qr : Yr), this._pt.u = g || 0, h !== g && g !== "%" && (this._pt.b = c, this._pt.r = Zr);
				else if (m in o) ki.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					Fe(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && gr(this);
	},
	render: function(e, t) {
		if (t.tween._time || !Rr()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: Oi,
	aliases: Jr,
	getSetter: function(e, t, n) {
		var r = Jr[t];
		return r && r.indexOf(",") < 0 && (t = r), t in Br && t !== ci && (e._gsap.x || Oi(e, "x")) ? n && Lr === n ? t === "scale" ? ii : ri : (Lr = n || {}) && (t === "scale" ? ai : oi) : e.style && !me(e.style[t]) ? ti : ~t.indexOf("-") ? ni : cr(e, t);
	},
	core: {
		_removeProperty: Ci,
		_getMatrix: Ri
	}
};
jr.utils.checkPrefix = _i, jr.core.getStyleSaver = fi, (function(e, t, n, r) {
	var i = $e(e + "," + t + "," + n, function(e) {
		Br[e] = 1;
	});
	$e(t, function(e) {
		H.units[e] = "deg", Fi[e] = 1;
	}), Jr[i[13]] = e + "," + t, $e(r, function(e) {
		var t = e.split(":");
		Jr[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), $e("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	H.units[e] = "px";
}), jr.registerPlugin(Qi);
//#endregion
//#region node_modules/gsap/index.js
var J = jr.registerPlugin(Qi) || jr;
J.core.Tween;
//#endregion
//#region src/table/animations/flip.ts
function $i(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function ea(e) {
	return {
		x: e.left + e.width / 2,
		y: e.top + e.height / 2
	};
}
function ta(e, t) {
	let n = ea(e), r = ea(t);
	return {
		x: n.x - r.x,
		y: n.y - r.y
	};
}
function na(e, t) {
	let n = ta(t, e);
	return {
		x: n.x,
		y: n.y
	};
}
//#endregion
//#region node_modules/gsap/utils/paths.js
var ra = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, ia = /(?:(-)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, aa = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/gi, oa = /(^[#\.][a-z]|[a-y][a-z])/i, sa = Math.PI / 180, ca = 180 / Math.PI, la = Math.sin, ua = Math.cos, da = Math.abs, fa = Math.sqrt, pa = Math.atan2, ma = 1e8, ha = function(e) {
	return typeof e == "string";
}, ga = function(e) {
	return typeof e == "number";
}, _a = function(e) {
	return e === void 0;
}, va = {}, ya = {}, ba = 1e5, xa = function(e) {
	return Math.round((e + ma) % 1 * ba) / ba || (e < 0 ? 0 : 1);
}, Sa = function(e) {
	return Math.round(e * ba) / ba || 0;
}, Ca = function(e) {
	return Math.round(e * 1e10) / 1e10 || 0;
}, wa = function(e, t, n, r) {
	var i = e[t], a = r === 1 ? 6 : Ba(i, n, r);
	if ((a || !r) && a + n + 2 < i.length) return e.splice(t, 0, i.slice(0, n + a + 2)), i.splice(0, n + a), 1;
}, Ta = function(e, t, n) {
	var r = e.length, i = ~~(n * r);
	if (e[i] > t) {
		for (; --i && e[i] > t;);
		i < 0 && (i = 0);
	} else for (; e[++i] < t && i < r;);
	return i < r ? i : r - 1;
}, Ea = function(e, t) {
	var n = e.length;
	for (t || e.reverse(); n--;) e[n].reversed || ja(e[n]);
}, Da = function(e, t) {
	return t.totalLength = e.totalLength, e.samples ? (t.samples = e.samples.slice(0), t.lookup = e.lookup.slice(0), t.minLength = e.minLength, t.resolution = e.resolution) : e.totalPoints && (t.totalPoints = e.totalPoints), t;
}, Oa = function(e, t) {
	var n = e.length, r = e[n - 1] || [], i = r.length;
	n && t[0] === r[i - 2] && t[1] === r[i - 1] && (t = r.concat(t.slice(2)), n--), e[n] = t;
};
function ka(e) {
	e = ha(e) && oa.test(e) && document.querySelector(e) || e;
	var t = e.getAttribute ? e : 0, n;
	return t && (e = e.getAttribute("d")) ? (t._gsPath ||= {}, n = t._gsPath[e], n && !n._dirty ? n : t._gsPath[e] = Ga(e)) : e ? ha(e) ? Ga(e) : ga(e[0]) ? [e] : e : console.warn("Expecting a <path> element or an SVG path data string");
}
function Aa(e) {
	for (var t = [], n = 0; n < e.length; n++) t[n] = Da(e[n], e[n].slice(0));
	return Da(e, t);
}
function ja(e) {
	var t = 0, n;
	for (e.reverse(); t < e.length; t += 2) n = e[t], e[t] = e[t + 1], e[t + 1] = n;
	e.reversed = !e.reversed;
}
var Ma = function(e, t) {
	var n = document.createElementNS("http://www.w3.org/2000/svg", "path"), r = [].slice.call(e.attributes), i = r.length, a;
	for (t = "," + t + ","; --i > -1;) a = r[i].nodeName.toLowerCase(), t.indexOf("," + a + ",") < 0 && n.setAttributeNS(null, a, r[i].nodeValue);
	return n;
}, Na = {
	rect: "rx,ry,x,y,width,height",
	circle: "r,cx,cy",
	ellipse: "rx,ry,cx,cy",
	line: "x1,x2,y1,y2"
}, Pa = function(e, t) {
	for (var n = t ? t.split(",") : [], r = {}, i = n.length; --i > -1;) r[n[i]] = +e.getAttribute(n[i]) || 0;
	return r;
};
function Fa(e, t) {
	var n = e.tagName.toLowerCase(), r = .552284749831, i, a, o, s, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T;
	return n === "path" || !e.getBBox ? e : (l = Ma(e, "x,y,width,height,cx,cy,rx,ry,r,x1,x2,y1,y2,points"), T = Pa(e, Na[n]), n === "rect" ? (s = T.rx, c = T.ry || s, a = T.x, o = T.y, p = T.width - s * 2, m = T.height - c * 2, s || c ? (h = a + s * (1 - r), g = a + s, _ = g + p, v = _ + s * r, y = _ + s, b = o + c * (1 - r), x = o + c, S = x + m, C = S + c * r, w = S + c, i = "M" + y + "," + x + " V" + S + " C" + [
		y,
		C,
		v,
		w,
		_,
		w,
		_ - (_ - g) / 3,
		w,
		g + (_ - g) / 3,
		w,
		g,
		w,
		h,
		w,
		a,
		C,
		a,
		S,
		a,
		S - (S - x) / 3,
		a,
		x + (S - x) / 3,
		a,
		x,
		a,
		b,
		h,
		o,
		g,
		o,
		g + (_ - g) / 3,
		o,
		_ - (_ - g) / 3,
		o,
		_,
		o,
		v,
		o,
		y,
		b,
		y,
		x
	].join(",") + "z") : i = "M" + (a + p) + "," + o + " v" + m + " h" + -p + " v" + -m + " h" + p + "z") : n === "circle" || n === "ellipse" ? (n === "circle" ? (s = c = T.r, d = s * r) : (s = T.rx, c = T.ry, d = c * r), a = T.cx, o = T.cy, u = s * r, i = "M" + (a + s) + "," + o + " C" + [
		a + s,
		o + d,
		a + u,
		o + c,
		a,
		o + c,
		a - u,
		o + c,
		a - s,
		o + d,
		a - s,
		o,
		a - s,
		o - d,
		a - u,
		o - c,
		a,
		o - c,
		a + u,
		o - c,
		a + s,
		o - d,
		a + s,
		o
	].join(",") + "z") : n === "line" ? i = "M" + T.x1 + "," + T.y1 + " L" + T.x2 + "," + T.y2 : (n === "polyline" || n === "polygon") && (f = (e.getAttribute("points") + "").match(ia) || [], a = f.shift(), o = f.shift(), i = "M" + a + "," + o + " L" + f.join(","), n === "polygon" && (i += "," + a + "," + o + "z")), l.setAttribute("d", Ja(l._gsRawPath = Ga(i))), t && e.parentNode && (e.parentNode.insertBefore(l, e), e.parentNode.removeChild(e)), l);
}
function Ia(e, t, n) {
	var r = e[t], i = e[t + 2], a = e[t + 4], o;
	return r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, o = i + (a + (e[t + 6] - a) * n - i) * n - r, r = e[t + 1], i = e[t + 3], a = e[t + 5], r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, Sa(pa(i + (a + (e[t + 7] - a) * n - i) * n - r, o) * ca);
}
function La(e, t, n) {
	n = _a(n) ? 1 : Ca(n) || 0, t = Ca(t) || 0;
	var r = Math.max(0, ~~(da(n - t) - 1e-8)), i = Aa(e);
	if (t > n && (t = 1 - t, n = 1 - n, Ea(i), i.totalLength = 0), t < 0 || n < 0) {
		var a = Math.abs(~~Math.min(t, n)) + 1;
		t += a, n += a;
	}
	i.totalLength || za(i);
	var o = n > 1, s = Va(i, t, va, !0), c = Va(i, n, ya), l = c.segment, u = s.segment, d = c.segIndex, f = s.segIndex, p = c.i, m = s.i, h = f === d, g = p === m && h, _, v, y, b, x, S, C, w;
	if (o || r) {
		for (_ = d < f || h && p < m || g && c.t < s.t, wa(i, f, m, s.t) && (f++, _ || (d++, g ? (c.t = (c.t - s.t) / (1 - s.t), p = 0) : h && (p -= m))), Math.abs(1 - (n - t)) < 1e-5 ? d = f - 1 : !c.t && d ? d-- : wa(i, d, p, c.t) && _ && f++, s.t === 1 && (f = (f + 1) % i.length), x = [], S = i.length, C = 1 + S * r, w = f, C += (S - f + d) % S, b = 0; b < C; b++) Oa(x, i[w++ % S]);
		i = x;
	} else if (y = c.t === 1 ? 6 : Ba(l, p, c.t), t !== n) for (v = Ba(u, m, g ? s.t / c.t : s.t), h && (y += v), l.splice(p + y + 2), (v || m) && u.splice(0, m + v), b = i.length; b--;) (b < f || b > d) && i.splice(b, 1);
	else l.angle = Ia(l, p + y, 0), p += y, s = l[p], c = l[p + 1], l.length = l.totalLength = 0, l.totalPoints = i.totalPoints = 8, l.push(s, c, s, c, s, c, s, c);
	return i.totalLength = 0, i;
}
function Ra(e, t, n) {
	t ||= 0, e.samples || (e.samples = [], e.lookup = []);
	var r = ~~e.resolution || 12, i = 1 / r, a = n ? t + n * 6 + 1 : e.length, o = e[t], s = e[t + 1], c = t ? t / 6 * r : 0, l = e.samples, u = e.lookup, d = (t ? e.minLength : ma) || ma, f = l[c + n * r - 1], p = t ? l[c - 1] : 0, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A;
	for (l.length = u.length = 0, h = t + 2; h < a; h += 6) {
		if (g = e[h + 4] - o, _ = e[h + 2] - o, v = e[h] - o, x = e[h + 5] - s, S = e[h + 3] - s, C = e[h + 1] - s, y = b = w = T = 0, da(g) < .01 && da(x) < .01 && da(v) + da(C) < .01) e.length > 8 && (e.splice(h, 6), h -= 6, a -= 6);
		else for (m = 1; m <= r; m++) D = i * m, E = 1 - D, y = b - (b = (D * D * g + 3 * E * (D * _ + E * v)) * D), w = T - (T = (D * D * x + 3 * E * (D * S + E * C)) * D), k = fa(w * w + y * y), k < d && (d = k), p += k, l[c++] = p;
		o += g, s += x;
	}
	if (f) for (f -= p; c < l.length; c++) l[c] += f;
	if (l.length && d) {
		if (e.totalLength = A = l[l.length - 1] || 0, e.minLength = d, A / d < 9999) for (k = O = 0, m = 0; m < A; m += d) u[k++] = l[O] < m ? ++O : O;
	} else e.totalLength = l[0] = 0;
	return t ? p - l[t / 2 - 1] : p;
}
function za(e, t) {
	var n, r, i;
	for (i = n = r = 0; i < e.length; i++) e[i].resolution = ~~t || 12, r += e[i].length, n += Ra(e[i]);
	return e.totalPoints = r, e.totalLength = n, e;
}
function Ba(e, t, n) {
	if (n <= 0 || n >= 1) return 0;
	var r = e[t], i = e[t + 1], a = e[t + 2], o = e[t + 3], s = e[t + 4], c = e[t + 5], l = e[t + 6], u = e[t + 7], d = r + (a - r) * n, f = a + (s - a) * n, p = i + (o - i) * n, m = o + (c - o) * n, h = d + (f - d) * n, g = p + (m - p) * n, _ = s + (l - s) * n, v = c + (u - c) * n;
	return f += (_ - f) * n, m += (v - m) * n, e.splice(t + 2, 4, Sa(d), Sa(p), Sa(h), Sa(g), Sa(h + (f - h) * n), Sa(g + (m - g) * n), Sa(f), Sa(m), Sa(_), Sa(v)), e.samples && e.samples.splice(t / 6 * e.resolution | 0, 0, 0, 0, 0, 0, 0, 0), 6;
}
function Va(e, t, n, r) {
	n ||= {}, e.totalLength || za(e), (t < 0 || t > 1) && (t = xa(t));
	var i = 0, a = e[0], o, s, c, l, u, d, f;
	if (!t) f = d = i = 0, a = e[0];
	else if (t === 1) f = 1, i = e.length - 1, a = e[i], d = a.length - 8;
	else {
		if (e.length > 1) {
			for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = d;
			a = e[i], l = u - a.totalLength, t = (c - l) / (u - l) || 0;
		}
		o = a.samples, s = a.resolution, c = a.totalLength * t, d = a.lookup.length ? a.lookup[~~(c / a.minLength)] || 0 : Ta(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s), d = ~~(d / s) * 6, r && f === 1 && (d + 6 < a.length ? (d += 6, f = 0) : i + 1 < e.length && (d = f = 0, a = e[++i]));
	}
	return n.t = f, n.i = d, n.path = e, n.segment = a, n.segIndex = i, n;
}
function Ha(e, t, n, r) {
	var i = e[0], a = r || {}, o, s, c, l, u, d, f, p, m;
	if ((t < 0 || t > 1) && (t = xa(t)), i.lookup || za(e), e.length > 1) {
		for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = e[d];
		l = u - i.totalLength, t = (c - l) / (u - l) || 0;
	}
	return o = i.samples, s = i.resolution, c = i.totalLength * t, d = i.lookup.length ? i.lookup[t < 1 ? ~~(c / i.minLength) : i.lookup.length - 1] || 0 : Ta(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s) || 0, m = 1 - f, d = ~~(d / s) * 6, p = i[d], a.x = Sa((f * f * (i[d + 6] - p) + 3 * m * (f * (i[d + 4] - p) + m * (i[d + 2] - p))) * f + p), a.y = Sa((f * f * (i[d + 7] - (p = i[d + 1])) + 3 * m * (f * (i[d + 5] - p) + m * (i[d + 3] - p))) * f + p), n && (a.angle = i.totalLength ? Ia(i, d, f >= 1 ? .999999999 : f || 1e-9) : i.angle || 0), a;
}
function Ua(e, t, n, r, i, a, o) {
	for (var s = e.length, c, l, u, d, f; --s > -1;) for (c = e[s], l = c.length, u = 0; u < l; u += 2) d = c[u], f = c[u + 1], c[u] = d * t + f * r + a, c[u + 1] = d * n + f * i + o;
	return e._dirty = 1, e;
}
function Wa(e, t, n, r, i, a, o, s, c) {
	if (!(e === s && t === c)) {
		n = da(n), r = da(r);
		var l = i % 360 * sa, u = ua(l), d = la(l), f = Math.PI, p = f * 2, m = (e - s) / 2, h = (t - c) / 2, g = u * m + d * h, _ = -d * m + u * h, v = g * g, y = _ * _, b = v / (n * n) + y / (r * r);
		b > 1 && (n = fa(b) * n, r = fa(b) * r);
		var x = n * n, S = r * r, C = (x * S - x * y - S * v) / (x * y + S * v);
		C < 0 && (C = 0);
		var w = (a === o ? -1 : 1) * fa(C), T = w * (n * _ / r), E = w * -(r * g / n), D = (e + s) / 2, O = (t + c) / 2, k = D + (u * T - d * E), A = O + (d * T + u * E), j = (g - T) / n, M = (_ - E) / r, N = (-g - T) / n, ee = (-_ - E) / r, te = j * j + M * M, P = (M < 0 ? -1 : 1) * Math.acos(j / fa(te)), F = (j * ee - M * N < 0 ? -1 : 1) * Math.acos((j * N + M * ee) / fa(te * (N * N + ee * ee)));
		isNaN(F) && (F = f), !o && F > 0 ? F -= p : o && F < 0 && (F += p), P %= p, F %= p;
		var I = Math.ceil(da(F) / (p / 4)), L = [], R = F / I, z = 4 / 3 * la(R / 2) / (1 + ua(R / 2)), B = u * n, V = d * n, H = d * -r, U = u * r, ne;
		for (ne = 0; ne < I; ne++) i = P + ne * R, g = ua(i), _ = la(i), j = ua(i += R), M = la(i), L.push(g - z * _, _ + z * g, j + z * M, M - z * j, j, M);
		for (ne = 0; ne < L.length; ne += 2) g = L[ne], _ = L[ne + 1], L[ne] = g * B + _ * H + k, L[ne + 1] = g * V + _ * U + A;
		return L[ne - 2] = s, L[ne - 1] = c, L;
	}
}
function Ga(e) {
	var t = (e + "").replace(aa, function(e) {
		var t = +e;
		return t < 1e-4 && t > -1e-4 ? 0 : t;
	}).match(ra) || [], n = [], r = 0, i = 0, a = 2 / 3, o = t.length, s = 0, c = "ERROR: malformed path: " + e, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w = function(e, t, n, r) {
		v = (n - e) / 3, y = (r - t) / 3, h.push(e + v, t + y, n - v, r - y, n, r);
	};
	if (!e || !isNaN(t[0]) || isNaN(t[1])) return console.log(c), n;
	for (l = 0; l < o; l++) if (x = p, isNaN(t[l]) ? (p = t[l].toUpperCase(), m = p !== t[l]) : l--, d = +t[l + 1], f = +t[l + 2], m && (d += r, f += i), l || (g = d, _ = f), p === "M") h && (h.length < 8 ? --n.length : s += h.length), r = g = d, i = _ = f, h = [d, f], n.push(h), l += 2, p = "L";
	else if (p === "C") h ||= [0, 0], m || (r = i = 0), h.push(d, f, r + t[l + 3] * 1, i + t[l + 4] * 1, r += t[l + 5] * 1, i += t[l + 6] * 1), l += 6;
	else if (p === "S") v = r, y = i, (x === "C" || x === "S") && (v += r - h[h.length - 4], y += i - h[h.length - 3]), m || (r = i = 0), h.push(v, y, d, f, r += t[l + 3] * 1, i += t[l + 4] * 1), l += 4;
	else if (p === "Q") v = r + (d - r) * a, y = i + (f - i) * a, m || (r = i = 0), r += t[l + 3] * 1, i += t[l + 4] * 1, h.push(v, y, r + (d - r) * a, i + (f - i) * a, r, i), l += 4;
	else if (p === "T") v = r - h[h.length - 4], y = i - h[h.length - 3], h.push(r + v, i + y, d + (r + v * 1.5 - d) * a, f + (i + y * 1.5 - f) * a, r = d, i = f), l += 2;
	else if (p === "H") w(r, i, r = d, i), l += 1;
	else if (p === "V") w(r, i, r, i = d + (m ? i - r : 0)), l += 1;
	else if (p === "L" || p === "Z") p === "Z" && (d = g, f = _, h.closed = !0), (p === "L" || da(r - d) > .5 || da(i - f) > .5) && (w(r, i, d, f), p === "L" && (l += 2)), r = d, i = f;
	else if (p === "A") {
		if (S = t[l + 4], C = t[l + 5], v = t[l + 6], y = t[l + 7], u = 7, S.length > 1 && (S.length < 3 ? (y = v, v = C, u--) : (y = C, v = S.substr(2), u -= 2), C = S.charAt(1), S = S.charAt(0)), b = Wa(r, i, +t[l + 1], +t[l + 2], +t[l + 3], +S, +C, (m ? r : 0) + v * 1, (m ? i : 0) + y * 1), l += u, b) for (u = 0; u < b.length; u++) h.push(b[u]);
		r = h[h.length - 2], i = h[h.length - 1];
	} else console.log(c);
	return l = h.length, l < 6 ? (n.pop(), l = 0) : h[0] === h[l - 2] && h[1] === h[l - 1] && (h.closed = !0), n.totalPoints = s + l, n;
}
function Ka(e, t) {
	t === void 0 && (t = 1);
	for (var n = e[0], r = 0, i = [n, r], a = 2; a < e.length; a += 2) i.push(n, r, e[a], r = (e[a] - n) * t / 2, n = e[a], -r);
	return i;
}
function qa(e, t) {
	da(e[0] - e[2]) < 1e-4 && da(e[1] - e[3]) < 1e-4 && (e = e.slice(2));
	var n = e.length - 2, r = +e[0], i = +e[1], a = +e[2], o = +e[3], s = [
		r,
		i,
		r,
		i
	], c = a - r, l = o - i, u = Math.abs(e[n] - r) < .001 && Math.abs(e[n + 1] - i) < .001, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T;
	for (u && (e.push(a, o), a = r, o = i, r = e[n - 2], i = e[n - 1], e.unshift(r, i), n += 4), t = t || t === 0 ? +t : 1, p = 2; p < n; p += 2) d = r, f = i, r = a, i = o, a = +e[p + 2], o = +e[p + 3], !(r === a && i === o) && (m = c, h = l, c = a - r, l = o - i, g = fa(m * m + h * h), _ = fa(c * c + l * l), v = fa((c / _ + m / g) ** 2 + (l / _ + h / g) ** 2), y = (g + _) * t * .25 / v, b = r - (r - d) * (g ? y / g : 0), x = r + (a - r) * (_ ? y / _ : 0), S = r - (b + ((x - b) * (g * 3 / (g + _) + .5) / 4 || 0)), C = i - (i - f) * (g ? y / g : 0), w = i + (o - i) * (_ ? y / _ : 0), T = i - (C + ((w - C) * (g * 3 / (g + _) + .5) / 4 || 0)), (r !== d || i !== f) && s.push(Sa(b + S), Sa(C + T), Sa(r), Sa(i), Sa(x + S), Sa(w + T)));
	return r !== a || i !== o || s.length < 4 ? s.push(Sa(a), Sa(o), Sa(a), Sa(o)) : s.length -= 2, s.length === 2 ? s.push(r, i, r, i, r, i) : u && (s.splice(0, 6), s.length -= 6), s;
}
function Ja(e) {
	ga(e[0]) && (e = [e]);
	var t = "", n = e.length, r, i, a, o;
	for (i = 0; i < n; i++) {
		for (o = e[i], t += "M" + Sa(o[0]) + "," + Sa(o[1]) + " C", r = o.length, a = 2; a < r; a++) t += Sa(o[a++]) + "," + Sa(o[a++]) + " " + Sa(o[a++]) + "," + Sa(o[a++]) + " " + Sa(o[a++]) + "," + Sa(o[a]) + " ";
		o.closed && (t += "z");
	}
	return t;
}
//#endregion
//#region node_modules/gsap/utils/matrix.js
var Ya, Xa, Za, Qa, $a, eo, to, no, ro = "transform", Y = ro + "Origin", io, ao = function(e) {
	var t = e.ownerDocument || e;
	for (!(ro in e.style) && ("msTransform" in e.style) && (ro = "msTransform", Y = ro + "Origin"); t.parentNode && (t = t.parentNode););
	if (Xa = window, to = new yo(), t) {
		Ya = t, Za = t.documentElement, Qa = t.body, no = Ya.createElementNS("http://www.w3.org/2000/svg", "g"), no.style.transform = "none";
		var n = t.createElement("div"), r = t.createElement("div"), i = t && (t.body || t.firstElementChild);
		i && i.appendChild && (i.appendChild(n), n.appendChild(r), n.setAttribute("style", "position:static;transform:translate3d(0,0,1px)"), io = r.offsetParent !== n, i.removeChild(n));
	}
	return t;
}, oo = function(e) {
	for (var t, n; e && e !== Qa;) n = e._gsap, n && n.uncache && n.get(e, "x"), n && !n.scaleX && !n.scaleY && n.renderTransform && (n.scaleX = n.scaleY = 1e-4, n.renderTransform(1, n), t ? t.push(n) : t = [n]), e = e.parentNode;
	return t;
}, so = [], co = [], lo = function() {
	return Xa.pageYOffset || Ya.scrollTop || Za.scrollTop || Qa.scrollTop || 0;
}, uo = function() {
	return Xa.pageXOffset || Ya.scrollLeft || Za.scrollLeft || Qa.scrollLeft || 0;
}, fo = function(e) {
	return e.ownerSVGElement || ((e.tagName + "").toLowerCase() === "svg" ? e : null);
}, po = function e(t) {
	if (Xa.getComputedStyle(t).position === "fixed") return !0;
	if (t = t.parentNode, t && t.nodeType === 1) return e(t);
}, mo = function e(t, n) {
	if (t.parentNode && (Ya || ao(t))) {
		var r = fo(t), i = r ? r.getAttribute("xmlns") || "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml", a = r ? n ? "rect" : "g" : "div", o = n === 2 ? 100 : 0, s = n === 3 ? 100 : 0, c = "position:absolute;display:block;pointer-events:none;margin:0;padding:0;", l = Ya.createElementNS ? Ya.createElementNS(i.replace(/^https/, "http"), a) : Ya.createElement(a);
		return n && (r ? (eo ||= e(t), l.setAttribute("width", .01), l.setAttribute("height", .01), l.setAttribute("transform", "translate(" + o + "," + s + ")"), eo.appendChild(l)) : ($a || ($a = e(t), $a.style.cssText = c), l.style.cssText = c + "width:0.1px;height:0.1px;top:" + s + "px;left:" + o + "px", $a.appendChild(l))), l;
	}
	throw "Need document and parent.";
}, ho = function(e) {
	for (var t = new yo(), n = 0; n < e.numberOfItems; n++) t.multiply(e.getItem(n).matrix);
	return t;
}, go = function(e) {
	var t = e.getCTM(), n;
	return t || (n = e.style[ro], e.style[ro] = "none", e.appendChild(no), t = no.getCTM(), e.removeChild(no), n ? e.style[ro] = n : e.style.removeProperty(ro.replace(/([A-Z])/g, "-$1").toLowerCase())), t || to.clone();
}, _o = function(e, t) {
	var n = fo(e), r = e === n, i = n ? so : co, a = e.parentNode, o, s, c, l, u, d;
	if (e === Xa) return e;
	if (i.length || i.push(mo(e, 1), mo(e, 2), mo(e, 3)), o = n ? eo : $a, n) r ? (c = go(e), l = -c.e / c.a, u = -c.f / c.d, s = to) : e.getBBox ? (c = e.getBBox(), s = e.transform ? e.transform.baseVal : {}, s = s.numberOfItems ? s.numberOfItems > 1 ? ho(s) : s.getItem(0).matrix : to, l = s.a * c.x + s.c * c.y, u = s.b * c.x + s.d * c.y) : (s = new yo(), l = u = 0), t && e.tagName.toLowerCase() === "g" && (l = u = 0), (r ? n : a).appendChild(o), o.setAttribute("transform", "matrix(" + s.a + "," + s.b + "," + s.c + "," + s.d + "," + (s.e + l) + "," + (s.f + u) + ")");
	else {
		if (l = u = 0, io) for (s = e.offsetParent, c = e; (c &&= c.parentNode) && c !== s && c.parentNode;) (Xa.getComputedStyle(c)[ro] + "").length > 4 && (l = c.offsetLeft, u = c.offsetTop, c = 0);
		if (d = Xa.getComputedStyle(e), d.position !== "absolute" && d.position !== "fixed") for (s = e.offsetParent; a && a !== s;) l += a.scrollLeft || 0, u += a.scrollTop || 0, a = a.parentNode;
		c = o.style, c.top = e.offsetTop - u + "px", c.left = e.offsetLeft - l + "px", c[ro] = d[ro], c[Y] = d[Y], c.position = d.position === "fixed" ? "fixed" : "absolute", e.parentNode.appendChild(o);
	}
	return o;
}, vo = function(e, t, n, r, i, a, o) {
	return e.a = t, e.b = n, e.c = r, e.d = i, e.e = a, e.f = o, e;
}, yo = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a) {
		e === void 0 && (e = 1), t === void 0 && (t = 0), n === void 0 && (n = 0), r === void 0 && (r = 1), i === void 0 && (i = 0), a === void 0 && (a = 0), vo(this, e, t, n, r, i, a);
	}
	var t = e.prototype;
	return t.inverse = function() {
		var e = this.a, t = this.b, n = this.c, r = this.d, i = this.e, a = this.f, o = e * r - t * n || 1e-10;
		return vo(this, r / o, -t / o, -n / o, e / o, (n * a - r * i) / o, -(e * a - t * i) / o);
	}, t.multiply = function(e) {
		var t = this.a, n = this.b, r = this.c, i = this.d, a = this.e, o = this.f, s = e.a, c = e.c, l = e.b, u = e.d, d = e.e, f = e.f;
		return vo(this, s * t + l * r, s * n + l * i, c * t + u * r, c * n + u * i, a + d * t + f * r, o + d * n + f * i);
	}, t.clone = function() {
		return new e(this.a, this.b, this.c, this.d, this.e, this.f);
	}, t.equals = function(e) {
		var t = this.a, n = this.b, r = this.c, i = this.d, a = this.e, o = this.f;
		return t === e.a && n === e.b && r === e.c && i === e.d && a === e.e && o === e.f;
	}, t.apply = function(e, t) {
		t === void 0 && (t = {});
		var n = e.x, r = e.y, i = this.a, a = this.b, o = this.c, s = this.d, c = this.e, l = this.f;
		return t.x = n * i + r * o + c || 0, t.y = n * a + r * s + l || 0, t;
	}, e;
}();
function bo(e, t, n, r) {
	if (!e || !e.parentNode || (Ya || ao(e)).documentElement === e) return new yo();
	var i = oo(e), a = fo(e) ? so : co, o = _o(e, n), s = a[0].getBoundingClientRect(), c = a[1].getBoundingClientRect(), l = a[2].getBoundingClientRect(), u = o.parentNode, d = !r && po(e), f = new yo((c.left - s.left) / 100, (c.top - s.top) / 100, (l.left - s.left) / 100, (l.top - s.top) / 100, s.left + (d ? 0 : uo()), s.top + (d ? 0 : lo()));
	if (u.removeChild(o), i) for (s = i.length; s--;) c = i[s], c.scaleX = c.scaleY = 0, c.renderTransform(1, c);
	return t ? f.inverse() : f;
}
//#endregion
//#region node_modules/gsap/MotionPathPlugin.js
var xo = "x,translateX,left,marginLeft,xPercent".split(","), So = "y,translateY,top,marginTop,yPercent".split(","), Co = Math.PI / 180, wo, To, Eo, Do, Oo, ko, Ao = function() {
	return wo || typeof window < "u" && (wo = window.gsap) && wo.registerPlugin && wo;
}, jo = function(e, t, n, r) {
	for (var i = t.length, a = r === 2 ? 0 : r, o = 0; o < i; o++) e[a] = parseFloat(t[o][n]), r === 2 && (e[a + 1] = 0), a += 2;
	return e;
}, Mo = function(e, t, n) {
	return parseFloat(e._gsap.get(e, t, n || "px")) || 0;
}, No = function(e) {
	var t = e[0], n = e[1], r;
	for (r = 2; r < e.length; r += 2) t = e[r] += t, n = e[r + 1] += n;
}, Po = function(e, t, n, r, i, a, o, s, c) {
	return o.type === "cubic" ? t = [t] : (o.fromCurrent !== !1 && t.unshift(Mo(n, r, s), i ? Mo(n, i, c) : 0), o.relative && No(t), t = [(i ? qa : Ka)(t, o.curviness)]), t = a(zo(t, n, o)), Bo(e, n, r, t, "x", s), i && Bo(e, n, i, t, "y", c), za(t, o.resolution || (o.curviness === 0 ? 20 : 12));
}, Fo = function(e) {
	return e;
}, Io = /[-+\.]*\d+\.?(?:e-|e\+)?\d*/g, Lo = function(e, t, n) {
	var r = bo(e), i = 0, a = 0, o;
	return (e.tagName + "").toLowerCase() === "svg" ? (o = e.viewBox.baseVal, o.width || (o = {
		width: +e.getAttribute("width"),
		height: +e.getAttribute("height")
	})) : o = t && e.getBBox && e.getBBox(), t && t !== "auto" && (i = t.push ? t[0] * (o ? o.width : e.offsetWidth || 0) : t.x, a = t.push ? t[1] * (o ? o.height : e.offsetHeight || 0) : t.y), n.apply(i || a ? r.apply({
		x: i,
		y: a
	}) : {
		x: r.e,
		y: r.f
	});
}, Ro = function(e, t, n, r) {
	var i = bo(e.parentNode, !0, !0), a = i.clone().multiply(bo(t)), o = Lo(e, n, i), s = Lo(t, r, i), c = s.x, l = s.y, u;
	return a.e = a.f = 0, r === "auto" && t.getTotalLength && t.tagName.toLowerCase() === "path" && (u = t.getAttribute("d").match(Io) || [], u = a.apply({
		x: +u[0],
		y: +u[1]
	}), c += u.x, l += u.y), u && (u = a.apply(t.getBBox()), c -= u.x, l -= u.y), a.e = c - o.x, a.f = l - o.y, a;
}, zo = function(e, t, n) {
	var r = n.align, i = n.matrix, a = n.offsetX, o = n.offsetY, s = n.alignOrigin, c = e[0][0], l = e[0][1], u = Mo(t, "x"), d = Mo(t, "y"), f, p, m;
	return !e || !e.length ? ka("M0,0L0,0") : (r && (r === "self" || (f = Do(r)[0] || t) === t ? Ua(e, 1, 0, 0, 1, u - c, d - l) : (s && s[2] !== !1 ? wo.set(t, { transformOrigin: s[0] * 100 + "% " + s[1] * 100 + "%" }) : s = [Mo(t, "xPercent") / -100, Mo(t, "yPercent") / -100], p = Ro(t, f, s, "auto"), m = p.apply({
		x: c,
		y: l
	}), Ua(e, p.a, p.b, p.c, p.d, u + p.e - (m.x - p.e), d + p.f - (m.y - p.f)))), i ? Ua(e, i.a, i.b, i.c, i.d, i.e, i.f) : (a || o) && Ua(e, 1, 0, 0, 1, a || 0, o || 0), e);
}, Bo = function(e, t, n, r, i, a) {
	var o = t._gsap, s = o.harness, c = s && s.aliases && s.aliases[n], l = c && c.indexOf(",") < 0 ? c : n, u = e._pt = new To(e._pt, t, l, 0, 0, Fo, 0, o.set(t, l, e));
	u.u = Eo(o.get(t, l, a)) || 0, u.path = r, u.pp = i, e._props.push(l);
}, Vo = function(e, t) {
	return function(n) {
		return e || t !== 1 ? La(n, e, t) : n;
	};
}, Ho = {
	version: "3.12.7",
	name: "motionPath",
	register: function(e, t, n) {
		wo = e, Eo = wo.utils.getUnit, Do = wo.utils.toArray, Oo = wo.core.getStyleSaver, ko = wo.core.reverting || function() {}, To = n;
	},
	init: function(e, t, n) {
		if (!wo) return console.warn("Please gsap.registerPlugin(MotionPathPlugin)"), !1;
		(!(typeof t == "object" && !t.style) || !t.path) && (t = { path: t });
		var r = [], i = t, a = i.path, o = i.autoRotate, s = i.unitX, c = i.unitY, l = i.x, u = i.y, d = a[0], f = Vo(t.start, "end" in t ? t.end : 1), p, m;
		if (this.rawPaths = r, this.target = e, this.tween = n, this.styles = Oo && Oo(e, "transform"), (this.rotate = o || o === 0) && (this.rOffset = parseFloat(o) || 0, this.radians = !!t.useRadians, this.rProp = t.rotation || "rotation", this.rSet = e._gsap.set(e, this.rProp, this), this.ru = Eo(e._gsap.get(e, this.rProp)) || 0), Array.isArray(a) && !("closed" in a) && typeof d != "number") {
			for (m in d) !l && ~xo.indexOf(m) ? l = m : !u && ~So.indexOf(m) && (u = m);
			for (m in l && u ? r.push(Po(this, jo(jo([], a, l, 0), a, u, 1), e, l, u, f, t, s || Eo(a[0][l]), c || Eo(a[0][u]))) : l = u = 0, d) m !== l && m !== u && r.push(Po(this, jo([], a, m, 2), e, m, 0, f, t, Eo(a[0][m])));
		} else p = f(zo(ka(t.path), e, t)), za(p, t.resolution), r.push(p), Bo(this, e, t.x || "x", p, "x", t.unitX || "px"), Bo(this, e, t.y || "y", p, "y", t.unitY || "px");
		n.vars.immediateRender && this.render(n.progress(), this);
	},
	render: function(e, t) {
		var n = t.rawPaths, r = n.length, i = t._pt;
		if (t.tween._time || !ko()) {
			for (e > 1 ? e = 1 : e < 0 && (e = 0); r--;) Ha(n[r], e, !r && t.rotate, n[r]);
			for (; i;) i.set(i.t, i.p, i.path[i.pp] + i.u, i.d, e), i = i._next;
			t.rotate && t.rSet(t.target, t.rProp, n[0].angle * (t.radians ? Co : 1) + t.rOffset + t.ru, t, e);
		} else t.styles.revert();
	},
	getLength: function(e) {
		return za(ka(e)).totalLength;
	},
	sliceRawPath: La,
	getRawPath: ka,
	pointsToSegment: qa,
	stringToRawPath: Ga,
	rawPathToString: Ja,
	transformRawPath: Ua,
	getGlobalMatrix: bo,
	getPositionOnPath: Ha,
	cacheRawPathMeasurements: za,
	convertToPath: function(e, t) {
		return Do(e).map(function(e) {
			return Fa(e, t !== !1);
		});
	},
	convertCoordinates: function(e, t, n) {
		var r = bo(t, !0, !0).multiply(bo(e));
		return n ? r.apply(n) : r;
	},
	getAlignMatrix: Ro,
	getRelativePosition: function(e, t, n, r) {
		var i = Ro(e, t, n, r);
		return {
			x: i.e,
			y: i.f
		};
	},
	arrayToRawPath: function(e, t) {
		t ||= {};
		var n = jo(jo([], e, t.x || "x", 0), e, t.y || "y", 1);
		return t.relative && No(n), [t.type === "cubic" ? n : qa(n, t.curviness)];
	}
};
Ao() && wo.registerPlugin(Ho);
//#endregion
//#region src/table/animations/initMotion.ts
var Uo = !1;
function Wo() {
	typeof window > "u" || Uo || (J.registerPlugin(Ho), Uo = !0);
}
function Go() {
	return Wo(), !!J.plugins?.motionPath;
}
function Ko(e) {
	typeof window > "u" || (Wo(), ((e instanceof HTMLElement ? e : null) ?? document.querySelector(".btable-wrap") ?? document.querySelector(".btable-session"))?.setAttribute("data-gsap-motion", "true"));
}
//#endregion
//#region src/table/animations/arcTween.ts
function qo(e, t) {
	Wo();
	let { path: n, curviness: r = 1.2, duration: i, ease: a, onComplete: o, ...s } = t, c = n[n.length - 1] ?? {
		x: 0,
		y: 0
	};
	if (Go()) return J.to(e, {
		motionPath: {
			path: n,
			curviness: r
		},
		duration: i,
		ease: a,
		onComplete: o,
		...s
	});
	let l = n[0] ?? {
		x: 0,
		y: 0
	}, u = n[1] ?? {
		x: (l.x + c.x) * .5,
		y: (l.y + c.y) * .5
	};
	return J.to(e, { keyframes: [{
		...s,
		x: u.x,
		y: u.y,
		duration: i * .5,
		ease: a
	}, {
		...s,
		x: c.x,
		y: c.y,
		duration: i * .5,
		ease: a,
		onComplete: o
	}] });
}
//#endregion
//#region src/table/discardPileModel.ts
function Jo(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Yo(e, t) {
	return (e >>> t & 65535) / 65535;
}
function Xo(e, t) {
	let n = Jo(`${e}@${t}`), r = Yo(n, 0), i = Yo(n, 7), a = Yo(n, 14), o = Yo(n, 21), s = r >= .5 ? 1 : -1, c = i >= .5 ? 1 : -1, l = a >= .5 ? 1 : -1;
	return {
		offsetX: s * (12 + r * 6),
		offsetY: c * (12 + i * 6),
		rotation: l * (7 + a * 2),
		scale: .94 + o * .04,
		zIndex: t + 1
	};
}
function Zo(e) {
	let t = Xo(e.id, e.pileIndex);
	return {
		...e,
		...t
	};
}
function Qo(e) {
	let t = [];
	for (let n = 0; n < e.discardCount; n++) {
		let r = e.heroCardKeys?.[n];
		t.push(r ?? `${e.playerId}:h${e.handNumber}:d${e.pileStartIndex + n}`);
	}
	return t;
}
//#endregion
//#region src/table/animations/discardPileMotion.ts
var $o = /* @__PURE__ */ new Set(), es = I.drawDiscard;
function ts(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function ns(e = document) {
	let t = (e instanceof Document ? e : e.ownerDocument ?? document).querySelector("[data-discard-pile-anchor]");
	return t ? $i(t) : null;
}
function rs() {
	for (let e of $o) e.kill();
	$o.clear();
}
function is(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function as(e, t, n, r = {}) {
	Ko(r.root ?? document);
	let i = z(), a = ns(r.root ?? document), o = R(es, i), s = i ? .03 : .055, c = J.timeline({ onComplete: () => {
		$o.delete(c), r.onComplete?.();
	} });
	$o.add(c), e.forEach((e, l) => {
		let u = Xo(t[l] ?? `discard-${n + l}`, n + l), d = $i(e);
		if (J.set(e, {
			transformOrigin: "50% 50%",
			willChange: "transform,opacity",
			zIndex: 4
		}), !a || i) {
			c.to(e, {
				opacity: 0,
				scale: u.scale,
				duration: Math.min(o, .2),
				onComplete: () => {
					J.set(e, { clearProps: "transform,opacity,willChange,zIndex" }), r.onCardComplete?.(l);
				}
			}, l * s);
			return;
		}
		let f = a.left + a.width / 2 + u.offsetX, p = a.top + a.height / 2 + u.offsetY, m = d.left + d.width / 2, h = d.top + d.height / 2, g = f - m, _ = p - h, { midX: v, midY: y } = ts(g, _);
		J.set(e, {
			x: 0,
			y: 0,
			rotation: 0,
			scale: 1,
			opacity: 1
		}), c.add(qo(e, {
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
			curviness: 1.2,
			rotation: u.rotation,
			scale: u.scale,
			opacity: .92,
			duration: o,
			ease: te,
			onComplete: () => {
				J.set(e, { clearProps: "transform,opacity,willChange,zIndex" }), r.onCardComplete?.(l);
			}
		}), l * s);
	});
	let l = Math.round((e.length > 0 ? (e.length - 1) * s : 0) * 1e3 + o * 1e3 + 40);
	return is(c, Math.min(420, Math.max(280, l))), c;
}
function os(e, t, n, r, i = {}) {
	let a = [];
	for (let t = 0; t < e.length; t++) {
		let n = e[t], i = document.createElement("div");
		i.className = "discard-fly-ghost", i.setAttribute("aria-hidden", "true"), i.style.position = "fixed", i.style.left = `${n.left}px`, i.style.top = `${n.top}px`, i.style.width = `${n.width}px`, i.style.height = `${n.height}px`, i.style.pointerEvents = "none", i.style.zIndex = "4", r.appendChild(i), a.push(i);
	}
	let o = as(a, t, n, {
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
function ss(e, t, n) {
	let r = n.querySelector(`[data-seat-play-origin="${e}"]`) ?? n.querySelector(`[data-trick-play-origin="${e}"]`);
	if (!r) return [];
	let i = $i(r);
	return Array.from({ length: t }, (e, t) => ({
		...i,
		left: i.left + t * 3,
		top: i.top - t * 2
	}));
}
//#endregion
//#region src/table/animations/cardMotion.ts
function cs() {
	Ko();
}
var ls = /* @__PURE__ */ new WeakMap();
function us(e = document) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = t.querySelector("[data-testid=\"deal-button\"]") ?? t.querySelector(".deck-stack__pile") ?? t.querySelector(".deck-stack");
	return n ? $i(n) : null;
}
function ds(e) {
	e && (ls.get(e)?.kill(), ls.delete(e), J.killTweensOf(e), J.set(e, { clearProps: "transform,opacity,filter" }));
}
function fs(e, t, n = .22) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * n)
	};
}
function ps(e, t, n = I.dealStagger) {
	cs();
	let r = z(), i = J.timeline(), a = R(I.deal, r);
	return e.forEach((e, o) => {
		let { x: s, y: c } = na($i(e), t), { midX: l, midY: u } = fs(s, c, .28);
		J.set(e, {
			transformOrigin: "50% 80%",
			willChange: "transform,opacity"
		}), J.set(e, {
			x: s,
			y: c,
			rotation: -14 + o * 2,
			rotationY: r ? 0 : -72,
			scale: .58,
			opacity: +!!r
		});
		let d = o * (r ? .04 : n), f = () => {
			J.set(e, { clearProps: "transform,opacity,willChange" });
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
		}, d) : i.add(qo(e, {
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
			curviness: 1.2,
			rotation: 0,
			rotationY: 0,
			scale: 1,
			opacity: 1,
			duration: a,
			ease: te,
			onComplete: f
		}), d);
	}), i;
}
function ms(e, t) {
	cs();
	let n = z(), r = J.timeline(), i = R(I.drawReceive, n), a = n ? .04 : I.drawReceiveStagger;
	return e.forEach((e, n) => {
		let { x: o, y: s } = na($i(e), t);
		J.set(e, {
			transformOrigin: "50% 80%",
			willChange: "transform,opacity"
		}), J.set(e, {
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
				J.set(e, { transition: "none" }), J.set(e, { clearProps: "transform,opacity,willChange,transition" });
			}
		}, n * a);
	}), r;
}
function hs(e) {
	cs();
	let t = J.timeline(), n = R(I.standPat);
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
				J.set(e, { clearProps: "transform,willChange" });
			}
		}, 0);
	}), t;
}
function gs(e) {
	cs();
	let t = J.timeline(), n = R(I.foldOut);
	return e.forEach((e, r) => {
		J.set(e, {
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
			onComplete: () => ds(e)
		}, r * .04);
	}), t;
}
//#endregion
//#region src/table/animations/drawSeatMotion.ts
var _s = /* @__PURE__ */ new Set();
function vs(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function ys() {
	for (let e of _s) e.kill();
	_s.clear();
}
function bs(e) {
	let t = document.createElement("div");
	return t.className = "draw-receive-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function xs(e, t, n, r = {}) {
	Ko(n);
	let i = z(), a = R(I.drawReceive, i), o = i ? .04 : I.drawReceiveStagger, s = [];
	for (let r = 0; r < t.length; r++) {
		let t = bs(e);
		n.appendChild(t), s.push(t);
	}
	let c = J.timeline({ onComplete: () => {
		for (let e of s) e.remove();
		_s.delete(c), window.clearTimeout(u), r.onComplete?.();
	} });
	_s.add(c);
	let l = Math.round((s.length > 0 ? (s.length - 1) * o : 0) * 1e3 + a * 1e3 + 40), u = window.setTimeout(() => {
		c.progress() < 1 && c.progress(1);
	}, Math.min(680, Math.max(320, l)));
	return c.eventCallback("onInterrupt", () => {
		for (let e of s) e.remove();
		_s.delete(c), window.clearTimeout(u);
	}), s.forEach((e, n) => {
		let r = t[n], s = $i(e), l = r.left + r.width / 2, u = r.top + r.height / 2, d = s.left + s.width / 2, f = s.top + s.height / 2, p = l - d, m = u - f, { midX: h, midY: g } = vs(p, m);
		if (J.set(e, {
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
					J.set(e, { clearProps: "transform,opacity,willChange" });
				}
			}, n * o + Math.min(a, .18));
			return;
		}
		let _ = n * o, v = _ + a * .78;
		c.add(qo(e, {
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
			curviness: 1.2,
			rotationY: 0,
			scale: 1,
			opacity: .92,
			duration: a * .78,
			ease: F
		}), _), c.to(e, {
			opacity: 0,
			scale: .92,
			duration: a * .22,
			ease: "power1.in",
			onComplete: () => {
				J.set(e, { clearProps: "transform,opacity,willChange" });
			}
		}, v);
	}), c;
}
function Ss(e) {
	let { playerId: t, replaceCount: n, root: r, onComplete: i } = e;
	if (n <= 0) {
		i?.();
		return;
	}
	let a = us(r), o = ss(t, n, r);
	if (!a || !o.length) {
		i?.();
		return;
	}
	xs(a, o, r, { onComplete: i });
}
//#endregion
//#region src/table/hooks/useDiscardPileState.ts
function Cs({ handNumber: e, sessionPhase: t }) {
	let [n, r] = (0, l.useState)([]), i = (0, l.useRef)(0), a = (0, l.useRef)(e), o = (0, l.useRef)(t ?? null);
	return (0, l.useEffect)(() => {
		a.current !== e && (a.current = e, i.current = 0, rs(), ys(), r([]));
	}, [e]), (0, l.useEffect)(() => {
		let e = t ?? null, n = o.current;
		o.current = e, n === "draw" && e === "play" && (rs(), ys(), r([]));
	}, [t]), {
		cards: n,
		pileIndexRef: i,
		commitDiscardCards: (0, l.useCallback)((t) => {
			if (!t.length) return;
			let n = t.map((t) => Zo({
				id: t.id,
				playerId: t.playerId,
				handNumber: e,
				pileIndex: i.current++
			}));
			r((e) => [...e, ...n]);
		}, [e])
	};
}
function ws({ cardElements: e, cardKeys: t, playerId: n, pileStartIndex: r, root: i, onComplete: a }) {
	let o = [];
	as(e, t, r, {
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
function Ts({ playerId: e, handNumber: t, discardCount: n, pileStartIndex: r, root: i, onComplete: a }) {
	let o = Qo({
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
	let s = ss(e, n, i);
	if (!s.length) {
		a(o.map((t) => ({
			id: t,
			playerId: e
		})));
		return;
	}
	os(s, o, r, i, { onComplete: () => a(o.map((t) => ({
		id: t,
		playerId: e
	}))) });
}
function Es(e, t) {
	return t.map((t) => {
		let n = e[t];
		return n ? `${n.rank}-${n.suit}` : `idx-${t}`;
	});
}
function Ds(e, t) {
	if (!e) return [];
	let n = [...e.querySelectorAll(".hand__slot .pcard")];
	return t.length > 0 ? t.map((e) => n[e]).filter((e) => !!e) : [...e.querySelectorAll(".hand__slot--draw-selected .pcard, .hand__slot--draw-recommended .pcard")];
}
//#endregion
//#region src/table/animations/useHeroCardMotion.ts
function Os(e) {
	return `${e.rank}-${e.suit}`;
}
function ks(e) {
	return e ? [...e.querySelectorAll(".hand__slot .pcard")] : [];
}
function As(e, { dealing: t, dealStaggerMs: n, drawAnimSubPhase: r, drawDiscardCount: i = 0, drawReplaceCount: a = 0, pendingDiscardIndices: o, standPatPulse: s, foldOutPulse: c, playingIndex: u, cards: d, handNumber: f = 0, playerId: p = null, tableRootRef: m, pileIndexRef: h, onDiscardCommitted: g, skipHeroDealMotion: _ = !1 }) {
	let v = (0, l.useRef)([]), y = (0, l.useRef)(!1), b = (0, l.useRef)(null), x = (0, l.useRef)(null), S = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		Ko(e.current?.closest(".btable-wrap") ?? document);
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
		let r = e.current, i = ks(r);
		if (!i.length) return;
		y.current = !0;
		let a = us(r ?? document);
		a && ps(i, a, Math.max(.04, n / 1e3));
	}, [
		t,
		d.length,
		n,
		e,
		_
	]), (0, l.useLayoutEffect)(() => {
		if (r === "discard") {
			if (i <= 0) return;
			S.current = null, v.current = d.map(Os);
			let t = e.current, n = m?.current ?? t?.closest(".btable-wrap"), r = Ds(t, o);
			if (!r.length || !n || !p) return;
			let a = `${f}:${p}:discard:${r.length}:${o.join(",")}`;
			if (x.current === a) return;
			x.current = a, ws({
				cardElements: r,
				cardKeys: Es(d, o.length ? o : r.map((e, t) => t)),
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
			let t = e.current, n = ks(t), r = new Set(v.current), i = d.map((e, t) => ({
				key: Os(e),
				el: n[t]
			})).filter((e) => !!e.el && !r.has(e.key));
			if (!i.length) return;
			let o = i.map((e) => e.key).sort().join(","), s = `${f}:${p ?? ""}:receive:${a}:${o}`;
			if (S.current === s) return;
			S.current = s;
			let c = us(t ?? document);
			c && ms(i.map((e) => e.el), c);
			return;
		}
		(r === "done" || r === null) && (x.current = null, S.current = null, v.current = d.map(Os));
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
		let t = ks(e.current);
		t.length && hs(t);
	}, [s, e]), (0, l.useLayoutEffect)(() => {
		if (!c) return;
		let t = ks(e.current);
		t.length && gs(t);
	}, [c, e]), (0, l.useLayoutEffect)(() => {
		let t = e.current, n = ks(t);
		if (u === null) {
			if (b.current !== null) {
				let e = n[b.current];
				e && ds(e), b.current = null;
			}
			return;
		}
		if (b.current === u) return;
		if (b.current !== null) {
			let e = n[b.current];
			e && ds(e);
		}
		let r = n[u];
		r && (ds(r), b.current = u);
	}, [
		u,
		d,
		e
	]), (0, l.useLayoutEffect)(() => () => {
		for (let t of ks(e.current)) ds(t);
	}, [e]);
}
function js(e, t) {
	let n = t / 1e3, r = Math.max(e - 1, 0) * n;
	return Math.round((r + I.deal) * 1e3);
}
//#endregion
//#region src/table/handUi.ts
function Ms(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function Ns(e, t) {
	if (t) return "Join hand";
	switch (e) {
		case "reveal": return "Deal";
		case "decision": return "Join hand";
		case "draw": return "Draw";
		case "play": return "Play card";
		default: return "Waiting";
	}
}
function Ps(e) {
	return {
		spades: "Spades",
		hearts: "Hearts",
		diamonds: "Diamonds",
		clubs: "Clubs"
	}[e ?? ""] ?? e ?? "—";
}
function Fs(e) {
	return e === "reveal" || e === "decision" || e === "draw" || e === "play";
}
function Is(e) {
	return e === "decision";
}
function Ls(e) {
	return e === "reveal";
}
function Rs(e, t) {
	if (!e) return null;
	let n = t.find((t) => t.playerId === e);
	return n ? n.isSelf ? "Your turn" : `${n.displayName}'s turn` : null;
}
//#endregion
//#region src/table/trickPlayFly.ts
var zs = /* @__PURE__ */ new Map(), Bs = /* @__PURE__ */ new Map();
function Vs(e) {
	return `${e.playerId}:${e.card.rank}:${e.card.suit}`;
}
function Hs(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function Us(e) {
	return document.querySelector(`[data-seat-play-origin="${e}"]`);
}
function Ws(e) {
	let t = Us(e);
	return t ? Hs(t) : null;
}
function Gs(e) {
	return document.querySelector(`[data-trick-play-origin-active="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin-active="${e}"]`) ?? document.querySelector(`[data-trick-play-origin="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin="${e}"]`) ?? Us(e);
}
function Ks(e) {
	let t = Gs(e);
	return t ? Hs(t) : null;
}
function qs(e) {
	let t = Ks(e);
	if (t) return Bs.set(e, t), t;
	let n = Ws(e);
	return n ? (Bs.set(e, n), n) : null;
}
function Js(e) {
	for (let t of e) qs(t);
}
function Ys(e) {
	return Bs.get(e);
}
function Xs(e, t) {
	if (t) {
		let e = zs.get(t);
		if (e) return e;
	}
	return Ys(e) ?? Ks(e) ?? Ws(e) ?? null;
}
function Zs(e, t) {
	let n = Xs(e, t);
	return n && zs.set(t, n), n;
}
function Qs(e, t, n) {
	let r = document.querySelector("[data-testid=\"hero-hand\"]")?.querySelectorAll(".hand__slot .pcard")[n];
	if (r) {
		let n = Hs(r);
		return zs.set(t, n), Bs.set(e, n), n;
	}
	return Zs(e, t);
}
function $s(e, t, n) {
	let r = e.left + e.width / 2, i = e.top + e.height / 2, a = n.left + n.width / 2, o = n.top + n.height / 2;
	return {
		dx: r - a,
		dy: i - o
	};
}
function ec() {
	zs.clear(), Bs.clear();
}
//#endregion
//#region src/table/tableMicrointeractions.ts
var tc = {
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
}, nc = {
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
function rc(e) {
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
function ic(e, t) {
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
var ac = "nbl-best-play";
function oc() {
	try {
		return localStorage.getItem(ac) === "1";
	} catch {
		return !1;
	}
}
function sc(e) {
	try {
		localStorage.setItem(ac, e ? "1" : "0");
	} catch {}
}
//#endregion
//#region src/game/playerOrder.ts
function cc(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function lc(e, t, n) {
	let r = cc(e, n), i = new Set(t);
	return r.filter((e) => i.has(e));
}
//#endregion
//#region src/game/types.ts
var uc = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
};
function dc(e) {
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
function fc(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/playContext.ts
function pc(e, t) {
	let n = O(e, t);
	return n.length ? n.reduce((e, t) => E(t) >= E(e) ? t : e) : null;
}
function mc(e) {
	if (!e.cinchEnabled) return !1;
	let t = O(e.hand, e.trumpSuit);
	return t.filter((e) => E(e) >= 13).length >= 3 && t.length > 0;
}
function hc(e, t) {
	let n = pc(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function gc(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => fc([e.card])[0]) : [];
}
function _c(e) {
	let t = e.currentTrick ?? null, n = gc(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function vc(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = _c(e.publicHand);
	return {
		hand: e.hand,
		trumpSuit: e.publicHand.trumpSuit,
		leadSuit: r,
		trickPlays: t,
		isLeading: n,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	};
}
function yc(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return mc(e) && !hc(n, e) ? {
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
function bc(e, t, n, r) {
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
function xc(e, t, n) {
	let r = e.filter((e) => !D(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => E(t) > E(e) ? t : e) : null;
}
function Sc(e, t) {
	let n = e.filter((e) => D(e, t));
	return n.length ? n.reduce((e, t) => E(t) > E(e) ? t : e) : null;
}
function Cc(e, t) {
	return E(e) > E(t);
}
function wc(e) {
	return {
		hand: e.hand,
		trumpSuit: e.trumpSuit,
		leadSuit: e.leadSuit,
		trickPlays: e.trickPlays,
		isLeading: e.isLeading,
		cinchEnabled: e.cinchEnabled
	};
}
function Tc(e, t = {}) {
	let n = wc(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = yc(n, r);
			i.allowed ? e.push(r) : bc(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? O(n.hand, r) : [], a = O(n.hand, n.trumpSuit), o = r ? xc(n.trickPlays, r, n.trumpSuit) : null, s = Sc(n.trickPlays, n.trumpSuit), c;
	if (i.length > 0) {
		if (c = i, !s && o) {
			let e = i.filter((e) => Cc(e, o));
			e.length && (c = e);
		}
	} else if (a.length > 0) {
		if (c = a, s) {
			let e = a.filter((e) => Cc(e, s));
			e.length && (c = e);
		}
	} else c = [...n.hand];
	let l = [];
	for (let e = 0; e < n.hand.length; e += 1) c.some((t) => t.rank === n.hand[e].rank && t.suit === n.hand[e].suit) && l.push(e);
	return l;
}
//#endregion
//#region src/game/trick.ts
function Ec(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => D(e.card, n));
	if (r.length) return r.reduce((e, t) => E(t.card) > E(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => E(t.card) > E(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
function Dc(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: E(e),
		trump: D(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function Oc(e, t) {
	let n = Tc(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => E(e[n]) > E(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => E(e[n]) < E(e[t]) ? n : t);
	let i = n.filter((n) => Ec([...t.trickPlays.map((e, t) => ({
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
function kc(e, t) {
	return e === t ? null : t;
}
function Ac(e) {
	let t = kc(e.selectedPlay, e.tappedIndex), n = t === null && e.selectedPlay === e.tappedIndex;
	return {
		nextSelection: t,
		shouldImmediatePlay: t !== null && e.isMyTurn && e.isLegal && !n,
		shouldQueueSelection: t !== null && !e.isMyTurn && e.isLegal && !n,
		shouldCancelAutoplay: n || t !== e.selectedPlay,
		isDeselect: n
	};
}
function jc(e, t) {
	return e && t;
}
function Mc(e) {
	return `${e.handNumber}:${e.trickNumber ?? 0}:${e.turnPlayerId ?? ""}:${e.phase ?? ""}`;
}
function Nc(e, t) {
	return e.handNumber !== t.handNumber || (e.phase ?? "") !== (t.phase ?? "");
}
function Pc(e) {
	let [t, n, r, i] = e.split(":");
	return {
		handNumber: Number(t) || 0,
		trickNumber: n === "" || n === "0" ? null : Number(n),
		turnPlayerId: r || null,
		phase: i || null
	};
}
function Fc(e) {
	return e.showBestPlayControl && e.inPlayPhase && e.bestPlayEnabled && e.recommendedPlayIndex !== null && e.recommendedPlayIndex >= 0;
}
function Ic(e) {
	return e.inPlayPhase ? e.selectedPlay === e.cardIndex ? "play-preselected" : e.showBestPlayRecommendation && e.recommendedPlayIndex === e.cardIndex ? "play-recommended" : e.isMyTurn && e.isLegal && !e.busy ? "legal-playable" : null : null;
}
function Lc(e, t) {
	return t ? t.includes(e) : !0;
}
function Rc(e, t, n) {
	if (!n?.length || !e.length) return null;
	let r = Oc(e, vc({
		hand: e,
		publicHand: t
	}));
	return n.includes(r) ? r : n[0] ?? null;
}
function zc(e, t, n, r = Infinity, i = []) {
	if (!e.length || n <= 0) return [];
	let a = new Set(i), o = e.map((e, t) => t).filter((e) => !a.has(e)).filter((n) => !D(e[n], t)).filter((t) => e[t].rank !== "A");
	return o.length ? Dc(o.map((t) => e[t]), t, n, r).map((e) => o[e]) : [];
}
function Bc(e) {
	return e.drawSelectionTouched ? [...e.selectedDraw].sort((e, t) => e - t) : e.bestPlayEnabled ? [...e.recommendedDiscardIndices].sort((e, t) => e - t) : [...e.selectedDraw].sort((e, t) => e - t);
}
//#endregion
//#region src/table/feedback/bourrePrivateAudio.ts
var Vc = null;
function Hc(e, t) {
	return `${e}:${t}:bourre-private`;
}
function Uc(e = Math.random()) {
	return e < .5 ? "fahhh" : "fahhhh";
}
function Wc(e) {
	return Vc === e ? {
		ok: !1,
		reason: "duplicate"
	} : (Vc = e, { ok: !0 });
}
//#endregion
//#region src/table/feedback/soundPacks.ts
var Gc = (/* @__PURE__ */ e(((e) => {
	(function() {
		var t = function() {
			this.init();
		};
		t.prototype = {
			init: function() {
				var e = this || n;
				return e._counter = 1e3, e._html5AudioPool = [], e.html5PoolSize = 10, e._codecs = {}, e._howls = [], e._muted = !1, e._volume = 1, e._canPlayEvent = "canplaythrough", e._navigator = typeof window < "u" && window.navigator ? window.navigator : null, e.masterGain = null, e.noAudio = !1, e.usingWebAudio = !0, e.autoSuspend = !0, e.ctx = null, e.autoUnlock = !0, e._setup(), e;
			},
			volume: function(e) {
				var t = this || n;
				if (e = parseFloat(e), t.ctx || u(), e !== void 0 && e >= 0 && e <= 1) {
					if (t._volume = e, t._muted) return t;
					t.usingWebAudio && t.masterGain.gain.setValueAtTime(e, n.ctx.currentTime);
					for (var r = 0; r < t._howls.length; r++) if (!t._howls[r]._webAudio) for (var i = t._howls[r]._getSoundIds(), a = 0; a < i.length; a++) {
						var o = t._howls[r]._soundById(i[a]);
						o && o._node && (o._node.volume = o._volume * e);
					}
					return t;
				}
				return t._volume;
			},
			mute: function(e) {
				var t = this || n;
				t.ctx || u(), t._muted = e, t.usingWebAudio && t.masterGain.gain.setValueAtTime(e ? 0 : t._volume, n.ctx.currentTime);
				for (var r = 0; r < t._howls.length; r++) if (!t._howls[r]._webAudio) for (var i = t._howls[r]._getSoundIds(), a = 0; a < i.length; a++) {
					var o = t._howls[r]._soundById(i[a]);
					o && o._node && (o._node.muted = e ? !0 : o._muted);
				}
				return t;
			},
			stop: function() {
				for (var e = this || n, t = 0; t < e._howls.length; t++) e._howls[t].stop();
				return e;
			},
			unload: function() {
				for (var e = this || n, t = e._howls.length - 1; t >= 0; t--) e._howls[t].unload();
				return e.usingWebAudio && e.ctx && e.ctx.close !== void 0 && (e.ctx.close(), e.ctx = null, u()), e;
			},
			codecs: function(e) {
				return (this || n)._codecs[e.replace(/^x-/, "")];
			},
			_setup: function() {
				var e = this || n;
				if (e.state = e.ctx && e.ctx.state || "suspended", e._autoSuspend(), !e.usingWebAudio) if (typeof Audio < "u") try {
					var t = new Audio();
					t.oncanplaythrough === void 0 && (e._canPlayEvent = "canplay");
				} catch {
					e.noAudio = !0;
				}
				else e.noAudio = !0;
				try {
					var t = new Audio();
					t.muted && (e.noAudio = !0);
				} catch {}
				return e.noAudio || e._setupCodecs(), e;
			},
			_setupCodecs: function() {
				var e = this || n, t = null;
				try {
					t = typeof Audio < "u" ? new Audio() : null;
				} catch {
					return e;
				}
				if (!t || typeof t.canPlayType != "function") return e;
				var r = t.canPlayType("audio/mpeg;").replace(/^no$/, ""), i = e._navigator ? e._navigator.userAgent : "", a = i.match(/OPR\/(\d+)/g), o = a && parseInt(a[0].split("/")[1], 10) < 33, s = i.indexOf("Safari") !== -1 && i.indexOf("Chrome") === -1, c = i.match(/Version\/(.*?) /), l = s && c && parseInt(c[1], 10) < 15;
				return e._codecs = {
					mp3: !!(!o && (r || t.canPlayType("audio/mp3;").replace(/^no$/, ""))),
					mpeg: !!r,
					opus: !!t.canPlayType("audio/ogg; codecs=\"opus\"").replace(/^no$/, ""),
					ogg: !!t.canPlayType("audio/ogg; codecs=\"vorbis\"").replace(/^no$/, ""),
					oga: !!t.canPlayType("audio/ogg; codecs=\"vorbis\"").replace(/^no$/, ""),
					wav: !!(t.canPlayType("audio/wav; codecs=\"1\"") || t.canPlayType("audio/wav")).replace(/^no$/, ""),
					aac: !!t.canPlayType("audio/aac;").replace(/^no$/, ""),
					caf: !!t.canPlayType("audio/x-caf;").replace(/^no$/, ""),
					m4a: !!(t.canPlayType("audio/x-m4a;") || t.canPlayType("audio/m4a;") || t.canPlayType("audio/aac;")).replace(/^no$/, ""),
					m4b: !!(t.canPlayType("audio/x-m4b;") || t.canPlayType("audio/m4b;") || t.canPlayType("audio/aac;")).replace(/^no$/, ""),
					mp4: !!(t.canPlayType("audio/x-mp4;") || t.canPlayType("audio/mp4;") || t.canPlayType("audio/aac;")).replace(/^no$/, ""),
					weba: !!(!l && t.canPlayType("audio/webm; codecs=\"vorbis\"").replace(/^no$/, "")),
					webm: !!(!l && t.canPlayType("audio/webm; codecs=\"vorbis\"").replace(/^no$/, "")),
					dolby: !!t.canPlayType("audio/mp4; codecs=\"ec-3\"").replace(/^no$/, ""),
					flac: !!(t.canPlayType("audio/x-flac;") || t.canPlayType("audio/flac;")).replace(/^no$/, "")
				}, e;
			},
			_unlockAudio: function() {
				var e = this || n;
				if (!(e._audioUnlocked || !e.ctx)) {
					e._audioUnlocked = !1, e.autoUnlock = !1, !e._mobileUnloaded && e.ctx.sampleRate !== 44100 && (e._mobileUnloaded = !0, e.unload()), e._scratchBuffer = e.ctx.createBuffer(1, 1, 22050);
					var t = function(n) {
						for (; e._html5AudioPool.length < e.html5PoolSize;) try {
							var r = new Audio();
							r._unlocked = !0, e._releaseHtml5Audio(r);
						} catch {
							e.noAudio = !0;
							break;
						}
						for (var i = 0; i < e._howls.length; i++) if (!e._howls[i]._webAudio) for (var a = e._howls[i]._getSoundIds(), o = 0; o < a.length; o++) {
							var s = e._howls[i]._soundById(a[o]);
							s && s._node && !s._node._unlocked && (s._node._unlocked = !0, s._node.load());
						}
						e._autoResume();
						var c = e.ctx.createBufferSource();
						c.buffer = e._scratchBuffer, c.connect(e.ctx.destination), c.start === void 0 ? c.noteOn(0) : c.start(0), typeof e.ctx.resume == "function" && e.ctx.resume(), c.onended = function() {
							c.disconnect(0), e._audioUnlocked = !0, document.removeEventListener("touchstart", t, !0), document.removeEventListener("touchend", t, !0), document.removeEventListener("click", t, !0), document.removeEventListener("keydown", t, !0);
							for (var n = 0; n < e._howls.length; n++) e._howls[n]._emit("unlock");
						};
					};
					return document.addEventListener("touchstart", t, !0), document.addEventListener("touchend", t, !0), document.addEventListener("click", t, !0), document.addEventListener("keydown", t, !0), e;
				}
			},
			_obtainHtml5Audio: function() {
				var e = this || n;
				if (e._html5AudioPool.length) return e._html5AudioPool.pop();
				var t = new Audio().play();
				return t && typeof Promise < "u" && (t instanceof Promise || typeof t.then == "function") && t.catch(function() {
					console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.");
				}), new Audio();
			},
			_releaseHtml5Audio: function(e) {
				var t = this || n;
				return e._unlocked && t._html5AudioPool.push(e), t;
			},
			_autoSuspend: function() {
				var e = this;
				if (!(!e.autoSuspend || !e.ctx || e.ctx.suspend === void 0 || !n.usingWebAudio)) {
					for (var t = 0; t < e._howls.length; t++) if (e._howls[t]._webAudio) {
						for (var r = 0; r < e._howls[t]._sounds.length; r++) if (!e._howls[t]._sounds[r]._paused) return e;
					}
					return e._suspendTimer && clearTimeout(e._suspendTimer), e._suspendTimer = setTimeout(function() {
						if (e.autoSuspend) {
							e._suspendTimer = null, e.state = "suspending";
							var t = function() {
								e.state = "suspended", e._resumeAfterSuspend && (delete e._resumeAfterSuspend, e._autoResume());
							};
							e.ctx.suspend().then(t, t);
						}
					}, 3e4), e;
				}
			},
			_autoResume: function() {
				var e = this;
				if (!(!e.ctx || e.ctx.resume === void 0 || !n.usingWebAudio)) return e.state === "running" && e.ctx.state !== "interrupted" && e._suspendTimer ? (clearTimeout(e._suspendTimer), e._suspendTimer = null) : e.state === "suspended" || e.state === "running" && e.ctx.state === "interrupted" ? (e.ctx.resume().then(function() {
					e.state = "running";
					for (var t = 0; t < e._howls.length; t++) e._howls[t]._emit("resume");
				}), e._suspendTimer &&= (clearTimeout(e._suspendTimer), null)) : e.state === "suspending" && (e._resumeAfterSuspend = !0), e;
			}
		};
		var n = new t(), r = function(e) {
			var t = this;
			if (!e.src || e.src.length === 0) {
				console.error("An array of source files must be passed with any new Howl.");
				return;
			}
			t.init(e);
		};
		r.prototype = {
			init: function(e) {
				var t = this;
				return n.ctx || u(), t._autoplay = e.autoplay || !1, t._format = typeof e.format == "string" ? [e.format] : e.format, t._html5 = e.html5 || !1, t._muted = e.mute || !1, t._loop = e.loop || !1, t._pool = e.pool || 5, t._preload = typeof e.preload == "boolean" || e.preload === "metadata" ? e.preload : !0, t._rate = e.rate || 1, t._sprite = e.sprite || {}, t._src = typeof e.src == "string" ? [e.src] : e.src, t._volume = e.volume === void 0 ? 1 : e.volume, t._xhr = {
					method: e.xhr && e.xhr.method ? e.xhr.method : "GET",
					headers: e.xhr && e.xhr.headers ? e.xhr.headers : null,
					withCredentials: e.xhr && e.xhr.withCredentials ? e.xhr.withCredentials : !1
				}, t._duration = 0, t._state = "unloaded", t._sounds = [], t._endTimers = {}, t._queue = [], t._playLock = !1, t._onend = e.onend ? [{ fn: e.onend }] : [], t._onfade = e.onfade ? [{ fn: e.onfade }] : [], t._onload = e.onload ? [{ fn: e.onload }] : [], t._onloaderror = e.onloaderror ? [{ fn: e.onloaderror }] : [], t._onplayerror = e.onplayerror ? [{ fn: e.onplayerror }] : [], t._onpause = e.onpause ? [{ fn: e.onpause }] : [], t._onplay = e.onplay ? [{ fn: e.onplay }] : [], t._onstop = e.onstop ? [{ fn: e.onstop }] : [], t._onmute = e.onmute ? [{ fn: e.onmute }] : [], t._onvolume = e.onvolume ? [{ fn: e.onvolume }] : [], t._onrate = e.onrate ? [{ fn: e.onrate }] : [], t._onseek = e.onseek ? [{ fn: e.onseek }] : [], t._onunlock = e.onunlock ? [{ fn: e.onunlock }] : [], t._onresume = [], t._webAudio = n.usingWebAudio && !t._html5, n.ctx !== void 0 && n.ctx && n.autoUnlock && n._unlockAudio(), n._howls.push(t), t._autoplay && t._queue.push({
					event: "play",
					action: function() {
						t.play();
					}
				}), t._preload && t._preload !== "none" && t.load(), t;
			},
			load: function() {
				var e = this, t = null;
				if (n.noAudio) {
					e._emit("loaderror", null, "No audio support.");
					return;
				}
				typeof e._src == "string" && (e._src = [e._src]);
				for (var r = 0; r < e._src.length; r++) {
					var a, s;
					if (e._format && e._format[r]) a = e._format[r];
					else {
						if (s = e._src[r], typeof s != "string") {
							e._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
							continue;
						}
						a = /^data:audio\/([^;,]+);/i.exec(s), a ||= /\.([^.]+)$/.exec(s.split("?", 1)[0]), a &&= a[1].toLowerCase();
					}
					if (a || console.warn("No file extension was found. Consider using the \"format\" property or specify an extension."), a && n.codecs(a)) {
						t = e._src[r];
						break;
					}
				}
				if (!t) {
					e._emit("loaderror", null, "No codec support for selected audio sources.");
					return;
				}
				return e._src = t, e._state = "loading", window.location.protocol === "https:" && t.slice(0, 5) === "http:" && (e._html5 = !0, e._webAudio = !1), new i(e), e._webAudio && o(e), e;
			},
			play: function(e, t) {
				var r = this, i = null;
				if (typeof e == "number") i = e, e = null;
				else if (typeof e == "string" && r._state === "loaded" && !r._sprite[e]) return null;
				else if (e === void 0 && (e = "__default", !r._playLock)) {
					for (var a = 0, o = 0; o < r._sounds.length; o++) r._sounds[o]._paused && !r._sounds[o]._ended && (a++, i = r._sounds[o]._id);
					a === 1 ? e = null : i = null;
				}
				var s = i ? r._soundById(i) : r._inactiveSound();
				if (!s) return null;
				if (i && !e && (e = s._sprite || "__default"), r._state !== "loaded") {
					s._sprite = e, s._ended = !1;
					var c = s._id;
					return r._queue.push({
						event: "play",
						action: function() {
							r.play(c);
						}
					}), c;
				}
				if (i && !s._paused) return t || r._loadQueue("play"), s._id;
				r._webAudio && n._autoResume();
				var l = Math.max(0, s._seek > 0 ? s._seek : r._sprite[e][0] / 1e3), u = Math.max(0, (r._sprite[e][0] + r._sprite[e][1]) / 1e3 - l), d = u * 1e3 / Math.abs(s._rate), f = r._sprite[e][0] / 1e3, p = (r._sprite[e][0] + r._sprite[e][1]) / 1e3;
				s._sprite = e, s._ended = !1;
				var m = function() {
					s._paused = !1, s._seek = l, s._start = f, s._stop = p, s._loop = !!(s._loop || r._sprite[e][2]);
				};
				if (l >= p) {
					r._ended(s);
					return;
				}
				var h = s._node;
				if (r._webAudio) {
					var g = function() {
						r._playLock = !1, m(), r._refreshBuffer(s);
						var e = s._muted || r._muted ? 0 : s._volume;
						h.gain.setValueAtTime(e, n.ctx.currentTime), s._playStart = n.ctx.currentTime, h.bufferSource.start === void 0 ? s._loop ? h.bufferSource.noteGrainOn(0, l, 86400) : h.bufferSource.noteGrainOn(0, l, u) : s._loop ? h.bufferSource.start(0, l, 86400) : h.bufferSource.start(0, l, u), d !== Infinity && (r._endTimers[s._id] = setTimeout(r._ended.bind(r, s), d)), t || setTimeout(function() {
							r._emit("play", s._id), r._loadQueue();
						}, 0);
					};
					n.state === "running" && n.ctx.state !== "interrupted" ? g() : (r._playLock = !0, r.once("resume", g), r._clearTimer(s._id));
				} else {
					var _ = function() {
						h.currentTime = l, h.muted = s._muted || r._muted || n._muted || h.muted, h.volume = s._volume * n.volume(), h.playbackRate = s._rate;
						try {
							var i = h.play();
							if (i && typeof Promise < "u" && (i instanceof Promise || typeof i.then == "function") ? (r._playLock = !0, m(), i.then(function() {
								r._playLock = !1, h._unlocked = !0, t ? r._loadQueue() : r._emit("play", s._id);
							}).catch(function() {
								r._playLock = !1, r._emit("playerror", s._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), s._ended = !0, s._paused = !0;
							})) : t || (r._playLock = !1, m(), r._emit("play", s._id)), h.playbackRate = s._rate, h.paused) {
								r._emit("playerror", s._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
								return;
							}
							e !== "__default" || s._loop ? r._endTimers[s._id] = setTimeout(r._ended.bind(r, s), d) : (r._endTimers[s._id] = function() {
								r._ended(s), h.removeEventListener("ended", r._endTimers[s._id], !1);
							}, h.addEventListener("ended", r._endTimers[s._id], !1));
						} catch (e) {
							r._emit("playerror", s._id, e);
						}
					};
					h.src === "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" && (h.src = r._src, h.load());
					var v = window && window.ejecta || !h.readyState && n._navigator.isCocoonJS;
					if (h.readyState >= 3 || v) _();
					else {
						r._playLock = !0, r._state = "loading";
						var y = function() {
							r._state = "loaded", _(), h.removeEventListener(n._canPlayEvent, y, !1);
						};
						h.addEventListener(n._canPlayEvent, y, !1), r._clearTimer(s._id);
					}
				}
				return s._id;
			},
			pause: function(e) {
				var t = this;
				if (t._state !== "loaded" || t._playLock) return t._queue.push({
					event: "pause",
					action: function() {
						t.pause(e);
					}
				}), t;
				for (var n = t._getSoundIds(e), r = 0; r < n.length; r++) {
					t._clearTimer(n[r]);
					var i = t._soundById(n[r]);
					if (i && !i._paused && (i._seek = t.seek(n[r]), i._rateSeek = 0, i._paused = !0, t._stopFade(n[r]), i._node)) if (t._webAudio) {
						if (!i._node.bufferSource) continue;
						i._node.bufferSource.stop === void 0 ? i._node.bufferSource.noteOff(0) : i._node.bufferSource.stop(0), t._cleanBuffer(i._node);
					} else (!isNaN(i._node.duration) || i._node.duration === Infinity) && i._node.pause();
					arguments[1] || t._emit("pause", i ? i._id : null);
				}
				return t;
			},
			stop: function(e, t) {
				var n = this;
				if (n._state !== "loaded" || n._playLock) return n._queue.push({
					event: "stop",
					action: function() {
						n.stop(e);
					}
				}), n;
				for (var r = n._getSoundIds(e), i = 0; i < r.length; i++) {
					n._clearTimer(r[i]);
					var a = n._soundById(r[i]);
					a && (a._seek = a._start || 0, a._rateSeek = 0, a._paused = !0, a._ended = !0, n._stopFade(r[i]), a._node && (n._webAudio ? a._node.bufferSource && (a._node.bufferSource.stop === void 0 ? a._node.bufferSource.noteOff(0) : a._node.bufferSource.stop(0), n._cleanBuffer(a._node)) : (!isNaN(a._node.duration) || a._node.duration === Infinity) && (a._node.currentTime = a._start || 0, a._node.pause(), a._node.duration === Infinity && n._clearSound(a._node))), t || n._emit("stop", a._id));
				}
				return n;
			},
			mute: function(e, t) {
				var r = this;
				if (r._state !== "loaded" || r._playLock) return r._queue.push({
					event: "mute",
					action: function() {
						r.mute(e, t);
					}
				}), r;
				if (t === void 0) if (typeof e == "boolean") r._muted = e;
				else return r._muted;
				for (var i = r._getSoundIds(t), a = 0; a < i.length; a++) {
					var o = r._soundById(i[a]);
					o && (o._muted = e, o._interval && r._stopFade(o._id), r._webAudio && o._node ? o._node.gain.setValueAtTime(e ? 0 : o._volume, n.ctx.currentTime) : o._node && (o._node.muted = n._muted ? !0 : e), r._emit("mute", o._id));
				}
				return r;
			},
			volume: function() {
				var e = this, t = arguments, r, i;
				if (t.length === 0) return e._volume;
				t.length === 1 || t.length === 2 && t[1] === void 0 ? e._getSoundIds().indexOf(t[0]) >= 0 ? i = parseInt(t[0], 10) : r = parseFloat(t[0]) : t.length >= 2 && (r = parseFloat(t[0]), i = parseInt(t[1], 10));
				var a;
				if (r !== void 0 && r >= 0 && r <= 1) {
					if (e._state !== "loaded" || e._playLock) return e._queue.push({
						event: "volume",
						action: function() {
							e.volume.apply(e, t);
						}
					}), e;
					i === void 0 && (e._volume = r), i = e._getSoundIds(i);
					for (var o = 0; o < i.length; o++) a = e._soundById(i[o]), a && (a._volume = r, t[2] || e._stopFade(i[o]), e._webAudio && a._node && !a._muted ? a._node.gain.setValueAtTime(r, n.ctx.currentTime) : a._node && !a._muted && (a._node.volume = r * n.volume()), e._emit("volume", a._id));
				} else return a = i ? e._soundById(i) : e._sounds[0], a ? a._volume : 0;
				return e;
			},
			fade: function(e, t, r, i) {
				var a = this;
				if (a._state !== "loaded" || a._playLock) return a._queue.push({
					event: "fade",
					action: function() {
						a.fade(e, t, r, i);
					}
				}), a;
				e = Math.min(Math.max(0, parseFloat(e)), 1), t = Math.min(Math.max(0, parseFloat(t)), 1), r = parseFloat(r), a.volume(e, i);
				for (var o = a._getSoundIds(i), s = 0; s < o.length; s++) {
					var c = a._soundById(o[s]);
					if (c) {
						if (i || a._stopFade(o[s]), a._webAudio && !c._muted) {
							var l = n.ctx.currentTime, u = l + r / 1e3;
							c._volume = e, c._node.gain.setValueAtTime(e, l), c._node.gain.linearRampToValueAtTime(t, u);
						}
						a._startFadeInterval(c, e, t, r, o[s], i === void 0);
					}
				}
				return a;
			},
			_startFadeInterval: function(e, t, n, r, i, a) {
				var o = this, s = t, c = n - t, l = Math.abs(c / .01), u = Math.max(4, l > 0 ? r / l : r), d = Date.now();
				e._fadeTo = n, e._interval = setInterval(function() {
					var i = (Date.now() - d) / r;
					d = Date.now(), s += c * i, s = Math.round(s * 100) / 100, s = c < 0 ? Math.max(n, s) : Math.min(n, s), o._webAudio ? e._volume = s : o.volume(s, e._id, !0), a && (o._volume = s), (n < t && s <= n || n > t && s >= n) && (clearInterval(e._interval), e._interval = null, e._fadeTo = null, o.volume(n, e._id), o._emit("fade", e._id));
				}, u);
			},
			_stopFade: function(e) {
				var t = this, r = t._soundById(e);
				return r && r._interval && (t._webAudio && r._node.gain.cancelScheduledValues(n.ctx.currentTime), clearInterval(r._interval), r._interval = null, t.volume(r._fadeTo, e), r._fadeTo = null, t._emit("fade", e)), t;
			},
			loop: function() {
				var e = this, t = arguments, n, r, i;
				if (t.length === 0) return e._loop;
				if (t.length === 1) if (typeof t[0] == "boolean") n = t[0], e._loop = n;
				else return i = e._soundById(parseInt(t[0], 10)), i ? i._loop : !1;
				else t.length === 2 && (n = t[0], r = parseInt(t[1], 10));
				for (var a = e._getSoundIds(r), o = 0; o < a.length; o++) i = e._soundById(a[o]), i && (i._loop = n, e._webAudio && i._node && i._node.bufferSource && (i._node.bufferSource.loop = n, n && (i._node.bufferSource.loopStart = i._start || 0, i._node.bufferSource.loopEnd = i._stop, e.playing(a[o]) && (e.pause(a[o], !0), e.play(a[o], !0)))));
				return e;
			},
			rate: function() {
				var e = this, t = arguments, r, i;
				t.length === 0 ? i = e._sounds[0]._id : t.length === 1 ? e._getSoundIds().indexOf(t[0]) >= 0 ? i = parseInt(t[0], 10) : r = parseFloat(t[0]) : t.length === 2 && (r = parseFloat(t[0]), i = parseInt(t[1], 10));
				var a;
				if (typeof r == "number") {
					if (e._state !== "loaded" || e._playLock) return e._queue.push({
						event: "rate",
						action: function() {
							e.rate.apply(e, t);
						}
					}), e;
					i === void 0 && (e._rate = r), i = e._getSoundIds(i);
					for (var o = 0; o < i.length; o++) if (a = e._soundById(i[o]), a) {
						e.playing(i[o]) && (a._rateSeek = e.seek(i[o]), a._playStart = e._webAudio ? n.ctx.currentTime : a._playStart), a._rate = r, e._webAudio && a._node && a._node.bufferSource ? a._node.bufferSource.playbackRate.setValueAtTime(r, n.ctx.currentTime) : a._node && (a._node.playbackRate = r);
						var s = e.seek(i[o]), c = ((e._sprite[a._sprite][0] + e._sprite[a._sprite][1]) / 1e3 - s) * 1e3 / Math.abs(a._rate);
						(e._endTimers[i[o]] || !a._paused) && (e._clearTimer(i[o]), e._endTimers[i[o]] = setTimeout(e._ended.bind(e, a), c)), e._emit("rate", a._id);
					}
				} else return a = e._soundById(i), a ? a._rate : e._rate;
				return e;
			},
			seek: function() {
				var e = this, t = arguments, r, i;
				if (t.length === 0 ? e._sounds.length && (i = e._sounds[0]._id) : t.length === 1 ? e._getSoundIds().indexOf(t[0]) >= 0 ? i = parseInt(t[0], 10) : e._sounds.length && (i = e._sounds[0]._id, r = parseFloat(t[0])) : t.length === 2 && (r = parseFloat(t[0]), i = parseInt(t[1], 10)), i === void 0) return 0;
				if (typeof r == "number" && (e._state !== "loaded" || e._playLock)) return e._queue.push({
					event: "seek",
					action: function() {
						e.seek.apply(e, t);
					}
				}), e;
				var a = e._soundById(i);
				if (a) if (typeof r == "number" && r >= 0) {
					var o = e.playing(i);
					o && e.pause(i, !0), a._seek = r, a._ended = !1, e._clearTimer(i), !e._webAudio && a._node && !isNaN(a._node.duration) && (a._node.currentTime = r);
					var s = function() {
						o && e.play(i, !0), e._emit("seek", i);
					};
					if (o && !e._webAudio) {
						var c = function() {
							e._playLock ? setTimeout(c, 0) : s();
						};
						setTimeout(c, 0);
					} else s();
				} else if (e._webAudio) {
					var l = e.playing(i) ? n.ctx.currentTime - a._playStart : 0, u = a._rateSeek ? a._rateSeek - a._seek : 0;
					return a._seek + (u + l * Math.abs(a._rate));
				} else return a._node.currentTime;
				return e;
			},
			playing: function(e) {
				var t = this;
				if (typeof e == "number") {
					var n = t._soundById(e);
					return n ? !n._paused : !1;
				}
				for (var r = 0; r < t._sounds.length; r++) if (!t._sounds[r]._paused) return !0;
				return !1;
			},
			duration: function(e) {
				var t = this, n = t._duration, r = t._soundById(e);
				return r && (n = t._sprite[r._sprite][1] / 1e3), n;
			},
			state: function() {
				return this._state;
			},
			unload: function() {
				for (var e = this, t = e._sounds, r = 0; r < t.length; r++) t[r]._paused || e.stop(t[r]._id), e._webAudio || (e._clearSound(t[r]._node), t[r]._node.removeEventListener("error", t[r]._errorFn, !1), t[r]._node.removeEventListener(n._canPlayEvent, t[r]._loadFn, !1), t[r]._node.removeEventListener("ended", t[r]._endFn, !1), n._releaseHtml5Audio(t[r]._node)), delete t[r]._node, e._clearTimer(t[r]._id);
				var i = n._howls.indexOf(e);
				i >= 0 && n._howls.splice(i, 1);
				var o = !0;
				for (r = 0; r < n._howls.length; r++) if (n._howls[r]._src === e._src || e._src.indexOf(n._howls[r]._src) >= 0) {
					o = !1;
					break;
				}
				return a && o && delete a[e._src], n.noAudio = !1, e._state = "unloaded", e._sounds = [], e = null, null;
			},
			on: function(e, t, n, r) {
				var i = this, a = i["_on" + e];
				return typeof t == "function" && a.push(r ? {
					id: n,
					fn: t,
					once: r
				} : {
					id: n,
					fn: t
				}), i;
			},
			off: function(e, t, n) {
				var r = this, i = r["_on" + e], a = 0;
				if (typeof t == "number" && (n = t, t = null), t || n) for (a = 0; a < i.length; a++) {
					var o = n === i[a].id;
					if (t === i[a].fn && o || !t && o) {
						i.splice(a, 1);
						break;
					}
				}
				else if (e) r["_on" + e] = [];
				else {
					var s = Object.keys(r);
					for (a = 0; a < s.length; a++) s[a].indexOf("_on") === 0 && Array.isArray(r[s[a]]) && (r[s[a]] = []);
				}
				return r;
			},
			once: function(e, t, n) {
				var r = this;
				return r.on(e, t, n, 1), r;
			},
			_emit: function(e, t, n) {
				for (var r = this, i = r["_on" + e], a = i.length - 1; a >= 0; a--) (!i[a].id || i[a].id === t || e === "load") && (setTimeout(function(e) {
					e.call(this, t, n);
				}.bind(r, i[a].fn), 0), i[a].once && r.off(e, i[a].fn, i[a].id));
				return r._loadQueue(e), r;
			},
			_loadQueue: function(e) {
				var t = this;
				if (t._queue.length > 0) {
					var n = t._queue[0];
					n.event === e && (t._queue.shift(), t._loadQueue()), e || n.action();
				}
				return t;
			},
			_ended: function(e) {
				var t = this, r = e._sprite;
				if (!t._webAudio && e._node && !e._node.paused && !e._node.ended && e._node.currentTime < e._stop) return setTimeout(t._ended.bind(t, e), 100), t;
				var i = !!(e._loop || t._sprite[r][2]);
				if (t._emit("end", e._id), !t._webAudio && i && t.stop(e._id, !0).play(e._id), t._webAudio && i) {
					t._emit("play", e._id), e._seek = e._start || 0, e._rateSeek = 0, e._playStart = n.ctx.currentTime;
					var a = (e._stop - e._start) * 1e3 / Math.abs(e._rate);
					t._endTimers[e._id] = setTimeout(t._ended.bind(t, e), a);
				}
				return t._webAudio && !i && (e._paused = !0, e._ended = !0, e._seek = e._start || 0, e._rateSeek = 0, t._clearTimer(e._id), t._cleanBuffer(e._node), n._autoSuspend()), !t._webAudio && !i && t.stop(e._id, !0), t;
			},
			_clearTimer: function(e) {
				var t = this;
				if (t._endTimers[e]) {
					if (typeof t._endTimers[e] != "function") clearTimeout(t._endTimers[e]);
					else {
						var n = t._soundById(e);
						n && n._node && n._node.removeEventListener("ended", t._endTimers[e], !1);
					}
					delete t._endTimers[e];
				}
				return t;
			},
			_soundById: function(e) {
				for (var t = this, n = 0; n < t._sounds.length; n++) if (e === t._sounds[n]._id) return t._sounds[n];
				return null;
			},
			_inactiveSound: function() {
				var e = this;
				e._drain();
				for (var t = 0; t < e._sounds.length; t++) if (e._sounds[t]._ended) return e._sounds[t].reset();
				return new i(e);
			},
			_drain: function() {
				var e = this, t = e._pool, n = 0, r = 0;
				if (!(e._sounds.length < t)) {
					for (r = 0; r < e._sounds.length; r++) e._sounds[r]._ended && n++;
					for (r = e._sounds.length - 1; r >= 0; r--) {
						if (n <= t) return;
						e._sounds[r]._ended && (e._webAudio && e._sounds[r]._node && e._sounds[r]._node.disconnect(0), e._sounds.splice(r, 1), n--);
					}
				}
			},
			_getSoundIds: function(e) {
				var t = this;
				if (e === void 0) {
					for (var n = [], r = 0; r < t._sounds.length; r++) n.push(t._sounds[r]._id);
					return n;
				} else return [e];
			},
			_refreshBuffer: function(e) {
				var t = this;
				return e._node.bufferSource = n.ctx.createBufferSource(), e._node.bufferSource.buffer = a[t._src], e._panner ? e._node.bufferSource.connect(e._panner) : e._node.bufferSource.connect(e._node), e._node.bufferSource.loop = e._loop, e._loop && (e._node.bufferSource.loopStart = e._start || 0, e._node.bufferSource.loopEnd = e._stop || 0), e._node.bufferSource.playbackRate.setValueAtTime(e._rate, n.ctx.currentTime), t;
			},
			_cleanBuffer: function(e) {
				var t = this, r = n._navigator && n._navigator.vendor.indexOf("Apple") >= 0;
				if (!e.bufferSource) return t;
				if (n._scratchBuffer && e.bufferSource && (e.bufferSource.onended = null, e.bufferSource.disconnect(0), r)) try {
					e.bufferSource.buffer = n._scratchBuffer;
				} catch {}
				return e.bufferSource = null, t;
			},
			_clearSound: function(e) {
				/MSIE |Trident\//.test(n._navigator && n._navigator.userAgent) || (e.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
			}
		};
		var i = function(e) {
			this._parent = e, this.init();
		};
		i.prototype = {
			init: function() {
				var e = this, t = e._parent;
				return e._muted = t._muted, e._loop = t._loop, e._volume = t._volume, e._rate = t._rate, e._seek = 0, e._paused = !0, e._ended = !0, e._sprite = "__default", e._id = ++n._counter, t._sounds.push(e), e.create(), e;
			},
			create: function() {
				var e = this, t = e._parent, r = n._muted || e._muted || e._parent._muted ? 0 : e._volume;
				return t._webAudio ? (e._node = n.ctx.createGain === void 0 ? n.ctx.createGainNode() : n.ctx.createGain(), e._node.gain.setValueAtTime(r, n.ctx.currentTime), e._node.paused = !0, e._node.connect(n.masterGain)) : n.noAudio || (e._node = n._obtainHtml5Audio(), e._errorFn = e._errorListener.bind(e), e._node.addEventListener("error", e._errorFn, !1), e._loadFn = e._loadListener.bind(e), e._node.addEventListener(n._canPlayEvent, e._loadFn, !1), e._endFn = e._endListener.bind(e), e._node.addEventListener("ended", e._endFn, !1), e._node.src = t._src, e._node.preload = t._preload === !0 ? "auto" : t._preload, e._node.volume = r * n.volume(), e._node.load()), e;
			},
			reset: function() {
				var e = this, t = e._parent;
				return e._muted = t._muted, e._loop = t._loop, e._volume = t._volume, e._rate = t._rate, e._seek = 0, e._rateSeek = 0, e._paused = !0, e._ended = !0, e._sprite = "__default", e._id = ++n._counter, e;
			},
			_errorListener: function() {
				var e = this;
				e._parent._emit("loaderror", e._id, e._node.error ? e._node.error.code : 0), e._node.removeEventListener("error", e._errorFn, !1);
			},
			_loadListener: function() {
				var e = this, t = e._parent;
				t._duration = Math.ceil(e._node.duration * 10) / 10, Object.keys(t._sprite).length === 0 && (t._sprite = { __default: [0, t._duration * 1e3] }), t._state !== "loaded" && (t._state = "loaded", t._emit("load"), t._loadQueue()), e._node.removeEventListener(n._canPlayEvent, e._loadFn, !1);
			},
			_endListener: function() {
				var e = this, t = e._parent;
				t._duration === Infinity && (t._duration = Math.ceil(e._node.duration * 10) / 10, t._sprite.__default[1] === Infinity && (t._sprite.__default[1] = t._duration * 1e3), t._ended(e)), e._node.removeEventListener("ended", e._endFn, !1);
			}
		};
		var a = {}, o = function(e) {
			var t = e._src;
			if (a[t]) {
				e._duration = a[t].duration, l(e);
				return;
			}
			if (/^data:[^;]+;base64,/.test(t)) {
				for (var n = atob(t.split(",")[1]), r = new Uint8Array(n.length), i = 0; i < n.length; ++i) r[i] = n.charCodeAt(i);
				c(r.buffer, e);
			} else {
				var o = new XMLHttpRequest();
				o.open(e._xhr.method, t, !0), o.withCredentials = e._xhr.withCredentials, o.responseType = "arraybuffer", e._xhr.headers && Object.keys(e._xhr.headers).forEach(function(t) {
					o.setRequestHeader(t, e._xhr.headers[t]);
				}), o.onload = function() {
					var t = (o.status + "")[0];
					if (t !== "0" && t !== "2" && t !== "3") {
						e._emit("loaderror", null, "Failed loading audio file with status: " + o.status + ".");
						return;
					}
					c(o.response, e);
				}, o.onerror = function() {
					e._webAudio && (e._html5 = !0, e._webAudio = !1, e._sounds = [], delete a[t], e.load());
				}, s(o);
			}
		}, s = function(e) {
			try {
				e.send();
			} catch {
				e.onerror();
			}
		}, c = function(e, t) {
			var r = function() {
				t._emit("loaderror", null, "Decoding audio data failed.");
			}, i = function(e) {
				e && t._sounds.length > 0 ? (a[t._src] = e, l(t, e)) : r();
			};
			typeof Promise < "u" && n.ctx.decodeAudioData.length === 1 ? n.ctx.decodeAudioData(e).then(i).catch(r) : n.ctx.decodeAudioData(e, i, r);
		}, l = function(e, t) {
			t && !e._duration && (e._duration = t.duration), Object.keys(e._sprite).length === 0 && (e._sprite = { __default: [0, e._duration * 1e3] }), e._state !== "loaded" && (e._state = "loaded", e._emit("load"), e._loadQueue());
		}, u = function() {
			if (n.usingWebAudio) {
				try {
					typeof AudioContext < "u" ? n.ctx = new AudioContext() : typeof webkitAudioContext < "u" ? n.ctx = new webkitAudioContext() : n.usingWebAudio = !1;
				} catch {
					n.usingWebAudio = !1;
				}
				n.ctx || (n.usingWebAudio = !1);
				var e = /iP(hone|od|ad)/.test(n._navigator && n._navigator.platform), t = n._navigator && n._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/), r = t ? parseInt(t[1], 10) : null;
				if (e && r && r < 9) {
					var i = /safari/.test(n._navigator && n._navigator.userAgent.toLowerCase());
					n._navigator && !i && (n.usingWebAudio = !1);
				}
				n.usingWebAudio && (n.masterGain = n.ctx.createGain === void 0 ? n.ctx.createGainNode() : n.ctx.createGain(), n.masterGain.gain.setValueAtTime(n._muted ? 0 : n._volume, n.ctx.currentTime), n.masterGain.connect(n.ctx.destination)), n._setup();
			}
		};
		typeof define == "function" && define.amd && define([], function() {
			return {
				Howler: n,
				Howl: r
			};
		}), e !== void 0 && (e.Howler = n, e.Howl = r), typeof global < "u" ? (global.HowlerGlobal = t, global.Howler = n, global.Howl = r, global.Sound = i) : typeof window < "u" && (window.HowlerGlobal = t, window.Howler = n, window.Howl = r, window.Sound = i);
	})(), (function() {
		HowlerGlobal.prototype._pos = [
			0,
			0,
			0
		], HowlerGlobal.prototype._orientation = [
			0,
			0,
			-1,
			0,
			1,
			0
		], HowlerGlobal.prototype.stereo = function(e) {
			var t = this;
			if (!t.ctx || !t.ctx.listener) return t;
			for (var n = t._howls.length - 1; n >= 0; n--) t._howls[n].stereo(e);
			return t;
		}, HowlerGlobal.prototype.pos = function(e, t, n) {
			var r = this;
			if (!r.ctx || !r.ctx.listener) return r;
			if (t = typeof t == "number" ? t : r._pos[1], n = typeof n == "number" ? n : r._pos[2], typeof e == "number") r._pos = [
				e,
				t,
				n
			], r.ctx.listener.positionX === void 0 ? r.ctx.listener.setPosition(r._pos[0], r._pos[1], r._pos[2]) : (r.ctx.listener.positionX.setTargetAtTime(r._pos[0], Howler.ctx.currentTime, .1), r.ctx.listener.positionY.setTargetAtTime(r._pos[1], Howler.ctx.currentTime, .1), r.ctx.listener.positionZ.setTargetAtTime(r._pos[2], Howler.ctx.currentTime, .1));
			else return r._pos;
			return r;
		}, HowlerGlobal.prototype.orientation = function(e, t, n, r, i, a) {
			var o = this;
			if (!o.ctx || !o.ctx.listener) return o;
			var s = o._orientation;
			if (t = typeof t == "number" ? t : s[1], n = typeof n == "number" ? n : s[2], r = typeof r == "number" ? r : s[3], i = typeof i == "number" ? i : s[4], a = typeof a == "number" ? a : s[5], typeof e == "number") o._orientation = [
				e,
				t,
				n,
				r,
				i,
				a
			], o.ctx.listener.forwardX === void 0 ? o.ctx.listener.setOrientation(e, t, n, r, i, a) : (o.ctx.listener.forwardX.setTargetAtTime(e, Howler.ctx.currentTime, .1), o.ctx.listener.forwardY.setTargetAtTime(t, Howler.ctx.currentTime, .1), o.ctx.listener.forwardZ.setTargetAtTime(n, Howler.ctx.currentTime, .1), o.ctx.listener.upX.setTargetAtTime(r, Howler.ctx.currentTime, .1), o.ctx.listener.upY.setTargetAtTime(i, Howler.ctx.currentTime, .1), o.ctx.listener.upZ.setTargetAtTime(a, Howler.ctx.currentTime, .1));
			else return s;
			return o;
		}, Howl.prototype.init = (function(e) {
			return function(t) {
				var n = this;
				return n._orientation = t.orientation || [
					1,
					0,
					0
				], n._stereo = t.stereo || null, n._pos = t.pos || null, n._pannerAttr = {
					coneInnerAngle: t.coneInnerAngle === void 0 ? 360 : t.coneInnerAngle,
					coneOuterAngle: t.coneOuterAngle === void 0 ? 360 : t.coneOuterAngle,
					coneOuterGain: t.coneOuterGain === void 0 ? 0 : t.coneOuterGain,
					distanceModel: t.distanceModel === void 0 ? "inverse" : t.distanceModel,
					maxDistance: t.maxDistance === void 0 ? 1e4 : t.maxDistance,
					panningModel: t.panningModel === void 0 ? "HRTF" : t.panningModel,
					refDistance: t.refDistance === void 0 ? 1 : t.refDistance,
					rolloffFactor: t.rolloffFactor === void 0 ? 1 : t.rolloffFactor
				}, n._onstereo = t.onstereo ? [{ fn: t.onstereo }] : [], n._onpos = t.onpos ? [{ fn: t.onpos }] : [], n._onorientation = t.onorientation ? [{ fn: t.onorientation }] : [], e.call(this, t);
			};
		})(Howl.prototype.init), Howl.prototype.stereo = function(t, n) {
			var r = this;
			if (!r._webAudio) return r;
			if (r._state !== "loaded") return r._queue.push({
				event: "stereo",
				action: function() {
					r.stereo(t, n);
				}
			}), r;
			var i = Howler.ctx.createStereoPanner === void 0 ? "spatial" : "stereo";
			if (n === void 0) if (typeof t == "number") r._stereo = t, r._pos = [
				t,
				0,
				0
			];
			else return r._stereo;
			for (var a = r._getSoundIds(n), o = 0; o < a.length; o++) {
				var s = r._soundById(a[o]);
				if (s) if (typeof t == "number") s._stereo = t, s._pos = [
					t,
					0,
					0
				], s._node && (s._pannerAttr.panningModel = "equalpower", (!s._panner || !s._panner.pan) && e(s, i), i === "spatial" ? s._panner.positionX === void 0 ? s._panner.setPosition(t, 0, 0) : (s._panner.positionX.setValueAtTime(t, Howler.ctx.currentTime), s._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime), s._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime)) : s._panner.pan.setValueAtTime(t, Howler.ctx.currentTime)), r._emit("stereo", s._id);
				else return s._stereo;
			}
			return r;
		}, Howl.prototype.pos = function(t, n, r, i) {
			var a = this;
			if (!a._webAudio) return a;
			if (a._state !== "loaded") return a._queue.push({
				event: "pos",
				action: function() {
					a.pos(t, n, r, i);
				}
			}), a;
			if (n = typeof n == "number" ? n : 0, r = typeof r == "number" ? r : -.5, i === void 0) if (typeof t == "number") a._pos = [
				t,
				n,
				r
			];
			else return a._pos;
			for (var o = a._getSoundIds(i), s = 0; s < o.length; s++) {
				var c = a._soundById(o[s]);
				if (c) if (typeof t == "number") c._pos = [
					t,
					n,
					r
				], c._node && ((!c._panner || c._panner.pan) && e(c, "spatial"), c._panner.positionX === void 0 ? c._panner.setPosition(t, n, r) : (c._panner.positionX.setValueAtTime(t, Howler.ctx.currentTime), c._panner.positionY.setValueAtTime(n, Howler.ctx.currentTime), c._panner.positionZ.setValueAtTime(r, Howler.ctx.currentTime))), a._emit("pos", c._id);
				else return c._pos;
			}
			return a;
		}, Howl.prototype.orientation = function(t, n, r, i) {
			var a = this;
			if (!a._webAudio) return a;
			if (a._state !== "loaded") return a._queue.push({
				event: "orientation",
				action: function() {
					a.orientation(t, n, r, i);
				}
			}), a;
			if (n = typeof n == "number" ? n : a._orientation[1], r = typeof r == "number" ? r : a._orientation[2], i === void 0) if (typeof t == "number") a._orientation = [
				t,
				n,
				r
			];
			else return a._orientation;
			for (var o = a._getSoundIds(i), s = 0; s < o.length; s++) {
				var c = a._soundById(o[s]);
				if (c) if (typeof t == "number") c._orientation = [
					t,
					n,
					r
				], c._node && (c._panner || (c._pos ||= a._pos || [
					0,
					0,
					-.5
				], e(c, "spatial")), c._panner.orientationX === void 0 ? c._panner.setOrientation(t, n, r) : (c._panner.orientationX.setValueAtTime(t, Howler.ctx.currentTime), c._panner.orientationY.setValueAtTime(n, Howler.ctx.currentTime), c._panner.orientationZ.setValueAtTime(r, Howler.ctx.currentTime))), a._emit("orientation", c._id);
				else return c._orientation;
			}
			return a;
		}, Howl.prototype.pannerAttr = function() {
			var t = this, n = arguments, r, i, a;
			if (!t._webAudio) return t;
			if (n.length === 0) return t._pannerAttr;
			if (n.length === 1) if (typeof n[0] == "object") r = n[0], i === void 0 && (r.pannerAttr ||= {
				coneInnerAngle: r.coneInnerAngle,
				coneOuterAngle: r.coneOuterAngle,
				coneOuterGain: r.coneOuterGain,
				distanceModel: r.distanceModel,
				maxDistance: r.maxDistance,
				refDistance: r.refDistance,
				rolloffFactor: r.rolloffFactor,
				panningModel: r.panningModel
			}, t._pannerAttr = {
				coneInnerAngle: r.pannerAttr.coneInnerAngle === void 0 ? t._coneInnerAngle : r.pannerAttr.coneInnerAngle,
				coneOuterAngle: r.pannerAttr.coneOuterAngle === void 0 ? t._coneOuterAngle : r.pannerAttr.coneOuterAngle,
				coneOuterGain: r.pannerAttr.coneOuterGain === void 0 ? t._coneOuterGain : r.pannerAttr.coneOuterGain,
				distanceModel: r.pannerAttr.distanceModel === void 0 ? t._distanceModel : r.pannerAttr.distanceModel,
				maxDistance: r.pannerAttr.maxDistance === void 0 ? t._maxDistance : r.pannerAttr.maxDistance,
				refDistance: r.pannerAttr.refDistance === void 0 ? t._refDistance : r.pannerAttr.refDistance,
				rolloffFactor: r.pannerAttr.rolloffFactor === void 0 ? t._rolloffFactor : r.pannerAttr.rolloffFactor,
				panningModel: r.pannerAttr.panningModel === void 0 ? t._panningModel : r.pannerAttr.panningModel
			});
			else return a = t._soundById(parseInt(n[0], 10)), a ? a._pannerAttr : t._pannerAttr;
			else n.length === 2 && (r = n[0], i = parseInt(n[1], 10));
			for (var o = t._getSoundIds(i), s = 0; s < o.length; s++) if (a = t._soundById(o[s]), a) {
				var c = a._pannerAttr;
				c = {
					coneInnerAngle: r.coneInnerAngle === void 0 ? c.coneInnerAngle : r.coneInnerAngle,
					coneOuterAngle: r.coneOuterAngle === void 0 ? c.coneOuterAngle : r.coneOuterAngle,
					coneOuterGain: r.coneOuterGain === void 0 ? c.coneOuterGain : r.coneOuterGain,
					distanceModel: r.distanceModel === void 0 ? c.distanceModel : r.distanceModel,
					maxDistance: r.maxDistance === void 0 ? c.maxDistance : r.maxDistance,
					refDistance: r.refDistance === void 0 ? c.refDistance : r.refDistance,
					rolloffFactor: r.rolloffFactor === void 0 ? c.rolloffFactor : r.rolloffFactor,
					panningModel: r.panningModel === void 0 ? c.panningModel : r.panningModel
				};
				var l = a._panner;
				l ||= (a._pos ||= t._pos || [
					0,
					0,
					-.5
				], e(a, "spatial"), a._panner), l.coneInnerAngle = c.coneInnerAngle, l.coneOuterAngle = c.coneOuterAngle, l.coneOuterGain = c.coneOuterGain, l.distanceModel = c.distanceModel, l.maxDistance = c.maxDistance, l.refDistance = c.refDistance, l.rolloffFactor = c.rolloffFactor, l.panningModel = c.panningModel;
			}
			return t;
		}, Sound.prototype.init = (function(e) {
			return function() {
				var t = this, n = t._parent;
				t._orientation = n._orientation, t._stereo = n._stereo, t._pos = n._pos, t._pannerAttr = n._pannerAttr, e.call(this), t._stereo ? n.stereo(t._stereo) : t._pos && n.pos(t._pos[0], t._pos[1], t._pos[2], t._id);
			};
		})(Sound.prototype.init), Sound.prototype.reset = (function(e) {
			return function() {
				var t = this, n = t._parent;
				return t._orientation = n._orientation, t._stereo = n._stereo, t._pos = n._pos, t._pannerAttr = n._pannerAttr, t._stereo ? n.stereo(t._stereo) : t._pos ? n.pos(t._pos[0], t._pos[1], t._pos[2], t._id) : t._panner && (t._panner.disconnect(0), t._panner = void 0, n._refreshBuffer(t)), e.call(this);
			};
		})(Sound.prototype.reset);
		var e = function(e, t) {
			t ||= "spatial", t === "spatial" ? (e._panner = Howler.ctx.createPanner(), e._panner.coneInnerAngle = e._pannerAttr.coneInnerAngle, e._panner.coneOuterAngle = e._pannerAttr.coneOuterAngle, e._panner.coneOuterGain = e._pannerAttr.coneOuterGain, e._panner.distanceModel = e._pannerAttr.distanceModel, e._panner.maxDistance = e._pannerAttr.maxDistance, e._panner.refDistance = e._pannerAttr.refDistance, e._panner.rolloffFactor = e._pannerAttr.rolloffFactor, e._panner.panningModel = e._pannerAttr.panningModel, e._panner.positionX === void 0 ? e._panner.setPosition(e._pos[0], e._pos[1], e._pos[2]) : (e._panner.positionX.setValueAtTime(e._pos[0], Howler.ctx.currentTime), e._panner.positionY.setValueAtTime(e._pos[1], Howler.ctx.currentTime), e._panner.positionZ.setValueAtTime(e._pos[2], Howler.ctx.currentTime)), e._panner.orientationX === void 0 ? e._panner.setOrientation(e._orientation[0], e._orientation[1], e._orientation[2]) : (e._panner.orientationX.setValueAtTime(e._orientation[0], Howler.ctx.currentTime), e._panner.orientationY.setValueAtTime(e._orientation[1], Howler.ctx.currentTime), e._panner.orientationZ.setValueAtTime(e._orientation[2], Howler.ctx.currentTime))) : (e._panner = Howler.ctx.createStereoPanner(), e._panner.pan.setValueAtTime(e._stereo, Howler.ctx.currentTime)), e._panner.connect(e._node), e._paused || e._parent.pause(e._id, !0).play(e._id, !0);
		};
	})();
})))(), Kc = {
	classic: "Classic",
	wood: "Wood & Felt",
	arcade: "Arcade"
}, qc = "classic", Jc = [
	"card-place-normal",
	"card-place-heavy",
	"lead-sweetener-light",
	"lead-sweetener-strong",
	"trick-win-normal",
	"card-shuffle-normal",
	"card-select",
	"ui-button-press"
];
function Yc(e) {
	return Jc.includes(e);
}
var Xc = /* @__PURE__ */ "card-place-normal.card-place-heavy.card-place-soft.lead-sweetener-light.lead-sweetener-strong.trick-win-normal.trick-win-big.hand-win-stinger.card-shuffle-normal.card-shuffle-final.card-select.card-illegal.close.ui-button-press.coin-chime-light.moneygone.draw.draw1.draw2.draw3.draw4.draw5.Fahhh.fahhh.fahhhh.timer".split("."), Zc = {
	"card-place-normal": "card-place-normal.mp3",
	"card-place-heavy": "card-place-heavy.mp3",
	"card-place-soft": "card-place-soft.mp3",
	"lead-sweetener-light": "lead-sweetener-light.mp3",
	"lead-sweetener-strong": "lead-sweetener-strong.mp3",
	"trick-win-normal": "trick-win-normal.mp3",
	"trick-win-big": "trick-win-big.mp3",
	"hand-win-stinger": "hand-win-stinger.mp3",
	"card-shuffle-normal": "card-shuffle-normal.mp3",
	"card-shuffle-final": "card-shuffle-final.mp3",
	"card-select": "card-select.mp3",
	"card-illegal": "card-illegal.mp3",
	close: "close.mp3",
	"ui-button-press": "ui-button-press.mp3",
	"coin-chime-light": "coin-chime-light.mp3",
	moneygone: "moneygone.mp3",
	draw: "draw.mp3",
	draw1: "draw1.mp3",
	draw2: "draw2.mp3",
	draw3: "draw3.mp3",
	draw4: "draw4.mp3",
	draw5: "draw5.mp3",
	Fahhh: "Fahhh.mp3",
	fahhh: "fahhh.mp3",
	fahhhh: "fahhhh.mp3",
	timer: "timer.mp3"
}, Qc = {
	1: "draw1",
	2: "draw2",
	3: "draw3",
	4: "draw4",
	5: "draw5"
};
function $c(e) {
	return e >= 1 && e <= 5 ? Qc[e] : "draw";
}
var el = {
	classic: "",
	wood: "packs/wood/",
	arcade: "packs/arcade/"
}, tl = "/sounds/";
function nl(e, t) {
	return `${tl}${el[e] ?? ""}${Zc[t]}`;
}
function rl(e, t, n = {}) {
	let r = n.intensityTier ?? 0;
	switch (t) {
		case "shuffle":
		case "gameStart": return "card-shuffle-normal";
		case "shuffleFinal":
		case "openRoom": return "card-shuffle-final";
		case "draw": return "draw";
		case "cardPlace": return r >= 2 ? "card-place-heavy" : "card-place-normal";
		case "leadChange": return r >= 2 ? "lead-sweetener-strong" : "lead-sweetener-light";
		case "trickWin": return "trick-win-normal";
		case "trickCollect":
		case "handWin": return "coin-chime-light";
		case "trickCollectOther": return "moneygone";
		case "potWin":
		case "bigWin": return "hand-win-stinger";
		case "bourre": return "Fahhh";
		case "uiButton": return "ui-button-press";
		case "cardSelect": return "card-select";
		case "cardIllegal": return "card-illegal";
		case "deleteRoom": return "close";
		case "fold": return "card-place-heavy";
		case "turnTimer": return "timer";
	}
}
function il(e) {
	return e === "wood" || e === "arcade" ? e : qc;
}
//#endregion
//#region src/audio/audioEvents.ts
function al(e, t) {
	let n = Math.min(1, Math.floor((Math.max(2, Math.min(8, e)) - 2) / 3));
	return Math.min(2, n + (t <= 4 ? 0 : 1));
}
function ol(e, t, n) {
	return `${e}:${t}:${n}`;
}
function sl(e) {
	return {
		type: "card:played",
		trickId: e.trickId,
		cardId: e.cardId,
		playerCount: e.playerCount,
		cardsInTrick: e.cardsInTrick,
		takesLead: e.takesLead,
		isLocalPlayer: e.isLocalPlayer,
		intensityTier: al(e.playerCount, e.cardsInTrick)
	};
}
function cl(e) {
	return {
		type: "card:lead-change",
		trickId: e.trickId,
		cardId: e.cardId,
		playerCount: e.playerCount,
		cardsInTrick: e.cardsInTrick,
		takesLead: !0,
		isLocalPlayer: e.isLocalPlayer,
		intensityTier: al(e.playerCount, e.cardsInTrick)
	};
}
function ll(e) {
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
function ul(e) {
	return e.type === "trick:won" && e.isLocalPlayer === !0;
}
function dl(e) {
	return {
		type: "trick:collected",
		trickId: e.trickId,
		winningSeat: e.winningSeat,
		playerCount: e.playerCount,
		cardsInTrick: 0,
		isLocalPlayer: e.isLocalPlayer,
		intensityTier: 1
	};
}
function fl(e) {
	return e.type === "trick:collected" ? e.isLocalPlayer === !0 ? "trickCollect" : "trickCollectOther" : "trickCollect";
}
//#endregion
//#region src/table/feedback/prefs.ts
var pl = "nbl-feedback", ml = {
	soundMode: "on",
	soundPackId: qc,
	hapticsMode: "on"
};
function hl(e) {
	if (!e || typeof e != "object") return { ...ml };
	let t = e, n = t.hapticsMode, r = n === "off" || n === "minimal" || n === "on" ? n : t.hapticsEnabled === !1 ? "off" : "on", i;
	return i = t.soundMode === "on" || t.soundMode === "minimal" || t.soundMode === "off" ? t.soundMode : t.soundEnabled === !1 ? "off" : "on", {
		soundMode: i,
		soundPackId: il(t.soundPackId),
		hapticsMode: r
	};
}
function gl() {
	try {
		let e = localStorage.getItem(pl);
		return e ? hl(JSON.parse(e)) : { ...ml };
	} catch {
		return { ...ml };
	}
}
function _l(e) {
	let t = {
		...gl(),
		...e
	};
	try {
		localStorage.setItem(pl, JSON.stringify(t));
	} catch {}
	return xl(t), t;
}
function vl(e, t) {
	return e === "off" ? !1 : e === "on" ? !0 : t === "trickWin" || t === "bigWin" || t === "bourre" || t === "turnTimer";
}
var yl = /* @__PURE__ */ new Set();
function bl(e) {
	return yl.add(e), () => yl.delete(e);
}
function xl(e) {
	for (let t of yl) t(e);
}
function Sl() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function Cl(e, t) {
	return !(e === "off" || e === "minimal" && t === "light" || Sl() && t === "light");
}
//#endregion
//#region src/table/feedback/haptics.ts
function wl() {
	return typeof navigator < "u" && typeof navigator.vibrate == "function";
}
function Tl(e) {
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
var El = {
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
function Dl(e) {
	try {
		return Tl(e) ? !0 : wl() ? navigator.vibrate(El[e]) ?? !1 : !1;
	} catch {
		return !1;
	}
}
function Ol() {
	return wl() || !!(typeof window < "u" && window.BourreHaptics);
}
//#endregion
//#region src/audio/AudioManager.ts
var kl = {
	"card-place-normal": .38,
	"card-place-soft": .34,
	"card-place-heavy": .42,
	"lead-sweetener-light": .42,
	"lead-sweetener-strong": .46,
	"trick-win-normal": .55,
	"trick-win-big": .6,
	"coin-chime-light": .4,
	moneygone: .45,
	"hand-win-stinger": .6,
	"card-shuffle-normal": .55,
	"card-shuffle-final": .55,
	"card-select": .45,
	"card-illegal": .5,
	close: .5,
	"ui-button-press": .4,
	draw: .45,
	draw1: .45,
	draw2: .45,
	draw3: .45,
	draw4: .45,
	draw5: .45,
	Fahhh: .5,
	fahhh: .5,
	fahhhh: .5,
	timer: .48
};
function Al(...e) {
	console.log("[nbl-audio]", ...e);
}
function jl() {
	try {
		return localStorage.getItem("nbl-audio-debug") === "1";
	} catch {
		return !1;
	}
}
var Ml = class e {
	static instance = null;
	howls = /* @__PURE__ */ new Map();
	unlocked = !1;
	static get() {
		return e.instance ||= new e(), e.instance;
	}
	constructor() {
		for (let e of Xc) this.register(e);
	}
	register(e) {
		let t = `/sounds/${Zc[e]}`;
		Al("register", {
			key: e,
			resolvedUrl: t,
			fallback: !1,
			batch1: Yc(e)
		});
		let n = new Gc.Howl({
			src: [t],
			volume: kl[e] ?? .55,
			preload: !0,
			onload: jl() ? () => {
				Al("loaded", {
					key: e,
					resolvedUrl: t,
					state: "loaded"
				});
			} : void 0,
			onloaderror: (n, r) => {
				console.error("[nbl-audio] sound load error", {
					key: e,
					path: t,
					error: r,
					fallback: !1
				});
			},
			onplay: jl() ? () => {
				Al("playing", {
					key: e,
					resolvedUrl: t
				});
			} : void 0,
			onplayerror: (n, r) => {
				console.error("[nbl-audio] sound play error", {
					key: e,
					path: t,
					error: r,
					fallback: !1
				});
			}
		});
		this.howls.set(e, n);
	}
	unlock() {
		this.unlocked = !0;
		let e = !1;
		try {
			let t = Gc.Howler.ctx;
			t && typeof t.resume == "function" && t.state === "suspended" && (e = !0, t.resume().then(() => {
				Al("unlock-resume", {
					state: t.state,
					ok: !0
				});
			}, (e) => {
				console.error("[nbl-audio] unlock-resume-failed", {
					state: t.state,
					error: String(e),
					fallback: !1
				});
			})), Al("unlock", {
				ctxState: t?.state ?? "none",
				resumeAttempted: e
			});
		} catch (e) {
			return console.error("[nbl-audio] unlock-failed", {
				error: String(e),
				fallback: !1
			}), !1;
		}
		return this.unlocked;
	}
	isUnlocked() {
		return this.unlocked;
	}
	getContextState() {
		return Gc.Howler.ctx?.state ?? "none";
	}
	play(e, t) {
		let n = t?.path ?? `/sounds/${Zc[e]}`;
		Al("play", {
			key: e,
			resolvedUrl: n,
			fallback: !1,
			batch1: Yc(e),
			event: t?.event,
			volume: t?.volume
		});
		let r = this.howls.get(e);
		if (!r) return console.error("[nbl-audio] missing sound registration", {
			key: e,
			path: n,
			event: t?.event,
			fallback: !1
		}), !1;
		let i = r.state();
		if (i === "unloaded") return console.error("[nbl-audio] sound not loaded", {
			key: e,
			path: n,
			event: t?.event,
			state: i,
			fallback: !1
		}), !1;
		t?.volume != null && r.volume(t.volume);
		try {
			return r.play(), jl() && Al("play-started", {
				key: e,
				resolvedUrl: n,
				event: t?.event,
				howlState: r.state()
			}), !0;
		} catch (r) {
			return console.error("[nbl-audio] play threw", {
				key: e,
				path: n,
				event: t?.event,
				error: String(r),
				fallback: !1
			}), !1;
		}
	}
}, Nl = /* @__PURE__ */ new Map(), Pl = /* @__PURE__ */ new Map();
function Fl(e) {
	switch (e) {
		case "card:played": return "cardPlace";
		case "card:lead-change": return "leadChange";
		case "trick:won": return "trickWin";
		case "trick:collected": return "trickCollect";
	}
}
function Il(e) {
	switch (e) {
		case "card:played": return 0;
		case "card:lead-change": return 0;
		case "trick:won": return 0;
		case "trick:collected": return 0;
	}
}
function X(e) {
	switch (e.type) {
		case "card:played":
		case "card:lead-change": return e.cardId ?? "unknown";
		case "trick:won":
		case "trick:collected": return `${e.winningSeat ?? "unknown"}:${e.type}`;
	}
}
function Z(e) {
	let t = Nl.get(e);
	return t == null ? !1 : Date.now() - t > 9e4 ? (Nl.delete(e), !1) : !0;
}
function Ll(e) {
	Nl.set(e, Date.now());
}
function Rl() {
	Nl.clear();
	for (let e of Pl.values()) clearTimeout(e);
	Pl.clear();
}
var zl = {
	cardPlace: .38,
	leadChange: .42,
	trickWin: .55,
	trickCollect: .4,
	trickCollectOther: .45
};
function Bl(e, t = {}) {
	let n = gl().soundPackId, r = rl(n, e, t);
	if (!r) {
		console.error("[nbl-audio] FAIL", {
			event: e,
			reason: "no-asset-mapping",
			packId: n,
			ctx: t,
			fallback: !1
		});
		return;
	}
	let i = nl(n, r), a = Yc(r);
	console.log("[nbl-audio] request", {
		event: e,
		key: r,
		resolvedUrl: i,
		fallback: !1,
		batch1: a,
		packId: n,
		ctx: t
	});
	let o = zl[e] ?? .55, s = e === "trickWin" ? o * (t.volumeScale ?? 1) : o;
	Ml.get().play(r, {
		volume: s,
		event: e,
		path: i
	}) || console.error("[nbl-audio] FAIL", {
		event: e,
		reason: "howler-play-failed",
		assetId: r,
		path: i,
		fallback: !1
	});
}
function Vl(e) {
	let t = gl(), n = Fl(e.type);
	if (vl(t.soundMode, n)) switch (e.type) {
		case "card:played":
			Bl("cardPlace", { intensityTier: e.intensityTier });
			break;
		case "card:lead-change":
			Bl("leadChange", { intensityTier: e.intensityTier });
			break;
		case "trick:won": {
			let t = ul(e);
			if (console.log("[nbl-audio] trick-win-gate", {
				event: "trickWin",
				key: "trick-win-normal",
				allowed: t,
				isLocalPlayer: e.isLocalPlayer ?? !1
			}), !t) break;
			Bl("trickWin", {
				volumeScale: 1.08,
				isLocalPlayer: !0
			});
			break;
		}
		case "trick:collected": {
			let t = fl(e);
			console.log("[nbl-audio] trick-collect-gate", {
				event: t,
				isLocalPlayer: e.isLocalPlayer ?? !1,
				winningSeat: e.winningSeat
			}), Bl(t);
			break;
		}
	}
}
function Hl(e) {
	let t = gl();
	if (e.type === "trick:won" && e.isLocalPlayer) {
		Cl(t.hapticsMode, "medium") && Dl("medium");
		return;
	}
	e.type === "card:lead-change" && e.isLocalPlayer && Cl(t.hapticsMode, "light") && Dl("light");
}
function Ul(e) {
	try {
		let t = ol(e.type, e.trickId, X(e));
		if (Z(t)) return;
		let n = Il(e.type), r = () => {
			Z(t) || (Ll(t), Vl(e), Hl(e));
		};
		if (n <= 0) {
			r();
			return;
		}
		let i = t, a = Pl.get(i);
		a && clearTimeout(a);
		let o = setTimeout(() => {
			Pl.delete(i), r();
		}, n);
		Pl.set(i, o);
	} catch {}
}
//#endregion
//#region src/table/feedback/audio.ts
var Wl = !1;
function Gl() {
	return gl().soundPackId;
}
function Kl(e, t, n) {
	console.log("[nbl-audio]", e, {
		event: t,
		...n
	});
}
function ql(e, t, n = {}) {
	console.error("[nbl-audio] FAIL", {
		event: e,
		reason: t,
		fallback: !1,
		...n
	});
}
function Jl(e = "unknown") {
	let t = Wl;
	Wl = !0;
	let n = Ml.get().unlock(), r = Ml.get().getContextState();
	return Kl("unlock-attempt", "draw", {
		source: e,
		wasUnlocked: t,
		nowUnlocked: Wl,
		managerOk: n,
		ctxState: r
	}), Wl && n;
}
async function Yl(e) {
	Wl && (Ml.get().unlock(), Kl("preload", "shuffle", { packId: e ?? Gl() }));
}
var Xl = {
	shuffle: { current: !1 },
	shuffleFinal: { current: !1 },
	draw: { current: !1 },
	cardPlace: { current: !1 },
	leadChange: { current: !1 },
	trickWin: { current: !1 },
	trickCollect: { current: !1 },
	trickCollectOther: { current: !1 },
	handWin: { current: !1 },
	potWin: { current: !1 },
	bigWin: { current: !1 },
	bourre: { current: !1 },
	gameStart: { current: !1 },
	openRoom: { current: !1 },
	deleteRoom: { current: !1 },
	fold: { current: !1 },
	cardSelect: { current: !1 },
	cardIllegal: { current: !1 },
	uiButton: { current: !1 },
	turnTimer: { current: !1 }
}, Zl = {
	shuffle: 360,
	shuffleFinal: 360,
	draw: 280,
	cardPlace: 120,
	leadChange: 180,
	trickWin: 320,
	trickCollect: 280,
	trickCollectOther: 280,
	handWin: 280,
	potWin: 580,
	bigWin: 580,
	bourre: 520,
	gameStart: 320,
	openRoom: 360,
	deleteRoom: 280,
	fold: 280,
	cardSelect: 200,
	cardIllegal: 280,
	uiButton: 200,
	turnTimer: 0
}, Ql = {
	shuffle: .55,
	shuffleFinal: .55,
	draw: .45,
	cardPlace: .38,
	leadChange: .42,
	trickWin: .55,
	trickCollect: .4,
	trickCollectOther: .45,
	handWin: .4,
	potWin: .6,
	bigWin: .6,
	bourre: .5,
	gameStart: .42,
	openRoom: .55,
	deleteRoom: .5,
	fold: .42,
	cardSelect: .45,
	cardIllegal: .5,
	uiButton: .4,
	turnTimer: .48
};
function $l(e, t, n, r) {
	Jl(`play:${e}`);
	let i = nl(r, t), a = Yc(t);
	if (Kl("request", e, {
		key: t,
		resolvedUrl: i,
		fallback: !1,
		batch1: a,
		volume: n,
		packId: r,
		unlocked: Wl
	}), !Wl) return ql(e, "audio-not-unlocked", {
		key: t,
		resolvedUrl: i,
		batch1: a
	}), !1;
	if (a && i !== nl(r, t)) return ql(e, "batch1-url-mismatch", {
		key: t,
		resolvedUrl: i
	}), !1;
	let o = Ml.get().play(t, {
		volume: n,
		event: e,
		path: i
	});
	return o ? Kl("play-ok", e, {
		key: t,
		resolvedUrl: i
	}) : ql(e, "howler-play-failed", {
		key: t,
		resolvedUrl: i,
		batch1: a
	}), o;
}
async function eu(e, t = {}) {
	let n = Xl[e];
	if (n.current) return;
	n.current = !0;
	let r = Gl(), i = rl(r, e, t);
	try {
		if (!i) {
			ql(e, "no-asset-mapping", {
				packId: r,
				ctx: t
			});
			return;
		}
		$l(e, i, Ql[e], r);
	} catch (t) {
		ql(e, "play-threw", { error: String(t) });
	} finally {
		window.setTimeout(() => {
			n.current = !1;
		}, Zl[e]);
	}
}
function tu() {
	eu("shuffle");
}
function nu(e) {
	ru(e);
}
async function ru(e) {
	let t = "draw";
	Jl("draw-count");
	let n = Xl[t];
	if (n.current) return;
	n.current = !0;
	let r = Gl(), i = $c(e);
	try {
		if (!i) {
			ql(t, "no-asset-mapping", {
				packId: r,
				cardCount: e
			});
			return;
		}
		Kl("draw-request", t, {
			cardCount: e,
			key: i,
			unlocked: Wl
		}), $l(t, i, Ql[t], r);
	} catch (n) {
		ql(t, "play-threw", {
			error: String(n),
			cardCount: e
		});
	} finally {
		window.setTimeout(() => {
			n.current = !1;
		}, Zl[t]);
	}
}
function iu() {
	eu("trickCollect");
}
function au() {
	try {
		iu();
	} catch {}
}
function ou(e = 1) {
	su(e);
}
async function su(e) {
	let t = "trickWin", n = Xl[t];
	if (n.current) return;
	n.current = !0;
	let r = Gl(), i = rl(r, t, { volumeScale: e });
	try {
		if (!i) {
			ql(t, "no-asset-mapping", {
				packId: r,
				volumeScale: e
			});
			return;
		}
		$l(t, i, Ql[t] * e, r);
	} catch (e) {
		ql(t, "play-threw", { error: String(e) });
	} finally {
		window.setTimeout(() => {
			n.current = !1;
		}, Zl[t]);
	}
}
function cu() {
	eu("bigWin");
}
function lu() {
	eu("bourre");
}
function uu(e, t = {}) {
	console.log(`[nbl-audio] bourre-private ${e}`, t);
}
function du(e) {
	uu(`skipped reason=${e}`);
}
function fu(e, t) {
	if (uu(`eligible ${t}`), !t) {
		du("not-local");
		return;
	}
	let n = Wc(e);
	if (!n.ok) {
		du(n.reason ?? "duplicate");
		return;
	}
	if (Jl("bourre-private"), !Wl) {
		du("audio-locked");
		return;
	}
	let r = Uc();
	uu(`chosen ${r}`);
	let i = nl(Gl(), r);
	if (!i) {
		du("missing-asset");
		return;
	}
	if (!Ml.get().play(r, {
		volume: .5,
		event: "bourre",
		path: i
	})) {
		du("missing-asset");
		return;
	}
	uu("played", {
		assetId: r,
		dedupeKey: e
	});
}
function pu() {
	eu("gameStart");
}
function mu() {
	eu("openRoom");
}
function hu() {
	eu("deleteRoom");
}
function gu() {
	eu("cardSelect");
}
function _u() {
	eu("cardIllegal");
}
function vu() {
	eu("uiButton");
}
function yu() {
	eu("fold");
}
function bu() {
	return typeof window < "u";
}
var xu = 700, Su = 500, Cu = 450, wu = 1200, Tu = 2e3, Eu = 1500, Du = 280, Ou = 0, ku = 0, Au = 0, ju = 0, Mu = 0, Nu = 0, Pu = 0, Fu = null, Iu = !1;
function Lu() {
	return gl();
}
function Ru(e) {
	Cl(Lu().hapticsMode, e) && Dl(e);
}
function zu(e, t) {
	vl(Lu().soundMode, e) && t();
}
function Bu() {
	if (Iu || typeof window > "u") return;
	Iu = !0;
	let e = () => {
		Jl("init-pointerdown");
	};
	window.addEventListener("pointerdown", e, {
		once: !0,
		passive: !0
	}), window.addEventListener("keydown", e, { once: !0 });
}
function Vu(e = {}) {
	if (Date.now() - Ou < xu) return;
	Fu &&= (clearTimeout(Fu), null);
	let t = e.delayMs ?? (Sl() ? 0 : 40);
	Fu = window.setTimeout(() => {
		Fu = null, Ou = Date.now(), zu("shuffle", tu), Ru("light");
	}, t);
}
function Hu(e) {
	Jl("draw-confirm");
	let t = Date.now();
	t - ku < Su || (ku = t, zu("draw", () => nu(e)), Ru("light"));
}
function Uu() {
	Hu(0);
}
function Wu() {
	let e = Date.now();
	e - Au < Cu || (Au = e, zu("trickWin", ou), Ru("medium"));
}
function Gu() {
	let e = Date.now();
	e - ju < wu || (ju = e, zu("bigWin", cu), Ru("strong"));
}
function Ku() {
	let e = Date.now();
	e - Mu < Tu || (Mu = e, zu("bourre", lu), Ru("medium"));
}
function qu(e) {
	if (!e.isLocalBourredPlayer) return;
	let t = Hc(e.sessionId, e.handNumber);
	zu("bourre", () => fu(t, e.isLocalBourredPlayer)), Ru("medium");
}
function Ju() {
	let e = Date.now();
	e - Nu < Eu || (Nu = e, zu("gameStart", pu), Ru("light"));
}
function Yu() {
	let e = Date.now();
	e - Pu < Du || (Pu = e, zu("cardIllegal", _u), Ru("light"));
}
function Xu() {
	zu("openRoom", mu);
}
function Zu() {
	zu("deleteRoom", hu);
}
function Qu() {
	zu("cardSelect", gu);
}
function $u() {
	zu("uiButton", vu);
}
function ed() {
	zu("fold", yu);
}
function td() {
	Ru("light");
}
//#endregion
//#region src/table/actionErrorCopy.ts
function nd(e) {
	let t = String(e ?? "").trim();
	if (!t) return null;
	let n = t.toLowerCase();
	return n === "internal" || n.includes("internal error") ? "The server could not finish that table action. Refresh the page and try again." : t;
}
//#endregion
//#region src/table/theme/cardPacks.ts
var rd = "classic";
function id(e) {
	return e === "elegant" || e === "casino" || e === "midnight" ? e : rd;
}
//#endregion
//#region src/table/theme/settings.ts
var ad = "nbl-table-settings", od = {
	focusTable: "F",
	toggleSettings: ",",
	standPat: "P",
	nextTable: "Tab"
}, sd = {
	classic: "Classic",
	elegant: "Elegant",
	casino: "Casino",
	midnight: "Midnight"
}, cd = {
	themeId: "night-felt",
	cardPackId: rd,
	deckMode: "classic",
	cardScale: "md",
	highContrast: !1,
	tableScale: 1,
	layoutMode: "single",
	hotkeys: { ...od }
}, ld = {
	carbon: "Carbon",
	simple: "Simple",
	"night-felt": "Night Felt",
	arena: "Arena"
};
function ud(e) {
	return Math.max(.85, Math.min(1.35, e));
}
function dd() {
	try {
		let e = localStorage.getItem(ad);
		if (!e) return {
			...cd,
			hotkeys: { ...od }
		};
		let t = JSON.parse(e);
		return {
			...cd,
			...t,
			cardPackId: id(t.cardPackId),
			tableScale: ud(t.tableScale ?? cd.tableScale),
			hotkeys: {
				...od,
				...t.hotkeys
			}
		};
	} catch {
		return {
			...cd,
			hotkeys: { ...od }
		};
	}
}
function fd(e) {
	try {
		localStorage.setItem(ad, JSON.stringify(e));
	} catch {}
}
function pd(e, t) {
	e.dataset.tableTheme = t.themeId, e.dataset.cardPack = t.cardPackId, e.dataset.deckMode = t.deckMode, e.dataset.cardScale = t.cardScale, e.dataset.highContrast = t.highContrast ? "true" : "false", e.dataset.layoutMode = t.layoutMode, e.style.setProperty("--table-scale", String(t.tableScale));
}
//#endregion
//#region src/table/theme/TableThemeContext.tsx
var md = (0, l.createContext)(null);
function hd({ settings: e, children: t }) {
	let n = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		n.current && pd(n.current, e);
	}, [e]), /* @__PURE__ */ (0, g.jsx)("div", {
		ref: n,
		className: "btable-room",
		children: t
	});
}
function gd({ children: e }) {
	let [t, n] = (0, l.useState)(() => dd()), r = (0, l.useCallback)((e) => {
		n((t) => {
			let n = {
				...t,
				...e,
				hotkeys: {
					...t.hotkeys,
					...e.hotkeys
				}
			};
			return fd(n), n;
		});
	}, []), i = (0, l.useCallback)(() => {
		let e = {
			...cd,
			hotkeys: { ...cd.hotkeys }
		};
		fd(e), n(e);
	}, []), a = (0, l.useMemo)(() => ({
		settings: t,
		updateSettings: r,
		resetSettings: i
	}), [
		t,
		r,
		i
	]);
	return /* @__PURE__ */ (0, g.jsx)(md.Provider, {
		value: a,
		children: /* @__PURE__ */ (0, g.jsx)(hd, {
			settings: t,
			children: e
		})
	});
}
//#endregion
//#region src/table/theme/useTableTheme.ts
function _d() {
	let e = (0, l.useContext)(md);
	if (!e) throw Error("useTableTheme must be used within TableThemeProvider");
	return e;
}
//#endregion
//#region src/table/presentationMotionBusy.ts
var vd = !1, yd = !1, Q = !1, bd = null, xd = null, Sd = /* @__PURE__ */ new Set();
function Cd() {
	for (let e of Sd) e();
}
function wd(e) {
	vd !== e && (vd = e, Cd());
}
function Td() {
	return vd;
}
function Ed(e) {
	yd !== e && (yd = e, e || kd(), Cd());
}
function Dd(e, t) {
	bd = e, xd = t, Cd();
}
function Od(e) {
	return bd !== e || !xd ? null : xd();
}
function kd() {
	bd = null, xd = null, Cd();
}
function Ad() {
	return yd;
}
function jd(e) {
	Q !== e && (Q = e, Cd());
}
function Md() {
	return Q;
}
function Nd(e) {
	return Sd.add(e), () => Sd.delete(e);
}
function Pd() {
	vd = !1, yd = !1, Q = !1, kd(), Cd();
}
//#endregion
//#region src/table/gameFlowDebug.ts
var Fd = "nbl-game-flow-debug", Id = !1, Ld = null;
function Rd() {
	if (Id) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(Fd) === "1" ? !0 : new URLSearchParams(window.location.search).has("gameFlowDebug");
	} catch {
		return !1;
	}
}
function zd(e, t, n) {
	if (!Rd()) return;
	let r = `[nbl-flow ${typeof performance < "u" ? `${performance.now().toFixed(1)}ms` : ""}] ${e} :: ${t}`;
	if (Ld) {
		Ld(r.trim(), n);
		return;
	}
	console.info(r, n ?? "");
}
var Bd = {
	pipelineActive: !1,
	revealCatchUp: !1,
	motionGateActive: !1,
	peakPlayCount: 0,
	displayedPlayCount: 0,
	handPresenting: !1,
	handPresentationPhase: "idle",
	dealPresentationActive: !1,
	antePresentationActive: !1,
	trickCollectionActive: !1
}, Vd = Bd, Hd = /* @__PURE__ */ new Set(), Ud = 0, Wd = null;
function Gd(e, t) {
	return e.pipelineActive === t.pipelineActive && e.revealCatchUp === t.revealCatchUp && e.motionGateActive === t.motionGateActive && e.peakPlayCount === t.peakPlayCount && e.displayedPlayCount === t.displayedPlayCount && e.handPresenting === t.handPresenting && e.handPresentationPhase === t.handPresentationPhase && e.dealPresentationActive === t.dealPresentationActive && e.antePresentationActive === t.antePresentationActive && e.trickCollectionActive === t.trickCollectionActive;
}
function Kd(e) {
	return e.dealPresentationActive ? "dealPresentationActive" : e.antePresentationActive ? "antePresentationActive" : e.trickCollectionActive ? "trickCollectionActive" : e.handPresenting ? "handPresenting" : e.pipelineActive ? "pipelineActive" : e.revealCatchUp ? "revealCatchUp" : e.peakPlayCount > e.displayedPlayCount && e.peakPlayCount > 0 ? "peakPlayCatchUp" : null;
}
function qd(e) {
	return Kd(e) != null;
}
function Jd(e, t, n) {
	return !(!e || n === "play" || n === "draw" && (t === "drawPlayer" || t === "drawReady"));
}
function Yd(e) {
	let t = { ...Vd }, n = Wd ? Date.now() - Wd.since : 0, r = {
		...Vd,
		pipelineActive: !1,
		revealCatchUp: !1,
		handPresenting: !1,
		handPresentationPhase: "idle",
		peakPlayCount: Vd.displayedPlayCount,
		motionGateActive: !1,
		dealPresentationActive: !1,
		antePresentationActive: !1,
		trickCollectionActive: !1
	};
	Ud = Date.now() + 1500, Wd = null, Rd() && zd("trickAnimationBridge", "table-presentation-force-release", {
		source: e,
		blockedMs: n,
		from: t,
		to: r
	}), Qd(r);
}
function Xd(e = Date.now()) {
	if (e < Ud) return {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	let t = Kd(Vd);
	if (t == null) return Wd = null, {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	(!Wd || Wd.reason !== t) && (Wd = {
		reason: t,
		since: e,
		blockedLogged: !1
	});
	let n = e - Wd.since;
	return n >= 7e3 ? (Rd() && !Wd.blockedLogged && zd("trickAnimationBridge", "gate-force-release", {
		reason: t,
		blockedMs: n
	}), Yd("gate-timeout"), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !0
	}) : n >= 5500 ? (Rd() && !Wd.blockedLogged && (zd("trickAnimationBridge", "gate-soft-unblock", {
		reason: t,
		blockedMs: n
	}), Wd.blockedLogged = !0), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !1
	}) : (Rd() && !Wd.blockedLogged && (zd("trickAnimationBridge", "gate-blocked", {
		reason: t,
		blockedMs: n
	}), Wd.blockedLogged = !0), {
		blocked: !0,
		reason: t,
		blockedMs: n,
		softUnblock: !1,
		forceReleased: !1
	});
}
function Zd(e = Date.now()) {
	return Xd(e).blocked;
}
function Qd(e) {
	if (!Gd(Vd, e)) {
		Rd() && zd("trickAnimationBridge", "busy-state", {
			from: Vd,
			to: e,
			busy: qd(e),
			blockReason: Kd(e),
			motionGateActive: e.motionGateActive,
			handPresentationPhase: e.handPresentationPhase
		}), Vd = e, Kd(e) ?? (Wd = null);
		for (let e of Hd) e();
	}
}
function $d() {
	Ud = 0, Wd = null, Qd(Bd);
}
function ef() {
	return Vd;
}
function tf() {
	return Vd.pipelineActive || Vd.revealCatchUp || Vd.motionGateActive || Vd.trickCollectionActive || Vd.peakPlayCount > Vd.displayedPlayCount && Vd.peakPlayCount > 0;
}
function nf() {
	return qd(Vd);
}
function rf(e) {
	return Hd.add(e), () => Hd.delete(e);
}
//#endregion
//#region src/table/stageFitMotionFreeze.ts
var af = !1, of = /* @__PURE__ */ new Set();
function sf() {
	for (let e of of) e();
}
function cf(e) {
	af !== e && (af = e, sf());
}
function lf() {
	if (Td() || Ad() || Md() || af || tf()) return !0;
	let e = ef();
	return !!(e.handPresenting && e.handPresentationPhase !== "idle");
}
function uf(e) {
	of.add(e);
	let t = Nd(e), n = rf(e);
	return () => {
		of.delete(e), t(), n();
	};
}
//#endregion
//#region src/table/HeroHand.tsx
function df(e, t, n = []) {
	return [
		`btable-hero btable-hero--bare btable-hero--scale-${e.cardScale}`,
		...n,
		t
	].filter(Boolean).join(" ");
}
function ff({ className: e = "" }) {
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: `btable-hero btable-hero--bare btable-hero--reserved ${e}`.trim(),
		"aria-hidden": "true",
		"data-testid": "hero-hand"
	});
}
function pf({ cards: e, phase: t, enrollmentActive: n = !1, isInHand: r = !1, isDealer: i = !1, signedIn: a = !1, isMyTurn: o = !1, drawCompleted: s = !1, maxDrawDiscards: c = 4, legalPlayIndices: u, recommendedPlayIndex: d = null, recommendedDiscardIndices: f = [], handComplete: p = !1, actionFeedback: m, onSubmitDraw: h, onPassDraw: _, onFoldDraw: v, onPlayCard: y, privateHandReady: b = !1, className: x = "", dealStaggerMs: S = 120, drawAnimSubPhase: C = null, drawDiscardCount: w = 0, drawReplaceCount: T = 0, currentUserId: E = null, revealedTrumpIndex: D = null, trumpMergeActive: O = !1, trumpDisabledIndex: k = null, handNumber: A = 0, trickNumber: j = null, turnPlayerId: M = null, tableRootRef: N, pileIndexRef: te, onDiscardCommitted: P, onUserActivity: F, skipHeroDealMotion: I = !1 }) {
	let { settings: L } = _d(), [R, z] = (0, l.useState)(/* @__PURE__ */ new Set()), [B, V] = (0, l.useState)(null), [H, U] = (0, l.useState)(null), [ne, re] = (0, l.useState)(null), [W, ie] = (0, l.useState)(!1), [G, ae] = (0, l.useState)(null), [oe, se] = (0, l.useState)(null), [ce, le] = (0, l.useState)(null), [ue, de] = (0, l.useState)(() => oc()), [fe, pe] = (0, l.useState)(!1), [me, he] = (0, l.useState)(!1), [ge, _e] = (0, l.useState)(!1), [ve, ye] = (0, l.useState)([]), be = (0, l.useRef)(/* @__PURE__ */ new Set()), xe = (0, l.useRef)(null), Se = (0, l.useRef)(!1), Ce = (0, l.useRef)(null), we = (0, l.useRef)(null), Te = (0, l.useRef)(0), Ee = (0, l.useRef)({
		handNumber: 0,
		trickNumber: null,
		turnPlayerId: null,
		isMyTurn: !1,
		busy: !1,
		selectedPlay: null
	}), De = Mc({
		handNumber: A,
		trickNumber: j,
		turnPlayerId: M,
		phase: t ?? null
	}), [K, Oe] = (0, l.useState)(!1), ke = (0, l.useRef)(async () => {}), Ae = Fs(t), je = (0, l.useMemo)(() => e.map(Ms), [e]), Me = (0, l.useMemo)(() => e.map((e) => `${e.rank}-${e.suit}`).join("|"), [e]), Ne = (0, l.useMemo)(() => f.slice().sort((e, t) => e - t).join(","), [f]), Pe = t === "draw", Fe = t === "play", q = W || m?.status === "loading" || H !== null;
	Ee.current = {
		handNumber: A,
		trickNumber: j,
		turnPlayerId: M,
		isMyTurn: o,
		busy: q,
		selectedPlay: B
	};
	let Ie = (0, l.useCallback)((e, t) => D === t ? O ? "hand__slot--trump-merge-target" : "hand__slot--trump-revealed" : "", [D, O]);
	(0, l.useEffect)(() => {
		if (I || !Ae || e.length === 0) return;
		let t = new Set(e.map((e) => `${e.rank}-${e.suit}`)), n = be.current, r = [...t].some((e) => !n.has(e));
		if (be.current = t, !r || n.size > 0) return;
		pe(!0), U(null), V(null);
		let i = js(e.length, S), a = window.setTimeout(() => pe(!1), i);
		return () => window.clearTimeout(a);
	}, [
		e,
		Ae,
		S,
		I
	]), (0, l.useEffect)(() => {
		(C === "done" || C === null) && ye([]);
	}, [C]), (0, l.useEffect)(() => (cf(H !== null), () => cf(!1)), [H]), As(xe, {
		dealing: fe,
		dealStaggerMs: S,
		drawAnimSubPhase: C,
		drawDiscardCount: w,
		drawReplaceCount: T,
		pendingDiscardIndices: ve,
		standPatPulse: me,
		foldOutPulse: ge,
		playingIndex: H,
		cards: e,
		handNumber: A,
		playerId: E,
		tableRootRef: N,
		pileIndexRef: te,
		onDiscardCommitted: P,
		skipHeroDealMotion: I
	});
	let Le = (0, l.useCallback)((e) => {
		if (Ce.current != null && (window.clearTimeout(Ce.current), Ce.current = null, e)) {
			let e = Ee.current;
			e.handNumber, e.trickNumber, e.turnPlayerId, e.selectedPlay, Te.current, e.isMyTurn, Se.current, e.busy;
		}
		we.current = null;
	}, []), Re = (0, l.useCallback)(() => (Te.current += 1, Te.current), []);
	(0, l.useEffect)(() => () => Le(), [Le]), (0, l.useEffect)(() => {
		Le(), V(null), z(/* @__PURE__ */ new Set()), Oe(!1), re(null), se(null), le(null), ae(null);
	}, [
		t,
		Me,
		Le
	]), (0, l.useEffect)(() => {
		B !== null && (Lc(B, u) || (V(null), we.current = null, Le()));
	}, [
		u,
		B,
		Le
	]), (0, l.useEffect)(() => {
		if (!ue || !Pe || s || K) return;
		let e = f;
		z((t) => t.size === e.length && e.every((e) => t.has(e)) ? t : new Set(e));
	}, [
		ue,
		Pe,
		s,
		K,
		Ne,
		f
	]);
	let ze = (0, l.useRef)(o);
	(0, l.useEffect)(() => {
		let e = o && !ze.current;
		if (ze.current = o, !(!e || !Fe || B === null || Se.current || q)) {
			if (!Lc(B, u)) {
				V(null), we.current = null;
				return;
			}
			ke.current(B);
		}
	}, [
		Fe,
		o,
		B,
		u,
		q,
		A,
		j,
		M
	]);
	let Be = (0, l.useRef)(De);
	(0, l.useEffect)(() => {
		if (Be.current === De) return;
		let e = Pc(Be.current), t = Pc(De);
		Be.current = De, Re(), Le("play-activity-change"), Nc(e, t) && V(null);
	}, [
		De,
		Re,
		Le,
		A,
		j,
		M
	]), (0, l.useEffect)(() => {
		m?.status === "success" ? (U(null), Le(), Se.current = !1) : m?.status === "error" && (U(null), Se.current = !1);
	}, [m?.status, Le]);
	let Ve = (0, l.useRef)(void 0);
	(0, l.useEffect)(() => {
		let e = m?.status, t = Ve.current;
		Ve.current = e, t === "error" && e !== "error" && ae(null);
	}, [m?.status]);
	let He = L.cardScale === "lg" ? "md" : "sm", Ue = nd(m?.status === "error" ? m.message : G), We = Ns(t, n);
	(0, l.useEffect)(() => {
		F && Pe && R.size > 0 && F();
	}, [
		Pe,
		R.size,
		F
	]), (0, l.useEffect)(() => {
		F && Fe && B !== null && F();
	}, [
		Fe,
		B,
		F
	]);
	let Ge = (0, l.useCallback)(() => {
		F?.();
	}, [F]), Ke = (0, l.useCallback)((e) => {
		if (q || k === e) return;
		Oe(!0), Ge(), ae(null);
		let t = !1;
		z((n) => {
			let r = new Set(n);
			return r.has(e) ? (r.delete(e), t = !0) : r.size < c ? (r.add(e), t = !0) : ae(`You may discard at most ${c} cards`), r;
		}), t && Qu();
	}, [
		q,
		c,
		k,
		Ge
	]), qe = (0, l.useCallback)(async (e, t = "tap-autoplay") => {
		if (Se.current || q || !y) {
			Se.current;
			return;
		}
		if (!Lc(e, u)) return;
		Re(), Le(), Se.current = !0, U(e), ae(null), Te.current;
		let n = je[e];
		E && n && Qs(E, Vs({
			playerId: E,
			card: {
				rank: String(n.rank),
				suit: String(n.suit)
			}
		}), e);
		try {
			await Promise.resolve(y(e)), U(null), V(null), Se.current = !1;
		} catch {
			U(null), Se.current = !1;
		}
	}, [
		q,
		Re,
		Le,
		E,
		A,
		o,
		u,
		y,
		j,
		M,
		je
	]), Je = (0, l.useCallback)((e) => {
		if (Se.current || q || !y || t !== "play") return;
		let n = Lc(e, u);
		if (!n) {
			o && (Yu(), Re(), Le("illegal"), V(null), se(e), le(e), window.setTimeout(() => {
				se(null), le(null);
			}, tc.illegalFlash), ae("Illegal play"));
			return;
		}
		let r = Ac({
			selectedPlay: B,
			tappedIndex: e,
			isMyTurn: o,
			isLegal: n
		});
		if (r.isDeselect) {
			Re(), Le("deselect"), V(null);
			return;
		}
		if (r.shouldCancelAutoplay && B !== null && B !== e && (Re(), Le("selection-switch")), r.shouldImmediatePlay && r.nextSelection !== null) {
			V(r.nextSelection), ae(null), Ge(), r.nextSelection, qe(r.nextSelection, "tap");
			return;
		}
		V(r.nextSelection), ae(null), Ge(), r.nextSelection !== null && Qu(), r.shouldQueueSelection, r.nextSelection;
	}, [
		Re,
		q,
		Le,
		qe,
		A,
		o,
		u,
		Ge,
		y,
		t,
		B,
		j,
		M
	]), Ye = (0, l.useCallback)((e) => {
		if (Se.current || q || !y || t !== "play") return;
		let n = Lc(e, u);
		Se.current, jc(o, n) && (Re(), Le("swipe"), V(e), qe(e, "swipe"));
	}, [
		Re,
		q,
		Le,
		qe,
		A,
		o,
		u,
		y,
		t,
		j,
		M
	]), Xe = (0, l.useCallback)((e, t = "tap") => {
		if (t === "swipe-flick") {
			Ye(e);
			return;
		}
		if (t === "hold") {
			Ye(e);
			return;
		}
		Je(e);
	}, [Ye, Je]);
	ke.current = (e) => qe(e, "tap-autoplay");
	let Ze = (0, l.useCallback)(async (e) => {
		if (!(!h || q)) {
			if (Jl("draw-button"), $u(), Ge(), e.length > c) {
				ae(`You may discard at most ${c} cards`);
				return;
			}
			ie(!0), ae(null), ye([...e]), Hu(e.length);
			try {
				await h(e), z(/* @__PURE__ */ new Set());
			} catch {} finally {
				ie(!1);
			}
		}
	}, [
		h,
		q,
		c,
		Ge
	]), Qe = (0, l.useCallback)(async () => {
		if (!(!_ || q)) {
			$u(), Ge(), ie(!0), ae(null);
			try {
				await _(), z(/* @__PURE__ */ new Set()), he(!0), window.setTimeout(() => he(!1), 700);
			} catch {} finally {
				ie(!1);
			}
		}
	}, [
		_,
		q,
		Ge
	]), $e = (0, l.useCallback)(async () => {
		if (!(!v || q)) {
			ed(), Ge(), _e(!0), ie(!0), ae(null);
			try {
				await v(), z(/* @__PURE__ */ new Set());
			} catch {
				_e(!1);
			} finally {
				ie(!1);
			}
		}
	}, [
		v,
		q,
		Ge
	]), et = (0, l.useCallback)((e) => {
		Yu(), Le(), V(null), se(e), le(e), window.setTimeout(() => {
			se(null), le(null);
		}, tc.illegalFlash), ae("Illegal play");
	}, [Le]), tt = (0, l.useCallback)((e) => {
		if (de(e), sc(e), e) {
			Oe(!1);
			return;
		}
		K || z(/* @__PURE__ */ new Set());
	}, [K]), nt = a && r && (Pe || Fe), rt = (0, l.useMemo)(() => Bc({
		selectedDraw: R,
		drawSelectionTouched: K,
		bestPlayEnabled: ue,
		recommendedDiscardIndices: f
	}), [
		R,
		K,
		ue,
		Ne,
		f
	]), it = () => nt ? /* @__PURE__ */ (0, g.jsxs)("label", {
		className: "btable-hero__best-play",
		children: [/* @__PURE__ */ (0, g.jsx)("input", {
			type: "checkbox",
			className: "btable-hero__best-play-input",
			checked: ue,
			onChange: (e) => tt(e.target.checked),
			"data-testid": "best-play-checkbox"
		}), /* @__PURE__ */ (0, g.jsx)("span", {
			className: "btable-hero__best-play-label",
			children: "Best Play"
		})]
	}) : null, at = Fc({
		showBestPlayControl: nt,
		inPlayPhase: Fe,
		bestPlayEnabled: ue,
		recommendedPlayIndex: d
	}), ot = (0, l.useCallback)((e) => Ic({
		inPlayPhase: Fe,
		isMyTurn: o,
		busy: q,
		cardIndex: e,
		selectedPlay: B,
		isLegal: Lc(e, u),
		showBestPlayRecommendation: at,
		recommendedPlayIndex: d
	}), [
		q,
		Fe,
		o,
		u,
		d,
		B,
		at
	]);
	if (!a) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: df(L, x),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "Sign in to see your dealt cards."
		})
	});
	if (!r && !n && !Ae) return /* @__PURE__ */ (0, g.jsx)(ff, { className: x });
	if (Ae && r && e.length === 0) return p && n ? /* @__PURE__ */ (0, g.jsx)(ff, { className: x }) : /* @__PURE__ */ (0, g.jsxs)("div", {
		className: df(L, x),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: [/* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: b ? "Cards not available — leave and re-open the session, or refresh the page." : "Loading your cards…"
		}), /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: it()
		})]
	});
	if (Ae && !r && (t === "draw" || t === "play")) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: df(L, x),
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "You sat out this hand."
		})
	});
	if (e.length === 0 && !i) return nt ? /* @__PURE__ */ (0, g.jsx)("div", {
		className: df(L, x, ["btable-hero--reserved"]),
		"data-testid": "hero-hand",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: it()
		})
	}) : /* @__PURE__ */ (0, g.jsx)(ff, { className: x });
	let st = (e, t) => {
		if (D === t) return "trump";
		if (k === t && (Pe || Fe)) return "muted";
		if (H === t || ce === t || oe === t) return "default";
		if (Pe && R.has(t)) return "draw-selected";
		let n = ot(t);
		return n === "play-preselected" ? "play-preselected" : n === "play-recommended" ? "play-recommended" : Fe && u && !u.includes(t) ? "muted" : "default";
	}, ct = Ae && r && !(Fe && o), lt = "none";
	Fe && r ? lt = "play" : Pe && r && !s ? lt = "draw-select" : ct && (lt = "peek");
	let ut = rt.length, dt = Pe && !s && o;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: df(L, x, [
			fe && !I ? "btable-hero--dealing" : "",
			D === null ? "" : "btable-hero--trump-reveal",
			O ? "btable-hero--trump-merge" : "",
			Pe && o && !s ? "btable-hero--draw-select" : "",
			C === "discard" && w > 0 ? "btable-hero--draw-discard" : "",
			C === "receive" && T > 0 ? "btable-hero--draw-receive" : "",
			dt ? "btable-hero--draw-actions" : "",
			Pe && o && !s || Fe && o ? "btable-hero--your-turn" : "",
			(Pe || Fe) && r && !o ? "btable-hero--waiting-turn" : "",
			me ? "btable-hero--stand-pat" : "",
			ge ? "btable-hero--fold-out" : ""
		]),
		style: { "--deal-card-stagger-ms": `${S}ms` },
		"data-testid": "hero-hand",
		"aria-label": `Your dealt cards — ${We}`,
		children: [
			/* @__PURE__ */ (0, g.jsxs)("p", {
				className: "btable-sr-only",
				"aria-live": "polite",
				children: [
					We,
					Pe && !s && o && " — tap cards to discard; red border marks your selection",
					Fe && o && " — tap a legal card to play",
					ue && Fe && " — green outline marks Best Play suggestions"
				]
			}),
			/* @__PURE__ */ (0, g.jsxs)("div", {
				ref: xe,
				className: "btable-hero__hand-3d",
				"data-trick-play-origin": E ?? void 0,
				"data-trick-play-origin-active": Fe && o && E ? E : void 0,
				children: [/* @__PURE__ */ (0, g.jsx)("div", {
					className: "btable-hero__hand-row",
					"data-hero-play-turn": Fe && o ? "true" : void 0,
					children: /* @__PURE__ */ (0, g.jsx)(ee, {
						cards: je,
						size: He,
						fan: !0,
						dealSeatPlayerId: E,
						stateFor: st,
						slotClassFor: Ie,
						peekIndex: ne,
						onCardPeek: ct ? re : void 0,
						cardTestId: Fe && o ? "play-button" : void 0,
						cardInteraction: {
							mode: lt,
							isMyTurn: o,
							legalPlayIndices: u,
							playingIndex: H,
							illegalShakeIndex: oe,
							illegalFlashIndex: ce,
							busy: q,
							showPlayableHint: !0,
							playableHintFor: (e) => ot(e) === "legal-playable",
							allowPlayPreselect: Fe && r && !o,
							trickPlayOriginPlayerId: E,
							onPlayCard: Xe,
							onSelectCard: Ke,
							onIllegalPlay: et,
							onPeek: re
						}
					})
				}), it()]
			}),
			Fe && !o && B !== null && /* @__PURE__ */ (0, g.jsx)("span", {
				className: "btable-sr-only",
				"data-testid": "play-preselect-hint",
				children: "Your selected card will play on your turn"
			}),
			Ue && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-hero__error",
				role: "alert",
				children: Ue
			}),
			/* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-hero__actions-slot",
				"aria-hidden": !dt,
				children: dt && /* @__PURE__ */ (0, g.jsxs)("div", {
					className: "btable-hero__actions btable-hero__actions--triple",
					children: [
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--action-draw",
							"data-testid": "draw-button",
							disabled: q,
							"aria-busy": q,
							onClick: () => Ze(rt),
							children: q ? "Drawing…" : `Draw${ut > 0 ? ` (${ut})` : ""}`
						}),
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--action-pat",
							"data-testid": "pass-draw-button",
							disabled: q,
							onClick: () => Qe(),
							children: "Stand pat"
						}),
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--action-out",
							"data-testid": "im-out-button",
							disabled: q,
							onClick: () => $e(),
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
function mf({ event: e, onDismiss: t }) {
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
function hf(e) {
	return (e?.length ?? 0) === 0;
}
//#endregion
//#region src/table/layout/seatPresetAnchors.ts
var gf = {
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
}, _f = {
	sixBotBottomLeft: gf[1],
	sixBotBottomRight: gf[6],
	sixBotTopCenter: gf[4]
}, vf = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: _f.sixBotBottomLeft,
	2: gf[3],
	3: gf[5],
	4: _f.sixBotBottomRight
}, yf = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: _f.sixBotBottomLeft,
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
	5: _f.sixBotBottomRight
}, bf = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: _f.sixBotBottomLeft,
	2: gf[2],
	3: gf[3],
	4: _f.sixBotTopCenter,
	5: gf[5],
	6: {
		x: 98,
		y: 46.5,
		region: "right"
	},
	7: _f.sixBotBottomRight
}, xf = {
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
}, Sf = {
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
}, Cf = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: xf[1],
	2: xf[2],
	3: xf[3],
	4: xf[4],
	5: xf[5],
	6: {
		x: 92,
		y: 46.5,
		region: "right"
	},
	7: xf[6]
}, wf = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: Sf[1],
	2: Sf[2],
	3: Sf[3],
	4: Sf[4],
	5: Sf[5],
	6: {
		x: 92,
		y: 46.5,
		region: "right"
	},
	7: Sf[6]
};
xf[1], xf[6], xf[4];
function Tf(e) {
	return e === "landscape" ? Sf : xf;
}
function Ef(e) {
	return e === "landscape" ? wf : Cf;
}
function Df(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function Of(e, t) {
	return Df(e, t) >= 5;
}
function kf(e, t, n) {
	if (n !== "play") return [];
	let r = [...new Set(t.filter(Boolean))];
	return r.length < 2 || 5 - Df(e, r) != 1 ? [] : r.filter((t) => (e[t] ?? 0) === 0);
}
function Af(e, t, n, r) {
	return kf(t, n, r).includes(e);
}
function jf(e, t) {
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
function Mf(e) {
	return `$${e.toLocaleString("en-US")}`;
}
function Nf(e) {
	let t = Math.round(Number(e) * 100) / 100;
	return !Number.isFinite(t) || t <= 0 ? "$0" : t < 1 ? `${Math.round(t * 100)}¢` : Math.round(t * 100) % 100 == 0 ? `$${Math.round(t).toLocaleString("en-US")}` : `$${t.toFixed(2)}`;
}
function Pf(e) {
	let t = Number(e) || 0;
	return t > 0 ? `+${Mf(t)}` : t < 0 ? `−${Mf(Math.abs(t))}` : Mf(0);
}
function Ff(e) {
	return Mf(Math.max(0, Number(e) || 0));
}
function If(e, t, n) {
	return e == null || n.anteAlreadyPosted || !n.inHand || !n.anteAnimActive ? e : Math.max(0, e - Math.max(0, t));
}
function Lf(e) {
	return (e || "?").trim().replace(/\s+bot$/i, "").replace(/^bot\s+/i, "").trim() || "?";
}
function Rf(e) {
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
function zf(e) {
	let t = Math.cos(e), n = Math.sin(e);
	return Math.abs(n) >= Math.abs(t) ? n > 0 ? "bottom" : "top" : t > 0 ? "right" : "left";
}
var Bf = bf, Vf = gf, Hf = vf, Uf = yf;
function Wf(e, t) {
	let { rx: n, ry: r, outset: i } = Rf(t), a = e / t * Math.PI * 2 + Math.PI / 2, o = Math.cos(a), s = Math.sin(a);
	return {
		x: 50 + n * o + o * i,
		y: 50 + r * s + s * i,
		region: zf(a)
	};
}
function Gf(e, t) {
	let n = Math.max(2, Math.min(8, t || 2));
	if (n <= 0) return {
		x: 50,
		y: 50,
		region: "bottom"
	};
	if (n === 5) {
		let t = Hf[e];
		if (t) return t;
	}
	if (n === 6) {
		let t = Uf[e];
		if (t) return t;
	}
	if (n === 7) {
		let t = Vf[e];
		if (t) return t;
	}
	if (n >= 8) {
		let t = Bf[e];
		if (t) return t;
	}
	return Wf(e, n);
}
function Kf(e) {
	let t = Math.max(2, Math.min(8, e || 2));
	return t === 2 ? 1.04 : t === 3 ? .94 : t === 4 ? .98 : t === 5 ? 1.08 : t === 6 ? 1.12 : t === 7 ? 1.16 : 1.2;
}
var qf = 1850, Jf = 2050, Yf = 1080, Xf = 5250 + $f({}).pipelineMs + 500;
function Zf(e) {
	return e !== "live";
}
function Qf(e = !1) {
	let t = e ? .55 : 1;
	return {
		cardLandMs: Math.round(560 * t),
		postTrickReadMs: Math.round(qf * t),
		winnerRevealMs: Math.round(400 * t),
		trickSweepMs: Math.round(Yf * t),
		nextLeadGapMs: Math.round(230 * t),
		trumpBeatReadMs: Math.round(Jf * t)
	};
}
function $f(e) {
	let t = Qf(e.reducedMotion), n = e.trumpBeat ? t.trumpBeatReadMs : t.postTrickReadMs, r = Math.min(t.winnerRevealMs, n - 200), i = Math.max(200, n - r), a = t.trickSweepMs, o = t.nextLeadGapMs;
	return {
		readBeforeWinnerMs: i,
		winnerRevealMs: r,
		readTotalMs: n,
		sweepMs: a,
		nextLeadGapMs: o,
		pipelineMs: n + a + o
	};
}
function ep(e, t, n) {
	let r = n.length > 0 ? n : [...new Set([...Object.keys(e), ...Object.keys(t)])];
	for (let n of r) if ((t[n] ?? 0) > (e[n] ?? 0)) return n;
	return null;
}
function tp(e, t, n) {
	return e.length > 0 ? e : [...new Set([...Object.keys(t), ...Object.keys(n)])];
}
function np(e) {
	return e?.plays?.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
}
function rp(e, t, n) {
	return e.length ? e.length === 1 ? e[0].playerId : !t || !n ? e[e.length - 1].playerId : Ec(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n) : null;
}
function ip(e) {
	let t = np(e.prevTrick), n = e.playedCards?.filter((t) => t.trickNumber === e.trickNumber).map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
	return n.length > t.length ? n : t;
}
function ap(e, t, n) {
	if (!e.length || !t || !n || t === n) return !1;
	let r = Ec(e.map((e) => ({
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
function op(e) {
	let { prevTricks: t, nextTricks: n, prevTrick: r, playedCards: i } = e, a = tp(e.participantIds, t, n), o = Df(t, a), s = Df(n, a);
	if (s <= o) return null;
	let c = ep(t, n, a), l = r?.trickNumber ?? s, u = ip({
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
function sp() {
	return typeof window > "u" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region src/table/TrickPlaySlot.tsx
function cp(e, t, n, r, i, a) {
	if (r.current = !1, e(!0), t("static"), n(null), i && Rd() && zd("TrickPlaySlot", "fly-complete", i), a?.onCardLandedRef.current && !a.audioFiredRef.current) {
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
function lp({ play: e, index: t, presentationPhase: n, displayCount: r, playerName: i, leaderPlayerId: a = null, winnerPlayerId: o = null, instantPlace: s = !1, currentUserId: c = null, onCardLanded: u }) {
	let d = (0, l.useRef)(null), [f, p] = (0, l.useState)("static"), [m, h] = (0, l.useState)(null), [v, y] = (0, l.useState)(!1), b = (0, l.useRef)(!1), x = (0, l.useRef)(!1), S = (0, l.useRef)(u), C = (0, l.useRef)(a), w = (0, l.useRef)(c), T = (0, l.useRef)(r), E = (0, l.useRef)(t), D = (0, l.useRef)(e);
	S.current = u, C.current = a, w.current = c, T.current = r, E.current = t, D.current = e;
	let O = Vs(e), k = a != null && e.playerId === a, A = o != null && e.playerId === o, j = n === "live", M = t === r - 1 && j, N = v, ee = k && (n === "live" || n === "trickComplete"), te = ee || A && n !== "live" && n !== "trickComplete";
	(0, l.useLayoutEffect)(() => {
		Rd() && zd("TrickPlaySlot", "play-enter", {
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
			cp(y, p, h, b, {
				playKey: O,
				index: t
			}, n);
			return;
		}
		if (!M) {
			cp(y, p, h, b, {
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
		let a = Xs(e.playerId, O);
		if (!a) {
			cp(y, p, h, b, {
				playKey: O,
				index: t
			}, n);
			return;
		}
		let o = sp() ? 217 : 395;
		b.current = !0, h($s(a, r.getBoundingClientRect(), i.getBoundingClientRect())), p("pending"), Rd() && zd("TrickPlaySlot", "fly-start", {
			playKey: O,
			index: t,
			travelMs: o
		});
		let c = window.setTimeout(() => p("travel"), 0), l = window.setTimeout(() => {
			cp(y, p, h, b, {
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
			card: Ms(e.card),
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
function up(e, t, n) {
	let r = e > 0 || t > 0;
	return {
		layoutCardCount: Math.max(e, t, r ? n : 0, 1),
		trickActive: r
	};
}
//#endregion
//#region src/table/TrickRow.tsx
function dp({ displayPlays: e = [], leaderPlayerId: t = null, winnerPlayerId: n = null, showWinnerTag: r = !1, presentationPhase: i = "live", playerNames: a = {}, variant: o = "live", instantTrickPlays: s = !1, peakCardCount: c = 0, participantCount: u = 0, currentUserId: d = null, onCardLanded: f }) {
	(0, l.useEffect)(() => {
		Rd() && zd("TrickRow", e.length === 0 ? "trick-empty" : "trick-cards", {
			count: e.length,
			phase: i
		});
	}, [e.length, i]);
	let { layoutCardCount: p, trickActive: m } = up(e.length, c, u);
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
				children: e.map((r, o) => /* @__PURE__ */ (0, g.jsx)(lp, {
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
function fp({ cards: e }) {
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
function pp({ potMetrics: e, participantCount: t, trumpUpcard: n, trumpSuit: r, phase: i, enrollmentActive: a = !1, remainingDeckCount: o, trickDisplayPlays: s = [], trickLeadSuit: c = null, trickLeaderPlayerId: u = null, trickWinnerPlayerId: f = null, trickShowWinnerTag: p = !1, trickPresentationPhase: m = "live", trickEchoPlays: h = [], trickEchoWinnerId: v = null, trickEchoPhase: y = "live", showFinalTrickEcho: b = !1, playerNames: x = {}, anteAnimActive: S = !1, trumpRevealActive: C = !1, drawAnimPlayerId: w = null, drawAnimSubPhase: T = "done", drawDiscardCount: E = 0, settleAnimActive: D = !1, settleCarryOver: O = !1, potTick: k = 0, trumpReminderPulse: A = 0, hideCenterTrump: j = !1, trumpMergeActive: M = !1, showTrumpSuitReminder: N = !1, instantTrickPlays: ee = !1, peakTrickPlayCount: te = 0, discardPileCards: P = [], currentUserId: F = null, onCardLanded: I }) {
	let L = Ns(i, a), R = u ?? ((m === "live" || m === "trickComplete") && s.length > 0 ? rp(s, c ?? s[0]?.card.suit ?? null, r ?? null) : null), z = m !== "live" && m !== "nextLeadReady", B = s.length, V = B > 0 || te > B || ee, [H, U] = (0, l.useState)(n ?? null);
	(0, l.useEffect)(() => {
		if (n) {
			U(n);
			return;
		}
		if (H && !M) {
			if (V || z) {
				let e = window.setTimeout(() => U(null), 760);
				return () => window.clearTimeout(e);
			}
			U(null);
		}
	}, [
		n,
		V,
		z,
		H,
		M
	]);
	let ne = !!H && !j, re = N || !ne && !!r && i === "play", W = ne ? `${H.rank}-${H.suit}` : "trump-slot", ie = b || D && h.length > 0 && B === 0;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: "table-center-cluster",
		"aria-label": "Table center",
		children: [/* @__PURE__ */ (0, g.jsxs)("div", {
			className: "deck-stack",
			"aria-label": "Deck and trump",
			children: [ne ? /* @__PURE__ */ (0, g.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"bpot__trump--deal",
					C ? "bpot__trump--reveal" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-button",
				"data-trump-deal-target": "",
				children: [/* @__PURE__ */ (0, g.jsx)(_, {
					card: {
						rank: H.rank,
						suit: H.suit
					},
					size: "sm",
					state: "trump"
				}), /* @__PURE__ */ (0, g.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, W) : re ? /* @__PURE__ */ (0, g.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"deck-stack__trump--suit-reminder",
					A > 0 ? "deck-stack__trump--suit-reminder-pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-suit-reminder",
				"aria-label": `Trump suit: ${Ps(r)}`,
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
				z ? "center-play--trick-resolving" : "",
				ie ? "center-play--final-trick-echo" : ""
			].filter(Boolean).join(" "),
			"data-trick-phase": m,
			"data-trick-cards": B,
			"data-hand-settling": D ? "true" : "false",
			children: [
				i === "draw" ? /* @__PURE__ */ (0, g.jsx)(fp, { cards: P }) : null,
				/* @__PURE__ */ (0, g.jsxs)("div", {
					className: ["center-play__phase", i === "play" ? "center-play__phase--play" : ""].filter(Boolean).join(" "),
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, g.jsx)("span", {
							className: "btable-sr-only",
							"data-testid": "phase-tag-center",
							"data-phase": i ?? "waiting",
							children: L
						}),
						ne && r && /* @__PURE__ */ (0, g.jsx)("span", {
							className: "center-play__trump-suit muted small",
							children: Ps(r)
						}),
						re && /* @__PURE__ */ (0, g.jsxs)("span", {
							className: "center-play__trump-suit center-play__trump-suit--reminder muted small",
							children: [Ps(r), " trump"]
						})
					]
				}),
				/* @__PURE__ */ (0, g.jsxs)("div", {
					className: "center-play__trick-stage",
					children: [/* @__PURE__ */ (0, g.jsx)("div", {
						className: "center-play__trick-live",
						children: /* @__PURE__ */ (0, g.jsx)(dp, {
							displayPlays: s,
							leaderPlayerId: R,
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
					}), ie && /* @__PURE__ */ (0, g.jsx)("div", {
						className: "center-play__trick-echo",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, g.jsx)(dp, {
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
							"data-ante-pot-target": "",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Table pot" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: Mf(e.currentPot) })]
						}, k > 0 ? `pot-${k}` : "pot-static"),
						/* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat",
							"data-testid": "ante-display",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Ante / hand" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: Nf(e.anteAmount) })]
						}),
						e.limEnabled && /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [/* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Cap" }), /* @__PURE__ */ (0, g.jsxs)("dd", { children: [Mf(e.potCap), /* @__PURE__ */ (0, g.jsx)("span", {
								className: "bpot__lim-tag",
								children: "LmT"
							})] })]
						}), /* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat bpot__stat--highlight",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Max win" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: Mf(e.maxWinThisHand) })]
						})] })
					]
				}),
				e.limEnabled && e.overflow > 0 && /* @__PURE__ */ (0, g.jsxs)("div", {
					className: "center-play__carry muted small",
					children: [
						"+",
						Mf(e.overflow),
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
function mp({ label: e, value: t, accent: n, title: r }) {
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
function hp({ player: e, compact: t = !1 }) {
	let n = e.apeScore != null && !e.isRobot;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: `bhud${t ? " bhud--compact" : ""}`,
		"aria-label": `${e.displayName} stats`,
		children: [n && /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
			/* @__PURE__ */ (0, g.jsx)(mp, {
				label: "Ape",
				value: e.apeScore ?? 0,
				accent: !0,
				title: "Ape Score"
			}),
			e.apeClass && /* @__PURE__ */ (0, g.jsx)(mp, {
				label: "Class",
				value: e.apeClass,
				title: "Ape Class"
			}),
			e.apeStatus && /* @__PURE__ */ (0, g.jsx)(mp, {
				label: "Status",
				value: e.apeStatus,
				title: "Ape Status"
			})
		] }), e.sessionStreak != null && e.sessionStreak > 0 && /* @__PURE__ */ (0, g.jsx)(mp, {
			label: "Streak",
			value: e.sessionStreak,
			title: "Hands won this session"
		})]
	});
}
//#endregion
//#region src/table/TurnCountdownRing.tsx
var gp = 22, _p = 2 * Math.PI * gp;
function vp({ progress: e, segment: t, reducedMotion: n = sp() }) {
	let r = _p * (1 - Math.max(0, Math.min(1, e)));
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
			r: gp,
			fill: "none"
		}), /* @__PURE__ */ (0, g.jsx)("circle", {
			className: `bseat__turn-countdown-progress bseat__turn-countdown-progress--${t}`,
			cx: "24",
			cy: "24",
			r: gp,
			fill: "none",
			strokeDasharray: _p,
			strokeDashoffset: r,
			transform: "rotate(-90 24 24)"
		})]
	});
}
//#endregion
//#region src/table/Seat.tsx
function yp({ player: e, region: t, handLane: n = "below", style: r, clockwiseDealing: i = !1, onToggleInHand: a, onPassEnrollment: o, onTrickDelta: s, onReaction: c }) {
	let [u, d] = (0, l.useState)(!1), f = (0, l.useCallback)(() => {
		d((e) => !e);
	}, []), p = e.tricksThisHand, m = Math.max(0, e.holeCardCount ?? 0), h = p > 0, v = !!(e.showHoleCards && !e.isSelf && e.inHand && m > 0), y = e.bankroll != null, b = e.bourreAlert === "pulse", x = e.bourreAlert === "marker" || e.bourreAlert === "pulse", S = !!e.bourrePressure, C = S && e.isSelf, w = e.revealedTrumpIndex != null && e.revealedTrumpUpcard, T = Lf(e.displayName);
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
										e.turnCountdown && /* @__PURE__ */ (0, g.jsx)(vp, {
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
							"aria-label": `Chips ${Ff(e.bankroll ?? 0)}`,
							title: `Chips ${Ff(e.bankroll ?? 0)}`,
							children: Ff(e.bankroll ?? 0)
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
						children: /* @__PURE__ */ (0, g.jsx)(hp, {
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
function bp(e, t) {
	let n = [...new Set(e.filter(Boolean))];
	if (!n.length) return [];
	let r = t.seatedIds?.filter((e) => n.includes(e));
	if (r?.length === n.length) return r;
	let i = t.handEnrollment?.orderedPlayerIds?.filter((e) => n.includes(e));
	if (i?.length === n.length) return i;
	let a = cc(t.dealerId, n), o = n.filter((e) => !a.includes(e));
	return o.length ? [...a, ...o] : a;
}
function xp(e, t, n) {
	let r = new Map(e.map((e) => [e.playerId, e])), i = bp(e.map((e) => e.playerId), t);
	if (!i.length) return e;
	let a = n ?? e.find((e) => e.isSelf)?.playerId ?? null, o = a ? i.indexOf(a) : 0;
	return (o > 0 ? [...i.slice(o), ...i.slice(0, o)] : i).map((e) => r.get(e)).filter((e) => e != null);
}
//#endregion
//#region src/table/layout/sevenPlayerMobileSeatMap.ts
function Sp(e) {
	let t = Tf(e);
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
function Cp(e) {
	return e === 7;
}
function wp(e, t) {
	return e < 0 || e > 6 ? null : Sp(t)[e] ?? null;
}
function Tp(e, t, n) {
	let r = wp(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: Up(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 7
		})
	} : null;
}
//#endregion
//#region src/table/layout/eightPlayerMobileSeatMap.ts
function Ep(e) {
	let t = Ef(e);
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
function Dp(e) {
	return e >= 8;
}
function Op(e, t) {
	return e < 0 || e > 7 ? null : Ep(t)[e] ?? null;
}
function kp(e, t, n) {
	let r = Op(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: Up(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 8
		})
	} : null;
}
//#endregion
//#region src/table/layout/fourPlayerMobileSeatMap.ts
function Ap(e) {
	return e === 5;
}
function jp(e) {
	let t = Tf(e);
	return {
		0: t[0],
		1: t[1],
		2: t[3],
		3: t[5],
		4: t[6]
	};
}
function Mp(e, t, n) {
	if (e < 0 || e > 4) return null;
	let r = jp(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: Up(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 5
		})
	} : null;
}
//#endregion
//#region src/table/layout/fivePlayerMobileSeatMap.ts
var Np = {
	min: 8,
	max: 92
};
function Pp(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Fp(e, t) {
	let n = t === "landscape" ? 54 : 56;
	return {
		...e,
		x: Pp(e.x, Np.min, Np.max),
		y: Pp(e.y, 8, n)
	};
}
function Ip(e) {
	return e === 6;
}
function Lp(e) {
	let t = Tf(e), n = [
		2,
		3,
		4
	].map((t) => Fp(Gf(t, 6), e));
	return {
		0: t[0],
		1: t[1],
		2: n[0],
		3: n[1],
		4: n[2],
		5: t[6]
	};
}
function Rp(e, t, n) {
	if (e < 0 || e > 5) return null;
	let r = Lp(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: Up(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 6
		})
	} : null;
}
//#endregion
//#region src/table/layout/seatLayout.ts
var zp = {
	min: 8,
	max: 92
}, Bp = 56, Vp = 54;
function Hp(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Up(e, t) {
	return t.isSelf || t.isMobile ? "below" : t.total >= 6 && e.region === "left" && e.x < 14 || t.total >= 6 && e.region === "right" && e.x > 86 ? "side" : "below";
}
function Wp(e, t) {
	let n = Hp(e.x, zp.min, zp.max), r = t === "portrait" ? Bp : Vp, i = Hp(e.y, 8, r);
	return {
		...e,
		x: n,
		y: i
	};
}
function Gp(e, t, n) {
	if (n.isMobile && n.orientation && Ap(t)) {
		let t = Mp(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && Ip(t)) {
		let t = Rp(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && Cp(t)) {
		let t = Tp(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && Dp(t)) {
		let t = kp(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	let r = Gf(e, t), i = n.isMobile && n.orientation ? Wp(r, n.orientation) : r;
	return {
		...i,
		seatIndex: e,
		handLane: Up(i, {
			isMobile: n.isMobile,
			isSelf: n.isSelf,
			total: t
		})
	};
}
function Kp(e, t, n) {
	return Gp(e + 1, t, {
		isMobile: !0,
		isSelf: !1,
		orientation: n
	});
}
function qp(e, t = "portrait") {
	if (Ap(e)) {
		let e = Mp(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (Ip(e)) {
		let e = Rp(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (Cp(e)) {
		let e = Tp(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (Dp(e)) {
		let e = kp(0, t, { isSelf: !0 });
		if (e) return e;
	}
	let n = Gf(0, Math.max(2, e));
	return {
		x: n.x,
		y: Math.min(n.y, 88),
		region: "bottom",
		seatIndex: 0,
		handLane: "below"
	};
}
function Jp({ handNumber: e, trickNumber: t, turnPlayerId: n }) {
	return `${e ?? 0}:${t ?? 0}:${n ?? ""}`;
}
function Yp(e, t) {
	return `ante:${e}:${t}`;
}
function Xp(e, t, n = Math.random) {
	let r = t - e + 1;
	return e + Math.floor(n() * r);
}
function Zp(e) {
	let t = 0;
	for (let n = 0; n < e.length; n += 1) t = Math.imul(31, t) + e.charCodeAt(n) >>> 0;
	return t === 0 && (t = 2654435769), () => (t = Math.imul(1664525, t) + 1013904223 >>> 0, t / 4294967295);
}
function Qp(e, t = Math.random) {
	let n = e === 1;
	return {
		chosenDelayMs: n ? Xp(100, 300, t) : Xp(250, 700, t),
		isLastCard: n,
		remainingHandCount: e ?? null
	};
}
function $p(e, t) {
	return `${e}:r${t ?? "?"}`;
}
function em(e = {}) {
	let t = e.rng ?? Math.random, n = null, r = null, i = 0, a = /* @__PURE__ */ new Map();
	function o(e) {
		n !== e && (n = e, r = null, i = 0, a.clear());
	}
	function s(e) {
		o(e.handNumber);
		let t = Jp(e);
		return r !== t && (r = t, i = e.nowMs), t;
	}
	function c(e, n) {
		let r = $p(e, n), i = a.get(r), o = null;
		return i ?? (o = Qp(n, t), i = o.chosenDelayMs, a.set(r, i)), o ||= {
			chosenDelayMs: i,
			isLastCard: n === 1,
			remainingHandCount: n ?? null
		}, o;
	}
	function l(e) {
		o(e.handNumber);
		let t = s({
			handNumber: e.handNumber,
			trickNumber: e.trickNumber,
			turnPlayerId: e.turnPlayerId,
			nowMs: e.nowMs
		}), n = c(t, e.remainingHandCount), r = n.chosenDelayMs, a = e.nowMs - i;
		return {
			turnKey: t,
			chosenDelayMs: r,
			elapsedSinceTurnMs: a,
			trickGapRemainingMs: 0,
			delayMs: Math.max(0, r - a),
			remainingHandCount: n.remainingHandCount,
			isLastCard: n.isLastCard
		};
	}
	function u(e, n) {
		o(e);
		let r = $p(Yp(e, n), 5), i = a.get(r);
		return i ?? (i = Qp(5, t).chosenDelayMs, a.set(r, i)), i;
	}
	return {
		syncHand: o,
		markTurnEligible: s,
		resolvePlayDelayMs: l,
		resolveAntePostDelayMs: u,
		delayByTurnKey: a
	};
}
var tm = /* @__PURE__ */ new Map();
function nm(e, t, n) {
	return `${e}:${t.join(",")}:${n ? "rm" : "full"}`;
}
function rm(e) {
	let t = e.reducedMotion ?? !1, n = nm(e.handNumber, e.playerIds, t), r = tm.get(n);
	if (r) return r;
	let i = t ? .35 : 1, a = e.travelMs ?? Math.round(220 * i), o = e.settleMs ?? Math.round(80 * i), s = em({ rng: e.rng ?? Zp(n) }), c = e.playerIds.map((t) => {
		let n = s.resolveAntePostDelayMs(e.handNumber, t);
		return Math.round(n * i);
	}), l = c.reduce((e, t) => e + t, 0), u = l + e.playerIds.length * a + (e.playerIds.length > 0 ? o : 0), d = {
		handNumber: e.handNumber,
		playerIds: [...e.playerIds],
		thinkBeforeMs: c,
		totalThinkMs: l,
		travelMs: a,
		settleMs: o,
		totalDurationMs: u
	};
	return tm.set(n, d), d;
}
function im(e, t = !1, n = 220) {
	let r = Math.max(1, e), i = t ? .35 : 1, a = Math.round(n * i), o = Math.round(80 * i);
	return r * Math.round(700 * i) + r * a + o;
}
function am(e, t, n = !1, r = 220) {
	return t.length < 1 ? im(1, n, r) : rm({
		handNumber: e,
		playerIds: t,
		reducedMotion: n,
		travelMs: r
	}).totalDurationMs;
}
function om(e, t, n = !1) {
	return t.length < 1 ? im(1, n, 220) : am(e, t, n, 220);
}
var sm = 5e3, cm = 1e3, lm = 12e3, um = 4e3, dm = Xf;
function fm(e = sp()) {
	let t = e ? .55 : 1, n = (e) => Math.max(80, Math.round(e * t));
	return {
		anteChipTravelMs: n(220),
		dealCardStaggerMs: n(130),
		dealFanMs: n(600),
		trumpRevealHoldMs: n(sm),
		trumpMergeAnimMs: n(480),
		enrollmentSeatPulseMs: n(480),
		drawDiscardMs: n(400),
		drawReplaceMs: n(700),
		drawReadyBeatMs: n(500),
		settleHoldMs: n(cm),
		nextHandResetMs: n(550),
		handResetMs: n(500)
	};
}
function pm(e, t, n = sp()) {
	let r = fm(n), i = Math.max(0, e), a = Math.max(0, t);
	return i === 0 && a === 0 ? Math.max(120, Math.round(r.drawDiscardMs * .6)) : i * r.drawDiscardMs + a * r.drawReplaceMs + 80;
}
function mm(e, t, n) {
	let r = Number.isFinite(e) && e > 0 ? e : 0, i = r > 0 ? Math.max(t, r) : t;
	return {
		height: Math.max(i > 0 ? i : n, n),
		peak: i
	};
}
function hm(e, t, n, r) {
	let i = mm(e, t, n), a = Math.max(152, n);
	return {
		height: i.peak > 0 ? Math.min(i.height, r) : Math.min(a, r),
		peak: i.peak
	};
}
function gm(e, t, n = 72) {
	return mm(e, t, n);
}
function _m(e, t) {
	let n = Math.max(.75, e);
	return t.portrait ? Math.min(n, .98) : Math.min(n, 1.32);
}
function vm(e) {
	let t = Math.max(2, Math.min(8, e || 4));
	return t <= 3 ? .7 : t <= 4 ? .68 : t <= 5 ? .62 : .56;
}
function ym(e) {
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
function bm(e) {
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
function xm(e) {
	return {
		left: e.left,
		top: e.top,
		right: e.right,
		bottom: e.bottom,
		width: e.width,
		height: e.height
	};
}
function Sm(e, t, n = 2) {
	return e.left >= t.left - n && e.top >= t.top - n && e.right <= t.right + n && e.bottom <= t.bottom + n;
}
//#endregion
//#region src/table/useMobileTable.ts
var Cm = "(max-width: 900px), ((hover: none) and (pointer: coarse))";
function wm() {
	let [e, t] = (0, l.useState)(() => typeof window < "u" && window.matchMedia("(max-width: 900px), ((hover: none) and (pointer: coarse))").matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Cm), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/table/hooks/useStageFit.ts
function Tm(e, t) {
	if (typeof window > "u") return t;
	let n = document.documentElement, r = getComputedStyle(n).getPropertyValue(e).trim(), i = parseFloat(r);
	return Number.isFinite(i) ? i : t;
}
function Em(e, t) {
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
function Dm(e) {
	let t = e.closest(".btable-session")?.querySelector(".btable-desktop");
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return n.width <= 0 || n.height <= 0 ? null : {
		width: n.width,
		height: n.height
	};
}
function Om(e, t) {
	let n = !!e.closest(".table-play-overlay");
	if (t && n) {
		let t = e.closest(".table-play-overlay__main");
		if (t) return t;
	}
	return e.closest(".btable-desktop__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function km({ aspect: e, enabled: t = !0, sessionKey: n }) {
	let r = (0, l.useRef)(null), i = (0, l.useRef)(0), a = (0, l.useRef)(0), o = (0, l.useRef)(n), { settings: s } = _d(), c = wm();
	return (0, l.useLayoutEffect)(() => {
		if (!t || typeof window > "u") return;
		let l = r.current;
		if (!l) return;
		o.current !== n && (o.current = n, i.current = 0, a.current = 0);
		let u = l.closest(".btable-desktop__viewport") ?? l.closest(".table-play-overlay__main") ?? l.closest(".btable-session"), d = window.visualViewport, f = () => {
			if (lf()) return;
			let t = !!l.closest(".table-play-overlay"), n = typeof window < "u" && window.matchMedia("(orientation: portrait)").matches, r = Om(l, c).getBoundingClientRect(), o = l.querySelector(".hand-panel")?.getBoundingClientRect(), u = t && c && n ? 100 : t && !c ? 120 : c ? 112 : 148, f = t && c && n || t && !c ? 200 : c ? 210 : 280, p = o?.height ?? 0, m = hm(p, i.current, u, f);
			i.current = m.peak;
			let h = m.height, g = c && t ? 12 : c ? 18 : t && !c ? 16 : 28, _ = Tm("--stage-fit-pad-x", c ? 8 : 16) + g, v = Tm("--stage-fit-pad-y", c ? 6 : 12) + g, y = Tm("--stage-fit-gap", c ? 8 : 12), b = d, x = Math.min(r.width, b?.width ?? window.innerWidth), S = Math.min(r.height, b?.height ?? window.innerHeight);
			if (t && c) {
				let e = Dm(l);
				if (e) x = e.width, S = e.height;
				else {
					let e = gm(Em(l, c), a.current, 72);
					a.current = e.peak, S = Math.max(160, S - e.height);
				}
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = t && c ? 1 : C, T = c ? _m(e, { portrait: n }) : e, E = parseInt(getComputedStyle(l).getPropertyValue("--player-count").trim(), 10) || 4, D = t && c && !n, O = D ? {
				...ym({
					availWidth: x,
					availHeight: S,
					aspect: T,
					userScale: w,
					padX: _,
					padY: v,
					stageShare: vm(E)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : bm({
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
				let e = l.querySelector(".table-stage"), a = l.querySelectorAll(".bseat__avatar-wrap"), o = e ? xm(e.getBoundingClientRect()) : null, s = xm(document.documentElement.getBoundingClientRect()), u = [...a].filter((e) => !Sm(xm(e.getBoundingClientRect()), s, 1)).length;
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
			lf() || (p ??= window.requestAnimationFrame(() => {
				p = null, f();
			}));
		}, h = new ResizeObserver(m), g = Om(l, c);
		g instanceof HTMLElement && h.observe(g), u instanceof HTMLElement && u !== g && h.observe(u);
		let _ = l.closest(".table-play-overlay__main");
		_ instanceof HTMLElement && _ !== g && h.observe(_), m();
		let v = uf(() => {
			lf() || m();
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
function Am({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r, pileIndexRef: i, onDiscardCommitted: a }) {
	let o = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		let s = e.animatingDrawPlayerId, c = e.drawAnimSubPhase, l = e.drawDiscardCount;
		if (c !== "discard" || !s || l <= 0) {
			c !== "discard" && (o.current = null);
			return;
		}
		if (s === n) return;
		let u = `${t}:${s}:${l}`;
		o.current !== u && (o.current = u, Ts({
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
function jm({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r }) {
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
		i.current !== l && (i.current = l, Ss({
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
function Mm(e = document) {
	rs(), ys();
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = e instanceof Document ? t.body : e;
	for (let e of n.querySelectorAll(".discard-fly-ghost, .draw-receive-fly-ghost")) e.remove();
}
//#endregion
//#region src/table/hooks/useTableDrawMotionCleanup.ts
function Nm({ handNumber: e, sessionPhase: t, turnPlayerId: n, drawCompletedIds: r, currentUserId: i, handPresentation: a, tableRootRef: o }) {
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
		s.current !== l && (s.current = l, Mm(c));
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
		e && (Mm(e), s.current = null);
	}, [e, o]);
}
var Pm = /* @__PURE__ */ new Set();
function Fm(e, t = 5) {
	let n = [];
	for (let r = 0; r < t; r += 1) for (let t of e) n.push({
		playerId: t,
		roundIndex: r,
		stepIndex: n.length
	});
	return n;
}
function Im(e, t = z()) {
	if (e <= 0) return 0;
	let n = t ? .35 : 1, r = Math.round(780 * n), i = Math.round(540 * n);
	return (e - 1) * r + i + Math.round(130 * n);
}
function Lm(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		let e = i.querySelector("[data-trump-deal-target]");
		if (e) return $i(e);
	}
	let a = i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`) ?? i.querySelector(`[data-deal-seat="${e}"] [data-deal-round="${t}"]`), o = a?.querySelector(".pcard") ?? a;
	return o ? $i(o) : null;
}
function Rm(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * .24)
	};
}
function zm(e) {
	let t = document.createElement("div");
	return t.className = "deal-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function Bm(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		i.querySelector("[data-trump-deal-target]")?.classList.add("deal-card--revealed"), i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`)?.classList.add("deal-card--revealed");
		return;
	}
	i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`)?.classList.add("deal-card--revealed");
}
function Vm(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".deal-card--revealed")) e.classList.remove("deal-card--revealed");
	for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
}
function Hm() {
	for (let e of Pm) e.kill();
	Pm.clear();
}
function Um({ steps: e, root: t, trumpHolderId: n = null, onStepComplete: r, onComplete: i }) {
	Ko(t), Hm();
	let a = z(), o = R(540 / 1e3, a), s = R(130 / 1e3, a), c = a ? .04 : 110 / 1e3, l = us(t), u = J.timeline({
		onComplete: () => {
			Pm.delete(u), i?.();
		},
		onInterrupt: () => {
			Pm.delete(u);
			for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
		}
	});
	if (Pm.add(u), !l || e.length === 0) {
		for (let r of e) Bm(r.playerId, r.roundIndex, t, n);
		return u.call(() => i?.()), u;
	}
	e.forEach((e, i) => {
		let d = i * (o + s + c), f = Lm(e.playerId, e.roundIndex, t, n);
		u.call(() => {
			if (!f) {
				Bm(e.playerId, e.roundIndex, t, n), r?.(e);
				return;
			}
			let i = zm(l);
			t.appendChild(i);
			let c = $i(i), { x: u, y: d } = na(c, l), p = f.left + f.width / 2, m = f.top + f.height / 2, h = c.left + c.width / 2, g = c.top + c.height / 2, _ = p - h, v = m - g, { midX: y, midY: b } = Rm(_, v);
			J.set(i, {
				transformOrigin: "50% 80%",
				willChange: "transform,opacity",
				x: u,
				y: d,
				rotation: -12,
				rotationY: a ? 0 : -68,
				scale: a ? 1 : .62,
				opacity: +!!a
			});
			let x = J.timeline({ onComplete: () => {
				i.remove(), Bm(e.playerId, e.roundIndex, t, n), r?.(e);
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
			}) : x.add(qo(i, {
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
				curviness: 1.2,
				rotation: 0,
				rotationY: 0,
				scale: 1,
				opacity: 1,
				duration: o,
				ease: te
			})), x.to(i, {
				scale: 1.02,
				duration: s * .45,
				yoyo: !0,
				repeat: 1,
				ease: F
			}, o);
		}, void 0, d);
	});
	let d = Im(e.length, a) + 120, f = window.setTimeout(() => {
		u.progress() < 1 && u.progress(1);
	}, d);
	return u.eventCallback("onComplete", () => window.clearTimeout(f)), u.eventCallback("onInterrupt", () => window.clearTimeout(f)), u;
}
//#endregion
//#region src/table/hooks/useTableDealPresentation.ts
function Wm({ session: e, heroCards: t, privateHandReady: n = !1, tableRootRef: r }) {
	let [i, a] = (0, l.useState)(!1), o = (0, l.useRef)(null), s = (0, l.useRef)(e.handNumber);
	return (0, l.useLayoutEffect)(() => {
		let t = r.current;
		t && s.current !== e.handNumber && (s.current = e.handNumber, o.current = null, Hm(), Vm(t), wd(!1), a(!1));
	}, [e.handNumber, r]), (0, l.useLayoutEffect)(() => {
		let i = r.current;
		if (!i) return;
		let s = e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play", c = t.length;
		if (!s || !n || c < 5) return;
		let l = `${e.handNumber}:${c}:${e.participantIds.join(",")}`;
		if (o.current === l) return;
		let u = bp(e.participantIds, e), d = lc(e.dealerId, e.participantIds, u.length ? u : e.participantIds);
		if (d.length < 2) return;
		let f = Fm(d, 5);
		if (!f.length) return;
		o.current = l, Hm(), Vm(i), i.classList.add("btable-wrap--clockwise-dealing"), a(!0), wd(!0);
		let p = sp(), m = window.requestAnimationFrame(() => {
			Um({
				steps: f,
				root: i,
				trumpHolderId: e.trumpHolderId ?? e.dealerId ?? null,
				onComplete: () => {
					i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), wd(!1);
				}
			});
		}), h = window.setTimeout(() => {
			i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), wd(!1);
		}, Im(f.length, p) + 400);
		return () => {
			window.cancelAnimationFrame(m), window.clearTimeout(h), Hm(), i.classList.remove("btable-wrap--clockwise-dealing"), wd(!1), a(!1);
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
//#region src/table/antePresentationSchedule.ts
function Gm(e, t) {
	let n = R(e.travelMs / 1e3, t), r = R(e.settleMs / 1e3, t), i = [], a = 0;
	for (let t = 0; t < e.playerIds.length; t += 1) {
		let o = (e.thinkBeforeMs[t] ?? 0) / 1e3;
		a += o;
		let s = a;
		i.push({
			playerId: e.playerIds[t],
			seatIndex: t,
			thinkStartSec: s - o,
			thinkDurationSec: o,
			coinSpawnSec: s,
			travelSec: n,
			settleSec: r,
			segmentEndSec: s + n + r
		}), a += n + r;
	}
	return i;
}
function Km(e, t) {
	for (let n of t) {
		if (n.thinkDurationSec <= 0) continue;
		let t = n.thinkStartSec + n.thinkDurationSec;
		if (e >= n.thinkStartSec && e < t) return n;
	}
	return null;
}
//#endregion
//#region src/table/animations/anteCoinPresentationMotion.ts
var qm = /* @__PURE__ */ new Set();
function Jm(e = sp()) {
	return Math.round(220 * (e ? .35 : 1));
}
function Ym(e, t) {
	return {
		midX: e * .5,
		midY: t * .5 - Math.min(48, Math.abs(e) * .12)
	};
}
function Xm(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = t.querySelector("[data-ante-pot-target]") ?? t.querySelector(".bpot__stat--pot");
	return n ? $i(n) : null;
}
function Zm(e, t) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document, r = n.querySelector(`[data-seat-motion-anchor="${e}"]`) ?? n.querySelector(`[data-seat-play-origin="${e}"]`);
	return r ? $i(r) : Ws(e);
}
function Qm(e, t, n) {
	return (!e || !t) && n < 1;
}
function $m(e, t, n) {
	try {
		au();
	} catch {}
	n?.(e, t);
}
function eh(e, t, n, r, i, a, o, s, c) {
	let l = nh();
	(n instanceof Document ? n.body : document.body).appendChild(l);
	let u = $i(l), d = r.left + r.width / 2, f = r.top + r.height / 2, p = i.left + i.width / 2, m = i.top + i.height / 2, h = na(u, {
		left: d - u.width / 2,
		top: f - u.height / 2,
		width: u.width,
		height: u.height
	}), g = p - d, _ = m - f, { midX: v, midY: y } = Ym(g, _);
	J.set(l, {
		x: h.x,
		y: h.y,
		scale: a ? 1 : .72,
		opacity: a ? 1 : .85
	});
	let b = J.timeline({ onComplete: () => {
		l.remove(), c?.(e, t);
	} });
	a ? b.to(l, {
		x: h.x + g,
		y: h.y + _,
		scale: 1,
		opacity: 1,
		duration: o,
		ease: te,
		onComplete: () => {
			try {
				au();
			} catch {}
		}
	}) : (b.add(qo(l, {
		path: [
			{
				x: h.x,
				y: h.y
			},
			{
				x: h.x + v,
				y: h.y + y
			},
			{
				x: h.x + g,
				y: h.y + _
			}
		],
		curviness: 1.15,
		scale: 1,
		opacity: 1,
		duration: o,
		ease: te,
		onComplete: () => {
			try {
				au();
			} catch {}
		}
	})), b.to(l, {
		scale: 1.08,
		duration: s,
		yoyo: !0,
		repeat: 1,
		ease: F
	}, o));
}
function th(e, t, n, r, i, a, o, s = 0) {
	let c = Zm(e, n), l = Xm(n);
	if (Qm(c, l, s)) {
		requestAnimationFrame(() => th(e, t, n, r, i, a, o, s + 1));
		return;
	}
	if (!c || !l) {
		$m(e, t, o);
		return;
	}
	eh(e, t, n, c, l, r, i, a, o);
}
function nh() {
	let e = document.createElement("span");
	return e.className = "bpot__ante-chip bpot__ante-chip--fly", e.setAttribute("aria-hidden", "true"), e.style.position = "fixed", e.style.width = "14px", e.style.height = "14px", e.style.borderRadius = "50%", e.style.pointerEvents = "none", e.style.zIndex = "4", e.style.background = "var(--gold-300, #f4d58d)", e.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.35)", e;
}
function rh() {
	for (let e of qm) e.kill();
	if (qm.clear(), kd(), typeof document < "u") for (let e of document.querySelectorAll(".bpot__ante-chip--fly")) e.remove();
}
function ih({ handNumber: e, playerIds: t, root: n, delayPlan: r, presentationKey: i, onCoinLand: a, onComplete: o }) {
	Ko(n), rh();
	let s = sp(), c = Jm(s), l = Gm(r ?? rm({
		handNumber: e,
		playerIds: t,
		reducedMotion: s,
		travelMs: c,
		settleMs: Math.round(80 * (s ? .35 : 1))
	}), s), u = J.timeline({
		onComplete: () => {
			qm.delete(u), kd(), o?.();
		},
		onInterrupt: () => {
			qm.delete(u), kd();
			for (let e of n.querySelectorAll?.(".bpot__ante-chip--fly") ?? []) e.remove();
		}
	});
	if (qm.add(u), i && Dd(i, () => u.time()), !t.length) return u.call(() => o?.()), u;
	for (let e of l) u.call(() => {
		th(e.playerId, e.seatIndex, n, s, e.travelSec, e.settleSec, a);
	}, void 0, e.coinSpawnSec);
	return u;
}
//#endregion
//#region src/table/hooks/useTableAntePresentation.ts
function ah({ anteAnimActive: e, session: t, tableRootRef: n }) {
	let r = (0, l.useRef)(null), i = (0, l.useRef)(t.handNumber), a = (0, l.useRef)(e);
	a.current = e, (0, l.useLayoutEffect)(() => {
		let e = n.current;
		e && i.current !== t.handNumber && (i.current = t.handNumber, r.current = null, rh(), Ed(!1), e.classList.remove("btable-wrap--ante-coins"));
	}, [t.handNumber, n]), (0, l.useLayoutEffect)(() => {
		let i = n.current;
		if (!i || !e) return;
		let o = `${t.sessionId}:${t.handNumber}:ante`;
		if (r.current === o) return;
		let s = bp(t.participantIds, t), c = lc(t.dealerId, t.participantIds, s.length ? s : t.participantIds);
		if (c.length < 1) return;
		let l = sp(), u = rm({
			handNumber: t.handNumber,
			playerIds: c,
			reducedMotion: l
		});
		if (Rd()) {
			for (let e = 0; e < c.length; e += 1) zd("antePresentation", "bot-timing-seat", {
				handNumber: t.handNumber,
				playerId: c[e],
				actionType: "ante",
				thinkBeforeMs: u.thinkBeforeMs[e],
				delayRange: "250-700"
			});
			zd("antePresentation", "bot-timing-plan", {
				handNumber: t.handNumber,
				seatCount: c.length,
				totalThinkMs: u.totalThinkMs,
				totalDurationMs: u.totalDurationMs,
				actionType: "ante"
			});
		}
		r.current = o, rh(), i.classList.add("btable-wrap--ante-coins"), Ed(!0);
		let d = om(t.handNumber, c, l) + 200, f = window.requestAnimationFrame(() => {
			ih({
				handNumber: t.handNumber,
				playerIds: c,
				delayPlan: u,
				presentationKey: o,
				root: i,
				onComplete: () => {
					i.classList.remove("btable-wrap--ante-coins"), Ed(!1);
				}
			});
		}), p = window.setTimeout(() => {
			rh(), i.classList.remove("btable-wrap--ante-coins"), Ed(!1);
		}, d);
		return () => {
			a.current && r.current === o || (window.cancelAnimationFrame(f), window.clearTimeout(p), rh(), i.classList.remove("btable-wrap--ante-coins"), Ed(!1));
		};
	}, [
		e,
		t.sessionId,
		t.handNumber,
		n
	]);
}
//#endregion
//#region src/table/animations/trumpMergePresentation.ts
var oh = null;
function sh() {
	oh?.kill(), oh = null;
}
function ch(e, t = {}) {
	Ko(e), sh();
	let n = e.querySelector("[data-trump-deal-target] .pcard"), r = e.querySelector(".hand__slot--trump-merge-target .pcard");
	if (!n || !r) return t.onComplete?.(), null;
	let i = $i(n), { x: a, y: o } = ta(i, $i(r)), s = n.cloneNode(!0);
	s.className = `${s.className} trump-merge-fly-ghost`.trim(), s.setAttribute("aria-hidden", "true"), s.style.position = "fixed", s.style.left = `${i.left}px`, s.style.top = `${i.top}px`, s.style.width = `${i.width}px`, s.style.height = `${i.height}px`, s.style.margin = "0", s.style.pointerEvents = "none", s.style.zIndex = "6", s.style.transformOrigin = "50% 80%", document.body.appendChild(s);
	let c = n.closest("[data-trump-deal-target]");
	J.set(n, { opacity: 0 }), c && J.set(c, { opacity: 0 }), J.set(r, { opacity: 0 });
	let { x: l, y: u } = na($i(s), i);
	J.set(s, {
		x: l,
		y: u,
		force3D: !0
	});
	let d = R(I.trumpMerge), f = a * .45, p = o * .45 - Math.max(24, Math.hypot(a, o) * .18), m = J.timeline({
		onComplete: () => {
			s.remove(), J.set(r, { clearProps: "opacity" }), c && J.set(c, { clearProps: "opacity" }), J.set(n, { clearProps: "opacity" }), oh = null, t.onComplete?.();
		},
		onInterrupt: () => {
			s.remove(), J.set(r, { clearProps: "opacity" }), c && J.set(c, { clearProps: "opacity" }), J.set(n, { clearProps: "opacity" }), oh = null;
		}
	});
	return m.add(qo(s, {
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
		curviness: 1.2,
		rotation: 6,
		scale: 1.02,
		duration: d,
		ease: "power2.inOut"
	})), oh = m, m;
}
//#endregion
//#region src/table/hooks/useTrumpMergePresentation.ts
function lh({ tableRootRef: e, trumpMergeActive: t, isTrumpHolder: n, onComplete: r }) {
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
		if (!n || sp()) {
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
			ch(t, { onComplete: () => {
				s || o();
			} }) || o();
		}, l = window.requestAnimationFrame(() => {
			window.requestAnimationFrame(c);
		});
		return () => {
			s = !0, window.cancelAnimationFrame(l), sh();
		};
	}, [
		t,
		n,
		e
	]);
}
//#endregion
//#region src/table/wonTrickPileModel.ts
function uh(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function dh(e, t) {
	return (e >>> t & 65535) / 65535;
}
function fh(e, t) {
	let n = uh(`${e}@book${t}`), r = dh(n, 0), i = dh(n, 9), a = dh(n, 17), o = r >= .5 ? 1 : -1, s = i >= .5 ? 1 : -1;
	return {
		offsetX: o * (1.5 + r * 2.5) + t * 2.2,
		offsetY: t * -1.8 + i * 1.2,
		rotation: s * (4 + a * 5) + t * 2.5,
		scale: .88 - t * .02,
		zIndex: t + 1
	};
}
function ph(e) {
	return `${e.playerId}:h${e.handNumber}:t${e.trickNumber}`;
}
//#endregion
//#region src/table/animations/wonTrickPileMotion.ts
var mh = /* @__PURE__ */ new Set(), hh = /* @__PURE__ */ new Set(), gh = I.drawDiscard;
function _h(e, t) {
	return {
		midX: e * .5,
		midY: t * .5
	};
}
function vh(e, t = document) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document, r = n.querySelector(`[data-won-trick-pile-anchor="${e}"]`) ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`);
	return r ? $i(r) : null;
}
function yh() {
	for (let e of hh) J.set(e, { clearProps: "opacity,transform,willChange,zIndex" });
	hh.clear();
}
function bh(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) e.remove();
}
function xh(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".bseat--pile-reveal-ready")) e.classList.remove("bseat--pile-reveal-ready");
}
function Sh(e = document) {
	for (let e of mh) e.kill();
	mh.clear(), bh(e), yh(), xh(e);
}
function Ch() {
	for (let e of mh) e.kill();
	mh.clear(), yh();
}
function wh(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function Th(e, t) {
	let n = $i(e), r = document.createElement("div");
	r.className = "won-trick-fly-ghost", r.setAttribute("aria-hidden", "true"), r.style.position = "fixed", r.style.left = `${n.left}px`, r.style.top = `${n.top}px`, r.style.width = `${n.width}px`, r.style.height = `${n.height}px`, r.style.pointerEvents = "none", r.style.zIndex = "4", r.style.transformOrigin = "50% 50%";
	let i = e.cloneNode(!0);
	return i.style.width = "100%", i.style.height = "100%", r.appendChild(i), t.appendChild(r), r;
}
function Eh(e, t) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document;
	(n.querySelector(`[data-won-trick-pile-anchor="${e}"]`)?.closest(".bseat") ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`)?.closest(".bseat"))?.classList.add("bseat--pile-reveal-ready");
}
function Dh(e, t) {
	Ko(t.root ?? document);
	let n = z(), r = t.root ?? document, i = t.host ?? (r instanceof HTMLElement ? r : document.body), a = vh(t.winnerPlayerId, r), o = n ? .06 : 140 / 1e3, s = R(gh, n), c = n ? .03 : .05, l = [], u = (e) => {
		mh.delete(d);
		for (let e of l) e.remove();
		yh(), e && Eh(t.winnerPlayerId, r), t.onComplete?.();
	}, d = J.timeline({
		onComplete: () => u(!0),
		onInterrupt: () => u(!1)
	});
	mh.add(d), e.forEach((e, r) => {
		let u = fh(t.trickKey, t.bookIndex), f = Th(e, i);
		l.push(f), hh.add(e), J.set(e, { opacity: 0 });
		let p = $i(f);
		J.set(f, {
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
		let h = a.left + a.width / 2 + u.offsetX, g = a.top + a.height / 2 + u.offsetY, _ = p.left + p.width / 2, v = p.top + p.height / 2, y = h - _, b = g - v, { midX: x, midY: S } = _h(y, b);
		d.to(f, {
			scale: .98,
			duration: o,
			ease: te
		}, m), d.add(qo(f, {
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
			curviness: 1.15,
			rotation: u.rotation,
			scale: u.scale,
			opacity: .95,
			duration: s,
			ease: te,
			onComplete: () => f.remove()
		}), m + o);
	});
	let f = Math.round((e.length > 0 ? (e.length - 1) * c : 0) * 1e3 + (o + s) * 1e3 + 60);
	return wh(d, Math.min(760, Math.max(300, f))), d;
}
function Oh() {
	return mh.size > 0;
}
function kh(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = [...t.querySelectorAll("[data-trick-variant=\"live\"] .btrick__play .pcard, [data-testid=\"trick-row\"] .btrick__play .pcard")].filter((e) => e.closest("[data-trick-variant=\"echo\"]") == null);
	return n.length > 0 ? n : [...t.querySelectorAll("[data-trick-variant=\"echo\"] .btrick__play .pcard")];
}
//#endregion
//#region src/table/hooks/useWonTrickCollection.ts
var Ah = new Set(["nextLeadReady", "live"]);
function jh({ trickPresentation: e, handNumber: t, sessionPhase: n = null, handComplete: r = !1, tableRootRef: i, onTrickCollectionStart: a }) {
	let o = (0, l.useRef)(null), s = (0, l.useRef)(t), c = (0, l.useRef)(e.phase), u = (0, l.useRef)(null), d = () => {
		u.current != null && (window.clearTimeout(u.current), u.current = null);
	}, f = (e) => {
		d();
		let t = Oh() ? 820 : 0;
		u.current = window.setTimeout(() => {
			u.current = null, Mh(e);
		}, t);
	};
	(0, l.useLayoutEffect)(() => {
		let e = i.current;
		if (e) {
			if (s.current !== t) {
				s.current = t, o.current = null, d(), Sh(e);
				return;
			}
			(r || n != null && n !== "play") && (o.current = null, d(), Sh(e));
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
		if (!s || (n === "collectTrick" && Ah.has(r) && (o.current = null, f(s)), r !== "collectTrick")) return;
		let l = e.trickWinnerSeatId, u = e.frozenTrick;
		if (!l || !u) return;
		let p = `${u.trickNumber}:${l}:${u.plays.length}`;
		if (o.current === p) return;
		o.current = p, d(), Ch(), Nh(s);
		let m = kh(s);
		if (!m.length) return;
		let h = Math.max(0, (e.displayTricksByPlayer[l] ?? 1) - 1), g = ph({
			playerId: l,
			handNumber: t,
			trickNumber: u.trickNumber
		});
		jd(!0);
		let _ = window.setTimeout(() => {
			a?.({
				trickId: u.trickNumber,
				winningSeat: l
			}), Dh(m, {
				winnerPlayerId: l,
				trickKey: g,
				bookIndex: h,
				root: s,
				host: s,
				onComplete: () => jd(!1)
			});
		}, 240);
		return () => {
			window.clearTimeout(_), jd(!1);
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
			d(), e ? Sh(e) : Ch();
		};
	}, [i]);
}
function Mh(e) {
	for (let t of e.querySelectorAll(".bseat--pile-reveal-ready")) t.classList.remove("bseat--pile-reveal-ready");
}
function Nh(e) {
	for (let t of e.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) t.remove();
}
//#endregion
//#region src/table/hooks/useCardAudio.ts
function Ph({ trickPresentation: e, currentUserId: t = null, participantCount: n, trickNumber: r, sessionPhase: i = null }) {
	let a = (0, l.useRef)(e.phase), o = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		i !== "play" && (Rl(), o.current = null);
	}, [i, r]), (0, l.useEffect)(() => {
		let r = a.current, i = e.phase;
		if (a.current = i, r === i || i !== "winnerReveal") return;
		let s = e.frozenTrick, c = s?.winnerId ?? e.trickWinnerSeatId;
		if (!c || !s) return;
		let l = `${s.trickNumber}:${c}:won`;
		o.current !== l && (o.current = l, Ul(ll({
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
			Ul(sl(i)), i.takesLead && i.cardIndex > 0 && Ul(cl(i));
		}, [
			e.phase,
			r,
			n
		]),
		onTrickCollectionStart: (0, l.useCallback)((e) => {
			Ul(dl({
				...e,
				playerCount: n,
				isLocalPlayer: e.isLocalPlayer ?? (t != null && t === e.winningSeat)
			}));
		}, [n, t])
	};
}
//#endregion
//#region src/session/liveHand.ts
function Fh() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function Ih(e) {
	let t = e ?? Fh();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function Lh(e) {
	if (!e) return !1;
	let t = e.phase ?? null;
	if (t !== "draw" && t !== "play" && t !== "reveal" && t !== "decision") return !1;
	let n = e.participantIds ?? [];
	if (n.length === 0) return !1;
	let r = e.tricksByPlayer ?? {};
	return !(Of(r, n) || Df(r, n) >= 5);
}
function Rh(e) {
	if (!e) return 0;
	let t = e.phase ?? "", n = t === "play" ? 1e3 : t === "draw" ? 100 : t === "decision" ? 50 : t === "reveal" ? 25 : 0;
	n += (e.drawCompletedIds?.length ?? 0) * 10;
	let r = e.participantIds ?? [];
	n += Df(e.tricksByPlayer ?? {}, r);
	let i = e.handDecision;
	return t === "decision" && i && (n += (i.currentIndex ?? 0) * 5, n += (i.playingIds?.length ?? 0) * 2, n += (i.passedIds?.length ?? 0) * 2), n;
}
function zh(e, t) {
	return Lh(t) ? Lh(e) ? Rh(t) >= Rh(e) ? t : e : t : e;
}
function Bh(e) {
	let t = e?.phase ?? null;
	return t === "reveal" || t === "decision" || t === "draw" || t === "play";
}
function Vh(e) {
	let t = e?.currentHand ?? Fh(), n = e?.liveEnrollment?.deal?.publicHand, r = n?.phase ?? null;
	if (Ih(t) && n && !Lh(n)) return Fh();
	if (Lh(t) && Lh(n)) {
		let e = t.phase === "reveal" || t.phase === "decision", r = n?.drawCompletedIds?.length ?? 0, i = t.drawCompletedIds?.length ?? 0, a = Df(n?.tricksByPlayer ?? {}, n?.participantIds ?? []), o = Df(t.tricksByPlayer ?? {}, t.participantIds ?? []);
		return e && n?.phase === "draw" && o === 0 && a === 0 && r > 0 && i === 0 ? t : zh(t, n);
	}
	if (Lh(t)) return t;
	if (r === "draw" || r === "play" || r === "reveal" || r === "decision") {
		if (Lh(n)) {
			let i = Df(n?.tricksByPlayer ?? {}, n?.participantIds ?? []);
			return Ih(t) && i === 0 && r === "draw" && !e?.liveEnrollment?.active ? Fh() : n;
		}
		return n?.phase ? n : Bh(t) ? t : Ih(t) ? Fh() : t;
	}
	return r && n ? n : t;
}
function Hh(e) {
	let t = Vh(e), n = t?.phase ?? null;
	if (n === "reveal" || n === "draw" || n === "play") return null;
	if (n === "decision") {
		let e = dc(t.handDecision ?? null);
		if (e?.active) return e;
	}
	let r = e?.liveEnrollment, i = r?.deal?.publicHand?.phase ?? null;
	return r?.active ? r : i === "draw" || i === "play" || i === "reveal" || i === "decision" ? null : e?.handEnrollment?.active ? e.handEnrollment : e?.handEnrollment ?? null;
}
function Uh(e) {
	return !e.cardsDealt && e.handParticipantCount === 0 && e.enrollmentActive;
}
function Wh(e, t) {
	return e === "decision" && t?.active === !0;
}
function Gh(e) {
	return e.pagatDecisionActive && e.handDecision ? (e.handDecision.orderedPlayerIds ?? [])[e.handDecision.currentIndex ?? 0] ?? null : e.legacyEnrollmentActive && e.enrollment?.active ? (e.enrollment.orderedPlayerIds ?? [])[e.enrollment.currentIndex ?? 0] ?? null : null;
}
function Kh(e) {
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
}, qh = [
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
], Jh = (e, t) => `${e}:${t}`;
new Map(qh.map((e) => [Jh(e.from, e.event), e.to]));
function Yh(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
function Xh(e, t) {
	return !e || !t ? !1 : e === t ? !0 : Yh(e);
}
function Zh() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function Qh(e) {
	let t = e.session, n = t ? Vh(t) : Zh(), r = n.phase ?? null, i = n.participantIds ?? [], a = n.tricksByPlayer ?? {}, o = Df(a, i), s = i.length > 0 && Of(a, i), c = !!t?.pendingCoWinSettlement?.winnerIds?.length, l = t ? Hh(t) : null, u = Wh(r, n.handDecision ?? null), d = Uh({
		cardsDealt: r === uc.REVEAL || r === uc.DECISION || r === uc.DRAW || r === uc.PLAY,
		handParticipantCount: i.length,
		enrollmentActive: !!l?.active
	}), f = d || u, p = $h({
		sessionStatus: t?.status ?? null,
		handPhase: r,
		participantIds: i,
		trickCount: o,
		handComplete: s,
		pendingCoWin: c,
		enrollmentActive: f,
		handCount: t?.handCount ?? 0,
		clearedHand: Ih(n)
	});
	return {
		phase: p,
		handPhase: r,
		enrollmentActive: f,
		pagatDecisionActive: u,
		participantIds: i,
		turnPlayerId: eg({
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
function $h(e) {
	if (e.sessionStatus === "final") return $.WAITING;
	if (e.pendingCoWin) return $.SETTLE;
	let t = e.handPhase ?? null, n = e.participantIds ?? [];
	return t === uc.PLAY ? e.handComplete || (e.trickCount ?? 0) >= 5 ? $.SETTLE : $.PLAY : t === uc.DRAW ? $.DRAW : t === uc.REVEAL ? $.DEAL : t === uc.DECISION || e.enrollmentActive ? $.ENROLLMENT : e.clearedHand !== !1 && n.length === 0 && (e.handCount ?? 0) > 0 && !e.enrollmentActive ? $.NEXT_HAND_PREP : $.WAITING;
}
function eg(e) {
	let { phase: t, hand: n, enrollment: r, pagatDecisionActive: i, legacyEnrollmentActive: a } = e;
	return t === $.ENROLLMENT ? Gh({
		pagatDecisionActive: i,
		handDecision: n.handDecision ?? null,
		legacyEnrollmentActive: a,
		enrollment: r
	}) : t === $.DRAW || t === $.PLAY ? n.turnPlayerId ?? null : null;
}
function tg(e) {
	let { snapshot: t, action: n, playerId: r, actorId: i, suppressTurn: a = !1 } = e, o = e.drawCompletedIds ?? [];
	if (!Xh(r, i)) return {
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
function ng(e) {
	let t = e.currentUserId;
	if (!t || e.handComplete) return !1;
	let n = e.selfPlayer, r = Kh({
		phase: e.session.phase,
		participantIds: e.session.participantIds,
		playerId: t
	});
	if (!n || !r && n.isOut || n.actionDeclared) return !1;
	let i = Qh({
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
	let a = tg({
		snapshot: i,
		action: "submit_draw",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn,
		drawCompletedIds: e.session.drawCompletedIds
	});
	if (i.phase === $.DRAW && a.ok) return !0;
	let o = tg({
		snapshot: i,
		action: "play_card",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn
	});
	return !!(i.phase === $.PLAY && o.ok);
}
function rg(e) {
	let t = e.currentUserId;
	if (!t || e.handComplete || e.suppressTurn) return !1;
	let n = Qh({
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
	return n.phase === $.DRAW ? tg({
		snapshot: n,
		action: "submit_draw",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn,
		drawCompletedIds: e.session.drawCompletedIds
	}).ok : n.phase === $.PLAY ? tg({
		snapshot: n,
		action: "play_card",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn
	}).ok : e.session.turnPlayerId === t;
}
function ig(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off";
	return [
		e.session.phase ?? "",
		e.session.turnPlayerId ?? "",
		n,
		e.selfPlayer?.actionDeclared ? "declared" : "open",
		e.session.drawCompletedIds?.join(",") ?? "",
		e.suppressTurn ? "1" : "0",
		ng(e) ? "act" : "wait"
	].join("|");
}
//#endregion
//#region src/table/trumpHolderPresentation.ts
function ag(e) {
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
function og(e) {
	return e <= 0 ? null : e - 1;
}
function sg(e, t, n, r, i) {
	if (i || !t.trumpHolderId || e !== t.trumpHolderId || r <= 0) return {
		revealedTrumpUpcard: null,
		revealedTrumpIndex: null,
		seatTrumpMergeActive: !1
	};
	let a = t.showRevealedTrumpAtHolder ? og(r) : null;
	return {
		revealedTrumpUpcard: t.showRevealedTrumpAtHolder ? n : null,
		revealedTrumpIndex: a,
		seatTrumpMergeActive: t.trumpMergeActive
	};
}
//#endregion
//#region src/table/CardTable.tsx
function cg({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: _, recommendedDiscardIndices: v = [], handComplete: y = !1, actionFeedback: b, trickPresentation: x, handPresentation: S, microinteractions: C, instantTrickPlays: w = !1, turnCountdown: T = null, bigPotEvent: E = null, onDismissTableEvent: D, onToggleInHand: O, onPassEnrollment: k, onTrickDelta: A, onSubmitDraw: j, onPassDraw: M, onFoldDraw: N, onPlayCard: ee, onReaction: te, onHeroUserActivity: P }) {
	let F = t.map((e) => ({
		...e,
		isSelf: e.isSelf || m != null && e.playerId === m
	})), I = xp(F, e, m), L = I.length, R = `btable--p${Math.min(8, Math.max(2, L))}`, z = Kf(L), B = Object.fromEntries(F.map((e) => [e.playerId, e.displayName])), V = fm(), H = e.sessionId, U = km({
		aspect: z,
		sessionKey: H
	});
	(0, l.useEffect)(() => {
		if (typeof window > "u" || localStorage.getItem("tableSeatDebug") !== "1") return;
		let e = U.current;
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
		U
	]);
	let { cards: ne, pileIndexRef: re, commitDiscardCards: W } = Cs({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: U
	});
	Am({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: U,
		pileIndexRef: re,
		onDiscardCommitted: W
	}), jm({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: U
	}), Nm({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: S,
		tableRootRef: U
	});
	let ie = Wm({
		session: e,
		heroCards: a,
		privateHandReady: p,
		tableRootRef: U
	});
	ah({
		anteAnimActive: S.anteAnimActive,
		session: e,
		tableRootRef: U
	});
	let G = e.trumpHolderId ?? e.dealerId ?? null, ae = m != null && G != null && m === G;
	lh({
		tableRootRef: U,
		trumpMergeActive: S.trumpMergeActive,
		isTrumpHolder: ae,
		onComplete: S.completeTrumpMerge
	});
	let oe = Ph({
		trickPresentation: x,
		currentUserId: m,
		participantCount: r,
		trickNumber: e.currentTrick?.trickNumber ?? x.frozenTrick?.trickNumber ?? 1,
		sessionPhase: e.phase
	});
	jh({
		trickPresentation: x,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: y,
		tableRootRef: U,
		onTrickCollectionStart: oe.onTrickCollectionStart
	});
	let se = new Set(e.participantIds.filter((t) => Af(t, x.displayTricksByPlayer, e.participantIds, e.phase))), ce = F.map((t) => {
		let r = x.displayTricksByPlayer[t.playerId] ?? 0, i = x.trickWinnerSeatId === t.playerId, a = x.suppressTurnPlayerId || S.suppressTurnIndicator, o = x.phase === "collectTrick" && i, s = S.enrollmentPulse[t.playerId], c = S.animatingDrawPlayerId === t.playerId, l = sg(t.playerId, f, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: If(t.bankroll, n.anteAmount, {
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
			bourrePressure: se.has(t.playerId)
		};
	}), le = F.find((e) => e.isSelf), ue = x.suppressTurnPlayerId || S.suppressTurnIndicator, de = !!(m && e.drawCompletedIds?.includes(m));
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: U,
		className: [
			"btable-wrap btable-wrap--stage-fit",
			R,
			ce.some((e) => e.isActiveActor) ? "btable-wrap--has-active-turn" : "",
			ie ? "btable-wrap--clockwise-dealing" : ""
		].filter(Boolean).join(" "),
		"data-testid": "table-root",
		style: {
			"--player-count": L,
			"--table-aspect": z,
			"--trick-card-travel-ms": "395ms",
			"--trick-card-settle-ms": "165ms",
			"--trick-card-shift-ms": "220ms",
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": `${Yf}ms`,
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": `${qf}ms`,
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": `${qf + 400 + Yf + 230}ms`,
			"--deal-card-stagger-ms": `${V.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${V.drawDiscardMs}ms`,
			"--draw-replace-ms": `${V.drawReplaceMs}ms`
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
								children: /* @__PURE__ */ (0, g.jsx)(pp, {
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
									playerNames: B,
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
									discardPileCards: ne,
									currentUserId: m,
									onCardLanded: oe.onCardLanded
								})
							}),
							/* @__PURE__ */ (0, g.jsx)("div", {
								className: "btable__seats",
								"aria-label": "Players at the table",
								children: I.map((e, t) => {
									let n = Gp(t, I.length, {
										isMobile: !1,
										isSelf: e.isSelf
									}), r = ce.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, g.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										"data-seat-index": t,
										children: /* @__PURE__ */ (0, g.jsx)(yp, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											clockwiseDealing: ie,
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
			children: [E && hf(a) && D && /* @__PURE__ */ (0, g.jsx)(mf, {
				event: E,
				onDismiss: D
			}), /* @__PURE__ */ (0, g.jsx)(pf, {
				cards: a,
				privateHandReady: p,
				phase: e.phase,
				enrollmentActive: i,
				isInHand: !!le?.inHand,
				isDealer: !!le?.isDealer,
				signedIn: !!m,
				isMyTurn: rg({
					currentUserId: m,
					session: e,
					suppressTurn: !!ue,
					handComplete: y,
					enrollmentActive: i,
					selfPlayer: le
				}),
				dealStaggerMs: V.dealCardStaggerMs,
				drawAnimSubPhase: S.animatingDrawPlayerId === m ? S.drawAnimSubPhase : null,
				drawDiscardCount: S.animatingDrawPlayerId === m ? S.drawDiscardCount : 0,
				drawReplaceCount: S.animatingDrawPlayerId === m ? S.drawReplaceCount : 0,
				drawCompleted: de,
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
				pileIndexRef: re,
				onDiscardCommitted: W,
				onUserActivity: P,
				skipHeroDealMotion: ie
			})]
		})]
	});
}
//#endregion
//#region src/table/layout/mobileSeatMap.ts
function lg(e, t) {
	let n = Math.max(1, Math.min(7, e || 1));
	return t === "portrait" ? n <= 1 ? .8 : n <= 2 ? .82 : n <= 3 ? .86 : n <= 4 ? .9 : .94 : n <= 1 ? 1.02 : n <= 2 ? .98 : n <= 3 ? 1.02 : n <= 5 ? 1.16 : 1.26;
}
//#endregion
//#region src/table/layout/useTableLayoutMode.ts
var ug = "(orientation: portrait)";
function dg() {
	let e = wm(), [t, n] = (0, l.useState)(() => typeof window < "u" && window.matchMedia(ug).matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(ug), t = () => n(e.matches);
		return t(), e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []), e ? t ? "mobile-portrait" : "mobile-landscape" : "desktop";
}
//#endregion
//#region src/table/hooks/useMobileStageFit.ts
function fg(e, t) {
	if (typeof window > "u") return t;
	let n = getComputedStyle(document.documentElement).getPropertyValue(e).trim(), r = parseFloat(n);
	return Number.isFinite(r) ? r : t;
}
function pg(e) {
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
function mg(e) {
	return e.closest(".btable-mobile__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function hg({ aspect: e, sessionKey: t }) {
	let n = (0, l.useRef)(null), r = (0, l.useRef)(0), i = (0, l.useRef)(0), a = (0, l.useRef)(t), o = dg(), { settings: s } = _d(), c = o === "mobile-portrait";
	return (0, l.useLayoutEffect)(() => {
		if (typeof window > "u") return;
		let o = n.current;
		if (!o) return;
		a.current !== t && (a.current = t, r.current = 0, i.current = 0);
		let l = window.visualViewport, u = () => {
			if (lf()) return;
			let t = mg(o).getBoundingClientRect(), n = o.querySelector(".btable-mobile-hero-dock")?.getBoundingClientRect(), a = !!o.closest(".table-play-overlay"), u = c ? 104 : 92, d = c ? 210 : 168, f = hm(n?.height ?? 0, r.current, u, d);
			r.current = f.peak;
			let p = f.height, m = parseInt(getComputedStyle(o).getPropertyValue("--player-count").trim(), 10) || 4, h = m <= 4, g = !c, _ = (g && h ? fg("--mobile-fit-pad-x", 4) : fg("--mobile-fit-pad-x", 8)) + (g && a ? 4 : 12), v = (g && h ? fg("--mobile-fit-pad-y", 2) : fg("--mobile-fit-pad-y", 6)) + (g && a ? 4 : 10), y = fg("--mobile-fit-gap", c ? 8 : 6), b = l, x = Math.min(t.width, b?.width ?? window.innerWidth), S = Math.min(t.height, b?.height ?? window.innerHeight);
			if (a) {
				let e = gm(pg(o), i.current, 72);
				i.current = e.peak, S = Math.max(140, S - e.height);
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = g ? {
				...ym({
					availWidth: x,
					availHeight: S,
					aspect: e,
					userScale: 1,
					padX: _,
					padY: v,
					stageShare: vm(m)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : bm({
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
			lf() || (d ??= window.requestAnimationFrame(() => {
				d = null, u();
			}));
		}, p = new ResizeObserver(f), m = mg(o);
		m instanceof HTMLElement && p.observe(m), f();
		let h = uf(() => {
			lf() || f();
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
function gg({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: _, recommendedDiscardIndices: v = [], handComplete: y = !1, actionFeedback: b, trickPresentation: x, handPresentation: S, microinteractions: C, instantTrickPlays: w = !1, turnCountdown: T = null, bigPotEvent: E = null, onDismissTableEvent: D, onToggleInHand: O, onPassEnrollment: k, onTrickDelta: A, onSubmitDraw: j, onPassDraw: M, onFoldDraw: N, onPlayCard: ee, onHeroUserActivity: te }) {
	let P = dg() === "mobile-landscape" ? "landscape" : "portrait", F = t.map((e) => ({
		...e,
		isSelf: e.isSelf || m != null && e.playerId === m
	})), I = xp(F, e, m), L = I.filter((e) => !e.isSelf), R = I.find((e) => e.isSelf), z = R ? qp(I.length, P) : null, B = I.length, V = `btable--p${Math.min(8, Math.max(2, B))}`, H = lg(L.length, P), U = Object.fromEntries(t.map((e) => [e.playerId, e.displayName])), ne = fm(), re = e.sessionId, W = hg({
		aspect: H,
		sessionKey: re
	});
	(0, l.useEffect)(() => {
		if (typeof window > "u" || localStorage.getItem("tableSeatDebug") !== "1") return;
		let e = W.current;
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
		W
	]);
	let { cards: ie, pileIndexRef: G, commitDiscardCards: ae } = Cs({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: W
	});
	Am({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: W,
		pileIndexRef: G,
		onDiscardCommitted: ae
	}), jm({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: W
	}), Nm({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: S,
		tableRootRef: W
	});
	let oe = Wm({
		session: e,
		heroCards: a,
		privateHandReady: p,
		tableRootRef: W
	});
	ah({
		anteAnimActive: S.anteAnimActive,
		session: e,
		tableRootRef: W
	});
	let se = e.trumpHolderId ?? e.dealerId ?? null, ce = m != null && se != null && m === se;
	lh({
		tableRootRef: W,
		trumpMergeActive: S.trumpMergeActive,
		isTrumpHolder: ce,
		onComplete: S.completeTrumpMerge
	});
	let le = Ph({
		trickPresentation: x,
		currentUserId: m,
		participantCount: r,
		trickNumber: e.currentTrick?.trickNumber ?? x.frozenTrick?.trickNumber ?? 1,
		sessionPhase: e.phase
	});
	jh({
		trickPresentation: x,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: y,
		tableRootRef: W,
		onTrickCollectionStart: le.onTrickCollectionStart
	});
	let ue = new Set(e.participantIds.filter((t) => Af(t, x.displayTricksByPlayer, e.participantIds, e.phase))), de = F.map((t) => {
		let r = x.displayTricksByPlayer[t.playerId] ?? 0, i = x.trickWinnerSeatId === t.playerId, a = x.suppressTurnPlayerId || S.suppressTurnIndicator, o = x.phase === "collectTrick" && i, s = S.enrollmentPulse[t.playerId], c = S.animatingDrawPlayerId === t.playerId, l = sg(t.playerId, f, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: If(t.bankroll, n.anteAmount, {
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
			bourrePressure: ue.has(t.playerId)
		};
	}), fe = F.find((e) => e.isSelf), pe = x.suppressTurnPlayerId || S.suppressTurnIndicator, me = !!(m && e.drawCompletedIds?.includes(m));
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: W,
		className: [
			"btable-mobile-wrap btable-mobile-wrap--stage-fit",
			V,
			de.some((e) => e.isActiveActor) ? "btable-wrap--has-active-turn" : "",
			oe ? "btable-wrap--clockwise-dealing" : ""
		].filter(Boolean).join(" "),
		"data-testid": "table-root",
		"data-layout": P,
		style: {
			"--player-count": B,
			"--table-aspect": H,
			"--trick-card-travel-ms": "395ms",
			"--trick-card-settle-ms": "165ms",
			"--trick-card-shift-ms": "220ms",
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": `${Yf}ms`,
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": `${qf}ms`,
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": `${qf + 400 + Yf + 230}ms`,
			"--deal-card-stagger-ms": `${ne.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${ne.drawDiscardMs}ms`,
			"--draw-replace-ms": `${ne.drawReplaceMs}ms`
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
								children: /* @__PURE__ */ (0, g.jsx)(pp, {
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
									playerNames: U,
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
									discardPileCards: ie,
									currentUserId: m,
									onCardLanded: le.onCardLanded
								})
							}),
							/* @__PURE__ */ (0, g.jsxs)("div", {
								className: "btable__seats btable-mobile__seats",
								"aria-label": "Players at the table",
								children: [L.map((e, t) => {
									let n = Kp(t, I.length, P), r = de.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, g.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										"data-seat-index": t + 1,
										children: /* @__PURE__ */ (0, g.jsx)(yp, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											clockwiseDealing: oe,
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
								}), R && z && /* @__PURE__ */ (0, g.jsx)("div", {
									className: "btable__seat-slot btable__seat-slot--self",
									"data-seat-index": 0,
									children: /* @__PURE__ */ (0, g.jsx)(yp, {
										player: de.find((e) => e.playerId === R.playerId) ?? R,
										region: z.region,
										handLane: z.handLane,
										clockwiseDealing: oe,
										style: {
											left: `${z.x}%`,
											top: `${z.y}%`
										},
										onToggleInHand: () => O(R.playerId, R.canToggleInHand ? !0 : !R.inHand),
										onPassEnrollment: R.canPassEnrollment && k ? () => k(R.playerId) : void 0,
										onTrickDelta: (e) => A(R.playerId, e),
										onReaction: void 0
									})
								}, R.playerId)]
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-mobile-hero-dock hand-panel",
			children: /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btable-mobile-hero-dock__stack",
				children: [E && hf(a) && D && /* @__PURE__ */ (0, g.jsx)(mf, {
					event: E,
					onDismiss: D
				}), /* @__PURE__ */ (0, g.jsx)(pf, {
					cards: a,
					privateHandReady: p,
					phase: e.phase,
					enrollmentActive: i,
					isInHand: !!fe?.inHand,
					isDealer: !!fe?.isDealer,
					signedIn: !!m,
					isMyTurn: rg({
						currentUserId: m,
						session: e,
						suppressTurn: !!pe,
						handComplete: y,
						enrollmentActive: i,
						selfPlayer: fe
					}),
					dealStaggerMs: ne.dealCardStaggerMs,
					drawAnimSubPhase: S.animatingDrawPlayerId === m ? S.drawAnimSubPhase : null,
					drawDiscardCount: S.animatingDrawPlayerId === m ? S.drawDiscardCount : 0,
					drawReplaceCount: S.animatingDrawPlayerId === m ? S.drawReplaceCount : 0,
					drawCompleted: me,
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
					tableRootRef: W,
					pileIndexRef: G,
					onDiscardCommitted: ae,
					onUserActivity: te,
					skipHeroDealMotion: oe
				})]
			})
		})]
	});
}
//#endregion
//#region src/table/CinematicSplash.tsx
var _g = new Set(["pot-cap", "hand-win"]);
function vg({ events: e, onDismiss: t }) {
	let n = [...e].reverse().find((e) => _g.has(e.kind));
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
function yg({ children: e }) {
	let { settings: t } = _d(), n = t.layoutMode === "tiled", r = wm();
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
function bg({ children: e }) {
	let t = dg();
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
function xg({ events: e, onDismiss: t }) {
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
function Sg({ compact: e = !1 }) {
	let [t, n] = (0, l.useState)(() => gl()), [r, i] = (0, l.useState)(!1);
	(0, l.useEffect)(() => bl(n), []);
	let a = bu(), o = Ol();
	function s(e) {
		_l({ soundMode: e });
	}
	function c(e) {
		_l({ soundPackId: e }), Yl(e);
	}
	function u(e) {
		_l({ hapticsMode: e });
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
					children: Object.keys(Kc).map((e) => /* @__PURE__ */ (0, g.jsx)("option", {
						value: e,
						children: Kc[e]
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
//#region src/table/TableSettingsPanel.tsx
function Cg({ open: e, onClose: t }) {
	let { settings: n, updateSettings: r, resetSettings: i } = _d();
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
						children: Object.keys(ld).map((e) => /* @__PURE__ */ (0, g.jsx)("option", {
							value: e,
							children: ld[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, g.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, g.jsx)("span", { children: "Card style" }), /* @__PURE__ */ (0, g.jsx)("select", {
						value: n.cardPackId,
						onChange: (e) => r({ cardPackId: e.target.value }),
						children: Object.keys(sd).map((e) => /* @__PURE__ */ (0, g.jsx)("option", {
							value: e,
							children: sd[e]
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
var wg = 0;
function Tg() {
	return wg += 1, `evt-${wg}-${Date.now()}`;
}
function Eg(e, t, n) {
	let r = t.currentPot, i = [];
	return r >= t.potCap && t.limEnabled && r > e.pot ? i.push({
		id: Tg(),
		kind: "pot-cap",
		title: "Pot cap reached",
		subtitle: "LmT engaged",
		emoji: "🔒",
		durationMs: 2200
	}) : r >= t.anteAmount * Math.max(n.length, 2) * 2 && r > e.pot && i.push({
		id: Tg(),
		kind: "big-pot",
		title: "Big pot brewing",
		emoji: "💰",
		durationMs: 2e3
	}), i;
}
function Dg({ session: e, potMetrics: t, participantIds: n }) {
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
		let o = Eg(r, t, n);
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
				id: Tg(),
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
function Og(e) {
	return !e?.rank || !e?.suit ? "" : `${e.rank}-${e.suit}`;
}
function kg(e) {
	return e === "handReset" || e === "ante" || e === "trumpReveal" || e === "trumpMerge" || e === "drawPlayer" || e === "drawReady" || e === "settle" || e === "nextHandReset";
}
function Ag(e) {
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
function jg(e) {
	return e.phase === "play" ? "play" : e.phase === "draw" ? "drawPlayer" : e.phase === "decision" ? "decision" : e.phase === "reveal" ? "ante" : e.enrollmentActive ? "enrollment" : "idle";
}
function Mg(e) {
	let t = {
		phase: jg(e),
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
	return e.phase === "reveal" ? Jg(t, e) : t;
}
function Ng(e, t, n = {}) {
	return {
		...e,
		...n,
		phase: t,
		phaseStartedAt: Date.now()
	};
}
function Pg(e, t) {
	let n = {};
	for (let r of t.enrolledIds) e.enrolledIds.includes(r) || (n[r] = "join");
	for (let r of t.declinedIds) e.declinedIds.includes(r) || (n[r] = "pass");
	return n;
}
function Fg(e, t, n) {
	for (let r of n.drawCompletedIds) if (!Ig(e, r) && !e.displayDrawCompletedIds.includes(r) && !t.drawCompletedIds.includes(r)) return r;
	return null;
}
function Ig(e, t) {
	return e.drawPresentationConsumedIds.includes(t);
}
function Lg(e) {
	return e.phase === "drawPlayer" && e.animatingDrawPlayerId != null && e.drawAnimSubPhase !== "done";
}
function Rg(e, t) {
	if (t.phase !== "draw" || !Lg(e)) return null;
	let n = e.animatingDrawPlayerId, r = t.turnPlayerId;
	return !n || !r || t.drawCompletedIds.includes(r) || n === r && !t.drawCompletedIds.includes(n) ? null : (Rd() && zd("handPresentation", "fast-forward-stale-draw", {
		animating: n,
		turnId: r,
		drawCompleted: t.drawCompletedIds
	}), {
		...Wg(e, t),
		pendingSnapshot: t,
		prevSnapshot: t
	});
}
function zg(e, t) {
	return !t || Ig(e, t) ? e.drawPresentationConsumedIds : [...e.drawPresentationConsumedIds, t];
}
function Bg(e, t) {
	return [...new Set([...e.drawPresentationConsumedIds, ...t])];
}
function Vg(e, t, n) {
	for (let r of t.actionOrder) if (t.participantIds.includes(r) && t.drawCompletedIds.includes(r) && !n.includes(r) && !Ig(e, r)) return r;
	return null;
}
function Hg(e, t, n, r) {
	Rd() && zd("handPresentation", "draw-candidate-resolve", {
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
function Ug(e, t, n) {
	Rd() && zd("handPresentation", `draw-receive-commit-${e}`, {
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
function Wg(e, t) {
	let n = e.animatingDrawPlayerId;
	if (!n) return e.drawAnimSubPhase === "done" ? e : {
		...e,
		drawAnimSubPhase: "done"
	};
	let r = e.displayDrawCompletedIds.includes(n) ? e.displayDrawCompletedIds : [...e.displayDrawCompletedIds, n], i = zg(e, n), a = t == null ? e.prevSnapshot : {
		...t,
		drawCompletedIds: [...r]
	};
	return Ug("payload", e, {
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
function Gg(e, t) {
	return e > 0 ? "discard" : t > 0 ? "receive" : "done";
}
function Kg(e, t, n, r, i, a) {
	return Ig(e, n) ? (Hg(e, t, null, `consumed-skip:${n}:${a}`), e) : Lg(e) && e.animatingDrawPlayerId !== n ? (Hg(e, t, null, `in-flight-skip:${a}`), e) : (Hg(e, t, n, a), Ng(e, "drawPlayer", {
		animatingDrawPlayerId: n,
		drawAnimSubPhase: Gg(r, i),
		drawDiscardCount: r,
		drawReplaceCount: i,
		prevSnapshot: t,
		drawPresentationConsumedIds: zg(e, n)
	}));
}
function qg(e) {
	if (!e.pendingHandSettle || e.phase !== "play") return e;
	let t = e.handSettleSnapshot ?? e.prevSnapshot;
	return t ? Ng(e, "settle", {
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		settleAnimActive: !0,
		settleCarryOver: t.carryOverPot > 0,
		prevSnapshot: t,
		displayPotAmount: t.potAmount
	}) : e;
}
function Jg(e, t) {
	return Ng(e, "ante", {
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
function Yg(e, t, n, r) {
	let i = Fg(e, {
		...t,
		drawCompletedIds: []
	}, t);
	return i ? Kg(e, t, i, n, r, "beginDrawSequence") : Ng(e, "drawPlayer", {
		displayDrawCompletedIds: e.displayDrawCompletedIds,
		prevSnapshot: t
	});
}
function Xg(e, t) {
	let n = Zg(e, t);
	return Rd() && (e.phase !== n.phase || e.handNumber !== n.handNumber || e.trumpRevealActive !== n.trumpRevealActive || t.type === "serverUpdate") && zd("handPresentation", t.type, {
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
function Zg(e, t) {
	switch (t.type) {
		case "reset": return Mg(t.snapshot);
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
		case "watchdog": return e.pendingHandSettle && e.phase === "play" ? qg(e) : Date.now() - e.phaseStartedAt < 12e3 ? e : Qg({
			...e,
			pendingSnapshot: e.pendingSnapshot ?? e.prevSnapshot
		});
		case "tryBeginHandSettle": return qg(e);
		case "advancePhase": return Qg(e);
		case "serverUpdate": {
			let { snapshot: n, heroDrawDiscardCount: r = 0, heroDrawReplaceCount: i = 0 } = t, a = e.prevSnapshot ?? n;
			if (e.sessionKey !== n.sessionKey) {
				let e = Mg(n);
				return n.phase === "reveal" ? Jg(e, n) : e;
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
				let e = Mg(n);
				return n.phase === "reveal" ? Jg(e, n) : e;
			}
			let o = Og(a.trumpUpcard), s = Og(n.trumpUpcard);
			if (o && !s && !e.trumpMergedIntoHand && !e.trumpMergeActive) return {
				...e,
				trumpRevealActive: !1,
				trumpMergeActive: !0,
				trumpMergedIntoHand: !1,
				prevSnapshot: n,
				pendingSnapshot: n
			};
			if (n.phase === "play" && e.phase !== "play") return Ng(e, "play", {
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
			if (n.phase === "reveal" && e.phase === "ante" && !e.anteAnimActive && !e.trumpRevealActive) return Jg(e, n);
			if (kg(e.phase) && e.phase !== "drawPlayer" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done") return {
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
			if (e.pendingHandSettle && e.phase === "play") {
				let t = n.phase !== "play" && n.phase != null, r = n.enrollmentActive === !0;
				if (t || r) {
					let t = qg(e);
					if (t.phase === "settle") return {
						...t,
						pendingSnapshot: n,
						prevSnapshot: n,
						displayPotAmount: n.potAmount
					};
				}
				return {
					...e,
					pendingSnapshot: n
				};
			}
			let c = Pg(a, n), l = Object.keys(c).length > 0;
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
			if (n.phase === "reveal" && a.phase !== "reveal" && (e.phase === "idle" || e.phase === "nextHandReset" || e.phase === "enrollment" || e.phase === "settle" || e.phase === "play")) return Jg(e, n);
			if (n.phase === "draw" && a.enrollmentActive && !n.enrollmentActive && e.phase === "enrollment") {
				let t = !!n.trumpUpcard;
				return Ng(e, t ? "trumpReveal" : "ante", {
					trumpRevealActive: t,
					anteAnimActive: !0,
					dealStaggerCount: Math.max(e.dealStaggerCount, n.participantIds.length),
					prevSnapshot: n,
					displayPotAmount: n.potAmount
				});
			}
			if (n.phase === "draw" && (e.phase === "decision" || a.phase === "decision") && e.drawPresentationConsumedIds.length === 0 && e.displayDrawCompletedIds.length === 0 && e.phase !== "drawPlayer" && e.phase !== "drawReady") return Yg(e, n, 0, 0);
			if (n.phase === "draw") {
				let t = Rg(e, n);
				t && (e = t);
				let o = Fg(e, a, n);
				if (o && e.phase !== "drawReady") {
					let t = e.phase === "drawPlayer" && e.animatingDrawPlayerId === o && e.drawAnimSubPhase !== "done";
					if (!t && !Lg(e)) {
						let t = r > 0 || i > 0, a = t ? r : o === n.turnPlayerId ? 0 : 1;
						return Kg(e, n, o, a, t ? i : a, "serverUpdate");
					}
					t ? Hg(e, n, null, "serverUpdate:animating-same-player") : Lg(e) && Hg(e, n, null, "serverUpdate:in-flight-other-player");
				} else o || Hg(e, n, null, "serverUpdate:no-candidate");
				if (n.drawCompletedIds.length === n.participantIds.length && n.participantIds.length > 0 && e.phase === "drawPlayer" && e.drawAnimSubPhase === "done") return Ng(e, "drawReady", { prevSnapshot: n });
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
function Qg(e) {
	let t = e.pendingSnapshot ?? e.prevSnapshot;
	switch (e.phase) {
		case "handReset": return Ng(e, "ante", {
			anteAnimActive: !0,
			pendingSnapshot: null
		});
		case "ante": return e.trumpRevealActive || t?.trumpUpcard ? Ng(e, "trumpReveal", {
			trumpRevealActive: !0,
			anteAnimActive: !1,
			pendingSnapshot: null
		}) : t?.phase === "draw" ? Yg(e, t, 0, 0) : Ng(e, "drawPlayer", {
			anteAnimActive: !1,
			pendingSnapshot: null
		});
		case "trumpReveal": return t?.phase === "draw" ? {
			...Yg(e, t, 0, 0),
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !1,
			pendingSnapshot: null
		} : Ng(e, "drawPlayer", {
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
			Ug("before", e);
			let n = e.animatingDrawPlayerId, r = Wg(e, t);
			Ug("after", r);
			let i = t ?? r.prevSnapshot;
			if (i && r.displayDrawCompletedIds.length >= i.participantIds.length) return Ng(r, "drawReady", {
				displayDrawCompletedIds: r.displayDrawCompletedIds,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				pendingSnapshot: null,
				prevSnapshot: {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				},
				drawPresentationConsumedIds: Bg(r, r.displayDrawCompletedIds)
			});
			if (i) {
				let e = {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				}, t = Vg(r, i, r.displayDrawCompletedIds);
				if (Ug("after", r, {
					playerId: n,
					nextCompleted: r.displayDrawCompletedIds,
					nextChosen: t
				}), t) return Hg(r, i, t, "advancePhase:nextPlayer"), Kg(r, e, t, 1, 1, "advancePhase:nextPlayer");
				Hg(r, i, null, "advancePhase:no-next-player");
			}
			return r;
		}
		case "drawReady": return Ng(e, "play", { pendingSnapshot: null });
		case "settle": return Ng(e, "nextHandReset", {
			settleAnimActive: !1,
			nextHandResetActive: !0,
			pendingSnapshot: null
		});
		case "nextHandReset": return t ? Mg(t) : Ng(e, "idle", { nextHandResetActive: !1 });
		default: return e;
	}
}
function $g(e) {
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
		isPresenting: kg(e.phase)
	};
}
function e_(e, t = !1) {
	let n = fm(t);
	switch (e.phase) {
		case "handReset": return n.handResetMs;
		case "ante": {
			let n = e.prevSnapshot?.participantIds?.slice(0, 8) ?? [];
			return om(e.handNumber, n, t);
		}
		case "trumpReveal": return n.trumpRevealHoldMs;
		case "trumpMerge": return n.trumpMergeAnimMs;
		case "drawPlayer": return e.drawAnimSubPhase === "done" ? 0 : pm(e.drawAnimSubPhase === "receive" ? 0 : e.drawDiscardCount, e.drawAnimSubPhase === "receive" ? e.drawReplaceCount : 0, t);
		case "drawReady": return n.drawReadyBeatMs;
		case "settle": return n.settleHoldMs;
		case "nextHandReset": return n.nextHandResetMs;
		default: return 0;
	}
}
//#endregion
//#region src/table/handServerUpdateGate.ts
function t_(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function n_(e) {
	return typeof e == "string" && e.length > 0;
}
function r_(e, t) {
	return `${e}-hand-${t}`;
}
function i_(e, t) {
	return !n_(e) || !t_(t) ? null : r_(e, t);
}
//#endregion
//#region src/table/hooks/useHandPresentation.ts
var a_ = [], o_ = [];
function s_(e, t) {
	let n = new Set(e), r = new Set(t);
	return {
		discardCount: [...n].filter((e) => !r.has(e)).length,
		replaceCount: [...r].filter((e) => !n.has(e)).length
	};
}
function c_({ session: e, enrollmentActive: t, potAmount: n, handComplete: r, trickPipelineActive: i = !1, forceTrickHandEndDrain: a, heroCards: o = o_, enrolledIds: s = a_, declinedIds: c = a_, actionOrder: u }) {
	let d = e.participantIds.join(","), f = (e.drawCompletedIds ?? []).join(","), p = s.join(","), m = c.join(","), h = (u ?? e.participantIds).join(","), g = e.trumpUpcard ? `${e.trumpUpcard.rank}-${e.trumpUpcard.suit}` : "", _ = (0, l.useMemo)(() => Ag({
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
		e.sessionId,
		e.handNumber,
		e.phase,
		e.dealerId,
		e.turnPlayerId,
		e.carryOverPot,
		g,
		d,
		f,
		t,
		n,
		r,
		p,
		m,
		h
	]), v = i_(e.sessionId, e.handNumber), y = _.phase ?? null, b = (0, l.useRef)(null), [x, S] = (0, l.useReducer)(Xg, _, Mg), C = (0, l.useRef)([]), w = (0, l.useRef)([]), T = (0, l.useRef)(null), E = (0, l.useRef)(x);
	E.current = x;
	let D = () => {
		for (let e of C.current) window.clearTimeout(e);
		C.current = [], T.current = null;
	}, O = (e, t) => {
		let n = window.setTimeout(e, t);
		C.current.push(n);
	};
	(0, l.useEffect)(() => () => D(), []), (0, l.useEffect)(() => {
		if (!v) {
			Rd() && zd("useHandPresentation", "serverUpdate-skip-invalid", {
				sessionId: e.sessionId ?? null,
				handNumber: e.handNumber
			});
			return;
		}
		let t = b.current, n = o.map((e) => `${e.rank}-${e.suit}`), r = s_(w.current, n);
		w.current = n, S({
			type: "serverUpdate",
			snapshot: _,
			heroDrawDiscardCount: r.discardCount,
			heroDrawReplaceCount: r.replaceCount
		}), Rd() && zd("handPresentation", "serverUpdate", {
			presentationKey: v,
			phase: `${t ?? "null"} -> ${y ?? "null"}`,
			handNumber: _.handNumber,
			serverPhase: _.phase,
			drawCompleted: _.drawCompletedIds.length,
			participantCount: _.participantIds.length,
			trumpUpcard: !!_.trumpUpcard,
			turnPlayerId: _.turnPlayerId
		}), b.current = y;
	}, [
		v,
		y,
		_,
		o,
		e.sessionId,
		e.handNumber
	]), (0, l.useEffect)(() => {
		if (!Object.values(x.enrollmentPulse).some(Boolean)) return;
		let e = window.setTimeout(() => S({ type: "clearEnrollmentPulse" }), 480);
		return () => window.clearTimeout(e);
	}, [JSON.stringify(x.enrollmentPulse)]), (0, l.useEffect)(() => {
		let e = sp(), t = `${x.handNumber}:${x.phase}:${x.animatingDrawPlayerId ?? ""}:${x.drawAnimSubPhase}:${x.phaseStartedAt}`;
		if (T.current === t) {
			Rd() && zd("useHandPresentation", "advancePhase-timer-skip-duplicate", { phaseKey: t });
			return;
		}
		D();
		let n = e_(x, e);
		if (n <= 0) return;
		let r = {
			handNumber: x.handNumber,
			phase: x.phase,
			animatingDrawPlayerId: x.animatingDrawPlayerId,
			drawAnimSubPhase: x.drawAnimSubPhase,
			phaseStartedAt: x.phaseStartedAt
		};
		T.current = t, Rd() && zd("useHandPresentation", "advancePhase-timer-armed", {
			phaseKey: t,
			delay: n,
			fromPhase: x.phase,
			drawAnimSubPhase: x.drawAnimSubPhase
		}), O(() => {
			if (T.current !== t) return;
			T.current = null;
			let e = E.current;
			if (e.handNumber !== r.handNumber || e.phase !== r.phase || e.animatingDrawPlayerId !== r.animatingDrawPlayerId || e.drawAnimSubPhase !== r.drawAnimSubPhase || e.phaseStartedAt !== r.phaseStartedAt) {
				Rd() && zd("useHandPresentation", "advancePhase-timer-stale", {
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
			Rd() && zd("useHandPresentation", "advancePhase-timer", {
				fromPhase: r.phase,
				delay: n,
				animatingDrawPlayerId: r.animatingDrawPlayerId,
				drawAnimSubPhase: r.drawAnimSubPhase
			}), S({ type: "advancePhase" });
		}, n), O(() => S({ type: "watchdog" }), x.phase === "drawPlayer" || x.phase === "drawReady" ? um : lm);
	}, [
		x.handNumber,
		x.phase,
		x.animatingDrawPlayerId,
		x.drawAnimSubPhase,
		x.phaseStartedAt
	]), (0, l.useEffect)(() => {
		if (e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play") {
			let e = o.length;
			e > 0 && S({
				type: "dealCardRevealed",
				count: e
			});
		}
	}, [o.length, e.phase]), (0, l.useEffect)(() => {
		i || S({ type: "tryBeginHandSettle" });
	}, [i]), (0, l.useEffect)(() => {
		if (x.phase !== "play" || !x.pendingHandSettle) return;
		if (!i) {
			S({ type: "tryBeginHandSettle" });
			return;
		}
		let e = window.setTimeout(() => {
			let e = E.current;
			e.phase !== "play" || !e.pendingHandSettle || (Rd() && zd("useHandPresentation", "hand-end-convergence-force", { trickPipelineActive: !0 }), a?.(), S({ type: "tryBeginHandSettle" }));
		}, dm);
		return () => window.clearTimeout(e);
	}, [
		x.phase,
		x.pendingHandSettle,
		i,
		a
	]);
	let k = (0, l.useCallback)(() => {
		S({ type: "completeTrumpMerge" });
	}, []);
	return {
		...$g(x),
		completeTrumpMerge: k
	};
}
//#endregion
//#region src/table/turnCountdown.ts
var l_ = 15e3, u_ = new Set([
	$.ENROLLMENT,
	$.DRAW,
	$.PLAY
]);
function d_(e) {
	return e > 1e4 ? "green" : e > 5e3 ? "yellow" : "red";
}
function f_(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off", r = e.ante?.anteAnimActive ? `ante:${e.ante.presentationKey}` : "off";
	return [
		e.session.phase ?? "",
		e.activeActorId ?? "",
		n,
		e.session.drawCompletedIds?.join(",") ?? "",
		e.suppressTurn ? "1" : "0",
		e.handComplete ? "1" : "0",
		r
	].join("|");
}
function p_(e) {
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
function m_(e) {
	if (e.handComplete || e.suppressTurn) return null;
	let t = Qh({
		session: p_(e),
		suppressTurn: e.suppressTurn
	});
	return u_.has(t.phase) ? t.turnPlayerId : null;
}
function h_(e) {
	if (!e.anteAnimActive || e.playerIds.length < 1) return null;
	let t = Od(e.presentationKey);
	return t == null ? null : Km(t, Gm(rm({
		handNumber: e.handNumber,
		playerIds: e.playerIds,
		reducedMotion: e.reducedMotion
	}), e.reducedMotion))?.playerId ?? null;
}
function g_(e) {
	return e.handComplete ? null : e.ante?.anteAnimActive ? h_(e.ante) : m_(e);
}
function __(e, t, n) {
	let r = l_ - Math.max(0, n - t) % l_;
	return {
		playerId: e,
		remainingMs: r,
		progress: r / l_,
		segment: d_(r)
	};
}
//#endregion
//#region src/table/hooks/useTurnCountdown.ts
function v_(e) {
	let [t, n] = (0, l.useState)(0), r = !!e.ante?.anteAnimActive;
	(0, l.useEffect)(() => {
		if (!r) return;
		let e = 0, t = () => {
			n((e) => e + 1), e = window.requestAnimationFrame(t);
		}, i = Nd(() => {
			n((e) => e + 1);
		});
		return e = window.requestAnimationFrame(t), () => {
			i(), window.cancelAnimationFrame(e);
		};
	}, [r, e.ante?.presentationKey]);
	let i = g_(e), a = f_({
		...e,
		activeActorId: i
	}), o = (0, l.useRef)(null), s = (0, l.useRef)(""), [c, u] = (0, l.useState)(() => Date.now());
	return (0, l.useEffect)(() => {
		if (!i) {
			o.current = null, s.current = a;
			return;
		}
		(a !== s.current || o.current == null) && (o.current = Date.now(), s.current = a, u(Date.now()));
	}, [i, a]), (0, l.useEffect)(() => {
		if (!i || o.current == null) return;
		let e = () => u(Date.now()), t = sp() ? 250 : 100, n = window.setInterval(e, t);
		return () => window.clearInterval(n);
	}, [i, a]), {
		countdown: i && o.current != null ? __(i, o.current, c) : null,
		reducedMotion: sp()
	};
}
//#endregion
//#region src/table/feedback/turnTimerAudio.ts
var y_ = .48, b_ = 90, x_ = null, S_ = null;
function C_() {
	return x_ ||= new Gc.Howl({
		src: [`/sounds/${Zc.timer}`],
		loop: !0,
		volume: y_,
		preload: !0
	}), x_;
}
function w_() {
	return S_ != null;
}
function T_(e, t = {}) {
	if (S_ == null) return;
	let n = x_, r = S_;
	if (S_ = null, !n) return;
	let i = t.fadeMs ?? b_;
	if (i > 0 && e !== "overlap") {
		n.fade(y_, 0, i, r), window.setTimeout(() => {
			n.stop(r);
		}, i + 20);
		return;
	}
	n.stop(r);
}
function E_(e) {
	if (!vl(gl().soundMode, "turnTimer")) return !1;
	S_ != null && T_("overlap", { fadeMs: 0 }), Jl("turn-timer-warning"), Ml.get().unlock();
	let t = C_().play();
	return typeof t == "number" ? (S_ = t, e.turnKey, e.turnKey, e.actorId, e.ringStartedAtMs, e.elapsedMs, !0) : !1;
}
//#endregion
//#region src/table/turnTimerWarning.ts
var D_ = 15e3;
function O_(e, t) {
	let n = Math.max(0, t - e);
	return Math.max(0, D_ - n);
}
function k_(e, t) {
	return Math.max(0, t - e);
}
function A_(e, t) {
	return !t && e >= 15e3;
}
//#endregion
//#region src/table/hooks/useTurnTimerWarning.ts
function j_({ currentUserId: e = null, localActionPending: t = !1, ...n }) {
	let r = n.ante?.anteAnimActive ? null : g_(n), i = f_({
		...n,
		activeActorId: r
	}), a = (0, l.useRef)(null), o = (0, l.useRef)(""), s = (0, l.useRef)(!1), c = (0, l.useRef)(null), u = () => {
		c.current != null && (window.clearTimeout(c.current), c.current = null);
	};
	(0, l.useEffect)(() => {
		if (!r) {
			u(), w_() && T_("turnChange"), s.current = !1, a.current = null, o.current = i;
			return;
		}
		if (i !== o.current || a.current == null) {
			u(), w_() && T_("turnChange"), s.current = !1, a.current = Date.now(), o.current = i;
			let e = a.current, t = i, n = O_(e, Date.now()), l = () => {
				if (o.current !== t || s.current) return;
				let n = k_(e, Date.now());
				A_(n, s.current) && (s.current = !0, E_({
					turnKey: t,
					actorId: r,
					ringStartedAtMs: e,
					elapsedMs: n
				}));
			};
			n <= 0 ? l() : c.current = window.setTimeout(l, n);
		}
		return () => {
			u();
		};
	}, [r, i]), (0, l.useEffect)(() => () => {
		u(), w_() && T_("cleanup"), s.current = !1;
	}, []), (0, l.useEffect)(() => {
		!t || !w_() || r == null || e == null || r !== e || (T_("playerAction"), s.current = !1, u());
	}, [
		t,
		r,
		e
	]);
}
//#endregion
//#region src/table/hooks/useTableMicrointeractions.ts
function M_(e) {
	let [t, n] = (0, l.useState)(nc), r = (0, l.useRef)(null), i = (0, l.useRef)([]), a = () => {
		for (let e of i.current) window.clearTimeout(e);
		i.current = [];
	}, o = (e, t) => {
		let n = window.setTimeout(e, t);
		i.current.push(n);
	};
	(0, l.useEffect)(() => () => a(), []);
	let s = JSON.stringify(e.tricksByPlayer), c = JSON.stringify(e.bankrollByPlayer), u = JSON.stringify(e.bourrePlayerIds);
	return (0, l.useEffect)(() => {
		let t = ic(r.current, e);
		if (r.current = rc(e), !(!t.turnHandoffPlayerId && !t.dealerMovedPlayerId && !t.potTick && Object.keys(t.trickBadgeIncrements).length === 0 && Object.keys(t.bankrollChanges).length === 0 && t.bourrePlayerIds.length === 0 && !t.trumpReminderPulse && !t.feedbackErrorPulse && !t.feedbackSuccessPulse && !t.winnerFlashPlayerId)) {
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
			}, tc.turnHandoff), t.dealerMovedPlayerId && o(() => {
				n((e) => e.dealerMovedPlayerId === t.dealerMovedPlayerId ? {
					...e,
					dealerMovedPlayerId: null
				} : e);
			}, tc.dealerMove), t.winnerFlashPlayerId && o(() => {
				n((e) => e.winnerFlashPlayerId === t.winnerFlashPlayerId ? {
					...e,
					winnerFlashPlayerId: null
				} : e);
			}, tc.winnerFlash);
			for (let [e, r] of Object.entries(t.bankrollChanges)) o(() => {
				n((t) => {
					if (t.bankrollTicks[e] !== r) return t;
					let n = { ...t.bankrollTicks };
					return delete n[e], {
						...t,
						bankrollTicks: n
					};
				});
			}, tc.bankrollTick);
			for (let e of t.bourrePlayerIds) o(() => {
				n((t) => t.bourreAlerts[e] === "pulse" ? {
					...t,
					bourreAlerts: {
						...t.bourreAlerts,
						[e]: "marker"
					}
				} : t);
			}, tc.bourrePulse), o(() => {
				n((t) => {
					if (!t.bourreAlerts[e]) return t;
					let n = { ...t.bourreAlerts };
					return delete n[e], {
						...t,
						bourreAlerts: n
					};
				});
			}, tc.bourreMarker);
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
function N_({ active: e, displayName: t }) {
	let [n, r] = (0, l.useState)(!1), i = sp();
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
var P_ = l_, F_ = [
	12e3,
	18e3,
	24e3
];
function I_(e) {
	let [t, n] = (0, l.useState)("hidden"), [r, i] = (0, l.useState)(0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(null), c = (0, l.useRef)(0), u = (0, l.useRef)(e.actionRequired);
	u.current = e.actionRequired;
	let d = () => {
		a.current != null && (window.clearTimeout(a.current), a.current = null), o.current != null && (window.clearTimeout(o.current), o.current = null), s.current != null && (window.clearTimeout(s.current), s.current = null);
	}, f = (0, l.useCallback)(() => {
		let e = c.current;
		if (e === 0) return;
		let t = F_[Math.min(e - 1, F_.length - 1)];
		a.current = window.setTimeout(() => {
			a.current = null, u.current && (i(e), n("pop"), c.current = e + 1);
		}, t);
	}, []);
	return (0, l.useEffect)(() => (d(), c.current = 0, e.actionRequired ? (a.current = window.setTimeout(() => {
		a.current = null, u.current && (i(0), n("pop"), c.current = 1);
	}, P_), d) : (n("hidden"), i(0), d)), [e.activityKey, e.actionRequired]), (0, l.useEffect)(() => {
		if (t !== "pop") return;
		let e = sp() ? 280 : 420;
		return o.current = window.setTimeout(() => {
			o.current = null, n("exit");
		}, 380 + e), () => {
			o.current != null && (window.clearTimeout(o.current), o.current = null);
		};
	}, [t, r]), (0, l.useEffect)(() => {
		if (t !== "exit") return;
		let e = sp() ? 240 : 620;
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
function L_() {
	return sp();
}
//#endregion
//#region src/table/YourTurnAttention.tsx
function R_({ actionRequired: e, activityKey: t }) {
	let { phase: n, beat: r } = I_({
		actionRequired: e,
		activityKey: t
	});
	if (n === "hidden") return null;
	let i = L_(), a = Math.min(r, 5);
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
function z_({ actionFeedback: e, feedbackErrorPulse: t = 0, feedbackSuccessPulse: n = 0, turnLabel: r = null, isMyTurn: i = !1, showTurn: a = !1 }) {
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
var B_ = 880;
function V_(e, t, n) {
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
		}, B_);
		return () => window.clearTimeout(n);
	}, [e, t]), (0, l.useEffect)(() => {
		if (!i || t || n === 0) return;
		let e = window.setTimeout(() => {
			a(!1), r.current = !1;
		}, B_);
		return () => window.clearTimeout(e);
	}, [
		i,
		t,
		n
	]), i;
}
//#endregion
//#region src/table/trickPresentationMachine.ts
function H_(e, t) {
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
		peakTrickPlays: np(t),
		displayRevealFloor: 0,
		handEndEchoTrick: null
	};
}
function U_(e, t) {
	if (t.length < e.length) return !1;
	for (let n = 0; n < e.length; n++) if (Vs(e[n]) !== Vs(t[n])) return !1;
	return !0;
}
function W_(e, t, n) {
	let r = t.currentTrick?.trickNumber ?? null, i = e.prevTrick?.trickNumber ?? null, a = r != null && i != null && r !== i ? [] : [...e.peakTrickPlays ?? []];
	for (let t of [
		n,
		np(e.prevTrick),
		e.peakTrickPlays ?? []
	]) t.length > a.length && U_(a, t) && (a = t);
	return a;
}
function G_(e, t) {
	return e.phase === "live" ? e : {
		...e,
		pendingServer: t
	};
}
function K_(e) {
	return Math.max(e.pendingResolution?.frozen.plays.length ?? 0, np(e.prevTrick).length, e.peakTrickPlays?.length ?? 0);
}
function q_(e, t) {
	let n = np(t.currentTrick), r = np(e.prevTrick), i = W_(e, t, n), a = e.phase === "live" && !e.pendingResolution && (n.length < e.revealedCount && r.length >= e.revealedCount || n.length < i.length && r.length >= i.length), o = t.currentTrick?.trickNumber ?? null, s = e.prevTrick?.trickNumber ?? null, c = o != null && s != null && o !== s;
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
function J_(e, t, n, r) {
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
function Y_(e, t) {
	let n = X_(e, t);
	if (Rd()) {
		let r = np(e.prevTrick).length, i = np(n.prevTrick).length;
		(e.phase !== n.phase || e.revealedCount !== n.revealedCount || r !== i || !!e.pendingResolution != !!n.pendingResolution || t.type === "serverUpdate") && zd("trickPresentation", t.type, {
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
function X_(e, t) {
	switch (t.type) {
		case "reset":
		case "reinit": return H_(t.type === "reinit" ? t.snapshot.tricksByPlayer : e.displayTricksByPlayer, t.type === "reinit" ? t.snapshot.currentTrick : null);
		case "revealNextCard": {
			if (e.phase !== "live") return e;
			let t = K_(e);
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
			return !t || e.phase !== "live" ? e : J_({
				...e,
				pendingResolution: null
			}, t.frozen, t.snapshot.tricksByPlayer, t.snapshot.currentTrick);
		}
		case "clearHandEndEcho": return e.handEndEchoTrick ? {
			...e,
			handEndEchoTrick: null
		} : e;
		case "forceHandEndDrain": {
			let t = e;
			if (t.phase === "live" && t.pendingResolution && (t = J_({
				...t,
				pendingResolution: null
			}, t.pendingResolution.frozen, t.pendingResolution.snapshot.tricksByPlayer, t.pendingResolution.snapshot.currentTrick)), t.phase === "live" && !t.pendingResolution) return t;
			let n = t.pendingServer, r = n?.tricksByPlayer ?? {}, i = Object.values(r).some((e) => (e ?? 0) > 0), a = i ? { ...r } : { ...t.displayTricksByPlayer }, o = np(n?.currentTrick).length, s = n != null && n.currentTrick == null && t.frozenTrick != null;
			return {
				...t,
				phase: "live",
				frozenTrick: null,
				handEndEchoTrick: s ? t.frozenTrick : n?.currentTrick ? null : t.handEndEchoTrick,
				showWinnerTag: !1,
				revealedCount: o,
				resolvedTricks: null,
				pendingResolution: null,
				pendingServer: null,
				prevTricks: i ? { ...r } : t.prevTricks,
				prevTrick: n?.currentTrick ?? t.prevTrick,
				displayTricksByPlayer: a,
				peakTrickPlays: np(n?.currentTrick),
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
				let t = e.pendingServer, n = np(t?.currentTrick).length, r = t != null && t.currentTrick == null && e.frozenTrick != null;
				return {
					...e,
					phase: "live",
					frozenTrick: null,
					handEndEchoTrick: r ? e.frozenTrick : t?.currentTrick ? null : e.handEndEchoTrick,
					showWinnerTag: !1,
					revealedCount: n,
					resolvedTricks: null,
					pendingServer: null,
					prevTricks: t ? { ...t.tricksByPlayer } : e.prevTricks,
					prevTrick: t?.currentTrick ?? e.prevTrick,
					displayTricksByPlayer: t ? { ...t.tricksByPlayer } : e.displayTricksByPlayer,
					peakTrickPlays: np(t?.currentTrick),
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
			if (e.phase !== "live") return G_(e, n);
			let i = op({
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
			} : q_(e, n);
		}
		default: return e;
	}
}
function Z_(e, t) {
	let n = e.pendingResolution?.frozen.plays ?? [];
	if (n.length > 0) return n;
	let r = np(e.prevTrick), i = e.peakTrickPlays ?? [];
	return e.phase === "live" ? i.length > t.length ? i : r.length > t.length ? r : t.length > 0 ? t : r : t.length > 0 ? t : r.length > 0 ? r : i;
}
function Q_(e, t) {
	let n = Z_(e, np(t)), r = e.displayRevealFloor, i = n.length >= r ? n : (e.peakTrickPlays?.length ?? 0) >= r ? e.peakTrickPlays : n, a = e.phase === "live" ? e.pendingResolution ? Math.max(e.revealedCount, i.length) : Math.min(e.revealedCount, i.length) : i.length, o = e.phase === "live" && !e.pendingResolution ? Math.max(a, r) : a, s = e.phase === "live" ? i.slice(0, o) : e.frozenTrick?.plays ?? [], c = e.frozenTrick ?? e.handEndEchoTrick, l = c?.plays ?? [], u = c?.winnerId ?? null, d = e.frozenTrick == null ? e.handEndEchoTrick == null ? e.phase : "winnerReveal" : e.phase, f = l.length > 0 && s.length === 0 && (e.phase !== "live" || e.handEndEchoTrick != null), p = e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null, m = e.showWinnerTag && (e.phase === "winnerReveal" || e.phase === "collectTrick"), h = e.peakTrickPlays?.length ?? 0, g = e.phase === "live" ? K_(e) : e.revealedCount;
	return {
		phase: e.phase,
		displayPlays: s,
		winnerPlayerId: p,
		showWinnerTag: m,
		displayTricksByPlayer: e.displayTricksByPlayer,
		suppressTurnPlayerId: Zf(e.phase),
		trickWinnerSeatId: e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null,
		revealedCount: e.revealedCount,
		isResolving: e.phase !== "live",
		isPipelineActive: e.phase !== "live" || !!e.pendingResolution,
		peakPlayCount: h,
		revealTarget: g,
		trickEchoPlays: l,
		trickEchoWinnerId: u,
		trickEchoPhase: d,
		showFinalTrickEcho: f,
		frozenTrick: e.frozenTrick
	};
}
function $_(e) {
	if (e.enteredPlay) return !0;
	let t = e.handComplete || e.phase == null && e.participantCount === 0 || e.handEndEchoTrick != null;
	return !e.sessionPlayActive && !e.pipelineActive && !t;
}
//#endregion
//#region src/table/hooks/useTrickPresentation.ts
function ev({ phase: e, handNumber: t = 0, currentTrick: n, tricksByPlayer: r, participantIds: i, trumpSuit: a, playedCards: o, turnPlayerId: s, handComplete: c = !1 }) {
	let [u, d] = (0, l.useReducer)(Y_, r, (e) => H_(e, n)), f = (0, l.useRef)([]), p = (0, l.useRef)(null), m = (0, l.useRef)(/* @__PURE__ */ new Set()), h = (0, l.useRef)(!1), g = (0, l.useRef)(null), _ = (0, l.useRef)(0), v = (0, l.useRef)(!1), y = (0, l.useRef)(t), b = (0, l.useRef)(u);
	b.current = u;
	let x = u.phase !== "live" || !!u.pendingResolution;
	h.current = x;
	let S = e === "play", C = (e) => {
		for (let t of e) {
			let e = Vs(t);
			m.current.has(e) || (m.current.add(e), Zs(t.playerId, e));
		}
	}, w = () => {
		for (let e of f.current) window.clearTimeout(e);
		f.current = [];
	}, T = (e, t) => {
		let n = window.setTimeout(e, t);
		f.current.push(n);
	};
	(0, l.useEffect)(() => () => w(), []), (0, l.useEffect)(() => {
		let l = S && !v.current;
		v.current = S;
		let u = t !== y.current;
		if (y.current = t, u && t > 0) {
			w(), p.current = null, m.current.clear(), ec(), d({
				type: "reinit",
				snapshot: {
					currentTrick: n,
					tricksByPlayer: r,
					playedCards: o
				}
			}), Rd() && zd("useTrickPresentation", "reinit-hand-number", {
				handNumber: t,
				trickNumber: n?.trickNumber
			});
			return;
		}
		if ($_({
			enteredPlay: l,
			sessionPlayActive: S,
			pipelineActive: h.current,
			handComplete: c,
			phase: e,
			participantCount: i.length,
			handEndEchoTrick: b.current.handEndEchoTrick
		})) {
			w(), p.current = null, m.current.clear(), ec(), d({
				type: "reinit",
				snapshot: {
					currentTrick: n,
					tricksByPlayer: r,
					playedCards: o
				}
			}), Rd() && zd("useTrickPresentation", l ? "reinit-play-entry" : "reinit-idle", {
				trickNumber: n?.trickNumber,
				trickPlays: n?.plays?.length ?? 0
			});
			return;
		}
		d({
			type: "serverUpdate",
			snapshot: {
				currentTrick: n,
				tricksByPlayer: r,
				playedCards: o
			},
			participantIds: i,
			trumpSuit: a,
			reducedMotion: sp()
		}), Rd() && zd("useTrickPresentation", "serverUpdate-effect", {
			sessionPhase: e,
			trickNumber: n?.trickNumber,
			livePlays: n?.plays?.length ?? 0,
			turnPlayerId: s
		});
	}, [
		e,
		n,
		r,
		i,
		a,
		o,
		S,
		c,
		t,
		i.length
	]), (0, l.useLayoutEffect)(() => {
		if (!S && !x) return;
		Js(i), s && Js([s]);
		let e = n?.plays ?? [];
		e.length > 0 && C(e);
		let t = u.pendingResolution?.frozen.plays ?? [];
		t.length > 0 && C(t);
	}, [
		S,
		x,
		i,
		s,
		n?.plays,
		u.pendingResolution?.frozen.plays
	]), (0, l.useEffect)(() => {
		if (!S && !x || u.phase !== "trickComplete" || !u.frozenTrick) return;
		let e = `${u.frozenTrick.trickNumber}:${u.frozenTrick.winnerId}:${u.frozenTrick.plays.length}`;
		if (p.current === e) return;
		p.current = e, w();
		let t = u.frozenTrick, n = $f({
			trumpBeat: ap(t.plays, t.leadSuit, a),
			reducedMotion: sp()
		});
		T(() => d({ type: "advancePhase" }), n.readBeforeWinnerMs), T(() => d({ type: "advancePhase" }), n.readTotalMs), T(() => d({ type: "advancePhase" }), n.readTotalMs + n.sweepMs), T(() => d({ type: "advancePhase" }), n.pipelineMs);
	}, [
		S,
		x,
		u.phase,
		u.frozenTrick,
		a
	]), (0, l.useEffect)(() => {
		if (!S && !x || u.phase !== "live" || !u.pendingResolution) return;
		let e = u.pendingResolution.frozen.plays.length;
		if (u.revealedCount < e) return;
		let t = sp() ? 308 : 560, n = window.setTimeout(() => d({ type: "commitTrickResolution" }), t);
		return () => window.clearTimeout(n);
	}, [
		S,
		x,
		u.phase,
		u.pendingResolution,
		u.revealedCount
	]), (0, l.useEffect)(() => {
		u.phase === "live" && (p.current = null);
	}, [u.phase]), (0, l.useEffect)(() => {
		let t = c || e == null && i.length === 0;
		if (!x || !t || S && !c) return;
		let n = sp() ? Math.max(3e3, Math.round(Xf * .55)) : Xf;
		Rd() && zd("useTrickPresentation", "hand-end-drain-watchdog-armed", {
			phase: u.phase,
			pendingResolution: !!u.pendingResolution,
			revealedCount: u.revealedCount,
			watchdogMs: n
		});
		let r = window.setTimeout(() => {
			let e = b.current;
			e.phase === "live" && !e.pendingResolution || (Rd() && zd("useTrickPresentation", "hand-end-drain-force", {
				phase: e.phase,
				pendingResolution: !!e.pendingResolution
			}), d({ type: "forceHandEndDrain" }));
		}, n);
		return () => window.clearTimeout(r);
	}, [
		S,
		x,
		u.phase,
		u.pendingResolution,
		u.revealedCount,
		c,
		e,
		i.length
	]);
	let E = u.phase === "live" ? Math.max(u.pendingResolution?.frozen.plays.length ?? 0, n?.plays?.length ?? 0, u.peakTrickPlays?.length ?? 0) : u.revealedCount;
	_.current = E;
	let D = () => {
		g.current != null && (window.clearTimeout(g.current), g.current = null);
	}, O = () => {
		if (!S && !h.current || u.phase !== "live") {
			D();
			return;
		}
		if (u.revealedCount >= _.current) {
			D();
			return;
		}
		if (g.current != null) return;
		let e = sp() ? 369 : 670;
		g.current = window.setTimeout(() => {
			g.current = null, Rd() && zd("useTrickPresentation", "revealNextCard-timer", {
				revealedCount: u.revealedCount,
				targetReveal: _.current
			}), d({ type: "revealNextCard" });
		}, e);
	};
	(0, l.useEffect)(() => (O(), D), [
		S,
		x,
		u.phase,
		u.revealedCount
	]), (0, l.useEffect)(() => {
		O();
	}, [E]), (0, l.useEffect)(() => {
		!S && !x || u.phase !== "live" || u.pendingResolution || u.revealedCount <= E || d({
			type: "clampRevealedCount",
			target: E
		});
	}, [
		S,
		x,
		u.phase,
		u.pendingResolution,
		E,
		u.revealedCount
	]);
	let k = Q_(u, n), A = (0, l.useCallback)(() => d({ type: "forceHandEndDrain" }), []), j = (0, l.useCallback)(() => d({ type: "clearHandEndEcho" }), []);
	return {
		...k,
		forceHandEndDrain: A,
		clearHandEndEcho: j
	};
}
//#endregion
//#region src/table/settlementCopy.ts
function tv(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function nv(e, t) {
	return e.map((e) => tv(e, t)).join(" & ");
}
function rv(e, t) {
	return Of(e, t) ? t.filter((t) => (e[t] ?? 0) === 0) : [];
}
function iv(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: a = {} } = e, o = jf(t, n), s = e.winnerIds?.length ? e.winnerIds : o.winnerIds, c = e.maxTricks ?? o.maxTricks, l = nv(s, r), u = rv(t, n), d = nv(u, r), f = Mf(i.maxWinThisHand), p = Mf(i.currentPot), m = i.carryIn > 0 ? Mf(i.carryIn) : null, h = `Pot this hand: ${p} (max win ${f})`;
	m && (h += ` — includes ${m} carried in`), i.limEnabled && i.overflow > 0 && (h += ` · LIM overflow ${Mf(i.overflow)} stays out of play`);
	let g = s.map((e) => {
		let n = t[e] ?? 0;
		return `${tv(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), _ = u.length > 0 ? `Bourré: ${d} took 0 tricks — each pays ${f} at settlement (seeds next deal)` : null, v = e.splitSharePerWinner, y = v > 0 && s.length >= 2 ? `If all co-winners agree to split: ${Mf(i.maxWinThisHand)} → ${Mf(v)} each` : null, b = s.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, x = `If any co-winner declines: full pot ${p} carries to the next hand · non-winners ante up`, S = s.map((e) => {
		let t = a[e], n = tv(e, r);
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
function av({ session: e, players: t, potMetrics: n, splitSharePerWinner: r, currentUserId: i, isCoWinner: a, manualContinueAllowed: o = !0, onSettle: s }) {
	let c = iv({
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
				children: c.headline
			}),
			/* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-sub",
				"data-testid": "settlement-subhead",
				children: c.subhead
			}),
			/* @__PURE__ */ (0, g.jsx)("ul", {
				className: "btable-session__settle-list",
				"data-testid": "settlement-winners",
				children: c.winnerLines.map((e) => /* @__PURE__ */ (0, g.jsx)("li", { children: e }, e))
			}),
			c.bourreLine && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-bourre",
				"data-testid": "settlement-bourre",
				children: c.bourreLine
			}),
			/* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-pot",
				"data-testid": "settlement-pot",
				children: c.potLine
			}),
			c.splitPreviewLine && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__split-preview",
				"data-testid": "settlement-split-preview",
				children: c.splitPreviewLine
			}),
			/* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-carry muted small",
				"data-testid": "settlement-carry-push",
				children: c.carryoverIfPushLine
			}),
			c.carryoverIfSplitLine && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-carry muted small",
				"data-testid": "settlement-carry-split",
				children: c.carryoverIfSplitLine
			}),
			/* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-rules muted small",
				"data-testid": "settlement-rules",
				children: c.rulesLine
			}),
			/* @__PURE__ */ (0, g.jsx)("ul", {
				className: "btable-session__settle-votes",
				"data-testid": "settlement-votes",
				children: c.voteLines.map((e) => /* @__PURE__ */ (0, g.jsx)("li", { children: e }, e))
			}),
			c.voterHint && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-hint",
				"data-testid": "settlement-voter-hint",
				children: c.voterHint
			}),
			c.observerHint && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-session__settle-hint muted small",
				"data-testid": "settlement-observer-hint",
				children: c.observerHint
			}),
			/* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btable-session__settle-btns",
				children: [/* @__PURE__ */ (0, g.jsx)("button", {
					type: "button",
					className: "btn btn--sm",
					disabled: !a || !o,
					"data-testid": "settlement-decline-btn",
					onClick: () => s("push"),
					children: "Decline split · push pot"
				}), /* @__PURE__ */ (0, g.jsxs)("button", {
					type: "button",
					className: "btn btn--sm btn--primary",
					disabled: !a || !o,
					"data-testid": "settlement-agree-btn",
					onClick: () => s("split"),
					children: [
						"Agree to split · ",
						Mf(r),
						" each"
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/table/tieResultTiming.ts
var ov = 3e3, sv = 6e3;
function cv(e = "") {
	let t = String(e).trim().length, n = ov + Math.min(t * 35, sv - ov);
	return Math.max(ov, Math.min(n, sv));
}
//#endregion
//#region src/table/SplitPotDecisionToast.tsx
function lv(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function uv({ session: e, players: t, splitSharePerWinner: n, currentUserId: r, isCoWinner: i, resultMessage: a = "", manualContinueAllowed: o = !0, onAgreeSplit: s, onDeclineSplit: c, onCarryover: u }) {
	let d = e.pendingCoWinSettlement?.winnerIds ?? [], f = e.pendingCoWinSettlement?.votes ?? {}, p = (0, l.useMemo)(() => cv(a || "Tie — split the pot?"), [a]), [m, h] = (0, l.useState)(p), [_, v] = (0, l.useState)(!1), y = (0, l.useRef)(null), b = (0, l.useRef)(!1), x = (0, l.useMemo)(() => `${d.join(",")}:${e.handNumber ?? 0}`, [d, e.handNumber]);
	(0, l.useEffect)(() => {
		y.current = Date.now(), b.current = !1, h(p), v(!1);
	}, [x, p]);
	let S = d.length >= 2 && d.every((e) => f[e] === "split"), C = (0, l.useCallback)(() => {
		b.current || (b.current = !0, u());
	}, [u]);
	if ((0, l.useEffect)(() => {
		if (d.length < 2) return;
		let e = window.setInterval(() => {
			let e = y.current ?? Date.now(), t = Date.now() - e, n = Math.max(0, p - t);
			h(n), n <= 0 && !S && C();
		}, 100);
		return () => window.clearInterval(e);
	}, [
		d.length,
		S,
		C,
		x,
		p
	]), (0, l.useEffect)(() => {
		S && (b.current = !0);
	}, [S]), d.length < 2) return null;
	let w = Math.max(0, Math.ceil(m / 1e3)), T = d.map((e) => lv(e, t)).join(" & "), E = o && !b.current, D = (e) => {
		!i || !E || (v(e), e ? s() : c());
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
				children: T
			}),
			/* @__PURE__ */ (0, g.jsxs)("p", {
				className: "btable-split-toast__share muted small",
				children: [Mf(n), " each if all agree"]
			}),
			i ? /* @__PURE__ */ (0, g.jsxs)("label", {
				className: "btable-split-toast__choice",
				children: [/* @__PURE__ */ (0, g.jsx)("input", {
					type: "checkbox",
					checked: _ || f[r ?? ""] === "split",
					disabled: !E,
					onChange: (e) => D(e.target.checked),
					"data-testid": "split-pot-agree"
				}), /* @__PURE__ */ (0, g.jsx)("span", { children: "Yes — split pot" })]
			}) : /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-split-toast__wait muted small",
				children: "Waiting for tied leaders…"
			}),
			/* @__PURE__ */ (0, g.jsxs)("p", {
				className: "btable-split-toast__timer muted small",
				"data-testid": "split-pot-timer",
				children: [w, "s — carryover if not all agree"]
			})
		]
	});
}
//#endregion
//#region src/table/useCoWinResultVisibility.ts
function dv(e, t, n) {
	let [r, i] = (0, l.useState)(!1), [a, o] = (0, l.useState)(!1), s = (0, l.useRef)(null), c = (0, l.useRef)(null), u = (0, l.useRef)(null), d = (0, l.useRef)(cv(n)), f = () => {
		c.current != null && (window.clearTimeout(c.current), c.current = null);
	};
	return (0, l.useEffect)(() => {
		if (f(), u.current !== t && (u.current = t, s.current = null, i(!1), o(!1), d.current = cv(n)), e) {
			if (s.current == null) {
				let e = Date.now();
				s.current = e, d.current = cv(n), i(!0), o(!1), Rd() && zd("tieResult", "shown", {
					proposalKey: t,
					durationMs: d.current,
					shownAt: e
				}), c.current = window.setTimeout(() => {
					o(!0), Rd() && zd("tieResult", "manual-continue-allowed", {
						proposalKey: t,
						elapsedMs: Date.now() - e
					});
				}, d.current);
			}
			return f;
		}
		if (!r || s.current == null) return f;
		let a = Date.now() - s.current, l = d.current - a;
		return l <= 0 ? (Rd() && zd("tieResult", "auto-hide", {
			proposalKey: t,
			elapsedMs: a,
			durationMs: d.current
		}), s.current = null, i(!1), o(!1), f) : (c.current = window.setTimeout(() => {
			Rd() && zd("tieResult", "auto-hide", {
				proposalKey: t,
				elapsedMs: Date.now() - (s.current ?? Date.now()),
				durationMs: d.current
			}), s.current = null, i(!1), o(!1), c.current = null;
		}, l), f);
	}, [
		e,
		r,
		t,
		n
	]), (0, l.useEffect)(() => () => f(), []), {
		visible: e || r,
		manualContinueAllowed: !e || a
	};
}
//#endregion
//#region src/table/heroHandDisplay.ts
function fv(e, t) {
	return t == null || e < t ? e : e + 1;
}
function pv(e, t) {
	return t == null ? e : e === t ? null : e > t ? e - 1 : e;
}
function mv(e, t) {
	return e.map((e) => fv(e, t));
}
function hv(e, t) {
	return e.map((e) => pv(e, t)).filter((e) => e != null).sort((e, t) => e - t);
}
function gv(e) {
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
var _v = [], vv = [], yv = [];
function bv({ session: e, players: t, potMetrics: n, mySessionNet: r, leaderLabel: i, showCoWinSettlement: a, splitPotEnabled: o = !1, rebuyEnabled: s = !1, splitSharePerWinner: c = 0, enrollmentActive: u = !1, currentUserId: d, heroCards: f = vv, rawHeroCards: p = vv, privateHandReady: m = !1, legalPlayIndices: h, recentBourreIds: _ = yv, handComplete: v = !1, actionFeedback: y, actions: b }) {
	let { settings: x } = _d(), S = wm(), [C, w] = (0, l.useState)(!1), T = e.participantIds.length, { events: E, dismissEvent: D, pushReaction: O } = Dg({
		session: e,
		potMetrics: n,
		participantIds: e.participantIds
	}), k = (0, l.useMemo)(() => [...E].reverse().find((e) => e.kind === "big-pot") ?? null, [E]), A = d != null && (e.pendingCoWinSettlement?.winnerIds || []).includes(d), j = ev({
		phase: e.phase,
		handNumber: e.handNumber,
		currentTrick: e.currentTrick,
		tricksByPlayer: e.tricksByPlayer,
		participantIds: e.participantIds,
		trumpSuit: e.trumpSuit,
		playedCards: e.playedCards,
		turnPlayerId: e.turnPlayerId,
		handComplete: v
	}), M = j.forceHandEndDrain, N = c_({
		session: e,
		enrollmentActive: u,
		potAmount: n.currentPot,
		handComplete: v,
		trickPipelineActive: j.isPipelineActive,
		forceTrickHandEndDrain: M,
		heroCards: f,
		enrolledIds: e.handEnrollment?.enrolledIds ?? _v,
		declinedIds: e.handEnrollment?.declinedIds ?? _v,
		actionOrder: e.actionOrder ?? e.handEnrollment?.orderedPlayerIds ?? e.participantIds
	}), ee = N.phase === "settle" || N.phase === "nextHandReset" || N.phase === "ante";
	(0, l.useEffect)(() => {
		ee && j.showFinalTrickEcho && j.clearHandEndEcho();
	}, [
		ee,
		j.showFinalTrickEcho,
		j.clearHandEndEcho
	]);
	let te = (0, l.useMemo)(() => {
		let t = e.pendingCoWinSettlement?.winnerIds ?? [];
		return `${e.handNumber}:${t.join(",")}`;
	}, [e.handNumber, e.pendingCoWinSettlement?.winnerIds]), P = (0, l.useMemo)(() => {
		if (!a) return "";
		let r = iv({
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
			splitSharePerWinner: c,
			currentUserId: d,
			winnerIds: e.pendingCoWinSettlement?.winnerIds
		});
		return [
			r.headline,
			r.subhead,
			r.potLine
		].filter(Boolean).join(" · ");
	}, [
		a,
		e.tricksByPlayer,
		e.participantIds,
		e.carryOverPot,
		e.pendingCoWinSettlement?.votes,
		e.pendingCoWinSettlement?.winnerIds,
		t,
		n.currentPot,
		n.maxWinThisHand,
		n.limEnabled,
		n.overflow,
		c,
		d
	]), { visible: F, manualContinueAllowed: I } = dv(a, te, P), L = V_(e.phase, e.trumpUpcard, j.displayPlays.length), R = Jd(N.isPresenting, N.phase, e.phase), [z, B] = (0, l.useState)(0);
	(0, l.useEffect)(() => Nd(() => B((e) => e + 1)), []), (0, l.useEffect)(() => {
		Qd({
			pipelineActive: j.isPipelineActive,
			revealCatchUp: j.phase === "live" && j.revealedCount < j.revealTarget,
			motionGateActive: L,
			peakPlayCount: j.peakPlayCount,
			displayedPlayCount: j.displayPlays.length,
			handPresenting: R,
			handPresentationPhase: N.phase,
			dealPresentationActive: Td(),
			antePresentationActive: Ad(),
			trickCollectionActive: Md()
		});
	}, [
		j.isPipelineActive,
		j.phase,
		j.revealedCount,
		j.revealTarget,
		j.peakPlayCount,
		j.displayPlays.length,
		L,
		R,
		N.phase,
		e.phase,
		z
	]);
	let V = Fs(e.phase), H = (0, l.useMemo)(() => ag({
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
	]), U = (0, l.useMemo)(() => gv({
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
	]), ne = U.displayCards, re = (0, l.useMemo)(() => !h?.length || U.indexMode === "effective" ? h : mv(h, U.trumpDisabledIndex), [
		h,
		U.indexMode,
		U.trumpDisabledIndex
	]), W = (0, l.useMemo)(() => {
		if (!h?.length || !f.length) return null;
		let t = Rc(f.map(Ms), {
			trumpSuit: e.trumpSuit ?? "clubs",
			currentTrick: e.currentTrick ?? null,
			leadSuit: e.leadSuit ?? null,
			cinchEnabled: e.cinchEnabled === !0
		}, h);
		return t == null ? null : U.indexMode === "effective" ? t : mv([t], U.trumpDisabledIndex)[0] ?? null;
	}, [
		h,
		f,
		e.trumpSuit,
		e.currentTrick,
		e.leadSuit,
		e.cinchEnabled,
		U.indexMode,
		U.trumpDisabledIndex
	]), ie = (0, l.useMemo)(() => {
		if (e.phase !== "draw" || !f.length) return [];
		let t = f.map(Ms), n = U.indexMode === "display" && U.trumpDisabledIndex != null ? hv([U.trumpDisabledIndex], U.trumpDisabledIndex) : U.trumpDisabledIndex == null ? [] : [U.trumpDisabledIndex], r = zc(t, e.trumpSuit ?? "clubs", e.maxDrawDiscards ?? 4, e.remainingDeckCount ?? Infinity, n);
		return U.indexMode === "effective" ? r : mv(r, U.trumpDisabledIndex);
	}, [
		e.phase,
		f,
		e.trumpSuit,
		e.maxDrawDiscards,
		e.remainingDeckCount,
		U.indexMode,
		U.trumpDisabledIndex
	]), G = j.suppressTurnPlayerId || N.suppressTurnIndicator, ae = Ns(e.phase, u), oe = G ? null : Rs(e.turnPlayerId, t), se = t.find((e) => e.isSelf), ce = d != null && e.participantIds.includes(d) && (e.phase === "draw" || e.phase === "play"), le = s && !e.isFinal && !ce && !F && se?.isOut === !0 && !!b.onRebuy, ue = rg({
		currentUserId: d,
		session: e,
		suppressTurn: !!G,
		handComplete: v,
		enrollmentActive: u,
		selfPlayer: se
	}), de = ng({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: se,
		session: e,
		suppressTurn: !!G,
		handComplete: v
	}), fe = ig({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: se,
		session: e,
		suppressTurn: !!G,
		handComplete: v
	}), pe = (0, l.useMemo)(() => {
		let t = bp(e.participantIds, e);
		return lc(e.dealerId, e.participantIds, t.length ? t : e.participantIds);
	}, [
		e.dealerId,
		e.participantIds,
		e
	]), { countdown: me } = v_({
		session: e,
		suppressTurn: !!G,
		handComplete: v,
		ante: N.anteAnimActive ? {
			anteAnimActive: !0,
			presentationKey: `${e.sessionId}:${e.handNumber}:ante`,
			handNumber: e.handNumber,
			playerIds: pe,
			reducedMotion: sp()
		} : null
	});
	j_({
		session: e,
		suppressTurn: !!G,
		handComplete: v,
		ante: N.anteAnimActive ? {
			anteAnimActive: !0,
			presentationKey: `${e.sessionId}:${e.handNumber}:ante`,
			handNumber: e.handNumber,
			playerIds: pe,
			reducedMotion: sp()
		} : null,
		currentUserId: d,
		localActionPending: y?.status === "loading"
	});
	let he = H.showTrumpSuitReminder || !e.trumpUpcard && !!e.trumpSuit && e.phase === "play", ge = (0, l.useMemo)(() => ({ ...j.displayTricksByPlayer }), [j.displayTricksByPlayer]), _e = (0, l.useMemo)(() => Object.fromEntries(t.map((e) => [e.playerId, Math.max(0, Number(e.bankroll) || 0)])), [t]), ve = M_({
		turnPlayerId: e.turnPlayerId ?? null,
		dealerId: e.dealerId,
		potAmount: N.displayPotAmount,
		tricksByPlayer: ge,
		bankrollByPlayer: _e,
		bourrePlayerIds: _ ?? [],
		phase: e.phase ?? null,
		showTrumpSuitReminder: he,
		suppressTurn: !!G,
		actionFeedbackStatus: y?.status ?? "idle",
		trickWinnerSeatId: j.trickWinnerSeatId,
		trickPhase: j.phase
	}), ye = !!se?.playerId && (_ ?? []).includes(se.playerId) && ve.bourreAlerts[se.playerId] === "pulse", be = (0, l.useRef)(0), xe = (0, l.useRef)(0);
	(0, l.useEffect)(() => {
		ve.feedbackErrorPulse > be.current && Yu(), be.current = ve.feedbackErrorPulse;
	}, [ve.feedbackErrorPulse]), (0, l.useEffect)(() => {
		ve.feedbackSuccessPulse > xe.current && td(), xe.current = ve.feedbackSuccessPulse;
	}, [ve.feedbackSuccessPulse]);
	let Se = (0, l.useCallback)((e) => {
		O(e, d ?? void 0);
	}, [O, d]), Ce = (0, l.useMemo)(() => ({
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
			let t = U.indexMode === "display" ? hv(e, U.trumpDisabledIndex) : e;
			return b.onSubmitDraw(t);
		},
		onPassDraw: b.onPassDraw,
		onFoldDraw: b.onFoldDraw,
		onPlayCard: (e) => {
			if (!b.onPlayCard) return;
			if (U.indexMode !== "display") return b.onPlayCard(e);
			let t = hv([e], U.trumpDisabledIndex)[0];
			if (t != null) return b.onPlayCard(t);
		},
		onReaction: Se
	}), [
		b,
		Se,
		t,
		U.indexMode,
		U.trumpDisabledIndex
	]), we = {
		session: e,
		players: t,
		potMetrics: n,
		participantCount: T,
		enrollmentActive: u,
		heroCards: ne,
		revealedTrumpIndex: U.revealedTrumpIndex,
		trumpMergeActive: U.trumpMergeActive,
		trumpDisabledIndex: U.trumpDisabledIndex,
		hideCenterTrump: U.hideCenterTrumpForHolder,
		showTrumpSuitReminder: he,
		trumpHolderPresentation: H,
		privateHandReady: m,
		currentUserId: d,
		legalPlayIndices: re,
		recommendedPlayIndex: W,
		recommendedDiscardIndices: ie,
		handComplete: v,
		actionFeedback: y,
		trickPresentation: j,
		handPresentation: N,
		microinteractions: ve,
		instantTrickPlays: L,
		turnCountdown: me,
		bigPotEvent: k,
		onDismissTableEvent: D,
		...Ce
	}, Te = /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
		/* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-session__attention-layer",
			"aria-live": "polite",
			children: /* @__PURE__ */ (0, g.jsx)(R_, {
				actionRequired: de,
				activityKey: fe
			})
		}),
		/* @__PURE__ */ (0, g.jsx)(N_, {
			active: ye,
			displayName: se?.displayName
		}),
		/* @__PURE__ */ (0, g.jsx)(xg, {
			events: E,
			onDismiss: D
		}),
		/* @__PURE__ */ (0, g.jsx)(vg, {
			events: E,
			onDismiss: D
		}),
		S ? /* @__PURE__ */ (0, g.jsx)(gg, { ...we }) : /* @__PURE__ */ (0, g.jsx)(cg, { ...we })
	] }), Ee = (0, l.useRef)(!1);
	return (0, l.useEffect)(() => {
		Ee.current = !1;
	}, [e.handNumber, e.sessionId]), (0, l.useEffect)(() => {
		if (e.phase !== "reveal" || N.anteAnimActive || N.trumpRevealActive || N.phase !== "drawPlayer" && N.phase !== "drawReady" || Ee.current || !b.onAdvanceReveal) return;
		let t = b.onAdvanceReveal();
		Promise.resolve(t).then(() => {
			Ee.current = !0;
		}, () => {
			Ee.current = !1;
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
			Ls(e.phase) ? "btable-session--reveal-phase" : "",
			Is(e.phase) ? "btable-session--decision-phase" : ""
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
					children: ae
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
			S ? /* @__PURE__ */ (0, g.jsx)(bg, { children: /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btable-stage",
				children: [/* @__PURE__ */ (0, g.jsx)(z_, {
					actionFeedback: y,
					feedbackErrorPulse: ve.feedbackErrorPulse,
					feedbackSuccessPulse: ve.feedbackSuccessPulse,
					turnLabel: oe,
					isMyTurn: ue,
					showTurn: !!(oe && V && j.phase === "live")
				}), Te]
			}) }) : /* @__PURE__ */ (0, g.jsx)(yg, { children: /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btable-stage",
				children: [/* @__PURE__ */ (0, g.jsx)(z_, {
					actionFeedback: y,
					feedbackErrorPulse: ve.feedbackErrorPulse,
					feedbackSuccessPulse: ve.feedbackSuccessPulse,
					turnLabel: oe,
					isMyTurn: ue,
					showTurn: !!(oe && V && j.phase === "live")
				}), Te]
			}) }),
			/* @__PURE__ */ (0, g.jsx)(Cg, {
				open: C,
				onClose: () => w(!1)
			}),
			F && !e.isFinal && o && /* @__PURE__ */ (0, g.jsx)(uv, {
				session: e,
				players: t,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: A,
				resultMessage: P,
				manualContinueAllowed: I,
				onAgreeSplit: () => b.onSettle("split"),
				onDeclineSplit: () => b.onSettle("push"),
				onCarryover: () => b.onSettleCarryover?.()
			}),
			F && !e.isFinal && !o && /* @__PURE__ */ (0, g.jsx)(av, {
				session: e,
				players: t,
				potMetrics: n,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: A,
				manualContinueAllowed: I,
				onSettle: (e) => b.onSettle(e)
			}),
			/* @__PURE__ */ (0, g.jsxs)("footer", {
				className: "btable-session__foot muted small",
				children: [
					/* @__PURE__ */ (0, g.jsx)(Sg, { compact: !0 }),
					le && /* @__PURE__ */ (0, g.jsxs)("div", {
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
					r == null ? /* @__PURE__ */ (0, g.jsx)(g.Fragment, { children: "Shared pot and game state only · sign in to track your ledger" }) : /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: ["Your session profit/loss ", Pf(r)] })
				]
			})
		]
	});
}
//#endregion
//#region src/table/mount.tsx
var xv = null, Sv = null;
function Cv(e, t) {
	Bu(), Ko(e), Sv !== e && (xv?.unmount(), xv = (0, u.createRoot)(e), Sv = e), xv.render(/* @__PURE__ */ (0, g.jsx)(gd, { children: /* @__PURE__ */ (0, g.jsx)(bv, { ...t }) }));
}
function wv() {
	Sv && (Sh(Sv), Mm(Sv)), xv?.unmount(), xv = null, Sv = null, $d(), Pd();
}
//#endregion
export { Mm as clearDrawFlyGhosts, Sh as clearWonTrickCollectionArtifacts, Xd as evaluateBotPresentationGate, Yd as forceReleasePresentationForBots, gl as getFeedbackPrefs, Kd as getTablePresentationBlockReason, ef as getTrickAnimationBusyState, Jd as handPresentingBlocksBots, Bu as initGameFeedback, nf as isTablePresentationBusy, Zd as isTablePresentationBusyForBots, tf as isTrickAnimationBusy, Cv as mountTableSession, Gu as playBigWinFeedback, Ku as playBourreFeedback, qu as playBourrePrivatePunishmentFeedback, Qu as playCardSelectFeedback, Zu as playDeleteRoomFeedback, Uu as playDrawFeedback, ed as playFoldFeedback, Ju as playGameStartFeedback, Xu as playOpenRoomFeedback, Vu as playShuffleFeedback, Wu as playTrickWinFeedback, $u as playUiButtonFeedback, _l as saveFeedbackPrefs, bl as subscribeFeedbackPrefs, rf as subscribeTrickAnimationBusy, wv as unmountTableSession };
