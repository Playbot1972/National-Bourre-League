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
			t !== null && ee(x, t.startTime - e);
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
								u !== null && ee(x, u.startTime - t), i = !1;
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
	function ee(t, n) {
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
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, ee(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, O()))), r;
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
	function ee(e, t) {
		return typeof e == "object" && e && e.key != null ? k("" + e.key) : t.toString(36);
	}
	function j(e) {
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
	function te(e, r, i, a, o) {
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
				case d: return c = e._init, te(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + ee(e, 0) : a, S(o) ? (i = "", c != null && (i = c.replace(A, "$&/") + "/"), te(o, r, i, "", function(e) {
			return e;
		})) : o != null && (O(o) && (o = D(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(A, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (S(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + ee(a, u), c += te(a, r, i, s, o);
		else if (u = m(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + ee(a, u++), c += te(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return te(j(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function M(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return te(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function ne(e) {
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
	var N = typeof reportError == "function" ? reportError : function(e) {
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
	}, P = {
		map: M,
		forEach: function(e, t, n) {
			M(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return M(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return M(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!O(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = P, e.Component = v, e.Fragment = r, e.Profiler = a, e.PureComponent = b, e.StrictMode = i, e.Suspense = l, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w, e.__COMPILER_RUNTIME = {
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
			_init: ne
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
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(C, N);
		} catch (e) {
			N(e);
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
	var h = Object.assign, g = Symbol.for("react.element"), _ = Symbol.for("react.transitional.element"), v = Symbol.for("react.portal"), y = Symbol.for("react.fragment"), b = Symbol.for("react.strict_mode"), x = Symbol.for("react.profiler"), S = Symbol.for("react.consumer"), C = Symbol.for("react.context"), w = Symbol.for("react.forward_ref"), T = Symbol.for("react.suspense"), E = Symbol.for("react.suspense_list"), D = Symbol.for("react.memo"), O = Symbol.for("react.lazy"), k = Symbol.for("react.activity"), A = Symbol.for("react.memo_cache_sentinel"), ee = Symbol.iterator;
	function j(e) {
		return typeof e != "object" || !e ? null : (e = ee && e[ee] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var te = Symbol.for("react.client.reference");
	function M(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === te ? null : e.displayName || e.name || null;
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
			case D: return t = e.displayName || null, t === null ? M(e.type) || "Memo" : t;
			case O:
				t = e._payload, e = e._init;
				try {
					return M(e(t));
				} catch {}
		}
		return null;
	}
	var ne = Array.isArray, N = r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, P = a.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, re = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, F = [], I = -1;
	function L(e) {
		return { current: e };
	}
	function R(e) {
		0 > I || (e.current = F[I], F[I] = null, I--);
	}
	function z(e, t) {
		I++, F[I] = e.current, e.current = t;
	}
	var ie = L(null), ae = L(null), B = L(null), V = L(null);
	function oe(e, t) {
		switch (z(B, t), z(ae, e), z(ie, null), t.nodeType) {
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
		R(ie), z(ie, e);
	}
	function H() {
		R(ie), R(ae), R(B);
	}
	function se(e) {
		e.memoizedState !== null && z(V, e);
		var t = ie.current, n = Ud(t, e.type);
		t !== n && (z(ae, e), z(ie, n));
	}
	function ce(e) {
		ae.current === e && (R(ie), R(ae)), V.current === e && (R(V), Qf._currentValue = re);
	}
	var le, ue;
	function de(e) {
		if (le === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			le = t && t[1] || "", ue = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + le + e + ue;
	}
	var fe = !1;
	function pe(e, t) {
		if (!e || fe) return "";
		fe = !0;
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
			fe = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? de(n) : "";
	}
	function me(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return de(e.type);
			case 16: return de("Lazy");
			case 13: return e.child !== t && t !== null ? de("Suspense Fallback") : de("Suspense");
			case 19: return de("SuspenseList");
			case 0:
			case 15: return pe(e.type, !1);
			case 11: return pe(e.type.render, !1);
			case 1: return pe(e.type, !0);
			case 31: return de("Activity");
			default: return "";
		}
	}
	function he(e) {
		try {
			var t = "", n = null;
			do
				t += me(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var ge = Object.prototype.hasOwnProperty, _e = t.unstable_scheduleCallback, ve = t.unstable_cancelCallback, ye = t.unstable_shouldYield, be = t.unstable_requestPaint, xe = t.unstable_now, Se = t.unstable_getCurrentPriorityLevel, Ce = t.unstable_ImmediatePriority, we = t.unstable_UserBlockingPriority, Te = t.unstable_NormalPriority, Ee = t.unstable_LowPriority, De = t.unstable_IdlePriority, Oe = t.log, ke = t.unstable_setDisableYieldValue, Ae = null, je = null;
	function Me(e) {
		if (typeof Oe == "function" && ke(e), je && typeof je.setStrictMode == "function") try {
			je.setStrictMode(Ae, e);
		} catch {}
	}
	var Ne = Math.clz32 ? Math.clz32 : Fe, U = Math.log, Pe = Math.LN2;
	function Fe(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (U(e) / Pe | 0) | 0;
	}
	var Ie = 256, Le = 262144, Re = 4194304;
	function ze(e) {
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
	function Be(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = ze(n))) : i = ze(o) : i = ze(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = ze(n))) : i = ze(o)) : i = ze(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function Ve(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function He(e, t) {
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
	function Ue() {
		var e = Re;
		return Re <<= 1, !(Re & 62914560) && (Re = 4194304), e;
	}
	function We(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function Ge(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function Ke(e, t, n, r, i, a) {
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
		r !== 0 && qe(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function qe(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - Ne(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function Je(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Ne(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function Ye(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : Xe(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function Xe(e) {
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
	function Ze(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function Qe() {
		var e = P.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : mp(e.type)) : e;
	}
	function $e(e, t) {
		var n = P.p;
		try {
			return P.p = e, t();
		} finally {
			P.p = n;
		}
	}
	var et = Math.random().toString(36).slice(2), tt = "__reactFiber$" + et, nt = "__reactProps$" + et, rt = "__reactContainer$" + et, it = "__reactEvents$" + et, at = "__reactListeners$" + et, ot = "__reactHandles$" + et, st = "__reactResources$" + et, ct = "__reactMarker$" + et;
	function lt(e) {
		delete e[tt], delete e[nt], delete e[it], delete e[at], delete e[ot];
	}
	function ut(e) {
		var t = e[tt];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[rt] || n[tt]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = ff(e); e !== null;) {
					if (n = e[tt]) return n;
					e = ff(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function dt(e) {
		if (e = e[tt] || e[rt]) {
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
		return ge.call(xt, e) ? !0 : ge.call(bt, e) ? !1 : yt.test(e) ? xt[e] = !0 : (bt[e] = !0, !1);
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
				if (ne(r)) {
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
			var n = e[nt] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (Pt(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + Nt("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var i = r[nt] || null;
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
			if (en = !1, (Zt !== null || Qt !== null) && (yu(), Zt && (t = Zt, e = Qt, Qt = Zt = null, $t(t), e))) for (t = 0; t < e.length; t++) $t(e[t]);
		}
	}
	function nn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[nt] || null;
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
	}, An = {
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
	}, W = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function jn(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = W[e]) ? !!t[e] : !1;
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
			return e.type === "keypress" ? (e = dn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? An[e.keyCode] || "Unidentified" : "";
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
		Zt ? Qt ? Qt.push(r) : Qt = [r] : Zt = r, t = Ed(t, "onChange"), 0 < t.length && (n = new gn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var er = null, tr = null;
	function nr(e) {
		yd(e, 0);
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
			if (!ge.call(t, i) || !gr(e[i], t[i])) return !1;
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
		}), Er && _r(Er, r) || (Er = r, r = Ed(Tr, "onSelect"), 0 < r.length && (t = new gn("onSelect", "select", null, t, n), e.push({
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
		if (50 < uu) throw uu = 0, du = null, Error(s(185));
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
				stack: he(t)
			}, di.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: he(t)
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
	var Di = null, Oi = null, G = !1, ki = null, Ai = !1, ji = Error(s(519));
	function Mi(e) {
		throw Ri(fi(Error(s(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), ji;
	}
	function Ni(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[tt] = e, t[nt] = r, n) {
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
				Q("invalid", t), Ft(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), zt(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || Md(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = Jt), t = !0) : t = !1, t || Mi(e, !0);
	}
	function Pi(e) {
		for (Di = e.return; Di;) switch (Di.tag) {
			case 5:
			case 31:
			case 13:
				Ai = !1;
				return;
			case 27:
			case 3:
				Ai = !0;
				return;
			default: Di = Di.return;
		}
	}
	function Fi(e) {
		if (e !== Di) return !1;
		if (!G) return Pi(e), G = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || Wd(e.type, e.memoizedProps)), n = !n), n && Oi && Mi(e), Pi(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			Oi = df(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			Oi = df(e);
		} else t === 27 ? (t = Oi, Qd(e.type) ? (e = uf, uf = null, Oi = e) : Oi = t) : Oi = Di ? lf(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Ii() {
		Oi = Di = null, G = !1;
	}
	function Li() {
		var e = ki;
		return e !== null && (Xl === null ? Xl = e : Xl.push.apply(Xl, e), ki = null), e;
	}
	function Ri(e) {
		ki === null ? ki = [e] : ki.push(e);
	}
	var zi = L(null), Bi = null, Vi = null;
	function Hi(e, t, n) {
		z(zi, t._currentValue), t._currentValue = n;
	}
	function Ui(e) {
		e._currentValue = zi.current, R(zi);
	}
	function Wi(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Gi(e, t, n, r) {
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
						a.lanes |= n, c = a.alternate, c !== null && (c.lanes |= n), Wi(a.return, n, e), r || (o = null);
						break a;
					}
					a = c.next;
				}
			} else if (i.tag === 18) {
				if (o = i.return, o === null) throw Error(s(341));
				o.lanes |= n, a = o.alternate, a !== null && (a.lanes |= n), Wi(o, n, e), o = null;
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
	function Ki(e, t, n, r) {
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
			} else if (i === V.current) {
				if (o = i.alternate, o === null) throw Error(s(387));
				o.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [Qf] : e.push(Qf));
			}
			i = i.return;
		}
		e !== null && Gi(t, e, n, r), t.flags |= 262144;
	}
	function qi(e) {
		for (e = e.firstContext; e !== null;) {
			if (!gr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function Ji(e) {
		Bi = e, Vi = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function Yi(e) {
		return Zi(Bi, e);
	}
	function Xi(e, t) {
		return Bi === null && Ji(e), Zi(e, t);
	}
	function Zi(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, Vi === null) {
			if (e === null) throw Error(s(308));
			Vi = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else Vi = Vi.next = t;
		return n;
	}
	var Qi = typeof AbortController < "u" ? AbortController : function() {
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
	}, $i = t.unstable_scheduleCallback, K = t.unstable_NormalPriority, ea = {
		$$typeof: C,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function ta() {
		return {
			controller: new Qi(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function na(e) {
		e.refCount--, e.refCount === 0 && $i(K, function() {
			e.controller.abort();
		});
	}
	var ra = null, ia = 0, aa = 0, oa = null;
	function sa(e, t) {
		if (ra === null) {
			var n = ra = [];
			ia = 0, aa = dd(), oa = {
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
	var ua = N.S;
	N.S = function(e, t) {
		$l = xe(), typeof t == "object" && t && typeof t.then == "function" && sa(e, t), ua !== null && ua(e, t);
	};
	var da = L(null);
	function fa() {
		var e = da.current;
		return e === null ? Il.pooledCache : e;
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
			case "rejected": throw e = t.reason, wa(e), e;
			default:
				if (typeof t.status == "string") t.then(Jt, Jt);
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
					case "rejected": throw e = t.reason, wa(e), e;
				}
				throw Sa = t, ha;
		}
	}
	function xa(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (Sa = e, ha) : e;
		}
	}
	var Sa = null;
	function Ca() {
		if (Sa === null) throw Error(s(459));
		var e = Sa;
		return Sa = null, e;
	}
	function wa(e) {
		if (e === ha || e === _a) throw Error(s(483));
	}
	var Ta = null, Ea = 0;
	function Da(e) {
		var t = Ea;
		return Ea += 1, Ta === null && (Ta = []), ba(Ta, e, t);
	}
	function Oa(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function ka(e, t) {
		throw t.$$typeof === g ? Error(s(525)) : (e = Object.prototype.toString.call(t), Error(s(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function Aa(e) {
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
			return a === y ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === O && xa(a) === t.type) ? (t = i(t, n.props), Oa(t, n), t.return = e, t) : (t = oi(n.type, n.key, n.props, null, e.mode, r), Oa(t, n), t.return = e, t);
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
					case _: return n = oi(t.type, t.key, t.props, null, e.mode, n), Oa(n, t), n.return = e, n;
					case v: return t = ui(t, e.mode, n), t.return = e, t;
					case O: return t = xa(t), f(e, t, n);
				}
				if (ne(t) || j(t)) return t = si(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, Da(t), n);
				if (t.$$typeof === C) return f(e, Xi(e, t), n);
				ka(e, t);
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
				if (ne(n) || j(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, Da(n), r);
				if (n.$$typeof === C) return p(e, t, Xi(e, n), r);
				ka(e, n);
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
				if (ne(r) || j(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, Da(r), i);
				if (r.$$typeof === C) return m(e, t, n, Xi(t, r), i);
				ka(t, r);
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
			if (h === s.length) return n(i, d), G && Si(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return G && Si(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), G && Si(i, h), l;
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
			if (v.done) return n(i, h), G && Si(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
				return G && Si(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), G && Si(i, g), u;
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
										n(e, r.sibling), c = i(r, a.props), Oa(c, a), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								} else t(e, r);
								r = r.sibling;
							}
							a.type === y ? (c = si(a.props.children, e.mode, c, a.key), c.return = e, e = c) : (c = oi(a.type, a.key, a.props, null, e.mode, c), Oa(c, a), c.return = e, e = c);
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
				if (ne(a)) return h(e, r, a, c);
				if (j(a)) {
					if (l = j(a), typeof l != "function") throw Error(s(150));
					return a = l.call(a), g(e, r, a, c);
				}
				if (typeof a.then == "function") return b(e, r, Da(a), c);
				if (a.$$typeof === C) return b(e, r, Xi(e, a), c);
				ka(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), c = i(r, a), c.return = e, e = c) : (n(e, r), c = ci(a, e.mode, c), c.return = e, e = c), o(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				Ea = 0;
				var i = b(e, t, n, r);
				return Ta = null, i;
			} catch (t) {
				if (t === ha || t === _a) throw t;
				var a = ni(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var ja = Aa(!0), Ma = Aa(!1), Na = !1;
	function Pa(e) {
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
	function Fa(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function Ia(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function La(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, Y & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = $r(e), Qr(e, null, n), t;
		}
		return Yr(e, r, t, n), $r(e);
	}
	function Ra(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Je(e, n);
		}
	}
	function za(e, t) {
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
	var Ba = !1;
	function Va() {
		if (Ba) {
			var e = oa;
			if (e !== null) throw e;
		}
	}
	function Ha(e, t, n, r) {
		Ba = !1;
		var i = e.updateQueue;
		Na = !1;
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
					f !== 0 && f === aa && (Ba = !0), u !== null && (u = u.next = {
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
							case 2: Na = !0;
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
	function Ua(e, t) {
		if (typeof e != "function") throw Error(s(191, e));
		e.call(t);
	}
	function Wa(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) Ua(n[e], t);
	}
	var Ga = L(null), Ka = L(0);
	function qa(e, t) {
		e = Hl, z(Ka, e), z(Ga, t), Hl = e | t.baseLanes;
	}
	function Ja() {
		z(Ka, Hl), z(Ga, Ga.current);
	}
	function Ya() {
		Hl = Ka.current, R(Ga), R(Ka);
	}
	var Xa = L(null), Za = null;
	function Qa(e) {
		var t = e.alternate;
		z(ro, ro.current & 1), z(Xa, e), Za === null && (t === null || Ga.current !== null || t.memoizedState !== null) && (Za = e);
	}
	function $a(e) {
		z(ro, ro.current), z(Xa, e), Za === null && (Za = e);
	}
	function eo(e) {
		e.tag === 22 ? (z(ro, ro.current), z(Xa, e), Za === null && (Za = e)) : to(e);
	}
	function to() {
		z(ro, ro.current), z(Xa, Xa.current);
	}
	function no(e) {
		R(Xa), Za === e && (Za = null), R(ro);
	}
	var ro = L(0);
	function io(e) {
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
	var ao = 0, q = null, oo = null, so = null, co = !1, lo = !1, uo = !1, fo = 0, po = 0, mo = null, ho = 0;
	function go() {
		throw Error(s(321));
	}
	function _o(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!gr(e[n], t[n])) return !1;
		return !0;
	}
	function vo(e, t, n, r, i, a) {
		return ao = a, q = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, N.H = e === null || e.memoizedState === null ? Ps : Fs, uo = !1, a = n(r, i), uo = !1, lo && (a = bo(t, n, r, i)), yo(e), a;
	}
	function yo(e) {
		N.H = Ns;
		var t = oo !== null && oo.next !== null;
		if (ao = 0, so = oo = q = null, co = !1, po = 0, mo = null, t) throw Error(s(300));
		e === null || Qs || (e = e.dependencies, e !== null && qi(e) && (Qs = !0));
	}
	function bo(e, t, n, r) {
		q = e;
		var i = 0;
		do {
			if (lo && (mo = null), po = 0, lo = !1, 25 <= i) throw Error(s(301));
			if (i += 1, so = oo = null, e.updateQueue != null) {
				var a = e.updateQueue;
				a.lastEffect = null, a.events = null, a.stores = null, a.memoCache != null && (a.memoCache.index = 0);
			}
			N.H = Is, a = t(n, r);
		} while (lo);
		return a;
	}
	function xo() {
		var e = N.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? Oo(t) : t, e = e.useState()[0], (oo === null ? null : oo.memoizedState) !== e && (q.flags |= 1024), t;
	}
	function So() {
		var e = fo !== 0;
		return fo = 0, e;
	}
	function Co(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function wo(e) {
		if (co) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			co = !1;
		}
		ao = 0, so = oo = q = null, lo = !1, po = fo = 0, mo = null;
	}
	function To() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return so === null ? q.memoizedState = so = e : so = so.next = e, so;
	}
	function Eo() {
		if (oo === null) {
			var e = q.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = oo.next;
		var t = so === null ? q.memoizedState : so.next;
		if (t !== null) so = t, oo = e;
		else {
			if (e === null) throw q.alternate === null ? Error(s(467)) : Error(s(310));
			oo = e, e = {
				memoizedState: oo.memoizedState,
				baseState: oo.baseState,
				baseQueue: oo.baseQueue,
				queue: oo.queue,
				next: null
			}, so === null ? q.memoizedState = so = e : so = so.next = e;
		}
		return so;
	}
	function Do() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function Oo(e) {
		var t = po;
		return po += 1, mo === null && (mo = []), e = ba(mo, e, t), t = q, (so === null ? t.memoizedState : so.next) === null && (t = t.alternate, N.H = t === null || t.memoizedState === null ? Ps : Fs), e;
	}
	function ko(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return Oo(e);
			if (e.$$typeof === C) return Yi(e);
		}
		throw Error(s(438, String(e)));
	}
	function Ao(e) {
		var t = null, n = q.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = q.alternate;
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
		}, n === null && (n = Do(), q.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = A;
		return t.index++, n;
	}
	function jo(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function Mo(e) {
		return No(Eo(), oo, e);
	}
	function No(e, t, n) {
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
				if (f === u.lane ? (ao & f) === f : (Z & f) === f) {
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
					else if ((ao & p) === p) {
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
					}, l === null ? (c = l = f, o = a) : l = l.next = f, q.lanes |= p, Wl |= p;
					f = u.action, uo && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, o = a) : l = l.next = p, q.lanes |= f, Wl |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? o = a : l.next = c, !gr(a, e.memoizedState) && (Qs = !0, d && (n = oa, n !== null))) throw n;
			e.memoizedState = a, e.baseState = o, e.baseQueue = l, r.lastRenderedState = a;
		}
		return i === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function Po(e) {
		var t = Eo(), n = t.queue;
		if (n === null) throw Error(s(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, a = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var o = i = i.next;
			do
				a = e(a, o.action), o = o.next;
			while (o !== i);
			gr(a, t.memoizedState) || (Qs = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function Fo(e, t, n) {
		var r = q, i = Eo(), a = G;
		if (a) {
			if (n === void 0) throw Error(s(407));
			n = n();
		} else n = t();
		var o = !gr((oo || i).memoizedState, n);
		if (o && (i.memoizedState = n, Qs = !0), i = i.queue, os(Ro.bind(null, r, i, e), [e]), i.getSnapshot !== t || o || so !== null && so.memoizedState.tag & 1) {
			if (r.flags |= 2048, ts(9, { destroy: void 0 }, Lo.bind(null, r, i, n, t), null), Il === null) throw Error(s(349));
			a || ao & 127 || Io(r, t, n);
		}
		return n;
	}
	function Io(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = q.updateQueue, t === null ? (t = Do(), q.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function Lo(e, t, n, r) {
		t.value = n, t.getSnapshot = r, zo(t) && Bo(e);
	}
	function Ro(e, t, n) {
		return n(function() {
			zo(t) && Bo(e);
		});
	}
	function zo(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !gr(e, n);
		} catch {
			return !0;
		}
	}
	function Bo(e) {
		var t = Zr(e, 2);
		t !== null && mu(t, e, 2);
	}
	function Vo(e) {
		var t = To();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), uo) {
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
			lastRenderedReducer: jo,
			lastRenderedState: e
		}, t;
	}
	function Ho(e, t, n, r) {
		return e.baseState = n, No(e, oo, typeof r == "function" ? r : jo);
	}
	function Uo(e, t, n, r, i) {
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
			N.T === null ? a.isTransition = !1 : n(!0), r(a), n = t.pending, n === null ? (a.next = t.pending = a, Wo(t, a)) : (a.next = n.next, t.pending = n.next = a);
		}
	}
	function Wo(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = N.T, o = {};
			N.T = o;
			try {
				var s = n(i, r), c = N.S;
				c !== null && c(o, s), Go(e, t, s);
			} catch (n) {
				qo(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), N.T = a;
			}
		} else try {
			a = n(i, r), Go(e, t, a);
		} catch (n) {
			qo(e, t, n);
		}
	}
	function Go(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Ko(e, t, n);
		}, function(n) {
			return qo(e, t, n);
		}) : Ko(e, t, n);
	}
	function Ko(e, t, n) {
		t.status = "fulfilled", t.value = n, Jo(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Wo(e, n)));
	}
	function qo(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, Jo(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function Jo(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function Yo(e, t) {
		return t;
	}
	function Xo(e, t) {
		if (G) {
			var n = Il.formState;
			if (n !== null) {
				a: {
					var r = q;
					if (G) {
						if (Oi) {
							b: {
								for (var i = Oi, a = Ai; i.nodeType !== 8;) {
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
								Oi = lf(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						Mi(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = To(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Yo,
			lastRenderedState: t
		}, n.queue = r, n = Ds.bind(null, q, r), r.dispatch = n, r = Vo(!1), a = ks.bind(null, q, !1, r.queue), r = To(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Uo.bind(null, q, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function Zo(e) {
		return Qo(Eo(), oo, e);
	}
	function Qo(e, t, n) {
		if (t = No(e, t, Yo)[0], e = Mo(jo)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = Oo(t);
		} catch (e) {
			throw e === ha ? _a : e;
		}
		else r = t;
		t = Eo();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (q.flags |= 2048, ts(9, { destroy: void 0 }, $o.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function $o(e, t) {
		e.action = t;
	}
	function es(e) {
		var t = Eo(), n = oo;
		if (n !== null) return Qo(t, n, e);
		Eo(), t = t.memoizedState, n = Eo();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function ts(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = q.updateQueue, t === null && (t = Do(), q.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function ns() {
		return Eo().memoizedState;
	}
	function rs(e, t, n, r) {
		var i = To();
		q.flags |= e, i.memoizedState = ts(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function is(e, t, n, r) {
		var i = Eo();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		oo !== null && r !== null && _o(r, oo.memoizedState.deps) ? i.memoizedState = ts(t, a, n, r) : (q.flags |= e, i.memoizedState = ts(1 | t, a, n, r));
	}
	function as(e, t) {
		rs(8390656, 8, e, t);
	}
	function os(e, t) {
		is(2048, 8, e, t);
	}
	function ss(e) {
		q.flags |= 4;
		var t = q.updateQueue;
		if (t === null) t = Do(), q.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function cs(e) {
		var t = Eo().memoizedState;
		return ss({
			ref: t,
			nextImpl: e
		}), function() {
			if (Y & 2) throw Error(s(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function ls(e, t) {
		return is(4, 2, e, t);
	}
	function us(e, t) {
		return is(4, 4, e, t);
	}
	function ds(e, t) {
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
	function fs(e, t, n) {
		n = n == null ? null : n.concat([e]), is(4, 4, ds.bind(null, t, e), n);
	}
	function J() {}
	function ps(e, t) {
		var n = Eo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && _o(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function ms(e, t) {
		var n = Eo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && _o(t, r[1])) return r[0];
		if (r = e(), uo) {
			Me(!0);
			try {
				e();
			} finally {
				Me(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function hs(e, t, n) {
		return n === void 0 || ao & 1073741824 && !(Z & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = pu(), q.lanes |= e, Wl |= e, n);
	}
	function gs(e, t, n, r) {
		return gr(n, t) ? n : Ga.current === null ? !(ao & 42) || ao & 1073741824 && !(Z & 261930) ? (Qs = !0, e.memoizedState = n) : (e = pu(), q.lanes |= e, Wl |= e, t) : (e = hs(e, n, r), gr(e, t) || (Qs = !0), e);
	}
	function _s(e, t, n, r, i) {
		var a = P.p;
		P.p = a !== 0 && 8 > a ? a : 8;
		var o = N.T, s = {};
		N.T = s, ks(e, !1, t, n);
		try {
			var c = i(), l = N.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? Os(e, t, la(c, r), fu(e)) : Os(e, t, r, fu(e));
		} catch (n) {
			Os(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, fu());
		} finally {
			P.p = a, o !== null && s.types !== null && (o.types = s.types), N.T = o;
		}
	}
	function vs() {}
	function ys(e, t, n, r) {
		if (e.tag !== 5) throw Error(s(476));
		var i = bs(e).queue;
		_s(e, i, t, re, n === null ? vs : function() {
			return xs(e), n(r);
		});
	}
	function bs(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: re,
			baseState: re,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: jo,
				lastRenderedState: re
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
				lastRenderedReducer: jo,
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
		return Yi(Qf);
	}
	function Cs() {
		return Eo().memoizedState;
	}
	function ws() {
		return Eo().memoizedState;
	}
	function Ts(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = fu();
					e = Ia(n);
					var r = La(t, e, n);
					r !== null && (mu(r, t, n), Ra(r, t, n)), t = { cache: ta() }, e.payload = t;
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
		}, As(e) ? js(t, n) : (n = Xr(e, t, n, r), n !== null && (mu(n, e, r), Ms(n, t, r)));
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
				if (i.hasEagerState = !0, i.eagerState = s, gr(s, o)) return Yr(e, t, i, 0), Il === null && Jr(), !1;
			} catch {}
			if (n = Xr(e, t, i, r), n !== null) return mu(n, e, r), Ms(n, t, r), !0;
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
		} else t = Xr(e, n, r, 2), t !== null && mu(t, e, 2);
	}
	function As(e) {
		var t = e.alternate;
		return e === q || t !== null && t === q;
	}
	function js(e, t) {
		lo = co = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function Ms(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Je(e, n);
		}
	}
	var Ns = {
		readContext: Yi,
		use: ko,
		useCallback: go,
		useContext: go,
		useEffect: go,
		useImperativeHandle: go,
		useLayoutEffect: go,
		useInsertionEffect: go,
		useMemo: go,
		useReducer: go,
		useRef: go,
		useState: go,
		useDebugValue: go,
		useDeferredValue: go,
		useTransition: go,
		useSyncExternalStore: go,
		useId: go,
		useHostTransitionStatus: go,
		useFormState: go,
		useActionState: go,
		useOptimistic: go,
		useMemoCache: go,
		useCacheRefresh: go
	};
	Ns.useEffectEvent = go;
	var Ps = {
		readContext: Yi,
		use: ko,
		useCallback: function(e, t) {
			return To().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Yi,
		useEffect: as,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), rs(4194308, 4, ds.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return rs(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			rs(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = To();
			t = t === void 0 ? null : t;
			var r = e();
			if (uo) {
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
			var r = To();
			if (n !== void 0) {
				var i = n(t);
				if (uo) {
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
			}, r.queue = e, e = e.dispatch = Es.bind(null, q, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = To();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = Vo(e);
			var t = e.queue, n = Ds.bind(null, q, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: J,
		useDeferredValue: function(e, t) {
			return hs(To(), e, t);
		},
		useTransition: function() {
			var e = Vo(!1);
			return e = _s.bind(null, q, e.queue, !0, !1), To().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = q, i = To();
			if (G) {
				if (n === void 0) throw Error(s(407));
				n = n();
			} else {
				if (n = t(), Il === null) throw Error(s(349));
				Z & 127 || Io(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, as(Ro.bind(null, r, a, e), [e]), r.flags |= 2048, ts(9, { destroy: void 0 }, Lo.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = To(), t = Il.identifierPrefix;
			if (G) {
				var n = xi, r = bi;
				n = (r & ~(1 << 32 - Ne(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = fo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = ho++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: Ss,
		useFormState: Xo,
		useActionState: Xo,
		useOptimistic: function(e) {
			var t = To();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = ks.bind(null, q, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: Ao,
		useCacheRefresh: function() {
			return To().memoizedState = Ts.bind(null, q);
		},
		useEffectEvent: function(e) {
			var t = To(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (Y & 2) throw Error(s(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, Fs = {
		readContext: Yi,
		use: ko,
		useCallback: ps,
		useContext: Yi,
		useEffect: os,
		useImperativeHandle: fs,
		useInsertionEffect: ls,
		useLayoutEffect: us,
		useMemo: ms,
		useReducer: Mo,
		useRef: ns,
		useState: function() {
			return Mo(jo);
		},
		useDebugValue: J,
		useDeferredValue: function(e, t) {
			return gs(Eo(), oo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Mo(jo)[0], t = Eo().memoizedState;
			return [typeof e == "boolean" ? e : Oo(e), t];
		},
		useSyncExternalStore: Fo,
		useId: Cs,
		useHostTransitionStatus: Ss,
		useFormState: Zo,
		useActionState: Zo,
		useOptimistic: function(e, t) {
			return Ho(Eo(), oo, e, t);
		},
		useMemoCache: Ao,
		useCacheRefresh: ws
	};
	Fs.useEffectEvent = cs;
	var Is = {
		readContext: Yi,
		use: ko,
		useCallback: ps,
		useContext: Yi,
		useEffect: os,
		useImperativeHandle: fs,
		useInsertionEffect: ls,
		useLayoutEffect: us,
		useMemo: ms,
		useReducer: Po,
		useRef: ns,
		useState: function() {
			return Po(jo);
		},
		useDebugValue: J,
		useDeferredValue: function(e, t) {
			var n = Eo();
			return oo === null ? hs(n, e, t) : gs(n, oo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Po(jo)[0], t = Eo().memoizedState;
			return [typeof e == "boolean" ? e : Oo(e), t];
		},
		useSyncExternalStore: Fo,
		useId: Cs,
		useHostTransitionStatus: Ss,
		useFormState: es,
		useActionState: es,
		useOptimistic: function(e, t) {
			var n = Eo();
			return oo === null ? (n.baseState = e, [e, n.queue.dispatch]) : Ho(n, oo, e, t);
		},
		useMemoCache: Ao,
		useCacheRefresh: ws
	};
	Is.useEffectEvent = cs;
	function Ls(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : h({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var Rs = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = fu(), i = Ia(r);
			i.payload = t, n != null && (i.callback = n), t = La(e, i, r), t !== null && (mu(t, e, r), Ra(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = fu(), i = Ia(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = La(e, i, r), t !== null && (mu(t, e, r), Ra(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = fu(), r = Ia(n);
			r.tag = 2, t != null && (r.callback = t), t = La(e, r, n), t !== null && (mu(t, e, n), Ra(t, e, n));
		}
	};
	function zs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !_r(n, r) || !_r(i, a) : !0;
	}
	function Bs(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Rs.enqueueReplaceState(t, t.state, null);
	}
	function Vs(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = h({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Hs(e) {
		Wr(e);
	}
	function Us(e) {
		console.error(e);
	}
	function Ws(e) {
		Wr(e);
	}
	function Gs(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Ks(e, t, n) {
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
	function qs(e, t, n) {
		return n = Ia(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Gs(e, t);
		}, n;
	}
	function Js(e) {
		return e = Ia(e), e.tag = 3, e;
	}
	function Ys(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Ks(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Ks(t, n, r), typeof i != "function" && (nu === null ? nu = new Set([this]) : nu.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Xs(e, t, n, r, i) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Ki(t, n, i, !0), n = Xa.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return Za === null ? Eu() : n.alternate === null && Ul === 0 && (Ul = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === va ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = new Set([r]) : t.add(r), Gu(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === va ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = new Set([r]) : n.add(r)), Gu(e, r, i)), !1;
				}
				throw Error(s(435, n.tag));
			}
			return Gu(e, r, i), Eu(), !1;
		}
		if (G) return t = Xa.current, t === null ? (r !== ji && (t = Error(s(423), { cause: r }), Ri(fi(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = fi(r, n), i = qs(e.stateNode, r, i), za(e, i), Ul !== 4 && (Ul = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== ji && (e = Error(s(422), { cause: r }), Ri(fi(e, n)))), !1;
		var a = Error(s(520), { cause: r });
		if (a = fi(a, n), Yl === null ? Yl = [a] : Yl.push(a), Ul !== 4 && (Ul = 2), t === null) return !0;
		r = fi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = qs(n.stateNode, r, e), za(n, e), !1;
				case 1: if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (nu === null || !nu.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = Js(i), Ys(i, e, n, r), za(n, i), !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Zs = Error(s(461)), Qs = !1;
	function $s(e, t, n, r) {
		t.child = e === null ? Ma(t, null, n, r) : ja(t, e.child, n, r);
	}
	function ec(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Ji(t), r = vo(e, t, n, o, a, i), s = So(), e !== null && !Qs ? (Co(e, t, i), wc(e, t, i)) : (G && s && wi(t), t.flags |= 1, $s(e, t, r, i), t.child);
	}
	function tc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ri(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, nc(e, t, a, r, i)) : (e = oi(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !Tc(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? _r : n, n(o, r) && e.ref === t.ref) return wc(e, t, i);
		}
		return t.flags |= 1, e = ii(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function nc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (_r(a, r) && e.ref === t.ref) if (Qs = !1, t.pendingProps = r = a, Tc(e, i)) e.flags & 131072 && (Qs = !0);
			else return t.lanes = e.lanes, wc(e, t, i);
		}
		return uc(e, t, n, r, i);
	}
	function rc(e, t, n, r) {
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
				return ac(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && pa(t, a === null ? null : a.cachePool), a === null ? Ja() : qa(t, a), eo(t);
			else return r = t.lanes = 536870912, ac(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && pa(t, null), Ja(), to(t)) : (pa(t, a.cachePool), qa(t, a), to(t), t.memoizedState = null);
		return $s(e, t, i, n), t.child;
	}
	function ic(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function ac(e, t, n, r, i) {
		var a = fa();
		return a = a === null ? null : {
			parent: ea._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && pa(t, null), Ja(), eo(t), e !== null && Ki(e, t, r, !0), t.childLanes = i, null;
	}
	function oc(e, t) {
		return t = yc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function sc(e, t, n) {
		return ja(t, e.child, null, n), e = oc(t, t.pendingProps), e.flags |= 2, no(t), t.memoizedState = null, e;
	}
	function cc(e, t, n) {
		var r = t.pendingProps, i = (t.flags & 128) != 0;
		if (t.flags &= -129, e === null) {
			if (G) {
				if (r.mode === "hidden") return e = oc(t, r), t.lanes = 536870912, ic(null, e);
				if ($a(t), (e = Oi) ? (e = af(e, Ai), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: yi === null ? null : {
						id: bi,
						overflow: xi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = li(e), n.return = t, t.child = n, Di = t, Oi = null)) : e = null, e === null) throw Mi(t);
				return t.lanes = 536870912, null;
			}
			return oc(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var o = a.dehydrated;
			if ($a(t), i) if (t.flags & 256) t.flags &= -257, t = sc(e, t, n);
			else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
			else throw Error(s(558));
			else if (Qs || Ki(e, t, n, !1), i = (n & e.childLanes) !== 0, Qs || i) {
				if (r = Il, r !== null && (o = Ye(r, n), o !== 0 && o !== a.retryLane)) throw a.retryLane = o, Zr(e, o), mu(r, e, o), Zs;
				Eu(), t = sc(e, t, n);
			} else e = a.treeContext, Oi = lf(o.nextSibling), Di = t, G = !0, ki = null, Ai = !1, e !== null && Ei(t, e), t = oc(t, r), t.flags |= 4096;
			return t;
		}
		return e = ii(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function lc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(s(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function uc(e, t, n, r, i) {
		return Ji(t), n = vo(e, t, n, r, void 0, i), r = So(), e !== null && !Qs ? (Co(e, t, i), wc(e, t, i)) : (G && r && wi(t), t.flags |= 1, $s(e, t, n, i), t.child);
	}
	function dc(e, t, n, r, i, a) {
		return Ji(t), t.updateQueue = null, n = bo(t, r, n, i), yo(e), r = So(), e !== null && !Qs ? (Co(e, t, a), wc(e, t, a)) : (G && r && wi(t), t.flags |= 1, $s(e, t, n, a), t.child);
	}
	function fc(e, t, n, r, i) {
		if (Ji(t), t.stateNode === null) {
			var a = ei, o = n.contextType;
			typeof o == "object" && o && (a = Yi(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Rs, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Pa(t), o = n.contextType, a.context = typeof o == "object" && o ? Yi(o) : ei, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Ls(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Rs.enqueueReplaceState(a, a.state, null), Ha(t, r, a, i), Va(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Vs(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = ei, typeof u == "object" && u && (o = Yi(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && Bs(t, a, r, o), Na = !1;
			var f = t.memoizedState;
			a.state = f, Ha(t, r, a, i), Va(), l = t.memoizedState, s || f !== l || Na ? (typeof d == "function" && (Ls(t, n, d, r), l = t.memoizedState), (c = Na || zs(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Fa(e, t), o = t.memoizedProps, u = Vs(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = ei, typeof l == "object" && l && (c = Yi(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && Bs(t, a, r, c), Na = !1, f = t.memoizedState, a.state = f, Ha(t, r, a, i), Va();
			var p = t.memoizedState;
			o !== d || f !== p || Na || e !== null && e.dependencies !== null && qi(e.dependencies) ? (typeof s == "function" && (Ls(t, n, s, r), p = t.memoizedState), (u = Na || zs(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && qi(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, lc(e, t), r = (t.flags & 128) != 0, a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = ja(t, e.child, null, i), t.child = ja(t, null, n, i)) : $s(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = wc(e, t, i), e;
	}
	function pc(e, t, n, r) {
		return Ii(), t.flags |= 256, $s(e, t, n, r), t.child;
	}
	var mc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function hc(e) {
		return {
			baseLanes: e,
			cachePool: ma()
		};
	}
	function gc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ql), e;
	}
	function _c(e, t, n) {
		var r = t.pendingProps, i = !1, a = (t.flags & 128) != 0, o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : (ro.current & 2) != 0), o && (i = !0, t.flags &= -129), o = (t.flags & 32) != 0, t.flags &= -33, e === null) {
			if (G) {
				if (i ? Qa(t) : to(t), (e = Oi) ? (e = af(e, Ai), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: yi === null ? null : {
						id: bi,
						overflow: xi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = li(e), n.return = t, t.child = n, Di = t, Oi = null)) : e = null, e === null) throw Mi(t);
				return sf(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var c = r.children;
			return r = r.fallback, i ? (to(t), i = t.mode, c = yc({
				mode: "hidden",
				children: c
			}, i), r = si(r, i, n, null), c.return = t, r.return = t, c.sibling = r, t.child = c, r = t.child, r.memoizedState = hc(n), r.childLanes = gc(e, o, n), t.memoizedState = mc, ic(null, r)) : (Qa(t), vc(t, c));
		}
		var l = e.memoizedState;
		if (l !== null && (c = l.dehydrated, c !== null)) {
			if (a) t.flags & 256 ? (Qa(t), t.flags &= -257, t = bc(e, t, n)) : t.memoizedState === null ? (to(t), c = r.fallback, i = t.mode, r = yc({
				mode: "visible",
				children: r.children
			}, i), c = si(c, i, n, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, ja(t, e.child, null, n), r = t.child, r.memoizedState = hc(n), r.childLanes = gc(e, o, n), t.memoizedState = mc, t = ic(null, r)) : (to(t), t.child = e.child, t.flags |= 128, t = null);
			else if (Qa(t), sf(c)) {
				if (o = c.nextSibling && c.nextSibling.dataset, o) var u = o.dgst;
				o = u, r = Error(s(419)), r.stack = "", r.digest = o, Ri({
					value: r,
					source: null,
					stack: null
				}), t = bc(e, t, n);
			} else if (Qs || Ki(e, t, n, !1), o = (n & e.childLanes) !== 0, Qs || o) {
				if (o = Il, o !== null && (r = Ye(o, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, Zr(e, r), mu(o, e, r), Zs;
				of(c) || Eu(), t = bc(e, t, n);
			} else of(c) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, Oi = lf(c.nextSibling), Di = t, G = !0, ki = null, Ai = !1, e !== null && Ei(t, e), t = vc(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? (to(t), c = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = ii(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (c = si(c, i, n, null), c.flags |= 2) : c = ii(u, c), c.return = t, r.return = t, r.sibling = c, t.child = r, ic(null, r), r = t.child, c = e.child.memoizedState, c === null ? c = hc(n) : (i = c.cachePool, i === null ? i = ma() : (l = ea._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), c = {
			baseLanes: c.baseLanes | n,
			cachePool: i
		}), r.memoizedState = c, r.childLanes = gc(e, o, n), t.memoizedState = mc, ic(e.child, r)) : (Qa(t), n = e.child, e = n.sibling, n = ii(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function vc(e, t) {
		return t = yc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function yc(e, t) {
		return e = ni(22, e, null, t), e.lanes = 0, e;
	}
	function bc(e, t, n) {
		return ja(t, e.child, null, n), e = vc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function xc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Wi(e.return, t, n);
	}
	function Sc(e, t, n, r, i, a) {
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
	function Cc(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = ro.current, s = (o & 2) != 0;
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, z(ro, o), $s(e, t, r, n), r = G ? gi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && xc(e, n, t);
			else if (e.tag === 19) xc(e, n, t);
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
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && io(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), Sc(t, !1, i, n, a, r);
				break;
			case "backwards":
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && io(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				Sc(t, !0, n, null, a, r);
				break;
			case "together":
				Sc(t, !1, null, null, void 0, r);
				break;
			default: t.memoizedState = null;
		}
		return t.child;
	}
	function wc(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), Wl |= t.lanes, (n & t.childLanes) === 0) if (e !== null) {
			if (Ki(e, t, n, !1), (n & t.childLanes) === 0) return null;
		} else return null;
		if (e !== null && t.child !== e.child) throw Error(s(153));
		if (t.child !== null) {
			for (e = t.child, n = ii(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ii(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function Tc(e, t) {
		return (e.lanes & t) === 0 ? (e = e.dependencies, !!(e !== null && qi(e))) : !0;
	}
	function Ec(e, t, n) {
		switch (t.tag) {
			case 3:
				oe(t, t.stateNode.containerInfo), Hi(t, ea, e.memoizedState.cache), Ii();
				break;
			case 27:
			case 5:
				se(t);
				break;
			case 4:
				oe(t, t.stateNode.containerInfo);
				break;
			case 10:
				Hi(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, $a(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (Qa(t), e = wc(e, t, n), e === null ? null : e.sibling) : _c(e, t, n) : (Qa(t), t.flags |= 128, null);
				Qa(t);
				break;
			case 19:
				var i = (e.flags & 128) != 0;
				if (r = (n & t.childLanes) !== 0, r ||= (Ki(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return Cc(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), z(ro, ro.current), r) break;
				return null;
			case 22: return t.lanes = 0, rc(e, t, n, t.pendingProps);
			case 24: Hi(t, ea, e.memoizedState.cache);
		}
		return wc(e, t, n);
	}
	function Dc(e, t, n) {
		if (e !== null) if (e.memoizedProps !== t.pendingProps) Qs = !0;
		else {
			if (!Tc(e, n) && !(t.flags & 128)) return Qs = !1, Ec(e, t, n);
			Qs = !!(e.flags & 131072);
		}
		else Qs = !1, G && t.flags & 1048576 && Ci(t, gi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = xa(t.elementType), t.type = e, typeof e == "function") ri(e) ? (r = Vs(e, r), t.tag = 1, t = fc(null, t, e, r, n)) : (t.tag = 0, t = uc(null, t, e, r, n));
					else {
						if (e != null) {
							var i = e.$$typeof;
							if (i === w) {
								t.tag = 11, t = ec(null, t, e, r, n);
								break a;
							} else if (i === D) {
								t.tag = 14, t = tc(null, t, e, r, n);
								break a;
							}
						}
						throw t = M(e) || e, Error(s(306, t, ""));
					}
				}
				return t;
			case 0: return uc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, i = Vs(r, t.pendingProps), fc(e, t, r, i, n);
			case 3:
				a: {
					if (oe(t, t.stateNode.containerInfo), e === null) throw Error(s(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, Fa(e, t), Ha(t, r, null, n);
					var o = t.memoizedState;
					if (r = o.cache, Hi(t, ea, r), r !== a.cache && Gi(t, [ea], n, !0), Va(), r = o.element, a.isDehydrated) if (a = {
						element: r,
						isDehydrated: !1,
						cache: o.cache
					}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
						t = pc(e, t, r, n);
						break a;
					} else if (r !== i) {
						i = fi(Error(s(424)), t), Ri(i), t = pc(e, t, r, n);
						break a;
					} else {
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (Oi = lf(e.firstChild), Di = t, G = !0, ki = null, Ai = !0, n = Ma(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					}
					else {
						if (Ii(), r === i) {
							t = wc(e, t, n);
							break a;
						}
						$s(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return lc(e, t), e === null ? (n = Af(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : G || (n = t.type, e = t.pendingProps, r = Vd(B.current).createElement(n), r[tt] = t, r[nt] = e, Fd(r, n, e), mt(r), t.stateNode = r) : t.memoizedState = Af(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return se(t), e === null && G && (r = t.stateNode = pf(t.type, t.pendingProps, B.current), Di = t, Ai = !0, i = Oi, Qd(t.type) ? (uf = i, Oi = lf(r.firstChild)) : Oi = i), $s(e, t, t.pendingProps.children, n), lc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && G && ((i = r = Oi) && (r = nf(r, t.type, t.pendingProps, Ai), r === null ? i = !1 : (t.stateNode = r, Di = t, Oi = lf(r.firstChild), Ai = !1, i = !0)), i || Mi(t)), se(t), i = t.type, a = t.pendingProps, o = e === null ? null : e.memoizedProps, r = a.children, Wd(i, a) ? r = null : o !== null && Wd(i, o) && (t.flags |= 32), t.memoizedState !== null && (i = vo(e, t, xo, null, null, n), Qf._currentValue = i), lc(e, t), $s(e, t, r, n), t.child;
			case 6: return e === null && G && ((e = n = Oi) && (n = rf(n, t.pendingProps, Ai), n === null ? e = !1 : (t.stateNode = n, Di = t, Oi = null, e = !0)), e || Mi(t)), null;
			case 13: return _c(e, t, n);
			case 4: return oe(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = ja(t, null, r, n) : $s(e, t, r, n), t.child;
			case 11: return ec(e, t, t.type, t.pendingProps, n);
			case 7: return $s(e, t, t.pendingProps, n), t.child;
			case 8: return $s(e, t, t.pendingProps.children, n), t.child;
			case 12: return $s(e, t, t.pendingProps.children, n), t.child;
			case 10: return r = t.pendingProps, Hi(t, t.type, r.value), $s(e, t, r.children, n), t.child;
			case 9: return i = t.type._context, r = t.pendingProps.children, Ji(t), i = Yi(i), r = r(i), t.flags |= 1, $s(e, t, r, n), t.child;
			case 14: return tc(e, t, t.type, t.pendingProps, n);
			case 15: return nc(e, t, t.type, t.pendingProps, n);
			case 19: return Cc(e, t, n);
			case 31: return cc(e, t, n);
			case 22: return rc(e, t, n, t.pendingProps);
			case 24: return Ji(t), r = Yi(ea), e === null ? (i = fa(), i === null && (i = Il, a = ta(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, Pa(t), Hi(t, ea, i)) : ((e.lanes & n) !== 0 && (Fa(e, t), Ha(t, null, null, n), Va()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, Hi(t, ea, r), r !== i.cache && Gi(t, [ea], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), Hi(t, ea, r))), $s(e, t, t.pendingProps.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(s(156, t.tag));
	}
	function Oc(e) {
		e.flags |= 4;
	}
	function kc(e, t, n, r, i) {
		if ((t = (e.mode & 32) != 0) && (t = !1), t) {
			if (e.flags |= 16777216, (i & 335544128) === i) if (e.stateNode.complete) e.flags |= 8192;
			else if (Cu()) e.flags |= 8192;
			else throw Sa = va, ga;
		} else e.flags &= -16777217;
	}
	function Ac(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Wf(t)) if (Cu()) e.flags |= 8192;
		else throw Sa = va, ga;
	}
	function jc(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : Ue(), e.lanes |= t, Jl |= t);
	}
	function Mc(e, t) {
		if (!G) switch (e.tailMode) {
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
	function Nc(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 65011712, r |= i.flags & 65011712, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function Pc(e, t, n) {
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
			case 14: return Nc(t), null;
			case 1: return Nc(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Ui(ea), H(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Fi(t) ? Oc(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Li())), Nc(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (Oc(t), a === null ? (Nc(t), kc(t, i, null, r, n)) : (Nc(t), Ac(t, a))) : a ? a === e.memoizedState ? (Nc(t), t.flags &= -16777217) : (Oc(t), Nc(t), Ac(t, a)) : (e = e.memoizedProps, e !== r && Oc(t), Nc(t), kc(t, i, e, r, n)), null;
			case 27:
				if (ce(t), n = B.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Oc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Nc(t), null;
					}
					e = ie.current, Fi(t) ? Ni(t, e) : (e = pf(i, r, n), t.stateNode = e, Oc(t));
				}
				return Nc(t), null;
			case 5:
				if (ce(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Oc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Nc(t), null;
					}
					if (a = ie.current, Fi(t)) Ni(t, a);
					else {
						var o = Vd(B.current);
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
						a[tt] = t, a[nt] = r;
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
						r && Oc(t);
					}
				}
				return Nc(t), kc(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && Oc(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(s(166));
					if (e = B.current, Fi(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = Di, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[tt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || Md(e.nodeValue, n)), e || Mi(t, !0);
					} else e = Vd(e).createTextNode(r), e[tt] = t, t.stateNode = e;
				}
				return Nc(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Fi(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(s(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(557));
							e[tt] = t;
						} else Ii(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Nc(t), e = !1;
					} else n = Li(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (no(t), t) : (no(t), null);
					if (t.flags & 128) throw Error(s(558));
				}
				return Nc(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = Fi(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(s(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(s(317));
							i[tt] = t;
						} else Ii(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Nc(t), i = !1;
					} else i = Li(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (no(t), t) : (no(t), null);
				}
				return no(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), jc(t, t.updateQueue), Nc(t), null);
			case 4: return H(), e === null && Sd(t.stateNode.containerInfo), Nc(t), null;
			case 10: return Ui(t.type), Nc(t), null;
			case 19:
				if (R(ro), r = t.memoizedState, r === null) return Nc(t), null;
				if (i = (t.flags & 128) != 0, a = r.rendering, a === null) if (i) Mc(r, !1);
				else {
					if (Ul !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
						if (a = io(e), a !== null) {
							for (t.flags |= 128, Mc(r, !1), e = a.updateQueue, t.updateQueue = e, jc(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) ai(n, e), n = n.sibling;
							return z(ro, ro.current & 1 | 2), G && Si(t, r.treeForkCount), t.child;
						}
						e = e.sibling;
					}
					r.tail !== null && xe() > eu && (t.flags |= 128, i = !0, Mc(r, !1), t.lanes = 4194304);
				}
				else {
					if (!i) if (e = io(a), e !== null) {
						if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, jc(t, e), Mc(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !G) return Nc(t), null;
					} else 2 * xe() - r.renderingStartTime > eu && n !== 536870912 && (t.flags |= 128, i = !0, Mc(r, !1), t.lanes = 4194304);
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (Nc(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = xe(), e.sibling = null, n = ro.current, z(ro, i ? n & 1 | 2 : n & 1), G && Si(t, r.treeForkCount), e);
			case 22:
			case 23: return no(t), Ya(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (Nc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Nc(t), n = t.updateQueue, n !== null && jc(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && R(da), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Ui(ea), Nc(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(s(156, t.tag));
	}
	function Fc(e, t) {
		switch (Ti(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Ui(ea), H(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return ce(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (no(t), t.alternate === null) throw Error(s(340));
					Ii();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (no(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(s(340));
					Ii();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return R(ro), null;
			case 4: return H(), null;
			case 10: return Ui(t.type), null;
			case 22:
			case 23: return no(t), Ya(), e !== null && R(da), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Ui(ea), null;
			case 25: return null;
			default: return null;
		}
	}
	function Ic(e, t) {
		switch (Ti(t), t.tag) {
			case 3:
				Ui(ea), H();
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
				t.memoizedState !== null && no(t);
				break;
			case 13:
				no(t);
				break;
			case 19:
				R(ro);
				break;
			case 10:
				Ui(t.type);
				break;
			case 22:
			case 23:
				no(t), Ya(), e !== null && R(da);
				break;
			case 24: Ui(ea);
		}
	}
	function Lc(e, t) {
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
	function Rc(e, t, n) {
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
	function zc(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Wa(t, n);
			} catch (t) {
				Wu(e, e.return, t);
			}
		}
	}
	function Bc(e, t, n) {
		n.props = Vs(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Wu(e, t, n);
		}
	}
	function Vc(e, t) {
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
	function Hc(e, t) {
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
	function Uc(e) {
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
	function Wc(e, t, n) {
		try {
			var r = e.stateNode;
			Id(r, e.type, n, t), r[nt] = t;
		} catch (t) {
			Wu(e, e.return, t);
		}
	}
	function Gc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Qd(e.type) || e.tag === 4;
	}
	function Kc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Gc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Qd(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function qc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Jt));
		else if (r !== 4 && (r === 27 && Qd(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null)) for (qc(e, t, n), e = e.sibling; e !== null;) qc(e, t, n), e = e.sibling;
	}
	function Jc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (r === 27 && Qd(e.type) && (n = e.stateNode), e = e.child, e !== null)) for (Jc(e, t, n), e = e.sibling; e !== null;) Jc(e, t, n), e = e.sibling;
	}
	function Yc(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			Fd(t, r, n), t[tt] = e, t[nt] = n;
		} catch (t) {
			Wu(e, e.return, t);
		}
	}
	var Xc = !1, Zc = !1, Qc = !1, $c = typeof WeakSet == "function" ? WeakSet : Set, el = null;
	function tl(e, t) {
		if (e = e.containerInfo, zd = sp, e = xr(e), Sr(e)) {
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
		}, sp = !1, el = t; el !== null;) if (t = el, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, el = e;
		else for (; el !== null;) {
			switch (t = el, a = t.alternate, e = t.flags, t.tag) {
				case 0:
					if (e & 4 && (e = t.updateQueue, e = e === null ? null : e.events, e !== null)) for (n = 0; n < e.length; n++) i = e[n], i.ref.impl = i.nextImpl;
					break;
				case 11:
				case 15: break;
				case 1:
					if (e & 1024 && a !== null) {
						e = void 0, n = t, i = a.memoizedProps, a = a.memoizedState, r = n.stateNode;
						try {
							var h = Vs(n.type, i);
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
				e.return = t.return, el = e;
				break;
			}
			el = t.return;
		}
	}
	function nl(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				_l(e, n), r & 4 && Lc(5, n);
				break;
			case 1:
				if (_l(e, n), r & 4) if (e = n.stateNode, t === null) try {
					e.componentDidMount();
				} catch (e) {
					Wu(n, n.return, e);
				}
				else {
					var i = Vs(n.type, t.memoizedProps);
					t = t.memoizedState;
					try {
						e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
					} catch (e) {
						Wu(n, n.return, e);
					}
				}
				r & 64 && zc(n), r & 512 && Vc(n, n.return);
				break;
			case 3:
				if (_l(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						Wa(e, t);
					} catch (e) {
						Wu(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Yc(n);
			case 26:
			case 5:
				_l(e, n), t === null && r & 4 && Uc(n), r & 512 && Vc(n, n.return);
				break;
			case 12:
				_l(e, n);
				break;
			case 31:
				_l(e, n), r & 4 && cl(e, n);
				break;
			case 13:
				_l(e, n), r & 4 && ll(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = Ju.bind(null, n), cf(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || Xc, !r) {
					t = t !== null && t.memoizedState !== null || Zc, i = Xc;
					var a = Zc;
					Xc = r, (Zc = t) && !a ? yl(e, n, (n.subtreeFlags & 8772) != 0) : _l(e, n), Xc = i, Zc = a;
				}
				break;
			case 30: break;
			default: _l(e, n);
		}
	}
	function rl(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, rl(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && lt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var il = null, al = !1;
	function ol(e, t, n) {
		for (n = n.child; n !== null;) sl(e, t, n), n = n.sibling;
	}
	function sl(e, t, n) {
		if (je && typeof je.onCommitFiberUnmount == "function") try {
			je.onCommitFiberUnmount(Ae, n);
		} catch {}
		switch (n.tag) {
			case 26:
				Zc || Hc(n, t), ol(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				Zc || Hc(n, t);
				var r = il, i = al;
				Qd(n.type) && (il = n.stateNode, al = !1), ol(e, t, n), mf(n.stateNode), il = r, al = i;
				break;
			case 5: Zc || Hc(n, t);
			case 6:
				if (r = il, i = al, il = null, ol(e, t, n), il = r, al = i, il !== null) if (al) try {
					(il.nodeType === 9 ? il.body : il.nodeName === "HTML" ? il.ownerDocument.body : il).removeChild(n.stateNode);
				} catch (e) {
					Wu(n, t, e);
				}
				else try {
					il.removeChild(n.stateNode);
				} catch (e) {
					Wu(n, t, e);
				}
				break;
			case 18:
				il !== null && (al ? (e = il, $d(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Np(e)) : $d(il, n.stateNode));
				break;
			case 4:
				r = il, i = al, il = n.stateNode.containerInfo, al = !0, ol(e, t, n), il = r, al = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Rc(2, n, t), Zc || Rc(4, n, t), ol(e, t, n);
				break;
			case 1:
				Zc || (Hc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Bc(n, t, r)), ol(e, t, n);
				break;
			case 21:
				ol(e, t, n);
				break;
			case 22:
				Zc = (r = Zc) || n.memoizedState !== null, ol(e, t, n), Zc = r;
				break;
			default: ol(e, t, n);
		}
	}
	function cl(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Np(e);
			} catch (e) {
				Wu(t, t.return, e);
			}
		}
	}
	function ll(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Np(e);
		} catch (e) {
			Wu(t, t.return, e);
		}
	}
	function ul(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new $c()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new $c()), t;
			default: throw Error(s(435, e.tag));
		}
	}
	function dl(e, t) {
		var n = ul(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = Yu.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function fl(e, t) {
		var n = t.deletions;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r], a = e, o = t, c = o;
			a: for (; c !== null;) {
				switch (c.tag) {
					case 27:
						if (Qd(c.type)) {
							il = c.stateNode, al = !1;
							break a;
						}
						break;
					case 5:
						il = c.stateNode, al = !1;
						break a;
					case 3:
					case 4:
						il = c.stateNode.containerInfo, al = !0;
						break a;
				}
				c = c.return;
			}
			if (il === null) throw Error(s(160));
			sl(a, o, i), il = null, al = !1, a = i.alternate, a !== null && (a.return = null), i.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) ml(t, e), t = t.sibling;
	}
	var pl = null;
	function ml(e, t) {
		var n = e.alternate, r = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				fl(t, e), hl(e), r & 4 && (Rc(3, e, e.return), Lc(3, e), Rc(5, e, e.return));
				break;
			case 1:
				fl(t, e), hl(e), r & 512 && (Zc || n === null || Hc(n, n.return)), r & 64 && Xc && (e = e.updateQueue, e !== null && (r = e.callbacks, r !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? r : n.concat(r))));
				break;
			case 26:
				var i = pl;
				if (fl(t, e), hl(e), r & 512 && (Zc || n === null || Hc(n, n.return)), r & 4) {
					var a = n === null ? null : n.memoizedState;
					if (r = e.memoizedState, n === null) if (r === null) if (e.stateNode === null) {
						a: {
							r = e.type, n = e.memoizedProps, i = i.ownerDocument || i;
							b: switch (r) {
								case "title":
									a = i.getElementsByTagName("title")[0], (!a || a[ct] || a[tt] || a.namespaceURI === "http://www.w3.org/2000/svg" || a.hasAttribute("itemprop")) && (a = i.createElement(r), i.head.insertBefore(a, i.querySelector("head > title"))), Fd(a, r, n), a[tt] = e, mt(a), r = a;
									break a;
								case "link":
									var o = Vf("link", "href", i).get(r + (n.href || ""));
									if (o) {
										for (var c = 0; c < o.length; c++) if (a = o[c], a.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && a.getAttribute("rel") === (n.rel == null ? null : n.rel) && a.getAttribute("title") === (n.title == null ? null : n.title) && a.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
											o.splice(c, 1);
											break b;
										}
									}
									a = i.createElement(r), Fd(a, r, n), i.head.appendChild(a);
									break;
								case "meta":
									if (o = Vf("meta", "content", i).get(r + (n.content || ""))) {
										for (c = 0; c < o.length; c++) if (a = o[c], a.getAttribute("content") === (n.content == null ? null : "" + n.content) && a.getAttribute("name") === (n.name == null ? null : n.name) && a.getAttribute("property") === (n.property == null ? null : n.property) && a.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && a.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
											o.splice(c, 1);
											break b;
										}
									}
									a = i.createElement(r), Fd(a, r, n), i.head.appendChild(a);
									break;
								default: throw Error(s(468, r));
							}
							a[tt] = e, mt(a), r = a;
						}
						e.stateNode = r;
					} else Hf(i, e.type, e.stateNode);
					else e.stateNode = Lf(i, r, e.memoizedProps);
					else a === r ? r === null && e.stateNode !== null && Wc(e, e.memoizedProps, n.memoizedProps) : (a === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : a.count--, r === null ? Hf(i, e.type, e.stateNode) : Lf(i, r, e.memoizedProps));
				}
				break;
			case 27:
				fl(t, e), hl(e), r & 512 && (Zc || n === null || Hc(n, n.return)), n !== null && r & 4 && Wc(e, e.memoizedProps, n.memoizedProps);
				break;
			case 5:
				if (fl(t, e), hl(e), r & 512 && (Zc || n === null || Hc(n, n.return)), e.flags & 32) {
					i = e.stateNode;
					try {
						Bt(i, "");
					} catch (t) {
						Wu(e, e.return, t);
					}
				}
				r & 4 && e.stateNode != null && (i = e.memoizedProps, Wc(e, i, n === null ? i : n.memoizedProps)), r & 1024 && (Qc = !0);
				break;
			case 6:
				if (fl(t, e), hl(e), r & 4) {
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
				if (Bf = null, i = pl, pl = _f(t.containerInfo), fl(t, e), pl = i, hl(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					Np(t.containerInfo);
				} catch (t) {
					Wu(e, e.return, t);
				}
				Qc && (Qc = !1, gl(e));
				break;
			case 4:
				r = pl, pl = _f(e.stateNode.containerInfo), fl(t, e), hl(e), pl = r;
				break;
			case 12:
				fl(t, e), hl(e);
				break;
			case 31:
				fl(t, e), hl(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, dl(e, r)));
				break;
			case 13:
				fl(t, e), hl(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Ql = xe()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, dl(e, r)));
				break;
			case 22:
				i = e.memoizedState !== null;
				var l = n !== null && n.memoizedState !== null, u = Xc, d = Zc;
				if (Xc = u || i, Zc = d || l, fl(t, e), Zc = d, Xc = u, hl(e), r & 8192) a: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || l || Xc || Zc || vl(e)), n = null, t = e;;) {
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
				r & 4 && (r = e.updateQueue, r !== null && (n = r.retryQueue, n !== null && (r.retryQueue = null, dl(e, n))));
				break;
			case 19:
				fl(t, e), hl(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, dl(e, r)));
				break;
			case 30: break;
			case 21: break;
			default: fl(t, e), hl(e);
		}
	}
	function hl(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Gc(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				if (n == null) throw Error(s(160));
				switch (n.tag) {
					case 27:
						var i = n.stateNode;
						Jc(e, Kc(e), i);
						break;
					case 5:
						var a = n.stateNode;
						n.flags & 32 && (Bt(a, ""), n.flags &= -33), Jc(e, Kc(e), a);
						break;
					case 3:
					case 4:
						var o = n.stateNode.containerInfo;
						qc(e, Kc(e), o);
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
	function gl(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			gl(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
		}
	}
	function _l(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) nl(e, t.alternate, t), t = t.sibling;
	}
	function vl(e) {
		for (e = e.child; e !== null;) {
			var t = e;
			switch (t.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Rc(4, t, t.return), vl(t);
					break;
				case 1:
					Hc(t, t.return);
					var n = t.stateNode;
					typeof n.componentWillUnmount == "function" && Bc(t, t.return, n), vl(t);
					break;
				case 27: mf(t.stateNode);
				case 26:
				case 5:
					Hc(t, t.return), vl(t);
					break;
				case 22:
					t.memoizedState === null && vl(t);
					break;
				case 30:
					vl(t);
					break;
				default: vl(t);
			}
			e = e.sibling;
		}
	}
	function yl(e, t, n) {
		for (n &&= (t.subtreeFlags & 8772) != 0, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags;
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					yl(i, a, n), Lc(4, a);
					break;
				case 1:
					if (yl(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Wu(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var s = r.stateNode;
						try {
							var c = i.shared.hiddenCallbacks;
							if (c !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < c.length; i++) Ua(c[i], s);
						} catch (e) {
							Wu(r, r.return, e);
						}
					}
					n && o & 64 && zc(a), Vc(a, a.return);
					break;
				case 27: Yc(a);
				case 26:
				case 5:
					yl(i, a, n), n && r === null && o & 4 && Uc(a), Vc(a, a.return);
					break;
				case 12:
					yl(i, a, n);
					break;
				case 31:
					yl(i, a, n), n && o & 4 && cl(i, a);
					break;
				case 13:
					yl(i, a, n), n && o & 4 && ll(i, a);
					break;
				case 22:
					a.memoizedState === null && yl(i, a, n), Vc(a, a.return);
					break;
				case 30: break;
				default: yl(i, a, n);
			}
			t = t.sibling;
		}
	}
	function bl(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && na(n));
	}
	function xl(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && na(e));
	}
	function Sl(e, t, n, r) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) Cl(e, t, n, r), t = t.sibling;
	}
	function Cl(e, t, n, r) {
		var i = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				Sl(e, t, n, r), i & 2048 && Lc(9, t);
				break;
			case 1:
				Sl(e, t, n, r);
				break;
			case 3:
				Sl(e, t, n, r), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && na(e)));
				break;
			case 12:
				if (i & 2048) {
					Sl(e, t, n, r), e = t.stateNode;
					try {
						var a = t.memoizedProps, o = a.id, s = a.onPostCommit;
						typeof s == "function" && s(o, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0);
					} catch (e) {
						Wu(t, t.return, e);
					}
				} else Sl(e, t, n, r);
				break;
			case 31:
				Sl(e, t, n, r);
				break;
			case 13:
				Sl(e, t, n, r);
				break;
			case 23: break;
			case 22:
				a = t.stateNode, o = t.alternate, t.memoizedState === null ? a._visibility & 2 ? Sl(e, t, n, r) : (a._visibility |= 2, wl(e, t, n, r, (t.subtreeFlags & 10256) != 0 || !1)) : a._visibility & 2 ? Sl(e, t, n, r) : Tl(e, t), i & 2048 && bl(o, t);
				break;
			case 24:
				Sl(e, t, n, r), i & 2048 && xl(t.alternate, t);
				break;
			default: Sl(e, t, n, r);
		}
	}
	function wl(e, t, n, r, i) {
		for (i &&= (t.subtreeFlags & 10256) != 0 || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					wl(a, o, s, c, i), Lc(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, wl(a, o, s, c, i)) : u._visibility & 2 ? wl(a, o, s, c, i) : Tl(a, o), i && l & 2048 && bl(o.alternate, o);
					break;
				case 24:
					wl(a, o, s, c, i), i && l & 2048 && xl(o.alternate, o);
					break;
				default: wl(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Tl(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Tl(n, r), i & 2048 && bl(r.alternate, r);
					break;
				case 24:
					Tl(n, r), i & 2048 && xl(r.alternate, r);
					break;
				default: Tl(n, r);
			}
			t = t.sibling;
		}
	}
	var El = 8192;
	function Dl(e, t, n) {
		if (e.subtreeFlags & El) for (e = e.child; e !== null;) Ol(e, t, n), e = e.sibling;
	}
	function Ol(e, t, n) {
		switch (e.tag) {
			case 26:
				Dl(e, t, n), e.flags & El && e.memoizedState !== null && Gf(n, pl, e.memoizedState, e.memoizedProps);
				break;
			case 5:
				Dl(e, t, n);
				break;
			case 3:
			case 4:
				var r = pl;
				pl = _f(e.stateNode.containerInfo), Dl(e, t, n), pl = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = El, El = 16777216, Dl(e, t, n), El = r) : Dl(e, t, n));
				break;
			default: Dl(e, t, n);
		}
	}
	function kl(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Al(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				el = r, Nl(r, e);
			}
			kl(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) jl(e), e = e.sibling;
	}
	function jl(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Al(e), e.flags & 2048 && Rc(9, e, e.return);
				break;
			case 3:
				Al(e);
				break;
			case 12:
				Al(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Ml(e)) : Al(e);
				break;
			default: Al(e);
		}
	}
	function Ml(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				el = r, Nl(r, e);
			}
			kl(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Rc(8, t, t.return), Ml(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Ml(t));
					break;
				default: Ml(t);
			}
			e = e.sibling;
		}
	}
	function Nl(e, t) {
		for (; el !== null;) {
			var n = el;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					Rc(8, n, t);
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
			if (r = n.child, r !== null) r.return = n, el = r;
			else a: for (n = e; el !== null;) {
				r = el;
				var i = r.sibling, a = r.return;
				if (rl(r), r === n) {
					el = null;
					break a;
				}
				if (i !== null) {
					i.return = a, el = i;
					break a;
				}
				el = a;
			}
		}
	}
	var Pl = {
		getCacheForType: function(e) {
			var t = Yi(ea), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Yi(ea).controller.signal;
		}
	}, Fl = typeof WeakMap == "function" ? WeakMap : Map, Y = 0, Il = null, X = null, Z = 0, Ll = 0, Rl = null, zl = !1, Bl = !1, Vl = !1, Hl = 0, Ul = 0, Wl = 0, Gl = 0, Kl = 0, ql = 0, Jl = 0, Yl = null, Xl = null, Zl = !1, Ql = 0, $l = 0, eu = Infinity, tu = null, nu = null, ru = 0, iu = null, au = null, ou = 0, su = 0, cu = null, lu = null, uu = 0, du = null;
	function fu() {
		return Y & 2 && Z !== 0 ? Z & -Z : N.T === null ? Qe() : dd();
	}
	function pu() {
		if (ql === 0) if (!(Z & 536870912) || G) {
			var e = Le;
			Le <<= 1, !(Le & 3932160) && (Le = 262144), ql = e;
		} else ql = 536870912;
		return e = Xa.current, e !== null && (e.flags |= 32), ql;
	}
	function mu(e, t, n) {
		(e === Il && (Ll === 2 || Ll === 9) || e.cancelPendingCommit !== null) && (xu(e, 0), vu(e, Z, ql, !1)), Ge(e, n), (!(Y & 2) || e !== Il) && (e === Il && (!(Y & 2) && (Gl |= n), Ul === 4 && vu(e, Z, ql, !1)), rd(e));
	}
	function hu(e, t, n) {
		if (Y & 6) throw Error(s(327));
		var r = !n && (t & 127) == 0 && (t & e.expiredLanes) === 0 || Ve(e, t), i = r ? ku(e, t) : Du(e, t, !0), a = r;
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
					if ((t & 62914560) === t && (i = Ql + 300 - xe(), 10 < i)) {
						if (vu(r, t, ql, !zl), Be(r, 0, !0) !== 0) break a;
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
				unsuspend: Jt
			}, Ol(t, a, d);
			var m = (a & 62914560) === a ? Ql - xe() : (a & 4194048) === a ? $l - xe() : 0;
			if (m = qf(d, m), m !== null) {
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
	function vu(e, t, n, r) {
		t &= ~Kl, t &= ~Gl, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - Ne(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && qe(e, n, t);
	}
	function yu() {
		return Y & 6 ? !0 : (id(0, !1), !1);
	}
	function bu() {
		if (X !== null) {
			if (Ll === 0) var e = X.return;
			else e = X, Vi = Bi = null, wo(e), Ta = null, Ea = 0, e = X;
			for (; e !== null;) Ic(e.alternate, e), e = e.return;
			X = null;
		}
	}
	function xu(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, Jd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), ou = 0, bu(), Il = e, X = n = ii(e.current, null), Z = t, Ll = 0, Rl = null, zl = !1, Bl = Ve(e, t), Vl = !1, Jl = ql = Kl = Gl = Wl = Ul = 0, Xl = Yl = null, Zl = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - Ne(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Hl = t, Jr(), n;
	}
	function Su(e, t) {
		q = null, N.H = Ns, t === ha || t === _a ? (t = Ca(), Ll = 3) : t === ga ? (t = Ca(), Ll = 4) : Ll = t === Zs ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Rl = t, X === null && (Ul = 1, Gs(e, fi(t, e.current)));
	}
	function Cu() {
		var e = Xa.current;
		return e === null ? !0 : (Z & 4194048) === Z ? Za === null : (Z & 62914560) === Z || Z & 536870912 ? e === Za : !1;
	}
	function wu() {
		var e = N.H;
		return N.H = Ns, e === null ? Ns : e;
	}
	function Tu() {
		var e = N.A;
		return N.A = Pl, e;
	}
	function Eu() {
		Ul = 4, zl || (Z & 4194048) !== Z && Xa.current !== null || (Bl = !0), !(Wl & 134217727) && !(Gl & 134217727) || Il === null || vu(Il, Z, ql, !1);
	}
	function Du(e, t, n) {
		var r = Y;
		Y |= 2;
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
							Xa.current === null && (t = !0);
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
		return t && e.shellSuspendCounter++, Vi = Bi = null, Y = r, N.H = i, N.A = a, X === null && (Il = null, Z = 0, Jr()), o;
	}
	function Ou() {
		for (; X !== null;) ju(X);
	}
	function ku(e, t) {
		var n = Y;
		Y |= 2;
		var r = wu(), i = Tu();
		Il !== e || Z !== t ? (tu = null, eu = xe() + 500, xu(e, t)) : Bl = Ve(e, t);
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
							if (ya(a)) {
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
							ya(a) ? (Ll = 0, Rl = null, Mu(t)) : (Ll = 0, Rl = null, Nu(e, t, a, 7));
							break;
						case 5:
							var o = null;
							switch (X.tag) {
								case 26: o = X.memoizedState;
								case 5:
								case 27:
									var c = X;
									if (o ? Wf(o) : c.stateNode.complete) {
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
		return Vi = Bi = null, N.H = r, N.A = i, Y = n, X === null ? (Il = null, Z = 0, Jr(), Ul) : 0;
	}
	function Au() {
		for (; X !== null && !ye();) ju(X);
	}
	function ju(e) {
		var t = Dc(e.alternate, e, Hl);
		e.memoizedProps = e.pendingProps, t === null ? Pu(e) : X = t;
	}
	function Mu(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = dc(n, t, t.pendingProps, t.type, void 0, Z);
				break;
			case 11:
				t = dc(n, t, t.pendingProps, t.type.render, t.ref, Z);
				break;
			case 5: wo(t);
			default: Ic(n, t), t = X = ai(t, Hl), t = Dc(n, t, Hl);
		}
		e.memoizedProps = e.pendingProps, t === null ? Pu(e) : X = t;
	}
	function Nu(e, t, n, r) {
		Vi = Bi = null, wo(t), Ta = null, Ea = 0;
		var i = t.return;
		try {
			if (Xs(e, i, t, n, Z)) {
				Ul = 1, Gs(e, fi(n, e.current)), X = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw X = i, t;
			Ul = 1, Gs(e, fi(n, e.current)), X = null;
			return;
		}
		t.flags & 32768 ? (G || r === 1 ? e = !0 : Bl || Z & 536870912 ? e = !1 : (zl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Xa.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Fu(t, e)) : Pu(t);
	}
	function Pu(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				Fu(t, zl);
				return;
			}
			e = t.return;
			var n = Pc(t.alternate, t, Hl);
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
			var n = Fc(e.alternate, e);
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
		if (Y & 6) throw Error(s(327));
		if (t !== null) {
			if (t === e.current) throw Error(s(177));
			if (a = t.lanes | t.childLanes, a |= qr, Ke(e, n, a, o, c, l), e === Il && (X = Il = null, Z = 0), au = t, iu = e, ou = n, su = a, cu = i, lu = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Xu(Te, function() {
				return Hu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = (t.flags & 13878) != 0, t.subtreeFlags & 13878 || r) {
				r = N.T, N.T = null, i = P.p, P.p = 2, o = Y, Y |= 4;
				try {
					tl(e, t, n);
				} finally {
					Y = o, P.p = i, N.T = r;
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
				n = N.T, N.T = null;
				var r = P.p;
				P.p = 2;
				var i = Y;
				Y |= 4;
				try {
					ml(t, e);
					var a = Bd, o = xr(e.containerInfo), s = a.focusedElem, c = a.selectionRange;
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
					sp = !!zd, Bd = zd = null;
				} finally {
					Y = i, P.p = r, N.T = n;
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
				n = N.T, N.T = null;
				var r = P.p;
				P.p = 2;
				var i = Y;
				Y |= 4;
				try {
					nl(e, t.alternate, t);
				} finally {
					Y = i, P.p = r, N.T = n;
				}
			}
			ru = 3;
		}
	}
	function zu() {
		if (ru === 4 || ru === 3) {
			ru = 0, be();
			var e = iu, t = au, n = ou, r = lu;
			t.subtreeFlags & 10256 || t.flags & 10256 ? ru = 5 : (ru = 0, au = iu = null, Bu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (nu = null), Ze(n), t = t.stateNode, je && typeof je.onCommitFiberRoot == "function") try {
				je.onCommitFiberRoot(Ae, t, void 0, (t.current.flags & 128) == 128);
			} catch {}
			if (r !== null) {
				t = N.T, i = P.p, P.p = 2, N.T = null;
				try {
					for (var a = e.onRecoverableError, o = 0; o < r.length; o++) {
						var s = r[o];
						a(s.value, { componentStack: s.stack });
					}
				} finally {
					N.T = t, P.p = i;
				}
			}
			ou & 3 && Vu(), rd(e), i = e.pendingLanes, n & 261930 && i & 42 ? e === du ? uu++ : (uu = 0, du = e) : uu = 0, id(0, !1);
		}
	}
	function Bu(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, na(t)));
	}
	function Vu() {
		return Lu(), Ru(), zu(), Hu();
	}
	function Hu() {
		if (ru !== 5) return !1;
		var e = iu, t = su;
		su = 0;
		var n = Ze(ou), r = N.T, i = P.p;
		try {
			P.p = 32 > n ? 32 : n, N.T = null, n = cu, cu = null;
			var a = iu, o = ou;
			if (ru = 0, au = iu = null, ou = 0, Y & 6) throw Error(s(331));
			var c = Y;
			if (Y |= 4, jl(a.current), Cl(a, a.current, o, n), Y = c, id(0, !1), je && typeof je.onPostCommitFiberRoot == "function") try {
				je.onPostCommitFiberRoot(Ae, a);
			} catch {}
			return !0;
		} finally {
			P.p = i, N.T = r, Bu(e, t);
		}
	}
	function Uu(e, t, n) {
		t = fi(n, t), t = qs(e.stateNode, t, 2), e = La(e, t, 2), e !== null && (Ge(e, 2), rd(e));
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
					e = fi(n, e), n = Js(2), r = La(t, n, 2), r !== null && (Ys(n, r, t, e), Ge(r, 2), rd(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function Gu(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Fl();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (Vl = !0, i.add(n), e = Ku.bind(null, e, t, n), t.then(e, e));
	}
	function Ku(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Il === e && (Z & n) === n && (Ul === 4 || Ul === 3 && (Z & 62914560) === Z && 300 > xe() - Ql ? !(Y & 2) && xu(e, 0) : Kl |= n, Jl === Z && (Jl = 0)), rd(e);
	}
	function qu(e, t) {
		t === 0 && (t = Ue()), e = Zr(e, t), e !== null && (Ge(e, t), rd(e));
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
		return _e(e, t);
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
							a = (1 << 31 - Ne(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
						}
						a !== 0 && (n = !0, ld(r, a));
					} else a = Z, a = Be(r, r === Il ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || Ve(r, a) || (n = !0, ld(r, a));
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
		for (var t = xe(), n = null, r = Zu; r !== null;) {
			var i = r.next, a = sd(r, t);
			a === 0 ? (r.next = null, n === null ? Zu = i : n.next = i, i === null && (Qu = n)) : (n = r, (e !== 0 || a & 3) && (ed = !0)), r = i;
		}
		ru !== 0 && ru !== 5 || id(e, !1), nd !== 0 && (nd = 0);
	}
	function sd(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - Ne(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = He(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Il, n = Z, n = Be(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Ll === 2 || Ll === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && ve(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || Ve(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && ve(r), Ze(n)) {
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
			return r = cd.bind(null, e), n = _e(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && ve(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function cd(e, t) {
		if (ru !== 0 && ru !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Vu() && e.callbackNode !== n) return null;
		var r = Z;
		return r = Be(e, e === Il ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (hu(e, r, t), sd(e, xe()), e.callbackNode != null && e.callbackNode === n ? cd.bind(null, e) : null);
	}
	function ld(e, t) {
		if (Vu()) return null;
		hu(e, t, !0);
	}
	function ud() {
		Xd(function() {
			Y & 6 ? _e(Ce, ad) : od();
		});
	}
	function dd() {
		if (nd === 0) {
			var e = aa;
			e === 0 && (e = Ie, Ie <<= 1, !(Ie & 261888) && (Ie = 256)), nd = e;
		}
		return nd;
	}
	function fd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : qt("" + e);
	}
	function pd(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function md(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = fd((i[nt] || null).action), o = r.submitter;
			o && (t = (t = o[nt] || null) ? fd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new gn("action", "action", null, r, i);
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
	for (var hd = 0; hd < Hr.length; hd++) {
		var gd = Hr[hd];
		Ur(gd.toLowerCase(), "on" + (gd[0].toUpperCase() + gd.slice(1)));
	}
	Ur(Pr, "onAnimationEnd"), Ur(Fr, "onAnimationIteration"), Ur(Ir, "onAnimationStart"), Ur("dblclick", "onDoubleClick"), Ur("focusin", "onFocus"), Ur("focusout", "onBlur"), Ur(Lr, "onTransitionRun"), Ur(Rr, "onTransitionStart"), Ur(zr, "onTransitionCancel"), Ur(Br, "onTransitionEnd"), vt("onMouseEnter", ["mouseout", "mouseover"]), vt("onMouseLeave", ["mouseout", "mouseover"]), vt("onPointerEnter", ["pointerout", "pointerover"]), vt("onPointerLeave", ["pointerout", "pointerover"]), _t("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), _t("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), _t("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), _t("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), _t("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), _t("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
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
	function Q(e, t) {
		var n = t[it];
		n === void 0 && (n = t[it] = /* @__PURE__ */ new Set());
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
			e[xd] = !0, ht.forEach(function(t) {
				t !== "selectionchange" && (vd.has(t) || bd(t, !1, e), bd(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[xd] || (t[xd] = !0, bd("selectionchange", !1, t));
		}
	}
	function Cd(e, t, n, r) {
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
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = nn(m, p), g != null && d.push(Td(m, g, h))), f) break;
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
				x && (Un && n.locale !== "ko" && (Jn || x !== "onCompositionStart" ? x === "onCompositionEnd" && Jn && (b = un()) : (sn = i, cn = "value" in sn ? sn.value : sn.textContent, Jn = !0)), y = Ed(r, x), 0 < y.length && (x = new On(x, e, null, n, i), o.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = qn(n), b !== null && (x.data = b)))), (b = Hn ? Yn(e, n) : Xn(e, n)) && (x = Ed(r, "onBeforeInput"), 0 < x.length && (y = new On("onBeforeInput", "beforeinput", null, n, i), o.push({
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
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = nn(e, n), i != null && r.unshift(Td(e, i, a)), i = nn(e, t), i != null && r.push(Td(e, i, a))), e.tag === 3) return r;
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
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = nn(n, a), l != null && o.unshift(Td(n, l, c))) : i || (l = nn(n, a), l != null && o.push(Td(n, l, c)))), n = n.return;
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
				} else typeof a == "function" && (n === "formAction" ? (t !== "input" && Nd(e, t, "name", i.name, i, null), Nd(e, t, "formEncType", i.formEncType, i, null), Nd(e, t, "formMethod", i.formMethod, i, null), Nd(e, t, "formTarget", i.formTarget, i, null)) : (Nd(e, t, "encType", i.encType, i, null), Nd(e, t, "method", i.method, i, null), Nd(e, t, "target", i.target, i, null)));
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
				Q("beforetoggle", e), Q("toggle", e), Ct(e, "popover", r);
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
	function Pd(e, t, n, r, i, a) {
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
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
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
				if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), a = e[nt] || null, a = a == null ? null : a[n], typeof a == "function" && e.removeEventListener(t, a, i), typeof r == "function")) {
					typeof a != "function" && a !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, i);
					break a;
				}
				n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : Ct(e, n, r);
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
				Ft(e, a, c, l, u, o, i, !1);
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
				t = a, n = o, e.multiple = !!r, t == null ? n != null && Lt(e, !!r, n, !0) : Lt(e, !!r, t, !1);
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
				zt(e, r, i, a);
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
			default: if (Wt(t)) {
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
				Pt(e, o, c, l, u, d, a, i);
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
				t = c, n = o, r = m, p == null ? !!r != !!n && (t == null ? Lt(e, !!n, n ? [] : "", !1) : Lt(e, !!n, t, !0)) : Lt(e, !!n, p, !1);
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
				Rt(e, p, m);
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
			default: if (Wt(t)) {
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
					e.removeChild(i), Np(t);
					return;
				}
				r--;
			} else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&") r++;
			else if (n === "html") mf(e.ownerDocument.documentElement);
			else if (n === "head") {
				n = e.ownerDocument.head, mf(n);
				for (var a = n.firstChild; a;) {
					var o = a.nextSibling, s = a.nodeName;
					a[ct] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
				}
			} else n === "body" && mf(e.ownerDocument.body);
			n = i;
		} while (n);
		Np(t);
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
					tf(n), lt(n);
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
		lt(e);
	}
	var hf = /* @__PURE__ */ new Map(), gf = /* @__PURE__ */ new Set();
	function _f(e) {
		return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
	}
	var vf = P.d;
	P.d = {
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
		var t = dt(e);
		t !== null && t.tag === 5 && t.type === "form" ? xs(t) : vf.r(e);
	}
	var xf = typeof document > "u" ? null : document;
	function Sf(e, t, n) {
		var r = xf;
		if (r && typeof t == "string" && t) {
			var i = Nt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), gf.has(i) || (gf.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), Fd(t, "link", e), mt(t), r.head.appendChild(t)));
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
			var i = "link[rel=\"preload\"][as=\"" + Nt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + Nt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + Nt(n.imageSizes) + "\"]")) : i += "[href=\"" + Nt(e) + "\"]";
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
			}, n), hf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Mf(a)) || t === "script" && r.querySelector(If(a)) || (t = r.createElement("link"), Fd(t, "link", e), mt(t), r.head.appendChild(t)));
		}
	}
	function Ef(e, t) {
		vf.m(e, t);
		var n = xf;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + Nt(r) + "\"][href=\"" + Nt(e) + "\"]", a = i;
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
				r = n.createElement("link"), Fd(r, "link", e), mt(r), n.head.appendChild(r);
			}
		}
	}
	function Df(e, t, n) {
		vf.S(e, t, n);
		var r = xf;
		if (r && e) {
			var i = pt(r).hoistableStyles, a = jf(e);
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
					}, n), (n = hf.get(a)) && Rf(e, n);
					var c = o = r.createElement("link");
					mt(c), Fd(c, "link", e), c._p = new Promise(function(e, t) {
						c.onload = e, c.onerror = t;
					}), c.addEventListener("load", function() {
						s.loading |= 1;
					}), c.addEventListener("error", function() {
						s.loading |= 2;
					}), s.loading |= 4, $(o, t, r);
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
			var r = pt(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = h({
				src: e,
				async: !0
			}, t), (t = hf.get(i)) && zf(e, t), a = n.createElement("script"), mt(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
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
			var r = pt(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = h({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = hf.get(i)) && zf(e, t), a = n.createElement("script"), mt(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Af(e, t, n, r) {
		var i = (i = B.current) ? _f(i) : null;
		if (!i) throw Error(s(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = jf(n.href), n = pt(i).hoistableStyles, r = n.get(t), r || (r = {
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
					var a = pt(i).hoistableStyles, o = a.get(e);
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
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Ff(n), n = pt(i).hoistableScripts, r = n.get(t), r || (r = {
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
		return "href=\"" + Nt(e) + "\"";
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
		}), Fd(t, "link", n), mt(t), e.head.appendChild(t));
	}
	function Ff(e) {
		return "[src=\"" + Nt(e) + "\"]";
	}
	function If(e) {
		return "script[async]" + e;
	}
	function Lf(e, t, n) {
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
				return r = (e.ownerDocument || e).createElement("style"), mt(r), Fd(r, "style", i), $(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = jf(n.href);
				var a = e.querySelector(Mf(i));
				if (a) return t.state.loading |= 4, t.instance = a, mt(a), a;
				r = Nf(n), (i = hf.get(i)) && Rf(r, i), a = (e.ownerDocument || e).createElement("link"), mt(a);
				var o = a;
				return o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Fd(a, "link", r), t.state.loading |= 4, $(a, n.precedence, e), t.instance = a;
			case "script": return a = Ff(n.src), (i = e.querySelector(If(a))) ? (t.instance = i, mt(i), i) : (r = n, (i = hf.get(a)) && (r = h({}, n), zf(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), mt(i), Fd(i, "link", r), e.head.appendChild(i), t.instance = i);
			case "void": return null;
			default: throw Error(s(443, t.type));
		}
		else t.type === "stylesheet" && !(t.state.loading & 4) && (r = t.instance, t.state.loading |= 4, $(r, n.precedence, e));
		return t.instance;
	}
	function $(e, t, n) {
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
			if (!(a[ct] || a[tt] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
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
				var i = jf(r.href), a = t.querySelector(Mf(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Jf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, mt(a);
					return;
				}
				a = t.ownerDocument || t, r = Nf(r), (i = hf.get(i)) && Rf(r, i), a = a.createElement("link"), mt(a);
				var o = a;
				o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Fd(a, "link", r), n.instance = a;
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
			0 < e.imgBytes && Kf === 0 && (Kf = 62500 * Rd());
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
		_currentValue: re,
		_currentValue2: re,
		_threadCount: 0
	};
	function $f(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = We(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = We(0), this.hiddenUpdates = We(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function ep(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new $f(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = ni(3, null, null, t), e.current = a, a.stateNode = e, t = ta(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, Pa(a), e;
	}
	function tp(e) {
		return e ? (e = ei, e) : ei;
	}
	function np(e, t, n, r, i, a) {
		i = tp(i), r.context === null ? r.context = i : r.pendingContext = i, r = Ia(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = La(e, r, t), n !== null && (mu(n, e, t), Ra(n, e, t));
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
			t !== null && mu(t, e, 67108864), ip(e, 67108864);
		}
	}
	function op(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = fu();
			t = Xe(t);
			var n = Zr(e, t);
			n !== null && mu(n, e, t), ip(e, t);
		}
	}
	var sp = !0;
	function cp(e, t, n, r) {
		var i = N.T;
		N.T = null;
		var a = P.p;
		try {
			P.p = 2, up(e, t, n, r);
		} finally {
			P.p = a, N.T = i;
		}
	}
	function lp(e, t, n, r) {
		var i = N.T;
		N.T = null;
		var a = P.p;
		try {
			P.p = 8, up(e, t, n, r);
		} finally {
			P.p = a, N.T = i;
		}
	}
	function up(e, t, n, r) {
		if (sp) {
			var i = dp(r);
			if (i === null) wd(e, t, r, fp, n), Cp(e, r);
			else if (Tp(i, e, t, n, r)) r.stopPropagation();
			else if (Cp(e, r), t & 4 && -1 < Sp.indexOf(e)) {
				for (; i !== null;) {
					var a = dt(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = ze(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - Ne(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									rd(a), !(Y & 6) && (eu = xe() + 500, id(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Zr(a, 2), s !== null && mu(s, a, 2), yu(), ip(a, 2);
					}
					if (a = dp(r), a === null && wd(e, t, r, fp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else wd(e, t, r, null, n);
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
						e.blockedOn = t, $e(e.priority, function() {
							op(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = d(n), t !== null) {
						e.blockedOn = t, $e(e.priority, function() {
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
				a !== null && (e.splice(t, 3), t -= 3, ys(a, {
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
			var i = n[r], a = n[r + 1], o = i[nt] || null;
			if (typeof a == "function") o || Mp(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[nt] || null) s = o.formAction;
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
		np(n, fu(), e, t, null, null);
	}, Ip.prototype.unmount = Fp.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			np(e.current, 2, null, e, null, null), yu(), t[rt] = null;
		}
	};
	function Ip(e) {
		this._internalRoot = e;
	}
	Ip.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = Qe();
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
	P.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(s(188)) : (e = Object.keys(e).join(","), Error(s(268, e)));
		return e = p(t), e = e === null ? null : m(e), e = e === null ? null : e.stateNode, e;
	};
	var Rp = {
		bundleType: 0,
		version: "19.2.7",
		rendererPackageName: "react-dom",
		currentDispatcherRef: N,
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
		var n = !1, r = "", i = Hs, a = Us, o = Ws;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = ep(e, 1, !1, null, null, n, r, null, i, a, o, Pp), e[rt] = t.current, Sd(e), new Fp(t);
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
//#region src/components/Hand.tsx
var ee = (e) => T(e);
function j({ card: e, index: t, size: n, state: r, badge: i, cardTestId: a, cardInteraction: o, onCardClick: s, onCardPeek: c, peekActive: u, slotClassFor: d, dealSeatPlayerId: f, style: p }) {
	let [m, h] = (0, l.useState)(!1), v = o, y = v?.mode === "play", b = v?.mode === "draw-select", x = v?.mode === "peek", S = v?.isMyTurn === !0, C = !v?.legalPlayIndices || v.legalPlayIndices.includes(t), T = y && S && C && !v?.busy, E = y && !S && !!v?.allowPlayPreselect && C && !v?.busy, D = v?.playingIndex === t, O = y && S && !C && !v?.busy && !D, k = b && r === "draw-selected", A = b && r === "draw-recommended", ee = r === "play-recommended", j = !!v?.busy || D || y && !S && !E || b && !S, te = j || y && !C && !E || b && !S, M = w({
		disabled: j || !T && !E && !b && !x && !O,
		mode: O ? "draw-select" : v?.mode ?? "none",
		onPlay: T || E ? () => v?.onPlayCard?.(t) : void 0,
		onSelect: b && S ? () => v?.onSelectCard?.(t) : O ? () => v?.onIllegalPlay?.(t) : void 0,
		onPeekStart: x ? () => c?.(t) : void 0,
		onPeekEnd: x ? () => c?.(null) : void 0,
		onPressChange: h
	}), ne = !!v && (v?.mode !== "none" || O), N = y && S ? T ? a : "play-button-disabled" : a;
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: [
			"hand__slot",
			u ? "hand__slot--peek" : "",
			k ? "hand__slot--draw-selected" : "",
			A ? "hand__slot--draw-recommended" : "",
			ee ? "hand__slot--play-recommended" : "",
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
			onClick: !ne && s ? () => s(e, t) : void 0,
			onPlayClick: ne && T ? () => v?.onPlayCard?.(t) : void 0,
			pointerHandlers: ne ? M : void 0,
			pressed: m,
			playing: D,
			playable: T,
			illegalShake: v?.illegalShakeIndex === t,
			illegalFlash: v?.illegalFlashIndex === t,
			showPlayableHint: v?.showPlayableHint !== !1,
			disabled: j && (y || b) && !O,
			"data-testid": N,
			"data-card-index": t,
			"data-playable": y ? T ? "true" : "false" : void 0
		})
	});
}
function te({ cards: e, size: t = "md", stateFor: n, badgeFor: r, onCardClick: i, onCardPeek: a, peekIndex: o = null, fan: s = !1, cardTestId: c, cardInteraction: u, slotClassFor: d, dealSeatPlayerId: f = null }) {
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
				slotClassFor: d,
				dealSeatPlayerId: f
			}, ee(e)))
		})
	});
}
//#endregion
//#region src/table/animations/motionTokens.ts
var M = "power3.out", ne = "power2.inOut", N = "back.out(1.35)", P = {
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
function re(e = I()) {
	return e ? .35 : 1;
}
function F(e, t = I()) {
	return Math.max(.12, e * re(t));
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
function R(e, t) {
	e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t;
}
var z = {
	autoSleep: 120,
	force3D: "auto",
	nullTargetWarn: 1,
	units: { lineHeight: "" }
}, ie = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, ae, B, V, oe = 1e8, H = 1 / oe, se = Math.PI * 2, ce = se / 4, le = 0, ue = Math.sqrt, de = Math.cos, fe = Math.sin, pe = function(e) {
	return typeof e == "string";
}, me = function(e) {
	return typeof e == "function";
}, he = function(e) {
	return typeof e == "number";
}, ge = function(e) {
	return e === void 0;
}, _e = function(e) {
	return typeof e == "object";
}, ve = function(e) {
	return e !== !1;
}, ye = function() {
	return typeof window < "u";
}, be = function(e) {
	return me(e) || pe(e);
}, xe = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, Se = Array.isArray, Ce = /(?:-?\.?\d|\.)+/gi, we = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, Te = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, Ee = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, De = /[+-]=-?[.\d]+/, Oe = /[^,'"\[\]\s]+/gi, ke = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, Ae, je, Me, Ne, U = {}, Pe = {}, Fe, Ie = function(e) {
	return (Pe = pt(e, U)) && Nr;
}, Le = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, Re = function(e, t) {
	return !t && console.warn(e);
}, ze = function(e, t) {
	return e && (U[e] = t) && Pe && (Pe[e] = t) || U;
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
	if (_e(t) || me(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = Ze.length; r-- && !Ze[r].targetTest(t););
		n = Ze[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new Un(e[r], n))) || e.splice(r, 1);
	return e;
}, et = function(e) {
	return e._gsap || $e(Xt(e))[0]._gsap;
}, tt = function(e, t, n) {
	return (n = e[t]) && me(n) ? e[t]() : ge(n) && e.getAttribute && e.getAttribute(t) || n;
}, nt = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, rt = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, it = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, at = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, ot = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, st = function() {
	var e = Ge.length, t = Ge.slice(0), n, r;
	for (Ke = {}, Ge.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, ct = function(e, t, n, r) {
	Ge.length && !B && st(), e.render(t, n, r || B && t < 0 && (e._initted || e._startAt)), Ge.length && !B && st();
}, lt = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(Oe).length < 2 ? t : pe(e) ? e.trim() : e;
}, ut = function(e) {
	return e;
}, dt = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, ft = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, pt = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, mt = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = _e(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, ht = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, gt = function(e) {
	var t = e.parent || Ae, n = e.keyframes ? ft(Se(e.keyframes)) : dt;
	if (ve(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, _t = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, vt = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, yt = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, bt = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, xt = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, St = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, Ct = function(e, t, n, r) {
	return e._startAt && (B ? e._startAt.revert(He) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, wt = function e(t) {
	return !t || t._ts && e(t.parent);
}, Tt = function(e) {
	return e._repeat ? Et(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, Et = function(e, t) {
	var n = Math.floor(e = it(e / t));
	return e && n === e ? n - 1 : n;
}, Dt = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, Ot = function(e) {
	return e._end = it(e._start + (e._tDur / Math.abs(e._ts || e._rts || H) || 0));
}, kt = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = it(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), Ot(e), n._dirty || xt(n, e)), e;
}, At = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = Dt(e.rawTime(), t), (!t._dur || Wt(0, t.totalDuration(), n) - t._tTime > H) && t.render(n, !0)), xt(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -H;
	}
}, jt = function(e, t, n, r) {
	return t.parent && bt(t), t._start = it((he(n) ? n : n || e !== Ae ? Vt(e, n, t) : e._time) + t._delay), t._end = it(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), vt(e, t, "_first", "_last", e._sort ? "_start" : 0), Ft(t) || (e._recent = t), r || At(e, t), e._ts < 0 && kt(e, e._tTime), e;
}, Mt = function(e, t) {
	return (U.ScrollTrigger || Le("scrollTrigger", t)) && U.ScrollTrigger.create(t, e);
}, Nt = function(e, t, n, r, i) {
	if (Qn(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !B && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && qe !== kn.frame) return Ge.push(e), e._lazy = [i, r], 1;
}, Pt = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, Ft = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, It = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && Pt(e) && !(!e._initted && Ft(e)) || (e._ts < 0 || e._dp._ts < 0) && !Ft(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = Wt(0, e._tDur, t), l = Et(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== Et(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || B || r || e._zTime === H || !t && e._zTime) {
		if (!e._initted && Nt(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? H : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && Ct(e, t, n, !0), e._onUpdate && !n && mn(e, "onUpdate"), s && e._repeat && !n && e.parent && mn(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && bt(e, 1), !n && !B && (mn(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, Lt = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, Rt = function(e, t, n, r) {
	var i = e._repeat, a = it(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : it(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && kt(e, e._tTime = e._tDur * o), e.parent && Ot(e), n || xt(e.parent, e), e;
}, zt = function(e) {
	return e instanceof Gn ? xt(e) : Rt(e, e._dur);
}, Bt = {
	_start: 0,
	endTime: Be,
	totalDuration: Be
}, Vt = function e(t, n, r) {
	var i = t.labels, a = t._recent || Bt, o = t.duration() >= oe ? a.endTime(!1) : t._dur, s, c, l;
	return pe(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (Se(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, Ht = function(e, t, n) {
	var r = he(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = ve(s.vars.inherit) && s.parent;
		a.immediateRender = ve(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new ar(t[0], a, t[i + 1]);
}, Ut = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, Wt = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, Gt = function(e, t) {
	return !pe(e) || !(t = ke.exec(e)) ? "" : t[1];
}, Kt = function(e, t, n) {
	return Ut(n, function(n) {
		return Wt(e, t, n);
	});
}, qt = [].slice, Jt = function(e, t) {
	return e && _e(e) && "length" in e && (!t && !e.length || e.length - 1 in e && _e(e[0])) && !e.nodeType && e !== je;
}, Yt = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return pe(e) && !t || Jt(e, 1) ? (r = n).push.apply(r, Xt(e)) : n.push(e);
	}) || n;
}, Xt = function(e, t, n) {
	return V && !t && V.selector ? V.selector(e) : pe(e) && !n && (Me || !An()) ? qt.call((t || Ne).querySelectorAll(e), 0) : Se(e) ? Yt(e, n) : Jt(e) ? qt.call(e, 0) : e ? [e] : [];
}, Zt = function(e) {
	return e = Xt(e)[0] || Re("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return Xt(t, n.querySelectorAll ? n : n === e ? Re("Invalid scope") || Ne.createElement("div") : e);
	};
}, Qt = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, $t = function(e) {
	if (me(e)) return e;
	var t = _e(e) ? e : { each: e }, n = Rn(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
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
			r === "random" && Qt(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = Gt(t.amount || t.each) || 0, n = n && f < 0 ? In(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, it(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, en = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = it(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (he(n) ? 0 : Gt(n));
	};
}, tn = function(e, t) {
	var n = Se(e), r, i;
	return !n && _e(e) && (r = n = e.radius || oe, e.values ? (e = Xt(e.values), (i = !he(e[0])) && (r *= r)) : e = en(e.increment)), Ut(t, n ? me(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = oe, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || he(t) ? s : s + Gt(t);
	} : en(e));
}, nn = function(e, t, n, r) {
	return Ut(Se(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return Se(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, rn = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, an = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || Gt(n));
	};
}, on = function(e, t, n) {
	return dn(e, t, 0, 1, n);
}, sn = function(e, t, n) {
	return Ut(n, function(n) {
		return e[~~t(n)];
	});
}, cn = function e(t, n, r) {
	var i = n - t;
	return Se(t) ? sn(t, e(0, t.length), n) : Ut(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, ln = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return Se(t) ? sn(t, e(0, t.length - 1), n) : Ut(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, un = function(e) {
	for (var t = 0, n = "", r, i, a, o; ~(r = e.indexOf("random(", t));) a = e.indexOf(")", r), o = e.charAt(r + 7) === "[", i = e.substr(r + 7, a - r - 7).match(o ? Oe : Ce), n += e.substr(t, r - t) + nn(o ? i : +i[0], o ? 0 : +i[1], +i[2] || 1e-5), t = a + 1;
	return n + e.substr(t, e.length - t);
}, dn = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return Ut(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, fn = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = pe(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (Se(t) && !Se(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = pt(Se(t) ? [] : {}, t));
		if (!u) {
			for (c in n) qn.call(s, t, c, "get", n[c]);
			a = function(e) {
				return mr(e, s) || (o ? t.p : t);
			};
		}
	}
	return Ut(r, a);
}, pn = function(e, t, n) {
	var r = e.labels, i = oe, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, mn = function(e, t, n) {
	var r = e.vars, i = r[t], a = V, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && Ge.length && st(), o && (V = o), l = s ? i.apply(c, s) : i.call(c), V = a, l;
}, hn = function(e) {
	return bt(e), e.scrollTrigger && e.scrollTrigger.kill(!!B), e.progress() < 1 && mn(e, "onInterrupt"), e;
}, gn, _n = [], vn = function(e) {
	if (e) if (e = !e.name && e.default || e, ye() || e.headless) {
		var t = e.name, n = me(e), r = t && !n && e.init ? function() {
			this._props = [];
		} : e, i = {
			init: Be,
			render: mr,
			add: qn,
			kill: gr,
			modifier: hr,
			rawVars: 0
		}, a = {
			targetTest: 0,
			get: 0,
			getSetter: ur,
			aliases: {},
			register: 0
		};
		if (An(), e !== r) {
			if (Je[t]) return;
			dt(r, dt(ht(e, i), a)), pt(r.prototype, pt(i, ht(e, a))), Je[r.prop = t] = r, e.targetTest && (Ze.push(r), We[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
		}
		ze(t, r), e.register && e.register(Nr, r, yr);
	} else _n.push(e);
}, yn = 255, bn = {
	aqua: [
		0,
		yn,
		yn
	],
	lime: [
		0,
		yn,
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
		yn
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		yn,
		yn,
		yn
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		yn,
		yn,
		0
	],
	orange: [
		yn,
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
		yn,
		0,
		0
	],
	pink: [
		yn,
		192,
		203
	],
	cyan: [
		0,
		yn,
		yn
	],
	transparent: [
		yn,
		yn,
		yn,
		0
	]
}, xn = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * yn + .5 | 0;
}, Sn = function(e, t, n) {
	var r = e ? he(e) ? [
		e >> 16,
		e >> 8 & yn,
		e & yn
	] : 0 : bn.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), bn[e]) r = bn[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & yn,
				r & yn,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & yn,
				e & yn
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(Ce), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = xn(s + 1 / 3, i, a), r[1] = xn(s, i, a), r[2] = xn(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(we), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(Ce) || bn.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / yn, a = r[1] / yn, o = r[2] / yn, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, Cn = function(e) {
	var t = [], n = [], r = -1;
	return e.split(Tn).forEach(function(e) {
		var i = e.match(Te) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, wn = function(e, t, n) {
	var r = "", i = (e + r).match(Tn), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = Sn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = Cn(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(Tn, "1").split(Te), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(Tn), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, Tn = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in bn) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), En = /hsl[a]?\(/, Dn = function(e) {
	var t = e.join(" "), n;
	if (Tn.lastIndex = 0, Tn.test(t)) return n = En.test(t), e[1] = wn(e[1], n), e[0] = wn(e[0], n, Cn(e[1])), !0;
}, On, kn = function() {
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
			Fe && (!Me && ye() && (je = Me = window, Ne = je.document || {}, U.gsap = Nr, (je.gsapVersions ||= []).push(Nr.version), Ie(Pe || je.GreenSockGlobals || !je.gsap && je || {}), _n.forEach(vn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, On = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), On = 0, l = Be;
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
			return d.remove(e), s[n ? "unshift" : "push"](r), An(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), An = function() {
	return !On && kn.wake();
}, W = {}, jn = /^[\d.\-M][\d.\-,\s]/, Mn = /["']/g, Nn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(Mn, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, Pn = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, Fn = function(e) {
	var t = (e + "").split("("), n = W[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [Nn(t[1])] : Pn(e).split(",").map(lt)) : W._CE && jn.test(e) ? W._CE("", e) : n;
}, In = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, Ln = function e(t, n) {
	for (var r = t._first, i; r;) r instanceof Gn ? e(r, n) : r.vars.yoyoEase && (!r._yoyo || !r._repeat) && r._yoyo !== n && (r.timeline ? e(r.timeline, n) : (i = r._ease, r._ease = r._yEase, r._yEase = i, r._yoyo = n)), r = r._next;
}, Rn = function(e, t) {
	return e && (me(e) ? e : W[e] || Fn(e)) || t;
}, zn = function(e, t, n, r) {
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
		for (var t in W[e] = U[e] = i, W[a = e.toLowerCase()] = n, i) W[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = W[e + "." + t] = i[t];
	}), i;
}, Bn = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, Vn = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / se * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * fe((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : Bn(s);
	return a = se / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, Hn = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : Bn(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
nt("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	zn(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), W.Linear.easeNone = W.none = W.Linear.easeIn, zn("Elastic", Vn("in"), Vn("out"), Vn()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	zn("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), zn("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), zn("Circ", function(e) {
	return -(ue(1 - e * e) - 1);
}), zn("Sine", function(e) {
	return e === 1 ? 1 : -de(e * ce) + 1;
}), zn("Back", Hn("in"), Hn("out"), Hn()), W.SteppedEase = W.steps = U.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - H;
	return function(e) {
		return ((r * Wt(0, a, e) | 0) + i) * n;
	};
} }, ie.ease = W["quad.out"], nt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return Qe += e + "," + e + "Params,";
});
var Un = function(e, t) {
	this.id = le++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : tt, this.set = t ? t.getSetter : ur;
}, Wn = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, Rt(this, +e.duration, 1, 1), this.data = e.data, V && (this._ctx = V, V.data.push(this)), On || kn.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, Rt(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (An(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (kt(this, e), !n._dp || n.parent || At(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && jt(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === H || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), ct(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + Tt(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + Tt(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? Et(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -H ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? Dt(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -H ? 0 : this._rts, this.totalTime(Wt(-Math.abs(this._delay), this._tDur, n), t !== !1), Ot(this), St(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (An(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== H && (this._tTime -= H)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = e;
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && jt(t, this, e - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (ve(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? Dt(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = Ue);
		var t = B;
		return B = e, (this._initted || this._startAt) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), B = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, zt(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, zt(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(Vt(this, e), ve(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, ve(t)), this._dur || (this._zTime = -H), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -H : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -H, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - H);
	}, t.eventCallback = function(e, t, n) {
		var r = this.vars;
		return arguments.length > 1 ? (t ? (r[e] = t, n && (r[e + "Params"] = n), e === "onUpdate" && (this._onUpdate = t)) : delete r[e], this) : r[e];
	}, t.then = function(e) {
		var t = this;
		return new Promise(function(n) {
			var r = me(e) ? e : ut, i = function() {
				var e = t.then;
				t.then = null, me(r) && (r = r(t)) && (r.then || r === t) && (t.then = e), n(r), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? i() : t._prom = i;
		});
	}, t.kill = function() {
		hn(this);
	}, e;
}();
dt(Wn.prototype, {
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
	_zTime: -H,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var Gn = /*#__PURE__*/ function(e) {
	R(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = ve(t.sortChildren), Ae && jt(t.parent || Ae, L(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && Mt(L(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return Ht(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return Ht(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return Ht(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, gt(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new ar(e, t, Vt(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return jt(this, ar.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new ar(e, n, Vt(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, gt(n).immediateRender = ve(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, gt(r).immediateRender = ve(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : it(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== Ae && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = it(o % f), o === i ? (d = this._repeat, c = a) : (_ = it(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = Et(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : it(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && mn(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
					Ln(this, y);
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = Lt(this, it(r), it(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && c && !t && !d && (mn(this, "onStart"), this._tTime !== o)) return this;
			if (c >= r && e >= 0) for (l = this._first; l;) {
				if (u = l._next, (l._act || c >= l._start) && l._ts && m !== l) {
					if (l.parent !== this) return this.render(e, t, n);
					if (l.render(l._ts > 0 ? (c - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (c - l._start) * l._ts, t, n), c !== this._time || !this._ts && !p) {
						m = 0, u && (o += this._zTime = -H);
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
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || B && (l._initted || l._startAt)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -H : H);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -H)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, Ot(this), this.render(e, t, n);
			this._onUpdate && !t && mn(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && bt(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (mn(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (he(t) || (t = Vt(this, t, e)), !(e instanceof Wn)) {
			if (Se(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (pe(e)) return this.addLabel(e, t);
			if (me(e)) e = ar.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : jt(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -oe);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof ar ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return pe(e) ? this.removeLabel(e) : me(e) ? this.killTweensOf(e) : (e.parent === this && yt(this, e), e === this._recent && (this._recent = this._last), xt(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = it(kn.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = Vt(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = ar.delayedCall(0, t || Be, n);
		return r.data = "isPause", this._hasPause = 1, jt(this, r, Vt(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = Vt(this, e); t;) t._start === e && t.data === "isPause" && bt(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) Xn !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = Xt(e), i = this._first, a = he(t), o; i;) i instanceof ar ? ot(i._targets, r) && (a ? (!Xn || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = Vt(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = ar.to(n, dt({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || H,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && Rt(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, dt({ startAt: { time: Vt(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), pn(this, Vt(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), pn(this, Vt(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + H);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		for (var r = this._first, i = this.labels, a; r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return xt(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), xt(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = oe, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, jt(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += o / n._ts, n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			Rt(n, n === Ae && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (Ae._ts && (ct(Ae, Dt(e, Ae)), qe = kn.frame), kn.frame >= Xe) {
			Xe += z.autoSleep || 120;
			var t = Ae._first;
			if ((!t || !t._ts) && z.autoSleep && kn._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || kn.sleep();
			}
		}
	}, t;
}(Wn);
dt(Gn.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var Kn = function(e, t, n, r, i, a, o) {
	var s = new yr(this._pt, e, t, 0, 1, pr, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = un(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(Ee) || []; u = Ee.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? at(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = Ee.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (De.test(r) || g) && (s.e = 0), this._pt = s, s;
}, qn = function(e, t, n, r, i, a, o, s, c, l) {
	me(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? me(u) ? c ? e[t.indexOf("set") || !me(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = me(u) ? c ? cr : sr : or, p;
	if (pe(r) && (~r.indexOf("random(") && (r = un(r)), r.charAt(1) === "=" && (p = at(d, r) + (Gt(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || Zn) return !isNaN(d * r) && r !== "" ? (p = new yr(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? fr : dr, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && Le(t, r), Kn.call(this, e, t, d, r, f, s || z.stringFilter, c));
}, Jn = function(e, t, n, r, i) {
	if (me(e) && (e = nr(e, i, t, n, r)), !_e(e) || e.style && e.nodeType || Se(e) || xe(e)) return pe(e) ? nr(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = nr(e[o], i, t, n, r);
	return a;
}, Yn = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (Je[e] && (o = new Je[e]()).init(i, o.rawVars ? t[e] : Jn(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new yr(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== gn)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, Xn, Zn, Qn = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !ae, b = t.timeline, x, S, C, w, T, E, D, O, k, A, ee, j, te;
	if (b && (!f || !a) && (a = "none"), t._ease = Rn(a, ie.ease), t._yEase = d ? In(Rn(d === !0 ? a : d, ie.ease)) : 0, d && t._yoyo && !t._repeat && (d = t._yEase, t._yEase = t._ease, t._ease = d), t._from = !b && !!i.runBackwards, !b || f && !i.stagger) {
		if (O = g[0] ? et(g[0]).harness : 0, j = O && i[O.prop], x = ht(i, We), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? He : Ve), h._lazy = 0), o) {
			if (bt(t._startAt = ar.set(g, dt({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && ve(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return mn(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (B || !s && !p) && t._startAt.revert(He), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), C = dt({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && ve(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, x), j && (C[O.prop] = j), bt(t._startAt = ar.set(g, C)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (B ? t._startAt.revert(He) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, H, H);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && ve(c) || c && !m, S = 0; S < g.length; S++) {
			if (T = g[S], D = T._gsap || $e(g)[S]._gsap, t._ptLookup[S] = A = {}, Ke[D.id] && Ge.length && st(), ee = v === g ? S : v.indexOf(T), O && (k = new O()).init(T, j || x, t, ee, v) !== !1 && (t._pt = w = new yr(t._pt, T, k.name, 0, 1, k.render, k, 0, k.priority), k._props.forEach(function(e) {
				A[e] = w;
			}), k.priority && (E = 1)), !O || j) for (C in x) Je[C] && (k = Yn(C, x, t, ee, T, v)) ? k.priority && (E = 1) : A[C] = w = qn.call(t, T, C, "get", x[C], ee, v, 0, i.stringFilter);
			t._op && t._op[S] && t.kill(T, t._op[S]), y && t._pt && (Xn = t, Ae.killTweensOf(T, A, t.globalTime(n)), te = !t.parent, Xn = 0), t._pt && c && (Ke[D.id] = 1);
		}
		E && vr(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !te, f && n <= 0 && b.render(oe, !0, !0);
}, $n = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return Zn = 1, e.vars[t] = "+=0", Qn(e, o), Zn = 0, s ? Re(t + " not eligible for reset") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e &&= rt(n) + Gt(u.e), u.b &&= l.s + Gt(u.b);
}, er = function(e, t) {
	var n = e[0] ? et(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = pt({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, tr = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (Se(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
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
}, nr = function(e, t, n, r, i) {
	return me(e) ? e.call(t, n, r, i) : pe(e) && ~e.indexOf("random(") ? un(e) : e;
}, rr = Qe + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", ir = {};
nt(rr + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return ir[e] = 1;
});
var ar = /*#__PURE__*/ function(e) {
	R(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : gt(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = o.yoyoEase, g = n.parent || Ae, _ = (Se(t) || xe(t) ? he(t[0]) : "length" in n) ? [t] : Xt(t), v, y, b, x, S, C, w, T;
		if (a._targets = _.length ? $e(_) : Re("GSAP target " + t + " not found. https://gsap.com", !z.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || be(s) || be(c)) {
			if (n = a.vars, v = a.timeline = new Gn({
				data: "nested",
				defaults: p || {},
				targets: g && g.data === "nested" ? g.vars.targets : _
			}), v.kill(), v.parent = v._dp = L(a), v._start = 0, u || be(s) || be(c)) {
				if (x = _.length, w = u && $t(u), _e(u)) for (S in u) ~rr.indexOf(S) && (T ||= {}, T[S] = u[S]);
				for (y = 0; y < x; y++) b = ht(n, ir), b.stagger = 0, h && (b.yoyoEase = h), T && pt(b, T), C = _[y], b.duration = +nr(s, L(a), y, C, _), b.delay = (+nr(c, L(a), y, C, _) || 0) - a._delay, !u && x === 1 && b.delay && (a._delay = c = b.delay, a._start += c, b.delay = 0), v.to(C, b, w ? w(y, C, _) : 0), v._ease = W.none;
				v.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				gt(dt(v.vars.defaults, { ease: "none" })), v._ease = Rn(f.ease || n.ease || "none");
				var E = 0, D, O, k;
				if (Se(f)) f.forEach(function(e) {
					return v.to(_, e, ">");
				}), v.duration();
				else {
					for (S in b = {}, f) S === "ease" || S === "easeEach" || tr(S, f[S], b, f.easeEach);
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
		return d === !0 && !ae && (Xn = L(a), Ae.killTweensOf(_), Xn = 0), jt(g, L(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === it(g._time) && ve(l) && wt(L(a)) && g.data !== "nested") && (a._tTime = -H, a.render(Math.max(0, -c) || 0)), m && Mt(L(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - H && !o ? i : e < H ? 0 : e, c, l, u, d, f, p, m, h, g;
		if (!a) It(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = it(s % d), s === i ? (u = this._repeat, c = a) : (f = it(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (g = this._yEase, c = a - c), f = Et(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && (h && this._yEase && Ln(h, p), this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(it(d * u), !0).invalidate()._lock = 0));
			}
			if (!this._initted) {
				if (Nt(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
				if (r !== this._time && !(n && this.vars.repeatRefresh && u !== f)) return this;
				if (a !== this._dur) return this.render(e, t, n);
			}
			if (this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), this.ratio = m = (g || this._ease)(c / a), this._from && (this.ratio = m = 1 - m), c && !r && !t && !u && (mn(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && Ct(this, e, t, n), mn(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && mn(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && Ct(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && bt(this, 1), !t && !(o && !r) && (s || r || p) && (mn(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		On || kn.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || Qn(this, a), o = this._ease(a / this._dur), $n(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (kt(this, 0), this.parent || vt(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? hn(this) : this.scrollTrigger && this.scrollTrigger.kill(!!B), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, Xn && Xn.vars.overwrite !== !0)._first || hn(this), this.parent && n !== this.timeline.totalDuration() && Rt(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? Xt(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && _t(r, i)) return t === "all" && (this._pt = 0), hn(this);
		for (s = this._op = this._op || [], t !== "all" && (pe(t) && (d = {}, nt(t, function(e) {
			return d[e] = 1;
		}), t = d), t = er(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && yt(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && hn(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return Ht(1, arguments);
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
		return Ht(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return Ae.killTweensOf(e, t, n);
	}, t;
}(Wn);
dt(ar.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), nt("staggerTo,staggerFrom,staggerFromTo", function(e) {
	ar[e] = function() {
		var t = new Gn(), n = qt.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var or = function(e, t, n) {
	return e[t] = n;
}, sr = function(e, t, n) {
	return e[t](n);
}, cr = function(e, t, n, r) {
	return e[t](r.fp, n);
}, lr = function(e, t, n) {
	return e.setAttribute(t, n);
}, ur = function(e, t) {
	return me(e[t]) ? sr : ge(e[t]) && e.setAttribute ? lr : or;
}, dr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, fr = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, pr = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, mr = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, hr = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, gr = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? yt(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, _r = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, vr = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, yr = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || dr, this.d = o || this, this.set = s || or, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = _r, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
nt(Qe + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(e) {
	return We[e] = 1;
}), U.TweenMax = U.TweenLite = ar, U.TimelineLite = U.TimelineMax = Gn, Ae = new Gn({
	sortChildren: !1,
	defaults: ie,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), z.stringFilter = Dn;
var br = [], xr = {}, Sr = [], Cr = 0, wr = 0, Tr = function(e) {
	return (xr[e] || Sr).map(function(e) {
		return e();
	});
}, Er = function() {
	var e = Date.now(), t = [];
	e - Cr > 2 && (Tr("matchMediaInit"), br.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = je.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), Tr("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), Cr = e, Tr("matchMedia"));
}, Dr = /*#__PURE__*/ function() {
	function e(e, t) {
		this.selector = t && Zt(t), this.data = [], this._r = [], this.isReverted = !1, this.id = wr++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		me(e) && (n = t, t = e, e = me);
		var r = this, i = function() {
			var e = V, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = Zt(n)), V = r, a = t.apply(r, arguments), me(a) && r._r.push(a), V = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === me ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = V;
		V = null, e(this), V = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof ar && !(n.parent && n.parent.data === "nested") && t.push(n);
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
			}), r = n.data.length; r--;) i = n.data[r], i instanceof Gn ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof ar) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = br.length; r--;) br[r].id === this.id && br.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), Or = /*#__PURE__*/ function() {
	function e(e) {
		this.contexts = [], this.scope = e, V && V.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		_e(e) || (e = { matches: e });
		var r = new Dr(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in V && !r.selector && (r.selector = V.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = je.matchMedia(e[o]), a && (br.indexOf(r) < 0 && br.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(Er) : a.addEventListener("change", Er)));
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
}(), kr = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return vn(e);
		});
	},
	timeline: function(e) {
		return new Gn(e);
	},
	getTweensOf: function(e, t) {
		return Ae.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		pe(e) && (e = Xt(e)[0]);
		var i = et(e || {}).get, a = n ? ut : lt;
		return n === "native" && (n = ""), e && (t ? a((Je[t] && Je[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((Je[t] && Je[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = Xt(e), e.length > 1) {
			var r = e.map(function(e) {
				return Nr.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = Je[t], o = et(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			gn._pt = 0, r.init(e, n ? t + n : t, gn, 0, [e]), r.render(1, r), gn._pt && mr(1, gn);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = Nr.to(e, dt((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return Ae.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = Rn(e.ease, ie.ease)), mt(ie, e || {});
	},
	config: function(e) {
		return mt(z, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !Je[e] && !U[e] && Re(t + " effect requires " + e + " plugin.");
		}), Ye[t] = function(e, t, r) {
			return n(Xt(e), dt(t || {}, i), r);
		}, a && (Gn.prototype[t] = function(e, n, r) {
			return this.add(Ye[t](e, _e(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		W[e] = Rn(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? Rn(e, t) : W;
	},
	getById: function(e) {
		return Ae.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new Gn(e), r, i;
		for (n.smoothChildTiming = ve(e.smoothChildTiming), Ae.remove(n), n._dp = 0, n._time = n._tTime = Ae._time, r = Ae._first; r;) i = r._next, (t || !(!r._dur && r instanceof ar && r.vars.onComplete === r._targets[0])) && jt(n, r, r._start - r._delay), r = i;
		return jt(Ae, n, 0), n;
	},
	context: function(e, t) {
		return e ? new Dr(e, t) : V;
	},
	matchMedia: function(e) {
		return new Or(e);
	},
	matchMediaRefresh: function() {
		return br.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || Er();
	},
	addEventListener: function(e, t) {
		var n = xr[e] || (xr[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = xr[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: cn,
		wrapYoyo: ln,
		distribute: $t,
		random: nn,
		snap: tn,
		normalize: on,
		getUnit: Gt,
		clamp: Kt,
		splitColor: Sn,
		toArray: Xt,
		selector: Zt,
		mapRange: dn,
		pipe: rn,
		unitize: an,
		interpolate: fn,
		shuffle: Qt
	},
	install: Ie,
	effects: Ye,
	ticker: kn,
	updateRoot: Gn.updateRoot,
	plugins: Je,
	globalTimeline: Ae,
	core: {
		PropTween: yr,
		globals: ze,
		Tween: ar,
		Timeline: Gn,
		Animation: Wn,
		getCache: et,
		_removeLinkedListItem: yt,
		reverting: function() {
			return B;
		},
		context: function(e) {
			return e && V && (V.data.push(e), e._ctx = V), V;
		},
		suppressOverwrites: function(e) {
			return ae = e;
		}
	}
};
nt("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return kr[e] = ar[e];
}), kn.add(Gn.updateRoot), gn = kr.to({}, { duration: 0 });
var Ar = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, jr = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = Ar(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, Mr = function(e, t) {
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
				jr(e, n);
			};
		}
	};
}, Nr = kr.registerPlugin({
	name: "attr",
	init: function(e, t, n, r, i) {
		var a, o, s;
		for (a in this.tween = n, t) s = e.getAttribute(a) || "", o = this.add(e, "setAttribute", (s || 0) + "", t[a], r, i, 0, 0, a), o.op = a, o.b = s, this._props.push(a);
	},
	render: function(e, t) {
		for (var n = t._pt; n;) B ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, Mr("roundProps", en), Mr("modifiers"), Mr("snap", tn)) || kr;
ar.version = Gn.version = Nr.version = "3.12.7", Fe = 1, ye() && An(), W.Power0, W.Power1, W.Power2, W.Power3, W.Power4, W.Linear, W.Quad, W.Cubic, W.Quart, W.Quint, W.Strong, W.Elastic, W.Back, W.SteppedEase, W.Bounce, W.Sine, W.Expo, W.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var Pr, Fr, Ir, Lr, Rr, zr, Br, Vr = function() {
	return typeof window < "u";
}, Hr = {}, Ur = 180 / Math.PI, Wr = Math.PI / 180, Gr = Math.atan2, Kr = 1e8, qr = /([A-Z])/g, Jr = /(left|right|width|margin|padding|x)/i, Yr = /[\s,\(]\S/, Xr = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, Zr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, Qr = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, $r = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, ei = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, ti = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, ni = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, ri = function(e, t, n) {
	return e.style[t] = n;
}, ii = function(e, t, n) {
	return e.style.setProperty(t, n);
}, ai = function(e, t, n) {
	return e._gsap[t] = n;
}, oi = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, si = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, ci = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, li = "transform", ui = li + "Origin", di = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in Hr && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = Xr[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = ki(i, e);
		}) : this.tfm[t] = o.x ? o[t] : ki(i, t), t === ui && (this.tfm.zOrigin = o.zOrigin);
		else return Xr.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(li) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(ui, n, "")), t = li;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, fi = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, pi = function() {
	var e = this.props, t = this.target, n = t.style, r = t._gsap, i, a;
	for (i = 0; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(qr, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = Br(), (!i || !i.isStart) && !n[li] && (fi(n), r.zOrigin && n[ui] && (n[ui] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, mi = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: pi,
		save: di
	};
	return e._gsap || Nr.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, hi, gi = function(e, t) {
	var n = Fr.createElementNS ? Fr.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : Fr.createElement(e);
	return n && n.style ? n : Fr.createElement(e);
}, _i = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(qr, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, yi(n) || n, 1) || "";
}, vi = "O,Moz,ms,Ms,Webkit".split(","), yi = function(e, t, n) {
	var r = (t || Rr).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(vi[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? vi[i] : "") + e;
}, bi = function() {
	Vr() && window.document && (Pr = window, Fr = Pr.document, Ir = Fr.documentElement, Rr = gi("div") || { style: {} }, gi("div"), li = yi(li), ui = li + "Origin", Rr.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", hi = !!yi("perspective"), Br = Nr.core.reverting, Lr = 1);
}, xi = function(e) {
	var t = e.ownerSVGElement, n = gi("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), Ir.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), Ir.removeChild(n), i;
}, Si = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, Ci = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = xi(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = xi(e)), t && !t.width && !t.x && !t.y ? {
		x: +Si(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +Si(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, wi = function(e) {
	return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && Ci(e));
}, Ti = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in Hr && t !== ui && (t = li), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(qr, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, Ei = function(e, t, n, r, i, a) {
	var o = new yr(e._pt, t, n, 0, 1, a ? ni : ti);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, Di = {
	deg: 1,
	rad: 1,
	turn: 1
}, Oi = {
	grid: 1,
	flex: 1
}, G = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = Rr.style, c = Jr.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || Di[i] || Di[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && wi(t), (p || o === "%") && (Hr[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], rt(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === Fr || !h.appendChild) && (h = Fr.body), g = h._gsap, g && p && g.width && c && g.time === kn.time && !g.uncache) return rt(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : Ti(t, n);
	} else (p || o === "%") && !Oi[_i(h, "display")] && (s.position = _i(t, "position")), h === t && (s.position = "static"), h.appendChild(Rr), m = Rr[u], h.removeChild(Rr), s.position = "absolute";
	return c && p && (g = et(h), g.time = kn.time, g.width = h[u]), rt(f ? m * a / d : m && a ? d / m * a : 0);
}, ki = function(e, t, n, r) {
	var i;
	return Lr || bi(), t in Xr && t !== "transform" && (t = Xr[t], ~t.indexOf(",") && (t = t.split(",")[0])), Hr[t] && t !== "transform" ? (i = Vi(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : Hi(_i(e, ui)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = Pi[t] && Pi[t](e, t, n) || _i(e, t) || tt(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? G(e, t, i, n) + n : i;
}, Ai = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = yi(t, e, 1), a = i && _i(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = _i(e, "borderTopColor"));
	}
	var o = new yr(this._pt, e.style, t, 0, 1, pr), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r === "auto" && (m = e.style[t], e.style[t] = r, r = _i(e, t) || r, m ? e.style[t] = m : Ti(e, t)), l = [n, r], Dn(l), n = l[0], r = l[1], d = n.match(Te) || [], b = r.match(Te) || [], b.length) {
		for (; u = Te.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = at(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = Te.lastIndex - v.length, v || (v = v || z.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = G(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? ni : ti;
	return De.test(r) && (o.e = 0), this._pt = o, o;
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
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], Hr[o] && (s = 1, o = o === "transformOrigin" ? ui : li), Ti(n, o);
		s && (Ti(n, li), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", Vi(n, 1), a.uncache = 1, fi(r)));
	}
}, Pi = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new yr(e._pt, t, n, 0, 0, Ni);
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
	var t = _i(e, li);
	return Li(t) ? Fi : t.substr(7).match(we).map(rt);
}, zi = function(e, t) {
	var n = e._gsap || et(e), r = e.style, i = Ri(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? Fi : i) : (i === Fi && !e.offsetParent && e !== Ir && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, Ir.appendChild(e)), i = Ri(e), s ? r.display = s : Ti(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : Ir.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, Bi = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || zi(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== Fi && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = Ci(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[ui] = "0px 0px", a && (Ei(a, o, "xOrigin", c, y), Ei(a, o, "yOrigin", l, b), Ei(a, o, "xOffset", u, o.xOffset), Ei(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, Vi = function(e, t) {
	var n = e._gsap || new Un(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = _i(e, ui) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A, ee, j, te, M, ne, N, P, re, F, I;
	return n.svg = !!(e.getCTM && wi(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[li] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[li] === "none" ? "" : s[li])), r.scale = r.rotate = r.translate = "none"), S = zi(e, n.svg), n.svg && (n.uncache ? (te = e.getBBox(), c = n.xOrigin - te.x + "px " + (n.yOrigin - te.y) + "px", j = "") : j = !t && e.getAttribute("data-svg-origin"), Bi(e, j || c, !!j || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== Fi && (E = S[0], D = S[1], O = S[2], k = S[3], l = A = S[4], u = ee = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? Gr(D, E) * Ur : 0, _ = O || k ? Gr(O, k) * Ur + m : 0, _ && (p *= Math.abs(Math.cos(_ * Wr))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (I = S[6], re = S[7], ne = S[8], N = S[9], P = S[10], F = S[11], l = S[12], u = S[13], d = S[14], C = Gr(I, P), h = C * Ur, C && (w = Math.cos(-C), T = Math.sin(-C), j = A * w + ne * T, te = ee * w + N * T, M = I * w + P * T, ne = A * -T + ne * w, N = ee * -T + N * w, P = I * -T + P * w, F = re * -T + F * w, A = j, ee = te, I = M), C = Gr(-O, P), g = C * Ur, C && (w = Math.cos(-C), T = Math.sin(-C), j = E * w - ne * T, te = D * w - N * T, M = O * w - P * T, F = k * T + F * w, E = j, D = te, O = M), C = Gr(D, E), m = C * Ur, C && (w = Math.cos(C), T = Math.sin(C), j = E * w + D * T, te = A * w + ee * T, D = D * w - E * T, ee = ee * w - A * T, E = j, A = te), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = rt(Math.sqrt(E * E + D * D + O * O)), p = rt(Math.sqrt(ee * ee + I * I)), C = Gr(A, ee), _ = Math.abs(C) > 2e-4 ? C * Ur : 0, y = F ? 1 / (F < 0 ? -F : F) : 0), n.svg && (j = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !Li(_i(e, li)), j && e.setAttribute("transform", j))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = rt(f), n.scaleY = rt(p), n.rotation = rt(m) + o, n.rotationX = rt(h) + o, n.rotationY = rt(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[ui] = Hi(c)), n.xOffset = n.yOffset = 0, n.force3D = z.force3D, n.renderTransform = n.svg ? Yi : hi ? Ji : Wi, n.uncache = 0, n;
}, Hi = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, Ui = function(e, t, n) {
	var r = Gt(t);
	return rt(parseFloat(t) + parseFloat(G(e, "x", n + "px", r))) + r;
}, Wi = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, Ji(e, t);
}, Gi = "0deg", Ki = "0px", qi = ") ", Ji = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== Gi || l !== Gi)) {
		var x = parseFloat(l) * Wr, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * Wr, w = Math.cos(x), a = Ui(_, a, S * w * -v), o = Ui(_, o, -Math.sin(x) * -v), s = Ui(_, s, C * w * -v + v);
	}
	h !== Ki && (y += "perspective(" + h + qi), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== Ki || o !== Ki || s !== Ki) && (y += s !== Ki || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + qi), c !== Gi && (y += "rotate(" + c + qi), l !== Gi && (y += "rotateY(" + l + qi), u !== Gi && (y += "rotateX(" + u + qi), (d !== Gi || f !== Gi) && (y += "skew(" + d + ", " + f + qi), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + qi), _.style[li] = y || "translate(0, 0)";
}, Yi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= Wr, c *= Wr, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= Wr, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = rt(b), x = rt(x), S = rt(S), C = rt(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = G(f, "x", a, "px"), y = G(f, "y", o, "px")), (p || m || h || g) && (v = rt(v + p - (p * b + m * S) + h), y = rt(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = rt(v + r / 100 * w.width), y = rt(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[li] = w);
}, Xi = function(e, t, n, r, i) {
	var a = 360, o = pe(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? Ur : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * Kr) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * Kr) % a - ~~(s / a) * a)), e._pt = u = new yr(e._pt, t, n, r, s, Qr), u.e = c, u.u = "deg", e._props.push(n), u;
}, Zi = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, Qi = function(e, t, n) {
	var r = Zi({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[li] = t, o = Vi(n, 1), Ti(n, li), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[li], a[li] = t, o = Vi(n, 1), a[li] = c), Hr) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = Gt(c), p = Gt(l), u = f === p ? parseFloat(c) : G(n, s, c, p), d = parseFloat(l), e._pt = new yr(e._pt, o, s, u, d - u, Zr), e._pt.u = p || 0, e._props.push(s));
	Zi(o, r);
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
	register: bi,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C;
		for (m in Lr || bi(), this.styles = this.styles || mi(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(Je[m] && Yn(m, t, n, r, e, i)))) {
			if (f = typeof l, p = Pi[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = un(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", Tn.lastIndex = 0, Tn.test(c) || (h = Gt(c), g = Gt(l)), g ? h !== g && (c = G(e, m, c, g) + g) : h && (l += h), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], pe(c) && ~c.indexOf("random(") && (c = un(c)), Gt(c + "") || c === "auto" || (c += z.units[m] || Gt(ki(e, m)) || ""), (c + "").charAt(1) === "=" && (c = ki(e, m))) : c = ki(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in Xr && (m === "autoAlpha" && (d === 1 && ki(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), Ei(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = Xr[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Hr, v) {
					if (this.styles.save(m), y || (b = e._gsap, b.renderTransform && !t.parseTransform || Vi(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new yr(this._pt, o, li, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new yr(this._pt, b, "scaleY", b.scaleY, (_ ? at(b.scaleY, _ + u) : u) - b.scaleY || 0, Zr), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(ui, 0, o[ui]), l = Mi(l), b.svg ? Bi(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && Ei(this, b, "zOrigin", b.zOrigin, g), Ei(this, o, m, Hi(c), Hi(l)));
						continue;
					} else if (m === "svgOrigin") {
						Bi(e, l, 1, x, 0, this);
						continue;
					} else if (m in Ii) {
						Xi(this, b, m, d, _ ? at(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						Ei(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						Qi(this, l, e);
						continue;
					}
				} else m in o || (m = yi(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !Yr.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = Gt(l) || (m in z.units ? z.units[m] : h), h !== g && (d = G(e, m, c, g)), this._pt = new yr(this._pt, v ? b : o, m, d, (_ ? at(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? ei : Zr), this._pt.u = g || 0, h !== g && g !== "%" && (this._pt.b = c, this._pt.r = $r);
				else if (m in o) Ai.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					Le(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && vr(this);
	},
	render: function(e, t) {
		if (t.tween._time || !Br()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: ki,
	aliases: Xr,
	getSetter: function(e, t, n) {
		var r = Xr[t];
		return r && r.indexOf(",") < 0 && (t = r), t in Hr && t !== ui && (e._gsap.x || ki(e, "x")) ? n && zr === n ? t === "scale" ? oi : ai : (zr = n || {}) && (t === "scale" ? si : ci) : e.style && !ge(e.style[t]) ? ri : ~t.indexOf("-") ? ii : ur(e, t);
	},
	core: {
		_removeProperty: Ti,
		_getMatrix: zi
	}
};
Nr.utils.checkPrefix = yi, Nr.core.getStyleSaver = mi, (function(e, t, n, r) {
	var i = nt(e + "," + t + "," + n, function(e) {
		Hr[e] = 1;
	});
	nt(t, function(e) {
		z.units[e] = "deg", Ii[e] = 1;
	}), Xr[i[13]] = e + "," + t, nt(r, function(e) {
		var t = e.split(":");
		Xr[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), nt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	z.units[e] = "px";
}), Nr.registerPlugin($i);
//#endregion
//#region node_modules/gsap/index.js
var K = Nr.registerPlugin($i) || Nr;
K.core.Tween;
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
var ua = /* @__PURE__ */ new Set(), da = P.drawDiscard;
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
	let i = I(), a = pa(r.root ?? document), o = F(da, i), s = i ? .03 : .055, c = K.timeline({ onComplete: () => {
		ua.delete(c), r.onComplete?.();
	} });
	ua.add(c), e.forEach((e, l) => {
		let u = sa(t[l] ?? `discard-${n + l}`, n + l), d = ea(e);
		if (K.set(e, {
			transformOrigin: "50% 50%",
			willChange: "transform,opacity",
			zIndex: 4
		}), !a || i) {
			c.to(e, {
				opacity: 0,
				scale: u.scale,
				duration: Math.min(o, .2),
				onComplete: () => {
					K.set(e, { clearProps: "transform,opacity,willChange,zIndex" }), r.onCardComplete?.(l);
				}
			}, l * s);
			return;
		}
		let f = a.left + a.width / 2 + u.offsetX, p = a.top + a.height / 2 + u.offsetY, m = d.left + d.width / 2, h = d.top + d.height / 2, g = f - m, _ = p - h, { midX: v, midY: y } = fa(g, _);
		K.set(e, {
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
			ease: M,
			onComplete: () => {
				K.set(e, { clearProps: "transform,opacity,willChange,zIndex" }), r.onCardComplete?.(l);
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
function Sa(e, t) {
	return ba.get(e)?.kill(), ba.set(e, t), t;
}
function Ca(e) {
	e && (ba.get(e)?.kill(), ba.delete(e), K.killTweensOf(e), K.set(e, { clearProps: "transform,opacity,filter" }));
}
function wa(e, t, n = .22) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * n)
	};
}
function Ta(e, t, n = P.dealStagger) {
	ya();
	let r = I(), i = K.timeline(), a = F(P.deal, r);
	return e.forEach((e, o) => {
		let { x: s, y: c } = ra(ea(e), t), { midX: l, midY: u } = wa(s, c, .28);
		K.set(e, {
			transformOrigin: "50% 80%",
			willChange: "transform,opacity"
		}), K.set(e, {
			x: s,
			y: c,
			rotation: -14 + o * 2,
			rotationY: r ? 0 : -72,
			scale: .58,
			opacity: +!!r
		});
		let d = o * (r ? .04 : n), f = () => {
			K.set(e, { clearProps: "transform,opacity,willChange" });
		};
		r ? i.to(e, {
			x: 0,
			y: 0,
			rotation: 0,
			rotationY: 0,
			scale: 1,
			opacity: 1,
			duration: a,
			ease: M,
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
			ease: M,
			onComplete: f
		}, d);
	}), i;
}
function Ea(e, t) {
	ya();
	let n = I(), r = K.timeline(), i = F(P.drawReceive, n), a = n ? .04 : P.drawReceiveStagger;
	return e.forEach((e, n) => {
		let { x: o, y: s } = ra(ea(e), t);
		K.set(e, {
			transformOrigin: "50% 80%",
			willChange: "transform,opacity"
		}), K.set(e, {
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
			ease: N,
			onComplete: () => {
				K.set(e, { clearProps: "transform,opacity,willChange" });
			}
		}, n * a);
	}), r;
}
function Da(e) {
	ya();
	let t = K.timeline(), n = F(P.standPat);
	return e.forEach((e) => {
		t.fromTo(e, {
			y: 0,
			scale: 1
		}, {
			y: -5,
			scale: 1.02,
			duration: n * .45,
			ease: M,
			yoyo: !0,
			repeat: 1,
			onComplete: () => {
				K.set(e, { clearProps: "transform,willChange" });
			}
		}, 0);
	}), t;
}
function Oa(e) {
	ya();
	let t = K.timeline(), n = F(P.foldOut);
	return e.forEach((e, r) => {
		K.set(e, {
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
			ease: ne,
			onComplete: () => Ca(e)
		}, r * .04);
	}), t;
}
function ka(e) {
	ya();
	let t = F(.32);
	return K.set(e, {
		transformOrigin: "50% 90%",
		willChange: "transform"
	}), Sa(e, K.to(e, {
		y: -26,
		rotationX: 14,
		rotationY: -10,
		scale: 1.05,
		duration: t,
		ease: M
	}));
}
//#endregion
//#region src/table/animations/drawSeatMotion.ts
var Aa = /* @__PURE__ */ new Set();
function ja(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function Ma() {
	for (let e of Aa) e.kill();
	Aa.clear();
}
function Na(e) {
	let t = document.createElement("div");
	return t.className = "draw-receive-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function Pa(e, t, n, r = {}) {
	ia(n);
	let i = I(), a = F(P.drawReceive, i), o = i ? .04 : P.drawReceiveStagger, s = [];
	for (let r = 0; r < t.length; r++) {
		let t = Na(e);
		n.appendChild(t), s.push(t);
	}
	let c = K.timeline({ onComplete: () => {
		for (let e of s) e.remove();
		Aa.delete(c), window.clearTimeout(u), r.onComplete?.();
	} });
	Aa.add(c);
	let l = Math.round((s.length > 0 ? (s.length - 1) * o : 0) * 1e3 + a * 1e3 + 40), u = window.setTimeout(() => {
		c.progress() < 1 && c.progress(1);
	}, Math.min(680, Math.max(320, l)));
	return c.eventCallback("onInterrupt", () => {
		for (let e of s) e.remove();
		Aa.delete(c), window.clearTimeout(u);
	}), s.forEach((e, n) => {
		let r = t[n], s = ea(e), l = r.left + r.width / 2, u = r.top + r.height / 2, d = s.left + s.width / 2, f = s.top + s.height / 2, p = l - d, m = u - f, { midX: h, midY: g } = ja(p, m);
		if (K.set(e, {
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
					K.set(e, { clearProps: "transform,opacity,willChange" });
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
			ease: N
		}, _), c.to(e, {
			opacity: 0,
			scale: .92,
			duration: a * .22,
			ease: "power1.in",
			onComplete: () => {
				K.set(e, { clearProps: "transform,opacity,willChange" });
			}
		}, v);
	}), c;
}
function Fa(e) {
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
	Pa(a, o, r, { onComplete: i });
}
//#endregion
//#region src/table/hooks/useDiscardPileState.ts
function Ia({ handNumber: e, sessionPhase: t }) {
	let [n, r] = (0, l.useState)([]), i = (0, l.useRef)(0), a = (0, l.useRef)(e), o = (0, l.useRef)(t ?? null);
	return (0, l.useEffect)(() => {
		a.current !== e && (a.current = e, i.current = 0, ma(), Ma(), r([]));
	}, [e]), (0, l.useEffect)(() => {
		let e = t ?? null, n = o.current;
		o.current = e, n === "draw" && e === "play" && (ma(), Ma(), r([]));
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
function La({ cardElements: e, cardKeys: t, playerId: n, pileStartIndex: r, root: i, onComplete: a }) {
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
function Ra({ playerId: e, handNumber: t, discardCount: n, pileStartIndex: r, root: i, onComplete: a }) {
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
function za(e, t) {
	return t.map((t) => {
		let n = e[t];
		return n ? `${n.rank}-${n.suit}` : `idx-${t}`;
	});
}
function Ba(e, t) {
	if (!e) return [];
	let n = [...e.querySelectorAll(".hand__slot .pcard")];
	return t.length > 0 ? t.map((e) => n[e]).filter((e) => !!e) : [...e.querySelectorAll(".hand__slot--draw-selected .pcard, .hand__slot--draw-recommended .pcard")];
}
//#endregion
//#region src/table/animations/useHeroCardMotion.ts
function Va(e) {
	return `${e.rank}-${e.suit}`;
}
function Ha(e) {
	return e ? [...e.querySelectorAll(".hand__slot .pcard")] : [];
}
function Ua(e, { dealing: t, dealStaggerMs: n, drawAnimSubPhase: r, drawDiscardCount: i = 0, drawReplaceCount: a = 0, pendingDiscardIndices: o, standPatPulse: s, foldOutPulse: c, playingIndex: u, cards: d, handNumber: f = 0, playerId: p = null, tableRootRef: m, pileIndexRef: h, onDiscardCommitted: g, skipHeroDealMotion: _ = !1 }) {
	let v = (0, l.useRef)([]), y = (0, l.useRef)(!1), b = (0, l.useRef)(null), x = (0, l.useRef)(null);
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
		let r = e.current, i = Ha(r);
		if (!i.length) return;
		y.current = !0;
		let a = xa(r ?? document);
		a && Ta(i, a, Math.max(.04, n / 1e3));
	}, [
		t,
		d.length,
		n,
		e,
		_
	]), (0, l.useLayoutEffect)(() => {
		if (r === "discard") {
			if (i <= 0) return;
			v.current = d.map(Va);
			let t = e.current, n = m?.current ?? t?.closest(".btable-wrap"), r = Ba(t, o);
			if (!r.length || !n || !p) return;
			let a = `${f}:${p}:discard:${r.length}:${o.join(",")}`;
			if (x.current === a) return;
			x.current = a, La({
				cardElements: r,
				cardKeys: za(d, o.length ? o : r.map((e, t) => t)),
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
			let t = e.current, n = Ha(t), r = new Set(v.current), i = d.map((e, t) => ({
				key: Va(e),
				el: n[t]
			})).filter((e) => !!e.el && !r.has(e.key)).map((e) => e.el), o = xa(t ?? document);
			i.length && o && Ea(i, o);
			return;
		}
		(r === "done" || r === null) && (x.current = null, v.current = d.map(Va));
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
		let t = Ha(e.current);
		t.length && Da(t);
	}, [s, e]), (0, l.useLayoutEffect)(() => {
		if (!c) return;
		let t = Ha(e.current);
		t.length && Oa(t);
	}, [c, e]), (0, l.useLayoutEffect)(() => {
		let t = e.current, n = Ha(t);
		if (u === null) {
			if (b.current !== null) {
				let e = n[b.current];
				e && Ca(e), b.current = null;
			}
			return;
		}
		if (b.current === u) return;
		if (b.current !== null) {
			let e = n[b.current];
			e && Ca(e);
		}
		let r = n[u];
		r && (ka(r), b.current = u);
	}, [
		u,
		d,
		e
	]), (0, l.useLayoutEffect)(() => () => {
		for (let t of Ha(e.current)) Ca(t);
	}, [e]);
}
function Wa(e, t) {
	let n = t / 1e3, r = Math.max(e - 1, 0) * n;
	return Math.round((r + P.deal) * 1e3);
}
//#endregion
//#region src/table/handUi.ts
function Ga(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function Ka(e, t) {
	if (t) return "Join hand";
	switch (e) {
		case "reveal": return "Deal";
		case "decision": return "Join hand";
		case "draw": return "Draw";
		case "play": return "Play card";
		default: return "Waiting";
	}
}
function qa(e, t) {
	return t || e === "decision" ? "Tap I'm in or Pass at your seat" : e === "draw" ? "Choose cards to discard, then tap Draw" : e === "play" ? "Tap a card to play" : null;
}
function Ja(e) {
	return e.handComplete ? "Hand result — next hand coming up" : !e.cardsDealt && !e.enrollmentActive || e.isMyTurn ? null : e.enrollmentActive || e.phase === "decision" || e.phase === "draw" || e.phase === "play" || e.phase === "reveal" ? "Waiting for other players" : null;
}
function Ya(e) {
	return {
		spades: "Spades",
		hearts: "Hearts",
		diamonds: "Diamonds",
		clubs: "Clubs"
	}[e ?? ""] ?? e ?? "—";
}
function Xa(e) {
	return e === "reveal" || e === "decision" || e === "draw" || e === "play";
}
function Za(e) {
	return e === "decision";
}
function Qa(e) {
	return e === "reveal";
}
function $a(e, t) {
	if (!e) return null;
	let n = t.find((t) => t.playerId === e);
	return n ? n.isSelf ? "Your turn" : `${n.displayName}'s turn` : null;
}
//#endregion
//#region src/table/trickPlayFly.ts
var eo = /* @__PURE__ */ new Map(), to = /* @__PURE__ */ new Map();
function no(e) {
	return `${e.playerId}:${e.card.rank}:${e.card.suit}`;
}
function ro(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function io(e) {
	return document.querySelector(`[data-seat-play-origin="${e}"]`);
}
function ao(e) {
	let t = io(e);
	return t ? ro(t) : null;
}
function q(e) {
	return document.querySelector(`[data-trick-play-origin-active="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin-active="${e}"]`) ?? document.querySelector(`[data-trick-play-origin="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin="${e}"]`) ?? io(e);
}
function oo(e) {
	let t = q(e);
	return t ? ro(t) : null;
}
function so(e) {
	let t = oo(e);
	if (t) return to.set(e, t), t;
	let n = ao(e);
	return n ? (to.set(e, n), n) : null;
}
function co(e) {
	for (let t of e) so(t);
}
function lo(e) {
	return to.get(e);
}
function uo(e, t) {
	if (t) {
		let e = eo.get(t);
		if (e) return e;
	}
	return lo(e) ?? oo(e) ?? ao(e) ?? null;
}
function fo(e, t) {
	let n = uo(e, t);
	return n && eo.set(t, n), n;
}
function po(e, t, n) {
	let r = document.querySelector("[data-testid=\"hero-hand\"]")?.querySelectorAll(".hand__slot .pcard")[n];
	if (r) {
		let n = ro(r);
		return eo.set(t, n), to.set(e, n), n;
	}
	return fo(e, t);
}
function mo(e, t, n) {
	let r = e.left + e.width / 2, i = e.top + e.height / 2, a = n.left + n.width / 2, o = n.top + n.height / 2;
	return {
		dx: r - a,
		dy: i - o
	};
}
function ho() {
	eo.clear(), to.clear();
}
//#endregion
//#region src/table/tableMicrointeractions.ts
var go = {
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
}, _o = {
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
function vo(e) {
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
function yo(e, t) {
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
var bo = "nbl-best-play";
function xo() {
	try {
		return localStorage.getItem(bo) === "1";
	} catch {
		return !1;
	}
}
function So(e) {
	try {
		localStorage.setItem(bo, e ? "1" : "0");
	} catch {}
}
//#endregion
//#region src/game/playerOrder.ts
function Co(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function wo(e, t, n) {
	let r = Co(e, n), i = new Set(t);
	return r.filter((e) => i.has(e));
}
//#endregion
//#region src/game/types.ts
var To = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
};
function Eo(e) {
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
function Do(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/playContext.ts
function Oo(e, t) {
	let n = O(e, t);
	return n.length ? n.reduce((e, t) => E(t) >= E(e) ? t : e) : null;
}
function ko(e) {
	if (!e.cinchEnabled) return !1;
	let t = O(e.hand, e.trumpSuit);
	return t.filter((e) => E(e) >= 13).length >= 3 && t.length > 0;
}
function Ao(e, t) {
	let n = Oo(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function jo(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => Do([e.card])[0]) : [];
}
function Mo(e) {
	let t = e.currentTrick ?? null, n = jo(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function No(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = Mo(e.publicHand);
	return {
		hand: e.hand,
		trumpSuit: e.publicHand.trumpSuit,
		leadSuit: r,
		trickPlays: t,
		isLeading: n,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	};
}
function Po(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return ko(e) && !Ao(n, e) ? {
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
function Fo(e, t, n, r) {
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
function Io(e, t, n) {
	let r = e.filter((e) => !D(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => E(t) > E(e) ? t : e) : null;
}
function Lo(e, t) {
	let n = e.filter((e) => D(e, t));
	return n.length ? n.reduce((e, t) => E(t) > E(e) ? t : e) : null;
}
function Ro(e, t) {
	return E(e) > E(t);
}
function zo(e) {
	return {
		hand: e.hand,
		trumpSuit: e.trumpSuit,
		leadSuit: e.leadSuit,
		trickPlays: e.trickPlays,
		isLeading: e.isLeading,
		cinchEnabled: e.cinchEnabled
	};
}
function Bo(e, t = {}) {
	let n = zo(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = Po(n, r);
			i.allowed ? e.push(r) : Fo(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? O(n.hand, r) : [], a = O(n.hand, n.trumpSuit), o = r ? Io(n.trickPlays, r, n.trumpSuit) : null, s = Lo(n.trickPlays, n.trumpSuit), c;
	if (i.length > 0) {
		if (c = i, !s && o) {
			let e = i.filter((e) => Ro(e, o));
			e.length && (c = e);
		}
	} else if (a.length > 0) {
		if (c = a, s) {
			let e = a.filter((e) => Ro(e, s));
			e.length && (c = e);
		}
	} else c = [...n.hand];
	let l = [];
	for (let e = 0; e < n.hand.length; e += 1) c.some((t) => t.rank === n.hand[e].rank && t.suit === n.hand[e].suit) && l.push(e);
	return l;
}
//#endregion
//#region src/game/trick.ts
function Vo(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => D(e.card, n));
	if (r.length) return r.reduce((e, t) => E(t.card) > E(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => E(t.card) > E(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
function Ho(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: E(e),
		trump: D(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function Uo(e, t) {
	let n = Bo(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => E(e[n]) > E(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => E(e[n]) < E(e[t]) ? n : t);
	let i = n.filter((n) => Vo([...t.trickPlays.map((e, t) => ({
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
function Wo(e, t) {
	return t ? t.includes(e) : !0;
}
function Go(e, t, n) {
	if (!n?.length || !e.length) return null;
	let r = Uo(e, No({
		hand: e,
		publicHand: t
	}));
	return n.includes(r) ? r : n[0] ?? null;
}
function Ko(e, t, n, r = Infinity, i = []) {
	if (!e.length || n <= 0) return [];
	let a = new Set(i), o = e.map((e, t) => t).filter((e) => !a.has(e)).filter((n) => !D(e[n], t)).filter((t) => e[t].rank !== "A");
	return o.length ? Ho(o.map((t) => e[t]), t, n, r).map((e) => o[e]) : [];
}
function qo(e) {
	let t = [...e.selectedDraw].sort((e, t) => e - t);
	return e.drawSelectionTouched || t.length > 0 ? t : e.bestPlayEnabled ? [...e.recommendedDiscardIndices].sort((e, t) => e - t) : [];
}
//#endregion
//#region src/table/feedback/soundPacks.ts
var Jo = {
	classic: "Classic",
	wood: "Wood & Felt",
	arcade: "Arcade"
}, Yo = "classic", Xo = {
	classic: "",
	wood: "packs/wood/",
	arcade: "packs/arcade/"
}, Zo = {
	shuffle: "shuffle.mp3",
	draw: "draw.mp3",
	trickWin: "trick-win.mp3",
	bigWin: "big-win.mp3",
	bourre: "bourre.mp3",
	gameStart: "game-start.mp3"
};
function Qo(e, t) {
	return `./sounds/${Xo[e] ?? ""}${Zo[t]}`;
}
function $o(e) {
	return Object.keys(Zo).map((t) => Qo(e, t));
}
function es(e) {
	return e === "wood" || e === "arcade" ? e : Yo;
}
//#endregion
//#region src/table/feedback/prefs.ts
var ts = "nbl-feedback", ns = {
	soundMode: "on",
	soundPackId: Yo,
	hapticsMode: "on"
};
function rs(e) {
	if (!e || typeof e != "object") return { ...ns };
	let t = e, n = t.hapticsMode, r = n === "off" || n === "minimal" || n === "on" ? n : t.hapticsEnabled === !1 ? "off" : "on", i;
	return i = t.soundMode === "on" || t.soundMode === "minimal" || t.soundMode === "off" ? t.soundMode : t.soundEnabled === !1 ? "off" : "on", {
		soundMode: i,
		soundPackId: es(t.soundPackId),
		hapticsMode: r
	};
}
function is() {
	try {
		let e = localStorage.getItem(ts);
		return e ? rs(JSON.parse(e)) : { ...ns };
	} catch {
		return { ...ns };
	}
}
function as(e) {
	let t = {
		...is(),
		...e
	};
	try {
		localStorage.setItem(ts, JSON.stringify(t));
	} catch {}
	return ls(t), t;
}
function os(e, t) {
	return e === "off" ? !1 : e === "on" ? !0 : t === "trickWin" || t === "bigWin" || t === "bourre";
}
var ss = /* @__PURE__ */ new Set();
function cs(e) {
	return ss.add(e), () => ss.delete(e);
}
function ls(e) {
	for (let t of ss) t(e);
}
function us() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function ds(e, t) {
	return !(e === "off" || e === "minimal" && t === "light" || us() && t === "light");
}
//#endregion
//#region src/table/feedback/audio.ts
var fs = null, J = null, ps = !1, ms = /* @__PURE__ */ new Map(), hs = /* @__PURE__ */ new Map();
function gs() {
	return is().soundPackId;
}
function _s() {
	if (typeof window > "u") return null;
	try {
		let e = window.AudioContext ?? window.webkitAudioContext;
		return e ? (fs || (fs = new e(), J = fs.createGain(), J.gain.value = .55, J.connect(fs.destination)), fs) : null;
	} catch {
		return null;
	}
}
async function vs() {
	ps = !0;
	let e = _s();
	if (e) {
		if (e.state === "suspended") try {
			await e.resume();
		} catch {}
		xs();
	}
}
function ys(e) {
	if (typeof window > "u") return null;
	try {
		let t = ms.get(e);
		return t || (t = new Audio(e), t.preload = "auto", ms.set(e, t)), t;
	} catch {
		return null;
	}
}
async function bs(e) {
	if (hs.has(e)) return hs.get(e) === !0;
	if (typeof window > "u") return !1;
	try {
		let t = (await fetch(e, { method: "HEAD" })).ok;
		return hs.set(e, t), t;
	} catch {
		return hs.set(e, !1), !1;
	}
}
async function xs(e) {
	if (!ps) return;
	let t = e ?? gs();
	await Promise.all($o(t).map(async (e) => {
		if (!await bs(e)) return;
		let t = ys(e);
		if (t) try {
			t.load();
		} catch {}
	}));
}
async function Ss(e, t = .55) {
	if (!ps || !await bs(e)) return !1;
	let n = ys(e);
	if (!n) return !1;
	try {
		return n.volume = t, n.currentTime = 0, await n.play(), !0;
	} catch {
		return !1;
	}
}
function Cs(e, t, n, r, i, a, o = "sine") {
	let s = e.createOscillator(), c = e.createGain();
	s.type = o, s.frequency.setValueAtTime(n, r), c.gain.setValueAtTime(1e-4, r), c.gain.exponentialRampToValueAtTime(a, r + .008), c.gain.exponentialRampToValueAtTime(1e-4, r + i), s.connect(c), c.connect(t), s.start(r), s.stop(r + i + .02);
}
function ws(e, t, n, r, i, a = 1400) {
	let o = Math.max(256, Math.floor(e.sampleRate * r)), s = e.createBuffer(1, o, e.sampleRate), c = s.getChannelData(0);
	for (let e = 0; e < o; e += 1) c[e] = (Math.random() * 2 - 1) * (1 - e / o);
	let l = e.createBufferSource();
	l.buffer = s;
	let u = e.createBiquadFilter();
	u.type = "bandpass", u.frequency.value = a, u.Q.value = .6;
	let d = e.createGain();
	d.gain.setValueAtTime(i, n), d.gain.exponentialRampToValueAtTime(1e-4, n + r), l.connect(u), u.connect(d), d.connect(t), l.start(n), l.stop(n + r + .01);
}
function Ts(e) {
	let t = _s();
	if (!t || !J) return;
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
	for (let e of r) ws(t, J, n + e, .05, .08 + Math.random() * .04, i);
}
function Es(e) {
	let t = _s();
	if (!t || !J) return;
	let n = t.currentTime;
	ws(t, J, n, .04, .06, e === "wood" ? 700 : 1200), Cs(t, J, e === "arcade" ? 660 : 520, n + .05, .08, .05, "triangle");
}
function Ds(e) {
	let t = _s();
	if (!t || !J) return;
	let n = t.currentTime;
	if (e === "arcade") {
		Cs(t, J, 1046.5, n, .1, .1, "square"), Cs(t, J, 1318.51, n + .08, .14, .08, "square");
		return;
	}
	let r = e === "wood" ? 740 : 880;
	Cs(t, J, r, n, .12, .09, "sine"), Cs(t, J, r * 1.335, n + .07, .16, .07, "triangle"), Cs(t, J, r * 2, n + .14, .1, .04, "sine");
}
function Os(e) {
	let t = _s();
	if (!t || !J) return;
	let n = t.currentTime;
	if (e === "arcade") {
		Cs(t, J, 523.25, n, .12, .09, "square"), Cs(t, J, 659.25, n + .1, .16, .1, "square"), Cs(t, J, 783.99, n + .22, .2, .1, "square"), Cs(t, J, 1046.5, n + .34, .24, .07, "square");
		return;
	}
	let r = e === "wood" ? .92 : 1;
	Cs(t, J, 659.25 * r, n, .14, .08, "sine"), Cs(t, J, 830.61 * r, n + .1, .18, .09, "triangle"), Cs(t, J, 987.77 * r, n + .22, .22, .1, "sine"), Cs(t, J, 1318.51 * r, n + .34, .28, .06, "triangle");
}
function ks(e) {
	let t = _s();
	if (!t || !J) return;
	let n = t.currentTime, r = e === "arcade" ? "sawtooth" : "triangle";
	Cs(t, J, e === "wood" ? 180 : 220, n, .28, .1, r), Cs(t, J, e === "wood" ? 140 : 165, n + .18, .32, .08, r);
}
function As(e) {
	let t = _s();
	if (!t || !J) return;
	let n = t.currentTime;
	if (e === "arcade") {
		Cs(t, J, 440, n, .08, .07, "square"), Cs(t, J, 554.37, n + .1, .12, .08, "square");
		return;
	}
	Cs(t, J, e === "wood" ? 392 : 440, n, .1, .07, "sine"), Cs(t, J, e === "wood" ? 523.25 : 554.37, n + .12, .16, .08, "triangle");
}
var js = {
	shuffle: Ts,
	draw: Es,
	trickWin: Ds,
	bigWin: Os,
	bourre: ks,
	gameStart: As
}, Ms = {
	shuffle: { current: !1 },
	draw: { current: !1 },
	trickWin: { current: !1 },
	bigWin: { current: !1 },
	bourre: { current: !1 },
	gameStart: { current: !1 }
}, Ns = {
	shuffle: 360,
	draw: 280,
	trickWin: 320,
	bigWin: 580,
	bourre: 520,
	gameStart: 320
}, Ps = {
	shuffle: .55,
	draw: .45,
	trickWin: .55,
	bigWin: .6,
	bourre: .5,
	gameStart: .42
};
async function Fs(e) {
	let t = Ms[e];
	if (t.current) return;
	t.current = !0;
	let n = gs(), r = Qo(n, e);
	try {
		!await Ss(r, Ps[e]) && ps && js[e](n);
	} catch {} finally {
		window.setTimeout(() => {
			t.current = !1;
		}, Ns[e]);
	}
}
function Is() {
	Fs("shuffle");
}
function Ls() {
	Fs("draw");
}
function Rs() {
	Fs("trickWin");
}
function zs() {
	Fs("bigWin");
}
function Bs() {
	Fs("bourre");
}
function Vs() {
	Fs("gameStart");
}
function Hs() {
	return typeof window < "u" && !!(window.AudioContext ?? window.webkitAudioContext ?? typeof Audio < "u");
}
function Us() {
	hs.clear();
}
//#endregion
//#region src/table/feedback/haptics.ts
function Ws() {
	return typeof navigator < "u" && typeof navigator.vibrate == "function";
}
function Gs(e) {
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
var Ks = {
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
function qs(e) {
	try {
		return Gs(e) ? !0 : Ws() ? navigator.vibrate(Ks[e]) ?? !1 : !1;
	} catch {
		return !1;
	}
}
function Js() {
	return Ws() || !!(typeof window < "u" && window.BourreHaptics);
}
var Ys = 700, Xs = 500, Zs = 450, Qs = 1200, $s = 2e3, ec = 1500, tc = 280, nc = 0, rc = 0, ic = 0, ac = 0, oc = 0, sc = 0, cc = 0, lc = null, uc = !1;
function dc() {
	return is();
}
function fc(e) {
	ds(dc().hapticsMode, e) && qs(e);
}
function pc(e, t) {
	os(dc().soundMode, e) && t();
}
function mc() {
	if (uc || typeof window > "u") return;
	uc = !0;
	let e = () => {
		vs();
	};
	window.addEventListener("pointerdown", e, {
		once: !0,
		passive: !0
	}), window.addEventListener("keydown", e, { once: !0 });
}
function hc(e = {}) {
	if (Date.now() - nc < Ys) return;
	lc &&= (clearTimeout(lc), null);
	let t = e.delayMs ?? (us() ? 0 : 40);
	lc = window.setTimeout(() => {
		lc = null, nc = Date.now(), pc("shuffle", Is), fc("light");
	}, t);
}
function gc() {
	let e = Date.now();
	e - rc < Xs || (rc = e, pc("draw", Ls), fc("light"));
}
function _c() {
	let e = Date.now();
	e - ic < Zs || (ic = e, pc("trickWin", Rs), fc("medium"));
}
function vc() {
	let e = Date.now();
	e - ac < Qs || (ac = e, pc("bigWin", zs), fc("strong"));
}
function yc() {
	let e = Date.now();
	e - oc < $s || (oc = e, pc("bourre", Bs), fc("medium"));
}
function bc() {
	let e = Date.now();
	e - sc < ec || (sc = e, pc("gameStart", Vs), fc("light"));
}
function xc() {
	let e = Date.now();
	e - cc < tc || (cc = e, fc("light"));
}
function Sc() {
	fc("light");
}
//#endregion
//#region src/table/actionErrorCopy.ts
function Cc(e) {
	let t = String(e ?? "").trim();
	if (!t) return null;
	let n = t.toLowerCase();
	return n === "internal" || n.includes("internal error") ? "The server could not finish that table action. Refresh the page and try again." : t;
}
//#endregion
//#region src/table/theme/cardPacks.ts
var wc = "classic";
function Tc(e) {
	return e === "elegant" || e === "casino" || e === "midnight" ? e : wc;
}
//#endregion
//#region src/table/theme/settings.ts
var Ec = "nbl-table-settings", Dc = {
	focusTable: "F",
	toggleSettings: ",",
	standPat: "P",
	nextTable: "Tab"
}, Oc = {
	classic: "Classic",
	elegant: "Elegant",
	casino: "Casino",
	midnight: "Midnight"
}, kc = {
	themeId: "night-felt",
	cardPackId: wc,
	deckMode: "classic",
	cardScale: "md",
	highContrast: !1,
	tableScale: 1,
	layoutMode: "single",
	hotkeys: { ...Dc }
}, Ac = {
	carbon: "Carbon",
	simple: "Simple",
	"night-felt": "Night Felt",
	arena: "Arena"
};
function jc(e) {
	return Math.max(.85, Math.min(1.35, e));
}
function Mc() {
	try {
		let e = localStorage.getItem(Ec);
		if (!e) return {
			...kc,
			hotkeys: { ...Dc }
		};
		let t = JSON.parse(e);
		return {
			...kc,
			...t,
			cardPackId: Tc(t.cardPackId),
			tableScale: jc(t.tableScale ?? kc.tableScale),
			hotkeys: {
				...Dc,
				...t.hotkeys
			}
		};
	} catch {
		return {
			...kc,
			hotkeys: { ...Dc }
		};
	}
}
function Nc(e) {
	try {
		localStorage.setItem(Ec, JSON.stringify(e));
	} catch {}
}
function Pc(e, t) {
	e.dataset.tableTheme = t.themeId, e.dataset.cardPack = t.cardPackId, e.dataset.deckMode = t.deckMode, e.dataset.cardScale = t.cardScale, e.dataset.highContrast = t.highContrast ? "true" : "false", e.dataset.layoutMode = t.layoutMode, e.style.setProperty("--table-scale", String(t.tableScale));
}
//#endregion
//#region src/table/theme/TableThemeContext.tsx
var Fc = (0, l.createContext)(null);
function Ic({ settings: e, children: t }) {
	let n = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		n.current && Pc(n.current, e);
	}, [e]), /* @__PURE__ */ (0, g.jsx)("div", {
		ref: n,
		className: "btable-room",
		children: t
	});
}
function Lc({ children: e }) {
	let [t, n] = (0, l.useState)(() => Mc()), r = (0, l.useCallback)((e) => {
		n((t) => {
			let n = {
				...t,
				...e,
				hotkeys: {
					...t.hotkeys,
					...e.hotkeys
				}
			};
			return Nc(n), n;
		});
	}, []), i = (0, l.useCallback)(() => {
		let e = {
			...kc,
			hotkeys: { ...kc.hotkeys }
		};
		Nc(e), n(e);
	}, []), a = (0, l.useMemo)(() => ({
		settings: t,
		updateSettings: r,
		resetSettings: i
	}), [
		t,
		r,
		i
	]);
	return /* @__PURE__ */ (0, g.jsx)(Fc.Provider, {
		value: a,
		children: /* @__PURE__ */ (0, g.jsx)(Ic, {
			settings: t,
			children: e
		})
	});
}
//#endregion
//#region src/table/theme/useTableTheme.ts
function Rc() {
	let e = (0, l.useContext)(Fc);
	if (!e) throw Error("useTableTheme must be used within TableThemeProvider");
	return e;
}
//#endregion
//#region src/table/HeroHand.tsx
function zc(e, t, n = []) {
	return [
		`btable-hero btable-hero--bare btable-hero--scale-${e.cardScale}`,
		...n,
		t
	].filter(Boolean).join(" ");
}
function Bc({ className: e = "" }) {
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: `btable-hero btable-hero--bare btable-hero--reserved ${e}`.trim(),
		"aria-hidden": "true",
		"data-testid": "hero-hand"
	});
}
function Vc({ cards: e, phase: t, enrollmentActive: n = !1, isInHand: r = !1, isDealer: i = !1, signedIn: a = !1, isMyTurn: o = !1, drawCompleted: s = !1, maxDrawDiscards: c = 4, legalPlayIndices: u, recommendedPlayIndex: d = null, recommendedDiscardIndices: f = [], handComplete: p = !1, actionFeedback: m, onSubmitDraw: h, onPassDraw: _, onFoldDraw: v, onPlayCard: y, privateHandReady: b = !1, className: x = "", dealStaggerMs: S = 120, drawAnimSubPhase: C = null, drawDiscardCount: w = 0, drawReplaceCount: T = 0, currentUserId: E = null, revealedTrumpIndex: D = null, trumpMergeActive: O = !1, trumpDisabledIndex: k = null, handNumber: A = 0, tableRootRef: ee, pileIndexRef: j, onDiscardCommitted: M, onUserActivity: ne, skipHeroDealMotion: N = !1 }) {
	let { settings: P } = Rc(), [re, F] = (0, l.useState)(/* @__PURE__ */ new Set()), [I, L] = (0, l.useState)(null), [R, z] = (0, l.useState)(null), [ie, ae] = (0, l.useState)(null), [B, V] = (0, l.useState)(!1), [oe, H] = (0, l.useState)(null), [se, ce] = (0, l.useState)(null), [le, ue] = (0, l.useState)(null), [de, fe] = (0, l.useState)(() => xo()), [pe, me] = (0, l.useState)(!1), [he, ge] = (0, l.useState)(!1), [_e, ve] = (0, l.useState)(!1), [ye, be] = (0, l.useState)([]), xe = (0, l.useRef)(/* @__PURE__ */ new Set()), Se = (0, l.useRef)(null), Ce = (0, l.useRef)(!1), we = (0, l.useRef)(null), Te = (0, l.useRef)(null), [Ee, De] = (0, l.useState)(!1), Oe = (0, l.useRef)(async () => {}), ke = Xa(t), Ae = (0, l.useMemo)(() => e.map(Ga), [e]), je = (0, l.useMemo)(() => e.map((e) => `${e.rank}-${e.suit}`).join("|"), [e]), Me = (0, l.useMemo)(() => f.slice().sort((e, t) => e - t).join(","), [f]), Ne = t === "draw", U = t === "play", Pe = (0, l.useCallback)((e, t) => D === t ? O ? "hand__slot--trump-merge-target" : "hand__slot--trump-revealed" : "", [D, O]);
	(0, l.useEffect)(() => {
		if (N || !ke || e.length === 0) return;
		let t = new Set(e.map((e) => `${e.rank}-${e.suit}`)), n = xe.current, r = [...t].some((e) => !n.has(e));
		if (xe.current = t, !r || n.size > 0) return;
		me(!0), z(null), L(null);
		let i = Wa(e.length, S), a = window.setTimeout(() => me(!1), i);
		return () => window.clearTimeout(a);
	}, [
		e,
		ke,
		S,
		N
	]), (0, l.useEffect)(() => {
		(C === "done" || C === null) && be([]);
	}, [C]), Ua(Se, {
		dealing: pe,
		dealStaggerMs: S,
		drawAnimSubPhase: C,
		drawDiscardCount: w,
		drawReplaceCount: T,
		pendingDiscardIndices: ye,
		standPatPulse: he,
		foldOutPulse: _e,
		playingIndex: R,
		cards: e,
		handNumber: A,
		playerId: E,
		tableRootRef: ee,
		pileIndexRef: j,
		onDiscardCommitted: M,
		skipHeroDealMotion: N
	});
	let Fe = (0, l.useCallback)(() => {
		we.current != null && (window.clearTimeout(we.current), we.current = null), Te.current = null;
	}, []);
	(0, l.useEffect)(() => () => Fe(), [Fe]), (0, l.useEffect)(() => {
		Fe(), L(null), F(/* @__PURE__ */ new Set()), De(!1), ae(null), ce(null), ue(null), H(null);
	}, [
		t,
		je,
		Fe
	]), (0, l.useEffect)(() => {
		I !== null && (Wo(I, u) || (L(null), Te.current = null, Fe()));
	}, [
		u,
		I,
		Fe
	]);
	let Ie = B || m?.status === "loading" || R !== null;
	(0, l.useEffect)(() => {
		!de || !Ne || s || Ee || F(new Set(f));
	}, [
		de,
		Ne,
		s,
		Ee,
		Me,
		f
	]), (0, l.useEffect)(() => {
		if (!(!U || !o || I === null || Ce.current || Ie)) {
			if (!Wo(I, u)) {
				L(null), Te.current = null;
				return;
			}
			we.current ??= (Te.current = I, window.setTimeout(() => {
				we.current = null;
				let e = Te.current;
				Te.current = null, e !== null && !Ce.current && Oe.current(e);
			}, go.autoPlayPreselect));
		}
	}, [
		U,
		o,
		I,
		u,
		Ie
	]), (0, l.useEffect)(() => {
		(m?.status === "success" || m?.status === "error") && (z(null), L(null), Fe(), Ce.current = !1);
	}, [m?.status, Fe]);
	let Le = (0, l.useRef)(void 0);
	(0, l.useEffect)(() => {
		let e = m?.status, t = Le.current;
		Le.current = e, t === "error" && e !== "error" && H(null);
	}, [m?.status]);
	let Re = P.cardScale === "lg" ? "md" : "sm", ze = Cc(m?.status === "error" ? m.message : oe), Be = Ka(t, n);
	(0, l.useEffect)(() => {
		ne && Ne && re.size > 0 && ne();
	}, [
		Ne,
		re.size,
		ne
	]), (0, l.useEffect)(() => {
		ne && U && I !== null && ne();
	}, [
		U,
		I,
		ne
	]);
	let Ve = (0, l.useCallback)(() => {
		ne?.();
	}, [ne]), He = (0, l.useCallback)((e) => {
		Ie || k === e || (De(!0), Ve(), H(null), F((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.size < c ? n.add(e) : H(`You may discard at most ${c} cards`), n;
		}));
	}, [
		Ie,
		c,
		k,
		Ve
	]), Ue = (0, l.useCallback)(async (e) => {
		if (Ce.current || Ie || !y || !Wo(e, u)) return;
		Fe(), Ce.current = !0, L(null), z(e), H(null);
		let t = Ae[e];
		E && t && po(E, no({
			playerId: E,
			card: {
				rank: String(t.rank),
				suit: String(t.suit)
			}
		}), e);
		try {
			await Promise.resolve(y(e)), z(null), Ce.current = !1;
		} catch {
			z(null), Ce.current = !1;
		}
	}, [
		Ie,
		u,
		y,
		E,
		Ae,
		Fe
	]), We = (0, l.useCallback)((e) => {
		if (!(Ce.current || Ie || !y || t !== "play")) {
			if (!Wo(e, u)) {
				o && (xc(), Fe(), L(null), ce(e), ue(e), window.setTimeout(() => {
					ce(null), ue(null);
				}, go.illegalFlash), H("Illegal play"));
				return;
			}
			Fe(), L(e), H(null), Ve(), Te.current = e, o && (we.current = window.setTimeout(() => {
				we.current = null;
				let t = Te.current;
				Te.current = null, t === e && !Ce.current && Oe.current(e);
			}, go.autoPlayPreselect));
		}
	}, [
		Ie,
		Fe,
		o,
		u,
		y,
		t,
		Ve
	]);
	Oe.current = Ue;
	let Ge = (0, l.useCallback)(async (e) => {
		if (!(!h || Ie)) {
			if (Ve(), e.length > c) {
				H(`You may discard at most ${c} cards`);
				return;
			}
			V(!0), H(null), be([...e]);
			try {
				await h(e), F(/* @__PURE__ */ new Set());
			} catch {} finally {
				V(!1);
			}
		}
	}, [
		h,
		Ie,
		c,
		Ve
	]), Ke = (0, l.useCallback)(async () => {
		if (!(!_ || Ie)) {
			Ve(), V(!0), H(null);
			try {
				await _(), F(/* @__PURE__ */ new Set()), ge(!0), window.setTimeout(() => ge(!1), 700);
			} catch {} finally {
				V(!1);
			}
		}
	}, [
		_,
		Ie,
		Ve
	]), qe = (0, l.useCallback)(async () => {
		if (!(!v || Ie)) {
			Ve(), ve(!0), V(!0), H(null);
			try {
				await v(), F(/* @__PURE__ */ new Set());
			} catch {
				ve(!1);
			} finally {
				V(!1);
			}
		}
	}, [
		v,
		Ie,
		Ve
	]), Je = (0, l.useCallback)((e) => {
		xc(), Fe(), L(null), ce(e), ue(e), window.setTimeout(() => {
			ce(null), ue(null);
		}, go.illegalFlash), H("Illegal play");
	}, [Fe]), Ye = (0, l.useCallback)((e) => {
		if (fe(e), So(e), e) {
			De(!1), Ne && !s && F(new Set(f));
			return;
		}
		Ee || F(/* @__PURE__ */ new Set());
	}, [
		Ee,
		Ne,
		s,
		f
	]), Xe = a && r && (Ne || U), Ze = (0, l.useMemo)(() => qo({
		selectedDraw: re,
		drawSelectionTouched: Ee,
		bestPlayEnabled: de,
		recommendedDiscardIndices: f
	}), [
		re,
		Ee,
		de,
		Me,
		f
	]), Qe = () => Xe ? /* @__PURE__ */ (0, g.jsxs)("label", {
		className: "btable-hero__best-play",
		children: [/* @__PURE__ */ (0, g.jsx)("input", {
			type: "checkbox",
			className: "btable-hero__best-play-input",
			checked: de,
			onChange: (e) => Ye(e.target.checked),
			"data-testid": "best-play-checkbox"
		}), /* @__PURE__ */ (0, g.jsx)("span", {
			className: "btable-hero__best-play-label",
			children: "Best Play"
		})]
	}) : null;
	if (!a) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: zc(P, x),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "Sign in to see your dealt cards."
		})
	});
	if (!r && !n && !ke) return /* @__PURE__ */ (0, g.jsx)(Bc, { className: x });
	if (ke && r && e.length === 0) return p && n ? /* @__PURE__ */ (0, g.jsx)(Bc, { className: x }) : /* @__PURE__ */ (0, g.jsxs)("div", {
		className: zc(P, x),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: [/* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: b ? "Cards not available — leave and re-open the session, or refresh the page." : "Loading your cards…"
		}), /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: Qe()
		})]
	});
	if (ke && !r && (t === "draw" || t === "play")) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: zc(P, x),
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "You sat out this hand."
		})
	});
	if (e.length === 0 && !i) return Xe ? /* @__PURE__ */ (0, g.jsx)("div", {
		className: zc(P, x, ["btable-hero--reserved"]),
		"data-testid": "hero-hand",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: Qe()
		})
	}) : /* @__PURE__ */ (0, g.jsx)(Bc, { className: x });
	let $e = Xe && U && de && I === null && d !== null && d >= 0, et = (e, t) => D === t ? "trump" : k === t && (Ne || U) ? "muted" : R === t || le === t || se === t ? "default" : Ne && re.has(t) ? "draw-selected" : U && I === t ? "play-preselected" : $e && d === t ? "play-recommended" : U && u && !u.includes(t) ? "muted" : "default", tt = ke && r && !(U && o), nt = "none";
	U && r ? nt = "play" : Ne && r && !s ? nt = "draw-select" : tt && (nt = "peek");
	let rt = Ze.length, it = Ne && !s && o;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: zc(P, x, [
			pe && !N ? "btable-hero--dealing" : "",
			D === null ? "" : "btable-hero--trump-reveal",
			O ? "btable-hero--trump-merge" : "",
			Ne && o && !s ? "btable-hero--draw-select" : "",
			C === "discard" && w > 0 ? "btable-hero--draw-discard" : "",
			C === "receive" && T > 0 ? "btable-hero--draw-receive" : "",
			it ? "btable-hero--draw-actions" : "",
			Ne && o && !s || U && o ? "btable-hero--your-turn" : "",
			(Ne || U) && r && !o ? "btable-hero--waiting-turn" : "",
			he ? "btable-hero--stand-pat" : "",
			_e ? "btable-hero--fold-out" : ""
		]),
		style: { "--deal-card-stagger-ms": `${S}ms` },
		"data-testid": "hero-hand",
		"aria-label": `Your dealt cards — ${Be}`,
		children: [
			/* @__PURE__ */ (0, g.jsxs)("p", {
				className: "btable-sr-only",
				"aria-live": "polite",
				children: [
					Be,
					Ne && !s && o && " — tap cards to discard; red border marks your selection",
					U && o && " — tap a legal card to play",
					de && U && " — green outline marks Best Play suggestions"
				]
			}),
			/* @__PURE__ */ (0, g.jsxs)("div", {
				ref: Se,
				className: "btable-hero__hand-3d",
				"data-trick-play-origin": E ?? void 0,
				"data-trick-play-origin-active": U && o && E ? E : void 0,
				children: [/* @__PURE__ */ (0, g.jsx)("div", {
					className: "btable-hero__hand-row",
					"data-hero-play-turn": U && o ? "true" : void 0,
					children: /* @__PURE__ */ (0, g.jsx)(te, {
						cards: Ae,
						size: Re,
						fan: !0,
						dealSeatPlayerId: E,
						stateFor: et,
						slotClassFor: Pe,
						peekIndex: ie,
						onCardPeek: tt ? ae : void 0,
						cardTestId: U && o ? "play-button" : void 0,
						cardInteraction: {
							mode: nt,
							isMyTurn: o,
							legalPlayIndices: u,
							playingIndex: R,
							illegalShakeIndex: se,
							illegalFlashIndex: le,
							busy: Ie,
							showPlayableHint: !1,
							allowPlayPreselect: U && r && !o,
							trickPlayOriginPlayerId: E,
							onPlayCard: We,
							onSelectCard: He,
							onIllegalPlay: Je,
							onPeek: ae
						}
					})
				}), Qe()]
			}),
			U && !o && I !== null && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-hero__hint",
				"data-testid": "play-preselect-hint",
				children: "Your selected card will play on your turn"
			}),
			ze && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-hero__error",
				role: "alert",
				children: ze
			}),
			/* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-hero__actions-slot",
				"aria-hidden": !it,
				children: it && /* @__PURE__ */ (0, g.jsxs)("div", {
					className: "btable-hero__actions btable-hero__actions--triple",
					children: [
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--primary",
							"data-testid": "draw-button",
							disabled: Ie,
							"aria-busy": Ie,
							onClick: () => Ge(Ze),
							children: Ie ? "Drawing…" : `Draw${rt > 0 ? ` (${rt})` : ""}`
						}),
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--secondary-muted",
							"data-testid": "pass-draw-button",
							disabled: Ie,
							onClick: () => Ke(),
							children: "Stand pat"
						}),
						/* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--secondary-muted",
							"data-testid": "im-out-button",
							disabled: Ie,
							onClick: () => qe(),
							children: "I'm Out"
						})
					]
				})
			})
		]
	});
}
//#endregion
//#region src/table/layout/seatPresetAnchors.ts
var Hc = {
	0: {
		x: 50,
		y: 95,
		region: "bottom"
	},
	1: {
		x: 10,
		y: 88,
		region: "bottom"
	},
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
	5: {
		x: 90,
		y: 88,
		region: "bottom"
	}
}, Uc = {
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
}, Wc = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: Uc[1],
	2: Uc[2],
	3: Uc[3],
	4: Uc[4],
	5: Uc[5],
	6: {
		x: 98,
		y: 40.4,
		region: "right"
	},
	7: Uc[6]
};
Uc[1], Uc[6], Uc[4];
var Gc = {
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
}, Kc = {
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
}, qc = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: Gc[1],
	2: Gc[2],
	3: Gc[3],
	4: Gc[4],
	5: Gc[5],
	6: {
		x: 92,
		y: 40.4,
		region: "right"
	},
	7: Gc[6]
}, Jc = {
	0: {
		x: 50,
		y: 89,
		region: "bottom"
	},
	1: Kc[1],
	2: Kc[2],
	3: Kc[3],
	4: Kc[4],
	5: Kc[5],
	6: {
		x: 92,
		y: 40.4,
		region: "right"
	},
	7: Kc[6]
};
Gc[1], Gc[6], Gc[4];
function Yc(e) {
	return e === "landscape" ? Kc : Gc;
}
function Xc(e) {
	return e === "landscape" ? Jc : qc;
}
function Zc(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function Qc(e, t) {
	return Zc(e, t) >= 5;
}
function $c(e, t, n) {
	if (n !== "play") return [];
	let r = [...new Set(t.filter(Boolean))];
	return r.length < 2 || 5 - Zc(e, r) != 1 ? [] : r.filter((t) => (e[t] ?? 0) === 0);
}
function el(e, t, n, r) {
	return $c(t, n, r).includes(e);
}
function tl(e, t) {
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
function nl(e) {
	return `$${e.toLocaleString("en-US")}`;
}
function rl(e) {
	let t = Math.round(Number(e) * 100) / 100;
	return !Number.isFinite(t) || t <= 0 ? "$0" : t < 1 ? `${Math.round(t * 100)}¢` : Math.round(t * 100) % 100 == 0 ? `$${Math.round(t).toLocaleString("en-US")}` : `$${t.toFixed(2)}`;
}
function il(e) {
	let t = Number(e) || 0;
	return t > 0 ? `+${nl(t)}` : t < 0 ? `−${nl(Math.abs(t))}` : nl(0);
}
function al(e) {
	return nl(Math.max(0, Number(e) || 0));
}
function ol(e, t, n) {
	return e == null || n.anteAlreadyPosted || !n.inHand || !n.anteAnimActive ? e : Math.max(0, e - Math.max(0, t));
}
function sl(e) {
	return (e || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((e) => e[0]?.toUpperCase() || "").join("") || "?";
}
function cl(e) {
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
function ll(e) {
	let t = Math.cos(e), n = Math.sin(e);
	return Math.abs(n) >= Math.abs(t) ? n > 0 ? "bottom" : "top" : t > 0 ? "right" : "left";
}
var ul = Wc, dl = Uc, fl = Hc;
function pl(e, t) {
	let { rx: n, ry: r, outset: i } = cl(t), a = e / t * Math.PI * 2 + Math.PI / 2, o = Math.cos(a), s = Math.sin(a);
	return {
		x: 50 + n * o + o * i,
		y: 50 + r * s + s * i,
		region: ll(a)
	};
}
function ml(e, t) {
	let n = Math.max(2, Math.min(8, t || 2));
	if (n <= 0) return {
		x: 50,
		y: 50,
		region: "bottom"
	};
	if (n === 6) {
		let t = fl[e];
		if (t) return t;
	}
	if (n === 7) {
		let t = dl[e];
		if (t) return t;
	}
	if (n >= 8) {
		let t = ul[e];
		if (t) return t;
	}
	return pl(e, n);
}
function hl(e) {
	let t = Math.max(2, Math.min(8, e || 2));
	return t === 2 ? 1.04 : t === 3 ? .94 : t === 4 ? .98 : t === 5 ? 1.08 : t === 6 ? 1.12 : t === 7 ? 1.16 : 1.2;
}
var gl = 1850, _l = 2050, vl = 1080, yl = 4e3;
function bl(e) {
	return e !== "live";
}
function xl(e = !1) {
	let t = e ? .55 : 1;
	return {
		cardLandMs: Math.round(560 * t),
		postTrickReadMs: Math.round(gl * t),
		winnerRevealMs: Math.round(400 * t),
		trickSweepMs: Math.round(vl * t),
		nextLeadGapMs: Math.round(230 * t),
		trumpBeatReadMs: Math.round(_l * t)
	};
}
function Sl(e) {
	let t = xl(e.reducedMotion), n = e.trumpBeat ? t.trumpBeatReadMs : t.postTrickReadMs, r = Math.min(t.winnerRevealMs, n - 200), i = Math.max(200, n - r), a = t.trickSweepMs, o = t.nextLeadGapMs;
	return {
		readBeforeWinnerMs: i,
		winnerRevealMs: r,
		readTotalMs: n,
		sweepMs: a,
		nextLeadGapMs: o,
		pipelineMs: n + a + o
	};
}
function Cl(e, t, n) {
	let r = n.length > 0 ? n : [...new Set([...Object.keys(e), ...Object.keys(t)])];
	for (let n of r) if ((t[n] ?? 0) > (e[n] ?? 0)) return n;
	return null;
}
function wl(e, t, n) {
	return e.length > 0 ? e : [...new Set([...Object.keys(t), ...Object.keys(n)])];
}
function Tl(e) {
	return e?.plays?.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
}
function El(e, t, n) {
	return e.length ? e.length === 1 ? e[0].playerId : !t || !n ? e[e.length - 1].playerId : Vo(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n) : null;
}
function Dl(e) {
	let t = Tl(e.prevTrick), n = e.playedCards?.filter((t) => t.trickNumber === e.trickNumber).map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
	return n.length > t.length ? n : t;
}
function Ol(e, t, n) {
	if (!e.length || !t || !n || t === n) return !1;
	let r = Vo(e.map((e) => ({
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
function kl(e) {
	let { prevTricks: t, nextTricks: n, prevTrick: r, playedCards: i } = e, a = wl(e.participantIds, t, n), o = Zc(t, a), s = Zc(n, a);
	if (s <= o) return null;
	let c = Cl(t, n, a), l = r?.trickNumber ?? s, u = Dl({
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
function Al() {
	return typeof window > "u" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region src/table/gameFlowDebug.ts
var jl = "nbl-game-flow-debug", Ml = !1, Nl = null;
function Pl() {
	if (Ml) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(jl) === "1" ? !0 : new URLSearchParams(window.location.search).has("gameFlowDebug");
	} catch {
		return !1;
	}
}
function Fl(e, t, n) {
	if (!Pl()) return;
	let r = `[nbl-flow ${typeof performance < "u" ? `${performance.now().toFixed(1)}ms` : ""}] ${e} :: ${t}`;
	if (Nl) {
		Nl(r.trim(), n);
		return;
	}
	console.info(r, n ?? "");
}
//#endregion
//#region src/table/TrickPlaySlot.tsx
function Y(e, t, n, r, i) {
	r.current = !1, e(!0), t("static"), n(null), i && Pl() && Fl("TrickPlaySlot", "fly-complete", i);
}
function Il({ play: e, index: t, presentationPhase: n, displayCount: r, playerName: i, leaderPlayerId: a = null, winnerPlayerId: o = null, instantPlace: s = !1 }) {
	let c = (0, l.useRef)(null), [u, d] = (0, l.useState)("static"), [f, p] = (0, l.useState)(null), [m, h] = (0, l.useState)(!1), v = (0, l.useRef)(!1), y = no(e), b = a != null && e.playerId === a, x = o != null && e.playerId === o, S = n === "live", C = t === r - 1 && S, w = m, T = b && (n === "live" || n === "trickComplete"), E = x && n !== "live" && n !== "trickComplete";
	(0, l.useLayoutEffect)(() => {
		Pl() && Fl("TrickPlaySlot", "play-enter", {
			playKey: y,
			index: t,
			instantPlace: s,
			isLanding: C
		}), h(!1), v.current = !1, d("static"), p(null);
	}, [y]), (0, l.useLayoutEffect)(() => {
		if (m) return;
		if (s || !S) {
			Y(h, d, p, v, {
				playKey: y,
				index: t
			});
			return;
		}
		if (!C) {
			Y(h, d, p, v, {
				playKey: y,
				index: t
			});
			return;
		}
		if (typeof document > "u") return;
		let n = c.current;
		if (!n) return;
		let r = n.querySelector(".pcard");
		if (!r) return;
		let i = uo(e.playerId, y);
		if (!i) {
			Y(h, d, p, v, {
				playKey: y,
				index: t
			});
			return;
		}
		let a = Al(), o = a ? 217 : 395, l = a ? 91 : 165;
		v.current = !0, p(mo(i, n.getBoundingClientRect(), r.getBoundingClientRect())), d("pending"), Pl() && Fl("TrickPlaySlot", "fly-start", {
			playKey: y,
			index: t,
			travelMs: o,
			settleMs: l
		});
		let u = window.setTimeout(() => d("travel"), 0), f = window.setTimeout(() => d("settle"), o), g = window.setTimeout(() => {
			Y(h, d, p, v, {
				playKey: y,
				index: t
			});
		}, o + l);
		return () => {
			window.clearTimeout(u), window.clearTimeout(f), window.clearTimeout(g);
		};
	}, [
		m,
		s,
		C,
		S,
		e.playerId,
		y
	]);
	let D = {
		"--slot-index": t,
		zIndex: 10 + t,
		...f ? {
			"--fly-dx": `${f.dx}px`,
			"--fly-dy": `${f.dy}px`
		} : {}
	};
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: c,
		className: [
			"btrick__play",
			m ? "btrick__play--landed" : "",
			w ? "btrick__play--settled" : "",
			m && u === "static" ? "btrick__play--static-landed" : "",
			u === "travel" ? "btrick__play--fly-from-hand" : "",
			u === "pending" ? "btrick__play--fly-pending" : "",
			u === "land" ? "btrick__play--land" : "",
			u === "settle" ? "btrick__play--settle" : "",
			T ? "btrick__play--leading" : "",
			x && E ? "btrick__play--winner" : ""
		].filter(Boolean).join(" "),
		style: D,
		"data-slot-index": t,
		children: [/* @__PURE__ */ (0, g.jsx)(_, {
			card: Ga(e.card),
			size: "sm",
			state: E && x ? "winner" : T && b ? "trick-leading" : "default"
		}), /* @__PURE__ */ (0, g.jsx)("span", {
			className: "btrick__name muted small",
			children: i
		})]
	});
}
//#endregion
//#region src/table/TrickRow.tsx
function X({ displayPlays: e = [], leaderPlayerId: t = null, winnerPlayerId: n = null, showWinnerTag: r = !1, presentationPhase: i = "live", playerNames: a = {}, variant: o = "live", instantTrickPlays: s = !1, peakCardCount: c = 0 }) {
	(0, l.useEffect)(() => {
		Pl() && Fl("TrickRow", e.length === 0 ? "trick-empty" : "trick-cards", {
			count: e.length,
			phase: i
		});
	}, [e.length, i]);
	let u = Math.max(e.length, c, 1);
	if (e.length === 0) return /* @__PURE__ */ (0, g.jsx)("div", {
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
	let d = n ? a[n] ?? "Player" : null, f = i === "trickComplete" || i === "winnerReveal", p = i === "collectTrick", m = o === "echo";
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: [
			"btrick",
			m ? "btrick--echo-pipeline" : "",
			f ? "btrick--hold" : "",
			p ? "btrick--rake" : ""
		].filter(Boolean).join(" "),
		"aria-label": m ? void 0 : "Current trick",
		"aria-hidden": m ? !0 : void 0,
		"aria-live": m ? void 0 : "polite",
		"data-testid": m ? "trick-row-echo" : "trick-row",
		"data-trick-phase": i,
		"data-trick-card-count": e.length,
		"data-trick-variant": o,
		children: /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "btrick__surface",
			children: [r && d && /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btrick__winner-tag",
				"data-testid": "trick-winner-tag",
				children: [d, " takes it"]
			}), /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btrick__cards",
				role: "list",
				"aria-label": "Cards in trick",
				style: { "--trick-card-count": u },
				children: e.map((r, o) => /* @__PURE__ */ (0, g.jsx)(Il, {
					play: r,
					index: o,
					presentationPhase: m ? "winnerReveal" : i,
					displayCount: e.length,
					playerName: a[r.playerId] ?? "Player",
					leaderPlayerId: t,
					winnerPlayerId: n,
					instantPlace: s
				}, `${r.playerId}-${r.card.rank}-${r.card.suit}`))
			})]
		})
	});
}
//#endregion
//#region src/table/DiscardPile.tsx
function Z({ cards: e }) {
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
function Ll({ potMetrics: e, participantCount: t, trumpUpcard: n, trumpSuit: r, phase: i, enrollmentActive: a = !1, remainingDeckCount: o, trickDisplayPlays: s = [], trickLeadSuit: c = null, trickLeaderPlayerId: u = null, trickWinnerPlayerId: f = null, trickShowWinnerTag: p = !1, trickPresentationPhase: m = "live", trickEchoPlays: h = [], trickEchoWinnerId: v = null, trickEchoPhase: y = "live", showFinalTrickEcho: b = !1, playerNames: x = {}, anteAnimActive: S = !1, trumpRevealActive: C = !1, drawAnimPlayerId: w = null, drawAnimSubPhase: T = "done", drawDiscardCount: E = 0, settleAnimActive: D = !1, settleCarryOver: O = !1, potTick: k = 0, trumpReminderPulse: A = 0, hideCenterTrump: ee = !1, showTrumpSuitReminder: j = !1, instantTrickPlays: te = !1, peakTrickPlayCount: M = 0, discardPileCards: ne = [] }) {
	let N = Ka(i, a), P = u ?? ((m === "live" || m === "trickComplete") && s.length > 0 ? El(s, c ?? s[0]?.card.suit ?? null, r ?? null) : null), re = m !== "live" && m !== "nextLeadReady", F = s.length, I = F > 0 || M > F || te, [L, R] = (0, l.useState)(n ?? null);
	(0, l.useEffect)(() => {
		if (n) {
			R(n);
			return;
		}
		if (L) {
			if (I || re) {
				let e = window.setTimeout(() => R(null), 760);
				return () => window.clearTimeout(e);
			}
			R(null);
		}
	}, [
		n,
		I,
		re,
		L
	]);
	let z = !!L && !ee, ie = j || !z && !!r && i === "play", ae = z ? `${L.rank}-${L.suit}` : "trump-slot", B = b || D && h.length > 0 && F === 0;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: "table-center-cluster",
		"aria-label": "Table center",
		children: [/* @__PURE__ */ (0, g.jsxs)("div", {
			className: "deck-stack",
			"aria-label": "Deck and trump",
			children: [z ? /* @__PURE__ */ (0, g.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"bpot__trump--deal",
					C ? "bpot__trump--reveal" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-button",
				children: [/* @__PURE__ */ (0, g.jsx)(_, {
					card: {
						rank: L.rank,
						suit: L.suit
					},
					size: "sm",
					state: "trump"
				}), /* @__PURE__ */ (0, g.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, ae) : ie ? /* @__PURE__ */ (0, g.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"deck-stack__trump--suit-reminder",
					A > 0 ? "deck-stack__trump--suit-reminder-pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-suit-reminder",
				"aria-label": `Trump suit: ${Ya(r)}`,
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
				re ? "center-play--trick-resolving" : "",
				B ? "center-play--final-trick-echo" : ""
			].filter(Boolean).join(" "),
			"data-trick-phase": m,
			"data-trick-cards": F,
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
				i === "draw" ? /* @__PURE__ */ (0, g.jsx)(Z, { cards: ne }) : null,
				/* @__PURE__ */ (0, g.jsxs)("div", {
					className: "center-play__phase",
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, g.jsx)("span", {
							className: `bpot__phase-tag bpot__phase-tag--${i ?? "waiting"}`,
							"data-testid": "phase-tag-center",
							"data-phase": i ?? "waiting",
							children: N
						}),
						z && r && /* @__PURE__ */ (0, g.jsx)("span", {
							className: "center-play__trump-suit muted small",
							children: Ya(r)
						}),
						ie && /* @__PURE__ */ (0, g.jsxs)("span", {
							className: "center-play__trump-suit center-play__trump-suit--reminder muted small",
							children: [Ya(r), " trump"]
						})
					]
				}),
				/* @__PURE__ */ (0, g.jsxs)("div", {
					className: "center-play__trick-stage",
					children: [/* @__PURE__ */ (0, g.jsx)("div", {
						className: "center-play__trick-live",
						children: /* @__PURE__ */ (0, g.jsx)(X, {
							displayPlays: s,
							leaderPlayerId: P,
							winnerPlayerId: f,
							showWinnerTag: p,
							presentationPhase: m,
							playerNames: x,
							instantTrickPlays: te,
							peakCardCount: M
						})
					}), B && /* @__PURE__ */ (0, g.jsx)("div", {
						className: "center-play__trick-echo",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, g.jsx)(X, {
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
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Table pot" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: nl(e.currentPot) })]
						}, k > 0 ? `pot-${k}` : "pot-static"),
						/* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat",
							"data-testid": "ante-display",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Ante / hand" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: rl(e.anteAmount) })]
						}),
						e.limEnabled && /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [/* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Cap" }), /* @__PURE__ */ (0, g.jsxs)("dd", { children: [nl(e.potCap), /* @__PURE__ */ (0, g.jsx)("span", {
								className: "bpot__lim-tag",
								children: "LmT"
							})] })]
						}), /* @__PURE__ */ (0, g.jsxs)("div", {
							className: "bpot__stat bpot__stat--highlight",
							children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Max win" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: nl(e.maxWinThisHand) })]
						})] })
					]
				}),
				e.limEnabled && e.overflow > 0 && /* @__PURE__ */ (0, g.jsxs)("div", {
					className: "center-play__carry muted small",
					children: [
						"+",
						nl(e.overflow),
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
function Rl({ label: e, value: t, accent: n, title: r }) {
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
function zl({ player: e, compact: t = !1 }) {
	let n = e.apeScore != null && !e.isRobot;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: `bhud${t ? " bhud--compact" : ""}`,
		"aria-label": `${e.displayName} stats`,
		children: [n && /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
			/* @__PURE__ */ (0, g.jsx)(Rl, {
				label: "Ape",
				value: e.apeScore ?? 0,
				accent: !0,
				title: "Ape Score"
			}),
			e.apeClass && /* @__PURE__ */ (0, g.jsx)(Rl, {
				label: "Class",
				value: e.apeClass,
				title: "Ape Class"
			}),
			e.apeStatus && /* @__PURE__ */ (0, g.jsx)(Rl, {
				label: "Status",
				value: e.apeStatus,
				title: "Ape Status"
			})
		] }), e.sessionStreak != null && e.sessionStreak > 0 && /* @__PURE__ */ (0, g.jsx)(Rl, {
			label: "Streak",
			value: e.sessionStreak,
			title: "Hands won this session"
		})]
	});
}
//#endregion
//#region src/table/TurnCountdownRing.tsx
var Bl = 22, Vl = 2 * Math.PI * Bl;
function Hl({ progress: e, segment: t, reducedMotion: n = Al() }) {
	let r = Vl * (1 - Math.max(0, Math.min(1, e)));
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
			r: Bl,
			fill: "none"
		}), /* @__PURE__ */ (0, g.jsx)("circle", {
			className: `bseat__turn-countdown-progress bseat__turn-countdown-progress--${t}`,
			cx: "24",
			cy: "24",
			r: Bl,
			fill: "none",
			strokeDasharray: Vl,
			strokeDashoffset: r,
			transform: "rotate(-90 24 24)"
		})]
	});
}
//#endregion
//#region src/table/Seat.tsx
function Ul({ player: e, region: t, handLane: n = "below", style: r, clockwiseDealing: i = !1, onToggleInHand: a, onPassEnrollment: o, onTrickDelta: s, onReaction: c }) {
	let [u, d] = (0, l.useState)(!1), f = (0, l.useCallback)(() => {
		d((e) => !e);
	}, []), p = e.tricksThisHand, m = Math.max(0, e.holeCardCount ?? 0), h = p > 0, v = !!(e.showHoleCards && !e.isSelf && e.inHand && m > 0), y = e.bankroll != null, b = e.bourreAlert === "pulse", x = e.bourreAlert === "marker" || e.bourreAlert === "pulse", S = !!e.bourrePressure, C = S && e.isSelf, w = e.revealedTrumpIndex != null && e.revealedTrumpUpcard;
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
										e.isWinner || e.isTrickCapture ? "bseat__trick-badge--tick" : ""
									].filter(Boolean).join(" "),
									"aria-label": `${p} tricks won`,
									title: `${p} trick${p === 1 ? "" : "s"} won`,
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
								S && /* @__PURE__ */ (0, g.jsx)("span", {
									className: "bseat__bourre-pressure-badge",
									"data-testid": "bourre-pressure-badge",
									"aria-label": C ? "You need this trick to avoid bourré" : "At risk of bourré",
									title: C ? "Win this trick or go bourré" : "Must win this trick",
									children: C ? "Bourré risk!" : "0 tricks"
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
									"aria-label": `${e.displayName} seat`,
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
											className: "bseat__avatar bseat__avatar--initials",
											"aria-hidden": "true",
											children: sl(e.displayName)
										}),
										e.inHand && /* @__PURE__ */ (0, g.jsx)("span", {
											className: "bseat__in-badge",
											title: "In this hand"
										}),
										S && /* @__PURE__ */ (0, g.jsx)("span", {
											className: "bseat__bourre-pressure-ring",
											"aria-hidden": "true"
										}),
										b && !S && /* @__PURE__ */ (0, g.jsx)("span", {
											className: "bseat__bourre-ring",
											"aria-hidden": "true"
										}),
										e.turnCountdown && /* @__PURE__ */ (0, g.jsx)(Hl, {
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
							"aria-label": `Chips ${al(e.bankroll ?? 0)}`,
							title: `Chips ${al(e.bankroll ?? 0)}`,
							children: al(e.bankroll ?? 0)
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
					}),
					/* @__PURE__ */ (0, g.jsx)("div", {
						className: "bseat__meta",
						"data-testid": "seat-meta-panel",
						"aria-hidden": !u,
						children: /* @__PURE__ */ (0, g.jsx)(zl, {
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
function Wl(e, t) {
	let n = [...new Set(e.filter(Boolean))];
	if (!n.length) return [];
	let r = t.seatedIds?.filter((e) => n.includes(e));
	if (r?.length === n.length) return r;
	let i = t.handEnrollment?.orderedPlayerIds?.filter((e) => n.includes(e));
	if (i?.length === n.length) return i;
	let a = Co(t.dealerId, n), o = n.filter((e) => !a.includes(e));
	return o.length ? [...a, ...o] : a;
}
function Gl(e, t, n) {
	let r = new Map(e.map((e) => [e.playerId, e])), i = Wl(e.map((e) => e.playerId), t);
	if (!i.length) return e;
	let a = n ?? e.find((e) => e.isSelf)?.playerId ?? null, o = a ? i.indexOf(a) : 0;
	return (o > 0 ? [...i.slice(o), ...i.slice(0, o)] : i).map((e) => r.get(e)).filter((e) => e != null);
}
//#endregion
//#region src/table/layout/sevenPlayerMobileSeatMap.ts
function Kl(e) {
	let t = Yc(e);
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
function ql(e) {
	return e === 7;
}
function Jl(e, t) {
	return e < 0 || e > 6 ? null : Kl(t)[e] ?? null;
}
function Yl(e, t, n) {
	let r = Jl(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: iu(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 7
		})
	} : null;
}
//#endregion
//#region src/table/layout/eightPlayerMobileSeatMap.ts
function Xl(e) {
	let t = Xc(e);
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
function Zl(e) {
	return e >= 8;
}
function Ql(e, t) {
	return e < 0 || e > 7 ? null : Xl(t)[e] ?? null;
}
function $l(e, t, n) {
	let r = Ql(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: iu(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 8
		})
	} : null;
}
//#endregion
//#region src/table/layout/seatLayout.ts
var eu = {
	min: 8,
	max: 92
}, tu = 56, nu = 54;
function ru(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function iu(e, t) {
	return t.isSelf || t.isMobile ? "below" : t.total >= 6 && e.region === "left" && e.x < 14 || t.total >= 6 && e.region === "right" && e.x > 86 ? "side" : "below";
}
function au(e, t) {
	let n = ru(e.x, eu.min, eu.max), r = t === "portrait" ? tu : nu, i = ru(e.y, 8, r);
	return {
		...e,
		x: n,
		y: i
	};
}
function ou(e, t, n) {
	if (n.isMobile && n.orientation && ql(t)) {
		let t = Yl(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && Zl(t)) {
		let t = $l(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	let r = ml(e, t), i = n.isMobile && n.orientation ? au(r, n.orientation) : r;
	return {
		...i,
		seatIndex: e,
		handLane: iu(i, {
			isMobile: n.isMobile,
			isSelf: n.isSelf,
			total: t
		})
	};
}
function su(e, t, n) {
	return ou(e + 1, t, {
		isMobile: !0,
		isSelf: !1,
		orientation: n
	});
}
function cu(e, t = "portrait") {
	if (ql(e)) {
		let e = Yl(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (Zl(e)) {
		let e = $l(0, t, { isSelf: !0 });
		if (e) return e;
	}
	let n = ml(0, Math.max(2, e));
	return {
		x: n.x,
		y: Math.min(n.y, 88),
		region: "bottom",
		seatIndex: 0,
		handLane: "below"
	};
}
var lu = 5e3, uu = 1e3, du = 12e3, fu = 4e3, pu = 4e3;
function mu(e = Al()) {
	let t = e ? .55 : 1, n = (e) => Math.max(80, Math.round(e * t));
	return {
		anteChipTravelMs: n(220),
		dealCardStaggerMs: n(130),
		dealFanMs: n(600),
		trumpRevealHoldMs: n(lu),
		trumpMergeAnimMs: n(0),
		enrollmentSeatPulseMs: n(480),
		drawDiscardMs: n(400),
		drawReplaceMs: n(700),
		drawReadyBeatMs: n(500),
		settleHoldMs: n(uu),
		nextHandResetMs: n(550),
		handResetMs: n(500)
	};
}
function hu(e, t, n = Al()) {
	let r = mu(n), i = Math.max(0, e), a = Math.max(0, t);
	return i === 0 && a === 0 ? Math.max(120, Math.round(r.drawDiscardMs * .6)) : i * r.drawDiscardMs + a * r.drawReplaceMs + 80;
}
function gu(e, t, n) {
	let r = Number.isFinite(e) && e > 0 ? e : 0, i = r > 0 ? Math.max(t, r) : t;
	return {
		height: Math.max(i > 0 ? i : n, n),
		peak: i
	};
}
function _u(e, t, n, r) {
	let i = gu(e, t, n), a = Math.max(152, n);
	return {
		height: i.peak > 0 ? Math.min(i.height, r) : Math.min(a, r),
		peak: i.peak
	};
}
function vu(e, t, n = 72) {
	return gu(e, t, n);
}
function yu(e, t) {
	let n = Math.max(.75, e);
	return t.portrait ? Math.min(n, .98) : Math.min(n, 1.32);
}
function bu(e) {
	let t = Math.max(2, Math.min(8, e || 4));
	return t <= 3 ? .7 : t <= 4 ? .68 : t <= 5 ? .62 : .56;
}
function xu(e) {
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
function Su(e) {
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
function Cu(e) {
	return {
		left: e.left,
		top: e.top,
		right: e.right,
		bottom: e.bottom,
		width: e.width,
		height: e.height
	};
}
function wu(e, t, n = 2) {
	return e.left >= t.left - n && e.top >= t.top - n && e.right <= t.right + n && e.bottom <= t.bottom + n;
}
//#endregion
//#region src/table/presentationMotionBusy.ts
var Tu = !1, Eu = !1, Du = /* @__PURE__ */ new Set();
function Ou() {
	for (let e of Du) e();
}
function ku(e) {
	Tu !== e && (Tu = e, Ou());
}
function Au() {
	return Tu;
}
function ju(e) {
	Eu !== e && (Eu = e, Ou());
}
function Mu() {
	return Eu;
}
function Nu(e) {
	return Du.add(e), () => Du.delete(e);
}
function Pu() {
	Tu = !1, Eu = !1, Ou();
}
//#endregion
//#region src/table/useMobileTable.ts
var Fu = "(max-width: 900px), ((hover: none) and (pointer: coarse))";
function Iu() {
	let [e, t] = (0, l.useState)(() => typeof window < "u" && window.matchMedia("(max-width: 900px), ((hover: none) and (pointer: coarse))").matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Fu), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/table/hooks/useStageFit.ts
function Lu(e, t) {
	if (typeof window > "u") return t;
	let n = document.documentElement, r = getComputedStyle(n).getPropertyValue(e).trim(), i = parseFloat(r);
	return Number.isFinite(i) ? i : t;
}
function Ru(e, t) {
	let n = e.closest(".btable-session");
	if (!n) return 0;
	let r = n.querySelector(".btable-desktop");
	if (r) {
		let e = n.getBoundingClientRect(), i = r.getBoundingClientRect(), a = t ? 4 : 0;
		return Math.max(0, e.height - i.height) + a;
	}
	let i = 0, a = n.querySelector(".btable-session__head-row"), o = n.querySelector(".btable-session__status"), s = n.querySelector(".btable-session__foot"), c = n.querySelector(".btable-session__settle");
	return a && (i += a.getBoundingClientRect().height), o && (i += o.getBoundingClientRect().height), s && s.offsetParent !== null && (i += s.getBoundingClientRect().height), c && c.offsetParent !== null && (i += c.getBoundingClientRect().height), i += 24, t && (i += 4), i;
}
function zu(e) {
	let t = e.closest(".btable-session")?.querySelector(".btable-desktop");
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return n.width <= 0 || n.height <= 0 ? null : {
		width: n.width,
		height: n.height
	};
}
function Bu(e, t) {
	let n = !!e.closest(".table-play-overlay");
	if (t && n) {
		let t = e.closest(".table-play-overlay__main");
		if (t) return t;
	}
	return e.closest(".btable-desktop__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function Vu({ aspect: e, enabled: t = !0, sessionKey: n }) {
	let r = (0, l.useRef)(null), i = (0, l.useRef)(0), a = (0, l.useRef)(0), o = (0, l.useRef)(n), { settings: s } = Rc(), c = Iu();
	return (0, l.useLayoutEffect)(() => {
		if (!t || typeof window > "u") return;
		let l = r.current;
		if (!l) return;
		o.current !== n && (o.current = n, i.current = 0, a.current = 0);
		let u = l.closest(".btable-desktop__viewport") ?? l.closest(".table-play-overlay__main") ?? l.closest(".btable-session"), d = window.visualViewport, f = () => {
			let t = !!l.closest(".table-play-overlay"), n = typeof window < "u" && window.matchMedia("(orientation: portrait)").matches, r = Bu(l, c).getBoundingClientRect(), o = l.querySelector(".hand-panel")?.getBoundingClientRect(), u = t && c && n ? 100 : t && !c ? 120 : c ? 112 : 148, f = t && c && n || t && !c ? 200 : c ? 210 : 280, p = o?.height ?? 0, m = _u(p, i.current, u, f);
			i.current = m.peak;
			let h = m.height, g = c && t ? 12 : c ? 18 : t && !c ? 16 : 28, _ = Lu("--stage-fit-pad-x", c ? 8 : 16) + g, v = Lu("--stage-fit-pad-y", c ? 6 : 12) + g, y = Lu("--stage-fit-gap", c ? 8 : 12), b = d, x = Math.min(r.width, b?.width ?? window.innerWidth), S = Math.min(r.height, b?.height ?? window.innerHeight);
			if (t && c) {
				let e = zu(l);
				if (e) x = e.width, S = e.height;
				else {
					let e = vu(Ru(l, c), a.current, 72);
					a.current = e.peak, S = Math.max(160, S - e.height);
				}
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = t && c ? 1 : C, T = c ? yu(e, { portrait: n }) : e, E = parseInt(getComputedStyle(l).getPropertyValue("--player-count").trim(), 10) || 4, D = t && c && !n, O = D ? {
				...xu({
					availWidth: x,
					availHeight: S,
					aspect: T,
					userScale: w,
					padX: _,
					padY: v,
					stageShare: bu(E)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Su({
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
			let k = c || t, A = k ? O.displayStageWidth : O.stageWidth, ee = k ? O.displayStageHeight : O.stageHeight;
			if (t && c) {
				let e = Math.max(0, x - _ * 2), t = D ? Math.max(0, S - v * 2) : Math.max(120, S - v * 2 - h - y);
				A = Math.min(A * C, e), ee = Math.min(ee * C, t);
			}
			let j = t && !c ? C : c ? 1 : O.effectiveScale;
			if (l.style.setProperty("--stage-fit-width", `${Math.round(A)}px`), l.style.setProperty("--stage-fit-height", `${Math.round(ee)}px`), l.style.setProperty("--stage-fit-scale", String(O.fitScale)), l.style.setProperty("--stage-effective-scale", String(j)), (l.closest(".btable-desktop__scale") ?? l.parentElement)?.style.setProperty("--stage-effective-scale", String(j)), localStorage.getItem("stageFitDebug") === "1") {
				let e = l.querySelector(".table-stage"), a = l.querySelectorAll(".bseat__avatar-wrap"), o = e ? Cu(e.getBoundingClientRect()) : null, s = Cu(document.documentElement.getBoundingClientRect()), u = [...a].filter((e) => !wu(Cu(e.getBoundingClientRect()), s, 1)).length;
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
			Au() || Mu() || (p ??= window.requestAnimationFrame(() => {
				p = null, f();
			}));
		}, h = new ResizeObserver(m), g = l.querySelector(".hand-panel");
		g && h.observe(g);
		let _ = Bu(l, c);
		_ instanceof HTMLElement && h.observe(_), u instanceof HTMLElement && u !== _ && h.observe(u);
		let v = l.closest(".table-play-overlay__main");
		v instanceof HTMLElement && v !== _ && h.observe(v), m();
		let y = () => m();
		return window.addEventListener("orientationchange", y), d?.addEventListener("resize", y), d?.addEventListener("scroll", y), () => {
			p != null && window.cancelAnimationFrame(p), h.disconnect(), window.removeEventListener("orientationchange", y), d?.removeEventListener("resize", y), d?.removeEventListener("scroll", y);
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
function Hu({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r, pileIndexRef: i, onDiscardCommitted: a }) {
	let o = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		let s = e.animatingDrawPlayerId, c = e.drawAnimSubPhase, l = e.drawDiscardCount;
		if (c !== "discard" || !s || l <= 0) {
			c !== "discard" && (o.current = null);
			return;
		}
		if (s === n) return;
		let u = `${t}:${s}:${l}`;
		o.current !== u && (o.current = u, Ra({
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
function Uu({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r }) {
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
		i.current !== l && (i.current = l, Fa({
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
function Wu(e = document) {
	ma(), Ma();
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = e instanceof Document ? t.body : e;
	for (let e of n.querySelectorAll(".discard-fly-ghost, .draw-receive-fly-ghost")) e.remove();
}
//#endregion
//#region src/table/hooks/useTableDrawMotionCleanup.ts
function Gu({ handNumber: e, sessionPhase: t, turnPlayerId: n, drawCompletedIds: r, currentUserId: i, handPresentation: a, tableRootRef: o }) {
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
		s.current !== l && (s.current = l, Wu(c));
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
		e && (Wu(e), s.current = null);
	}, [e, o]);
}
var Ku = /* @__PURE__ */ new Set();
function qu(e, t = 5) {
	let n = [];
	for (let r = 0; r < t; r += 1) for (let t of e) n.push({
		playerId: t,
		roundIndex: r,
		stepIndex: n.length
	});
	return n;
}
function Ju(e, t = I()) {
	if (e <= 0) return 0;
	let n = t ? .35 : 1, r = Math.round(780 * n), i = Math.round(540 * n);
	return (e - 1) * r + i + Math.round(130 * n);
}
function Yu(e, t, n) {
	let r = n instanceof Document ? n : n.ownerDocument ?? document, i = r.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`) ?? r.querySelector(`[data-deal-seat="${e}"] [data-deal-round="${t}"]`), a = i?.querySelector(".pcard") ?? i;
	return a ? ea(a) : null;
}
function Xu(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * .24)
	};
}
function Zu(e) {
	let t = document.createElement("div");
	return t.className = "deal-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function Qu(e, t, n) {
	(n instanceof Document ? n : n.ownerDocument ?? document).querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`)?.classList.add("deal-card--revealed");
}
function $u(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".deal-card--revealed")) e.classList.remove("deal-card--revealed");
	for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
}
function ed() {
	for (let e of Ku) e.kill();
	Ku.clear();
}
function td({ steps: e, root: t, onStepComplete: n, onComplete: r }) {
	ia(t), ed();
	let i = I(), a = F(540 / 1e3, i), o = F(130 / 1e3, i), s = i ? .04 : 110 / 1e3, c = xa(t), l = K.timeline({
		onComplete: () => {
			Ku.delete(l), r?.();
		},
		onInterrupt: () => {
			Ku.delete(l);
			for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
		}
	});
	if (Ku.add(l), !c || e.length === 0) {
		for (let n of e) Qu(n.playerId, n.roundIndex, t);
		return l.call(() => r?.()), l;
	}
	e.forEach((e, r) => {
		let u = r * (a + o + s), d = Yu(e.playerId, e.roundIndex, t);
		l.call(() => {
			if (!d) {
				Qu(e.playerId, e.roundIndex, t), n?.(e);
				return;
			}
			let r = Zu(c);
			t.appendChild(r);
			let s = ea(r), { x: l, y: u } = ra(s, c), f = d.left + d.width / 2, p = d.top + d.height / 2, m = s.left + s.width / 2, h = s.top + s.height / 2, g = f - m, _ = p - h, { midX: v, midY: y } = Xu(g, _);
			K.set(r, {
				transformOrigin: "50% 80%",
				willChange: "transform,opacity",
				x: l,
				y: u,
				rotation: -12,
				rotationY: i ? 0 : -68,
				scale: i ? 1 : .62,
				opacity: +!!i
			});
			let b = K.timeline({ onComplete: () => {
				r.remove(), Qu(e.playerId, e.roundIndex, t), n?.(e);
			} });
			i ? b.to(r, {
				x: g,
				y: _,
				rotation: 0,
				rotationY: 0,
				scale: 1,
				opacity: 1,
				duration: a,
				ease: M
			}) : b.to(r, {
				motionPath: {
					path: [
						{
							x: l,
							y: u
						},
						{
							x: l + v,
							y: u + y
						},
						{
							x: g,
							y: _
						}
					],
					curviness: 1.2
				},
				rotation: 0,
				rotationY: 0,
				scale: 1,
				opacity: 1,
				duration: a,
				ease: M
			}), b.to(r, {
				scale: 1.02,
				duration: o * .45,
				yoyo: !0,
				repeat: 1,
				ease: N
			}, a);
		}, void 0, u);
	});
	let u = Ju(e.length, i) + 120, d = window.setTimeout(() => {
		l.progress() < 1 && l.progress(1);
	}, u);
	return l.eventCallback("onComplete", () => window.clearTimeout(d)), l.eventCallback("onInterrupt", () => window.clearTimeout(d)), l;
}
//#endregion
//#region src/table/hooks/useTableDealPresentation.ts
function nd({ session: e, heroCards: t, privateHandReady: n = !1, tableRootRef: r }) {
	let [i, a] = (0, l.useState)(!1), o = (0, l.useRef)(null), s = (0, l.useRef)(e.handNumber);
	return (0, l.useLayoutEffect)(() => {
		let t = r.current;
		t && s.current !== e.handNumber && (s.current = e.handNumber, o.current = null, ed(), $u(t), ku(!1), a(!1));
	}, [e.handNumber, r]), (0, l.useLayoutEffect)(() => {
		let i = r.current;
		if (!i) return;
		let s = e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play", c = t.length;
		if (!s || !n || c < 5) return;
		let l = `${e.handNumber}:${c}:${e.participantIds.join(",")}`;
		if (o.current === l) return;
		let u = Wl(e.participantIds, e), d = wo(e.dealerId, e.participantIds, u.length ? u : e.participantIds);
		if (d.length < 2) return;
		let f = qu(d, 5);
		if (!f.length) return;
		o.current = l, ed(), $u(i), i.classList.add("btable-wrap--clockwise-dealing"), a(!0), ku(!0);
		let p = Al(), m = window.requestAnimationFrame(() => {
			td({
				steps: f,
				root: i,
				onComplete: () => {
					i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), ku(!1);
				}
			});
		}), h = window.setTimeout(() => {
			i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), ku(!1);
		}, Ju(f.length, p) + 400);
		return () => {
			window.cancelAnimationFrame(m), window.clearTimeout(h), ed(), i.classList.remove("btable-wrap--clockwise-dealing"), ku(!1), a(!1);
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
//#region src/table/wonTrickPileModel.ts
function rd(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function id(e, t) {
	return (e >>> t & 65535) / 65535;
}
function ad(e, t) {
	let n = rd(`${e}@book${t}`), r = id(n, 0), i = id(n, 9), a = id(n, 17), o = r >= .5 ? 1 : -1, s = i >= .5 ? 1 : -1;
	return {
		offsetX: o * (1.5 + r * 2.5) + t * 2.2,
		offsetY: t * -1.8 + i * 1.2,
		rotation: s * (4 + a * 5) + t * 2.5,
		scale: .88 - t * .02,
		zIndex: t + 1
	};
}
function od(e) {
	return `${e.playerId}:h${e.handNumber}:t${e.trickNumber}`;
}
//#endregion
//#region src/table/animations/wonTrickPileMotion.ts
var sd = /* @__PURE__ */ new Set(), cd = /* @__PURE__ */ new Set(), ld = P.drawDiscard;
function ud(e, t) {
	return {
		midX: e * .5,
		midY: t * .5
	};
}
function dd(e, t = document) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document, r = n.querySelector(`[data-won-trick-pile-anchor="${e}"]`) ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`);
	return r ? ea(r) : null;
}
function fd() {
	for (let e of cd) K.set(e, { clearProps: "opacity,transform,willChange,zIndex" });
	cd.clear();
}
function pd(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) e.remove();
}
function md(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".bseat--pile-reveal-ready")) e.classList.remove("bseat--pile-reveal-ready");
}
function hd(e = document) {
	for (let e of sd) e.kill();
	sd.clear(), pd(e), fd(), md(e);
}
function gd() {
	for (let e of sd) e.kill();
	sd.clear(), fd();
}
function _d(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function vd(e, t) {
	let n = ea(e), r = document.createElement("div");
	r.className = "won-trick-fly-ghost", r.setAttribute("aria-hidden", "true"), r.style.position = "fixed", r.style.left = `${n.left}px`, r.style.top = `${n.top}px`, r.style.width = `${n.width}px`, r.style.height = `${n.height}px`, r.style.pointerEvents = "none", r.style.zIndex = "4", r.style.transformOrigin = "50% 50%";
	let i = e.cloneNode(!0);
	return i.style.width = "100%", i.style.height = "100%", r.appendChild(i), t.appendChild(r), r;
}
function yd(e, t) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document;
	(n.querySelector(`[data-won-trick-pile-anchor="${e}"]`)?.closest(".bseat") ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`)?.closest(".bseat"))?.classList.add("bseat--pile-reveal-ready");
}
function Q(e, t) {
	ia(t.root ?? document);
	let n = I(), r = t.root ?? document, i = t.host ?? (r instanceof HTMLElement ? r : document.body), a = dd(t.winnerPlayerId, r), o = n ? .06 : 140 / 1e3, s = F(ld, n), c = n ? .03 : .05, l = [], u = (e) => {
		sd.delete(d);
		for (let e of l) e.remove();
		fd(), e && yd(t.winnerPlayerId, r), t.onComplete?.();
	}, d = K.timeline({
		onComplete: () => u(!0),
		onInterrupt: () => u(!1)
	});
	sd.add(d), e.forEach((e, r) => {
		let u = ad(t.trickKey, t.bookIndex), f = vd(e, i);
		l.push(f), cd.add(e), K.set(e, { opacity: 0 });
		let p = ea(f);
		K.set(f, {
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
		let h = a.left + a.width / 2 + u.offsetX, g = a.top + a.height / 2 + u.offsetY, _ = p.left + p.width / 2, v = p.top + p.height / 2, y = h - _, b = g - v, { midX: x, midY: S } = ud(y, b);
		d.to(f, {
			scale: .98,
			duration: o,
			ease: M
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
			ease: M,
			onComplete: () => f.remove()
		}, m + o);
	});
	let f = Math.round((e.length > 0 ? (e.length - 1) * c : 0) * 1e3 + (o + s) * 1e3 + 60);
	return _d(d, Math.min(760, Math.max(300, f))), d;
}
function bd() {
	return sd.size > 0;
}
function xd(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = [...t.querySelectorAll("[data-trick-variant=\"live\"] .btrick__play .pcard, [data-testid=\"trick-row\"] .btrick__play .pcard")].filter((e) => e.closest("[data-trick-variant=\"echo\"]") == null);
	return n.length > 0 ? n : [...t.querySelectorAll("[data-trick-variant=\"echo\"] .btrick__play .pcard")];
}
//#endregion
//#region src/table/hooks/useWonTrickCollection.ts
var Sd = new Set(["nextLeadReady", "live"]);
function Cd({ trickPresentation: e, handNumber: t, sessionPhase: n = null, handComplete: r = !1, tableRootRef: i }) {
	let a = (0, l.useRef)(null), o = (0, l.useRef)(t), s = (0, l.useRef)(e.phase), c = (0, l.useRef)(null), u = () => {
		c.current != null && (window.clearTimeout(c.current), c.current = null);
	}, d = (e) => {
		u();
		let t = bd() ? 820 : 0;
		c.current = window.setTimeout(() => {
			c.current = null, wd(e);
		}, t);
	};
	(0, l.useLayoutEffect)(() => {
		let e = i.current;
		if (e) {
			if (o.current !== t) {
				o.current = t, a.current = null, u(), hd(e);
				return;
			}
			(r || n != null && n !== "play") && (a.current = null, u(), hd(e));
		}
	}, [
		t,
		r,
		n,
		i
	]), (0, l.useLayoutEffect)(() => {
		let n = s.current, r = e.phase;
		s.current = r;
		let o = i.current;
		if (!o || (n === "collectTrick" && Sd.has(r) && (a.current = null, d(o)), r !== "collectTrick")) return;
		let c = e.trickWinnerSeatId, l = e.frozenTrick;
		if (!c || !l) return;
		let f = `${l.trickNumber}:${c}:${l.plays.length}`;
		if (a.current === f) return;
		a.current = f, u(), gd(), Td(o);
		let p = xd(o);
		if (!p.length) return;
		let m = Math.max(0, (e.displayTricksByPlayer[c] ?? 1) - 1), h = od({
			playerId: c,
			handNumber: t,
			trickNumber: l.trickNumber
		});
		ju(!0);
		let g = window.setTimeout(() => {
			Q(p, {
				winnerPlayerId: c,
				trickKey: h,
				bookIndex: m,
				root: o,
				host: o,
				onComplete: () => ju(!1)
			});
		}, 240);
		return () => {
			window.clearTimeout(g), ju(!1);
		};
	}, [
		e.phase,
		e.trickWinnerSeatId,
		e.frozenTrick,
		e.displayTricksByPlayer,
		t,
		i
	]), (0, l.useEffect)(() => () => u(), []), (0, l.useLayoutEffect)(() => {
		let e = i.current;
		return () => {
			u(), e ? hd(e) : gd();
		};
	}, [i]);
}
function wd(e) {
	for (let t of e.querySelectorAll(".bseat--pile-reveal-ready")) t.classList.remove("bseat--pile-reveal-ready");
}
function Td(e) {
	for (let t of e.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) t.remove();
}
//#endregion
//#region src/table/trumpHolderPresentation.ts
function Ed(e) {
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
function Dd(e) {
	return e <= 0 ? null : e - 1;
}
function Od(e, t, n, r, i) {
	if (i || !t.trumpHolderId || e !== t.trumpHolderId || r <= 0) return {
		revealedTrumpUpcard: null,
		revealedTrumpIndex: null,
		seatTrumpMergeActive: !1
	};
	let a = t.showRevealedTrumpAtHolder ? Dd(r) : null;
	return {
		revealedTrumpUpcard: t.showRevealedTrumpAtHolder ? n : null,
		revealedTrumpIndex: a,
		seatTrumpMergeActive: t.trumpMergeActive
	};
}
//#endregion
//#region src/table/CardTable.tsx
function kd({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: l = !1, showTrumpSuitReminder: u = !1, trumpHolderPresentation: d, privateHandReady: f = !1, currentUserId: p = null, legalPlayIndices: m, recommendedPlayIndex: h, recommendedDiscardIndices: _ = [], handComplete: v = !1, actionFeedback: y, trickPresentation: b, handPresentation: x, microinteractions: S, instantTrickPlays: C = !1, turnCountdown: w = null, onToggleInHand: T, onPassEnrollment: E, onTrickDelta: D, onSubmitDraw: O, onPassDraw: k, onFoldDraw: A, onPlayCard: ee, onReaction: j, onHeroUserActivity: te }) {
	let M = t.map((e) => ({
		...e,
		isSelf: e.isSelf || p != null && e.playerId === p
	})), ne = Gl(M, e, p), N = ne.length, P = `btable--p${Math.min(8, Math.max(2, N))}`, re = hl(N), F = Object.fromEntries(M.map((e) => [e.playerId, e.displayName])), I = mu(), L = e.sessionId, R = Vu({
		aspect: re,
		sessionKey: L
	}), { cards: z, pileIndexRef: ie, commitDiscardCards: ae } = Ia({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: R
	});
	Hu({
		handPresentation: x,
		handNumber: e.handNumber,
		currentUserId: p,
		tableRootRef: R,
		pileIndexRef: ie,
		onDiscardCommitted: ae
	}), Uu({
		handPresentation: x,
		handNumber: e.handNumber,
		currentUserId: p,
		tableRootRef: R
	}), Gu({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: p,
		handPresentation: x,
		tableRootRef: R
	});
	let B = nd({
		session: e,
		heroCards: a,
		privateHandReady: f,
		tableRootRef: R
	});
	Cd({
		trickPresentation: b,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: v,
		tableRootRef: R
	});
	let V = new Set(e.participantIds.filter((t) => el(t, b.displayTricksByPlayer, e.participantIds, e.phase))), oe = M.map((t) => {
		let r = b.displayTricksByPlayer[t.playerId] ?? 0, i = b.trickWinnerSeatId === t.playerId, a = b.suppressTurnPlayerId || x.suppressTurnIndicator, o = b.phase === "collectTrick" && i, s = x.enrollmentPulse[t.playerId], c = x.animatingDrawPlayerId === t.playerId, l = Od(t.playerId, d, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: ol(t.bankroll, n.anteAmount, {
				inHand: t.inHand,
				anteAnimActive: x.anteAnimActive,
				anteAlreadyPosted: e.postedAntes != null && Object.prototype.hasOwnProperty.call(e.postedAntes, t.playerId)
			}),
			tricksThisHand: r,
			isOnTurn: a ? !1 : t.isOnTurn,
			isActiveActor: a ? !1 : t.isActiveActor,
			isLeading: i && (b.phase === "winnerReveal" || b.phase === "collectTrick") ? !0 : a ? !1 : t.isLeading,
			isTrickCapture: o,
			enrollmentPulse: s,
			drawAnimSubPhase: c && t.isSelf ? x.drawAnimSubPhase : null,
			drawDiscardCount: c ? x.drawDiscardCount : 0,
			drawReplaceCount: c ? x.drawReplaceCount : 0,
			turnHandoff: !1,
			turnCountdown: w?.playerId === t.playerId ? {
				progress: w.progress,
				remainingMs: w.remainingMs,
				segment: w.segment
			} : null,
			dealerMoved: S.dealerMovedPlayerId === t.playerId,
			winnerFlash: S.winnerFlashPlayerId === t.playerId,
			bankrollTick: S.bankrollTicks[t.playerId] ?? null,
			bourreAlert: t.isSelf ? S.bourreAlerts[t.playerId] ?? null : null,
			bourrePressure: V.has(t.playerId)
		};
	}), H = M.find((e) => e.isSelf), se = b.suppressTurnPlayerId || x.suppressTurnIndicator, ce = !!(p && e.drawCompletedIds?.includes(p));
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: R,
		className: [
			"btable-wrap btable-wrap--stage-fit",
			P,
			oe.some((e) => e.isActiveActor) ? "btable-wrap--has-active-turn" : "",
			B ? "btable-wrap--clockwise-dealing" : ""
		].filter(Boolean).join(" "),
		"data-testid": "table-root",
		style: {
			"--player-count": N,
			"--table-aspect": re,
			"--trick-card-travel-ms": "395ms",
			"--trick-card-settle-ms": "165ms",
			"--trick-card-shift-ms": "220ms",
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": `${vl}ms`,
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": `${gl}ms`,
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": `${gl + 400 + vl + 230}ms`,
			"--deal-card-stagger-ms": `${I.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${I.drawDiscardMs}ms`,
			"--draw-replace-ms": `${I.drawReplaceMs}ms`
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
								children: /* @__PURE__ */ (0, g.jsx)(Ll, {
									potMetrics: {
										...n,
										currentPot: x.displayPotAmount
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
									playerNames: F,
									anteAnimActive: x.anteAnimActive,
									trumpRevealActive: x.trumpRevealActive,
									hideCenterTrump: l,
									showTrumpSuitReminder: u,
									drawAnimPlayerId: x.animatingDrawPlayerId,
									drawAnimSubPhase: x.drawAnimSubPhase,
									drawDiscardCount: x.drawDiscardCount,
									settleAnimActive: x.settleAnimActive,
									settleCarryOver: x.settleCarryOver,
									potTick: S.potTick,
									trumpReminderPulse: S.trumpReminderPulse,
									instantTrickPlays: C,
									peakTrickPlayCount: b.peakPlayCount,
									discardPileCards: z
								})
							}),
							/* @__PURE__ */ (0, g.jsx)("div", {
								className: "btable__seats",
								"aria-label": "Players at the table",
								children: ne.map((e, t) => {
									let n = ou(t, ne.length, {
										isMobile: !1,
										isSelf: e.isSelf
									}), r = oe.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, g.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										"data-seat-index": t,
										children: /* @__PURE__ */ (0, g.jsx)(Ul, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											clockwiseDealing: B,
											style: {
												left: `${n.x}%`,
												top: `${n.y}%`
											},
											onToggleInHand: () => T(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
											onPassEnrollment: e.canPassEnrollment && E ? () => E(e.playerId) : void 0,
											onTrickDelta: (t) => D(e.playerId, t),
											onReaction: e.isSelf ? j : void 0
										})
									}, e.playerId);
								})
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ (0, g.jsx)(Vc, {
			className: "hand-panel",
			cards: a,
			privateHandReady: f,
			phase: e.phase,
			enrollmentActive: i,
			isInHand: !!H?.inHand,
			isDealer: !!H?.isDealer,
			signedIn: !!p,
			isMyTurn: !!(p && e.turnPlayerId === p) && !se,
			dealStaggerMs: I.dealCardStaggerMs,
			drawAnimSubPhase: x.animatingDrawPlayerId === p ? x.drawAnimSubPhase : null,
			drawDiscardCount: x.animatingDrawPlayerId === p ? x.drawDiscardCount : 0,
			drawReplaceCount: x.animatingDrawPlayerId === p ? x.drawReplaceCount : 0,
			drawCompleted: ce,
			maxDrawDiscards: e.maxDrawDiscards ?? 4,
			legalPlayIndices: m ?? void 0,
			recommendedPlayIndex: h ?? void 0,
			recommendedDiscardIndices: _,
			handComplete: v,
			actionFeedback: y,
			onSubmitDraw: O,
			onPassDraw: k,
			onFoldDraw: A,
			onPlayCard: ee,
			currentUserId: p,
			revealedTrumpIndex: o,
			trumpMergeActive: s,
			trumpDisabledIndex: c,
			handNumber: e.handNumber,
			tableRootRef: R,
			pileIndexRef: ie,
			onDiscardCommitted: ae,
			onUserActivity: te,
			skipHeroDealMotion: B
		})]
	});
}
//#endregion
//#region src/table/layout/mobileSeatMap.ts
function Ad(e, t) {
	let n = Math.max(1, Math.min(7, e || 1));
	return t === "portrait" ? n <= 1 ? .8 : n <= 2 ? .82 : n <= 3 ? .86 : n <= 4 ? .9 : .94 : n <= 1 ? 1.02 : n <= 2 ? .98 : n <= 3 ? 1.02 : n <= 5 ? 1.16 : 1.26;
}
//#endregion
//#region src/table/layout/useTableLayoutMode.ts
var jd = "(orientation: portrait)";
function Md() {
	let e = Iu(), [t, n] = (0, l.useState)(() => typeof window < "u" && window.matchMedia(jd).matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(jd), t = () => n(e.matches);
		return t(), e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []), e ? t ? "mobile-portrait" : "mobile-landscape" : "desktop";
}
//#endregion
//#region src/table/hooks/useMobileStageFit.ts
function Nd(e, t) {
	if (typeof window > "u") return t;
	let n = getComputedStyle(document.documentElement).getPropertyValue(e).trim(), r = parseFloat(n);
	return Number.isFinite(r) ? r : t;
}
function Pd(e) {
	let t = e.closest(".btable-session");
	if (!t) return 0;
	let n = t.querySelector(".btable-session__head-row"), r = t.querySelector(".btable-session__status"), i = 0;
	n && (i += n.getBoundingClientRect().height), r && (i += r.getBoundingClientRect().height), i += 24;
	let a = t.querySelector(".btable-mobile");
	if (a) {
		let e = t.getBoundingClientRect(), n = a.getBoundingClientRect(), r = Math.max(0, n.top - e.top), o = Math.max(0, e.bottom - n.bottom);
		return Math.max(i, r + o) + 4;
	}
	return i + 4;
}
function Fd(e) {
	return e.closest(".btable-mobile__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function Id({ aspect: e, sessionKey: t }) {
	let n = (0, l.useRef)(null), r = (0, l.useRef)(0), i = (0, l.useRef)(0), a = (0, l.useRef)(t), o = Md(), { settings: s } = Rc(), c = o === "mobile-portrait";
	return (0, l.useLayoutEffect)(() => {
		if (typeof window > "u") return;
		let o = n.current;
		if (!o) return;
		a.current !== t && (a.current = t, r.current = 0, i.current = 0);
		let l = window.visualViewport, u = () => {
			let t = Fd(o).getBoundingClientRect(), n = o.querySelector(".btable-mobile-hero-dock")?.getBoundingClientRect(), a = !!o.closest(".table-play-overlay"), u = c ? 104 : 92, d = c ? 210 : 168, f = _u(n?.height ?? 0, r.current, u, d);
			r.current = f.peak;
			let p = f.height, m = parseInt(getComputedStyle(o).getPropertyValue("--player-count").trim(), 10) || 4, h = m <= 4, g = !c, _ = (g && h ? Nd("--mobile-fit-pad-x", 4) : Nd("--mobile-fit-pad-x", 8)) + (g && a ? 4 : 12), v = (g && h ? Nd("--mobile-fit-pad-y", 2) : Nd("--mobile-fit-pad-y", 6)) + (g && a ? 4 : 10), y = Nd("--mobile-fit-gap", c ? 8 : 6), b = l, x = Math.min(t.width, b?.width ?? window.innerWidth), S = Math.min(t.height, b?.height ?? window.innerHeight);
			if (a) {
				let e = vu(Pd(o), i.current, 72);
				i.current = e.peak, S = Math.max(140, S - e.height);
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = g ? {
				...xu({
					availWidth: x,
					availHeight: S,
					aspect: e,
					userScale: 1,
					padX: _,
					padY: v,
					stageShare: bu(m)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Su({
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
			Au() || Mu() || (d ??= window.requestAnimationFrame(() => {
				d = null, u();
			}));
		}, p = new ResizeObserver(f), m = o.querySelector(".btable-mobile-hero-dock");
		m && p.observe(m);
		let h = Fd(o);
		h instanceof HTMLElement && p.observe(h), f();
		let g = () => f();
		return window.addEventListener("orientationchange", g), l?.addEventListener("resize", g), l?.addEventListener("scroll", g), () => {
			d != null && window.cancelAnimationFrame(d), p.disconnect(), window.removeEventListener("orientationchange", g), l?.removeEventListener("resize", g), l?.removeEventListener("scroll", g);
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
function Ld({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: l = !1, showTrumpSuitReminder: u = !1, trumpHolderPresentation: d, privateHandReady: f = !1, currentUserId: p = null, legalPlayIndices: m, recommendedPlayIndex: h, recommendedDiscardIndices: _ = [], handComplete: v = !1, actionFeedback: y, trickPresentation: b, handPresentation: x, microinteractions: S, instantTrickPlays: C = !1, turnCountdown: w = null, onToggleInHand: T, onPassEnrollment: E, onTrickDelta: D, onSubmitDraw: O, onPassDraw: k, onFoldDraw: A, onPlayCard: ee, onHeroUserActivity: j }) {
	let te = Md() === "mobile-landscape" ? "landscape" : "portrait", M = t.map((e) => ({
		...e,
		isSelf: e.isSelf || p != null && e.playerId === p
	})), ne = Gl(M, e, p), N = ne.filter((e) => !e.isSelf), P = ne.find((e) => e.isSelf), re = P ? cu(ne.length, te) : null, F = ne.length, I = `btable--p${Math.min(8, Math.max(2, F))}`, L = Ad(N.length, te), R = Object.fromEntries(t.map((e) => [e.playerId, e.displayName])), z = mu(), ie = e.sessionId, ae = Id({
		aspect: L,
		sessionKey: ie
	}), { cards: B, pileIndexRef: V, commitDiscardCards: oe } = Ia({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: ae
	});
	Hu({
		handPresentation: x,
		handNumber: e.handNumber,
		currentUserId: p,
		tableRootRef: ae,
		pileIndexRef: V,
		onDiscardCommitted: oe
	}), Uu({
		handPresentation: x,
		handNumber: e.handNumber,
		currentUserId: p,
		tableRootRef: ae
	}), Gu({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: p,
		handPresentation: x,
		tableRootRef: ae
	});
	let H = nd({
		session: e,
		heroCards: a,
		privateHandReady: f,
		tableRootRef: ae
	});
	Cd({
		trickPresentation: b,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: v,
		tableRootRef: ae
	});
	let se = new Set(e.participantIds.filter((t) => el(t, b.displayTricksByPlayer, e.participantIds, e.phase))), ce = M.map((t) => {
		let r = b.displayTricksByPlayer[t.playerId] ?? 0, i = b.trickWinnerSeatId === t.playerId, a = b.suppressTurnPlayerId || x.suppressTurnIndicator, o = b.phase === "collectTrick" && i, s = x.enrollmentPulse[t.playerId], c = x.animatingDrawPlayerId === t.playerId, l = Od(t.playerId, d, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: ol(t.bankroll, n.anteAmount, {
				inHand: t.inHand,
				anteAnimActive: x.anteAnimActive,
				anteAlreadyPosted: e.postedAntes != null && Object.prototype.hasOwnProperty.call(e.postedAntes, t.playerId)
			}),
			tricksThisHand: r,
			isOnTurn: a ? !1 : t.isOnTurn,
			isActiveActor: a ? !1 : t.isActiveActor,
			isLeading: i && (b.phase === "winnerReveal" || b.phase === "collectTrick") ? !0 : a ? !1 : t.isLeading,
			isTrickCapture: o,
			enrollmentPulse: s,
			drawAnimSubPhase: c && t.isSelf ? x.drawAnimSubPhase : null,
			drawDiscardCount: c ? x.drawDiscardCount : 0,
			drawReplaceCount: c ? x.drawReplaceCount : 0,
			turnHandoff: !1,
			turnCountdown: w?.playerId === t.playerId ? {
				progress: w.progress,
				remainingMs: w.remainingMs,
				segment: w.segment
			} : null,
			dealerMoved: S.dealerMovedPlayerId === t.playerId,
			winnerFlash: S.winnerFlashPlayerId === t.playerId,
			bankrollTick: S.bankrollTicks[t.playerId] ?? null,
			bourreAlert: t.isSelf ? S.bourreAlerts[t.playerId] ?? null : null,
			bourrePressure: se.has(t.playerId)
		};
	}), le = M.find((e) => e.isSelf), ue = b.suppressTurnPlayerId || x.suppressTurnIndicator, de = !!(p && e.drawCompletedIds?.includes(p));
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: ae,
		className: [
			"btable-mobile-wrap btable-mobile-wrap--stage-fit",
			I,
			ce.some((e) => e.isActiveActor) ? "btable-wrap--has-active-turn" : "",
			H ? "btable-wrap--clockwise-dealing" : ""
		].filter(Boolean).join(" "),
		"data-testid": "table-root",
		"data-layout": te,
		style: {
			"--player-count": F,
			"--table-aspect": L,
			"--trick-card-travel-ms": "395ms",
			"--trick-card-settle-ms": "165ms",
			"--trick-card-shift-ms": "220ms",
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": `${vl}ms`,
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": `${gl}ms`,
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": `${gl + 400 + vl + 230}ms`,
			"--deal-card-stagger-ms": `${z.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${z.drawDiscardMs}ms`,
			"--draw-replace-ms": `${z.drawReplaceMs}ms`
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
								children: /* @__PURE__ */ (0, g.jsx)(Ll, {
									potMetrics: {
										...n,
										currentPot: x.displayPotAmount
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
									playerNames: R,
									anteAnimActive: x.anteAnimActive,
									trumpRevealActive: x.trumpRevealActive,
									hideCenterTrump: l,
									showTrumpSuitReminder: u,
									drawAnimPlayerId: x.animatingDrawPlayerId,
									drawAnimSubPhase: x.drawAnimSubPhase,
									drawDiscardCount: x.drawDiscardCount,
									settleAnimActive: x.settleAnimActive,
									settleCarryOver: x.settleCarryOver,
									potTick: S.potTick,
									trumpReminderPulse: S.trumpReminderPulse,
									instantTrickPlays: C,
									peakTrickPlayCount: b.peakPlayCount,
									discardPileCards: B
								})
							}),
							/* @__PURE__ */ (0, g.jsxs)("div", {
								className: "btable__seats btable-mobile__seats",
								"aria-label": "Players at the table",
								children: [N.map((e, t) => {
									let n = su(t, ne.length, te), r = ce.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, g.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										"data-seat-index": t + 1,
										children: /* @__PURE__ */ (0, g.jsx)(Ul, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											clockwiseDealing: H,
											style: {
												left: `${n.x}%`,
												top: `${n.y}%`
											},
											onToggleInHand: () => T(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
											onPassEnrollment: e.canPassEnrollment && E ? () => E(e.playerId) : void 0,
											onTrickDelta: (t) => D(e.playerId, t),
											onReaction: void 0
										})
									}, e.playerId);
								}), P && re && /* @__PURE__ */ (0, g.jsx)("div", {
									className: "btable__seat-slot btable__seat-slot--self",
									"data-seat-index": 0,
									children: /* @__PURE__ */ (0, g.jsx)(Ul, {
										player: ce.find((e) => e.playerId === P.playerId) ?? P,
										region: re.region,
										handLane: re.handLane,
										clockwiseDealing: H,
										style: {
											left: `${re.x}%`,
											top: `${re.y}%`
										},
										onToggleInHand: () => T(P.playerId, P.canToggleInHand ? !0 : !P.inHand),
										onPassEnrollment: P.canPassEnrollment && E ? () => E(P.playerId) : void 0,
										onTrickDelta: (e) => D(P.playerId, e),
										onReaction: void 0
									})
								}, P.playerId)]
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "btable-mobile-hero-dock hand-panel",
			children: [/* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-mobile-hero-dock__stack",
				children: /* @__PURE__ */ (0, g.jsx)(Vc, {
					cards: a,
					privateHandReady: f,
					phase: e.phase,
					enrollmentActive: i,
					isInHand: !!le?.inHand,
					isDealer: !!le?.isDealer,
					signedIn: !!p,
					isMyTurn: !!(p && e.turnPlayerId === p) && !ue,
					dealStaggerMs: z.dealCardStaggerMs,
					drawAnimSubPhase: x.animatingDrawPlayerId === p ? x.drawAnimSubPhase : null,
					drawDiscardCount: x.animatingDrawPlayerId === p ? x.drawDiscardCount : 0,
					drawReplaceCount: x.animatingDrawPlayerId === p ? x.drawReplaceCount : 0,
					drawCompleted: de,
					maxDrawDiscards: e.maxDrawDiscards ?? 4,
					legalPlayIndices: m ?? void 0,
					recommendedPlayIndex: h ?? void 0,
					recommendedDiscardIndices: _,
					handComplete: v,
					actionFeedback: y,
					onSubmitDraw: O,
					onPassDraw: k,
					onFoldDraw: A,
					onPlayCard: ee,
					currentUserId: p,
					revealedTrumpIndex: o,
					trumpMergeActive: s,
					trumpDisabledIndex: c,
					handNumber: e.handNumber,
					tableRootRef: ae,
					pileIndexRef: V,
					onDiscardCommitted: oe,
					onUserActivity: j,
					skipHeroDealMotion: H
				})
			}), i && !le?.inHand && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-mobile-hero-dock__hint muted small",
				children: "Tap I'm in above to join this hand"
			})]
		})]
	});
}
//#endregion
//#region src/table/CinematicSplash.tsx
var Rd = new Set([
	"big-pot",
	"pot-cap",
	"hand-win"
]);
function zd({ events: e, onDismiss: t }) {
	let n = [...e].reverse().find((e) => Rd.has(e.kind));
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
function Bd({ children: e }) {
	let { settings: t } = Rc(), n = t.layoutMode === "tiled", r = Iu();
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
function Vd({ children: e }) {
	let t = Md();
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
function Hd({ events: e, onDismiss: t }) {
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
function Ud({ compact: e = !1 }) {
	let [t, n] = (0, l.useState)(() => is()), [r, i] = (0, l.useState)(!1);
	(0, l.useEffect)(() => cs(n), []);
	let a = Hs(), o = Js();
	function s(e) {
		as({ soundMode: e });
	}
	function c(e) {
		as({ soundPackId: e }), Us(), xs(e);
	}
	function u(e) {
		as({ hapticsMode: e });
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
					children: Object.keys(Jo).map((e) => /* @__PURE__ */ (0, g.jsx)("option", {
						value: e,
						children: Jo[e]
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
function Wd({ open: e, onClose: t }) {
	let { settings: n, updateSettings: r, resetSettings: i } = Rc();
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
						children: Object.keys(Ac).map((e) => /* @__PURE__ */ (0, g.jsx)("option", {
							value: e,
							children: Ac[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, g.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, g.jsx)("span", { children: "Card style" }), /* @__PURE__ */ (0, g.jsx)("select", {
						value: n.cardPackId,
						onChange: (e) => r({ cardPackId: e.target.value }),
						children: Object.keys(Oc).map((e) => /* @__PURE__ */ (0, g.jsx)("option", {
							value: e,
							children: Oc[e]
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
var Gd = 0;
function Kd() {
	return Gd += 1, `evt-${Gd}-${Date.now()}`;
}
function qd(e, t, n) {
	let r = t.currentPot, i = [];
	return r >= t.potCap && t.limEnabled && r > e.pot ? i.push({
		id: Kd(),
		kind: "pot-cap",
		title: "Pot cap reached",
		subtitle: "LmT engaged",
		emoji: "🔒",
		durationMs: 2200
	}) : r >= t.anteAmount * Math.max(n.length, 2) * 2 && r > e.pot && i.push({
		id: Kd(),
		kind: "big-pot",
		title: "Big pot brewing",
		emoji: "💰",
		durationMs: 2e3
	}), i;
}
function Jd({ session: e, potMetrics: t, participantIds: n }) {
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
		let o = qd(r, t, n);
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
				id: Kd(),
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
function Yd(e) {
	return e === "handReset" || e === "ante" || e === "trumpReveal" || e === "trumpMerge" || e === "drawPlayer" || e === "drawReady" || e === "settle" || e === "nextHandReset";
}
function Xd(e) {
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
function Zd(e) {
	return e.phase === "play" ? "play" : e.phase === "draw" ? "drawPlayer" : e.phase === "decision" ? "decision" : e.phase === "reveal" ? "ante" : e.enrollmentActive ? "enrollment" : "idle";
}
function Qd(e) {
	return {
		phase: Zd(e),
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
function $d(e, t, n = {}) {
	return {
		...e,
		...n,
		phase: t,
		phaseStartedAt: Date.now()
	};
}
function ef(e, t) {
	let n = {};
	for (let r of t.enrolledIds) e.enrolledIds.includes(r) || (n[r] = "join");
	for (let r of t.declinedIds) e.declinedIds.includes(r) || (n[r] = "pass");
	return n;
}
function tf(e, t, n) {
	for (let r of n.drawCompletedIds) if (!nf(e, r) && !e.displayDrawCompletedIds.includes(r) && !t.drawCompletedIds.includes(r)) return r;
	return null;
}
function nf(e, t) {
	return e.drawPresentationConsumedIds.includes(t);
}
function rf(e) {
	return e.phase === "drawPlayer" && e.animatingDrawPlayerId != null && e.drawAnimSubPhase !== "done";
}
function af(e, t) {
	if (t.phase !== "draw" || !rf(e)) return null;
	let n = e.animatingDrawPlayerId, r = t.turnPlayerId;
	return !n || !r || t.drawCompletedIds.includes(r) || n === r && !t.drawCompletedIds.includes(n) ? null : (Pl() && Fl("handPresentation", "fast-forward-stale-draw", {
		animating: n,
		turnId: r,
		drawCompleted: t.drawCompletedIds
	}), {
		...df(e, t),
		pendingSnapshot: t,
		prevSnapshot: t
	});
}
function of(e, t) {
	return !t || nf(e, t) ? e.drawPresentationConsumedIds : [...e.drawPresentationConsumedIds, t];
}
function sf(e, t) {
	return [...new Set([...e.drawPresentationConsumedIds, ...t])];
}
function cf(e, t, n) {
	for (let r of t.actionOrder) if (t.participantIds.includes(r) && t.drawCompletedIds.includes(r) && !n.includes(r) && !nf(e, r)) return r;
	return null;
}
function lf(e, t, n, r) {
	Pl() && Fl("handPresentation", "draw-candidate-resolve", {
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
function uf(e, t, n) {
	Pl() && Fl("handPresentation", `draw-receive-commit-${e}`, {
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
function df(e, t) {
	let n = e.animatingDrawPlayerId;
	if (!n) return e.drawAnimSubPhase === "done" ? e : {
		...e,
		drawAnimSubPhase: "done"
	};
	let r = e.displayDrawCompletedIds.includes(n) ? e.displayDrawCompletedIds : [...e.displayDrawCompletedIds, n], i = of(e, n), a = t == null ? e.prevSnapshot : {
		...t,
		drawCompletedIds: [...r]
	};
	return uf("payload", e, {
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
function ff(e, t) {
	return e > 0 ? "discard" : t > 0 ? "receive" : "done";
}
function pf(e, t, n, r, i, a) {
	return nf(e, n) ? (lf(e, t, null, `consumed-skip:${n}:${a}`), e) : rf(e) && e.animatingDrawPlayerId !== n ? (lf(e, t, null, `in-flight-skip:${a}`), e) : (lf(e, t, n, a), $d(e, "drawPlayer", {
		animatingDrawPlayerId: n,
		drawAnimSubPhase: ff(r, i),
		drawDiscardCount: r,
		drawReplaceCount: i,
		prevSnapshot: t,
		drawPresentationConsumedIds: of(e, n)
	}));
}
function mf(e) {
	if (!e.pendingHandSettle || e.phase !== "play") return e;
	let t = e.handSettleSnapshot ?? e.prevSnapshot;
	return t ? $d(e, "settle", {
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		settleAnimActive: !0,
		settleCarryOver: t.carryOverPot > 0,
		prevSnapshot: t,
		displayPotAmount: t.potAmount
	}) : e;
}
function hf(e, t) {
	return $d(e, "ante", {
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
function gf(e, t, n, r) {
	let i = tf(e, {
		...t,
		drawCompletedIds: []
	}, t);
	return i ? pf(e, t, i, n, r, "beginDrawSequence") : $d(e, "drawPlayer", {
		displayDrawCompletedIds: e.displayDrawCompletedIds,
		prevSnapshot: t
	});
}
function _f(e, t) {
	let n = vf(e, t);
	return Pl() && (e.phase !== n.phase || e.handNumber !== n.handNumber || e.trumpRevealActive !== n.trumpRevealActive || t.type === "serverUpdate") && Fl("handPresentation", t.type, {
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
function vf(e, t) {
	switch (t.type) {
		case "reset": return Qd(t.snapshot);
		case "dealCardRevealed": return {
			...e,
			dealStaggerCount: Math.max(e.dealStaggerCount, t.count)
		};
		case "clearEnrollmentPulse": return Object.keys(e.enrollmentPulse).length ? {
			...e,
			enrollmentPulse: {}
		} : e;
		case "watchdog": return e.pendingHandSettle && e.phase === "play" ? mf(e) : Date.now() - e.phaseStartedAt < 12e3 ? e : yf({
			...e,
			pendingSnapshot: e.pendingSnapshot ?? e.prevSnapshot
		});
		case "tryBeginHandSettle": return mf(e);
		case "advancePhase": return yf(e);
		case "serverUpdate": {
			let { snapshot: n, heroDrawDiscardCount: r = 0, heroDrawReplaceCount: i = 0 } = t, a = e.prevSnapshot ?? n;
			if (e.sessionKey !== n.sessionKey) {
				let e = Qd(n);
				return n.phase === "reveal" ? hf(e, n) : e;
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
				let e = Qd(n);
				return n.phase === "reveal" ? hf(e, n) : e;
			}
			if (n.phase === "play" && e.phase !== "play") return $d(e, "play", {
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
			if (Yd(e.phase) && e.phase !== "drawPlayer" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done") return {
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
			let o = ef(a, n), s = Object.keys(o).length > 0;
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
			if (n.phase === "reveal" && a.phase !== "reveal" && (e.phase === "idle" || e.phase === "nextHandReset" || e.phase === "enrollment" || e.phase === "settle" || e.phase === "play")) return hf(e, n);
			if (n.phase === "draw" && a.enrollmentActive && !n.enrollmentActive && e.phase === "enrollment") {
				let t = !!n.trumpUpcard;
				return $d(e, t ? "trumpReveal" : "ante", {
					trumpRevealActive: t,
					anteAnimActive: !0,
					dealStaggerCount: Math.max(e.dealStaggerCount, n.participantIds.length),
					prevSnapshot: n,
					displayPotAmount: n.potAmount
				});
			}
			if (n.phase === "draw" && (e.phase === "decision" || a.phase === "decision") && e.drawPresentationConsumedIds.length === 0 && e.displayDrawCompletedIds.length === 0 && e.phase !== "drawPlayer" && e.phase !== "drawReady") return gf(e, n, 0, 0);
			if (n.phase === "draw") {
				let t = af(e, n);
				t && (e = t);
				let o = tf(e, a, n);
				if (o && e.phase !== "drawReady") {
					let t = e.phase === "drawPlayer" && e.animatingDrawPlayerId === o && e.drawAnimSubPhase !== "done";
					if (!t && !rf(e)) {
						let t = r > 0 || i > 0, a = t ? r : o === n.turnPlayerId ? 0 : 1;
						return pf(e, n, o, a, t ? i : a, "serverUpdate");
					}
					t ? lf(e, n, null, "serverUpdate:animating-same-player") : rf(e) && lf(e, n, null, "serverUpdate:in-flight-other-player");
				} else o || lf(e, n, null, "serverUpdate:no-candidate");
				if (n.drawCompletedIds.length === n.participantIds.length && n.participantIds.length > 0 && e.phase === "drawPlayer" && e.drawAnimSubPhase === "done") return $d(e, "drawReady", { prevSnapshot: n });
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
function yf(e) {
	let t = e.pendingSnapshot ?? e.prevSnapshot;
	switch (e.phase) {
		case "handReset": return $d(e, "ante", {
			anteAnimActive: !0,
			pendingSnapshot: null
		});
		case "ante": return e.trumpRevealActive || t?.trumpUpcard ? $d(e, "trumpReveal", {
			trumpRevealActive: !0,
			anteAnimActive: !1,
			pendingSnapshot: null
		}) : t?.phase === "draw" ? gf(e, t, 0, 0) : $d(e, "drawPlayer", {
			anteAnimActive: !1,
			pendingSnapshot: null
		});
		case "trumpReveal": return t?.phase === "draw" ? {
			...gf(e, t, 0, 0),
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		} : $d(e, "drawPlayer", {
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		});
		case "trumpMerge": return t?.phase === "draw" ? {
			...gf(e, t, 0, 0),
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0
		} : $d(e, "drawPlayer", {
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
			uf("before", e);
			let n = e.animatingDrawPlayerId, r = df(e, t);
			uf("after", r);
			let i = t ?? r.prevSnapshot;
			if (i && r.displayDrawCompletedIds.length >= i.participantIds.length) return $d(r, "drawReady", {
				displayDrawCompletedIds: r.displayDrawCompletedIds,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				pendingSnapshot: null,
				prevSnapshot: {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				},
				drawPresentationConsumedIds: sf(r, r.displayDrawCompletedIds)
			});
			if (i) {
				let e = {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				}, t = cf(r, i, r.displayDrawCompletedIds);
				if (uf("after", r, {
					playerId: n,
					nextCompleted: r.displayDrawCompletedIds,
					nextChosen: t
				}), t) return lf(r, i, t, "advancePhase:nextPlayer"), pf(r, e, t, 1, 1, "advancePhase:nextPlayer");
				lf(r, i, null, "advancePhase:no-next-player");
			}
			return r;
		}
		case "drawReady": return $d(e, "play", { pendingSnapshot: null });
		case "settle": return $d(e, "nextHandReset", {
			settleAnimActive: !1,
			nextHandResetActive: !0,
			pendingSnapshot: null
		});
		case "nextHandReset": return t ? Qd(t) : $d(e, "idle", { nextHandResetActive: !1 });
		default: return e;
	}
}
function bf(e) {
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
		isPresenting: Yd(e.phase)
	};
}
function xf(e, t = !1) {
	let n = mu(t);
	switch (e.phase) {
		case "handReset": return n.handResetMs;
		case "ante": return n.anteChipTravelMs * Math.max(1, Math.min(e.dealStaggerCount, 8));
		case "trumpReveal": return n.trumpRevealHoldMs;
		case "trumpMerge": return n.trumpMergeAnimMs;
		case "drawPlayer": return e.drawAnimSubPhase === "done" ? 0 : hu(e.drawAnimSubPhase === "receive" ? 0 : e.drawDiscardCount, e.drawAnimSubPhase === "receive" ? e.drawReplaceCount : 0, t);
		case "drawReady": return n.drawReadyBeatMs;
		case "settle": return n.settleHoldMs;
		case "nextHandReset": return n.nextHandResetMs;
		default: return 0;
	}
}
//#endregion
//#region src/table/hooks/useHandPresentation.ts
var Sf = [], Cf = [];
function wf(e, t) {
	let n = new Set(e), r = new Set(t);
	return {
		discardCount: [...n].filter((e) => !r.has(e)).length,
		replaceCount: [...r].filter((e) => !n.has(e)).length
	};
}
function Tf({ session: e, enrollmentActive: t, potAmount: n, handComplete: r, trickPipelineActive: i = !1, forceTrickHandEndDrain: a, heroCards: o = Cf, enrolledIds: s = Sf, declinedIds: c = Sf, actionOrder: u }) {
	let d = (0, l.useMemo)(() => Xd({
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
	]), [f, p] = (0, l.useReducer)(_f, d, Qd), m = (0, l.useRef)([]), h = (0, l.useRef)([]), g = (0, l.useRef)(null), _ = (0, l.useRef)(f);
	_.current = f;
	let v = () => {
		for (let e of m.current) window.clearTimeout(e);
		m.current = [], g.current = null;
	}, y = (e, t) => {
		let n = window.setTimeout(e, t);
		m.current.push(n);
	};
	return (0, l.useEffect)(() => () => v(), []), (0, l.useEffect)(() => {
		let e = o.map((e) => `${e.rank}-${e.suit}`), t = wf(h.current, e);
		h.current = e, p({
			type: "serverUpdate",
			snapshot: d,
			heroDrawDiscardCount: t.discardCount,
			heroDrawReplaceCount: t.replaceCount
		}), Pl() && Fl("useHandPresentation", "serverUpdate-effect", {
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
		let e = Al(), t = `${f.handNumber}:${f.phase}:${f.animatingDrawPlayerId ?? ""}:${f.drawAnimSubPhase}:${f.phaseStartedAt}`;
		if (g.current === t) {
			Pl() && Fl("useHandPresentation", "advancePhase-timer-skip-duplicate", { phaseKey: t });
			return;
		}
		v();
		let n = xf(f, e);
		if (n <= 0) return;
		let r = {
			handNumber: f.handNumber,
			phase: f.phase,
			animatingDrawPlayerId: f.animatingDrawPlayerId,
			drawAnimSubPhase: f.drawAnimSubPhase,
			phaseStartedAt: f.phaseStartedAt
		};
		g.current = t, Pl() && Fl("useHandPresentation", "advancePhase-timer-armed", {
			phaseKey: t,
			delay: n,
			fromPhase: f.phase,
			drawAnimSubPhase: f.drawAnimSubPhase
		}), y(() => {
			if (g.current !== t) return;
			g.current = null;
			let e = _.current;
			if (e.handNumber !== r.handNumber || e.phase !== r.phase || e.animatingDrawPlayerId !== r.animatingDrawPlayerId || e.drawAnimSubPhase !== r.drawAnimSubPhase || e.phaseStartedAt !== r.phaseStartedAt) {
				Pl() && Fl("useHandPresentation", "advancePhase-timer-stale", {
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
			Pl() && Fl("useHandPresentation", "advancePhase-timer", {
				fromPhase: r.phase,
				delay: n,
				animatingDrawPlayerId: r.animatingDrawPlayerId,
				drawAnimSubPhase: r.drawAnimSubPhase
			}), p({ type: "advancePhase" });
		}, n), y(() => p({ type: "watchdog" }), f.phase === "drawPlayer" || f.phase === "drawReady" ? fu : du);
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
			e.phase !== "play" || !e.pendingHandSettle || (Pl() && Fl("useHandPresentation", "hand-end-convergence-force", { trickPipelineActive: !0 }), a?.(), p({ type: "tryBeginHandSettle" }));
		}, pu);
		return () => window.clearTimeout(e);
	}, [
		f.phase,
		f.pendingHandSettle,
		i,
		a
	]), bf(f);
}
//#endregion
//#region src/session/liveHand.ts
function Ef() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function Df(e) {
	let t = e ?? Ef();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function Of(e) {
	if (!e) return !1;
	let t = e.phase ?? null;
	if (t !== "draw" && t !== "play" && t !== "reveal" && t !== "decision") return !1;
	let n = e.participantIds ?? [];
	if (n.length === 0) return !1;
	let r = e.tricksByPlayer ?? {};
	return !(Qc(r, n) || Zc(r, n) >= 5);
}
function kf(e) {
	if (!e) return 0;
	let t = e.phase ?? "", n = t === "play" ? 1e3 : t === "draw" ? 100 : t === "decision" ? 50 : t === "reveal" ? 25 : 0;
	n += (e.drawCompletedIds?.length ?? 0) * 10;
	let r = e.participantIds ?? [];
	n += Zc(e.tricksByPlayer ?? {}, r);
	let i = e.handDecision;
	return t === "decision" && i && (n += (i.currentIndex ?? 0) * 5, n += (i.playingIds?.length ?? 0) * 2, n += (i.passedIds?.length ?? 0) * 2), n;
}
function Af(e, t) {
	return Of(t) ? Of(e) ? kf(t) >= kf(e) ? t : e : t : e;
}
function jf(e) {
	let t = e?.phase ?? null;
	return t === "reveal" || t === "decision" || t === "draw" || t === "play";
}
function Mf(e) {
	let t = e?.currentHand ?? Ef(), n = e?.liveEnrollment?.deal?.publicHand, r = n?.phase ?? null;
	if (Df(t) && n && !Of(n)) return Ef();
	if (Of(t) && Of(n)) {
		let e = t.phase === "reveal" || t.phase === "decision", r = n?.drawCompletedIds?.length ?? 0, i = t.drawCompletedIds?.length ?? 0, a = Zc(n?.tricksByPlayer ?? {}, n?.participantIds ?? []), o = Zc(t.tricksByPlayer ?? {}, t.participantIds ?? []);
		return e && n?.phase === "draw" && o === 0 && a === 0 && r > 0 && i === 0 ? t : Af(t, n);
	}
	if (Of(t)) return t;
	if (r === "draw" || r === "play" || r === "reveal" || r === "decision") {
		if (Of(n)) {
			let i = Zc(n?.tricksByPlayer ?? {}, n?.participantIds ?? []);
			return Df(t) && i === 0 && r === "draw" && !e?.liveEnrollment?.active ? Ef() : n;
		}
		return n?.phase ? n : jf(t) ? t : Df(t) ? Ef() : t;
	}
	return r && n ? n : t;
}
function Nf(e) {
	let t = Mf(e), n = t?.phase ?? null;
	if (n === "reveal" || n === "draw" || n === "play") return null;
	if (n === "decision") {
		let e = Eo(t.handDecision ?? null);
		if (e?.active) return e;
	}
	let r = e?.liveEnrollment, i = r?.deal?.publicHand?.phase ?? null;
	return r?.active ? r : i === "draw" || i === "play" || i === "reveal" || i === "decision" ? null : e?.handEnrollment?.active ? e.handEnrollment : e?.handEnrollment ?? null;
}
function Pf(e) {
	return !e.cardsDealt && e.handParticipantCount === 0 && e.enrollmentActive;
}
function Ff(e, t) {
	return e === "decision" && t?.active === !0;
}
function If(e) {
	return e.pagatDecisionActive && e.handDecision ? (e.handDecision.orderedPlayerIds ?? [])[e.handDecision.currentIndex ?? 0] ?? null : e.legacyEnrollmentActive && e.enrollment?.active ? (e.enrollment.orderedPlayerIds ?? [])[e.enrollment.currentIndex ?? 0] ?? null : null;
}
function Lf(e) {
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
}, Rf = [
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
], zf = (e, t) => `${e}:${t}`;
new Map(Rf.map((e) => [zf(e.from, e.event), e.to]));
function Bf(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
function Vf(e, t) {
	return !e || !t ? !1 : e === t ? !0 : Bf(e);
}
function Hf() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function Uf(e) {
	let t = e.session, n = t ? Mf(t) : Hf(), r = n.phase ?? null, i = n.participantIds ?? [], a = n.tricksByPlayer ?? {}, o = Zc(a, i), s = i.length > 0 && Qc(a, i), c = !!t?.pendingCoWinSettlement?.winnerIds?.length, l = t ? Nf(t) : null, u = Ff(r, n.handDecision ?? null), d = Pf({
		cardsDealt: r === To.REVEAL || r === To.DECISION || r === To.DRAW || r === To.PLAY,
		handParticipantCount: i.length,
		enrollmentActive: !!l?.active
	}), f = d || u, p = Wf({
		sessionStatus: t?.status ?? null,
		handPhase: r,
		participantIds: i,
		trickCount: o,
		handComplete: s,
		pendingCoWin: c,
		enrollmentActive: f,
		handCount: t?.handCount ?? 0,
		clearedHand: Df(n)
	});
	return {
		phase: p,
		handPhase: r,
		enrollmentActive: f,
		pagatDecisionActive: u,
		participantIds: i,
		turnPlayerId: Gf({
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
function Wf(e) {
	if (e.sessionStatus === "final") return $.WAITING;
	if (e.pendingCoWin) return $.SETTLE;
	let t = e.handPhase ?? null, n = e.participantIds ?? [];
	return t === To.PLAY ? e.handComplete || (e.trickCount ?? 0) >= 5 ? $.SETTLE : $.PLAY : t === To.DRAW ? $.DRAW : t === To.REVEAL ? $.DEAL : t === To.DECISION || e.enrollmentActive ? $.ENROLLMENT : e.clearedHand !== !1 && n.length === 0 && (e.handCount ?? 0) > 0 && !e.enrollmentActive ? $.NEXT_HAND_PREP : $.WAITING;
}
function Gf(e) {
	let { phase: t, hand: n, enrollment: r, pagatDecisionActive: i, legacyEnrollmentActive: a } = e;
	return t === $.ENROLLMENT ? If({
		pagatDecisionActive: i,
		handDecision: n.handDecision ?? null,
		legacyEnrollmentActive: a,
		enrollment: r
	}) : t === $.DRAW || t === $.PLAY ? n.turnPlayerId ?? null : null;
}
function Kf(e) {
	let { snapshot: t, action: n, playerId: r, actorId: i, suppressTurn: a = !1 } = e, o = e.drawCompletedIds ?? [];
	if (!Vf(r, i)) return {
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
//#region src/table/turnCountdown.ts
var qf = 15e3, Jf = new Set([
	$.ENROLLMENT,
	$.DRAW,
	$.PLAY
]);
function Yf(e) {
	return e > 1e4 ? "green" : e > 5e3 ? "yellow" : "red";
}
function Xf(e) {
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
function Zf(e) {
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
function Qf(e) {
	if (e.handComplete || e.suppressTurn) return null;
	let t = Uf({
		session: Zf(e),
		suppressTurn: e.suppressTurn
	});
	return Jf.has(t.phase) ? t.turnPlayerId : null;
}
function $f(e, t, n) {
	let r = qf - Math.max(0, n - t) % qf;
	return {
		playerId: e,
		remainingMs: r,
		progress: r / qf,
		segment: Yf(r)
	};
}
//#endregion
//#region src/table/hooks/useTurnCountdown.ts
function ep(e) {
	let t = Qf(e), n = Xf({
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
		let e = () => o(Date.now()), n = Al() ? 250 : 100, i = window.setInterval(e, n);
		return () => window.clearInterval(i);
	}, [t, n]), {
		countdown: t && r.current != null ? $f(t, r.current, a) : null,
		reducedMotion: Al()
	};
}
//#endregion
//#region src/table/hooks/useTableMicrointeractions.ts
function tp(e) {
	let [t, n] = (0, l.useState)(_o), r = (0, l.useRef)(null), i = (0, l.useRef)([]), a = () => {
		for (let e of i.current) window.clearTimeout(e);
		i.current = [];
	}, o = (e, t) => {
		let n = window.setTimeout(e, t);
		i.current.push(n);
	};
	(0, l.useEffect)(() => () => a(), []);
	let s = JSON.stringify(e.tricksByPlayer), c = JSON.stringify(e.bankrollByPlayer), u = JSON.stringify(e.bourrePlayerIds);
	return (0, l.useEffect)(() => {
		let t = yo(r.current, e);
		if (r.current = vo(e), !(!t.turnHandoffPlayerId && !t.dealerMovedPlayerId && !t.potTick && Object.keys(t.trickBadgeIncrements).length === 0 && Object.keys(t.bankrollChanges).length === 0 && t.bourrePlayerIds.length === 0 && !t.trumpReminderPulse && !t.feedbackErrorPulse && !t.feedbackSuccessPulse && !t.winnerFlashPlayerId)) {
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
			}, go.turnHandoff), t.dealerMovedPlayerId && o(() => {
				n((e) => e.dealerMovedPlayerId === t.dealerMovedPlayerId ? {
					...e,
					dealerMovedPlayerId: null
				} : e);
			}, go.dealerMove), t.winnerFlashPlayerId && o(() => {
				n((e) => e.winnerFlashPlayerId === t.winnerFlashPlayerId ? {
					...e,
					winnerFlashPlayerId: null
				} : e);
			}, go.winnerFlash);
			for (let [e, r] of Object.entries(t.bankrollChanges)) o(() => {
				n((t) => {
					if (t.bankrollTicks[e] !== r) return t;
					let n = { ...t.bankrollTicks };
					return delete n[e], {
						...t,
						bankrollTicks: n
					};
				});
			}, go.bankrollTick);
			for (let e of t.bourrePlayerIds) o(() => {
				n((t) => t.bourreAlerts[e] === "pulse" ? {
					...t,
					bourreAlerts: {
						...t.bourreAlerts,
						[e]: "marker"
					}
				} : t);
			}, go.bourrePulse), o(() => {
				n((t) => {
					if (!t.bourreAlerts[e]) return t;
					let n = { ...t.bourreAlerts };
					return delete n[e], {
						...t,
						bourreAlerts: n
					};
				});
			}, go.bourreMarker);
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
function np({ active: e, displayName: t }) {
	let [n, r] = (0, l.useState)(!1), i = Al();
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
var rp = qf, ip = [
	12e3,
	18e3,
	24e3
];
function ap(e) {
	let [t, n] = (0, l.useState)("hidden"), [r, i] = (0, l.useState)(0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(null), c = (0, l.useRef)(0), u = (0, l.useRef)(e.actionRequired);
	u.current = e.actionRequired;
	let d = () => {
		a.current != null && (window.clearTimeout(a.current), a.current = null), o.current != null && (window.clearTimeout(o.current), o.current = null), s.current != null && (window.clearTimeout(s.current), s.current = null);
	}, f = (0, l.useCallback)(() => {
		let e = c.current;
		if (e === 0) return;
		let t = ip[Math.min(e - 1, ip.length - 1)];
		a.current = window.setTimeout(() => {
			a.current = null, u.current && (i(e), n("pop"), c.current = e + 1);
		}, t);
	}, []);
	return (0, l.useEffect)(() => (d(), c.current = 0, e.actionRequired ? (a.current = window.setTimeout(() => {
		a.current = null, u.current && (i(0), n("pop"), c.current = 1);
	}, rp), d) : (n("hidden"), i(0), d)), [e.activityKey, e.actionRequired]), (0, l.useEffect)(() => {
		if (t !== "pop") return;
		let e = Al() ? 280 : 420;
		return o.current = window.setTimeout(() => {
			o.current = null, n("exit");
		}, 380 + e), () => {
			o.current != null && (window.clearTimeout(o.current), o.current = null);
		};
	}, [t, r]), (0, l.useEffect)(() => {
		if (t !== "exit") return;
		let e = Al() ? 240 : 620;
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
function op() {
	return Al();
}
//#endregion
//#region src/table/YourTurnAttention.tsx
function sp({ actionRequired: e, activityKey: t }) {
	let { phase: n, beat: r } = ap({
		actionRequired: e,
		activityKey: t
	});
	if (n === "hidden") return null;
	let i = op(), a = Math.min(r, 5);
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
//#region src/table/hooks/useInactivityHelper.ts
var cp = 5e3, lp = 1e3;
function up(e) {
	return e === "draw" ? "Choose discard and then tap" : e === "play" ? "Tap a card to play" : null;
}
function dp(e) {
	let [t, n] = (0, l.useState)(!1), [r, i] = (0, l.useState)(!0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(e.actionRequired);
	s.current = e.actionRequired;
	let c = up(e.phase), u = e.actionRequired && c != null && !e.hasUserInteracted;
	return (0, l.useEffect)(() => {
		if (a.current != null && (window.clearTimeout(a.current), a.current = null), n(!1), u) return a.current = window.setTimeout(() => {
			a.current = null, !(!s.current || e.hasUserInteracted) && (n(!0), i(!0));
		}, cp), () => {
			a.current != null && (window.clearTimeout(a.current), a.current = null);
		};
	}, [
		e.activityKey,
		u,
		e.hasUserInteracted
	]), (0, l.useEffect)(() => {
		if (o.current != null && (window.clearInterval(o.current), o.current = null), !t || !u || Al()) {
			i(!0);
			return;
		}
		return o.current = window.setInterval(() => {
			i((e) => !e);
		}, lp), () => {
			o.current != null && (window.clearInterval(o.current), o.current = null);
		};
	}, [
		t,
		u,
		e.activityKey
	]), {
		visible: t && u,
		text: c,
		flashOn: r
	};
}
//#endregion
//#region src/table/InactivityHelper.tsx
function fp({ actionRequired: e, activityKey: t, phase: n, hasUserInteracted: r }) {
	let { visible: i, text: a, flashOn: o } = dp({
		actionRequired: e,
		activityKey: t,
		phase: n,
		hasUserInteracted: r
	});
	return !i || !a ? null : /* @__PURE__ */ (0, g.jsx)("p", {
		className: ["btable-session__inactivity-helper", o ? "btable-session__inactivity-helper--on" : ""].filter(Boolean).join(" "),
		"data-testid": "inactivity-helper",
		"aria-live": "polite",
		children: a
	});
}
//#endregion
//#region src/table/localAction.ts
function pp(e) {
	let t = e.currentUserId;
	if (!t || e.handComplete) return !1;
	let n = e.selfPlayer, r = Lf({
		phase: e.session.phase,
		participantIds: e.session.participantIds,
		playerId: t
	});
	if (!n || !r && n.isOut || n.actionDeclared) return !1;
	let i = Uf({
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
	let a = Kf({
		snapshot: i,
		action: "submit_draw",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn,
		drawCompletedIds: e.session.drawCompletedIds
	});
	if (i.phase === $.DRAW && a.ok) return !0;
	let o = Kf({
		snapshot: i,
		action: "play_card",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn
	});
	return !!(i.phase === $.PLAY && o.ok);
}
function mp(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off";
	return [
		e.session.phase ?? "",
		e.session.turnPlayerId ?? "",
		n,
		e.selfPlayer?.actionDeclared ? "declared" : "open",
		e.session.drawCompletedIds?.join(",") ?? "",
		e.suppressTurn ? "1" : "0",
		pp(e) ? "act" : "wait"
	].join("|");
}
//#endregion
//#region src/table/hooks/useTrumpTrickMotionGate.ts
var hp = 880;
function gp(e, t, n) {
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
		}, hp);
		return () => window.clearTimeout(n);
	}, [e, t]), (0, l.useEffect)(() => {
		if (!i || t || n === 0) return;
		let e = window.setTimeout(() => {
			a(!1), r.current = !1;
		}, hp);
		return () => window.clearTimeout(e);
	}, [
		i,
		t,
		n
	]), i;
}
//#endregion
//#region src/table/trickPresentationMachine.ts
function _p(e, t) {
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
		peakTrickPlays: Tl(t),
		displayRevealFloor: 0
	};
}
function vp(e, t) {
	if (t.length < e.length) return !1;
	for (let n = 0; n < e.length; n++) if (no(e[n]) !== no(t[n])) return !1;
	return !0;
}
function yp(e, t, n) {
	let r = t.currentTrick?.trickNumber ?? null, i = e.prevTrick?.trickNumber ?? null, a = r != null && i != null && r !== i ? [] : [...e.peakTrickPlays ?? []];
	for (let t of [
		n,
		Tl(e.prevTrick),
		e.peakTrickPlays ?? []
	]) t.length > a.length && vp(a, t) && (a = t);
	return a;
}
function bp(e, t) {
	return e.phase === "live" ? e : {
		...e,
		pendingServer: t
	};
}
function xp(e) {
	return Math.max(e.pendingResolution?.frozen.plays.length ?? 0, Tl(e.prevTrick).length, e.peakTrickPlays?.length ?? 0);
}
function Sp(e, t) {
	let n = Tl(t.currentTrick), r = Tl(e.prevTrick), i = yp(e, t, n), a = e.phase === "live" && !e.pendingResolution && (n.length < e.revealedCount && r.length >= e.revealedCount || n.length < i.length && r.length >= i.length), o = t.currentTrick?.trickNumber ?? null, s = e.prevTrick?.trickNumber ?? null, c = o != null && s != null && o !== s;
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
function Cp(e, t, n, r) {
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
function wp(e, t) {
	let n = Tp(e, t);
	if (Pl()) {
		let r = Tl(e.prevTrick).length, i = Tl(n.prevTrick).length;
		(e.phase !== n.phase || e.revealedCount !== n.revealedCount || r !== i || !!e.pendingResolution != !!n.pendingResolution || t.type === "serverUpdate") && Fl("trickPresentation", t.type, {
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
function Tp(e, t) {
	switch (t.type) {
		case "reset":
		case "reinit": return _p(t.type === "reinit" ? t.snapshot.tricksByPlayer : e.displayTricksByPlayer, t.type === "reinit" ? t.snapshot.currentTrick : null);
		case "revealNextCard": {
			if (e.phase !== "live") return e;
			let t = xp(e);
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
			return !t || e.phase !== "live" ? e : Cp({
				...e,
				pendingResolution: null
			}, t.frozen, t.snapshot.tricksByPlayer, t.snapshot.currentTrick);
		}
		case "forceHandEndDrain": {
			let t = e;
			if (t.phase === "live" && t.pendingResolution && (t = Cp({
				...t,
				pendingResolution: null
			}, t.pendingResolution.frozen, t.pendingResolution.snapshot.tricksByPlayer, t.pendingResolution.snapshot.currentTrick)), t.phase === "live" && !t.pendingResolution) return t;
			let n = t.pendingServer, r = n?.tricksByPlayer ?? {}, i = Object.values(r).some((e) => (e ?? 0) > 0), a = i ? { ...r } : { ...t.displayTricksByPlayer }, o = Tl(n?.currentTrick).length;
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
				peakTrickPlays: Tl(n?.currentTrick),
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
				let t = e.pendingServer, n = Tl(t?.currentTrick).length;
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
					peakTrickPlays: Tl(t?.currentTrick),
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
			if (e.phase !== "live") return bp(e, n);
			let i = kl({
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
			} : Sp(e, n);
		}
		default: return e;
	}
}
function Ep(e, t) {
	let n = e.pendingResolution?.frozen.plays ?? [];
	if (n.length > 0) return n;
	let r = Tl(e.prevTrick), i = e.peakTrickPlays ?? [];
	return e.phase === "live" ? i.length > t.length ? i : r.length > t.length ? r : t.length > 0 ? t : r : t.length > 0 ? t : r.length > 0 ? r : i;
}
function Dp(e, t) {
	let n = Ep(e, Tl(t)), r = e.displayRevealFloor, i = n.length >= r ? n : (e.peakTrickPlays?.length ?? 0) >= r ? e.peakTrickPlays : n, a = e.phase === "live" ? e.pendingResolution ? Math.max(e.revealedCount, i.length) : Math.min(e.revealedCount, i.length) : i.length, o = e.phase === "live" && !e.pendingResolution ? Math.max(a, r) : a, s = e.phase === "live" ? i.slice(0, o) : e.frozenTrick?.plays ?? [], c = e.frozenTrick?.plays ?? [], l = e.frozenTrick?.winnerId ?? null, u = e.phase, d = c.length > 0 && s.length === 0 && e.phase !== "live", f = e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null, p = e.showWinnerTag && (e.phase === "winnerReveal" || e.phase === "collectTrick"), m = e.peakTrickPlays?.length ?? 0, h = e.phase === "live" ? xp(e) : e.revealedCount;
	return {
		phase: e.phase,
		displayPlays: s,
		winnerPlayerId: f,
		showWinnerTag: p,
		displayTricksByPlayer: e.displayTricksByPlayer,
		suppressTurnPlayerId: bl(e.phase),
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
function Op({ phase: e, currentTrick: t, tricksByPlayer: n, participantIds: r, trumpSuit: i, playedCards: a, turnPlayerId: o, handComplete: s = !1 }) {
	let [c, u] = (0, l.useReducer)(wp, n, (e) => _p(e, t)), d = (0, l.useRef)([]), f = (0, l.useRef)(null), p = (0, l.useRef)(/* @__PURE__ */ new Set()), m = (0, l.useRef)(!1), h = (0, l.useRef)(null), g = (0, l.useRef)(0), _ = (0, l.useRef)(!1), v = (0, l.useRef)(c);
	v.current = c;
	let y = c.phase !== "live" || !!c.pendingResolution;
	m.current = y;
	let b = e === "play", x = (e) => {
		for (let t of e) {
			let e = no(t);
			p.current.has(e) || (p.current.add(e), fo(t.playerId, e));
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
			S(), f.current = null, p.current.clear(), ho(), u({
				type: "reinit",
				snapshot: {
					currentTrick: t,
					tricksByPlayer: n,
					playedCards: a
				}
			}), Pl() && Fl("useTrickPresentation", c ? "reinit-play-entry" : "reinit-idle", {
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
			reducedMotion: Al()
		}), Pl() && Fl("useTrickPresentation", "serverUpdate-effect", {
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
		co(r), o && co([o]);
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
		let t = c.frozenTrick, n = Sl({
			trumpBeat: Ol(t.plays, t.leadSuit, i),
			reducedMotion: Al()
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
		let t = Al() ? 308 : 560, n = window.setTimeout(() => u({ type: "commitTrickResolution" }), t);
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
		let n = Al(), i = n ? 60 : 160, a = n ? 80 : 220, o = [], l = (e, t) => {
			o.push(window.setTimeout(e, t));
		};
		Pl() && Fl("useTrickPresentation", "hand-end-drain-armed", {
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
			e.phase === "live" && !e.pendingResolution || (Pl() && Fl("useTrickPresentation", "hand-end-drain-force", {
				phase: e.phase,
				pendingResolution: !!e.pendingResolution
			}), u({ type: "forceHandEndDrain" }));
		}, yl), () => {
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
		let e = Al() ? 369 : 670;
		h.current = window.setTimeout(() => {
			h.current = null, Pl() && Fl("useTrickPresentation", "revealNextCard-timer", {
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
		...Dp(c, t),
		forceHandEndDrain: () => u({ type: "forceHandEndDrain" })
	};
}
var kp = {
	pipelineActive: !1,
	revealCatchUp: !1,
	motionGateActive: !1,
	peakPlayCount: 0,
	displayedPlayCount: 0,
	handPresenting: !1,
	handPresentationPhase: "idle",
	dealPresentationActive: !1,
	trickCollectionActive: !1
}, Ap = kp, jp = /* @__PURE__ */ new Set(), Mp = 0, Np = null;
function Pp(e, t) {
	return e.pipelineActive === t.pipelineActive && e.revealCatchUp === t.revealCatchUp && e.motionGateActive === t.motionGateActive && e.peakPlayCount === t.peakPlayCount && e.displayedPlayCount === t.displayedPlayCount && e.handPresenting === t.handPresenting && e.handPresentationPhase === t.handPresentationPhase && e.dealPresentationActive === t.dealPresentationActive && e.trickCollectionActive === t.trickCollectionActive;
}
function Fp(e) {
	return e.dealPresentationActive ? "dealPresentationActive" : e.trickCollectionActive ? "trickCollectionActive" : e.handPresenting ? "handPresenting" : e.pipelineActive ? "pipelineActive" : e.revealCatchUp ? "revealCatchUp" : e.peakPlayCount > e.displayedPlayCount && e.peakPlayCount > 0 ? "peakPlayCatchUp" : null;
}
function Ip(e) {
	return Fp(e) != null;
}
function Lp(e, t, n) {
	return !(!e || n === "play" || n === "draw" && (t === "drawPlayer" || t === "drawReady"));
}
function Rp(e) {
	let t = { ...Ap }, n = Np ? Date.now() - Np.since : 0, r = {
		...Ap,
		pipelineActive: !1,
		revealCatchUp: !1,
		handPresenting: !1,
		handPresentationPhase: "idle",
		peakPlayCount: Ap.displayedPlayCount,
		motionGateActive: !1,
		dealPresentationActive: !1,
		trickCollectionActive: !1
	};
	Mp = Date.now() + 1500, Np = null, Pl() && Fl("trickAnimationBridge", "table-presentation-force-release", {
		source: e,
		blockedMs: n,
		from: t,
		to: r
	}), Vp(r);
}
function zp(e = Date.now()) {
	if (e < Mp) return {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	let t = Fp(Ap);
	if (t == null) return Np = null, {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	(!Np || Np.reason !== t) && (Np = {
		reason: t,
		since: e,
		blockedLogged: !1
	});
	let n = e - Np.since;
	return n >= 7e3 ? (Pl() && !Np.blockedLogged && Fl("trickAnimationBridge", "gate-force-release", {
		reason: t,
		blockedMs: n
	}), Rp("gate-timeout"), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !0
	}) : n >= 5500 ? (Pl() && !Np.blockedLogged && (Fl("trickAnimationBridge", "gate-soft-unblock", {
		reason: t,
		blockedMs: n
	}), Np.blockedLogged = !0), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !1
	}) : (Pl() && !Np.blockedLogged && (Fl("trickAnimationBridge", "gate-blocked", {
		reason: t,
		blockedMs: n
	}), Np.blockedLogged = !0), {
		blocked: !0,
		reason: t,
		blockedMs: n,
		softUnblock: !1,
		forceReleased: !1
	});
}
function Bp(e = Date.now()) {
	return zp(e).blocked;
}
function Vp(e) {
	if (!Pp(Ap, e)) {
		Pl() && Fl("trickAnimationBridge", "busy-state", {
			from: Ap,
			to: e,
			busy: Ip(e),
			blockReason: Fp(e),
			motionGateActive: e.motionGateActive,
			handPresentationPhase: e.handPresentationPhase
		}), Ap = e, Fp(e) ?? (Np = null);
		for (let e of jp) e();
	}
}
function Hp() {
	Mp = 0, Np = null, Vp(kp);
}
function Up() {
	return Ap;
}
function Wp() {
	return Ap.pipelineActive || Ap.revealCatchUp || Ap.motionGateActive || Ap.trickCollectionActive || Ap.peakPlayCount > Ap.displayedPlayCount && Ap.peakPlayCount > 0;
}
function Gp() {
	return Ip(Ap);
}
function Kp(e) {
	return jp.add(e), () => jp.delete(e);
}
//#endregion
//#region src/table/settlementCopy.ts
function qp(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function Jp(e, t) {
	return e.map((e) => qp(e, t)).join(" & ");
}
function Yp(e, t) {
	return Qc(e, t) ? t.filter((t) => (e[t] ?? 0) === 0) : [];
}
function Xp(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: a = {} } = e, o = tl(t, n), s = e.winnerIds?.length ? e.winnerIds : o.winnerIds, c = e.maxTricks ?? o.maxTricks, l = Jp(s, r), u = Yp(t, n), d = Jp(u, r), f = nl(i.maxWinThisHand), p = nl(i.currentPot), m = i.carryIn > 0 ? nl(i.carryIn) : null, h = `Pot this hand: ${p} (max win ${f})`;
	m && (h += ` — includes ${m} carried in`), i.limEnabled && i.overflow > 0 && (h += ` · LIM overflow ${nl(i.overflow)} stays out of play`);
	let g = s.map((e) => {
		let n = t[e] ?? 0;
		return `${qp(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), _ = u.length > 0 ? `Bourré: ${d} took 0 tricks — each pays ${f} at settlement (seeds next deal)` : null, v = e.splitSharePerWinner, y = v > 0 && s.length >= 2 ? `If all co-winners agree to split: ${nl(i.maxWinThisHand)} → ${nl(v)} each` : null, b = s.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, x = `If any co-winner declines: full pot ${p} carries to the next hand · non-winners ante up`, S = s.map((e) => {
		let t = a[e], n = qp(e, r);
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
function Zp({ session: e, players: t, potMetrics: n, splitSharePerWinner: r, currentUserId: i, isCoWinner: a, onSettle: o }) {
	let s = Xp({
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
						nl(r),
						" each"
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/table/SplitPotDecisionToast.tsx
var Qp = 3e3;
function $p(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function em({ session: e, players: t, splitSharePerWinner: n, currentUserId: r, isCoWinner: i, onAgreeSplit: a, onDeclineSplit: o, onCarryover: s }) {
	let c = e.pendingCoWinSettlement?.winnerIds ?? [], u = e.pendingCoWinSettlement?.votes ?? {}, [d, f] = (0, l.useState)(Qp), [p, m] = (0, l.useState)(!1), h = (0, l.useRef)(null), _ = (0, l.useRef)(!1), v = (0, l.useMemo)(() => `${c.join(",")}:${e.handNumber ?? 0}`, [c, e.handNumber]);
	(0, l.useEffect)(() => {
		h.current = Date.now(), _.current = !1, f(Qp), m(!1);
	}, [v]);
	let y = c.length >= 2 && c.every((e) => u[e] === "split"), b = (0, l.useCallback)(() => {
		_.current || (_.current = !0, s());
	}, [s]);
	if ((0, l.useEffect)(() => {
		if (c.length < 2) return;
		let e = window.setInterval(() => {
			let e = h.current ?? Date.now(), t = Date.now() - e, n = Math.max(0, Qp - t);
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
	let x = Math.max(0, Math.ceil(d / 1e3)), S = c.map((e) => $p(e, t)).join(" & "), C = (e) => {
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
				children: [nl(n), " each if all agree"]
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
function tm(e, t) {
	return [...e];
}
function nm(e, t) {
	return [...e].sort((e, t) => e - t);
}
function rm(e) {
	let t = !!(e.playerId && e.trumpHolderId && e.playerId === e.trumpHolderId), n = !!e.trumpUpcard, r = !n && !!e.trumpSuit && e.phase === "play";
	if (!t || !n) return {
		displayCards: e.effectiveHeroCards,
		revealedTrumpIndex: null,
		trumpMergeActive: !1,
		trumpMergedIntoHand: !1,
		hideCenterTrumpForHolder: !1,
		showTrumpSuitReminder: r,
		trumpDisabledIndex: null,
		indexMode: "effective"
	};
	let { trumpMergeActive: i, trumpMergedIntoHand: a } = e.handPresentation, o = Ed({
		trumpHolderId: e.trumpHolderId,
		trumpUpcard: e.trumpUpcard,
		trumpSuit: e.trumpSuit,
		phase: e.phase,
		handPresentation: e.handPresentation
	});
	return {
		displayCards: e.effectiveHeroCards,
		revealedTrumpIndex: null,
		trumpMergeActive: i,
		trumpMergedIntoHand: a,
		hideCenterTrumpForHolder: o.hideCenterTrump,
		showTrumpSuitReminder: o.showTrumpSuitReminder,
		trumpDisabledIndex: null,
		indexMode: "effective"
	};
}
//#endregion
//#region src/table/TableSessionView.tsx
var im = [], am = [], om = [];
function sm({ session: e, players: t, potMetrics: n, mySessionNet: r, leaderLabel: i, showCoWinSettlement: a, splitPotEnabled: o = !1, rebuyEnabled: s = !1, splitSharePerWinner: c = 0, enrollmentActive: u = !1, currentUserId: d, heroCards: f = am, rawHeroCards: p = am, privateHandReady: m = !1, legalPlayIndices: h, recentBourreIds: _ = om, handComplete: v = !1, actionFeedback: y, actions: b }) {
	let { settings: x } = Rc(), S = Iu(), [C, w] = (0, l.useState)(!1), T = e.participantIds.length, { events: E, dismissEvent: D, pushReaction: O } = Jd({
		session: e,
		potMetrics: n,
		participantIds: e.participantIds
	}), k = d != null && (e.pendingCoWinSettlement?.winnerIds || []).includes(d), A = Op({
		phase: e.phase,
		currentTrick: e.currentTrick,
		tricksByPlayer: e.tricksByPlayer,
		participantIds: e.participantIds,
		trumpSuit: e.trumpSuit,
		playedCards: e.playedCards,
		turnPlayerId: e.turnPlayerId,
		handComplete: v
	}), ee = A.forceHandEndDrain, j = Tf({
		session: e,
		enrollmentActive: u,
		potAmount: n.currentPot,
		handComplete: v,
		trickPipelineActive: A.isPipelineActive,
		forceTrickHandEndDrain: ee,
		heroCards: f,
		enrolledIds: e.handEnrollment?.enrolledIds ?? im,
		declinedIds: e.handEnrollment?.declinedIds ?? im,
		actionOrder: e.actionOrder ?? e.handEnrollment?.orderedPlayerIds ?? e.participantIds
	}), te = gp(e.phase, e.trumpUpcard, A.displayPlays.length), M = Lp(j.isPresenting, j.phase, e.phase), [ne, N] = (0, l.useState)(0);
	(0, l.useEffect)(() => Nu(() => N((e) => e + 1)), []), (0, l.useEffect)(() => {
		Vp({
			pipelineActive: A.isPipelineActive,
			revealCatchUp: A.phase === "live" && A.revealedCount < A.revealTarget,
			motionGateActive: te,
			peakPlayCount: A.peakPlayCount,
			displayedPlayCount: A.displayPlays.length,
			handPresenting: M,
			handPresentationPhase: j.phase,
			dealPresentationActive: Au(),
			trickCollectionActive: Mu()
		});
	}, [
		A.isPipelineActive,
		A.phase,
		A.revealedCount,
		A.revealTarget,
		A.peakPlayCount,
		A.displayPlays.length,
		te,
		M,
		j.phase,
		e.phase,
		ne
	]);
	let P = Xa(e.phase), re = (0, l.useMemo)(() => Ed({
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
	]), F = (0, l.useMemo)(() => rm({
		rawHeroCards: p,
		effectiveHeroCards: f,
		playerId: d,
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
		p,
		f,
		d,
		e.trumpHolderId,
		e.dealerId,
		e.trumpUpcard,
		e.trumpSuit,
		e.phase,
		j.trumpRevealActive,
		j.trumpMergeActive,
		j.trumpMergedIntoHand
	]), I = F.displayCards, L = (0, l.useMemo)(() => !h?.length || F.indexMode === "effective" ? h : tm(h, F.trumpDisabledIndex), [
		h,
		F.indexMode,
		F.trumpDisabledIndex
	]), R = (0, l.useMemo)(() => {
		if (!h?.length || !f.length) return null;
		let t = Go(f.map(Ga), {
			trumpSuit: e.trumpSuit ?? "clubs",
			currentTrick: e.currentTrick ?? null,
			leadSuit: e.leadSuit ?? null,
			cinchEnabled: e.cinchEnabled === !0
		}, h);
		return t == null ? null : F.indexMode === "effective" ? t : tm([t], F.trumpDisabledIndex)[0] ?? null;
	}, [
		h,
		f,
		e.trumpSuit,
		e.currentTrick,
		e.leadSuit,
		e.cinchEnabled,
		F.indexMode,
		F.trumpDisabledIndex
	]), z = (0, l.useMemo)(() => {
		if (e.phase !== "draw" || !f.length) return [];
		let t = f.map(Ga), n = F.indexMode === "display" && F.trumpDisabledIndex != null ? nm([F.trumpDisabledIndex], F.trumpDisabledIndex) : F.trumpDisabledIndex == null ? [] : [F.trumpDisabledIndex], r = Ko(t, e.trumpSuit ?? "clubs", e.maxDrawDiscards ?? 4, e.remainingDeckCount ?? Infinity, n);
		return F.indexMode === "effective" ? r : tm(r, F.trumpDisabledIndex);
	}, [
		e.phase,
		f,
		e.trumpSuit,
		e.maxDrawDiscards,
		e.remainingDeckCount,
		F.indexMode,
		F.trumpDisabledIndex
	]), ie = A.suppressTurnPlayerId || j.suppressTurnIndicator, ae = Ka(e.phase, u), B = ie ? null : $a(e.turnPlayerId, t), V = t.find((e) => e.isSelf), oe = d != null && e.participantIds.includes(d) && (e.phase === "draw" || e.phase === "play"), H = s && !e.isFinal && !oe && !a && V?.isOut === !0 && !!b.onRebuy, se = !!(d && e.turnPlayerId === d) && !ie, ce = pp({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: V,
		session: e,
		suppressTurn: !!ie,
		handComplete: v
	}), le = ce && !v && (u || e.phase === "decision") ? qa(e.phase, u) : null, ue = !le && !ie && !(B && P && A.phase === "live") ? Ja({
		phase: e.phase,
		enrollmentActive: u,
		isMyTurn: se,
		handComplete: v,
		cardsDealt: P
	}) : null, de = mp({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: V,
		session: e,
		suppressTurn: !!ie,
		handComplete: v
	}), [fe, pe] = (0, l.useState)(!1);
	(0, l.useEffect)(() => {
		pe(!1);
	}, [de]);
	let me = (0, l.useCallback)(() => {
		pe(!0);
	}, []), he = ce && !v && !fe && (e.phase === "draw" || e.phase === "play"), { countdown: ge } = ep({
		session: e,
		suppressTurn: !!ie,
		handComplete: v
	}), _e = re.showTrumpSuitReminder || !e.trumpUpcard && !!e.trumpSuit && e.phase === "play", ve = (0, l.useMemo)(() => ({ ...A.displayTricksByPlayer }), [A.displayTricksByPlayer]), ye = (0, l.useMemo)(() => Object.fromEntries(t.map((e) => [e.playerId, Math.max(0, Number(e.bankroll) || 0)])), [t]), be = tp({
		turnPlayerId: e.turnPlayerId ?? null,
		dealerId: e.dealerId,
		potAmount: j.displayPotAmount,
		tricksByPlayer: ve,
		bankrollByPlayer: ye,
		bourrePlayerIds: _ ?? [],
		phase: e.phase ?? null,
		showTrumpSuitReminder: _e,
		suppressTurn: !!ie,
		actionFeedbackStatus: y?.status ?? "idle",
		trickWinnerSeatId: A.trickWinnerSeatId,
		trickPhase: A.phase
	}), xe = !!V?.playerId && (_ ?? []).includes(V.playerId) && be.bourreAlerts[V.playerId] === "pulse", Se = (0, l.useRef)(0), Ce = (0, l.useRef)(0);
	(0, l.useEffect)(() => {
		be.feedbackErrorPulse > Se.current && xc(), Se.current = be.feedbackErrorPulse;
	}, [be.feedbackErrorPulse]), (0, l.useEffect)(() => {
		be.feedbackSuccessPulse > Ce.current && Sc(), Ce.current = be.feedbackSuccessPulse;
	}, [be.feedbackSuccessPulse]);
	let we = (0, l.useCallback)((e) => {
		O(e, d ?? void 0);
	}, [O, d]), Te = (0, l.useMemo)(() => ({
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
			let t = F.indexMode === "display" ? nm(e, F.trumpDisabledIndex) : e;
			return b.onSubmitDraw(t);
		},
		onPassDraw: b.onPassDraw,
		onFoldDraw: b.onFoldDraw,
		onPlayCard: (e) => {
			if (!b.onPlayCard) return;
			if (F.indexMode !== "display") return b.onPlayCard(e);
			let t = nm([e], F.trumpDisabledIndex)[0];
			if (t != null) return b.onPlayCard(t);
		},
		onReaction: we,
		onHeroUserActivity: me
	}), [
		b,
		we,
		t,
		F.indexMode,
		F.trumpDisabledIndex,
		me
	]), Ee = {
		session: e,
		players: t,
		potMetrics: n,
		participantCount: T,
		enrollmentActive: u,
		heroCards: I,
		revealedTrumpIndex: F.revealedTrumpIndex,
		trumpMergeActive: F.trumpMergeActive,
		trumpDisabledIndex: F.trumpDisabledIndex,
		hideCenterTrump: re.hideCenterTrump,
		showTrumpSuitReminder: _e,
		trumpHolderPresentation: re,
		privateHandReady: m,
		currentUserId: d,
		legalPlayIndices: L,
		recommendedPlayIndex: R,
		recommendedDiscardIndices: z,
		handComplete: v,
		actionFeedback: y,
		trickPresentation: A,
		handPresentation: j,
		microinteractions: be,
		instantTrickPlays: te,
		turnCountdown: ge,
		...Te
	}, De = /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
		/* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-session__attention-layer",
			"aria-live": "polite",
			children: /* @__PURE__ */ (0, g.jsx)(sp, {
				actionRequired: ce,
				activityKey: de
			})
		}),
		/* @__PURE__ */ (0, g.jsx)(np, {
			active: xe,
			displayName: V?.displayName
		}),
		/* @__PURE__ */ (0, g.jsx)(Hd, {
			events: E,
			onDismiss: D
		}),
		/* @__PURE__ */ (0, g.jsx)(zd, {
			events: E,
			onDismiss: D
		}),
		S ? /* @__PURE__ */ (0, g.jsx)(Ld, { ...Ee }) : /* @__PURE__ */ (0, g.jsx)(kd, { ...Ee })
	] }), Oe = (0, l.useRef)(!1);
	return (0, l.useEffect)(() => {
		Oe.current = !1;
	}, [e.handNumber, e.sessionId]), (0, l.useEffect)(() => {
		if (e.phase !== "reveal" || !j.trumpMergedIntoHand || j.phase !== "drawPlayer" || Oe.current || !b.onAdvanceReveal) return;
		let t = b.onAdvanceReveal();
		Promise.resolve(t).then(() => {
			Oe.current = !0;
		}, () => {
			Oe.current = !1;
		});
	}, [
		e.phase,
		e.handNumber,
		e.sessionId,
		j.trumpMergedIntoHand,
		j.phase,
		b
	]), (0, l.useEffect)(() => {
		let e = (e) => {
			(e.key === x.hotkeys.toggleSettings || e.key === "," && e.metaKey) && w((e) => !e), e.key === x.hotkeys.focusTable && document.querySelector(".btable-wrap")?.scrollIntoView({
				block: "center",
				behavior: "smooth"
			});
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [x.hotkeys]), /* @__PURE__ */ (0, g.jsxs)("div", {
		className: [
			"btable-session",
			S ? "btable-session--native-mobile btable-session--mobile-layout" : "",
			C ? "btable-session--settings-open" : "",
			Qa(e.phase) ? "btable-session--reveal-phase" : "",
			Za(e.phase) ? "btable-session--decision-phase" : ""
		].filter(Boolean).join(" "),
		"data-trick-resolving": A.isPipelineActive ? "true" : "false",
		"data-hand-settling": j.settleAnimActive ? "true" : "false",
		"data-hand-complete": v ? "true" : "false",
		children: [
			y && y.status !== "idle" && /* @__PURE__ */ (0, g.jsx)("div", {
				className: [
					`btable-session__feedback btable-session__feedback--${y.status}`,
					y.status === "error" ? "btable-session__feedback--pulse-error" : "",
					y.status === "success" ? "btable-session__feedback--pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "feedback-banner",
				role: y.status === "error" ? "alert" : "status",
				"aria-live": "polite",
				children: y.message
			}, y.status === "error" ? `feedback-error-${be.feedbackErrorPulse}` : y.status === "success" ? `feedback-success-${be.feedbackSuccessPulse}` : `feedback-${y.status}`),
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
								"data-testid": "phase-tag",
								"data-phase": e.phase ?? "waiting",
								children: ae
							}),
							/* @__PURE__ */ (0, g.jsx)("button", {
								type: "button",
								className: "btable-session__gear btn btn--sm",
								"data-testid": "settings-button",
								onClick: () => w(!0),
								"aria-label": "Table appearance settings",
								title: `Settings (${x.hotkeys.toggleSettings})`,
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
					B && P && A.phase === "live" && /* @__PURE__ */ (0, g.jsx)("p", {
						className: ["btable-session__turn", se ? "btable-session__turn--yours" : "btable-session__turn--waiting"].join(" "),
						"aria-live": "polite",
						"data-testid": "turn-indicator",
						children: B
					}),
					le && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__action-cue",
						"data-testid": "action-cue",
						"aria-live": "polite",
						children: le
					}),
					/* @__PURE__ */ (0, g.jsx)(fp, {
						actionRequired: he,
						activityKey: de,
						phase: e.phase,
						hasUserInteracted: fe
					}),
					ue && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__hint btable-session__hint--waiting",
						"data-testid": "waiting-cue",
						children: ue
					}),
					Qa(e.phase) && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__hint muted small",
						"aria-live": "polite",
						children: "Cards dealt — trump revealed. Review your hand…"
					}),
					u && !Qa(e.phase) && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__enroll muted small",
						children: "Tap I'm in or Pass at your seat — clockwise from dealer"
					})
				]
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
			S ? /* @__PURE__ */ (0, g.jsx)(Vd, { children: /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-stage",
				children: De
			}) }) : /* @__PURE__ */ (0, g.jsx)(Bd, { children: /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-stage",
				children: De
			}) }),
			/* @__PURE__ */ (0, g.jsx)(Wd, {
				open: C,
				onClose: () => w(!1)
			}),
			a && !e.isFinal && o && /* @__PURE__ */ (0, g.jsx)(em, {
				session: e,
				players: t,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: k,
				onAgreeSplit: () => b.onSettle("split"),
				onDeclineSplit: () => b.onSettle("push"),
				onCarryover: () => b.onSettleCarryover?.()
			}),
			a && !e.isFinal && !o && /* @__PURE__ */ (0, g.jsx)(Zp, {
				session: e,
				players: t,
				potMetrics: n,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: k,
				onSettle: (e) => b.onSettle(e)
			}),
			/* @__PURE__ */ (0, g.jsxs)("footer", {
				className: "btable-session__foot muted small",
				children: [
					/* @__PURE__ */ (0, g.jsx)(Ud, { compact: !0 }),
					H && /* @__PURE__ */ (0, g.jsxs)("div", {
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
					r == null ? /* @__PURE__ */ (0, g.jsx)(g.Fragment, { children: "Shared pot and game state only · sign in to track your ledger" }) : /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: ["Your session profit/loss ", il(r)] })
				]
			})
		]
	});
}
//#endregion
//#region src/table/mount.tsx
var cm = null, lm = null;
function um(e, t) {
	mc(), ia(e), lm !== e && (cm?.unmount(), cm = (0, u.createRoot)(e), lm = e), cm.render(/* @__PURE__ */ (0, g.jsx)(Lc, { children: /* @__PURE__ */ (0, g.jsx)(sm, { ...t }) }));
}
function dm() {
	lm && (hd(lm), Wu(lm)), cm?.unmount(), cm = null, lm = null, Hp(), Pu();
}
//#endregion
export { Wu as clearDrawFlyGhosts, hd as clearWonTrickCollectionArtifacts, zp as evaluateBotPresentationGate, Rp as forceReleasePresentationForBots, is as getFeedbackPrefs, Fp as getTablePresentationBlockReason, Up as getTrickAnimationBusyState, Lp as handPresentingBlocksBots, mc as initGameFeedback, Gp as isTablePresentationBusy, Bp as isTablePresentationBusyForBots, Wp as isTrickAnimationBusy, um as mountTableSession, vc as playBigWinFeedback, yc as playBourreFeedback, gc as playDrawFeedback, bc as playGameStartFeedback, hc as playShuffleFeedback, _c as playTrickWinFeedback, as as saveFeedbackPrefs, cs as subscribeFeedbackPrefs, Kp as subscribeTrickAnimationBusy, dm as unmountTableSession };
