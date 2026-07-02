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
	function N(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ee(e, r, "", "", function(e) {
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
		map: N,
		forEach: function(e, t, n) {
			N(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return N(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return N(e, function(e) {
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
	var ee = Symbol.for("react.client.reference");
	function N(e) {
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
			case D: return t = e.displayName || null, t === null ? N(e.type) || "Memo" : t;
			case O:
				t = e._payload, e = e._init;
				try {
					return N(e(t));
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
	var V = R(null), re = R(null), ie = R(null), ae = R(null);
	function H(e, t) {
		switch (B(ie, t), B(re, e), B(V, null), t.nodeType) {
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
		z(V), B(V, e);
	}
	function oe() {
		z(V), z(re), z(ie);
	}
	function U(e) {
		e.memoizedState !== null && B(ae, e);
		var t = V.current, n = Hd(t, e.type);
		t !== n && (B(re, e), B(V, n));
	}
	function se(e) {
		re.current === e && (z(V), z(re)), ae.current === e && (z(ae), Qf._currentValue = I);
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
	function me(e) {
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
	var he = Object.prototype.hasOwnProperty, ge = t.unstable_scheduleCallback, _e = t.unstable_cancelCallback, ve = t.unstable_shouldYield, ye = t.unstable_requestPaint, be = t.unstable_now, xe = t.unstable_getCurrentPriorityLevel, Se = t.unstable_ImmediatePriority, Ce = t.unstable_UserBlockingPriority, we = t.unstable_NormalPriority, Te = t.unstable_LowPriority, Ee = t.unstable_IdlePriority, De = t.log, Oe = t.unstable_setDisableYieldValue, ke = null, W = null;
	function Ae(e) {
		if (typeof De == "function" && Oe(e), W && typeof W.setStrictMode == "function") try {
			W.setStrictMode(ke, e);
		} catch {}
	}
	var je = Math.clz32 ? Math.clz32 : Pe, Me = Math.log, Ne = Math.LN2;
	function Pe(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Me(e) / Ne | 0) | 0;
	}
	var Fe = 256, Ie = 262144, Le = 4194304;
	function Re(e) {
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
	function ze(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = Re(n))) : i = Re(o) : i = Re(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = Re(n))) : i = Re(o)) : i = Re(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function Be(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function Ve(e, t) {
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
	function He() {
		var e = Le;
		return Le <<= 1, !(Le & 62914560) && (Le = 4194304), e;
	}
	function Ue(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function We(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function Ge(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - je(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && Ke(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function Ke(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - je(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function qe(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - je(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function Je(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : Ye(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function Ye(e) {
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
	function Xe(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function Ze() {
		var e = F.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : mp(e.type)) : e;
	}
	function Qe(e, t) {
		var n = F.p;
		try {
			return F.p = e, t();
		} finally {
			F.p = n;
		}
	}
	var $e = Math.random().toString(36).slice(2), et = "__reactFiber$" + $e, tt = "__reactProps$" + $e, nt = "__reactContainer$" + $e, rt = "__reactEvents$" + $e, it = "__reactListeners$" + $e, at = "__reactHandles$" + $e, ot = "__reactResources$" + $e, st = "__reactMarker$" + $e;
	function ct(e) {
		delete e[et], delete e[tt], delete e[rt], delete e[it], delete e[at];
	}
	function lt(e) {
		var t = e[et];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[nt] || n[et]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = df(e); e !== null;) {
					if (n = e[et]) return n;
					e = df(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function ut(e) {
		if (e = e[et] || e[nt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function dt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(s(33));
	}
	function ft(e) {
		var t = e[ot];
		return t ||= e[ot] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function pt(e) {
		e[st] = !0;
	}
	var mt = /* @__PURE__ */ new Set(), ht = {};
	function gt(e, t) {
		_t(e, t), _t(e + "Capture", t);
	}
	function _t(e, t) {
		for (ht[e] = t, e = 0; e < t.length; e++) mt.add(t[e]);
	}
	var vt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), yt = {}, bt = {};
	function xt(e) {
		return he.call(bt, e) ? !0 : he.call(yt, e) ? !1 : vt.test(e) ? bt[e] = !0 : (yt[e] = !0, !1);
	}
	function St(e, t, n) {
		if (xt(t)) if (n === null) e.removeAttribute(t);
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
	function Ct(e, t, n) {
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
	function wt(e, t, n, r) {
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
	function Tt(e) {
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
	function Et(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function Dt(e, t, n) {
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
	function Ot(e) {
		if (!e._valueTracker) {
			var t = Et(e) ? "checked" : "value";
			e._valueTracker = Dt(e, t, "" + e[t]);
		}
	}
	function kt(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = Et(e) ? e.checked ? "true" : "false" : e.value), e = r, e === n ? !1 : (t.setValue(e), !0);
	}
	function At(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	var jt = /[\n"\\]/g;
	function Mt(e) {
		return e.replace(jt, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function Nt(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Tt(t)) : e.value !== "" + Tt(t) && (e.value = "" + Tt(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : Ft(e, o, Tt(n)) : Ft(e, o, Tt(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + Tt(s) : e.removeAttribute("name");
	}
	function Pt(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				Ot(e);
				return;
			}
			n = n == null ? "" : "" + Tt(n), t = t == null ? n : "" + Tt(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), Ot(e);
	}
	function Ft(e, t, n) {
		t === "number" && At(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
	}
	function It(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + Tt(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function Lt(e, t, n) {
		if (t != null && (t = "" + Tt(t), t !== e.value && (e.value = t), n == null)) {
			e.defaultValue !== t && (e.defaultValue = t);
			return;
		}
		e.defaultValue = n == null ? "" : "" + Tt(n);
	}
	function Rt(e, t, n, r) {
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
		n = Tt(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), Ot(e);
	}
	function zt(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Bt = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function Vt(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || Bt.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function Ht(e, t, n) {
		if (t != null && typeof t != "object") throw Error(s(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
			for (var i in t) r = t[i], t.hasOwnProperty(i) && n[i] !== r && Vt(e, i, r);
		} else for (var a in t) t.hasOwnProperty(a) && Vt(e, a, t[a]);
	}
	function Ut(e) {
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
	var Wt = new Map([
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
	]), Gt = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function Kt(e) {
		return Gt.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function qt() {}
	var Jt = null;
	function Yt(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var Xt = null, Zt = null;
	function Qt(e) {
		var t = ut(e);
		if (t && (e = t.stateNode)) {
			var n = e[tt] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (Nt(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + Mt("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var i = r[tt] || null;
								if (!i) throw Error(s(90));
								Nt(r, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && kt(r);
					}
					break a;
				case "textarea":
					Lt(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && It(e, !!n.multiple, t, !1);
			}
		}
	}
	var $t = !1;
	function en(e, t, n) {
		if ($t) return e(t, n);
		$t = !0;
		try {
			return e(t);
		} finally {
			if ($t = !1, (Xt !== null || Zt !== null) && (yu(), Xt && (t = Xt, e = Zt, Zt = Xt = null, Qt(t), e))) for (t = 0; t < e.length; t++) Qt(e[t]);
		}
	}
	function tn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[tt] || null;
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
	var nn = !(typeof window > "u" || window.document === void 0 || window.document.createElement === void 0), rn = !1;
	if (nn) try {
		var an = {};
		Object.defineProperty(an, "passive", { get: function() {
			rn = !0;
		} }), window.addEventListener("test", an, an), window.removeEventListener("test", an, an);
	} catch {
		rn = !1;
	}
	var on = null, sn = null, cn = null;
	function ln() {
		if (cn) return cn;
		var e, t = sn, n = t.length, r, i = "value" in on ? on.value : on.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return cn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function un(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function dn() {
		return !0;
	}
	function fn() {
		return !1;
	}
	function pn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? dn : fn, this.isPropagationStopped = fn, this;
		}
		return h(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = dn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = dn);
			},
			persist: function() {},
			isPersistent: dn
		}), t;
	}
	var mn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, hn = pn(mn), gn = h({}, mn, {
		view: 0,
		detail: 0
	}), _n = pn(gn), vn, yn, bn, xn = h({}, gn, {
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
		getModifierState: jn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== bn && (bn && e.type === "mousemove" ? (vn = e.screenX - bn.screenX, yn = e.screenY - bn.screenY) : yn = vn = 0, bn = e), vn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : yn;
		}
	}), Sn = pn(xn), Cn = pn(h({}, xn, { dataTransfer: 0 })), wn = pn(h({}, gn, { relatedTarget: 0 })), Tn = pn(h({}, mn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), En = pn(h({}, mn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Dn = pn(h({}, mn, { data: 0 })), On = {
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
	}, kn = {
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
	function G(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = An[e]) ? !!t[e] : !1;
	}
	function jn() {
		return G;
	}
	var Mn = pn(h({}, gn, {
		key: function(e) {
			if (e.key) {
				var t = On[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = un(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? kn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: jn,
		charCode: function(e) {
			return e.type === "keypress" ? un(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? un(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), Nn = pn(h({}, xn, {
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
	})), Pn = pn(h({}, gn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: jn
	})), Fn = pn(h({}, mn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), In = pn(h({}, xn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), Ln = pn(h({}, mn, {
		newState: 0,
		oldState: 0
	})), Rn = [
		9,
		13,
		27,
		32
	], zn = nn && "CompositionEvent" in window, Bn = null;
	nn && "documentMode" in document && (Bn = document.documentMode);
	var Vn = nn && "TextEvent" in window && !Bn, Hn = nn && (!zn || Bn && 8 < Bn && 11 >= Bn), Un = " ", Wn = !1;
	function Gn(e, t) {
		switch (e) {
			case "keyup": return Rn.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function Kn(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var qn = !1;
	function Jn(e, t) {
		switch (e) {
			case "compositionend": return Kn(t);
			case "keypress": return t.which === 32 ? (Wn = !0, Un) : null;
			case "textInput": return e = t.data, e === Un && Wn ? null : e;
			default: return null;
		}
	}
	function Yn(e, t) {
		if (qn) return e === "compositionend" || !zn && Gn(e, t) ? (e = ln(), cn = sn = on = null, qn = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return Hn && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var Xn = {
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
	function Zn(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!Xn[e.type] : t === "textarea";
	}
	function Qn(e, t, n, r) {
		Xt ? Zt ? Zt.push(r) : Zt = [r] : Xt = r, t = Td(t, "onChange"), 0 < t.length && (n = new hn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var $n = null, er = null;
	function tr(e) {
		vd(e, 0);
	}
	function nr(e) {
		if (kt(dt(e))) return e;
	}
	function rr(e, t) {
		if (e === "change") return t;
	}
	var ir = !1;
	if (nn) {
		var ar;
		if (nn) {
			var or = "oninput" in document;
			if (!or) {
				var sr = document.createElement("div");
				sr.setAttribute("oninput", "return;"), or = typeof sr.oninput == "function";
			}
			ar = or;
		} else ar = !1;
		ir = ar && (!document.documentMode || 9 < document.documentMode);
	}
	function cr() {
		$n && ($n.detachEvent("onpropertychange", lr), er = $n = null);
	}
	function lr(e) {
		if (e.propertyName === "value" && nr(er)) {
			var t = [];
			Qn(t, er, e, Yt(e)), en(tr, t);
		}
	}
	function ur(e, t, n) {
		e === "focusin" ? (cr(), $n = t, er = n, $n.attachEvent("onpropertychange", lr)) : e === "focusout" && cr();
	}
	function dr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return nr(er);
	}
	function fr(e, t) {
		if (e === "click") return nr(t);
	}
	function pr(e, t) {
		if (e === "input" || e === "change") return nr(t);
	}
	function mr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var hr = typeof Object.is == "function" ? Object.is : mr;
	function gr(e, t) {
		if (hr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!he.call(t, i) || !hr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function _r(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function vr(e, t) {
		var n = _r(e);
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
			n = _r(n);
		}
	}
	function yr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? yr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function br(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = At(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = At(e.document);
		}
		return t;
	}
	function xr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var Sr = nn && "documentMode" in document && 11 >= document.documentMode, Cr = null, wr = null, Tr = null, Er = !1;
	function Dr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		Er || Cr == null || Cr !== At(r) || (r = Cr, "selectionStart" in r && xr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Tr && gr(Tr, r) || (Tr = r, r = Td(wr, "onSelect"), 0 < r.length && (t = new hn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Cr)));
	}
	function Or(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var kr = {
		animationend: Or("Animation", "AnimationEnd"),
		animationiteration: Or("Animation", "AnimationIteration"),
		animationstart: Or("Animation", "AnimationStart"),
		transitionrun: Or("Transition", "TransitionRun"),
		transitionstart: Or("Transition", "TransitionStart"),
		transitioncancel: Or("Transition", "TransitionCancel"),
		transitionend: Or("Transition", "TransitionEnd")
	}, Ar = {}, jr = {};
	nn && (jr = document.createElement("div").style, "AnimationEvent" in window || (delete kr.animationend.animation, delete kr.animationiteration.animation, delete kr.animationstart.animation), "TransitionEvent" in window || delete kr.transitionend.transition);
	function Mr(e) {
		if (Ar[e]) return Ar[e];
		if (!kr[e]) return e;
		var t = kr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in jr) return Ar[e] = t[n];
		return e;
	}
	var Nr = Mr("animationend"), Pr = Mr("animationiteration"), Fr = Mr("animationstart"), Ir = Mr("transitionrun"), Lr = Mr("transitionstart"), Rr = Mr("transitioncancel"), zr = Mr("transitionend"), Br = /* @__PURE__ */ new Map(), Vr = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	Vr.push("scrollEnd");
	function Hr(e, t) {
		Br.set(e, t), gt(t, [e]);
	}
	var Ur = typeof reportError == "function" ? reportError : function(e) {
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
	}, Wr = [], Gr = 0, Kr = 0;
	function qr() {
		for (var e = Gr, t = Kr = Gr = 0; t < e;) {
			var n = Wr[t];
			Wr[t++] = null;
			var r = Wr[t];
			Wr[t++] = null;
			var i = Wr[t];
			Wr[t++] = null;
			var a = Wr[t];
			if (Wr[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && Zr(n, i, a);
		}
	}
	function Jr(e, t, n, r) {
		Wr[Gr++] = e, Wr[Gr++] = t, Wr[Gr++] = n, Wr[Gr++] = r, Kr |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function Yr(e, t, n, r) {
		return Jr(e, t, n, r), Qr(e);
	}
	function Xr(e, t) {
		return Jr(e, null, null, t), Qr(e);
	}
	function Zr(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - je(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function Qr(e) {
		if (50 < uu) throw uu = 0, du = null, Error(s(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var $r = {};
	function ei(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function ti(e, t, n, r) {
		return new ei(e, t, n, r);
	}
	function ni(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function ri(e, t) {
		var n = e.alternate;
		return n === null ? (n = ti(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function ii(e, t) {
		e.flags &= 65011714;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function ai(e, t, n, r, i, a) {
		var o = 0;
		if (r = e, typeof e == "function") ni(e) && (o = 1);
		else if (typeof e == "string") o = Uf(e, n, V.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (e) {
			case k: return e = ti(31, n, t, i), e.elementType = k, e.lanes = a, e;
			case y: return oi(n.children, i, a, t);
			case b:
				o = 8, i |= 24;
				break;
			case x: return e = ti(12, n, t, i | 2), e.elementType = x, e.lanes = a, e;
			case T: return e = ti(13, n, t, i), e.elementType = T, e.lanes = a, e;
			case E: return e = ti(19, n, t, i), e.elementType = E, e.lanes = a, e;
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
		return t = ti(o, n, t, i), t.elementType = e, t.type = r, t.lanes = a, t;
	}
	function oi(e, t, n, r) {
		return e = ti(7, e, r, t), e.lanes = n, e;
	}
	function si(e, t, n) {
		return e = ti(6, e, null, t), e.lanes = n, e;
	}
	function ci(e) {
		var t = ti(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function li(e, t, n) {
		return t = ti(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var ui = /* @__PURE__ */ new WeakMap();
	function di(e, t) {
		if (typeof e == "object" && e) {
			var n = ui.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: me(t)
			}, ui.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: me(t)
		};
	}
	var fi = [], pi = 0, mi = null, hi = 0, gi = [], _i = 0, vi = null, yi = 1, bi = "";
	function xi(e, t) {
		fi[pi++] = hi, fi[pi++] = mi, mi = e, hi = t;
	}
	function Si(e, t, n) {
		gi[_i++] = yi, gi[_i++] = bi, gi[_i++] = vi, vi = e;
		var r = yi;
		e = bi;
		var i = 32 - je(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - je(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, yi = 1 << 32 - je(t) + i | n << i | r, bi = a + e;
		} else yi = 1 << a | n << i | r, bi = e;
	}
	function Ci(e) {
		e.return !== null && (xi(e, 1), Si(e, 1, 0));
	}
	function wi(e) {
		for (; e === mi;) mi = fi[--pi], fi[pi] = null, hi = fi[--pi], fi[pi] = null;
		for (; e === vi;) vi = gi[--_i], gi[_i] = null, bi = gi[--_i], gi[_i] = null, yi = gi[--_i], gi[_i] = null;
	}
	function Ti(e, t) {
		gi[_i++] = yi, gi[_i++] = bi, gi[_i++] = vi, yi = t.id, bi = t.overflow, vi = e;
	}
	var Ei = null, Di = null, K = !1, Oi = null, ki = !1, Ai = Error(s(519));
	function ji(e) {
		throw Li(di(Error(s(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), Ai;
	}
	function Mi(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[et] = e, t[tt] = r, n) {
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
				$("invalid", t), Pt(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				$("invalid", t);
				break;
			case "textarea": $("invalid", t), Rt(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || jd(t.textContent, n) ? (r.popover != null && ($("beforetoggle", t), $("toggle", t)), r.onScroll != null && $("scroll", t), r.onScrollEnd != null && $("scrollend", t), r.onClick != null && (t.onclick = qt), t = !0) : t = !1, t || ji(e, !0);
	}
	function Ni(e) {
		for (Ei = e.return; Ei;) switch (Ei.tag) {
			case 5:
			case 31:
			case 13:
				ki = !1;
				return;
			case 27:
			case 3:
				ki = !0;
				return;
			default: Ei = Ei.return;
		}
	}
	function Pi(e) {
		if (e !== Ei) return !1;
		if (!K) return Ni(e), K = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || Ud(e.type, e.memoizedProps)), n = !n), n && Di && ji(e), Ni(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			Di = uf(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			Di = uf(e);
		} else t === 27 ? (t = Di, Zd(e.type) ? (e = lf, lf = null, Di = e) : Di = t) : Di = Ei ? cf(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Fi() {
		Di = Ei = null, K = !1;
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
					hr(i.pendingProps.value, o.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (i === ae.current) {
				if (o = i.alternate, o === null) throw Error(s(387));
				o.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [Qf] : e.push(Qf));
			}
			i = i.return;
		}
		e !== null && Wi(t, e, n, r), t.flags |= 262144;
	}
	function Ki(e) {
		for (e = e.firstContext; e !== null;) {
			if (!hr(e.context._currentValue, e.memoizedValue)) return !0;
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
			ra = 0, ia = ud(), aa = {
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
		$l = be(), typeof t == "object" && t && typeof t.then == "function" && oa(e, t), la !== null && la(e, t);
	};
	var ua = R(null);
	function da() {
		var e = ua.current;
		return e === null ? Ll.pooledCache : e;
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
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(qt, qt), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Ca(e), e;
			default:
				if (typeof t.status == "string") t.then(qt, qt);
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
			return e = ri(e, t), e.index = 0, e.sibling = null, e;
		}
		function a(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 67108866, n) : (r = r.index, r < n ? (t.flags |= 67108866, n) : r)) : (t.flags |= 1048576, n);
		}
		function o(t) {
			return e && t.alternate === null && (t.flags |= 67108866), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = si(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === y ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === O && ba(a) === t.type) ? (t = i(t, n.props), Da(t, n), t.return = e, t) : (t = ai(n.type, n.key, n.props, null, e.mode, r), Da(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = li(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = oi(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = si("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case _: return n = ai(t.type, t.key, t.props, null, e.mode, n), Da(n, t), n.return = e, n;
					case v: return t = li(t, e.mode, n), t.return = e, t;
					case O: return t = ba(t), f(e, t, n);
				}
				if (te(t) || M(t)) return t = oi(t, e.mode, n, null), t.return = e, t;
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
			if (h === s.length) return n(i, d), K && xi(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return K && xi(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), K && xi(i, h), l;
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
			if (v.done) return n(i, h), K && xi(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
				return K && xi(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), K && xi(i, g), u;
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
							a.type === y ? (c = oi(a.props.children, e.mode, c, a.key), c.return = e, e = c) : (c = ai(a.type, a.key, a.props, null, e.mode, c), Da(c, a), c.return = e, e = c);
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
							c = li(a, e.mode, c), c.return = e, e = c;
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
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), c = i(r, a), c.return = e, e = c) : (n(e, r), c = si(a, e.mode, c), c.return = e, e = c), o(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				Ta = 0;
				var i = b(e, t, n, r);
				return wa = null, i;
			} catch (t) {
				if (t === ma || t === ga) throw t;
				var a = ti(29, t, null, e.mode);
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
		if (r = r.shared, Il & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = Qr(e), Zr(e, null, n), t;
		}
		return Jr(e, r, t, n), Qr(e);
	}
	function La(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, qe(e, n);
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
				if (p ? (X & f) === f : (r & f) === f) {
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
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), Gl |= o, e.lanes = o, e.memoizedState = d;
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
		e = Ul, B(Ga, e), B(Wa, t), Ul = e | t.baseLanes;
	}
	function qa() {
		B(Ga, Ul), B(Wa, Wa.current);
	}
	function Ja() {
		Ul = Ga.current, z(Wa), z(Ga);
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
	var io = 0, J = null, ao = null, oo = null, so = !1, co = !1, lo = !1, uo = 0, fo = 0, po = null, mo = 0;
	function ho() {
		throw Error(s(321));
	}
	function go(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!hr(e[n], t[n])) return !1;
		return !0;
	}
	function _o(e, t, n, r, i, a) {
		return io = a, J = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, P.H = e === null || e.memoizedState === null ? Ps : Fs, lo = !1, a = n(r, i), lo = !1, co && (a = yo(t, n, r, i)), vo(e), a;
	}
	function vo(e) {
		P.H = Ns;
		var t = ao !== null && ao.next !== null;
		if (io = 0, oo = ao = J = null, so = !1, fo = 0, po = null, t) throw Error(s(300));
		e === null || Qs || (e = e.dependencies, e !== null && Ki(e) && (Qs = !0));
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
				if (f === u.lane ? (io & f) === f : (X & f) === f) {
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
					}, l === null ? (c = l = f, o = a) : l = l.next = f, J.lanes |= p, Gl |= p;
					f = u.action, lo && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, o = a) : l = l.next = p, J.lanes |= f, Gl |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? o = a : l.next = c, !hr(a, e.memoizedState) && (Qs = !0, d && (n = aa, n !== null))) throw n;
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
			hr(a, t.memoizedState) || (Qs = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function Po(e, t, n) {
		var r = J, i = To(), a = K;
		if (a) {
			if (n === void 0) throw Error(s(407));
			n = n();
		} else n = t();
		var o = !hr((ao || i).memoizedState, n);
		if (o && (i.memoizedState = n, Qs = !0), i = i.queue, as(Lo.bind(null, r, i, e), [e]), i.getSnapshot !== t || o || oo !== null && oo.memoizedState.tag & 1) {
			if (r.flags |= 2048, es(9, { destroy: void 0 }, Io.bind(null, r, i, n, t), null), Ll === null) throw Error(s(349));
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
			return !hr(e, n);
		} catch {
			return !0;
		}
	}
	function zo(e) {
		var t = Xr(e, 2);
		t !== null && mu(t, e, 2);
	}
	function Bo(e) {
		var t = wo();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), lo) {
				Ae(!0);
				try {
					n();
				} finally {
					Ae(!1);
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
		if (K) {
			var n = Ll.formState;
			if (n !== null) {
				a: {
					var r = J;
					if (K) {
						if (Di) {
							b: {
								for (var i = Di, a = ki; i.nodeType !== 8;) {
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
								Di = cf(i.nextSibling), r = i.data === "F!";
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
			if (Il & 2) throw Error(s(440));
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
			Ae(!0);
			try {
				e();
			} finally {
				Ae(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function hs(e, t, n) {
		return n === void 0 || io & 1073741824 && !(X & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = pu(), J.lanes |= e, Gl |= e, n);
	}
	function gs(e, t, n, r) {
		return hr(n, t) ? n : Wa.current === null ? !(io & 42) || io & 1073741824 && !(X & 261930) ? (Qs = !0, e.memoizedState = n) : (e = pu(), J.lanes |= e, Gl |= e, t) : (e = hs(e, n, r), hr(e, t) || (Qs = !0), e);
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
		return Ji(Qf);
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
		}, As(e) ? js(t, n) : (n = Yr(e, t, n, r), n !== null && (mu(n, e, r), Ms(n, t, r)));
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
				if (i.hasEagerState = !0, i.eagerState = s, hr(s, o)) return Jr(e, t, i, 0), Ll === null && qr(), !1;
			} catch {}
			if (n = Yr(e, t, i, r), n !== null) return mu(n, e, r), Ms(n, t, r), !0;
		}
		return !1;
	}
	function ks(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: ud(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, As(e)) {
			if (t) throw Error(s(479));
		} else t = Yr(e, n, r, 2), t !== null && mu(t, e, 2);
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
			r &= e.pendingLanes, n |= r, t.lanes = n, qe(e, n);
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
				Ae(!0);
				try {
					e();
				} finally {
					Ae(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = wo();
			if (n !== void 0) {
				var i = n(t);
				if (lo) {
					Ae(!0);
					try {
						n(t);
					} finally {
						Ae(!1);
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
			if (K) {
				if (n === void 0) throw Error(s(407));
				n = n();
			} else {
				if (n = t(), Ll === null) throw Error(s(349));
				X & 127 || Fo(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, is(Lo.bind(null, r, a, e), [e]), r.flags |= 2048, es(9, { destroy: void 0 }, Io.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = wo(), t = Ll.identifierPrefix;
			if (K) {
				var n = bi, r = yi;
				n = (r & ~(1 << 32 - je(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = uo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
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
				if (Il & 2) throw Error(s(440));
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
	var Rs = {
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
	function zs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !gr(n, r) || !gr(i, a) : !0;
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
		Ur(e);
	}
	function Us(e) {
		console.error(e);
	}
	function Ws(e) {
		Ur(e);
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
		return n = Fa(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Gs(e, t);
		}, n;
	}
	function Js(e) {
		return e = Fa(e), e.tag = 3, e;
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
			if (t = n.alternate, t !== null && Gi(t, n, i, !0), n = Ya.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return Xa === null ? Eu() : n.alternate === null && Wl === 0 && (Wl = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === _a ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = new Set([r]) : t.add(r), Wu(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === _a ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = new Set([r]) : n.add(r)), Wu(e, r, i)), !1;
				}
				throw Error(s(435, n.tag));
			}
			return Wu(e, r, i), Eu(), !1;
		}
		if (K) return t = Ya.current, t === null ? (r !== Ai && (t = Error(s(423), { cause: r }), Li(di(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = di(r, n), i = qs(e.stateNode, r, i), Ra(e, i), Wl !== 4 && (Wl = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== Ai && (e = Error(s(422), { cause: r }), Li(di(e, n)))), !1;
		var a = Error(s(520), { cause: r });
		if (a = di(a, n), Yl === null ? Yl = [a] : Yl.push(a), Wl !== 4 && (Wl = 2), t === null) return !0;
		r = di(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = qs(n.stateNode, r, e), Ra(n, e), !1;
				case 1: if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (nu === null || !nu.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = Js(i), Ys(i, e, n, r), Ra(n, i), !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Zs = Error(s(461)), Qs = !1;
	function $s(e, t, n, r) {
		t.child = e === null ? ja(t, null, n, r) : Aa(t, e.child, n, r);
	}
	function ec(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return qi(t), r = _o(e, t, n, o, a, i), s = xo(), e !== null && !Qs ? (So(e, t, i), wc(e, t, i)) : (K && s && Ci(t), t.flags |= 1, $s(e, t, r, i), t.child);
	}
	function tc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ni(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, nc(e, t, a, r, i)) : (e = ai(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !Tc(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? gr : n, n(o, r) && e.ref === t.ref) return wc(e, t, i);
		}
		return t.flags |= 1, e = ri(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function nc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (gr(a, r) && e.ref === t.ref) if (Qs = !1, t.pendingProps = r = a, Tc(e, i)) e.flags & 131072 && (Qs = !0);
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
			}, e !== null && fa(t, a === null ? null : a.cachePool), a === null ? qa() : Ka(t, a), $a(t);
			else return r = t.lanes = 536870912, ac(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && fa(t, null), qa(), eo(t)) : (fa(t, a.cachePool), Ka(t, a), eo(t), t.memoizedState = null);
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
		var a = da();
		return a = a === null ? null : {
			parent: q._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && fa(t, null), qa(), $a(t), e !== null && Gi(e, t, r, !0), t.childLanes = i, null;
	}
	function oc(e, t) {
		return t = yc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function sc(e, t, n) {
		return Aa(t, e.child, null, n), e = oc(t, t.pendingProps), e.flags |= 2, to(t), t.memoizedState = null, e;
	}
	function cc(e, t, n) {
		var r = t.pendingProps, i = (t.flags & 128) != 0;
		if (t.flags &= -129, e === null) {
			if (K) {
				if (r.mode === "hidden") return e = oc(t, r), t.lanes = 536870912, ic(null, e);
				if (Qa(t), (e = Di) ? (e = rf(e, ki), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: vi === null ? null : {
						id: yi,
						overflow: bi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = ci(e), n.return = t, t.child = n, Ei = t, Di = null)) : e = null, e === null) throw ji(t);
				return t.lanes = 536870912, null;
			}
			return oc(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var o = a.dehydrated;
			if (Qa(t), i) if (t.flags & 256) t.flags &= -257, t = sc(e, t, n);
			else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
			else throw Error(s(558));
			else if (Qs || Gi(e, t, n, !1), i = (n & e.childLanes) !== 0, Qs || i) {
				if (r = Ll, r !== null && (o = Je(r, n), o !== 0 && o !== a.retryLane)) throw a.retryLane = o, Xr(e, o), mu(r, e, o), Zs;
				Eu(), t = sc(e, t, n);
			} else e = a.treeContext, Di = cf(o.nextSibling), Ei = t, K = !0, Oi = null, ki = !1, e !== null && Ti(t, e), t = oc(t, r), t.flags |= 4096;
			return t;
		}
		return e = ri(e.child, {
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
		return qi(t), n = _o(e, t, n, r, void 0, i), r = xo(), e !== null && !Qs ? (So(e, t, i), wc(e, t, i)) : (K && r && Ci(t), t.flags |= 1, $s(e, t, n, i), t.child);
	}
	function dc(e, t, n, r, i, a) {
		return qi(t), t.updateQueue = null, n = yo(t, r, n, i), vo(e), r = xo(), e !== null && !Qs ? (So(e, t, a), wc(e, t, a)) : (K && r && Ci(t), t.flags |= 1, $s(e, t, n, a), t.child);
	}
	function fc(e, t, n, r, i) {
		if (qi(t), t.stateNode === null) {
			var a = $r, o = n.contextType;
			typeof o == "object" && o && (a = Ji(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Rs, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Na(t), o = n.contextType, a.context = typeof o == "object" && o ? Ji(o) : $r, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Ls(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Rs.enqueueReplaceState(a, a.state, null), Va(t, r, a, i), Ba(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Vs(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = $r, typeof u == "object" && u && (o = Ji(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && Bs(t, a, r, o), Ma = !1;
			var f = t.memoizedState;
			a.state = f, Va(t, r, a, i), Ba(), l = t.memoizedState, s || f !== l || Ma ? (typeof d == "function" && (Ls(t, n, d, r), l = t.memoizedState), (c = Ma || zs(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Pa(e, t), o = t.memoizedProps, u = Vs(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = $r, typeof l == "object" && l && (c = Ji(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && Bs(t, a, r, c), Ma = !1, f = t.memoizedState, a.state = f, Va(t, r, a, i), Ba();
			var p = t.memoizedState;
			o !== d || f !== p || Ma || e !== null && e.dependencies !== null && Ki(e.dependencies) ? (typeof s == "function" && (Ls(t, n, s, r), p = t.memoizedState), (u = Ma || zs(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Ki(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, lc(e, t), r = (t.flags & 128) != 0, a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = Aa(t, e.child, null, i), t.child = Aa(t, null, n, i)) : $s(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = wc(e, t, i), e;
	}
	function pc(e, t, n, r) {
		return Fi(), t.flags |= 256, $s(e, t, n, r), t.child;
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
			cachePool: pa()
		};
	}
	function gc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ql), e;
	}
	function _c(e, t, n) {
		var r = t.pendingProps, i = !1, a = (t.flags & 128) != 0, o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : (no.current & 2) != 0), o && (i = !0, t.flags &= -129), o = (t.flags & 32) != 0, t.flags &= -33, e === null) {
			if (K) {
				if (i ? Za(t) : eo(t), (e = Di) ? (e = rf(e, ki), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: vi === null ? null : {
						id: yi,
						overflow: bi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = ci(e), n.return = t, t.child = n, Ei = t, Di = null)) : e = null, e === null) throw ji(t);
				return of(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var c = r.children;
			return r = r.fallback, i ? (eo(t), i = t.mode, c = yc({
				mode: "hidden",
				children: c
			}, i), r = oi(r, i, n, null), c.return = t, r.return = t, c.sibling = r, t.child = c, r = t.child, r.memoizedState = hc(n), r.childLanes = gc(e, o, n), t.memoizedState = mc, ic(null, r)) : (Za(t), vc(t, c));
		}
		var l = e.memoizedState;
		if (l !== null && (c = l.dehydrated, c !== null)) {
			if (a) t.flags & 256 ? (Za(t), t.flags &= -257, t = bc(e, t, n)) : t.memoizedState === null ? (eo(t), c = r.fallback, i = t.mode, r = yc({
				mode: "visible",
				children: r.children
			}, i), c = oi(c, i, n, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, Aa(t, e.child, null, n), r = t.child, r.memoizedState = hc(n), r.childLanes = gc(e, o, n), t.memoizedState = mc, t = ic(null, r)) : (eo(t), t.child = e.child, t.flags |= 128, t = null);
			else if (Za(t), of(c)) {
				if (o = c.nextSibling && c.nextSibling.dataset, o) var u = o.dgst;
				o = u, r = Error(s(419)), r.stack = "", r.digest = o, Li({
					value: r,
					source: null,
					stack: null
				}), t = bc(e, t, n);
			} else if (Qs || Gi(e, t, n, !1), o = (n & e.childLanes) !== 0, Qs || o) {
				if (o = Ll, o !== null && (r = Je(o, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, Xr(e, r), mu(o, e, r), Zs;
				af(c) || Eu(), t = bc(e, t, n);
			} else af(c) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, Di = cf(c.nextSibling), Ei = t, K = !0, Oi = null, ki = !1, e !== null && Ti(t, e), t = vc(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? (eo(t), c = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = ri(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (c = oi(c, i, n, null), c.flags |= 2) : c = ri(u, c), c.return = t, r.return = t, r.sibling = c, t.child = r, ic(null, r), r = t.child, c = e.child.memoizedState, c === null ? c = hc(n) : (i = c.cachePool, i === null ? i = pa() : (l = q._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), c = {
			baseLanes: c.baseLanes | n,
			cachePool: i
		}), r.memoizedState = c, r.childLanes = gc(e, o, n), t.memoizedState = mc, ic(e.child, r)) : (Za(t), n = e.child, e = n.sibling, n = ri(n, {
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
		return e = ti(22, e, null, t), e.lanes = 0, e;
	}
	function bc(e, t, n) {
		return Aa(t, e.child, null, n), e = vc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function xc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Ui(e.return, t, n);
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
		var o = no.current, s = (o & 2) != 0;
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, B(no, o), $s(e, t, r, n), r = K ? hi : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
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
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && ro(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), Sc(t, !1, i, n, a, r);
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
		if (e !== null && (t.dependencies = e.dependencies), Gl |= t.lanes, (n & t.childLanes) === 0) if (e !== null) {
			if (Gi(e, t, n, !1), (n & t.childLanes) === 0) return null;
		} else return null;
		if (e !== null && t.child !== e.child) throw Error(s(153));
		if (t.child !== null) {
			for (e = t.child, n = ri(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ri(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function Tc(e, t) {
		return (e.lanes & t) === 0 ? (e = e.dependencies, !!(e !== null && Ki(e))) : !0;
	}
	function Ec(e, t, n) {
		switch (t.tag) {
			case 3:
				H(t, t.stateNode.containerInfo), Vi(t, q, e.memoizedState.cache), Fi();
				break;
			case 27:
			case 5:
				U(t);
				break;
			case 4:
				H(t, t.stateNode.containerInfo);
				break;
			case 10:
				Vi(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, Qa(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (Za(t), e = wc(e, t, n), e === null ? null : e.sibling) : _c(e, t, n) : (Za(t), t.flags |= 128, null);
				Za(t);
				break;
			case 19:
				var i = (e.flags & 128) != 0;
				if (r = (n & t.childLanes) !== 0, r ||= (Gi(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return Cc(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), B(no, no.current), r) break;
				return null;
			case 22: return t.lanes = 0, rc(e, t, n, t.pendingProps);
			case 24: Vi(t, q, e.memoizedState.cache);
		}
		return wc(e, t, n);
	}
	function Dc(e, t, n) {
		if (e !== null) if (e.memoizedProps !== t.pendingProps) Qs = !0;
		else {
			if (!Tc(e, n) && !(t.flags & 128)) return Qs = !1, Ec(e, t, n);
			Qs = !!(e.flags & 131072);
		}
		else Qs = !1, K && t.flags & 1048576 && Si(t, hi, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = ba(t.elementType), t.type = e, typeof e == "function") ni(e) ? (r = Vs(e, r), t.tag = 1, t = fc(null, t, e, r, n)) : (t.tag = 0, t = uc(null, t, e, r, n));
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
						throw t = N(e) || e, Error(s(306, t, ""));
					}
				}
				return t;
			case 0: return uc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, i = Vs(r, t.pendingProps), fc(e, t, r, i, n);
			case 3:
				a: {
					if (H(t, t.stateNode.containerInfo), e === null) throw Error(s(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, Pa(e, t), Va(t, r, null, n);
					var o = t.memoizedState;
					if (r = o.cache, Vi(t, q, r), r !== a.cache && Wi(t, [q], n, !0), Ba(), r = o.element, a.isDehydrated) if (a = {
						element: r,
						isDehydrated: !1,
						cache: o.cache
					}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
						t = pc(e, t, r, n);
						break a;
					} else if (r !== i) {
						i = di(Error(s(424)), t), Li(i), t = pc(e, t, r, n);
						break a;
					} else {
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (Di = cf(e.firstChild), Ei = t, K = !0, Oi = null, ki = !0, n = ja(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					}
					else {
						if (Fi(), r === i) {
							t = wc(e, t, n);
							break a;
						}
						$s(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return lc(e, t), e === null ? (n = kf(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : K || (n = t.type, e = t.pendingProps, r = Bd(ie.current).createElement(n), r[et] = t, r[tt] = e, Pd(r, n, e), pt(r), t.stateNode = r) : t.memoizedState = kf(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return U(t), e === null && K && (r = t.stateNode = ff(t.type, t.pendingProps, ie.current), Ei = t, ki = !0, i = Di, Zd(t.type) ? (lf = i, Di = cf(r.firstChild)) : Di = i), $s(e, t, t.pendingProps.children, n), lc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && K && ((i = r = Di) && (r = tf(r, t.type, t.pendingProps, ki), r === null ? i = !1 : (t.stateNode = r, Ei = t, Di = cf(r.firstChild), ki = !1, i = !0)), i || ji(t)), U(t), i = t.type, a = t.pendingProps, o = e === null ? null : e.memoizedProps, r = a.children, Ud(i, a) ? r = null : o !== null && Ud(i, o) && (t.flags |= 32), t.memoizedState !== null && (i = _o(e, t, bo, null, null, n), Qf._currentValue = i), lc(e, t), $s(e, t, r, n), t.child;
			case 6: return e === null && K && ((e = n = Di) && (n = nf(n, t.pendingProps, ki), n === null ? e = !1 : (t.stateNode = n, Ei = t, Di = null, e = !0)), e || ji(t)), null;
			case 13: return _c(e, t, n);
			case 4: return H(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Aa(t, null, r, n) : $s(e, t, r, n), t.child;
			case 11: return ec(e, t, t.type, t.pendingProps, n);
			case 7: return $s(e, t, t.pendingProps, n), t.child;
			case 8: return $s(e, t, t.pendingProps.children, n), t.child;
			case 12: return $s(e, t, t.pendingProps.children, n), t.child;
			case 10: return r = t.pendingProps, Vi(t, t.type, r.value), $s(e, t, r.children, n), t.child;
			case 9: return i = t.type._context, r = t.pendingProps.children, qi(t), i = Ji(i), r = r(i), t.flags |= 1, $s(e, t, r, n), t.child;
			case 14: return tc(e, t, t.type, t.pendingProps, n);
			case 15: return nc(e, t, t.type, t.pendingProps, n);
			case 19: return Cc(e, t, n);
			case 31: return cc(e, t, n);
			case 22: return rc(e, t, n, t.pendingProps);
			case 24: return qi(t), r = Ji(q), e === null ? (i = da(), i === null && (i = Ll, a = ea(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, Na(t), Vi(t, q, i)) : ((e.lanes & n) !== 0 && (Pa(e, t), Va(t, null, null, n), Ba()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, Vi(t, q, r), r !== i.cache && Wi(t, [q], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), Vi(t, q, r))), $s(e, t, t.pendingProps.children, n), t.child;
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
			else throw xa = _a, ha;
		} else e.flags &= -16777217;
	}
	function Ac(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Wf(t)) if (Cu()) e.flags |= 8192;
		else throw xa = _a, ha;
	}
	function jc(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : He(), e.lanes |= t, Jl |= t);
	}
	function Mc(e, t) {
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
	function Nc(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 65011712, r |= i.flags & 65011712, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function Pc(e, t, n) {
		var r = t.pendingProps;
		switch (wi(t), t.tag) {
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
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Hi(q), oe(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Pi(t) ? Oc(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Ii())), Nc(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (Oc(t), a === null ? (Nc(t), kc(t, i, null, r, n)) : (Nc(t), Ac(t, a))) : a ? a === e.memoizedState ? (Nc(t), t.flags &= -16777217) : (Oc(t), Nc(t), Ac(t, a)) : (e = e.memoizedProps, e !== r && Oc(t), Nc(t), kc(t, i, e, r, n)), null;
			case 27:
				if (se(t), n = ie.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Oc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Nc(t), null;
					}
					e = V.current, Pi(t) ? Mi(t, e) : (e = ff(i, r, n), t.stateNode = e, Oc(t));
				}
				return Nc(t), null;
			case 5:
				if (se(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Oc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Nc(t), null;
					}
					if (a = V.current, Pi(t)) Mi(t, a);
					else {
						var o = Bd(ie.current);
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
						a[et] = t, a[tt] = r;
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
						r && Oc(t);
					}
				}
				return Nc(t), kc(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && Oc(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(s(166));
					if (e = ie.current, Pi(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = Ei, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[et] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || jd(e.nodeValue, n)), e || ji(t, !0);
					} else e = Bd(e).createTextNode(r), e[et] = t, t.stateNode = e;
				}
				return Nc(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Pi(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(s(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(557));
							e[et] = t;
						} else Fi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Nc(t), e = !1;
					} else n = Ii(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (to(t), t) : (to(t), null);
					if (t.flags & 128) throw Error(s(558));
				}
				return Nc(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = Pi(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(s(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(s(317));
							i[et] = t;
						} else Fi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Nc(t), i = !1;
					} else i = Ii(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (to(t), t) : (to(t), null);
				}
				return to(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), jc(t, t.updateQueue), Nc(t), null);
			case 4: return oe(), e === null && xd(t.stateNode.containerInfo), Nc(t), null;
			case 10: return Hi(t.type), Nc(t), null;
			case 19:
				if (z(no), r = t.memoizedState, r === null) return Nc(t), null;
				if (i = (t.flags & 128) != 0, a = r.rendering, a === null) if (i) Mc(r, !1);
				else {
					if (Wl !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
						if (a = ro(e), a !== null) {
							for (t.flags |= 128, Mc(r, !1), e = a.updateQueue, t.updateQueue = e, jc(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) ii(n, e), n = n.sibling;
							return B(no, no.current & 1 | 2), K && xi(t, r.treeForkCount), t.child;
						}
						e = e.sibling;
					}
					r.tail !== null && be() > eu && (t.flags |= 128, i = !0, Mc(r, !1), t.lanes = 4194304);
				}
				else {
					if (!i) if (e = ro(a), e !== null) {
						if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, jc(t, e), Mc(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !K) return Nc(t), null;
					} else 2 * be() - r.renderingStartTime > eu && n !== 536870912 && (t.flags |= 128, i = !0, Mc(r, !1), t.lanes = 4194304);
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (Nc(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = be(), e.sibling = null, n = no.current, B(no, i ? n & 1 | 2 : n & 1), K && xi(t, r.treeForkCount), e);
			case 22:
			case 23: return to(t), Ja(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (Nc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Nc(t), n = t.updateQueue, n !== null && jc(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && z(ua), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Hi(q), Nc(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(s(156, t.tag));
	}
	function Fc(e, t) {
		switch (wi(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Hi(q), oe(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
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
			case 4: return oe(), null;
			case 10: return Hi(t.type), null;
			case 22:
			case 23: return to(t), Ja(), e !== null && z(ua), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Hi(q), null;
			case 25: return null;
			default: return null;
		}
	}
	function Ic(e, t) {
		switch (wi(t), t.tag) {
			case 3:
				Hi(q), oe();
				break;
			case 26:
			case 27:
			case 5:
				se(t);
				break;
			case 4:
				oe();
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
			Uu(t, t.return, e);
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
	function zc(e) {
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
	function Bc(e, t, n) {
		n.props = Vs(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Uu(e, t, n);
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
			Uu(e, t, n);
		}
	}
	function Hc(e, t) {
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
			Uu(e, e.return, t);
		}
	}
	function Wc(e, t, n) {
		try {
			var r = e.stateNode;
			Fd(r, e.type, n, t), r[tt] = t;
		} catch (t) {
			Uu(e, e.return, t);
		}
	}
	function Gc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Zd(e.type) || e.tag === 4;
	}
	function Kc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Gc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Zd(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function qc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = qt));
		else if (r !== 4 && (r === 27 && Zd(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null)) for (qc(e, t, n), e = e.sibling; e !== null;) qc(e, t, n), e = e.sibling;
	}
	function Jc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (r === 27 && Zd(e.type) && (n = e.stateNode), e = e.child, e !== null)) for (Jc(e, t, n), e = e.sibling; e !== null;) Jc(e, t, n), e = e.sibling;
	}
	function Yc(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			Pd(t, r, n), t[et] = e, t[tt] = n;
		} catch (t) {
			Uu(e, e.return, t);
		}
	}
	var Xc = !1, Zc = !1, Qc = !1, $c = typeof WeakSet == "function" ? WeakSet : Set, el = null;
	function tl(e, t) {
		if (e = e.containerInfo, Rd = sp, e = br(e), xr(e)) {
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
					Uu(n, n.return, e);
				}
				else {
					var i = Vs(n.type, t.memoizedProps);
					t = t.memoizedState;
					try {
						e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
					} catch (e) {
						Uu(n, n.return, e);
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
						Ua(e, t);
					} catch (e) {
						Uu(n, n.return, e);
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
				_l(e, n), r & 4 && ll(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = qu.bind(null, n), sf(e, n))));
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
		t !== null && (e.alternate = null, rl(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && ct(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var il = null, al = !1;
	function ol(e, t, n) {
		for (n = n.child; n !== null;) sl(e, t, n), n = n.sibling;
	}
	function sl(e, t, n) {
		if (W && typeof W.onCommitFiberUnmount == "function") try {
			W.onCommitFiberUnmount(ke, n);
		} catch {}
		switch (n.tag) {
			case 26:
				Zc || Hc(n, t), ol(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				Zc || Hc(n, t);
				var r = il, i = al;
				Zd(n.type) && (il = n.stateNode, al = !1), ol(e, t, n), pf(n.stateNode), il = r, al = i;
				break;
			case 5: Zc || Hc(n, t);
			case 6:
				if (r = il, i = al, il = null, ol(e, t, n), il = r, al = i, il !== null) if (al) try {
					(il.nodeType === 9 ? il.body : il.nodeName === "HTML" ? il.ownerDocument.body : il).removeChild(n.stateNode);
				} catch (e) {
					Uu(n, t, e);
				}
				else try {
					il.removeChild(n.stateNode);
				} catch (e) {
					Uu(n, t, e);
				}
				break;
			case 18:
				il !== null && (al ? (e = il, Qd(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Np(e)) : Qd(il, n.stateNode));
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
				Uu(t, t.return, e);
			}
		}
	}
	function ll(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Np(e);
		} catch (e) {
			Uu(t, t.return, e);
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
				var r = Ju.bind(null, e, t);
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
						if (Zd(c.type)) {
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
									a = i.getElementsByTagName("title")[0], (!a || a[st] || a[et] || a.namespaceURI === "http://www.w3.org/2000/svg" || a.hasAttribute("itemprop")) && (a = i.createElement(r), i.head.insertBefore(a, i.querySelector("head > title"))), Pd(a, r, n), a[et] = e, pt(a), r = a;
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
							a[et] = e, pt(a), r = a;
						}
						e.stateNode = r;
					} else Hf(i, e.type, e.stateNode);
					else e.stateNode = If(i, r, e.memoizedProps);
					else a === r ? r === null && e.stateNode !== null && Wc(e, e.memoizedProps, n.memoizedProps) : (a === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : a.count--, r === null ? Hf(i, e.type, e.stateNode) : If(i, r, e.memoizedProps));
				}
				break;
			case 27:
				fl(t, e), hl(e), r & 512 && (Zc || n === null || Hc(n, n.return)), n !== null && r & 4 && Wc(e, e.memoizedProps, n.memoizedProps);
				break;
			case 5:
				if (fl(t, e), hl(e), r & 512 && (Zc || n === null || Hc(n, n.return)), e.flags & 32) {
					i = e.stateNode;
					try {
						zt(i, "");
					} catch (t) {
						Uu(e, e.return, t);
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
						Uu(e, e.return, t);
					}
				}
				break;
			case 3:
				if (Bf = null, i = pl, pl = gf(t.containerInfo), fl(t, e), pl = i, hl(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					Np(t.containerInfo);
				} catch (t) {
					Uu(e, e.return, t);
				}
				Qc && (Qc = !1, gl(e));
				break;
			case 4:
				r = pl, pl = gf(e.stateNode.containerInfo), fl(t, e), hl(e), pl = r;
				break;
			case 12:
				fl(t, e), hl(e);
				break;
			case 31:
				fl(t, e), hl(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, dl(e, r)));
				break;
			case 13:
				fl(t, e), hl(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Ql = be()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, dl(e, r)));
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
						n.flags & 32 && (zt(a, ""), n.flags &= -33), Jc(e, Kc(e), a);
						break;
					case 3:
					case 4:
						var o = n.stateNode.containerInfo;
						qc(e, Kc(e), o);
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
				case 27: pf(t.stateNode);
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
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && ta(n));
	}
	function xl(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ta(e));
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
				Sl(e, t, n, r), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ta(e)));
				break;
			case 12:
				if (i & 2048) {
					Sl(e, t, n, r), e = t.stateNode;
					try {
						var a = t.memoizedProps, o = a.id, s = a.onPostCommit;
						typeof s == "function" && s(o, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0);
					} catch (e) {
						Uu(t, t.return, e);
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
				pl = gf(e.stateNode.containerInfo), Dl(e, t, n), pl = r;
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
				case 24: ta(n.memoizedState.cache);
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
			var t = Ji(q), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Ji(q).controller.signal;
		}
	}, Fl = typeof WeakMap == "function" ? WeakMap : Map, Il = 0, Ll = null, Y = null, X = 0, Rl = 0, zl = null, Bl = !1, Vl = !1, Hl = !1, Ul = 0, Wl = 0, Gl = 0, Z = 0, Kl = 0, ql = 0, Jl = 0, Yl = null, Xl = null, Zl = !1, Ql = 0, $l = 0, eu = Infinity, tu = null, nu = null, ru = 0, iu = null, au = null, ou = 0, su = 0, cu = null, lu = null, uu = 0, du = null;
	function fu() {
		return Il & 2 && X !== 0 ? X & -X : P.T === null ? Ze() : ud();
	}
	function pu() {
		if (ql === 0) if (!(X & 536870912) || K) {
			var e = Ie;
			Ie <<= 1, !(Ie & 3932160) && (Ie = 262144), ql = e;
		} else ql = 536870912;
		return e = Ya.current, e !== null && (e.flags |= 32), ql;
	}
	function mu(e, t, n) {
		(e === Ll && (Rl === 2 || Rl === 9) || e.cancelPendingCommit !== null) && (xu(e, 0), vu(e, X, ql, !1)), We(e, n), (!(Il & 2) || e !== Ll) && (e === Ll && (!(Il & 2) && (Z |= n), Wl === 4 && vu(e, X, ql, !1)), nd(e));
	}
	function hu(e, t, n) {
		if (Il & 6) throw Error(s(327));
		var r = !n && (t & 127) == 0 && (t & e.expiredLanes) === 0 || Be(e, t), i = r ? ku(e, t) : Du(e, t, !0), a = r;
		do {
			if (i === 0) {
				Vl && !r && vu(e, t, 0, !1);
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
								if (Hl && !l) {
									c.errorRecoveryDisabledLanes |= a, Z |= a, i = 4;
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
							vu(r, t, ql, !Bl);
							break a;
						case 2:
							Xl = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(s(329));
					}
					if ((t & 62914560) === t && (i = Ql + 300 - be(), 10 < i)) {
						if (vu(r, t, ql, !Bl), ze(r, 0, !0) !== 0) break a;
						ou = t, r.timeoutHandle = Kd(gu.bind(null, r, n, Xl, tu, Zl, t, ql, Z, Jl, Bl, a, "Throttled", -0, 0), i);
						break a;
					}
					gu(r, n, Xl, tu, Zl, t, ql, Z, Jl, Bl, a, null, -0, 0);
				}
			}
			break;
		} while (1);
		nd(e);
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
				unsuspend: qt
			}, Ol(t, a, d);
			var m = (a & 62914560) === a ? Ql - be() : (a & 4194048) === a ? $l - be() : 0;
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
					if (!hr(a(), i)) return !1;
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
		t &= ~Kl, t &= ~Z, e.suspendedLanes |= t, e.pingedLanes &= ~t, r && (e.warmLanes |= t), r = e.expirationTimes;
		for (var i = t; 0 < i;) {
			var a = 31 - je(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && Ke(e, n, t);
	}
	function yu() {
		return Il & 6 ? !0 : (rd(0, !1), !1);
	}
	function bu() {
		if (Y !== null) {
			if (Rl === 0) var e = Y.return;
			else e = Y, Bi = zi = null, Co(e), wa = null, Ta = 0, e = Y;
			for (; e !== null;) Ic(e.alternate, e), e = e.return;
			Y = null;
		}
	}
	function xu(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, qd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), ou = 0, bu(), Ll = e, Y = n = ri(e.current, null), X = t, Rl = 0, zl = null, Bl = !1, Vl = Be(e, t), Hl = !1, Jl = ql = Kl = Z = Gl = Wl = 0, Xl = Yl = null, Zl = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - je(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Ul = t, qr(), n;
	}
	function Su(e, t) {
		J = null, P.H = Ns, t === ma || t === ga ? (t = Sa(), Rl = 3) : t === ha ? (t = Sa(), Rl = 4) : Rl = t === Zs ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, zl = t, Y === null && (Wl = 1, Gs(e, di(t, e.current)));
	}
	function Cu() {
		var e = Ya.current;
		return e === null ? !0 : (X & 4194048) === X ? Xa === null : (X & 62914560) === X || X & 536870912 ? e === Xa : !1;
	}
	function wu() {
		var e = P.H;
		return P.H = Ns, e === null ? Ns : e;
	}
	function Tu() {
		var e = P.A;
		return P.A = Pl, e;
	}
	function Eu() {
		Wl = 4, Bl || (X & 4194048) !== X && Ya.current !== null || (Vl = !0), !(Gl & 134217727) && !(Z & 134217727) || Ll === null || vu(Ll, X, ql, !1);
	}
	function Du(e, t, n) {
		var r = Il;
		Il |= 2;
		var i = wu(), a = Tu();
		(Ll !== e || X !== t) && (tu = null, xu(e, t)), t = !1;
		var o = Wl;
		a: do
			try {
				if (Rl !== 0 && Y !== null) {
					var s = Y, c = zl;
					switch (Rl) {
						case 8:
							bu(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							Ya.current === null && (t = !0);
							var l = Rl;
							if (Rl = 0, zl = null, Nu(e, s, c, l), n && Vl) {
								o = 0;
								break a;
							}
							break;
						default: l = Rl, Rl = 0, zl = null, Nu(e, s, c, l);
					}
				}
				Ou(), o = Wl;
				break;
			} catch (t) {
				Su(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, Bi = zi = null, Il = r, P.H = i, P.A = a, Y === null && (Ll = null, X = 0, qr()), o;
	}
	function Ou() {
		for (; Y !== null;) ju(Y);
	}
	function ku(e, t) {
		var n = Il;
		Il |= 2;
		var r = wu(), i = Tu();
		Ll !== e || X !== t ? (tu = null, eu = be() + 500, xu(e, t)) : Vl = Be(e, t);
		a: do
			try {
				if (Rl !== 0 && Y !== null) {
					t = Y;
					var a = zl;
					b: switch (Rl) {
						case 1:
							Rl = 0, zl = null, Nu(e, t, a, 1);
							break;
						case 2:
						case 9:
							if (va(a)) {
								Rl = 0, zl = null, Mu(t);
								break;
							}
							t = function() {
								Rl !== 2 && Rl !== 9 || Ll !== e || (Rl = 7), nd(e);
							}, a.then(t, t);
							break a;
						case 3:
							Rl = 7;
							break a;
						case 4:
							Rl = 5;
							break a;
						case 7:
							va(a) ? (Rl = 0, zl = null, Mu(t)) : (Rl = 0, zl = null, Nu(e, t, a, 7));
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
											u === null ? Y = null : (Y = u, Pu(u));
										}
										break b;
									}
							}
							Rl = 0, zl = null, Nu(e, t, a, 5);
							break;
						case 6:
							Rl = 0, zl = null, Nu(e, t, a, 6);
							break;
						case 8:
							bu(), Wl = 6;
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
		return Bi = zi = null, P.H = r, P.A = i, Il = n, Y === null ? (Ll = null, X = 0, qr(), Wl) : 0;
	}
	function Au() {
		for (; Y !== null && !ve();) ju(Y);
	}
	function ju(e) {
		var t = Dc(e.alternate, e, Ul);
		e.memoizedProps = e.pendingProps, t === null ? Pu(e) : Y = t;
	}
	function Mu(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = dc(n, t, t.pendingProps, t.type, void 0, X);
				break;
			case 11:
				t = dc(n, t, t.pendingProps, t.type.render, t.ref, X);
				break;
			case 5: Co(t);
			default: Ic(n, t), t = Y = ii(t, Ul), t = Dc(n, t, Ul);
		}
		e.memoizedProps = e.pendingProps, t === null ? Pu(e) : Y = t;
	}
	function Nu(e, t, n, r) {
		Bi = zi = null, Co(t), wa = null, Ta = 0;
		var i = t.return;
		try {
			if (Xs(e, i, t, n, X)) {
				Wl = 1, Gs(e, di(n, e.current)), Y = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw Y = i, t;
			Wl = 1, Gs(e, di(n, e.current)), Y = null;
			return;
		}
		t.flags & 32768 ? (K || r === 1 ? e = !0 : Vl || X & 536870912 ? e = !1 : (Bl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Ya.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Fu(t, e)) : Pu(t);
	}
	function Pu(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				Fu(t, Bl);
				return;
			}
			e = t.return;
			var n = Pc(t.alternate, t, Ul);
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
	function Fu(e, t) {
		do {
			var n = Fc(e.alternate, e);
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
	function Iu(e, t, n, r, i, a, o, c, l) {
		e.cancelPendingCommit = null;
		do
			Bu();
		while (ru !== 0);
		if (Il & 6) throw Error(s(327));
		if (t !== null) {
			if (t === e.current) throw Error(s(177));
			if (a = t.lanes | t.childLanes, a |= Kr, Ge(e, n, a, o, c, l), e === Ll && (Y = Ll = null, X = 0), au = t, iu = e, ou = n, su = a, cu = i, lu = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Yu(we, function() {
				return Vu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = (t.flags & 13878) != 0, t.subtreeFlags & 13878 || r) {
				r = P.T, P.T = null, i = F.p, F.p = 2, o = Il, Il |= 4;
				try {
					tl(e, t, n);
				} finally {
					Il = o, F.p = i, P.T = r;
				}
			}
			ru = 1, Lu(), Ru(), Q();
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
				var i = Il;
				Il |= 4;
				try {
					ml(t, e);
					var a = zd, o = br(e.containerInfo), s = a.focusedElem, c = a.selectionRange;
					if (o !== s && s && s.ownerDocument && yr(s.ownerDocument.documentElement, s)) {
						if (c !== null && xr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = vr(s, h), v = vr(s, g);
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
					Il = i, F.p = r, P.T = n;
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
				var i = Il;
				Il |= 4;
				try {
					nl(e, t.alternate, t);
				} finally {
					Il = i, F.p = r, P.T = n;
				}
			}
			ru = 3;
		}
	}
	function Q() {
		if (ru === 4 || ru === 3) {
			ru = 0, ye();
			var e = iu, t = au, n = ou, r = lu;
			t.subtreeFlags & 10256 || t.flags & 10256 ? ru = 5 : (ru = 0, au = iu = null, zu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (nu = null), Xe(n), t = t.stateNode, W && typeof W.onCommitFiberRoot == "function") try {
				W.onCommitFiberRoot(ke, t, void 0, (t.current.flags & 128) == 128);
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
			ou & 3 && Bu(), nd(e), i = e.pendingLanes, n & 261930 && i & 42 ? e === du ? uu++ : (uu = 0, du = e) : uu = 0, rd(0, !1);
		}
	}
	function zu(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, ta(t)));
	}
	function Bu() {
		return Lu(), Ru(), Q(), Vu();
	}
	function Vu() {
		if (ru !== 5) return !1;
		var e = iu, t = su;
		su = 0;
		var n = Xe(ou), r = P.T, i = F.p;
		try {
			F.p = 32 > n ? 32 : n, P.T = null, n = cu, cu = null;
			var a = iu, o = ou;
			if (ru = 0, au = iu = null, ou = 0, Il & 6) throw Error(s(331));
			var c = Il;
			if (Il |= 4, jl(a.current), Cl(a, a.current, o, n), Il = c, rd(0, !1), W && typeof W.onPostCommitFiberRoot == "function") try {
				W.onPostCommitFiberRoot(ke, a);
			} catch {}
			return !0;
		} finally {
			F.p = i, P.T = r, zu(e, t);
		}
	}
	function Hu(e, t, n) {
		t = di(n, t), t = qs(e.stateNode, t, 2), e = Ia(e, t, 2), e !== null && (We(e, 2), nd(e));
	}
	function Uu(e, t, n) {
		if (e.tag === 3) Hu(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				Hu(t, e, n);
				break;
			} else if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (nu === null || !nu.has(r))) {
					e = di(n, e), n = Js(2), r = Ia(t, n, 2), r !== null && (Ys(n, r, t, e), We(r, 2), nd(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function Wu(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Fl();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (Hl = !0, i.add(n), e = Gu.bind(null, e, t, n), t.then(e, e));
	}
	function Gu(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Ll === e && (X & n) === n && (Wl === 4 || Wl === 3 && (X & 62914560) === X && 300 > be() - Ql ? !(Il & 2) && xu(e, 0) : Kl |= n, Jl === X && (Jl = 0)), nd(e);
	}
	function Ku(e, t) {
		t === 0 && (t = He()), e = Xr(e, t), e !== null && (We(e, t), nd(e));
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
		return ge(e, t);
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
							a = (1 << 31 - je(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
						}
						a !== 0 && (n = !0, cd(r, a));
					} else a = X, a = ze(r, r === Ll ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || Be(r, a) || (n = !0, cd(r, a));
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
		for (var t = be(), n = null, r = Xu; r !== null;) {
			var i = r.next, a = od(r, t);
			a === 0 ? (r.next = null, n === null ? Xu = i : n.next = i, i === null && (Zu = n)) : (n = r, (e !== 0 || a & 3) && ($u = !0)), r = i;
		}
		ru !== 0 && ru !== 5 || rd(e, !1), td !== 0 && (td = 0);
	}
	function od(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - je(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = Ve(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Ll, n = X, n = ze(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Rl === 2 || Rl === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && _e(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || Be(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && _e(r), Xe(n)) {
				case 2:
				case 8:
					n = Ce;
					break;
				case 32:
					n = we;
					break;
				case 268435456:
					n = Ee;
					break;
				default: n = we;
			}
			return r = sd.bind(null, e), n = ge(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && _e(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function sd(e, t) {
		if (ru !== 0 && ru !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Bu() && e.callbackNode !== n) return null;
		var r = X;
		return r = ze(e, e === Ll ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (hu(e, r, t), od(e, be()), e.callbackNode != null && e.callbackNode === n ? sd.bind(null, e) : null);
	}
	function cd(e, t) {
		if (Bu()) return null;
		hu(e, t, !0);
	}
	function ld() {
		Yd(function() {
			Il & 6 ? ge(Se, id) : ad();
		});
	}
	function ud() {
		if (td === 0) {
			var e = ia;
			e === 0 && (e = Fe, Fe <<= 1, !(Fe & 261888) && (Fe = 256)), td = e;
		}
		return td;
	}
	function dd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Kt("" + e);
	}
	function fd(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function pd(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = dd((i[tt] || null).action), o = r.submitter;
			o && (t = (t = o[tt] || null) ? dd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new hn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (td !== 0) {
								var e = o ? fd(i, o) : new FormData(i);
								ys(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = o ? fd(i, o) : new FormData(i), ys(n, {
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
	for (var md = 0; md < Vr.length; md++) {
		var hd = Vr[md];
		Hr(hd.toLowerCase(), "on" + (hd[0].toUpperCase() + hd.slice(1)));
	}
	Hr(Nr, "onAnimationEnd"), Hr(Pr, "onAnimationIteration"), Hr(Fr, "onAnimationStart"), Hr("dblclick", "onDoubleClick"), Hr("focusin", "onFocus"), Hr("focusout", "onBlur"), Hr(Ir, "onTransitionRun"), Hr(Lr, "onTransitionStart"), Hr(Rr, "onTransitionCancel"), Hr(zr, "onTransitionEnd"), _t("onMouseEnter", ["mouseout", "mouseover"]), _t("onMouseLeave", ["mouseout", "mouseover"]), _t("onPointerEnter", ["pointerout", "pointerover"]), _t("onPointerLeave", ["pointerout", "pointerover"]), gt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), gt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), gt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), gt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), gt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), gt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
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
						Ur(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Ur(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function $(e, t) {
		var n = t[rt];
		n === void 0 && (n = t[rt] = /* @__PURE__ */ new Set());
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
			e[bd] = !0, mt.forEach(function(t) {
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
		n = i.bind(null, t, n, e), i = void 0, !rn || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
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
					if (o = lt(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6 || c === 26 || c === 27) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		en(function() {
			var r = a, i = Yt(n), o = [];
			a: {
				var s = Br.get(e);
				if (s !== void 0) {
					var c = hn, u = e;
					switch (e) {
						case "keypress": if (un(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = Mn;
							break;
						case "focusin":
							u = "focus", c = wn;
							break;
						case "focusout":
							u = "blur", c = wn;
							break;
						case "beforeblur":
						case "afterblur":
							c = wn;
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
							c = Sn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = Cn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = Pn;
							break;
						case Nr:
						case Pr:
						case Fr:
							c = Tn;
							break;
						case zr:
							c = Fn;
							break;
						case "scroll":
						case "scrollend":
							c = _n;
							break;
						case "wheel":
							c = In;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = En;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							c = Nn;
							break;
						case "toggle":
						case "beforetoggle": c = Ln;
					}
					var d = (t & 4) != 0, f = !d && (e === "scroll" || e === "scrollend"), p = d ? s === null ? null : s + "Capture" : s;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = tn(m, p), g != null && d.push(wd(m, g, h))), f) break;
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
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== Jt && (u = n.relatedTarget || n.fromElement) && (lt(u) || u[nt])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (u = n.relatedTarget || n.toElement, c = r, u = u ? lt(u) : null, u !== null && (f = l(u), d = u.tag, u !== f || d !== 5 && d !== 27 && d !== 6) && (u = null)) : (c = null, u = r), c !== u)) {
						if (d = Sn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = Nn, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? s : dt(c), h = u == null ? s : dt(u), s = new d(g, m + "leave", c, n, i), s.target = f, s.relatedTarget = h, g = null, lt(i) === r && (d = new d(p, m + "enter", u, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, c && u) b: {
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
					if (s = r ? dt(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var v = rr;
					else if (Zn(s)) if (ir) v = pr;
					else {
						v = dr;
						var y = ur;
					}
					else c = s.nodeName, !c || c.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? r && Ut(r.elementType) && (v = rr) : v = fr;
					if (v &&= v(e, r)) {
						Qn(o, v, n, i);
						break a;
					}
					y && y(e, s, r), e === "focusout" && r && s.type === "number" && r.memoizedProps.value != null && Ft(s, "number", s.value);
				}
				switch (y = r ? dt(r) : window, e) {
					case "focusin":
						(Zn(y) || y.contentEditable === "true") && (Cr = y, wr = r, Tr = null);
						break;
					case "focusout":
						Tr = wr = Cr = null;
						break;
					case "mousedown":
						Er = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						Er = !1, Dr(o, n, i);
						break;
					case "selectionchange": if (Sr) break;
					case "keydown":
					case "keyup": Dr(o, n, i);
				}
				var b;
				if (zn) b: {
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
				else qn ? Gn(e, n) && (x = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (x = "onCompositionStart");
				x && (Hn && n.locale !== "ko" && (qn || x !== "onCompositionStart" ? x === "onCompositionEnd" && qn && (b = ln()) : (on = i, sn = "value" in on ? on.value : on.textContent, qn = !0)), y = Td(r, x), 0 < y.length && (x = new Dn(x, e, null, n, i), o.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = Kn(n), b !== null && (x.data = b)))), (b = Vn ? Jn(e, n) : Yn(e, n)) && (x = Td(r, "onBeforeInput"), 0 < x.length && (y = new Dn("onBeforeInput", "beforeinput", null, n, i), o.push({
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
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = tn(e, n), i != null && r.unshift(wd(e, i, a)), i = tn(e, t), i != null && r.push(wd(e, i, a))), e.tag === 3) return r;
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
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = tn(n, a), l != null && o.unshift(wd(n, l, c))) : i || (l = tn(n, a), l != null && o.push(wd(n, l, c)))), n = n.return;
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
				typeof r == "string" ? t === "body" || t === "textarea" && r === "" || zt(e, r) : (typeof r == "number" || typeof r == "bigint") && t !== "body" && zt(e, "" + r);
				break;
			case "className":
				Ct(e, "class", r);
				break;
			case "tabIndex":
				Ct(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				Ct(e, n, r);
				break;
			case "style":
				Ht(e, r, a);
				break;
			case "data": if (t !== "object") {
				Ct(e, "data", r);
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
				r = Kt("" + r), e.setAttribute(n, r);
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
				r = Kt("" + r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = qt);
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
				n = Kt("" + r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
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
				$("beforetoggle", e), $("toggle", e), St(e, "popover", r);
				break;
			case "xlinkActuate":
				wt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				wt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				wt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				wt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				wt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				wt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				wt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				wt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				wt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				St(e, "is", r);
				break;
			case "innerText":
			case "textContent": break;
			default: (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = Wt.get(n) || n, St(e, n, r));
		}
	}
	function Nd(e, t, n, r, i, a) {
		switch (n) {
			case "style":
				Ht(e, r, a);
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
				typeof r == "string" ? zt(e, r) : (typeof r == "number" || typeof r == "bigint") && zt(e, "" + r);
				break;
			case "onScroll":
				r != null && $("scroll", e);
				break;
			case "onScrollEnd":
				r != null && $("scrollend", e);
				break;
			case "onClick":
				r != null && (e.onclick = qt);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": break;
			case "innerText":
			case "textContent": break;
			default: if (!ht.hasOwnProperty(n)) a: {
				if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), a = e[tt] || null, a = a == null ? null : a[n], typeof a == "function" && e.removeEventListener(t, a, i), typeof r == "function")) {
					typeof a != "function" && a !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, i);
					break a;
				}
				n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : St(e, n, r);
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
				Pt(e, a, c, l, u, o, i, !1);
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
				t = a, n = o, e.multiple = !!r, t == null ? n != null && It(e, !!r, n, !0) : It(e, !!r, t, !1);
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
				Rt(e, r, i, a);
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
			default: if (Ut(t)) {
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
				Nt(e, o, c, l, u, d, a, i);
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
				t = c, n = o, r = m, p == null ? !!r != !!n && (t == null ? It(e, !!n, n ? [] : "", !1) : It(e, !!n, t, !0)) : It(e, !!n, p, !1);
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
				Lt(e, p, m);
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
			default: if (Ut(t)) {
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
					a[st] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
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
					ef(n), ct(n);
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
			else if (!e[st]) switch (t) {
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
		ct(e);
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
		var e = _f.f(), t = yu();
		return e || t;
	}
	function yf(e) {
		var t = ut(e);
		t !== null && t.tag === 5 && t.type === "form" ? xs(t) : _f.r(e);
	}
	var bf = typeof document > "u" ? null : document;
	function xf(e, t, n) {
		var r = bf;
		if (r && typeof t == "string" && t) {
			var i = Mt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), hf.has(i) || (hf.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), Pd(t, "link", e), pt(t), r.head.appendChild(t)));
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
			var i = "link[rel=\"preload\"][as=\"" + Mt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + Mt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + Mt(n.imageSizes) + "\"]")) : i += "[href=\"" + Mt(e) + "\"]";
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
			}, n), mf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(jf(a)) || t === "script" && r.querySelector(Ff(a)) || (t = r.createElement("link"), Pd(t, "link", e), pt(t), r.head.appendChild(t)));
		}
	}
	function Tf(e, t) {
		_f.m(e, t);
		var n = bf;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + Mt(r) + "\"][href=\"" + Mt(e) + "\"]", a = i;
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
				r = n.createElement("link"), Pd(r, "link", e), pt(r), n.head.appendChild(r);
			}
		}
	}
	function Ef(e, t, n) {
		_f.S(e, t, n);
		var r = bf;
		if (r && e) {
			var i = ft(r).hoistableStyles, a = Af(e);
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
					pt(c), Pd(c, "link", e), c._p = new Promise(function(e, t) {
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
			var r = ft(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
				src: e,
				async: !0
			}, t), (t = mf.get(i)) && zf(e, t), a = n.createElement("script"), pt(a), Pd(a, "link", e), n.head.appendChild(a)), a = {
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
			var r = ft(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = mf.get(i)) && zf(e, t), a = n.createElement("script"), pt(a), Pd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function kf(e, t, n, r) {
		var i = (i = ie.current) ? gf(i) : null;
		if (!i) throw Error(s(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = Af(n.href), n = ft(i).hoistableStyles, r = n.get(t), r || (r = {
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
					var a = ft(i).hoistableStyles, o = a.get(e);
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
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Pf(n), n = ft(i).hoistableScripts, r = n.get(t), r || (r = {
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
		return "href=\"" + Mt(e) + "\"";
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
		}), Pd(t, "link", n), pt(t), e.head.appendChild(t));
	}
	function Pf(e) {
		return "[src=\"" + Mt(e) + "\"]";
	}
	function Ff(e) {
		return "script[async]" + e;
	}
	function If(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + Mt(n.href) + "\"]");
				if (r) return t.instance = r, pt(r), r;
				var i = h({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), pt(r), Pd(r, "style", i), Lf(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = Af(n.href);
				var a = e.querySelector(jf(i));
				if (a) return t.state.loading |= 4, t.instance = a, pt(a), a;
				r = Mf(n), (i = mf.get(i)) && Rf(r, i), a = (e.ownerDocument || e).createElement("link"), pt(a);
				var o = a;
				return o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Pd(a, "link", r), t.state.loading |= 4, Lf(a, n.precedence, e), t.instance = a;
			case "script": return a = Pf(n.src), (i = e.querySelector(Ff(a))) ? (t.instance = i, pt(i), i) : (r = n, (i = mf.get(a)) && (r = h({}, n), zf(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), pt(i), Pd(i, "link", r), e.head.appendChild(i), t.instance = i);
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
			if (!(a[st] || a[et] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
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
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Jf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, pt(a);
					return;
				}
				a = t.ownerDocument || t, r = Mf(r), (i = mf.get(i)) && Rf(r, i), a = a.createElement("link"), pt(a);
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
		_currentValue: I,
		_currentValue2: I,
		_threadCount: 0
	};
	function $f(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Ue(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ue(0), this.hiddenUpdates = Ue(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function ep(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new $f(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = ti(3, null, null, t), e.current = a, a.stateNode = e, t = ea(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, Na(a), e;
	}
	function tp(e) {
		return e ? (e = $r, e) : $r;
	}
	function np(e, t, n, r, i, a) {
		i = tp(i), r.context === null ? r.context = i : r.pendingContext = i, r = Fa(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = Ia(e, r, t), n !== null && (mu(n, e, t), La(n, e, t));
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
			var t = Xr(e, 67108864);
			t !== null && mu(t, e, 67108864), ip(e, 67108864);
		}
	}
	function op(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = fu();
			t = Ye(t);
			var n = Xr(e, t);
			n !== null && mu(n, e, t), ip(e, t);
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
					var a = ut(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = Re(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - je(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									nd(a), !(Il & 6) && (eu = be() + 500, rd(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Xr(a, 2), s !== null && mu(s, a, 2), yu(), ip(a, 2);
					}
					if (a = dp(r), a === null && Cd(e, t, r, fp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Cd(e, t, r, null, n);
		}
	}
	function dp(e) {
		return e = Yt(e), pp(e);
	}
	var fp = null;
	function pp(e) {
		if (fp = null, e = lt(e), e !== null) {
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
			case "message": switch (xe()) {
				case Se: return 2;
				case Ce: return 8;
				case we:
				case Te: return 32;
				case Ee: return 268435456;
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
		}, t !== null && (t = ut(t), t !== null && ap(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
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
		var t = lt(e.target);
		if (t !== null) {
			var n = l(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = u(n), t !== null) {
						e.blockedOn = t, Qe(e.priority, function() {
							op(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = d(n), t !== null) {
						e.blockedOn = t, Qe(e.priority, function() {
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
				Jt = r, n.target.dispatchEvent(r), Jt = null;
			} else return t = ut(n), t !== null && ap(t), e.blockedOn = n, !1;
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
				var a = ut(n);
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
			var i = n[r], a = n[r + 1], o = i[tt] || null;
			if (typeof a == "function") o || Mp(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[tt] || null) s = o.formAction;
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
			np(e.current, 2, null, e, null, null), yu(), t[nt] = null;
		}
	};
	function Ip(e) {
		this._internalRoot = e;
	}
	Ip.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = Ze();
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
			ke = zp.inject(Rp), W = zp;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!c(e)) throw Error(s(299));
		var n = !1, r = "", i = Hs, a = Us, o = Ws;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = ep(e, 1, !1, null, null, n, r, null, i, a, o, Pp), e[nt] = t.current, xd(e), new Fp(t);
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
	let [m, h] = (0, l.useState)(!1), g = o, _ = g?.mode === "play", v = g?.mode === "draw-select", y = g?.mode === "peek", b = g?.isMyTurn === !0, x = !g?.legalPlayIndices || g.legalPlayIndices.includes(t), S = _ && b && x && !g?.busy, E = _ && !b && !!g?.allowPlayPreselect && x && !g?.busy, D = g?.playingIndex === t, O = _ && b && !x && !g?.busy && !D, k = v && r === "draw-selected", A = v && r === "draw-recommended", j = r === "play-recommended", M = !!g?.busy || D || _ && !b && !E || v && !b, ee = M || _ && !x && !E || v && !b, { handlers: N, suppressNextClickRef: te } = T({
		disabled: M || !S && !E && !v && !y && !O,
		mode: O ? "draw-select" : g?.mode ?? "none",
		onPlay: S || E ? () => g?.onPlayCard?.(t) : void 0,
		onSelect: v && b ? () => g?.onSelectCard?.(t) : O ? () => g?.onIllegalPlay?.(t) : void 0,
		onPeekStart: y ? () => c?.(t) : void 0,
		onPeekEnd: y ? () => c?.(null) : void 0,
		onPressChange: h
	}), P = !!g && (g?.mode !== "none" || O), F = _ && b ? S ? a : "play-button-disabled" : a;
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
			onClick: !P && s ? () => s(e, t) : void 0,
			onPlayClick: P && (S || E) ? () => g?.onPlayCard?.(t) : void 0,
			suppressNextClickRef: P ? te : void 0,
			pointerHandlers: P ? N : void 0,
			pressed: m,
			playing: D,
			playable: S,
			illegalShake: g?.illegalShakeIndex === t,
			illegalFlash: g?.illegalFlashIndex === t,
			showPlayableHint: g?.showPlayableHint !== !1,
			disabled: M && (_ || v) && !O,
			"data-testid": F,
			"data-card-index": t,
			"data-playable": _ ? S ? "true" : "false" : void 0
		})
	});
}
function N({ cards: e, size: t = "md", stateFor: n, badgeFor: r, onCardClick: i, onCardPeek: a, peekIndex: o = null, fan: s = !1, cardTestId: c, cardInteraction: u, slotClassFor: d, dealSeatPlayerId: f = null }) {
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
}, re = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, ie, ae, H, oe = 1e8, U = 1 / oe, se = Math.PI * 2, ce = se / 4, le = 0, ue = Math.sqrt, de = Math.cos, fe = Math.sin, pe = function(e) {
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
}, xe = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, Se = Array.isArray, Ce = /(?:-?\.?\d|\.)+/gi, we = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, Te = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, Ee = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, De = /[+-]=-?[.\d]+/, Oe = /[^,'"\[\]\s]+/gi, ke = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, W, Ae, je, Me, Ne = {}, Pe = {}, Fe, Ie = function(e) {
	return (Pe = pt(e, Ne)) && Nr;
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
	Ge.length && !ae && st(), e.render(t, n, r || ae && t < 0 && (e._initted || e._startAt)), Ge.length && !ae && st();
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
	var t = e.parent || W, n = e.keyframes ? ft(Se(e.keyframes)) : dt;
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
	return e._startAt && (ae ? e._startAt.revert(He) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
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
	return e._end = it(e._start + (e._tDur / Math.abs(e._ts || e._rts || U) || 0));
}, kt = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = it(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), Ot(e), n._dirty || xt(n, e)), e;
}, At = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = Dt(e.rawTime(), t), (!t._dur || Wt(0, t.totalDuration(), n) - t._tTime > U) && t.render(n, !0)), xt(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -U;
	}
}, jt = function(e, t, n, r) {
	return t.parent && bt(t), t._start = it((he(n) ? n : n || e !== W ? Vt(e, n, t) : e._time) + t._delay), t._end = it(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), vt(e, t, "_first", "_last", e._sort ? "_start" : 0), Ft(t) || (e._recent = t), r || At(e, t), e._ts < 0 && kt(e, e._tTime), e;
}, Mt = function(e, t) {
	return (Ne.ScrollTrigger || Le("scrollTrigger", t)) && Ne.ScrollTrigger.create(t, e);
}, Nt = function(e, t, n, r, i) {
	if (Qn(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !ae && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && qe !== kn.frame) return Ge.push(e), e._lazy = [i, r], 1;
}, Pt = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, Ft = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, It = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && Pt(e) && !(!e._initted && Ft(e)) || (e._ts < 0 || e._dp._ts < 0) && !Ft(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = Wt(0, e._tDur, t), l = Et(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== Et(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || ae || r || e._zTime === U || !t && e._zTime) {
		if (!e._initted && Nt(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? U : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && Ct(e, t, n, !0), e._onUpdate && !n && mn(e, "onUpdate"), s && e._repeat && !n && e.parent && mn(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && bt(e, 1), !n && !ae && (mn(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
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
	return e && _e(e) && "length" in e && (!t && !e.length || e.length - 1 in e && _e(e[0])) && !e.nodeType && e !== Ae;
}, Yt = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return pe(e) && !t || Jt(e, 1) ? (r = n).push.apply(r, Xt(e)) : n.push(e);
	}) || n;
}, Xt = function(e, t, n) {
	return H && !t && H.selector ? H.selector(e) : pe(e) && !n && (je || !An()) ? qt.call((t || Me).querySelectorAll(e), 0) : Se(e) ? Yt(e, n) : Jt(e) ? qt.call(e, 0) : e ? [e] : [];
}, Zt = function(e) {
	return e = Xt(e)[0] || Re("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return Xt(t, n.querySelectorAll ? n : n === e ? Re("Invalid scope") || Me.createElement("div") : e);
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
	var r = e.vars, i = r[t], a = H, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && Ge.length && st(), o && (H = o), l = s ? i.apply(c, s) : i.call(c), H = a, l;
}, hn = function(e) {
	return bt(e), e.scrollTrigger && e.scrollTrigger.kill(!!ae), e.progress() < 1 && mn(e, "onInterrupt"), e;
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
			Fe && (!je && ye() && (Ae = je = window, Me = Ae.document || {}, Ne.gsap = Nr, (Ae.gsapVersions ||= []).push(Nr.version), Ie(Pe || Ae.GreenSockGlobals || !Ae.gsap && Ae || {}), _n.forEach(vn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
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
}, G = {}, jn = /^[\d.\-M][\d.\-,\s]/, Mn = /["']/g, Nn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(Mn, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, Pn = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, Fn = function(e) {
	var t = (e + "").split("("), n = G[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [Nn(t[1])] : Pn(e).split(",").map(lt)) : G._CE && jn.test(e) ? G._CE("", e) : n;
}, In = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, Ln = function e(t, n) {
	for (var r = t._first, i; r;) r instanceof Gn ? e(r, n) : r.vars.yoyoEase && (!r._yoyo || !r._repeat) && r._yoyo !== n && (r.timeline ? e(r.timeline, n) : (i = r._ease, r._ease = r._yEase, r._yEase = i, r._yoyo = n)), r = r._next;
}, Rn = function(e, t) {
	return e && (me(e) ? e : G[e] || Fn(e)) || t;
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
		for (var t in G[e] = Ne[e] = i, G[a = e.toLowerCase()] = n, i) G[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = G[e + "." + t] = i[t];
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
}), G.Linear.easeNone = G.none = G.Linear.easeIn, zn("Elastic", Vn("in"), Vn("out"), Vn()), (function(e, t) {
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
}), zn("Back", Hn("in"), Hn("out"), Hn()), G.SteppedEase = G.steps = Ne.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - U;
	return function(e) {
		return ((r * Wt(0, a, e) | 0) + i) * n;
	};
} }, re.ease = G["quad.out"], nt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return Qe += e + "," + e + "Params,";
});
var Un = function(e, t) {
	this.id = le++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : tt, this.set = t ? t.getSetter : ur;
}, Wn = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, Rt(this, +e.duration, 1, 1), this.data = e.data, H && (this._ctx = H, H.data.push(this)), On || kn.wake();
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
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === U || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), ct(this, e, t)), this;
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
		if (!arguments.length) return this._rts === -U ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? Dt(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -U ? 0 : this._rts, this.totalTime(Wt(-Math.abs(this._delay), this._tDur, n), t !== !1), Ot(this), St(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (An(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== U && (this._tTime -= U)))), this) : this._ps;
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
		var t = ae;
		return ae = e, (this._initted || this._startAt) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), ae = t, this;
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
		return this.play().totalTime(e ? -this._delay : 0, ve(t)), this._dur || (this._zTime = -U), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -U : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -U, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - U);
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
	_zTime: -U,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var Gn = /*#__PURE__*/ function(e) {
	B(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = ve(t.sortChildren), W && jt(t.parent || W, z(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && Mt(z(r), t.scrollTrigger), r;
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
		if (this !== W && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
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
						m = 0, u && (o += this._zTime = -U);
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
							m = 0, u && (o += this._zTime = S ? -U : U);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -U)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, Ot(this), this.render(e, t, n);
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
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || U,
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
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + U);
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
			Rt(n, n === W && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (W._ts && (ct(W, Dt(e, W)), qe = kn.frame), kn.frame >= Xe) {
			Xe += V.autoSleep || 120;
			var t = W._first;
			if ((!t || !t._ts) && V.autoSleep && kn._listeners.length < 2) {
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
	if (pe(r) && (~r.indexOf("random(") && (r = un(r)), r.charAt(1) === "=" && (p = at(d, r) + (Gt(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || Zn) return !isNaN(d * r) && r !== "" ? (p = new yr(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? fr : dr, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && Le(t, r), Kn.call(this, e, t, d, r, f, s || V.stringFilter, c));
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
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !ie, b = t.timeline, x, S, C, w, T, E, D, O, k, A, j, M, ee;
	if (b && (!f || !a) && (a = "none"), t._ease = Rn(a, re.ease), t._yEase = d ? In(Rn(d === !0 ? a : d, re.ease)) : 0, d && t._yoyo && !t._repeat && (d = t._yEase, t._yEase = t._ease, t._ease = d), t._from = !b && !!i.runBackwards, !b || f && !i.stagger) {
		if (O = g[0] ? et(g[0]).harness : 0, M = O && i[O.prop], x = ht(i, We), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? He : Ve), h._lazy = 0), o) {
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
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (ae || !s && !p) && t._startAt.revert(He), s && m && n <= 0 && r <= 0) {
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
			}, x), M && (C[O.prop] = M), bt(t._startAt = ar.set(g, C)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (ae ? t._startAt.revert(He) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, U, U);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && ve(c) || c && !m, S = 0; S < g.length; S++) {
			if (T = g[S], D = T._gsap || $e(g)[S]._gsap, t._ptLookup[S] = A = {}, Ke[D.id] && Ge.length && st(), j = v === g ? S : v.indexOf(T), O && (k = new O()).init(T, M || x, t, j, v) !== !1 && (t._pt = w = new yr(t._pt, T, k.name, 0, 1, k.render, k, 0, k.priority), k._props.forEach(function(e) {
				A[e] = w;
			}), k.priority && (E = 1)), !O || M) for (C in x) Je[C] && (k = Yn(C, x, t, j, T, v)) ? k.priority && (E = 1) : A[C] = w = qn.call(t, T, C, "get", x[C], j, v, 0, i.stringFilter);
			t._op && t._op[S] && t.kill(T, t._op[S]), y && t._pt && (Xn = t, W.killTweensOf(T, A, t.globalTime(n)), ee = !t.parent, Xn = 0), t._pt && c && (Ke[D.id] = 1);
		}
		E && vr(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !ee, f && n <= 0 && b.render(oe, !0, !0);
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
	B(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : gt(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = o.yoyoEase, g = n.parent || W, _ = (Se(t) || xe(t) ? he(t[0]) : "length" in n) ? [t] : Xt(t), v, y, b, x, S, C, w, T;
		if (a._targets = _.length ? $e(_) : Re("GSAP target " + t + " not found. https://gsap.com", !V.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || be(s) || be(c)) {
			if (n = a.vars, v = a.timeline = new Gn({
				data: "nested",
				defaults: p || {},
				targets: g && g.data === "nested" ? g.vars.targets : _
			}), v.kill(), v.parent = v._dp = z(a), v._start = 0, u || be(s) || be(c)) {
				if (x = _.length, w = u && $t(u), _e(u)) for (S in u) ~rr.indexOf(S) && (T ||= {}, T[S] = u[S]);
				for (y = 0; y < x; y++) b = ht(n, ir), b.stagger = 0, h && (b.yoyoEase = h), T && pt(b, T), C = _[y], b.duration = +nr(s, z(a), y, C, _), b.delay = (+nr(c, z(a), y, C, _) || 0) - a._delay, !u && x === 1 && b.delay && (a._delay = c = b.delay, a._start += c, b.delay = 0), v.to(C, b, w ? w(y, C, _) : 0), v._ease = G.none;
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
		return d === !0 && !ie && (Xn = z(a), W.killTweensOf(_), Xn = 0), jt(g, z(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === it(g._time) && ve(l) && wt(z(a)) && g.data !== "nested") && (a._tTime = -U, a.render(Math.max(0, -c) || 0)), m && Mt(z(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - U && !o ? i : e < U ? 0 : e, c, l, u, d, f, p, m, h, g;
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
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? hn(this) : this.scrollTrigger && this.scrollTrigger.kill(!!ae), this;
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
		return W.killTweensOf(e, t, n);
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
}), Ne.TweenMax = Ne.TweenLite = ar, Ne.TimelineLite = Ne.TimelineMax = Gn, W = new Gn({
	sortChildren: !1,
	defaults: re,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), V.stringFilter = Dn;
var br = [], xr = {}, Sr = [], Cr = 0, wr = 0, Tr = function(e) {
	return (xr[e] || Sr).map(function(e) {
		return e();
	});
}, Er = function() {
	var e = Date.now(), t = [];
	e - Cr > 2 && (Tr("matchMediaInit"), br.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = Ae.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
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
			var e = H, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = Zt(n)), H = r, a = t.apply(r, arguments), me(a) && r._r.push(a), H = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === me ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = H;
		H = null, e(this), H = t;
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
		this.contexts = [], this.scope = e, H && H.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		_e(e) || (e = { matches: e });
		var r = new Dr(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in H && !r.selector && (r.selector = H.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = Ae.matchMedia(e[o]), a && (br.indexOf(r) < 0 && br.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(Er) : a.addEventListener("change", Er)));
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
		return W.getTweensOf(e, t);
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
		return W.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = Rn(e.ease, re.ease)), mt(re, e || {});
	},
	config: function(e) {
		return mt(V, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !Je[e] && !Ne[e] && Re(t + " effect requires " + e + " plugin.");
		}), Ye[t] = function(e, t, r) {
			return n(Xt(e), dt(t || {}, i), r);
		}, a && (Gn.prototype[t] = function(e, n, r) {
			return this.add(Ye[t](e, _e(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		G[e] = Rn(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? Rn(e, t) : G;
	},
	getById: function(e) {
		return W.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new Gn(e), r, i;
		for (n.smoothChildTiming = ve(e.smoothChildTiming), W.remove(n), n._dp = 0, n._time = n._tTime = W._time, r = W._first; r;) i = r._next, (t || !(!r._dur && r instanceof ar && r.vars.onComplete === r._targets[0])) && jt(n, r, r._start - r._delay), r = i;
		return jt(W, n, 0), n;
	},
	context: function(e, t) {
		return e ? new Dr(e, t) : H;
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
	globalTimeline: W,
	core: {
		PropTween: yr,
		globals: ze,
		Tween: ar,
		Timeline: Gn,
		Animation: Wn,
		getCache: et,
		_removeLinkedListItem: yt,
		reverting: function() {
			return ae;
		},
		context: function(e) {
			return e && H && (H.data.push(e), e._ctx = H), H;
		},
		suppressOverwrites: function(e) {
			return ie = e;
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
		for (var n = t._pt; n;) ae ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, Mr("roundProps", en), Mr("modifiers"), Mr("snap", tn)) || kr;
ar.version = Gn.version = Nr.version = "3.12.7", Fe = 1, ye() && An(), G.Power0, G.Power1, G.Power2, G.Power3, G.Power4, G.Linear, G.Quad, G.Cubic, G.Quart, G.Quint, G.Strong, G.Elastic, G.Back, G.SteppedEase, G.Bounce, G.Sine, G.Expo, G.Circ;
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
}, K = {
	grid: 1,
	flex: 1
}, Oi = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = Rr.style, c = Jr.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || Di[i] || Di[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && wi(t), (p || o === "%") && (Hr[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], rt(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === Fr || !h.appendChild) && (h = Fr.body), g = h._gsap, g && p && g.width && c && g.time === kn.time && !g.uncache) return rt(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : Ti(t, n);
	} else (p || o === "%") && !K[_i(h, "display")] && (s.position = _i(t, "position")), h === t && (s.position = "static"), h.appendChild(Rr), m = Rr[u], h.removeChild(Rr), s.position = "absolute";
	return c && p && (g = et(h), g.time = kn.time, g.width = h[u]), rt(f ? m * a / d : m && a ? d / m * a : 0);
}, ki = function(e, t, n, r) {
	var i;
	return Lr || bi(), t in Xr && t !== "transform" && (t = Xr[t], ~t.indexOf(",") && (t = t.split(",")[0])), Hr[t] && t !== "transform" ? (i = Vi(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : Hi(_i(e, ui)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = Pi[t] && Pi[t](e, t, n) || _i(e, t) || tt(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? Oi(e, t, i, n) + n : i;
}, Ai = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = yi(t, e, 1), a = i && _i(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = _i(e, "borderTopColor"));
	}
	var o = new yr(this._pt, e.style, t, 0, 1, pr), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r === "auto" && (m = e.style[t], e.style[t] = r, r = _i(e, t) || r, m ? e.style[t] = m : Ti(e, t)), l = [n, r], Dn(l), n = l[0], r = l[1], d = n.match(Te) || [], b = r.match(Te) || [], b.length) {
		for (; u = Te.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = at(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = Te.lastIndex - v.length, v || (v = v || V.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = Oi(e, t, m, v) || 0), o._pt = {
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
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = _i(e, ui) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, A, j, M, ee, N, te, P, F, I, ne, L;
	return n.svg = !!(e.getCTM && wi(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[li] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[li] === "none" ? "" : s[li])), r.scale = r.rotate = r.translate = "none"), S = zi(e, n.svg), n.svg && (n.uncache ? (ee = e.getBBox(), c = n.xOrigin - ee.x + "px " + (n.yOrigin - ee.y) + "px", M = "") : M = !t && e.getAttribute("data-svg-origin"), Bi(e, M || c, !!M || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== Fi && (E = S[0], D = S[1], O = S[2], k = S[3], l = A = S[4], u = j = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? Gr(D, E) * Ur : 0, _ = O || k ? Gr(O, k) * Ur + m : 0, _ && (p *= Math.abs(Math.cos(_ * Wr))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (L = S[6], I = S[7], te = S[8], P = S[9], F = S[10], ne = S[11], l = S[12], u = S[13], d = S[14], C = Gr(L, F), h = C * Ur, C && (w = Math.cos(-C), T = Math.sin(-C), M = A * w + te * T, ee = j * w + P * T, N = L * w + F * T, te = A * -T + te * w, P = j * -T + P * w, F = L * -T + F * w, ne = I * -T + ne * w, A = M, j = ee, L = N), C = Gr(-O, F), g = C * Ur, C && (w = Math.cos(-C), T = Math.sin(-C), M = E * w - te * T, ee = D * w - P * T, N = O * w - F * T, ne = k * T + ne * w, E = M, D = ee, O = N), C = Gr(D, E), m = C * Ur, C && (w = Math.cos(C), T = Math.sin(C), M = E * w + D * T, ee = A * w + j * T, D = D * w - E * T, j = j * w - A * T, E = M, A = ee), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = rt(Math.sqrt(E * E + D * D + O * O)), p = rt(Math.sqrt(j * j + L * L)), C = Gr(A, j), _ = Math.abs(C) > 2e-4 ? C * Ur : 0, y = ne ? 1 / (ne < 0 ? -ne : ne) : 0), n.svg && (M = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !Li(_i(e, li)), M && e.setAttribute("transform", M))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = rt(f), n.scaleY = rt(p), n.rotation = rt(m) + o, n.rotationX = rt(h) + o, n.rotationY = rt(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[ui] = Hi(c)), n.xOffset = n.yOffset = 0, n.force3D = V.force3D, n.renderTransform = n.svg ? Yi : hi ? Ji : Wi, n.uncache = 0, n;
}, Hi = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, Ui = function(e, t, n) {
	var r = Gt(t);
	return rt(parseFloat(t) + parseFloat(Oi(e, "x", n + "px", r))) + r;
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
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= Wr, c *= Wr, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= Wr, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = rt(b), x = rt(x), S = rt(S), C = rt(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = Oi(f, "x", a, "px"), y = Oi(f, "y", o, "px")), (p || m || h || g) && (v = rt(v + p - (p * b + m * S) + h), y = rt(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = rt(v + r / 100 * w.width), y = rt(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[li] = w);
}, Xi = function(e, t, n, r, i) {
	var a = 360, o = pe(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? Ur : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * Kr) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * Kr) % a - ~~(s / a) * a)), e._pt = u = new yr(e._pt, t, n, r, s, Qr), u.e = c, u.u = "deg", e._props.push(n), u;
}, Zi = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, Qi = function(e, t, n) {
	var r = Zi({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[li] = t, o = Vi(n, 1), Ti(n, li), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[li], a[li] = t, o = Vi(n, 1), a[li] = c), Hr) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = Gt(c), p = Gt(l), u = f === p ? parseFloat(c) : Oi(n, s, c, p), d = parseFloat(l), e._pt = new yr(e._pt, o, s, u, d - u, Zr), e._pt.u = p || 0, e._props.push(s));
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
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", Tn.lastIndex = 0, Tn.test(c) || (h = Gt(c), g = Gt(l)), g ? h !== g && (c = Oi(e, m, c, g) + g) : h && (l += h), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], pe(c) && ~c.indexOf("random(") && (c = un(c)), Gt(c + "") || c === "auto" || (c += V.units[m] || Gt(ki(e, m)) || ""), (c + "").charAt(1) === "=" && (c = ki(e, m))) : c = ki(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in Xr && (m === "autoAlpha" && (d === 1 && ki(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), Ei(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = Xr[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Hr, v) {
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
				if (v || (u || u === 0) && (d || d === 0) && !Yr.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = Gt(l) || (m in V.units ? V.units[m] : h), h !== g && (d = Oi(e, m, c, g)), this._pt = new yr(this._pt, v ? b : o, m, d, (_ ? at(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? ei : Zr), this._pt.u = g || 0, h !== g && g !== "%" && (this._pt.b = c, this._pt.r = $r);
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
		V.units[e] = "deg", Ii[e] = 1;
	}), Xr[i[13]] = e + "," + t, nt(r, function(e) {
		var t = e.split(":");
		Xr[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), nt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	V.units[e] = "px";
}), Nr.registerPlugin($i);
//#endregion
//#region node_modules/gsap/index.js
var q = Nr.registerPlugin($i) || Nr;
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
function Sa(e, t) {
	return ba.get(e)?.kill(), ba.set(e, t), t;
}
function Ca(e) {
	e && (ba.get(e)?.kill(), ba.delete(e), q.killTweensOf(e), q.set(e, { clearProps: "transform,opacity,filter" }));
}
function wa(e, t, n = .22) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * n)
	};
}
function Ta(e, t, n = I.dealStagger) {
	ya();
	let r = R(), i = q.timeline(), a = L(I.deal, r);
	return e.forEach((e, o) => {
		let { x: s, y: c } = ra(ea(e), t), { midX: l, midY: u } = wa(s, c, .28);
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
function Ea(e, t) {
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
				q.set(e, { clearProps: "transform,opacity,willChange" });
			}
		}, n * a);
	}), r;
}
function Da(e) {
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
function Oa(e) {
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
			onComplete: () => Ca(e)
		}, r * .04);
	}), t;
}
function ka(e) {
	ya();
	let t = L(.32);
	return q.set(e, {
		transformOrigin: "50% 90%",
		willChange: "transform"
	}), Sa(e, q.to(e, {
		y: -26,
		rotationX: 14,
		rotationY: -10,
		scale: 1.05,
		duration: t,
		ease: te
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
	let i = R(), a = L(I.drawReceive, i), o = i ? .04 : I.drawReceiveStagger, s = [];
	for (let r = 0; r < t.length; r++) {
		let t = Na(e);
		n.appendChild(t), s.push(t);
	}
	let c = q.timeline({ onComplete: () => {
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
	return Math.round((r + I.deal) * 1e3);
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
function J(e) {
	let t = io(e);
	return t ? ro(t) : null;
}
function ao(e) {
	return document.querySelector(`[data-trick-play-origin-active="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin-active="${e}"]`) ?? document.querySelector(`[data-trick-play-origin="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin="${e}"]`) ?? io(e);
}
function oo(e) {
	let t = ao(e);
	return t ? ro(t) : null;
}
function so(e) {
	let t = oo(e);
	if (t) return to.set(e, t), t;
	let n = J(e);
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
	return lo(e) ?? oo(e) ?? J(e) ?? null;
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
	let n = k(e, t);
	return n.length ? n.reduce((e, t) => D(t) >= D(e) ? t : e) : null;
}
function ko(e) {
	if (!e.cinchEnabled) return !1;
	let t = k(e.hand, e.trumpSuit);
	return t.filter((e) => D(e) >= 13).length >= 3 && t.length > 0;
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
	let r = e.filter((e) => !O(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => D(t) > D(e) ? t : e) : null;
}
function Lo(e, t) {
	let n = e.filter((e) => O(e, t));
	return n.length ? n.reduce((e, t) => D(t) > D(e) ? t : e) : null;
}
function Ro(e, t) {
	return D(e) > D(t);
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
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? k(n.hand, r) : [], a = k(n.hand, n.trumpSuit), o = r ? Io(n.trickPlays, r, n.trumpSuit) : null, s = Lo(n.trickPlays, n.trumpSuit), c;
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
	let r = e.filter((e) => O(e.card, n));
	if (r.length) return r.reduce((e, t) => D(t.card) > D(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => D(t.card) > D(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
function Ho(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: D(e),
		trump: O(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function Uo(e, t) {
	let n = Bo(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => D(e[n]) > D(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => D(e[n]) < D(e[t]) ? n : t);
	let i = n.filter((n) => Vo([...t.trickPlays.map((e, t) => ({
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
function Wo(e, t) {
	return e === t ? null : t;
}
function Go(e, t) {
	return t ? t.includes(e) : !0;
}
function Ko(e) {
	return [
		e.phase ?? "",
		e.handNumber,
		e.trickNumber ?? "",
		e.turnPlayerId ?? "",
		e.playerId ?? ""
	].join("|");
}
function qo(e, t) {
	return Ko(e) === Ko(t);
}
function Jo(e, t, n) {
	if (!n?.length || !e.length) return null;
	let r = Uo(e, No({
		hand: e,
		publicHand: t
	}));
	return n.includes(r) ? r : n[0] ?? null;
}
function Yo(e, t, n, r = Infinity, i = []) {
	if (!e.length || n <= 0) return [];
	let a = new Set(i), o = e.map((e, t) => t).filter((e) => !a.has(e)).filter((n) => !O(e[n], t)).filter((t) => e[t].rank !== "A");
	return o.length ? Ho(o.map((t) => e[t]), t, n, r).map((e) => o[e]) : [];
}
function Xo(e) {
	let t = [...e.selectedDraw].sort((e, t) => e - t);
	return e.drawSelectionTouched || t.length > 0 ? t : e.bestPlayEnabled ? [...e.recommendedDiscardIndices].sort((e, t) => e - t) : [];
}
//#endregion
//#region src/table/feedback/soundPacks.ts
var Zo = {
	classic: "Classic",
	wood: "Wood & Felt",
	arcade: "Arcade"
}, Qo = "classic", $o = {
	classic: "",
	wood: "packs/wood/",
	arcade: "packs/arcade/"
}, es = {
	shuffle: "shuffle.mp3",
	draw: "draw.mp3",
	trickWin: "trick-win.mp3",
	bigWin: "big-win.mp3",
	bourre: "bourre.mp3",
	gameStart: "game-start.mp3"
};
function ts(e, t) {
	return `./sounds/${$o[e] ?? ""}${es[t]}`;
}
function ns(e) {
	return Object.keys(es).map((t) => ts(e, t));
}
function rs(e) {
	return e === "wood" || e === "arcade" ? e : Qo;
}
//#endregion
//#region src/table/feedback/prefs.ts
var is = "nbl-feedback", as = {
	soundMode: "on",
	soundPackId: Qo,
	hapticsMode: "on"
};
function os(e) {
	if (!e || typeof e != "object") return { ...as };
	let t = e, n = t.hapticsMode, r = n === "off" || n === "minimal" || n === "on" ? n : t.hapticsEnabled === !1 ? "off" : "on", i;
	return i = t.soundMode === "on" || t.soundMode === "minimal" || t.soundMode === "off" ? t.soundMode : t.soundEnabled === !1 ? "off" : "on", {
		soundMode: i,
		soundPackId: rs(t.soundPackId),
		hapticsMode: r
	};
}
function ss() {
	try {
		let e = localStorage.getItem(is);
		return e ? os(JSON.parse(e)) : { ...as };
	} catch {
		return { ...as };
	}
}
function cs(e) {
	let t = {
		...ss(),
		...e
	};
	try {
		localStorage.setItem(is, JSON.stringify(t));
	} catch {}
	return fs(t), t;
}
function ls(e, t) {
	return e === "off" ? !1 : e === "on" ? !0 : t === "trickWin" || t === "bigWin" || t === "bourre";
}
var us = /* @__PURE__ */ new Set();
function ds(e) {
	return us.add(e), () => us.delete(e);
}
function fs(e) {
	for (let t of us) t(e);
}
function ps() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function ms(e, t) {
	return !(e === "off" || e === "minimal" && t === "light" || ps() && t === "light");
}
//#endregion
//#region src/table/feedback/audio.ts
var hs = null, gs = null, _s = !1, vs = /* @__PURE__ */ new Map(), ys = /* @__PURE__ */ new Map();
function bs() {
	return ss().soundPackId;
}
function xs() {
	if (typeof window > "u") return null;
	try {
		let e = window.AudioContext ?? window.webkitAudioContext;
		return e ? (hs || (hs = new e(), gs = hs.createGain(), gs.gain.value = .55, gs.connect(hs.destination)), hs) : null;
	} catch {
		return null;
	}
}
async function Ss() {
	_s = !0;
	let e = xs();
	if (e) {
		if (e.state === "suspended") try {
			await e.resume();
		} catch {}
		Ts();
	}
}
function Cs(e) {
	if (typeof window > "u") return null;
	try {
		let t = vs.get(e);
		return t || (t = new Audio(e), t.preload = "auto", vs.set(e, t)), t;
	} catch {
		return null;
	}
}
async function ws(e) {
	if (ys.has(e)) return ys.get(e) === !0;
	if (typeof window > "u") return !1;
	try {
		let t = (await fetch(e, { method: "HEAD" })).ok;
		return ys.set(e, t), t;
	} catch {
		return ys.set(e, !1), !1;
	}
}
async function Ts(e) {
	if (!_s) return;
	let t = e ?? bs();
	await Promise.all(ns(t).map(async (e) => {
		if (!await ws(e)) return;
		let t = Cs(e);
		if (t) try {
			t.load();
		} catch {}
	}));
}
async function Es(e, t = .55) {
	if (!_s || !await ws(e)) return !1;
	let n = Cs(e);
	if (!n) return !1;
	try {
		return n.volume = t, n.currentTime = 0, await n.play(), !0;
	} catch {
		return !1;
	}
}
function Ds(e, t, n, r, i, a, o = "sine") {
	let s = e.createOscillator(), c = e.createGain();
	s.type = o, s.frequency.setValueAtTime(n, r), c.gain.setValueAtTime(1e-4, r), c.gain.exponentialRampToValueAtTime(a, r + .008), c.gain.exponentialRampToValueAtTime(1e-4, r + i), s.connect(c), c.connect(t), s.start(r), s.stop(r + i + .02);
}
function Os(e, t, n, r, i, a = 1400) {
	let o = Math.max(256, Math.floor(e.sampleRate * r)), s = e.createBuffer(1, o, e.sampleRate), c = s.getChannelData(0);
	for (let e = 0; e < o; e += 1) c[e] = (Math.random() * 2 - 1) * (1 - e / o);
	let l = e.createBufferSource();
	l.buffer = s;
	let u = e.createBiquadFilter();
	u.type = "bandpass", u.frequency.value = a, u.Q.value = .6;
	let d = e.createGain();
	d.gain.setValueAtTime(i, n), d.gain.exponentialRampToValueAtTime(1e-4, n + r), l.connect(u), u.connect(d), d.connect(t), l.start(n), l.stop(n + r + .01);
}
function ks(e) {
	let t = xs();
	if (!t || !gs) return;
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
	for (let e of r) Os(t, gs, n + e, .05, .08 + Math.random() * .04, i);
}
function As(e) {
	let t = xs();
	if (!t || !gs) return;
	let n = t.currentTime;
	Os(t, gs, n, .04, .06, e === "wood" ? 700 : 1200), Ds(t, gs, e === "arcade" ? 660 : 520, n + .05, .08, .05, "triangle");
}
function js(e) {
	let t = xs();
	if (!t || !gs) return;
	let n = t.currentTime;
	if (e === "arcade") {
		Ds(t, gs, 1046.5, n, .1, .1, "square"), Ds(t, gs, 1318.51, n + .08, .14, .08, "square");
		return;
	}
	let r = e === "wood" ? 740 : 880;
	Ds(t, gs, r, n, .12, .09, "sine"), Ds(t, gs, r * 1.335, n + .07, .16, .07, "triangle"), Ds(t, gs, r * 2, n + .14, .1, .04, "sine");
}
function Ms(e) {
	let t = xs();
	if (!t || !gs) return;
	let n = t.currentTime;
	if (e === "arcade") {
		Ds(t, gs, 523.25, n, .12, .09, "square"), Ds(t, gs, 659.25, n + .1, .16, .1, "square"), Ds(t, gs, 783.99, n + .22, .2, .1, "square"), Ds(t, gs, 1046.5, n + .34, .24, .07, "square");
		return;
	}
	let r = e === "wood" ? .92 : 1;
	Ds(t, gs, 659.25 * r, n, .14, .08, "sine"), Ds(t, gs, 830.61 * r, n + .1, .18, .09, "triangle"), Ds(t, gs, 987.77 * r, n + .22, .22, .1, "sine"), Ds(t, gs, 1318.51 * r, n + .34, .28, .06, "triangle");
}
function Ns(e) {
	let t = xs();
	if (!t || !gs) return;
	let n = t.currentTime, r = e === "arcade" ? "sawtooth" : "triangle";
	Ds(t, gs, e === "wood" ? 180 : 220, n, .28, .1, r), Ds(t, gs, e === "wood" ? 140 : 165, n + .18, .32, .08, r);
}
function Ps(e) {
	let t = xs();
	if (!t || !gs) return;
	let n = t.currentTime;
	if (e === "arcade") {
		Ds(t, gs, 440, n, .08, .07, "square"), Ds(t, gs, 554.37, n + .1, .12, .08, "square");
		return;
	}
	Ds(t, gs, e === "wood" ? 392 : 440, n, .1, .07, "sine"), Ds(t, gs, e === "wood" ? 523.25 : 554.37, n + .12, .16, .08, "triangle");
}
var Fs = {
	shuffle: ks,
	draw: As,
	trickWin: js,
	bigWin: Ms,
	bourre: Ns,
	gameStart: Ps
}, Is = {
	shuffle: { current: !1 },
	draw: { current: !1 },
	trickWin: { current: !1 },
	bigWin: { current: !1 },
	bourre: { current: !1 },
	gameStart: { current: !1 }
}, Ls = {
	shuffle: 360,
	draw: 280,
	trickWin: 320,
	bigWin: 580,
	bourre: 520,
	gameStart: 320
}, Rs = {
	shuffle: .55,
	draw: .45,
	trickWin: .55,
	bigWin: .6,
	bourre: .5,
	gameStart: .42
};
async function zs(e) {
	let t = Is[e];
	if (t.current) return;
	t.current = !0;
	let n = bs(), r = ts(n, e);
	try {
		!await Es(r, Rs[e]) && _s && Fs[e](n);
	} catch {} finally {
		window.setTimeout(() => {
			t.current = !1;
		}, Ls[e]);
	}
}
function Bs() {
	zs("shuffle");
}
function Vs() {
	zs("draw");
}
function Hs() {
	zs("trickWin");
}
function Us() {
	zs("bigWin");
}
function Ws() {
	zs("bourre");
}
function Gs() {
	zs("gameStart");
}
function Ks() {
	return typeof window < "u" && !!(window.AudioContext ?? window.webkitAudioContext ?? typeof Audio < "u");
}
function qs() {
	ys.clear();
}
//#endregion
//#region src/table/feedback/haptics.ts
function Js() {
	return typeof navigator < "u" && typeof navigator.vibrate == "function";
}
function Ys(e) {
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
var Xs = {
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
function Zs(e) {
	try {
		return Ys(e) ? !0 : Js() ? navigator.vibrate(Xs[e]) ?? !1 : !1;
	} catch {
		return !1;
	}
}
function Qs() {
	return Js() || !!(typeof window < "u" && window.BourreHaptics);
}
var $s = 700, ec = 500, tc = 450, nc = 1200, rc = 2e3, ic = 1500, ac = 280, oc = 0, sc = 0, cc = 0, lc = 0, uc = 0, dc = 0, fc = 0, pc = null, mc = !1;
function hc() {
	return ss();
}
function gc(e) {
	ms(hc().hapticsMode, e) && Zs(e);
}
function _c(e, t) {
	ls(hc().soundMode, e) && t();
}
function vc() {
	if (mc || typeof window > "u") return;
	mc = !0;
	let e = () => {
		Ss();
	};
	window.addEventListener("pointerdown", e, {
		once: !0,
		passive: !0
	}), window.addEventListener("keydown", e, { once: !0 });
}
function yc(e = {}) {
	if (Date.now() - oc < $s) return;
	pc &&= (clearTimeout(pc), null);
	let t = e.delayMs ?? (ps() ? 0 : 40);
	pc = window.setTimeout(() => {
		pc = null, oc = Date.now(), _c("shuffle", Bs), gc("light");
	}, t);
}
function bc() {
	let e = Date.now();
	e - sc < ec || (sc = e, _c("draw", Vs), gc("light"));
}
function xc() {
	let e = Date.now();
	e - cc < tc || (cc = e, _c("trickWin", Hs), gc("medium"));
}
function Sc() {
	let e = Date.now();
	e - lc < nc || (lc = e, _c("bigWin", Us), gc("strong"));
}
function Cc() {
	let e = Date.now();
	e - uc < rc || (uc = e, _c("bourre", Ws), gc("medium"));
}
function wc() {
	let e = Date.now();
	e - dc < ic || (dc = e, _c("gameStart", Gs), gc("light"));
}
function Tc() {
	let e = Date.now();
	e - fc < ac || (fc = e, gc("light"));
}
function Ec() {
	gc("light");
}
//#endregion
//#region src/table/actionErrorCopy.ts
function Dc(e) {
	let t = String(e ?? "").trim();
	if (!t) return null;
	let n = t.toLowerCase();
	return n === "internal" || n.includes("internal error") ? "The server could not finish that table action. Refresh the page and try again." : t;
}
//#endregion
//#region src/table/theme/cardPacks.ts
var Oc = "classic";
function kc(e) {
	return e === "elegant" || e === "casino" || e === "midnight" ? e : Oc;
}
//#endregion
//#region src/table/theme/settings.ts
var Ac = "nbl-table-settings", jc = {
	focusTable: "F",
	toggleSettings: ",",
	standPat: "P",
	nextTable: "Tab"
}, Mc = {
	classic: "Classic",
	elegant: "Elegant",
	casino: "Casino",
	midnight: "Midnight"
}, Nc = {
	themeId: "night-felt",
	cardPackId: Oc,
	deckMode: "classic",
	cardScale: "md",
	highContrast: !1,
	tableScale: 1,
	layoutMode: "single",
	hotkeys: { ...jc }
}, Pc = {
	carbon: "Carbon",
	simple: "Simple",
	"night-felt": "Night Felt",
	arena: "Arena"
};
function Fc(e) {
	return Math.max(.85, Math.min(1.35, e));
}
function Ic() {
	try {
		let e = localStorage.getItem(Ac);
		if (!e) return {
			...Nc,
			hotkeys: { ...jc }
		};
		let t = JSON.parse(e);
		return {
			...Nc,
			...t,
			cardPackId: kc(t.cardPackId),
			tableScale: Fc(t.tableScale ?? Nc.tableScale),
			hotkeys: {
				...jc,
				...t.hotkeys
			}
		};
	} catch {
		return {
			...Nc,
			hotkeys: { ...jc }
		};
	}
}
function Lc(e) {
	try {
		localStorage.setItem(Ac, JSON.stringify(e));
	} catch {}
}
function Rc(e, t) {
	e.dataset.tableTheme = t.themeId, e.dataset.cardPack = t.cardPackId, e.dataset.deckMode = t.deckMode, e.dataset.cardScale = t.cardScale, e.dataset.highContrast = t.highContrast ? "true" : "false", e.dataset.layoutMode = t.layoutMode, e.style.setProperty("--table-scale", String(t.tableScale));
}
//#endregion
//#region src/table/theme/TableThemeContext.tsx
var zc = (0, l.createContext)(null);
function Bc({ settings: e, children: t }) {
	let n = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		n.current && Rc(n.current, e);
	}, [e]), /* @__PURE__ */ (0, C.jsx)("div", {
		ref: n,
		className: "btable-room",
		children: t
	});
}
function Vc({ children: e }) {
	let [t, n] = (0, l.useState)(() => Ic()), r = (0, l.useCallback)((e) => {
		n((t) => {
			let n = {
				...t,
				...e,
				hotkeys: {
					...t.hotkeys,
					...e.hotkeys
				}
			};
			return Lc(n), n;
		});
	}, []), i = (0, l.useCallback)(() => {
		let e = {
			...Nc,
			hotkeys: { ...Nc.hotkeys }
		};
		Lc(e), n(e);
	}, []), a = (0, l.useMemo)(() => ({
		settings: t,
		updateSettings: r,
		resetSettings: i
	}), [
		t,
		r,
		i
	]);
	return /* @__PURE__ */ (0, C.jsx)(zc.Provider, {
		value: a,
		children: /* @__PURE__ */ (0, C.jsx)(Bc, {
			settings: t,
			children: e
		})
	});
}
//#endregion
//#region src/table/theme/useTableTheme.ts
function Hc() {
	let e = (0, l.useContext)(zc);
	if (!e) throw Error("useTableTheme must be used within TableThemeProvider");
	return e;
}
//#endregion
//#region src/table/playClickDebug.ts
function Uc() {
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem("nbl-play-click-debug") === "1" ? !0 : new URLSearchParams(window.location.search).has("playClickDebug");
	} catch {
		return !1;
	}
}
function Wc(e, t) {
	Uc() && console.log("[PLAY-CLICK]", e, t ?? {});
}
//#endregion
//#region src/table/HeroHandActionButtons.tsx
function Gc({ visible: e, busy: t, selectedCount: n, onDraw: r, onPassDraw: i, onFoldDraw: a }) {
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
var Kc = (0, l.memo)(Gc);
//#endregion
//#region src/table/HeroHand.tsx
function qc(e, t, n = []) {
	return [
		`btable-hero btable-hero--bare btable-hero--scale-${e.cardScale}`,
		...n,
		t
	].filter(Boolean).join(" ");
}
function Jc({ className: e = "" }) {
	return /* @__PURE__ */ (0, C.jsx)("div", {
		className: `btable-hero btable-hero--bare btable-hero--reserved ${e}`.trim(),
		"aria-hidden": "true",
		"data-testid": "hero-hand"
	});
}
var Yc = (0, l.memo)(function({ cards: e, phase: t, enrollmentActive: n = !1, isInHand: r = !1, isDealer: i = !1, signedIn: a = !1, isMyTurn: o = !1, drawCompleted: s = !1, maxDrawDiscards: c = 4, legalPlayIndices: u, recommendedPlayIndex: d = null, recommendedDiscardIndices: f = [], handComplete: p = !1, actionFeedback: m, onSubmitDraw: h, onPassDraw: g, onFoldDraw: _, onPlayCard: v, privateHandReady: y = !1, className: b = "", dealStaggerMs: x = 120, drawAnimSubPhase: S = null, drawDiscardCount: w = 0, drawReplaceCount: T = 0, currentUserId: E = null, revealedTrumpIndex: D = null, trumpMergeActive: O = !1, trumpDisabledIndex: k = null, handNumber: A = 0, trickNumber: j = null, turnPlayerId: M = null, tableRootRef: ee, pileIndexRef: te, onDiscardCommitted: P, onUserActivity: F, skipHeroDealMotion: I = !1 }) {
	let { settings: ne } = Hc(), [L, R] = (0, l.useState)(/* @__PURE__ */ new Set()), [z, B] = (0, l.useState)(null), [V, re] = (0, l.useState)(null), [ie, ae] = (0, l.useState)(null), [H, oe] = (0, l.useState)(!1), [U, se] = (0, l.useState)(null), [ce, le] = (0, l.useState)(null), [ue, de] = (0, l.useState)(null), [fe, pe] = (0, l.useState)(() => xo()), [me, he] = (0, l.useState)(!1), [ge, _e] = (0, l.useState)(!1), [ve, ye] = (0, l.useState)(!1), [be, xe] = (0, l.useState)([]), Se = (0, l.useRef)(/* @__PURE__ */ new Set()), Ce = (0, l.useRef)(null), we = (0, l.useRef)(!1), Te = (0, l.useRef)(null), Ee = (0, l.useRef)(null), De = (0, l.useRef)(!1), Oe = (0, l.useRef)(null), [ke, W] = (0, l.useState)(!1), Ae = (0, l.useRef)(async () => {}), je = Xa(t), Me = (0, l.useMemo)(() => e.map(Ga), [e]), Ne = (0, l.useMemo)(() => e.map((e) => `${e.rank}-${e.suit}`).join("|"), [e]), Pe = (0, l.useMemo)(() => f.slice().sort((e, t) => e - t).join(","), [f]), Fe = t === "draw", Ie = t === "play", Le = (0, l.useCallback)((e, t) => D === t ? O ? "hand__slot--trump-merge-target" : "hand__slot--trump-revealed" : "", [D, O]);
	(0, l.useEffect)(() => {
		if (I || !je || e.length === 0) return;
		let t = new Set(e.map((e) => `${e.rank}-${e.suit}`)), n = Se.current, r = [...t].some((e) => !n.has(e));
		if (Se.current = t, !r || n.size > 0) return;
		he(!0), re(null), B(null);
		let i = Wa(e.length, x), a = window.setTimeout(() => he(!1), i);
		return () => window.clearTimeout(a);
	}, [
		e,
		je,
		x,
		I
	]), (0, l.useEffect)(() => {
		(S === "done" || S === null) && xe([]);
	}, [S]), Ua(Ce, {
		dealing: me,
		dealStaggerMs: x,
		drawAnimSubPhase: S,
		drawDiscardCount: w,
		drawReplaceCount: T,
		pendingDiscardIndices: be,
		standPatPulse: ge,
		foldOutPulse: ve,
		playingIndex: V,
		cards: e,
		handNumber: A,
		playerId: E,
		tableRootRef: ee,
		pileIndexRef: te,
		onDiscardCommitted: P,
		skipHeroDealMotion: I
	});
	let Re = (0, l.useCallback)(() => {
		Te.current != null && (window.clearTimeout(Te.current), Te.current = null), Ee.current = null, De.current = !1, Oe.current = null;
	}, []), ze = (0, l.useCallback)(() => ({
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
	]), Be = (0, l.useCallback)((e, n) => !(n == null || !qo(n, ze()) || t !== "play" || !E || M !== E || !Go(e, u) || we.current || Ue), [
		ze,
		t,
		E,
		M,
		u,
		Ue
	]), Ve = (0, l.useCallback)((e) => {
		if (!E) return;
		let t = Me[e];
		t && po(E, no({
			playerId: E,
			card: {
				rank: String(t.rank),
				suit: String(t.suit)
			}
		}), e);
	}, [E, Me]), He = (0, l.useCallback)((e, t) => {
		Re(), Ee.current = e, De.current = t, Oe.current = ze();
		let n = t ? go.turnHandoff : go.autoPlayPreselect;
		Wc(t ? "preselectEffect:armTurnHandoff" : "preselectEffect:armTimer", {
			index: e,
			delay: n
		}), Te.current = window.setTimeout(() => {
			Te.current = null;
			let t = Ee.current, n = Oe.current;
			Ee.current = null, De.current = !1, Oe.current = null, Wc("preselectEffect:timerFire", {
				pending: t,
				index: e
			}), t === e && Be(t, n) && Ae.current(t);
		}, n);
	}, [
		Re,
		ze,
		Be
	]);
	(0, l.useEffect)(() => () => Re(), [Re]), (0, l.useEffect)(() => {
		Re(), B(null), R(/* @__PURE__ */ new Set()), W(!1), ae(null), le(null), de(null), se(null);
	}, [
		t,
		Ne,
		A,
		j,
		M,
		Re
	]), (0, l.useEffect)(() => {
		z !== null && (Go(z, u) || (B(null), Ee.current = null, Re()));
	}, [
		u,
		z,
		Re
	]), (0, l.useEffect)(() => {
		if (z === null || Te.current == null) return;
		let e = Oe.current;
		!e || qo(e, ze()) || (Re(), B(null));
	}, [
		z,
		t,
		A,
		j,
		M,
		E,
		ze,
		Re
	]);
	let Ue = H || m?.status === "loading" || V !== null;
	(0, l.useEffect)(() => {
		!fe || !Fe || s || ke || R(new Set(f));
	}, [
		fe,
		Fe,
		s,
		ke,
		Pe,
		f
	]), (0, l.useEffect)(() => {
		if (!(!Ie || !o || z === null || we.current || Ue)) {
			if (!Go(z, u)) {
				B(null), Ee.current = null;
				return;
			}
			Te.current ?? (Ve(z), He(z, De.current));
		}
	}, [
		Ie,
		o,
		z,
		u,
		Ue,
		He,
		Ve
	]), (0, l.useEffect)(() => {
		(m?.status === "success" || m?.status === "error") && (re(null), B(null), Re(), we.current = !1);
	}, [m?.status, Re]);
	let We = (0, l.useRef)(void 0);
	(0, l.useEffect)(() => {
		let e = m?.status, t = We.current;
		We.current = e, t === "error" && e !== "error" && se(null);
	}, [m?.status]);
	let Ge = ne.cardScale === "lg" ? "md" : "sm", Ke = Dc(m?.status === "error" ? m.message : U), qe = Ka(t, n);
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
	let Je = (0, l.useCallback)(() => {
		F?.();
	}, [F]), Ye = (0, l.useCallback)((e) => {
		Ue || k === e || (W(!0), Je(), se(null), R((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.size < c ? n.add(e) : se(`You may discard at most ${c} cards`), n;
		}));
	}, [
		Ue,
		c,
		k,
		Je
	]), Xe = (0, l.useCallback)(async (e) => {
		if (we.current || Ue || !v || !Go(e, u)) return;
		Re(), we.current = !0, B(null), re(e), se(null);
		let t = Me[e];
		E && t && po(E, no({
			playerId: E,
			card: {
				rank: String(t.rank),
				suit: String(t.suit)
			}
		}), e);
		try {
			await Promise.resolve(v(e)), re(null), we.current = !1;
		} catch {
			re(null), we.current = !1;
		}
	}, [
		Ue,
		u,
		v,
		E,
		Me,
		Re
	]), Ze = (0, l.useCallback)((e) => {
		if (Wc("preselectCard:enter", {
			index: e,
			isMyTurn: o,
			busy: Ue,
			playLock: we.current,
			phase: t,
			selectedPlay: z,
			hasOnPlayCard: !!v,
			legal: Go(e, u)
		}), we.current || Ue || !v || t !== "play") {
			Wc("preselectCard:blocked", {
				index: e,
				reason: we.current ? "playLock" : Ue ? "busy" : v ? "phase" : "noOnPlayCard"
			});
			return;
		}
		if (!Go(e, u)) {
			o && (Tc(), Re(), B(null), le(e), de(e), window.setTimeout(() => {
				le(null), de(null);
			}, go.illegalFlash), se("Illegal play")), Wc("preselectCard:illegal", {
				index: e,
				isMyTurn: o
			});
			return;
		}
		let n = o ? e : Wo(z, e);
		if (Wc("preselectCard:toggle", {
			index: e,
			nextSelection: n,
			isMyTurn: o,
			selectedPlay: z
		}), Re(), B(n), se(null), Je(), n === null) {
			Ee.current = null, Wc("preselectCard:deselected", { index: e });
			return;
		}
		if (Ee.current = n, !o) {
			De.current = !0, Ve(n), Wc("preselectCard:queued", { index: n });
			return;
		}
		Ve(n), He(n, !1);
	}, [
		Ue,
		Re,
		o,
		u,
		v,
		t,
		Je,
		z,
		He,
		Ve
	]);
	Ae.current = Xe;
	let Qe = (0, l.useCallback)(async (e) => {
		if (!(!h || Ue)) {
			if (Je(), e.length > c) {
				se(`You may discard at most ${c} cards`);
				return;
			}
			oe(!0), se(null), xe([...e]);
			try {
				await h(e), R(/* @__PURE__ */ new Set());
			} catch {} finally {
				oe(!1);
			}
		}
	}, [
		h,
		Ue,
		c,
		Je
	]), $e = (0, l.useCallback)(async () => {
		if (!(!g || Ue)) {
			Je(), oe(!0), se(null);
			try {
				await g(), R(/* @__PURE__ */ new Set()), _e(!0), window.setTimeout(() => _e(!1), 700);
			} catch {} finally {
				oe(!1);
			}
		}
	}, [
		g,
		Ue,
		Je
	]), et = (0, l.useCallback)(async () => {
		if (!(!_ || Ue)) {
			Je(), ye(!0), oe(!0), se(null);
			try {
				await _(), R(/* @__PURE__ */ new Set());
			} catch {
				ye(!1);
			} finally {
				oe(!1);
			}
		}
	}, [
		_,
		Ue,
		Je
	]), tt = (0, l.useCallback)((e) => {
		Tc(), Re(), B(null), le(e), de(e), window.setTimeout(() => {
			le(null), de(null);
		}, go.illegalFlash), se("Illegal play");
	}, [Re]), nt = (0, l.useCallback)((e) => {
		if (pe(e), So(e), e) {
			W(!1), Fe && !s && R(new Set(f));
			return;
		}
		ke || R(/* @__PURE__ */ new Set());
	}, [
		ke,
		Fe,
		s,
		f
	]), rt = a && r && (Fe || Ie), it = (0, l.useMemo)(() => Xo({
		selectedDraw: L,
		drawSelectionTouched: ke,
		bestPlayEnabled: fe,
		recommendedDiscardIndices: f
	}), [
		L,
		ke,
		fe,
		Pe,
		f
	]), at = rt && Ie && fe && z === null && d !== null && d >= 0, ot = (0, l.useCallback)((e, t) => D === t ? "trump" : k === t && (Fe || Ie) ? "muted" : V === t || ue === t || ce === t ? "default" : Fe && L.has(t) ? "draw-selected" : Ie && z === t ? "play-preselected" : at && d === t ? "play-recommended" : Ie && u && !u.includes(t) ? "muted" : "default", [
		D,
		k,
		Fe,
		Ie,
		V,
		ue,
		ce,
		L,
		z,
		at,
		d,
		u
	]), st = (0, l.useMemo)(() => Ie && r ? "play" : Fe && r && !s ? "draw-select" : je && r && !(Ie && o) ? "peek" : "none", [
		je,
		r,
		Ie,
		o,
		Fe,
		s
	]), ct = je && r && !(Ie && o), lt = (0, l.useCallback)((e) => {
		Wc("Hand.onPlayCard", {
			index: e,
			isMyTurn: o,
			gestureMode: st
		}), Ze(e);
	}, [
		st,
		o,
		Ze
	]), ut = (0, l.useMemo)(() => ({
		mode: st,
		isMyTurn: o,
		legalPlayIndices: u,
		playingIndex: V,
		illegalShakeIndex: ce,
		illegalFlashIndex: ue,
		busy: Ue,
		showPlayableHint: !1,
		allowPlayPreselect: Ie && r && !o,
		trickPlayOriginPlayerId: E,
		onPlayCard: lt,
		onSelectCard: Ye,
		onIllegalPlay: tt,
		onPeek: ae
	}), [
		st,
		o,
		u,
		V,
		ce,
		ue,
		Ue,
		Ie,
		r,
		E,
		lt,
		Ye,
		tt
	]), dt = it.length, ft = Fe && !s && o, pt = (0, l.useCallback)(() => {
		Qe(it);
	}, [Qe, it]), mt = (0, l.useCallback)(() => {
		$e();
	}, [$e]), ht = (0, l.useCallback)(() => {
		et();
	}, [et]), gt = () => rt ? /* @__PURE__ */ (0, C.jsxs)("label", {
		className: "btable-hero__best-play",
		children: [/* @__PURE__ */ (0, C.jsx)("input", {
			type: "checkbox",
			className: "btable-hero__best-play-input",
			checked: fe,
			onChange: (e) => nt(e.target.checked),
			"data-testid": "best-play-checkbox"
		}), /* @__PURE__ */ (0, C.jsx)("span", {
			className: "btable-hero__best-play-label",
			children: "Best Play"
		})]
	}) : null;
	return a ? !r && !n && !je ? /* @__PURE__ */ (0, C.jsx)(Jc, { className: b }) : je && r && e.length === 0 ? p && n ? /* @__PURE__ */ (0, C.jsx)(Jc, { className: b }) : /* @__PURE__ */ (0, C.jsxs)("div", {
		className: qc(ne, b),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: [/* @__PURE__ */ (0, C.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: y ? "Cards not available — leave and re-open the session, or refresh the page." : "Loading your cards…"
		}), /* @__PURE__ */ (0, C.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: gt()
		})]
	}) : je && !r && (t === "draw" || t === "play") ? /* @__PURE__ */ (0, C.jsx)("div", {
		className: qc(ne, b),
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, C.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "You sat out this hand."
		})
	}) : e.length === 0 && !i ? rt ? /* @__PURE__ */ (0, C.jsx)("div", {
		className: qc(ne, b, ["btable-hero--reserved"]),
		"data-testid": "hero-hand",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, C.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: gt()
		})
	}) : /* @__PURE__ */ (0, C.jsx)(Jc, { className: b }) : /* @__PURE__ */ (0, C.jsxs)("div", {
		className: qc(ne, b, [
			me && !I ? "btable-hero--dealing" : "",
			D === null ? "" : "btable-hero--trump-reveal",
			O ? "btable-hero--trump-merge" : "",
			Fe && o && !s ? "btable-hero--draw-select" : "",
			S === "discard" && w > 0 ? "btable-hero--draw-discard" : "",
			S === "receive" && T > 0 ? "btable-hero--draw-receive" : "",
			ft ? "btable-hero--draw-actions" : "",
			Fe && o && !s || Ie && o ? "btable-hero--your-turn" : "",
			(Fe || Ie) && r && !o ? "btable-hero--waiting-turn" : "",
			ge ? "btable-hero--stand-pat" : "",
			ve ? "btable-hero--fold-out" : ""
		]),
		style: { "--deal-card-stagger-ms": `${x}ms` },
		"data-testid": "hero-hand",
		"aria-label": `Your dealt cards — ${qe}`,
		children: [
			/* @__PURE__ */ (0, C.jsxs)("p", {
				className: "btable-sr-only",
				"aria-live": "polite",
				children: [
					qe,
					Fe && !s && o && " — tap cards to discard; red border marks your selection",
					Ie && o && " — tap a legal card to play",
					fe && Ie && " — green outline marks Best Play suggestions"
				]
			}),
			/* @__PURE__ */ (0, C.jsxs)("div", {
				ref: Ce,
				className: "btable-hero__hand-3d",
				"data-trick-play-origin": E ?? void 0,
				"data-trick-play-origin-active": Ie && o && E ? E : void 0,
				children: [/* @__PURE__ */ (0, C.jsx)("div", {
					className: "btable-hero__hand-row",
					"data-hero-play-turn": Ie && o ? "true" : void 0,
					children: /* @__PURE__ */ (0, C.jsx)(N, {
						cards: Me,
						size: Ge,
						fan: !0,
						dealSeatPlayerId: E,
						stateFor: ot,
						slotClassFor: Le,
						peekIndex: ie,
						onCardPeek: ct ? ae : void 0,
						cardTestId: Ie && o ? "play-button" : void 0,
						cardInteraction: ut
					})
				}), gt()]
			}),
			Ie && !o && z !== null && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-hero__hint",
				"data-testid": "play-preselect-hint",
				children: "Your selected card will play on your turn"
			}),
			Ke && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-hero__error",
				role: "alert",
				children: Ke
			}),
			/* @__PURE__ */ (0, C.jsx)(Kc, {
				visible: ft,
				busy: Ue,
				selectedCount: dt,
				onDraw: pt,
				onPassDraw: mt,
				onFoldDraw: ht
			})
		]
	}) : /* @__PURE__ */ (0, C.jsx)("div", {
		className: qc(ne, b),
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
function Xc({ event: e, onDismiss: t }) {
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
function Zc(e) {
	return (e?.length ?? 0) === 0;
}
//#endregion
//#region src/table/layout/seatPresetAnchors.ts
var Qc = {
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
}, $c = {
	sixBotBottomLeft: Qc[1],
	sixBotBottomRight: Qc[6],
	sixBotTopCenter: Qc[4]
}, el = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: $c.sixBotBottomLeft,
	2: Qc[3],
	3: Qc[5],
	4: $c.sixBotBottomRight
}, tl = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: $c.sixBotBottomLeft,
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
	5: $c.sixBotBottomRight
}, nl = {
	0: {
		x: 50,
		y: 99,
		region: "bottom"
	},
	1: $c.sixBotBottomLeft,
	2: Qc[2],
	3: Qc[3],
	4: $c.sixBotTopCenter,
	5: Qc[5],
	6: {
		x: 98,
		y: 46.5,
		region: "right"
	},
	7: $c.sixBotBottomRight
}, rl = {
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
}, il = {
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
}, al = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: rl[1],
	2: rl[2],
	3: rl[3],
	4: rl[4],
	5: rl[5],
	6: {
		x: 92,
		y: 46.5,
		region: "right"
	},
	7: rl[6]
}, ol = {
	0: {
		x: 50,
		y: 91,
		region: "bottom"
	},
	1: il[1],
	2: il[2],
	3: il[3],
	4: il[4],
	5: il[5],
	6: {
		x: 92,
		y: 46.5,
		region: "right"
	},
	7: il[6]
};
rl[1], rl[6], rl[4];
function sl(e) {
	return e === "landscape" ? il : rl;
}
function cl(e) {
	return e === "landscape" ? ol : al;
}
function ll(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function ul(e, t) {
	return ll(e, t) >= 5;
}
function dl(e, t, n) {
	if (n !== "play") return [];
	let r = [...new Set(t.filter(Boolean))];
	return r.length < 2 || 5 - ll(e, r) != 1 ? [] : r.filter((t) => (e[t] ?? 0) === 0);
}
function fl(e, t, n, r) {
	return dl(t, n, r).includes(e);
}
function pl(e, t) {
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
function ml(e) {
	return `$${e.toLocaleString("en-US")}`;
}
function hl(e) {
	let t = Math.round(Number(e) * 100) / 100;
	return !Number.isFinite(t) || t <= 0 ? "$0" : t < 1 ? `${Math.round(t * 100)}¢` : Math.round(t * 100) % 100 == 0 ? `$${Math.round(t).toLocaleString("en-US")}` : `$${t.toFixed(2)}`;
}
function gl(e) {
	let t = Number(e) || 0;
	return t > 0 ? `+${ml(t)}` : t < 0 ? `−${ml(Math.abs(t))}` : ml(0);
}
function _l(e) {
	return ml(Math.max(0, Number(e) || 0));
}
function vl(e, t, n) {
	return e == null || n.anteAlreadyPosted || !n.inHand || !n.anteAnimActive ? e : Math.max(0, e - Math.max(0, t));
}
function yl(e) {
	return (e || "?").trim().replace(/\s+bot$/i, "").replace(/^bot\s+/i, "").trim() || "?";
}
function bl(e) {
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
function xl(e) {
	let t = Math.cos(e), n = Math.sin(e);
	return Math.abs(n) >= Math.abs(t) ? n > 0 ? "bottom" : "top" : t > 0 ? "right" : "left";
}
var Sl = nl, Cl = Qc, wl = el, Tl = tl;
function El(e, t) {
	let { rx: n, ry: r, outset: i } = bl(t), a = e / t * Math.PI * 2 + Math.PI / 2, o = Math.cos(a), s = Math.sin(a);
	return {
		x: 50 + n * o + o * i,
		y: 50 + r * s + s * i,
		region: xl(a)
	};
}
function Dl(e, t) {
	let n = Math.max(2, Math.min(8, t || 2));
	if (n <= 0) return {
		x: 50,
		y: 50,
		region: "bottom"
	};
	if (n === 5) {
		let t = wl[e];
		if (t) return t;
	}
	if (n === 6) {
		let t = Tl[e];
		if (t) return t;
	}
	if (n === 7) {
		let t = Cl[e];
		if (t) return t;
	}
	if (n >= 8) {
		let t = Sl[e];
		if (t) return t;
	}
	return El(e, n);
}
function Ol(e) {
	let t = Math.max(2, Math.min(8, e || 2));
	return t === 2 ? 1.04 : t === 3 ? .94 : t === 4 ? .98 : t === 5 ? 1.08 : t === 6 ? 1.12 : t === 7 ? 1.16 : 1.2;
}
var kl = 1850, Al = 2050, jl = 1080, Ml = 9500, Nl = 8500;
function Pl(e) {
	return e === "winnerReveal" || e === "collectTrick";
}
function Fl(e = !1) {
	let t = e ? .55 : 1;
	return {
		cardLandMs: Math.round(560 * t),
		postTrickReadMs: Math.round(kl * t),
		winnerRevealMs: Math.round(400 * t),
		trickSweepMs: Math.round(jl * t),
		nextLeadGapMs: Math.round(230 * t),
		trumpBeatReadMs: Math.round(Al * t)
	};
}
function Il(e) {
	let t = Fl(e.reducedMotion), n = e.finalTrick ? Math.round(900 * (e.reducedMotion ? .55 : 1)) : 0, r = (e.trumpBeat ? t.trumpBeatReadMs : t.postTrickReadMs) + n, i = Math.min(t.winnerRevealMs, r - 200), a = Math.max(200, r - i), o = t.trickSweepMs, s = t.nextLeadGapMs;
	return {
		readBeforeWinnerMs: a,
		winnerRevealMs: i,
		readTotalMs: r,
		sweepMs: o,
		nextLeadGapMs: s,
		pipelineMs: r + o + s
	};
}
function Ll(e, t, n) {
	let r = n.length > 0 ? n : [...new Set([...Object.keys(e), ...Object.keys(t)])];
	for (let n of r) if ((t[n] ?? 0) > (e[n] ?? 0)) return n;
	return null;
}
function Y(e, t, n) {
	return e.length > 0 ? e : [...new Set([...Object.keys(t), ...Object.keys(n)])];
}
function X(e) {
	return e?.plays?.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
}
function Rl(e, t, n) {
	return e.length ? e.length === 1 ? e[0].playerId : !t || !n ? e[e.length - 1].playerId : Vo(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n) : null;
}
function zl(e) {
	let t = X(e.prevTrick), n = e.playedCards?.filter((t) => t.trickNumber === e.trickNumber).map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
	return n.length > t.length ? n : t;
}
function Bl(e, t, n) {
	if (!e.length || !t || !n || t === n) return !1;
	let r = Vo(e.map((e) => ({
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
function Vl(e) {
	let { prevTricks: t, nextTricks: n, prevTrick: r, playedCards: i } = e, a = Y(e.participantIds, t, n), o = ll(t, a), s = ll(n, a);
	if (s <= o) return null;
	let c = Ll(t, n, a), l = r?.trickNumber ?? s, u = zl({
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
function Hl() {
	return typeof window > "u" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region src/table/gameFlowDebug.ts
var Ul = "nbl-game-flow-debug", Wl = !1, Gl = null;
function Z() {
	if (Wl) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(Ul) === "1" ? !0 : new URLSearchParams(window.location.search).has("gameFlowDebug");
	} catch {
		return !1;
	}
}
function Kl(e, t, n) {
	if (!Z()) return;
	let r = `[nbl-flow ${typeof performance < "u" ? `${performance.now().toFixed(1)}ms` : ""}] ${e} :: ${t}`;
	if (Gl) {
		Gl(r.trim(), n);
		return;
	}
	console.info(r, n ?? "");
}
//#endregion
//#region src/table/TrickPlaySlot.tsx
function ql(e, t, n, r, i) {
	r.current = !1, e(!0), t("static"), n(null), i && Z() && Kl("TrickPlaySlot", "fly-complete", i);
}
function Jl({ play: e, index: t, presentationPhase: n, displayCount: r, playerName: i, leaderPlayerId: a = null, winnerPlayerId: o = null, instantPlace: s = !1 }) {
	let c = (0, l.useRef)(null), [u, d] = (0, l.useState)("static"), [f, p] = (0, l.useState)(null), [m, h] = (0, l.useState)(!1), g = (0, l.useRef)(!1), _ = no(e), v = a != null && e.playerId === a, y = o != null && e.playerId === o, b = n === "live", x = t === r - 1 && b, S = m, T = v && (n === "live" || n === "trickComplete"), E = T || y && n !== "live" && n !== "trickComplete";
	(0, l.useLayoutEffect)(() => {
		Z() && Kl("TrickPlaySlot", "play-enter", {
			playKey: _,
			index: t,
			instantPlace: s,
			isLanding: x
		}), h(!1), g.current = !1, d("static"), p(null);
	}, [_]), (0, l.useLayoutEffect)(() => {
		if (m) return;
		if (s || !b) {
			ql(h, d, p, g, {
				playKey: _,
				index: t
			});
			return;
		}
		if (!x) {
			ql(h, d, p, g, {
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
		let i = uo(e.playerId, _);
		if (!i) {
			ql(h, d, p, g, {
				playKey: _,
				index: t
			});
			return;
		}
		let a = Hl(), o = a ? 217 : 395, l = a ? 91 : 165;
		g.current = !0, p(mo(i, n.getBoundingClientRect(), r.getBoundingClientRect())), d("pending"), Z() && Kl("TrickPlaySlot", "fly-start", {
			playKey: _,
			index: t,
			travelMs: o,
			settleMs: l
		});
		let u = window.setTimeout(() => d("travel"), 0), f = window.setTimeout(() => d("settle"), o), v = window.setTimeout(() => {
			ql(h, d, p, g, {
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
		x,
		b,
		e.playerId,
		_
	]);
	let D = {
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
			S ? "btrick__play--settled" : "",
			m && u === "static" ? "btrick__play--static-landed" : "",
			u === "travel" ? "btrick__play--fly-from-hand" : "",
			u === "pending" ? "btrick__play--fly-pending" : "",
			u === "land" ? "btrick__play--land" : "",
			u === "settle" ? "btrick__play--settle" : "",
			T ? "btrick__play--leading" : "",
			E ? "btrick__play--winner" : ""
		].filter(Boolean).join(" "),
		style: D,
		"data-slot-index": t,
		children: [/* @__PURE__ */ (0, C.jsx)(w, {
			card: Ga(e.card),
			size: "sm",
			state: E ? "winner" : "default"
		}), /* @__PURE__ */ (0, C.jsx)("span", {
			className: "btrick__name muted small",
			children: i
		})]
	});
}
//#endregion
//#region src/table/TrickRow.tsx
function Yl({ displayPlays: e = [], leaderPlayerId: t = null, winnerPlayerId: n = null, showWinnerTag: r = !1, presentationPhase: i = "live", playerNames: a = {}, variant: o = "live", instantTrickPlays: s = !1, peakCardCount: c = 0 }) {
	(0, l.useEffect)(() => {
		Z() && Kl("TrickRow", e.length === 0 ? "trick-empty" : "trick-cards", {
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
	let d = n ? a[n] ?? "Player" : null, f = i === "trickComplete" || i === "winnerReveal", p = i === "collectTrick", m = o === "echo";
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
				children: e.map((r, o) => /* @__PURE__ */ (0, C.jsx)(Jl, {
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
var Xl = (0, l.memo)(Yl);
//#endregion
//#region src/table/DiscardPile.tsx
function Zl({ cards: e }) {
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
function Ql({ potMetrics: e, participantCount: t, potTick: n = 0 }) {
	return /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
		/* @__PURE__ */ (0, C.jsxs)("dl", {
			className: "center-play__stats",
			children: [
				/* @__PURE__ */ (0, C.jsxs)("div", {
					className: `bpot__stat bpot__stat--pot${n > 0 ? " bpot__stat--tick" : ""}`,
					"data-testid": "pot-display",
					children: [/* @__PURE__ */ (0, C.jsx)("dt", { children: "Table pot" }), /* @__PURE__ */ (0, C.jsx)("dd", { children: ml(e.currentPot) })]
				}, n > 0 ? `pot-${n}` : "pot-static"),
				/* @__PURE__ */ (0, C.jsxs)("div", {
					className: "bpot__stat",
					"data-testid": "ante-display",
					children: [/* @__PURE__ */ (0, C.jsx)("dt", { children: "Ante / hand" }), /* @__PURE__ */ (0, C.jsx)("dd", { children: hl(e.anteAmount) })]
				}),
				e.limEnabled && /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [/* @__PURE__ */ (0, C.jsxs)("div", {
					className: "bpot__stat",
					children: [/* @__PURE__ */ (0, C.jsx)("dt", { children: "Cap" }), /* @__PURE__ */ (0, C.jsxs)("dd", { children: [ml(e.potCap), /* @__PURE__ */ (0, C.jsx)("span", {
						className: "bpot__lim-tag",
						children: "LmT"
					})] })]
				}), /* @__PURE__ */ (0, C.jsxs)("div", {
					className: "bpot__stat bpot__stat--highlight",
					children: [/* @__PURE__ */ (0, C.jsx)("dt", { children: "Max win" }), /* @__PURE__ */ (0, C.jsx)("dd", { children: ml(e.maxWinThisHand) })]
				})] })
			]
		}),
		e.limEnabled && e.overflow > 0 && /* @__PURE__ */ (0, C.jsxs)("div", {
			className: "center-play__carry muted small",
			children: [
				"+",
				ml(e.overflow),
				" carry"
			]
		}),
		/* @__PURE__ */ (0, C.jsxs)("div", {
			className: "center-play__meta muted small",
			children: [t, " in hand"]
		})
	] });
}
var $l = (0, l.memo)(Ql);
//#endregion
//#region src/table/PotCenter.tsx
function eu({ potMetrics: e, participantCount: t, trumpUpcard: n, trumpSuit: r, phase: i, enrollmentActive: a = !1, remainingDeckCount: o, trickDisplayPlays: s = [], trickLeadSuit: c = null, trickLeaderPlayerId: u = null, trickWinnerPlayerId: f = null, trickShowWinnerTag: p = !1, trickPresentationPhase: m = "live", trickEchoPlays: h = [], trickEchoWinnerId: g = null, trickEchoPhase: _ = "live", showFinalTrickEcho: v = !1, playerNames: y = {}, anteAnimActive: b = !1, trumpRevealActive: x = !1, drawAnimPlayerId: S = null, drawAnimSubPhase: T = "done", drawDiscardCount: E = 0, settleAnimActive: D = !1, settleCarryOver: O = !1, potTick: k = 0, trumpReminderPulse: A = 0, hideCenterTrump: j = !1, showTrumpSuitReminder: M = !1, instantTrickPlays: ee = !1, peakTrickPlayCount: N = 0, discardPileCards: te = [] }) {
	let P = Ka(i, a), F = u ?? ((m === "live" || m === "trickComplete") && s.length > 0 ? Rl(s, c ?? s[0]?.card.suit ?? null, r ?? null) : null), I = m !== "live" && m !== "nextLeadReady", ne = s.length, L = ne > 0 || N > ne || ee, [R, z] = (0, l.useState)(n ?? null);
	(0, l.useEffect)(() => {
		if (n) {
			z(n);
			return;
		}
		if (R) {
			if (L || I) {
				let e = window.setTimeout(() => z(null), 760);
				return () => window.clearTimeout(e);
			}
			z(null);
		}
	}, [
		n,
		L,
		I,
		R
	]);
	let B = !!R && !j, V = M || !B && !!r && i === "play", re = B ? `${R.rank}-${R.suit}` : "trump-slot", ie = v || D && h.length > 0 && ne === 0;
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		className: "table-center-cluster",
		"aria-label": "Table center",
		children: [/* @__PURE__ */ (0, C.jsxs)("div", {
			className: "deck-stack",
			"aria-label": "Deck and trump",
			children: [B ? /* @__PURE__ */ (0, C.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"bpot__trump--deal",
					x ? "bpot__trump--reveal" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-button",
				"data-trump-deal-target": "",
				children: [/* @__PURE__ */ (0, C.jsx)(w, {
					card: {
						rank: R.rank,
						suit: R.suit
					},
					size: "sm",
					state: "trump"
				}), /* @__PURE__ */ (0, C.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, re) : V ? /* @__PURE__ */ (0, C.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"deck-stack__trump--suit-reminder",
					A > 0 ? "deck-stack__trump--suit-reminder-pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-suit-reminder",
				"aria-label": `Trump suit: ${Ya(r)}`,
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
				I ? "center-play--trick-resolving" : "",
				ie ? "center-play--final-trick-echo" : ""
			].filter(Boolean).join(" "),
			"data-trick-phase": m,
			"data-trick-cards": ne,
			"data-hand-settling": D ? "true" : "false",
			children: [
				b && /* @__PURE__ */ (0, C.jsx)("div", {
					className: "bpot__ante-chips",
					"aria-hidden": "true",
					children: Array.from({ length: Math.min(t, 8) }, (e, t) => /* @__PURE__ */ (0, C.jsx)("span", {
						className: "bpot__ante-chip",
						style: { "--ante-i": t }
					}, t))
				}),
				i === "draw" ? /* @__PURE__ */ (0, C.jsx)(Zl, { cards: te }) : null,
				/* @__PURE__ */ (0, C.jsxs)("div", {
					className: "center-play__phase",
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, C.jsx)("span", {
							className: `bpot__phase-tag bpot__phase-tag--${i ?? "waiting"}`,
							"data-testid": "phase-tag-center",
							"data-phase": i ?? "waiting",
							children: P
						}),
						B && r && /* @__PURE__ */ (0, C.jsx)("span", {
							className: "center-play__trump-suit muted small",
							children: Ya(r)
						}),
						V && /* @__PURE__ */ (0, C.jsxs)("span", {
							className: "center-play__trump-suit center-play__trump-suit--reminder muted small",
							children: [Ya(r), " trump"]
						})
					]
				}),
				/* @__PURE__ */ (0, C.jsxs)("div", {
					className: "center-play__trick-stage",
					children: [/* @__PURE__ */ (0, C.jsx)("div", {
						className: "center-play__trick-live",
						children: /* @__PURE__ */ (0, C.jsx)(Xl, {
							displayPlays: s,
							leaderPlayerId: F,
							winnerPlayerId: f,
							showWinnerTag: p,
							presentationPhase: m,
							playerNames: y,
							instantTrickPlays: ee,
							peakCardCount: N
						})
					}), ie && /* @__PURE__ */ (0, C.jsx)("div", {
						className: "center-play__trick-echo",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, C.jsx)(Xl, {
							displayPlays: h,
							winnerPlayerId: g,
							showWinnerTag: !0,
							presentationPhase: _,
							playerNames: y,
							variant: "echo"
						})
					})]
				}),
				/* @__PURE__ */ (0, C.jsx)($l, {
					potMetrics: e,
					participantCount: t,
					potTick: k
				})
			]
		})]
	});
}
var tu = (0, l.memo)(eu);
//#endregion
//#region src/table/hooks/useExternalStoreSelector.ts
function nu(e, t, n, r) {
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
var ru = null, iu = /* @__PURE__ */ new Set();
function au(e) {
	return e.map((e) => `${e.playerId}:${e.card.rank}:${e.card.suit}`).join("|");
}
function ou(e) {
	return Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => `${e}:${t}`).join("|");
}
function su(e, t) {
	return e ? e.phase !== t.phase || e.revealedCount !== t.revealedCount || e.revealTarget !== t.revealTarget || e.peakPlayCount !== t.peakPlayCount || e.winnerPlayerId !== t.winnerPlayerId || e.showWinnerTag !== t.showWinnerTag || e.trickWinnerSeatId !== t.trickWinnerSeatId || e.suppressTurnPlayerId !== t.suppressTurnPlayerId || e.isPipelineActive !== t.isPipelineActive || e.isResolving !== t.isResolving || e.showFinalTrickEcho !== t.showFinalTrickEcho || e.trickEchoWinnerId !== t.trickEchoWinnerId || e.trickEchoPhase !== t.trickEchoPhase || au(e.displayPlays) !== au(t.displayPlays) || au(e.trickEchoPlays) !== au(t.trickEchoPlays) || ou(e.displayTricksByPlayer) !== ou(t.displayTricksByPlayer) || e.frozenTrick?.trickNumber !== t.frozenTrick?.trickNumber || e.frozenTrick?.winnerId !== t.frozenTrick?.winnerId || (e.frozenTrick?.plays.length ?? 0) !== (t.frozenTrick?.plays.length ?? 0) : !0;
}
function cu(e) {
	ru && !su(ru, e) || (ru = e, iu.forEach((e) => e()));
}
function lu(e) {
	return iu.add(e), () => iu.delete(e);
}
function uu() {
	return ru;
}
function du() {
	ru = null, iu.forEach((e) => e());
}
//#endregion
//#region src/table/trickPresentationSelectors.ts
var fu = {};
function pu(e, t) {
	let n = Object.keys(e), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let r of n) if (e[r] !== t[r]) return !1;
	return !0;
}
function mu(e) {
	return e ? {
		phase: e.phase,
		displayTricksByPlayer: e.displayTricksByPlayer,
		trickWinnerSeatId: e.trickWinnerSeatId,
		suppressTurnPlayerId: e.suppressTurnPlayerId
	} : {
		phase: "live",
		displayTricksByPlayer: fu,
		trickWinnerSeatId: null,
		suppressTurnPlayerId: !1
	};
}
function hu(e, t) {
	return e.phase === t.phase && e.trickWinnerSeatId === t.trickWinnerSeatId && e.suppressTurnPlayerId === t.suppressTurnPlayerId && pu(e.displayTricksByPlayer, t.displayTricksByPlayer);
}
function gu(e) {
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
function _u(e, t) {
	return e.trickDisplayPlays === t.trickDisplayPlays && e.trickWinnerPlayerId === t.trickWinnerPlayerId && e.trickShowWinnerTag === t.trickShowWinnerTag && e.trickPresentationPhase === t.trickPresentationPhase && e.trickEchoPlays === t.trickEchoPlays && e.trickEchoWinnerId === t.trickEchoWinnerId && e.trickEchoPhase === t.trickEchoPhase && e.showFinalTrickEcho === t.showFinalTrickEcho && e.peakTrickPlayCount === t.peakTrickPlayCount;
}
function vu(e) {
	return e ? {
		phase: e.phase,
		trickWinnerSeatId: e.trickWinnerSeatId,
		frozenTrick: e.frozenTrick,
		displayTricksByPlayer: e.displayTricksByPlayer
	} : {
		phase: "live",
		trickWinnerSeatId: null,
		frozenTrick: null,
		displayTricksByPlayer: fu
	};
}
function yu(e, t) {
	return e.phase === t.phase && e.trickWinnerSeatId === t.trickWinnerSeatId && e.frozenTrick === t.frozenTrick && pu(e.displayTricksByPlayer, t.displayTricksByPlayer);
}
var bu = () => {};
function xu(e) {
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
		displayTricksByPlayer: fu,
		trickWinnerSeatId: null,
		suppressTurnPlayerId: !1,
		forceHandEndDrain: bu
	};
}
function Su(e, t) {
	return e.phase === t.phase && e.isPipelineActive === t.isPipelineActive && e.revealedCount === t.revealedCount && e.revealTarget === t.revealTarget && e.peakPlayCount === t.peakPlayCount && e.displayPlaysLength === t.displayPlaysLength && pu(e.displayTricksByPlayer, t.displayTricksByPlayer) && e.trickWinnerSeatId === t.trickWinnerSeatId && e.suppressTurnPlayerId === t.suppressTurnPlayerId;
}
//#endregion
//#region src/table/ConnectedPotCenter.tsx
function Cu(e) {
	let t = nu(lu, uu, gu, _u);
	return /* @__PURE__ */ (0, C.jsx)(tu, {
		...e,
		...t
	});
}
var wu = (0, l.memo)(Cu);
//#endregion
//#region src/table/SmartHud.tsx
function Tu({ label: e, value: t, accent: n, title: r }) {
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
function Eu({ player: e, compact: t = !1 }) {
	let n = e.apeScore != null && !e.isRobot;
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		className: `bhud${t ? " bhud--compact" : ""}`,
		"aria-label": `${e.displayName} stats`,
		children: [n && /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
			/* @__PURE__ */ (0, C.jsx)(Tu, {
				label: "Ape",
				value: e.apeScore ?? 0,
				accent: !0,
				title: "Ape Score"
			}),
			e.apeClass && /* @__PURE__ */ (0, C.jsx)(Tu, {
				label: "Class",
				value: e.apeClass,
				title: "Ape Class"
			}),
			e.apeStatus && /* @__PURE__ */ (0, C.jsx)(Tu, {
				label: "Status",
				value: e.apeStatus,
				title: "Ape Status"
			})
		] }), e.sessionStreak != null && e.sessionStreak > 0 && /* @__PURE__ */ (0, C.jsx)(Tu, {
			label: "Streak",
			value: e.sessionStreak,
			title: "Hands won this session"
		})]
	});
}
//#endregion
//#region src/session/liveHand.ts
function Du() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function Ou(e) {
	let t = e ?? Du();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function ku(e) {
	if (!e) return !1;
	let t = e.phase ?? null;
	if (t !== "draw" && t !== "play" && t !== "reveal" && t !== "decision") return !1;
	let n = e.participantIds ?? [];
	if (n.length === 0) return !1;
	let r = e.tricksByPlayer ?? {};
	return !(ul(r, n) || ll(r, n) >= 5);
}
function Au(e) {
	if (!e) return 0;
	let t = e.phase ?? "", n = t === "play" ? 1e3 : t === "draw" ? 100 : t === "decision" ? 50 : t === "reveal" ? 25 : 0;
	n += (e.drawCompletedIds?.length ?? 0) * 10;
	let r = e.participantIds ?? [];
	n += ll(e.tricksByPlayer ?? {}, r);
	let i = e.handDecision;
	return t === "decision" && i && (n += (i.currentIndex ?? 0) * 5, n += (i.playingIds?.length ?? 0) * 2, n += (i.passedIds?.length ?? 0) * 2), n;
}
function ju(e, t) {
	return ku(t) ? ku(e) ? Au(t) >= Au(e) ? t : e : t : e;
}
function Mu(e) {
	let t = e?.phase ?? null;
	return t === "reveal" || t === "decision" || t === "draw" || t === "play";
}
function Nu(e) {
	let t = e?.currentHand ?? Du(), n = e?.liveEnrollment?.deal?.publicHand, r = n?.phase ?? null;
	if (Ou(t) && n && !ku(n)) return Du();
	if (ku(t) && ku(n)) {
		let e = t.phase === "reveal" || t.phase === "decision", r = n?.drawCompletedIds?.length ?? 0, i = t.drawCompletedIds?.length ?? 0, a = ll(n?.tricksByPlayer ?? {}, n?.participantIds ?? []), o = ll(t.tricksByPlayer ?? {}, t.participantIds ?? []);
		return e && n?.phase === "draw" && o === 0 && a === 0 && r > 0 && i === 0 ? t : ju(t, n);
	}
	if (ku(t)) return t;
	if (r === "draw" || r === "play" || r === "reveal" || r === "decision") {
		if (ku(n)) {
			let i = ll(n?.tricksByPlayer ?? {}, n?.participantIds ?? []);
			return Ou(t) && i === 0 && r === "draw" && !e?.liveEnrollment?.active ? Du() : n;
		}
		return n?.phase ? n : Mu(t) ? t : Ou(t) ? Du() : t;
	}
	return r && n ? n : t;
}
function Pu(e) {
	let t = Nu(e), n = t?.phase ?? null;
	if (n === "reveal" || n === "draw" || n === "play") return null;
	if (n === "decision") {
		let e = Eo(t.handDecision ?? null);
		if (e?.active) return e;
	}
	let r = e?.liveEnrollment, i = r?.deal?.publicHand?.phase ?? null;
	return r?.active ? r : i === "draw" || i === "play" || i === "reveal" || i === "decision" ? null : e?.handEnrollment?.active ? e.handEnrollment : e?.handEnrollment ?? null;
}
function Fu(e) {
	return !e.cardsDealt && e.handParticipantCount === 0 && e.enrollmentActive;
}
function Iu(e, t) {
	return e === "decision" && t?.active === !0;
}
function Lu(e) {
	return e.pagatDecisionActive && e.handDecision ? (e.handDecision.orderedPlayerIds ?? [])[e.handDecision.currentIndex ?? 0] ?? null : e.legacyEnrollmentActive && e.enrollment?.active ? (e.enrollment.orderedPlayerIds ?? [])[e.enrollment.currentIndex ?? 0] ?? null : null;
}
function Ru(e) {
	if (!e.participantIds?.includes(e.playerId)) return !1;
	let t = e.phase ?? null;
	return t === "draw" || t === "play";
}
//#endregion
//#region src/session/handPhaseMachine.ts
var Q = {
	WAITING: "waiting",
	ENROLLMENT: "enrollment",
	DEAL: "deal",
	DRAW: "draw",
	PLAY: "play",
	SETTLE: "settle",
	NEXT_HAND_PREP: "next-hand-prep"
}, zu = [
	{
		from: Q.WAITING,
		event: "open_enrollment",
		to: Q.ENROLLMENT
	},
	{
		from: Q.WAITING,
		event: "deal_cards",
		to: Q.DEAL
	},
	{
		from: Q.NEXT_HAND_PREP,
		event: "open_enrollment",
		to: Q.ENROLLMENT
	},
	{
		from: Q.NEXT_HAND_PREP,
		event: "deal_cards",
		to: Q.DEAL
	},
	{
		from: Q.NEXT_HAND_PREP,
		event: "prep_complete",
		to: Q.WAITING
	},
	{
		from: Q.ENROLLMENT,
		event: "enrollment_step",
		to: Q.ENROLLMENT
	},
	{
		from: Q.ENROLLMENT,
		event: "enrollment_complete",
		to: Q.DEAL
	},
	{
		from: Q.ENROLLMENT,
		event: "solo_win",
		to: Q.SETTLE
	},
	{
		from: Q.ENROLLMENT,
		event: "decision_complete",
		to: Q.DRAW
	},
	{
		from: Q.DEAL,
		event: "advance_reveal",
		to: Q.DRAW
	},
	{
		from: Q.DEAL,
		event: "decision_step",
		to: Q.ENROLLMENT
	},
	{
		from: Q.DRAW,
		event: "submit_draw",
		to: Q.DRAW
	},
	{
		from: Q.DRAW,
		event: "draw_fold",
		to: Q.DRAW
	},
	{
		from: Q.DRAW,
		event: "draw_complete",
		to: Q.PLAY
	},
	{
		from: Q.DRAW,
		event: "solo_win",
		to: Q.SETTLE
	},
	{
		from: Q.PLAY,
		event: "play_card",
		to: Q.PLAY
	},
	{
		from: Q.PLAY,
		event: "hand_complete",
		to: Q.SETTLE
	},
	{
		from: Q.SETTLE,
		event: "cowin_pending",
		to: Q.SETTLE
	},
	{
		from: Q.SETTLE,
		event: "record_hand",
		to: Q.NEXT_HAND_PREP
	},
	{
		from: Q.NEXT_HAND_PREP,
		event: "session_final",
		to: Q.WAITING
	}
], Bu = (e, t) => `${e}:${t}`;
new Map(zu.map((e) => [Bu(e.from, e.event), e.to]));
function Vu(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
function Hu(e, t) {
	return !e || !t ? !1 : e === t ? !0 : Vu(e);
}
function Uu() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function Wu(e) {
	let t = e.session, n = t ? Nu(t) : Uu(), r = n.phase ?? null, i = n.participantIds ?? [], a = n.tricksByPlayer ?? {}, o = ll(a, i), s = i.length > 0 && ul(a, i), c = !!t?.pendingCoWinSettlement?.winnerIds?.length, l = t ? Pu(t) : null, u = Iu(r, n.handDecision ?? null), d = Fu({
		cardsDealt: r === To.REVEAL || r === To.DECISION || r === To.DRAW || r === To.PLAY,
		handParticipantCount: i.length,
		enrollmentActive: !!l?.active
	}), f = d || u, p = Gu({
		sessionStatus: t?.status ?? null,
		handPhase: r,
		participantIds: i,
		trickCount: o,
		handComplete: s,
		pendingCoWin: c,
		enrollmentActive: f,
		handCount: t?.handCount ?? 0,
		clearedHand: Ou(n)
	});
	return {
		phase: p,
		handPhase: r,
		enrollmentActive: f,
		pagatDecisionActive: u,
		participantIds: i,
		turnPlayerId: Ku({
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
function Gu(e) {
	if (e.sessionStatus === "final") return Q.WAITING;
	if (e.pendingCoWin) return Q.SETTLE;
	let t = e.handPhase ?? null, n = e.participantIds ?? [];
	return t === To.PLAY ? e.handComplete || (e.trickCount ?? 0) >= 5 ? Q.SETTLE : Q.PLAY : t === To.DRAW ? Q.DRAW : t === To.REVEAL ? Q.DEAL : t === To.DECISION || e.enrollmentActive ? Q.ENROLLMENT : e.clearedHand !== !1 && n.length === 0 && (e.handCount ?? 0) > 0 && !e.enrollmentActive ? Q.NEXT_HAND_PREP : Q.WAITING;
}
function Ku(e) {
	let { phase: t, hand: n, enrollment: r, pagatDecisionActive: i, legacyEnrollmentActive: a } = e;
	return t === Q.ENROLLMENT ? Lu({
		pagatDecisionActive: i,
		handDecision: n.handDecision ?? null,
		legacyEnrollmentActive: a,
		enrollment: r
	}) : t === Q.DRAW || t === Q.PLAY ? n.turnPlayerId ?? null : null;
}
function qu(e) {
	let { snapshot: t, action: n, playerId: r, actorId: i, suppressTurn: a = !1 } = e, o = e.drawCompletedIds ?? [];
	if (!Hu(r, i)) return {
		ok: !1,
		reason: "actor_mismatch"
	};
	switch (n) {
		case "enrollment_in":
		case "enrollment_pass": return t.phase === Q.ENROLLMENT ? t.turnPlayerId === r ? { ok: !0 } : {
			ok: !1,
			reason: "not_your_turn"
		} : {
			ok: !1,
			reason: "not_enrollment"
		};
		case "enrollment_timeout": return t.phase === Q.ENROLLMENT ? { ok: !0 } : {
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
		case "advance_reveal": return t.phase === Q.DEAL ? { ok: !0 } : {
			ok: !1,
			reason: "not_deal"
		};
		case "submit_draw":
		case "draw_fold": return t.phase === Q.DRAW ? t.turnPlayerId === r ? o.includes(r) ? {
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
		case "play_card": return t.phase === Q.PLAY ? t.handComplete ? {
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
		case "record_hand": return t.phase !== Q.SETTLE && !t.handComplete ? {
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
var Ju = 15e3, Yu = new Set([
	Q.ENROLLMENT,
	Q.DRAW,
	Q.PLAY
]);
function Xu(e) {
	return e > 1e4 ? "green" : e > 5e3 ? "yellow" : "red";
}
function Zu(e) {
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
function Qu(e) {
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
function $u(e) {
	if (e.suppressTurn) return null;
	if (e.session.phase === "play") return e.session.turnPlayerId ?? null;
	if (e.handComplete) return null;
	let t = Wu({
		session: Qu(e),
		suppressTurn: e.suppressTurn
	});
	return Yu.has(t.phase) ? t.turnPlayerId : null;
}
function ed(e, t, n) {
	let r = Ju - Math.max(0, n - t) % Ju;
	return {
		playerId: e,
		remainingMs: r,
		progress: r / Ju,
		segment: Xu(r)
	};
}
//#endregion
//#region src/table/TurnCountdownRing.tsx
var td = 22, nd = 2 * Math.PI * td;
function rd({ activityKey: e, startedAtMs: t, reducedMotion: n = Hl() }) {
	let [r, i] = (0, l.useState)(1), [a, o] = (0, l.useState)("green"), s = (0, l.useRef)(null), c = (0, l.useRef)(t);
	c.current = t, (0, l.useEffect)(() => {
		let e = (e) => {
			let t = ed("local", c.current, e);
			t && (i(t.progress), o(t.segment));
		};
		if (n) {
			e(Date.now());
			let t = window.setInterval(() => e(Date.now()), 250);
			return () => window.clearInterval(t);
		}
		let t = (n) => {
			e(n), s.current = window.requestAnimationFrame(t);
		};
		return s.current = window.requestAnimationFrame(t), () => {
			s.current != null && (window.cancelAnimationFrame(s.current), s.current = null);
		};
	}, [e, n]);
	let u = nd * (1 - Math.max(0, Math.min(1, r)));
	return /* @__PURE__ */ (0, C.jsxs)("svg", {
		className: ["bseat__turn-countdown", n ? "bseat__turn-countdown--reduced" : ""].filter(Boolean).join(" "),
		viewBox: "0 0 48 48",
		"aria-hidden": "true",
		"data-testid": "turn-countdown-ring",
		"data-turn-segment": a,
		children: [/* @__PURE__ */ (0, C.jsx)("circle", {
			className: "bseat__turn-countdown-track",
			cx: "24",
			cy: "24",
			r: td,
			fill: "none"
		}), /* @__PURE__ */ (0, C.jsx)("circle", {
			className: `bseat__turn-countdown-progress bseat__turn-countdown-progress--${a}`,
			cx: "24",
			cy: "24",
			r: td,
			fill: "none",
			strokeDasharray: nd,
			strokeDashoffset: u,
			transform: "rotate(-90 24 24)"
		})]
	});
}
var id = (0, l.memo)(rd), ad = null, od = /* @__PURE__ */ new Set();
function sd() {
	od.forEach((e) => e());
}
function cd(e, t) {
	return e === t ? !1 : !e || !t ? !0 : e.playerId !== t.playerId || e.activityKey !== t.activityKey || e.startedAtMs !== t.startedAtMs;
}
function ld(e) {
	cd(ad, e) && (ad = e, sd());
}
function ud(e) {
	return od.add(e), () => od.delete(e);
}
function dd() {
	return ad;
}
function fd(e) {
	let t = $u(e), n = Zu({
		...e,
		activeActorId: t
	});
	if (!t) {
		ld(null);
		return;
	}
	if (!ad || ad.activityKey !== n) {
		ld({
			playerId: t,
			activityKey: n,
			startedAtMs: Date.now()
		});
		return;
	}
	ad.playerId !== t && ld({
		...ad,
		playerId: t
	});
}
function pd() {
	ad = null, sd();
}
//#endregion
//#region src/table/ConnectedTurnCountdownRing.tsx
function md({ playerId: e }) {
	let t = (0, l.useSyncExternalStore)(ud, dd);
	return !t || t.playerId !== e ? null : /* @__PURE__ */ (0, C.jsx)(id, {
		activityKey: t.activityKey,
		startedAtMs: t.startedAtMs
	});
}
var hd = (0, l.memo)(md);
//#endregion
//#region src/table/SeatAvatarIdentity.tsx
function gd({ displayName: e, photoURL: t, isDealer: n = !1, dealerMoved: r = !1, inHand: i = !1, bourrePressure: a = !1, bourrePulse: o = !1, countdownPlayerId: s = null, peek: c = !1, onTogglePeek: u, onBlurPeek: d }) {
	let f = yl(e), p = t?.trim() || null, m = (0, l.useCallback)((e) => {
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
					s && /* @__PURE__ */ (0, C.jsx)(hd, { playerId: s })
				]
			})
		}), /* @__PURE__ */ (0, C.jsx)("span", {
			className: "bseat__avatar-label",
			title: f,
			children: f
		})]
	});
}
var _d = (0, l.memo)(gd);
//#endregion
//#region src/table/SeatHoleCards.tsx
function vd({ playerId: e, cardsHeld: t, revealedTrumpIndex: n = null, revealedTrumpUpcard: r = null, seatTrumpMergeActive: i = !1 }) {
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
var $ = (0, l.memo)(vd);
//#endregion
//#region src/table/SeatWonTrickPile.tsx
function yd({ playerId: e, trickCount: t }) {
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
var bd = (0, l.memo)(yd);
//#endregion
//#region src/table/seatPlayerEqual.ts
function xd(e, t) {
	return e === t ? !0 : !e || !t ? !e && !t : e.rank === t.rank && e.suit === t.suit;
}
function Sd(e, t) {
	return e.playerId === t.playerId && e.displayName === t.displayName && e.photoURL === t.photoURL && e.bankroll === t.bankroll && e.isOut === t.isOut && e.bankrollTick === t.bankrollTick && e.bourreAlert === t.bourreAlert && e.bourrePressure === t.bourrePressure && e.inHand === t.inHand && e.tricksThisHand === t.tricksThisHand && e.isSelf === t.isSelf && e.isDealer === t.isDealer && e.isLeading === t.isLeading && e.isWinner === t.isWinner && e.enrollmentSatOut === t.enrollmentSatOut && e.enrollmentJoined === t.enrollmentJoined && e.canToggleInHand === t.canToggleInHand && e.canPassEnrollment === t.canPassEnrollment && e.decisionPlannedDiscards === t.decisionPlannedDiscards && e.canEditTricks === t.canEditTricks && e.showHoleCards === t.showHoleCards && e.holeCardCount === t.holeCardCount && e.revealedTrumpIndex === t.revealedTrumpIndex && e.seatTrumpMergeActive === t.seatTrumpMergeActive && xd(e.revealedTrumpUpcard, t.revealedTrumpUpcard) && e.isOnTurn === t.isOnTurn && e.isActiveActor === t.isActiveActor && e.isTrickCapture === t.isTrickCapture && e.enrollmentPulse === t.enrollmentPulse && e.drawAnimSubPhase === t.drawAnimSubPhase && e.drawDiscardCount === t.drawDiscardCount && e.drawReplaceCount === t.drawReplaceCount && e.apeScore === t.apeScore && e.apeClass === t.apeClass && e.apeStatus === t.apeStatus && e.sessionStreak === t.sessionStreak && e.dealerMoved === t.dealerMoved && e.trumpMerging === t.trumpMerging && e.winnerFlash === t.winnerFlash;
}
//#endregion
//#region src/table/Seat.tsx
function Cd({ player: e, region: t, handLane: n = "below", style: r, clockwiseDealing: i = !1, countdownPlayerId: a = null, onToggleInHand: o, onPassEnrollment: s, onTrickDelta: c, onReaction: u }) {
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
								v && /* @__PURE__ */ (0, C.jsx)(bd, {
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
								y && /* @__PURE__ */ (0, C.jsx)($, {
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
								/* @__PURE__ */ (0, C.jsx)(_d, {
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
							"aria-label": `Chips ${_l(e.bankroll ?? 0)}`,
							title: `Chips ${_l(e.bankroll ?? 0)}`,
							children: _l(e.bankroll ?? 0)
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
						children: /* @__PURE__ */ (0, C.jsx)(Eu, {
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
function wd(e, t) {
	return e.region === t.region && e.handLane === t.handLane && e.clockwiseDealing === t.clockwiseDealing && e.countdownPlayerId === t.countdownPlayerId && e.style.left === t.style.left && e.style.top === t.style.top && e.onToggleInHand === t.onToggleInHand && e.onPassEnrollment === t.onPassEnrollment && e.onTrickDelta === t.onTrickDelta && e.onReaction === t.onReaction && Sd(e.player, t.player);
}
var Td = (0, l.memo)(Cd, wd);
//#endregion
//#region src/table/layout/sevenPlayerMobileSeatMap.ts
function Ed(e) {
	let t = sl(e);
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
function Dd(e) {
	return e === 7;
}
function Od(e, t) {
	return e < 0 || e > 6 ? null : Ed(t)[e] ?? null;
}
function kd(e, t, n) {
	let r = Od(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: qd(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 7
		})
	} : null;
}
//#endregion
//#region src/table/layout/eightPlayerMobileSeatMap.ts
function Ad(e) {
	let t = cl(e);
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
function jd(e) {
	return e >= 8;
}
function Md(e, t) {
	return e < 0 || e > 7 ? null : Ad(t)[e] ?? null;
}
function Nd(e, t, n) {
	let r = Md(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: qd(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 8
		})
	} : null;
}
//#endregion
//#region src/table/layout/fourPlayerMobileSeatMap.ts
function Pd(e) {
	return e === 5;
}
function Fd(e) {
	let t = sl(e);
	return {
		0: t[0],
		1: t[1],
		2: t[3],
		3: t[5],
		4: t[6]
	};
}
function Id(e, t, n) {
	if (e < 0 || e > 4) return null;
	let r = Fd(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: qd(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 5
		})
	} : null;
}
//#endregion
//#region src/table/layout/fivePlayerMobileSeatMap.ts
var Ld = {
	min: 8,
	max: 92
};
function Rd(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function zd(e, t) {
	let n = t === "landscape" ? 54 : 56;
	return {
		...e,
		x: Rd(e.x, Ld.min, Ld.max),
		y: Rd(e.y, 8, n)
	};
}
function Bd(e) {
	return e === 6;
}
function Vd(e) {
	let t = sl(e), n = [
		2,
		3,
		4
	].map((t) => zd(Dl(t, 6), e));
	return {
		0: t[0],
		1: t[1],
		2: n[0],
		3: n[1],
		4: n[2],
		5: t[6]
	};
}
function Hd(e, t, n) {
	if (e < 0 || e > 5) return null;
	let r = Vd(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: qd(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 6
		})
	} : null;
}
//#endregion
//#region src/table/layout/seatLayout.ts
var Ud = {
	min: 8,
	max: 92
}, Wd = 56, Gd = 54;
function Kd(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function qd(e, t) {
	return t.isSelf || t.isMobile ? "below" : t.total >= 6 && e.region === "left" && e.x < 14 || t.total >= 6 && e.region === "right" && e.x > 86 ? "side" : "below";
}
function Jd(e, t) {
	let n = Kd(e.x, Ud.min, Ud.max), r = t === "portrait" ? Wd : Gd, i = Kd(e.y, 8, r);
	return {
		...e,
		x: n,
		y: i
	};
}
function Yd(e, t, n) {
	if (n.isMobile && n.orientation && Pd(t)) {
		let t = Id(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && Bd(t)) {
		let t = Hd(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && Dd(t)) {
		let t = kd(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && jd(t)) {
		let t = Nd(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	let r = Dl(e, t), i = n.isMobile && n.orientation ? Jd(r, n.orientation) : r;
	return {
		...i,
		seatIndex: e,
		handLane: qd(i, {
			isMobile: n.isMobile,
			isSelf: n.isSelf,
			total: t
		})
	};
}
function Xd(e, t, n) {
	return Yd(e + 1, t, {
		isMobile: !0,
		isSelf: !1,
		orientation: n
	});
}
function Zd(e, t = "portrait") {
	if (Pd(e)) {
		let e = Id(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (Bd(e)) {
		let e = Hd(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (Dd(e)) {
		let e = kd(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (jd(e)) {
		let e = Nd(0, t, { isSelf: !0 });
		if (e) return e;
	}
	let n = Dl(0, Math.max(2, e));
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
function Qd(e, t) {
	return e.seatIndex === t.seatIndex && e.playerCount === t.playerCount && e.isMobile === t.isMobile && e.clockwiseDealing === t.clockwiseDealing && e.seatIndexAttr === t.seatIndexAttr && e.layoutOverride === t.layoutOverride && e.onToggleInHand === t.onToggleInHand && e.onPassEnrollment === t.onPassEnrollment && e.onTrickDelta === t.onTrickDelta && e.onReaction === t.onReaction && e.player.playerId === t.player.playerId && e.player.isSelf === t.player.isSelf && e.player.canToggleInHand === t.player.canToggleInHand && e.player.inHand === t.player.inHand && e.player.canPassEnrollment === t.player.canPassEnrollment && Sd(e.seatPlayer, t.seatPlayer);
}
//#endregion
//#region src/table/TableSeatSlot.tsx
function $d(e) {
	return {
		left: `${e.x}%`,
		top: `${e.y}%`
	};
}
function ef({ seatIndex: e, player: t, seatPlayer: n, playerCount: r, isMobile: i, clockwiseDealing: a, layoutOverride: o, seatIndexAttr: s, onToggleInHand: c, onPassEnrollment: u, onTrickDelta: d, onReaction: f }) {
	let p = (0, l.useMemo)(() => o ?? Yd(e, r, {
		isMobile: i,
		isSelf: t.isSelf
	}), [
		o,
		e,
		r,
		i,
		t.isSelf
	]), m = (0, l.useMemo)(() => $d(p), [p.x, p.y]), h = (0, l.useCallback)(() => {
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
		children: /* @__PURE__ */ (0, C.jsx)(Td, {
			player: n,
			region: p.region,
			handLane: p.handLane,
			clockwiseDealing: a,
			style: m,
			onToggleInHand: h,
			onPassEnrollment: v,
			onTrickDelta: _,
			onReaction: y,
			countdownPlayerId: n.isActiveActor ? n.playerId : null
		})
	});
}
var tf = (0, l.memo)(ef, Qd), nf = 5e3, rf = 1e3, af = 12e3, of = 4e3, sf = 9500;
function cf(e = Hl()) {
	let t = e ? .55 : 1, n = (e) => Math.max(80, Math.round(e * t));
	return {
		anteChipTravelMs: n(220),
		dealCardStaggerMs: n(130),
		dealFanMs: n(600),
		trumpRevealHoldMs: n(nf),
		trumpMergeAnimMs: n(480),
		enrollmentSeatPulseMs: n(480),
		drawDiscardMs: n(400),
		drawReplaceMs: n(700),
		drawReadyBeatMs: n(500),
		settleHoldMs: n(rf),
		nextHandResetMs: n(550),
		handResetMs: n(500)
	};
}
function lf(e, t, n = Hl()) {
	let r = cf(n), i = Math.max(0, e), a = Math.max(0, t);
	return i === 0 && a === 0 ? Math.max(120, Math.round(r.drawDiscardMs * .6)) : i * r.drawDiscardMs + a * r.drawReplaceMs + 80;
}
function uf(e) {
	return e !== "idle" && e !== "enrollment" && e !== "decision" && e !== "play" && e !== "drawPlayer";
}
//#endregion
//#region src/table/layout/seatOrder.ts
function df(e, t) {
	let n = [...new Set(e.filter(Boolean))];
	if (!n.length) return [];
	let r = t.seatedIds?.filter((e) => n.includes(e));
	if (r?.length === n.length) return r;
	let i = t.handEnrollment?.orderedPlayerIds?.filter((e) => n.includes(e));
	if (i?.length === n.length) return i;
	let a = Co(t.dealerId, n), o = n.filter((e) => !a.includes(e));
	return o.length ? [...a, ...o] : a;
}
function ff(e, t, n) {
	let r = new Map(e.map((e) => [e.playerId, e])), i = df(e.map((e) => e.playerId), t);
	if (!i.length) return e;
	let a = n ?? e.find((e) => e.isSelf)?.playerId ?? null, o = a ? i.indexOf(a) : 0;
	return (o > 0 ? [...i.slice(o), ...i.slice(0, o)] : i).map((e) => r.get(e)).filter((e) => e != null);
}
//#endregion
//#region src/table/layout/mobileSeatMap.ts
function pf(e, t) {
	let n = Math.max(1, Math.min(7, e || 1));
	return t === "portrait" ? n <= 1 ? .8 : n <= 2 ? .82 : n <= 3 ? .86 : n <= 4 ? .9 : .94 : n <= 1 ? 1.02 : n <= 2 ? .98 : n <= 3 ? 1.02 : n <= 5 ? 1.16 : 1.26;
}
//#endregion
//#region src/table/trumpHolderPresentation.ts
function mf(e) {
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
function hf(e) {
	return e <= 0 ? null : e - 1;
}
function gf(e, t, n, r, i) {
	if (i || !t.trumpHolderId || e !== t.trumpHolderId || r <= 0) return {
		revealedTrumpUpcard: null,
		revealedTrumpIndex: null,
		seatTrumpMergeActive: !1
	};
	let a = t.showRevealedTrumpAtHolder ? hf(r) : null;
	return {
		revealedTrumpUpcard: t.showRevealedTrumpAtHolder ? n : null,
		revealedTrumpIndex: a,
		seatTrumpMergeActive: t.trumpMergeActive
	};
}
//#endregion
//#region src/table/hooks/useTableSeatModel.ts
function _f({ session: e, players: t, currentUserId: n = null, potMetrics: r, handPresentation: i, microinteractions: a, trumpHolderPresentation: o, mobileOrientation: s = null }) {
	let c = nu(lu, uu, mu, hu), u = (0, l.useMemo)(() => t.map((e) => ({
		...e,
		isSelf: e.isSelf || n != null && e.playerId === n
	})), [t, n]), d = (0, l.useMemo)(() => ff(u, e, n), [
		u,
		e,
		n
	]), f = d.length, p = (0, l.useMemo)(() => d.filter((e) => !e.isSelf), [d]), m = `btable--p${Math.min(8, Math.max(2, f))}`, h = s == null ? Ol(f) : pf(p.length, s), g = cf(), _ = (0, l.useMemo)(() => Object.fromEntries(u.map((e) => [e.playerId, e.displayName])), [u]), v = (0, l.useMemo)(() => new Set(e.participantIds.filter((t) => fl(t, c.displayTricksByPlayer, e.participantIds, e.phase))), [
		e.participantIds,
		e.phase,
		c.displayTricksByPlayer
	]), y = !!(c.suppressTurnPlayerId || i.suppressTurnIndicator), b = (0, l.useMemo)(() => {
		let t = /* @__PURE__ */ new Map();
		for (let n of u) {
			let s = c.displayTricksByPlayer[n.playerId] ?? 0, l = c.trickWinnerSeatId === n.playerId, u = c.phase === "collectTrick" && l, d = i.enrollmentPulse[n.playerId], f = i.animatingDrawPlayerId === n.playerId, p = gf(n.playerId, o, e.trumpUpcard ?? null, n.holeCardCount ?? 0, n.isSelf);
			t.set(n.playerId, {
				...n,
				...p,
				bankroll: vl(n.bankroll, r.anteAmount, {
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
				turnHandoff: !1,
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
			"--trick-sweep-ms": `${jl}ms`,
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": `${kl}ms`,
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": `${kl + 900 + 400 + jl + 230}ms`,
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
function vf(e, t, n) {
	let r = Number.isFinite(e) && e > 0 ? e : 0, i = r > 0 ? Math.max(t, r) : t;
	return {
		height: Math.max(i > 0 ? i : n, n),
		peak: i
	};
}
function yf(e, t, n, r) {
	let i = vf(e, t, n), a = Math.max(152, n);
	return {
		height: i.peak > 0 ? Math.min(i.height, r) : Math.min(a, r),
		peak: i.peak
	};
}
function bf(e, t, n = 72) {
	return vf(e, t, n);
}
function xf(e, t) {
	let n = Math.max(.75, e);
	return t.portrait ? Math.min(n, .98) : Math.min(n, 1.32);
}
function Sf(e) {
	let t = Math.max(2, Math.min(8, e || 4));
	return t <= 3 ? .7 : t <= 4 ? .68 : t <= 5 ? .62 : .56;
}
function Cf(e) {
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
function wf(e) {
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
function Tf(e) {
	return {
		left: e.left,
		top: e.top,
		right: e.right,
		bottom: e.bottom,
		width: e.width,
		height: e.height
	};
}
function Ef(e, t, n = 2) {
	return e.left >= t.left - n && e.top >= t.top - n && e.right <= t.right + n && e.bottom <= t.bottom + n;
}
//#endregion
//#region src/table/presentationMotionBusy.ts
var Df = !1, Of = !1, kf = /* @__PURE__ */ new Set();
function Af() {
	for (let e of kf) e();
}
function jf(e) {
	Df !== e && (Df = e, Af());
}
function Mf() {
	return Df;
}
function Nf(e) {
	Of !== e && (Of = e, Af());
}
function Pf() {
	return Of;
}
function Ff(e) {
	return kf.add(e), () => kf.delete(e);
}
function If() {
	Df = !1, Of = !1, Af();
}
//#endregion
//#region src/table/useMobileTable.ts
var Lf = "(max-width: 900px), ((hover: none) and (pointer: coarse))";
function Rf() {
	let [e, t] = (0, l.useState)(() => typeof window < "u" && window.matchMedia("(max-width: 900px), ((hover: none) and (pointer: coarse))").matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Lf), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/table/hooks/useStageFit.ts
function zf(e, t) {
	if (typeof window > "u") return t;
	let n = document.documentElement, r = getComputedStyle(n).getPropertyValue(e).trim(), i = parseFloat(r);
	return Number.isFinite(i) ? i : t;
}
function Bf(e, t) {
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
function Vf(e) {
	let t = e.closest(".btable-session")?.querySelector(".btable-desktop");
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return n.width <= 0 || n.height <= 0 ? null : {
		width: n.width,
		height: n.height
	};
}
function Hf(e, t) {
	let n = !!e.closest(".table-play-overlay");
	if (t && n) {
		let t = e.closest(".table-play-overlay__main");
		if (t) return t;
	}
	return e.closest(".btable-desktop__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function Uf({ aspect: e, enabled: t = !0, sessionKey: n }) {
	let r = (0, l.useRef)(null), i = (0, l.useRef)(0), a = (0, l.useRef)(0), o = (0, l.useRef)(n), { settings: s } = Hc(), c = Rf();
	return (0, l.useLayoutEffect)(() => {
		if (!t || typeof window > "u") return;
		let l = r.current;
		if (!l) return;
		o.current !== n && (o.current = n, i.current = 0, a.current = 0);
		let u = l.closest(".btable-desktop__viewport") ?? l.closest(".table-play-overlay__main") ?? l.closest(".btable-session"), d = window.visualViewport, f = () => {
			let t = !!l.closest(".table-play-overlay"), n = typeof window < "u" && window.matchMedia("(orientation: portrait)").matches, r = Hf(l, c).getBoundingClientRect(), o = l.querySelector(".hand-panel")?.getBoundingClientRect(), u = t && c && n ? 100 : t && !c ? 120 : c ? 112 : 148, f = t && c && n || t && !c ? 200 : c ? 210 : 280, p = o?.height ?? 0, m = yf(p, i.current, u, f);
			i.current = m.peak;
			let h = m.height, g = c && t ? 12 : c ? 18 : t && !c ? 16 : 28, _ = zf("--stage-fit-pad-x", c ? 8 : 16) + g, v = zf("--stage-fit-pad-y", c ? 6 : 12) + g, y = zf("--stage-fit-gap", c ? 8 : 12), b = d, x = Math.min(r.width, b?.width ?? window.innerWidth), S = Math.min(r.height, b?.height ?? window.innerHeight);
			if (t && c) {
				let e = Vf(l);
				if (e) x = e.width, S = e.height;
				else {
					let e = bf(Bf(l, c), a.current, 72);
					a.current = e.peak, S = Math.max(160, S - e.height);
				}
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = t && c ? 1 : C, T = c ? xf(e, { portrait: n }) : e, E = parseInt(getComputedStyle(l).getPropertyValue("--player-count").trim(), 10) || 4, D = t && c && !n, O = D ? {
				...Cf({
					availWidth: x,
					availHeight: S,
					aspect: T,
					userScale: w,
					padX: _,
					padY: v,
					stageShare: Sf(E)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : wf({
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
				let e = l.querySelector(".table-stage"), a = l.querySelectorAll(".bseat__avatar-wrap"), o = e ? Tf(e.getBoundingClientRect()) : null, s = Tf(document.documentElement.getBoundingClientRect()), u = [...a].filter((e) => !Ef(Tf(e.getBoundingClientRect()), s, 1)).length;
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
			Mf() || Pf() || (p ??= window.requestAnimationFrame(() => {
				p = null, f();
			}));
		}, h = new ResizeObserver(m), g = l.querySelector(".hand-panel");
		g && h.observe(g);
		let _ = Hf(l, c);
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
function Wf({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r, pileIndexRef: i, onDiscardCommitted: a }) {
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
function Gf({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r }) {
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
function Kf(e = document) {
	ma(), Ma();
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = e instanceof Document ? t.body : e;
	for (let e of n.querySelectorAll(".discard-fly-ghost, .draw-receive-fly-ghost")) e.remove();
}
//#endregion
//#region src/table/hooks/useTableDrawMotionCleanup.ts
function qf({ handNumber: e, sessionPhase: t, turnPlayerId: n, drawCompletedIds: r, currentUserId: i, handPresentation: a, tableRootRef: o }) {
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
		s.current !== l && (s.current = l, Kf(c));
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
		e && (Kf(e), s.current = null);
	}, [e, o]);
}
var Jf = /* @__PURE__ */ new Set();
function Yf(e, t = 5) {
	let n = [];
	for (let r = 0; r < t; r += 1) for (let t of e) n.push({
		playerId: t,
		roundIndex: r,
		stepIndex: n.length
	});
	return n;
}
function Xf(e, t = R()) {
	if (e <= 0) return 0;
	let n = t ? .35 : 1, r = Math.round(780 * n), i = Math.round(540 * n);
	return (e - 1) * r + i + Math.round(130 * n);
}
function Zf(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		let e = i.querySelector("[data-trump-deal-target]");
		if (e) return ea(e);
	}
	let a = i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`) ?? i.querySelector(`[data-deal-seat="${e}"] [data-deal-round="${t}"]`), o = a?.querySelector(".pcard") ?? a;
	return o ? ea(o) : null;
}
function Qf(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * .24)
	};
}
function $f(e) {
	let t = document.createElement("div");
	return t.className = "deal-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function ep(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		i.querySelector("[data-trump-deal-target]")?.classList.add("deal-card--revealed");
		return;
	}
	i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`)?.classList.add("deal-card--revealed");
}
function tp(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".deal-card--revealed")) e.classList.remove("deal-card--revealed");
	for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
}
function np() {
	for (let e of Jf) e.kill();
	Jf.clear();
}
function rp({ steps: e, root: t, trumpHolderId: n = null, onStepComplete: r, onComplete: i }) {
	ia(t), np();
	let a = R(), o = L(540 / 1e3, a), s = L(130 / 1e3, a), c = a ? .04 : 110 / 1e3, l = xa(t), u = q.timeline({
		onComplete: () => {
			Jf.delete(u), i?.();
		},
		onInterrupt: () => {
			Jf.delete(u);
			for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
		}
	});
	if (Jf.add(u), !l || e.length === 0) {
		for (let r of e) ep(r.playerId, r.roundIndex, t, n);
		return u.call(() => i?.()), u;
	}
	e.forEach((e, i) => {
		let d = i * (o + s + c), f = Zf(e.playerId, e.roundIndex, t, n);
		u.call(() => {
			if (!f) {
				ep(e.playerId, e.roundIndex, t, n), r?.(e);
				return;
			}
			let i = $f(l);
			t.appendChild(i);
			let c = ea(i), { x: u, y: d } = ra(c, l), p = f.left + f.width / 2, m = f.top + f.height / 2, h = c.left + c.width / 2, g = c.top + c.height / 2, _ = p - h, v = m - g, { midX: y, midY: b } = Qf(_, v);
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
				i.remove(), ep(e.playerId, e.roundIndex, t, n), r?.(e);
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
	let d = Xf(e.length, a) + 120, f = window.setTimeout(() => {
		u.progress() < 1 && u.progress(1);
	}, d);
	return u.eventCallback("onComplete", () => window.clearTimeout(f)), u.eventCallback("onInterrupt", () => window.clearTimeout(f)), u;
}
//#endregion
//#region src/table/hooks/useTableDealPresentation.ts
function ip({ session: e, heroCards: t, privateHandReady: n = !1, tableRootRef: r }) {
	let [i, a] = (0, l.useState)(!1), o = (0, l.useRef)(null), s = (0, l.useRef)(e.handNumber);
	return (0, l.useLayoutEffect)(() => {
		let t = r.current;
		t && s.current !== e.handNumber && (s.current = e.handNumber, o.current = null, np(), tp(t), jf(!1), a(!1));
	}, [e.handNumber, r]), (0, l.useLayoutEffect)(() => {
		let i = r.current;
		if (!i) return;
		let s = e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play", c = t.length;
		if (!s || !n || c < 5) return;
		let l = `${e.handNumber}:${c}:${e.participantIds.join(",")}`;
		if (o.current === l) return;
		let u = df(e.participantIds, e), d = wo(e.dealerId, e.participantIds, u.length ? u : e.participantIds);
		if (d.length < 2) return;
		let f = Yf(d, 5);
		if (!f.length) return;
		o.current = l, np(), tp(i), i.classList.add("btable-wrap--clockwise-dealing"), a(!0), jf(!0);
		let p = Hl(), m = window.requestAnimationFrame(() => {
			rp({
				steps: f,
				root: i,
				trumpHolderId: e.trumpHolderId ?? e.dealerId ?? null,
				onComplete: () => {
					i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), jf(!1);
				}
			});
		}), h = window.setTimeout(() => {
			i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), jf(!1);
		}, Xf(f.length, p) + 400);
		return () => {
			window.cancelAnimationFrame(m), window.clearTimeout(h), np(), i.classList.remove("btable-wrap--clockwise-dealing"), jf(!1), a(!1);
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
function ap(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function op(e, t) {
	return (e >>> t & 65535) / 65535;
}
function sp(e, t) {
	let n = ap(`${e}@book${t}`), r = op(n, 0), i = op(n, 9), a = op(n, 17), o = r >= .5 ? 1 : -1, s = i >= .5 ? 1 : -1;
	return {
		offsetX: o * (1.5 + r * 2.5) + t * 2.2,
		offsetY: t * -1.8 + i * 1.2,
		rotation: s * (4 + a * 5) + t * 2.5,
		scale: .88 - t * .02,
		zIndex: t + 1
	};
}
function cp(e) {
	return `${e.playerId}:h${e.handNumber}:t${e.trickNumber}`;
}
//#endregion
//#region src/table/animations/wonTrickPileMotion.ts
var lp = /* @__PURE__ */ new Set(), up = /* @__PURE__ */ new Set(), dp = I.drawDiscard;
function fp(e, t) {
	return {
		midX: e * .5,
		midY: t * .5
	};
}
function pp(e, t = document) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document, r = n.querySelector(`[data-won-trick-pile-anchor="${e}"]`) ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`);
	return r ? ea(r) : null;
}
function mp() {
	for (let e of up) q.set(e, { clearProps: "opacity,transform,willChange,zIndex" });
	up.clear();
}
function hp(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) e.remove();
}
function gp(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".bseat--pile-reveal-ready")) e.classList.remove("bseat--pile-reveal-ready");
}
function _p(e = document) {
	for (let e of lp) e.kill();
	lp.clear(), hp(e), mp(), gp(e);
}
function vp() {
	for (let e of lp) e.kill();
	lp.clear(), mp();
}
function yp(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function bp(e, t) {
	let n = ea(e), r = document.createElement("div");
	r.className = "won-trick-fly-ghost", r.setAttribute("aria-hidden", "true"), r.style.position = "fixed", r.style.left = `${n.left}px`, r.style.top = `${n.top}px`, r.style.width = `${n.width}px`, r.style.height = `${n.height}px`, r.style.pointerEvents = "none", r.style.zIndex = "4", r.style.transformOrigin = "50% 50%";
	let i = e.cloneNode(!0);
	return i.style.width = "100%", i.style.height = "100%", r.appendChild(i), t.appendChild(r), r;
}
function xp(e, t) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document;
	(n.querySelector(`[data-won-trick-pile-anchor="${e}"]`)?.closest(".bseat") ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`)?.closest(".bseat"))?.classList.add("bseat--pile-reveal-ready");
}
function Sp(e, t) {
	ia(t.root ?? document);
	let n = R(), r = t.root ?? document, i = t.host ?? (r instanceof HTMLElement ? r : document.body), a = pp(t.winnerPlayerId, r), o = n ? .06 : 140 / 1e3, s = L(dp, n), c = n ? .03 : .05, l = [], u = (e) => {
		lp.delete(d);
		for (let e of l) e.remove();
		mp(), e && xp(t.winnerPlayerId, r), t.onComplete?.();
	}, d = q.timeline({
		onComplete: () => u(!0),
		onInterrupt: () => u(!1)
	});
	lp.add(d), e.forEach((e, r) => {
		let u = sp(t.trickKey, t.bookIndex), f = bp(e, i);
		l.push(f), up.add(e), q.set(e, { opacity: 0 });
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
		let h = a.left + a.width / 2 + u.offsetX, g = a.top + a.height / 2 + u.offsetY, _ = p.left + p.width / 2, v = p.top + p.height / 2, y = h - _, b = g - v, { midX: x, midY: S } = fp(y, b);
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
	return yp(d, Math.min(760, Math.max(300, f))), d;
}
function Cp() {
	return lp.size > 0;
}
function wp(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = [...t.querySelectorAll("[data-trick-variant=\"live\"] .btrick__play .pcard, [data-testid=\"trick-row\"] .btrick__play .pcard")].filter((e) => e.closest("[data-trick-variant=\"echo\"]") == null);
	return n.length > 0 ? n : [...t.querySelectorAll("[data-trick-variant=\"echo\"] .btrick__play .pcard")];
}
//#endregion
//#region src/table/hooks/useWonTrickCollection.ts
var Tp = new Set(["nextLeadReady", "live"]);
function Ep({ trickCollection: e, handNumber: t, sessionPhase: n = null, handComplete: r = !1, tableRootRef: i }) {
	let a = (0, l.useRef)(null), o = (0, l.useRef)(t), s = (0, l.useRef)(e.phase), c = (0, l.useRef)(null), u = (0, l.useRef)(!1), d = () => {
		c.current != null && (window.clearTimeout(c.current), c.current = null);
	}, f = (e) => {
		d();
		let t = Cp() ? 820 : 0;
		c.current = window.setTimeout(() => {
			c.current = null, Dp(e);
		}, t);
	};
	(0, l.useLayoutEffect)(() => {
		let e = i.current;
		if (e) {
			if (o.current !== t) {
				o.current = t, a.current = null, d(), _p(e);
				return;
			}
			(r || n != null && n !== "play") && (a.current = null, d(), _p(e));
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
		if (!o || (n === "collectTrick" && Tp.has(r) && (a.current = null, u.current = !1, f(o)), r !== "collectTrick")) return;
		let c = e.trickWinnerSeatId, l = e.frozenTrick;
		if (!c || !l) return;
		let p = `${l.trickNumber}:${c}:${l.plays.length}`;
		if (a.current === p) return;
		a.current = p, u.current = !0, d(), vp(), Op(o);
		let m = wp(o);
		if (!m.length) {
			u.current = !1;
			return;
		}
		let h = Math.max(0, (e.displayTricksByPlayer[c] ?? 1) - 1), g = cp({
			playerId: c,
			handNumber: t,
			trickNumber: l.trickNumber
		});
		Nf(!0);
		let _ = window.setTimeout(() => {
			Sp(m, {
				winnerPlayerId: c,
				trickKey: g,
				bookIndex: h,
				root: o,
				host: o,
				onComplete: () => {
					u.current = !1, Nf(!1);
				}
			});
		}, 240);
		return () => {
			window.clearTimeout(_), u.current = !1, Nf(!1);
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
			d(), e ? _p(e) : vp();
		};
	}, [i]);
}
function Dp(e) {
	for (let t of e.querySelectorAll(".bseat--pile-reveal-ready")) t.classList.remove("bseat--pile-reveal-ready");
}
function Op(e) {
	for (let t of e.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) t.remove();
}
var kp;
function Ap() {
	return kp === void 0 ? !1 : kp;
}
function jp() {
	if (Ap()) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem("nbl-table-render-profile") === "1" ? !0 : new URLSearchParams(window.location.search).get("tableProfile") === "1";
	} catch {
		return !1;
	}
}
function Mp(e, t, n, r, i, a, o = 8) {
	n <= o || console.log("[PROFILE]", {
		id: e,
		phase: t,
		actualDuration: Number(n.toFixed(2)),
		baseDuration: Number(r.toFixed(2)),
		startTime: Number(i.toFixed(2)),
		commitTime: Number(a.toFixed(2))
	});
}
var Np = (e, t, n, r, i, a) => {
	jp() && Mp(e, t, n, r, i, a);
};
//#endregion
//#region src/table/tableProfiler.tsx
function Pp({ id: e, children: t }) {
	return jp() ? /* @__PURE__ */ (0, C.jsx)(l.Profiler, {
		id: e,
		onRender: Np,
		children: t
	}) : /* @__PURE__ */ (0, C.jsx)(C.Fragment, { children: t });
}
//#endregion
//#region src/table/CardTable.tsx
function Fp({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: g, recommendedDiscardIndices: _ = [], handComplete: v = !1, actionFeedback: y, handPresentation: b, microinteractions: x, instantTrickPlays: S = !1, bigPotEvent: w = null, onDismissTableEvent: T, onToggleInHand: E, onPassEnrollment: D, onTrickDelta: O, onSubmitDraw: k, onPassDraw: A, onFoldDraw: j, onPlayCard: M, onReaction: ee, onHeroUserActivity: N }) {
	let { rotated: te, playerCount: P, countClass: F, tableAspect: I, handTiming: ne, playerNames: L, displayPlayersById: R, selfPlayer: z, suppressTurn: B, drawCompleted: V, hasActiveTurn: re, potMetricsForCenter: ie, wrapStyle: ae } = _f({
		session: e,
		players: t,
		currentUserId: m,
		potMetrics: n,
		handPresentation: b,
		microinteractions: x,
		trumpHolderPresentation: f
	}), H = nu(lu, uu, vu, yu), oe = e.sessionId, U = Uf({
		aspect: I,
		sessionKey: oe
	}), { cards: se, pileIndexRef: ce, commitDiscardCards: le } = Ia({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: U
	});
	Wf({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: U,
		pileIndexRef: ce,
		onDiscardCommitted: le
	}), Gf({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: U
	}), qf({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: b,
		tableRootRef: U
	});
	let ue = ip({
		session: e,
		heroCards: a,
		privateHandReady: p,
		tableRootRef: U
	});
	Ep({
		trickCollection: H,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: v,
		tableRootRef: U
	});
	let de = (0, l.useMemo)(() => ({
		potMetrics: ie,
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
		potTick: x.potTick,
		trumpReminderPulse: x.trumpReminderPulse,
		instantTrickPlays: S,
		discardPileCards: se
	}), [
		ie,
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
		u,
		d,
		x.potTick,
		x.trumpReminderPulse,
		S,
		se
	]);
	return /* @__PURE__ */ (0, C.jsx)(Pp, {
		id: "GameTable",
		children: /* @__PURE__ */ (0, C.jsxs)("div", {
			ref: U,
			className: [
				"btable-wrap btable-wrap--stage-fit",
				F,
				re ? "btable-wrap--has-active-turn" : "",
				ue ? "btable-wrap--clockwise-dealing" : ""
			].filter(Boolean).join(" "),
			"data-testid": "table-root",
			style: ae,
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
									children: /* @__PURE__ */ (0, C.jsx)(Pp, {
										id: "TrickArea",
										children: /* @__PURE__ */ (0, C.jsx)(wu, { ...de })
									})
								}),
								/* @__PURE__ */ (0, C.jsx)(Pp, {
									id: "PlayerSeats",
									children: /* @__PURE__ */ (0, C.jsx)("div", {
										className: "btable__seats",
										"aria-label": "Players at the table",
										children: te.map((e, t) => /* @__PURE__ */ (0, C.jsx)(tf, {
											seatIndex: t,
											player: e,
											seatPlayer: R.get(e.playerId) ?? e,
											playerCount: P,
											isMobile: !1,
											clockwiseDealing: ue,
											onToggleInHand: E,
											onPassEnrollment: D,
											onTrickDelta: O,
											onReaction: ee
										}, e.playerId))
									})
								})
							]
						})
					})
				})
			}), /* @__PURE__ */ (0, C.jsx)(Pp, {
				id: "ActionBar",
				children: /* @__PURE__ */ (0, C.jsxs)("div", {
					className: "hand-panel",
					children: [w && Zc(a) && T && /* @__PURE__ */ (0, C.jsx)(Xc, {
						event: w,
						onDismiss: T
					}), /* @__PURE__ */ (0, C.jsx)(Yc, {
						cards: a,
						privateHandReady: p,
						phase: e.phase,
						enrollmentActive: i,
						isInHand: !!z?.inHand,
						isDealer: !!z?.isDealer,
						signedIn: !!m,
						isMyTurn: !!(m && e.turnPlayerId === m) && !B,
						dealStaggerMs: ne.dealCardStaggerMs,
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
						onSubmitDraw: k,
						onPassDraw: A,
						onFoldDraw: j,
						onPlayCard: M,
						currentUserId: m,
						revealedTrumpIndex: o,
						trumpMergeActive: s,
						trumpDisabledIndex: c,
						handNumber: e.handNumber,
						trickNumber: e.currentTrick?.trickNumber ?? null,
						turnPlayerId: e.turnPlayerId,
						tableRootRef: U,
						pileIndexRef: ce,
						onDiscardCommitted: le,
						onUserActivity: N,
						skipHeroDealMotion: ue
					})]
				})
			})]
		})
	});
}
//#endregion
//#region src/table/layout/useTableLayoutMode.ts
var Ip = "(orientation: portrait)";
function Lp() {
	let e = Rf(), [t, n] = (0, l.useState)(() => typeof window < "u" && window.matchMedia(Ip).matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Ip), t = () => n(e.matches);
		return t(), e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []), e ? t ? "mobile-portrait" : "mobile-landscape" : "desktop";
}
//#endregion
//#region src/table/hooks/useMobileStageFit.ts
function Rp(e, t) {
	if (typeof window > "u") return t;
	let n = getComputedStyle(document.documentElement).getPropertyValue(e).trim(), r = parseFloat(n);
	return Number.isFinite(r) ? r : t;
}
function zp(e) {
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
function Bp(e) {
	return e.closest(".btable-mobile__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function Vp({ aspect: e, sessionKey: t }) {
	let n = (0, l.useRef)(null), r = (0, l.useRef)(0), i = (0, l.useRef)(0), a = (0, l.useRef)(t), o = Lp(), { settings: s } = Hc(), c = o === "mobile-portrait";
	return (0, l.useLayoutEffect)(() => {
		if (typeof window > "u") return;
		let o = n.current;
		if (!o) return;
		a.current !== t && (a.current = t, r.current = 0, i.current = 0);
		let l = window.visualViewport, u = () => {
			let t = Bp(o).getBoundingClientRect(), n = o.querySelector(".btable-mobile-hero-dock")?.getBoundingClientRect(), a = !!o.closest(".table-play-overlay"), u = c ? 104 : 92, d = c ? 210 : 168, f = yf(n?.height ?? 0, r.current, u, d);
			r.current = f.peak;
			let p = f.height, m = parseInt(getComputedStyle(o).getPropertyValue("--player-count").trim(), 10) || 4, h = m <= 4, g = !c, _ = (g && h ? Rp("--mobile-fit-pad-x", 4) : Rp("--mobile-fit-pad-x", 8)) + (g && a ? 4 : 12), v = (g && h ? Rp("--mobile-fit-pad-y", 2) : Rp("--mobile-fit-pad-y", 6)) + (g && a ? 4 : 10), y = Rp("--mobile-fit-gap", c ? 8 : 6), b = l, x = Math.min(t.width, b?.width ?? window.innerWidth), S = Math.min(t.height, b?.height ?? window.innerHeight);
			if (a) {
				let e = bf(zp(o), i.current, 72);
				i.current = e.peak, S = Math.max(140, S - e.height);
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = g ? {
				...Cf({
					availWidth: x,
					availHeight: S,
					aspect: e,
					userScale: 1,
					padX: _,
					padY: v,
					stageShare: Sf(m)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : wf({
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
			Mf() || Pf() || (d ??= window.requestAnimationFrame(() => {
				d = null, u();
			}));
		}, p = new ResizeObserver(f), m = o.querySelector(".btable-mobile-hero-dock");
		m && p.observe(m);
		let h = Bp(o);
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
function Hp({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: g, recommendedDiscardIndices: _ = [], handComplete: v = !1, actionFeedback: y, handPresentation: b, microinteractions: x, instantTrickPlays: S = !1, bigPotEvent: w = null, onDismissTableEvent: T, onToggleInHand: E, onPassEnrollment: D, onTrickDelta: O, onSubmitDraw: k, onPassDraw: A, onFoldDraw: j, onPlayCard: M, onHeroUserActivity: ee }) {
	let N = Lp() === "mobile-landscape" ? "landscape" : "portrait", te = _f({
		session: e,
		players: t,
		currentUserId: m,
		potMetrics: n,
		handPresentation: b,
		microinteractions: x,
		trumpHolderPresentation: f,
		mobileOrientation: N
	}), { rotated: P, opponents: F, playerCount: I, countClass: ne, handTiming: L, playerNames: R, displayPlayersById: z, selfPlayer: B, suppressTurn: V, drawCompleted: re, hasActiveTurn: ie, potMetricsForCenter: ae, wrapStyle: H } = te, oe = (0, l.useMemo)(() => B ? Zd(P.length, N) : null, [
		B,
		P.length,
		N
	]), U = nu(lu, uu, vu, yu), se = e.sessionId, ce = Vp({
		aspect: te.tableAspect,
		sessionKey: se
	}), { cards: le, pileIndexRef: ue, commitDiscardCards: de } = Ia({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: ce
	});
	Wf({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: ce,
		pileIndexRef: ue,
		onDiscardCommitted: de
	}), Gf({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: ce
	}), qf({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: b,
		tableRootRef: ce
	});
	let fe = ip({
		session: e,
		heroCards: a,
		privateHandReady: p,
		tableRootRef: ce
	});
	Ep({
		trickCollection: U,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: v,
		tableRootRef: ce
	});
	let pe = (0, l.useMemo)(() => ({
		potMetrics: ae,
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
		potTick: x.potTick,
		trumpReminderPulse: x.trumpReminderPulse,
		instantTrickPlays: S,
		discardPileCards: le
	}), [
		ae,
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
		u,
		d,
		x.potTick,
		x.trumpReminderPulse,
		S,
		le
	]);
	return /* @__PURE__ */ (0, C.jsx)(Pp, {
		id: "GameTable",
		children: /* @__PURE__ */ (0, C.jsxs)("div", {
			ref: ce,
			className: [
				"btable-mobile-wrap btable-mobile-wrap--stage-fit",
				ne,
				ie ? "btable-wrap--has-active-turn" : "",
				fe ? "btable-wrap--clockwise-dealing" : ""
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
									children: /* @__PURE__ */ (0, C.jsx)(Pp, {
										id: "TrickArea",
										children: /* @__PURE__ */ (0, C.jsx)(wu, { ...pe })
									})
								}),
								/* @__PURE__ */ (0, C.jsx)(Pp, {
									id: "PlayerSeats",
									children: /* @__PURE__ */ (0, C.jsxs)("div", {
										className: "btable__seats btable-mobile__seats",
										"aria-label": "Players at the table",
										children: [F.map((e, t) => /* @__PURE__ */ (0, C.jsx)(tf, {
											seatIndex: t,
											player: e,
											seatPlayer: z.get(e.playerId) ?? e,
											playerCount: I,
											isMobile: !0,
											clockwiseDealing: fe,
											layoutOverride: Xd(t, P.length, N),
											onToggleInHand: E,
											onPassEnrollment: D,
											onTrickDelta: O
										}, e.playerId)), B && oe && /* @__PURE__ */ (0, C.jsx)(tf, {
											seatIndex: 0,
											player: B,
											seatPlayer: z.get(B.playerId) ?? B,
											playerCount: I,
											isMobile: !0,
											clockwiseDealing: fe,
											layoutOverride: oe,
											seatIndexAttr: 0,
											onToggleInHand: E,
											onPassEnrollment: D,
											onTrickDelta: O
										}, B.playerId)]
									})
								})
							]
						})
					})
				})
			}), /* @__PURE__ */ (0, C.jsx)(Pp, {
				id: "ActionBar",
				children: /* @__PURE__ */ (0, C.jsxs)("div", {
					className: "btable-mobile-hero-dock hand-panel",
					children: [/* @__PURE__ */ (0, C.jsxs)("div", {
						className: "btable-mobile-hero-dock__stack",
						children: [w && Zc(a) && T && /* @__PURE__ */ (0, C.jsx)(Xc, {
							event: w,
							onDismiss: T
						}), /* @__PURE__ */ (0, C.jsx)(Yc, {
							cards: a,
							privateHandReady: p,
							phase: e.phase,
							enrollmentActive: i,
							isInHand: !!B?.inHand,
							isDealer: !!B?.isDealer,
							signedIn: !!m,
							isMyTurn: !!(m && e.turnPlayerId === m) && !V,
							dealStaggerMs: L.dealCardStaggerMs,
							drawAnimSubPhase: b.animatingDrawPlayerId === m ? b.drawAnimSubPhase : null,
							drawDiscardCount: b.animatingDrawPlayerId === m ? b.drawDiscardCount : 0,
							drawReplaceCount: b.animatingDrawPlayerId === m ? b.drawReplaceCount : 0,
							drawCompleted: re,
							maxDrawDiscards: e.maxDrawDiscards ?? 4,
							legalPlayIndices: h ?? void 0,
							recommendedPlayIndex: g ?? void 0,
							recommendedDiscardIndices: _,
							handComplete: v,
							actionFeedback: y,
							onSubmitDraw: k,
							onPassDraw: A,
							onFoldDraw: j,
							onPlayCard: M,
							currentUserId: m,
							revealedTrumpIndex: o,
							trumpMergeActive: s,
							trumpDisabledIndex: c,
							handNumber: e.handNumber,
							trickNumber: e.currentTrick?.trickNumber ?? null,
							turnPlayerId: e.turnPlayerId,
							tableRootRef: ce,
							pileIndexRef: ue,
							onDiscardCommitted: de,
							onUserActivity: ee,
							skipHeroDealMotion: fe
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
var Up = new Set(["pot-cap", "hand-win"]);
function Wp({ events: e, onDismiss: t }) {
	let n = [...e].reverse().find((e) => Up.has(e.kind));
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
function Gp({ children: e }) {
	let { settings: t } = Hc(), n = t.layoutMode === "tiled", r = Rf();
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
function Kp({ children: e }) {
	let t = Lp();
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
function qp({ events: e, onDismiss: t }) {
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
function Jp({ compact: e = !1 }) {
	let [t, n] = (0, l.useState)(() => ss()), [r, i] = (0, l.useState)(!1);
	(0, l.useEffect)(() => ds(n), []);
	let a = Ks(), o = Qs();
	function s(e) {
		cs({ soundMode: e });
	}
	function c(e) {
		cs({ soundPackId: e }), qs(), Ts(e);
	}
	function u(e) {
		cs({ hapticsMode: e });
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
					children: Object.keys(Zo).map((e) => /* @__PURE__ */ (0, C.jsx)("option", {
						value: e,
						children: Zo[e]
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
function Yp({ open: e, onClose: t }) {
	let { settings: n, updateSettings: r, resetSettings: i } = Hc();
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
						children: Object.keys(Pc).map((e) => /* @__PURE__ */ (0, C.jsx)("option", {
							value: e,
							children: Pc[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, C.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, C.jsx)("span", { children: "Card style" }), /* @__PURE__ */ (0, C.jsx)("select", {
						value: n.cardPackId,
						onChange: (e) => r({ cardPackId: e.target.value }),
						children: Object.keys(Mc).map((e) => /* @__PURE__ */ (0, C.jsx)("option", {
							value: e,
							children: Mc[e]
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
var Xp = 0;
function Zp() {
	return Xp += 1, `evt-${Xp}-${Date.now()}`;
}
function Qp(e, t, n) {
	let r = t.currentPot, i = [];
	return r >= t.potCap && t.limEnabled && r > e.pot ? i.push({
		id: Zp(),
		kind: "pot-cap",
		title: "Pot cap reached",
		subtitle: "LmT engaged",
		emoji: "🔒",
		durationMs: 2200
	}) : r >= t.anteAmount * Math.max(n.length, 2) * 2 && r > e.pot && i.push({
		id: Zp(),
		kind: "big-pot",
		title: "Big pot brewing",
		emoji: "💰",
		durationMs: 2e3
	}), i;
}
function $p({ session: e, potMetrics: t, participantIds: n }) {
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
		let o = Qp(r, t, n);
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
				id: Zp(),
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
function em(e) {
	return !e?.rank || !e?.suit ? "" : `${e.rank}-${e.suit}`;
}
function tm(e) {
	return e === "handReset" || e === "ante" || e === "trumpReveal" || e === "trumpMerge" || e === "drawPlayer" || e === "drawReady" || e === "settle" || e === "nextHandReset";
}
function nm(e) {
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
function rm(e) {
	return e.phase === "play" ? "play" : e.phase === "draw" ? "drawPlayer" : e.phase === "decision" ? "decision" : e.phase === "reveal" ? "ante" : e.enrollmentActive ? "enrollment" : "idle";
}
function im(e) {
	return {
		phase: rm(e),
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
function am(e, t, n = {}) {
	return {
		...e,
		...n,
		phase: t,
		phaseStartedAt: Date.now()
	};
}
function om(e, t) {
	let n = {};
	for (let r of t.enrolledIds) e.enrolledIds.includes(r) || (n[r] = "join");
	for (let r of t.declinedIds) e.declinedIds.includes(r) || (n[r] = "pass");
	return n;
}
function sm(e, t, n) {
	for (let r of n.drawCompletedIds) if (!cm(e, r) && !e.displayDrawCompletedIds.includes(r) && !t.drawCompletedIds.includes(r)) return r;
	return null;
}
function cm(e, t) {
	return e.drawPresentationConsumedIds.includes(t);
}
function lm(e) {
	return e.phase === "drawPlayer" && e.animatingDrawPlayerId != null && e.drawAnimSubPhase !== "done";
}
function um(e, t) {
	if (t.phase !== "draw" || !lm(e)) return null;
	let n = e.animatingDrawPlayerId, r = t.turnPlayerId;
	return !n || !r || t.drawCompletedIds.includes(r) || n === r && !t.drawCompletedIds.includes(n) ? null : (Z() && Kl("handPresentation", "fast-forward-stale-draw", {
		animating: n,
		turnId: r,
		drawCompleted: t.drawCompletedIds
	}), {
		...gm(e, t),
		pendingSnapshot: t,
		prevSnapshot: t
	});
}
function dm(e, t) {
	return !t || cm(e, t) ? e.drawPresentationConsumedIds : [...e.drawPresentationConsumedIds, t];
}
function fm(e, t) {
	return [...new Set([...e.drawPresentationConsumedIds, ...t])];
}
function pm(e, t, n) {
	for (let r of t.actionOrder) if (t.participantIds.includes(r) && t.drawCompletedIds.includes(r) && !n.includes(r) && !cm(e, r)) return r;
	return null;
}
function mm(e, t, n, r) {
	Z() && Kl("handPresentation", "draw-candidate-resolve", {
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
function hm(e, t, n) {
	Z() && Kl("handPresentation", `draw-receive-commit-${e}`, {
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
function gm(e, t) {
	let n = e.animatingDrawPlayerId;
	if (!n) return e.drawAnimSubPhase === "done" ? e : {
		...e,
		drawAnimSubPhase: "done"
	};
	let r = e.displayDrawCompletedIds.includes(n) ? e.displayDrawCompletedIds : [...e.displayDrawCompletedIds, n], i = dm(e, n), a = t == null ? e.prevSnapshot : {
		...t,
		drawCompletedIds: [...r]
	};
	return hm("payload", e, {
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
function _m(e, t) {
	return e > 0 ? "discard" : t > 0 ? "receive" : "done";
}
function vm(e, t, n, r, i, a) {
	return cm(e, n) ? (mm(e, t, null, `consumed-skip:${n}:${a}`), e) : lm(e) && e.animatingDrawPlayerId !== n ? (mm(e, t, null, `in-flight-skip:${a}`), e) : (mm(e, t, n, a), am(e, "drawPlayer", {
		animatingDrawPlayerId: n,
		drawAnimSubPhase: _m(r, i),
		drawDiscardCount: r,
		drawReplaceCount: i,
		prevSnapshot: t,
		drawPresentationConsumedIds: dm(e, n)
	}));
}
function ym(e) {
	if (!e.pendingHandSettle || e.phase !== "play") return e;
	let t = e.handSettleSnapshot ?? e.prevSnapshot;
	return t ? am(e, "settle", {
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		settleAnimActive: !0,
		settleCarryOver: t.carryOverPot > 0,
		prevSnapshot: t,
		displayPotAmount: t.potAmount
	}) : e;
}
function bm(e, t) {
	return am(e, "ante", {
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
function xm(e, t, n, r) {
	let i = sm(e, {
		...t,
		drawCompletedIds: []
	}, t);
	return i ? vm(e, t, i, n, r, "beginDrawSequence") : am(e, "drawPlayer", {
		displayDrawCompletedIds: e.displayDrawCompletedIds,
		prevSnapshot: t
	});
}
function Sm(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function Cm(e, t) {
	let n = Object.keys(e), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let r of n) if (e[r] !== t[r]) return !1;
	return !0;
}
function wm(e, t) {
	return e.phase === t.phase && Sm(e.displayDrawCompletedIds, t.displayDrawCompletedIds) && e.animatingDrawPlayerId === t.animatingDrawPlayerId && e.drawAnimSubPhase === t.drawAnimSubPhase && e.drawDiscardCount === t.drawDiscardCount && e.drawReplaceCount === t.drawReplaceCount && e.trumpRevealActive === t.trumpRevealActive && e.trumpMergeActive === t.trumpMergeActive && e.trumpMergedIntoHand === t.trumpMergedIntoHand && e.anteAnimActive === t.anteAnimActive && e.dealStaggerCount === t.dealStaggerCount && Cm(e.enrollmentPulse, t.enrollmentPulse) && e.settleAnimActive === t.settleAnimActive && e.settleCarryOver === t.settleCarryOver && e.nextHandResetActive === t.nextHandResetActive && e.pendingHandSettle === t.pendingHandSettle && e.displayPotAmount === t.displayPotAmount;
}
function Tm(e, t) {
	e.prevSnapshot = t.prevSnapshot, e.pendingSnapshot = t.pendingSnapshot, e.handSettleSnapshot = t.handSettleSnapshot, e.drawPresentationConsumedIds = t.drawPresentationConsumedIds, e.handNumber = t.handNumber;
}
function Em(e, t) {
	return e === t ? e : wm(e, t) ? (Tm(e, t), e) : t;
}
function Dm(e, t) {
	let n = Em(e, Om(e, t));
	return Z() && (e.phase !== n.phase || e.handNumber !== n.handNumber || e.trumpRevealActive !== n.trumpRevealActive || t.type === "serverUpdate") && Kl("handPresentation", t.type, {
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
function Om(e, t) {
	switch (t.type) {
		case "reset": return im(t.snapshot);
		case "dealCardRevealed": return {
			...e,
			dealStaggerCount: Math.max(e.dealStaggerCount, t.count)
		};
		case "clearEnrollmentPulse": return Object.keys(e.enrollmentPulse).length ? {
			...e,
			enrollmentPulse: {}
		} : e;
		case "watchdog": return e.pendingHandSettle && e.phase === "play" ? ym(e) : Date.now() - e.phaseStartedAt < 12e3 ? e : km({
			...e,
			pendingSnapshot: e.pendingSnapshot ?? e.prevSnapshot
		});
		case "tryBeginHandSettle": return ym(e);
		case "advancePhase": return km(e);
		case "serverUpdate": {
			let { snapshot: n, heroDrawDiscardCount: r = 0, heroDrawReplaceCount: i = 0 } = t, a = e.prevSnapshot ?? n;
			if (e.sessionKey !== n.sessionKey) {
				let e = im(n);
				return n.phase === "reveal" ? bm(e, n) : e;
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
				let e = im(n);
				return n.phase === "reveal" ? bm(e, n) : e;
			}
			let o = em(a.trumpUpcard), s = em(n.trumpUpcard);
			if (o && !s && !e.trumpMergeActive) return {
				...e,
				trumpRevealActive: !1,
				trumpMergeActive: !0,
				trumpMergedIntoHand: !0,
				prevSnapshot: n,
				pendingSnapshot: n,
				phaseStartedAt: Date.now()
			};
			if (n.phase === "play" && e.phase !== "play") return am(e, "play", {
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
			if (tm(e.phase) && e.phase !== "drawPlayer" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done") return {
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
			let c = om(a, n), l = Object.keys(c).length > 0;
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
			if (n.phase === "reveal" && a.phase !== "reveal" && (e.phase === "idle" || e.phase === "nextHandReset" || e.phase === "enrollment" || e.phase === "settle" || e.phase === "play")) return bm(e, n);
			if (n.phase === "draw" && a.enrollmentActive && !n.enrollmentActive && e.phase === "enrollment") {
				let t = !!n.trumpUpcard;
				return am(e, t ? "trumpReveal" : "ante", {
					trumpRevealActive: t,
					anteAnimActive: !0,
					dealStaggerCount: Math.max(e.dealStaggerCount, n.participantIds.length),
					prevSnapshot: n,
					displayPotAmount: n.potAmount
				});
			}
			if (n.phase === "draw" && (e.phase === "decision" || a.phase === "decision") && e.drawPresentationConsumedIds.length === 0 && e.displayDrawCompletedIds.length === 0 && e.phase !== "drawPlayer" && e.phase !== "drawReady") return xm(e, n, 0, 0);
			if (n.phase === "draw") {
				let t = um(e, n);
				t && (e = t);
				let o = sm(e, a, n);
				if (o && e.phase !== "drawReady") {
					let t = e.phase === "drawPlayer" && e.animatingDrawPlayerId === o && e.drawAnimSubPhase !== "done";
					if (!t && !lm(e)) {
						let t = r > 0 || i > 0, a = t ? r : o === n.turnPlayerId ? 0 : 1;
						return vm(e, n, o, a, t ? i : a, "serverUpdate");
					}
					t ? mm(e, n, null, "serverUpdate:animating-same-player") : lm(e) && mm(e, n, null, "serverUpdate:in-flight-other-player");
				} else o || mm(e, n, null, "serverUpdate:no-candidate");
				if (n.drawCompletedIds.length === n.participantIds.length && n.participantIds.length > 0 && e.phase === "drawPlayer" && e.drawAnimSubPhase === "done") return am(e, "drawReady", { prevSnapshot: n });
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
function km(e) {
	let t = e.pendingSnapshot ?? e.prevSnapshot;
	switch (e.phase) {
		case "handReset": return am(e, "ante", {
			anteAnimActive: !0,
			pendingSnapshot: null
		});
		case "ante": return e.trumpRevealActive || t?.trumpUpcard ? am(e, "trumpReveal", {
			trumpRevealActive: !0,
			anteAnimActive: !1,
			pendingSnapshot: null
		}) : t?.phase === "draw" ? xm(e, t, 0, 0) : am(e, "drawPlayer", {
			anteAnimActive: !1,
			pendingSnapshot: null
		});
		case "trumpReveal": return t?.phase === "draw" ? {
			...xm(e, t, 0, 0),
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		} : am(e, "drawPlayer", {
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		});
		case "trumpMerge": return t?.phase === "draw" ? {
			...xm(e, t, 0, 0),
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0
		} : am(e, "drawPlayer", {
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
			hm("before", e);
			let n = e.animatingDrawPlayerId, r = gm(e, t);
			hm("after", r);
			let i = t ?? r.prevSnapshot;
			if (i && r.displayDrawCompletedIds.length >= i.participantIds.length) return am(r, "drawReady", {
				displayDrawCompletedIds: r.displayDrawCompletedIds,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				pendingSnapshot: null,
				prevSnapshot: {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				},
				drawPresentationConsumedIds: fm(r, r.displayDrawCompletedIds)
			});
			if (i) {
				let e = {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				}, t = pm(r, i, r.displayDrawCompletedIds);
				if (hm("after", r, {
					playerId: n,
					nextCompleted: r.displayDrawCompletedIds,
					nextChosen: t
				}), t) return mm(r, i, t, "advancePhase:nextPlayer"), vm(r, e, t, 1, 1, "advancePhase:nextPlayer");
				mm(r, i, null, "advancePhase:no-next-player");
			}
			return r;
		}
		case "drawReady": return am(e, "play", { pendingSnapshot: null });
		case "settle": return am(e, "nextHandReset", {
			settleAnimActive: !1,
			nextHandResetActive: !0,
			pendingSnapshot: null
		});
		case "nextHandReset": return t ? im(t) : am(e, "idle", { nextHandResetActive: !1 });
		default: return e;
	}
}
function Am(e) {
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
		suppressTurnIndicator: uf(e.phase) || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done",
		displayPotAmount: e.displayPotAmount,
		isPresenting: tm(e.phase)
	};
}
function jm(e, t = !1) {
	let n = cf(t);
	switch (e.phase) {
		case "handReset": return n.handResetMs;
		case "ante": return n.anteChipTravelMs * Math.max(1, Math.min(e.dealStaggerCount, 8));
		case "trumpReveal": return n.trumpRevealHoldMs;
		case "trumpMerge": return n.trumpMergeAnimMs;
		case "drawPlayer": return e.drawAnimSubPhase === "done" ? 0 : lf(e.drawAnimSubPhase === "receive" ? 0 : e.drawDiscardCount, e.drawAnimSubPhase === "receive" ? e.drawReplaceCount : 0, t);
		case "drawReady": return n.drawReadyBeatMs;
		case "settle": return n.settleHoldMs;
		case "nextHandReset": return n.nextHandResetMs;
		default: return 0;
	}
}
//#endregion
//#region src/table/hooks/useHandPresentation.ts
var Mm = [], Nm = [];
function Pm(e, t) {
	let n = new Set(e), r = new Set(t);
	return {
		discardCount: [...n].filter((e) => !r.has(e)).length,
		replaceCount: [...r].filter((e) => !n.has(e)).length
	};
}
function Fm({ session: e, enrollmentActive: t, potAmount: n, handComplete: r, trickPipelineActive: i = !1, forceTrickHandEndDrain: a, heroCards: o = Nm, enrolledIds: s = Mm, declinedIds: c = Mm, actionOrder: u }) {
	let d = (0, l.useMemo)(() => nm({
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
	]), [f, p] = (0, l.useReducer)(Dm, d, im), m = (0, l.useRef)([]), h = (0, l.useRef)([]), g = (0, l.useRef)(null), _ = (0, l.useRef)(f);
	_.current = f;
	let v = () => {
		for (let e of m.current) window.clearTimeout(e);
		m.current = [], g.current = null;
	}, y = (e, t) => {
		let n = window.setTimeout(e, t);
		m.current.push(n);
	};
	return (0, l.useEffect)(() => () => v(), []), (0, l.useEffect)(() => {
		let e = o.map((e) => `${e.rank}-${e.suit}`), t = Pm(h.current, e);
		h.current = e, p({
			type: "serverUpdate",
			snapshot: d,
			heroDrawDiscardCount: t.discardCount,
			heroDrawReplaceCount: t.replaceCount
		}), Z() && Kl("useHandPresentation", "serverUpdate-effect", {
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
		let e = Hl(), t = `${f.handNumber}:${f.phase}:${f.animatingDrawPlayerId ?? ""}:${f.drawAnimSubPhase}:${f.phaseStartedAt}`;
		if (g.current === t) {
			Z() && Kl("useHandPresentation", "advancePhase-timer-skip-duplicate", { phaseKey: t });
			return;
		}
		v();
		let n = jm(f, e);
		if (n <= 0) return;
		let r = {
			handNumber: f.handNumber,
			phase: f.phase,
			animatingDrawPlayerId: f.animatingDrawPlayerId,
			drawAnimSubPhase: f.drawAnimSubPhase,
			phaseStartedAt: f.phaseStartedAt
		};
		g.current = t, Z() && Kl("useHandPresentation", "advancePhase-timer-armed", {
			phaseKey: t,
			delay: n,
			fromPhase: f.phase,
			drawAnimSubPhase: f.drawAnimSubPhase
		}), y(() => {
			if (g.current !== t) return;
			g.current = null;
			let e = _.current;
			if (e.handNumber !== r.handNumber || e.phase !== r.phase || e.animatingDrawPlayerId !== r.animatingDrawPlayerId || e.drawAnimSubPhase !== r.drawAnimSubPhase || e.phaseStartedAt !== r.phaseStartedAt) {
				Z() && Kl("useHandPresentation", "advancePhase-timer-stale", {
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
			Z() && Kl("useHandPresentation", "advancePhase-timer", {
				fromPhase: r.phase,
				delay: n,
				animatingDrawPlayerId: r.animatingDrawPlayerId,
				drawAnimSubPhase: r.drawAnimSubPhase
			}), p({ type: "advancePhase" });
		}, n), y(() => p({ type: "watchdog" }), f.phase === "drawPlayer" || f.phase === "drawReady" ? of : af);
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
			e.phase !== "play" || !e.pendingHandSettle || (Z() && Kl("useHandPresentation", "hand-end-convergence-force", { trickPipelineActive: !0 }), a?.(), p({ type: "tryBeginHandSettle" }));
		}, sf);
		return () => window.clearTimeout(e);
	}, [
		f.phase,
		f.pendingHandSettle,
		i,
		a
	]), (0, l.useMemo)(() => Am(f), [f]);
}
//#endregion
//#region src/table/TurnCountdownSync.tsx
function Im({ input: e }) {
	return (0, l.useEffect)(() => {
		fd(e);
	}), (0, l.useEffect)(() => () => pd(), []), null;
}
var Lm = {
	pipelineActive: !1,
	revealCatchUp: !1,
	motionGateActive: !1,
	peakPlayCount: 0,
	displayedPlayCount: 0,
	handPresenting: !1,
	handPresentationPhase: "idle",
	dealPresentationActive: !1,
	trickCollectionActive: !1
}, Rm = Lm, zm = /* @__PURE__ */ new Set(), Bm = 0, Vm = null;
function Hm(e, t) {
	return e.pipelineActive === t.pipelineActive && e.revealCatchUp === t.revealCatchUp && e.motionGateActive === t.motionGateActive && e.peakPlayCount === t.peakPlayCount && e.displayedPlayCount === t.displayedPlayCount && e.handPresenting === t.handPresenting && e.handPresentationPhase === t.handPresentationPhase && e.dealPresentationActive === t.dealPresentationActive && e.trickCollectionActive === t.trickCollectionActive;
}
function Um(e) {
	return e.dealPresentationActive ? "dealPresentationActive" : e.trickCollectionActive ? "trickCollectionActive" : e.handPresenting ? "handPresenting" : e.pipelineActive ? "pipelineActive" : e.revealCatchUp ? "revealCatchUp" : e.peakPlayCount > e.displayedPlayCount && e.peakPlayCount > 0 ? "peakPlayCatchUp" : null;
}
function Wm(e) {
	return Um(e) != null;
}
function Gm(e, t, n) {
	return !(!e || n === "play" || n === "draw" && (t === "drawPlayer" || t === "drawReady"));
}
function Km(e) {
	let t = { ...Rm }, n = Vm ? Date.now() - Vm.since : 0, r = {
		...Rm,
		pipelineActive: !1,
		revealCatchUp: !1,
		handPresenting: !1,
		handPresentationPhase: "idle",
		peakPlayCount: Rm.displayedPlayCount,
		motionGateActive: !1,
		dealPresentationActive: !1,
		trickCollectionActive: !1
	};
	Bm = Date.now() + 1500, Vm = null, Z() && Kl("trickAnimationBridge", "table-presentation-force-release", {
		source: e,
		blockedMs: n,
		from: t,
		to: r
	}), Ym(r);
}
function qm(e = Date.now()) {
	if (e < Bm) return {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	let t = Um(Rm);
	if (t == null) return Vm = null, {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	(!Vm || Vm.reason !== t) && (Vm = {
		reason: t,
		since: e,
		blockedLogged: !1
	});
	let n = e - Vm.since;
	return n >= 7e3 ? (Z() && !Vm.blockedLogged && Kl("trickAnimationBridge", "gate-force-release", {
		reason: t,
		blockedMs: n
	}), Km("gate-timeout"), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !0
	}) : n >= 5500 ? (Z() && !Vm.blockedLogged && (Kl("trickAnimationBridge", "gate-soft-unblock", {
		reason: t,
		blockedMs: n
	}), Vm.blockedLogged = !0), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !1
	}) : (Z() && !Vm.blockedLogged && (Kl("trickAnimationBridge", "gate-blocked", {
		reason: t,
		blockedMs: n
	}), Vm.blockedLogged = !0), {
		blocked: !0,
		reason: t,
		blockedMs: n,
		softUnblock: !1,
		forceReleased: !1
	});
}
function Jm(e = Date.now()) {
	return qm(e).blocked;
}
function Ym(e) {
	if (!Hm(Rm, e)) {
		Z() && Kl("trickAnimationBridge", "busy-state", {
			from: Rm,
			to: e,
			busy: Wm(e),
			blockReason: Um(e),
			motionGateActive: e.motionGateActive,
			handPresentationPhase: e.handPresentationPhase
		}), Rm = e, Um(e) ?? (Vm = null);
		for (let e of zm) e();
	}
}
function Xm() {
	Bm = 0, Vm = null, Ym(Lm);
}
function Zm() {
	return Rm;
}
function Qm() {
	return Rm.pipelineActive || Rm.revealCatchUp || Rm.motionGateActive || Rm.trickCollectionActive || Rm.peakPlayCount > Rm.displayedPlayCount && Rm.peakPlayCount > 0;
}
function $m() {
	return Wm(Rm);
}
function eh(e) {
	return zm.add(e), () => zm.delete(e);
}
//#endregion
//#region src/table/TrickAnimationBusySync.tsx
function th(e) {
	return {
		pipelineActive: e.pipelineActive,
		revealCatchUp: e.revealCatchUp,
		motionGateActive: e.motionGateActive,
		peakPlayCount: e.peakPlayCount,
		displayedPlayCount: e.displayedPlayCount,
		handPresenting: e.handPresenting,
		handPresentationPhase: e.handPresentationPhase,
		dealPresentationActive: Mf(),
		trickCollectionActive: Pf()
	};
}
function nh(e) {
	Ym(th(e));
}
function rh({ input: e }) {
	let t = (0, l.useRef)(e);
	return t.current = e, (0, l.useEffect)(() => {
		nh(t.current);
	}), (0, l.useEffect)(() => Ff(() => {
		nh(t.current);
	}), []), null;
}
//#endregion
//#region src/table/hooks/useTableMicrointeractions.ts
function ih(e) {
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
function ah({ active: e, displayName: t }) {
	let [n, r] = (0, l.useState)(!1), i = Hl();
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
var oh = Ju, sh = [
	12e3,
	18e3,
	24e3
];
function ch(e) {
	let [t, n] = (0, l.useState)("hidden"), [r, i] = (0, l.useState)(0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(null), c = (0, l.useRef)(0), u = (0, l.useRef)(e.actionRequired);
	u.current = e.actionRequired;
	let d = () => {
		a.current != null && (window.clearTimeout(a.current), a.current = null), o.current != null && (window.clearTimeout(o.current), o.current = null), s.current != null && (window.clearTimeout(s.current), s.current = null);
	}, f = (0, l.useCallback)(() => {
		let e = c.current;
		if (e === 0) return;
		let t = sh[Math.min(e - 1, sh.length - 1)];
		a.current = window.setTimeout(() => {
			a.current = null, u.current && (i(e), n("pop"), c.current = e + 1);
		}, t);
	}, []);
	return (0, l.useEffect)(() => (d(), c.current = 0, e.actionRequired ? (a.current = window.setTimeout(() => {
		a.current = null, u.current && (i(0), n("pop"), c.current = 1);
	}, oh), d) : (n("hidden"), i(0), d)), [e.activityKey, e.actionRequired]), (0, l.useEffect)(() => {
		if (t !== "pop") return;
		let e = Hl() ? 280 : 420;
		return o.current = window.setTimeout(() => {
			o.current = null, n("exit");
		}, 380 + e), () => {
			o.current != null && (window.clearTimeout(o.current), o.current = null);
		};
	}, [t, r]), (0, l.useEffect)(() => {
		if (t !== "exit") return;
		let e = Hl() ? 240 : 620;
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
function lh() {
	return Hl();
}
//#endregion
//#region src/table/YourTurnAttention.tsx
function uh({ actionRequired: e, activityKey: t }) {
	let { phase: n, beat: r } = ch({
		actionRequired: e,
		activityKey: t
	});
	if (n === "hidden") return null;
	let i = lh(), a = Math.min(r, 5);
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
var dh = 5e3, fh = 1e3;
function ph(e) {
	return e === "draw" ? "Choose discard and then tap" : e === "play" ? "Tap a card to play" : null;
}
function mh(e) {
	let [t, n] = (0, l.useState)(!1), [r, i] = (0, l.useState)(!0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(e.actionRequired);
	s.current = e.actionRequired;
	let c = ph(e.phase), u = e.actionRequired && c != null && !e.hasUserInteracted;
	return (0, l.useEffect)(() => {
		if (a.current != null && (window.clearTimeout(a.current), a.current = null), n(!1), u) return a.current = window.setTimeout(() => {
			a.current = null, !(!s.current || e.hasUserInteracted) && (n(!0), i(!0));
		}, dh), () => {
			a.current != null && (window.clearTimeout(a.current), a.current = null);
		};
	}, [
		e.activityKey,
		u,
		e.hasUserInteracted
	]), (0, l.useEffect)(() => {
		if (o.current != null && (window.clearInterval(o.current), o.current = null), !t || !u || Hl()) {
			i(!0);
			return;
		}
		return o.current = window.setInterval(() => {
			i((e) => !e);
		}, fh), () => {
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
function hh({ actionRequired: e, activityKey: t, phase: n, hasUserInteracted: r }) {
	let { visible: i, text: a, flashOn: o } = mh({
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
function gh(e) {
	let t = e.currentUserId;
	if (!t || e.handComplete) return !1;
	let n = e.selfPlayer, r = Ru({
		phase: e.session.phase,
		participantIds: e.session.participantIds,
		playerId: t
	});
	if (!n || !r && n.isOut || n.actionDeclared) return !1;
	let i = Wu({
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
	if (i.phase === Q.ENROLLMENT || e.enrollmentActive) return !!(n.canToggleInHand || n.canPassEnrollment);
	if (i.phase === Q.DEAL) return !1;
	let a = qu({
		snapshot: i,
		action: "submit_draw",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn,
		drawCompletedIds: e.session.drawCompletedIds
	});
	if (i.phase === Q.DRAW && a.ok) return !0;
	let o = qu({
		snapshot: i,
		action: "play_card",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn
	});
	return !!(i.phase === Q.PLAY && o.ok);
}
function _h(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off";
	return [
		e.session.phase ?? "",
		e.session.turnPlayerId ?? "",
		n,
		e.selfPlayer?.actionDeclared ? "declared" : "open",
		e.session.drawCompletedIds?.join(",") ?? "",
		e.suppressTurn ? "1" : "0",
		gh(e) ? "act" : "wait"
	].join("|");
}
//#endregion
//#region src/table/hooks/useTrumpTrickMotionGate.ts
var vh = 880;
function yh(e, t, n) {
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
		}, vh);
		return () => window.clearTimeout(n);
	}, [e, t]), (0, l.useEffect)(() => {
		if (!i || t || n === 0) return;
		let e = window.setTimeout(() => {
			a(!1), r.current = !1;
		}, vh);
		return () => window.clearTimeout(e);
	}, [
		i,
		t,
		n
	]), i;
}
//#endregion
//#region src/table/trickPresentationMachine.ts
function bh(e, t) {
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
		peakTrickPlays: X(t),
		displayRevealFloor: 0
	};
}
function xh(e, t) {
	if (t.length < e.length) return !1;
	for (let n = 0; n < e.length; n++) if (no(e[n]) !== no(t[n])) return !1;
	return !0;
}
function Sh(e, t, n) {
	let r = t.currentTrick?.trickNumber ?? null, i = e.prevTrick?.trickNumber ?? null, a = r != null && i != null && r !== i ? [] : [...e.peakTrickPlays ?? []];
	for (let t of [
		n,
		X(e.prevTrick),
		e.peakTrickPlays ?? []
	]) t.length > a.length && xh(a, t) && (a = t);
	return a;
}
function Ch(e, t) {
	return e.phase === "live" ? e : {
		...e,
		pendingServer: t
	};
}
function wh(e) {
	return Math.max(e.pendingResolution?.frozen.plays.length ?? 0, X(e.prevTrick).length, e.peakTrickPlays?.length ?? 0);
}
function Th(e, t) {
	let n = X(t.currentTrick), r = X(e.prevTrick), i = Sh(e, t, n), a = e.phase === "live" && !e.pendingResolution && (n.length < e.revealedCount && r.length >= e.revealedCount || n.length < i.length && r.length >= i.length), o = t.currentTrick?.trickNumber ?? null, s = e.prevTrick?.trickNumber ?? null, c = o != null && s != null && o !== s;
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
function Eh(e, t, n, r) {
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
function Dh(e, t) {
	let n = Oh(e, t);
	if (Z()) {
		let r = X(e.prevTrick).length, i = X(n.prevTrick).length;
		(e.phase !== n.phase || e.revealedCount !== n.revealedCount || r !== i || !!e.pendingResolution != !!n.pendingResolution || t.type === "serverUpdate") && Kl("trickPresentation", t.type, {
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
function Oh(e, t) {
	switch (t.type) {
		case "reset":
		case "reinit": return bh(t.type === "reinit" ? t.snapshot.tricksByPlayer : e.displayTricksByPlayer, t.type === "reinit" ? t.snapshot.currentTrick : null);
		case "revealNextCard": {
			if (e.phase !== "live") return e;
			let t = wh(e);
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
			return !t || e.phase !== "live" ? e : Eh({
				...e,
				pendingResolution: null
			}, t.frozen, t.snapshot.tricksByPlayer, t.snapshot.currentTrick);
		}
		case "forceHandEndDrain": {
			let t = e;
			if (t.phase === "live" && t.pendingResolution && (t = Eh({
				...t,
				pendingResolution: null
			}, t.pendingResolution.frozen, t.pendingResolution.snapshot.tricksByPlayer, t.pendingResolution.snapshot.currentTrick)), t.phase === "live" && !t.pendingResolution) return t;
			let n = t.pendingServer, r = n?.tricksByPlayer ?? {}, i = Object.values(r).some((e) => (e ?? 0) > 0), a = i ? { ...r } : { ...t.displayTricksByPlayer }, o = X(n?.currentTrick).length;
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
				peakTrickPlays: X(n?.currentTrick),
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
				let t = e.pendingServer, n = X(t?.currentTrick).length;
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
					peakTrickPlays: X(t?.currentTrick),
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
			if (e.phase !== "live") return Ch(e, n);
			let i = Vl({
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
			} : Th(e, n);
		}
		default: return e;
	}
}
function kh(e, t) {
	let n = e.pendingResolution?.frozen.plays ?? [];
	if (n.length > 0) return n;
	let r = X(e.prevTrick), i = e.peakTrickPlays ?? [];
	return e.phase === "live" ? i.length > t.length ? i : r.length > t.length ? r : t.length > 0 ? t : r : t.length > 0 ? t : r.length > 0 ? r : i;
}
function Ah(e, t) {
	let n = kh(e, X(t)), r = e.displayRevealFloor, i = n.length >= r ? n : (e.peakTrickPlays?.length ?? 0) >= r ? e.peakTrickPlays : n, a = e.phase === "live" ? e.pendingResolution ? Math.max(e.revealedCount, i.length) : Math.min(e.revealedCount, i.length) : i.length, o = e.phase === "live" && !e.pendingResolution ? Math.max(a, r) : a, s = e.phase === "live" ? i.slice(0, o) : e.frozenTrick?.plays ?? [], c = e.frozenTrick?.plays ?? [], l = e.frozenTrick?.winnerId ?? null, u = e.phase, d = c.length > 0 && s.length === 0 && e.phase !== "live", f = e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null, p = e.showWinnerTag && (e.phase === "winnerReveal" || e.phase === "collectTrick"), m = e.peakTrickPlays?.length ?? 0, h = e.phase === "live" ? wh(e) : e.revealedCount;
	return {
		phase: e.phase,
		displayPlays: s,
		winnerPlayerId: f,
		showWinnerTag: p,
		displayTricksByPlayer: e.displayTricksByPlayer,
		suppressTurnPlayerId: Pl(e.phase),
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
function jh({ phase: e, currentTrick: t, tricksByPlayer: n, participantIds: r, trumpSuit: i, playedCards: a, turnPlayerId: o, handComplete: s = !1 }) {
	let [c, u] = (0, l.useReducer)(Dh, n, (e) => bh(e, t)), d = (0, l.useRef)([]), f = (0, l.useRef)(null), p = (0, l.useRef)(/* @__PURE__ */ new Set()), m = (0, l.useRef)(!1), h = (0, l.useRef)(null), g = (0, l.useRef)(0), _ = (0, l.useRef)(!1), v = (0, l.useRef)(c);
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
			S(), f.current = null, p.current.clear(), ho(), u({
				type: "reinit",
				snapshot: {
					currentTrick: t,
					tricksByPlayer: n,
					playedCards: a
				}
			}), Z() && Kl("useTrickPresentation", c ? "reinit-play-entry" : "reinit-idle", {
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
			reducedMotion: Hl()
		}), Z() && Kl("useTrickPresentation", "serverUpdate-effect", {
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
		let t = c.frozenTrick, n = t.trickNumber === 5, r = Il({
			trumpBeat: Bl(t.plays, t.leadSuit, i),
			finalTrick: n,
			reducedMotion: Hl()
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
		let t = Hl() ? 308 : 560, n = window.setTimeout(() => u({ type: "commitTrickResolution" }), t);
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
		let e = Nl, t = window.setTimeout(() => {
			let e = v.current;
			e.phase !== "live" && (Z() && Kl("useTrickPresentation", "pipeline-stuck-force-advance", {
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
			e.phase !== "live" || !e.pendingResolution || e.revealedCount >= e.pendingResolution.frozen.plays.length || (Z() && Kl("useTrickPresentation", "pending-resolution-reveal-catchup", {
				revealedCount: e.revealedCount,
				target: e.pendingResolution.frozen.plays.length
			}), u({ type: "revealNextCard" }));
		}, Nl);
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
		return Z() && Kl("useTrickPresentation", "hand-end-drain-armed", {
			phase: c.phase,
			pendingResolution: !!c.pendingResolution,
			trickNumber: c.frozenTrick?.trickNumber ?? c.pendingResolution?.frozen.trickNumber
		}), ((e, t) => {
			n.push(window.setTimeout(e, t));
		})(() => {
			let e = v.current;
			e.phase === "live" && !e.pendingResolution || (Z() && Kl("useTrickPresentation", "hand-end-drain-force", {
				phase: e.phase,
				pendingResolution: !!e.pendingResolution
			}), u({ type: "forceHandEndDrain" }));
		}, Ml), () => {
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
		let e = Hl() ? 369 : 670;
		h.current = window.setTimeout(() => {
			h.current = null, Z() && Kl("useTrickPresentation", "revealNextCard-timer", {
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
		...Ah(c, t),
		forceHandEndDrain: () => u({ type: "forceHandEndDrain" })
	};
}
//#endregion
//#region src/table/TrickPresentationSync.tsx
function Mh(e) {
	let t = jh(e), n = (0, l.useRef)(t.forceHandEndDrain);
	return n.current = t.forceHandEndDrain, (0, l.useLayoutEffect)(() => {
		cu({
			...t,
			forceHandEndDrain: () => n.current()
		});
	}), (0, l.useEffect)(() => () => du(), []), null;
}
//#endregion
//#region src/table/settlementCopy.ts
function Nh(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function Ph(e, t) {
	return e.map((e) => Nh(e, t)).join(" & ");
}
function Fh(e, t) {
	return ul(e, t) ? t.filter((t) => (e[t] ?? 0) === 0) : [];
}
function Ih(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: a = {} } = e, o = pl(t, n), s = e.winnerIds?.length ? e.winnerIds : o.winnerIds, c = e.maxTricks ?? o.maxTricks, l = Ph(s, r), u = Fh(t, n), d = Ph(u, r), f = ml(i.maxWinThisHand), p = ml(i.currentPot), m = i.carryIn > 0 ? ml(i.carryIn) : null, h = `Pot this hand: ${p} (max win ${f})`;
	m && (h += ` — includes ${m} carried in`), i.limEnabled && i.overflow > 0 && (h += ` · LIM overflow ${ml(i.overflow)} stays out of play`);
	let g = s.map((e) => {
		let n = t[e] ?? 0;
		return `${Nh(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), _ = u.length > 0 ? `Bourré: ${d} took 0 tricks — each pays ${f} at settlement (seeds next deal)` : null, v = e.splitSharePerWinner, y = v > 0 && s.length >= 2 ? `If all co-winners agree to split: ${ml(i.maxWinThisHand)} → ${ml(v)} each` : null, b = s.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, x = `If any co-winner declines: full pot ${p} carries to the next hand · non-winners ante up`, S = s.map((e) => {
		let t = a[e], n = Nh(e, r);
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
function Lh({ session: e, players: t, potMetrics: n, splitSharePerWinner: r, currentUserId: i, isCoWinner: a, onSettle: o }) {
	let s = Ih({
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
						ml(r),
						" each"
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/table/SplitPotDecisionToast.tsx
var Rh = 3e3;
function zh(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function Bh({ session: e, players: t, splitSharePerWinner: n, currentUserId: r, isCoWinner: i, onAgreeSplit: a, onDeclineSplit: o, onCarryover: s }) {
	let c = e.pendingCoWinSettlement?.winnerIds ?? [], u = e.pendingCoWinSettlement?.votes ?? {}, [d, f] = (0, l.useState)(Rh), [p, m] = (0, l.useState)(!1), h = (0, l.useRef)(null), g = (0, l.useRef)(!1), _ = (0, l.useMemo)(() => `${c.join(",")}:${e.handNumber ?? 0}`, [c, e.handNumber]);
	(0, l.useEffect)(() => {
		h.current = Date.now(), g.current = !1, f(Rh), m(!1);
	}, [_]);
	let v = c.length >= 2 && c.every((e) => u[e] === "split"), y = (0, l.useCallback)(() => {
		g.current || (g.current = !0, s());
	}, [s]);
	if ((0, l.useEffect)(() => {
		if (c.length < 2) return;
		let e = window.setInterval(() => {
			let e = h.current ?? Date.now(), t = Date.now() - e, n = Math.max(0, Rh - t);
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
	let b = Math.max(0, Math.ceil(d / 1e3)), x = c.map((e) => zh(e, t)).join(" & "), S = (e) => {
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
				children: [ml(n), " each if all agree"]
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
function Vh(e, t) {
	return [...e];
}
function Hh(e, t) {
	return [...e].sort((e, t) => e - t);
}
function Uh(e) {
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
	let { trumpMergeActive: i, trumpMergedIntoHand: a } = e.handPresentation, o = mf({
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
var Wh = [], Gh = [], Kh = [];
function qh({ session: e, players: t, potMetrics: n, mySessionNet: r, leaderLabel: i, showCoWinSettlement: a, splitPotEnabled: o = !1, rebuyEnabled: s = !1, splitSharePerWinner: c = 0, enrollmentActive: u = !1, currentUserId: d, heroCards: f = Gh, rawHeroCards: p = Gh, privateHandReady: m = !1, legalPlayIndices: h, recentBourreIds: g = Kh, handComplete: _ = !1, actionFeedback: v, actions: y }) {
	let { settings: b } = Hc(), x = Rf(), [S, w] = (0, l.useState)(!1), T = e.participantIds.length, { events: E, dismissEvent: D, pushReaction: O } = $p({
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
	]), M = nu(lu, uu, xu, Su), ee = M.forceHandEndDrain, N = Fm({
		session: e,
		enrollmentActive: u,
		potAmount: n.currentPot,
		handComplete: _,
		trickPipelineActive: M.isPipelineActive,
		forceTrickHandEndDrain: ee,
		heroCards: f,
		enrolledIds: e.handEnrollment?.enrolledIds ?? Wh,
		declinedIds: e.handEnrollment?.declinedIds ?? Wh,
		actionOrder: e.actionOrder ?? e.handEnrollment?.orderedPlayerIds ?? e.participantIds
	}), te = yh(e.phase, e.trumpUpcard, M.displayPlaysLength), P = Gm(N.isPresenting, N.phase, e.phase), F = (0, l.useMemo)(() => ({
		pipelineActive: M.isPipelineActive,
		revealCatchUp: M.phase === "live" && M.revealedCount < M.revealTarget,
		motionGateActive: te,
		peakPlayCount: M.peakPlayCount,
		displayedPlayCount: M.displayPlaysLength,
		handPresenting: P,
		handPresentationPhase: N.phase
	}), [
		M.isPipelineActive,
		M.phase,
		M.revealedCount,
		M.revealTarget,
		M.peakPlayCount,
		M.displayPlaysLength,
		te,
		P,
		N.phase
	]), I = Xa(e.phase), ne = (0, l.useMemo)(() => mf({
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
	]), L = (0, l.useMemo)(() => Uh({
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
	]), R = L.displayCards, z = (0, l.useMemo)(() => !h?.length || L.indexMode === "effective" ? h : Vh(h, L.trumpDisabledIndex), [
		h,
		L.indexMode,
		L.trumpDisabledIndex
	]), B = (0, l.useMemo)(() => {
		if (!h?.length || !f.length) return null;
		let t = Jo(f.map(Ga), {
			trumpSuit: e.trumpSuit ?? "clubs",
			currentTrick: e.currentTrick ?? null,
			leadSuit: e.leadSuit ?? null,
			cinchEnabled: e.cinchEnabled === !0
		}, h);
		return t == null ? null : L.indexMode === "effective" ? t : Vh([t], L.trumpDisabledIndex)[0] ?? null;
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
		let t = f.map(Ga), n = L.indexMode === "display" && L.trumpDisabledIndex != null ? Hh([L.trumpDisabledIndex], L.trumpDisabledIndex) : L.trumpDisabledIndex == null ? [] : [L.trumpDisabledIndex], r = Yo(t, e.trumpSuit ?? "clubs", e.maxDrawDiscards ?? 4, e.remainingDeckCount ?? Infinity, n);
		return L.indexMode === "effective" ? r : Vh(r, L.trumpDisabledIndex);
	}, [
		e.phase,
		f,
		e.trumpSuit,
		e.maxDrawDiscards,
		e.remainingDeckCount,
		L.indexMode,
		L.trumpDisabledIndex
	]), re = M.suppressTurnPlayerId || N.suppressTurnIndicator, ie = Ka(e.phase, u), ae = re ? null : $a(e.turnPlayerId, t), H = t.find((e) => e.isSelf), oe = d != null && e.participantIds.includes(d) && (e.phase === "draw" || e.phase === "play"), U = s && !e.isFinal && !oe && !a && H?.isOut === !0 && !!y.onRebuy, se = !!(d && e.turnPlayerId === d) && !re, ce = gh({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: H,
		session: e,
		suppressTurn: !!re,
		handComplete: _
	}), le = ce && !_ && (u || e.phase === "decision") ? qa(e.phase, u) : null, ue = !le && !re && !(ae && I && M.phase === "live") ? Ja({
		phase: e.phase,
		enrollmentActive: u,
		isMyTurn: se,
		handComplete: _,
		cardsDealt: I
	}) : null, de = _h({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: H,
		session: e,
		suppressTurn: !!re,
		handComplete: _
	}), [fe, pe] = (0, l.useState)(!1);
	(0, l.useEffect)(() => {
		pe(!1);
	}, [de]);
	let me = (0, l.useCallback)(() => {
		pe(!0);
	}, []), he = ce && !_ && !fe && (e.phase === "draw" || e.phase === "play"), ge = (0, l.useMemo)(() => ({
		session: {
			phase: e.phase,
			turnPlayerId: e.turnPlayerId,
			drawCompletedIds: e.drawCompletedIds,
			handEnrollment: e.handEnrollment,
			participantIds: e.participantIds,
			tricksByPlayer: e.tricksByPlayer,
			handNumber: e.handNumber,
			pendingCoWinSettlement: e.pendingCoWinSettlement
		},
		suppressTurn: !!re,
		handComplete: _
	}), [
		e.phase,
		e.turnPlayerId,
		e.drawCompletedIds,
		e.handEnrollment,
		e.participantIds,
		e.tricksByPlayer,
		e.handNumber,
		e.pendingCoWinSettlement,
		re,
		_
	]), _e = ne.showTrumpSuitReminder || !e.trumpUpcard && !!e.trumpSuit && e.phase === "play", ve = (0, l.useMemo)(() => ({ ...M.displayTricksByPlayer }), [M.displayTricksByPlayer]), ye = (0, l.useMemo)(() => Object.fromEntries(t.map((e) => [e.playerId, Math.max(0, Number(e.bankroll) || 0)])), [t]), be = ih({
		turnPlayerId: e.turnPlayerId ?? null,
		dealerId: e.dealerId,
		potAmount: N.displayPotAmount,
		tricksByPlayer: ve,
		bankrollByPlayer: ye,
		bourrePlayerIds: g ?? [],
		phase: e.phase ?? null,
		showTrumpSuitReminder: _e,
		suppressTurn: !!re,
		actionFeedbackStatus: v?.status ?? "idle",
		trickWinnerSeatId: M.trickWinnerSeatId,
		trickPhase: M.phase
	}), xe = !!H?.playerId && (g ?? []).includes(H.playerId) && be.bourreAlerts[H.playerId] === "pulse", Se = (0, l.useRef)(0), Ce = (0, l.useRef)(0);
	(0, l.useEffect)(() => {
		be.feedbackErrorPulse > Se.current && Tc(), Se.current = be.feedbackErrorPulse;
	}, [be.feedbackErrorPulse]), (0, l.useEffect)(() => {
		be.feedbackSuccessPulse > Ce.current && Ec(), Ce.current = be.feedbackSuccessPulse;
	}, [be.feedbackSuccessPulse]);
	let we = (0, l.useCallback)((e) => {
		O(e, d ?? void 0);
	}, [O, d]), Te = (0, l.useMemo)(() => ({
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
			let t = L.indexMode === "display" ? Hh(e, L.trumpDisabledIndex) : e;
			return y.onSubmitDraw(t);
		},
		onPassDraw: y.onPassDraw,
		onFoldDraw: y.onFoldDraw,
		onPlayCard: (e) => {
			if (!y.onPlayCard) return;
			if (L.indexMode !== "display") return y.onPlayCard(e);
			let t = Hh([e], L.trumpDisabledIndex)[0];
			if (t != null) return y.onPlayCard(t);
		},
		onReaction: we,
		onHeroUserActivity: me
	}), [
		y,
		we,
		t,
		L.indexMode,
		L.trumpDisabledIndex,
		me
	]), Ee = (0, l.useMemo)(() => ({
		session: e,
		players: t,
		potMetrics: n,
		participantCount: T,
		enrollmentActive: u,
		heroCards: R,
		revealedTrumpIndex: L.revealedTrumpIndex,
		trumpMergeActive: L.trumpMergeActive,
		trumpDisabledIndex: L.trumpDisabledIndex,
		hideCenterTrump: ne.hideCenterTrump,
		showTrumpSuitReminder: _e,
		trumpHolderPresentation: ne,
		privateHandReady: m,
		currentUserId: d,
		legalPlayIndices: z,
		recommendedPlayIndex: B,
		recommendedDiscardIndices: V,
		handComplete: _,
		actionFeedback: v,
		handPresentation: N,
		microinteractions: be,
		instantTrickPlays: te,
		bigPotEvent: k,
		onDismissTableEvent: D,
		...Te
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
		ne,
		_e,
		m,
		d,
		z,
		B,
		V,
		_,
		v,
		N,
		be,
		te,
		k,
		D,
		Te
	]), De = /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
		/* @__PURE__ */ (0, C.jsx)(Mh, { ...j }),
		/* @__PURE__ */ (0, C.jsx)(rh, { input: F }),
		/* @__PURE__ */ (0, C.jsx)(Im, { input: ge }),
		/* @__PURE__ */ (0, C.jsx)("div", {
			className: "btable-session__attention-layer",
			"aria-live": "polite",
			children: /* @__PURE__ */ (0, C.jsx)(uh, {
				actionRequired: ce,
				activityKey: de
			})
		}),
		/* @__PURE__ */ (0, C.jsx)(ah, {
			active: xe,
			displayName: H?.displayName
		}),
		/* @__PURE__ */ (0, C.jsx)(qp, {
			events: E,
			onDismiss: D
		}),
		/* @__PURE__ */ (0, C.jsx)(Wp, {
			events: E,
			onDismiss: D
		}),
		x ? /* @__PURE__ */ (0, C.jsx)(Hp, { ...Ee }) : /* @__PURE__ */ (0, C.jsx)(Fp, { ...Ee })
	] }), Oe = (0, l.useRef)(!1);
	return (0, l.useEffect)(() => {
		Oe.current = !1;
	}, [e.handNumber, e.sessionId]), (0, l.useEffect)(() => {
		if (e.phase !== "reveal" || !N.trumpMergedIntoHand || N.phase !== "drawPlayer" || Oe.current || !y.onAdvanceReveal) return;
		let t = y.onAdvanceReveal();
		Promise.resolve(t).then(() => {
			Oe.current = !0;
		}, () => {
			Oe.current = !1;
		});
	}, [
		e.phase,
		e.handNumber,
		e.sessionId,
		N.trumpMergedIntoHand,
		N.phase,
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
			Qa(e.phase) ? "btable-session--reveal-phase" : "",
			Za(e.phase) ? "btable-session--decision-phase" : ""
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
			}, v.status === "error" ? `feedback-error-${be.feedbackErrorPulse}` : v.status === "success" ? `feedback-success-${be.feedbackSuccessPulse}` : `feedback-${v.status}`),
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
								children: ie
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
					ae && I && M.phase === "live" && /* @__PURE__ */ (0, C.jsx)("p", {
						className: ["btable-session__turn", se ? "btable-session__turn--yours" : "btable-session__turn--waiting"].join(" "),
						"aria-live": "polite",
						"data-testid": "turn-indicator",
						children: ae
					}),
					le && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__action-cue",
						"data-testid": "action-cue",
						"aria-live": "polite",
						children: le
					}),
					/* @__PURE__ */ (0, C.jsx)(hh, {
						actionRequired: he,
						activityKey: de,
						phase: e.phase,
						hasUserInteracted: fe
					}),
					ue && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__hint btable-session__hint--waiting",
						"data-testid": "waiting-cue",
						children: ue
					}),
					Qa(e.phase) && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__hint muted small",
						"aria-live": "polite",
						children: "Cards dealt — trump revealed. Review your hand…"
					}),
					u && !Qa(e.phase) && /* @__PURE__ */ (0, C.jsx)("p", {
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
			x ? /* @__PURE__ */ (0, C.jsx)(Kp, { children: /* @__PURE__ */ (0, C.jsx)("div", {
				className: "btable-stage",
				children: De
			}) }) : /* @__PURE__ */ (0, C.jsx)(Gp, { children: /* @__PURE__ */ (0, C.jsx)("div", {
				className: "btable-stage",
				children: De
			}) }),
			/* @__PURE__ */ (0, C.jsx)(Yp, {
				open: S,
				onClose: () => w(!1)
			}),
			a && !e.isFinal && o && /* @__PURE__ */ (0, C.jsx)(Bh, {
				session: e,
				players: t,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: A,
				onAgreeSplit: () => y.onSettle("split"),
				onDeclineSplit: () => y.onSettle("push"),
				onCarryover: () => y.onSettleCarryover?.()
			}),
			a && !e.isFinal && !o && /* @__PURE__ */ (0, C.jsx)(Lh, {
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
					/* @__PURE__ */ (0, C.jsx)(Jp, { compact: !0 }),
					U && /* @__PURE__ */ (0, C.jsxs)("div", {
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
					r == null ? /* @__PURE__ */ (0, C.jsx)(C.Fragment, { children: "Shared pot and game state only · sign in to track your ledger" }) : /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: ["Your session profit/loss ", gl(r)] })
				]
			})
		]
	});
}
//#endregion
//#region src/table/mount.tsx
var Jh = null, Yh = null;
function Xh(e, t) {
	vc(), ia(e), Yh !== e && (Jh?.unmount(), Jh = (0, u.createRoot)(e), Yh = e), Jh.render(/* @__PURE__ */ (0, C.jsx)(Vc, { children: /* @__PURE__ */ (0, C.jsx)(qh, { ...t }) }));
}
function Zh() {
	Yh && (_p(Yh), Kf(Yh)), Jh?.unmount(), Jh = null, Yh = null, Xm(), If();
}
//#endregion
export { Kf as clearDrawFlyGhosts, _p as clearWonTrickCollectionArtifacts, qm as evaluateBotPresentationGate, Km as forceReleasePresentationForBots, ss as getFeedbackPrefs, Um as getTablePresentationBlockReason, Zm as getTrickAnimationBusyState, Gm as handPresentingBlocksBots, vc as initGameFeedback, $m as isTablePresentationBusy, Jm as isTablePresentationBusyForBots, Qm as isTrickAnimationBusy, Xh as mountTableSession, Sc as playBigWinFeedback, Cc as playBourreFeedback, bc as playDrawFeedback, wc as playGameStartFeedback, yc as playShuffleFeedback, xc as playTrickWinFeedback, cs as saveFeedbackPrefs, ds as subscribeFeedbackPrefs, eh as subscribeTrickAnimationBusy, Zh as unmountTableSession };
