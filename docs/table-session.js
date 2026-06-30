//#region \0rolldown/runtime.js
var e = Object.create, t = Object.defineProperty, n = Object.getOwnPropertyDescriptor, r = Object.getOwnPropertyNames, i = Object.getPrototypeOf, a = Object.prototype.hasOwnProperty, o = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), s = (e, i, o, s) => {
	if (i && typeof i == "object" || typeof i == "function") for (var c = r(i), l = 0, u = c.length, d; l < u; l++) d = c[l], !a.call(e, d) && d !== o && t(e, d, {
		get: ((e) => i[e]).bind(null, d),
		enumerable: !(s = n(i, d)) || s.enumerable
	});
	return e;
}, c = (n, r, a) => (a = n == null ? {} : e(i(n)), s(r || !n || !n.__esModule ? t(a, "default", {
	value: n,
	enumerable: !0
}) : a, n)), l = /* @__PURE__ */ o(((e) => {
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
			t !== null && A(x, t.startTime - e);
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
								u !== null && A(x, u.startTime - t), i = !1;
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
		var k = new MessageChannel(), ee = k.port2;
		k.port1.onmessage = D, O = function() {
			ee.postMessage(null);
		};
	} else O = function() {
		_(D, 0);
	};
	function A(t, n) {
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
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, A(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, O()))), r;
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
})), u = /* @__PURE__ */ o(((e, t) => {
	t.exports = l();
})), d = /* @__PURE__ */ o(((e) => {
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
	var ee = /\/+/g;
	function A(e, t) {
		return typeof e == "object" && e && e.key != null ? k("" + e.key) : t.toString(36);
	}
	function te(e) {
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
	function j(e, r, i, a, o) {
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
				case d: return c = e._init, j(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + A(e, 0) : a, S(o) ? (i = "", c != null && (i = c.replace(ee, "$&/") + "/"), j(o, r, i, "", function(e) {
			return e;
		})) : o != null && (O(o) && (o = D(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ee, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (S(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + A(a, u), c += j(a, r, i, s, o);
		else if (u = m(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + A(a, u++), c += j(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return j(te(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function M(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return j(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function N(e) {
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
			_init: N
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
})), f = /* @__PURE__ */ o(((e, t) => {
	t.exports = d();
})), p = /* @__PURE__ */ o(((e) => {
	var t = f();
	function n(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function r() {}
	var i = {
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
	}, a = Symbol.for("react.portal");
	function o(e, t, n) {
		var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
		return {
			$$typeof: a,
			key: r == null ? null : "" + r,
			children: e,
			containerInfo: t,
			implementation: n
		};
	}
	var s = t.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
	function c(e, t) {
		if (e === "font") return "";
		if (typeof t == "string") return t === "use-credentials" ? t : "";
	}
	e.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = i, e.createPortal = function(e, t) {
		var r = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
		if (!t || t.nodeType !== 1 && t.nodeType !== 9 && t.nodeType !== 11) throw Error(n(299));
		return o(e, t, null, r);
	}, e.flushSync = function(e) {
		var t = s.T, n = i.p;
		try {
			if (s.T = null, i.p = 2, e) return e();
		} finally {
			s.T = t, i.p = n, i.d.f();
		}
	}, e.preconnect = function(e, t) {
		typeof e == "string" && (t ? (t = t.crossOrigin, t = typeof t == "string" ? t === "use-credentials" ? t : "" : void 0) : t = null, i.d.C(e, t));
	}, e.prefetchDNS = function(e) {
		typeof e == "string" && i.d.D(e);
	}, e.preinit = function(e, t) {
		if (typeof e == "string" && t && typeof t.as == "string") {
			var n = t.as, r = c(n, t.crossOrigin), a = typeof t.integrity == "string" ? t.integrity : void 0, o = typeof t.fetchPriority == "string" ? t.fetchPriority : void 0;
			n === "style" ? i.d.S(e, typeof t.precedence == "string" ? t.precedence : void 0, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o
			}) : n === "script" && i.d.X(e, {
				crossOrigin: r,
				integrity: a,
				fetchPriority: o,
				nonce: typeof t.nonce == "string" ? t.nonce : void 0
			});
		}
	}, e.preinitModule = function(e, t) {
		if (typeof e == "string") if (typeof t == "object" && t) {
			if (t.as == null || t.as === "script") {
				var n = c(t.as, t.crossOrigin);
				i.d.M(e, {
					crossOrigin: n,
					integrity: typeof t.integrity == "string" ? t.integrity : void 0,
					nonce: typeof t.nonce == "string" ? t.nonce : void 0
				});
			}
		} else t ?? i.d.M(e);
	}, e.preload = function(e, t) {
		if (typeof e == "string" && typeof t == "object" && t && typeof t.as == "string") {
			var n = t.as, r = c(n, t.crossOrigin);
			i.d.L(e, n, {
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
			var n = c(t.as, t.crossOrigin);
			i.d.m(e, {
				as: typeof t.as == "string" && t.as !== "script" ? t.as : void 0,
				crossOrigin: n,
				integrity: typeof t.integrity == "string" ? t.integrity : void 0
			});
		} else i.d.m(e);
	}, e.requestFormReset = function(e) {
		i.d.r(e);
	}, e.unstable_batchedUpdates = function(e, t) {
		return e(t);
	}, e.useFormState = function(e, t, n) {
		return s.H.useFormState(e, t, n);
	}, e.useFormStatus = function() {
		return s.H.useHostTransitionStatus();
	}, e.version = "19.2.7";
})), m = /* @__PURE__ */ o(((e, t) => {
	function n() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = p();
})), h = /* @__PURE__ */ o(((e) => {
	var t = u(), n = f(), r = m();
	function i(e) {
		var t = "https://react.dev/errors/" + e;
		if (1 < arguments.length) {
			t += "?args[]=" + encodeURIComponent(arguments[1]);
			for (var n = 2; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
		}
		return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
	}
	function a(e) {
		return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
	}
	function o(e) {
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
	function s(e) {
		if (e.tag === 13) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function c(e) {
		if (e.tag === 31) {
			var t = e.memoizedState;
			if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
		}
		return null;
	}
	function l(e) {
		if (o(e) !== e) throw Error(i(188));
	}
	function d(e) {
		var t = e.alternate;
		if (!t) {
			if (t = o(e), t === null) throw Error(i(188));
			return t === e ? e : null;
		}
		for (var n = e, r = t;;) {
			var a = n.return;
			if (a === null) break;
			var s = a.alternate;
			if (s === null) {
				if (r = a.return, r !== null) {
					n = r;
					continue;
				}
				break;
			}
			if (a.child === s.child) {
				for (s = a.child; s;) {
					if (s === n) return l(a), e;
					if (s === r) return l(a), t;
					s = s.sibling;
				}
				throw Error(i(188));
			}
			if (n.return !== r.return) n = a, r = s;
			else {
				for (var c = !1, u = a.child; u;) {
					if (u === n) {
						c = !0, n = a, r = s;
						break;
					}
					if (u === r) {
						c = !0, r = a, n = s;
						break;
					}
					u = u.sibling;
				}
				if (!c) {
					for (u = s.child; u;) {
						if (u === n) {
							c = !0, n = s, r = a;
							break;
						}
						if (u === r) {
							c = !0, r = s, n = a;
							break;
						}
						u = u.sibling;
					}
					if (!c) throw Error(i(189));
				}
			}
			if (n.alternate !== r) throw Error(i(190));
		}
		if (n.tag !== 3) throw Error(i(188));
		return n.stateNode.current === n ? e : t;
	}
	function p(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e;
		for (e = e.child; e !== null;) {
			if (t = p(e), t !== null) return t;
			e = e.sibling;
		}
		return null;
	}
	var h = Object.assign, g = Symbol.for("react.element"), _ = Symbol.for("react.transitional.element"), v = Symbol.for("react.portal"), y = Symbol.for("react.fragment"), b = Symbol.for("react.strict_mode"), x = Symbol.for("react.profiler"), S = Symbol.for("react.consumer"), C = Symbol.for("react.context"), w = Symbol.for("react.forward_ref"), T = Symbol.for("react.suspense"), E = Symbol.for("react.suspense_list"), D = Symbol.for("react.memo"), O = Symbol.for("react.lazy"), k = Symbol.for("react.activity"), ee = Symbol.for("react.memo_cache_sentinel"), A = Symbol.iterator;
	function te(e) {
		return typeof e != "object" || !e ? null : (e = A && e[A] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var j = Symbol.for("react.client.reference");
	function M(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === j ? null : e.displayName || e.name || null;
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
	var N = Array.isArray, P = n.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, F = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, ne = {
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
	var ie = re(null), ae = re(null), oe = re(null), se = re(null);
	function ce(e, t) {
		switch (z(oe, t), z(ae, e), z(ie, null), t.nodeType) {
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
	function le() {
		R(ie), R(ae), R(oe);
	}
	function ue(e) {
		e.memoizedState !== null && z(se, e);
		var t = ie.current, n = Ud(t, e.type);
		t !== n && (z(ae, e), z(ie, n));
	}
	function de(e) {
		ae.current === e && (R(ie), R(ae)), se.current === e && (R(se), $f._currentValue = ne);
	}
	var fe, pe;
	function B(e) {
		if (fe === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			fe = t && t[1] || "", pe = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + fe + e + pe;
	}
	var me = !1;
	function he(e, t) {
		if (!e || me) return "";
		me = !0;
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
			me = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? B(n) : "";
	}
	function ge(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return B(e.type);
			case 16: return B("Lazy");
			case 13: return e.child !== t && t !== null ? B("Suspense Fallback") : B("Suspense");
			case 19: return B("SuspenseList");
			case 0:
			case 15: return he(e.type, !1);
			case 11: return he(e.type.render, !1);
			case 1: return he(e.type, !0);
			case 31: return B("Activity");
			default: return "";
		}
	}
	function _e(e) {
		try {
			var t = "", n = null;
			do
				t += ge(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var ve = Object.prototype.hasOwnProperty, ye = t.unstable_scheduleCallback, be = t.unstable_cancelCallback, xe = t.unstable_shouldYield, Se = t.unstable_requestPaint, V = t.unstable_now, Ce = t.unstable_getCurrentPriorityLevel, we = t.unstable_ImmediatePriority, Te = t.unstable_UserBlockingPriority, Ee = t.unstable_NormalPriority, De = t.unstable_LowPriority, Oe = t.unstable_IdlePriority, ke = t.log, Ae = t.unstable_setDisableYieldValue, je = null, Me = null;
	function Ne(e) {
		if (typeof ke == "function" && Ae(e), Me && typeof Me.setStrictMode == "function") try {
			Me.setStrictMode(je, e);
		} catch {}
	}
	var H = Math.clz32 ? Math.clz32 : Ie, Pe = Math.log, Fe = Math.LN2;
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
			var u = 31 - H(n), d = 1 << u;
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
		var r = 31 - H(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function Ye(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - H(n), i = 1 << r;
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
	var tt = Math.random().toString(36).slice(2), nt = "__reactFiber$" + tt, rt = "__reactProps$" + tt, it = "__reactContainer$" + tt, at = "__reactEvents$" + tt, ot = "__reactListeners$" + tt, st = "__reactHandles$" + tt, ct = "__reactResources$" + tt, lt = "__reactMarker$" + tt;
	function ut(e) {
		delete e[nt], delete e[rt], delete e[at], delete e[ot], delete e[st];
	}
	function dt(e) {
		var t = e[nt];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[it] || n[nt]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = ff(e); e !== null;) {
					if (n = e[nt]) return n;
					e = ff(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function ft(e) {
		if (e = e[nt] || e[it]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function pt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(i(33));
	}
	function mt(e) {
		var t = e[ct];
		return t ||= e[ct] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function ht(e) {
		e[lt] = !0;
	}
	var gt = /* @__PURE__ */ new Set(), _t = {};
	function vt(e, t) {
		yt(e, t), yt(e + "Capture", t);
	}
	function yt(e, t) {
		for (_t[e] = t, e = 0; e < t.length; e++) gt.add(t[e]);
	}
	var bt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), xt = {}, St = {};
	function Ct(e) {
		return ve.call(St, e) ? !0 : ve.call(xt, e) ? !1 : bt.test(e) ? St[e] = !0 : (xt[e] = !0, !1);
	}
	function wt(e, t, n) {
		if (Ct(t)) if (n === null) e.removeAttribute(t);
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
	function Tt(e, t, n) {
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
	function Et(e, t, n, r) {
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
	function Dt(e) {
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
	function Ot(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function kt(e, t, n) {
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
	function At(e) {
		if (!e._valueTracker) {
			var t = Ot(e) ? "checked" : "value";
			e._valueTracker = kt(e, t, "" + e[t]);
		}
	}
	function jt(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = Ot(e) ? e.checked ? "true" : "false" : e.value), e = r, e === n ? !1 : (t.setValue(e), !0);
	}
	function Mt(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	var Nt = /[\n"\\]/g;
	function Pt(e) {
		return e.replace(Nt, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function Ft(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + Dt(t)) : e.value !== "" + Dt(t) && (e.value = "" + Dt(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : Lt(e, o, Dt(n)) : Lt(e, o, Dt(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + Dt(s) : e.removeAttribute("name");
	}
	function It(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				At(e);
				return;
			}
			n = n == null ? "" : "" + Dt(n), t = t == null ? n : "" + Dt(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), At(e);
	}
	function Lt(e, t, n) {
		t === "number" && Mt(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
	}
	function Rt(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + Dt(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function zt(e, t, n) {
		if (t != null && (t = "" + Dt(t), t !== e.value && (e.value = t), n == null)) {
			e.defaultValue !== t && (e.defaultValue = t);
			return;
		}
		e.defaultValue = n == null ? "" : "" + Dt(n);
	}
	function Bt(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(i(92));
				if (N(r)) {
					if (1 < r.length) throw Error(i(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = Dt(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), At(e);
	}
	function Vt(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Ht = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function Ut(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || Ht.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function Wt(e, t, n) {
		if (t != null && typeof t != "object") throw Error(i(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
			for (var a in t) r = t[a], t.hasOwnProperty(a) && n[a] !== r && Ut(e, a, r);
		} else for (var o in t) t.hasOwnProperty(o) && Ut(e, o, t[o]);
	}
	function Gt(e) {
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
	var Kt = new Map([
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
	]), qt = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function Jt(e) {
		return qt.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function Yt() {}
	var Xt = null;
	function Zt(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var Qt = null, $t = null;
	function en(e) {
		var t = ft(e);
		if (t && (e = t.stateNode)) {
			var n = e[rt] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (Ft(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + Pt("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var a = r[rt] || null;
								if (!a) throw Error(i(90));
								Ft(r, a.value, a.defaultValue, a.defaultValue, a.checked, a.defaultChecked, a.type, a.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && jt(r);
					}
					break a;
				case "textarea":
					zt(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && Rt(e, !!n.multiple, t, !1);
			}
		}
	}
	var tn = !1;
	function nn(e, t, n) {
		if (tn) return e(t, n);
		tn = !0;
		try {
			return e(t);
		} finally {
			if (tn = !1, (Qt !== null || $t !== null) && (yu(), Qt && (t = Qt, e = $t, $t = Qt = null, en(t), e))) for (t = 0; t < e.length; t++) en(e[t]);
		}
	}
	function rn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[rt] || null;
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
		if (n && typeof n != "function") throw Error(i(231, t, typeof n));
		return n;
	}
	var an = !(typeof window > "u" || window.document === void 0 || window.document.createElement === void 0), on = !1;
	if (an) try {
		var sn = {};
		Object.defineProperty(sn, "passive", { get: function() {
			on = !0;
		} }), window.addEventListener("test", sn, sn), window.removeEventListener("test", sn, sn);
	} catch {
		on = !1;
	}
	var cn = null, ln = null, un = null;
	function dn() {
		if (un) return un;
		var e, t = ln, n = t.length, r, i = "value" in cn ? cn.value : cn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return un = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function fn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function pn() {
		return !0;
	}
	function mn() {
		return !1;
	}
	function hn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? pn : mn, this.isPropagationStopped = mn, this;
		}
		return h(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = pn);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = pn);
			},
			persist: function() {},
			isPersistent: pn
		}), t;
	}
	var gn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, _n = hn(gn), vn = h({}, gn, {
		view: 0,
		detail: 0
	}), yn = hn(vn), bn, xn, Sn, Cn = h({}, vn, {
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
		getModifierState: Pn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== Sn && (Sn && e.type === "mousemove" ? (bn = e.screenX - Sn.screenX, xn = e.screenY - Sn.screenY) : xn = bn = 0, Sn = e), bn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : xn;
		}
	}), wn = hn(Cn), Tn = hn(h({}, Cn, { dataTransfer: 0 })), En = hn(h({}, vn, { relatedTarget: 0 })), Dn = hn(h({}, gn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), On = hn(h({}, gn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), kn = hn(h({}, gn, { data: 0 })), An = {
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
	}, jn = {
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
	}, Mn = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function Nn(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Mn[e]) ? !!t[e] : !1;
	}
	function Pn() {
		return Nn;
	}
	var Fn = hn(h({}, vn, {
		key: function(e) {
			if (e.key) {
				var t = An[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = fn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? jn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: Pn,
		charCode: function(e) {
			return e.type === "keypress" ? fn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? fn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), In = hn(h({}, Cn, {
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
	})), Ln = hn(h({}, vn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: Pn
	})), Rn = hn(h({}, gn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), zn = hn(h({}, Cn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), U = hn(h({}, gn, {
		newState: 0,
		oldState: 0
	})), Bn = [
		9,
		13,
		27,
		32
	], Vn = an && "CompositionEvent" in window, Hn = null;
	an && "documentMode" in document && (Hn = document.documentMode);
	var Un = an && "TextEvent" in window && !Hn, Wn = an && (!Vn || Hn && 8 < Hn && 11 >= Hn), Gn = " ", Kn = !1;
	function qn(e, t) {
		switch (e) {
			case "keyup": return Bn.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function Jn(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var Yn = !1;
	function Xn(e, t) {
		switch (e) {
			case "compositionend": return Jn(t);
			case "keypress": return t.which === 32 ? (Kn = !0, Gn) : null;
			case "textInput": return e = t.data, e === Gn && Kn ? null : e;
			default: return null;
		}
	}
	function Zn(e, t) {
		if (Yn) return e === "compositionend" || !Vn && qn(e, t) ? (e = dn(), un = ln = cn = null, Yn = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return Wn && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var Qn = {
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
	function $n(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!Qn[e.type] : t === "textarea";
	}
	function er(e, t, n, r) {
		Qt ? $t ? $t.push(r) : $t = [r] : Qt = r, t = Ed(t, "onChange"), 0 < t.length && (n = new _n("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var tr = null, nr = null;
	function rr(e) {
		yd(e, 0);
	}
	function ir(e) {
		if (jt(pt(e))) return e;
	}
	function ar(e, t) {
		if (e === "change") return t;
	}
	var or = !1;
	if (an) {
		var sr;
		if (an) {
			var cr = "oninput" in document;
			if (!cr) {
				var lr = document.createElement("div");
				lr.setAttribute("oninput", "return;"), cr = typeof lr.oninput == "function";
			}
			sr = cr;
		} else sr = !1;
		or = sr && (!document.documentMode || 9 < document.documentMode);
	}
	function ur() {
		tr && (tr.detachEvent("onpropertychange", dr), nr = tr = null);
	}
	function dr(e) {
		if (e.propertyName === "value" && ir(nr)) {
			var t = [];
			er(t, nr, e, Zt(e)), nn(rr, t);
		}
	}
	function fr(e, t, n) {
		e === "focusin" ? (ur(), tr = t, nr = n, tr.attachEvent("onpropertychange", dr)) : e === "focusout" && ur();
	}
	function pr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return ir(nr);
	}
	function mr(e, t) {
		if (e === "click") return ir(t);
	}
	function hr(e, t) {
		if (e === "input" || e === "change") return ir(t);
	}
	function gr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var _r = typeof Object.is == "function" ? Object.is : gr;
	function vr(e, t) {
		if (_r(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!ve.call(t, i) || !_r(e[i], t[i])) return !1;
		}
		return !0;
	}
	function yr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function br(e, t) {
		var n = yr(e);
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
			n = yr(n);
		}
	}
	function xr(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? xr(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Sr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = Mt(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = Mt(e.document);
		}
		return t;
	}
	function Cr(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var wr = an && "documentMode" in document && 11 >= document.documentMode, Tr = null, Er = null, Dr = null, Or = !1;
	function kr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		Or || Tr == null || Tr !== Mt(r) || (r = Tr, "selectionStart" in r && Cr(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Dr && vr(Dr, r) || (Dr = r, r = Ed(Er, "onSelect"), 0 < r.length && (t = new _n("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Tr)));
	}
	function Ar(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var jr = {
		animationend: Ar("Animation", "AnimationEnd"),
		animationiteration: Ar("Animation", "AnimationIteration"),
		animationstart: Ar("Animation", "AnimationStart"),
		transitionrun: Ar("Transition", "TransitionRun"),
		transitionstart: Ar("Transition", "TransitionStart"),
		transitioncancel: Ar("Transition", "TransitionCancel"),
		transitionend: Ar("Transition", "TransitionEnd")
	}, Mr = {}, Nr = {};
	an && (Nr = document.createElement("div").style, "AnimationEvent" in window || (delete jr.animationend.animation, delete jr.animationiteration.animation, delete jr.animationstart.animation), "TransitionEvent" in window || delete jr.transitionend.transition);
	function Pr(e) {
		if (Mr[e]) return Mr[e];
		if (!jr[e]) return e;
		var t = jr[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in Nr) return Mr[e] = t[n];
		return e;
	}
	var Fr = Pr("animationend"), Ir = Pr("animationiteration"), Lr = Pr("animationstart"), Rr = Pr("transitionrun"), zr = Pr("transitionstart"), Br = Pr("transitioncancel"), Vr = Pr("transitionend"), Hr = /* @__PURE__ */ new Map(), Ur = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	Ur.push("scrollEnd");
	function Wr(e, t) {
		Hr.set(e, t), vt(t, [e]);
	}
	var Gr = typeof reportError == "function" ? reportError : function(e) {
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
	}, Kr = [], qr = 0, Jr = 0;
	function Yr() {
		for (var e = qr, t = Jr = qr = 0; t < e;) {
			var n = Kr[t];
			Kr[t++] = null;
			var r = Kr[t];
			Kr[t++] = null;
			var i = Kr[t];
			Kr[t++] = null;
			var a = Kr[t];
			if (Kr[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && $r(n, i, a);
		}
	}
	function Xr(e, t, n, r) {
		Kr[qr++] = e, Kr[qr++] = t, Kr[qr++] = n, Kr[qr++] = r, Jr |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function Zr(e, t, n, r) {
		return Xr(e, t, n, r), ei(e);
	}
	function Qr(e, t) {
		return Xr(e, null, null, t), ei(e);
	}
	function $r(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - H(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function ei(e) {
		if (50 < uu) throw uu = 0, du = null, Error(i(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var ti = {};
	function ni(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function ri(e, t, n, r) {
		return new ni(e, t, n, r);
	}
	function ii(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function ai(e, t) {
		var n = e.alternate;
		return n === null ? (n = ri(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function oi(e, t) {
		e.flags &= 65011714;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function si(e, t, n, r, a, o) {
		var s = 0;
		if (r = e, typeof e == "function") ii(e) && (s = 1);
		else if (typeof e == "string") s = Wf(e, n, ie.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (e) {
			case k: return e = ri(31, n, t, a), e.elementType = k, e.lanes = o, e;
			case y: return ci(n.children, a, o, t);
			case b:
				s = 8, a |= 24;
				break;
			case x: return e = ri(12, n, t, a | 2), e.elementType = x, e.lanes = o, e;
			case T: return e = ri(13, n, t, a), e.elementType = T, e.lanes = o, e;
			case E: return e = ri(19, n, t, a), e.elementType = E, e.lanes = o, e;
			default:
				if (typeof e == "object" && e) switch (e.$$typeof) {
					case C:
						s = 10;
						break a;
					case S:
						s = 9;
						break a;
					case w:
						s = 11;
						break a;
					case D:
						s = 14;
						break a;
					case O:
						s = 16, r = null;
						break a;
				}
				s = 29, n = Error(i(130, e === null ? "null" : typeof e, "")), r = null;
		}
		return t = ri(s, n, t, a), t.elementType = e, t.type = r, t.lanes = o, t;
	}
	function ci(e, t, n, r) {
		return e = ri(7, e, r, t), e.lanes = n, e;
	}
	function li(e, t, n) {
		return e = ri(6, e, null, t), e.lanes = n, e;
	}
	function ui(e) {
		var t = ri(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function di(e, t, n) {
		return t = ri(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var fi = /* @__PURE__ */ new WeakMap();
	function pi(e, t) {
		if (typeof e == "object" && e) {
			var n = fi.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: _e(t)
			}, fi.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: _e(t)
		};
	}
	var mi = [], hi = 0, gi = null, _i = 0, W = [], vi = 0, yi = null, bi = 1, xi = "";
	function Si(e, t) {
		mi[hi++] = _i, mi[hi++] = gi, gi = e, _i = t;
	}
	function Ci(e, t, n) {
		W[vi++] = bi, W[vi++] = xi, W[vi++] = yi, yi = e;
		var r = bi;
		e = xi;
		var i = 32 - H(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - H(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, bi = 1 << 32 - H(t) + i | n << i | r, xi = a + e;
		} else bi = 1 << a | n << i | r, xi = e;
	}
	function wi(e) {
		e.return !== null && (Si(e, 1), Ci(e, 1, 0));
	}
	function Ti(e) {
		for (; e === gi;) gi = mi[--hi], mi[hi] = null, _i = mi[--hi], mi[hi] = null;
		for (; e === yi;) yi = W[--vi], W[vi] = null, xi = W[--vi], W[vi] = null, bi = W[--vi], W[vi] = null;
	}
	function Ei(e, t) {
		W[vi++] = bi, W[vi++] = xi, W[vi++] = yi, bi = t.id, xi = t.overflow, yi = e;
	}
	var Di = null, Oi = null, G = !1, ki = null, Ai = !1, ji = Error(i(519));
	function Mi(e) {
		throw Ri(pi(Error(i(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), ji;
	}
	function Ni(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[nt] = e, t[rt] = r, n) {
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
				Q("invalid", t), It(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), Bt(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || Md(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = Yt), t = !0) : t = !1, t || Mi(e, !0);
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
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
			Oi = df(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(317));
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
	var zi = re(null), Bi = null, Vi = null;
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
		var a = e.child;
		for (a !== null && (a.return = e); a !== null;) {
			var o = a.dependencies;
			if (o !== null) {
				var s = a.child;
				o = o.firstContext;
				a: for (; o !== null;) {
					var c = o;
					o = a;
					for (var l = 0; l < t.length; l++) if (c.context === t[l]) {
						o.lanes |= n, c = o.alternate, c !== null && (c.lanes |= n), Wi(o.return, n, e), r || (s = null);
						break a;
					}
					o = c.next;
				}
			} else if (a.tag === 18) {
				if (s = a.return, s === null) throw Error(i(341));
				s.lanes |= n, o = s.alternate, o !== null && (o.lanes |= n), Wi(s, n, e), s = null;
			} else s = a.child;
			if (s !== null) s.return = a;
			else for (s = a; s !== null;) {
				if (s === e) {
					s = null;
					break;
				}
				if (a = s.sibling, a !== null) {
					a.return = s.return, s = a;
					break;
				}
				s = s.return;
			}
			a = s;
		}
	}
	function Ki(e, t, n, r) {
		e = null;
		for (var a = t, o = !1; a !== null;) {
			if (!o) {
				if (a.flags & 524288) o = !0;
				else if (a.flags & 262144) break;
			}
			if (a.tag === 10) {
				var s = a.alternate;
				if (s === null) throw Error(i(387));
				if (s = s.memoizedProps, s !== null) {
					var c = a.type;
					_r(a.pendingProps.value, s.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (a === se.current) {
				if (s = a.alternate, s === null) throw Error(i(387));
				s.memoizedState.memoizedState !== a.memoizedState.memoizedState && (e === null ? e = [$f] : e.push($f));
			}
			a = a.return;
		}
		e !== null && Gi(t, e, n, r), t.flags |= 262144;
	}
	function qi(e) {
		for (e = e.firstContext; e !== null;) {
			if (!_r(e.context._currentValue, e.memoizedValue)) return !0;
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
			if (e === null) throw Error(i(308));
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
	}, $i = t.unstable_scheduleCallback, ea = t.unstable_NormalPriority, ta = {
		$$typeof: C,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function na() {
		return {
			controller: new Qi(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function ra(e) {
		e.refCount--, e.refCount === 0 && $i(ea, function() {
			e.controller.abort();
		});
	}
	var ia = null, aa = 0, oa = 0, sa = null;
	function K(e, t) {
		if (ia === null) {
			var n = ia = [];
			aa = 0, oa = dd(), sa = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return aa++, t.then(ca, ca), t;
	}
	function ca() {
		if (--aa === 0 && ia !== null) {
			sa !== null && (sa.status = "fulfilled");
			var e = ia;
			ia = null, oa = 0, sa = null;
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
		$l = V(), typeof t == "object" && t && typeof t.then == "function" && K(e, t), ua !== null && ua(e, t);
	};
	var da = re(null);
	function fa() {
		var e = da.current;
		return e === null ? Ll.pooledCache : e;
	}
	function pa(e, t) {
		t === null ? z(da, da.current) : z(da, t.pool);
	}
	function ma() {
		var e = fa();
		return e === null ? null : {
			parent: ta._currentValue,
			pool: e
		};
	}
	var ha = Error(i(460)), ga = Error(i(474)), _a = Error(i(542)), va = { then: function() {} };
	function ya(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function ba(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Yt, Yt), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, wa(e), e;
			default:
				if (typeof t.status == "string") t.then(Yt, Yt);
				else {
					if (e = Ll, e !== null && 100 < e.shellSuspendCounter) throw Error(i(482));
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
		if (Sa === null) throw Error(i(459));
		var e = Sa;
		return Sa = null, e;
	}
	function wa(e) {
		if (e === ha || e === _a) throw Error(i(483));
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
		throw t.$$typeof === g ? Error(i(525)) : (e = Object.prototype.toString.call(t), Error(i(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
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
		function a(e, t) {
			return e = ai(e, t), e.index = 0, e.sibling = null, e;
		}
		function o(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 67108866, n) : (r = r.index, r < n ? (t.flags |= 67108866, n) : r)) : (t.flags |= 1048576, n);
		}
		function s(t) {
			return e && t.alternate === null && (t.flags |= 67108866), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = li(n, e.mode, r), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var i = n.type;
			return i === y ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === i || typeof i == "object" && i && i.$$typeof === O && xa(i) === t.type) ? (t = a(t, n.props), Oa(t, n), t.return = e, t) : (t = si(n.type, n.key, n.props, null, e.mode, r), Oa(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = di(n, e.mode, r), t.return = e, t) : (t = a(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, i) {
			return t === null || t.tag !== 7 ? (t = ci(n, e.mode, r, i), t.return = e, t) : (t = a(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = li("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case _: return n = si(t.type, t.key, t.props, null, e.mode, n), Oa(n, t), n.return = e, n;
					case v: return t = di(t, e.mode, n), t.return = e, t;
					case O: return t = xa(t), f(e, t, n);
				}
				if (N(t) || te(t)) return t = ci(t, e.mode, n, null), t.return = e, t;
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
				if (N(n) || te(n)) return i === null ? d(e, t, n, r, null) : null;
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
				if (N(r) || te(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, Da(r), i);
				if (r.$$typeof === C) return m(e, t, n, Xi(t, r), i);
				ka(t, r);
			}
			return null;
		}
		function h(i, a, s, c) {
			for (var l = null, u = null, d = a, h = a = 0, g = null; d !== null && h < s.length; h++) {
				d.index > h ? (g = d, d = null) : g = d.sibling;
				var _ = p(i, d, s[h], c);
				if (_ === null) {
					d === null && (d = g);
					break;
				}
				e && d && _.alternate === null && t(i, d), a = o(_, a, h), u === null ? l = _ : u.sibling = _, u = _, d = g;
			}
			if (h === s.length) return n(i, d), G && Si(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (a = o(d, a, h), u === null ? l = d : u.sibling = d, u = d);
				return G && Si(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), a = o(g, a, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), G && Si(i, h), l;
		}
		function g(a, s, c, l) {
			if (c == null) throw Error(i(151));
			for (var u = null, d = null, h = s, g = s = 0, _ = null, v = c.next(); h !== null && !v.done; g++, v = c.next()) {
				h.index > g ? (_ = h, h = null) : _ = h.sibling;
				var y = p(a, h, v.value, l);
				if (y === null) {
					h === null && (h = _);
					break;
				}
				e && h && y.alternate === null && t(a, h), s = o(y, s, g), d === null ? u = y : d.sibling = y, d = y, h = _;
			}
			if (v.done) return n(a, h), G && Si(a, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(a, v.value, l), v !== null && (s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
				return G && Si(a, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, a, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), s = o(v, s, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(a, e);
			}), G && Si(a, g), u;
		}
		function b(e, r, o, c) {
			if (typeof o == "object" && o && o.type === y && o.key === null && (o = o.props.children), typeof o == "object" && o) {
				switch (o.$$typeof) {
					case _:
						a: {
							for (var l = o.key; r !== null;) {
								if (r.key === l) {
									if (l = o.type, l === y) {
										if (r.tag === 7) {
											n(e, r.sibling), c = a(r, o.props.children), c.return = e, e = c;
											break a;
										}
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === O && xa(l) === r.type) {
										n(e, r.sibling), c = a(r, o.props), Oa(c, o), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								} else t(e, r);
								r = r.sibling;
							}
							o.type === y ? (c = ci(o.props.children, e.mode, c, o.key), c.return = e, e = c) : (c = si(o.type, o.key, o.props, null, e.mode, c), Oa(c, o), c.return = e, e = c);
						}
						return s(e);
					case v:
						a: {
							for (l = o.key; r !== null;) {
								if (r.key === l) if (r.tag === 4 && r.stateNode.containerInfo === o.containerInfo && r.stateNode.implementation === o.implementation) {
									n(e, r.sibling), c = a(r, o.children || []), c.return = e, e = c;
									break a;
								} else {
									n(e, r);
									break;
								}
								else t(e, r);
								r = r.sibling;
							}
							c = di(o, e.mode, c), c.return = e, e = c;
						}
						return s(e);
					case O: return o = xa(o), b(e, r, o, c);
				}
				if (N(o)) return h(e, r, o, c);
				if (te(o)) {
					if (l = te(o), typeof l != "function") throw Error(i(150));
					return o = l.call(o), g(e, r, o, c);
				}
				if (typeof o.then == "function") return b(e, r, Da(o), c);
				if (o.$$typeof === C) return b(e, r, Xi(e, o), c);
				ka(e, o);
			}
			return typeof o == "string" && o !== "" || typeof o == "number" || typeof o == "bigint" ? (o = "" + o, r !== null && r.tag === 6 ? (n(e, r.sibling), c = a(r, o), c.return = e, e = c) : (n(e, r), c = li(o, e.mode, c), c.return = e, e = c), s(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				Ea = 0;
				var i = b(e, t, n, r);
				return Ta = null, i;
			} catch (t) {
				if (t === ha || t === _a) throw t;
				var a = ri(29, t, null, e.mode);
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
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = ei(e), $r(e, null, n), t;
		}
		return Xr(e, r, t, n), ei(e);
	}
	function Ra(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Ye(e, n);
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
			var e = sa;
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
					f !== 0 && f === oa && (Ba = !0), u !== null && (u = u.next = {
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
			u === null && (c = d), i.baseState = c, i.firstBaseUpdate = l, i.lastBaseUpdate = u, a === null && (i.shared.lanes = 0), Z |= o, e.lanes = o, e.memoizedState = d;
		}
	}
	function Ua(e, t) {
		if (typeof e != "function") throw Error(i(191, e));
		e.call(t);
	}
	function Wa(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) Ua(n[e], t);
	}
	var Ga = re(null), Ka = re(0);
	function qa(e, t) {
		e = Ul, z(Ka, e), z(Ga, t), Ul = e | t.baseLanes;
	}
	function Ja() {
		z(Ka, Ul), z(Ga, Ga.current);
	}
	function Ya() {
		Ul = Ka.current, R(Ga), R(Ka);
	}
	var Xa = re(null), Za = null;
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
	var ro = re(0);
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
		throw Error(i(321));
	}
	function _o(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!_r(e[n], t[n])) return !1;
		return !0;
	}
	function vo(e, t, n, r, i, a) {
		return ao = a, q = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, P.H = e === null || e.memoizedState === null ? Ps : Fs, uo = !1, a = n(r, i), uo = !1, lo && (a = bo(t, n, r, i)), yo(e), a;
	}
	function yo(e) {
		P.H = Ns;
		var t = oo !== null && oo.next !== null;
		if (ao = 0, so = oo = q = null, co = !1, po = 0, mo = null, t) throw Error(i(300));
		e === null || Qs || (e = e.dependencies, e !== null && qi(e) && (Qs = !0));
	}
	function bo(e, t, n, r) {
		q = e;
		var a = 0;
		do {
			if (lo && (mo = null), po = 0, lo = !1, 25 <= a) throw Error(i(301));
			if (a += 1, so = oo = null, e.updateQueue != null) {
				var o = e.updateQueue;
				o.lastEffect = null, o.events = null, o.stores = null, o.memoCache != null && (o.memoCache.index = 0);
			}
			P.H = Is, o = t(n, r);
		} while (lo);
		return o;
	}
	function xo() {
		var e = P.H, t = e.useState()[0];
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
			if (e === null) throw q.alternate === null ? Error(i(467)) : Error(i(310));
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
		return po += 1, mo === null && (mo = []), e = ba(mo, e, t), t = q, (so === null ? t.memoizedState : so.next) === null && (t = t.alternate, P.H = t === null || t.memoizedState === null ? Ps : Fs), e;
	}
	function ko(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return Oo(e);
			if (e.$$typeof === C) return Yi(e);
		}
		throw Error(i(438, String(e)));
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
		}, n === null && (n = Do(), q.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = ee;
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
		if (r === null) throw Error(i(311));
		r.lastRenderedReducer = n;
		var a = e.baseQueue, o = r.pending;
		if (o !== null) {
			if (a !== null) {
				var s = a.next;
				a.next = o.next, o.next = s;
			}
			t.baseQueue = a = o, r.pending = null;
		}
		if (o = e.baseState, a === null) e.memoizedState = o;
		else {
			t = a.next;
			var c = s = null, l = null, u = t, d = !1;
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
					}), f === oa && (d = !0);
					else if ((ao & p) === p) {
						u = u.next, p === oa && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, s = o) : l = l.next = f, q.lanes |= p, Z |= p;
					f = u.action, uo && n(o, f), o = u.hasEagerState ? u.eagerState : n(o, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, s = o) : l = l.next = p, q.lanes |= f, Z |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? s = o : l.next = c, !_r(o, e.memoizedState) && (Qs = !0, d && (n = sa, n !== null))) throw n;
			e.memoizedState = o, e.baseState = s, e.baseQueue = l, r.lastRenderedState = o;
		}
		return a === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function Po(e) {
		var t = Eo(), n = t.queue;
		if (n === null) throw Error(i(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, a = n.pending, o = t.memoizedState;
		if (a !== null) {
			n.pending = null;
			var s = a = a.next;
			do
				o = e(o, s.action), s = s.next;
			while (s !== a);
			_r(o, t.memoizedState) || (Qs = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
		}
		return [o, r];
	}
	function Fo(e, t, n) {
		var r = q, a = Eo(), o = G;
		if (o) {
			if (n === void 0) throw Error(i(407));
			n = n();
		} else n = t();
		var s = !_r((oo || a).memoizedState, n);
		if (s && (a.memoizedState = n, Qs = !0), a = a.queue, os(Ro.bind(null, r, a, e), [e]), a.getSnapshot !== t || s || so !== null && so.memoizedState.tag & 1) {
			if (r.flags |= 2048, ts(9, { destroy: void 0 }, Lo.bind(null, r, a, n, t), null), Ll === null) throw Error(i(349));
			o || ao & 127 || Io(r, t, n);
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
			return !_r(e, n);
		} catch {
			return !0;
		}
	}
	function Bo(e) {
		var t = Qr(e, 2);
		t !== null && mu(t, e, 2);
	}
	function Vo(e) {
		var t = To();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), uo) {
				Ne(!0);
				try {
					n();
				} finally {
					Ne(!1);
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
	function Uo(e, t, n, r, a) {
		if (As(e)) throw Error(i(485));
		if (e = t.action, e !== null) {
			var o = {
				payload: a,
				action: e,
				next: null,
				isTransition: !0,
				status: "pending",
				value: null,
				reason: null,
				listeners: [],
				then: function(e) {
					o.listeners.push(e);
				}
			};
			P.T === null ? o.isTransition = !1 : n(!0), r(o), n = t.pending, n === null ? (o.next = t.pending = o, Wo(t, o)) : (o.next = n.next, t.pending = n.next = o);
		}
	}
	function Wo(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = P.T, o = {};
			P.T = o;
			try {
				var s = n(i, r), c = P.S;
				c !== null && c(o, s), Go(e, t, s);
			} catch (n) {
				qo(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), P.T = a;
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
			if (Il & 2) throw Error(i(440));
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
			Ne(!0);
			try {
				e();
			} finally {
				Ne(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function gs(e, t, n) {
		return n === void 0 || ao & 1073741824 && !(X & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = pu(), q.lanes |= e, Z |= e, n);
	}
	function _s(e, t, n, r) {
		return _r(n, t) ? n : Ga.current === null ? !(ao & 42) || ao & 1073741824 && !(X & 261930) ? (Qs = !0, e.memoizedState = n) : (e = pu(), q.lanes |= e, Z |= e, t) : (e = gs(e, n, r), _r(e, t) || (Qs = !0), e);
	}
	function vs(e, t, n, r, i) {
		var a = F.p;
		F.p = a !== 0 && 8 > a ? a : 8;
		var o = P.T, s = {};
		P.T = s, ks(e, !1, t, n);
		try {
			var c = i(), l = P.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? Os(e, t, la(c, r), fu(e)) : Os(e, t, r, fu(e));
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
	function ys() {}
	function bs(e, t, n, r) {
		if (e.tag !== 5) throw Error(i(476));
		var a = J(e).queue;
		vs(e, a, t, ne, n === null ? ys : function() {
			return xs(e), n(r);
		});
	}
	function J(e) {
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
				lastRenderedReducer: jo,
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
				lastRenderedReducer: jo,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function xs(e) {
		var t = J(e);
		t.next === null && (t = e.alternate.memoizedState), Os(e, t.next.queue, {}, fu());
	}
	function Ss() {
		return Yi($f);
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
					r !== null && (mu(r, t, n), Ra(r, t, n)), t = { cache: na() }, e.payload = t;
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
		}, As(e) ? js(t, n) : (n = Zr(e, t, n, r), n !== null && (mu(n, e, r), Ms(n, t, r)));
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
				if (i.hasEagerState = !0, i.eagerState = s, _r(s, o)) return Xr(e, t, i, 0), Ll === null && Yr(), !1;
			} catch {}
			if (n = Zr(e, t, i, r), n !== null) return mu(n, e, r), Ms(n, t, r), !0;
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
			if (t) throw Error(i(479));
		} else t = Zr(e, n, r, 2), t !== null && mu(t, e, 2);
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
			r &= e.pendingLanes, n |= r, t.lanes = n, Ye(e, n);
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
				Ne(!0);
				try {
					e();
				} finally {
					Ne(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = To();
			if (n !== void 0) {
				var i = n(t);
				if (uo) {
					Ne(!0);
					try {
						n(t);
					} finally {
						Ne(!1);
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
		useDebugValue: ps,
		useDeferredValue: function(e, t) {
			return gs(To(), e, t);
		},
		useTransition: function() {
			var e = Vo(!1);
			return e = vs.bind(null, q, e.queue, !0, !1), To().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = q, a = To();
			if (G) {
				if (n === void 0) throw Error(i(407));
				n = n();
			} else {
				if (n = t(), Ll === null) throw Error(i(349));
				X & 127 || Io(r, t, n);
			}
			a.memoizedState = n;
			var o = {
				value: n,
				getSnapshot: t
			};
			return a.queue = o, as(Ro.bind(null, r, o, e), [e]), r.flags |= 2048, ts(9, { destroy: void 0 }, Lo.bind(null, r, o, n, t), null), n;
		},
		useId: function() {
			var e = To(), t = Ll.identifierPrefix;
			if (G) {
				var n = xi, r = bi;
				n = (r & ~(1 << 32 - H(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = fo++, 0 < n && (t += "H" + n.toString(32)), t += "_";
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
				if (Il & 2) throw Error(i(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, Fs = {
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
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !vr(n, r) || !vr(i, a) : !0;
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
		Gr(e);
	}
	function Us(e) {
		console.error(e);
	}
	function Ws(e) {
		Gr(e);
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
	function Xs(e, t, n, r, a) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Ki(t, n, a, !0), n = Xa.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return Za === null ? Eu() : n.alternate === null && Wl === 0 && (Wl = 3), n.flags &= -257, n.flags |= 65536, n.lanes = a, r === va ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = new Set([r]) : t.add(r), Gu(e, r, a)), !1;
					case 22: return n.flags |= 65536, r === va ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = new Set([r]) : n.add(r)), Gu(e, r, a)), !1;
				}
				throw Error(i(435, n.tag));
			}
			return Gu(e, r, a), Eu(), !1;
		}
		if (G) return t = Xa.current, t === null ? (r !== ji && (t = Error(i(423), { cause: r }), Ri(pi(t, n))), e = e.current.alternate, e.flags |= 65536, a &= -a, e.lanes |= a, r = pi(r, n), a = qs(e.stateNode, r, a), za(e, a), Wl !== 4 && (Wl = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = a, r !== ji && (e = Error(i(422), { cause: r }), Ri(pi(e, n)))), !1;
		var o = Error(i(520), { cause: r });
		if (o = pi(o, n), Yl === null ? Yl = [o] : Yl.push(o), Wl !== 4 && (Wl = 2), t === null) return !0;
		r = pi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = a & -a, n.lanes |= e, e = qs(n.stateNode, r, e), za(n, e), !1;
				case 1: if (t = n.type, o = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (nu === null || !nu.has(o)))) return n.flags |= 65536, a &= -a, n.lanes |= a, a = Js(a), Ys(a, e, n, r), za(n, a), !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var Zs = Error(i(461)), Qs = !1;
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
			return typeof a == "function" && !ii(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, nc(e, t, a, r, i)) : (e = si(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !Tc(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? vr : n, n(o, r) && e.ref === t.ref) return wc(e, t, i);
		}
		return t.flags |= 1, e = ai(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function nc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (vr(a, r) && e.ref === t.ref) if (Qs = !1, t.pendingProps = r = a, Tc(e, i)) e.flags & 131072 && (Qs = !0);
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
			parent: ta._currentValue,
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
		var r = t.pendingProps, a = (t.flags & 128) != 0;
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
				}, n = ui(e), n.return = t, t.child = n, Di = t, Oi = null)) : e = null, e === null) throw Mi(t);
				return t.lanes = 536870912, null;
			}
			return oc(t, r);
		}
		var o = e.memoizedState;
		if (o !== null) {
			var s = o.dehydrated;
			if ($a(t), a) if (t.flags & 256) t.flags &= -257, t = sc(e, t, n);
			else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
			else throw Error(i(558));
			else if (Qs || Ki(e, t, n, !1), a = (n & e.childLanes) !== 0, Qs || a) {
				if (r = Ll, r !== null && (s = Xe(r, n), s !== 0 && s !== o.retryLane)) throw o.retryLane = s, Qr(e, s), mu(r, e, s), Zs;
				Eu(), t = sc(e, t, n);
			} else e = o.treeContext, Oi = lf(s.nextSibling), Di = t, G = !0, ki = null, Ai = !1, e !== null && Ei(t, e), t = oc(t, r), t.flags |= 4096;
			return t;
		}
		return e = ai(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function lc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(i(284));
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
			var a = ti, o = n.contextType;
			typeof o == "object" && o && (a = Yi(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Rs, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Pa(t), o = n.contextType, a.context = typeof o == "object" && o ? Yi(o) : ti, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Ls(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Rs.enqueueReplaceState(a, a.state, null), Ha(t, r, a, i), Va(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Vs(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = ti, typeof u == "object" && u && (o = Yi(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && Bs(t, a, r, o), Na = !1;
			var f = t.memoizedState;
			a.state = f, Ha(t, r, a, i), Va(), l = t.memoizedState, s || f !== l || Na ? (typeof d == "function" && (Ls(t, n, d, r), l = t.memoizedState), (c = Na || zs(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Fa(e, t), o = t.memoizedProps, u = Vs(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = ti, typeof l == "object" && l && (c = Yi(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && Bs(t, a, r, c), Na = !1, f = t.memoizedState, a.state = f, Ha(t, r, a, i), Va();
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
		var r = t.pendingProps, a = !1, o = (t.flags & 128) != 0, s;
		if ((s = o) || (s = e !== null && e.memoizedState === null ? !1 : (ro.current & 2) != 0), s && (a = !0, t.flags &= -129), s = (t.flags & 32) != 0, t.flags &= -33, e === null) {
			if (G) {
				if (a ? Qa(t) : to(t), (e = Oi) ? (e = af(e, Ai), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: yi === null ? null : {
						id: bi,
						overflow: xi
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = ui(e), n.return = t, t.child = n, Di = t, Oi = null)) : e = null, e === null) throw Mi(t);
				return sf(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var c = r.children;
			return r = r.fallback, a ? (to(t), a = t.mode, c = yc({
				mode: "hidden",
				children: c
			}, a), r = ci(r, a, n, null), c.return = t, r.return = t, c.sibling = r, t.child = c, r = t.child, r.memoizedState = hc(n), r.childLanes = gc(e, s, n), t.memoizedState = mc, ic(null, r)) : (Qa(t), vc(t, c));
		}
		var l = e.memoizedState;
		if (l !== null && (c = l.dehydrated, c !== null)) {
			if (o) t.flags & 256 ? (Qa(t), t.flags &= -257, t = bc(e, t, n)) : t.memoizedState === null ? (to(t), c = r.fallback, a = t.mode, r = yc({
				mode: "visible",
				children: r.children
			}, a), c = ci(c, a, n, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, ja(t, e.child, null, n), r = t.child, r.memoizedState = hc(n), r.childLanes = gc(e, s, n), t.memoizedState = mc, t = ic(null, r)) : (to(t), t.child = e.child, t.flags |= 128, t = null);
			else if (Qa(t), sf(c)) {
				if (s = c.nextSibling && c.nextSibling.dataset, s) var u = s.dgst;
				s = u, r = Error(i(419)), r.stack = "", r.digest = s, Ri({
					value: r,
					source: null,
					stack: null
				}), t = bc(e, t, n);
			} else if (Qs || Ki(e, t, n, !1), s = (n & e.childLanes) !== 0, Qs || s) {
				if (s = Ll, s !== null && (r = Xe(s, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, Qr(e, r), mu(s, e, r), Zs;
				of(c) || Eu(), t = bc(e, t, n);
			} else of(c) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, Oi = lf(c.nextSibling), Di = t, G = !0, ki = null, Ai = !1, e !== null && Ei(t, e), t = vc(t, r.children), t.flags |= 4096);
			return t;
		}
		return a ? (to(t), c = r.fallback, a = t.mode, l = e.child, u = l.sibling, r = ai(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (c = ci(c, a, n, null), c.flags |= 2) : c = ai(u, c), c.return = t, r.return = t, r.sibling = c, t.child = r, ic(null, r), r = t.child, c = e.child.memoizedState, c === null ? c = hc(n) : (a = c.cachePool, a === null ? a = ma() : (l = ta._currentValue, a = a.parent === l ? a : {
			parent: l,
			pool: l
		}), c = {
			baseLanes: c.baseLanes | n,
			cachePool: a
		}), r.memoizedState = c, r.childLanes = gc(e, s, n), t.memoizedState = mc, ic(e.child, r)) : (Qa(t), n = e.child, e = n.sibling, n = ai(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (s = t.deletions, s === null ? (t.deletions = [e], t.flags |= 16) : s.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function vc(e, t) {
		return t = yc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function yc(e, t) {
		return e = ri(22, e, null, t), e.lanes = 0, e;
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
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, z(ro, o), $s(e, t, r, n), r = G ? _i : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
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
		if (e !== null && (t.dependencies = e.dependencies), Z |= t.lanes, (n & t.childLanes) === 0) if (e !== null) {
			if (Ki(e, t, n, !1), (n & t.childLanes) === 0) return null;
		} else return null;
		if (e !== null && t.child !== e.child) throw Error(i(153));
		if (t.child !== null) {
			for (e = t.child, n = ai(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ai(e, e.pendingProps), n.return = t;
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
				ce(t, t.stateNode.containerInfo), Hi(t, ta, e.memoizedState.cache), Ii();
				break;
			case 27:
			case 5:
				ue(t);
				break;
			case 4:
				ce(t, t.stateNode.containerInfo);
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
			case 24: Hi(t, ta, e.memoizedState.cache);
		}
		return wc(e, t, n);
	}
	function Dc(e, t, n) {
		if (e !== null) if (e.memoizedProps !== t.pendingProps) Qs = !0;
		else {
			if (!Tc(e, n) && !(t.flags & 128)) return Qs = !1, Ec(e, t, n);
			Qs = !!(e.flags & 131072);
		}
		else Qs = !1, G && t.flags & 1048576 && Ci(t, _i, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = xa(t.elementType), t.type = e, typeof e == "function") ii(e) ? (r = Vs(e, r), t.tag = 1, t = fc(null, t, e, r, n)) : (t.tag = 0, t = uc(null, t, e, r, n));
					else {
						if (e != null) {
							var a = e.$$typeof;
							if (a === w) {
								t.tag = 11, t = ec(null, t, e, r, n);
								break a;
							} else if (a === D) {
								t.tag = 14, t = tc(null, t, e, r, n);
								break a;
							}
						}
						throw t = M(e) || e, Error(i(306, t, ""));
					}
				}
				return t;
			case 0: return uc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, a = Vs(r, t.pendingProps), fc(e, t, r, a, n);
			case 3:
				a: {
					if (ce(t, t.stateNode.containerInfo), e === null) throw Error(i(387));
					r = t.pendingProps;
					var o = t.memoizedState;
					a = o.element, Fa(e, t), Ha(t, r, null, n);
					var s = t.memoizedState;
					if (r = s.cache, Hi(t, ta, r), r !== o.cache && Gi(t, [ta], n, !0), Va(), r = s.element, o.isDehydrated) if (o = {
						element: r,
						isDehydrated: !1,
						cache: s.cache
					}, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
						t = pc(e, t, r, n);
						break a;
					} else if (r !== a) {
						a = pi(Error(i(424)), t), Ri(a), t = pc(e, t, r, n);
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
						if (Ii(), r === a) {
							t = wc(e, t, n);
							break a;
						}
						$s(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return lc(e, t), e === null ? (n = Af(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : G || (n = t.type, e = t.pendingProps, r = Vd(oe.current).createElement(n), r[nt] = t, r[rt] = e, Fd(r, n, e), ht(r), t.stateNode = r) : t.memoizedState = Af(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return ue(t), e === null && G && (r = t.stateNode = pf(t.type, t.pendingProps, oe.current), Di = t, Ai = !0, a = Oi, Qd(t.type) ? (uf = a, Oi = lf(r.firstChild)) : Oi = a), $s(e, t, t.pendingProps.children, n), lc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && G && ((a = r = Oi) && (r = nf(r, t.type, t.pendingProps, Ai), r === null ? a = !1 : (t.stateNode = r, Di = t, Oi = lf(r.firstChild), Ai = !1, a = !0)), a || Mi(t)), ue(t), a = t.type, o = t.pendingProps, s = e === null ? null : e.memoizedProps, r = o.children, Wd(a, o) ? r = null : s !== null && Wd(a, s) && (t.flags |= 32), t.memoizedState !== null && (a = vo(e, t, xo, null, null, n), $f._currentValue = a), lc(e, t), $s(e, t, r, n), t.child;
			case 6: return e === null && G && ((e = n = Oi) && (n = rf(n, t.pendingProps, Ai), n === null ? e = !1 : (t.stateNode = n, Di = t, Oi = null, e = !0)), e || Mi(t)), null;
			case 13: return _c(e, t, n);
			case 4: return ce(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = ja(t, null, r, n) : $s(e, t, r, n), t.child;
			case 11: return ec(e, t, t.type, t.pendingProps, n);
			case 7: return $s(e, t, t.pendingProps, n), t.child;
			case 8: return $s(e, t, t.pendingProps.children, n), t.child;
			case 12: return $s(e, t, t.pendingProps.children, n), t.child;
			case 10: return r = t.pendingProps, Hi(t, t.type, r.value), $s(e, t, r.children, n), t.child;
			case 9: return a = t.type._context, r = t.pendingProps.children, Ji(t), a = Yi(a), r = r(a), t.flags |= 1, $s(e, t, r, n), t.child;
			case 14: return tc(e, t, t.type, t.pendingProps, n);
			case 15: return nc(e, t, t.type, t.pendingProps, n);
			case 19: return Cc(e, t, n);
			case 31: return cc(e, t, n);
			case 22: return rc(e, t, n, t.pendingProps);
			case 24: return Ji(t), r = Yi(ta), e === null ? (a = fa(), a === null && (a = Ll, o = na(), a.pooledCache = o, o.refCount++, o !== null && (a.pooledCacheLanes |= n), a = o), t.memoizedState = {
				parent: r,
				cache: a
			}, Pa(t), Hi(t, ta, a)) : ((e.lanes & n) !== 0 && (Fa(e, t), Ha(t, null, null, n), Va()), a = e.memoizedState, o = t.memoizedState, a.parent === r ? (r = o.cache, Hi(t, ta, r), r !== a.cache && Gi(t, [ta], n, !0)) : (a = {
				parent: r,
				cache: r
			}, t.memoizedState = a, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = a), Hi(t, ta, r))), $s(e, t, t.pendingProps.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(i(156, t.tag));
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
		else if (e.flags |= 16777216, !Gf(t)) if (Cu()) e.flags |= 8192;
		else throw Sa = va, ga;
	}
	function jc(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : We(), e.lanes |= t, Jl |= t);
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
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Ui(ta), le(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Fi(t) ? Oc(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Li())), Nc(t), null;
			case 26:
				var a = t.type, o = t.memoizedState;
				return e === null ? (Oc(t), o === null ? (Nc(t), kc(t, a, null, r, n)) : (Nc(t), Ac(t, o))) : o ? o === e.memoizedState ? (Nc(t), t.flags &= -16777217) : (Oc(t), Nc(t), Ac(t, o)) : (e = e.memoizedProps, e !== r && Oc(t), Nc(t), kc(t, a, e, r, n)), null;
			case 27:
				if (de(t), n = oe.current, a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Oc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return Nc(t), null;
					}
					e = ie.current, Fi(t) ? Ni(t, e) : (e = pf(a, r, n), t.stateNode = e, Oc(t));
				}
				return Nc(t), null;
			case 5:
				if (de(t), a = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Oc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(i(166));
						return Nc(t), null;
					}
					if (o = ie.current, Fi(t)) Ni(t, o);
					else {
						var s = Vd(oe.current);
						switch (o) {
							case 1:
								o = s.createElementNS("http://www.w3.org/2000/svg", a);
								break;
							case 2:
								o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
								break;
							default: switch (a) {
								case "svg":
									o = s.createElementNS("http://www.w3.org/2000/svg", a);
									break;
								case "math":
									o = s.createElementNS("http://www.w3.org/1998/Math/MathML", a);
									break;
								case "script":
									o = s.createElement("div"), o.innerHTML = "<script><\/script>", o = o.removeChild(o.firstChild);
									break;
								case "select":
									o = typeof r.is == "string" ? s.createElement("select", { is: r.is }) : s.createElement("select"), r.multiple ? o.multiple = !0 : r.size && (o.size = r.size);
									break;
								default: o = typeof r.is == "string" ? s.createElement(a, { is: r.is }) : s.createElement(a);
							}
						}
						o[nt] = t, o[rt] = r;
						a: for (s = t.child; s !== null;) {
							if (s.tag === 5 || s.tag === 6) o.appendChild(s.stateNode);
							else if (s.tag !== 4 && s.tag !== 27 && s.child !== null) {
								s.child.return = s, s = s.child;
								continue;
							}
							if (s === t) break a;
							for (; s.sibling === null;) {
								if (s.return === null || s.return === t) break a;
								s = s.return;
							}
							s.sibling.return = s.return, s = s.sibling;
						}
						t.stateNode = o;
						a: switch (Fd(o, a, r), a) {
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
					if (typeof r != "string" && t.stateNode === null) throw Error(i(166));
					if (e = oe.current, Fi(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, a = Di, a !== null) switch (a.tag) {
							case 27:
							case 5: r = a.memoizedProps;
						}
						e[nt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || Md(e.nodeValue, n)), e || Mi(t, !0);
					} else e = Vd(e).createTextNode(r), e[nt] = t, t.stateNode = e;
				}
				return Nc(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Fi(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(i(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(i(557));
							e[nt] = t;
						} else Ii(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Nc(t), e = !1;
					} else n = Li(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (no(t), t) : (no(t), null);
					if (t.flags & 128) throw Error(i(558));
				}
				return Nc(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (a = Fi(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!a) throw Error(i(318));
							if (a = t.memoizedState, a = a === null ? null : a.dehydrated, !a) throw Error(i(317));
							a[nt] = t;
						} else Ii(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Nc(t), a = !1;
					} else a = Li(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = a), a = !0;
					if (!a) return t.flags & 256 ? (no(t), t) : (no(t), null);
				}
				return no(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, a = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (a = r.alternate.memoizedState.cachePool.pool), o = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (o = r.memoizedState.cachePool.pool), o !== a && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), jc(t, t.updateQueue), Nc(t), null);
			case 4: return le(), e === null && Sd(t.stateNode.containerInfo), Nc(t), null;
			case 10: return Ui(t.type), Nc(t), null;
			case 19:
				if (R(ro), r = t.memoizedState, r === null) return Nc(t), null;
				if (a = (t.flags & 128) != 0, o = r.rendering, o === null) if (a) Mc(r, !1);
				else {
					if (Wl !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
						if (o = io(e), o !== null) {
							for (t.flags |= 128, Mc(r, !1), e = o.updateQueue, t.updateQueue = e, jc(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) oi(n, e), n = n.sibling;
							return z(ro, ro.current & 1 | 2), G && Si(t, r.treeForkCount), t.child;
						}
						e = e.sibling;
					}
					r.tail !== null && V() > eu && (t.flags |= 128, a = !0, Mc(r, !1), t.lanes = 4194304);
				}
				else {
					if (!a) if (e = io(o), e !== null) {
						if (t.flags |= 128, a = !0, e = e.updateQueue, t.updateQueue = e, jc(t, e), Mc(r, !0), r.tail === null && r.tailMode === "hidden" && !o.alternate && !G) return Nc(t), null;
					} else 2 * V() - r.renderingStartTime > eu && n !== 536870912 && (t.flags |= 128, a = !0, Mc(r, !1), t.lanes = 4194304);
					r.isBackwards ? (o.sibling = t.child, t.child = o) : (e = r.last, e === null ? t.child = o : e.sibling = o, r.last = o);
				}
				return r.tail === null ? (Nc(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = V(), e.sibling = null, n = ro.current, z(ro, a ? n & 1 | 2 : n & 1), G && Si(t, r.treeForkCount), e);
			case 22:
			case 23: return no(t), Ya(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (Nc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Nc(t), n = t.updateQueue, n !== null && jc(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && R(da), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Ui(ta), Nc(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(i(156, t.tag));
	}
	function Fc(e, t) {
		switch (Ti(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Ui(ta), le(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return de(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (no(t), t.alternate === null) throw Error(i(340));
					Ii();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (no(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(i(340));
					Ii();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return R(ro), null;
			case 4: return le(), null;
			case 10: return Ui(t.type), null;
			case 22:
			case 23: return no(t), Ya(), e !== null && R(da), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Ui(ta), null;
			case 25: return null;
			default: return null;
		}
	}
	function Ic(e, t) {
		switch (Ti(t), t.tag) {
			case 3:
				Ui(ta), le();
				break;
			case 26:
			case 27:
			case 5:
				de(t);
				break;
			case 4:
				le();
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
			case 24: Ui(ta);
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
			Id(r, e.type, n, t), r[rt] = t;
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
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Yt));
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
			Fd(t, r, n), t[nt] = e, t[rt] = n;
		} catch (t) {
			Wu(e, e.return, t);
		}
	}
	var Xc = !1, Zc = !1, Qc = !1, $c = typeof WeakSet == "function" ? WeakSet : Set, el = null;
	function tl(e, t) {
		if (e = e.containerInfo, zd = $, e = Sr(e), Cr(e)) {
			if ("selectionStart" in e) var n = {
				start: e.selectionStart,
				end: e.selectionEnd
			};
			else a: {
				n = (n = e.ownerDocument) && n.defaultView || window;
				var r = n.getSelection && n.getSelection();
				if (r && r.rangeCount !== 0) {
					n = r.anchorNode;
					var a = r.anchorOffset, o = r.focusNode;
					r = r.focusOffset;
					try {
						n.nodeType, o.nodeType;
					} catch {
						n = null;
						break a;
					}
					var s = 0, c = -1, l = -1, u = 0, d = 0, f = e, p = null;
					b: for (;;) {
						for (var m; f !== n || a !== 0 && f.nodeType !== 3 || (c = s + a), f !== o || r !== 0 && f.nodeType !== 3 || (l = s + r), f.nodeType === 3 && (s += f.nodeValue.length), (m = f.firstChild) !== null;) p = f, f = m;
						for (;;) {
							if (f === e) break b;
							if (p === n && ++u === a && (c = s), p === o && ++d === r && (l = s), (m = f.nextSibling) !== null) break;
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
		}, $ = !1, el = t; el !== null;) if (t = el, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, el = e;
		else for (; el !== null;) {
			switch (t = el, o = t.alternate, e = t.flags, t.tag) {
				case 0:
					if (e & 4 && (e = t.updateQueue, e = e === null ? null : e.events, e !== null)) for (n = 0; n < e.length; n++) a = e[n], a.ref.impl = a.nextImpl;
					break;
				case 11:
				case 15: break;
				case 1:
					if (e & 1024 && o !== null) {
						e = void 0, n = t, a = o.memoizedProps, o = o.memoizedState, r = n.stateNode;
						try {
							var h = Vs(n.type, a);
							e = r.getSnapshotBeforeUpdate(h, o), r.__reactInternalSnapshotBeforeUpdate = e;
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
				default: if (e & 1024) throw Error(i(163));
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
		t !== null && (e.alternate = null, rl(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && ut(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var il = null, al = !1;
	function ol(e, t, n) {
		for (n = n.child; n !== null;) sl(e, t, n), n = n.sibling;
	}
	function sl(e, t, n) {
		if (Me && typeof Me.onCommitFiberUnmount == "function") try {
			Me.onCommitFiberUnmount(je, n);
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
			default: throw Error(i(435, e.tag));
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
			var a = n[r], o = e, s = t, c = s;
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
			if (il === null) throw Error(i(160));
			sl(o, s, a), il = null, al = !1, o = a.alternate, o !== null && (o.return = null), a.return = null;
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
				var a = pl;
				if (fl(t, e), hl(e), r & 512 && (Zc || n === null || Hc(n, n.return)), r & 4) {
					var o = n === null ? null : n.memoizedState;
					if (r = e.memoizedState, n === null) if (r === null) if (e.stateNode === null) {
						a: {
							r = e.type, n = e.memoizedProps, a = a.ownerDocument || a;
							b: switch (r) {
								case "title":
									o = a.getElementsByTagName("title")[0], (!o || o[lt] || o[nt] || o.namespaceURI === "http://www.w3.org/2000/svg" || o.hasAttribute("itemprop")) && (o = a.createElement(r), a.head.insertBefore(o, a.querySelector("head > title"))), Fd(o, r, n), o[nt] = e, ht(o), r = o;
									break a;
								case "link":
									var s = Hf("link", "href", a).get(r + (n.href || ""));
									if (s) {
										for (var c = 0; c < s.length; c++) if (o = s[c], o.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && o.getAttribute("rel") === (n.rel == null ? null : n.rel) && o.getAttribute("title") === (n.title == null ? null : n.title) && o.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
											s.splice(c, 1);
											break b;
										}
									}
									o = a.createElement(r), Fd(o, r, n), a.head.appendChild(o);
									break;
								case "meta":
									if (s = Hf("meta", "content", a).get(r + (n.content || ""))) {
										for (c = 0; c < s.length; c++) if (o = s[c], o.getAttribute("content") === (n.content == null ? null : "" + n.content) && o.getAttribute("name") === (n.name == null ? null : n.name) && o.getAttribute("property") === (n.property == null ? null : n.property) && o.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && o.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
											s.splice(c, 1);
											break b;
										}
									}
									o = a.createElement(r), Fd(o, r, n), a.head.appendChild(o);
									break;
								default: throw Error(i(468, r));
							}
							o[nt] = e, ht(o), r = o;
						}
						e.stateNode = r;
					} else Uf(a, e.type, e.stateNode);
					else e.stateNode = Lf(a, r, e.memoizedProps);
					else o === r ? r === null && e.stateNode !== null && Wc(e, e.memoizedProps, n.memoizedProps) : (o === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : o.count--, r === null ? Uf(a, e.type, e.stateNode) : Lf(a, r, e.memoizedProps));
				}
				break;
			case 27:
				fl(t, e), hl(e), r & 512 && (Zc || n === null || Hc(n, n.return)), n !== null && r & 4 && Wc(e, e.memoizedProps, n.memoizedProps);
				break;
			case 5:
				if (fl(t, e), hl(e), r & 512 && (Zc || n === null || Hc(n, n.return)), e.flags & 32) {
					a = e.stateNode;
					try {
						Vt(a, "");
					} catch (t) {
						Wu(e, e.return, t);
					}
				}
				r & 4 && e.stateNode != null && (a = e.memoizedProps, Wc(e, a, n === null ? a : n.memoizedProps)), r & 1024 && (Qc = !0);
				break;
			case 6:
				if (fl(t, e), hl(e), r & 4) {
					if (e.stateNode === null) throw Error(i(162));
					r = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = r;
					} catch (t) {
						Wu(e, e.return, t);
					}
				}
				break;
			case 3:
				if (Vf = null, a = pl, pl = _f(t.containerInfo), fl(t, e), pl = a, hl(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
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
				fl(t, e), hl(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Ql = V()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, dl(e, r)));
				break;
			case 22:
				a = e.memoizedState !== null;
				var l = n !== null && n.memoizedState !== null, u = Xc, d = Zc;
				if (Xc = u || a, Zc = d || l, fl(t, e), Zc = d, Xc = u, hl(e), r & 8192) a: for (t = e.stateNode, t._visibility = a ? t._visibility & -2 : t._visibility | 1, a && (n === null || l || Xc || Zc || vl(e)), n = null, t = e;;) {
					if (t.tag === 5 || t.tag === 26) {
						if (n === null) {
							l = n = t;
							try {
								if (o = l.stateNode, a) s = o.style, typeof s.setProperty == "function" ? s.setProperty("display", "none", "important") : s.display = "none";
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
								l.stateNode.nodeValue = a ? "" : l.memoizedProps;
							} catch (e) {
								Wu(l, l.return, e);
							}
						}
					} else if (t.tag === 18) {
						if (n === null) {
							l = t;
							try {
								var m = l.stateNode;
								a ? ef(m, !0) : ef(l.stateNode, !1);
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
				if (n == null) throw Error(i(160));
				switch (n.tag) {
					case 27:
						var a = n.stateNode;
						Jc(e, Kc(e), a);
						break;
					case 5:
						var o = n.stateNode;
						n.flags & 32 && (Vt(o, ""), n.flags &= -33), Jc(e, Kc(e), o);
						break;
					case 3:
					case 4:
						var s = n.stateNode.containerInfo;
						qc(e, Kc(e), s);
						break;
					default: throw Error(i(161));
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
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && ra(n));
	}
	function xl(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ra(e));
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
				Sl(e, t, n, r), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ra(e)));
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
				Dl(e, t, n), e.flags & El && e.memoizedState !== null && Kf(n, pl, e.memoizedState, e.memoizedProps);
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
				case 24: ra(n.memoizedState.cache);
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
			var t = Yi(ta), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Yi(ta).controller.signal;
		}
	}, Fl = typeof WeakMap == "function" ? WeakMap : Map, Il = 0, Ll = null, Y = null, X = 0, Rl = 0, zl = null, Bl = !1, Vl = !1, Hl = !1, Ul = 0, Wl = 0, Z = 0, Gl = 0, Kl = 0, ql = 0, Jl = 0, Yl = null, Xl = null, Zl = !1, Ql = 0, $l = 0, eu = Infinity, tu = null, nu = null, ru = 0, iu = null, au = null, ou = 0, su = 0, cu = null, lu = null, uu = 0, du = null;
	function fu() {
		return Il & 2 && X !== 0 ? X & -X : P.T === null ? $e() : dd();
	}
	function pu() {
		if (ql === 0) if (!(X & 536870912) || G) {
			var e = Re;
			Re <<= 1, !(Re & 3932160) && (Re = 262144), ql = e;
		} else ql = 536870912;
		return e = Xa.current, e !== null && (e.flags |= 32), ql;
	}
	function mu(e, t, n) {
		(e === Ll && (Rl === 2 || Rl === 9) || e.cancelPendingCommit !== null) && (xu(e, 0), vu(e, X, ql, !1)), Ke(e, n), (!(Il & 2) || e !== Ll) && (e === Ll && (!(Il & 2) && (Gl |= n), Wl === 4 && vu(e, X, ql, !1)), rd(e));
	}
	function hu(e, t, n) {
		if (Il & 6) throw Error(i(327));
		var r = !n && (t & 127) == 0 && (t & e.expiredLanes) === 0 || He(e, t), a = r ? ku(e, t) : Du(e, t, !0), o = r;
		do {
			if (a === 0) {
				Vl && !r && vu(e, t, 0, !1);
				break;
			} else {
				if (n = e.current.alternate, o && !_u(n)) {
					a = Du(e, t, !1), o = !1;
					continue;
				}
				if (a === 2) {
					if (o = t, e.errorRecoveryDisabledLanes & o) var s = 0;
					else s = e.pendingLanes & -536870913, s = s === 0 ? s & 536870912 ? 536870912 : 0 : s;
					if (s !== 0) {
						t = s;
						a: {
							var c = e;
							a = Yl;
							var l = c.current.memoizedState.isDehydrated;
							if (l && (xu(c, s).flags |= 256), s = Du(c, s, !1), s !== 2) {
								if (Hl && !l) {
									c.errorRecoveryDisabledLanes |= o, Gl |= o, a = 4;
									break a;
								}
								o = Xl, Xl = a, o !== null && (Xl === null ? Xl = o : Xl.push.apply(Xl, o));
							}
							a = s;
						}
						if (o = !1, a !== 2) continue;
					}
				}
				if (a === 1) {
					xu(e, 0), vu(e, t, 0, !0);
					break;
				}
				a: {
					switch (r = e, o = a, o) {
						case 0:
						case 1: throw Error(i(345));
						case 4: if ((t & 4194048) !== t) break;
						case 6:
							vu(r, t, ql, !Bl);
							break a;
						case 2:
							Xl = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(i(329));
					}
					if ((t & 62914560) === t && (a = Ql + 300 - V(), 10 < a)) {
						if (vu(r, t, ql, !Bl), Ve(r, 0, !0) !== 0) break a;
						ou = t, r.timeoutHandle = qd(gu.bind(null, r, n, Xl, tu, Zl, t, ql, Gl, Jl, Bl, o, "Throttled", -0, 0), a);
						break a;
					}
					gu(r, n, Xl, tu, Zl, t, ql, Gl, Jl, Bl, o, null, -0, 0);
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
				unsuspend: Yt
			}, Ol(t, a, d);
			var m = (a & 62914560) === a ? Ql - V() : (a & 4194048) === a ? $l - V() : 0;
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
					if (!_r(a(), i)) return !1;
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
			var a = 31 - H(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && Je(e, n, t);
	}
	function yu() {
		return Il & 6 ? !0 : (id(0, !1), !1);
	}
	function bu() {
		if (Y !== null) {
			if (Rl === 0) var e = Y.return;
			else e = Y, Vi = Bi = null, wo(e), Ta = null, Ea = 0, e = Y;
			for (; e !== null;) Ic(e.alternate, e), e = e.return;
			Y = null;
		}
	}
	function xu(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, Jd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), ou = 0, bu(), Ll = e, Y = n = ai(e.current, null), X = t, Rl = 0, zl = null, Bl = !1, Vl = He(e, t), Hl = !1, Jl = ql = Kl = Gl = Z = Wl = 0, Xl = Yl = null, Zl = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - H(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Ul = t, Yr(), n;
	}
	function Su(e, t) {
		q = null, P.H = Ns, t === ha || t === _a ? (t = Ca(), Rl = 3) : t === ga ? (t = Ca(), Rl = 4) : Rl = t === Zs ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, zl = t, Y === null && (Wl = 1, Gs(e, pi(t, e.current)));
	}
	function Cu() {
		var e = Xa.current;
		return e === null ? !0 : (X & 4194048) === X ? Za === null : (X & 62914560) === X || X & 536870912 ? e === Za : !1;
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
		Wl = 4, Bl || (X & 4194048) !== X && Xa.current !== null || (Vl = !0), !(Z & 134217727) && !(Gl & 134217727) || Ll === null || vu(Ll, X, ql, !1);
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
							Xa.current === null && (t = !0);
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
		return t && e.shellSuspendCounter++, Vi = Bi = null, Il = r, P.H = i, P.A = a, Y === null && (Ll = null, X = 0, Yr()), o;
	}
	function Ou() {
		for (; Y !== null;) ju(Y);
	}
	function ku(e, t) {
		var n = Il;
		Il |= 2;
		var r = wu(), a = Tu();
		Ll !== e || X !== t ? (tu = null, eu = V() + 500, xu(e, t)) : Vl = He(e, t);
		a: do
			try {
				if (Rl !== 0 && Y !== null) {
					t = Y;
					var o = zl;
					b: switch (Rl) {
						case 1:
							Rl = 0, zl = null, Nu(e, t, o, 1);
							break;
						case 2:
						case 9:
							if (ya(o)) {
								Rl = 0, zl = null, Mu(t);
								break;
							}
							t = function() {
								Rl !== 2 && Rl !== 9 || Ll !== e || (Rl = 7), rd(e);
							}, o.then(t, t);
							break a;
						case 3:
							Rl = 7;
							break a;
						case 4:
							Rl = 5;
							break a;
						case 7:
							ya(o) ? (Rl = 0, zl = null, Mu(t)) : (Rl = 0, zl = null, Nu(e, t, o, 7));
							break;
						case 5:
							var s = null;
							switch (Y.tag) {
								case 26: s = Y.memoizedState;
								case 5:
								case 27:
									var c = Y;
									if (s ? Gf(s) : c.stateNode.complete) {
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
							Rl = 0, zl = null, Nu(e, t, o, 5);
							break;
						case 6:
							Rl = 0, zl = null, Nu(e, t, o, 6);
							break;
						case 8:
							bu(), Wl = 6;
							break a;
						default: throw Error(i(462));
					}
				}
				Au();
				break;
			} catch (t) {
				Su(e, t);
			}
		while (1);
		return Vi = Bi = null, P.H = r, P.A = a, Il = n, Y === null ? (Ll = null, X = 0, Yr(), Wl) : 0;
	}
	function Au() {
		for (; Y !== null && !xe();) ju(Y);
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
			case 5: wo(t);
			default: Ic(n, t), t = Y = oi(t, Ul), t = Dc(n, t, Ul);
		}
		e.memoizedProps = e.pendingProps, t === null ? Pu(e) : Y = t;
	}
	function Nu(e, t, n, r) {
		Vi = Bi = null, wo(t), Ta = null, Ea = 0;
		var i = t.return;
		try {
			if (Xs(e, i, t, n, X)) {
				Wl = 1, Gs(e, pi(n, e.current)), Y = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw Y = i, t;
			Wl = 1, Gs(e, pi(n, e.current)), Y = null;
			return;
		}
		t.flags & 32768 ? (G || r === 1 ? e = !0 : Vl || X & 536870912 ? e = !1 : (Bl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Xa.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Fu(t, e)) : Pu(t);
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
	function Iu(e, t, n, r, a, o, s, c, l) {
		e.cancelPendingCommit = null;
		do
			Vu();
		while (ru !== 0);
		if (Il & 6) throw Error(i(327));
		if (t !== null) {
			if (t === e.current) throw Error(i(177));
			if (o = t.lanes | t.childLanes, o |= Jr, qe(e, n, o, s, c, l), e === Ll && (Y = Ll = null, X = 0), au = t, iu = e, ou = n, su = o, cu = a, lu = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Xu(Ee, function() {
				return Hu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = (t.flags & 13878) != 0, t.subtreeFlags & 13878 || r) {
				r = P.T, P.T = null, a = F.p, F.p = 2, s = Il, Il |= 4;
				try {
					tl(e, t, n);
				} finally {
					Il = s, F.p = a, P.T = r;
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
				var i = Il;
				Il |= 4;
				try {
					ml(t, e);
					var a = Bd, o = Sr(e.containerInfo), s = a.focusedElem, c = a.selectionRange;
					if (o !== s && s && s.ownerDocument && xr(s.ownerDocument.documentElement, s)) {
						if (c !== null && Cr(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = br(s, h), v = br(s, g);
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
					$ = !!zd, Bd = zd = null;
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
	function zu() {
		if (ru === 4 || ru === 3) {
			ru = 0, Se();
			var e = iu, t = au, n = ou, r = lu;
			t.subtreeFlags & 10256 || t.flags & 10256 ? ru = 5 : (ru = 0, au = iu = null, Bu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (nu = null), Qe(n), t = t.stateNode, Me && typeof Me.onCommitFiberRoot == "function") try {
				Me.onCommitFiberRoot(je, t, void 0, (t.current.flags & 128) == 128);
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
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, ra(t)));
	}
	function Vu() {
		return Lu(), Ru(), zu(), Hu();
	}
	function Hu() {
		if (ru !== 5) return !1;
		var e = iu, t = su;
		su = 0;
		var n = Qe(ou), r = P.T, a = F.p;
		try {
			F.p = 32 > n ? 32 : n, P.T = null, n = cu, cu = null;
			var o = iu, s = ou;
			if (ru = 0, au = iu = null, ou = 0, Il & 6) throw Error(i(331));
			var c = Il;
			if (Il |= 4, jl(o.current), Cl(o, o.current, s, n), Il = c, id(0, !1), Me && typeof Me.onPostCommitFiberRoot == "function") try {
				Me.onPostCommitFiberRoot(je, o);
			} catch {}
			return !0;
		} finally {
			F.p = a, P.T = r, Bu(e, t);
		}
	}
	function Uu(e, t, n) {
		t = pi(n, t), t = qs(e.stateNode, t, 2), e = La(e, t, 2), e !== null && (Ke(e, 2), rd(e));
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
					e = pi(n, e), n = Js(2), r = La(t, n, 2), r !== null && (Ys(n, r, t, e), Ke(r, 2), rd(r));
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
		i.has(n) || (Hl = !0, i.add(n), e = Ku.bind(null, e, t, n), t.then(e, e));
	}
	function Ku(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Ll === e && (X & n) === n && (Wl === 4 || Wl === 3 && (X & 62914560) === X && 300 > V() - Ql ? !(Il & 2) && xu(e, 0) : Kl |= n, Jl === X && (Jl = 0)), rd(e);
	}
	function qu(e, t) {
		t === 0 && (t = We()), e = Qr(e, t), e !== null && (Ke(e, t), rd(e));
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
				var r = e.stateNode, a = e.memoizedState;
				a !== null && (n = a.retryLane);
				break;
			case 19:
				r = e.stateNode;
				break;
			case 22:
				r = e.stateNode._retryCache;
				break;
			default: throw Error(i(314));
		}
		r !== null && r.delete(t), qu(e, n);
	}
	function Xu(e, t) {
		return ye(e, t);
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
							a = (1 << 31 - H(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
						}
						a !== 0 && (n = !0, ld(r, a));
					} else a = X, a = Ve(r, r === Ll ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || He(r, a) || (n = !0, ld(r, a));
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
		for (var t = V(), n = null, r = Zu; r !== null;) {
			var i = r.next, a = sd(r, t);
			a === 0 ? (r.next = null, n === null ? Zu = i : n.next = i, i === null && (Qu = n)) : (n = r, (e !== 0 || a & 3) && (ed = !0)), r = i;
		}
		ru !== 0 && ru !== 5 || id(e, !1), nd !== 0 && (nd = 0);
	}
	function sd(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - H(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = Ue(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Ll, n = X, n = Ve(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Rl === 2 || Rl === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && be(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || He(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && be(r), Qe(n)) {
				case 2:
				case 8:
					n = Te;
					break;
				case 32:
					n = Ee;
					break;
				case 268435456:
					n = Oe;
					break;
				default: n = Ee;
			}
			return r = cd.bind(null, e), n = ye(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && be(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function cd(e, t) {
		if (ru !== 0 && ru !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Vu() && e.callbackNode !== n) return null;
		var r = X;
		return r = Ve(e, e === Ll ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (hu(e, r, t), sd(e, V()), e.callbackNode != null && e.callbackNode === n ? cd.bind(null, e) : null);
	}
	function ld(e, t) {
		if (Vu()) return null;
		hu(e, t, !0);
	}
	function ud() {
		Xd(function() {
			Il & 6 ? ye(we, ad) : od();
		});
	}
	function dd() {
		if (nd === 0) {
			var e = oa;
			e === 0 && (e = Le, Le <<= 1, !(Le & 261888) && (Le = 256)), nd = e;
		}
		return nd;
	}
	function fd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Jt("" + e);
	}
	function pd(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function md(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = fd((i[rt] || null).action), o = r.submitter;
			o && (t = (t = o[rt] || null) ? fd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new _n("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (nd !== 0) {
								var e = o ? pd(i, o) : new FormData(i);
								bs(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = o ? pd(i, o) : new FormData(i), bs(n, {
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
	for (var hd = 0; hd < Ur.length; hd++) {
		var gd = Ur[hd];
		Wr(gd.toLowerCase(), "on" + (gd[0].toUpperCase() + gd.slice(1)));
	}
	Wr(Fr, "onAnimationEnd"), Wr(Ir, "onAnimationIteration"), Wr(Lr, "onAnimationStart"), Wr("dblclick", "onDoubleClick"), Wr("focusin", "onFocus"), Wr("focusout", "onBlur"), Wr(Rr, "onTransitionRun"), Wr(zr, "onTransitionStart"), Wr(Br, "onTransitionCancel"), Wr(Vr, "onTransitionEnd"), yt("onMouseEnter", ["mouseout", "mouseover"]), yt("onMouseLeave", ["mouseout", "mouseover"]), yt("onPointerEnter", ["pointerout", "pointerover"]), yt("onPointerLeave", ["pointerout", "pointerover"]), vt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), vt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), vt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), vt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), vt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), vt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
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
						Gr(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Gr(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Q(e, t) {
		var n = t[at];
		n === void 0 && (n = t[at] = /* @__PURE__ */ new Set());
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
			e[xd] = !0, gt.forEach(function(t) {
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
		n = i.bind(null, t, n, e), i = void 0, !on || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
			capture: !0,
			passive: i
		}) : i === void 0 ? e.addEventListener(t, n, !1) : e.addEventListener(t, n, { passive: i });
	}
	function wd(e, t, n, r, i) {
		var a = r;
		if (!(t & 1) && !(t & 2) && r !== null) a: for (;;) {
			if (r === null) return;
			var s = r.tag;
			if (s === 3 || s === 4) {
				var c = r.stateNode.containerInfo;
				if (c === i) break;
				if (s === 4) for (s = r.return; s !== null;) {
					var l = s.tag;
					if ((l === 3 || l === 4) && s.stateNode.containerInfo === i) return;
					s = s.return;
				}
				for (; c !== null;) {
					if (s = dt(c), s === null) return;
					if (l = s.tag, l === 5 || l === 6 || l === 26 || l === 27) {
						r = a = s;
						continue a;
					}
					c = c.parentNode;
				}
			}
			r = r.return;
		}
		nn(function() {
			var r = a, i = Zt(n), s = [];
			a: {
				var c = Hr.get(e);
				if (c !== void 0) {
					var l = _n, u = e;
					switch (e) {
						case "keypress": if (fn(n) === 0) break a;
						case "keydown":
						case "keyup":
							l = Fn;
							break;
						case "focusin":
							u = "focus", l = En;
							break;
						case "focusout":
							u = "blur", l = En;
							break;
						case "beforeblur":
						case "afterblur":
							l = En;
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
							l = wn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							l = Tn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							l = Ln;
							break;
						case Fr:
						case Ir:
						case Lr:
							l = Dn;
							break;
						case Vr:
							l = Rn;
							break;
						case "scroll":
						case "scrollend":
							l = yn;
							break;
						case "wheel":
							l = zn;
							break;
						case "copy":
						case "cut":
						case "paste":
							l = On;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							l = In;
							break;
						case "toggle":
						case "beforetoggle": l = U;
					}
					var d = (t & 4) != 0, f = !d && (e === "scroll" || e === "scrollend"), p = d ? c === null ? null : c + "Capture" : c;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = rn(m, p), g != null && d.push(Td(m, g, h))), f) break;
						m = m.return;
					}
					0 < d.length && (c = new l(c, u, null, n, i), s.push({
						event: c,
						listeners: d
					}));
				}
			}
			if (!(t & 7)) {
				a: {
					if (c = e === "mouseover" || e === "pointerover", l = e === "mouseout" || e === "pointerout", c && n !== Xt && (u = n.relatedTarget || n.fromElement) && (dt(u) || u[it])) break a;
					if ((l || c) && (c = i.window === i ? i : (c = i.ownerDocument) ? c.defaultView || c.parentWindow : window, l ? (u = n.relatedTarget || n.toElement, l = r, u = u ? dt(u) : null, u !== null && (f = o(u), d = u.tag, u !== f || d !== 5 && d !== 27 && d !== 6) && (u = null)) : (l = null, u = r), l !== u)) {
						if (d = wn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = In, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = l == null ? c : pt(l), h = u == null ? c : pt(u), c = new d(g, m + "leave", l, n, i), c.target = f, c.relatedTarget = h, g = null, dt(i) === r && (d = new d(p, m + "enter", u, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, l && u) b: {
							for (d = Dd, p = l, m = u, h = 0, g = p; g; g = d(g)) h++;
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
						l !== null && Od(s, c, l, d, !1), u !== null && f !== null && Od(s, f, u, d, !0);
					}
				}
				a: {
					if (c = r ? pt(r) : window, l = c.nodeName && c.nodeName.toLowerCase(), l === "select" || l === "input" && c.type === "file") var v = ar;
					else if ($n(c)) if (or) v = hr;
					else {
						v = pr;
						var y = fr;
					}
					else l = c.nodeName, !l || l.toLowerCase() !== "input" || c.type !== "checkbox" && c.type !== "radio" ? r && Gt(r.elementType) && (v = ar) : v = mr;
					if (v &&= v(e, r)) {
						er(s, v, n, i);
						break a;
					}
					y && y(e, c, r), e === "focusout" && r && c.type === "number" && r.memoizedProps.value != null && Lt(c, "number", c.value);
				}
				switch (y = r ? pt(r) : window, e) {
					case "focusin":
						($n(y) || y.contentEditable === "true") && (Tr = y, Er = r, Dr = null);
						break;
					case "focusout":
						Dr = Er = Tr = null;
						break;
					case "mousedown":
						Or = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						Or = !1, kr(s, n, i);
						break;
					case "selectionchange": if (wr) break;
					case "keydown":
					case "keyup": kr(s, n, i);
				}
				var b;
				if (Vn) b: {
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
				else Yn ? qn(e, n) && (x = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (x = "onCompositionStart");
				x && (Wn && n.locale !== "ko" && (Yn || x !== "onCompositionStart" ? x === "onCompositionEnd" && Yn && (b = dn()) : (cn = i, ln = "value" in cn ? cn.value : cn.textContent, Yn = !0)), y = Ed(r, x), 0 < y.length && (x = new kn(x, e, null, n, i), s.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = Jn(n), b !== null && (x.data = b)))), (b = Un ? Xn(e, n) : Zn(e, n)) && (x = Ed(r, "onBeforeInput"), 0 < x.length && (y = new kn("onBeforeInput", "beforeinput", null, n, i), s.push({
					event: y,
					listeners: x
				}), y.data = b)), md(s, e, r, n, i);
			}
			yd(s, t);
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
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = rn(e, n), i != null && r.unshift(Td(e, i, a)), i = rn(e, t), i != null && r.push(Td(e, i, a))), e.tag === 3) return r;
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
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = rn(n, a), l != null && o.unshift(Td(n, l, c))) : i || (l = rn(n, a), l != null && o.push(Td(n, l, c)))), n = n.return;
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
	function Nd(e, t, n, r, a, o) {
		switch (n) {
			case "children":
				typeof r == "string" ? t === "body" || t === "textarea" && r === "" || Vt(e, r) : (typeof r == "number" || typeof r == "bigint") && t !== "body" && Vt(e, "" + r);
				break;
			case "className":
				Tt(e, "class", r);
				break;
			case "tabIndex":
				Tt(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				Tt(e, n, r);
				break;
			case "style":
				Wt(e, r, o);
				break;
			case "data": if (t !== "object") {
				Tt(e, "data", r);
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
				r = Jt("" + r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				} else typeof o == "function" && (n === "formAction" ? (t !== "input" && Nd(e, t, "name", a.name, a, null), Nd(e, t, "formEncType", a.formEncType, a, null), Nd(e, t, "formMethod", a.formMethod, a, null), Nd(e, t, "formTarget", a.formTarget, a, null)) : (Nd(e, t, "encType", a.encType, a, null), Nd(e, t, "method", a.method, a, null), Nd(e, t, "target", a.target, a, null)));
				if (r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Jt("" + r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = Yt);
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				break;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
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
				n = Jt("" + r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
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
				Q("beforetoggle", e), Q("toggle", e), wt(e, "popover", r);
				break;
			case "xlinkActuate":
				Et(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				Et(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				Et(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				Et(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				Et(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				Et(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				Et(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				Et(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				Et(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				wt(e, "is", r);
				break;
			case "innerText":
			case "textContent": break;
			default: (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = Kt.get(n) || n, wt(e, n, r));
		}
	}
	function Pd(e, t, n, r, a, o) {
		switch (n) {
			case "style":
				Wt(e, r, o);
				break;
			case "dangerouslySetInnerHTML":
				if (r != null) {
					if (typeof r != "object" || !("__html" in r)) throw Error(i(61));
					if (n = r.__html, n != null) {
						if (a.children != null) throw Error(i(60));
						e.innerHTML = n;
					}
				}
				break;
			case "children":
				typeof r == "string" ? Vt(e, r) : (typeof r == "number" || typeof r == "bigint") && Vt(e, "" + r);
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				break;
			case "onClick":
				r != null && (e.onclick = Yt);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": break;
			case "innerText":
			case "textContent": break;
			default: if (!_t.hasOwnProperty(n)) a: {
				if (n[0] === "o" && n[1] === "n" && (a = n.endsWith("Capture"), t = n.slice(2, a ? n.length - 7 : void 0), o = e[rt] || null, o = o == null ? null : o[n], typeof o == "function" && e.removeEventListener(t, o, a), typeof r == "function")) {
					typeof o != "function" && o !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, a);
					break a;
				}
				n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : wt(e, n, r);
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
				var r = !1, a = !1, o;
				for (o in n) if (n.hasOwnProperty(o)) {
					var s = n[o];
					if (s != null) switch (o) {
						case "src":
							r = !0;
							break;
						case "srcSet":
							a = !0;
							break;
						case "children":
						case "dangerouslySetInnerHTML": throw Error(i(137, t));
						default: Nd(e, t, o, s, n, null);
					}
				}
				a && Nd(e, t, "srcSet", n.srcSet, n, null), r && Nd(e, t, "src", n.src, n, null);
				return;
			case "input":
				Q("invalid", e);
				var c = o = s = a = null, l = null, u = null;
				for (r in n) if (n.hasOwnProperty(r)) {
					var d = n[r];
					if (d != null) switch (r) {
						case "name":
							a = d;
							break;
						case "type":
							s = d;
							break;
						case "checked":
							l = d;
							break;
						case "defaultChecked":
							u = d;
							break;
						case "value":
							o = d;
							break;
						case "defaultValue":
							c = d;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (d != null) throw Error(i(137, t));
							break;
						default: Nd(e, t, r, d, n, null);
					}
				}
				It(e, o, c, l, u, s, a, !1);
				return;
			case "select":
				for (a in Q("invalid", e), r = s = o = null, n) if (n.hasOwnProperty(a) && (c = n[a], c != null)) switch (a) {
					case "value":
						o = c;
						break;
					case "defaultValue":
						s = c;
						break;
					case "multiple": r = c;
					default: Nd(e, t, a, c, n, null);
				}
				t = o, n = s, e.multiple = !!r, t == null ? n != null && Rt(e, !!r, n, !0) : Rt(e, !!r, t, !1);
				return;
			case "textarea":
				for (s in Q("invalid", e), o = a = r = null, n) if (n.hasOwnProperty(s) && (c = n[s], c != null)) switch (s) {
					case "value":
						r = c;
						break;
					case "defaultValue":
						a = c;
						break;
					case "children":
						o = c;
						break;
					case "dangerouslySetInnerHTML":
						if (c != null) throw Error(i(91));
						break;
					default: Nd(e, t, s, c, n, null);
				}
				Bt(e, r, a, o);
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
					case "dangerouslySetInnerHTML": throw Error(i(137, t));
					default: Nd(e, t, u, r, n, null);
				}
				return;
			default: if (Gt(t)) {
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
				var a = null, o = null, s = null, c = null, l = null, u = null, d = null;
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
							o = m;
							break;
						case "name":
							a = m;
							break;
						case "checked":
							u = m;
							break;
						case "defaultChecked":
							d = m;
							break;
						case "value":
							s = m;
							break;
						case "defaultValue":
							c = m;
							break;
						case "children":
						case "dangerouslySetInnerHTML":
							if (m != null) throw Error(i(137, t));
							break;
						default: m !== f && Nd(e, t, p, m, r, f);
					}
				}
				Ft(e, s, c, l, u, d, o, a);
				return;
			case "select":
				for (o in m = s = c = p = null, n) if (l = n[o], n.hasOwnProperty(o) && l != null) switch (o) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(o) || Nd(e, t, o, null, r, l);
				}
				for (a in r) if (o = r[a], l = n[a], r.hasOwnProperty(a) && (o != null || l != null)) switch (a) {
					case "value":
						p = o;
						break;
					case "defaultValue":
						c = o;
						break;
					case "multiple": s = o;
					default: o !== l && Nd(e, t, a, o, r, l);
				}
				t = c, n = s, r = m, p == null ? !!r != !!n && (t == null ? Rt(e, !!n, n ? [] : "", !1) : Rt(e, !!n, t, !0)) : Rt(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (a = n[c], n.hasOwnProperty(c) && a != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: Nd(e, t, c, null, r, a);
				}
				for (s in r) if (a = r[s], o = n[s], r.hasOwnProperty(s) && (a != null || o != null)) switch (s) {
					case "value":
						p = a;
						break;
					case "defaultValue":
						m = a;
						break;
					case "children": break;
					case "dangerouslySetInnerHTML":
						if (a != null) throw Error(i(91));
						break;
					default: a !== o && Nd(e, t, s, a, r, o);
				}
				zt(e, p, m);
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
						if (p != null) throw Error(i(137, t));
						break;
					default: Nd(e, t, u, p, r, m);
				}
				return;
			default: if (Gt(t)) {
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
					a[lt] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
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
					tf(n), ut(n);
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
			else if (!e[lt]) switch (t) {
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
				if (e = t.documentElement, !e) throw Error(i(452));
				return e;
			case "head":
				if (e = t.head, !e) throw Error(i(453));
				return e;
			case "body":
				if (e = t.body, !e) throw Error(i(454));
				return e;
			default: throw Error(i(451));
		}
	}
	function mf(e) {
		for (var t = e.attributes; t.length;) e.removeAttributeNode(t[0]);
		ut(e);
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
		var t = ft(e);
		t !== null && t.tag === 5 && t.type === "form" ? xs(t) : vf.r(e);
	}
	var xf = typeof document > "u" ? null : document;
	function Sf(e, t, n) {
		var r = xf;
		if (r && typeof t == "string" && t) {
			var i = Pt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), gf.has(i) || (gf.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), Fd(t, "link", e), ht(t), r.head.appendChild(t)));
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
			var i = "link[rel=\"preload\"][as=\"" + Pt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + Pt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + Pt(n.imageSizes) + "\"]")) : i += "[href=\"" + Pt(e) + "\"]";
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
			}, n), hf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(Mf(a)) || t === "script" && r.querySelector(If(a)) || (t = r.createElement("link"), Fd(t, "link", e), ht(t), r.head.appendChild(t)));
		}
	}
	function Ef(e, t) {
		vf.m(e, t);
		var n = xf;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + Pt(r) + "\"][href=\"" + Pt(e) + "\"]", a = i;
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
				r = n.createElement("link"), Fd(r, "link", e), ht(r), n.head.appendChild(r);
			}
		}
	}
	function Df(e, t, n) {
		vf.S(e, t, n);
		var r = xf;
		if (r && e) {
			var i = mt(r).hoistableStyles, a = jf(e);
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
					ht(c), Fd(c, "link", e), c._p = new Promise(function(e, t) {
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
			var r = mt(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = h({
				src: e,
				async: !0
			}, t), (t = hf.get(i)) && Bf(e, t), a = n.createElement("script"), ht(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
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
			var r = mt(n).hoistableScripts, i = Ff(e), a = r.get(i);
			a || (a = n.querySelector(If(i)), a || (e = h({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = hf.get(i)) && Bf(e, t), a = n.createElement("script"), ht(a), Fd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function Af(e, t, n, r) {
		var a = (a = oe.current) ? _f(a) : null;
		if (!a) throw Error(i(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = jf(n.href), n = mt(a).hoistableStyles, r = n.get(t), r || (r = {
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
					var o = mt(a).hoistableStyles, s = o.get(e);
					if (s || (a = a.ownerDocument || a, s = {
						type: "stylesheet",
						instance: null,
						count: 0,
						state: {
							loading: 0,
							preload: null
						}
					}, o.set(e, s), (o = a.querySelector(Mf(e))) && !o._p && (s.instance = o, s.state.loading = 5), hf.has(e) || (n = {
						rel: "preload",
						as: "style",
						href: n.href,
						crossOrigin: n.crossOrigin,
						integrity: n.integrity,
						media: n.media,
						hrefLang: n.hrefLang,
						referrerPolicy: n.referrerPolicy
					}, hf.set(e, n), o || Pf(a, e, n, s.state))), t && r === null) throw Error(i(528, ""));
					return s;
				}
				if (t && r !== null) throw Error(i(529, ""));
				return null;
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Ff(n), n = mt(a).hoistableScripts, r = n.get(t), r || (r = {
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
			default: throw Error(i(444, e));
		}
	}
	function jf(e) {
		return "href=\"" + Pt(e) + "\"";
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
		}), Fd(t, "link", n), ht(t), e.head.appendChild(t));
	}
	function Ff(e) {
		return "[src=\"" + Pt(e) + "\"]";
	}
	function If(e) {
		return "script[async]" + e;
	}
	function Lf(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + Pt(n.href) + "\"]");
				if (r) return t.instance = r, ht(r), r;
				var a = h({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), ht(r), Fd(r, "style", a), Rf(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				a = jf(n.href);
				var o = e.querySelector(Mf(a));
				if (o) return t.state.loading |= 4, t.instance = o, ht(o), o;
				r = Nf(n), (a = hf.get(a)) && zf(r, a), o = (e.ownerDocument || e).createElement("link"), ht(o);
				var s = o;
				return s._p = new Promise(function(e, t) {
					s.onload = e, s.onerror = t;
				}), Fd(o, "link", r), t.state.loading |= 4, Rf(o, n.precedence, e), t.instance = o;
			case "script": return o = Ff(n.src), (a = e.querySelector(If(o))) ? (t.instance = a, ht(a), a) : (r = n, (a = hf.get(o)) && (r = h({}, n), Bf(r, a)), e = e.ownerDocument || e, a = e.createElement("script"), ht(a), Fd(a, "link", r), e.head.appendChild(a), t.instance = a);
			case "void": return null;
			default: throw Error(i(443, t.type));
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
			if (!(a[lt] || a[nt] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
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
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Yf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, ht(a);
					return;
				}
				a = t.ownerDocument || t, r = Nf(r), (i = hf.get(i)) && zf(r, i), a = a.createElement("link"), ht(a);
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
		_currentValue: ne,
		_currentValue2: ne,
		_threadCount: 0
	};
	function ep(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Ge(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ge(0), this.hiddenUpdates = Ge(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function tp(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new ep(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = ri(3, null, null, t), e.current = a, a.stateNode = e, t = na(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, Pa(a), e;
	}
	function np(e) {
		return e ? (e = ti, e) : ti;
	}
	function rp(e, t, n, r, i, a) {
		i = np(i), r.context === null ? r.context = i : r.pendingContext = i, r = Ia(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = La(e, r, t), n !== null && (mu(n, e, t), Ra(n, e, t));
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
			var t = Qr(e, 67108864);
			t !== null && mu(t, e, 67108864), ap(e, 67108864);
		}
	}
	function sp(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = fu();
			t = Ze(t);
			var n = Qr(e, t);
			n !== null && mu(n, e, t), ap(e, t);
		}
	}
	var $ = !0;
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
		if ($) {
			var i = dp(r);
			if (i === null) wd(e, t, r, fp, n), Cp(e, r);
			else if (Tp(i, e, t, n, r)) r.stopPropagation();
			else if (Cp(e, r), t & 4 && -1 < Sp.indexOf(e)) {
				for (; i !== null;) {
					var a = ft(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = Be(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - H(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									rd(a), !(Il & 6) && (eu = V() + 500, id(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Qr(a, 2), s !== null && mu(s, a, 2), yu(), ap(a, 2);
					}
					if (a = dp(r), a === null && wd(e, t, r, fp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else wd(e, t, r, null, n);
		}
	}
	function dp(e) {
		return e = Zt(e), pp(e);
	}
	var fp = null;
	function pp(e) {
		if (fp = null, e = dt(e), e !== null) {
			var t = o(e);
			if (t === null) e = null;
			else {
				var n = t.tag;
				if (n === 13) {
					if (e = s(t), e !== null) return e;
					e = null;
				} else if (n === 31) {
					if (e = c(t), e !== null) return e;
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
			case "message": switch (Ce()) {
				case we: return 2;
				case Te: return 8;
				case Ee:
				case De: return 32;
				case Oe: return 268435456;
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
		}, t !== null && (t = ft(t), t !== null && op(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
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
		var t = dt(e.target);
		if (t !== null) {
			var n = o(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = s(n), t !== null) {
						e.blockedOn = t, et(e.priority, function() {
							sp(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = c(n), t !== null) {
						e.blockedOn = t, et(e.priority, function() {
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
	function Dp(e) {
		if (e.blockedOn !== null) return !1;
		for (var t = e.targetContainers; 0 < t.length;) {
			var n = dp(e.nativeEvent);
			if (n === null) {
				n = e.nativeEvent;
				var r = new n.constructor(n.type, n);
				Xt = r, n.target.dispatchEvent(r), Xt = null;
			} else return t = ft(n), t !== null && op(t), e.blockedOn = n, !1;
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
				var a = ft(n);
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
			var i = n[r], a = n[r + 1], o = i[rt] || null;
			if (typeof a == "function") o || Mp(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[rt] || null) s = o.formAction;
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
		if (t === null) throw Error(i(409));
		var n = t.current;
		rp(n, fu(), e, t, null, null);
	}, Ip.prototype.unmount = Fp.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			rp(e.current, 2, null, e, null, null), yu(), t[it] = null;
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
	var Lp = n.version;
	if (Lp !== "19.2.7") throw Error(i(527, Lp, "19.2.7"));
	F.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(i(188)) : (e = Object.keys(e).join(","), Error(i(268, e)));
		return e = d(t), e = e === null ? null : p(e), e = e === null ? null : e.stateNode, e;
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
			je = zp.inject(Rp), Me = zp;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!a(e)) throw Error(i(299));
		var n = !1, r = "", o = Hs, s = Us, c = Ws;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (o = t.onUncaughtError), t.onCaughtError !== void 0 && (s = t.onCaughtError), t.onRecoverableError !== void 0 && (c = t.onRecoverableError)), t = tp(e, 1, !1, null, null, n, r, null, o, s, c, Pp), e[it] = t.current, Sd(e), new Fp(t);
	};
})), g = /* @__PURE__ */ o(((e, t) => {
	function n() {
		if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) try {
			__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
		} catch (e) {
			console.error(e);
		}
	}
	n(), t.exports = h();
})), _ = /* @__PURE__ */ c(f(), 1), v = g(), y = {
	spades: "♠",
	hearts: "♥",
	diamonds: "♦",
	clubs: "♣"
}, b = {
	spades: "Spades",
	hearts: "Hearts",
	diamonds: "Diamonds",
	clubs: "Clubs"
}, x = {
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
}, S = (e) => e === "hearts" || e === "diamonds", C = /* @__PURE__ */ o(((e) => {
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
})), w = (/* @__PURE__ */ o(((e, t) => {
	t.exports = C();
})))();
function T({ card: e, faceDown: t = !1, size: n = "md", state: r = "default", badge: i, onClick: a, onPlayClick: o, pointerHandlers: s, pressed: c = !1, playing: l = !1, playable: u = !1, showPlayableHint: d = !0, illegalShake: f = !1, illegalFlash: p = !1, disabled: m = !1, ariaLabel: h, "data-testid": g, "data-card-index": _, "data-playable": v }) {
	let x = !!s, C = (x || typeof a == "function") && !m, T = [
		"pcard",
		`pcard--${n}`,
		`pcard--${r}`,
		C ? "pcard--interactive" : "",
		u && d ? "pcard--playable" : "",
		c ? "pcard--pressed" : "",
		l ? "pcard--playing" : "",
		f ? "pcard--illegal-shake" : "",
		p ? "pcard--illegal-flash" : "",
		m ? "pcard--disabled" : ""
	].filter(Boolean).join(" ");
	if (t || !e) return /* @__PURE__ */ (0, w.jsx)("div", {
		className: `${T} pcard--back`,
		"aria-label": "Face-down card",
		role: "img",
		children: /* @__PURE__ */ (0, w.jsxs)("span", {
			className: "pcard__surface pcard__surface--back",
			"aria-hidden": "true",
			children: [/* @__PURE__ */ (0, w.jsx)("span", { className: "pcard__back-pattern" }), /* @__PURE__ */ (0, w.jsx)("span", {
				className: "pcard__back-emblem",
				"aria-hidden": "true"
			})]
		})
	});
	let E = S(e.suit), D = y[e.suit], O = h ?? `${e.rank} of ${b[e.suit]}`, k = `pcard--suit-${e.suit}`, ee = /* @__PURE__ */ (0, w.jsxs)("span", {
		className: "pcard__surface",
		"aria-hidden": "true",
		children: [
			i && /* @__PURE__ */ (0, w.jsx)("span", {
				className: "pcard__badge",
				children: i
			}),
			/* @__PURE__ */ (0, w.jsxs)("span", {
				className: "pcard__corner pcard__corner--tl",
				children: [/* @__PURE__ */ (0, w.jsx)("span", {
					className: "pcard__rank",
					children: e.rank
				}), /* @__PURE__ */ (0, w.jsx)("span", {
					className: "pcard__suit",
					children: D
				})]
			}),
			/* @__PURE__ */ (0, w.jsx)("span", {
				className: "pcard__center",
				children: D
			}),
			/* @__PURE__ */ (0, w.jsxs)("span", {
				className: "pcard__corner pcard__corner--br",
				children: [/* @__PURE__ */ (0, w.jsx)("span", {
					className: "pcard__rank",
					children: e.rank
				}), /* @__PURE__ */ (0, w.jsx)("span", {
					className: "pcard__suit",
					children: D
				})]
			})
		]
	});
	return C ? /* @__PURE__ */ (0, w.jsx)("button", {
		type: "button",
		className: `${T} ${E ? "pcard--red" : "pcard--black"} ${k}`,
		onClick: x && u && o ? (e) => {
			e.preventDefault(), o();
		} : x ? void 0 : a,
		disabled: m,
		"aria-disabled": m || void 0,
		"aria-busy": l || void 0,
		"aria-label": O,
		"data-testid": g,
		"data-card-index": _,
		"data-playable": v,
		...s,
		children: ee
	}) : /* @__PURE__ */ (0, w.jsx)("div", {
		className: `${T} ${E ? "pcard--red" : "pcard--black"} ${k}`,
		role: "img",
		"aria-label": O,
		"aria-disabled": m || void 0,
		"data-testid": g,
		"data-card-index": _,
		"data-playable": v,
		children: ee
	});
}
//#endregion
//#region src/components/cardGesture.ts
var E = {
	HOLD_MS: 220,
	TAP_MOVE_PX: 12,
	SWIPE_UP_PX: 28,
	SWIPE_FLICK_PX: 36,
	SCROLL_CANCEL_PX: 48
};
function D(e, t) {
	return Math.hypot(e, t) <= E.TAP_MOVE_PX;
}
function O(e, t) {
	let n = Math.abs(e), r = Math.abs(t);
	return t <= -E.SWIPE_UP_PX && r > n;
}
function k(e, t) {
	let n = Math.abs(e), r = Math.abs(t);
	return t > 0 && r > E.SCROLL_CANCEL_PX && r > n;
}
function ee(e, t) {
	return k(e, t) ? !1 : O(e, t) ? !0 : Math.hypot(e, t) >= E.SWIPE_FLICK_PX;
}
function A(e, t, n) {
	return {
		pointerId: e,
		startX: t,
		startY: n,
		fired: !1
	};
}
//#endregion
//#region src/components/useCardGestureHandlers.ts
function te({ disabled: e = !1, mode: t, onPlay: n, onSelect: r, onPeekStart: i, onPeekEnd: a, onPressChange: o }) {
	let s = (0, _.useRef)({
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
	let c = (0, _.useRef)(null), l = (0, _.useRef)(null), u = (0, _.useRef)(!1), d = () => {
		l.current != null && (window.clearTimeout(l.current), l.current = null);
	}, f = () => {
		u.current && (u.current = !1, s.current.onPeekEnd?.());
	}, p = (e) => {
		let t = c.current;
		!t || t.fired || (t.fired = !0, d(), f(), s.current.onPlay?.());
	}, m = () => {
		let e = c.current;
		!e || e.fired || (e.fired = !0, d(), f(), s.current.onSelect?.());
	};
	return (0, _.useMemo)(() => {
		let e = (e, t) => {
			if (e instanceof HTMLElement && e.hasPointerCapture(t)) try {
				e.releasePointerCapture(t);
			} catch {}
		}, t = (t) => {
			d();
			let n = c.current;
			n && e(t, n.pointerId), c.current = null, s.current.onPressChange?.(!1), f();
		};
		return {
			onPointerDown(e) {
				let t = s.current;
				if (!(t.disabled || t.mode === "none" || e.button !== 0)) {
					if (d(), c.current = A(e.pointerId, e.clientX, e.clientY), u.current = !1, t.onPressChange?.(!0), e.currentTarget.setPointerCapture(e.pointerId), e.preventDefault(), t.mode === "peek") {
						u.current = !0, t.onPeekStart?.();
						return;
					}
					t.mode === "play" && (l.current = window.setTimeout(() => {
						l.current = null, p("hold");
					}, E.HOLD_MS));
				}
			},
			onPointerMove(e) {
				let t = c.current, n = s.current;
				if (!t || t.pointerId !== e.pointerId || n.disabled) return;
				let r = e.clientX - t.startX, i = e.clientY - t.startY;
				if (n.mode === "play" && !t.fired) {
					if (k(r, i)) {
						d(), f();
						return;
					}
					ee(r, i) && p("swipe-flick");
				}
			},
			onPointerUp(t) {
				let n = c.current, r = s.current;
				if (!n || n.pointerId !== t.pointerId) return;
				let i = t.clientX - n.startX, a = t.clientY - n.startY;
				d(), n.fired || (r.mode === "play" && D(i, a) ? p("tap") : r.mode === "draw-select" && D(i, a) && m()), e(t.currentTarget, t.pointerId), c.current = null, r.onPressChange?.(!1), f();
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
function j(e) {
	return `${e.rank}:${e.suit}`;
}
function M(e) {
	return x[e.rank];
}
function N(e, t) {
	return e.suit === t;
}
function P(e, t) {
	return e.filter((e) => e.suit === t);
}
//#endregion
//#region src/components/handLayout.ts
function F(e, t, n, r) {
	let i = r?.minVisiblePx ?? 30, a = r?.maxGapPx ?? 6, o = Math.max(0, t), s = Math.max(0, e), c = Math.max(1, n);
	if (o <= 1 || s <= 0) return 0;
	let l = Math.max(8, c - i), u = c + a, d = (s - c) / (o - 1);
	return Math.round(Math.min(u, Math.max(l, d)) - c);
}
function ne(e) {
	return e === "lg" ? 96 : e === "md" ? 72 : 52;
}
//#endregion
//#region src/components/Hand.tsx
var I = (e) => j(e);
function L({ card: e, index: t, size: n, state: r, badge: i, cardTestId: a, cardInteraction: o, onCardClick: s, onCardPeek: c, peekActive: l, slotClassFor: u, dealSeatPlayerId: d, style: f }) {
	let [p, m] = (0, _.useState)(!1), h = o, g = h?.mode === "play", v = h?.mode === "draw-select", y = h?.mode === "peek", b = h?.isMyTurn === !0, x = !h?.legalPlayIndices || h.legalPlayIndices.includes(t), S = g && b && x && !h?.busy, C = g && !b && !!h?.allowPlayPreselect && x && !h?.busy, E = h?.playingIndex === t, D = g && b && !x && !h?.busy && !E, O = v && r === "draw-selected", k = v && r === "draw-recommended", ee = r === "play-recommended", A = !!h?.busy || E || g && !b && !C || v && !b, j = A || g && !x && !C || v && !b, M = te({
		disabled: A || !S && !C && !v && !y && !D,
		mode: D ? "draw-select" : h?.mode ?? "none",
		onPlay: S || C ? () => h?.onPlayCard?.(t) : void 0,
		onSelect: v && b ? () => h?.onSelectCard?.(t) : D ? () => h?.onIllegalPlay?.(t) : void 0,
		onPeekStart: y ? () => c?.(t) : void 0,
		onPeekEnd: y ? () => c?.(null) : void 0,
		onPressChange: m
	}), N = !!h && (h?.mode !== "none" || D), P = g && b ? S ? a : "play-button-disabled" : a;
	return /* @__PURE__ */ (0, w.jsx)("div", {
		className: [
			"hand__slot",
			l ? "hand__slot--peek" : "",
			O ? "hand__slot--draw-selected" : "",
			k ? "hand__slot--draw-recommended" : "",
			ee ? "hand__slot--play-recommended" : "",
			u?.(e, t) ?? ""
		].filter(Boolean).join(" "),
		style: f,
		"aria-selected": O || k ? !0 : void 0,
		"data-draw-hint": k ? "suggested" : O ? "selected" : void 0,
		"data-trick-play-origin-active": h?.playingIndex === t && h.trickPlayOriginPlayerId ? h.trickPlayOriginPlayerId : void 0,
		"data-deal-seat": d ?? void 0,
		"data-deal-round": d == null ? void 0 : t,
		children: /* @__PURE__ */ (0, w.jsx)(T, {
			card: e,
			size: n,
			state: j && g && !D ? "disabled" : r,
			badge: i,
			onClick: !N && s ? () => s(e, t) : void 0,
			onPlayClick: N && S ? () => h?.onPlayCard?.(t) : void 0,
			pointerHandlers: N ? M : void 0,
			pressed: p,
			playing: E,
			playable: S,
			illegalShake: h?.illegalShakeIndex === t,
			illegalFlash: h?.illegalFlashIndex === t,
			showPlayableHint: h?.showPlayableHint !== !1,
			disabled: A && (g || v) && !D,
			"data-testid": P,
			"data-card-index": t,
			"data-playable": g ? S ? "true" : "false" : void 0
		})
	});
}
function re({ cards: e, size: t = "md", stateFor: n, badgeFor: r, onCardClick: i, onCardPeek: a, peekIndex: o = null, fan: s = !1, cardTestId: c, cardInteraction: l, slotClassFor: u, dealSeatPlayerId: d = null }) {
	let f = (0, _.useRef)(null);
	return (0, _.useLayoutEffect)(() => {
		if (!s || typeof window > "u") return;
		let n = f.current;
		if (!n) return;
		let r = ne(t), i = () => {
			let t = F(n.clientWidth, e.length, r);
			n.style.setProperty("--hand-fan-overlap", `${t}px`), n.style.setProperty("--hand-card-w", `${r}px`);
		}, a = new ResizeObserver(i);
		return a.observe(n), i(), () => a.disconnect();
	}, [
		s,
		e.length,
		t
	]), /* @__PURE__ */ (0, w.jsx)("div", {
		ref: f,
		className: `hand ${s ? "hand--fan" : ""} ${l ? "hand--pointer" : ""}`,
		style: s ? { "--hand-count": e.length } : void 0,
		children: /* @__PURE__ */ (0, w.jsx)("div", {
			className: "hand__fan-stage",
			children: e.map((e, f) => /* @__PURE__ */ (0, w.jsx)(L, {
				card: e,
				index: f,
				style: s ? { "--card-i": f } : void 0,
				size: t,
				state: n?.(e, f) ?? "default",
				badge: r?.(e, f),
				fan: s,
				cardTestId: c,
				cardInteraction: l,
				onCardClick: i,
				onCardPeek: a,
				peekActive: o === f,
				slotClassFor: u,
				dealSeatPlayerId: d
			}, I(e)))
		})
	});
}
//#endregion
//#region src/table/animations/motionTokens.ts
var R = "power3.out", z = "power2.inOut", ie = "back.out(1.35)", ae = {
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
function oe(e = ce()) {
	return e ? .35 : 1;
}
function se(e, t = ce()) {
	return Math.max(.12, e * oe(t));
}
function ce() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region node_modules/gsap/gsap-core.js
function le(e) {
	if (e === void 0) throw ReferenceError("this hasn't been initialised - super() hasn't been called");
	return e;
}
function ue(e, t) {
	e.prototype = Object.create(t.prototype), e.prototype.constructor = e, e.__proto__ = t;
}
var de = {
	autoSleep: 120,
	force3D: "auto",
	nullTargetWarn: 1,
	units: { lineHeight: "" }
}, fe = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, pe, B, me, he = 1e8, ge = 1 / he, _e = Math.PI * 2, ve = _e / 4, ye = 0, be = Math.sqrt, xe = Math.cos, Se = Math.sin, V = function(e) {
	return typeof e == "string";
}, Ce = function(e) {
	return typeof e == "function";
}, we = function(e) {
	return typeof e == "number";
}, Te = function(e) {
	return e === void 0;
}, Ee = function(e) {
	return typeof e == "object";
}, De = function(e) {
	return e !== !1;
}, Oe = function() {
	return typeof window < "u";
}, ke = function(e) {
	return Ce(e) || V(e);
}, Ae = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, je = Array.isArray, Me = /(?:-?\.?\d|\.)+/gi, Ne = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, H = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, Pe = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, Fe = /[+-]=-?[.\d]+/, Ie = /[^,'"\[\]\s]+/gi, Le = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, Re, ze, Be, Ve, He = {}, Ue = {}, We, Ge = function(e) {
	return (Ue = St(e, He)) && Hr;
}, Ke = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, qe = function(e, t) {
	return !t && console.warn(e);
}, Je = function(e, t) {
	return e && (He[e] = t) && Ue && (Ue[e] = t) || He;
}, Ye = function() {
	return 0;
}, Xe = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, Ze = {
	suppressEvents: !0,
	kill: !1
}, Qe = { suppressEvents: !0 }, $e = {}, et = [], tt = {}, nt, rt = {}, it = {}, at = 30, ot = [], st = "", ct = function(e) {
	var t = e[0], n, r;
	if (Ee(t) || Ce(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = ot.length; r-- && !ot[r].targetTest(t););
		n = ot[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new Qn(e[r], n))) || e.splice(r, 1);
	return e;
}, lt = function(e) {
	return e._gsap || ct(on(e))[0]._gsap;
}, ut = function(e, t, n) {
	return (n = e[t]) && Ce(n) ? e[t]() : Te(n) && e.getAttribute && e.getAttribute(t) || n;
}, dt = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, ft = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, pt = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, mt = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, ht = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, gt = function() {
	var e = et.length, t = et.slice(0), n, r;
	for (tt = {}, et.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, _t = function(e, t, n, r) {
	et.length && !B && gt(), e.render(t, n, r || B && t < 0 && (e._initted || e._startAt)), et.length && !B && gt();
}, vt = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(Ie).length < 2 ? t : V(e) ? e.trim() : e;
}, yt = function(e) {
	return e;
}, bt = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, xt = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, St = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, Ct = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = Ee(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, wt = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, Tt = function(e) {
	var t = e.parent || Re, n = e.keyframes ? xt(je(e.keyframes)) : bt;
	if (De(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, Et = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, Dt = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, Ot = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, kt = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, At = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, jt = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, Mt = function(e, t, n, r) {
	return e._startAt && (B ? e._startAt.revert(Ze) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, Nt = function e(t) {
	return !t || t._ts && e(t.parent);
}, Pt = function(e) {
	return e._repeat ? Ft(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, Ft = function(e, t) {
	var n = Math.floor(e = pt(e / t));
	return e && n === e ? n - 1 : n;
}, It = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, Lt = function(e) {
	return e._end = pt(e._start + (e._tDur / Math.abs(e._ts || e._rts || ge) || 0));
}, Rt = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = pt(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), Lt(e), n._dirty || At(n, e)), e;
}, zt = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = It(e.rawTime(), t), (!t._dur || $t(0, t.totalDuration(), n) - t._tTime > ge) && t.render(n, !0)), At(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -ge;
	}
}, Bt = function(e, t, n, r) {
	return t.parent && kt(t), t._start = pt((we(n) ? n : n || e !== Re ? Xt(e, n, t) : e._time) + t._delay), t._end = pt(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), Dt(e, t, "_first", "_last", e._sort ? "_start" : 0), Wt(t) || (e._recent = t), r || zt(e, t), e._ts < 0 && Rt(e, e._tTime), e;
}, Vt = function(e, t) {
	return (He.ScrollTrigger || Ke("scrollTrigger", t)) && He.ScrollTrigger.create(t, e);
}, Ht = function(e, t, n, r, i) {
	if (sr(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !B && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && nt !== Rn.frame) return et.push(e), e._lazy = [i, r], 1;
}, Ut = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, Wt = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, Gt = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && Ut(e) && !(!e._initted && Wt(e)) || (e._ts < 0 || e._dp._ts < 0) && !Wt(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = $t(0, e._tDur, t), l = Ft(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== Ft(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || B || r || e._zTime === ge || !t && e._zTime) {
		if (!e._initted && Ht(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? ge : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && Mt(e, t, n, !0), e._onUpdate && !n && Cn(e, "onUpdate"), s && e._repeat && !n && e.parent && Cn(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && kt(e, 1), !n && !B && (Cn(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, Kt = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, qt = function(e, t, n, r) {
	var i = e._repeat, a = pt(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : pt(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && Rt(e, e._tTime = e._tDur * o), e.parent && Lt(e), n || At(e.parent, e), e;
}, Jt = function(e) {
	return e instanceof er ? At(e) : qt(e, e._dur);
}, Yt = {
	_start: 0,
	endTime: Ye,
	totalDuration: Ye
}, Xt = function e(t, n, r) {
	var i = t.labels, a = t._recent || Yt, o = t.duration() >= he ? a.endTime(!1) : t._dur, s, c, l;
	return V(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (je(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, Zt = function(e, t, n) {
	var r = we(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = De(s.vars.inherit) && s.parent;
		a.immediateRender = De(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new mr(t[0], a, t[i + 1]);
}, Qt = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, $t = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, en = function(e, t) {
	return !V(e) || !(t = Le.exec(e)) ? "" : t[1];
}, tn = function(e, t, n) {
	return Qt(n, function(n) {
		return $t(e, t, n);
	});
}, nn = [].slice, rn = function(e, t) {
	return e && Ee(e) && "length" in e && (!t && !e.length || e.length - 1 in e && Ee(e[0])) && !e.nodeType && e !== ze;
}, an = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return V(e) && !t || rn(e, 1) ? (r = n).push.apply(r, on(e)) : n.push(e);
	}) || n;
}, on = function(e, t, n) {
	return me && !t && me.selector ? me.selector(e) : V(e) && !n && (Be || !zn()) ? nn.call((t || Ve).querySelectorAll(e), 0) : je(e) ? an(e, n) : rn(e) ? nn.call(e, 0) : e ? [e] : [];
}, sn = function(e) {
	return e = on(e)[0] || qe("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return on(t, n.querySelectorAll ? n : n === e ? qe("Invalid scope") || Ve.createElement("div") : e);
	};
}, cn = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, ln = function(e) {
	if (Ce(e)) return e;
	var t = Ee(e) ? e : { each: e }, n = qn(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return V(r) ? l = u = {
		center: .5,
		edges: .5,
		end: 1
	}[r] || 0 : !o && s && (l = r[0], u = r[1]), function(e, o, d) {
		var f = (d || t).length, p = a[f], m, h, g, _, v, y, b, x, S;
		if (!p) {
			if (S = t.grid === "auto" ? 0 : (t.grid || [1, he])[1], !S) {
				for (b = -he; b < (b = d[S++].getBoundingClientRect().left) && S < f;);
				S < f && S--;
			}
			for (p = a[f] = [], m = s ? Math.min(S, f) * l - .5 : r % S, h = S === he ? 0 : s ? f * u / S - .5 : r / S | 0, b = 0, x = he, y = 0; y < f; y++) g = y % S - m, _ = h - (y / S | 0), p[y] = v = c ? Math.abs(c === "y" ? _ : g) : be(g * g + _ * _), v > b && (b = v), v < x && (x = v);
			r === "random" && cn(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = en(t.amount || t.each) || 0, n = n && f < 0 ? Gn(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, pt(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, un = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = pt(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (we(n) ? 0 : en(n));
	};
}, dn = function(e, t) {
	var n = je(e), r, i;
	return !n && Ee(e) && (r = n = e.radius || he, e.values ? (e = on(e.values), (i = !we(e[0])) && (r *= r)) : e = un(e.increment)), Qt(t, n ? Ce(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = he, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || we(t) ? s : s + en(t);
	} : un(e));
}, fn = function(e, t, n, r) {
	return Qt(je(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return je(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, pn = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, mn = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || en(n));
	};
}, hn = function(e, t, n) {
	return bn(e, t, 0, 1, n);
}, gn = function(e, t, n) {
	return Qt(n, function(n) {
		return e[~~t(n)];
	});
}, _n = function e(t, n, r) {
	var i = n - t;
	return je(t) ? gn(t, e(0, t.length), n) : Qt(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, vn = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return je(t) ? gn(t, e(0, t.length - 1), n) : Qt(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, yn = function(e) {
	for (var t = 0, n = "", r, i, a, o; ~(r = e.indexOf("random(", t));) a = e.indexOf(")", r), o = e.charAt(r + 7) === "[", i = e.substr(r + 7, a - r - 7).match(o ? Ie : Me), n += e.substr(t, r - t) + fn(o ? i : +i[0], o ? 0 : +i[1], +i[2] || 1e-5), t = a + 1;
	return n + e.substr(t, e.length - t);
}, bn = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return Qt(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, xn = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = V(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (je(t) && !je(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = St(je(t) ? [] : {}, t));
		if (!u) {
			for (c in n) nr.call(s, t, c, "get", n[c]);
			a = function(e) {
				return Cr(e, s) || (o ? t.p : t);
			};
		}
	}
	return Qt(r, a);
}, Sn = function(e, t, n) {
	var r = e.labels, i = he, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, Cn = function(e, t, n) {
	var r = e.vars, i = r[t], a = me, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && et.length && gt(), o && (me = o), l = s ? i.apply(c, s) : i.call(c), me = a, l;
}, wn = function(e) {
	return kt(e), e.scrollTrigger && e.scrollTrigger.kill(!!B), e.progress() < 1 && Cn(e, "onInterrupt"), e;
}, Tn, En = [], Dn = function(e) {
	if (e) if (e = !e.name && e.default || e, Oe() || e.headless) {
		var t = e.name, n = Ce(e), r = t && !n && e.init ? function() {
			this._props = [];
		} : e, i = {
			init: Ye,
			render: Cr,
			add: nr,
			kill: Tr,
			modifier: wr,
			rawVars: 0
		}, a = {
			targetTest: 0,
			get: 0,
			getSetter: yr,
			aliases: {},
			register: 0
		};
		if (zn(), e !== r) {
			if (rt[t]) return;
			bt(r, bt(wt(e, i), a)), St(r.prototype, St(i, wt(e, a))), rt[r.prop = t] = r, e.targetTest && (ot.push(r), $e[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
		}
		Je(t, r), e.register && e.register(Hr, r, Or);
	} else En.push(e);
}, On = 255, kn = {
	aqua: [
		0,
		On,
		On
	],
	lime: [
		0,
		On,
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
		On
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		On,
		On,
		On
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		On,
		On,
		0
	],
	orange: [
		On,
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
		On,
		0,
		0
	],
	pink: [
		On,
		192,
		203
	],
	cyan: [
		0,
		On,
		On
	],
	transparent: [
		On,
		On,
		On,
		0
	]
}, An = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * On + .5 | 0;
}, jn = function(e, t, n) {
	var r = e ? we(e) ? [
		e >> 16,
		e >> 8 & On,
		e & On
	] : 0 : kn.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), kn[e]) r = kn[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & On,
				r & On,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & On,
				e & On
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(Me), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = An(s + 1 / 3, i, a), r[1] = An(s, i, a), r[2] = An(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(Ne), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(Me) || kn.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / On, a = r[1] / On, o = r[2] / On, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, Mn = function(e) {
	var t = [], n = [], r = -1;
	return e.split(Pn).forEach(function(e) {
		var i = e.match(H) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, Nn = function(e, t, n) {
	var r = "", i = (e + r).match(Pn), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = jn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = Mn(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(Pn, "1").split(H), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(Pn), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, Pn = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in kn) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), Fn = /hsl[a]?\(/, In = function(e) {
	var t = e.join(" "), n;
	if (Pn.lastIndex = 0, Pn.test(t)) return n = Fn.test(t), e[1] = Nn(e[1], n), e[0] = Nn(e[0], n, Mn(e[1])), !0;
}, Ln, Rn = function() {
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
			We && (!Be && Oe() && (ze = Be = window, Ve = ze.document || {}, He.gsap = Hr, (ze.gsapVersions ||= []).push(Hr.version), Ge(Ue || ze.GreenSockGlobals || !ze.gsap && ze || {}), En.forEach(Dn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, Ln = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), Ln = 0, l = Ye;
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
			return d.remove(e), s[n ? "unshift" : "push"](r), zn(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), zn = function() {
	return !Ln && Rn.wake();
}, U = {}, Bn = /^[\d.\-M][\d.\-,\s]/, Vn = /["']/g, Hn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(Vn, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, Un = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, Wn = function(e) {
	var t = (e + "").split("("), n = U[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [Hn(t[1])] : Un(e).split(",").map(vt)) : U._CE && Bn.test(e) ? U._CE("", e) : n;
}, Gn = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, Kn = function e(t, n) {
	for (var r = t._first, i; r;) r instanceof er ? e(r, n) : r.vars.yoyoEase && (!r._yoyo || !r._repeat) && r._yoyo !== n && (r.timeline ? e(r.timeline, n) : (i = r._ease, r._ease = r._yEase, r._yEase = i, r._yoyo = n)), r = r._next;
}, qn = function(e, t) {
	return e && (Ce(e) ? e : U[e] || Wn(e)) || t;
}, Jn = function(e, t, n, r) {
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
	return dt(e, function(e) {
		for (var t in U[e] = He[e] = i, U[a = e.toLowerCase()] = n, i) U[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = U[e + "." + t] = i[t];
	}), i;
}, Yn = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, Xn = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / _e * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * Se((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : Yn(s);
	return a = _e / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, Zn = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : Yn(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
dt("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	Jn(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), U.Linear.easeNone = U.none = U.Linear.easeIn, Jn("Elastic", Xn("in"), Xn("out"), Xn()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	Jn("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), Jn("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), Jn("Circ", function(e) {
	return -(be(1 - e * e) - 1);
}), Jn("Sine", function(e) {
	return e === 1 ? 1 : -xe(e * ve) + 1;
}), Jn("Back", Zn("in"), Zn("out"), Zn()), U.SteppedEase = U.steps = He.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - ge;
	return function(e) {
		return ((r * $t(0, a, e) | 0) + i) * n;
	};
} }, fe.ease = U["quad.out"], dt("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return st += e + "," + e + "Params,";
});
var Qn = function(e, t) {
	this.id = ye++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : ut, this.set = t ? t.getSetter : yr;
}, $n = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, qt(this, +e.duration, 1, 1), this.data = e.data, me && (this._ctx = me, me.data.push(this)), Ln || Rn.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, qt(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (zn(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (Rt(this, e), !n._dp || n.parent || zt(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && Bt(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === ge || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), _t(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + Pt(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + Pt(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? Ft(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -ge ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? It(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -ge ? 0 : this._rts, this.totalTime($t(-Math.abs(this._delay), this._tDur, n), t !== !1), Lt(this), jt(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (zn(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== ge && (this._tTime -= ge)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = e;
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && Bt(t, this, e - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (De(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? It(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = Qe);
		var t = B;
		return B = e, (this._initted || this._startAt) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), B = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, Jt(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, Jt(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(Xt(this, e), De(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, De(t)), this._dur || (this._zTime = -ge), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -ge : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -ge, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - ge);
	}, t.eventCallback = function(e, t, n) {
		var r = this.vars;
		return arguments.length > 1 ? (t ? (r[e] = t, n && (r[e + "Params"] = n), e === "onUpdate" && (this._onUpdate = t)) : delete r[e], this) : r[e];
	}, t.then = function(e) {
		var t = this;
		return new Promise(function(n) {
			var r = Ce(e) ? e : yt, i = function() {
				var e = t.then;
				t.then = null, Ce(r) && (r = r(t)) && (r.then || r === t) && (t.then = e), n(r), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? i() : t._prom = i;
		});
	}, t.kill = function() {
		wn(this);
	}, e;
}();
bt($n.prototype, {
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
	_zTime: -ge,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var er = /*#__PURE__*/ function(e) {
	ue(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = De(t.sortChildren), Re && Bt(t.parent || Re, le(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && Vt(le(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return Zt(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return Zt(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return Zt(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, Tt(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new mr(e, t, Xt(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return Bt(this, mr.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new mr(e, n, Xt(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, Tt(n).immediateRender = De(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, Tt(r).immediateRender = De(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : pt(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== Re && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = pt(o % f), o === i ? (d = this._repeat, c = a) : (_ = pt(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = Ft(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : pt(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && Cn(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
					Kn(this, y);
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = Kt(this, pt(r), pt(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && c && !t && !d && (Cn(this, "onStart"), this._tTime !== o)) return this;
			if (c >= r && e >= 0) for (l = this._first; l;) {
				if (u = l._next, (l._act || c >= l._start) && l._ts && m !== l) {
					if (l.parent !== this) return this.render(e, t, n);
					if (l.render(l._ts > 0 ? (c - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (c - l._start) * l._ts, t, n), c !== this._time || !this._ts && !p) {
						m = 0, u && (o += this._zTime = -ge);
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
							m = 0, u && (o += this._zTime = S ? -ge : ge);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -ge)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, Lt(this), this.render(e, t, n);
			this._onUpdate && !t && Cn(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && kt(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (Cn(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (we(t) || (t = Xt(this, t, e)), !(e instanceof $n)) {
			if (je(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (V(e)) return this.addLabel(e, t);
			if (Ce(e)) e = mr.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : Bt(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -he);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof mr ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return V(e) ? this.removeLabel(e) : Ce(e) ? this.killTweensOf(e) : (e.parent === this && Ot(this, e), e === this._recent && (this._recent = this._last), At(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = pt(Rn.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = Xt(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = mr.delayedCall(0, t || Ye, n);
		return r.data = "isPause", this._hasPause = 1, Bt(this, r, Xt(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = Xt(this, e); t;) t._start === e && t.data === "isPause" && kt(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) ar !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = on(e), i = this._first, a = we(t), o; i;) i instanceof mr ? ht(i._targets, r) && (a ? (!ar || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = Xt(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = mr.to(n, bt({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || ge,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && qt(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, bt({ startAt: { time: Xt(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), Sn(this, Xt(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), Sn(this, Xt(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + ge);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		for (var r = this._first, i = this.labels, a; r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return At(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), At(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = he, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, Bt(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += o / n._ts, n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			qt(n, n === Re && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (Re._ts && (_t(Re, It(e, Re)), nt = Rn.frame), Rn.frame >= at) {
			at += de.autoSleep || 120;
			var t = Re._first;
			if ((!t || !t._ts) && de.autoSleep && Rn._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || Rn.sleep();
			}
		}
	}, t;
}($n);
bt(er.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var tr = function(e, t, n, r, i, a, o) {
	var s = new Or(this._pt, e, t, 0, 1, Sr, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = yn(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(Pe) || []; u = Pe.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? mt(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = Pe.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (Fe.test(r) || g) && (s.e = 0), this._pt = s, s;
}, nr = function(e, t, n, r, i, a, o, s, c, l) {
	Ce(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? Ce(u) ? c ? e[t.indexOf("set") || !Ce(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = Ce(u) ? c ? _r : gr : hr, p;
	if (V(r) && (~r.indexOf("random(") && (r = yn(r)), r.charAt(1) === "=" && (p = mt(d, r) + (en(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || or) return !isNaN(d * r) && r !== "" ? (p = new Or(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? xr : br, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && Ke(t, r), tr.call(this, e, t, d, r, f, s || de.stringFilter, c));
}, rr = function(e, t, n, r, i) {
	if (Ce(e) && (e = dr(e, i, t, n, r)), !Ee(e) || e.style && e.nodeType || je(e) || Ae(e)) return V(e) ? dr(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = dr(e[o], i, t, n, r);
	return a;
}, ir = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (rt[e] && (o = new rt[e]()).init(i, o.rawVars ? t[e] : rr(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new Or(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== Tn)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, ar, or, sr = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !pe, b = t.timeline, x, S, C, w, T, E, D, O, k, ee, A, te, j;
	if (b && (!f || !a) && (a = "none"), t._ease = qn(a, fe.ease), t._yEase = d ? Gn(qn(d === !0 ? a : d, fe.ease)) : 0, d && t._yoyo && !t._repeat && (d = t._yEase, t._yEase = t._ease, t._ease = d), t._from = !b && !!i.runBackwards, !b || f && !i.stagger) {
		if (O = g[0] ? lt(g[0]).harness : 0, te = O && i[O.prop], x = wt(i, $e), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? Ze : Xe), h._lazy = 0), o) {
			if (kt(t._startAt = mr.set(g, bt({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && De(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return Cn(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (B || !s && !p) && t._startAt.revert(Ze), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), C = bt({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && De(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, x), te && (C[O.prop] = te), kt(t._startAt = mr.set(g, C)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (B ? t._startAt.revert(Ze) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, ge, ge);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && De(c) || c && !m, S = 0; S < g.length; S++) {
			if (T = g[S], D = T._gsap || ct(g)[S]._gsap, t._ptLookup[S] = ee = {}, tt[D.id] && et.length && gt(), A = v === g ? S : v.indexOf(T), O && (k = new O()).init(T, te || x, t, A, v) !== !1 && (t._pt = w = new Or(t._pt, T, k.name, 0, 1, k.render, k, 0, k.priority), k._props.forEach(function(e) {
				ee[e] = w;
			}), k.priority && (E = 1)), !O || te) for (C in x) rt[C] && (k = ir(C, x, t, A, T, v)) ? k.priority && (E = 1) : ee[C] = w = nr.call(t, T, C, "get", x[C], A, v, 0, i.stringFilter);
			t._op && t._op[S] && t.kill(T, t._op[S]), y && t._pt && (ar = t, Re.killTweensOf(T, ee, t.globalTime(n)), j = !t.parent, ar = 0), t._pt && c && (tt[D.id] = 1);
		}
		E && Dr(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !j, f && n <= 0 && b.render(he, !0, !0);
}, cr = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return or = 1, e.vars[t] = "+=0", sr(e, o), or = 0, s ? qe(t + " not eligible for reset") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e &&= ft(n) + en(u.e), u.b &&= l.s + en(u.b);
}, lr = function(e, t) {
	var n = e[0] ? lt(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = St({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, ur = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (je(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
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
}, dr = function(e, t, n, r, i) {
	return Ce(e) ? e.call(t, n, r, i) : V(e) && ~e.indexOf("random(") ? yn(e) : e;
}, fr = st + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", pr = {};
dt(fr + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return pr[e] = 1;
});
var mr = /*#__PURE__*/ function(e) {
	ue(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : Tt(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = o.yoyoEase, g = n.parent || Re, _ = (je(t) || Ae(t) ? we(t[0]) : "length" in n) ? [t] : on(t), v, y, b, x, S, C, w, T;
		if (a._targets = _.length ? ct(_) : qe("GSAP target " + t + " not found. https://gsap.com", !de.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || ke(s) || ke(c)) {
			if (n = a.vars, v = a.timeline = new er({
				data: "nested",
				defaults: p || {},
				targets: g && g.data === "nested" ? g.vars.targets : _
			}), v.kill(), v.parent = v._dp = le(a), v._start = 0, u || ke(s) || ke(c)) {
				if (x = _.length, w = u && ln(u), Ee(u)) for (S in u) ~fr.indexOf(S) && (T ||= {}, T[S] = u[S]);
				for (y = 0; y < x; y++) b = wt(n, pr), b.stagger = 0, h && (b.yoyoEase = h), T && St(b, T), C = _[y], b.duration = +dr(s, le(a), y, C, _), b.delay = (+dr(c, le(a), y, C, _) || 0) - a._delay, !u && x === 1 && b.delay && (a._delay = c = b.delay, a._start += c, b.delay = 0), v.to(C, b, w ? w(y, C, _) : 0), v._ease = U.none;
				v.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				Tt(bt(v.vars.defaults, { ease: "none" })), v._ease = qn(f.ease || n.ease || "none");
				var E = 0, D, O, k;
				if (je(f)) f.forEach(function(e) {
					return v.to(_, e, ">");
				}), v.duration();
				else {
					for (S in b = {}, f) S === "ease" || S === "easeEach" || ur(S, f[S], b, f.easeEach);
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
		return d === !0 && !pe && (ar = le(a), Re.killTweensOf(_), ar = 0), Bt(g, le(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === pt(g._time) && De(l) && Nt(le(a)) && g.data !== "nested") && (a._tTime = -ge, a.render(Math.max(0, -c) || 0)), m && Vt(le(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - ge && !o ? i : e < ge ? 0 : e, c, l, u, d, f, p, m, h, g;
		if (!a) Gt(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = pt(s % d), s === i ? (u = this._repeat, c = a) : (f = pt(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (g = this._yEase, c = a - c), f = Ft(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && (h && this._yEase && Kn(h, p), this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(pt(d * u), !0).invalidate()._lock = 0));
			}
			if (!this._initted) {
				if (Ht(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
				if (r !== this._time && !(n && this.vars.repeatRefresh && u !== f)) return this;
				if (a !== this._dur) return this.render(e, t, n);
			}
			if (this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), this.ratio = m = (g || this._ease)(c / a), this._from && (this.ratio = m = 1 - m), c && !r && !t && !u && (Cn(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && Mt(this, e, t, n), Cn(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && Cn(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && Mt(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && kt(this, 1), !t && !(o && !r) && (s || r || p) && (Cn(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		Ln || Rn.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || sr(this, a), o = this._ease(a / this._dur), cr(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (Rt(this, 0), this.parent || Dt(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? wn(this) : this.scrollTrigger && this.scrollTrigger.kill(!!B), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, ar && ar.vars.overwrite !== !0)._first || wn(this), this.parent && n !== this.timeline.totalDuration() && qt(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? on(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && Et(r, i)) return t === "all" && (this._pt = 0), wn(this);
		for (s = this._op = this._op || [], t !== "all" && (V(t) && (d = {}, dt(t, function(e) {
			return d[e] = 1;
		}), t = d), t = lr(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && Ot(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && wn(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return Zt(1, arguments);
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
		return Zt(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return Re.killTweensOf(e, t, n);
	}, t;
}($n);
bt(mr.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), dt("staggerTo,staggerFrom,staggerFromTo", function(e) {
	mr[e] = function() {
		var t = new er(), n = nn.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var hr = function(e, t, n) {
	return e[t] = n;
}, gr = function(e, t, n) {
	return e[t](n);
}, _r = function(e, t, n, r) {
	return e[t](r.fp, n);
}, vr = function(e, t, n) {
	return e.setAttribute(t, n);
}, yr = function(e, t) {
	return Ce(e[t]) ? gr : Te(e[t]) && e.setAttribute ? vr : hr;
}, br = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, xr = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, Sr = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, Cr = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, wr = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, Tr = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? Ot(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, Er = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, Dr = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, Or = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || br, this.d = o || this, this.set = s || hr, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = Er, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
dt(st + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(e) {
	return $e[e] = 1;
}), He.TweenMax = He.TweenLite = mr, He.TimelineLite = He.TimelineMax = er, Re = new er({
	sortChildren: !1,
	defaults: fe,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), de.stringFilter = In;
var kr = [], Ar = {}, jr = [], Mr = 0, Nr = 0, Pr = function(e) {
	return (Ar[e] || jr).map(function(e) {
		return e();
	});
}, Fr = function() {
	var e = Date.now(), t = [];
	e - Mr > 2 && (Pr("matchMediaInit"), kr.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = ze.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), Pr("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), Mr = e, Pr("matchMedia"));
}, Ir = /*#__PURE__*/ function() {
	function e(e, t) {
		this.selector = t && sn(t), this.data = [], this._r = [], this.isReverted = !1, this.id = Nr++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		Ce(e) && (n = t, t = e, e = Ce);
		var r = this, i = function() {
			var e = me, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = sn(n)), me = r, a = t.apply(r, arguments), Ce(a) && r._r.push(a), me = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === Ce ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = me;
		me = null, e(this), me = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof mr && !(n.parent && n.parent.data === "nested") && t.push(n);
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
			}), r = n.data.length; r--;) i = n.data[r], i instanceof er ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof mr) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = kr.length; r--;) kr[r].id === this.id && kr.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), Lr = /*#__PURE__*/ function() {
	function e(e) {
		this.contexts = [], this.scope = e, me && me.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		Ee(e) || (e = { matches: e });
		var r = new Ir(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in me && !r.selector && (r.selector = me.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = ze.matchMedia(e[o]), a && (kr.indexOf(r) < 0 && kr.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(Fr) : a.addEventListener("change", Fr)));
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
}(), Rr = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return Dn(e);
		});
	},
	timeline: function(e) {
		return new er(e);
	},
	getTweensOf: function(e, t) {
		return Re.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		V(e) && (e = on(e)[0]);
		var i = lt(e || {}).get, a = n ? yt : vt;
		return n === "native" && (n = ""), e && (t ? a((rt[t] && rt[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((rt[t] && rt[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = on(e), e.length > 1) {
			var r = e.map(function(e) {
				return Hr.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = rt[t], o = lt(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			Tn._pt = 0, r.init(e, n ? t + n : t, Tn, 0, [e]), r.render(1, r), Tn._pt && Cr(1, Tn);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = Hr.to(e, bt((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return Re.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = qn(e.ease, fe.ease)), Ct(fe, e || {});
	},
	config: function(e) {
		return Ct(de, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !rt[e] && !He[e] && qe(t + " effect requires " + e + " plugin.");
		}), it[t] = function(e, t, r) {
			return n(on(e), bt(t || {}, i), r);
		}, a && (er.prototype[t] = function(e, n, r) {
			return this.add(it[t](e, Ee(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		U[e] = qn(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? qn(e, t) : U;
	},
	getById: function(e) {
		return Re.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new er(e), r, i;
		for (n.smoothChildTiming = De(e.smoothChildTiming), Re.remove(n), n._dp = 0, n._time = n._tTime = Re._time, r = Re._first; r;) i = r._next, (t || !(!r._dur && r instanceof mr && r.vars.onComplete === r._targets[0])) && Bt(n, r, r._start - r._delay), r = i;
		return Bt(Re, n, 0), n;
	},
	context: function(e, t) {
		return e ? new Ir(e, t) : me;
	},
	matchMedia: function(e) {
		return new Lr(e);
	},
	matchMediaRefresh: function() {
		return kr.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || Fr();
	},
	addEventListener: function(e, t) {
		var n = Ar[e] || (Ar[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = Ar[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: _n,
		wrapYoyo: vn,
		distribute: ln,
		random: fn,
		snap: dn,
		normalize: hn,
		getUnit: en,
		clamp: tn,
		splitColor: jn,
		toArray: on,
		selector: sn,
		mapRange: bn,
		pipe: pn,
		unitize: mn,
		interpolate: xn,
		shuffle: cn
	},
	install: Ge,
	effects: it,
	ticker: Rn,
	updateRoot: er.updateRoot,
	plugins: rt,
	globalTimeline: Re,
	core: {
		PropTween: Or,
		globals: Je,
		Tween: mr,
		Timeline: er,
		Animation: $n,
		getCache: lt,
		_removeLinkedListItem: Ot,
		reverting: function() {
			return B;
		},
		context: function(e) {
			return e && me && (me.data.push(e), e._ctx = me), me;
		},
		suppressOverwrites: function(e) {
			return pe = e;
		}
	}
};
dt("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return Rr[e] = mr[e];
}), Rn.add(er.updateRoot), Tn = Rr.to({}, { duration: 0 });
var zr = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, Br = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = zr(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, Vr = function(e, t) {
	return {
		name: e,
		rawVars: 1,
		init: function(e, n, r) {
			r._onInit = function(e) {
				var r, i;
				if (V(n) && (r = {}, dt(n, function(e) {
					return r[e] = 1;
				}), n = r), t) {
					for (i in r = {}, n) r[i] = t(n[i]);
					n = r;
				}
				Br(e, n);
			};
		}
	};
}, Hr = Rr.registerPlugin({
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
}, Vr("roundProps", un), Vr("modifiers"), Vr("snap", dn)) || Rr;
mr.version = er.version = Hr.version = "3.12.7", We = 1, Oe() && zn(), U.Power0, U.Power1, U.Power2, U.Power3, U.Power4, U.Linear, U.Quad, U.Cubic, U.Quart, U.Quint, U.Strong, U.Elastic, U.Back, U.SteppedEase, U.Bounce, U.Sine, U.Expo, U.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var Ur, Wr, Gr, Kr, qr, Jr, Yr, Xr = function() {
	return typeof window < "u";
}, Zr = {}, Qr = 180 / Math.PI, $r = Math.PI / 180, ei = Math.atan2, ti = 1e8, ni = /([A-Z])/g, ri = /(left|right|width|margin|padding|x)/i, ii = /[\s,\(]\S/, ai = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, oi = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, si = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, ci = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, li = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, ui = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, di = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, fi = function(e, t, n) {
	return e.style[t] = n;
}, pi = function(e, t, n) {
	return e.style.setProperty(t, n);
}, mi = function(e, t, n) {
	return e._gsap[t] = n;
}, hi = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, gi = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, _i = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, W = "transform", vi = W + "Origin", yi = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in Zr && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = ai[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = Li(i, e);
		}) : this.tfm[t] = o.x ? o[t] : Li(i, t), t === vi && (this.tfm.zOrigin = o.zOrigin);
		else return ai.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(W) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(vi, n, "")), t = W;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, bi = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, xi = function() {
	var e = this.props, t = this.target, n = t.style, r = t._gsap, i, a;
	for (i = 0; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(ni, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = Yr(), (!i || !i.isStart) && !n[W] && (bi(n), r.zOrigin && n[vi] && (n[vi] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, Si = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: xi,
		save: yi
	};
	return e._gsap || Hr.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, Ci, wi = function(e, t) {
	var n = Wr.createElementNS ? Wr.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : Wr.createElement(e);
	return n && n.style ? n : Wr.createElement(e);
}, Ti = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(ni, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, Di(n) || n, 1) || "";
}, Ei = "O,Moz,ms,Ms,Webkit".split(","), Di = function(e, t, n) {
	var r = (t || qr).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(Ei[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? Ei[i] : "") + e;
}, Oi = function() {
	Xr() && window.document && (Ur = window, Wr = Ur.document, Gr = Wr.documentElement, qr = wi("div") || { style: {} }, wi("div"), W = Di(W), vi = W + "Origin", qr.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", Ci = !!Di("perspective"), Yr = Hr.core.reverting, Kr = 1);
}, G = function(e) {
	var t = e.ownerSVGElement, n = wi("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), Gr.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), Gr.removeChild(n), i;
}, ki = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, Ai = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = G(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = G(e)), t && !t.width && !t.x && !t.y ? {
		x: +ki(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +ki(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, ji = function(e) {
	return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && Ai(e));
}, Mi = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in Zr && t !== vi && (t = W), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(ni, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, Ni = function(e, t, n, r, i, a) {
	var o = new Or(e._pt, t, n, 0, 1, a ? di : ui);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, Pi = {
	deg: 1,
	rad: 1,
	turn: 1
}, Fi = {
	grid: 1,
	flex: 1
}, Ii = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = qr.style, c = ri.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || Pi[i] || Pi[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && ji(t), (p || o === "%") && (Zr[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], ft(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === Wr || !h.appendChild) && (h = Wr.body), g = h._gsap, g && p && g.width && c && g.time === Rn.time && !g.uncache) return ft(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : Mi(t, n);
	} else (p || o === "%") && !Fi[Ti(h, "display")] && (s.position = Ti(t, "position")), h === t && (s.position = "static"), h.appendChild(qr), m = qr[u], h.removeChild(qr), s.position = "absolute";
	return c && p && (g = lt(h), g.time = Rn.time, g.width = h[u]), ft(f ? m * a / d : m && a ? d / m * a : 0);
}, Li = function(e, t, n, r) {
	var i;
	return Kr || Oi(), t in ai && t !== "transform" && (t = ai[t], ~t.indexOf(",") && (t = t.split(",")[0])), Zr[t] && t !== "transform" ? (i = Yi(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : Xi(Ti(e, vi)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = Hi[t] && Hi[t](e, t, n) || Ti(e, t) || ut(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? Ii(e, t, i, n) + n : i;
}, Ri = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = Di(t, e, 1), a = i && Ti(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = Ti(e, "borderTopColor"));
	}
	var o = new Or(this._pt, e.style, t, 0, 1, Sr), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r === "auto" && (m = e.style[t], e.style[t] = r, r = Ti(e, t) || r, m ? e.style[t] = m : Mi(e, t)), l = [n, r], In(l), n = l[0], r = l[1], d = n.match(H) || [], b = r.match(H) || [], b.length) {
		for (; u = H.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = mt(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = H.lastIndex - v.length, v || (v = v || de.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = Ii(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? di : ui;
	return Fe.test(r) && (o.e = 0), this._pt = o, o;
}, zi = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, Bi = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = zi[n] || n, t[1] = zi[r] || r, t.join(" ");
}, Vi = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], Zr[o] && (s = 1, o = o === "transformOrigin" ? vi : W), Mi(n, o);
		s && (Mi(n, W), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", Yi(n, 1), a.uncache = 1, bi(r)));
	}
}, Hi = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new Or(e._pt, t, n, 0, 0, Vi);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, Ui = [
	1,
	0,
	0,
	1,
	0,
	0
], Wi = {}, Gi = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, Ki = function(e) {
	var t = Ti(e, W);
	return Gi(t) ? Ui : t.substr(7).match(Ne).map(ft);
}, qi = function(e, t) {
	var n = e._gsap || lt(e), r = e.style, i = Ki(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? Ui : i) : (i === Ui && !e.offsetParent && e !== Gr && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, Gr.appendChild(e)), i = Ki(e), s ? r.display = s : Mi(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : Gr.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, Ji = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || qi(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== Ui && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = Ai(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[vi] = "0px 0px", a && (Ni(a, o, "xOrigin", c, y), Ni(a, o, "yOrigin", l, b), Ni(a, o, "xOffset", u, o.xOffset), Ni(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, Yi = function(e, t) {
	var n = e._gsap || new Qn(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = Ti(e, vi) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, ee, A, te, j, M, N, P, F, ne, I, L;
	return n.svg = !!(e.getCTM && ji(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[W] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[W] === "none" ? "" : s[W])), r.scale = r.rotate = r.translate = "none"), S = qi(e, n.svg), n.svg && (n.uncache ? (j = e.getBBox(), c = n.xOrigin - j.x + "px " + (n.yOrigin - j.y) + "px", te = "") : te = !t && e.getAttribute("data-svg-origin"), Ji(e, te || c, !!te || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== Ui && (E = S[0], D = S[1], O = S[2], k = S[3], l = ee = S[4], u = A = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? ei(D, E) * Qr : 0, _ = O || k ? ei(O, k) * Qr + m : 0, _ && (p *= Math.abs(Math.cos(_ * $r))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (L = S[6], ne = S[7], N = S[8], P = S[9], F = S[10], I = S[11], l = S[12], u = S[13], d = S[14], C = ei(L, F), h = C * Qr, C && (w = Math.cos(-C), T = Math.sin(-C), te = ee * w + N * T, j = A * w + P * T, M = L * w + F * T, N = ee * -T + N * w, P = A * -T + P * w, F = L * -T + F * w, I = ne * -T + I * w, ee = te, A = j, L = M), C = ei(-O, F), g = C * Qr, C && (w = Math.cos(-C), T = Math.sin(-C), te = E * w - N * T, j = D * w - P * T, M = O * w - F * T, I = k * T + I * w, E = te, D = j, O = M), C = ei(D, E), m = C * Qr, C && (w = Math.cos(C), T = Math.sin(C), te = E * w + D * T, j = ee * w + A * T, D = D * w - E * T, A = A * w - ee * T, E = te, ee = j), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = ft(Math.sqrt(E * E + D * D + O * O)), p = ft(Math.sqrt(A * A + L * L)), C = ei(ee, A), _ = Math.abs(C) > 2e-4 ? C * Qr : 0, y = I ? 1 / (I < 0 ? -I : I) : 0), n.svg && (te = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !Gi(Ti(e, W)), te && e.setAttribute("transform", te))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = ft(f), n.scaleY = ft(p), n.rotation = ft(m) + o, n.rotationX = ft(h) + o, n.rotationY = ft(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[vi] = Xi(c)), n.xOffset = n.yOffset = 0, n.force3D = de.force3D, n.renderTransform = n.svg ? ra : Ci ? na : Qi, n.uncache = 0, n;
}, Xi = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, Zi = function(e, t, n) {
	var r = en(t);
	return ft(parseFloat(t) + parseFloat(Ii(e, "x", n + "px", r))) + r;
}, Qi = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, na(e, t);
}, $i = "0deg", ea = "0px", ta = ") ", na = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== $i || l !== $i)) {
		var x = parseFloat(l) * $r, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * $r, w = Math.cos(x), a = Zi(_, a, S * w * -v), o = Zi(_, o, -Math.sin(x) * -v), s = Zi(_, s, C * w * -v + v);
	}
	h !== ea && (y += "perspective(" + h + ta), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== ea || o !== ea || s !== ea) && (y += s !== ea || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + ta), c !== $i && (y += "rotate(" + c + ta), l !== $i && (y += "rotateY(" + l + ta), u !== $i && (y += "rotateX(" + u + ta), (d !== $i || f !== $i) && (y += "skew(" + d + ", " + f + ta), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + ta), _.style[W] = y || "translate(0, 0)";
}, ra = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= $r, c *= $r, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= $r, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = ft(b), x = ft(x), S = ft(S), C = ft(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = Ii(f, "x", a, "px"), y = Ii(f, "y", o, "px")), (p || m || h || g) && (v = ft(v + p - (p * b + m * S) + h), y = ft(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = ft(v + r / 100 * w.width), y = ft(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[W] = w);
}, ia = function(e, t, n, r, i) {
	var a = 360, o = V(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? Qr : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * ti) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * ti) % a - ~~(s / a) * a)), e._pt = u = new Or(e._pt, t, n, r, s, si), u.e = c, u.u = "deg", e._props.push(n), u;
}, aa = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, oa = function(e, t, n) {
	var r = aa({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[W] = t, o = Yi(n, 1), Mi(n, W), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[W], a[W] = t, o = Yi(n, 1), a[W] = c), Zr) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = en(c), p = en(l), u = f === p ? parseFloat(c) : Ii(n, s, c, p), d = parseFloat(l), e._pt = new Or(e._pt, o, s, u, d - u, oi), e._pt.u = p || 0, e._props.push(s));
	aa(o, r);
};
dt("padding,margin,Width,Radius", function(e, t) {
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
	Hi[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return Li(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var sa = {
	name: "css",
	register: Oi,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C;
		for (m in Kr || Oi(), this.styles = this.styles || Si(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(rt[m] && ir(m, t, n, r, e, i)))) {
			if (f = typeof l, p = Hi[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = yn(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", Pn.lastIndex = 0, Pn.test(c) || (h = en(c), g = en(l)), g ? h !== g && (c = Ii(e, m, c, g) + g) : h && (l += h), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], V(c) && ~c.indexOf("random(") && (c = yn(c)), en(c + "") || c === "auto" || (c += de.units[m] || en(Li(e, m)) || ""), (c + "").charAt(1) === "=" && (c = Li(e, m))) : c = Li(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in ai && (m === "autoAlpha" && (d === 1 && Li(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), Ni(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = ai[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Zr, v) {
					if (this.styles.save(m), y || (b = e._gsap, b.renderTransform && !t.parseTransform || Yi(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new Or(this._pt, o, W, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new Or(this._pt, b, "scaleY", b.scaleY, (_ ? mt(b.scaleY, _ + u) : u) - b.scaleY || 0, oi), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(vi, 0, o[vi]), l = Bi(l), b.svg ? Ji(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && Ni(this, b, "zOrigin", b.zOrigin, g), Ni(this, o, m, Xi(c), Xi(l)));
						continue;
					} else if (m === "svgOrigin") {
						Ji(e, l, 1, x, 0, this);
						continue;
					} else if (m in Wi) {
						ia(this, b, m, d, _ ? mt(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						Ni(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						oa(this, l, e);
						continue;
					}
				} else m in o || (m = Di(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !ii.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = en(l) || (m in de.units ? de.units[m] : h), h !== g && (d = Ii(e, m, c, g)), this._pt = new Or(this._pt, v ? b : o, m, d, (_ ? mt(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? li : oi), this._pt.u = g || 0, h !== g && g !== "%" && (this._pt.b = c, this._pt.r = ci);
				else if (m in o) Ri.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					Ke(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && Dr(this);
	},
	render: function(e, t) {
		if (t.tween._time || !Yr()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: Li,
	aliases: ai,
	getSetter: function(e, t, n) {
		var r = ai[t];
		return r && r.indexOf(",") < 0 && (t = r), t in Zr && t !== vi && (e._gsap.x || Li(e, "x")) ? n && Jr === n ? t === "scale" ? hi : mi : (Jr = n || {}) && (t === "scale" ? gi : _i) : e.style && !Te(e.style[t]) ? fi : ~t.indexOf("-") ? pi : yr(e, t);
	},
	core: {
		_removeProperty: Mi,
		_getMatrix: qi
	}
};
Hr.utils.checkPrefix = Di, Hr.core.getStyleSaver = Si, (function(e, t, n, r) {
	var i = dt(e + "," + t + "," + n, function(e) {
		Zr[e] = 1;
	});
	dt(t, function(e) {
		de.units[e] = "deg", Wi[e] = 1;
	}), ai[i[13]] = e + "," + t, dt(r, function(e) {
		var t = e.split(":");
		ai[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), dt("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	de.units[e] = "px";
}), Hr.registerPlugin(sa);
//#endregion
//#region node_modules/gsap/index.js
var K = Hr.registerPlugin(sa) || Hr;
K.core.Tween;
//#endregion
//#region src/table/animations/flip.ts
function ca(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function la(e) {
	return {
		x: e.left + e.width / 2,
		y: e.top + e.height / 2
	};
}
function ua(e, t) {
	let n = la(e), r = la(t);
	return {
		x: n.x - r.x,
		y: n.y - r.y
	};
}
function da(e, t) {
	let n = ua(t, e);
	return {
		x: n.x,
		y: n.y
	};
}
function fa(e) {
	typeof window > "u" || ((e instanceof HTMLElement ? e : null) ?? document.querySelector(".btable-wrap") ?? document.querySelector(".btable-session"))?.setAttribute("data-gsap-motion", "true");
}
//#endregion
//#region src/table/discardPileModel.ts
function pa(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function ma(e, t) {
	return (e >>> t & 65535) / 65535;
}
function ha(e, t) {
	let n = pa(`${e}@${t}`), r = ma(n, 0), i = ma(n, 7), a = ma(n, 14), o = ma(n, 21), s = r >= .5 ? 1 : -1, c = i >= .5 ? 1 : -1, l = a >= .5 ? 1 : -1;
	return {
		offsetX: s * (12 + r * 6),
		offsetY: c * (12 + i * 6),
		rotation: l * (7 + a * 2),
		scale: .94 + o * .04,
		zIndex: t + 1
	};
}
function ga(e) {
	let t = ha(e.id, e.pileIndex);
	return {
		...e,
		...t
	};
}
function _a(e) {
	let t = [];
	for (let n = 0; n < e.discardCount; n++) {
		let r = e.heroCardKeys?.[n];
		t.push(r ?? `${e.playerId}:h${e.handNumber}:d${e.pileStartIndex + n}`);
	}
	return t;
}
//#endregion
//#region src/table/animations/discardPileMotion.ts
var va = /* @__PURE__ */ new Set(), ya = ae.drawDiscard;
function ba(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function xa(e = document) {
	let t = (e instanceof Document ? e : e.ownerDocument ?? document).querySelector("[data-discard-pile-anchor]");
	return t ? ca(t) : null;
}
function Sa() {
	for (let e of va) e.kill();
	va.clear();
}
function Ca(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function wa(e, t, n, r = {}) {
	fa(r.root ?? document);
	let i = ce(), a = xa(r.root ?? document), o = se(ya, i), s = i ? .03 : .055, c = K.timeline({ onComplete: () => {
		va.delete(c), r.onComplete?.();
	} });
	va.add(c), e.forEach((e, l) => {
		let u = ha(t[l] ?? `discard-${n + l}`, n + l), d = ca(e);
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
		let f = a.left + a.width / 2 + u.offsetX, p = a.top + a.height / 2 + u.offsetY, m = d.left + d.width / 2, h = d.top + d.height / 2, g = f - m, _ = p - h, { midX: v, midY: y } = ba(g, _);
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
			ease: R,
			onComplete: () => {
				K.set(e, { clearProps: "transform,opacity,willChange,zIndex" }), r.onCardComplete?.(l);
			}
		}, l * s);
	});
	let l = Math.round((e.length > 0 ? (e.length - 1) * s : 0) * 1e3 + o * 1e3 + 40);
	return Ca(c, Math.min(420, Math.max(280, l))), c;
}
function Ta(e, t, n, r, i = {}) {
	let a = [];
	for (let t = 0; t < e.length; t++) {
		let n = e[t], i = document.createElement("div");
		i.className = "discard-fly-ghost", i.setAttribute("aria-hidden", "true"), i.style.position = "fixed", i.style.left = `${n.left}px`, i.style.top = `${n.top}px`, i.style.width = `${n.width}px`, i.style.height = `${n.height}px`, i.style.pointerEvents = "none", i.style.zIndex = "4", r.appendChild(i), a.push(i);
	}
	let o = wa(a, t, n, {
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
function Ea(e, t, n) {
	let r = n.querySelector(`[data-seat-play-origin="${e}"]`) ?? n.querySelector(`[data-trick-play-origin="${e}"]`);
	if (!r) return [];
	let i = ca(r);
	return Array.from({ length: t }, (e, t) => ({
		...i,
		left: i.left + t * 3,
		top: i.top - t * 2
	}));
}
//#endregion
//#region src/table/animations/cardMotion.ts
function Da() {
	fa();
}
var Oa = /* @__PURE__ */ new WeakMap();
function ka(e = document) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = t.querySelector("[data-testid=\"deal-button\"]") ?? t.querySelector(".deck-stack__pile") ?? t.querySelector(".deck-stack");
	return n ? ca(n) : null;
}
function Aa(e, t) {
	return Oa.get(e)?.kill(), Oa.set(e, t), t;
}
function ja(e) {
	e && (Oa.get(e)?.kill(), Oa.delete(e), K.killTweensOf(e), K.set(e, { clearProps: "transform,opacity,filter" }));
}
function Ma(e, t, n = .22) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * n)
	};
}
function Na(e, t, n = ae.dealStagger) {
	Da();
	let r = ce(), i = K.timeline(), a = se(ae.deal, r);
	return e.forEach((e, o) => {
		let { x: s, y: c } = da(ca(e), t), { midX: l, midY: u } = Ma(s, c, .28);
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
			ease: R,
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
			ease: R,
			onComplete: f
		}, d);
	}), i;
}
function Pa(e, t) {
	Da();
	let n = ce(), r = K.timeline(), i = se(ae.drawReceive, n), a = n ? .04 : ae.drawReceiveStagger;
	return e.forEach((e, n) => {
		let { x: o, y: s } = da(ca(e), t);
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
			ease: ie,
			onComplete: () => {
				K.set(e, { clearProps: "transform,opacity,willChange" });
			}
		}, n * a);
	}), r;
}
function Fa(e) {
	Da();
	let t = K.timeline(), n = se(ae.standPat);
	return e.forEach((e) => {
		t.fromTo(e, {
			y: 0,
			scale: 1
		}, {
			y: -5,
			scale: 1.02,
			duration: n * .45,
			ease: R,
			yoyo: !0,
			repeat: 1,
			onComplete: () => {
				K.set(e, { clearProps: "transform,willChange" });
			}
		}, 0);
	}), t;
}
function Ia(e) {
	Da();
	let t = K.timeline(), n = se(ae.foldOut);
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
			ease: z,
			onComplete: () => ja(e)
		}, r * .04);
	}), t;
}
function La(e) {
	Da();
	let t = se(.32);
	return K.set(e, {
		transformOrigin: "50% 90%",
		willChange: "transform"
	}), Aa(e, K.to(e, {
		y: -26,
		rotationX: 14,
		rotationY: -10,
		scale: 1.05,
		duration: t,
		ease: R
	}));
}
//#endregion
//#region src/table/animations/drawSeatMotion.ts
var Ra = /* @__PURE__ */ new Set();
function za(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function Ba() {
	for (let e of Ra) e.kill();
	Ra.clear();
}
function Va(e) {
	let t = document.createElement("div");
	return t.className = "draw-receive-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function Ha(e, t, n, r = {}) {
	fa(n);
	let i = ce(), a = se(ae.drawReceive, i), o = i ? .04 : ae.drawReceiveStagger, s = [];
	for (let r = 0; r < t.length; r++) {
		let t = Va(e);
		n.appendChild(t), s.push(t);
	}
	let c = K.timeline({ onComplete: () => {
		for (let e of s) e.remove();
		Ra.delete(c), window.clearTimeout(u), r.onComplete?.();
	} });
	Ra.add(c);
	let l = Math.round((s.length > 0 ? (s.length - 1) * o : 0) * 1e3 + a * 1e3 + 40), u = window.setTimeout(() => {
		c.progress() < 1 && c.progress(1);
	}, Math.min(680, Math.max(320, l)));
	return c.eventCallback("onInterrupt", () => {
		for (let e of s) e.remove();
		Ra.delete(c), window.clearTimeout(u);
	}), s.forEach((e, n) => {
		let r = t[n], s = ca(e), l = r.left + r.width / 2, u = r.top + r.height / 2, d = s.left + s.width / 2, f = s.top + s.height / 2, p = l - d, m = u - f, { midX: h, midY: g } = za(p, m);
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
			ease: ie
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
function Ua(e) {
	let { playerId: t, replaceCount: n, root: r, onComplete: i } = e;
	if (n <= 0) {
		i?.();
		return;
	}
	let a = ka(r), o = Ea(t, n, r);
	if (!a || !o.length) {
		i?.();
		return;
	}
	Ha(a, o, r, { onComplete: i });
}
//#endregion
//#region src/table/hooks/useDiscardPileState.ts
function Wa({ handNumber: e, sessionPhase: t }) {
	let [n, r] = (0, _.useState)([]), i = (0, _.useRef)(0), a = (0, _.useRef)(e), o = (0, _.useRef)(t ?? null);
	return (0, _.useEffect)(() => {
		a.current !== e && (a.current = e, i.current = 0, Sa(), Ba(), r([]));
	}, [e]), (0, _.useEffect)(() => {
		let e = t ?? null, n = o.current;
		o.current = e, n === "draw" && e === "play" && (Sa(), Ba(), r([]));
	}, [t]), {
		cards: n,
		pileIndexRef: i,
		commitDiscardCards: (0, _.useCallback)((t) => {
			if (!t.length) return;
			let n = t.map((t) => ga({
				id: t.id,
				playerId: t.playerId,
				handNumber: e,
				pileIndex: i.current++
			}));
			r((e) => [...e, ...n]);
		}, [e])
	};
}
function Ga({ cardElements: e, cardKeys: t, playerId: n, pileStartIndex: r, root: i, onComplete: a }) {
	let o = [];
	wa(e, t, r, {
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
function Ka({ playerId: e, handNumber: t, discardCount: n, pileStartIndex: r, root: i, onComplete: a }) {
	let o = _a({
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
	let s = Ea(e, n, i);
	if (!s.length) {
		a(o.map((t) => ({
			id: t,
			playerId: e
		})));
		return;
	}
	Ta(s, o, r, i, { onComplete: () => a(o.map((t) => ({
		id: t,
		playerId: e
	}))) });
}
function qa(e, t) {
	return t.map((t) => {
		let n = e[t];
		return n ? `${n.rank}-${n.suit}` : `idx-${t}`;
	});
}
function Ja(e, t) {
	if (!e) return [];
	let n = [...e.querySelectorAll(".hand__slot .pcard")];
	return t.length > 0 ? t.map((e) => n[e]).filter((e) => !!e) : [...e.querySelectorAll(".hand__slot--draw-selected .pcard, .hand__slot--draw-recommended .pcard")];
}
//#endregion
//#region src/table/animations/useHeroCardMotion.ts
function Ya(e) {
	return `${e.rank}-${e.suit}`;
}
function Xa(e) {
	return e ? [...e.querySelectorAll(".hand__slot .pcard")] : [];
}
function Za(e, { dealing: t, dealStaggerMs: n, drawAnimSubPhase: r, drawDiscardCount: i = 0, drawReplaceCount: a = 0, pendingDiscardIndices: o, standPatPulse: s, foldOutPulse: c, playingIndex: l, cards: u, handNumber: d = 0, playerId: f = null, tableRootRef: p, pileIndexRef: m, onDiscardCommitted: h, skipHeroDealMotion: g = !1 }) {
	let v = (0, _.useRef)([]), y = (0, _.useRef)(!1), b = (0, _.useRef)(null), x = (0, _.useRef)(null);
	(0, _.useLayoutEffect)(() => {
		fa(e.current?.closest(".btable-wrap") ?? document);
	}, [e]), (0, _.useLayoutEffect)(() => {
		if (g) {
			y.current = !0;
			return;
		}
		if (!t || u.length === 0) {
			y.current = !1;
			return;
		}
		if (y.current) return;
		let r = e.current, i = Xa(r);
		if (!i.length) return;
		y.current = !0;
		let a = ka(r ?? document);
		a && Na(i, a, Math.max(.04, n / 1e3));
	}, [
		t,
		u.length,
		n,
		e,
		g
	]), (0, _.useLayoutEffect)(() => {
		if (r === "discard") {
			if (i <= 0) return;
			v.current = u.map(Ya);
			let t = e.current, n = p?.current ?? t?.closest(".btable-wrap"), r = Ja(t, o);
			if (!r.length || !n || !f) return;
			let a = `${d}:${f}:discard:${r.length}:${o.join(",")}`;
			if (x.current === a) return;
			x.current = a, Ga({
				cardElements: r,
				cardKeys: qa(u, o.length ? o : r.map((e, t) => t)),
				playerId: f,
				pileStartIndex: m?.current ?? 0,
				root: n,
				onComplete: (e) => {
					m && (m.current += e.length), h?.(e);
				}
			});
			return;
		}
		if (r === "receive") {
			if (a <= 0) return;
			x.current = null;
			let t = e.current, n = Xa(t), r = new Set(v.current), i = u.map((e, t) => ({
				key: Ya(e),
				el: n[t]
			})).filter((e) => !!e.el && !r.has(e.key)).map((e) => e.el), o = ka(t ?? document);
			i.length && o && Pa(i, o);
			return;
		}
		(r === "done" || r === null) && (x.current = null, v.current = u.map(Ya));
	}, [
		r,
		i,
		a,
		u,
		o,
		e,
		d,
		f,
		p,
		m,
		h,
		g
	]), (0, _.useLayoutEffect)(() => {
		if (!s) return;
		let t = Xa(e.current);
		t.length && Fa(t);
	}, [s, e]), (0, _.useLayoutEffect)(() => {
		if (!c) return;
		let t = Xa(e.current);
		t.length && Ia(t);
	}, [c, e]), (0, _.useLayoutEffect)(() => {
		let t = e.current, n = Xa(t);
		if (l === null) {
			if (b.current !== null) {
				let e = n[b.current];
				e && ja(e), b.current = null;
			}
			return;
		}
		if (b.current === l) return;
		if (b.current !== null) {
			let e = n[b.current];
			e && ja(e);
		}
		let r = n[l];
		r && (La(r), b.current = l);
	}, [
		l,
		u,
		e
	]), (0, _.useLayoutEffect)(() => () => {
		for (let t of Xa(e.current)) ja(t);
	}, [e]);
}
function Qa(e, t) {
	let n = t / 1e3, r = Math.max(e - 1, 0) * n;
	return Math.round((r + ae.deal) * 1e3);
}
//#endregion
//#region src/table/handUi.ts
function $a(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function eo(e, t) {
	if (t) return "Join hand";
	switch (e) {
		case "reveal": return "Deal";
		case "decision": return "Join hand";
		case "draw": return "Draw";
		case "play": return "Play card";
		default: return "Waiting";
	}
}
function to(e, t) {
	return t || e === "decision" ? "Tap I'm in or Pass at your seat" : e === "draw" ? "Choose cards to discard, then tap Draw" : e === "play" ? "Tap a card to play" : null;
}
function no(e) {
	return e.handComplete ? "Hand result — next hand coming up" : !e.cardsDealt && !e.enrollmentActive || e.isMyTurn ? null : e.enrollmentActive || e.phase === "decision" || e.phase === "draw" || e.phase === "play" || e.phase === "reveal" ? "Waiting for other players" : null;
}
function ro(e) {
	return {
		spades: "Spades",
		hearts: "Hearts",
		diamonds: "Diamonds",
		clubs: "Clubs"
	}[e ?? ""] ?? e ?? "—";
}
function io(e) {
	return e === "reveal" || e === "decision" || e === "draw" || e === "play";
}
function ao(e) {
	return e === "decision";
}
function q(e) {
	return e === "reveal";
}
function oo(e, t) {
	if (!e) return null;
	let n = t.find((t) => t.playerId === e);
	return n ? n.isSelf ? "Your turn" : `${n.displayName}'s turn` : null;
}
//#endregion
//#region src/table/trickPlayFly.ts
var so = /* @__PURE__ */ new Map(), co = /* @__PURE__ */ new Map();
function lo(e) {
	return `${e.playerId}:${e.card.rank}:${e.card.suit}`;
}
function uo(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function fo(e) {
	return document.querySelector(`[data-seat-play-origin="${e}"]`);
}
function po(e) {
	let t = fo(e);
	return t ? uo(t) : null;
}
function mo(e) {
	return document.querySelector(`[data-trick-play-origin-active="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin-active="${e}"]`) ?? document.querySelector(`[data-trick-play-origin="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin="${e}"]`) ?? fo(e);
}
function ho(e) {
	let t = mo(e);
	return t ? uo(t) : null;
}
function go(e) {
	let t = ho(e);
	if (t) return co.set(e, t), t;
	let n = po(e);
	return n ? (co.set(e, n), n) : null;
}
function _o(e) {
	for (let t of e) go(t);
}
function vo(e) {
	return co.get(e);
}
function yo(e, t) {
	if (t) {
		let e = so.get(t);
		if (e) return e;
	}
	return vo(e) ?? ho(e) ?? po(e) ?? null;
}
function bo(e, t) {
	let n = yo(e, t);
	return n && so.set(t, n), n;
}
function xo(e, t, n) {
	let r = document.querySelector("[data-testid=\"hero-hand\"]")?.querySelectorAll(".hand__slot .pcard")[n];
	if (r) {
		let n = uo(r);
		return so.set(t, n), co.set(e, n), n;
	}
	return bo(e, t);
}
function So(e, t, n) {
	let r = e.left + e.width / 2, i = e.top + e.height / 2, a = n.left + n.width / 2, o = n.top + n.height / 2;
	return {
		dx: r - a,
		dy: i - o
	};
}
function Co() {
	so.clear(), co.clear();
}
//#endregion
//#region src/table/tableMicrointeractions.ts
var wo = {
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
}, To = {
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
function Eo(e) {
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
function Do(e, t) {
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
var Oo = "nbl-best-play";
function ko() {
	try {
		return localStorage.getItem(Oo) === "1";
	} catch {
		return !1;
	}
}
function Ao(e) {
	try {
		localStorage.setItem(Oo, e ? "1" : "0");
	} catch {}
}
//#endregion
//#region src/game/playerOrder.ts
function jo(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function Mo(e, t, n) {
	let r = jo(e, n), i = new Set(t);
	return r.filter((e) => i.has(e));
}
//#endregion
//#region src/game/types.ts
var No = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
};
function Po(e) {
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
function Fo(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/playContext.ts
function Io(e, t) {
	let n = P(e, t);
	return n.length ? n.reduce((e, t) => M(t) >= M(e) ? t : e) : null;
}
function Lo(e) {
	if (!e.cinchEnabled) return !1;
	let t = P(e.hand, e.trumpSuit);
	return t.filter((e) => M(e) >= 13).length >= 3 && t.length > 0;
}
function Ro(e, t) {
	let n = Io(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function zo(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => Fo([e.card])[0]) : [];
}
function Bo(e) {
	let t = e.currentTrick ?? null, n = zo(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function Vo(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = Bo(e.publicHand);
	return {
		hand: e.hand,
		trumpSuit: e.publicHand.trumpSuit,
		leadSuit: r,
		trickPlays: t,
		isLeading: n,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	};
}
function Ho(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return Lo(e) && !Ro(n, e) ? {
		allowed: !1,
		reason: "Cinch: play your highest trump",
		code: "CINCH_HIGHEST_TRUMP"
	} : { allowed: !0 };
	let r = e.leadSuit ?? e.trickPlays[0]?.suit;
	return r ? P(e.hand, r).length > 0 ? n.suit === r ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must follow suit",
		code: "MUST_FOLLOW_SUIT"
	} : P(e.hand, e.trumpSuit).length > 0 ? N(n, e.trumpSuit) ? { allowed: !0 } : {
		allowed: !1,
		reason: "You must play a trump when void in the led suit",
		code: "MUST_TRUMP"
	} : { allowed: !0 } : { allowed: !0 };
}
function Uo(e, t, n, r) {
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
function Wo(e, t, n) {
	let r = e.filter((e) => !N(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => M(t) > M(e) ? t : e) : null;
}
function Go(e, t) {
	let n = e.filter((e) => N(e, t));
	return n.length ? n.reduce((e, t) => M(t) > M(e) ? t : e) : null;
}
function Ko(e, t) {
	return M(e) > M(t);
}
function qo(e) {
	return {
		hand: e.hand,
		trumpSuit: e.trumpSuit,
		leadSuit: e.leadSuit,
		trickPlays: e.trickPlays,
		isLeading: e.isLeading,
		cinchEnabled: e.cinchEnabled
	};
}
function Jo(e, t = {}) {
	let n = qo(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = Ho(n, r);
			i.allowed ? e.push(r) : Uo(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? P(n.hand, r) : [], a = P(n.hand, n.trumpSuit), o = r ? Wo(n.trickPlays, r, n.trumpSuit) : null, s = Go(n.trickPlays, n.trumpSuit), c;
	if (i.length > 0) {
		if (c = i, !s && o) {
			let e = i.filter((e) => Ko(e, o));
			e.length && (c = e);
		}
	} else if (a.length > 0) {
		if (c = a, s) {
			let e = a.filter((e) => Ko(e, s));
			e.length && (c = e);
		}
	} else c = [...n.hand];
	let l = [];
	for (let e = 0; e < n.hand.length; e += 1) c.some((t) => t.rank === n.hand[e].rank && t.suit === n.hand[e].suit) && l.push(e);
	return l;
}
//#endregion
//#region src/game/trick.ts
function Yo(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => N(e.card, n));
	if (r.length) return r.reduce((e, t) => M(t.card) > M(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => M(t.card) > M(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
function Xo(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: M(e),
		trump: N(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function Zo(e, t) {
	let n = Jo(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => M(e[n]) > M(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => M(e[n]) < M(e[t]) ? n : t);
	let i = n.filter((n) => Yo([...t.trickPlays.map((e, t) => ({
		playerId: `_${t}`,
		card: e
	})), {
		playerId: "_bot",
		card: e[n]
	}], r, t.trumpSuit) === "_bot");
	return (i.length ? i : n).reduce((t, n) => M(e[n]) < M(e[t]) ? n : t);
}
//#endregion
//#region src/table/heroHandPlayPreselect.ts
function Qo(e, t) {
	return t ? t.includes(e) : !0;
}
function $o(e, t, n) {
	if (!n?.length || !e.length) return null;
	let r = Zo(e, Vo({
		hand: e,
		publicHand: t
	}));
	return n.includes(r) ? r : n[0] ?? null;
}
function es(e, t, n, r = Infinity, i = []) {
	if (!e.length || n <= 0) return [];
	let a = new Set(i), o = e.map((e, t) => t).filter((e) => !a.has(e)).filter((n) => !N(e[n], t)).filter((t) => e[t].rank !== "A");
	return o.length ? Xo(o.map((t) => e[t]), t, n, r).map((e) => o[e]) : [];
}
function ts(e) {
	let t = [...e.selectedDraw].sort((e, t) => e - t);
	return e.drawSelectionTouched || t.length > 0 ? t : e.bestPlayEnabled ? [...e.recommendedDiscardIndices].sort((e, t) => e - t) : [];
}
//#endregion
//#region src/table/feedback/soundPacks.ts
var ns = {
	classic: "Classic",
	wood: "Wood & Felt",
	arcade: "Arcade"
}, rs = "classic", is = {
	classic: "",
	wood: "packs/wood/",
	arcade: "packs/arcade/"
}, as = {
	shuffle: "shuffle.mp3",
	draw: "draw.mp3",
	trickWin: "trick-win.mp3",
	bigWin: "big-win.mp3",
	bourre: "bourre.mp3",
	gameStart: "game-start.mp3"
};
function os(e, t) {
	return `./sounds/${is[e] ?? ""}${as[t]}`;
}
function ss(e) {
	return Object.keys(as).map((t) => os(e, t));
}
function cs(e) {
	return e === "wood" || e === "arcade" ? e : rs;
}
//#endregion
//#region src/table/feedback/prefs.ts
var ls = "nbl-feedback", us = {
	soundMode: "on",
	soundPackId: rs,
	hapticsMode: "on"
};
function ds(e) {
	if (!e || typeof e != "object") return { ...us };
	let t = e, n = t.hapticsMode, r = n === "off" || n === "minimal" || n === "on" ? n : t.hapticsEnabled === !1 ? "off" : "on", i;
	return i = t.soundMode === "on" || t.soundMode === "minimal" || t.soundMode === "off" ? t.soundMode : t.soundEnabled === !1 ? "off" : "on", {
		soundMode: i,
		soundPackId: cs(t.soundPackId),
		hapticsMode: r
	};
}
function fs() {
	try {
		let e = localStorage.getItem(ls);
		return e ? ds(JSON.parse(e)) : { ...us };
	} catch {
		return { ...us };
	}
}
function ps(e) {
	let t = {
		...fs(),
		...e
	};
	try {
		localStorage.setItem(ls, JSON.stringify(t));
	} catch {}
	return _s(t), t;
}
function ms(e, t) {
	return e === "off" ? !1 : e === "on" ? !0 : t === "trickWin" || t === "bigWin" || t === "bourre";
}
var hs = /* @__PURE__ */ new Set();
function gs(e) {
	return hs.add(e), () => hs.delete(e);
}
function _s(e) {
	for (let t of hs) t(e);
}
function vs() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function ys(e, t) {
	return !(e === "off" || e === "minimal" && t === "light" || vs() && t === "light");
}
//#endregion
//#region src/table/feedback/audio.ts
var bs = null, J = null, xs = !1, Ss = /* @__PURE__ */ new Map(), Cs = /* @__PURE__ */ new Map();
function ws() {
	return fs().soundPackId;
}
function Ts() {
	if (typeof window > "u") return null;
	try {
		let e = window.AudioContext ?? window.webkitAudioContext;
		return e ? (bs || (bs = new e(), J = bs.createGain(), J.gain.value = .55, J.connect(bs.destination)), bs) : null;
	} catch {
		return null;
	}
}
async function Es() {
	xs = !0;
	let e = Ts();
	if (e) {
		if (e.state === "suspended") try {
			await e.resume();
		} catch {}
		ks();
	}
}
function Ds(e) {
	if (typeof window > "u") return null;
	try {
		let t = Ss.get(e);
		return t || (t = new Audio(e), t.preload = "auto", Ss.set(e, t)), t;
	} catch {
		return null;
	}
}
async function Os(e) {
	if (Cs.has(e)) return Cs.get(e) === !0;
	if (typeof window > "u") return !1;
	try {
		let t = (await fetch(e, { method: "HEAD" })).ok;
		return Cs.set(e, t), t;
	} catch {
		return Cs.set(e, !1), !1;
	}
}
async function ks(e) {
	if (!xs) return;
	let t = e ?? ws();
	await Promise.all(ss(t).map(async (e) => {
		if (!await Os(e)) return;
		let t = Ds(e);
		if (t) try {
			t.load();
		} catch {}
	}));
}
async function As(e, t = .55) {
	if (!xs || !await Os(e)) return !1;
	let n = Ds(e);
	if (!n) return !1;
	try {
		return n.volume = t, n.currentTime = 0, await n.play(), !0;
	} catch {
		return !1;
	}
}
function js(e, t, n, r, i, a, o = "sine") {
	let s = e.createOscillator(), c = e.createGain();
	s.type = o, s.frequency.setValueAtTime(n, r), c.gain.setValueAtTime(1e-4, r), c.gain.exponentialRampToValueAtTime(a, r + .008), c.gain.exponentialRampToValueAtTime(1e-4, r + i), s.connect(c), c.connect(t), s.start(r), s.stop(r + i + .02);
}
function Ms(e, t, n, r, i, a = 1400) {
	let o = Math.max(256, Math.floor(e.sampleRate * r)), s = e.createBuffer(1, o, e.sampleRate), c = s.getChannelData(0);
	for (let e = 0; e < o; e += 1) c[e] = (Math.random() * 2 - 1) * (1 - e / o);
	let l = e.createBufferSource();
	l.buffer = s;
	let u = e.createBiquadFilter();
	u.type = "bandpass", u.frequency.value = a, u.Q.value = .6;
	let d = e.createGain();
	d.gain.setValueAtTime(i, n), d.gain.exponentialRampToValueAtTime(1e-4, n + r), l.connect(u), u.connect(d), d.connect(t), l.start(n), l.stop(n + r + .01);
}
function Ns(e) {
	let t = Ts();
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
	for (let e of r) Ms(t, J, n + e, .05, .08 + Math.random() * .04, i);
}
function Ps(e) {
	let t = Ts();
	if (!t || !J) return;
	let n = t.currentTime;
	Ms(t, J, n, .04, .06, e === "wood" ? 700 : 1200), js(t, J, e === "arcade" ? 660 : 520, n + .05, .08, .05, "triangle");
}
function Fs(e) {
	let t = Ts();
	if (!t || !J) return;
	let n = t.currentTime;
	if (e === "arcade") {
		js(t, J, 1046.5, n, .1, .1, "square"), js(t, J, 1318.51, n + .08, .14, .08, "square");
		return;
	}
	let r = e === "wood" ? 740 : 880;
	js(t, J, r, n, .12, .09, "sine"), js(t, J, r * 1.335, n + .07, .16, .07, "triangle"), js(t, J, r * 2, n + .14, .1, .04, "sine");
}
function Is(e) {
	let t = Ts();
	if (!t || !J) return;
	let n = t.currentTime;
	if (e === "arcade") {
		js(t, J, 523.25, n, .12, .09, "square"), js(t, J, 659.25, n + .1, .16, .1, "square"), js(t, J, 783.99, n + .22, .2, .1, "square"), js(t, J, 1046.5, n + .34, .24, .07, "square");
		return;
	}
	let r = e === "wood" ? .92 : 1;
	js(t, J, 659.25 * r, n, .14, .08, "sine"), js(t, J, 830.61 * r, n + .1, .18, .09, "triangle"), js(t, J, 987.77 * r, n + .22, .22, .1, "sine"), js(t, J, 1318.51 * r, n + .34, .28, .06, "triangle");
}
function Ls(e) {
	let t = Ts();
	if (!t || !J) return;
	let n = t.currentTime, r = e === "arcade" ? "sawtooth" : "triangle";
	js(t, J, e === "wood" ? 180 : 220, n, .28, .1, r), js(t, J, e === "wood" ? 140 : 165, n + .18, .32, .08, r);
}
function Rs(e) {
	let t = Ts();
	if (!t || !J) return;
	let n = t.currentTime;
	if (e === "arcade") {
		js(t, J, 440, n, .08, .07, "square"), js(t, J, 554.37, n + .1, .12, .08, "square");
		return;
	}
	js(t, J, e === "wood" ? 392 : 440, n, .1, .07, "sine"), js(t, J, e === "wood" ? 523.25 : 554.37, n + .12, .16, .08, "triangle");
}
var zs = {
	shuffle: Ns,
	draw: Ps,
	trickWin: Fs,
	bigWin: Is,
	bourre: Ls,
	gameStart: Rs
}, Bs = {
	shuffle: { current: !1 },
	draw: { current: !1 },
	trickWin: { current: !1 },
	bigWin: { current: !1 },
	bourre: { current: !1 },
	gameStart: { current: !1 }
}, Vs = {
	shuffle: 360,
	draw: 280,
	trickWin: 320,
	bigWin: 580,
	bourre: 520,
	gameStart: 320
}, Hs = {
	shuffle: .55,
	draw: .45,
	trickWin: .55,
	bigWin: .6,
	bourre: .5,
	gameStart: .42
};
async function Us(e) {
	let t = Bs[e];
	if (t.current) return;
	t.current = !0;
	let n = ws(), r = os(n, e);
	try {
		!await As(r, Hs[e]) && xs && zs[e](n);
	} catch {} finally {
		window.setTimeout(() => {
			t.current = !1;
		}, Vs[e]);
	}
}
function Ws() {
	Us("shuffle");
}
function Gs() {
	Us("draw");
}
function Ks() {
	Us("trickWin");
}
function qs() {
	Us("bigWin");
}
function Js() {
	Us("bourre");
}
function Ys() {
	Us("gameStart");
}
function Xs() {
	return typeof window < "u" && !!(window.AudioContext ?? window.webkitAudioContext ?? typeof Audio < "u");
}
function Zs() {
	Cs.clear();
}
//#endregion
//#region src/table/feedback/haptics.ts
function Qs() {
	return typeof navigator < "u" && typeof navigator.vibrate == "function";
}
function $s(e) {
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
var ec = {
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
function tc(e) {
	try {
		return $s(e) ? !0 : Qs() ? navigator.vibrate(ec[e]) ?? !1 : !1;
	} catch {
		return !1;
	}
}
function nc() {
	return Qs() || !!(typeof window < "u" && window.BourreHaptics);
}
var rc = 700, ic = 500, ac = 450, oc = 1200, sc = 2e3, cc = 1500, lc = 280, uc = 0, dc = 0, fc = 0, pc = 0, mc = 0, hc = 0, gc = 0, _c = null, vc = !1;
function yc() {
	return fs();
}
function bc(e) {
	ys(yc().hapticsMode, e) && tc(e);
}
function xc(e, t) {
	ms(yc().soundMode, e) && t();
}
function Sc() {
	if (vc || typeof window > "u") return;
	vc = !0;
	let e = () => {
		Es();
	};
	window.addEventListener("pointerdown", e, {
		once: !0,
		passive: !0
	}), window.addEventListener("keydown", e, { once: !0 });
}
function Cc(e = {}) {
	if (Date.now() - uc < rc) return;
	_c &&= (clearTimeout(_c), null);
	let t = e.delayMs ?? (vs() ? 0 : 40);
	_c = window.setTimeout(() => {
		_c = null, uc = Date.now(), xc("shuffle", Ws), bc("light");
	}, t);
}
function wc() {
	let e = Date.now();
	e - dc < ic || (dc = e, xc("draw", Gs), bc("light"));
}
function Tc() {
	let e = Date.now();
	e - fc < ac || (fc = e, xc("trickWin", Ks), bc("medium"));
}
function Ec() {
	let e = Date.now();
	e - pc < oc || (pc = e, xc("bigWin", qs), bc("strong"));
}
function Dc() {
	let e = Date.now();
	e - mc < sc || (mc = e, xc("bourre", Js), bc("medium"));
}
function Oc() {
	let e = Date.now();
	e - hc < cc || (hc = e, xc("gameStart", Ys), bc("light"));
}
function kc() {
	let e = Date.now();
	e - gc < lc || (gc = e, bc("light"));
}
function Ac() {
	bc("light");
}
//#endregion
//#region src/table/actionErrorCopy.ts
function jc(e) {
	let t = String(e ?? "").trim();
	if (!t) return null;
	let n = t.toLowerCase();
	return n === "internal" || n.includes("internal error") ? "The server could not finish that table action. Refresh the page and try again." : t;
}
//#endregion
//#region src/table/theme/cardPacks.ts
var Mc = "classic";
function Nc(e) {
	return e === "elegant" || e === "casino" || e === "midnight" ? e : Mc;
}
//#endregion
//#region src/table/theme/settings.ts
var Pc = "nbl-table-settings", Fc = {
	focusTable: "F",
	toggleSettings: ",",
	standPat: "P",
	nextTable: "Tab"
}, Ic = {
	classic: "Classic",
	elegant: "Elegant",
	casino: "Casino",
	midnight: "Midnight"
}, Lc = {
	themeId: "night-felt",
	cardPackId: Mc,
	deckMode: "classic",
	cardScale: "md",
	highContrast: !1,
	tableScale: 1,
	layoutMode: "single",
	hotkeys: { ...Fc }
}, Rc = {
	carbon: "Carbon",
	simple: "Simple",
	"night-felt": "Night Felt",
	arena: "Arena"
};
function zc(e) {
	return Math.max(.85, Math.min(1.35, e));
}
function Bc() {
	try {
		let e = localStorage.getItem(Pc);
		if (!e) return {
			...Lc,
			hotkeys: { ...Fc }
		};
		let t = JSON.parse(e);
		return {
			...Lc,
			...t,
			cardPackId: Nc(t.cardPackId),
			tableScale: zc(t.tableScale ?? Lc.tableScale),
			hotkeys: {
				...Fc,
				...t.hotkeys
			}
		};
	} catch {
		return {
			...Lc,
			hotkeys: { ...Fc }
		};
	}
}
function Vc(e) {
	try {
		localStorage.setItem(Pc, JSON.stringify(e));
	} catch {}
}
function Hc(e, t) {
	e.dataset.tableTheme = t.themeId, e.dataset.cardPack = t.cardPackId, e.dataset.deckMode = t.deckMode, e.dataset.cardScale = t.cardScale, e.dataset.highContrast = t.highContrast ? "true" : "false", e.dataset.layoutMode = t.layoutMode, e.style.setProperty("--table-scale", String(t.tableScale));
}
//#endregion
//#region src/table/theme/TableThemeContext.tsx
var Uc = (0, _.createContext)(null);
function Wc({ settings: e, children: t }) {
	let n = (0, _.useRef)(null);
	return (0, _.useEffect)(() => {
		n.current && Hc(n.current, e);
	}, [e]), /* @__PURE__ */ (0, w.jsx)("div", {
		ref: n,
		className: "btable-room",
		children: t
	});
}
function Gc({ children: e }) {
	let [t, n] = (0, _.useState)(() => Bc()), r = (0, _.useCallback)((e) => {
		n((t) => {
			let n = {
				...t,
				...e,
				hotkeys: {
					...t.hotkeys,
					...e.hotkeys
				}
			};
			return Vc(n), n;
		});
	}, []), i = (0, _.useCallback)(() => {
		let e = {
			...Lc,
			hotkeys: { ...Lc.hotkeys }
		};
		Vc(e), n(e);
	}, []), a = (0, _.useMemo)(() => ({
		settings: t,
		updateSettings: r,
		resetSettings: i
	}), [
		t,
		r,
		i
	]);
	return /* @__PURE__ */ (0, w.jsx)(Uc.Provider, {
		value: a,
		children: /* @__PURE__ */ (0, w.jsx)(Wc, {
			settings: t,
			children: e
		})
	});
}
//#endregion
//#region src/table/theme/useTableTheme.ts
function Kc() {
	let e = (0, _.useContext)(Uc);
	if (!e) throw Error("useTableTheme must be used within TableThemeProvider");
	return e;
}
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
	return /* @__PURE__ */ (0, w.jsx)("div", {
		className: `btable-hero btable-hero--bare btable-hero--reserved ${e}`.trim(),
		"aria-hidden": "true",
		"data-testid": "hero-hand"
	});
}
function Yc({ cards: e, phase: t, enrollmentActive: n = !1, isInHand: r = !1, isDealer: i = !1, signedIn: a = !1, isMyTurn: o = !1, drawCompleted: s = !1, maxDrawDiscards: c = 4, legalPlayIndices: l, recommendedPlayIndex: u = null, recommendedDiscardIndices: d = [], handComplete: f = !1, actionFeedback: p, onSubmitDraw: m, onPassDraw: h, onFoldDraw: g, onPlayCard: v, privateHandReady: y = !1, className: b = "", dealStaggerMs: x = 120, drawAnimSubPhase: S = null, drawDiscardCount: C = 0, drawReplaceCount: T = 0, currentUserId: E = null, revealedTrumpIndex: D = null, trumpMergeActive: O = !1, trumpDisabledIndex: k = null, handNumber: ee = 0, tableRootRef: A, pileIndexRef: te, onDiscardCommitted: j, onUserActivity: M, skipHeroDealMotion: N = !1 }) {
	let { settings: P } = Kc(), [F, ne] = (0, _.useState)(/* @__PURE__ */ new Set()), [I, L] = (0, _.useState)(null), [R, z] = (0, _.useState)(null), [ie, ae] = (0, _.useState)(null), [oe, se] = (0, _.useState)(!1), [ce, le] = (0, _.useState)(null), [ue, de] = (0, _.useState)(null), [fe, pe] = (0, _.useState)(null), [B, me] = (0, _.useState)(() => ko()), [he, ge] = (0, _.useState)(!1), [_e, ve] = (0, _.useState)(!1), [ye, be] = (0, _.useState)(!1), [xe, Se] = (0, _.useState)([]), V = (0, _.useRef)(/* @__PURE__ */ new Set()), Ce = (0, _.useRef)(null), we = (0, _.useRef)(!1), Te = (0, _.useRef)(null), Ee = (0, _.useRef)(null), [De, Oe] = (0, _.useState)(!1), ke = (0, _.useRef)(async () => {}), Ae = io(t), je = (0, _.useMemo)(() => e.map($a), [e]), Me = (0, _.useMemo)(() => e.map((e) => `${e.rank}-${e.suit}`).join("|"), [e]), Ne = (0, _.useMemo)(() => d.slice().sort((e, t) => e - t).join(","), [d]), H = t === "draw", Pe = t === "play", Fe = (0, _.useCallback)((e, t) => D === t ? O ? "hand__slot--trump-merge-target" : "hand__slot--trump-revealed" : "", [D, O]);
	(0, _.useEffect)(() => {
		if (N || !Ae || e.length === 0) return;
		let t = new Set(e.map((e) => `${e.rank}-${e.suit}`)), n = V.current, r = [...t].some((e) => !n.has(e));
		if (V.current = t, !r || n.size > 0) return;
		ge(!0), z(null), L(null);
		let i = Qa(e.length, x), a = window.setTimeout(() => ge(!1), i);
		return () => window.clearTimeout(a);
	}, [
		e,
		Ae,
		x,
		N
	]), (0, _.useEffect)(() => {
		(S === "done" || S === null) && Se([]);
	}, [S]), Za(Ce, {
		dealing: he,
		dealStaggerMs: x,
		drawAnimSubPhase: S,
		drawDiscardCount: C,
		drawReplaceCount: T,
		pendingDiscardIndices: xe,
		standPatPulse: _e,
		foldOutPulse: ye,
		playingIndex: R,
		cards: e,
		handNumber: ee,
		playerId: E,
		tableRootRef: A,
		pileIndexRef: te,
		onDiscardCommitted: j,
		skipHeroDealMotion: N
	});
	let Ie = (0, _.useCallback)(() => {
		Te.current != null && (window.clearTimeout(Te.current), Te.current = null), Ee.current = null;
	}, []);
	(0, _.useEffect)(() => () => Ie(), [Ie]), (0, _.useEffect)(() => {
		Ie(), L(null), ne(/* @__PURE__ */ new Set()), Oe(!1), ae(null), de(null), pe(null), le(null);
	}, [
		t,
		Me,
		Ie
	]), (0, _.useEffect)(() => {
		I !== null && (Qo(I, l) || (L(null), Ee.current = null, Ie()));
	}, [
		l,
		I,
		Ie
	]);
	let Le = oe || p?.status === "loading" || R !== null;
	(0, _.useEffect)(() => {
		!B || !H || s || De || ne(new Set(d));
	}, [
		B,
		H,
		s,
		De,
		Ne,
		d
	]), (0, _.useEffect)(() => {
		if (!(!Pe || !o || I === null || we.current || Le)) {
			if (!Qo(I, l)) {
				L(null), Ee.current = null;
				return;
			}
			Te.current ??= (Ee.current = I, window.setTimeout(() => {
				Te.current = null;
				let e = Ee.current;
				Ee.current = null, e !== null && !we.current && ke.current(e);
			}, wo.autoPlayPreselect));
		}
	}, [
		Pe,
		o,
		I,
		l,
		Le
	]), (0, _.useEffect)(() => {
		(p?.status === "success" || p?.status === "error") && (z(null), L(null), Ie(), we.current = !1);
	}, [p?.status, Ie]);
	let Re = (0, _.useRef)(void 0);
	(0, _.useEffect)(() => {
		let e = p?.status, t = Re.current;
		Re.current = e, t === "error" && e !== "error" && le(null);
	}, [p?.status]);
	let ze = P.cardScale === "lg" ? "md" : "sm", Be = jc(p?.status === "error" ? p.message : ce), Ve = eo(t, n);
	(0, _.useEffect)(() => {
		M && H && F.size > 0 && M();
	}, [
		H,
		F.size,
		M
	]), (0, _.useEffect)(() => {
		M && Pe && I !== null && M();
	}, [
		Pe,
		I,
		M
	]);
	let He = (0, _.useCallback)(() => {
		M?.();
	}, [M]), Ue = (0, _.useCallback)((e) => {
		Le || k === e || (Oe(!0), He(), le(null), ne((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.size < c ? n.add(e) : le(`You may discard at most ${c} cards`), n;
		}));
	}, [
		Le,
		c,
		k,
		He
	]), We = (0, _.useCallback)(async (e) => {
		if (we.current || Le || !v || !Qo(e, l)) return;
		Ie(), we.current = !0, L(null), z(e), le(null);
		let t = je[e];
		E && t && xo(E, lo({
			playerId: E,
			card: {
				rank: String(t.rank),
				suit: String(t.suit)
			}
		}), e);
		try {
			await Promise.resolve(v(e)), z(null), we.current = !1;
		} catch {
			z(null), we.current = !1;
		}
	}, [
		Le,
		l,
		v,
		E,
		je,
		Ie
	]), Ge = (0, _.useCallback)((e) => {
		if (!(we.current || Le || !v || t !== "play")) {
			if (!Qo(e, l)) {
				o && (kc(), Ie(), L(null), de(e), pe(e), window.setTimeout(() => {
					de(null), pe(null);
				}, wo.illegalFlash), le("Illegal play"));
				return;
			}
			Ie(), L(e), le(null), He(), Ee.current = e, o && (Te.current = window.setTimeout(() => {
				Te.current = null;
				let t = Ee.current;
				Ee.current = null, t === e && !we.current && ke.current(e);
			}, wo.autoPlayPreselect));
		}
	}, [
		Le,
		Ie,
		o,
		l,
		v,
		t,
		He
	]);
	ke.current = We;
	let Ke = (0, _.useCallback)(async (e) => {
		if (!(!m || Le)) {
			if (He(), e.length > c) {
				le(`You may discard at most ${c} cards`);
				return;
			}
			se(!0), le(null), Se([...e]);
			try {
				await m(e), ne(/* @__PURE__ */ new Set());
			} catch {} finally {
				se(!1);
			}
		}
	}, [
		m,
		Le,
		c,
		He
	]), qe = (0, _.useCallback)(async () => {
		if (!(!h || Le)) {
			He(), se(!0), le(null);
			try {
				await h(), ne(/* @__PURE__ */ new Set()), ve(!0), window.setTimeout(() => ve(!1), 700);
			} catch {} finally {
				se(!1);
			}
		}
	}, [
		h,
		Le,
		He
	]), Je = (0, _.useCallback)(async () => {
		if (!(!g || Le)) {
			He(), be(!0), se(!0), le(null);
			try {
				await g(), ne(/* @__PURE__ */ new Set());
			} catch {
				be(!1);
			} finally {
				se(!1);
			}
		}
	}, [
		g,
		Le,
		He
	]), Ye = (0, _.useCallback)((e) => {
		kc(), Ie(), L(null), de(e), pe(e), window.setTimeout(() => {
			de(null), pe(null);
		}, wo.illegalFlash), le("Illegal play");
	}, [Ie]), Xe = (0, _.useCallback)((e) => {
		if (me(e), Ao(e), e) {
			Oe(!1), H && !s && ne(new Set(d));
			return;
		}
		De || ne(/* @__PURE__ */ new Set());
	}, [
		De,
		H,
		s,
		d
	]), Ze = a && r && (H || Pe), Qe = (0, _.useMemo)(() => ts({
		selectedDraw: F,
		drawSelectionTouched: De,
		bestPlayEnabled: B,
		recommendedDiscardIndices: d
	}), [
		F,
		De,
		B,
		Ne,
		d
	]), $e = () => Ze ? /* @__PURE__ */ (0, w.jsxs)("label", {
		className: "btable-hero__best-play",
		children: [/* @__PURE__ */ (0, w.jsx)("input", {
			type: "checkbox",
			className: "btable-hero__best-play-input",
			checked: B,
			onChange: (e) => Xe(e.target.checked),
			"data-testid": "best-play-checkbox"
		}), /* @__PURE__ */ (0, w.jsx)("span", {
			className: "btable-hero__best-play-label",
			children: "Best Play"
		})]
	}) : null;
	if (!a) return /* @__PURE__ */ (0, w.jsx)("div", {
		className: qc(P, b),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, w.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "Sign in to see your dealt cards."
		})
	});
	if (!r && !n && !Ae) return /* @__PURE__ */ (0, w.jsx)(Jc, { className: b });
	if (Ae && r && e.length === 0) return f && n ? /* @__PURE__ */ (0, w.jsx)(Jc, { className: b }) : /* @__PURE__ */ (0, w.jsxs)("div", {
		className: qc(P, b),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: [/* @__PURE__ */ (0, w.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: y ? "Cards not available — leave and re-open the session, or refresh the page." : "Loading your cards…"
		}), /* @__PURE__ */ (0, w.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: $e()
		})]
	});
	if (Ae && !r && (t === "draw" || t === "play")) return /* @__PURE__ */ (0, w.jsx)("div", {
		className: qc(P, b),
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, w.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "You sat out this hand."
		})
	});
	if (e.length === 0 && !i) return Ze ? /* @__PURE__ */ (0, w.jsx)("div", {
		className: qc(P, b, ["btable-hero--reserved"]),
		"data-testid": "hero-hand",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, w.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: $e()
		})
	}) : /* @__PURE__ */ (0, w.jsx)(Jc, { className: b });
	let et = Ze && Pe && B && I === null && u !== null && u >= 0, tt = (e, t) => D === t ? "trump" : k === t && (H || Pe) ? "muted" : R === t || fe === t || ue === t ? "default" : H && F.has(t) ? "draw-selected" : Pe && I === t ? "play-preselected" : et && u === t ? "play-recommended" : Pe && l && !l.includes(t) ? "muted" : "default", nt = Ae && r && !(Pe && o), rt = "none";
	Pe && r ? rt = "play" : H && r && !s ? rt = "draw-select" : nt && (rt = "peek");
	let it = Qe.length, at = H && !s && o;
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		className: qc(P, b, [
			he && !N ? "btable-hero--dealing" : "",
			D === null ? "" : "btable-hero--trump-reveal",
			O ? "btable-hero--trump-merge" : "",
			H && o && !s ? "btable-hero--draw-select" : "",
			S === "discard" && C > 0 ? "btable-hero--draw-discard" : "",
			S === "receive" && T > 0 ? "btable-hero--draw-receive" : "",
			at ? "btable-hero--draw-actions" : "",
			H && o && !s || Pe && o ? "btable-hero--your-turn" : "",
			(H || Pe) && r && !o ? "btable-hero--waiting-turn" : "",
			_e ? "btable-hero--stand-pat" : "",
			ye ? "btable-hero--fold-out" : ""
		]),
		style: { "--deal-card-stagger-ms": `${x}ms` },
		"data-testid": "hero-hand",
		"aria-label": `Your dealt cards — ${Ve}`,
		children: [
			/* @__PURE__ */ (0, w.jsxs)("p", {
				className: "btable-sr-only",
				"aria-live": "polite",
				children: [
					Ve,
					H && !s && o && " — tap cards to discard; red border marks your selection",
					Pe && o && " — tap a legal card to play",
					B && Pe && " — green outline marks Best Play suggestions"
				]
			}),
			/* @__PURE__ */ (0, w.jsxs)("div", {
				ref: Ce,
				className: "btable-hero__hand-3d",
				"data-trick-play-origin": E ?? void 0,
				"data-trick-play-origin-active": Pe && o && E ? E : void 0,
				children: [/* @__PURE__ */ (0, w.jsx)("div", {
					className: "btable-hero__hand-row",
					"data-hero-play-turn": Pe && o ? "true" : void 0,
					children: /* @__PURE__ */ (0, w.jsx)(re, {
						cards: je,
						size: ze,
						fan: !0,
						dealSeatPlayerId: E,
						stateFor: tt,
						slotClassFor: Fe,
						peekIndex: ie,
						onCardPeek: nt ? ae : void 0,
						cardTestId: Pe && o ? "play-button" : void 0,
						cardInteraction: {
							mode: rt,
							isMyTurn: o,
							legalPlayIndices: l,
							playingIndex: R,
							illegalShakeIndex: ue,
							illegalFlashIndex: fe,
							busy: Le,
							showPlayableHint: !1,
							allowPlayPreselect: Pe && r && !o,
							trickPlayOriginPlayerId: E,
							onPlayCard: Ge,
							onSelectCard: Ue,
							onIllegalPlay: Ye,
							onPeek: ae
						}
					})
				}), $e()]
			}),
			Pe && !o && I !== null && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-hero__hint",
				"data-testid": "play-preselect-hint",
				children: "Your selected card will play on your turn"
			}),
			Be && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-hero__error",
				role: "alert",
				children: Be
			}),
			/* @__PURE__ */ (0, w.jsx)("div", {
				className: "btable-hero__actions-slot",
				"aria-hidden": !at,
				children: at && /* @__PURE__ */ (0, w.jsxs)("div", {
					className: "btable-hero__actions btable-hero__actions--triple",
					children: [
						/* @__PURE__ */ (0, w.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--primary",
							"data-testid": "draw-button",
							disabled: Le,
							"aria-busy": Le,
							onClick: () => Ke(Qe),
							children: Le ? "Drawing…" : `Draw${it > 0 ? ` (${it})` : ""}`
						}),
						/* @__PURE__ */ (0, w.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--secondary-muted",
							"data-testid": "pass-draw-button",
							disabled: Le,
							onClick: () => qe(),
							children: "Stand pat"
						}),
						/* @__PURE__ */ (0, w.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--secondary-muted",
							"data-testid": "im-out-button",
							disabled: Le,
							onClick: () => Je(),
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
function Xc({ event: e, onDismiss: t }) {
	return (0, _.useEffect)(() => {
		let n = window.setTimeout(() => t(e.id), e.durationMs ?? 2e3);
		return () => window.clearTimeout(n);
	}, [
		e.id,
		e.durationMs,
		t
	]), /* @__PURE__ */ (0, w.jsxs)("div", {
		className: "bpot-brew",
		role: "status",
		"aria-live": "polite",
		"data-testid": "big-pot-brewing",
		children: [/* @__PURE__ */ (0, w.jsx)("div", {
			className: "bpot-brew__glow",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, w.jsxs)("div", {
			className: "bpot-brew__content",
			children: [
				e.emoji && /* @__PURE__ */ (0, w.jsx)("span", {
					className: "bpot-brew__emoji",
					children: e.emoji
				}),
				/* @__PURE__ */ (0, w.jsx)("p", {
					className: "bpot-brew__title",
					children: e.title
				}),
				e.subtitle && /* @__PURE__ */ (0, w.jsx)("p", {
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
var kl = 1850, Al = 2050, jl = 1080, Ml = 4e3;
function Nl(e) {
	return e !== "live";
}
function Pl(e = !1) {
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
function Fl(e) {
	let t = Pl(e.reducedMotion), n = e.trumpBeat ? t.trumpBeatReadMs : t.postTrickReadMs, r = Math.min(t.winnerRevealMs, n - 200), i = Math.max(200, n - r), a = t.trickSweepMs, o = t.nextLeadGapMs;
	return {
		readBeforeWinnerMs: i,
		winnerRevealMs: r,
		readTotalMs: n,
		sweepMs: a,
		nextLeadGapMs: o,
		pipelineMs: n + a + o
	};
}
function Il(e, t, n) {
	let r = n.length > 0 ? n : [...new Set([...Object.keys(e), ...Object.keys(t)])];
	for (let n of r) if ((t[n] ?? 0) > (e[n] ?? 0)) return n;
	return null;
}
function Ll(e, t, n) {
	return e.length > 0 ? e : [...new Set([...Object.keys(t), ...Object.keys(n)])];
}
function Y(e) {
	return e?.plays?.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
}
function X(e, t, n) {
	return e.length ? e.length === 1 ? e[0].playerId : !t || !n ? e[e.length - 1].playerId : Yo(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n) : null;
}
function Rl(e) {
	let t = Y(e.prevTrick), n = e.playedCards?.filter((t) => t.trickNumber === e.trickNumber).map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
	return n.length > t.length ? n : t;
}
function zl(e, t, n) {
	if (!e.length || !t || !n || t === n) return !1;
	let r = Yo(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n), i = e.find((e) => e.playerId === r);
	return !!(i && N({
		rank: i.card.rank,
		suit: i.card.suit
	}, n));
}
function Bl(e) {
	let { prevTricks: t, nextTricks: n, prevTrick: r, playedCards: i } = e, a = Ll(e.participantIds, t, n), o = ll(t, a), s = ll(n, a);
	if (s <= o) return null;
	let c = Il(t, n, a), l = r?.trickNumber ?? s, u = Rl({
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
function Vl() {
	return typeof window > "u" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region src/table/gameFlowDebug.ts
var Hl = "nbl-game-flow-debug", Ul = !1, Wl = null;
function Z() {
	if (Ul) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(Hl) === "1" ? !0 : new URLSearchParams(window.location.search).has("gameFlowDebug");
	} catch {
		return !1;
	}
}
function Gl(e, t, n) {
	if (!Z()) return;
	let r = `[nbl-flow ${typeof performance < "u" ? `${performance.now().toFixed(1)}ms` : ""}] ${e} :: ${t}`;
	if (Wl) {
		Wl(r.trim(), n);
		return;
	}
	console.info(r, n ?? "");
}
//#endregion
//#region src/table/TrickPlaySlot.tsx
function Kl(e, t, n, r, i) {
	r.current = !1, e(!0), t("static"), n(null), i && Z() && Gl("TrickPlaySlot", "fly-complete", i);
}
function ql({ play: e, index: t, presentationPhase: n, displayCount: r, playerName: i, leaderPlayerId: a = null, winnerPlayerId: o = null, instantPlace: s = !1 }) {
	let c = (0, _.useRef)(null), [l, u] = (0, _.useState)("static"), [d, f] = (0, _.useState)(null), [p, m] = (0, _.useState)(!1), h = (0, _.useRef)(!1), g = lo(e), v = a != null && e.playerId === a, y = o != null && e.playerId === o, b = n === "live", x = t === r - 1 && b, S = p, C = v && (n === "live" || n === "trickComplete"), E = C || y && n !== "live" && n !== "trickComplete";
	(0, _.useLayoutEffect)(() => {
		Z() && Gl("TrickPlaySlot", "play-enter", {
			playKey: g,
			index: t,
			instantPlace: s,
			isLanding: x
		}), m(!1), h.current = !1, u("static"), f(null);
	}, [g]), (0, _.useLayoutEffect)(() => {
		if (p) return;
		if (s || !b) {
			Kl(m, u, f, h, {
				playKey: g,
				index: t
			});
			return;
		}
		if (!x) {
			Kl(m, u, f, h, {
				playKey: g,
				index: t
			});
			return;
		}
		if (typeof document > "u") return;
		let n = c.current;
		if (!n) return;
		let r = n.querySelector(".pcard");
		if (!r) return;
		let i = yo(e.playerId, g);
		if (!i) {
			Kl(m, u, f, h, {
				playKey: g,
				index: t
			});
			return;
		}
		let a = Vl(), o = a ? 217 : 395, l = a ? 91 : 165;
		h.current = !0, f(So(i, n.getBoundingClientRect(), r.getBoundingClientRect())), u("pending"), Z() && Gl("TrickPlaySlot", "fly-start", {
			playKey: g,
			index: t,
			travelMs: o,
			settleMs: l
		});
		let d = window.setTimeout(() => u("travel"), 0), _ = window.setTimeout(() => u("settle"), o), v = window.setTimeout(() => {
			Kl(m, u, f, h, {
				playKey: g,
				index: t
			});
		}, o + l);
		return () => {
			window.clearTimeout(d), window.clearTimeout(_), window.clearTimeout(v);
		};
	}, [
		p,
		s,
		x,
		b,
		e.playerId,
		g
	]);
	let D = {
		"--slot-index": t,
		zIndex: 10 + t,
		...d ? {
			"--fly-dx": `${d.dx}px`,
			"--fly-dy": `${d.dy}px`
		} : {}
	};
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		ref: c,
		className: [
			"btrick__play",
			p ? "btrick__play--landed" : "",
			S ? "btrick__play--settled" : "",
			p && l === "static" ? "btrick__play--static-landed" : "",
			l === "travel" ? "btrick__play--fly-from-hand" : "",
			l === "pending" ? "btrick__play--fly-pending" : "",
			l === "land" ? "btrick__play--land" : "",
			l === "settle" ? "btrick__play--settle" : "",
			C ? "btrick__play--leading" : "",
			E ? "btrick__play--winner" : ""
		].filter(Boolean).join(" "),
		style: D,
		"data-slot-index": t,
		children: [/* @__PURE__ */ (0, w.jsx)(T, {
			card: $a(e.card),
			size: "sm",
			state: E ? "winner" : "default"
		}), /* @__PURE__ */ (0, w.jsx)("span", {
			className: "btrick__name muted small",
			children: i
		})]
	});
}
//#endregion
//#region src/table/TrickRow.tsx
function Jl({ displayPlays: e = [], leaderPlayerId: t = null, winnerPlayerId: n = null, showWinnerTag: r = !1, presentationPhase: i = "live", playerNames: a = {}, variant: o = "live", instantTrickPlays: s = !1, peakCardCount: c = 0 }) {
	(0, _.useEffect)(() => {
		Z() && Gl("TrickRow", e.length === 0 ? "trick-empty" : "trick-cards", {
			count: e.length,
			phase: i
		});
	}, [e.length, i]);
	let l = Math.max(e.length, c, 1);
	if (e.length === 0) return /* @__PURE__ */ (0, w.jsx)("div", {
		className: "btrick btrick--empty muted small",
		"aria-hidden": "true",
		"data-testid": "trick-row",
		"data-trick-phase": i,
		"data-trick-card-count": "0",
		"data-trick-variant": o,
		children: /* @__PURE__ */ (0, w.jsx)("div", {
			className: "btrick__surface",
			children: /* @__PURE__ */ (0, w.jsx)("span", {
				className: "btrick__placeholder",
				children: "Trick"
			})
		})
	});
	let u = n ? a[n] ?? "Player" : null, d = i === "trickComplete" || i === "winnerReveal", f = i === "collectTrick", p = o === "echo";
	return /* @__PURE__ */ (0, w.jsx)("div", {
		className: [
			"btrick",
			p ? "btrick--echo-pipeline" : "",
			d ? "btrick--hold" : "",
			f ? "btrick--rake" : ""
		].filter(Boolean).join(" "),
		"aria-label": p ? void 0 : "Current trick",
		"aria-hidden": p ? !0 : void 0,
		"aria-live": p ? void 0 : "polite",
		"data-testid": p ? "trick-row-echo" : "trick-row",
		"data-trick-phase": i,
		"data-trick-card-count": e.length,
		"data-trick-variant": o,
		children: /* @__PURE__ */ (0, w.jsxs)("div", {
			className: "btrick__surface",
			children: [r && u && /* @__PURE__ */ (0, w.jsxs)("div", {
				className: "btrick__winner-tag",
				"data-testid": "trick-winner-tag",
				children: [u, " takes it"]
			}), /* @__PURE__ */ (0, w.jsx)("div", {
				className: "btrick__cards",
				role: "list",
				"aria-label": "Cards in trick",
				style: { "--trick-card-count": l },
				children: e.map((r, o) => /* @__PURE__ */ (0, w.jsx)(ql, {
					play: r,
					index: o,
					presentationPhase: p ? "winnerReveal" : i,
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
function Yl({ cards: e }) {
	return /* @__PURE__ */ (0, w.jsx)("div", {
		className: "discard-pile",
		"data-discard-pile-anchor": !0,
		"data-testid": "discard-pile",
		"aria-label": `Discard pile, ${e.length} card${e.length === 1 ? "" : "s"}`,
		children: e.map((e) => /* @__PURE__ */ (0, w.jsx)("div", {
			className: "discard-pile__card",
			style: {
				"--pile-x": `${e.offsetX}px`,
				"--pile-y": `${e.offsetY}px`,
				"--pile-rot": `${e.rotation}deg`,
				"--pile-scale": String(e.scale),
				zIndex: e.zIndex
			},
			children: /* @__PURE__ */ (0, w.jsx)(T, {
				faceDown: !0,
				size: "sm"
			})
		}, e.id))
	});
}
//#endregion
//#region src/table/PotCenter.tsx
function Xl({ potMetrics: e, participantCount: t, trumpUpcard: n, trumpSuit: r, phase: i, enrollmentActive: a = !1, remainingDeckCount: o, trickDisplayPlays: s = [], trickLeadSuit: c = null, trickLeaderPlayerId: l = null, trickWinnerPlayerId: u = null, trickShowWinnerTag: d = !1, trickPresentationPhase: f = "live", trickEchoPlays: p = [], trickEchoWinnerId: m = null, trickEchoPhase: h = "live", showFinalTrickEcho: g = !1, playerNames: v = {}, anteAnimActive: b = !1, trumpRevealActive: x = !1, drawAnimPlayerId: S = null, drawAnimSubPhase: C = "done", drawDiscardCount: E = 0, settleAnimActive: D = !1, settleCarryOver: O = !1, potTick: k = 0, trumpReminderPulse: ee = 0, hideCenterTrump: A = !1, showTrumpSuitReminder: te = !1, instantTrickPlays: j = !1, peakTrickPlayCount: M = 0, discardPileCards: N = [] }) {
	let P = eo(i, a), F = l ?? ((f === "live" || f === "trickComplete") && s.length > 0 ? X(s, c ?? s[0]?.card.suit ?? null, r ?? null) : null), ne = f !== "live" && f !== "nextLeadReady", I = s.length, L = I > 0 || M > I || j, [re, R] = (0, _.useState)(n ?? null);
	(0, _.useEffect)(() => {
		if (n) {
			R(n);
			return;
		}
		if (re) {
			if (L || ne) {
				let e = window.setTimeout(() => R(null), 760);
				return () => window.clearTimeout(e);
			}
			R(null);
		}
	}, [
		n,
		L,
		ne,
		re
	]);
	let z = !!re && !A, ie = te || !z && !!r && i === "play", ae = z ? `${re.rank}-${re.suit}` : "trump-slot", oe = g || D && p.length > 0 && I === 0;
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		className: "table-center-cluster",
		"aria-label": "Table center",
		children: [/* @__PURE__ */ (0, w.jsxs)("div", {
			className: "deck-stack",
			"aria-label": "Deck and trump",
			children: [z ? /* @__PURE__ */ (0, w.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"bpot__trump--deal",
					x ? "bpot__trump--reveal" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-button",
				"data-trump-deal-target": "",
				children: [/* @__PURE__ */ (0, w.jsx)(T, {
					card: {
						rank: re.rank,
						suit: re.suit
					},
					size: "sm",
					state: "trump"
				}), /* @__PURE__ */ (0, w.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, ae) : ie ? /* @__PURE__ */ (0, w.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"deck-stack__trump--suit-reminder",
					ee > 0 ? "deck-stack__trump--suit-reminder-pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-suit-reminder",
				"aria-label": `Trump suit: ${ro(r)}`,
				children: [/* @__PURE__ */ (0, w.jsx)("div", {
					className: `trump-suit-badge trump-suit-badge--${r}`,
					"aria-hidden": "true",
					children: y[r]
				}), /* @__PURE__ */ (0, w.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, "trump-reminder") : /* @__PURE__ */ (0, w.jsxs)("div", {
				className: "deck-stack__pile",
				"data-testid": "deal-button",
				"aria-hidden": "true",
				children: [
					/* @__PURE__ */ (0, w.jsx)("div", { className: "deck-stack__card deck-stack__card--back" }),
					/* @__PURE__ */ (0, w.jsx)("div", { className: "deck-stack__card deck-stack__card--back deck-stack__card--offset" }),
					/* @__PURE__ */ (0, w.jsx)("span", {
						className: "deck-stack__label muted small",
						children: a ? "Dealing" : "Deck"
					})
				]
			}), o != null && o > 0 && /* @__PURE__ */ (0, w.jsxs)("span", {
				className: "deck-stack__count muted small",
				children: [o, " left"]
			})]
		}), /* @__PURE__ */ (0, w.jsxs)("div", {
			className: [
				"center-play",
				b ? "center-play--ante-in" : "",
				D ? "center-play--settle" : "",
				O ? "center-play--carry" : "",
				ne ? "center-play--trick-resolving" : "",
				oe ? "center-play--final-trick-echo" : ""
			].filter(Boolean).join(" "),
			"data-trick-phase": f,
			"data-trick-cards": I,
			"data-hand-settling": D ? "true" : "false",
			children: [
				b && /* @__PURE__ */ (0, w.jsx)("div", {
					className: "bpot__ante-chips",
					"aria-hidden": "true",
					children: Array.from({ length: Math.min(t, 8) }, (e, t) => /* @__PURE__ */ (0, w.jsx)("span", {
						className: "bpot__ante-chip",
						style: { "--ante-i": t }
					}, t))
				}),
				i === "draw" ? /* @__PURE__ */ (0, w.jsx)(Yl, { cards: N }) : null,
				/* @__PURE__ */ (0, w.jsxs)("div", {
					className: "center-play__phase",
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, w.jsx)("span", {
							className: `bpot__phase-tag bpot__phase-tag--${i ?? "waiting"}`,
							"data-testid": "phase-tag-center",
							"data-phase": i ?? "waiting",
							children: P
						}),
						z && r && /* @__PURE__ */ (0, w.jsx)("span", {
							className: "center-play__trump-suit muted small",
							children: ro(r)
						}),
						ie && /* @__PURE__ */ (0, w.jsxs)("span", {
							className: "center-play__trump-suit center-play__trump-suit--reminder muted small",
							children: [ro(r), " trump"]
						})
					]
				}),
				/* @__PURE__ */ (0, w.jsxs)("div", {
					className: "center-play__trick-stage",
					children: [/* @__PURE__ */ (0, w.jsx)("div", {
						className: "center-play__trick-live",
						children: /* @__PURE__ */ (0, w.jsx)(Jl, {
							displayPlays: s,
							leaderPlayerId: F,
							winnerPlayerId: u,
							showWinnerTag: d,
							presentationPhase: f,
							playerNames: v,
							instantTrickPlays: j,
							peakCardCount: M
						})
					}), oe && /* @__PURE__ */ (0, w.jsx)("div", {
						className: "center-play__trick-echo",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, w.jsx)(Jl, {
							displayPlays: p,
							winnerPlayerId: m,
							showWinnerTag: !0,
							presentationPhase: h,
							playerNames: v,
							variant: "echo"
						})
					})]
				}),
				/* @__PURE__ */ (0, w.jsxs)("dl", {
					className: "center-play__stats",
					children: [
						/* @__PURE__ */ (0, w.jsxs)("div", {
							className: `bpot__stat bpot__stat--pot${k > 0 ? " bpot__stat--tick" : ""}`,
							"data-testid": "pot-display",
							children: [/* @__PURE__ */ (0, w.jsx)("dt", { children: "Table pot" }), /* @__PURE__ */ (0, w.jsx)("dd", { children: ml(e.currentPot) })]
						}, k > 0 ? `pot-${k}` : "pot-static"),
						/* @__PURE__ */ (0, w.jsxs)("div", {
							className: "bpot__stat",
							"data-testid": "ante-display",
							children: [/* @__PURE__ */ (0, w.jsx)("dt", { children: "Ante / hand" }), /* @__PURE__ */ (0, w.jsx)("dd", { children: hl(e.anteAmount) })]
						}),
						e.limEnabled && /* @__PURE__ */ (0, w.jsxs)(w.Fragment, { children: [/* @__PURE__ */ (0, w.jsxs)("div", {
							className: "bpot__stat",
							children: [/* @__PURE__ */ (0, w.jsx)("dt", { children: "Cap" }), /* @__PURE__ */ (0, w.jsxs)("dd", { children: [ml(e.potCap), /* @__PURE__ */ (0, w.jsx)("span", {
								className: "bpot__lim-tag",
								children: "LmT"
							})] })]
						}), /* @__PURE__ */ (0, w.jsxs)("div", {
							className: "bpot__stat bpot__stat--highlight",
							children: [/* @__PURE__ */ (0, w.jsx)("dt", { children: "Max win" }), /* @__PURE__ */ (0, w.jsx)("dd", { children: ml(e.maxWinThisHand) })]
						})] })
					]
				}),
				e.limEnabled && e.overflow > 0 && /* @__PURE__ */ (0, w.jsxs)("div", {
					className: "center-play__carry muted small",
					children: [
						"+",
						ml(e.overflow),
						" carry"
					]
				}),
				/* @__PURE__ */ (0, w.jsxs)("div", {
					className: "center-play__meta muted small",
					children: [t, " in hand"]
				})
			]
		})]
	});
}
//#endregion
//#region src/table/SmartHud.tsx
function Zl({ label: e, value: t, accent: n, title: r }) {
	return /* @__PURE__ */ (0, w.jsxs)("span", {
		className: `bhud__pill${n ? " bhud__pill--accent" : ""}`,
		title: r ?? `${e}: ${t}`,
		children: [/* @__PURE__ */ (0, w.jsx)("span", {
			className: "bhud__pill-label",
			children: e
		}), /* @__PURE__ */ (0, w.jsx)("span", {
			className: "bhud__pill-value",
			children: t
		})]
	});
}
function Ql({ player: e, compact: t = !1 }) {
	let n = e.apeScore != null && !e.isRobot;
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		className: `bhud${t ? " bhud--compact" : ""}`,
		"aria-label": `${e.displayName} stats`,
		children: [n && /* @__PURE__ */ (0, w.jsxs)(w.Fragment, { children: [
			/* @__PURE__ */ (0, w.jsx)(Zl, {
				label: "Ape",
				value: e.apeScore ?? 0,
				accent: !0,
				title: "Ape Score"
			}),
			e.apeClass && /* @__PURE__ */ (0, w.jsx)(Zl, {
				label: "Class",
				value: e.apeClass,
				title: "Ape Class"
			}),
			e.apeStatus && /* @__PURE__ */ (0, w.jsx)(Zl, {
				label: "Status",
				value: e.apeStatus,
				title: "Ape Status"
			})
		] }), e.sessionStreak != null && e.sessionStreak > 0 && /* @__PURE__ */ (0, w.jsx)(Zl, {
			label: "Streak",
			value: e.sessionStreak,
			title: "Hands won this session"
		})]
	});
}
//#endregion
//#region src/table/TurnCountdownRing.tsx
var $l = 22, eu = 2 * Math.PI * $l;
function tu({ progress: e, segment: t, reducedMotion: n = Vl() }) {
	let r = eu * (1 - Math.max(0, Math.min(1, e)));
	return /* @__PURE__ */ (0, w.jsxs)("svg", {
		className: ["bseat__turn-countdown", n ? "bseat__turn-countdown--reduced" : ""].filter(Boolean).join(" "),
		viewBox: "0 0 48 48",
		"aria-hidden": "true",
		"data-testid": "turn-countdown-ring",
		"data-turn-segment": t,
		children: [/* @__PURE__ */ (0, w.jsx)("circle", {
			className: "bseat__turn-countdown-track",
			cx: "24",
			cy: "24",
			r: $l,
			fill: "none"
		}), /* @__PURE__ */ (0, w.jsx)("circle", {
			className: `bseat__turn-countdown-progress bseat__turn-countdown-progress--${t}`,
			cx: "24",
			cy: "24",
			r: $l,
			fill: "none",
			strokeDasharray: eu,
			strokeDashoffset: r,
			transform: "rotate(-90 24 24)"
		})]
	});
}
//#endregion
//#region src/table/SeatAvatarIdentity.tsx
function nu({ displayName: e, photoURL: t, isDealer: n = !1, dealerMoved: r = !1, inHand: i = !1, bourrePressure: a = !1, bourrePulse: o = !1, turnCountdown: s = null, peek: c = !1, onTogglePeek: l, onBlurPeek: u }) {
	let d = yl(e), f = t?.trim() || null, p = (0, _.useCallback)((e) => {
		(e.key === "Enter" || e.key === " ") && (e.preventDefault(), l());
	}, [l]);
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		className: "bseat__avatar-unit",
		children: [/* @__PURE__ */ (0, w.jsx)("div", {
			className: `bseat__avatar-wrap${c ? " bseat__avatar-wrap--peek" : ""}`,
			role: "button",
			tabIndex: 0,
			"aria-label": `${d} seat`,
			"aria-expanded": c,
			onClick: (e) => {
				e.stopPropagation(), l();
			},
			onKeyDown: p,
			onBlur: u,
			children: /* @__PURE__ */ (0, w.jsxs)("div", {
				className: "bseat__avatar-frame",
				"data-testid": "seat-avatar-frame",
				children: [
					/* @__PURE__ */ (0, w.jsx)("div", {
						className: "bseat__avatar-media",
						children: f ? /* @__PURE__ */ (0, w.jsx)("img", {
							className: "bseat__avatar bseat__avatar--image",
							src: f,
							alt: "",
							decoding: "async",
							referrerPolicy: "no-referrer"
						}) : /* @__PURE__ */ (0, w.jsx)("span", {
							className: "bseat__avatar bseat__avatar--fallback",
							"aria-hidden": "true"
						})
					}),
					n && /* @__PURE__ */ (0, w.jsx)("span", {
						className: `bseat__dealer${r ? " bseat__dealer--moved" : ""}`,
						children: "D"
					}),
					i && /* @__PURE__ */ (0, w.jsx)("span", {
						className: "bseat__in-badge",
						title: "In this hand"
					}),
					a && /* @__PURE__ */ (0, w.jsx)("span", {
						className: "bseat__bourre-pressure-ring",
						"aria-hidden": "true"
					}),
					o && !a && /* @__PURE__ */ (0, w.jsx)("span", {
						className: "bseat__bourre-ring",
						"aria-hidden": "true"
					}),
					s && /* @__PURE__ */ (0, w.jsx)(tu, {
						progress: s.progress,
						segment: s.segment
					})
				]
			})
		}), /* @__PURE__ */ (0, w.jsx)("span", {
			className: "bseat__avatar-label",
			title: d,
			children: d
		})]
	});
}
//#endregion
//#region src/table/Seat.tsx
function ru({ player: e, region: t, handLane: n = "below", style: r, clockwiseDealing: i = !1, onToggleInHand: a, onPassEnrollment: o, onTrickDelta: s, onReaction: c }) {
	let [l, u] = (0, _.useState)(!1), d = (0, _.useCallback)(() => {
		u((e) => !e);
	}, []), f = e.tricksThisHand, p = Math.max(0, e.holeCardCount ?? 0), m = f > 0, h = !!(e.showHoleCards && !e.isSelf && e.inHand && p > 0), g = e.bankroll != null, v = e.bourreAlert === "pulse", y = e.bourreAlert === "marker" || e.bourreAlert === "pulse", b = !!e.bourrePressure, x = b && e.isSelf, S = e.revealedTrumpIndex != null && e.revealedTrumpUpcard;
	return /* @__PURE__ */ (0, w.jsxs)("div", {
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
			v ? "bseat--bourre-pulse" : "",
			y ? "bseat--bourre" : "",
			b ? "bseat--bourre-pressure" : "",
			x ? "bseat--bourre-pressure-self" : "",
			e.bankrollTick === "up" ? "bseat--bankroll-up" : "",
			e.bankrollTick === "down" ? "bseat--bankroll-down" : "",
			S ? "bseat--trump-reveal" : "",
			e.seatTrumpMergeActive ? "bseat--trump-merge" : "",
			l ? "bseat--meta-open" : ""
		].filter(Boolean).join(" "),
		style: r,
		"data-trick-play-origin-active": e.isActiveActor && e.inHand ? e.playerId : void 0,
		children: [
			e.inHand && !e.isSelf && /* @__PURE__ */ (0, w.jsx)("span", {
				className: "bseat__play-origin",
				"data-seat-play-origin": e.playerId,
				"data-trick-play-origin": e.playerId,
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, w.jsx)("div", {
				className: "bseat__core",
				children: /* @__PURE__ */ (0, w.jsxs)("div", {
					className: "bseat__avatar-stage",
					children: [
						/* @__PURE__ */ (0, w.jsxs)("div", {
							className: "bseat__avatar-stack",
							"data-trick-play-origin": !e.isSelf && e.inHand && !h ? e.playerId : void 0,
							children: [
								e.inHand && /* @__PURE__ */ (0, w.jsx)("span", {
									className: [
										"bseat__trick-badge",
										f === 0 ? "bseat__trick-badge--zero" : "",
										e.isWinner || e.isTrickCapture ? "bseat__trick-badge--tick" : ""
									].filter(Boolean).join(" "),
									"aria-label": `${f} tricks won`,
									title: `${f} trick${f === 1 ? "" : "s"} won`,
									children: f
								}),
								e.inHand && !e.isSelf && /* @__PURE__ */ (0, w.jsx)("span", {
									className: "bseat__seat-motion-anchor",
									"data-seat-motion-anchor": e.playerId,
									"aria-hidden": "true"
								}),
								m && /* @__PURE__ */ (0, w.jsx)("div", {
									className: "bseat__won-trick-pile",
									"data-won-trick-pile-anchor": e.playerId,
									"aria-hidden": !1,
									"data-trick-count": f,
									children: Array.from({ length: Math.min(f, 5) }, (e, t) => /* @__PURE__ */ (0, w.jsx)("div", {
										className: "bseat__won-trick-pile-card",
										style: { "--book-i": t },
										children: /* @__PURE__ */ (0, w.jsx)(T, {
											faceDown: !0,
											size: "xs"
										})
									}, t))
								}),
								i && e.inHand && !e.isSelf && p > 0 && /* @__PURE__ */ (0, w.jsx)("div", {
									className: "bseat__deal-targets",
									"aria-hidden": "true",
									children: Array.from({ length: p }, (t, n) => /* @__PURE__ */ (0, w.jsx)("span", {
										className: "bseat__deal-target",
										"data-deal-seat": e.playerId,
										"data-deal-round": n,
										style: { "--hole-i": n }
									}, `deal-target-${n}`))
								}),
								h && /* @__PURE__ */ (0, w.jsx)("div", {
									className: "bseat__hole-cards bseat__hole-cards--crown",
									"aria-label": `${p} cards in hand`,
									"data-trick-play-origin": e.playerId,
									children: Array.from({ length: p }, (t, n) => {
										let r = e.revealedTrumpIndex === n && e.revealedTrumpUpcard;
										return /* @__PURE__ */ (0, w.jsx)("div", {
											className: [
												"bseat__hole-card",
												r ? "bseat__hole-card--trump-revealed" : "",
												r && e.seatTrumpMergeActive ? "bseat__hole-card--trump-merge" : ""
											].filter(Boolean).join(" "),
											style: { "--hole-i": n },
											children: r ? /* @__PURE__ */ (0, w.jsx)(T, {
												card: {
													rank: e.revealedTrumpUpcard.rank,
													suit: e.revealedTrumpUpcard.suit
												},
												size: "xs",
												state: "trump"
											}) : /* @__PURE__ */ (0, w.jsx)(T, {
												faceDown: !0,
												size: "xs"
											})
										}, n);
									})
								}),
								b && /* @__PURE__ */ (0, w.jsx)("span", {
									className: "bseat__bourre-pressure-badge",
									"data-testid": "bourre-pressure-badge",
									"aria-label": x ? "You need this trick to avoid bourré" : "At risk of bourré",
									title: x ? "Win this trick or go bourré" : "Must win this trick",
									children: x ? "Bourré risk!" : "0 tricks"
								}),
								y && !b && /* @__PURE__ */ (0, w.jsx)("span", {
									className: "bseat__bourre-badge",
									"data-testid": "bourre-marker-badge",
									"aria-label": "Bourré",
									title: "Bourré",
									children: "Bourré"
								}),
								/* @__PURE__ */ (0, w.jsx)(nu, {
									displayName: e.displayName,
									photoURL: e.photoURL,
									isDealer: e.isDealer,
									dealerMoved: e.dealerMoved,
									inHand: e.inHand,
									bourrePressure: b,
									bourrePulse: v,
									turnCountdown: e.turnCountdown ?? null,
									peek: l,
									onTogglePeek: d,
									onBlurPeek: () => u(!1)
								})
							]
						}),
						g && /* @__PURE__ */ (0, w.jsx)("span", {
							className: `bseat__stack${e.isOut ? " bseat__stack--out" : ""}`,
							"data-testid": "seat-stack",
							"aria-label": `Chips ${_l(e.bankroll ?? 0)}`,
							title: `Chips ${_l(e.bankroll ?? 0)}`,
							children: _l(e.bankroll ?? 0)
						}),
						e.isSelf && c && /* @__PURE__ */ (0, w.jsx)("div", {
							className: "bseat__react-bar",
							children: [
								"👏",
								"😮",
								"🔥"
							].map((e) => /* @__PURE__ */ (0, w.jsx)("button", {
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
			/* @__PURE__ */ (0, w.jsxs)("div", {
				className: "bseat__aux",
				children: [
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "bseat__info",
						children: [
							e.isOut && /* @__PURE__ */ (0, w.jsx)("span", {
								className: "bseat__out-tag muted small",
								children: "Out"
							}),
							e.enrollmentSatOut && !e.isOut && /* @__PURE__ */ (0, w.jsx)("span", {
								className: "bseat__enroll-tag muted small",
								children: "Sat out"
							}),
							e.enrollmentJoined && !e.inHand && !e.isOut && /* @__PURE__ */ (0, w.jsx)("span", {
								className: "bseat__enroll-tag muted small",
								children: e.decisionPlannedDiscards == null ? "Joined" : `Play · draw ${e.decisionPlannedDiscards}`
							})
						]
					}),
					/* @__PURE__ */ (0, w.jsx)("div", {
						className: "bseat__meta",
						"data-testid": "seat-meta-panel",
						"aria-hidden": !l,
						children: /* @__PURE__ */ (0, w.jsx)(Ql, {
							player: e,
							compact: t === "left" || t === "right"
						})
					}),
					e.canToggleInHand && /* @__PURE__ */ (0, w.jsx)("button", {
						type: "button",
						className: "bseat__opt-in btn btn--sm",
						"data-testid": "seat-opt-in",
						onClick: a,
						children: e.decisionPlannedDiscards != null && e.enrollmentJoined ? `Playing · ${e.decisionPlannedDiscards}` : e.canPassEnrollment ? "Play" : "I’m in"
					}),
					e.canPassEnrollment && o && /* @__PURE__ */ (0, w.jsx)("button", {
						type: "button",
						className: "bseat__pass btn btn--sm btn--ghost",
						"data-testid": "seat-pass-enrollment",
						onClick: o,
						children: "Pass"
					}),
					e.canEditTricks && /* @__PURE__ */ (0, w.jsx)("div", {
						className: "bseat__controls",
						children: /* @__PURE__ */ (0, w.jsx)("button", {
							type: "button",
							className: "bseat__trick-btn bseat__trick-btn--plus",
							"aria-label": "Won a trick",
							disabled: f >= 5,
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
function iu(e, t) {
	let n = [...new Set(e.filter(Boolean))];
	if (!n.length) return [];
	let r = t.seatedIds?.filter((e) => n.includes(e));
	if (r?.length === n.length) return r;
	let i = t.handEnrollment?.orderedPlayerIds?.filter((e) => n.includes(e));
	if (i?.length === n.length) return i;
	let a = jo(t.dealerId, n), o = n.filter((e) => !a.includes(e));
	return o.length ? [...a, ...o] : a;
}
function au(e, t, n) {
	let r = new Map(e.map((e) => [e.playerId, e])), i = iu(e.map((e) => e.playerId), t);
	if (!i.length) return e;
	let a = n ?? e.find((e) => e.isSelf)?.playerId ?? null, o = a ? i.indexOf(a) : 0;
	return (o > 0 ? [...i.slice(o), ...i.slice(0, o)] : i).map((e) => r.get(e)).filter((e) => e != null);
}
//#endregion
//#region src/table/layout/sevenPlayerMobileSeatMap.ts
function ou(e) {
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
function su(e) {
	return e === 7;
}
function cu(e, t) {
	return e < 0 || e > 6 ? null : ou(t)[e] ?? null;
}
function lu(e, t, n) {
	let r = cu(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: Du(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 7
		})
	} : null;
}
//#endregion
//#region src/table/layout/eightPlayerMobileSeatMap.ts
function uu(e) {
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
function du(e) {
	return e >= 8;
}
function fu(e, t) {
	return e < 0 || e > 7 ? null : uu(t)[e] ?? null;
}
function pu(e, t, n) {
	let r = fu(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: Du(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 8
		})
	} : null;
}
//#endregion
//#region src/table/layout/fourPlayerMobileSeatMap.ts
function mu(e) {
	return e === 5;
}
function hu(e) {
	let t = sl(e);
	return {
		0: t[0],
		1: t[1],
		2: t[3],
		3: t[5],
		4: t[6]
	};
}
function gu(e, t, n) {
	if (e < 0 || e > 4) return null;
	let r = hu(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: Du(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 5
		})
	} : null;
}
//#endregion
//#region src/table/layout/fivePlayerMobileSeatMap.ts
var _u = {
	min: 8,
	max: 92
};
function vu(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function yu(e, t) {
	let n = t === "landscape" ? 54 : 56;
	return {
		...e,
		x: vu(e.x, _u.min, _u.max),
		y: vu(e.y, 8, n)
	};
}
function bu(e) {
	return e === 6;
}
function xu(e) {
	let t = sl(e), n = [
		2,
		3,
		4
	].map((t) => yu(Dl(t, 6), e));
	return {
		0: t[0],
		1: t[1],
		2: n[0],
		3: n[1],
		4: n[2],
		5: t[6]
	};
}
function Su(e, t, n) {
	if (e < 0 || e > 5) return null;
	let r = xu(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: Du(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 6
		})
	} : null;
}
//#endregion
//#region src/table/layout/seatLayout.ts
var Cu = {
	min: 8,
	max: 92
}, wu = 56, Tu = 54;
function Eu(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Du(e, t) {
	return t.isSelf || t.isMobile ? "below" : t.total >= 6 && e.region === "left" && e.x < 14 || t.total >= 6 && e.region === "right" && e.x > 86 ? "side" : "below";
}
function Ou(e, t) {
	let n = Eu(e.x, Cu.min, Cu.max), r = t === "portrait" ? wu : Tu, i = Eu(e.y, 8, r);
	return {
		...e,
		x: n,
		y: i
	};
}
function ku(e, t, n) {
	if (n.isMobile && n.orientation && mu(t)) {
		let t = gu(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && bu(t)) {
		let t = Su(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && su(t)) {
		let t = lu(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && du(t)) {
		let t = pu(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	let r = Dl(e, t), i = n.isMobile && n.orientation ? Ou(r, n.orientation) : r;
	return {
		...i,
		seatIndex: e,
		handLane: Du(i, {
			isMobile: n.isMobile,
			isSelf: n.isSelf,
			total: t
		})
	};
}
function Au(e, t, n) {
	return ku(e + 1, t, {
		isMobile: !0,
		isSelf: !1,
		orientation: n
	});
}
function ju(e, t = "portrait") {
	if (mu(e)) {
		let e = gu(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (bu(e)) {
		let e = Su(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (su(e)) {
		let e = lu(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (du(e)) {
		let e = pu(0, t, { isSelf: !0 });
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
var Mu = 5e3, Nu = 1e3, Pu = 12e3, Fu = 4e3, Iu = 4e3;
function Lu(e = Vl()) {
	let t = e ? .55 : 1, n = (e) => Math.max(80, Math.round(e * t));
	return {
		anteChipTravelMs: n(220),
		dealCardStaggerMs: n(130),
		dealFanMs: n(600),
		trumpRevealHoldMs: n(Mu),
		trumpMergeAnimMs: n(480),
		enrollmentSeatPulseMs: n(480),
		drawDiscardMs: n(400),
		drawReplaceMs: n(700),
		drawReadyBeatMs: n(500),
		settleHoldMs: n(Nu),
		nextHandResetMs: n(550),
		handResetMs: n(500)
	};
}
function Ru(e, t, n = Vl()) {
	let r = Lu(n), i = Math.max(0, e), a = Math.max(0, t);
	return i === 0 && a === 0 ? Math.max(120, Math.round(r.drawDiscardMs * .6)) : i * r.drawDiscardMs + a * r.drawReplaceMs + 80;
}
function zu(e, t, n) {
	let r = Number.isFinite(e) && e > 0 ? e : 0, i = r > 0 ? Math.max(t, r) : t;
	return {
		height: Math.max(i > 0 ? i : n, n),
		peak: i
	};
}
function Bu(e, t, n, r) {
	let i = zu(e, t, n), a = Math.max(152, n);
	return {
		height: i.peak > 0 ? Math.min(i.height, r) : Math.min(a, r),
		peak: i.peak
	};
}
function Vu(e, t, n = 72) {
	return zu(e, t, n);
}
function Hu(e, t) {
	let n = Math.max(.75, e);
	return t.portrait ? Math.min(n, .98) : Math.min(n, 1.32);
}
function Uu(e) {
	let t = Math.max(2, Math.min(8, e || 4));
	return t <= 3 ? .7 : t <= 4 ? .68 : t <= 5 ? .62 : .56;
}
function Wu(e) {
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
function Gu(e) {
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
function Ku(e) {
	return {
		left: e.left,
		top: e.top,
		right: e.right,
		bottom: e.bottom,
		width: e.width,
		height: e.height
	};
}
function qu(e, t, n = 2) {
	return e.left >= t.left - n && e.top >= t.top - n && e.right <= t.right + n && e.bottom <= t.bottom + n;
}
//#endregion
//#region src/table/presentationMotionBusy.ts
var Ju = !1, Yu = !1, Xu = /* @__PURE__ */ new Set();
function Zu() {
	for (let e of Xu) e();
}
function Qu(e) {
	Ju !== e && (Ju = e, Zu());
}
function $u() {
	return Ju;
}
function ed(e) {
	Yu !== e && (Yu = e, Zu());
}
function td() {
	return Yu;
}
function nd(e) {
	return Xu.add(e), () => Xu.delete(e);
}
function rd() {
	Ju = !1, Yu = !1, Zu();
}
//#endregion
//#region src/table/useMobileTable.ts
var id = "(max-width: 900px), ((hover: none) and (pointer: coarse))";
function ad() {
	let [e, t] = (0, _.useState)(() => typeof window < "u" && window.matchMedia("(max-width: 900px), ((hover: none) and (pointer: coarse))").matches);
	return (0, _.useEffect)(() => {
		let e = window.matchMedia(id), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/table/hooks/useStageFit.ts
function od(e, t) {
	if (typeof window > "u") return t;
	let n = document.documentElement, r = getComputedStyle(n).getPropertyValue(e).trim(), i = parseFloat(r);
	return Number.isFinite(i) ? i : t;
}
function sd(e, t) {
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
function cd(e) {
	let t = e.closest(".btable-session")?.querySelector(".btable-desktop");
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return n.width <= 0 || n.height <= 0 ? null : {
		width: n.width,
		height: n.height
	};
}
function ld(e, t) {
	let n = !!e.closest(".table-play-overlay");
	if (t && n) {
		let t = e.closest(".table-play-overlay__main");
		if (t) return t;
	}
	return e.closest(".btable-desktop__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function ud({ aspect: e, enabled: t = !0, sessionKey: n }) {
	let r = (0, _.useRef)(null), i = (0, _.useRef)(0), a = (0, _.useRef)(0), o = (0, _.useRef)(n), { settings: s } = Kc(), c = ad();
	return (0, _.useLayoutEffect)(() => {
		if (!t || typeof window > "u") return;
		let l = r.current;
		if (!l) return;
		o.current !== n && (o.current = n, i.current = 0, a.current = 0);
		let u = l.closest(".btable-desktop__viewport") ?? l.closest(".table-play-overlay__main") ?? l.closest(".btable-session"), d = window.visualViewport, f = () => {
			let t = !!l.closest(".table-play-overlay"), n = typeof window < "u" && window.matchMedia("(orientation: portrait)").matches, r = ld(l, c).getBoundingClientRect(), o = l.querySelector(".hand-panel")?.getBoundingClientRect(), u = t && c && n ? 100 : t && !c ? 120 : c ? 112 : 148, f = t && c && n || t && !c ? 200 : c ? 210 : 280, p = o?.height ?? 0, m = Bu(p, i.current, u, f);
			i.current = m.peak;
			let h = m.height, g = c && t ? 12 : c ? 18 : t && !c ? 16 : 28, _ = od("--stage-fit-pad-x", c ? 8 : 16) + g, v = od("--stage-fit-pad-y", c ? 6 : 12) + g, y = od("--stage-fit-gap", c ? 8 : 12), b = d, x = Math.min(r.width, b?.width ?? window.innerWidth), S = Math.min(r.height, b?.height ?? window.innerHeight);
			if (t && c) {
				let e = cd(l);
				if (e) x = e.width, S = e.height;
				else {
					let e = Vu(sd(l, c), a.current, 72);
					a.current = e.peak, S = Math.max(160, S - e.height);
				}
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = t && c ? 1 : C, T = c ? Hu(e, { portrait: n }) : e, E = parseInt(getComputedStyle(l).getPropertyValue("--player-count").trim(), 10) || 4, D = t && c && !n, O = D ? {
				...Wu({
					availWidth: x,
					availHeight: S,
					aspect: T,
					userScale: w,
					padX: _,
					padY: v,
					stageShare: Uu(E)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Gu({
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
			let k = c || t, ee = k ? O.displayStageWidth : O.stageWidth, A = k ? O.displayStageHeight : O.stageHeight;
			if (t && c) {
				let e = Math.max(0, x - _ * 2), t = D ? Math.max(0, S - v * 2) : Math.max(120, S - v * 2 - h - y);
				ee = Math.min(ee * C, e), A = Math.min(A * C, t);
			}
			let te = t && !c ? C : c ? 1 : O.effectiveScale;
			if (l.style.setProperty("--stage-fit-width", `${Math.round(ee)}px`), l.style.setProperty("--stage-fit-height", `${Math.round(A)}px`), l.style.setProperty("--stage-fit-scale", String(O.fitScale)), l.style.setProperty("--stage-effective-scale", String(te)), (l.closest(".btable-desktop__scale") ?? l.parentElement)?.style.setProperty("--stage-effective-scale", String(te)), localStorage.getItem("stageFitDebug") === "1") {
				let e = l.querySelector(".table-stage"), a = l.querySelectorAll(".bseat__avatar-wrap"), o = e ? Ku(e.getBoundingClientRect()) : null, s = Ku(document.documentElement.getBoundingClientRect()), u = [...a].filter((e) => !qu(Ku(e.getBoundingClientRect()), s, 1)).length;
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
			$u() || td() || (p ??= window.requestAnimationFrame(() => {
				p = null, f();
			}));
		}, h = new ResizeObserver(m), g = l.querySelector(".hand-panel");
		g && h.observe(g);
		let _ = ld(l, c);
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
function dd({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r, pileIndexRef: i, onDiscardCommitted: a }) {
	let o = (0, _.useRef)(null);
	(0, _.useLayoutEffect)(() => {
		let s = e.animatingDrawPlayerId, c = e.drawAnimSubPhase, l = e.drawDiscardCount;
		if (c !== "discard" || !s || l <= 0) {
			c !== "discard" && (o.current = null);
			return;
		}
		if (s === n) return;
		let u = `${t}:${s}:${l}`;
		o.current !== u && (o.current = u, Ka({
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
function fd({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r }) {
	let i = (0, _.useRef)(null);
	(0, _.useLayoutEffect)(() => {
		let a = e.animatingDrawPlayerId, o = e.drawAnimSubPhase, s = e.drawReplaceCount;
		if (o !== "receive" || !a || s <= 0) {
			o !== "receive" && (i.current = null);
			return;
		}
		if (a === n) return;
		let c = r.current;
		if (!c) return;
		let l = `${t}:${a}:receive:${s}`;
		i.current !== l && (i.current = l, Ua({
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
function pd(e = document) {
	Sa(), Ba();
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = e instanceof Document ? t.body : e;
	for (let e of n.querySelectorAll(".discard-fly-ghost, .draw-receive-fly-ghost")) e.remove();
}
//#endregion
//#region src/table/hooks/useTableDrawMotionCleanup.ts
function md({ handNumber: e, sessionPhase: t, turnPlayerId: n, drawCompletedIds: r, currentUserId: i, handPresentation: a, tableRootRef: o }) {
	let s = (0, _.useRef)(null);
	(0, _.useLayoutEffect)(() => {
		let c = o.current;
		if (!c || !i) return;
		if (t !== "draw") {
			s.current = null;
			return;
		}
		if (!(n === i && !r.includes(i) && a.animatingDrawPlayerId !== i && a.drawAnimSubPhase === "done")) return;
		let l = `${e}:${i}:draw-wait`;
		s.current !== l && (s.current = l, pd(c));
	}, [
		e,
		t,
		n,
		r,
		i,
		a.animatingDrawPlayerId,
		a.drawAnimSubPhase,
		o
	]), (0, _.useLayoutEffect)(() => {
		let e = o.current;
		e && (pd(e), s.current = null);
	}, [e, o]);
}
var hd = /* @__PURE__ */ new Set();
function gd(e, t = 5) {
	let n = [];
	for (let r = 0; r < t; r += 1) for (let t of e) n.push({
		playerId: t,
		roundIndex: r,
		stepIndex: n.length
	});
	return n;
}
function _d(e, t = ce()) {
	if (e <= 0) return 0;
	let n = t ? .35 : 1, r = Math.round(780 * n), i = Math.round(540 * n);
	return (e - 1) * r + i + Math.round(130 * n);
}
function vd(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		let e = i.querySelector("[data-trump-deal-target]");
		if (e) return ca(e);
	}
	let a = i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`) ?? i.querySelector(`[data-deal-seat="${e}"] [data-deal-round="${t}"]`), o = a?.querySelector(".pcard") ?? a;
	return o ? ca(o) : null;
}
function yd(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * .24)
	};
}
function Q(e) {
	let t = document.createElement("div");
	return t.className = "deal-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function bd(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		i.querySelector("[data-trump-deal-target]")?.classList.add("deal-card--revealed");
		return;
	}
	i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`)?.classList.add("deal-card--revealed");
}
function xd(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".deal-card--revealed")) e.classList.remove("deal-card--revealed");
	for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
}
function Sd() {
	for (let e of hd) e.kill();
	hd.clear();
}
function Cd({ steps: e, root: t, trumpHolderId: n = null, onStepComplete: r, onComplete: i }) {
	fa(t), Sd();
	let a = ce(), o = se(540 / 1e3, a), s = se(130 / 1e3, a), c = a ? .04 : 110 / 1e3, l = ka(t), u = K.timeline({
		onComplete: () => {
			hd.delete(u), i?.();
		},
		onInterrupt: () => {
			hd.delete(u);
			for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
		}
	});
	if (hd.add(u), !l || e.length === 0) {
		for (let r of e) bd(r.playerId, r.roundIndex, t, n);
		return u.call(() => i?.()), u;
	}
	e.forEach((e, i) => {
		let d = i * (o + s + c), f = vd(e.playerId, e.roundIndex, t, n);
		u.call(() => {
			if (!f) {
				bd(e.playerId, e.roundIndex, t, n), r?.(e);
				return;
			}
			let i = Q(l);
			t.appendChild(i);
			let c = ca(i), { x: u, y: d } = da(c, l), p = f.left + f.width / 2, m = f.top + f.height / 2, h = c.left + c.width / 2, g = c.top + c.height / 2, _ = p - h, v = m - g, { midX: y, midY: b } = yd(_, v);
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
				i.remove(), bd(e.playerId, e.roundIndex, t, n), r?.(e);
			} });
			a ? x.to(i, {
				x: _,
				y: v,
				rotation: 0,
				rotationY: 0,
				scale: 1,
				opacity: 1,
				duration: o,
				ease: R
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
				ease: R
			}), x.to(i, {
				scale: 1.02,
				duration: s * .45,
				yoyo: !0,
				repeat: 1,
				ease: ie
			}, o);
		}, void 0, d);
	});
	let d = _d(e.length, a) + 120, f = window.setTimeout(() => {
		u.progress() < 1 && u.progress(1);
	}, d);
	return u.eventCallback("onComplete", () => window.clearTimeout(f)), u.eventCallback("onInterrupt", () => window.clearTimeout(f)), u;
}
//#endregion
//#region src/table/hooks/useTableDealPresentation.ts
function wd({ session: e, heroCards: t, privateHandReady: n = !1, tableRootRef: r }) {
	let [i, a] = (0, _.useState)(!1), o = (0, _.useRef)(null), s = (0, _.useRef)(e.handNumber);
	return (0, _.useLayoutEffect)(() => {
		let t = r.current;
		t && s.current !== e.handNumber && (s.current = e.handNumber, o.current = null, Sd(), xd(t), Qu(!1), a(!1));
	}, [e.handNumber, r]), (0, _.useLayoutEffect)(() => {
		let i = r.current;
		if (!i) return;
		let s = e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play", c = t.length;
		if (!s || !n || c < 5) return;
		let l = `${e.handNumber}:${c}:${e.participantIds.join(",")}`;
		if (o.current === l) return;
		let u = iu(e.participantIds, e), d = Mo(e.dealerId, e.participantIds, u.length ? u : e.participantIds);
		if (d.length < 2) return;
		let f = gd(d, 5);
		if (!f.length) return;
		o.current = l, Sd(), xd(i), i.classList.add("btable-wrap--clockwise-dealing"), a(!0), Qu(!0);
		let p = Vl(), m = window.requestAnimationFrame(() => {
			Cd({
				steps: f,
				root: i,
				trumpHolderId: e.trumpHolderId ?? e.dealerId ?? null,
				onComplete: () => {
					i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), Qu(!1);
				}
			});
		}), h = window.setTimeout(() => {
			i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), Qu(!1);
		}, _d(f.length, p) + 400);
		return () => {
			window.cancelAnimationFrame(m), window.clearTimeout(h), Sd(), i.classList.remove("btable-wrap--clockwise-dealing"), Qu(!1), a(!1);
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
function Td(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function Ed(e, t) {
	return (e >>> t & 65535) / 65535;
}
function Dd(e, t) {
	let n = Td(`${e}@book${t}`), r = Ed(n, 0), i = Ed(n, 9), a = Ed(n, 17), o = r >= .5 ? 1 : -1, s = i >= .5 ? 1 : -1;
	return {
		offsetX: o * (1.5 + r * 2.5) + t * 2.2,
		offsetY: t * -1.8 + i * 1.2,
		rotation: s * (4 + a * 5) + t * 2.5,
		scale: .88 - t * .02,
		zIndex: t + 1
	};
}
function Od(e) {
	return `${e.playerId}:h${e.handNumber}:t${e.trickNumber}`;
}
//#endregion
//#region src/table/animations/wonTrickPileMotion.ts
var kd = /* @__PURE__ */ new Set(), Ad = /* @__PURE__ */ new Set(), jd = ae.drawDiscard;
function Md(e, t) {
	return {
		midX: e * .5,
		midY: t * .5
	};
}
function Nd(e, t = document) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document, r = n.querySelector(`[data-won-trick-pile-anchor="${e}"]`) ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`);
	return r ? ca(r) : null;
}
function Pd() {
	for (let e of Ad) K.set(e, { clearProps: "opacity,transform,willChange,zIndex" });
	Ad.clear();
}
function Fd(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) e.remove();
}
function Id(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".bseat--pile-reveal-ready")) e.classList.remove("bseat--pile-reveal-ready");
}
function Ld(e = document) {
	for (let e of kd) e.kill();
	kd.clear(), Fd(e), Pd(), Id(e);
}
function Rd() {
	for (let e of kd) e.kill();
	kd.clear(), Pd();
}
function zd(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function Bd(e, t) {
	let n = ca(e), r = document.createElement("div");
	r.className = "won-trick-fly-ghost", r.setAttribute("aria-hidden", "true"), r.style.position = "fixed", r.style.left = `${n.left}px`, r.style.top = `${n.top}px`, r.style.width = `${n.width}px`, r.style.height = `${n.height}px`, r.style.pointerEvents = "none", r.style.zIndex = "4", r.style.transformOrigin = "50% 50%";
	let i = e.cloneNode(!0);
	return i.style.width = "100%", i.style.height = "100%", r.appendChild(i), t.appendChild(r), r;
}
function Vd(e, t) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document;
	(n.querySelector(`[data-won-trick-pile-anchor="${e}"]`)?.closest(".bseat") ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`)?.closest(".bseat"))?.classList.add("bseat--pile-reveal-ready");
}
function Hd(e, t) {
	fa(t.root ?? document);
	let n = ce(), r = t.root ?? document, i = t.host ?? (r instanceof HTMLElement ? r : document.body), a = Nd(t.winnerPlayerId, r), o = n ? .06 : 140 / 1e3, s = se(jd, n), c = n ? .03 : .05, l = [], u = (e) => {
		kd.delete(d);
		for (let e of l) e.remove();
		Pd(), e && Vd(t.winnerPlayerId, r), t.onComplete?.();
	}, d = K.timeline({
		onComplete: () => u(!0),
		onInterrupt: () => u(!1)
	});
	kd.add(d), e.forEach((e, r) => {
		let u = Dd(t.trickKey, t.bookIndex), f = Bd(e, i);
		l.push(f), Ad.add(e), K.set(e, { opacity: 0 });
		let p = ca(f);
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
		let h = a.left + a.width / 2 + u.offsetX, g = a.top + a.height / 2 + u.offsetY, _ = p.left + p.width / 2, v = p.top + p.height / 2, y = h - _, b = g - v, { midX: x, midY: S } = Md(y, b);
		d.to(f, {
			scale: .98,
			duration: o,
			ease: R
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
			ease: R,
			onComplete: () => f.remove()
		}, m + o);
	});
	let f = Math.round((e.length > 0 ? (e.length - 1) * c : 0) * 1e3 + (o + s) * 1e3 + 60);
	return zd(d, Math.min(760, Math.max(300, f))), d;
}
function Ud() {
	return kd.size > 0;
}
function Wd(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = [...t.querySelectorAll("[data-trick-variant=\"live\"] .btrick__play .pcard, [data-testid=\"trick-row\"] .btrick__play .pcard")].filter((e) => e.closest("[data-trick-variant=\"echo\"]") == null);
	return n.length > 0 ? n : [...t.querySelectorAll("[data-trick-variant=\"echo\"] .btrick__play .pcard")];
}
//#endregion
//#region src/table/hooks/useWonTrickCollection.ts
var Gd = new Set(["nextLeadReady", "live"]);
function Kd({ trickPresentation: e, handNumber: t, sessionPhase: n = null, handComplete: r = !1, tableRootRef: i }) {
	let a = (0, _.useRef)(null), o = (0, _.useRef)(t), s = (0, _.useRef)(e.phase), c = (0, _.useRef)(null), l = () => {
		c.current != null && (window.clearTimeout(c.current), c.current = null);
	}, u = (e) => {
		l();
		let t = Ud() ? 820 : 0;
		c.current = window.setTimeout(() => {
			c.current = null, qd(e);
		}, t);
	};
	(0, _.useLayoutEffect)(() => {
		let e = i.current;
		if (e) {
			if (o.current !== t) {
				o.current = t, a.current = null, l(), Ld(e);
				return;
			}
			(r || n != null && n !== "play") && (a.current = null, l(), Ld(e));
		}
	}, [
		t,
		r,
		n,
		i
	]), (0, _.useLayoutEffect)(() => {
		let n = s.current, r = e.phase;
		s.current = r;
		let o = i.current;
		if (!o || (n === "collectTrick" && Gd.has(r) && (a.current = null, u(o)), r !== "collectTrick")) return;
		let c = e.trickWinnerSeatId, d = e.frozenTrick;
		if (!c || !d) return;
		let f = `${d.trickNumber}:${c}:${d.plays.length}`;
		if (a.current === f) return;
		a.current = f, l(), Rd(), Jd(o);
		let p = Wd(o);
		if (!p.length) return;
		let m = Math.max(0, (e.displayTricksByPlayer[c] ?? 1) - 1), h = Od({
			playerId: c,
			handNumber: t,
			trickNumber: d.trickNumber
		});
		ed(!0);
		let g = window.setTimeout(() => {
			Hd(p, {
				winnerPlayerId: c,
				trickKey: h,
				bookIndex: m,
				root: o,
				host: o,
				onComplete: () => ed(!1)
			});
		}, 240);
		return () => {
			window.clearTimeout(g), ed(!1);
		};
	}, [
		e.phase,
		e.trickWinnerSeatId,
		e.frozenTrick,
		e.displayTricksByPlayer,
		t,
		i
	]), (0, _.useEffect)(() => () => l(), []), (0, _.useLayoutEffect)(() => {
		let e = i.current;
		return () => {
			l(), e ? Ld(e) : Rd();
		};
	}, [i]);
}
function qd(e) {
	for (let t of e.querySelectorAll(".bseat--pile-reveal-ready")) t.classList.remove("bseat--pile-reveal-ready");
}
function Jd(e) {
	for (let t of e.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) t.remove();
}
//#endregion
//#region src/table/trumpHolderPresentation.ts
function Yd(e) {
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
function Xd(e) {
	return e <= 0 ? null : e - 1;
}
function Zd(e, t, n, r, i) {
	if (i || !t.trumpHolderId || e !== t.trumpHolderId || r <= 0) return {
		revealedTrumpUpcard: null,
		revealedTrumpIndex: null,
		seatTrumpMergeActive: !1
	};
	let a = t.showRevealedTrumpAtHolder ? Xd(r) : null;
	return {
		revealedTrumpUpcard: t.showRevealedTrumpAtHolder ? n : null,
		revealedTrumpIndex: a,
		seatTrumpMergeActive: t.trumpMergeActive
	};
}
//#endregion
//#region src/table/CardTable.tsx
function Qd({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: l = !1, showTrumpSuitReminder: u = !1, trumpHolderPresentation: d, privateHandReady: f = !1, currentUserId: p = null, legalPlayIndices: m, recommendedPlayIndex: h, recommendedDiscardIndices: g = [], handComplete: _ = !1, actionFeedback: v, trickPresentation: y, handPresentation: b, microinteractions: x, instantTrickPlays: S = !1, turnCountdown: C = null, bigPotEvent: T = null, onDismissTableEvent: E, onToggleInHand: D, onPassEnrollment: O, onTrickDelta: k, onSubmitDraw: ee, onPassDraw: A, onFoldDraw: te, onPlayCard: j, onReaction: M, onHeroUserActivity: N }) {
	let P = t.map((e) => ({
		...e,
		isSelf: e.isSelf || p != null && e.playerId === p
	})), F = au(P, e, p), ne = F.length, I = `btable--p${Math.min(8, Math.max(2, ne))}`, L = Ol(ne), re = Object.fromEntries(P.map((e) => [e.playerId, e.displayName])), R = Lu(), z = e.sessionId, ie = ud({
		aspect: L,
		sessionKey: z
	}), { cards: ae, pileIndexRef: oe, commitDiscardCards: se } = Wa({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: ie
	});
	dd({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: p,
		tableRootRef: ie,
		pileIndexRef: oe,
		onDiscardCommitted: se
	}), fd({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: p,
		tableRootRef: ie
	}), md({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: p,
		handPresentation: b,
		tableRootRef: ie
	});
	let ce = wd({
		session: e,
		heroCards: a,
		privateHandReady: f,
		tableRootRef: ie
	});
	Kd({
		trickPresentation: y,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: _,
		tableRootRef: ie
	});
	let le = new Set(e.participantIds.filter((t) => fl(t, y.displayTricksByPlayer, e.participantIds, e.phase))), ue = P.map((t) => {
		let r = y.displayTricksByPlayer[t.playerId] ?? 0, i = y.trickWinnerSeatId === t.playerId, a = y.suppressTurnPlayerId || b.suppressTurnIndicator, o = y.phase === "collectTrick" && i, s = b.enrollmentPulse[t.playerId], c = b.animatingDrawPlayerId === t.playerId, l = Zd(t.playerId, d, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: vl(t.bankroll, n.anteAmount, {
				inHand: t.inHand,
				anteAnimActive: b.anteAnimActive,
				anteAlreadyPosted: e.postedAntes != null && Object.prototype.hasOwnProperty.call(e.postedAntes, t.playerId)
			}),
			tricksThisHand: r,
			isOnTurn: a ? !1 : t.isOnTurn,
			isActiveActor: a ? !1 : t.isActiveActor,
			isLeading: i && (y.phase === "winnerReveal" || y.phase === "collectTrick") ? !0 : a ? !1 : t.isLeading,
			isTrickCapture: o,
			enrollmentPulse: s,
			drawAnimSubPhase: c && t.isSelf ? b.drawAnimSubPhase : null,
			drawDiscardCount: c ? b.drawDiscardCount : 0,
			drawReplaceCount: c ? b.drawReplaceCount : 0,
			turnHandoff: !1,
			turnCountdown: C?.playerId === t.playerId ? {
				progress: C.progress,
				remainingMs: C.remainingMs,
				segment: C.segment
			} : null,
			dealerMoved: x.dealerMovedPlayerId === t.playerId,
			winnerFlash: x.winnerFlashPlayerId === t.playerId,
			bankrollTick: x.bankrollTicks[t.playerId] ?? null,
			bourreAlert: t.isSelf ? x.bourreAlerts[t.playerId] ?? null : null,
			bourrePressure: le.has(t.playerId)
		};
	}), de = P.find((e) => e.isSelf), fe = y.suppressTurnPlayerId || b.suppressTurnIndicator, pe = !!(p && e.drawCompletedIds?.includes(p));
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		ref: ie,
		className: [
			"btable-wrap btable-wrap--stage-fit",
			I,
			ue.some((e) => e.isActiveActor) ? "btable-wrap--has-active-turn" : "",
			ce ? "btable-wrap--clockwise-dealing" : ""
		].filter(Boolean).join(" "),
		"data-testid": "table-root",
		style: {
			"--player-count": ne,
			"--table-aspect": L,
			"--trick-card-travel-ms": "395ms",
			"--trick-card-settle-ms": "165ms",
			"--trick-card-shift-ms": "220ms",
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": `${jl}ms`,
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": `${kl}ms`,
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": `${kl + 400 + jl + 230}ms`,
			"--deal-card-stagger-ms": `${R.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${R.drawDiscardMs}ms`,
			"--draw-replace-ms": `${R.drawReplaceMs}ms`
		},
		children: [/* @__PURE__ */ (0, w.jsx)("div", {
			className: "btable-wrap__table-area",
			children: /* @__PURE__ */ (0, w.jsx)("div", {
				className: "btable-wrap__stage-scaler",
				children: /* @__PURE__ */ (0, w.jsx)("div", {
					className: "table-stage-fit",
					children: /* @__PURE__ */ (0, w.jsxs)("div", {
						className: "table-stage",
						children: [
							/* @__PURE__ */ (0, w.jsxs)("div", {
								className: "table-oval",
								children: [/* @__PURE__ */ (0, w.jsx)("div", { className: "btable__rail" }), /* @__PURE__ */ (0, w.jsx)("div", {
									className: "btable__felt",
									"data-testid": "table-felt"
								})]
							}),
							/* @__PURE__ */ (0, w.jsx)("div", {
								className: "btable__play-zone",
								children: /* @__PURE__ */ (0, w.jsx)(Xl, {
									potMetrics: {
										...n,
										currentPot: b.displayPotAmount
									},
									participantCount: r,
									trumpUpcard: e.trumpUpcard,
									trumpSuit: e.trumpSuit,
									phase: e.phase,
									enrollmentActive: i,
									remainingDeckCount: e.remainingDeckCount,
									trickDisplayPlays: y.displayPlays,
									trickLeadSuit: e.currentTrick?.leadSuit ?? e.leadSuit ?? null,
									trickWinnerPlayerId: y.winnerPlayerId,
									trickShowWinnerTag: y.showWinnerTag,
									trickPresentationPhase: y.phase,
									trickEchoPlays: y.trickEchoPlays,
									trickEchoWinnerId: y.trickEchoWinnerId,
									trickEchoPhase: y.trickEchoPhase,
									showFinalTrickEcho: y.showFinalTrickEcho,
									playerNames: re,
									anteAnimActive: b.anteAnimActive,
									trumpRevealActive: b.trumpRevealActive,
									hideCenterTrump: l,
									showTrumpSuitReminder: u,
									drawAnimPlayerId: b.animatingDrawPlayerId,
									drawAnimSubPhase: b.drawAnimSubPhase,
									drawDiscardCount: b.drawDiscardCount,
									settleAnimActive: b.settleAnimActive,
									settleCarryOver: b.settleCarryOver,
									potTick: x.potTick,
									trumpReminderPulse: x.trumpReminderPulse,
									instantTrickPlays: S,
									peakTrickPlayCount: y.peakPlayCount,
									discardPileCards: ae
								})
							}),
							/* @__PURE__ */ (0, w.jsx)("div", {
								className: "btable__seats",
								"aria-label": "Players at the table",
								children: F.map((e, t) => {
									let n = ku(t, F.length, {
										isMobile: !1,
										isSelf: e.isSelf
									}), r = ue.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, w.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										"data-seat-index": t,
										children: /* @__PURE__ */ (0, w.jsx)(ru, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											clockwiseDealing: ce,
											style: {
												left: `${n.x}%`,
												top: `${n.y}%`
											},
											onToggleInHand: () => D(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
											onPassEnrollment: e.canPassEnrollment && O ? () => O(e.playerId) : void 0,
											onTrickDelta: (t) => k(e.playerId, t),
											onReaction: e.isSelf ? M : void 0
										})
									}, e.playerId);
								})
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ (0, w.jsxs)("div", {
			className: "hand-panel",
			children: [T && Zc(a) && E && /* @__PURE__ */ (0, w.jsx)(Xc, {
				event: T,
				onDismiss: E
			}), /* @__PURE__ */ (0, w.jsx)(Yc, {
				cards: a,
				privateHandReady: f,
				phase: e.phase,
				enrollmentActive: i,
				isInHand: !!de?.inHand,
				isDealer: !!de?.isDealer,
				signedIn: !!p,
				isMyTurn: !!(p && e.turnPlayerId === p) && !fe,
				dealStaggerMs: R.dealCardStaggerMs,
				drawAnimSubPhase: b.animatingDrawPlayerId === p ? b.drawAnimSubPhase : null,
				drawDiscardCount: b.animatingDrawPlayerId === p ? b.drawDiscardCount : 0,
				drawReplaceCount: b.animatingDrawPlayerId === p ? b.drawReplaceCount : 0,
				drawCompleted: pe,
				maxDrawDiscards: e.maxDrawDiscards ?? 4,
				legalPlayIndices: m ?? void 0,
				recommendedPlayIndex: h ?? void 0,
				recommendedDiscardIndices: g,
				handComplete: _,
				actionFeedback: v,
				onSubmitDraw: ee,
				onPassDraw: A,
				onFoldDraw: te,
				onPlayCard: j,
				currentUserId: p,
				revealedTrumpIndex: o,
				trumpMergeActive: s,
				trumpDisabledIndex: c,
				handNumber: e.handNumber,
				tableRootRef: ie,
				pileIndexRef: oe,
				onDiscardCommitted: se,
				onUserActivity: N,
				skipHeroDealMotion: ce
			})]
		})]
	});
}
//#endregion
//#region src/table/layout/mobileSeatMap.ts
function $d(e, t) {
	let n = Math.max(1, Math.min(7, e || 1));
	return t === "portrait" ? n <= 1 ? .8 : n <= 2 ? .82 : n <= 3 ? .86 : n <= 4 ? .9 : .94 : n <= 1 ? 1.02 : n <= 2 ? .98 : n <= 3 ? 1.02 : n <= 5 ? 1.16 : 1.26;
}
//#endregion
//#region src/table/layout/useTableLayoutMode.ts
var ef = "(orientation: portrait)";
function tf() {
	let e = ad(), [t, n] = (0, _.useState)(() => typeof window < "u" && window.matchMedia(ef).matches);
	return (0, _.useEffect)(() => {
		let e = window.matchMedia(ef), t = () => n(e.matches);
		return t(), e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []), e ? t ? "mobile-portrait" : "mobile-landscape" : "desktop";
}
//#endregion
//#region src/table/hooks/useMobileStageFit.ts
function nf(e, t) {
	if (typeof window > "u") return t;
	let n = getComputedStyle(document.documentElement).getPropertyValue(e).trim(), r = parseFloat(n);
	return Number.isFinite(r) ? r : t;
}
function rf(e) {
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
function af(e) {
	return e.closest(".btable-mobile__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function of({ aspect: e, sessionKey: t }) {
	let n = (0, _.useRef)(null), r = (0, _.useRef)(0), i = (0, _.useRef)(0), a = (0, _.useRef)(t), o = tf(), { settings: s } = Kc(), c = o === "mobile-portrait";
	return (0, _.useLayoutEffect)(() => {
		if (typeof window > "u") return;
		let o = n.current;
		if (!o) return;
		a.current !== t && (a.current = t, r.current = 0, i.current = 0);
		let l = window.visualViewport, u = () => {
			let t = af(o).getBoundingClientRect(), n = o.querySelector(".btable-mobile-hero-dock")?.getBoundingClientRect(), a = !!o.closest(".table-play-overlay"), u = c ? 104 : 92, d = c ? 210 : 168, f = Bu(n?.height ?? 0, r.current, u, d);
			r.current = f.peak;
			let p = f.height, m = parseInt(getComputedStyle(o).getPropertyValue("--player-count").trim(), 10) || 4, h = m <= 4, g = !c, _ = (g && h ? nf("--mobile-fit-pad-x", 4) : nf("--mobile-fit-pad-x", 8)) + (g && a ? 4 : 12), v = (g && h ? nf("--mobile-fit-pad-y", 2) : nf("--mobile-fit-pad-y", 6)) + (g && a ? 4 : 10), y = nf("--mobile-fit-gap", c ? 8 : 6), b = l, x = Math.min(t.width, b?.width ?? window.innerWidth), S = Math.min(t.height, b?.height ?? window.innerHeight);
			if (a) {
				let e = Vu(rf(o), i.current, 72);
				i.current = e.peak, S = Math.max(140, S - e.height);
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = g ? {
				...Wu({
					availWidth: x,
					availHeight: S,
					aspect: e,
					userScale: 1,
					padX: _,
					padY: v,
					stageShare: Uu(m)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : Gu({
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
			$u() || td() || (d ??= window.requestAnimationFrame(() => {
				d = null, u();
			}));
		}, p = new ResizeObserver(f), m = o.querySelector(".btable-mobile-hero-dock");
		m && p.observe(m);
		let h = af(o);
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
function sf({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: l = !1, showTrumpSuitReminder: u = !1, trumpHolderPresentation: d, privateHandReady: f = !1, currentUserId: p = null, legalPlayIndices: m, recommendedPlayIndex: h, recommendedDiscardIndices: g = [], handComplete: _ = !1, actionFeedback: v, trickPresentation: y, handPresentation: b, microinteractions: x, instantTrickPlays: S = !1, turnCountdown: C = null, bigPotEvent: T = null, onDismissTableEvent: E, onToggleInHand: D, onPassEnrollment: O, onTrickDelta: k, onSubmitDraw: ee, onPassDraw: A, onFoldDraw: te, onPlayCard: j, onHeroUserActivity: M }) {
	let N = tf() === "mobile-landscape" ? "landscape" : "portrait", P = t.map((e) => ({
		...e,
		isSelf: e.isSelf || p != null && e.playerId === p
	})), F = au(P, e, p), ne = F.filter((e) => !e.isSelf), I = F.find((e) => e.isSelf), L = I ? ju(F.length, N) : null, re = F.length, R = `btable--p${Math.min(8, Math.max(2, re))}`, z = $d(ne.length, N), ie = Object.fromEntries(t.map((e) => [e.playerId, e.displayName])), ae = Lu(), oe = e.sessionId, se = of({
		aspect: z,
		sessionKey: oe
	}), { cards: ce, pileIndexRef: le, commitDiscardCards: ue } = Wa({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: se
	});
	dd({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: p,
		tableRootRef: se,
		pileIndexRef: le,
		onDiscardCommitted: ue
	}), fd({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: p,
		tableRootRef: se
	}), md({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: p,
		handPresentation: b,
		tableRootRef: se
	});
	let de = wd({
		session: e,
		heroCards: a,
		privateHandReady: f,
		tableRootRef: se
	});
	Kd({
		trickPresentation: y,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: _,
		tableRootRef: se
	});
	let fe = new Set(e.participantIds.filter((t) => fl(t, y.displayTricksByPlayer, e.participantIds, e.phase))), pe = P.map((t) => {
		let r = y.displayTricksByPlayer[t.playerId] ?? 0, i = y.trickWinnerSeatId === t.playerId, a = y.suppressTurnPlayerId || b.suppressTurnIndicator, o = y.phase === "collectTrick" && i, s = b.enrollmentPulse[t.playerId], c = b.animatingDrawPlayerId === t.playerId, l = Zd(t.playerId, d, e.trumpUpcard ?? null, t.holeCardCount ?? 0, t.isSelf);
		return {
			...t,
			...l,
			bankroll: vl(t.bankroll, n.anteAmount, {
				inHand: t.inHand,
				anteAnimActive: b.anteAnimActive,
				anteAlreadyPosted: e.postedAntes != null && Object.prototype.hasOwnProperty.call(e.postedAntes, t.playerId)
			}),
			tricksThisHand: r,
			isOnTurn: a ? !1 : t.isOnTurn,
			isActiveActor: a ? !1 : t.isActiveActor,
			isLeading: i && (y.phase === "winnerReveal" || y.phase === "collectTrick") ? !0 : a ? !1 : t.isLeading,
			isTrickCapture: o,
			enrollmentPulse: s,
			drawAnimSubPhase: c && t.isSelf ? b.drawAnimSubPhase : null,
			drawDiscardCount: c ? b.drawDiscardCount : 0,
			drawReplaceCount: c ? b.drawReplaceCount : 0,
			turnHandoff: !1,
			turnCountdown: C?.playerId === t.playerId ? {
				progress: C.progress,
				remainingMs: C.remainingMs,
				segment: C.segment
			} : null,
			dealerMoved: x.dealerMovedPlayerId === t.playerId,
			winnerFlash: x.winnerFlashPlayerId === t.playerId,
			bankrollTick: x.bankrollTicks[t.playerId] ?? null,
			bourreAlert: t.isSelf ? x.bourreAlerts[t.playerId] ?? null : null,
			bourrePressure: fe.has(t.playerId)
		};
	}), B = P.find((e) => e.isSelf), me = y.suppressTurnPlayerId || b.suppressTurnIndicator, he = !!(p && e.drawCompletedIds?.includes(p));
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		ref: se,
		className: [
			"btable-mobile-wrap btable-mobile-wrap--stage-fit",
			R,
			pe.some((e) => e.isActiveActor) ? "btable-wrap--has-active-turn" : "",
			de ? "btable-wrap--clockwise-dealing" : ""
		].filter(Boolean).join(" "),
		"data-testid": "table-root",
		"data-layout": N,
		style: {
			"--player-count": re,
			"--table-aspect": z,
			"--trick-card-travel-ms": "395ms",
			"--trick-card-settle-ms": "165ms",
			"--trick-card-shift-ms": "220ms",
			"--trick-card-land-ms": "560ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": `${jl}ms`,
			"--trick-rake-ms": "240ms",
			"--trick-post-read-ms": `${kl}ms`,
			"--trick-next-lead-gap-ms": "230ms",
			"--trick-final-pipeline-ms": `${kl + 400 + jl + 230}ms`,
			"--deal-card-stagger-ms": `${ae.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${ae.drawDiscardMs}ms`,
			"--draw-replace-ms": `${ae.drawReplaceMs}ms`
		},
		children: [/* @__PURE__ */ (0, w.jsx)("div", {
			className: "btable-mobile__table-area",
			children: /* @__PURE__ */ (0, w.jsx)("div", {
				className: "btable-mobile__stage-scaler",
				children: /* @__PURE__ */ (0, w.jsx)("div", {
					className: "btable-mobile-stage-fit",
					children: /* @__PURE__ */ (0, w.jsxs)("div", {
						className: "btable-mobile-stage table-stage",
						children: [
							/* @__PURE__ */ (0, w.jsxs)("div", {
								className: "table-oval btable-mobile-oval",
								children: [/* @__PURE__ */ (0, w.jsx)("div", { className: "btable__rail" }), /* @__PURE__ */ (0, w.jsx)("div", {
									className: "btable__felt",
									"data-testid": "table-felt"
								})]
							}),
							/* @__PURE__ */ (0, w.jsx)("div", {
								className: "btable__play-zone",
								children: /* @__PURE__ */ (0, w.jsx)(Xl, {
									potMetrics: {
										...n,
										currentPot: b.displayPotAmount
									},
									participantCount: r,
									trumpUpcard: e.trumpUpcard,
									trumpSuit: e.trumpSuit,
									phase: e.phase,
									enrollmentActive: i,
									remainingDeckCount: e.remainingDeckCount,
									trickDisplayPlays: y.displayPlays,
									trickLeadSuit: e.currentTrick?.leadSuit ?? e.leadSuit ?? null,
									trickWinnerPlayerId: y.winnerPlayerId,
									trickShowWinnerTag: y.showWinnerTag,
									trickPresentationPhase: y.phase,
									trickEchoPlays: y.trickEchoPlays,
									trickEchoWinnerId: y.trickEchoWinnerId,
									trickEchoPhase: y.trickEchoPhase,
									showFinalTrickEcho: y.showFinalTrickEcho,
									playerNames: ie,
									anteAnimActive: b.anteAnimActive,
									trumpRevealActive: b.trumpRevealActive,
									hideCenterTrump: l,
									showTrumpSuitReminder: u,
									drawAnimPlayerId: b.animatingDrawPlayerId,
									drawAnimSubPhase: b.drawAnimSubPhase,
									drawDiscardCount: b.drawDiscardCount,
									settleAnimActive: b.settleAnimActive,
									settleCarryOver: b.settleCarryOver,
									potTick: x.potTick,
									trumpReminderPulse: x.trumpReminderPulse,
									instantTrickPlays: S,
									peakTrickPlayCount: y.peakPlayCount,
									discardPileCards: ce
								})
							}),
							/* @__PURE__ */ (0, w.jsxs)("div", {
								className: "btable__seats btable-mobile__seats",
								"aria-label": "Players at the table",
								children: [ne.map((e, t) => {
									let n = Au(t, F.length, N), r = pe.find((t) => t.playerId === e.playerId) ?? e;
									return /* @__PURE__ */ (0, w.jsx)("div", {
										className: `btable__seat-slot btable__seat-slot--${t}`,
										"data-seat-index": t + 1,
										children: /* @__PURE__ */ (0, w.jsx)(ru, {
											player: r,
											region: n.region,
											handLane: n.handLane,
											clockwiseDealing: de,
											style: {
												left: `${n.x}%`,
												top: `${n.y}%`
											},
											onToggleInHand: () => D(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
											onPassEnrollment: e.canPassEnrollment && O ? () => O(e.playerId) : void 0,
											onTrickDelta: (t) => k(e.playerId, t),
											onReaction: void 0
										})
									}, e.playerId);
								}), I && L && /* @__PURE__ */ (0, w.jsx)("div", {
									className: "btable__seat-slot btable__seat-slot--self",
									"data-seat-index": 0,
									children: /* @__PURE__ */ (0, w.jsx)(ru, {
										player: pe.find((e) => e.playerId === I.playerId) ?? I,
										region: L.region,
										handLane: L.handLane,
										clockwiseDealing: de,
										style: {
											left: `${L.x}%`,
											top: `${L.y}%`
										},
										onToggleInHand: () => D(I.playerId, I.canToggleInHand ? !0 : !I.inHand),
										onPassEnrollment: I.canPassEnrollment && O ? () => O(I.playerId) : void 0,
										onTrickDelta: (e) => k(I.playerId, e),
										onReaction: void 0
									})
								}, I.playerId)]
							})
						]
					})
				})
			})
		}), /* @__PURE__ */ (0, w.jsxs)("div", {
			className: "btable-mobile-hero-dock hand-panel",
			children: [/* @__PURE__ */ (0, w.jsxs)("div", {
				className: "btable-mobile-hero-dock__stack",
				children: [T && Zc(a) && E && /* @__PURE__ */ (0, w.jsx)(Xc, {
					event: T,
					onDismiss: E
				}), /* @__PURE__ */ (0, w.jsx)(Yc, {
					cards: a,
					privateHandReady: f,
					phase: e.phase,
					enrollmentActive: i,
					isInHand: !!B?.inHand,
					isDealer: !!B?.isDealer,
					signedIn: !!p,
					isMyTurn: !!(p && e.turnPlayerId === p) && !me,
					dealStaggerMs: ae.dealCardStaggerMs,
					drawAnimSubPhase: b.animatingDrawPlayerId === p ? b.drawAnimSubPhase : null,
					drawDiscardCount: b.animatingDrawPlayerId === p ? b.drawDiscardCount : 0,
					drawReplaceCount: b.animatingDrawPlayerId === p ? b.drawReplaceCount : 0,
					drawCompleted: he,
					maxDrawDiscards: e.maxDrawDiscards ?? 4,
					legalPlayIndices: m ?? void 0,
					recommendedPlayIndex: h ?? void 0,
					recommendedDiscardIndices: g,
					handComplete: _,
					actionFeedback: v,
					onSubmitDraw: ee,
					onPassDraw: A,
					onFoldDraw: te,
					onPlayCard: j,
					currentUserId: p,
					revealedTrumpIndex: o,
					trumpMergeActive: s,
					trumpDisabledIndex: c,
					handNumber: e.handNumber,
					tableRootRef: se,
					pileIndexRef: le,
					onDiscardCommitted: ue,
					onUserActivity: M,
					skipHeroDealMotion: de
				})]
			}), i && !B?.inHand && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-mobile-hero-dock__hint muted small",
				children: "Tap I'm in above to join this hand"
			})]
		})]
	});
}
//#endregion
//#region src/table/CinematicSplash.tsx
var cf = new Set(["pot-cap", "hand-win"]);
function lf({ events: e, onDismiss: t }) {
	let n = [...e].reverse().find((e) => cf.has(e.kind));
	return (0, _.useEffect)(() => {
		if (!n) return;
		let e = window.setTimeout(() => t(n.id), n.durationMs ?? 2200);
		return () => window.clearTimeout(e);
	}, [n, t]), n ? /* @__PURE__ */ (0, w.jsxs)("div", {
		className: `bsplash bsplash--${n.kind}`,
		role: "status",
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, w.jsx)("div", {
			className: "bsplash__glow",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, w.jsxs)("div", {
			className: "bsplash__content",
			children: [
				n.emoji && /* @__PURE__ */ (0, w.jsx)("span", {
					className: "bsplash__emoji",
					children: n.emoji
				}),
				/* @__PURE__ */ (0, w.jsx)("p", {
					className: "bsplash__title",
					children: n.title
				}),
				n.subtitle && /* @__PURE__ */ (0, w.jsx)("p", {
					className: "bsplash__subtitle",
					children: n.subtitle
				})
			]
		})]
	}) : null;
}
//#endregion
//#region src/table/DesktopLayoutShell.tsx
function uf({ children: e }) {
	let { settings: t } = Kc(), n = t.layoutMode === "tiled", r = ad();
	return /* @__PURE__ */ (0, w.jsx)("div", {
		className: [
			"btable-desktop",
			n ? "btable-desktop--tiled" : "btable-desktop--single",
			r ? "btable-desktop--native-mobile" : ""
		].join(" "),
		children: /* @__PURE__ */ (0, w.jsxs)("div", {
			className: "btable-desktop__viewport",
			children: [/* @__PURE__ */ (0, w.jsx)("div", {
				className: "btable-desktop__scale",
				children: e
			}), n && /* @__PURE__ */ (0, w.jsxs)("div", {
				className: "btable-desktop__tile-placeholder muted small",
				"aria-hidden": "true",
				children: [/* @__PURE__ */ (0, w.jsx)("span", { children: "Multi-room tile slot" }), /* @__PURE__ */ (0, w.jsx)("span", { children: "Monitor additional tables here in a future release" })]
			})]
		})
	});
}
//#endregion
//#region src/table/MobileLayoutShell.tsx
function df({ children: e }) {
	let t = tf();
	return /* @__PURE__ */ (0, w.jsx)("div", {
		className: ["btable-mobile", `btable-mobile--${t === "mobile-landscape" ? "landscape" : "portrait"}`].join(" "),
		"data-layout-mode": t,
		children: /* @__PURE__ */ (0, w.jsx)("div", {
			className: "btable-mobile__viewport",
			children: /* @__PURE__ */ (0, w.jsx)("div", {
				className: "btable-mobile__frame",
				children: /* @__PURE__ */ (0, w.jsx)("div", {
					className: "btable-mobile__layout",
					children: e
				})
			})
		})
	});
}
//#endregion
//#region src/table/EventReactions.tsx
function ff({ events: e, onDismiss: t }) {
	let n = e.filter((e) => e.emoji && e.kind === "reaction");
	return (0, _.useEffect)(() => {
		let e = n.map((e) => window.setTimeout(() => t(e.id), e.durationMs ?? 1600));
		return () => e.forEach((e) => window.clearTimeout(e));
	}, [n, t]), n.length ? /* @__PURE__ */ (0, w.jsx)("div", {
		className: "breactions",
		"aria-hidden": "true",
		children: n.map((e, t) => /* @__PURE__ */ (0, w.jsx)("div", {
			className: "breactions__burst",
			style: { "--burst-i": t },
			children: /* @__PURE__ */ (0, w.jsx)("span", {
				className: "breactions__emoji",
				children: e.emoji
			})
		}, e.id))
	}) : null;
}
//#endregion
//#region src/table/FeedbackSettings.tsx
function pf({ compact: e = !1 }) {
	let [t, n] = (0, _.useState)(() => fs()), [r, i] = (0, _.useState)(!1);
	(0, _.useEffect)(() => gs(n), []);
	let a = Xs(), o = nc();
	function s(e) {
		ps({ soundMode: e });
	}
	function c(e) {
		ps({ soundPackId: e }), Zs(), ks(e);
	}
	function l(e) {
		ps({ hapticsMode: e });
	}
	let u = /* @__PURE__ */ (0, w.jsxs)("div", {
		className: `bfeedback-settings${e ? " bfeedback-settings--compact" : ""}`,
		children: [
			/* @__PURE__ */ (0, w.jsxs)("fieldset", {
				className: "bfeedback-settings__fieldset",
				children: [
					/* @__PURE__ */ (0, w.jsx)("legend", {
						className: "bfeedback-settings__label",
						children: "Sound level"
					}),
					/* @__PURE__ */ (0, w.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, w.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "on",
							disabled: !a,
							onChange: () => s("on")
						}), "On"]
					}),
					/* @__PURE__ */ (0, w.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, w.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "minimal",
							disabled: !a,
							onChange: () => s("minimal")
						}), "Minimal"]
					}),
					/* @__PURE__ */ (0, w.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, w.jsx)("input", {
							type: "radio",
							name: "sound-mode",
							checked: t.soundMode === "off",
							onChange: () => s("off")
						}), "Off"]
					})
				]
			}),
			!a && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "bfeedback-settings__note muted small",
				children: "Audio not supported in this browser."
			}),
			/* @__PURE__ */ (0, w.jsxs)("label", {
				className: "bfeedback-settings__row",
				children: [/* @__PURE__ */ (0, w.jsx)("span", {
					className: "bfeedback-settings__label",
					children: "Sound theme"
				}), /* @__PURE__ */ (0, w.jsx)("select", {
					value: t.soundPackId,
					disabled: !a || t.soundMode === "off",
					onChange: (e) => c(e.target.value),
					children: Object.keys(ns).map((e) => /* @__PURE__ */ (0, w.jsx)("option", {
						value: e,
						children: ns[e]
					}, e))
				})]
			}),
			/* @__PURE__ */ (0, w.jsxs)("fieldset", {
				className: "bfeedback-settings__fieldset",
				children: [
					/* @__PURE__ */ (0, w.jsx)("legend", {
						className: "bfeedback-settings__label",
						children: "Haptics"
					}),
					/* @__PURE__ */ (0, w.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, w.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "on",
							disabled: !o,
							onChange: () => l("on")
						}), "On"]
					}),
					/* @__PURE__ */ (0, w.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, w.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "minimal",
							disabled: !o,
							onChange: () => l("minimal")
						}), "Minimal"]
					}),
					/* @__PURE__ */ (0, w.jsxs)("label", {
						className: "bfeedback-settings__radio",
						children: [/* @__PURE__ */ (0, w.jsx)("input", {
							type: "radio",
							name: "haptics-mode",
							checked: t.hapticsMode === "off",
							onChange: () => l("off")
						}), "Off"]
					})
				]
			}),
			!o && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "bfeedback-settings__note muted small",
				children: "Vibration unavailable on this device."
			})
		]
	});
	return e ? /* @__PURE__ */ (0, w.jsxs)("div", {
		className: "bfeedback-settings-wrap",
		children: [/* @__PURE__ */ (0, w.jsx)("button", {
			type: "button",
			className: "bfeedback-settings__toggle btn btn--sm",
			"aria-expanded": r,
			"aria-controls": "table-feedback-settings",
			onClick: () => i((e) => !e),
			children: r ? "Hide feedback" : "Sound & haptics"
		}), r && /* @__PURE__ */ (0, w.jsx)("div", {
			id: "table-feedback-settings",
			className: "bfeedback-settings__popover",
			children: u
		})]
	}) : u;
}
//#endregion
//#region src/table/TableSettingsPanel.tsx
function mf({ open: e, onClose: t }) {
	let { settings: n, updateSettings: r, resetSettings: i } = Kc();
	return e ? /* @__PURE__ */ (0, w.jsxs)("div", {
		className: "bsettings",
		role: "dialog",
		"aria-label": "Table appearance",
		"data-testid": "settings-panel",
		children: [/* @__PURE__ */ (0, w.jsxs)("div", {
			className: "bsettings__panel",
			children: [
				/* @__PURE__ */ (0, w.jsxs)("header", {
					className: "bsettings__head",
					children: [/* @__PURE__ */ (0, w.jsx)("h6", {
						className: "bsettings__title",
						children: "Table room"
					}), /* @__PURE__ */ (0, w.jsx)("button", {
						type: "button",
						className: "bsettings__close",
						onClick: t,
						"aria-label": "Close",
						children: "×"
					})]
				}),
				/* @__PURE__ */ (0, w.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, w.jsx)("span", { children: "Theme" }), /* @__PURE__ */ (0, w.jsx)("select", {
						value: n.themeId,
						onChange: (e) => r({ themeId: e.target.value }),
						children: Object.keys(Rc).map((e) => /* @__PURE__ */ (0, w.jsx)("option", {
							value: e,
							children: Rc[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, w.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, w.jsx)("span", { children: "Card style" }), /* @__PURE__ */ (0, w.jsx)("select", {
						value: n.cardPackId,
						onChange: (e) => r({ cardPackId: e.target.value }),
						children: Object.keys(Ic).map((e) => /* @__PURE__ */ (0, w.jsx)("option", {
							value: e,
							children: Ic[e]
						}, e))
					})]
				}),
				/* @__PURE__ */ (0, w.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, w.jsx)("span", { children: "Deck" }), /* @__PURE__ */ (0, w.jsxs)("select", {
						value: n.deckMode,
						onChange: (e) => r({ deckMode: e.target.value }),
						children: [/* @__PURE__ */ (0, w.jsx)("option", {
							value: "classic",
							children: "Classic two-color"
						}), /* @__PURE__ */ (0, w.jsx)("option", {
							value: "four-color",
							children: "Four-color contrast"
						})]
					})]
				}),
				/* @__PURE__ */ (0, w.jsxs)("label", {
					className: "bsettings__field",
					children: [/* @__PURE__ */ (0, w.jsx)("span", { children: "Card size" }), /* @__PURE__ */ (0, w.jsxs)("select", {
						value: n.cardScale,
						onChange: (e) => r({ cardScale: e.target.value }),
						children: [
							/* @__PURE__ */ (0, w.jsx)("option", {
								value: "sm",
								children: "Compact"
							}),
							/* @__PURE__ */ (0, w.jsx)("option", {
								value: "md",
								children: "Standard"
							}),
							/* @__PURE__ */ (0, w.jsx)("option", {
								value: "lg",
								children: "Large"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, w.jsxs)("label", {
					className: "bsettings__field bsettings__field--row",
					children: [
						/* @__PURE__ */ (0, w.jsx)("span", { children: "Table scale" }),
						/* @__PURE__ */ (0, w.jsx)("input", {
							type: "range",
							min: .85,
							max: 1.35,
							step: .05,
							value: n.tableScale,
							onChange: (e) => r({ tableScale: Number(e.target.value) })
						}),
						/* @__PURE__ */ (0, w.jsxs)("span", {
							className: "bsettings__range-val",
							children: [Math.round(n.tableScale * 100), "%"]
						})
					]
				}),
				/* @__PURE__ */ (0, w.jsxs)("label", {
					className: "bsettings__check",
					children: [/* @__PURE__ */ (0, w.jsx)("input", {
						type: "checkbox",
						checked: n.highContrast,
						onChange: (e) => r({ highContrast: e.target.checked })
					}), "High contrast"]
				}),
				/* @__PURE__ */ (0, w.jsxs)("fieldset", {
					className: "bsettings__fieldset",
					children: [
						/* @__PURE__ */ (0, w.jsx)("legend", { children: "Layout (scaffold)" }),
						/* @__PURE__ */ (0, w.jsxs)("label", {
							className: "bsettings__check",
							children: [/* @__PURE__ */ (0, w.jsx)("input", {
								type: "radio",
								name: "layout",
								checked: n.layoutMode === "single",
								onChange: () => r({ layoutMode: "single" })
							}), "Single table"]
						}),
						/* @__PURE__ */ (0, w.jsxs)("label", {
							className: "bsettings__check bsettings__check--muted",
							children: [/* @__PURE__ */ (0, w.jsx)("input", {
								type: "radio",
								name: "layout",
								checked: n.layoutMode === "tiled",
								onChange: () => r({ layoutMode: "tiled" })
							}), "Tiled multi-room (preview)"]
						})
					]
				}),
				/* @__PURE__ */ (0, w.jsxs)("details", {
					className: "bsettings__hotkeys",
					children: [/* @__PURE__ */ (0, w.jsx)("summary", { children: "Hotkeys (scaffold)" }), /* @__PURE__ */ (0, w.jsxs)("ul", {
						className: "bsettings__hotkey-list muted small",
						children: [
							/* @__PURE__ */ (0, w.jsxs)("li", { children: [/* @__PURE__ */ (0, w.jsx)("kbd", { children: n.hotkeys.focusTable }), " Focus table"] }),
							/* @__PURE__ */ (0, w.jsxs)("li", { children: [/* @__PURE__ */ (0, w.jsx)("kbd", { children: n.hotkeys.toggleSettings }), " Settings"] }),
							/* @__PURE__ */ (0, w.jsxs)("li", { children: [/* @__PURE__ */ (0, w.jsx)("kbd", { children: n.hotkeys.standPat }), " Stand pat (reserved)"] }),
							/* @__PURE__ */ (0, w.jsxs)("li", { children: [/* @__PURE__ */ (0, w.jsx)("kbd", { children: n.hotkeys.nextTable }), " Next table (reserved)"] })
						]
					})]
				}),
				/* @__PURE__ */ (0, w.jsx)("footer", {
					className: "bsettings__foot",
					children: /* @__PURE__ */ (0, w.jsx)("button", {
						type: "button",
						className: "btn btn--sm",
						onClick: i,
						children: "Reset defaults"
					})
				})
			]
		}), /* @__PURE__ */ (0, w.jsx)("button", {
			type: "button",
			className: "bsettings__backdrop",
			onClick: t,
			"aria-label": "Close"
		})]
	}) : null;
}
//#endregion
//#region src/table/hooks/useTableEvents.ts
var hf = 0;
function gf() {
	return hf += 1, `evt-${hf}-${Date.now()}`;
}
function _f(e, t, n) {
	let r = t.currentPot, i = [];
	return r >= t.potCap && t.limEnabled && r > e.pot ? i.push({
		id: gf(),
		kind: "pot-cap",
		title: "Pot cap reached",
		subtitle: "LmT engaged",
		emoji: "🔒",
		durationMs: 2200
	}) : r >= t.anteAmount * Math.max(n.length, 2) * 2 && r > e.pot && i.push({
		id: gf(),
		kind: "big-pot",
		title: "Big pot brewing",
		emoji: "💰",
		durationMs: 2e3
	}), i;
}
function vf({ session: e, potMetrics: t, participantIds: n }) {
	let [r, i] = (0, _.useState)([]), a = (0, _.useRef)(null), o = JSON.stringify({
		handNumber: e.handNumber,
		pot: t.currentPot,
		cap: t.potCap,
		lim: t.limEnabled,
		participants: n
	});
	return (0, _.useEffect)(() => {
		a.current = null;
	}, [e.handNumber]), (0, _.useEffect)(() => {
		let e = t.currentPot, r = a.current;
		if (a.current = { pot: e }, !r) return;
		let o = _f(r, t, n);
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
				id: gf(),
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
function yf(e) {
	return !e?.rank || !e?.suit ? "" : `${e.rank}-${e.suit}`;
}
function bf(e) {
	return e === "handReset" || e === "ante" || e === "trumpReveal" || e === "trumpMerge" || e === "drawPlayer" || e === "drawReady" || e === "settle" || e === "nextHandReset";
}
function xf(e) {
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
function Sf(e) {
	return e.phase === "play" ? "play" : e.phase === "draw" ? "drawPlayer" : e.phase === "decision" ? "decision" : e.phase === "reveal" ? "ante" : e.enrollmentActive ? "enrollment" : "idle";
}
function Cf(e) {
	return {
		phase: Sf(e),
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
function wf(e, t, n = {}) {
	return {
		...e,
		...n,
		phase: t,
		phaseStartedAt: Date.now()
	};
}
function Tf(e, t) {
	let n = {};
	for (let r of t.enrolledIds) e.enrolledIds.includes(r) || (n[r] = "join");
	for (let r of t.declinedIds) e.declinedIds.includes(r) || (n[r] = "pass");
	return n;
}
function Ef(e, t, n) {
	for (let r of n.drawCompletedIds) if (!Df(e, r) && !e.displayDrawCompletedIds.includes(r) && !t.drawCompletedIds.includes(r)) return r;
	return null;
}
function Df(e, t) {
	return e.drawPresentationConsumedIds.includes(t);
}
function Of(e) {
	return e.phase === "drawPlayer" && e.animatingDrawPlayerId != null && e.drawAnimSubPhase !== "done";
}
function kf(e, t) {
	if (t.phase !== "draw" || !Of(e)) return null;
	let n = e.animatingDrawPlayerId, r = t.turnPlayerId;
	return !n || !r || t.drawCompletedIds.includes(r) || n === r && !t.drawCompletedIds.includes(n) ? null : (Z() && Gl("handPresentation", "fast-forward-stale-draw", {
		animating: n,
		turnId: r,
		drawCompleted: t.drawCompletedIds
	}), {
		...Ff(e, t),
		pendingSnapshot: t,
		prevSnapshot: t
	});
}
function Af(e, t) {
	return !t || Df(e, t) ? e.drawPresentationConsumedIds : [...e.drawPresentationConsumedIds, t];
}
function jf(e, t) {
	return [...new Set([...e.drawPresentationConsumedIds, ...t])];
}
function Mf(e, t, n) {
	for (let r of t.actionOrder) if (t.participantIds.includes(r) && t.drawCompletedIds.includes(r) && !n.includes(r) && !Df(e, r)) return r;
	return null;
}
function Nf(e, t, n, r) {
	Z() && Gl("handPresentation", "draw-candidate-resolve", {
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
function Pf(e, t, n) {
	Z() && Gl("handPresentation", `draw-receive-commit-${e}`, {
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
function Ff(e, t) {
	let n = e.animatingDrawPlayerId;
	if (!n) return e.drawAnimSubPhase === "done" ? e : {
		...e,
		drawAnimSubPhase: "done"
	};
	let r = e.displayDrawCompletedIds.includes(n) ? e.displayDrawCompletedIds : [...e.displayDrawCompletedIds, n], i = Af(e, n), a = t == null ? e.prevSnapshot : {
		...t,
		drawCompletedIds: [...r]
	};
	return Pf("payload", e, {
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
function If(e, t) {
	return e > 0 ? "discard" : t > 0 ? "receive" : "done";
}
function Lf(e, t, n, r, i, a) {
	return Df(e, n) ? (Nf(e, t, null, `consumed-skip:${n}:${a}`), e) : Of(e) && e.animatingDrawPlayerId !== n ? (Nf(e, t, null, `in-flight-skip:${a}`), e) : (Nf(e, t, n, a), wf(e, "drawPlayer", {
		animatingDrawPlayerId: n,
		drawAnimSubPhase: If(r, i),
		drawDiscardCount: r,
		drawReplaceCount: i,
		prevSnapshot: t,
		drawPresentationConsumedIds: Af(e, n)
	}));
}
function Rf(e) {
	if (!e.pendingHandSettle || e.phase !== "play") return e;
	let t = e.handSettleSnapshot ?? e.prevSnapshot;
	return t ? wf(e, "settle", {
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		settleAnimActive: !0,
		settleCarryOver: t.carryOverPot > 0,
		prevSnapshot: t,
		displayPotAmount: t.potAmount
	}) : e;
}
function zf(e, t) {
	return wf(e, "ante", {
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
function Bf(e, t, n, r) {
	let i = Ef(e, {
		...t,
		drawCompletedIds: []
	}, t);
	return i ? Lf(e, t, i, n, r, "beginDrawSequence") : wf(e, "drawPlayer", {
		displayDrawCompletedIds: e.displayDrawCompletedIds,
		prevSnapshot: t
	});
}
function Vf(e, t) {
	let n = Hf(e, t);
	return Z() && (e.phase !== n.phase || e.handNumber !== n.handNumber || e.trumpRevealActive !== n.trumpRevealActive || t.type === "serverUpdate") && Gl("handPresentation", t.type, {
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
function Hf(e, t) {
	switch (t.type) {
		case "reset": return Cf(t.snapshot);
		case "dealCardRevealed": return {
			...e,
			dealStaggerCount: Math.max(e.dealStaggerCount, t.count)
		};
		case "clearEnrollmentPulse": return Object.keys(e.enrollmentPulse).length ? {
			...e,
			enrollmentPulse: {}
		} : e;
		case "watchdog": return e.pendingHandSettle && e.phase === "play" ? Rf(e) : Date.now() - e.phaseStartedAt < 12e3 ? e : Uf({
			...e,
			pendingSnapshot: e.pendingSnapshot ?? e.prevSnapshot
		});
		case "tryBeginHandSettle": return Rf(e);
		case "advancePhase": return Uf(e);
		case "serverUpdate": {
			let { snapshot: n, heroDrawDiscardCount: r = 0, heroDrawReplaceCount: i = 0 } = t, a = e.prevSnapshot ?? n;
			if (e.sessionKey !== n.sessionKey) {
				let e = Cf(n);
				return n.phase === "reveal" ? zf(e, n) : e;
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
				let e = Cf(n);
				return n.phase === "reveal" ? zf(e, n) : e;
			}
			let o = yf(a.trumpUpcard), s = yf(n.trumpUpcard);
			if (o && !s && !e.trumpMergeActive) return {
				...e,
				trumpRevealActive: !1,
				trumpMergeActive: !0,
				trumpMergedIntoHand: !0,
				prevSnapshot: n,
				pendingSnapshot: n,
				phaseStartedAt: Date.now()
			};
			if (n.phase === "play" && e.phase !== "play") return wf(e, "play", {
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
			if (bf(e.phase) && e.phase !== "drawPlayer" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done") return {
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
			let c = Tf(a, n), l = Object.keys(c).length > 0;
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
			if (n.phase === "reveal" && a.phase !== "reveal" && (e.phase === "idle" || e.phase === "nextHandReset" || e.phase === "enrollment" || e.phase === "settle" || e.phase === "play")) return zf(e, n);
			if (n.phase === "draw" && a.enrollmentActive && !n.enrollmentActive && e.phase === "enrollment") {
				let t = !!n.trumpUpcard;
				return wf(e, t ? "trumpReveal" : "ante", {
					trumpRevealActive: t,
					anteAnimActive: !0,
					dealStaggerCount: Math.max(e.dealStaggerCount, n.participantIds.length),
					prevSnapshot: n,
					displayPotAmount: n.potAmount
				});
			}
			if (n.phase === "draw" && (e.phase === "decision" || a.phase === "decision") && e.drawPresentationConsumedIds.length === 0 && e.displayDrawCompletedIds.length === 0 && e.phase !== "drawPlayer" && e.phase !== "drawReady") return Bf(e, n, 0, 0);
			if (n.phase === "draw") {
				let t = kf(e, n);
				t && (e = t);
				let o = Ef(e, a, n);
				if (o && e.phase !== "drawReady") {
					let t = e.phase === "drawPlayer" && e.animatingDrawPlayerId === o && e.drawAnimSubPhase !== "done";
					if (!t && !Of(e)) {
						let t = r > 0 || i > 0, a = t ? r : o === n.turnPlayerId ? 0 : 1;
						return Lf(e, n, o, a, t ? i : a, "serverUpdate");
					}
					t ? Nf(e, n, null, "serverUpdate:animating-same-player") : Of(e) && Nf(e, n, null, "serverUpdate:in-flight-other-player");
				} else o || Nf(e, n, null, "serverUpdate:no-candidate");
				if (n.drawCompletedIds.length === n.participantIds.length && n.participantIds.length > 0 && e.phase === "drawPlayer" && e.drawAnimSubPhase === "done") return wf(e, "drawReady", { prevSnapshot: n });
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
function Uf(e) {
	let t = e.pendingSnapshot ?? e.prevSnapshot;
	switch (e.phase) {
		case "handReset": return wf(e, "ante", {
			anteAnimActive: !0,
			pendingSnapshot: null
		});
		case "ante": return e.trumpRevealActive || t?.trumpUpcard ? wf(e, "trumpReveal", {
			trumpRevealActive: !0,
			anteAnimActive: !1,
			pendingSnapshot: null
		}) : t?.phase === "draw" ? Bf(e, t, 0, 0) : wf(e, "drawPlayer", {
			anteAnimActive: !1,
			pendingSnapshot: null
		});
		case "trumpReveal": return t?.phase === "draw" ? {
			...Bf(e, t, 0, 0),
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		} : wf(e, "drawPlayer", {
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		});
		case "trumpMerge": return t?.phase === "draw" ? {
			...Bf(e, t, 0, 0),
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0
		} : wf(e, "drawPlayer", {
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
			Pf("before", e);
			let n = e.animatingDrawPlayerId, r = Ff(e, t);
			Pf("after", r);
			let i = t ?? r.prevSnapshot;
			if (i && r.displayDrawCompletedIds.length >= i.participantIds.length) return wf(r, "drawReady", {
				displayDrawCompletedIds: r.displayDrawCompletedIds,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				pendingSnapshot: null,
				prevSnapshot: {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				},
				drawPresentationConsumedIds: jf(r, r.displayDrawCompletedIds)
			});
			if (i) {
				let e = {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				}, t = Mf(r, i, r.displayDrawCompletedIds);
				if (Pf("after", r, {
					playerId: n,
					nextCompleted: r.displayDrawCompletedIds,
					nextChosen: t
				}), t) return Nf(r, i, t, "advancePhase:nextPlayer"), Lf(r, e, t, 1, 1, "advancePhase:nextPlayer");
				Nf(r, i, null, "advancePhase:no-next-player");
			}
			return r;
		}
		case "drawReady": return wf(e, "play", { pendingSnapshot: null });
		case "settle": return wf(e, "nextHandReset", {
			settleAnimActive: !1,
			nextHandResetActive: !0,
			pendingSnapshot: null
		});
		case "nextHandReset": return t ? Cf(t) : wf(e, "idle", { nextHandResetActive: !1 });
		default: return e;
	}
}
function Wf(e) {
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
		isPresenting: bf(e.phase)
	};
}
function Gf(e, t = !1) {
	let n = Lu(t);
	switch (e.phase) {
		case "handReset": return n.handResetMs;
		case "ante": return n.anteChipTravelMs * Math.max(1, Math.min(e.dealStaggerCount, 8));
		case "trumpReveal": return n.trumpRevealHoldMs;
		case "trumpMerge": return n.trumpMergeAnimMs;
		case "drawPlayer": return e.drawAnimSubPhase === "done" ? 0 : Ru(e.drawAnimSubPhase === "receive" ? 0 : e.drawDiscardCount, e.drawAnimSubPhase === "receive" ? e.drawReplaceCount : 0, t);
		case "drawReady": return n.drawReadyBeatMs;
		case "settle": return n.settleHoldMs;
		case "nextHandReset": return n.nextHandResetMs;
		default: return 0;
	}
}
//#endregion
//#region src/table/hooks/useHandPresentation.ts
var Kf = [], qf = [];
function Jf(e, t) {
	let n = new Set(e), r = new Set(t);
	return {
		discardCount: [...n].filter((e) => !r.has(e)).length,
		replaceCount: [...r].filter((e) => !n.has(e)).length
	};
}
function Yf({ session: e, enrollmentActive: t, potAmount: n, handComplete: r, trickPipelineActive: i = !1, forceTrickHandEndDrain: a, heroCards: o = qf, enrolledIds: s = Kf, declinedIds: c = Kf, actionOrder: l }) {
	let u = (0, _.useMemo)(() => xf({
		sessionId: e.sessionId,
		handNumber: e.handNumber,
		phase: e.phase,
		enrollmentActive: t,
		participantIds: e.participantIds,
		actionOrder: l ?? e.participantIds,
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
		l
	]), [d, f] = (0, _.useReducer)(Vf, u, Cf), p = (0, _.useRef)([]), m = (0, _.useRef)([]), h = (0, _.useRef)(null), g = (0, _.useRef)(d);
	g.current = d;
	let v = () => {
		for (let e of p.current) window.clearTimeout(e);
		p.current = [], h.current = null;
	}, y = (e, t) => {
		let n = window.setTimeout(e, t);
		p.current.push(n);
	};
	return (0, _.useEffect)(() => () => v(), []), (0, _.useEffect)(() => {
		let e = o.map((e) => `${e.rank}-${e.suit}`), t = Jf(m.current, e);
		m.current = e, f({
			type: "serverUpdate",
			snapshot: u,
			heroDrawDiscardCount: t.discardCount,
			heroDrawReplaceCount: t.replaceCount
		}), Z() && Gl("useHandPresentation", "serverUpdate-effect", {
			handNumber: u.handNumber,
			serverPhase: u.phase,
			drawCompleted: u.drawCompletedIds.length,
			participantCount: u.participantIds.length,
			trumpUpcard: !!u.trumpUpcard,
			turnPlayerId: u.turnPlayerId
		});
	}, [u, o]), (0, _.useEffect)(() => {
		if (!Object.values(d.enrollmentPulse).some(Boolean)) return;
		let e = window.setTimeout(() => f({ type: "clearEnrollmentPulse" }), 480);
		return () => window.clearTimeout(e);
	}, [JSON.stringify(d.enrollmentPulse)]), (0, _.useEffect)(() => {
		let e = Vl(), t = `${d.handNumber}:${d.phase}:${d.animatingDrawPlayerId ?? ""}:${d.drawAnimSubPhase}:${d.phaseStartedAt}`;
		if (h.current === t) {
			Z() && Gl("useHandPresentation", "advancePhase-timer-skip-duplicate", { phaseKey: t });
			return;
		}
		v();
		let n = Gf(d, e);
		if (n <= 0) return;
		let r = {
			handNumber: d.handNumber,
			phase: d.phase,
			animatingDrawPlayerId: d.animatingDrawPlayerId,
			drawAnimSubPhase: d.drawAnimSubPhase,
			phaseStartedAt: d.phaseStartedAt
		};
		h.current = t, Z() && Gl("useHandPresentation", "advancePhase-timer-armed", {
			phaseKey: t,
			delay: n,
			fromPhase: d.phase,
			drawAnimSubPhase: d.drawAnimSubPhase
		}), y(() => {
			if (h.current !== t) return;
			h.current = null;
			let e = g.current;
			if (e.handNumber !== r.handNumber || e.phase !== r.phase || e.animatingDrawPlayerId !== r.animatingDrawPlayerId || e.drawAnimSubPhase !== r.drawAnimSubPhase || e.phaseStartedAt !== r.phaseStartedAt) {
				Z() && Gl("useHandPresentation", "advancePhase-timer-stale", {
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
			Z() && Gl("useHandPresentation", "advancePhase-timer", {
				fromPhase: r.phase,
				delay: n,
				animatingDrawPlayerId: r.animatingDrawPlayerId,
				drawAnimSubPhase: r.drawAnimSubPhase
			}), f({ type: "advancePhase" });
		}, n), y(() => f({ type: "watchdog" }), d.phase === "drawPlayer" || d.phase === "drawReady" ? Fu : Pu);
	}, [
		d.handNumber,
		d.phase,
		d.animatingDrawPlayerId,
		d.drawAnimSubPhase,
		d.phaseStartedAt
	]), (0, _.useEffect)(() => {
		if (e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play") {
			let e = o.length;
			e > 0 && f({
				type: "dealCardRevealed",
				count: e
			});
		}
	}, [o.length, e.phase]), (0, _.useEffect)(() => {
		i || f({ type: "tryBeginHandSettle" });
	}, [i]), (0, _.useEffect)(() => {
		if (d.phase !== "play" || !d.pendingHandSettle) return;
		if (!i) {
			f({ type: "tryBeginHandSettle" });
			return;
		}
		let e = window.setTimeout(() => {
			let e = g.current;
			e.phase !== "play" || !e.pendingHandSettle || (Z() && Gl("useHandPresentation", "hand-end-convergence-force", { trickPipelineActive: !0 }), a?.(), f({ type: "tryBeginHandSettle" }));
		}, Iu);
		return () => window.clearTimeout(e);
	}, [
		d.phase,
		d.pendingHandSettle,
		i,
		a
	]), Wf(d);
}
//#endregion
//#region src/session/liveHand.ts
function Xf() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function Zf(e) {
	let t = e ?? Xf();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function Qf(e) {
	if (!e) return !1;
	let t = e.phase ?? null;
	if (t !== "draw" && t !== "play" && t !== "reveal" && t !== "decision") return !1;
	let n = e.participantIds ?? [];
	if (n.length === 0) return !1;
	let r = e.tricksByPlayer ?? {};
	return !(ul(r, n) || ll(r, n) >= 5);
}
function $f(e) {
	if (!e) return 0;
	let t = e.phase ?? "", n = t === "play" ? 1e3 : t === "draw" ? 100 : t === "decision" ? 50 : t === "reveal" ? 25 : 0;
	n += (e.drawCompletedIds?.length ?? 0) * 10;
	let r = e.participantIds ?? [];
	n += ll(e.tricksByPlayer ?? {}, r);
	let i = e.handDecision;
	return t === "decision" && i && (n += (i.currentIndex ?? 0) * 5, n += (i.playingIds?.length ?? 0) * 2, n += (i.passedIds?.length ?? 0) * 2), n;
}
function ep(e, t) {
	return Qf(t) ? Qf(e) ? $f(t) >= $f(e) ? t : e : t : e;
}
function tp(e) {
	let t = e?.phase ?? null;
	return t === "reveal" || t === "decision" || t === "draw" || t === "play";
}
function np(e) {
	let t = e?.currentHand ?? Xf(), n = e?.liveEnrollment?.deal?.publicHand, r = n?.phase ?? null;
	if (Zf(t) && n && !Qf(n)) return Xf();
	if (Qf(t) && Qf(n)) {
		let e = t.phase === "reveal" || t.phase === "decision", r = n?.drawCompletedIds?.length ?? 0, i = t.drawCompletedIds?.length ?? 0, a = ll(n?.tricksByPlayer ?? {}, n?.participantIds ?? []), o = ll(t.tricksByPlayer ?? {}, t.participantIds ?? []);
		return e && n?.phase === "draw" && o === 0 && a === 0 && r > 0 && i === 0 ? t : ep(t, n);
	}
	if (Qf(t)) return t;
	if (r === "draw" || r === "play" || r === "reveal" || r === "decision") {
		if (Qf(n)) {
			let i = ll(n?.tricksByPlayer ?? {}, n?.participantIds ?? []);
			return Zf(t) && i === 0 && r === "draw" && !e?.liveEnrollment?.active ? Xf() : n;
		}
		return n?.phase ? n : tp(t) ? t : Zf(t) ? Xf() : t;
	}
	return r && n ? n : t;
}
function rp(e) {
	let t = np(e), n = t?.phase ?? null;
	if (n === "reveal" || n === "draw" || n === "play") return null;
	if (n === "decision") {
		let e = Po(t.handDecision ?? null);
		if (e?.active) return e;
	}
	let r = e?.liveEnrollment, i = r?.deal?.publicHand?.phase ?? null;
	return r?.active ? r : i === "draw" || i === "play" || i === "reveal" || i === "decision" ? null : e?.handEnrollment?.active ? e.handEnrollment : e?.handEnrollment ?? null;
}
function ip(e) {
	return !e.cardsDealt && e.handParticipantCount === 0 && e.enrollmentActive;
}
function ap(e, t) {
	return e === "decision" && t?.active === !0;
}
function op(e) {
	return e.pagatDecisionActive && e.handDecision ? (e.handDecision.orderedPlayerIds ?? [])[e.handDecision.currentIndex ?? 0] ?? null : e.legacyEnrollmentActive && e.enrollment?.active ? (e.enrollment.orderedPlayerIds ?? [])[e.enrollment.currentIndex ?? 0] ?? null : null;
}
function sp(e) {
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
}, cp = [
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
], lp = (e, t) => `${e}:${t}`;
new Map(cp.map((e) => [lp(e.from, e.event), e.to]));
function up(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
function dp(e, t) {
	return !e || !t ? !1 : e === t ? !0 : up(e);
}
function fp() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function pp(e) {
	let t = e.session, n = t ? np(t) : fp(), r = n.phase ?? null, i = n.participantIds ?? [], a = n.tricksByPlayer ?? {}, o = ll(a, i), s = i.length > 0 && ul(a, i), c = !!t?.pendingCoWinSettlement?.winnerIds?.length, l = t ? rp(t) : null, u = ap(r, n.handDecision ?? null), d = ip({
		cardsDealt: r === No.REVEAL || r === No.DECISION || r === No.DRAW || r === No.PLAY,
		handParticipantCount: i.length,
		enrollmentActive: !!l?.active
	}), f = d || u, p = mp({
		sessionStatus: t?.status ?? null,
		handPhase: r,
		participantIds: i,
		trickCount: o,
		handComplete: s,
		pendingCoWin: c,
		enrollmentActive: f,
		handCount: t?.handCount ?? 0,
		clearedHand: Zf(n)
	});
	return {
		phase: p,
		handPhase: r,
		enrollmentActive: f,
		pagatDecisionActive: u,
		participantIds: i,
		turnPlayerId: hp({
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
function mp(e) {
	if (e.sessionStatus === "final") return $.WAITING;
	if (e.pendingCoWin) return $.SETTLE;
	let t = e.handPhase ?? null, n = e.participantIds ?? [];
	return t === No.PLAY ? e.handComplete || (e.trickCount ?? 0) >= 5 ? $.SETTLE : $.PLAY : t === No.DRAW ? $.DRAW : t === No.REVEAL ? $.DEAL : t === No.DECISION || e.enrollmentActive ? $.ENROLLMENT : e.clearedHand !== !1 && n.length === 0 && (e.handCount ?? 0) > 0 && !e.enrollmentActive ? $.NEXT_HAND_PREP : $.WAITING;
}
function hp(e) {
	let { phase: t, hand: n, enrollment: r, pagatDecisionActive: i, legacyEnrollmentActive: a } = e;
	return t === $.ENROLLMENT ? op({
		pagatDecisionActive: i,
		handDecision: n.handDecision ?? null,
		legacyEnrollmentActive: a,
		enrollment: r
	}) : t === $.DRAW || t === $.PLAY ? n.turnPlayerId ?? null : null;
}
function gp(e) {
	let { snapshot: t, action: n, playerId: r, actorId: i, suppressTurn: a = !1 } = e, o = e.drawCompletedIds ?? [];
	if (!dp(r, i)) return {
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
var _p = 15e3, vp = new Set([
	$.ENROLLMENT,
	$.DRAW,
	$.PLAY
]);
function yp(e) {
	return e > 1e4 ? "green" : e > 5e3 ? "yellow" : "red";
}
function bp(e) {
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
function xp(e) {
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
function Sp(e) {
	if (e.handComplete || e.suppressTurn) return null;
	let t = pp({
		session: xp(e),
		suppressTurn: e.suppressTurn
	});
	return vp.has(t.phase) ? t.turnPlayerId : null;
}
function Cp(e, t, n) {
	let r = _p - Math.max(0, n - t) % _p;
	return {
		playerId: e,
		remainingMs: r,
		progress: r / _p,
		segment: yp(r)
	};
}
//#endregion
//#region src/table/hooks/useTurnCountdown.ts
function wp(e) {
	let t = Sp(e), n = bp({
		...e,
		activeActorId: t
	}), r = (0, _.useRef)(null), i = (0, _.useRef)(""), [a, o] = (0, _.useState)(() => Date.now());
	return (0, _.useEffect)(() => {
		if (!t) {
			r.current = null, i.current = n;
			return;
		}
		(n !== i.current || r.current == null) && (r.current = Date.now(), i.current = n, o(Date.now()));
	}, [t, n]), (0, _.useEffect)(() => {
		if (!t || r.current == null) return;
		let e = () => o(Date.now()), n = Vl() ? 250 : 100, i = window.setInterval(e, n);
		return () => window.clearInterval(i);
	}, [t, n]), {
		countdown: t && r.current != null ? Cp(t, r.current, a) : null,
		reducedMotion: Vl()
	};
}
//#endregion
//#region src/table/hooks/useTableMicrointeractions.ts
function Tp(e) {
	let [t, n] = (0, _.useState)(To), r = (0, _.useRef)(null), i = (0, _.useRef)([]), a = () => {
		for (let e of i.current) window.clearTimeout(e);
		i.current = [];
	}, o = (e, t) => {
		let n = window.setTimeout(e, t);
		i.current.push(n);
	};
	(0, _.useEffect)(() => () => a(), []);
	let s = JSON.stringify(e.tricksByPlayer), c = JSON.stringify(e.bankrollByPlayer), l = JSON.stringify(e.bourrePlayerIds);
	return (0, _.useEffect)(() => {
		let t = Do(r.current, e);
		if (r.current = Eo(e), !(!t.turnHandoffPlayerId && !t.dealerMovedPlayerId && !t.potTick && Object.keys(t.trickBadgeIncrements).length === 0 && Object.keys(t.bankrollChanges).length === 0 && t.bourrePlayerIds.length === 0 && !t.trumpReminderPulse && !t.feedbackErrorPulse && !t.feedbackSuccessPulse && !t.winnerFlashPlayerId)) {
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
			}, wo.turnHandoff), t.dealerMovedPlayerId && o(() => {
				n((e) => e.dealerMovedPlayerId === t.dealerMovedPlayerId ? {
					...e,
					dealerMovedPlayerId: null
				} : e);
			}, wo.dealerMove), t.winnerFlashPlayerId && o(() => {
				n((e) => e.winnerFlashPlayerId === t.winnerFlashPlayerId ? {
					...e,
					winnerFlashPlayerId: null
				} : e);
			}, wo.winnerFlash);
			for (let [e, r] of Object.entries(t.bankrollChanges)) o(() => {
				n((t) => {
					if (t.bankrollTicks[e] !== r) return t;
					let n = { ...t.bankrollTicks };
					return delete n[e], {
						...t,
						bankrollTicks: n
					};
				});
			}, wo.bankrollTick);
			for (let e of t.bourrePlayerIds) o(() => {
				n((t) => t.bourreAlerts[e] === "pulse" ? {
					...t,
					bourreAlerts: {
						...t.bourreAlerts,
						[e]: "marker"
					}
				} : t);
			}, wo.bourrePulse), o(() => {
				n((t) => {
					if (!t.bourreAlerts[e]) return t;
					let n = { ...t.bourreAlerts };
					return delete n[e], {
						...t,
						bourreAlerts: n
					};
				});
			}, wo.bourreMarker);
		}
	}, [
		e.turnPlayerId,
		e.dealerId,
		e.potAmount,
		s,
		c,
		l,
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
function Ep({ active: e, displayName: t }) {
	let [n, r] = (0, _.useState)(!1), i = Vl();
	return (0, _.useEffect)(() => {
		if (!e) {
			r(!1);
			return;
		}
		r(!0);
		let t = i ? 900 : 1400, n = window.setTimeout(() => r(!1), t);
		return () => window.clearTimeout(n);
	}, [e, i]), n ? /* @__PURE__ */ (0, w.jsxs)("div", {
		className: ["bbourre-sting", i ? "bbourre-sting--reduced" : ""].filter(Boolean).join(" "),
		"data-testid": "bourre-result-sting",
		role: "status",
		"aria-live": "polite",
		"aria-label": t ? `${t} went bourré` : "Bourré",
		children: [/* @__PURE__ */ (0, w.jsx)("div", {
			className: "bbourre-sting__wash",
			"aria-hidden": "true"
		}), /* @__PURE__ */ (0, w.jsxs)("div", {
			className: "bbourre-sting__badge",
			children: [/* @__PURE__ */ (0, w.jsx)("span", {
				className: "bbourre-sting__label",
				children: "Bourré"
			}), t ? /* @__PURE__ */ (0, w.jsx)("span", {
				className: "bbourre-sting__name muted small",
				children: t
			}) : null]
		})]
	}) : null;
}
//#endregion
//#region src/table/hooks/useYourTurnAttention.ts
var Dp = _p, Op = [
	12e3,
	18e3,
	24e3
];
function kp(e) {
	let [t, n] = (0, _.useState)("hidden"), [r, i] = (0, _.useState)(0), a = (0, _.useRef)(null), o = (0, _.useRef)(null), s = (0, _.useRef)(null), c = (0, _.useRef)(0), l = (0, _.useRef)(e.actionRequired);
	l.current = e.actionRequired;
	let u = () => {
		a.current != null && (window.clearTimeout(a.current), a.current = null), o.current != null && (window.clearTimeout(o.current), o.current = null), s.current != null && (window.clearTimeout(s.current), s.current = null);
	}, d = (0, _.useCallback)(() => {
		let e = c.current;
		if (e === 0) return;
		let t = Op[Math.min(e - 1, Op.length - 1)];
		a.current = window.setTimeout(() => {
			a.current = null, l.current && (i(e), n("pop"), c.current = e + 1);
		}, t);
	}, []);
	return (0, _.useEffect)(() => (u(), c.current = 0, e.actionRequired ? (a.current = window.setTimeout(() => {
		a.current = null, l.current && (i(0), n("pop"), c.current = 1);
	}, Dp), u) : (n("hidden"), i(0), u)), [e.activityKey, e.actionRequired]), (0, _.useEffect)(() => {
		if (t !== "pop") return;
		let e = Vl() ? 280 : 420;
		return o.current = window.setTimeout(() => {
			o.current = null, n("exit");
		}, 380 + e), () => {
			o.current != null && (window.clearTimeout(o.current), o.current = null);
		};
	}, [t, r]), (0, _.useEffect)(() => {
		if (t !== "exit") return;
		let e = Vl() ? 240 : 620;
		return s.current = window.setTimeout(() => {
			s.current = null, n("hidden"), l.current && d();
		}, e), () => {
			s.current != null && (window.clearTimeout(s.current), s.current = null);
		};
	}, [
		t,
		e.actionRequired,
		d
	]), {
		phase: t,
		beat: r
	};
}
function Ap() {
	return Vl();
}
//#endregion
//#region src/table/YourTurnAttention.tsx
function jp({ actionRequired: e, activityKey: t }) {
	let { phase: n, beat: r } = kp({
		actionRequired: e,
		activityKey: t
	});
	if (n === "hidden") return null;
	let i = Ap(), a = Math.min(r, 5);
	return /* @__PURE__ */ (0, w.jsx)("div", {
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
		children: /* @__PURE__ */ (0, w.jsx)("span", {
			className: "byour-turn__text",
			children: "Your Turn"
		})
	});
}
//#endregion
//#region src/table/hooks/useInactivityHelper.ts
var Mp = 5e3, Np = 1e3;
function Pp(e) {
	return e === "draw" ? "Choose discard and then tap" : e === "play" ? "Tap a card to play" : null;
}
function Fp(e) {
	let [t, n] = (0, _.useState)(!1), [r, i] = (0, _.useState)(!0), a = (0, _.useRef)(null), o = (0, _.useRef)(null), s = (0, _.useRef)(e.actionRequired);
	s.current = e.actionRequired;
	let c = Pp(e.phase), l = e.actionRequired && c != null && !e.hasUserInteracted;
	return (0, _.useEffect)(() => {
		if (a.current != null && (window.clearTimeout(a.current), a.current = null), n(!1), l) return a.current = window.setTimeout(() => {
			a.current = null, !(!s.current || e.hasUserInteracted) && (n(!0), i(!0));
		}, Mp), () => {
			a.current != null && (window.clearTimeout(a.current), a.current = null);
		};
	}, [
		e.activityKey,
		l,
		e.hasUserInteracted
	]), (0, _.useEffect)(() => {
		if (o.current != null && (window.clearInterval(o.current), o.current = null), !t || !l || Vl()) {
			i(!0);
			return;
		}
		return o.current = window.setInterval(() => {
			i((e) => !e);
		}, Np), () => {
			o.current != null && (window.clearInterval(o.current), o.current = null);
		};
	}, [
		t,
		l,
		e.activityKey
	]), {
		visible: t && l,
		text: c,
		flashOn: r
	};
}
//#endregion
//#region src/table/InactivityHelper.tsx
function Ip({ actionRequired: e, activityKey: t, phase: n, hasUserInteracted: r }) {
	let { visible: i, text: a, flashOn: o } = Fp({
		actionRequired: e,
		activityKey: t,
		phase: n,
		hasUserInteracted: r
	});
	return !i || !a ? null : /* @__PURE__ */ (0, w.jsx)("p", {
		className: ["btable-session__inactivity-helper", o ? "btable-session__inactivity-helper--on" : ""].filter(Boolean).join(" "),
		"data-testid": "inactivity-helper",
		"aria-live": "polite",
		children: a
	});
}
//#endregion
//#region src/table/localAction.ts
function Lp(e) {
	let t = e.currentUserId;
	if (!t || e.handComplete) return !1;
	let n = e.selfPlayer, r = sp({
		phase: e.session.phase,
		participantIds: e.session.participantIds,
		playerId: t
	});
	if (!n || !r && n.isOut || n.actionDeclared) return !1;
	let i = pp({
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
	let a = gp({
		snapshot: i,
		action: "submit_draw",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn,
		drawCompletedIds: e.session.drawCompletedIds
	});
	if (i.phase === $.DRAW && a.ok) return !0;
	let o = gp({
		snapshot: i,
		action: "play_card",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn
	});
	return !!(i.phase === $.PLAY && o.ok);
}
function Rp(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off";
	return [
		e.session.phase ?? "",
		e.session.turnPlayerId ?? "",
		n,
		e.selfPlayer?.actionDeclared ? "declared" : "open",
		e.session.drawCompletedIds?.join(",") ?? "",
		e.suppressTurn ? "1" : "0",
		Lp(e) ? "act" : "wait"
	].join("|");
}
//#endregion
//#region src/table/hooks/useTrumpTrickMotionGate.ts
var zp = 880;
function Bp(e, t, n) {
	let r = (0, _.useRef)(!1), [i, a] = (0, _.useState)(!1);
	return (0, _.useEffect)(() => {
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
		}, zp);
		return () => window.clearTimeout(n);
	}, [e, t]), (0, _.useEffect)(() => {
		if (!i || t || n === 0) return;
		let e = window.setTimeout(() => {
			a(!1), r.current = !1;
		}, zp);
		return () => window.clearTimeout(e);
	}, [
		i,
		t,
		n
	]), i;
}
//#endregion
//#region src/table/trickPresentationMachine.ts
function Vp(e, t) {
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
		peakTrickPlays: Y(t),
		displayRevealFloor: 0
	};
}
function Hp(e, t) {
	if (t.length < e.length) return !1;
	for (let n = 0; n < e.length; n++) if (lo(e[n]) !== lo(t[n])) return !1;
	return !0;
}
function Up(e, t, n) {
	let r = t.currentTrick?.trickNumber ?? null, i = e.prevTrick?.trickNumber ?? null, a = r != null && i != null && r !== i ? [] : [...e.peakTrickPlays ?? []];
	for (let t of [
		n,
		Y(e.prevTrick),
		e.peakTrickPlays ?? []
	]) t.length > a.length && Hp(a, t) && (a = t);
	return a;
}
function Wp(e, t) {
	return e.phase === "live" ? e : {
		...e,
		pendingServer: t
	};
}
function Gp(e) {
	return Math.max(e.pendingResolution?.frozen.plays.length ?? 0, Y(e.prevTrick).length, e.peakTrickPlays?.length ?? 0);
}
function Kp(e, t) {
	let n = Y(t.currentTrick), r = Y(e.prevTrick), i = Up(e, t, n), a = e.phase === "live" && !e.pendingResolution && (n.length < e.revealedCount && r.length >= e.revealedCount || n.length < i.length && r.length >= i.length), o = t.currentTrick?.trickNumber ?? null, s = e.prevTrick?.trickNumber ?? null, c = o != null && s != null && o !== s;
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
function qp(e, t, n, r) {
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
function Jp(e, t) {
	let n = Yp(e, t);
	if (Z()) {
		let r = Y(e.prevTrick).length, i = Y(n.prevTrick).length;
		(e.phase !== n.phase || e.revealedCount !== n.revealedCount || r !== i || !!e.pendingResolution != !!n.pendingResolution || t.type === "serverUpdate") && Gl("trickPresentation", t.type, {
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
function Yp(e, t) {
	switch (t.type) {
		case "reset":
		case "reinit": return Vp(t.type === "reinit" ? t.snapshot.tricksByPlayer : e.displayTricksByPlayer, t.type === "reinit" ? t.snapshot.currentTrick : null);
		case "revealNextCard": {
			if (e.phase !== "live") return e;
			let t = Gp(e);
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
			return !t || e.phase !== "live" ? e : qp({
				...e,
				pendingResolution: null
			}, t.frozen, t.snapshot.tricksByPlayer, t.snapshot.currentTrick);
		}
		case "forceHandEndDrain": {
			let t = e;
			if (t.phase === "live" && t.pendingResolution && (t = qp({
				...t,
				pendingResolution: null
			}, t.pendingResolution.frozen, t.pendingResolution.snapshot.tricksByPlayer, t.pendingResolution.snapshot.currentTrick)), t.phase === "live" && !t.pendingResolution) return t;
			let n = t.pendingServer, r = n?.tricksByPlayer ?? {}, i = Object.values(r).some((e) => (e ?? 0) > 0), a = i ? { ...r } : { ...t.displayTricksByPlayer }, o = Y(n?.currentTrick).length;
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
				peakTrickPlays: Y(n?.currentTrick),
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
				let t = e.pendingServer, n = Y(t?.currentTrick).length;
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
					peakTrickPlays: Y(t?.currentTrick),
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
			if (e.phase !== "live") return Wp(e, n);
			let i = Bl({
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
			} : Kp(e, n);
		}
		default: return e;
	}
}
function Xp(e, t) {
	let n = e.pendingResolution?.frozen.plays ?? [];
	if (n.length > 0) return n;
	let r = Y(e.prevTrick), i = e.peakTrickPlays ?? [];
	return e.phase === "live" ? i.length > t.length ? i : r.length > t.length ? r : t.length > 0 ? t : r : t.length > 0 ? t : r.length > 0 ? r : i;
}
function Zp(e, t) {
	let n = Xp(e, Y(t)), r = e.displayRevealFloor, i = n.length >= r ? n : (e.peakTrickPlays?.length ?? 0) >= r ? e.peakTrickPlays : n, a = e.phase === "live" ? e.pendingResolution ? Math.max(e.revealedCount, i.length) : Math.min(e.revealedCount, i.length) : i.length, o = e.phase === "live" && !e.pendingResolution ? Math.max(a, r) : a, s = e.phase === "live" ? i.slice(0, o) : e.frozenTrick?.plays ?? [], c = e.frozenTrick?.plays ?? [], l = e.frozenTrick?.winnerId ?? null, u = e.phase, d = c.length > 0 && s.length === 0 && e.phase !== "live", f = e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null, p = e.showWinnerTag && (e.phase === "winnerReveal" || e.phase === "collectTrick"), m = e.peakTrickPlays?.length ?? 0, h = e.phase === "live" ? Gp(e) : e.revealedCount;
	return {
		phase: e.phase,
		displayPlays: s,
		winnerPlayerId: f,
		showWinnerTag: p,
		displayTricksByPlayer: e.displayTricksByPlayer,
		suppressTurnPlayerId: Nl(e.phase),
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
function Qp({ phase: e, currentTrick: t, tricksByPlayer: n, participantIds: r, trumpSuit: i, playedCards: a, turnPlayerId: o, handComplete: s = !1 }) {
	let [c, l] = (0, _.useReducer)(Jp, n, (e) => Vp(e, t)), u = (0, _.useRef)([]), d = (0, _.useRef)(null), f = (0, _.useRef)(/* @__PURE__ */ new Set()), p = (0, _.useRef)(!1), m = (0, _.useRef)(null), h = (0, _.useRef)(0), g = (0, _.useRef)(!1), v = (0, _.useRef)(c);
	v.current = c;
	let y = c.phase !== "live" || !!c.pendingResolution;
	p.current = y;
	let b = e === "play", x = (e) => {
		for (let t of e) {
			let e = lo(t);
			f.current.has(e) || (f.current.add(e), bo(t.playerId, e));
		}
	}, S = () => {
		for (let e of u.current) window.clearTimeout(e);
		u.current = [];
	}, C = (e, t) => {
		let n = window.setTimeout(e, t);
		u.current.push(n);
	};
	(0, _.useEffect)(() => () => S(), []), (0, _.useEffect)(() => {
		let c = b && !g.current;
		g.current = b;
		let u = s || e == null && r.length === 0;
		if (c || !b && !p.current && !u) {
			S(), d.current = null, f.current.clear(), Co(), l({
				type: "reinit",
				snapshot: {
					currentTrick: t,
					tricksByPlayer: n,
					playedCards: a
				}
			}), Z() && Gl("useTrickPresentation", c ? "reinit-play-entry" : "reinit-idle", {
				trickNumber: t?.trickNumber,
				trickPlays: t?.plays?.length ?? 0
			});
			return;
		}
		l({
			type: "serverUpdate",
			snapshot: {
				currentTrick: t,
				tricksByPlayer: n,
				playedCards: a
			},
			participantIds: r,
			trumpSuit: i,
			reducedMotion: Vl()
		}), Z() && Gl("useTrickPresentation", "serverUpdate-effect", {
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
	]), (0, _.useLayoutEffect)(() => {
		if (!b && !y) return;
		_o(r), o && _o([o]);
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
	]), (0, _.useEffect)(() => {
		if (!b && !y || c.phase !== "trickComplete" || !c.frozenTrick) return;
		let e = `${c.frozenTrick.trickNumber}:${c.frozenTrick.winnerId}:${c.frozenTrick.plays.length}`;
		if (d.current === e) return;
		d.current = e, S();
		let t = c.frozenTrick, n = Fl({
			trumpBeat: zl(t.plays, t.leadSuit, i),
			reducedMotion: Vl()
		});
		C(() => l({ type: "advancePhase" }), n.readBeforeWinnerMs), C(() => l({ type: "advancePhase" }), n.readTotalMs), C(() => l({ type: "advancePhase" }), n.readTotalMs + n.sweepMs), C(() => l({ type: "advancePhase" }), n.pipelineMs);
	}, [
		b,
		y,
		c.phase,
		c.frozenTrick,
		i
	]), (0, _.useEffect)(() => {
		if (!b && !y || c.phase !== "live" || !c.pendingResolution) return;
		let e = c.pendingResolution.frozen.plays.length;
		if (c.revealedCount < e) return;
		let t = Vl() ? 308 : 560, n = window.setTimeout(() => l({ type: "commitTrickResolution" }), t);
		return () => window.clearTimeout(n);
	}, [
		b,
		y,
		c.phase,
		c.pendingResolution,
		c.revealedCount
	]), (0, _.useEffect)(() => {
		c.phase === "live" && (d.current = null);
	}, [c.phase]), (0, _.useEffect)(() => {
		let t = s || e == null && r.length === 0;
		if (!y || !t || b && !s) return;
		let n = Vl(), i = n ? 60 : 160, a = n ? 80 : 220, o = [], u = (e, t) => {
			o.push(window.setTimeout(e, t));
		};
		Z() && Gl("useTrickPresentation", "hand-end-drain-armed", {
			phase: c.phase,
			pendingResolution: !!c.pendingResolution
		}), c.phase === "live" && c.pendingResolution && u(() => l({ type: "commitTrickResolution" }), a);
		let d = (c.phase === "live" && c.pendingResolution ? a : 0) + i;
		for (let e = 0; e < 6; e++) u(() => {
			let e = v.current;
			e.phase === "live" && !e.pendingResolution || l({ type: "advancePhase" });
		}, d), d += i;
		return u(() => {
			let e = v.current;
			e.phase === "live" && !e.pendingResolution || (Z() && Gl("useTrickPresentation", "hand-end-drain-force", {
				phase: e.phase,
				pendingResolution: !!e.pendingResolution
			}), l({ type: "forceHandEndDrain" }));
		}, Ml), () => {
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
	h.current = w;
	let T = () => {
		m.current != null && (window.clearTimeout(m.current), m.current = null);
	}, E = () => {
		if (!b && !p.current || c.phase !== "live") {
			T();
			return;
		}
		if (c.revealedCount >= h.current) {
			T();
			return;
		}
		if (m.current != null) return;
		let e = Vl() ? 369 : 670;
		m.current = window.setTimeout(() => {
			m.current = null, Z() && Gl("useTrickPresentation", "revealNextCard-timer", {
				revealedCount: c.revealedCount,
				targetReveal: h.current
			}), l({ type: "revealNextCard" });
		}, e);
	};
	return (0, _.useEffect)(() => (E(), T), [
		b,
		y,
		c.phase,
		c.revealedCount
	]), (0, _.useEffect)(() => {
		E();
	}, [w]), (0, _.useEffect)(() => {
		!b && !y || c.phase !== "live" || c.pendingResolution || c.revealedCount <= w || l({
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
		...Zp(c, t),
		forceHandEndDrain: () => l({ type: "forceHandEndDrain" })
	};
}
var $p = {
	pipelineActive: !1,
	revealCatchUp: !1,
	motionGateActive: !1,
	peakPlayCount: 0,
	displayedPlayCount: 0,
	handPresenting: !1,
	handPresentationPhase: "idle",
	dealPresentationActive: !1,
	trickCollectionActive: !1
}, em = $p, tm = /* @__PURE__ */ new Set(), nm = 0, rm = null;
function im(e, t) {
	return e.pipelineActive === t.pipelineActive && e.revealCatchUp === t.revealCatchUp && e.motionGateActive === t.motionGateActive && e.peakPlayCount === t.peakPlayCount && e.displayedPlayCount === t.displayedPlayCount && e.handPresenting === t.handPresenting && e.handPresentationPhase === t.handPresentationPhase && e.dealPresentationActive === t.dealPresentationActive && e.trickCollectionActive === t.trickCollectionActive;
}
function am(e) {
	return e.dealPresentationActive ? "dealPresentationActive" : e.trickCollectionActive ? "trickCollectionActive" : e.handPresenting ? "handPresenting" : e.pipelineActive ? "pipelineActive" : e.revealCatchUp ? "revealCatchUp" : e.peakPlayCount > e.displayedPlayCount && e.peakPlayCount > 0 ? "peakPlayCatchUp" : null;
}
function om(e) {
	return am(e) != null;
}
function sm(e, t, n) {
	return !(!e || n === "play" || n === "draw" && (t === "drawPlayer" || t === "drawReady"));
}
function cm(e) {
	let t = { ...em }, n = rm ? Date.now() - rm.since : 0, r = {
		...em,
		pipelineActive: !1,
		revealCatchUp: !1,
		handPresenting: !1,
		handPresentationPhase: "idle",
		peakPlayCount: em.displayedPlayCount,
		motionGateActive: !1,
		dealPresentationActive: !1,
		trickCollectionActive: !1
	};
	nm = Date.now() + 1500, rm = null, Z() && Gl("trickAnimationBridge", "table-presentation-force-release", {
		source: e,
		blockedMs: n,
		from: t,
		to: r
	}), dm(r);
}
function lm(e = Date.now()) {
	if (e < nm) return {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	let t = am(em);
	if (t == null) return rm = null, {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	(!rm || rm.reason !== t) && (rm = {
		reason: t,
		since: e,
		blockedLogged: !1
	});
	let n = e - rm.since;
	return n >= 7e3 ? (Z() && !rm.blockedLogged && Gl("trickAnimationBridge", "gate-force-release", {
		reason: t,
		blockedMs: n
	}), cm("gate-timeout"), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !0
	}) : n >= 5500 ? (Z() && !rm.blockedLogged && (Gl("trickAnimationBridge", "gate-soft-unblock", {
		reason: t,
		blockedMs: n
	}), rm.blockedLogged = !0), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !1
	}) : (Z() && !rm.blockedLogged && (Gl("trickAnimationBridge", "gate-blocked", {
		reason: t,
		blockedMs: n
	}), rm.blockedLogged = !0), {
		blocked: !0,
		reason: t,
		blockedMs: n,
		softUnblock: !1,
		forceReleased: !1
	});
}
function um(e = Date.now()) {
	return lm(e).blocked;
}
function dm(e) {
	if (!im(em, e)) {
		Z() && Gl("trickAnimationBridge", "busy-state", {
			from: em,
			to: e,
			busy: om(e),
			blockReason: am(e),
			motionGateActive: e.motionGateActive,
			handPresentationPhase: e.handPresentationPhase
		}), em = e, am(e) ?? (rm = null);
		for (let e of tm) e();
	}
}
function fm() {
	nm = 0, rm = null, dm($p);
}
function pm() {
	return em;
}
function mm() {
	return em.pipelineActive || em.revealCatchUp || em.motionGateActive || em.trickCollectionActive || em.peakPlayCount > em.displayedPlayCount && em.peakPlayCount > 0;
}
function hm() {
	return om(em);
}
function gm(e) {
	return tm.add(e), () => tm.delete(e);
}
//#endregion
//#region src/table/settlementCopy.ts
function _m(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function vm(e, t) {
	return e.map((e) => _m(e, t)).join(" & ");
}
function ym(e, t) {
	return ul(e, t) ? t.filter((t) => (e[t] ?? 0) === 0) : [];
}
function bm(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: a = {} } = e, o = pl(t, n), s = e.winnerIds?.length ? e.winnerIds : o.winnerIds, c = e.maxTricks ?? o.maxTricks, l = vm(s, r), u = ym(t, n), d = vm(u, r), f = ml(i.maxWinThisHand), p = ml(i.currentPot), m = i.carryIn > 0 ? ml(i.carryIn) : null, h = `Pot this hand: ${p} (max win ${f})`;
	m && (h += ` — includes ${m} carried in`), i.limEnabled && i.overflow > 0 && (h += ` · LIM overflow ${ml(i.overflow)} stays out of play`);
	let g = s.map((e) => {
		let n = t[e] ?? 0;
		return `${_m(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), _ = u.length > 0 ? `Bourré: ${d} took 0 tricks — each pays ${f} at settlement (seeds next deal)` : null, v = e.splitSharePerWinner, y = v > 0 && s.length >= 2 ? `If all co-winners agree to split: ${ml(i.maxWinThisHand)} → ${ml(v)} each` : null, b = s.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, x = `If any co-winner declines: full pot ${p} carries to the next hand · non-winners ante up`, S = s.map((e) => {
		let t = a[e], n = _m(e, r);
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
function xm({ session: e, players: t, potMetrics: n, splitSharePerWinner: r, currentUserId: i, isCoWinner: a, onSettle: o }) {
	let s = bm({
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
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		className: "btable-session__settle",
		"data-testid": "settlement-panel",
		role: "region",
		"aria-label": "Co-winner settlement vote",
		children: [
			/* @__PURE__ */ (0, w.jsx)("h6", {
				className: "btable-session__settle-title",
				"data-testid": "settlement-headline",
				children: s.headline
			}),
			/* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-session__settle-sub",
				"data-testid": "settlement-subhead",
				children: s.subhead
			}),
			/* @__PURE__ */ (0, w.jsx)("ul", {
				className: "btable-session__settle-list",
				"data-testid": "settlement-winners",
				children: s.winnerLines.map((e) => /* @__PURE__ */ (0, w.jsx)("li", { children: e }, e))
			}),
			s.bourreLine && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-session__settle-bourre",
				"data-testid": "settlement-bourre",
				children: s.bourreLine
			}),
			/* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-session__settle-pot",
				"data-testid": "settlement-pot",
				children: s.potLine
			}),
			s.splitPreviewLine && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-session__split-preview",
				"data-testid": "settlement-split-preview",
				children: s.splitPreviewLine
			}),
			/* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-session__settle-carry muted small",
				"data-testid": "settlement-carry-push",
				children: s.carryoverIfPushLine
			}),
			s.carryoverIfSplitLine && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-session__settle-carry muted small",
				"data-testid": "settlement-carry-split",
				children: s.carryoverIfSplitLine
			}),
			/* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-session__settle-rules muted small",
				"data-testid": "settlement-rules",
				children: s.rulesLine
			}),
			/* @__PURE__ */ (0, w.jsx)("ul", {
				className: "btable-session__settle-votes",
				"data-testid": "settlement-votes",
				children: s.voteLines.map((e) => /* @__PURE__ */ (0, w.jsx)("li", { children: e }, e))
			}),
			s.voterHint && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-session__settle-hint",
				"data-testid": "settlement-voter-hint",
				children: s.voterHint
			}),
			s.observerHint && /* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-session__settle-hint muted small",
				"data-testid": "settlement-observer-hint",
				children: s.observerHint
			}),
			/* @__PURE__ */ (0, w.jsxs)("div", {
				className: "btable-session__settle-btns",
				children: [/* @__PURE__ */ (0, w.jsx)("button", {
					type: "button",
					className: "btn btn--sm",
					disabled: !a,
					"data-testid": "settlement-decline-btn",
					onClick: () => o("push"),
					children: "Decline split · push pot"
				}), /* @__PURE__ */ (0, w.jsxs)("button", {
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
var Sm = 3e3;
function Cm(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function wm({ session: e, players: t, splitSharePerWinner: n, currentUserId: r, isCoWinner: i, onAgreeSplit: a, onDeclineSplit: o, onCarryover: s }) {
	let c = e.pendingCoWinSettlement?.winnerIds ?? [], l = e.pendingCoWinSettlement?.votes ?? {}, [u, d] = (0, _.useState)(Sm), [f, p] = (0, _.useState)(!1), m = (0, _.useRef)(null), h = (0, _.useRef)(!1), g = (0, _.useMemo)(() => `${c.join(",")}:${e.handNumber ?? 0}`, [c, e.handNumber]);
	(0, _.useEffect)(() => {
		m.current = Date.now(), h.current = !1, d(Sm), p(!1);
	}, [g]);
	let v = c.length >= 2 && c.every((e) => l[e] === "split"), y = (0, _.useCallback)(() => {
		h.current || (h.current = !0, s());
	}, [s]);
	if ((0, _.useEffect)(() => {
		if (c.length < 2) return;
		let e = window.setInterval(() => {
			let e = m.current ?? Date.now(), t = Date.now() - e, n = Math.max(0, Sm - t);
			d(n), n <= 0 && !v && y();
		}, 100);
		return () => window.clearInterval(e);
	}, [
		c.length,
		v,
		y,
		g
	]), (0, _.useEffect)(() => {
		v && (h.current = !0);
	}, [v]), c.length < 2) return null;
	let b = Math.max(0, Math.ceil(u / 1e3)), x = c.map((e) => Cm(e, t)).join(" & "), S = (e) => {
		!i || h.current || (p(e), e ? a() : o());
	};
	return /* @__PURE__ */ (0, w.jsxs)("div", {
		className: "btable-split-toast",
		"data-testid": "split-pot-toast",
		role: "dialog",
		"aria-label": "Split pot decision",
		"aria-live": "polite",
		children: [
			/* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-split-toast__title",
				children: "Tie — split the pot?"
			}),
			/* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-split-toast__names",
				children: x
			}),
			/* @__PURE__ */ (0, w.jsxs)("p", {
				className: "btable-split-toast__share muted small",
				children: [ml(n), " each if all agree"]
			}),
			i ? /* @__PURE__ */ (0, w.jsxs)("label", {
				className: "btable-split-toast__choice",
				children: [/* @__PURE__ */ (0, w.jsx)("input", {
					type: "checkbox",
					checked: f || l[r ?? ""] === "split",
					onChange: (e) => S(e.target.checked),
					"data-testid": "split-pot-agree"
				}), /* @__PURE__ */ (0, w.jsx)("span", { children: "Yes — split pot" })]
			}) : /* @__PURE__ */ (0, w.jsx)("p", {
				className: "btable-split-toast__wait muted small",
				children: "Waiting for tied leaders…"
			}),
			/* @__PURE__ */ (0, w.jsxs)("p", {
				className: "btable-split-toast__timer muted small",
				"data-testid": "split-pot-timer",
				children: [b, "s — carryover if not all agree"]
			})
		]
	});
}
//#endregion
//#region src/table/heroHandDisplay.ts
function Tm(e, t) {
	return [...e];
}
function Em(e, t) {
	return [...e].sort((e, t) => e - t);
}
function Dm(e) {
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
	let { trumpMergeActive: i, trumpMergedIntoHand: a } = e.handPresentation, o = Yd({
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
var Om = [], km = [], Am = [];
function jm({ session: e, players: t, potMetrics: n, mySessionNet: r, leaderLabel: i, showCoWinSettlement: a, splitPotEnabled: o = !1, rebuyEnabled: s = !1, splitSharePerWinner: c = 0, enrollmentActive: l = !1, currentUserId: u, heroCards: d = km, rawHeroCards: f = km, privateHandReady: p = !1, legalPlayIndices: m, recentBourreIds: h = Am, handComplete: g = !1, actionFeedback: v, actions: y }) {
	let { settings: b } = Kc(), x = ad(), [S, C] = (0, _.useState)(!1), T = e.participantIds.length, { events: E, dismissEvent: D, pushReaction: O } = vf({
		session: e,
		potMetrics: n,
		participantIds: e.participantIds
	}), k = (0, _.useMemo)(() => [...E].reverse().find((e) => e.kind === "big-pot") ?? null, [E]), ee = u != null && (e.pendingCoWinSettlement?.winnerIds || []).includes(u), A = Qp({
		phase: e.phase,
		currentTrick: e.currentTrick,
		tricksByPlayer: e.tricksByPlayer,
		participantIds: e.participantIds,
		trumpSuit: e.trumpSuit,
		playedCards: e.playedCards,
		turnPlayerId: e.turnPlayerId,
		handComplete: g
	}), te = A.forceHandEndDrain, j = Yf({
		session: e,
		enrollmentActive: l,
		potAmount: n.currentPot,
		handComplete: g,
		trickPipelineActive: A.isPipelineActive,
		forceTrickHandEndDrain: te,
		heroCards: d,
		enrolledIds: e.handEnrollment?.enrolledIds ?? Om,
		declinedIds: e.handEnrollment?.declinedIds ?? Om,
		actionOrder: e.actionOrder ?? e.handEnrollment?.orderedPlayerIds ?? e.participantIds
	}), M = Bp(e.phase, e.trumpUpcard, A.displayPlays.length), N = sm(j.isPresenting, j.phase, e.phase), [P, F] = (0, _.useState)(0);
	(0, _.useEffect)(() => nd(() => F((e) => e + 1)), []), (0, _.useEffect)(() => {
		dm({
			pipelineActive: A.isPipelineActive,
			revealCatchUp: A.phase === "live" && A.revealedCount < A.revealTarget,
			motionGateActive: M,
			peakPlayCount: A.peakPlayCount,
			displayedPlayCount: A.displayPlays.length,
			handPresenting: N,
			handPresentationPhase: j.phase,
			dealPresentationActive: $u(),
			trickCollectionActive: td()
		});
	}, [
		A.isPipelineActive,
		A.phase,
		A.revealedCount,
		A.revealTarget,
		A.peakPlayCount,
		A.displayPlays.length,
		M,
		N,
		j.phase,
		e.phase,
		P
	]);
	let ne = io(e.phase), I = (0, _.useMemo)(() => Yd({
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
	]), L = (0, _.useMemo)(() => Dm({
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
	]), re = L.displayCards, R = (0, _.useMemo)(() => !m?.length || L.indexMode === "effective" ? m : Tm(m, L.trumpDisabledIndex), [
		m,
		L.indexMode,
		L.trumpDisabledIndex
	]), z = (0, _.useMemo)(() => {
		if (!m?.length || !d.length) return null;
		let t = $o(d.map($a), {
			trumpSuit: e.trumpSuit ?? "clubs",
			currentTrick: e.currentTrick ?? null,
			leadSuit: e.leadSuit ?? null,
			cinchEnabled: e.cinchEnabled === !0
		}, m);
		return t == null ? null : L.indexMode === "effective" ? t : Tm([t], L.trumpDisabledIndex)[0] ?? null;
	}, [
		m,
		d,
		e.trumpSuit,
		e.currentTrick,
		e.leadSuit,
		e.cinchEnabled,
		L.indexMode,
		L.trumpDisabledIndex
	]), ie = (0, _.useMemo)(() => {
		if (e.phase !== "draw" || !d.length) return [];
		let t = d.map($a), n = L.indexMode === "display" && L.trumpDisabledIndex != null ? Em([L.trumpDisabledIndex], L.trumpDisabledIndex) : L.trumpDisabledIndex == null ? [] : [L.trumpDisabledIndex], r = es(t, e.trumpSuit ?? "clubs", e.maxDrawDiscards ?? 4, e.remainingDeckCount ?? Infinity, n);
		return L.indexMode === "effective" ? r : Tm(r, L.trumpDisabledIndex);
	}, [
		e.phase,
		d,
		e.trumpSuit,
		e.maxDrawDiscards,
		e.remainingDeckCount,
		L.indexMode,
		L.trumpDisabledIndex
	]), ae = A.suppressTurnPlayerId || j.suppressTurnIndicator, oe = eo(e.phase, l), se = ae ? null : oo(e.turnPlayerId, t), ce = t.find((e) => e.isSelf), le = u != null && e.participantIds.includes(u) && (e.phase === "draw" || e.phase === "play"), ue = s && !e.isFinal && !le && !a && ce?.isOut === !0 && !!y.onRebuy, de = !!(u && e.turnPlayerId === u) && !ae, fe = Lp({
		currentUserId: u,
		enrollmentActive: l,
		selfPlayer: ce,
		session: e,
		suppressTurn: !!ae,
		handComplete: g
	}), pe = fe && !g && (l || e.phase === "decision") ? to(e.phase, l) : null, B = !pe && !ae && !(se && ne && A.phase === "live") ? no({
		phase: e.phase,
		enrollmentActive: l,
		isMyTurn: de,
		handComplete: g,
		cardsDealt: ne
	}) : null, me = Rp({
		currentUserId: u,
		enrollmentActive: l,
		selfPlayer: ce,
		session: e,
		suppressTurn: !!ae,
		handComplete: g
	}), [he, ge] = (0, _.useState)(!1);
	(0, _.useEffect)(() => {
		ge(!1);
	}, [me]);
	let _e = (0, _.useCallback)(() => {
		ge(!0);
	}, []), ve = fe && !g && !he && (e.phase === "draw" || e.phase === "play"), { countdown: ye } = wp({
		session: e,
		suppressTurn: !!ae,
		handComplete: g
	}), be = I.showTrumpSuitReminder || !e.trumpUpcard && !!e.trumpSuit && e.phase === "play", xe = (0, _.useMemo)(() => ({ ...A.displayTricksByPlayer }), [A.displayTricksByPlayer]), Se = (0, _.useMemo)(() => Object.fromEntries(t.map((e) => [e.playerId, Math.max(0, Number(e.bankroll) || 0)])), [t]), V = Tp({
		turnPlayerId: e.turnPlayerId ?? null,
		dealerId: e.dealerId,
		potAmount: j.displayPotAmount,
		tricksByPlayer: xe,
		bankrollByPlayer: Se,
		bourrePlayerIds: h ?? [],
		phase: e.phase ?? null,
		showTrumpSuitReminder: be,
		suppressTurn: !!ae,
		actionFeedbackStatus: v?.status ?? "idle",
		trickWinnerSeatId: A.trickWinnerSeatId,
		trickPhase: A.phase
	}), Ce = !!ce?.playerId && (h ?? []).includes(ce.playerId) && V.bourreAlerts[ce.playerId] === "pulse", we = (0, _.useRef)(0), Te = (0, _.useRef)(0);
	(0, _.useEffect)(() => {
		V.feedbackErrorPulse > we.current && kc(), we.current = V.feedbackErrorPulse;
	}, [V.feedbackErrorPulse]), (0, _.useEffect)(() => {
		V.feedbackSuccessPulse > Te.current && Ac(), Te.current = V.feedbackSuccessPulse;
	}, [V.feedbackSuccessPulse]);
	let Ee = (0, _.useCallback)((e) => {
		O(e, u ?? void 0);
	}, [O, u]), De = (0, _.useMemo)(() => ({
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
			let t = L.indexMode === "display" ? Em(e, L.trumpDisabledIndex) : e;
			return y.onSubmitDraw(t);
		},
		onPassDraw: y.onPassDraw,
		onFoldDraw: y.onFoldDraw,
		onPlayCard: (e) => {
			if (!y.onPlayCard) return;
			if (L.indexMode !== "display") return y.onPlayCard(e);
			let t = Em([e], L.trumpDisabledIndex)[0];
			if (t != null) return y.onPlayCard(t);
		},
		onReaction: Ee,
		onHeroUserActivity: _e
	}), [
		y,
		Ee,
		t,
		L.indexMode,
		L.trumpDisabledIndex,
		_e
	]), Oe = {
		session: e,
		players: t,
		potMetrics: n,
		participantCount: T,
		enrollmentActive: l,
		heroCards: re,
		revealedTrumpIndex: L.revealedTrumpIndex,
		trumpMergeActive: L.trumpMergeActive,
		trumpDisabledIndex: L.trumpDisabledIndex,
		hideCenterTrump: I.hideCenterTrump,
		showTrumpSuitReminder: be,
		trumpHolderPresentation: I,
		privateHandReady: p,
		currentUserId: u,
		legalPlayIndices: R,
		recommendedPlayIndex: z,
		recommendedDiscardIndices: ie,
		handComplete: g,
		actionFeedback: v,
		trickPresentation: A,
		handPresentation: j,
		microinteractions: V,
		instantTrickPlays: M,
		turnCountdown: ye,
		bigPotEvent: k,
		onDismissTableEvent: D,
		...De
	}, ke = /* @__PURE__ */ (0, w.jsxs)(w.Fragment, { children: [
		/* @__PURE__ */ (0, w.jsx)("div", {
			className: "btable-session__attention-layer",
			"aria-live": "polite",
			children: /* @__PURE__ */ (0, w.jsx)(jp, {
				actionRequired: fe,
				activityKey: me
			})
		}),
		/* @__PURE__ */ (0, w.jsx)(Ep, {
			active: Ce,
			displayName: ce?.displayName
		}),
		/* @__PURE__ */ (0, w.jsx)(ff, {
			events: E,
			onDismiss: D
		}),
		/* @__PURE__ */ (0, w.jsx)(lf, {
			events: E,
			onDismiss: D
		}),
		x ? /* @__PURE__ */ (0, w.jsx)(sf, { ...Oe }) : /* @__PURE__ */ (0, w.jsx)(Qd, { ...Oe })
	] }), Ae = (0, _.useRef)(!1);
	return (0, _.useEffect)(() => {
		Ae.current = !1;
	}, [e.handNumber, e.sessionId]), (0, _.useEffect)(() => {
		if (e.phase !== "reveal" || !j.trumpMergedIntoHand || j.phase !== "drawPlayer" || Ae.current || !y.onAdvanceReveal) return;
		let t = y.onAdvanceReveal();
		Promise.resolve(t).then(() => {
			Ae.current = !0;
		}, () => {
			Ae.current = !1;
		});
	}, [
		e.phase,
		e.handNumber,
		e.sessionId,
		j.trumpMergedIntoHand,
		j.phase,
		y
	]), (0, _.useEffect)(() => {
		let e = (e) => {
			(e.key === b.hotkeys.toggleSettings || e.key === "," && e.metaKey) && C((e) => !e), e.key === b.hotkeys.focusTable && document.querySelector(".btable-wrap")?.scrollIntoView({
				block: "center",
				behavior: "smooth"
			});
		};
		return window.addEventListener("keydown", e), () => window.removeEventListener("keydown", e);
	}, [b.hotkeys]), /* @__PURE__ */ (0, w.jsxs)("div", {
		className: [
			"btable-session",
			x ? "btable-session--native-mobile btable-session--mobile-layout" : "",
			S ? "btable-session--settings-open" : "",
			q(e.phase) ? "btable-session--reveal-phase" : "",
			ao(e.phase) ? "btable-session--decision-phase" : ""
		].filter(Boolean).join(" "),
		"data-trick-resolving": A.isPipelineActive ? "true" : "false",
		"data-hand-settling": j.settleAnimActive ? "true" : "false",
		"data-hand-complete": g ? "true" : "false",
		children: [
			v && v.status !== "idle" && /* @__PURE__ */ (0, w.jsx)("div", {
				className: [
					`btable-session__feedback btable-session__feedback--${v.status}`,
					v.status === "error" ? "btable-session__feedback--pulse-error" : "",
					v.status === "success" ? "btable-session__feedback--pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "feedback-banner",
				role: v.status === "error" ? "alert" : "status",
				"aria-live": "polite",
				children: v.message
			}, v.status === "error" ? `feedback-error-${V.feedbackErrorPulse}` : v.status === "success" ? `feedback-success-${V.feedbackSuccessPulse}` : `feedback-${v.status}`),
			/* @__PURE__ */ (0, w.jsxs)("header", {
				className: "btable-session__head",
				children: [
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "btable-session__head-row",
						children: [
							/* @__PURE__ */ (0, w.jsxs)("h5", {
								className: "btable-session__title",
								children: ["Hand #", e.handNumber]
							}),
							/* @__PURE__ */ (0, w.jsx)("span", {
								className: `btable-session__phase-tag btable-session__phase-tag--${e.phase ?? "waiting"}`,
								"data-testid": "phase-tag",
								"data-phase": e.phase ?? "waiting",
								children: oe
							}),
							/* @__PURE__ */ (0, w.jsx)("button", {
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
					/* @__PURE__ */ (0, w.jsx)("p", {
						className: "btable-session__status",
						children: i
					}),
					j.trumpRevealActive && e.phase === "draw" && /* @__PURE__ */ (0, w.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Trump revealed — settling into your hand"
					}),
					j.trumpMergeActive && e.phase === "draw" && /* @__PURE__ */ (0, w.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Trump joining your hand…"
					}),
					j.phase === "drawReady" && /* @__PURE__ */ (0, w.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Draw complete — first lead coming up"
					}),
					/* @__PURE__ */ (0, w.jsxs)("div", {
						className: "btable-session__turn-stack",
						"aria-live": "polite",
						children: [
							j.settleAnimActive && /* @__PURE__ */ (0, w.jsx)("p", {
								className: "btable-session__turn btable-session__turn--settle muted small",
								children: "Settling the pot…"
							}),
							/* @__PURE__ */ (0, w.jsx)("p", {
								className: "btable-session__turn btable-session__turn--trick-resolve muted small",
								children: "Trick won — cards collecting before the next lead"
							}),
							j.settleAnimActive && /* @__PURE__ */ (0, w.jsx)("p", {
								className: "btable-session__turn btable-session__turn--final-trick muted small",
								children: "Final trick — cards collecting before the pot settles"
							})
						]
					}),
					se && ne && A.phase === "live" && /* @__PURE__ */ (0, w.jsx)("p", {
						className: ["btable-session__turn", de ? "btable-session__turn--yours" : "btable-session__turn--waiting"].join(" "),
						"aria-live": "polite",
						"data-testid": "turn-indicator",
						children: se
					}),
					pe && /* @__PURE__ */ (0, w.jsx)("p", {
						className: "btable-session__action-cue",
						"data-testid": "action-cue",
						"aria-live": "polite",
						children: pe
					}),
					/* @__PURE__ */ (0, w.jsx)(Ip, {
						actionRequired: ve,
						activityKey: me,
						phase: e.phase,
						hasUserInteracted: he
					}),
					B && /* @__PURE__ */ (0, w.jsx)("p", {
						className: "btable-session__hint btable-session__hint--waiting",
						"data-testid": "waiting-cue",
						children: B
					}),
					q(e.phase) && /* @__PURE__ */ (0, w.jsx)("p", {
						className: "btable-session__hint muted small",
						"aria-live": "polite",
						children: "Cards dealt — trump revealed. Review your hand…"
					}),
					l && !q(e.phase) && /* @__PURE__ */ (0, w.jsx)("p", {
						className: "btable-session__enroll muted small",
						children: "Tap I'm in or Pass at your seat — clockwise from dealer"
					})
				]
			}),
			!x && /* @__PURE__ */ (0, w.jsxs)("p", {
				className: "btable-session__rotate-hint",
				role: "note",
				children: [
					"Rotate your phone to ",
					/* @__PURE__ */ (0, w.jsx)("strong", { children: "landscape" }),
					" for the full table (up to 8 players)."
				]
			}),
			x ? /* @__PURE__ */ (0, w.jsx)(df, { children: /* @__PURE__ */ (0, w.jsx)("div", {
				className: "btable-stage",
				children: ke
			}) }) : /* @__PURE__ */ (0, w.jsx)(uf, { children: /* @__PURE__ */ (0, w.jsx)("div", {
				className: "btable-stage",
				children: ke
			}) }),
			/* @__PURE__ */ (0, w.jsx)(mf, {
				open: S,
				onClose: () => C(!1)
			}),
			a && !e.isFinal && o && /* @__PURE__ */ (0, w.jsx)(wm, {
				session: e,
				players: t,
				splitSharePerWinner: c,
				currentUserId: u,
				isCoWinner: ee,
				onAgreeSplit: () => y.onSettle("split"),
				onDeclineSplit: () => y.onSettle("push"),
				onCarryover: () => y.onSettleCarryover?.()
			}),
			a && !e.isFinal && !o && /* @__PURE__ */ (0, w.jsx)(xm, {
				session: e,
				players: t,
				potMetrics: n,
				splitSharePerWinner: c,
				currentUserId: u,
				isCoWinner: ee,
				onSettle: (e) => y.onSettle(e)
			}),
			/* @__PURE__ */ (0, w.jsxs)("footer", {
				className: "btable-session__foot muted small",
				children: [
					/* @__PURE__ */ (0, w.jsx)(pf, { compact: !0 }),
					ue && /* @__PURE__ */ (0, w.jsxs)("div", {
						className: "btable-session__rebuy-offer",
						children: [/* @__PURE__ */ (0, w.jsx)("p", {
							className: "btable-session__rebuy-copy",
							children: "You're out — rebuy to join the next hand."
						}), /* @__PURE__ */ (0, w.jsx)("button", {
							type: "button",
							className: "btn btn--sm btn--primary",
							"data-testid": "rebuy-button",
							onClick: () => void y.onRebuy?.(),
							children: "Rebuy"
						})]
					}),
					r == null ? /* @__PURE__ */ (0, w.jsx)(w.Fragment, { children: "Shared pot and game state only · sign in to track your ledger" }) : /* @__PURE__ */ (0, w.jsxs)(w.Fragment, { children: ["Your session profit/loss ", gl(r)] })
				]
			})
		]
	});
}
//#endregion
//#region src/table/mount.tsx
var Mm = null, Nm = null;
function Pm(e, t) {
	Sc(), fa(e), Nm !== e && (Mm?.unmount(), Mm = (0, v.createRoot)(e), Nm = e), Mm.render(/* @__PURE__ */ (0, w.jsx)(Gc, { children: /* @__PURE__ */ (0, w.jsx)(jm, { ...t }) }));
}
function Fm() {
	Nm && (Ld(Nm), pd(Nm)), Mm?.unmount(), Mm = null, Nm = null, fm(), rd();
}
//#endregion
export { pd as clearDrawFlyGhosts, Ld as clearWonTrickCollectionArtifacts, lm as evaluateBotPresentationGate, cm as forceReleasePresentationForBots, fs as getFeedbackPrefs, am as getTablePresentationBlockReason, pm as getTrickAnimationBusyState, sm as handPresentingBlocksBots, Sc as initGameFeedback, hm as isTablePresentationBusy, um as isTablePresentationBusyForBots, mm as isTrickAnimationBusy, Pm as mountTableSession, Ec as playBigWinFeedback, Dc as playBourreFeedback, wc as playDrawFeedback, Oc as playGameStartFeedback, Cc as playShuffleFeedback, Tc as playTrickWinFeedback, ps as saveFeedbackPrefs, gs as subscribeFeedbackPrefs, gm as subscribeTrickAnimationBusy, Fm as unmountTableSession };
