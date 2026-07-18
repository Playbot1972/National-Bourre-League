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
	function P(e) {
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
	var F = typeof reportError == "function" ? reportError : function(e) {
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
	}, I = {
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
	e.Activity = f, e.Children = I, e.Component = v, e.Fragment = r, e.Profiler = a, e.PureComponent = b, e.StrictMode = i, e.Suspense = l, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w, e.__COMPILER_RUNTIME = {
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
			_init: P
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
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(C, F);
		} catch (e) {
			F(e);
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
	var P = Array.isArray, F = r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, I = a.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, te = {
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
	var re = R(null), ie = R(null), V = R(null), ae = R(null);
	function oe(e, t) {
		switch (B(V, t), B(ie, e), B(re, null), t.nodeType) {
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
		z(re), B(re, e);
	}
	function H() {
		z(re), z(ie), z(V);
	}
	function se(e) {
		e.memoizedState !== null && B(ae, e);
		var t = re.current, n = Ud(t, e.type);
		t !== n && (B(ie, e), B(re, n));
	}
	function ce(e) {
		ie.current === e && (z(re), z(ie)), ae.current === e && (z(ae), $f._currentValue = te);
	}
	var le, U;
	function ue(e) {
		if (le === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			le = t && t[1] || "", U = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + le + e + U;
	}
	var W = !1;
	function de(e, t) {
		if (!e || W) return "";
		W = !0;
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
			W = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? ue(n) : "";
	}
	function fe(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return ue(e.type);
			case 16: return ue("Lazy");
			case 13: return e.child !== t && t !== null ? ue("Suspense Fallback") : ue("Suspense");
			case 19: return ue("SuspenseList");
			case 0:
			case 15: return de(e.type, !1);
			case 11: return de(e.type.render, !1);
			case 1: return de(e.type, !0);
			case 31: return ue("Activity");
			default: return "";
		}
	}
	function G(e) {
		try {
			var t = "", n = null;
			do
				t += fe(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var pe = Object.prototype.hasOwnProperty, me = t.unstable_scheduleCallback, he = t.unstable_cancelCallback, ge = t.unstable_shouldYield, K = t.unstable_requestPaint, _e = t.unstable_now, ve = t.unstable_getCurrentPriorityLevel, ye = t.unstable_ImmediatePriority, be = t.unstable_UserBlockingPriority, xe = t.unstable_NormalPriority, Se = t.unstable_LowPriority, Ce = t.unstable_IdlePriority, we = t.log, Te = t.unstable_setDisableYieldValue, Ee = null, De = null;
	function Oe(e) {
		if (typeof we == "function" && Te(e), De && typeof De.setStrictMode == "function") try {
			De.setStrictMode(Ee, e);
		} catch {}
	}
	var ke = Math.clz32 ? Math.clz32 : Me, Ae = Math.log, je = Math.LN2;
	function Me(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Ae(e) / je | 0) | 0;
	}
	var Ne = 256, Pe = 262144, Fe = 4194304;
	function Ie(e) {
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
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = Ie(n))) : i = Ie(o) : i = Ie(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = Ie(n))) : i = Ie(o)) : i = Ie(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
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
		var e = Fe;
		return Fe <<= 1, !(Fe & 62914560) && (Fe = 4194304), e;
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
			var u = 31 - ke(n), d = 1 << u;
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
		var r = 31 - ke(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function Ge(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - ke(n), i = 1 << r;
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
		var e = I.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : hp(e.type)) : e;
	}
	function Xe(e, t) {
		var n = I.p;
		try {
			return I.p = e, t();
		} finally {
			I.p = n;
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
		return pe.call(vt, e) ? !0 : pe.call(_t, e) ? !1 : gt.test(e) ? vt[e] = !0 : (_t[e] = !0, !1);
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
				if (P(r)) {
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
			if (!pe.call(t, i) || !mr(e[i], t[i])) return !1;
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
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - ke(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
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
		else if (typeof e == "string") o = Wf(e, n, re.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
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
				stack: G(t)
			}, li.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: G(t)
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
		var i = 32 - ke(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - ke(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, vi = 1 << 32 - ke(t) + i | n << i | r, yi = a + e;
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
	var Ti = null, Ei = null, q = !1, Di = null, Oi = !1, ki = Error(s(519));
	function Ai(e) {
		throw Ii(ui(Error(s(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), ki;
	}
	function ji(e) {
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
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || Md(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = Gt), t = !0) : t = !1, t || Ai(e, !0);
	}
	function Mi(e) {
		for (Ti = e.return; Ti;) switch (Ti.tag) {
			case 5:
			case 31:
			case 13:
				Oi = !1;
				return;
			case 27:
			case 3:
				Oi = !0;
				return;
			default: Ti = Ti.return;
		}
	}
	function Ni(e) {
		if (e !== Ti) return !1;
		if (!q) return Mi(e), q = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || Wd(e.type, e.memoizedProps)), n = !n), n && Ei && Ai(e), Mi(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			Ei = df(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			Ei = df(e);
		} else t === 27 ? (t = Ei, Qd(e.type) ? (e = uf, uf = null, Ei = e) : Ei = t) : Ei = Ti ? lf(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Pi() {
		Ei = Ti = null, q = !1;
	}
	function Fi() {
		var e = Di;
		return e !== null && (Xl === null ? Xl = e : Xl.push.apply(Xl, e), Di = null), e;
	}
	function Ii(e) {
		Di === null ? Di = [e] : Di.push(e);
	}
	var Li = R(null), Ri = null, zi = null;
	function Bi(e, t, n) {
		B(Li, t._currentValue), t._currentValue = n;
	}
	function Vi(e) {
		e._currentValue = Li.current, z(Li);
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
					mr(i.pendingProps.value, o.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (i === ae.current) {
				if (o = i.alternate, o === null) throw Error(s(387));
				o.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [$f] : e.push($f));
			}
			i = i.return;
		}
		e !== null && Ui(t, e, n, r), t.flags |= 262144;
	}
	function Gi(e) {
		for (e = e.firstContext; e !== null;) {
			if (!mr(e.context._currentValue, e.memoizedValue)) return !0;
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
	}, Zi = t.unstable_scheduleCallback, Qi = t.unstable_NormalPriority, $i = {
		$$typeof: C,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function ea() {
		return {
			controller: new Xi(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function ta(e) {
		e.refCount--, e.refCount === 0 && Zi(Qi, function() {
			e.controller.abort();
		});
	}
	var na = null, ra = 0, J = 0, ia = null;
	function aa(e, t) {
		if (na === null) {
			var n = na = [];
			ra = 0, J = dd(), ia = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return ra++, t.then(oa, oa), t;
	}
	function oa() {
		if (--ra === 0 && na !== null) {
			ia !== null && (ia.status = "fulfilled");
			var e = na;
			na = null, J = 0, ia = null;
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
	var ca = F.S;
	F.S = function(e, t) {
		$l = _e(), typeof t == "object" && t && typeof t.then == "function" && aa(e, t), ca !== null && ca(e, t);
	};
	var la = R(null);
	function ua() {
		var e = la.current;
		return e === null ? Il.pooledCache : e;
	}
	function da(e, t) {
		t === null ? B(la, la.current) : B(la, t.pool);
	}
	function fa() {
		var e = ua();
		return e === null ? null : {
			parent: $i._currentValue,
			pool: e
		};
	}
	var pa = Error(s(460)), ma = Error(s(474)), ha = Error(s(542)), ga = { then: function() {} };
	function _a(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function va(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Gt, Gt), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Sa(e), e;
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
			return a === y ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === O && ya(a) === t.type) ? (t = i(t, n.props), Ea(t, n), t.return = e, t) : (t = ii(n.type, n.key, n.props, null, e.mode, r), Ea(t, n), t.return = e, t);
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
					case _: return n = ii(t.type, t.key, t.props, null, e.mode, n), Ea(n, t), n.return = e, n;
					case v: return t = ci(t, e.mode, n), t.return = e, t;
					case O: return t = ya(t), f(e, t, n);
				}
				if (P(t) || M(t)) return t = ai(t, e.mode, n, null), t.return = e, t;
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
				if (P(n) || M(n)) return i === null ? d(e, t, n, r, null) : null;
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
				if (P(r) || M(r)) return e = e.get(n) || null, d(t, e, r, i, null);
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
			if (h === s.length) return n(i, d), q && bi(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return q && bi(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), q && bi(i, h), l;
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
			if (v.done) return n(i, h), q && bi(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
				return q && bi(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), q && bi(i, g), u;
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
							a.type === y ? (c = ai(a.props.children, e.mode, c, a.key), c.return = e, e = c) : (c = ii(a.type, a.key, a.props, null, e.mode, c), Ea(c, a), c.return = e, e = c);
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
					case O: return a = ya(a), b(e, r, a, c);
				}
				if (P(a)) return h(e, r, a, c);
				if (M(a)) {
					if (l = M(a), typeof l != "function") throw Error(s(150));
					return a = l.call(a), g(e, r, a, c);
				}
				if (typeof a.then == "function") return b(e, r, Ta(a), c);
				if (a.$$typeof === C) return b(e, r, Ji(e, a), c);
				Da(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), c = i(r, a), c.return = e, e = c) : (n(e, r), c = oi(a, e.mode, c), c.return = e, e = c), o(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				wa = 0;
				var i = b(e, t, n, r);
				return Ca = null, i;
			} catch (t) {
				if (t === pa || t === ha) throw t;
				var a = ei(29, t, null, e.mode);
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
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = Zr(e), Xr(e, null, n), t;
		}
		return qr(e, r, t, n), Zr(e);
	}
	function Ia(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Ge(e, n);
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
					f !== 0 && f === J && (Ra = !0), u !== null && (u = u.next = {
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
	var Ua = R(null), Wa = R(0);
	function Ga(e, t) {
		e = Hl, B(Wa, e), B(Ua, t), Hl = e | t.baseLanes;
	}
	function Ka() {
		B(Wa, Hl), B(Ua, Ua.current);
	}
	function qa() {
		Hl = Wa.current, z(Ua), z(Wa);
	}
	var Ja = R(null), Ya = null;
	function Xa(e) {
		var t = e.alternate;
		B(to, to.current & 1), B(Ja, e), Ya === null && (t === null || Ua.current !== null || t.memoizedState !== null) && (Ya = e);
	}
	function Za(e) {
		B(to, to.current), B(Ja, e), Ya === null && (Ya = e);
	}
	function Qa(e) {
		e.tag === 22 ? (B(to, to.current), B(Ja, e), Ya === null && (Ya = e)) : $a(e);
	}
	function $a() {
		B(to, to.current), B(Ja, Ja.current);
	}
	function eo(e) {
		z(Ja), Ya === e && (Ya = null), z(to);
	}
	var to = R(0);
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
		for (var n = 0; n < t.length && n < e.length; n++) if (!mr(e[n], t[n])) return !1;
		return !0;
	}
	function go(e, t, n, r, i, a) {
		return ro = a, Y = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, F.H = e === null || e.memoizedState === null ? Ns : Ps, co = !1, a = n(r, i), co = !1, so && (a = vo(t, n, r, i)), _o(e), a;
	}
	function _o(e) {
		F.H = Ms;
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
			F.H = Fs, a = t(n, r);
		} while (so);
		return a;
	}
	function yo() {
		var e = F.H, t = e.useState()[0];
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
		return uo += 1, fo === null && (fo = []), e = va(fo, e, t), t = Y, (ao === null ? t.memoizedState : ao.next) === null && (t = t.alternate, F.H = t === null || t.memoizedState === null ? Ns : Ps), e;
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
					}), f === J && (d = !0);
					else if ((ro & p) === p) {
						u = u.next, p === J && (d = !0);
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
			if (l === null ? o = a : l.next = c, !mr(a, e.memoizedState) && (Zs = !0, d && (n = ia, n !== null))) throw n;
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
			mr(a, t.memoizedState) || (Zs = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function No(e, t, n) {
		var r = Y, i = wo(), a = q;
		if (a) {
			if (n === void 0) throw Error(s(407));
			n = n();
		} else n = t();
		var o = !mr((io || i).memoizedState, n);
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
			return !mr(e, n);
		} catch {
			return !0;
		}
	}
	function Ro(e) {
		var t = Yr(e, 2);
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
			F.T === null ? a.isTransition = !1 : n(!0), r(a), n = t.pending, n === null ? (a.next = t.pending = a, Ho(t, a)) : (a.next = n.next, t.pending = n.next = a);
		}
	}
	function Ho(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = F.T, o = {};
			F.T = o;
			try {
				var s = n(i, r), c = F.S;
				c !== null && c(o, s), Uo(e, t, s);
			} catch (n) {
				Go(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), F.T = a;
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
		if (q) {
			var n = Il.formState;
			if (n !== null) {
				a: {
					var r = Y;
					if (q) {
						if (Ei) {
							b: {
								for (var i = Ei, a = Oi; i.nodeType !== 8;) {
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
		return mr(n, t) ? n : Ua.current === null ? !(ro & 42) || ro & 1073741824 && !(Z & 261930) ? (Zs = !0, e.memoizedState = n) : (e = pu(), Y.lanes |= e, Wl |= e, t) : (e = ms(e, n, r), mr(e, t) || (Zs = !0), e);
	}
	function gs(e, t, n, r, i) {
		var a = I.p;
		I.p = a !== 0 && 8 > a ? a : 8;
		var o = F.T, s = {};
		F.T = s, Os(e, !1, t, n);
		try {
			var c = i(), l = F.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? Ds(e, t, sa(c, r), fu(e)) : Ds(e, t, r, fu(e));
		} catch (n) {
			Ds(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, fu());
		} finally {
			I.p = a, o !== null && s.types !== null && (o.types = s.types), F.T = o;
		}
	}
	function _s() {}
	function vs(e, t, n, r) {
		if (e.tag !== 5) throw Error(s(476));
		var i = ys(e).queue;
		gs(e, i, t, te, n === null ? _s : function() {
			return bs(e), n(r);
		});
	}
	function ys(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: te,
			baseState: te,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: ko,
				lastRenderedState: te
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
					r !== null && (mu(r, t, n), Ia(r, t, n)), t = { cache: ea() }, e.payload = t;
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
		}, ks(e) ? As(t, n) : (n = Jr(e, t, n, r), n !== null && (mu(n, e, r), js(n, t, r)));
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
				if (i.hasEagerState = !0, i.eagerState = s, mr(s, o)) return qr(e, t, i, 0), Il === null && Kr(), !1;
			} catch {}
			if (n = Jr(e, t, i, r), n !== null) return mu(n, e, r), js(n, t, r), !0;
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
		} else t = Jr(e, n, r, 2), t !== null && mu(t, e, 2);
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
			r &= e.pendingLanes, n |= r, t.lanes = n, Ge(e, n);
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
			if (q) {
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
			if (q) {
				var n = yi, r = vi;
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
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !hr(n, r) || !hr(i, a) : !0;
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
		if (q) return t = Ja.current, t === null ? (r !== ki && (t = Error(s(423), { cause: r }), Ii(ui(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = ui(r, n), i = Ks(e.stateNode, r, i), La(e, i), Ul !== 4 && (Ul = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== ki && (e = Error(s(422), { cause: r }), Ii(ui(e, n)))), !1;
		var a = Error(s(520), { cause: r });
		if (a = ui(a, n), Yl === null ? Yl = [a] : Yl.push(a), Ul !== 4 && (Ul = 2), t === null) return !0;
		r = ui(r, n), n = t;
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
		return Ki(t), r = go(e, t, n, o, a, i), s = bo(), e !== null && !Zs ? (xo(e, t, i), Cc(e, t, i)) : (q && s && Si(t), t.flags |= 1, Qs(e, t, r, i), t.child);
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
			parent: $i._currentValue,
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
			if (q) {
				if (r.mode === "hidden") return e = ac(t, r), t.lanes = 536870912, rc(null, e);
				if (Za(t), (e = Ei) ? (e = af(e, Oi), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: _i === null ? null : {
						id: vi,
						overflow: yi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = si(e), n.return = t, t.child = n, Ti = t, Ei = null)) : e = null, e === null) throw Ai(t);
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
				if (r = Il, r !== null && (o = Ke(r, n), o !== 0 && o !== a.retryLane)) throw a.retryLane = o, Yr(e, o), mu(r, e, o), Xs;
				Eu(), t = oc(e, t, n);
			} else e = a.treeContext, Ei = lf(o.nextSibling), Ti = t, q = !0, Di = null, Oi = !1, e !== null && wi(t, e), t = ac(t, r), t.flags |= 4096;
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
		return Ki(t), n = go(e, t, n, r, void 0, i), r = bo(), e !== null && !Zs ? (xo(e, t, i), Cc(e, t, i)) : (q && r && Si(t), t.flags |= 1, Qs(e, t, n, i), t.child);
	}
	function uc(e, t, n, r, i, a) {
		return Ki(t), t.updateQueue = null, n = vo(t, r, n, i), _o(e), r = bo(), e !== null && !Zs ? (xo(e, t, a), Cc(e, t, a)) : (q && r && Si(t), t.flags |= 1, Qs(e, t, n, a), t.child);
	}
	function dc(e, t, n, r, i) {
		if (Ki(t), t.stateNode === null) {
			var a = Qr, o = n.contextType;
			typeof o == "object" && o && (a = qi(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Ls, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Ma(t), o = n.contextType, a.context = typeof o == "object" && o ? qi(o) : Qr, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Is(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Ls.enqueueReplaceState(a, a.state, null), Ba(t, r, a, i), za(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Bs(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = Qr, typeof u == "object" && u && (o = qi(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && zs(t, a, r, o), ja = !1;
			var f = t.memoizedState;
			a.state = f, Ba(t, r, a, i), za(), l = t.memoizedState, s || f !== l || ja ? (typeof d == "function" && (Is(t, n, d, r), l = t.memoizedState), (c = ja || Rs(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Na(e, t), o = t.memoizedProps, u = Bs(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = Qr, typeof l == "object" && l && (c = qi(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && zs(t, a, r, c), ja = !1, f = t.memoizedState, a.state = f, Ba(t, r, a, i), za();
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
			if (q) {
				if (i ? Xa(t) : $a(t), (e = Ei) ? (e = af(e, Oi), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: _i === null ? null : {
						id: vi,
						overflow: yi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = si(e), n.return = t, t.child = n, Ti = t, Ei = null)) : e = null, e === null) throw Ai(t);
				return sf(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var c = r.children;
			return r = r.fallback, i ? ($a(t), i = t.mode, c = vc({
				mode: "hidden",
				children: c
			}, i), r = ai(r, i, n, null), c.return = t, r.return = t, c.sibling = r, t.child = c, r = t.child, r.memoizedState = mc(n), r.childLanes = hc(e, o, n), t.memoizedState = pc, rc(null, r)) : (Xa(t), _c(t, c));
		}
		var l = e.memoizedState;
		if (l !== null && (c = l.dehydrated, c !== null)) {
			if (a) t.flags & 256 ? (Xa(t), t.flags &= -257, t = yc(e, t, n)) : t.memoizedState === null ? ($a(t), c = r.fallback, i = t.mode, r = vc({
				mode: "visible",
				children: r.children
			}, i), c = ai(c, i, n, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, ka(t, e.child, null, n), r = t.child, r.memoizedState = mc(n), r.childLanes = hc(e, o, n), t.memoizedState = pc, t = rc(null, r)) : ($a(t), t.child = e.child, t.flags |= 128, t = null);
			else if (Xa(t), sf(c)) {
				if (o = c.nextSibling && c.nextSibling.dataset, o) var u = o.dgst;
				o = u, r = Error(s(419)), r.stack = "", r.digest = o, Ii({
					value: r,
					source: null,
					stack: null
				}), t = yc(e, t, n);
			} else if (Zs || Wi(e, t, n, !1), o = (n & e.childLanes) !== 0, Zs || o) {
				if (o = Il, o !== null && (r = Ke(o, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, Yr(e, r), mu(o, e, r), Xs;
				of(c) || Eu(), t = yc(e, t, n);
			} else of(c) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, Ei = lf(c.nextSibling), Ti = t, q = !0, Di = null, Oi = !1, e !== null && wi(t, e), t = _c(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? ($a(t), c = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = ni(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (c = ai(c, i, n, null), c.flags |= 2) : c = ni(u, c), c.return = t, r.return = t, r.sibling = c, t.child = r, rc(null, r), r = t.child, c = e.child.memoizedState, c === null ? c = mc(n) : (i = c.cachePool, i === null ? i = fa() : (l = $i._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), c = {
			baseLanes: c.baseLanes | n,
			cachePool: i
		}), r.memoizedState = c, r.childLanes = hc(e, o, n), t.memoizedState = pc, rc(e.child, r)) : (Xa(t), n = e.child, e = n.sibling, n = ni(n, {
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
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, B(to, o), Qs(e, t, r, n), r = q ? mi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
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
			for (e = t.child, n = ni(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ni(e, e.pendingProps), n.return = t;
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
				oe(t, t.stateNode.containerInfo), Bi(t, $i, e.memoizedState.cache), Pi();
				break;
			case 27:
			case 5:
				se(t);
				break;
			case 4:
				oe(t, t.stateNode.containerInfo);
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
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), B(to, to.current), r) break;
				return null;
			case 22: return t.lanes = 0, nc(e, t, n, t.pendingProps);
			case 24: Bi(t, $i, e.memoizedState.cache);
		}
		return Cc(e, t, n);
	}
	function Ec(e, t, n) {
		if (e !== null) if (e.memoizedProps !== t.pendingProps) Zs = !0;
		else {
			if (!wc(e, n) && !(t.flags & 128)) return Zs = !1, Tc(e, t, n);
			Zs = !!(e.flags & 131072);
		}
		else Zs = !1, q && t.flags & 1048576 && xi(t, mi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = ya(t.elementType), t.type = e, typeof e == "function") ti(e) ? (r = Bs(e, r), t.tag = 1, t = dc(null, t, e, r, n)) : (t.tag = 0, t = lc(null, t, e, r, n));
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
					if (oe(t, t.stateNode.containerInfo), e === null) throw Error(s(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, Na(e, t), Ba(t, r, null, n);
					var o = t.memoizedState;
					if (r = o.cache, Bi(t, $i, r), r !== a.cache && Ui(t, [$i], n, !0), za(), r = o.element, a.isDehydrated) if (a = {
						element: r,
						isDehydrated: !1,
						cache: o.cache
					}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
						t = fc(e, t, r, n);
						break a;
					} else if (r !== i) {
						i = ui(Error(s(424)), t), Ii(i), t = fc(e, t, r, n);
						break a;
					} else {
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (Ei = lf(e.firstChild), Ti = t, q = !0, Di = null, Oi = !0, n = Aa(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
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
			case 26: return cc(e, t), e === null ? (n = Af(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : q || (n = t.type, e = t.pendingProps, r = Vd(V.current).createElement(n), r[Qe] = t, r[$e] = e, Fd(r, n, e), dt(r), t.stateNode = r) : t.memoizedState = Af(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return se(t), e === null && q && (r = t.stateNode = pf(t.type, t.pendingProps, V.current), Ti = t, Oi = !0, i = Ei, Qd(t.type) ? (uf = i, Ei = lf(r.firstChild)) : Ei = i), Qs(e, t, t.pendingProps.children, n), cc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && q && ((i = r = Ei) && (r = nf(r, t.type, t.pendingProps, Oi), r === null ? i = !1 : (t.stateNode = r, Ti = t, Ei = lf(r.firstChild), Oi = !1, i = !0)), i || Ai(t)), se(t), i = t.type, a = t.pendingProps, o = e === null ? null : e.memoizedProps, r = a.children, Wd(i, a) ? r = null : o !== null && Wd(i, o) && (t.flags |= 32), t.memoizedState !== null && (i = go(e, t, yo, null, null, n), $f._currentValue = i), cc(e, t), Qs(e, t, r, n), t.child;
			case 6: return e === null && q && ((e = n = Ei) && (n = rf(n, t.pendingProps, Oi), n === null ? e = !1 : (t.stateNode = n, Ti = t, Ei = null, e = !0)), e || Ai(t)), null;
			case 13: return gc(e, t, n);
			case 4: return oe(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = ka(t, null, r, n) : Qs(e, t, r, n), t.child;
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
			case 24: return Ki(t), r = qi($i), e === null ? (i = ua(), i === null && (i = Il, a = ea(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, Ma(t), Bi(t, $i, i)) : ((e.lanes & n) !== 0 && (Na(e, t), Ba(t, null, null, n), za()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, Bi(t, $i, r), r !== i.cache && Ui(t, [$i], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), Bi(t, $i, r))), Qs(e, t, t.pendingProps.children, n), t.child;
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
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : Be(), e.lanes |= t, Jl |= t);
	}
	function jc(e, t) {
		if (!q) switch (e.tailMode) {
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
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Vi($i), H(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Ni(t) ? Dc(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Fi())), Mc(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (Dc(t), a === null ? (Mc(t), Oc(t, i, null, r, n)) : (Mc(t), kc(t, a))) : a ? a === e.memoizedState ? (Mc(t), t.flags &= -16777217) : (Dc(t), Mc(t), kc(t, a)) : (e = e.memoizedProps, e !== r && Dc(t), Mc(t), Oc(t, i, e, r, n)), null;
			case 27:
				if (ce(t), n = V.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Dc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Mc(t), null;
					}
					e = re.current, Ni(t) ? ji(t, e) : (e = pf(i, r, n), t.stateNode = e, Dc(t));
				}
				return Mc(t), null;
			case 5:
				if (ce(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Dc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Mc(t), null;
					}
					if (a = re.current, Ni(t)) ji(t, a);
					else {
						var o = Vd(V.current);
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
					if (e = V.current, Ni(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = Ti, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[Qe] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || Md(e.nodeValue, n)), e || Ai(t, !0);
					} else e = Vd(e).createTextNode(r), e[Qe] = t, t.stateNode = e;
				}
				return Mc(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Ni(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(s(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(557));
							e[Qe] = t;
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
							i[Qe] = t;
						} else Pi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Mc(t), i = !1;
					} else i = Fi(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (eo(t), t) : (eo(t), null);
				}
				return eo(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Ac(t, t.updateQueue), Mc(t), null);
			case 4: return H(), e === null && Sd(t.stateNode.containerInfo), Mc(t), null;
			case 10: return Vi(t.type), Mc(t), null;
			case 19:
				if (z(to), r = t.memoizedState, r === null) return Mc(t), null;
				if (i = (t.flags & 128) != 0, a = r.rendering, a === null) if (i) jc(r, !1);
				else {
					if (Ul !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
						if (a = no(e), a !== null) {
							for (t.flags |= 128, jc(r, !1), e = a.updateQueue, t.updateQueue = e, Ac(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) ri(n, e), n = n.sibling;
							return B(to, to.current & 1 | 2), q && bi(t, r.treeForkCount), t.child;
						}
						e = e.sibling;
					}
					r.tail !== null && _e() > eu && (t.flags |= 128, i = !0, jc(r, !1), t.lanes = 4194304);
				}
				else {
					if (!i) if (e = no(a), e !== null) {
						if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Ac(t, e), jc(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !q) return Mc(t), null;
					} else 2 * _e() - r.renderingStartTime > eu && n !== 536870912 && (t.flags |= 128, i = !0, jc(r, !1), t.lanes = 4194304);
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (Mc(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = _e(), e.sibling = null, n = to.current, B(to, i ? n & 1 | 2 : n & 1), q && bi(t, r.treeForkCount), e);
			case 22:
			case 23: return eo(t), qa(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (Mc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Mc(t), n = t.updateQueue, n !== null && Ac(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && z(la), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Vi($i), Mc(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(s(156, t.tag));
	}
	function Pc(e, t) {
		switch (Ci(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Vi($i), H(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return ce(t), null;
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
			case 19: return z(to), null;
			case 4: return H(), null;
			case 10: return Vi(t.type), null;
			case 22:
			case 23: return eo(t), qa(), e !== null && z(la), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Vi($i), null;
			case 25: return null;
			default: return null;
		}
	}
	function Fc(e, t) {
		switch (Ci(t), t.tag) {
			case 3:
				Vi($i), H();
				break;
			case 26:
			case 27:
			case 5:
				ce(t);
				break;
			case 4:
				H();
				break;
			case 31:
				t.memoizedState !== null && eo(t);
				break;
			case 13:
				eo(t);
				break;
			case 19:
				z(to);
				break;
			case 10:
				Vi(t.type);
				break;
			case 22:
			case 23:
				eo(t), qa(), e !== null && z(la);
				break;
			case 24: Vi($i);
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
		t !== null && (e.alternate = null, nl(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && ot(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var rl = null, il = !1;
	function al(e, t, n) {
		for (n = n.child; n !== null;) ol(e, t, n), n = n.sibling;
	}
	function ol(e, t, n) {
		if (De && typeof De.onCommitFiberUnmount == "function") try {
			De.onCommitFiberUnmount(Ee, n);
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
				dl(t, e), ml(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Ql = _e()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, ul(e, r)));
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
			var t = qi($i), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return qi($i).controller.signal;
		}
	}, Pl = typeof WeakMap == "function" ? WeakMap : Map, Fl = 0, Il = null, X = null, Z = 0, Ll = 0, Rl = null, zl = !1, Bl = !1, Vl = !1, Hl = 0, Ul = 0, Wl = 0, Gl = 0, Kl = 0, ql = 0, Jl = 0, Yl = null, Xl = null, Zl = !1, Ql = 0, $l = 0, eu = Infinity, tu = null, nu = null, ru = 0, iu = null, au = null, ou = 0, su = 0, cu = null, lu = null, uu = 0, du = null;
	function fu() {
		return Fl & 2 && Z !== 0 ? Z & -Z : F.T === null ? Ye() : dd();
	}
	function pu() {
		if (ql === 0) if (!(Z & 536870912) || q) {
			var e = Pe;
			Pe <<= 1, !(Pe & 3932160) && (Pe = 262144), ql = e;
		} else ql = 536870912;
		return e = Ja.current, e !== null && (e.flags |= 32), ql;
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
					if ((t & 62914560) === t && (i = Ql + 300 - _e(), 10 < i)) {
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
			var m = (a & 62914560) === a ? Ql - _e() : (a & 4194048) === a ? $l - _e() : 0;
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
			var a = 31 - ke(i), o = 1 << a;
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
			else e = X, zi = Ri = null, So(e), Ca = null, wa = 0, e = X;
			for (; e !== null;) Fc(e.alternate, e), e = e.return;
			X = null;
		}
	}
	function xu(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, Jd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), ou = 0, bu(), Il = e, X = n = ni(e.current, null), Z = t, Ll = 0, Rl = null, zl = !1, Bl = Re(e, t), Vl = !1, Jl = ql = Kl = Gl = Wl = Ul = 0, Xl = Yl = null, Zl = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - ke(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Hl = t, Kr(), n;
	}
	function Su(e, t) {
		Y = null, F.H = Ms, t === pa || t === ha ? (t = xa(), Ll = 3) : t === ma ? (t = xa(), Ll = 4) : Ll = t === Xs ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Rl = t, X === null && (Ul = 1, Ws(e, ui(t, e.current)));
	}
	function Cu() {
		var e = Ja.current;
		return e === null ? !0 : (Z & 4194048) === Z ? Ya === null : (Z & 62914560) === Z || Z & 536870912 ? e === Ya : !1;
	}
	function wu() {
		var e = F.H;
		return F.H = Ms, e === null ? Ms : e;
	}
	function Tu() {
		var e = F.A;
		return F.A = Nl, e;
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
		return t && e.shellSuspendCounter++, zi = Ri = null, Fl = r, F.H = i, F.A = a, X === null && (Il = null, Z = 0, Kr()), o;
	}
	function Ou() {
		for (; X !== null;) ju(X);
	}
	function ku(e, t) {
		var n = Fl;
		Fl |= 2;
		var r = wu(), i = Tu();
		Il !== e || Z !== t ? (tu = null, eu = _e() + 500, xu(e, t)) : Bl = Re(e, t);
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
		return zi = Ri = null, F.H = r, F.A = i, Fl = n, X === null ? (Il = null, Z = 0, Kr(), Ul) : 0;
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
			default: Fc(n, t), t = X = ri(t, Hl), t = Ec(n, t, Hl);
		}
		e.memoizedProps = e.pendingProps, t === null ? Pu(e) : X = t;
	}
	function Nu(e, t, n, r) {
		zi = Ri = null, So(t), Ca = null, wa = 0;
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
		t.flags & 32768 ? (q || r === 1 ? e = !0 : Bl || Z & 536870912 ? e = !1 : (zl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Ja.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Fu(t, e)) : Pu(t);
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
			if (a = t.lanes | t.childLanes, a |= Gr, Ue(e, n, a, o, c, l), e === Il && (X = Il = null, Z = 0), au = t, iu = e, ou = n, su = a, cu = i, lu = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Xu(xe, function() {
				return Hu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = (t.flags & 13878) != 0, t.subtreeFlags & 13878 || r) {
				r = F.T, F.T = null, i = I.p, I.p = 2, o = Fl, Fl |= 4;
				try {
					el(e, t, n);
				} finally {
					Fl = o, I.p = i, F.T = r;
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
				n = F.T, F.T = null;
				var r = I.p;
				I.p = 2;
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
					Fl = i, I.p = r, F.T = n;
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
				n = F.T, F.T = null;
				var r = I.p;
				I.p = 2;
				var i = Fl;
				Fl |= 4;
				try {
					tl(e, t.alternate, t);
				} finally {
					Fl = i, I.p = r, F.T = n;
				}
			}
			ru = 3;
		}
	}
	function zu() {
		if (ru === 4 || ru === 3) {
			ru = 0, K();
			var e = iu, t = au, n = ou, r = lu;
			t.subtreeFlags & 10256 || t.flags & 10256 ? ru = 5 : (ru = 0, au = iu = null, Bu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (nu = null), Je(n), t = t.stateNode, De && typeof De.onCommitFiberRoot == "function") try {
				De.onCommitFiberRoot(Ee, t, void 0, (t.current.flags & 128) == 128);
			} catch {}
			if (r !== null) {
				t = F.T, i = I.p, I.p = 2, F.T = null;
				try {
					for (var a = e.onRecoverableError, o = 0; o < r.length; o++) {
						var s = r[o];
						a(s.value, { componentStack: s.stack });
					}
				} finally {
					F.T = t, I.p = i;
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
		var n = Je(ou), r = F.T, i = I.p;
		try {
			I.p = 32 > n ? 32 : n, F.T = null, n = cu, cu = null;
			var a = iu, o = ou;
			if (ru = 0, au = iu = null, ou = 0, Fl & 6) throw Error(s(331));
			var c = Fl;
			if (Fl |= 4, Al(a.current), Sl(a, a.current, o, n), Fl = c, id(0, !1), De && typeof De.onPostCommitFiberRoot == "function") try {
				De.onPostCommitFiberRoot(Ee, a);
			} catch {}
			return !0;
		} finally {
			I.p = i, F.T = r, Bu(e, t);
		}
	}
	function Uu(e, t, n) {
		t = ui(n, t), t = Ks(e.stateNode, t, 2), e = Fa(e, t, 2), e !== null && (He(e, 2), rd(e));
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
					e = ui(n, e), n = qs(2), r = Fa(t, n, 2), r !== null && (Js(n, r, t, e), He(r, 2), rd(r));
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
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Il === e && (Z & n) === n && (Ul === 4 || Ul === 3 && (Z & 62914560) === Z && 300 > _e() - Ql ? !(Fl & 2) && xu(e, 0) : Kl |= n, Jl === Z && (Jl = 0)), rd(e);
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
		for (var t = _e(), n = null, r = Zu; r !== null;) {
			var i = r.next, a = sd(r, t);
			a === 0 ? (r.next = null, n === null ? Zu = i : n.next = i, i === null && (Qu = n)) : (n = r, (e !== 0 || a & 3) && (ed = !0)), r = i;
		}
		ru !== 0 && ru !== 5 || id(e, !1), nd !== 0 && (nd = 0);
	}
	function sd(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - ke(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = ze(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Il, n = Z, n = Le(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Ll === 2 || Ll === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && he(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || Re(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && he(r), Je(n)) {
				case 2:
				case 8:
					n = be;
					break;
				case 32:
					n = xe;
					break;
				case 268435456:
					n = Ce;
					break;
				default: n = xe;
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
		return r = Le(e, e === Il ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (hu(e, r, t), sd(e, _e()), e.callbackNode != null && e.callbackNode === n ? cd.bind(null, e) : null);
	}
	function ld(e, t) {
		if (Vu()) return null;
		hu(e, t, !0);
	}
	function ud() {
		Xd(function() {
			Fl & 6 ? me(ye, ad) : od();
		});
	}
	function dd() {
		if (nd === 0) {
			var e = J;
			e === 0 && (e = Ne, Ne <<= 1, !(Ne & 261888) && (Ne = 256)), nd = e;
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
	var vf = I.d;
	I.d = {
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
		t !== null && t.tag === 5 && t.type === "form" ? bs(t) : vf.r(e);
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
		var i = (i = V.current) ? _f(i) : null;
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
		_currentValue: te,
		_currentValue2: te,
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
		}, Ma(a), e;
	}
	function np(e) {
		return e ? (e = Qr, e) : Qr;
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
		var i = F.T;
		F.T = null;
		var a = I.p;
		try {
			I.p = 2, dp(e, t, n, r);
		} finally {
			I.p = a, F.T = i;
		}
	}
	function up(e, t, n, r) {
		var i = F.T;
		F.T = null;
		var a = I.p;
		try {
			I.p = 8, dp(e, t, n, r);
		} finally {
			I.p = a, F.T = i;
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
								var o = Ie(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - ke(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									rd(a), !(Fl & 6) && (eu = _e() + 500, id(0, !1));
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
			case "message": switch (ve()) {
				case ye: return 2;
				case be: return 8;
				case xe:
				case Se: return 32;
				case Ce: return 268435456;
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
	I.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(s(188)) : (e = Object.keys(e).join(","), Error(s(268, e)));
		return e = p(t), e = e === null ? null : m(e), e = e === null ? null : e.stateNode, e;
	};
	var zp = {
		bundleType: 0,
		version: "19.2.7",
		rendererPackageName: "react-dom",
		currentDispatcherRef: F,
		reconcilerVersion: "19.2.7"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var Bp = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!Bp.isDisabled && Bp.supportsFiber) try {
			Ee = Bp.inject(zp), De = Bp;
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
})), l = i(), u = c(), d = "nbl-game-flow-debug", f = !1, p = null;
function m() {
	if (f) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(d) === "1" ? !0 : new URLSearchParams(window.location.search).has("gameFlowDebug");
	} catch {
		return !1;
	}
}
function h(e, t, n) {
	if (!m()) return;
	let r = `[nbl-flow ${typeof performance < "u" ? `${performance.now().toFixed(1)}ms` : ""}] ${e} :: ${t}`;
	if (p) {
		p(r.trim(), n);
		return;
	}
	console.info(r, n ?? "");
}
//#endregion
//#region src/types.ts
var g = {
	spades: "♠",
	hearts: "♥",
	diamonds: "♦",
	clubs: "♣"
}, _ = {
	spades: "Spades",
	hearts: "Hearts",
	diamonds: "Diamonds",
	clubs: "Clubs"
}, v = {
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
}, y = (e) => e === "hearts" || e === "diamonds", b = /* @__PURE__ */ e(((e) => {
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
})), x = (/* @__PURE__ */ e(((e, t) => {
	t.exports = b();
})))();
function S({ card: e, faceDown: t = !1, size: n = "md", state: r = "default", badge: i, onClick: a, onPlayClick: o, pointerHandlers: s, pressed: c = !1, playing: l = !1, playable: u = !1, showPlayableHint: d = !0, illegalShake: f = !1, illegalFlash: p = !1, disabled: m = !1, ariaLabel: h, "data-testid": v, "data-card-index": b, "data-playable": S }) {
	let C = !!s, w = (C || typeof a == "function") && !m, T = [
		"pcard",
		`pcard--${n}`,
		`pcard--${r}`,
		w ? "pcard--interactive" : "",
		u && d ? "pcard--playable" : "",
		c ? "pcard--pressed" : "",
		l ? "pcard--playing" : "",
		f ? "pcard--illegal-shake" : "",
		p ? "pcard--illegal-flash" : "",
		m ? "pcard--disabled" : ""
	].filter(Boolean).join(" ");
	if (t || !e) return /* @__PURE__ */ (0, x.jsx)("div", {
		className: `${T} pcard--back`,
		"aria-label": "Face-down card",
		role: "img",
		children: /* @__PURE__ */ (0, x.jsxs)("span", {
			className: "pcard__surface pcard__surface--back",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, x.jsx)("span", { className: "pcard__back-pattern" }), /* @__PURE__ */ (0, x.jsx)("span", {
				className: "pcard__back-emblem",
				"aria-hidden": "true"
			})]
		})
	});
	let E = y(e.suit), D = g[e.suit], O = h ?? `${e.rank} of ${_[e.suit]}`, k = `pcard--suit-${e.suit}`, A = /* @__PURE__ */ (0, x.jsxs)("span", {
		className: "pcard__surface",
		"aria-hidden": "true",
		children: [
			i && /* @__PURE__ */ (0, x.jsx)("span", {
				className: "pcard__badge",
				children: i
			}),
			/* @__PURE__ */ (0, x.jsxs)("span", {
				className: "pcard__corner pcard__corner--tl",
				children: [/* @__PURE__ */ (0, x.jsx)("span", {
					className: "pcard__rank",
					children: e.rank
				}), /* @__PURE__ */ (0, x.jsx)("span", {
					className: "pcard__suit",
					children: D
				})]
			}),
			/* @__PURE__ */ (0, x.jsx)("span", {
				className: "pcard__center",
				children: D
			}),
			/* @__PURE__ */ (0, x.jsxs)("span", {
				className: "pcard__corner pcard__corner--br",
				children: [/* @__PURE__ */ (0, x.jsx)("span", {
					className: "pcard__rank",
					children: e.rank
				}), /* @__PURE__ */ (0, x.jsx)("span", {
					className: "pcard__suit",
					children: D
				})]
			})
		]
	});
	return w ? /* @__PURE__ */ (0, x.jsx)("button", {
		type: "button",
		className: `${T} ${E ? "pcard--red" : "pcard--black"} ${k}`,
		onClick: C && u && o ? (e) => {
			e.preventDefault(), o();
		} : C ? void 0 : a,
		disabled: m,
		"aria-disabled": m || void 0,
		"aria-busy": l || void 0,
		"aria-label": O,
		"data-testid": v,
		"data-card-index": b,
		"data-playable": S,
		...s,
		children: A
	}) : /* @__PURE__ */ (0, x.jsx)("div", {
		className: `${T} ${E ? "pcard--red" : "pcard--black"} ${k}`,
		role: "img",
		"aria-label": O,
		"aria-disabled": m || void 0,
		"data-testid": v,
		"data-card-index": b,
		"data-playable": S,
		children: A
	});
}
//#endregion
//#region src/components/cardGesture.ts
var C = {
	HOLD_MS: 220,
	TAP_MOVE_PX: 12,
	SWIPE_UP_PX: 28,
	SWIPE_FLICK_PX: 36,
	SCROLL_CANCEL_PX: 48
};
function w(e, t) {
	return Math.hypot(e, t) <= C.TAP_MOVE_PX;
}
function T(e, t) {
	let n = Math.abs(e), r = Math.abs(t);
	return t <= -C.SWIPE_UP_PX && r > n;
}
function E(e, t) {
	let n = Math.abs(e), r = Math.abs(t);
	return t > 0 && r > C.SCROLL_CANCEL_PX && r > n;
}
function D(e, t) {
	return E(e, t) ? !1 : T(e, t) ? !0 : Math.hypot(e, t) >= C.SWIPE_FLICK_PX;
}
function O(e, t, n) {
	return {
		pointerId: e,
		startX: t,
		startY: n,
		fired: !1
	};
}
//#endregion
//#region src/components/useCardGestureHandlers.ts
function k({ disabled: e = !1, mode: t, onPlay: n, onSelect: r, onPeekStart: i, onPeekEnd: a, onPressChange: o }) {
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
					if (f(), c.current = O(e.pointerId, e.clientX, e.clientY), d.current = !1, t.onPressChange?.(!0), e.currentTarget.setPointerCapture(e.pointerId), e.preventDefault(), t.mode === "peek") {
						d.current = !0, t.onPeekStart?.();
						return;
					}
					t.mode === "play" && (u.current = window.setTimeout(() => {
						u.current = null, m("hold");
					}, C.HOLD_MS));
				}
			},
			onPointerMove(e) {
				let t = c.current, n = s.current;
				if (!t || t.pointerId !== e.pointerId || n.disabled) return;
				let r = e.clientX - t.startX, i = e.clientY - t.startY;
				if (n.mode === "play" && !t.fired) {
					if (E(r, i)) {
						f(), p();
						return;
					}
					D(r, i) && m("swipe-flick");
				}
			},
			onPointerUp(t) {
				let n = c.current, r = s.current;
				if (!n || n.pointerId !== t.pointerId) return;
				let i = t.clientX - n.startX, a = t.clientY - n.startY;
				f(), n.fired || (r.mode === "play" && w(i, a) ? m("tap") : r.mode === "draw-select" && w(i, a) && h()), e(t.currentTarget, t.pointerId), c.current = null, r.onPressChange?.(!1), p();
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
function A(e) {
	return `${e.rank}:${e.suit}`;
}
function j(e) {
	return v[e.rank];
}
function M(e, t) {
	return e.suit === t;
}
function N(e, t) {
	return e.filter((e) => e.suit === t);
}
//#endregion
//#region src/components/handLayout.ts
function ee(e, t, n, r) {
	let i = r?.minVisiblePx ?? 30, a = r?.maxGapPx ?? 6, o = Math.max(0, t), s = Math.max(0, e), c = Math.max(1, n);
	if (o <= 1 || s <= 0) return 0;
	let l = Math.max(8, c - i), u = c + a, d = (s - c) / (o - 1);
	return Math.round(Math.min(u, Math.max(l, d)) - c);
}
function P(e) {
	return e === "lg" ? 96 : e === "md" ? 72 : 52;
}
//#endregion
//#region src/components/handPlayInteraction.ts
function F(e) {
	let t = e.isPlayMode && e.isMyTurn && e.legalPlay && !e.busy, n = e.isPlayMode && !e.isMyTurn && e.allowPlayPreselect && e.legalPlay && !e.busy, r = t || n, i = e.cardState === "play-preselected" || e.cardState === "play-recommended";
	return {
		playInteractive: r,
		playableOutline: e.playableHintFor?.(e.index) ?? (t && !i && e.showPlayableHint !== !1)
	};
}
//#endregion
//#region src/components/Hand.tsx
var I = (e) => A(e);
function te({ card: e, index: t, size: n, state: r, badge: i, cardTestId: a, cardInteraction: o, onCardClick: s, onCardPeek: c, peekActive: u, slotClassFor: d, dealSeatPlayerId: f, style: p }) {
	let [m, h] = (0, l.useState)(!1), g = o, _ = g?.mode === "play", v = g?.mode === "draw-select", y = g?.mode === "peek", b = g?.isMyTurn === !0, C = !g?.legalPlayIndices || g.legalPlayIndices.includes(t), { playInteractive: w, playableOutline: T } = F({
		isPlayMode: _,
		isMyTurn: b,
		legalPlay: C,
		busy: !!g?.busy,
		allowPlayPreselect: !!g?.allowPlayPreselect,
		cardState: r,
		playableHintFor: g?.playableHintFor,
		showPlayableHint: g?.showPlayableHint,
		index: t
	}), E = g?.playingIndex === t, D = _ && b && !C && !g?.busy && !E, O = v && r === "draw-selected", A = v && r === "draw-recommended", j = r === "play-preselected", M = r === "play-recommended", N = !!g?.busy || E || _ && !b && !w || v && !b, ee = N || _ && !C && !w || v && !b, P = k({
		disabled: N || !w && !v && !y && !D,
		mode: D ? "draw-select" : g?.mode ?? "none",
		onPlay: w ? (e) => g?.onPlayCard?.(t, e) : void 0,
		onSelect: v && b ? () => g?.onSelectCard?.(t) : D ? () => g?.onIllegalPlay?.(t) : void 0,
		onPeekStart: y ? () => c?.(t) : void 0,
		onPeekEnd: y ? () => c?.(null) : void 0,
		onPressChange: h
	}), I = !!g && (g?.mode !== "none" || D), te = _ && b ? w ? a : "play-button-disabled" : a;
	return /* @__PURE__ */ (0, x.jsx)("div", {
		className: [
			"hand__slot",
			u ? "hand__slot--peek" : "",
			O ? "hand__slot--draw-selected" : "",
			A ? "hand__slot--draw-recommended" : "",
			j ? "hand__slot--play-preselected" : "",
			M ? "hand__slot--play-recommended" : "",
			d?.(e, t) ?? ""
		].filter(Boolean).join(" "),
		style: p,
		"aria-selected": O || A ? !0 : void 0,
		"data-draw-hint": A ? "suggested" : O ? "selected" : void 0,
		"data-trick-play-origin-active": g?.playingIndex === t && g.trickPlayOriginPlayerId ? g.trickPlayOriginPlayerId : void 0,
		"data-deal-seat": f ?? void 0,
		"data-deal-round": f == null ? void 0 : t,
		children: /* @__PURE__ */ (0, x.jsx)(S, {
			card: e,
			size: n,
			state: ee && _ && !D ? "disabled" : r,
			badge: i,
			onClick: !I && s ? () => s(e, t) : void 0,
			onPlayClick: I && w ? () => g?.onPlayCard?.(t, "tap") : void 0,
			pointerHandlers: I ? P : void 0,
			pressed: m,
			playing: E,
			playable: T,
			illegalShake: g?.illegalShakeIndex === t,
			illegalFlash: g?.illegalFlashIndex === t,
			showPlayableHint: g?.showPlayableHint !== !1,
			disabled: N && (_ || v) && !D,
			"data-testid": te,
			"data-card-index": t,
			"data-playable": _ ? w ? "true" : "false" : void 0
		})
	});
}
function ne({ cards: e, size: t = "md", stateFor: n, badgeFor: r, onCardClick: i, onCardPeek: a, peekIndex: o = null, fan: s = !1, cardTestId: c, cardInteraction: u, slotClassFor: d, dealSeatPlayerId: f = null }) {
	let p = (0, l.useRef)(null);
	return (0, l.useLayoutEffect)(() => {
		if (!s || typeof window > "u") return;
		let n = p.current;
		if (!n) return;
		let r = P(t), i = () => {
			let t = ee(n.clientWidth, e.length, r);
			n.style.setProperty("--hand-fan-overlap", `${t}px`), n.style.setProperty("--hand-card-w", `${r}px`);
		}, a = new ResizeObserver(i);
		return a.observe(n), i(), () => a.disconnect();
	}, [
		s,
		e.length,
		t
	]), /* @__PURE__ */ (0, x.jsx)("div", {
		ref: p,
		className: `hand ${s ? "hand--fan" : ""} ${u ? "hand--pointer" : ""}`,
		style: s ? { "--hand-count": e.length } : void 0,
		children: /* @__PURE__ */ (0, x.jsx)("div", {
			className: "hand__fan-stage",
			children: e.map((e, l) => /* @__PURE__ */ (0, x.jsx)(te, {
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
			}, I(e)))
		})
	});
}
//#endregion
//#region src/table/animations/motionTokens.ts
var L = "power3.out", R = "power2.inOut", z = "back.out(1.35)", B = {
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
function re(e = V()) {
	return e ? .35 : 1;
}
function ie(e, t = V()) {
	return Math.max(.12, e * re(t));
}
function V() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region node_modules/gsap/gsap-core.js
function ae(e) {
	if (e === void 0) throw ReferenceError("this hasn't been initialised - super() hasn't been called");
	return e;
}
function oe(e, t) {
	e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t;
}
var H = {
	autoSleep: 120,
	force3D: "auto",
	nullTargetWarn: 1,
	units: { lineHeight: "" }
}, se = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, ce, le, U, ue = 1e8, W = 1 / ue, de = Math.PI * 2, fe = de / 4, G = 0, pe = Math.sqrt, me = Math.cos, he = Math.sin, ge = function(e) {
	return typeof e == "string";
}, K = function(e) {
	return typeof e == "function";
}, _e = function(e) {
	return typeof e == "number";
}, ve = function(e) {
	return e === void 0;
}, ye = function(e) {
	return typeof e == "object";
}, be = function(e) {
	return e !== !1;
}, xe = function() {
	return typeof window < "u";
}, Se = function(e) {
	return K(e) || ge(e);
}, Ce = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, we = Array.isArray, Te = /(?:-?\.?\d|\.)+/gi, Ee = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, De = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, Oe = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, ke = /[+-]=-?[.\d]+/, Ae = /[^,'"\[\]\s]+/gi, je = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, Me, Ne, Pe, Fe, Ie = {}, Le = {}, Re, ze = function(e) {
	return (Le = gt(e, Ie)) && Lr;
}, Be = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, Ve = function(e, t) {
	return !t && console.warn(e);
}, He = function(e, t) {
	return e && (Ie[e] = t) && Le && (Le[e] = t) || Ie;
}, Ue = function() {
	return 0;
}, We = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, Ge = {
	suppressEvents: !0,
	kill: !1
}, Ke = { suppressEvents: !0 }, qe = {}, Je = [], Ye = {}, Xe, Ze = {}, Qe = {}, $e = 30, et = [], tt = "", nt = function(e) {
	var t = e[0], n, r;
	if (ye(t) || K(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = et.length; r-- && !et[r].targetTest(t););
		n = et[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new qn(e[r], n))) || e.splice(r, 1);
	return e;
}, rt = function(e) {
	return e._gsap || nt($t(e))[0]._gsap;
}, it = function(e, t, n) {
	return (n = e[t]) && K(n) ? e[t]() : ve(n) && e.getAttribute && e.getAttribute(t) || n;
}, at = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, ot = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, st = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, ct = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, lt = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, ut = function() {
	var e = Je.length, t = Je.slice(0), n, r;
	for (Ye = {}, Je.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, dt = function(e, t, n, r) {
	Je.length && !le && ut(), e.render(t, n, r || le && t < 0 && (e._initted || e._startAt)), Je.length && !le && ut();
}, ft = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(Ae).length < 2 ? t : ge(e) ? e.trim() : e;
}, pt = function(e) {
	return e;
}, mt = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, ht = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, gt = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, _t = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = ye(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, vt = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, yt = function(e) {
	var t = e.parent || Me, n = e.keyframes ? ht(we(e.keyframes)) : mt;
	if (be(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, bt = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, xt = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, St = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, Ct = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, wt = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, Tt = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, Et = function(e, t, n, r) {
	return e._startAt && (le ? e._startAt.revert(Ge) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, Dt = function e(t) {
	return !t || t._ts && e(t.parent);
}, Ot = function(e) {
	return e._repeat ? kt(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, kt = function(e, t) {
	var n = Math.floor(e = st(e / t));
	return e && n === e ? n - 1 : n;
}, At = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, jt = function(e) {
	return e._end = st(e._start + (e._tDur / Math.abs(e._ts || e._rts || W) || 0));
}, Mt = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = st(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), jt(e), n._dirty || wt(n, e)), e;
}, Nt = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = At(e.rawTime(), t), (!t._dur || qt(0, t.totalDuration(), n) - t._tTime > W) && t.render(n, !0)), wt(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -W;
	}
}, Pt = function(e, t, n, r) {
	return t.parent && Ct(t), t._start = st((_e(n) ? n : n || e !== Me ? Wt(e, n, t) : e._time) + t._delay), t._end = st(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), xt(e, t, "_first", "_last", e._sort ? "_start" : 0), Rt(t) || (e._recent = t), r || Nt(e, t), e._ts < 0 && Mt(e, e._tTime), e;
}, Ft = function(e, t) {
	return (Ie.ScrollTrigger || Be("scrollTrigger", t)) && Ie.ScrollTrigger.create(t, e);
}, It = function(e, t, n, r, i) {
	if (nr(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !le && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && Xe !== Mn.frame) return Je.push(e), e._lazy = [i, r], 1;
}, Lt = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, Rt = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, zt = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && Lt(e) && !(!e._initted && Rt(e)) || (e._ts < 0 || e._dp._ts < 0) && !Rt(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = qt(0, e._tDur, t), l = kt(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== kt(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || le || r || e._zTime === W || !t && e._zTime) {
		if (!e._initted && It(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? W : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && Et(e, t, n, !0), e._onUpdate && !n && _n(e, "onUpdate"), s && e._repeat && !n && e.parent && _n(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && Ct(e, 1), !n && !le && (_n(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, Bt = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, Vt = function(e, t, n, r) {
	var i = e._repeat, a = st(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : st(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && Mt(e, e._tTime = e._tDur * o), e.parent && jt(e), n || wt(e.parent, e), e;
}, Ht = function(e) {
	return e instanceof Yn ? wt(e) : Vt(e, e._dur);
}, Ut = {
	_start: 0,
	endTime: Ue,
	totalDuration: Ue
}, Wt = function e(t, n, r) {
	var i = t.labels, a = t._recent || Ut, o = t.duration() >= ue ? a.endTime(!1) : t._dur, s, c, l;
	return ge(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (we(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, Gt = function(e, t, n) {
	var r = _e(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = be(s.vars.inherit) && s.parent;
		a.immediateRender = be(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new lr(t[0], a, t[i + 1]);
}, Kt = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, qt = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, Jt = function(e, t) {
	return !ge(e) || !(t = je.exec(e)) ? "" : t[1];
}, Yt = function(e, t, n) {
	return Kt(n, function(n) {
		return qt(e, t, n);
	});
}, Xt = [].slice, Zt = function(e, t) {
	return e && ye(e) && "length" in e && (!t && !e.length || e.length - 1 in e && ye(e[0])) && !e.nodeType && e !== Ne;
}, Qt = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return ge(e) && !t || Zt(e, 1) ? (r = n).push.apply(r, $t(e)) : n.push(e);
	}) || n;
}, $t = function(e, t, n) {
	return U && !t && U.selector ? U.selector(e) : ge(e) && !n && (Pe || !Nn()) ? Xt.call((t || Fe).querySelectorAll(e), 0) : we(e) ? Qt(e, n) : Zt(e) ? Xt.call(e, 0) : e ? [e] : [];
}, en = function(e) {
	return e = $t(e)[0] || Ve("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return $t(t, n.querySelectorAll ? n : n === e ? Ve("Invalid scope") || Fe.createElement("div") : e);
	};
}, tn = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, nn = function(e) {
	if (K(e)) return e;
	var t = ye(e) ? e : { each: e }, n = Hn(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return ge(r) ? l = u = {
		center: .5,
		edges: .5,
		end: 1
	}[r] || 0 : !o && s && (l = r[0], u = r[1]), function(e, o, d) {
		var f = (d || t).length, p = a[f], m, h, g, _, v, y, b, x, S;
		if (!p) {
			if (S = t.grid === "auto" ? 0 : (t.grid || [1, ue])[1], !S) {
				for (b = -ue; b < (b = d[S++].getBoundingClientRect().left) && S < f;);
				S < f && S--;
			}
			for (p = a[f] = [], m = s ? Math.min(S, f) * l - .5 : r % S, h = S === ue ? 0 : s ? f * u / S - .5 : r / S | 0, b = 0, x = ue, y = 0; y < f; y++) g = y % S - m, _ = h - (y / S | 0), p[y] = v = c ? Math.abs(c === "y" ? _ : g) : pe(g * g + _ * _), v > b && (b = v), v < x && (x = v);
			r === "random" && tn(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = Jt(t.amount || t.each) || 0, n = n && f < 0 ? Bn(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, st(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, rn = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = st(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (_e(n) ? 0 : Jt(n));
	};
}, an = function(e, t) {
	var n = we(e), r, i;
	return !n && ye(e) && (r = n = e.radius || ue, e.values ? (e = $t(e.values), (i = !_e(e[0])) && (r *= r)) : e = rn(e.increment)), Kt(t, n ? K(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = ue, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || _e(t) ? s : s + Jt(t);
	} : rn(e));
}, on = function(e, t, n, r) {
	return Kt(we(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return we(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, sn = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, cn = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || Jt(n));
	};
}, ln = function(e, t, n) {
	return mn(e, t, 0, 1, n);
}, un = function(e, t, n) {
	return Kt(n, function(n) {
		return e[~~t(n)];
	});
}, dn = function e(t, n, r) {
	var i = n - t;
	return we(t) ? un(t, e(0, t.length), n) : Kt(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, fn = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return we(t) ? un(t, e(0, t.length - 1), n) : Kt(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, pn = function(e) {
	for (var t = 0, n = "", r, i, a, o; ~(r = e.indexOf("random(", t));) a = e.indexOf(")", r), o = e.charAt(r + 7) === "[", i = e.substr(r + 7, a - r - 7).match(o ? Ae : Te), n += e.substr(t, r - t) + on(o ? i : +i[0], o ? 0 : +i[1], +i[2] || 1e-5), t = a + 1;
	return n + e.substr(t, e.length - t);
}, mn = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return Kt(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, hn = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = ge(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (we(t) && !we(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = gt(we(t) ? [] : {}, t));
		if (!u) {
			for (c in n) Zn.call(s, t, c, "get", n[c]);
			a = function(e) {
				return vr(e, s) || (o ? t.p : t);
			};
		}
	}
	return Kt(r, a);
}, gn = function(e, t, n) {
	var r = e.labels, i = ue, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, _n = function(e, t, n) {
	var r = e.vars, i = r[t], a = U, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && Je.length && ut(), o && (U = o), l = s ? i.apply(c, s) : i.call(c), U = a, l;
}, vn = function(e) {
	return Ct(e), e.scrollTrigger && e.scrollTrigger.kill(!!le), e.progress() < 1 && _n(e, "onInterrupt"), e;
}, yn, bn = [], xn = function(e) {
	if (e) if (e = !e.name && e.default || e, xe() || e.headless) {
		var t = e.name, n = K(e), r = t && !n && e.init ? function() {
			this._props = [];
		} : e, i = {
			init: Ue,
			render: vr,
			add: Zn,
			kill: br,
			modifier: yr,
			rawVars: 0
		}, a = {
			targetTest: 0,
			get: 0,
			getSetter: mr,
			aliases: {},
			register: 0
		};
		if (Nn(), e !== r) {
			if (Ze[t]) return;
			mt(r, mt(vt(e, i), a)), gt(r.prototype, gt(i, vt(e, a))), Ze[r.prop = t] = r, e.targetTest && (et.push(r), qe[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
		}
		He(t, r), e.register && e.register(Lr, r, Cr);
	} else bn.push(e);
}, Sn = 255, Cn = {
	aqua: [
		0,
		Sn,
		Sn
	],
	lime: [
		0,
		Sn,
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
		Sn
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		Sn,
		Sn,
		Sn
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		Sn,
		Sn,
		0
	],
	orange: [
		Sn,
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
		Sn,
		0,
		0
	],
	pink: [
		Sn,
		192,
		203
	],
	cyan: [
		0,
		Sn,
		Sn
	],
	transparent: [
		Sn,
		Sn,
		Sn,
		0
	]
}, wn = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * Sn + .5 | 0;
}, Tn = function(e, t, n) {
	var r = e ? _e(e) ? [
		e >> 16,
		e >> 8 & Sn,
		e & Sn
	] : 0 : Cn.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), Cn[e]) r = Cn[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & Sn,
				r & Sn,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & Sn,
				e & Sn
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(Te), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = wn(s + 1 / 3, i, a), r[1] = wn(s, i, a), r[2] = wn(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(Ee), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(Te) || Cn.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / Sn, a = r[1] / Sn, o = r[2] / Sn, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, En = function(e) {
	var t = [], n = [], r = -1;
	return e.split(On).forEach(function(e) {
		var i = e.match(De) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, Dn = function(e, t, n) {
	var r = "", i = (e + r).match(On), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = Tn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = En(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(On, "1").split(De), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(On), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, On = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in Cn) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), kn = /hsl[a]?\(/, An = function(e) {
	var t = e.join(" "), n;
	if (On.lastIndex = 0, On.test(t)) return n = kn.test(t), e[1] = Dn(e[1], n), e[0] = Dn(e[0], n, En(e[1])), !0;
}, jn, Mn = function() {
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
			Re && (!Pe && xe() && (Ne = Pe = window, Fe = Ne.document || {}, Ie.gsap = Lr, (Ne.gsapVersions ||= []).push(Lr.version), ze(Le || Ne.GreenSockGlobals || !Ne.gsap && Ne || {}), bn.forEach(xn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, jn = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), jn = 0, l = Ue;
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
			return d.remove(e), s[n ? "unshift" : "push"](r), Nn(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), Nn = function() {
	return !jn && Mn.wake();
}, Pn = {}, Fn = /^[\d.\-M][\d.\-,\s]/, In = /["']/g, Ln = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(In, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, Rn = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, zn = function(e) {
	var t = (e + "").split("("), n = Pn[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [Ln(t[1])] : Rn(e).split(",").map(ft)) : Pn._CE && Fn.test(e) ? Pn._CE("", e) : n;
}, Bn = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, Vn = function e(t, n) {
	for (var r = t._first, i; r;) r instanceof Yn ? e(r, n) : r.vars.yoyoEase && (!r._yoyo || !r._repeat) && r._yoyo !== n && (r.timeline ? e(r.timeline, n) : (i = r._ease, r._ease = r._yEase, r._yEase = i, r._yoyo = n)), r = r._next;
}, Hn = function(e, t) {
	return e && (K(e) ? e : Pn[e] || zn(e)) || t;
}, Un = function(e, t, n, r) {
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
	return at(e, function(e) {
		for (var t in Pn[e] = Ie[e] = i, Pn[a = e.toLowerCase()] = n, i) Pn[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = Pn[e + "." + t] = i[t];
	}), i;
}, Wn = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, Gn = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / de * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * he((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : Wn(s);
	return a = de / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, Kn = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : Wn(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
at("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	Un(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), Pn.Linear.easeNone = Pn.none = Pn.Linear.easeIn, Un("Elastic", Gn("in"), Gn("out"), Gn()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	Un("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), Un("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), Un("Circ", function(e) {
	return -(pe(1 - e * e) - 1);
}), Un("Sine", function(e) {
	return e === 1 ? 1 : -me(e * fe) + 1;
}), Un("Back", Kn("in"), Kn("out"), Kn()), Pn.SteppedEase = Pn.steps = Ie.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - W;
	return function(e) {
		return ((r * qt(0, a, e) | 0) + i) * n;
	};
} }, se.ease = Pn["quad.out"], at("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return tt += e + "," + e + "Params,";
});
var qn = function(e, t) {
	this.id = G++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : it, this.set = t ? t.getSetter : mr;
}, Jn = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, Vt(this, +e.duration, 1, 1), this.data = e.data, U && (this._ctx = U, U.data.push(this)), jn || Mn.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, Vt(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (Nn(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (Mt(this, e), !n._dp || n.parent || Nt(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && Pt(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === W || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), dt(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + Ot(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + Ot(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? kt(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -W ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? At(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -W ? 0 : this._rts, this.totalTime(qt(-Math.abs(this._delay), this._tDur, n), t !== !1), jt(this), Tt(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (Nn(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== W && (this._tTime -= W)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = e;
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && Pt(t, this, e - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (be(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? At(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = Ke);
		var t = le;
		return le = e, (this._initted || this._startAt) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), le = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, Ht(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, Ht(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(Wt(this, e), be(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, be(t)), this._dur || (this._zTime = -W), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -W : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -W, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - W);
	}, t.eventCallback = function(e, t, n) {
		var r = this.vars;
		return arguments.length > 1 ? (t ? (r[e] = t, n && (r[e + "Params"] = n), e === "onUpdate" && (this._onUpdate = t)) : delete r[e], this) : r[e];
	}, t.then = function(e) {
		var t = this;
		return new Promise(function(n) {
			var r = K(e) ? e : pt, i = function() {
				var e = t.then;
				t.then = null, K(r) && (r = r(t)) && (r.then || r === t) && (t.then = e), n(r), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? i() : t._prom = i;
		});
	}, t.kill = function() {
		vn(this);
	}, e;
}();
mt(Jn.prototype, {
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
	_zTime: -W,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var Yn = /*#__PURE__*/ function(e) {
	oe(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = be(t.sortChildren), Me && Pt(t.parent || Me, ae(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && Ft(ae(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return Gt(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return Gt(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return Gt(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, yt(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new lr(e, t, Wt(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return Pt(this, lr.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new lr(e, n, Wt(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, yt(n).immediateRender = be(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, yt(r).immediateRender = be(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : st(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== Me && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = st(o % f), o === i ? (d = this._repeat, c = a) : (_ = st(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = kt(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : st(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && _n(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
					Vn(this, y);
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = Bt(this, st(r), st(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && c && !t && !d && (_n(this, "onStart"), this._tTime !== o)) return this;
			if (c >= r && e >= 0) for (l = this._first; l;) {
				if (u = l._next, (l._act || c >= l._start) && l._ts && m !== l) {
					if (l.parent !== this) return this.render(e, t, n);
					if (l.render(l._ts > 0 ? (c - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (c - l._start) * l._ts, t, n), c !== this._time || !this._ts && !p) {
						m = 0, u && (o += this._zTime = -W);
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
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || le && (l._initted || l._startAt)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -W : W);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -W)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, jt(this), this.render(e, t, n);
			this._onUpdate && !t && _n(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && Ct(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (_n(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (_e(t) || (t = Wt(this, t, e)), !(e instanceof Jn)) {
			if (we(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (ge(e)) return this.addLabel(e, t);
			if (K(e)) e = lr.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : Pt(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -ue);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof lr ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return ge(e) ? this.removeLabel(e) : K(e) ? this.killTweensOf(e) : (e.parent === this && St(this, e), e === this._recent && (this._recent = this._last), wt(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = st(Mn.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = Wt(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = lr.delayedCall(0, t || Ue, n);
		return r.data = "isPause", this._hasPause = 1, Pt(this, r, Wt(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = Wt(this, e); t;) t._start === e && t.data === "isPause" && Ct(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) er !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = $t(e), i = this._first, a = _e(t), o; i;) i instanceof lr ? lt(i._targets, r) && (a ? (!er || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = Wt(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = lr.to(n, mt({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || W,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && Vt(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, mt({ startAt: { time: Wt(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), gn(this, Wt(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), gn(this, Wt(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + W);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		for (var r = this._first, i = this.labels, a; r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return wt(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), wt(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = ue, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, Pt(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += o / n._ts, n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			Vt(n, n === Me && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (Me._ts && (dt(Me, At(e, Me)), Xe = Mn.frame), Mn.frame >= $e) {
			$e += H.autoSleep || 120;
			var t = Me._first;
			if ((!t || !t._ts) && H.autoSleep && Mn._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || Mn.sleep();
			}
		}
	}, t;
}(Jn);
mt(Yn.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var Xn = function(e, t, n, r, i, a, o) {
	var s = new Cr(this._pt, e, t, 0, 1, _r, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = pn(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(Oe) || []; u = Oe.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? ct(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = Oe.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (ke.test(r) || g) && (s.e = 0), this._pt = s, s;
}, Zn = function(e, t, n, r, i, a, o, s, c, l) {
	K(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? K(u) ? c ? e[t.indexOf("set") || !K(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = K(u) ? c ? fr : dr : ur, p;
	if (ge(r) && (~r.indexOf("random(") && (r = pn(r)), r.charAt(1) === "=" && (p = ct(d, r) + (Jt(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || tr) return !isNaN(d * r) && r !== "" ? (p = new Cr(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? gr : hr, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && Be(t, r), Xn.call(this, e, t, d, r, f, s || H.stringFilter, c));
}, Qn = function(e, t, n, r, i) {
	if (K(e) && (e = or(e, i, t, n, r)), !ye(e) || e.style && e.nodeType || we(e) || Ce(e)) return ge(e) ? or(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = or(e[o], i, t, n, r);
	return a;
}, $n = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (Ze[e] && (o = new Ze[e]()).init(i, o.rawVars ? t[e] : Qn(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new Cr(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== yn)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, er, tr, nr = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !ce, b = t.timeline, x, S, C, w, T, E, D, O, k, A, j, M, N;
	if (b && (!f || !a) && (a = "none"), t._ease = Hn(a, se.ease), t._yEase = d ? Bn(Hn(d === !0 ? a : d, se.ease)) : 0, d && t._yoyo && !t._repeat && (d = t._yEase, t._yEase = t._ease, t._ease = d), t._from = !b && !!i.runBackwards, !b || f && !i.stagger) {
		if (O = g[0] ? rt(g[0]).harness : 0, M = O && i[O.prop], x = vt(i, qe), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? Ge : We), h._lazy = 0), o) {
			if (Ct(t._startAt = lr.set(g, mt({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && be(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return _n(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (le || !s && !p) && t._startAt.revert(Ge), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), C = mt({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && be(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, x), M && (C[O.prop] = M), Ct(t._startAt = lr.set(g, C)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (le ? t._startAt.revert(Ge) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, W, W);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && be(c) || c && !m, S = 0; S < g.length; S++) {
			if (T = g[S], D = T._gsap || nt(g)[S]._gsap, t._ptLookup[S] = A = {}, Ye[D.id] && Je.length && ut(), j = v === g ? S : v.indexOf(T), O && (k = new O()).init(T, M || x, t, j, v) !== !1 && (t._pt = w = new Cr(t._pt, T, k.name, 0, 1, k.render, k, 0, k.priority), k._props.forEach(function(e) {
				A[e] = w;
			}), k.priority && (E = 1)), !O || M) for (C in x) Ze[C] && (k = $n(C, x, t, j, T, v)) ? k.priority && (E = 1) : A[C] = w = Zn.call(t, T, C, "get", x[C], j, v, 0, i.stringFilter);
			t._op && t._op[S] && t.kill(T, t._op[S]), y && t._pt && (er = t, Me.killTweensOf(T, A, t.globalTime(n)), N = !t.parent, er = 0), t._pt && c && (Ye[D.id] = 1);
		}
		E && Sr(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !N, f && n <= 0 && b.render(ue, !0, !0);
}, rr = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return tr = 1, e.vars[t] = "+=0", nr(e, o), tr = 0, s ? Ve(t + " not eligible for reset") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e &&= ot(n) + Jt(u.e), u.b &&= l.s + Jt(u.b);
}, ir = function(e, t) {
	var n = e[0] ? rt(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = gt({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, ar = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (we(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
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
}, or = function(e, t, n, r, i) {
	return K(e) ? e.call(t, n, r, i) : ge(e) && ~e.indexOf("random(") ? pn(e) : e;
}, sr = tt + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", cr = {};
at(sr + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return cr[e] = 1;
});
var lr = /*#__PURE__*/ function(e) {
	oe(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : yt(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = o.yoyoEase, g = n.parent || Me, _ = (we(t) || Ce(t) ? _e(t[0]) : "length" in n) ? [t] : $t(t), v, y, b, x, S, C, w, T;
		if (a._targets = _.length ? nt(_) : Ve("GSAP target " + t + " not found. https://gsap.com", !H.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || Se(s) || Se(c)) {
			if (n = a.vars, v = a.timeline = new Yn({
				data: "nested",
				defaults: p || {},
				targets: g && g.data === "nested" ? g.vars.targets : _
			}), v.kill(), v.parent = v._dp = ae(a), v._start = 0, u || Se(s) || Se(c)) {
				if (x = _.length, w = u && nn(u), ye(u)) for (S in u) ~sr.indexOf(S) && (T ||= {}, T[S] = u[S]);
				for (y = 0; y < x; y++) b = vt(n, cr), b.stagger = 0, h && (b.yoyoEase = h), T && gt(b, T), C = _[y], b.duration = +or(s, ae(a), y, C, _), b.delay = (+or(c, ae(a), y, C, _) || 0) - a._delay, !u && x === 1 && b.delay && (a._delay = c = b.delay, a._start += c, b.delay = 0), v.to(C, b, w ? w(y, C, _) : 0), v._ease = Pn.none;
				v.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				yt(mt(v.vars.defaults, { ease: "none" })), v._ease = Hn(f.ease || n.ease || "none");
				var E = 0, D, O, k;
				if (we(f)) f.forEach(function(e) {
					return v.to(_, e, ">");
				}), v.duration();
				else {
					for (S in b = {}, f) S === "ease" || S === "easeEach" || ar(S, f[S], b, f.easeEach);
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
		return d === !0 && !ce && (er = ae(a), Me.killTweensOf(_), er = 0), Pt(g, ae(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === st(g._time) && be(l) && Dt(ae(a)) && g.data !== "nested") && (a._tTime = -W, a.render(Math.max(0, -c) || 0)), m && Ft(ae(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - W && !o ? i : e < W ? 0 : e, c, l, u, d, f, p, m, h, g;
		if (!a) zt(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = st(s % d), s === i ? (u = this._repeat, c = a) : (f = st(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (g = this._yEase, c = a - c), f = kt(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && (h && this._yEase && Vn(h, p), this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(st(d * u), !0).invalidate()._lock = 0));
			}
			if (!this._initted) {
				if (It(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
				if (r !== this._time && !(n && this.vars.repeatRefresh && u !== f)) return this;
				if (a !== this._dur) return this.render(e, t, n);
			}
			if (this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), this.ratio = m = (g || this._ease)(c / a), this._from && (this.ratio = m = 1 - m), c && !r && !t && !u && (_n(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && Et(this, e, t, n), _n(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && _n(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && Et(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && Ct(this, 1), !t && !(o && !r) && (s || r || p) && (_n(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		jn || Mn.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || nr(this, a), o = this._ease(a / this._dur), rr(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (Mt(this, 0), this.parent || xt(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? vn(this) : this.scrollTrigger && this.scrollTrigger.kill(!!le), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, er && er.vars.overwrite !== !0)._first || vn(this), this.parent && n !== this.timeline.totalDuration() && Vt(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? $t(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && bt(r, i)) return t === "all" && (this._pt = 0), vn(this);
		for (s = this._op = this._op || [], t !== "all" && (ge(t) && (d = {}, at(t, function(e) {
			return d[e] = 1;
		}), t = d), t = ir(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && St(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && vn(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return Gt(1, arguments);
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
		return Gt(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return Me.killTweensOf(e, t, n);
	}, t;
}(Jn);
mt(lr.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), at("staggerTo,staggerFrom,staggerFromTo", function(e) {
	lr[e] = function() {
		var t = new Yn(), n = Xt.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var ur = function(e, t, n) {
	return e[t] = n;
}, dr = function(e, t, n) {
	return e[t](n);
}, fr = function(e, t, n, r) {
	return e[t](r.fp, n);
}, pr = function(e, t, n) {
	return e.setAttribute(t, n);
}, mr = function(e, t) {
	return K(e[t]) ? dr : ve(e[t]) && e.setAttribute ? pr : ur;
}, hr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, gr = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, _r = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, vr = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, yr = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, br = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? St(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, xr = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, Sr = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, Cr = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || hr, this.d = o || this, this.set = s || ur, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = xr, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
at(tt + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(e) {
	return qe[e] = 1;
}), Ie.TweenMax = Ie.TweenLite = lr, Ie.TimelineLite = Ie.TimelineMax = Yn, Me = new Yn({
	sortChildren: !1,
	defaults: se,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), H.stringFilter = An;
var wr = [], Tr = {}, Er = [], Dr = 0, Or = 0, kr = function(e) {
	return (Tr[e] || Er).map(function(e) {
		return e();
	});
}, Ar = function() {
	var e = Date.now(), t = [];
	e - Dr > 2 && (kr("matchMediaInit"), wr.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = Ne.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), kr("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), Dr = e, kr("matchMedia"));
}, jr = /*#__PURE__*/ function() {
	function e(e, t) {
		this.selector = t && en(t), this.data = [], this._r = [], this.isReverted = !1, this.id = Or++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		K(e) && (n = t, t = e, e = K);
		var r = this, i = function() {
			var e = U, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = en(n)), U = r, a = t.apply(r, arguments), K(a) && r._r.push(a), U = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === K ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = U;
		U = null, e(this), U = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof lr && !(n.parent && n.parent.data === "nested") && t.push(n);
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
			}), r = n.data.length; r--;) i = n.data[r], i instanceof Yn ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof lr) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = wr.length; r--;) wr[r].id === this.id && wr.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), Mr = /*#__PURE__*/ function() {
	function e(e) {
		this.contexts = [], this.scope = e, U && U.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		ye(e) || (e = { matches: e });
		var r = new jr(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in U && !r.selector && (r.selector = U.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = Ne.matchMedia(e[o]), a && (wr.indexOf(r) < 0 && wr.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(Ar) : a.addEventListener("change", Ar)));
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
}(), Nr = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return xn(e);
		});
	},
	timeline: function(e) {
		return new Yn(e);
	},
	getTweensOf: function(e, t) {
		return Me.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		ge(e) && (e = $t(e)[0]);
		var i = rt(e || {}).get, a = n ? pt : ft;
		return n === "native" && (n = ""), e && (t ? a((Ze[t] && Ze[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((Ze[t] && Ze[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = $t(e), e.length > 1) {
			var r = e.map(function(e) {
				return Lr.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = Ze[t], o = rt(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			yn._pt = 0, r.init(e, n ? t + n : t, yn, 0, [e]), r.render(1, r), yn._pt && vr(1, yn);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = Lr.to(e, mt((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return Me.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = Hn(e.ease, se.ease)), _t(se, e || {});
	},
	config: function(e) {
		return _t(H, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !Ze[e] && !Ie[e] && Ve(t + " effect requires " + e + " plugin.");
		}), Qe[t] = function(e, t, r) {
			return n($t(e), mt(t || {}, i), r);
		}, a && (Yn.prototype[t] = function(e, n, r) {
			return this.add(Qe[t](e, ye(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		Pn[e] = Hn(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? Hn(e, t) : Pn;
	},
	getById: function(e) {
		return Me.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new Yn(e), r, i;
		for (n.smoothChildTiming = be(e.smoothChildTiming), Me.remove(n), n._dp = 0, n._time = n._tTime = Me._time, r = Me._first; r;) i = r._next, (t || !(!r._dur && r instanceof lr && r.vars.onComplete === r._targets[0])) && Pt(n, r, r._start - r._delay), r = i;
		return Pt(Me, n, 0), n;
	},
	context: function(e, t) {
		return e ? new jr(e, t) : U;
	},
	matchMedia: function(e) {
		return new Mr(e);
	},
	matchMediaRefresh: function() {
		return wr.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || Ar();
	},
	addEventListener: function(e, t) {
		var n = Tr[e] || (Tr[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = Tr[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: dn,
		wrapYoyo: fn,
		distribute: nn,
		random: on,
		snap: an,
		normalize: ln,
		getUnit: Jt,
		clamp: Yt,
		splitColor: Tn,
		toArray: $t,
		selector: en,
		mapRange: mn,
		pipe: sn,
		unitize: cn,
		interpolate: hn,
		shuffle: tn
	},
	install: ze,
	effects: Qe,
	ticker: Mn,
	updateRoot: Yn.updateRoot,
	plugins: Ze,
	globalTimeline: Me,
	core: {
		PropTween: Cr,
		globals: He,
		Tween: lr,
		Timeline: Yn,
		Animation: Jn,
		getCache: rt,
		_removeLinkedListItem: St,
		reverting: function() {
			return le;
		},
		context: function(e) {
			return e && U && (U.data.push(e), e._ctx = U), U;
		},
		suppressOverwrites: function(e) {
			return ce = e;
		}
	}
};
at("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return Nr[e] = lr[e];
}), Mn.add(Yn.updateRoot), yn = Nr.to({}, { duration: 0 });
var Pr = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, Fr = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = Pr(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, Ir = function(e, t) {
	return {
		name: e,
		rawVars: 1,
		init: function(e, n, r) {
			r._onInit = function(e) {
				var r, i;
				if (ge(n) && (r = {}, at(n, function(e) {
					return r[e] = 1;
				}), n = r), t) {
					for (i in r = {}, n) r[i] = t(n[i]);
					n = r;
				}
				Fr(e, n);
			};
		}
	};
}, Lr = Nr.registerPlugin({
	name: "attr",
	init: function(e, t, n, r, i) {
		var a, o, s;
		for (a in this.tween = n, t) s = e.getAttribute(a) || "", o = this.add(e, "setAttribute", (s || 0) + "", t[a], r, i, 0, 0, a), o.op = a, o.b = s, this._props.push(a);
	},
	render: function(e, t) {
		for (var n = t._pt; n;) le ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, Ir("roundProps", rn), Ir("modifiers"), Ir("snap", an)) || Nr;
lr.version = Yn.version = Lr.version = "3.12.7", Re = 1, xe() && Nn(), Pn.Power0, Pn.Power1, Pn.Power2, Pn.Power3, Pn.Power4, Pn.Linear, Pn.Quad, Pn.Cubic, Pn.Quart, Pn.Quint, Pn.Strong, Pn.Elastic, Pn.Back, Pn.SteppedEase, Pn.Bounce, Pn.Sine, Pn.Expo, Pn.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var Rr, zr, Br, Vr, Hr, Ur, Wr, Gr = function() {
	return typeof window < "u";
}, Kr = {}, qr = 180 / Math.PI, Jr = Math.PI / 180, Yr = Math.atan2, Xr = 1e8, Zr = /([A-Z])/g, Qr = /(left|right|width|margin|padding|x)/i, $r = /[\s,\(]\S/, ei = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, ti = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, ni = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, ri = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, ii = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, ai = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, oi = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, si = function(e, t, n) {
	return e.style[t] = n;
}, ci = function(e, t, n) {
	return e.style.setProperty(t, n);
}, li = function(e, t, n) {
	return e._gsap[t] = n;
}, ui = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, di = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, fi = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, pi = "transform", mi = pi + "Origin", hi = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in Kr && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = ei[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = Ni(i, e);
		}) : this.tfm[t] = o.x ? o[t] : Ni(i, t), t === mi && (this.tfm.zOrigin = o.zOrigin);
		else return ei.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(pi) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(mi, n, "")), t = pi;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, gi = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, _i = function() {
	var e = this.props, t = this.target, n = t.style, r = t._gsap, i, a;
	for (i = 0; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(Zr, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = Wr(), (!i || !i.isStart) && !n[pi] && (gi(n), r.zOrigin && n[mi] && (n[mi] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, vi = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: _i,
		save: hi
	};
	return e._gsap || Lr.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, yi, bi = function(e, t) {
	var n = zr.createElementNS ? zr.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : zr.createElement(e);
	return n && n.style ? n : zr.createElement(e);
}, xi = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(Zr, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, Ci(n) || n, 1) || "";
}, Si = "O,Moz,ms,Ms,Webkit".split(","), Ci = function(e, t, n) {
	var r = (t || Hr).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(Si[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? Si[i] : "") + e;
}, wi = function() {
	Gr() && window.document && (Rr = window, zr = Rr.document, Br = zr.documentElement, Hr = bi("div") || { style: {} }, bi("div"), pi = Ci(pi), mi = pi + "Origin", Hr.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", yi = !!Ci("perspective"), Wr = Lr.core.reverting, Vr = 1);
}, Ti = function(e) {
	var t = e.ownerSVGElement, n = bi("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), Br.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), Br.removeChild(n), i;
}, Ei = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, q = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = Ti(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = Ti(e)), t && !t.width && !t.x && !t.y ? {
		x: +Ei(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +Ei(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, Di = function(e) {
	return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && q(e));
}, Oi = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in Kr && t !== mi && (t = pi), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(Zr, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, ki = function(e, t, n, r, i, a) {
	var o = new Cr(e._pt, t, n, 0, 1, a ? oi : ai);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, Ai = {
	deg: 1,
	rad: 1,
	turn: 1
}, ji = {
	grid: 1,
	flex: 1
}, Mi = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = Hr.style, c = Qr.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || Ai[i] || Ai[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && Di(t), (p || o === "%") && (Kr[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], ot(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === zr || !h.appendChild) && (h = zr.body), g = h._gsap, g && p && g.width && c && g.time === Mn.time && !g.uncache) return ot(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : Oi(t, n);
	} else (p || o === "%") && !ji[xi(h, "display")] && (s.position = xi(t, "position")), h === t && (s.position = "static"), h.appendChild(Hr), m = Hr[u], h.removeChild(Hr), s.position = "absolute";
	return c && p && (g = rt(h), g.time = Mn.time, g.width = h[u]), ot(f ? m * a / d : m && a ? d / m * a : 0);
}, Ni = function(e, t, n, r) {
	var i;
	return Vr || wi(), t in ei && t !== "transform" && (t = ei[t], ~t.indexOf(",") && (t = t.split(",")[0])), Kr[t] && t !== "transform" ? (i = Gi(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : Ki(xi(e, mi)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = Ri[t] && Ri[t](e, t, n) || xi(e, t) || it(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? Mi(e, t, i, n) + n : i;
}, Pi = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = Ci(t, e, 1), a = i && xi(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = xi(e, "borderTopColor"));
	}
	var o = new Cr(this._pt, e.style, t, 0, 1, _r), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r === "auto" && (m = e.style[t], e.style[t] = r, r = xi(e, t) || r, m ? e.style[t] = m : Oi(e, t)), l = [n, r], An(l), n = l[0], r = l[1], d = n.match(De) || [], b = r.match(De) || [], b.length) {
		for (; u = De.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = ct(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = De.lastIndex - v.length, v || (v = v || H.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = Mi(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? oi : ai;
	return ke.test(r) && (o.e = 0), this._pt = o, o;
}, Fi = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, Ii = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = Fi[n] || n, t[1] = Fi[r] || r, t.join(" ");
}, Li = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], Kr[o] && (s = 1, o = o === "transformOrigin" ? mi : pi), Oi(n, o);
		s && (Oi(n, pi), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", Gi(n, 1), a.uncache = 1, gi(r)));
	}
}, Ri = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new Cr(e._pt, t, n, 0, 0, Li);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, zi = [
	1,
	0,
	0,
	1,
	0,
	0
], Bi = {}, Vi = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, Hi = function(e) {
	var t = xi(e, pi);
	return Vi(t) ? zi : t.substr(7).match(Ee).map(ot);
}, Ui = function(e, t) {
	var n = e._gsap || rt(e), r = e.style, i = Hi(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? zi : i) : (i === zi && !e.offsetParent && e !== Br && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, Br.appendChild(e)), i = Hi(e), s ? r.display = s : Oi(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : Br.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, Wi = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || Ui(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== zi && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = q(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[mi] = "0px 0px", a && (ki(a, o, "xOrigin", c, y), ki(a, o, "yOrigin", l, b), ki(a, o, "xOffset", u, o.xOffset), ki(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, Gi = function(e, t) {
	var n = e._gsap || new qn(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = xi(e, mi) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A, j, M, N, ee, P, F, I, te, ne, L;
	return n.svg = !!(e.getCTM && Di(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[pi] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[pi] === "none" ? "" : s[pi])), r.scale = r.rotate = r.translate = "none"), S = Ui(e, n.svg), n.svg && (n.uncache ? (N = e.getBBox(), c = n.xOrigin - N.x + "px " + (n.yOrigin - N.y) + "px", M = "") : M = !t && e.getAttribute("data-svg-origin"), Wi(e, M || c, !!M || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== zi && (E = S[0], D = S[1], O = S[2], k = S[3], l = A = S[4], u = j = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? Yr(D, E) * qr : 0, _ = O || k ? Yr(O, k) * qr + m : 0, _ && (p *= Math.abs(Math.cos(_ * Jr))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (L = S[6], te = S[7], P = S[8], F = S[9], I = S[10], ne = S[11], l = S[12], u = S[13], d = S[14], C = Yr(L, I), h = C * qr, C && (w = Math.cos(-C), T = Math.sin(-C), M = A * w + P * T, N = j * w + F * T, ee = L * w + I * T, P = A * -T + P * w, F = j * -T + F * w, I = L * -T + I * w, ne = te * -T + ne * w, A = M, j = N, L = ee), C = Yr(-O, I), g = C * qr, C && (w = Math.cos(-C), T = Math.sin(-C), M = E * w - P * T, N = D * w - F * T, ee = O * w - I * T, ne = k * T + ne * w, E = M, D = N, O = ee), C = Yr(D, E), m = C * qr, C && (w = Math.cos(C), T = Math.sin(C), M = E * w + D * T, N = A * w + j * T, D = D * w - E * T, j = j * w - A * T, E = M, A = N), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = ot(Math.sqrt(E * E + D * D + O * O)), p = ot(Math.sqrt(j * j + L * L)), C = Yr(A, j), _ = Math.abs(C) > 2e-4 ? C * qr : 0, y = ne ? 1 / (ne < 0 ? -ne : ne) : 0), n.svg && (M = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !Vi(xi(e, pi)), M && e.setAttribute("transform", M))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = ot(f), n.scaleY = ot(p), n.rotation = ot(m) + o, n.rotationX = ot(h) + o, n.rotationY = ot(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[mi] = Ki(c)), n.xOffset = n.yOffset = 0, n.force3D = H.force3D, n.renderTransform = n.svg ? $i : yi ? Qi : Ji, n.uncache = 0, n;
}, Ki = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, qi = function(e, t, n) {
	var r = Jt(t);
	return ot(parseFloat(t) + parseFloat(Mi(e, "x", n + "px", r))) + r;
}, Ji = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, Qi(e, t);
}, Yi = "0deg", Xi = "0px", Zi = ") ", Qi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== Yi || l !== Yi)) {
		var x = parseFloat(l) * Jr, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * Jr, w = Math.cos(x), a = qi(_, a, S * w * -v), o = qi(_, o, -Math.sin(x) * -v), s = qi(_, s, C * w * -v + v);
	}
	h !== Xi && (y += "perspective(" + h + Zi), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== Xi || o !== Xi || s !== Xi) && (y += s !== Xi || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + Zi), c !== Yi && (y += "rotate(" + c + Zi), l !== Yi && (y += "rotateY(" + l + Zi), u !== Yi && (y += "rotateX(" + u + Zi), (d !== Yi || f !== Yi) && (y += "skew(" + d + ", " + f + Zi), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + Zi), _.style[pi] = y || "translate(0, 0)";
}, $i = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= Jr, c *= Jr, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= Jr, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = ot(b), x = ot(x), S = ot(S), C = ot(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = Mi(f, "x", a, "px"), y = Mi(f, "y", o, "px")), (p || m || h || g) && (v = ot(v + p - (p * b + m * S) + h), y = ot(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = ot(v + r / 100 * w.width), y = ot(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[pi] = w);
}, ea = function(e, t, n, r, i) {
	var a = 360, o = ge(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? qr : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * Xr) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * Xr) % a - ~~(s / a) * a)), e._pt = u = new Cr(e._pt, t, n, r, s, ni), u.e = c, u.u = "deg", e._props.push(n), u;
}, ta = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, na = function(e, t, n) {
	var r = ta({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[pi] = t, o = Gi(n, 1), Oi(n, pi), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[pi], a[pi] = t, o = Gi(n, 1), a[pi] = c), Kr) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = Jt(c), p = Jt(l), u = f === p ? parseFloat(c) : Mi(n, s, c, p), d = parseFloat(l), e._pt = new Cr(e._pt, o, s, u, d - u, ti), e._pt.u = p || 0, e._props.push(s));
	ta(o, r);
};
at("padding,margin,Width,Radius", function(e, t) {
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
	Ri[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return Ni(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var ra = {
	name: "css",
	register: wi,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C;
		for (m in Vr || wi(), this.styles = this.styles || vi(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(Ze[m] && $n(m, t, n, r, e, i)))) {
			if (f = typeof l, p = Ri[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = pn(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", On.lastIndex = 0, On.test(c) || (h = Jt(c), g = Jt(l)), g ? h !== g && (c = Mi(e, m, c, g) + g) : h && (l += h), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], ge(c) && ~c.indexOf("random(") && (c = pn(c)), Jt(c + "") || c === "auto" || (c += H.units[m] || Jt(Ni(e, m)) || ""), (c + "").charAt(1) === "=" && (c = Ni(e, m))) : c = Ni(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in ei && (m === "autoAlpha" && (d === 1 && Ni(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), ki(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = ei[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Kr, v) {
					if (this.styles.save(m), y || (b = e._gsap, b.renderTransform && !t.parseTransform || Gi(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new Cr(this._pt, o, pi, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new Cr(this._pt, b, "scaleY", b.scaleY, (_ ? ct(b.scaleY, _ + u) : u) - b.scaleY || 0, ti), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(mi, 0, o[mi]), l = Ii(l), b.svg ? Wi(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && ki(this, b, "zOrigin", b.zOrigin, g), ki(this, o, m, Ki(c), Ki(l)));
						continue;
					} else if (m === "svgOrigin") {
						Wi(e, l, 1, x, 0, this);
						continue;
					} else if (m in Bi) {
						ea(this, b, m, d, _ ? ct(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						ki(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						na(this, l, e);
						continue;
					}
				} else m in o || (m = Ci(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !$r.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = Jt(l) || (m in H.units ? H.units[m] : h), h !== g && (d = Mi(e, m, c, g)), this._pt = new Cr(this._pt, v ? b : o, m, d, (_ ? ct(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? ii : ti), this._pt.u = g || 0, h !== g && g !== "%" && (this._pt.b = c, this._pt.r = ri);
				else if (m in o) Pi.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					Be(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && Sr(this);
	},
	render: function(e, t) {
		if (t.tween._time || !Wr()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: Ni,
	aliases: ei,
	getSetter: function(e, t, n) {
		var r = ei[t];
		return r && r.indexOf(",") < 0 && (t = r), t in Kr && t !== mi && (e._gsap.x || Ni(e, "x")) ? n && Ur === n ? t === "scale" ? ui : li : (Ur = n || {}) && (t === "scale" ? di : fi) : e.style && !ve(e.style[t]) ? si : ~t.indexOf("-") ? ci : mr(e, t);
	},
	core: {
		_removeProperty: Oi,
		_getMatrix: Ui
	}
};
Lr.utils.checkPrefix = Ci, Lr.core.getStyleSaver = vi, (function(e, t, n, r) {
	var i = at(e + "," + t + "," + n, function(e) {
		Kr[e] = 1;
	});
	at(t, function(e) {
		H.units[e] = "deg", Bi[e] = 1;
	}), ei[i[13]] = e + "," + t, at(r, function(e) {
		var t = e.split(":");
		ei[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), at("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	H.units[e] = "px";
}), Lr.registerPlugin(ra);
//#endregion
//#region node_modules/gsap/index.js
var J = Lr.registerPlugin(ra) || Lr;
J.core.Tween;
//#endregion
//#region src/table/animations/flip.ts
function ia(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function aa(e) {
	return {
		x: e.left + e.width / 2,
		y: e.top + e.height / 2
	};
}
function oa(e, t) {
	let n = aa(e), r = aa(t);
	return {
		x: n.x - r.x,
		y: n.y - r.y
	};
}
function sa(e, t) {
	let n = oa(t, e);
	return {
		x: n.x,
		y: n.y
	};
}
//#endregion
//#region node_modules/gsap/utils/paths.js
var ca = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, la = /(?:(-)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, ua = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/gi, da = /(^[#\.][a-z]|[a-y][a-z])/i, fa = Math.PI / 180, pa = 180 / Math.PI, ma = Math.sin, ha = Math.cos, ga = Math.abs, _a = Math.sqrt, va = Math.atan2, ya = 1e8, ba = function(e) {
	return typeof e == "string";
}, xa = function(e) {
	return typeof e == "number";
}, Sa = function(e) {
	return e === void 0;
}, Ca = {}, wa = {}, Ta = 1e5, Ea = function(e) {
	return Math.round((e + ya) % 1 * Ta) / Ta || (e < 0 ? 0 : 1);
}, Da = function(e) {
	return Math.round(e * Ta) / Ta || 0;
}, Oa = function(e) {
	return Math.round(e * 1e10) / 1e10 || 0;
}, ka = function(e, t, n, r) {
	var i = e[t], a = r === 1 ? 6 : Ga(i, n, r);
	if ((a || !r) && a + n + 2 < i.length) return e.splice(t, 0, i.slice(0, n + a + 2)), i.splice(0, n + a), 1;
}, Aa = function(e, t, n) {
	var r = e.length, i = ~~(n * r);
	if (e[i] > t) {
		for (; --i && e[i] > t;);
		i < 0 && (i = 0);
	} else for (; e[++i] < t && i < r;);
	return i < r ? i : r - 1;
}, ja = function(e, t) {
	var n = e.length;
	for (t || e.reverse(); n--;) e[n].reversed || Ia(e[n]);
}, Ma = function(e, t) {
	return t.totalLength = e.totalLength, e.samples ? (t.samples = e.samples.slice(0), t.lookup = e.lookup.slice(0), t.minLength = e.minLength, t.resolution = e.resolution) : e.totalPoints && (t.totalPoints = e.totalPoints), t;
}, Na = function(e, t) {
	var n = e.length, r = e[n - 1] || [], i = r.length;
	n && t[0] === r[i - 2] && t[1] === r[i - 1] && (t = r.concat(t.slice(2)), n--), e[n] = t;
};
function Pa(e) {
	e = ba(e) && da.test(e) && document.querySelector(e) || e;
	var t = e.getAttribute ? e : 0, n;
	return t && (e = e.getAttribute("d")) ? (t._gsPath ||= {}, n = t._gsPath[e], n && !n._dirty ? n : t._gsPath[e] = Xa(e)) : e ? ba(e) ? Xa(e) : xa(e[0]) ? [e] : e : console.warn("Expecting a <path> element or an SVG path data string");
}
function Fa(e) {
	for (var t = [], n = 0; n < e.length; n++) t[n] = Ma(e[n], e[n].slice(0));
	return Ma(e, t);
}
function Ia(e) {
	var t = 0, n;
	for (e.reverse(); t < e.length; t += 2) n = e[t], e[t] = e[t + 1], e[t + 1] = n;
	e.reversed = !e.reversed;
}
var La = function(e, t) {
	var n = document.createElementNS("http://www.w3.org/2000/svg", "path"), r = [].slice.call(e.attributes), i = r.length, a;
	for (t = "," + t + ","; --i > -1;) a = r[i].nodeName.toLowerCase(), t.indexOf("," + a + ",") < 0 && n.setAttributeNS(null, a, r[i].nodeValue);
	return n;
}, Ra = {
	rect: "rx,ry,x,y,width,height",
	circle: "r,cx,cy",
	ellipse: "rx,ry,cx,cy",
	line: "x1,x2,y1,y2"
}, za = function(e, t) {
	for (var n = t ? t.split(",") : [], r = {}, i = n.length; --i > -1;) r[n[i]] = +e.getAttribute(n[i]) || 0;
	return r;
};
function Ba(e, t) {
	var n = e.tagName.toLowerCase(), r = .552284749831, i, a, o, s, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T;
	return n === "path" || !e.getBBox ? e : (l = La(e, "x,y,width,height,cx,cy,rx,ry,r,x1,x2,y1,y2,points"), T = za(e, Ra[n]), n === "rect" ? (s = T.rx, c = T.ry || s, a = T.x, o = T.y, p = T.width - s * 2, m = T.height - c * 2, s || c ? (h = a + s * (1 - r), g = a + s, _ = g + p, v = _ + s * r, y = _ + s, b = o + c * (1 - r), x = o + c, S = x + m, C = S + c * r, w = S + c, i = "M" + y + "," + x + " V" + S + " C" + [
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
	].join(",") + "z") : n === "line" ? i = "M" + T.x1 + "," + T.y1 + " L" + T.x2 + "," + T.y2 : (n === "polyline" || n === "polygon") && (f = (e.getAttribute("points") + "").match(la) || [], a = f.shift(), o = f.shift(), i = "M" + a + "," + o + " L" + f.join(","), n === "polygon" && (i += "," + a + "," + o + "z")), l.setAttribute("d", $a(l._gsRawPath = Xa(i))), t && e.parentNode && (e.parentNode.insertBefore(l, e), e.parentNode.removeChild(e)), l);
}
function Va(e, t, n) {
	var r = e[t], i = e[t + 2], a = e[t + 4], o;
	return r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, o = i + (a + (e[t + 6] - a) * n - i) * n - r, r = e[t + 1], i = e[t + 3], a = e[t + 5], r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, Da(va(i + (a + (e[t + 7] - a) * n - i) * n - r, o) * pa);
}
function Ha(e, t, n) {
	n = Sa(n) ? 1 : Oa(n) || 0, t = Oa(t) || 0;
	var r = Math.max(0, ~~(ga(n - t) - 1e-8)), i = Fa(e);
	if (t > n && (t = 1 - t, n = 1 - n, ja(i), i.totalLength = 0), t < 0 || n < 0) {
		var a = Math.abs(~~Math.min(t, n)) + 1;
		t += a, n += a;
	}
	i.totalLength || Wa(i);
	var o = n > 1, s = Ka(i, t, Ca, !0), c = Ka(i, n, wa), l = c.segment, u = s.segment, d = c.segIndex, f = s.segIndex, p = c.i, m = s.i, h = f === d, g = p === m && h, _, v, y, b, x, S, C, w;
	if (o || r) {
		for (_ = d < f || h && p < m || g && c.t < s.t, ka(i, f, m, s.t) && (f++, _ || (d++, g ? (c.t = (c.t - s.t) / (1 - s.t), p = 0) : h && (p -= m))), Math.abs(1 - (n - t)) < 1e-5 ? d = f - 1 : !c.t && d ? d-- : ka(i, d, p, c.t) && _ && f++, s.t === 1 && (f = (f + 1) % i.length), x = [], S = i.length, C = 1 + S * r, w = f, C += (S - f + d) % S, b = 0; b < C; b++) Na(x, i[w++ % S]);
		i = x;
	} else if (y = c.t === 1 ? 6 : Ga(l, p, c.t), t !== n) for (v = Ga(u, m, g ? s.t / c.t : s.t), h && (y += v), l.splice(p + y + 2), (v || m) && u.splice(0, m + v), b = i.length; b--;) (b < f || b > d) && i.splice(b, 1);
	else l.angle = Va(l, p + y, 0), p += y, s = l[p], c = l[p + 1], l.length = l.totalLength = 0, l.totalPoints = i.totalPoints = 8, l.push(s, c, s, c, s, c, s, c);
	return i.totalLength = 0, i;
}
function Ua(e, t, n) {
	t ||= 0, e.samples || (e.samples = [], e.lookup = []);
	var r = ~~e.resolution || 12, i = 1 / r, a = n ? t + n * 6 + 1 : e.length, o = e[t], s = e[t + 1], c = t ? t / 6 * r : 0, l = e.samples, u = e.lookup, d = (t ? e.minLength : ya) || ya, f = l[c + n * r - 1], p = t ? l[c - 1] : 0, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A;
	for (l.length = u.length = 0, h = t + 2; h < a; h += 6) {
		if (g = e[h + 4] - o, _ = e[h + 2] - o, v = e[h] - o, x = e[h + 5] - s, S = e[h + 3] - s, C = e[h + 1] - s, y = b = w = T = 0, ga(g) < .01 && ga(x) < .01 && ga(v) + ga(C) < .01) e.length > 8 && (e.splice(h, 6), h -= 6, a -= 6);
		else for (m = 1; m <= r; m++) D = i * m, E = 1 - D, y = b - (b = (D * D * g + 3 * E * (D * _ + E * v)) * D), w = T - (T = (D * D * x + 3 * E * (D * S + E * C)) * D), k = _a(w * w + y * y), k < d && (d = k), p += k, l[c++] = p;
		o += g, s += x;
	}
	if (f) for (f -= p; c < l.length; c++) l[c] += f;
	if (l.length && d) {
		if (e.totalLength = A = l[l.length - 1] || 0, e.minLength = d, A / d < 9999) for (k = O = 0, m = 0; m < A; m += d) u[k++] = l[O] < m ? ++O : O;
	} else e.totalLength = l[0] = 0;
	return t ? p - l[t / 2 - 1] : p;
}
function Wa(e, t) {
	var n, r, i;
	for (i = n = r = 0; i < e.length; i++) e[i].resolution = ~~t || 12, r += e[i].length, n += Ua(e[i]);
	return e.totalPoints = r, e.totalLength = n, e;
}
function Ga(e, t, n) {
	if (n <= 0 || n >= 1) return 0;
	var r = e[t], i = e[t + 1], a = e[t + 2], o = e[t + 3], s = e[t + 4], c = e[t + 5], l = e[t + 6], u = e[t + 7], d = r + (a - r) * n, f = a + (s - a) * n, p = i + (o - i) * n, m = o + (c - o) * n, h = d + (f - d) * n, g = p + (m - p) * n, _ = s + (l - s) * n, v = c + (u - c) * n;
	return f += (_ - f) * n, m += (v - m) * n, e.splice(t + 2, 4, Da(d), Da(p), Da(h), Da(g), Da(h + (f - h) * n), Da(g + (m - g) * n), Da(f), Da(m), Da(_), Da(v)), e.samples && e.samples.splice(t / 6 * e.resolution | 0, 0, 0, 0, 0, 0, 0, 0), 6;
}
function Ka(e, t, n, r) {
	n ||= {}, e.totalLength || Wa(e), (t < 0 || t > 1) && (t = Ea(t));
	var i = 0, a = e[0], o, s, c, l, u, d, f;
	if (!t) f = d = i = 0, a = e[0];
	else if (t === 1) f = 1, i = e.length - 1, a = e[i], d = a.length - 8;
	else {
		if (e.length > 1) {
			for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = d;
			a = e[i], l = u - a.totalLength, t = (c - l) / (u - l) || 0;
		}
		o = a.samples, s = a.resolution, c = a.totalLength * t, d = a.lookup.length ? a.lookup[~~(c / a.minLength)] || 0 : Aa(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s), d = ~~(d / s) * 6, r && f === 1 && (d + 6 < a.length ? (d += 6, f = 0) : i + 1 < e.length && (d = f = 0, a = e[++i]));
	}
	return n.t = f, n.i = d, n.path = e, n.segment = a, n.segIndex = i, n;
}
function qa(e, t, n, r) {
	var i = e[0], a = r || {}, o, s, c, l, u, d, f, p, m;
	if ((t < 0 || t > 1) && (t = Ea(t)), i.lookup || Wa(e), e.length > 1) {
		for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = e[d];
		l = u - i.totalLength, t = (c - l) / (u - l) || 0;
	}
	return o = i.samples, s = i.resolution, c = i.totalLength * t, d = i.lookup.length ? i.lookup[t < 1 ? ~~(c / i.minLength) : i.lookup.length - 1] || 0 : Aa(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s) || 0, m = 1 - f, d = ~~(d / s) * 6, p = i[d], a.x = Da((f * f * (i[d + 6] - p) + 3 * m * (f * (i[d + 4] - p) + m * (i[d + 2] - p))) * f + p), a.y = Da((f * f * (i[d + 7] - (p = i[d + 1])) + 3 * m * (f * (i[d + 5] - p) + m * (i[d + 3] - p))) * f + p), n && (a.angle = i.totalLength ? Va(i, d, f >= 1 ? .999999999 : f || 1e-9) : i.angle || 0), a;
}
function Ja(e, t, n, r, i, a, o) {
	for (var s = e.length, c, l, u, d, f; --s > -1;) for (c = e[s], l = c.length, u = 0; u < l; u += 2) d = c[u], f = c[u + 1], c[u] = d * t + f * r + a, c[u + 1] = d * n + f * i + o;
	return e._dirty = 1, e;
}
function Ya(e, t, n, r, i, a, o, s, c) {
	if (!(e === s && t === c)) {
		n = ga(n), r = ga(r);
		var l = i % 360 * fa, u = ha(l), d = ma(l), f = Math.PI, p = f * 2, m = (e - s) / 2, h = (t - c) / 2, g = u * m + d * h, _ = -d * m + u * h, v = g * g, y = _ * _, b = v / (n * n) + y / (r * r);
		b > 1 && (n = _a(b) * n, r = _a(b) * r);
		var x = n * n, S = r * r, C = (x * S - x * y - S * v) / (x * y + S * v);
		C < 0 && (C = 0);
		var w = (a === o ? -1 : 1) * _a(C), T = w * (n * _ / r), E = w * -(r * g / n), D = (e + s) / 2, O = (t + c) / 2, k = D + (u * T - d * E), A = O + (d * T + u * E), j = (g - T) / n, M = (_ - E) / r, N = (-g - T) / n, ee = (-_ - E) / r, P = j * j + M * M, F = (M < 0 ? -1 : 1) * Math.acos(j / _a(P)), I = (j * ee - M * N < 0 ? -1 : 1) * Math.acos((j * N + M * ee) / _a(P * (N * N + ee * ee)));
		isNaN(I) && (I = f), !o && I > 0 ? I -= p : o && I < 0 && (I += p), F %= p, I %= p;
		var te = Math.ceil(ga(I) / (p / 4)), ne = [], L = I / te, R = 4 / 3 * ma(L / 2) / (1 + ha(L / 2)), z = u * n, B = d * n, re = d * -r, ie = u * r, V;
		for (V = 0; V < te; V++) i = F + V * L, g = ha(i), _ = ma(i), j = ha(i += L), M = ma(i), ne.push(g - R * _, _ + R * g, j + R * M, M - R * j, j, M);
		for (V = 0; V < ne.length; V += 2) g = ne[V], _ = ne[V + 1], ne[V] = g * z + _ * re + k, ne[V + 1] = g * B + _ * ie + A;
		return ne[V - 2] = s, ne[V - 1] = c, ne;
	}
}
function Xa(e) {
	var t = (e + "").replace(ua, function(e) {
		var t = +e;
		return t < 1e-4 && t > -1e-4 ? 0 : t;
	}).match(ca) || [], n = [], r = 0, i = 0, a = 2 / 3, o = t.length, s = 0, c = "ERROR: malformed path: " + e, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w = function(e, t, n, r) {
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
	else if (p === "L" || p === "Z") p === "Z" && (d = g, f = _, h.closed = !0), (p === "L" || ga(r - d) > .5 || ga(i - f) > .5) && (w(r, i, d, f), p === "L" && (l += 2)), r = d, i = f;
	else if (p === "A") {
		if (S = t[l + 4], C = t[l + 5], v = t[l + 6], y = t[l + 7], u = 7, S.length > 1 && (S.length < 3 ? (y = v, v = C, u--) : (y = C, v = S.substr(2), u -= 2), C = S.charAt(1), S = S.charAt(0)), b = Ya(r, i, +t[l + 1], +t[l + 2], +t[l + 3], +S, +C, (m ? r : 0) + v * 1, (m ? i : 0) + y * 1), l += u, b) for (u = 0; u < b.length; u++) h.push(b[u]);
		r = h[h.length - 2], i = h[h.length - 1];
	} else console.log(c);
	return l = h.length, l < 6 ? (n.pop(), l = 0) : h[0] === h[l - 2] && h[1] === h[l - 1] && (h.closed = !0), n.totalPoints = s + l, n;
}
function Za(e, t) {
	t === void 0 && (t = 1);
	for (var n = e[0], r = 0, i = [n, r], a = 2; a < e.length; a += 2) i.push(n, r, e[a], r = (e[a] - n) * t / 2, n = e[a], -r);
	return i;
}
function Qa(e, t) {
	ga(e[0] - e[2]) < 1e-4 && ga(e[1] - e[3]) < 1e-4 && (e = e.slice(2));
	var n = e.length - 2, r = +e[0], i = +e[1], a = +e[2], o = +e[3], s = [
		r,
		i,
		r,
		i
	], c = a - r, l = o - i, u = Math.abs(e[n] - r) < .001 && Math.abs(e[n + 1] - i) < .001, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T;
	for (u && (e.push(a, o), a = r, o = i, r = e[n - 2], i = e[n - 1], e.unshift(r, i), n += 4), t = t || t === 0 ? +t : 1, p = 2; p < n; p += 2) d = r, f = i, r = a, i = o, a = +e[p + 2], o = +e[p + 3], !(r === a && i === o) && (m = c, h = l, c = a - r, l = o - i, g = _a(m * m + h * h), _ = _a(c * c + l * l), v = _a((c / _ + m / g) ** 2 + (l / _ + h / g) ** 2), y = (g + _) * t * .25 / v, b = r - (r - d) * (g ? y / g : 0), x = r + (a - r) * (_ ? y / _ : 0), S = r - (b + ((x - b) * (g * 3 / (g + _) + .5) / 4 || 0)), C = i - (i - f) * (g ? y / g : 0), w = i + (o - i) * (_ ? y / _ : 0), T = i - (C + ((w - C) * (g * 3 / (g + _) + .5) / 4 || 0)), (r !== d || i !== f) && s.push(Da(b + S), Da(C + T), Da(r), Da(i), Da(x + S), Da(w + T)));
	return r !== a || i !== o || s.length < 4 ? s.push(Da(a), Da(o), Da(a), Da(o)) : s.length -= 2, s.length === 2 ? s.push(r, i, r, i, r, i) : u && (s.splice(0, 6), s.length -= 6), s;
}
function $a(e) {
	xa(e[0]) && (e = [e]);
	var t = "", n = e.length, r, i, a, o;
	for (i = 0; i < n; i++) {
		for (o = e[i], t += "M" + Da(o[0]) + "," + Da(o[1]) + " C", r = o.length, a = 2; a < r; a++) t += Da(o[a++]) + "," + Da(o[a++]) + " " + Da(o[a++]) + "," + Da(o[a++]) + " " + Da(o[a++]) + "," + Da(o[a]) + " ";
		o.closed && (t += "z");
	}
	return t;
}
//#endregion
//#region node_modules/gsap/utils/matrix.js
var eo, to, no, ro, Y, io, ao, oo, so = "transform", co = so + "Origin", lo, uo = function(e) {
	var t = e.ownerDocument || e;
	for (!(so in e.style) && ("msTransform" in e.style) && (so = "msTransform", co = so + "Origin"); t.parentNode && (t = t.parentNode););
	if (to = window, ao = new wo(), t) {
		eo = t, no = t.documentElement, ro = t.body, oo = eo.createElementNS("http://www.w3.org/2000/svg", "g"), oo.style.transform = "none";
		var n = t.createElement("div"), r = t.createElement("div"), i = t && (t.body || t.firstElementChild);
		i && i.appendChild && (i.appendChild(n), n.appendChild(r), n.setAttribute("style", "position:static;transform:translate3d(0,0,1px)"), lo = r.offsetParent !== n, i.removeChild(n));
	}
	return t;
}, fo = function(e) {
	for (var t, n; e && e !== ro;) n = e._gsap, n && n.uncache && n.get(e, "x"), n && !n.scaleX && !n.scaleY && n.renderTransform && (n.scaleX = n.scaleY = 1e-4, n.renderTransform(1, n), t ? t.push(n) : t = [n]), e = e.parentNode;
	return t;
}, po = [], mo = [], ho = function() {
	return to.pageYOffset || eo.scrollTop || no.scrollTop || ro.scrollTop || 0;
}, go = function() {
	return to.pageXOffset || eo.scrollLeft || no.scrollLeft || ro.scrollLeft || 0;
}, _o = function(e) {
	return e.ownerSVGElement || ((e.tagName + "").toLowerCase() === "svg" ? e : null);
}, vo = function e(t) {
	if (to.getComputedStyle(t).position === "fixed") return !0;
	if (t = t.parentNode, t && t.nodeType === 1) return e(t);
}, yo = function e(t, n) {
	if (t.parentNode && (eo || uo(t))) {
		var r = _o(t), i = r ? r.getAttribute("xmlns") || "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml", a = r ? n ? "rect" : "g" : "div", o = n === 2 ? 100 : 0, s = n === 3 ? 100 : 0, c = "position:absolute;display:block;pointer-events:none;margin:0;padding:0;", l = eo.createElementNS ? eo.createElementNS(i.replace(/^https/, "http"), a) : eo.createElement(a);
		return n && (r ? (io ||= e(t), l.setAttribute("width", .01), l.setAttribute("height", .01), l.setAttribute("transform", "translate(" + o + "," + s + ")"), io.appendChild(l)) : (Y || (Y = e(t), Y.style.cssText = c), l.style.cssText = c + "width:0.1px;height:0.1px;top:" + s + "px;left:" + o + "px", Y.appendChild(l))), l;
	}
	throw "Need document and parent.";
}, bo = function(e) {
	for (var t = new wo(), n = 0; n < e.numberOfItems; n++) t.multiply(e.getItem(n).matrix);
	return t;
}, xo = function(e) {
	var t = e.getCTM(), n;
	return t || (n = e.style[so], e.style[so] = "none", e.appendChild(oo), t = oo.getCTM(), e.removeChild(oo), n ? e.style[so] = n : e.style.removeProperty(so.replace(/([A-Z])/g, "-$1").toLowerCase())), t || ao.clone();
}, So = function(e, t) {
	var n = _o(e), r = e === n, i = n ? po : mo, a = e.parentNode, o, s, c, l, u, d;
	if (e === to) return e;
	if (i.length || i.push(yo(e, 1), yo(e, 2), yo(e, 3)), o = n ? io : Y, n) r ? (c = xo(e), l = -c.e / c.a, u = -c.f / c.d, s = ao) : e.getBBox ? (c = e.getBBox(), s = e.transform ? e.transform.baseVal : {}, s = s.numberOfItems ? s.numberOfItems > 1 ? bo(s) : s.getItem(0).matrix : ao, l = s.a * c.x + s.c * c.y, u = s.b * c.x + s.d * c.y) : (s = new wo(), l = u = 0), t && e.tagName.toLowerCase() === "g" && (l = u = 0), (r ? n : a).appendChild(o), o.setAttribute("transform", "matrix(" + s.a + "," + s.b + "," + s.c + "," + s.d + "," + (s.e + l) + "," + (s.f + u) + ")");
	else {
		if (l = u = 0, lo) for (s = e.offsetParent, c = e; (c &&= c.parentNode) && c !== s && c.parentNode;) (to.getComputedStyle(c)[so] + "").length > 4 && (l = c.offsetLeft, u = c.offsetTop, c = 0);
		if (d = to.getComputedStyle(e), d.position !== "absolute" && d.position !== "fixed") for (s = e.offsetParent; a && a !== s;) l += a.scrollLeft || 0, u += a.scrollTop || 0, a = a.parentNode;
		c = o.style, c.top = e.offsetTop - u + "px", c.left = e.offsetLeft - l + "px", c[so] = d[so], c[co] = d[co], c.position = d.position === "fixed" ? "fixed" : "absolute", e.parentNode.appendChild(o);
	}
	return o;
}, Co = function(e, t, n, r, i, a, o) {
	return e.a = t, e.b = n, e.c = r, e.d = i, e.e = a, e.f = o, e;
}, wo = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a) {
		e === void 0 && (e = 1), t === void 0 && (t = 0), n === void 0 && (n = 0), r === void 0 && (r = 1), i === void 0 && (i = 0), a === void 0 && (a = 0), Co(this, e, t, n, r, i, a);
	}
	var t = e.prototype;
	return t.inverse = function() {
		var e = this.a, t = this.b, n = this.c, r = this.d, i = this.e, a = this.f, o = e * r - t * n || 1e-10;
		return Co(this, r / o, -t / o, -n / o, e / o, (n * a - r * i) / o, -(e * a - t * i) / o);
	}, t.multiply = function(e) {
		var t = this.a, n = this.b, r = this.c, i = this.d, a = this.e, o = this.f, s = e.a, c = e.c, l = e.b, u = e.d, d = e.e, f = e.f;
		return Co(this, s * t + l * r, s * n + l * i, c * t + u * r, c * n + u * i, a + d * t + f * r, o + d * n + f * i);
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
function To(e, t, n, r) {
	if (!e || !e.parentNode || (eo || uo(e)).documentElement === e) return new wo();
	var i = fo(e), a = _o(e) ? po : mo, o = So(e, n), s = a[0].getBoundingClientRect(), c = a[1].getBoundingClientRect(), l = a[2].getBoundingClientRect(), u = o.parentNode, d = !r && vo(e), f = new wo((c.left - s.left) / 100, (c.top - s.top) / 100, (l.left - s.left) / 100, (l.top - s.top) / 100, s.left + (d ? 0 : go()), s.top + (d ? 0 : ho()));
	if (u.removeChild(o), i) for (s = i.length; s--;) c = i[s], c.scaleX = c.scaleY = 0, c.renderTransform(1, c);
	return t ? f.inverse() : f;
}
//#endregion
//#region node_modules/gsap/MotionPathPlugin.js
var Eo = "x,translateX,left,marginLeft,xPercent".split(","), Do = "y,translateY,top,marginTop,yPercent".split(","), Oo = Math.PI / 180, ko, Ao, jo, Mo, No, Po, Fo = function() {
	return ko || typeof window < "u" && (ko = window.gsap) && ko.registerPlugin && ko;
}, Io = function(e, t, n, r) {
	for (var i = t.length, a = r === 2 ? 0 : r, o = 0; o < i; o++) e[a] = parseFloat(t[o][n]), r === 2 && (e[a + 1] = 0), a += 2;
	return e;
}, Lo = function(e, t, n) {
	return parseFloat(e._gsap.get(e, t, n || "px")) || 0;
}, Ro = function(e) {
	var t = e[0], n = e[1], r;
	for (r = 2; r < e.length; r += 2) t = e[r] += t, n = e[r + 1] += n;
}, zo = function(e, t, n, r, i, a, o, s, c) {
	return o.type === "cubic" ? t = [t] : (o.fromCurrent !== !1 && t.unshift(Lo(n, r, s), i ? Lo(n, i, c) : 0), o.relative && Ro(t), t = [(i ? Qa : Za)(t, o.curviness)]), t = a(Wo(t, n, o)), Go(e, n, r, t, "x", s), i && Go(e, n, i, t, "y", c), Wa(t, o.resolution || (o.curviness === 0 ? 20 : 12));
}, Bo = function(e) {
	return e;
}, Vo = /[-+\.]*\d+\.?(?:e-|e\+)?\d*/g, Ho = function(e, t, n) {
	var r = To(e), i = 0, a = 0, o;
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
}, Uo = function(e, t, n, r) {
	var i = To(e.parentNode, !0, !0), a = i.clone().multiply(To(t)), o = Ho(e, n, i), s = Ho(t, r, i), c = s.x, l = s.y, u;
	return a.e = a.f = 0, r === "auto" && t.getTotalLength && t.tagName.toLowerCase() === "path" && (u = t.getAttribute("d").match(Vo) || [], u = a.apply({
		x: +u[0],
		y: +u[1]
	}), c += u.x, l += u.y), u && (u = a.apply(t.getBBox()), c -= u.x, l -= u.y), a.e = c - o.x, a.f = l - o.y, a;
}, Wo = function(e, t, n) {
	var r = n.align, i = n.matrix, a = n.offsetX, o = n.offsetY, s = n.alignOrigin, c = e[0][0], l = e[0][1], u = Lo(t, "x"), d = Lo(t, "y"), f, p, m;
	return !e || !e.length ? Pa("M0,0L0,0") : (r && (r === "self" || (f = Mo(r)[0] || t) === t ? Ja(e, 1, 0, 0, 1, u - c, d - l) : (s && s[2] !== !1 ? ko.set(t, { transformOrigin: s[0] * 100 + "% " + s[1] * 100 + "%" }) : s = [Lo(t, "xPercent") / -100, Lo(t, "yPercent") / -100], p = Uo(t, f, s, "auto"), m = p.apply({
		x: c,
		y: l
	}), Ja(e, p.a, p.b, p.c, p.d, u + p.e - (m.x - p.e), d + p.f - (m.y - p.f)))), i ? Ja(e, i.a, i.b, i.c, i.d, i.e, i.f) : (a || o) && Ja(e, 1, 0, 0, 1, a || 0, o || 0), e);
}, Go = function(e, t, n, r, i, a) {
	var o = t._gsap, s = o.harness, c = s && s.aliases && s.aliases[n], l = c && c.indexOf(",") < 0 ? c : n, u = e._pt = new Ao(e._pt, t, l, 0, 0, Bo, 0, o.set(t, l, e));
	u.u = jo(o.get(t, l, a)) || 0, u.path = r, u.pp = i, e._props.push(l);
}, Ko = function(e, t) {
	return function(n) {
		return e || t !== 1 ? Ha(n, e, t) : n;
	};
}, qo = {
	version: "3.12.7",
	name: "motionPath",
	register: function(e, t, n) {
		ko = e, jo = ko.utils.getUnit, Mo = ko.utils.toArray, No = ko.core.getStyleSaver, Po = ko.core.reverting || function() {}, Ao = n;
	},
	init: function(e, t, n) {
		if (!ko) return console.warn("Please gsap.registerPlugin(MotionPathPlugin)"), !1;
		(!(typeof t == "object" && !t.style) || !t.path) && (t = { path: t });
		var r = [], i = t, a = i.path, o = i.autoRotate, s = i.unitX, c = i.unitY, l = i.x, u = i.y, d = a[0], f = Ko(t.start, "end" in t ? t.end : 1), p, m;
		if (this.rawPaths = r, this.target = e, this.tween = n, this.styles = No && No(e, "transform"), (this.rotate = o || o === 0) && (this.rOffset = parseFloat(o) || 0, this.radians = !!t.useRadians, this.rProp = t.rotation || "rotation", this.rSet = e._gsap.set(e, this.rProp, this), this.ru = jo(e._gsap.get(e, this.rProp)) || 0), Array.isArray(a) && !("closed" in a) && typeof d != "number") {
			for (m in d) !l && ~Eo.indexOf(m) ? l = m : !u && ~Do.indexOf(m) && (u = m);
			for (m in l && u ? r.push(zo(this, Io(Io([], a, l, 0), a, u, 1), e, l, u, f, t, s || jo(a[0][l]), c || jo(a[0][u]))) : l = u = 0, d) m !== l && m !== u && r.push(zo(this, Io([], a, m, 2), e, m, 0, f, t, jo(a[0][m])));
		} else p = f(Wo(Pa(t.path), e, t)), Wa(p, t.resolution), r.push(p), Go(this, e, t.x || "x", p, "x", t.unitX || "px"), Go(this, e, t.y || "y", p, "y", t.unitY || "px");
		n.vars.immediateRender && this.render(n.progress(), this);
	},
	render: function(e, t) {
		var n = t.rawPaths, r = n.length, i = t._pt;
		if (t.tween._time || !Po()) {
			for (e > 1 ? e = 1 : e < 0 && (e = 0); r--;) qa(n[r], e, !r && t.rotate, n[r]);
			for (; i;) i.set(i.t, i.p, i.path[i.pp] + i.u, i.d, e), i = i._next;
			t.rotate && t.rSet(t.target, t.rProp, n[0].angle * (t.radians ? Oo : 1) + t.rOffset + t.ru, t, e);
		} else t.styles.revert();
	},
	getLength: function(e) {
		return Wa(Pa(e)).totalLength;
	},
	sliceRawPath: Ha,
	getRawPath: Pa,
	pointsToSegment: Qa,
	stringToRawPath: Xa,
	rawPathToString: $a,
	transformRawPath: Ja,
	getGlobalMatrix: To,
	getPositionOnPath: qa,
	cacheRawPathMeasurements: Wa,
	convertToPath: function(e, t) {
		return Mo(e).map(function(e) {
			return Ba(e, t !== !1);
		});
	},
	convertCoordinates: function(e, t, n) {
		var r = To(t, !0, !0).multiply(To(e));
		return n ? r.apply(n) : r;
	},
	getAlignMatrix: Uo,
	getRelativePosition: function(e, t, n, r) {
		var i = Uo(e, t, n, r);
		return {
			x: i.e,
			y: i.f
		};
	},
	arrayToRawPath: function(e, t) {
		t ||= {};
		var n = Io(Io([], e, t.x || "x", 0), e, t.y || "y", 1);
		return t.relative && Ro(n), [t.type === "cubic" ? n : Qa(n, t.curviness)];
	}
};
Fo() && ko.registerPlugin(qo);
//#endregion
//#region src/table/animations/initMotion.ts
var Jo = !1;
function Yo() {
	typeof window > "u" || Jo || (J.registerPlugin(qo), Jo = !0);
}
function Xo() {
	return Yo(), !!J.plugins?.motionPath;
}
function Zo(e) {
	typeof window > "u" || (Yo(), ((e instanceof HTMLElement ? e : null) ?? document.querySelector(".btable-wrap") ?? document.querySelector(".btable-session"))?.setAttribute("data-gsap-motion", "true"));
}
//#endregion
//#region src/table/animations/arcTween.ts
function Qo(e, t) {
	Yo();
	let { path: n, curviness: r = 1.2, duration: i, ease: a, onComplete: o, ...s } = t, c = n[n.length - 1] ?? {
		x: 0,
		y: 0
	};
	if (Xo()) return J.to(e, {
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
function $o(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function es(e, t) {
	return (e >>> t & 65535) / 65535;
}
function ts(e, t) {
	let n = $o(`${e}@${t}`), r = es(n, 0), i = es(n, 7), a = es(n, 14), o = es(n, 21), s = r >= .5 ? 1 : -1, c = i >= .5 ? 1 : -1, l = a >= .5 ? 1 : -1;
	return {
		offsetX: s * (12 + r * 6),
		offsetY: c * (12 + i * 6),
		rotation: l * (7 + a * 2),
		scale: .94 + o * .04,
		zIndex: t + 1
	};
}
function ns(e) {
	let t = ts(e.id, e.pileIndex);
	return {
		...e,
		...t
	};
}
function rs(e) {
	let t = [];
	for (let n = 0; n < e.discardCount; n++) {
		let r = e.heroCardKeys?.[n];
		t.push(r ?? `${e.playerId}:h${e.handNumber}:d${e.pileStartIndex + n}`);
	}
	return t;
}
//#endregion
//#region src/table/animations/discardPileMotion.ts
var is = /* @__PURE__ */ new Set(), as = B.drawDiscard;
function os(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function ss(e = document) {
	let t = (e instanceof Document ? e : e.ownerDocument ?? document).querySelector("[data-discard-pile-anchor]");
	return t ? ia(t) : null;
}
function cs() {
	for (let e of is) e.kill();
	is.clear();
}
function ls(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function us(e, t, n, r = {}) {
	Zo(r.root ?? document);
	let i = V(), a = ss(r.root ?? document), o = ie(as, i), s = i ? .03 : .055, c = J.timeline({ onComplete: () => {
		is.delete(c), r.onComplete?.();
	} });
	is.add(c), e.forEach((e, l) => {
		let u = ts(t[l] ?? `discard-${n + l}`, n + l), d = ia(e);
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
		let f = a.left + a.width / 2 + u.offsetX, p = a.top + a.height / 2 + u.offsetY, m = d.left + d.width / 2, h = d.top + d.height / 2, g = f - m, _ = p - h, { midX: v, midY: y } = os(g, _);
		J.set(e, {
			x: 0,
			y: 0,
			rotation: 0,
			scale: 1,
			opacity: 1
		}), c.add(Qo(e, {
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
			ease: L,
			onComplete: () => {
				J.set(e, { clearProps: "transform,opacity,willChange,zIndex" }), r.onCardComplete?.(l);
			}
		}), l * s);
	});
	let l = Math.round((e.length > 0 ? (e.length - 1) * s : 0) * 1e3 + o * 1e3 + 40);
	return ls(c, Math.min(420, Math.max(280, l))), c;
}
function ds(e, t, n, r, i = {}) {
	let a = [];
	for (let t = 0; t < e.length; t++) {
		let n = e[t], i = document.createElement("div");
		i.className = "discard-fly-ghost", i.setAttribute("aria-hidden", "true"), i.style.position = "fixed", i.style.left = `${n.left}px`, i.style.top = `${n.top}px`, i.style.width = `${n.width}px`, i.style.height = `${n.height}px`, i.style.pointerEvents = "none", i.style.zIndex = "4", r.appendChild(i), a.push(i);
	}
	let o = us(a, t, n, {
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
function fs(e, t, n) {
	let r = n.querySelector(`[data-seat-play-origin="${e}"]`) ?? n.querySelector(`[data-trick-play-origin="${e}"]`);
	if (!r) return [];
	let i = ia(r);
	return Array.from({ length: t }, (e, t) => ({
		...i,
		left: i.left + t * 3,
		top: i.top - t * 2
	}));
}
//#endregion
//#region src/table/animations/cardMotion.ts
function ps() {
	Zo();
}
var ms = /* @__PURE__ */ new WeakMap();
function hs(e = document) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = t.querySelector("[data-testid=\"deal-button\"]") ?? t.querySelector(".deck-stack__pile") ?? t.querySelector(".deck-stack");
	return n ? ia(n) : null;
}
function gs(e) {
	e && (ms.get(e)?.kill(), ms.delete(e), J.killTweensOf(e), J.set(e, { clearProps: "transform,opacity,filter" }));
}
function _s(e, t, n = .22) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * n)
	};
}
function vs(e, t, n = B.dealStagger) {
	ps();
	let r = V(), i = J.timeline(), a = ie(B.deal, r);
	return e.forEach((e, o) => {
		let { x: s, y: c } = sa(ia(e), t), { midX: l, midY: u } = _s(s, c, .28);
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
			ease: L,
			onComplete: f
		}, d) : i.add(Qo(e, {
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
			ease: L,
			onComplete: f
		}), d);
	}), i;
}
function ys(e, t) {
	ps();
	let n = V(), r = J.timeline(), i = ie(B.drawReceive, n), a = n ? .04 : B.drawReceiveStagger;
	return e.forEach((e, n) => {
		let { x: o, y: s } = sa(ia(e), t);
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
			ease: z,
			onComplete: () => {
				J.set(e, { transition: "none" }), J.set(e, { clearProps: "transform,opacity,willChange,transition" });
			}
		}, n * a);
	}), r;
}
function bs(e) {
	ps();
	let t = J.timeline(), n = ie(B.standPat);
	return e.forEach((e) => {
		t.fromTo(e, {
			y: 0,
			scale: 1
		}, {
			y: -5,
			scale: 1.02,
			duration: n * .45,
			ease: L,
			yoyo: !0,
			repeat: 1,
			onComplete: () => {
				J.set(e, { clearProps: "transform,willChange" });
			}
		}, 0);
	}), t;
}
function xs(e) {
	ps();
	let t = J.timeline(), n = ie(B.foldOut);
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
			ease: R,
			onComplete: () => gs(e)
		}, r * .04);
	}), t;
}
//#endregion
//#region src/table/animations/drawSeatMotion.ts
var Ss = /* @__PURE__ */ new Set();
function Cs(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function ws() {
	for (let e of Ss) e.kill();
	Ss.clear();
}
function Ts(e) {
	let t = document.createElement("div");
	return t.className = "draw-receive-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function Es(e, t, n, r = {}) {
	Zo(n);
	let i = V(), a = ie(B.drawReceive, i), o = i ? .04 : B.drawReceiveStagger, s = [];
	for (let r = 0; r < t.length; r++) {
		let t = Ts(e);
		n.appendChild(t), s.push(t);
	}
	let c = J.timeline({ onComplete: () => {
		for (let e of s) e.remove();
		Ss.delete(c), window.clearTimeout(u), r.onComplete?.();
	} });
	Ss.add(c);
	let l = Math.round((s.length > 0 ? (s.length - 1) * o : 0) * 1e3 + a * 1e3 + 40), u = window.setTimeout(() => {
		c.progress() < 1 && c.progress(1);
	}, Math.min(680, Math.max(320, l)));
	return c.eventCallback("onInterrupt", () => {
		for (let e of s) e.remove();
		Ss.delete(c), window.clearTimeout(u);
	}), s.forEach((e, n) => {
		let r = t[n], s = ia(e), l = r.left + r.width / 2, u = r.top + r.height / 2, d = s.left + s.width / 2, f = s.top + s.height / 2, p = l - d, m = u - f, { midX: h, midY: g } = Cs(p, m);
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
		c.add(Qo(e, {
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
			ease: z
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
function Ds(e) {
	let { playerId: t, replaceCount: n, root: r, onComplete: i } = e;
	if (n <= 0) {
		i?.();
		return;
	}
	let a = hs(r), o = fs(t, n, r);
	if (!a || !o.length) {
		i?.();
		return;
	}
	Es(a, o, r, { onComplete: i });
}
//#endregion
//#region src/table/hooks/useDiscardPileState.ts
function Os({ handNumber: e, sessionPhase: t }) {
	let [n, r] = (0, l.useState)([]), i = (0, l.useRef)(0), a = (0, l.useRef)(e), o = (0, l.useRef)(t ?? null);
	return (0, l.useEffect)(() => {
		a.current !== e && (a.current = e, i.current = 0, cs(), ws(), r([]));
	}, [e]), (0, l.useEffect)(() => {
		let e = t ?? null, n = o.current;
		o.current = e, n === "draw" && e === "play" && (cs(), ws(), r([]));
	}, [t]), {
		cards: n,
		pileIndexRef: i,
		commitDiscardCards: (0, l.useCallback)((t) => {
			if (!t.length) return;
			let n = t.map((t) => ns({
				id: t.id,
				playerId: t.playerId,
				handNumber: e,
				pileIndex: i.current++
			}));
			r((e) => [...e, ...n]);
		}, [e])
	};
}
function ks({ cardElements: e, cardKeys: t, playerId: n, pileStartIndex: r, root: i, onComplete: a }) {
	let o = [];
	us(e, t, r, {
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
function As({ playerId: e, handNumber: t, discardCount: n, pileStartIndex: r, root: i, onComplete: a }) {
	let o = rs({
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
	let s = fs(e, n, i);
	if (!s.length) {
		a(o.map((t) => ({
			id: t,
			playerId: e
		})));
		return;
	}
	ds(s, o, r, i, { onComplete: () => a(o.map((t) => ({
		id: t,
		playerId: e
	}))) });
}
function js(e, t) {
	return t.map((t) => {
		let n = e[t];
		return n ? `${n.rank}-${n.suit}` : `idx-${t}`;
	});
}
function Ms(e, t) {
	if (!e) return [];
	let n = [...e.querySelectorAll(".hand__slot .pcard")];
	return t.length > 0 ? t.map((e) => n[e]).filter((e) => !!e) : [...e.querySelectorAll(".hand__slot--draw-selected .pcard, .hand__slot--draw-recommended .pcard")];
}
//#endregion
//#region src/table/animations/useHeroCardMotion.ts
function Ns(e) {
	return `${e.rank}-${e.suit}`;
}
function Ps(e) {
	return e ? [...e.querySelectorAll(".hand__slot .pcard")] : [];
}
function Fs(e, { dealing: t, dealStaggerMs: n, drawAnimSubPhase: r, drawDiscardCount: i = 0, drawReplaceCount: a = 0, pendingDiscardIndices: o, standPatPulse: s, foldOutPulse: c, playingIndex: u, cards: d, handNumber: f = 0, playerId: p = null, tableRootRef: m, pileIndexRef: h, onDiscardCommitted: g, skipHeroDealMotion: _ = !1 }) {
	let v = (0, l.useRef)([]), y = (0, l.useRef)(!1), b = (0, l.useRef)(null), x = (0, l.useRef)(null), S = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		Zo(e.current?.closest(".btable-wrap") ?? document);
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
		let r = e.current, i = Ps(r);
		if (!i.length) return;
		y.current = !0;
		let a = hs(r ?? document);
		a && vs(i, a, Math.max(.04, n / 1e3));
	}, [
		t,
		d.length,
		n,
		e,
		_
	]), (0, l.useLayoutEffect)(() => {
		if (r === "discard") {
			if (i <= 0) return;
			S.current = null, v.current = d.map(Ns);
			let t = e.current, n = m?.current ?? t?.closest(".btable-wrap"), r = Ms(t, o);
			if (!r.length || !n || !p) return;
			let a = `${f}:${p}:discard:${r.length}:${o.join(",")}`;
			if (x.current === a) return;
			x.current = a, ks({
				cardElements: r,
				cardKeys: js(d, o.length ? o : r.map((e, t) => t)),
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
			let t = e.current, n = Ps(t), r = new Set(v.current), i = d.map((e, t) => ({
				key: Ns(e),
				el: n[t]
			})).filter((e) => !!e.el && !r.has(e.key));
			if (!i.length) return;
			let o = i.map((e) => e.key).sort().join(","), s = `${f}:${p ?? ""}:receive:${a}:${o}`;
			if (S.current === s) return;
			S.current = s;
			let c = hs(t ?? document);
			c && ys(i.map((e) => e.el), c);
			return;
		}
		(r === "done" || r === null) && (x.current = null, S.current = null, v.current = d.map(Ns));
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
		let t = Ps(e.current);
		t.length && bs(t);
	}, [s, e]), (0, l.useLayoutEffect)(() => {
		if (!c) return;
		let t = Ps(e.current);
		t.length && xs(t);
	}, [c, e]), (0, l.useLayoutEffect)(() => {
		let t = e.current, n = Ps(t);
		if (u === null) {
			if (b.current !== null) {
				let e = n[b.current];
				e && gs(e), b.current = null;
			}
			return;
		}
		if (b.current === u) return;
		if (b.current !== null) {
			let e = n[b.current];
			e && gs(e);
		}
		let r = n[u];
		r && (gs(r), b.current = u);
	}, [
		u,
		d,
		e
	]), (0, l.useLayoutEffect)(() => () => {
		for (let t of Ps(e.current)) gs(t);
	}, [e]);
}
function Is(e, t) {
	let n = t / 1e3, r = Math.max(e - 1, 0) * n;
	return Math.round((r + B.deal) * 1e3);
}
//#endregion
//#region src/table/handUi.ts
function Ls(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function Rs(e, t) {
	if (t) return "Join hand";
	switch (e) {
		case "reveal": return "Deal";
		case "decision": return "Join hand";
		case "draw": return "Draw";
		case "play": return "Play card";
		default: return "Waiting";
	}
}
function zs(e) {
	return {
		spades: "Spades",
		hearts: "Hearts",
		diamonds: "Diamonds",
		clubs: "Clubs"
	}[e ?? ""] ?? e ?? "—";
}
function Bs(e) {
	return e === "reveal" || e === "decision" || e === "draw" || e === "play";
}
function Vs(e) {
	return e === "decision";
}
function Hs(e) {
	return e === "reveal";
}
function Us(e, t) {
	if (!e) return null;
	let n = t.find((t) => t.playerId === e);
	return n ? n.isSelf ? "Your turn" : `${n.displayName}'s turn` : null;
}
//#endregion
//#region src/table/trickPlayFly.ts
var Ws = /* @__PURE__ */ new Map(), Gs = /* @__PURE__ */ new Map();
function Ks(e) {
	return `${e.playerId}:${e.card.rank}:${e.card.suit}`;
}
function qs(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function Js(e) {
	return document.querySelector(`[data-seat-play-origin="${e}"]`);
}
function Ys(e) {
	let t = Js(e);
	return t ? qs(t) : null;
}
function Xs(e) {
	return document.querySelector(`[data-trick-play-origin-active="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin-active="${e}"]`) ?? document.querySelector(`[data-trick-play-origin="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin="${e}"]`) ?? Js(e);
}
function Zs(e) {
	let t = Xs(e);
	return t ? qs(t) : null;
}
function Qs(e, t = {}) {
	if (!t.force && Gs.has(e)) return Gs.get(e);
	let n = Zs(e) ?? Ys(e);
	return n ? (Gs.set(e, n), n) : null;
}
function $s(e) {
	return Qs(e, { force: !0 });
}
function ec(e, t = {}) {
	for (let n of e) Qs(n, t);
}
function tc(e) {
	return Gs.get(e);
}
function nc(e, t) {
	if (t) {
		let e = Ws.get(t);
		if (e) return e;
	}
	return tc(e) ?? Zs(e) ?? Ys(e) ?? null;
}
function rc(e, t) {
	let n = Ws.get(t);
	if (n) return n;
	let r = tc(e);
	if (r) return Ws.set(t, r), r;
	let i = Zs(e) ?? Ys(e);
	return i && Ws.set(t, i), i;
}
function ic(e, t, n) {
	let r = document.querySelector("[data-testid=\"hero-hand\"]")?.querySelectorAll(".hand__slot .pcard")[n];
	if (r) {
		let n = qs(r);
		return Ws.set(t, n), Gs.set(e, n), n;
	}
	return rc(e, t);
}
function ac(e, t, n) {
	let r = e.left + e.width / 2, i = e.top + e.height / 2, a = n.left + n.width / 2, o = n.top + n.height / 2;
	return {
		dx: r - a,
		dy: i - o
	};
}
var oc = 2.5;
function sc(e) {
	return Math.hypot(e.dx, e.dy);
}
function cc(e) {
	let t = sc(e);
	if (t < .001) return {
		...e,
		magnitude: 0,
		rawMagnitude: 0,
		shallowBoosted: !1
	};
	if (t >= 200) return {
		...e,
		magnitude: t,
		rawMagnitude: t,
		shallowBoosted: !1
	};
	let n = 200 / t, r = Math.min(n, oc), i = t * r;
	return i <= t + 1 ? {
		...e,
		magnitude: t,
		rawMagnitude: t,
		shallowBoosted: !1
	} : {
		dx: e.dx * r,
		dy: e.dy * r,
		magnitude: i,
		rawMagnitude: t,
		shallowBoosted: !0
	};
}
function lc(e, t, n) {
	if (!n) return e;
	let r = Math.max(0, 200 - t);
	return e + Math.min(180, Math.round(r * 1.2));
}
function uc() {
	Ws.clear(), Gs.clear();
}
//#endregion
//#region src/table/heroPlayHandoff.ts
var dc = 4e3, fc = null, pc = !1, mc = null, hc = /* @__PURE__ */ new Set();
function gc() {
	for (let e of hc) e();
}
function _c() {
	mc != null && (clearTimeout(mc), mc = null);
}
function vc() {
	_c(), mc = setTimeout(() => {
		mc = null, fc && (fc = null, pc = !1, gc());
	}, dc);
}
function yc(e) {
	fc = {
		...e,
		trickIndex: e.trickIndex ?? null
	}, pc = !1, vc(), gc();
}
function bc(e) {
	fc && fc.trickIndex !== e && (fc = {
		...fc,
		trickIndex: e
	}, gc());
}
function xc(e) {
	return !fc || pc || fc.trickIndex == null ? !1 : e > fc.trickIndex;
}
function Sc() {
	return fc;
}
function Cc(e) {
	fc?.playKey === e && (pc = !0, fc = null, _c(), gc());
}
function wc() {
	fc && (fc = null, pc = !1, _c(), gc());
}
function Tc(e) {
	return hc.add(e), () => hc.delete(e);
}
//#endregion
//#region src/table/heroQueuedIntent.ts
var Ec = /* @__PURE__ */ new Set();
function Dc(e) {
	for (let t of Ec) t(e);
}
function Oc(e) {
	return Ec.add(e), () => Ec.delete(e);
}
//#endregion
//#region src/table/tableMicrointeractions.ts
var kc = {
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
}, Ac = {
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
function jc(e) {
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
function Mc(e, t) {
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
var Nc = "nbl-best-play";
function Pc() {
	try {
		return localStorage.getItem(Nc) === "1";
	} catch {
		return !1;
	}
}
function Fc(e) {
	try {
		localStorage.setItem(Nc, e ? "1" : "0");
	} catch {}
}
//#endregion
//#region src/game/playerOrder.ts
function Ic(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function Lc(e, t, n) {
	let r = Ic(e, n), i = new Set(t);
	return r.filter((e) => i.has(e));
}
//#endregion
//#region src/game/types.ts
var Rc = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
};
function zc(e) {
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
function Bc(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/playContext.ts
function Vc(e, t) {
	let n = N(e, t);
	return n.length ? n.reduce((e, t) => j(t) >= j(e) ? t : e) : null;
}
function Hc(e) {
	if (!e.cinchEnabled) return !1;
	let t = N(e.hand, e.trumpSuit);
	return t.filter((e) => j(e) >= 13).length >= 3 && t.length > 0;
}
function Uc(e, t) {
	let n = Vc(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function Wc(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => Bc([e.card])[0]) : [];
}
function Gc(e) {
	let t = e.currentTrick ?? null, n = Wc(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function Kc(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = Gc(e.publicHand);
	return {
		hand: e.hand,
		trumpSuit: e.publicHand.trumpSuit,
		leadSuit: r,
		trickPlays: t,
		isLeading: n,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	};
}
function qc(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return Hc(e) && !Uc(n, e) ? {
		allowed: !1,
		reason: "Cinch: play your highest trump",
		code: "CINCH_HIGHEST_TRUMP"
	} : { allowed: !0 };
	let r = e.leadSuit ?? e.trickPlays[0]?.suit;
	return r ? N(e.hand, r).length > 0 ? n.suit === r ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must follow suit",
		code: "MUST_FOLLOW_SUIT"
	} : N(e.hand, e.trumpSuit).length > 0 ? M(n, e.trumpSuit) ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must play a trump when void in the led suit",
		code: "MUST_TRUMP"
	} : { allowed: !0 } : { allowed: !0 };
}
function Jc(e, t, n, r) {
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
function Yc(e, t, n) {
	let r = e.filter((e) => !M(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => j(t) > j(e) ? t : e) : null;
}
function Xc(e, t) {
	let n = e.filter((e) => M(e, t));
	return n.length ? n.reduce((e, t) => j(t) > j(e) ? t : e) : null;
}
function Zc(e, t) {
	return j(e) > j(t);
}
function Qc(e) {
	return {
		hand: e.hand,
		trumpSuit: e.trumpSuit,
		leadSuit: e.leadSuit,
		trickPlays: e.trickPlays,
		isLeading: e.isLeading,
		cinchEnabled: e.cinchEnabled
	};
}
function $c(e, t = {}) {
	let n = Qc(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = qc(n, r);
			i.allowed ? e.push(r) : Jc(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? N(n.hand, r) : [], a = N(n.hand, n.trumpSuit), o = r ? Yc(n.trickPlays, r, n.trumpSuit) : null, s = Xc(n.trickPlays, n.trumpSuit), c;
	if (i.length > 0) {
		if (c = i, !s && o) {
			let e = i.filter((e) => Zc(e, o));
			e.length && (c = e);
		}
	} else if (a.length > 0) {
		if (c = a, s) {
			let e = a.filter((e) => Zc(e, s));
			e.length && (c = e);
		}
	} else c = [...n.hand];
	let l = [];
	for (let e = 0; e < n.hand.length; e += 1) c.some((t) => t.rank === n.hand[e].rank && t.suit === n.hand[e].suit) && l.push(e);
	return l;
}
//#endregion
//#region src/game/trick.ts
function el(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => M(e.card, n));
	if (r.length) return r.reduce((e, t) => j(t.card) > j(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => j(t.card) > j(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
function tl(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: j(e),
		trump: M(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function nl(e, t) {
	let n = $c(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => j(e[n]) > j(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => j(e[n]) < j(e[t]) ? n : t);
	let i = n.filter((n) => el([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => j(e[n]) < j(e[t]) ? n : t);
}
function rl(e = !1) {
	return Math.max(160, Math.round(420 * (e ? .55 : 1)));
}
function il(e) {
	return e.becameMine && e.inPlayPhase && e.selectedPlay !== null && !e.playLocked && !e.busy && e.isLegal;
}
function al(e) {
	return ul(e.prev, e.next) ? !1 : e.isMyTurn && e.selectedPlay !== null && e.isLegal && e.prev.turnPlayerId !== e.next.turnPlayerId && (e.next.phase ?? "") === "play";
}
function ol(e, t) {
	return e === t ? null : t;
}
function sl(e) {
	let t = ol(e.selectedPlay, e.tappedIndex), n = t === null && e.selectedPlay === e.tappedIndex;
	return {
		nextSelection: t,
		shouldImmediatePlay: t !== null && e.isMyTurn && e.isLegal && !n,
		shouldQueueSelection: t !== null && !e.isMyTurn && e.isLegal && !n,
		shouldCancelAutoplay: n || t !== e.selectedPlay,
		isDeselect: n
	};
}
function cl(e, t) {
	return e && t;
}
function ll(e) {
	return `${e.handNumber}:${e.trickNumber ?? 0}:${e.turnPlayerId ?? ""}:${e.phase ?? ""}`;
}
function ul(e, t) {
	return e.handNumber !== t.handNumber || (e.phase ?? "") !== (t.phase ?? "");
}
function dl(e) {
	let [t, n, r, i] = e.split(":");
	return {
		handNumber: Number(t) || 0,
		trickNumber: n === "" || n === "0" ? null : Number(n),
		turnPlayerId: r || null,
		phase: i || null
	};
}
function fl(e) {
	return e.showBestPlayControl && e.inPlayPhase && e.bestPlayEnabled && e.recommendedPlayIndex !== null && e.recommendedPlayIndex >= 0;
}
function pl(e) {
	return e.inPlayPhase ? e.selectedPlay === e.cardIndex ? "play-preselected" : e.showBestPlayRecommendation && e.recommendedPlayIndex === e.cardIndex ? "play-recommended" : e.isMyTurn && e.isLegal && !e.busy ? "legal-playable" : null : null;
}
function ml(e, t) {
	return t ? t.includes(e) : !0;
}
function hl(e, t, n) {
	if (!n?.length || !e.length) return null;
	let r = nl(e, Kc({
		hand: e,
		publicHand: t
	}));
	return n.includes(r) ? r : n[0] ?? null;
}
function gl(e, t, n, r = Infinity, i = []) {
	if (!e.length || n <= 0) return [];
	let a = new Set(i), o = e.map((e, t) => t).filter((e) => !a.has(e)).filter((n) => !M(e[n], t)).filter((t) => e[t].rank !== "A");
	return o.length ? tl(o.map((t) => e[t]), t, n, r).map((e) => o[e]) : [];
}
function _l(e) {
	return e.drawSelectionTouched ? [...e.selectedDraw].sort((e, t) => e - t) : e.bestPlayEnabled ? [...e.recommendedDiscardIndices].sort((e, t) => e - t) : [...e.selectedDraw].sort((e, t) => e - t);
}
//#endregion
//#region src/table/layout/seatPresetAnchors.ts
var vl = {
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
}, yl = {
	sixBotBottomLeft: vl[1],
	sixBotBottomRight: vl[6],
	sixBotTopCenter: vl[4]
}, bl = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: yl.sixBotBottomLeft,
	2: vl[3],
	3: vl[5],
	4: yl.sixBotBottomRight
}, xl = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: yl.sixBotBottomLeft,
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
	5: yl.sixBotBottomRight
}, Sl = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: yl.sixBotBottomLeft,
	2: vl[2],
	3: vl[3],
	4: yl.sixBotTopCenter,
	5: vl[5],
	6: {
		x: 98,
		y: 46.5,
		region: "right"
	},
	7: yl.sixBotBottomRight
}, Cl = {
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
}, wl = {
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
}, Tl = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: Cl[1],
	2: Cl[2],
	3: Cl[3],
	4: Cl[4],
	5: Cl[5],
	6: {
		x: 92,
		y: 46.5,
		region: "right"
	},
	7: Cl[6]
}, El = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: wl[1],
	2: wl[2],
	3: wl[3],
	4: wl[4],
	5: wl[5],
	6: {
		x: 92,
		y: 46.5,
		region: "right"
	},
	7: wl[6]
};
Cl[1], Cl[6], Cl[4];
function Dl(e) {
	return e === "landscape" ? wl : Cl;
}
function Ol(e) {
	return e === "landscape" ? El : Tl;
}
function kl(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function Al(e, t) {
	return kl(e, t) >= 5;
}
function jl(e, t, n) {
	if (n !== "play") return [];
	let r = [...new Set(t.filter(Boolean))];
	return r.length < 2 || 5 - kl(e, r) != 1 ? [] : r.filter((t) => (e[t] ?? 0) === 0);
}
function Ml(e, t, n, r) {
	return jl(t, n, r).includes(e);
}
function Nl(e, t) {
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
function Pl(e) {
	return `$${e.toLocaleString("en-US")}`;
}
function Fl(e) {
	let t = Math.round(Number(e) * 100) / 100;
	return !Number.isFinite(t) || t <= 0 ? "$0" : t < 1 ? `${Math.round(t * 100)}¢` : Math.round(t * 100) % 100 == 0 ? `$${Math.round(t).toLocaleString("en-US")}` : `$${t.toFixed(2)}`;
}
function Il(e) {
	let t = Number(e) || 0;
	return t > 0 ? `+${Pl(t)}` : t < 0 ? `−${Pl(Math.abs(t))}` : Pl(0);
}
function X(e) {
	return Pl(Math.max(0, Number(e) || 0));
}
function Z(e, t, n) {
	return e == null || n.anteAlreadyPosted || n.anteLandedThisHand || !n.inHand || !n.anteAnimActive ? e : Math.max(0, e - Math.max(0, t));
}
function Ll(e) {
	return (e || "?").trim().replace(/\s+bot$/i, "").replace(/^bot\s+/i, "").trim() || "?";
}
function Rl(e) {
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
function zl(e) {
	let t = Math.cos(e), n = Math.sin(e);
	return Math.abs(n) >= Math.abs(t) ? n > 0 ? "bottom" : "top" : t > 0 ? "right" : "left";
}
var Bl = Sl, Vl = vl, Hl = bl, Ul = xl;
function Wl(e, t) {
	let { rx: n, ry: r, outset: i } = Rl(t), a = e / t * Math.PI * 2 + Math.PI / 2, o = Math.cos(a), s = Math.sin(a);
	return {
		x: 50 + n * o + o * i,
		y: 50 + r * s + s * i,
		region: zl(a)
	};
}
function Gl(e, t) {
	let n = Math.max(2, Math.min(8, t || 2));
	if (n <= 0) return {
		x: 50,
		y: 50,
		region: "bottom"
	};
	if (n === 5) {
		let t = Hl[e];
		if (t) return t;
	}
	if (n === 6) {
		let t = Ul[e];
		if (t) return t;
	}
	if (n === 7) {
		let t = Vl[e];
		if (t) return t;
	}
	if (n >= 8) {
		let t = Bl[e];
		if (t) return t;
	}
	return Wl(e, n);
}
function Kl(e) {
	let t = Math.max(2, Math.min(8, e || 2));
	return t === 2 ? 1.04 : t === 3 ? .94 : t === 4 ? .98 : t === 5 ? 1.08 : t === 6 ? 1.12 : t === 7 ? 1.16 : 1.2;
}
var ql = 5250 + Xl({}).pipelineMs + 500;
function Jl(e) {
	return e === "trickComplete" || e === "winnerReveal";
}
function Yl(e = !1) {
	let t = e ? .55 : 1;
	return {
		cardLandMs: Math.round(560 * t),
		postTrickReadMs: Math.round(525 * t),
		winnerRevealMs: Math.round(400 * t),
		trickSweepMs: Math.round(900 * t),
		nextLeadGapMs: Math.round(230 * t),
		trumpBeatReadMs: Math.round(725 * t)
	};
}
function Xl(e) {
	let t = Yl(e.reducedMotion), n = e.trumpBeat ? t.trumpBeatReadMs : t.postTrickReadMs, r = Math.min(t.winnerRevealMs, n - 200), i = Math.max(200, n - r), a = t.trickSweepMs, o = t.nextLeadGapMs;
	return {
		readBeforeWinnerMs: i,
		winnerRevealMs: r,
		readTotalMs: n,
		sweepMs: a,
		nextLeadGapMs: o,
		pipelineMs: n + a + o
	};
}
function Zl(e, t, n) {
	let r = n.length > 0 ? n : [...new Set([...Object.keys(e), ...Object.keys(t)])];
	for (let n of r) if ((t[n] ?? 0) > (e[n] ?? 0)) return n;
	return null;
}
function Ql(e, t, n) {
	return e.length > 0 ? e : [...new Set([...Object.keys(t), ...Object.keys(n)])];
}
function $l(e) {
	return e?.plays?.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
}
function eu(e, t, n) {
	return e.length ? e.length === 1 ? e[0].playerId : !t || !n ? e[e.length - 1].playerId : el(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n) : null;
}
function tu(e) {
	let t = $l(e.prevTrick), n = e.playedCards?.filter((t) => t.trickNumber === e.trickNumber).map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
	return n.length > t.length ? n : t;
}
function nu(e, t, n) {
	if (!e.length || !t || !n || t === n) return !1;
	let r = el(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n), i = e.find((e) => e.playerId === r);
	return !!(i && M({
		rank: i.card.rank,
		suit: i.card.suit
	}, n));
}
function ru(e) {
	let { prevTricks: t, nextTricks: n, prevTrick: r, playedCards: i } = e, a = Ql(e.participantIds, t, n), o = kl(t, a), s = kl(n, a);
	if (s <= o) return null;
	let c = Zl(t, n, a), l = r?.trickNumber ?? s, u = tu({
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
function iu() {
	return typeof window > "u" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region src/table/feedback/bourrePrivateAudio.ts
var au = null;
function ou(e, t) {
	return `${e}:${t}:bourre-private`;
}
function su(e = Math.random()) {
	return e < .5 ? "fahhh" : "fahhhh";
}
function cu(e) {
	return au === e ? {
		ok: !1,
		reason: "duplicate"
	} : (au = e, { ok: !0 });
}
//#endregion
//#region src/table/feedback/soundPacks.ts
var lu = (/* @__PURE__ */ e(((e) => {
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
})))(), uu = {
	classic: "Classic",
	wood: "Wood & Felt",
	arcade: "Arcade"
}, du = "classic", fu = [
	"card-place-normal",
	"card-place-heavy",
	"lead-sweetener-light",
	"lead-sweetener-strong",
	"trick-win-normal",
	"card-shuffle-normal",
	"card-select",
	"ui-button-press"
];
function pu(e) {
	return fu.includes(e);
}
var mu = /* @__PURE__ */ "card-place-normal.card-place-heavy.card-place-soft.lead-sweetener-light.lead-sweetener-strong.trick-win-normal.trick-win-big.hand-win-stinger.card-shuffle-normal.card-shuffle-final.card-select.card-illegal.close.ui-button-press.coin-chime-light.moneygone.draw.draw1.draw2.draw3.draw4.draw5.Fahhh.fahhh.fahhhh.timer".split("."), hu = {
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
}, gu = {
	1: "draw1",
	2: "draw2",
	3: "draw3",
	4: "draw4",
	5: "draw5"
};
function _u(e) {
	return e >= 1 && e <= 5 ? gu[e] : "draw";
}
var vu = {
	classic: "",
	wood: "packs/wood/",
	arcade: "packs/arcade/"
}, yu = "/sounds/";
function bu(e, t) {
	return `${yu}${vu[e] ?? ""}${hu[t]}`;
}
function xu(e, t, n = {}) {
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
function Su(e) {
	return e === "wood" || e === "arcade" ? e : du;
}
//#endregion
//#region src/audio/audioEvents.ts
function Cu(e, t) {
	let n = Math.min(1, Math.floor((Math.max(2, Math.min(8, e)) - 2) / 3));
	return Math.min(2, n + (t <= 4 ? 0 : 1));
}
function wu(e, t, n) {
	return `${e}:${t}:${n}`;
}
function Tu(e) {
	return {
		type: "card:played",
		trickId: e.trickId,
		cardId: e.cardId,
		playerCount: e.playerCount,
		cardsInTrick: e.cardsInTrick,
		takesLead: e.takesLead,
		isLocalPlayer: e.isLocalPlayer,
		intensityTier: Cu(e.playerCount, e.cardsInTrick)
	};
}
function Eu(e) {
	return {
		type: "card:lead-change",
		trickId: e.trickId,
		cardId: e.cardId,
		playerCount: e.playerCount,
		cardsInTrick: e.cardsInTrick,
		takesLead: !0,
		isLocalPlayer: e.isLocalPlayer,
		intensityTier: Cu(e.playerCount, e.cardsInTrick)
	};
}
function Du(e) {
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
function Ou(e) {
	return e.type === "trick:won" && e.isLocalPlayer === !0;
}
function ku(e) {
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
function Au(e) {
	return e.type === "trick:collected" ? e.isLocalPlayer === !0 ? "trickCollect" : "trickCollectOther" : "trickCollect";
}
//#endregion
//#region src/table/feedback/prefs.ts
var ju = "nbl-feedback", Mu = {
	soundMode: "on",
	soundPackId: du,
	hapticsMode: "on"
};
function Nu(e) {
	if (!e || typeof e != "object") return { ...Mu };
	let t = e, n = t.hapticsMode, r = n === "off" || n === "minimal" || n === "on" ? n : t.hapticsEnabled === !1 ? "off" : "on", i;
	return i = t.soundMode === "on" || t.soundMode === "minimal" || t.soundMode === "off" ? t.soundMode : t.soundEnabled === !1 ? "off" : "on", {
		soundMode: i,
		soundPackId: Su(t.soundPackId),
		hapticsMode: r
	};
}
function Pu() {
	try {
		let e = localStorage.getItem(ju);
		return e ? Nu(JSON.parse(e)) : { ...Mu };
	} catch {
		return { ...Mu };
	}
}
function Fu(e) {
	let t = {
		...Pu(),
		...e
	};
	try {
		localStorage.setItem(ju, JSON.stringify(t));
	} catch {}
	return zu(t), t;
}
function Iu(e, t) {
	return e === "off" ? !1 : e === "on" ? !0 : t === "trickWin" || t === "bigWin" || t === "bourre" || t === "turnTimer";
}
var Lu = /* @__PURE__ */ new Set();
function Ru(e) {
	return Lu.add(e), () => Lu.delete(e);
}
function zu(e) {
	for (let t of Lu) t(e);
}
function Bu() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function Vu(e, t) {
	return !(e === "off" || e === "minimal" && t === "light" || Bu() && t === "light");
}
//#endregion
//#region src/table/feedback/haptics.ts
function Hu() {
	return typeof navigator < "u" && typeof navigator.vibrate == "function";
}
function Uu(e) {
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
var Wu = {
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
function Gu(e) {
	try {
		return Uu(e) ? !0 : Hu() ? navigator.vibrate(Wu[e]) ?? !1 : !1;
	} catch {
		return !1;
	}
}
function Ku() {
	return Hu() || !!(typeof window < "u" && window.BourreHaptics);
}
//#endregion
//#region src/audio/AudioManager.ts
var qu = {
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
function Ju(...e) {
	console.log("[nbl-audio]", ...e);
}
function Yu() {
	try {
		return localStorage.getItem("nbl-audio-debug") === "1";
	} catch {
		return !1;
	}
}
var Xu = class e {
	static instance = null;
	howls = /* @__PURE__ */ new Map();
	unlocked = !1;
	static get() {
		return e.instance ||= new e(), e.instance;
	}
	constructor() {
		for (let e of mu) this.register(e);
	}
	register(e) {
		let t = `/sounds/${hu[e]}`;
		Ju("register", {
			key: e,
			resolvedUrl: t,
			fallback: !1,
			batch1: pu(e)
		});
		let n = new lu.Howl({
			src: [t],
			volume: qu[e] ?? .55,
			preload: !0,
			onload: Yu() ? () => {
				Ju("loaded", {
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
			onplay: Yu() ? () => {
				Ju("playing", {
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
			let t = lu.Howler.ctx;
			t && typeof t.resume == "function" && t.state === "suspended" && (e = !0, t.resume().then(() => {
				Ju("unlock-resume", {
					state: t.state,
					ok: !0
				});
			}, (e) => {
				console.error("[nbl-audio] unlock-resume-failed", {
					state: t.state,
					error: String(e),
					fallback: !1
				});
			})), Ju("unlock", {
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
		return lu.Howler.ctx?.state ?? "none";
	}
	play(e, t) {
		let n = t?.path ?? `/sounds/${hu[e]}`;
		Ju("play", {
			key: e,
			resolvedUrl: n,
			fallback: !1,
			batch1: pu(e),
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
			return r.play(), Yu() && Ju("play-started", {
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
}, Zu = /* @__PURE__ */ new Map(), Qu = /* @__PURE__ */ new Map();
function $u(e) {
	switch (e) {
		case "card:played": return "cardPlace";
		case "card:lead-change": return "leadChange";
		case "trick:won": return "trickWin";
		case "trick:collected": return "trickCollect";
	}
}
function ed(e) {
	switch (e) {
		case "card:played": return 0;
		case "card:lead-change": return 0;
		case "trick:won": return 0;
		case "trick:collected": return 0;
	}
}
function td(e) {
	switch (e.type) {
		case "card:played":
		case "card:lead-change": return e.cardId ?? "unknown";
		case "trick:won":
		case "trick:collected": return `${e.winningSeat ?? "unknown"}:${e.type}`;
	}
}
function nd(e) {
	let t = Zu.get(e);
	return t == null ? !1 : Date.now() - t > 9e4 ? (Zu.delete(e), !1) : !0;
}
function rd(e) {
	Zu.set(e, Date.now());
}
function id() {
	Zu.clear();
	for (let e of Qu.values()) clearTimeout(e);
	Qu.clear();
}
var ad = {
	cardPlace: .38,
	leadChange: .42,
	trickWin: .55,
	trickCollect: .4,
	trickCollectOther: .45
};
function od(e, t = {}) {
	let n = Pu().soundPackId, r = xu(n, e, t);
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
	let i = bu(n, r), a = pu(r);
	console.log("[nbl-audio] request", {
		event: e,
		key: r,
		resolvedUrl: i,
		fallback: !1,
		batch1: a,
		packId: n,
		ctx: t
	});
	let o = ad[e] ?? .55, s = e === "trickWin" ? o * (t.volumeScale ?? 1) : o;
	Xu.get().play(r, {
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
function sd(e) {
	let t = Pu(), n = $u(e.type);
	if (Iu(t.soundMode, n)) switch (e.type) {
		case "card:played":
			od("cardPlace", { intensityTier: e.intensityTier });
			break;
		case "card:lead-change":
			od("leadChange", { intensityTier: e.intensityTier });
			break;
		case "trick:won": {
			let t = Ou(e);
			if (console.log("[nbl-audio] trick-win-gate", {
				event: "trickWin",
				key: "trick-win-normal",
				allowed: t,
				isLocalPlayer: e.isLocalPlayer ?? !1
			}), !t) break;
			od("trickWin", {
				volumeScale: 1.08,
				isLocalPlayer: !0
			});
			break;
		}
		case "trick:collected": {
			let t = Au(e);
			console.log("[nbl-audio] trick-collect-gate", {
				event: t,
				isLocalPlayer: e.isLocalPlayer ?? !1,
				winningSeat: e.winningSeat
			}), od(t);
			break;
		}
	}
}
function cd(e) {
	let t = Pu();
	if (e.type === "trick:won" && e.isLocalPlayer) {
		Vu(t.hapticsMode, "medium") && Gu("medium");
		return;
	}
	e.type === "card:lead-change" && e.isLocalPlayer && Vu(t.hapticsMode, "light") && Gu("light");
}
function ld(e) {
	try {
		let t = wu(e.type, e.trickId, td(e));
		if (nd(t)) return;
		let n = ed(e.type), r = () => {
			nd(t) || (rd(t), sd(e), cd(e));
		};
		if (n <= 0) {
			r();
			return;
		}
		let i = t, a = Qu.get(i);
		a && clearTimeout(a);
		let o = setTimeout(() => {
			Qu.delete(i), r();
		}, n);
		Qu.set(i, o);
	} catch {}
}
//#endregion
//#region src/table/feedback/audio.ts
var ud = !1;
function dd() {
	return Pu().soundPackId;
}
function fd(e, t, n) {
	console.log("[nbl-audio]", e, {
		event: t,
		...n
	});
}
function pd(e, t, n = {}) {
	console.error("[nbl-audio] FAIL", {
		event: e,
		reason: t,
		fallback: !1,
		...n
	});
}
function md(e = "unknown") {
	let t = ud;
	ud = !0;
	let n = Xu.get().unlock(), r = Xu.get().getContextState();
	return fd("unlock-attempt", "draw", {
		source: e,
		wasUnlocked: t,
		nowUnlocked: ud,
		managerOk: n,
		ctxState: r
	}), ud && n;
}
async function hd(e) {
	ud && (Xu.get().unlock(), fd("preload", "shuffle", { packId: e ?? dd() }));
}
var gd = {
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
}, _d = {
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
}, vd = {
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
function yd(e, t, n, r) {
	md(`play:${e}`);
	let i = bu(r, t), a = pu(t);
	if (fd("request", e, {
		key: t,
		resolvedUrl: i,
		fallback: !1,
		batch1: a,
		volume: n,
		packId: r,
		unlocked: ud
	}), !ud) return pd(e, "audio-not-unlocked", {
		key: t,
		resolvedUrl: i,
		batch1: a
	}), !1;
	if (a && i !== bu(r, t)) return pd(e, "batch1-url-mismatch", {
		key: t,
		resolvedUrl: i
	}), !1;
	let o = Xu.get().play(t, {
		volume: n,
		event: e,
		path: i
	});
	return o ? fd("play-ok", e, {
		key: t,
		resolvedUrl: i
	}) : pd(e, "howler-play-failed", {
		key: t,
		resolvedUrl: i,
		batch1: a
	}), o;
}
async function Q(e, t = {}) {
	let n = gd[e];
	if (n.current) return;
	n.current = !0;
	let r = dd(), i = xu(r, e, t);
	try {
		if (!i) {
			pd(e, "no-asset-mapping", {
				packId: r,
				ctx: t
			});
			return;
		}
		yd(e, i, vd[e], r);
	} catch (t) {
		pd(e, "play-threw", { error: String(t) });
	} finally {
		window.setTimeout(() => {
			n.current = !1;
		}, _d[e]);
	}
}
function bd() {
	Q("shuffle");
}
function xd(e) {
	Sd(e);
}
async function Sd(e) {
	let t = "draw";
	md("draw-count");
	let n = gd[t];
	if (n.current) return;
	n.current = !0;
	let r = dd(), i = _u(e);
	try {
		if (!i) {
			pd(t, "no-asset-mapping", {
				packId: r,
				cardCount: e
			});
			return;
		}
		fd("draw-request", t, {
			cardCount: e,
			key: i,
			unlocked: ud
		}), yd(t, i, vd[t], r);
	} catch (n) {
		pd(t, "play-threw", {
			error: String(n),
			cardCount: e
		});
	} finally {
		window.setTimeout(() => {
			n.current = !1;
		}, _d[t]);
	}
}
function Cd(e = 1) {
	wd(e);
}
async function wd(e) {
	let t = "trickWin", n = gd[t];
	if (n.current) return;
	n.current = !0;
	let r = dd(), i = xu(r, t, { volumeScale: e });
	try {
		if (!i) {
			pd(t, "no-asset-mapping", {
				packId: r,
				volumeScale: e
			});
			return;
		}
		yd(t, i, vd[t] * e, r);
	} catch (e) {
		pd(t, "play-threw", { error: String(e) });
	} finally {
		window.setTimeout(() => {
			n.current = !1;
		}, _d[t]);
	}
}
function Td() {
	Q("bigWin");
}
function Ed() {
	Q("bourre");
}
function Dd(e, t = {}) {
	console.log(`[nbl-audio] bourre-private ${e}`, t);
}
function Od(e) {
	Dd(`skipped reason=${e}`);
}
function kd(e, t) {
	if (Dd(`eligible ${t}`), !t) {
		Od("not-local");
		return;
	}
	let n = cu(e);
	if (!n.ok) {
		Od(n.reason ?? "duplicate");
		return;
	}
	if (md("bourre-private"), !ud) {
		Od("audio-locked");
		return;
	}
	let r = su();
	Dd(`chosen ${r}`);
	let i = bu(dd(), r);
	if (!i) {
		Od("missing-asset");
		return;
	}
	if (!Xu.get().play(r, {
		volume: .5,
		event: "bourre",
		path: i
	})) {
		Od("missing-asset");
		return;
	}
	Dd("played", {
		assetId: r,
		dedupeKey: e
	});
}
function Ad() {
	Q("gameStart");
}
function jd() {
	Q("openRoom");
}
function Md() {
	Q("deleteRoom");
}
function Nd() {
	Q("cardSelect");
}
function Pd() {
	Q("cardIllegal");
}
function Fd() {
	Q("uiButton");
}
function Id() {
	Q("fold");
}
function Ld() {
	return typeof window < "u";
}
var Rd = 700, zd = 500, Bd = 450, Vd = 1200, Hd = 2e3, Ud = 1500, Wd = 280, Gd = 0, Kd = 0, qd = 0, Jd = 0, Yd = 0, Xd = 0, Zd = 0, Qd = null, $d = !1;
function ef() {
	return Pu();
}
function tf(e) {
	Vu(ef().hapticsMode, e) && Gu(e);
}
function nf(e, t) {
	Iu(ef().soundMode, e) && t();
}
function rf() {
	if ($d || typeof window > "u") return;
	$d = !0;
	let e = () => {
		md("init-pointerdown");
	};
	window.addEventListener("pointerdown", e, {
		once: !0,
		passive: !0
	}), window.addEventListener("keydown", e, { once: !0 });
}
function af(e = {}) {
	if (Date.now() - Gd < Rd) return;
	Qd &&= (clearTimeout(Qd), null);
	let t = e.delayMs ?? (Bu() ? 0 : 40);
	Qd = window.setTimeout(() => {
		Qd = null, Gd = Date.now(), nf("shuffle", bd), tf("light");
	}, t);
}
function of(e) {
	md("draw-confirm");
	let t = Date.now();
	t - Kd < zd || (Kd = t, nf("draw", () => xd(e)), tf("light"));
}
function sf() {
	of(0);
}
function cf() {
	let e = Date.now();
	e - qd < Bd || (qd = e, nf("trickWin", Cd), tf("medium"));
}
function lf() {
	let e = Date.now();
	e - Jd < Vd || (Jd = e, nf("bigWin", Td), tf("strong"));
}
function uf() {
	let e = Date.now();
	e - Yd < Hd || (Yd = e, nf("bourre", Ed), tf("medium"));
}
function df(e) {
	if (!e.isLocalBourredPlayer) return;
	let t = ou(e.sessionId, e.handNumber);
	nf("bourre", () => kd(t, e.isLocalBourredPlayer)), tf("medium");
}
function ff() {
	let e = Date.now();
	e - Xd < Ud || (Xd = e, nf("gameStart", Ad), tf("light"));
}
function pf() {
	let e = Date.now();
	e - Zd < Wd || (Zd = e, nf("cardIllegal", Pd), tf("light"));
}
function mf() {
	nf("openRoom", jd);
}
function hf() {
	nf("deleteRoom", Md);
}
function gf() {
	nf("cardSelect", Nd);
}
function _f() {
	nf("uiButton", Fd);
}
function vf() {
	nf("fold", Id);
}
function yf() {
	tf("light");
}
//#endregion
//#region src/table/actionErrorCopy.ts
function bf(e) {
	let t = String(e ?? "").trim();
	if (!t) return null;
	let n = t.toLowerCase();
	return n === "internal" || n.includes("internal error") ? "The server could not finish that table action. Refresh the page and try again." : t;
}
//#endregion
//#region src/table/theme/cardPacks.ts
var xf = "classic";
function Sf(e) {
	return e === "elegant" || e === "casino" || e === "midnight" ? e : xf;
}
//#endregion
//#region src/table/theme/settings.ts
var Cf = "nbl-table-settings", wf = {
	focusTable: "F",
	toggleSettings: ",",
	standPat: "P",
	nextTable: "Tab"
}, Tf = {
	classic: "Classic",
	elegant: "Elegant",
	casino: "Casino",
	midnight: "Midnight"
}, Ef = {
	themeId: "night-felt",
	cardPackId: xf,
	deckMode: "classic",
	cardScale: "md",
	highContrast: !1,
	tableScale: 1,
	layoutMode: "single",
	hotkeys: { ...wf }
}, Df = {
	carbon: "Carbon",
	simple: "Simple",
	"night-felt": "Night Felt",
	arena: "Arena"
};
function Of(e) {
	return Math.max(.85, Math.min(1.35, e));
}
function kf() {
	try {
		let e = localStorage.getItem(Cf);
		if (!e) return {
			...Ef,
			hotkeys: { ...wf }
		};
		let t = JSON.parse(e);
		return {
			...Ef,
			...t,
			cardPackId: Sf(t.cardPackId),
			tableScale: Of(t.tableScale ?? Ef.tableScale),
			hotkeys: {
				...wf,
				...t.hotkeys
			}
		};
	} catch {
		return {
			...Ef,
			hotkeys: { ...wf }
		};
	}
}
function Af(e) {
	try {
		localStorage.setItem(Cf, JSON.stringify(e));
	} catch {}
}
function jf(e, t) {
	e.dataset.tableTheme = t.themeId, e.dataset.cardPack = t.cardPackId, e.dataset.deckMode = t.deckMode, e.dataset.cardScale = t.cardScale, e.dataset.highContrast = t.highContrast ? "true" : "false", e.dataset.layoutMode = t.layoutMode, e.style.setProperty("--table-scale", String(t.tableScale));
}
//#endregion
//#region src/table/theme/TableThemeContext.tsx
var Mf = (0, l.createContext)(null);
function Nf({ settings: e, children: t }) {
	let n = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		n.current && jf(n.current, e);
	}, [e]), /* @__PURE__ */ (0, x.jsx)("div", {
		ref: n,
		className: "btable-room",
		children: t
	});
}
function Pf({ children: e }) {
	let [t, n] = (0, l.useState)(() => kf()), r = (0, l.useCallback)((e) => {
		n((t) => {
			let n = {
				...t,
				...e,
				hotkeys: {
					...t.hotkeys,
					...e.hotkeys
				}
			};
			return Af(n), n;
		});
	}, []), i = (0, l.useCallback)(() => {
		let e = {
			...Ef,
			hotkeys: { ...Ef.hotkeys }
		};
		Af(e), n(e);
	}, []), a = (0, l.useMemo)(() => ({
		settings: t,
		updateSettings: r,
		resetSettings: i
	}), [
		t,
		r,
		i
	]);
	return /* @__PURE__ */ (0, x.jsx)(Mf.Provider, {
		value: a,
		children: /* @__PURE__ */ (0, x.jsx)(Nf, {
			settings: t,
			children: e
		})
	});
}
//#endregion
//#region src/table/theme/useTableTheme.ts
function Ff() {
	let e = (0, l.useContext)(Mf);
	if (!e) throw Error("useTableTheme must be used within TableThemeProvider");
	return e;
}
//#endregion
//#region src/table/presentationScope.ts
function If(e, t) {
	return `${Math.max(0, Number(e) || 0)}:${Math.max(0, Number(t) || 0)}`;
}
function Lf(e) {
	return Math.max(0, e?.trickNumber ?? 0);
}
function Rf(e) {
	return e.phase === "live" ? e.pendingResolution?.frozen.trickNumber ?? e.prevTrick?.trickNumber ?? 0 : e.frozenTrick?.trickNumber ?? 0;
}
function zf(e) {
	let { handNumber: t, prevHandNumber: n, serverTrickNumber: r, prevServerTrickNumber: i, store: a } = e;
	if (t > 0 && t !== n) return !0;
	if (t <= 0 || r <= 0 || r === i) return !1;
	let o = Rf(a), s = a.phase !== "live" || !!a.pendingResolution;
	return !!(r > o || s && r !== i);
}
function Bf(e, t) {
	return e !== t;
}
//#endregion
//#region src/table/presentationMotionBusy.ts
var Vf = !1, Hf = !1, Uf = null, Wf = "0:0", Gf = /* @__PURE__ */ new Set();
function Kf() {
	for (let e of Gf) e();
}
function qf(e) {
	e !== Wf && (Wf = e, Hf && (Hf = !1, Uf = null), Kf());
}
function Jf() {
	return Wf;
}
function Yf(e) {
	Vf !== e && (Vf = e, Kf());
}
function Xf() {
	return Vf;
}
function Zf(e, t) {
	if (e) Hf = !0, Uf = t ?? Wf;
	else {
		if (t && Uf && t !== Uf) return;
		Hf = !1, Uf = null;
	}
	Kf();
}
function Qf() {
	return !(!Hf || Uf && Bf(Uf, Wf));
}
function $f(e) {
	return Gf.add(e), () => Gf.delete(e);
}
function ep() {
	Vf = !1, Hf = !1, Uf = null, Kf();
}
var tp = {
	matchKey: "",
	presentationScopeKey: "0:0",
	pipelineActive: !1,
	revealCatchUp: !1,
	motionGateActive: !1,
	peakPlayCount: 0,
	displayedPlayCount: 0,
	handPresenting: !1,
	handPresentationPhase: "idle",
	dealPresentationActive: !1,
	trickCollectionActive: !1
}, np = tp, rp = /* @__PURE__ */ new Set(), ip = 0, ap = null, op = "";
function sp(e) {
	op = e;
}
function cp(e) {
	return !op || !e.matchKey ? !1 : e.matchKey !== op;
}
function lp(e, t) {
	return e.matchKey === t.matchKey && e.presentationScopeKey === t.presentationScopeKey && e.pipelineActive === t.pipelineActive && e.revealCatchUp === t.revealCatchUp && e.motionGateActive === t.motionGateActive && e.peakPlayCount === t.peakPlayCount && e.displayedPlayCount === t.displayedPlayCount && e.handPresenting === t.handPresenting && e.handPresentationPhase === t.handPresentationPhase && e.dealPresentationActive === t.dealPresentationActive && e.trickCollectionActive === t.trickCollectionActive;
}
function up(e) {
	return Bf(e.presentationScopeKey, Jf());
}
function dp(e) {
	return cp(e) || up(e) ? null : e.dealPresentationActive ? "dealPresentationActive" : e.trickCollectionActive ? "trickCollectionActive" : e.handPresenting ? "handPresenting" : e.pipelineActive ? "pipelineActive" : e.revealCatchUp ? "revealCatchUp" : e.peakPlayCount > e.displayedPlayCount && e.peakPlayCount > 0 ? "peakPlayCatchUp" : null;
}
function fp(e) {
	return dp(e) != null;
}
var pp = new Set([
	"handReset",
	"ante",
	"trumpReveal",
	"trumpMerge"
]);
function mp(e, t, n) {
	return !(!e || n === "play" || n === "draw" && (t === "drawPlayer" || t === "drawReady" || pp.has(t)));
}
function hp(e, t, n) {
	return mp(e, t, n) ? `${t}@${n ?? "null"}` : null;
}
function gp(e) {
	let t = { ...np }, n = ap ? Date.now() - ap.since : 0, r = {
		...np,
		presentationScopeKey: Jf(),
		pipelineActive: !1,
		revealCatchUp: !1,
		handPresenting: !1,
		handPresentationPhase: "idle",
		peakPlayCount: np.displayedPlayCount,
		motionGateActive: !1,
		dealPresentationActive: !1,
		trickCollectionActive: !1
	};
	ip = Date.now() + 1500, ap = null, m() && h("trickAnimationBridge", "table-presentation-force-release", {
		source: e,
		blockedMs: n,
		from: t,
		to: r
	}), yp(r);
}
function _p(e = Date.now()) {
	if (e < ip) return {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	let t = dp(np);
	if (t == null) return ap = null, {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	(!ap || ap.reason !== t) && (ap = {
		reason: t,
		since: e,
		blockedLogged: !1
	});
	let n = e - ap.since;
	return n >= 7e3 ? (m() && !ap.blockedLogged && h("trickAnimationBridge", "gate-force-release", {
		reason: t,
		blockedMs: n
	}), gp("gate-timeout"), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !0
	}) : n >= 5500 ? (m() && !ap.blockedLogged && (h("trickAnimationBridge", "gate-soft-unblock", {
		reason: t,
		blockedMs: n
	}), ap.blockedLogged = !0), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !1
	}) : (m() && !ap.blockedLogged && (h("trickAnimationBridge", "gate-blocked", {
		reason: t,
		blockedMs: n
	}), ap.blockedLogged = !0), {
		blocked: !0,
		reason: t,
		blockedMs: n,
		softUnblock: !1,
		forceReleased: !1
	});
}
function vp(e = Date.now()) {
	return _p(e).blocked;
}
function yp(e) {
	let t = Jf(), n = Bf(e.presentationScopeKey, t) ? {
		...e,
		presentationScopeKey: t,
		pipelineActive: !1,
		revealCatchUp: !1,
		peakPlayCount: 0,
		displayedPlayCount: 0,
		trickCollectionActive: !1
	} : e;
	if (cp(n) && (n = {
		...n,
		matchKey: op,
		pipelineActive: !1,
		revealCatchUp: !1,
		motionGateActive: !1,
		handPresenting: !1,
		handPresentationPhase: "idle",
		peakPlayCount: n.displayedPlayCount,
		dealPresentationActive: !1,
		trickCollectionActive: !1
	}), !lp(np, n)) {
		m() && h("trickAnimationBridge", "busy-state", {
			from: np,
			to: n,
			busy: fp(n),
			blockReason: dp(n),
			motionGateActive: n.motionGateActive,
			handPresentationPhase: n.handPresentationPhase,
			authoritativeScope: t
		}), np = n, dp(n) ?? (ap = null);
		for (let e of rp) e();
	}
}
function bp(e) {
	qf(e), Bf(np.presentationScopeKey, e) && yp({
		...np,
		presentationScopeKey: e,
		pipelineActive: !1,
		revealCatchUp: !1,
		peakPlayCount: 0,
		displayedPlayCount: 0,
		trickCollectionActive: !1
	});
}
function xp() {
	ip = 0, ap = null, op = "", qf("0:0"), ep(), yp(tp);
}
function Sp() {
	return np;
}
function Cp() {
	return cp(np) || up(np) ? !1 : np.pipelineActive || np.revealCatchUp || np.motionGateActive || np.trickCollectionActive || np.peakPlayCount > np.displayedPlayCount && np.peakPlayCount > 0;
}
function wp() {
	return fp(np);
}
function Tp(e) {
	return rp.add(e), () => rp.delete(e);
}
//#endregion
//#region src/table/stageFitMotionFreeze.ts
var Ep = !1, Dp = /* @__PURE__ */ new Set();
function Op() {
	for (let e of Dp) e();
}
function kp(e) {
	Ep !== e && (Ep = e, Op());
}
function Ap() {
	if (Xf() || Qf() || Ep || Cp()) return !0;
	let e = Sp();
	return !!(e.handPresenting && e.handPresentationPhase !== "idle");
}
function jp(e) {
	Dp.add(e);
	let t = $f(e), n = Tp(e);
	return () => {
		Dp.delete(e), t(), n();
	};
}
//#endregion
//#region src/table/HeroHand.tsx
function Mp(e) {
	return `${e.rank}-${e.suit}`;
}
function Np(e, t) {
	if (!t) return e;
	let n = Mp(t.card);
	if (e.some((e) => Mp(e) === n)) return e;
	let r = [...e], i = Math.min(Math.max(t.slotIndex, 0), r.length);
	return r.splice(i, 0, t.card), r;
}
function Pp(e, t, n = []) {
	return [
		`btable-hero btable-hero--bare btable-hero--scale-${e.cardScale}`,
		...n,
		t
	].filter(Boolean).join(" ");
}
function Fp({ className: e = "" }) {
	return /* @__PURE__ */ (0, x.jsx)("div", {
		className: `btable-hero btable-hero--bare btable-hero--reserved ${e}`.trim(),
		"aria-hidden": "true",
		"data-testid": "hero-hand"
	});
}
function Ip({ cards: e, phase: t, enrollmentActive: n = !1, isInHand: r = !1, isDealer: i = !1, signedIn: a = !1, isMyTurn: o = !1, drawCompleted: s = !1, maxDrawDiscards: c = 4, legalPlayIndices: u, recommendedPlayIndex: d = null, recommendedDiscardIndices: f = [], handComplete: p = !1, actionFeedback: m, onSubmitDraw: h, onPassDraw: g, onFoldDraw: _, onPlayCard: v, privateHandReady: y = !1, className: b = "", dealStaggerMs: S = 120, drawAnimSubPhase: C = null, drawDiscardCount: w = 0, drawReplaceCount: T = 0, currentUserId: E = null, revealedTrumpIndex: D = null, trumpMergeActive: O = !1, trumpDisabledIndex: k = null, handNumber: A = 0, trickNumber: j = null, turnPlayerId: M = null, tableRootRef: N, pileIndexRef: ee, onDiscardCommitted: P, onUserActivity: F, skipHeroDealMotion: I = !1 }) {
	let { settings: te } = Ff(), [L, R] = (0, l.useState)(/* @__PURE__ */ new Set()), [z, B] = (0, l.useState)(null), [re, ie] = (0, l.useState)(null), [V, ae] = (0, l.useState)(null), [oe, H] = (0, l.useState)(!1), [se, ce] = (0, l.useState)(null), [le, U] = (0, l.useState)(null), [ue, W] = (0, l.useState)(null), [de, fe] = (0, l.useState)(() => Pc()), [G, pe] = (0, l.useState)(!1), [me, he] = (0, l.useState)(!1), [ge, K] = (0, l.useState)(!1), [_e, ve] = (0, l.useState)([]), [ye, be] = (0, l.useState)(0), xe = (0, l.useRef)(/* @__PURE__ */ new Set()), Se = (0, l.useRef)(null), Ce = (0, l.useRef)(!1), we = (0, l.useRef)(null), Te = (0, l.useRef)(null), Ee = (0, l.useRef)(0), De = (0, l.useRef)({
		handNumber: 0,
		trickNumber: null,
		turnPlayerId: null,
		isMyTurn: !1,
		busy: !1,
		selectedPlay: null
	}), Oe = ll({
		handNumber: A,
		trickNumber: j,
		turnPlayerId: M,
		phase: t ?? null
	}), [ke, Ae] = (0, l.useState)(!1), je = (0, l.useRef)(async () => {}), Me = Bs(t), Ne = (0, l.useMemo)(() => Sc(), [ye]), Pe = (0, l.useMemo)(() => Np(e, Ne), [e, Ne]), Fe = (0, l.useMemo)(() => Pe.map(Ls), [Pe]), Ie = (0, l.useMemo)(() => Pe.map((e) => Mp(e)).join("|"), [Pe]), Le = (0, l.useMemo)(() => f.slice().sort((e, t) => e - t).join(","), [f]), Re = t === "draw", ze = t === "play", Be = Ne != null, Ve = oe || m?.status === "loading" || re !== null || Be;
	De.current = {
		handNumber: A,
		trickNumber: j,
		turnPlayerId: M,
		isMyTurn: o,
		busy: Ve,
		selectedPlay: z
	};
	let He = (0, l.useCallback)((e, t) => {
		let n = [];
		return Ne && t === Ne.slotIndex && n.push("hand__slot--play-handoff"), D === t && n.push(O ? "hand__slot--trump-merge-target" : "hand__slot--trump-revealed"), n.join(" ");
	}, [
		Ne,
		D,
		O
	]);
	(0, l.useEffect)(() => {
		if (I || !Me || e.length === 0) return;
		let t = new Set(e.map((e) => `${e.rank}-${e.suit}`)), n = xe.current, r = [...t].some((e) => !n.has(e));
		if (xe.current = t, !r || n.size > 0) return;
		pe(!0), ie(null), B(null);
		let i = Is(e.length, S), a = window.setTimeout(() => pe(!1), i);
		return () => window.clearTimeout(a);
	}, [
		e,
		Me,
		S,
		I
	]), (0, l.useEffect)(() => {
		(C === "done" || C === null) && ve([]);
	}, [C]), (0, l.useEffect)(() => Tc(() => {
		be((e) => e + 1), Sc() || ie(null);
	}), []), (0, l.useEffect)(() => {
		ze || wc();
	}, [
		ze,
		A,
		j
	]), (0, l.useEffect)(() => (kp(re !== null || Be), () => kp(!1)), [re, Be]), Fs(Se, {
		dealing: G,
		dealStaggerMs: S,
		drawAnimSubPhase: C,
		drawDiscardCount: w,
		drawReplaceCount: T,
		pendingDiscardIndices: _e,
		standPatPulse: me,
		foldOutPulse: ge,
		playingIndex: re,
		cards: e,
		handNumber: A,
		playerId: E,
		tableRootRef: N,
		pileIndexRef: ee,
		onDiscardCommitted: P,
		skipHeroDealMotion: I
	});
	let Ue = (0, l.useCallback)((e) => {
		if (we.current != null && (window.clearTimeout(we.current), we.current = null, e)) {
			let e = De.current;
			e.handNumber, e.trickNumber, e.turnPlayerId, e.selectedPlay, Ee.current, e.isMyTurn, Ce.current, e.busy;
		}
		Te.current = null;
	}, []);
	(0, l.useEffect)(() => Oc(() => {
		Ue("match-key-change"), B(null), Ee.current += 1;
	}), [Ue]);
	let We = (0, l.useCallback)(() => (Ee.current += 1, Ee.current), []);
	(0, l.useEffect)(() => () => Ue(), [Ue]), (0, l.useEffect)(() => {
		Ue(), B(null), R(/* @__PURE__ */ new Set()), Ae(!1), ae(null), U(null), W(null), ce(null);
	}, [
		t,
		Ie,
		Ue
	]), (0, l.useEffect)(() => {
		z !== null && (ml(z, u) || (B(null), Te.current = null, Ue()));
	}, [
		u,
		z,
		Ue
	]), (0, l.useEffect)(() => {
		if (!de || !Re || s || ke) return;
		let e = f;
		R((t) => t.size === e.length && e.every((e) => t.has(e)) ? t : new Set(e));
	}, [
		de,
		Re,
		s,
		ke,
		Le,
		f
	]);
	let Ge = (0, l.useCallback)((e) => {
		Ue(), Te.current = e;
		let t = Ee.current, n = rl(iu());
		we.current = window.setTimeout(() => {
			we.current = null, t === Ee.current && Te.current === e && (Te.current = null, je.current(e));
		}, n);
	}, [
		Ue,
		A,
		j,
		M
	]), Ke = (0, l.useRef)(Oe);
	(0, l.useEffect)(() => {
		if (Ke.current === Oe) return;
		let e = dl(Ke.current), t = dl(Oe), n = al({
			prev: e,
			next: t,
			isMyTurn: o,
			selectedPlay: z,
			isLegal: z != null && ml(z, u)
		});
		if (Ke.current = Oe, ul(e, t)) {
			We(), Ue("play-activity-change"), B(null);
			return;
		}
		n || (We(), Ue("play-activity-change"));
	}, [
		Oe,
		We,
		Ue,
		A,
		j,
		M,
		o,
		z,
		u
	]);
	let qe = (0, l.useRef)(o);
	(0, l.useEffect)(() => {
		let e = o && !qe.current;
		if (qe.current = o, !il({
			becameMine: e,
			inPlayPhase: ze,
			selectedPlay: z,
			playLocked: Ce.current,
			busy: Ve,
			isLegal: z != null && ml(z, u)
		})) {
			e && z !== null && !ml(z, u) && (B(null), Te.current = null);
			return;
		}
		Ge(z);
	}, [
		ze,
		o,
		z,
		u,
		Ve,
		Ge
	]), (0, l.useEffect)(() => {
		m?.status === "success" ? (ie(null), Ue(), Ce.current = !1) : m?.status === "error" && (ie(null), Ce.current = !1);
	}, [m?.status, Ue]);
	let Je = (0, l.useRef)(void 0);
	(0, l.useEffect)(() => {
		let e = m?.status, t = Je.current;
		Je.current = e, t === "error" && e !== "error" && ce(null);
	}, [m?.status]);
	let Ye = te.cardScale === "lg" ? "md" : "sm", Xe = bf(m?.status === "error" ? m.message : se), Ze = Rs(t, n);
	(0, l.useEffect)(() => {
		F && Re && L.size > 0 && F();
	}, [
		Re,
		L.size,
		F
	]), (0, l.useEffect)(() => {
		F && ze && z !== null && F();
	}, [
		ze,
		z,
		F
	]);
	let Qe = (0, l.useCallback)(() => {
		F?.();
	}, [F]), $e = (0, l.useCallback)((e) => {
		if (Ve || k === e) return;
		Ae(!0), Qe(), ce(null);
		let t = !1;
		R((n) => {
			let r = new Set(n);
			return r.has(e) ? (r.delete(e), t = !0) : r.size < c ? (r.add(e), t = !0) : ce(`You may discard at most ${c} cards`), r;
		}), t && gf();
	}, [
		Ve,
		c,
		k,
		Qe
	]), et = (0, l.useCallback)(async (e, t = "tap-autoplay") => {
		if (Ce.current || Ve || !v) {
			Ce.current;
			return;
		}
		if (!ml(e, u)) return;
		We(), Ue(), Ce.current = !0, ie(e), ce(null), Ee.current;
		let n = Fe[e], r = E && n ? Ks({
			playerId: E,
			card: {
				rank: String(n.rank),
				suit: String(n.suit)
			}
		}) : null;
		E && n && r && (ic(E, r, e), yc({
			playKey: r,
			card: {
				rank: String(n.rank),
				suit: String(n.suit)
			},
			slotIndex: e
		}));
		try {
			await Promise.resolve(v(e)), B(null), Ce.current = !1;
		} catch {
			wc(), ie(null), Ce.current = !1;
		}
	}, [
		Ve,
		We,
		Ue,
		E,
		A,
		o,
		u,
		v,
		j,
		M,
		Fe
	]), tt = (0, l.useCallback)((e) => {
		if (Ce.current || Ve || !v || t !== "play") return;
		let n = ml(e, u);
		if (!n) {
			o && (pf(), We(), Ue("illegal"), B(null), U(e), W(e), window.setTimeout(() => {
				U(null), W(null);
			}, kc.illegalFlash), ce("Illegal play"));
			return;
		}
		let r = sl({
			selectedPlay: z,
			tappedIndex: e,
			isMyTurn: o,
			isLegal: n
		});
		if (r.isDeselect) {
			We(), Ue("deselect"), B(null);
			return;
		}
		if (r.shouldCancelAutoplay && z !== null && z !== e && (We(), Ue("selection-switch")), r.shouldImmediatePlay && r.nextSelection !== null) {
			B(r.nextSelection), ce(null), Qe(), r.nextSelection, et(r.nextSelection, "tap");
			return;
		}
		B(r.nextSelection), ce(null), Qe(), r.nextSelection !== null && gf(), r.shouldQueueSelection, r.nextSelection;
	}, [
		We,
		Ve,
		Ue,
		et,
		A,
		o,
		u,
		Qe,
		v,
		t,
		z,
		j,
		M
	]), nt = (0, l.useCallback)((e) => {
		if (Ce.current || Ve || !v || t !== "play") return;
		let n = ml(e, u);
		Ce.current, cl(o, n) && (We(), Ue("swipe"), B(e), et(e, "swipe"));
	}, [
		We,
		Ve,
		Ue,
		et,
		A,
		o,
		u,
		v,
		t,
		j,
		M
	]), rt = (0, l.useCallback)((e, t = "tap") => {
		if (t === "swipe-flick") {
			nt(e);
			return;
		}
		if (t === "hold") {
			nt(e);
			return;
		}
		tt(e);
	}, [nt, tt]);
	je.current = (e) => et(e, "tap-autoplay");
	let it = (0, l.useCallback)(async (e) => {
		if (!(!h || Ve)) {
			if (md("draw-button"), _f(), Qe(), e.length > c) {
				ce(`You may discard at most ${c} cards`);
				return;
			}
			H(!0), ce(null), ve([...e]), of(e.length);
			try {
				await h(e), R(/* @__PURE__ */ new Set());
			} catch {} finally {
				H(!1);
			}
		}
	}, [
		h,
		Ve,
		c,
		Qe
	]), at = (0, l.useCallback)(async () => {
		if (!(!g || Ve)) {
			_f(), Qe(), H(!0), ce(null);
			try {
				await g(), R(/* @__PURE__ */ new Set()), he(!0), window.setTimeout(() => he(!1), 700);
			} catch {} finally {
				H(!1);
			}
		}
	}, [
		g,
		Ve,
		Qe
	]), ot = (0, l.useCallback)(async () => {
		if (!(!_ || Ve)) {
			vf(), Qe(), K(!0), H(!0), ce(null);
			try {
				await _(), R(/* @__PURE__ */ new Set());
			} catch {
				K(!1);
			} finally {
				H(!1);
			}
		}
	}, [
		_,
		Ve,
		Qe
	]), st = (0, l.useCallback)((e) => {
		pf(), Ue(), B(null), U(e), W(e), window.setTimeout(() => {
			U(null), W(null);
		}, kc.illegalFlash), ce("Illegal play");
	}, [Ue]), ct = (0, l.useCallback)((e) => {
		if (fe(e), Fc(e), e) {
			Ae(!1);
			return;
		}
		ke || R(/* @__PURE__ */ new Set());
	}, [ke]), lt = a && r && (Re || ze), ut = (0, l.useMemo)(() => _l({
		selectedDraw: L,
		drawSelectionTouched: ke,
		bestPlayEnabled: de,
		recommendedDiscardIndices: f
	}), [
		L,
		ke,
		de,
		Le,
		f
	]), dt = () => lt ? /* @__PURE__ */ (0, x.jsxs)("label", {
		className: "btable-hero__best-play",
		children: [/* @__PURE__ */ (0, x.jsx)("input", {
			type: "checkbox",
			className: "btable-hero__best-play-input",
			checked: de,
			onChange: (e) => ct(e.target.checked),
			"data-testid": "best-play-checkbox"
		}), /* @__PURE__ */ (0, x.jsx)("span", {
			className: "btable-hero__best-play-label",
			children: "Best Play"
		})]
	}) : null, ft = fl({
		showBestPlayControl: lt,
		inPlayPhase: ze,
		bestPlayEnabled: de,
		recommendedPlayIndex: d
	}), pt = (0, l.useCallback)((e) => pl({
		inPlayPhase: ze,
		isMyTurn: o,
		busy: Ve,
		cardIndex: e,
		selectedPlay: z,
		isLegal: ml(e, u),
		showBestPlayRecommendation: ft,
		recommendedPlayIndex: d
	}), [
		Ve,
		ze,
		o,
		u,
		d,
		z,
		ft
	]);
	if (!a) return /* @__PURE__ */ (0, x.jsx)("div", {
		className: Pp(te, b),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, x.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "Sign in to see your dealt cards."
		})
	});
	if (!r && !n && !Me) return /* @__PURE__ */ (0, x.jsx)(Fp, { className: b });
	if (Me && r && e.length === 0) return p && n ? /* @__PURE__ */ (0, x.jsx)(Fp, { className: b }) : /* @__PURE__ */ (0, x.jsxs)("div", {
		className: Pp(te, b),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: [/* @__PURE__ */ (0, x.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: y ? "Cards not available — leave and re-open the session, or refresh the page." : "Loading your cards…"
		}), /* @__PURE__ */ (0, x.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: dt()
		})]
	});
	if (Me && !r && (t === "draw" || t === "play")) return /* @__PURE__ */ (0, x.jsx)("div", {
		className: Pp(te, b),
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, x.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "You sat out this hand."
		})
	});
	if (e.length === 0 && !i) return lt ? /* @__PURE__ */ (0, x.jsx)("div", {
		className: Pp(te, b, ["btable-hero--reserved"]),
		"data-testid": "hero-hand",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, x.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: dt()
		})
	}) : /* @__PURE__ */ (0, x.jsx)(Fp, { className: b });
	let mt = (e, t) => {
		if (D === t) return "trump";
		if (k === t && (Re || ze)) return "muted";
		if (re === t || ue === t || le === t) return "default";
		if (Re && L.has(t)) return "draw-selected";
		let n = pt(t);
		return n === "play-preselected" ? "play-preselected" : n === "play-recommended" ? "play-recommended" : ze && u && !u.includes(t) ? "muted" : "default";
	}, ht = Me && r && !(ze && o), gt = "none";
	ze && r ? gt = "play" : Re && r && !s ? gt = "draw-select" : ht && (gt = "peek");
	let _t = ut.length, vt = Re && !s && o;
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		className: Pp(te, b, [
			G && !I ? "btable-hero--dealing" : "",
			D === null ? "" : "btable-hero--trump-reveal",
			O ? "btable-hero--trump-merge" : "",
			Re && o && !s ? "btable-hero--draw-select" : "",
			C === "discard" && w > 0 ? "btable-hero--draw-discard" : "",
			C === "receive" && T > 0 ? "btable-hero--draw-receive" : "",
			vt ? "btable-hero--draw-actions" : "",
			Re && o && !s || ze && o ? "btable-hero--your-turn" : "",
			(Re || ze) && r && !o ? "btable-hero--waiting-turn" : "",
			me ? "btable-hero--stand-pat" : "",
			ge ? "btable-hero--fold-out" : ""
		]),
		style: { "--deal-card-stagger-ms": `${S}ms` },
		"data-testid": "hero-hand",
		"aria-label": `Your dealt cards — ${Ze}`,
		children: [
			/* @__PURE__ */ (0, x.jsxs)("p", {
				className: "btable-sr-only",
				"aria-live": "polite",
				children: [
					Ze,
					Re && !s && o && " — tap cards to discard; red border marks your selection",
					ze && o && " — tap a legal card to play",
					de && ze && " — green outline marks Best Play suggestions"
				]
			}),
			/* @__PURE__ */ (0, x.jsxs)("div", {
				ref: Se,
				className: "btable-hero__hand-3d",
				"data-trick-play-origin": E ?? void 0,
				"data-trick-play-origin-active": ze && o && E ? E : void 0,
				children: [/* @__PURE__ */ (0, x.jsx)("div", {
					className: "btable-hero__hand-row",
					"data-hero-play-turn": ze && o ? "true" : void 0,
					children: /* @__PURE__ */ (0, x.jsx)(ne, {
						cards: Fe,
						size: Ye,
						fan: !0,
						dealSeatPlayerId: E,
						stateFor: mt,
						slotClassFor: He,
						peekIndex: V,
						onCardPeek: ht ? ae : void 0,
						cardTestId: ze && o ? "play-button" : void 0,
						cardInteraction: {
							mode: gt,
							isMyTurn: o,
							legalPlayIndices: u,
							playingIndex: re,
							illegalShakeIndex: le,
							illegalFlashIndex: ue,
							busy: Ve,
							showPlayableHint: !0,
							playableHintFor: (e) => pt(e) === "legal-playable",
							allowPlayPreselect: ze && r && !o,
							trickPlayOriginPlayerId: E,
							onPlayCard: rt,
							onSelectCard: $e,
							onIllegalPlay: st,
							onPeek: ae
						}
					})
				}), dt()]
			}),
			ze && !o && z !== null && /* @__PURE__ */ (0, x.jsx)("span", {
				className: "btable-sr-only",
				"data-testid": "play-preselect-hint",
				children: "Your selected card will play on your turn"
			}),
			Xe && /* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-hero__error",
				role: "alert",
				children: Xe
			}),
			/* @__PURE__ */ (0, x.jsx)("div", {
				className: "btable-hero__actions-slot",
				"aria-hidden": !vt,
				children: vt && /* @__PURE__ */ (0, x.jsxs)("div", {
					className: "btable-hero__actions btable-hero__actions--triple",
					children: [
						/* @__PURE__ */ (0, x.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--action-draw",
							"data-testid": "draw-button",
							disabled: Ve,
							"aria-busy": Ve,
							onClick: () => it(ut),
							children: Ve ? "Drawing…" : `Draw${_t > 0 ? ` (${_t})` : ""}`
						}),
						/* @__PURE__ */ (0, x.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--action-pat",
							"data-testid": "pass-draw-button",
							disabled: Ve,
							onClick: () => at(),
							children: "Stand pat"
						}),
						/* @__PURE__ */ (0, x.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--action-out",
							"data-testid": "im-out-button",
							disabled: Ve,
							onClick: () => ot(),
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
function Lp({ event: e, onDismiss: t }) {
	return (0, l.useEffect)(() => {
		let n = window.setTimeout(() => t(e.id), e.durationMs ?? 2e3);
		return () => window.clearTimeout(n);
	}, [
		e.id,
		e.durationMs,
		t
	]), /* @__PURE__ */ (0, x.jsxs)("div", {
		className: "bpot-brew",
		role: "status",
		"aria-live": "polite",
		"data-testid": "big-pot-brewing",
		children: [/* @__PURE__ */ (0, x.jsx)("div", {
			className: "bpot-brew__glow",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, x.jsxs)("div", {
			className: "bpot-brew__content",
			children: [
				e.emoji && /* @__PURE__ */ (0, x.jsx)("span", {
					className: "bpot-brew__emoji",
					children: e.emoji
				}),
				/* @__PURE__ */ (0, x.jsx)("p", {
					className: "bpot-brew__title",
					children: e.title
				}),
				e.subtitle && /* @__PURE__ */ (0, x.jsx)("p", {
					className: "bpot-brew__subtitle",
					children: e.subtitle
				})
			]
		})]
	});
}
//#endregion
//#region src/table/heroCardArea.ts
function Rp(e) {
	return (e?.length ?? 0) === 0;
}
//#endregion
//#region src/table/trickPlaySlotFlyState.ts
function zp(e) {
	return e.isLivePhase && !e.hasLanded && e.flyMode !== "travel";
}
function Bp(e) {
	return e.isLocalHeroPlay && e.flyMode === "travel";
}
//#endregion
//#region src/table/TrickPlaySlot.tsx
var Vp = 72;
function Hp(e) {
	return e === "live" ? "pending" : "static";
}
function Up(e, t, n, r, i, a) {
	if (r.current = !1, e(!0), t("static"), n(null), i && m() && h("TrickPlaySlot", "fly-complete", i), a?.playKey && a.currentUserIdRef.current != null && a.playRef.current.playerId === a.currentUserIdRef.current && Cc(a.playKey), a?.onCardLandedRef.current && !a.audioFiredRef.current) {
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
function Wp({ play: e, index: t, presentationPhase: n, displayCount: r, playerName: i, leaderPlayerId: a = null, winnerPlayerId: o = null, instantPlace: s = !1, currentUserId: c = null, onCardLanded: u }) {
	let d = (0, l.useRef)(null), f = n === "live", [p, g] = (0, l.useState)(() => Hp(n)), [_, v] = (0, l.useState)(null), [y, b] = (0, l.useState)(!1), [C, w] = (0, l.useState)(null), [T, E] = (0, l.useState)(!1), [D, O] = (0, l.useState)(0), k = (0, l.useRef)(!1), A = (0, l.useRef)(!1), j = (0, l.useRef)(u), M = (0, l.useRef)(a), N = (0, l.useRef)(c), ee = (0, l.useRef)(r), P = (0, l.useRef)(t), F = (0, l.useRef)(e);
	j.current = u, M.current = a, N.current = c, ee.current = r, P.current = t, F.current = e;
	let I = Ks(e), te = a != null && e.playerId === a, ne = o != null && e.playerId === o, L = T, R = te && (n === "live" || n === "trickComplete"), z = R || ne && n !== "live" && n !== "trickComplete", B = f && c != null && e.playerId === c, re = zp({
		isLivePhase: f,
		hasLanded: T,
		flyMode: p
	});
	(0, l.useLayoutEffect)(() => {
		m() && h("TrickPlaySlot", "play-enter", {
			playKey: I,
			index: t,
			instantPlace: s,
			isLivePhase: f
		}), E(!1), k.current = !1, A.current = !1, g(Hp(n)), v(null), b(!1), w(null);
	}, [I, n]), (0, l.useLayoutEffect)(() => {
		if (T || k.current) return;
		let n = {
			onCardLandedRef: j,
			playRef: F,
			indexRef: P,
			displayCountRef: ee,
			leaderPlayerIdRef: M,
			currentUserIdRef: N,
			audioFiredRef: A,
			playKey: I
		};
		if (xc(t)) return Tc(() => {
			O((e) => e + 1);
		});
		if (!f) {
			Up(E, g, v, k, {
				playKey: I,
				index: t
			}, n);
			return;
		}
		if (typeof document > "u") return;
		let r = d.current;
		if (!r || !r.querySelector(".pcard")) return;
		let i = nc(e.playerId, I) ?? Ys(e.playerId);
		if (!i) {
			Up(E, g, v, k, {
				playKey: I,
				index: t
			}, n);
			return;
		}
		let a = iu() ? 217 : 395, o = ee.current > 1 && t < ee.current - 1 ? t * Vp : 0, s = () => {
			if (k.current) return;
			let e = d.current;
			if (!e) return;
			let r = e.querySelector(".pcard");
			if (!r) return;
			k.current = !0;
			let s = cc(ac(i, e.getBoundingClientRect(), r.getBoundingClientRect())), c = lc(a, s.rawMagnitude, s.shallowBoosted);
			v({
				dx: s.dx,
				dy: s.dy
			}), b(s.shallowBoosted), w(s.shallowBoosted ? c : null), m() && h("TrickPlaySlot", "fly-start", {
				playKey: I,
				index: t,
				travelMs: c,
				flyStaggerMs: o,
				shallowBoosted: s.shallowBoosted,
				rawMagnitude: s.rawMagnitude,
				magnitude: s.magnitude,
				localHero: N.current != null && F.current.playerId === N.current
			}), g("pending");
			let l = window.setTimeout(() => {
				g("travel");
			}, 0), u = window.setTimeout(() => {
				Up(E, g, v, k, {
					playKey: I,
					index: t
				}, n);
			}, c);
			return () => {
				window.clearTimeout(l), window.clearTimeout(u);
			};
		};
		if (o > 0) {
			g("pending");
			let e, t = window.setTimeout(() => {
				e = s();
			}, o);
			return () => {
				window.clearTimeout(t), e?.();
			};
		}
		return s();
	}, [
		T,
		f,
		t,
		e.playerId,
		I,
		D
	]);
	let ie = {
		"--slot-index": t,
		zIndex: 10 + t,
		..._ ? {
			"--fly-dx": `${_.dx}px`,
			"--fly-dy": `${_.dy}px`
		} : {},
		...C == null ? {} : { "--trick-card-travel-ms": `${C}ms` }
	};
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		ref: d,
		className: [
			"btrick__play",
			T ? "btrick__play--landed" : "",
			L ? "btrick__play--settled" : "",
			T && p === "static" ? "btrick__play--static-landed" : "",
			re ? "btrick__play--awaiting-fly" : "",
			p === "travel" ? "btrick__play--fly-from-hand" : "",
			Bp({
				isLocalHeroPlay: B,
				flyMode: p
			}) ? "btrick__play--hero-handoff" : "",
			y ? "btrick__play--fly-shallow" : "",
			p === "pending" ? "btrick__play--fly-pending" : "",
			p === "land" ? "btrick__play--land" : "",
			p === "settle" ? "btrick__play--settle" : "",
			R ? "btrick__play--leading" : "",
			z ? "btrick__play--winner" : ""
		].filter(Boolean).join(" "),
		style: ie,
		"data-slot-index": t,
		children: [/* @__PURE__ */ (0, x.jsx)(S, {
			card: Ls(e.card),
			size: "sm",
			state: z ? "winner" : "default"
		}), /* @__PURE__ */ (0, x.jsx)("span", {
			className: "btrick__name muted small",
			children: i
		})]
	});
}
//#endregion
//#region src/table/trickRowLayout.ts
function Gp(e, t, n) {
	let r = e > 0 || t > 0;
	return {
		layoutCardCount: Math.max(e, t, r ? n : 0, 1),
		trickActive: r
	};
}
//#endregion
//#region src/table/TrickRow.tsx
function Kp({ displayPlays: e = [], leaderPlayerId: t = null, winnerPlayerId: n = null, showWinnerTag: r = !1, presentationPhase: i = "live", playerNames: a = {}, variant: o = "live", instantTrickPlays: s = !1, peakCardCount: c = 0, participantCount: u = 0, currentUserId: d = null, onCardLanded: f }) {
	(0, l.useEffect)(() => {
		m() && h("TrickRow", e.length === 0 ? "trick-empty" : "trick-cards", {
			count: e.length,
			phase: i
		});
	}, [e.length, i]);
	let { layoutCardCount: p, trickActive: g } = Gp(e.length, c, u);
	if (e.length === 0 && !g) return /* @__PURE__ */ (0, x.jsx)("div", {
		className: "btrick btrick--empty muted small",
		"aria-hidden": "true",
		"data-testid": "trick-row",
		"data-trick-phase": i,
		"data-trick-card-count": "0",
		"data-trick-variant": o,
		children: /* @__PURE__ */ (0, x.jsx)("div", {
			className: "btrick__surface",
			children: /* @__PURE__ */ (0, x.jsx)("span", {
				className: "btrick__placeholder",
				children: "Trick"
			})
		})
	});
	if (e.length === 0 && g) return /* @__PURE__ */ (0, x.jsx)("div", {
		className: "btrick btrick--reserved muted small",
		"aria-hidden": "true",
		"data-testid": "trick-row",
		"data-trick-phase": i,
		"data-trick-card-count": "0",
		"data-trick-layout-count": p,
		"data-trick-variant": o,
		children: /* @__PURE__ */ (0, x.jsx)("div", {
			className: "btrick__surface",
			children: /* @__PURE__ */ (0, x.jsx)("div", {
				className: "btrick__cards btrick__cards--reserved",
				style: { "--trick-card-count": p }
			})
		})
	});
	let _ = n ? a[n] ?? "Player" : null, v = i === "trickComplete" || i === "winnerReveal", y = i === "collectTrick", b = o === "echo";
	return /* @__PURE__ */ (0, x.jsx)("div", {
		className: [
			"btrick",
			b ? "btrick--echo-pipeline" : "",
			v ? "btrick--hold" : "",
			y ? "btrick--rake" : ""
		].filter(Boolean).join(" "),
		"aria-label": b ? void 0 : "Current trick",
		"aria-hidden": b ? !0 : void 0,
		"aria-live": b ? void 0 : "polite",
		"data-testid": b ? "trick-row-echo" : "trick-row",
		"data-trick-phase": i,
		"data-trick-card-count": e.length,
		"data-trick-variant": o,
		children: /* @__PURE__ */ (0, x.jsxs)("div", {
			className: "btrick__surface",
			children: [r && _ && /* @__PURE__ */ (0, x.jsxs)("div", {
				className: "btrick__winner-tag",
				"data-testid": "trick-winner-tag",
				children: [_, " takes it"]
			}), /* @__PURE__ */ (0, x.jsx)("div", {
				className: "btrick__cards",
				role: "list",
				"aria-label": "Cards in trick",
				style: { "--trick-card-count": p },
				children: e.map((r, o) => /* @__PURE__ */ (0, x.jsx)(Wp, {
					play: r,
					index: o,
					presentationPhase: b ? "winnerReveal" : i,
					displayCount: e.length,
					playerName: a[r.playerId] ?? "Player",
					leaderPlayerId: t,
					winnerPlayerId: n,
					instantPlace: !1,
					currentUserId: d,
					onCardLanded: f
				}, `${r.playerId}-${r.card.rank}-${r.card.suit}`))
			})]
		})
	});
}
//#endregion
//#region src/table/DiscardPile.tsx
function qp({ cards: e }) {
	return /* @__PURE__ */ (0, x.jsx)("div", {
		className: "discard-pile",
		"data-discard-pile-anchor": !0,
		"data-testid": "discard-pile",
		"aria-label": `Discard pile, ${e.length} card${e.length === 1 ? "" : "s"}`,
		children: e.map((e) => /* @__PURE__ */ (0, x.jsx)("div", {
			className: "discard-pile__card",
			style: {
				"--pile-x": `${e.offsetX}px`,
				"--pile-y": `${e.offsetY}px`,
				"--pile-rot": `${e.rotation}deg`,
				"--pile-scale": String(e.scale),
				zIndex: e.zIndex
			},
			children: /* @__PURE__ */ (0, x.jsx)(S, {
				faceDown: !0,
				size: "sm"
			})
		}, e.id))
	});
}
//#endregion
//#region src/table/PotCenter.tsx
function Jp({ potMetrics: e, participantCount: t, trumpUpcard: n, trumpSuit: r, phase: i, enrollmentActive: a = !1, remainingDeckCount: o, trickDisplayPlays: s = [], trickLeadSuit: c = null, trickLeaderPlayerId: u = null, trickWinnerPlayerId: d = null, trickShowWinnerTag: f = !1, trickPresentationPhase: p = "live", trickEchoPlays: m = [], trickEchoWinnerId: h = null, trickEchoPhase: _ = "live", showFinalTrickEcho: v = !1, playerNames: y = {}, anteAnimActive: b = !1, trumpRevealActive: C = !1, drawAnimPlayerId: w = null, drawAnimSubPhase: T = "done", drawDiscardCount: E = 0, settleAnimActive: D = !1, settleCarryOver: O = !1, potTick: k = 0, trumpReminderPulse: A = 0, hideCenterTrump: j = !1, trumpMergeActive: M = !1, showTrumpSuitReminder: N = !1, instantTrickPlays: ee = !1, peakTrickPlayCount: P = 0, discardPileCards: F = [], currentUserId: I = null, onCardLanded: te }) {
	let ne = Rs(i, a), L = u ?? ((p === "live" || p === "trickComplete") && s.length > 0 ? eu(s, c ?? s[0]?.card.suit ?? null, r ?? null) : null), R = p !== "live" && p !== "nextLeadReady", z = s.length, B = z > 0 || P > z || ee, [re, ie] = (0, l.useState)(n ?? null), V = (0, l.useRef)(!1), [ae, oe] = (0, l.useState)(!1);
	(0, l.useEffect)(() => {
		if (n) {
			ie(n);
			return;
		}
		if (re && !M) {
			if (B || R) {
				let e = window.setTimeout(() => ie(null), 760);
				return () => window.clearTimeout(e);
			}
			ie(null);
		}
	}, [
		n,
		B,
		R,
		re,
		M
	]), (0, l.useEffect)(() => {
		if (C) {
			V.current = !0;
			return;
		}
		if (!V.current || !re) return;
		oe(!0);
		let e = window.setTimeout(() => oe(!1), 260);
		return () => window.clearTimeout(e);
	}, [C, re]);
	let H = !!re && !j, se = H && !C, ce = N || !H && !!r && i === "play", le = !H && !ce, U = v || D && m.length > 0 && z === 0;
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		className: "table-center-cluster",
		"aria-label": "Table center",
		children: [/* @__PURE__ */ (0, x.jsxs)("div", {
			className: "deck-stack",
			"aria-label": "Deck and trump",
			children: [/* @__PURE__ */ (0, x.jsxs)("div", {
				className: "deck-stack__anchor",
				children: [
					/* @__PURE__ */ (0, x.jsxs)("div", {
						className: ["deck-stack__pile", le ? "" : "deck-stack__layer--hidden"].filter(Boolean).join(" "),
						"data-testid": "deal-button",
						"aria-hidden": !le,
						children: [
							/* @__PURE__ */ (0, x.jsx)("div", { className: "deck-stack__card deck-stack__card--back" }),
							/* @__PURE__ */ (0, x.jsx)("div", { className: "deck-stack__card deck-stack__card--back deck-stack__card--offset" }),
							/* @__PURE__ */ (0, x.jsx)("span", {
								className: "deck-stack__label muted small",
								children: a ? "Dealing" : "Deck"
							})
						]
					}),
					/* @__PURE__ */ (0, x.jsxs)("div", {
						className: [
							"deck-stack__trump",
							"bpot__trump",
							H ? "" : "deck-stack__layer--hidden",
							C ? "bpot__trump--reveal" : "",
							ae ? "bpot__trump--relocate" : "",
							se ? "bpot__trump--revealed-ready deal-card--revealed" : ""
						].filter(Boolean).join(" "),
						"data-testid": "trump-button",
						"data-trump-deal-target": "",
						"aria-hidden": !H,
						children: [re && /* @__PURE__ */ (0, x.jsx)(S, {
							card: {
								rank: re.rank,
								suit: re.suit
							},
							size: "sm",
							state: "trump"
						}), /* @__PURE__ */ (0, x.jsx)("span", {
							className: "deck-stack__label muted small",
							children: "Trump"
						})]
					}),
					/* @__PURE__ */ (0, x.jsxs)("div", {
						className: [
							"deck-stack__trump",
							"deck-stack__trump--suit-reminder",
							ce ? "" : "deck-stack__layer--hidden",
							A > 0 ? "deck-stack__trump--suit-reminder-pulse" : ""
						].filter(Boolean).join(" "),
						"data-testid": "trump-suit-reminder",
						"aria-label": ce ? `Trump suit: ${zs(r)}` : void 0,
						"aria-hidden": !ce,
						children: [/* @__PURE__ */ (0, x.jsx)("div", {
							className: `trump-suit-badge trump-suit-badge--${r}`,
							"aria-hidden": "true",
							children: g[r]
						}), /* @__PURE__ */ (0, x.jsx)("span", {
							className: "deck-stack__label muted small",
							children: "Trump"
						})]
					})
				]
			}), o != null && o > 0 && /* @__PURE__ */ (0, x.jsxs)("span", {
				className: "deck-stack__count muted small",
				children: [o, " left"]
			})]
		}), /* @__PURE__ */ (0, x.jsxs)("div", {
			className: [
				"center-play",
				b ? "center-play--ante-in" : "",
				D ? "center-play--settle" : "",
				O ? "center-play--carry" : "",
				R ? "center-play--trick-resolving" : "",
				U ? "center-play--final-trick-echo" : ""
			].filter(Boolean).join(" "),
			"data-trick-phase": p,
			"data-trick-cards": z,
			"data-hand-settling": D ? "true" : "false",
			"data-pacing-ante-active": b ? "true" : "false",
			children: [
				i === "draw" ? /* @__PURE__ */ (0, x.jsx)(qp, { cards: F }) : null,
				/* @__PURE__ */ (0, x.jsxs)("div", {
					className: ["center-play__phase", i === "play" ? "center-play__phase--play" : ""].filter(Boolean).join(" "),
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, x.jsx)("span", {
							className: "btable-sr-only",
							"data-testid": "phase-tag-center",
							"data-phase": i ?? "waiting",
							children: ne
						}),
						H && r && /* @__PURE__ */ (0, x.jsx)("span", {
							className: "center-play__trump-suit muted small",
							children: zs(r)
						}),
						ce && /* @__PURE__ */ (0, x.jsxs)("span", {
							className: "center-play__trump-suit center-play__trump-suit--reminder muted small",
							children: [zs(r), " trump"]
						})
					]
				}),
				/* @__PURE__ */ (0, x.jsxs)("div", {
					className: "center-play__trick-stage",
					children: [/* @__PURE__ */ (0, x.jsx)("div", {
						className: "center-play__trick-live",
						children: /* @__PURE__ */ (0, x.jsx)(Kp, {
							displayPlays: s,
							leaderPlayerId: L,
							winnerPlayerId: d,
							showWinnerTag: f,
							presentationPhase: p,
							playerNames: y,
							instantTrickPlays: ee,
							peakCardCount: P,
							participantCount: t,
							currentUserId: I,
							onCardLanded: te
						})
					}), U && /* @__PURE__ */ (0, x.jsx)("div", {
						className: "center-play__trick-echo",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, x.jsx)(Kp, {
							displayPlays: m,
							winnerPlayerId: h,
							showWinnerTag: !0,
							presentationPhase: _,
							playerNames: y,
							variant: "echo"
						})
					})]
				}),
				/* @__PURE__ */ (0, x.jsxs)("dl", {
					className: "center-play__stats",
					children: [
						/* @__PURE__ */ (0, x.jsxs)("div", {
							className: `bpot__stat bpot__stat--pot${k > 0 ? " bpot__stat--tick" : ""}`,
							"data-testid": "pot-display",
							"data-ante-pot-target": "",
							children: [/* @__PURE__ */ (0, x.jsx)("dt", { children: "Table pot" }), /* @__PURE__ */ (0, x.jsx)("dd", { children: Pl(e.currentPot) })]
						}, k > 0 ? `pot-${k}` : "pot-static"),
						/* @__PURE__ */ (0, x.jsxs)("div", {
							className: "bpot__stat",
							"data-testid": "ante-display",
							children: [/* @__PURE__ */ (0, x.jsx)("dt", { children: "Ante / hand" }), /* @__PURE__ */ (0, x.jsx)("dd", { children: Fl(e.anteAmount) })]
						}),
						e.limEnabled && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [/* @__PURE__ */ (0, x.jsxs)("div", {
							className: "bpot__stat",
							children: [/* @__PURE__ */ (0, x.jsx)("dt", { children: "Cap" }), /* @__PURE__ */ (0, x.jsxs)("dd", { children: [Pl(e.potCap), /* @__PURE__ */ (0, x.jsx)("span", {
								className: "bpot__lim-tag",
								children: "LmT"
							})] })]
						}), /* @__PURE__ */ (0, x.jsxs)("div", {
							className: "bpot__stat bpot__stat--highlight",
							children: [/* @__PURE__ */ (0, x.jsx)("dt", { children: "Max win" }), /* @__PURE__ */ (0, x.jsx)("dd", { children: Pl(e.maxWinThisHand) })]
						})] })
					]
				}),
				e.limEnabled && e.overflow > 0 && /* @__PURE__ */ (0, x.jsxs)("div", {
					className: "center-play__carry muted small",
					children: [
						"+",
						Pl(e.overflow),
						" carry"
					]
				}),
				/* @__PURE__ */ (0, x.jsxs)("div", {
					className: "center-play__meta muted small",
					children: [t, " in hand"]
				})
			]
		})]
	});
}
//#endregion
//#region src/table/SmartHud.tsx
function Yp({ label: e, value: t, accent: n, title: r }) {
	return /* @__PURE__ */ (0, x.jsxs)("span", {
		className: `bhud__pill${n ? " bhud__pill--accent" : ""}`,
		title: r ?? `${e}: ${t}`,
		children: [/* @__PURE__ */ (0, x.jsx)("span", {
			className: "bhud__pill-label",
			children: e
		}), /* @__PURE__ */ (0, x.jsx)("span", {
			className: "bhud__pill-value",
			children: t
		})]
	});
}
function Xp({ player: e, compact: t = !1 }) {
	let n = e.apeScore != null && !e.isRobot;
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		className: `bhud${t ? " bhud--compact" : ""}`,
		"aria-label": `${e.displayName} stats`,
		children: [n && /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [
			/* @__PURE__ */ (0, x.jsx)(Yp, {
				label: "Ape",
				value: e.apeScore ?? 0,
				accent: !0,
				title: "Ape Score"
			}),
			e.apeClass && /* @__PURE__ */ (0, x.jsx)(Yp, {
				label: "Class",
				value: e.apeClass,
				title: "Ape Class"
			}),
			e.apeStatus && /* @__PURE__ */ (0, x.jsx)(Yp, {
				label: "Status",
				value: e.apeStatus,
				title: "Ape Status"
			})
		] }), e.sessionStreak != null && e.sessionStreak > 0 && /* @__PURE__ */ (0, x.jsx)(Yp, {
			label: "Streak",
			value: e.sessionStreak,
			title: "Hands won this session"
		})]
	});
}
//#endregion
//#region src/table/TurnCountdownRing.tsx
var Zp = 22, Qp = 2 * Math.PI * Zp;
function $p({ progress: e, segment: t, reducedMotion: n = iu() }) {
	let r = Qp * (1 - Math.max(0, Math.min(1, e)));
	return /* @__PURE__ */ (0, x.jsxs)("svg", {
		className: ["bseat__turn-countdown", n ? "bseat__turn-countdown--reduced" : ""].filter(Boolean).join(" "),
		viewBox: "0 0 48 48",
		"aria-hidden": "true",
		"data-testid": "turn-countdown-ring",
		"data-turn-segment": t,
		children: [/* @__PURE__ */ (0, x.jsx)("circle", {
			className: "bseat__turn-countdown-track",
			cx: "24",
			cy: "24",
			r: Zp,
			fill: "none"
		}), /* @__PURE__ */ (0, x.jsx)("circle", {
			className: `bseat__turn-countdown-progress bseat__turn-countdown-progress--${t}`,
			cx: "24",
			cy: "24",
			r: Zp,
			fill: "none",
			strokeDasharray: Qp,
			strokeDashoffset: r,
			transform: "rotate(-90 24 24)"
		})]
	});
}
//#endregion
//#region src/table/Seat.tsx
function em({ player: e, region: t, handLane: n = "below", style: r, clockwiseDealing: i = !1, onToggleInHand: a, onPassEnrollment: o, onTrickDelta: s, onReaction: c }) {
	let [u, d] = (0, l.useState)(!1), f = (0, l.useCallback)(() => {
		d((e) => !e);
	}, []), p = e.tricksThisHand, m = Math.max(0, e.holeCardCount ?? 0), h = p > 0, g = !!(e.showHoleCards && !e.isSelf && e.inHand && m > 0 && !i), _ = e.bankroll != null, v = e.bourreAlert === "pulse", y = e.bourreAlert === "marker" || e.bourreAlert === "pulse", b = !!e.bourrePressure, C = b && e.isSelf, w = e.revealedTrumpIndex != null && e.revealedTrumpUpcard, T = Ll(e.displayName);
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		"data-testid": e.isSelf ? "seat-bottom-self" : t === "top" ? "seat-top" : t === "left" ? "seat-left" : t === "right" ? "seat-right" : "seat-bottom",
		"data-pacing-active-actor": e.isActiveActor ? "true" : "false",
		"data-pacing-player-id": e.playerId,
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
			v ? "bseat--bourre-pulse" : "",
			y ? "bseat--bourre" : "",
			b ? "bseat--bourre-pressure" : "",
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
			e.inHand && !e.isSelf && /* @__PURE__ */ (0, x.jsx)("span", {
				className: "bseat__play-origin",
				"data-seat-play-origin": e.playerId,
				"data-trick-play-origin": e.playerId,
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, x.jsx)("div", {
				className: "bseat__core",
				children: /* @__PURE__ */ (0, x.jsxs)("div", {
					className: "bseat__avatar-stage",
					children: [
						/* @__PURE__ */ (0, x.jsxs)("div", {
							className: "bseat__avatar-stack",
							"data-trick-play-origin": !e.isSelf && e.inHand && !g ? e.playerId : void 0,
							children: [
								e.inHand && /* @__PURE__ */ (0, x.jsx)("span", {
									className: [
										"bseat__trick-badge",
										p === 0 ? "bseat__trick-badge--zero" : "",
										b && p === 0 ? "bseat__trick-badge--bourre-risk" : "",
										e.isWinner || e.isTrickCapture ? "bseat__trick-badge--tick" : ""
									].filter(Boolean).join(" "),
									"aria-label": b ? C ? `${p} tricks won — you need this trick to avoid bourré` : `${p} tricks won — at risk of bourré` : `${p} tricks won`,
									title: b ? C ? "Win this trick or go bourré" : "Must win this trick" : `${p} trick${p === 1 ? "" : "s"} won`,
									"data-testid": "seat-trick-badge",
									children: p
								}),
								e.inHand && !e.isSelf && /* @__PURE__ */ (0, x.jsx)("span", {
									className: "bseat__seat-motion-anchor",
									"data-seat-motion-anchor": e.playerId,
									"aria-hidden": "true"
								}),
								h && /* @__PURE__ */ (0, x.jsx)("div", {
									className: "bseat__won-trick-pile",
									"data-won-trick-pile-anchor": e.playerId,
									"aria-hidden": !1,
									"data-trick-count": p,
									children: Array.from({ length: Math.min(p, 5) }, (e, t) => /* @__PURE__ */ (0, x.jsx)("div", {
										className: "bseat__won-trick-pile-card",
										style: { "--book-i": t },
										children: /* @__PURE__ */ (0, x.jsx)(S, {
											faceDown: !0,
											size: "xs"
										})
									}, t))
								}),
								i && e.inHand && !e.isSelf && m > 0 && /* @__PURE__ */ (0, x.jsx)("div", {
									className: "bseat__deal-targets",
									"aria-hidden": "true",
									children: Array.from({ length: m }, (t, n) => /* @__PURE__ */ (0, x.jsx)("span", {
										className: "bseat__deal-target",
										"data-deal-seat": e.playerId,
										"data-deal-round": n,
										style: { "--hole-i": n }
									}, `deal-target-${n}`))
								}),
								g && /* @__PURE__ */ (0, x.jsx)("div", {
									className: "bseat__hole-cards bseat__hole-cards--crown",
									"aria-label": `${m} cards in hand`,
									"data-trick-play-origin": e.playerId,
									children: Array.from({ length: m }, (t, n) => {
										let r = e.revealedTrumpIndex === n && e.revealedTrumpUpcard;
										return /* @__PURE__ */ (0, x.jsx)("div", {
											className: [
												"bseat__hole-card",
												r ? "bseat__hole-card--trump-revealed" : "",
												r && e.seatTrumpMergeActive ? "bseat__hole-card--trump-merge" : ""
											].filter(Boolean).join(" "),
											style: { "--hole-i": n },
											children: r ? /* @__PURE__ */ (0, x.jsx)(S, {
												card: {
													rank: e.revealedTrumpUpcard.rank,
													suit: e.revealedTrumpUpcard.suit
												},
												size: "xs",
												state: "trump"
											}) : /* @__PURE__ */ (0, x.jsx)(S, {
												faceDown: !0,
												size: "xs"
											})
										}, n);
									})
								}),
								y && !b && /* @__PURE__ */ (0, x.jsx)("span", {
									className: "bseat__bourre-badge",
									"data-testid": "bourre-marker-badge",
									"aria-label": "Bourré",
									title: "Bourré",
									children: "Bourré"
								}),
								/* @__PURE__ */ (0, x.jsxs)("div", {
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
										e.isDealer && /* @__PURE__ */ (0, x.jsx)("span", {
											className: `bseat__dealer${e.dealerMoved ? " bseat__dealer--moved" : ""}`,
											children: "D"
										}),
										e.photoURL ? /* @__PURE__ */ (0, x.jsx)("img", {
											className: "bseat__avatar",
											src: e.photoURL,
											alt: ""
										}) : /* @__PURE__ */ (0, x.jsx)("span", {
											className: "bseat__avatar bseat__avatar--blank",
											"aria-hidden": "true"
										}),
										/* @__PURE__ */ (0, x.jsx)("span", {
											className: "bseat__name-plate",
											title: T,
											children: T
										}),
										e.inHand && /* @__PURE__ */ (0, x.jsx)("span", {
											className: "bseat__in-badge",
											title: "In this hand"
										}),
										v && !b && /* @__PURE__ */ (0, x.jsx)("span", {
											className: "bseat__bourre-ring",
											"aria-hidden": "true"
										}),
										e.turnCountdown && /* @__PURE__ */ (0, x.jsx)($p, {
											progress: e.turnCountdown.progress,
											segment: e.turnCountdown.segment
										})
									]
								})
							]
						}),
						_ && /* @__PURE__ */ (0, x.jsx)("span", {
							className: `bseat__stack${e.isOut ? " bseat__stack--out" : ""}`,
							"data-testid": "seat-stack",
							"aria-label": `Chips ${X(e.bankroll ?? 0)}`,
							title: `Chips ${X(e.bankroll ?? 0)}`,
							children: X(e.bankroll ?? 0)
						}),
						e.isSelf && c && /* @__PURE__ */ (0, x.jsx)("div", {
							className: "bseat__react-bar",
							children: [
								"👏",
								"😮",
								"🔥"
							].map((e) => /* @__PURE__ */ (0, x.jsx)("button", {
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
			/* @__PURE__ */ (0, x.jsxs)("div", {
				className: "bseat__aux",
				children: [
					/* @__PURE__ */ (0, x.jsxs)("div", {
						className: "bseat__info",
						children: [
							e.isOut && /* @__PURE__ */ (0, x.jsx)("span", {
								className: "bseat__out-tag muted small",
								children: "Out"
							}),
							e.enrollmentSatOut && !e.isOut && /* @__PURE__ */ (0, x.jsx)("span", {
								className: "bseat__enroll-tag muted small",
								children: "Sat out"
							}),
							e.enrollmentJoined && !e.inHand && !e.isOut && /* @__PURE__ */ (0, x.jsx)("span", {
								className: "bseat__enroll-tag muted small",
								children: e.decisionPlannedDiscards == null ? "Joined" : `Play · draw ${e.decisionPlannedDiscards}`
							})
						]
					}),
					/* @__PURE__ */ (0, x.jsx)("div", {
						className: "bseat__meta",
						"data-testid": "seat-meta-panel",
						"aria-hidden": !u,
						children: /* @__PURE__ */ (0, x.jsx)(Xp, {
							player: e,
							compact: t === "left" || t === "right"
						})
					}),
					e.canToggleInHand && /* @__PURE__ */ (0, x.jsx)("button", {
						type: "button",
						className: "bseat__opt-in btn btn--sm",
						"data-testid": "seat-opt-in",
						onClick: a,
						children: e.decisionPlannedDiscards != null && e.enrollmentJoined ? `Playing · ${e.decisionPlannedDiscards}` : e.canPassEnrollment ? "Play" : "I’m in"
					}),
					e.canPassEnrollment && o && /* @__PURE__ */ (0, x.jsx)("button", {
						type: "button",
						className: "bseat__pass btn btn--sm btn--ghost",
						"data-testid": "seat-pass-enrollment",
						onClick: o,
						children: "Pass"
					}),
					e.canEditTricks && /* @__PURE__ */ (0, x.jsx)("div", {
						className: "bseat__controls",
						children: /* @__PURE__ */ (0, x.jsx)("button", {
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
function tm(e, t) {
	let n = [...new Set(e.filter(Boolean))];
	if (!n.length) return [];
	let r = t.seatedIds?.filter((e) => n.includes(e));
	if (r?.length === n.length) return r;
	let i = t.handEnrollment?.orderedPlayerIds?.filter((e) => n.includes(e));
	if (i?.length === n.length) return i;
	let a = Ic(t.dealerId, n), o = n.filter((e) => !a.includes(e));
	return o.length ? [...a, ...o] : a;
}
function nm(e, t, n) {
	let r = new Map(e.map((e) => [e.playerId, e])), i = tm(e.map((e) => e.playerId), t);
	if (!i.length) return e;
	let a = n ?? e.find((e) => e.isSelf)?.playerId ?? null, o = a ? i.indexOf(a) : 0;
	return (o > 0 ? [...i.slice(o), ...i.slice(0, o)] : i).map((e) => r.get(e)).filter((e) => e != null);
}
//#endregion
//#region src/table/layout/sevenPlayerMobileSeatMap.ts
function rm(e) {
	let t = Dl(e);
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
function im(e) {
	return e === 7;
}
function am(e, t) {
	return e < 0 || e > 6 ? null : rm(t)[e] ?? null;
}
function om(e, t, n) {
	let r = am(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: wm(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 7
		})
	} : null;
}
//#endregion
//#region src/table/layout/eightPlayerMobileSeatMap.ts
function sm(e) {
	let t = Ol(e);
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
function cm(e) {
	return e >= 8;
}
function lm(e, t) {
	return e < 0 || e > 7 ? null : sm(t)[e] ?? null;
}
function um(e, t, n) {
	let r = lm(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: wm(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 8
		})
	} : null;
}
//#endregion
//#region src/table/layout/fourPlayerMobileSeatMap.ts
function dm(e) {
	return e === 5;
}
function fm(e) {
	let t = Dl(e);
	return {
		0: t[0],
		1: t[1],
		2: t[3],
		3: t[5],
		4: t[6]
	};
}
function pm(e, t, n) {
	if (e < 0 || e > 4) return null;
	let r = fm(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: wm(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 5
		})
	} : null;
}
//#endregion
//#region src/table/layout/fivePlayerMobileSeatMap.ts
var mm = {
	min: 8,
	max: 92
};
function hm(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function gm(e, t) {
	let n = t === "landscape" ? 54 : 56;
	return {
		...e,
		x: hm(e.x, mm.min, mm.max),
		y: hm(e.y, 8, n)
	};
}
function _m(e) {
	return e === 6;
}
function vm(e) {
	let t = Dl(e), n = [
		2,
		3,
		4
	].map((t) => gm(Gl(t, 6), e));
	return {
		0: t[0],
		1: t[1],
		2: n[0],
		3: n[1],
		4: n[2],
		5: t[6]
	};
}
function ym(e, t, n) {
	if (e < 0 || e > 5) return null;
	let r = vm(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: wm(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 6
		})
	} : null;
}
//#endregion
//#region src/table/layout/seatLayout.ts
var bm = {
	min: 8,
	max: 92
}, xm = 56, Sm = 54;
function Cm(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function wm(e, t) {
	return t.isSelf || t.isMobile ? "below" : t.total >= 6 && e.region === "left" && e.x < 14 || t.total >= 6 && e.region === "right" && e.x > 86 ? "side" : "below";
}
function Tm(e, t) {
	let n = Cm(e.x, bm.min, bm.max), r = t === "portrait" ? xm : Sm, i = Cm(e.y, 8, r);
	return {
		...e,
		x: n,
		y: i
	};
}
function Em(e, t, n) {
	if (n.isMobile && n.orientation && dm(t)) {
		let t = pm(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && _m(t)) {
		let t = ym(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && im(t)) {
		let t = om(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && cm(t)) {
		let t = um(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	let r = Gl(e, t), i = n.isMobile && n.orientation ? Tm(r, n.orientation) : r;
	return {
		...i,
		seatIndex: e,
		handLane: wm(i, {
			isMobile: n.isMobile,
			isSelf: n.isSelf,
			total: t
		})
	};
}
function Dm(e, t, n) {
	return Em(e + 1, t, {
		isMobile: !0,
		isSelf: !1,
		orientation: n
	});
}
function Om(e, t = "portrait") {
	if (dm(e)) {
		let e = pm(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (_m(e)) {
		let e = ym(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (im(e)) {
		let e = om(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (cm(e)) {
		let e = um(0, t, { isSelf: !0 });
		if (e) return e;
	}
	let n = Gl(0, Math.max(2, e));
	return {
		x: n.x,
		y: Math.min(n.y, 88),
		region: "bottom",
		seatIndex: 0,
		handLane: "below"
	};
}
var km = 1e3, Am = 1e3, jm = 12e3, Mm = 4e3, Nm = ql;
function Pm(e = iu()) {
	let t = e ? .55 : 1, n = (e) => Math.max(80, Math.round(e * t));
	return {
		anteChipTravelMs: n(280),
		anteChipStaggerMs: n(72),
		antePostHoldMs: n(250),
		dealCardStaggerMs: n(130),
		dealFanMs: n(600),
		trumpRevealHoldMs: n(km),
		trumpMergeAnimMs: n(480),
		enrollmentSeatPulseMs: n(480),
		drawDiscardMs: n(400),
		drawReplaceMs: n(700),
		drawReadyBeatMs: n(500),
		settleHoldMs: n(Am),
		nextHandResetMs: n(550),
		handResetMs: n(500)
	};
}
function Fm(e, t = iu()) {
	if (e <= 0) return 0;
	let n = t ? .55 : 1, r = t ? 40 : 72, i = Math.round(280 * n);
	return (e - 1) * r + i;
}
function Im(e, t, n = iu()) {
	let r = Pm(n), i = Math.max(0, e), a = Math.max(0, t);
	return i === 0 && a === 0 ? Math.max(120, Math.round(r.drawDiscardMs * .6)) : i * r.drawDiscardMs + a * r.drawReplaceMs + 80;
}
function Lm(e, t, n) {
	let r = Number.isFinite(e) && e > 0 ? e : 0, i = r > 0 ? Math.max(t, r) : t;
	return {
		height: Math.max(i > 0 ? i : n, n),
		peak: i
	};
}
function Rm(e, t, n, r) {
	let i = Lm(e, t, n), a = Math.max(152, n);
	return {
		height: i.peak > 0 ? Math.min(i.height, r) : Math.min(a, r),
		peak: i.peak
	};
}
function zm(e, t, n = 72) {
	return Lm(e, t, n);
}
function Bm(e, t) {
	let n = Math.max(.75, e);
	return t.portrait ? Math.min(n, .98) : Math.min(n, 1.32);
}
function Vm(e) {
	let t = Math.max(2, Math.min(8, e || 4));
	return t <= 3 ? .7 : t <= 4 ? .68 : t <= 5 ? .62 : .56;
}
function Hm(e) {
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
function Um(e) {
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
function Wm(e) {
	return {
		left: e.left,
		top: e.top,
		right: e.right,
		bottom: e.bottom,
		width: e.width,
		height: e.height
	};
}
function Gm(e, t, n = 2) {
	return e.left >= t.left - n && e.top >= t.top - n && e.right <= t.right + n && e.bottom <= t.bottom + n;
}
//#endregion
//#region src/table/useMobileTable.ts
var Km = "(max-width: 900px), ((hover: none) and (pointer: coarse))";
function qm() {
	let [e, t] = (0, l.useState)(() => typeof window < "u" && window.matchMedia("(max-width: 900px), ((hover: none) and (pointer: coarse))").matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Km), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/table/hooks/useStageFit.ts
function Jm(e, t) {
	if (typeof window > "u") return t;
	let n = document.documentElement, r = getComputedStyle(n).getPropertyValue(e).trim(), i = parseFloat(r);
	return Number.isFinite(i) ? i : t;
}
function Ym(e, t) {
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
function Xm(e) {
	let t = e.closest(".btable-session")?.querySelector(".btable-desktop");
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return n.width <= 0 || n.height <= 0 ? null : {
		width: n.width,
		height: n.height
	};
}
function Zm(e, t) {
	let n = !!e.closest(".table-play-overlay");
	if (t && n) {
		let t = e.closest(".table-play-overlay__main");
		if (t) return t;
	}
	return e.closest(".btable-desktop__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function Qm({ aspect: e, enabled: t = !0, sessionKey: n }) {
	let r = (0, l.useRef)(null), i = (0, l.useRef)(0), a = (0, l.useRef)(0), o = (0, l.useRef)(n), { settings: s } = Ff(), c = qm();
	return (0, l.useLayoutEffect)(() => {
		if (!t || typeof window > "u") return;
		let l = r.current;
		if (!l) return;
		o.current !== n && (o.current = n, i.current = 0, a.current = 0);
		let u = l.closest(".btable-desktop__viewport") ?? l.closest(".table-play-overlay__main") ?? l.closest(".btable-session"), d = window.visualViewport, f = () => {
			if (Ap()) return;
			let t = !!l.closest(".table-play-overlay"), n = typeof window < "u" && window.matchMedia("(orientation: portrait)").matches, r = Zm(l, c).getBoundingClientRect(), o = l.querySelector(".hand-panel")?.getBoundingClientRect(), u = t && c && n ? 100 : t && !c ? 120 : c ? 112 : 148, f = t && c && n || t && !c ? 200 : c ? 210 : 280, p = o?.height ?? 0, m = Rm(p, i.current, u, f);
			i.current = m.peak;
			let h = m.height, g = c && t ? 12 : c ? 18 : t && !c ? 16 : 28, _ = Jm("--stage-fit-pad-x", c ? 8 : 16) + g, v = Jm("--stage-fit-pad-y", c ? 6 : 12) + g, y = Jm("--stage-fit-gap", c ? 8 : 12), b = d, x = Math.min(r.width, b?.width ?? window.innerWidth), S = Math.min(r.height, b?.height ?? window.innerHeight);
			if (t && c) {
				let e = Xm(l);
				if (e) x = e.width, S = e.height;
				else {
					let e = zm(Ym(l, c), a.current, 72);
					a.current = e.peak, S = Math.max(160, S - e.height);
				}
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = t && c ? 1 : C, T = c ? Bm(e, { portrait: n }) : e, E = parseInt(getComputedStyle(l).getPropertyValue("--player-count").trim(), 10) || 4, D = t && c && !n, O = D ? {
				...Hm({
					availWidth: x,
					availHeight: S,
					aspect: T,
					userScale: w,
					padX: _,
					padY: v,
					stageShare: Vm(E)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Um({
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
				let e = l.querySelector(".table-stage"), a = l.querySelectorAll(".bseat__avatar-wrap"), o = e ? Wm(e.getBoundingClientRect()) : null, s = Wm(document.documentElement.getBoundingClientRect()), u = [...a].filter((e) => !Gm(Wm(e.getBoundingClientRect()), s, 1)).length;
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
			Ap() || (p ??= window.requestAnimationFrame(() => {
				p = null, f();
			}));
		}, h = new ResizeObserver(m), g = Zm(l, c);
		g instanceof HTMLElement && h.observe(g), u instanceof HTMLElement && u !== g && h.observe(u);
		let _ = l.closest(".table-play-overlay__main");
		_ instanceof HTMLElement && _ !== g && h.observe(_), m();
		let v = jp(() => {
			Ap() || m();
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
function $m({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r, pileIndexRef: i, onDiscardCommitted: a }) {
	let o = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		let s = e.animatingDrawPlayerId, c = e.drawAnimSubPhase, l = e.drawDiscardCount;
		if (c !== "discard" || !s || l <= 0) {
			c !== "discard" && (o.current = null);
			return;
		}
		if (s === n) return;
		let u = `${t}:${s}:${l}`;
		o.current !== u && (o.current = u, As({
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
function eh({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r }) {
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
		i.current !== l && (i.current = l, Ds({
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
function th(e = document) {
	cs(), ws();
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = e instanceof Document ? t.body : e;
	for (let e of n.querySelectorAll(".discard-fly-ghost, .draw-receive-fly-ghost")) e.remove();
}
//#endregion
//#region src/table/hooks/useTableDrawMotionCleanup.ts
function nh({ handNumber: e, sessionPhase: t, turnPlayerId: n, drawCompletedIds: r, currentUserId: i, handPresentation: a, tableRootRef: o }) {
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
		s.current !== l && (s.current = l, th(c));
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
		e && (th(e), s.current = null);
	}, [e, o]);
}
//#endregion
//#region src/table/animations/antePresentationMotion.ts
var rh = /* @__PURE__ */ new Set();
function ih(e, t, n) {
	return Lc(e, t, n.length ? n : t);
}
function ah(e, t) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document, r = n.querySelector(`[data-seat-motion-anchor="${e}"]`) ?? n.querySelector(`[data-seat-play-origin="${e}"]`) ?? n.querySelector(`[data-pacing-player-id="${e}"] .bseat__stack`);
	return r ? ia(r) : null;
}
function oh(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = t.querySelector("[data-ante-pot-target]") ?? t.querySelector("[data-testid=\"pot-display\"]");
	return n ? ia(n) : null;
}
function sh(e) {
	let t = document.createElement("span");
	return t.className = "ante-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${Math.max(12, e.width * .55)}px`, t.style.height = `${Math.max(12, e.height * .55)}px`, t.style.pointerEvents = "none", t.style.zIndex = "6", t;
}
function ch() {
	for (let e of rh) e.kill();
	rh.clear();
}
function lh({ order: e, root: t, onCoinLanded: n, onComplete: r }) {
	ch();
	let i = V(), a = ie(280 / 1e3, i), o = i ? .04 : 72 / 1e3, s = oh(t), c = 0, l = !1, u = () => {
		l || (l = !0, rh.delete(f), r?.());
	}, d = (t) => {
		n?.(t), c += 1, c >= e.length && u();
	}, f = J.timeline({ onInterrupt: () => {
		l = !0, rh.delete(f);
		for (let e of t.querySelectorAll(".ante-fly-ghost")) e.remove();
	} });
	if (rh.add(f), !e.length) return u(), f;
	e.forEach((e, n) => {
		let r = n * o;
		f.call(() => {
			let n = ah(e, t);
			if (!n || !s) {
				d(e);
				return;
			}
			let r = sh(n);
			t.appendChild(r);
			let o = ia(r), { x: c, y: l } = sa(o, n), u = s.left + s.width / 2, f = s.top + s.height / 2, p = o.left + o.width / 2, m = o.top + o.height / 2, h = u - p, g = f - m;
			J.set(r, {
				x: c,
				y: l,
				opacity: i ? 1 : .85,
				scale: .9
			}), J.to(r, {
				x: h,
				y: g,
				opacity: 1,
				scale: 1,
				duration: a,
				ease: L,
				onComplete: () => {
					r.remove(), d(e);
				}
			});
		}, void 0, r);
	});
	let p = Fm(e.length, i) + 80, m = window.setTimeout(u, p);
	return f.eventCallback("onInterrupt", () => window.clearTimeout(m)), f;
}
//#endregion
//#region src/table/hooks/useTableAntePresentation.ts
function uh({ handNumber: e, phase: t, anteAnimActive: n, dealerId: r, participantIds: i, seatRing: a, tableRootRef: o, onCoinLanded: s, onSequenceComplete: c }) {
	let u = (0, l.useRef)(null), d = (0, l.useRef)(e), f = (0, l.useRef)(null), p = a.join(",");
	(0, l.useLayoutEffect)(() => {
		o.current && d.current !== e && (d.current = e, u.current = null, f.current != null && (window.clearTimeout(f.current), f.current = null), ch());
	}, [e, o]), (0, l.useLayoutEffect)(() => {
		let l = o.current;
		if (!l || !n || t !== "ante") return;
		let d = ih(r, i, a), p = `${e}:${d.join(",")}`;
		if (u.current === p) return;
		if (u.current = p, ch(), f.current != null && (window.clearTimeout(f.current), f.current = null), !d.length) {
			c();
			return;
		}
		let m = iu() ? 138 : 250;
		return lh({
			order: d,
			root: l,
			onCoinLanded: s,
			onComplete: () => {
				f.current = window.setTimeout(() => {
					f.current = null, c();
				}, m);
			}
		}), () => {
			f.current != null && (window.clearTimeout(f.current), f.current = null), ch();
		};
	}, [
		e,
		t,
		n,
		r,
		i,
		p,
		o,
		s,
		c
	]);
}
//#endregion
//#region src/table/handPresentationMachine.ts
function dh(e) {
	return !e?.rank || !e?.suit ? "" : `${e.rank}-${e.suit}`;
}
function fh(e) {
	return e === "handReset" || e === "ante" || e === "trumpReveal" || e === "trumpMerge" || e === "drawPlayer" || e === "drawReady" || e === "settle" || e === "nextHandReset";
}
var ph = new Set([
	"handReset",
	"ante",
	"trumpReveal",
	"trumpMerge"
]);
function mh(e, t) {
	m() && h("handPresentation", "catch-up-reveal-to-draw", {
		fromPhase: e.phase,
		serverPhase: t.phase,
		drawCompleted: t.drawCompletedIds.length,
		participantCount: t.participantIds.length,
		turnPlayerId: t.turnPlayerId,
		anteAnimActive: e.anteAnimActive,
		trumpRevealActive: e.trumpRevealActive
	});
	let n = Th(e, t.drawCompletedIds), r = t.participantIds.length > 0 && t.drawCompletedIds.length >= t.participantIds.length, i = {
		..._h(t),
		drawPresentationConsumedIds: n,
		displayDrawCompletedIds: [...t.drawCompletedIds],
		animatingDrawPlayerId: null,
		drawAnimSubPhase: "done",
		prevSnapshot: t,
		pendingSnapshot: null
	};
	return r && (i = vh(i, "drawReady", {})), m() && h("handPresentation", "catch-up-reveal-to-draw-done", {
		toPhase: i.phase,
		isPresenting: fh(i.phase),
		displayDrawCompleted: i.displayDrawCompletedIds.length
	}), i;
}
function hh(e) {
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
function gh(e) {
	return e.phase === "play" ? "play" : e.phase === "draw" ? "drawPlayer" : e.phase === "decision" ? "decision" : e.phase === "reveal" ? "ante" : e.enrollmentActive ? "enrollment" : "idle";
}
function _h(e) {
	let t = {
		phase: gh(e),
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
		antePotRevealed: !0,
		anteLandedPlayerIds: [],
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
		drawPresentationConsumedIds: [],
		dealPresentationAllowed: e.phase === "draw" || e.phase === "play" || e.phase === "decision"
	};
	return e.phase === "reveal" ? Nh(t, e) : t;
}
function vh(e, t, n = {}) {
	return {
		...e,
		...n,
		phase: t,
		phaseStartedAt: Date.now()
	};
}
function yh(e, t) {
	let n = {};
	for (let r of t.enrolledIds) e.enrolledIds.includes(r) || (n[r] = "join");
	for (let r of t.declinedIds) e.declinedIds.includes(r) || (n[r] = "pass");
	return n;
}
function bh(e, t, n) {
	for (let r of n.drawCompletedIds) if (!xh(e, r) && !e.displayDrawCompletedIds.includes(r) && !t.drawCompletedIds.includes(r)) return r;
	return null;
}
function xh(e, t) {
	return e.drawPresentationConsumedIds.includes(t);
}
function Sh(e) {
	return e.phase === "drawPlayer" && e.animatingDrawPlayerId != null && e.drawAnimSubPhase !== "done";
}
function Ch(e, t) {
	if (t.phase !== "draw" || !Sh(e)) return null;
	let n = e.animatingDrawPlayerId, r = t.turnPlayerId;
	return !n || !r || t.drawCompletedIds.includes(r) || n === r && !t.drawCompletedIds.includes(n) ? null : (m() && h("handPresentation", "fast-forward-stale-draw", {
		animating: n,
		turnId: r,
		drawCompleted: t.drawCompletedIds
	}), {
		...kh(e, t),
		pendingSnapshot: t,
		prevSnapshot: t
	});
}
function wh(e, t) {
	return !t || xh(e, t) ? e.drawPresentationConsumedIds : [...e.drawPresentationConsumedIds, t];
}
function Th(e, t) {
	return [...new Set([...e.drawPresentationConsumedIds, ...t])];
}
function Eh(e, t, n) {
	for (let r of t.actionOrder) if (t.participantIds.includes(r) && t.drawCompletedIds.includes(r) && !n.includes(r) && !xh(e, r)) return r;
	return null;
}
function Dh(e, t, n, r) {
	m() && h("handPresentation", "draw-candidate-resolve", {
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
function Oh(e, t, n) {
	m() && h("handPresentation", `draw-receive-commit-${e}`, {
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
function kh(e, t) {
	let n = e.animatingDrawPlayerId;
	if (!n) return e.drawAnimSubPhase === "done" ? e : {
		...e,
		drawAnimSubPhase: "done"
	};
	let r = e.displayDrawCompletedIds.includes(n) ? e.displayDrawCompletedIds : [...e.displayDrawCompletedIds, n], i = wh(e, n), a = t == null ? e.prevSnapshot : {
		...t,
		drawCompletedIds: [...r]
	};
	return Oh("payload", e, {
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
function Ah(e, t) {
	return e > 0 ? "discard" : t > 0 ? "receive" : "done";
}
function jh(e, t, n, r, i, a) {
	return xh(e, n) ? (Dh(e, t, null, `consumed-skip:${n}:${a}`), e) : Sh(e) && e.animatingDrawPlayerId !== n ? (Dh(e, t, null, `in-flight-skip:${a}`), e) : (Dh(e, t, n, a), vh(e, "drawPlayer", {
		animatingDrawPlayerId: n,
		drawAnimSubPhase: Ah(r, i),
		drawDiscardCount: r,
		drawReplaceCount: i,
		prevSnapshot: t,
		drawPresentationConsumedIds: wh(e, n)
	}));
}
function Mh(e) {
	if (!e.pendingHandSettle || e.phase !== "play") return e;
	let t = e.handSettleSnapshot ?? e.prevSnapshot;
	return t ? vh(e, "settle", {
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		settleAnimActive: !0,
		settleCarryOver: t.carryOverPot > 0,
		prevSnapshot: t,
		displayPotAmount: t.potAmount
	}) : e;
}
function Nh(e, t) {
	return vh(e, "ante", {
		trumpRevealActive: !!t.trumpUpcard,
		trumpMergeActive: !1,
		trumpMergedIntoHand: !1,
		anteAnimActive: !0,
		antePotRevealed: !1,
		anteLandedPlayerIds: [],
		dealPresentationAllowed: !1,
		dealStaggerCount: Math.max(e.dealStaggerCount, t.participantIds.length),
		prevSnapshot: t,
		displayPotAmount: t.potAmount,
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		pendingSnapshot: null
	});
}
function Ph(e, t, n, r) {
	let i = bh(e, {
		...t,
		drawCompletedIds: []
	}, t);
	return i ? jh(e, t, i, n, r, "beginDrawSequence") : vh(e, "drawPlayer", {
		displayDrawCompletedIds: e.displayDrawCompletedIds,
		prevSnapshot: t
	});
}
function Fh(e, t) {
	let n = Ih(e, t);
	return m() && (e.phase !== n.phase || e.handNumber !== n.handNumber || e.trumpRevealActive !== n.trumpRevealActive || t.type === "serverUpdate") && h("handPresentation", t.type, {
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
function Ih(e, t) {
	switch (t.type) {
		case "reset": return _h(t.snapshot);
		case "dealCardRevealed": return {
			...e,
			dealStaggerCount: Math.max(e.dealStaggerCount, t.count)
		};
		case "anteCoinLanded": return !e.anteAnimActive || e.anteLandedPlayerIds.includes(t.playerId) ? e : {
			...e,
			anteLandedPlayerIds: [...e.anteLandedPlayerIds, t.playerId]
		};
		case "anteSequenceComplete": return {
			...e,
			antePotRevealed: !0,
			anteAnimActive: !1
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
		case "watchdog": return e.pendingHandSettle && e.phase === "play" ? Mh(e) : Date.now() - e.phaseStartedAt < 12e3 ? e : Lh({
			...e,
			pendingSnapshot: e.pendingSnapshot ?? e.prevSnapshot
		});
		case "tryBeginHandSettle": return Mh(e);
		case "advancePhase": return Lh(e);
		case "serverUpdate": {
			let { snapshot: n, heroDrawDiscardCount: r = 0, heroDrawReplaceCount: i = 0 } = t, a = e.prevSnapshot ?? n;
			if (e.sessionKey !== n.sessionKey) {
				let e = _h(n);
				return n.phase === "reveal" ? Nh(e, n) : e;
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
				let e = _h(n);
				return n.phase === "reveal" ? Nh(e, n) : e;
			}
			let o = dh(a.trumpUpcard), s = dh(n.trumpUpcard);
			if (o && !s && !e.trumpMergedIntoHand && !e.trumpMergeActive) return {
				...e,
				trumpRevealActive: !1,
				trumpMergeActive: !0,
				trumpMergedIntoHand: !1,
				prevSnapshot: n,
				pendingSnapshot: n
			};
			if (n.phase === "play" && e.phase !== "play") return vh(e, "play", {
				displayDrawCompletedIds: [...n.drawCompletedIds],
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				trumpRevealActive: !1,
				trumpMergeActive: !1,
				trumpMergedIntoHand: !0,
				anteAnimActive: !1,
				dealPresentationAllowed: !0,
				prevSnapshot: n,
				pendingSnapshot: null
			});
			if (n.phase === "draw" && ph.has(e.phase)) return mh(e, n);
			if (n.phase === "reveal" && e.phase === "ante" && !e.anteAnimActive && !e.trumpRevealActive) return Nh(e, n);
			if (fh(e.phase) && e.phase !== "drawPlayer" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done") return {
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
					let t = Mh(e);
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
			let c = yh(a, n), l = Object.keys(c).length > 0;
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
			if (n.phase === "reveal" && a.phase !== "reveal" && (e.phase === "idle" || e.phase === "nextHandReset" || e.phase === "enrollment" || e.phase === "settle" || e.phase === "play")) return Nh(e, n);
			if (n.phase === "draw" && a.enrollmentActive && !n.enrollmentActive && e.phase === "enrollment") {
				let t = !!n.trumpUpcard;
				return vh(e, t ? "trumpReveal" : "ante", {
					trumpRevealActive: t,
					anteAnimActive: !0,
					antePotRevealed: !1,
					anteLandedPlayerIds: [],
					dealPresentationAllowed: !1,
					dealStaggerCount: Math.max(e.dealStaggerCount, n.participantIds.length),
					prevSnapshot: n,
					displayPotAmount: n.potAmount
				});
			}
			if (n.phase === "draw" && (e.phase === "decision" || a.phase === "decision") && e.drawPresentationConsumedIds.length === 0 && e.displayDrawCompletedIds.length === 0 && e.phase !== "drawPlayer" && e.phase !== "drawReady") return Ph(e, n, 0, 0);
			if (n.phase === "draw") {
				let t = Ch(e, n);
				t && (e = t);
				let o = bh(e, a, n);
				if (o && e.phase !== "drawReady") {
					let t = e.phase === "drawPlayer" && e.animatingDrawPlayerId === o && e.drawAnimSubPhase !== "done";
					if (!t && !Sh(e)) {
						let t = r > 0 || i > 0, a = t ? r : o === n.turnPlayerId ? 0 : 1;
						return jh(e, n, o, a, t ? i : a, "serverUpdate");
					}
					t ? Dh(e, n, null, "serverUpdate:animating-same-player") : Sh(e) && Dh(e, n, null, "serverUpdate:in-flight-other-player");
				} else o || Dh(e, n, null, "serverUpdate:no-candidate");
				if (n.drawCompletedIds.length === n.participantIds.length && n.participantIds.length > 0 && e.phase === "drawPlayer" && e.drawAnimSubPhase === "done") return vh(e, "drawReady", { prevSnapshot: n });
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
function Lh(e) {
	let t = e.pendingSnapshot ?? e.prevSnapshot;
	switch (e.phase) {
		case "handReset": return vh(e, "ante", {
			anteAnimActive: !0,
			antePotRevealed: !1,
			anteLandedPlayerIds: [],
			dealPresentationAllowed: !1,
			pendingSnapshot: null
		});
		case "ante": return e.trumpRevealActive || t?.trumpUpcard ? vh(e, "trumpReveal", {
			trumpRevealActive: !0,
			anteAnimActive: !1,
			dealPresentationAllowed: !1,
			pendingSnapshot: null
		}) : t?.phase === "draw" ? {
			...Ph(e, t, 0, 0),
			dealPresentationAllowed: !0
		} : vh(e, "drawPlayer", {
			anteAnimActive: !1,
			dealPresentationAllowed: !0,
			pendingSnapshot: null
		});
		case "trumpReveal": return t?.phase === "draw" ? {
			...Ph(e, t, 0, 0),
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !1,
			dealPresentationAllowed: !0,
			pendingSnapshot: null
		} : vh(e, "drawPlayer", {
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !1,
			dealPresentationAllowed: !0,
			pendingSnapshot: null
		});
		case "trumpMerge": return e;
		case "drawPlayer": {
			if (e.drawAnimSubPhase === "discard" && e.drawReplaceCount > 0) return {
				...e,
				drawAnimSubPhase: "receive"
			};
			Oh("before", e);
			let n = e.animatingDrawPlayerId, r = kh(e, t);
			Oh("after", r);
			let i = t ?? r.prevSnapshot;
			if (i && r.displayDrawCompletedIds.length >= i.participantIds.length) return vh(r, "drawReady", {
				displayDrawCompletedIds: r.displayDrawCompletedIds,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				pendingSnapshot: null,
				prevSnapshot: {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				},
				drawPresentationConsumedIds: Th(r, r.displayDrawCompletedIds)
			});
			if (i) {
				let e = {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				}, t = Eh(r, i, r.displayDrawCompletedIds);
				if (Oh("after", r, {
					playerId: n,
					nextCompleted: r.displayDrawCompletedIds,
					nextChosen: t
				}), t) return Dh(r, i, t, "advancePhase:nextPlayer"), jh(r, e, t, 1, 1, "advancePhase:nextPlayer");
				Dh(r, i, null, "advancePhase:no-next-player");
			}
			return r;
		}
		case "drawReady": return vh(e, "play", { pendingSnapshot: null });
		case "settle": return vh(e, "nextHandReset", {
			settleAnimActive: !1,
			nextHandResetActive: !0,
			pendingSnapshot: null
		});
		case "nextHandReset": return t ? _h(t) : vh(e, "idle", { nextHandResetActive: !1 });
		default: return e;
	}
}
function Rh(e) {
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
		antePotRevealed: e.antePotRevealed,
		anteLandedPlayerIds: e.anteLandedPlayerIds,
		dealStaggerCount: e.dealStaggerCount,
		enrollmentPulse: e.enrollmentPulse,
		settleAnimActive: e.settleAnimActive,
		settleCarryOver: e.settleCarryOver,
		nextHandResetActive: e.nextHandResetActive,
		pendingHandSettle: e.pendingHandSettle,
		suppressTurnIndicator: e.pendingHandSettle || e.phase === "trumpReveal" || e.phase === "trumpMerge" || e.phase === "ante" || e.phase === "drawReady" || e.phase === "settle" || e.phase === "nextHandReset" || e.phase === "handReset" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done",
		displayPotAmount: e.displayPotAmount,
		isPresenting: fh(e.phase),
		dealPresentationAllowed: e.dealPresentationAllowed
	};
}
function zh(e, t, n) {
	return e && (t === "reveal" || t === "decision" || t === "draw" || t === "play") && n;
}
function Bh(e, t = !1) {
	let n = Pm(t);
	switch (e.phase) {
		case "handReset": return n.handResetMs;
		case "ante": return 0;
		case "trumpReveal": return n.trumpRevealHoldMs;
		case "trumpMerge": return n.trumpMergeAnimMs;
		case "drawPlayer": return e.drawAnimSubPhase === "done" ? 0 : Im(e.drawAnimSubPhase === "receive" ? 0 : e.drawDiscardCount, e.drawAnimSubPhase === "receive" ? e.drawReplaceCount : 0, t);
		case "drawReady": return n.drawReadyBeatMs;
		case "settle": return n.settleHoldMs;
		case "nextHandReset": return n.nextHandResetMs;
		default: return 0;
	}
}
var Vh = /* @__PURE__ */ new Set();
function Hh(e, t = 5) {
	let n = [];
	for (let r = 0; r < t; r += 1) for (let t of e) n.push({
		playerId: t,
		roundIndex: r,
		stepIndex: n.length
	});
	return n;
}
function Uh(e, t = V()) {
	if (e <= 0) return 0;
	let n = t ? .35 : 1, r = t ? 40 : 63, i = Math.round(255 * n), a = Math.round(50 * n);
	return (e - 1) * r + i + a;
}
function Wh(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		let e = i.querySelector("[data-trump-deal-target]");
		if (e) return ia(e);
	}
	let a = i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`) ?? i.querySelector(`[data-deal-seat="${e}"] [data-deal-round="${t}"]`), o = a?.querySelector(".pcard") ?? a;
	return o ? ia(o) : null;
}
function Gh(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * .24)
	};
}
function Kh(e) {
	let t = document.createElement("div");
	return t.className = "deal-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function qh(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		i.querySelector("[data-trump-deal-target]")?.classList.add("deal-card--revealed"), i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`)?.classList.add("deal-card--revealed");
		return;
	}
	i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`)?.classList.add("deal-card--revealed");
}
function Jh(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".deal-card--revealed")) e.classList.remove("deal-card--revealed");
	for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
}
function Yh() {
	for (let e of Vh) e.kill();
	Vh.clear();
}
function Xh({ steps: e, root: t, trumpHolderId: n = null, onStepComplete: r, onComplete: i }) {
	Zo(t), Yh();
	let a = V(), o = ie(255 / 1e3, a), s = ie(50 / 1e3, a), c = a ? .04 : 63 / 1e3, l = hs(t), u = J.timeline({
		onComplete: () => {
			Vh.delete(u), i?.();
		},
		onInterrupt: () => {
			Vh.delete(u);
			for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
		}
	});
	if (Vh.add(u), !l || e.length === 0) {
		for (let r of e) qh(r.playerId, r.roundIndex, t, n);
		return u.call(() => i?.()), u;
	}
	e.forEach((e, i) => {
		let d = i * c, f = Wh(e.playerId, e.roundIndex, t, n);
		u.call(() => {
			if (!f) {
				qh(e.playerId, e.roundIndex, t, n), r?.(e);
				return;
			}
			let i = Kh(l);
			t.appendChild(i);
			let c = ia(i), { x: u, y: d } = sa(c, l), p = f.left + f.width / 2, m = f.top + f.height / 2, h = c.left + c.width / 2, g = c.top + c.height / 2, _ = p - h, v = m - g, { midX: y, midY: b } = Gh(_, v);
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
				i.remove(), qh(e.playerId, e.roundIndex, t, n), r?.(e);
			} });
			a ? x.to(i, {
				x: _,
				y: v,
				rotation: 0,
				rotationY: 0,
				scale: 1,
				opacity: 1,
				duration: o,
				ease: L
			}) : x.add(Qo(i, {
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
				ease: L
			})), x.to(i, {
				scale: 1.02,
				duration: s * .45,
				yoyo: !0,
				repeat: 1,
				ease: z
			}, o);
		}, void 0, d);
	});
	let d = Uh(e.length, a) + 120, f = window.setTimeout(() => {
		u.progress() < 1 && u.progress(1);
	}, d);
	return u.eventCallback("onComplete", () => window.clearTimeout(f)), u.eventCallback("onInterrupt", () => window.clearTimeout(f)), u;
}
//#endregion
//#region src/table/hooks/useTableDealPresentation.ts
function Zh({ session: e, dealPresentationAllowed: t, privateHandReady: n = !1, tableRootRef: r }) {
	let [i, a] = (0, l.useState)(!1), o = (0, l.useRef)(null), s = (0, l.useRef)(e.handNumber);
	return (0, l.useLayoutEffect)(() => {
		let t = r.current;
		t && s.current !== e.handNumber && (s.current = e.handNumber, o.current = null, Yh(), Jh(t), Yf(!1), a(!1));
	}, [e.handNumber, r]), (0, l.useLayoutEffect)(() => {
		let i = r.current;
		if (!i || !zh(t, e.phase, n)) return;
		let s = `${e.handNumber}:${e.participantIds.join(",")}`;
		if (o.current === s) return;
		let c = tm(e.participantIds, e), l = Lc(e.dealerId, e.participantIds, c.length ? c : e.participantIds);
		if (l.length < 2) return;
		let u = Hh(l, 5);
		if (!u.length) return;
		o.current = s, Yh(), Jh(i), i.classList.add("btable-wrap--clockwise-dealing"), a(!0), Yf(!0);
		let d = iu(), f = window.requestAnimationFrame(() => {
			Xh({
				steps: u,
				root: i,
				trumpHolderId: e.trumpHolderId ?? e.dealerId ?? null,
				onComplete: () => {
					i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), Yf(!1);
				}
			});
		}), p = window.setTimeout(() => {
			i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), Yf(!1);
		}, Uh(u.length, d) + 400);
		return () => {
			window.cancelAnimationFrame(f), window.clearTimeout(p), Yh(), i.classList.remove("btable-wrap--clockwise-dealing"), Yf(!1), a(!1);
		};
	}, [
		e.handNumber,
		e.phase,
		e.dealerId,
		e.participantIds,
		t,
		n,
		r
	]), i;
}
//#endregion
//#region src/table/animations/trumpMergePresentation.ts
var Qh = null;
function $h() {
	Qh?.kill(), Qh = null;
}
function eg(e, t = {}) {
	Zo(e), $h();
	let n = e.querySelector("[data-trump-deal-target] .pcard"), r = e.querySelector(".hand__slot--trump-merge-target .pcard");
	if (!n || !r) return t.onComplete?.(), null;
	let i = ia(n), { x: a, y: o } = oa(i, ia(r)), s = n.cloneNode(!0);
	s.className = `${s.className} trump-merge-fly-ghost`.trim(), s.setAttribute("aria-hidden", "true"), s.style.position = "fixed", s.style.left = `${i.left}px`, s.style.top = `${i.top}px`, s.style.width = `${i.width}px`, s.style.height = `${i.height}px`, s.style.margin = "0", s.style.pointerEvents = "none", s.style.zIndex = "6", s.style.transformOrigin = "50% 80%", document.body.appendChild(s);
	let c = n.closest("[data-trump-deal-target]");
	J.set(n, { opacity: 0 }), c && J.set(c, { opacity: 0 }), J.set(r, { opacity: 0 });
	let { x: l, y: u } = sa(ia(s), i);
	J.set(s, {
		x: l,
		y: u,
		force3D: !0
	});
	let d = ie(B.trumpMerge), f = a * .45, p = o * .45 - Math.max(24, Math.hypot(a, o) * .18), m = J.timeline({
		onComplete: () => {
			s.remove(), J.set(r, { clearProps: "opacity" }), c && J.set(c, { clearProps: "opacity" }), J.set(n, { clearProps: "opacity" }), Qh = null, t.onComplete?.();
		},
		onInterrupt: () => {
			s.remove(), J.set(r, { clearProps: "opacity" }), c && J.set(c, { clearProps: "opacity" }), J.set(n, { clearProps: "opacity" }), Qh = null;
		}
	});
	return m.add(Qo(s, {
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
	})), Qh = m, m;
}
//#endregion
//#region src/table/hooks/useTrumpMergePresentation.ts
function tg({ tableRootRef: e, trumpMergeActive: t, isTrumpHolder: n, onComplete: r }) {
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
		if (!n || iu()) {
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
			eg(t, { onComplete: () => {
				s || o();
			} }) || o();
		}, l = window.requestAnimationFrame(() => {
			window.requestAnimationFrame(c);
		});
		return () => {
			s = !0, window.cancelAnimationFrame(l), $h();
		};
	}, [
		t,
		n,
		e
	]);
}
//#endregion
//#region src/table/wonTrickPileModel.ts
function ng(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function rg(e, t) {
	return (e >>> t & 65535) / 65535;
}
function ig(e, t) {
	let n = ng(`${e}@book${t}`), r = rg(n, 0), i = rg(n, 9), a = rg(n, 17), o = r >= .5 ? 1 : -1, s = i >= .5 ? 1 : -1;
	return {
		offsetX: o * (1.5 + r * 2.5) + t * 2.2,
		offsetY: t * -1.8 + i * 1.2,
		rotation: s * (4 + a * 5) + t * 2.5,
		scale: .88 - t * .02,
		zIndex: t + 1
	};
}
function ag(e) {
	return `${e.playerId}:h${e.handNumber}:t${e.trickNumber}`;
}
//#endregion
//#region src/table/animations/wonTrickPileMotion.ts
var og = /* @__PURE__ */ new Set(), sg = /* @__PURE__ */ new Set(), cg = B.drawDiscard;
function lg(e, t) {
	return {
		midX: e * .5,
		midY: t * .5
	};
}
function ug(e, t = document) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document, r = n.querySelector(`[data-won-trick-pile-anchor="${e}"]`) ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`);
	return r ? ia(r) : null;
}
function dg() {
	for (let e of sg) J.set(e, { clearProps: "opacity,transform,willChange,zIndex" });
	sg.clear();
}
function fg(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) e.remove();
}
function pg(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".bseat--pile-reveal-ready")) e.classList.remove("bseat--pile-reveal-ready");
}
function mg(e = document) {
	for (let e of og) e.kill();
	og.clear(), fg(e), dg(), pg(e);
}
function hg() {
	for (let e of og) e.kill();
	og.clear(), dg();
}
function gg(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function _g(e, t) {
	let n = ia(e), r = document.createElement("div");
	r.className = "won-trick-fly-ghost", r.setAttribute("aria-hidden", "true"), r.style.position = "fixed", r.style.left = `${n.left}px`, r.style.top = `${n.top}px`, r.style.width = `${n.width}px`, r.style.height = `${n.height}px`, r.style.pointerEvents = "none", r.style.zIndex = "4", r.style.transformOrigin = "50% 50%";
	let i = e.cloneNode(!0);
	return i.style.width = "100%", i.style.height = "100%", r.appendChild(i), t.appendChild(r), r;
}
function vg(e, t) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document;
	(n.querySelector(`[data-won-trick-pile-anchor="${e}"]`)?.closest(".bseat") ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`)?.closest(".bseat"))?.classList.add("bseat--pile-reveal-ready");
}
function yg(e, t) {
	Zo(t.root ?? document);
	let n = V(), r = t.root ?? document, i = t.host ?? (r instanceof HTMLElement ? r : document.body), a = ug(t.winnerPlayerId, r), o = n ? .06 : 140 / 1e3, s = ie(cg, n), c = n ? .03 : .05, l = [], u = (e) => {
		og.delete(d);
		for (let e of l) e.remove();
		dg(), e && vg(t.winnerPlayerId, r), t.onComplete?.();
	}, d = J.timeline({
		onComplete: () => u(!0),
		onInterrupt: () => u(!1)
	});
	og.add(d), e.forEach((e, r) => {
		let u = ig(t.trickKey, t.bookIndex), f = _g(e, i);
		l.push(f), sg.add(e), J.set(e, { opacity: 0 });
		let p = ia(f);
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
		let h = a.left + a.width / 2 + u.offsetX, g = a.top + a.height / 2 + u.offsetY, _ = p.left + p.width / 2, v = p.top + p.height / 2, y = h - _, b = g - v, { midX: x, midY: S } = lg(y, b);
		d.to(f, {
			scale: .98,
			duration: o,
			ease: L
		}, m), d.add(Qo(f, {
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
			ease: L,
			onComplete: () => f.remove()
		}), m + o);
	});
	let f = Math.round((e.length > 0 ? (e.length - 1) * c : 0) * 1e3 + (o + s) * 1e3 + 60);
	return gg(d, Math.min(760, Math.max(300, f))), d;
}
function bg() {
	return og.size > 0;
}
function xg(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = [...t.querySelectorAll("[data-trick-variant=\"live\"] .btrick__play .pcard, [data-testid=\"trick-row\"] .btrick__play .pcard")].filter((e) => e.closest("[data-trick-variant=\"echo\"]") == null);
	return n.length > 0 ? n : [...t.querySelectorAll("[data-trick-variant=\"echo\"] .btrick__play .pcard")];
}
//#endregion
//#region src/table/hooks/useWonTrickCollection.ts
var Sg = new Set(["nextLeadReady", "live"]);
function Cg({ trickPresentation: e, handNumber: t, sessionPhase: n = null, handComplete: r = !1, tableRootRef: i, onTrickCollectionStart: a }) {
	let o = (0, l.useRef)(null), s = (0, l.useRef)(t), c = (0, l.useRef)(e.phase), u = (0, l.useRef)(null), d = () => {
		u.current != null && (window.clearTimeout(u.current), u.current = null);
	}, f = (e) => {
		d();
		let t = bg() ? 820 : 0;
		u.current = window.setTimeout(() => {
			u.current = null, wg(e);
		}, t);
	};
	(0, l.useLayoutEffect)(() => {
		let a = i.current;
		if (a) {
			if (s.current !== t) {
				s.current = t, o.current = null, d(), mg(a);
				return;
			}
			(r && e.phase !== "collectTrick" && e.phase !== "winnerReveal" || n != null && n !== "play") && (o.current = null, d(), mg(a));
		}
	}, [
		t,
		r,
		n,
		e.phase,
		i
	]), (0, l.useLayoutEffect)(() => {
		let n = c.current, r = e.phase;
		c.current = r;
		let s = i.current;
		if (!s || (n === "collectTrick" && Sg.has(r) && (o.current = null, f(s)), r !== "collectTrick")) return;
		let l = e.trickWinnerSeatId, u = e.frozenTrick;
		if (!l || !u) return;
		let p = `${u.trickNumber}:${l}:${u.plays.length}`;
		if (o.current === p) return;
		o.current = p, d(), hg(), Tg(s);
		let m = xg(s);
		if (!m.length) return;
		let h = Math.max(0, (e.displayTricksByPlayer[l] ?? 1) - 1), g = ag({
			playerId: l,
			handNumber: t,
			trickNumber: u.trickNumber
		}), _ = If(t, u.trickNumber);
		Zf(!0, _);
		let v = window.setTimeout(() => {
			a?.({
				trickId: u.trickNumber,
				winningSeat: l
			}), yg(m, {
				winnerPlayerId: l,
				trickKey: g,
				bookIndex: h,
				root: s,
				host: s,
				onComplete: () => Zf(!1, _)
			});
		}, 240);
		return () => {
			window.clearTimeout(v), Zf(!1, _);
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
			d(), e ? mg(e) : hg();
		};
	}, [i]);
}
function wg(e) {
	for (let t of e.querySelectorAll(".bseat--pile-reveal-ready")) t.classList.remove("bseat--pile-reveal-ready");
}
function Tg(e) {
	for (let t of e.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) t.remove();
}
//#endregion
//#region src/table/hooks/useCardAudio.ts
function Eg({ trickPresentation: e, currentUserId: t = null, participantCount: n, trickNumber: r, sessionPhase: i = null }) {
	let a = (0, l.useRef)(e.phase), o = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		i !== "play" && (id(), o.current = null);
	}, [i, r]), (0, l.useEffect)(() => {
		let r = a.current, i = e.phase;
		if (a.current = i, r === i || i !== "winnerReveal") return;
		let s = e.frozenTrick, c = s?.winnerId ?? e.trickWinnerSeatId;
		if (!c || !s) return;
		let l = `${s.trickNumber}:${c}:won`;
		o.current !== l && (o.current = l, ld(Du({
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
			ld(Tu(i)), i.takesLead && i.cardIndex > 0 && ld(Eu(i));
		}, [
			e.phase,
			r,
			n
		]),
		onTrickCollectionStart: (0, l.useCallback)((e) => {
			ld(ku({
				...e,
				playerCount: n,
				isLocalPlayer: e.isLocalPlayer ?? (t != null && t === e.winningSeat)
			}));
		}, [n, t])
	};
}
//#endregion
//#region src/session/liveHand.ts
function Dg() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function Og(e) {
	let t = e ?? Dg();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function kg(e) {
	if (!e) return !1;
	let t = e.phase ?? null;
	if (t !== "draw" && t !== "play" && t !== "reveal" && t !== "decision") return !1;
	let n = e.participantIds ?? [];
	if (n.length === 0) return !1;
	let r = e.tricksByPlayer ?? {};
	return !(Al(r, n) || kl(r, n) >= 5);
}
function Ag(e) {
	if (!e) return 0;
	let t = e.phase ?? "", n = t === "play" ? 1e3 : t === "draw" ? 100 : t === "decision" ? 50 : t === "reveal" ? 25 : 0;
	n += (e.drawCompletedIds?.length ?? 0) * 10;
	let r = e.participantIds ?? [];
	n += kl(e.tricksByPlayer ?? {}, r);
	let i = e.handDecision;
	return t === "decision" && i && (n += (i.currentIndex ?? 0) * 5, n += (i.playingIds?.length ?? 0) * 2, n += (i.passedIds?.length ?? 0) * 2), n;
}
function jg(e, t) {
	return kg(t) ? kg(e) ? Ag(t) >= Ag(e) ? t : e : t : e;
}
function Mg(e) {
	let t = e?.phase ?? null;
	return t === "reveal" || t === "decision" || t === "draw" || t === "play";
}
function Ng(e) {
	let t = e?.currentHand ?? Dg(), n = e?.liveEnrollment?.deal?.publicHand, r = n?.phase ?? null;
	if (Og(t) && n && !kg(n)) return Dg();
	if (kg(t) && kg(n)) {
		let e = t.phase === "reveal" || t.phase === "decision", r = n?.drawCompletedIds?.length ?? 0, i = t.drawCompletedIds?.length ?? 0, a = kl(n?.tricksByPlayer ?? {}, n?.participantIds ?? []), o = kl(t.tricksByPlayer ?? {}, t.participantIds ?? []);
		return e && n?.phase === "draw" && o === 0 && a === 0 && r > 0 && i === 0 ? t : jg(t, n);
	}
	if (kg(t)) return t;
	if (r === "draw" || r === "play" || r === "reveal" || r === "decision") {
		if (kg(n)) {
			let i = kl(n?.tricksByPlayer ?? {}, n?.participantIds ?? []);
			return Og(t) && i === 0 && r === "draw" && !e?.liveEnrollment?.active ? Dg() : n;
		}
		return n?.phase ? n : Mg(t) ? t : Og(t) ? Dg() : t;
	}
	return r && n ? n : t;
}
function Pg(e) {
	let t = Ng(e), n = t?.phase ?? null;
	if (n === "reveal" || n === "draw" || n === "play") return null;
	if (n === "decision") {
		let e = zc(t.handDecision ?? null);
		if (e?.active) return e;
	}
	let r = e?.liveEnrollment, i = r?.deal?.publicHand?.phase ?? null;
	return r?.active ? r : i === "draw" || i === "play" || i === "reveal" || i === "decision" ? null : e?.handEnrollment?.active ? e.handEnrollment : e?.handEnrollment ?? null;
}
function Fg(e) {
	return !e.cardsDealt && e.handParticipantCount === 0 && e.enrollmentActive;
}
function Ig(e, t) {
	return e === "decision" && t?.active === !0;
}
function Lg(e) {
	return e.pagatDecisionActive && e.handDecision ? (e.handDecision.orderedPlayerIds ?? [])[e.handDecision.currentIndex ?? 0] ?? null : e.legacyEnrollmentActive && e.enrollment?.active ? (e.enrollment.orderedPlayerIds ?? [])[e.enrollment.currentIndex ?? 0] ?? null : null;
}
function Rg(e) {
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
}, zg = [
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
], Bg = (e, t) => `${e}:${t}`;
new Map(zg.map((e) => [Bg(e.from, e.event), e.to]));
function Vg(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
function Hg(e, t) {
	return !e || !t ? !1 : e === t ? !0 : Vg(e);
}
function Ug() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function Wg(e) {
	let t = e.session, n = t ? Ng(t) : Ug(), r = n.phase ?? null, i = n.participantIds ?? [], a = n.tricksByPlayer ?? {}, o = kl(a, i), s = i.length > 0 && Al(a, i), c = !!t?.pendingCoWinSettlement?.winnerIds?.length, l = t ? Pg(t) : null, u = Ig(r, n.handDecision ?? null), d = Fg({
		cardsDealt: r === Rc.REVEAL || r === Rc.DECISION || r === Rc.DRAW || r === Rc.PLAY,
		handParticipantCount: i.length,
		enrollmentActive: !!l?.active
	}), f = d || u, p = Gg({
		sessionStatus: t?.status ?? null,
		handPhase: r,
		participantIds: i,
		trickCount: o,
		handComplete: s,
		pendingCoWin: c,
		enrollmentActive: f,
		handCount: t?.handCount ?? 0,
		clearedHand: Og(n)
	});
	return {
		phase: p,
		handPhase: r,
		enrollmentActive: f,
		pagatDecisionActive: u,
		participantIds: i,
		turnPlayerId: Kg({
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
function Gg(e) {
	if (e.sessionStatus === "final") return $.WAITING;
	if (e.pendingCoWin) return $.SETTLE;
	let t = e.handPhase ?? null, n = e.participantIds ?? [];
	return t === Rc.PLAY ? e.handComplete || (e.trickCount ?? 0) >= 5 ? $.SETTLE : $.PLAY : t === Rc.DRAW ? $.DRAW : t === Rc.REVEAL ? $.DEAL : t === Rc.DECISION || e.enrollmentActive ? $.ENROLLMENT : e.clearedHand !== !1 && n.length === 0 && (e.handCount ?? 0) > 0 && !e.enrollmentActive ? $.NEXT_HAND_PREP : $.WAITING;
}
function Kg(e) {
	let { phase: t, hand: n, enrollment: r, pagatDecisionActive: i, legacyEnrollmentActive: a } = e;
	return t === $.ENROLLMENT ? Lg({
		pagatDecisionActive: i,
		handDecision: n.handDecision ?? null,
		legacyEnrollmentActive: a,
		enrollment: r
	}) : t === $.DRAW || t === $.PLAY ? n.turnPlayerId ?? null : null;
}
function qg(e) {
	let { snapshot: t, action: n, playerId: r, actorId: i, suppressTurn: a = !1 } = e, o = e.drawCompletedIds ?? [];
	if (!Hg(r, i)) return {
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
function Jg(e) {
	if (!e.suppressTurn) return !1;
	let t = e.currentUserId;
	return !(e.session.phase === "play" && t && e.session.turnPlayerId === t);
}
function Yg(e) {
	return Jg({
		suppressTurn: e.suppressTurn,
		session: e.session,
		currentUserId: e.currentUserId
	});
}
function Xg(e) {
	let t = e.currentUserId, n = Yg(e);
	if (!t || e.handComplete) return !1;
	let r = e.selfPlayer, i = Rg({
		phase: e.session.phase,
		participantIds: e.session.participantIds,
		playerId: t
	});
	if (!r || !i && r.isOut || r.actionDeclared) return !1;
	let a = Wg({
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
		suppressTurn: n
	});
	if (a.phase === $.ENROLLMENT || e.enrollmentActive) return !!(r.canToggleInHand || r.canPassEnrollment);
	if (a.phase === $.DEAL) return !1;
	let o = qg({
		snapshot: a,
		action: "submit_draw",
		playerId: t,
		actorId: t,
		suppressTurn: n,
		drawCompletedIds: e.session.drawCompletedIds
	});
	if (a.phase === $.DRAW && o.ok) return !0;
	let s = qg({
		snapshot: a,
		action: "play_card",
		playerId: t,
		actorId: t,
		suppressTurn: n
	});
	return !!(a.phase === $.PLAY && s.ok);
}
function Zg(e) {
	let t = e.currentUserId, n = Yg(e);
	if (!t || e.handComplete || n) return !1;
	let r = Wg({
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
		suppressTurn: n
	});
	return r.phase === $.DRAW ? qg({
		snapshot: r,
		action: "submit_draw",
		playerId: t,
		actorId: t,
		suppressTurn: n,
		drawCompletedIds: e.session.drawCompletedIds
	}).ok : r.phase === $.PLAY ? qg({
		snapshot: r,
		action: "play_card",
		playerId: t,
		actorId: t,
		suppressTurn: n
	}).ok : e.session.turnPlayerId === t;
}
function Qg(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off";
	return [
		e.session.phase ?? "",
		e.session.turnPlayerId ?? "",
		n,
		e.selfPlayer?.actionDeclared ? "declared" : "open",
		e.session.drawCompletedIds?.join(",") ?? "",
		Yg(e) ? "1" : "0",
		Xg(e) ? "act" : "wait"
	].join("|");
}
//#endregion
//#region src/table/trumpHolderPresentation.ts
function $g(e) {
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
function e_(e) {
	return e <= 0 ? null : e - 1;
}
function t_(e, t, n, r, i) {
	if (i || !t.trumpHolderId || e !== t.trumpHolderId || r <= 0) return {
		revealedTrumpUpcard: null,
		revealedTrumpIndex: null,
		seatTrumpMergeActive: !1
	};
	let a = t.showRevealedTrumpAtHolder ? e_(r) : null;
	return {
		revealedTrumpUpcard: t.showRevealedTrumpAtHolder ? n : null,
		revealedTrumpIndex: a,
		seatTrumpMergeActive: t.trumpMergeActive
	};
}
//#endregion
//#region src/table/CardTable.tsx
function n_({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: g, recommendedDiscardIndices: _ = [], handComplete: v = !1, actionFeedback: y, trickPresentation: b, handPresentation: S, microinteractions: C, instantTrickPlays: w = !1, turnCountdown: T = null, heroCanAct: E = null, visualCatchUpBusy: D = !1, bigPotEvent: O = null, onDismissTableEvent: k, onToggleInHand: A, onPassEnrollment: j, onTrickDelta: M, onSubmitDraw: N, onPassDraw: ee, onFoldDraw: P, onPlayCard: F, onReaction: I, onHeroUserActivity: te }) {
	let ne = t.map((e) => ({
		...e,
		isSelf: e.isSelf || m != null && e.playerId === m
	})), L = nm(ne, e, m), R = L.length, z = `btable--p${Math.min(8, Math.max(2, R))}`, B = Kl(R), re = Object.fromEntries(ne.map((e) => [e.playerId, e.displayName])), ie = Pm(), V = e.sessionId, ae = Qm({
		aspect: B,
		sessionKey: V
	});
	(0, l.useEffect)(() => {
		if (typeof window > "u" || localStorage.getItem("tableSeatDebug") !== "1") return;
		let e = ae.current;
		if (!e) return;
		let n = [...e.querySelectorAll(".bseat__avatar-wrap")].filter((e) => {
			let t = e.getBoundingClientRect();
			return t.width > 0 && t.height > 0;
		}).length;
		console.debug("[table-seats]", {
			playersProp: t.length,
			feltPlayers: ne.length,
			rotated: L.length,
			domSeats: e.querySelectorAll(".bseat").length,
			visibleAvatars: n,
			inOverlay: !!e.closest(".table-play-overlay"),
			desktopShell: !!e.closest(".btable-desktop")
		});
	}, [
		t.length,
		ne.length,
		L.length,
		ae
	]);
	let { cards: oe, pileIndexRef: H, commitDiscardCards: se } = Os({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: ae
	});
	$m({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: ae,
		pileIndexRef: H,
		onDiscardCommitted: se
	}), eh({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: ae
	}), nh({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: S,
		tableRootRef: ae
	});
	let ce = Zh({
		session: e,
		dealPresentationAllowed: S.dealPresentationAllowed,
		privateHandReady: p,
		tableRootRef: ae
	}), le = tm(e.participantIds, e);
	uh({
		handNumber: e.handNumber,
		phase: S.phase,
		anteAnimActive: S.anteAnimActive,
		dealerId: e.dealerId,
		participantIds: e.participantIds,
		seatRing: le,
		tableRootRef: ae,
		onCoinLanded: S.reportAnteCoinLanded,
		onSequenceComplete: S.completeAnteSequence
	});
	let U = e.trumpHolderId ?? e.dealerId ?? null, ue = m != null && U != null && m === U;
	tg({
		tableRootRef: ae,
		trumpMergeActive: S.trumpMergeActive,
		isTrumpHolder: ue,
		onComplete: S.completeTrumpMerge
	});
	let W = Eg({
		trickPresentation: b,
		currentUserId: m,
		participantCount: r,
		trickNumber: e.currentTrick?.trickNumber ?? b.frozenTrick?.trickNumber ?? 1,
		sessionPhase: e.phase
	});
	Cg({
		trickPresentation: b,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: v,
		tableRootRef: ae,
		onTrickCollectionStart: W.onTrickCollectionStart
	});
	let de = new Set(e.participantIds.filter((t) => Ml(t, b.displayTricksByPlayer, e.participantIds, e.phase))), fe = T?.playerId ?? null, G = Jg({
		suppressTurn: !!(b.suppressTurnPlayerId || S.suppressTurnIndicator),
		session: e,
		currentUserId: m
	}), pe = ne.map((t) => {
		let r = b.displayTricksByPlayer[t.playerId] ?? 0, i = b.trickWinnerSeatId === t.playerId, a = !G && fe != null && t.playerId === fe, o = b.phase === "collectTrick" && i, s = S.enrollmentPulse[t.playerId], c = S.animatingDrawPlayerId === t.playerId, l = t_(t.playerId, f, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: Z(t.bankroll, n.anteAmount, {
				inHand: t.inHand,
				anteAnimActive: S.anteAnimActive,
				anteAlreadyPosted: e.postedAntes != null && Object.prototype.hasOwnProperty.call(e.postedAntes, t.playerId),
				anteLandedThisHand: S.anteLandedPlayerIds.includes(t.playerId)
			}),
			tricksThisHand: r,
			isOnTurn: a,
			isActiveActor: a,
			isLeading: i && (b.phase === "winnerReveal" || b.phase === "collectTrick") ? !0 : G ? !1 : t.isLeading,
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
			bourrePressure: de.has(t.playerId)
		};
	}), me = ne.find((e) => e.isSelf), he = !!(m && e.drawCompletedIds?.includes(m));
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		ref: ae,
		className: [
			"btable-wrap btable-wrap--stage-fit",
			z,
			pe.some((e) => e.isActiveActor) ? "btable-wrap--has-active-turn" : "",
			ce ? "btable-wrap--clockwise-dealing" : ""
		].filter(Boolean).join(" "),
		"data-testid": "table-root",
		style: {
			"--player-count": R,
			"--table-aspect": B,
			"--trick-card-travel-ms": "395ms",
			"--trick-card-settle-ms": "165ms",
			"--trick-card-shift-ms": "220ms",
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": "900ms",
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": "525ms",
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": "2055ms",
			"--deal-card-stagger-ms": `${ie.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${ie.drawDiscardMs}ms`,
			"--draw-replace-ms": `${ie.drawReplaceMs}ms`
		},
		children: [/* @__PURE__ */ (0, x.jsx)("div", {
			className: "btable-wrap__table-area",
			children: /* @__PURE__ */ (0, x.jsx)("div", {
				className: "btable-wrap__stage-scaler",
				children: /* @__PURE__ */ (0, x.jsx)("div", {
					className: "table-stage-fit",
					children: /* @__PURE__ */ (0, x.jsxs)("div", {
						className: "table-stage",
						children: [
							/* @__PURE__ */ (0, x.jsxs)("div", {
								className: "table-oval",
								children: [/* @__PURE__ */ (0, x.jsx)("div", { className: "btable__rail" }), /* @__PURE__ */ (0, x.jsx)("div", {
									className: "btable__felt",
									"data-testid": "table-felt"
								})]
							}),
							/* @__PURE__ */ (0, x.jsx)("div", {
								className: "btable__play-zone",
								children: /* @__PURE__ */ (0, x.jsx)(Jp, {
									potMetrics: {
										...n,
										currentPot: S.antePotRevealed ? S.displayPotAmount : Math.max(0, S.displayPotAmount - n.anteAmount * Math.max(1, r))
									},
									participantCount: r,
									trumpUpcard: e.trumpUpcard,
									trumpSuit: e.trumpSuit,
									phase: e.phase,
									enrollmentActive: i,
									remainingDeckCount: e.remainingDeckCount,
									trickDisplayPlays: b.displayPlays,
									trickLeadSuit: e.currentTrick?.leadSuit ?? e.leadSuit ?? null,
									trickWinnerPlayerId: b.winnerPlayerId,
									trickShowWinnerTag: b.showWinnerTag,
									trickPresentationPhase: b.phase,
									trickEchoPlays: b.trickEchoPlays,
									trickEchoWinnerId: b.trickEchoWinnerId,
									trickEchoPhase: b.trickEchoPhase,
									showFinalTrickEcho: b.showFinalTrickEcho,
									playerNames: re,
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
									peakTrickPlayCount: b.peakPlayCount,
									discardPileCards: oe,
									currentUserId: m,
									onCardLanded: W.onCardLanded
								})
							}),
							/* @__PURE__ */ (0, x.jsx)("div", {
								className: "btable__seats",
								"aria-label": "Players at the table",
								children: L.map((e, t) => {
									let n = Em(t, L.length, {
										isMobile: !1,
										isSelf: e.isSelf
									}), r = pe.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, x.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										"data-seat-index": t,
										children: /* @__PURE__ */ (0, x.jsx)(em, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											clockwiseDealing: ce,
											style: {
												left: `${n.x}%`,
												top: `${n.y}%`
											},
											onToggleInHand: () => A(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
											onPassEnrollment: e.canPassEnrollment && j ? () => j(e.playerId) : void 0,
											onTrickDelta: (t) => M(e.playerId, t),
											onReaction: e.isSelf ? I : void 0
										})
									}, e.playerId);
								})
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ (0, x.jsxs)("div", {
			className: "hand-panel",
			children: [O && Rp(a) && k && /* @__PURE__ */ (0, x.jsx)(Lp, {
				event: O,
				onDismiss: k
			}), /* @__PURE__ */ (0, x.jsx)(Ip, {
				cards: a,
				privateHandReady: p,
				phase: e.phase,
				enrollmentActive: i,
				isInHand: !!me?.inHand,
				isDealer: !!me?.isDealer,
				signedIn: !!m,
				isMyTurn: E ?? (Zg({
					currentUserId: m,
					session: e,
					suppressTurn: !!G,
					handComplete: v,
					enrollmentActive: i,
					selfPlayer: me
				}) && !D),
				dealStaggerMs: ie.dealCardStaggerMs,
				drawAnimSubPhase: S.animatingDrawPlayerId === m ? S.drawAnimSubPhase : null,
				drawDiscardCount: S.animatingDrawPlayerId === m ? S.drawDiscardCount : 0,
				drawReplaceCount: S.animatingDrawPlayerId === m ? S.drawReplaceCount : 0,
				drawCompleted: he,
				maxDrawDiscards: e.maxDrawDiscards ?? 4,
				legalPlayIndices: h ?? void 0,
				recommendedPlayIndex: g ?? void 0,
				recommendedDiscardIndices: _,
				handComplete: v,
				actionFeedback: y,
				onSubmitDraw: N,
				onPassDraw: ee,
				onFoldDraw: P,
				onPlayCard: F,
				currentUserId: m,
				revealedTrumpIndex: o,
				trumpMergeActive: s,
				trumpDisabledIndex: c,
				handNumber: e.handNumber,
				trickNumber: e.currentTrick?.trickNumber ?? null,
				turnPlayerId: e.turnPlayerId,
				tableRootRef: ae,
				pileIndexRef: H,
				onDiscardCommitted: se,
				onUserActivity: te,
				skipHeroDealMotion: ce
			})]
		})]
	});
}
//#endregion
//#region src/table/layout/mobileSeatMap.ts
function r_(e, t) {
	let n = Math.max(1, Math.min(7, e || 1));
	return t === "portrait" ? n <= 1 ? .8 : n <= 2 ? .82 : n <= 3 ? .86 : n <= 4 ? .9 : .94 : n <= 1 ? 1.02 : n <= 2 ? .98 : n <= 3 ? 1.02 : n <= 5 ? 1.16 : 1.26;
}
//#endregion
//#region src/table/layout/useTableLayoutMode.ts
var i_ = "(orientation: portrait)";
function a_() {
	let e = qm(), [t, n] = (0, l.useState)(() => typeof window < "u" && window.matchMedia(i_).matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(i_), t = () => n(e.matches);
		return t(), e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []), e ? t ? "mobile-portrait" : "mobile-landscape" : "desktop";
}
//#endregion
//#region src/table/hooks/useMobileStageFit.ts
function o_(e, t) {
	if (typeof window > "u") return t;
	let n = getComputedStyle(document.documentElement).getPropertyValue(e).trim(), r = parseFloat(n);
	return Number.isFinite(r) ? r : t;
}
function s_(e) {
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
function c_(e) {
	return e.closest(".btable-mobile__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function l_({ aspect: e, sessionKey: t }) {
	let n = (0, l.useRef)(null), r = (0, l.useRef)(0), i = (0, l.useRef)(0), a = (0, l.useRef)(t), o = a_(), { settings: s } = Ff(), c = o === "mobile-portrait";
	return (0, l.useLayoutEffect)(() => {
		if (typeof window > "u") return;
		let o = n.current;
		if (!o) return;
		a.current !== t && (a.current = t, r.current = 0, i.current = 0);
		let l = window.visualViewport, u = () => {
			if (Ap()) return;
			let t = c_(o).getBoundingClientRect(), n = o.querySelector(".btable-mobile-hero-dock")?.getBoundingClientRect(), a = !!o.closest(".table-play-overlay"), u = c ? 104 : 92, d = c ? 210 : 168, f = Rm(n?.height ?? 0, r.current, u, d);
			r.current = f.peak;
			let p = f.height, m = parseInt(getComputedStyle(o).getPropertyValue("--player-count").trim(), 10) || 4, h = m <= 4, g = !c, _ = (g && h ? o_("--mobile-fit-pad-x", 4) : o_("--mobile-fit-pad-x", 8)) + (g && a ? 4 : 12), v = (g && h ? o_("--mobile-fit-pad-y", 2) : o_("--mobile-fit-pad-y", 6)) + (g && a ? 4 : 10), y = o_("--mobile-fit-gap", c ? 8 : 6), b = l, x = Math.min(t.width, b?.width ?? window.innerWidth), S = Math.min(t.height, b?.height ?? window.innerHeight);
			if (a) {
				let e = zm(s_(o), i.current, 72);
				i.current = e.peak, S = Math.max(140, S - e.height);
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = g ? {
				...Hm({
					availWidth: x,
					availHeight: S,
					aspect: e,
					userScale: 1,
					padX: _,
					padY: v,
					stageShare: Vm(m)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Um({
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
			Ap() || (d ??= window.requestAnimationFrame(() => {
				d = null, u();
			}));
		}, p = new ResizeObserver(f), m = c_(o);
		m instanceof HTMLElement && p.observe(m), f();
		let h = jp(() => {
			Ap() || f();
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
function u_({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: g, recommendedDiscardIndices: _ = [], handComplete: v = !1, actionFeedback: y, trickPresentation: b, handPresentation: S, microinteractions: C, instantTrickPlays: w = !1, turnCountdown: T = null, heroCanAct: E = null, visualCatchUpBusy: D = !1, bigPotEvent: O = null, onDismissTableEvent: k, onToggleInHand: A, onPassEnrollment: j, onTrickDelta: M, onSubmitDraw: N, onPassDraw: ee, onFoldDraw: P, onPlayCard: F, onHeroUserActivity: I }) {
	let te = a_() === "mobile-landscape" ? "landscape" : "portrait", ne = t.map((e) => ({
		...e,
		isSelf: e.isSelf || m != null && e.playerId === m
	})), L = nm(ne, e, m), R = L.filter((e) => !e.isSelf), z = L.find((e) => e.isSelf), B = z ? Om(L.length, te) : null, re = L.length, ie = `btable--p${Math.min(8, Math.max(2, re))}`, V = r_(R.length, te), ae = Object.fromEntries(t.map((e) => [e.playerId, e.displayName])), oe = Pm(), H = e.sessionId, se = l_({
		aspect: V,
		sessionKey: H
	});
	(0, l.useEffect)(() => {
		if (typeof window > "u" || localStorage.getItem("tableSeatDebug") !== "1") return;
		let e = se.current;
		if (!e) return;
		let n = [...e.querySelectorAll(".bseat__avatar-wrap")].filter((e) => {
			let t = e.getBoundingClientRect();
			if (t.width <= 0 || t.height <= 0) return !1;
			let n = t.left + t.width / 2, r = t.top + t.height / 2;
			return !!document.elementFromPoint(n, r)?.closest(".bseat__avatar-wrap");
		}).length;
		console.debug("[table-seats-mobile]", {
			playersProp: t.length,
			rotated: L.length,
			domSeats: e.querySelectorAll(".bseat").length,
			paintedAvatars: n,
			inOverlay: !!e.closest(".table-play-overlay"),
			mobileShell: !!e.closest(".btable-mobile")
		});
	}, [
		t.length,
		L.length,
		se
	]);
	let { cards: ce, pileIndexRef: le, commitDiscardCards: U } = Os({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: se
	});
	$m({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: se,
		pileIndexRef: le,
		onDiscardCommitted: U
	}), eh({
		handPresentation: S,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: se
	}), nh({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: S,
		tableRootRef: se
	});
	let ue = Zh({
		session: e,
		dealPresentationAllowed: S.dealPresentationAllowed,
		privateHandReady: p,
		tableRootRef: se
	}), W = tm(e.participantIds, e);
	uh({
		handNumber: e.handNumber,
		phase: S.phase,
		anteAnimActive: S.anteAnimActive,
		dealerId: e.dealerId,
		participantIds: e.participantIds,
		seatRing: W,
		tableRootRef: se,
		onCoinLanded: S.reportAnteCoinLanded,
		onSequenceComplete: S.completeAnteSequence
	});
	let de = e.trumpHolderId ?? e.dealerId ?? null, fe = m != null && de != null && m === de;
	tg({
		tableRootRef: se,
		trumpMergeActive: S.trumpMergeActive,
		isTrumpHolder: fe,
		onComplete: S.completeTrumpMerge
	});
	let G = Eg({
		trickPresentation: b,
		currentUserId: m,
		participantCount: r,
		trickNumber: e.currentTrick?.trickNumber ?? b.frozenTrick?.trickNumber ?? 1,
		sessionPhase: e.phase
	});
	Cg({
		trickPresentation: b,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: v,
		tableRootRef: se,
		onTrickCollectionStart: G.onTrickCollectionStart
	});
	let pe = new Set(e.participantIds.filter((t) => Ml(t, b.displayTricksByPlayer, e.participantIds, e.phase))), me = T?.playerId ?? null, he = Jg({
		suppressTurn: !!(b.suppressTurnPlayerId || S.suppressTurnIndicator),
		session: e,
		currentUserId: m
	}), ge = ne.map((t) => {
		let r = b.displayTricksByPlayer[t.playerId] ?? 0, i = b.trickWinnerSeatId === t.playerId, a = !he && me != null && t.playerId === me, o = b.phase === "collectTrick" && i, s = S.enrollmentPulse[t.playerId], c = S.animatingDrawPlayerId === t.playerId, l = t_(t.playerId, f, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: Z(t.bankroll, n.anteAmount, {
				inHand: t.inHand,
				anteAnimActive: S.anteAnimActive,
				anteAlreadyPosted: e.postedAntes != null && Object.prototype.hasOwnProperty.call(e.postedAntes, t.playerId),
				anteLandedThisHand: S.anteLandedPlayerIds.includes(t.playerId)
			}),
			tricksThisHand: r,
			isOnTurn: a,
			isActiveActor: a,
			isLeading: i && (b.phase === "winnerReveal" || b.phase === "collectTrick") ? !0 : he ? !1 : t.isLeading,
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
			bourrePressure: pe.has(t.playerId)
		};
	}), K = ne.find((e) => e.isSelf), _e = !!(m && e.drawCompletedIds?.includes(m));
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		ref: se,
		className: [
			"btable-mobile-wrap btable-mobile-wrap--stage-fit",
			ie,
			ge.some((e) => e.isActiveActor) ? "btable-wrap--has-active-turn" : "",
			ue ? "btable-wrap--clockwise-dealing" : ""
		].filter(Boolean).join(" "),
		"data-testid": "table-root",
		"data-layout": te,
		style: {
			"--player-count": re,
			"--table-aspect": V,
			"--trick-card-travel-ms": "395ms",
			"--trick-card-settle-ms": "165ms",
			"--trick-card-shift-ms": "220ms",
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": "900ms",
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": "525ms",
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": "2055ms",
			"--deal-card-stagger-ms": `${oe.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${oe.drawDiscardMs}ms`,
			"--draw-replace-ms": `${oe.drawReplaceMs}ms`
		},
		children: [/* @__PURE__ */ (0, x.jsx)("div", {
			className: "btable-mobile__table-area",
			children: /* @__PURE__ */ (0, x.jsx)("div", {
				className: "btable-mobile__stage-scaler",
				children: /* @__PURE__ */ (0, x.jsx)("div", {
					className: "btable-mobile-stage-fit",
					children: /* @__PURE__ */ (0, x.jsxs)("div", {
						className: "btable-mobile-stage table-stage",
						children: [
							/* @__PURE__ */ (0, x.jsxs)("div", {
								className: "table-oval btable-mobile-oval",
								children: [/* @__PURE__ */ (0, x.jsx)("div", { className: "btable__rail" }), /* @__PURE__ */ (0, x.jsx)("div", {
									className: "btable__felt",
									"data-testid": "table-felt"
								})]
							}),
							/* @__PURE__ */ (0, x.jsx)("div", {
								className: "btable__play-zone",
								children: /* @__PURE__ */ (0, x.jsx)(Jp, {
									potMetrics: {
										...n,
										currentPot: S.antePotRevealed ? S.displayPotAmount : Math.max(0, S.displayPotAmount - n.anteAmount * Math.max(1, r))
									},
									participantCount: r,
									trumpUpcard: e.trumpUpcard,
									trumpSuit: e.trumpSuit,
									phase: e.phase,
									enrollmentActive: i,
									remainingDeckCount: e.remainingDeckCount,
									trickDisplayPlays: b.displayPlays,
									trickLeadSuit: e.currentTrick?.leadSuit ?? e.leadSuit ?? null,
									trickWinnerPlayerId: b.winnerPlayerId,
									trickShowWinnerTag: b.showWinnerTag,
									trickPresentationPhase: b.phase,
									trickEchoPlays: b.trickEchoPlays,
									trickEchoWinnerId: b.trickEchoWinnerId,
									trickEchoPhase: b.trickEchoPhase,
									showFinalTrickEcho: b.showFinalTrickEcho,
									playerNames: ae,
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
									peakTrickPlayCount: b.peakPlayCount,
									discardPileCards: ce,
									currentUserId: m,
									onCardLanded: G.onCardLanded
								})
							}),
							/* @__PURE__ */ (0, x.jsxs)("div", {
								className: "btable__seats btable-mobile__seats",
								"aria-label": "Players at the table",
								children: [R.map((e, t) => {
									let n = Dm(t, L.length, te), r = ge.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, x.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										"data-seat-index": t + 1,
										children: /* @__PURE__ */ (0, x.jsx)(em, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											clockwiseDealing: ue,
											style: {
												left: `${n.x}%`,
												top: `${n.y}%`
											},
											onToggleInHand: () => A(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
											onPassEnrollment: e.canPassEnrollment && j ? () => j(e.playerId) : void 0,
											onTrickDelta: (t) => M(e.playerId, t),
											onReaction: void 0
										})
									}, e.playerId);
								}), z && B && /* @__PURE__ */ (0, x.jsx)("div", {
									className: "btable__seat-slot btable__seat-slot--self",
									"data-seat-index": 0,
									children: /* @__PURE__ */ (0, x.jsx)(em, {
										player: ge.find((e) => e.playerId === z.playerId) ?? z,
										region: B.region,
										handLane: B.handLane,
										clockwiseDealing: ue,
										style: {
											left: `${B.x}%`,
											top: `${B.y}%`
										},
										onToggleInHand: () => A(z.playerId, z.canToggleInHand ? !0 : !z.inHand),
										onPassEnrollment: z.canPassEnrollment && j ? () => j(z.playerId) : void 0,
										onTrickDelta: (e) => M(z.playerId, e),
										onReaction: void 0
									})
								}, z.playerId)]
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ (0, x.jsx)("div", {
			className: "btable-mobile-hero-dock hand-panel",
			children: /* @__PURE__ */ (0, x.jsxs)("div", {
				className: "btable-mobile-hero-dock__stack",
				children: [O && Rp(a) && k && /* @__PURE__ */ (0, x.jsx)(Lp, {
					event: O,
					onDismiss: k
				}), /* @__PURE__ */ (0, x.jsx)(Ip, {
					cards: a,
					privateHandReady: p,
					phase: e.phase,
					enrollmentActive: i,
					isInHand: !!K?.inHand,
					isDealer: !!K?.isDealer,
					signedIn: !!m,
					isMyTurn: E ?? (Zg({
						currentUserId: m,
						session: e,
						suppressTurn: !!he,
						handComplete: v,
						enrollmentActive: i,
						selfPlayer: K
					}) && !D),
					dealStaggerMs: oe.dealCardStaggerMs,
					drawAnimSubPhase: S.animatingDrawPlayerId === m ? S.drawAnimSubPhase : null,
					drawDiscardCount: S.animatingDrawPlayerId === m ? S.drawDiscardCount : 0,
					drawReplaceCount: S.animatingDrawPlayerId === m ? S.drawReplaceCount : 0,
					drawCompleted: _e,
					maxDrawDiscards: e.maxDrawDiscards ?? 4,
					legalPlayIndices: h ?? void 0,
					recommendedPlayIndex: g ?? void 0,
					recommendedDiscardIndices: _,
					handComplete: v,
					actionFeedback: y,
					onSubmitDraw: N,
					onPassDraw: ee,
					onFoldDraw: P,
					onPlayCard: F,
					currentUserId: m,
					revealedTrumpIndex: o,
					trumpMergeActive: s,
					trumpDisabledIndex: c,
					handNumber: e.handNumber,
					trickNumber: e.currentTrick?.trickNumber ?? null,
					turnPlayerId: e.turnPlayerId,
					tableRootRef: se,
					pileIndexRef: le,
					onDiscardCommitted: U,
					onUserActivity: I,
					skipHeroDealMotion: ue
				})]
			})
		})]
	});
}
//#endregion
//#region src/table/CinematicSplash.tsx
var d_ = new Set(["pot-cap", "hand-win"]);
function f_({ events: e, onDismiss: t }) {
	let n = [...e].reverse().find((e) => d_.has(e.kind));
	return (0, l.useEffect)(() => {
		if (!n) return;
		let e = window.setTimeout(() => t(n.id), n.durationMs ?? 2200);
		return () => window.clearTimeout(e);
	}, [n, t]), n ? /* @__PURE__ */ (0, x.jsxs)("div", {
		className: `bsplash bsplash--${n.kind}`,
		role: "status",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, x.jsx)("div", {
			className: "bsplash__glow",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, x.jsxs)("div", {
			className: "bsplash__content",
			children: [
				n.emoji && /* @__PURE__ */ (0, x.jsx)("span", {
					className: "bsplash__emoji",
					children: n.emoji
				}),
				/* @__PURE__ */ (0, x.jsx)("p", {
					className: "bsplash__title",
					children: n.title
				}),
				n.subtitle && /* @__PURE__ */ (0, x.jsx)("p", {
					className: "bsplash__subtitle",
					children: n.subtitle
				})
			]
		})]
	}) : null;
}
//#endregion
//#region src/table/DesktopLayoutShell.tsx
function p_({ children: e }) {
	let { settings: t } = Ff(), n = t.layoutMode === "tiled", r = qm();
	return /* @__PURE__ */ (0, x.jsx)("div", {
		className: [
			"btable-desktop",
			n ? "btable-desktop--tiled" : "btable-desktop--single",
			r ? "btable-desktop--native-mobile" : ""
		].join(" "),
		children: /* @__PURE__ */ (0, x.jsxs)("div", {
			className: "btable-desktop__viewport",
			children: [/* @__PURE__ */ (0, x.jsx)("div", {
				className: "btable-desktop__scale",
				children: e
			}), n && /* @__PURE__ */ (0, x.jsxs)("div", {
				className: "btable-desktop__tile-placeholder muted small",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, x.jsx)("span", { children: "Multi-room tile slot" }), /* @__PURE__ */ (0, x.jsx)("span", { children: "Monitor additional tables here in a future release" })]
			})]
		})
	});
}
//#endregion
//#region src/table/MobileLayoutShell.tsx
function m_({ children: e }) {
	let t = a_();
	return /* @__PURE__ */ (0, x.jsx)("div", {
		className: ["btable-mobile", `btable-mobile--${t === "mobile-landscape" ? "landscape" : "portrait"}`].join(" "),
		"data-layout-mode": t,
		children: /* @__PURE__ */ (0, x.jsx)("div", {
			className: "btable-mobile__viewport",
			children: /* @__PURE__ */ (0, x.jsx)("div", {
				className: "btable-mobile__frame",
				children: /* @__PURE__ */ (0, x.jsx)("div", {
					className: "btable-mobile__layout",
					children: e
				})
			})
		})
	});
}
//#endregion
//#region src/table/EventReactions.tsx
function h_({ events: e, onDismiss: t }) {
	let n = e.filter((e) => e.emoji && e.kind === "reaction");
	return (0, l.useEffect)(() => {
		let e = n.map((e) => window.setTimeout(() => t(e.id), e.durationMs ?? 1600));
		return () => e.forEach((e) => window.clearTimeout(e));
	}, [n, t]), n.length ? /* @__PURE__ */ (0, x.jsx)("div", {
		className: "breactions",
		"aria-hidden": "true",
		children: n.map((e, t) => /* @__PURE__ */ (0, x.jsx)("div", {
			className: "breactions__burst",
			style: { "--burst-i": t },
			children: /* @__PURE__ */ (0, x.jsx)("span", {
				className: "breactions__emoji",
				children: e.emoji
			})
		}, e.id))
	}) : null;
}
//#endregion
//#region src/table/FeedbackSettings.tsx
function g_({ compact: e = !1 }) {
	let [t, n] = (0, l.useState)(() => Pu()), [r, i] = (0, l.useState)(!1);
	(0, l.useEffect)(() => Ru(n), []);
	let a = Ld(), o = Ku();
	function s(e) {
		Fu({ soundMode: e });
	}
	function c(e) {
		Fu({ soundPackId: e }), hd(e);
	}
	function u(e) {
		Fu({ hapticsMode: e });
	}
	let d = /* @__PURE__ */ (0, x.jsxs)("div", {
		className: `bfeedback-settings${e ? " bfeedback-settings--compact" : ""}`,
		children: [
			/* @__PURE__ */ (0, x.jsxs)("fieldset", {
				className: "bfeedback-settings__fieldset",
				children: [
					/* @__PURE__ */ (0, x.jsx)("legend", {
						className: "bfeedback-settings__label",
						children: "Sound level"
					}),
					/* @__PURE__ */ (0, x.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, x.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "on",
							disabled: !a,
							onChange: () => s("on")
						}), "On"]
					}),
					/* @__PURE__ */ (0, x.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, x.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "minimal",
							disabled: !a,
							onChange: () => s("minimal")
						}), "Minimal"]
					}),
					/* @__PURE__ */ (0, x.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, x.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "off",
							onChange: () => s("off")
						}), "Off"]
					})
				]
			}),
			!a && /* @__PURE__ */ (0, x.jsx)("p", {
				className: "bfeedback-settings__note muted small",
				children: "Audio not supported in this browser."
			}),
			/* @__PURE__ */ (0, x.jsxs)("label", {
				className: "bfeedback-settings__row",
				children: [/* @__PURE__ */ (0, x.jsx)("span", {
					className: "bfeedback-settings__label",
					children: "Sound theme"
				}), /* @__PURE__ */ (0, x.jsx)("select", {
					value: t.soundPackId,
					disabled: !a || t.soundMode === "off",
					onChange: (e) => c(e.target.value),
					children: Object.keys(uu).map((e) => /* @__PURE__ */ (0, x.jsx)("option", {
						value: e,
						children: uu[e]
					}, e))
				})]
			}),
			/* @__PURE__ */ (0, x.jsxs)("fieldset", {
				className: "bfeedback-settings__fieldset",
				children: [
					/* @__PURE__ */ (0, x.jsx)("legend", {
						className: "bfeedback-settings__label",
						children: "Haptics"
					}),
					/* @__PURE__ */ (0, x.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, x.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "on",
							disabled: !o,
							onChange: () => u("on")
						}), "On"]
					}),
					/* @__PURE__ */ (0, x.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, x.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "minimal",
							disabled: !o,
							onChange: () => u("minimal")
						}), "Minimal"]
					}),
					/* @__PURE__ */ (0, x.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, x.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "off",
							onChange: () => u("off")
						}), "Off"]
					})
				]
			}),
			!o && /* @__PURE__ */ (0, x.jsx)("p", {
				className: "bfeedback-settings__note muted small",
				children: "Vibration unavailable on this device."
			})
		]
	});
	return e ? /* @__PURE__ */ (0, x.jsxs)("div", {
		className: "bfeedback-settings-wrap",
		children: [/* @__PURE__ */ (0, x.jsx)("button", {
			type: "button",
			className: "bfeedback-settings__toggle btn btn--sm",
			"aria-expanded": r,
			"aria-controls": "table-feedback-settings",
			onClick: () => i((e) => !e),
			children: r ? "Hide feedback" : "Sound & haptics"
		}), r && /* @__PURE__ */ (0, x.jsx)("div", {
			id: "table-feedback-settings",
			className: "bfeedback-settings__popover",
			children: d
		})]
	}) : d;
}
//#endregion
//#region src/table/TableSettingsPanel.tsx
function __({ open: e, onClose: t }) {
	let { settings: n, updateSettings: r, resetSettings: i } = Ff();
	return e ? /* @__PURE__ */ (0, x.jsxs)("div", {
		className: "bsettings",
		role: "dialog",
		"aria-label": "Table appearance",
		"data-testid": "settings-panel",
		children: [/* @__PURE__ */ (0, x.jsxs)("div", {
			className: "bsettings__panel",
			children: [
				/* @__PURE__ */ (0, x.jsxs)("header", {
					className: "bsettings__head",
					children: [/* @__PURE__ */ (0, x.jsx)("h6", {
						className: "bsettings__title",
						children: "Table room"
					}), /* @__PURE__ */ (0, x.jsx)("button", {
						type: "button",
						className: "bsettings__close",
						onClick: t,
						"aria-label": "Close",
						children: "×"
					})]
				}),
				/* @__PURE__ */ (0, x.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, x.jsx)("span", { children: "Theme" }), /* @__PURE__ */ (0, x.jsx)("select", {
						value: n.themeId,
						onChange: (e) => r({ themeId: e.target.value }),
						children: Object.keys(Df).map((e) => /* @__PURE__ */ (0, x.jsx)("option", {
							value: e,
							children: Df[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, x.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, x.jsx)("span", { children: "Card style" }), /* @__PURE__ */ (0, x.jsx)("select", {
						value: n.cardPackId,
						onChange: (e) => r({ cardPackId: e.target.value }),
						children: Object.keys(Tf).map((e) => /* @__PURE__ */ (0, x.jsx)("option", {
							value: e,
							children: Tf[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, x.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, x.jsx)("span", { children: "Deck" }), /* @__PURE__ */ (0, x.jsxs)("select", {
						value: n.deckMode,
						onChange: (e) => r({ deckMode: e.target.value }),
						children: [/* @__PURE__ */ (0, x.jsx)("option", {
							value: "classic",
							children: "Classic two-color"
						}), /* @__PURE__ */ (0, x.jsx)("option", {
							value: "four-color",
							children: "Four-color contrast"
						})]
					})]
				}),
				/* @__PURE__ */ (0, x.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, x.jsx)("span", { children: "Card size" }), /* @__PURE__ */ (0, x.jsxs)("select", {
						value: n.cardScale,
						onChange: (e) => r({ cardScale: e.target.value }),
						children: [
							/* @__PURE__ */ (0, x.jsx)("option", {
								value: "sm",
								children: "Compact"
							}),
							/* @__PURE__ */ (0, x.jsx)("option", {
								value: "md",
								children: "Standard"
							}),
							/* @__PURE__ */ (0, x.jsx)("option", {
								value: "lg",
								children: "Large"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, x.jsxs)("label", {
					className: "bsettings__field bsettings__field--row",
					children: [
						/* @__PURE__ */ (0, x.jsx)("span", { children: "Table scale" }),
						/* @__PURE__ */ (0, x.jsx)("input", {
							type: "range",
							min: .85,
							max: 1.35,
							step: .05,
							value: n.tableScale,
							onChange: (e) => r({ tableScale: Number(e.target.value) })
						}),
						/* @__PURE__ */ (0, x.jsxs)("span", {
							className: "bsettings__range-val",
							children: [Math.round(n.tableScale * 100), "%"]
						})
					]
				}),
				/* @__PURE__ */ (0, x.jsxs)("label", {
					className: "bsettings__check",
					children: [/* @__PURE__ */ (0, x.jsx)("input", {
						type: "checkbox",
						checked: n.highContrast,
						onChange: (e) => r({ highContrast: e.target.checked })
					}), "High contrast"]
				}),
				/* @__PURE__ */ (0, x.jsxs)("fieldset", {
					className: "bsettings__fieldset",
					children: [
						/* @__PURE__ */ (0, x.jsx)("legend", { children: "Layout (scaffold)" }),
						/* @__PURE__ */ (0, x.jsxs)("label", {
							className: "bsettings__check",
							children: [/* @__PURE__ */ (0, x.jsx)("input", {
								type: "radio",
								name: "layout",
								checked: n.layoutMode === "single",
								onChange: () => r({ layoutMode: "single" })
							}), "Single table"]
						}),
						/* @__PURE__ */ (0, x.jsxs)("label", {
							className: "bsettings__check bsettings__check--muted",
							children: [/* @__PURE__ */ (0, x.jsx)("input", {
								type: "radio",
								name: "layout",
								checked: n.layoutMode === "tiled",
								onChange: () => r({ layoutMode: "tiled" })
							}), "Tiled multi-room (preview)"]
						})
					]
				}),
				/* @__PURE__ */ (0, x.jsxs)("details", {
					className: "bsettings__hotkeys",
					children: [/* @__PURE__ */ (0, x.jsx)("summary", { children: "Hotkeys (scaffold)" }), /* @__PURE__ */ (0, x.jsxs)("ul", {
						className: "bsettings__hotkey-list muted small",
						children: [
							/* @__PURE__ */ (0, x.jsxs)("li", { children: [/* @__PURE__ */ (0, x.jsx)("kbd", { children: n.hotkeys.focusTable }), " Focus table"] }),
							/* @__PURE__ */ (0, x.jsxs)("li", { children: [/* @__PURE__ */ (0, x.jsx)("kbd", { children: n.hotkeys.toggleSettings }), " Settings"] }),
							/* @__PURE__ */ (0, x.jsxs)("li", { children: [/* @__PURE__ */ (0, x.jsx)("kbd", { children: n.hotkeys.standPat }), " Stand pat (reserved)"] }),
							/* @__PURE__ */ (0, x.jsxs)("li", { children: [/* @__PURE__ */ (0, x.jsx)("kbd", { children: n.hotkeys.nextTable }), " Next table (reserved)"] })
						]
					})]
				}),
				/* @__PURE__ */ (0, x.jsx)("footer", {
					className: "bsettings__foot",
					children: /* @__PURE__ */ (0, x.jsx)("button", {
						type: "button",
						className: "btn btn--sm",
						onClick: i,
						children: "Reset defaults"
					})
				})
			]
		}), /* @__PURE__ */ (0, x.jsx)("button", {
			type: "button",
			className: "bsettings__backdrop",
			onClick: t,
			"aria-label": "Close"
		})]
	}) : null;
}
//#endregion
//#region src/table/hooks/useTableEvents.ts
var v_ = 0;
function y_() {
	return v_ += 1, `evt-${v_}-${Date.now()}`;
}
function b_(e, t, n) {
	let r = t.currentPot, i = [];
	return r >= t.potCap && t.limEnabled && r > e.pot ? i.push({
		id: y_(),
		kind: "pot-cap",
		title: "Pot cap reached",
		subtitle: "LmT engaged",
		emoji: "🔒",
		durationMs: 2200
	}) : r >= t.anteAmount * Math.max(n.length, 2) * 2 && r > e.pot && i.push({
		id: y_(),
		kind: "big-pot",
		title: "Big pot brewing",
		emoji: "💰",
		durationMs: 2e3
	}), i;
}
function x_({ session: e, potMetrics: t, participantIds: n }) {
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
		let o = b_(r, t, n);
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
				id: y_(),
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
//#region src/table/handServerUpdateGate.ts
function S_(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function C_(e) {
	return typeof e == "string" && e.length > 0;
}
function w_(e, t) {
	return `${e}-hand-${t}`;
}
function T_(e, t) {
	return !C_(e) || !S_(t) ? null : w_(e, t);
}
//#endregion
//#region src/table/hooks/useHandPresentation.ts
var E_ = [], D_ = [];
function O_(e, t) {
	let n = new Set(e), r = new Set(t);
	return {
		discardCount: [...n].filter((e) => !r.has(e)).length,
		replaceCount: [...r].filter((e) => !n.has(e)).length
	};
}
function k_({ session: e, enrollmentActive: t, potAmount: n, handComplete: r, trickPipelineActive: i = !1, forceTrickHandEndDrain: a, heroCards: o = D_, enrolledIds: s = E_, declinedIds: c = E_, actionOrder: u }) {
	let d = e.participantIds.join(","), f = (e.drawCompletedIds ?? []).join(","), p = s.join(","), g = c.join(","), _ = (u ?? e.participantIds).join(","), v = e.trumpUpcard ? `${e.trumpUpcard.rank}-${e.trumpUpcard.suit}` : "", y = (0, l.useMemo)(() => hh({
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
		v,
		d,
		f,
		t,
		n,
		r,
		p,
		g,
		_
	]), b = T_(e.sessionId, e.handNumber), x = y.phase ?? null, S = (0, l.useRef)(null), [C, w] = (0, l.useReducer)(Fh, y, _h), T = (0, l.useRef)([]), E = (0, l.useRef)([]), D = (0, l.useRef)(null), O = (0, l.useRef)(C);
	O.current = C;
	let k = () => {
		for (let e of T.current) window.clearTimeout(e);
		T.current = [], D.current = null;
	}, A = (e, t) => {
		let n = window.setTimeout(e, t);
		T.current.push(n);
	};
	(0, l.useEffect)(() => () => k(), []), (0, l.useEffect)(() => {
		if (!b) {
			m() && h("useHandPresentation", "serverUpdate-skip-invalid", {
				sessionId: e.sessionId ?? null,
				handNumber: e.handNumber
			});
			return;
		}
		let t = S.current, n = o.map((e) => `${e.rank}-${e.suit}`), r = O_(E.current, n);
		E.current = n, w({
			type: "serverUpdate",
			snapshot: y,
			heroDrawDiscardCount: r.discardCount,
			heroDrawReplaceCount: r.replaceCount
		}), m() && h("handPresentation", "serverUpdate", {
			presentationKey: b,
			phase: `${t ?? "null"} -> ${x ?? "null"}`,
			handNumber: y.handNumber,
			serverPhase: y.phase,
			drawCompleted: y.drawCompletedIds.length,
			participantCount: y.participantIds.length,
			trumpUpcard: !!y.trumpUpcard,
			turnPlayerId: y.turnPlayerId
		}), S.current = x;
	}, [
		b,
		x,
		y,
		o,
		e.sessionId,
		e.handNumber
	]), (0, l.useEffect)(() => {
		if (!Object.values(C.enrollmentPulse).some(Boolean)) return;
		let e = window.setTimeout(() => w({ type: "clearEnrollmentPulse" }), 480);
		return () => window.clearTimeout(e);
	}, [JSON.stringify(C.enrollmentPulse)]), (0, l.useEffect)(() => {
		let e = iu(), t = `${C.handNumber}:${C.phase}:${C.animatingDrawPlayerId ?? ""}:${C.drawAnimSubPhase}:${C.phaseStartedAt}`;
		if (D.current === t) {
			m() && h("useHandPresentation", "advancePhase-timer-skip-duplicate", { phaseKey: t });
			return;
		}
		k();
		let n = Bh(C, e);
		if (n <= 0) return;
		let r = {
			handNumber: C.handNumber,
			phase: C.phase,
			animatingDrawPlayerId: C.animatingDrawPlayerId,
			drawAnimSubPhase: C.drawAnimSubPhase,
			phaseStartedAt: C.phaseStartedAt
		};
		D.current = t, m() && h("useHandPresentation", "advancePhase-timer-armed", {
			phaseKey: t,
			delay: n,
			fromPhase: C.phase,
			drawAnimSubPhase: C.drawAnimSubPhase
		}), A(() => {
			if (D.current !== t) return;
			D.current = null;
			let e = O.current;
			if (e.handNumber !== r.handNumber || e.phase !== r.phase || e.animatingDrawPlayerId !== r.animatingDrawPlayerId || e.drawAnimSubPhase !== r.drawAnimSubPhase || e.phaseStartedAt !== r.phaseStartedAt) {
				m() && h("useHandPresentation", "advancePhase-timer-stale", {
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
			m() && h("useHandPresentation", "advancePhase-timer", {
				fromPhase: r.phase,
				delay: n,
				animatingDrawPlayerId: r.animatingDrawPlayerId,
				drawAnimSubPhase: r.drawAnimSubPhase
			}), w({ type: "advancePhase" });
		}, n), A(() => w({ type: "watchdog" }), C.phase === "drawPlayer" || C.phase === "drawReady" ? Mm : jm);
	}, [
		C.handNumber,
		C.phase,
		C.animatingDrawPlayerId,
		C.drawAnimSubPhase,
		C.phaseStartedAt
	]), (0, l.useEffect)(() => {
		if (e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play") {
			let e = o.length;
			e > 0 && w({
				type: "dealCardRevealed",
				count: e
			});
		}
	}, [o.length, e.phase]), (0, l.useEffect)(() => {
		i || w({ type: "tryBeginHandSettle" });
	}, [i]), (0, l.useEffect)(() => {
		if (C.phase !== "play" || !C.pendingHandSettle) return;
		if (!i) {
			w({ type: "tryBeginHandSettle" });
			return;
		}
		let e = window.setTimeout(() => {
			let e = O.current;
			e.phase !== "play" || !e.pendingHandSettle || (m() && h("useHandPresentation", "hand-end-convergence-force", { trickPipelineActive: !0 }), a?.(), w({ type: "tryBeginHandSettle" }));
		}, Nm);
		return () => window.clearTimeout(e);
	}, [
		C.phase,
		C.pendingHandSettle,
		i,
		a
	]);
	let j = (0, l.useCallback)(() => {
		w({ type: "completeTrumpMerge" });
	}, []), M = (0, l.useCallback)((e) => {
		w({
			type: "anteCoinLanded",
			playerId: e
		});
	}, []), N = (0, l.useCallback)(() => {
		w({ type: "anteSequenceComplete" }), w({ type: "advancePhase" });
	}, []);
	return {
		...Rh(C),
		completeTrumpMerge: j,
		reportAnteCoinLanded: M,
		completeAnteSequence: N
	};
}
//#endregion
//#region src/table/botThinkWindow.ts
var A_ = null, j_ = /* @__PURE__ */ new Set();
function M_(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
function N_(e) {
	A_ = e;
	for (let e of j_) e();
}
function P_() {
	return A_;
}
function F_(e) {
	return j_.add(e), () => j_.delete(e);
}
function I_(e, t) {
	if (t <= 0) return "red";
	let n = e / t;
	return n > 2 / 3 ? "green" : n > 1 / 3 ? "yellow" : "red";
}
function L_(e, t, n, r) {
	if (n <= 0) return null;
	let i = Math.max(0, r - t), a = Math.max(0, n - i);
	return {
		playerId: e,
		remainingMs: a,
		progress: a / n,
		segment: I_(a, n)
	};
}
//#endregion
//#region src/table/turnCountdown.ts
var R_ = 15e3, z_ = new Set([
	$.ENROLLMENT,
	$.DRAW,
	$.PLAY
]);
function B_(e) {
	return e > 1e4 ? "green" : e > 5e3 ? "yellow" : "red";
}
function V_(e) {
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
function H_(e) {
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
function U_(e) {
	if (e.handComplete || e.suppressTurn) return null;
	let t = Wg({
		session: H_(e),
		suppressTurn: e.suppressTurn
	});
	return z_.has(t.phase) ? t.turnPlayerId : null;
}
function W_(e, t, n) {
	let r = R_ - Math.max(0, n - t) % R_;
	return {
		playerId: e,
		remainingMs: r,
		progress: r / R_,
		segment: B_(r)
	};
}
//#endregion
//#region src/table/hooks/useTurnCountdown.ts
function G_(e) {
	let t = U_(e), n = V_({
		...e,
		activeActorId: t
	}), r = (0, l.useRef)(null), i = (0, l.useRef)(""), [a, o] = (0, l.useState)(() => Date.now()), [, s] = (0, l.useState)(0);
	(0, l.useEffect)(() => F_(() => s((e) => e + 1)), []);
	let c = M_(t) && e.session.phase === "play" && !e.handComplete && !e.suppressTurn ? P_() : null, u = c != null && c.playerId === t;
	(0, l.useEffect)(() => {
		if (!t || u) {
			u || (r.current = null, i.current = n);
			return;
		}
		(n !== i.current || r.current == null) && (r.current = Date.now(), i.current = n, o(Date.now()));
	}, [
		t,
		n,
		u
	]), (0, l.useEffect)(() => {
		if (!t || !u && r.current == null) return;
		let e = () => o(Date.now()), n = iu() ? 250 : 100, i = window.setInterval(e, n);
		return () => window.clearInterval(i);
	}, [
		t,
		n,
		u,
		c?.turnKey
	]);
	let d = null;
	return t && (u && c ? d = L_(c.playerId, c.startedAtMs, c.totalMs, a) : !u && r.current != null && (d = W_(t, r.current, a))), {
		countdown: d,
		reducedMotion: iu()
	};
}
//#endregion
//#region src/table/feedback/turnTimerAudio.ts
var K_ = .48, q_ = 90, J_ = null, Y_ = null;
function X_() {
	return J_ ||= new lu.Howl({
		src: [`/sounds/${hu.timer}`],
		loop: !0,
		volume: K_,
		preload: !0
	}), J_;
}
function Z_() {
	return Y_ != null;
}
function Q_(e, t = {}) {
	if (Y_ == null) return;
	let n = J_, r = Y_;
	if (Y_ = null, !n) return;
	let i = t.fadeMs ?? q_;
	if (i > 0 && e !== "overlap") {
		n.fade(K_, 0, i, r), window.setTimeout(() => {
			n.stop(r);
		}, i + 20);
		return;
	}
	n.stop(r);
}
function $_(e) {
	if (!Iu(Pu().soundMode, "turnTimer")) return !1;
	Y_ != null && Q_("overlap", { fadeMs: 0 }), md("turn-timer-warning"), Xu.get().unlock();
	let t = X_().play();
	return typeof t == "number" ? (Y_ = t, e.turnKey, e.turnKey, e.actorId, e.ringStartedAtMs, e.elapsedMs, !0) : !1;
}
//#endregion
//#region src/table/turnTimerWarning.ts
var ev = 15e3;
function tv(e, t) {
	let n = Math.max(0, t - e);
	return Math.max(0, ev - n);
}
function nv(e, t) {
	return Math.max(0, t - e);
}
function rv(e, t) {
	return !t && e >= 15e3;
}
//#endregion
//#region src/table/hooks/useTurnTimerWarning.ts
function iv({ currentUserId: e = null, localActionPending: t = !1, ...n }) {
	let r = U_(n), i = V_({
		...n,
		activeActorId: r
	}), a = (0, l.useRef)(null), o = (0, l.useRef)(""), s = (0, l.useRef)(!1), c = (0, l.useRef)(null), u = () => {
		c.current != null && (window.clearTimeout(c.current), c.current = null);
	};
	(0, l.useEffect)(() => {
		if (!r) {
			u(), Z_() && Q_("turnChange"), s.current = !1, a.current = null, o.current = i;
			return;
		}
		if (i !== o.current || a.current == null) {
			u(), Z_() && Q_("turnChange"), s.current = !1, a.current = Date.now(), o.current = i;
			let e = a.current, t = i, n = tv(e, Date.now()), l = () => {
				if (o.current !== t || s.current) return;
				let n = nv(e, Date.now());
				rv(n, s.current) && (s.current = !0, $_({
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
		u(), Z_() && Q_("cleanup"), s.current = !1;
	}, []), (0, l.useEffect)(() => {
		!t || !Z_() || r == null || e == null || r !== e || (Q_("playerAction"), s.current = !1, u());
	}, [
		t,
		r,
		e
	]);
}
//#endregion
//#region src/table/hooks/useTableMicrointeractions.ts
function av(e) {
	let [t, n] = (0, l.useState)(Ac), r = (0, l.useRef)(null), i = (0, l.useRef)([]), a = () => {
		for (let e of i.current) window.clearTimeout(e);
		i.current = [];
	}, o = (e, t) => {
		let n = window.setTimeout(e, t);
		i.current.push(n);
	};
	(0, l.useEffect)(() => () => a(), []);
	let s = JSON.stringify(e.tricksByPlayer), c = JSON.stringify(e.bankrollByPlayer), u = JSON.stringify(e.bourrePlayerIds);
	return (0, l.useEffect)(() => {
		let t = Mc(r.current, e);
		if (r.current = jc(e), !(!t.turnHandoffPlayerId && !t.dealerMovedPlayerId && !t.potTick && Object.keys(t.trickBadgeIncrements).length === 0 && Object.keys(t.bankrollChanges).length === 0 && t.bourrePlayerIds.length === 0 && !t.trumpReminderPulse && !t.feedbackErrorPulse && !t.feedbackSuccessPulse && !t.winnerFlashPlayerId)) {
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
			}, kc.turnHandoff), t.dealerMovedPlayerId && o(() => {
				n((e) => e.dealerMovedPlayerId === t.dealerMovedPlayerId ? {
					...e,
					dealerMovedPlayerId: null
				} : e);
			}, kc.dealerMove), t.winnerFlashPlayerId && o(() => {
				n((e) => e.winnerFlashPlayerId === t.winnerFlashPlayerId ? {
					...e,
					winnerFlashPlayerId: null
				} : e);
			}, kc.winnerFlash);
			for (let [e, r] of Object.entries(t.bankrollChanges)) o(() => {
				n((t) => {
					if (t.bankrollTicks[e] !== r) return t;
					let n = { ...t.bankrollTicks };
					return delete n[e], {
						...t,
						bankrollTicks: n
					};
				});
			}, kc.bankrollTick);
			for (let e of t.bourrePlayerIds) o(() => {
				n((t) => t.bourreAlerts[e] === "pulse" ? {
					...t,
					bourreAlerts: {
						...t.bourreAlerts,
						[e]: "marker"
					}
				} : t);
			}, kc.bourrePulse), o(() => {
				n((t) => {
					if (!t.bourreAlerts[e]) return t;
					let n = { ...t.bourreAlerts };
					return delete n[e], {
						...t,
						bourreAlerts: n
					};
				});
			}, kc.bourreMarker);
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
function ov({ active: e, displayName: t }) {
	let [n, r] = (0, l.useState)(!1), i = iu();
	return (0, l.useEffect)(() => {
		if (!e) {
			r(!1);
			return;
		}
		r(!0);
		let t = i ? 900 : 1400, n = window.setTimeout(() => r(!1), t);
		return () => window.clearTimeout(n);
	}, [e, i]), n ? /* @__PURE__ */ (0, x.jsxs)("div", {
		className: ["bbourre-sting", i ? "bbourre-sting--reduced" : ""].filter(Boolean).join(" "),
		"data-testid": "bourre-result-sting",
		role: "status",
		"aria-live": "polite",
		"aria-label": t ? `${t} went bourré` : "Bourré",
		children: [/* @__PURE__ */ (0, x.jsx)("div", {
			className: "bbourre-sting__wash",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, x.jsxs)("div", {
			className: "bbourre-sting__badge",
			children: [/* @__PURE__ */ (0, x.jsx)("span", {
				className: "bbourre-sting__label",
				children: "Bourré"
			}), t ? /* @__PURE__ */ (0, x.jsx)("span", {
				className: "bbourre-sting__name muted small",
				children: t
			}) : null]
		})]
	}) : null;
}
//#endregion
//#region src/table/hooks/useYourTurnAttention.ts
var sv = R_, cv = [
	12e3,
	18e3,
	24e3
];
function lv(e) {
	let [t, n] = (0, l.useState)("hidden"), [r, i] = (0, l.useState)(0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(null), c = (0, l.useRef)(0), u = (0, l.useRef)(e.actionRequired);
	u.current = e.actionRequired;
	let d = () => {
		a.current != null && (window.clearTimeout(a.current), a.current = null), o.current != null && (window.clearTimeout(o.current), o.current = null), s.current != null && (window.clearTimeout(s.current), s.current = null);
	}, f = (0, l.useCallback)(() => {
		let e = c.current;
		if (e === 0) return;
		let t = cv[Math.min(e - 1, cv.length - 1)];
		a.current = window.setTimeout(() => {
			a.current = null, u.current && (i(e), n("pop"), c.current = e + 1);
		}, t);
	}, []);
	return (0, l.useEffect)(() => (d(), c.current = 0, e.actionRequired ? (a.current = window.setTimeout(() => {
		a.current = null, u.current && (i(0), n("pop"), c.current = 1);
	}, sv), d) : (n("hidden"), i(0), d)), [e.activityKey, e.actionRequired]), (0, l.useEffect)(() => {
		if (t !== "pop") return;
		let e = iu() ? 280 : 420;
		return o.current = window.setTimeout(() => {
			o.current = null, n("exit");
		}, 380 + e), () => {
			o.current != null && (window.clearTimeout(o.current), o.current = null);
		};
	}, [t, r]), (0, l.useEffect)(() => {
		if (t !== "exit") return;
		let e = iu() ? 240 : 620;
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
function uv() {
	return iu();
}
//#endregion
//#region src/table/YourTurnAttention.tsx
function dv({ actionRequired: e, activityKey: t }) {
	let { phase: n, beat: r } = lv({
		actionRequired: e,
		activityKey: t
	});
	if (n === "hidden") return null;
	let i = uv(), a = Math.min(r, 5);
	return /* @__PURE__ */ (0, x.jsx)("div", {
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
		children: /* @__PURE__ */ (0, x.jsx)("span", {
			className: "byour-turn__text",
			children: "Your Turn"
		})
	});
}
//#endregion
//#region src/table/TableSceneOverlay.tsx
function fv({ actionFeedback: e, feedbackErrorPulse: t = 0, feedbackSuccessPulse: n = 0, turnLabel: r = null, isMyTurn: i = !1, showTurn: a = !1 }) {
	let o = e && e.status !== "idle" && !(e.status === "loading" && !e.message?.trim()), s = a && !!r;
	return !o && !s ? null : /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [o && /* @__PURE__ */ (0, x.jsx)("div", {
		className: "btable-stage__overlay btable-stage__overlay--chrome",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, x.jsx)("div", {
			className: [
				`btable-stage__feedback btable-stage__feedback--${e.status}`,
				e.status === "error" ? "btable-stage__feedback--pulse-error" : "",
				e.status === "success" ? "btable-stage__feedback--pulse" : ""
			].filter(Boolean).join(" "),
			"data-testid": "feedback-banner",
			role: e.status === "error" ? "alert" : "status",
			children: e.message
		}, e.status === "error" ? `feedback-error-${t}` : e.status === "success" ? `feedback-success-${n}` : `feedback-${e.status}`)
	}), s && /* @__PURE__ */ (0, x.jsx)("div", {
		className: "btable-stage__overlay btable-stage__overlay--turn",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, x.jsx)("p", {
			className: ["btable-stage__turn", i ? "btable-stage__turn--yours" : "btable-stage__turn--waiting"].join(" "),
			"data-testid": "turn-indicator",
			children: r
		})
	})] });
}
//#endregion
//#region src/table/hooks/useTrumpTrickMotionGate.ts
var pv = 880;
function mv(e, t, n) {
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
		}, pv);
		return () => window.clearTimeout(n);
	}, [e, t]), (0, l.useEffect)(() => {
		if (!i || t || n === 0) return;
		let e = window.setTimeout(() => {
			a(!1), r.current = !1;
		}, pv);
		return () => window.clearTimeout(e);
	}, [
		i,
		t,
		n
	]), i;
}
//#endregion
//#region src/table/trickPresentationMachine.ts
function hv(e, t) {
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
		peakTrickPlays: $l(t),
		displayRevealFloor: 0,
		handEndEchoTrick: null
	};
}
function gv(e, t) {
	if (t.length < e.length) return !1;
	for (let n = 0; n < e.length; n++) if (Ks(e[n]) !== Ks(t[n])) return !1;
	return !0;
}
function _v(e, t, n) {
	let r = t.currentTrick?.trickNumber ?? null, i = e.prevTrick?.trickNumber ?? null, a = r != null && i != null && r !== i ? [] : [...e.peakTrickPlays ?? []];
	for (let t of [
		n,
		$l(e.prevTrick),
		e.peakTrickPlays ?? []
	]) t.length > a.length && gv(a, t) && (a = t);
	return a;
}
function vv(e, t) {
	return e.phase === "live" ? e : {
		...e,
		pendingServer: t
	};
}
function yv(e, t) {
	let n = $l(t.currentTrick);
	return {
		...e,
		phase: "live",
		frozenTrick: null,
		pendingResolution: null,
		pendingServer: null,
		resolvedTricks: null,
		showWinnerTag: !1,
		handEndEchoTrick: null,
		prevTrick: t.currentTrick,
		peakTrickPlays: n,
		revealedCount: n.length,
		displayRevealFloor: 0
	};
}
function bv(e) {
	return Math.max(e.pendingResolution?.frozen.plays.length ?? 0, $l(e.prevTrick).length, e.peakTrickPlays?.length ?? 0);
}
function xv(e, t) {
	let n = $l(t.currentTrick), r = $l(e.prevTrick), i = _v(e, t, n), a = e.phase === "live" && !e.pendingResolution && (n.length < e.revealedCount && r.length >= e.revealedCount || n.length < i.length && r.length >= i.length), o = t.currentTrick?.trickNumber ?? null, s = e.prevTrick?.trickNumber ?? null, c = o != null && s != null && o !== s;
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
function Sv(e, t, n, r) {
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
function Cv(e, t) {
	let n = wv(e, t);
	if (m()) {
		let r = $l(e.prevTrick).length, i = $l(n.prevTrick).length;
		(e.phase !== n.phase || e.revealedCount !== n.revealedCount || r !== i || !!e.pendingResolution != !!n.pendingResolution || t.type === "serverUpdate") && h("trickPresentation", t.type, {
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
function wv(e, t) {
	switch (t.type) {
		case "reset":
		case "reinit": return hv(t.type === "reinit" ? t.snapshot.tricksByPlayer : e.displayTricksByPlayer, t.type === "reinit" ? t.snapshot.currentTrick : null);
		case "revealNextCard": {
			if (e.phase !== "live") return e;
			let t = bv(e);
			if (e.revealedCount >= t) return e;
			let n = e.revealedCount + 1;
			return {
				...e,
				revealedCount: n,
				displayRevealFloor: Math.max(e.displayRevealFloor, n)
			};
		}
		case "revealThroughCount": {
			if (e.phase !== "live") return e;
			let n = Math.min(t.count, bv(e));
			return e.revealedCount >= n ? e : {
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
			return !t || e.phase !== "live" ? e : Sv({
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
			if (t.phase === "live" && t.pendingResolution && (t = Sv({
				...t,
				pendingResolution: null
			}, t.pendingResolution.frozen, t.pendingResolution.snapshot.tricksByPlayer, t.pendingResolution.snapshot.currentTrick)), t.phase === "live" && !t.pendingResolution) return t;
			let n = t.pendingServer, r = n?.tricksByPlayer ?? {}, i = Object.values(r).some((e) => (e ?? 0) > 0), a = i ? { ...r } : { ...t.displayTricksByPlayer }, o = $l(n?.currentTrick).length, s = n != null && n.currentTrick == null && t.frozenTrick != null;
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
				peakTrickPlays: $l(n?.currentTrick),
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
				let t = e.pendingServer, n = $l(t?.currentTrick).length, r = t != null && t.currentTrick == null && e.frozenTrick != null;
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
					peakTrickPlays: $l(t?.currentTrick),
					displayRevealFloor: n
				};
			}
			default: return e;
		}
		case "serverUpdate": {
			let { snapshot: n, participantIds: r } = t, i = n.currentTrick?.trickNumber ?? 0;
			if (e.pendingResolution) return i > e.pendingResolution.frozen.trickNumber ? xv(yv(e, n), n) : {
				...e,
				pendingResolution: {
					frozen: e.pendingResolution.frozen,
					snapshot: n
				}
			};
			if (e.phase !== "live" && e.frozenTrick && i > e.frozenTrick.trickNumber) return xv(yv(e, n), n);
			if (e.phase !== "live") return vv(e, n);
			let a = ru({
				prevTricks: e.prevTricks,
				nextTricks: n.tricksByPlayer,
				participantIds: r,
				prevTrick: e.prevTrick,
				playedCards: n.playedCards
			});
			return a ? {
				...e,
				pendingResolution: {
					frozen: a,
					snapshot: n
				}
			} : xv(e, n);
		}
		default: return e;
	}
}
function Tv(e, t) {
	let n = e.pendingResolution?.frozen.plays ?? [];
	if (n.length > 0) return n;
	let r = $l(e.prevTrick), i = e.peakTrickPlays ?? [];
	return e.phase === "live" ? i.length > t.length ? i : r.length > t.length ? r : t.length > 0 ? t : r : t.length > 0 ? t : r.length > 0 ? r : i;
}
function Ev(e, t) {
	let n = Tv(e, $l(t)), r = e.displayRevealFloor, i = n.length >= r ? n : (e.peakTrickPlays?.length ?? 0) >= r ? e.peakTrickPlays : n, a = e.phase === "live" ? Math.min(e.revealedCount, i.length) : i.length, o = e.phase === "live" ? Math.max(a, r) : a, s = e.phase === "live" ? i.slice(0, o) : e.frozenTrick?.plays ?? [], c = e.frozenTrick ?? e.handEndEchoTrick, l = c?.plays ?? [], u = c?.winnerId ?? null, d = e.frozenTrick == null ? e.handEndEchoTrick == null ? e.phase : "winnerReveal" : e.phase, f = l.length > 0 && s.length === 0 && (e.phase !== "live" || e.handEndEchoTrick != null), p = e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null, m = e.showWinnerTag && (e.phase === "winnerReveal" || e.phase === "collectTrick"), h = e.peakTrickPlays?.length ?? 0, g = e.phase === "live" ? bv(e) : e.revealedCount;
	return {
		phase: e.phase,
		displayPlays: s,
		winnerPlayerId: p,
		showWinnerTag: m,
		displayTricksByPlayer: e.displayTricksByPlayer,
		suppressTurnPlayerId: Jl(e.phase),
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
function Dv(e) {
	if (e.enteredPlay) return !0;
	let t = e.handComplete || e.phase == null && e.participantCount === 0 || e.handEndEchoTrick != null;
	return !e.sessionPlayActive && !e.pipelineActive && !t;
}
//#endregion
//#region src/table/hooks/useTrickPresentation.ts
function Ov({ phase: e, handNumber: t = 0, currentTrick: n, tricksByPlayer: r, participantIds: i, trumpSuit: a, playedCards: o, turnPlayerId: s, handComplete: c = !1, currentUserId: u = null }) {
	let [d, f] = (0, l.useReducer)(Cv, r, (e) => hv(e, n)), p = (0, l.useRef)([]), g = (0, l.useRef)(null), _ = (0, l.useRef)(/* @__PURE__ */ new Set()), v = (0, l.useRef)(!1), y = (0, l.useRef)(null), b = (0, l.useRef)(0), x = (0, l.useRef)(!1), S = (0, l.useRef)(t), C = (0, l.useRef)(0), w = (0, l.useRef)(If(t, 0)), T = (0, l.useRef)(null), E = (0, l.useRef)(!1), D = (0, l.useRef)(d);
	D.current = d;
	let O = d.phase !== "live" || !!d.pendingResolution;
	v.current = O;
	let k = e === "play", A = (e) => {
		for (let t of e) {
			let e = Ks(t);
			_.current.has(e) || (_.current.add(e), rc(t.playerId, e));
		}
	}, j = () => {
		for (let e of p.current) window.clearTimeout(e);
		p.current = [];
	}, M = (e, t) => {
		let n = w.current, r = window.setTimeout(() => {
			w.current === n && e();
		}, t);
		p.current.push(r);
	};
	(0, l.useEffect)(() => () => j(), []);
	let N = (0, l.useCallback)((e, t) => {
		let i = S.current, a = C.current, s = Lf(n), c = If(e, s);
		S.current = e, C.current = s, w.current = c, bp(c), ep(), j(), g.current = null, _.current.clear(), E.current = !1, T.current = null, uc(), f({
			type: "reinit",
			snapshot: {
				currentTrick: n,
				tricksByPlayer: r,
				playedCards: o
			}
		}), m() && h("useTrickPresentation", "reinit-presentation-scope", {
			reason: t,
			fromHand: i,
			toHand: e,
			fromTrick: a,
			toTrick: s,
			scope: c,
			hadPendingResolution: !!D.current.pendingResolution,
			phase: D.current.phase
		});
	}, [
		n,
		r,
		o
	]);
	(0, l.useEffect)(() => {
		let l = k && !x.current;
		x.current = k;
		let u = Lf(n);
		if (zf({
			handNumber: t,
			prevHandNumber: S.current,
			serverTrickNumber: u,
			prevServerTrickNumber: C.current,
			store: D.current
		})) {
			N(t, t === S.current ? "trick" : "hand");
			return;
		}
		if (C.current = u, w.current = If(t, u), bp(w.current), Dv({
			enteredPlay: l,
			sessionPlayActive: k,
			pipelineActive: v.current,
			handComplete: c,
			phase: e,
			participantCount: i.length,
			handEndEchoTrick: D.current.handEndEchoTrick
		})) {
			j(), g.current = null, _.current.clear(), E.current = !1, T.current = null, uc(), f({
				type: "reinit",
				snapshot: {
					currentTrick: n,
					tricksByPlayer: r,
					playedCards: o
				}
			}), m() && h("useTrickPresentation", l ? "reinit-play-entry" : "reinit-idle", {
				trickNumber: n?.trickNumber,
				trickPlays: n?.plays?.length ?? 0
			});
			return;
		}
		f({
			type: "serverUpdate",
			snapshot: {
				currentTrick: n,
				tricksByPlayer: r,
				playedCards: o
			},
			participantIds: i,
			trumpSuit: a,
			reducedMotion: iu()
		}), m() && h("useTrickPresentation", "serverUpdate-effect", {
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
		k,
		c,
		t,
		i.length,
		N
	]), (0, l.useLayoutEffect)(() => {
		if (!k && !O) {
			T.current = null, E.current = !1;
			return;
		}
		k && !E.current && (ec(i, { force: !0 }), E.current = !0), s && s !== T.current && ($s(s), T.current = s);
		let e = n?.plays ?? [];
		e.length > 0 && A(e);
		let t = d.pendingResolution?.frozen.plays ?? [];
		t.length > 0 && A(t);
	}, [
		k,
		O,
		i,
		s,
		n?.plays,
		d.pendingResolution?.frozen.plays
	]), (0, l.useLayoutEffect)(() => {
		let e = Sc();
		if (!e || !u || !k || d.phase !== "live" || !e.playKey.startsWith(`${u}:`)) return;
		let t = $l(n), r = d.peakTrickPlays ?? [], i = (r.length >= t.length && r.length > 0 ? r : t).findIndex((t) => Ks(t) === e.playKey);
		if (i < 0) return;
		bc(i);
		let a = i + 1;
		d.revealedCount >= a || (y.current != null && (window.clearTimeout(y.current), y.current = null), f({
			type: "revealThroughCount",
			count: a
		}), m() && h("useTrickPresentation", "hero-play-immediate-reveal", {
			playKey: e.playKey,
			trickIndex: i,
			revealThrough: a
		}));
	}, [
		k,
		d.phase,
		d.revealedCount,
		d.peakTrickPlays,
		n?.plays,
		n?.trickNumber,
		t,
		u
	]), (0, l.useEffect)(() => {
		if (!k && !O || d.phase !== "trickComplete" || !d.frozenTrick) return;
		let e = `${d.frozenTrick.trickNumber}:${d.frozenTrick.winnerId}:${d.frozenTrick.plays.length}`;
		if (g.current === e) return;
		g.current = e, j();
		let t = d.frozenTrick, n = Xl({
			trumpBeat: nu(t.plays, t.leadSuit, a),
			reducedMotion: iu()
		});
		M(() => f({ type: "advancePhase" }), n.readBeforeWinnerMs), M(() => f({ type: "advancePhase" }), n.readTotalMs), M(() => f({ type: "advancePhase" }), n.readTotalMs + n.sweepMs), M(() => f({ type: "advancePhase" }), n.pipelineMs);
	}, [
		k,
		O,
		d.phase,
		d.frozenTrick,
		a
	]), (0, l.useEffect)(() => {
		if (!k && !O || d.phase !== "live" || !d.pendingResolution) return;
		let e = d.pendingResolution.frozen.plays.length;
		if (d.revealedCount < e) return;
		let t = iu() ? 308 : 560, n = w.current, r = window.setTimeout(() => {
			w.current === n && f({ type: "commitTrickResolution" });
		}, t);
		return () => window.clearTimeout(r);
	}, [
		k,
		O,
		d.phase,
		d.pendingResolution,
		d.revealedCount
	]), (0, l.useEffect)(() => {
		d.phase === "live" && (g.current = null);
	}, [d.phase]), (0, l.useEffect)(() => {
		let r = c || e == null && i.length === 0;
		if (!O || !r || k && !c) return;
		let a = iu() ? Math.max(3e3, Math.round(ql * .55)) : ql;
		m() && h("useTrickPresentation", "hand-end-drain-watchdog-armed", {
			phase: d.phase,
			pendingResolution: !!d.pendingResolution,
			revealedCount: d.revealedCount,
			watchdogMs: a
		});
		let o = window.setTimeout(() => {
			if (w.current !== If(t, Lf(n))) return;
			let e = D.current;
			e.phase === "live" && !e.pendingResolution || (m() && h("useTrickPresentation", "hand-end-drain-force", {
				phase: e.phase,
				pendingResolution: !!e.pendingResolution
			}), f({ type: "forceHandEndDrain" }));
		}, a);
		return () => window.clearTimeout(o);
	}, [
		k,
		O,
		d.phase,
		d.pendingResolution,
		d.revealedCount,
		c,
		e,
		i.length
	]);
	let ee = d.phase === "live" ? Math.max(d.pendingResolution?.frozen.plays.length ?? 0, n?.plays?.length ?? 0, d.peakTrickPlays?.length ?? 0) : d.revealedCount;
	b.current = ee;
	let P = () => {
		y.current != null && (window.clearTimeout(y.current), y.current = null);
	}, F = () => {
		if (!k && !v.current || d.phase !== "live") {
			P();
			return;
		}
		if (d.revealedCount >= b.current) {
			P();
			return;
		}
		if (y.current != null) return;
		let e = iu() ? 369 : 670;
		y.current = window.setTimeout(() => {
			y.current = null, w.current === If(t, Lf(n)) && (m() && h("useTrickPresentation", "revealNextCard-timer", {
				revealedCount: d.revealedCount,
				targetReveal: b.current
			}), f({ type: "revealNextCard" }));
		}, e);
	};
	(0, l.useEffect)(() => (F(), P), [
		k,
		O,
		d.phase,
		d.revealedCount
	]), (0, l.useEffect)(() => {
		F();
	}, [ee]), (0, l.useEffect)(() => {
		!k && !O || d.phase !== "live" || d.pendingResolution || d.revealedCount <= ee || f({
			type: "clampRevealedCount",
			target: ee
		});
	}, [
		k,
		O,
		d.phase,
		d.pendingResolution,
		ee,
		d.revealedCount
	]);
	let I = Ev(d, n), te = (0, l.useCallback)(() => f({ type: "forceHandEndDrain" }), []), ne = (0, l.useCallback)(() => f({ type: "clearHandEndEcho" }), []);
	return {
		...I,
		forceHandEndDrain: te,
		clearHandEndEcho: ne
	};
}
//#endregion
//#region src/table/matchKey.ts
function kv(e) {
	if (e.serverActionSeq == null) throw Error("Missing authoritative serverActionSeq");
	return `${e.sessionId}-h${e.handNumber}-t${e.trickNumber ?? 0}-turn${e.turnIndex ?? 0}-aseq${e.serverActionSeq}`;
}
function Av(e, t) {
	if (!t) return 0;
	let n = e.indexOf(t);
	return n >= 0 ? n : 0;
}
function jv(e) {
	let t = e.actionOrder && e.actionOrder.length > 0 ? e.actionOrder : e.participantIds ?? [];
	return {
		sessionId: e.sessionId,
		handNumber: e.handNumber,
		trickNumber: e.trickNumber ?? 0,
		turnIndex: Av(t, e.turnPlayerId ?? null),
		serverActionSeq: e.serverActionSeq,
		turnPlayerId: e.turnPlayerId ?? null
	};
}
function Mv(e) {
	return e.phase === "live" && e.serverTrickPlays > 0 && e.revealedCount < e.revealTarget;
}
function Nv(e) {
	let t = !!(e.turnPlayerId && e.heroId && e.turnPlayerId === e.heroId), n = !!(e.turnPlayerId && e.botIds.has(e.turnPlayerId)), r = e.presentation.matchKey === e.matchKey && (e.presentation.pipelineActive || e.presentation.motionGateActive || e.presentation.revealCatchUp || e.presentation.handPresenting);
	return {
		isHeroTurn: t,
		isBotTurn: n,
		visualCatchUpBusy: r,
		canHeroAct: t && !r,
		needsBotDriver: n && !r
	};
}
function Pv(e) {
	let t = /* @__PURE__ */ new Set();
	for (let n of e) M_(n) && t.add(n);
	return t;
}
function Fv(e) {
	if (e.isHeroTurn && e.isBotTurn) {
		let t = "Invariant violation: hero and bot cannot both own the turn";
		throw m() && h("matchKey", "invariant-violation", {
			message: t,
			input: e
		}), Error(t);
	}
	if (e.canHeroAct && e.needsBotDriver) {
		let t = "Invariant violation: hero and bot cannot both be active";
		throw m() && h("matchKey", "invariant-violation", {
			message: t,
			input: e
		}), Error(t);
	}
	e.presentation.matchKey !== e.matchKey && (e.presentation.pipelineActive || e.presentation.motionGateActive || e.presentation.revealCatchUp || e.presentation.handPresenting) && m() && h("matchKey", "stale-presentation-busy", {
		authoritative: e.matchKey,
		presentation: e.presentation.matchKey
	});
	let t = e.drawCompleted ?? 0, n = e.drawTotal ?? 0;
	if (n > 0 && t > n) {
		let r = `Invariant violation: drawCompleted (${t}) > drawTotal (${n})`;
		throw m() && h("matchKey", "invariant-violation", {
			message: r,
			input: e
		}), Error(r);
	}
}
//#endregion
//#region src/table/matchKeyLifecycle.ts
function Iv(e) {
	let t = Sp();
	t.matchKey === e && yp({
		...t,
		pipelineActive: !1,
		revealCatchUp: !1,
		motionGateActive: !1,
		handPresenting: !1,
		handPresentationPhase: "idle",
		peakPlayCount: t.displayedPlayCount,
		dealPresentationActive: !1,
		trickCollectionActive: !1
	});
}
function Lv(e) {
	N_(null);
}
function Rv(e) {
	Sp().matchKey === e && (ep(), wc());
}
//#endregion
//#region src/table/settlementCopy.ts
function zv(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function Bv(e, t) {
	return e.map((e) => zv(e, t)).join(" & ");
}
function Vv(e, t) {
	return Al(e, t) ? t.filter((t) => (e[t] ?? 0) === 0) : [];
}
function Hv(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: a = {} } = e, o = Nl(t, n), s = e.winnerIds?.length ? e.winnerIds : o.winnerIds, c = e.maxTricks ?? o.maxTricks, l = Bv(s, r), u = Vv(t, n), d = Bv(u, r), f = Pl(i.maxWinThisHand), p = Pl(i.currentPot), m = i.carryIn > 0 ? Pl(i.carryIn) : null, h = `Pot this hand: ${p} (max win ${f})`;
	m && (h += ` — includes ${m} carried in`), i.limEnabled && i.overflow > 0 && (h += ` · LIM overflow ${Pl(i.overflow)} stays out of play`);
	let g = s.map((e) => {
		let n = t[e] ?? 0;
		return `${zv(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), _ = u.length > 0 ? `Bourré: ${d} took 0 tricks — each pays ${f} at settlement (seeds next deal)` : null, v = e.splitSharePerWinner, y = v > 0 && s.length >= 2 ? `If all co-winners agree to split: ${Pl(i.maxWinThisHand)} → ${Pl(v)} each` : null, b = s.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, x = `If any co-winner declines: full pot ${p} carries to the next hand · non-winners ante up`, S = s.map((e) => {
		let t = a[e], n = zv(e, r);
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
function Uv({ session: e, players: t, potMetrics: n, splitSharePerWinner: r, currentUserId: i, isCoWinner: a, manualContinueAllowed: o = !0, onSettle: s }) {
	let c = Hv({
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
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		className: "btable-session__settle",
		"data-testid": "settlement-panel",
		role: "region",
		"aria-label": "Co-winner settlement vote",
		children: [
			/* @__PURE__ */ (0, x.jsx)("h6", {
				className: "btable-session__settle-title",
				"data-testid": "settlement-headline",
				children: c.headline
			}),
			/* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-session__settle-sub",
				"data-testid": "settlement-subhead",
				children: c.subhead
			}),
			/* @__PURE__ */ (0, x.jsx)("ul", {
				className: "btable-session__settle-list",
				"data-testid": "settlement-winners",
				children: c.winnerLines.map((e) => /* @__PURE__ */ (0, x.jsx)("li", { children: e }, e))
			}),
			c.bourreLine && /* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-session__settle-bourre",
				"data-testid": "settlement-bourre",
				children: c.bourreLine
			}),
			/* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-session__settle-pot",
				"data-testid": "settlement-pot",
				children: c.potLine
			}),
			c.splitPreviewLine && /* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-session__split-preview",
				"data-testid": "settlement-split-preview",
				children: c.splitPreviewLine
			}),
			/* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-session__settle-carry muted small",
				"data-testid": "settlement-carry-push",
				children: c.carryoverIfPushLine
			}),
			c.carryoverIfSplitLine && /* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-session__settle-carry muted small",
				"data-testid": "settlement-carry-split",
				children: c.carryoverIfSplitLine
			}),
			/* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-session__settle-rules muted small",
				"data-testid": "settlement-rules",
				children: c.rulesLine
			}),
			/* @__PURE__ */ (0, x.jsx)("ul", {
				className: "btable-session__settle-votes",
				"data-testid": "settlement-votes",
				children: c.voteLines.map((e) => /* @__PURE__ */ (0, x.jsx)("li", { children: e }, e))
			}),
			c.voterHint && /* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-session__settle-hint",
				"data-testid": "settlement-voter-hint",
				children: c.voterHint
			}),
			c.observerHint && /* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-session__settle-hint muted small",
				"data-testid": "settlement-observer-hint",
				children: c.observerHint
			}),
			/* @__PURE__ */ (0, x.jsxs)("div", {
				className: "btable-session__settle-btns",
				children: [/* @__PURE__ */ (0, x.jsx)("button", {
					type: "button",
					className: "btn btn--sm",
					disabled: !a || !o,
					"data-testid": "settlement-decline-btn",
					onClick: () => s("push"),
					children: "Decline split · push pot"
				}), /* @__PURE__ */ (0, x.jsxs)("button", {
					type: "button",
					className: "btn btn--sm btn--primary",
					disabled: !a || !o,
					"data-testid": "settlement-agree-btn",
					onClick: () => s("split"),
					children: [
						"Agree to split · ",
						Pl(r),
						" each"
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/table/tieResultTiming.ts
var Wv = 3e3, Gv = 6e3;
function Kv(e = "") {
	let t = String(e).trim().length, n = Wv + Math.min(t * 35, Gv - Wv);
	return Math.max(Wv, Math.min(n, Gv));
}
//#endregion
//#region src/table/SplitPotDecisionToast.tsx
function qv(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function Jv({ session: e, players: t, splitSharePerWinner: n, currentUserId: r, isCoWinner: i, resultMessage: a = "", manualContinueAllowed: o = !0, onAgreeSplit: s, onDeclineSplit: c, onCarryover: u }) {
	let d = e.pendingCoWinSettlement?.winnerIds ?? [], f = e.pendingCoWinSettlement?.votes ?? {}, p = (0, l.useMemo)(() => Kv(a || "Tie — split the pot?"), [a]), [m, h] = (0, l.useState)(p), [g, _] = (0, l.useState)(!1), v = (0, l.useRef)(null), y = (0, l.useRef)(!1), b = (0, l.useMemo)(() => `${d.join(",")}:${e.handNumber ?? 0}`, [d, e.handNumber]);
	(0, l.useEffect)(() => {
		v.current = Date.now(), y.current = !1, h(p), _(!1);
	}, [b, p]);
	let S = d.length >= 2 && d.every((e) => f[e] === "split"), C = (0, l.useCallback)(() => {
		y.current || (y.current = !0, u());
	}, [u]);
	if ((0, l.useEffect)(() => {
		if (d.length < 2) return;
		let e = window.setInterval(() => {
			let e = v.current ?? Date.now(), t = Date.now() - e, n = Math.max(0, p - t);
			h(n), n <= 0 && !S && C();
		}, 100);
		return () => window.clearInterval(e);
	}, [
		d.length,
		S,
		C,
		b,
		p
	]), (0, l.useEffect)(() => {
		S && (y.current = !0);
	}, [S]), d.length < 2) return null;
	let w = Math.max(0, Math.ceil(m / 1e3)), T = d.map((e) => qv(e, t)).join(" & "), E = o && !y.current, D = (e) => {
		!i || !E || (_(e), e ? s() : c());
	};
	return /* @__PURE__ */ (0, x.jsxs)("div", {
		className: "btable-split-toast",
		"data-testid": "split-pot-toast",
		role: "dialog",
		"aria-label": "Split pot decision",
		"aria-live": "polite",
		children: [
			/* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-split-toast__title",
				children: "Tie — split the pot?"
			}),
			/* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-split-toast__names",
				children: T
			}),
			/* @__PURE__ */ (0, x.jsxs)("p", {
				className: "btable-split-toast__share muted small",
				children: [Pl(n), " each if all agree"]
			}),
			i ? /* @__PURE__ */ (0, x.jsxs)("label", {
				className: "btable-split-toast__choice",
				children: [/* @__PURE__ */ (0, x.jsx)("input", {
					type: "checkbox",
					checked: g || f[r ?? ""] === "split",
					disabled: !E,
					onChange: (e) => D(e.target.checked),
					"data-testid": "split-pot-agree"
				}), /* @__PURE__ */ (0, x.jsx)("span", { children: "Yes — split pot" })]
			}) : /* @__PURE__ */ (0, x.jsx)("p", {
				className: "btable-split-toast__wait muted small",
				children: "Waiting for tied leaders…"
			}),
			/* @__PURE__ */ (0, x.jsxs)("p", {
				className: "btable-split-toast__timer muted small",
				"data-testid": "split-pot-timer",
				children: [w, "s — carryover if not all agree"]
			})
		]
	});
}
//#endregion
//#region src/table/useCoWinResultVisibility.ts
function Yv(e, t, n) {
	let [r, i] = (0, l.useState)(!1), [a, o] = (0, l.useState)(!1), s = (0, l.useRef)(null), c = (0, l.useRef)(null), u = (0, l.useRef)(null), d = (0, l.useRef)(Kv(n)), f = () => {
		c.current != null && (window.clearTimeout(c.current), c.current = null);
	};
	return (0, l.useEffect)(() => {
		if (f(), u.current !== t && (u.current = t, s.current = null, i(!1), o(!1), d.current = Kv(n)), e) {
			if (s.current == null) {
				let e = Date.now();
				s.current = e, d.current = Kv(n), i(!0), o(!1), m() && h("tieResult", "shown", {
					proposalKey: t,
					durationMs: d.current,
					shownAt: e
				}), c.current = window.setTimeout(() => {
					o(!0), m() && h("tieResult", "manual-continue-allowed", {
						proposalKey: t,
						elapsedMs: Date.now() - e
					});
				}, d.current);
			}
			return f;
		}
		if (!r || s.current == null) return f;
		let a = Date.now() - s.current, l = d.current - a;
		return l <= 0 ? (m() && h("tieResult", "auto-hide", {
			proposalKey: t,
			elapsedMs: a,
			durationMs: d.current
		}), s.current = null, i(!1), o(!1), f) : (c.current = window.setTimeout(() => {
			m() && h("tieResult", "auto-hide", {
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
function Xv(e, t) {
	return t == null || e < t ? e : e + 1;
}
function Zv(e, t) {
	return t == null ? e : e === t ? null : e > t ? e - 1 : e;
}
function Qv(e, t) {
	return e.map((e) => Xv(e, t));
}
function $v(e, t) {
	return e.map((e) => Zv(e, t)).filter((e) => e != null).sort((e, t) => e - t);
}
function ey(e) {
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
var ty = [], ny = [], ry = [];
function iy({ session: e, players: t, potMetrics: n, mySessionNet: r, leaderLabel: i, showCoWinSettlement: a, splitPotEnabled: o = !1, rebuyEnabled: s = !1, splitSharePerWinner: c = 0, enrollmentActive: u = !1, currentUserId: d, heroCards: f = ny, rawHeroCards: p = ny, privateHandReady: g = !1, legalPlayIndices: _, recentBourreIds: v = ry, handComplete: y = !1, actionFeedback: b, actions: S }) {
	let { settings: C } = Ff(), w = qm(), [T, E] = (0, l.useState)(!1), D = e.participantIds.length, { events: O, dismissEvent: k, pushReaction: A } = x_({
		session: e,
		potMetrics: n,
		participantIds: e.participantIds
	}), j = (0, l.useMemo)(() => [...O].reverse().find((e) => e.kind === "big-pot") ?? null, [O]), M = d != null && (e.pendingCoWinSettlement?.winnerIds || []).includes(d), N = Ov({
		phase: e.phase,
		handNumber: e.handNumber,
		currentTrick: e.currentTrick,
		tricksByPlayer: e.tricksByPlayer,
		participantIds: e.participantIds,
		trumpSuit: e.trumpSuit,
		playedCards: e.playedCards,
		turnPlayerId: e.turnPlayerId,
		handComplete: y,
		currentUserId: d
	}), ee = N.forceHandEndDrain, P = k_({
		session: e,
		enrollmentActive: u,
		potAmount: n.currentPot,
		handComplete: y,
		trickPipelineActive: N.isPipelineActive,
		forceTrickHandEndDrain: ee,
		heroCards: f,
		enrolledIds: e.handEnrollment?.enrolledIds ?? ty,
		declinedIds: e.handEnrollment?.declinedIds ?? ty,
		actionOrder: e.actionOrder ?? e.handEnrollment?.orderedPlayerIds ?? e.participantIds
	}), F = P.phase === "settle" || P.phase === "nextHandReset" || P.phase === "ante";
	(0, l.useEffect)(() => {
		F && N.showFinalTrickEcho && N.clearHandEndEcho();
	}, [
		F,
		N.showFinalTrickEcho,
		N.clearHandEndEcho
	]);
	let I = (0, l.useMemo)(() => {
		let t = e.pendingCoWinSettlement?.winnerIds ?? [];
		return `${e.handNumber}:${t.join(",")}`;
	}, [e.handNumber, e.pendingCoWinSettlement?.winnerIds]), te = (0, l.useMemo)(() => {
		if (!a) return "";
		let r = Hv({
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
	]), { visible: ne, manualContinueAllowed: L } = Yv(a, I, te), R = mv(e.phase, e.trumpUpcard, N.displayPlays.length), z = mp(P.isPresenting, P.phase, e.phase), B = (0, l.useRef)("");
	(0, l.useEffect)(() => {
		let t = `${e.phase ?? ""}|${P.phase}|${z}`;
		if (t === B.current) return;
		let n = B.current.endsWith("|true");
		B.current = t, m() && h("tableSession", "presentation-gate", {
			serverPhase: e.phase,
			handPresentationPhase: P.phase,
			handPresenting: z,
			isPresenting: P.isPresenting,
			handPresentingBlockReason: hp(P.isPresenting, P.phase, e.phase),
			becameUnblocked: n && !z
		});
	}, [
		e.phase,
		P.phase,
		P.isPresenting,
		z
	]);
	let [re, ie] = (0, l.useState)(0);
	(0, l.useEffect)(() => $f(() => ie((e) => e + 1)), []);
	let V = (0, l.useMemo)(() => If(e.handNumber, Lf(e.currentTrick)), [e.handNumber, e.currentTrick?.trickNumber]), ae = (0, l.useMemo)(() => Pv(e.participantIds), [e.participantIds]), oe = (0, l.useMemo)(() => jv({
		sessionId: e.sessionId,
		handNumber: e.handNumber,
		trickNumber: e.currentTrick?.trickNumber,
		turnPlayerId: e.turnPlayerId,
		serverActionSeq: e.serverActionSeq,
		actionOrder: e.actionOrder ?? e.participantIds
	}), [
		e.sessionId,
		e.handNumber,
		e.currentTrick?.trickNumber,
		e.turnPlayerId,
		e.serverActionSeq,
		e.actionOrder,
		e.participantIds
	]), H = (0, l.useMemo)(() => {
		try {
			return kv(oe);
		} catch {
			return null;
		}
	}, [oe]), se = (0, l.useRef)(null);
	(0, l.useEffect)(() => {
		if (!H) return;
		let e = se.current;
		e && e !== H && (Iv(e), Lv(e), Rv(e), Dc(H), m() ? h("matchKey", "changed", {
			from: e,
			to: H
		}) : console.log(`[matchKey] changed -> ${H}`)), se.current = H, sp(H);
	}, [H]);
	let ce = e.currentTrick?.plays?.length ?? 0, le = Mv({
		phase: N.phase,
		revealedCount: N.revealedCount,
		revealTarget: N.revealTarget,
		serverTrickPlays: ce
	});
	(0, l.useEffect)(() => {
		yp({
			matchKey: H ?? "",
			presentationScopeKey: V,
			pipelineActive: N.isPipelineActive,
			revealCatchUp: le,
			motionGateActive: R,
			peakPlayCount: N.peakPlayCount,
			displayedPlayCount: N.displayPlays.length,
			handPresenting: z,
			handPresentationPhase: P.phase,
			dealPresentationActive: Xf(),
			trickCollectionActive: Qf()
		});
	}, [
		V,
		N.isPipelineActive,
		N.phase,
		N.revealedCount,
		N.revealTarget,
		N.peakPlayCount,
		N.displayPlays.length,
		R,
		z,
		P.phase,
		e.phase,
		re,
		H,
		le,
		ce
	]);
	let U = (0, l.useMemo)(() => ({
		matchKey: H ?? "",
		pipelineActive: N.isPipelineActive,
		motionGateActive: R,
		revealCatchUp: le,
		handPresenting: z
	}), [
		H,
		N.isPipelineActive,
		R,
		le,
		z
	]), ue = (0, l.useMemo)(() => H ? Nv({
		matchKey: H,
		turnPlayerId: e.turnPlayerId ?? null,
		heroId: d ?? null,
		botIds: ae,
		presentation: U,
		drawCompleted: e.drawCompletedIds?.length ?? 0,
		drawTotal: e.participantIds.length
	}) : null, [
		H,
		e.turnPlayerId,
		d,
		ae,
		U,
		e.drawCompletedIds,
		e.participantIds.length
	]);
	(0, l.useEffect)(() => {
		if (!(!ue || !H)) try {
			Fv({
				matchKey: H,
				turnPlayerId: e.turnPlayerId ?? null,
				heroId: d ?? null,
				botIds: ae,
				presentation: U,
				drawCompleted: e.drawCompletedIds?.length ?? 0,
				drawTotal: e.participantIds.length,
				...ue
			});
		} catch (e) {
			m() && h("matchKey", "invariant-throw", { message: e instanceof Error ? e.message : String(e) });
		}
	}, [
		ue,
		H,
		e.turnPlayerId,
		d,
		ae,
		U,
		e.drawCompletedIds,
		e.participantIds.length
	]);
	let W = ue?.visualCatchUpBusy ?? !1, de = ue?.canHeroAct ?? null, fe = (0, l.useMemo)(() => $g({
		trumpHolderId: e.trumpHolderId ?? e.dealerId,
		trumpUpcard: e.trumpUpcard ?? null,
		trumpSuit: e.trumpSuit ?? null,
		phase: e.phase ?? null,
		handPresentation: {
			trumpRevealActive: P.trumpRevealActive,
			trumpMergeActive: P.trumpMergeActive,
			trumpMergedIntoHand: P.trumpMergedIntoHand
		}
	}), [
		e.trumpHolderId,
		e.dealerId,
		e.trumpUpcard,
		e.trumpSuit,
		e.phase,
		P.trumpRevealActive,
		P.trumpMergeActive,
		P.trumpMergedIntoHand
	]), G = (0, l.useMemo)(() => ey({
		rawHeroCards: p,
		effectiveHeroCards: f,
		playerId: d,
		trumpHolderId: e.trumpHolderId ?? e.dealerId,
		trumpUpcard: e.trumpUpcard ?? null,
		trumpSuit: e.trumpSuit ?? null,
		phase: e.phase ?? null,
		handPresentation: {
			trumpRevealActive: P.trumpRevealActive,
			trumpMergeActive: P.trumpMergeActive,
			trumpMergedIntoHand: P.trumpMergedIntoHand
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
		P.trumpRevealActive,
		P.trumpMergeActive,
		P.trumpMergedIntoHand
	]), pe = G.displayCards, me = (0, l.useMemo)(() => !_?.length || G.indexMode === "effective" ? _ : Qv(_, G.trumpDisabledIndex), [
		_,
		G.indexMode,
		G.trumpDisabledIndex
	]), he = (0, l.useMemo)(() => {
		if (!_?.length || !f.length) return null;
		let t = hl(f.map(Ls), {
			trumpSuit: e.trumpSuit ?? "clubs",
			currentTrick: e.currentTrick ?? null,
			leadSuit: e.leadSuit ?? null,
			cinchEnabled: e.cinchEnabled === !0
		}, _);
		return t == null ? null : G.indexMode === "effective" ? t : Qv([t], G.trumpDisabledIndex)[0] ?? null;
	}, [
		_,
		f,
		e.trumpSuit,
		e.currentTrick,
		e.leadSuit,
		e.cinchEnabled,
		G.indexMode,
		G.trumpDisabledIndex
	]), ge = (0, l.useMemo)(() => {
		if (e.phase !== "draw" || !f.length) return [];
		let t = f.map(Ls), n = G.indexMode === "display" && G.trumpDisabledIndex != null ? $v([G.trumpDisabledIndex], G.trumpDisabledIndex) : G.trumpDisabledIndex == null ? [] : [G.trumpDisabledIndex], r = gl(t, e.trumpSuit ?? "clubs", e.maxDrawDiscards ?? 4, e.remainingDeckCount ?? Infinity, n);
		return G.indexMode === "effective" ? r : Qv(r, G.trumpDisabledIndex);
	}, [
		e.phase,
		f,
		e.trumpSuit,
		e.maxDrawDiscards,
		e.remainingDeckCount,
		G.indexMode,
		G.trumpDisabledIndex
	]), K = Jg({
		suppressTurn: !!(N.suppressTurnPlayerId || P.suppressTurnIndicator),
		session: e,
		currentUserId: d
	}), _e = Rs(e.phase, u), { countdown: ve } = G_({
		session: e,
		suppressTurn: !!K,
		handComplete: y
	}), ye = ve?.playerId ?? null, be = K ? null : Us(ye, t), xe = !!(be && !K && (u || e.phase === "draw" || e.phase === "play")), Se = t.find((e) => e.isSelf), Ce = d != null && e.participantIds.includes(d) && (e.phase === "draw" || e.phase === "play"), we = s && !e.isFinal && !Ce && !ne && Se?.isOut === !0 && !!S.onRebuy, Te = !K && !y && d != null && ye === d && (u ? !!(Se?.canToggleInHand || Se?.canPassEnrollment) : de ?? Zg({
		currentUserId: d,
		session: e,
		suppressTurn: !!K,
		handComplete: y,
		enrollmentActive: u,
		selfPlayer: Se
	})), Ee = Xg({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: Se,
		session: e,
		suppressTurn: !!K,
		handComplete: y
	}), De = Qg({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: Se,
		session: e,
		suppressTurn: !!K,
		handComplete: y
	});
	iv({
		session: e,
		suppressTurn: !!K,
		handComplete: y,
		currentUserId: d,
		localActionPending: b?.status === "loading"
	});
	let Oe = fe.showTrumpSuitReminder || !e.trumpUpcard && !!e.trumpSuit && e.phase === "play", ke = (0, l.useMemo)(() => ({ ...N.displayTricksByPlayer }), [N.displayTricksByPlayer]), Ae = (0, l.useMemo)(() => Object.fromEntries(t.map((e) => [e.playerId, Math.max(0, Number(e.bankroll) || 0)])), [t]), je = av({
		turnPlayerId: e.turnPlayerId ?? null,
		dealerId: e.dealerId,
		potAmount: P.displayPotAmount,
		tricksByPlayer: ke,
		bankrollByPlayer: Ae,
		bourrePlayerIds: v ?? [],
		phase: e.phase ?? null,
		showTrumpSuitReminder: Oe,
		suppressTurn: !!K,
		actionFeedbackStatus: b?.status ?? "idle",
		trickWinnerSeatId: N.trickWinnerSeatId,
		trickPhase: N.phase
	}), Me = !!Se?.playerId && (v ?? []).includes(Se.playerId) && je.bourreAlerts[Se.playerId] === "pulse", Ne = (0, l.useRef)(0), Pe = (0, l.useRef)(0);
	(0, l.useEffect)(() => {
		je.feedbackErrorPulse > Ne.current && pf(), Ne.current = je.feedbackErrorPulse;
	}, [je.feedbackErrorPulse]), (0, l.useEffect)(() => {
		je.feedbackSuccessPulse > Pe.current && yf(), Pe.current = je.feedbackSuccessPulse;
	}, [je.feedbackSuccessPulse]);
	let Fe = (0, l.useCallback)((e) => {
		A(e, d ?? void 0);
	}, [A, d]), Ie = (0, l.useMemo)(() => ({
		onToggleInHand: (e, n) => {
			t.find((t) => t.playerId === e)?.isSelf && S.onToggleInHand(n);
		},
		onPassEnrollment: (e) => {
			t.find((t) => t.playerId === e)?.isSelf && S.onPassEnrollment && S.onPassEnrollment();
		},
		onTrickDelta: (e, n) => {
			t.find((t) => t.playerId === e)?.isSelf && S.onTrickDelta(n);
		},
		onSubmitDraw: (e) => {
			if (!S.onSubmitDraw) return;
			let t = G.indexMode === "display" ? $v(e, G.trumpDisabledIndex) : e;
			return S.onSubmitDraw(t);
		},
		onPassDraw: S.onPassDraw,
		onFoldDraw: S.onFoldDraw,
		onPlayCard: (e) => {
			if (!S.onPlayCard) return;
			if (G.indexMode !== "display") return S.onPlayCard(e);
			let t = $v([e], G.trumpDisabledIndex)[0];
			if (t != null) return S.onPlayCard(t);
		},
		onReaction: Fe
	}), [
		S,
		Fe,
		t,
		G.indexMode,
		G.trumpDisabledIndex
	]), Le = {
		session: e,
		players: t,
		potMetrics: n,
		participantCount: D,
		enrollmentActive: u,
		heroCards: pe,
		revealedTrumpIndex: G.revealedTrumpIndex,
		trumpMergeActive: G.trumpMergeActive,
		trumpDisabledIndex: G.trumpDisabledIndex,
		hideCenterTrump: G.hideCenterTrumpForHolder,
		showTrumpSuitReminder: Oe,
		trumpHolderPresentation: fe,
		privateHandReady: g,
		currentUserId: d,
		legalPlayIndices: me,
		recommendedPlayIndex: he,
		recommendedDiscardIndices: ge,
		handComplete: y,
		actionFeedback: b,
		trickPresentation: N,
		handPresentation: P,
		microinteractions: je,
		instantTrickPlays: R,
		turnCountdown: ve,
		bigPotEvent: j,
		visualCatchUpBusy: W,
		heroCanAct: de,
		onDismissTableEvent: k,
		...Ie
	}, Re = /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: [
		/* @__PURE__ */ (0, x.jsx)("div", {
			className: "btable-session__attention-layer",
			"aria-live": "polite",
			children: /* @__PURE__ */ (0, x.jsx)(dv, {
				actionRequired: Ee,
				activityKey: De
			})
		}),
		/* @__PURE__ */ (0, x.jsx)(ov, {
			active: Me,
			displayName: Se?.displayName
		}),
		/* @__PURE__ */ (0, x.jsx)(h_, {
			events: O,
			onDismiss: k
		}),
		/* @__PURE__ */ (0, x.jsx)(f_, {
			events: O,
			onDismiss: k
		}),
		w ? /* @__PURE__ */ (0, x.jsx)(u_, { ...Le }) : /* @__PURE__ */ (0, x.jsx)(n_, { ...Le })
	] }), ze = (0, l.useRef)(!1);
	return (0, l.useEffect)(() => {
		ze.current = !1;
	}, [e.handNumber, e.sessionId]), (0, l.useEffect)(() => {
		if (e.phase !== "reveal" || P.anteAnimActive || P.trumpRevealActive || P.phase !== "drawPlayer" && P.phase !== "drawReady" || ze.current || !S.onAdvanceReveal) return;
		let t = S.onAdvanceReveal();
		Promise.resolve(t).then(() => {
			ze.current = !0;
		}, () => {
			ze.current = !1;
		});
	}, [
		e.phase,
		e.handNumber,
		e.sessionId,
		P.anteAnimActive,
		P.trumpRevealActive,
		P.phase,
		S
	]), (0, l.useEffect)(() => {
		let e = (e) => {
			(e.key === C.hotkeys.toggleSettings || e.key === "," && e.metaKey) && E((e) => !e), e.key === C.hotkeys.focusTable && document.querySelector(".btable-wrap")?.scrollIntoView({
				block: "center",
				behavior: "smooth"
			});
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [C.hotkeys]), (0, l.useEffect)(() => {
		let e = () => E(!0);
		return window.addEventListener("nbl-open-table-settings", e), () => window.removeEventListener("nbl-open-table-settings", e);
	}, []), /* @__PURE__ */ (0, x.jsxs)("div", {
		className: [
			"btable-session",
			w ? "btable-session--native-mobile btable-session--mobile-layout" : "",
			T ? "btable-session--settings-open" : "",
			Hs(e.phase) ? "btable-session--reveal-phase" : "",
			Vs(e.phase) ? "btable-session--decision-phase" : ""
		].filter(Boolean).join(" "),
		"data-trick-resolving": N.isPipelineActive ? "true" : "false",
		"data-hand-settling": P.settleAnimActive ? "true" : "false",
		"data-hand-complete": y ? "true" : "false",
		children: [
			/* @__PURE__ */ (0, x.jsx)("header", {
				className: "btable-session__head",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, x.jsx)("span", {
					className: "btable-sr-only",
					"data-testid": "phase-tag",
					"data-phase": e.phase ?? "waiting",
					children: _e
				})
			}),
			!w && /* @__PURE__ */ (0, x.jsxs)("p", {
				className: "btable-session__rotate-hint",
				role: "note",
				children: [
					"Rotate your phone to ",
					/* @__PURE__ */ (0, x.jsx)("strong", { children: "landscape" }),
					" for the full table (up to 8 players)."
				]
			}),
			w ? /* @__PURE__ */ (0, x.jsx)(m_, { children: /* @__PURE__ */ (0, x.jsxs)("div", {
				className: "btable-stage",
				children: [/* @__PURE__ */ (0, x.jsx)(fv, {
					actionFeedback: b,
					feedbackErrorPulse: je.feedbackErrorPulse,
					feedbackSuccessPulse: je.feedbackSuccessPulse,
					turnLabel: be,
					isMyTurn: Te,
					showTurn: xe
				}), Re]
			}) }) : /* @__PURE__ */ (0, x.jsx)(p_, { children: /* @__PURE__ */ (0, x.jsxs)("div", {
				className: "btable-stage",
				children: [/* @__PURE__ */ (0, x.jsx)(fv, {
					actionFeedback: b,
					feedbackErrorPulse: je.feedbackErrorPulse,
					feedbackSuccessPulse: je.feedbackSuccessPulse,
					turnLabel: be,
					isMyTurn: Te,
					showTurn: xe
				}), Re]
			}) }),
			/* @__PURE__ */ (0, x.jsx)(__, {
				open: T,
				onClose: () => E(!1)
			}),
			ne && !e.isFinal && o && /* @__PURE__ */ (0, x.jsx)(Jv, {
				session: e,
				players: t,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: M,
				resultMessage: te,
				manualContinueAllowed: L,
				onAgreeSplit: () => S.onSettle("split"),
				onDeclineSplit: () => S.onSettle("push"),
				onCarryover: () => S.onSettleCarryover?.()
			}),
			ne && !e.isFinal && !o && /* @__PURE__ */ (0, x.jsx)(Uv, {
				session: e,
				players: t,
				potMetrics: n,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: M,
				manualContinueAllowed: L,
				onSettle: (e) => S.onSettle(e)
			}),
			/* @__PURE__ */ (0, x.jsxs)("footer", {
				className: "btable-session__foot muted small",
				children: [
					/* @__PURE__ */ (0, x.jsx)(g_, { compact: !0 }),
					we && /* @__PURE__ */ (0, x.jsxs)("div", {
						className: "btable-session__rebuy-offer",
						children: [/* @__PURE__ */ (0, x.jsx)("p", {
							className: "btable-session__rebuy-copy",
							children: "You're out — rebuy to join the next hand."
						}), /* @__PURE__ */ (0, x.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--primary",
							"data-testid": "rebuy-button",
							onClick: () => void S.onRebuy?.(),
							children: "Rebuy"
						})]
					}),
					r == null ? /* @__PURE__ */ (0, x.jsx)(x.Fragment, { children: "Shared pot and game state only · sign in to track your ledger" }) : /* @__PURE__ */ (0, x.jsxs)(x.Fragment, { children: ["Your session profit/loss ", Il(r)] })
				]
			})
		]
	});
}
//#endregion
//#region src/table/mount.tsx
var ay = null, oy = null;
function sy(e, t) {
	rf(), Zo(e), oy !== e && (ay?.unmount(), ay = (0, u.createRoot)(e), oy = e), ay.render(/* @__PURE__ */ (0, x.jsx)(Pf, { children: /* @__PURE__ */ (0, x.jsx)(iy, { ...t }) }));
}
function cy() {
	oy && (mg(oy), th(oy)), ay?.unmount(), ay = null, oy = null, xp(), ep(), N_(null);
}
//#endregion
export { th as clearDrawFlyGhosts, mg as clearWonTrickCollectionArtifacts, _p as evaluateBotPresentationGate, gp as forceReleasePresentationForBots, P_ as getBotThinkWindow, Pu as getFeedbackPrefs, dp as getTablePresentationBlockReason, Sp as getTrickAnimationBusyState, mp as handPresentingBlocksBots, rf as initGameFeedback, wp as isTablePresentationBusy, vp as isTablePresentationBusyForBots, Cp as isTrickAnimationBusy, sy as mountTableSession, lf as playBigWinFeedback, uf as playBourreFeedback, df as playBourrePrivatePunishmentFeedback, gf as playCardSelectFeedback, hf as playDeleteRoomFeedback, sf as playDrawFeedback, vf as playFoldFeedback, ff as playGameStartFeedback, mf as playOpenRoomFeedback, af as playShuffleFeedback, cf as playTrickWinFeedback, _f as playUiButtonFeedback, N_ as publishBotThinkWindow, Fu as saveFeedbackPrefs, F_ as subscribeBotThinkWindow, Ru as subscribeFeedbackPrefs, Tp as subscribeTrickAnimationBusy, cy as unmountTableSession };
