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
	var te = Array.isArray, P = r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, F = a.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ne = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, I = [], L = -1;
	function re(e) {
		return { current: e };
	}
	function R(e) {
		0 > L || (e.current = I[L], I[L] = null, L--);
	}
	function z(e, t) {
		L++, I[L] = e.current, e.current = t;
	}
	var ie = re(null), ae = re(null), B = re(null), oe = re(null);
	function V(e, t) {
		switch (z(B, t), z(ae, e), z(ie, null), t.nodeType) {
			case 9:
			case 11:
				e = (e = t.documentElement) && (e = e.namespaceURI) ? Vd(e) : 0;
				break;
			default: if (e = t.tagName, t = t.namespaceURI) t = Vd(t), e = Hd(t, e);
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
		R(ie), z(ie, e);
	}
	function se() {
		R(ie), R(ae), R(B);
	}
	function ce(e) {
		e.memoizedState !== null && z(oe, e);
		var t = ie.current, n = Hd(t, e.type);
		t !== n && (z(ae, e), z(ie, n));
	}
	function le(e) {
		ae.current === e && (R(ie), R(ae)), oe.current === e && (R(oe), Qf._currentValue = ne);
	}
	var ue, de;
	function fe(e) {
		if (ue === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			ue = t && t[1] || "", de = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + ue + e + de;
	}
	var pe = !1;
	function me(e, t) {
		if (!e || pe) return "";
		pe = !0;
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
			pe = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? fe(n) : "";
	}
	function he(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return fe(e.type);
			case 16: return fe("Lazy");
			case 13: return e.child !== t && t !== null ? fe("Suspense Fallback") : fe("Suspense");
			case 19: return fe("SuspenseList");
			case 0:
			case 15: return me(e.type, !1);
			case 11: return me(e.type.render, !1);
			case 1: return me(e.type, !0);
			case 31: return fe("Activity");
			default: return "";
		}
	}
	function ge(e) {
		try {
			var t = "", n = null;
			do
				t += he(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var H = Object.prototype.hasOwnProperty, _e = t.unstable_scheduleCallback, ve = t.unstable_cancelCallback, ye = t.unstable_shouldYield, be = t.unstable_requestPaint, xe = t.unstable_now, Se = t.unstable_getCurrentPriorityLevel, Ce = t.unstable_ImmediatePriority, we = t.unstable_UserBlockingPriority, Te = t.unstable_NormalPriority, Ee = t.unstable_LowPriority, De = t.unstable_IdlePriority, Oe = t.log, ke = t.unstable_setDisableYieldValue, Ae = null, je = null;
	function Me(e) {
		if (typeof Oe == "function" && ke(e), je && typeof je.setStrictMode == "function") try {
			je.setStrictMode(Ae, e);
		} catch {}
	}
	var Ne = Math.clz32 ? Math.clz32 : Ie, Pe = Math.log, Fe = Math.LN2;
	function Ie(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Pe(e) / Fe | 0) | 0;
	}
	var Le = 256, Re = 262144, ze = 4194304;
	function Be(e) {
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
	function Ve(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = Be(n))) : i = Be(o) : i = Be(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = Be(n))) : i = Be(o)) : i = Be(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function He(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function Ue(e, t) {
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
	function We() {
		var e = ze;
		return ze <<= 1, !(ze & 62914560) && (ze = 4194304), e;
	}
	function Ge(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function Ke(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function qe(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - Ne(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && Je(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function Je(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - Ne(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function Ye(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Ne(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function Xe(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : Ze(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function Ze(e) {
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
	function Qe(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function $e() {
		var e = F.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : mp(e.type)) : e;
	}
	function et(e, t) {
		var n = F.p;
		try {
			return F.p = e, t();
		} finally {
			F.p = n;
		}
	}
	var tt = Math.random().toString(36).slice(2), nt = "__reactFiber$" + tt, U = "__reactProps$" + tt, rt = "__reactContainer$" + tt, it = "__reactEvents$" + tt, at = "__reactListeners$" + tt, ot = "__reactHandles$" + tt, st = "__reactResources$" + tt, ct = "__reactMarker$" + tt;
	function lt(e) {
		delete e[nt], delete e[U], delete e[it], delete e[at], delete e[ot];
	}
	function ut(e) {
		var t = e[nt];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[rt] || n[nt]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = df(e); e !== null;) {
					if (n = e[nt]) return n;
					e = df(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function dt(e) {
		if (e = e[nt] || e[rt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function ft(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(s(33));
	}
	function pt(e) {
		var t = e[st];
		return t ||= e[st] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function mt(e) {
		e[ct] = !0;
	}
	var ht = /* @__PURE__ */ new Set(), gt = {};
	function _t(e, t) {
		vt(e, t), vt(e + "Capture", t);
	}
	function vt(e, t) {
		for (gt[e] = t, e = 0; e < t.length; e++) ht.add(t[e]);
	}
	var yt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), bt = {}, xt = {};
	function St(e) {
		return H.call(xt, e) ? !0 : H.call(bt, e) ? !1 : yt.test(e) ? xt[e] = !0 : (bt[e] = !0, !1);
	}
	function Ct(e, t, n) {
		if (St(t)) if (n === null) e.removeAttribute(t);
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
	function wt(e, t, n) {
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
	function Tt(e, t, n, r) {
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
	function Et(e) {
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
	function Dt(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function Ot(e, t, n) {
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
	function kt(e) {
		if (!e._valueTracker) {
			var t = Dt(e) ? "checked" : "value";
			e._valueTracker = Ot(e, t, "" + e[t]);
		}
	}
	function At(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = Dt(e) ? e.checked ? "true" : "false" : e.value), e = r, e === n ? !1 : (t.setValue(e), !0);
	}
	function jt(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	var Mt = /[\n"\\]/g;
	function Nt(e) {
		return e.replace(Mt, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function Pt(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Et(t)) : e.value !== "" + Et(t) && (e.value = "" + Et(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : It(e, o, Et(n)) : It(e, o, Et(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + Et(s) : e.removeAttribute("name");
	}
	function Ft(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				kt(e);
				return;
			}
			n = n == null ? "" : "" + Et(n), t = t == null ? n : "" + Et(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), kt(e);
	}
	function It(e, t, n) {
		t === "number" && jt(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
	}
	function Lt(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + Et(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function Rt(e, t, n) {
		if (t != null && (t = "" + Et(t), t !== e.value && (e.value = t), n == null)) {
			e.defaultValue !== t && (e.defaultValue = t);
			return;
		}
		e.defaultValue = n == null ? "" : "" + Et(n);
	}
	function zt(e, t, n, r) {
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
		n = Et(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), kt(e);
	}
	function Bt(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Vt = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function Ht(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || Vt.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function Ut(e, t, n) {
		if (t != null && typeof t != "object") throw Error(s(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
			for (var i in t) r = t[i], t.hasOwnProperty(i) && n[i] !== r && Ht(e, i, r);
		} else for (var a in t) t.hasOwnProperty(a) && Ht(e, a, t[a]);
	}
	function Wt(e) {
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
	var Gt = new Map([
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
	]), Kt = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function qt(e) {
		return Kt.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function Jt() {}
	var Yt = null;
	function Xt(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var Zt = null, Qt = null;
	function $t(e) {
		var t = dt(e);
		if (t && (e = t.stateNode)) {
			var n = e[U] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (Pt(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + Nt("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var i = r[U] || null;
								if (!i) throw Error(s(90));
								Pt(r, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && At(r);
					}
					break a;
				case "textarea":
					Rt(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && Lt(e, !!n.multiple, t, !1);
			}
		}
	}
	var en = !1;
	function tn(e, t, n) {
		if (en) return e(t, n);
		en = !0;
		try {
			return e(t);
		} finally {
			if (en = !1, (Zt !== null || Qt !== null) && (vu(), Zt && (t = Zt, e = Qt, Qt = Zt = null, $t(t), e))) for (t = 0; t < e.length; t++) $t(e[t]);
		}
	}
	function nn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[U] || null;
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
	var rn = !(typeof window > "u" || window.document === void 0 || window.document.createElement === void 0), an = !1;
	if (rn) try {
		var on = {};
		Object.defineProperty(on, "passive", { get: function() {
			an = !0;
		} }), window.addEventListener("test", on, on), window.removeEventListener("test", on, on);
	} catch {
		an = !1;
	}
	var sn = null, cn = null, ln = null;
	function un() {
		if (ln) return ln;
		var e, t = cn, n = t.length, r, i = "value" in sn ? sn.value : sn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return ln = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function dn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function fn() {
		return !0;
	}
	function pn() {
		return !1;
	}
	function mn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? fn : pn, this.isPropagationStopped = pn, this;
		}
		return h(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = fn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = fn);
			},
			persist: function() {},
			isPersistent: fn
		}), t;
	}
	var hn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, gn = mn(hn), _n = h({}, hn, {
		view: 0,
		detail: 0
	}), vn = mn(_n), yn, bn, xn, Sn = h({}, _n, {
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
		getModifierState: Mn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== xn && (xn && e.type === "mousemove" ? (yn = e.screenX - xn.screenX, bn = e.screenY - xn.screenY) : bn = yn = 0, xn = e), yn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : bn;
		}
	}), Cn = mn(Sn), wn = mn(h({}, Sn, { dataTransfer: 0 })), Tn = mn(h({}, _n, { relatedTarget: 0 })), En = mn(h({}, hn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Dn = mn(h({}, hn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), On = mn(h({}, hn, { data: 0 })), kn = {
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
	}, W = {
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
	}, An = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function jn(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = An[e]) ? !!t[e] : !1;
	}
	function Mn() {
		return jn;
	}
	var Nn = mn(h({}, _n, {
		key: function(e) {
			if (e.key) {
				var t = kn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = dn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? W[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: Mn,
		charCode: function(e) {
			return e.type === "keypress" ? dn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? dn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), Pn = mn(h({}, Sn, {
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
	})), Fn = mn(h({}, _n, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: Mn
	})), In = mn(h({}, hn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Ln = mn(h({}, Sn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), Rn = mn(h({}, hn, {
		newState: 0,
		oldState: 0
	})), zn = [
		9,
		13,
		27,
		32
	], Bn = rn && "CompositionEvent" in window, Vn = null;
	rn && "documentMode" in document && (Vn = document.documentMode);
	var Hn = rn && "TextEvent" in window && !Vn, Un = rn && (!Bn || Vn && 8 < Vn && 11 >= Vn), Wn = " ", Gn = !1;
	function Kn(e, t) {
		switch (e) {
			case "keyup": return zn.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function qn(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var Jn = !1;
	function Yn(e, t) {
		switch (e) {
			case "compositionend": return qn(t);
			case "keypress": return t.which === 32 ? (Gn = !0, Wn) : null;
			case "textInput": return e = t.data, e === Wn && Gn ? null : e;
			default: return null;
		}
	}
	function Xn(e, t) {
		if (Jn) return e === "compositionend" || !Bn && Kn(e, t) ? (e = un(), ln = cn = sn = null, Jn = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return Un && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var Zn = {
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
	function Qn(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!Zn[e.type] : t === "textarea";
	}
	function $n(e, t, n, r) {
		Zt ? Qt ? Qt.push(r) : Qt = [r] : Zt = r, t = Td(t, "onChange"), 0 < t.length && (n = new gn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var er = null, tr = null;
	function nr(e) {
		vd(e, 0);
	}
	function rr(e) {
		if (At(ft(e))) return e;
	}
	function ir(e, t) {
		if (e === "change") return t;
	}
	var ar = !1;
	if (rn) {
		var or;
		if (rn) {
			var sr = "oninput" in document;
			if (!sr) {
				var cr = document.createElement("div");
				cr.setAttribute("oninput", "return;"), sr = typeof cr.oninput == "function";
			}
			or = sr;
		} else or = !1;
		ar = or && (!document.documentMode || 9 < document.documentMode);
	}
	function lr() {
		er && (er.detachEvent("onpropertychange", ur), tr = er = null);
	}
	function ur(e) {
		if (e.propertyName === "value" && rr(tr)) {
			var t = [];
			$n(t, tr, e, Xt(e)), tn(nr, t);
		}
	}
	function dr(e, t, n) {
		e === "focusin" ? (lr(), er = t, tr = n, er.attachEvent("onpropertychange", ur)) : e === "focusout" && lr();
	}
	function fr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return rr(tr);
	}
	function pr(e, t) {
		if (e === "click") return rr(t);
	}
	function mr(e, t) {
		if (e === "input" || e === "change") return rr(t);
	}
	function hr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var gr = typeof Object.is == "function" ? Object.is : hr;
	function _r(e, t) {
		if (gr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!H.call(t, i) || !gr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function vr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function yr(e, t) {
		var n = vr(e);
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
			n = vr(n);
		}
	}
	function br(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? br(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function xr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = jt(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = jt(e.document);
		}
		return t;
	}
	function Sr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Cr = rn && "documentMode" in document && 11 >= document.documentMode, wr = null, Tr = null, Er = null, Dr = !1;
	function Or(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		Dr || wr == null || wr !== jt(r) || (r = wr, "selectionStart" in r && Sr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Er && _r(Er, r) || (Er = r, r = Td(Tr, "onSelect"), 0 < r.length && (t = new gn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = wr)));
	}
	function kr(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Ar = {
		animationend: kr("Animation", "AnimationEnd"),
		animationiteration: kr("Animation", "AnimationIteration"),
		animationstart: kr("Animation", "AnimationStart"),
		transitionrun: kr("Transition", "TransitionRun"),
		transitionstart: kr("Transition", "TransitionStart"),
		transitioncancel: kr("Transition", "TransitionCancel"),
		transitionend: kr("Transition", "TransitionEnd")
	}, jr = {}, Mr = {};
	rn && (Mr = document.createElement("div").style, "AnimationEvent" in window || (delete Ar.animationend.animation, delete Ar.animationiteration.animation, delete Ar.animationstart.animation), "TransitionEvent" in window || delete Ar.transitionend.transition);
	function Nr(e) {
		if (jr[e]) return jr[e];
		if (!Ar[e]) return e;
		var t = Ar[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in Mr) return jr[e] = t[n];
		return e;
	}
	var Pr = Nr("animationend"), Fr = Nr("animationiteration"), Ir = Nr("animationstart"), Lr = Nr("transitionrun"), Rr = Nr("transitionstart"), zr = Nr("transitioncancel"), Br = Nr("transitionend"), Vr = /* @__PURE__ */ new Map(), Hr = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	Hr.push("scrollEnd");
	function Ur(e, t) {
		Vr.set(e, t), _t(t, [e]);
	}
	var Wr = typeof reportError == "function" ? reportError : function(e) {
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
	}, Gr = [], Kr = 0, qr = 0;
	function Jr() {
		for (var e = Kr, t = qr = Kr = 0; t < e;) {
			var n = Gr[t];
			Gr[t++] = null;
			var r = Gr[t];
			Gr[t++] = null;
			var i = Gr[t];
			Gr[t++] = null;
			var a = Gr[t];
			if (Gr[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Qr(n, i, a);
		}
	}
	function Yr(e, t, n, r) {
		Gr[Kr++] = e, Gr[Kr++] = t, Gr[Kr++] = n, Gr[Kr++] = r, qr |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function Xr(e, t, n, r) {
		return Yr(e, t, n, r), $r(e);
	}
	function Zr(e, t) {
		return Yr(e, null, null, t), $r(e);
	}
	function Qr(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - Ne(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function $r(e) {
		if (50 < lu) throw lu = 0, uu = null, Error(s(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var ei = {};
	function ti(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function ni(e, t, n, r) {
		return new ti(e, t, n, r);
	}
	function ri(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function ii(e, t) {
		var n = e.alternate;
		return n === null ? (n = ni(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function ai(e, t) {
		e.flags &= 65011714;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function oi(e, t, n, r, i, a) {
		var o = 0;
		if (r = e, typeof e == "function") ri(e) && (o = 1);
		else if (typeof e == "string") o = Uf(e, n, ie.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (e) {
			case k: return e = ni(31, n, t, i), e.elementType = k, e.lanes = a, e;
			case y: return si(n.children, i, a, t);
			case b:
				o = 8, i |= 24;
				break;
			case x: return e = ni(12, n, t, i | 2), e.elementType = x, e.lanes = a, e;
			case T: return e = ni(13, n, t, i), e.elementType = T, e.lanes = a, e;
			case E: return e = ni(19, n, t, i), e.elementType = E, e.lanes = a, e;
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
		return t = ni(o, n, t, i), t.elementType = e, t.type = r, t.lanes = a, t;
	}
	function si(e, t, n, r) {
		return e = ni(7, e, r, t), e.lanes = n, e;
	}
	function ci(e, t, n) {
		return e = ni(6, e, null, t), e.lanes = n, e;
	}
	function li(e) {
		var t = ni(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function ui(e, t, n) {
		return t = ni(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var di = /* @__PURE__ */ new WeakMap();
	function fi(e, t) {
		if (typeof e == "object" && e) {
			var n = di.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: ge(t)
			}, di.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: ge(t)
		};
	}
	var pi = [], mi = 0, hi = null, gi = 0, _i = [], vi = 0, yi = null, bi = 1, xi = "";
	function Si(e, t) {
		pi[mi++] = gi, pi[mi++] = hi, hi = e, gi = t;
	}
	function Ci(e, t, n) {
		_i[vi++] = bi, _i[vi++] = xi, _i[vi++] = yi, yi = e;
		var r = bi;
		e = xi;
		var i = 32 - Ne(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Ne(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, bi = 1 << 32 - Ne(t) + i | n << i | r, xi = a + e;
		} else bi = 1 << a | n << i | r, xi = e;
	}
	function wi(e) {
		e.return !== null && (Si(e, 1), Ci(e, 1, 0));
	}
	function Ti(e) {
		for (; e === hi;) hi = pi[--mi], pi[mi] = null, gi = pi[--mi], pi[mi] = null;
		for (; e === yi;) yi = _i[--vi], _i[vi] = null, xi = _i[--vi], _i[vi] = null, bi = _i[--vi], _i[vi] = null;
	}
	function Ei(e, t) {
		_i[vi++] = bi, _i[vi++] = xi, _i[vi++] = yi, bi = t.id, xi = t.overflow, yi = e;
	}
	var Di = null, G = null, K = !1, Oi = null, ki = !1, Ai = Error(s(519));
	function ji(e) {
		throw Li(fi(Error(s(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), Ai;
	}
	function Mi(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[nt] = e, t[U] = r, n) {
			case "dialog":
				$("cancel", t), $("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				$("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < gd.length; n++) $(gd[n], t);
				break;
			case "source":
				$("error", t);
				break;
			case "img":
			case "image":
			case "link":
				$("error", t), $("load", t);
				break;
			case "details":
				$("toggle", t);
				break;
			case "input":
				$("invalid", t), Ft(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				$("invalid", t);
				break;
			case "textarea": $("invalid", t), zt(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || jd(t.textContent, n) ? (r.popover != null && ($("beforetoggle", t), $("toggle", t)), r.onScroll != null && $("scroll", t), r.onScrollEnd != null && $("scrollend", t), r.onClick != null && (t.onclick = Jt), t = !0) : t = !1, t || ji(e, !0);
	}
	function Ni(e) {
		for (Di = e.return; Di;) switch (Di.tag) {
			case 5:
			case 31:
			case 13:
				ki = !1;
				return;
			case 27:
			case 3:
				ki = !0;
				return;
			default: Di = Di.return;
		}
	}
	function Pi(e) {
		if (e !== Di) return !1;
		if (!K) return Ni(e), K = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || Ud(e.type, e.memoizedProps)), n = !n), n && G && ji(e), Ni(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			G = uf(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			G = uf(e);
		} else t === 27 ? (t = G, Zd(e.type) ? (e = lf, lf = null, G = e) : G = t) : G = Di ? cf(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Fi() {
		G = Di = null, K = !1;
	}
	function Ii() {
		var e = Oi;
		return e !== null && (Yl === null ? Yl = e : Yl.push.apply(Yl, e), Oi = null), e;
	}
	function Li(e) {
		Oi === null ? Oi = [e] : Oi.push(e);
	}
	var Ri = re(null), zi = null, Bi = null;
	function Vi(e, t, n) {
		z(Ri, t._currentValue), t._currentValue = n;
	}
	function Hi(e) {
		e._currentValue = Ri.current, R(Ri);
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
					gr(i.pendingProps.value, o.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (i === oe.current) {
				if (o = i.alternate, o === null) throw Error(s(387));
				o.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [Qf] : e.push(Qf));
			}
			i = i.return;
		}
		e !== null && Wi(t, e, n, r), t.flags |= 262144;
	}
	function Ki(e) {
		for (e = e.firstContext; e !== null;) {
			if (!gr(e.context._currentValue, e.memoizedValue)) return !0;
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
	}, Qi = t.unstable_scheduleCallback, $i = t.unstable_NormalPriority, ea = {
		$$typeof: C,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function ta() {
		return {
			controller: new Zi(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function na(e) {
		e.refCount--, e.refCount === 0 && Qi($i, function() {
			e.controller.abort();
		});
	}
	var ra = null, ia = 0, aa = 0, oa = null;
	function sa(e, t) {
		if (ra === null) {
			var n = ra = [];
			ia = 0, aa = ud(), oa = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return ia++, t.then(ca, ca), t;
	}
	function ca() {
		if (--ia === 0 && ra !== null) {
			oa !== null && (oa.status = "fulfilled");
			var e = ra;
			ra = null, aa = 0, oa = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function la(e, t) {
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
	var ua = P.S;
	P.S = function(e, t) {
		Ql = xe(), typeof t == "object" && t && typeof t.then == "function" && sa(e, t), ua !== null && ua(e, t);
	};
	var da = re(null);
	function fa() {
		var e = da.current;
		return e === null ? Fl.pooledCache : e;
	}
	function pa(e, t) {
		t === null ? z(da, da.current) : z(da, t.pool);
	}
	function ma() {
		var e = fa();
		return e === null ? null : {
			parent: ea._currentValue,
			pool: e
		};
	}
	var ha = Error(s(460)), ga = Error(s(474)), _a = Error(s(542)), va = { then: function() {} };
	function ya(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function ba(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Jt, Jt), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Ca(e), e;
			default:
				if (typeof t.status == "string") t.then(Jt, Jt);
				else {
					if (e = Fl, e !== null && 100 < e.shellSuspendCounter) throw Error(s(482));
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
				throw q = t, ha;
		}
	}
	function xa(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (q = e, ha) : e;
		}
	}
	var q = null;
	function Sa() {
		if (q === null) throw Error(s(459));
		var e = q;
		return q = null, e;
	}
	function Ca(e) {
		if (e === ha || e === _a) throw Error(s(483));
	}
	var wa = null, Ta = 0;
	function Ea(e) {
		var t = Ta;
		return Ta += 1, wa === null && (wa = []), ba(wa, e, t);
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
			return e = ii(e, t), e.index = 0, e.sibling = null, e;
		}
		function a(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 67108866, n) : (r = r.index, r < n ? (t.flags |= 67108866, n) : r)) : (t.flags |= 1048576, n);
		}
		function o(t) {
			return e && t.alternate === null && (t.flags |= 67108866), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = ci(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === y ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === O && xa(a) === t.type) ? (t = i(t, n.props), Da(t, n), t.return = e, t) : (t = oi(n.type, n.key, n.props, null, e.mode, r), Da(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = ui(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = si(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = ci("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case _: return n = oi(t.type, t.key, t.props, null, e.mode, n), Da(n, t), n.return = e, n;
					case v: return t = ui(t, e.mode, n), t.return = e, t;
					case O: return t = xa(t), f(e, t, n);
				}
				if (te(t) || M(t)) return t = si(t, e.mode, n, null), t.return = e, t;
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
					case O: return n = xa(n), p(e, t, n, r);
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
					case O: return r = xa(r), m(e, t, n, r, i);
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
			if (h === s.length) return n(i, d), K && Si(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return K && Si(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), K && Si(i, h), l;
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
			if (v.done) return n(i, h), K && Si(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
				return K && Si(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), K && Si(i, g), u;
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
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === O && xa(l) === r.type) {
										n(e, r.sibling), c = i(r, a.props), Da(c, a), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								} else t(e, r);
								r = r.sibling;
							}
							a.type === y ? (c = si(a.props.children, e.mode, c, a.key), c.return = e, e = c) : (c = oi(a.type, a.key, a.props, null, e.mode, c), Da(c, a), c.return = e, e = c);
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
							c = ui(a, e.mode, c), c.return = e, e = c;
						}
						return o(e);
					case O: return a = xa(a), b(e, r, a, c);
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
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), c = i(r, a), c.return = e, e = c) : (n(e, r), c = ci(a, e.mode, c), c.return = e, e = c), o(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				Ta = 0;
				var i = b(e, t, n, r);
				return wa = null, i;
			} catch (t) {
				if (t === ha || t === _a) throw t;
				var a = ni(29, t, null, e.mode);
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
		if (r = r.shared, Pl & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = $r(e), Qr(e, null, n), t;
		}
		return Yr(e, r, t, n), $r(e);
	}
	function La(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Ye(e, n);
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
			var e = oa;
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
				if (p ? (Q & f) === f : (r & f) === f) {
					f !== 0 && f === aa && (za = !0), u !== null && (u = u.next = {
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
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), Ul |= o, e.lanes = o, e.memoizedState = d;
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
	var Wa = re(null), Ga = re(0);
	function Ka(e, t) {
		e = Vl, z(Ga, e), z(Wa, t), Vl = e | t.baseLanes;
	}
	function qa() {
		z(Ga, Vl), z(Wa, Wa.current);
	}
	function Ja() {
		Vl = Ga.current, R(Wa), R(Ga);
	}
	var Ya = re(null), Xa = null;
	function Za(e) {
		var t = e.alternate;
		z(J, J.current & 1), z(Ya, e), Xa === null && (t === null || Wa.current !== null || t.memoizedState !== null) && (Xa = e);
	}
	function Qa(e) {
		z(J, J.current), z(Ya, e), Xa === null && (Xa = e);
	}
	function $a(e) {
		e.tag === 22 ? (z(J, J.current), z(Ya, e), Xa === null && (Xa = e)) : eo(e);
	}
	function eo() {
		z(J, J.current), z(Ya, Ya.current);
	}
	function to(e) {
		R(Ya), Xa === e && (Xa = null), R(J);
	}
	var J = re(0);
	function no(e) {
		for (var t = e; t !== null;) {
			if (t.tag === 13) {
				var n = t.memoizedState;
				if (n !== null && (n = n.dehydrated, n === null || af(n) || of(n))) return t;
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
		for (var n = 0; n < t.length && n < e.length; n++) if (!gr(e[n], t[n])) return !1;
		return !0;
	}
	function go(e, t, n, r, i, a) {
		return ro = a, Y = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, P.H = e === null || e.memoizedState === null ? Ns : Ps, co = !1, a = n(r, i), co = !1, so && (a = vo(t, n, r, i)), _o(e), a;
	}
	function _o(e) {
		P.H = Ms;
		var t = io !== null && io.next !== null;
		if (ro = 0, ao = io = Y = null, oo = !1, uo = 0, fo = null, t) throw Error(s(300));
		e === null || Zs || (e = e.dependencies, e !== null && Ki(e) && (Zs = !0));
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
		return uo += 1, fo === null && (fo = []), e = ba(fo, e, t), t = Y, (ao === null ? t.memoizedState : ao.next) === null && (t = t.alternate, P.H = t === null || t.memoizedState === null ? Ns : Ps), e;
	}
	function Do(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return Eo(e);
			if (e.$$typeof === C) return Ji(e);
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
				if (f === u.lane ? (ro & f) === f : (Q & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === aa && (d = !0);
					else if ((ro & p) === p) {
						u = u.next, p === aa && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, o = a) : l = l.next = f, Y.lanes |= p, Ul |= p;
					f = u.action, co && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, o = a) : l = l.next = p, Y.lanes |= f, Ul |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? o = a : l.next = c, !gr(a, e.memoizedState) && (Zs = !0, d && (n = oa, n !== null))) throw n;
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
			gr(a, t.memoizedState) || (Zs = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function No(e, t, n) {
		var r = Y, i = wo(), a = K;
		if (a) {
			if (n === void 0) throw Error(s(407));
			n = n();
		} else n = t();
		var o = !gr((io || i).memoizedState, n);
		if (o && (i.memoizedState = n, Zs = !0), i = i.queue, is(Io.bind(null, r, i, e), [e]), i.getSnapshot !== t || o || ao !== null && ao.memoizedState.tag & 1) {
			if (r.flags |= 2048, $o(9, { destroy: void 0 }, Fo.bind(null, r, i, n, t), null), Fl === null) throw Error(s(349));
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
			return !gr(e, n);
		} catch {
			return !0;
		}
	}
	function Ro(e) {
		var t = Zr(e, 2);
		t !== null && pu(t, e, 2);
	}
	function zo(e) {
		var t = Co();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), co) {
				Me(!0);
				try {
					n();
				} finally {
					Me(!1);
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
		if (K) {
			var n = Fl.formState;
			if (n !== null) {
				a: {
					var r = Y;
					if (K) {
						if (G) {
							b: {
								for (var i = G, a = ki; i.nodeType !== 8;) {
									if (!a) {
										i = null;
										break b;
									}
									if (i = cf(i.nextSibling), i === null) {
										i = null;
										break b;
									}
								}
								a = i.data, i = a === "F!" || a === "F" ? i : null;
							}
							if (i) {
								G = cf(i.nextSibling), r = i.data === "F!";
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
			throw e === ha ? _a : e;
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
			if (Pl & 2) throw Error(s(440));
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
			Me(!0);
			try {
				e();
			} finally {
				Me(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function ms(e, t, n) {
		return n === void 0 || ro & 1073741824 && !(Q & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = fu(), Y.lanes |= e, Ul |= e, n);
	}
	function hs(e, t, n, r) {
		return gr(n, t) ? n : Wa.current === null ? !(ro & 42) || ro & 1073741824 && !(Q & 261930) ? (Zs = !0, e.memoizedState = n) : (e = fu(), Y.lanes |= e, Ul |= e, t) : (e = ms(e, n, r), gr(e, t) || (Zs = !0), e);
	}
	function gs(e, t, n, r, i) {
		var a = F.p;
		F.p = a !== 0 && 8 > a ? a : 8;
		var o = P.T, s = {};
		P.T = s, Os(e, !1, t, n);
		try {
			var c = i(), l = P.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? Ds(e, t, la(c, r), du(e)) : Ds(e, t, r, du(e));
		} catch (n) {
			Ds(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, du());
		} finally {
			F.p = a, o !== null && s.types !== null && (o.types = s.types), P.T = o;
		}
	}
	function _s() {}
	function vs(e, t, n, r) {
		if (e.tag !== 5) throw Error(s(476));
		var i = ys(e).queue;
		gs(e, i, t, ne, n === null ? _s : function() {
			return bs(e), n(r);
		});
	}
	function ys(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: ne,
			baseState: ne,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ko,
				lastRenderedState: ne
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
		t.next === null && (t = e.alternate.memoizedState), Ds(e, t.next.queue, {}, du());
	}
	function xs() {
		return Ji(Qf);
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
					var n = du();
					e = Fa(n);
					var r = Ia(t, e, n);
					r !== null && (pu(r, t, n), La(r, t, n)), t = { cache: ta() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function Ts(e, t, n) {
		var r = du();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, ks(e) ? As(t, n) : (n = Xr(e, t, n, r), n !== null && (pu(n, e, r), js(n, t, r)));
	}
	function Es(e, t, n) {
		Ds(e, t, n, du());
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
				if (i.hasEagerState = !0, i.eagerState = s, gr(s, o)) return Yr(e, t, i, 0), Fl === null && Jr(), !1;
			} catch {}
			if (n = Xr(e, t, i, r), n !== null) return pu(n, e, r), js(n, t, r), !0;
		}
		return !1;
	}
	function Os(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: ud(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, ks(e)) {
			if (t) throw Error(s(479));
		} else t = Xr(e, n, r, 2), t !== null && pu(t, e, 2);
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
			r &= e.pendingLanes, n |= r, t.lanes = n, Ye(e, n);
		}
	}
	var Ms = {
		readContext: Ji,
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
		readContext: Ji,
		use: Do,
		useCallback: function(e, t) {
			return Co().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Ji,
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
				Me(!0);
				try {
					e();
				} finally {
					Me(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = Co();
			if (n !== void 0) {
				var i = n(t);
				if (co) {
					Me(!0);
					try {
						n(t);
					} finally {
						Me(!1);
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
			if (K) {
				if (n === void 0) throw Error(s(407));
				n = n();
			} else {
				if (n = t(), Fl === null) throw Error(s(349));
				Q & 127 || Po(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, rs(Io.bind(null, r, a, e), [e]), r.flags |= 2048, $o(9, { destroy: void 0 }, Fo.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = Co(), t = Fl.identifierPrefix;
			if (K) {
				var n = xi, r = bi;
				n = (r & ~(1 << 32 - Ne(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = lo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
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
				if (Pl & 2) throw Error(s(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, Ps = {
		readContext: Ji,
		use: Do,
		useCallback: fs,
		useContext: Ji,
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
		readContext: Ji,
		use: Do,
		useCallback: fs,
		useContext: Ji,
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
			var r = du(), i = Fa(r);
			i.payload = t, n != null && (i.callback = n), t = Ia(e, i, r), t !== null && (pu(t, e, r), La(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = du(), i = Fa(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = Ia(e, i, r), t !== null && (pu(t, e, r), La(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = du(), r = Fa(n);
			r.tag = 2, t != null && (r.callback = t), t = Ia(e, r, n), t !== null && (pu(t, e, n), La(t, e, n));
		}
	};
	function Rs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !_r(n, r) || !_r(i, a) : !0;
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
		Wr(e);
	}
	function Hs(e) {
		console.error(e);
	}
	function Us(e) {
		Wr(e);
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
			Gs(t, n, r), typeof i != "function" && (tu === null ? tu = new Set([this]) : tu.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Ys(e, t, n, r, i) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Gi(t, n, i, !0), n = Ya.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return Xa === null ? Tu() : n.alternate === null && Hl === 0 && (Hl = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === va ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = new Set([r]) : t.add(r), Wu(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === va ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = new Set([r]) : n.add(r)), Wu(e, r, i)), !1;
				}
				throw Error(s(435, n.tag));
			}
			return Wu(e, r, i), Tu(), !1;
		}
		if (K) return t = Ya.current, t === null ? (r !== Ai && (t = Error(s(423), { cause: r }), Li(fi(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = fi(r, n), i = Ks(e.stateNode, r, i), Ra(e, i), Hl !== 4 && (Hl = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== Ai && (e = Error(s(422), { cause: r }), Li(fi(e, n)))), !1;
		var a = Error(s(520), { cause: r });
		if (a = fi(a, n), Jl === null ? Jl = [a] : Jl.push(a), Hl !== 4 && (Hl = 2), t === null) return !0;
		r = fi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = Ks(n.stateNode, r, e), Ra(n, e), !1;
				case 1: if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (tu === null || !tu.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = qs(i), Js(i, e, n, r), Ra(n, i), !1;
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
		return qi(t), r = go(e, t, n, o, a, i), s = bo(), e !== null && !Zs ? (xo(e, t, i), Cc(e, t, i)) : (K && s && wi(t), t.flags |= 1, Qs(e, t, r, i), t.child);
	}
	function ec(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ri(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, tc(e, t, a, r, i)) : (e = oi(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !wc(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? _r : n, n(o, r) && e.ref === t.ref) return Cc(e, t, i);
		}
		return t.flags |= 1, e = ii(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function tc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (_r(a, r) && e.ref === t.ref) if (Zs = !1, t.pendingProps = r = a, wc(e, i)) e.flags & 131072 && (Zs = !0);
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
			}, e !== null && pa(t, a === null ? null : a.cachePool), a === null ? qa() : Ka(t, a), $a(t);
			else return r = t.lanes = 536870912, ic(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && pa(t, null), qa(), eo(t)) : (pa(t, a.cachePool), Ka(t, a), eo(t), t.memoizedState = null);
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
		var a = fa();
		return a = a === null ? null : {
			parent: ea._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && pa(t, null), qa(), $a(t), e !== null && Gi(e, t, r, !0), t.childLanes = i, null;
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
			if (K) {
				if (r.mode === "hidden") return e = ac(t, r), t.lanes = 536870912, rc(null, e);
				if (Qa(t), (e = G) ? (e = rf(e, ki), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: yi === null ? null : {
						id: bi,
						overflow: xi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = li(e), n.return = t, t.child = n, Di = t, G = null)) : e = null, e === null) throw ji(t);
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
				if (r = Fl, r !== null && (o = Xe(r, n), o !== 0 && o !== a.retryLane)) throw a.retryLane = o, Zr(e, o), pu(r, e, o), Xs;
				Tu(), t = oc(e, t, n);
			} else e = a.treeContext, G = cf(o.nextSibling), Di = t, K = !0, Oi = null, ki = !1, e !== null && Ei(t, e), t = ac(t, r), t.flags |= 4096;
			return t;
		}
		return e = ii(e.child, {
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
		return qi(t), n = go(e, t, n, r, void 0, i), r = bo(), e !== null && !Zs ? (xo(e, t, i), Cc(e, t, i)) : (K && r && wi(t), t.flags |= 1, Qs(e, t, n, i), t.child);
	}
	function uc(e, t, n, r, i, a) {
		return qi(t), t.updateQueue = null, n = vo(t, r, n, i), _o(e), r = bo(), e !== null && !Zs ? (xo(e, t, a), Cc(e, t, a)) : (K && r && wi(t), t.flags |= 1, Qs(e, t, n, a), t.child);
	}
	function dc(e, t, n, r, i) {
		if (qi(t), t.stateNode === null) {
			var a = ei, o = n.contextType;
			typeof o == "object" && o && (a = Ji(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Ls, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Na(t), o = n.contextType, a.context = typeof o == "object" && o ? Ji(o) : ei, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Is(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Ls.enqueueReplaceState(a, a.state, null), Va(t, r, a, i), Ba(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Bs(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = ei, typeof u == "object" && u && (o = Ji(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && zs(t, a, r, o), Ma = !1;
			var f = t.memoizedState;
			a.state = f, Va(t, r, a, i), Ba(), l = t.memoizedState, s || f !== l || Ma ? (typeof d == "function" && (Is(t, n, d, r), l = t.memoizedState), (c = Ma || Rs(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Pa(e, t), o = t.memoizedProps, u = Bs(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = ei, typeof l == "object" && l && (c = Ji(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && zs(t, a, r, c), Ma = !1, f = t.memoizedState, a.state = f, Va(t, r, a, i), Ba();
			var p = t.memoizedState;
			o !== d || f !== p || Ma || e !== null && e.dependencies !== null && Ki(e.dependencies) ? (typeof s == "function" && (Is(t, n, s, r), p = t.memoizedState), (u = Ma || Rs(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Ki(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
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
			cachePool: ma()
		};
	}
	function hc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= Kl), e;
	}
	function gc(e, t, n) {
		var r = t.pendingProps, i = !1, a = (t.flags & 128) != 0, o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : (J.current & 2) != 0), o && (i = !0, t.flags &= -129), o = (t.flags & 32) != 0, t.flags &= -33, e === null) {
			if (K) {
				if (i ? Za(t) : eo(t), (e = G) ? (e = rf(e, ki), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: yi === null ? null : {
						id: bi,
						overflow: xi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = li(e), n.return = t, t.child = n, Di = t, G = null)) : e = null, e === null) throw ji(t);
				return of(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var c = r.children;
			return r = r.fallback, i ? (eo(t), i = t.mode, c = vc({
				mode: "hidden",
				children: c
			}, i), r = si(r, i, n, null), c.return = t, r.return = t, c.sibling = r, t.child = c, r = t.child, r.memoizedState = mc(n), r.childLanes = hc(e, o, n), t.memoizedState = pc, rc(null, r)) : (Za(t), _c(t, c));
		}
		var l = e.memoizedState;
		if (l !== null && (c = l.dehydrated, c !== null)) {
			if (a) t.flags & 256 ? (Za(t), t.flags &= -257, t = yc(e, t, n)) : t.memoizedState === null ? (eo(t), c = r.fallback, i = t.mode, r = vc({
				mode: "visible",
				children: r.children
			}, i), c = si(c, i, n, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, Aa(t, e.child, null, n), r = t.child, r.memoizedState = mc(n), r.childLanes = hc(e, o, n), t.memoizedState = pc, t = rc(null, r)) : (eo(t), t.child = e.child, t.flags |= 128, t = null);
			else if (Za(t), of(c)) {
				if (o = c.nextSibling && c.nextSibling.dataset, o) var u = o.dgst;
				o = u, r = Error(s(419)), r.stack = "", r.digest = o, Li({
					value: r,
					source: null,
					stack: null
				}), t = yc(e, t, n);
			} else if (Zs || Gi(e, t, n, !1), o = (n & e.childLanes) !== 0, Zs || o) {
				if (o = Fl, o !== null && (r = Xe(o, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, Zr(e, r), pu(o, e, r), Xs;
				af(c) || Tu(), t = yc(e, t, n);
			} else af(c) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, G = cf(c.nextSibling), Di = t, K = !0, Oi = null, ki = !1, e !== null && Ei(t, e), t = _c(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? (eo(t), c = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = ii(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (c = si(c, i, n, null), c.flags |= 2) : c = ii(u, c), c.return = t, r.return = t, r.sibling = c, t.child = r, rc(null, r), r = t.child, c = e.child.memoizedState, c === null ? c = mc(n) : (i = c.cachePool, i === null ? i = ma() : (l = ea._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), c = {
			baseLanes: c.baseLanes | n,
			cachePool: i
		}), r.memoizedState = c, r.childLanes = hc(e, o, n), t.memoizedState = pc, rc(e.child, r)) : (Za(t), n = e.child, e = n.sibling, n = ii(n, {
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
		return e = ni(22, e, null, t), e.lanes = 0, e;
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
		var o = J.current, s = (o & 2) != 0;
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, z(J, o), Qs(e, t, r, n), r = K ? gi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
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
		if (e !== null && (t.dependencies = e.dependencies), Ul |= t.lanes, (n & t.childLanes) === 0) if (e !== null) {
			if (Gi(e, t, n, !1), (n & t.childLanes) === 0) return null;
		} else return null;
		if (e !== null && t.child !== e.child) throw Error(s(153));
		if (t.child !== null) {
			for (e = t.child, n = ii(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ii(e, e.pendingProps), n.return = t;
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
				V(t, t.stateNode.containerInfo), Vi(t, ea, e.memoizedState.cache), Fi();
				break;
			case 27:
			case 5:
				ce(t);
				break;
			case 4:
				V(t, t.stateNode.containerInfo);
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
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), z(J, J.current), r) break;
				return null;
			case 22: return t.lanes = 0, nc(e, t, n, t.pendingProps);
			case 24: Vi(t, ea, e.memoizedState.cache);
		}
		return Cc(e, t, n);
	}
	function Ec(e, t, n) {
		if (e !== null) if (e.memoizedProps !== t.pendingProps) Zs = !0;
		else {
			if (!wc(e, n) && !(t.flags & 128)) return Zs = !1, Tc(e, t, n);
			Zs = !!(e.flags & 131072);
		}
		else Zs = !1, K && t.flags & 1048576 && Ci(t, gi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = xa(t.elementType), t.type = e, typeof e == "function") ri(e) ? (r = Bs(e, r), t.tag = 1, t = dc(null, t, e, r, n)) : (t.tag = 0, t = lc(null, t, e, r, n));
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
					if (V(t, t.stateNode.containerInfo), e === null) throw Error(s(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, Pa(e, t), Va(t, r, null, n);
					var o = t.memoizedState;
					if (r = o.cache, Vi(t, ea, r), r !== a.cache && Wi(t, [ea], n, !0), Ba(), r = o.element, a.isDehydrated) if (a = {
						element: r,
						isDehydrated: !1,
						cache: o.cache
					}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
						t = fc(e, t, r, n);
						break a;
					} else if (r !== i) {
						i = fi(Error(s(424)), t), Li(i), t = fc(e, t, r, n);
						break a;
					} else {
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (G = cf(e.firstChild), Di = t, K = !0, Oi = null, ki = !0, n = ja(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
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
			case 26: return cc(e, t), e === null ? (n = kf(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : K || (n = t.type, e = t.pendingProps, r = Bd(B.current).createElement(n), r[nt] = t, r[U] = e, Pd(r, n, e), mt(r), t.stateNode = r) : t.memoizedState = kf(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return ce(t), e === null && K && (r = t.stateNode = ff(t.type, t.pendingProps, B.current), Di = t, ki = !0, i = G, Zd(t.type) ? (lf = i, G = cf(r.firstChild)) : G = i), Qs(e, t, t.pendingProps.children, n), cc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && K && ((i = r = G) && (r = tf(r, t.type, t.pendingProps, ki), r === null ? i = !1 : (t.stateNode = r, Di = t, G = cf(r.firstChild), ki = !1, i = !0)), i || ji(t)), ce(t), i = t.type, a = t.pendingProps, o = e === null ? null : e.memoizedProps, r = a.children, Ud(i, a) ? r = null : o !== null && Ud(i, o) && (t.flags |= 32), t.memoizedState !== null && (i = go(e, t, yo, null, null, n), Qf._currentValue = i), cc(e, t), Qs(e, t, r, n), t.child;
			case 6: return e === null && K && ((e = n = G) && (n = nf(n, t.pendingProps, ki), n === null ? e = !1 : (t.stateNode = n, Di = t, G = null, e = !0)), e || ji(t)), null;
			case 13: return gc(e, t, n);
			case 4: return V(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Aa(t, null, r, n) : Qs(e, t, r, n), t.child;
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
			case 24: return qi(t), r = Ji(ea), e === null ? (i = fa(), i === null && (i = Fl, a = ta(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, Na(t), Vi(t, ea, i)) : ((e.lanes & n) !== 0 && (Pa(e, t), Va(t, null, null, n), Ba()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, Vi(t, ea, r), r !== i.cache && Wi(t, [ea], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), Vi(t, ea, r))), Qs(e, t, t.pendingProps.children, n), t.child;
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
			else if (Su()) e.flags |= 8192;
			else throw q = va, ga;
		} else e.flags &= -16777217;
	}
	function kc(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Wf(t)) if (Su()) e.flags |= 8192;
		else throw q = va, ga;
	}
	function Ac(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : We(), e.lanes |= t, ql |= t);
	}
	function jc(e, t) {
		if (!K) switch (e.tailMode) {
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
		switch (Ti(t), t.tag) {
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
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Hi(ea), se(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Pi(t) ? Dc(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Ii())), Mc(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (Dc(t), a === null ? (Mc(t), Oc(t, i, null, r, n)) : (Mc(t), kc(t, a))) : a ? a === e.memoizedState ? (Mc(t), t.flags &= -16777217) : (Dc(t), Mc(t), kc(t, a)) : (e = e.memoizedProps, e !== r && Dc(t), Mc(t), Oc(t, i, e, r, n)), null;
			case 27:
				if (le(t), n = B.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Dc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Mc(t), null;
					}
					e = ie.current, Pi(t) ? Mi(t, e) : (e = ff(i, r, n), t.stateNode = e, Dc(t));
				}
				return Mc(t), null;
			case 5:
				if (le(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Dc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Mc(t), null;
					}
					if (a = ie.current, Pi(t)) Mi(t, a);
					else {
						var o = Bd(B.current);
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
						a[nt] = t, a[U] = r;
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
						a: switch (Pd(a, i, r), i) {
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
					if (e = B.current, Pi(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = Di, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[nt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || jd(e.nodeValue, n)), e || ji(t, !0);
					} else e = Bd(e).createTextNode(r), e[nt] = t, t.stateNode = e;
				}
				return Mc(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Pi(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(s(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(557));
							e[nt] = t;
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
							i[nt] = t;
						} else Fi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Mc(t), i = !1;
					} else i = Ii(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (to(t), t) : (to(t), null);
				}
				return to(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Ac(t, t.updateQueue), Mc(t), null);
			case 4: return se(), e === null && xd(t.stateNode.containerInfo), Mc(t), null;
			case 10: return Hi(t.type), Mc(t), null;
			case 19:
				if (R(J), r = t.memoizedState, r === null) return Mc(t), null;
				if (i = (t.flags & 128) != 0, a = r.rendering, a === null) if (i) jc(r, !1);
				else {
					if (Hl !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
						if (a = no(e), a !== null) {
							for (t.flags |= 128, jc(r, !1), e = a.updateQueue, t.updateQueue = e, Ac(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) ai(n, e), n = n.sibling;
							return z(J, J.current & 1 | 2), K && Si(t, r.treeForkCount), t.child;
						}
						e = e.sibling;
					}
					r.tail !== null && xe() > $l && (t.flags |= 128, i = !0, jc(r, !1), t.lanes = 4194304);
				}
				else {
					if (!i) if (e = no(a), e !== null) {
						if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Ac(t, e), jc(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !K) return Mc(t), null;
					} else 2 * xe() - r.renderingStartTime > $l && n !== 536870912 && (t.flags |= 128, i = !0, jc(r, !1), t.lanes = 4194304);
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (Mc(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = xe(), e.sibling = null, n = J.current, z(J, i ? n & 1 | 2 : n & 1), K && Si(t, r.treeForkCount), e);
			case 22:
			case 23: return to(t), Ja(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (Mc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Mc(t), n = t.updateQueue, n !== null && Ac(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && R(da), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Hi(ea), Mc(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(s(156, t.tag));
	}
	function Pc(e, t) {
		switch (Ti(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Hi(ea), se(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return le(t), null;
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
			case 19: return R(J), null;
			case 4: return se(), null;
			case 10: return Hi(t.type), null;
			case 22:
			case 23: return to(t), Ja(), e !== null && R(da), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Hi(ea), null;
			case 25: return null;
			default: return null;
		}
	}
	function Fc(e, t) {
		switch (Ti(t), t.tag) {
			case 3:
				Hi(ea), se();
				break;
			case 26:
			case 27:
			case 5:
				le(t);
				break;
			case 4:
				se();
				break;
			case 31:
				t.memoizedState !== null && to(t);
				break;
			case 13:
				to(t);
				break;
			case 19:
				R(J);
				break;
			case 10:
				Hi(t.type);
				break;
			case 22:
			case 23:
				to(t), Ja(), e !== null && R(da);
				break;
			case 24: Hi(ea);
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
			Uu(t, t.return, e);
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
								Uu(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			Uu(t, t.return, e);
		}
	}
	function Rc(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Ua(t, n);
			} catch (t) {
				Uu(e, e.return, t);
			}
		}
	}
	function zc(e, t, n) {
		n.props = Bs(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Uu(e, t, n);
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
			Uu(e, t, n);
		}
	}
	function Vc(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) if (typeof r == "function") try {
			r();
		} catch (n) {
			Uu(e, t, n);
		} finally {
			e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
		}
		else if (typeof n == "function") try {
			n(null);
		} catch (n) {
			Uu(e, t, n);
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
			Uu(e, e.return, t);
		}
	}
	function Uc(e, t, n) {
		try {
			var r = e.stateNode;
			Fd(r, e.type, n, t), r[U] = t;
		} catch (t) {
			Uu(e, e.return, t);
		}
	}
	function Wc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Zd(e.type) || e.tag === 4;
	}
	function Gc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Wc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Zd(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Kc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Jt));
		else if (r !== 4 && (r === 27 && Zd(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null)) for (Kc(e, t, n), e = e.sibling; e !== null;) Kc(e, t, n), e = e.sibling;
	}
	function qc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (r === 27 && Zd(e.type) && (n = e.stateNode), e = e.child, e !== null)) for (qc(e, t, n), e = e.sibling; e !== null;) qc(e, t, n), e = e.sibling;
	}
	function Jc(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			Pd(t, r, n), t[nt] = e, t[U] = n;
		} catch (t) {
			Uu(e, e.return, t);
		}
	}
	var Yc = !1, X = !1, Xc = !1, Zc = typeof WeakSet == "function" ? WeakSet : Set, Qc = null;
	function $c(e, t) {
		if (e = e.containerInfo, Rd = sp, e = xr(e), Sr(e)) {
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
		for (zd = {
			focusedElem: e,
			selectionRange: n
		}, sp = !1, Qc = t; Qc !== null;) if (t = Qc, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, Qc = e;
		else for (; Qc !== null;) {
			switch (t = Qc, a = t.alternate, e = t.flags, t.tag) {
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
							Uu(n, n.return, e);
						}
					}
					break;
				case 3:
					if (e & 1024) {
						if (e = t.stateNode.containerInfo, n = e.nodeType, n === 9) ef(e);
						else if (n === 1) switch (e.nodeName) {
							case "HEAD":
							case "HTML":
							case "BODY":
								ef(e);
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
				e.return = t.return, Qc = e;
				break;
			}
			Qc = t.return;
		}
	}
	function el(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				hl(e, n), r & 4 && Ic(5, n);
				break;
			case 1:
				if (hl(e, n), r & 4) if (e = n.stateNode, t === null) try {
					e.componentDidMount();
				} catch (e) {
					Uu(n, n.return, e);
				}
				else {
					var i = Bs(n.type, t.memoizedProps);
					t = t.memoizedState;
					try {
						e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
					} catch (e) {
						Uu(n, n.return, e);
					}
				}
				r & 64 && Rc(n), r & 512 && Bc(n, n.return);
				break;
			case 3:
				if (hl(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
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
						Uu(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Jc(n);
			case 26:
			case 5:
				hl(e, n), t === null && r & 4 && Hc(n), r & 512 && Bc(n, n.return);
				break;
			case 12:
				hl(e, n);
				break;
			case 31:
				hl(e, n), r & 4 && ol(e, n);
				break;
			case 13:
				hl(e, n), r & 4 && sl(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = qu.bind(null, n), sf(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || Yc, !r) {
					t = t !== null && t.memoizedState !== null || X, i = Yc;
					var a = X;
					Yc = r, (X = t) && !a ? _l(e, n, (n.subtreeFlags & 8772) != 0) : hl(e, n), Yc = i, X = a;
				}
				break;
			case 30: break;
			default: hl(e, n);
		}
	}
	function tl(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, tl(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && lt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var nl = null, rl = !1;
	function il(e, t, n) {
		for (n = n.child; n !== null;) al(e, t, n), n = n.sibling;
	}
	function al(e, t, n) {
		if (je && typeof je.onCommitFiberUnmount == "function") try {
			je.onCommitFiberUnmount(Ae, n);
		} catch {}
		switch (n.tag) {
			case 26:
				X || Vc(n, t), il(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				X || Vc(n, t);
				var r = nl, i = rl;
				Zd(n.type) && (nl = n.stateNode, rl = !1), il(e, t, n), pf(n.stateNode), nl = r, rl = i;
				break;
			case 5: X || Vc(n, t);
			case 6:
				if (r = nl, i = rl, nl = null, il(e, t, n), nl = r, rl = i, nl !== null) if (rl) try {
					(nl.nodeType === 9 ? nl.body : nl.nodeName === "HTML" ? nl.ownerDocument.body : nl).removeChild(n.stateNode);
				} catch (e) {
					Uu(n, t, e);
				}
				else try {
					nl.removeChild(n.stateNode);
				} catch (e) {
					Uu(n, t, e);
				}
				break;
			case 18:
				nl !== null && (rl ? (e = nl, Qd(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Np(e)) : Qd(nl, n.stateNode));
				break;
			case 4:
				r = nl, i = rl, nl = n.stateNode.containerInfo, rl = !0, il(e, t, n), nl = r, rl = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Lc(2, n, t), X || Lc(4, n, t), il(e, t, n);
				break;
			case 1:
				X || (Vc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && zc(n, t, r)), il(e, t, n);
				break;
			case 21:
				il(e, t, n);
				break;
			case 22:
				X = (r = X) || n.memoizedState !== null, il(e, t, n), X = r;
				break;
			default: il(e, t, n);
		}
	}
	function ol(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Np(e);
			} catch (e) {
				Uu(t, t.return, e);
			}
		}
	}
	function sl(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Np(e);
		} catch (e) {
			Uu(t, t.return, e);
		}
	}
	function cl(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new Zc()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new Zc()), t;
			default: throw Error(s(435, e.tag));
		}
	}
	function ll(e, t) {
		var n = cl(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = Ju.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function ul(e, t) {
		var n = t.deletions;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r], a = e, o = t, c = o;
			a: for (; c !== null;) {
				switch (c.tag) {
					case 27:
						if (Zd(c.type)) {
							nl = c.stateNode, rl = !1;
							break a;
						}
						break;
					case 5:
						nl = c.stateNode, rl = !1;
						break a;
					case 3:
					case 4:
						nl = c.stateNode.containerInfo, rl = !0;
						break a;
				}
				c = c.return;
			}
			if (nl === null) throw Error(s(160));
			al(a, o, i), nl = null, rl = !1, a = i.alternate, a !== null && (a.return = null), i.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) fl(t, e), t = t.sibling;
	}
	var dl = null;
	function fl(e, t) {
		var n = e.alternate, r = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				ul(t, e), pl(e), r & 4 && (Lc(3, e, e.return), Ic(3, e), Lc(5, e, e.return));
				break;
			case 1:
				ul(t, e), pl(e), r & 512 && (X || n === null || Vc(n, n.return)), r & 64 && Yc && (e = e.updateQueue, e !== null && (r = e.callbacks, r !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? r : n.concat(r))));
				break;
			case 26:
				var i = dl;
				if (ul(t, e), pl(e), r & 512 && (X || n === null || Vc(n, n.return)), r & 4) {
					var a = n === null ? null : n.memoizedState;
					if (r = e.memoizedState, n === null) if (r === null) if (e.stateNode === null) {
						a: {
							r = e.type, n = e.memoizedProps, i = i.ownerDocument || i;
							b: switch (r) {
								case "title":
									a = i.getElementsByTagName("title")[0], (!a || a[ct] || a[nt] || a.namespaceURI === "http://www.w3.org/2000/svg" || a.hasAttribute("itemprop")) && (a = i.createElement(r), i.head.insertBefore(a, i.querySelector("head > title"))), Pd(a, r, n), a[nt] = e, mt(a), r = a;
									break a;
								case "link":
									var o = Vf("link", "href", i).get(r + (n.href || ""));
									if (o) {
										for (var c = 0; c < o.length; c++) if (a = o[c], a.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && a.getAttribute("rel") === (n.rel == null ? null : n.rel) && a.getAttribute("title") === (n.title == null ? null : n.title) && a.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
											o.splice(c, 1);
											break b;
										}
									}
									a = i.createElement(r), Pd(a, r, n), i.head.appendChild(a);
									break;
								case "meta":
									if (o = Vf("meta", "content", i).get(r + (n.content || ""))) {
										for (c = 0; c < o.length; c++) if (a = o[c], a.getAttribute("content") === (n.content == null ? null : "" + n.content) && a.getAttribute("name") === (n.name == null ? null : n.name) && a.getAttribute("property") === (n.property == null ? null : n.property) && a.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && a.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
											o.splice(c, 1);
											break b;
										}
									}
									a = i.createElement(r), Pd(a, r, n), i.head.appendChild(a);
									break;
								default: throw Error(s(468, r));
							}
							a[nt] = e, mt(a), r = a;
						}
						e.stateNode = r;
					} else Hf(i, e.type, e.stateNode);
					else e.stateNode = If(i, r, e.memoizedProps);
					else a === r ? r === null && e.stateNode !== null && Uc(e, e.memoizedProps, n.memoizedProps) : (a === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : a.count--, r === null ? Hf(i, e.type, e.stateNode) : If(i, r, e.memoizedProps));
				}
				break;
			case 27:
				ul(t, e), pl(e), r & 512 && (X || n === null || Vc(n, n.return)), n !== null && r & 4 && Uc(e, e.memoizedProps, n.memoizedProps);
				break;
			case 5:
				if (ul(t, e), pl(e), r & 512 && (X || n === null || Vc(n, n.return)), e.flags & 32) {
					i = e.stateNode;
					try {
						Bt(i, "");
					} catch (t) {
						Uu(e, e.return, t);
					}
				}
				r & 4 && e.stateNode != null && (i = e.memoizedProps, Uc(e, i, n === null ? i : n.memoizedProps)), r & 1024 && (Xc = !0);
				break;
			case 6:
				if (ul(t, e), pl(e), r & 4) {
					if (e.stateNode === null) throw Error(s(162));
					r = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = r;
					} catch (t) {
						Uu(e, e.return, t);
					}
				}
				break;
			case 3:
				if (Bf = null, i = dl, dl = gf(t.containerInfo), ul(t, e), dl = i, pl(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					Np(t.containerInfo);
				} catch (t) {
					Uu(e, e.return, t);
				}
				Xc && (Xc = !1, ml(e));
				break;
			case 4:
				r = dl, dl = gf(e.stateNode.containerInfo), ul(t, e), pl(e), dl = r;
				break;
			case 12:
				ul(t, e), pl(e);
				break;
			case 31:
				ul(t, e), pl(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ll(e, r)));
				break;
			case 13:
				ul(t, e), pl(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Zl = xe()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ll(e, r)));
				break;
			case 22:
				i = e.memoizedState !== null;
				var l = n !== null && n.memoizedState !== null, u = Yc, d = X;
				if (Yc = u || i, X = d || l, ul(t, e), X = d, Yc = u, pl(e), r & 8192) a: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || l || Yc || X || gl(e)), n = null, t = e;;) {
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
								Uu(l, l.return, e);
							}
						}
					} else if (t.tag === 6) {
						if (n === null) {
							l = t;
							try {
								l.stateNode.nodeValue = i ? "" : l.memoizedProps;
							} catch (e) {
								Uu(l, l.return, e);
							}
						}
					} else if (t.tag === 18) {
						if (n === null) {
							l = t;
							try {
								var m = l.stateNode;
								i ? $d(m, !0) : $d(l.stateNode, !1);
							} catch (e) {
								Uu(l, l.return, e);
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
				r & 4 && (r = e.updateQueue, r !== null && (n = r.retryQueue, n !== null && (r.retryQueue = null, ll(e, n))));
				break;
			case 19:
				ul(t, e), pl(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ll(e, r)));
				break;
			case 30: break;
			case 21: break;
			default: ul(t, e), pl(e);
		}
	}
	function pl(e) {
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
						n.flags & 32 && (Bt(a, ""), n.flags &= -33), qc(e, Gc(e), a);
						break;
					case 3:
					case 4:
						var o = n.stateNode.containerInfo;
						Kc(e, Gc(e), o);
						break;
					default: throw Error(s(161));
				}
			} catch (t) {
				Uu(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function ml(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			ml(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
		}
	}
	function hl(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) el(e, t.alternate, t), t = t.sibling;
	}
	function gl(e) {
		for (e = e.child; e !== null;) {
			var t = e;
			switch (t.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Lc(4, t, t.return), gl(t);
					break;
				case 1:
					Vc(t, t.return);
					var n = t.stateNode;
					typeof n.componentWillUnmount == "function" && zc(t, t.return, n), gl(t);
					break;
				case 27: pf(t.stateNode);
				case 26:
				case 5:
					Vc(t, t.return), gl(t);
					break;
				case 22:
					t.memoizedState === null && gl(t);
					break;
				case 30:
					gl(t);
					break;
				default: gl(t);
			}
			e = e.sibling;
		}
	}
	function _l(e, t, n) {
		for (n &&= (t.subtreeFlags & 8772) != 0, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags;
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					_l(i, a, n), Ic(4, a);
					break;
				case 1:
					if (_l(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Uu(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var s = r.stateNode;
						try {
							var c = i.shared.hiddenCallbacks;
							if (c !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < c.length; i++) Ha(c[i], s);
						} catch (e) {
							Uu(r, r.return, e);
						}
					}
					n && o & 64 && Rc(a), Bc(a, a.return);
					break;
				case 27: Jc(a);
				case 26:
				case 5:
					_l(i, a, n), n && r === null && o & 4 && Hc(a), Bc(a, a.return);
					break;
				case 12:
					_l(i, a, n);
					break;
				case 31:
					_l(i, a, n), n && o & 4 && ol(i, a);
					break;
				case 13:
					_l(i, a, n), n && o & 4 && sl(i, a);
					break;
				case 22:
					a.memoizedState === null && _l(i, a, n), Bc(a, a.return);
					break;
				case 30: break;
				default: _l(i, a, n);
			}
			t = t.sibling;
		}
	}
	function vl(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && na(n));
	}
	function yl(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && na(e));
	}
	function bl(e, t, n, r) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) xl(e, t, n, r), t = t.sibling;
	}
	function xl(e, t, n, r) {
		var i = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				bl(e, t, n, r), i & 2048 && Ic(9, t);
				break;
			case 1:
				bl(e, t, n, r);
				break;
			case 3:
				bl(e, t, n, r), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && na(e)));
				break;
			case 12:
				if (i & 2048) {
					bl(e, t, n, r), e = t.stateNode;
					try {
						var a = t.memoizedProps, o = a.id, s = a.onPostCommit;
						typeof s == "function" && s(o, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0);
					} catch (e) {
						Uu(t, t.return, e);
					}
				} else bl(e, t, n, r);
				break;
			case 31:
				bl(e, t, n, r);
				break;
			case 13:
				bl(e, t, n, r);
				break;
			case 23: break;
			case 22:
				a = t.stateNode, o = t.alternate, t.memoizedState === null ? a._visibility & 2 ? bl(e, t, n, r) : (a._visibility |= 2, Sl(e, t, n, r, (t.subtreeFlags & 10256) != 0 || !1)) : a._visibility & 2 ? bl(e, t, n, r) : Cl(e, t), i & 2048 && vl(o, t);
				break;
			case 24:
				bl(e, t, n, r), i & 2048 && yl(t.alternate, t);
				break;
			default: bl(e, t, n, r);
		}
	}
	function Sl(e, t, n, r, i) {
		for (i &&= (t.subtreeFlags & 10256) != 0 || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Sl(a, o, s, c, i), Ic(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Sl(a, o, s, c, i)) : u._visibility & 2 ? Sl(a, o, s, c, i) : Cl(a, o), i && l & 2048 && vl(o.alternate, o);
					break;
				case 24:
					Sl(a, o, s, c, i), i && l & 2048 && yl(o.alternate, o);
					break;
				default: Sl(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Cl(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Cl(n, r), i & 2048 && vl(r.alternate, r);
					break;
				case 24:
					Cl(n, r), i & 2048 && yl(r.alternate, r);
					break;
				default: Cl(n, r);
			}
			t = t.sibling;
		}
	}
	var wl = 8192;
	function Tl(e, t, n) {
		if (e.subtreeFlags & wl) for (e = e.child; e !== null;) El(e, t, n), e = e.sibling;
	}
	function El(e, t, n) {
		switch (e.tag) {
			case 26:
				Tl(e, t, n), e.flags & wl && e.memoizedState !== null && Gf(n, dl, e.memoizedState, e.memoizedProps);
				break;
			case 5:
				Tl(e, t, n);
				break;
			case 3:
			case 4:
				var r = dl;
				dl = gf(e.stateNode.containerInfo), Tl(e, t, n), dl = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = wl, wl = 16777216, Tl(e, t, n), wl = r) : Tl(e, t, n));
				break;
			default: Tl(e, t, n);
		}
	}
	function Dl(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Ol(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				Qc = r, jl(r, e);
			}
			Dl(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) kl(e), e = e.sibling;
	}
	function kl(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Ol(e), e.flags & 2048 && Lc(9, e, e.return);
				break;
			case 3:
				Ol(e);
				break;
			case 12:
				Ol(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Al(e)) : Ol(e);
				break;
			default: Ol(e);
		}
	}
	function Al(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				Qc = r, jl(r, e);
			}
			Dl(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Lc(8, t, t.return), Al(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Al(t));
					break;
				default: Al(t);
			}
			e = e.sibling;
		}
	}
	function jl(e, t) {
		for (; Qc !== null;) {
			var n = Qc;
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
				case 24: na(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, Qc = r;
			else a: for (n = e; Qc !== null;) {
				r = Qc;
				var i = r.sibling, a = r.return;
				if (tl(r), r === n) {
					Qc = null;
					break a;
				}
				if (i !== null) {
					i.return = a, Qc = i;
					break a;
				}
				Qc = a;
			}
		}
	}
	var Ml = {
		getCacheForType: function(e) {
			var t = Ji(ea), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Ji(ea).controller.signal;
		}
	}, Nl = typeof WeakMap == "function" ? WeakMap : Map, Pl = 0, Fl = null, Z = null, Q = 0, Il = 0, Ll = null, Rl = !1, zl = !1, Bl = !1, Vl = 0, Hl = 0, Ul = 0, Wl = 0, Gl = 0, Kl = 0, ql = 0, Jl = null, Yl = null, Xl = !1, Zl = 0, Ql = 0, $l = Infinity, eu = null, tu = null, nu = 0, ru = null, iu = null, au = 0, ou = 0, su = null, cu = null, lu = 0, uu = null;
	function du() {
		return Pl & 2 && Q !== 0 ? Q & -Q : P.T === null ? $e() : ud();
	}
	function fu() {
		if (Kl === 0) if (!(Q & 536870912) || K) {
			var e = Re;
			Re <<= 1, !(Re & 3932160) && (Re = 262144), Kl = e;
		} else Kl = 536870912;
		return e = Ya.current, e !== null && (e.flags |= 32), Kl;
	}
	function pu(e, t, n) {
		(e === Fl && (Il === 2 || Il === 9) || e.cancelPendingCommit !== null) && (bu(e, 0), _u(e, Q, Kl, !1)), Ke(e, n), (!(Pl & 2) || e !== Fl) && (e === Fl && (!(Pl & 2) && (Wl |= n), Hl === 4 && _u(e, Q, Kl, !1)), nd(e));
	}
	function mu(e, t, n) {
		if (Pl & 6) throw Error(s(327));
		var r = !n && (t & 127) == 0 && (t & e.expiredLanes) === 0 || He(e, t), i = r ? Ou(e, t) : Eu(e, t, !0), a = r;
		do {
			if (i === 0) {
				zl && !r && _u(e, t, 0, !1);
				break;
			} else {
				if (n = e.current.alternate, a && !gu(n)) {
					i = Eu(e, t, !1), a = !1;
					continue;
				}
				if (i === 2) {
					if (a = t, e.errorRecoveryDisabledLanes & a) var o = 0;
					else o = e.pendingLanes & -536870913, o = o === 0 ? o & 536870912 ? 536870912 : 0 : o;
					if (o !== 0) {
						t = o;
						a: {
							var c = e;
							i = Jl;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (bu(c, o).flags |= 256), o = Eu(c, o, !1), o !== 2) {
								if (Bl && !l) {
									c.errorRecoveryDisabledLanes |= a, Wl |= a, i = 4;
									break a;
								}
								a = Yl, Yl = i, a !== null && (Yl === null ? Yl = a : Yl.push.apply(Yl, a));
							}
							i = o;
						}
						if (a = !1, i !== 2) continue;
					}
				}
				if (i === 1) {
					bu(e, 0), _u(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, a = i, a) {
						case 0:
						case 1: throw Error(s(345));
						case 4: if ((t & 4194048) !== t) break;
						case 6:
							_u(r, t, Kl, !Rl);
							break a;
						case 2:
							Yl = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(s(329));
					}
					if ((t & 62914560) === t && (i = Zl + 300 - xe(), 10 < i)) {
						if (_u(r, t, Kl, !Rl), Ve(r, 0, !0) !== 0) break a;
						au = t, r.timeoutHandle = Kd(hu.bind(null, r, n, Yl, eu, Xl, t, Kl, Wl, ql, Rl, a, "Throttled", -0, 0), i);
						break a;
					}
					hu(r, n, Yl, eu, Xl, t, Kl, Wl, ql, Rl, a, null, -0, 0);
				}
			}
			break;
		} while (1);
		nd(e);
	}
	function hu(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
		if (e.timeoutHandle = -1, d = t.subtreeFlags, d & 8192 || (d & 16785408) == 16785408) {
			d = {
				stylesheets: null,
				count: 0,
				imgCount: 0,
				imgBytes: 0,
				suspenseyImages: [],
				waitingForImages: !0,
				waitingForViewTransition: !1,
				unsuspend: Jt
			}, El(t, a, d);
			var m = (a & 62914560) === a ? Zl - xe() : (a & 4194048) === a ? Ql - xe() : 0;
			if (m = qf(d, m), m !== null) {
				au = a, e.cancelPendingCommit = m(Fu.bind(null, e, t, a, n, r, i, o, s, c, u, d, null, f, p)), _u(e, a, o, !l);
				return;
			}
		}
		Fu(e, t, a, n, r, i, o, s, c);
	}
	function gu(e) {
		for (var t = e;;) {
			var n = t.tag;
			if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue, n !== null && (n = n.stores, n !== null))) for (var r = 0; r < n.length; r++) {
				var i = n[r], a = i.getSnapshot;
				i = i.value;
				try {
					if (!gr(a(), i)) return !1;
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
	function _u(e, t, n, r) {
		t &= ~Gl, t &= ~Wl, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - Ne(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && Je(e, n, t);
	}
	function vu() {
		return Pl & 6 ? !0 : (rd(0, !1), !1);
	}
	function yu() {
		if (Z !== null) {
			if (Il === 0) var e = Z.return;
			else e = Z, Bi = zi = null, So(e), wa = null, Ta = 0, e = Z;
			for (; e !== null;) Fc(e.alternate, e), e = e.return;
			Z = null;
		}
	}
	function bu(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, qd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), au = 0, yu(), Fl = e, Z = n = ii(e.current, null), Q = t, Il = 0, Ll = null, Rl = !1, zl = He(e, t), Bl = !1, ql = Kl = Gl = Wl = Ul = Hl = 0, Yl = Jl = null, Xl = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - Ne(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Vl = t, Jr(), n;
	}
	function xu(e, t) {
		Y = null, P.H = Ms, t === ha || t === _a ? (t = Sa(), Il = 3) : t === ga ? (t = Sa(), Il = 4) : Il = t === Xs ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Ll = t, Z === null && (Hl = 1, Ws(e, fi(t, e.current)));
	}
	function Su() {
		var e = Ya.current;
		return e === null ? !0 : (Q & 4194048) === Q ? Xa === null : (Q & 62914560) === Q || Q & 536870912 ? e === Xa : !1;
	}
	function Cu() {
		var e = P.H;
		return P.H = Ms, e === null ? Ms : e;
	}
	function wu() {
		var e = P.A;
		return P.A = Ml, e;
	}
	function Tu() {
		Hl = 4, Rl || (Q & 4194048) !== Q && Ya.current !== null || (zl = !0), !(Ul & 134217727) && !(Wl & 134217727) || Fl === null || _u(Fl, Q, Kl, !1);
	}
	function Eu(e, t, n) {
		var r = Pl;
		Pl |= 2;
		var i = Cu(), a = wu();
		(Fl !== e || Q !== t) && (eu = null, bu(e, t)), t = !1;
		var o = Hl;
		a: do
			try {
				if (Il !== 0 && Z !== null) {
					var s = Z, c = Ll;
					switch (Il) {
						case 8:
							yu(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							Ya.current === null && (t = !0);
							var l = Il;
							if (Il = 0, Ll = null, Mu(e, s, c, l), n && zl) {
								o = 0;
								break a;
							}
							break;
						default: l = Il, Il = 0, Ll = null, Mu(e, s, c, l);
					}
				}
				Du(), o = Hl;
				break;
			} catch (t) {
				xu(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, Bi = zi = null, Pl = r, P.H = i, P.A = a, Z === null && (Fl = null, Q = 0, Jr()), o;
	}
	function Du() {
		for (; Z !== null;) Au(Z);
	}
	function Ou(e, t) {
		var n = Pl;
		Pl |= 2;
		var r = Cu(), i = wu();
		Fl !== e || Q !== t ? (eu = null, $l = xe() + 500, bu(e, t)) : zl = He(e, t);
		a: do
			try {
				if (Il !== 0 && Z !== null) {
					t = Z;
					var a = Ll;
					b: switch (Il) {
						case 1:
							Il = 0, Ll = null, Mu(e, t, a, 1);
							break;
						case 2:
						case 9:
							if (ya(a)) {
								Il = 0, Ll = null, ju(t);
								break;
							}
							t = function() {
								Il !== 2 && Il !== 9 || Fl !== e || (Il = 7), nd(e);
							}, a.then(t, t);
							break a;
						case 3:
							Il = 7;
							break a;
						case 4:
							Il = 5;
							break a;
						case 7:
							ya(a) ? (Il = 0, Ll = null, ju(t)) : (Il = 0, Ll = null, Mu(e, t, a, 7));
							break;
						case 5:
							var o = null;
							switch (Z.tag) {
								case 26: o = Z.memoizedState;
								case 5:
								case 27:
									var c = Z;
									if (o ? Wf(o) : c.stateNode.complete) {
										Il = 0, Ll = null;
										var l = c.sibling;
										if (l !== null) Z = l;
										else {
											var u = c.return;
											u === null ? Z = null : (Z = u, Nu(u));
										}
										break b;
									}
							}
							Il = 0, Ll = null, Mu(e, t, a, 5);
							break;
						case 6:
							Il = 0, Ll = null, Mu(e, t, a, 6);
							break;
						case 8:
							yu(), Hl = 6;
							break a;
						default: throw Error(s(462));
					}
				}
				ku();
				break;
			} catch (t) {
				xu(e, t);
			}
		while (1);
		return Bi = zi = null, P.H = r, P.A = i, Pl = n, Z === null ? (Fl = null, Q = 0, Jr(), Hl) : 0;
	}
	function ku() {
		for (; Z !== null && !ye();) Au(Z);
	}
	function Au(e) {
		var t = Ec(e.alternate, e, Vl);
		e.memoizedProps = e.pendingProps, t === null ? Nu(e) : Z = t;
	}
	function ju(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = uc(n, t, t.pendingProps, t.type, void 0, Q);
				break;
			case 11:
				t = uc(n, t, t.pendingProps, t.type.render, t.ref, Q);
				break;
			case 5: So(t);
			default: Fc(n, t), t = Z = ai(t, Vl), t = Ec(n, t, Vl);
		}
		e.memoizedProps = e.pendingProps, t === null ? Nu(e) : Z = t;
	}
	function Mu(e, t, n, r) {
		Bi = zi = null, So(t), wa = null, Ta = 0;
		var i = t.return;
		try {
			if (Ys(e, i, t, n, Q)) {
				Hl = 1, Ws(e, fi(n, e.current)), Z = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw Z = i, t;
			Hl = 1, Ws(e, fi(n, e.current)), Z = null;
			return;
		}
		t.flags & 32768 ? (K || r === 1 ? e = !0 : zl || Q & 536870912 ? e = !1 : (Rl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Ya.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Pu(t, e)) : Nu(t);
	}
	function Nu(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				Pu(t, Rl);
				return;
			}
			e = t.return;
			var n = Nc(t.alternate, t, Vl);
			if (n !== null) {
				Z = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				Z = t;
				return;
			}
			Z = t = e;
		} while (t !== null);
		Hl === 0 && (Hl = 5);
	}
	function Pu(e, t) {
		do {
			var n = Pc(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, Z = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				Z = e;
				return;
			}
			Z = e = n;
		} while (e !== null);
		Hl = 6, Z = null;
	}
	function Fu(e, t, n, r, i, a, o, c, l) {
		e.cancelPendingCommit = null;
		do
			Bu();
		while (nu !== 0);
		if (Pl & 6) throw Error(s(327));
		if (t !== null) {
			if (t === e.current) throw Error(s(177));
			if (a = t.lanes | t.childLanes, a |= qr, qe(e, n, a, o, c, l), e === Fl && (Z = Fl = null, Q = 0), iu = t, ru = e, au = n, ou = a, su = i, cu = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Yu(Te, function() {
				return Vu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = (t.flags & 13878) != 0, t.subtreeFlags & 13878 || r) {
				r = P.T, P.T = null, i = F.p, F.p = 2, o = Pl, Pl |= 4;
				try {
					$c(e, t, n);
				} finally {
					Pl = o, F.p = i, P.T = r;
				}
			}
			nu = 1, Iu(), Lu(), Ru();
		}
	}
	function Iu() {
		if (nu === 1) {
			nu = 0;
			var e = ru, t = iu, n = (t.flags & 13878) != 0;
			if (t.subtreeFlags & 13878 || n) {
				n = P.T, P.T = null;
				var r = F.p;
				F.p = 2;
				var i = Pl;
				Pl |= 4;
				try {
					fl(t, e);
					var a = zd, o = xr(e.containerInfo), s = a.focusedElem, c = a.selectionRange;
					if (o !== s && s && s.ownerDocument && br(s.ownerDocument.documentElement, s)) {
						if (c !== null && Sr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = yr(s, h), v = yr(s, g);
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
					sp = !!Rd, zd = Rd = null;
				} finally {
					Pl = i, F.p = r, P.T = n;
				}
			}
			e.current = t, nu = 2;
		}
	}
	function Lu() {
		if (nu === 2) {
			nu = 0;
			var e = ru, t = iu, n = (t.flags & 8772) != 0;
			if (t.subtreeFlags & 8772 || n) {
				n = P.T, P.T = null;
				var r = F.p;
				F.p = 2;
				var i = Pl;
				Pl |= 4;
				try {
					el(e, t.alternate, t);
				} finally {
					Pl = i, F.p = r, P.T = n;
				}
			}
			nu = 3;
		}
	}
	function Ru() {
		if (nu === 4 || nu === 3) {
			nu = 0, be();
			var e = ru, t = iu, n = au, r = cu;
			t.subtreeFlags & 10256 || t.flags & 10256 ? nu = 5 : (nu = 0, iu = ru = null, zu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (tu = null), Qe(n), t = t.stateNode, je && typeof je.onCommitFiberRoot == "function") try {
				je.onCommitFiberRoot(Ae, t, void 0, (t.current.flags & 128) == 128);
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
			au & 3 && Bu(), nd(e), i = e.pendingLanes, n & 261930 && i & 42 ? e === uu ? lu++ : (lu = 0, uu = e) : lu = 0, rd(0, !1);
		}
	}
	function zu(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, na(t)));
	}
	function Bu() {
		return Iu(), Lu(), Ru(), Vu();
	}
	function Vu() {
		if (nu !== 5) return !1;
		var e = ru, t = ou;
		ou = 0;
		var n = Qe(au), r = P.T, i = F.p;
		try {
			F.p = 32 > n ? 32 : n, P.T = null, n = su, su = null;
			var a = ru, o = au;
			if (nu = 0, iu = ru = null, au = 0, Pl & 6) throw Error(s(331));
			var c = Pl;
			if (Pl |= 4, kl(a.current), xl(a, a.current, o, n), Pl = c, rd(0, !1), je && typeof je.onPostCommitFiberRoot == "function") try {
				je.onPostCommitFiberRoot(Ae, a);
			} catch {}
			return !0;
		} finally {
			F.p = i, P.T = r, zu(e, t);
		}
	}
	function Hu(e, t, n) {
		t = fi(n, t), t = Ks(e.stateNode, t, 2), e = Ia(e, t, 2), e !== null && (Ke(e, 2), nd(e));
	}
	function Uu(e, t, n) {
		if (e.tag === 3) Hu(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				Hu(t, e, n);
				break;
			} else if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (tu === null || !tu.has(r))) {
					e = fi(n, e), n = qs(2), r = Ia(t, n, 2), r !== null && (Js(n, r, t, e), Ke(r, 2), nd(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function Wu(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Nl();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (Bl = !0, i.add(n), e = Gu.bind(null, e, t, n), t.then(e, e));
	}
	function Gu(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Fl === e && (Q & n) === n && (Hl === 4 || Hl === 3 && (Q & 62914560) === Q && 300 > xe() - Zl ? !(Pl & 2) && bu(e, 0) : Gl |= n, ql === Q && (ql = 0)), nd(e);
	}
	function Ku(e, t) {
		t === 0 && (t = We()), e = Zr(e, t), e !== null && (Ke(e, t), nd(e));
	}
	function qu(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), Ku(e, n);
	}
	function Ju(e, t) {
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
		r !== null && r.delete(t), Ku(e, n);
	}
	function Yu(e, t) {
		return _e(e, t);
	}
	var Xu = null, Zu = null, Qu = !1, $u = !1, ed = !1, td = 0;
	function nd(e) {
		e !== Zu && e.next === null && (Zu === null ? Xu = Zu = e : Zu = Zu.next = e), $u = !0, Qu || (Qu = !0, ld());
	}
	function rd(e, t) {
		if (!ed && $u) {
			ed = !0;
			do
				for (var n = !1, r = Xu; r !== null;) {
					if (!t) if (e !== 0) {
						var i = r.pendingLanes;
						if (i === 0) var a = 0;
						else {
							var o = r.suspendedLanes, s = r.pingedLanes;
							a = (1 << 31 - Ne(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
						}
						a !== 0 && (n = !0, cd(r, a));
					} else a = Q, a = Ve(r, r === Fl ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || He(r, a) || (n = !0, cd(r, a));
					r = r.next;
				}
			while (n);
			ed = !1;
		}
	}
	function id() {
		ad();
	}
	function ad() {
		$u = Qu = !1;
		var e = 0;
		td !== 0 && Gd() && (e = td);
		for (var t = xe(), n = null, r = Xu; r !== null;) {
			var i = r.next, a = od(r, t);
			a === 0 ? (r.next = null, n === null ? Xu = i : n.next = i, i === null && (Zu = n)) : (n = r, (e !== 0 || a & 3) && ($u = !0)), r = i;
		}
		nu !== 0 && nu !== 5 || rd(e, !1), td !== 0 && (td = 0);
	}
	function od(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - Ne(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = Ue(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Fl, n = Q, n = Ve(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Il === 2 || Il === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && ve(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || He(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && ve(r), Qe(n)) {
				case 2:
				case 8:
					n = we;
					break;
				case 32:
					n = Te;
					break;
				case 268435456:
					n = De;
					break;
				default: n = Te;
			}
			return r = sd.bind(null, e), n = _e(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && ve(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function sd(e, t) {
		if (nu !== 0 && nu !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Bu() && e.callbackNode !== n) return null;
		var r = Q;
		return r = Ve(e, e === Fl ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (mu(e, r, t), od(e, xe()), e.callbackNode != null && e.callbackNode === n ? sd.bind(null, e) : null);
	}
	function cd(e, t) {
		if (Bu()) return null;
		mu(e, t, !0);
	}
	function ld() {
		Yd(function() {
			Pl & 6 ? _e(Ce, id) : ad();
		});
	}
	function ud() {
		if (td === 0) {
			var e = aa;
			e === 0 && (e = Le, Le <<= 1, !(Le & 261888) && (Le = 256)), td = e;
		}
		return td;
	}
	function dd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : qt("" + e);
	}
	function fd(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function pd(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = dd((i[U] || null).action), o = r.submitter;
			o && (t = (t = o[U] || null) ? dd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new gn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (td !== 0) {
								var e = o ? fd(i, o) : new FormData(i);
								vs(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = o ? fd(i, o) : new FormData(i), vs(n, {
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
	for (var md = 0; md < Hr.length; md++) {
		var hd = Hr[md];
		Ur(hd.toLowerCase(), "on" + (hd[0].toUpperCase() + hd.slice(1)));
	}
	Ur(Pr, "onAnimationEnd"), Ur(Fr, "onAnimationIteration"), Ur(Ir, "onAnimationStart"), Ur("dblclick", "onDoubleClick"), Ur("focusin", "onFocus"), Ur("focusout", "onBlur"), Ur(Lr, "onTransitionRun"), Ur(Rr, "onTransitionStart"), Ur(zr, "onTransitionCancel"), Ur(Br, "onTransitionEnd"), vt("onMouseEnter", ["mouseout", "mouseover"]), vt("onMouseLeave", ["mouseout", "mouseover"]), vt("onPointerEnter", ["pointerout", "pointerover"]), vt("onPointerLeave", ["pointerout", "pointerover"]), _t("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), _t("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), _t("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), _t("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), _t("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), _t("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var gd = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), _d = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(gd));
	function vd(e, t) {
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
						Wr(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Wr(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function $(e, t) {
		var n = t[it];
		n === void 0 && (n = t[it] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (Sd(t, e, 2, !1), n.add(r));
	}
	function yd(e, t, n) {
		var r = 0;
		t && (r |= 4), Sd(n, e, r, t);
	}
	var bd = "_reactListening" + Math.random().toString(36).slice(2);
	function xd(e) {
		if (!e[bd]) {
			e[bd] = !0, ht.forEach(function(t) {
				t !== "selectionchange" && (_d.has(t) || yd(t, !1, e), yd(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[bd] || (t[bd] = !0, yd("selectionchange", !1, t));
		}
	}
	function Sd(e, t, n, r) {
		switch (mp(t)) {
			case 2:
				var i = cp;
				break;
			case 8:
				i = lp;
				break;
			default: i = up;
		}
		n = i.bind(null, t, n, e), i = void 0, !an || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function Cd(e, t, n, r, i) {
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
					if (o = ut(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6 || c === 26 || c === 27) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		tn(function() {
			var r = a, i = Xt(n), o = [];
			a: {
				var s = Vr.get(e);
				if (s !== void 0) {
					var c = gn, u = e;
					switch (e) {
						case "keypress": if (dn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = Nn;
							break;
						case "focusin":
							u = "focus", c = Tn;
							break;
						case "focusout":
							u = "blur", c = Tn;
							break;
						case "beforeblur":
						case "afterblur":
							c = Tn;
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
							c = Cn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = wn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = Fn;
							break;
						case Pr:
						case Fr:
						case Ir:
							c = En;
							break;
						case Br:
							c = In;
							break;
						case "scroll":
						case "scrollend":
							c = vn;
							break;
						case "wheel":
							c = Ln;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = Dn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							c = Pn;
							break;
						case "toggle":
						case "beforetoggle": c = Rn;
					}
					var d = (t & 4) != 0, f = !d && (e === "scroll" || e === "scrollend"), p = d ? s === null ? null : s + "Capture" : s;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = nn(m, p), g != null && d.push(wd(m, g, h))), f) break;
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
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== Yt && (u = n.relatedTarget || n.fromElement) && (ut(u) || u[rt])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (u = n.relatedTarget || n.toElement, c = r, u = u ? ut(u) : null, u !== null && (f = l(u), d = u.tag, u !== f || d !== 5 && d !== 27 && d !== 6) && (u = null)) : (c = null, u = r), c !== u)) {
						if (d = Cn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = Pn, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? s : ft(c), h = u == null ? s : ft(u), s = new d(g, m + "leave", c, n, i), s.target = f, s.relatedTarget = h, g = null, ut(i) === r && (d = new d(p, m + "enter", u, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, c && u) b: {
							for (d = Ed, p = c, m = u, h = 0, g = p; g; g = d(g)) h++;
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
						c !== null && Dd(o, s, c, d, !1), u !== null && f !== null && Dd(o, f, u, d, !0);
					}
				}
				a: {
					if (s = r ? ft(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var v = ir;
					else if (Qn(s)) if (ar) v = mr;
					else {
						v = fr;
						var y = dr;
					}
					else c = s.nodeName, !c || c.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? r && Wt(r.elementType) && (v = ir) : v = pr;
					if (v &&= v(e, r)) {
						$n(o, v, n, i);
						break a;
					}
					y && y(e, s, r), e === "focusout" && r && s.type === "number" && r.memoizedProps.value != null && It(s, "number", s.value);
				}
				switch (y = r ? ft(r) : window, e) {
					case "focusin":
						(Qn(y) || y.contentEditable === "true") && (wr = y, Tr = r, Er = null);
						break;
					case "focusout":
						Er = Tr = wr = null;
						break;
					case "mousedown":
						Dr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						Dr = !1, Or(o, n, i);
						break;
					case "selectionchange": if (Cr) break;
					case "keydown":
					case "keyup": Or(o, n, i);
				}
				var b;
				if (Bn) b: {
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
				else Jn ? Kn(e, n) && (x = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (x = "onCompositionStart");
				x && (Un && n.locale !== "ko" && (Jn || x !== "onCompositionStart" ? x === "onCompositionEnd" && Jn && (b = un()) : (sn = i, cn = "value" in sn ? sn.value : sn.textContent, Jn = !0)), y = Td(r, x), 0 < y.length && (x = new On(x, e, null, n, i), o.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = qn(n), b !== null && (x.data = b)))), (b = Hn ? Yn(e, n) : Xn(e, n)) && (x = Td(r, "onBeforeInput"), 0 < x.length && (y = new On("onBeforeInput", "beforeinput", null, n, i), o.push({
					event: y,
					listeners: x
				}), y.data = b)), pd(o, e, r, n, i);
			}
			vd(o, t);
		});
	}
	function wd(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Td(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = nn(e, n), i != null && r.unshift(wd(e, i, a)), i = nn(e, t), i != null && r.push(wd(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Ed(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function Dd(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = nn(n, a), l != null && o.unshift(wd(n, l, c))) : i || (l = nn(n, a), l != null && o.push(wd(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var Od = /\r\n?/g, kd = /\u0000|\uFFFD/g;
	function Ad(e) {
		return (typeof e == "string" ? e : "" + e).replace(Od, "\n").replace(kd, "");
	}
	function jd(e, t) {
		return t = Ad(t), Ad(e) === t;
	}
	function Md(e, t, n, r, i, a) {
		switch (n) {
			case "children":
				typeof r == "string" ? t === "body" || t === "textarea" && r === "" || Bt(e, r) : (typeof r == "number" || typeof r == "bigint") && t !== "body" && Bt(e, "" + r);
				break;
			case "className":
				wt(e, "class", r);
				break;
			case "tabIndex":
				wt(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				wt(e, n, r);
				break;
			case "style":
				Ut(e, r, a);
				break;
			case "data": if (t !== "object") {
				wt(e, "data", r);
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
				r = qt("" + r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				} else typeof a == "function" && (n === "formAction" ? (t !== "input" && Md(e, t, "name", i.name, i, null), Md(e, t, "formEncType", i.formEncType, i, null), Md(e, t, "formMethod", i.formMethod, i, null), Md(e, t, "formTarget", i.formTarget, i, null)) : (Md(e, t, "encType", i.encType, i, null), Md(e, t, "method", i.method, i, null), Md(e, t, "target", i.target, i, null)));
				if (r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = qt("" + r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = Jt);
				break;
			case "onScroll":
				r != null && $("scroll", e);
				break;
			case "onScrollEnd":
				r != null && $("scrollend", e);
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
				n = qt("" + r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
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
				$("beforetoggle", e), $("toggle", e), Ct(e, "popover", r);
				break;
			case "xlinkActuate":
				Tt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				Tt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				Tt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				Tt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				Tt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				Tt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				Tt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				Tt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				Tt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				Ct(e, "is", r);
				break;
			case "innerText":
			case "textContent": break;
			default: (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = Gt.get(n) || n, Ct(e, n, r));
		}
	}
	function Nd(e, t, n, r, i, a) {
		switch (n) {
			case "style":
				Ut(e, r, a);
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
				typeof r == "string" ? Bt(e, r) : (typeof r == "number" || typeof r == "bigint") && Bt(e, "" + r);
				break;
			case "onScroll":
				r != null && $("scroll", e);
				break;
			case "onScrollEnd":
				r != null && $("scrollend", e);
				break;
			case "onClick":
				r != null && (e.onclick = Jt);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": break;
			case "innerText":
			case "textContent": break;
			default: if (!gt.hasOwnProperty(n)) a: {
				if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), a = e[U] || null, a = a == null ? null : a[n], typeof a == "function" && e.removeEventListener(t, a, i), typeof r == "function")) {
					typeof a != "function" && a !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, i);
					break a;
				}
				n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : Ct(e, n, r);
			}
		}
	}
	function Pd(e, t, n) {
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
				$("error", e), $("load", e);
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
						default: Md(e, t, a, o, n, null);
					}
				}
				i && Md(e, t, "srcSet", n.srcSet, n, null), r && Md(e, t, "src", n.src, n, null);
				return;
			case "input":
				$("invalid", e);
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
						default: Md(e, t, r, d, n, null);
					}
				}
				Ft(e, a, c, l, u, o, i, !1);
				return;
			case "select":
				for (i in $("invalid", e), r = o = a = null, n) if (n.hasOwnProperty(i) && (c = n[i], c != null)) switch (i) {
					case "value":
						a = c;
						break;
					case "defaultValue":
						o = c;
						break;
					case "multiple": r = c;
					default: Md(e, t, i, c, n, null);
				}
				t = a, n = o, e.multiple = !!r, t == null ? n != null && Lt(e, !!r, n, !0) : Lt(e, !!r, t, !1);
				return;
			case "textarea":
				for (o in $("invalid", e), a = i = r = null, n) if (n.hasOwnProperty(o) && (c = n[o], c != null)) switch (o) {
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
					default: Md(e, t, o, c, n, null);
				}
				zt(e, r, i, a);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: Md(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				$("beforetoggle", e), $("toggle", e), $("cancel", e), $("close", e);
				break;
			case "iframe":
			case "object":
				$("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < gd.length; r++) $(gd[r], e);
				break;
			case "image":
				$("error", e), $("load", e);
				break;
			case "details":
				$("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": $("error", e), $("load", e);
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
					default: Md(e, t, u, r, n, null);
				}
				return;
			default: if (Wt(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && Nd(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && Md(e, t, c, r, n, null));
	}
	function Fd(e, t, n, r) {
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
						default: r.hasOwnProperty(m) || Md(e, t, m, null, r, f);
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
						default: m !== f && Md(e, t, p, m, r, f);
					}
				}
				Pt(e, o, c, l, u, d, a, i);
				return;
			case "select":
				for (a in m = o = c = p = null, n) if (l = n[a], n.hasOwnProperty(a) && l != null) switch (a) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(a) || Md(e, t, a, null, r, l);
				}
				for (i in r) if (a = r[i], l = n[i], r.hasOwnProperty(i) && (a != null || l != null)) switch (i) {
					case "value":
						p = a;
						break;
					case "defaultValue":
						c = a;
						break;
					case "multiple": o = a;
					default: a !== l && Md(e, t, i, a, r, l);
				}
				t = c, n = o, r = m, p == null ? !!r != !!n && (t == null ? Lt(e, !!n, n ? [] : "", !1) : Lt(e, !!n, t, !0)) : Lt(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (i = n[c], n.hasOwnProperty(c) && i != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: Md(e, t, c, null, r, i);
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
					default: i !== a && Md(e, t, o, i, r, a);
				}
				Rt(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: Md(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: Md(e, t, l, p, r, m);
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
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && Md(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(s(137, t));
						break;
					default: Md(e, t, u, p, r, m);
				}
				return;
			default: if (Wt(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && Nd(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || Nd(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && Md(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || Md(e, t, f, p, r, m);
	}
	function Id(e) {
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
	function Ld() {
		if (typeof performance.getEntriesByType == "function") {
			for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), r = 0; r < n.length; r++) {
				var i = n[r], a = i.transferSize, o = i.initiatorType, s = i.duration;
				if (a && s && Id(o)) {
					for (o = 0, s = i.responseEnd, r += 1; r < n.length; r++) {
						var c = n[r], l = c.startTime;
						if (l > s) break;
						var u = c.transferSize, d = c.initiatorType;
						u && Id(d) && (c = c.responseEnd, o += u * (c < s ? 1 : (s - l) / (c - l)));
					}
					if (--r, t += 8 * (a + o) / (i.duration / 1e3), e++, 10 < e) break;
				}
			}
			if (0 < e) return t / e / 1e6;
		}
		return navigator.connection && (e = navigator.connection.downlink, typeof e == "number") ? e : 5;
	}
	var Rd = null, zd = null;
	function Bd(e) {
		return e.nodeType === 9 ? e : e.ownerDocument;
	}
	function Vd(e) {
		switch (e) {
			case "http://www.w3.org/2000/svg": return 1;
			case "http://www.w3.org/1998/Math/MathML": return 2;
			default: return 0;
		}
	}
	function Hd(e, t) {
		if (e === 0) switch (t) {
			case "svg": return 1;
			case "math": return 2;
			default: return 0;
		}
		return e === 1 && t === "foreignObject" ? 0 : e;
	}
	function Ud(e, t) {
		return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
	}
	var Wd = null;
	function Gd() {
		var e = window.event;
		return e && e.type === "popstate" ? e === Wd ? !1 : (Wd = e, !0) : (Wd = null, !1);
	}
	var Kd = typeof setTimeout == "function" ? setTimeout : void 0, qd = typeof clearTimeout == "function" ? clearTimeout : void 0, Jd = typeof Promise == "function" ? Promise : void 0, Yd = typeof queueMicrotask == "function" ? queueMicrotask : Jd === void 0 ? Kd : function(e) {
		return Jd.resolve(null).then(e).catch(Xd);
	};
	function Xd(e) {
		setTimeout(function() {
			throw e;
		});
	}
	function Zd(e) {
		return e === "head";
	}
	function Qd(e, t) {
		var n = t, r = 0;
		do {
			var i = n.nextSibling;
			if (e.removeChild(n), i && i.nodeType === 8) if (n = i.data, n === "/$" || n === "/&") {
				if (r === 0) {
					e.removeChild(i), Np(t);
					return;
				}
				r--;
			} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
			else if (n === "html") pf(e.ownerDocument.documentElement);
			else if (n === "head") {
				n = e.ownerDocument.head, pf(n);
				for (var a = n.firstChild; a;) {
					var o = a.nextSibling, s = a.nodeName;
					a[ct] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
				}
			} else n === "body" && pf(e.ownerDocument.body);
			n = i;
		} while (n);
		Np(t);
	}
	function $d(e, t) {
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
	function ef(e) {
		var t = e.firstChild;
		for (t && t.nodeType === 10 && (t = t.nextSibling); t;) {
			var n = t;
			switch (t = t.nextSibling, n.nodeName) {
				case "HTML":
				case "HEAD":
				case "BODY":
					ef(n), lt(n);
					continue;
				case "SCRIPT":
				case "STYLE": continue;
				case "LINK": if (n.rel.toLowerCase() === "stylesheet") continue;
			}
			e.removeChild(n);
		}
	}
	function tf(e, t, n, r) {
		for (; e.nodeType === 1;) {
			var i = n;
			if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
				if (!r && (e.nodeName !== "INPUT" || e.type !== "hidden")) break;
			} else if (!r) if (t === "input" && e.type === "hidden") {
				var a = i.name == null ? null : "" + i.name;
				if (i.type === "hidden" && e.getAttribute("name") === a) return e;
			} else return e;
			else if (!e[ct]) switch (t) {
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
			if (e = cf(e.nextSibling), e === null) break;
		}
		return null;
	}
	function nf(e, t, n) {
		if (t === "") return null;
		for (; e.nodeType !== 3;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = cf(e.nextSibling), e === null)) return null;
		return e;
	}
	function rf(e, t) {
		for (; e.nodeType !== 8;) if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = cf(e.nextSibling), e === null)) return null;
		return e;
	}
	function af(e) {
		return e.data === "$?" || e.data === "$~";
	}
	function of(e) {
		return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading";
	}
	function sf(e, t) {
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
	function cf(e) {
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
	var lf = null;
	function uf(e) {
		e = e.nextSibling;
		for (var t = 0; e;) {
			if (e.nodeType === 8) {
				var n = e.data;
				if (n === "/$" || n === "/&") {
					if (t === 0) return cf(e.nextSibling);
					t--;
				} else n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++;
			}
			e = e.nextSibling;
		}
		return null;
	}
	function df(e) {
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
	function ff(e, t, n) {
		switch (t = Bd(n), e) {
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
	function pf(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		lt(e);
	}
	var mf = /* @__PURE__ */ new Map(), hf = /* @__PURE__ */ new Set();
	function gf(e) {
		return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
	}
	var _f = F.d;
	F.d = {
		f: vf,
		r: yf,
		D: Sf,
		C: Cf,
		L: wf,
		m: Tf,
		X: Df,
		S: Ef,
		M: Of
	};
	function vf() {
		var e = _f.f(), t = vu();
		return e || t;
	}
	function yf(e) {
		var t = dt(e);
		t !== null && t.tag === 5 && t.type === "form" ? bs(t) : _f.r(e);
	}
	var bf = typeof document > "u" ? null : document;
	function xf(e, t, n) {
		var r = bf;
		if (r && typeof t == "string" && t) {
			var i = Nt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), hf.has(i) || (hf.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), Pd(t, "link", e), mt(t), r.head.appendChild(t)));
		}
	}
	function Sf(e) {
		_f.D(e), xf("dns-prefetch", e, null);
	}
	function Cf(e, t) {
		_f.C(e, t), xf("preconnect", e, t);
	}
	function wf(e, t, n) {
		_f.L(e, t, n);
		var r = bf;
		if (r && e && t) {
			var i = "link[rel=\"preload\"][as=\"" + Nt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + Nt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + Nt(n.imageSizes) + "\"]")) : i += "[href=\"" + Nt(e) + "\"]";
			var a = i;
			switch (t) {
				case "style":
					a = Af(e);
					break;
				case "script": a = Pf(e);
			}
			mf.has(a) || (e = h({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), mf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(jf(a)) || t === "script" && r.querySelector(Ff(a)) || (t = r.createElement("link"), Pd(t, "link", e), mt(t), r.head.appendChild(t)));
		}
	}
	function Tf(e, t) {
		_f.m(e, t);
		var n = bf;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + Nt(r) + "\"][href=\"" + Nt(e) + "\"]", a = i;
			switch (r) {
				case "audioworklet":
				case "paintworklet":
				case "serviceworker":
				case "sharedworker":
				case "worker":
				case "script": a = Pf(e);
			}
			if (!mf.has(a) && (e = h({
				rel: "modulepreload",
				href: e
			}, t), mf.set(a, e), n.querySelector(i) === null)) {
				switch (r) {
					case "audioworklet":
					case "paintworklet":
					case "serviceworker":
					case "sharedworker":
					case "worker":
					case "script": if (n.querySelector(Ff(a))) return;
				}
				r = n.createElement("link"), Pd(r, "link", e), mt(r), n.head.appendChild(r);
			}
		}
	}
	function Ef(e, t, n) {
		_f.S(e, t, n);
		var r = bf;
		if (r && e) {
			var i = pt(r).hoistableStyles, a = Af(e);
			t ||= "default";
			var o = i.get(a);
			if (!o) {
				var s = {
					loading: 0,
					preload: null
				};
				if (o = r.querySelector(jf(a))) s.loading = 5;
				else {
					e = h({
						rel: "stylesheet",
						href: e,
						"data-precedence": t
					}, n), (n = mf.get(a)) && Rf(e, n);
					var c = o = r.createElement("link");
					mt(c), Pd(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, Lf(o, t, r);
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
	function Df(e, t) {
		_f.X(e, t);
		var n = bf;
		if (n && e) {
			var r = pt(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
				src: e,
				async: !0
			}, t), (t = mf.get(i)) && zf(e, t), a = n.createElement("script"), mt(a), Pd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Of(e, t) {
		_f.M(e, t);
		var n = bf;
		if (n && e) {
			var r = pt(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = mf.get(i)) && zf(e, t), a = n.createElement("script"), mt(a), Pd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function kf(e, t, n, r) {
		var i = (i = B.current) ? gf(i) : null;
		if (!i) throw Error(s(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = Af(n.href), n = pt(i).hoistableStyles, r = n.get(t), r || (r = {
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
					e = Af(n.href);
					var a = pt(i).hoistableStyles, o = a.get(e);
					if (o || (i = i.ownerDocument || i, o = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, a.set(e, o), (a = i.querySelector(jf(e))) && !a._p && (o.instance = a, o.state.loading = 5), mf.has(e) || (n = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, mf.set(e, n), a || Nf(i, e, n, o.state))), t && r === null) throw Error(s(528, ""));
					return o;
				}
				if (t && r !== null) throw Error(s(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Pf(n), n = pt(i).hoistableScripts, r = n.get(t), r || (r = {
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
	function Af(e) {
		return "href=\"" + Nt(e) + "\"";
	}
	function jf(e) {
		return "link[rel=\"stylesheet\"][" + e + "]";
	}
	function Mf(e) {
		return h({}, e, {
			"data-precedence": e.precedence,
			precedence: null
		});
	}
	function Nf(e, t, n, r) {
		e.querySelector("link[rel=\"preload\"][as=\"style\"][" + t + "]") ? r.loading = 1 : (t = e.createElement("link"), r.preload = t, t.addEventListener("load", function() {
			return r.loading |= 1;
		}), t.addEventListener("error", function() {
			return r.loading |= 2;
		}), Pd(t, "link", n), mt(t), e.head.appendChild(t));
	}
	function Pf(e) {
		return "[src=\"" + Nt(e) + "\"]";
	}
	function Ff(e) {
		return "script[async]" + e;
	}
	function If(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + Nt(n.href) + "\"]");
				if (r) return t.instance = r, mt(r), r;
				var i = h({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), mt(r), Pd(r, "style", i), Lf(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = Af(n.href);
				var a = e.querySelector(jf(i));
				if (a) return t.state.loading |= 4, t.instance = a, mt(a), a;
				r = Mf(n), (i = mf.get(i)) && Rf(r, i), a = (e.ownerDocument || e).createElement("link"), mt(a);
				var o = a;
				return o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Pd(a, "link", r), t.state.loading |= 4, Lf(a, n.precedence, e), t.instance = a;
			case "script": return a = Pf(n.src), (i = e.querySelector(Ff(a))) ? (t.instance = i, mt(i), i) : (r = n, (i = mf.get(a)) && (r = h({}, n), zf(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), mt(i), Pd(i, "link", r), e.head.appendChild(i), t.instance = i);
			case "void": return null;
			default: throw Error(s(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, Lf(r, n.precedence, e));
		return t.instance;
	}
	function Lf(e, t, n) {
		for (var r = n.querySelectorAll("link[rel=\"stylesheet\"][data-precedence],style[data-precedence]"), i = r.length ? r[r.length - 1] : null, a = i, o = 0; o < r.length; o++) {
			var s = r[o];
			if (s.dataset.precedence === t) a = s;
			else if (a !== i) break;
		}
		a ? a.parentNode.insertBefore(e, a.nextSibling) : (t = n.nodeType === 9 ? n.head : n, t.insertBefore(e, t.firstChild));
	}
	function Rf(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.title ??= t.title;
	}
	function zf(e, t) {
		e.crossOrigin ??= t.crossOrigin, e.referrerPolicy ??= t.referrerPolicy, e.integrity ??= t.integrity;
	}
	var Bf = null;
	function Vf(e, t, n) {
		if (Bf === null) {
			var r = /* @__PURE__ */ new Map(), i = Bf = /* @__PURE__ */ new Map();
			i.set(n, r);
		} else i = Bf, r = i.get(n), r || (r = /* @__PURE__ */ new Map(), i.set(n, r));
		if (r.has(e)) return r;
		for (r.set(e, null), n = n.getElementsByTagName(e), i = 0; i < n.length; i++) {
			var a = n[i];
			if (!(a[ct] || a[nt] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
				var o = a.getAttribute(t) || "";
				o = e + o;
				var s = r.get(o);
				s ? s.push(a) : r.set(o, [a]);
			}
		}
		return r;
	}
	function Hf(e, t, n) {
		e = e.ownerDocument || e, e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null);
	}
	function Uf(e, t, n) {
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
	function Wf(e) {
		return !(e.type === "stylesheet" && !(e.state.loading & 3));
	}
	function Gf(e, t, n, r) {
		if (n.type === "stylesheet" && (typeof r.media != "string" || !1 !== matchMedia(r.media).matches) && !(n.state.loading & 4)) {
			if (n.instance === null) {
				var i = Af(r.href), a = t.querySelector(jf(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Jf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, mt(a);
					return;
				}
				a = t.ownerDocument || t, r = Mf(r), (i = mf.get(i)) && Rf(r, i), a = a.createElement("link"), mt(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Pd(a, "link", r), n.instance = a;
			}
			e.stylesheets === null && (e.stylesheets = /* @__PURE__ */ new Map()), e.stylesheets.set(n, t), (t = n.state.preload) && !(n.state.loading & 3) && (e.count++, n = Jf.bind(e), t.addEventListener("load", n), t.addEventListener("error", n));
		}
	}
	var Kf = 0;
	function qf(e, t) {
		return e.stylesheets && e.count === 0 && Xf(e, e.stylesheets), 0 < e.count || 0 < e.imgCount ? function(n) {
			var r = setTimeout(function() {
				if (e.stylesheets && Xf(e, e.stylesheets), e.unsuspend) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, 6e4 + t);
			0 < e.imgBytes && Kf === 0 && (Kf = 62500 * Ld());
			var i = setTimeout(function() {
				if (e.waitingForImages = !1, e.count === 0 && (e.stylesheets && Xf(e, e.stylesheets), e.unsuspend)) {
					var t = e.unsuspend;
					e.unsuspend = null, t();
				}
			}, (e.imgBytes > Kf ? 50 : 800) + t);
			return e.unsuspend = n, function() {
				e.unsuspend = null, clearTimeout(r), clearTimeout(i);
			};
		} : null;
	}
	function Jf() {
		if (this.count--, this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
			if (this.stylesheets) Xf(this, this.stylesheets);
			else if (this.unsuspend) {
				var e = this.unsuspend;
				this.unsuspend = null, e();
			}
		}
	}
	var Yf = null;
	function Xf(e, t) {
		e.stylesheets = null, e.unsuspend !== null && (e.count++, Yf = /* @__PURE__ */ new Map(), t.forEach(Zf, e), Yf = null, Jf.call(e));
	}
	function Zf(e, t) {
		if (!(t.state.loading & 4)) {
			var n = Yf.get(e);
			if (n) var r = n.get(null);
			else {
				n = /* @__PURE__ */ new Map(), Yf.set(e, n);
				for (var i = e.querySelectorAll("link[data-precedence],style[data-precedence]"), a = 0; a < i.length; a++) {
					var o = i[a];
					(o.nodeName === "LINK" || o.getAttribute("media") !== "not all") && (n.set(o.dataset.precedence, o), r = o);
				}
				r && n.set(null, r);
			}
			i = t.instance, o = i.getAttribute("data-precedence"), a = n.get(o) || r, a === r && n.set(null, i), n.set(o, i), this.count++, r = Jf.bind(this), i.addEventListener("load", r), i.addEventListener("error", r), a ? a.parentNode.insertBefore(i, a.nextSibling) : (e = e.nodeType === 9 ? e.head : e, e.insertBefore(i, e.firstChild)), t.state.loading |= 4;
		}
	}
	var Qf = {
		$$typeof: C,
		Provider: null,
		Consumer: null,
		_currentValue: ne,
		_currentValue2: ne,
		_threadCount: 0
	};
	function $f(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Ge(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ge(0), this.hiddenUpdates = Ge(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function ep(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new $f(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = ni(3, null, null, t), e.current = a, a.stateNode = e, t = ta(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, Na(a), e;
	}
	function tp(e) {
		return e ? (e = ei, e) : ei;
	}
	function np(e, t, n, r, i, a) {
		i = tp(i), r.context === null ? r.context = i : r.pendingContext = i, r = Fa(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = Ia(e, r, t), n !== null && (pu(n, e, t), La(n, e, t));
	}
	function rp(e, t) {
		if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
			var n = e.retryLane;
			e.retryLane = n !== 0 && n < t ? n : t;
		}
	}
	function ip(e, t) {
		rp(e, t), (e = e.alternate) && rp(e, t);
	}
	function ap(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = Zr(e, 67108864);
			t !== null && pu(t, e, 67108864), ip(e, 67108864);
		}
	}
	function op(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = du();
			t = Ze(t);
			var n = Zr(e, t);
			n !== null && pu(n, e, t), ip(e, t);
		}
	}
	var sp = !0;
	function cp(e, t, n, r) {
		var i = P.T;
		P.T = null;
		var a = F.p;
		try {
			F.p = 2, up(e, t, n, r);
		} finally {
			F.p = a, P.T = i;
		}
	}
	function lp(e, t, n, r) {
		var i = P.T;
		P.T = null;
		var a = F.p;
		try {
			F.p = 8, up(e, t, n, r);
		} finally {
			F.p = a, P.T = i;
		}
	}
	function up(e, t, n, r) {
		if (sp) {
			var i = dp(r);
			if (i === null) Cd(e, t, r, fp, n), Cp(e, r);
			else if (Tp(i, e, t, n, r)) r.stopPropagation();
			else if (Cp(e, r), t & 4 && -1 < Sp.indexOf(e)) {
				for (; i !== null;) {
					var a = dt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = Be(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - Ne(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									nd(a), !(Pl & 6) && ($l = xe() + 500, rd(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Zr(a, 2), s !== null && pu(s, a, 2), vu(), ip(a, 2);
					}
					if (a = dp(r), a === null && Cd(e, t, r, fp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Cd(e, t, r, null, n);
		}
	}
	function dp(e) {
		return e = Xt(e), pp(e);
	}
	var fp = null;
	function pp(e) {
		if (fp = null, e = ut(e), e !== null) {
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
		return fp = e, null;
	}
	function mp(e) {
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
			case "message": switch (Se()) {
				case Ce: return 2;
				case we: return 8;
				case Te:
				case Ee: return 32;
				case De: return 268435456;
				default: return 32;
			}
			default: return 32;
		}
	}
	var hp = !1, gp = null, _p = null, vp = null, yp = /* @__PURE__ */ new Map(), bp = /* @__PURE__ */ new Map(), xp = [], Sp = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
	function Cp(e, t) {
		switch (e) {
			case "focusin":
			case "focusout":
				gp = null;
				break;
			case "dragenter":
			case "dragleave":
				_p = null;
				break;
			case "mouseover":
			case "mouseout":
				vp = null;
				break;
			case "pointerover":
			case "pointerout":
				yp.delete(t.pointerId);
				break;
			case "gotpointercapture":
			case "lostpointercapture": bp.delete(t.pointerId);
		}
	}
	function wp(e, t, n, r, i, a) {
		return e === null || e.nativeEvent !== a ? (e = {
			blockedOn: t,
			domEventName: n,
			eventSystemFlags: r,
			nativeEvent: a,
			targetContainers: [i]
		}, t !== null && (t = dt(t), t !== null && ap(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
	}
	function Tp(e, t, n, r, i) {
		switch (t) {
			case "focusin": return gp = wp(gp, e, t, n, r, i), !0;
			case "dragenter": return _p = wp(_p, e, t, n, r, i), !0;
			case "mouseover": return vp = wp(vp, e, t, n, r, i), !0;
			case "pointerover":
				var a = i.pointerId;
				return yp.set(a, wp(yp.get(a) || null, e, t, n, r, i)), !0;
			case "gotpointercapture": return a = i.pointerId, bp.set(a, wp(bp.get(a) || null, e, t, n, r, i)), !0;
		}
		return !1;
	}
	function Ep(e) {
		var t = ut(e.target);
		if (t !== null) {
			var n = l(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = u(n), t !== null) {
						e.blockedOn = t, et(e.priority, function() {
							op(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = d(n), t !== null) {
						e.blockedOn = t, et(e.priority, function() {
							op(n);
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
	function Dp(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = dp(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				Yt = r, n.target.dispatchEvent(r), Yt = null;
			} else return t = dt(n), t !== null && ap(t), e.blockedOn = n, !1;
			t.shift();
		}
		return !0;
	}
	function Op(e, t, n) {
		Dp(e) && n.delete(t);
	}
	function kp() {
		hp = !1, gp !== null && Dp(gp) && (gp = null), _p !== null && Dp(_p) && (_p = null), vp !== null && Dp(vp) && (vp = null), yp.forEach(Op), bp.forEach(Op);
	}
	function Ap(e, n) {
		e.blockedOn === n && (e.blockedOn = null, hp || (hp = !0, t.unstable_scheduleCallback(t.unstable_NormalPriority, kp)));
	}
	var jp = null;
	function Mp(e) {
		jp !== e && (jp = e, t.unstable_scheduleCallback(t.unstable_NormalPriority, function() {
			jp === e && (jp = null);
			for (var t = 0; t < e.length; t += 3) {
				var n = e[t], r = e[t + 1], i = e[t + 2];
				if (typeof r != "function") {
					if (pp(r || n) === null) continue;
					break;
				}
				var a = dt(n);
				a !== null && (e.splice(t, 3), t -= 3, vs(a, {
					pending: !0,
					data: i,
					method: n.method,
					action: r
				}, r, i));
			}
		}));
	}
	function Np(e) {
		function t(t) {
			return Ap(t, e);
		}
		gp !== null && Ap(gp, e), _p !== null && Ap(_p, e), vp !== null && Ap(vp, e), yp.forEach(t), bp.forEach(t);
		for (var n = 0; n < xp.length; n++) {
			var r = xp[n];
			r.blockedOn === e && (r.blockedOn = null);
		}
		for (; 0 < xp.length && (n = xp[0], n.blockedOn === null);) Ep(n), n.blockedOn === null && xp.shift();
		if (n = (e.ownerDocument || e).$$reactFormReplay, n != null) for (r = 0; r < n.length; r += 3) {
			var i = n[r], a = n[r + 1], o = i[U] || null;
			if (typeof a == "function") o || Mp(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[U] || null) s = o.formAction;
					else if (pp(i) !== null) continue;
				} else s = o.action;
				typeof s == "function" ? n[r + 1] = s : (n.splice(r, 3), r -= 3), Mp(n);
			}
		}
	}
	function Pp() {
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
	function Fp(e) {
		this._internalRoot = e;
	}
	Ip.prototype.render = Fp.prototype.render = function(e) {
		var t = this._internalRoot;
		if (t === null) throw Error(s(409));
		var n = t.current;
		np(n, du(), e, t, null, null);
	}, Ip.prototype.unmount = Fp.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			np(e.current, 2, null, e, null, null), vu(), t[rt] = null;
		}
	};
	function Ip(e) {
		this._internalRoot = e;
	}
	Ip.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = $e();
			e = {
				blockedOn: null,
				target: e,
				priority: t
			};
			for (var n = 0; n < xp.length && t !== 0 && t < xp[n].priority; n++);
			xp.splice(n, 0, e), n === 0 && Ep(e);
		}
	};
	var Lp = r.version;
	if (Lp !== "19.2.7") throw Error(s(527, Lp, "19.2.7"));
	F.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(s(188)) : (e = Object.keys(e).join(","), Error(s(268, e)));
		return e = p(t), e = e === null ? null : m(e), e = e === null ? null : e.stateNode, e;
	};
	var Rp = {
		bundleType: 0,
		version: "19.2.7",
		rendererPackageName: "react-dom",
		currentDispatcherRef: P,
		reconcilerVersion: "19.2.7"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var zp = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!zp.isDisabled && zp.supportsFiber) try {
			Ae = zp.inject(Rp), je = zp;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!c(e)) throw Error(s(299));
		var n = !1, r = "", i = Vs, a = Hs, o = Us;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = ep(e, 1, !1, null, null, n, r, null, i, a, o, Pp), e[rt] = t.current, xd(e), new Fp(t);
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
function _({ card: e, faceDown: t = !1, size: n = "md", state: r = "default", badge: i, onClick: a, onPlayClick: o, pointerHandlers: s, pressed: c = !1, playing: l = !1, playable: u = !1, illegalShake: p = !1, disabled: h = !1, ariaLabel: _, "data-testid": v, "data-card-index": y, "data-playable": b }) {
	let x = !!s, S = (x || typeof a == "function") && !h, C = [
		"pcard",
		`pcard--${n}`,
		`pcard--${r}`,
		S ? "pcard--interactive" : "",
		u ? "pcard--playable" : "",
		c ? "pcard--pressed" : "",
		l ? "pcard--playing" : "",
		p ? "pcard--illegal-shake" : "",
		h ? "pcard--disabled" : ""
	].filter(Boolean).join(" ");
	if (t || !e) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: `${C} pcard--back`,
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
	let w = m(e.suit), T = d[e.suit], E = _ ?? `${e.rank} of ${f[e.suit]}`, D = `pcard--suit-${e.suit}`, O = /* @__PURE__ */ (0, g.jsxs)("span", {
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
					children: T
				})]
			}),
			/* @__PURE__ */ (0, g.jsx)("span", {
				className: "pcard__center",
				children: T
			}),
			/* @__PURE__ */ (0, g.jsxs)("span", {
				className: "pcard__corner pcard__corner--br",
				children: [/* @__PURE__ */ (0, g.jsx)("span", {
					className: "pcard__rank",
					children: e.rank
				}), /* @__PURE__ */ (0, g.jsx)("span", {
					className: "pcard__suit",
					children: T
				})]
			})
		]
	});
	return S ? /* @__PURE__ */ (0, g.jsx)("button", {
		type: "button",
		className: `${C} ${w ? "pcard--red" : "pcard--black"} ${D}`,
		onClick: x && u && o ? (e) => {
			e.preventDefault(), o();
		} : x ? void 0 : a,
		disabled: h,
		"aria-disabled": h || void 0,
		"aria-busy": l || void 0,
		"aria-label": E,
		"data-testid": v,
		"data-card-index": y,
		"data-playable": b,
		...s,
		children: O
	}) : /* @__PURE__ */ (0, g.jsx)("div", {
		className: `${C} ${w ? "pcard--red" : "pcard--black"} ${D}`,
		role: "img",
		"aria-label": E,
		"aria-disabled": h || void 0,
		"data-testid": v,
		"data-card-index": y,
		"data-playable": b,
		children: O
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
		!t || t.fired || (t.fired = !0, f(), p(), s.current.onPlay?.());
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
//#endregion
//#region src/components/handLayout.ts
function O(e, t, n, r) {
	let i = r?.minVisiblePx ?? 30, a = r?.maxGapPx ?? 6, o = Math.max(0, t), s = Math.max(0, e), c = Math.max(1, n);
	if (o <= 1 || s <= 0) return 0;
	let l = Math.max(8, c - i), u = c + a, d = (s - c) / (o - 1);
	return Math.round(Math.min(u, Math.max(l, d)) - c);
}
function k(e) {
	return e === "lg" ? 96 : e === "md" ? 72 : 52;
}
//#endregion
//#region src/components/Hand.tsx
var A = (e) => T(e);
function j({ card: e, index: t, size: n, state: r, badge: i, cardTestId: a, cardInteraction: o, onCardClick: s, onCardPeek: c, peekActive: u, slotClassFor: d, style: f }) {
	let [p, m] = (0, l.useState)(!1), h = o, v = h?.mode === "play", y = h?.mode === "draw-select", b = h?.mode === "peek", x = h?.isMyTurn === !0, S = !h?.legalPlayIndices || h.legalPlayIndices.includes(t), C = v && x && S && !h?.busy, T = h?.playingIndex === t, E = v && x && !S && !h?.busy && !T, D = y && r === "draw-selected", O = !!h?.busy || T || v && !x || y && !x, k = O || v && !S || y && !x, A = w({
		disabled: O || !C && !y && !b && !E,
		mode: E ? "draw-select" : h?.mode ?? "none",
		onPlay: C ? () => h?.onPlayCard?.(t) : void 0,
		onSelect: y && x ? () => h?.onSelectCard?.(t) : E ? () => h?.onIllegalPlay?.(t) : void 0,
		onPeekStart: b ? () => c?.(t) : void 0,
		onPeekEnd: b ? () => c?.(null) : void 0,
		onPressChange: m
	}), j = !!h && (h?.mode !== "none" || E), M = v && x ? C ? a : "play-button-disabled" : a;
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: [
			"hand__slot",
			u ? "hand__slot--peek" : "",
			D ? "hand__slot--draw-selected" : "",
			d?.(e, t) ?? ""
		].filter(Boolean).join(" "),
		style: f,
		"aria-selected": D ? !0 : void 0,
		"data-trick-play-origin-active": h?.playingIndex === t && h.trickPlayOriginPlayerId ? h.trickPlayOriginPlayerId : void 0,
		children: /* @__PURE__ */ (0, g.jsx)(_, {
			card: e,
			size: n,
			state: k && v && !E ? "disabled" : r,
			badge: i,
			onClick: !j && s ? () => s(e, t) : void 0,
			onPlayClick: j && C ? () => h?.onPlayCard?.(t) : void 0,
			pointerHandlers: j ? A : void 0,
			pressed: p,
			playing: T,
			playable: C,
			illegalShake: h?.illegalShakeIndex === t,
			disabled: O && (v || y) && !E,
			"data-testid": M,
			"data-card-index": t,
			"data-playable": v ? C ? "true" : "false" : void 0
		})
	});
}
function M({ cards: e, size: t = "md", stateFor: n, badgeFor: r, onCardClick: i, onCardPeek: a, peekIndex: o = null, fan: s = !1, cardTestId: c, cardInteraction: u, slotClassFor: d }) {
	let f = (0, l.useRef)(null);
	return (0, l.useLayoutEffect)(() => {
		if (!s || typeof window > "u") return;
		let n = f.current;
		if (!n) return;
		let r = k(t), i = () => {
			let t = O(n.clientWidth, e.length, r);
			n.style.setProperty("--hand-fan-overlap", `${t}px`), n.style.setProperty("--hand-card-w", `${r}px`);
		}, a = new ResizeObserver(i);
		return a.observe(n), i(), () => a.disconnect();
	}, [
		s,
		e.length,
		t
	]), /* @__PURE__ */ (0, g.jsx)("div", {
		ref: f,
		className: `hand ${s ? "hand--fan" : ""} ${u ? "hand--pointer" : ""}`,
		style: s ? { "--hand-count": e.length } : void 0,
		children: /* @__PURE__ */ (0, g.jsx)("div", {
			className: "hand__fan-stage",
			children: e.map((e, l) => /* @__PURE__ */ (0, g.jsx)(j, {
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
				slotClassFor: d
			}, A(e)))
		})
	});
}
//#endregion
//#region src/table/animations/motionTokens.ts
var N = "power3.out", ee = "power2.inOut", te = "back.out(1.35)", P = {
	deal: .62,
	dealStagger: .11,
	playToTable: .58,
	drawDiscard: .56,
	drawReceive: .6,
	drawReceiveStagger: .085,
	trumpReveal: .64,
	trumpMerge: .62,
	standPat: .68,
	foldOut: .56,
	hoverLift: .38
};
function F(e = I()) {
	return e ? .35 : 1;
}
function ne(e, t = I()) {
	return Math.max(.12, e * F(t));
}
function I() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region node_modules/gsap/gsap-core.js
function L(e) {
	if (e === void 0) throw ReferenceError("this hasn't been initialised - super() hasn't been called");
	return e;
}
function re(e, t) {
	e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t;
}
var R = {
	autoSleep: 120,
	force3D: "auto",
	nullTargetWarn: 1,
	units: { lineHeight: "" }
}, z = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, ie, ae, B, oe = 1e8, V = 1 / oe, se = Math.PI * 2, ce = se / 4, le = 0, ue = Math.sqrt, de = Math.cos, fe = Math.sin, pe = function(e) {
	return typeof e == "string";
}, me = function(e) {
	return typeof e == "function";
}, he = function(e) {
	return typeof e == "number";
}, ge = function(e) {
	return e === void 0;
}, H = function(e) {
	return typeof e == "object";
}, _e = function(e) {
	return e !== !1;
}, ve = function() {
	return typeof window < "u";
}, ye = function(e) {
	return me(e) || pe(e);
}, be = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, xe = Array.isArray, Se = /(?:-?\.?\d|\.)+/gi, Ce = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, we = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, Te = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, Ee = /[+-]=-?[.\d]+/, De = /[^,'"\[\]\s]+/gi, Oe = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, ke, Ae, je, Me, Ne = {}, Pe = {}, Fe, Ie = function(e) {
	return (Pe = ft(e, Ne)) && Mr;
}, Le = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, Re = function(e, t) {
	return !t && console.warn(e);
}, ze = function(e, t) {
	return e && (Ne[e] = t) && Pe && (Pe[e] = t) || Ne;
}, Be = function() {
	return 0;
}, Ve = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, He = {
	suppressEvents: !0,
	kill: !1
}, Ue = { suppressEvents: !0 }, We = {}, Ge = [], Ke = {}, qe, Je = {}, Ye = {}, Xe = 30, Ze = [], Qe = "", $e = function(e) {
	var t = e[0], n, r;
	if (H(t) || me(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = Ze.length; r-- && !Ze[r].targetTest(t););
		n = Ze[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new Hn(e[r], n))) || e.splice(r, 1);
	return e;
}, et = function(e) {
	return e._gsap || $e(Yt(e))[0]._gsap;
}, tt = function(e, t, n) {
	return (n = e[t]) && me(n) ? e[t]() : ge(n) && e.getAttribute && e.getAttribute(t) || n;
}, nt = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, U = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, rt = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, it = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, at = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, ot = function() {
	var e = Ge.length, t = Ge.slice(0), n, r;
	for (Ke = {}, Ge.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, st = function(e, t, n, r) {
	Ge.length && !ae && ot(), e.render(t, n, r || ae && t < 0 && (e._initted || e._startAt)), Ge.length && !ae && ot();
}, ct = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(De).length < 2 ? t : pe(e) ? e.trim() : e;
}, lt = function(e) {
	return e;
}, ut = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, dt = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, ft = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, pt = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = H(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, mt = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, ht = function(e) {
	var t = e.parent || ke, n = e.keyframes ? dt(xe(e.keyframes)) : ut;
	if (_e(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, gt = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, _t = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, vt = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, yt = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, bt = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, xt = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, St = function(e, t, n, r) {
	return e._startAt && (ae ? e._startAt.revert(He) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, Ct = function e(t) {
	return !t || t._ts && e(t.parent);
}, wt = function(e) {
	return e._repeat ? Tt(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, Tt = function(e, t) {
	var n = Math.floor(e = rt(e / t));
	return e && n === e ? n - 1 : n;
}, Et = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, Dt = function(e) {
	return e._end = rt(e._start + (e._tDur / Math.abs(e._ts || e._rts || V) || 0));
}, Ot = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = rt(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), Dt(e), n._dirty || bt(n, e)), e;
}, kt = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = Et(e.rawTime(), t), (!t._dur || Ut(0, t.totalDuration(), n) - t._tTime > V) && t.render(n, !0)), bt(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -V;
	}
}, At = function(e, t, n, r) {
	return t.parent && yt(t), t._start = rt((he(n) ? n : n || e !== ke ? Bt(e, n, t) : e._time) + t._delay), t._end = rt(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), _t(e, t, "_first", "_last", e._sort ? "_start" : 0), Pt(t) || (e._recent = t), r || kt(e, t), e._ts < 0 && Ot(e, e._tTime), e;
}, jt = function(e, t) {
	return (Ne.ScrollTrigger || Le("scrollTrigger", t)) && Ne.ScrollTrigger.create(t, e);
}, Mt = function(e, t, n, r, i) {
	if (Zn(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !ae && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && qe !== On.frame) return Ge.push(e), e._lazy = [i, r], 1;
}, Nt = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, Pt = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, Ft = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && Nt(e) && !(!e._initted && Pt(e)) || (e._ts < 0 || e._dp._ts < 0) && !Pt(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = Ut(0, e._tDur, t), l = Tt(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== Tt(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || ae || r || e._zTime === V || !t && e._zTime) {
		if (!e._initted && Mt(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? V : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && St(e, t, n, !0), e._onUpdate && !n && pn(e, "onUpdate"), s && e._repeat && !n && e.parent && pn(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && yt(e, 1), !n && !ae && (pn(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, It = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, Lt = function(e, t, n, r) {
	var i = e._repeat, a = rt(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : rt(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && Ot(e, e._tTime = e._tDur * o), e.parent && Dt(e), n || bt(e.parent, e), e;
}, Rt = function(e) {
	return e instanceof Wn ? bt(e) : Lt(e, e._dur);
}, zt = {
	_start: 0,
	endTime: Be,
	totalDuration: Be
}, Bt = function e(t, n, r) {
	var i = t.labels, a = t._recent || zt, o = t.duration() >= oe ? a.endTime(!1) : t._dur, s, c, l;
	return pe(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (xe(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, Vt = function(e, t, n) {
	var r = he(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = _e(s.vars.inherit) && s.parent;
		a.immediateRender = _e(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new ir(t[0], a, t[i + 1]);
}, Ht = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, Ut = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, Wt = function(e, t) {
	return !pe(e) || !(t = Oe.exec(e)) ? "" : t[1];
}, Gt = function(e, t, n) {
	return Ht(n, function(n) {
		return Ut(e, t, n);
	});
}, Kt = [].slice, qt = function(e, t) {
	return e && H(e) && "length" in e && (!t && !e.length || e.length - 1 in e && H(e[0])) && !e.nodeType && e !== Ae;
}, Jt = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return pe(e) && !t || qt(e, 1) ? (r = n).push.apply(r, Yt(e)) : n.push(e);
	}) || n;
}, Yt = function(e, t, n) {
	return B && !t && B.selector ? B.selector(e) : pe(e) && !n && (je || !kn()) ? Kt.call((t || Me).querySelectorAll(e), 0) : xe(e) ? Jt(e, n) : qt(e) ? Kt.call(e, 0) : e ? [e] : [];
}, Xt = function(e) {
	return e = Yt(e)[0] || Re("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return Yt(t, n.querySelectorAll ? n : n === e ? Re("Invalid scope") || Me.createElement("div") : e);
	};
}, Zt = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, Qt = function(e) {
	if (me(e)) return e;
	var t = H(e) ? e : { each: e }, n = Ln(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return pe(r) ? l = u = {
		center: .5,
		edges: .5,
		end: 1
	}[r] || 0 : !o && s && (l = r[0], u = r[1]), function(e, o, d) {
		var f = (d || t).length, p = a[f], m, h, g, _, v, y, b, x, S;
		if (!p) {
			if (S = t.grid === "auto" ? 0 : (t.grid || [1, oe])[1], !S) {
				for (b = -oe; b < (b = d[S++].getBoundingClientRect().left) && S < f;);
				S < f && S--;
			}
			for (p = a[f] = [], m = s ? Math.min(S, f) * l - .5 : r % S, h = S === oe ? 0 : s ? f * u / S - .5 : r / S | 0, b = 0, x = oe, y = 0; y < f; y++) g = y % S - m, _ = h - (y / S | 0), p[y] = v = c ? Math.abs(c === "y" ? _ : g) : ue(g * g + _ * _), v > b && (b = v), v < x && (x = v);
			r === "random" && Zt(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = Wt(t.amount || t.each) || 0, n = n && f < 0 ? Fn(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, rt(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, $t = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = rt(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (he(n) ? 0 : Wt(n));
	};
}, en = function(e, t) {
	var n = xe(e), r, i;
	return !n && H(e) && (r = n = e.radius || oe, e.values ? (e = Yt(e.values), (i = !he(e[0])) && (r *= r)) : e = $t(e.increment)), Ht(t, n ? me(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = oe, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || he(t) ? s : s + Wt(t);
	} : $t(e));
}, tn = function(e, t, n, r) {
	return Ht(xe(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return xe(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, nn = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, rn = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || Wt(n));
	};
}, an = function(e, t, n) {
	return un(e, t, 0, 1, n);
}, on = function(e, t, n) {
	return Ht(n, function(n) {
		return e[~~t(n)];
	});
}, sn = function e(t, n, r) {
	var i = n - t;
	return xe(t) ? on(t, e(0, t.length), n) : Ht(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, cn = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return xe(t) ? on(t, e(0, t.length - 1), n) : Ht(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, ln = function(e) {
	for (var t = 0, n = "", r, i, a, o; ~(r = e.indexOf("random(", t));) a = e.indexOf(")", r), o = e.charAt(r + 7) === "[", i = e.substr(r + 7, a - r - 7).match(o ? De : Se), n += e.substr(t, r - t) + tn(o ? i : +i[0], o ? 0 : +i[1], +i[2] || 1e-5), t = a + 1;
	return n + e.substr(t, e.length - t);
}, un = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return Ht(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, dn = function e(t, n, r, i) {
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
		} else i || (t = ft(xe(t) ? [] : {}, t));
		if (!u) {
			for (c in n) Kn.call(s, t, c, "get", n[c]);
			a = function(e) {
				return pr(e, s) || (o ? t.p : t);
			};
		}
	}
	return Ht(r, a);
}, fn = function(e, t, n) {
	var r = e.labels, i = oe, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, pn = function(e, t, n) {
	var r = e.vars, i = r[t], a = B, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && Ge.length && ot(), o && (B = o), l = s ? i.apply(c, s) : i.call(c), B = a, l;
}, mn = function(e) {
	return yt(e), e.scrollTrigger && e.scrollTrigger.kill(!!ae), e.progress() < 1 && pn(e, "onInterrupt"), e;
}, hn, gn = [], _n = function(e) {
	if (e) if (e = !e.name && e.default || e, ve() || e.headless) {
		var t = e.name, n = me(e), r = t && !n && e.init ? function() {
			this._props = [];
		} : e, i = {
			init: Be,
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
		if (kn(), e !== r) {
			if (Je[t]) return;
			ut(r, ut(mt(e, i), a)), ft(r.prototype, ft(i, mt(e, a))), Je[r.prop = t] = r, e.targetTest && (Ze.push(r), We[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
		}
		ze(t, r), e.register && e.register(Mr, r, vr);
	} else gn.push(e);
}, vn = 255, yn = {
	aqua: [
		0,
		vn,
		vn
	],
	lime: [
		0,
		vn,
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
		vn
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		vn,
		vn,
		vn
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		vn,
		vn,
		0
	],
	orange: [
		vn,
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
		vn,
		0,
		0
	],
	pink: [
		vn,
		192,
		203
	],
	cyan: [
		0,
		vn,
		vn
	],
	transparent: [
		vn,
		vn,
		vn,
		0
	]
}, bn = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * vn + .5 | 0;
}, xn = function(e, t, n) {
	var r = e ? he(e) ? [
		e >> 16,
		e >> 8 & vn,
		e & vn
	] : 0 : yn.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), yn[e]) r = yn[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & vn,
				r & vn,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & vn,
				e & vn
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(Se), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = bn(s + 1 / 3, i, a), r[1] = bn(s, i, a), r[2] = bn(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(Ce), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(Se) || yn.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / vn, a = r[1] / vn, o = r[2] / vn, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, Sn = function(e) {
	var t = [], n = [], r = -1;
	return e.split(wn).forEach(function(e) {
		var i = e.match(we) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, Cn = function(e, t, n) {
	var r = "", i = (e + r).match(wn), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = xn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = Sn(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(wn, "1").split(we), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(wn), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, wn = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in yn) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), Tn = /hsl[a]?\(/, En = function(e) {
	var t = e.join(" "), n;
	if (wn.lastIndex = 0, wn.test(t)) return n = Tn.test(t), e[1] = Cn(e[1], n), e[0] = Cn(e[0], n, Sn(e[1])), !0;
}, Dn, On = function() {
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
			Fe && (!je && ve() && (Ae = je = window, Me = Ae.document || {}, Ne.gsap = Mr, (Ae.gsapVersions ||= []).push(Mr.version), Ie(Pe || Ae.GreenSockGlobals || !Ae.gsap && Ae || {}), gn.forEach(_n)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, Dn = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), Dn = 0, l = Be;
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
			return d.remove(e), s[n ? "unshift" : "push"](r), kn(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), kn = function() {
	return !Dn && On.wake();
}, W = {}, An = /^[\d.\-M][\d.\-,\s]/, jn = /["']/g, Mn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(jn, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, Nn = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, Pn = function(e) {
	var t = (e + "").split("("), n = W[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [Mn(t[1])] : Nn(e).split(",").map(ct)) : W._CE && An.test(e) ? W._CE("", e) : n;
}, Fn = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, In = function e(t, n) {
	for (var r = t._first, i; r;) r instanceof Wn ? e(r, n) : r.vars.yoyoEase && (!r._yoyo || !r._repeat) && r._yoyo !== n && (r.timeline ? e(r.timeline, n) : (i = r._ease, r._ease = r._yEase, r._yEase = i, r._yoyo = n)), r = r._next;
}, Ln = function(e, t) {
	return e && (me(e) ? e : W[e] || Pn(e)) || t;
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
	return nt(e, function(e) {
		for (var t in W[e] = Ne[e] = i, W[a = e.toLowerCase()] = n, i) W[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = W[e + "." + t] = i[t];
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
nt("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
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
}), W.Linear.easeNone = W.none = W.Linear.easeIn, Rn("Elastic", Bn("in"), Bn("out"), Bn()), (function(e, t) {
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
}), Rn("Back", Vn("in"), Vn("out"), Vn()), W.SteppedEase = W.steps = Ne.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - V;
	return function(e) {
		return ((r * Ut(0, a, e) | 0) + i) * n;
	};
} }, z.ease = W["quad.out"], nt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return Qe += e + "," + e + "Params,";
});
var Hn = function(e, t) {
	this.id = le++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : tt, this.set = t ? t.getSetter : lr;
}, Un = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, Lt(this, +e.duration, 1, 1), this.data = e.data, B && (this._ctx = B, B.data.push(this)), Dn || On.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, Lt(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (kn(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (Ot(this, e), !n._dp || n.parent || kt(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && At(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === V || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), st(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + wt(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + wt(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? Tt(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -V ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? Et(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -V ? 0 : this._rts, this.totalTime(Ut(-Math.abs(this._delay), this._tDur, n), t !== !1), Dt(this), xt(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (kn(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== V && (this._tTime -= V)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = e;
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && At(t, this, e - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (_e(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? Et(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = Ue);
		var t = ae;
		return ae = e, (this._initted || this._startAt) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), ae = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, Rt(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, Rt(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(Bt(this, e), _e(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, _e(t)), this._dur || (this._zTime = -V), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -V : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -V, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - V);
	}, t.eventCallback = function(e, t, n) {
		var r = this.vars;
		return arguments.length > 1 ? (t ? (r[e] = t, n && (r[e + "Params"] = n), e === "onUpdate" && (this._onUpdate = t)) : delete r[e], this) : r[e];
	}, t.then = function(e) {
		var t = this;
		return new Promise(function(n) {
			var r = me(e) ? e : lt, i = function() {
				var e = t.then;
				t.then = null, me(r) && (r = r(t)) && (r.then || r === t) && (t.then = e), n(r), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? i() : t._prom = i;
		});
	}, t.kill = function() {
		mn(this);
	}, e;
}();
ut(Un.prototype, {
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
	_zTime: -V,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var Wn = /*#__PURE__*/ function(e) {
	re(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = _e(t.sortChildren), ke && At(t.parent || ke, L(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && jt(L(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return Vt(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return Vt(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return Vt(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, ht(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new ir(e, t, Bt(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return At(this, ir.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new ir(e, n, Bt(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, ht(n).immediateRender = _e(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, ht(r).immediateRender = _e(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : rt(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== ke && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = rt(o % f), o === i ? (d = this._repeat, c = a) : (_ = rt(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = Tt(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : rt(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && pn(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
					In(this, y);
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = It(this, rt(r), rt(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && c && !t && !d && (pn(this, "onStart"), this._tTime !== o)) return this;
			if (c >= r && e >= 0) for (l = this._first; l;) {
				if (u = l._next, (l._act || c >= l._start) && l._ts && m !== l) {
					if (l.parent !== this) return this.render(e, t, n);
					if (l.render(l._ts > 0 ? (c - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (c - l._start) * l._ts, t, n), c !== this._time || !this._ts && !p) {
						m = 0, u && (o += this._zTime = -V);
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
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || ae && (l._initted || l._startAt)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -V : V);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -V)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, Dt(this), this.render(e, t, n);
			this._onUpdate && !t && pn(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && yt(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (pn(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (he(t) || (t = Bt(this, t, e)), !(e instanceof Un)) {
			if (xe(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (pe(e)) return this.addLabel(e, t);
			if (me(e)) e = ir.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : At(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -oe);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof ir ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return pe(e) ? this.removeLabel(e) : me(e) ? this.killTweensOf(e) : (e.parent === this && vt(this, e), e === this._recent && (this._recent = this._last), bt(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = rt(On.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = Bt(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = ir.delayedCall(0, t || Be, n);
		return r.data = "isPause", this._hasPause = 1, At(this, r, Bt(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = Bt(this, e); t;) t._start === e && t.data === "isPause" && yt(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) Yn !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = Yt(e), i = this._first, a = he(t), o; i;) i instanceof ir ? at(i._targets, r) && (a ? (!Yn || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = Bt(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = ir.to(n, ut({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || V,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && Lt(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, ut({ startAt: { time: Bt(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), fn(this, Bt(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), fn(this, Bt(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + V);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		for (var r = this._first, i = this.labels, a; r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return bt(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), bt(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = oe, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, At(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += o / n._ts, n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			Lt(n, n === ke && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (ke._ts && (st(ke, Et(e, ke)), qe = On.frame), On.frame >= Xe) {
			Xe += R.autoSleep || 120;
			var t = ke._first;
			if ((!t || !t._ts) && R.autoSleep && On._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || On.sleep();
			}
		}
	}, t;
}(Un);
ut(Wn.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var Gn = function(e, t, n, r, i, a, o) {
	var s = new vr(this._pt, e, t, 0, 1, fr, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = ln(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(Te) || []; u = Te.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? it(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = Te.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (Ee.test(r) || g) && (s.e = 0), this._pt = s, s;
}, Kn = function(e, t, n, r, i, a, o, s, c, l) {
	me(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? me(u) ? c ? e[t.indexOf("set") || !me(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = me(u) ? c ? sr : or : ar, p;
	if (pe(r) && (~r.indexOf("random(") && (r = ln(r)), r.charAt(1) === "=" && (p = it(d, r) + (Wt(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || Xn) return !isNaN(d * r) && r !== "" ? (p = new vr(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? dr : ur, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && Le(t, r), Gn.call(this, e, t, d, r, f, s || R.stringFilter, c));
}, qn = function(e, t, n, r, i) {
	if (me(e) && (e = tr(e, i, t, n, r)), !H(e) || e.style && e.nodeType || xe(e) || be(e)) return pe(e) ? tr(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = tr(e[o], i, t, n, r);
	return a;
}, Jn = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (Je[e] && (o = new Je[e]()).init(i, o.rawVars ? t[e] : qn(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new vr(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== hn)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, Yn, Xn, Zn = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !ie, b = t.timeline, x, S, C, w, T, E, D, O, k, A, j, M, N;
	if (b && (!f || !a) && (a = "none"), t._ease = Ln(a, z.ease), t._yEase = d ? Fn(Ln(d === !0 ? a : d, z.ease)) : 0, d && t._yoyo && !t._repeat && (d = t._yEase, t._yEase = t._ease, t._ease = d), t._from = !b && !!i.runBackwards, !b || f && !i.stagger) {
		if (O = g[0] ? et(g[0]).harness : 0, M = O && i[O.prop], x = mt(i, We), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? He : Ve), h._lazy = 0), o) {
			if (yt(t._startAt = ir.set(g, ut({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && _e(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return pn(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (ae || !s && !p) && t._startAt.revert(He), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), C = ut({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && _e(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, x), M && (C[O.prop] = M), yt(t._startAt = ir.set(g, C)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (ae ? t._startAt.revert(He) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, V, V);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && _e(c) || c && !m, S = 0; S < g.length; S++) {
			if (T = g[S], D = T._gsap || $e(g)[S]._gsap, t._ptLookup[S] = A = {}, Ke[D.id] && Ge.length && ot(), j = v === g ? S : v.indexOf(T), O && (k = new O()).init(T, M || x, t, j, v) !== !1 && (t._pt = w = new vr(t._pt, T, k.name, 0, 1, k.render, k, 0, k.priority), k._props.forEach(function(e) {
				A[e] = w;
			}), k.priority && (E = 1)), !O || M) for (C in x) Je[C] && (k = Jn(C, x, t, j, T, v)) ? k.priority && (E = 1) : A[C] = w = Kn.call(t, T, C, "get", x[C], j, v, 0, i.stringFilter);
			t._op && t._op[S] && t.kill(T, t._op[S]), y && t._pt && (Yn = t, ke.killTweensOf(T, A, t.globalTime(n)), N = !t.parent, Yn = 0), t._pt && c && (Ke[D.id] = 1);
		}
		E && _r(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !N, f && n <= 0 && b.render(oe, !0, !0);
}, Qn = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return Xn = 1, e.vars[t] = "+=0", Zn(e, o), Xn = 0, s ? Re(t + " not eligible for reset") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e &&= U(n) + Wt(u.e), u.b &&= l.s + Wt(u.b);
}, $n = function(e, t) {
	var n = e[0] ? et(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = ft({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
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
	return me(e) ? e.call(t, n, r, i) : pe(e) && ~e.indexOf("random(") ? ln(e) : e;
}, nr = Qe + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", rr = {};
nt(nr + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return rr[e] = 1;
});
var ir = /*#__PURE__*/ function(e) {
	re(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : ht(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = o.yoyoEase, g = n.parent || ke, _ = (xe(t) || be(t) ? he(t[0]) : "length" in n) ? [t] : Yt(t), v, y, b, x, S, C, w, T;
		if (a._targets = _.length ? $e(_) : Re("GSAP target " + t + " not found. https://gsap.com", !R.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || ye(s) || ye(c)) {
			if (n = a.vars, v = a.timeline = new Wn({
				data: "nested",
				defaults: p || {},
				targets: g && g.data === "nested" ? g.vars.targets : _
			}), v.kill(), v.parent = v._dp = L(a), v._start = 0, u || ye(s) || ye(c)) {
				if (x = _.length, w = u && Qt(u), H(u)) for (S in u) ~nr.indexOf(S) && (T ||= {}, T[S] = u[S]);
				for (y = 0; y < x; y++) b = mt(n, rr), b.stagger = 0, h && (b.yoyoEase = h), T && ft(b, T), C = _[y], b.duration = +tr(s, L(a), y, C, _), b.delay = (+tr(c, L(a), y, C, _) || 0) - a._delay, !u && x === 1 && b.delay && (a._delay = c = b.delay, a._start += c, b.delay = 0), v.to(C, b, w ? w(y, C, _) : 0), v._ease = W.none;
				v.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				ht(ut(v.vars.defaults, { ease: "none" })), v._ease = Ln(f.ease || n.ease || "none");
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
		return d === !0 && !ie && (Yn = L(a), ke.killTweensOf(_), Yn = 0), At(g, L(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === rt(g._time) && _e(l) && Ct(L(a)) && g.data !== "nested") && (a._tTime = -V, a.render(Math.max(0, -c) || 0)), m && jt(L(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - V && !o ? i : e < V ? 0 : e, c, l, u, d, f, p, m, h, g;
		if (!a) Ft(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = rt(s % d), s === i ? (u = this._repeat, c = a) : (f = rt(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (g = this._yEase, c = a - c), f = Tt(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && (h && this._yEase && In(h, p), this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(rt(d * u), !0).invalidate()._lock = 0));
			}
			if (!this._initted) {
				if (Mt(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
				if (r !== this._time && !(n && this.vars.repeatRefresh && u !== f)) return this;
				if (a !== this._dur) return this.render(e, t, n);
			}
			if (this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), this.ratio = m = (g || this._ease)(c / a), this._from && (this.ratio = m = 1 - m), c && !r && !t && !u && (pn(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && St(this, e, t, n), pn(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && pn(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && St(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && yt(this, 1), !t && !(o && !r) && (s || r || p) && (pn(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		Dn || On.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || Zn(this, a), o = this._ease(a / this._dur), Qn(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (Ot(this, 0), this.parent || _t(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? mn(this) : this.scrollTrigger && this.scrollTrigger.kill(!!ae), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, Yn && Yn.vars.overwrite !== !0)._first || mn(this), this.parent && n !== this.timeline.totalDuration() && Lt(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? Yt(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && gt(r, i)) return t === "all" && (this._pt = 0), mn(this);
		for (s = this._op = this._op || [], t !== "all" && (pe(t) && (d = {}, nt(t, function(e) {
			return d[e] = 1;
		}), t = d), t = $n(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && vt(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && mn(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return Vt(1, arguments);
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
		return Vt(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return ke.killTweensOf(e, t, n);
	}, t;
}(Un);
ut(ir.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), nt("staggerTo,staggerFrom,staggerFromTo", function(e) {
	ir[e] = function() {
		var t = new Wn(), n = Kt.call(arguments, 0);
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
	return me(e[t]) ? or : ge(e[t]) && e.setAttribute ? cr : ar;
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
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? vt(this, t, "_pt") : t.dep || (n = 1), t = r;
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
nt(Qe + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(e) {
	return We[e] = 1;
}), Ne.TweenMax = Ne.TweenLite = ir, Ne.TimelineLite = Ne.TimelineMax = Wn, ke = new Wn({
	sortChildren: !1,
	defaults: z,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), R.stringFilter = En;
var yr = [], br = {}, xr = [], Sr = 0, Cr = 0, wr = function(e) {
	return (br[e] || xr).map(function(e) {
		return e();
	});
}, Tr = function() {
	var e = Date.now(), t = [];
	e - Sr > 2 && (wr("matchMediaInit"), yr.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = Ae.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), wr("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), Sr = e, wr("matchMedia"));
}, Er = /*#__PURE__*/ function() {
	function e(e, t) {
		this.selector = t && Xt(t), this.data = [], this._r = [], this.isReverted = !1, this.id = Cr++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		me(e) && (n = t, t = e, e = me);
		var r = this, i = function() {
			var e = B, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = Xt(n)), B = r, a = t.apply(r, arguments), me(a) && r._r.push(a), B = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === me ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = B;
		B = null, e(this), B = t;
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
		this.contexts = [], this.scope = e, B && B.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		H(e) || (e = { matches: e });
		var r = new Er(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in B && !r.selector && (r.selector = B.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = Ae.matchMedia(e[o]), a && (yr.indexOf(r) < 0 && yr.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(Tr) : a.addEventListener("change", Tr)));
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
			return _n(e);
		});
	},
	timeline: function(e) {
		return new Wn(e);
	},
	getTweensOf: function(e, t) {
		return ke.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		pe(e) && (e = Yt(e)[0]);
		var i = et(e || {}).get, a = n ? lt : ct;
		return n === "native" && (n = ""), e && (t ? a((Je[t] && Je[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((Je[t] && Je[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = Yt(e), e.length > 1) {
			var r = e.map(function(e) {
				return Mr.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = Je[t], o = et(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			hn._pt = 0, r.init(e, n ? t + n : t, hn, 0, [e]), r.render(1, r), hn._pt && pr(1, hn);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = Mr.to(e, ut((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return ke.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = Ln(e.ease, z.ease)), pt(z, e || {});
	},
	config: function(e) {
		return pt(R, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !Je[e] && !Ne[e] && Re(t + " effect requires " + e + " plugin.");
		}), Ye[t] = function(e, t, r) {
			return n(Yt(e), ut(t || {}, i), r);
		}, a && (Wn.prototype[t] = function(e, n, r) {
			return this.add(Ye[t](e, H(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		W[e] = Ln(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? Ln(e, t) : W;
	},
	getById: function(e) {
		return ke.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new Wn(e), r, i;
		for (n.smoothChildTiming = _e(e.smoothChildTiming), ke.remove(n), n._dp = 0, n._time = n._tTime = ke._time, r = ke._first; r;) i = r._next, (t || !(!r._dur && r instanceof ir && r.vars.onComplete === r._targets[0])) && At(n, r, r._start - r._delay), r = i;
		return At(ke, n, 0), n;
	},
	context: function(e, t) {
		return e ? new Er(e, t) : B;
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
		wrap: sn,
		wrapYoyo: cn,
		distribute: Qt,
		random: tn,
		snap: en,
		normalize: an,
		getUnit: Wt,
		clamp: Gt,
		splitColor: xn,
		toArray: Yt,
		selector: Xt,
		mapRange: un,
		pipe: nn,
		unitize: rn,
		interpolate: dn,
		shuffle: Zt
	},
	install: Ie,
	effects: Ye,
	ticker: On,
	updateRoot: Wn.updateRoot,
	plugins: Je,
	globalTimeline: ke,
	core: {
		PropTween: vr,
		globals: ze,
		Tween: ir,
		Timeline: Wn,
		Animation: Un,
		getCache: et,
		_removeLinkedListItem: vt,
		reverting: function() {
			return ae;
		},
		context: function(e) {
			return e && B && (B.data.push(e), e._ctx = B), B;
		},
		suppressOverwrites: function(e) {
			return ie = e;
		}
	}
};
nt("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return Or[e] = ir[e];
}), On.add(Wn.updateRoot), hn = Or.to({}, { duration: 0 });
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
				if (pe(n) && (r = {}, nt(n, function(e) {
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
		for (var n = t._pt; n;) ae ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, jr("roundProps", $t), jr("modifiers"), jr("snap", en)) || Or;
ir.version = Wn.version = Mr.version = "3.12.7", Fe = 1, ve() && kn(), W.Power0, W.Power1, W.Power2, W.Power3, W.Power4, W.Linear, W.Quad, W.Cubic, W.Quart, W.Quint, W.Strong, W.Elastic, W.Back, W.SteppedEase, W.Bounce, W.Sine, W.Expo, W.Circ;
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
			return r.tfm[e] = K(i, e);
		}) : this.tfm[t] = o.x ? o[t] : K(i, t), t === li && (this.tfm.zOrigin = o.zOrigin);
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
}, G = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = Lr.style, c = qr.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || Ei[i] || Ei[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && Ci(t), (p || o === "%") && (Vr[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], U(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === Pr || !h.appendChild) && (h = Pr.body), g = h._gsap, g && p && g.width && c && g.time === On.time && !g.uncache) return U(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : wi(t, n);
	} else (p || o === "%") && !Di[gi(h, "display")] && (s.position = gi(t, "position")), h === t && (s.position = "static"), h.appendChild(Lr), m = Lr[u], h.removeChild(Lr), s.position = "absolute";
	return c && p && (g = et(h), g.time = On.time, g.width = h[u]), U(f ? m * a / d : m && a ? d / m * a : 0);
}, K = function(e, t, n, r) {
	var i;
	return Ir || yi(), t in Yr && t !== "transform" && (t = Yr[t], ~t.indexOf(",") && (t = t.split(",")[0])), Vr[t] && t !== "transform" ? (i = zi(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : Bi(gi(e, li)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = Mi[t] && Mi[t](e, t, n) || gi(e, t) || tt(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? G(e, t, i, n) + n : i;
}, Oi = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = vi(t, e, 1), a = i && gi(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = gi(e, "borderTopColor"));
	}
	var o = new vr(this._pt, e.style, t, 0, 1, fr), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r === "auto" && (m = e.style[t], e.style[t] = r, r = gi(e, t) || r, m ? e.style[t] = m : wi(e, t)), l = [n, r], En(l), n = l[0], r = l[1], d = n.match(we) || [], b = r.match(we) || [], b.length) {
		for (; u = we.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = it(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = we.lastIndex - v.length, v || (v = v || R.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = G(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? ti : ei;
	return Ee.test(r) && (o.e = 0), this._pt = o, o;
}, ki = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, Ai = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = ki[n] || n, t[1] = ki[r] || r, t.join(" ");
}, ji = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], Vr[o] && (s = 1, o = o === "transformOrigin" ? li : ci), wi(n, o);
		s && (wi(n, ci), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", zi(n, 1), a.uncache = 1, di(r)));
	}
}, Mi = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new vr(e._pt, t, n, 0, 0, ji);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, Ni = [
	1,
	0,
	0,
	1,
	0,
	0
], Pi = {}, Fi = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, Ii = function(e) {
	var t = gi(e, ci);
	return Fi(t) ? Ni : t.substr(7).match(Ce).map(U);
}, Li = function(e, t) {
	var n = e._gsap || et(e), r = e.style, i = Ii(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? Ni : i) : (i === Ni && !e.offsetParent && e !== Fr && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, Fr.appendChild(e)), i = Ii(e), s ? r.display = s : wi(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : Fr.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, Ri = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || Li(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== Ni && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = Si(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[li] = "0px 0px", a && (Ti(a, o, "xOrigin", c, y), Ti(a, o, "yOrigin", l, b), Ti(a, o, "xOffset", u, o.xOffset), Ti(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, zi = function(e, t) {
	var n = e._gsap || new Hn(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = gi(e, li) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A, j, M, N, ee, te, P, F, ne, I, L;
	return n.svg = !!(e.getCTM && Ci(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[ci] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[ci] === "none" ? "" : s[ci])), r.scale = r.rotate = r.translate = "none"), S = Li(e, n.svg), n.svg && (n.uncache ? (N = e.getBBox(), c = n.xOrigin - N.x + "px " + (n.yOrigin - N.y) + "px", M = "") : M = !t && e.getAttribute("data-svg-origin"), Ri(e, M || c, !!M || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== Ni && (E = S[0], D = S[1], O = S[2], k = S[3], l = A = S[4], u = j = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? Wr(D, E) * Hr : 0, _ = O || k ? Wr(O, k) * Hr + m : 0, _ && (p *= Math.abs(Math.cos(_ * Ur))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (L = S[6], ne = S[7], te = S[8], P = S[9], F = S[10], I = S[11], l = S[12], u = S[13], d = S[14], C = Wr(L, F), h = C * Hr, C && (w = Math.cos(-C), T = Math.sin(-C), M = A * w + te * T, N = j * w + P * T, ee = L * w + F * T, te = A * -T + te * w, P = j * -T + P * w, F = L * -T + F * w, I = ne * -T + I * w, A = M, j = N, L = ee), C = Wr(-O, F), g = C * Hr, C && (w = Math.cos(-C), T = Math.sin(-C), M = E * w - te * T, N = D * w - P * T, ee = O * w - F * T, I = k * T + I * w, E = M, D = N, O = ee), C = Wr(D, E), m = C * Hr, C && (w = Math.cos(C), T = Math.sin(C), M = E * w + D * T, N = A * w + j * T, D = D * w - E * T, j = j * w - A * T, E = M, A = N), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = U(Math.sqrt(E * E + D * D + O * O)), p = U(Math.sqrt(j * j + L * L)), C = Wr(A, j), _ = Math.abs(C) > 2e-4 ? C * Hr : 0, y = I ? 1 / (I < 0 ? -I : I) : 0), n.svg && (M = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !Fi(gi(e, ci)), M && e.setAttribute("transform", M))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = U(f), n.scaleY = U(p), n.rotation = U(m) + o, n.rotationX = U(h) + o, n.rotationY = U(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[li] = Bi(c)), n.xOffset = n.yOffset = 0, n.force3D = R.force3D, n.renderTransform = n.svg ? qi : mi ? Ki : Hi, n.uncache = 0, n;
}, Bi = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, Vi = function(e, t, n) {
	var r = Wt(t);
	return U(parseFloat(t) + parseFloat(G(e, "x", n + "px", r))) + r;
}, Hi = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, Ki(e, t);
}, Ui = "0deg", Wi = "0px", Gi = ") ", Ki = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== Ui || l !== Ui)) {
		var x = parseFloat(l) * Ur, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * Ur, w = Math.cos(x), a = Vi(_, a, S * w * -v), o = Vi(_, o, -Math.sin(x) * -v), s = Vi(_, s, C * w * -v + v);
	}
	h !== Wi && (y += "perspective(" + h + Gi), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== Wi || o !== Wi || s !== Wi) && (y += s !== Wi || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + Gi), c !== Ui && (y += "rotate(" + c + Gi), l !== Ui && (y += "rotateY(" + l + Gi), u !== Ui && (y += "rotateX(" + u + Gi), (d !== Ui || f !== Ui) && (y += "skew(" + d + ", " + f + Gi), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + Gi), _.style[ci] = y || "translate(0, 0)";
}, qi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= Ur, c *= Ur, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= Ur, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = U(b), x = U(x), S = U(S), C = U(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = G(f, "x", a, "px"), y = G(f, "y", o, "px")), (p || m || h || g) && (v = U(v + p - (p * b + m * S) + h), y = U(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = U(v + r / 100 * w.width), y = U(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[ci] = w);
}, Ji = function(e, t, n, r, i) {
	var a = 360, o = pe(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? Hr : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * Gr) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * Gr) % a - ~~(s / a) * a)), e._pt = u = new vr(e._pt, t, n, r, s, Zr), u.e = c, u.u = "deg", e._props.push(n), u;
}, Yi = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, Xi = function(e, t, n) {
	var r = Yi({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[ci] = t, o = zi(n, 1), wi(n, ci), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[ci], a[ci] = t, o = zi(n, 1), a[ci] = c), Vr) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = Wt(c), p = Wt(l), u = f === p ? parseFloat(c) : G(n, s, c, p), d = parseFloat(l), e._pt = new vr(e._pt, o, s, u, d - u, Xr), e._pt.u = p || 0, e._props.push(s));
	Yi(o, r);
};
nt("padding,margin,Width,Radius", function(e, t) {
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
	Mi[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return K(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var Zi = {
	name: "css",
	register: yi,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C;
		for (m in Ir || yi(), this.styles = this.styles || pi(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(Je[m] && Jn(m, t, n, r, e, i)))) {
			if (f = typeof l, p = Mi[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = ln(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", wn.lastIndex = 0, wn.test(c) || (h = Wt(c), g = Wt(l)), g ? h !== g && (c = G(e, m, c, g) + g) : h && (l += h), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], pe(c) && ~c.indexOf("random(") && (c = ln(c)), Wt(c + "") || c === "auto" || (c += R.units[m] || Wt(K(e, m)) || ""), (c + "").charAt(1) === "=" && (c = K(e, m))) : c = K(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in Yr && (m === "autoAlpha" && (d === 1 && K(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), Ti(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = Yr[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Vr, v) {
					if (this.styles.save(m), y || (b = e._gsap, b.renderTransform && !t.parseTransform || zi(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new vr(this._pt, o, ci, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new vr(this._pt, b, "scaleY", b.scaleY, (_ ? it(b.scaleY, _ + u) : u) - b.scaleY || 0, Xr), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(li, 0, o[li]), l = Ai(l), b.svg ? Ri(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && Ti(this, b, "zOrigin", b.zOrigin, g), Ti(this, o, m, Bi(c), Bi(l)));
						continue;
					} else if (m === "svgOrigin") {
						Ri(e, l, 1, x, 0, this);
						continue;
					} else if (m in Pi) {
						Ji(this, b, m, d, _ ? it(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						Ti(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						Xi(this, l, e);
						continue;
					}
				} else m in o || (m = vi(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !Jr.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = Wt(l) || (m in R.units ? R.units[m] : h), h !== g && (d = G(e, m, c, g)), this._pt = new vr(this._pt, v ? b : o, m, d, (_ ? it(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? $r : Xr), this._pt.u = g || 0, h !== g && g !== "%" && (this._pt.b = c, this._pt.r = Qr);
				else if (m in o) Oi.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					Le(m, l);
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
	get: K,
	aliases: Yr,
	getSetter: function(e, t, n) {
		var r = Yr[t];
		return r && r.indexOf(",") < 0 && (t = r), t in Vr && t !== li && (e._gsap.x || K(e, "x")) ? n && Rr === n ? t === "scale" ? ai : ii : (Rr = n || {}) && (t === "scale" ? oi : si) : e.style && !ge(e.style[t]) ? ni : ~t.indexOf("-") ? ri : lr(e, t);
	},
	core: {
		_removeProperty: wi,
		_getMatrix: Li
	}
};
Mr.utils.checkPrefix = vi, Mr.core.getStyleSaver = pi, (function(e, t, n, r) {
	var i = nt(e + "," + t + "," + n, function(e) {
		Vr[e] = 1;
	});
	nt(t, function(e) {
		R.units[e] = "deg", Pi[e] = 1;
	}), Yr[i[13]] = e + "," + t, nt(r, function(e) {
		var t = e.split(":");
		Yr[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), nt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	R.units[e] = "px";
}), Mr.registerPlugin(Zi);
//#endregion
//#region node_modules/gsap/index.js
var Qi = Mr.registerPlugin(Zi) || Mr;
Qi.core.Tween;
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
}, q = function(e) {
	return Math.round(e * ba) / ba || 0;
}, Sa = function(e) {
	return Math.round(e * 1e10) / 1e10 || 0;
}, Ca = function(e, t, n, r) {
	var i = e[t], a = r === 1 ? 6 : za(i, n, r);
	if ((a || !r) && a + n + 2 < i.length) return e.splice(t, 0, i.slice(0, n + a + 2)), i.splice(0, n + a), 1;
}, wa = function(e, t, n) {
	var r = e.length, i = ~~(n * r);
	if (e[i] > t) {
		for (; --i && e[i] > t;);
		i < 0 && (i = 0);
	} else for (; e[++i] < t && i < r;);
	return i < r ? i : r - 1;
}, Ta = function(e, t) {
	var n = e.length;
	for (t || e.reverse(); n--;) e[n].reversed || Aa(e[n]);
}, Ea = function(e, t) {
	return t.totalLength = e.totalLength, e.samples ? (t.samples = e.samples.slice(0), t.lookup = e.lookup.slice(0), t.minLength = e.minLength, t.resolution = e.resolution) : e.totalPoints && (t.totalPoints = e.totalPoints), t;
}, Da = function(e, t) {
	var n = e.length, r = e[n - 1] || [], i = r.length;
	n && t[0] === r[i - 2] && t[1] === r[i - 1] && (t = r.concat(t.slice(2)), n--), e[n] = t;
};
function Oa(e) {
	e = ha(e) && oa.test(e) && document.querySelector(e) || e;
	var t = e.getAttribute ? e : 0, n;
	return t && (e = e.getAttribute("d")) ? (t._gsPath ||= {}, n = t._gsPath[e], n && !n._dirty ? n : t._gsPath[e] = Wa(e)) : e ? ha(e) ? Wa(e) : ga(e[0]) ? [e] : e : console.warn("Expecting a <path> element or an SVG path data string");
}
function ka(e) {
	for (var t = [], n = 0; n < e.length; n++) t[n] = Ea(e[n], e[n].slice(0));
	return Ea(e, t);
}
function Aa(e) {
	var t = 0, n;
	for (e.reverse(); t < e.length; t += 2) n = e[t], e[t] = e[t + 1], e[t + 1] = n;
	e.reversed = !e.reversed;
}
var ja = function(e, t) {
	var n = document.createElementNS("http://www.w3.org/2000/svg", "path"), r = [].slice.call(e.attributes), i = r.length, a;
	for (t = "," + t + ","; --i > -1;) a = r[i].nodeName.toLowerCase(), t.indexOf("," + a + ",") < 0 && n.setAttributeNS(null, a, r[i].nodeValue);
	return n;
}, Ma = {
	rect: "rx,ry,x,y,width,height",
	circle: "r,cx,cy",
	ellipse: "rx,ry,cx,cy",
	line: "x1,x2,y1,y2"
}, Na = function(e, t) {
	for (var n = t ? t.split(",") : [], r = {}, i = n.length; --i > -1;) r[n[i]] = +e.getAttribute(n[i]) || 0;
	return r;
};
function Pa(e, t) {
	var n = e.tagName.toLowerCase(), r = .552284749831, i, a, o, s, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T;
	return n === "path" || !e.getBBox ? e : (l = ja(e, "x,y,width,height,cx,cy,rx,ry,r,x1,x2,y1,y2,points"), T = Na(e, Ma[n]), n === "rect" ? (s = T.rx, c = T.ry || s, a = T.x, o = T.y, p = T.width - s * 2, m = T.height - c * 2, s || c ? (h = a + s * (1 - r), g = a + s, _ = g + p, v = _ + s * r, y = _ + s, b = o + c * (1 - r), x = o + c, S = x + m, C = S + c * r, w = S + c, i = "M" + y + "," + x + " V" + S + " C" + [
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
	].join(",") + "z") : n === "line" ? i = "M" + T.x1 + "," + T.y1 + " L" + T.x2 + "," + T.y2 : (n === "polyline" || n === "polygon") && (f = (e.getAttribute("points") + "").match(ia) || [], a = f.shift(), o = f.shift(), i = "M" + a + "," + o + " L" + f.join(","), n === "polygon" && (i += "," + a + "," + o + "z")), l.setAttribute("d", qa(l._gsRawPath = Wa(i))), t && e.parentNode && (e.parentNode.insertBefore(l, e), e.parentNode.removeChild(e)), l);
}
function Fa(e, t, n) {
	var r = e[t], i = e[t + 2], a = e[t + 4], o;
	return r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, o = i + (a + (e[t + 6] - a) * n - i) * n - r, r = e[t + 1], i = e[t + 3], a = e[t + 5], r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, q(pa(i + (a + (e[t + 7] - a) * n - i) * n - r, o) * ca);
}
function Ia(e, t, n) {
	n = _a(n) ? 1 : Sa(n) || 0, t = Sa(t) || 0;
	var r = Math.max(0, ~~(da(n - t) - 1e-8)), i = ka(e);
	if (t > n && (t = 1 - t, n = 1 - n, Ta(i), i.totalLength = 0), t < 0 || n < 0) {
		var a = Math.abs(~~Math.min(t, n)) + 1;
		t += a, n += a;
	}
	i.totalLength || Ra(i);
	var o = n > 1, s = Ba(i, t, va, !0), c = Ba(i, n, ya), l = c.segment, u = s.segment, d = c.segIndex, f = s.segIndex, p = c.i, m = s.i, h = f === d, g = p === m && h, _, v, y, b, x, S, C, w;
	if (o || r) {
		for (_ = d < f || h && p < m || g && c.t < s.t, Ca(i, f, m, s.t) && (f++, _ || (d++, g ? (c.t = (c.t - s.t) / (1 - s.t), p = 0) : h && (p -= m))), Math.abs(1 - (n - t)) < 1e-5 ? d = f - 1 : !c.t && d ? d-- : Ca(i, d, p, c.t) && _ && f++, s.t === 1 && (f = (f + 1) % i.length), x = [], S = i.length, C = 1 + S * r, w = f, C += (S - f + d) % S, b = 0; b < C; b++) Da(x, i[w++ % S]);
		i = x;
	} else if (y = c.t === 1 ? 6 : za(l, p, c.t), t !== n) for (v = za(u, m, g ? s.t / c.t : s.t), h && (y += v), l.splice(p + y + 2), (v || m) && u.splice(0, m + v), b = i.length; b--;) (b < f || b > d) && i.splice(b, 1);
	else l.angle = Fa(l, p + y, 0), p += y, s = l[p], c = l[p + 1], l.length = l.totalLength = 0, l.totalPoints = i.totalPoints = 8, l.push(s, c, s, c, s, c, s, c);
	return i.totalLength = 0, i;
}
function La(e, t, n) {
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
function Ra(e, t) {
	var n, r, i;
	for (i = n = r = 0; i < e.length; i++) e[i].resolution = ~~t || 12, r += e[i].length, n += La(e[i]);
	return e.totalPoints = r, e.totalLength = n, e;
}
function za(e, t, n) {
	if (n <= 0 || n >= 1) return 0;
	var r = e[t], i = e[t + 1], a = e[t + 2], o = e[t + 3], s = e[t + 4], c = e[t + 5], l = e[t + 6], u = e[t + 7], d = r + (a - r) * n, f = a + (s - a) * n, p = i + (o - i) * n, m = o + (c - o) * n, h = d + (f - d) * n, g = p + (m - p) * n, _ = s + (l - s) * n, v = c + (u - c) * n;
	return f += (_ - f) * n, m += (v - m) * n, e.splice(t + 2, 4, q(d), q(p), q(h), q(g), q(h + (f - h) * n), q(g + (m - g) * n), q(f), q(m), q(_), q(v)), e.samples && e.samples.splice(t / 6 * e.resolution | 0, 0, 0, 0, 0, 0, 0, 0), 6;
}
function Ba(e, t, n, r) {
	n ||= {}, e.totalLength || Ra(e), (t < 0 || t > 1) && (t = xa(t));
	var i = 0, a = e[0], o, s, c, l, u, d, f;
	if (!t) f = d = i = 0, a = e[0];
	else if (t === 1) f = 1, i = e.length - 1, a = e[i], d = a.length - 8;
	else {
		if (e.length > 1) {
			for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = d;
			a = e[i], l = u - a.totalLength, t = (c - l) / (u - l) || 0;
		}
		o = a.samples, s = a.resolution, c = a.totalLength * t, d = a.lookup.length ? a.lookup[~~(c / a.minLength)] || 0 : wa(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s), d = ~~(d / s) * 6, r && f === 1 && (d + 6 < a.length ? (d += 6, f = 0) : i + 1 < e.length && (d = f = 0, a = e[++i]));
	}
	return n.t = f, n.i = d, n.path = e, n.segment = a, n.segIndex = i, n;
}
function Va(e, t, n, r) {
	var i = e[0], a = r || {}, o, s, c, l, u, d, f, p, m;
	if ((t < 0 || t > 1) && (t = xa(t)), i.lookup || Ra(e), e.length > 1) {
		for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = e[d];
		l = u - i.totalLength, t = (c - l) / (u - l) || 0;
	}
	return o = i.samples, s = i.resolution, c = i.totalLength * t, d = i.lookup.length ? i.lookup[t < 1 ? ~~(c / i.minLength) : i.lookup.length - 1] || 0 : wa(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s) || 0, m = 1 - f, d = ~~(d / s) * 6, p = i[d], a.x = q((f * f * (i[d + 6] - p) + 3 * m * (f * (i[d + 4] - p) + m * (i[d + 2] - p))) * f + p), a.y = q((f * f * (i[d + 7] - (p = i[d + 1])) + 3 * m * (f * (i[d + 5] - p) + m * (i[d + 3] - p))) * f + p), n && (a.angle = i.totalLength ? Fa(i, d, f >= 1 ? .999999999 : f || 1e-9) : i.angle || 0), a;
}
function Ha(e, t, n, r, i, a, o) {
	for (var s = e.length, c, l, u, d, f; --s > -1;) for (c = e[s], l = c.length, u = 0; u < l; u += 2) d = c[u], f = c[u + 1], c[u] = d * t + f * r + a, c[u + 1] = d * n + f * i + o;
	return e._dirty = 1, e;
}
function Ua(e, t, n, r, i, a, o, s, c) {
	if (!(e === s && t === c)) {
		n = da(n), r = da(r);
		var l = i % 360 * sa, u = ua(l), d = la(l), f = Math.PI, p = f * 2, m = (e - s) / 2, h = (t - c) / 2, g = u * m + d * h, _ = -d * m + u * h, v = g * g, y = _ * _, b = v / (n * n) + y / (r * r);
		b > 1 && (n = fa(b) * n, r = fa(b) * r);
		var x = n * n, S = r * r, C = (x * S - x * y - S * v) / (x * y + S * v);
		C < 0 && (C = 0);
		var w = (a === o ? -1 : 1) * fa(C), T = w * (n * _ / r), E = w * -(r * g / n), D = (e + s) / 2, O = (t + c) / 2, k = D + (u * T - d * E), A = O + (d * T + u * E), j = (g - T) / n, M = (_ - E) / r, N = (-g - T) / n, ee = (-_ - E) / r, te = j * j + M * M, P = (M < 0 ? -1 : 1) * Math.acos(j / fa(te)), F = (j * ee - M * N < 0 ? -1 : 1) * Math.acos((j * N + M * ee) / fa(te * (N * N + ee * ee)));
		isNaN(F) && (F = f), !o && F > 0 ? F -= p : o && F < 0 && (F += p), P %= p, F %= p;
		var ne = Math.ceil(da(F) / (p / 4)), I = [], L = F / ne, re = 4 / 3 * la(L / 2) / (1 + ua(L / 2)), R = u * n, z = d * n, ie = d * -r, ae = u * r, B;
		for (B = 0; B < ne; B++) i = P + B * L, g = ua(i), _ = la(i), j = ua(i += L), M = la(i), I.push(g - re * _, _ + re * g, j + re * M, M - re * j, j, M);
		for (B = 0; B < I.length; B += 2) g = I[B], _ = I[B + 1], I[B] = g * R + _ * ie + k, I[B + 1] = g * z + _ * ae + A;
		return I[B - 2] = s, I[B - 1] = c, I;
	}
}
function Wa(e) {
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
		if (S = t[l + 4], C = t[l + 5], v = t[l + 6], y = t[l + 7], u = 7, S.length > 1 && (S.length < 3 ? (y = v, v = C, u--) : (y = C, v = S.substr(2), u -= 2), C = S.charAt(1), S = S.charAt(0)), b = Ua(r, i, +t[l + 1], +t[l + 2], +t[l + 3], +S, +C, (m ? r : 0) + v * 1, (m ? i : 0) + y * 1), l += u, b) for (u = 0; u < b.length; u++) h.push(b[u]);
		r = h[h.length - 2], i = h[h.length - 1];
	} else console.log(c);
	return l = h.length, l < 6 ? (n.pop(), l = 0) : h[0] === h[l - 2] && h[1] === h[l - 1] && (h.closed = !0), n.totalPoints = s + l, n;
}
function Ga(e, t) {
	t === void 0 && (t = 1);
	for (var n = e[0], r = 0, i = [n, r], a = 2; a < e.length; a += 2) i.push(n, r, e[a], r = (e[a] - n) * t / 2, n = e[a], -r);
	return i;
}
function Ka(e, t) {
	da(e[0] - e[2]) < 1e-4 && da(e[1] - e[3]) < 1e-4 && (e = e.slice(2));
	var n = e.length - 2, r = +e[0], i = +e[1], a = +e[2], o = +e[3], s = [
		r,
		i,
		r,
		i
	], c = a - r, l = o - i, u = Math.abs(e[n] - r) < .001 && Math.abs(e[n + 1] - i) < .001, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T;
	for (u && (e.push(a, o), a = r, o = i, r = e[n - 2], i = e[n - 1], e.unshift(r, i), n += 4), t = t || t === 0 ? +t : 1, p = 2; p < n; p += 2) d = r, f = i, r = a, i = o, a = +e[p + 2], o = +e[p + 3], !(r === a && i === o) && (m = c, h = l, c = a - r, l = o - i, g = fa(m * m + h * h), _ = fa(c * c + l * l), v = fa((c / _ + m / g) ** 2 + (l / _ + h / g) ** 2), y = (g + _) * t * .25 / v, b = r - (r - d) * (g ? y / g : 0), x = r + (a - r) * (_ ? y / _ : 0), S = r - (b + ((x - b) * (g * 3 / (g + _) + .5) / 4 || 0)), C = i - (i - f) * (g ? y / g : 0), w = i + (o - i) * (_ ? y / _ : 0), T = i - (C + ((w - C) * (g * 3 / (g + _) + .5) / 4 || 0)), (r !== d || i !== f) && s.push(q(b + S), q(C + T), q(r), q(i), q(x + S), q(w + T)));
	return r !== a || i !== o || s.length < 4 ? s.push(q(a), q(o), q(a), q(o)) : s.length -= 2, s.length === 2 ? s.push(r, i, r, i, r, i) : u && (s.splice(0, 6), s.length -= 6), s;
}
function qa(e) {
	ga(e[0]) && (e = [e]);
	var t = "", n = e.length, r, i, a, o;
	for (i = 0; i < n; i++) {
		for (o = e[i], t += "M" + q(o[0]) + "," + q(o[1]) + " C", r = o.length, a = 2; a < r; a++) t += q(o[a++]) + "," + q(o[a++]) + " " + q(o[a++]) + "," + q(o[a++]) + " " + q(o[a++]) + "," + q(o[a]) + " ";
		o.closed && (t += "z");
	}
	return t;
}
//#endregion
//#region node_modules/gsap/utils/matrix.js
var Ja, Ya, Xa, Za, Qa, $a, eo, to, J = "transform", no = J + "Origin", ro, Y = function(e) {
	var t = e.ownerDocument || e;
	for (!(J in e.style) && ("msTransform" in e.style) && (J = "msTransform", no = J + "Origin"); t.parentNode && (t = t.parentNode););
	if (Ya = window, eo = new _o(), t) {
		Ja = t, Xa = t.documentElement, Za = t.body, to = Ja.createElementNS("http://www.w3.org/2000/svg", "g"), to.style.transform = "none";
		var n = t.createElement("div"), r = t.createElement("div"), i = t && (t.body || t.firstElementChild);
		i && i.appendChild && (i.appendChild(n), n.appendChild(r), n.setAttribute("style", "position:static;transform:translate3d(0,0,1px)"), ro = r.offsetParent !== n, i.removeChild(n));
	}
	return t;
}, io = function(e) {
	for (var t, n; e && e !== Za;) n = e._gsap, n && n.uncache && n.get(e, "x"), n && !n.scaleX && !n.scaleY && n.renderTransform && (n.scaleX = n.scaleY = 1e-4, n.renderTransform(1, n), t ? t.push(n) : t = [n]), e = e.parentNode;
	return t;
}, ao = [], oo = [], so = function() {
	return Ya.pageYOffset || Ja.scrollTop || Xa.scrollTop || Za.scrollTop || 0;
}, co = function() {
	return Ya.pageXOffset || Ja.scrollLeft || Xa.scrollLeft || Za.scrollLeft || 0;
}, lo = function(e) {
	return e.ownerSVGElement || ((e.tagName + "").toLowerCase() === "svg" ? e : null);
}, uo = function e(t) {
	if (Ya.getComputedStyle(t).position === "fixed") return !0;
	if (t = t.parentNode, t && t.nodeType === 1) return e(t);
}, fo = function e(t, n) {
	if (t.parentNode && (Ja || Y(t))) {
		var r = lo(t), i = r ? r.getAttribute("xmlns") || "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml", a = r ? n ? "rect" : "g" : "div", o = n === 2 ? 100 : 0, s = n === 3 ? 100 : 0, c = "position:absolute;display:block;pointer-events:none;margin:0;padding:0;", l = Ja.createElementNS ? Ja.createElementNS(i.replace(/^https/, "http"), a) : Ja.createElement(a);
		return n && (r ? ($a ||= e(t), l.setAttribute("width", .01), l.setAttribute("height", .01), l.setAttribute("transform", "translate(" + o + "," + s + ")"), $a.appendChild(l)) : (Qa || (Qa = e(t), Qa.style.cssText = c), l.style.cssText = c + "width:0.1px;height:0.1px;top:" + s + "px;left:" + o + "px", Qa.appendChild(l))), l;
	}
	throw "Need document and parent.";
}, po = function(e) {
	for (var t = new _o(), n = 0; n < e.numberOfItems; n++) t.multiply(e.getItem(n).matrix);
	return t;
}, mo = function(e) {
	var t = e.getCTM(), n;
	return t || (n = e.style[J], e.style[J] = "none", e.appendChild(to), t = to.getCTM(), e.removeChild(to), n ? e.style[J] = n : e.style.removeProperty(J.replace(/([A-Z])/g, "-$1").toLowerCase())), t || eo.clone();
}, ho = function(e, t) {
	var n = lo(e), r = e === n, i = n ? ao : oo, a = e.parentNode, o, s, c, l, u, d;
	if (e === Ya) return e;
	if (i.length || i.push(fo(e, 1), fo(e, 2), fo(e, 3)), o = n ? $a : Qa, n) r ? (c = mo(e), l = -c.e / c.a, u = -c.f / c.d, s = eo) : e.getBBox ? (c = e.getBBox(), s = e.transform ? e.transform.baseVal : {}, s = s.numberOfItems ? s.numberOfItems > 1 ? po(s) : s.getItem(0).matrix : eo, l = s.a * c.x + s.c * c.y, u = s.b * c.x + s.d * c.y) : (s = new _o(), l = u = 0), t && e.tagName.toLowerCase() === "g" && (l = u = 0), (r ? n : a).appendChild(o), o.setAttribute("transform", "matrix(" + s.a + "," + s.b + "," + s.c + "," + s.d + "," + (s.e + l) + "," + (s.f + u) + ")");
	else {
		if (l = u = 0, ro) for (s = e.offsetParent, c = e; (c &&= c.parentNode) && c !== s && c.parentNode;) (Ya.getComputedStyle(c)[J] + "").length > 4 && (l = c.offsetLeft, u = c.offsetTop, c = 0);
		if (d = Ya.getComputedStyle(e), d.position !== "absolute" && d.position !== "fixed") for (s = e.offsetParent; a && a !== s;) l += a.scrollLeft || 0, u += a.scrollTop || 0, a = a.parentNode;
		c = o.style, c.top = e.offsetTop - u + "px", c.left = e.offsetLeft - l + "px", c[J] = d[J], c[no] = d[no], c.position = d.position === "fixed" ? "fixed" : "absolute", e.parentNode.appendChild(o);
	}
	return o;
}, go = function(e, t, n, r, i, a, o) {
	return e.a = t, e.b = n, e.c = r, e.d = i, e.e = a, e.f = o, e;
}, _o = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a) {
		e === void 0 && (e = 1), t === void 0 && (t = 0), n === void 0 && (n = 0), r === void 0 && (r = 1), i === void 0 && (i = 0), a === void 0 && (a = 0), go(this, e, t, n, r, i, a);
	}
	var t = e.prototype;
	return t.inverse = function() {
		var e = this.a, t = this.b, n = this.c, r = this.d, i = this.e, a = this.f, o = e * r - t * n || 1e-10;
		return go(this, r / o, -t / o, -n / o, e / o, (n * a - r * i) / o, -(e * a - t * i) / o);
	}, t.multiply = function(e) {
		var t = this.a, n = this.b, r = this.c, i = this.d, a = this.e, o = this.f, s = e.a, c = e.c, l = e.b, u = e.d, d = e.e, f = e.f;
		return go(this, s * t + l * r, s * n + l * i, c * t + u * r, c * n + u * i, a + d * t + f * r, o + d * n + f * i);
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
function vo(e, t, n, r) {
	if (!e || !e.parentNode || (Ja || Y(e)).documentElement === e) return new _o();
	var i = io(e), a = lo(e) ? ao : oo, o = ho(e, n), s = a[0].getBoundingClientRect(), c = a[1].getBoundingClientRect(), l = a[2].getBoundingClientRect(), u = o.parentNode, d = !r && uo(e), f = new _o((c.left - s.left) / 100, (c.top - s.top) / 100, (l.left - s.left) / 100, (l.top - s.top) / 100, s.left + (d ? 0 : co()), s.top + (d ? 0 : so()));
	if (u.removeChild(o), i) for (s = i.length; s--;) c = i[s], c.scaleX = c.scaleY = 0, c.renderTransform(1, c);
	return t ? f.inverse() : f;
}
//#endregion
//#region node_modules/gsap/MotionPathPlugin.js
var yo = "x,translateX,left,marginLeft,xPercent".split(","), bo = "y,translateY,top,marginTop,yPercent".split(","), xo = Math.PI / 180, So, Co, wo, To, Eo, Do, Oo = function() {
	return So || typeof window < "u" && (So = window.gsap) && So.registerPlugin && So;
}, ko = function(e, t, n, r) {
	for (var i = t.length, a = r === 2 ? 0 : r, o = 0; o < i; o++) e[a] = parseFloat(t[o][n]), r === 2 && (e[a + 1] = 0), a += 2;
	return e;
}, Ao = function(e, t, n) {
	return parseFloat(e._gsap.get(e, t, n || "px")) || 0;
}, jo = function(e) {
	var t = e[0], n = e[1], r;
	for (r = 2; r < e.length; r += 2) t = e[r] += t, n = e[r + 1] += n;
}, Mo = function(e, t, n, r, i, a, o, s, c) {
	return o.type === "cubic" ? t = [t] : (o.fromCurrent !== !1 && t.unshift(Ao(n, r, s), i ? Ao(n, i, c) : 0), o.relative && jo(t), t = [(i ? Ka : Ga)(t, o.curviness)]), t = a(Lo(t, n, o)), Ro(e, n, r, t, "x", s), i && Ro(e, n, i, t, "y", c), Ra(t, o.resolution || (o.curviness === 0 ? 20 : 12));
}, No = function(e) {
	return e;
}, Po = /[-+\.]*\d+\.?(?:e-|e\+)?\d*/g, Fo = function(e, t, n) {
	var r = vo(e), i = 0, a = 0, o;
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
}, Io = function(e, t, n, r) {
	var i = vo(e.parentNode, !0, !0), a = i.clone().multiply(vo(t)), o = Fo(e, n, i), s = Fo(t, r, i), c = s.x, l = s.y, u;
	return a.e = a.f = 0, r === "auto" && t.getTotalLength && t.tagName.toLowerCase() === "path" && (u = t.getAttribute("d").match(Po) || [], u = a.apply({
		x: +u[0],
		y: +u[1]
	}), c += u.x, l += u.y), u && (u = a.apply(t.getBBox()), c -= u.x, l -= u.y), a.e = c - o.x, a.f = l - o.y, a;
}, Lo = function(e, t, n) {
	var r = n.align, i = n.matrix, a = n.offsetX, o = n.offsetY, s = n.alignOrigin, c = e[0][0], l = e[0][1], u = Ao(t, "x"), d = Ao(t, "y"), f, p, m;
	return !e || !e.length ? Oa("M0,0L0,0") : (r && (r === "self" || (f = To(r)[0] || t) === t ? Ha(e, 1, 0, 0, 1, u - c, d - l) : (s && s[2] !== !1 ? So.set(t, { transformOrigin: s[0] * 100 + "% " + s[1] * 100 + "%" }) : s = [Ao(t, "xPercent") / -100, Ao(t, "yPercent") / -100], p = Io(t, f, s, "auto"), m = p.apply({
		x: c,
		y: l
	}), Ha(e, p.a, p.b, p.c, p.d, u + p.e - (m.x - p.e), d + p.f - (m.y - p.f)))), i ? Ha(e, i.a, i.b, i.c, i.d, i.e, i.f) : (a || o) && Ha(e, 1, 0, 0, 1, a || 0, o || 0), e);
}, Ro = function(e, t, n, r, i, a) {
	var o = t._gsap, s = o.harness, c = s && s.aliases && s.aliases[n], l = c && c.indexOf(",") < 0 ? c : n, u = e._pt = new Co(e._pt, t, l, 0, 0, No, 0, o.set(t, l, e));
	u.u = wo(o.get(t, l, a)) || 0, u.path = r, u.pp = i, e._props.push(l);
}, zo = function(e, t) {
	return function(n) {
		return e || t !== 1 ? Ia(n, e, t) : n;
	};
}, Bo = {
	version: "3.12.7",
	name: "motionPath",
	register: function(e, t, n) {
		So = e, wo = So.utils.getUnit, To = So.utils.toArray, Eo = So.core.getStyleSaver, Do = So.core.reverting || function() {}, Co = n;
	},
	init: function(e, t, n) {
		if (!So) return console.warn("Please gsap.registerPlugin(MotionPathPlugin)"), !1;
		(!(typeof t == "object" && !t.style) || !t.path) && (t = { path: t });
		var r = [], i = t, a = i.path, o = i.autoRotate, s = i.unitX, c = i.unitY, l = i.x, u = i.y, d = a[0], f = zo(t.start, "end" in t ? t.end : 1), p, m;
		if (this.rawPaths = r, this.target = e, this.tween = n, this.styles = Eo && Eo(e, "transform"), (this.rotate = o || o === 0) && (this.rOffset = parseFloat(o) || 0, this.radians = !!t.useRadians, this.rProp = t.rotation || "rotation", this.rSet = e._gsap.set(e, this.rProp, this), this.ru = wo(e._gsap.get(e, this.rProp)) || 0), Array.isArray(a) && !("closed" in a) && typeof d != "number") {
			for (m in d) !l && ~yo.indexOf(m) ? l = m : !u && ~bo.indexOf(m) && (u = m);
			for (m in l && u ? r.push(Mo(this, ko(ko([], a, l, 0), a, u, 1), e, l, u, f, t, s || wo(a[0][l]), c || wo(a[0][u]))) : l = u = 0, d) m !== l && m !== u && r.push(Mo(this, ko([], a, m, 2), e, m, 0, f, t, wo(a[0][m])));
		} else p = f(Lo(Oa(t.path), e, t)), Ra(p, t.resolution), r.push(p), Ro(this, e, t.x || "x", p, "x", t.unitX || "px"), Ro(this, e, t.y || "y", p, "y", t.unitY || "px");
		n.vars.immediateRender && this.render(n.progress(), this);
	},
	render: function(e, t) {
		var n = t.rawPaths, r = n.length, i = t._pt;
		if (t.tween._time || !Do()) {
			for (e > 1 ? e = 1 : e < 0 && (e = 0); r--;) Va(n[r], e, !r && t.rotate, n[r]);
			for (; i;) i.set(i.t, i.p, i.path[i.pp] + i.u, i.d, e), i = i._next;
			t.rotate && t.rSet(t.target, t.rProp, n[0].angle * (t.radians ? xo : 1) + t.rOffset + t.ru, t, e);
		} else t.styles.revert();
	},
	getLength: function(e) {
		return Ra(Oa(e)).totalLength;
	},
	sliceRawPath: Ia,
	getRawPath: Oa,
	pointsToSegment: Ka,
	stringToRawPath: Wa,
	rawPathToString: qa,
	transformRawPath: Ha,
	getGlobalMatrix: vo,
	getPositionOnPath: Va,
	cacheRawPathMeasurements: Ra,
	convertToPath: function(e, t) {
		return To(e).map(function(e) {
			return Pa(e, t !== !1);
		});
	},
	convertCoordinates: function(e, t, n) {
		var r = vo(t, !0, !0).multiply(vo(e));
		return n ? r.apply(n) : r;
	},
	getAlignMatrix: Io,
	getRelativePosition: function(e, t, n, r) {
		var i = Io(e, t, n, r);
		return {
			x: i.e,
			y: i.f
		};
	},
	arrayToRawPath: function(e, t) {
		t ||= {};
		var n = ko(ko([], e, t.x || "x", 0), e, t.y || "y", 1);
		return t.relative && jo(n), [t.type === "cubic" ? n : Ka(n, t.curviness)];
	}
};
Oo() && So.registerPlugin(Bo);
//#endregion
//#region src/table/animations/initMotion.ts
var Vo = !1;
function Ho(e) {
	typeof window > "u" || (Vo ||= (Qi.registerPlugin(Bo), !0), ((e instanceof HTMLElement ? e : null) ?? document.querySelector(".btable-wrap") ?? document.querySelector(".btable-session"))?.setAttribute("data-gsap-motion", "true"));
}
//#endregion
//#region src/table/animations/cardMotion.ts
function Uo() {
	Ho();
}
var Wo = /* @__PURE__ */ new WeakMap();
function Go(e = document) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = t.querySelector("[data-testid=\"deal-button\"]") ?? t.querySelector(".deck-stack__pile") ?? t.querySelector(".deck-stack");
	return n ? $i(n) : null;
}
function Ko(e, t) {
	return Wo.get(e)?.kill(), Wo.set(e, t), t;
}
function qo(e) {
	e && (Wo.get(e)?.kill(), Wo.delete(e), Qi.killTweensOf(e), Qi.set(e, { clearProps: "transform,opacity,filter" }));
}
function Jo(e, t, n = .22) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * n)
	};
}
function Yo(e, t, n = {}) {
	Uo();
	let r = I(), { x: i, y: a } = na($i(e), t), o = n.duration ?? ne(P.playToTable, r), s = n.rotation ?? -10, c = n.scale ?? .9;
	if (Qi.set(e, {
		transformOrigin: "50% 50%",
		willChange: "transform,opacity"
	}), Qi.set(e, {
		x: i,
		y: a,
		rotation: s,
		scale: c,
		opacity: r ? 1 : .92
	}), n.arc && !r) {
		let { midX: t, midY: r } = Jo(i, a);
		return Ko(e, Qi.to(e, {
			motionPath: {
				path: [
					{
						x: i,
						y: a
					},
					{
						x: t,
						y: r
					},
					{
						x: 0,
						y: 0
					}
				],
				curviness: 1.25
			},
			rotation: 0,
			scale: 1,
			opacity: 1,
			duration: o,
			ease: N,
			onComplete: () => {
				Qi.set(e, { clearProps: "transform,opacity,willChange" }), n.onComplete?.();
			}
		}));
	}
	return Ko(e, Qi.to(e, {
		x: 0,
		y: 0,
		rotation: 0,
		scale: 1,
		opacity: 1,
		duration: o,
		ease: te,
		onComplete: () => {
			Qi.set(e, { clearProps: "transform,opacity,willChange" }), n.onComplete?.();
		}
	}));
}
function Xo(e, t, n = {}) {
	return Yo(e, t, {
		arc: !0,
		onComplete: n.onComplete
	});
}
function Zo(e, t, n = P.dealStagger) {
	Uo();
	let r = I(), i = Qi.timeline(), a = ne(P.deal, r);
	return e.forEach((e, o) => {
		let { x: s, y: c } = na($i(e), t), { midX: l, midY: u } = Jo(s, c, .28);
		Qi.set(e, {
			transformOrigin: "50% 80%",
			willChange: "transform,opacity"
		}), Qi.set(e, {
			x: s,
			y: c,
			rotation: -14 + o * 2,
			rotationY: r ? 0 : -72,
			scale: .58,
			opacity: +!!r
		});
		let d = o * (r ? .04 : n), f = () => {
			Qi.set(e, { clearProps: "transform,opacity,willChange" });
		};
		r ? i.to(e, {
			x: 0,
			y: 0,
			rotation: 0,
			rotationY: 0,
			scale: 1,
			opacity: 1,
			duration: a,
			ease: N,
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
			ease: N,
			onComplete: f
		}, d);
	}), i;
}
function Qo(e) {
	Uo();
	let t = Qi.timeline(), n = ne(P.drawDiscard);
	return e.forEach((e, r) => {
		Qi.set(e, {
			transformOrigin: "50% 50%",
			willChange: "transform,opacity"
		}), t.to(e, {
			x: 56 + r * 8,
			y: 42,
			rotation: 18 + r * 4,
			rotationX: 48,
			scale: .72,
			opacity: 0,
			duration: n,
			ease: ee,
			onComplete: () => qo(e)
		}, r * .05);
	}), t;
}
function $o(e, t) {
	Uo();
	let n = I(), r = Qi.timeline(), i = ne(P.drawReceive, n), a = n ? .04 : P.drawReceiveStagger;
	return e.forEach((e, n) => {
		let { x: o, y: s } = na($i(e), t);
		Qi.set(e, {
			transformOrigin: "50% 80%",
			willChange: "transform,opacity"
		}), Qi.set(e, {
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
			ease: te,
			onComplete: () => {
				Qi.set(e, { clearProps: "transform,opacity,willChange" });
			}
		}, n * a);
	}), r;
}
function es(e) {
	Uo();
	let t = Qi.timeline(), n = ne(P.standPat);
	return e.forEach((e) => {
		t.fromTo(e, {
			y: 0,
			scale: 1
		}, {
			y: -5,
			scale: 1.02,
			duration: n * .45,
			ease: N,
			yoyo: !0,
			repeat: 1,
			onComplete: () => {
				Qi.set(e, { clearProps: "transform,willChange" });
			}
		}, 0);
	}), t;
}
function ts(e) {
	Uo();
	let t = Qi.timeline(), n = ne(P.foldOut);
	return e.forEach((e, r) => {
		Qi.set(e, {
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
			ease: ee,
			onComplete: () => qo(e)
		}, r * .04);
	}), t;
}
function ns(e) {
	Uo();
	let t = ne(.32);
	return Qi.set(e, {
		transformOrigin: "50% 90%",
		willChange: "transform"
	}), Ko(e, Qi.to(e, {
		y: -26,
		rotationX: 14,
		rotationY: -10,
		scale: 1.05,
		duration: t,
		ease: N
	}));
}
//#endregion
//#region src/table/animations/useHeroCardMotion.ts
function rs(e) {
	return `${e.rank}-${e.suit}`;
}
function is(e) {
	return e ? [...e.querySelectorAll(".hand__slot .pcard")] : [];
}
function as(e, { dealing: t, dealStaggerMs: n, drawAnimSubPhase: r, pendingDiscardIndices: i, standPatPulse: a, foldOutPulse: o, playingIndex: s, cards: c }) {
	let u = (0, l.useRef)([]), d = (0, l.useRef)(!1), f = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		Ho(e.current?.closest(".btable-wrap") ?? document);
	}, [e]), (0, l.useLayoutEffect)(() => {
		if (!t || c.length === 0) {
			d.current = !1;
			return;
		}
		if (d.current) return;
		let r = e.current, i = is(r);
		if (!i.length) return;
		d.current = !0;
		let a = Go(r ?? document);
		a && Zo(i, a, Math.max(.04, n / 1e3));
	}, [
		t,
		c.length,
		n,
		e
	]), (0, l.useLayoutEffect)(() => {
		if (r === "discard") {
			u.current = c.map(rs);
			let t = e.current, n = is(t), r = i.length > 0 ? i.map((e) => n[e]).filter((e) => !!e) : [...t?.querySelectorAll(".hand__slot--draw-selected .pcard") ?? []];
			r.length && Qo(r);
			return;
		}
		if (r === "receive") {
			let t = e.current, n = is(t), r = new Set(u.current), i = c.map((e, t) => ({
				key: rs(e),
				el: n[t]
			})).filter((e) => !!e.el && !r.has(e.key)).map((e) => e.el), a = Go(t ?? document);
			i.length && a && $o(i, a);
			return;
		}
		(r === "done" || r === null) && (u.current = c.map(rs));
	}, [
		r,
		c,
		i,
		e
	]), (0, l.useLayoutEffect)(() => {
		if (!a) return;
		let t = is(e.current);
		t.length && es(t);
	}, [a, e]), (0, l.useLayoutEffect)(() => {
		if (!o) return;
		let t = is(e.current);
		t.length && ts(t);
	}, [o, e]), (0, l.useLayoutEffect)(() => {
		let t = e.current, n = is(t);
		if (s === null) {
			if (f.current !== null) {
				let e = n[f.current];
				e && qo(e), f.current = null;
			}
			return;
		}
		if (f.current === s) return;
		if (f.current !== null) {
			let e = n[f.current];
			e && qo(e);
		}
		let r = n[s];
		r && (ns(r), f.current = s);
	}, [
		s,
		c,
		e
	]), (0, l.useLayoutEffect)(() => () => {
		for (let t of is(e.current)) qo(t);
	}, [e]);
}
function os(e, t) {
	let n = t / 1e3, r = Math.max(e - 1, 0) * n;
	return Math.round((r + P.deal) * 1e3);
}
//#endregion
//#region src/table/handUi.ts
function ss(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function cs(e, t) {
	if (t) return "Play or pass";
	switch (e) {
		case "reveal": return "Dealing";
		case "decision": return "Play or pass";
		case "draw": return "Draw round";
		case "play": return "Trick play";
		default: return "Waiting to deal";
	}
}
function ls(e) {
	return {
		spades: "Spades",
		hearts: "Hearts",
		diamonds: "Diamonds",
		clubs: "Clubs"
	}[e ?? ""] ?? e ?? "—";
}
function us(e) {
	return e === "reveal" || e === "decision" || e === "draw" || e === "play";
}
function ds(e) {
	return e === "decision";
}
function fs(e) {
	return e === "reveal";
}
function ps(e, t) {
	if (!e) return null;
	let n = t.find((t) => t.playerId === e);
	return n ? n.isSelf ? "Your turn" : `${n.displayName}'s turn` : null;
}
//#endregion
//#region src/table/trickPlayFly.ts
var ms = /* @__PURE__ */ new Map();
function hs(e) {
	return `${e.playerId}:${e.card.rank}:${e.card.suit}`;
}
function gs(e) {
	return document.querySelector(`[data-trick-play-origin-active="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin-active="${e}"]`) ?? document.querySelector(`[data-trick-play-origin="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin="${e}"]`);
}
function _s(e) {
	let t = gs(e);
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return {
		left: n.left,
		top: n.top,
		width: n.width,
		height: n.height
	};
}
function vs(e, t) {
	let n = _s(e);
	return n && ms.set(t, n), n;
}
function ys(e, t, n) {
	let r = document.querySelector("[data-testid=\"hero-hand\"]")?.querySelectorAll(".hand__slot .pcard")[n];
	if (r) {
		let e = r.getBoundingClientRect(), n = {
			left: e.left,
			top: e.top,
			width: e.width,
			height: e.height
		};
		return ms.set(t, n), n;
	}
	return vs(e, t);
}
function bs(e) {
	return ms.get(e);
}
function xs() {
	ms.clear();
}
//#endregion
//#region src/table/tableMicrointeractions.ts
var Ss = {
	turnHandoff: 620,
	dealerMove: 720,
	potTick: 480,
	trickBadge: 450,
	trumpReminder: 900,
	feedbackPulse: 420,
	illegalShake: 340,
	cardSelect: 380,
	winnerFlash: 520,
	bankrollTick: 900,
	bourrePulse: 1200,
	bourreMarker: 4500
}, Cs = {
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
function ws(e) {
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
function Ts(e, t) {
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
//#region src/table/feedback/audio.ts
var Es = {
	shuffle: "./sounds/shuffle.mp3",
	trickWin: "./sounds/trick-win.mp3",
	bigWin: "./sounds/big-win.mp3"
}, Ds = null, Os = null, ks = !1, As = /* @__PURE__ */ new Map(), js = /* @__PURE__ */ new Map();
function Ms() {
	if (typeof window > "u") return null;
	try {
		let e = window.AudioContext ?? window.webkitAudioContext;
		return e ? (Ds || (Ds = new e(), Os = Ds.createGain(), Os.gain.value = .55, Os.connect(Ds.destination)), Ds) : null;
	} catch {
		return null;
	}
}
async function Ns() {
	ks = !0;
	let e = Ms();
	if (e) {
		if (e.state === "suspended") try {
			await e.resume();
		} catch {}
		Is();
	}
}
function Ps(e) {
	if (typeof window > "u") return null;
	try {
		let t = As.get(e);
		return t || (t = new Audio(e), t.preload = "auto", As.set(e, t)), t;
	} catch {
		return null;
	}
}
async function Fs(e) {
	if (js.has(e)) return js.get(e) === !0;
	if (typeof window > "u") return !1;
	try {
		let t = (await fetch(e, { method: "HEAD" })).ok;
		return js.set(e, t), t;
	} catch {
		return js.set(e, !1), !1;
	}
}
async function Is() {
	ks && await Promise.all(Object.values(Es).map(async (e) => {
		if (!await Fs(e)) return;
		let t = Ps(e);
		if (t) try {
			t.load();
		} catch {}
	}));
}
async function Ls(e, t = .55) {
	if (!ks || !await Fs(e)) return !1;
	let n = Ps(e);
	if (!n) return !1;
	try {
		return n.volume = t, n.currentTime = 0, await n.play(), !0;
	} catch {
		return !1;
	}
}
function Rs(e, t, n, r, i, a, o = "sine") {
	let s = e.createOscillator(), c = e.createGain();
	s.type = o, s.frequency.setValueAtTime(n, r), c.gain.setValueAtTime(1e-4, r), c.gain.exponentialRampToValueAtTime(a, r + .008), c.gain.exponentialRampToValueAtTime(1e-4, r + i), s.connect(c), c.connect(t), s.start(r), s.stop(r + i + .02);
}
function zs(e, t, n, r, i) {
	let a = Math.max(256, Math.floor(e.sampleRate * r)), o = e.createBuffer(1, a, e.sampleRate), s = o.getChannelData(0);
	for (let e = 0; e < a; e += 1) s[e] = (Math.random() * 2 - 1) * (1 - e / a);
	let c = e.createBufferSource();
	c.buffer = o;
	let l = e.createBiquadFilter();
	l.type = "bandpass", l.frequency.value = 1400, l.Q.value = .6;
	let u = e.createGain();
	u.gain.setValueAtTime(i, n), u.gain.exponentialRampToValueAtTime(1e-4, n + r), c.connect(l), l.connect(u), u.connect(t), c.start(n), c.stop(n + r + .01);
}
function Bs() {
	let e = Ms();
	if (!e || !Os) return;
	let t = e.currentTime;
	for (let n of [
		0,
		.06,
		.12,
		.2,
		.28
	]) zs(e, Os, t + n, .05, .08 + Math.random() * .04);
}
function Vs() {
	let e = Ms();
	if (!e || !Os) return;
	let t = e.currentTime;
	Rs(e, Os, 880, t, .12, .09, "sine"), Rs(e, Os, 1174.66, t + .07, .16, .07, "triangle"), Rs(e, Os, 1760, t + .14, .1, .04, "sine");
}
function Hs() {
	let e = Ms();
	if (!e || !Os) return;
	let t = e.currentTime;
	Rs(e, Os, 659.25, t, .14, .08, "sine"), Rs(e, Os, 830.61, t + .1, .18, .09, "triangle"), Rs(e, Os, 987.77, t + .22, .22, .1, "sine"), Rs(e, Os, 1318.51, t + .34, .28, .06, "triangle");
}
async function Us(e, t, n, r) {
	if (!n.current) {
		n.current = !0;
		try {
			await Ls(e) || ks && t();
		} catch {} finally {
			window.setTimeout(() => {
				n.current = !1;
			}, r);
		}
	}
}
var Ws = { current: !1 }, Gs = { current: !1 }, Ks = { current: !1 };
function qs() {
	Us(Es.shuffle, Bs, Ws, 360);
}
function Js() {
	Us(Es.trickWin, Vs, Gs, 320);
}
function Ys() {
	Us(Es.bigWin, Hs, Ks, 580);
}
function Xs() {
	return typeof window < "u" && !!(window.AudioContext ?? window.webkitAudioContext ?? typeof Audio < "u");
}
//#endregion
//#region src/table/feedback/haptics.ts
function Zs() {
	return typeof navigator < "u" && typeof navigator.vibrate == "function";
}
function Qs(e) {
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
var $s = {
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
function ec(e) {
	try {
		return Qs(e) ? !0 : Zs() ? navigator.vibrate($s[e]) ?? !1 : !1;
	} catch {
		return !1;
	}
}
function tc() {
	return Zs() || !!(typeof window < "u" && window.BourreHaptics);
}
//#endregion
//#region src/table/feedback/prefs.ts
var nc = "nbl-feedback", rc = {
	soundEnabled: !0,
	hapticsMode: "on"
};
function ic(e) {
	if (!e || typeof e != "object") return { ...rc };
	let t = e, n = t.hapticsMode, r = n === "off" || n === "minimal" || n === "on" ? n : t.hapticsEnabled === !1 ? "off" : "on";
	return {
		soundEnabled: t.soundEnabled !== !1,
		hapticsMode: r
	};
}
function ac() {
	try {
		let e = localStorage.getItem(nc);
		return e ? ic(JSON.parse(e)) : { ...rc };
	} catch {
		return { ...rc };
	}
}
function oc(e) {
	let t = {
		...ac(),
		...e
	};
	try {
		localStorage.setItem(nc, JSON.stringify(t));
	} catch {}
	return lc(t), t;
}
var sc = /* @__PURE__ */ new Set();
function cc(e) {
	return sc.add(e), () => sc.delete(e);
}
function lc(e) {
	for (let t of sc) t(e);
}
function uc() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function dc(e, t) {
	return !(e === "off" || e === "minimal" && t === "light" || uc() && t === "light");
}
var fc = 700, pc = 450, mc = 1200, hc = 280, gc = 0, _c = 0, vc = 0, yc = 0, bc = null, xc = !1;
function Sc() {
	return ac();
}
function Cc(e) {
	dc(Sc().hapticsMode, e) && ec(e);
}
function wc() {
	if (xc || typeof window > "u") return;
	xc = !0;
	let e = () => {
		Ns();
	};
	window.addEventListener("pointerdown", e, {
		once: !0,
		passive: !0
	}), window.addEventListener("keydown", e, { once: !0 });
}
function Tc(e = {}) {
	let t = Sc();
	if (Date.now() - gc < fc) return;
	bc &&= (clearTimeout(bc), null);
	let n = e.delayMs ?? (uc() ? 0 : 40);
	bc = window.setTimeout(() => {
		bc = null, gc = Date.now(), t.soundEnabled && qs(), Cc("light");
	}, n);
}
function Ec() {
	let e = Sc(), t = Date.now();
	t - _c < pc || (_c = t, e.soundEnabled && Js(), Cc("medium"));
}
function Dc() {
	let e = Sc(), t = Date.now();
	t - vc < mc || (vc = t, e.soundEnabled && Ys(), Cc("strong"));
}
function Oc() {
	let e = Date.now();
	e - yc < hc || (yc = e, Cc("light"));
}
function kc() {
	Cc("light");
}
//#endregion
//#region src/table/theme/settings.ts
var Ac = "nbl-table-settings", jc = {
	focusTable: "F",
	toggleSettings: ",",
	standPat: "P",
	nextTable: "Tab"
}, Mc = {
	themeId: "night-felt",
	deckMode: "classic",
	cardScale: "md",
	highContrast: !1,
	tableScale: 1,
	layoutMode: "single",
	hotkeys: { ...jc }
}, Nc = {
	carbon: "Carbon",
	simple: "Simple",
	"night-felt": "Night Felt",
	arena: "Arena"
};
function Pc(e) {
	return Math.max(.85, Math.min(1.35, e));
}
function Fc() {
	try {
		let e = localStorage.getItem(Ac);
		if (!e) return {
			...Mc,
			hotkeys: { ...jc }
		};
		let t = JSON.parse(e);
		return {
			...Mc,
			...t,
			tableScale: Pc(t.tableScale ?? Mc.tableScale),
			hotkeys: {
				...jc,
				...t.hotkeys
			}
		};
	} catch {
		return {
			...Mc,
			hotkeys: { ...jc }
		};
	}
}
function Ic(e) {
	try {
		localStorage.setItem(Ac, JSON.stringify(e));
	} catch {}
}
function Lc(e, t) {
	e.dataset.tableTheme = t.themeId, e.dataset.deckMode = t.deckMode, e.dataset.cardScale = t.cardScale, e.dataset.highContrast = t.highContrast ? "true" : "false", e.dataset.layoutMode = t.layoutMode, e.style.setProperty("--table-scale", String(t.tableScale));
}
//#endregion
//#region src/table/theme/TableThemeContext.tsx
var Rc = (0, l.createContext)(null);
function zc({ settings: e, children: t }) {
	let n = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		n.current && Lc(n.current, e);
	}, [e]), /* @__PURE__ */ (0, g.jsx)("div", {
		ref: n,
		className: "btable-room",
		children: t
	});
}
function Bc({ children: e }) {
	let [t, n] = (0, l.useState)(() => Fc()), r = (0, l.useCallback)((e) => {
		n((t) => {
			let n = {
				...t,
				...e,
				hotkeys: {
					...t.hotkeys,
					...e.hotkeys
				}
			};
			return Ic(n), n;
		});
	}, []), i = (0, l.useCallback)(() => {
		let e = {
			...Mc,
			hotkeys: { ...Mc.hotkeys }
		};
		Ic(e), n(e);
	}, []), a = (0, l.useMemo)(() => ({
		settings: t,
		updateSettings: r,
		resetSettings: i
	}), [
		t,
		r,
		i
	]);
	return /* @__PURE__ */ (0, g.jsx)(Rc.Provider, {
		value: a,
		children: /* @__PURE__ */ (0, g.jsx)(zc, {
			settings: t,
			children: e
		})
	});
}
//#endregion
//#region src/table/theme/useTableTheme.ts
function Vc() {
	let e = (0, l.useContext)(Rc);
	if (!e) throw Error("useTableTheme must be used within TableThemeProvider");
	return e;
}
//#endregion
//#region src/table/HeroHand.tsx
function Hc(e, t, n = []) {
	return [
		`btable-hero btable-hero--bare btable-hero--scale-${e.cardScale}`,
		...n,
		t
	].filter(Boolean).join(" ");
}
function Uc({ className: e = "" }) {
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: `btable-hero btable-hero--bare btable-hero--reserved ${e}`.trim(),
		"aria-hidden": "true",
		"data-testid": "hero-hand"
	});
}
function Wc({ cards: e, phase: t, enrollmentActive: n = !1, isInHand: r = !1, isDealer: i = !1, signedIn: a = !1, isMyTurn: o = !1, drawCompleted: s = !1, maxDrawDiscards: c = 4, legalPlayIndices: u, handComplete: d = !1, actionFeedback: f, onSubmitDraw: p, onPassDraw: m, onFoldDraw: h, onPlayCard: _, privateHandReady: v = !1, className: y = "", dealStaggerMs: b = 120, drawAnimSubPhase: x = null, currentUserId: S = null, revealedTrumpIndex: C = null, trumpMergeActive: w = !1, trumpDisabledIndex: T = null }) {
	let { settings: E } = Vc(), [D, O] = (0, l.useState)(/* @__PURE__ */ new Set()), [k, A] = (0, l.useState)(null), [j, N] = (0, l.useState)(null), [ee, te] = (0, l.useState)(null), [P, F] = (0, l.useState)(!1), [ne, I] = (0, l.useState)(null), [L, re] = (0, l.useState)(null), [R, z] = (0, l.useState)(!1), [ie, ae] = (0, l.useState)(!1), [B, oe] = (0, l.useState)(!1), [V, se] = (0, l.useState)([]), ce = (0, l.useRef)(/* @__PURE__ */ new Set()), le = (0, l.useRef)(null), ue = (0, l.useRef)(!1), de = us(t), fe = (0, l.useMemo)(() => e.map(ss), [e]), pe = (0, l.useCallback)((e, t) => C === t ? w ? "hand__slot--trump-merge-target" : "hand__slot--trump-revealed" : "", [C, w]);
	(0, l.useEffect)(() => {
		if (!de || e.length === 0) return;
		let t = new Set(e.map((e) => `${e.rank}-${e.suit}`)), n = ce.current, r = [...t].some((e) => !n.has(e));
		if (ce.current = t, !r || n.size > 0) return;
		z(!0), N(null), A(null);
		let i = os(e.length, b), a = window.setTimeout(() => z(!1), i);
		return () => window.clearTimeout(a);
	}, [
		e,
		de,
		b
	]), (0, l.useEffect)(() => {
		(x === "done" || x === null) && se([]);
	}, [x]), as(le, {
		dealing: R,
		dealStaggerMs: b,
		drawAnimSubPhase: x,
		pendingDiscardIndices: V,
		standPatPulse: ie,
		foldOutPulse: B,
		playingIndex: j,
		cards: e
	}), (0, l.useEffect)(() => {
		(f?.status === "success" || f?.status === "error") && (N(null), ue.current = !1);
	}, [f?.status]);
	let me = t === "draw", he = t === "play", ge = E.cardScale === "lg" ? "md" : "sm", H = P || f?.status === "loading" || j !== null, _e = f?.status === "error" ? f.message : ne, ve = cs(t, n), ye = (0, l.useCallback)((e) => {
		H || T === e || (I(null), O((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.size < c ? n.add(e) : I(`You may discard at most ${c} cards`), n;
		}));
	}, [
		H,
		c,
		T
	]), be = (0, l.useCallback)(async (e) => {
		if (ue.current || H || !_) return;
		if (u && !u.includes(e)) {
			Oc(), re(e), window.setTimeout(() => re(null), Ss.illegalShake), I("That card can't be played now");
			return;
		}
		ue.current = !0, A(e), N(e), I(null);
		let t = fe[e];
		S && t && ys(S, hs({
			playerId: S,
			card: {
				rank: String(t.rank),
				suit: String(t.suit)
			}
		}), e);
		try {
			await Promise.resolve(_(e)), N(null), ue.current = !1;
		} catch (e) {
			I(e instanceof Error ? e.message : "Could not play card"), N(null), ue.current = !1;
		}
	}, [
		H,
		u,
		_,
		S,
		fe
	]), xe = (0, l.useCallback)(async (e) => {
		if (!(!p || H)) {
			if (e.length > c) {
				I(`You may discard at most ${c} cards`);
				return;
			}
			F(!0), I(null), se([...e]);
			try {
				await p(e), O(/* @__PURE__ */ new Set());
			} catch (e) {
				I(e instanceof Error ? e.message : "Draw failed");
			} finally {
				F(!1);
			}
		}
	}, [
		p,
		H,
		c
	]), Se = (0, l.useCallback)(async () => {
		if (!(!m || H)) {
			F(!0), I(null);
			try {
				await m(), O(/* @__PURE__ */ new Set()), ae(!0), window.setTimeout(() => ae(!1), 700);
			} catch (e) {
				I(e instanceof Error ? e.message : "Could not stand pat");
			} finally {
				F(!1);
			}
		}
	}, [m, H]), Ce = (0, l.useCallback)(async () => {
		if (!(!h || H)) {
			oe(!0), F(!0), I(null);
			try {
				await h(), O(/* @__PURE__ */ new Set());
			} catch (e) {
				oe(!1), I(e instanceof Error ? e.message : "Could not fold out");
			} finally {
				F(!1);
			}
		}
	}, [h, H]), we = (0, l.useCallback)((e) => {
		Oc(), re(e), window.setTimeout(() => re(null), Ss.illegalShake), I("That card can't be played now");
	}, []);
	if (!a) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: Hc(E, y),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "Sign in to see your dealt cards."
		})
	});
	if (!r && !n && !de) return /* @__PURE__ */ (0, g.jsx)(Uc, { className: y });
	if (de && r && e.length === 0) return d && n ? /* @__PURE__ */ (0, g.jsx)(Uc, { className: y }) : /* @__PURE__ */ (0, g.jsx)("div", {
		className: Hc(E, y),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: v ? "Cards not available — leave and re-open the session, or refresh the page." : "Loading your cards…"
		})
	});
	if (de && !r && (t === "draw" || t === "play")) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: Hc(E, y),
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "You sat out this hand."
		})
	});
	if (e.length === 0 && !i) return /* @__PURE__ */ (0, g.jsx)(Uc, { className: y });
	let Te = (e, t) => C === t ? "trump" : T === t && (me || he) ? "muted" : j === t ? "selected" : me && D.has(t) ? "draw-selected" : he && k === t ? "selected" : he && !o ? "disabled" : he && u && !u.includes(t) ? "muted" : "default", Ee = de && r && !(he && o), De = "none";
	he && o ? De = "play" : me && o && !s ? De = "draw-select" : Ee && (De = "peek");
	let Oe = D.size, ke = me && !s && o;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: Hc(E, y, [
			R ? "btable-hero--dealing" : "",
			C === null ? "" : "btable-hero--trump-reveal",
			w ? "btable-hero--trump-merge" : "",
			me && o && !s ? "btable-hero--draw-select" : "",
			x === "discard" ? "btable-hero--draw-discard" : "",
			x === "receive" ? "btable-hero--draw-receive" : "",
			ke ? "btable-hero--draw-actions" : "",
			ie ? "btable-hero--stand-pat" : "",
			B ? "btable-hero--fold-out" : ""
		]),
		style: { "--deal-card-stagger-ms": `${b}ms` },
		"data-testid": "hero-hand",
		"aria-label": `Your dealt cards — ${ve}`,
		children: [
			/* @__PURE__ */ (0, g.jsxs)("p", {
				className: "btable-sr-only",
				"aria-live": "polite",
				children: [
					ve,
					me && !s && o && " — tap cards to discard",
					he && o && " — select a legal card to play"
				]
			}),
			/* @__PURE__ */ (0, g.jsx)("div", {
				ref: le,
				className: "btable-hero__hand-3d",
				"data-trick-play-origin": S ?? void 0,
				children: /* @__PURE__ */ (0, g.jsx)("div", {
					className: "btable-hero__hand-row",
					children: /* @__PURE__ */ (0, g.jsx)(M, {
						cards: fe,
						size: ge,
						fan: !0,
						stateFor: Te,
						slotClassFor: pe,
						peekIndex: ee,
						onCardPeek: Ee ? te : void 0,
						cardTestId: he && o ? "play-button" : void 0,
						cardInteraction: {
							mode: De,
							isMyTurn: o,
							legalPlayIndices: u,
							playingIndex: j,
							illegalShakeIndex: L,
							busy: H,
							trickPlayOriginPlayerId: S,
							onPlayCard: be,
							onSelectCard: ye,
							onIllegalPlay: we,
							onPeek: te
						}
					})
				})
			}),
			_e && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-hero__error",
				role: "alert",
				children: _e
			}),
			/* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-hero__actions-slot",
				"aria-hidden": !ke,
				children: ke && /* @__PURE__ */ (0, g.jsxs)("div", {
					className: "btable-hero__actions btable-hero__actions--triple",
					children: [
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--primary",
							"data-testid": "draw-button",
							disabled: H,
							"aria-busy": H,
							onClick: () => xe([...D].sort((e, t) => e - t)),
							children: H ? "Drawing…" : `Draw${Oe > 0 ? ` (${Oe})` : ""}`
						}),
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm",
							"data-testid": "pass-draw-button",
							disabled: H,
							onClick: () => Se(),
							children: "Stand pat"
						}),
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm",
							"data-testid": "im-out-button",
							disabled: H,
							onClick: () => Ce(),
							children: "I'm Out"
						})
					]
				})
			})
		]
	});
}
function Gc(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function Kc(e, t) {
	return Gc(e, t) >= 5;
}
function qc(e, t, n) {
	if (n !== "play") return [];
	let r = [...new Set(t.filter(Boolean))];
	return r.length < 2 || 5 - Gc(e, r) != 1 ? [] : r.filter((t) => (e[t] ?? 0) === 0);
}
function Jc(e, t, n, r) {
	return qc(t, n, r).includes(e);
}
function Yc(e, t) {
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
function X(e) {
	return `$${e.toLocaleString("en-US")}`;
}
function Xc(e) {
	let t = Math.round(Number(e) * 100) / 100;
	return !Number.isFinite(t) || t <= 0 ? "$0" : t < 1 ? `${Math.round(t * 100)}¢` : Math.round(t * 100) % 100 == 0 ? `$${Math.round(t).toLocaleString("en-US")}` : `$${t.toFixed(2)}`;
}
function Zc(e) {
	let t = Number(e) || 0;
	return t > 0 ? `+${X(t)}` : t < 0 ? `−${X(Math.abs(t))}` : X(0);
}
function Qc(e) {
	return X(Math.max(0, Number(e) || 0));
}
function $c(e, t, n) {
	return e == null || n.anteAlreadyPosted || !n.inHand || !n.anteAnimActive ? e : Math.max(0, e - Math.max(0, t));
}
function el(e) {
	return (e || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((e) => e[0]?.toUpperCase() || "").join("") || "?";
}
function tl(e) {
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
function nl(e) {
	let t = Math.cos(e), n = Math.sin(e);
	return Math.abs(n) >= Math.abs(t) ? n > 0 ? "bottom" : "top" : t > 0 ? "right" : "left";
}
var rl = {
	1: {
		x: 32,
		y: 88,
		region: "bottom"
	},
	7: {
		x: 68,
		y: 88,
		region: "bottom"
	}
};
function il(e, t) {
	let { rx: n, ry: r, outset: i } = tl(t), a = e / t * Math.PI * 2 + Math.PI / 2, o = Math.cos(a), s = Math.sin(a);
	return {
		x: 50 + n * o + o * i,
		y: 50 + r * s + s * i,
		region: nl(a)
	};
}
function al(e, t) {
	let n = Math.max(2, Math.min(8, t || 2));
	return n <= 0 ? {
		x: 50,
		y: 50,
		region: "bottom"
	} : n >= 8 && (e === 1 || e === 7) ? rl[e] : il(e, n);
}
function ol(e) {
	let t = Math.max(2, Math.min(8, e || 2));
	return t === 2 ? 1.04 : t === 3 ? .94 : t === 4 ? .98 : t === 5 ? 1.08 : t === 6 ? 1.12 : t === 7 ? 1.16 : 1.2;
}
//#endregion
//#region src/table/TrickPlaySlot.tsx
function sl({ play: e, index: t, presentationPhase: n, displayCount: r, playerName: i, winnerPlayerId: a = null }) {
	let o = (0, l.useRef)(null), [s, c] = (0, l.useState)(!1), [u, d] = (0, l.useState)(!1), f = a != null && e.playerId === a, p = t === r - 1 && n === "live", m = f && n !== "live" && n !== "trickComplete";
	return (0, l.useLayoutEffect)(() => {
		if (!p || typeof document > "u") {
			c(!0), d(!1);
			return;
		}
		let t = o.current;
		if (!t) return;
		let n = t.querySelector(".pcard");
		if (!n) return;
		let r = bs(hs(e)) ?? _s(e.playerId);
		if (Ho(t.closest(".btable-wrap") ?? document), !r) {
			c(!0), d(!1);
			return;
		}
		d(!0), c(!0), Xo(n, r, { onComplete: () => d(!1) });
	}, [p, e]), /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: o,
		className: [
			"btrick__play",
			u ? "btrick__play--gsap-fly" : "",
			p && !s ? "btrick__play--fly-pending" : "",
			f && m ? "btrick__play--winner" : ""
		].filter(Boolean).join(" "),
		children: [/* @__PURE__ */ (0, g.jsx)(_, {
			card: ss(e.card),
			size: "sm",
			state: m && f ? "winner" : "default"
		}), /* @__PURE__ */ (0, g.jsx)("span", {
			className: "btrick__name muted small",
			children: i
		})]
	});
}
//#endregion
//#region src/table/TrickRow.tsx
function cl({ displayPlays: e = [], winnerPlayerId: t = null, showWinnerTag: n = !1, presentationPhase: r = "live", playerNames: i = {}, variant: a = "live" }) {
	if (e.length === 0) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: "btrick btrick--empty muted small",
		"aria-hidden": "true",
		"data-testid": "trick-row",
		"data-trick-phase": r,
		"data-trick-card-count": "0",
		"data-trick-variant": a,
		children: /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btrick__surface",
			children: /* @__PURE__ */ (0, g.jsx)("span", {
				className: "btrick__placeholder",
				children: "Trick"
			})
		})
	});
	let o = t ? i[t] ?? "Player" : null, s = r === "trickComplete" || r === "winnerReveal", c = r === "collectTrick", l = a === "echo";
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: [
			"btrick",
			l ? "btrick--echo-pipeline" : "",
			s ? "btrick--hold" : "",
			c ? "btrick--sweep" : ""
		].filter(Boolean).join(" "),
		"aria-label": l ? void 0 : "Current trick",
		"aria-hidden": l ? !0 : void 0,
		"aria-live": l ? void 0 : "polite",
		"data-testid": l ? "trick-row-echo" : "trick-row",
		"data-trick-phase": r,
		"data-trick-card-count": e.length,
		"data-trick-variant": a,
		children: /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "btrick__surface",
			children: [n && o && /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btrick__winner-tag",
				"data-testid": "trick-winner-tag",
				children: [o, " takes it"]
			}), /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btrick__cards",
				role: "list",
				"aria-label": "Cards in trick",
				children: e.map((n, a) => /* @__PURE__ */ (0, g.jsx)(sl, {
					play: n,
					index: a,
					presentationPhase: l ? "winnerReveal" : r,
					displayCount: e.length,
					playerName: i[n.playerId] ?? "Player",
					winnerPlayerId: t
				}, `${n.playerId}-${n.card.rank}-${n.card.suit}-${a}`))
			})]
		})
	});
}
//#endregion
//#region src/table/PotCenter.tsx
function ll({ potMetrics: e, participantCount: t, trumpUpcard: n, trumpSuit: r, phase: i, enrollmentActive: a = !1, remainingDeckCount: o, trickDisplayPlays: s = [], trickWinnerPlayerId: c = null, trickShowWinnerTag: l = !1, trickPresentationPhase: u = "live", playerNames: f = {}, anteAnimActive: p = !1, trumpRevealActive: m = !1, drawAnimPlayerId: h = null, drawAnimSubPhase: v = "done", drawDiscardCount: y = 0, settleAnimActive: b = !1, settleCarryOver: x = !1, potTick: S = 0, trumpReminderPulse: C = 0, hideCenterTrump: w = !1, showTrumpSuitReminder: T = !1 }) {
	let E = cs(i, a), D = !!n && !w, O = T || !D && !!r && i === "play", k = D ? `${n.rank}-${n.suit}` : "none", A = u !== "live" && u !== "nextLeadReady", j = s.length;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: "table-center-cluster",
		"aria-label": "Table center",
		children: [/* @__PURE__ */ (0, g.jsxs)("div", {
			className: "deck-stack",
			"aria-label": "Deck and trump",
			children: [D ? /* @__PURE__ */ (0, g.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"bpot__trump--deal",
					m ? "bpot__trump--reveal" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-button",
				children: [/* @__PURE__ */ (0, g.jsx)(_, {
					card: {
						rank: n.rank,
						suit: n.suit
					},
					size: "sm",
					state: "trump"
				}), /* @__PURE__ */ (0, g.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, k) : O ? /* @__PURE__ */ (0, g.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"deck-stack__trump--suit-reminder",
					C > 0 ? "deck-stack__trump--suit-reminder-pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-suit-reminder",
				"aria-label": `Trump suit: ${ls(r)}`,
				children: [/* @__PURE__ */ (0, g.jsx)("div", {
					className: `trump-suit-badge trump-suit-badge--${r}`,
					"aria-hidden": "true",
					children: d[r]
				}), /* @__PURE__ */ (0, g.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, C > 0 ? `trump-reminder-${C}` : "trump-reminder") : /* @__PURE__ */ (0, g.jsxs)("div", {
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
				p ? "center-play--ante-in" : "",
				b ? "center-play--settle" : "",
				x ? "center-play--carry" : "",
				A ? "center-play--trick-resolving" : ""
			].filter(Boolean).join(" "),
			"data-trick-phase": u,
			"data-trick-cards": j,
			"data-hand-settling": b ? "true" : "false",
			children: [
				p && /* @__PURE__ */ (0, g.jsx)("div", {
					className: "bpot__ante-chips",
					"aria-hidden": "true",
					children: Array.from({ length: Math.min(t, 8) }, (e, t) => /* @__PURE__ */ (0, g.jsx)("span", {
						className: "bpot__ante-chip",
						style: { "--ante-i": t }
					}, t))
				}),
				h && v === "discard" && y > 0 && /* @__PURE__ */ (0, g.jsx)("div", {
					className: "center-play__discard",
					"aria-hidden": "true",
					children: Array.from({ length: y }, (e, t) => /* @__PURE__ */ (0, g.jsx)("span", {
						className: "center-play__discard-card",
						style: { "--discard-i": t }
					}, t))
				}),
				/* @__PURE__ */ (0, g.jsxs)("div", {
					className: "center-play__phase",
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, g.jsx)("span", {
							className: `bpot__phase-tag bpot__phase-tag--${i ?? "waiting"}`,
							children: E
						}),
						D && r && /* @__PURE__ */ (0, g.jsx)("span", {
							className: "center-play__trump-suit muted small",
							children: ls(r)
						}),
						O && /* @__PURE__ */ (0, g.jsxs)("span", {
							className: "center-play__trump-suit center-play__trump-suit--reminder muted small",
							children: [ls(r), " trump"]
						})
					]
				}),
				/* @__PURE__ */ (0, g.jsx)("div", {
					className: "center-play__trick-stage",
					children: /* @__PURE__ */ (0, g.jsx)(cl, {
						displayPlays: s,
						winnerPlayerId: c,
						showWinnerTag: l,
						presentationPhase: u,
						playerNames: f
					})
				}),
				/* @__PURE__ */ (0, g.jsxs)("dl", {
					className: "center-play__stats",
					children: [
						/* @__PURE__ */ (0, g.jsxs)("div", {
							className: `bpot__stat bpot__stat--pot${S > 0 ? " bpot__stat--tick" : ""}`,
							"data-testid": "pot-display",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Pot" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: X(e.currentPot) })]
						}, S > 0 ? `pot-${S}` : "pot-static"),
						/* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat",
							"data-testid": "ante-display",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Ante" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: Xc(e.anteAmount) })]
						}),
						e.limEnabled && /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [/* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Cap" }), /* @__PURE__ */ (0, g.jsxs)("dd", { children: [X(e.potCap), /* @__PURE__ */ (0, g.jsx)("span", {
								className: "bpot__lim-tag",
								children: "LmT"
							})] })]
						}), /* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat bpot__stat--highlight",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Max win" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: X(e.maxWinThisHand) })]
						})] })
					]
				}),
				e.limEnabled && e.overflow > 0 && /* @__PURE__ */ (0, g.jsxs)("div", {
					className: "center-play__carry muted small",
					children: [
						"+",
						X(e.overflow),
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
function ul({ label: e, value: t, accent: n, title: r }) {
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
function dl({ player: e, compact: t = !1 }) {
	let n = e.apeScore != null && !e.isRobot;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: `bhud${t ? " bhud--compact" : ""}`,
		"aria-label": `${e.displayName} stats`,
		children: [n && /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
			/* @__PURE__ */ (0, g.jsx)(ul, {
				label: "Ape",
				value: e.apeScore ?? 0,
				accent: !0,
				title: "Ape Score"
			}),
			e.apeClass && /* @__PURE__ */ (0, g.jsx)(ul, {
				label: "Class",
				value: e.apeClass,
				title: "Ape Class"
			}),
			e.apeStatus && /* @__PURE__ */ (0, g.jsx)(ul, {
				label: "Status",
				value: e.apeStatus,
				title: "Ape Status"
			})
		] }), e.sessionStreak != null && e.sessionStreak > 0 && /* @__PURE__ */ (0, g.jsx)(ul, {
			label: "Streak",
			value: e.sessionStreak,
			title: "Hands won this session"
		})]
	});
}
//#endregion
//#region src/table/Seat.tsx
function fl({ fraction: e }) {
	let t = Math.max(0, Math.min(1, e)), n = 53 / 2, r = 2 * Math.PI * n, i = r * (1 - t);
	return /* @__PURE__ */ (0, g.jsxs)("svg", {
		className: `bseat__timer-ring${t <= .25 ? " bseat__timer-ring--urgent" : ""}`,
		width: 56,
		height: 56,
		viewBox: "0 0 56 56",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, g.jsx)("circle", {
			className: "bseat__timer-ring__track",
			cx: 56 / 2,
			cy: 56 / 2,
			r: n,
			fill: "none",
			strokeWidth: 3
		}), /* @__PURE__ */ (0, g.jsx)("circle", {
			className: "bseat__timer-ring__progress",
			cx: 56 / 2,
			cy: 56 / 2,
			r: n,
			fill: "none",
			strokeWidth: 3,
			strokeDasharray: r,
			strokeDashoffset: i,
			transform: `rotate(-90 ${56 / 2} ${56 / 2})`
		})]
	});
}
function pl({ player: e, region: t, handLane: n = "below", style: r, onToggleInHand: i, onPassEnrollment: a, onTrickDelta: o, onReaction: s }) {
	let [c, u] = (0, l.useState)(!1), d = (0, l.useCallback)(() => {
		u((e) => !e);
	}, []), f = e.tricksThisHand, p = Math.max(0, e.holeCardCount ?? 0), m = !!(e.showHoleCards && !e.isSelf && e.inHand && p > 0), h = e.bankroll != null, v = e.bourreAlert === "pulse", y = e.bourreAlert === "marker" || e.bourreAlert === "pulse", b = !!e.bourrePressure, x = b && e.isSelf, S = e.revealedTrumpIndex != null && e.revealedTrumpUpcard;
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
			e.enrollmentOnClock ? "bseat--enroll-clock" : "",
			e.enrollmentSatOut ? "bseat--sat-out" : "",
			e.isOut ? "bseat--out" : "",
			e.isDealer ? "bseat--dealer" : "",
			e.trumpMerging ? "bseat--trump-merge" : "",
			e.isOnTurn ? "bseat--on-turn" : "",
			e.turnHandoff ? "bseat--turn-handoff" : "",
			e.isTrickCapture ? "bseat--trick-capture" : "",
			e.winnerFlash ? "bseat--winner-flash" : "",
			e.enrollmentPulse === "join" ? "bseat--enroll-join" : "",
			e.enrollmentPulse === "pass" ? "bseat--enroll-pass" : "",
			e.drawAnimSubPhase === "discard" ? "bseat--draw-discard" : "",
			e.drawAnimSubPhase === "receive" ? "bseat--draw-receive" : "",
			v ? "bseat--bourre-pulse" : "",
			y ? "bseat--bourre" : "",
			b ? "bseat--bourre-pressure" : "",
			x ? "bseat--bourre-pressure-self" : "",
			e.bankrollTick === "up" ? "bseat--bankroll-up" : "",
			e.bankrollTick === "down" ? "bseat--bankroll-down" : "",
			S ? "bseat--trump-reveal" : "",
			e.seatTrumpMergeActive ? "bseat--trump-merge" : "",
			c ? "bseat--meta-open" : ""
		].filter(Boolean).join(" "),
		style: r,
		children: [/* @__PURE__ */ (0, g.jsxs)("div", {
			className: "bseat__core",
			children: [m && /* @__PURE__ */ (0, g.jsx)("div", {
				className: "bseat__hole-cards",
				"aria-label": `${p} cards in hand`,
				"data-trick-play-origin": e.playerId,
				children: Array.from({ length: p }, (t, n) => {
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
			}), /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "bseat__avatar-stage",
				children: [
					/* @__PURE__ */ (0, g.jsxs)("div", {
						className: "bseat__avatar-stack",
						"data-trick-play-origin": !e.isSelf && e.inHand && !m ? e.playerId : void 0,
						children: [
							e.enrollmentOnClock && e.enrollmentTimeLeft != null && /* @__PURE__ */ (0, g.jsx)(fl, { fraction: e.enrollmentTimeLeft }),
							b && /* @__PURE__ */ (0, g.jsx)("span", {
								className: "bseat__bourre-pressure-badge",
								"aria-label": x ? "You need this trick to avoid bourré" : "At risk of bourré",
								title: x ? "Win this trick or go bourré" : "Must win this trick",
								children: x ? "Bourré risk!" : "0 tricks"
							}),
							y && !b && /* @__PURE__ */ (0, g.jsx)("span", {
								className: "bseat__bourre-badge",
								"aria-label": "Bourré",
								title: "Bourré",
								children: "Bourré"
							}),
							/* @__PURE__ */ (0, g.jsxs)("div", {
								className: `bseat__avatar-wrap${c ? " bseat__avatar-wrap--peek" : ""}`,
								role: "button",
								tabIndex: 0,
								"aria-label": `${e.displayName} seat`,
								"aria-expanded": c,
								onClick: (e) => {
									e.stopPropagation(), d();
								},
								onKeyDown: (e) => {
									(e.key === "Enter" || e.key === " ") && (e.preventDefault(), d());
								},
								onBlur: () => u(!1),
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
										className: "bseat__avatar bseat__avatar--initials",
										"aria-hidden": "true",
										children: el(e.displayName)
									}),
									e.inHand && /* @__PURE__ */ (0, g.jsx)("span", {
										className: "bseat__in-badge",
										title: "In this hand"
									}),
									b && /* @__PURE__ */ (0, g.jsx)("span", {
										className: "bseat__bourre-pressure-ring",
										"aria-hidden": "true"
									}),
									v && !b && /* @__PURE__ */ (0, g.jsx)("span", {
										className: "bseat__bourre-ring",
										"aria-hidden": "true"
									})
								]
							})
						]
					}),
					h && /* @__PURE__ */ (0, g.jsx)("span", {
						className: `bseat__stack${e.isOut ? " bseat__stack--out" : ""}`,
						"aria-label": `Chips ${Qc(e.bankroll ?? 0)}`,
						title: `Chips ${Qc(e.bankroll ?? 0)}`,
						children: Qc(e.bankroll ?? 0)
					}),
					e.isSelf && s && /* @__PURE__ */ (0, g.jsx)("div", {
						className: "bseat__react-bar",
						children: [
							"👏",
							"😮",
							"🔥"
						].map((e) => /* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "bseat__react-btn",
							"aria-label": `React ${e}`,
							onClick: () => s(e),
							children: e
						}, e))
					})
				]
			})]
		}), /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "bseat__aux",
			children: [
				/* @__PURE__ */ (0, g.jsxs)("div", {
					className: "bseat__meta",
					"data-testid": "seat-meta-panel",
					"aria-hidden": !c,
					children: [/* @__PURE__ */ (0, g.jsxs)("div", {
						className: "bseat__info",
						children: [
							/* @__PURE__ */ (0, g.jsx)("span", {
								className: "bseat__name",
								children: e.displayName
							}),
							e.isRobot && /* @__PURE__ */ (0, g.jsx)("span", {
								className: "bseat__robot-tag muted small",
								children: "Bot"
							}),
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
					}), /* @__PURE__ */ (0, g.jsx)(dl, {
						player: e,
						compact: t === "left" || t === "right"
					})]
				}),
				e.enrollmentOnClock && /* @__PURE__ */ (0, g.jsx)("span", {
					className: "bseat__enroll-timer",
					"aria-live": "polite",
					children: e.isSelf ? `Tap I'm in · ${e.enrollmentSecondsOnClock ?? "?"}s` : `${e.enrollmentSecondsOnClock ?? "?"}s`
				}),
				e.canToggleInHand && /* @__PURE__ */ (0, g.jsx)("button", {
					type: "button",
					className: "bseat__opt-in btn btn--sm",
					"data-testid": "seat-opt-in",
					onClick: i,
					children: e.decisionPlannedDiscards != null && e.enrollmentJoined ? `Playing · ${e.decisionPlannedDiscards}` : e.canPassEnrollment ? "Play" : "I’m in"
				}),
				e.canPassEnrollment && a && /* @__PURE__ */ (0, g.jsx)("button", {
					type: "button",
					className: "bseat__pass btn btn--sm btn--ghost",
					"data-testid": "seat-pass-enrollment",
					onClick: a,
					children: "Pass"
				}),
				e.canEditTricks && /* @__PURE__ */ (0, g.jsx)("div", {
					className: "bseat__controls",
					children: /* @__PURE__ */ (0, g.jsx)("button", {
						type: "button",
						className: "bseat__trick-btn bseat__trick-btn--plus",
						"aria-label": "Won a trick",
						disabled: f >= 5,
						onClick: () => o(1),
						children: "+"
					})
				})
			]
		})]
	});
}
//#endregion
//#region src/game/playerOrder.ts
function ml(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
//#endregion
//#region src/table/layout/seatOrder.ts
function hl(e, t) {
	let n = [...new Set(e.filter(Boolean))];
	if (!n.length) return [];
	let r = t.handEnrollment?.orderedPlayerIds?.filter((e) => n.includes(e));
	if (r?.length === n.length) return r;
	let i = ml(t.dealerId, n), a = n.filter((e) => !i.includes(e));
	return a.length ? [...i, ...a] : i;
}
function gl(e, t, n) {
	let r = new Map(e.map((e) => [e.playerId, e])), i = hl(e.map((e) => e.playerId), t);
	if (!i.length) return e;
	let a = n ?? e.find((e) => e.isSelf)?.playerId ?? null, o = a ? i.indexOf(a) : 0;
	return (o > 0 ? [...i.slice(o), ...i.slice(0, o)] : i).map((e) => r.get(e)).filter((e) => e != null);
}
//#endregion
//#region src/table/layout/seatLayout.ts
var _l = {
	min: 8,
	max: 92
}, vl = 56, yl = 54;
function bl(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function xl(e, t) {
	return t.isSelf || t.isMobile ? "below" : t.total >= 6 && e.region === "left" && e.x < 14 || t.total >= 6 && e.region === "right" && e.x > 86 ? "side" : "below";
}
function Sl(e, t) {
	let n = bl(e.x, _l.min, _l.max), r = t === "portrait" ? vl : yl, i = bl(e.y, 8, r);
	return {
		...e,
		x: n,
		y: i
	};
}
function Cl(e, t, n) {
	let r = al(e, t), i = n.isMobile && n.orientation ? Sl(r, n.orientation) : r;
	return {
		...i,
		seatIndex: e,
		handLane: xl(i, {
			isMobile: n.isMobile,
			isSelf: n.isSelf,
			total: t
		})
	};
}
function wl(e, t, n) {
	return Cl(e + 1, t, {
		isMobile: !0,
		isSelf: !1,
		orientation: n
	});
}
function Tl(e) {
	let t = al(0, Math.max(2, e));
	return {
		x: t.x,
		y: Math.min(t.y, 88),
		region: "bottom",
		seatIndex: 0,
		handLane: "below"
	};
}
//#endregion
//#region src/game/trick.ts
function El(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => D(e.card, n));
	if (r.length) return r.reduce((e, t) => E(t.card) > E(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => E(t.card) > E(e.card) ? t : e).playerId;
}
var Dl = 1600, Ol = 1800;
function kl(e) {
	return e !== "live";
}
function Al(e = !1) {
	let t = e ? .55 : 1;
	return {
		cardLandMs: Math.round(560 * t),
		postTrickReadMs: Math.round(Dl * t),
		winnerRevealMs: Math.round(400 * t),
		trickSweepMs: Math.round(520 * t),
		nextLeadGapMs: Math.round(200 * t),
		trumpBeatReadMs: Math.round(Ol * t)
	};
}
function jl(e) {
	let t = Al(e.reducedMotion), n = e.trumpBeat ? t.trumpBeatReadMs : t.postTrickReadMs, r = Math.min(t.winnerRevealMs, n - 200), i = Math.max(200, n - r), a = t.trickSweepMs, o = t.nextLeadGapMs;
	return {
		readBeforeWinnerMs: i,
		winnerRevealMs: r,
		readTotalMs: n,
		sweepMs: a,
		nextLeadGapMs: o,
		pipelineMs: n + a + o
	};
}
function Ml(e, t, n) {
	for (let r of n) if ((t[r] ?? 0) > (e[r] ?? 0)) return r;
	return null;
}
function Nl(e) {
	return e?.plays?.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
}
function Pl(e) {
	let t = Nl(e.prevTrick), n = e.playedCards?.filter((t) => t.trickNumber === e.trickNumber).map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
	return n.length > t.length ? n : t;
}
function Fl(e, t, n) {
	if (!e.length || !t || !n || t === n) return !1;
	let r = El(e.map((e) => ({
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
function Z(e) {
	let { prevTricks: t, nextTricks: n, participantIds: r, prevTrick: i, playedCards: a } = e, o = Gc(t, r), s = Gc(n, r);
	if (s <= o) return null;
	let c = Ml(t, n, r), l = i?.trickNumber ?? s, u = Pl({
		prevTrick: i,
		playedCards: a,
		trickNumber: l
	});
	return !c || !u.length ? null : {
		trickNumber: l,
		leadSuit: i?.leadSuit ?? null,
		plays: u,
		winnerId: c
	};
}
function Q() {
	return typeof window > "u" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
var Il = 5e3, Ll = 1e3, Rl = 12e3;
function zl(e = Q()) {
	let t = e ? .55 : 1, n = (e) => Math.max(80, Math.round(e * t));
	return {
		anteChipTravelMs: n(220),
		dealCardStaggerMs: n(110),
		dealFanMs: n(600),
		trumpRevealHoldMs: n(Il),
		trumpMergeAnimMs: n(0),
		enrollmentSeatPulseMs: n(480),
		drawDiscardMs: n(580),
		drawReplaceMs: n(620),
		drawReadyBeatMs: n(500),
		settleHoldMs: n(Ll),
		nextHandResetMs: n(550),
		handResetMs: n(500)
	};
}
function Bl(e, t, n = Q()) {
	let r = zl(n), i = Math.max(0, e), a = Math.max(0, t);
	return i === 0 && a === 0 ? Math.max(120, Math.round(r.drawDiscardMs * .6)) : i * r.drawDiscardMs + a * r.drawReplaceMs + 80;
}
function Vl(e, t, n) {
	let r = Number.isFinite(e) && e > 0 ? e : 0, i = r > 0 ? Math.max(t, r) : t;
	return {
		height: Math.max(i > 0 ? i : n, n),
		peak: i
	};
}
function Hl(e, t, n, r) {
	let i = Vl(e, t, n), a = Math.max(152, n);
	return {
		height: i.peak > 0 ? Math.min(i.height, r) : Math.min(a, r),
		peak: i.peak
	};
}
function Ul(e, t) {
	let n = Math.max(.75, e);
	return t.portrait ? Math.min(n, .98) : Math.min(n, 1.32);
}
function Wl(e) {
	let t = Math.max(2, Math.min(8, e || 4));
	return t <= 3 ? .7 : t <= 4 ? .68 : t <= 5 ? .62 : .56;
}
function Gl(e) {
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
function Kl(e) {
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
function ql(e) {
	return {
		left: e.left,
		top: e.top,
		right: e.right,
		bottom: e.bottom,
		width: e.width,
		height: e.height
	};
}
function Jl(e, t, n = 2) {
	return e.left >= t.left - n && e.top >= t.top - n && e.right <= t.right + n && e.bottom <= t.bottom + n;
}
//#endregion
//#region src/table/useMobileTable.ts
var Yl = "(max-width: 900px), ((hover: none) and (pointer: coarse))";
function Xl() {
	let [e, t] = (0, l.useState)(() => typeof window < "u" && window.matchMedia("(max-width: 900px), ((hover: none) and (pointer: coarse))").matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Yl), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/table/hooks/useStageFit.ts
function Zl(e, t) {
	if (typeof window > "u") return t;
	let n = document.documentElement, r = getComputedStyle(n).getPropertyValue(e).trim(), i = parseFloat(r);
	return Number.isFinite(i) ? i : t;
}
function Ql(e, t) {
	let n = e.closest(".btable-session");
	if (!n) return 0;
	let r = n.querySelector(".btable-desktop");
	if (r) {
		let e = n.getBoundingClientRect(), i = r.getBoundingClientRect(), a = t ? 4 : 0;
		return Math.max(0, e.height - i.height) + a;
	}
	let i = 0, a = n.querySelector(".btable-session__head"), o = n.querySelector(".btable-session__foot"), s = n.querySelector(".btable-session__settle"), c = n.querySelector(".btable-session__feedback");
	return c && c.offsetParent !== null && (i += c.getBoundingClientRect().height), a && (i += a.getBoundingClientRect().height), o && o.offsetParent !== null && (i += o.getBoundingClientRect().height), s && s.offsetParent !== null && (i += s.getBoundingClientRect().height), t && (i += 4), i;
}
function $l(e) {
	let t = e.closest(".btable-session")?.querySelector(".btable-desktop");
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return n.width <= 0 || n.height <= 0 ? null : {
		width: n.width,
		height: n.height
	};
}
function eu(e, t) {
	let n = !!e.closest(".table-play-overlay");
	if (t && n) {
		let t = e.closest(".table-play-overlay__main");
		if (t) return t;
	}
	return e.closest(".btable-desktop__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function tu({ aspect: e, enabled: t = !0, sessionKey: n }) {
	let r = (0, l.useRef)(null), i = (0, l.useRef)(0), a = (0, l.useRef)(n), { settings: o } = Vc(), s = Xl();
	return (0, l.useLayoutEffect)(() => {
		if (!t || typeof window > "u") return;
		let c = r.current;
		if (!c) return;
		a.current !== n && (a.current = n, i.current = 0);
		let l = c.closest(".btable-desktop__viewport") ?? c.closest(".table-play-overlay__main") ?? c.closest(".btable-session"), u = window.visualViewport, d = () => {
			let t = !!c.closest(".table-play-overlay"), n = typeof window < "u" && window.matchMedia("(orientation: portrait)").matches, r = eu(c, s).getBoundingClientRect(), a = c.querySelector(".hand-panel")?.getBoundingClientRect(), l = t && s && n ? 100 : t && !s ? 120 : s ? 112 : 148, d = t && s && n || t && !s ? 200 : s ? 210 : 280, f = a?.height ?? 0, p = Hl(f, i.current, l, d);
			i.current = p.peak;
			let m = p.height, h = s && t ? 12 : s ? 18 : t && !s ? 16 : 28, g = Zl("--stage-fit-pad-x", s ? 8 : 16) + h, _ = Zl("--stage-fit-pad-y", s ? 6 : 12) + h, v = Zl("--stage-fit-gap", s ? 8 : 12), y = u, b = Math.min(r.width, y?.width ?? window.innerWidth), x = Math.min(r.height, y?.height ?? window.innerHeight);
			if (t && s) {
				let e = $l(c);
				if (e) b = e.width, x = e.height;
				else {
					let e = Ql(c, s);
					x = Math.max(160, x - e);
				}
			}
			let S = Math.max(.85, Math.min(1.35, o.tableScale || 1)), C = t && s ? 1 : S, w = s ? Ul(e, { portrait: n }) : e, T = parseInt(getComputedStyle(c).getPropertyValue("--player-count").trim(), 10) || 4, E = t && s && !n, D = E ? {
				...Gl({
					availWidth: b,
					availHeight: x,
					aspect: w,
					userScale: C,
					padX: g,
					padY: _,
					stageShare: Wl(T)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Kl({
				availWidth: b,
				availHeight: x,
				aspect: w,
				userScale: C,
				padX: g,
				padY: _,
				heroMinHeight: m,
				gap: v
			});
			c.classList.toggle("btable-wrap--landscape-row", E);
			let O = s || t, k = O ? D.displayStageWidth : D.stageWidth, A = O ? D.displayStageHeight : D.stageHeight;
			if (t && s) {
				let e = Math.max(0, b - g * 2), t = E ? Math.max(0, x - _ * 2) : Math.max(120, x - _ * 2 - m - v);
				k = Math.min(k * S, e), A = Math.min(A * S, t);
			}
			let j = t && !s ? S : s ? 1 : D.effectiveScale;
			if (c.style.setProperty("--stage-fit-width", `${Math.round(k)}px`), c.style.setProperty("--stage-fit-height", `${Math.round(A)}px`), c.style.setProperty("--stage-fit-scale", String(D.fitScale)), c.style.setProperty("--stage-effective-scale", String(j)), (c.closest(".btable-desktop__scale") ?? c.parentElement)?.style.setProperty("--stage-effective-scale", String(j)), localStorage.getItem("stageFitDebug") === "1") {
				let e = c.querySelector(".table-stage"), a = c.querySelectorAll(".bseat__avatar-wrap"), o = e ? ql(e.getBoundingClientRect()) : null, l = ql(document.documentElement.getBoundingClientRect()), u = [...a].filter((e) => !Jl(ql(e.getBoundingClientRect()), l, 1)).length;
				console.debug("[stage-fit]", {
					host: {
						w: r.width,
						h: r.height
					},
					hero: {
						measured: f,
						budget: m,
						peak: i.current
					},
					fit: D,
					stageBounds: o,
					seatOverflow: u,
					nativeMobile: s,
					inOverlay: t,
					portrait: n
				});
			}
		}, f = new ResizeObserver(d);
		f.observe(c);
		let p = c.querySelector(".hand-panel");
		p && f.observe(p), l instanceof HTMLElement && f.observe(l);
		let m = c.closest(".btable-session");
		if (m instanceof HTMLElement) {
			f.observe(m);
			let e = m.querySelector(".btable-desktop");
			e instanceof HTMLElement && f.observe(e);
			let t = m.querySelector(".btable-session__feedback");
			t instanceof HTMLElement && f.observe(t);
			let n = m.querySelector(".btable-session__head");
			n instanceof HTMLElement && f.observe(n);
		}
		let h = c.closest(".table-play-overlay__main");
		return h instanceof HTMLElement && f.observe(h), d(), window.addEventListener("orientationchange", d), u?.addEventListener("resize", d), u?.addEventListener("scroll", d), () => {
			f.disconnect(), window.removeEventListener("orientationchange", d), u?.removeEventListener("resize", d), u?.removeEventListener("scroll", d);
		};
	}, [
		e,
		t,
		s,
		n,
		o.tableScale
	]), r;
}
//#endregion
//#region src/table/trumpHolderPresentation.ts
function nu(e) {
	let t = e.trumpHolderId, n = !!e.trumpUpcard, { trumpRevealActive: r, trumpMergeActive: i, trumpMergedIntoHand: a } = e.handPresentation;
	return {
		trumpHolderId: t,
		hasTrumpOnTable: n,
		hideCenterTrump: n && !!t && (r || i || a && (e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play")),
		showRevealedTrumpAtHolder: n && (r || i),
		showTrumpSuitReminder: a && n && (e.phase === "decision" || e.phase === "draw" || e.phase === "play"),
		trumpMergeActive: i,
		trumpMergedIntoHand: a
	};
}
function ru(e) {
	return e <= 0 ? null : e - 1;
}
function iu(e, t, n, r, i) {
	if (i || !t.trumpHolderId || e !== t.trumpHolderId || r <= 0) return {
		revealedTrumpUpcard: null,
		revealedTrumpIndex: null,
		seatTrumpMergeActive: !1
	};
	let a = t.showRevealedTrumpAtHolder ? ru(r) : null;
	return {
		revealedTrumpUpcard: t.showRevealedTrumpAtHolder ? n : null,
		revealedTrumpIndex: a,
		seatTrumpMergeActive: t.trumpMergeActive
	};
}
//#endregion
//#region src/table/CardTable.tsx
function au({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: l = !1, showTrumpSuitReminder: u = !1, trumpHolderPresentation: d, privateHandReady: f = !1, currentUserId: p = null, legalPlayIndices: m, handComplete: h = !1, actionFeedback: _, trickPresentation: v, handPresentation: y, microinteractions: b, onToggleInHand: x, onPassEnrollment: S, onTrickDelta: C, onSubmitDraw: w, onPassDraw: T, onFoldDraw: E, onPlayCard: D, onReaction: O }) {
	let k = t.map((e) => ({
		...e,
		isSelf: e.isSelf || p != null && e.playerId === p
	})), A = gl(k, e, p), j = A.length, M = `btable--p${Math.min(8, Math.max(2, j))}`, N = ol(j), ee = Object.fromEntries(k.map((e) => [e.playerId, e.displayName])), te = zl(), P = tu({
		aspect: N,
		sessionKey: `${e.sessionId}:${e.handNumber}`
	}), F = new Set(e.participantIds.filter((t) => Jc(t, v.displayTricksByPlayer, e.participantIds, e.phase))), ne = k.map((t) => {
		let r = v.displayTricksByPlayer[t.playerId] ?? 0, i = v.trickWinnerSeatId === t.playerId, a = v.suppressTurnPlayerId || y.suppressTurnIndicator, o = v.phase === "collectTrick" && i, s = y.enrollmentPulse[t.playerId], c = y.animatingDrawPlayerId === t.playerId, l = iu(t.playerId, d, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: $c(t.bankroll, n.anteAmount, {
				inHand: t.inHand,
				anteAnimActive: y.anteAnimActive,
				anteAlreadyPosted: e.postedAntes != null && Object.prototype.hasOwnProperty.call(e.postedAntes, t.playerId)
			}),
			tricksThisHand: r,
			isOnTurn: a ? !1 : t.isOnTurn,
			isLeading: i && (v.phase === "winnerReveal" || v.phase === "collectTrick") ? !0 : a ? !1 : t.isLeading,
			isTrickCapture: o,
			enrollmentPulse: s,
			drawAnimSubPhase: c ? y.drawAnimSubPhase : null,
			drawDiscardCount: c ? y.drawDiscardCount : 0,
			drawReplaceCount: c ? y.drawReplaceCount : 0,
			turnHandoff: b.turnHandoffPlayerId === t.playerId,
			dealerMoved: b.dealerMovedPlayerId === t.playerId,
			winnerFlash: b.winnerFlashPlayerId === t.playerId,
			bankrollTick: b.bankrollTicks[t.playerId] ?? null,
			bourreAlert: t.isSelf ? b.bourreAlerts[t.playerId] ?? null : null,
			bourrePressure: F.has(t.playerId)
		};
	}), I = k.find((e) => e.isSelf), L = v.suppressTurnPlayerId || y.suppressTurnIndicator, re = !!(p && e.drawCompletedIds?.includes(p));
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: P,
		className: `btable-wrap btable-wrap--stage-fit ${M}`,
		"data-testid": "table-root",
		style: {
			"--player-count": j,
			"--table-aspect": N,
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": "520ms",
			"--trick-post-read-ms": `${Dl}ms`,
			"--trick-next-lead-gap-ms": "200ms",
			"--trick-final-pipeline-ms": `${Dl + 400 + 520 + 200}ms`,
			"--deal-card-stagger-ms": `${te.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${te.drawDiscardMs}ms`,
			"--draw-replace-ms": `${te.drawReplaceMs}ms`
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
								children: /* @__PURE__ */ (0, g.jsx)(ll, {
									potMetrics: {
										...n,
										currentPot: y.displayPotAmount
									},
									participantCount: r,
									trumpUpcard: e.trumpUpcard,
									trumpSuit: e.trumpSuit,
									phase: e.phase,
									enrollmentActive: i,
									remainingDeckCount: e.remainingDeckCount,
									trickDisplayPlays: v.displayPlays,
									trickWinnerPlayerId: v.winnerPlayerId,
									trickShowWinnerTag: v.showWinnerTag,
									trickPresentationPhase: v.phase,
									playerNames: ee,
									anteAnimActive: y.anteAnimActive,
									trumpRevealActive: y.trumpRevealActive,
									hideCenterTrump: l,
									showTrumpSuitReminder: u,
									drawAnimPlayerId: y.animatingDrawPlayerId,
									drawAnimSubPhase: y.drawAnimSubPhase,
									drawDiscardCount: y.drawDiscardCount,
									settleAnimActive: y.settleAnimActive,
									settleCarryOver: y.settleCarryOver,
									potTick: b.potTick,
									trumpReminderPulse: b.trumpReminderPulse
								})
							}),
							/* @__PURE__ */ (0, g.jsx)("div", {
								className: "btable__seats",
								"aria-label": "Players at the table",
								children: A.map((e, t) => {
									let n = Cl(t, A.length, {
										isMobile: !1,
										isSelf: e.isSelf
									}), r = ne.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, g.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										children: /* @__PURE__ */ (0, g.jsx)(pl, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											style: {
												left: `${n.x}%`,
												top: `${n.y}%`
											},
											onToggleInHand: () => x(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
											onPassEnrollment: e.canPassEnrollment && S ? () => S(e.playerId) : void 0,
											onTrickDelta: (t) => C(e.playerId, t),
											onReaction: e.isSelf ? O : void 0
										})
									}, e.playerId);
								})
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ (0, g.jsx)(Wc, {
			className: "hand-panel",
			cards: a,
			privateHandReady: f,
			phase: e.phase,
			enrollmentActive: i,
			isInHand: !!I?.inHand,
			isDealer: !!I?.isDealer,
			signedIn: !!p,
			isMyTurn: !!(p && e.turnPlayerId === p) && !L,
			dealStaggerMs: te.dealCardStaggerMs,
			drawAnimSubPhase: y.animatingDrawPlayerId === p ? y.drawAnimSubPhase : null,
			drawCompleted: re,
			maxDrawDiscards: e.maxDrawDiscards ?? 4,
			legalPlayIndices: m ?? void 0,
			handComplete: h,
			actionFeedback: _,
			onSubmitDraw: w,
			onPassDraw: T,
			onFoldDraw: E,
			onPlayCard: D,
			currentUserId: p,
			revealedTrumpIndex: o,
			trumpMergeActive: s,
			trumpDisabledIndex: c
		})]
	});
}
//#endregion
//#region src/table/layout/mobileSeatMap.ts
function ou(e, t) {
	let n = Math.max(1, Math.min(7, e || 1));
	return t === "portrait" ? n <= 1 ? .8 : n <= 2 ? .82 : n <= 3 ? .86 : n <= 4 ? .9 : .94 : n <= 1 ? 1.02 : n <= 2 ? .98 : n <= 3 ? 1.02 : n <= 5 ? 1.16 : 1.26;
}
//#endregion
//#region src/table/layout/useTableLayoutMode.ts
var su = "(orientation: portrait)";
function cu() {
	let e = Xl(), [t, n] = (0, l.useState)(() => typeof window < "u" && window.matchMedia(su).matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(su), t = () => n(e.matches);
		return t(), e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []), e ? t ? "mobile-portrait" : "mobile-landscape" : "desktop";
}
//#endregion
//#region src/table/hooks/useMobileStageFit.ts
function lu(e, t) {
	if (typeof window > "u") return t;
	let n = getComputedStyle(document.documentElement).getPropertyValue(e).trim(), r = parseFloat(n);
	return Number.isFinite(r) ? r : t;
}
function uu(e) {
	let t = e.closest(".btable-session");
	if (!t) return 0;
	let n = t.querySelector(".btable-mobile");
	if (!n) return 0;
	let r = t.getBoundingClientRect(), i = n.getBoundingClientRect();
	return Math.max(0, i.top - r.top) + Math.max(0, r.bottom - i.bottom);
}
function du(e) {
	return e.closest(".btable-mobile__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function fu({ aspect: e, sessionKey: t }) {
	let n = (0, l.useRef)(null), r = (0, l.useRef)(0), i = (0, l.useRef)(t), a = cu(), { settings: o } = Vc(), s = a === "mobile-portrait";
	return (0, l.useLayoutEffect)(() => {
		if (typeof window > "u") return;
		let a = n.current;
		if (!a) return;
		i.current !== t && (i.current = t, r.current = 0);
		let c = window.visualViewport, l = () => {
			let t = du(a).getBoundingClientRect(), n = a.querySelector(".btable-mobile-hero-dock")?.getBoundingClientRect(), i = !!a.closest(".table-play-overlay"), l = s ? 104 : 92, u = s ? 210 : 168, d = Hl(n?.height ?? 0, r.current, l, u);
			r.current = d.peak;
			let f = d.height, p = parseInt(getComputedStyle(a).getPropertyValue("--player-count").trim(), 10) || 4, m = p <= 4, h = !s, g = (h && m ? lu("--mobile-fit-pad-x", 4) : lu("--mobile-fit-pad-x", 8)) + (h && i ? 4 : 12), _ = (h && m ? lu("--mobile-fit-pad-y", 2) : lu("--mobile-fit-pad-y", 6)) + (h && i ? 4 : 10), v = lu("--mobile-fit-gap", s ? 8 : 6), y = c, b = Math.min(t.width, y?.width ?? window.innerWidth), x = Math.min(t.height, y?.height ?? window.innerHeight);
			if (i) {
				let e = uu(a);
				x = Math.max(140, x - e);
			}
			let S = Math.max(.85, Math.min(1.35, o.tableScale || 1)), C = h ? {
				...Gl({
					availWidth: b,
					availHeight: x,
					aspect: e,
					userScale: 1,
					padX: g,
					padY: _,
					stageShare: Wl(p)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Kl({
				availWidth: b,
				availHeight: x,
				aspect: e,
				userScale: 1,
				padX: g,
				padY: _,
				heroMinHeight: f,
				gap: v
			}), w = Math.max(0, b - g * 2), T = h ? Math.max(0, x - _ * 2) : Math.max(120, x - _ * 2 - f - v), E = Math.min(C.displayStageWidth * S, w), D = Math.min(C.displayStageHeight * S, T);
			a.classList.toggle("btable-mobile-wrap--landscape-row", h), a.classList.toggle("btable-mobile-wrap--low-count", m), a.dataset.layout = s ? "portrait" : "landscape", a.style.setProperty("--stage-fit-width", `${Math.round(E)}px`), a.style.setProperty("--stage-fit-height", `${Math.round(D)}px`), a.style.setProperty("--stage-fit-scale", String(C.fitScale)), a.style.setProperty("--stage-effective-scale", "1");
		}, u = new ResizeObserver(l);
		u.observe(a);
		let d = a.querySelector(".btable-mobile-hero-dock");
		d && u.observe(d);
		let f = du(a);
		f instanceof HTMLElement && u.observe(f);
		let p = a.closest(".btable-session");
		if (p instanceof HTMLElement) {
			u.observe(p);
			let e = p.querySelector(".btable-session__head");
			e instanceof HTMLElement && u.observe(e);
			let t = p.querySelector(".btable-session__feedback");
			t instanceof HTMLElement && u.observe(t);
		}
		return l(), window.addEventListener("orientationchange", l), c?.addEventListener("resize", l), c?.addEventListener("scroll", l), () => {
			u.disconnect(), window.removeEventListener("orientationchange", l), c?.removeEventListener("resize", l), c?.removeEventListener("scroll", l);
		};
	}, [
		e,
		a,
		s,
		t,
		o.tableScale
	]), n;
}
//#endregion
//#region src/table/MobileCardTable.tsx
function pu({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: l = !1, showTrumpSuitReminder: u = !1, trumpHolderPresentation: d, privateHandReady: f = !1, currentUserId: p = null, legalPlayIndices: m, handComplete: h = !1, actionFeedback: _, trickPresentation: v, handPresentation: y, microinteractions: b, onToggleInHand: x, onPassEnrollment: S, onTrickDelta: C, onSubmitDraw: w, onPassDraw: T, onFoldDraw: E, onPlayCard: D }) {
	let O = cu() === "mobile-landscape" ? "landscape" : "portrait", k = t.map((e) => ({
		...e,
		isSelf: e.isSelf || p != null && e.playerId === p
	})), A = gl(k, e, p), j = A.filter((e) => !e.isSelf), M = A.find((e) => e.isSelf), N = M ? Tl(A.length) : null, ee = A.length, te = `btable--p${Math.min(8, Math.max(2, ee))}`, P = ou(j.length, O), F = Object.fromEntries(t.map((e) => [e.playerId, e.displayName])), ne = zl(), I = fu({
		aspect: P,
		sessionKey: `${e.sessionId}:${e.handNumber}`
	}), L = new Set(e.participantIds.filter((t) => Jc(t, v.displayTricksByPlayer, e.participantIds, e.phase))), re = k.map((t) => {
		let r = v.displayTricksByPlayer[t.playerId] ?? 0, i = v.trickWinnerSeatId === t.playerId, a = v.suppressTurnPlayerId || y.suppressTurnIndicator, o = v.phase === "collectTrick" && i, s = y.enrollmentPulse[t.playerId], c = y.animatingDrawPlayerId === t.playerId, l = iu(t.playerId, d, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: $c(t.bankroll, n.anteAmount, {
				inHand: t.inHand,
				anteAnimActive: y.anteAnimActive,
				anteAlreadyPosted: e.postedAntes != null && Object.prototype.hasOwnProperty.call(e.postedAntes, t.playerId)
			}),
			tricksThisHand: r,
			isOnTurn: a ? !1 : t.isOnTurn,
			isLeading: i && (v.phase === "winnerReveal" || v.phase === "collectTrick") ? !0 : a ? !1 : t.isLeading,
			isTrickCapture: o,
			enrollmentPulse: s,
			drawAnimSubPhase: c ? y.drawAnimSubPhase : null,
			drawDiscardCount: c ? y.drawDiscardCount : 0,
			drawReplaceCount: c ? y.drawReplaceCount : 0,
			turnHandoff: b.turnHandoffPlayerId === t.playerId,
			dealerMoved: b.dealerMovedPlayerId === t.playerId,
			winnerFlash: b.winnerFlashPlayerId === t.playerId,
			bankrollTick: b.bankrollTicks[t.playerId] ?? null,
			bourreAlert: t.isSelf ? b.bourreAlerts[t.playerId] ?? null : null,
			bourrePressure: L.has(t.playerId)
		};
	}), R = k.find((e) => e.isSelf), z = v.suppressTurnPlayerId || y.suppressTurnIndicator, ie = !!(p && e.drawCompletedIds?.includes(p));
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: I,
		className: `btable-mobile-wrap btable-mobile-wrap--stage-fit ${te}`,
		"data-testid": "table-root",
		"data-layout": O,
		style: {
			"--player-count": ee,
			"--table-aspect": P,
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": "520ms",
			"--trick-post-read-ms": `${Dl}ms`,
			"--trick-next-lead-gap-ms": "200ms",
			"--trick-final-pipeline-ms": `${Dl + 400 + 520 + 200}ms`,
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
								children: /* @__PURE__ */ (0, g.jsx)(ll, {
									potMetrics: {
										...n,
										currentPot: y.displayPotAmount
									},
									participantCount: r,
									trumpUpcard: e.trumpUpcard,
									trumpSuit: e.trumpSuit,
									phase: e.phase,
									enrollmentActive: i,
									remainingDeckCount: e.remainingDeckCount,
									trickDisplayPlays: v.displayPlays,
									trickWinnerPlayerId: v.winnerPlayerId,
									trickShowWinnerTag: v.showWinnerTag,
									trickPresentationPhase: v.phase,
									playerNames: F,
									anteAnimActive: y.anteAnimActive,
									trumpRevealActive: y.trumpRevealActive,
									hideCenterTrump: l,
									showTrumpSuitReminder: u,
									drawAnimPlayerId: y.animatingDrawPlayerId,
									drawAnimSubPhase: y.drawAnimSubPhase,
									drawDiscardCount: y.drawDiscardCount,
									settleAnimActive: y.settleAnimActive,
									settleCarryOver: y.settleCarryOver,
									potTick: b.potTick,
									trumpReminderPulse: b.trumpReminderPulse
								})
							}),
							/* @__PURE__ */ (0, g.jsxs)("div", {
								className: "btable__seats btable-mobile__seats",
								"aria-label": "Players at the table",
								children: [j.map((e, t) => {
									let n = wl(t, A.length, O), r = re.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, g.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										children: /* @__PURE__ */ (0, g.jsx)(pl, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											style: {
												left: `${n.x}%`,
												top: `${n.y}%`
											},
											onToggleInHand: () => x(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
											onPassEnrollment: e.canPassEnrollment && S ? () => S(e.playerId) : void 0,
											onTrickDelta: (t) => C(e.playerId, t),
											onReaction: void 0
										})
									}, e.playerId);
								}), M && N && /* @__PURE__ */ (0, g.jsx)("div", {
									className: "btable__seat-slot btable__seat-slot--self",
									children: /* @__PURE__ */ (0, g.jsx)(pl, {
										player: re.find((e) => e.playerId === M.playerId) ?? M,
										region: N.region,
										handLane: N.handLane,
										style: {
											left: `${N.x}%`,
											top: `${N.y}%`
										},
										onToggleInHand: () => x(M.playerId, M.canToggleInHand ? !0 : !M.inHand),
										onPassEnrollment: M.canPassEnrollment && S ? () => S(M.playerId) : void 0,
										onTrickDelta: (e) => C(M.playerId, e),
										onReaction: void 0
									})
								}, M.playerId)]
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "btable-mobile-hero-dock hand-panel",
			children: [/* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-mobile-hero-dock__stack",
				children: /* @__PURE__ */ (0, g.jsx)(Wc, {
					cards: a,
					privateHandReady: f,
					phase: e.phase,
					enrollmentActive: i,
					isInHand: !!R?.inHand,
					isDealer: !!R?.isDealer,
					signedIn: !!p,
					isMyTurn: !!(p && e.turnPlayerId === p) && !z,
					dealStaggerMs: ne.dealCardStaggerMs,
					drawAnimSubPhase: y.animatingDrawPlayerId === p ? y.drawAnimSubPhase : null,
					drawCompleted: ie,
					maxDrawDiscards: e.maxDrawDiscards ?? 4,
					legalPlayIndices: m ?? void 0,
					handComplete: h,
					actionFeedback: _,
					onSubmitDraw: w,
					onPassDraw: T,
					onFoldDraw: E,
					onPlayCard: D,
					currentUserId: p,
					revealedTrumpIndex: o,
					trumpMergeActive: s,
					trumpDisabledIndex: c
				})
			}), i && !R?.inHand && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-mobile-hero-dock__hint muted small",
				children: "Tap I'm in above to join this hand"
			})]
		})]
	});
}
//#endregion
//#region src/table/CinematicSplash.tsx
var mu = new Set([
	"big-pot",
	"pot-cap",
	"hand-win"
]);
function hu({ events: e, onDismiss: t }) {
	let n = [...e].reverse().find((e) => mu.has(e.kind));
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
function gu({ children: e }) {
	let { settings: t } = Vc(), n = t.layoutMode === "tiled", r = Xl();
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
function _u({ children: e }) {
	let t = cu();
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
function vu({ events: e, onDismiss: t }) {
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
function yu({ compact: e = !1 }) {
	let [t, n] = (0, l.useState)(() => ac()), [r, i] = (0, l.useState)(!1);
	(0, l.useEffect)(() => cc(n), []);
	let a = Xs(), o = tc();
	function s(e) {
		oc({ soundEnabled: e });
	}
	function c(e) {
		oc({ hapticsMode: e });
	}
	let u = /* @__PURE__ */ (0, g.jsxs)("div", {
		className: `bfeedback-settings${e ? " bfeedback-settings--compact" : ""}`,
		children: [
			/* @__PURE__ */ (0, g.jsxs)("label", {
				className: "bfeedback-settings__row",
				children: [/* @__PURE__ */ (0, g.jsx)("span", {
					className: "bfeedback-settings__label",
					children: "Sound effects"
				}), /* @__PURE__ */ (0, g.jsx)("input", {
					type: "checkbox",
					checked: t.soundEnabled,
					disabled: !a,
					onChange: (e) => s(e.target.checked)
				})]
			}),
			!a && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "bfeedback-settings__note muted small",
				children: "Audio not supported in this browser."
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
							onChange: () => c("on")
						}), "On"]
					}),
					/* @__PURE__ */ (0, g.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, g.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "minimal",
							disabled: !o,
							onChange: () => c("minimal")
						}), "Minimal"]
					}),
					/* @__PURE__ */ (0, g.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, g.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "off",
							onChange: () => c("off")
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
			children: u
		})]
	}) : u;
}
//#endregion
//#region src/table/TableSettingsPanel.tsx
function bu({ open: e, onClose: t }) {
	let { settings: n, updateSettings: r, resetSettings: i } = Vc();
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
						children: Object.keys(Nc).map((e) => /* @__PURE__ */ (0, g.jsx)("option", {
							value: e,
							children: Nc[e]
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
var xu = 0;
function Su() {
	return xu += 1, `evt-${xu}-${Date.now()}`;
}
function Cu(e, t, n) {
	let r = t.currentPot, i = [];
	return r >= t.potCap && t.limEnabled && r > e.pot ? i.push({
		id: Su(),
		kind: "pot-cap",
		title: "Pot cap reached",
		subtitle: "LmT engaged",
		emoji: "🔒",
		durationMs: 2200
	}) : r >= t.anteAmount * Math.max(n.length, 2) * 2 && r > e.pot && i.push({
		id: Su(),
		kind: "big-pot",
		title: "Big pot brewing",
		emoji: "💰",
		durationMs: 2e3
	}), i;
}
function wu({ session: e, potMetrics: t, participantIds: n }) {
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
		let o = Cu(r, t, n);
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
				id: Su(),
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
function Tu(e) {
	return e === "handReset" || e === "ante" || e === "trumpReveal" || e === "trumpMerge" || e === "drawPlayer" || e === "drawReady" || e === "settle" || e === "nextHandReset";
}
function Eu(e) {
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
function Du(e) {
	return e.phase === "play" ? "play" : e.phase === "draw" ? "drawPlayer" : e.phase === "decision" ? "decision" : e.phase === "reveal" ? "ante" : e.enrollmentActive ? "enrollment" : "idle";
}
function Ou(e) {
	return {
		phase: Du(e),
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
		phaseStartedAt: Date.now()
	};
}
function ku(e, t, n = {}) {
	return {
		...e,
		...n,
		phase: t,
		phaseStartedAt: Date.now()
	};
}
function Au(e, t) {
	let n = {};
	for (let r of t.enrolledIds) e.enrolledIds.includes(r) || (n[r] = "join");
	for (let r of t.declinedIds) e.declinedIds.includes(r) || (n[r] = "pass");
	return n;
}
function ju(e, t) {
	for (let n of t.drawCompletedIds) if (!e.drawCompletedIds.includes(n)) return n;
	return null;
}
function Mu(e, t, n, r, i) {
	return ku(e, "drawPlayer", {
		animatingDrawPlayerId: n,
		drawAnimSubPhase: "discard",
		drawDiscardCount: r,
		drawReplaceCount: i,
		prevSnapshot: t
	});
}
function Nu(e) {
	if (!e.pendingHandSettle || e.phase !== "play") return e;
	let t = e.handSettleSnapshot ?? e.prevSnapshot;
	return t ? ku(e, "settle", {
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		settleAnimActive: !0,
		settleCarryOver: t.carryOverPot > 0,
		prevSnapshot: t,
		displayPotAmount: t.potAmount
	}) : e;
}
function Pu(e, t, n, r) {
	let i = ju({
		...t,
		drawCompletedIds: []
	}, t);
	return i ? Mu(e, t, i, n, r) : ku(e, "drawPlayer", {
		displayDrawCompletedIds: [],
		prevSnapshot: t
	});
}
function Fu(e, t) {
	switch (t.type) {
		case "reset": return Ou(t.snapshot);
		case "dealCardRevealed": return {
			...e,
			dealStaggerCount: Math.max(e.dealStaggerCount, t.count)
		};
		case "clearEnrollmentPulse": return Object.keys(e.enrollmentPulse).length ? {
			...e,
			enrollmentPulse: {}
		} : e;
		case "watchdog": return Date.now() - e.phaseStartedAt < 12e3 ? e : e.pendingHandSettle && e.phase === "play" ? Nu(e) : Iu({
			...e,
			pendingSnapshot: e.pendingSnapshot ?? e.prevSnapshot
		});
		case "tryBeginHandSettle": return Nu(e);
		case "advancePhase": return Iu(e);
		case "serverUpdate": {
			let { snapshot: n, heroDrawDiscardCount: r = 0, heroDrawReplaceCount: i = 0 } = t, a = e.prevSnapshot ?? n;
			if (e.sessionKey !== n.sessionKey) return Ou(n);
			if (n.phase === "play" && e.phase !== "play") return ku(e, "play", {
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
			if (Tu(e.phase) && e.phase !== "drawPlayer" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done") return {
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
			let o = Au(a, n), s = Object.keys(o).length > 0;
			if (n.enrollmentActive || n.phase === "decision") return {
				...e,
				phase: n.phase === "decision" ? "decision" : "enrollment",
				enrollmentPulse: s ? {
					...e.enrollmentPulse,
					...o
				} : e.enrollmentPulse,
				prevSnapshot: n,
				displayPotAmount: n.potAmount
			};
			if (n.phase === "reveal" && a.phase !== "reveal" && (e.phase === "idle" || e.phase === "nextHandReset" || e.phase === "enrollment")) return ku(e, "ante", {
				trumpRevealActive: !!n.trumpUpcard,
				anteAnimActive: !0,
				dealStaggerCount: Math.max(e.dealStaggerCount, n.participantIds.length),
				prevSnapshot: n,
				displayPotAmount: n.potAmount
			});
			if (n.phase === "draw" && a.enrollmentActive && !n.enrollmentActive && e.phase === "enrollment") {
				let t = !!n.trumpUpcard;
				return ku(e, t ? "trumpReveal" : "ante", {
					trumpRevealActive: t,
					anteAnimActive: !0,
					dealStaggerCount: Math.max(e.dealStaggerCount, n.participantIds.length),
					prevSnapshot: n,
					displayPotAmount: n.potAmount
				});
			}
			if (n.phase === "draw" && (e.phase === "decision" || a.phase === "decision")) return Pu(e, n, 0, 0);
			if (n.phase === "draw") {
				let t = ju(a, n);
				if (t && e.phase !== "drawReady") {
					let a = r > 0 || i > 0, o = a ? r : t === n.turnPlayerId ? 0 : 1;
					return Mu(e, n, t, o, a ? i : o);
				}
				if (n.drawCompletedIds.length === n.participantIds.length && n.participantIds.length > 0 && e.phase === "drawPlayer" && e.drawAnimSubPhase === "done") return ku(e, "drawReady", { prevSnapshot: n });
			}
			return {
				...e,
				prevSnapshot: n,
				displayPotAmount: n.potAmount,
				handNumber: n.handNumber,
				enrollmentPulse: s ? {
					...e.enrollmentPulse,
					...o
				} : e.enrollmentPulse
			};
		}
		default: return e;
	}
}
function Iu(e) {
	let t = e.pendingSnapshot ?? e.prevSnapshot;
	switch (e.phase) {
		case "handReset": return ku(e, "ante", {
			anteAnimActive: !0,
			pendingSnapshot: null
		});
		case "ante": return e.trumpRevealActive || t?.trumpUpcard ? ku(e, "trumpReveal", {
			trumpRevealActive: !0,
			anteAnimActive: !1,
			pendingSnapshot: null
		}) : t?.phase === "draw" ? Pu(e, t, 0, 0) : ku(e, "drawPlayer", {
			anteAnimActive: !1,
			pendingSnapshot: null
		});
		case "trumpReveal": return t?.phase === "draw" ? {
			...Pu(e, t, 0, 0),
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		} : ku(e, "drawPlayer", {
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		});
		case "trumpMerge": return t?.phase === "draw" ? {
			...Pu(e, t, 0, 0),
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0
		} : ku(e, "drawPlayer", {
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		});
		case "drawPlayer": {
			if (e.drawAnimSubPhase === "discard" && e.drawReplaceCount > 0) return {
				...e,
				drawAnimSubPhase: "receive"
			};
			let n = e.animatingDrawPlayerId, r = n ? [...e.displayDrawCompletedIds, n] : e.displayDrawCompletedIds, i = t ?? e.prevSnapshot;
			if (i && r.length >= i.participantIds.length) return ku(e, "drawReady", {
				displayDrawCompletedIds: r,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				pendingSnapshot: null
			});
			if (i) {
				({ ...i });
				let t = i.actionOrder.find((e) => i.participantIds.includes(e) && !r.includes(e));
				if (t && i.drawCompletedIds.includes(t)) return Mu(e, i, t, 1, 1);
			}
			return {
				...e,
				displayDrawCompletedIds: r,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done"
			};
		}
		case "drawReady": return ku(e, "play", { pendingSnapshot: null });
		case "settle": return ku(e, "nextHandReset", {
			settleAnimActive: !1,
			nextHandResetActive: !0,
			pendingSnapshot: null
		});
		case "nextHandReset": return t ? Ou(t) : ku(e, "idle", { nextHandResetActive: !1 });
		default: return e;
	}
}
function Lu(e) {
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
		isPresenting: Tu(e.phase)
	};
}
function Ru(e, t = !1) {
	let n = zl(t);
	switch (e.phase) {
		case "handReset": return n.handResetMs;
		case "ante": return n.anteChipTravelMs * Math.max(1, Math.min(e.dealStaggerCount, 8));
		case "trumpReveal": return n.trumpRevealHoldMs;
		case "trumpMerge": return n.trumpMergeAnimMs;
		case "drawPlayer": return Bl(e.drawAnimSubPhase === "receive" ? 0 : e.drawDiscardCount, e.drawAnimSubPhase === "receive" ? e.drawReplaceCount : 0, t);
		case "drawReady": return n.drawReadyBeatMs;
		case "settle": return n.settleHoldMs;
		case "nextHandReset": return n.nextHandResetMs;
		default: return 0;
	}
}
//#endregion
//#region src/table/hooks/useHandPresentation.ts
var zu = [], Bu = [];
function Vu(e, t) {
	let n = new Set(e), r = new Set(t);
	return {
		discardCount: [...n].filter((e) => !r.has(e)).length,
		replaceCount: [...r].filter((e) => !n.has(e)).length
	};
}
function Hu({ session: e, enrollmentActive: t, potAmount: n, handComplete: r, trickPipelineActive: i = !1, heroCards: a = Bu, enrolledIds: o = zu, declinedIds: s = zu, actionOrder: c }) {
	let u = (0, l.useMemo)(() => Eu({
		sessionId: e.sessionId,
		handNumber: e.handNumber,
		phase: e.phase,
		enrollmentActive: t,
		participantIds: e.participantIds,
		actionOrder: c ?? e.participantIds,
		drawCompletedIds: e.drawCompletedIds,
		turnPlayerId: e.turnPlayerId,
		trumpUpcard: e.trumpUpcard,
		dealerId: e.dealerId,
		handComplete: r,
		potAmount: n,
		carryOverPot: e.carryOverPot,
		enrolledIds: o,
		declinedIds: s
	}), [
		e,
		t,
		n,
		r,
		o,
		s,
		c
	]), [d, f] = (0, l.useReducer)(Fu, u, Ou), p = (0, l.useRef)([]), m = (0, l.useRef)([]), h = (0, l.useRef)(""), g = () => {
		for (let e of p.current) window.clearTimeout(e);
		p.current = [];
	}, _ = (e, t) => {
		let n = window.setTimeout(e, t);
		p.current.push(n);
	};
	return (0, l.useEffect)(() => () => g(), []), (0, l.useEffect)(() => {
		let e = a.map((e) => `${e.rank}-${e.suit}`), t = Vu(m.current, e);
		m.current = e, f({
			type: "serverUpdate",
			snapshot: u,
			heroDrawDiscardCount: t.discardCount,
			heroDrawReplaceCount: t.replaceCount
		});
	}, [u, a]), (0, l.useEffect)(() => {
		if (!Object.values(d.enrollmentPulse).some(Boolean)) return;
		let e = window.setTimeout(() => f({ type: "clearEnrollmentPulse" }), 480);
		return () => window.clearTimeout(e);
	}, [JSON.stringify(d.enrollmentPulse)]), (0, l.useEffect)(() => {
		let e = Q(), t = `${d.phase}:${d.animatingDrawPlayerId ?? ""}:${d.drawAnimSubPhase}:${d.phaseStartedAt}`;
		if (h.current === t) return;
		h.current = t, g();
		let n = Ru(d, e);
		n <= 0 || (_(() => f({ type: "advancePhase" }), n), _(() => f({ type: "watchdog" }), Rl));
	}, [
		d.phase,
		d.animatingDrawPlayerId,
		d.drawAnimSubPhase,
		d.phaseStartedAt
	]), (0, l.useEffect)(() => {
		if (e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play") {
			let e = a.length;
			e > 0 && f({
				type: "dealCardRevealed",
				count: e
			});
		}
	}, [a.length, e.phase]), (0, l.useEffect)(() => {
		i || f({ type: "tryBeginHandSettle" });
	}, [i]), Lu(d);
}
//#endregion
//#region src/table/hooks/useTableMicrointeractions.ts
function Uu(e) {
	let [t, n] = (0, l.useState)(Cs), r = (0, l.useRef)(null), i = (0, l.useRef)([]), a = () => {
		for (let e of i.current) window.clearTimeout(e);
		i.current = [];
	}, o = (e, t) => {
		let n = window.setTimeout(e, t);
		i.current.push(n);
	};
	(0, l.useEffect)(() => () => a(), []);
	let s = JSON.stringify(e.tricksByPlayer), c = JSON.stringify(e.bankrollByPlayer), u = JSON.stringify(e.bourrePlayerIds);
	return (0, l.useEffect)(() => {
		let t = Ts(r.current, e);
		if (r.current = ws(e), !(!t.turnHandoffPlayerId && !t.dealerMovedPlayerId && !t.potTick && Object.keys(t.trickBadgeIncrements).length === 0 && Object.keys(t.bankrollChanges).length === 0 && t.bourrePlayerIds.length === 0 && !t.trumpReminderPulse && !t.feedbackErrorPulse && !t.feedbackSuccessPulse && !t.winnerFlashPlayerId)) {
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
			}, Ss.turnHandoff), t.dealerMovedPlayerId && o(() => {
				n((e) => e.dealerMovedPlayerId === t.dealerMovedPlayerId ? {
					...e,
					dealerMovedPlayerId: null
				} : e);
			}, Ss.dealerMove), t.winnerFlashPlayerId && o(() => {
				n((e) => e.winnerFlashPlayerId === t.winnerFlashPlayerId ? {
					...e,
					winnerFlashPlayerId: null
				} : e);
			}, Ss.winnerFlash);
			for (let [e, r] of Object.entries(t.bankrollChanges)) o(() => {
				n((t) => {
					if (t.bankrollTicks[e] !== r) return t;
					let n = { ...t.bankrollTicks };
					return delete n[e], {
						...t,
						bankrollTicks: n
					};
				});
			}, Ss.bankrollTick);
			for (let e of t.bourrePlayerIds) o(() => {
				n((t) => t.bourreAlerts[e] === "pulse" ? {
					...t,
					bourreAlerts: {
						...t.bourreAlerts,
						[e]: "marker"
					}
				} : t);
			}, Ss.bourrePulse), o(() => {
				n((t) => {
					if (!t.bourreAlerts[e]) return t;
					let n = { ...t.bourreAlerts };
					return delete n[e], {
						...t,
						bourreAlerts: n
					};
				});
			}, Ss.bourreMarker);
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
function Wu({ active: e, displayName: t }) {
	let [n, r] = (0, l.useState)(!1), i = Q();
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
var Gu = 15e3, Ku = [
	6e3,
	5e3,
	4e3,
	3e3,
	2e3
];
function qu(e) {
	let [t, n] = (0, l.useState)("hidden"), [r, i] = (0, l.useState)(0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(null), c = (0, l.useRef)(0), u = (0, l.useRef)(e.actionRequired);
	u.current = e.actionRequired;
	let d = () => {
		a.current != null && (window.clearTimeout(a.current), a.current = null), o.current != null && (window.clearTimeout(o.current), o.current = null), s.current != null && (window.clearTimeout(s.current), s.current = null);
	}, f = () => {
		let e = c.current, t = e === 0 ? Gu : Ku[Math.min(e - 1, Ku.length - 1)];
		a.current = window.setTimeout(() => {
			a.current = null, u.current && (i(e), n("pop"), c.current = e + 1);
		}, t);
	};
	return (0, l.useEffect)(() => {
		if (d(), c.current = 0, !e.actionRequired) return n("hidden"), i(0), d;
		let t = window.setTimeout(() => {
			u.current && f();
		}, 0);
		return () => {
			window.clearTimeout(t), d();
		};
	}, [e.activityKey, e.actionRequired]), (0, l.useEffect)(() => {
		if (t !== "pop") return;
		let e = Q() ? 280 : 420;
		return o.current = window.setTimeout(() => {
			o.current = null, n("exit");
		}, 380 + e), () => {
			o.current != null && (window.clearTimeout(o.current), o.current = null);
		};
	}, [t, r]), (0, l.useEffect)(() => {
		if (t !== "exit") return;
		let e = Q() ? 240 : 620;
		return s.current = window.setTimeout(() => {
			s.current = null, n("hidden"), u.current && f();
		}, e), () => {
			s.current != null && (window.clearTimeout(s.current), s.current = null);
		};
	}, [t, e.actionRequired]), {
		phase: t,
		beat: r
	};
}
function Ju() {
	return Q();
}
//#endregion
//#region src/table/YourTurnAttention.tsx
function Yu({ actionRequired: e, activityKey: t }) {
	let { phase: n, beat: r } = qu({
		actionRequired: e,
		activityKey: t
	});
	if (n === "hidden") return null;
	let i = Ju(), a = Math.min(r, 5);
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
			children: "Your Turn!"
		})
	});
}
//#endregion
//#region src/table/localAction.ts
function Xu(e) {
	let t = e.currentUserId;
	if (!t || e.handComplete) return !1;
	let n = e.selfPlayer;
	if (!n || n.isOut || n.actionDeclared) return !1;
	if (e.enrollmentActive || e.session.phase === "decision") return !!(n.canToggleInHand || n.canPassEnrollment);
	if (e.session.phase === "reveal") return !1;
	if (e.session.phase === "draw") {
		let n = e.session.drawCompletedIds?.includes(t) ?? !1;
		return e.session.turnPlayerId === t && !e.suppressTurn && !n;
	}
	return e.session.phase === "play" ? e.session.turnPlayerId === t && !e.suppressTurn : !1;
}
function Zu(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off";
	return [
		e.session.phase ?? "",
		e.session.turnPlayerId ?? "",
		n,
		e.selfPlayer?.actionDeclared ? "declared" : "open",
		e.session.drawCompletedIds?.join(",") ?? "",
		e.suppressTurn ? "1" : "0",
		Xu(e) ? "act" : "wait"
	].join("|");
}
//#endregion
//#region src/table/trickPresentationMachine.ts
function Qu(e, t) {
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
		pendingResolution: null
	};
}
function $u(e, t) {
	return e.phase === "live" ? e : {
		...e,
		pendingServer: t
	};
}
function ed(e, t) {
	let n = Nl(t.currentTrick), r = Nl(e.prevTrick), i = e.phase === "live" && !e.pendingResolution && n.length < e.revealedCount && r.length >= e.revealedCount;
	return {
		...e,
		prevTricks: { ...t.tricksByPlayer },
		prevTrick: i ? e.prevTrick : t.currentTrick,
		displayTricksByPlayer: { ...t.tricksByPlayer },
		pendingServer: null,
		resolvedTricks: null
	};
}
function td(e, t, n, r) {
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
		}
	};
}
function nd(e, t) {
	switch (t.type) {
		case "reset":
		case "reinit": return Qu(t.type === "reinit" ? t.snapshot.tricksByPlayer : e.displayTricksByPlayer, t.type === "reinit" ? t.snapshot.currentTrick : null);
		case "revealNextCard": {
			if (e.phase !== "live") return e;
			let t = e.pendingResolution?.frozen.plays.length ?? Nl(e.prevTrick).length;
			return e.revealedCount >= t ? e : {
				...e,
				revealedCount: e.revealedCount + 1
			};
		}
		case "clampRevealedCount": return e.phase !== "live" || e.pendingResolution || e.revealedCount <= t.target ? e : {
			...e,
			revealedCount: t.target
		};
		case "commitTrickResolution": {
			let t = e.pendingResolution;
			return !t || e.phase !== "live" ? e : td({
				...e,
				pendingResolution: null
			}, t.frozen, t.snapshot.tricksByPlayer, t.snapshot.currentTrick);
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
				let t = e.pendingServer, n = Nl(t?.currentTrick).length;
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
					displayTricksByPlayer: t ? { ...t.tricksByPlayer } : e.displayTricksByPlayer
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
			if (e.phase !== "live") return $u(e, n);
			let i = Z({
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
			} : ed(e, n);
		}
		default: return e;
	}
}
function rd(e, t) {
	let n = Nl(t), r = e.pendingResolution?.frozen.plays ?? [], i = r.length > 0 ? r : n.length > 0 ? n : Nl(e.prevTrick), a = e.phase === "live" ? i.slice(0, Math.min(e.revealedCount, i.length)) : e.frozenTrick?.plays ?? [], o = e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null, s = e.showWinnerTag && (e.phase === "winnerReveal" || e.phase === "collectTrick");
	return {
		phase: e.phase,
		displayPlays: a,
		winnerPlayerId: o,
		showWinnerTag: s,
		displayTricksByPlayer: e.displayTricksByPlayer,
		suppressTurnPlayerId: kl(e.phase),
		trickWinnerSeatId: e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null,
		revealedCount: e.revealedCount,
		isResolving: e.phase !== "live",
		isPipelineActive: e.phase !== "live" || !!e.pendingResolution
	};
}
//#endregion
//#region src/table/hooks/useTrickPresentation.ts
function id({ phase: e, currentTrick: t, tricksByPlayer: n, participantIds: r, trumpSuit: i, playedCards: a }) {
	let [o, s] = (0, l.useReducer)(nd, n, (e) => Qu(e, t)), c = (0, l.useRef)([]), u = (0, l.useRef)(null), d = (0, l.useRef)(/* @__PURE__ */ new Set()), f = o.phase !== "live" || !!o.pendingResolution, p = e === "play", m = (e) => {
		for (let t of e) {
			let e = hs(t);
			d.current.has(e) || (d.current.add(e), vs(t.playerId, e));
		}
	}, h = () => {
		for (let e of c.current) window.clearTimeout(e);
		c.current = [];
	}, g = (e, t) => {
		let n = window.setTimeout(e, t);
		c.current.push(n);
	};
	(0, l.useEffect)(() => () => h(), []), (0, l.useEffect)(() => {
		if (!p && !f) {
			h(), u.current = null, d.current.clear(), xs(), s({
				type: "reinit",
				snapshot: {
					currentTrick: t,
					tricksByPlayer: n,
					playedCards: a
				}
			});
			return;
		}
		s({
			type: "serverUpdate",
			snapshot: {
				currentTrick: t,
				tricksByPlayer: n,
				playedCards: a
			},
			participantIds: r,
			trumpSuit: i,
			reducedMotion: Q()
		});
	}, [
		e,
		t,
		n,
		r,
		i,
		a,
		p,
		f
	]), (0, l.useLayoutEffect)(() => {
		if (!p && !f) return;
		let e = t?.plays ?? [];
		e.length > 0 && m(e);
		let n = o.pendingResolution?.frozen.plays ?? [];
		n.length > 0 && m(n);
	}, [
		p,
		f,
		t?.plays,
		o.pendingResolution?.frozen.plays
	]), (0, l.useEffect)(() => {
		if (!p && !f || o.phase !== "trickComplete" || !o.frozenTrick) return;
		let e = `${o.frozenTrick.trickNumber}:${o.frozenTrick.winnerId}:${o.frozenTrick.plays.length}`;
		if (u.current === e) return;
		u.current = e, h();
		let t = o.frozenTrick, n = jl({
			trumpBeat: Fl(t.plays, t.leadSuit, i),
			reducedMotion: Q()
		});
		g(() => s({ type: "advancePhase" }), n.readBeforeWinnerMs), g(() => s({ type: "advancePhase" }), n.readTotalMs), g(() => s({ type: "advancePhase" }), n.readTotalMs + n.sweepMs), g(() => s({ type: "advancePhase" }), n.pipelineMs);
	}, [
		p,
		f,
		o.phase,
		o.frozenTrick,
		i
	]), (0, l.useEffect)(() => {
		if (!p && !f || o.phase !== "live" || !o.pendingResolution) return;
		let e = o.pendingResolution.frozen.plays.length;
		if (o.revealedCount < e) return;
		let t = Q() ? 308 : 560, n = window.setTimeout(() => s({ type: "commitTrickResolution" }), t);
		return () => window.clearTimeout(n);
	}, [
		p,
		f,
		o.phase,
		o.pendingResolution,
		o.revealedCount
	]), (0, l.useEffect)(() => {
		o.phase === "live" && (u.current = null);
	}, [o.phase]);
	let _ = o.phase === "live" ? o.pendingResolution?.frozen.plays.length ?? t?.plays?.length ?? 0 : o.revealedCount;
	return (0, l.useEffect)(() => {
		if (!p && !f || o.phase !== "live" || o.revealedCount >= _) return;
		let e = Q() ? 308 : 560, t = window.setTimeout(() => s({ type: "revealNextCard" }), e);
		return () => window.clearTimeout(t);
	}, [
		p,
		f,
		o.phase,
		o.revealedCount,
		_
	]), (0, l.useEffect)(() => {
		!p && !f || o.phase !== "live" || o.pendingResolution || o.revealedCount <= _ || s({
			type: "clampRevealedCount",
			target: _
		});
	}, [
		p,
		f,
		o.phase,
		o.pendingResolution,
		_,
		o.revealedCount
	]), rd(o, t);
}
//#endregion
//#region src/table/settlementCopy.ts
function ad(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function od(e, t) {
	return e.map((e) => ad(e, t)).join(" & ");
}
function sd(e, t) {
	return Kc(e, t) ? t.filter((t) => (e[t] ?? 0) === 0) : [];
}
function cd(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: a = {} } = e, o = Yc(t, n), s = e.winnerIds?.length ? e.winnerIds : o.winnerIds, c = e.maxTricks ?? o.maxTricks, l = od(s, r), u = sd(t, n), d = od(u, r), f = X(i.maxWinThisHand), p = X(i.currentPot), m = i.carryIn > 0 ? X(i.carryIn) : null, h = `Pot this hand: ${p} (max win ${f})`;
	m && (h += ` — includes ${m} carried in`), i.limEnabled && i.overflow > 0 && (h += ` · LIM overflow ${X(i.overflow)} stays out of play`);
	let g = s.map((e) => {
		let n = t[e] ?? 0;
		return `${ad(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), _ = u.length > 0 ? `Bourré: ${d} took 0 tricks (extra penalty applies on settlement)` : null, v = e.splitSharePerWinner, y = v > 0 && s.length >= 2 ? `If all co-winners agree to split: ${X(i.maxWinThisHand)} → ${X(v)} each` : null, b = s.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, x = `If any co-winner declines: full pot ${p} carries to the next hand · non-winners ante up`, S = s.map((e) => {
		let t = a[e], n = ad(e, r);
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
function ld({ session: e, players: t, potMetrics: n, splitSharePerWinner: r, currentUserId: i, isCoWinner: a, onSettle: o }) {
	let s = cd({
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
						X(r),
						" each"
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/table/heroHandDisplay.ts
function ud(e) {
	return `${e.rank}-${e.suit}`;
}
function dd(e, t) {
	if (!t?.rank || !t?.suit) return null;
	let n = ud(t), r = e.findIndex((e) => ud(e) === n);
	return r >= 0 ? r : null;
}
function fd(e, t) {
	return [...e];
}
function pd(e, t) {
	return [...e].sort((e, t) => e - t);
}
function md(e) {
	let t = !!(e.playerId && e.trumpHolderId && e.playerId === e.trumpHolderId), n = !!e.trumpUpcard, r = t && n ? dd(e.rawHeroCards, e.trumpUpcard) : null, i = !n && !!e.trumpSuit && e.phase === "play";
	if (!t || !n || r === null) return {
		displayCards: e.effectiveHeroCards,
		revealedTrumpIndex: null,
		trumpMergeActive: !1,
		trumpMergedIntoHand: !1,
		hideCenterTrumpForHolder: !1,
		showTrumpSuitReminder: i,
		trumpDisabledIndex: null,
		indexMode: "effective"
	};
	let { trumpRevealActive: a, trumpMergeActive: o, trumpMergedIntoHand: s } = e.handPresentation, c = nu({
		trumpHolderId: e.trumpHolderId,
		trumpUpcard: e.trumpUpcard,
		trumpSuit: e.trumpSuit,
		phase: e.phase,
		handPresentation: e.handPresentation
	});
	return {
		displayCards: e.rawHeroCards.length > 0 ? e.rawHeroCards : e.effectiveHeroCards,
		revealedTrumpIndex: a || o ? r : null,
		trumpMergeActive: o,
		trumpMergedIntoHand: s,
		hideCenterTrumpForHolder: c.hideCenterTrump,
		showTrumpSuitReminder: c.showTrumpSuitReminder,
		trumpDisabledIndex: e.phase === "draw" && !a && !o ? null : r,
		indexMode: "display"
	};
}
//#endregion
//#region src/table/TableSessionView.tsx
var hd = [], gd = [], _d = [];
function vd({ session: e, players: t, potMetrics: n, mySessionNet: r, leaderLabel: i, showCoWinSettlement: a, splitSharePerWinner: o = 0, enrollmentActive: s = !1, enrollmentSecondsLeft: c = 0, currentUserId: u, heroCards: d = gd, rawHeroCards: f = gd, privateHandReady: p = !1, legalPlayIndices: m, recentBourreIds: h = _d, handComplete: _ = !1, actionFeedback: v, actions: y }) {
	let { settings: b } = Vc(), x = Xl(), [S, C] = (0, l.useState)(!1), w = e.participantIds.length, { events: T, dismissEvent: E, pushReaction: D } = wu({
		session: e,
		potMetrics: n,
		participantIds: e.participantIds
	}), O = u != null && (e.pendingCoWinSettlement?.winnerIds || []).includes(u), k = t.find((e) => e.isSelf && (e.canToggleInHand || e.canPassEnrollment)), A = id({
		phase: e.phase,
		currentTrick: e.currentTrick,
		tricksByPlayer: e.tricksByPlayer,
		participantIds: e.participantIds,
		trumpSuit: e.trumpSuit,
		playedCards: e.playedCards
	}), j = Hu({
		session: e,
		enrollmentActive: s,
		potAmount: n.currentPot,
		handComplete: _,
		trickPipelineActive: A.isPipelineActive,
		heroCards: d,
		enrolledIds: e.handEnrollment?.enrolledIds ?? hd,
		declinedIds: e.handEnrollment?.declinedIds ?? hd,
		actionOrder: e.handEnrollment?.orderedPlayerIds ?? e.participantIds
	}), M = us(e.phase), N = j.phase === "decision" && M, ee = !!k && (ds(e.phase) || fs(e.phase) && N), te = !!k && !ee && !M, P = (0, l.useMemo)(() => nu({
		trumpHolderId: e.trumpHolderId ?? e.dealerId,
		trumpUpcard: e.trumpUpcard ?? null,
		trumpSuit: e.trumpSuit ?? null,
		phase: e.phase ?? null,
		handPresentation: {
			trumpRevealActive: j.trumpRevealActive,
			trumpMergeActive: j.trumpMergeActive,
			trumpMergedIntoHand: j.trumpMergedIntoHand
		}
	}), [
		e.trumpHolderId,
		e.dealerId,
		e.trumpUpcard,
		e.trumpSuit,
		e.phase,
		j.trumpRevealActive,
		j.trumpMergeActive,
		j.trumpMergedIntoHand
	]), F = (0, l.useMemo)(() => md({
		rawHeroCards: f,
		effectiveHeroCards: d,
		playerId: u,
		trumpHolderId: e.trumpHolderId ?? e.dealerId,
		trumpUpcard: e.trumpUpcard ?? null,
		trumpSuit: e.trumpSuit ?? null,
		phase: e.phase ?? null,
		handPresentation: {
			trumpRevealActive: j.trumpRevealActive,
			trumpMergeActive: j.trumpMergeActive,
			trumpMergedIntoHand: j.trumpMergedIntoHand
		}
	}), [
		f,
		d,
		u,
		e.trumpHolderId,
		e.dealerId,
		e.trumpUpcard,
		e.trumpSuit,
		e.phase,
		j.trumpRevealActive,
		j.trumpMergeActive,
		j.trumpMergedIntoHand
	]), ne = F.displayCards, I = (0, l.useMemo)(() => !m?.length || F.indexMode === "effective" ? m : fd(m, F.trumpDisabledIndex), [
		m,
		F.indexMode,
		F.trumpDisabledIndex
	]), L = A.suppressTurnPlayerId || j.suppressTurnIndicator, re = cs(e.phase, s), R = L ? null : ps(e.turnPlayerId, t), z = t.find((e) => e.isSelf), ie = !!(u && e.turnPlayerId === u) && !L, ae = Xu({
		currentUserId: u,
		enrollmentActive: s,
		selfPlayer: z,
		session: e,
		suppressTurn: !!L,
		handComplete: _
	}), B = Zu({
		currentUserId: u,
		enrollmentActive: s,
		selfPlayer: z,
		session: e,
		suppressTurn: !!L,
		handComplete: _
	}), oe = P.showTrumpSuitReminder || !e.trumpUpcard && !!e.trumpSuit && e.phase === "play", V = (0, l.useMemo)(() => ({ ...A.displayTricksByPlayer }), [A.displayTricksByPlayer]), se = (0, l.useMemo)(() => Object.fromEntries(t.map((e) => [e.playerId, Math.max(0, Number(e.bankroll) || 0)])), [t]), ce = Uu({
		turnPlayerId: e.turnPlayerId ?? null,
		dealerId: e.dealerId,
		potAmount: j.displayPotAmount,
		tricksByPlayer: V,
		bankrollByPlayer: se,
		bourrePlayerIds: h ?? [],
		phase: e.phase ?? null,
		showTrumpSuitReminder: oe,
		suppressTurn: !!L,
		actionFeedbackStatus: v?.status ?? "idle",
		trickWinnerSeatId: A.trickWinnerSeatId,
		trickPhase: A.phase
	}), le = !!z?.playerId && (h ?? []).includes(z.playerId) && ce.bourreAlerts[z.playerId] === "pulse", ue = (0, l.useRef)(0), de = (0, l.useRef)(0);
	(0, l.useEffect)(() => {
		ce.feedbackErrorPulse > ue.current && Oc(), ue.current = ce.feedbackErrorPulse;
	}, [ce.feedbackErrorPulse]), (0, l.useEffect)(() => {
		ce.feedbackSuccessPulse > de.current && kc(), de.current = ce.feedbackSuccessPulse;
	}, [ce.feedbackSuccessPulse]);
	let fe = {
		currentPot: n.currentPot,
		maxWinThisHand: n.maxWinThisHand,
		limEnabled: n.limEnabled,
		overflow: n.overflow,
		carryIn: e.carryOverPot ?? 0
	}, pe = (0, l.useCallback)((e) => {
		D(e, u ?? void 0);
	}, [D, u]), me = (0, l.useMemo)(() => ({
		onToggleInHand: (e, n) => {
			t.find((t) => t.playerId === e)?.isSelf && y.onToggleInHand(n);
		},
		onPassEnrollment: (e) => {
			t.find((t) => t.playerId === e)?.isSelf && y.onPassEnrollment && y.onPassEnrollment();
		},
		onTrickDelta: (e, n) => {
			t.find((t) => t.playerId === e)?.isSelf && y.onTrickDelta(n);
		},
		onSubmitDraw: (e) => {
			if (!y.onSubmitDraw) return;
			let t = F.indexMode === "display" ? pd(e, F.trumpDisabledIndex) : e;
			return y.onSubmitDraw(t);
		},
		onPassDraw: y.onPassDraw,
		onFoldDraw: y.onFoldDraw,
		onPlayCard: (e) => {
			if (!y.onPlayCard) return;
			if (F.indexMode !== "display") return y.onPlayCard(e);
			let t = pd([e], F.trumpDisabledIndex)[0];
			if (t != null) return y.onPlayCard(t);
		},
		onReaction: pe
	}), [
		y,
		pe,
		t,
		F.indexMode,
		F.trumpDisabledIndex
	]), he = {
		session: e,
		players: t,
		potMetrics: n,
		participantCount: w,
		enrollmentActive: s,
		heroCards: ne,
		revealedTrumpIndex: F.revealedTrumpIndex,
		trumpMergeActive: F.trumpMergeActive,
		trumpDisabledIndex: F.trumpDisabledIndex,
		hideCenterTrump: P.hideCenterTrump,
		showTrumpSuitReminder: oe,
		trumpHolderPresentation: P,
		privateHandReady: p,
		currentUserId: u,
		legalPlayIndices: I,
		handComplete: _,
		actionFeedback: v,
		trickPresentation: A,
		handPresentation: j,
		microinteractions: ce,
		...me
	}, ge = /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
		/* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-session__attention-layer",
			"aria-live": "polite",
			children: /* @__PURE__ */ (0, g.jsx)(Yu, {
				actionRequired: ae,
				activityKey: B
			})
		}),
		/* @__PURE__ */ (0, g.jsx)(Wu, {
			active: le,
			displayName: z?.displayName
		}),
		/* @__PURE__ */ (0, g.jsx)(vu, {
			events: T,
			onDismiss: E
		}),
		/* @__PURE__ */ (0, g.jsx)(hu, {
			events: T,
			onDismiss: E
		}),
		x ? /* @__PURE__ */ (0, g.jsx)(pu, { ...he }) : /* @__PURE__ */ (0, g.jsx)(au, { ...he })
	] }), H = (0, l.useRef)(!1);
	return (0, l.useEffect)(() => {
		H.current = !1;
	}, [e.handNumber, e.sessionId]), (0, l.useEffect)(() => {
		e.phase === "reveal" && j.trumpMergedIntoHand && !H.current && y.onAdvanceReveal && (H.current = !0, y.onAdvanceReveal());
	}, [
		e.phase,
		e.handNumber,
		e.sessionId,
		j.trumpMergedIntoHand,
		y
	]), (0, l.useEffect)(() => {
		let e = (e) => {
			(e.key === b.hotkeys.toggleSettings || e.key === "," && e.metaKey) && C((e) => !e), e.key === b.hotkeys.focusTable && document.querySelector(".btable-wrap")?.scrollIntoView({
				block: "center",
				behavior: "smooth"
			});
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [b.hotkeys]), /* @__PURE__ */ (0, g.jsxs)("div", {
		className: [
			"btable-session",
			x ? "btable-session--native-mobile btable-session--mobile-layout" : "",
			S ? "btable-session--settings-open" : "",
			fs(e.phase) ? "btable-session--reveal-phase" : "",
			ds(e.phase) ? "btable-session--decision-phase" : ""
		].filter(Boolean).join(" "),
		"data-trick-resolving": A.isPipelineActive ? "true" : "false",
		"data-hand-settling": j.settleAnimActive ? "true" : "false",
		"data-hand-complete": _ ? "true" : "false",
		children: [
			v && v.status !== "idle" && /* @__PURE__ */ (0, g.jsx)("div", {
				className: [
					`btable-session__feedback btable-session__feedback--${v.status}`,
					v.status === "error" ? "btable-session__feedback--pulse-error" : "",
					v.status === "success" ? "btable-session__feedback--pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "feedback-banner",
				role: v.status === "error" ? "alert" : "status",
				"aria-live": "polite",
				children: v.message
			}, v.status === "error" ? `feedback-error-${ce.feedbackErrorPulse}` : v.status === "success" ? `feedback-success-${ce.feedbackSuccessPulse}` : `feedback-${v.status}`),
			/* @__PURE__ */ (0, g.jsxs)("header", {
				className: "btable-session__head",
				children: [
					/* @__PURE__ */ (0, g.jsxs)("div", {
						className: "btable-session__head-row",
						children: [
							/* @__PURE__ */ (0, g.jsxs)("h5", {
								className: "btable-session__title",
								children: ["Hand #", e.handNumber]
							}),
							/* @__PURE__ */ (0, g.jsx)("span", {
								className: `btable-session__phase-tag btable-session__phase-tag--${e.phase ?? "waiting"}`,
								children: re
							}),
							/* @__PURE__ */ (0, g.jsx)("button", {
								type: "button",
								className: "btable-session__gear btn btn--sm",
								"data-testid": "settings-button",
								onClick: () => C(!0),
								"aria-label": "Table appearance settings",
								title: `Settings (${b.hotkeys.toggleSettings})`,
								children: "⚙"
							})
						]
					}),
					/* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__status",
						children: i
					}),
					j.trumpRevealActive && e.phase === "draw" && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Trump revealed — settling into your hand"
					}),
					j.trumpMergeActive && e.phase === "draw" && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Trump joining your hand…"
					}),
					j.phase === "drawReady" && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Draw complete — first lead coming up"
					}),
					/* @__PURE__ */ (0, g.jsxs)("div", {
						className: "btable-session__turn-stack",
						"aria-live": "polite",
						children: [
							j.settleAnimActive && /* @__PURE__ */ (0, g.jsx)("p", {
								className: "btable-session__turn btable-session__turn--settle muted small",
								children: "Settling the pot…"
							}),
							/* @__PURE__ */ (0, g.jsx)("p", {
								className: "btable-session__turn btable-session__turn--trick-resolve muted small",
								children: "Trick won — cards collecting before the next lead"
							}),
							j.settleAnimActive && /* @__PURE__ */ (0, g.jsx)("p", {
								className: "btable-session__turn btable-session__turn--final-trick muted small",
								children: "Final trick — cards collecting before the pot settles"
							})
						]
					}),
					R && M && A.phase === "live" && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: R
					}),
					e.phase === "draw" && ie && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__hint muted small",
						children: "Select cards to discard (up to 5), then Draw — Stand pat — or I'm Out"
					}),
					e.phase === "play" && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__hint muted small",
						children: "Follow suit · trump when void · beat the trick when you can"
					}),
					fs(e.phase) && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__hint muted small",
						"aria-live": "polite",
						children: "Cards dealt — trump revealed. Review your hand…"
					}),
					ee && /* @__PURE__ */ (0, g.jsxs)("div", {
						className: "btable-session__decision-cta",
						"data-testid": "decision-panel",
						children: [/* @__PURE__ */ (0, g.jsxs)("button", {
							type: "button",
							className: "btn btn--sm btn--ghost btable-session__pass-btn",
							"data-testid": "pass-decision-button",
							onClick: () => y.onPassEnrollment?.(),
							children: [
								"Pass · ",
								c,
								"s"
							]
						}), /* @__PURE__ */ (0, g.jsxs)("button", {
							type: "button",
							className: "btn btn--primary btn--sm btable-session__enroll-btn",
							"data-testid": "decision-im-in-button",
							onClick: () => y.onToggleInHand?.(!0),
							children: [
								"I'm in · ",
								c,
								"s"
							]
						})]
					}),
					te && !ee && /* @__PURE__ */ (0, g.jsxs)("div", {
						className: "btable-session__enroll-cta",
						children: [/* @__PURE__ */ (0, g.jsxs)("button", {
							type: "button",
							className: "btn btn--primary btn--sm btable-session__enroll-btn",
							"data-testid": "join-button",
							onClick: () => y.onToggleInHand(!0),
							children: [
								"I'm in · ",
								c,
								"s"
							]
						}), y.onPassEnrollment && /* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--ghost btable-session__pass-btn",
							"data-testid": "pass-enrollment-button",
							onClick: () => y.onPassEnrollment?.(),
							children: "Pass"
						})]
					}),
					s && !te && !fs(e.phase) && /* @__PURE__ */ (0, g.jsxs)("p", {
						className: "btable-session__enroll muted small",
						children: [
							"Play or pass: ",
							c,
							"s each · clockwise from dealer"
						]
					})
				]
			}),
			!x && /* @__PURE__ */ (0, g.jsxs)("p", {
				className: "btable-session__rotate-hint",
				role: "note",
				children: [
					"Rotate your phone to ",
					/* @__PURE__ */ (0, g.jsx)("strong", { children: "landscape" }),
					" for the full table (up to 8 players)."
				]
			}),
			x ? /* @__PURE__ */ (0, g.jsx)(_u, { children: /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-stage",
				children: ge
			}) }) : /* @__PURE__ */ (0, g.jsx)(gu, { children: /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-stage",
				children: ge
			}) }),
			/* @__PURE__ */ (0, g.jsx)(bu, {
				open: S,
				onClose: () => C(!1)
			}),
			a && !e.isFinal && /* @__PURE__ */ (0, g.jsx)(ld, {
				session: e,
				players: t,
				potMetrics: fe,
				splitSharePerWinner: o,
				currentUserId: u,
				isCoWinner: O,
				onSettle: y.onSettle
			}),
			/* @__PURE__ */ (0, g.jsxs)("footer", {
				className: "btable-session__foot muted small",
				children: [/* @__PURE__ */ (0, g.jsx)(yu, { compact: !0 }), r == null ? /* @__PURE__ */ (0, g.jsx)(g.Fragment, { children: "Shared pot and game state only · sign in to track your ledger" }) : /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: ["Your session net ", Zc(r)] })]
			})
		]
	});
}
//#endregion
//#region src/table/mount.tsx
var $ = null, yd = null;
function bd(e, t) {
	wc(), Ho(e), yd !== e && ($?.unmount(), $ = (0, u.createRoot)(e), yd = e), $.render(/* @__PURE__ */ (0, g.jsx)(Bc, { children: /* @__PURE__ */ (0, g.jsx)(vd, { ...t }) }));
}
function xd() {
	$?.unmount(), $ = null, yd = null;
}
//#endregion
export { ac as getFeedbackPrefs, wc as initGameFeedback, bd as mountTableSession, Dc as playBigWinFeedback, Tc as playShuffleFeedback, Ec as playTrickWinFeedback, oc as saveFeedbackPrefs, cc as subscribeFeedbackPrefs, xd as unmountTableSession };
