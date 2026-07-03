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
	function ee(e, r, i, a, o) {
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
				case d: return c = e._init, ee(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + j(e, 0) : a, S(o) ? (i = "", c != null && (i = c.replace(A, "$&/") + "/"), ee(o, r, i, "", function(e) {
			return e;
		})) : o != null && (O(o) && (o = D(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(A, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (S(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + j(a, u), c += ee(a, r, i, s, o);
		else if (u = m(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + j(a, u++), c += ee(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ee(M(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function te(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ee(e, r, "", "", function(e) {
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
		map: te,
		forEach: function(e, t, n) {
			te(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return te(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return te(e, function(e) {
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
	var h = Object.assign, g = Symbol.for("react.element"), _ = Symbol.for("react.transitional.element"), v = Symbol.for("react.portal"), y = Symbol.for("react.fragment"), b = Symbol.for("react.strict_mode"), x = Symbol.for("react.profiler"), S = Symbol.for("react.consumer"), C = Symbol.for("react.context"), w = Symbol.for("react.forward_ref"), T = Symbol.for("react.suspense"), E = Symbol.for("react.suspense_list"), D = Symbol.for("react.memo"), O = Symbol.for("react.lazy"), k = Symbol.for("react.activity"), A = Symbol.for("react.memo_cache_sentinel"), j = Symbol.iterator;
	function M(e) {
		return typeof e != "object" || !e ? null : (e = j && e[j] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var ee = Symbol.for("react.client.reference");
	function te(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === ee ? null : e.displayName || e.name || null;
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
			case D: return t = e.displayName || null, t === null ? te(e.type) || "Memo" : t;
			case O:
				t = e._payload, e = e._init;
				try {
					return te(e(t));
				} catch {}
		}
		return null;
	}
	var ne = Array.isArray, N = r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, P = a.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, re = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, ie = [], F = -1;
	function I(e) {
		return { current: e };
	}
	function L(e) {
		0 > F || (e.current = ie[F], ie[F] = null, F--);
	}
	function R(e, t) {
		F++, ie[F] = e.current, e.current = t;
	}
	var z = I(null), B = I(null), ae = I(null), V = I(null);
	function oe(e, t) {
		switch (R(ae, t), R(B, e), R(z, null), t.nodeType) {
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
		L(z), R(z, e);
	}
	function se() {
		L(z), L(B), L(ae);
	}
	function H(e) {
		e.memoizedState !== null && R(V, e);
		var t = z.current, n = Ud(t, e.type);
		t !== n && (R(B, e), R(z, n));
	}
	function ce(e) {
		B.current === e && (L(z), L(B)), V.current === e && (L(V), Qf._currentValue = re);
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
	var ge = Object.prototype.hasOwnProperty, _e = t.unstable_scheduleCallback, ve = t.unstable_cancelCallback, ye = t.unstable_shouldYield, be = t.unstable_requestPaint, xe = t.unstable_now, Se = t.unstable_getCurrentPriorityLevel, Ce = t.unstable_ImmediatePriority, we = t.unstable_UserBlockingPriority, Te = t.unstable_NormalPriority, Ee = t.unstable_LowPriority, De = t.unstable_IdlePriority, Oe = t.log, ke = t.unstable_setDisableYieldValue, Ae = null, U = null;
	function je(e) {
		if (typeof Oe == "function" && ke(e), U && typeof U.setStrictMode == "function") try {
			U.setStrictMode(Ae, e);
		} catch {}
	}
	var Me = Math.clz32 ? Math.clz32 : Fe, Ne = Math.log, Pe = Math.LN2;
	function Fe(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Ne(e) / Pe | 0) | 0;
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
			var u = 31 - Me(n), d = 1 << u;
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
		var r = 31 - Me(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function Je(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Me(n), i = 1 << r;
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
			if (en = !1, (Zt !== null || Qt !== null) && (bu(), Zt && (t = Zt, e = Qt, Qt = Zt = null, $t(t), e))) for (t = 0; t < e.length; t++) $t(e[t]);
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
	}, jn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function W(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = jn[e]) ? !!t[e] : !1;
	}
	function Mn() {
		return W;
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
		Zt ? Qt ? Qt.push(r) : Qt = [r] : Zt = r, t = Dd(t, "onChange"), 0 < t.length && (n = new gn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var er = null, tr = null;
	function nr(e) {
		bd(e, 0);
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
		}), Er && _r(Er, r) || (Er = r, r = Dd(Tr, "onSelect"), 0 < r.length && (t = new gn("onSelect", "select", null, t, n), e.push({
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
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - Me(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function $r(e) {
		if (50 < du) throw du = 0, fu = null, Error(s(185));
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
		else if (typeof e == "string") o = Uf(e, n, z.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
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
		var i = 32 - Me(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Me(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, bi = 1 << 32 - Me(t) + i | n << i | r, xi = a + e;
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
				Z("cancel", t), Z("close", t);
				break;
			case "iframe":
			case "object":
			case "embed":
				Z("load", t);
				break;
			case "video":
			case "audio":
				for (n = 0; n < vd.length; n++) Z(vd[n], t);
				break;
			case "source":
				Z("error", t);
				break;
			case "img":
			case "image":
			case "link":
				Z("error", t), Z("load", t);
				break;
			case "details":
				Z("toggle", t);
				break;
			case "input":
				Z("invalid", t), Ft(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Z("invalid", t);
				break;
			case "textarea": Z("invalid", t), zt(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || Nd(t.textContent, n) ? (r.popover != null && (Z("beforetoggle", t), Z("toggle", t)), r.onScroll != null && Z("scroll", t), r.onScrollEnd != null && Z("scrollend", t), r.onClick != null && (t.onclick = Jt), t = !0) : t = !1, t || Mi(e, !0);
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
		return e !== null && (Zl === null ? Zl = e : Zl.push.apply(Zl, e), ki = null), e;
	}
	function Ri(e) {
		ki === null ? ki = [e] : ki.push(e);
	}
	var zi = I(null), Bi = null, Vi = null;
	function Hi(e, t, n) {
		R(zi, t._currentValue), t._currentValue = n;
	}
	function Ui(e) {
		e._currentValue = zi.current, L(zi);
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
	}, $i = t.unstable_scheduleCallback, ea = t.unstable_NormalPriority, K = {
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
		e.refCount--, e.refCount === 0 && $i(ea, function() {
			e.controller.abort();
		});
	}
	var ra = null, ia = 0, aa = 0, oa = null;
	function sa(e, t) {
		if (ra === null) {
			var n = ra = [];
			ia = 0, aa = fd(), oa = {
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
		eu = xe(), typeof t == "object" && t && typeof t.then == "function" && sa(e, t), ua !== null && ua(e, t);
	};
	var da = I(null);
	function fa() {
		var e = da.current;
		return e === null ? Ll.pooledCache : e;
	}
	function pa(e, t) {
		t === null ? R(da, da.current) : R(da, t.pool);
	}
	function ma() {
		var e = fa();
		return e === null ? null : {
			parent: K._currentValue,
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
					if (e = Ll, e !== null && 100 < e.shellSuspendCounter) throw Error(s(482));
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
				if (ne(t) || M(t)) return t = si(t, e.mode, n, null), t.return = e, t;
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
				if (ne(n) || M(n)) return i === null ? d(e, t, n, r, null) : null;
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
				if (ne(r) || M(r)) return e = e.get(n) || null, d(t, e, r, i, null);
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
				if (M(a)) {
					if (l = M(a), typeof l != "function") throw Error(s(150));
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
		if (r = r.shared, Il & 2) {
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
				if (p ? (X & f) === f : (r & f) === f) {
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
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), Gl |= o, e.lanes = o, e.memoizedState = d;
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
	var Ga = I(null), Ka = I(0);
	function qa(e, t) {
		e = Ul, R(Ka, e), R(Ga, t), Ul = e | t.baseLanes;
	}
	function Ja() {
		R(Ka, Ul), R(Ga, Ga.current);
	}
	function Ya() {
		Ul = Ka.current, L(Ga), L(Ka);
	}
	var Xa = I(null), Za = null;
	function Qa(e) {
		var t = e.alternate;
		R(ro, ro.current & 1), R(Xa, e), Za === null && (t === null || Ga.current !== null || t.memoizedState !== null) && (Za = e);
	}
	function $a(e) {
		R(ro, ro.current), R(Xa, e), Za === null && (Za = e);
	}
	function eo(e) {
		e.tag === 22 ? (R(ro, ro.current), R(Xa, e), Za === null && (Za = e)) : to(e);
	}
	function to() {
		R(ro, ro.current), R(Xa, Xa.current);
	}
	function no(e) {
		L(Xa), Za === e && (Za = null), L(ro);
	}
	var ro = I(0);
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
		return ao = a, q = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, N.H = e === null || e.memoizedState === null ? Fs : Is, uo = !1, a = n(r, i), uo = !1, lo && (a = bo(t, n, r, i)), yo(e), a;
	}
	function yo(e) {
		N.H = Ps;
		var t = oo !== null && oo.next !== null;
		if (ao = 0, so = oo = q = null, co = !1, po = 0, mo = null, t) throw Error(s(300));
		e === null || $s || (e = e.dependencies, e !== null && qi(e) && ($s = !0));
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
			N.H = Ls, a = t(n, r);
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
		return po += 1, mo === null && (mo = []), e = ba(mo, e, t), t = q, (so === null ? t.memoizedState : so.next) === null && (t = t.alternate, N.H = t === null || t.memoizedState === null ? Fs : Is), e;
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
				if (f === u.lane ? (ao & f) === f : (X & f) === f) {
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
					}, l === null ? (c = l = f, o = a) : l = l.next = f, q.lanes |= p, Gl |= p;
					f = u.action, uo && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, o = a) : l = l.next = p, q.lanes |= f, Gl |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? o = a : l.next = c, !gr(a, e.memoizedState) && ($s = !0, d && (n = oa, n !== null))) throw n;
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
			gr(a, t.memoizedState) || ($s = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
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
		if (o && (i.memoizedState = n, $s = !0), i = i.queue, os(Ro.bind(null, r, i, e), [e]), i.getSnapshot !== t || o || so !== null && so.memoizedState.tag & 1) {
			if (r.flags |= 2048, ts(9, { destroy: void 0 }, Lo.bind(null, r, i, n, t), null), Ll === null) throw Error(s(349));
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
		t !== null && hu(t, e, 2);
	}
	function Vo(e) {
		var t = To();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), uo) {
				je(!0);
				try {
					n();
				} finally {
					je(!1);
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
		if (js(e)) throw Error(s(485));
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
			var n = Ll.formState;
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
		}, n.queue = r, n = Os.bind(null, q, r), r.dispatch = n, r = Vo(!1), a = As.bind(null, q, !1, r.queue), r = To(), i = {
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
			if (Il & 2) throw Error(s(440));
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
	function ps() {}
	function ms(e, t) {
		var n = Eo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && _o(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function hs(e, t) {
		var n = Eo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && _o(t, r[1])) return r[0];
		if (r = e(), uo) {
			je(!0);
			try {
				e();
			} finally {
				je(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function gs(e, t, n) {
		return n === void 0 || ao & 1073741824 && !(X & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = mu(), q.lanes |= e, Gl |= e, n);
	}
	function _s(e, t, n, r) {
		return gr(n, t) ? n : Ga.current === null ? !(ao & 42) || ao & 1073741824 && !(X & 261930) ? ($s = !0, e.memoizedState = n) : (e = mu(), q.lanes |= e, Gl |= e, t) : (e = gs(e, n, r), gr(e, t) || ($s = !0), e);
	}
	function vs(e, t, n, r, i) {
		var a = P.p;
		P.p = a !== 0 && 8 > a ? a : 8;
		var o = N.T, s = {};
		N.T = s, As(e, !1, t, n);
		try {
			var c = i(), l = N.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? ks(e, t, la(c, r), pu(e)) : ks(e, t, r, pu(e));
		} catch (n) {
			ks(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, pu());
		} finally {
			P.p = a, o !== null && s.types !== null && (o.types = s.types), N.T = o;
		}
	}
	function ys() {}
	function bs(e, t, n, r) {
		if (e.tag !== 5) throw Error(s(476));
		var i = xs(e).queue;
		vs(e, i, t, re, n === null ? ys : function() {
			return Ss(e), n(r);
		});
	}
	function xs(e) {
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
	function Ss(e) {
		var t = xs(e);
		t.next === null && (t = e.alternate.memoizedState), ks(e, t.next.queue, {}, pu());
	}
	function Cs() {
		return Yi(Qf);
	}
	function ws() {
		return Eo().memoizedState;
	}
	function Ts() {
		return Eo().memoizedState;
	}
	function Es(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = pu();
					e = Ia(n);
					var r = La(t, e, n);
					r !== null && (hu(r, t, n), Ra(r, t, n)), t = { cache: ta() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function Ds(e, t, n) {
		var r = pu();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, js(e) ? Ms(t, n) : (n = Xr(e, t, n, r), n !== null && (hu(n, e, r), Ns(n, t, r)));
	}
	function Os(e, t, n) {
		ks(e, t, n, pu());
	}
	function ks(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (js(e)) Ms(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, gr(s, o)) return Yr(e, t, i, 0), Ll === null && Jr(), !1;
			} catch {}
			if (n = Xr(e, t, i, r), n !== null) return hu(n, e, r), Ns(n, t, r), !0;
		}
		return !1;
	}
	function As(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: fd(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, js(e)) {
			if (t) throw Error(s(479));
		} else t = Xr(e, n, r, 2), t !== null && hu(t, e, 2);
	}
	function js(e) {
		var t = e.alternate;
		return e === q || t !== null && t === q;
	}
	function Ms(e, t) {
		lo = co = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function Ns(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Je(e, n);
		}
	}
	var Ps = {
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
	Ps.useEffectEvent = go;
	var Fs = {
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
				je(!0);
				try {
					e();
				} finally {
					je(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = To();
			if (n !== void 0) {
				var i = n(t);
				if (uo) {
					je(!0);
					try {
						n(t);
					} finally {
						je(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = Ds.bind(null, q, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = To();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = Vo(e);
			var t = e.queue, n = Os.bind(null, q, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: ps,
		useDeferredValue: function(e, t) {
			return gs(To(), e, t);
		},
		useTransition: function() {
			var e = Vo(!1);
			return e = vs.bind(null, q, e.queue, !0, !1), To().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = q, i = To();
			if (G) {
				if (n === void 0) throw Error(s(407));
				n = n();
			} else {
				if (n = t(), Ll === null) throw Error(s(349));
				X & 127 || Io(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, as(Ro.bind(null, r, a, e), [e]), r.flags |= 2048, ts(9, { destroy: void 0 }, Lo.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = To(), t = Ll.identifierPrefix;
			if (G) {
				var n = xi, r = bi;
				n = (r & ~(1 << 32 - Me(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = fo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = ho++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: Cs,
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
			return t.queue = n, t = As.bind(null, q, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: Ao,
		useCacheRefresh: function() {
			return To().memoizedState = Es.bind(null, q);
		},
		useEffectEvent: function(e) {
			var t = To(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (Il & 2) throw Error(s(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, Is = {
		readContext: Yi,
		use: ko,
		useCallback: ms,
		useContext: Yi,
		useEffect: os,
		useImperativeHandle: fs,
		useInsertionEffect: ls,
		useLayoutEffect: us,
		useMemo: hs,
		useReducer: Mo,
		useRef: ns,
		useState: function() {
			return Mo(jo);
		},
		useDebugValue: ps,
		useDeferredValue: function(e, t) {
			return _s(Eo(), oo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Mo(jo)[0], t = Eo().memoizedState;
			return [typeof e == "boolean" ? e : Oo(e), t];
		},
		useSyncExternalStore: Fo,
		useId: ws,
		useHostTransitionStatus: Cs,
		useFormState: Zo,
		useActionState: Zo,
		useOptimistic: function(e, t) {
			return Ho(Eo(), oo, e, t);
		},
		useMemoCache: Ao,
		useCacheRefresh: Ts
	};
	Is.useEffectEvent = cs;
	var Ls = {
		readContext: Yi,
		use: ko,
		useCallback: ms,
		useContext: Yi,
		useEffect: os,
		useImperativeHandle: fs,
		useInsertionEffect: ls,
		useLayoutEffect: us,
		useMemo: hs,
		useReducer: Po,
		useRef: ns,
		useState: function() {
			return Po(jo);
		},
		useDebugValue: ps,
		useDeferredValue: function(e, t) {
			var n = Eo();
			return oo === null ? gs(n, e, t) : _s(n, oo.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Po(jo)[0], t = Eo().memoizedState;
			return [typeof e == "boolean" ? e : Oo(e), t];
		},
		useSyncExternalStore: Fo,
		useId: ws,
		useHostTransitionStatus: Cs,
		useFormState: es,
		useActionState: es,
		useOptimistic: function(e, t) {
			var n = Eo();
			return oo === null ? (n.baseState = e, [e, n.queue.dispatch]) : Ho(n, oo, e, t);
		},
		useMemoCache: Ao,
		useCacheRefresh: Ts
	};
	Ls.useEffectEvent = cs;
	function Rs(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : h({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var zs = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = pu(), i = Ia(r);
			i.payload = t, n != null && (i.callback = n), t = La(e, i, r), t !== null && (hu(t, e, r), Ra(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = pu(), i = Ia(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = La(e, i, r), t !== null && (hu(t, e, r), Ra(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = pu(), r = Ia(n);
			r.tag = 2, t != null && (r.callback = t), t = La(e, r, n), t !== null && (hu(t, e, n), Ra(t, e, n));
		}
	};
	function Bs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !_r(n, r) || !_r(i, a) : !0;
	}
	function Vs(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && zs.enqueueReplaceState(t, t.state, null);
	}
	function Hs(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = h({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Us(e) {
		Wr(e);
	}
	function Ws(e) {
		console.error(e);
	}
	function Gs(e) {
		Wr(e);
	}
	function Ks(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function qs(e, t, n) {
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
	function Js(e, t, n) {
		return n = Ia(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Ks(e, t);
		}, n;
	}
	function Ys(e) {
		return e = Ia(e), e.tag = 3, e;
	}
	function Xs(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				qs(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			qs(t, n, r), typeof i != "function" && (ru === null ? ru = new Set([this]) : ru.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Zs(e, t, n, r, i) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Ki(t, n, i, !0), n = Xa.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return Za === null ? Du() : n.alternate === null && Wl === 0 && (Wl = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === va ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = new Set([r]) : t.add(r), Ku(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === va ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = new Set([r]) : n.add(r)), Ku(e, r, i)), !1;
				}
				throw Error(s(435, n.tag));
			}
			return Ku(e, r, i), Du(), !1;
		}
		if (G) return t = Xa.current, t === null ? (r !== ji && (t = Error(s(423), { cause: r }), Ri(fi(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = fi(r, n), i = Js(e.stateNode, r, i), za(e, i), Wl !== 4 && (Wl = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== ji && (e = Error(s(422), { cause: r }), Ri(fi(e, n)))), !1;
		var a = Error(s(520), { cause: r });
		if (a = fi(a, n), Xl === null ? Xl = [a] : Xl.push(a), Wl !== 4 && (Wl = 2), t === null) return !0;
		r = fi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = Js(n.stateNode, r, e), za(n, e), !1;
				case 1: if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (ru === null || !ru.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = Ys(i), Xs(i, e, n, r), za(n, i), !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Qs = Error(s(461)), $s = !1;
	function ec(e, t, n, r) {
		t.child = e === null ? Ma(t, null, n, r) : ja(t, e.child, n, r);
	}
	function tc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Ji(t), r = vo(e, t, n, o, a, i), s = So(), e !== null && !$s ? (Co(e, t, i), Tc(e, t, i)) : (G && s && wi(t), t.flags |= 1, ec(e, t, r, i), t.child);
	}
	function nc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ri(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, rc(e, t, a, r, i)) : (e = oi(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !Ec(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? _r : n, n(o, r) && e.ref === t.ref) return Tc(e, t, i);
		}
		return t.flags |= 1, e = ii(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function rc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (_r(a, r) && e.ref === t.ref) if ($s = !1, t.pendingProps = r = a, Ec(e, i)) e.flags & 131072 && ($s = !0);
			else return t.lanes = e.lanes, Tc(e, t, i);
		}
		return dc(e, t, n, r, i);
	}
	function ic(e, t, n, r) {
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
				return oc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && pa(t, a === null ? null : a.cachePool), a === null ? Ja() : qa(t, a), eo(t);
			else return r = t.lanes = 536870912, oc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && pa(t, null), Ja(), to(t)) : (pa(t, a.cachePool), qa(t, a), to(t), t.memoizedState = null);
		return ec(e, t, i, n), t.child;
	}
	function ac(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function oc(e, t, n, r, i) {
		var a = fa();
		return a = a === null ? null : {
			parent: K._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && pa(t, null), Ja(), eo(t), e !== null && Ki(e, t, r, !0), t.childLanes = i, null;
	}
	function sc(e, t) {
		return t = bc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function cc(e, t, n) {
		return ja(t, e.child, null, n), e = sc(t, t.pendingProps), e.flags |= 2, no(t), t.memoizedState = null, e;
	}
	function lc(e, t, n) {
		var r = t.pendingProps, i = (t.flags & 128) != 0;
		if (t.flags &= -129, e === null) {
			if (G) {
				if (r.mode === "hidden") return e = sc(t, r), t.lanes = 536870912, ac(null, e);
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
			return sc(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var o = a.dehydrated;
			if ($a(t), i) if (t.flags & 256) t.flags &= -257, t = cc(e, t, n);
			else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
			else throw Error(s(558));
			else if ($s || Ki(e, t, n, !1), i = (n & e.childLanes) !== 0, $s || i) {
				if (r = Ll, r !== null && (o = Ye(r, n), o !== 0 && o !== a.retryLane)) throw a.retryLane = o, Zr(e, o), hu(r, e, o), Qs;
				Du(), t = cc(e, t, n);
			} else e = a.treeContext, Oi = lf(o.nextSibling), Di = t, G = !0, ki = null, Ai = !1, e !== null && Ei(t, e), t = sc(t, r), t.flags |= 4096;
			return t;
		}
		return e = ii(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function uc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(s(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function dc(e, t, n, r, i) {
		return Ji(t), n = vo(e, t, n, r, void 0, i), r = So(), e !== null && !$s ? (Co(e, t, i), Tc(e, t, i)) : (G && r && wi(t), t.flags |= 1, ec(e, t, n, i), t.child);
	}
	function fc(e, t, n, r, i, a) {
		return Ji(t), t.updateQueue = null, n = bo(t, r, n, i), yo(e), r = So(), e !== null && !$s ? (Co(e, t, a), Tc(e, t, a)) : (G && r && wi(t), t.flags |= 1, ec(e, t, n, a), t.child);
	}
	function pc(e, t, n, r, i) {
		if (Ji(t), t.stateNode === null) {
			var a = ei, o = n.contextType;
			typeof o == "object" && o && (a = Yi(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = zs, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Pa(t), o = n.contextType, a.context = typeof o == "object" && o ? Yi(o) : ei, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Rs(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && zs.enqueueReplaceState(a, a.state, null), Ha(t, r, a, i), Va(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Hs(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = ei, typeof u == "object" && u && (o = Yi(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && Vs(t, a, r, o), Na = !1;
			var f = t.memoizedState;
			a.state = f, Ha(t, r, a, i), Va(), l = t.memoizedState, s || f !== l || Na ? (typeof d == "function" && (Rs(t, n, d, r), l = t.memoizedState), (c = Na || Bs(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Fa(e, t), o = t.memoizedProps, u = Hs(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = ei, typeof l == "object" && l && (c = Yi(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && Vs(t, a, r, c), Na = !1, f = t.memoizedState, a.state = f, Ha(t, r, a, i), Va();
			var p = t.memoizedState;
			o !== d || f !== p || Na || e !== null && e.dependencies !== null && qi(e.dependencies) ? (typeof s == "function" && (Rs(t, n, s, r), p = t.memoizedState), (u = Na || Bs(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && qi(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, uc(e, t), r = (t.flags & 128) != 0, a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = ja(t, e.child, null, i), t.child = ja(t, null, n, i)) : ec(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = Tc(e, t, i), e;
	}
	function mc(e, t, n, r) {
		return Ii(), t.flags |= 256, ec(e, t, n, r), t.child;
	}
	var hc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function gc(e) {
		return {
			baseLanes: e,
			cachePool: ma()
		};
	}
	function _c(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= Jl), e;
	}
	function vc(e, t, n) {
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
			return r = r.fallback, i ? (to(t), i = t.mode, c = bc({
				mode: "hidden",
				children: c
			}, i), r = si(r, i, n, null), c.return = t, r.return = t, c.sibling = r, t.child = c, r = t.child, r.memoizedState = gc(n), r.childLanes = _c(e, o, n), t.memoizedState = hc, ac(null, r)) : (Qa(t), yc(t, c));
		}
		var l = e.memoizedState;
		if (l !== null && (c = l.dehydrated, c !== null)) {
			if (a) t.flags & 256 ? (Qa(t), t.flags &= -257, t = xc(e, t, n)) : t.memoizedState === null ? (to(t), c = r.fallback, i = t.mode, r = bc({
				mode: "visible",
				children: r.children
			}, i), c = si(c, i, n, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, ja(t, e.child, null, n), r = t.child, r.memoizedState = gc(n), r.childLanes = _c(e, o, n), t.memoizedState = hc, t = ac(null, r)) : (to(t), t.child = e.child, t.flags |= 128, t = null);
			else if (Qa(t), sf(c)) {
				if (o = c.nextSibling && c.nextSibling.dataset, o) var u = o.dgst;
				o = u, r = Error(s(419)), r.stack = "", r.digest = o, Ri({
					value: r,
					source: null,
					stack: null
				}), t = xc(e, t, n);
			} else if ($s || Ki(e, t, n, !1), o = (n & e.childLanes) !== 0, $s || o) {
				if (o = Ll, o !== null && (r = Ye(o, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, Zr(e, r), hu(o, e, r), Qs;
				of(c) || Du(), t = xc(e, t, n);
			} else of(c) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, Oi = lf(c.nextSibling), Di = t, G = !0, ki = null, Ai = !1, e !== null && Ei(t, e), t = yc(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? (to(t), c = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = ii(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (c = si(c, i, n, null), c.flags |= 2) : c = ii(u, c), c.return = t, r.return = t, r.sibling = c, t.child = r, ac(null, r), r = t.child, c = e.child.memoizedState, c === null ? c = gc(n) : (i = c.cachePool, i === null ? i = ma() : (l = K._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), c = {
			baseLanes: c.baseLanes | n,
			cachePool: i
		}), r.memoizedState = c, r.childLanes = _c(e, o, n), t.memoizedState = hc, ac(e.child, r)) : (Qa(t), n = e.child, e = n.sibling, n = ii(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function yc(e, t) {
		return t = bc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function bc(e, t) {
		return e = ni(22, e, null, t), e.lanes = 0, e;
	}
	function xc(e, t, n) {
		return ja(t, e.child, null, n), e = yc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Sc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Wi(e.return, t, n);
	}
	function Cc(e, t, n, r, i, a) {
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
	function wc(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = ro.current, s = (o & 2) != 0;
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, R(ro, o), ec(e, t, r, n), r = G ? gi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && Sc(e, n, t);
			else if (e.tag === 19) Sc(e, n, t);
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
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), Cc(t, !1, i, n, a, r);
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
				Cc(t, !0, n, null, a, r);
				break;
			case "together":
				Cc(t, !1, null, null, void 0, r);
				break;
			default: t.memoizedState = null;
		}
		return t.child;
	}
	function Tc(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), Gl |= t.lanes, (n & t.childLanes) === 0) if (e !== null) {
			if (Ki(e, t, n, !1), (n & t.childLanes) === 0) return null;
		} else return null;
		if (e !== null && t.child !== e.child) throw Error(s(153));
		if (t.child !== null) {
			for (e = t.child, n = ii(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ii(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function Ec(e, t) {
		return (e.lanes & t) === 0 ? (e = e.dependencies, !!(e !== null && qi(e))) : !0;
	}
	function Dc(e, t, n) {
		switch (t.tag) {
			case 3:
				oe(t, t.stateNode.containerInfo), Hi(t, K, e.memoizedState.cache), Ii();
				break;
			case 27:
			case 5:
				H(t);
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
				if (r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (Qa(t), e = Tc(e, t, n), e === null ? null : e.sibling) : vc(e, t, n) : (Qa(t), t.flags |= 128, null);
				Qa(t);
				break;
			case 19:
				var i = (e.flags & 128) != 0;
				if (r = (n & t.childLanes) !== 0, r ||= (Ki(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return wc(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), R(ro, ro.current), r) break;
				return null;
			case 22: return t.lanes = 0, ic(e, t, n, t.pendingProps);
			case 24: Hi(t, K, e.memoizedState.cache);
		}
		return Tc(e, t, n);
	}
	function Oc(e, t, n) {
		if (e !== null) if (e.memoizedProps !== t.pendingProps) $s = !0;
		else {
			if (!Ec(e, n) && !(t.flags & 128)) return $s = !1, Dc(e, t, n);
			$s = !!(e.flags & 131072);
		}
		else $s = !1, G && t.flags & 1048576 && Ci(t, gi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = xa(t.elementType), t.type = e, typeof e == "function") ri(e) ? (r = Hs(e, r), t.tag = 1, t = pc(null, t, e, r, n)) : (t.tag = 0, t = dc(null, t, e, r, n));
					else {
						if (e != null) {
							var i = e.$$typeof;
							if (i === w) {
								t.tag = 11, t = tc(null, t, e, r, n);
								break a;
							} else if (i === D) {
								t.tag = 14, t = nc(null, t, e, r, n);
								break a;
							}
						}
						throw t = te(e) || e, Error(s(306, t, ""));
					}
				}
				return t;
			case 0: return dc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, i = Hs(r, t.pendingProps), pc(e, t, r, i, n);
			case 3:
				a: {
					if (oe(t, t.stateNode.containerInfo), e === null) throw Error(s(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, Fa(e, t), Ha(t, r, null, n);
					var o = t.memoizedState;
					if (r = o.cache, Hi(t, K, r), r !== a.cache && Gi(t, [K], n, !0), Va(), r = o.element, a.isDehydrated) if (a = {
						element: r,
						isDehydrated: !1,
						cache: o.cache
					}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
						t = mc(e, t, r, n);
						break a;
					} else if (r !== i) {
						i = fi(Error(s(424)), t), Ri(i), t = mc(e, t, r, n);
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
							t = Tc(e, t, n);
							break a;
						}
						ec(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return uc(e, t), e === null ? (n = Af(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : G || (n = t.type, e = t.pendingProps, r = Vd(ae.current).createElement(n), r[tt] = t, r[nt] = e, Fd(r, n, e), mt(r), t.stateNode = r) : t.memoizedState = Af(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return H(t), e === null && G && (r = t.stateNode = pf(t.type, t.pendingProps, ae.current), Di = t, Ai = !0, i = Oi, Qd(t.type) ? (uf = i, Oi = lf(r.firstChild)) : Oi = i), ec(e, t, t.pendingProps.children, n), uc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && G && ((i = r = Oi) && (r = nf(r, t.type, t.pendingProps, Ai), r === null ? i = !1 : (t.stateNode = r, Di = t, Oi = lf(r.firstChild), Ai = !1, i = !0)), i || Mi(t)), H(t), i = t.type, a = t.pendingProps, o = e === null ? null : e.memoizedProps, r = a.children, Wd(i, a) ? r = null : o !== null && Wd(i, o) && (t.flags |= 32), t.memoizedState !== null && (i = vo(e, t, xo, null, null, n), Qf._currentValue = i), uc(e, t), ec(e, t, r, n), t.child;
			case 6: return e === null && G && ((e = n = Oi) && (n = rf(n, t.pendingProps, Ai), n === null ? e = !1 : (t.stateNode = n, Di = t, Oi = null, e = !0)), e || Mi(t)), null;
			case 13: return vc(e, t, n);
			case 4: return oe(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = ja(t, null, r, n) : ec(e, t, r, n), t.child;
			case 11: return tc(e, t, t.type, t.pendingProps, n);
			case 7: return ec(e, t, t.pendingProps, n), t.child;
			case 8: return ec(e, t, t.pendingProps.children, n), t.child;
			case 12: return ec(e, t, t.pendingProps.children, n), t.child;
			case 10: return r = t.pendingProps, Hi(t, t.type, r.value), ec(e, t, r.children, n), t.child;
			case 9: return i = t.type._context, r = t.pendingProps.children, Ji(t), i = Yi(i), r = r(i), t.flags |= 1, ec(e, t, r, n), t.child;
			case 14: return nc(e, t, t.type, t.pendingProps, n);
			case 15: return rc(e, t, t.type, t.pendingProps, n);
			case 19: return wc(e, t, n);
			case 31: return lc(e, t, n);
			case 22: return ic(e, t, n, t.pendingProps);
			case 24: return Ji(t), r = Yi(K), e === null ? (i = fa(), i === null && (i = Ll, a = ta(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, Pa(t), Hi(t, K, i)) : ((e.lanes & n) !== 0 && (Fa(e, t), Ha(t, null, null, n), Va()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, Hi(t, K, r), r !== i.cache && Gi(t, [K], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), Hi(t, K, r))), ec(e, t, t.pendingProps.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(s(156, t.tag));
	}
	function kc(e) {
		e.flags |= 4;
	}
	function Ac(e, t, n, r, i) {
		if ((t = (e.mode & 32) != 0) && (t = !1), t) {
			if (e.flags |= 16777216, (i & 335544128) === i) if (e.stateNode.complete) e.flags |= 8192;
			else if (wu()) e.flags |= 8192;
			else throw Sa = va, ga;
		} else e.flags &= -16777217;
	}
	function jc(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Wf(t)) if (wu()) e.flags |= 8192;
		else throw Sa = va, ga;
	}
	function Mc(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : Ue(), e.lanes |= t, Yl |= t);
	}
	function Nc(e, t) {
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
	function Pc(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 65011712, r |= i.flags & 65011712, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function Fc(e, t, n) {
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
			case 14: return Pc(t), null;
			case 1: return Pc(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Ui(K), se(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Fi(t) ? kc(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Li())), Pc(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (kc(t), a === null ? (Pc(t), Ac(t, i, null, r, n)) : (Pc(t), jc(t, a))) : a ? a === e.memoizedState ? (Pc(t), t.flags &= -16777217) : (kc(t), Pc(t), jc(t, a)) : (e = e.memoizedProps, e !== r && kc(t), Pc(t), Ac(t, i, e, r, n)), null;
			case 27:
				if (ce(t), n = ae.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && kc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Pc(t), null;
					}
					e = z.current, Fi(t) ? Ni(t, e) : (e = pf(i, r, n), t.stateNode = e, kc(t));
				}
				return Pc(t), null;
			case 5:
				if (ce(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && kc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Pc(t), null;
					}
					if (a = z.current, Fi(t)) Ni(t, a);
					else {
						var o = Vd(ae.current);
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
						r && kc(t);
					}
				}
				return Pc(t), Ac(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && kc(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(s(166));
					if (e = ae.current, Fi(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = Di, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[tt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || Nd(e.nodeValue, n)), e || Mi(t, !0);
					} else e = Vd(e).createTextNode(r), e[tt] = t, t.stateNode = e;
				}
				return Pc(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Fi(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(s(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(557));
							e[tt] = t;
						} else Ii(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Pc(t), e = !1;
					} else n = Li(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (no(t), t) : (no(t), null);
					if (t.flags & 128) throw Error(s(558));
				}
				return Pc(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = Fi(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(s(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(s(317));
							i[tt] = t;
						} else Ii(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Pc(t), i = !1;
					} else i = Li(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (no(t), t) : (no(t), null);
				}
				return no(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Mc(t, t.updateQueue), Pc(t), null);
			case 4: return se(), e === null && Cd(t.stateNode.containerInfo), Pc(t), null;
			case 10: return Ui(t.type), Pc(t), null;
			case 19:
				if (L(ro), r = t.memoizedState, r === null) return Pc(t), null;
				if (i = (t.flags & 128) != 0, a = r.rendering, a === null) if (i) Nc(r, !1);
				else {
					if (Wl !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
						if (a = io(e), a !== null) {
							for (t.flags |= 128, Nc(r, !1), e = a.updateQueue, t.updateQueue = e, Mc(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) ai(n, e), n = n.sibling;
							return R(ro, ro.current & 1 | 2), G && Si(t, r.treeForkCount), t.child;
						}
						e = e.sibling;
					}
					r.tail !== null && xe() > tu && (t.flags |= 128, i = !0, Nc(r, !1), t.lanes = 4194304);
				}
				else {
					if (!i) if (e = io(a), e !== null) {
						if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Mc(t, e), Nc(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !G) return Pc(t), null;
					} else 2 * xe() - r.renderingStartTime > tu && n !== 536870912 && (t.flags |= 128, i = !0, Nc(r, !1), t.lanes = 4194304);
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (Pc(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = xe(), e.sibling = null, n = ro.current, R(ro, i ? n & 1 | 2 : n & 1), G && Si(t, r.treeForkCount), e);
			case 22:
			case 23: return no(t), Ya(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (Pc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Pc(t), n = t.updateQueue, n !== null && Mc(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && L(da), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Ui(K), Pc(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(s(156, t.tag));
	}
	function Ic(e, t) {
		switch (Ti(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Ui(K), se(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
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
			case 19: return L(ro), null;
			case 4: return se(), null;
			case 10: return Ui(t.type), null;
			case 22:
			case 23: return no(t), Ya(), e !== null && L(da), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Ui(K), null;
			case 25: return null;
			default: return null;
		}
	}
	function Lc(e, t) {
		switch (Ti(t), t.tag) {
			case 3:
				Ui(K), se();
				break;
			case 26:
			case 27:
			case 5:
				ce(t);
				break;
			case 4:
				se();
				break;
			case 31:
				t.memoizedState !== null && no(t);
				break;
			case 13:
				no(t);
				break;
			case 19:
				L(ro);
				break;
			case 10:
				Ui(t.type);
				break;
			case 22:
			case 23:
				no(t), Ya(), e !== null && L(da);
				break;
			case 24: Ui(K);
		}
	}
	function Rc(e, t) {
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
			Gu(t, t.return, e);
		}
	}
	function zc(e, t, n) {
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
								Gu(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			Gu(t, t.return, e);
		}
	}
	function Bc(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Wa(t, n);
			} catch (t) {
				Gu(e, e.return, t);
			}
		}
	}
	function Vc(e, t, n) {
		n.props = Hs(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Gu(e, t, n);
		}
	}
	function Hc(e, t) {
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
			Gu(e, t, n);
		}
	}
	function Uc(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) if (typeof r == "function") try {
			r();
		} catch (n) {
			Gu(e, t, n);
		} finally {
			e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
		}
		else if (typeof n == "function") try {
			n(null);
		} catch (n) {
			Gu(e, t, n);
		}
		else n.current = null;
	}
	function Wc(e) {
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
			Gu(e, e.return, t);
		}
	}
	function Gc(e, t, n) {
		try {
			var r = e.stateNode;
			Id(r, e.type, n, t), r[nt] = t;
		} catch (t) {
			Gu(e, e.return, t);
		}
	}
	function Kc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Qd(e.type) || e.tag === 4;
	}
	function qc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Kc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Qd(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Jc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Jt));
		else if (r !== 4 && (r === 27 && Qd(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null)) for (Jc(e, t, n), e = e.sibling; e !== null;) Jc(e, t, n), e = e.sibling;
	}
	function Yc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (r === 27 && Qd(e.type) && (n = e.stateNode), e = e.child, e !== null)) for (Yc(e, t, n), e = e.sibling; e !== null;) Yc(e, t, n), e = e.sibling;
	}
	function Xc(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			Fd(t, r, n), t[tt] = e, t[nt] = n;
		} catch (t) {
			Gu(e, e.return, t);
		}
	}
	var Zc = !1, Qc = !1, $c = !1, el = typeof WeakSet == "function" ? WeakSet : Set, tl = null;
	function nl(e, t) {
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
		}, sp = !1, tl = t; tl !== null;) if (t = tl, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, tl = e;
		else for (; tl !== null;) {
			switch (t = tl, a = t.alternate, e = t.flags, t.tag) {
				case 0:
					if (e & 4 && (e = t.updateQueue, e = e === null ? null : e.events, e !== null)) for (n = 0; n < e.length; n++) i = e[n], i.ref.impl = i.nextImpl;
					break;
				case 11:
				case 15: break;
				case 1:
					if (e & 1024 && a !== null) {
						e = void 0, n = t, i = a.memoizedProps, a = a.memoizedState, r = n.stateNode;
						try {
							var h = Hs(n.type, i);
							e = r.getSnapshotBeforeUpdate(h, a), r.__reactInternalSnapshotBeforeUpdate = e;
						} catch (e) {
							Gu(n, n.return, e);
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
				e.return = t.return, tl = e;
				break;
			}
			tl = t.return;
		}
	}
	function rl(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				_l(e, n), r & 4 && Rc(5, n);
				break;
			case 1:
				if (_l(e, n), r & 4) if (e = n.stateNode, t === null) try {
					e.componentDidMount();
				} catch (e) {
					Gu(n, n.return, e);
				}
				else {
					var i = Hs(n.type, t.memoizedProps);
					t = t.memoizedState;
					try {
						e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
					} catch (e) {
						Gu(n, n.return, e);
					}
				}
				r & 64 && Bc(n), r & 512 && Hc(n, n.return);
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
						Gu(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Xc(n);
			case 26:
			case 5:
				_l(e, n), t === null && r & 4 && Wc(n), r & 512 && Hc(n, n.return);
				break;
			case 12:
				_l(e, n);
				break;
			case 31:
				_l(e, n), r & 4 && cl(e, n);
				break;
			case 13:
				_l(e, n), r & 4 && ll(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = Yu.bind(null, n), cf(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || Zc, !r) {
					t = t !== null && t.memoizedState !== null || Qc, i = Zc;
					var a = Qc;
					Zc = r, (Qc = t) && !a ? yl(e, n, (n.subtreeFlags & 8772) != 0) : _l(e, n), Zc = i, Qc = a;
				}
				break;
			case 30: break;
			default: _l(e, n);
		}
	}
	function il(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, il(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && lt(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var J = null, al = !1;
	function ol(e, t, n) {
		for (n = n.child; n !== null;) sl(e, t, n), n = n.sibling;
	}
	function sl(e, t, n) {
		if (U && typeof U.onCommitFiberUnmount == "function") try {
			U.onCommitFiberUnmount(Ae, n);
		} catch {}
		switch (n.tag) {
			case 26:
				Qc || Uc(n, t), ol(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				Qc || Uc(n, t);
				var r = J, i = al;
				Qd(n.type) && (J = n.stateNode, al = !1), ol(e, t, n), mf(n.stateNode), J = r, al = i;
				break;
			case 5: Qc || Uc(n, t);
			case 6:
				if (r = J, i = al, J = null, ol(e, t, n), J = r, al = i, J !== null) if (al) try {
					(J.nodeType === 9 ? J.body : J.nodeName === "HTML" ? J.ownerDocument.body : J).removeChild(n.stateNode);
				} catch (e) {
					Gu(n, t, e);
				}
				else try {
					J.removeChild(n.stateNode);
				} catch (e) {
					Gu(n, t, e);
				}
				break;
			case 18:
				J !== null && (al ? (e = J, $d(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Np(e)) : $d(J, n.stateNode));
				break;
			case 4:
				r = J, i = al, J = n.stateNode.containerInfo, al = !0, ol(e, t, n), J = r, al = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				zc(2, n, t), Qc || zc(4, n, t), ol(e, t, n);
				break;
			case 1:
				Qc || (Uc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Vc(n, t, r)), ol(e, t, n);
				break;
			case 21:
				ol(e, t, n);
				break;
			case 22:
				Qc = (r = Qc) || n.memoizedState !== null, ol(e, t, n), Qc = r;
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
				Gu(t, t.return, e);
			}
		}
	}
	function ll(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Np(e);
		} catch (e) {
			Gu(t, t.return, e);
		}
	}
	function ul(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new el()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new el()), t;
			default: throw Error(s(435, e.tag));
		}
	}
	function dl(e, t) {
		var n = ul(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = Xu.bind(null, e, t);
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
							J = c.stateNode, al = !1;
							break a;
						}
						break;
					case 5:
						J = c.stateNode, al = !1;
						break a;
					case 3:
					case 4:
						J = c.stateNode.containerInfo, al = !0;
						break a;
				}
				c = c.return;
			}
			if (J === null) throw Error(s(160));
			sl(a, o, i), J = null, al = !1, a = i.alternate, a !== null && (a.return = null), i.return = null;
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
				fl(t, e), hl(e), r & 4 && (zc(3, e, e.return), Rc(3, e), zc(5, e, e.return));
				break;
			case 1:
				fl(t, e), hl(e), r & 512 && (Qc || n === null || Uc(n, n.return)), r & 64 && Zc && (e = e.updateQueue, e !== null && (r = e.callbacks, r !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? r : n.concat(r))));
				break;
			case 26:
				var i = pl;
				if (fl(t, e), hl(e), r & 512 && (Qc || n === null || Uc(n, n.return)), r & 4) {
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
					else e.stateNode = If(i, r, e.memoizedProps);
					else a === r ? r === null && e.stateNode !== null && Gc(e, e.memoizedProps, n.memoizedProps) : (a === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : a.count--, r === null ? Hf(i, e.type, e.stateNode) : If(i, r, e.memoizedProps));
				}
				break;
			case 27:
				fl(t, e), hl(e), r & 512 && (Qc || n === null || Uc(n, n.return)), n !== null && r & 4 && Gc(e, e.memoizedProps, n.memoizedProps);
				break;
			case 5:
				if (fl(t, e), hl(e), r & 512 && (Qc || n === null || Uc(n, n.return)), e.flags & 32) {
					i = e.stateNode;
					try {
						Bt(i, "");
					} catch (t) {
						Gu(e, e.return, t);
					}
				}
				r & 4 && e.stateNode != null && (i = e.memoizedProps, Gc(e, i, n === null ? i : n.memoizedProps)), r & 1024 && ($c = !0);
				break;
			case 6:
				if (fl(t, e), hl(e), r & 4) {
					if (e.stateNode === null) throw Error(s(162));
					r = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = r;
					} catch (t) {
						Gu(e, e.return, t);
					}
				}
				break;
			case 3:
				if (Bf = null, i = pl, pl = _f(t.containerInfo), fl(t, e), pl = i, hl(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					Np(t.containerInfo);
				} catch (t) {
					Gu(e, e.return, t);
				}
				$c && ($c = !1, gl(e));
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
				fl(t, e), hl(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && ($l = xe()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, dl(e, r)));
				break;
			case 22:
				i = e.memoizedState !== null;
				var l = n !== null && n.memoizedState !== null, u = Zc, d = Qc;
				if (Zc = u || i, Qc = d || l, fl(t, e), Qc = d, Zc = u, hl(e), r & 8192) a: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || l || Zc || Qc || vl(e)), n = null, t = e;;) {
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
								Gu(l, l.return, e);
							}
						}
					} else if (t.tag === 6) {
						if (n === null) {
							l = t;
							try {
								l.stateNode.nodeValue = i ? "" : l.memoizedProps;
							} catch (e) {
								Gu(l, l.return, e);
							}
						}
					} else if (t.tag === 18) {
						if (n === null) {
							l = t;
							try {
								var m = l.stateNode;
								i ? ef(m, !0) : ef(l.stateNode, !1);
							} catch (e) {
								Gu(l, l.return, e);
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
					if (Kc(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				if (n == null) throw Error(s(160));
				switch (n.tag) {
					case 27:
						var i = n.stateNode;
						Yc(e, qc(e), i);
						break;
					case 5:
						var a = n.stateNode;
						n.flags & 32 && (Bt(a, ""), n.flags &= -33), Yc(e, qc(e), a);
						break;
					case 3:
					case 4:
						var o = n.stateNode.containerInfo;
						Jc(e, qc(e), o);
						break;
					default: throw Error(s(161));
				}
			} catch (t) {
				Gu(e, e.return, t);
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
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) rl(e, t.alternate, t), t = t.sibling;
	}
	function vl(e) {
		for (e = e.child; e !== null;) {
			var t = e;
			switch (t.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					zc(4, t, t.return), vl(t);
					break;
				case 1:
					Uc(t, t.return);
					var n = t.stateNode;
					typeof n.componentWillUnmount == "function" && Vc(t, t.return, n), vl(t);
					break;
				case 27: mf(t.stateNode);
				case 26:
				case 5:
					Uc(t, t.return), vl(t);
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
					yl(i, a, n), Rc(4, a);
					break;
				case 1:
					if (yl(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Gu(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var s = r.stateNode;
						try {
							var c = i.shared.hiddenCallbacks;
							if (c !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < c.length; i++) Ua(c[i], s);
						} catch (e) {
							Gu(r, r.return, e);
						}
					}
					n && o & 64 && Bc(a), Hc(a, a.return);
					break;
				case 27: Xc(a);
				case 26:
				case 5:
					yl(i, a, n), n && r === null && o & 4 && Wc(a), Hc(a, a.return);
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
					a.memoizedState === null && yl(i, a, n), Hc(a, a.return);
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
				Sl(e, t, n, r), i & 2048 && Rc(9, t);
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
						Gu(t, t.return, e);
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
					wl(a, o, s, c, i), Rc(8, o);
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
				tl = r, Nl(r, e);
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
				Al(e), e.flags & 2048 && zc(9, e, e.return);
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
				tl = r, Nl(r, e);
			}
			kl(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					zc(8, t, t.return), Ml(t);
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
		for (; tl !== null;) {
			var n = tl;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					zc(8, n, t);
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
			if (r = n.child, r !== null) r.return = n, tl = r;
			else a: for (n = e; tl !== null;) {
				r = tl;
				var i = r.sibling, a = r.return;
				if (il(r), r === n) {
					tl = null;
					break a;
				}
				if (i !== null) {
					i.return = a, tl = i;
					break a;
				}
				tl = a;
			}
		}
	}
	var Pl = {
		getCacheForType: function(e) {
			var t = Yi(K), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Yi(K).controller.signal;
		}
	}, Fl = typeof WeakMap == "function" ? WeakMap : Map, Il = 0, Ll = null, Y = null, X = 0, Rl = 0, zl = null, Bl = !1, Vl = !1, Hl = !1, Ul = 0, Wl = 0, Gl = 0, Kl = 0, ql = 0, Jl = 0, Yl = 0, Xl = null, Zl = null, Ql = !1, $l = 0, eu = 0, tu = Infinity, nu = null, ru = null, iu = 0, au = null, ou = null, su = 0, cu = 0, lu = null, uu = null, du = 0, fu = null;
	function pu() {
		return Il & 2 && X !== 0 ? X & -X : N.T === null ? Qe() : fd();
	}
	function mu() {
		if (Jl === 0) if (!(X & 536870912) || G) {
			var e = Le;
			Le <<= 1, !(Le & 3932160) && (Le = 262144), Jl = e;
		} else Jl = 536870912;
		return e = Xa.current, e !== null && (e.flags |= 32), Jl;
	}
	function hu(e, t, n) {
		(e === Ll && (Rl === 2 || Rl === 9) || e.cancelPendingCommit !== null) && (Su(e, 0), yu(e, X, Jl, !1)), Ge(e, n), (!(Il & 2) || e !== Ll) && (e === Ll && (!(Il & 2) && (Kl |= n), Wl === 4 && yu(e, X, Jl, !1)), id(e));
	}
	function gu(e, t, n) {
		if (Il & 6) throw Error(s(327));
		var r = !n && (t & 127) == 0 && (t & e.expiredLanes) === 0 || Ve(e, t), i = r ? Au(e, t) : Ou(e, t, !0), a = r;
		do {
			if (i === 0) {
				Vl && !r && yu(e, t, 0, !1);
				break;
			} else {
				if (n = e.current.alternate, a && !vu(n)) {
					i = Ou(e, t, !1), a = !1;
					continue;
				}
				if (i === 2) {
					if (a = t, e.errorRecoveryDisabledLanes & a) var o = 0;
					else o = e.pendingLanes & -536870913, o = o === 0 ? o & 536870912 ? 536870912 : 0 : o;
					if (o !== 0) {
						t = o;
						a: {
							var c = e;
							i = Xl;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (Su(c, o).flags |= 256), o = Ou(c, o, !1), o !== 2) {
								if (Hl && !l) {
									c.errorRecoveryDisabledLanes |= a, Kl |= a, i = 4;
									break a;
								}
								a = Zl, Zl = i, a !== null && (Zl === null ? Zl = a : Zl.push.apply(Zl, a));
							}
							i = o;
						}
						if (a = !1, i !== 2) continue;
					}
				}
				if (i === 1) {
					Su(e, 0), yu(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, a = i, a) {
						case 0:
						case 1: throw Error(s(345));
						case 4: if ((t & 4194048) !== t) break;
						case 6:
							yu(r, t, Jl, !Bl);
							break a;
						case 2:
							Zl = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(s(329));
					}
					if ((t & 62914560) === t && (i = $l + 300 - xe(), 10 < i)) {
						if (yu(r, t, Jl, !Bl), Be(r, 0, !0) !== 0) break a;
						su = t, r.timeoutHandle = qd(_u.bind(null, r, n, Zl, nu, Ql, t, Jl, Kl, Yl, Bl, a, "Throttled", -0, 0), i);
						break a;
					}
					_u(r, n, Zl, nu, Ql, t, Jl, Kl, Yl, Bl, a, null, -0, 0);
				}
			}
			break;
		} while (1);
		id(e);
	}
	function _u(e, t, n, r, i, a, o, s, c, l, u, d, f, p) {
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
			var m = (a & 62914560) === a ? $l - xe() : (a & 4194048) === a ? eu - xe() : 0;
			if (m = qf(d, m), m !== null) {
				su = a, e.cancelPendingCommit = m(Lu.bind(null, e, t, a, n, r, i, o, s, c, u, d, null, f, p)), yu(e, a, o, !l);
				return;
			}
		}
		Lu(e, t, a, n, r, i, o, s, c);
	}
	function vu(e) {
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
	function yu(e, t, n, r) {
		t &= ~ql, t &= ~Kl, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - Me(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && qe(e, n, t);
	}
	function bu() {
		return Il & 6 ? !0 : (ad(0, !1), !1);
	}
	function xu() {
		if (Y !== null) {
			if (Rl === 0) var e = Y.return;
			else e = Y, Vi = Bi = null, wo(e), Ta = null, Ea = 0, e = Y;
			for (; e !== null;) Lc(e.alternate, e), e = e.return;
			Y = null;
		}
	}
	function Su(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, Jd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), su = 0, xu(), Ll = e, Y = n = ii(e.current, null), X = t, Rl = 0, zl = null, Bl = !1, Vl = Ve(e, t), Hl = !1, Yl = Jl = ql = Kl = Gl = Wl = 0, Zl = Xl = null, Ql = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - Me(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Ul = t, Jr(), n;
	}
	function Cu(e, t) {
		q = null, N.H = Ps, t === ha || t === _a ? (t = Ca(), Rl = 3) : t === ga ? (t = Ca(), Rl = 4) : Rl = t === Qs ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, zl = t, Y === null && (Wl = 1, Ks(e, fi(t, e.current)));
	}
	function wu() {
		var e = Xa.current;
		return e === null ? !0 : (X & 4194048) === X ? Za === null : (X & 62914560) === X || X & 536870912 ? e === Za : !1;
	}
	function Tu() {
		var e = N.H;
		return N.H = Ps, e === null ? Ps : e;
	}
	function Eu() {
		var e = N.A;
		return N.A = Pl, e;
	}
	function Du() {
		Wl = 4, Bl || (X & 4194048) !== X && Xa.current !== null || (Vl = !0), !(Gl & 134217727) && !(Kl & 134217727) || Ll === null || yu(Ll, X, Jl, !1);
	}
	function Ou(e, t, n) {
		var r = Il;
		Il |= 2;
		var i = Tu(), a = Eu();
		(Ll !== e || X !== t) && (nu = null, Su(e, t)), t = !1;
		var o = Wl;
		a: do
			try {
				if (Rl !== 0 && Y !== null) {
					var s = Y, c = zl;
					switch (Rl) {
						case 8:
							xu(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							Xa.current === null && (t = !0);
							var l = Rl;
							if (Rl = 0, zl = null, Pu(e, s, c, l), n && Vl) {
								o = 0;
								break a;
							}
							break;
						default: l = Rl, Rl = 0, zl = null, Pu(e, s, c, l);
					}
				}
				ku(), o = Wl;
				break;
			} catch (t) {
				Cu(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, Vi = Bi = null, Il = r, N.H = i, N.A = a, Y === null && (Ll = null, X = 0, Jr()), o;
	}
	function ku() {
		for (; Y !== null;) Mu(Y);
	}
	function Au(e, t) {
		var n = Il;
		Il |= 2;
		var r = Tu(), i = Eu();
		Ll !== e || X !== t ? (nu = null, tu = xe() + 500, Su(e, t)) : Vl = Ve(e, t);
		a: do
			try {
				if (Rl !== 0 && Y !== null) {
					t = Y;
					var a = zl;
					b: switch (Rl) {
						case 1:
							Rl = 0, zl = null, Pu(e, t, a, 1);
							break;
						case 2:
						case 9:
							if (ya(a)) {
								Rl = 0, zl = null, Nu(t);
								break;
							}
							t = function() {
								Rl !== 2 && Rl !== 9 || Ll !== e || (Rl = 7), id(e);
							}, a.then(t, t);
							break a;
						case 3:
							Rl = 7;
							break a;
						case 4:
							Rl = 5;
							break a;
						case 7:
							ya(a) ? (Rl = 0, zl = null, Nu(t)) : (Rl = 0, zl = null, Pu(e, t, a, 7));
							break;
						case 5:
							var o = null;
							switch (Y.tag) {
								case 26: o = Y.memoizedState;
								case 5:
								case 27:
									var c = Y;
									if (o ? Wf(o) : c.stateNode.complete) {
										Rl = 0, zl = null;
										var l = c.sibling;
										if (l !== null) Y = l;
										else {
											var u = c.return;
											u === null ? Y = null : (Y = u, Fu(u));
										}
										break b;
									}
							}
							Rl = 0, zl = null, Pu(e, t, a, 5);
							break;
						case 6:
							Rl = 0, zl = null, Pu(e, t, a, 6);
							break;
						case 8:
							xu(), Wl = 6;
							break a;
						default: throw Error(s(462));
					}
				}
				ju();
				break;
			} catch (t) {
				Cu(e, t);
			}
		while (1);
		return Vi = Bi = null, N.H = r, N.A = i, Il = n, Y === null ? (Ll = null, X = 0, Jr(), Wl) : 0;
	}
	function ju() {
		for (; Y !== null && !ye();) Mu(Y);
	}
	function Mu(e) {
		var t = Oc(e.alternate, e, Ul);
		e.memoizedProps = e.pendingProps, t === null ? Fu(e) : Y = t;
	}
	function Nu(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = fc(n, t, t.pendingProps, t.type, void 0, X);
				break;
			case 11:
				t = fc(n, t, t.pendingProps, t.type.render, t.ref, X);
				break;
			case 5: wo(t);
			default: Lc(n, t), t = Y = ai(t, Ul), t = Oc(n, t, Ul);
		}
		e.memoizedProps = e.pendingProps, t === null ? Fu(e) : Y = t;
	}
	function Pu(e, t, n, r) {
		Vi = Bi = null, wo(t), Ta = null, Ea = 0;
		var i = t.return;
		try {
			if (Zs(e, i, t, n, X)) {
				Wl = 1, Ks(e, fi(n, e.current)), Y = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw Y = i, t;
			Wl = 1, Ks(e, fi(n, e.current)), Y = null;
			return;
		}
		t.flags & 32768 ? (G || r === 1 ? e = !0 : Vl || X & 536870912 ? e = !1 : (Bl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Xa.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Iu(t, e)) : Fu(t);
	}
	function Fu(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				Iu(t, Bl);
				return;
			}
			e = t.return;
			var n = Fc(t.alternate, t, Ul);
			if (n !== null) {
				Y = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				Y = t;
				return;
			}
			Y = t = e;
		} while (t !== null);
		Wl === 0 && (Wl = 5);
	}
	function Iu(e, t) {
		do {
			var n = Ic(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, Y = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				Y = e;
				return;
			}
			Y = e = n;
		} while (e !== null);
		Wl = 6, Y = null;
	}
	function Lu(e, t, n, r, i, a, o, c, l) {
		e.cancelPendingCommit = null;
		do
			Hu();
		while (iu !== 0);
		if (Il & 6) throw Error(s(327));
		if (t !== null) {
			if (t === e.current) throw Error(s(177));
			if (a = t.lanes | t.childLanes, a |= qr, Ke(e, n, a, o, c, l), e === Ll && (Y = Ll = null, X = 0), ou = t, au = e, su = n, cu = a, lu = i, uu = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Zu(Te, function() {
				return Uu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = (t.flags & 13878) != 0, t.subtreeFlags & 13878 || r) {
				r = N.T, N.T = null, i = P.p, P.p = 2, o = Il, Il |= 4;
				try {
					nl(e, t, n);
				} finally {
					Il = o, P.p = i, N.T = r;
				}
			}
			iu = 1, Ru(), zu(), Bu();
		}
	}
	function Ru() {
		if (iu === 1) {
			iu = 0;
			var e = au, t = ou, n = (t.flags & 13878) != 0;
			if (t.subtreeFlags & 13878 || n) {
				n = N.T, N.T = null;
				var r = P.p;
				P.p = 2;
				var i = Il;
				Il |= 4;
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
					Il = i, P.p = r, N.T = n;
				}
			}
			e.current = t, iu = 2;
		}
	}
	function zu() {
		if (iu === 2) {
			iu = 0;
			var e = au, t = ou, n = (t.flags & 8772) != 0;
			if (t.subtreeFlags & 8772 || n) {
				n = N.T, N.T = null;
				var r = P.p;
				P.p = 2;
				var i = Il;
				Il |= 4;
				try {
					rl(e, t.alternate, t);
				} finally {
					Il = i, P.p = r, N.T = n;
				}
			}
			iu = 3;
		}
	}
	function Bu() {
		if (iu === 4 || iu === 3) {
			iu = 0, be();
			var e = au, t = ou, n = su, r = uu;
			t.subtreeFlags & 10256 || t.flags & 10256 ? iu = 5 : (iu = 0, ou = au = null, Vu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (ru = null), Ze(n), t = t.stateNode, U && typeof U.onCommitFiberRoot == "function") try {
				U.onCommitFiberRoot(Ae, t, void 0, (t.current.flags & 128) == 128);
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
			su & 3 && Hu(), id(e), i = e.pendingLanes, n & 261930 && i & 42 ? e === fu ? du++ : (du = 0, fu = e) : du = 0, ad(0, !1);
		}
	}
	function Vu(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, na(t)));
	}
	function Hu() {
		return Ru(), zu(), Bu(), Uu();
	}
	function Uu() {
		if (iu !== 5) return !1;
		var e = au, t = cu;
		cu = 0;
		var n = Ze(su), r = N.T, i = P.p;
		try {
			P.p = 32 > n ? 32 : n, N.T = null, n = lu, lu = null;
			var a = au, o = su;
			if (iu = 0, ou = au = null, su = 0, Il & 6) throw Error(s(331));
			var c = Il;
			if (Il |= 4, jl(a.current), Cl(a, a.current, o, n), Il = c, ad(0, !1), U && typeof U.onPostCommitFiberRoot == "function") try {
				U.onPostCommitFiberRoot(Ae, a);
			} catch {}
			return !0;
		} finally {
			P.p = i, N.T = r, Vu(e, t);
		}
	}
	function Wu(e, t, n) {
		t = fi(n, t), t = Js(e.stateNode, t, 2), e = La(e, t, 2), e !== null && (Ge(e, 2), id(e));
	}
	function Gu(e, t, n) {
		if (e.tag === 3) Wu(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				Wu(t, e, n);
				break;
			} else if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (ru === null || !ru.has(r))) {
					e = fi(n, e), n = Ys(2), r = La(t, n, 2), r !== null && (Xs(n, r, t, e), Ge(r, 2), id(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function Ku(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Fl();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (Hl = !0, i.add(n), e = qu.bind(null, e, t, n), t.then(e, e));
	}
	function qu(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Ll === e && (X & n) === n && (Wl === 4 || Wl === 3 && (X & 62914560) === X && 300 > xe() - $l ? !(Il & 2) && Su(e, 0) : ql |= n, Yl === X && (Yl = 0)), id(e);
	}
	function Ju(e, t) {
		t === 0 && (t = Ue()), e = Zr(e, t), e !== null && (Ge(e, t), id(e));
	}
	function Yu(e) {
		var t = e.memoizedState, n = 0;
		t !== null && (n = t.retryLane), Ju(e, n);
	}
	function Xu(e, t) {
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
		r !== null && r.delete(t), Ju(e, n);
	}
	function Zu(e, t) {
		return _e(e, t);
	}
	var Qu = null, $u = null, ed = !1, td = !1, nd = !1, rd = 0;
	function id(e) {
		e !== $u && e.next === null && ($u === null ? Qu = $u = e : $u = $u.next = e), td = !0, ed || (ed = !0, dd());
	}
	function ad(e, t) {
		if (!nd && td) {
			nd = !0;
			do
				for (var n = !1, r = Qu; r !== null;) {
					if (!t) if (e !== 0) {
						var i = r.pendingLanes;
						if (i === 0) var a = 0;
						else {
							var o = r.suspendedLanes, s = r.pingedLanes;
							a = (1 << 31 - Me(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
						}
						a !== 0 && (n = !0, ud(r, a));
					} else a = X, a = Be(r, r === Ll ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || Ve(r, a) || (n = !0, ud(r, a));
					r = r.next;
				}
			while (n);
			nd = !1;
		}
	}
	function od() {
		sd();
	}
	function sd() {
		td = ed = !1;
		var e = 0;
		rd !== 0 && Kd() && (e = rd);
		for (var t = xe(), n = null, r = Qu; r !== null;) {
			var i = r.next, a = cd(r, t);
			a === 0 ? (r.next = null, n === null ? Qu = i : n.next = i, i === null && ($u = n)) : (n = r, (e !== 0 || a & 3) && (td = !0)), r = i;
		}
		iu !== 0 && iu !== 5 || ad(e, !1), rd !== 0 && (rd = 0);
	}
	function cd(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - Me(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = He(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Ll, n = X, n = Be(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Rl === 2 || Rl === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && ve(r), e.callbackNode = null, e.callbackPriority = 0;
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
			return r = ld.bind(null, e), n = _e(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && ve(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function ld(e, t) {
		if (iu !== 0 && iu !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Hu() && e.callbackNode !== n) return null;
		var r = X;
		return r = Be(e, e === Ll ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (gu(e, r, t), cd(e, xe()), e.callbackNode != null && e.callbackNode === n ? ld.bind(null, e) : null);
	}
	function ud(e, t) {
		if (Hu()) return null;
		gu(e, t, !0);
	}
	function dd() {
		Xd(function() {
			Il & 6 ? _e(Ce, od) : sd();
		});
	}
	function fd() {
		if (rd === 0) {
			var e = aa;
			e === 0 && (e = Ie, Ie <<= 1, !(Ie & 261888) && (Ie = 256)), rd = e;
		}
		return rd;
	}
	function pd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : qt("" + e);
	}
	function md(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function hd(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = pd((i[nt] || null).action), o = r.submitter;
			o && (t = (t = o[nt] || null) ? pd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new gn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (rd !== 0) {
								var e = o ? md(i, o) : new FormData(i);
								bs(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = o ? md(i, o) : new FormData(i), bs(n, {
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
	for (var gd = 0; gd < Hr.length; gd++) {
		var _d = Hr[gd];
		Ur(_d.toLowerCase(), "on" + (_d[0].toUpperCase() + _d.slice(1)));
	}
	Ur(Pr, "onAnimationEnd"), Ur(Fr, "onAnimationIteration"), Ur(Ir, "onAnimationStart"), Ur("dblclick", "onDoubleClick"), Ur("focusin", "onFocus"), Ur("focusout", "onBlur"), Ur(Lr, "onTransitionRun"), Ur(Rr, "onTransitionStart"), Ur(zr, "onTransitionCancel"), Ur(Br, "onTransitionEnd"), vt("onMouseEnter", ["mouseout", "mouseover"]), vt("onMouseLeave", ["mouseout", "mouseover"]), vt("onPointerEnter", ["pointerout", "pointerover"]), vt("onPointerLeave", ["pointerout", "pointerover"]), _t("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), _t("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), _t("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), _t("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), _t("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), _t("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
	var vd = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), yd = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(vd));
	function bd(e, t) {
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
	function Z(e, t) {
		var n = t[it];
		n === void 0 && (n = t[it] = /* @__PURE__ */ new Set());
		var r = e + "__bubble";
		n.has(r) || (wd(t, e, 2, !1), n.add(r));
	}
	function xd(e, t, n) {
		var r = 0;
		t && (r |= 4), wd(n, e, r, t);
	}
	var Sd = "_reactListening" + Math.random().toString(36).slice(2);
	function Cd(e) {
		if (!e[Sd]) {
			e[Sd] = !0, ht.forEach(function(t) {
				t !== "selectionchange" && (yd.has(t) || xd(t, !1, e), xd(t, !0, e));
			});
			var t = e.nodeType === 9 ? e : e.ownerDocument;
			t === null || t[Sd] || (t[Sd] = !0, xd("selectionchange", !1, t));
		}
	}
	function wd(e, t, n, r) {
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
	function Td(e, t, n, r, i) {
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
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = nn(m, p), g != null && d.push(Ed(m, g, h))), f) break;
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
							for (d = Od, p = c, m = u, h = 0, g = p; g; g = d(g)) h++;
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
						c !== null && kd(o, s, c, d, !1), u !== null && f !== null && kd(o, f, u, d, !0);
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
				x && (Un && n.locale !== "ko" && (Jn || x !== "onCompositionStart" ? x === "onCompositionEnd" && Jn && (b = un()) : (sn = i, cn = "value" in sn ? sn.value : sn.textContent, Jn = !0)), y = Dd(r, x), 0 < y.length && (x = new On(x, e, null, n, i), o.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = qn(n), b !== null && (x.data = b)))), (b = Hn ? Yn(e, n) : Xn(e, n)) && (x = Dd(r, "onBeforeInput"), 0 < x.length && (y = new On("onBeforeInput", "beforeinput", null, n, i), o.push({
					event: y,
					listeners: x
				}), y.data = b)), hd(o, e, r, n, i);
			}
			bd(o, t);
		});
	}
	function Ed(e, t, n) {
		return {
			instance: e,
			listener: t,
			currentTarget: n
		};
	}
	function Dd(e, t) {
		for (var n = t + "Capture", r = []; e !== null;) {
			var i = e, a = i.stateNode;
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = nn(e, n), i != null && r.unshift(Ed(e, i, a)), i = nn(e, t), i != null && r.push(Ed(e, i, a))), e.tag === 3) return r;
			e = e.return;
		}
		return [];
	}
	function Od(e) {
		if (e === null) return null;
		do
			e = e.return;
		while (e && e.tag !== 5 && e.tag !== 27);
		return e || null;
	}
	function kd(e, t, n, r, i) {
		for (var a = t._reactName, o = []; n !== null && n !== r;) {
			var s = n, c = s.alternate, l = s.stateNode;
			if (s = s.tag, c !== null && c === r) break;
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = nn(n, a), l != null && o.unshift(Ed(n, l, c))) : i || (l = nn(n, a), l != null && o.push(Ed(n, l, c)))), n = n.return;
		}
		o.length !== 0 && e.push({
			event: t,
			listeners: o
		});
	}
	var Ad = /\r\n?/g, jd = /\u0000|\uFFFD/g;
	function Md(e) {
		return (typeof e == "string" ? e : "" + e).replace(Ad, "\n").replace(jd, "");
	}
	function Nd(e, t) {
		return t = Md(t), Md(e) === t;
	}
	function Pd(e, t, n, r, i, a) {
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
				} else typeof a == "function" && (n === "formAction" ? (t !== "input" && Pd(e, t, "name", i.name, i, null), Pd(e, t, "formEncType", i.formEncType, i, null), Pd(e, t, "formMethod", i.formMethod, i, null), Pd(e, t, "formTarget", i.formTarget, i, null)) : (Pd(e, t, "encType", i.encType, i, null), Pd(e, t, "method", i.method, i, null), Pd(e, t, "target", i.target, i, null)));
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
				r != null && Z("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Z("scrollend", e);
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
				Z("beforetoggle", e), Z("toggle", e), Ct(e, "popover", r);
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
	function Q(e, t, n, r, i, a) {
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
				r != null && Z("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Z("scrollend", e);
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
				Z("error", e), Z("load", e);
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
						default: Pd(e, t, a, o, n, null);
					}
				}
				i && Pd(e, t, "srcSet", n.srcSet, n, null), r && Pd(e, t, "src", n.src, n, null);
				return;
			case "input":
				Z("invalid", e);
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
						default: Pd(e, t, r, d, n, null);
					}
				}
				Ft(e, a, c, l, u, o, i, !1);
				return;
			case "select":
				for (i in Z("invalid", e), r = o = a = null, n) if (n.hasOwnProperty(i) && (c = n[i], c != null)) switch (i) {
					case "value":
						a = c;
						break;
					case "defaultValue":
						o = c;
						break;
					case "multiple": r = c;
					default: Pd(e, t, i, c, n, null);
				}
				t = a, n = o, e.multiple = !!r, t == null ? n != null && Lt(e, !!r, n, !0) : Lt(e, !!r, t, !1);
				return;
			case "textarea":
				for (o in Z("invalid", e), a = i = r = null, n) if (n.hasOwnProperty(o) && (c = n[o], c != null)) switch (o) {
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
					default: Pd(e, t, o, c, n, null);
				}
				zt(e, r, i, a);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: Pd(e, t, l, r, n, null);
				}
				return;
			case "dialog":
				Z("beforetoggle", e), Z("toggle", e), Z("cancel", e), Z("close", e);
				break;
			case "iframe":
			case "object":
				Z("load", e);
				break;
			case "video":
			case "audio":
				for (r = 0; r < vd.length; r++) Z(vd[r], e);
				break;
			case "image":
				Z("error", e), Z("load", e);
				break;
			case "details":
				Z("toggle", e);
				break;
			case "embed":
			case "source":
			case "link": Z("error", e), Z("load", e);
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
					default: Pd(e, t, u, r, n, null);
				}
				return;
			default: if (Wt(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && Q(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && Pd(e, t, c, r, n, null));
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
						default: r.hasOwnProperty(m) || Pd(e, t, m, null, r, f);
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
						default: m !== f && Pd(e, t, p, m, r, f);
					}
				}
				Pt(e, o, c, l, u, d, a, i);
				return;
			case "select":
				for (a in m = o = c = p = null, n) if (l = n[a], n.hasOwnProperty(a) && l != null) switch (a) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(a) || Pd(e, t, a, null, r, l);
				}
				for (i in r) if (a = r[i], l = n[i], r.hasOwnProperty(i) && (a != null || l != null)) switch (i) {
					case "value":
						p = a;
						break;
					case "defaultValue":
						c = a;
						break;
					case "multiple": o = a;
					default: a !== l && Pd(e, t, i, a, r, l);
				}
				t = c, n = o, r = m, p == null ? !!r != !!n && (t == null ? Lt(e, !!n, n ? [] : "", !1) : Lt(e, !!n, t, !0)) : Lt(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (i = n[c], n.hasOwnProperty(c) && i != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: Pd(e, t, c, null, r, i);
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
					default: i !== a && Pd(e, t, o, i, r, a);
				}
				Rt(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: Pd(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: Pd(e, t, l, p, r, m);
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
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && Pd(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(s(137, t));
						break;
					default: Pd(e, t, u, p, r, m);
				}
				return;
			default: if (Wt(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && Q(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || Q(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && Pd(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || Pd(e, t, f, p, r, m);
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
		var e = vf.f(), t = bu();
		return e || t;
	}
	function bf(e) {
		var t = dt(e);
		t !== null && t.tag === 5 && t.type === "form" ? Ss(t) : vf.r(e);
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
					a = $(e);
					break;
				case "script": a = Pf(e);
			}
			hf.has(a) || (e = h({
				rel: "preload",
				href: t === "image" && n && n.imageSrcSet ? void 0 : e,
				as: t
			}, n), hf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(jf(a)) || t === "script" && r.querySelector(Ff(a)) || (t = r.createElement("link"), Fd(t, "link", e), mt(t), r.head.appendChild(t)));
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
				case "script": a = Pf(e);
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
					case "script": if (n.querySelector(Ff(a))) return;
				}
				r = n.createElement("link"), Fd(r, "link", e), mt(r), n.head.appendChild(r);
			}
		}
	}
	function Df(e, t, n) {
		vf.S(e, t, n);
		var r = xf;
		if (r && e) {
			var i = pt(r).hoistableStyles, a = $(e);
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
					}, n), (n = hf.get(a)) && Rf(e, n);
					var c = o = r.createElement("link");
					mt(c), Fd(c, "link", e), c._p = new Promise(function(e, t) {
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
	function Of(e, t) {
		vf.X(e, t);
		var n = xf;
		if (n && e) {
			var r = pt(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
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
			var r = pt(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
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
		var i = (i = ae.current) ? _f(i) : null;
		if (!i) throw Error(s(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = $(n.href), n = pt(i).hoistableStyles, r = n.get(t), r || (r = {
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
					e = $(n.href);
					var a = pt(i).hoistableStyles, o = a.get(e);
					if (o || (i = i.ownerDocument || i, o = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, a.set(e, o), (a = i.querySelector(jf(e))) && !a._p && (o.instance = a, o.state.loading = 5), hf.has(e) || (n = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, hf.set(e, n), a || Nf(i, e, n, o.state))), t && r === null) throw Error(s(528, ""));
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
	function $(e) {
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
		}), Fd(t, "link", n), mt(t), e.head.appendChild(t));
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
				return r = (e.ownerDocument || e).createElement("style"), mt(r), Fd(r, "style", i), Lf(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = $(n.href);
				var a = e.querySelector(jf(i));
				if (a) return t.state.loading |= 4, t.instance = a, mt(a), a;
				r = Mf(n), (i = hf.get(i)) && Rf(r, i), a = (e.ownerDocument || e).createElement("link"), mt(a);
				var o = a;
				return o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Fd(a, "link", r), t.state.loading |= 4, Lf(a, n.precedence, e), t.instance = a;
			case "script": return a = Pf(n.src), (i = e.querySelector(Ff(a))) ? (t.instance = i, mt(i), i) : (r = n, (i = hf.get(a)) && (r = h({}, n), zf(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), mt(i), Fd(i, "link", r), e.head.appendChild(i), t.instance = i);
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
				var i = $(r.href), a = t.querySelector(jf(i));
				if (a) {
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Jf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, mt(a);
					return;
				}
				a = t.ownerDocument || t, r = Mf(r), (i = hf.get(i)) && Rf(r, i), a = a.createElement("link"), mt(a);
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
		i = tp(i), r.context === null ? r.context = i : r.pendingContext = i, r = Ia(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = La(e, r, t), n !== null && (hu(n, e, t), Ra(n, e, t));
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
			t !== null && hu(t, e, 67108864), ip(e, 67108864);
		}
	}
	function op(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = pu();
			t = Xe(t);
			var n = Zr(e, t);
			n !== null && hu(n, e, t), ip(e, t);
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
			if (i === null) Td(e, t, r, fp, n), Cp(e, r);
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
										var c = 1 << 31 - Me(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									id(a), !(Il & 6) && (tu = xe() + 500, ad(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Zr(a, 2), s !== null && hu(s, a, 2), bu(), ip(a, 2);
					}
					if (a = dp(r), a === null && Td(e, t, r, fp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Td(e, t, r, null, n);
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
				a !== null && (e.splice(t, 3), t -= 3, bs(a, {
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
		np(n, pu(), e, t, null, null);
	}, Ip.prototype.unmount = Fp.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			np(e.current, 2, null, e, null, null), bu(), t[rt] = null;
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
			Ae = zp.inject(Rp), U = zp;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!c(e)) throw Error(s(299));
		var n = !1, r = "", i = Us, a = Ws, o = Gs;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = ep(e, 1, !1, null, null, n, r, null, i, a, o, Pp), e[rt] = t.current, Cd(e), new Fp(t);
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
}, m = (e) => e === "hearts" || e === "diamonds", h = {
	HOLD_MS: 220,
	TAP_MOVE_PX: 12,
	SWIPE_UP_PX: 28,
	SWIPE_FLICK_PX: 36,
	SCROLL_CANCEL_PX: 48
};
function g(e, t) {
	let n = Math.abs(e), r = Math.abs(t);
	return t <= -h.SWIPE_UP_PX && r > n;
}
function _(e, t) {
	let n = Math.abs(e), r = Math.abs(t);
	return t > 0 && r > h.SCROLL_CANCEL_PX && r > n;
}
function v(e) {
	return e.current ? (e.current = !1, !0) : !1;
}
function y(e, t, n) {
	return {
		pointerId: e,
		startX: t,
		startY: n,
		fired: !1,
		swipeIntent: !1,
		scrollCancelled: !1
	};
}
function b(e, t) {
	return _(e, t) ? "scroll-cancel" : g(e, t) || Math.hypot(e, t) >= h.SWIPE_FLICK_PX ? "swipe" : "none";
}
function x(e, t, n) {
	return n.fired ? "none" : n.scrollCancelled || _(e, t) ? "cancel" : n.swipeIntent || g(e, t) ? "swipe-up" : Math.hypot(e, t) >= h.SWIPE_FLICK_PX ? "swipe-flick" : "tap";
}
//#endregion
//#region node_modules/react/cjs/react-jsx-runtime.production.js
var S = /* @__PURE__ */ e(((e) => {
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
})), C = (/* @__PURE__ */ e(((e, t) => {
	t.exports = S();
})))();
function w({ card: e, faceDown: t = !1, size: n = "md", state: r = "default", badge: i, onClick: a, onPlayClick: o, suppressNextClickRef: s, pointerHandlers: c, pressed: l = !1, playing: u = !1, playable: p = !1, showPlayableHint: h = !0, illegalShake: g = !1, illegalFlash: _ = !1, disabled: y = !1, ariaLabel: b, "data-testid": x, "data-card-index": S, "data-playable": w }) {
	let T = !!c, E = (T || typeof a == "function") && !y, D = [
		"pcard",
		`pcard--${n}`,
		`pcard--${r}`,
		E ? "pcard--interactive" : "",
		p && h ? "pcard--playable" : "",
		l ? "pcard--pressed" : "",
		u ? "pcard--playing" : "",
		g ? "pcard--illegal-shake" : "",
		_ ? "pcard--illegal-flash" : "",
		y ? "pcard--disabled" : ""
	].filter(Boolean).join(" ");
	if (t || !e) return /* @__PURE__ */ (0, C.jsx)("div", {
		className: `${D} pcard--back`,
		"aria-label": "Face-down card",
		role: "img",
		children: /* @__PURE__ */ (0, C.jsxs)("span", {
			className: "pcard__surface pcard__surface--back",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, C.jsx)("span", { className: "pcard__back-pattern" }), /* @__PURE__ */ (0, C.jsx)("span", {
				className: "pcard__back-emblem",
				"aria-hidden": "true"
			})]
		})
	});
	let O = m(e.suit), k = d[e.suit], A = b ?? `${e.rank} of ${f[e.suit]}`, j = `pcard--suit-${e.suit}`, M = /* @__PURE__ */ (0, C.jsxs)("span", {
		className: "pcard__surface",
		"aria-hidden": "true",
		children: [
			i && /* @__PURE__ */ (0, C.jsx)("span", {
				className: "pcard__badge",
				children: i
			}),
			/* @__PURE__ */ (0, C.jsxs)("span", {
				className: "pcard__corner pcard__corner--tl",
				children: [/* @__PURE__ */ (0, C.jsx)("span", {
					className: "pcard__rank",
					children: e.rank
				}), /* @__PURE__ */ (0, C.jsx)("span", {
					className: "pcard__suit",
					children: k
				})]
			}),
			/* @__PURE__ */ (0, C.jsx)("span", {
				className: "pcard__center",
				children: k
			}),
			/* @__PURE__ */ (0, C.jsxs)("span", {
				className: "pcard__corner pcard__corner--br",
				children: [/* @__PURE__ */ (0, C.jsx)("span", {
					className: "pcard__rank",
					children: e.rank
				}), /* @__PURE__ */ (0, C.jsx)("span", {
					className: "pcard__suit",
					children: k
				})]
			})
		]
	});
	return E ? /* @__PURE__ */ (0, C.jsx)("button", {
		type: "button",
		className: `${D} ${O ? "pcard--red" : "pcard--black"} ${j}`,
		onClick: T && o ? (e) => {
			if (s && v(s)) {
				e.preventDefault();
				return;
			}
			e.preventDefault(), o();
		} : T ? void 0 : a,
		disabled: y,
		"aria-disabled": y || void 0,
		"aria-busy": u || void 0,
		"aria-label": A,
		"data-testid": x,
		"data-card-index": S,
		"data-playable": w,
		...c,
		children: M
	}) : /* @__PURE__ */ (0, C.jsx)("div", {
		className: `${D} ${O ? "pcard--red" : "pcard--black"} ${j}`,
		role: "img",
		"aria-label": A,
		"aria-disabled": y || void 0,
		"data-testid": x,
		"data-card-index": S,
		"data-playable": w,
		children: M
	});
}
//#endregion
//#region src/components/useCardGestureHandlers.ts
function T({ disabled: e = !1, mode: t, onPlay: n, onSelect: r, onPeekStart: i, onPeekEnd: a, onPressChange: o }) {
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
	let c = (0, l.useRef)(null), u = (0, l.useRef)(null), d = (0, l.useRef)(!1), f = (0, l.useRef)(!1), p = () => {
		u.current != null && (window.clearTimeout(u.current), u.current = null);
	}, m = () => {
		d.current && (d.current = !1, s.current.onPeekEnd?.());
	}, g = () => {
		f.current = !0;
	}, v = (e) => {
		let t = c.current;
		!t || t.fired || (t.fired = !0, p(), m(), g(), s.current.onPlay?.());
	}, S = () => {
		let e = c.current;
		!e || e.fired || (e.fired = !0, p(), m(), g(), s.current.onSelect?.());
	};
	return (0, l.useMemo)(() => {
		let e = (e, t) => {
			if (e instanceof HTMLElement && e.hasPointerCapture(t)) try {
				e.releasePointerCapture(t);
			} catch {}
		}, t = (t) => {
			p();
			let n = c.current;
			n && e(t, n.pointerId), c.current = null, s.current.onPressChange?.(!1), m();
		};
		return {
			handlers: {
				onPointerDown(e) {
					let t = s.current;
					if (!(t.disabled || t.mode === "none" || e.button !== 0)) {
						if (p(), c.current = y(e.pointerId, e.clientX, e.clientY), d.current = !1, t.onPressChange?.(!0), e.currentTarget.setPointerCapture(e.pointerId), (t.mode === "play" || t.mode === "draw-select") && e.preventDefault(), t.mode === "peek") {
							d.current = !0, t.onPeekStart?.();
							return;
						}
						t.mode === "play" && (u.current = window.setTimeout(() => {
							u.current = null, v("hold");
						}, h.HOLD_MS));
					}
				},
				onPointerMove(e) {
					let t = c.current, n = s.current;
					if (!t || t.pointerId !== e.pointerId || n.disabled) return;
					let r = e.clientX - t.startX, i = e.clientY - t.startY;
					if (n.mode === "play" && !t.fired) {
						let e = b(r, i);
						if (e === "scroll-cancel") {
							t.scrollCancelled = !0, p();
							return;
						}
						e === "swipe" && (t.swipeIntent = !0, p());
					} else n.mode === "draw-select" && _(r, i) && (t.scrollCancelled = !0);
				},
				onPointerUp(t) {
					let n = c.current, r = s.current;
					if (!n || n.pointerId !== t.pointerId) return;
					let i = t.clientX - n.startX, a = t.clientY - n.startY;
					if (p(), !n.fired) if (r.mode === "play") {
						let e = x(i, a, n);
						e === "tap" ? v("tap") : e === "swipe-up" ? v("swipe-up") : e === "swipe-flick" && v("swipe-flick");
					} else r.mode === "draw-select" && !n.scrollCancelled && !_(i, a) && S();
					e(t.currentTarget, t.pointerId), c.current = null, r.onPressChange?.(!1), m();
				},
				onPointerCancel(e) {
					let n = c.current;
					!n || n.pointerId !== e.pointerId || t(e.currentTarget);
				},
				onPointerLeave(e) {
					let n = c.current, r = s.current;
					!n || n.pointerId !== e.pointerId || r.mode === "play" || r.mode === "draw-select" || t(e.currentTarget);
				}
			},
			suppressNextClickRef: f
		};
	}, []);
}
//#endregion
//#region src/game/cardUtils.ts
function E(e) {
	return `${e.rank}:${e.suit}`;
}
function D(e) {
	return p[e.rank];
}
function O(e, t) {
	return e.suit === t;
}
function k(e, t) {
	return e.filter((e) => e.suit === t);
}
//#endregion
//#region src/components/handLayout.ts
function A(e, t, n, r) {
	let i = r?.minVisiblePx ?? 30, a = r?.maxGapPx ?? 6, o = Math.max(0, t), s = Math.max(0, e), c = Math.max(1, n);
	if (o <= 1 || s <= 0) return 0;
	let l = Math.max(8, c - i), u = c + a, d = (s - c) / (o - 1);
	return Math.round(Math.min(u, Math.max(l, d)) - c);
}
function j(e) {
	return e === "lg" ? 96 : e === "md" ? 72 : 52;
}
//#endregion
//#region src/components/Hand.tsx
var M = (e) => E(e);
function ee({ card: e, index: t, size: n, state: r, badge: i, cardTestId: a, cardInteraction: o, onCardClick: s, onCardPeek: c, peekActive: u, slotClassFor: d, dealSeatPlayerId: f, style: p }) {
	let [m, h] = (0, l.useState)(!1), g = o, _ = g?.mode === "play", v = g?.mode === "draw-select", y = g?.mode === "peek", b = g?.isMyTurn === !0, x = !g?.legalPlayIndices || g.legalPlayIndices.includes(t), S = _ && b && x && !g?.busy, E = _ && !b && !!g?.allowPlayPreselect && x && !g?.busy, D = g?.playingIndex === t, O = _ && b && !x && !g?.busy && !D, k = v && r === "draw-selected", A = v && r === "draw-recommended", j = r === "play-recommended", M = !!g?.busy || D || _ && !b && !E || v && !b, ee = M || _ && !x && !E || v && !b, { handlers: te, suppressNextClickRef: ne } = T({
		disabled: M || !S && !E && !v && !y && !O,
		mode: O ? "draw-select" : g?.mode ?? "none",
		onPlay: S || E ? () => g?.onPlayCard?.(t) : void 0,
		onSelect: v && b ? () => g?.onSelectCard?.(t) : O ? () => g?.onIllegalPlay?.(t) : void 0,
		onPeekStart: y ? () => c?.(t) : void 0,
		onPeekEnd: y ? () => c?.(null) : void 0,
		onPressChange: h
	}), N = !!g && (g?.mode !== "none" || O), P = _ && b ? S ? a : "play-button-disabled" : a;
	return /* @__PURE__ */ (0, C.jsx)("div", {
		className: [
			"hand__slot",
			u ? "hand__slot--peek" : "",
			k ? "hand__slot--draw-selected" : "",
			A ? "hand__slot--draw-recommended" : "",
			j ? "hand__slot--play-recommended" : "",
			d?.(e, t) ?? ""
		].filter(Boolean).join(" "),
		style: p,
		"aria-selected": k || A ? !0 : void 0,
		"data-draw-hint": A ? "suggested" : k ? "selected" : void 0,
		"data-trick-play-origin-active": g?.playingIndex === t && g.trickPlayOriginPlayerId ? g.trickPlayOriginPlayerId : void 0,
		"data-deal-seat": f ?? void 0,
		"data-deal-round": f == null ? void 0 : t,
		children: /* @__PURE__ */ (0, C.jsx)(w, {
			card: e,
			size: n,
			state: ee && _ && !O ? "disabled" : r,
			badge: i,
			onClick: !N && s ? () => s(e, t) : void 0,
			onPlayClick: N && (S || E) ? () => g?.onPlayCard?.(t) : void 0,
			suppressNextClickRef: N ? ne : void 0,
			pointerHandlers: N ? te : void 0,
			pressed: m,
			playing: D,
			playable: S,
			illegalShake: g?.illegalShakeIndex === t,
			illegalFlash: g?.illegalFlashIndex === t,
			showPlayableHint: g?.showPlayableHint !== !1,
			disabled: M && (_ || v) && !O,
			"data-testid": P,
			"data-card-index": t,
			"data-playable": _ ? S ? "true" : "false" : void 0
		})
	});
}
function te({ cards: e, size: t = "md", stateFor: n, badgeFor: r, onCardClick: i, onCardPeek: a, peekIndex: o = null, fan: s = !1, cardTestId: c, cardInteraction: u, slotClassFor: d, dealSeatPlayerId: f = null }) {
	let p = (0, l.useRef)(null);
	return (0, l.useLayoutEffect)(() => {
		if (!s || typeof window > "u") return;
		let n = p.current;
		if (!n) return;
		let r = j(t), i = () => {
			let t = A(n.clientWidth, e.length, r);
			n.style.setProperty("--hand-fan-overlap", `${t}px`), n.style.setProperty("--hand-card-w", `${r}px`);
		}, a = new ResizeObserver(i);
		return a.observe(n), i(), () => a.disconnect();
	}, [
		s,
		e.length,
		t
	]), /* @__PURE__ */ (0, C.jsx)("div", {
		ref: p,
		className: `hand ${s ? "hand--fan" : ""} ${u ? "hand--pointer" : ""}`,
		style: s ? { "--hand-count": e.length } : void 0,
		children: /* @__PURE__ */ (0, C.jsx)("div", {
			className: "hand__fan-stage",
			children: e.map((e, l) => /* @__PURE__ */ (0, C.jsx)(ee, {
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
var ne = "power3.out", N = "power2.inOut", P = "back.out(1.35)", re = {
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
function ie(e = I()) {
	return e ? .35 : 1;
}
function F(e, t = I()) {
	return Math.max(.12, e * ie(t));
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
}, B = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, ae, V, oe, se = 1e8, H = 1 / se, ce = Math.PI * 2, le = ce / 4, ue = 0, de = Math.sqrt, fe = Math.cos, pe = Math.sin, me = function(e) {
	return typeof e == "string";
}, he = function(e) {
	return typeof e == "function";
}, ge = function(e) {
	return typeof e == "number";
}, _e = function(e) {
	return e === void 0;
}, ve = function(e) {
	return typeof e == "object";
}, ye = function(e) {
	return e !== !1;
}, be = function() {
	return typeof window < "u";
}, xe = function(e) {
	return he(e) || me(e);
}, Se = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, Ce = Array.isArray, we = /(?:-?\.?\d|\.)+/gi, Te = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, Ee = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, De = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, Oe = /[+-]=-?[.\d]+/, ke = /[^,'"\[\]\s]+/gi, Ae = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, U, je, Me, Ne, Pe = {}, Fe = {}, Ie, Le = function(e) {
	return (Fe = mt(e, Pe)) && Pr;
}, Re = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, ze = function(e, t) {
	return !t && console.warn(e);
}, Be = function(e, t) {
	return e && (Pe[e] = t) && Fe && (Fe[e] = t) || Pe;
}, Ve = function() {
	return 0;
}, He = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, Ue = {
	suppressEvents: !0,
	kill: !1
}, We = { suppressEvents: !0 }, Ge = {}, Ke = [], qe = {}, Je, Ye = {}, Xe = {}, Ze = 30, Qe = [], $e = "", et = function(e) {
	var t = e[0], n, r;
	if (ve(t) || he(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = Qe.length; r-- && !Qe[r].targetTest(t););
		n = Qe[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new Wn(e[r], n))) || e.splice(r, 1);
	return e;
}, tt = function(e) {
	return e._gsap || et(Zt(e))[0]._gsap;
}, nt = function(e, t, n) {
	return (n = e[t]) && he(n) ? e[t]() : _e(n) && e.getAttribute && e.getAttribute(t) || n;
}, rt = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, it = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, at = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, ot = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, st = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, ct = function() {
	var e = Ke.length, t = Ke.slice(0), n, r;
	for (qe = {}, Ke.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, lt = function(e, t, n, r) {
	Ke.length && !V && ct(), e.render(t, n, r || V && t < 0 && (e._initted || e._startAt)), Ke.length && !V && ct();
}, ut = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(ke).length < 2 ? t : me(e) ? e.trim() : e;
}, dt = function(e) {
	return e;
}, ft = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, pt = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, mt = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, ht = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = ve(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, gt = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, _t = function(e) {
	var t = e.parent || U, n = e.keyframes ? pt(Ce(e.keyframes)) : ft;
	if (ye(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, vt = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, yt = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, bt = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, xt = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, St = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, Ct = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, wt = function(e, t, n, r) {
	return e._startAt && (V ? e._startAt.revert(Ue) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, Tt = function e(t) {
	return !t || t._ts && e(t.parent);
}, Et = function(e) {
	return e._repeat ? Dt(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, Dt = function(e, t) {
	var n = Math.floor(e = at(e / t));
	return e && n === e ? n - 1 : n;
}, Ot = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, kt = function(e) {
	return e._end = at(e._start + (e._tDur / Math.abs(e._ts || e._rts || H) || 0));
}, At = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = at(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), kt(e), n._dirty || St(n, e)), e;
}, jt = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = Ot(e.rawTime(), t), (!t._dur || Gt(0, t.totalDuration(), n) - t._tTime > H) && t.render(n, !0)), St(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -H;
	}
}, Mt = function(e, t, n, r) {
	return t.parent && xt(t), t._start = at((ge(n) ? n : n || e !== U ? Ht(e, n, t) : e._time) + t._delay), t._end = at(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), yt(e, t, "_first", "_last", e._sort ? "_start" : 0), It(t) || (e._recent = t), r || jt(e, t), e._ts < 0 && At(e, e._tTime), e;
}, Nt = function(e, t) {
	return (Pe.ScrollTrigger || Re("scrollTrigger", t)) && Pe.ScrollTrigger.create(t, e);
}, Pt = function(e, t, n, r, i) {
	if ($n(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !V && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && Je !== An.frame) return Ke.push(e), e._lazy = [i, r], 1;
}, Ft = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, It = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, Lt = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && Ft(e) && !(!e._initted && It(e)) || (e._ts < 0 || e._dp._ts < 0) && !It(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = Gt(0, e._tDur, t), l = Dt(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== Dt(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || V || r || e._zTime === H || !t && e._zTime) {
		if (!e._initted && Pt(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? H : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && wt(e, t, n, !0), e._onUpdate && !n && hn(e, "onUpdate"), s && e._repeat && !n && e.parent && hn(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && xt(e, 1), !n && !V && (hn(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, Rt = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, zt = function(e, t, n, r) {
	var i = e._repeat, a = at(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : at(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && At(e, e._tTime = e._tDur * o), e.parent && kt(e), n || St(e.parent, e), e;
}, Bt = function(e) {
	return e instanceof Kn ? St(e) : zt(e, e._dur);
}, Vt = {
	_start: 0,
	endTime: Ve,
	totalDuration: Ve
}, Ht = function e(t, n, r) {
	var i = t.labels, a = t._recent || Vt, o = t.duration() >= se ? a.endTime(!1) : t._dur, s, c, l;
	return me(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (Ce(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, Ut = function(e, t, n) {
	var r = ge(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = ye(s.vars.inherit) && s.parent;
		a.immediateRender = ye(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new or(t[0], a, t[i + 1]);
}, Wt = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, Gt = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, Kt = function(e, t) {
	return !me(e) || !(t = Ae.exec(e)) ? "" : t[1];
}, qt = function(e, t, n) {
	return Wt(n, function(n) {
		return Gt(e, t, n);
	});
}, Jt = [].slice, Yt = function(e, t) {
	return e && ve(e) && "length" in e && (!t && !e.length || e.length - 1 in e && ve(e[0])) && !e.nodeType && e !== je;
}, Xt = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return me(e) && !t || Yt(e, 1) ? (r = n).push.apply(r, Zt(e)) : n.push(e);
	}) || n;
}, Zt = function(e, t, n) {
	return oe && !t && oe.selector ? oe.selector(e) : me(e) && !n && (Me || !jn()) ? Jt.call((t || Ne).querySelectorAll(e), 0) : Ce(e) ? Xt(e, n) : Yt(e) ? Jt.call(e, 0) : e ? [e] : [];
}, Qt = function(e) {
	return e = Zt(e)[0] || ze("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return Zt(t, n.querySelectorAll ? n : n === e ? ze("Invalid scope") || Ne.createElement("div") : e);
	};
}, $t = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, en = function(e) {
	if (he(e)) return e;
	var t = ve(e) ? e : { each: e }, n = zn(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return me(r) ? l = u = {
		center: .5,
		edges: .5,
		end: 1
	}[r] || 0 : !o && s && (l = r[0], u = r[1]), function(e, o, d) {
		var f = (d || t).length, p = a[f], m, h, g, _, v, y, b, x, S;
		if (!p) {
			if (S = t.grid === "auto" ? 0 : (t.grid || [1, se])[1], !S) {
				for (b = -se; b < (b = d[S++].getBoundingClientRect().left) && S < f;);
				S < f && S--;
			}
			for (p = a[f] = [], m = s ? Math.min(S, f) * l - .5 : r % S, h = S === se ? 0 : s ? f * u / S - .5 : r / S | 0, b = 0, x = se, y = 0; y < f; y++) g = y % S - m, _ = h - (y / S | 0), p[y] = v = c ? Math.abs(c === "y" ? _ : g) : de(g * g + _ * _), v > b && (b = v), v < x && (x = v);
			r === "random" && $t(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = Kt(t.amount || t.each) || 0, n = n && f < 0 ? Ln(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, at(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, tn = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = at(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (ge(n) ? 0 : Kt(n));
	};
}, nn = function(e, t) {
	var n = Ce(e), r, i;
	return !n && ve(e) && (r = n = e.radius || se, e.values ? (e = Zt(e.values), (i = !ge(e[0])) && (r *= r)) : e = tn(e.increment)), Wt(t, n ? he(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = se, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || ge(t) ? s : s + Kt(t);
	} : tn(e));
}, rn = function(e, t, n, r) {
	return Wt(Ce(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return Ce(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, an = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, on = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || Kt(n));
	};
}, sn = function(e, t, n) {
	return fn(e, t, 0, 1, n);
}, cn = function(e, t, n) {
	return Wt(n, function(n) {
		return e[~~t(n)];
	});
}, ln = function e(t, n, r) {
	var i = n - t;
	return Ce(t) ? cn(t, e(0, t.length), n) : Wt(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, un = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return Ce(t) ? cn(t, e(0, t.length - 1), n) : Wt(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, dn = function(e) {
	for (var t = 0, n = "", r, i, a, o; ~(r = e.indexOf("random(", t));) a = e.indexOf(")", r), o = e.charAt(r + 7) === "[", i = e.substr(r + 7, a - r - 7).match(o ? ke : we), n += e.substr(t, r - t) + rn(o ? i : +i[0], o ? 0 : +i[1], +i[2] || 1e-5), t = a + 1;
	return n + e.substr(t, e.length - t);
}, fn = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return Wt(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, pn = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = me(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (Ce(t) && !Ce(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = mt(Ce(t) ? [] : {}, t));
		if (!u) {
			for (c in n) Jn.call(s, t, c, "get", n[c]);
			a = function(e) {
				return hr(e, s) || (o ? t.p : t);
			};
		}
	}
	return Wt(r, a);
}, mn = function(e, t, n) {
	var r = e.labels, i = se, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, hn = function(e, t, n) {
	var r = e.vars, i = r[t], a = oe, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && Ke.length && ct(), o && (oe = o), l = s ? i.apply(c, s) : i.call(c), oe = a, l;
}, gn = function(e) {
	return xt(e), e.scrollTrigger && e.scrollTrigger.kill(!!V), e.progress() < 1 && hn(e, "onInterrupt"), e;
}, _n, vn = [], yn = function(e) {
	if (e) if (e = !e.name && e.default || e, be() || e.headless) {
		var t = e.name, n = he(e), r = t && !n && e.init ? function() {
			this._props = [];
		} : e, i = {
			init: Ve,
			render: hr,
			add: Jn,
			kill: _r,
			modifier: gr,
			rawVars: 0
		}, a = {
			targetTest: 0,
			get: 0,
			getSetter: dr,
			aliases: {},
			register: 0
		};
		if (jn(), e !== r) {
			if (Ye[t]) return;
			ft(r, ft(gt(e, i), a)), mt(r.prototype, mt(i, gt(e, a))), Ye[r.prop = t] = r, e.targetTest && (Qe.push(r), Ge[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
		}
		Be(t, r), e.register && e.register(Pr, r, br);
	} else vn.push(e);
}, bn = 255, xn = {
	aqua: [
		0,
		bn,
		bn
	],
	lime: [
		0,
		bn,
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
		bn
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		bn,
		bn,
		bn
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		bn,
		bn,
		0
	],
	orange: [
		bn,
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
		bn,
		0,
		0
	],
	pink: [
		bn,
		192,
		203
	],
	cyan: [
		0,
		bn,
		bn
	],
	transparent: [
		bn,
		bn,
		bn,
		0
	]
}, Sn = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * bn + .5 | 0;
}, Cn = function(e, t, n) {
	var r = e ? ge(e) ? [
		e >> 16,
		e >> 8 & bn,
		e & bn
	] : 0 : xn.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), xn[e]) r = xn[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & bn,
				r & bn,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & bn,
				e & bn
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(we), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = Sn(s + 1 / 3, i, a), r[1] = Sn(s, i, a), r[2] = Sn(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(Te), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(we) || xn.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / bn, a = r[1] / bn, o = r[2] / bn, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, wn = function(e) {
	var t = [], n = [], r = -1;
	return e.split(En).forEach(function(e) {
		var i = e.match(Ee) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, Tn = function(e, t, n) {
	var r = "", i = (e + r).match(En), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = Cn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = wn(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(En, "1").split(Ee), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(En), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, En = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in xn) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), Dn = /hsl[a]?\(/, On = function(e) {
	var t = e.join(" "), n;
	if (En.lastIndex = 0, En.test(t)) return n = Dn.test(t), e[1] = Tn(e[1], n), e[0] = Tn(e[0], n, wn(e[1])), !0;
}, kn, An = function() {
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
			Ie && (!Me && be() && (je = Me = window, Ne = je.document || {}, Pe.gsap = Pr, (je.gsapVersions ||= []).push(Pr.version), Le(Fe || je.GreenSockGlobals || !je.gsap && je || {}), vn.forEach(yn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, kn = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), kn = 0, l = Ve;
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
			return d.remove(e), s[n ? "unshift" : "push"](r), jn(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), jn = function() {
	return !kn && An.wake();
}, W = {}, Mn = /^[\d.\-M][\d.\-,\s]/, Nn = /["']/g, Pn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(Nn, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, Fn = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, In = function(e) {
	var t = (e + "").split("("), n = W[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [Pn(t[1])] : Fn(e).split(",").map(ut)) : W._CE && Mn.test(e) ? W._CE("", e) : n;
}, Ln = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, Rn = function e(t, n) {
	for (var r = t._first, i; r;) r instanceof Kn ? e(r, n) : r.vars.yoyoEase && (!r._yoyo || !r._repeat) && r._yoyo !== n && (r.timeline ? e(r.timeline, n) : (i = r._ease, r._ease = r._yEase, r._yEase = i, r._yoyo = n)), r = r._next;
}, zn = function(e, t) {
	return e && (he(e) ? e : W[e] || In(e)) || t;
}, Bn = function(e, t, n, r) {
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
	return rt(e, function(e) {
		for (var t in W[e] = Pe[e] = i, W[a = e.toLowerCase()] = n, i) W[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = W[e + "." + t] = i[t];
	}), i;
}, Vn = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, Hn = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / ce * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * pe((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : Vn(s);
	return a = ce / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, Un = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : Vn(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
rt("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	Bn(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), W.Linear.easeNone = W.none = W.Linear.easeIn, Bn("Elastic", Hn("in"), Hn("out"), Hn()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	Bn("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), Bn("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), Bn("Circ", function(e) {
	return -(de(1 - e * e) - 1);
}), Bn("Sine", function(e) {
	return e === 1 ? 1 : -fe(e * le) + 1;
}), Bn("Back", Un("in"), Un("out"), Un()), W.SteppedEase = W.steps = Pe.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - H;
	return function(e) {
		return ((r * Gt(0, a, e) | 0) + i) * n;
	};
} }, B.ease = W["quad.out"], rt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return $e += e + "," + e + "Params,";
});
var Wn = function(e, t) {
	this.id = ue++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : nt, this.set = t ? t.getSetter : dr;
}, Gn = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, zt(this, +e.duration, 1, 1), this.data = e.data, oe && (this._ctx = oe, oe.data.push(this)), kn || An.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, zt(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (jn(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (At(this, e), !n._dp || n.parent || jt(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && Mt(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === H || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), lt(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + Et(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + Et(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? Dt(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -H ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? Ot(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -H ? 0 : this._rts, this.totalTime(Gt(-Math.abs(this._delay), this._tDur, n), t !== !1), kt(this), Ct(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (jn(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== H && (this._tTime -= H)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = e;
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && Mt(t, this, e - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (ye(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? Ot(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = We);
		var t = V;
		return V = e, (this._initted || this._startAt) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), V = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, Bt(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, Bt(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(Ht(this, e), ye(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, ye(t)), this._dur || (this._zTime = -H), this;
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
			var r = he(e) ? e : dt, i = function() {
				var e = t.then;
				t.then = null, he(r) && (r = r(t)) && (r.then || r === t) && (t.then = e), n(r), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? i() : t._prom = i;
		});
	}, t.kill = function() {
		gn(this);
	}, e;
}();
ft(Gn.prototype, {
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
var Kn = /*#__PURE__*/ function(e) {
	R(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = ye(t.sortChildren), U && Mt(t.parent || U, L(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && Nt(L(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return Ut(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return Ut(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return Ut(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, _t(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new or(e, t, Ht(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return Mt(this, or.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new or(e, n, Ht(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, _t(n).immediateRender = ye(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, _t(r).immediateRender = ye(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : at(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== U && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = at(o % f), o === i ? (d = this._repeat, c = a) : (_ = at(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = Dt(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : at(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && hn(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
					Rn(this, y);
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = Rt(this, at(r), at(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && c && !t && !d && (hn(this, "onStart"), this._tTime !== o)) return this;
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
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || V && (l._initted || l._startAt)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -H : H);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -H)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, kt(this), this.render(e, t, n);
			this._onUpdate && !t && hn(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && xt(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (hn(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (ge(t) || (t = Ht(this, t, e)), !(e instanceof Gn)) {
			if (Ce(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (me(e)) return this.addLabel(e, t);
			if (he(e)) e = or.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : Mt(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -se);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof or ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return me(e) ? this.removeLabel(e) : he(e) ? this.killTweensOf(e) : (e.parent === this && bt(this, e), e === this._recent && (this._recent = this._last), St(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = at(An.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = Ht(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = or.delayedCall(0, t || Ve, n);
		return r.data = "isPause", this._hasPause = 1, Mt(this, r, Ht(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = Ht(this, e); t;) t._start === e && t.data === "isPause" && xt(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) Zn !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = Zt(e), i = this._first, a = ge(t), o; i;) i instanceof or ? st(i._targets, r) && (a ? (!Zn || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = Ht(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = or.to(n, ft({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || H,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && zt(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, ft({ startAt: { time: Ht(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), mn(this, Ht(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), mn(this, Ht(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + H);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		for (var r = this._first, i = this.labels, a; r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return St(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), St(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = se, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, Mt(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += o / n._ts, n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			zt(n, n === U && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (U._ts && (lt(U, Ot(e, U)), Je = An.frame), An.frame >= Ze) {
			Ze += z.autoSleep || 120;
			var t = U._first;
			if ((!t || !t._ts) && z.autoSleep && An._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || An.sleep();
			}
		}
	}, t;
}(Gn);
ft(Kn.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var qn = function(e, t, n, r, i, a, o) {
	var s = new br(this._pt, e, t, 0, 1, mr, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = dn(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(De) || []; u = De.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? ot(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = De.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (Oe.test(r) || g) && (s.e = 0), this._pt = s, s;
}, Jn = function(e, t, n, r, i, a, o, s, c, l) {
	he(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? he(u) ? c ? e[t.indexOf("set") || !he(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = he(u) ? c ? lr : cr : sr, p;
	if (me(r) && (~r.indexOf("random(") && (r = dn(r)), r.charAt(1) === "=" && (p = ot(d, r) + (Kt(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || Qn) return !isNaN(d * r) && r !== "" ? (p = new br(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? pr : fr, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && Re(t, r), qn.call(this, e, t, d, r, f, s || z.stringFilter, c));
}, Yn = function(e, t, n, r, i) {
	if (he(e) && (e = rr(e, i, t, n, r)), !ve(e) || e.style && e.nodeType || Ce(e) || Se(e)) return me(e) ? rr(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = rr(e[o], i, t, n, r);
	return a;
}, Xn = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (Ye[e] && (o = new Ye[e]()).init(i, o.rawVars ? t[e] : Yn(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new br(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== _n)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, Zn, Qn, $n = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !ae, b = t.timeline, x, S, C, w, T, E, D, O, k, A, j, M, ee;
	if (b && (!f || !a) && (a = "none"), t._ease = zn(a, B.ease), t._yEase = d ? Ln(zn(d === !0 ? a : d, B.ease)) : 0, d && t._yoyo && !t._repeat && (d = t._yEase, t._yEase = t._ease, t._ease = d), t._from = !b && !!i.runBackwards, !b || f && !i.stagger) {
		if (O = g[0] ? tt(g[0]).harness : 0, M = O && i[O.prop], x = gt(i, Ge), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? Ue : He), h._lazy = 0), o) {
			if (xt(t._startAt = or.set(g, ft({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && ye(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return hn(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (V || !s && !p) && t._startAt.revert(Ue), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), C = ft({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && ye(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, x), M && (C[O.prop] = M), xt(t._startAt = or.set(g, C)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (V ? t._startAt.revert(Ue) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, H, H);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && ye(c) || c && !m, S = 0; S < g.length; S++) {
			if (T = g[S], D = T._gsap || et(g)[S]._gsap, t._ptLookup[S] = A = {}, qe[D.id] && Ke.length && ct(), j = v === g ? S : v.indexOf(T), O && (k = new O()).init(T, M || x, t, j, v) !== !1 && (t._pt = w = new br(t._pt, T, k.name, 0, 1, k.render, k, 0, k.priority), k._props.forEach(function(e) {
				A[e] = w;
			}), k.priority && (E = 1)), !O || M) for (C in x) Ye[C] && (k = Xn(C, x, t, j, T, v)) ? k.priority && (E = 1) : A[C] = w = Jn.call(t, T, C, "get", x[C], j, v, 0, i.stringFilter);
			t._op && t._op[S] && t.kill(T, t._op[S]), y && t._pt && (Zn = t, U.killTweensOf(T, A, t.globalTime(n)), ee = !t.parent, Zn = 0), t._pt && c && (qe[D.id] = 1);
		}
		E && yr(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !ee, f && n <= 0 && b.render(se, !0, !0);
}, er = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return Qn = 1, e.vars[t] = "+=0", $n(e, o), Qn = 0, s ? ze(t + " not eligible for reset") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e &&= it(n) + Kt(u.e), u.b &&= l.s + Kt(u.b);
}, tr = function(e, t) {
	var n = e[0] ? tt(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = mt({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, nr = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (Ce(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
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
}, rr = function(e, t, n, r, i) {
	return he(e) ? e.call(t, n, r, i) : me(e) && ~e.indexOf("random(") ? dn(e) : e;
}, ir = $e + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", ar = {};
rt(ir + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return ar[e] = 1;
});
var or = /*#__PURE__*/ function(e) {
	R(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : _t(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = o.yoyoEase, g = n.parent || U, _ = (Ce(t) || Se(t) ? ge(t[0]) : "length" in n) ? [t] : Zt(t), v, y, b, x, S, C, w, T;
		if (a._targets = _.length ? et(_) : ze("GSAP target " + t + " not found. https://gsap.com", !z.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || xe(s) || xe(c)) {
			if (n = a.vars, v = a.timeline = new Kn({
				data: "nested",
				defaults: p || {},
				targets: g && g.data === "nested" ? g.vars.targets : _
			}), v.kill(), v.parent = v._dp = L(a), v._start = 0, u || xe(s) || xe(c)) {
				if (x = _.length, w = u && en(u), ve(u)) for (S in u) ~ir.indexOf(S) && (T ||= {}, T[S] = u[S]);
				for (y = 0; y < x; y++) b = gt(n, ar), b.stagger = 0, h && (b.yoyoEase = h), T && mt(b, T), C = _[y], b.duration = +rr(s, L(a), y, C, _), b.delay = (+rr(c, L(a), y, C, _) || 0) - a._delay, !u && x === 1 && b.delay && (a._delay = c = b.delay, a._start += c, b.delay = 0), v.to(C, b, w ? w(y, C, _) : 0), v._ease = W.none;
				v.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				_t(ft(v.vars.defaults, { ease: "none" })), v._ease = zn(f.ease || n.ease || "none");
				var E = 0, D, O, k;
				if (Ce(f)) f.forEach(function(e) {
					return v.to(_, e, ">");
				}), v.duration();
				else {
					for (S in b = {}, f) S === "ease" || S === "easeEach" || nr(S, f[S], b, f.easeEach);
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
		return d === !0 && !ae && (Zn = L(a), U.killTweensOf(_), Zn = 0), Mt(g, L(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === at(g._time) && ye(l) && Tt(L(a)) && g.data !== "nested") && (a._tTime = -H, a.render(Math.max(0, -c) || 0)), m && Nt(L(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - H && !o ? i : e < H ? 0 : e, c, l, u, d, f, p, m, h, g;
		if (!a) Lt(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = at(s % d), s === i ? (u = this._repeat, c = a) : (f = at(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (g = this._yEase, c = a - c), f = Dt(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && (h && this._yEase && Rn(h, p), this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(at(d * u), !0).invalidate()._lock = 0));
			}
			if (!this._initted) {
				if (Pt(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
				if (r !== this._time && !(n && this.vars.repeatRefresh && u !== f)) return this;
				if (a !== this._dur) return this.render(e, t, n);
			}
			if (this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), this.ratio = m = (g || this._ease)(c / a), this._from && (this.ratio = m = 1 - m), c && !r && !t && !u && (hn(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && wt(this, e, t, n), hn(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && hn(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && wt(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && xt(this, 1), !t && !(o && !r) && (s || r || p) && (hn(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		kn || An.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || $n(this, a), o = this._ease(a / this._dur), er(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (At(this, 0), this.parent || yt(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? gn(this) : this.scrollTrigger && this.scrollTrigger.kill(!!V), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, Zn && Zn.vars.overwrite !== !0)._first || gn(this), this.parent && n !== this.timeline.totalDuration() && zt(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? Zt(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && vt(r, i)) return t === "all" && (this._pt = 0), gn(this);
		for (s = this._op = this._op || [], t !== "all" && (me(t) && (d = {}, rt(t, function(e) {
			return d[e] = 1;
		}), t = d), t = tr(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && bt(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && gn(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return Ut(1, arguments);
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
		return Ut(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return U.killTweensOf(e, t, n);
	}, t;
}(Gn);
ft(or.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), rt("staggerTo,staggerFrom,staggerFromTo", function(e) {
	or[e] = function() {
		var t = new Kn(), n = Jt.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var sr = function(e, t, n) {
	return e[t] = n;
}, cr = function(e, t, n) {
	return e[t](n);
}, lr = function(e, t, n, r) {
	return e[t](r.fp, n);
}, ur = function(e, t, n) {
	return e.setAttribute(t, n);
}, dr = function(e, t) {
	return he(e[t]) ? cr : _e(e[t]) && e.setAttribute ? ur : sr;
}, fr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, pr = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, mr = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, hr = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, gr = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, _r = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? bt(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, vr = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, yr = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, br = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || fr, this.d = o || this, this.set = s || sr, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = vr, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
rt($e + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(e) {
	return Ge[e] = 1;
}), Pe.TweenMax = Pe.TweenLite = or, Pe.TimelineLite = Pe.TimelineMax = Kn, U = new Kn({
	sortChildren: !1,
	defaults: B,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), z.stringFilter = On;
var xr = [], Sr = {}, Cr = [], wr = 0, Tr = 0, Er = function(e) {
	return (Sr[e] || Cr).map(function(e) {
		return e();
	});
}, Dr = function() {
	var e = Date.now(), t = [];
	e - wr > 2 && (Er("matchMediaInit"), xr.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = je.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), Er("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), wr = e, Er("matchMedia"));
}, Or = /*#__PURE__*/ function() {
	function e(e, t) {
		this.selector = t && Qt(t), this.data = [], this._r = [], this.isReverted = !1, this.id = Tr++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		he(e) && (n = t, t = e, e = he);
		var r = this, i = function() {
			var e = oe, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = Qt(n)), oe = r, a = t.apply(r, arguments), he(a) && r._r.push(a), oe = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === he ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = oe;
		oe = null, e(this), oe = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof or && !(n.parent && n.parent.data === "nested") && t.push(n);
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
			}), r = n.data.length; r--;) i = n.data[r], i instanceof Kn ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof or) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = xr.length; r--;) xr[r].id === this.id && xr.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), kr = /*#__PURE__*/ function() {
	function e(e) {
		this.contexts = [], this.scope = e, oe && oe.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		ve(e) || (e = { matches: e });
		var r = new Or(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in oe && !r.selector && (r.selector = oe.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = je.matchMedia(e[o]), a && (xr.indexOf(r) < 0 && xr.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(Dr) : a.addEventListener("change", Dr)));
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
}(), Ar = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return yn(e);
		});
	},
	timeline: function(e) {
		return new Kn(e);
	},
	getTweensOf: function(e, t) {
		return U.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		me(e) && (e = Zt(e)[0]);
		var i = tt(e || {}).get, a = n ? dt : ut;
		return n === "native" && (n = ""), e && (t ? a((Ye[t] && Ye[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((Ye[t] && Ye[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = Zt(e), e.length > 1) {
			var r = e.map(function(e) {
				return Pr.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = Ye[t], o = tt(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			_n._pt = 0, r.init(e, n ? t + n : t, _n, 0, [e]), r.render(1, r), _n._pt && hr(1, _n);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = Pr.to(e, ft((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return U.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = zn(e.ease, B.ease)), ht(B, e || {});
	},
	config: function(e) {
		return ht(z, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !Ye[e] && !Pe[e] && ze(t + " effect requires " + e + " plugin.");
		}), Xe[t] = function(e, t, r) {
			return n(Zt(e), ft(t || {}, i), r);
		}, a && (Kn.prototype[t] = function(e, n, r) {
			return this.add(Xe[t](e, ve(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		W[e] = zn(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? zn(e, t) : W;
	},
	getById: function(e) {
		return U.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new Kn(e), r, i;
		for (n.smoothChildTiming = ye(e.smoothChildTiming), U.remove(n), n._dp = 0, n._time = n._tTime = U._time, r = U._first; r;) i = r._next, (t || !(!r._dur && r instanceof or && r.vars.onComplete === r._targets[0])) && Mt(n, r, r._start - r._delay), r = i;
		return Mt(U, n, 0), n;
	},
	context: function(e, t) {
		return e ? new Or(e, t) : oe;
	},
	matchMedia: function(e) {
		return new kr(e);
	},
	matchMediaRefresh: function() {
		return xr.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || Dr();
	},
	addEventListener: function(e, t) {
		var n = Sr[e] || (Sr[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = Sr[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: ln,
		wrapYoyo: un,
		distribute: en,
		random: rn,
		snap: nn,
		normalize: sn,
		getUnit: Kt,
		clamp: qt,
		splitColor: Cn,
		toArray: Zt,
		selector: Qt,
		mapRange: fn,
		pipe: an,
		unitize: on,
		interpolate: pn,
		shuffle: $t
	},
	install: Le,
	effects: Xe,
	ticker: An,
	updateRoot: Kn.updateRoot,
	plugins: Ye,
	globalTimeline: U,
	core: {
		PropTween: br,
		globals: Be,
		Tween: or,
		Timeline: Kn,
		Animation: Gn,
		getCache: tt,
		_removeLinkedListItem: bt,
		reverting: function() {
			return V;
		},
		context: function(e) {
			return e && oe && (oe.data.push(e), e._ctx = oe), oe;
		},
		suppressOverwrites: function(e) {
			return ae = e;
		}
	}
};
rt("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return Ar[e] = or[e];
}), An.add(Kn.updateRoot), _n = Ar.to({}, { duration: 0 });
var jr = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, Mr = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = jr(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, Nr = function(e, t) {
	return {
		name: e,
		rawVars: 1,
		init: function(e, n, r) {
			r._onInit = function(e) {
				var r, i;
				if (me(n) && (r = {}, rt(n, function(e) {
					return r[e] = 1;
				}), n = r), t) {
					for (i in r = {}, n) r[i] = t(n[i]);
					n = r;
				}
				Mr(e, n);
			};
		}
	};
}, Pr = Ar.registerPlugin({
	name: "attr",
	init: function(e, t, n, r, i) {
		var a, o, s;
		for (a in this.tween = n, t) s = e.getAttribute(a) || "", o = this.add(e, "setAttribute", (s || 0) + "", t[a], r, i, 0, 0, a), o.op = a, o.b = s, this._props.push(a);
	},
	render: function(e, t) {
		for (var n = t._pt; n;) V ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, Nr("roundProps", tn), Nr("modifiers"), Nr("snap", nn)) || Ar;
or.version = Kn.version = Pr.version = "3.12.7", Ie = 1, be() && jn(), W.Power0, W.Power1, W.Power2, W.Power3, W.Power4, W.Linear, W.Quad, W.Cubic, W.Quart, W.Quint, W.Strong, W.Elastic, W.Back, W.SteppedEase, W.Bounce, W.Sine, W.Expo, W.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var Fr, Ir, Lr, Rr, zr, Br, Vr, Hr = function() {
	return typeof window < "u";
}, Ur = {}, Wr = 180 / Math.PI, Gr = Math.PI / 180, Kr = Math.atan2, qr = 1e8, Jr = /([A-Z])/g, Yr = /(left|right|width|margin|padding|x)/i, Xr = /[\s,\(]\S/, Zr = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, Qr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, $r = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, ei = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, ti = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, ni = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, ri = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, ii = function(e, t, n) {
	return e.style[t] = n;
}, ai = function(e, t, n) {
	return e.style.setProperty(t, n);
}, oi = function(e, t, n) {
	return e._gsap[t] = n;
}, si = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, ci = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, li = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, ui = "transform", di = ui + "Origin", fi = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in Ur && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = Zr[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = Ai(i, e);
		}) : this.tfm[t] = o.x ? o[t] : Ai(i, t), t === di && (this.tfm.zOrigin = o.zOrigin);
		else return Zr.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(ui) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(di, n, "")), t = ui;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, pi = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, mi = function() {
	var e = this.props, t = this.target, n = t.style, r = t._gsap, i, a;
	for (i = 0; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(Jr, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = Vr(), (!i || !i.isStart) && !n[ui] && (pi(n), r.zOrigin && n[di] && (n[di] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, hi = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: mi,
		save: fi
	};
	return e._gsap || Pr.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, gi, _i = function(e, t) {
	var n = Ir.createElementNS ? Ir.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : Ir.createElement(e);
	return n && n.style ? n : Ir.createElement(e);
}, vi = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(Jr, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, bi(n) || n, 1) || "";
}, yi = "O,Moz,ms,Ms,Webkit".split(","), bi = function(e, t, n) {
	var r = (t || zr).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(yi[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? yi[i] : "") + e;
}, xi = function() {
	Hr() && window.document && (Fr = window, Ir = Fr.document, Lr = Ir.documentElement, zr = _i("div") || { style: {} }, _i("div"), ui = bi(ui), di = ui + "Origin", zr.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", gi = !!bi("perspective"), Vr = Pr.core.reverting, Rr = 1);
}, Si = function(e) {
	var t = e.ownerSVGElement, n = _i("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), Lr.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), Lr.removeChild(n), i;
}, Ci = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, wi = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = Si(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = Si(e)), t && !t.width && !t.x && !t.y ? {
		x: +Ci(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +Ci(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, Ti = function(e) {
	return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && wi(e));
}, Ei = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in Ur && t !== di && (t = ui), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(Jr, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, Di = function(e, t, n, r, i, a) {
	var o = new br(e._pt, t, n, 0, 1, a ? ri : ni);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, Oi = {
	deg: 1,
	rad: 1,
	turn: 1
}, G = {
	grid: 1,
	flex: 1
}, ki = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = zr.style, c = Yr.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || Oi[i] || Oi[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && Ti(t), (p || o === "%") && (Ur[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], it(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === Ir || !h.appendChild) && (h = Ir.body), g = h._gsap, g && p && g.width && c && g.time === An.time && !g.uncache) return it(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : Ei(t, n);
	} else (p || o === "%") && !G[vi(h, "display")] && (s.position = vi(t, "position")), h === t && (s.position = "static"), h.appendChild(zr), m = zr[u], h.removeChild(zr), s.position = "absolute";
	return c && p && (g = tt(h), g.time = An.time, g.width = h[u]), it(f ? m * a / d : m && a ? d / m * a : 0);
}, Ai = function(e, t, n, r) {
	var i;
	return Rr || xi(), t in Zr && t !== "transform" && (t = Zr[t], ~t.indexOf(",") && (t = t.split(",")[0])), Ur[t] && t !== "transform" ? (i = Hi(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : Ui(vi(e, di)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = Fi[t] && Fi[t](e, t, n) || vi(e, t) || nt(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? ki(e, t, i, n) + n : i;
}, ji = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = bi(t, e, 1), a = i && vi(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = vi(e, "borderTopColor"));
	}
	var o = new br(this._pt, e.style, t, 0, 1, mr), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r === "auto" && (m = e.style[t], e.style[t] = r, r = vi(e, t) || r, m ? e.style[t] = m : Ei(e, t)), l = [n, r], On(l), n = l[0], r = l[1], d = n.match(Ee) || [], b = r.match(Ee) || [], b.length) {
		for (; u = Ee.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = ot(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = Ee.lastIndex - v.length, v || (v = v || z.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = ki(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? ri : ni;
	return Oe.test(r) && (o.e = 0), this._pt = o, o;
}, Mi = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, Ni = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = Mi[n] || n, t[1] = Mi[r] || r, t.join(" ");
}, Pi = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], Ur[o] && (s = 1, o = o === "transformOrigin" ? di : ui), Ei(n, o);
		s && (Ei(n, ui), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", Hi(n, 1), a.uncache = 1, pi(r)));
	}
}, Fi = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new br(e._pt, t, n, 0, 0, Pi);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, Ii = [
	1,
	0,
	0,
	1,
	0,
	0
], Li = {}, Ri = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, zi = function(e) {
	var t = vi(e, ui);
	return Ri(t) ? Ii : t.substr(7).match(Te).map(it);
}, Bi = function(e, t) {
	var n = e._gsap || tt(e), r = e.style, i = zi(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? Ii : i) : (i === Ii && !e.offsetParent && e !== Lr && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, Lr.appendChild(e)), i = zi(e), s ? r.display = s : Ei(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : Lr.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, Vi = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || Bi(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== Ii && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = wi(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[di] = "0px 0px", a && (Di(a, o, "xOrigin", c, y), Di(a, o, "yOrigin", l, b), Di(a, o, "xOffset", u, o.xOffset), Di(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, Hi = function(e, t) {
	var n = e._gsap || new Wn(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = vi(e, di) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A, j, M, ee, te, ne, N, P, re, ie, F;
	return n.svg = !!(e.getCTM && Ti(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[ui] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[ui] === "none" ? "" : s[ui])), r.scale = r.rotate = r.translate = "none"), S = Bi(e, n.svg), n.svg && (n.uncache ? (ee = e.getBBox(), c = n.xOrigin - ee.x + "px " + (n.yOrigin - ee.y) + "px", M = "") : M = !t && e.getAttribute("data-svg-origin"), Vi(e, M || c, !!M || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== Ii && (E = S[0], D = S[1], O = S[2], k = S[3], l = A = S[4], u = j = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? Kr(D, E) * Wr : 0, _ = O || k ? Kr(O, k) * Wr + m : 0, _ && (p *= Math.abs(Math.cos(_ * Gr))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (F = S[6], re = S[7], ne = S[8], N = S[9], P = S[10], ie = S[11], l = S[12], u = S[13], d = S[14], C = Kr(F, P), h = C * Wr, C && (w = Math.cos(-C), T = Math.sin(-C), M = A * w + ne * T, ee = j * w + N * T, te = F * w + P * T, ne = A * -T + ne * w, N = j * -T + N * w, P = F * -T + P * w, ie = re * -T + ie * w, A = M, j = ee, F = te), C = Kr(-O, P), g = C * Wr, C && (w = Math.cos(-C), T = Math.sin(-C), M = E * w - ne * T, ee = D * w - N * T, te = O * w - P * T, ie = k * T + ie * w, E = M, D = ee, O = te), C = Kr(D, E), m = C * Wr, C && (w = Math.cos(C), T = Math.sin(C), M = E * w + D * T, ee = A * w + j * T, D = D * w - E * T, j = j * w - A * T, E = M, A = ee), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = it(Math.sqrt(E * E + D * D + O * O)), p = it(Math.sqrt(j * j + F * F)), C = Kr(A, j), _ = Math.abs(C) > 2e-4 ? C * Wr : 0, y = ie ? 1 / (ie < 0 ? -ie : ie) : 0), n.svg && (M = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !Ri(vi(e, ui)), M && e.setAttribute("transform", M))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = it(f), n.scaleY = it(p), n.rotation = it(m) + o, n.rotationX = it(h) + o, n.rotationY = it(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[di] = Ui(c)), n.xOffset = n.yOffset = 0, n.force3D = z.force3D, n.renderTransform = n.svg ? Xi : gi ? Yi : Gi, n.uncache = 0, n;
}, Ui = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, Wi = function(e, t, n) {
	var r = Kt(t);
	return it(parseFloat(t) + parseFloat(ki(e, "x", n + "px", r))) + r;
}, Gi = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, Yi(e, t);
}, Ki = "0deg", qi = "0px", Ji = ") ", Yi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== Ki || l !== Ki)) {
		var x = parseFloat(l) * Gr, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * Gr, w = Math.cos(x), a = Wi(_, a, S * w * -v), o = Wi(_, o, -Math.sin(x) * -v), s = Wi(_, s, C * w * -v + v);
	}
	h !== qi && (y += "perspective(" + h + Ji), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== qi || o !== qi || s !== qi) && (y += s !== qi || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + Ji), c !== Ki && (y += "rotate(" + c + Ji), l !== Ki && (y += "rotateY(" + l + Ji), u !== Ki && (y += "rotateX(" + u + Ji), (d !== Ki || f !== Ki) && (y += "skew(" + d + ", " + f + Ji), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + Ji), _.style[ui] = y || "translate(0, 0)";
}, Xi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= Gr, c *= Gr, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= Gr, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = it(b), x = it(x), S = it(S), C = it(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = ki(f, "x", a, "px"), y = ki(f, "y", o, "px")), (p || m || h || g) && (v = it(v + p - (p * b + m * S) + h), y = it(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = it(v + r / 100 * w.width), y = it(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[ui] = w);
}, Zi = function(e, t, n, r, i) {
	var a = 360, o = me(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? Wr : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * qr) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * qr) % a - ~~(s / a) * a)), e._pt = u = new br(e._pt, t, n, r, s, $r), u.e = c, u.u = "deg", e._props.push(n), u;
}, Qi = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, $i = function(e, t, n) {
	var r = Qi({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[ui] = t, o = Hi(n, 1), Ei(n, ui), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[ui], a[ui] = t, o = Hi(n, 1), a[ui] = c), Ur) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = Kt(c), p = Kt(l), u = f === p ? parseFloat(c) : ki(n, s, c, p), d = parseFloat(l), e._pt = new br(e._pt, o, s, u, d - u, Qr), e._pt.u = p || 0, e._props.push(s));
	Qi(o, r);
};
rt("padding,margin,Width,Radius", function(e, t) {
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
	Fi[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return Ai(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var ea = {
	name: "css",
	register: xi,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C;
		for (m in Rr || xi(), this.styles = this.styles || hi(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(Ye[m] && Xn(m, t, n, r, e, i)))) {
			if (f = typeof l, p = Fi[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = dn(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", En.lastIndex = 0, En.test(c) || (h = Kt(c), g = Kt(l)), g ? h !== g && (c = ki(e, m, c, g) + g) : h && (l += h), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], me(c) && ~c.indexOf("random(") && (c = dn(c)), Kt(c + "") || c === "auto" || (c += z.units[m] || Kt(Ai(e, m)) || ""), (c + "").charAt(1) === "=" && (c = Ai(e, m))) : c = Ai(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in Zr && (m === "autoAlpha" && (d === 1 && Ai(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), Di(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = Zr[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Ur, v) {
					if (this.styles.save(m), y || (b = e._gsap, b.renderTransform && !t.parseTransform || Hi(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new br(this._pt, o, ui, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new br(this._pt, b, "scaleY", b.scaleY, (_ ? ot(b.scaleY, _ + u) : u) - b.scaleY || 0, Qr), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(di, 0, o[di]), l = Ni(l), b.svg ? Vi(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && Di(this, b, "zOrigin", b.zOrigin, g), Di(this, o, m, Ui(c), Ui(l)));
						continue;
					} else if (m === "svgOrigin") {
						Vi(e, l, 1, x, 0, this);
						continue;
					} else if (m in Li) {
						Zi(this, b, m, d, _ ? ot(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						Di(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						$i(this, l, e);
						continue;
					}
				} else m in o || (m = bi(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !Xr.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = Kt(l) || (m in z.units ? z.units[m] : h), h !== g && (d = ki(e, m, c, g)), this._pt = new br(this._pt, v ? b : o, m, d, (_ ? ot(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? ti : Qr), this._pt.u = g || 0, h !== g && g !== "%" && (this._pt.b = c, this._pt.r = ei);
				else if (m in o) ji.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					Re(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && yr(this);
	},
	render: function(e, t) {
		if (t.tween._time || !Vr()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: Ai,
	aliases: Zr,
	getSetter: function(e, t, n) {
		var r = Zr[t];
		return r && r.indexOf(",") < 0 && (t = r), t in Ur && t !== di && (e._gsap.x || Ai(e, "x")) ? n && Br === n ? t === "scale" ? si : oi : (Br = n || {}) && (t === "scale" ? ci : li) : e.style && !_e(e.style[t]) ? ii : ~t.indexOf("-") ? ai : dr(e, t);
	},
	core: {
		_removeProperty: Ei,
		_getMatrix: Bi
	}
};
Pr.utils.checkPrefix = bi, Pr.core.getStyleSaver = hi, (function(e, t, n, r) {
	var i = rt(e + "," + t + "," + n, function(e) {
		Ur[e] = 1;
	});
	rt(t, function(e) {
		z.units[e] = "deg", Li[e] = 1;
	}), Zr[i[13]] = e + "," + t, rt(r, function(e) {
		var t = e.split(":");
		Zr[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), rt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	z.units[e] = "px";
}), Pr.registerPlugin(ea);
//#endregion
//#region node_modules/gsap/index.js
var K = Pr.registerPlugin(ea) || Pr;
K.core.Tween;
//#endregion
//#region src/table/animations/flip.ts
function ta(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function na(e) {
	return {
		x: e.left + e.width / 2,
		y: e.top + e.height / 2
	};
}
function ra(e, t) {
	let n = na(e), r = na(t);
	return {
		x: n.x - r.x,
		y: n.y - r.y
	};
}
function ia(e, t) {
	let n = ra(t, e);
	return {
		x: n.x,
		y: n.y
	};
}
//#endregion
//#region node_modules/gsap/utils/paths.js
var aa = /[achlmqstvz]|(-?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, oa = /(?:(-)?\d*\.?\d*(?:e[\-+]?\d+)?)[0-9]/gi, sa = /[\+\-]?\d*\.?\d+e[\+\-]?\d+/gi, ca = /(^[#\.][a-z]|[a-y][a-z])/i, la = Math.PI / 180, ua = 180 / Math.PI, da = Math.sin, fa = Math.cos, pa = Math.abs, ma = Math.sqrt, ha = Math.atan2, ga = 1e8, _a = function(e) {
	return typeof e == "string";
}, va = function(e) {
	return typeof e == "number";
}, ya = function(e) {
	return e === void 0;
}, ba = {}, xa = {}, Sa = 1e5, Ca = function(e) {
	return Math.round((e + ga) % 1 * Sa) / Sa || (e < 0 ? 0 : 1);
}, wa = function(e) {
	return Math.round(e * Sa) / Sa || 0;
}, Ta = function(e) {
	return Math.round(e * 1e10) / 1e10 || 0;
}, Ea = function(e, t, n, r) {
	var i = e[t], a = r === 1 ? 6 : Ha(i, n, r);
	if ((a || !r) && a + n + 2 < i.length) return e.splice(t, 0, i.slice(0, n + a + 2)), i.splice(0, n + a), 1;
}, Da = function(e, t, n) {
	var r = e.length, i = ~~(n * r);
	if (e[i] > t) {
		for (; --i && e[i] > t;);
		i < 0 && (i = 0);
	} else for (; e[++i] < t && i < r;);
	return i < r ? i : r - 1;
}, Oa = function(e, t) {
	var n = e.length;
	for (t || e.reverse(); n--;) e[n].reversed || Na(e[n]);
}, ka = function(e, t) {
	return t.totalLength = e.totalLength, e.samples ? (t.samples = e.samples.slice(0), t.lookup = e.lookup.slice(0), t.minLength = e.minLength, t.resolution = e.resolution) : e.totalPoints && (t.totalPoints = e.totalPoints), t;
}, Aa = function(e, t) {
	var n = e.length, r = e[n - 1] || [], i = r.length;
	n && t[0] === r[i - 2] && t[1] === r[i - 1] && (t = r.concat(t.slice(2)), n--), e[n] = t;
};
function ja(e) {
	e = _a(e) && ca.test(e) && document.querySelector(e) || e;
	var t = e.getAttribute ? e : 0, n;
	return t && (e = e.getAttribute("d")) ? (t._gsPath ||= {}, n = t._gsPath[e], n && !n._dirty ? n : t._gsPath[e] = qa(e)) : e ? _a(e) ? qa(e) : va(e[0]) ? [e] : e : console.warn("Expecting a <path> element or an SVG path data string");
}
function Ma(e) {
	for (var t = [], n = 0; n < e.length; n++) t[n] = ka(e[n], e[n].slice(0));
	return ka(e, t);
}
function Na(e) {
	var t = 0, n;
	for (e.reverse(); t < e.length; t += 2) n = e[t], e[t] = e[t + 1], e[t + 1] = n;
	e.reversed = !e.reversed;
}
var Pa = function(e, t) {
	var n = document.createElementNS("http://www.w3.org/2000/svg", "path"), r = [].slice.call(e.attributes), i = r.length, a;
	for (t = "," + t + ","; --i > -1;) a = r[i].nodeName.toLowerCase(), t.indexOf("," + a + ",") < 0 && n.setAttributeNS(null, a, r[i].nodeValue);
	return n;
}, Fa = {
	rect: "rx,ry,x,y,width,height",
	circle: "r,cx,cy",
	ellipse: "rx,ry,cx,cy",
	line: "x1,x2,y1,y2"
}, Ia = function(e, t) {
	for (var n = t ? t.split(",") : [], r = {}, i = n.length; --i > -1;) r[n[i]] = +e.getAttribute(n[i]) || 0;
	return r;
};
function La(e, t) {
	var n = e.tagName.toLowerCase(), r = .552284749831, i, a, o, s, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T;
	return n === "path" || !e.getBBox ? e : (l = Pa(e, "x,y,width,height,cx,cy,rx,ry,r,x1,x2,y1,y2,points"), T = Ia(e, Fa[n]), n === "rect" ? (s = T.rx, c = T.ry || s, a = T.x, o = T.y, p = T.width - s * 2, m = T.height - c * 2, s || c ? (h = a + s * (1 - r), g = a + s, _ = g + p, v = _ + s * r, y = _ + s, b = o + c * (1 - r), x = o + c, S = x + m, C = S + c * r, w = S + c, i = "M" + y + "," + x + " V" + S + " C" + [
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
	].join(",") + "z") : n === "line" ? i = "M" + T.x1 + "," + T.y1 + " L" + T.x2 + "," + T.y2 : (n === "polyline" || n === "polygon") && (f = (e.getAttribute("points") + "").match(oa) || [], a = f.shift(), o = f.shift(), i = "M" + a + "," + o + " L" + f.join(","), n === "polygon" && (i += "," + a + "," + o + "z")), l.setAttribute("d", Xa(l._gsRawPath = qa(i))), t && e.parentNode && (e.parentNode.insertBefore(l, e), e.parentNode.removeChild(e)), l);
}
function Ra(e, t, n) {
	var r = e[t], i = e[t + 2], a = e[t + 4], o;
	return r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, o = i + (a + (e[t + 6] - a) * n - i) * n - r, r = e[t + 1], i = e[t + 3], a = e[t + 5], r += (i - r) * n, i += (a - i) * n, r += (i - r) * n, wa(ha(i + (a + (e[t + 7] - a) * n - i) * n - r, o) * ua);
}
function za(e, t, n) {
	n = ya(n) ? 1 : Ta(n) || 0, t = Ta(t) || 0;
	var r = Math.max(0, ~~(pa(n - t) - 1e-8)), i = Ma(e);
	if (t > n && (t = 1 - t, n = 1 - n, Oa(i), i.totalLength = 0), t < 0 || n < 0) {
		var a = Math.abs(~~Math.min(t, n)) + 1;
		t += a, n += a;
	}
	i.totalLength || Va(i);
	var o = n > 1, s = Ua(i, t, ba, !0), c = Ua(i, n, xa), l = c.segment, u = s.segment, d = c.segIndex, f = s.segIndex, p = c.i, m = s.i, h = f === d, g = p === m && h, _, v, y, b, x, S, C, w;
	if (o || r) {
		for (_ = d < f || h && p < m || g && c.t < s.t, Ea(i, f, m, s.t) && (f++, _ || (d++, g ? (c.t = (c.t - s.t) / (1 - s.t), p = 0) : h && (p -= m))), Math.abs(1 - (n - t)) < 1e-5 ? d = f - 1 : !c.t && d ? d-- : Ea(i, d, p, c.t) && _ && f++, s.t === 1 && (f = (f + 1) % i.length), x = [], S = i.length, C = 1 + S * r, w = f, C += (S - f + d) % S, b = 0; b < C; b++) Aa(x, i[w++ % S]);
		i = x;
	} else if (y = c.t === 1 ? 6 : Ha(l, p, c.t), t !== n) for (v = Ha(u, m, g ? s.t / c.t : s.t), h && (y += v), l.splice(p + y + 2), (v || m) && u.splice(0, m + v), b = i.length; b--;) (b < f || b > d) && i.splice(b, 1);
	else l.angle = Ra(l, p + y, 0), p += y, s = l[p], c = l[p + 1], l.length = l.totalLength = 0, l.totalPoints = i.totalPoints = 8, l.push(s, c, s, c, s, c, s, c);
	return i.totalLength = 0, i;
}
function Ba(e, t, n) {
	t ||= 0, e.samples || (e.samples = [], e.lookup = []);
	var r = ~~e.resolution || 12, i = 1 / r, a = n ? t + n * 6 + 1 : e.length, o = e[t], s = e[t + 1], c = t ? t / 6 * r : 0, l = e.samples, u = e.lookup, d = (t ? e.minLength : ga) || ga, f = l[c + n * r - 1], p = t ? l[c - 1] : 0, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A;
	for (l.length = u.length = 0, h = t + 2; h < a; h += 6) {
		if (g = e[h + 4] - o, _ = e[h + 2] - o, v = e[h] - o, x = e[h + 5] - s, S = e[h + 3] - s, C = e[h + 1] - s, y = b = w = T = 0, pa(g) < .01 && pa(x) < .01 && pa(v) + pa(C) < .01) e.length > 8 && (e.splice(h, 6), h -= 6, a -= 6);
		else for (m = 1; m <= r; m++) D = i * m, E = 1 - D, y = b - (b = (D * D * g + 3 * E * (D * _ + E * v)) * D), w = T - (T = (D * D * x + 3 * E * (D * S + E * C)) * D), k = ma(w * w + y * y), k < d && (d = k), p += k, l[c++] = p;
		o += g, s += x;
	}
	if (f) for (f -= p; c < l.length; c++) l[c] += f;
	if (l.length && d) {
		if (e.totalLength = A = l[l.length - 1] || 0, e.minLength = d, A / d < 9999) for (k = O = 0, m = 0; m < A; m += d) u[k++] = l[O] < m ? ++O : O;
	} else e.totalLength = l[0] = 0;
	return t ? p - l[t / 2 - 1] : p;
}
function Va(e, t) {
	var n, r, i;
	for (i = n = r = 0; i < e.length; i++) e[i].resolution = ~~t || 12, r += e[i].length, n += Ba(e[i]);
	return e.totalPoints = r, e.totalLength = n, e;
}
function Ha(e, t, n) {
	if (n <= 0 || n >= 1) return 0;
	var r = e[t], i = e[t + 1], a = e[t + 2], o = e[t + 3], s = e[t + 4], c = e[t + 5], l = e[t + 6], u = e[t + 7], d = r + (a - r) * n, f = a + (s - a) * n, p = i + (o - i) * n, m = o + (c - o) * n, h = d + (f - d) * n, g = p + (m - p) * n, _ = s + (l - s) * n, v = c + (u - c) * n;
	return f += (_ - f) * n, m += (v - m) * n, e.splice(t + 2, 4, wa(d), wa(p), wa(h), wa(g), wa(h + (f - h) * n), wa(g + (m - g) * n), wa(f), wa(m), wa(_), wa(v)), e.samples && e.samples.splice(t / 6 * e.resolution | 0, 0, 0, 0, 0, 0, 0, 0), 6;
}
function Ua(e, t, n, r) {
	n ||= {}, e.totalLength || Va(e), (t < 0 || t > 1) && (t = Ca(t));
	var i = 0, a = e[0], o, s, c, l, u, d, f;
	if (!t) f = d = i = 0, a = e[0];
	else if (t === 1) f = 1, i = e.length - 1, a = e[i], d = a.length - 8;
	else {
		if (e.length > 1) {
			for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = d;
			a = e[i], l = u - a.totalLength, t = (c - l) / (u - l) || 0;
		}
		o = a.samples, s = a.resolution, c = a.totalLength * t, d = a.lookup.length ? a.lookup[~~(c / a.minLength)] || 0 : Da(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s), d = ~~(d / s) * 6, r && f === 1 && (d + 6 < a.length ? (d += 6, f = 0) : i + 1 < e.length && (d = f = 0, a = e[++i]));
	}
	return n.t = f, n.i = d, n.path = e, n.segment = a, n.segIndex = i, n;
}
function Wa(e, t, n, r) {
	var i = e[0], a = r || {}, o, s, c, l, u, d, f, p, m;
	if ((t < 0 || t > 1) && (t = Ca(t)), i.lookup || Va(e), e.length > 1) {
		for (c = e.totalLength * t, u = d = 0; (u += e[d++].totalLength) < c;) i = e[d];
		l = u - i.totalLength, t = (c - l) / (u - l) || 0;
	}
	return o = i.samples, s = i.resolution, c = i.totalLength * t, d = i.lookup.length ? i.lookup[t < 1 ? ~~(c / i.minLength) : i.lookup.length - 1] || 0 : Da(o, c, t), l = d ? o[d - 1] : 0, u = o[d], u < c && (l = u, u = o[++d]), f = 1 / s * ((c - l) / (u - l) + d % s) || 0, m = 1 - f, d = ~~(d / s) * 6, p = i[d], a.x = wa((f * f * (i[d + 6] - p) + 3 * m * (f * (i[d + 4] - p) + m * (i[d + 2] - p))) * f + p), a.y = wa((f * f * (i[d + 7] - (p = i[d + 1])) + 3 * m * (f * (i[d + 5] - p) + m * (i[d + 3] - p))) * f + p), n && (a.angle = i.totalLength ? Ra(i, d, f >= 1 ? .999999999 : f || 1e-9) : i.angle || 0), a;
}
function Ga(e, t, n, r, i, a, o) {
	for (var s = e.length, c, l, u, d, f; --s > -1;) for (c = e[s], l = c.length, u = 0; u < l; u += 2) d = c[u], f = c[u + 1], c[u] = d * t + f * r + a, c[u + 1] = d * n + f * i + o;
	return e._dirty = 1, e;
}
function Ka(e, t, n, r, i, a, o, s, c) {
	if (!(e === s && t === c)) {
		n = pa(n), r = pa(r);
		var l = i % 360 * la, u = fa(l), d = da(l), f = Math.PI, p = f * 2, m = (e - s) / 2, h = (t - c) / 2, g = u * m + d * h, _ = -d * m + u * h, v = g * g, y = _ * _, b = v / (n * n) + y / (r * r);
		b > 1 && (n = ma(b) * n, r = ma(b) * r);
		var x = n * n, S = r * r, C = (x * S - x * y - S * v) / (x * y + S * v);
		C < 0 && (C = 0);
		var w = (a === o ? -1 : 1) * ma(C), T = w * (n * _ / r), E = w * -(r * g / n), D = (e + s) / 2, O = (t + c) / 2, k = D + (u * T - d * E), A = O + (d * T + u * E), j = (g - T) / n, M = (_ - E) / r, ee = (-g - T) / n, te = (-_ - E) / r, ne = j * j + M * M, N = (M < 0 ? -1 : 1) * Math.acos(j / ma(ne)), P = (j * te - M * ee < 0 ? -1 : 1) * Math.acos((j * ee + M * te) / ma(ne * (ee * ee + te * te)));
		isNaN(P) && (P = f), !o && P > 0 ? P -= p : o && P < 0 && (P += p), N %= p, P %= p;
		var re = Math.ceil(pa(P) / (p / 4)), ie = [], F = P / re, I = 4 / 3 * da(F / 2) / (1 + fa(F / 2)), L = u * n, R = d * n, z = d * -r, B = u * r, ae;
		for (ae = 0; ae < re; ae++) i = N + ae * F, g = fa(i), _ = da(i), j = fa(i += F), M = da(i), ie.push(g - I * _, _ + I * g, j + I * M, M - I * j, j, M);
		for (ae = 0; ae < ie.length; ae += 2) g = ie[ae], _ = ie[ae + 1], ie[ae] = g * L + _ * z + k, ie[ae + 1] = g * R + _ * B + A;
		return ie[ae - 2] = s, ie[ae - 1] = c, ie;
	}
}
function qa(e) {
	var t = (e + "").replace(sa, function(e) {
		var t = +e;
		return t < 1e-4 && t > -1e-4 ? 0 : t;
	}).match(aa) || [], n = [], r = 0, i = 0, a = 2 / 3, o = t.length, s = 0, c = "ERROR: malformed path: " + e, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C, w = function(e, t, n, r) {
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
	else if (p === "L" || p === "Z") p === "Z" && (d = g, f = _, h.closed = !0), (p === "L" || pa(r - d) > .5 || pa(i - f) > .5) && (w(r, i, d, f), p === "L" && (l += 2)), r = d, i = f;
	else if (p === "A") {
		if (S = t[l + 4], C = t[l + 5], v = t[l + 6], y = t[l + 7], u = 7, S.length > 1 && (S.length < 3 ? (y = v, v = C, u--) : (y = C, v = S.substr(2), u -= 2), C = S.charAt(1), S = S.charAt(0)), b = Ka(r, i, +t[l + 1], +t[l + 2], +t[l + 3], +S, +C, (m ? r : 0) + v * 1, (m ? i : 0) + y * 1), l += u, b) for (u = 0; u < b.length; u++) h.push(b[u]);
		r = h[h.length - 2], i = h[h.length - 1];
	} else console.log(c);
	return l = h.length, l < 6 ? (n.pop(), l = 0) : h[0] === h[l - 2] && h[1] === h[l - 1] && (h.closed = !0), n.totalPoints = s + l, n;
}
function Ja(e, t) {
	t === void 0 && (t = 1);
	for (var n = e[0], r = 0, i = [n, r], a = 2; a < e.length; a += 2) i.push(n, r, e[a], r = (e[a] - n) * t / 2, n = e[a], -r);
	return i;
}
function Ya(e, t) {
	pa(e[0] - e[2]) < 1e-4 && pa(e[1] - e[3]) < 1e-4 && (e = e.slice(2));
	var n = e.length - 2, r = +e[0], i = +e[1], a = +e[2], o = +e[3], s = [
		r,
		i,
		r,
		i
	], c = a - r, l = o - i, u = Math.abs(e[n] - r) < .001 && Math.abs(e[n + 1] - i) < .001, d, f, p, m, h, g, _, v, y, b, x, S, C, w, T;
	for (u && (e.push(a, o), a = r, o = i, r = e[n - 2], i = e[n - 1], e.unshift(r, i), n += 4), t = t || t === 0 ? +t : 1, p = 2; p < n; p += 2) d = r, f = i, r = a, i = o, a = +e[p + 2], o = +e[p + 3], !(r === a && i === o) && (m = c, h = l, c = a - r, l = o - i, g = ma(m * m + h * h), _ = ma(c * c + l * l), v = ma((c / _ + m / g) ** 2 + (l / _ + h / g) ** 2), y = (g + _) * t * .25 / v, b = r - (r - d) * (g ? y / g : 0), x = r + (a - r) * (_ ? y / _ : 0), S = r - (b + ((x - b) * (g * 3 / (g + _) + .5) / 4 || 0)), C = i - (i - f) * (g ? y / g : 0), w = i + (o - i) * (_ ? y / _ : 0), T = i - (C + ((w - C) * (g * 3 / (g + _) + .5) / 4 || 0)), (r !== d || i !== f) && s.push(wa(b + S), wa(C + T), wa(r), wa(i), wa(x + S), wa(w + T)));
	return r !== a || i !== o || s.length < 4 ? s.push(wa(a), wa(o), wa(a), wa(o)) : s.length -= 2, s.length === 2 ? s.push(r, i, r, i, r, i) : u && (s.splice(0, 6), s.length -= 6), s;
}
function Xa(e) {
	va(e[0]) && (e = [e]);
	var t = "", n = e.length, r, i, a, o;
	for (i = 0; i < n; i++) {
		for (o = e[i], t += "M" + wa(o[0]) + "," + wa(o[1]) + " C", r = o.length, a = 2; a < r; a++) t += wa(o[a++]) + "," + wa(o[a++]) + " " + wa(o[a++]) + "," + wa(o[a++]) + " " + wa(o[a++]) + "," + wa(o[a]) + " ";
		o.closed && (t += "z");
	}
	return t;
}
//#endregion
//#region node_modules/gsap/utils/matrix.js
var Za, Qa, $a, eo, to, no, ro, io, ao = "transform", q = ao + "Origin", oo, so = function(e) {
	var t = e.ownerDocument || e;
	for (!(ao in e.style) && ("msTransform" in e.style) && (ao = "msTransform", q = ao + "Origin"); t.parentNode && (t = t.parentNode););
	if (Qa = window, ro = new xo(), t) {
		Za = t, $a = t.documentElement, eo = t.body, io = Za.createElementNS("http://www.w3.org/2000/svg", "g"), io.style.transform = "none";
		var n = t.createElement("div"), r = t.createElement("div"), i = t && (t.body || t.firstElementChild);
		i && i.appendChild && (i.appendChild(n), n.appendChild(r), n.setAttribute("style", "position:static;transform:translate3d(0,0,1px)"), oo = r.offsetParent !== n, i.removeChild(n));
	}
	return t;
}, co = function(e) {
	for (var t, n; e && e !== eo;) n = e._gsap, n && n.uncache && n.get(e, "x"), n && !n.scaleX && !n.scaleY && n.renderTransform && (n.scaleX = n.scaleY = 1e-4, n.renderTransform(1, n), t ? t.push(n) : t = [n]), e = e.parentNode;
	return t;
}, lo = [], uo = [], fo = function() {
	return Qa.pageYOffset || Za.scrollTop || $a.scrollTop || eo.scrollTop || 0;
}, po = function() {
	return Qa.pageXOffset || Za.scrollLeft || $a.scrollLeft || eo.scrollLeft || 0;
}, mo = function(e) {
	return e.ownerSVGElement || ((e.tagName + "").toLowerCase() === "svg" ? e : null);
}, ho = function e(t) {
	if (Qa.getComputedStyle(t).position === "fixed") return !0;
	if (t = t.parentNode, t && t.nodeType === 1) return e(t);
}, go = function e(t, n) {
	if (t.parentNode && (Za || so(t))) {
		var r = mo(t), i = r ? r.getAttribute("xmlns") || "http://www.w3.org/2000/svg" : "http://www.w3.org/1999/xhtml", a = r ? n ? "rect" : "g" : "div", o = n === 2 ? 100 : 0, s = n === 3 ? 100 : 0, c = "position:absolute;display:block;pointer-events:none;margin:0;padding:0;", l = Za.createElementNS ? Za.createElementNS(i.replace(/^https/, "http"), a) : Za.createElement(a);
		return n && (r ? (no ||= e(t), l.setAttribute("width", .01), l.setAttribute("height", .01), l.setAttribute("transform", "translate(" + o + "," + s + ")"), no.appendChild(l)) : (to || (to = e(t), to.style.cssText = c), l.style.cssText = c + "width:0.1px;height:0.1px;top:" + s + "px;left:" + o + "px", to.appendChild(l))), l;
	}
	throw "Need document and parent.";
}, _o = function(e) {
	for (var t = new xo(), n = 0; n < e.numberOfItems; n++) t.multiply(e.getItem(n).matrix);
	return t;
}, vo = function(e) {
	var t = e.getCTM(), n;
	return t || (n = e.style[ao], e.style[ao] = "none", e.appendChild(io), t = io.getCTM(), e.removeChild(io), n ? e.style[ao] = n : e.style.removeProperty(ao.replace(/([A-Z])/g, "-$1").toLowerCase())), t || ro.clone();
}, yo = function(e, t) {
	var n = mo(e), r = e === n, i = n ? lo : uo, a = e.parentNode, o, s, c, l, u, d;
	if (e === Qa) return e;
	if (i.length || i.push(go(e, 1), go(e, 2), go(e, 3)), o = n ? no : to, n) r ? (c = vo(e), l = -c.e / c.a, u = -c.f / c.d, s = ro) : e.getBBox ? (c = e.getBBox(), s = e.transform ? e.transform.baseVal : {}, s = s.numberOfItems ? s.numberOfItems > 1 ? _o(s) : s.getItem(0).matrix : ro, l = s.a * c.x + s.c * c.y, u = s.b * c.x + s.d * c.y) : (s = new xo(), l = u = 0), t && e.tagName.toLowerCase() === "g" && (l = u = 0), (r ? n : a).appendChild(o), o.setAttribute("transform", "matrix(" + s.a + "," + s.b + "," + s.c + "," + s.d + "," + (s.e + l) + "," + (s.f + u) + ")");
	else {
		if (l = u = 0, oo) for (s = e.offsetParent, c = e; (c &&= c.parentNode) && c !== s && c.parentNode;) (Qa.getComputedStyle(c)[ao] + "").length > 4 && (l = c.offsetLeft, u = c.offsetTop, c = 0);
		if (d = Qa.getComputedStyle(e), d.position !== "absolute" && d.position !== "fixed") for (s = e.offsetParent; a && a !== s;) l += a.scrollLeft || 0, u += a.scrollTop || 0, a = a.parentNode;
		c = o.style, c.top = e.offsetTop - u + "px", c.left = e.offsetLeft - l + "px", c[ao] = d[ao], c[q] = d[q], c.position = d.position === "fixed" ? "fixed" : "absolute", e.parentNode.appendChild(o);
	}
	return o;
}, bo = function(e, t, n, r, i, a, o) {
	return e.a = t, e.b = n, e.c = r, e.d = i, e.e = a, e.f = o, e;
}, xo = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a) {
		e === void 0 && (e = 1), t === void 0 && (t = 0), n === void 0 && (n = 0), r === void 0 && (r = 1), i === void 0 && (i = 0), a === void 0 && (a = 0), bo(this, e, t, n, r, i, a);
	}
	var t = e.prototype;
	return t.inverse = function() {
		var e = this.a, t = this.b, n = this.c, r = this.d, i = this.e, a = this.f, o = e * r - t * n || 1e-10;
		return bo(this, r / o, -t / o, -n / o, e / o, (n * a - r * i) / o, -(e * a - t * i) / o);
	}, t.multiply = function(e) {
		var t = this.a, n = this.b, r = this.c, i = this.d, a = this.e, o = this.f, s = e.a, c = e.c, l = e.b, u = e.d, d = e.e, f = e.f;
		return bo(this, s * t + l * r, s * n + l * i, c * t + u * r, c * n + u * i, a + d * t + f * r, o + d * n + f * i);
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
function So(e, t, n, r) {
	if (!e || !e.parentNode || (Za || so(e)).documentElement === e) return new xo();
	var i = co(e), a = mo(e) ? lo : uo, o = yo(e, n), s = a[0].getBoundingClientRect(), c = a[1].getBoundingClientRect(), l = a[2].getBoundingClientRect(), u = o.parentNode, d = !r && ho(e), f = new xo((c.left - s.left) / 100, (c.top - s.top) / 100, (l.left - s.left) / 100, (l.top - s.top) / 100, s.left + (d ? 0 : po()), s.top + (d ? 0 : fo()));
	if (u.removeChild(o), i) for (s = i.length; s--;) c = i[s], c.scaleX = c.scaleY = 0, c.renderTransform(1, c);
	return t ? f.inverse() : f;
}
//#endregion
//#region node_modules/gsap/MotionPathPlugin.js
var Co = "x,translateX,left,marginLeft,xPercent".split(","), wo = "y,translateY,top,marginTop,yPercent".split(","), To = Math.PI / 180, Eo, Do, Oo, ko, Ao, jo, Mo = function() {
	return Eo || typeof window < "u" && (Eo = window.gsap) && Eo.registerPlugin && Eo;
}, No = function(e, t, n, r) {
	for (var i = t.length, a = r === 2 ? 0 : r, o = 0; o < i; o++) e[a] = parseFloat(t[o][n]), r === 2 && (e[a + 1] = 0), a += 2;
	return e;
}, Po = function(e, t, n) {
	return parseFloat(e._gsap.get(e, t, n || "px")) || 0;
}, Fo = function(e) {
	var t = e[0], n = e[1], r;
	for (r = 2; r < e.length; r += 2) t = e[r] += t, n = e[r + 1] += n;
}, Io = function(e, t, n, r, i, a, o, s, c) {
	return o.type === "cubic" ? t = [t] : (o.fromCurrent !== !1 && t.unshift(Po(n, r, s), i ? Po(n, i, c) : 0), o.relative && Fo(t), t = [(i ? Ya : Ja)(t, o.curviness)]), t = a(Vo(t, n, o)), Ho(e, n, r, t, "x", s), i && Ho(e, n, i, t, "y", c), Va(t, o.resolution || (o.curviness === 0 ? 20 : 12));
}, Lo = function(e) {
	return e;
}, Ro = /[-+\.]*\d+\.?(?:e-|e\+)?\d*/g, zo = function(e, t, n) {
	var r = So(e), i = 0, a = 0, o;
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
}, Bo = function(e, t, n, r) {
	var i = So(e.parentNode, !0, !0), a = i.clone().multiply(So(t)), o = zo(e, n, i), s = zo(t, r, i), c = s.x, l = s.y, u;
	return a.e = a.f = 0, r === "auto" && t.getTotalLength && t.tagName.toLowerCase() === "path" && (u = t.getAttribute("d").match(Ro) || [], u = a.apply({
		x: +u[0],
		y: +u[1]
	}), c += u.x, l += u.y), u && (u = a.apply(t.getBBox()), c -= u.x, l -= u.y), a.e = c - o.x, a.f = l - o.y, a;
}, Vo = function(e, t, n) {
	var r = n.align, i = n.matrix, a = n.offsetX, o = n.offsetY, s = n.alignOrigin, c = e[0][0], l = e[0][1], u = Po(t, "x"), d = Po(t, "y"), f, p, m;
	return !e || !e.length ? ja("M0,0L0,0") : (r && (r === "self" || (f = ko(r)[0] || t) === t ? Ga(e, 1, 0, 0, 1, u - c, d - l) : (s && s[2] !== !1 ? Eo.set(t, { transformOrigin: s[0] * 100 + "% " + s[1] * 100 + "%" }) : s = [Po(t, "xPercent") / -100, Po(t, "yPercent") / -100], p = Bo(t, f, s, "auto"), m = p.apply({
		x: c,
		y: l
	}), Ga(e, p.a, p.b, p.c, p.d, u + p.e - (m.x - p.e), d + p.f - (m.y - p.f)))), i ? Ga(e, i.a, i.b, i.c, i.d, i.e, i.f) : (a || o) && Ga(e, 1, 0, 0, 1, a || 0, o || 0), e);
}, Ho = function(e, t, n, r, i, a) {
	var o = t._gsap, s = o.harness, c = s && s.aliases && s.aliases[n], l = c && c.indexOf(",") < 0 ? c : n, u = e._pt = new Do(e._pt, t, l, 0, 0, Lo, 0, o.set(t, l, e));
	u.u = Oo(o.get(t, l, a)) || 0, u.path = r, u.pp = i, e._props.push(l);
}, Uo = function(e, t) {
	return function(n) {
		return e || t !== 1 ? za(n, e, t) : n;
	};
}, Wo = {
	version: "3.12.7",
	name: "motionPath",
	register: function(e, t, n) {
		Eo = e, Oo = Eo.utils.getUnit, ko = Eo.utils.toArray, Ao = Eo.core.getStyleSaver, jo = Eo.core.reverting || function() {}, Do = n;
	},
	init: function(e, t, n) {
		if (!Eo) return console.warn("Please gsap.registerPlugin(MotionPathPlugin)"), !1;
		(!(typeof t == "object" && !t.style) || !t.path) && (t = { path: t });
		var r = [], i = t, a = i.path, o = i.autoRotate, s = i.unitX, c = i.unitY, l = i.x, u = i.y, d = a[0], f = Uo(t.start, "end" in t ? t.end : 1), p, m;
		if (this.rawPaths = r, this.target = e, this.tween = n, this.styles = Ao && Ao(e, "transform"), (this.rotate = o || o === 0) && (this.rOffset = parseFloat(o) || 0, this.radians = !!t.useRadians, this.rProp = t.rotation || "rotation", this.rSet = e._gsap.set(e, this.rProp, this), this.ru = Oo(e._gsap.get(e, this.rProp)) || 0), Array.isArray(a) && !("closed" in a) && typeof d != "number") {
			for (m in d) !l && ~Co.indexOf(m) ? l = m : !u && ~wo.indexOf(m) && (u = m);
			for (m in l && u ? r.push(Io(this, No(No([], a, l, 0), a, u, 1), e, l, u, f, t, s || Oo(a[0][l]), c || Oo(a[0][u]))) : l = u = 0, d) m !== l && m !== u && r.push(Io(this, No([], a, m, 2), e, m, 0, f, t, Oo(a[0][m])));
		} else p = f(Vo(ja(t.path), e, t)), Va(p, t.resolution), r.push(p), Ho(this, e, t.x || "x", p, "x", t.unitX || "px"), Ho(this, e, t.y || "y", p, "y", t.unitY || "px");
		n.vars.immediateRender && this.render(n.progress(), this);
	},
	render: function(e, t) {
		var n = t.rawPaths, r = n.length, i = t._pt;
		if (t.tween._time || !jo()) {
			for (e > 1 ? e = 1 : e < 0 && (e = 0); r--;) Wa(n[r], e, !r && t.rotate, n[r]);
			for (; i;) i.set(i.t, i.p, i.path[i.pp] + i.u, i.d, e), i = i._next;
			t.rotate && t.rSet(t.target, t.rProp, n[0].angle * (t.radians ? To : 1) + t.rOffset + t.ru, t, e);
		} else t.styles.revert();
	},
	getLength: function(e) {
		return Va(ja(e)).totalLength;
	},
	sliceRawPath: za,
	getRawPath: ja,
	pointsToSegment: Ya,
	stringToRawPath: qa,
	rawPathToString: Xa,
	transformRawPath: Ga,
	getGlobalMatrix: So,
	getPositionOnPath: Wa,
	cacheRawPathMeasurements: Va,
	convertToPath: function(e, t) {
		return ko(e).map(function(e) {
			return La(e, t !== !1);
		});
	},
	convertCoordinates: function(e, t, n) {
		var r = So(t, !0, !0).multiply(So(e));
		return n ? r.apply(n) : r;
	},
	getAlignMatrix: Bo,
	getRelativePosition: function(e, t, n, r) {
		var i = Bo(e, t, n, r);
		return {
			x: i.e,
			y: i.f
		};
	},
	arrayToRawPath: function(e, t) {
		t ||= {};
		var n = No(No([], e, t.x || "x", 0), e, t.y || "y", 1);
		return t.relative && Fo(n), [t.type === "cubic" ? n : Ya(n, t.curviness)];
	}
};
Mo() && Eo.registerPlugin(Wo);
//#endregion
//#region src/table/animations/initMotion.ts
var Go = !1;
function Ko() {
	Go ||= (K.registerPlugin(Wo), !0);
}
function qo(e) {
	typeof window > "u" || (Ko(), ((e instanceof HTMLElement ? e : null) ?? document.querySelector(".btable-wrap") ?? document.querySelector(".btable-session"))?.setAttribute("data-gsap-motion", "true"));
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
var $o = /* @__PURE__ */ new Set(), es = re.drawDiscard;
function ts(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function ns(e = document) {
	let t = (e instanceof Document ? e : e.ownerDocument ?? document).querySelector("[data-discard-pile-anchor]");
	return t ? ta(t) : null;
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
	qo(r.root ?? document);
	let i = I(), a = ns(r.root ?? document), o = F(es, i), s = i ? .03 : .055, c = K.timeline({ onComplete: () => {
		$o.delete(c), r.onComplete?.();
	} });
	$o.add(c), e.forEach((e, l) => {
		let u = Xo(t[l] ?? `discard-${n + l}`, n + l), d = ta(e);
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
		let f = a.left + a.width / 2 + u.offsetX, p = a.top + a.height / 2 + u.offsetY, m = d.left + d.width / 2, h = d.top + d.height / 2, g = f - m, _ = p - h, { midX: v, midY: y } = ts(g, _);
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
			ease: ne,
			onComplete: () => {
				K.set(e, { clearProps: "transform,opacity,willChange,zIndex" }), r.onCardComplete?.(l);
			}
		}, l * s);
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
	let i = ta(r);
	return Array.from({ length: t }, (e, t) => ({
		...i,
		left: i.left + t * 3,
		top: i.top - t * 2
	}));
}
//#endregion
//#region src/table/animations/cardMotion.ts
function cs() {
	qo();
}
var ls = /* @__PURE__ */ new WeakMap();
function us(e = document) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = t.querySelector("[data-testid=\"deal-button\"]") ?? t.querySelector(".deck-stack__pile") ?? t.querySelector(".deck-stack");
	return n ? ta(n) : null;
}
function ds(e, t) {
	return ls.get(e)?.kill(), ls.set(e, t), t;
}
function fs(e) {
	e && (ls.get(e)?.kill(), ls.delete(e), K.killTweensOf(e), K.set(e, { clearProps: "transform,opacity,filter" }));
}
function ps(e, t, n = .22) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * n)
	};
}
function ms(e, t, n = re.dealStagger) {
	cs();
	let r = I(), i = K.timeline(), a = F(re.deal, r);
	return e.forEach((e, o) => {
		let { x: s, y: c } = ia(ta(e), t), { midX: l, midY: u } = ps(s, c, .28);
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
			ease: ne,
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
			ease: ne,
			onComplete: f
		}, d);
	}), i;
}
function hs(e, t) {
	cs();
	let n = I(), r = K.timeline(), i = F(re.drawReceive, n), a = n ? .04 : re.drawReceiveStagger;
	return e.forEach((e, n) => {
		let { x: o, y: s } = ia(ta(e), t);
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
			ease: P,
			onComplete: () => {
				K.set(e, { clearProps: "transform,opacity,willChange" });
			}
		}, n * a);
	}), r;
}
function gs(e) {
	cs();
	let t = K.timeline(), n = F(re.standPat);
	return e.forEach((e) => {
		t.fromTo(e, {
			y: 0,
			scale: 1
		}, {
			y: -5,
			scale: 1.02,
			duration: n * .45,
			ease: ne,
			yoyo: !0,
			repeat: 1,
			onComplete: () => {
				K.set(e, { clearProps: "transform,willChange" });
			}
		}, 0);
	}), t;
}
function _s(e) {
	cs();
	let t = K.timeline(), n = F(re.foldOut);
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
			ease: N,
			onComplete: () => fs(e)
		}, r * .04);
	}), t;
}
function vs(e) {
	cs();
	let t = F(.32);
	return K.set(e, {
		transformOrigin: "50% 90%",
		willChange: "transform"
	}), ds(e, K.to(e, {
		y: -26,
		rotationX: 14,
		rotationY: -10,
		scale: 1.05,
		duration: t,
		ease: ne
	}));
}
//#endregion
//#region src/table/animations/drawSeatMotion.ts
var ys = /* @__PURE__ */ new Set();
function bs(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function xs() {
	for (let e of ys) e.kill();
	ys.clear();
}
function Ss(e) {
	let t = document.createElement("div");
	return t.className = "draw-receive-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function Cs(e, t, n, r = {}) {
	qo(n);
	let i = I(), a = F(re.drawReceive, i), o = i ? .04 : re.drawReceiveStagger, s = [];
	for (let r = 0; r < t.length; r++) {
		let t = Ss(e);
		n.appendChild(t), s.push(t);
	}
	let c = K.timeline({ onComplete: () => {
		for (let e of s) e.remove();
		ys.delete(c), window.clearTimeout(u), r.onComplete?.();
	} });
	ys.add(c);
	let l = Math.round((s.length > 0 ? (s.length - 1) * o : 0) * 1e3 + a * 1e3 + 40), u = window.setTimeout(() => {
		c.progress() < 1 && c.progress(1);
	}, Math.min(680, Math.max(320, l)));
	return c.eventCallback("onInterrupt", () => {
		for (let e of s) e.remove();
		ys.delete(c), window.clearTimeout(u);
	}), s.forEach((e, n) => {
		let r = t[n], s = ta(e), l = r.left + r.width / 2, u = r.top + r.height / 2, d = s.left + s.width / 2, f = s.top + s.height / 2, p = l - d, m = u - f, { midX: h, midY: g } = bs(p, m);
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
			ease: P
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
function ws(e) {
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
	Cs(a, o, r, { onComplete: i });
}
//#endregion
//#region src/table/hooks/useDiscardPileState.ts
function Ts({ handNumber: e, sessionPhase: t }) {
	let [n, r] = (0, l.useState)([]), i = (0, l.useRef)(0), a = (0, l.useRef)(e), o = (0, l.useRef)(t ?? null);
	return (0, l.useEffect)(() => {
		a.current !== e && (a.current = e, i.current = 0, rs(), xs(), r([]));
	}, [e]), (0, l.useEffect)(() => {
		let e = t ?? null, n = o.current;
		o.current = e, n === "draw" && e === "play" && (rs(), xs(), r([]));
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
function Es({ cardElements: e, cardKeys: t, playerId: n, pileStartIndex: r, root: i, onComplete: a }) {
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
function Ds({ playerId: e, handNumber: t, discardCount: n, pileStartIndex: r, root: i, onComplete: a }) {
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
function Os(e, t) {
	return t.map((t) => {
		let n = e[t];
		return n ? `${n.rank}-${n.suit}` : `idx-${t}`;
	});
}
function ks(e, t) {
	if (!e) return [];
	let n = [...e.querySelectorAll(".hand__slot .pcard")];
	return t.length > 0 ? t.map((e) => n[e]).filter((e) => !!e) : [...e.querySelectorAll(".hand__slot--draw-selected .pcard, .hand__slot--draw-recommended .pcard")];
}
//#endregion
//#region src/table/animations/useHeroCardMotion.ts
function As(e) {
	return `${e.rank}-${e.suit}`;
}
function js(e) {
	return e ? [...e.querySelectorAll(".hand__slot .pcard")] : [];
}
function Ms(e, { dealing: t, dealStaggerMs: n, drawAnimSubPhase: r, drawDiscardCount: i = 0, drawReplaceCount: a = 0, pendingDiscardIndices: o, standPatPulse: s, foldOutPulse: c, playingIndex: u, cards: d, handNumber: f = 0, playerId: p = null, tableRootRef: m, pileIndexRef: h, onDiscardCommitted: g, skipHeroDealMotion: _ = !1 }) {
	let v = (0, l.useRef)([]), y = (0, l.useRef)(!1), b = (0, l.useRef)(null), x = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		qo(e.current?.closest(".btable-wrap") ?? document);
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
		let r = e.current, i = js(r);
		if (!i.length) return;
		y.current = !0;
		let a = us(r ?? document);
		a && ms(i, a, Math.max(.04, n / 1e3));
	}, [
		t,
		d.length,
		n,
		e,
		_
	]), (0, l.useLayoutEffect)(() => {
		if (r === "discard") {
			if (i <= 0) return;
			v.current = d.map(As);
			let t = e.current, n = m?.current ?? t?.closest(".btable-wrap"), r = ks(t, o);
			if (!r.length || !n || !p) return;
			let a = `${f}:${p}:discard:${r.length}:${o.join(",")}`;
			if (x.current === a) return;
			x.current = a, Es({
				cardElements: r,
				cardKeys: Os(d, o.length ? o : r.map((e, t) => t)),
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
			let t = e.current, n = js(t), r = new Set(v.current), i = d.map((e, t) => ({
				key: As(e),
				el: n[t]
			})).filter((e) => !!e.el && !r.has(e.key)).map((e) => e.el), o = us(t ?? document);
			i.length && o && hs(i, o);
			return;
		}
		(r === "done" || r === null) && (x.current = null, v.current = d.map(As));
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
		let t = js(e.current);
		t.length && gs(t);
	}, [s, e]), (0, l.useLayoutEffect)(() => {
		if (!c) return;
		let t = js(e.current);
		t.length && _s(t);
	}, [c, e]), (0, l.useLayoutEffect)(() => {
		let t = e.current, n = js(t);
		if (u === null) {
			if (b.current !== null) {
				let e = n[b.current];
				e && fs(e), b.current = null;
			}
			return;
		}
		if (b.current === u) return;
		if (b.current !== null) {
			let e = n[b.current];
			e && fs(e);
		}
		let r = n[u];
		r && (vs(r), b.current = u);
	}, [
		u,
		d,
		e
	]), (0, l.useLayoutEffect)(() => () => {
		for (let t of js(e.current)) fs(t);
	}, [e]);
}
function Ns(e, t) {
	let n = t / 1e3, r = Math.max(e - 1, 0) * n;
	return Math.round((r + re.deal) * 1e3);
}
//#endregion
//#region src/table/handUi.ts
function Ps(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function Fs(e, t) {
	if (t) return "Join hand";
	switch (e) {
		case "reveal": return "Deal";
		case "decision": return "Join hand";
		case "draw": return "Draw";
		case "play": return "Play card";
		default: return "Waiting";
	}
}
function Is(e, t) {
	return t || e === "decision" ? "Tap I'm in or Pass at your seat" : e === "draw" ? "Choose cards to discard, then tap Draw" : e === "play" ? "Tap a card to play" : null;
}
function Ls(e) {
	return e.handComplete ? "Hand result — next hand coming up" : !e.cardsDealt && !e.enrollmentActive || e.isMyTurn ? null : e.enrollmentActive || e.phase === "decision" || e.phase === "draw" || e.phase === "play" || e.phase === "reveal" ? "Waiting for other players" : null;
}
function Rs(e) {
	return {
		spades: "Spades",
		hearts: "Hearts",
		diamonds: "Diamonds",
		clubs: "Clubs"
	}[e ?? ""] ?? e ?? "—";
}
function zs(e) {
	return e === "reveal" || e === "decision" || e === "draw" || e === "play";
}
function Bs(e) {
	return e === "decision";
}
function Vs(e) {
	return e === "reveal";
}
function Hs(e, t) {
	if (!e) return null;
	let n = t.find((t) => t.playerId === e);
	return n ? n.isSelf ? "Your turn" : `${n.displayName}'s turn` : null;
}
//#endregion
//#region src/table/trickPlayFly.ts
var Us = /* @__PURE__ */ new Map(), Ws = /* @__PURE__ */ new Map();
function Gs(e) {
	return `${e.playerId}:${e.card.rank}:${e.card.suit}`;
}
function Ks(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function qs(e) {
	return document.querySelector(`[data-seat-play-origin="${e}"]`);
}
function Js(e) {
	let t = qs(e);
	return t ? Ks(t) : null;
}
function Ys(e) {
	return document.querySelector(`[data-trick-play-origin-active="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin-active="${e}"]`) ?? document.querySelector(`[data-trick-play-origin="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin="${e}"]`) ?? qs(e);
}
function Xs(e) {
	let t = Ys(e);
	return t ? Ks(t) : null;
}
function Zs(e) {
	let t = Xs(e);
	if (t) return Ws.set(e, t), t;
	let n = Js(e);
	return n ? (Ws.set(e, n), n) : null;
}
function Qs(e) {
	for (let t of e) Zs(t);
}
function $s(e) {
	return Ws.get(e);
}
function ec(e, t) {
	if (t) {
		let e = Us.get(t);
		if (e) return e;
	}
	return $s(e) ?? Xs(e) ?? Js(e) ?? null;
}
function tc(e, t) {
	let n = ec(e, t);
	return n && Us.set(t, n), n;
}
function nc(e, t, n) {
	let r = document.querySelector("[data-testid=\"hero-hand\"]")?.querySelectorAll(".hand__slot .pcard")[n];
	if (r) {
		let n = Ks(r);
		return Us.set(t, n), Ws.set(e, n), n;
	}
	return tc(e, t);
}
function rc(e, t, n) {
	let r = e.left + e.width / 2, i = e.top + e.height / 2, a = n.left + n.width / 2, o = n.top + n.height / 2;
	return {
		dx: r - a,
		dy: i - o
	};
}
function ic() {
	Us.clear(), Ws.clear();
}
//#endregion
//#region src/table/tableMicrointeractions.ts
var ac = {
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
}, oc = {
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
function sc(e) {
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
function cc(e, t) {
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
var lc = "nbl-best-play";
function uc() {
	try {
		return localStorage.getItem(lc) === "1";
	} catch {
		return !1;
	}
}
function dc(e) {
	try {
		localStorage.setItem(lc, e ? "1" : "0");
	} catch {}
}
//#endregion
//#region src/game/playerOrder.ts
function fc(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function pc(e, t, n) {
	let r = fc(e, n), i = new Set(t);
	return r.filter((e) => i.has(e));
}
//#endregion
//#region src/game/types.ts
var mc = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
};
function hc(e) {
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
function gc(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/playContext.ts
function _c(e, t) {
	let n = k(e, t);
	return n.length ? n.reduce((e, t) => D(t) >= D(e) ? t : e) : null;
}
function vc(e) {
	if (!e.cinchEnabled) return !1;
	let t = k(e.hand, e.trumpSuit);
	return t.filter((e) => D(e) >= 13).length >= 3 && t.length > 0;
}
function yc(e, t) {
	let n = _c(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function bc(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => gc([e.card])[0]) : [];
}
function xc(e) {
	let t = e.currentTrick ?? null, n = bc(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function Sc(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = xc(e.publicHand);
	return {
		hand: e.hand,
		trumpSuit: e.publicHand.trumpSuit,
		leadSuit: r,
		trickPlays: t,
		isLeading: n,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	};
}
function Cc(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return vc(e) && !yc(n, e) ? {
		allowed: !1,
		reason: "Cinch: play your highest trump",
		code: "CINCH_HIGHEST_TRUMP"
	} : { allowed: !0 };
	let r = e.leadSuit ?? e.trickPlays[0]?.suit;
	return r ? k(e.hand, r).length > 0 ? n.suit === r ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must follow suit",
		code: "MUST_FOLLOW_SUIT"
	} : k(e.hand, e.trumpSuit).length > 0 ? O(n, e.trumpSuit) ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must play a trump when void in the led suit",
		code: "MUST_TRUMP"
	} : { allowed: !0 } : { allowed: !0 };
}
function wc(e, t, n, r) {
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
function Tc(e, t, n) {
	let r = e.filter((e) => !O(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => D(t) > D(e) ? t : e) : null;
}
function Ec(e, t) {
	let n = e.filter((e) => O(e, t));
	return n.length ? n.reduce((e, t) => D(t) > D(e) ? t : e) : null;
}
function Dc(e, t) {
	return D(e) > D(t);
}
function Oc(e) {
	return {
		hand: e.hand,
		trumpSuit: e.trumpSuit,
		leadSuit: e.leadSuit,
		trickPlays: e.trickPlays,
		isLeading: e.isLeading,
		cinchEnabled: e.cinchEnabled
	};
}
function kc(e, t = {}) {
	let n = Oc(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = Cc(n, r);
			i.allowed ? e.push(r) : wc(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? k(n.hand, r) : [], a = k(n.hand, n.trumpSuit), o = r ? Tc(n.trickPlays, r, n.trumpSuit) : null, s = Ec(n.trickPlays, n.trumpSuit), c;
	if (i.length > 0) {
		if (c = i, !s && o) {
			let e = i.filter((e) => Dc(e, o));
			e.length && (c = e);
		}
	} else if (a.length > 0) {
		if (c = a, s) {
			let e = a.filter((e) => Dc(e, s));
			e.length && (c = e);
		}
	} else c = [...n.hand];
	let l = [];
	for (let e = 0; e < n.hand.length; e += 1) c.some((t) => t.rank === n.hand[e].rank && t.suit === n.hand[e].suit) && l.push(e);
	return l;
}
//#endregion
//#region src/game/trick.ts
function Ac(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => O(e.card, n));
	if (r.length) return r.reduce((e, t) => D(t.card) > D(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => D(t.card) > D(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
function jc(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: D(e),
		trump: O(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function Mc(e, t) {
	let n = kc(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => D(e[n]) > D(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => D(e[n]) < D(e[t]) ? n : t);
	let i = n.filter((n) => Ac([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => D(e[n]) < D(e[t]) ? n : t);
}
//#endregion
//#region src/table/heroHandPlayPreselect.ts
function Nc(e, t) {
	return e === t ? null : t;
}
function Pc(e, t) {
	return t ? t.includes(e) : !0;
}
function Fc(e) {
	return [
		e.phase ?? "",
		e.handNumber,
		e.trickNumber ?? "",
		e.turnPlayerId ?? "",
		e.playerId ?? ""
	].join("|");
}
function Ic(e, t) {
	return Fc(e) === Fc(t);
}
function Lc(e, t, n) {
	if (!n?.length || !e.length) return null;
	let r = Mc(e, Sc({
		hand: e,
		publicHand: t
	}));
	return n.includes(r) ? r : n[0] ?? null;
}
function Rc(e, t, n, r = Infinity, i = []) {
	if (!e.length || n <= 0) return [];
	let a = new Set(i), o = e.map((e, t) => t).filter((e) => !a.has(e)).filter((n) => !O(e[n], t)).filter((t) => e[t].rank !== "A");
	return o.length ? jc(o.map((t) => e[t]), t, n, r).map((e) => o[e]) : [];
}
function zc(e) {
	let t = [...e.selectedDraw].sort((e, t) => e - t);
	return e.drawSelectionTouched || t.length > 0 ? t : e.bestPlayEnabled ? [...e.recommendedDiscardIndices].sort((e, t) => e - t) : [];
}
//#endregion
//#region src/table/feedback/soundPacks.ts
var Bc = {
	classic: "Classic",
	wood: "Wood & Felt",
	arcade: "Arcade"
}, Vc = "classic", Hc = {
	classic: "",
	wood: "packs/wood/",
	arcade: "packs/arcade/"
}, Uc = {
	shuffle: "shuffle.mp3",
	draw: "draw.mp3",
	trickWin: "trick-win.mp3",
	bigWin: "big-win.mp3",
	bourre: "bourre.mp3",
	gameStart: "game-start.mp3"
};
function Wc(e, t) {
	return `./sounds/${Hc[e] ?? ""}${Uc[t]}`;
}
function Gc(e) {
	return Object.keys(Uc).map((t) => Wc(e, t));
}
function Kc(e) {
	return e === "wood" || e === "arcade" ? e : Vc;
}
//#endregion
//#region src/table/feedback/prefs.ts
var qc = "nbl-feedback", Jc = {
	soundMode: "on",
	soundPackId: Vc,
	hapticsMode: "on"
};
function Yc(e) {
	if (!e || typeof e != "object") return { ...Jc };
	let t = e, n = t.hapticsMode, r = n === "off" || n === "minimal" || n === "on" ? n : t.hapticsEnabled === !1 ? "off" : "on", i;
	return i = t.soundMode === "on" || t.soundMode === "minimal" || t.soundMode === "off" ? t.soundMode : t.soundEnabled === !1 ? "off" : "on", {
		soundMode: i,
		soundPackId: Kc(t.soundPackId),
		hapticsMode: r
	};
}
function Xc() {
	try {
		let e = localStorage.getItem(qc);
		return e ? Yc(JSON.parse(e)) : { ...Jc };
	} catch {
		return { ...Jc };
	}
}
function Zc(e) {
	let t = {
		...Xc(),
		...e
	};
	try {
		localStorage.setItem(qc, JSON.stringify(t));
	} catch {}
	return tl(t), t;
}
function Qc(e, t) {
	return e === "off" ? !1 : e === "on" ? !0 : t === "trickWin" || t === "bigWin" || t === "bourre";
}
var $c = /* @__PURE__ */ new Set();
function el(e) {
	return $c.add(e), () => $c.delete(e);
}
function tl(e) {
	for (let t of $c) t(e);
}
function nl() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function rl(e, t) {
	return !(e === "off" || e === "minimal" && t === "light" || nl() && t === "light");
}
//#endregion
//#region src/table/feedback/audio.ts
var il = null, J = null, al = !1, ol = /* @__PURE__ */ new Map(), sl = /* @__PURE__ */ new Map();
function cl() {
	return Xc().soundPackId;
}
function ll() {
	if (typeof window > "u") return null;
	try {
		let e = window.AudioContext ?? window.webkitAudioContext;
		return e ? (il || (il = new e(), J = il.createGain(), J.gain.value = .55, J.connect(il.destination)), il) : null;
	} catch {
		return null;
	}
}
async function ul() {
	al = !0;
	let e = ll();
	if (e) {
		if (e.state === "suspended") try {
			await e.resume();
		} catch {}
		pl();
	}
}
function dl(e) {
	if (typeof window > "u") return null;
	try {
		let t = ol.get(e);
		return t || (t = new Audio(e), t.preload = "auto", ol.set(e, t)), t;
	} catch {
		return null;
	}
}
async function fl(e) {
	if (sl.has(e)) return sl.get(e) === !0;
	if (typeof window > "u") return !1;
	try {
		let t = (await fetch(e, { method: "HEAD" })).ok;
		return sl.set(e, t), t;
	} catch {
		return sl.set(e, !1), !1;
	}
}
async function pl(e) {
	if (!al) return;
	let t = e ?? cl();
	await Promise.all(Gc(t).map(async (e) => {
		if (!await fl(e)) return;
		let t = dl(e);
		if (t) try {
			t.load();
		} catch {}
	}));
}
async function ml(e, t = .55) {
	if (!al || !await fl(e)) return !1;
	let n = dl(e);
	if (!n) return !1;
	try {
		return n.volume = t, n.currentTime = 0, await n.play(), !0;
	} catch {
		return !1;
	}
}
function hl(e, t, n, r, i, a, o = "sine") {
	let s = e.createOscillator(), c = e.createGain();
	s.type = o, s.frequency.setValueAtTime(n, r), c.gain.setValueAtTime(1e-4, r), c.gain.exponentialRampToValueAtTime(a, r + .008), c.gain.exponentialRampToValueAtTime(1e-4, r + i), s.connect(c), c.connect(t), s.start(r), s.stop(r + i + .02);
}
function gl(e, t, n, r, i, a = 1400) {
	let o = Math.max(256, Math.floor(e.sampleRate * r)), s = e.createBuffer(1, o, e.sampleRate), c = s.getChannelData(0);
	for (let e = 0; e < o; e += 1) c[e] = (Math.random() * 2 - 1) * (1 - e / o);
	let l = e.createBufferSource();
	l.buffer = s;
	let u = e.createBiquadFilter();
	u.type = "bandpass", u.frequency.value = a, u.Q.value = .6;
	let d = e.createGain();
	d.gain.setValueAtTime(i, n), d.gain.exponentialRampToValueAtTime(1e-4, n + r), l.connect(u), u.connect(d), d.connect(t), l.start(n), l.stop(n + r + .01);
}
function _l(e) {
	let t = ll();
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
	for (let e of r) gl(t, J, n + e, .05, .08 + Math.random() * .04, i);
}
function vl(e) {
	let t = ll();
	if (!t || !J) return;
	let n = t.currentTime;
	gl(t, J, n, .04, .06, e === "wood" ? 700 : 1200), hl(t, J, e === "arcade" ? 660 : 520, n + .05, .08, .05, "triangle");
}
function yl(e) {
	let t = ll();
	if (!t || !J) return;
	let n = t.currentTime;
	if (e === "arcade") {
		hl(t, J, 1046.5, n, .1, .1, "square"), hl(t, J, 1318.51, n + .08, .14, .08, "square");
		return;
	}
	let r = e === "wood" ? 740 : 880;
	hl(t, J, r, n, .12, .09, "sine"), hl(t, J, r * 1.335, n + .07, .16, .07, "triangle"), hl(t, J, r * 2, n + .14, .1, .04, "sine");
}
function bl(e) {
	let t = ll();
	if (!t || !J) return;
	let n = t.currentTime;
	if (e === "arcade") {
		hl(t, J, 523.25, n, .12, .09, "square"), hl(t, J, 659.25, n + .1, .16, .1, "square"), hl(t, J, 783.99, n + .22, .2, .1, "square"), hl(t, J, 1046.5, n + .34, .24, .07, "square");
		return;
	}
	let r = e === "wood" ? .92 : 1;
	hl(t, J, 659.25 * r, n, .14, .08, "sine"), hl(t, J, 830.61 * r, n + .1, .18, .09, "triangle"), hl(t, J, 987.77 * r, n + .22, .22, .1, "sine"), hl(t, J, 1318.51 * r, n + .34, .28, .06, "triangle");
}
function xl(e) {
	let t = ll();
	if (!t || !J) return;
	let n = t.currentTime, r = e === "arcade" ? "sawtooth" : "triangle";
	hl(t, J, e === "wood" ? 180 : 220, n, .28, .1, r), hl(t, J, e === "wood" ? 140 : 165, n + .18, .32, .08, r);
}
function Sl(e) {
	let t = ll();
	if (!t || !J) return;
	let n = t.currentTime;
	if (e === "arcade") {
		hl(t, J, 440, n, .08, .07, "square"), hl(t, J, 554.37, n + .1, .12, .08, "square");
		return;
	}
	hl(t, J, e === "wood" ? 392 : 440, n, .1, .07, "sine"), hl(t, J, e === "wood" ? 523.25 : 554.37, n + .12, .16, .08, "triangle");
}
var Cl = {
	shuffle: _l,
	draw: vl,
	trickWin: yl,
	bigWin: bl,
	bourre: xl,
	gameStart: Sl
}, wl = {
	shuffle: { current: !1 },
	draw: { current: !1 },
	trickWin: { current: !1 },
	bigWin: { current: !1 },
	bourre: { current: !1 },
	gameStart: { current: !1 }
}, Tl = {
	shuffle: 360,
	draw: 280,
	trickWin: 320,
	bigWin: 580,
	bourre: 520,
	gameStart: 320
}, El = {
	shuffle: .55,
	draw: .45,
	trickWin: .55,
	bigWin: .6,
	bourre: .5,
	gameStart: .42
};
async function Dl(e) {
	let t = wl[e];
	if (t.current) return;
	t.current = !0;
	let n = cl(), r = Wc(n, e);
	try {
		!await ml(r, El[e]) && al && Cl[e](n);
	} catch {} finally {
		window.setTimeout(() => {
			t.current = !1;
		}, Tl[e]);
	}
}
function Ol() {
	Dl("shuffle");
}
function kl() {
	Dl("draw");
}
function Al() {
	Dl("trickWin");
}
function jl() {
	Dl("bigWin");
}
function Ml() {
	Dl("bourre");
}
function Nl() {
	Dl("gameStart");
}
function Pl() {
	return typeof window < "u" && !!(window.AudioContext ?? window.webkitAudioContext ?? typeof Audio < "u");
}
function Fl() {
	sl.clear();
}
//#endregion
//#region src/table/feedback/haptics.ts
function Il() {
	return typeof navigator < "u" && typeof navigator.vibrate == "function";
}
function Ll(e) {
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
var Y = {
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
function X(e) {
	try {
		return Ll(e) ? !0 : Il() ? navigator.vibrate(Y[e]) ?? !1 : !1;
	} catch {
		return !1;
	}
}
function Rl() {
	return Il() || !!(typeof window < "u" && window.BourreHaptics);
}
var zl = 700, Bl = 500, Vl = 450, Hl = 1200, Ul = 2e3, Wl = 1500, Gl = 280, Kl = 0, ql = 0, Jl = 0, Yl = 0, Xl = 0, Zl = 0, Ql = 0, $l = null, eu = !1;
function tu() {
	return Xc();
}
function nu(e) {
	rl(tu().hapticsMode, e) && X(e);
}
function ru(e, t) {
	Qc(tu().soundMode, e) && t();
}
function iu() {
	if (eu || typeof window > "u") return;
	eu = !0;
	let e = () => {
		ul();
	};
	window.addEventListener("pointerdown", e, {
		once: !0,
		passive: !0
	}), window.addEventListener("keydown", e, { once: !0 });
}
function au(e = {}) {
	if (Date.now() - Kl < zl) return;
	$l &&= (clearTimeout($l), null);
	let t = e.delayMs ?? (nl() ? 0 : 40);
	$l = window.setTimeout(() => {
		$l = null, Kl = Date.now(), ru("shuffle", Ol), nu("light");
	}, t);
}
function ou() {
	let e = Date.now();
	e - ql < Bl || (ql = e, ru("draw", kl), nu("light"));
}
function su() {
	let e = Date.now();
	e - Jl < Vl || (Jl = e, ru("trickWin", Al), nu("medium"));
}
function cu() {
	let e = Date.now();
	e - Yl < Hl || (Yl = e, ru("bigWin", jl), nu("strong"));
}
function lu() {
	let e = Date.now();
	e - Xl < Ul || (Xl = e, ru("bourre", Ml), nu("medium"));
}
function uu() {
	let e = Date.now();
	e - Zl < Wl || (Zl = e, ru("gameStart", Nl), nu("light"));
}
function du() {
	let e = Date.now();
	e - Ql < Gl || (Ql = e, nu("light"));
}
function fu() {
	nu("light");
}
//#endregion
//#region src/table/actionErrorCopy.ts
function pu(e) {
	let t = String(e ?? "").trim();
	if (!t) return null;
	let n = t.toLowerCase();
	return n === "internal" || n.includes("internal error") ? "The server could not finish that table action. Refresh the page and try again." : t;
}
//#endregion
//#region src/table/theme/cardPacks.ts
var mu = "classic";
function hu(e) {
	return e === "elegant" || e === "casino" || e === "midnight" ? e : mu;
}
//#endregion
//#region src/table/theme/settings.ts
var gu = "nbl-table-settings", _u = {
	focusTable: "F",
	toggleSettings: ",",
	standPat: "P",
	nextTable: "Tab"
}, vu = {
	classic: "Classic",
	elegant: "Elegant",
	casino: "Casino",
	midnight: "Midnight"
}, yu = {
	themeId: "night-felt",
	cardPackId: mu,
	deckMode: "classic",
	cardScale: "md",
	highContrast: !1,
	tableScale: 1,
	layoutMode: "single",
	hotkeys: { ..._u }
}, bu = {
	carbon: "Carbon",
	simple: "Simple",
	"night-felt": "Night Felt",
	arena: "Arena"
};
function xu(e) {
	return Math.max(.85, Math.min(1.35, e));
}
function Su() {
	try {
		let e = localStorage.getItem(gu);
		if (!e) return {
			...yu,
			hotkeys: { ..._u }
		};
		let t = JSON.parse(e);
		return {
			...yu,
			...t,
			cardPackId: hu(t.cardPackId),
			tableScale: xu(t.tableScale ?? yu.tableScale),
			hotkeys: {
				..._u,
				...t.hotkeys
			}
		};
	} catch {
		return {
			...yu,
			hotkeys: { ..._u }
		};
	}
}
function Cu(e) {
	try {
		localStorage.setItem(gu, JSON.stringify(e));
	} catch {}
}
function wu(e, t) {
	e.dataset.tableTheme = t.themeId, e.dataset.cardPack = t.cardPackId, e.dataset.deckMode = t.deckMode, e.dataset.cardScale = t.cardScale, e.dataset.highContrast = t.highContrast ? "true" : "false", e.dataset.layoutMode = t.layoutMode, e.style.setProperty("--table-scale", String(t.tableScale));
}
//#endregion
//#region src/table/theme/TableThemeContext.tsx
var Tu = (0, l.createContext)(null);
function Eu({ settings: e, children: t }) {
	let n = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		n.current && wu(n.current, e);
	}, [e]), /* @__PURE__ */ (0, C.jsx)("div", {
		ref: n,
		className: "btable-room",
		children: t
	});
}
function Du({ children: e }) {
	let [t, n] = (0, l.useState)(() => Su()), r = (0, l.useCallback)((e) => {
		n((t) => {
			let n = {
				...t,
				...e,
				hotkeys: {
					...t.hotkeys,
					...e.hotkeys
				}
			};
			return Cu(n), n;
		});
	}, []), i = (0, l.useCallback)(() => {
		let e = {
			...yu,
			hotkeys: { ...yu.hotkeys }
		};
		Cu(e), n(e);
	}, []), a = (0, l.useMemo)(() => ({
		settings: t,
		updateSettings: r,
		resetSettings: i
	}), [
		t,
		r,
		i
	]);
	return /* @__PURE__ */ (0, C.jsx)(Tu.Provider, {
		value: a,
		children: /* @__PURE__ */ (0, C.jsx)(Eu, {
			settings: t,
			children: e
		})
	});
}
//#endregion
//#region src/table/theme/useTableTheme.ts
function Ou() {
	let e = (0, l.useContext)(Tu);
	if (!e) throw Error("useTableTheme must be used within TableThemeProvider");
	return e;
}
//#endregion
//#region src/table/playClickDebug.ts
function ku() {
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem("nbl-play-click-debug") === "1" ? !0 : new URLSearchParams(window.location.search).has("playClickDebug");
	} catch {
		return !1;
	}
}
function Au(e, t) {
	ku() && console.log("[PLAY-CLICK]", e, t ?? {});
}
//#endregion
//#region src/table/HeroHandActionButtons.tsx
function ju({ visible: e, busy: t, selectedCount: n, onDraw: r, onPassDraw: i, onFoldDraw: a }) {
	let o = (0, l.useCallback)(() => {
		r();
	}, [r]), s = (0, l.useCallback)(() => {
		i();
	}, [i]), c = (0, l.useCallback)(() => {
		a();
	}, [a]);
	return /* @__PURE__ */ (0, C.jsx)("div", {
		className: "btable-hero__actions-slot",
		"aria-hidden": !e,
		children: e && /* @__PURE__ */ (0, C.jsxs)("div", {
			className: "btable-hero__actions btable-hero__actions--triple",
			children: [
				/* @__PURE__ */ (0, C.jsx)("button", {
					type: "button",
					className: "btn btn--sm btn--primary",
					"data-testid": "draw-button",
					disabled: t,
					"aria-busy": t,
					onClick: o,
					children: t ? "Drawing…" : `Draw${n > 0 ? ` (${n})` : ""}`
				}),
				/* @__PURE__ */ (0, C.jsx)("button", {
					type: "button",
					className: "btn btn--sm btn--secondary-muted",
					"data-testid": "pass-draw-button",
					disabled: t,
					onClick: s,
					children: "Stand pat"
				}),
				/* @__PURE__ */ (0, C.jsx)("button", {
					type: "button",
					className: "btn btn--sm btn--secondary-muted",
					"data-testid": "im-out-button",
					disabled: t,
					onClick: c,
					children: "I'm Out"
				})
			]
		})
	});
}
var Mu = (0, l.memo)(ju);
//#endregion
//#region src/table/HeroHand.tsx
function Nu(e, t, n = []) {
	return [
		`btable-hero btable-hero--bare btable-hero--scale-${e.cardScale}`,
		...n,
		t
	].filter(Boolean).join(" ");
}
function Pu({ className: e = "" }) {
	return /* @__PURE__ */ (0, C.jsx)("div", {
		className: `btable-hero btable-hero--bare btable-hero--reserved ${e}`.trim(),
		"aria-hidden": "true",
		"data-testid": "hero-hand"
	});
}
var Fu = (0, l.memo)(function({ cards: e, phase: t, enrollmentActive: n = !1, isInHand: r = !1, isDealer: i = !1, signedIn: a = !1, isMyTurn: o = !1, drawCompleted: s = !1, maxDrawDiscards: c = 4, legalPlayIndices: u, recommendedPlayIndex: d = null, recommendedDiscardIndices: f = [], handComplete: p = !1, actionFeedback: m, onSubmitDraw: h, onPassDraw: g, onFoldDraw: _, onPlayCard: v, privateHandReady: y = !1, className: b = "", dealStaggerMs: x = 120, drawAnimSubPhase: S = null, drawDiscardCount: w = 0, drawReplaceCount: T = 0, currentUserId: E = null, revealedTrumpIndex: D = null, trumpMergeActive: O = !1, trumpDisabledIndex: k = null, handNumber: A = 0, trickNumber: j = null, turnPlayerId: M = null, tableRootRef: ee, pileIndexRef: ne, onDiscardCommitted: N, onUserActivity: P, skipHeroDealMotion: re = !1 }) {
	let { settings: ie } = Ou(), [F, I] = (0, l.useState)(/* @__PURE__ */ new Set()), [L, R] = (0, l.useState)(null), [z, B] = (0, l.useState)(null), [ae, V] = (0, l.useState)(null), [oe, se] = (0, l.useState)(!1), [H, ce] = (0, l.useState)(null), [le, ue] = (0, l.useState)(null), [de, fe] = (0, l.useState)(null), [pe, me] = (0, l.useState)(() => uc()), [he, ge] = (0, l.useState)(!1), [_e, ve] = (0, l.useState)(!1), [ye, be] = (0, l.useState)(!1), [xe, Se] = (0, l.useState)([]), Ce = (0, l.useRef)(/* @__PURE__ */ new Set()), we = (0, l.useRef)(null), Te = (0, l.useRef)(!1), Ee = (0, l.useRef)(null), De = (0, l.useRef)(null), Oe = (0, l.useRef)(!1), ke = (0, l.useRef)(null), [Ae, U] = (0, l.useState)(!1), je = (0, l.useRef)(async () => {}), Me = zs(t), Ne = (0, l.useMemo)(() => e.map(Ps), [e]), Pe = (0, l.useMemo)(() => e.map((e) => `${e.rank}-${e.suit}`).join("|"), [e]), Fe = (0, l.useMemo)(() => f.slice().sort((e, t) => e - t).join(","), [f]), Ie = t === "draw", Le = t === "play", Re = oe || m?.status === "loading" || z !== null, ze = (0, l.useCallback)((e, t) => D === t ? O ? "hand__slot--trump-merge-target" : "hand__slot--trump-revealed" : "", [D, O]);
	(0, l.useEffect)(() => {
		if (re || !Me || e.length === 0) return;
		let t = new Set(e.map((e) => `${e.rank}-${e.suit}`)), n = Ce.current, r = [...t].some((e) => !n.has(e));
		if (Ce.current = t, !r || n.size > 0) return;
		ge(!0), B(null), R(null);
		let i = Ns(e.length, x), a = window.setTimeout(() => ge(!1), i);
		return () => window.clearTimeout(a);
	}, [
		e,
		Me,
		x,
		re
	]), (0, l.useEffect)(() => {
		(S === "done" || S === null) && Se([]);
	}, [S]), Ms(we, {
		dealing: he,
		dealStaggerMs: x,
		drawAnimSubPhase: S,
		drawDiscardCount: w,
		drawReplaceCount: T,
		pendingDiscardIndices: xe,
		standPatPulse: _e,
		foldOutPulse: ye,
		playingIndex: z,
		cards: e,
		handNumber: A,
		playerId: E,
		tableRootRef: ee,
		pileIndexRef: ne,
		onDiscardCommitted: N,
		skipHeroDealMotion: re
	});
	let Be = (0, l.useCallback)(() => {
		Ee.current != null && (window.clearTimeout(Ee.current), Ee.current = null), De.current = null, Oe.current = !1, ke.current = null;
	}, []), Ve = (0, l.useCallback)(() => ({
		phase: t,
		handNumber: A,
		trickNumber: j,
		turnPlayerId: M,
		playerId: E
	}), [
		t,
		A,
		j,
		M,
		E
	]), He = (0, l.useCallback)((e, n) => !(n == null || !Ic(n, Ve()) || t !== "play" || !o || !Pc(e, u) || Te.current || Re), [
		Ve,
		t,
		o,
		u,
		Re
	]), Ue = (0, l.useCallback)((e) => {
		if (!E) return;
		let t = Ne[e];
		t && nc(E, Gs({
			playerId: E,
			card: {
				rank: String(t.rank),
				suit: String(t.suit)
			}
		}), e);
	}, [E, Ne]), We = (0, l.useCallback)((e, t) => {
		Be(), De.current = e, Oe.current = t, ke.current = Ve();
		let n = t ? ac.turnHandoff : ac.autoPlayPreselect;
		Au(t ? "preselectEffect:armTurnHandoff" : "preselectEffect:armTimer", {
			index: e,
			delay: n
		}), Ee.current = window.setTimeout(() => {
			Ee.current = null;
			let t = De.current, n = ke.current;
			De.current = null, Oe.current = !1, ke.current = null, Au("preselectEffect:timerFire", {
				pending: t,
				index: e
			}), t === e && He(t, n) && je.current(t);
		}, n);
	}, [
		Be,
		Ve,
		He
	]);
	(0, l.useEffect)(() => () => Be(), [Be]), (0, l.useEffect)(() => {
		Be(), R(null), I(/* @__PURE__ */ new Set()), U(!1), V(null), ue(null), fe(null), ce(null);
	}, [
		t,
		Pe,
		A,
		j,
		M,
		Be
	]), (0, l.useEffect)(() => {
		L !== null && (Pc(L, u) || (R(null), De.current = null, Be()));
	}, [
		u,
		L,
		Be
	]), (0, l.useEffect)(() => {
		if (L === null || Ee.current == null) return;
		let e = ke.current;
		!e || Ic(e, Ve()) || (Be(), R(null));
	}, [
		L,
		t,
		A,
		j,
		M,
		E,
		Ve,
		Be
	]), (0, l.useEffect)(() => {
		!pe || !Ie || s || Ae || I(new Set(f));
	}, [
		pe,
		Ie,
		s,
		Ae,
		Fe,
		f
	]), (0, l.useEffect)(() => {
		if (!(!Le || !o || L === null || Te.current || Re)) {
			if (!Pc(L, u)) {
				R(null), De.current = null;
				return;
			}
			Ee.current ?? (Ue(L), We(L, Oe.current));
		}
	}, [
		Le,
		o,
		L,
		u,
		Re,
		We,
		Ue
	]), (0, l.useEffect)(() => {
		(m?.status === "success" || m?.status === "error") && (B(null), R(null), Be(), Te.current = !1);
	}, [m?.status, Be]);
	let Ge = (0, l.useRef)(void 0);
	(0, l.useEffect)(() => {
		let e = m?.status, t = Ge.current;
		Ge.current = e, t === "error" && e !== "error" && ce(null);
	}, [m?.status]);
	let Ke = ie.cardScale === "lg" ? "md" : "sm", qe = pu(m?.status === "error" ? m.message : H), Je = Fs(t, n);
	(0, l.useEffect)(() => {
		P && Ie && F.size > 0 && P();
	}, [
		Ie,
		F.size,
		P
	]), (0, l.useEffect)(() => {
		P && Le && L !== null && P();
	}, [
		Le,
		L,
		P
	]);
	let Ye = (0, l.useCallback)(() => {
		P?.();
	}, [P]), Xe = (0, l.useCallback)((e) => {
		Re || k === e || (U(!0), Ye(), ce(null), I((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.size < c ? n.add(e) : ce(`You may discard at most ${c} cards`), n;
		}));
	}, [
		Re,
		c,
		k,
		Ye
	]), Ze = (0, l.useCallback)(async (e) => {
		if (Te.current || Re || !v || !Pc(e, u)) return;
		Be(), Te.current = !0, R(null), B(e), ce(null);
		let t = Ne[e];
		E && t && nc(E, Gs({
			playerId: E,
			card: {
				rank: String(t.rank),
				suit: String(t.suit)
			}
		}), e);
		try {
			await Promise.resolve(v(e)), B(null), Te.current = !1;
		} catch {
			B(null), Te.current = !1;
		}
	}, [
		Re,
		u,
		v,
		E,
		Ne,
		Be
	]), Qe = (0, l.useCallback)((e) => {
		if (Au("preselectCard:enter", {
			index: e,
			isMyTurn: o,
			busy: Re,
			playLock: Te.current,
			phase: t,
			selectedPlay: L,
			hasOnPlayCard: !!v,
			legal: Pc(e, u)
		}), Te.current || Re || !v || t !== "play") {
			Au("preselectCard:blocked", {
				index: e,
				reason: Te.current ? "playLock" : Re ? "busy" : v ? "phase" : "noOnPlayCard"
			});
			return;
		}
		if (!Pc(e, u)) {
			o && (du(), Be(), R(null), ue(e), fe(e), window.setTimeout(() => {
				ue(null), fe(null);
			}, ac.illegalFlash), ce("Illegal play")), Au("preselectCard:illegal", {
				index: e,
				isMyTurn: o
			});
			return;
		}
		let n = o ? e : Nc(L, e);
		if (Au("preselectCard:toggle", {
			index: e,
			nextSelection: n,
			isMyTurn: o,
			selectedPlay: L
		}), Be(), R(n), ce(null), Ye(), n === null) {
			De.current = null, Au("preselectCard:deselected", { index: e });
			return;
		}
		if (De.current = n, !o) {
			Oe.current = !0, Ue(n), Au("preselectCard:queued", { index: n });
			return;
		}
		Ue(n), We(n, !1);
	}, [
		Re,
		Be,
		o,
		u,
		v,
		t,
		Ye,
		L,
		We,
		Ue
	]);
	je.current = Ze;
	let $e = (0, l.useCallback)(async (e) => {
		if (!(!h || Re)) {
			if (Ye(), e.length > c) {
				ce(`You may discard at most ${c} cards`);
				return;
			}
			se(!0), ce(null), Se([...e]);
			try {
				await h(e), I(/* @__PURE__ */ new Set());
			} catch {} finally {
				se(!1);
			}
		}
	}, [
		h,
		Re,
		c,
		Ye
	]), et = (0, l.useCallback)(async () => {
		if (!(!g || Re)) {
			Ye(), se(!0), ce(null);
			try {
				await g(), I(/* @__PURE__ */ new Set()), ve(!0), window.setTimeout(() => ve(!1), 700);
			} catch {} finally {
				se(!1);
			}
		}
	}, [
		g,
		Re,
		Ye
	]), tt = (0, l.useCallback)(async () => {
		if (!(!_ || Re)) {
			Ye(), be(!0), se(!0), ce(null);
			try {
				await _(), I(/* @__PURE__ */ new Set());
			} catch {
				be(!1);
			} finally {
				se(!1);
			}
		}
	}, [
		_,
		Re,
		Ye
	]), nt = (0, l.useCallback)((e) => {
		du(), Be(), R(null), ue(e), fe(e), window.setTimeout(() => {
			ue(null), fe(null);
		}, ac.illegalFlash), ce("Illegal play");
	}, [Be]), rt = (0, l.useCallback)((e) => {
		if (me(e), dc(e), e) {
			U(!1), Ie && !s && I(new Set(f));
			return;
		}
		Ae || I(/* @__PURE__ */ new Set());
	}, [
		Ae,
		Ie,
		s,
		f
	]), it = a && r && (Ie || Le), at = (0, l.useMemo)(() => zc({
		selectedDraw: F,
		drawSelectionTouched: Ae,
		bestPlayEnabled: pe,
		recommendedDiscardIndices: f
	}), [
		F,
		Ae,
		pe,
		Fe,
		f
	]), ot = it && Le && pe && L === null && d !== null && d >= 0, st = (0, l.useCallback)((e, t) => D === t ? "trump" : k === t && (Ie || Le) ? "muted" : z === t || de === t || le === t ? "default" : Ie && F.has(t) ? "draw-selected" : Le && L === t ? "play-preselected" : ot && d === t ? "play-recommended" : Le && u && !u.includes(t) ? "muted" : "default", [
		D,
		k,
		Ie,
		Le,
		z,
		de,
		le,
		F,
		L,
		ot,
		d,
		u
	]), ct = (0, l.useMemo)(() => Le && r ? "play" : Ie && r && !s ? "draw-select" : Me && r && !(Le && o) ? "peek" : "none", [
		Me,
		r,
		Le,
		o,
		Ie,
		s
	]), lt = Me && r && !(Le && o), ut = (0, l.useCallback)((e) => {
		Au("Hand.onPlayCard", {
			index: e,
			isMyTurn: o,
			gestureMode: ct
		}), Qe(e);
	}, [
		ct,
		o,
		Qe
	]), dt = (0, l.useMemo)(() => ({
		mode: ct,
		isMyTurn: o,
		legalPlayIndices: u,
		playingIndex: z,
		illegalShakeIndex: le,
		illegalFlashIndex: de,
		busy: Re,
		showPlayableHint: !1,
		allowPlayPreselect: Le && r && !o && !Re && z === null,
		trickPlayOriginPlayerId: E,
		onPlayCard: ut,
		onSelectCard: Xe,
		onIllegalPlay: nt,
		onPeek: V
	}), [
		ct,
		o,
		u,
		z,
		le,
		de,
		Re,
		Le,
		r,
		E,
		ut,
		Xe,
		nt
	]), ft = at.length, pt = Ie && !s && o, mt = (0, l.useCallback)(() => {
		$e(at);
	}, [$e, at]), ht = (0, l.useCallback)(() => {
		et();
	}, [et]), gt = (0, l.useCallback)(() => {
		tt();
	}, [tt]), _t = () => it ? /* @__PURE__ */ (0, C.jsxs)("label", {
		className: "btable-hero__best-play",
		children: [/* @__PURE__ */ (0, C.jsx)("input", {
			type: "checkbox",
			className: "btable-hero__best-play-input",
			checked: pe,
			onChange: (e) => rt(e.target.checked),
			"data-testid": "best-play-checkbox"
		}), /* @__PURE__ */ (0, C.jsx)("span", {
			className: "btable-hero__best-play-label",
			children: "Best Play"
		})]
	}) : null;
	return a ? !r && !n && !Me ? /* @__PURE__ */ (0, C.jsx)(Pu, { className: b }) : Me && r && e.length === 0 ? p && n ? /* @__PURE__ */ (0, C.jsx)(Pu, { className: b }) : /* @__PURE__ */ (0, C.jsxs)("div", {
		className: Nu(ie, b),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: [/* @__PURE__ */ (0, C.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: y ? "Cards not available — leave and re-open the session, or refresh the page." : "Loading your cards…"
		}), /* @__PURE__ */ (0, C.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: _t()
		})]
	}) : Me && !r && (t === "draw" || t === "play") ? /* @__PURE__ */ (0, C.jsx)("div", {
		className: Nu(ie, b),
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, C.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "You sat out this hand."
		})
	}) : e.length === 0 && !i ? it ? /* @__PURE__ */ (0, C.jsx)("div", {
		className: Nu(ie, b, ["btable-hero--reserved"]),
		"data-testid": "hero-hand",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, C.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: _t()
		})
	}) : /* @__PURE__ */ (0, C.jsx)(Pu, { className: b }) : /* @__PURE__ */ (0, C.jsxs)("div", {
		className: Nu(ie, b, [
			he && !re ? "btable-hero--dealing" : "",
			D === null ? "" : "btable-hero--trump-reveal",
			O ? "btable-hero--trump-merge" : "",
			Ie && o && !s ? "btable-hero--draw-select" : "",
			S === "discard" && w > 0 ? "btable-hero--draw-discard" : "",
			S === "receive" && T > 0 ? "btable-hero--draw-receive" : "",
			pt ? "btable-hero--draw-actions" : "",
			Ie && o && !s || Le && o ? "btable-hero--your-turn" : "",
			(Ie || Le) && r && !o ? "btable-hero--waiting-turn" : "",
			_e ? "btable-hero--stand-pat" : "",
			ye ? "btable-hero--fold-out" : ""
		]),
		style: { "--deal-card-stagger-ms": `${x}ms` },
		"data-testid": "hero-hand",
		"aria-label": `Your dealt cards — ${Je}`,
		children: [
			/* @__PURE__ */ (0, C.jsxs)("p", {
				className: "btable-sr-only",
				"aria-live": "polite",
				children: [
					Je,
					Ie && !s && o && " — tap cards to discard; red border marks your selection",
					Le && o && " — tap a legal card to play",
					pe && Le && " — green outline marks Best Play suggestions"
				]
			}),
			/* @__PURE__ */ (0, C.jsxs)("div", {
				ref: we,
				className: "btable-hero__hand-3d",
				"data-trick-play-origin": E ?? void 0,
				"data-trick-play-origin-active": Le && o && E ? E : void 0,
				children: [/* @__PURE__ */ (0, C.jsx)("div", {
					className: "btable-hero__hand-row",
					"data-hero-play-turn": Le && o ? "true" : void 0,
					children: /* @__PURE__ */ (0, C.jsx)(te, {
						cards: Ne,
						size: Ke,
						fan: !0,
						dealSeatPlayerId: E,
						stateFor: st,
						slotClassFor: ze,
						peekIndex: ae,
						onCardPeek: lt ? V : void 0,
						cardTestId: Le && o ? "play-button" : void 0,
						cardInteraction: dt
					})
				}), _t()]
			}),
			Le && !o && L !== null && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-hero__hint",
				"data-testid": "play-preselect-hint",
				children: "Your selected card will play on your turn"
			}),
			qe && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-hero__error",
				role: "alert",
				children: qe
			}),
			/* @__PURE__ */ (0, C.jsx)(Mu, {
				visible: pt,
				busy: Re,
				selectedCount: ft,
				onDraw: mt,
				onPassDraw: ht,
				onFoldDraw: gt
			})
		]
	}) : /* @__PURE__ */ (0, C.jsx)("div", {
		className: Nu(ie, b),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, C.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "Sign in to see your dealt cards."
		})
	});
});
//#endregion
//#region src/table/BigPotBrewingIndicator.tsx
function Iu({ event: e, onDismiss: t }) {
	return (0, l.useEffect)(() => {
		let n = window.setTimeout(() => t(e.id), e.durationMs ?? 2e3);
		return () => window.clearTimeout(n);
	}, [
		e.id,
		e.durationMs,
		t
	]), /* @__PURE__ */ (0, C.jsxs)("div", {
		className: "bpot-brew",
		role: "status",
		"aria-live": "polite",
		"data-testid": "big-pot-brewing",
		children: [/* @__PURE__ */ (0, C.jsx)("div", {
			className: "bpot-brew__glow",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, C.jsxs)("div", {
			className: "bpot-brew__content",
			children: [
				e.emoji && /* @__PURE__ */ (0, C.jsx)("span", {
					className: "bpot-brew__emoji",
					children: e.emoji
				}),
				/* @__PURE__ */ (0, C.jsx)("p", {
					className: "bpot-brew__title",
					children: e.title
				}),
				e.subtitle && /* @__PURE__ */ (0, C.jsx)("p", {
					className: "bpot-brew__subtitle",
					children: e.subtitle
				})
			]
		})]
	});
}
//#endregion
//#region src/table/heroCardArea.ts
function Lu(e) {
	return (e?.length ?? 0) === 0;
}
//#endregion
//#region src/table/layout/seatPresetAnchors.ts
var Ru = {
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
}, zu = {
	sixBotBottomLeft: Ru[1],
	sixBotBottomRight: Ru[6],
	sixBotTopCenter: Ru[4]
}, Bu = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: zu.sixBotBottomLeft,
	2: Ru[3],
	3: Ru[5],
	4: zu.sixBotBottomRight
}, Vu = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: zu.sixBotBottomLeft,
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
	5: zu.sixBotBottomRight
}, Hu = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: zu.sixBotBottomLeft,
	2: Ru[2],
	3: Ru[3],
	4: zu.sixBotTopCenter,
	5: Ru[5],
	6: {
		x: 98,
		y: 46.5,
		region: "right"
	},
	7: zu.sixBotBottomRight
}, Uu = {
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
}, Wu = {
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
}, Gu = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: Uu[1],
	2: Uu[2],
	3: Uu[3],
	4: Uu[4],
	5: Uu[5],
	6: {
		x: 92,
		y: 46.5,
		region: "right"
	},
	7: Uu[6]
}, Ku = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: Wu[1],
	2: Wu[2],
	3: Wu[3],
	4: Wu[4],
	5: Wu[5],
	6: {
		x: 92,
		y: 46.5,
		region: "right"
	},
	7: Wu[6]
};
Uu[1], Uu[6], Uu[4];
function qu(e) {
	return e === "landscape" ? Wu : Uu;
}
function Ju(e) {
	return e === "landscape" ? Ku : Gu;
}
function Yu(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function Xu(e, t) {
	return Yu(e, t) >= 5;
}
function Zu(e, t, n) {
	if (n !== "play") return [];
	let r = [...new Set(t.filter(Boolean))];
	return r.length < 2 || 5 - Yu(e, r) != 1 ? [] : r.filter((t) => (e[t] ?? 0) === 0);
}
function Qu(e, t, n, r) {
	return Zu(t, n, r).includes(e);
}
function $u(e, t) {
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
function ed(e) {
	return `$${e.toLocaleString("en-US")}`;
}
function td(e) {
	let t = Math.round(Number(e) * 100) / 100;
	return !Number.isFinite(t) || t <= 0 ? "$0" : t < 1 ? `${Math.round(t * 100)}¢` : Math.round(t * 100) % 100 == 0 ? `$${Math.round(t).toLocaleString("en-US")}` : `$${t.toFixed(2)}`;
}
function nd(e) {
	let t = Number(e) || 0;
	return t > 0 ? `+${ed(t)}` : t < 0 ? `−${ed(Math.abs(t))}` : ed(0);
}
function rd(e) {
	return ed(Math.max(0, Number(e) || 0));
}
function id(e, t, n) {
	return e == null || n.anteAlreadyPosted || !n.inHand || !n.anteAnimActive ? e : Math.max(0, e - Math.max(0, t));
}
function ad(e) {
	return (e || "?").trim().replace(/\s+bot$/i, "").replace(/^bot\s+/i, "").trim() || "?";
}
function od(e) {
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
function sd(e) {
	let t = Math.cos(e), n = Math.sin(e);
	return Math.abs(n) >= Math.abs(t) ? n > 0 ? "bottom" : "top" : t > 0 ? "right" : "left";
}
var cd = Hu, ld = Ru, ud = Bu, dd = Vu;
function fd(e, t) {
	let { rx: n, ry: r, outset: i } = od(t), a = e / t * Math.PI * 2 + Math.PI / 2, o = Math.cos(a), s = Math.sin(a);
	return {
		x: 50 + n * o + o * i,
		y: 50 + r * s + s * i,
		region: sd(a)
	};
}
function pd(e, t) {
	let n = Math.max(2, Math.min(8, t || 2));
	if (n <= 0) return {
		x: 50,
		y: 50,
		region: "bottom"
	};
	if (n === 5) {
		let t = ud[e];
		if (t) return t;
	}
	if (n === 6) {
		let t = dd[e];
		if (t) return t;
	}
	if (n === 7) {
		let t = ld[e];
		if (t) return t;
	}
	if (n >= 8) {
		let t = cd[e];
		if (t) return t;
	}
	return fd(e, n);
}
function md(e) {
	let t = Math.max(2, Math.min(8, e || 2));
	return t === 2 ? 1.04 : t === 3 ? .94 : t === 4 ? .98 : t === 5 ? 1.08 : t === 6 ? 1.12 : t === 7 ? 1.16 : 1.2;
}
var hd = 1850, gd = 2050, _d = 1080, vd = 9500, yd = 8500;
function bd(e) {
	return e === "trickComplete" || e === "winnerReveal" || e === "collectTrick" || e === "nextLeadReady";
}
function Z(e = !1) {
	let t = e ? .55 : 1;
	return {
		cardLandMs: Math.round(560 * t),
		postTrickReadMs: Math.round(hd * t),
		winnerRevealMs: Math.round(400 * t),
		trickSweepMs: Math.round(_d * t),
		nextLeadGapMs: Math.round(230 * t),
		trumpBeatReadMs: Math.round(gd * t)
	};
}
function xd(e) {
	let t = Z(e.reducedMotion), n = e.finalTrick ? Math.round(900 * (e.reducedMotion ? .55 : 1)) : 0, r = (e.trumpBeat ? t.trumpBeatReadMs : t.postTrickReadMs) + n, i = Math.min(t.winnerRevealMs, r - 200), a = Math.max(200, r - i), o = t.trickSweepMs, s = t.nextLeadGapMs;
	return {
		readBeforeWinnerMs: a,
		winnerRevealMs: i,
		readTotalMs: r,
		sweepMs: o,
		nextLeadGapMs: s,
		pipelineMs: r + o + s
	};
}
function Sd(e, t, n) {
	let r = n.length > 0 ? n : [...new Set([...Object.keys(e), ...Object.keys(t)])];
	for (let n of r) if ((t[n] ?? 0) > (e[n] ?? 0)) return n;
	return null;
}
function Cd(e, t, n) {
	return e.length > 0 ? e : [...new Set([...Object.keys(t), ...Object.keys(n)])];
}
function wd(e) {
	return e?.plays?.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
}
function Td(e, t, n) {
	return e.length ? e.length === 1 ? e[0].playerId : !t || !n ? e[e.length - 1].playerId : Ac(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n) : null;
}
function Ed(e) {
	let t = wd(e.prevTrick), n = e.playedCards?.filter((t) => t.trickNumber === e.trickNumber).map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
	return n.length > t.length ? n : t;
}
function Dd(e, t, n) {
	if (!e.length || !t || !n || t === n) return !1;
	let r = Ac(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n), i = e.find((e) => e.playerId === r);
	return !!(i && O({
		rank: i.card.rank,
		suit: i.card.suit
	}, n));
}
function Od(e) {
	let { prevTricks: t, nextTricks: n, prevTrick: r, playedCards: i } = e, a = Cd(e.participantIds, t, n), o = Yu(t, a), s = Yu(n, a);
	if (s <= o) return null;
	let c = Sd(t, n, a), l = r?.trickNumber ?? s, u = Ed({
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
function kd() {
	return typeof window > "u" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region src/table/gameFlowDebug.ts
var Ad = "nbl-game-flow-debug", jd = !1, Md = null;
function Nd() {
	if (jd) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(Ad) === "1" ? !0 : new URLSearchParams(window.location.search).has("gameFlowDebug");
	} catch {
		return !1;
	}
}
function Pd(e, t, n, r) {
	Q(e === "hand" ? "handPresentation" : "trickPresentation", "phase-transition", {
		from: t,
		to: n,
		...r
	});
}
function Q(e, t, n) {
	if (!Nd()) return;
	let r = `[nbl-flow ${typeof performance < "u" ? `${performance.now().toFixed(1)}ms` : ""}] ${e} :: ${t}`;
	if (Md) {
		Md(r.trim(), n);
		return;
	}
	console.info(r, n ?? "");
}
//#endregion
//#region src/table/trickPlayHighlight.ts
function Fd(e) {
	let t = e.leaderPlayerId != null && e.playPlayerId === e.leaderPlayerId, n = e.winnerPlayerId != null && e.playPlayerId === e.winnerPlayerId, r = t && (e.presentationPhase === "live" || e.presentationPhase === "trickComplete"), i = n && e.presentationPhase !== "live" && e.presentationPhase !== "trickComplete", a = r || i;
	return {
		showLiveLeaderHighlight: r,
		showResolvedWinnerHighlight: i,
		showWinnerCard: a,
		showLeadingClass: r,
		showWinnerClass: a,
		cardState: a ? "winner" : "default"
	};
}
//#endregion
//#region src/table/TrickPlaySlot.tsx
function Id(e, t, n, r, i) {
	r.current = !1, e(!0), t("static"), n(null), i && Nd() && Q("TrickPlaySlot", "fly-complete", i);
}
function Ld({ play: e, index: t, presentationPhase: n, displayCount: r, playerName: i, leaderPlayerId: a = null, winnerPlayerId: o = null, instantPlace: s = !1 }) {
	let c = (0, l.useRef)(null), [u, d] = (0, l.useState)("static"), [f, p] = (0, l.useState)(null), [m, h] = (0, l.useState)(!1), g = (0, l.useRef)(!1), _ = Gs(e), v = Fd({
		presentationPhase: n,
		leaderPlayerId: a ?? null,
		winnerPlayerId: o ?? null,
		playPlayerId: e.playerId
	}), y = n === "live", b = t === r - 1 && y, x = m, { showLiveLeaderHighlight: S, showWinnerCard: T } = v;
	(0, l.useLayoutEffect)(() => {
		Nd() && Q("TrickPlaySlot", "play-enter", {
			playKey: _,
			index: t,
			instantPlace: s,
			isLanding: b
		}), h(!1), g.current = !1, d("static"), p(null);
	}, [_]), (0, l.useLayoutEffect)(() => {
		if (m) return;
		if (s || !y) {
			Id(h, d, p, g, {
				playKey: _,
				index: t
			});
			return;
		}
		if (!b) {
			Id(h, d, p, g, {
				playKey: _,
				index: t
			});
			return;
		}
		if (typeof document > "u") return;
		let n = c.current;
		if (!n) return;
		let r = n.querySelector(".pcard");
		if (!r) return;
		let i = ec(e.playerId, _);
		if (!i) {
			Id(h, d, p, g, {
				playKey: _,
				index: t
			});
			return;
		}
		let a = kd(), o = a ? 217 : 395, l = a ? 91 : 165;
		g.current = !0, p(rc(i, n.getBoundingClientRect(), r.getBoundingClientRect())), d("pending"), Nd() && Q("TrickPlaySlot", "fly-start", {
			playKey: _,
			index: t,
			travelMs: o,
			settleMs: l
		});
		let u = window.setTimeout(() => d("travel"), 0), f = window.setTimeout(() => d("settle"), o), v = window.setTimeout(() => {
			Id(h, d, p, g, {
				playKey: _,
				index: t
			});
		}, o + l);
		return () => {
			window.clearTimeout(u), window.clearTimeout(f), window.clearTimeout(v);
		};
	}, [
		m,
		s,
		b,
		y,
		e.playerId,
		_
	]);
	let E = {
		"--slot-index": t,
		zIndex: 10 + t,
		...f ? {
			"--fly-dx": `${f.dx}px`,
			"--fly-dy": `${f.dy}px`
		} : {}
	};
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		ref: c,
		className: [
			"btrick__play",
			m ? "btrick__play--landed" : "",
			x ? "btrick__play--settled" : "",
			m && u === "static" ? "btrick__play--static-landed" : "",
			u === "travel" ? "btrick__play--fly-from-hand" : "",
			u === "pending" ? "btrick__play--fly-pending" : "",
			u === "land" ? "btrick__play--land" : "",
			u === "settle" ? "btrick__play--settle" : "",
			S ? "btrick__play--leading" : "",
			T ? "btrick__play--winner" : ""
		].filter(Boolean).join(" "),
		style: E,
		"data-slot-index": t,
		children: [/* @__PURE__ */ (0, C.jsx)(w, {
			card: Ps(e.card),
			size: "sm",
			state: T ? "winner" : "default"
		}), /* @__PURE__ */ (0, C.jsx)("span", {
			className: "btrick__name muted small",
			children: i
		})]
	});
}
//#endregion
//#region src/table/trickRowPresentation.ts
function Rd(e, t = "live") {
	return {
		isHold: e === "trickComplete" || e === "winnerReveal",
		isRake: e === "collectTrick",
		isEcho: t === "echo"
	};
}
//#endregion
//#region src/table/TrickRow.tsx
function zd({ displayPlays: e = [], leaderPlayerId: t = null, winnerPlayerId: n = null, showWinnerTag: r = !1, presentationPhase: i = "live", playerNames: a = {}, variant: o = "live", instantTrickPlays: s = !1, peakCardCount: c = 0 }) {
	(0, l.useEffect)(() => {
		Nd() && Q("TrickRow", e.length === 0 ? "trick-empty" : "trick-cards", {
			count: e.length,
			phase: i
		});
	}, [e.length, i]);
	let u = Math.max(e.length, c, 1);
	if (e.length === 0) return /* @__PURE__ */ (0, C.jsx)("div", {
		className: "btrick btrick--empty muted small",
		"aria-hidden": "true",
		"data-testid": "trick-row",
		"data-trick-phase": i,
		"data-trick-card-count": "0",
		"data-trick-variant": o,
		children: /* @__PURE__ */ (0, C.jsx)("div", {
			className: "btrick__surface",
			children: /* @__PURE__ */ (0, C.jsx)("span", {
				className: "btrick__placeholder",
				children: "Trick"
			})
		})
	});
	let d = n ? a[n] ?? "Player" : null, { isHold: f, isRake: p, isEcho: m } = Rd(i, o);
	return /* @__PURE__ */ (0, C.jsx)("div", {
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
		children: /* @__PURE__ */ (0, C.jsxs)("div", {
			className: "btrick__surface",
			children: [r && d && /* @__PURE__ */ (0, C.jsxs)("div", {
				className: "btrick__winner-tag",
				"data-testid": "trick-winner-tag",
				children: [d, " takes it"]
			}), /* @__PURE__ */ (0, C.jsx)("div", {
				className: "btrick__cards",
				role: "list",
				"aria-label": "Cards in trick",
				style: { "--trick-card-count": u },
				children: e.map((r, o) => /* @__PURE__ */ (0, C.jsx)(Ld, {
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
var Bd = (0, l.memo)(zd);
//#endregion
//#region src/table/DiscardPile.tsx
function Vd({ cards: e }) {
	return /* @__PURE__ */ (0, C.jsx)("div", {
		className: "discard-pile",
		"data-discard-pile-anchor": !0,
		"data-testid": "discard-pile",
		"aria-label": `Discard pile, ${e.length} card${e.length === 1 ? "" : "s"}`,
		children: e.map((e) => /* @__PURE__ */ (0, C.jsx)("div", {
			className: "discard-pile__card",
			style: {
				"--pile-x": `${e.offsetX}px`,
				"--pile-y": `${e.offsetY}px`,
				"--pile-rot": `${e.rotation}deg`,
				"--pile-scale": String(e.scale),
				zIndex: e.zIndex
			},
			children: /* @__PURE__ */ (0, C.jsx)(w, {
				faceDown: !0,
				size: "sm"
			})
		}, e.id))
	});
}
//#endregion
//#region src/table/PotDisplay.tsx
function Hd({ potMetrics: e, participantCount: t, potTick: n = 0, settlePotPayoutActive: r = !1 }) {
	return /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
		/* @__PURE__ */ (0, C.jsxs)("dl", {
			className: "center-play__stats",
			children: [
				/* @__PURE__ */ (0, C.jsxs)("div", {
					className: `bpot__stat bpot__stat--pot${n > 0 ? " bpot__stat--tick" : ""}${r ? " bpot__stat--settle-payout" : ""}`,
					"data-testid": "pot-display",
					"data-settle-pot-anchor": "",
					children: [/* @__PURE__ */ (0, C.jsx)("dt", { children: "Table pot" }), /* @__PURE__ */ (0, C.jsx)("dd", { children: ed(e.currentPot) })]
				}, n > 0 ? `pot-${n}` : "pot-static"),
				/* @__PURE__ */ (0, C.jsxs)("div", {
					className: "bpot__stat",
					"data-testid": "ante-display",
					children: [/* @__PURE__ */ (0, C.jsx)("dt", { children: "Ante / hand" }), /* @__PURE__ */ (0, C.jsx)("dd", { children: td(e.anteAmount) })]
				}),
				e.limEnabled && /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [/* @__PURE__ */ (0, C.jsxs)("div", {
					className: "bpot__stat",
					children: [/* @__PURE__ */ (0, C.jsx)("dt", { children: "Cap" }), /* @__PURE__ */ (0, C.jsxs)("dd", { children: [ed(e.potCap), /* @__PURE__ */ (0, C.jsx)("span", {
						className: "bpot__lim-tag",
						children: "LmT"
					})] })]
				}), /* @__PURE__ */ (0, C.jsxs)("div", {
					className: "bpot__stat bpot__stat--highlight",
					children: [/* @__PURE__ */ (0, C.jsx)("dt", { children: "Max win" }), /* @__PURE__ */ (0, C.jsx)("dd", { children: ed(e.maxWinThisHand) })]
				})] })
			]
		}),
		e.limEnabled && e.overflow > 0 && /* @__PURE__ */ (0, C.jsxs)("div", {
			className: "center-play__carry muted small",
			children: [
				"+",
				ed(e.overflow),
				" carry"
			]
		}),
		/* @__PURE__ */ (0, C.jsxs)("div", {
			className: "center-play__meta muted small",
			children: [t, " in hand"]
		})
	] });
}
var Ud = (0, l.memo)(Hd);
//#endregion
//#region src/table/SettleTrickTotals.tsx
function Wd({ tricksByPlayer: e, seats: t, winnerIds: n, visible: r }) {
	if (!r) return null;
	let i = t.map((t) => ({
		playerId: t.playerId,
		name: t.displayName,
		tricks: e[t.playerId] ?? 0,
		isWinner: n.includes(t.playerId)
	})).sort((e, t) => t.tricks - e.tricks || e.name.localeCompare(t.name));
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		className: "btable-settle-trick-totals",
		role: "status",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, C.jsx)("p", {
			className: "btable-settle-trick-totals__title",
			children: "Hand tricks"
		}), /* @__PURE__ */ (0, C.jsx)("ul", {
			className: "btable-settle-trick-totals__list",
			children: i.map((e) => /* @__PURE__ */ (0, C.jsxs)("li", {
				className: `btable-settle-trick-totals__row${e.isWinner ? " btable-settle-trick-totals__row--winner" : ""}`,
				children: [/* @__PURE__ */ (0, C.jsx)("span", {
					className: "btable-settle-trick-totals__name",
					children: e.name
				}), /* @__PURE__ */ (0, C.jsx)("span", {
					className: "btable-settle-trick-totals__count",
					children: e.tricks
				})]
			}, e.playerId))
		})]
	});
}
//#endregion
//#region src/table/PotCenter.tsx
function Gd({ potMetrics: e, participantCount: t, trumpUpcard: n, trumpSuit: r, phase: i, enrollmentActive: a = !1, remainingDeckCount: o, trickDisplayPlays: s = [], trickLeadSuit: c = null, trickLeaderPlayerId: u = null, trickWinnerPlayerId: f = null, trickShowWinnerTag: p = !1, trickPresentationPhase: m = "live", trickEchoPlays: h = [], trickEchoWinnerId: g = null, trickEchoPhase: _ = "live", showFinalTrickEcho: v = !1, playerNames: y = {}, anteAnimActive: b = !1, trumpRevealActive: x = !1, drawAnimPlayerId: S = null, drawAnimSubPhase: T = "done", drawDiscardCount: E = 0, settleAnimActive: D = !1, settleCarryOver: O = !1, potTick: k = 0, trumpReminderPulse: A = 0, hideCenterTrump: j = !1, showTrumpSuitReminder: M = !1, instantTrickPlays: ee = !1, peakTrickPlayCount: te = 0, discardPileCards: ne = [], settleSubPhase: N = null, settleTricksByPlayer: P = {}, settleWinnerIds: re = [], settleSeatRows: ie = [] }) {
	let F = Fs(i, a), I = u ?? ((m === "live" || m === "trickComplete") && s.length > 0 ? Td(s, c ?? s[0]?.card.suit ?? null, r ?? null) : null), L = m !== "live" && m !== "nextLeadReady", R = s.length, z = R > 0 || te > R || ee, [B, ae] = (0, l.useState)(n ?? null);
	(0, l.useEffect)(() => {
		if (n) {
			ae(n);
			return;
		}
		if (B) {
			if (z || L) {
				let e = window.setTimeout(() => ae(null), 760);
				return () => window.clearTimeout(e);
			}
			ae(null);
		}
	}, [
		n,
		z,
		L,
		B
	]);
	let V = !!B && !j, oe = M || !V && !!r && i === "play", se = V ? `${B.rank}-${B.suit}` : "trump-slot", H = v || D && h.length > 0 && R === 0, ce = N === "trickTotals" && ie.length > 0;
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		className: "table-center-cluster",
		"aria-label": "Table center",
		children: [/* @__PURE__ */ (0, C.jsxs)("div", {
			className: "deck-stack",
			"aria-label": "Deck and trump",
			children: [V ? /* @__PURE__ */ (0, C.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"bpot__trump--deal",
					x ? "bpot__trump--reveal" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-button",
				"data-trump-deal-target": "",
				children: [/* @__PURE__ */ (0, C.jsx)(w, {
					card: {
						rank: B.rank,
						suit: B.suit
					},
					size: "sm",
					state: "trump"
				}), /* @__PURE__ */ (0, C.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, se) : oe ? /* @__PURE__ */ (0, C.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"deck-stack__trump--suit-reminder",
					A > 0 ? "deck-stack__trump--suit-reminder-pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-suit-reminder",
				"aria-label": `Trump suit: ${Rs(r)}`,
				children: [/* @__PURE__ */ (0, C.jsx)("div", {
					className: `trump-suit-badge trump-suit-badge--${r}`,
					"aria-hidden": "true",
					children: d[r]
				}), /* @__PURE__ */ (0, C.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, "trump-reminder") : /* @__PURE__ */ (0, C.jsxs)("div", {
				className: "deck-stack__pile",
				"data-testid": "deal-button",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, C.jsx)("div", { className: "deck-stack__card deck-stack__card--back" }),
					/* @__PURE__ */ (0, C.jsx)("div", { className: "deck-stack__card deck-stack__card--back deck-stack__card--offset" }),
					/* @__PURE__ */ (0, C.jsx)("span", {
						className: "deck-stack__label muted small",
						children: a ? "Dealing" : "Deck"
					})
				]
			}), o != null && o > 0 && /* @__PURE__ */ (0, C.jsxs)("span", {
				className: "deck-stack__count muted small",
				children: [o, " left"]
			})]
		}), /* @__PURE__ */ (0, C.jsxs)("div", {
			className: [
				"center-play",
				b ? "center-play--ante-in" : "",
				D ? "center-play--settle" : "",
				O ? "center-play--carry" : "",
				L ? "center-play--trick-resolving" : "",
				H ? "center-play--final-trick-echo" : ""
			].filter(Boolean).join(" "),
			"data-trick-phase": m,
			"data-trick-cards": R,
			"data-hand-settling": D ? "true" : "false",
			"data-settle-sub-phase": N ?? void 0,
			children: [
				b && /* @__PURE__ */ (0, C.jsx)("div", {
					className: "bpot__ante-chips",
					"aria-hidden": "true",
					children: Array.from({ length: Math.min(t, 8) }, (e, t) => /* @__PURE__ */ (0, C.jsx)("span", {
						className: "bpot__ante-chip",
						style: { "--ante-i": t }
					}, t))
				}),
				i === "draw" ? /* @__PURE__ */ (0, C.jsx)(Vd, { cards: ne }) : null,
				/* @__PURE__ */ (0, C.jsxs)("div", {
					className: "center-play__phase",
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, C.jsx)("span", {
							className: `bpot__phase-tag bpot__phase-tag--${i ?? "waiting"}`,
							"data-testid": "phase-tag-center",
							"data-phase": i ?? "waiting",
							children: F
						}),
						V && r && /* @__PURE__ */ (0, C.jsx)("span", {
							className: "center-play__trump-suit muted small",
							children: Rs(r)
						}),
						oe && /* @__PURE__ */ (0, C.jsxs)("span", {
							className: "center-play__trump-suit center-play__trump-suit--reminder muted small",
							children: [Rs(r), " trump"]
						})
					]
				}),
				/* @__PURE__ */ (0, C.jsxs)("div", {
					className: "center-play__trick-stage",
					children: [
						ce && /* @__PURE__ */ (0, C.jsx)(Wd, {
							tricksByPlayer: P,
							seats: ie,
							winnerIds: re,
							visible: !0
						}),
						/* @__PURE__ */ (0, C.jsx)("div", {
							className: "center-play__trick-live",
							children: /* @__PURE__ */ (0, C.jsx)(Bd, {
								displayPlays: s,
								leaderPlayerId: I,
								winnerPlayerId: f,
								showWinnerTag: p,
								presentationPhase: m,
								playerNames: y,
								instantTrickPlays: ee,
								peakCardCount: te
							})
						}),
						H && /* @__PURE__ */ (0, C.jsx)("div", {
							className: "center-play__trick-echo",
							"aria-hidden": "true",
							children: /* @__PURE__ */ (0, C.jsx)(Bd, {
								displayPlays: h,
								winnerPlayerId: g,
								showWinnerTag: !0,
								presentationPhase: _,
								playerNames: y,
								variant: "echo"
							})
						})
					]
				}),
				/* @__PURE__ */ (0, C.jsx)(Ud, {
					potMetrics: e,
					participantCount: t,
					potTick: k,
					settlePotPayoutActive: N === "potPayout"
				})
			]
		})]
	});
}
var Kd = (0, l.memo)(Gd);
//#endregion
//#region src/table/hooks/useExternalStoreSelector.ts
function qd(e, t, n, r) {
	let i = (0, l.useRef)(n), a = (0, l.useRef)(r);
	i.current = n, a.current = r;
	let o = (0, l.useRef)(n(t())), s = (0, l.useCallback)(() => {
		let e = i.current(t());
		return a.current(o.current, e) || (o.current = e), o.current;
	}, [t]);
	return (0, l.useSyncExternalStore)(e, s, s);
}
//#endregion
//#region src/table/trickPresentationStore.ts
var Jd = null, Yd = /* @__PURE__ */ new Set();
function Xd(e) {
	return e.map((e) => `${e.playerId}:${e.card.rank}:${e.card.suit}`).join("|");
}
function Zd(e) {
	return Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => `${e}:${t}`).join("|");
}
function Qd(e, t) {
	return e ? e.phase !== t.phase || e.revealedCount !== t.revealedCount || e.revealTarget !== t.revealTarget || e.peakPlayCount !== t.peakPlayCount || e.winnerPlayerId !== t.winnerPlayerId || e.showWinnerTag !== t.showWinnerTag || e.trickWinnerSeatId !== t.trickWinnerSeatId || e.suppressTurnPlayerId !== t.suppressTurnPlayerId || e.isPipelineActive !== t.isPipelineActive || e.isResolving !== t.isResolving || e.showFinalTrickEcho !== t.showFinalTrickEcho || e.trickEchoWinnerId !== t.trickEchoWinnerId || e.trickEchoPhase !== t.trickEchoPhase || Xd(e.displayPlays) !== Xd(t.displayPlays) || Xd(e.trickEchoPlays) !== Xd(t.trickEchoPlays) || Zd(e.displayTricksByPlayer) !== Zd(t.displayTricksByPlayer) || e.frozenTrick?.trickNumber !== t.frozenTrick?.trickNumber || e.frozenTrick?.winnerId !== t.frozenTrick?.winnerId || (e.frozenTrick?.plays.length ?? 0) !== (t.frozenTrick?.plays.length ?? 0) : !0;
}
function $d(e) {
	Jd && !Qd(Jd, e) || (Jd = e, Yd.forEach((e) => e()));
}
function ef(e) {
	return Yd.add(e), () => Yd.delete(e);
}
function tf() {
	return Jd;
}
function nf() {
	Jd = null, Yd.forEach((e) => e());
}
//#endregion
//#region src/table/trickPresentationSelectors.ts
var rf = {};
function af(e, t) {
	let n = Object.keys(e), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let r of n) if (e[r] !== t[r]) return !1;
	return !0;
}
function of(e) {
	return e ? {
		phase: e.phase,
		displayTricksByPlayer: e.displayTricksByPlayer,
		trickWinnerSeatId: e.trickWinnerSeatId,
		suppressTurnPlayerId: e.suppressTurnPlayerId,
		isPipelineActive: e.isPipelineActive,
		revealedCount: e.revealedCount,
		revealTarget: e.revealTarget
	} : {
		phase: "live",
		displayTricksByPlayer: rf,
		trickWinnerSeatId: null,
		suppressTurnPlayerId: !1,
		isPipelineActive: !1,
		revealedCount: 0,
		revealTarget: 0
	};
}
function sf(e, t) {
	return e.phase === t.phase && e.trickWinnerSeatId === t.trickWinnerSeatId && e.suppressTurnPlayerId === t.suppressTurnPlayerId && e.isPipelineActive === t.isPipelineActive && e.revealedCount === t.revealedCount && e.revealTarget === t.revealTarget && af(e.displayTricksByPlayer, t.displayTricksByPlayer);
}
function cf(e) {
	return e ? {
		trickDisplayPlays: e.displayPlays,
		trickWinnerPlayerId: e.winnerPlayerId,
		trickShowWinnerTag: e.showWinnerTag,
		trickPresentationPhase: e.phase,
		trickEchoPlays: e.trickEchoPlays,
		trickEchoWinnerId: e.trickEchoWinnerId,
		trickEchoPhase: e.trickEchoPhase,
		showFinalTrickEcho: e.showFinalTrickEcho,
		peakTrickPlayCount: e.peakPlayCount
	} : {
		trickDisplayPlays: [],
		trickWinnerPlayerId: null,
		trickShowWinnerTag: !1,
		trickPresentationPhase: "live",
		trickEchoPlays: [],
		trickEchoWinnerId: null,
		trickEchoPhase: "live",
		showFinalTrickEcho: !1,
		peakTrickPlayCount: 0
	};
}
function lf(e, t) {
	return e.trickDisplayPlays === t.trickDisplayPlays && e.trickWinnerPlayerId === t.trickWinnerPlayerId && e.trickShowWinnerTag === t.trickShowWinnerTag && e.trickPresentationPhase === t.trickPresentationPhase && e.trickEchoPlays === t.trickEchoPlays && e.trickEchoWinnerId === t.trickEchoWinnerId && e.trickEchoPhase === t.trickEchoPhase && e.showFinalTrickEcho === t.showFinalTrickEcho && e.peakTrickPlayCount === t.peakTrickPlayCount;
}
function uf(e) {
	return e ? {
		phase: e.phase,
		trickWinnerSeatId: e.trickWinnerSeatId,
		frozenTrick: e.frozenTrick,
		displayTricksByPlayer: e.displayTricksByPlayer
	} : {
		phase: "live",
		trickWinnerSeatId: null,
		frozenTrick: null,
		displayTricksByPlayer: rf
	};
}
function df(e, t) {
	return e.phase === t.phase && e.trickWinnerSeatId === t.trickWinnerSeatId && e.frozenTrick === t.frozenTrick && af(e.displayTricksByPlayer, t.displayTricksByPlayer);
}
var ff = () => {};
function pf(e) {
	return e ? {
		phase: e.phase,
		isPipelineActive: e.isPipelineActive,
		revealedCount: e.revealedCount,
		revealTarget: e.revealTarget,
		peakPlayCount: e.peakPlayCount,
		displayPlaysLength: e.displayPlays.length,
		displayTricksByPlayer: e.displayTricksByPlayer,
		trickWinnerSeatId: e.trickWinnerSeatId,
		suppressTurnPlayerId: e.suppressTurnPlayerId,
		forceHandEndDrain: e.forceHandEndDrain
	} : {
		phase: "live",
		isPipelineActive: !1,
		revealedCount: 0,
		revealTarget: 0,
		peakPlayCount: 0,
		displayPlaysLength: 0,
		displayTricksByPlayer: rf,
		trickWinnerSeatId: null,
		suppressTurnPlayerId: !1,
		forceHandEndDrain: ff
	};
}
function mf(e, t) {
	return e.phase === t.phase && e.isPipelineActive === t.isPipelineActive && e.revealedCount === t.revealedCount && e.revealTarget === t.revealTarget && e.peakPlayCount === t.peakPlayCount && e.displayPlaysLength === t.displayPlaysLength && af(e.displayTricksByPlayer, t.displayTricksByPlayer) && e.trickWinnerSeatId === t.trickWinnerSeatId && e.suppressTurnPlayerId === t.suppressTurnPlayerId;
}
//#endregion
//#region src/table/ConnectedPotCenter.tsx
function hf(e) {
	let t = qd(ef, tf, cf, lf);
	return /* @__PURE__ */ (0, C.jsx)(Kd, {
		...e,
		...t
	});
}
var gf = (0, l.memo)(hf);
//#endregion
//#region src/table/SmartHud.tsx
function _f({ label: e, value: t, accent: n, title: r }) {
	return /* @__PURE__ */ (0, C.jsxs)("span", {
		className: `bhud__pill${n ? " bhud__pill--accent" : ""}`,
		title: r ?? `${e}: ${t}`,
		children: [/* @__PURE__ */ (0, C.jsx)("span", {
			className: "bhud__pill-label",
			children: e
		}), /* @__PURE__ */ (0, C.jsx)("span", {
			className: "bhud__pill-value",
			children: t
		})]
	});
}
function vf({ player: e, compact: t = !1 }) {
	let n = e.apeScore != null && !e.isRobot;
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		className: `bhud${t ? " bhud--compact" : ""}`,
		"aria-label": `${e.displayName} stats`,
		children: [n && /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
			/* @__PURE__ */ (0, C.jsx)(_f, {
				label: "Ape",
				value: e.apeScore ?? 0,
				accent: !0,
				title: "Ape Score"
			}),
			e.apeClass && /* @__PURE__ */ (0, C.jsx)(_f, {
				label: "Class",
				value: e.apeClass,
				title: "Ape Class"
			}),
			e.apeStatus && /* @__PURE__ */ (0, C.jsx)(_f, {
				label: "Status",
				value: e.apeStatus,
				title: "Ape Status"
			})
		] }), e.sessionStreak != null && e.sessionStreak > 0 && /* @__PURE__ */ (0, C.jsx)(_f, {
			label: "Streak",
			value: e.sessionStreak,
			title: "Hands won this session"
		})]
	});
}
//#endregion
//#region src/session/liveHand.ts
function yf() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function bf(e) {
	let t = e ?? yf();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function xf(e) {
	if (!e) return !1;
	let t = e.phase ?? null;
	if (t !== "draw" && t !== "play" && t !== "reveal" && t !== "decision") return !1;
	let n = e.participantIds ?? [];
	if (n.length === 0) return !1;
	let r = e.tricksByPlayer ?? {};
	return !(Xu(r, n) || Yu(r, n) >= 5);
}
function Sf(e) {
	if (!e) return 0;
	let t = e.phase ?? "", n = t === "play" ? 1e3 : t === "draw" ? 100 : t === "decision" ? 50 : t === "reveal" ? 25 : 0;
	n += (e.drawCompletedIds?.length ?? 0) * 10;
	let r = e.participantIds ?? [];
	n += Yu(e.tricksByPlayer ?? {}, r);
	let i = e.handDecision;
	return t === "decision" && i && (n += (i.currentIndex ?? 0) * 5, n += (i.playingIds?.length ?? 0) * 2, n += (i.passedIds?.length ?? 0) * 2), n;
}
function Cf(e, t) {
	return xf(t) ? xf(e) ? Sf(t) >= Sf(e) ? t : e : t : e;
}
function wf(e) {
	let t = e?.phase ?? null;
	return t === "reveal" || t === "decision" || t === "draw" || t === "play";
}
function Tf(e) {
	let t = e?.currentHand ?? yf(), n = e?.liveEnrollment?.deal?.publicHand, r = n?.phase ?? null;
	if (bf(t) && n && !xf(n)) return yf();
	if (xf(t) && xf(n)) {
		let e = t.phase === "reveal" || t.phase === "decision", r = n?.drawCompletedIds?.length ?? 0, i = t.drawCompletedIds?.length ?? 0, a = Yu(n?.tricksByPlayer ?? {}, n?.participantIds ?? []), o = Yu(t.tricksByPlayer ?? {}, t.participantIds ?? []);
		return e && n?.phase === "draw" && o === 0 && a === 0 && r > 0 && i === 0 ? t : Cf(t, n);
	}
	if (xf(t)) return t;
	if (r === "draw" || r === "play" || r === "reveal" || r === "decision") {
		if (xf(n)) {
			let i = Yu(n?.tricksByPlayer ?? {}, n?.participantIds ?? []);
			return bf(t) && i === 0 && r === "draw" && !e?.liveEnrollment?.active ? yf() : n;
		}
		return n?.phase ? n : wf(t) ? t : bf(t) ? yf() : t;
	}
	return r && n ? n : t;
}
function Ef(e) {
	let t = Tf(e), n = t?.phase ?? null;
	if (n === "reveal" || n === "draw" || n === "play") return null;
	if (n === "decision") {
		let e = hc(t.handDecision ?? null);
		if (e?.active) return e;
	}
	let r = e?.liveEnrollment, i = r?.deal?.publicHand?.phase ?? null;
	return r?.active ? r : i === "draw" || i === "play" || i === "reveal" || i === "decision" ? null : e?.handEnrollment?.active ? e.handEnrollment : e?.handEnrollment ?? null;
}
function Df(e) {
	return !e.cardsDealt && e.handParticipantCount === 0 && e.enrollmentActive;
}
function Of(e, t) {
	return e === "decision" && t?.active === !0;
}
function kf(e) {
	return e.pagatDecisionActive && e.handDecision ? (e.handDecision.orderedPlayerIds ?? [])[e.handDecision.currentIndex ?? 0] ?? null : e.legacyEnrollmentActive && e.enrollment?.active ? (e.enrollment.orderedPlayerIds ?? [])[e.enrollment.currentIndex ?? 0] ?? null : null;
}
function Af(e) {
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
}, jf = [
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
], Mf = (e, t) => `${e}:${t}`;
new Map(jf.map((e) => [Mf(e.from, e.event), e.to]));
function Nf(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
function Pf(e, t) {
	return !e || !t ? !1 : e === t ? !0 : Nf(e);
}
function Ff() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function If(e) {
	let t = e.session, n = t ? Tf(t) : Ff(), r = n.phase ?? null, i = n.participantIds ?? [], a = n.tricksByPlayer ?? {}, o = Yu(a, i), s = i.length > 0 && Xu(a, i), c = !!t?.pendingCoWinSettlement?.winnerIds?.length, l = t ? Ef(t) : null, u = Of(r, n.handDecision ?? null), d = Df({
		cardsDealt: r === mc.REVEAL || r === mc.DECISION || r === mc.DRAW || r === mc.PLAY,
		handParticipantCount: i.length,
		enrollmentActive: !!l?.active
	}), f = d || u, p = Lf({
		sessionStatus: t?.status ?? null,
		handPhase: r,
		participantIds: i,
		trickCount: o,
		handComplete: s,
		pendingCoWin: c,
		enrollmentActive: f,
		handCount: t?.handCount ?? 0,
		clearedHand: bf(n)
	});
	return {
		phase: p,
		handPhase: r,
		enrollmentActive: f,
		pagatDecisionActive: u,
		participantIds: i,
		turnPlayerId: Rf({
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
function Lf(e) {
	if (e.sessionStatus === "final") return $.WAITING;
	if (e.pendingCoWin) return $.SETTLE;
	let t = e.handPhase ?? null, n = e.participantIds ?? [];
	return t === mc.PLAY ? e.handComplete || (e.trickCount ?? 0) >= 5 ? $.SETTLE : $.PLAY : t === mc.DRAW ? $.DRAW : t === mc.REVEAL ? $.DEAL : t === mc.DECISION || e.enrollmentActive ? $.ENROLLMENT : e.clearedHand !== !1 && n.length === 0 && (e.handCount ?? 0) > 0 && !e.enrollmentActive ? $.NEXT_HAND_PREP : $.WAITING;
}
function Rf(e) {
	let { phase: t, hand: n, enrollment: r, pagatDecisionActive: i, legacyEnrollmentActive: a } = e;
	return t === $.ENROLLMENT ? kf({
		pagatDecisionActive: i,
		handDecision: n.handDecision ?? null,
		legacyEnrollmentActive: a,
		enrollment: r
	}) : t === $.DRAW || t === $.PLAY ? n.turnPlayerId ?? null : null;
}
function zf(e) {
	let { snapshot: t, action: n, playerId: r, actorId: i, suppressTurn: a = !1 } = e, o = e.drawCompletedIds ?? [];
	if (!Pf(r, i)) return {
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
var Bf = 15e3, Vf = new Set([
	$.ENROLLMENT,
	$.DRAW,
	$.PLAY
]);
function Hf(e) {
	return e > 1e4 ? "green" : e > 5e3 ? "yellow" : "red";
}
function Uf(e, t) {
	if (t <= 0) return "red";
	let n = e / t;
	return n > 2 / 3 ? "green" : n > 1 / 3 ? "yellow" : "red";
}
function Wf(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off";
	return [
		e.session.phase ?? "",
		String(e.session.handNumber ?? 0),
		e.activeActorId ?? "",
		n,
		e.suppressTurn ? "1" : "0",
		e.handComplete ? "1" : "0"
	].join("|");
}
function Gf(e) {
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
			tricksByPlayer: t.tricksByPlayer ?? {},
			handDecision: t.handDecision ?? void 0
		}
	};
}
function Kf(e) {
	if (e.suppressTurn) return null;
	if (e.session.phase === "play") return e.session.turnPlayerId ?? null;
	if (e.handComplete) return null;
	let t = If({
		session: Gf(e),
		suppressTurn: e.suppressTurn
	});
	return Vf.has(t.phase) ? t.turnPlayerId : null;
}
function qf(e, t, n, r = Bf) {
	let i = Math.max(0, n - t);
	if (r < 15e3) {
		let t = Math.max(0, r - i);
		return t <= 0 ? null : {
			playerId: e,
			remainingMs: t,
			progress: t / r,
			segment: Uf(t, r)
		};
	}
	let a = Bf - i % Bf;
	return {
		playerId: e,
		remainingMs: a,
		progress: a / Bf,
		segment: Hf(a)
	};
}
//#endregion
//#region src/table/TurnCountdownRing.tsx
var Jf = 22, Yf = 2 * Math.PI * Jf;
function Xf({ activityKey: e, startedAtMs: t, durationMs: n, reducedMotion: r = kd() }) {
	let [i, a] = (0, l.useState)(1), [o, s] = (0, l.useState)("green"), c = (0, l.useRef)(null), u = (0, l.useRef)(t);
	u.current = t, (0, l.useEffect)(() => {
		let e = (e) => {
			let t = qf("local", u.current, e, n);
			if (!t) {
				a(0);
				return;
			}
			a(t.progress), s(t.segment);
		};
		if (r) {
			e(Date.now());
			let t = window.setInterval(() => e(Date.now()), 250);
			return () => window.clearInterval(t);
		}
		let t = () => {
			e(Date.now()), c.current = window.requestAnimationFrame(t);
		};
		return c.current = window.requestAnimationFrame(t), () => {
			c.current != null && (window.cancelAnimationFrame(c.current), c.current = null);
		};
	}, [
		e,
		n,
		r
	]);
	let d = Yf * (1 - Math.max(0, Math.min(1, i)));
	return /* @__PURE__ */ (0, C.jsxs)("svg", {
		className: ["bseat__turn-countdown", r ? "bseat__turn-countdown--reduced" : ""].filter(Boolean).join(" "),
		viewBox: "0 0 48 48",
		"aria-hidden": "true",
		"data-testid": "turn-countdown-ring",
		"data-turn-segment": o,
		children: [/* @__PURE__ */ (0, C.jsx)("circle", {
			className: "bseat__turn-countdown-track",
			cx: "24",
			cy: "24",
			r: Jf,
			fill: "none"
		}), /* @__PURE__ */ (0, C.jsx)("circle", {
			className: `bseat__turn-countdown-progress bseat__turn-countdown-progress--${o}`,
			cx: "24",
			cy: "24",
			r: Jf,
			fill: "none",
			strokeDasharray: Yf,
			strokeDashoffset: d,
			transform: "rotate(-90 24 24)"
		})]
	});
}
var Zf = (0, l.memo)(Xf), Qf = 1200, $f = 3e3, ep = null;
function tp(e = Math.random) {
	return Math.min($f, Qf + Math.floor(e() * 1801));
}
function np(e, t, n = Date.now(), r = Math.random) {
	if (ep && ep.activityKey === e && ep.playerId === t) return ep;
	let i = tp(r);
	return ep = {
		activityKey: e,
		playerId: t,
		startedAtMs: n,
		durationMs: i,
		resolveAtMs: n + i
	}, ep;
}
function rp() {
	ep = null;
}
function ip(e = Date.now()) {
	return ep ? e < ep.resolveAtMs : !1;
}
//#endregion
//#region src/table/turnCountdownStore.ts
var ap = null, op = /* @__PURE__ */ new Set();
function sp() {
	op.forEach((e) => e());
}
function cp(e, t) {
	return e === t ? !1 : !e || !t ? !0 : e.playerId !== t.playerId || e.activityKey !== t.activityKey || e.startedAtMs !== t.startedAtMs || e.durationMs !== t.durationMs;
}
function lp(e) {
	cp(ap, e) && (ap = e, sp());
}
function up(e) {
	return op.add(e), () => op.delete(e);
}
function dp() {
	return ap;
}
function fp(e) {
	let t = Kf(e), n = Wf({
		...e,
		activeActorId: t
	});
	if (!t) {
		lp(null);
		return;
	}
	if (!ap || ap.activityKey !== n) {
		let e = Date.now();
		lp({
			playerId: t,
			activityKey: n,
			startedAtMs: e,
			durationMs: Nf(t) ? np(n, t, e).durationMs : Bf
		});
		return;
	}
	if (ap.playerId !== t) {
		let e = Nf(t) ? np(n, t, ap.startedAtMs).durationMs : Bf;
		lp({
			...ap,
			playerId: t,
			durationMs: e
		});
	}
}
function pp() {
	ap = null, rp(), sp();
}
//#endregion
//#region src/table/ConnectedTurnCountdownRing.tsx
function mp({ playerId: e }) {
	let t = (0, l.useSyncExternalStore)(up, dp, dp);
	return !t || t.playerId !== e ? null : /* @__PURE__ */ (0, C.jsx)(Zf, {
		activityKey: t.activityKey,
		startedAtMs: t.startedAtMs,
		durationMs: t.durationMs
	});
}
//#endregion
//#region src/table/SeatAvatarIdentity.tsx
function hp({ displayName: e, photoURL: t, isDealer: n = !1, dealerMoved: r = !1, inHand: i = !1, bourrePressure: a = !1, bourrePulse: o = !1, countdownPlayerId: s = null, peek: c = !1, onTogglePeek: u, onBlurPeek: d }) {
	let f = ad(e), p = t?.trim() || null, m = (0, l.useCallback)((e) => {
		(e.key === "Enter" || e.key === " ") && (e.preventDefault(), u());
	}, [u]), h = (0, l.useCallback)((e) => {
		e.stopPropagation(), u();
	}, [u]);
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		className: "bseat__avatar-unit",
		children: [/* @__PURE__ */ (0, C.jsx)("div", {
			className: `bseat__avatar-wrap${c ? " bseat__avatar-wrap--peek" : ""}`,
			role: "button",
			tabIndex: 0,
			"aria-label": `${f} seat`,
			"aria-expanded": c,
			onClick: h,
			onKeyDown: m,
			onBlur: d,
			children: /* @__PURE__ */ (0, C.jsxs)("div", {
				className: "bseat__avatar-frame",
				"data-testid": "seat-avatar-frame",
				children: [
					/* @__PURE__ */ (0, C.jsx)("div", {
						className: "bseat__avatar-media",
						children: p ? /* @__PURE__ */ (0, C.jsx)("img", {
							className: "bseat__avatar bseat__avatar--image",
							src: p,
							alt: "",
							decoding: "async",
							referrerPolicy: "no-referrer"
						}) : /* @__PURE__ */ (0, C.jsx)("span", {
							className: "bseat__avatar bseat__avatar--fallback",
							"aria-hidden": "true"
						})
					}),
					n && /* @__PURE__ */ (0, C.jsx)("span", {
						className: `bseat__dealer${r ? " bseat__dealer--moved" : ""}`,
						children: "D"
					}),
					i && /* @__PURE__ */ (0, C.jsx)("span", {
						className: "bseat__in-badge",
						title: "In this hand"
					}),
					a && /* @__PURE__ */ (0, C.jsx)("span", {
						className: "bseat__bourre-pressure-ring",
						"aria-hidden": "true"
					}),
					o && !a && /* @__PURE__ */ (0, C.jsx)("span", {
						className: "bseat__bourre-ring",
						"aria-hidden": "true"
					}),
					s ? /* @__PURE__ */ (0, C.jsx)(mp, { playerId: s }) : null
				]
			})
		}), /* @__PURE__ */ (0, C.jsx)("span", {
			className: "bseat__avatar-label",
			title: f,
			children: f
		})]
	});
}
var gp = (0, l.memo)(hp);
//#endregion
//#region src/table/SeatHoleCards.tsx
function _p({ playerId: e, cardsHeld: t, revealedTrumpIndex: n = null, revealedTrumpUpcard: r = null, seatTrumpMergeActive: i = !1 }) {
	return /* @__PURE__ */ (0, C.jsx)("div", {
		className: "bseat__hole-cards bseat__hole-cards--crown",
		"aria-label": `${t} cards in hand`,
		"data-trick-play-origin": e,
		children: Array.from({ length: t }, (e, t) => {
			let a = n === t && r;
			return /* @__PURE__ */ (0, C.jsx)("div", {
				className: [
					"bseat__hole-card",
					a ? "bseat__hole-card--trump-revealed" : "",
					a && i ? "bseat__hole-card--trump-merge" : ""
				].filter(Boolean).join(" "),
				style: { "--hole-i": t },
				children: a ? /* @__PURE__ */ (0, C.jsx)(w, {
					card: {
						rank: r.rank,
						suit: r.suit
					},
					size: "xs",
					state: "trump"
				}) : /* @__PURE__ */ (0, C.jsx)(w, {
					faceDown: !0,
					size: "xs"
				})
			}, t);
		})
	});
}
var vp = (0, l.memo)(_p);
//#endregion
//#region src/table/SeatWonTrickPile.tsx
function yp({ playerId: e, trickCount: t }) {
	let n = Math.min(t, 5);
	return /* @__PURE__ */ (0, C.jsx)("div", {
		className: "bseat__won-trick-pile",
		"data-won-trick-pile-anchor": e,
		"aria-hidden": !1,
		"data-trick-count": t,
		children: Array.from({ length: n }, (e, t) => /* @__PURE__ */ (0, C.jsx)("div", {
			className: "bseat__won-trick-pile-card",
			style: { "--book-i": t },
			children: /* @__PURE__ */ (0, C.jsx)(w, {
				faceDown: !0,
				size: "xs"
			})
		}, t))
	});
}
var bp = (0, l.memo)(yp);
//#endregion
//#region src/table/seatPlayerEqual.ts
function xp(e, t) {
	return e === t ? !0 : !e || !t ? !e && !t : e.rank === t.rank && e.suit === t.suit;
}
function Sp(e, t) {
	return e.playerId === t.playerId && e.displayName === t.displayName && e.photoURL === t.photoURL && e.bankroll === t.bankroll && e.isOut === t.isOut && e.bankrollTick === t.bankrollTick && e.bourreAlert === t.bourreAlert && e.bourrePressure === t.bourrePressure && e.inHand === t.inHand && e.tricksThisHand === t.tricksThisHand && e.isSelf === t.isSelf && e.isDealer === t.isDealer && e.isLeading === t.isLeading && e.isWinner === t.isWinner && e.enrollmentSatOut === t.enrollmentSatOut && e.enrollmentJoined === t.enrollmentJoined && e.canToggleInHand === t.canToggleInHand && e.canPassEnrollment === t.canPassEnrollment && e.decisionPlannedDiscards === t.decisionPlannedDiscards && e.canEditTricks === t.canEditTricks && e.showHoleCards === t.showHoleCards && e.holeCardCount === t.holeCardCount && e.revealedTrumpIndex === t.revealedTrumpIndex && e.seatTrumpMergeActive === t.seatTrumpMergeActive && xp(e.revealedTrumpUpcard, t.revealedTrumpUpcard) && e.isOnTurn === t.isOnTurn && e.isActiveActor === t.isActiveActor && e.isTrickCapture === t.isTrickCapture && e.enrollmentPulse === t.enrollmentPulse && e.drawAnimSubPhase === t.drawAnimSubPhase && e.drawDiscardCount === t.drawDiscardCount && e.drawReplaceCount === t.drawReplaceCount && e.apeScore === t.apeScore && e.apeClass === t.apeClass && e.apeStatus === t.apeStatus && e.sessionStreak === t.sessionStreak && e.dealerMoved === t.dealerMoved && e.turnHandoff === t.turnHandoff && e.trumpMerging === t.trumpMerging && e.winnerFlash === t.winnerFlash;
}
//#endregion
//#region src/table/Seat.tsx
function Cp({ player: e, region: t, handLane: n = "below", style: r, clockwiseDealing: i = !1, countdownPlayerId: a = null, onToggleInHand: o, onPassEnrollment: s, onTrickDelta: c, onReaction: u }) {
	let [d, f] = (0, l.useState)(!1), p = (0, l.useCallback)(() => {
		f((e) => !e);
	}, []), m = (0, l.useCallback)(() => {
		f(!1);
	}, []), h = (0, l.useCallback)(() => {
		c(1);
	}, [c]), g = e.tricksThisHand, _ = Math.max(0, e.holeCardCount ?? 0), v = g > 0, y = !!(e.showHoleCards && !e.isSelf && e.inHand && _ > 0), b = e.bankroll != null, x = e.bourreAlert === "pulse", S = e.bourreAlert === "marker" || e.bourreAlert === "pulse", w = !!e.bourrePressure, T = w && e.isSelf, E = e.revealedTrumpIndex != null && e.revealedTrumpUpcard;
	return /* @__PURE__ */ (0, C.jsxs)("div", {
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
			e.turnHandoff ? "bseat--turn-handoff" : "",
			e.isTrickCapture ? "bseat--trick-capture" : "",
			e.winnerFlash ? "bseat--winner-flash" : "",
			e.enrollmentPulse === "join" ? "bseat--enroll-join" : "",
			e.enrollmentPulse === "pass" ? "bseat--enroll-pass" : "",
			e.drawAnimSubPhase === "discard" ? "bseat--draw-discard" : "",
			e.drawAnimSubPhase === "receive" ? "bseat--draw-receive" : "",
			x ? "bseat--bourre-pulse" : "",
			S ? "bseat--bourre" : "",
			w ? "bseat--bourre-pressure" : "",
			T ? "bseat--bourre-pressure-self" : "",
			e.bankrollTick === "up" ? "bseat--bankroll-up" : "",
			e.bankrollTick === "down" ? "bseat--bankroll-down" : "",
			E ? "bseat--trump-reveal" : "",
			e.seatTrumpMergeActive ? "bseat--trump-merge" : "",
			d ? "bseat--meta-open" : ""
		].filter(Boolean).join(" "),
		style: r,
		"data-trick-play-origin-active": e.isActiveActor && e.inHand ? e.playerId : void 0,
		children: [
			e.inHand && !e.isSelf && /* @__PURE__ */ (0, C.jsx)("span", {
				className: "bseat__play-origin",
				"data-seat-play-origin": e.playerId,
				"data-trick-play-origin": e.playerId,
				"aria-hidden": "true"
			}),
			e.inHand && /* @__PURE__ */ (0, C.jsx)("span", {
				className: "bseat__settle-chip-anchor",
				"data-settle-chip-anchor": e.playerId,
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, C.jsx)("div", {
				className: "bseat__core",
				children: /* @__PURE__ */ (0, C.jsxs)("div", {
					className: "bseat__avatar-stage",
					children: [
						/* @__PURE__ */ (0, C.jsxs)("div", {
							className: "bseat__avatar-stack",
							"data-trick-play-origin": !e.isSelf && e.inHand && !y ? e.playerId : void 0,
							children: [
								e.inHand && /* @__PURE__ */ (0, C.jsx)("span", {
									className: [
										"bseat__trick-badge",
										g === 0 ? "bseat__trick-badge--zero" : "",
										e.isWinner || e.isTrickCapture ? "bseat__trick-badge--tick" : ""
									].filter(Boolean).join(" "),
									"aria-label": `${g} tricks won`,
									title: `${g} trick${g === 1 ? "" : "s"} won`,
									children: g
								}),
								e.inHand && !e.isSelf && /* @__PURE__ */ (0, C.jsx)("span", {
									className: "bseat__seat-motion-anchor",
									"data-seat-motion-anchor": e.playerId,
									"aria-hidden": "true"
								}),
								v && /* @__PURE__ */ (0, C.jsx)(bp, {
									playerId: e.playerId,
									trickCount: g
								}),
								i && e.inHand && !e.isSelf && _ > 0 && /* @__PURE__ */ (0, C.jsx)("div", {
									className: "bseat__deal-targets",
									"aria-hidden": "true",
									children: Array.from({ length: _ }, (t, n) => /* @__PURE__ */ (0, C.jsx)("span", {
										className: "bseat__deal-target",
										"data-deal-seat": e.playerId,
										"data-deal-round": n,
										style: { "--hole-i": n }
									}, `deal-target-${n}`))
								}),
								y && /* @__PURE__ */ (0, C.jsx)(vp, {
									playerId: e.playerId,
									cardsHeld: _,
									revealedTrumpIndex: e.revealedTrumpIndex,
									revealedTrumpUpcard: e.revealedTrumpUpcard,
									seatTrumpMergeActive: e.seatTrumpMergeActive
								}),
								w && /* @__PURE__ */ (0, C.jsx)("span", {
									className: "bseat__bourre-pressure-badge",
									"data-testid": "bourre-pressure-badge",
									"aria-label": T ? "You need this trick to avoid bourré" : "At risk of bourré",
									title: T ? "Win this trick or go bourré" : "Must win this trick",
									children: T ? "Bourré risk!" : "0 tricks"
								}),
								S && !w && /* @__PURE__ */ (0, C.jsx)("span", {
									className: "bseat__bourre-badge",
									"data-testid": "bourre-marker-badge",
									"aria-label": "Bourré",
									title: "Bourré",
									children: "Bourré"
								}),
								/* @__PURE__ */ (0, C.jsx)(gp, {
									displayName: e.displayName,
									photoURL: e.photoURL,
									isDealer: e.isDealer,
									dealerMoved: e.dealerMoved,
									inHand: e.inHand,
									bourrePressure: w,
									bourrePulse: x,
									countdownPlayerId: a,
									peek: d,
									onTogglePeek: p,
									onBlurPeek: m
								})
							]
						}),
						b && /* @__PURE__ */ (0, C.jsx)("span", {
							className: `bseat__stack${e.isOut ? " bseat__stack--out" : ""}`,
							"data-testid": "seat-stack",
							"aria-label": `Chips ${rd(e.bankroll ?? 0)}`,
							title: `Chips ${rd(e.bankroll ?? 0)}`,
							children: rd(e.bankroll ?? 0)
						}),
						e.isSelf && u && /* @__PURE__ */ (0, C.jsx)("div", {
							className: "bseat__react-bar",
							children: [
								"👏",
								"😮",
								"🔥"
							].map((e) => /* @__PURE__ */ (0, C.jsx)("button", {
								type: "button",
								className: "bseat__react-btn",
								"aria-label": `React ${e}`,
								onClick: () => u(e),
								children: e
							}, e))
						})
					]
				})
			}),
			/* @__PURE__ */ (0, C.jsxs)("div", {
				className: "bseat__aux",
				children: [
					/* @__PURE__ */ (0, C.jsxs)("div", {
						className: "bseat__info",
						children: [
							e.isOut && /* @__PURE__ */ (0, C.jsx)("span", {
								className: "bseat__out-tag muted small",
								children: "Out"
							}),
							e.enrollmentSatOut && !e.isOut && /* @__PURE__ */ (0, C.jsx)("span", {
								className: "bseat__enroll-tag muted small",
								children: "Sat out"
							}),
							e.enrollmentJoined && !e.inHand && !e.isOut && /* @__PURE__ */ (0, C.jsx)("span", {
								className: "bseat__enroll-tag muted small",
								children: e.decisionPlannedDiscards == null ? "Joined" : `Play · draw ${e.decisionPlannedDiscards}`
							})
						]
					}),
					/* @__PURE__ */ (0, C.jsx)("div", {
						className: "bseat__meta",
						"data-testid": "seat-meta-panel",
						"aria-hidden": !d,
						children: /* @__PURE__ */ (0, C.jsx)(vf, {
							player: e,
							compact: t === "left" || t === "right"
						})
					}),
					e.canToggleInHand && /* @__PURE__ */ (0, C.jsx)("button", {
						type: "button",
						className: "bseat__opt-in btn btn--sm",
						"data-testid": "seat-opt-in",
						onClick: o,
						children: e.decisionPlannedDiscards != null && e.enrollmentJoined ? `Playing · ${e.decisionPlannedDiscards}` : e.canPassEnrollment ? "Play" : "I’m in"
					}),
					e.canPassEnrollment && s && /* @__PURE__ */ (0, C.jsx)("button", {
						type: "button",
						className: "bseat__pass btn btn--sm btn--ghost",
						"data-testid": "seat-pass-enrollment",
						onClick: s,
						children: "Pass"
					}),
					e.canEditTricks && /* @__PURE__ */ (0, C.jsx)("div", {
						className: "bseat__controls",
						children: /* @__PURE__ */ (0, C.jsx)("button", {
							type: "button",
							className: "bseat__trick-btn bseat__trick-btn--plus",
							"aria-label": "Won a trick",
							disabled: g >= 5,
							onClick: h,
							children: "+"
						})
					})
				]
			})
		]
	});
}
function wp(e, t) {
	return e.region === t.region && e.handLane === t.handLane && e.clockwiseDealing === t.clockwiseDealing && e.countdownPlayerId === t.countdownPlayerId && e.style.left === t.style.left && e.style.top === t.style.top && e.onToggleInHand === t.onToggleInHand && e.onPassEnrollment === t.onPassEnrollment && e.onTrickDelta === t.onTrickDelta && e.onReaction === t.onReaction && Sp(e.player, t.player);
}
var Tp = (0, l.memo)(Cp, wp);
//#endregion
//#region src/table/layout/sevenPlayerMobileSeatMap.ts
function Ep(e) {
	let t = qu(e);
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
function Dp(e) {
	return e === 7;
}
function Op(e, t) {
	return e < 0 || e > 6 ? null : Ep(t)[e] ?? null;
}
function kp(e, t, n) {
	let r = Op(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: qp(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 7
		})
	} : null;
}
//#endregion
//#region src/table/layout/eightPlayerMobileSeatMap.ts
function Ap(e) {
	let t = Ju(e);
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
function jp(e) {
	return e >= 8;
}
function Mp(e, t) {
	return e < 0 || e > 7 ? null : Ap(t)[e] ?? null;
}
function Np(e, t, n) {
	let r = Mp(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: qp(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 8
		})
	} : null;
}
//#endregion
//#region src/table/layout/fourPlayerMobileSeatMap.ts
function Pp(e) {
	return e === 5;
}
function Fp(e) {
	let t = qu(e);
	return {
		0: t[0],
		1: t[1],
		2: t[3],
		3: t[5],
		4: t[6]
	};
}
function Ip(e, t, n) {
	if (e < 0 || e > 4) return null;
	let r = Fp(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: qp(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 5
		})
	} : null;
}
//#endregion
//#region src/table/layout/fivePlayerMobileSeatMap.ts
var Lp = {
	min: 8,
	max: 92
};
function Rp(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function zp(e, t) {
	let n = t === "landscape" ? 54 : 56;
	return {
		...e,
		x: Rp(e.x, Lp.min, Lp.max),
		y: Rp(e.y, 8, n)
	};
}
function Bp(e) {
	return e === 6;
}
function Vp(e) {
	let t = qu(e), n = [
		2,
		3,
		4
	].map((t) => zp(pd(t, 6), e));
	return {
		0: t[0],
		1: t[1],
		2: n[0],
		3: n[1],
		4: n[2],
		5: t[6]
	};
}
function Hp(e, t, n) {
	if (e < 0 || e > 5) return null;
	let r = Vp(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: qp(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 6
		})
	} : null;
}
//#endregion
//#region src/table/layout/seatLayout.ts
var Up = {
	min: 8,
	max: 92
}, Wp = 56, Gp = 54;
function Kp(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function qp(e, t) {
	return t.isSelf || t.isMobile ? "below" : t.total >= 6 && e.region === "left" && e.x < 14 || t.total >= 6 && e.region === "right" && e.x > 86 ? "side" : "below";
}
function Jp(e, t) {
	let n = Kp(e.x, Up.min, Up.max), r = t === "portrait" ? Wp : Gp, i = Kp(e.y, 8, r);
	return {
		...e,
		x: n,
		y: i
	};
}
function Yp(e, t, n) {
	if (n.isMobile && n.orientation && Pp(t)) {
		let t = Ip(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && Bp(t)) {
		let t = Hp(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && Dp(t)) {
		let t = kp(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && jp(t)) {
		let t = Np(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	let r = pd(e, t), i = n.isMobile && n.orientation ? Jp(r, n.orientation) : r;
	return {
		...i,
		seatIndex: e,
		handLane: qp(i, {
			isMobile: n.isMobile,
			isSelf: n.isSelf,
			total: t
		})
	};
}
function Xp(e, t, n) {
	return Yp(e + 1, t, {
		isMobile: !0,
		isSelf: !1,
		orientation: n
	});
}
function Zp(e, t = "portrait") {
	if (Pp(e)) {
		let e = Ip(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (Bp(e)) {
		let e = Hp(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (Dp(e)) {
		let e = kp(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (jp(e)) {
		let e = Np(0, t, { isSelf: !0 });
		if (e) return e;
	}
	let n = pd(0, Math.max(2, e));
	return {
		x: n.x,
		y: Math.min(n.y, 88),
		region: "bottom",
		seatIndex: 0,
		handLane: "below"
	};
}
//#endregion
//#region src/table/tableSeatSlotEqual.ts
function Qp(e, t) {
	return e.seatIndex === t.seatIndex && e.playerCount === t.playerCount && e.isMobile === t.isMobile && e.clockwiseDealing === t.clockwiseDealing && e.seatIndexAttr === t.seatIndexAttr && e.layoutOverride === t.layoutOverride && e.onToggleInHand === t.onToggleInHand && e.onPassEnrollment === t.onPassEnrollment && e.onTrickDelta === t.onTrickDelta && e.onReaction === t.onReaction && e.player.playerId === t.player.playerId && e.player.isSelf === t.player.isSelf && e.player.canToggleInHand === t.player.canToggleInHand && e.player.inHand === t.player.inHand && e.player.canPassEnrollment === t.player.canPassEnrollment && Sp(e.seatPlayer, t.seatPlayer);
}
//#endregion
//#region src/table/TableSeatSlot.tsx
function $p(e) {
	return {
		left: `${e.x}%`,
		top: `${e.y}%`
	};
}
function em({ seatIndex: e, player: t, seatPlayer: n, playerCount: r, isMobile: i, clockwiseDealing: a, layoutOverride: o, seatIndexAttr: s, onToggleInHand: c, onPassEnrollment: u, onTrickDelta: d, onReaction: f }) {
	let p = (0, l.useMemo)(() => o ?? Yp(e, r, {
		isMobile: i,
		isSelf: t.isSelf
	}), [
		o,
		e,
		r,
		i,
		t.isSelf
	]), m = (0, l.useMemo)(() => $p(p), [p.x, p.y]), h = (0, l.useCallback)(() => {
		c(t.playerId, t.canToggleInHand ? !0 : !t.inHand);
	}, [
		c,
		t.playerId,
		t.canToggleInHand,
		t.inHand
	]), g = (0, l.useCallback)(() => {
		u?.(t.playerId);
	}, [u, t.playerId]), _ = (0, l.useCallback)((e) => {
		d(t.playerId, e);
	}, [d, t.playerId]), v = t.canPassEnrollment && u ? g : void 0, y = t.isSelf ? f : void 0;
	return /* @__PURE__ */ (0, C.jsx)("div", {
		className: `btable__seat-slot btable__seat-slot--${e}${t.isSelf ? " btable__seat-slot--self" : ""}`,
		"data-seat-index": s ?? (t.isSelf ? 0 : e + +!!i),
		children: /* @__PURE__ */ (0, C.jsx)(Tp, {
			player: n,
			region: p.region,
			handLane: p.handLane,
			clockwiseDealing: a,
			style: m,
			onToggleInHand: h,
			onPassEnrollment: v,
			onTrickDelta: _,
			onReaction: y,
			countdownPlayerId: n.playerId
		})
	});
}
var tm = (0, l.memo)(em, Qp), nm = 5e3, rm = 1e3, im = 1200, am = 1400, om = 2400, sm = 12e3, cm = 4e3, lm = 9500;
function um(e = kd()) {
	let t = e ? .55 : 1, n = (e) => Math.max(80, Math.round(e * t));
	return {
		anteChipTravelMs: n(220),
		dealCardStaggerMs: n(130),
		dealFanMs: n(600),
		trumpRevealHoldMs: n(nm),
		trumpMergeAnimMs: n(480),
		enrollmentSeatPulseMs: n(480),
		drawDiscardMs: n(400),
		drawReplaceMs: n(700),
		drawReadyBeatMs: n(500),
		settleHoldMs: n(rm),
		nextHandResetMs: n(550),
		handResetMs: n(500)
	};
}
function dm(e, t, n = kd()) {
	let r = um(n), i = Math.max(0, e), a = Math.max(0, t);
	return i === 0 && a === 0 ? Math.max(120, Math.round(r.drawDiscardMs * .6)) : i * r.drawDiscardMs + a * r.drawReplaceMs + 80;
}
function fm(e) {
	return e !== "idle" && e !== "enrollment" && e !== "decision" && e !== "play" && e !== "drawPlayer";
}
//#endregion
//#region src/table/layout/seatOrder.ts
function pm(e, t) {
	let n = [...new Set(e.filter(Boolean))];
	if (!n.length) return [];
	let r = t.seatedIds?.filter((e) => n.includes(e));
	if (r?.length === n.length) return r;
	let i = t.handEnrollment?.orderedPlayerIds?.filter((e) => n.includes(e));
	if (i?.length === n.length) return i;
	let a = fc(t.dealerId, n), o = n.filter((e) => !a.includes(e));
	return o.length ? [...a, ...o] : a;
}
function mm(e, t, n) {
	let r = new Map(e.map((e) => [e.playerId, e])), i = pm(e.map((e) => e.playerId), t);
	if (!i.length) return e;
	let a = n ?? e.find((e) => e.isSelf)?.playerId ?? null, o = a ? i.indexOf(a) : 0;
	return (o > 0 ? [...i.slice(o), ...i.slice(0, o)] : i).map((e) => r.get(e)).filter((e) => e != null);
}
//#endregion
//#region src/table/visualTurnGate.ts
function hm(e) {
	return e.trickSuppressTurn || e.trickPipelineActive;
}
function gm(e) {
	return e.trickSuppressTurn || e.handSuppressTurn || e.trickPipelineActive;
}
//#endregion
//#region src/table/layout/mobileSeatMap.ts
function _m(e, t) {
	let n = Math.max(1, Math.min(7, e || 1));
	return t === "portrait" ? n <= 1 ? .8 : n <= 2 ? .82 : n <= 3 ? .86 : n <= 4 ? .9 : .94 : n <= 1 ? 1.02 : n <= 2 ? .98 : n <= 3 ? 1.02 : n <= 5 ? 1.16 : 1.26;
}
//#endregion
//#region src/table/trumpHolderPresentation.ts
function vm(e) {
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
function ym(e) {
	return e <= 0 ? null : e - 1;
}
function bm(e, t, n, r, i) {
	if (i || !t.trumpHolderId || e !== t.trumpHolderId || r <= 0) return {
		revealedTrumpUpcard: null,
		revealedTrumpIndex: null,
		seatTrumpMergeActive: !1
	};
	let a = t.showRevealedTrumpAtHolder ? ym(r) : null;
	return {
		revealedTrumpUpcard: t.showRevealedTrumpAtHolder ? n : null,
		revealedTrumpIndex: a,
		seatTrumpMergeActive: t.trumpMergeActive
	};
}
//#endregion
//#region src/table/hooks/useTableSeatModel.ts
function xm({ session: e, players: t, currentUserId: n = null, potMetrics: r, handPresentation: i, microinteractions: a, trumpHolderPresentation: o, mobileOrientation: s = null }) {
	let c = qd(ef, tf, of, sf), u = (0, l.useMemo)(() => t.map((e) => ({
		...e,
		isSelf: e.isSelf || n != null && e.playerId === n
	})), [t, n]), d = (0, l.useMemo)(() => mm(u, e, n), [
		u,
		e,
		n
	]), f = d.length, p = (0, l.useMemo)(() => d.filter((e) => !e.isSelf), [d]), m = `btable--p${Math.min(8, Math.max(2, f))}`, h = s == null ? md(f) : _m(p.length, s), g = um(), _ = (0, l.useMemo)(() => Object.fromEntries(u.map((e) => [e.playerId, e.displayName])), [u]), v = (0, l.useMemo)(() => new Set(e.participantIds.filter((t) => Qu(t, c.displayTricksByPlayer, e.participantIds, e.phase))), [
		e.participantIds,
		e.phase,
		c.displayTricksByPlayer
	]), y = gm({
		trickSuppressTurn: c.suppressTurnPlayerId,
		handSuppressTurn: i.suppressTurnIndicator,
		trickPipelineActive: c.isPipelineActive,
		trickPhase: c.phase,
		revealedCount: c.revealedCount,
		revealTarget: c.revealTarget
	}), b = (0, l.useMemo)(() => {
		let t = /* @__PURE__ */ new Map();
		for (let n of u) {
			let s = c.displayTricksByPlayer[n.playerId] ?? 0, l = c.trickWinnerSeatId === n.playerId, u = c.phase === "collectTrick" && l, d = i.enrollmentPulse[n.playerId], f = i.animatingDrawPlayerId === n.playerId, p = bm(n.playerId, o, e.trumpUpcard ?? null, n.holeCardCount ?? 0, n.isSelf);
			t.set(n.playerId, {
				...n,
				...p,
				bankroll: id(n.bankroll, r.anteAmount, {
					inHand: n.inHand,
					anteAnimActive: i.anteAnimActive,
					anteAlreadyPosted: e.postedAntes != null && Object.prototype.hasOwnProperty.call(e.postedAntes, n.playerId)
				}),
				tricksThisHand: s,
				isOnTurn: y ? !1 : n.isOnTurn,
				isActiveActor: y ? !1 : n.isActiveActor,
				isLeading: l && (c.phase === "winnerReveal" || c.phase === "collectTrick") ? !0 : y ? !1 : n.isLeading,
				isTrickCapture: u,
				enrollmentPulse: d,
				drawAnimSubPhase: f && n.isSelf ? i.drawAnimSubPhase : null,
				drawDiscardCount: f ? i.drawDiscardCount : 0,
				drawReplaceCount: f ? i.drawReplaceCount : 0,
				turnHandoff: a.turnHandoffPlayerId === n.playerId,
				dealerMoved: a.dealerMovedPlayerId === n.playerId,
				winnerFlash: a.winnerFlashPlayerId === n.playerId,
				bankrollTick: a.bankrollTicks[n.playerId] ?? null,
				bourreAlert: n.isSelf ? a.bourreAlerts[n.playerId] ?? null : null,
				bourrePressure: v.has(n.playerId)
			});
		}
		return t;
	}, [
		u,
		c.displayTricksByPlayer,
		c.trickWinnerSeatId,
		c.phase,
		i.enrollmentPulse,
		i.animatingDrawPlayerId,
		i.drawAnimSubPhase,
		i.drawDiscardCount,
		i.drawReplaceCount,
		i.anteAnimActive,
		o,
		e.trumpUpcard,
		e.postedAntes,
		r.anteAmount,
		y,
		a.dealerMovedPlayerId,
		a.turnHandoffPlayerId,
		a.winnerFlashPlayerId,
		a.bankrollTicks,
		a.bourreAlerts,
		v
	]);
	return {
		feltPlayers: u,
		rotated: d,
		opponents: p,
		playerCount: f,
		countClass: m,
		tableAspect: h,
		handTiming: g,
		playerNames: _,
		displayPlayersById: b,
		selfPlayer: (0, l.useMemo)(() => u.find((e) => e.isSelf), [u]),
		suppressTurn: y,
		drawCompleted: (0, l.useMemo)(() => !!(n && e.drawCompletedIds?.includes(n)), [n, e.drawCompletedIds]),
		hasActiveTurn: (0, l.useMemo)(() => [...b.values()].some((e) => e.isActiveActor), [b]),
		potMetricsForCenter: (0, l.useMemo)(() => ({
			...r,
			currentPot: i.displayPotAmount
		}), [r, i.displayPotAmount]),
		wrapStyle: (0, l.useMemo)(() => ({
			"--player-count": f,
			"--table-aspect": h,
			"--trick-card-travel-ms": "395ms",
			"--trick-card-settle-ms": "165ms",
			"--trick-card-shift-ms": "220ms",
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": `${_d}ms`,
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": `${hd}ms`,
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": `${hd + 900 + 400 + _d + 230}ms`,
			"--deal-card-stagger-ms": `${g.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${g.drawDiscardMs}ms`,
			"--draw-replace-ms": `${g.drawReplaceMs}ms`
		}), [
			f,
			h,
			g.dealCardStaggerMs,
			g.drawDiscardMs,
			g.drawReplaceMs
		])
	};
}
function Sm(e, t, n) {
	let r = Number.isFinite(e) && e > 0 ? e : 0, i = r > 0 ? Math.max(t, r) : t;
	return {
		height: Math.max(i > 0 ? i : n, n),
		peak: i
	};
}
function Cm(e, t, n, r) {
	let i = Sm(e, t, n), a = Math.max(152, n);
	return {
		height: i.peak > 0 ? Math.min(i.height, r) : Math.min(a, r),
		peak: i.peak
	};
}
function wm(e, t, n = 72) {
	return Sm(e, t, n);
}
function Tm(e, t) {
	let n = Math.max(.75, e);
	return t.portrait ? Math.min(n, .98) : Math.min(n, 1.32);
}
function Em(e) {
	let t = Math.max(2, Math.min(8, e || 4));
	return t <= 3 ? .7 : t <= 4 ? .68 : t <= 5 ? .62 : .56;
}
function Dm(e) {
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
function Om(e) {
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
function km(e) {
	return {
		left: e.left,
		top: e.top,
		right: e.right,
		bottom: e.bottom,
		width: e.width,
		height: e.height
	};
}
function Am(e, t, n = 2) {
	return e.left >= t.left - n && e.top >= t.top - n && e.right <= t.right + n && e.bottom <= t.bottom + n;
}
//#endregion
//#region src/table/presentationMotionBusy.ts
var jm = !1, Mm = !1, Nm = !1, Pm = /* @__PURE__ */ new Set();
function Fm() {
	for (let e of Pm) e();
}
function Im(e) {
	jm !== e && (jm = e, Fm());
}
function Lm() {
	return jm;
}
function Rm(e) {
	Mm !== e && (Mm = e, Fm());
}
function zm() {
	return Mm;
}
function Bm(e) {
	Nm !== e && (Nm = e, Fm());
}
function Vm(e) {
	return Pm.add(e), () => Pm.delete(e);
}
function Hm() {
	jm = !1, Mm = !1, Nm = !1, Fm();
}
//#endregion
//#region src/table/useMobileTable.ts
var Um = "(max-width: 900px), ((hover: none) and (pointer: coarse))";
function Wm() {
	let [e, t] = (0, l.useState)(() => typeof window < "u" && window.matchMedia("(max-width: 900px), ((hover: none) and (pointer: coarse))").matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Um), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/table/hooks/useStageFit.ts
function Gm(e, t) {
	if (typeof window > "u") return t;
	let n = document.documentElement, r = getComputedStyle(n).getPropertyValue(e).trim(), i = parseFloat(r);
	return Number.isFinite(i) ? i : t;
}
function Km(e, t) {
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
function qm(e) {
	let t = e.closest(".btable-session")?.querySelector(".btable-desktop");
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return n.width <= 0 || n.height <= 0 ? null : {
		width: n.width,
		height: n.height
	};
}
function Jm(e, t) {
	let n = !!e.closest(".table-play-overlay");
	if (t && n) {
		let t = e.closest(".table-play-overlay__main");
		if (t) return t;
	}
	return e.closest(".btable-desktop__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function Ym({ aspect: e, enabled: t = !0, sessionKey: n }) {
	let r = (0, l.useRef)(null), i = (0, l.useRef)(0), a = (0, l.useRef)(0), o = (0, l.useRef)(n), { settings: s } = Ou(), c = Wm();
	return (0, l.useLayoutEffect)(() => {
		if (!t || typeof window > "u") return;
		let l = r.current;
		if (!l) return;
		o.current !== n && (o.current = n, i.current = 0, a.current = 0);
		let u = l.closest(".btable-desktop__viewport") ?? l.closest(".table-play-overlay__main") ?? l.closest(".btable-session"), d = window.visualViewport, f = () => {
			let t = !!l.closest(".table-play-overlay"), n = typeof window < "u" && window.matchMedia("(orientation: portrait)").matches, r = Jm(l, c).getBoundingClientRect(), o = l.querySelector(".hand-panel")?.getBoundingClientRect(), u = t && c && n ? 100 : t && !c ? 120 : c ? 112 : 148, f = t && c && n || t && !c ? 200 : c ? 210 : 280, p = o?.height ?? 0, m = Cm(p, i.current, u, f);
			i.current = m.peak;
			let h = m.height, g = c && t ? 12 : c ? 18 : t && !c ? 16 : 28, _ = Gm("--stage-fit-pad-x", c ? 8 : 16) + g, v = Gm("--stage-fit-pad-y", c ? 6 : 12) + g, y = Gm("--stage-fit-gap", c ? 8 : 12), b = d, x = Math.min(r.width, b?.width ?? window.innerWidth), S = Math.min(r.height, b?.height ?? window.innerHeight);
			if (t && c) {
				let e = qm(l);
				if (e) x = e.width, S = e.height;
				else {
					let e = wm(Km(l, c), a.current, 72);
					a.current = e.peak, S = Math.max(160, S - e.height);
				}
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = t && c ? 1 : C, T = c ? Tm(e, { portrait: n }) : e, E = parseInt(getComputedStyle(l).getPropertyValue("--player-count").trim(), 10) || 4, D = t && c && !n, O = D ? {
				...Dm({
					availWidth: x,
					availHeight: S,
					aspect: T,
					userScale: w,
					padX: _,
					padY: v,
					stageShare: Em(E)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Om({
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
				let e = l.querySelector(".table-stage"), a = l.querySelectorAll(".bseat__avatar-wrap"), o = e ? km(e.getBoundingClientRect()) : null, s = km(document.documentElement.getBoundingClientRect()), u = [...a].filter((e) => !Am(km(e.getBoundingClientRect()), s, 1)).length;
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
			Lm() || zm() || (p ??= window.requestAnimationFrame(() => {
				p = null, f();
			}));
		}, h = new ResizeObserver(m), g = l.querySelector(".hand-panel");
		g && h.observe(g);
		let _ = Jm(l, c);
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
function Xm({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r, pileIndexRef: i, onDiscardCommitted: a }) {
	let o = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		let s = e.animatingDrawPlayerId, c = e.drawAnimSubPhase, l = e.drawDiscardCount;
		if (c !== "discard" || !s || l <= 0) {
			c !== "discard" && (o.current = null);
			return;
		}
		if (s === n) return;
		let u = `${t}:${s}:${l}`;
		o.current !== u && (o.current = u, Ds({
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
function Zm({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r }) {
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
		i.current !== l && (i.current = l, ws({
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
function Qm(e = document) {
	rs(), xs();
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = e instanceof Document ? t.body : e;
	for (let e of n.querySelectorAll(".discard-fly-ghost, .draw-receive-fly-ghost")) e.remove();
}
//#endregion
//#region src/table/hooks/useTableDrawMotionCleanup.ts
function $m({ handNumber: e, sessionPhase: t, turnPlayerId: n, drawCompletedIds: r, currentUserId: i, handPresentation: a, tableRootRef: o }) {
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
		s.current !== l && (s.current = l, Qm(c));
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
		e && (Qm(e), s.current = null);
	}, [e, o]);
}
var eh = /* @__PURE__ */ new Set();
function th(e, t = 5) {
	let n = [];
	for (let r = 0; r < t; r += 1) for (let t of e) n.push({
		playerId: t,
		roundIndex: r,
		stepIndex: n.length
	});
	return n;
}
function nh(e, t = I()) {
	if (e <= 0) return 0;
	let n = t ? .35 : 1, r = Math.round(780 * n), i = Math.round(540 * n);
	return (e - 1) * r + i + Math.round(130 * n);
}
function rh(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		let e = i.querySelector("[data-trump-deal-target]");
		if (e) return ta(e);
	}
	let a = i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`) ?? i.querySelector(`[data-deal-seat="${e}"] [data-deal-round="${t}"]`), o = a?.querySelector(".pcard") ?? a;
	return o ? ta(o) : null;
}
function ih(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * .24)
	};
}
function ah(e) {
	let t = document.createElement("div");
	return t.className = "deal-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function oh(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		i.querySelector("[data-trump-deal-target]")?.classList.add("deal-card--revealed");
		return;
	}
	i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`)?.classList.add("deal-card--revealed");
}
function sh(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".deal-card--revealed")) e.classList.remove("deal-card--revealed");
	for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
}
function ch() {
	for (let e of eh) e.kill();
	eh.clear();
}
function lh({ steps: e, root: t, trumpHolderId: n = null, onStepComplete: r, onComplete: i }) {
	qo(t), ch();
	let a = I(), o = F(540 / 1e3, a), s = F(130 / 1e3, a), c = a ? .04 : 110 / 1e3, l = us(t), u = K.timeline({
		onComplete: () => {
			eh.delete(u), i?.();
		},
		onInterrupt: () => {
			eh.delete(u);
			for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
		}
	});
	if (eh.add(u), !l || e.length === 0) {
		for (let r of e) oh(r.playerId, r.roundIndex, t, n);
		return u.call(() => i?.()), u;
	}
	e.forEach((e, i) => {
		let d = i * (o + s + c), f = rh(e.playerId, e.roundIndex, t, n);
		u.call(() => {
			if (!f) {
				oh(e.playerId, e.roundIndex, t, n), r?.(e);
				return;
			}
			let i = ah(l);
			t.appendChild(i);
			let c = ta(i), { x: u, y: d } = ia(c, l), p = f.left + f.width / 2, m = f.top + f.height / 2, h = c.left + c.width / 2, g = c.top + c.height / 2, _ = p - h, v = m - g, { midX: y, midY: b } = ih(_, v);
			K.set(i, {
				transformOrigin: "50% 80%",
				willChange: "transform,opacity",
				x: u,
				y: d,
				rotation: -12,
				rotationY: a ? 0 : -68,
				scale: a ? 1 : .62,
				opacity: +!!a
			});
			let x = K.timeline({ onComplete: () => {
				i.remove(), oh(e.playerId, e.roundIndex, t, n), r?.(e);
			} });
			a ? x.to(i, {
				x: _,
				y: v,
				rotation: 0,
				rotationY: 0,
				scale: 1,
				opacity: 1,
				duration: o,
				ease: ne
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
				ease: ne
			}), x.to(i, {
				scale: 1.02,
				duration: s * .45,
				yoyo: !0,
				repeat: 1,
				ease: P
			}, o);
		}, void 0, d);
	});
	let d = nh(e.length, a) + 120, f = window.setTimeout(() => {
		u.progress() < 1 && u.progress(1);
	}, d);
	return u.eventCallback("onComplete", () => window.clearTimeout(f)), u.eventCallback("onInterrupt", () => window.clearTimeout(f)), u;
}
//#endregion
//#region src/table/hooks/useTableDealPresentation.ts
function uh({ session: e, heroCards: t, privateHandReady: n = !1, tableRootRef: r, onDealPresentationComplete: i }) {
	let [a, o] = (0, l.useState)(!1), s = (0, l.useRef)(null), c = (0, l.useRef)(e.handNumber);
	return (0, l.useLayoutEffect)(() => {
		let t = r.current;
		t && c.current !== e.handNumber && (c.current = e.handNumber, s.current = null, ch(), sh(t), Im(!1), o(!1));
	}, [e.handNumber, r]), (0, l.useLayoutEffect)(() => {
		let a = r.current;
		if (!a) return;
		let c = e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play", l = t.length;
		if (!c || !n || l < 5) return;
		let u = `${e.handNumber}:${l}:${e.participantIds.join(",")}`;
		if (s.current === u) {
			i?.();
			return;
		}
		let d = pm(e.participantIds, e), f = pc(e.dealerId, e.participantIds, d.length ? d : e.participantIds);
		if (f.length < 2) return;
		let p = th(f, 5);
		if (!p.length) return;
		s.current = u, ch(), sh(a), a.classList.add("btable-wrap--clockwise-dealing"), o(!0), Im(!0);
		let m = kd(), h = window.requestAnimationFrame(() => {
			lh({
				steps: p,
				root: a,
				trumpHolderId: e.trumpHolderId ?? e.dealerId ?? null,
				onComplete: () => {
					a.classList.remove("btable-wrap--clockwise-dealing"), o(!1), Im(!1), i?.();
				}
			});
		}), g = window.setTimeout(() => {
			a.classList.remove("btable-wrap--clockwise-dealing"), o(!1), Im(!1), i?.();
		}, nh(p.length, m) + 400);
		return () => {
			window.cancelAnimationFrame(h), window.clearTimeout(g), ch(), a.classList.remove("btable-wrap--clockwise-dealing"), Im(!1), o(!1);
		};
	}, [
		e.handNumber,
		e.phase,
		e.dealerId,
		e.participantIds,
		t.length,
		n,
		r,
		i
	]), a;
}
//#endregion
//#region src/table/wonTrickPileModel.ts
function dh(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function fh(e, t) {
	return (e >>> t & 65535) / 65535;
}
function ph(e, t) {
	let n = dh(`${e}@book${t}`), r = fh(n, 0), i = fh(n, 9), a = fh(n, 17), o = r >= .5 ? 1 : -1, s = i >= .5 ? 1 : -1;
	return {
		offsetX: o * (1.5 + r * 2.5) + t * 2.2,
		offsetY: t * -1.8 + i * 1.2,
		rotation: s * (4 + a * 5) + t * 2.5,
		scale: .88 - t * .02,
		zIndex: t + 1
	};
}
function mh(e) {
	return `${e.playerId}:h${e.handNumber}:t${e.trickNumber}`;
}
//#endregion
//#region src/table/animations/wonTrickPileMotion.ts
var hh = /* @__PURE__ */ new Set(), gh = /* @__PURE__ */ new Set(), _h = re.drawDiscard;
function vh(e, t) {
	return {
		midX: e * .5,
		midY: t * .5
	};
}
function yh(e, t = document) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document, r = n.querySelector(`[data-won-trick-pile-anchor="${e}"]`) ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`);
	return r ? ta(r) : null;
}
function bh() {
	for (let e of gh) K.set(e, { clearProps: "opacity,transform,willChange,zIndex" });
	gh.clear();
}
function xh(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) e.remove();
}
function Sh(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".bseat--pile-reveal-ready")) e.classList.remove("bseat--pile-reveal-ready");
}
function Ch(e = document) {
	for (let e of hh) e.kill();
	hh.clear(), xh(e), bh(), Sh(e);
}
function wh() {
	for (let e of hh) e.kill();
	hh.clear(), bh();
}
function Th(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function Eh(e, t) {
	let n = ta(e), r = document.createElement("div");
	r.className = "won-trick-fly-ghost", r.setAttribute("aria-hidden", "true"), r.style.position = "fixed", r.style.left = `${n.left}px`, r.style.top = `${n.top}px`, r.style.width = `${n.width}px`, r.style.height = `${n.height}px`, r.style.pointerEvents = "none", r.style.zIndex = "4", r.style.transformOrigin = "50% 50%";
	let i = e.cloneNode(!0);
	return i.style.width = "100%", i.style.height = "100%", r.appendChild(i), t.appendChild(r), r;
}
function Dh(e, t) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document;
	(n.querySelector(`[data-won-trick-pile-anchor="${e}"]`)?.closest(".bseat") ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`)?.closest(".bseat"))?.classList.add("bseat--pile-reveal-ready");
}
function Oh(e, t) {
	qo(t.root ?? document);
	let n = I(), r = t.root ?? document, i = t.host ?? (r instanceof HTMLElement ? r : document.body), a = yh(t.winnerPlayerId, r), o = n ? .06 : 140 / 1e3, s = F(_h, n), c = n ? .03 : .05, l = [], u = (e) => {
		hh.delete(d);
		for (let e of l) e.remove();
		bh(), e && Dh(t.winnerPlayerId, r), t.onComplete?.();
	}, d = K.timeline({
		onComplete: () => u(!0),
		onInterrupt: () => u(!1)
	});
	hh.add(d), e.forEach((e, r) => {
		let u = ph(t.trickKey, t.bookIndex), f = Eh(e, i);
		l.push(f), gh.add(e), K.set(e, { opacity: 0 });
		let p = ta(f);
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
		let h = a.left + a.width / 2 + u.offsetX, g = a.top + a.height / 2 + u.offsetY, _ = p.left + p.width / 2, v = p.top + p.height / 2, y = h - _, b = g - v, { midX: x, midY: S } = vh(y, b);
		d.to(f, {
			scale: .98,
			duration: o,
			ease: ne
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
			ease: ne,
			onComplete: () => f.remove()
		}, m + o);
	});
	let f = Math.round((e.length > 0 ? (e.length - 1) * c : 0) * 1e3 + (o + s) * 1e3 + 60);
	return Th(d, Math.min(760, Math.max(300, f))), d;
}
function kh() {
	return hh.size > 0;
}
function Ah(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = [...t.querySelectorAll("[data-trick-variant=\"live\"] .btrick__play .pcard, [data-testid=\"trick-row\"] .btrick__play .pcard")].filter((e) => e.closest("[data-trick-variant=\"echo\"]") == null);
	return n.length > 0 ? n : [...t.querySelectorAll("[data-trick-variant=\"echo\"] .btrick__play .pcard")];
}
//#endregion
//#region src/table/hooks/useWonTrickCollection.ts
var jh = new Set(["nextLeadReady", "live"]), Mh = 48, Nh = 5;
function Ph(e, t = 0) {
	let n = Ah(e);
	return n.length > 0 || t >= Nh ? Promise.resolve(n) : new Promise((n) => {
		window.setTimeout(() => {
			Ph(e, t + 1).then(n);
		}, Mh);
	});
}
function Fh({ trickCollection: e, handNumber: t, sessionPhase: n = null, handComplete: r = !1, tableRootRef: i }) {
	let a = (0, l.useRef)(null), o = (0, l.useRef)(t), s = (0, l.useRef)(e.phase), c = (0, l.useRef)(null), u = (0, l.useRef)(!1), d = () => {
		c.current != null && (window.clearTimeout(c.current), c.current = null);
	}, f = (e) => {
		d();
		let t = kh() ? 820 : 0;
		c.current = window.setTimeout(() => {
			c.current = null, Ih(e);
		}, t);
	};
	(0, l.useLayoutEffect)(() => {
		let e = i.current;
		if (e) {
			if (o.current !== t) {
				o.current = t, a.current = null, d(), Ch(e);
				return;
			}
			(r || n != null && n !== "play") && (a.current = null, d(), Ch(e));
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
		if (!o || (n === "collectTrick" && jh.has(r) && (a.current = null, u.current = !1, f(o)), r !== "collectTrick")) return;
		let c = e.trickWinnerSeatId, l = e.frozenTrick;
		if (!c || !l) return;
		let p = `${l.trickNumber}:${c}:${l.plays.length}`;
		if (a.current === p) return;
		a.current = p, u.current = !0, d(), wh(), Lh(o);
		let m = Math.max(0, (e.displayTricksByPlayer[c] ?? 1) - 1), h = mh({
			playerId: c,
			handNumber: t,
			trickNumber: l.trickNumber
		}), g = !1, _ = null, v = (e) => {
			g || (u.current = !1, Rm(!1), Dh(c, o), Nd() && Q("useWonTrickCollection", "collect-skip-fly", {
				reason: e,
				collectKey: p,
				trickNumber: l.trickNumber
			}));
		};
		return Ph(o).then((e) => {
			if (!g) {
				if (!e.length) {
					v("no-dom-cards");
					return;
				}
				Rm(!0), _ = window.setTimeout(() => {
					Oh(e, {
						winnerPlayerId: c,
						trickKey: h,
						bookIndex: m,
						root: o,
						host: o,
						onComplete: () => {
							u.current = !1, Rm(!1);
						}
					});
				}, 240);
			}
		}), () => {
			g = !0, _ != null && window.clearTimeout(_), u.current = !1, Rm(!1);
		};
	}, [
		e.phase,
		e.trickWinnerSeatId,
		e.frozenTrick,
		e.displayTricksByPlayer,
		t,
		i
	]), (0, l.useEffect)(() => () => d(), []), (0, l.useLayoutEffect)(() => {
		let e = i.current;
		return () => {
			d(), e ? Ch(e) : wh();
		};
	}, [i]);
}
function Ih(e) {
	for (let t of e.querySelectorAll(".bseat--pile-reveal-ready")) t.classList.remove("bseat--pile-reveal-ready");
}
function Lh(e) {
	for (let t of e.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) t.remove();
}
//#endregion
//#region src/table/animations/settlePresentationMotion.ts
var Rh = 5;
function zh(e, t, n) {
	let r = e.getBoundingClientRect(), i = t.getBoundingClientRect(), a = [], o = document.createElement("div");
	o.className = "btable-settle-chip-layer", o.setAttribute("aria-hidden", "true"), document.body.appendChild(o);
	for (let e = 0; e < n; e += 1) {
		let e = document.createElement("span");
		e.className = "btable-settle-chip", e.style.left = `${r.left + r.width / 2}px`, e.style.top = `${r.top + r.height / 2}px`, o.appendChild(e), a.push(e);
	}
	let s = r.left + r.width / 2, c = r.top + r.height / 2, l = i.left + i.width / 2, u = i.top + i.height / 2;
	return a.map((e, t) => {
		let r = (t - (n - 1) / 2) * 6;
		return e.dataset.settleFromX = String(s + r), e.dataset.settleFromY = String(c), e.dataset.settleToX = String(l + r * .4), e.dataset.settleToY = String(u), e;
	});
}
function Bh(e, t, n) {
	let r = K.timeline({ onComplete: n });
	return e.forEach((e, n) => {
		let i = Number(e.dataset.settleFromX), a = Number(e.dataset.settleFromY), o = Number(e.dataset.settleToX), s = Number(e.dataset.settleToY);
		r.fromTo(e, {
			x: 0,
			y: 0,
			opacity: .95,
			scale: .85
		}, {
			x: o - i,
			y: s - a,
			opacity: .35,
			scale: .55,
			duration: t,
			ease: "power2.inOut",
			delay: n * .04
		}, 0);
	}), r;
}
function Vh(e) {
	let t = e[0]?.parentElement;
	e.forEach((e) => e.remove()), t?.remove();
}
function Hh(e) {
	let { kind: t, fromEl: n, toEl: r, durationMs: i, onComplete: a } = e, o = !1, s = () => {
		o || (o = !0, Bm(!1), a());
	};
	if (!n || !r || kd()) return Q("settleMotion", "skip", {
		kind: t,
		reason: "missing-target-or-reduced-motion"
	}), s(), s;
	Bm(!0), Q("settleMotion", "start", { kind: t });
	let c = zh(n, r, Rh), l = Bh(c, Math.max(.2, i / 1e3), () => {
		Vh(c), Q("settleMotion", "complete", { kind: t }), s();
	});
	return () => {
		l.kill(), Vh(c), s();
	};
}
//#endregion
//#region src/table/settlementCopy.ts
function Uh(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function Wh(e, t) {
	return e.map((e) => Uh(e, t)).join(" & ");
}
function Gh(e, t) {
	return Xu(e, t) ? t.filter((t) => (e[t] ?? 0) === 0) : [];
}
function Kh(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: a = {} } = e, o = $u(t, n), s = e.winnerIds?.length ? e.winnerIds : o.winnerIds, c = e.maxTricks ?? o.maxTricks, l = Wh(s, r), u = Gh(t, n), d = Wh(u, r), f = ed(i.maxWinThisHand), p = ed(i.currentPot), m = i.carryIn > 0 ? ed(i.carryIn) : null, h = `Pot this hand: ${p} (max win ${f})`;
	m && (h += ` — includes ${m} carried in`), i.limEnabled && i.overflow > 0 && (h += ` · LIM overflow ${ed(i.overflow)} stays out of play`);
	let g = s.map((e) => {
		let n = t[e] ?? 0;
		return `${Uh(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), _ = u.length > 0 ? `Bourré: ${d} took 0 tricks — each pays ${f} at settlement (seeds next deal)` : null, v = e.splitSharePerWinner, y = v > 0 && s.length >= 2 ? `If all co-winners agree to split: ${ed(i.maxWinThisHand)} → ${ed(v)} each` : null, b = s.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, x = `If any co-winner declines: full pot ${p} carries to the next hand · non-winners ante up`, S = s.map((e) => {
		let t = a[e], n = Uh(e, r);
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
//#region src/table/handPresentationMachine.ts
function qh(e) {
	return !e?.rank || !e?.suit ? "" : `${e.rank}-${e.suit}`;
}
function Jh(e) {
	return e === "handReset" || e === "ante" || e === "trumpReveal" || e === "trumpMerge" || e === "drawPlayer" || e === "drawReady" || e === "settle" || e === "nextHandReset";
}
function Yh(e) {
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
		declinedIds: [...e.declinedIds ?? []],
		tricksByPlayer: { ...e.tricksByPlayer ?? {} }
	};
}
function Xh(e) {
	return e.phase === "play" ? "play" : e.phase === "draw" ? "drawPlayer" : e.phase === "decision" ? "decision" : e.phase === "reveal" ? "handReset" : e.enrollmentActive ? "enrollment" : "idle";
}
function Zh(e) {
	return {
		phase: Xh(e),
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
		nextHandResetActive: e.phase === "reveal",
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		displayPotAmount: e.potAmount,
		prevSnapshot: e,
		pendingSnapshot: null,
		phaseStartedAt: Date.now(),
		dealPresentationComplete: !1,
		settleSubPhase: null,
		settleTricksByPlayer: {},
		settleWinnerIds: [],
		settleBourreIds: [],
		settlePayoutComplete: !1,
		settlePenaltyComplete: !1,
		drawPresentationConsumedIds: []
	};
}
function Qh(e, t, n = {}) {
	return {
		...e,
		...n,
		phase: t,
		phaseStartedAt: Date.now()
	};
}
function $h(e, t) {
	let n = {};
	for (let r of t.enrolledIds) e.enrolledIds.includes(r) || (n[r] = "join");
	for (let r of t.declinedIds) e.declinedIds.includes(r) || (n[r] = "pass");
	return n;
}
function eg(e, t, n) {
	for (let r of n.drawCompletedIds) if (!tg(e, r) && !e.displayDrawCompletedIds.includes(r) && !t.drawCompletedIds.includes(r)) return r;
	return null;
}
function tg(e, t) {
	return e.drawPresentationConsumedIds.includes(t);
}
function ng(e) {
	return e.phase === "drawPlayer" && e.animatingDrawPlayerId != null && e.drawAnimSubPhase !== "done";
}
function rg(e, t) {
	if (t.phase !== "draw" || !ng(e)) return null;
	let n = e.animatingDrawPlayerId, r = t.turnPlayerId;
	return !n || !r || t.drawCompletedIds.includes(r) || n === r && !t.drawCompletedIds.includes(n) ? null : (Nd() && Q("handPresentation", "fast-forward-stale-draw", {
		animating: n,
		turnId: r,
		drawCompleted: t.drawCompletedIds
	}), {
		...lg(e, t),
		pendingSnapshot: t,
		prevSnapshot: t
	});
}
function ig(e, t) {
	return !t || tg(e, t) ? e.drawPresentationConsumedIds : [...e.drawPresentationConsumedIds, t];
}
function ag(e, t) {
	return [...new Set([...e.drawPresentationConsumedIds, ...t])];
}
function og(e, t, n) {
	for (let r of t.actionOrder) if (t.participantIds.includes(r) && t.drawCompletedIds.includes(r) && !n.includes(r) && !tg(e, r)) return r;
	return null;
}
function sg(e, t, n, r) {
	Nd() && Q("handPresentation", "draw-candidate-resolve", {
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
function cg(e, t, n) {
	Nd() && Q("handPresentation", `draw-receive-commit-${e}`, {
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
function lg(e, t) {
	let n = e.animatingDrawPlayerId;
	if (!n) return e.drawAnimSubPhase === "done" ? e : {
		...e,
		drawAnimSubPhase: "done"
	};
	let r = e.displayDrawCompletedIds.includes(n) ? e.displayDrawCompletedIds : [...e.displayDrawCompletedIds, n], i = ig(e, n), a = t == null ? e.prevSnapshot : {
		...t,
		drawCompletedIds: [...r]
	};
	return cg("payload", e, {
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
function ug(e, t) {
	return e > 0 ? "discard" : t > 0 ? "receive" : "done";
}
function dg(e, t, n, r, i, a) {
	return tg(e, n) ? (sg(e, t, null, `consumed-skip:${n}:${a}`), e) : ng(e) && e.animatingDrawPlayerId !== n ? (sg(e, t, null, `in-flight-skip:${a}`), e) : (sg(e, t, n, a), Qh(e, "drawPlayer", {
		animatingDrawPlayerId: n,
		drawAnimSubPhase: ug(r, i),
		drawDiscardCount: r,
		drawReplaceCount: i,
		prevSnapshot: t,
		drawPresentationConsumedIds: ig(e, n)
	}));
}
function fg(e) {
	if (!e.pendingHandSettle || e.phase !== "play") return e;
	let t = e.handSettleSnapshot ?? e.prevSnapshot;
	if (!t) return e;
	let { tricks: n, winnerIds: r, bourreIds: i } = pg(t);
	return Qh(e, "settle", {
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		settleAnimActive: !0,
		settleCarryOver: t.carryOverPot > 0,
		prevSnapshot: t,
		displayPotAmount: t.potAmount,
		settleSubPhase: "trickTotals",
		settleTricksByPlayer: n,
		settleWinnerIds: r,
		settleBourreIds: i,
		settlePayoutComplete: !1,
		settlePenaltyComplete: !1
	});
}
function pg(e) {
	let t = { ...e.tricksByPlayer ?? {} }, { winnerIds: n } = $u(t, e.participantIds);
	return {
		tricks: t,
		winnerIds: n,
		bourreIds: Gh(t, e.participantIds)
	};
}
function mg(e) {
	return e.settleWinnerIds.length === 1 && e.displayPotAmount > 0;
}
function hg(e) {
	switch (e.settleSubPhase) {
		case "trickTotals": return "potPayout";
		case "potPayout": return e.settleBourreIds.length > 0 ? "bourreCallout" : "reset";
		case "bourreCallout": return e.settleBourreIds.length > 0 ? "bourrePenalty" : "reset";
		case "bourrePenalty": return "reset";
		case "reset": return "done";
		default: return "done";
	}
}
function gg(e) {
	let t = hg(e);
	return t === "done" ? Qh(e, "nextHandReset", {
		settleAnimActive: !1,
		settleSubPhase: null,
		nextHandResetActive: !0,
		pendingSnapshot: null
	}) : {
		...e,
		phase: "settle",
		settleSubPhase: t,
		phaseStartedAt: Date.now(),
		settlePayoutComplete: t === "potPayout" ? !1 : e.settlePayoutComplete,
		settlePenaltyComplete: t === "bourrePenalty" ? !1 : e.settlePenaltyComplete
	};
}
function _g(e, t = !1) {
	if (e.phase !== "settle" || !e.settleSubPhase) return 0;
	let n = t ? .55 : 1, r = (e) => Math.max(80, Math.round(e * n));
	switch (e.settleSubPhase) {
		case "trickTotals": return r(im);
		case "potPayout": return mg(e) && !e.settlePayoutComplete ? 0 : r(480);
		case "bourreCallout": return r(am);
		case "bourrePenalty": return e.settleBourreIds.length > 0 && !e.settlePenaltyComplete ? 0 : r(520);
		case "reset": return r(420);
		default: return 0;
	}
}
function vg(e, t) {
	return Qh(e, "ante", {
		trumpRevealActive: !!t.trumpUpcard,
		trumpMergeActive: !1,
		trumpMergedIntoHand: !1,
		anteAnimActive: !0,
		dealPresentationComplete: !1,
		dealStaggerCount: Math.max(e.dealStaggerCount, t.participantIds.length),
		prevSnapshot: t,
		displayPotAmount: t.potAmount,
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		pendingSnapshot: null,
		nextHandResetActive: !1
	});
}
function yg(e, t, n, r) {
	let i = eg(e, {
		...t,
		drawCompletedIds: []
	}, t);
	return i ? dg(e, t, i, n, r, "beginDrawSequence") : Qh(e, "drawPlayer", {
		displayDrawCompletedIds: e.displayDrawCompletedIds,
		prevSnapshot: t
	});
}
function bg(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function xg(e, t) {
	let n = Object.keys(e), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let r of n) if (e[r] !== t[r]) return !1;
	return !0;
}
function Sg(e, t) {
	return e.phase === t.phase && bg(e.displayDrawCompletedIds, t.displayDrawCompletedIds) && e.animatingDrawPlayerId === t.animatingDrawPlayerId && e.drawAnimSubPhase === t.drawAnimSubPhase && e.drawDiscardCount === t.drawDiscardCount && e.drawReplaceCount === t.drawReplaceCount && e.trumpRevealActive === t.trumpRevealActive && e.trumpMergeActive === t.trumpMergeActive && e.trumpMergedIntoHand === t.trumpMergedIntoHand && e.anteAnimActive === t.anteAnimActive && e.dealStaggerCount === t.dealStaggerCount && xg(e.enrollmentPulse, t.enrollmentPulse) && e.settleAnimActive === t.settleAnimActive && e.settleCarryOver === t.settleCarryOver && e.nextHandResetActive === t.nextHandResetActive && e.settleSubPhase === t.settleSubPhase && e.pendingHandSettle === t.pendingHandSettle && e.displayPotAmount === t.displayPotAmount && e.dealPresentationComplete === t.dealPresentationComplete && e.settlePayoutComplete === t.settlePayoutComplete && e.settlePenaltyComplete === t.settlePenaltyComplete;
}
function Cg(e) {
	return e.phase === "handReset" || e.nextHandResetActive;
}
function wg(e, t) {
	e.prevSnapshot = t.prevSnapshot, e.pendingSnapshot = t.pendingSnapshot, e.handSettleSnapshot = t.handSettleSnapshot, e.drawPresentationConsumedIds = t.drawPresentationConsumedIds, e.handNumber = t.handNumber, e.dealPresentationComplete = t.dealPresentationComplete, e.settlePayoutComplete = t.settlePayoutComplete, e.settlePenaltyComplete = t.settlePenaltyComplete, e.settleSubPhase = t.settleSubPhase, e.settleTricksByPlayer = t.settleTricksByPlayer, e.settleWinnerIds = t.settleWinnerIds, e.settleBourreIds = t.settleBourreIds, e.phaseStartedAt = t.phaseStartedAt;
}
function Tg(e, t) {
	return e === t ? e : Sg(e, t) ? (wg(e, t), e) : t;
}
function Eg(e, t) {
	let n = Tg(e, Dg(e, t));
	return Nd() && (e.phase !== n.phase && Pd("hand", e.phase, n.phase, {
		handNumber: n.handNumber,
		drawSubPhase: n.drawAnimSubPhase,
		animatingDrawPlayerId: n.animatingDrawPlayerId
	}), (e.phase !== n.phase || e.handNumber !== n.handNumber || e.trumpRevealActive !== n.trumpRevealActive || t.type === "serverUpdate") && Q("handPresentation", t.type, {
		phase: `${e.phase} -> ${n.phase}`,
		handNumber: `${e.handNumber} -> ${n.handNumber}`,
		trumpRevealActive: `${e.trumpRevealActive} -> ${n.trumpRevealActive}`,
		drawSubPhase: `${e.drawAnimSubPhase} -> ${n.drawAnimSubPhase}`,
		drawAnim: `${e.animatingDrawPlayerId ?? ""} -> ${n.animatingDrawPlayerId ?? ""}`,
		drawConsumed: n.drawPresentationConsumedIds.length,
		serverPhase: t.type === "serverUpdate" ? t.snapshot.phase : void 0,
		drawCompleted: t.type === "serverUpdate" ? t.snapshot.drawCompletedIds.length : void 0
	})), n;
}
function Dg(e, t) {
	switch (t.type) {
		case "reset": return Zh(t.snapshot);
		case "dealCardRevealed": return {
			...e,
			dealStaggerCount: Math.max(e.dealStaggerCount, t.count)
		};
		case "dealPresentationComplete": return e.dealPresentationComplete ? e : {
			...e,
			dealPresentationComplete: !0
		};
		case "settlePayoutComplete": return e.phase !== "settle" || e.settleSubPhase !== "potPayout" || e.settlePayoutComplete ? e : {
			...e,
			settlePayoutComplete: !0
		};
		case "settlePenaltyComplete": return e.phase !== "settle" || e.settleSubPhase !== "bourrePenalty" || e.settlePenaltyComplete ? e : {
			...e,
			settlePenaltyComplete: !0
		};
		case "clearEnrollmentPulse": return Object.keys(e.enrollmentPulse).length ? {
			...e,
			enrollmentPulse: {}
		} : e;
		case "watchdog":
			if (e.pendingHandSettle && e.phase === "play") return fg(e);
			if (e.phase === "ante" && !e.dealPresentationComplete && Date.now() - e.phaseStartedAt >= 8e3) return Nd() && Q("handPresentation", "ante-deal-stall-force-complete", {
				handNumber: e.handNumber,
				blockedMs: Date.now() - e.phaseStartedAt
			}), Og({
				...e,
				dealPresentationComplete: !0,
				pendingSnapshot: e.pendingSnapshot ?? e.prevSnapshot
			});
			if (e.phase === "settle" && e.settleSubPhase === "potPayout") {
				let t = Date.now() - e.phaseStartedAt;
				if (mg(e) && !e.settlePayoutComplete && t >= 2400) return Nd() && Q("handPresentation", "settle-payout-stall-force-complete", {
					handNumber: e.handNumber,
					blockedMs: t
				}), Og({
					...e,
					settlePayoutComplete: !0
				});
			}
			if (e.phase === "settle" && e.settleSubPhase === "bourrePenalty") {
				let t = Date.now() - e.phaseStartedAt;
				if (e.settleBourreIds.length > 0 && !e.settlePenaltyComplete && t >= 2400) return Nd() && Q("handPresentation", "settle-penalty-stall-force-complete", {
					handNumber: e.handNumber,
					blockedMs: t
				}), Og({
					...e,
					settlePenaltyComplete: !0
				});
			}
			return Date.now() - e.phaseStartedAt < 12e3 ? e : Og({
				...e,
				pendingSnapshot: e.pendingSnapshot ?? e.prevSnapshot
			});
		case "tryBeginHandSettle": return fg(e);
		case "advancePhase": return Og(e);
		case "serverUpdate": {
			let { snapshot: n, heroDrawDiscardCount: r = 0, heroDrawReplaceCount: i = 0 } = t, a = e.prevSnapshot ?? n;
			if (e.sessionKey !== n.sessionKey) {
				let e = Zh(n);
				return n.phase === "reveal" ? {
					...e,
					nextHandResetActive: !0,
					prevSnapshot: n
				} : e;
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
				let e = Zh(n);
				return n.phase === "reveal" ? {
					...e,
					nextHandResetActive: !0,
					prevSnapshot: n
				} : e;
			}
			let o = qh(a.trumpUpcard), s = qh(n.trumpUpcard);
			if (o && !s && !e.trumpMergeActive) return {
				...e,
				trumpRevealActive: !1,
				trumpMergeActive: !0,
				trumpMergedIntoHand: !0,
				prevSnapshot: n,
				pendingSnapshot: n,
				phaseStartedAt: Date.now()
			};
			if (n.phase === "play" && e.phase !== "play") return Qh(e, "play", {
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
			if (Jh(e.phase) && e.phase !== "drawPlayer" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done") return {
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
			let c = $h(a, n), l = Object.keys(c).length > 0;
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
			if (n.phase === "reveal" && a.phase !== "reveal" && (e.phase === "idle" || e.phase === "nextHandReset" || e.phase === "enrollment" || e.phase === "settle" || e.phase === "play")) return Qh(e, "handReset", {
				nextHandResetActive: !0,
				prevSnapshot: n,
				pendingSnapshot: null
			});
			if (n.phase === "draw" && a.enrollmentActive && !n.enrollmentActive && e.phase === "enrollment") {
				let t = !!n.trumpUpcard;
				return Qh(e, t ? "trumpReveal" : "ante", {
					trumpRevealActive: t,
					anteAnimActive: !0,
					dealStaggerCount: Math.max(e.dealStaggerCount, n.participantIds.length),
					prevSnapshot: n,
					displayPotAmount: n.potAmount
				});
			}
			if (n.phase === "draw" && (e.phase === "decision" || a.phase === "decision") && e.drawPresentationConsumedIds.length === 0 && e.displayDrawCompletedIds.length === 0 && e.phase !== "drawPlayer" && e.phase !== "drawReady") return yg(e, n, 0, 0);
			if (n.phase === "draw") {
				let t = rg(e, n);
				t && (e = t);
				let o = eg(e, a, n);
				if (o && e.phase !== "drawReady") {
					let t = e.phase === "drawPlayer" && e.animatingDrawPlayerId === o && e.drawAnimSubPhase !== "done";
					if (!t && !ng(e)) {
						let t = r > 0 || i > 0, a = t ? r : o === n.turnPlayerId ? 0 : 1;
						return dg(e, n, o, a, t ? i : a, "serverUpdate");
					}
					t ? sg(e, n, null, "serverUpdate:animating-same-player") : ng(e) && sg(e, n, null, "serverUpdate:in-flight-other-player");
				} else o || sg(e, n, null, "serverUpdate:no-candidate");
				if (n.drawCompletedIds.length === n.participantIds.length && n.participantIds.length > 0 && e.phase === "drawPlayer" && e.drawAnimSubPhase === "done") return Qh(e, "drawReady", { prevSnapshot: n });
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
function Og(e) {
	let t = e.pendingSnapshot, n = t ?? e.prevSnapshot;
	switch (e.phase) {
		case "handReset": {
			let n = t ?? e.prevSnapshot;
			return n ? vg(e, n) : Qh(e, "ante", {
				anteAnimActive: !0,
				dealPresentationComplete: !0,
				pendingSnapshot: null
			});
		}
		case "ante": return e.dealPresentationComplete ? e.trumpRevealActive || n?.trumpUpcard ? Qh(e, "trumpReveal", {
			trumpRevealActive: !0,
			anteAnimActive: !1,
			pendingSnapshot: null
		}) : n?.phase === "draw" ? yg(e, n, 0, 0) : Qh(e, "drawPlayer", {
			anteAnimActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		}) : e;
		case "trumpReveal": return n?.phase === "draw" ? {
			...yg(e, n, 0, 0),
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		} : Qh(e, "drawPlayer", {
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		});
		case "trumpMerge": return n?.phase === "draw" ? {
			...yg(e, n, 0, 0),
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0
		} : Qh(e, "drawPlayer", {
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
			cg("before", e);
			let t = e.animatingDrawPlayerId, r = lg(e, n);
			cg("after", r);
			let i = n ?? r.prevSnapshot;
			if (i && r.displayDrawCompletedIds.length >= i.participantIds.length) return Qh(r, "drawReady", {
				displayDrawCompletedIds: r.displayDrawCompletedIds,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				pendingSnapshot: null,
				prevSnapshot: {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				},
				drawPresentationConsumedIds: ag(r, r.displayDrawCompletedIds)
			});
			if (i) {
				let e = {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				}, n = og(r, i, r.displayDrawCompletedIds);
				if (cg("after", r, {
					playerId: t,
					nextCompleted: r.displayDrawCompletedIds,
					nextChosen: n
				}), n) return sg(r, i, n, "advancePhase:nextPlayer"), dg(r, e, n, 1, 1, "advancePhase:nextPlayer");
				sg(r, i, null, "advancePhase:no-next-player");
			}
			return r;
		}
		case "drawReady": return Qh(e, "play", { pendingSnapshot: null });
		case "settle": return e.settleSubPhase === "potPayout" && mg(e) && !e.settlePayoutComplete || e.settleSubPhase === "bourrePenalty" && e.settleBourreIds.length > 0 && !e.settlePenaltyComplete ? e : gg(e);
		case "nextHandReset": {
			let n = t ?? e.prevSnapshot;
			return n?.phase === "reveal" ? Qh(Zh(n), "handReset", {
				nextHandResetActive: !1,
				prevSnapshot: n
			}) : n ? Zh(n) : Qh(e, "idle", { nextHandResetActive: !1 });
		}
		default: return e;
	}
}
function kg(e) {
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
		handResetCueActive: Cg(e),
		settleSubPhase: e.settleSubPhase,
		settleTricksByPlayer: e.settleTricksByPlayer,
		settleWinnerIds: e.settleWinnerIds,
		settleBourreIds: e.settleBourreIds,
		showBourreCallout: e.settleSubPhase === "bourreCallout",
		pendingHandSettle: e.pendingHandSettle,
		suppressTurnIndicator: fm(e.phase),
		displayPotAmount: e.displayPotAmount,
		isPresenting: Jh(e.phase)
	};
}
function Ag(e, t = !1) {
	let n = um(t);
	switch (e.phase) {
		case "handReset": return n.handResetMs;
		case "ante": return e.dealPresentationComplete ? n.anteChipTravelMs : 0;
		case "trumpReveal": return n.trumpRevealHoldMs;
		case "trumpMerge": return n.trumpMergeAnimMs;
		case "drawPlayer": return e.drawAnimSubPhase === "done" ? 0 : dm(e.drawAnimSubPhase === "receive" ? 0 : e.drawDiscardCount, e.drawAnimSubPhase === "receive" ? e.drawReplaceCount : 0, t);
		case "drawReady": return n.drawReadyBeatMs;
		case "settle": return _g(e, t);
		case "nextHandReset": return n.nextHandResetMs;
		default: return 0;
	}
}
//#endregion
//#region src/table/hooks/useHandSettlePresentation.ts
function jg(e, t) {
	return e.querySelector(`[data-settle-chip-anchor="${t}"]`) ?? e.querySelector(`[data-won-trick-pile-anchor="${t}"]`) ?? e.querySelector(`[data-seat-motion-anchor="${t}"]`) ?? e.querySelector(`[data-seat-play-origin="${t}"]`);
}
function Mg(e, t) {
	for (let n of t) {
		let t = jg(e, n);
		if (t) return t;
	}
	return null;
}
function Ng(e, t) {
	for (let n of t) {
		let t = jg(e, n);
		if (t) return t;
	}
	return null;
}
function Pg(e) {
	return e.querySelector("[data-settle-pot-anchor]") ?? e.querySelector("[data-testid=\"pot-display\"]");
}
function Fg({ handPresentation: e, tableRootRef: t, presentationApiRef: n }) {
	let r = (0, l.useRef)(!1), i = (0, l.useRef)(!1), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = () => {
		o.current != null && (window.clearTimeout(o.current), o.current = null);
	}, c = (e, t) => {
		s(), o.current = window.setTimeout(() => {
			o.current = null, t === "payout" ? e.notifySettlePayoutComplete() : e.notifySettlePenaltyComplete();
		}, om);
	}, { phase: u, settleSubPhase: d, settleWinnerIds: f, settleBourreIds: p, displayPotAmount: m } = e;
	(0, l.useLayoutEffect)(() => {
		if (u !== "settle") {
			r.current = !1, i.current = !1, a.current?.(), a.current = null, s();
			return;
		}
		let e = t.current, o = n?.current;
		if (!(!e || !o)) {
			if (d === "potPayout" && !r.current) {
				if (r.current = !0, !mg({
					settleWinnerIds: f,
					displayPotAmount: m
				})) {
					o.notifySettlePayoutComplete();
					return;
				}
				c(o, "payout"), a.current = Hh({
					kind: "potPayout",
					fromEl: Pg(e),
					toEl: Mg(e, f),
					durationMs: 480,
					onComplete: () => {
						s(), o.notifySettlePayoutComplete();
					}
				});
				return;
			}
			if (d === "bourrePenalty" && p.length > 0 && !i.current) {
				i.current = !0, c(o, "penalty"), a.current = Hh({
					kind: "bourrePenalty",
					fromEl: Ng(e, p),
					toEl: Pg(e),
					durationMs: 520,
					onComplete: () => {
						s(), o.notifySettlePenaltyComplete();
					}
				});
				return;
			}
			d === "bourrePenalty" && p.length === 0 && o.notifySettlePenaltyComplete();
		}
	}, [
		u,
		d,
		f,
		p,
		m,
		t,
		n
	]), (0, l.useEffect)(() => () => {
		a.current?.(), a.current = null, s();
	}, []);
}
var Ig;
function Lg() {
	return Ig === void 0 ? !1 : Ig;
}
function Rg() {
	if (Lg()) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem("nbl-table-render-profile") === "1" ? !0 : new URLSearchParams(window.location.search).get("tableProfile") === "1";
	} catch {
		return !1;
	}
}
function zg(e, t, n, r, i, a, o = 8) {
	n <= o || console.log("[PROFILE]", {
		id: e,
		phase: t,
		actualDuration: Number(n.toFixed(2)),
		baseDuration: Number(r.toFixed(2)),
		startTime: Number(i.toFixed(2)),
		commitTime: Number(a.toFixed(2))
	});
}
var Bg = (e, t, n, r, i, a) => {
	Rg() && zg(e, t, n, r, i, a);
};
//#endregion
//#region src/table/tableProfiler.tsx
function Vg({ id: e, children: t }) {
	return Rg() ? /* @__PURE__ */ (0, C.jsx)(l.Profiler, {
		id: e,
		onRender: Bg,
		children: t
	}) : /* @__PURE__ */ (0, C.jsx)(C.Fragment, { children: t });
}
//#endregion
//#region src/table/CardTable.tsx
function Hg({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: g, recommendedDiscardIndices: _ = [], handComplete: v = !1, actionFeedback: y, handPresentation: b, microinteractions: x, onDealPresentationComplete: S, presentationApiRef: w, instantTrickPlays: T = !1, bigPotEvent: E = null, onDismissTableEvent: D, onToggleInHand: O, onPassEnrollment: k, onTrickDelta: A, onSubmitDraw: j, onPassDraw: M, onFoldDraw: ee, onPlayCard: te, onReaction: ne, onHeroUserActivity: N }) {
	let { rotated: P, playerCount: re, countClass: ie, tableAspect: F, handTiming: I, playerNames: L, displayPlayersById: R, selfPlayer: z, suppressTurn: B, drawCompleted: ae, hasActiveTurn: V, potMetricsForCenter: oe, wrapStyle: se } = xm({
		session: e,
		players: t,
		currentUserId: m,
		potMetrics: n,
		handPresentation: b,
		microinteractions: x,
		trumpHolderPresentation: f
	}), H = qd(ef, tf, uf, df), ce = e.sessionId, le = Ym({
		aspect: F,
		sessionKey: ce
	}), { cards: ue, pileIndexRef: de, commitDiscardCards: fe } = Ts({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: le
	});
	Xm({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: le,
		pileIndexRef: de,
		onDiscardCommitted: fe
	}), Zm({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: le
	}), $m({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: b,
		tableRootRef: le
	});
	let pe = uh({
		session: e,
		heroCards: a,
		privateHandReady: p,
		tableRootRef: le,
		onDealPresentationComplete: S
	});
	Fh({
		trickCollection: H,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: v,
		tableRootRef: le
	}), Fg({
		handPresentation: b,
		tableRootRef: le,
		presentationApiRef: w
	});
	let me = (0, l.useMemo)(() => t.filter((e) => e.inHand).map((e) => ({
		playerId: e.playerId,
		displayName: e.displayName
	})), [t]), he = (0, l.useMemo)(() => ({
		potMetrics: oe,
		participantCount: r,
		trumpUpcard: e.trumpUpcard,
		trumpSuit: e.trumpSuit,
		phase: e.phase,
		enrollmentActive: i,
		remainingDeckCount: e.remainingDeckCount,
		trickLeadSuit: e.currentTrick?.leadSuit ?? e.leadSuit ?? null,
		playerNames: L,
		anteAnimActive: b.anteAnimActive,
		trumpRevealActive: b.trumpRevealActive,
		hideCenterTrump: u,
		showTrumpSuitReminder: d,
		drawAnimPlayerId: b.animatingDrawPlayerId,
		drawAnimSubPhase: b.drawAnimSubPhase,
		drawDiscardCount: b.drawDiscardCount,
		settleAnimActive: b.settleAnimActive,
		settleCarryOver: b.settleCarryOver,
		settleSubPhase: b.settleSubPhase,
		settleTricksByPlayer: b.settleTricksByPlayer,
		settleWinnerIds: b.settleWinnerIds,
		settleSeatRows: me,
		potTick: x.potTick,
		trumpReminderPulse: x.trumpReminderPulse,
		instantTrickPlays: T,
		discardPileCards: ue
	}), [
		oe,
		r,
		e.trumpUpcard,
		e.trumpSuit,
		e.phase,
		e.remainingDeckCount,
		e.currentTrick?.leadSuit,
		e.leadSuit,
		i,
		L,
		b,
		me,
		u,
		d,
		x.potTick,
		x.trumpReminderPulse,
		T,
		ue
	]);
	return /* @__PURE__ */ (0, C.jsx)(Vg, {
		id: "GameTable",
		children: /* @__PURE__ */ (0, C.jsxs)("div", {
			ref: le,
			className: [
				"btable-wrap btable-wrap--stage-fit",
				ie,
				V ? "btable-wrap--has-active-turn" : "",
				pe ? "btable-wrap--clockwise-dealing" : "",
				b.handResetCueActive ? "btable-wrap--hand-reset" : ""
			].filter(Boolean).join(" "),
			"data-testid": "table-root",
			style: se,
			children: [/* @__PURE__ */ (0, C.jsx)("div", {
				className: "btable-wrap__table-area",
				children: /* @__PURE__ */ (0, C.jsx)("div", {
					className: "btable-wrap__stage-scaler",
					children: /* @__PURE__ */ (0, C.jsx)("div", {
						className: "table-stage-fit",
						children: /* @__PURE__ */ (0, C.jsxs)("div", {
							className: "table-stage",
							children: [
								/* @__PURE__ */ (0, C.jsxs)("div", {
									className: "table-oval",
									children: [/* @__PURE__ */ (0, C.jsx)("div", { className: "btable__rail" }), /* @__PURE__ */ (0, C.jsx)("div", {
										className: "btable__felt",
										"data-testid": "table-felt"
									})]
								}),
								/* @__PURE__ */ (0, C.jsx)("div", {
									className: "btable__play-zone",
									children: /* @__PURE__ */ (0, C.jsx)(Vg, {
										id: "TrickArea",
										children: /* @__PURE__ */ (0, C.jsx)(gf, { ...he })
									})
								}),
								/* @__PURE__ */ (0, C.jsx)(Vg, {
									id: "PlayerSeats",
									children: /* @__PURE__ */ (0, C.jsx)("div", {
										className: "btable__seats",
										"aria-label": "Players at the table",
										children: P.map((e, t) => /* @__PURE__ */ (0, C.jsx)(tm, {
											seatIndex: t,
											player: e,
											seatPlayer: R.get(e.playerId) ?? e,
											playerCount: re,
											isMobile: !1,
											clockwiseDealing: pe,
											onToggleInHand: O,
											onPassEnrollment: k,
											onTrickDelta: A,
											onReaction: ne
										}, e.playerId))
									})
								})
							]
						})
					})
				})
			}), /* @__PURE__ */ (0, C.jsx)(Vg, {
				id: "ActionBar",
				children: /* @__PURE__ */ (0, C.jsxs)("div", {
					className: "hand-panel",
					children: [E && Lu(a) && D && /* @__PURE__ */ (0, C.jsx)(Iu, {
						event: E,
						onDismiss: D
					}), /* @__PURE__ */ (0, C.jsx)(Fu, {
						cards: a,
						privateHandReady: p,
						phase: e.phase,
						enrollmentActive: i,
						isInHand: !!z?.inHand,
						isDealer: !!z?.isDealer,
						signedIn: !!m,
						isMyTurn: !!(m && e.turnPlayerId === m) && !B,
						dealStaggerMs: I.dealCardStaggerMs,
						drawAnimSubPhase: b.animatingDrawPlayerId === m ? b.drawAnimSubPhase : null,
						drawDiscardCount: b.animatingDrawPlayerId === m ? b.drawDiscardCount : 0,
						drawReplaceCount: b.animatingDrawPlayerId === m ? b.drawReplaceCount : 0,
						drawCompleted: ae,
						maxDrawDiscards: e.maxDrawDiscards ?? 4,
						legalPlayIndices: h ?? void 0,
						recommendedPlayIndex: g ?? void 0,
						recommendedDiscardIndices: _,
						handComplete: v,
						actionFeedback: y,
						onSubmitDraw: j,
						onPassDraw: M,
						onFoldDraw: ee,
						onPlayCard: te,
						currentUserId: m,
						revealedTrumpIndex: o,
						trumpMergeActive: s,
						trumpDisabledIndex: c,
						handNumber: e.handNumber,
						trickNumber: e.currentTrick?.trickNumber ?? null,
						turnPlayerId: e.turnPlayerId,
						tableRootRef: le,
						pileIndexRef: de,
						onDiscardCommitted: fe,
						onUserActivity: N,
						skipHeroDealMotion: pe
					})]
				})
			})]
		})
	});
}
//#endregion
//#region src/table/layout/useTableLayoutMode.ts
var Ug = "(orientation: portrait)";
function Wg() {
	let e = Wm(), [t, n] = (0, l.useState)(() => typeof window < "u" && window.matchMedia(Ug).matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Ug), t = () => n(e.matches);
		return t(), e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []), e ? t ? "mobile-portrait" : "mobile-landscape" : "desktop";
}
//#endregion
//#region src/table/hooks/useMobileStageFit.ts
function Gg(e, t) {
	if (typeof window > "u") return t;
	let n = getComputedStyle(document.documentElement).getPropertyValue(e).trim(), r = parseFloat(n);
	return Number.isFinite(r) ? r : t;
}
function Kg(e) {
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
function qg(e) {
	return e.closest(".btable-mobile__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function Jg({ aspect: e, sessionKey: t }) {
	let n = (0, l.useRef)(null), r = (0, l.useRef)(0), i = (0, l.useRef)(0), a = (0, l.useRef)(t), o = Wg(), { settings: s } = Ou(), c = o === "mobile-portrait";
	return (0, l.useLayoutEffect)(() => {
		if (typeof window > "u") return;
		let o = n.current;
		if (!o) return;
		a.current !== t && (a.current = t, r.current = 0, i.current = 0);
		let l = window.visualViewport, u = () => {
			let t = qg(o).getBoundingClientRect(), n = o.querySelector(".btable-mobile-hero-dock")?.getBoundingClientRect(), a = !!o.closest(".table-play-overlay"), u = c ? 104 : 92, d = c ? 210 : 168, f = Cm(n?.height ?? 0, r.current, u, d);
			r.current = f.peak;
			let p = f.height, m = parseInt(getComputedStyle(o).getPropertyValue("--player-count").trim(), 10) || 4, h = m <= 4, g = !c, _ = (g && h ? Gg("--mobile-fit-pad-x", 4) : Gg("--mobile-fit-pad-x", 8)) + (g && a ? 4 : 12), v = (g && h ? Gg("--mobile-fit-pad-y", 2) : Gg("--mobile-fit-pad-y", 6)) + (g && a ? 4 : 10), y = Gg("--mobile-fit-gap", c ? 8 : 6), b = l, x = Math.min(t.width, b?.width ?? window.innerWidth), S = Math.min(t.height, b?.height ?? window.innerHeight);
			if (a) {
				let e = wm(Kg(o), i.current, 72);
				i.current = e.peak, S = Math.max(140, S - e.height);
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = g ? {
				...Dm({
					availWidth: x,
					availHeight: S,
					aspect: e,
					userScale: 1,
					padX: _,
					padY: v,
					stageShare: Em(m)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Om({
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
			Lm() || zm() || (d ??= window.requestAnimationFrame(() => {
				d = null, u();
			}));
		}, p = new ResizeObserver(f), m = o.querySelector(".btable-mobile-hero-dock");
		m && p.observe(m);
		let h = qg(o);
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
function Yg({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: g, recommendedDiscardIndices: _ = [], handComplete: v = !1, actionFeedback: y, handPresentation: b, microinteractions: x, onDealPresentationComplete: S, presentationApiRef: w, instantTrickPlays: T = !1, bigPotEvent: E = null, onDismissTableEvent: D, onToggleInHand: O, onPassEnrollment: k, onTrickDelta: A, onSubmitDraw: j, onPassDraw: M, onFoldDraw: ee, onPlayCard: te, onHeroUserActivity: ne }) {
	let N = Wg() === "mobile-landscape" ? "landscape" : "portrait", P = xm({
		session: e,
		players: t,
		currentUserId: m,
		potMetrics: n,
		handPresentation: b,
		microinteractions: x,
		trumpHolderPresentation: f,
		mobileOrientation: N
	}), { rotated: re, opponents: ie, playerCount: F, countClass: I, handTiming: L, playerNames: R, displayPlayersById: z, selfPlayer: B, suppressTurn: ae, drawCompleted: V, hasActiveTurn: oe, potMetricsForCenter: se, wrapStyle: H } = P, ce = (0, l.useMemo)(() => B ? Zp(re.length, N) : null, [
		B,
		re.length,
		N
	]), le = qd(ef, tf, uf, df), ue = e.sessionId, de = Jg({
		aspect: P.tableAspect,
		sessionKey: ue
	}), { cards: fe, pileIndexRef: pe, commitDiscardCards: me } = Ts({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: de
	});
	Xm({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: de,
		pileIndexRef: pe,
		onDiscardCommitted: me
	}), Zm({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: de
	}), $m({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: b,
		tableRootRef: de
	});
	let he = uh({
		session: e,
		heroCards: a,
		privateHandReady: p,
		tableRootRef: de,
		onDealPresentationComplete: S
	});
	Fh({
		trickCollection: le,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: v,
		tableRootRef: de
	}), Fg({
		handPresentation: b,
		tableRootRef: de,
		presentationApiRef: w
	});
	let ge = (0, l.useMemo)(() => t.filter((e) => e.inHand).map((e) => ({
		playerId: e.playerId,
		displayName: e.displayName
	})), [t]), _e = (0, l.useMemo)(() => ({
		potMetrics: se,
		participantCount: r,
		trumpUpcard: e.trumpUpcard,
		trumpSuit: e.trumpSuit,
		phase: e.phase,
		enrollmentActive: i,
		remainingDeckCount: e.remainingDeckCount,
		trickLeadSuit: e.currentTrick?.leadSuit ?? e.leadSuit ?? null,
		playerNames: R,
		anteAnimActive: b.anteAnimActive,
		trumpRevealActive: b.trumpRevealActive,
		hideCenterTrump: u,
		showTrumpSuitReminder: d,
		drawAnimPlayerId: b.animatingDrawPlayerId,
		drawAnimSubPhase: b.drawAnimSubPhase,
		drawDiscardCount: b.drawDiscardCount,
		settleAnimActive: b.settleAnimActive,
		settleCarryOver: b.settleCarryOver,
		settleSubPhase: b.settleSubPhase,
		settleTricksByPlayer: b.settleTricksByPlayer,
		settleWinnerIds: b.settleWinnerIds,
		settleSeatRows: ge,
		potTick: x.potTick,
		trumpReminderPulse: x.trumpReminderPulse,
		instantTrickPlays: T,
		discardPileCards: fe
	}), [
		se,
		r,
		e.trumpUpcard,
		e.trumpSuit,
		e.phase,
		e.remainingDeckCount,
		e.currentTrick?.leadSuit,
		e.leadSuit,
		i,
		R,
		b,
		ge,
		u,
		d,
		x.potTick,
		x.trumpReminderPulse,
		T,
		fe
	]);
	return /* @__PURE__ */ (0, C.jsx)(Vg, {
		id: "GameTable",
		children: /* @__PURE__ */ (0, C.jsxs)("div", {
			ref: de,
			className: [
				"btable-mobile-wrap btable-mobile-wrap--stage-fit",
				I,
				oe ? "btable-wrap--has-active-turn" : "",
				he ? "btable-wrap--clockwise-dealing" : "",
				b.handResetCueActive ? "btable-wrap--hand-reset" : ""
			].filter(Boolean).join(" "),
			"data-testid": "table-root",
			"data-layout": N,
			style: H,
			children: [/* @__PURE__ */ (0, C.jsx)("div", {
				className: "btable-mobile__table-area",
				children: /* @__PURE__ */ (0, C.jsx)("div", {
					className: "btable-mobile__stage-scaler",
					children: /* @__PURE__ */ (0, C.jsx)("div", {
						className: "btable-mobile-stage-fit",
						children: /* @__PURE__ */ (0, C.jsxs)("div", {
							className: "btable-mobile-stage table-stage",
							children: [
								/* @__PURE__ */ (0, C.jsxs)("div", {
									className: "table-oval btable-mobile-oval",
									children: [/* @__PURE__ */ (0, C.jsx)("div", { className: "btable__rail" }), /* @__PURE__ */ (0, C.jsx)("div", {
										className: "btable__felt",
										"data-testid": "table-felt"
									})]
								}),
								/* @__PURE__ */ (0, C.jsx)("div", {
									className: "btable__play-zone",
									children: /* @__PURE__ */ (0, C.jsx)(Vg, {
										id: "TrickArea",
										children: /* @__PURE__ */ (0, C.jsx)(gf, { ..._e })
									})
								}),
								/* @__PURE__ */ (0, C.jsx)(Vg, {
									id: "PlayerSeats",
									children: /* @__PURE__ */ (0, C.jsxs)("div", {
										className: "btable__seats btable-mobile__seats",
										"aria-label": "Players at the table",
										children: [ie.map((e, t) => /* @__PURE__ */ (0, C.jsx)(tm, {
											seatIndex: t,
											player: e,
											seatPlayer: z.get(e.playerId) ?? e,
											playerCount: F,
											isMobile: !0,
											clockwiseDealing: he,
											layoutOverride: Xp(t, re.length, N),
											onToggleInHand: O,
											onPassEnrollment: k,
											onTrickDelta: A
										}, e.playerId)), B && ce && /* @__PURE__ */ (0, C.jsx)(tm, {
											seatIndex: 0,
											player: B,
											seatPlayer: z.get(B.playerId) ?? B,
											playerCount: F,
											isMobile: !0,
											clockwiseDealing: he,
											layoutOverride: ce,
											seatIndexAttr: 0,
											onToggleInHand: O,
											onPassEnrollment: k,
											onTrickDelta: A
										}, B.playerId)]
									})
								})
							]
						})
					})
				})
			}), /* @__PURE__ */ (0, C.jsx)(Vg, {
				id: "ActionBar",
				children: /* @__PURE__ */ (0, C.jsxs)("div", {
					className: "btable-mobile-hero-dock hand-panel",
					children: [/* @__PURE__ */ (0, C.jsxs)("div", {
						className: "btable-mobile-hero-dock__stack",
						children: [E && Lu(a) && D && /* @__PURE__ */ (0, C.jsx)(Iu, {
							event: E,
							onDismiss: D
						}), /* @__PURE__ */ (0, C.jsx)(Fu, {
							cards: a,
							privateHandReady: p,
							phase: e.phase,
							enrollmentActive: i,
							isInHand: !!B?.inHand,
							isDealer: !!B?.isDealer,
							signedIn: !!m,
							isMyTurn: !!(m && e.turnPlayerId === m) && !ae,
							dealStaggerMs: L.dealCardStaggerMs,
							drawAnimSubPhase: b.animatingDrawPlayerId === m ? b.drawAnimSubPhase : null,
							drawDiscardCount: b.animatingDrawPlayerId === m ? b.drawDiscardCount : 0,
							drawReplaceCount: b.animatingDrawPlayerId === m ? b.drawReplaceCount : 0,
							drawCompleted: V,
							maxDrawDiscards: e.maxDrawDiscards ?? 4,
							legalPlayIndices: h ?? void 0,
							recommendedPlayIndex: g ?? void 0,
							recommendedDiscardIndices: _,
							handComplete: v,
							actionFeedback: y,
							onSubmitDraw: j,
							onPassDraw: M,
							onFoldDraw: ee,
							onPlayCard: te,
							currentUserId: m,
							revealedTrumpIndex: o,
							trumpMergeActive: s,
							trumpDisabledIndex: c,
							handNumber: e.handNumber,
							trickNumber: e.currentTrick?.trickNumber ?? null,
							turnPlayerId: e.turnPlayerId,
							tableRootRef: de,
							pileIndexRef: pe,
							onDiscardCommitted: me,
							onUserActivity: ne,
							skipHeroDealMotion: he
						})]
					}), i && !B?.inHand && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-mobile-hero-dock__hint muted small",
						children: "Tap I'm in above to join this hand"
					})]
				})
			})]
		})
	});
}
//#endregion
//#region src/table/CinematicSplash.tsx
var Xg = new Set(["pot-cap", "hand-win"]);
function Zg({ events: e, onDismiss: t }) {
	let n = [...e].reverse().find((e) => Xg.has(e.kind));
	return (0, l.useEffect)(() => {
		if (!n) return;
		let e = window.setTimeout(() => t(n.id), n.durationMs ?? 2200);
		return () => window.clearTimeout(e);
	}, [n, t]), n ? /* @__PURE__ */ (0, C.jsxs)("div", {
		className: `bsplash bsplash--${n.kind}`,
		role: "status",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, C.jsx)("div", {
			className: "bsplash__glow",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, C.jsxs)("div", {
			className: "bsplash__content",
			children: [
				n.emoji && /* @__PURE__ */ (0, C.jsx)("span", {
					className: "bsplash__emoji",
					children: n.emoji
				}),
				/* @__PURE__ */ (0, C.jsx)("p", {
					className: "bsplash__title",
					children: n.title
				}),
				n.subtitle && /* @__PURE__ */ (0, C.jsx)("p", {
					className: "bsplash__subtitle",
					children: n.subtitle
				})
			]
		})]
	}) : null;
}
//#endregion
//#region src/table/DesktopLayoutShell.tsx
function Qg({ children: e }) {
	let { settings: t } = Ou(), n = t.layoutMode === "tiled", r = Wm();
	return /* @__PURE__ */ (0, C.jsx)("div", {
		className: [
			"btable-desktop",
			n ? "btable-desktop--tiled" : "btable-desktop--single",
			r ? "btable-desktop--native-mobile" : ""
		].join(" "),
		children: /* @__PURE__ */ (0, C.jsxs)("div", {
			className: "btable-desktop__viewport",
			children: [/* @__PURE__ */ (0, C.jsx)("div", {
				className: "btable-desktop__scale",
				children: e
			}), n && /* @__PURE__ */ (0, C.jsxs)("div", {
				className: "btable-desktop__tile-placeholder muted small",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, C.jsx)("span", { children: "Multi-room tile slot" }), /* @__PURE__ */ (0, C.jsx)("span", { children: "Monitor additional tables here in a future release" })]
			})]
		})
	});
}
//#endregion
//#region src/table/MobileLayoutShell.tsx
function $g({ children: e }) {
	let t = Wg();
	return /* @__PURE__ */ (0, C.jsx)("div", {
		className: ["btable-mobile", `btable-mobile--${t === "mobile-landscape" ? "landscape" : "portrait"}`].join(" "),
		"data-layout-mode": t,
		children: /* @__PURE__ */ (0, C.jsx)("div", {
			className: "btable-mobile__viewport",
			children: /* @__PURE__ */ (0, C.jsx)("div", {
				className: "btable-mobile__frame",
				children: /* @__PURE__ */ (0, C.jsx)("div", {
					className: "btable-mobile__layout",
					children: e
				})
			})
		})
	});
}
//#endregion
//#region src/table/EventReactions.tsx
function e_({ events: e, onDismiss: t }) {
	let n = e.filter((e) => e.emoji && e.kind === "reaction");
	return (0, l.useEffect)(() => {
		let e = n.map((e) => window.setTimeout(() => t(e.id), e.durationMs ?? 1600));
		return () => e.forEach((e) => window.clearTimeout(e));
	}, [n, t]), n.length ? /* @__PURE__ */ (0, C.jsx)("div", {
		className: "breactions",
		"aria-hidden": "true",
		children: n.map((e, t) => /* @__PURE__ */ (0, C.jsx)("div", {
			className: "breactions__burst",
			style: { "--burst-i": t },
			children: /* @__PURE__ */ (0, C.jsx)("span", {
				className: "breactions__emoji",
				children: e.emoji
			})
		}, e.id))
	}) : null;
}
//#endregion
//#region src/table/FeedbackSettings.tsx
function t_({ compact: e = !1 }) {
	let [t, n] = (0, l.useState)(() => Xc()), [r, i] = (0, l.useState)(!1);
	(0, l.useEffect)(() => el(n), []);
	let a = Pl(), o = Rl();
	function s(e) {
		Zc({ soundMode: e });
	}
	function c(e) {
		Zc({ soundPackId: e }), Fl(), pl(e);
	}
	function u(e) {
		Zc({ hapticsMode: e });
	}
	let d = /* @__PURE__ */ (0, C.jsxs)("div", {
		className: `bfeedback-settings${e ? " bfeedback-settings--compact" : ""}`,
		children: [
			/* @__PURE__ */ (0, C.jsxs)("fieldset", {
				className: "bfeedback-settings__fieldset",
				children: [
					/* @__PURE__ */ (0, C.jsx)("legend", {
						className: "bfeedback-settings__label",
						children: "Sound level"
					}),
					/* @__PURE__ */ (0, C.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, C.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "on",
							disabled: !a,
							onChange: () => s("on")
						}), "On"]
					}),
					/* @__PURE__ */ (0, C.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, C.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "minimal",
							disabled: !a,
							onChange: () => s("minimal")
						}), "Minimal"]
					}),
					/* @__PURE__ */ (0, C.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, C.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "off",
							onChange: () => s("off")
						}), "Off"]
					})
				]
			}),
			!a && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "bfeedback-settings__note muted small",
				children: "Audio not supported in this browser."
			}),
			/* @__PURE__ */ (0, C.jsxs)("label", {
				className: "bfeedback-settings__row",
				children: [/* @__PURE__ */ (0, C.jsx)("span", {
					className: "bfeedback-settings__label",
					children: "Sound theme"
				}), /* @__PURE__ */ (0, C.jsx)("select", {
					value: t.soundPackId,
					disabled: !a || t.soundMode === "off",
					onChange: (e) => c(e.target.value),
					children: Object.keys(Bc).map((e) => /* @__PURE__ */ (0, C.jsx)("option", {
						value: e,
						children: Bc[e]
					}, e))
				})]
			}),
			/* @__PURE__ */ (0, C.jsxs)("fieldset", {
				className: "bfeedback-settings__fieldset",
				children: [
					/* @__PURE__ */ (0, C.jsx)("legend", {
						className: "bfeedback-settings__label",
						children: "Haptics"
					}),
					/* @__PURE__ */ (0, C.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, C.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "on",
							disabled: !o,
							onChange: () => u("on")
						}), "On"]
					}),
					/* @__PURE__ */ (0, C.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, C.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "minimal",
							disabled: !o,
							onChange: () => u("minimal")
						}), "Minimal"]
					}),
					/* @__PURE__ */ (0, C.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, C.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "off",
							onChange: () => u("off")
						}), "Off"]
					})
				]
			}),
			!o && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "bfeedback-settings__note muted small",
				children: "Vibration unavailable on this device."
			})
		]
	});
	return e ? /* @__PURE__ */ (0, C.jsxs)("div", {
		className: "bfeedback-settings-wrap",
		children: [/* @__PURE__ */ (0, C.jsx)("button", {
			type: "button",
			className: "bfeedback-settings__toggle btn btn--sm",
			"aria-expanded": r,
			"aria-controls": "table-feedback-settings",
			onClick: () => i((e) => !e),
			children: r ? "Hide feedback" : "Sound & haptics"
		}), r && /* @__PURE__ */ (0, C.jsx)("div", {
			id: "table-feedback-settings",
			className: "bfeedback-settings__popover",
			children: d
		})]
	}) : d;
}
//#endregion
//#region src/table/TableSettingsPanel.tsx
function n_({ open: e, onClose: t }) {
	let { settings: n, updateSettings: r, resetSettings: i } = Ou();
	return e ? /* @__PURE__ */ (0, C.jsxs)("div", {
		className: "bsettings",
		role: "dialog",
		"aria-label": "Table appearance",
		"data-testid": "settings-panel",
		children: [/* @__PURE__ */ (0, C.jsxs)("div", {
			className: "bsettings__panel",
			children: [
				/* @__PURE__ */ (0, C.jsxs)("header", {
					className: "bsettings__head",
					children: [/* @__PURE__ */ (0, C.jsx)("h6", {
						className: "bsettings__title",
						children: "Table room"
					}), /* @__PURE__ */ (0, C.jsx)("button", {
						type: "button",
						className: "bsettings__close",
						onClick: t,
						"aria-label": "Close",
						children: "×"
					})]
				}),
				/* @__PURE__ */ (0, C.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, C.jsx)("span", { children: "Theme" }), /* @__PURE__ */ (0, C.jsx)("select", {
						value: n.themeId,
						onChange: (e) => r({ themeId: e.target.value }),
						children: Object.keys(bu).map((e) => /* @__PURE__ */ (0, C.jsx)("option", {
							value: e,
							children: bu[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, C.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, C.jsx)("span", { children: "Card style" }), /* @__PURE__ */ (0, C.jsx)("select", {
						value: n.cardPackId,
						onChange: (e) => r({ cardPackId: e.target.value }),
						children: Object.keys(vu).map((e) => /* @__PURE__ */ (0, C.jsx)("option", {
							value: e,
							children: vu[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, C.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, C.jsx)("span", { children: "Deck" }), /* @__PURE__ */ (0, C.jsxs)("select", {
						value: n.deckMode,
						onChange: (e) => r({ deckMode: e.target.value }),
						children: [/* @__PURE__ */ (0, C.jsx)("option", {
							value: "classic",
							children: "Classic two-color"
						}), /* @__PURE__ */ (0, C.jsx)("option", {
							value: "four-color",
							children: "Four-color contrast"
						})]
					})]
				}),
				/* @__PURE__ */ (0, C.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, C.jsx)("span", { children: "Card size" }), /* @__PURE__ */ (0, C.jsxs)("select", {
						value: n.cardScale,
						onChange: (e) => r({ cardScale: e.target.value }),
						children: [
							/* @__PURE__ */ (0, C.jsx)("option", {
								value: "sm",
								children: "Compact"
							}),
							/* @__PURE__ */ (0, C.jsx)("option", {
								value: "md",
								children: "Standard"
							}),
							/* @__PURE__ */ (0, C.jsx)("option", {
								value: "lg",
								children: "Large"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, C.jsxs)("label", {
					className: "bsettings__field bsettings__field--row",
					children: [
						/* @__PURE__ */ (0, C.jsx)("span", { children: "Table scale" }),
						/* @__PURE__ */ (0, C.jsx)("input", {
							type: "range",
							min: .85,
							max: 1.35,
							step: .05,
							value: n.tableScale,
							onChange: (e) => r({ tableScale: Number(e.target.value) })
						}),
						/* @__PURE__ */ (0, C.jsxs)("span", {
							className: "bsettings__range-val",
							children: [Math.round(n.tableScale * 100), "%"]
						})
					]
				}),
				/* @__PURE__ */ (0, C.jsxs)("label", {
					className: "bsettings__check",
					children: [/* @__PURE__ */ (0, C.jsx)("input", {
						type: "checkbox",
						checked: n.highContrast,
						onChange: (e) => r({ highContrast: e.target.checked })
					}), "High contrast"]
				}),
				/* @__PURE__ */ (0, C.jsxs)("fieldset", {
					className: "bsettings__fieldset",
					children: [
						/* @__PURE__ */ (0, C.jsx)("legend", { children: "Layout (scaffold)" }),
						/* @__PURE__ */ (0, C.jsxs)("label", {
							className: "bsettings__check",
							children: [/* @__PURE__ */ (0, C.jsx)("input", {
								type: "radio",
								name: "layout",
								checked: n.layoutMode === "single",
								onChange: () => r({ layoutMode: "single" })
							}), "Single table"]
						}),
						/* @__PURE__ */ (0, C.jsxs)("label", {
							className: "bsettings__check bsettings__check--muted",
							children: [/* @__PURE__ */ (0, C.jsx)("input", {
								type: "radio",
								name: "layout",
								checked: n.layoutMode === "tiled",
								onChange: () => r({ layoutMode: "tiled" })
							}), "Tiled multi-room (preview)"]
						})
					]
				}),
				/* @__PURE__ */ (0, C.jsxs)("details", {
					className: "bsettings__hotkeys",
					children: [/* @__PURE__ */ (0, C.jsx)("summary", { children: "Hotkeys (scaffold)" }), /* @__PURE__ */ (0, C.jsxs)("ul", {
						className: "bsettings__hotkey-list muted small",
						children: [
							/* @__PURE__ */ (0, C.jsxs)("li", { children: [/* @__PURE__ */ (0, C.jsx)("kbd", { children: n.hotkeys.focusTable }), " Focus table"] }),
							/* @__PURE__ */ (0, C.jsxs)("li", { children: [/* @__PURE__ */ (0, C.jsx)("kbd", { children: n.hotkeys.toggleSettings }), " Settings"] }),
							/* @__PURE__ */ (0, C.jsxs)("li", { children: [/* @__PURE__ */ (0, C.jsx)("kbd", { children: n.hotkeys.standPat }), " Stand pat (reserved)"] }),
							/* @__PURE__ */ (0, C.jsxs)("li", { children: [/* @__PURE__ */ (0, C.jsx)("kbd", { children: n.hotkeys.nextTable }), " Next table (reserved)"] })
						]
					})]
				}),
				/* @__PURE__ */ (0, C.jsx)("footer", {
					className: "bsettings__foot",
					children: /* @__PURE__ */ (0, C.jsx)("button", {
						type: "button",
						className: "btn btn--sm",
						onClick: i,
						children: "Reset defaults"
					})
				})
			]
		}), /* @__PURE__ */ (0, C.jsx)("button", {
			type: "button",
			className: "bsettings__backdrop",
			onClick: t,
			"aria-label": "Close"
		})]
	}) : null;
}
//#endregion
//#region src/table/hooks/useTableEvents.ts
var r_ = 0;
function i_() {
	return r_ += 1, `evt-${r_}-${Date.now()}`;
}
function a_(e, t, n) {
	let r = t.currentPot, i = [];
	return r >= t.potCap && t.limEnabled && r > e.pot ? i.push({
		id: i_(),
		kind: "pot-cap",
		title: "Pot cap reached",
		subtitle: "LmT engaged",
		emoji: "🔒",
		durationMs: 2200
	}) : r >= t.anteAmount * Math.max(n.length, 2) * 2 && r > e.pot && i.push({
		id: i_(),
		kind: "big-pot",
		title: "Big pot brewing",
		emoji: "💰",
		durationMs: 2e3
	}), i;
}
function o_({ session: e, potMetrics: t, participantIds: n }) {
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
		let o = a_(r, t, n);
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
				id: i_(),
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
//#region src/table/hooks/useHandPresentation.ts
var s_ = [], c_ = [];
function l_(e, t) {
	let n = new Set(e), r = new Set(t);
	return {
		discardCount: [...n].filter((e) => !r.has(e)).length,
		replaceCount: [...r].filter((e) => !n.has(e)).length
	};
}
function u_({ session: e, enrollmentActive: t, potAmount: n, handComplete: r, trickPipelineActive: i = !1, forceTrickHandEndDrain: a, heroCards: o = c_, enrolledIds: s = s_, declinedIds: c = s_, actionOrder: u, presentationApiRef: d }) {
	let f = (0, l.useMemo)(() => Yh({
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
		declinedIds: c,
		tricksByPlayer: e.tricksByPlayer
	}), [
		e,
		t,
		n,
		r,
		s,
		c,
		u
	]), [p, m] = (0, l.useReducer)(Eg, f, Zh), h = (0, l.useRef)([]), g = (0, l.useRef)([]), _ = (0, l.useRef)(null), v = (0, l.useRef)(p);
	v.current = p, d && (d.current = {
		notifyDealPresentationComplete: () => {
			m({ type: "dealPresentationComplete" });
		},
		notifySettlePayoutComplete: () => {
			m({ type: "settlePayoutComplete" });
		},
		notifySettlePenaltyComplete: () => {
			m({ type: "settlePenaltyComplete" });
		}
	});
	let y = () => {
		for (let e of h.current) window.clearTimeout(e);
		h.current = [], _.current = null;
	}, b = (e, t) => {
		let n = window.setTimeout(e, t);
		h.current.push(n);
	};
	return (0, l.useEffect)(() => () => y(), []), (0, l.useEffect)(() => () => {
		d && (d.current = null);
	}, [d]), (0, l.useEffect)(() => {
		let e = o.map((e) => `${e.rank}-${e.suit}`), t = l_(g.current, e);
		g.current = e, m({
			type: "serverUpdate",
			snapshot: f,
			heroDrawDiscardCount: t.discardCount,
			heroDrawReplaceCount: t.replaceCount
		}), Nd() && Q("useHandPresentation", "serverUpdate-effect", {
			handNumber: f.handNumber,
			serverPhase: f.phase,
			drawCompleted: f.drawCompletedIds.length,
			participantCount: f.participantIds.length,
			trumpUpcard: !!f.trumpUpcard,
			turnPlayerId: f.turnPlayerId
		});
	}, [f, o]), (0, l.useEffect)(() => {
		if (!Object.values(p.enrollmentPulse).some(Boolean)) return;
		let e = window.setTimeout(() => m({ type: "clearEnrollmentPulse" }), 480);
		return () => window.clearTimeout(e);
	}, [JSON.stringify(p.enrollmentPulse)]), (0, l.useEffect)(() => {
		let e = kd(), t = `${p.handNumber}:${p.phase}:${p.animatingDrawPlayerId ?? ""}:${p.drawAnimSubPhase}:${p.phaseStartedAt}`, n = Ag(p, e), r = p.phase === "settle" && (p.settleSubPhase === "potPayout" && mg(p) && !p.settlePayoutComplete || p.settleSubPhase === "bourrePenalty" && p.settleBourreIds.length > 0 && !p.settlePenaltyComplete), i = `motion:${t}`;
		if (n <= 0 && r) {
			if (_.current === i) return;
			y(), _.current = i, b(() => m({ type: "watchdog" }), om);
			return;
		}
		if (_.current === t) {
			Nd() && Q("useHandPresentation", "advancePhase-timer-skip-duplicate", { phaseKey: t });
			return;
		}
		if (y(), n <= 0) return;
		let a = {
			handNumber: p.handNumber,
			phase: p.phase,
			animatingDrawPlayerId: p.animatingDrawPlayerId,
			drawAnimSubPhase: p.drawAnimSubPhase,
			phaseStartedAt: p.phaseStartedAt
		};
		_.current = t, Nd() && Q("useHandPresentation", "advancePhase-timer-armed", {
			phaseKey: t,
			delay: n,
			fromPhase: p.phase,
			drawAnimSubPhase: p.drawAnimSubPhase
		}), b(() => {
			if (_.current !== t) return;
			_.current = null;
			let e = v.current;
			if (e.handNumber !== a.handNumber || e.phase !== a.phase || e.animatingDrawPlayerId !== a.animatingDrawPlayerId || e.drawAnimSubPhase !== a.drawAnimSubPhase || e.phaseStartedAt !== a.phaseStartedAt) {
				Nd() && Q("useHandPresentation", "advancePhase-timer-stale", {
					armedAt: a,
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
			Nd() && Q("useHandPresentation", "advancePhase-timer", {
				fromPhase: a.phase,
				delay: n,
				animatingDrawPlayerId: a.animatingDrawPlayerId,
				drawAnimSubPhase: a.drawAnimSubPhase
			}), m({ type: "advancePhase" });
		}, n), b(() => m({ type: "watchdog" }), p.phase === "drawPlayer" || p.phase === "drawReady" ? cm : sm);
	}, [
		p.handNumber,
		p.phase,
		p.animatingDrawPlayerId,
		p.drawAnimSubPhase,
		p.phaseStartedAt,
		p.dealPresentationComplete,
		p.settleSubPhase,
		p.settlePayoutComplete,
		p.settlePenaltyComplete
	]), (0, l.useEffect)(() => {
		if (e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play") {
			let e = o.length;
			e > 0 && m({
				type: "dealCardRevealed",
				count: e
			});
		}
	}, [o.length, e.phase]), (0, l.useEffect)(() => {
		i || m({ type: "tryBeginHandSettle" });
	}, [i]), (0, l.useEffect)(() => {
		if (p.phase !== "play" || !p.pendingHandSettle) return;
		if (!i) {
			m({ type: "tryBeginHandSettle" });
			return;
		}
		let e = window.setTimeout(() => {
			let e = v.current;
			e.phase !== "play" || !e.pendingHandSettle || (Nd() && Q("useHandPresentation", "hand-end-convergence-force", { trickPipelineActive: !0 }), a?.(), m({ type: "tryBeginHandSettle" }));
		}, lm);
		return () => window.clearTimeout(e);
	}, [
		p.phase,
		p.pendingHandSettle,
		i,
		a
	]), (0, l.useMemo)(() => kg(p), [p]);
}
//#endregion
//#region src/table/TurnCountdownSync.tsx
function d_({ input: e }) {
	return fp(e), (0, l.useEffect)(() => () => pp(), []), null;
}
var f_ = new Set(["handPresenting", "dealPresentationActive"]);
function p_(e) {
	return f_.has(e);
}
var m_ = {
	pipelineActive: !1,
	revealCatchUp: !1,
	motionGateActive: !1,
	peakPlayCount: 0,
	displayedPlayCount: 0,
	handPresenting: !1,
	handPresentationPhase: "idle",
	dealPresentationActive: !1,
	trickCollectionActive: !1
}, h_ = m_, g_ = /* @__PURE__ */ new Set(), __ = 0, v_ = null;
function y_(e, t) {
	return e.pipelineActive === t.pipelineActive && e.revealCatchUp === t.revealCatchUp && e.motionGateActive === t.motionGateActive && e.peakPlayCount === t.peakPlayCount && e.displayedPlayCount === t.displayedPlayCount && e.handPresenting === t.handPresenting && e.handPresentationPhase === t.handPresentationPhase && e.dealPresentationActive === t.dealPresentationActive && e.trickCollectionActive === t.trickCollectionActive;
}
function b_(e) {
	return e.dealPresentationActive ? "dealPresentationActive" : e.trickCollectionActive ? "trickCollectionActive" : e.handPresenting ? "handPresenting" : e.pipelineActive ? "pipelineActive" : e.revealCatchUp ? "revealCatchUp" : e.peakPlayCount > e.displayedPlayCount && e.peakPlayCount > 0 ? "peakPlayCatchUp" : null;
}
function x_(e) {
	return b_(e) != null;
}
function S_(e, t, n) {
	return !(!e || n === "play" || (n === "draw" || n === "reveal" || n === "decision") && new Set([
		"handReset",
		"nextHandReset",
		"ante",
		"trumpReveal",
		"trumpMerge",
		"drawPlayer",
		"drawReady",
		"enrollment",
		"decision"
	]).has(t));
}
function C_(e) {
	let t = { ...h_ }, n = v_ ? Date.now() - v_.since : 0, r = {
		...h_,
		pipelineActive: !1,
		revealCatchUp: !1,
		handPresenting: !1,
		handPresentationPhase: "idle",
		peakPlayCount: h_.displayedPlayCount,
		motionGateActive: !1,
		dealPresentationActive: !1,
		trickCollectionActive: !1
	};
	__ = Date.now() + 1500, v_ = null, Nd() && Q("trickAnimationBridge", "table-presentation-force-release", {
		source: e,
		blockedMs: n,
		from: t,
		to: r
	}), E_(r);
}
function w_(e = Date.now()) {
	if (e < __) return {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	let t = b_(h_);
	if (t == null) return v_ = null, {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	(!v_ || v_.reason !== t) && (v_ = {
		reason: t,
		since: e,
		blockedLogged: !1
	});
	let n = e - v_.since;
	return n >= 7e3 ? (Nd() && !v_.blockedLogged && Q("trickAnimationBridge", "gate-force-release", {
		reason: t,
		blockedMs: n
	}), C_("gate-timeout"), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !0
	}) : n >= 5500 && p_(t) ? (Nd() && !v_.blockedLogged && (Q("trickAnimationBridge", "gate-soft-unblock", {
		reason: t,
		blockedMs: n
	}), v_.blockedLogged = !0), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !1
	}) : (Nd() && !v_.blockedLogged && (Q("trickAnimationBridge", "gate-blocked", {
		reason: t,
		blockedMs: n
	}), v_.blockedLogged = !0), {
		blocked: !0,
		reason: t,
		blockedMs: n,
		softUnblock: !1,
		forceReleased: !1
	});
}
function T_(e = Date.now()) {
	return w_(e).blocked;
}
function E_(e) {
	if (!y_(h_, e)) {
		Nd() && Q("trickAnimationBridge", "busy-state", {
			from: h_,
			to: e,
			busy: x_(e),
			blockReason: b_(e),
			motionGateActive: e.motionGateActive,
			handPresentationPhase: e.handPresentationPhase
		}), h_ = e, b_(e) ?? (v_ = null);
		for (let e of g_) e();
	}
}
function D_() {
	__ = 0, v_ = null, E_(m_);
}
function O_() {
	return h_;
}
function k_() {
	return h_.pipelineActive || h_.revealCatchUp || h_.motionGateActive || h_.trickCollectionActive || h_.peakPlayCount > h_.displayedPlayCount && h_.peakPlayCount > 0;
}
function A_() {
	return x_(h_);
}
function j_(e) {
	return g_.add(e), () => g_.delete(e);
}
//#endregion
//#region src/table/TrickAnimationBusySync.tsx
function M_(e) {
	return {
		pipelineActive: e.pipelineActive,
		revealCatchUp: e.revealCatchUp,
		motionGateActive: e.motionGateActive,
		peakPlayCount: e.peakPlayCount,
		displayedPlayCount: e.displayedPlayCount,
		handPresenting: e.handPresenting,
		handPresentationPhase: e.handPresentationPhase,
		dealPresentationActive: Lm(),
		trickCollectionActive: zm()
	};
}
function N_(e) {
	E_(M_(e));
}
function P_({ input: e }) {
	let t = (0, l.useRef)(e);
	return t.current = e, (0, l.useEffect)(() => {
		N_(t.current);
	}), (0, l.useEffect)(() => Vm(() => {
		N_(t.current);
	}), []), null;
}
//#endregion
//#region src/table/hooks/useTableMicrointeractions.ts
function F_(e) {
	let [t, n] = (0, l.useState)(oc), r = (0, l.useRef)(null), i = (0, l.useRef)([]), a = () => {
		for (let e of i.current) window.clearTimeout(e);
		i.current = [];
	}, o = (e, t) => {
		let n = window.setTimeout(e, t);
		i.current.push(n);
	};
	(0, l.useEffect)(() => () => a(), []);
	let s = JSON.stringify(e.tricksByPlayer), c = JSON.stringify(e.bankrollByPlayer), u = JSON.stringify(e.bourrePlayerIds);
	return (0, l.useEffect)(() => {
		let t = cc(r.current, e);
		if (r.current = sc(e), !(!t.turnHandoffPlayerId && !t.dealerMovedPlayerId && !t.potTick && Object.keys(t.trickBadgeIncrements).length === 0 && Object.keys(t.bankrollChanges).length === 0 && t.bourrePlayerIds.length === 0 && !t.trumpReminderPulse && !t.feedbackErrorPulse && !t.feedbackSuccessPulse && !t.winnerFlashPlayerId)) {
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
			}, ac.turnHandoff), t.dealerMovedPlayerId && o(() => {
				n((e) => e.dealerMovedPlayerId === t.dealerMovedPlayerId ? {
					...e,
					dealerMovedPlayerId: null
				} : e);
			}, ac.dealerMove), t.winnerFlashPlayerId && o(() => {
				n((e) => e.winnerFlashPlayerId === t.winnerFlashPlayerId ? {
					...e,
					winnerFlashPlayerId: null
				} : e);
			}, ac.winnerFlash);
			for (let [e, r] of Object.entries(t.bankrollChanges)) o(() => {
				n((t) => {
					if (t.bankrollTicks[e] !== r) return t;
					let n = { ...t.bankrollTicks };
					return delete n[e], {
						...t,
						bankrollTicks: n
					};
				});
			}, ac.bankrollTick);
			for (let e of t.bourrePlayerIds) o(() => {
				n((t) => t.bourreAlerts[e] === "pulse" ? {
					...t,
					bourreAlerts: {
						...t.bourreAlerts,
						[e]: "marker"
					}
				} : t);
			}, ac.bourrePulse), o(() => {
				n((t) => {
					if (!t.bourreAlerts[e]) return t;
					let n = { ...t.bourreAlerts };
					return delete n[e], {
						...t,
						bourreAlerts: n
					};
				});
			}, ac.bourreMarker);
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
function I_({ active: e, displayName: t }) {
	let [n, r] = (0, l.useState)(!1), i = kd();
	return (0, l.useEffect)(() => {
		if (!e) {
			r(!1);
			return;
		}
		r(!0);
		let t = i ? 900 : 1400, n = window.setTimeout(() => r(!1), t);
		return () => window.clearTimeout(n);
	}, [e, i]), n ? /* @__PURE__ */ (0, C.jsxs)("div", {
		className: ["bbourre-sting", i ? "bbourre-sting--reduced" : ""].filter(Boolean).join(" "),
		"data-testid": "bourre-result-sting",
		role: "status",
		"aria-live": "polite",
		"aria-label": t ? `${t} went bourré` : "Bourré",
		children: [/* @__PURE__ */ (0, C.jsx)("div", {
			className: "bbourre-sting__wash",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, C.jsxs)("div", {
			className: "bbourre-sting__badge",
			children: [/* @__PURE__ */ (0, C.jsx)("span", {
				className: "bbourre-sting__label",
				children: "Bourré"
			}), t ? /* @__PURE__ */ (0, C.jsx)("span", {
				className: "bbourre-sting__name muted small",
				children: t
			}) : null]
		})]
	}) : null;
}
//#endregion
//#region src/table/hooks/useYourTurnAttention.ts
var L_ = Bf, R_ = [
	12e3,
	18e3,
	24e3
];
function z_(e) {
	let [t, n] = (0, l.useState)("hidden"), [r, i] = (0, l.useState)(0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(null), c = (0, l.useRef)(0), u = (0, l.useRef)(e.actionRequired);
	u.current = e.actionRequired;
	let d = () => {
		a.current != null && (window.clearTimeout(a.current), a.current = null), o.current != null && (window.clearTimeout(o.current), o.current = null), s.current != null && (window.clearTimeout(s.current), s.current = null);
	}, f = (0, l.useCallback)(() => {
		let e = c.current;
		if (e === 0) return;
		let t = R_[Math.min(e - 1, R_.length - 1)];
		a.current = window.setTimeout(() => {
			a.current = null, u.current && (i(e), n("pop"), c.current = e + 1);
		}, t);
	}, []);
	return (0, l.useEffect)(() => (d(), c.current = 0, e.actionRequired ? (a.current = window.setTimeout(() => {
		a.current = null, u.current && (i(0), n("pop"), c.current = 1);
	}, L_), d) : (n("hidden"), i(0), d)), [e.activityKey, e.actionRequired]), (0, l.useEffect)(() => {
		if (t !== "pop") return;
		let e = kd() ? 280 : 420;
		return o.current = window.setTimeout(() => {
			o.current = null, n("exit");
		}, 380 + e), () => {
			o.current != null && (window.clearTimeout(o.current), o.current = null);
		};
	}, [t, r]), (0, l.useEffect)(() => {
		if (t !== "exit") return;
		let e = kd() ? 240 : 620;
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
function B_() {
	return kd();
}
//#endregion
//#region src/table/YourTurnAttention.tsx
function V_({ actionRequired: e, activityKey: t }) {
	let { phase: n, beat: r } = z_({
		actionRequired: e,
		activityKey: t
	});
	if (n === "hidden") return null;
	let i = B_(), a = Math.min(r, 5);
	return /* @__PURE__ */ (0, C.jsx)("div", {
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
		children: /* @__PURE__ */ (0, C.jsx)("span", {
			className: "byour-turn__text",
			children: "Your Turn"
		})
	});
}
//#endregion
//#region src/table/hooks/useInactivityHelper.ts
var H_ = 5e3, U_ = 1e3;
function W_(e) {
	return e === "draw" ? "Choose discard and then tap" : e === "play" ? "Tap a card to play" : null;
}
function G_(e) {
	let [t, n] = (0, l.useState)(!1), [r, i] = (0, l.useState)(!0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(e.actionRequired);
	s.current = e.actionRequired;
	let c = W_(e.phase), u = e.actionRequired && c != null && !e.hasUserInteracted;
	return (0, l.useEffect)(() => {
		if (a.current != null && (window.clearTimeout(a.current), a.current = null), n(!1), u) return a.current = window.setTimeout(() => {
			a.current = null, !(!s.current || e.hasUserInteracted) && (n(!0), i(!0));
		}, H_), () => {
			a.current != null && (window.clearTimeout(a.current), a.current = null);
		};
	}, [
		e.activityKey,
		u,
		e.hasUserInteracted
	]), (0, l.useEffect)(() => {
		if (o.current != null && (window.clearInterval(o.current), o.current = null), !t || !u || kd()) {
			i(!0);
			return;
		}
		return o.current = window.setInterval(() => {
			i((e) => !e);
		}, U_), () => {
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
function K_({ actionRequired: e, activityKey: t, phase: n, hasUserInteracted: r }) {
	let { visible: i, text: a, flashOn: o } = G_({
		actionRequired: e,
		activityKey: t,
		phase: n,
		hasUserInteracted: r
	});
	return !i || !a ? null : /* @__PURE__ */ (0, C.jsx)("p", {
		className: ["btable-session__inactivity-helper", o ? "btable-session__inactivity-helper--on" : ""].filter(Boolean).join(" "),
		"data-testid": "inactivity-helper",
		"aria-live": "polite",
		children: a
	});
}
//#endregion
//#region src/table/localAction.ts
function q_(e) {
	let t = e.currentUserId;
	if (!t || e.handComplete) return !1;
	let n = e.selfPlayer, r = Af({
		phase: e.session.phase,
		participantIds: e.session.participantIds,
		playerId: t
	});
	if (!n || !r && n.isOut || n.actionDeclared) return !1;
	let i = If({
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
	let a = zf({
		snapshot: i,
		action: "submit_draw",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn,
		drawCompletedIds: e.session.drawCompletedIds
	});
	if (i.phase === $.DRAW && a.ok) return !0;
	let o = zf({
		snapshot: i,
		action: "play_card",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn
	});
	return !!(i.phase === $.PLAY && o.ok);
}
function J_(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off";
	return [
		e.session.phase ?? "",
		e.session.turnPlayerId ?? "",
		n,
		e.selfPlayer?.actionDeclared ? "declared" : "open",
		e.session.drawCompletedIds?.join(",") ?? "",
		e.suppressTurn ? "1" : "0",
		q_(e) ? "act" : "wait"
	].join("|");
}
//#endregion
//#region src/table/hooks/useTrumpTrickMotionGate.ts
var Y_ = 880;
function X_(e, t, n) {
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
		}, Y_);
		return () => window.clearTimeout(n);
	}, [e, t]), (0, l.useEffect)(() => {
		if (!i || t || n === 0) return;
		let e = window.setTimeout(() => {
			a(!1), r.current = !1;
		}, Y_);
		return () => window.clearTimeout(e);
	}, [
		i,
		t,
		n
	]), i;
}
//#endregion
//#region src/table/trickPresentationMachine.ts
function Z_(e, t) {
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
		peakTrickPlays: wd(t),
		displayRevealFloor: 0
	};
}
function Q_(e, t) {
	if (t.length < e.length) return !1;
	for (let n = 0; n < e.length; n++) if (Gs(e[n]) !== Gs(t[n])) return !1;
	return !0;
}
function $_(e, t, n) {
	let r = t.currentTrick?.trickNumber ?? null, i = e.prevTrick?.trickNumber ?? null, a = r != null && i != null && r !== i ? [] : [...e.peakTrickPlays ?? []];
	for (let t of [
		n,
		wd(e.prevTrick),
		e.peakTrickPlays ?? []
	]) t.length > a.length && Q_(a, t) && (a = t);
	return a;
}
function ev(e, t) {
	return e.phase === "live" ? e : {
		...e,
		pendingServer: t
	};
}
function tv(e) {
	return Math.max(e.pendingResolution?.frozen.plays.length ?? 0, wd(e.prevTrick).length, e.peakTrickPlays?.length ?? 0);
}
function nv(e, t) {
	let n = wd(t.currentTrick), r = wd(e.prevTrick), i = $_(e, t, n), a = e.phase === "live" && !e.pendingResolution && (n.length < e.revealedCount && r.length >= e.revealedCount || n.length < i.length && r.length >= i.length), o = t.currentTrick?.trickNumber ?? null, s = e.prevTrick?.trickNumber ?? null, c = o != null && s != null && o !== s;
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
function rv(e, t, n, r) {
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
function iv(e, t) {
	let n = av(e, t);
	if (Nd()) {
		e.phase !== n.phase && Pd("trick", e.phase, n.phase, {
			trickNumber: n.frozenTrick?.trickNumber,
			winnerId: n.frozenTrick?.winnerId,
			pendingResolution: !!n.pendingResolution
		});
		let r = wd(e.prevTrick).length, i = wd(n.prevTrick).length;
		(e.phase !== n.phase || e.revealedCount !== n.revealedCount || r !== i || !!e.pendingResolution != !!n.pendingResolution || t.type === "serverUpdate") && Q("trickPresentation", t.type, {
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
function av(e, t) {
	switch (t.type) {
		case "reset":
		case "reinit": return Z_(t.type === "reinit" ? t.snapshot.tricksByPlayer : e.displayTricksByPlayer, t.type === "reinit" ? t.snapshot.currentTrick : null);
		case "revealNextCard": {
			if (e.phase !== "live") return e;
			let t = tv(e);
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
			return !t || e.phase !== "live" ? e : rv({
				...e,
				pendingResolution: null
			}, t.frozen, t.snapshot.tricksByPlayer, t.snapshot.currentTrick);
		}
		case "forceHandEndDrain": {
			let t = e;
			if (t.phase === "live" && t.pendingResolution && (t = rv({
				...t,
				pendingResolution: null
			}, t.pendingResolution.frozen, t.pendingResolution.snapshot.tricksByPlayer, t.pendingResolution.snapshot.currentTrick)), t.phase === "live" && !t.pendingResolution) return t;
			let n = t.pendingServer, r = n?.tricksByPlayer ?? {}, i = Object.values(r).some((e) => (e ?? 0) > 0), a = i ? { ...r } : { ...t.displayTricksByPlayer }, o = wd(n?.currentTrick).length;
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
				peakTrickPlays: wd(n?.currentTrick),
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
				let t = e.pendingServer, n = wd(t?.currentTrick).length;
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
					peakTrickPlays: wd(t?.currentTrick),
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
			if (e.phase !== "live") return ev(e, n);
			let i = Od({
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
			} : nv(e, n);
		}
		default: return e;
	}
}
function ov(e, t) {
	let n = e.pendingResolution?.frozen.plays ?? [];
	if (n.length > 0) return n;
	let r = wd(e.prevTrick), i = e.peakTrickPlays ?? [];
	return e.phase === "live" ? i.length > t.length ? i : r.length > t.length ? r : t.length > 0 ? t : r : t.length > 0 ? t : r.length > 0 ? r : i;
}
function sv(e, t) {
	let n = ov(e, wd(t)), r = e.displayRevealFloor, i = n.length >= r ? n : (e.peakTrickPlays?.length ?? 0) >= r ? e.peakTrickPlays : n, a = e.phase === "live" ? e.pendingResolution ? Math.max(e.revealedCount, i.length) : Math.min(e.revealedCount, i.length) : i.length, o = e.phase === "live" && !e.pendingResolution ? Math.max(a, r) : a, s = e.phase === "live" ? i.slice(0, o) : e.frozenTrick?.plays ?? [], c = e.frozenTrick?.plays ?? [], l = e.frozenTrick?.winnerId ?? null, u = e.phase, d = c.length > 0 && s.length === 0 && e.phase !== "live", f = e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null, p = e.showWinnerTag && (e.phase === "winnerReveal" || e.phase === "collectTrick"), m = e.peakTrickPlays?.length ?? 0, h = e.phase === "live" ? tv(e) : e.revealedCount;
	return {
		phase: e.phase,
		displayPlays: s,
		winnerPlayerId: f,
		showWinnerTag: p,
		displayTricksByPlayer: e.displayTricksByPlayer,
		suppressTurnPlayerId: bd(e.phase),
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
function cv({ phase: e, currentTrick: t, tricksByPlayer: n, participantIds: r, trumpSuit: i, playedCards: a, turnPlayerId: o, handComplete: s = !1 }) {
	let [c, u] = (0, l.useReducer)(iv, n, (e) => Z_(e, t)), d = (0, l.useRef)([]), f = (0, l.useRef)(null), p = (0, l.useRef)(/* @__PURE__ */ new Set()), m = (0, l.useRef)(!1), h = (0, l.useRef)(null), g = (0, l.useRef)(0), _ = (0, l.useRef)(!1), v = (0, l.useRef)(c);
	v.current = c;
	let y = c.phase !== "live" || !!c.pendingResolution;
	m.current = y;
	let b = e === "play", x = (e) => {
		for (let t of e) {
			let e = Gs(t);
			p.current.has(e) || (p.current.add(e), tc(t.playerId, e));
		}
	}, S = () => {
		for (let e of d.current) window.clearTimeout(e);
		d.current = [], f.current = null;
	}, C = (e, t) => {
		let n = window.setTimeout(e, t);
		d.current.push(n);
	};
	(0, l.useEffect)(() => () => S(), []), (0, l.useEffect)(() => {
		let c = b && !_.current;
		_.current = b;
		let l = s || e == null && r.length === 0;
		if (c || !b && !m.current && !l) {
			S(), f.current = null, p.current.clear(), ic(), u({
				type: "reinit",
				snapshot: {
					currentTrick: t,
					tricksByPlayer: n,
					playedCards: a
				}
			}), Nd() && Q("useTrickPresentation", c ? "reinit-play-entry" : "reinit-idle", {
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
			reducedMotion: kd()
		}), Nd() && Q("useTrickPresentation", "serverUpdate-effect", {
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
		Qs(r), o && Qs([o]);
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
		let t = c.frozenTrick, n = t.trickNumber === 5, r = xd({
			trumpBeat: Dd(t.plays, t.leadSuit, i),
			finalTrick: n,
			reducedMotion: kd()
		});
		C(() => u({ type: "advancePhase" }), r.readBeforeWinnerMs), C(() => u({ type: "advancePhase" }), r.readTotalMs), C(() => u({ type: "advancePhase" }), r.readTotalMs + r.sweepMs), C(() => u({ type: "advancePhase" }), r.pipelineMs);
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
		let t = kd() ? 308 : 560, n = window.setTimeout(() => u({ type: "commitTrickResolution" }), t);
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
		if (!b && !y || c.phase === "live") return;
		let e = yd, t = window.setTimeout(() => {
			let e = v.current;
			e.phase !== "live" && (Nd() && Q("useTrickPresentation", "pipeline-stuck-force-advance", {
				phase: e.phase,
				pendingResolution: !!e.pendingResolution
			}), u({ type: "advancePhase" }));
		}, e);
		return () => window.clearTimeout(t);
	}, [
		b,
		y,
		c.phase,
		c.pendingResolution
	]), (0, l.useEffect)(() => {
		if (!b && !y || c.phase !== "live" || !c.pendingResolution) return;
		let e = c.pendingResolution.frozen.plays.length;
		if (c.revealedCount >= e) return;
		let t = window.setTimeout(() => {
			let e = v.current;
			e.phase !== "live" || !e.pendingResolution || e.revealedCount >= e.pendingResolution.frozen.plays.length || (Nd() && Q("useTrickPresentation", "pending-resolution-reveal-catchup", {
				revealedCount: e.revealedCount,
				target: e.pendingResolution.frozen.plays.length
			}), u({ type: "revealNextCard" }));
		}, yd);
		return () => window.clearTimeout(t);
	}, [
		b,
		y,
		c.phase,
		c.pendingResolution,
		c.revealedCount
	]), (0, l.useEffect)(() => {
		let t = s || e == null && r.length === 0;
		if (!y || !t || b && !s) return;
		let n = [];
		return Nd() && Q("useTrickPresentation", "hand-end-drain-armed", {
			phase: c.phase,
			pendingResolution: !!c.pendingResolution,
			trickNumber: c.frozenTrick?.trickNumber ?? c.pendingResolution?.frozen.trickNumber
		}), ((e, t) => {
			n.push(window.setTimeout(e, t));
		})(() => {
			let e = v.current;
			e.phase === "live" && !e.pendingResolution || (Nd() && Q("useTrickPresentation", "hand-end-drain-force", {
				phase: e.phase,
				pendingResolution: !!e.pendingResolution
			}), u({ type: "forceHandEndDrain" }));
		}, vd), () => {
			for (let e of n) window.clearTimeout(e);
		};
	}, [
		b,
		y,
		c.phase,
		c.pendingResolution,
		c.frozenTrick,
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
		let e = kd() ? 369 : 670;
		h.current = window.setTimeout(() => {
			h.current = null, Nd() && Q("useTrickPresentation", "revealNextCard-timer", {
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
		...sv(c, t),
		forceHandEndDrain: () => u({ type: "forceHandEndDrain" })
	};
}
//#endregion
//#region src/table/TrickPresentationSync.tsx
function lv(e) {
	let t = cv(e), n = (0, l.useRef)(t.forceHandEndDrain);
	return n.current = t.forceHandEndDrain, (0, l.useLayoutEffect)(() => {
		$d({
			...t,
			forceHandEndDrain: () => n.current()
		});
	}), (0, l.useEffect)(() => () => nf(), []), null;
}
//#endregion
//#region src/table/SettlementCoWinPanel.tsx
function uv({ session: e, players: t, potMetrics: n, splitSharePerWinner: r, currentUserId: i, isCoWinner: a, onSettle: o }) {
	let s = Kh({
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
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		className: "btable-session__settle",
		"data-testid": "settlement-panel",
		role: "region",
		"aria-label": "Co-winner settlement vote",
		children: [
			/* @__PURE__ */ (0, C.jsx)("h6", {
				className: "btable-session__settle-title",
				"data-testid": "settlement-headline",
				children: s.headline
			}),
			/* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-session__settle-sub",
				"data-testid": "settlement-subhead",
				children: s.subhead
			}),
			/* @__PURE__ */ (0, C.jsx)("ul", {
				className: "btable-session__settle-list",
				"data-testid": "settlement-winners",
				children: s.winnerLines.map((e) => /* @__PURE__ */ (0, C.jsx)("li", { children: e }, e))
			}),
			s.bourreLine && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-session__settle-bourre",
				"data-testid": "settlement-bourre",
				children: s.bourreLine
			}),
			/* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-session__settle-pot",
				"data-testid": "settlement-pot",
				children: s.potLine
			}),
			s.splitPreviewLine && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-session__split-preview",
				"data-testid": "settlement-split-preview",
				children: s.splitPreviewLine
			}),
			/* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-session__settle-carry muted small",
				"data-testid": "settlement-carry-push",
				children: s.carryoverIfPushLine
			}),
			s.carryoverIfSplitLine && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-session__settle-carry muted small",
				"data-testid": "settlement-carry-split",
				children: s.carryoverIfSplitLine
			}),
			/* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-session__settle-rules muted small",
				"data-testid": "settlement-rules",
				children: s.rulesLine
			}),
			/* @__PURE__ */ (0, C.jsx)("ul", {
				className: "btable-session__settle-votes",
				"data-testid": "settlement-votes",
				children: s.voteLines.map((e) => /* @__PURE__ */ (0, C.jsx)("li", { children: e }, e))
			}),
			s.voterHint && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-session__settle-hint",
				"data-testid": "settlement-voter-hint",
				children: s.voterHint
			}),
			s.observerHint && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-session__settle-hint muted small",
				"data-testid": "settlement-observer-hint",
				children: s.observerHint
			}),
			/* @__PURE__ */ (0, C.jsxs)("div", {
				className: "btable-session__settle-btns",
				children: [/* @__PURE__ */ (0, C.jsx)("button", {
					type: "button",
					className: "btn btn--sm",
					disabled: !a,
					"data-testid": "settlement-decline-btn",
					onClick: () => o("push"),
					children: "Decline split · push pot"
				}), /* @__PURE__ */ (0, C.jsxs)("button", {
					type: "button",
					className: "btn btn--sm btn--primary",
					disabled: !a,
					"data-testid": "settlement-agree-btn",
					onClick: () => o("split"),
					children: [
						"Agree to split · ",
						ed(r),
						" each"
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/table/SplitPotDecisionToast.tsx
var dv = 3e3;
function fv(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function pv({ session: e, players: t, splitSharePerWinner: n, currentUserId: r, isCoWinner: i, onAgreeSplit: a, onDeclineSplit: o, onCarryover: s }) {
	let c = e.pendingCoWinSettlement?.winnerIds ?? [], u = e.pendingCoWinSettlement?.votes ?? {}, [d, f] = (0, l.useState)(dv), [p, m] = (0, l.useState)(!1), h = (0, l.useRef)(null), g = (0, l.useRef)(!1), _ = (0, l.useMemo)(() => `${c.join(",")}:${e.handNumber ?? 0}`, [c, e.handNumber]);
	(0, l.useEffect)(() => {
		h.current = Date.now(), g.current = !1, f(dv), m(!1);
	}, [_]);
	let v = c.length >= 2 && c.every((e) => u[e] === "split"), y = (0, l.useCallback)(() => {
		g.current || (g.current = !0, s());
	}, [s]);
	if ((0, l.useEffect)(() => {
		if (c.length < 2) return;
		let e = window.setInterval(() => {
			let e = h.current ?? Date.now(), t = Date.now() - e, n = Math.max(0, dv - t);
			f(n), n <= 0 && !v && y();
		}, 100);
		return () => window.clearInterval(e);
	}, [
		c.length,
		v,
		y,
		_
	]), (0, l.useEffect)(() => {
		v && (g.current = !0);
	}, [v]), c.length < 2) return null;
	let b = Math.max(0, Math.ceil(d / 1e3)), x = c.map((e) => fv(e, t)).join(" & "), S = (e) => {
		!i || g.current || (m(e), e ? a() : o());
	};
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		className: "btable-split-toast",
		"data-testid": "split-pot-toast",
		role: "dialog",
		"aria-label": "Split pot decision",
		"aria-live": "polite",
		children: [
			/* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-split-toast__title",
				children: "Tie — split the pot?"
			}),
			/* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-split-toast__names",
				children: x
			}),
			/* @__PURE__ */ (0, C.jsxs)("p", {
				className: "btable-split-toast__share muted small",
				children: [ed(n), " each if all agree"]
			}),
			i ? /* @__PURE__ */ (0, C.jsxs)("label", {
				className: "btable-split-toast__choice",
				children: [/* @__PURE__ */ (0, C.jsx)("input", {
					type: "checkbox",
					checked: p || u[r ?? ""] === "split",
					onChange: (e) => S(e.target.checked),
					"data-testid": "split-pot-agree"
				}), /* @__PURE__ */ (0, C.jsx)("span", { children: "Yes — split pot" })]
			}) : /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-split-toast__wait muted small",
				children: "Waiting for tied leaders…"
			}),
			/* @__PURE__ */ (0, C.jsxs)("p", {
				className: "btable-split-toast__timer muted small",
				"data-testid": "split-pot-timer",
				children: [b, "s — carryover if not all agree"]
			})
		]
	});
}
//#endregion
//#region src/table/heroHandDisplay.ts
function mv(e, t) {
	return [...e];
}
function hv(e, t) {
	return [...e].sort((e, t) => e - t);
}
function gv(e) {
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
	let { trumpMergeActive: i, trumpMergedIntoHand: a } = e.handPresentation, o = vm({
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
var _v = [], vv = [], yv = [];
function bv({ session: e, players: t, potMetrics: n, mySessionNet: r, leaderLabel: i, showCoWinSettlement: a, splitPotEnabled: o = !1, rebuyEnabled: s = !1, splitSharePerWinner: c = 0, enrollmentActive: u = !1, currentUserId: d, heroCards: f = vv, rawHeroCards: p = vv, privateHandReady: m = !1, legalPlayIndices: h, recentBourreIds: g = yv, handComplete: _ = !1, actionFeedback: v, actions: y }) {
	let { settings: b } = Ou(), x = Wm(), [S, w] = (0, l.useState)(!1), T = e.participantIds.length, { events: E, dismissEvent: D, pushReaction: O } = o_({
		session: e,
		potMetrics: n,
		participantIds: e.participantIds
	}), k = (0, l.useMemo)(() => [...E].reverse().find((e) => e.kind === "big-pot") ?? null, [E]), A = d != null && (e.pendingCoWinSettlement?.winnerIds || []).includes(d), j = (0, l.useMemo)(() => ({
		phase: e.phase,
		currentTrick: e.currentTrick,
		tricksByPlayer: e.tricksByPlayer,
		participantIds: e.participantIds,
		trumpSuit: e.trumpSuit,
		playedCards: e.playedCards,
		turnPlayerId: e.turnPlayerId,
		handComplete: _
	}), [
		e.phase,
		e.currentTrick,
		e.tricksByPlayer,
		e.participantIds,
		e.trumpSuit,
		e.playedCards,
		e.turnPlayerId,
		_
	]), M = qd(ef, tf, pf, mf), ee = M.forceHandEndDrain, te = (0, l.useRef)(null), ne = (0, l.useCallback)(() => {
		te.current?.notifyDealPresentationComplete();
	}, []), N = u_({
		session: e,
		enrollmentActive: u,
		potAmount: n.currentPot,
		handComplete: _,
		trickPipelineActive: M.isPipelineActive,
		forceTrickHandEndDrain: ee,
		heroCards: f,
		enrolledIds: e.handEnrollment?.enrolledIds ?? _v,
		declinedIds: e.handEnrollment?.declinedIds ?? _v,
		actionOrder: e.actionOrder ?? e.handEnrollment?.orderedPlayerIds ?? e.participantIds,
		presentationApiRef: te
	}), P = X_(e.phase, e.trumpUpcard, M.displayPlaysLength), re = S_(N.isPresenting, N.phase, e.phase), ie = (0, l.useMemo)(() => ({
		pipelineActive: M.isPipelineActive,
		revealCatchUp: M.phase === "live" && M.revealedCount < M.revealTarget,
		motionGateActive: P,
		peakPlayCount: M.peakPlayCount,
		displayedPlayCount: M.displayPlaysLength,
		handPresenting: re,
		handPresentationPhase: N.phase
	}), [
		M.isPipelineActive,
		M.phase,
		M.revealedCount,
		M.revealTarget,
		M.peakPlayCount,
		M.displayPlaysLength,
		P,
		re,
		N.phase
	]), F = zs(e.phase), I = (0, l.useMemo)(() => vm({
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
	]), L = (0, l.useMemo)(() => gv({
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
	]), R = L.displayCards, z = (0, l.useMemo)(() => !h?.length || L.indexMode === "effective" ? h : mv(h, L.trumpDisabledIndex), [
		h,
		L.indexMode,
		L.trumpDisabledIndex
	]), B = (0, l.useMemo)(() => {
		if (!h?.length || !f.length) return null;
		let t = Lc(f.map(Ps), {
			trumpSuit: e.trumpSuit ?? "clubs",
			currentTrick: e.currentTrick ?? null,
			leadSuit: e.leadSuit ?? null,
			cinchEnabled: e.cinchEnabled === !0
		}, h);
		return t == null ? null : L.indexMode === "effective" ? t : mv([t], L.trumpDisabledIndex)[0] ?? null;
	}, [
		h,
		f,
		e.trumpSuit,
		e.currentTrick,
		e.leadSuit,
		e.cinchEnabled,
		L.indexMode,
		L.trumpDisabledIndex
	]), ae = (0, l.useMemo)(() => {
		if (e.phase !== "draw" || !f.length) return [];
		let t = f.map(Ps), n = L.indexMode === "display" && L.trumpDisabledIndex != null ? hv([L.trumpDisabledIndex], L.trumpDisabledIndex) : L.trumpDisabledIndex == null ? [] : [L.trumpDisabledIndex], r = Rc(t, e.trumpSuit ?? "clubs", e.maxDrawDiscards ?? 4, e.remainingDeckCount ?? Infinity, n);
		return L.indexMode === "effective" ? r : mv(r, L.trumpDisabledIndex);
	}, [
		e.phase,
		f,
		e.trumpSuit,
		e.maxDrawDiscards,
		e.remainingDeckCount,
		L.indexMode,
		L.trumpDisabledIndex
	]), V = gm({
		trickSuppressTurn: M.suppressTurnPlayerId,
		handSuppressTurn: N.suppressTurnIndicator,
		trickPipelineActive: M.isPipelineActive,
		trickPhase: M.phase,
		revealedCount: M.revealedCount,
		revealTarget: M.revealTarget
	}), oe = hm({
		trickSuppressTurn: M.suppressTurnPlayerId,
		trickPipelineActive: M.isPipelineActive
	}), se = Fs(e.phase, u), H = V ? null : Hs(e.turnPlayerId, t), ce = t.find((e) => e.isSelf), le = d != null && e.participantIds.includes(d) && (e.phase === "draw" || e.phase === "play"), ue = s && !e.isFinal && !le && !a && ce?.isOut === !0 && !!y.onRebuy, de = !!(d && e.turnPlayerId === d) && !V, fe = q_({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: ce,
		session: e,
		suppressTurn: !!V,
		handComplete: _
	}), pe = fe && !_ && (u || e.phase === "decision") ? Is(e.phase, u) : null, me = !pe && !V && !(H && F && M.phase === "live") ? Ls({
		phase: e.phase,
		enrollmentActive: u,
		isMyTurn: de,
		handComplete: _,
		cardsDealt: F
	}) : null, he = J_({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: ce,
		session: e,
		suppressTurn: !!V,
		handComplete: _
	}), [ge, _e] = (0, l.useState)(!1);
	(0, l.useEffect)(() => {
		_e(!1);
	}, [he]);
	let ve = (0, l.useCallback)(() => {
		_e(!0);
	}, []), ye = fe && !_ && !ge && (e.phase === "draw" || e.phase === "play"), be = (0, l.useMemo)(() => ({
		session: {
			phase: e.phase,
			turnPlayerId: e.turnPlayerId,
			drawCompletedIds: e.drawCompletedIds,
			handEnrollment: e.handEnrollment,
			handDecision: e.handDecision,
			participantIds: e.participantIds,
			tricksByPlayer: e.tricksByPlayer,
			handNumber: e.handNumber,
			pendingCoWinSettlement: e.pendingCoWinSettlement
		},
		suppressTurn: !!oe,
		handComplete: _
	}), [
		e.phase,
		e.turnPlayerId,
		e.drawCompletedIds,
		e.handEnrollment,
		e.handDecision,
		e.participantIds,
		e.tricksByPlayer,
		e.handNumber,
		e.pendingCoWinSettlement,
		oe,
		_
	]), xe = I.showTrumpSuitReminder || !e.trumpUpcard && !!e.trumpSuit && e.phase === "play", Se = (0, l.useMemo)(() => ({ ...M.displayTricksByPlayer }), [M.displayTricksByPlayer]), Ce = (0, l.useMemo)(() => Object.fromEntries(t.map((e) => [e.playerId, Math.max(0, Number(e.bankroll) || 0)])), [t]), we = F_({
		turnPlayerId: e.turnPlayerId ?? null,
		dealerId: e.dealerId,
		potAmount: N.displayPotAmount,
		tricksByPlayer: Se,
		bankrollByPlayer: Ce,
		bourrePlayerIds: g ?? [],
		phase: e.phase ?? null,
		showTrumpSuitReminder: xe,
		suppressTurn: !!V,
		actionFeedbackStatus: v?.status ?? "idle",
		trickWinnerSeatId: M.trickWinnerSeatId,
		trickPhase: M.phase
	}), Te = !!ce?.playerId && N.settleBourreIds.includes(ce.playerId) && N.showBourreCallout, Ee = !!ce?.playerId && (g ?? []).includes(ce.playerId) && we.bourreAlerts[ce.playerId] === "pulse" && N.phase !== "settle", De = Te || Ee, Oe = (0, l.useRef)(0), ke = (0, l.useRef)(0);
	(0, l.useEffect)(() => {
		we.feedbackErrorPulse > Oe.current && du(), Oe.current = we.feedbackErrorPulse;
	}, [we.feedbackErrorPulse]), (0, l.useEffect)(() => {
		we.feedbackSuccessPulse > ke.current && fu(), ke.current = we.feedbackSuccessPulse;
	}, [we.feedbackSuccessPulse]);
	let Ae = (0, l.useCallback)((e) => {
		O(e, d ?? void 0);
	}, [O, d]), U = (0, l.useMemo)(() => ({
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
			let t = L.indexMode === "display" ? hv(e, L.trumpDisabledIndex) : e;
			return y.onSubmitDraw(t);
		},
		onPassDraw: y.onPassDraw,
		onFoldDraw: y.onFoldDraw,
		onPlayCard: (e) => {
			if (!y.onPlayCard) return;
			if (L.indexMode !== "display") return y.onPlayCard(e);
			let t = hv([e], L.trumpDisabledIndex)[0];
			if (t != null) return y.onPlayCard(t);
		},
		onReaction: Ae,
		onHeroUserActivity: ve
	}), [
		y,
		Ae,
		t,
		L.indexMode,
		L.trumpDisabledIndex,
		ve
	]), je = (0, l.useMemo)(() => ({
		session: e,
		players: t,
		potMetrics: n,
		participantCount: T,
		enrollmentActive: u,
		heroCards: R,
		revealedTrumpIndex: L.revealedTrumpIndex,
		trumpMergeActive: L.trumpMergeActive,
		trumpDisabledIndex: L.trumpDisabledIndex,
		hideCenterTrump: I.hideCenterTrump,
		showTrumpSuitReminder: xe,
		trumpHolderPresentation: I,
		privateHandReady: m,
		currentUserId: d,
		legalPlayIndices: z,
		recommendedPlayIndex: B,
		recommendedDiscardIndices: ae,
		handComplete: _,
		actionFeedback: v,
		handPresentation: N,
		microinteractions: we,
		onDealPresentationComplete: ne,
		presentationApiRef: te,
		instantTrickPlays: P,
		bigPotEvent: k,
		onDismissTableEvent: D,
		...U
	}), [
		e,
		t,
		n,
		T,
		u,
		R,
		L.revealedTrumpIndex,
		L.trumpMergeActive,
		L.trumpDisabledIndex,
		I,
		xe,
		m,
		d,
		z,
		B,
		ae,
		_,
		v,
		N,
		we,
		ne,
		te,
		P,
		k,
		D,
		U
	]), Me = /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
		/* @__PURE__ */ (0, C.jsx)(lv, { ...j }),
		/* @__PURE__ */ (0, C.jsx)(P_, { input: ie }),
		/* @__PURE__ */ (0, C.jsx)(d_, { input: be }),
		/* @__PURE__ */ (0, C.jsx)("div", {
			className: "btable-session__attention-layer",
			"aria-live": "polite",
			children: /* @__PURE__ */ (0, C.jsx)(V_, {
				actionRequired: fe,
				activityKey: he
			})
		}),
		/* @__PURE__ */ (0, C.jsx)(I_, {
			active: De,
			displayName: ce?.displayName
		}),
		/* @__PURE__ */ (0, C.jsx)(e_, {
			events: E,
			onDismiss: D
		}),
		/* @__PURE__ */ (0, C.jsx)(Zg, {
			events: E,
			onDismiss: D
		}),
		x ? /* @__PURE__ */ (0, C.jsx)(Yg, { ...je }) : /* @__PURE__ */ (0, C.jsx)(Hg, { ...je })
	] }), Ne = N.phase === "drawPlayer" && (N.trumpMergedIntoHand || !e.trumpUpcard);
	return (0, l.useEffect)(() => {
		if (e.phase !== "reveal" || !Ne || !y.onAdvanceReveal) return;
		let t = !1, n = () => {
			t || y.onAdvanceReveal?.();
		};
		n();
		let r = window.setInterval(n, 2500);
		return () => {
			t = !0, window.clearInterval(r);
		};
	}, [
		e.phase,
		e.handNumber,
		e.sessionId,
		e.trumpUpcard,
		Ne,
		y
	]), (0, l.useEffect)(() => {
		let e = (e) => {
			(e.key === b.hotkeys.toggleSettings || e.key === "," && e.metaKey) && w((e) => !e), e.key === b.hotkeys.focusTable && document.querySelector(".btable-wrap")?.scrollIntoView({
				block: "center",
				behavior: "smooth"
			});
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [b.hotkeys]), /* @__PURE__ */ (0, C.jsxs)("div", {
		className: [
			"btable-session",
			x ? "btable-session--native-mobile btable-session--mobile-layout" : "",
			S ? "btable-session--settings-open" : "",
			Vs(e.phase) ? "btable-session--reveal-phase" : "",
			Bs(e.phase) ? "btable-session--decision-phase" : ""
		].filter(Boolean).join(" "),
		"data-trick-resolving": M.isPipelineActive ? "true" : "false",
		"data-hand-settling": N.settleAnimActive ? "true" : "false",
		"data-hand-complete": _ ? "true" : "false",
		children: [
			v && v.status !== "idle" && /* @__PURE__ */ (0, C.jsx)("div", {
				className: [
					`btable-session__feedback btable-session__feedback--${v.status}`,
					v.status === "error" ? "btable-session__feedback--pulse-error" : "",
					v.status === "success" ? "btable-session__feedback--pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "feedback-banner",
				role: v.status === "error" ? "alert" : "status",
				"aria-live": "polite",
				children: v.message
			}, v.status === "error" ? `feedback-error-${we.feedbackErrorPulse}` : v.status === "success" ? `feedback-success-${we.feedbackSuccessPulse}` : `feedback-${v.status}`),
			/* @__PURE__ */ (0, C.jsxs)("header", {
				className: "btable-session__head",
				children: [
					/* @__PURE__ */ (0, C.jsxs)("div", {
						className: "btable-session__head-row",
						children: [
							/* @__PURE__ */ (0, C.jsxs)("h5", {
								className: "btable-session__title",
								children: ["Hand #", e.handNumber]
							}),
							/* @__PURE__ */ (0, C.jsx)("span", {
								className: `btable-session__phase-tag btable-session__phase-tag--${e.phase ?? "waiting"}`,
								"data-testid": "phase-tag",
								"data-phase": e.phase ?? "waiting",
								children: se
							}),
							/* @__PURE__ */ (0, C.jsx)("button", {
								type: "button",
								className: "btable-session__gear btn btn--sm",
								"data-testid": "settings-button",
								onClick: () => w(!0),
								"aria-label": "Table appearance settings",
								title: `Settings (${b.hotkeys.toggleSettings})`,
								children: "⚙"
							})
						]
					}),
					/* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__status",
						children: i
					}),
					N.trumpRevealActive && e.phase === "draw" && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Trump revealed — settling into your hand"
					}),
					N.trumpMergeActive && e.phase === "draw" && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Trump joining your hand…"
					}),
					N.phase === "drawReady" && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Draw complete — first lead coming up"
					}),
					/* @__PURE__ */ (0, C.jsxs)("div", {
						className: "btable-session__turn-stack",
						"aria-live": "polite",
						children: [
							N.settleAnimActive && /* @__PURE__ */ (0, C.jsx)("p", {
								className: "btable-session__turn btable-session__turn--settle muted small",
								children: "Settling the pot…"
							}),
							/* @__PURE__ */ (0, C.jsx)("p", {
								className: "btable-session__turn btable-session__turn--trick-resolve muted small",
								children: "Trick won — cards collecting before the next lead"
							}),
							N.settleAnimActive && /* @__PURE__ */ (0, C.jsx)("p", {
								className: "btable-session__turn btable-session__turn--final-trick muted small",
								children: "Final trick — cards collecting before the pot settles"
							})
						]
					}),
					H && F && M.phase === "live" && /* @__PURE__ */ (0, C.jsx)("p", {
						className: ["btable-session__turn", de ? "btable-session__turn--yours" : "btable-session__turn--waiting"].join(" "),
						"aria-live": "polite",
						"data-testid": "turn-indicator",
						children: H
					}),
					pe && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__action-cue",
						"data-testid": "action-cue",
						"aria-live": "polite",
						children: pe
					}),
					/* @__PURE__ */ (0, C.jsx)(K_, {
						actionRequired: ye,
						activityKey: he,
						phase: e.phase,
						hasUserInteracted: ge
					}),
					me && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__hint btable-session__hint--waiting",
						"data-testid": "waiting-cue",
						children: me
					}),
					Vs(e.phase) && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__hint muted small",
						"aria-live": "polite",
						children: "Cards dealt — trump revealed. Review your hand…"
					}),
					u && !Vs(e.phase) && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__enroll muted small",
						children: "Tap I'm in or Pass at your seat — clockwise from dealer"
					})
				]
			}),
			!x && /* @__PURE__ */ (0, C.jsxs)("p", {
				className: "btable-session__rotate-hint",
				role: "note",
				children: [
					"Rotate your phone to ",
					/* @__PURE__ */ (0, C.jsx)("strong", { children: "landscape" }),
					" for the full table (up to 8 players)."
				]
			}),
			x ? /* @__PURE__ */ (0, C.jsx)($g, { children: /* @__PURE__ */ (0, C.jsx)("div", {
				className: "btable-stage",
				children: Me
			}) }) : /* @__PURE__ */ (0, C.jsx)(Qg, { children: /* @__PURE__ */ (0, C.jsx)("div", {
				className: "btable-stage",
				children: Me
			}) }),
			/* @__PURE__ */ (0, C.jsx)(n_, {
				open: S,
				onClose: () => w(!1)
			}),
			a && !e.isFinal && o && /* @__PURE__ */ (0, C.jsx)(pv, {
				session: e,
				players: t,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: A,
				onAgreeSplit: () => y.onSettle("split"),
				onDeclineSplit: () => y.onSettle("push"),
				onCarryover: () => y.onSettleCarryover?.()
			}),
			a && !e.isFinal && !o && /* @__PURE__ */ (0, C.jsx)(uv, {
				session: e,
				players: t,
				potMetrics: n,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: A,
				onSettle: (e) => y.onSettle(e)
			}),
			/* @__PURE__ */ (0, C.jsxs)("footer", {
				className: "btable-session__foot muted small",
				children: [
					/* @__PURE__ */ (0, C.jsx)(t_, { compact: !0 }),
					ue && /* @__PURE__ */ (0, C.jsxs)("div", {
						className: "btable-session__rebuy-offer",
						children: [/* @__PURE__ */ (0, C.jsx)("p", {
							className: "btable-session__rebuy-copy",
							children: "You're out — rebuy to join the next hand."
						}), /* @__PURE__ */ (0, C.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--primary",
							"data-testid": "rebuy-button",
							onClick: () => void y.onRebuy?.(),
							children: "Rebuy"
						})]
					}),
					r == null ? /* @__PURE__ */ (0, C.jsx)(C.Fragment, { children: "Shared pot and game state only · sign in to track your ledger" }) : /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: ["Your session profit/loss ", nd(r)] })
				]
			})
		]
	});
}
//#endregion
//#region src/table/mount.tsx
var xv = null, Sv = null;
function Cv(e, t) {
	iu(), qo(e), Sv !== e && (xv?.unmount(), xv = (0, u.createRoot)(e), Sv = e), xv.render(/* @__PURE__ */ (0, C.jsx)(Du, { children: /* @__PURE__ */ (0, C.jsx)(bv, { ...t }) }));
}
function wv() {
	Sv && (Ch(Sv), Qm(Sv)), xv?.unmount(), xv = null, Sv = null, D_(), Hm(), rp();
}
//#endregion
export { Qm as clearDrawFlyGhosts, Ch as clearWonTrickCollectionArtifacts, w_ as evaluateBotPresentationGate, C_ as forceReleasePresentationForBots, Xc as getFeedbackPrefs, b_ as getTablePresentationBlockReason, O_ as getTrickAnimationBusyState, S_ as handPresentingBlocksBots, iu as initGameFeedback, ip as isBotThinkClockBlocking, A_ as isTablePresentationBusy, T_ as isTablePresentationBusyForBots, k_ as isTrickAnimationBusy, Cv as mountTableSession, cu as playBigWinFeedback, lu as playBourreFeedback, ou as playDrawFeedback, uu as playGameStartFeedback, au as playShuffleFeedback, su as playTrickWinFeedback, Zc as saveFeedbackPrefs, el as subscribeFeedbackPrefs, j_ as subscribeTrickAnimationBusy, wv as unmountTableSession };
