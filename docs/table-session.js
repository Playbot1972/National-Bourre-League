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
			t !== null && te(x, t.startTime - e);
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
								u !== null && te(x, u.startTime - t), i = !1;
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
	function te(t, n) {
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
		}, a > o ? (r.sortIndex = a, t(l, r), n(c) === null && r === n(l) && (h ? (v(C), C = -1) : h = !0, te(x, a - o))) : (r.sortIndex = s, t(c, r), m || p || (m = !0, S || (S = !0, O()))), r;
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
	var ee = /\/+/g;
	function te(e, t) {
		return typeof e == "object" && e && e.key != null ? k("" + e.key) : t.toString(36);
	}
	function A(e) {
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
	function ne(e, r, i, a, o) {
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
				case d: return c = e._init, ne(c(e._payload), r, i, a, o);
			}
		}
		if (c) return o = o(e), c = a === "" ? "." + te(e, 0) : a, S(o) ? (i = "", c != null && (i = c.replace(ee, "$&/") + "/"), ne(o, r, i, "", function(e) {
			return e;
		})) : o != null && (O(o) && (o = D(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(ee, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (S(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + te(a, u), c += ne(a, r, i, s, o);
		else if (u = m(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + te(a, u++), c += ne(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ne(A(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function j(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ne(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function M(e) {
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
		map: j,
		forEach: function(e, t, n) {
			j(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return j(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return j(e, function(e) {
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
			_init: M
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
	var h = Object.assign, g = Symbol.for("react.element"), _ = Symbol.for("react.transitional.element"), v = Symbol.for("react.portal"), y = Symbol.for("react.fragment"), b = Symbol.for("react.strict_mode"), x = Symbol.for("react.profiler"), S = Symbol.for("react.consumer"), C = Symbol.for("react.context"), w = Symbol.for("react.forward_ref"), T = Symbol.for("react.suspense"), E = Symbol.for("react.suspense_list"), D = Symbol.for("react.memo"), O = Symbol.for("react.lazy"), k = Symbol.for("react.activity"), ee = Symbol.for("react.memo_cache_sentinel"), te = Symbol.iterator;
	function A(e) {
		return typeof e != "object" || !e ? null : (e = te && e[te] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var ne = Symbol.for("react.client.reference");
	function j(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === ne ? null : e.displayName || e.name || null;
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
			case D: return t = e.displayName || null, t === null ? j(e.type) || "Memo" : t;
			case O:
				t = e._payload, e = e._init;
				try {
					return j(e(t));
				} catch {}
		}
		return null;
	}
	var M = Array.isArray, N = r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, P = a.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, re = {
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
	var ae = I(null), oe = I(null), se = I(null), ce = I(null);
	function z(e, t) {
		switch (R(se, t), R(oe, e), R(ae, null), t.nodeType) {
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
		L(ae), R(ae, e);
	}
	function le() {
		L(ae), L(oe), L(se);
	}
	function B(e) {
		e.memoizedState !== null && R(ce, e);
		var t = ae.current, n = Hd(t, e.type);
		t !== n && (R(oe, e), R(ae, n));
	}
	function ue(e) {
		oe.current === e && (L(ae), L(oe)), ce.current === e && (L(ce), Qf._currentValue = re);
	}
	var de, fe;
	function pe(e) {
		if (de === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			de = t && t[1] || "", fe = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + de + e + fe;
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
		return (n = e ? e.displayName || e.name : "") ? pe(n) : "";
	}
	function ge(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return pe(e.type);
			case 16: return pe("Lazy");
			case 13: return e.child !== t && t !== null ? pe("Suspense Fallback") : pe("Suspense");
			case 19: return pe("SuspenseList");
			case 0:
			case 15: return he(e.type, !1);
			case 11: return he(e.type.render, !1);
			case 1: return he(e.type, !0);
			case 31: return pe("Activity");
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
	var ve = Object.prototype.hasOwnProperty, ye = t.unstable_scheduleCallback, be = t.unstable_cancelCallback, xe = t.unstable_shouldYield, Se = t.unstable_requestPaint, Ce = t.unstable_now, we = t.unstable_getCurrentPriorityLevel, Te = t.unstable_ImmediatePriority, Ee = t.unstable_UserBlockingPriority, De = t.unstable_NormalPriority, Oe = t.unstable_LowPriority, ke = t.unstable_IdlePriority, Ae = t.log, je = t.unstable_setDisableYieldValue, Me = null, V = null;
	function Ne(e) {
		if (typeof Ae == "function" && je(e), V && typeof V.setStrictMode == "function") try {
			V.setStrictMode(Me, e);
		} catch {}
	}
	var Pe = Math.clz32 ? Math.clz32 : Ie, Fe = Math.log, H = Math.LN2;
	function Ie(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (Fe(e) / H | 0) | 0;
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
			var u = 31 - Pe(n), d = 1 << u;
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
		var r = 31 - Pe(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function Ye(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Pe(n), i = 1 << r;
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
		var e = P.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : mp(e.type)) : e;
	}
	function et(e, t) {
		var n = P.p;
		try {
			return P.p = e, t();
		} finally {
			P.p = n;
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
		throw Error(s(33));
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
				if (n != null) throw Error(s(92));
				if (M(r)) {
					if (1 < r.length) throw Error(s(93));
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
		if (t != null && typeof t != "object") throw Error(s(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
			for (var i in t) r = t[i], t.hasOwnProperty(i) && n[i] !== r && Ut(e, i, r);
		} else for (var a in t) t.hasOwnProperty(a) && Ut(e, a, t[a]);
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
								var i = r[rt] || null;
								if (!i) throw Error(s(90));
								Ft(r, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name);
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
		if (n && typeof n != "function") throw Error(s(231, t, typeof n));
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
		getModifierState: Nn,
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
	function U(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = Mn[e]) ? !!t[e] : !1;
	}
	function Nn() {
		return U;
	}
	var Pn = hn(h({}, vn, {
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
		getModifierState: Nn,
		charCode: function(e) {
			return e.type === "keypress" ? fn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? fn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), Fn = hn(h({}, Cn, {
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
	})), In = hn(h({}, vn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: Nn
	})), Ln = hn(h({}, gn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Rn = hn(h({}, Cn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), zn = hn(h({}, gn, {
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
		Qt ? $t ? $t.push(r) : $t = [r] : Qt = r, t = Td(t, "onChange"), 0 < t.length && (n = new _n("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var tr = null, nr = null;
	function rr(e) {
		vd(e, 0);
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
		}), Dr && vr(Dr, r) || (Dr = r, r = Td(Er, "onSelect"), 0 < r.length && (t = new _n("onSelect", "select", null, t, n), e.push({
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
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - Pe(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function ei(e) {
		if (50 < uu) throw uu = 0, du = null, Error(s(185));
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
	function si(e, t, n, r, i, a) {
		var o = 0;
		if (r = e, typeof e == "function") ii(e) && (o = 1);
		else if (typeof e == "string") o = Uf(e, n, ae.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (e) {
			case k: return e = ri(31, n, t, i), e.elementType = k, e.lanes = a, e;
			case y: return ci(n.children, i, a, t);
			case b:
				o = 8, i |= 24;
				break;
			case x: return e = ri(12, n, t, i | 2), e.elementType = x, e.lanes = a, e;
			case T: return e = ri(13, n, t, i), e.elementType = T, e.lanes = a, e;
			case E: return e = ri(19, n, t, i), e.elementType = E, e.lanes = a, e;
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
		return t = ri(o, n, t, i), t.elementType = e, t.type = r, t.lanes = a, t;
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
	var mi = [], hi = 0, gi = null, _i = 0, vi = [], yi = 0, bi = null, xi = 1, Si = "";
	function Ci(e, t) {
		mi[hi++] = _i, mi[hi++] = gi, gi = e, _i = t;
	}
	function wi(e, t, n) {
		vi[yi++] = xi, vi[yi++] = Si, vi[yi++] = bi, bi = e;
		var r = xi;
		e = Si;
		var i = 32 - Pe(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Pe(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, xi = 1 << 32 - Pe(t) + i | n << i | r, Si = a + e;
		} else xi = 1 << a | n << i | r, Si = e;
	}
	function Ti(e) {
		e.return !== null && (Ci(e, 1), wi(e, 1, 0));
	}
	function Ei(e) {
		for (; e === gi;) gi = mi[--hi], mi[hi] = null, _i = mi[--hi], mi[hi] = null;
		for (; e === bi;) bi = vi[--yi], vi[yi] = null, Si = vi[--yi], vi[yi] = null, xi = vi[--yi], vi[yi] = null;
	}
	function Di(e, t) {
		vi[yi++] = xi, vi[yi++] = Si, vi[yi++] = bi, xi = t.id, Si = t.overflow, bi = e;
	}
	var Oi = null, ki = null, W = !1, Ai = null, ji = !1, Mi = Error(s(519));
	function Ni(e) {
		throw zi(pi(Error(s(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), Mi;
	}
	function Pi(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[nt] = e, t[rt] = r, n) {
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
				$("invalid", t), It(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				$("invalid", t);
				break;
			case "textarea": $("invalid", t), Bt(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || jd(t.textContent, n) ? (r.popover != null && ($("beforetoggle", t), $("toggle", t)), r.onScroll != null && $("scroll", t), r.onScrollEnd != null && $("scrollend", t), r.onClick != null && (t.onclick = Yt), t = !0) : t = !1, t || Ni(e, !0);
	}
	function Fi(e) {
		for (Oi = e.return; Oi;) switch (Oi.tag) {
			case 5:
			case 31:
			case 13:
				ji = !1;
				return;
			case 27:
			case 3:
				ji = !0;
				return;
			default: Oi = Oi.return;
		}
	}
	function Ii(e) {
		if (e !== Oi) return !1;
		if (!W) return Fi(e), W = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || Ud(e.type, e.memoizedProps)), n = !n), n && ki && Ni(e), Fi(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			ki = uf(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			ki = uf(e);
		} else t === 27 ? (t = ki, Zd(e.type) ? (e = lf, lf = null, ki = e) : ki = t) : ki = Oi ? cf(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Li() {
		ki = Oi = null, W = !1;
	}
	function Ri() {
		var e = Ai;
		return e !== null && (Xl === null ? Xl = e : Xl.push.apply(Xl, e), Ai = null), e;
	}
	function zi(e) {
		Ai === null ? Ai = [e] : Ai.push(e);
	}
	var Bi = I(null), Vi = null, Hi = null;
	function Ui(e, t, n) {
		R(Bi, t._currentValue), t._currentValue = n;
	}
	function Wi(e) {
		e._currentValue = Bi.current, L(Bi);
	}
	function Gi(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Ki(e, t, n, r) {
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
						a.lanes |= n, c = a.alternate, c !== null && (c.lanes |= n), Gi(a.return, n, e), r || (o = null);
						break a;
					}
					a = c.next;
				}
			} else if (i.tag === 18) {
				if (o = i.return, o === null) throw Error(s(341));
				o.lanes |= n, a = o.alternate, a !== null && (a.lanes |= n), Gi(o, n, e), o = null;
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
	function qi(e, t, n, r) {
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
					_r(i.pendingProps.value, o.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (i === ce.current) {
				if (o = i.alternate, o === null) throw Error(s(387));
				o.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [Qf] : e.push(Qf));
			}
			i = i.return;
		}
		e !== null && Ki(t, e, n, r), t.flags |= 262144;
	}
	function Ji(e) {
		for (e = e.firstContext; e !== null;) {
			if (!_r(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function Yi(e) {
		Vi = e, Hi = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function Xi(e) {
		return Qi(Vi, e);
	}
	function Zi(e, t) {
		return Vi === null && Yi(e), Qi(e, t);
	}
	function Qi(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, Hi === null) {
			if (e === null) throw Error(s(308));
			Hi = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else Hi = Hi.next = t;
		return n;
	}
	var $i = typeof AbortController < "u" ? AbortController : function() {
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
	}, ea = t.unstable_scheduleCallback, ta = t.unstable_NormalPriority, G = {
		$$typeof: C,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function na() {
		return {
			controller: new $i(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function ra(e) {
		e.refCount--, e.refCount === 0 && ea(ta, function() {
			e.controller.abort();
		});
	}
	var ia = null, aa = 0, oa = 0, sa = null;
	function ca(e, t) {
		if (ia === null) {
			var n = ia = [];
			aa = 0, oa = ud(), sa = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return aa++, t.then(la, la), t;
	}
	function la() {
		if (--aa === 0 && ia !== null) {
			sa !== null && (sa.status = "fulfilled");
			var e = ia;
			ia = null, oa = 0, sa = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function ua(e, t) {
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
	var da = N.S;
	N.S = function(e, t) {
		$l = Ce(), typeof t == "object" && t && typeof t.then == "function" && ca(e, t), da !== null && da(e, t);
	};
	var fa = I(null);
	function pa() {
		var e = fa.current;
		return e === null ? Rl.pooledCache : e;
	}
	function ma(e, t) {
		t === null ? R(fa, fa.current) : R(fa, t.pool);
	}
	function ha() {
		var e = pa();
		return e === null ? null : {
			parent: G._currentValue,
			pool: e
		};
	}
	var ga = Error(s(460)), _a = Error(s(474)), va = Error(s(542)), ya = { then: function() {} };
	function ba(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function xa(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then(Yt, Yt), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Ta(e), e;
			default:
				if (typeof t.status == "string") t.then(Yt, Yt);
				else {
					if (e = Rl, e !== null && 100 < e.shellSuspendCounter) throw Error(s(482));
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
					case "rejected": throw e = t.reason, Ta(e), e;
				}
				throw Ca = t, ga;
		}
	}
	function Sa(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (Ca = e, ga) : e;
		}
	}
	var Ca = null;
	function wa() {
		if (Ca === null) throw Error(s(459));
		var e = Ca;
		return Ca = null, e;
	}
	function Ta(e) {
		if (e === ga || e === va) throw Error(s(483));
	}
	var Ea = null, Da = 0;
	function Oa(e) {
		var t = Da;
		return Da += 1, Ea === null && (Ea = []), xa(Ea, e, t);
	}
	function ka(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function Aa(e, t) {
		throw t.$$typeof === g ? Error(s(525)) : (e = Object.prototype.toString.call(t), Error(s(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function ja(e) {
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
			return e = ai(e, t), e.index = 0, e.sibling = null, e;
		}
		function a(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 67108866, n) : (r = r.index, r < n ? (t.flags |= 67108866, n) : r)) : (t.flags |= 1048576, n);
		}
		function o(t) {
			return e && t.alternate === null && (t.flags |= 67108866), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = li(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === y ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === O && Sa(a) === t.type) ? (t = i(t, n.props), ka(t, n), t.return = e, t) : (t = si(n.type, n.key, n.props, null, e.mode, r), ka(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = di(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = ci(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = li("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case _: return n = si(t.type, t.key, t.props, null, e.mode, n), ka(n, t), n.return = e, n;
					case v: return t = di(t, e.mode, n), t.return = e, t;
					case O: return t = Sa(t), f(e, t, n);
				}
				if (M(t) || A(t)) return t = ci(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, Oa(t), n);
				if (t.$$typeof === C) return f(e, Zi(e, t), n);
				Aa(e, t);
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
					case O: return n = Sa(n), p(e, t, n, r);
				}
				if (M(n) || A(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, Oa(n), r);
				if (n.$$typeof === C) return p(e, t, Zi(e, n), r);
				Aa(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case _: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case v: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case O: return r = Sa(r), m(e, t, n, r, i);
				}
				if (M(r) || A(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, Oa(r), i);
				if (r.$$typeof === C) return m(e, t, n, Zi(t, r), i);
				Aa(t, r);
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
			if (h === s.length) return n(i, d), W && Ci(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return W && Ci(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), W && Ci(i, h), l;
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
			if (v.done) return n(i, h), W && Ci(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
				return W && Ci(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), W && Ci(i, g), u;
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
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === O && Sa(l) === r.type) {
										n(e, r.sibling), c = i(r, a.props), ka(c, a), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								} else t(e, r);
								r = r.sibling;
							}
							a.type === y ? (c = ci(a.props.children, e.mode, c, a.key), c.return = e, e = c) : (c = si(a.type, a.key, a.props, null, e.mode, c), ka(c, a), c.return = e, e = c);
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
							c = di(a, e.mode, c), c.return = e, e = c;
						}
						return o(e);
					case O: return a = Sa(a), b(e, r, a, c);
				}
				if (M(a)) return h(e, r, a, c);
				if (A(a)) {
					if (l = A(a), typeof l != "function") throw Error(s(150));
					return a = l.call(a), g(e, r, a, c);
				}
				if (typeof a.then == "function") return b(e, r, Oa(a), c);
				if (a.$$typeof === C) return b(e, r, Zi(e, a), c);
				Aa(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), c = i(r, a), c.return = e, e = c) : (n(e, r), c = li(a, e.mode, c), c.return = e, e = c), o(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				Da = 0;
				var i = b(e, t, n, r);
				return Ea = null, i;
			} catch (t) {
				if (t === ga || t === va) throw t;
				var a = ri(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var Ma = ja(!0), Na = ja(!1), Pa = !1;
	function Fa(e) {
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
	function Ia(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function La(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function Ra(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, q & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = ei(e), $r(e, null, n), t;
		}
		return Xr(e, r, t, n), ei(e);
	}
	function za(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Ye(e, n);
		}
	}
	function Ba(e, t) {
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
	var Va = !1;
	function Ha() {
		if (Va) {
			var e = sa;
			if (e !== null) throw e;
		}
	}
	function Ua(e, t, n, r) {
		Va = !1;
		var i = e.updateQueue;
		Pa = !1;
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
				if (p ? (Y & f) === f : (r & f) === f) {
					f !== 0 && f === oa && (Va = !0), u !== null && (u = u.next = {
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
							case 2: Pa = !0;
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
	function Wa(e, t) {
		if (typeof e != "function") throw Error(s(191, e));
		e.call(t);
	}
	function Ga(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) Wa(n[e], t);
	}
	var Ka = I(null), qa = I(0);
	function Ja(e, t) {
		e = X, R(qa, e), R(Ka, t), X = e | t.baseLanes;
	}
	function Ya() {
		R(qa, X), R(Ka, Ka.current);
	}
	function Xa() {
		X = qa.current, L(Ka), L(qa);
	}
	var Za = I(null), Qa = null;
	function $a(e) {
		var t = e.alternate;
		R(io, io.current & 1), R(Za, e), Qa === null && (t === null || Ka.current !== null || t.memoizedState !== null) && (Qa = e);
	}
	function eo(e) {
		R(io, io.current), R(Za, e), Qa === null && (Qa = e);
	}
	function to(e) {
		e.tag === 22 ? (R(io, io.current), R(Za, e), Qa === null && (Qa = e)) : no(e);
	}
	function no() {
		R(io, io.current), R(Za, Za.current);
	}
	function ro(e) {
		L(Za), Qa === e && (Qa = null), L(io);
	}
	var io = I(0);
	function ao(e) {
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
	var oo = 0, K = null, so = null, co = null, lo = !1, uo = !1, fo = !1, po = 0, mo = 0, ho = null, go = 0;
	function _o() {
		throw Error(s(321));
	}
	function vo(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!_r(e[n], t[n])) return !1;
		return !0;
	}
	function yo(e, t, n, r, i, a) {
		return oo = a, K = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, N.H = e === null || e.memoizedState === null ? Is : Ls, fo = !1, a = n(r, i), fo = !1, uo && (a = xo(t, n, r, i)), bo(e), a;
	}
	function bo(e) {
		N.H = Fs;
		var t = so !== null && so.next !== null;
		if (oo = 0, co = so = K = null, lo = !1, mo = 0, ho = null, t) throw Error(s(300));
		e === null || ec || (e = e.dependencies, e !== null && Ji(e) && (ec = !0));
	}
	function xo(e, t, n, r) {
		K = e;
		var i = 0;
		do {
			if (uo && (ho = null), mo = 0, uo = !1, 25 <= i) throw Error(s(301));
			if (i += 1, co = so = null, e.updateQueue != null) {
				var a = e.updateQueue;
				a.lastEffect = null, a.events = null, a.stores = null, a.memoCache != null && (a.memoCache.index = 0);
			}
			N.H = Rs, a = t(n, r);
		} while (uo);
		return a;
	}
	function So() {
		var e = N.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? ko(t) : t, e = e.useState()[0], (so === null ? null : so.memoizedState) !== e && (K.flags |= 1024), t;
	}
	function Co() {
		var e = po !== 0;
		return po = 0, e;
	}
	function wo(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function To(e) {
		if (lo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			lo = !1;
		}
		oo = 0, co = so = K = null, uo = !1, mo = po = 0, ho = null;
	}
	function Eo() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return co === null ? K.memoizedState = co = e : co = co.next = e, co;
	}
	function Do() {
		if (so === null) {
			var e = K.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = so.next;
		var t = co === null ? K.memoizedState : co.next;
		if (t !== null) co = t, so = e;
		else {
			if (e === null) throw K.alternate === null ? Error(s(467)) : Error(s(310));
			so = e, e = {
				memoizedState: so.memoizedState,
				baseState: so.baseState,
				baseQueue: so.baseQueue,
				queue: so.queue,
				next: null
			}, co === null ? K.memoizedState = co = e : co = co.next = e;
		}
		return co;
	}
	function Oo() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function ko(e) {
		var t = mo;
		return mo += 1, ho === null && (ho = []), e = xa(ho, e, t), t = K, (co === null ? t.memoizedState : co.next) === null && (t = t.alternate, N.H = t === null || t.memoizedState === null ? Is : Ls), e;
	}
	function Ao(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return ko(e);
			if (e.$$typeof === C) return Xi(e);
		}
		throw Error(s(438, String(e)));
	}
	function jo(e) {
		var t = null, n = K.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = K.alternate;
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
		}, n === null && (n = Oo(), K.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = ee;
		return t.index++, n;
	}
	function Mo(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function No(e) {
		return Po(Do(), so, e);
	}
	function Po(e, t, n) {
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
				if (f === u.lane ? (oo & f) === f : (Y & f) === f) {
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
					else if ((oo & p) === p) {
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
					}, l === null ? (c = l = f, o = a) : l = l.next = f, K.lanes |= p, Wl |= p;
					f = u.action, fo && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, o = a) : l = l.next = p, K.lanes |= f, Wl |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? o = a : l.next = c, !_r(a, e.memoizedState) && (ec = !0, d && (n = sa, n !== null))) throw n;
			e.memoizedState = a, e.baseState = o, e.baseQueue = l, r.lastRenderedState = a;
		}
		return i === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function Fo(e) {
		var t = Do(), n = t.queue;
		if (n === null) throw Error(s(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, a = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var o = i = i.next;
			do
				a = e(a, o.action), o = o.next;
			while (o !== i);
			_r(a, t.memoizedState) || (ec = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function Io(e, t, n) {
		var r = K, i = Do(), a = W;
		if (a) {
			if (n === void 0) throw Error(s(407));
			n = n();
		} else n = t();
		var o = !_r((so || i).memoizedState, n);
		if (o && (i.memoizedState = n, ec = !0), i = i.queue, ss(zo.bind(null, r, i, e), [e]), i.getSnapshot !== t || o || co !== null && co.memoizedState.tag & 1) {
			if (r.flags |= 2048, ns(9, { destroy: void 0 }, Ro.bind(null, r, i, n, t), null), Rl === null) throw Error(s(349));
			a || oo & 127 || Lo(r, t, n);
		}
		return n;
	}
	function Lo(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = K.updateQueue, t === null ? (t = Oo(), K.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function Ro(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Bo(t) && Vo(e);
	}
	function zo(e, t, n) {
		return n(function() {
			Bo(t) && Vo(e);
		});
	}
	function Bo(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !_r(e, n);
		} catch {
			return !0;
		}
	}
	function Vo(e) {
		var t = Qr(e, 2);
		t !== null && mu(t, e, 2);
	}
	function Ho(e) {
		var t = Eo();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), fo) {
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
			lastRenderedReducer: Mo,
			lastRenderedState: e
		}, t;
	}
	function Uo(e, t, n, r) {
		return e.baseState = n, Po(e, so, typeof r == "function" ? r : Mo);
	}
	function Wo(e, t, n, r, i) {
		if (Ms(e)) throw Error(s(485));
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
			N.T === null ? a.isTransition = !1 : n(!0), r(a), n = t.pending, n === null ? (a.next = t.pending = a, Go(t, a)) : (a.next = n.next, t.pending = n.next = a);
		}
	}
	function Go(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = N.T, o = {};
			N.T = o;
			try {
				var s = n(i, r), c = N.S;
				c !== null && c(o, s), Ko(e, t, s);
			} catch (n) {
				Jo(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), N.T = a;
			}
		} else try {
			a = n(i, r), Ko(e, t, a);
		} catch (n) {
			Jo(e, t, n);
		}
	}
	function Ko(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			qo(e, t, n);
		}, function(n) {
			return Jo(e, t, n);
		}) : qo(e, t, n);
	}
	function qo(e, t, n) {
		t.status = "fulfilled", t.value = n, Yo(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Go(e, n)));
	}
	function Jo(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, Yo(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function Yo(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function Xo(e, t) {
		return t;
	}
	function Zo(e, t) {
		if (W) {
			var n = Rl.formState;
			if (n !== null) {
				a: {
					var r = K;
					if (W) {
						if (ki) {
							b: {
								for (var i = ki, a = ji; i.nodeType !== 8;) {
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
								ki = cf(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						Ni(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = Eo(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Xo,
			lastRenderedState: t
		}, n.queue = r, n = ks.bind(null, K, r), r.dispatch = n, r = Ho(!1), a = js.bind(null, K, !1, r.queue), r = Eo(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Wo.bind(null, K, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function Qo(e) {
		return $o(Do(), so, e);
	}
	function $o(e, t, n) {
		if (t = Po(e, t, Xo)[0], e = No(Mo)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = ko(t);
		} catch (e) {
			throw e === ga ? va : e;
		}
		else r = t;
		t = Do();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (K.flags |= 2048, ns(9, { destroy: void 0 }, es.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function es(e, t) {
		e.action = t;
	}
	function ts(e) {
		var t = Do(), n = so;
		if (n !== null) return $o(t, n, e);
		Do(), t = t.memoizedState, n = Do();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function ns(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = K.updateQueue, t === null && (t = Oo(), K.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function rs() {
		return Do().memoizedState;
	}
	function is(e, t, n, r) {
		var i = Eo();
		K.flags |= e, i.memoizedState = ns(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function as(e, t, n, r) {
		var i = Do();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		so !== null && r !== null && vo(r, so.memoizedState.deps) ? i.memoizedState = ns(t, a, n, r) : (K.flags |= e, i.memoizedState = ns(1 | t, a, n, r));
	}
	function os(e, t) {
		is(8390656, 8, e, t);
	}
	function ss(e, t) {
		as(2048, 8, e, t);
	}
	function cs(e) {
		K.flags |= 4;
		var t = K.updateQueue;
		if (t === null) t = Oo(), K.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function ls(e) {
		var t = Do().memoizedState;
		return cs({
			ref: t,
			nextImpl: e
		}), function() {
			if (q & 2) throw Error(s(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function us(e, t) {
		return as(4, 2, e, t);
	}
	function ds(e, t) {
		return as(4, 4, e, t);
	}
	function fs(e, t) {
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
	function ps(e, t, n) {
		n = n == null ? null : n.concat([e]), as(4, 4, fs.bind(null, t, e), n);
	}
	function ms() {}
	function hs(e, t) {
		var n = Do();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && vo(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function gs(e, t) {
		var n = Do();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && vo(t, r[1])) return r[0];
		if (r = e(), fo) {
			Ne(!0);
			try {
				e();
			} finally {
				Ne(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function _s(e, t, n) {
		return n === void 0 || oo & 1073741824 && !(Y & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = pu(), K.lanes |= e, Wl |= e, n);
	}
	function vs(e, t, n, r) {
		return _r(n, t) ? n : Ka.current === null ? !(oo & 42) || oo & 1073741824 && !(Y & 261930) ? (ec = !0, e.memoizedState = n) : (e = pu(), K.lanes |= e, Wl |= e, t) : (e = _s(e, n, r), _r(e, t) || (ec = !0), e);
	}
	function ys(e, t, n, r, i) {
		var a = P.p;
		P.p = a !== 0 && 8 > a ? a : 8;
		var o = N.T, s = {};
		N.T = s, js(e, !1, t, n);
		try {
			var c = i(), l = N.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? As(e, t, ua(c, r), fu(e)) : As(e, t, r, fu(e));
		} catch (n) {
			As(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, fu());
		} finally {
			P.p = a, o !== null && s.types !== null && (o.types = s.types), N.T = o;
		}
	}
	function bs() {}
	function xs(e, t, n, r) {
		if (e.tag !== 5) throw Error(s(476));
		var i = Ss(e).queue;
		ys(e, i, t, re, n === null ? bs : function() {
			return Cs(e), n(r);
		});
	}
	function Ss(e) {
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
				lastRenderedReducer: Mo,
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
				lastRenderedReducer: Mo,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function Cs(e) {
		var t = Ss(e);
		t.next === null && (t = e.alternate.memoizedState), As(e, t.next.queue, {}, fu());
	}
	function ws() {
		return Xi(Qf);
	}
	function Ts() {
		return Do().memoizedState;
	}
	function Es() {
		return Do().memoizedState;
	}
	function Ds(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = fu();
					e = La(n);
					var r = Ra(t, e, n);
					r !== null && (mu(r, t, n), za(r, t, n)), t = { cache: na() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function Os(e, t, n) {
		var r = fu();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, Ms(e) ? Ns(t, n) : (n = Zr(e, t, n, r), n !== null && (mu(n, e, r), Ps(n, t, r)));
	}
	function ks(e, t, n) {
		As(e, t, n, fu());
	}
	function As(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (Ms(e)) Ns(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, _r(s, o)) return Xr(e, t, i, 0), Rl === null && Yr(), !1;
			} catch {}
			if (n = Zr(e, t, i, r), n !== null) return mu(n, e, r), Ps(n, t, r), !0;
		}
		return !1;
	}
	function js(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: ud(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, Ms(e)) {
			if (t) throw Error(s(479));
		} else t = Zr(e, n, r, 2), t !== null && mu(t, e, 2);
	}
	function Ms(e) {
		var t = e.alternate;
		return e === K || t !== null && t === K;
	}
	function Ns(e, t) {
		uo = lo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function Ps(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, Ye(e, n);
		}
	}
	var Fs = {
		readContext: Xi,
		use: Ao,
		useCallback: _o,
		useContext: _o,
		useEffect: _o,
		useImperativeHandle: _o,
		useLayoutEffect: _o,
		useInsertionEffect: _o,
		useMemo: _o,
		useReducer: _o,
		useRef: _o,
		useState: _o,
		useDebugValue: _o,
		useDeferredValue: _o,
		useTransition: _o,
		useSyncExternalStore: _o,
		useId: _o,
		useHostTransitionStatus: _o,
		useFormState: _o,
		useActionState: _o,
		useOptimistic: _o,
		useMemoCache: _o,
		useCacheRefresh: _o
	};
	Fs.useEffectEvent = _o;
	var Is = {
		readContext: Xi,
		use: Ao,
		useCallback: function(e, t) {
			return Eo().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: Xi,
		useEffect: os,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), is(4194308, 4, fs.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return is(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			is(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = Eo();
			t = t === void 0 ? null : t;
			var r = e();
			if (fo) {
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
			var r = Eo();
			if (n !== void 0) {
				var i = n(t);
				if (fo) {
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
			}, r.queue = e, e = e.dispatch = Os.bind(null, K, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = Eo();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = Ho(e);
			var t = e.queue, n = ks.bind(null, K, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: ms,
		useDeferredValue: function(e, t) {
			return _s(Eo(), e, t);
		},
		useTransition: function() {
			var e = Ho(!1);
			return e = ys.bind(null, K, e.queue, !0, !1), Eo().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = K, i = Eo();
			if (W) {
				if (n === void 0) throw Error(s(407));
				n = n();
			} else {
				if (n = t(), Rl === null) throw Error(s(349));
				Y & 127 || Lo(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, os(zo.bind(null, r, a, e), [e]), r.flags |= 2048, ns(9, { destroy: void 0 }, Ro.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = Eo(), t = Rl.identifierPrefix;
			if (W) {
				var n = Si, r = xi;
				n = (r & ~(1 << 32 - Pe(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = po++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = go++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: ws,
		useFormState: Zo,
		useActionState: Zo,
		useOptimistic: function(e) {
			var t = Eo();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = js.bind(null, K, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: jo,
		useCacheRefresh: function() {
			return Eo().memoizedState = Ds.bind(null, K);
		},
		useEffectEvent: function(e) {
			var t = Eo(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (q & 2) throw Error(s(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, Ls = {
		readContext: Xi,
		use: Ao,
		useCallback: hs,
		useContext: Xi,
		useEffect: ss,
		useImperativeHandle: ps,
		useInsertionEffect: us,
		useLayoutEffect: ds,
		useMemo: gs,
		useReducer: No,
		useRef: rs,
		useState: function() {
			return No(Mo);
		},
		useDebugValue: ms,
		useDeferredValue: function(e, t) {
			return vs(Do(), so.memoizedState, e, t);
		},
		useTransition: function() {
			var e = No(Mo)[0], t = Do().memoizedState;
			return [typeof e == "boolean" ? e : ko(e), t];
		},
		useSyncExternalStore: Io,
		useId: Ts,
		useHostTransitionStatus: ws,
		useFormState: Qo,
		useActionState: Qo,
		useOptimistic: function(e, t) {
			return Uo(Do(), so, e, t);
		},
		useMemoCache: jo,
		useCacheRefresh: Es
	};
	Ls.useEffectEvent = ls;
	var Rs = {
		readContext: Xi,
		use: Ao,
		useCallback: hs,
		useContext: Xi,
		useEffect: ss,
		useImperativeHandle: ps,
		useInsertionEffect: us,
		useLayoutEffect: ds,
		useMemo: gs,
		useReducer: Fo,
		useRef: rs,
		useState: function() {
			return Fo(Mo);
		},
		useDebugValue: ms,
		useDeferredValue: function(e, t) {
			var n = Do();
			return so === null ? _s(n, e, t) : vs(n, so.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Fo(Mo)[0], t = Do().memoizedState;
			return [typeof e == "boolean" ? e : ko(e), t];
		},
		useSyncExternalStore: Io,
		useId: Ts,
		useHostTransitionStatus: ws,
		useFormState: ts,
		useActionState: ts,
		useOptimistic: function(e, t) {
			var n = Do();
			return so === null ? (n.baseState = e, [e, n.queue.dispatch]) : Uo(n, so, e, t);
		},
		useMemoCache: jo,
		useCacheRefresh: Es
	};
	Rs.useEffectEvent = ls;
	function zs(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : h({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var Bs = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = fu(), i = La(r);
			i.payload = t, n != null && (i.callback = n), t = Ra(e, i, r), t !== null && (mu(t, e, r), za(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = fu(), i = La(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = Ra(e, i, r), t !== null && (mu(t, e, r), za(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = fu(), r = La(n);
			r.tag = 2, t != null && (r.callback = t), t = Ra(e, r, n), t !== null && (mu(t, e, n), za(t, e, n));
		}
	};
	function Vs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !vr(n, r) || !vr(i, a) : !0;
	}
	function Hs(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Bs.enqueueReplaceState(t, t.state, null);
	}
	function Us(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = h({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Ws(e) {
		Gr(e);
	}
	function Gs(e) {
		console.error(e);
	}
	function Ks(e) {
		Gr(e);
	}
	function qs(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Js(e, t, n) {
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
	function Ys(e, t, n) {
		return n = La(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			qs(e, t);
		}, n;
	}
	function Xs(e) {
		return e = La(e), e.tag = 3, e;
	}
	function Zs(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Js(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Js(t, n, r), typeof i != "function" && (nu === null ? nu = new Set([this]) : nu.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function Qs(e, t, n, r, i) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && qi(t, n, i, !0), n = Za.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return Qa === null ? Eu() : n.alternate === null && Z === 0 && (Z = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === ya ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = new Set([r]) : t.add(r), Wu(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === ya ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = new Set([r]) : n.add(r)), Wu(e, r, i)), !1;
				}
				throw Error(s(435, n.tag));
			}
			return Wu(e, r, i), Eu(), !1;
		}
		if (W) return t = Za.current, t === null ? (r !== Mi && (t = Error(s(423), { cause: r }), zi(pi(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = pi(r, n), i = Ys(e.stateNode, r, i), Ba(e, i), Z !== 4 && (Z = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== Mi && (e = Error(s(422), { cause: r }), zi(pi(e, n)))), !1;
		var a = Error(s(520), { cause: r });
		if (a = pi(a, n), Yl === null ? Yl = [a] : Yl.push(a), Z !== 4 && (Z = 2), t === null) return !0;
		r = pi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = Ys(n.stateNode, r, e), Ba(n, e), !1;
				case 1: if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (nu === null || !nu.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = Xs(i), Zs(i, e, n, r), Ba(n, i), !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var $s = Error(s(461)), ec = !1;
	function tc(e, t, n, r) {
		t.child = e === null ? Na(t, null, n, r) : Ma(t, e.child, n, r);
	}
	function nc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return Yi(t), r = yo(e, t, n, o, a, i), s = Co(), e !== null && !ec ? (wo(e, t, i), Ec(e, t, i)) : (W && s && Ti(t), t.flags |= 1, tc(e, t, r, i), t.child);
	}
	function rc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !ii(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, ic(e, t, a, r, i)) : (e = si(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !Dc(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? vr : n, n(o, r) && e.ref === t.ref) return Ec(e, t, i);
		}
		return t.flags |= 1, e = ai(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function ic(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (vr(a, r) && e.ref === t.ref) if (ec = !1, t.pendingProps = r = a, Dc(e, i)) e.flags & 131072 && (ec = !0);
			else return t.lanes = e.lanes, Ec(e, t, i);
		}
		return fc(e, t, n, r, i);
	}
	function ac(e, t, n, r) {
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
				return sc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && ma(t, a === null ? null : a.cachePool), a === null ? Ya() : Ja(t, a), to(t);
			else return r = t.lanes = 536870912, sc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && ma(t, null), Ya(), no(t)) : (ma(t, a.cachePool), Ja(t, a), no(t), t.memoizedState = null);
		return tc(e, t, i, n), t.child;
	}
	function oc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function sc(e, t, n, r, i) {
		var a = pa();
		return a = a === null ? null : {
			parent: G._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && ma(t, null), Ya(), to(t), e !== null && qi(e, t, r, !0), t.childLanes = i, null;
	}
	function cc(e, t) {
		return t = xc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function lc(e, t, n) {
		return Ma(t, e.child, null, n), e = cc(t, t.pendingProps), e.flags |= 2, ro(t), t.memoizedState = null, e;
	}
	function uc(e, t, n) {
		var r = t.pendingProps, i = (t.flags & 128) != 0;
		if (t.flags &= -129, e === null) {
			if (W) {
				if (r.mode === "hidden") return e = cc(t, r), t.lanes = 536870912, oc(null, e);
				if (eo(t), (e = ki) ? (e = rf(e, ji), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: bi === null ? null : {
						id: xi,
						overflow: Si
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = ui(e), n.return = t, t.child = n, Oi = t, ki = null)) : e = null, e === null) throw Ni(t);
				return t.lanes = 536870912, null;
			}
			return cc(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var o = a.dehydrated;
			if (eo(t), i) if (t.flags & 256) t.flags &= -257, t = lc(e, t, n);
			else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
			else throw Error(s(558));
			else if (ec || qi(e, t, n, !1), i = (n & e.childLanes) !== 0, ec || i) {
				if (r = Rl, r !== null && (o = Xe(r, n), o !== 0 && o !== a.retryLane)) throw a.retryLane = o, Qr(e, o), mu(r, e, o), $s;
				Eu(), t = lc(e, t, n);
			} else e = a.treeContext, ki = cf(o.nextSibling), Oi = t, W = !0, Ai = null, ji = !1, e !== null && Di(t, e), t = cc(t, r), t.flags |= 4096;
			return t;
		}
		return e = ai(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function dc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(s(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function fc(e, t, n, r, i) {
		return Yi(t), n = yo(e, t, n, r, void 0, i), r = Co(), e !== null && !ec ? (wo(e, t, i), Ec(e, t, i)) : (W && r && Ti(t), t.flags |= 1, tc(e, t, n, i), t.child);
	}
	function pc(e, t, n, r, i, a) {
		return Yi(t), t.updateQueue = null, n = xo(t, r, n, i), bo(e), r = Co(), e !== null && !ec ? (wo(e, t, a), Ec(e, t, a)) : (W && r && Ti(t), t.flags |= 1, tc(e, t, n, a), t.child);
	}
	function mc(e, t, n, r, i) {
		if (Yi(t), t.stateNode === null) {
			var a = ti, o = n.contextType;
			typeof o == "object" && o && (a = Xi(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Bs, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Fa(t), o = n.contextType, a.context = typeof o == "object" && o ? Xi(o) : ti, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (zs(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Bs.enqueueReplaceState(a, a.state, null), Ua(t, r, a, i), Ha(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = Us(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = ti, typeof u == "object" && u && (o = Xi(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && Hs(t, a, r, o), Pa = !1;
			var f = t.memoizedState;
			a.state = f, Ua(t, r, a, i), Ha(), l = t.memoizedState, s || f !== l || Pa ? (typeof d == "function" && (zs(t, n, d, r), l = t.memoizedState), (c = Pa || Vs(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Ia(e, t), o = t.memoizedProps, u = Us(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = ti, typeof l == "object" && l && (c = Xi(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && Hs(t, a, r, c), Pa = !1, f = t.memoizedState, a.state = f, Ua(t, r, a, i), Ha();
			var p = t.memoizedState;
			o !== d || f !== p || Pa || e !== null && e.dependencies !== null && Ji(e.dependencies) ? (typeof s == "function" && (zs(t, n, s, r), p = t.memoizedState), (u = Pa || Vs(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Ji(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, dc(e, t), r = (t.flags & 128) != 0, a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = Ma(t, e.child, null, i), t.child = Ma(t, null, n, i)) : tc(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = Ec(e, t, i), e;
	}
	function hc(e, t, n, r) {
		return Li(), t.flags |= 256, tc(e, t, n, r), t.child;
	}
	var gc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function _c(e) {
		return {
			baseLanes: e,
			cachePool: ha()
		};
	}
	function vc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= ql), e;
	}
	function yc(e, t, n) {
		var r = t.pendingProps, i = !1, a = (t.flags & 128) != 0, o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : (io.current & 2) != 0), o && (i = !0, t.flags &= -129), o = (t.flags & 32) != 0, t.flags &= -33, e === null) {
			if (W) {
				if (i ? $a(t) : no(t), (e = ki) ? (e = rf(e, ji), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: bi === null ? null : {
						id: xi,
						overflow: Si
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = ui(e), n.return = t, t.child = n, Oi = t, ki = null)) : e = null, e === null) throw Ni(t);
				return of(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var c = r.children;
			return r = r.fallback, i ? (no(t), i = t.mode, c = xc({
				mode: "hidden",
				children: c
			}, i), r = ci(r, i, n, null), c.return = t, r.return = t, c.sibling = r, t.child = c, r = t.child, r.memoizedState = _c(n), r.childLanes = vc(e, o, n), t.memoizedState = gc, oc(null, r)) : ($a(t), bc(t, c));
		}
		var l = e.memoizedState;
		if (l !== null && (c = l.dehydrated, c !== null)) {
			if (a) t.flags & 256 ? ($a(t), t.flags &= -257, t = Sc(e, t, n)) : t.memoizedState === null ? (no(t), c = r.fallback, i = t.mode, r = xc({
				mode: "visible",
				children: r.children
			}, i), c = ci(c, i, n, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, Ma(t, e.child, null, n), r = t.child, r.memoizedState = _c(n), r.childLanes = vc(e, o, n), t.memoizedState = gc, t = oc(null, r)) : (no(t), t.child = e.child, t.flags |= 128, t = null);
			else if ($a(t), of(c)) {
				if (o = c.nextSibling && c.nextSibling.dataset, o) var u = o.dgst;
				o = u, r = Error(s(419)), r.stack = "", r.digest = o, zi({
					value: r,
					source: null,
					stack: null
				}), t = Sc(e, t, n);
			} else if (ec || qi(e, t, n, !1), o = (n & e.childLanes) !== 0, ec || o) {
				if (o = Rl, o !== null && (r = Xe(o, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, Qr(e, r), mu(o, e, r), $s;
				af(c) || Eu(), t = Sc(e, t, n);
			} else af(c) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, ki = cf(c.nextSibling), Oi = t, W = !0, Ai = null, ji = !1, e !== null && Di(t, e), t = bc(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? (no(t), c = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = ai(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (c = ci(c, i, n, null), c.flags |= 2) : c = ai(u, c), c.return = t, r.return = t, r.sibling = c, t.child = r, oc(null, r), r = t.child, c = e.child.memoizedState, c === null ? c = _c(n) : (i = c.cachePool, i === null ? i = ha() : (l = G._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), c = {
			baseLanes: c.baseLanes | n,
			cachePool: i
		}), r.memoizedState = c, r.childLanes = vc(e, o, n), t.memoizedState = gc, oc(e.child, r)) : ($a(t), n = e.child, e = n.sibling, n = ai(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function bc(e, t) {
		return t = xc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function xc(e, t) {
		return e = ri(22, e, null, t), e.lanes = 0, e;
	}
	function Sc(e, t, n) {
		return Ma(t, e.child, null, n), e = bc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Cc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Gi(e.return, t, n);
	}
	function wc(e, t, n, r, i, a) {
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
	function Tc(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = io.current, s = (o & 2) != 0;
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, R(io, o), tc(e, t, r, n), r = W ? _i : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && Cc(e, n, t);
			else if (e.tag === 19) Cc(e, n, t);
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
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && ao(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), wc(t, !1, i, n, a, r);
				break;
			case "backwards":
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && ao(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				wc(t, !0, n, null, a, r);
				break;
			case "together":
				wc(t, !1, null, null, void 0, r);
				break;
			default: t.memoizedState = null;
		}
		return t.child;
	}
	function Ec(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), Wl |= t.lanes, (n & t.childLanes) === 0) if (e !== null) {
			if (qi(e, t, n, !1), (n & t.childLanes) === 0) return null;
		} else return null;
		if (e !== null && t.child !== e.child) throw Error(s(153));
		if (t.child !== null) {
			for (e = t.child, n = ai(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ai(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function Dc(e, t) {
		return (e.lanes & t) === 0 ? (e = e.dependencies, !!(e !== null && Ji(e))) : !0;
	}
	function Oc(e, t, n) {
		switch (t.tag) {
			case 3:
				z(t, t.stateNode.containerInfo), Ui(t, G, e.memoizedState.cache), Li();
				break;
			case 27:
			case 5:
				B(t);
				break;
			case 4:
				z(t, t.stateNode.containerInfo);
				break;
			case 10:
				Ui(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, eo(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? ($a(t), e = Ec(e, t, n), e === null ? null : e.sibling) : yc(e, t, n) : ($a(t), t.flags |= 128, null);
				$a(t);
				break;
			case 19:
				var i = (e.flags & 128) != 0;
				if (r = (n & t.childLanes) !== 0, r ||= (qi(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return Tc(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), R(io, io.current), r) break;
				return null;
			case 22: return t.lanes = 0, ac(e, t, n, t.pendingProps);
			case 24: Ui(t, G, e.memoizedState.cache);
		}
		return Ec(e, t, n);
	}
	function kc(e, t, n) {
		if (e !== null) if (e.memoizedProps !== t.pendingProps) ec = !0;
		else {
			if (!Dc(e, n) && !(t.flags & 128)) return ec = !1, Oc(e, t, n);
			ec = !!(e.flags & 131072);
		}
		else ec = !1, W && t.flags & 1048576 && wi(t, _i, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = Sa(t.elementType), t.type = e, typeof e == "function") ii(e) ? (r = Us(e, r), t.tag = 1, t = mc(null, t, e, r, n)) : (t.tag = 0, t = fc(null, t, e, r, n));
					else {
						if (e != null) {
							var i = e.$$typeof;
							if (i === w) {
								t.tag = 11, t = nc(null, t, e, r, n);
								break a;
							} else if (i === D) {
								t.tag = 14, t = rc(null, t, e, r, n);
								break a;
							}
						}
						throw t = j(e) || e, Error(s(306, t, ""));
					}
				}
				return t;
			case 0: return fc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, i = Us(r, t.pendingProps), mc(e, t, r, i, n);
			case 3:
				a: {
					if (z(t, t.stateNode.containerInfo), e === null) throw Error(s(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, Ia(e, t), Ua(t, r, null, n);
					var o = t.memoizedState;
					if (r = o.cache, Ui(t, G, r), r !== a.cache && Ki(t, [G], n, !0), Ha(), r = o.element, a.isDehydrated) if (a = {
						element: r,
						isDehydrated: !1,
						cache: o.cache
					}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
						t = hc(e, t, r, n);
						break a;
					} else if (r !== i) {
						i = pi(Error(s(424)), t), zi(i), t = hc(e, t, r, n);
						break a;
					} else {
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (ki = cf(e.firstChild), Oi = t, W = !0, Ai = null, ji = !0, n = Na(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					}
					else {
						if (Li(), r === i) {
							t = Ec(e, t, n);
							break a;
						}
						tc(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return dc(e, t), e === null ? (n = kf(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : W || (n = t.type, e = t.pendingProps, r = Bd(se.current).createElement(n), r[nt] = t, r[rt] = e, Pd(r, n, e), ht(r), t.stateNode = r) : t.memoizedState = kf(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return B(t), e === null && W && (r = t.stateNode = ff(t.type, t.pendingProps, se.current), Oi = t, ji = !0, i = ki, Zd(t.type) ? (lf = i, ki = cf(r.firstChild)) : ki = i), tc(e, t, t.pendingProps.children, n), dc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && W && ((i = r = ki) && (r = tf(r, t.type, t.pendingProps, ji), r === null ? i = !1 : (t.stateNode = r, Oi = t, ki = cf(r.firstChild), ji = !1, i = !0)), i || Ni(t)), B(t), i = t.type, a = t.pendingProps, o = e === null ? null : e.memoizedProps, r = a.children, Ud(i, a) ? r = null : o !== null && Ud(i, o) && (t.flags |= 32), t.memoizedState !== null && (i = yo(e, t, So, null, null, n), Qf._currentValue = i), dc(e, t), tc(e, t, r, n), t.child;
			case 6: return e === null && W && ((e = n = ki) && (n = nf(n, t.pendingProps, ji), n === null ? e = !1 : (t.stateNode = n, Oi = t, ki = null, e = !0)), e || Ni(t)), null;
			case 13: return yc(e, t, n);
			case 4: return z(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = Ma(t, null, r, n) : tc(e, t, r, n), t.child;
			case 11: return nc(e, t, t.type, t.pendingProps, n);
			case 7: return tc(e, t, t.pendingProps, n), t.child;
			case 8: return tc(e, t, t.pendingProps.children, n), t.child;
			case 12: return tc(e, t, t.pendingProps.children, n), t.child;
			case 10: return r = t.pendingProps, Ui(t, t.type, r.value), tc(e, t, r.children, n), t.child;
			case 9: return i = t.type._context, r = t.pendingProps.children, Yi(t), i = Xi(i), r = r(i), t.flags |= 1, tc(e, t, r, n), t.child;
			case 14: return rc(e, t, t.type, t.pendingProps, n);
			case 15: return ic(e, t, t.type, t.pendingProps, n);
			case 19: return Tc(e, t, n);
			case 31: return uc(e, t, n);
			case 22: return ac(e, t, n, t.pendingProps);
			case 24: return Yi(t), r = Xi(G), e === null ? (i = pa(), i === null && (i = Rl, a = na(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, Fa(t), Ui(t, G, i)) : ((e.lanes & n) !== 0 && (Ia(e, t), Ua(t, null, null, n), Ha()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, Ui(t, G, r), r !== i.cache && Ki(t, [G], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), Ui(t, G, r))), tc(e, t, t.pendingProps.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(s(156, t.tag));
	}
	function Ac(e) {
		e.flags |= 4;
	}
	function jc(e, t, n, r, i) {
		if ((t = (e.mode & 32) != 0) && (t = !1), t) {
			if (e.flags |= 16777216, (i & 335544128) === i) if (e.stateNode.complete) e.flags |= 8192;
			else if (Cu()) e.flags |= 8192;
			else throw Ca = ya, _a;
		} else e.flags &= -16777217;
	}
	function Mc(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Wf(t)) if (Cu()) e.flags |= 8192;
		else throw Ca = ya, _a;
	}
	function Nc(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : We(), e.lanes |= t, Jl |= t);
	}
	function Pc(e, t) {
		if (!W) switch (e.tailMode) {
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
	function Fc(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 65011712, r |= i.flags & 65011712, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function Ic(e, t, n) {
		var r = t.pendingProps;
		switch (Ei(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return Fc(t), null;
			case 1: return Fc(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Wi(G), le(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Ii(t) ? Ac(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Ri())), Fc(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (Ac(t), a === null ? (Fc(t), jc(t, i, null, r, n)) : (Fc(t), Mc(t, a))) : a ? a === e.memoizedState ? (Fc(t), t.flags &= -16777217) : (Ac(t), Fc(t), Mc(t, a)) : (e = e.memoizedProps, e !== r && Ac(t), Fc(t), jc(t, i, e, r, n)), null;
			case 27:
				if (ue(t), n = se.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Ac(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Fc(t), null;
					}
					e = ae.current, Ii(t) ? Pi(t, e) : (e = ff(i, r, n), t.stateNode = e, Ac(t));
				}
				return Fc(t), null;
			case 5:
				if (ue(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Ac(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return Fc(t), null;
					}
					if (a = ae.current, Ii(t)) Pi(t, a);
					else {
						var o = Bd(se.current);
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
						a[nt] = t, a[rt] = r;
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
						r && Ac(t);
					}
				}
				return Fc(t), jc(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && Ac(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(s(166));
					if (e = se.current, Ii(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = Oi, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[nt] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || jd(e.nodeValue, n)), e || Ni(t, !0);
					} else e = Bd(e).createTextNode(r), e[nt] = t, t.stateNode = e;
				}
				return Fc(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Ii(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(s(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(557));
							e[nt] = t;
						} else Li(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Fc(t), e = !1;
					} else n = Ri(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (ro(t), t) : (ro(t), null);
					if (t.flags & 128) throw Error(s(558));
				}
				return Fc(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = Ii(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(s(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(s(317));
							i[nt] = t;
						} else Li(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						Fc(t), i = !1;
					} else i = Ri(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (ro(t), t) : (ro(t), null);
				}
				return ro(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Nc(t, t.updateQueue), Fc(t), null);
			case 4: return le(), e === null && xd(t.stateNode.containerInfo), Fc(t), null;
			case 10: return Wi(t.type), Fc(t), null;
			case 19:
				if (L(io), r = t.memoizedState, r === null) return Fc(t), null;
				if (i = (t.flags & 128) != 0, a = r.rendering, a === null) if (i) Pc(r, !1);
				else {
					if (Z !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
						if (a = ao(e), a !== null) {
							for (t.flags |= 128, Pc(r, !1), e = a.updateQueue, t.updateQueue = e, Nc(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) oi(n, e), n = n.sibling;
							return R(io, io.current & 1 | 2), W && Ci(t, r.treeForkCount), t.child;
						}
						e = e.sibling;
					}
					r.tail !== null && Ce() > eu && (t.flags |= 128, i = !0, Pc(r, !1), t.lanes = 4194304);
				}
				else {
					if (!i) if (e = ao(a), e !== null) {
						if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Nc(t, e), Pc(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !W) return Fc(t), null;
					} else 2 * Ce() - r.renderingStartTime > eu && n !== 536870912 && (t.flags |= 128, i = !0, Pc(r, !1), t.lanes = 4194304);
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (Fc(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Ce(), e.sibling = null, n = io.current, R(io, i ? n & 1 | 2 : n & 1), W && Ci(t, r.treeForkCount), e);
			case 22:
			case 23: return ro(t), Xa(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (Fc(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Fc(t), n = t.updateQueue, n !== null && Nc(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && L(fa), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Wi(G), Fc(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(s(156, t.tag));
	}
	function Lc(e, t) {
		switch (Ei(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Wi(G), le(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return ue(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (ro(t), t.alternate === null) throw Error(s(340));
					Li();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (ro(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(s(340));
					Li();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return L(io), null;
			case 4: return le(), null;
			case 10: return Wi(t.type), null;
			case 22:
			case 23: return ro(t), Xa(), e !== null && L(fa), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Wi(G), null;
			case 25: return null;
			default: return null;
		}
	}
	function Rc(e, t) {
		switch (Ei(t), t.tag) {
			case 3:
				Wi(G), le();
				break;
			case 26:
			case 27:
			case 5:
				ue(t);
				break;
			case 4:
				le();
				break;
			case 31:
				t.memoizedState !== null && ro(t);
				break;
			case 13:
				ro(t);
				break;
			case 19:
				L(io);
				break;
			case 10:
				Wi(t.type);
				break;
			case 22:
			case 23:
				ro(t), Xa(), e !== null && L(fa);
				break;
			case 24: Wi(G);
		}
	}
	function zc(e, t) {
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
	function Bc(e, t, n) {
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
	function Vc(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Ga(t, n);
			} catch (t) {
				Uu(e, e.return, t);
			}
		}
	}
	function Hc(e, t, n) {
		n.props = Us(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Uu(e, t, n);
		}
	}
	function Uc(e, t) {
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
	function Wc(e, t) {
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
	function Gc(e) {
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
	function Kc(e, t, n) {
		try {
			var r = e.stateNode;
			Fd(r, e.type, n, t), r[rt] = t;
		} catch (t) {
			Uu(e, e.return, t);
		}
	}
	function qc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Zd(e.type) || e.tag === 4;
	}
	function Jc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || qc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Zd(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Yc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Yt));
		else if (r !== 4 && (r === 27 && Zd(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null)) for (Yc(e, t, n), e = e.sibling; e !== null;) Yc(e, t, n), e = e.sibling;
	}
	function Xc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (r === 27 && Zd(e.type) && (n = e.stateNode), e = e.child, e !== null)) for (Xc(e, t, n), e = e.sibling; e !== null;) Xc(e, t, n), e = e.sibling;
	}
	function Zc(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			Pd(t, r, n), t[nt] = e, t[rt] = n;
		} catch (t) {
			Uu(e, e.return, t);
		}
	}
	var Qc = !1, $c = !1, el = !1, tl = typeof WeakSet == "function" ? WeakSet : Set, nl = null;
	function rl(e, t) {
		if (e = e.containerInfo, Rd = sp, e = Sr(e), Cr(e)) {
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
		}, sp = !1, nl = t; nl !== null;) if (t = nl, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, nl = e;
		else for (; nl !== null;) {
			switch (t = nl, a = t.alternate, e = t.flags, t.tag) {
				case 0:
					if (e & 4 && (e = t.updateQueue, e = e === null ? null : e.events, e !== null)) for (n = 0; n < e.length; n++) i = e[n], i.ref.impl = i.nextImpl;
					break;
				case 11:
				case 15: break;
				case 1:
					if (e & 1024 && a !== null) {
						e = void 0, n = t, i = a.memoizedProps, a = a.memoizedState, r = n.stateNode;
						try {
							var h = Us(n.type, i);
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
				e.return = t.return, nl = e;
				break;
			}
			nl = t.return;
		}
	}
	function il(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				yl(e, n), r & 4 && zc(5, n);
				break;
			case 1:
				if (yl(e, n), r & 4) if (e = n.stateNode, t === null) try {
					e.componentDidMount();
				} catch (e) {
					Uu(n, n.return, e);
				}
				else {
					var i = Us(n.type, t.memoizedProps);
					t = t.memoizedState;
					try {
						e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
					} catch (e) {
						Uu(n, n.return, e);
					}
				}
				r & 64 && Vc(n), r & 512 && Uc(n, n.return);
				break;
			case 3:
				if (yl(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						Ga(e, t);
					} catch (e) {
						Uu(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && Zc(n);
			case 26:
			case 5:
				yl(e, n), t === null && r & 4 && Gc(n), r & 512 && Uc(n, n.return);
				break;
			case 12:
				yl(e, n);
				break;
			case 31:
				yl(e, n), r & 4 && ul(e, n);
				break;
			case 13:
				yl(e, n), r & 4 && dl(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = qu.bind(null, n), sf(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || Qc, !r) {
					t = t !== null && t.memoizedState !== null || $c, i = Qc;
					var a = $c;
					Qc = r, ($c = t) && !a ? xl(e, n, (n.subtreeFlags & 8772) != 0) : yl(e, n), Qc = i, $c = a;
				}
				break;
			case 30: break;
			default: yl(e, n);
		}
	}
	function al(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, al(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && ut(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var ol = null, sl = !1;
	function cl(e, t, n) {
		for (n = n.child; n !== null;) ll(e, t, n), n = n.sibling;
	}
	function ll(e, t, n) {
		if (V && typeof V.onCommitFiberUnmount == "function") try {
			V.onCommitFiberUnmount(Me, n);
		} catch {}
		switch (n.tag) {
			case 26:
				$c || Wc(n, t), cl(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				$c || Wc(n, t);
				var r = ol, i = sl;
				Zd(n.type) && (ol = n.stateNode, sl = !1), cl(e, t, n), pf(n.stateNode), ol = r, sl = i;
				break;
			case 5: $c || Wc(n, t);
			case 6:
				if (r = ol, i = sl, ol = null, cl(e, t, n), ol = r, sl = i, ol !== null) if (sl) try {
					(ol.nodeType === 9 ? ol.body : ol.nodeName === "HTML" ? ol.ownerDocument.body : ol).removeChild(n.stateNode);
				} catch (e) {
					Uu(n, t, e);
				}
				else try {
					ol.removeChild(n.stateNode);
				} catch (e) {
					Uu(n, t, e);
				}
				break;
			case 18:
				ol !== null && (sl ? (e = ol, Qd(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Np(e)) : Qd(ol, n.stateNode));
				break;
			case 4:
				r = ol, i = sl, ol = n.stateNode.containerInfo, sl = !0, cl(e, t, n), ol = r, sl = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Bc(2, n, t), $c || Bc(4, n, t), cl(e, t, n);
				break;
			case 1:
				$c || (Wc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Hc(n, t, r)), cl(e, t, n);
				break;
			case 21:
				cl(e, t, n);
				break;
			case 22:
				$c = (r = $c) || n.memoizedState !== null, cl(e, t, n), $c = r;
				break;
			default: cl(e, t, n);
		}
	}
	function ul(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Np(e);
			} catch (e) {
				Uu(t, t.return, e);
			}
		}
	}
	function dl(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Np(e);
		} catch (e) {
			Uu(t, t.return, e);
		}
	}
	function fl(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new tl()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new tl()), t;
			default: throw Error(s(435, e.tag));
		}
	}
	function pl(e, t) {
		var n = fl(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = Ju.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function ml(e, t) {
		var n = t.deletions;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r], a = e, o = t, c = o;
			a: for (; c !== null;) {
				switch (c.tag) {
					case 27:
						if (Zd(c.type)) {
							ol = c.stateNode, sl = !1;
							break a;
						}
						break;
					case 5:
						ol = c.stateNode, sl = !1;
						break a;
					case 3:
					case 4:
						ol = c.stateNode.containerInfo, sl = !0;
						break a;
				}
				c = c.return;
			}
			if (ol === null) throw Error(s(160));
			ll(a, o, i), ol = null, sl = !1, a = i.alternate, a !== null && (a.return = null), i.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) gl(t, e), t = t.sibling;
	}
	var hl = null;
	function gl(e, t) {
		var n = e.alternate, r = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				ml(t, e), _l(e), r & 4 && (Bc(3, e, e.return), zc(3, e), Bc(5, e, e.return));
				break;
			case 1:
				ml(t, e), _l(e), r & 512 && ($c || n === null || Wc(n, n.return)), r & 64 && Qc && (e = e.updateQueue, e !== null && (r = e.callbacks, r !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? r : n.concat(r))));
				break;
			case 26:
				var i = hl;
				if (ml(t, e), _l(e), r & 512 && ($c || n === null || Wc(n, n.return)), r & 4) {
					var a = n === null ? null : n.memoizedState;
					if (r = e.memoizedState, n === null) if (r === null) if (e.stateNode === null) {
						a: {
							r = e.type, n = e.memoizedProps, i = i.ownerDocument || i;
							b: switch (r) {
								case "title":
									a = i.getElementsByTagName("title")[0], (!a || a[lt] || a[nt] || a.namespaceURI === "http://www.w3.org/2000/svg" || a.hasAttribute("itemprop")) && (a = i.createElement(r), i.head.insertBefore(a, i.querySelector("head > title"))), Pd(a, r, n), a[nt] = e, ht(a), r = a;
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
							a[nt] = e, ht(a), r = a;
						}
						e.stateNode = r;
					} else Hf(i, e.type, e.stateNode);
					else e.stateNode = If(i, r, e.memoizedProps);
					else a === r ? r === null && e.stateNode !== null && Kc(e, e.memoizedProps, n.memoizedProps) : (a === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : a.count--, r === null ? Hf(i, e.type, e.stateNode) : If(i, r, e.memoizedProps));
				}
				break;
			case 27:
				ml(t, e), _l(e), r & 512 && ($c || n === null || Wc(n, n.return)), n !== null && r & 4 && Kc(e, e.memoizedProps, n.memoizedProps);
				break;
			case 5:
				if (ml(t, e), _l(e), r & 512 && ($c || n === null || Wc(n, n.return)), e.flags & 32) {
					i = e.stateNode;
					try {
						Vt(i, "");
					} catch (t) {
						Uu(e, e.return, t);
					}
				}
				r & 4 && e.stateNode != null && (i = e.memoizedProps, Kc(e, i, n === null ? i : n.memoizedProps)), r & 1024 && (el = !0);
				break;
			case 6:
				if (ml(t, e), _l(e), r & 4) {
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
				if (Bf = null, i = hl, hl = gf(t.containerInfo), ml(t, e), hl = i, _l(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					Np(t.containerInfo);
				} catch (t) {
					Uu(e, e.return, t);
				}
				el && (el = !1, vl(e));
				break;
			case 4:
				r = hl, hl = gf(e.stateNode.containerInfo), ml(t, e), _l(e), hl = r;
				break;
			case 12:
				ml(t, e), _l(e);
				break;
			case 31:
				ml(t, e), _l(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, pl(e, r)));
				break;
			case 13:
				ml(t, e), _l(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Ql = Ce()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, pl(e, r)));
				break;
			case 22:
				i = e.memoizedState !== null;
				var l = n !== null && n.memoizedState !== null, u = Qc, d = $c;
				if (Qc = u || i, $c = d || l, ml(t, e), $c = d, Qc = u, _l(e), r & 8192) a: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || l || Qc || $c || bl(e)), n = null, t = e;;) {
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
				r & 4 && (r = e.updateQueue, r !== null && (n = r.retryQueue, n !== null && (r.retryQueue = null, pl(e, n))));
				break;
			case 19:
				ml(t, e), _l(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, pl(e, r)));
				break;
			case 30: break;
			case 21: break;
			default: ml(t, e), _l(e);
		}
	}
	function _l(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (qc(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				if (n == null) throw Error(s(160));
				switch (n.tag) {
					case 27:
						var i = n.stateNode;
						Xc(e, Jc(e), i);
						break;
					case 5:
						var a = n.stateNode;
						n.flags & 32 && (Vt(a, ""), n.flags &= -33), Xc(e, Jc(e), a);
						break;
					case 3:
					case 4:
						var o = n.stateNode.containerInfo;
						Yc(e, Jc(e), o);
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
	function vl(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			vl(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
		}
	}
	function yl(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) il(e, t.alternate, t), t = t.sibling;
	}
	function bl(e) {
		for (e = e.child; e !== null;) {
			var t = e;
			switch (t.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Bc(4, t, t.return), bl(t);
					break;
				case 1:
					Wc(t, t.return);
					var n = t.stateNode;
					typeof n.componentWillUnmount == "function" && Hc(t, t.return, n), bl(t);
					break;
				case 27: pf(t.stateNode);
				case 26:
				case 5:
					Wc(t, t.return), bl(t);
					break;
				case 22:
					t.memoizedState === null && bl(t);
					break;
				case 30:
					bl(t);
					break;
				default: bl(t);
			}
			e = e.sibling;
		}
	}
	function xl(e, t, n) {
		for (n &&= (t.subtreeFlags & 8772) != 0, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags;
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					xl(i, a, n), zc(4, a);
					break;
				case 1:
					if (xl(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Uu(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var s = r.stateNode;
						try {
							var c = i.shared.hiddenCallbacks;
							if (c !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < c.length; i++) Wa(c[i], s);
						} catch (e) {
							Uu(r, r.return, e);
						}
					}
					n && o & 64 && Vc(a), Uc(a, a.return);
					break;
				case 27: Zc(a);
				case 26:
				case 5:
					xl(i, a, n), n && r === null && o & 4 && Gc(a), Uc(a, a.return);
					break;
				case 12:
					xl(i, a, n);
					break;
				case 31:
					xl(i, a, n), n && o & 4 && ul(i, a);
					break;
				case 13:
					xl(i, a, n), n && o & 4 && dl(i, a);
					break;
				case 22:
					a.memoizedState === null && xl(i, a, n), Uc(a, a.return);
					break;
				case 30: break;
				default: xl(i, a, n);
			}
			t = t.sibling;
		}
	}
	function Sl(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && ra(n));
	}
	function Cl(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ra(e));
	}
	function wl(e, t, n, r) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) Tl(e, t, n, r), t = t.sibling;
	}
	function Tl(e, t, n, r) {
		var i = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				wl(e, t, n, r), i & 2048 && zc(9, t);
				break;
			case 1:
				wl(e, t, n, r);
				break;
			case 3:
				wl(e, t, n, r), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ra(e)));
				break;
			case 12:
				if (i & 2048) {
					wl(e, t, n, r), e = t.stateNode;
					try {
						var a = t.memoizedProps, o = a.id, s = a.onPostCommit;
						typeof s == "function" && s(o, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0);
					} catch (e) {
						Uu(t, t.return, e);
					}
				} else wl(e, t, n, r);
				break;
			case 31:
				wl(e, t, n, r);
				break;
			case 13:
				wl(e, t, n, r);
				break;
			case 23: break;
			case 22:
				a = t.stateNode, o = t.alternate, t.memoizedState === null ? a._visibility & 2 ? wl(e, t, n, r) : (a._visibility |= 2, El(e, t, n, r, (t.subtreeFlags & 10256) != 0 || !1)) : a._visibility & 2 ? wl(e, t, n, r) : Dl(e, t), i & 2048 && Sl(o, t);
				break;
			case 24:
				wl(e, t, n, r), i & 2048 && Cl(t.alternate, t);
				break;
			default: wl(e, t, n, r);
		}
	}
	function El(e, t, n, r, i) {
		for (i &&= (t.subtreeFlags & 10256) != 0 || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					El(a, o, s, c, i), zc(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, El(a, o, s, c, i)) : u._visibility & 2 ? El(a, o, s, c, i) : Dl(a, o), i && l & 2048 && Sl(o.alternate, o);
					break;
				case 24:
					El(a, o, s, c, i), i && l & 2048 && Cl(o.alternate, o);
					break;
				default: El(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function Dl(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					Dl(n, r), i & 2048 && Sl(r.alternate, r);
					break;
				case 24:
					Dl(n, r), i & 2048 && Cl(r.alternate, r);
					break;
				default: Dl(n, r);
			}
			t = t.sibling;
		}
	}
	var Ol = 8192;
	function kl(e, t, n) {
		if (e.subtreeFlags & Ol) for (e = e.child; e !== null;) Al(e, t, n), e = e.sibling;
	}
	function Al(e, t, n) {
		switch (e.tag) {
			case 26:
				kl(e, t, n), e.flags & Ol && e.memoizedState !== null && Gf(n, hl, e.memoizedState, e.memoizedProps);
				break;
			case 5:
				kl(e, t, n);
				break;
			case 3:
			case 4:
				var r = hl;
				hl = gf(e.stateNode.containerInfo), kl(e, t, n), hl = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Ol, Ol = 16777216, kl(e, t, n), Ol = r) : kl(e, t, n));
				break;
			default: kl(e, t, n);
		}
	}
	function jl(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Ml(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				nl = r, Fl(r, e);
			}
			jl(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Nl(e), e = e.sibling;
	}
	function Nl(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Ml(e), e.flags & 2048 && Bc(9, e, e.return);
				break;
			case 3:
				Ml(e);
				break;
			case 12:
				Ml(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Pl(e)) : Ml(e);
				break;
			default: Ml(e);
		}
	}
	function Pl(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				nl = r, Fl(r, e);
			}
			jl(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Bc(8, t, t.return), Pl(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Pl(t));
					break;
				default: Pl(t);
			}
			e = e.sibling;
		}
	}
	function Fl(e, t) {
		for (; nl !== null;) {
			var n = nl;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					Bc(8, n, t);
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
			if (r = n.child, r !== null) r.return = n, nl = r;
			else a: for (n = e; nl !== null;) {
				r = nl;
				var i = r.sibling, a = r.return;
				if (al(r), r === n) {
					nl = null;
					break a;
				}
				if (i !== null) {
					i.return = a, nl = i;
					break a;
				}
				nl = a;
			}
		}
	}
	var Il = {
		getCacheForType: function(e) {
			var t = Xi(G), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return Xi(G).controller.signal;
		}
	}, Ll = typeof WeakMap == "function" ? WeakMap : Map, q = 0, Rl = null, J = null, Y = 0, zl = 0, Bl = null, Vl = !1, Hl = !1, Ul = !1, X = 0, Z = 0, Wl = 0, Gl = 0, Kl = 0, ql = 0, Jl = 0, Yl = null, Xl = null, Zl = !1, Ql = 0, $l = 0, eu = Infinity, tu = null, nu = null, ru = 0, iu = null, au = null, ou = 0, su = 0, cu = null, lu = null, uu = 0, du = null;
	function fu() {
		return q & 2 && Y !== 0 ? Y & -Y : N.T === null ? $e() : ud();
	}
	function pu() {
		if (ql === 0) if (!(Y & 536870912) || W) {
			var e = Re;
			Re <<= 1, !(Re & 3932160) && (Re = 262144), ql = e;
		} else ql = 536870912;
		return e = Za.current, e !== null && (e.flags |= 32), ql;
	}
	function mu(e, t, n) {
		(e === Rl && (zl === 2 || zl === 9) || e.cancelPendingCommit !== null) && (xu(e, 0), vu(e, Y, ql, !1)), Ke(e, n), (!(q & 2) || e !== Rl) && (e === Rl && (!(q & 2) && (Gl |= n), Z === 4 && vu(e, Y, ql, !1)), nd(e));
	}
	function hu(e, t, n) {
		if (q & 6) throw Error(s(327));
		var r = !n && (t & 127) == 0 && (t & e.expiredLanes) === 0 || He(e, t), i = r ? ku(e, t) : Du(e, t, !0), a = r;
		do {
			if (i === 0) {
				Hl && !r && vu(e, t, 0, !1);
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
								if (Ul && !l) {
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
							vu(r, t, ql, !Vl);
							break a;
						case 2:
							Xl = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(s(329));
					}
					if ((t & 62914560) === t && (i = Ql + 300 - Ce(), 10 < i)) {
						if (vu(r, t, ql, !Vl), Ve(r, 0, !0) !== 0) break a;
						ou = t, r.timeoutHandle = Kd(gu.bind(null, r, n, Xl, tu, Zl, t, ql, Gl, Jl, Vl, a, "Throttled", -0, 0), i);
						break a;
					}
					gu(r, n, Xl, tu, Zl, t, ql, Gl, Jl, Vl, a, null, -0, 0);
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
				unsuspend: Yt
			}, Al(t, a, d);
			var m = (a & 62914560) === a ? Ql - Ce() : (a & 4194048) === a ? $l - Ce() : 0;
			if (m = qf(d, m), m !== null) {
				ou = a, e.cancelPendingCommit = m(Q.bind(null, e, t, a, n, r, i, o, s, c, u, d, null, f, p)), vu(e, a, o, !l);
				return;
			}
		}
		Q(e, t, a, n, r, i, o, s, c);
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
			var a = 31 - Pe(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && Je(e, n, t);
	}
	function yu() {
		return q & 6 ? !0 : (rd(0, !1), !1);
	}
	function bu() {
		if (J !== null) {
			if (zl === 0) var e = J.return;
			else e = J, Hi = Vi = null, To(e), Ea = null, Da = 0, e = J;
			for (; e !== null;) Rc(e.alternate, e), e = e.return;
			J = null;
		}
	}
	function xu(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, qd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), ou = 0, bu(), Rl = e, J = n = ai(e.current, null), Y = t, zl = 0, Bl = null, Vl = !1, Hl = He(e, t), Ul = !1, Jl = ql = Kl = Gl = Wl = Z = 0, Xl = Yl = null, Zl = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - Pe(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return X = t, Yr(), n;
	}
	function Su(e, t) {
		K = null, N.H = Fs, t === ga || t === va ? (t = wa(), zl = 3) : t === _a ? (t = wa(), zl = 4) : zl = t === $s ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Bl = t, J === null && (Z = 1, qs(e, pi(t, e.current)));
	}
	function Cu() {
		var e = Za.current;
		return e === null ? !0 : (Y & 4194048) === Y ? Qa === null : (Y & 62914560) === Y || Y & 536870912 ? e === Qa : !1;
	}
	function wu() {
		var e = N.H;
		return N.H = Fs, e === null ? Fs : e;
	}
	function Tu() {
		var e = N.A;
		return N.A = Il, e;
	}
	function Eu() {
		Z = 4, Vl || (Y & 4194048) !== Y && Za.current !== null || (Hl = !0), !(Wl & 134217727) && !(Gl & 134217727) || Rl === null || vu(Rl, Y, ql, !1);
	}
	function Du(e, t, n) {
		var r = q;
		q |= 2;
		var i = wu(), a = Tu();
		(Rl !== e || Y !== t) && (tu = null, xu(e, t)), t = !1;
		var o = Z;
		a: do
			try {
				if (zl !== 0 && J !== null) {
					var s = J, c = Bl;
					switch (zl) {
						case 8:
							bu(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							Za.current === null && (t = !0);
							var l = zl;
							if (zl = 0, Bl = null, Nu(e, s, c, l), n && Hl) {
								o = 0;
								break a;
							}
							break;
						default: l = zl, zl = 0, Bl = null, Nu(e, s, c, l);
					}
				}
				Ou(), o = Z;
				break;
			} catch (t) {
				Su(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, Hi = Vi = null, q = r, N.H = i, N.A = a, J === null && (Rl = null, Y = 0, Yr()), o;
	}
	function Ou() {
		for (; J !== null;) ju(J);
	}
	function ku(e, t) {
		var n = q;
		q |= 2;
		var r = wu(), i = Tu();
		Rl !== e || Y !== t ? (tu = null, eu = Ce() + 500, xu(e, t)) : Hl = He(e, t);
		a: do
			try {
				if (zl !== 0 && J !== null) {
					t = J;
					var a = Bl;
					b: switch (zl) {
						case 1:
							zl = 0, Bl = null, Nu(e, t, a, 1);
							break;
						case 2:
						case 9:
							if (ba(a)) {
								zl = 0, Bl = null, Mu(t);
								break;
							}
							t = function() {
								zl !== 2 && zl !== 9 || Rl !== e || (zl = 7), nd(e);
							}, a.then(t, t);
							break a;
						case 3:
							zl = 7;
							break a;
						case 4:
							zl = 5;
							break a;
						case 7:
							ba(a) ? (zl = 0, Bl = null, Mu(t)) : (zl = 0, Bl = null, Nu(e, t, a, 7));
							break;
						case 5:
							var o = null;
							switch (J.tag) {
								case 26: o = J.memoizedState;
								case 5:
								case 27:
									var c = J;
									if (o ? Wf(o) : c.stateNode.complete) {
										zl = 0, Bl = null;
										var l = c.sibling;
										if (l !== null) J = l;
										else {
											var u = c.return;
											u === null ? J = null : (J = u, Pu(u));
										}
										break b;
									}
							}
							zl = 0, Bl = null, Nu(e, t, a, 5);
							break;
						case 6:
							zl = 0, Bl = null, Nu(e, t, a, 6);
							break;
						case 8:
							bu(), Z = 6;
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
		return Hi = Vi = null, N.H = r, N.A = i, q = n, J === null ? (Rl = null, Y = 0, Yr(), Z) : 0;
	}
	function Au() {
		for (; J !== null && !xe();) ju(J);
	}
	function ju(e) {
		var t = kc(e.alternate, e, X);
		e.memoizedProps = e.pendingProps, t === null ? Pu(e) : J = t;
	}
	function Mu(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = pc(n, t, t.pendingProps, t.type, void 0, Y);
				break;
			case 11:
				t = pc(n, t, t.pendingProps, t.type.render, t.ref, Y);
				break;
			case 5: To(t);
			default: Rc(n, t), t = J = oi(t, X), t = kc(n, t, X);
		}
		e.memoizedProps = e.pendingProps, t === null ? Pu(e) : J = t;
	}
	function Nu(e, t, n, r) {
		Hi = Vi = null, To(t), Ea = null, Da = 0;
		var i = t.return;
		try {
			if (Qs(e, i, t, n, Y)) {
				Z = 1, qs(e, pi(n, e.current)), J = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw J = i, t;
			Z = 1, qs(e, pi(n, e.current)), J = null;
			return;
		}
		t.flags & 32768 ? (W || r === 1 ? e = !0 : Hl || Y & 536870912 ? e = !1 : (Vl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = Za.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Fu(t, e)) : Pu(t);
	}
	function Pu(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				Fu(t, Vl);
				return;
			}
			e = t.return;
			var n = Ic(t.alternate, t, X);
			if (n !== null) {
				J = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				J = t;
				return;
			}
			J = t = e;
		} while (t !== null);
		Z === 0 && (Z = 5);
	}
	function Fu(e, t) {
		do {
			var n = Lc(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, J = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				J = e;
				return;
			}
			J = e = n;
		} while (e !== null);
		Z = 6, J = null;
	}
	function Q(e, t, n, r, i, a, o, c, l) {
		e.cancelPendingCommit = null;
		do
			Bu();
		while (ru !== 0);
		if (q & 6) throw Error(s(327));
		if (t !== null) {
			if (t === e.current) throw Error(s(177));
			if (a = t.lanes | t.childLanes, a |= Jr, qe(e, n, a, o, c, l), e === Rl && (J = Rl = null, Y = 0), au = t, iu = e, ou = n, su = a, cu = i, lu = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Yu(De, function() {
				return Vu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = (t.flags & 13878) != 0, t.subtreeFlags & 13878 || r) {
				r = N.T, N.T = null, i = P.p, P.p = 2, o = q, q |= 4;
				try {
					rl(e, t, n);
				} finally {
					q = o, P.p = i, N.T = r;
				}
			}
			ru = 1, Iu(), Lu(), Ru();
		}
	}
	function Iu() {
		if (ru === 1) {
			ru = 0;
			var e = iu, t = au, n = (t.flags & 13878) != 0;
			if (t.subtreeFlags & 13878 || n) {
				n = N.T, N.T = null;
				var r = P.p;
				P.p = 2;
				var i = q;
				q |= 4;
				try {
					gl(t, e);
					var a = zd, o = Sr(e.containerInfo), s = a.focusedElem, c = a.selectionRange;
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
					sp = !!Rd, zd = Rd = null;
				} finally {
					q = i, P.p = r, N.T = n;
				}
			}
			e.current = t, ru = 2;
		}
	}
	function Lu() {
		if (ru === 2) {
			ru = 0;
			var e = iu, t = au, n = (t.flags & 8772) != 0;
			if (t.subtreeFlags & 8772 || n) {
				n = N.T, N.T = null;
				var r = P.p;
				P.p = 2;
				var i = q;
				q |= 4;
				try {
					il(e, t.alternate, t);
				} finally {
					q = i, P.p = r, N.T = n;
				}
			}
			ru = 3;
		}
	}
	function Ru() {
		if (ru === 4 || ru === 3) {
			ru = 0, Se();
			var e = iu, t = au, n = ou, r = lu;
			t.subtreeFlags & 10256 || t.flags & 10256 ? ru = 5 : (ru = 0, au = iu = null, zu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (nu = null), Qe(n), t = t.stateNode, V && typeof V.onCommitFiberRoot == "function") try {
				V.onCommitFiberRoot(Me, t, void 0, (t.current.flags & 128) == 128);
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
			ou & 3 && Bu(), nd(e), i = e.pendingLanes, n & 261930 && i & 42 ? e === du ? uu++ : (uu = 0, du = e) : uu = 0, rd(0, !1);
		}
	}
	function zu(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, ra(t)));
	}
	function Bu() {
		return Iu(), Lu(), Ru(), Vu();
	}
	function Vu() {
		if (ru !== 5) return !1;
		var e = iu, t = su;
		su = 0;
		var n = Qe(ou), r = N.T, i = P.p;
		try {
			P.p = 32 > n ? 32 : n, N.T = null, n = cu, cu = null;
			var a = iu, o = ou;
			if (ru = 0, au = iu = null, ou = 0, q & 6) throw Error(s(331));
			var c = q;
			if (q |= 4, Nl(a.current), Tl(a, a.current, o, n), q = c, rd(0, !1), V && typeof V.onPostCommitFiberRoot == "function") try {
				V.onPostCommitFiberRoot(Me, a);
			} catch {}
			return !0;
		} finally {
			P.p = i, N.T = r, zu(e, t);
		}
	}
	function Hu(e, t, n) {
		t = pi(n, t), t = Ys(e.stateNode, t, 2), e = Ra(e, t, 2), e !== null && (Ke(e, 2), nd(e));
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
					e = pi(n, e), n = Xs(2), r = Ra(t, n, 2), r !== null && (Zs(n, r, t, e), Ke(r, 2), nd(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function Wu(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new Ll();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (Ul = !0, i.add(n), e = Gu.bind(null, e, t, n), t.then(e, e));
	}
	function Gu(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, Rl === e && (Y & n) === n && (Z === 4 || Z === 3 && (Y & 62914560) === Y && 300 > Ce() - Ql ? !(q & 2) && xu(e, 0) : Kl |= n, Jl === Y && (Jl = 0)), nd(e);
	}
	function Ku(e, t) {
		t === 0 && (t = We()), e = Qr(e, t), e !== null && (Ke(e, t), nd(e));
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
		return ye(e, t);
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
							a = (1 << 31 - Pe(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
						}
						a !== 0 && (n = !0, cd(r, a));
					} else a = Y, a = Ve(r, r === Rl ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || He(r, a) || (n = !0, cd(r, a));
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
		for (var t = Ce(), n = null, r = Xu; r !== null;) {
			var i = r.next, a = od(r, t);
			a === 0 ? (r.next = null, n === null ? Xu = i : n.next = i, i === null && (Zu = n)) : (n = r, (e !== 0 || a & 3) && ($u = !0)), r = i;
		}
		ru !== 0 && ru !== 5 || rd(e, !1), td !== 0 && (td = 0);
	}
	function od(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - Pe(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = Ue(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = Rl, n = Y, n = Ve(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (zl === 2 || zl === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && be(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || He(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && be(r), Qe(n)) {
				case 2:
				case 8:
					n = Ee;
					break;
				case 32:
					n = De;
					break;
				case 268435456:
					n = ke;
					break;
				default: n = De;
			}
			return r = sd.bind(null, e), n = ye(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && be(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function sd(e, t) {
		if (ru !== 0 && ru !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Bu() && e.callbackNode !== n) return null;
		var r = Y;
		return r = Ve(e, e === Rl ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (hu(e, r, t), od(e, Ce()), e.callbackNode != null && e.callbackNode === n ? sd.bind(null, e) : null);
	}
	function cd(e, t) {
		if (Bu()) return null;
		hu(e, t, !0);
	}
	function ld() {
		Yd(function() {
			q & 6 ? ye(Te, id) : ad();
		});
	}
	function ud() {
		if (td === 0) {
			var e = oa;
			e === 0 && (e = Le, Le <<= 1, !(Le & 261888) && (Le = 256)), td = e;
		}
		return td;
	}
	function dd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Jt("" + e);
	}
	function fd(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function pd(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = dd((i[rt] || null).action), o = r.submitter;
			o && (t = (t = o[rt] || null) ? dd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new _n("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (td !== 0) {
								var e = o ? fd(i, o) : new FormData(i);
								xs(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = o ? fd(i, o) : new FormData(i), xs(n, {
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
	for (var md = 0; md < Ur.length; md++) {
		var hd = Ur[md];
		Wr(hd.toLowerCase(), "on" + (hd[0].toUpperCase() + hd.slice(1)));
	}
	Wr(Fr, "onAnimationEnd"), Wr(Ir, "onAnimationIteration"), Wr(Lr, "onAnimationStart"), Wr("dblclick", "onDoubleClick"), Wr("focusin", "onFocus"), Wr("focusout", "onBlur"), Wr(Rr, "onTransitionRun"), Wr(zr, "onTransitionStart"), Wr(Br, "onTransitionCancel"), Wr(Vr, "onTransitionEnd"), yt("onMouseEnter", ["mouseout", "mouseover"]), yt("onMouseLeave", ["mouseout", "mouseover"]), yt("onPointerEnter", ["pointerout", "pointerover"]), yt("onPointerLeave", ["pointerout", "pointerover"]), vt("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), vt("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), vt("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), vt("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), vt("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), vt("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
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
	function $(e, t) {
		var n = t[at];
		n === void 0 && (n = t[at] = /* @__PURE__ */ new Set());
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
			e[bd] = !0, gt.forEach(function(t) {
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
		n = i.bind(null, t, n, e), i = void 0, !on || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
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
					if (o = dt(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6 || c === 26 || c === 27) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		nn(function() {
			var r = a, i = Zt(n), o = [];
			a: {
				var s = Hr.get(e);
				if (s !== void 0) {
					var c = _n, u = e;
					switch (e) {
						case "keypress": if (fn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = Pn;
							break;
						case "focusin":
							u = "focus", c = En;
							break;
						case "focusout":
							u = "blur", c = En;
							break;
						case "beforeblur":
						case "afterblur":
							c = En;
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
							c = wn;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = Tn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = In;
							break;
						case Fr:
						case Ir:
						case Lr:
							c = Dn;
							break;
						case Vr:
							c = Ln;
							break;
						case "scroll":
						case "scrollend":
							c = yn;
							break;
						case "wheel":
							c = Rn;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = On;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							c = Fn;
							break;
						case "toggle":
						case "beforetoggle": c = zn;
					}
					var d = (t & 4) != 0, f = !d && (e === "scroll" || e === "scrollend"), p = d ? s === null ? null : s + "Capture" : s;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = rn(m, p), g != null && d.push(wd(m, g, h))), f) break;
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
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== Xt && (u = n.relatedTarget || n.fromElement) && (dt(u) || u[it])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (u = n.relatedTarget || n.toElement, c = r, u = u ? dt(u) : null, u !== null && (f = l(u), d = u.tag, u !== f || d !== 5 && d !== 27 && d !== 6) && (u = null)) : (c = null, u = r), c !== u)) {
						if (d = wn, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = Fn, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? s : pt(c), h = u == null ? s : pt(u), s = new d(g, m + "leave", c, n, i), s.target = f, s.relatedTarget = h, g = null, dt(i) === r && (d = new d(p, m + "enter", u, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, c && u) b: {
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
					if (s = r ? pt(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var v = ar;
					else if ($n(s)) if (or) v = hr;
					else {
						v = pr;
						var y = fr;
					}
					else c = s.nodeName, !c || c.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? r && Gt(r.elementType) && (v = ar) : v = mr;
					if (v &&= v(e, r)) {
						er(o, v, n, i);
						break a;
					}
					y && y(e, s, r), e === "focusout" && r && s.type === "number" && r.memoizedProps.value != null && Lt(s, "number", s.value);
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
						Or = !1, kr(o, n, i);
						break;
					case "selectionchange": if (wr) break;
					case "keydown":
					case "keyup": kr(o, n, i);
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
				x && (Wn && n.locale !== "ko" && (Yn || x !== "onCompositionStart" ? x === "onCompositionEnd" && Yn && (b = dn()) : (cn = i, ln = "value" in cn ? cn.value : cn.textContent, Yn = !0)), y = Td(r, x), 0 < y.length && (x = new kn(x, e, null, n, i), o.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = Jn(n), b !== null && (x.data = b)))), (b = Un ? Xn(e, n) : Zn(e, n)) && (x = Td(r, "onBeforeInput"), 0 < x.length && (y = new kn("onBeforeInput", "beforeinput", null, n, i), o.push({
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
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = rn(e, n), i != null && r.unshift(wd(e, i, a)), i = rn(e, t), i != null && r.push(wd(e, i, a))), e.tag === 3) return r;
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
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = rn(n, a), l != null && o.unshift(wd(n, l, c))) : i || (l = rn(n, a), l != null && o.push(wd(n, l, c)))), n = n.return;
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
				Wt(e, r, a);
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
				} else typeof a == "function" && (n === "formAction" ? (t !== "input" && Md(e, t, "name", i.name, i, null), Md(e, t, "formEncType", i.formEncType, i, null), Md(e, t, "formMethod", i.formMethod, i, null), Md(e, t, "formTarget", i.formTarget, i, null)) : (Md(e, t, "encType", i.encType, i, null), Md(e, t, "method", i.method, i, null), Md(e, t, "target", i.target, i, null)));
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
				$("beforetoggle", e), $("toggle", e), wt(e, "popover", r);
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
	function Nd(e, t, n, r, i, a) {
		switch (n) {
			case "style":
				Wt(e, r, a);
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
				typeof r == "string" ? Vt(e, r) : (typeof r == "number" || typeof r == "bigint") && Vt(e, "" + r);
				break;
			case "onScroll":
				r != null && $("scroll", e);
				break;
			case "onScrollEnd":
				r != null && $("scrollend", e);
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
				if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), a = e[rt] || null, a = a == null ? null : a[n], typeof a == "function" && e.removeEventListener(t, a, i), typeof r == "function")) {
					typeof a != "function" && a !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, i);
					break a;
				}
				n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : wt(e, n, r);
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
				It(e, a, c, l, u, o, i, !1);
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
				t = a, n = o, e.multiple = !!r, t == null ? n != null && Rt(e, !!r, n, !0) : Rt(e, !!r, t, !1);
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
				Bt(e, r, i, a);
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
			default: if (Gt(t)) {
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
				Ft(e, o, c, l, u, d, a, i);
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
				t = c, n = o, r = m, p == null ? !!r != !!n && (t == null ? Rt(e, !!n, n ? [] : "", !1) : Rt(e, !!n, t, !0)) : Rt(e, !!n, p, !1);
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
				zt(e, p, m);
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
			default: if (Gt(t)) {
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
					a[lt] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
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
					ef(n), ut(n);
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
		ut(e);
	}
	var mf = /* @__PURE__ */ new Map(), hf = /* @__PURE__ */ new Set();
	function gf(e) {
		return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
	}
	var _f = P.d;
	P.d = {
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
		var t = ft(e);
		t !== null && t.tag === 5 && t.type === "form" ? Cs(t) : _f.r(e);
	}
	var bf = typeof document > "u" ? null : document;
	function xf(e, t, n) {
		var r = bf;
		if (r && typeof t == "string" && t) {
			var i = Pt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), hf.has(i) || (hf.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), Pd(t, "link", e), ht(t), r.head.appendChild(t)));
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
			var i = "link[rel=\"preload\"][as=\"" + Pt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + Pt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + Pt(n.imageSizes) + "\"]")) : i += "[href=\"" + Pt(e) + "\"]";
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
			}, n), mf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(jf(a)) || t === "script" && r.querySelector(Ff(a)) || (t = r.createElement("link"), Pd(t, "link", e), ht(t), r.head.appendChild(t)));
		}
	}
	function Tf(e, t) {
		_f.m(e, t);
		var n = bf;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + Pt(r) + "\"][href=\"" + Pt(e) + "\"]", a = i;
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
				r = n.createElement("link"), Pd(r, "link", e), ht(r), n.head.appendChild(r);
			}
		}
	}
	function Ef(e, t, n) {
		_f.S(e, t, n);
		var r = bf;
		if (r && e) {
			var i = mt(r).hoistableStyles, a = Af(e);
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
					ht(c), Pd(c, "link", e), c._p = new Promise(function(e, t) {
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
			var r = mt(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
				src: e,
				async: !0
			}, t), (t = mf.get(i)) && zf(e, t), a = n.createElement("script"), ht(a), Pd(a, "link", e), n.head.appendChild(a)), a = {
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
			var r = mt(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = mf.get(i)) && zf(e, t), a = n.createElement("script"), ht(a), Pd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function kf(e, t, n, r) {
		var i = (i = se.current) ? gf(i) : null;
		if (!i) throw Error(s(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = Af(n.href), n = mt(i).hoistableStyles, r = n.get(t), r || (r = {
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
					var a = mt(i).hoistableStyles, o = a.get(e);
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
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Pf(n), n = mt(i).hoistableScripts, r = n.get(t), r || (r = {
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
		return "href=\"" + Pt(e) + "\"";
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
		}), Pd(t, "link", n), ht(t), e.head.appendChild(t));
	}
	function Pf(e) {
		return "[src=\"" + Pt(e) + "\"]";
	}
	function Ff(e) {
		return "script[async]" + e;
	}
	function If(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + Pt(n.href) + "\"]");
				if (r) return t.instance = r, ht(r), r;
				var i = h({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), ht(r), Pd(r, "style", i), Lf(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = Af(n.href);
				var a = e.querySelector(jf(i));
				if (a) return t.state.loading |= 4, t.instance = a, ht(a), a;
				r = Mf(n), (i = mf.get(i)) && Rf(r, i), a = (e.ownerDocument || e).createElement("link"), ht(a);
				var o = a;
				return o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Pd(a, "link", r), t.state.loading |= 4, Lf(a, n.precedence, e), t.instance = a;
			case "script": return a = Pf(n.src), (i = e.querySelector(Ff(a))) ? (t.instance = i, ht(i), i) : (r = n, (i = mf.get(a)) && (r = h({}, n), zf(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), ht(i), Pd(i, "link", r), e.head.appendChild(i), t.instance = i);
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
			if (!(a[lt] || a[nt] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
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
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Jf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, ht(a);
					return;
				}
				a = t.ownerDocument || t, r = Mf(r), (i = mf.get(i)) && Rf(r, i), a = a.createElement("link"), ht(a);
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
		_currentValue: re,
		_currentValue2: re,
		_threadCount: 0
	};
	function $f(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Ge(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ge(0), this.hiddenUpdates = Ge(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function ep(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new $f(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = ri(3, null, null, t), e.current = a, a.stateNode = e, t = na(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, Fa(a), e;
	}
	function tp(e) {
		return e ? (e = ti, e) : ti;
	}
	function np(e, t, n, r, i, a) {
		i = tp(i), r.context === null ? r.context = i : r.pendingContext = i, r = La(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = Ra(e, r, t), n !== null && (mu(n, e, t), za(n, e, t));
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
			var t = Qr(e, 67108864);
			t !== null && mu(t, e, 67108864), ip(e, 67108864);
		}
	}
	function op(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = fu();
			t = Ze(t);
			var n = Qr(e, t);
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
			if (i === null) Cd(e, t, r, fp, n), Cp(e, r);
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
										var c = 1 << 31 - Pe(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									nd(a), !(q & 6) && (eu = Ce() + 500, rd(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = Qr(a, 2), s !== null && mu(s, a, 2), yu(), ip(a, 2);
					}
					if (a = dp(r), a === null && Cd(e, t, r, fp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else Cd(e, t, r, null, n);
		}
	}
	function dp(e) {
		return e = Zt(e), pp(e);
	}
	var fp = null;
	function pp(e) {
		if (fp = null, e = dt(e), e !== null) {
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
			case "message": switch (we()) {
				case Te: return 2;
				case Ee: return 8;
				case De:
				case Oe: return 32;
				case ke: return 268435456;
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
		}, t !== null && (t = ft(t), t !== null && ap(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
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
				Xt = r, n.target.dispatchEvent(r), Xt = null;
			} else return t = ft(n), t !== null && ap(t), e.blockedOn = n, !1;
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
				a !== null && (e.splice(t, 3), t -= 3, xs(a, {
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
		if (t === null) throw Error(s(409));
		var n = t.current;
		np(n, fu(), e, t, null, null);
	}, Ip.prototype.unmount = Fp.prototype.unmount = function() {
		var e = this._internalRoot;
		if (e !== null) {
			this._internalRoot = null;
			var t = e.containerInfo;
			np(e.current, 2, null, e, null, null), yu(), t[it] = null;
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
			Me = zp.inject(Rp), V = zp;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!c(e)) throw Error(s(299));
		var n = !1, r = "", i = Ws, a = Gs, o = Ks;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = ep(e, 1, !1, null, null, n, r, null, i, a, o, Pp), e[it] = t.current, xd(e), new Fp(t);
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
	let O = m(e.suit), k = d[e.suit], ee = b ?? `${e.rank} of ${f[e.suit]}`, te = `pcard--suit-${e.suit}`, A = /* @__PURE__ */ (0, C.jsxs)("span", {
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
		className: `${D} ${O ? "pcard--red" : "pcard--black"} ${te}`,
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
		"aria-label": ee,
		"data-testid": x,
		"data-card-index": S,
		"data-playable": w,
		...c,
		children: A
	}) : /* @__PURE__ */ (0, C.jsx)("div", {
		className: `${D} ${O ? "pcard--red" : "pcard--black"} ${te}`,
		role: "img",
		"aria-label": ee,
		"aria-disabled": y || void 0,
		"data-testid": x,
		"data-card-index": S,
		"data-playable": w,
		children: A
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
function ee(e, t, n, r) {
	let i = r?.minVisiblePx ?? 30, a = r?.maxGapPx ?? 6, o = Math.max(0, t), s = Math.max(0, e), c = Math.max(1, n);
	if (o <= 1 || s <= 0) return 0;
	let l = Math.max(8, c - i), u = c + a, d = (s - c) / (o - 1);
	return Math.round(Math.min(u, Math.max(l, d)) - c);
}
function te(e) {
	return e === "lg" ? 96 : e === "md" ? 72 : 52;
}
//#endregion
//#region src/components/Hand.tsx
var A = (e) => E(e);
function ne({ card: e, index: t, size: n, state: r, badge: i, cardTestId: a, cardInteraction: o, onCardClick: s, onCardPeek: c, peekActive: u, slotClassFor: d, dealSeatPlayerId: f, style: p }) {
	let [m, h] = (0, l.useState)(!1), g = o, _ = g?.mode === "play", v = g?.mode === "draw-select", y = g?.mode === "peek", b = g?.isMyTurn === !0, x = !g?.legalPlayIndices || g.legalPlayIndices.includes(t), S = _ && b && x && !g?.busy, E = _ && !b && !!g?.allowPlayPreselect && x && !g?.busy, D = g?.playingIndex === t, O = _ && b && !x && !g?.busy && !D, k = v && r === "draw-selected", ee = v && r === "draw-recommended", te = r === "play-recommended", A = !!g?.busy || D || _ && !b && !E || v && !b, ne = A || _ && !x && !E || v && !b, { handlers: j, suppressNextClickRef: M } = T({
		disabled: A || !S && !E && !v && !y && !O,
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
			ee ? "hand__slot--draw-recommended" : "",
			te ? "hand__slot--play-recommended" : "",
			d?.(e, t) ?? ""
		].filter(Boolean).join(" "),
		style: p,
		"aria-selected": k || ee ? !0 : void 0,
		"data-draw-hint": ee ? "suggested" : k ? "selected" : void 0,
		"data-trick-play-origin-active": g?.playingIndex === t && g.trickPlayOriginPlayerId ? g.trickPlayOriginPlayerId : void 0,
		"data-deal-seat": f ?? void 0,
		"data-deal-round": f == null ? void 0 : t,
		children: /* @__PURE__ */ (0, C.jsx)(w, {
			card: e,
			size: n,
			state: ne && _ && !O ? "disabled" : r,
			badge: i,
			onClick: !N && s ? () => s(e, t) : void 0,
			onPlayClick: N && (S || E) ? () => g?.onPlayCard?.(t) : void 0,
			suppressNextClickRef: N ? M : void 0,
			pointerHandlers: N ? j : void 0,
			pressed: m,
			playing: D,
			playable: S,
			illegalShake: g?.illegalShakeIndex === t,
			illegalFlash: g?.illegalFlashIndex === t,
			showPlayableHint: g?.showPlayableHint !== !1,
			disabled: A && (_ || v) && !O,
			"data-testid": P,
			"data-card-index": t,
			"data-playable": _ ? S ? "true" : "false" : void 0
		})
	});
}
function j({ cards: e, size: t = "md", stateFor: n, badgeFor: r, onCardClick: i, onCardPeek: a, peekIndex: o = null, fan: s = !1, cardTestId: c, cardInteraction: u, slotClassFor: d, dealSeatPlayerId: f = null }) {
	let p = (0, l.useRef)(null);
	return (0, l.useLayoutEffect)(() => {
		if (!s || typeof window > "u") return;
		let n = p.current;
		if (!n) return;
		let r = te(t), i = () => {
			let t = ee(n.clientWidth, e.length, r);
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
			children: e.map((e, l) => /* @__PURE__ */ (0, C.jsx)(ne, {
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
			}, A(e)))
		})
	});
}
//#endregion
//#region src/table/animations/motionTokens.ts
var M = "power3.out", N = "power2.inOut", P = "back.out(1.35)", re = {
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
var ae = {
	autoSleep: 120,
	force3D: "auto",
	nullTargetWarn: 1,
	units: { lineHeight: "" }
}, oe = {
	duration: .5,
	overwrite: !1,
	delay: 0
}, se, ce, z, le = 1e8, B = 1 / le, ue = Math.PI * 2, de = ue / 4, fe = 0, pe = Math.sqrt, me = Math.cos, he = Math.sin, ge = function(e) {
	return typeof e == "string";
}, _e = function(e) {
	return typeof e == "function";
}, ve = function(e) {
	return typeof e == "number";
}, ye = function(e) {
	return e === void 0;
}, be = function(e) {
	return typeof e == "object";
}, xe = function(e) {
	return e !== !1;
}, Se = function() {
	return typeof window < "u";
}, Ce = function(e) {
	return _e(e) || ge(e);
}, we = typeof ArrayBuffer == "function" && ArrayBuffer.isView || function() {}, Te = Array.isArray, Ee = /(?:-?\.?\d|\.)+/gi, De = /[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g, Oe = /[-+=.]*\d+[.e-]*\d*[a-z%]*/g, ke = /[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi, Ae = /[+-]=-?[.\d]+/, je = /[^,'"\[\]\s]+/gi, Me = /^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i, V, Ne, Pe, Fe, H = {}, Ie = {}, Le, Re = function(e) {
	return (Ie = ht(e, H)) && Fr;
}, ze = function(e, t) {
	return console.warn("Invalid property", e, "set to", t, "Missing plugin? gsap.registerPlugin()");
}, Be = function(e, t) {
	return !t && console.warn(e);
}, Ve = function(e, t) {
	return e && (H[e] = t) && Ie && (Ie[e] = t) || H;
}, He = function() {
	return 0;
}, Ue = {
	suppressEvents: !0,
	isStart: !0,
	kill: !1
}, We = {
	suppressEvents: !0,
	kill: !1
}, Ge = { suppressEvents: !0 }, Ke = {}, qe = [], Je = {}, Ye, Xe = {}, Ze = {}, Qe = 30, $e = [], et = "", tt = function(e) {
	var t = e[0], n, r;
	if (be(t) || _e(t) || (e = [e]), !(n = (t._gsap || {}).harness)) {
		for (r = $e.length; r-- && !$e[r].targetTest(t););
		n = $e[r];
	}
	for (r = e.length; r--;) e[r] && (e[r]._gsap || (e[r]._gsap = new Gn(e[r], n))) || e.splice(r, 1);
	return e;
}, nt = function(e) {
	return e._gsap || tt(Qt(e))[0]._gsap;
}, rt = function(e, t, n) {
	return (n = e[t]) && _e(n) ? e[t]() : ye(n) && e.getAttribute && e.getAttribute(t) || n;
}, it = function(e, t) {
	return (e = e.split(",")).forEach(t) || e;
}, at = function(e) {
	return Math.round(e * 1e5) / 1e5 || 0;
}, ot = function(e) {
	return Math.round(e * 1e7) / 1e7 || 0;
}, st = function(e, t) {
	var n = t.charAt(0), r = parseFloat(t.substr(2));
	return e = parseFloat(e), n === "+" ? e + r : n === "-" ? e - r : n === "*" ? e * r : e / r;
}, ct = function(e, t) {
	for (var n = t.length, r = 0; e.indexOf(t[r]) < 0 && ++r < n;);
	return r < n;
}, lt = function() {
	var e = qe.length, t = qe.slice(0), n, r;
	for (Je = {}, qe.length = 0, n = 0; n < e; n++) r = t[n], r && r._lazy && (r.render(r._lazy[0], r._lazy[1], !0)._lazy = 0);
}, ut = function(e, t, n, r) {
	qe.length && !ce && lt(), e.render(t, n, r || ce && t < 0 && (e._initted || e._startAt)), qe.length && !ce && lt();
}, dt = function(e) {
	var t = parseFloat(e);
	return (t || t === 0) && (e + "").match(je).length < 2 ? t : ge(e) ? e.trim() : e;
}, ft = function(e) {
	return e;
}, pt = function(e, t) {
	for (var n in t) n in e || (e[n] = t[n]);
	return e;
}, mt = function(e) {
	return function(t, n) {
		for (var r in n) r in t || r === "duration" && e || r === "ease" || (t[r] = n[r]);
	};
}, ht = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, gt = function e(t, n) {
	for (var r in n) r !== "__proto__" && r !== "constructor" && r !== "prototype" && (t[r] = be(n[r]) ? e(t[r] || (t[r] = {}), n[r]) : n[r]);
	return t;
}, _t = function(e, t) {
	var n = {}, r;
	for (r in e) r in t || (n[r] = e[r]);
	return n;
}, vt = function(e) {
	var t = e.parent || V, n = e.keyframes ? mt(Te(e.keyframes)) : pt;
	if (xe(e.inherit)) for (; t;) n(e, t.vars.defaults), t = t.parent || t._dp;
	return e;
}, yt = function(e, t) {
	for (var n = e.length, r = n === t.length; r && n-- && e[n] === t[n];);
	return n < 0;
}, bt = function(e, t, n, r, i) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var a = e[r], o;
	if (i) for (o = t[i]; a && a[i] > o;) a = a._prev;
	return a ? (t._next = a._next, a._next = t) : (t._next = e[n], e[n] = t), t._next ? t._next._prev = t : e[r] = t, t._prev = a, t.parent = t._dp = e, t;
}, xt = function(e, t, n, r) {
	n === void 0 && (n = "_first"), r === void 0 && (r = "_last");
	var i = t._prev, a = t._next;
	i ? i._next = a : e[n] === t && (e[n] = a), a ? a._prev = i : e[r] === t && (e[r] = i), t._next = t._prev = t.parent = null;
}, St = function(e, t) {
	e.parent && (!t || e.parent.autoRemoveChildren) && e.parent.remove && e.parent.remove(e), e._act = 0;
}, Ct = function(e, t) {
	if (e && (!t || t._end > e._dur || t._start < 0)) for (var n = e; n;) n._dirty = 1, n = n.parent;
	return e;
}, wt = function(e) {
	for (var t = e.parent; t && t.parent;) t._dirty = 1, t.totalDuration(), t = t.parent;
	return e;
}, Tt = function(e, t, n, r) {
	return e._startAt && (ce ? e._startAt.revert(We) : e.vars.immediateRender && !e.vars.autoRevert || e._startAt.render(t, !0, r));
}, Et = function e(t) {
	return !t || t._ts && e(t.parent);
}, Dt = function(e) {
	return e._repeat ? Ot(e._tTime, e = e.duration() + e._rDelay) * e : 0;
}, Ot = function(e, t) {
	var n = Math.floor(e = ot(e / t));
	return e && n === e ? n - 1 : n;
}, kt = function(e, t) {
	return (e - t._start) * t._ts + (t._ts >= 0 ? 0 : t._dirty ? t.totalDuration() : t._tDur);
}, At = function(e) {
	return e._end = ot(e._start + (e._tDur / Math.abs(e._ts || e._rts || B) || 0));
}, jt = function(e, t) {
	var n = e._dp;
	return n && n.smoothChildTiming && e._ts && (e._start = ot(n._time - (e._ts > 0 ? t / e._ts : ((e._dirty ? e.totalDuration() : e._tDur) - t) / -e._ts)), At(e), n._dirty || Ct(n, e)), e;
}, Mt = function(e, t) {
	var n;
	if ((t._time || !t._dur && t._initted || t._start < e._time && (t._dur || !t.add)) && (n = kt(e.rawTime(), t), (!t._dur || Kt(0, t.totalDuration(), n) - t._tTime > B) && t.render(n, !0)), Ct(e, t)._dp && e._initted && e._time >= e._dur && e._ts) {
		if (e._dur < e.duration()) for (n = e; n._dp;) n.rawTime() >= 0 && n.totalTime(n._tTime), n = n._dp;
		e._zTime = -B;
	}
}, Nt = function(e, t, n, r) {
	return t.parent && St(t), t._start = ot((ve(n) ? n : n || e !== V ? Ut(e, n, t) : e._time) + t._delay), t._end = ot(t._start + (t.totalDuration() / Math.abs(t.timeScale()) || 0)), bt(e, t, "_first", "_last", e._sort ? "_start" : 0), Lt(t) || (e._recent = t), r || Mt(e, t), e._ts < 0 && jt(e, e._tTime), e;
}, Pt = function(e, t) {
	return (H.ScrollTrigger || ze("scrollTrigger", t)) && H.ScrollTrigger.create(t, e);
}, Ft = function(e, t, n, r, i) {
	if (er(e, t, i), !e._initted) return 1;
	if (!n && e._pt && !ce && (e._dur && e.vars.lazy !== !1 || !e._dur && e.vars.lazy) && Ye !== jn.frame) return qe.push(e), e._lazy = [i, r], 1;
}, It = function e(t) {
	var n = t.parent;
	return n && n._ts && n._initted && !n._lock && (n.rawTime() < 0 || e(n));
}, Lt = function(e) {
	var t = e.data;
	return t === "isFromStart" || t === "isStart";
}, Rt = function(e, t, n, r) {
	var i = e.ratio, a = t < 0 || !t && (!e._start && It(e) && !(!e._initted && Lt(e)) || (e._ts < 0 || e._dp._ts < 0) && !Lt(e)) ? 0 : 1, o = e._rDelay, s = 0, c, l, u;
	if (o && e._repeat && (s = Kt(0, e._tDur, t), l = Ot(s, o), e._yoyo && l & 1 && (a = 1 - a), l !== Ot(e._tTime, o) && (i = 1 - a, e.vars.repeatRefresh && e._initted && e.invalidate())), a !== i || ce || r || e._zTime === B || !t && e._zTime) {
		if (!e._initted && Ft(e, t, r, n, s)) return;
		for (u = e._zTime, e._zTime = t || (n ? B : 0), n ||= t && !u, e.ratio = a, e._from && (a = 1 - a), e._time = 0, e._tTime = s, c = e._pt; c;) c.r(a, c.d), c = c._next;
		t < 0 && Tt(e, t, n, !0), e._onUpdate && !n && gn(e, "onUpdate"), s && e._repeat && !n && e.parent && gn(e, "onRepeat"), (t >= e._tDur || t < 0) && e.ratio === a && (a && St(e, 1), !n && !ce && (gn(e, a ? "onComplete" : "onReverseComplete", !0), e._prom && e._prom()));
	} else e._zTime ||= t;
}, zt = function(e, t, n) {
	var r;
	if (n > t) for (r = e._first; r && r._start <= n;) {
		if (r.data === "isPause" && r._start > t) return r;
		r = r._next;
	}
	else for (r = e._last; r && r._start >= n;) {
		if (r.data === "isPause" && r._start < t) return r;
		r = r._prev;
	}
}, Bt = function(e, t, n, r) {
	var i = e._repeat, a = ot(t) || 0, o = e._tTime / e._tDur;
	return o && !r && (e._time *= a / e._dur), e._dur = a, e._tDur = i ? i < 0 ? 1e10 : ot(a * (i + 1) + e._rDelay * i) : a, o > 0 && !r && jt(e, e._tTime = e._tDur * o), e.parent && At(e), n || Ct(e.parent, e), e;
}, Vt = function(e) {
	return e instanceof qn ? Ct(e) : Bt(e, e._dur);
}, Ht = {
	_start: 0,
	endTime: He,
	totalDuration: He
}, Ut = function e(t, n, r) {
	var i = t.labels, a = t._recent || Ht, o = t.duration() >= le ? a.endTime(!1) : t._dur, s, c, l;
	return ge(n) && (isNaN(n) || n in i) ? (c = n.charAt(0), l = n.substr(-1) === "%", s = n.indexOf("="), c === "<" || c === ">" ? (s >= 0 && (n = n.replace(/=/, "")), (c === "<" ? a._start : a.endTime(a._repeat >= 0)) + (parseFloat(n.substr(1)) || 0) * (l ? (s < 0 ? a : r).totalDuration() / 100 : 1)) : s < 0 ? (n in i || (i[n] = o), i[n]) : (c = parseFloat(n.charAt(s - 1) + n.substr(s + 1)), l && r && (c = c / 100 * (Te(r) ? r[0] : r).totalDuration()), s > 1 ? e(t, n.substr(0, s - 1), r) + c : o + c)) : n == null ? o : +n;
}, Wt = function(e, t, n) {
	var r = ve(t[1]), i = (r ? 2 : 1) + (e < 2 ? 0 : 1), a = t[i], o, s;
	if (r && (a.duration = t[1]), a.parent = n, e) {
		for (o = a, s = n; s && !("immediateRender" in o);) o = s.vars.defaults || {}, s = xe(s.vars.inherit) && s.parent;
		a.immediateRender = xe(o.immediateRender), e < 2 ? a.runBackwards = 1 : a.startAt = t[i - 1];
	}
	return new sr(t[0], a, t[i + 1]);
}, Gt = function(e, t) {
	return e || e === 0 ? t(e) : t;
}, Kt = function(e, t, n) {
	return n < e ? e : n > t ? t : n;
}, qt = function(e, t) {
	return !ge(e) || !(t = Me.exec(e)) ? "" : t[1];
}, Jt = function(e, t, n) {
	return Gt(n, function(n) {
		return Kt(e, t, n);
	});
}, Yt = [].slice, Xt = function(e, t) {
	return e && be(e) && "length" in e && (!t && !e.length || e.length - 1 in e && be(e[0])) && !e.nodeType && e !== Ne;
}, Zt = function(e, t, n) {
	return n === void 0 && (n = []), e.forEach(function(e) {
		var r;
		return ge(e) && !t || Xt(e, 1) ? (r = n).push.apply(r, Qt(e)) : n.push(e);
	}) || n;
}, Qt = function(e, t, n) {
	return z && !t && z.selector ? z.selector(e) : ge(e) && !n && (Pe || !Mn()) ? Yt.call((t || Fe).querySelectorAll(e), 0) : Te(e) ? Zt(e, n) : Xt(e) ? Yt.call(e, 0) : e ? [e] : [];
}, $t = function(e) {
	return e = Qt(e)[0] || Be("Invalid scope") || {}, function(t) {
		var n = e.current || e.nativeElement || e;
		return Qt(t, n.querySelectorAll ? n : n === e ? Be("Invalid scope") || Fe.createElement("div") : e);
	};
}, en = function(e) {
	return e.sort(function() {
		return .5 - Math.random();
	});
}, tn = function(e) {
	if (_e(e)) return e;
	var t = be(e) ? e : { each: e }, n = Bn(t.ease), r = t.from || 0, i = parseFloat(t.base) || 0, a = {}, o = r > 0 && r < 1, s = isNaN(r) || o, c = t.axis, l = r, u = r;
	return ge(r) ? l = u = {
		center: .5,
		edges: .5,
		end: 1
	}[r] || 0 : !o && s && (l = r[0], u = r[1]), function(e, o, d) {
		var f = (d || t).length, p = a[f], m, h, g, _, v, y, b, x, S;
		if (!p) {
			if (S = t.grid === "auto" ? 0 : (t.grid || [1, le])[1], !S) {
				for (b = -le; b < (b = d[S++].getBoundingClientRect().left) && S < f;);
				S < f && S--;
			}
			for (p = a[f] = [], m = s ? Math.min(S, f) * l - .5 : r % S, h = S === le ? 0 : s ? f * u / S - .5 : r / S | 0, b = 0, x = le, y = 0; y < f; y++) g = y % S - m, _ = h - (y / S | 0), p[y] = v = c ? Math.abs(c === "y" ? _ : g) : pe(g * g + _ * _), v > b && (b = v), v < x && (x = v);
			r === "random" && en(p), p.max = b - x, p.min = x, p.v = f = (parseFloat(t.amount) || parseFloat(t.each) * (S > f ? f - 1 : c ? c === "y" ? f / S : S : Math.max(S, f / S)) || 0) * (r === "edges" ? -1 : 1), p.b = f < 0 ? i - f : i, p.u = qt(t.amount || t.each) || 0, n = n && f < 0 ? Rn(n) : n;
		}
		return f = (p[e] - p.min) / p.max || 0, ot(p.b + (n ? n(f) : f) * p.v) + p.u;
	};
}, nn = function(e) {
	var t = 10 ** ((e + "").split(".")[1] || "").length;
	return function(n) {
		var r = ot(Math.round(parseFloat(n) / e) * e * t);
		return (r - r % 1) / t + (ve(n) ? 0 : qt(n));
	};
}, rn = function(e, t) {
	var n = Te(e), r, i;
	return !n && be(e) && (r = n = e.radius || le, e.values ? (e = Qt(e.values), (i = !ve(e[0])) && (r *= r)) : e = nn(e.increment)), Gt(t, n ? _e(e) ? function(t) {
		return i = e(t), Math.abs(i - t) <= r ? i : t;
	} : function(t) {
		for (var n = parseFloat(i ? t.x : t), a = parseFloat(i ? t.y : 0), o = le, s = 0, c = e.length, l, u; c--;) i ? (l = e[c].x - n, u = e[c].y - a, l = l * l + u * u) : l = Math.abs(e[c] - n), l < o && (o = l, s = c);
		return s = !r || o <= r ? e[s] : t, i || s === t || ve(t) ? s : s + qt(t);
	} : nn(e));
}, an = function(e, t, n, r) {
	return Gt(Te(e) ? !t : n === !0 ? !!(n = 0) : !r, function() {
		return Te(e) ? e[~~(Math.random() * e.length)] : (n ||= 1e-5) && (r = n < 1 ? 10 ** ((n + "").length - 2) : 1) && Math.floor(Math.round((e - n / 2 + Math.random() * (t - e + n * .99)) / n) * n * r) / r;
	});
}, on = function() {
	var e = [...arguments];
	return function(t) {
		return e.reduce(function(e, t) {
			return t(e);
		}, t);
	};
}, sn = function(e, t) {
	return function(n) {
		return e(parseFloat(n)) + (t || qt(n));
	};
}, cn = function(e, t, n) {
	return pn(e, t, 0, 1, n);
}, ln = function(e, t, n) {
	return Gt(n, function(n) {
		return e[~~t(n)];
	});
}, un = function e(t, n, r) {
	var i = n - t;
	return Te(t) ? ln(t, e(0, t.length), n) : Gt(r, function(e) {
		return (i + (e - t) % i) % i + t;
	});
}, dn = function e(t, n, r) {
	var i = n - t, a = i * 2;
	return Te(t) ? ln(t, e(0, t.length - 1), n) : Gt(r, function(e) {
		return e = (a + (e - t) % a) % a || 0, t + (e > i ? a - e : e);
	});
}, fn = function(e) {
	for (var t = 0, n = "", r, i, a, o; ~(r = e.indexOf("random(", t));) a = e.indexOf(")", r), o = e.charAt(r + 7) === "[", i = e.substr(r + 7, a - r - 7).match(o ? je : Ee), n += e.substr(t, r - t) + an(o ? i : +i[0], o ? 0 : +i[1], +i[2] || 1e-5), t = a + 1;
	return n + e.substr(t, e.length - t);
}, pn = function(e, t, n, r, i) {
	var a = t - e, o = r - n;
	return Gt(i, function(t) {
		return n + ((t - e) / a * o || 0);
	});
}, mn = function e(t, n, r, i) {
	var a = isNaN(t + n) ? 0 : function(e) {
		return (1 - e) * t + e * n;
	};
	if (!a) {
		var o = ge(t), s = {}, c, l, u, d, f;
		if (r === !0 && (i = 1) && (r = null), o) t = { p: t }, n = { p: n };
		else if (Te(t) && !Te(n)) {
			for (u = [], d = t.length, f = d - 2, l = 1; l < d; l++) u.push(e(t[l - 1], t[l]));
			d--, a = function(e) {
				e *= d;
				var t = Math.min(f, ~~e);
				return u[t](e - t);
			}, r = n;
		} else i || (t = ht(Te(t) ? [] : {}, t));
		if (!u) {
			for (c in n) Yn.call(s, t, c, "get", n[c]);
			a = function(e) {
				return gr(e, s) || (o ? t.p : t);
			};
		}
	}
	return Gt(r, a);
}, hn = function(e, t, n) {
	var r = e.labels, i = le, a, o, s;
	for (a in r) o = r[a] - t, o < 0 == !!n && o && i > (o = Math.abs(o)) && (s = a, i = o);
	return s;
}, gn = function(e, t, n) {
	var r = e.vars, i = r[t], a = z, o = e._ctx, s, c, l;
	if (i) return s = r[t + "Params"], c = r.callbackScope || e, n && qe.length && lt(), o && (z = o), l = s ? i.apply(c, s) : i.call(c), z = a, l;
}, _n = function(e) {
	return St(e), e.scrollTrigger && e.scrollTrigger.kill(!!ce), e.progress() < 1 && gn(e, "onInterrupt"), e;
}, vn, yn = [], bn = function(e) {
	if (e) if (e = !e.name && e.default || e, Se() || e.headless) {
		var t = e.name, n = _e(e), r = t && !n && e.init ? function() {
			this._props = [];
		} : e, i = {
			init: He,
			render: gr,
			add: Yn,
			kill: vr,
			modifier: _r,
			rawVars: 0
		}, a = {
			targetTest: 0,
			get: 0,
			getSetter: fr,
			aliases: {},
			register: 0
		};
		if (Mn(), e !== r) {
			if (Xe[t]) return;
			pt(r, pt(_t(e, i), a)), ht(r.prototype, ht(i, _t(e, a))), Xe[r.prop = t] = r, e.targetTest && ($e.push(r), Ke[t] = 1), t = (t === "css" ? "CSS" : t.charAt(0).toUpperCase() + t.substr(1)) + "Plugin";
		}
		Ve(t, r), e.register && e.register(Fr, r, xr);
	} else yn.push(e);
}, xn = 255, Sn = {
	aqua: [
		0,
		xn,
		xn
	],
	lime: [
		0,
		xn,
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
		xn
	],
	navy: [
		0,
		0,
		128
	],
	white: [
		xn,
		xn,
		xn
	],
	olive: [
		128,
		128,
		0
	],
	yellow: [
		xn,
		xn,
		0
	],
	orange: [
		xn,
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
		xn,
		0,
		0
	],
	pink: [
		xn,
		192,
		203
	],
	cyan: [
		0,
		xn,
		xn
	],
	transparent: [
		xn,
		xn,
		xn,
		0
	]
}, Cn = function(e, t, n) {
	return e += e < 0 ? 1 : e > 1 ? -1 : 0, (e * 6 < 1 ? t + (n - t) * e * 6 : e < .5 ? n : e * 3 < 2 ? t + (n - t) * (2 / 3 - e) * 6 : t) * xn + .5 | 0;
}, wn = function(e, t, n) {
	var r = e ? ve(e) ? [
		e >> 16,
		e >> 8 & xn,
		e & xn
	] : 0 : Sn.black, i, a, o, s, c, l, u, d, f, p;
	if (!r) {
		if (e.substr(-1) === "," && (e = e.substr(0, e.length - 1)), Sn[e]) r = Sn[e];
		else if (e.charAt(0) === "#") {
			if (e.length < 6 && (i = e.charAt(1), a = e.charAt(2), o = e.charAt(3), e = "#" + i + i + a + a + o + o + (e.length === 5 ? e.charAt(4) + e.charAt(4) : "")), e.length === 9) return r = parseInt(e.substr(1, 6), 16), [
				r >> 16,
				r >> 8 & xn,
				r & xn,
				parseInt(e.substr(7), 16) / 255
			];
			e = parseInt(e.substr(1), 16), r = [
				e >> 16,
				e >> 8 & xn,
				e & xn
			];
		} else if (e.substr(0, 3) === "hsl") {
			if (r = p = e.match(Ee), !t) s = r[0] % 360 / 360, c = r[1] / 100, l = r[2] / 100, a = l <= .5 ? l * (c + 1) : l + c - l * c, i = l * 2 - a, r.length > 3 && (r[3] *= 1), r[0] = Cn(s + 1 / 3, i, a), r[1] = Cn(s, i, a), r[2] = Cn(s - 1 / 3, i, a);
			else if (~e.indexOf("=")) return r = e.match(De), n && r.length < 4 && (r[3] = 1), r;
		} else r = e.match(Ee) || Sn.transparent;
		r = r.map(Number);
	}
	return t && !p && (i = r[0] / xn, a = r[1] / xn, o = r[2] / xn, u = Math.max(i, a, o), d = Math.min(i, a, o), l = (u + d) / 2, u === d ? s = c = 0 : (f = u - d, c = l > .5 ? f / (2 - u - d) : f / (u + d), s = u === i ? (a - o) / f + (a < o ? 6 : 0) : u === a ? (o - i) / f + 2 : (i - a) / f + 4, s *= 60), r[0] = ~~(s + .5), r[1] = ~~(c * 100 + .5), r[2] = ~~(l * 100 + .5)), n && r.length < 4 && (r[3] = 1), r;
}, Tn = function(e) {
	var t = [], n = [], r = -1;
	return e.split(Dn).forEach(function(e) {
		var i = e.match(Oe) || [];
		t.push.apply(t, i), n.push(r += i.length + 1);
	}), t.c = n, t;
}, En = function(e, t, n) {
	var r = "", i = (e + r).match(Dn), a = t ? "hsla(" : "rgba(", o = 0, s, c, l, u;
	if (!i) return e;
	if (i = i.map(function(e) {
		return (e = wn(e, t, 1)) && a + (t ? e[0] + "," + e[1] + "%," + e[2] + "%," + e[3] : e.join(",")) + ")";
	}), n && (l = Tn(e), s = n.c, s.join(r) !== l.c.join(r))) for (c = e.replace(Dn, "1").split(Oe), u = c.length - 1; o < u; o++) r += c[o] + (~s.indexOf(o) ? i.shift() || a + "0,0,0,0)" : (l.length ? l : i.length ? i : n).shift());
	if (!c) for (c = e.split(Dn), u = c.length - 1; o < u; o++) r += c[o] + i[o];
	return r + c[u];
}, Dn = function() {
	var e = "(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b", t;
	for (t in Sn) e += "|" + t + "\\b";
	return RegExp(e + ")", "gi");
}(), On = /hsl[a]?\(/, kn = function(e) {
	var t = e.join(" "), n;
	if (Dn.lastIndex = 0, Dn.test(t)) return n = On.test(t), e[1] = En(e[1], n), e[0] = En(e[0], n, Tn(e[1])), !0;
}, An, jn = function() {
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
			Le && (!Pe && Se() && (Ne = Pe = window, Fe = Ne.document || {}, H.gsap = Fr, (Ne.gsapVersions ||= []).push(Fr.version), Re(Ie || Ne.GreenSockGlobals || !Ne.gsap && Ne || {}), yn.forEach(bn)), u = typeof requestAnimationFrame < "u" && requestAnimationFrame, c && d.sleep(), l = u || function(e) {
				return setTimeout(e, o - d.time * 1e3 + 1 | 0);
			}, An = 1, m(2));
		},
		sleep: function() {
			(u ? cancelAnimationFrame : clearTimeout)(c), An = 0, l = He;
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
			return d.remove(e), s[n ? "unshift" : "push"](r), Mn(), r;
		},
		remove: function(e, t) {
			~(t = s.indexOf(e)) && s.splice(t, 1) && p >= t && p--;
		},
		_listeners: s
	}, d;
}(), Mn = function() {
	return !An && jn.wake();
}, U = {}, Nn = /^[\d.\-M][\d.\-,\s]/, Pn = /["']/g, Fn = function(e) {
	for (var t = {}, n = e.substr(1, e.length - 3).split(":"), r = n[0], i = 1, a = n.length, o, s, c; i < a; i++) s = n[i], o = i === a - 1 ? s.length : s.lastIndexOf(","), c = s.substr(0, o), t[r] = isNaN(c) ? c.replace(Pn, "").trim() : +c, r = s.substr(o + 1).trim();
	return t;
}, In = function(e) {
	var t = e.indexOf("(") + 1, n = e.indexOf(")"), r = e.indexOf("(", t);
	return e.substring(t, ~r && r < n ? e.indexOf(")", n + 1) : n);
}, Ln = function(e) {
	var t = (e + "").split("("), n = U[t[0]];
	return n && t.length > 1 && n.config ? n.config.apply(null, ~e.indexOf("{") ? [Fn(t[1])] : In(e).split(",").map(dt)) : U._CE && Nn.test(e) ? U._CE("", e) : n;
}, Rn = function(e) {
	return function(t) {
		return 1 - e(1 - t);
	};
}, zn = function e(t, n) {
	for (var r = t._first, i; r;) r instanceof qn ? e(r, n) : r.vars.yoyoEase && (!r._yoyo || !r._repeat) && r._yoyo !== n && (r.timeline ? e(r.timeline, n) : (i = r._ease, r._ease = r._yEase, r._yEase = i, r._yoyo = n)), r = r._next;
}, Bn = function(e, t) {
	return e && (_e(e) ? e : U[e] || Ln(e)) || t;
}, Vn = function(e, t, n, r) {
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
	return it(e, function(e) {
		for (var t in U[e] = H[e] = i, U[a = e.toLowerCase()] = n, i) U[a + (t === "easeIn" ? ".in" : t === "easeOut" ? ".out" : ".inOut")] = U[e + "." + t] = i[t];
	}), i;
}, Hn = function(e) {
	return function(t) {
		return t < .5 ? (1 - e(1 - t * 2)) / 2 : .5 + e((t - .5) * 2) / 2;
	};
}, Un = function e(t, n, r) {
	var i = n >= 1 ? n : 1, a = (r || (t ? .3 : .45)) / (n < 1 ? n : 1), o = a / ue * (Math.asin(1 / i) || 0), s = function(e) {
		return e === 1 ? 1 : i * 2 ** (-10 * e) * he((e - o) * a) + 1;
	}, c = t === "out" ? s : t === "in" ? function(e) {
		return 1 - s(1 - e);
	} : Hn(s);
	return a = ue / a, c.config = function(n, r) {
		return e(t, n, r);
	}, c;
}, Wn = function e(t, n) {
	n === void 0 && (n = 1.70158);
	var r = function(e) {
		return e ? --e * e * ((n + 1) * e + n) + 1 : 0;
	}, i = t === "out" ? r : t === "in" ? function(e) {
		return 1 - r(1 - e);
	} : Hn(r);
	return i.config = function(n) {
		return e(t, n);
	}, i;
};
it("Linear,Quad,Cubic,Quart,Quint,Strong", function(e, t) {
	var n = t < 5 ? t + 1 : t;
	Vn(e + ",Power" + (n - 1), t ? function(e) {
		return e ** +n;
	} : function(e) {
		return e;
	}, function(e) {
		return 1 - (1 - e) ** n;
	}, function(e) {
		return e < .5 ? (e * 2) ** n / 2 : 1 - ((1 - e) * 2) ** n / 2;
	});
}), U.Linear.easeNone = U.none = U.Linear.easeIn, Vn("Elastic", Un("in"), Un("out"), Un()), (function(e, t) {
	var n = 1 / t, r = 2 * n, i = 2.5 * n, a = function(a) {
		return a < n ? e * a * a : a < r ? e * (a - 1.5 / t) ** 2 + .75 : a < i ? e * (a -= 2.25 / t) * a + .9375 : e * (a - 2.625 / t) ** 2 + .984375;
	};
	Vn("Bounce", function(e) {
		return 1 - a(1 - e);
	}, a);
})(7.5625, 2.75), Vn("Expo", function(e) {
	return 2 ** (10 * (e - 1)) * e + e * e * e * e * e * e * (1 - e);
}), Vn("Circ", function(e) {
	return -(pe(1 - e * e) - 1);
}), Vn("Sine", function(e) {
	return e === 1 ? 1 : -me(e * de) + 1;
}), Vn("Back", Wn("in"), Wn("out"), Wn()), U.SteppedEase = U.steps = H.SteppedEase = { config: function(e, t) {
	e === void 0 && (e = 1);
	var n = 1 / e, r = e + +!t, i = +!!t, a = 1 - B;
	return function(e) {
		return ((r * Kt(0, a, e) | 0) + i) * n;
	};
} }, oe.ease = U["quad.out"], it("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt", function(e) {
	return et += e + "," + e + "Params,";
});
var Gn = function(e, t) {
	this.id = fe++, e._gsap = this, this.target = e, this.harness = t, this.get = t ? t.get : rt, this.set = t ? t.getSetter : fr;
}, Kn = /*#__PURE__*/ function() {
	function e(e) {
		this.vars = e, this._delay = +e.delay || 0, (this._repeat = e.repeat === Infinity ? -2 : e.repeat || 0) && (this._rDelay = e.repeatDelay || 0, this._yoyo = !!e.yoyo || !!e.yoyoEase), this._ts = 1, Bt(this, +e.duration, 1, 1), this.data = e.data, z && (this._ctx = z, z.data.push(this)), An || jn.wake();
	}
	var t = e.prototype;
	return t.delay = function(e) {
		return e || e === 0 ? (this.parent && this.parent.smoothChildTiming && this.startTime(this._start + e - this._delay), this._delay = e, this) : this._delay;
	}, t.duration = function(e) {
		return arguments.length ? this.totalDuration(this._repeat > 0 ? e + (e + this._rDelay) * this._repeat : e) : this.totalDuration() && this._dur;
	}, t.totalDuration = function(e) {
		return arguments.length ? (this._dirty = 0, Bt(this, this._repeat < 0 ? e : (e - this._repeat * this._rDelay) / (this._repeat + 1))) : this._tDur;
	}, t.totalTime = function(e, t) {
		if (Mn(), !arguments.length) return this._tTime;
		var n = this._dp;
		if (n && n.smoothChildTiming && this._ts) {
			for (jt(this, e), !n._dp || n.parent || Mt(n, this); n && n.parent;) n.parent._time !== n._start + (n._ts >= 0 ? n._tTime / n._ts : (n.totalDuration() - n._tTime) / -n._ts) && n.totalTime(n._tTime, !0), n = n.parent;
			!this.parent && this._dp.autoRemoveChildren && (this._ts > 0 && e < this._tDur || this._ts < 0 && e > 0 || !this._tDur && !e) && Nt(this._dp, this, this._start - this._delay);
		}
		return (this._tTime !== e || !this._dur && !t || this._initted && Math.abs(this._zTime) === B || !e && !this._initted && (this.add || this._ptLookup)) && (this._ts || (this._pTime = e), ut(this, e, t)), this;
	}, t.time = function(e, t) {
		return arguments.length ? this.totalTime(Math.min(this.totalDuration(), e + Dt(this)) % (this._dur + this._rDelay) || (e ? this._dur : 0), t) : this._time;
	}, t.totalProgress = function(e, t) {
		return arguments.length ? this.totalTime(this.totalDuration() * e, t) : this.totalDuration() ? Math.min(1, this._tTime / this._tDur) : this.rawTime() >= 0 && this._initted ? 1 : 0;
	}, t.progress = function(e, t) {
		return arguments.length ? this.totalTime(this.duration() * (this._yoyo && !(this.iteration() & 1) ? 1 - e : e) + Dt(this), t) : this.duration() ? Math.min(1, this._time / this._dur) : +(this.rawTime() > 0);
	}, t.iteration = function(e, t) {
		var n = this.duration() + this._rDelay;
		return arguments.length ? this.totalTime(this._time + (e - 1) * n, t) : this._repeat ? Ot(this._tTime, n) + 1 : 1;
	}, t.timeScale = function(e, t) {
		if (!arguments.length) return this._rts === -B ? 0 : this._rts;
		if (this._rts === e) return this;
		var n = this.parent && this._ts ? kt(this.parent._time, this) : this._tTime;
		return this._rts = +e || 0, this._ts = this._ps || e === -B ? 0 : this._rts, this.totalTime(Kt(-Math.abs(this._delay), this._tDur, n), t !== !1), At(this), wt(this);
	}, t.paused = function(e) {
		return arguments.length ? (this._ps !== e && (this._ps = e, e ? (this._pTime = this._tTime || Math.max(-this._delay, this.rawTime()), this._ts = this._act = 0) : (Mn(), this._ts = this._rts, this.totalTime(this.parent && !this.parent.smoothChildTiming ? this.rawTime() : this._tTime || this._pTime, this.progress() === 1 && Math.abs(this._zTime) !== B && (this._tTime -= B)))), this) : this._ps;
	}, t.startTime = function(e) {
		if (arguments.length) {
			this._start = e;
			var t = this.parent || this._dp;
			return t && (t._sort || !this.parent) && Nt(t, this, e - this._delay), this;
		}
		return this._start;
	}, t.endTime = function(e) {
		return this._start + (xe(e) ? this.totalDuration() : this.duration()) / Math.abs(this._ts || 1);
	}, t.rawTime = function(e) {
		var t = this.parent || this._dp;
		return t ? e && (!this._ts || this._repeat && this._time && this.totalProgress() < 1) ? this._tTime % (this._dur + this._rDelay) : this._ts ? kt(t.rawTime(e), this) : this._tTime : this._tTime;
	}, t.revert = function(e) {
		e === void 0 && (e = Ge);
		var t = ce;
		return ce = e, (this._initted || this._startAt) && (this.timeline && this.timeline.revert(e), this.totalTime(-.01, e.suppressEvents)), this.data !== "nested" && e.kill !== !1 && this.kill(), ce = t, this;
	}, t.globalTime = function(e) {
		for (var t = this, n = arguments.length ? e : t.rawTime(); t;) n = t._start + n / (Math.abs(t._ts) || 1), t = t._dp;
		return !this.parent && this._sat ? this._sat.globalTime(e) : n;
	}, t.repeat = function(e) {
		return arguments.length ? (this._repeat = e === Infinity ? -2 : e, Vt(this)) : this._repeat === -2 ? Infinity : this._repeat;
	}, t.repeatDelay = function(e) {
		if (arguments.length) {
			var t = this._time;
			return this._rDelay = e, Vt(this), t ? this.time(t) : this;
		}
		return this._rDelay;
	}, t.yoyo = function(e) {
		return arguments.length ? (this._yoyo = e, this) : this._yoyo;
	}, t.seek = function(e, t) {
		return this.totalTime(Ut(this, e), xe(t));
	}, t.restart = function(e, t) {
		return this.play().totalTime(e ? -this._delay : 0, xe(t)), this._dur || (this._zTime = -B), this;
	}, t.play = function(e, t) {
		return e != null && this.seek(e, t), this.reversed(!1).paused(!1);
	}, t.reverse = function(e, t) {
		return e != null && this.seek(e || this.totalDuration(), t), this.reversed(!0).paused(!1);
	}, t.pause = function(e, t) {
		return e != null && this.seek(e, t), this.paused(!0);
	}, t.resume = function() {
		return this.paused(!1);
	}, t.reversed = function(e) {
		return arguments.length ? (!!e !== this.reversed() && this.timeScale(-this._rts || (e ? -B : 0)), this) : this._rts < 0;
	}, t.invalidate = function() {
		return this._initted = this._act = 0, this._zTime = -B, this;
	}, t.isActive = function() {
		var e = this.parent || this._dp, t = this._start, n;
		return !!(!e || this._ts && this._initted && e.isActive() && (n = e.rawTime(!0)) >= t && n < this.endTime(!0) - B);
	}, t.eventCallback = function(e, t, n) {
		var r = this.vars;
		return arguments.length > 1 ? (t ? (r[e] = t, n && (r[e + "Params"] = n), e === "onUpdate" && (this._onUpdate = t)) : delete r[e], this) : r[e];
	}, t.then = function(e) {
		var t = this;
		return new Promise(function(n) {
			var r = _e(e) ? e : ft, i = function() {
				var e = t.then;
				t.then = null, _e(r) && (r = r(t)) && (r.then || r === t) && (t.then = e), n(r), t.then = e;
			};
			t._initted && t.totalProgress() === 1 && t._ts >= 0 || !t._tTime && t._ts < 0 ? i() : t._prom = i;
		});
	}, t.kill = function() {
		_n(this);
	}, e;
}();
pt(Kn.prototype, {
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
	_zTime: -B,
	_prom: 0,
	_ps: !1,
	_rts: 1
});
var qn = /*#__PURE__*/ function(e) {
	R(t, e);
	function t(t, n) {
		var r;
		return t === void 0 && (t = {}), r = e.call(this, t) || this, r.labels = {}, r.smoothChildTiming = !!t.smoothChildTiming, r.autoRemoveChildren = !!t.autoRemoveChildren, r._sort = xe(t.sortChildren), V && Nt(t.parent || V, L(r), n), t.reversed && r.reverse(), t.paused && r.paused(!0), t.scrollTrigger && Pt(L(r), t.scrollTrigger), r;
	}
	var n = t.prototype;
	return n.to = function(e, t, n) {
		return Wt(0, arguments, this), this;
	}, n.from = function(e, t, n) {
		return Wt(1, arguments, this), this;
	}, n.fromTo = function(e, t, n, r) {
		return Wt(2, arguments, this), this;
	}, n.set = function(e, t, n) {
		return t.duration = 0, t.parent = this, vt(t).repeatDelay || (t.repeat = 0), t.immediateRender = !!t.immediateRender, new sr(e, t, Ut(this, n), 1), this;
	}, n.call = function(e, t, n) {
		return Nt(this, sr.delayedCall(0, e, t), n);
	}, n.staggerTo = function(e, t, n, r, i, a, o) {
		return n.duration = t, n.stagger = n.stagger || r, n.onComplete = a, n.onCompleteParams = o, n.parent = this, new sr(e, n, Ut(this, i)), this;
	}, n.staggerFrom = function(e, t, n, r, i, a, o) {
		return n.runBackwards = 1, vt(n).immediateRender = xe(n.immediateRender), this.staggerTo(e, t, n, r, i, a, o);
	}, n.staggerFromTo = function(e, t, n, r, i, a, o, s) {
		return r.startAt = n, vt(r).immediateRender = xe(r.immediateRender), this.staggerTo(e, t, r, i, a, o, s);
	}, n.render = function(e, t, n) {
		var r = this._time, i = this._dirty ? this.totalDuration() : this._tDur, a = this._dur, o = e <= 0 ? 0 : ot(e), s = this._zTime < 0 != e < 0 && (this._initted || !a), c, l, u, d, f, p, m, h, g, _, v, y;
		if (this !== V && o > i && e >= 0 && (o = i), o !== this._tTime || n || s) {
			if (r !== this._time && a && (o += this._time - r, e += this._time - r), c = o, g = this._start, h = this._ts, p = !h, s && (a || (r = this._zTime), (e || !t) && (this._zTime = e)), this._repeat) {
				if (v = this._yoyo, f = a + this._rDelay, this._repeat < -1 && e < 0) return this.totalTime(f * 100 + e, t, n);
				if (c = ot(o % f), o === i ? (d = this._repeat, c = a) : (_ = ot(o / f), d = ~~_, d && d === _ && (c = a, d--), c > a && (c = a)), _ = Ot(this._tTime, f), !r && this._tTime && _ !== d && this._tTime - _ * f - this._dur <= 0 && (_ = d), v && d & 1 && (c = a - c, y = 1), d !== _ && !this._lock) {
					var b = v && _ & 1, x = b === (v && d & 1);
					if (d < _ && (b = !b), r = b ? 0 : o % a ? a : o, this._lock = 1, this.render(r || (y ? 0 : ot(d * f)), t, !a)._lock = 0, this._tTime = o, !t && this.parent && gn(this, "onRepeat"), this.vars.repeatRefresh && !y && (this.invalidate()._lock = 1), r && r !== this._time || p !== !this._ts || this.vars.onRepeat && !this.parent && !this._act || (a = this._dur, i = this._tDur, x && (this._lock = 2, r = b ? a : -1e-4, this.render(r, !0), this.vars.repeatRefresh && !y && this.invalidate()), this._lock = 0, !this._ts && !p)) return this;
					zn(this, y);
				}
			}
			if (this._hasPause && !this._forcing && this._lock < 2 && (m = zt(this, ot(r), ot(c)), m && (o -= c - (c = m._start))), this._tTime = o, this._time = c, this._act = !h, this._initted || (this._onUpdate = this.vars.onUpdate, this._initted = 1, this._zTime = e, r = 0), !r && c && !t && !d && (gn(this, "onStart"), this._tTime !== o)) return this;
			if (c >= r && e >= 0) for (l = this._first; l;) {
				if (u = l._next, (l._act || c >= l._start) && l._ts && m !== l) {
					if (l.parent !== this) return this.render(e, t, n);
					if (l.render(l._ts > 0 ? (c - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (c - l._start) * l._ts, t, n), c !== this._time || !this._ts && !p) {
						m = 0, u && (o += this._zTime = -B);
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
						if (l.render(l._ts > 0 ? (S - l._start) * l._ts : (l._dirty ? l.totalDuration() : l._tDur) + (S - l._start) * l._ts, t, n || ce && (l._initted || l._startAt)), c !== this._time || !this._ts && !p) {
							m = 0, u && (o += this._zTime = S ? -B : B);
							break;
						}
					}
					l = u;
				}
			}
			if (m && !t && (this.pause(), m.render(c >= r ? 0 : -B)._zTime = c >= r ? 1 : -1, this._ts)) return this._start = g, At(this), this.render(e, t, n);
			this._onUpdate && !t && gn(this, "onUpdate", !0), (o === i && this._tTime >= this.totalDuration() || !o && r) && (g === this._start || Math.abs(h) !== Math.abs(this._ts)) && (this._lock || ((e || !a) && (o === i && this._ts > 0 || !o && this._ts < 0) && St(this, 1), !t && !(e < 0 && !r) && (o || r || !i) && (gn(this, o === i && e >= 0 ? "onComplete" : "onReverseComplete", !0), this._prom && !(o < i && this.timeScale() > 0) && this._prom())));
		}
		return this;
	}, n.add = function(e, t) {
		var n = this;
		if (ve(t) || (t = Ut(this, t, e)), !(e instanceof Kn)) {
			if (Te(e)) return e.forEach(function(e) {
				return n.add(e, t);
			}), this;
			if (ge(e)) return this.addLabel(e, t);
			if (_e(e)) e = sr.delayedCall(0, e);
			else return this;
		}
		return this === e ? this : Nt(this, e, t);
	}, n.getChildren = function(e, t, n, r) {
		e === void 0 && (e = !0), t === void 0 && (t = !0), n === void 0 && (n = !0), r === void 0 && (r = -le);
		for (var i = [], a = this._first; a;) a._start >= r && (a instanceof sr ? t && i.push(a) : (n && i.push(a), e && i.push.apply(i, a.getChildren(!0, t, n)))), a = a._next;
		return i;
	}, n.getById = function(e) {
		for (var t = this.getChildren(1, 1, 1), n = t.length; n--;) if (t[n].vars.id === e) return t[n];
	}, n.remove = function(e) {
		return ge(e) ? this.removeLabel(e) : _e(e) ? this.killTweensOf(e) : (e.parent === this && xt(this, e), e === this._recent && (this._recent = this._last), Ct(this));
	}, n.totalTime = function(t, n) {
		return arguments.length ? (this._forcing = 1, !this._dp && this._ts && (this._start = ot(jn.time - (this._ts > 0 ? t / this._ts : (this.totalDuration() - t) / -this._ts))), e.prototype.totalTime.call(this, t, n), this._forcing = 0, this) : this._tTime;
	}, n.addLabel = function(e, t) {
		return this.labels[e] = Ut(this, t), this;
	}, n.removeLabel = function(e) {
		return delete this.labels[e], this;
	}, n.addPause = function(e, t, n) {
		var r = sr.delayedCall(0, t || He, n);
		return r.data = "isPause", this._hasPause = 1, Nt(this, r, Ut(this, e));
	}, n.removePause = function(e) {
		var t = this._first;
		for (e = Ut(this, e); t;) t._start === e && t.data === "isPause" && St(t), t = t._next;
	}, n.killTweensOf = function(e, t, n) {
		for (var r = this.getTweensOf(e, n), i = r.length; i--;) Qn !== r[i] && r[i].kill(e, t);
		return this;
	}, n.getTweensOf = function(e, t) {
		for (var n = [], r = Qt(e), i = this._first, a = ve(t), o; i;) i instanceof sr ? ct(i._targets, r) && (a ? (!Qn || i._initted && i._ts) && i.globalTime(0) <= t && i.globalTime(i.totalDuration()) > t : !t || i.isActive()) && n.push(i) : (o = i.getTweensOf(r, t)).length && n.push.apply(n, o), i = i._next;
		return n;
	}, n.tweenTo = function(e, t) {
		t ||= {};
		var n = this, r = Ut(n, e), i = t, a = i.startAt, o = i.onStart, s = i.onStartParams, c = i.immediateRender, l, u = sr.to(n, pt({
			ease: t.ease || "none",
			lazy: !1,
			immediateRender: !1,
			time: r,
			overwrite: "auto",
			duration: t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale()) || B,
			onStart: function() {
				if (n.pause(), !l) {
					var e = t.duration || Math.abs((r - (a && "time" in a ? a.time : n._time)) / n.timeScale());
					u._dur !== e && Bt(u, e, 0, 1).render(u._time, !0, !0), l = 1;
				}
				o && o.apply(u, s || []);
			}
		}, t));
		return c ? u.render(0) : u;
	}, n.tweenFromTo = function(e, t, n) {
		return this.tweenTo(t, pt({ startAt: { time: Ut(this, e) } }, n));
	}, n.recent = function() {
		return this._recent;
	}, n.nextLabel = function(e) {
		return e === void 0 && (e = this._time), hn(this, Ut(this, e));
	}, n.previousLabel = function(e) {
		return e === void 0 && (e = this._time), hn(this, Ut(this, e), 1);
	}, n.currentLabel = function(e) {
		return arguments.length ? this.seek(e, !0) : this.previousLabel(this._time + B);
	}, n.shiftChildren = function(e, t, n) {
		n === void 0 && (n = 0);
		for (var r = this._first, i = this.labels, a; r;) r._start >= n && (r._start += e, r._end += e), r = r._next;
		if (t) for (a in i) i[a] >= n && (i[a] += e);
		return Ct(this);
	}, n.invalidate = function(t) {
		var n = this._first;
		for (this._lock = 0; n;) n.invalidate(t), n = n._next;
		return e.prototype.invalidate.call(this, t);
	}, n.clear = function(e) {
		e === void 0 && (e = !0);
		for (var t = this._first, n; t;) n = t._next, this.remove(t), t = n;
		return this._dp && (this._time = this._tTime = this._pTime = 0), e && (this.labels = {}), Ct(this);
	}, n.totalDuration = function(e) {
		var t = 0, n = this, r = n._last, i = le, a, o, s;
		if (arguments.length) return n.timeScale((n._repeat < 0 ? n.duration() : n.totalDuration()) / (n.reversed() ? -e : e));
		if (n._dirty) {
			for (s = n.parent; r;) a = r._prev, r._dirty && r.totalDuration(), o = r._start, o > i && n._sort && r._ts && !n._lock ? (n._lock = 1, Nt(n, r, o - r._delay, 1)._lock = 0) : i = o, o < 0 && r._ts && (t -= o, (!s && !n._dp || s && s.smoothChildTiming) && (n._start += o / n._ts, n._time -= o, n._tTime -= o), n.shiftChildren(-o, !1, -Infinity), i = 0), r._end > t && r._ts && (t = r._end), r = a;
			Bt(n, n === V && n._time > t ? n._time : t, 1, 1), n._dirty = 0;
		}
		return n._tDur;
	}, t.updateRoot = function(e) {
		if (V._ts && (ut(V, kt(e, V)), Ye = jn.frame), jn.frame >= Qe) {
			Qe += ae.autoSleep || 120;
			var t = V._first;
			if ((!t || !t._ts) && ae.autoSleep && jn._listeners.length < 2) {
				for (; t && !t._ts;) t = t._next;
				t || jn.sleep();
			}
		}
	}, t;
}(Kn);
pt(qn.prototype, {
	_lock: 0,
	_hasPause: 0,
	_forcing: 0
});
var Jn = function(e, t, n, r, i, a, o) {
	var s = new xr(this._pt, e, t, 0, 1, hr, null, i), c = 0, l = 0, u, d, f, p, m, h, g, _;
	for (s.b = n, s.e = r, n += "", r += "", (g = ~r.indexOf("random(")) && (r = fn(r)), a && (_ = [n, r], a(_, e, t), n = _[0], r = _[1]), d = n.match(ke) || []; u = ke.exec(r);) p = u[0], m = r.substring(c, u.index), f ? f = (f + 1) % 5 : m.substr(-5) === "rgba(" && (f = 1), p !== d[l++] && (h = parseFloat(d[l - 1]) || 0, s._pt = {
		_next: s._pt,
		p: m || l === 1 ? m : ",",
		s: h,
		c: p.charAt(1) === "=" ? st(h, p) - h : parseFloat(p) - h,
		m: f && f < 4 ? Math.round : 0
	}, c = ke.lastIndex);
	return s.c = c < r.length ? r.substring(c, r.length) : "", s.fp = o, (Ae.test(r) || g) && (s.e = 0), this._pt = s, s;
}, Yn = function(e, t, n, r, i, a, o, s, c, l) {
	_e(r) && (r = r(i || 0, e, a));
	var u = e[t], d = n === "get" ? _e(u) ? c ? e[t.indexOf("set") || !_e(e["get" + t.substr(3)]) ? t : "get" + t.substr(3)](c) : e[t]() : u : n, f = _e(u) ? c ? ur : lr : cr, p;
	if (ge(r) && (~r.indexOf("random(") && (r = fn(r)), r.charAt(1) === "=" && (p = st(d, r) + (qt(d) || 0), (p || p === 0) && (r = p))), !l || d !== r || $n) return !isNaN(d * r) && r !== "" ? (p = new xr(this._pt, e, t, +d || 0, r - (d || 0), typeof u == "boolean" ? mr : pr, 0, f), c && (p.fp = c), o && p.modifier(o, this, e), this._pt = p) : (!u && !(t in e) && ze(t, r), Jn.call(this, e, t, d, r, f, s || ae.stringFilter, c));
}, Xn = function(e, t, n, r, i) {
	if (_e(e) && (e = ir(e, i, t, n, r)), !be(e) || e.style && e.nodeType || Te(e) || we(e)) return ge(e) ? ir(e, i, t, n, r) : e;
	var a = {}, o;
	for (o in e) a[o] = ir(e[o], i, t, n, r);
	return a;
}, Zn = function(e, t, n, r, i, a) {
	var o, s, c, l;
	if (Xe[e] && (o = new Xe[e]()).init(i, o.rawVars ? t[e] : Xn(t[e], r, i, a, n), n, r, a) !== !1 && (n._pt = s = new xr(n._pt, i, e, 0, 1, o.render, o, 0, o.priority), n !== vn)) for (c = n._ptLookup[n._targets.indexOf(i)], l = o._props.length; l--;) c[o._props[l]] = s;
	return o;
}, Qn, $n, er = function e(t, n, r) {
	var i = t.vars, a = i.ease, o = i.startAt, s = i.immediateRender, c = i.lazy, l = i.onUpdate, u = i.runBackwards, d = i.yoyoEase, f = i.keyframes, p = i.autoRevert, m = t._dur, h = t._startAt, g = t._targets, _ = t.parent, v = _ && _.data === "nested" ? _.vars.targets : g, y = t._overwrite === "auto" && !se, b = t.timeline, x, S, C, w, T, E, D, O, k, ee, te, A, ne;
	if (b && (!f || !a) && (a = "none"), t._ease = Bn(a, oe.ease), t._yEase = d ? Rn(Bn(d === !0 ? a : d, oe.ease)) : 0, d && t._yoyo && !t._repeat && (d = t._yEase, t._yEase = t._ease, t._ease = d), t._from = !b && !!i.runBackwards, !b || f && !i.stagger) {
		if (O = g[0] ? nt(g[0]).harness : 0, A = O && i[O.prop], x = _t(i, Ke), h && (h._zTime < 0 && h.progress(1), n < 0 && u && s && !p ? h.render(-1, !0) : h.revert(u && m ? We : Ue), h._lazy = 0), o) {
			if (St(t._startAt = sr.set(g, pt({
				data: "isStart",
				overwrite: !1,
				parent: _,
				immediateRender: !0,
				lazy: !h && xe(c),
				startAt: null,
				delay: 0,
				onUpdate: l && function() {
					return gn(t, "onUpdate");
				},
				stagger: 0
			}, o))), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (ce || !s && !p) && t._startAt.revert(We), s && m && n <= 0 && r <= 0) {
				n && (t._zTime = n);
				return;
			}
		} else if (u && m && !h) {
			if (n && (s = !1), C = pt({
				overwrite: !1,
				data: "isFromStart",
				lazy: s && !h && xe(c),
				immediateRender: s,
				stagger: 0,
				parent: _
			}, x), A && (C[O.prop] = A), St(t._startAt = sr.set(g, C)), t._startAt._dp = 0, t._startAt._sat = t, n < 0 && (ce ? t._startAt.revert(We) : t._startAt.render(-1, !0)), t._zTime = n, !s) e(t._startAt, B, B);
			else if (!n) return;
		}
		for (t._pt = t._ptCache = 0, c = m && xe(c) || c && !m, S = 0; S < g.length; S++) {
			if (T = g[S], D = T._gsap || tt(g)[S]._gsap, t._ptLookup[S] = ee = {}, Je[D.id] && qe.length && lt(), te = v === g ? S : v.indexOf(T), O && (k = new O()).init(T, A || x, t, te, v) !== !1 && (t._pt = w = new xr(t._pt, T, k.name, 0, 1, k.render, k, 0, k.priority), k._props.forEach(function(e) {
				ee[e] = w;
			}), k.priority && (E = 1)), !O || A) for (C in x) Xe[C] && (k = Zn(C, x, t, te, T, v)) ? k.priority && (E = 1) : ee[C] = w = Yn.call(t, T, C, "get", x[C], te, v, 0, i.stringFilter);
			t._op && t._op[S] && t.kill(T, t._op[S]), y && t._pt && (Qn = t, V.killTweensOf(T, ee, t.globalTime(n)), ne = !t.parent, Qn = 0), t._pt && c && (Je[D.id] = 1);
		}
		E && br(t), t._onInit && t._onInit(t);
	}
	t._onUpdate = l, t._initted = (!t._op || t._pt) && !ne, f && n <= 0 && b.render(le, !0, !0);
}, tr = function(e, t, n, r, i, a, o, s) {
	var c = (e._pt && e._ptCache || (e._ptCache = {}))[t], l, u, d, f;
	if (!c) for (c = e._ptCache[t] = [], d = e._ptLookup, f = e._targets.length; f--;) {
		if (l = d[f][t], l && l.d && l.d._pt) for (l = l.d._pt; l && l.p !== t && l.fp !== t;) l = l._next;
		if (!l) return $n = 1, e.vars[t] = "+=0", er(e, o), $n = 0, s ? Be(t + " not eligible for reset") : 1;
		c.push(l);
	}
	for (f = c.length; f--;) u = c[f], l = u._pt || u, l.s = (r || r === 0) && !i ? r : l.s + (r || 0) + a * l.c, l.c = n - l.s, u.e &&= at(n) + qt(u.e), u.b &&= l.s + qt(u.b);
}, nr = function(e, t) {
	var n = e[0] ? nt(e[0]).harness : 0, r = n && n.aliases, i, a, o, s;
	if (!r) return t;
	for (a in i = ht({}, t), r) if (a in i) for (s = r[a].split(","), o = s.length; o--;) i[s[o]] = i[a];
	return i;
}, rr = function(e, t, n, r) {
	var i = t.ease || r || "power1.inOut", a, o;
	if (Te(t)) o = n[e] || (n[e] = []), t.forEach(function(e, n) {
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
}, ir = function(e, t, n, r, i) {
	return _e(e) ? e.call(t, n, r, i) : ge(e) && ~e.indexOf("random(") ? fn(e) : e;
}, ar = et + "repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert", or = {};
it(ar + ",id,stagger,delay,duration,paused,scrollTrigger", function(e) {
	return or[e] = 1;
});
var sr = /*#__PURE__*/ function(e) {
	R(t, e);
	function t(t, n, r, i) {
		var a;
		typeof n == "number" && (r.duration = n, n = r, r = null), a = e.call(this, i ? n : vt(n)) || this;
		var o = a.vars, s = o.duration, c = o.delay, l = o.immediateRender, u = o.stagger, d = o.overwrite, f = o.keyframes, p = o.defaults, m = o.scrollTrigger, h = o.yoyoEase, g = n.parent || V, _ = (Te(t) || we(t) ? ve(t[0]) : "length" in n) ? [t] : Qt(t), v, y, b, x, S, C, w, T;
		if (a._targets = _.length ? tt(_) : Be("GSAP target " + t + " not found. https://gsap.com", !ae.nullTargetWarn) || [], a._ptLookup = [], a._overwrite = d, f || u || Ce(s) || Ce(c)) {
			if (n = a.vars, v = a.timeline = new qn({
				data: "nested",
				defaults: p || {},
				targets: g && g.data === "nested" ? g.vars.targets : _
			}), v.kill(), v.parent = v._dp = L(a), v._start = 0, u || Ce(s) || Ce(c)) {
				if (x = _.length, w = u && tn(u), be(u)) for (S in u) ~ar.indexOf(S) && (T ||= {}, T[S] = u[S]);
				for (y = 0; y < x; y++) b = _t(n, or), b.stagger = 0, h && (b.yoyoEase = h), T && ht(b, T), C = _[y], b.duration = +ir(s, L(a), y, C, _), b.delay = (+ir(c, L(a), y, C, _) || 0) - a._delay, !u && x === 1 && b.delay && (a._delay = c = b.delay, a._start += c, b.delay = 0), v.to(C, b, w ? w(y, C, _) : 0), v._ease = U.none;
				v.duration() ? s = c = 0 : a.timeline = 0;
			} else if (f) {
				vt(pt(v.vars.defaults, { ease: "none" })), v._ease = Bn(f.ease || n.ease || "none");
				var E = 0, D, O, k;
				if (Te(f)) f.forEach(function(e) {
					return v.to(_, e, ">");
				}), v.duration();
				else {
					for (S in b = {}, f) S === "ease" || S === "easeEach" || rr(S, f[S], b, f.easeEach);
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
		return d === !0 && !se && (Qn = L(a), V.killTweensOf(_), Qn = 0), Nt(g, L(a), r), n.reversed && a.reverse(), n.paused && a.paused(!0), (l || !s && !f && a._start === ot(g._time) && xe(l) && Et(L(a)) && g.data !== "nested") && (a._tTime = -B, a.render(Math.max(0, -c) || 0)), m && Pt(L(a), m), a;
	}
	var n = t.prototype;
	return n.render = function(e, t, n) {
		var r = this._time, i = this._tDur, a = this._dur, o = e < 0, s = e > i - B && !o ? i : e < B ? 0 : e, c, l, u, d, f, p, m, h, g;
		if (!a) Rt(this, e, t, n);
		else if (s !== this._tTime || !e || n || !this._initted && this._tTime || this._startAt && this._zTime < 0 !== o || this._lazy) {
			if (c = s, h = this.timeline, this._repeat) {
				if (d = a + this._rDelay, this._repeat < -1 && o) return this.totalTime(d * 100 + e, t, n);
				if (c = ot(s % d), s === i ? (u = this._repeat, c = a) : (f = ot(s / d), u = ~~f, u && u === f ? (c = a, u--) : c > a && (c = a)), p = this._yoyo && u & 1, p && (g = this._yEase, c = a - c), f = Ot(this._tTime, d), c === r && !n && this._initted && u === f) return this._tTime = s, this;
				u !== f && (h && this._yEase && zn(h, p), this.vars.repeatRefresh && !p && !this._lock && c !== d && this._initted && (this._lock = n = 1, this.render(ot(d * u), !0).invalidate()._lock = 0));
			}
			if (!this._initted) {
				if (Ft(this, o ? e : c, n, t, s)) return this._tTime = 0, this;
				if (r !== this._time && !(n && this.vars.repeatRefresh && u !== f)) return this;
				if (a !== this._dur) return this.render(e, t, n);
			}
			if (this._tTime = s, this._time = c, !this._act && this._ts && (this._act = 1, this._lazy = 0), this.ratio = m = (g || this._ease)(c / a), this._from && (this.ratio = m = 1 - m), c && !r && !t && !u && (gn(this, "onStart"), this._tTime !== s)) return this;
			for (l = this._pt; l;) l.r(m, l.d), l = l._next;
			h && h.render(e < 0 ? e : h._dur * h._ease(c / this._dur), t, n) || this._startAt && (this._zTime = e), this._onUpdate && !t && (o && Tt(this, e, t, n), gn(this, "onUpdate")), this._repeat && u !== f && this.vars.onRepeat && !t && this.parent && gn(this, "onRepeat"), (s === this._tDur || !s) && this._tTime === s && (o && !this._onUpdate && Tt(this, e, !0, !0), (e || !a) && (s === this._tDur && this._ts > 0 || !s && this._ts < 0) && St(this, 1), !t && !(o && !r) && (s || r || p) && (gn(this, s === i ? "onComplete" : "onReverseComplete", !0), this._prom && !(s < i && this.timeScale() > 0) && this._prom()));
		}
		return this;
	}, n.targets = function() {
		return this._targets;
	}, n.invalidate = function(t) {
		return (!t || !this.vars.runBackwards) && (this._startAt = 0), this._pt = this._op = this._onUpdate = this._lazy = this.ratio = 0, this._ptLookup = [], this.timeline && this.timeline.invalidate(t), e.prototype.invalidate.call(this, t);
	}, n.resetTo = function(e, t, n, r, i) {
		An || jn.wake(), this._ts || this.play();
		var a = Math.min(this._dur, (this._dp._time - this._start) * this._ts), o;
		return this._initted || er(this, a), o = this._ease(a / this._dur), tr(this, e, t, n, r, o, a, i) ? this.resetTo(e, t, n, r, 1) : (jt(this, 0), this.parent || bt(this._dp, this, "_first", "_last", this._dp._sort ? "_start" : 0), this.render(0));
	}, n.kill = function(e, t) {
		if (t === void 0 && (t = "all"), !e && (!t || t === "all")) return this._lazy = this._pt = 0, this.parent ? _n(this) : this.scrollTrigger && this.scrollTrigger.kill(!!ce), this;
		if (this.timeline) {
			var n = this.timeline.totalDuration();
			return this.timeline.killTweensOf(e, t, Qn && Qn.vars.overwrite !== !0)._first || _n(this), this.parent && n !== this.timeline.totalDuration() && Bt(this, this._dur * this.timeline._tDur / n, 0, 1), this;
		}
		var r = this._targets, i = e ? Qt(e) : r, a = this._ptLookup, o = this._pt, s, c, l, u, d, f, p;
		if ((!t || t === "all") && yt(r, i)) return t === "all" && (this._pt = 0), _n(this);
		for (s = this._op = this._op || [], t !== "all" && (ge(t) && (d = {}, it(t, function(e) {
			return d[e] = 1;
		}), t = d), t = nr(r, t)), p = r.length; p--;) if (~i.indexOf(r[p])) for (d in c = a[p], t === "all" ? (s[p] = t, u = c, l = {}) : (l = s[p] = s[p] || {}, u = t), u) f = c && c[d], f && ((!("kill" in f.d) || f.d.kill(d) === !0) && xt(this, f, "_pt"), delete c[d]), l !== "all" && (l[d] = 1);
		return this._initted && !this._pt && o && _n(this), this;
	}, t.to = function(e, n) {
		return new t(e, n, arguments[2]);
	}, t.from = function(e, t) {
		return Wt(1, arguments);
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
		return Wt(2, arguments);
	}, t.set = function(e, n) {
		return n.duration = 0, n.repeatDelay || (n.repeat = 0), new t(e, n);
	}, t.killTweensOf = function(e, t, n) {
		return V.killTweensOf(e, t, n);
	}, t;
}(Kn);
pt(sr.prototype, {
	_targets: [],
	_lazy: 0,
	_startAt: 0,
	_op: 0,
	_onInit: 0
}), it("staggerTo,staggerFrom,staggerFromTo", function(e) {
	sr[e] = function() {
		var t = new qn(), n = Yt.call(arguments, 0);
		return n.splice(e === "staggerFromTo" ? 5 : 4, 0, 0), t[e].apply(t, n);
	};
});
var cr = function(e, t, n) {
	return e[t] = n;
}, lr = function(e, t, n) {
	return e[t](n);
}, ur = function(e, t, n, r) {
	return e[t](r.fp, n);
}, dr = function(e, t, n) {
	return e.setAttribute(t, n);
}, fr = function(e, t) {
	return _e(e[t]) ? lr : ye(e[t]) && e.setAttribute ? dr : cr;
}, pr = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e6) / 1e6, t);
}, mr = function(e, t) {
	return t.set(t.t, t.p, !!(t.s + t.c * e), t);
}, hr = function(e, t) {
	var n = t._pt, r = "";
	if (!e && t.b) r = t.b;
	else if (e === 1 && t.e) r = t.e;
	else {
		for (; n;) r = n.p + (n.m ? n.m(n.s + n.c * e) : Math.round((n.s + n.c * e) * 1e4) / 1e4) + r, n = n._next;
		r += t.c;
	}
	t.set(t.t, t.p, r, t);
}, gr = function(e, t) {
	for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
}, _r = function(e, t, n, r) {
	for (var i = this._pt, a; i;) a = i._next, i.p === r && i.modifier(e, t, n), i = a;
}, vr = function(e) {
	for (var t = this._pt, n, r; t;) r = t._next, t.p === e && !t.op || t.op === e ? xt(this, t, "_pt") : t.dep || (n = 1), t = r;
	return !n;
}, yr = function(e, t, n, r) {
	r.mSet(e, t, r.m.call(r.tween, n, r.mt), r);
}, br = function(e) {
	for (var t = e._pt, n, r, i, a; t;) {
		for (n = t._next, r = i; r && r.pr > t.pr;) r = r._next;
		(t._prev = r ? r._prev : a) ? t._prev._next = t : i = t, (t._next = r) ? r._prev = t : a = t, t = n;
	}
	e._pt = i;
}, xr = /*#__PURE__*/ function() {
	function e(e, t, n, r, i, a, o, s, c) {
		this.t = t, this.s = r, this.c = i, this.p = n, this.r = a || pr, this.d = o || this, this.set = s || cr, this.pr = c || 0, this._next = e, e && (e._prev = this);
	}
	var t = e.prototype;
	return t.modifier = function(e, t, n) {
		this.mSet = this.mSet || this.set, this.set = yr, this.m = e, this.mt = n, this.tween = t;
	}, e;
}();
it(et + "parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger", function(e) {
	return Ke[e] = 1;
}), H.TweenMax = H.TweenLite = sr, H.TimelineLite = H.TimelineMax = qn, V = new qn({
	sortChildren: !1,
	defaults: oe,
	autoRemoveChildren: !0,
	id: "root",
	smoothChildTiming: !0
}), ae.stringFilter = kn;
var Sr = [], Cr = {}, wr = [], Tr = 0, Er = 0, Dr = function(e) {
	return (Cr[e] || wr).map(function(e) {
		return e();
	});
}, Or = function() {
	var e = Date.now(), t = [];
	e - Tr > 2 && (Dr("matchMediaInit"), Sr.forEach(function(e) {
		var n = e.queries, r = e.conditions, i, a, o, s;
		for (a in n) i = Ne.matchMedia(n[a]).matches, i && (o = 1), i !== r[a] && (r[a] = i, s = 1);
		s && (e.revert(), o && t.push(e));
	}), Dr("matchMediaRevert"), t.forEach(function(e) {
		return e.onMatch(e, function(t) {
			return e.add(null, t);
		});
	}), Tr = e, Dr("matchMedia"));
}, kr = /*#__PURE__*/ function() {
	function e(e, t) {
		this.selector = t && $t(t), this.data = [], this._r = [], this.isReverted = !1, this.id = Er++, e && this.add(e);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		_e(e) && (n = t, t = e, e = _e);
		var r = this, i = function() {
			var e = z, i = r.selector, a;
			return e && e !== r && e.data.push(r), n && (r.selector = $t(n)), z = r, a = t.apply(r, arguments), _e(a) && r._r.push(a), z = e, r.selector = i, r.isReverted = !1, a;
		};
		return r.last = i, e === _e ? i(r, function(e) {
			return r.add(null, e);
		}) : e ? r[e] = i : i;
	}, t.ignore = function(e) {
		var t = z;
		z = null, e(this), z = t;
	}, t.getTweens = function() {
		var t = [];
		return this.data.forEach(function(n) {
			return n instanceof e ? t.push.apply(t, n.getTweens()) : n instanceof sr && !(n.parent && n.parent.data === "nested") && t.push(n);
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
			}), r = n.data.length; r--;) i = n.data[r], i instanceof qn ? i.data !== "nested" && (i.scrollTrigger && i.scrollTrigger.revert(), i.kill()) : !(i instanceof sr) && i.revert && i.revert(e);
			n._r.forEach(function(t) {
				return t(e, n);
			}), n.isReverted = !0;
		})() : this.data.forEach(function(e) {
			return e.kill && e.kill();
		}), this.clear(), t) for (var r = Sr.length; r--;) Sr[r].id === this.id && Sr.splice(r, 1);
	}, t.revert = function(e) {
		this.kill(e || {});
	}, e;
}(), Ar = /*#__PURE__*/ function() {
	function e(e) {
		this.contexts = [], this.scope = e, z && z.data.push(this);
	}
	var t = e.prototype;
	return t.add = function(e, t, n) {
		be(e) || (e = { matches: e });
		var r = new kr(0, n || this.scope), i = r.conditions = {}, a, o, s;
		for (o in z && !r.selector && (r.selector = z.selector), this.contexts.push(r), t = r.add("onMatch", t), r.queries = e, e) o === "all" ? s = 1 : (a = Ne.matchMedia(e[o]), a && (Sr.indexOf(r) < 0 && Sr.push(r), (i[o] = a.matches) && (s = 1), a.addListener ? a.addListener(Or) : a.addEventListener("change", Or)));
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
}(), jr = {
	registerPlugin: function() {
		[...arguments].forEach(function(e) {
			return bn(e);
		});
	},
	timeline: function(e) {
		return new qn(e);
	},
	getTweensOf: function(e, t) {
		return V.getTweensOf(e, t);
	},
	getProperty: function(e, t, n, r) {
		ge(e) && (e = Qt(e)[0]);
		var i = nt(e || {}).get, a = n ? ft : dt;
		return n === "native" && (n = ""), e && (t ? a((Xe[t] && Xe[t].get || i)(e, t, n, r)) : function(t, n, r) {
			return a((Xe[t] && Xe[t].get || i)(e, t, n, r));
		});
	},
	quickSetter: function(e, t, n) {
		if (e = Qt(e), e.length > 1) {
			var r = e.map(function(e) {
				return Fr.quickSetter(e, t, n);
			}), i = r.length;
			return function(e) {
				for (var t = i; t--;) r[t](e);
			};
		}
		e = e[0] || {};
		var a = Xe[t], o = nt(e), s = o.harness && (o.harness.aliases || {})[t] || t, c = a ? function(t) {
			var r = new a();
			vn._pt = 0, r.init(e, n ? t + n : t, vn, 0, [e]), r.render(1, r), vn._pt && gr(1, vn);
		} : o.set(e, s);
		return a ? c : function(t) {
			return c(e, s, n ? t + n : t, o, 1);
		};
	},
	quickTo: function(e, t, n) {
		var r, i = Fr.to(e, pt((r = {}, r[t] = "+=0.1", r.paused = !0, r.stagger = 0, r), n || {})), a = function(e, n, r) {
			return i.resetTo(t, e, n, r);
		};
		return a.tween = i, a;
	},
	isTweening: function(e) {
		return V.getTweensOf(e, !0).length > 0;
	},
	defaults: function(e) {
		return e && e.ease && (e.ease = Bn(e.ease, oe.ease)), gt(oe, e || {});
	},
	config: function(e) {
		return gt(ae, e || {});
	},
	registerEffect: function(e) {
		var t = e.name, n = e.effect, r = e.plugins, i = e.defaults, a = e.extendTimeline;
		(r || "").split(",").forEach(function(e) {
			return e && !Xe[e] && !H[e] && Be(t + " effect requires " + e + " plugin.");
		}), Ze[t] = function(e, t, r) {
			return n(Qt(e), pt(t || {}, i), r);
		}, a && (qn.prototype[t] = function(e, n, r) {
			return this.add(Ze[t](e, be(n) ? n : (r = n) && {}, this), r);
		});
	},
	registerEase: function(e, t) {
		U[e] = Bn(t);
	},
	parseEase: function(e, t) {
		return arguments.length ? Bn(e, t) : U;
	},
	getById: function(e) {
		return V.getById(e);
	},
	exportRoot: function(e, t) {
		e === void 0 && (e = {});
		var n = new qn(e), r, i;
		for (n.smoothChildTiming = xe(e.smoothChildTiming), V.remove(n), n._dp = 0, n._time = n._tTime = V._time, r = V._first; r;) i = r._next, (t || !(!r._dur && r instanceof sr && r.vars.onComplete === r._targets[0])) && Nt(n, r, r._start - r._delay), r = i;
		return Nt(V, n, 0), n;
	},
	context: function(e, t) {
		return e ? new kr(e, t) : z;
	},
	matchMedia: function(e) {
		return new Ar(e);
	},
	matchMediaRefresh: function() {
		return Sr.forEach(function(e) {
			var t = e.conditions, n, r;
			for (r in t) t[r] && (t[r] = !1, n = 1);
			n && e.revert();
		}) || Or();
	},
	addEventListener: function(e, t) {
		var n = Cr[e] || (Cr[e] = []);
		~n.indexOf(t) || n.push(t);
	},
	removeEventListener: function(e, t) {
		var n = Cr[e], r = n && n.indexOf(t);
		r >= 0 && n.splice(r, 1);
	},
	utils: {
		wrap: un,
		wrapYoyo: dn,
		distribute: tn,
		random: an,
		snap: rn,
		normalize: cn,
		getUnit: qt,
		clamp: Jt,
		splitColor: wn,
		toArray: Qt,
		selector: $t,
		mapRange: pn,
		pipe: on,
		unitize: sn,
		interpolate: mn,
		shuffle: en
	},
	install: Re,
	effects: Ze,
	ticker: jn,
	updateRoot: qn.updateRoot,
	plugins: Xe,
	globalTimeline: V,
	core: {
		PropTween: xr,
		globals: Ve,
		Tween: sr,
		Timeline: qn,
		Animation: Kn,
		getCache: nt,
		_removeLinkedListItem: xt,
		reverting: function() {
			return ce;
		},
		context: function(e) {
			return e && z && (z.data.push(e), e._ctx = z), z;
		},
		suppressOverwrites: function(e) {
			return se = e;
		}
	}
};
it("to,from,fromTo,delayedCall,set,killTweensOf", function(e) {
	return jr[e] = sr[e];
}), jn.add(qn.updateRoot), vn = jr.to({}, { duration: 0 });
var Mr = function(e, t) {
	for (var n = e._pt; n && n.p !== t && n.op !== t && n.fp !== t;) n = n._next;
	return n;
}, Nr = function(e, t) {
	var n = e._targets, r, i, a;
	for (r in t) for (i = n.length; i--;) a = e._ptLookup[i][r], (a &&= a.d) && (a._pt && (a = Mr(a, r)), a && a.modifier && a.modifier(t[r], e, n[i], r));
}, Pr = function(e, t) {
	return {
		name: e,
		rawVars: 1,
		init: function(e, n, r) {
			r._onInit = function(e) {
				var r, i;
				if (ge(n) && (r = {}, it(n, function(e) {
					return r[e] = 1;
				}), n = r), t) {
					for (i in r = {}, n) r[i] = t(n[i]);
					n = r;
				}
				Nr(e, n);
			};
		}
	};
}, Fr = jr.registerPlugin({
	name: "attr",
	init: function(e, t, n, r, i) {
		var a, o, s;
		for (a in this.tween = n, t) s = e.getAttribute(a) || "", o = this.add(e, "setAttribute", (s || 0) + "", t[a], r, i, 0, 0, a), o.op = a, o.b = s, this._props.push(a);
	},
	render: function(e, t) {
		for (var n = t._pt; n;) ce ? n.set(n.t, n.p, n.b, n) : n.r(e, n.d), n = n._next;
	}
}, {
	name: "endArray",
	init: function(e, t) {
		for (var n = t.length; n--;) this.add(e, n, e[n] || 0, t[n], 0, 0, 0, 0, 0, 1);
	}
}, Pr("roundProps", nn), Pr("modifiers"), Pr("snap", rn)) || jr;
sr.version = qn.version = Fr.version = "3.12.7", Le = 1, Se() && Mn(), U.Power0, U.Power1, U.Power2, U.Power3, U.Power4, U.Linear, U.Quad, U.Cubic, U.Quart, U.Quint, U.Strong, U.Elastic, U.Back, U.SteppedEase, U.Bounce, U.Sine, U.Expo, U.Circ;
//#endregion
//#region node_modules/gsap/CSSPlugin.js
var Ir, Lr, Rr, zr, Br, Vr, Hr, Ur = function() {
	return typeof window < "u";
}, Wr = {}, Gr = 180 / Math.PI, Kr = Math.PI / 180, qr = Math.atan2, Jr = 1e8, Yr = /([A-Z])/g, Xr = /(left|right|width|margin|padding|x)/i, Zr = /[\s,\(]\S/, Qr = {
	autoAlpha: "opacity,visibility",
	scale: "scaleX,scaleY",
	alpha: "opacity"
}, $r = function(e, t) {
	return t.set(t.t, t.p, Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, ei = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u, t);
}, ti = function(e, t) {
	return t.set(t.t, t.p, e ? Math.round((t.s + t.c * e) * 1e4) / 1e4 + t.u : t.b, t);
}, ni = function(e, t) {
	var n = t.s + t.c * e;
	t.set(t.t, t.p, ~~(n + (n < 0 ? -.5 : .5)) + t.u, t);
}, ri = function(e, t) {
	return t.set(t.t, t.p, e ? t.e : t.b, t);
}, ii = function(e, t) {
	return t.set(t.t, t.p, e === 1 ? t.e : t.b, t);
}, ai = function(e, t, n) {
	return e.style[t] = n;
}, oi = function(e, t, n) {
	return e.style.setProperty(t, n);
}, si = function(e, t, n) {
	return e._gsap[t] = n;
}, ci = function(e, t, n) {
	return e._gsap.scaleX = e._gsap.scaleY = n;
}, li = function(e, t, n, r, i) {
	var a = e._gsap;
	a.scaleX = a.scaleY = n, a.renderTransform(i, a);
}, ui = function(e, t, n, r, i) {
	var a = e._gsap;
	a[t] = n, a.renderTransform(i, a);
}, di = "transform", fi = di + "Origin", pi = function e(t, n) {
	var r = this, i = this.target, a = i.style, o = i._gsap;
	if (t in Wr && a) {
		if (this.tfm = this.tfm || {}, t !== "transform") t = Qr[t] || t, ~t.indexOf(",") ? t.split(",").forEach(function(e) {
			return r.tfm[e] = ji(i, e);
		}) : this.tfm[t] = o.x ? o[t] : ji(i, t), t === fi && (this.tfm.zOrigin = o.zOrigin);
		else return Qr.transform.split(",").forEach(function(t) {
			return e.call(r, t, n);
		});
		if (this.props.indexOf(di) >= 0) return;
		o.svg && (this.svgo = i.getAttribute("data-svg-origin"), this.props.push(fi, n, "")), t = di;
	}
	(a || n) && this.props.push(t, n, a[t]);
}, mi = function(e) {
	e.translate && (e.removeProperty("translate"), e.removeProperty("scale"), e.removeProperty("rotate"));
}, hi = function() {
	var e = this.props, t = this.target, n = t.style, r = t._gsap, i, a;
	for (i = 0; i < e.length; i += 3) e[i + 1] ? e[i + 1] === 2 ? t[e[i]](e[i + 2]) : t[e[i]] = e[i + 2] : e[i + 2] ? n[e[i]] = e[i + 2] : n.removeProperty(e[i].substr(0, 2) === "--" ? e[i] : e[i].replace(Yr, "-$1").toLowerCase());
	if (this.tfm) {
		for (a in this.tfm) r[a] = this.tfm[a];
		r.svg && (r.renderTransform(), t.setAttribute("data-svg-origin", this.svgo || "")), i = Hr(), (!i || !i.isStart) && !n[di] && (mi(n), r.zOrigin && n[fi] && (n[fi] += " " + r.zOrigin + "px", r.zOrigin = 0, r.renderTransform()), r.uncache = 1);
	}
}, gi = function(e, t) {
	var n = {
		target: e,
		props: [],
		revert: hi,
		save: pi
	};
	return e._gsap || Fr.core.getCache(e), t && e.style && e.nodeType && t.split(",").forEach(function(e) {
		return n.save(e);
	}), n;
}, _i, vi = function(e, t) {
	var n = Lr.createElementNS ? Lr.createElementNS((t || "http://www.w3.org/1999/xhtml").replace(/^https/, "http"), e) : Lr.createElement(e);
	return n && n.style ? n : Lr.createElement(e);
}, yi = function e(t, n, r) {
	var i = getComputedStyle(t);
	return i[n] || i.getPropertyValue(n.replace(Yr, "-$1").toLowerCase()) || i.getPropertyValue(n) || !r && e(t, xi(n) || n, 1) || "";
}, bi = "O,Moz,ms,Ms,Webkit".split(","), xi = function(e, t, n) {
	var r = (t || Br).style, i = 5;
	if (e in r && !n) return e;
	for (e = e.charAt(0).toUpperCase() + e.substr(1); i-- && !(bi[i] + e in r););
	return i < 0 ? null : (i === 3 ? "ms" : i >= 0 ? bi[i] : "") + e;
}, Si = function() {
	Ur() && window.document && (Ir = window, Lr = Ir.document, Rr = Lr.documentElement, Br = vi("div") || { style: {} }, vi("div"), di = xi(di), fi = di + "Origin", Br.style.cssText = "border-width:0;line-height:0;position:absolute;padding:0", _i = !!xi("perspective"), Hr = Fr.core.reverting, zr = 1);
}, Ci = function(e) {
	var t = e.ownerSVGElement, n = vi("svg", t && t.getAttribute("xmlns") || "http://www.w3.org/2000/svg"), r = e.cloneNode(!0), i;
	r.style.display = "block", n.appendChild(r), Rr.appendChild(n);
	try {
		i = r.getBBox();
	} catch {}
	return n.removeChild(r), Rr.removeChild(n), i;
}, wi = function(e, t) {
	for (var n = t.length; n--;) if (e.hasAttribute(t[n])) return e.getAttribute(t[n]);
}, Ti = function(e) {
	var t, n;
	try {
		t = e.getBBox();
	} catch {
		t = Ci(e), n = 1;
	}
	return t && (t.width || t.height) || n || (t = Ci(e)), t && !t.width && !t.x && !t.y ? {
		x: +wi(e, [
			"x",
			"cx",
			"x1"
		]) || 0,
		y: +wi(e, [
			"y",
			"cy",
			"y1"
		]) || 0,
		width: 0,
		height: 0
	} : t;
}, Ei = function(e) {
	return !!(e.getCTM && (!e.parentNode || e.ownerSVGElement) && Ti(e));
}, Di = function(e, t) {
	if (t) {
		var n = e.style, r;
		t in Wr && t !== fi && (t = di), n.removeProperty ? (r = t.substr(0, 2), (r === "ms" || t.substr(0, 6) === "webkit") && (t = "-" + t), n.removeProperty(r === "--" ? t : t.replace(Yr, "-$1").toLowerCase())) : n.removeAttribute(t);
	}
}, Oi = function(e, t, n, r, i, a) {
	var o = new xr(e._pt, t, n, 0, 1, a ? ii : ri);
	return e._pt = o, o.b = r, o.e = i, e._props.push(n), o;
}, ki = {
	deg: 1,
	rad: 1,
	turn: 1
}, W = {
	grid: 1,
	flex: 1
}, Ai = function e(t, n, r, i) {
	var a = parseFloat(r) || 0, o = (r + "").trim().substr((a + "").length) || "px", s = Br.style, c = Xr.test(n), l = t.tagName.toLowerCase() === "svg", u = (l ? "client" : "offset") + (c ? "Width" : "Height"), d = 100, f = i === "px", p = i === "%", m, h, g, _;
	if (i === o || !a || ki[i] || ki[o]) return a;
	if (o !== "px" && !f && (a = e(t, n, r, "px")), _ = t.getCTM && Ei(t), (p || o === "%") && (Wr[n] || ~n.indexOf("adius"))) return m = _ ? t.getBBox()[c ? "width" : "height"] : t[u], at(p ? a / m * d : a / 100 * m);
	if (s[c ? "width" : "height"] = d + (f ? o : i), h = i !== "rem" && ~n.indexOf("adius") || i === "em" && t.appendChild && !l ? t : t.parentNode, _ && (h = (t.ownerSVGElement || {}).parentNode), (!h || h === Lr || !h.appendChild) && (h = Lr.body), g = h._gsap, g && p && g.width && c && g.time === jn.time && !g.uncache) return at(a / g.width * d);
	if (p && (n === "height" || n === "width")) {
		var v = t.style[n];
		t.style[n] = d + i, m = t[u], v ? t.style[n] = v : Di(t, n);
	} else (p || o === "%") && !W[yi(h, "display")] && (s.position = yi(t, "position")), h === t && (s.position = "static"), h.appendChild(Br), m = Br[u], h.removeChild(Br), s.position = "absolute";
	return c && p && (g = nt(h), g.time = jn.time, g.width = h[u]), at(f ? m * a / d : m && a ? d / m * a : 0);
}, ji = function(e, t, n, r) {
	var i;
	return zr || Si(), t in Qr && t !== "transform" && (t = Qr[t], ~t.indexOf(",") && (t = t.split(",")[0])), Wr[t] && t !== "transform" ? (i = Ui(e, r), i = t === "transformOrigin" ? i.svg ? i.origin : Wi(yi(e, fi)) + " " + i.zOrigin + "px" : i[t]) : (i = e.style[t], (!i || i === "auto" || r || ~(i + "").indexOf("calc(")) && (i = Ii[t] && Ii[t](e, t, n) || yi(e, t) || rt(e, t) || +(t === "opacity"))), n && !~(i + "").trim().indexOf(" ") ? Ai(e, t, i, n) + n : i;
}, Mi = function(e, t, n, r) {
	if (!n || n === "none") {
		var i = xi(t, e, 1), a = i && yi(e, i, 1);
		a && a !== n ? (t = i, n = a) : t === "borderColor" && (n = yi(e, "borderTopColor"));
	}
	var o = new xr(this._pt, e.style, t, 0, 1, hr), s = 0, c = 0, l, u, d, f, p, m, h, g, _, v, y, b;
	if (o.b = n, o.e = r, n += "", r += "", r === "auto" && (m = e.style[t], e.style[t] = r, r = yi(e, t) || r, m ? e.style[t] = m : Di(e, t)), l = [n, r], kn(l), n = l[0], r = l[1], d = n.match(Oe) || [], b = r.match(Oe) || [], b.length) {
		for (; u = Oe.exec(r);) h = u[0], _ = r.substring(s, u.index), p ? p = (p + 1) % 5 : (_.substr(-5) === "rgba(" || _.substr(-5) === "hsla(") && (p = 1), h !== (m = d[c++] || "") && (f = parseFloat(m) || 0, y = m.substr((f + "").length), h.charAt(1) === "=" && (h = st(f, h) + y), g = parseFloat(h), v = h.substr((g + "").length), s = Oe.lastIndex - v.length, v || (v = v || ae.units[t] || y, s === r.length && (r += v, o.e += v)), y !== v && (f = Ai(e, t, m, v) || 0), o._pt = {
			_next: o._pt,
			p: _ || c === 1 ? _ : ",",
			s: f,
			c: g - f,
			m: p && p < 4 || t === "zIndex" ? Math.round : 0
		});
		o.c = s < r.length ? r.substring(s, r.length) : "";
	} else o.r = t === "display" && r === "none" ? ii : ri;
	return Ae.test(r) && (o.e = 0), this._pt = o, o;
}, Ni = {
	top: "0%",
	bottom: "100%",
	left: "0%",
	right: "100%",
	center: "50%"
}, Pi = function(e) {
	var t = e.split(" "), n = t[0], r = t[1] || "50%";
	return (n === "top" || n === "bottom" || r === "left" || r === "right") && (e = n, n = r, r = e), t[0] = Ni[n] || n, t[1] = Ni[r] || r, t.join(" ");
}, Fi = function(e, t) {
	if (t.tween && t.tween._time === t.tween._dur) {
		var n = t.t, r = n.style, i = t.u, a = n._gsap, o, s, c;
		if (i === "all" || i === !0) r.cssText = "", s = 1;
		else for (i = i.split(","), c = i.length; --c > -1;) o = i[c], Wr[o] && (s = 1, o = o === "transformOrigin" ? fi : di), Di(n, o);
		s && (Di(n, di), a && (a.svg && n.removeAttribute("transform"), r.scale = r.rotate = r.translate = "none", Ui(n, 1), a.uncache = 1, mi(r)));
	}
}, Ii = { clearProps: function(e, t, n, r, i) {
	if (i.data !== "isFromStart") {
		var a = e._pt = new xr(e._pt, t, n, 0, 0, Fi);
		return a.u = r, a.pr = -10, a.tween = i, e._props.push(n), 1;
	}
} }, Li = [
	1,
	0,
	0,
	1,
	0,
	0
], Ri = {}, zi = function(e) {
	return e === "matrix(1, 0, 0, 1, 0, 0)" || e === "none" || !e;
}, Bi = function(e) {
	var t = yi(e, di);
	return zi(t) ? Li : t.substr(7).match(De).map(at);
}, Vi = function(e, t) {
	var n = e._gsap || nt(e), r = e.style, i = Bi(e), a, o, s, c;
	return n.svg && e.getAttribute("transform") ? (s = e.transform.baseVal.consolidate().matrix, i = [
		s.a,
		s.b,
		s.c,
		s.d,
		s.e,
		s.f
	], i.join(",") === "1,0,0,1,0,0" ? Li : i) : (i === Li && !e.offsetParent && e !== Rr && !n.svg && (s = r.display, r.display = "block", a = e.parentNode, (!a || !e.offsetParent && !e.getBoundingClientRect().width) && (c = 1, o = e.nextElementSibling, Rr.appendChild(e)), i = Bi(e), s ? r.display = s : Di(e, "display"), c && (o ? a.insertBefore(e, o) : a ? a.appendChild(e) : Rr.removeChild(e))), t && i.length > 6 ? [
		i[0],
		i[1],
		i[4],
		i[5],
		i[12],
		i[13]
	] : i);
}, Hi = function(e, t, n, r, i, a) {
	var o = e._gsap, s = i || Vi(e, !0), c = o.xOrigin || 0, l = o.yOrigin || 0, u = o.xOffset || 0, d = o.yOffset || 0, f = s[0], p = s[1], m = s[2], h = s[3], g = s[4], _ = s[5], v = t.split(" "), y = parseFloat(v[0]) || 0, b = parseFloat(v[1]) || 0, x, S, C, w;
	n ? s !== Li && (S = f * h - p * m) && (C = h / S * y + b * (-m / S) + (m * _ - h * g) / S, w = y * (-p / S) + f / S * b - (f * _ - p * g) / S, y = C, b = w) : (x = Ti(e), y = x.x + (~v[0].indexOf("%") ? y / 100 * x.width : y), b = x.y + (~(v[1] || v[0]).indexOf("%") ? b / 100 * x.height : b)), r || r !== !1 && o.smooth ? (g = y - c, _ = b - l, o.xOffset = u + (g * f + _ * m) - g, o.yOffset = d + (g * p + _ * h) - _) : o.xOffset = o.yOffset = 0, o.xOrigin = y, o.yOrigin = b, o.smooth = !!r, o.origin = t, o.originIsAbsolute = !!n, e.style[fi] = "0px 0px", a && (Oi(a, o, "xOrigin", c, y), Oi(a, o, "yOrigin", l, b), Oi(a, o, "xOffset", u, o.xOffset), Oi(a, o, "yOffset", d, o.yOffset)), e.setAttribute("data-svg-origin", y + " " + b);
}, Ui = function(e, t) {
	var n = e._gsap || new Gn(e);
	if ("x" in n && !t && !n.uncache) return n;
	var r = e.style, i = n.scaleX < 0, a = "px", o = "deg", s = getComputedStyle(e), c = yi(e, fi) || "0", l = u = d = m = h = g = _ = v = y = 0, u, d, f = p = 1, p, m, h, g, _, v, y, b, x, S, C, w, T, E, D, O, k, ee, te, A, ne, j, M, N, P, re, ie, F;
	return n.svg = !!(e.getCTM && Ei(e)), s.translate && ((s.translate !== "none" || s.scale !== "none" || s.rotate !== "none") && (r[di] = (s.translate === "none" ? "" : "translate3d(" + (s.translate + " 0 0").split(" ").slice(0, 3).join(", ") + ") ") + (s.rotate === "none" ? "" : "rotate(" + s.rotate + ") ") + (s.scale === "none" ? "" : "scale(" + s.scale.split(" ").join(",") + ") ") + (s[di] === "none" ? "" : s[di])), r.scale = r.rotate = r.translate = "none"), S = Vi(e, n.svg), n.svg && (n.uncache ? (ne = e.getBBox(), c = n.xOrigin - ne.x + "px " + (n.yOrigin - ne.y) + "px", A = "") : A = !t && e.getAttribute("data-svg-origin"), Hi(e, A || c, !!A || n.originIsAbsolute, n.smooth !== !1, S)), b = n.xOrigin || 0, x = n.yOrigin || 0, S !== Li && (E = S[0], D = S[1], O = S[2], k = S[3], l = ee = S[4], u = te = S[5], S.length === 6 ? (f = Math.sqrt(E * E + D * D), p = Math.sqrt(k * k + O * O), m = E || D ? qr(D, E) * Gr : 0, _ = O || k ? qr(O, k) * Gr + m : 0, _ && (p *= Math.abs(Math.cos(_ * Kr))), n.svg && (l -= b - (b * E + x * O), u -= x - (b * D + x * k))) : (F = S[6], re = S[7], M = S[8], N = S[9], P = S[10], ie = S[11], l = S[12], u = S[13], d = S[14], C = qr(F, P), h = C * Gr, C && (w = Math.cos(-C), T = Math.sin(-C), A = ee * w + M * T, ne = te * w + N * T, j = F * w + P * T, M = ee * -T + M * w, N = te * -T + N * w, P = F * -T + P * w, ie = re * -T + ie * w, ee = A, te = ne, F = j), C = qr(-O, P), g = C * Gr, C && (w = Math.cos(-C), T = Math.sin(-C), A = E * w - M * T, ne = D * w - N * T, j = O * w - P * T, ie = k * T + ie * w, E = A, D = ne, O = j), C = qr(D, E), m = C * Gr, C && (w = Math.cos(C), T = Math.sin(C), A = E * w + D * T, ne = ee * w + te * T, D = D * w - E * T, te = te * w - ee * T, E = A, ee = ne), h && Math.abs(h) + Math.abs(m) > 359.9 && (h = m = 0, g = 180 - g), f = at(Math.sqrt(E * E + D * D + O * O)), p = at(Math.sqrt(te * te + F * F)), C = qr(ee, te), _ = Math.abs(C) > 2e-4 ? C * Gr : 0, y = ie ? 1 / (ie < 0 ? -ie : ie) : 0), n.svg && (A = e.getAttribute("transform"), n.forceCSS = e.setAttribute("transform", "") || !zi(yi(e, di)), A && e.setAttribute("transform", A))), Math.abs(_) > 90 && Math.abs(_) < 270 && (i ? (f *= -1, _ += m <= 0 ? 180 : -180, m += m <= 0 ? 180 : -180) : (p *= -1, _ += _ <= 0 ? 180 : -180)), t ||= n.uncache, n.x = l - ((n.xPercent = l && (!t && n.xPercent || (Math.round(e.offsetWidth / 2) === Math.round(-l) ? -50 : 0))) ? e.offsetWidth * n.xPercent / 100 : 0) + a, n.y = u - ((n.yPercent = u && (!t && n.yPercent || (Math.round(e.offsetHeight / 2) === Math.round(-u) ? -50 : 0))) ? e.offsetHeight * n.yPercent / 100 : 0) + a, n.z = d + a, n.scaleX = at(f), n.scaleY = at(p), n.rotation = at(m) + o, n.rotationX = at(h) + o, n.rotationY = at(g) + o, n.skewX = _ + o, n.skewY = v + o, n.transformPerspective = y + a, (n.zOrigin = parseFloat(c.split(" ")[2]) || !t && n.zOrigin || 0) && (r[fi] = Wi(c)), n.xOffset = n.yOffset = 0, n.force3D = ae.force3D, n.renderTransform = n.svg ? Zi : _i ? Xi : Ki, n.uncache = 0, n;
}, Wi = function(e) {
	return (e = e.split(" "))[0] + " " + e[1];
}, Gi = function(e, t, n) {
	var r = qt(t);
	return at(parseFloat(t) + parseFloat(Ai(e, "x", n + "px", r))) + r;
}, Ki = function(e, t) {
	t.z = "0px", t.rotationY = t.rotationX = "0deg", t.force3D = 0, Xi(e, t);
}, qi = "0deg", Ji = "0px", Yi = ") ", Xi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.z, c = n.rotation, l = n.rotationY, u = n.rotationX, d = n.skewX, f = n.skewY, p = n.scaleX, m = n.scaleY, h = n.transformPerspective, g = n.force3D, _ = n.target, v = n.zOrigin, y = "", b = g === "auto" && e && e !== 1 || g === !0;
	if (v && (u !== qi || l !== qi)) {
		var x = parseFloat(l) * Kr, S = Math.sin(x), C = Math.cos(x), w;
		x = parseFloat(u) * Kr, w = Math.cos(x), a = Gi(_, a, S * w * -v), o = Gi(_, o, -Math.sin(x) * -v), s = Gi(_, s, C * w * -v + v);
	}
	h !== Ji && (y += "perspective(" + h + Yi), (r || i) && (y += "translate(" + r + "%, " + i + "%) "), (b || a !== Ji || o !== Ji || s !== Ji) && (y += s !== Ji || b ? "translate3d(" + a + ", " + o + ", " + s + ") " : "translate(" + a + ", " + o + Yi), c !== qi && (y += "rotate(" + c + Yi), l !== qi && (y += "rotateY(" + l + Yi), u !== qi && (y += "rotateX(" + u + Yi), (d !== qi || f !== qi) && (y += "skew(" + d + ", " + f + Yi), (p !== 1 || m !== 1) && (y += "scale(" + p + ", " + m + Yi), _.style[di] = y || "translate(0, 0)";
}, Zi = function(e, t) {
	var n = t || this, r = n.xPercent, i = n.yPercent, a = n.x, o = n.y, s = n.rotation, c = n.skewX, l = n.skewY, u = n.scaleX, d = n.scaleY, f = n.target, p = n.xOrigin, m = n.yOrigin, h = n.xOffset, g = n.yOffset, _ = n.forceCSS, v = parseFloat(a), y = parseFloat(o), b, x, S, C, w;
	s = parseFloat(s), c = parseFloat(c), l = parseFloat(l), l && (l = parseFloat(l), c += l, s += l), s || c ? (s *= Kr, c *= Kr, b = Math.cos(s) * u, x = Math.sin(s) * u, S = Math.sin(s - c) * -d, C = Math.cos(s - c) * d, c && (l *= Kr, w = Math.tan(c - l), w = Math.sqrt(1 + w * w), S *= w, C *= w, l && (w = Math.tan(l), w = Math.sqrt(1 + w * w), b *= w, x *= w)), b = at(b), x = at(x), S = at(S), C = at(C)) : (b = u, C = d, x = S = 0), (v && !~(a + "").indexOf("px") || y && !~(o + "").indexOf("px")) && (v = Ai(f, "x", a, "px"), y = Ai(f, "y", o, "px")), (p || m || h || g) && (v = at(v + p - (p * b + m * S) + h), y = at(y + m - (p * x + m * C) + g)), (r || i) && (w = f.getBBox(), v = at(v + r / 100 * w.width), y = at(y + i / 100 * w.height)), w = "matrix(" + b + "," + x + "," + S + "," + C + "," + v + "," + y + ")", f.setAttribute("transform", w), _ && (f.style[di] = w);
}, Qi = function(e, t, n, r, i) {
	var a = 360, o = ge(i), s = parseFloat(i) * (o && ~i.indexOf("rad") ? Gr : 1) - r, c = r + s + "deg", l, u;
	return o && (l = i.split("_")[1], l === "short" && (s %= a, s !== s % (a / 2) && (s += s < 0 ? a : -a)), l === "cw" && s < 0 ? s = (s + a * Jr) % a - ~~(s / a) * a : l === "ccw" && s > 0 && (s = (s - a * Jr) % a - ~~(s / a) * a)), e._pt = u = new xr(e._pt, t, n, r, s, ei), u.e = c, u.u = "deg", e._props.push(n), u;
}, $i = function(e, t) {
	for (var n in t) e[n] = t[n];
	return e;
}, ea = function(e, t, n) {
	var r = $i({}, n._gsap), i = "perspective,force3D,transformOrigin,svgOrigin", a = n.style, o, s, c, l, u, d, f, p;
	for (s in r.svg ? (c = n.getAttribute("transform"), n.setAttribute("transform", ""), a[di] = t, o = Ui(n, 1), Di(n, di), n.setAttribute("transform", c)) : (c = getComputedStyle(n)[di], a[di] = t, o = Ui(n, 1), a[di] = c), Wr) c = r[s], l = o[s], c !== l && i.indexOf(s) < 0 && (f = qt(c), p = qt(l), u = f === p ? parseFloat(c) : Ai(n, s, c, p), d = parseFloat(l), e._pt = new xr(e._pt, o, s, u, d - u, $r), e._pt.u = p || 0, e._props.push(s));
	$i(o, r);
};
it("padding,margin,Width,Radius", function(e, t) {
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
	Ii[t > 1 ? "border" + e : e] = function(e, t, n, r, i) {
		var a, s;
		if (arguments.length < 4) return a = o.map(function(t) {
			return ji(e, t, n);
		}), s = a.join(" "), s.split(a[0]).length === 5 ? a[0] : s;
		a = (r + "").split(" "), s = {}, o.forEach(function(e, t) {
			return s[e] = a[t] = a[t] || a[(t - 1) / 2 | 0];
		}), e.init(t, s, i);
	};
});
var ta = {
	name: "css",
	register: Si,
	targetTest: function(e) {
		return e.style && e.nodeType;
	},
	init: function(e, t, n, r, i) {
		var a = this._props, o = e.style, s = n.vars.startAt, c, l, u, d, f, p, m, h, g, _, v, y, b, x, S, C;
		for (m in zr || Si(), this.styles = this.styles || gi(e), C = this.styles.props, this.tween = n, t) if (m !== "autoRound" && (l = t[m], !(Xe[m] && Zn(m, t, n, r, e, i)))) {
			if (f = typeof l, p = Ii[m], f === "function" && (l = l.call(n, r, e, i), f = typeof l), f === "string" && ~l.indexOf("random(") && (l = fn(l)), p) p(this, e, m, l, n) && (S = 1);
			else if (m.substr(0, 2) === "--") c = (getComputedStyle(e).getPropertyValue(m) + "").trim(), l += "", Dn.lastIndex = 0, Dn.test(c) || (h = qt(c), g = qt(l)), g ? h !== g && (c = Ai(e, m, c, g) + g) : h && (l += h), this.add(o, "setProperty", c, l, r, i, 0, 0, m), a.push(m), C.push(m, 0, o[m]);
			else if (f !== "undefined") {
				if (s && m in s ? (c = typeof s[m] == "function" ? s[m].call(n, r, e, i) : s[m], ge(c) && ~c.indexOf("random(") && (c = fn(c)), qt(c + "") || c === "auto" || (c += ae.units[m] || qt(ji(e, m)) || ""), (c + "").charAt(1) === "=" && (c = ji(e, m))) : c = ji(e, m), d = parseFloat(c), _ = f === "string" && l.charAt(1) === "=" && l.substr(0, 2), _ && (l = l.substr(2)), u = parseFloat(l), m in Qr && (m === "autoAlpha" && (d === 1 && ji(e, "visibility") === "hidden" && u && (d = 0), C.push("visibility", 0, o.visibility), Oi(this, o, "visibility", d ? "inherit" : "hidden", u ? "inherit" : "hidden", !u)), m !== "scale" && m !== "transform" && (m = Qr[m], ~m.indexOf(",") && (m = m.split(",")[0]))), v = m in Wr, v) {
					if (this.styles.save(m), y || (b = e._gsap, b.renderTransform && !t.parseTransform || Ui(e, t.parseTransform), x = t.smoothOrigin !== !1 && b.smooth, y = this._pt = new xr(this._pt, o, di, 0, 1, b.renderTransform, b, 0, -1), y.dep = 1), m === "scale") this._pt = new xr(this._pt, b, "scaleY", b.scaleY, (_ ? st(b.scaleY, _ + u) : u) - b.scaleY || 0, $r), this._pt.u = 0, a.push("scaleY", m), m += "X";
					else if (m === "transformOrigin") {
						C.push(fi, 0, o[fi]), l = Pi(l), b.svg ? Hi(e, l, 0, x, 0, this) : (g = parseFloat(l.split(" ")[2]) || 0, g !== b.zOrigin && Oi(this, b, "zOrigin", b.zOrigin, g), Oi(this, o, m, Wi(c), Wi(l)));
						continue;
					} else if (m === "svgOrigin") {
						Hi(e, l, 1, x, 0, this);
						continue;
					} else if (m in Ri) {
						Qi(this, b, m, d, _ ? st(d, _ + l) : l);
						continue;
					} else if (m === "smoothOrigin") {
						Oi(this, b, "smooth", b.smooth, l);
						continue;
					} else if (m === "force3D") {
						b[m] = l;
						continue;
					} else if (m === "transform") {
						ea(this, l, e);
						continue;
					}
				} else m in o || (m = xi(m) || m);
				if (v || (u || u === 0) && (d || d === 0) && !Zr.test(l) && m in o) h = (c + "").substr((d + "").length), u ||= 0, g = qt(l) || (m in ae.units ? ae.units[m] : h), h !== g && (d = Ai(e, m, c, g)), this._pt = new xr(this._pt, v ? b : o, m, d, (_ ? st(d, _ + u) : u) - d, !v && (g === "px" || m === "zIndex") && t.autoRound !== !1 ? ni : $r), this._pt.u = g || 0, h !== g && g !== "%" && (this._pt.b = c, this._pt.r = ti);
				else if (m in o) Mi.call(this, e, m, c, _ ? _ + l : l);
				else if (m in e) this.add(e, m, c || e[m], _ ? _ + l : l, r, i);
				else if (m !== "parseTransform") {
					ze(m, l);
					continue;
				}
				v || (m in o ? C.push(m, 0, o[m]) : typeof e[m] == "function" ? C.push(m, 2, e[m]()) : C.push(m, 1, c || e[m])), a.push(m);
			}
		}
		S && br(this);
	},
	render: function(e, t) {
		if (t.tween._time || !Hr()) for (var n = t._pt; n;) n.r(e, n.d), n = n._next;
		else t.styles.revert();
	},
	get: ji,
	aliases: Qr,
	getSetter: function(e, t, n) {
		var r = Qr[t];
		return r && r.indexOf(",") < 0 && (t = r), t in Wr && t !== fi && (e._gsap.x || ji(e, "x")) ? n && Vr === n ? t === "scale" ? ci : si : (Vr = n || {}) && (t === "scale" ? li : ui) : e.style && !ye(e.style[t]) ? ai : ~t.indexOf("-") ? oi : fr(e, t);
	},
	core: {
		_removeProperty: Di,
		_getMatrix: Vi
	}
};
Fr.utils.checkPrefix = xi, Fr.core.getStyleSaver = gi, (function(e, t, n, r) {
	var i = it(e + "," + t + "," + n, function(e) {
		Wr[e] = 1;
	});
	it(t, function(e) {
		ae.units[e] = "deg", Ri[e] = 1;
	}), Qr[i[13]] = e + "," + t, it(r, function(e) {
		var t = e.split(":");
		Qr[t[1]] = i[t[0]];
	});
})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent", "rotation,rotationX,rotationY,skewX,skewY", "transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective", "0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY"), it("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective", function(e) {
	ae.units[e] = "px";
}), Fr.registerPlugin(ta);
//#endregion
//#region node_modules/gsap/index.js
var G = Fr.registerPlugin(ta) || Fr;
G.core.Tween;
//#endregion
//#region src/table/animations/flip.ts
function na(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function ra(e) {
	return {
		x: e.left + e.width / 2,
		y: e.top + e.height / 2
	};
}
function ia(e, t) {
	let n = ra(e), r = ra(t);
	return {
		x: n.x - r.x,
		y: n.y - r.y
	};
}
function aa(e, t) {
	let n = ia(t, e);
	return {
		x: n.x,
		y: n.y
	};
}
function oa(e) {
	typeof window > "u" || ((e instanceof HTMLElement ? e : null) ?? document.querySelector(".btable-wrap") ?? document.querySelector(".btable-session"))?.setAttribute("data-gsap-motion", "true");
}
//#endregion
//#region src/table/discardPileModel.ts
function sa(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function ca(e, t) {
	return (e >>> t & 65535) / 65535;
}
function la(e, t) {
	let n = sa(`${e}@${t}`), r = ca(n, 0), i = ca(n, 7), a = ca(n, 14), o = ca(n, 21), s = r >= .5 ? 1 : -1, c = i >= .5 ? 1 : -1, l = a >= .5 ? 1 : -1;
	return {
		offsetX: s * (12 + r * 6),
		offsetY: c * (12 + i * 6),
		rotation: l * (7 + a * 2),
		scale: .94 + o * .04,
		zIndex: t + 1
	};
}
function ua(e) {
	let t = la(e.id, e.pileIndex);
	return {
		...e,
		...t
	};
}
function da(e) {
	let t = [];
	for (let n = 0; n < e.discardCount; n++) {
		let r = e.heroCardKeys?.[n];
		t.push(r ?? `${e.playerId}:h${e.handNumber}:d${e.pileStartIndex + n}`);
	}
	return t;
}
//#endregion
//#region src/table/animations/discardPileMotion.ts
var fa = /* @__PURE__ */ new Set(), pa = re.drawDiscard;
function ma(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function ha(e = document) {
	let t = (e instanceof Document ? e : e.ownerDocument ?? document).querySelector("[data-discard-pile-anchor]");
	return t ? na(t) : null;
}
function ga() {
	for (let e of fa) e.kill();
	fa.clear();
}
function _a(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function va(e, t, n, r = {}) {
	oa(r.root ?? document);
	let i = I(), a = ha(r.root ?? document), o = F(pa, i), s = i ? .03 : .055, c = G.timeline({ onComplete: () => {
		fa.delete(c), r.onComplete?.();
	} });
	fa.add(c), e.forEach((e, l) => {
		let u = la(t[l] ?? `discard-${n + l}`, n + l), d = na(e);
		if (G.set(e, {
			transformOrigin: "50% 50%",
			willChange: "transform,opacity",
			zIndex: 4
		}), !a || i) {
			c.to(e, {
				opacity: 0,
				scale: u.scale,
				duration: Math.min(o, .2),
				onComplete: () => {
					G.set(e, { clearProps: "transform,opacity,willChange,zIndex" }), r.onCardComplete?.(l);
				}
			}, l * s);
			return;
		}
		let f = a.left + a.width / 2 + u.offsetX, p = a.top + a.height / 2 + u.offsetY, m = d.left + d.width / 2, h = d.top + d.height / 2, g = f - m, _ = p - h, { midX: v, midY: y } = ma(g, _);
		G.set(e, {
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
				G.set(e, { clearProps: "transform,opacity,willChange,zIndex" }), r.onCardComplete?.(l);
			}
		}, l * s);
	});
	let l = Math.round((e.length > 0 ? (e.length - 1) * s : 0) * 1e3 + o * 1e3 + 40);
	return _a(c, Math.min(420, Math.max(280, l))), c;
}
function ya(e, t, n, r, i = {}) {
	let a = [];
	for (let t = 0; t < e.length; t++) {
		let n = e[t], i = document.createElement("div");
		i.className = "discard-fly-ghost", i.setAttribute("aria-hidden", "true"), i.style.position = "fixed", i.style.left = `${n.left}px`, i.style.top = `${n.top}px`, i.style.width = `${n.width}px`, i.style.height = `${n.height}px`, i.style.pointerEvents = "none", i.style.zIndex = "4", r.appendChild(i), a.push(i);
	}
	let o = va(a, t, n, {
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
function ba(e, t, n) {
	let r = n.querySelector(`[data-seat-play-origin="${e}"]`) ?? n.querySelector(`[data-trick-play-origin="${e}"]`);
	if (!r) return [];
	let i = na(r);
	return Array.from({ length: t }, (e, t) => ({
		...i,
		left: i.left + t * 3,
		top: i.top - t * 2
	}));
}
//#endregion
//#region src/table/animations/cardMotion.ts
function xa() {
	oa();
}
var Sa = /* @__PURE__ */ new WeakMap();
function Ca(e = document) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = t.querySelector("[data-testid=\"deal-button\"]") ?? t.querySelector(".deck-stack__pile") ?? t.querySelector(".deck-stack");
	return n ? na(n) : null;
}
function wa(e, t) {
	return Sa.get(e)?.kill(), Sa.set(e, t), t;
}
function Ta(e) {
	e && (Sa.get(e)?.kill(), Sa.delete(e), G.killTweensOf(e), G.set(e, { clearProps: "transform,opacity,filter" }));
}
function Ea(e, t, n = .22) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * n)
	};
}
function Da(e, t, n = re.dealStagger) {
	xa();
	let r = I(), i = G.timeline(), a = F(re.deal, r);
	return e.forEach((e, o) => {
		let { x: s, y: c } = aa(na(e), t), { midX: l, midY: u } = Ea(s, c, .28);
		G.set(e, {
			transformOrigin: "50% 80%",
			willChange: "transform,opacity"
		}), G.set(e, {
			x: s,
			y: c,
			rotation: -14 + o * 2,
			rotationY: r ? 0 : -72,
			scale: .58,
			opacity: +!!r
		});
		let d = o * (r ? .04 : n), f = () => {
			G.set(e, { clearProps: "transform,opacity,willChange" });
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
function Oa(e, t) {
	xa();
	let n = I(), r = G.timeline(), i = F(re.drawReceive, n), a = n ? .04 : re.drawReceiveStagger;
	return e.forEach((e, n) => {
		let { x: o, y: s } = aa(na(e), t);
		G.set(e, {
			transformOrigin: "50% 80%",
			willChange: "transform,opacity"
		}), G.set(e, {
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
				G.set(e, { clearProps: "transform,opacity,willChange" });
			}
		}, n * a);
	}), r;
}
function ka(e) {
	xa();
	let t = G.timeline(), n = F(re.standPat);
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
				G.set(e, { clearProps: "transform,willChange" });
			}
		}, 0);
	}), t;
}
function Aa(e) {
	xa();
	let t = G.timeline(), n = F(re.foldOut);
	return e.forEach((e, r) => {
		G.set(e, {
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
			onComplete: () => Ta(e)
		}, r * .04);
	}), t;
}
function ja(e) {
	xa();
	let t = F(.32);
	return G.set(e, {
		transformOrigin: "50% 90%",
		willChange: "transform"
	}), wa(e, G.to(e, {
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
var Ma = /* @__PURE__ */ new Set();
function Na(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(24, Math.hypot(e, t) * .2)
	};
}
function Pa() {
	for (let e of Ma) e.kill();
	Ma.clear();
}
function Fa(e) {
	let t = document.createElement("div");
	return t.className = "draw-receive-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function Ia(e, t, n, r = {}) {
	oa(n);
	let i = I(), a = F(re.drawReceive, i), o = i ? .04 : re.drawReceiveStagger, s = [];
	for (let r = 0; r < t.length; r++) {
		let t = Fa(e);
		n.appendChild(t), s.push(t);
	}
	let c = G.timeline({ onComplete: () => {
		for (let e of s) e.remove();
		Ma.delete(c), window.clearTimeout(u), r.onComplete?.();
	} });
	Ma.add(c);
	let l = Math.round((s.length > 0 ? (s.length - 1) * o : 0) * 1e3 + a * 1e3 + 40), u = window.setTimeout(() => {
		c.progress() < 1 && c.progress(1);
	}, Math.min(680, Math.max(320, l)));
	return c.eventCallback("onInterrupt", () => {
		for (let e of s) e.remove();
		Ma.delete(c), window.clearTimeout(u);
	}), s.forEach((e, n) => {
		let r = t[n], s = na(e), l = r.left + r.width / 2, u = r.top + r.height / 2, d = s.left + s.width / 2, f = s.top + s.height / 2, p = l - d, m = u - f, { midX: h, midY: g } = Na(p, m);
		if (G.set(e, {
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
					G.set(e, { clearProps: "transform,opacity,willChange" });
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
				G.set(e, { clearProps: "transform,opacity,willChange" });
			}
		}, v);
	}), c;
}
function La(e) {
	let { playerId: t, replaceCount: n, root: r, onComplete: i } = e;
	if (n <= 0) {
		i?.();
		return;
	}
	let a = Ca(r), o = ba(t, n, r);
	if (!a || !o.length) {
		i?.();
		return;
	}
	Ia(a, o, r, { onComplete: i });
}
//#endregion
//#region src/table/hooks/useDiscardPileState.ts
function Ra({ handNumber: e, sessionPhase: t }) {
	let [n, r] = (0, l.useState)([]), i = (0, l.useRef)(0), a = (0, l.useRef)(e), o = (0, l.useRef)(t ?? null);
	return (0, l.useEffect)(() => {
		a.current !== e && (a.current = e, i.current = 0, ga(), Pa(), r([]));
	}, [e]), (0, l.useEffect)(() => {
		let e = t ?? null, n = o.current;
		o.current = e, n === "draw" && e === "play" && (ga(), Pa(), r([]));
	}, [t]), {
		cards: n,
		pileIndexRef: i,
		commitDiscardCards: (0, l.useCallback)((t) => {
			if (!t.length) return;
			let n = t.map((t) => ua({
				id: t.id,
				playerId: t.playerId,
				handNumber: e,
				pileIndex: i.current++
			}));
			r((e) => [...e, ...n]);
		}, [e])
	};
}
function za({ cardElements: e, cardKeys: t, playerId: n, pileStartIndex: r, root: i, onComplete: a }) {
	let o = [];
	va(e, t, r, {
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
function Ba({ playerId: e, handNumber: t, discardCount: n, pileStartIndex: r, root: i, onComplete: a }) {
	let o = da({
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
	let s = ba(e, n, i);
	if (!s.length) {
		a(o.map((t) => ({
			id: t,
			playerId: e
		})));
		return;
	}
	ya(s, o, r, i, { onComplete: () => a(o.map((t) => ({
		id: t,
		playerId: e
	}))) });
}
function Va(e, t) {
	return t.map((t) => {
		let n = e[t];
		return n ? `${n.rank}-${n.suit}` : `idx-${t}`;
	});
}
function Ha(e, t) {
	if (!e) return [];
	let n = [...e.querySelectorAll(".hand__slot .pcard")];
	return t.length > 0 ? t.map((e) => n[e]).filter((e) => !!e) : [...e.querySelectorAll(".hand__slot--draw-selected .pcard, .hand__slot--draw-recommended .pcard")];
}
//#endregion
//#region src/table/animations/useHeroCardMotion.ts
function Ua(e) {
	return `${e.rank}-${e.suit}`;
}
function Wa(e) {
	return e ? [...e.querySelectorAll(".hand__slot .pcard")] : [];
}
function Ga(e, { dealing: t, dealStaggerMs: n, drawAnimSubPhase: r, drawDiscardCount: i = 0, drawReplaceCount: a = 0, pendingDiscardIndices: o, standPatPulse: s, foldOutPulse: c, playingIndex: u, cards: d, handNumber: f = 0, playerId: p = null, tableRootRef: m, pileIndexRef: h, onDiscardCommitted: g, skipHeroDealMotion: _ = !1 }) {
	let v = (0, l.useRef)([]), y = (0, l.useRef)(!1), b = (0, l.useRef)(null), x = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		oa(e.current?.closest(".btable-wrap") ?? document);
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
		let r = e.current, i = Wa(r);
		if (!i.length) return;
		y.current = !0;
		let a = Ca(r ?? document);
		a && Da(i, a, Math.max(.04, n / 1e3));
	}, [
		t,
		d.length,
		n,
		e,
		_
	]), (0, l.useLayoutEffect)(() => {
		if (r === "discard") {
			if (i <= 0) return;
			v.current = d.map(Ua);
			let t = e.current, n = m?.current ?? t?.closest(".btable-wrap"), r = Ha(t, o);
			if (!r.length || !n || !p) return;
			let a = `${f}:${p}:discard:${r.length}:${o.join(",")}`;
			if (x.current === a) return;
			x.current = a, za({
				cardElements: r,
				cardKeys: Va(d, o.length ? o : r.map((e, t) => t)),
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
			let t = e.current, n = Wa(t), r = new Set(v.current), i = d.map((e, t) => ({
				key: Ua(e),
				el: n[t]
			})).filter((e) => !!e.el && !r.has(e.key)).map((e) => e.el), o = Ca(t ?? document);
			i.length && o && Oa(i, o);
			return;
		}
		(r === "done" || r === null) && (x.current = null, v.current = d.map(Ua));
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
		let t = Wa(e.current);
		t.length && ka(t);
	}, [s, e]), (0, l.useLayoutEffect)(() => {
		if (!c) return;
		let t = Wa(e.current);
		t.length && Aa(t);
	}, [c, e]), (0, l.useLayoutEffect)(() => {
		let t = e.current, n = Wa(t);
		if (u === null) {
			if (b.current !== null) {
				let e = n[b.current];
				e && Ta(e), b.current = null;
			}
			return;
		}
		if (b.current === u) return;
		if (b.current !== null) {
			let e = n[b.current];
			e && Ta(e);
		}
		let r = n[u];
		r && (ja(r), b.current = u);
	}, [
		u,
		d,
		e
	]), (0, l.useLayoutEffect)(() => () => {
		for (let t of Wa(e.current)) Ta(t);
	}, [e]);
}
function Ka(e, t) {
	let n = t / 1e3, r = Math.max(e - 1, 0) * n;
	return Math.round((r + re.deal) * 1e3);
}
//#endregion
//#region src/table/handUi.ts
function qa(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function Ja(e, t) {
	if (t) return "Join hand";
	switch (e) {
		case "reveal": return "Deal";
		case "decision": return "Join hand";
		case "draw": return "Draw";
		case "play": return "Play card";
		default: return "Waiting";
	}
}
function Ya(e, t) {
	return t || e === "decision" ? "Tap I'm in or Pass at your seat" : e === "draw" ? "Choose cards to discard, then tap Draw" : e === "play" ? "Tap a card to play" : null;
}
function Xa(e) {
	return e.handComplete ? "Hand result — next hand coming up" : !e.cardsDealt && !e.enrollmentActive || e.isMyTurn ? null : e.enrollmentActive || e.phase === "decision" || e.phase === "draw" || e.phase === "play" || e.phase === "reveal" ? "Waiting for other players" : null;
}
function Za(e) {
	return {
		spades: "Spades",
		hearts: "Hearts",
		diamonds: "Diamonds",
		clubs: "Clubs"
	}[e ?? ""] ?? e ?? "—";
}
function Qa(e) {
	return e === "reveal" || e === "decision" || e === "draw" || e === "play";
}
function $a(e) {
	return e === "decision";
}
function eo(e) {
	return e === "reveal";
}
function to(e, t) {
	if (!e) return null;
	let n = t.find((t) => t.playerId === e);
	return n ? n.isSelf ? "Your turn" : `${n.displayName}'s turn` : null;
}
//#endregion
//#region src/table/trickPlayFly.ts
var no = /* @__PURE__ */ new Map(), ro = /* @__PURE__ */ new Map();
function io(e) {
	return `${e.playerId}:${e.card.rank}:${e.card.suit}`;
}
function ao(e) {
	let t = e.getBoundingClientRect();
	return {
		left: t.left,
		top: t.top,
		width: t.width,
		height: t.height
	};
}
function oo(e) {
	return document.querySelector(`[data-seat-play-origin="${e}"]`);
}
function K(e) {
	let t = oo(e);
	return t ? ao(t) : null;
}
function so(e) {
	return document.querySelector(`[data-trick-play-origin-active="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin-active="${e}"]`) ?? document.querySelector(`[data-trick-play-origin="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin="${e}"]`) ?? oo(e);
}
function co(e) {
	let t = so(e);
	return t ? ao(t) : null;
}
function lo(e) {
	let t = co(e);
	if (t) return ro.set(e, t), t;
	let n = K(e);
	return n ? (ro.set(e, n), n) : null;
}
function uo(e) {
	for (let t of e) lo(t);
}
function fo(e) {
	return ro.get(e);
}
function po(e, t) {
	if (t) {
		let e = no.get(t);
		if (e) return e;
	}
	return fo(e) ?? co(e) ?? K(e) ?? null;
}
function mo(e, t) {
	let n = po(e, t);
	return n && no.set(t, n), n;
}
function ho(e, t, n) {
	let r = document.querySelector("[data-testid=\"hero-hand\"]")?.querySelectorAll(".hand__slot .pcard")[n];
	if (r) {
		let n = ao(r);
		return no.set(t, n), ro.set(e, n), n;
	}
	return mo(e, t);
}
function go(e, t, n) {
	let r = e.left + e.width / 2, i = e.top + e.height / 2, a = n.left + n.width / 2, o = n.top + n.height / 2;
	return {
		dx: r - a,
		dy: i - o
	};
}
function _o() {
	no.clear(), ro.clear();
}
//#endregion
//#region src/table/tableMicrointeractions.ts
var vo = {
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
}, yo = {
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
function bo(e) {
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
function xo(e, t) {
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
var So = "nbl-best-play";
function Co() {
	try {
		return localStorage.getItem(So) === "1";
	} catch {
		return !1;
	}
}
function wo(e) {
	try {
		localStorage.setItem(So, e ? "1" : "0");
	} catch {}
}
//#endregion
//#region src/game/playerOrder.ts
function To(e, t) {
	let n = [...t];
	if (!e || !n.includes(e)) return n;
	let r = n.indexOf(e);
	return [...n.slice(r + 1), ...n.slice(0, r + 1)];
}
function Eo(e, t, n) {
	let r = To(e, n), i = new Set(t);
	return r.filter((e) => i.has(e));
}
//#endregion
//#region src/game/types.ts
var Do = {
	REVEAL: "reveal",
	DECISION: "decision",
	DRAW: "draw",
	PLAY: "play"
};
function Oo(e) {
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
function ko(e) {
	return e.map((e) => ({
		rank: e.rank,
		suit: e.suit
	}));
}
//#endregion
//#region src/game/playContext.ts
function Ao(e, t) {
	let n = k(e, t);
	return n.length ? n.reduce((e, t) => D(t) >= D(e) ? t : e) : null;
}
function jo(e) {
	if (!e.cinchEnabled) return !1;
	let t = k(e.hand, e.trumpSuit);
	return t.filter((e) => D(e) >= 13).length >= 3 && t.length > 0;
}
function Mo(e, t) {
	let n = Ao(t.hand, t.trumpSuit);
	return n ? e.rank === n.rank && e.suit === n.suit : !1;
}
function No(e) {
	let t = e.currentTrick;
	return t?.plays?.length ? t.plays.map((e) => ko([e.card])[0]) : [];
}
function Po(e) {
	let t = e.currentTrick ?? null, n = No(e), r = n.length === 0;
	return {
		trick: t,
		trickPlays: n,
		isLeading: r,
		leadSuit: r ? null : n[0]?.suit ?? t?.leadSuit ?? e.leadSuit,
		trickIndex: t?.trickNumber ?? 0
	};
}
function Fo(e) {
	let { trickPlays: t, isLeading: n, leadSuit: r } = Po(e.publicHand);
	return {
		hand: e.hand,
		trumpSuit: e.publicHand.trumpSuit,
		leadSuit: r,
		trickPlays: t,
		isLeading: n,
		cinchEnabled: e.publicHand.cinchEnabled === !0
	};
}
function Io(e, t) {
	if (t < 0 || t >= e.hand.length) return {
		allowed: !1,
		reason: "Invalid card selection",
		code: "INVALID_INDEX"
	};
	let n = e.hand[t];
	if (e.isLeading || e.trickPlays.length === 0) return jo(e) && !Mo(n, e) ? {
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
function Lo(e, t, n, r) {
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
function Ro(e, t, n) {
	let r = e.filter((e) => !O(e, n) && e.suit === t);
	return r.length ? r.reduce((e, t) => D(t) > D(e) ? t : e) : null;
}
function zo(e, t) {
	let n = e.filter((e) => O(e, t));
	return n.length ? n.reduce((e, t) => D(t) > D(e) ? t : e) : null;
}
function Bo(e, t) {
	return D(e) > D(t);
}
function Vo(e) {
	return {
		hand: e.hand,
		trumpSuit: e.trumpSuit,
		leadSuit: e.leadSuit,
		trickPlays: e.trickPlays,
		isLeading: e.isLeading,
		cinchEnabled: e.cinchEnabled
	};
}
function Ho(e, t = {}) {
	let n = Vo(e);
	if (!n.hand.length) return [];
	if (n.isLeading || n.trickPlays.length === 0) {
		let e = [];
		for (let r = 0; r < n.hand.length; r += 1) {
			let i = Io(n, r);
			i.allowed ? e.push(r) : Lo(t, n, r, i);
		}
		return e;
	}
	let r = n.leadSuit ?? n.trickPlays[0]?.suit, i = r ? k(n.hand, r) : [], a = k(n.hand, n.trumpSuit), o = r ? Ro(n.trickPlays, r, n.trumpSuit) : null, s = zo(n.trickPlays, n.trumpSuit), c;
	if (i.length > 0) {
		if (c = i, !s && o) {
			let e = i.filter((e) => Bo(e, o));
			e.length && (c = e);
		}
	} else if (a.length > 0) {
		if (c = a, s) {
			let e = a.filter((e) => Bo(e, s));
			e.length && (c = e);
		}
	} else c = [...n.hand];
	let l = [];
	for (let e = 0; e < n.hand.length; e += 1) c.some((t) => t.rank === n.hand[e].rank && t.suit === n.hand[e].suit) && l.push(e);
	return l;
}
//#endregion
//#region src/game/trick.ts
function Uo(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => O(e.card, n));
	if (r.length) return r.reduce((e, t) => D(t.card) > D(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => D(t.card) > D(e.card) ? t : e).playerId;
}
//#endregion
//#region src/game/play.ts
function Wo(e, t, n, r = Infinity) {
	let i = Math.min(n, Math.max(0, r));
	return i <= 0 ? [] : e.map((e, n) => ({
		card: e,
		index: n,
		value: D(e),
		trump: O(e, t)
	})).sort((e, t) => e.trump === t.trump ? e.value - t.value : e.trump ? 1 : -1).slice(0, i).map((e) => e.index);
}
function Go(e, t) {
	let n = Ho(t);
	if (!n.length) return 0;
	if (t.isLeading || !t.trickPlays.length) return n.reduce((t, n) => D(e[n]) > D(e[t]) ? n : t);
	let r = t.leadSuit ?? t.trickPlays[0]?.suit;
	if (!r) return n.reduce((t, n) => D(e[n]) < D(e[t]) ? n : t);
	let i = n.filter((n) => Uo([...t.trickPlays.map((e, t) => ({
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
function Ko(e, t) {
	return e === t ? null : t;
}
function qo(e, t) {
	return t ? t.includes(e) : !0;
}
function Jo(e, t, n) {
	if (!n?.length || !e.length) return null;
	let r = Go(e, Fo({
		hand: e,
		publicHand: t
	}));
	return n.includes(r) ? r : n[0] ?? null;
}
function Yo(e, t, n, r = Infinity, i = []) {
	if (!e.length || n <= 0) return [];
	let a = new Set(i), o = e.map((e, t) => t).filter((e) => !a.has(e)).filter((n) => !O(e[n], t)).filter((t) => e[t].rank !== "A");
	return o.length ? Wo(o.map((t) => e[t]), t, n, r).map((e) => o[e]) : [];
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
var Yc = (0, l.memo)(function({ cards: e, phase: t, enrollmentActive: n = !1, isInHand: r = !1, isDealer: i = !1, signedIn: a = !1, isMyTurn: o = !1, drawCompleted: s = !1, maxDrawDiscards: c = 4, legalPlayIndices: u, recommendedPlayIndex: d = null, recommendedDiscardIndices: f = [], handComplete: p = !1, actionFeedback: m, onSubmitDraw: h, onPassDraw: g, onFoldDraw: _, onPlayCard: v, privateHandReady: y = !1, className: b = "", dealStaggerMs: x = 120, drawAnimSubPhase: S = null, drawDiscardCount: w = 0, drawReplaceCount: T = 0, currentUserId: E = null, revealedTrumpIndex: D = null, trumpMergeActive: O = !1, trumpDisabledIndex: k = null, handNumber: ee = 0, tableRootRef: te, pileIndexRef: A, onDiscardCommitted: ne, onUserActivity: M, skipHeroDealMotion: N = !1 }) {
	let { settings: P } = Hc(), [re, ie] = (0, l.useState)(/* @__PURE__ */ new Set()), [F, I] = (0, l.useState)(null), [L, R] = (0, l.useState)(null), [ae, oe] = (0, l.useState)(null), [se, ce] = (0, l.useState)(!1), [z, le] = (0, l.useState)(null), [B, ue] = (0, l.useState)(null), [de, fe] = (0, l.useState)(null), [pe, me] = (0, l.useState)(() => Co()), [he, ge] = (0, l.useState)(!1), [_e, ve] = (0, l.useState)(!1), [ye, be] = (0, l.useState)(!1), [xe, Se] = (0, l.useState)([]), Ce = (0, l.useRef)(/* @__PURE__ */ new Set()), we = (0, l.useRef)(null), Te = (0, l.useRef)(!1), Ee = (0, l.useRef)(null), De = (0, l.useRef)(null), Oe = (0, l.useRef)(!1), [ke, Ae] = (0, l.useState)(!1), je = (0, l.useRef)(async () => {}), Me = Qa(t), V = (0, l.useMemo)(() => e.map(qa), [e]), Ne = (0, l.useMemo)(() => e.map((e) => `${e.rank}-${e.suit}`).join("|"), [e]), Pe = (0, l.useMemo)(() => f.slice().sort((e, t) => e - t).join(","), [f]), Fe = t === "draw", H = t === "play", Ie = (0, l.useCallback)((e, t) => D === t ? O ? "hand__slot--trump-merge-target" : "hand__slot--trump-revealed" : "", [D, O]);
	(0, l.useEffect)(() => {
		if (N || !Me || e.length === 0) return;
		let t = new Set(e.map((e) => `${e.rank}-${e.suit}`)), n = Ce.current, r = [...t].some((e) => !n.has(e));
		if (Ce.current = t, !r || n.size > 0) return;
		ge(!0), R(null), I(null);
		let i = Ka(e.length, x), a = window.setTimeout(() => ge(!1), i);
		return () => window.clearTimeout(a);
	}, [
		e,
		Me,
		x,
		N
	]), (0, l.useEffect)(() => {
		(S === "done" || S === null) && Se([]);
	}, [S]), Ga(we, {
		dealing: he,
		dealStaggerMs: x,
		drawAnimSubPhase: S,
		drawDiscardCount: w,
		drawReplaceCount: T,
		pendingDiscardIndices: xe,
		standPatPulse: _e,
		foldOutPulse: ye,
		playingIndex: L,
		cards: e,
		handNumber: ee,
		playerId: E,
		tableRootRef: te,
		pileIndexRef: A,
		onDiscardCommitted: ne,
		skipHeroDealMotion: N
	});
	let Le = (0, l.useCallback)(() => {
		Ee.current != null && (window.clearTimeout(Ee.current), Ee.current = null), De.current = null, Oe.current = !1;
	}, []), Re = (0, l.useCallback)((e) => {
		if (!E) return;
		let t = V[e];
		t && ho(E, io({
			playerId: E,
			card: {
				rank: String(t.rank),
				suit: String(t.suit)
			}
		}), e);
	}, [E, V]), ze = (0, l.useCallback)((e, t) => {
		Le(), De.current = e, Oe.current = t;
		let n = t ? vo.turnHandoff : vo.autoPlayPreselect;
		Wc(t ? "preselectEffect:armTurnHandoff" : "preselectEffect:armTimer", {
			index: e,
			delay: n
		}), Ee.current = window.setTimeout(() => {
			Ee.current = null;
			let t = De.current;
			De.current = null, Oe.current = !1, Wc("preselectEffect:timerFire", {
				pending: t,
				index: e
			}), t === e && !Te.current && je.current(t);
		}, n);
	}, [Le]);
	(0, l.useEffect)(() => () => Le(), [Le]), (0, l.useEffect)(() => {
		Le(), I(null), ie(/* @__PURE__ */ new Set()), Ae(!1), oe(null), ue(null), fe(null), le(null);
	}, [
		t,
		Ne,
		Le
	]), (0, l.useEffect)(() => {
		F !== null && (qo(F, u) || (I(null), De.current = null, Le()));
	}, [
		u,
		F,
		Le
	]);
	let Be = se || m?.status === "loading" || L !== null;
	(0, l.useEffect)(() => {
		!pe || !Fe || s || ke || ie(new Set(f));
	}, [
		pe,
		Fe,
		s,
		ke,
		Pe,
		f
	]), (0, l.useEffect)(() => {
		if (!(!H || !o || F === null || Te.current || Be)) {
			if (!qo(F, u)) {
				I(null), De.current = null;
				return;
			}
			Ee.current ?? (Re(F), ze(F, Oe.current));
		}
	}, [
		H,
		o,
		F,
		u,
		Be,
		ze,
		Re
	]), (0, l.useEffect)(() => {
		(m?.status === "success" || m?.status === "error") && (R(null), I(null), Le(), Te.current = !1);
	}, [m?.status, Le]);
	let Ve = (0, l.useRef)(void 0);
	(0, l.useEffect)(() => {
		let e = m?.status, t = Ve.current;
		Ve.current = e, t === "error" && e !== "error" && le(null);
	}, [m?.status]);
	let He = P.cardScale === "lg" ? "md" : "sm", Ue = Dc(m?.status === "error" ? m.message : z), We = Ja(t, n);
	(0, l.useEffect)(() => {
		M && Fe && re.size > 0 && M();
	}, [
		Fe,
		re.size,
		M
	]), (0, l.useEffect)(() => {
		M && H && F !== null && M();
	}, [
		H,
		F,
		M
	]);
	let Ge = (0, l.useCallback)(() => {
		M?.();
	}, [M]), Ke = (0, l.useCallback)((e) => {
		Be || k === e || (Ae(!0), Ge(), le(null), ie((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.size < c ? n.add(e) : le(`You may discard at most ${c} cards`), n;
		}));
	}, [
		Be,
		c,
		k,
		Ge
	]), qe = (0, l.useCallback)(async (e) => {
		if (Te.current || Be || !v || !qo(e, u)) return;
		Le(), Te.current = !0, I(null), R(e), le(null);
		let t = V[e];
		E && t && ho(E, io({
			playerId: E,
			card: {
				rank: String(t.rank),
				suit: String(t.suit)
			}
		}), e);
		try {
			await Promise.resolve(v(e)), R(null), Te.current = !1;
		} catch {
			R(null), Te.current = !1;
		}
	}, [
		Be,
		u,
		v,
		E,
		V,
		Le
	]), Je = (0, l.useCallback)((e) => {
		if (Wc("preselectCard:enter", {
			index: e,
			isMyTurn: o,
			busy: Be,
			playLock: Te.current,
			phase: t,
			selectedPlay: F,
			hasOnPlayCard: !!v,
			legal: qo(e, u)
		}), Te.current || Be || !v || t !== "play") {
			Wc("preselectCard:blocked", {
				index: e,
				reason: Te.current ? "playLock" : Be ? "busy" : v ? "phase" : "noOnPlayCard"
			});
			return;
		}
		if (!qo(e, u)) {
			o && (Tc(), Le(), I(null), ue(e), fe(e), window.setTimeout(() => {
				ue(null), fe(null);
			}, vo.illegalFlash), le("Illegal play")), Wc("preselectCard:illegal", {
				index: e,
				isMyTurn: o
			});
			return;
		}
		let n = o ? e : Ko(F, e);
		if (Wc("preselectCard:toggle", {
			index: e,
			nextSelection: n,
			isMyTurn: o,
			selectedPlay: F
		}), Le(), I(n), le(null), Ge(), n === null) {
			De.current = null, Wc("preselectCard:deselected", { index: e });
			return;
		}
		if (De.current = n, !o) {
			Oe.current = !0, Re(n), Wc("preselectCard:queued", { index: n });
			return;
		}
		Re(n), ze(n, !1);
	}, [
		Be,
		Le,
		o,
		u,
		v,
		t,
		Ge,
		F,
		ze,
		Re
	]);
	je.current = qe;
	let Ye = (0, l.useCallback)(async (e) => {
		if (!(!h || Be)) {
			if (Ge(), e.length > c) {
				le(`You may discard at most ${c} cards`);
				return;
			}
			ce(!0), le(null), Se([...e]);
			try {
				await h(e), ie(/* @__PURE__ */ new Set());
			} catch {} finally {
				ce(!1);
			}
		}
	}, [
		h,
		Be,
		c,
		Ge
	]), Xe = (0, l.useCallback)(async () => {
		if (!(!g || Be)) {
			Ge(), ce(!0), le(null);
			try {
				await g(), ie(/* @__PURE__ */ new Set()), ve(!0), window.setTimeout(() => ve(!1), 700);
			} catch {} finally {
				ce(!1);
			}
		}
	}, [
		g,
		Be,
		Ge
	]), Ze = (0, l.useCallback)(async () => {
		if (!(!_ || Be)) {
			Ge(), be(!0), ce(!0), le(null);
			try {
				await _(), ie(/* @__PURE__ */ new Set());
			} catch {
				be(!1);
			} finally {
				ce(!1);
			}
		}
	}, [
		_,
		Be,
		Ge
	]), Qe = (0, l.useCallback)((e) => {
		Tc(), Le(), I(null), ue(e), fe(e), window.setTimeout(() => {
			ue(null), fe(null);
		}, vo.illegalFlash), le("Illegal play");
	}, [Le]), $e = (0, l.useCallback)((e) => {
		if (me(e), wo(e), e) {
			Ae(!1), Fe && !s && ie(new Set(f));
			return;
		}
		ke || ie(/* @__PURE__ */ new Set());
	}, [
		ke,
		Fe,
		s,
		f
	]), et = a && r && (Fe || H), tt = (0, l.useMemo)(() => Xo({
		selectedDraw: re,
		drawSelectionTouched: ke,
		bestPlayEnabled: pe,
		recommendedDiscardIndices: f
	}), [
		re,
		ke,
		pe,
		Pe,
		f
	]), nt = et && H && pe && F === null && d !== null && d >= 0, rt = (0, l.useCallback)((e, t) => D === t ? "trump" : k === t && (Fe || H) ? "muted" : L === t || de === t || B === t ? "default" : Fe && re.has(t) ? "draw-selected" : H && F === t ? "play-preselected" : nt && d === t ? "play-recommended" : H && u && !u.includes(t) ? "muted" : "default", [
		D,
		k,
		Fe,
		H,
		L,
		de,
		B,
		re,
		F,
		nt,
		d,
		u
	]), it = (0, l.useMemo)(() => H && r ? "play" : Fe && r && !s ? "draw-select" : Me && r && !(H && o) ? "peek" : "none", [
		Me,
		r,
		H,
		o,
		Fe,
		s
	]), at = Me && r && !(H && o), ot = (0, l.useCallback)((e) => {
		Wc("Hand.onPlayCard", {
			index: e,
			isMyTurn: o,
			gestureMode: it
		}), Je(e);
	}, [
		it,
		o,
		Je
	]), st = (0, l.useMemo)(() => ({
		mode: it,
		isMyTurn: o,
		legalPlayIndices: u,
		playingIndex: L,
		illegalShakeIndex: B,
		illegalFlashIndex: de,
		busy: Be,
		showPlayableHint: !1,
		allowPlayPreselect: H && r && !o,
		trickPlayOriginPlayerId: E,
		onPlayCard: ot,
		onSelectCard: Ke,
		onIllegalPlay: Qe,
		onPeek: oe
	}), [
		it,
		o,
		u,
		L,
		B,
		de,
		Be,
		H,
		r,
		E,
		ot,
		Ke,
		Qe
	]), ct = tt.length, lt = Fe && !s && o, ut = (0, l.useCallback)(() => {
		Ye(tt);
	}, [Ye, tt]), dt = (0, l.useCallback)(() => {
		Xe();
	}, [Xe]), ft = (0, l.useCallback)(() => {
		Ze();
	}, [Ze]), pt = () => et ? /* @__PURE__ */ (0, C.jsxs)("label", {
		className: "btable-hero__best-play",
		children: [/* @__PURE__ */ (0, C.jsx)("input", {
			type: "checkbox",
			className: "btable-hero__best-play-input",
			checked: pe,
			onChange: (e) => $e(e.target.checked),
			"data-testid": "best-play-checkbox"
		}), /* @__PURE__ */ (0, C.jsx)("span", {
			className: "btable-hero__best-play-label",
			children: "Best Play"
		})]
	}) : null;
	return a ? !r && !n && !Me ? /* @__PURE__ */ (0, C.jsx)(Jc, { className: b }) : Me && r && e.length === 0 ? p && n ? /* @__PURE__ */ (0, C.jsx)(Jc, { className: b }) : /* @__PURE__ */ (0, C.jsxs)("div", {
		className: qc(P, b),
		"aria-live": "polite",
		"data-testid": "hero-hand",
		children: [/* @__PURE__ */ (0, C.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: y ? "Cards not available — leave and re-open the session, or refresh the page." : "Loading your cards…"
		}), /* @__PURE__ */ (0, C.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: pt()
		})]
	}) : Me && !r && (t === "draw" || t === "play") ? /* @__PURE__ */ (0, C.jsx)("div", {
		className: qc(P, b),
		"data-testid": "hero-hand",
		children: /* @__PURE__ */ (0, C.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "You sat out this hand."
		})
	}) : e.length === 0 && !i ? et ? /* @__PURE__ */ (0, C.jsx)("div", {
		className: qc(P, b, ["btable-hero--reserved"]),
		"data-testid": "hero-hand",
		"aria-live": "polite",
		children: /* @__PURE__ */ (0, C.jsx)("div", {
			className: "btable-hero__hand-3d btable-hero__hand-3d--chrome-only",
			children: pt()
		})
	}) : /* @__PURE__ */ (0, C.jsx)(Jc, { className: b }) : /* @__PURE__ */ (0, C.jsxs)("div", {
		className: qc(P, b, [
			he && !N ? "btable-hero--dealing" : "",
			D === null ? "" : "btable-hero--trump-reveal",
			O ? "btable-hero--trump-merge" : "",
			Fe && o && !s ? "btable-hero--draw-select" : "",
			S === "discard" && w > 0 ? "btable-hero--draw-discard" : "",
			S === "receive" && T > 0 ? "btable-hero--draw-receive" : "",
			lt ? "btable-hero--draw-actions" : "",
			Fe && o && !s || H && o ? "btable-hero--your-turn" : "",
			(Fe || H) && r && !o ? "btable-hero--waiting-turn" : "",
			_e ? "btable-hero--stand-pat" : "",
			ye ? "btable-hero--fold-out" : ""
		]),
		style: { "--deal-card-stagger-ms": `${x}ms` },
		"data-testid": "hero-hand",
		"aria-label": `Your dealt cards — ${We}`,
		children: [
			/* @__PURE__ */ (0, C.jsxs)("p", {
				className: "btable-sr-only",
				"aria-live": "polite",
				children: [
					We,
					Fe && !s && o && " — tap cards to discard; red border marks your selection",
					H && o && " — tap a legal card to play",
					pe && H && " — green outline marks Best Play suggestions"
				]
			}),
			/* @__PURE__ */ (0, C.jsxs)("div", {
				ref: we,
				className: "btable-hero__hand-3d",
				"data-trick-play-origin": E ?? void 0,
				"data-trick-play-origin-active": H && o && E ? E : void 0,
				children: [/* @__PURE__ */ (0, C.jsx)("div", {
					className: "btable-hero__hand-row",
					"data-hero-play-turn": H && o ? "true" : void 0,
					children: /* @__PURE__ */ (0, C.jsx)(j, {
						cards: V,
						size: He,
						fan: !0,
						dealSeatPlayerId: E,
						stateFor: rt,
						slotClassFor: Ie,
						peekIndex: ae,
						onCardPeek: at ? oe : void 0,
						cardTestId: H && o ? "play-button" : void 0,
						cardInteraction: st
					})
				}), pt()]
			}),
			H && !o && F !== null && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-hero__hint",
				"data-testid": "play-preselect-hint",
				children: "Your selected card will play on your turn"
			}),
			Ue && /* @__PURE__ */ (0, C.jsx)("p", {
				className: "btable-hero__error",
				role: "alert",
				children: Ue
			}),
			/* @__PURE__ */ (0, C.jsx)(Kc, {
				visible: lt,
				busy: Be,
				selectedCount: ct,
				onDraw: ut,
				onPassDraw: dt,
				onFoldDraw: ft
			})
		]
	}) : /* @__PURE__ */ (0, C.jsx)("div", {
		className: qc(P, b),
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
var kl = 1850, Al = 2050, jl = 1080, Ml = 9500;
function Nl(e) {
	return e === "winnerReveal" || e === "collectTrick";
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
	let t = Pl(e.reducedMotion), n = e.finalTrick ? Math.round(900 * (e.reducedMotion ? .55 : 1)) : 0, r = (e.trumpBeat ? t.trumpBeatReadMs : t.postTrickReadMs) + n, i = Math.min(t.winnerRevealMs, r - 200), a = Math.max(200, r - i), o = t.trickSweepMs, s = t.nextLeadGapMs;
	return {
		readBeforeWinnerMs: a,
		winnerRevealMs: i,
		readTotalMs: r,
		sweepMs: o,
		nextLeadGapMs: s,
		pipelineMs: r + o + s
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
function q(e) {
	return e?.plays?.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
}
function Rl(e, t, n) {
	return e.length ? e.length === 1 ? e[0].playerId : !t || !n ? e[e.length - 1].playerId : Uo(e.map((e) => ({
		playerId: e.playerId,
		card: {
			rank: e.card.rank,
			suit: e.card.suit
		}
	})), t, n) : null;
}
function J(e) {
	let t = q(e.prevTrick), n = e.playedCards?.filter((t) => t.trickNumber === e.trickNumber).map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
	return n.length > t.length ? n : t;
}
function Y(e, t, n) {
	if (!e.length || !t || !n || t === n) return !1;
	let r = Uo(e.map((e) => ({
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
function zl(e) {
	let { prevTricks: t, nextTricks: n, prevTrick: r, playedCards: i } = e, a = Ll(e.participantIds, t, n), o = ll(t, a), s = ll(n, a);
	if (s <= o) return null;
	let c = Il(t, n, a), l = r?.trickNumber ?? s, u = J({
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
function Bl() {
	return typeof window > "u" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
//#endregion
//#region src/table/gameFlowDebug.ts
var Vl = "nbl-game-flow-debug", Hl = !1, Ul = null;
function X() {
	if (Hl) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem(Vl) === "1" ? !0 : new URLSearchParams(window.location.search).has("gameFlowDebug");
	} catch {
		return !1;
	}
}
function Z(e, t, n) {
	if (!X()) return;
	let r = `[nbl-flow ${typeof performance < "u" ? `${performance.now().toFixed(1)}ms` : ""}] ${e} :: ${t}`;
	if (Ul) {
		Ul(r.trim(), n);
		return;
	}
	console.info(r, n ?? "");
}
//#endregion
//#region src/table/TrickPlaySlot.tsx
function Wl(e, t, n, r, i) {
	r.current = !1, e(!0), t("static"), n(null), i && X() && Z("TrickPlaySlot", "fly-complete", i);
}
function Gl({ play: e, index: t, presentationPhase: n, displayCount: r, playerName: i, leaderPlayerId: a = null, winnerPlayerId: o = null, instantPlace: s = !1 }) {
	let c = (0, l.useRef)(null), [u, d] = (0, l.useState)("static"), [f, p] = (0, l.useState)(null), [m, h] = (0, l.useState)(!1), g = (0, l.useRef)(!1), _ = io(e), v = a != null && e.playerId === a, y = o != null && e.playerId === o, b = n === "live", x = t === r - 1 && b, S = m, T = v && (n === "live" || n === "trickComplete"), E = T || y && n !== "live" && n !== "trickComplete";
	(0, l.useLayoutEffect)(() => {
		X() && Z("TrickPlaySlot", "play-enter", {
			playKey: _,
			index: t,
			instantPlace: s,
			isLanding: x
		}), h(!1), g.current = !1, d("static"), p(null);
	}, [_]), (0, l.useLayoutEffect)(() => {
		if (m) return;
		if (s || !b) {
			Wl(h, d, p, g, {
				playKey: _,
				index: t
			});
			return;
		}
		if (!x) {
			Wl(h, d, p, g, {
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
		let i = po(e.playerId, _);
		if (!i) {
			Wl(h, d, p, g, {
				playKey: _,
				index: t
			});
			return;
		}
		let a = Bl(), o = a ? 217 : 395, l = a ? 91 : 165;
		g.current = !0, p(go(i, n.getBoundingClientRect(), r.getBoundingClientRect())), d("pending"), X() && Z("TrickPlaySlot", "fly-start", {
			playKey: _,
			index: t,
			travelMs: o,
			settleMs: l
		});
		let u = window.setTimeout(() => d("travel"), 0), f = window.setTimeout(() => d("settle"), o), v = window.setTimeout(() => {
			Wl(h, d, p, g, {
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
			card: qa(e.card),
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
function Kl({ displayPlays: e = [], leaderPlayerId: t = null, winnerPlayerId: n = null, showWinnerTag: r = !1, presentationPhase: i = "live", playerNames: a = {}, variant: o = "live", instantTrickPlays: s = !1, peakCardCount: c = 0 }) {
	(0, l.useEffect)(() => {
		X() && Z("TrickRow", e.length === 0 ? "trick-empty" : "trick-cards", {
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
				children: e.map((r, o) => /* @__PURE__ */ (0, C.jsx)(Gl, {
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
var ql = (0, l.memo)(Kl);
//#endregion
//#region src/table/DiscardPile.tsx
function Jl({ cards: e }) {
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
function Yl({ potMetrics: e, participantCount: t, potTick: n = 0 }) {
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
var Xl = (0, l.memo)(Yl);
//#endregion
//#region src/table/PotCenter.tsx
function Zl({ potMetrics: e, participantCount: t, trumpUpcard: n, trumpSuit: r, phase: i, enrollmentActive: a = !1, remainingDeckCount: o, trickDisplayPlays: s = [], trickLeadSuit: c = null, trickLeaderPlayerId: u = null, trickWinnerPlayerId: f = null, trickShowWinnerTag: p = !1, trickPresentationPhase: m = "live", trickEchoPlays: h = [], trickEchoWinnerId: g = null, trickEchoPhase: _ = "live", showFinalTrickEcho: v = !1, playerNames: y = {}, anteAnimActive: b = !1, trumpRevealActive: x = !1, drawAnimPlayerId: S = null, drawAnimSubPhase: T = "done", drawDiscardCount: E = 0, settleAnimActive: D = !1, settleCarryOver: O = !1, potTick: k = 0, trumpReminderPulse: ee = 0, hideCenterTrump: te = !1, showTrumpSuitReminder: A = !1, instantTrickPlays: ne = !1, peakTrickPlayCount: j = 0, discardPileCards: M = [] }) {
	let N = Ja(i, a), P = u ?? ((m === "live" || m === "trickComplete") && s.length > 0 ? Rl(s, c ?? s[0]?.card.suit ?? null, r ?? null) : null), re = m !== "live" && m !== "nextLeadReady", ie = s.length, F = ie > 0 || j > ie || ne, [I, L] = (0, l.useState)(n ?? null);
	(0, l.useEffect)(() => {
		if (n) {
			L(n);
			return;
		}
		if (I) {
			if (F || re) {
				let e = window.setTimeout(() => L(null), 760);
				return () => window.clearTimeout(e);
			}
			L(null);
		}
	}, [
		n,
		F,
		re,
		I
	]);
	let R = !!I && !te, ae = A || !R && !!r && i === "play", oe = R ? `${I.rank}-${I.suit}` : "trump-slot", se = v || D && h.length > 0 && ie === 0;
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		className: "table-center-cluster",
		"aria-label": "Table center",
		children: [/* @__PURE__ */ (0, C.jsxs)("div", {
			className: "deck-stack",
			"aria-label": "Deck and trump",
			children: [R ? /* @__PURE__ */ (0, C.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"bpot__trump--deal",
					x ? "bpot__trump--reveal" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-button",
				"data-trump-deal-target": "",
				children: [/* @__PURE__ */ (0, C.jsx)(w, {
					card: {
						rank: I.rank,
						suit: I.suit
					},
					size: "sm",
					state: "trump"
				}), /* @__PURE__ */ (0, C.jsx)("span", {
					className: "deck-stack__label muted small",
					children: "Trump"
				})]
			}, oe) : ae ? /* @__PURE__ */ (0, C.jsxs)("div", {
				className: [
					"deck-stack__trump",
					"deck-stack__trump--suit-reminder",
					ee > 0 ? "deck-stack__trump--suit-reminder-pulse" : ""
				].filter(Boolean).join(" "),
				"data-testid": "trump-suit-reminder",
				"aria-label": `Trump suit: ${Za(r)}`,
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
				re ? "center-play--trick-resolving" : "",
				se ? "center-play--final-trick-echo" : ""
			].filter(Boolean).join(" "),
			"data-trick-phase": m,
			"data-trick-cards": ie,
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
				i === "draw" ? /* @__PURE__ */ (0, C.jsx)(Jl, { cards: M }) : null,
				/* @__PURE__ */ (0, C.jsxs)("div", {
					className: "center-play__phase",
					"aria-live": "polite",
					children: [
						/* @__PURE__ */ (0, C.jsx)("span", {
							className: `bpot__phase-tag bpot__phase-tag--${i ?? "waiting"}`,
							"data-testid": "phase-tag-center",
							"data-phase": i ?? "waiting",
							children: N
						}),
						R && r && /* @__PURE__ */ (0, C.jsx)("span", {
							className: "center-play__trump-suit muted small",
							children: Za(r)
						}),
						ae && /* @__PURE__ */ (0, C.jsxs)("span", {
							className: "center-play__trump-suit center-play__trump-suit--reminder muted small",
							children: [Za(r), " trump"]
						})
					]
				}),
				/* @__PURE__ */ (0, C.jsxs)("div", {
					className: "center-play__trick-stage",
					children: [/* @__PURE__ */ (0, C.jsx)("div", {
						className: "center-play__trick-live",
						children: /* @__PURE__ */ (0, C.jsx)(ql, {
							displayPlays: s,
							leaderPlayerId: P,
							winnerPlayerId: f,
							showWinnerTag: p,
							presentationPhase: m,
							playerNames: y,
							instantTrickPlays: ne,
							peakCardCount: j
						})
					}), se && /* @__PURE__ */ (0, C.jsx)("div", {
						className: "center-play__trick-echo",
						"aria-hidden": "true",
						children: /* @__PURE__ */ (0, C.jsx)(ql, {
							displayPlays: h,
							winnerPlayerId: g,
							showWinnerTag: !0,
							presentationPhase: _,
							playerNames: y,
							variant: "echo"
						})
					})]
				}),
				/* @__PURE__ */ (0, C.jsx)(Xl, {
					potMetrics: e,
					participantCount: t,
					potTick: k
				})
			]
		})]
	});
}
var Ql = (0, l.memo)(Zl);
//#endregion
//#region src/table/hooks/useExternalStoreSelector.ts
function $l(e, t, n, r) {
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
var eu = null, tu = /* @__PURE__ */ new Set();
function nu(e) {
	return e.map((e) => `${e.playerId}:${e.card.rank}:${e.card.suit}`).join("|");
}
function ru(e) {
	return Object.entries(e).sort(([e], [t]) => e.localeCompare(t)).map(([e, t]) => `${e}:${t}`).join("|");
}
function iu(e, t) {
	return e ? e.phase !== t.phase || e.revealedCount !== t.revealedCount || e.revealTarget !== t.revealTarget || e.peakPlayCount !== t.peakPlayCount || e.winnerPlayerId !== t.winnerPlayerId || e.showWinnerTag !== t.showWinnerTag || e.trickWinnerSeatId !== t.trickWinnerSeatId || e.suppressTurnPlayerId !== t.suppressTurnPlayerId || e.isPipelineActive !== t.isPipelineActive || e.isResolving !== t.isResolving || e.showFinalTrickEcho !== t.showFinalTrickEcho || e.trickEchoWinnerId !== t.trickEchoWinnerId || e.trickEchoPhase !== t.trickEchoPhase || nu(e.displayPlays) !== nu(t.displayPlays) || nu(e.trickEchoPlays) !== nu(t.trickEchoPlays) || ru(e.displayTricksByPlayer) !== ru(t.displayTricksByPlayer) || e.frozenTrick?.trickNumber !== t.frozenTrick?.trickNumber || e.frozenTrick?.winnerId !== t.frozenTrick?.winnerId || (e.frozenTrick?.plays.length ?? 0) !== (t.frozenTrick?.plays.length ?? 0) : !0;
}
function au(e) {
	eu && !iu(eu, e) || (eu = e, tu.forEach((e) => e()));
}
function ou(e) {
	return tu.add(e), () => tu.delete(e);
}
function su() {
	return eu;
}
function cu() {
	eu = null, tu.forEach((e) => e());
}
//#endregion
//#region src/table/trickPresentationSelectors.ts
var lu = {};
function uu(e, t) {
	let n = Object.keys(e), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let r of n) if (e[r] !== t[r]) return !1;
	return !0;
}
function du(e) {
	return e ? {
		phase: e.phase,
		displayTricksByPlayer: e.displayTricksByPlayer,
		trickWinnerSeatId: e.trickWinnerSeatId,
		suppressTurnPlayerId: e.suppressTurnPlayerId
	} : {
		phase: "live",
		displayTricksByPlayer: lu,
		trickWinnerSeatId: null,
		suppressTurnPlayerId: !1
	};
}
function fu(e, t) {
	return e.phase === t.phase && e.trickWinnerSeatId === t.trickWinnerSeatId && e.suppressTurnPlayerId === t.suppressTurnPlayerId && uu(e.displayTricksByPlayer, t.displayTricksByPlayer);
}
function pu(e) {
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
function mu(e, t) {
	return e.trickDisplayPlays === t.trickDisplayPlays && e.trickWinnerPlayerId === t.trickWinnerPlayerId && e.trickShowWinnerTag === t.trickShowWinnerTag && e.trickPresentationPhase === t.trickPresentationPhase && e.trickEchoPlays === t.trickEchoPlays && e.trickEchoWinnerId === t.trickEchoWinnerId && e.trickEchoPhase === t.trickEchoPhase && e.showFinalTrickEcho === t.showFinalTrickEcho && e.peakTrickPlayCount === t.peakTrickPlayCount;
}
function hu(e) {
	return e ? {
		phase: e.phase,
		trickWinnerSeatId: e.trickWinnerSeatId,
		frozenTrick: e.frozenTrick,
		displayTricksByPlayer: e.displayTricksByPlayer
	} : {
		phase: "live",
		trickWinnerSeatId: null,
		frozenTrick: null,
		displayTricksByPlayer: lu
	};
}
function gu(e, t) {
	return e.phase === t.phase && e.trickWinnerSeatId === t.trickWinnerSeatId && e.frozenTrick === t.frozenTrick && uu(e.displayTricksByPlayer, t.displayTricksByPlayer);
}
var _u = () => {};
function vu(e) {
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
		displayTricksByPlayer: lu,
		trickWinnerSeatId: null,
		suppressTurnPlayerId: !1,
		forceHandEndDrain: _u
	};
}
function yu(e, t) {
	return e.phase === t.phase && e.isPipelineActive === t.isPipelineActive && e.revealedCount === t.revealedCount && e.revealTarget === t.revealTarget && e.peakPlayCount === t.peakPlayCount && e.displayPlaysLength === t.displayPlaysLength && uu(e.displayTricksByPlayer, t.displayTricksByPlayer) && e.trickWinnerSeatId === t.trickWinnerSeatId && e.suppressTurnPlayerId === t.suppressTurnPlayerId;
}
//#endregion
//#region src/table/ConnectedPotCenter.tsx
function bu(e) {
	let t = $l(ou, su, pu, mu);
	return /* @__PURE__ */ (0, C.jsx)(Ql, {
		...e,
		...t
	});
}
var xu = (0, l.memo)(bu);
//#endregion
//#region src/table/SmartHud.tsx
function Su({ label: e, value: t, accent: n, title: r }) {
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
function Cu({ player: e, compact: t = !1 }) {
	let n = e.apeScore != null && !e.isRobot;
	return /* @__PURE__ */ (0, C.jsxs)("div", {
		className: `bhud${t ? " bhud--compact" : ""}`,
		"aria-label": `${e.displayName} stats`,
		children: [n && /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
			/* @__PURE__ */ (0, C.jsx)(Su, {
				label: "Ape",
				value: e.apeScore ?? 0,
				accent: !0,
				title: "Ape Score"
			}),
			e.apeClass && /* @__PURE__ */ (0, C.jsx)(Su, {
				label: "Class",
				value: e.apeClass,
				title: "Ape Class"
			}),
			e.apeStatus && /* @__PURE__ */ (0, C.jsx)(Su, {
				label: "Status",
				value: e.apeStatus,
				title: "Ape Status"
			})
		] }), e.sessionStreak != null && e.sessionStreak > 0 && /* @__PURE__ */ (0, C.jsx)(Su, {
			label: "Streak",
			value: e.sessionStreak,
			title: "Hands won this session"
		})]
	});
}
//#endregion
//#region src/session/liveHand.ts
function wu() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function Tu(e) {
	let t = e ?? wu();
	if (t.phase === "draw" || t.phase === "play" || t.phase === "reveal" || t.phase === "decision" || (t.participantIds?.length ?? 0) > 0) return !1;
	let n = t.tricksByPlayer ?? {};
	return !Object.values(n).some((e) => (e || 0) > 0);
}
function Eu(e) {
	if (!e) return !1;
	let t = e.phase ?? null;
	if (t !== "draw" && t !== "play" && t !== "reveal" && t !== "decision") return !1;
	let n = e.participantIds ?? [];
	if (n.length === 0) return !1;
	let r = e.tricksByPlayer ?? {};
	return !(ul(r, n) || ll(r, n) >= 5);
}
function Du(e) {
	if (!e) return 0;
	let t = e.phase ?? "", n = t === "play" ? 1e3 : t === "draw" ? 100 : t === "decision" ? 50 : t === "reveal" ? 25 : 0;
	n += (e.drawCompletedIds?.length ?? 0) * 10;
	let r = e.participantIds ?? [];
	n += ll(e.tricksByPlayer ?? {}, r);
	let i = e.handDecision;
	return t === "decision" && i && (n += (i.currentIndex ?? 0) * 5, n += (i.playingIds?.length ?? 0) * 2, n += (i.passedIds?.length ?? 0) * 2), n;
}
function Ou(e, t) {
	return Eu(t) ? Eu(e) ? Du(t) >= Du(e) ? t : e : t : e;
}
function ku(e) {
	let t = e?.phase ?? null;
	return t === "reveal" || t === "decision" || t === "draw" || t === "play";
}
function Au(e) {
	let t = e?.currentHand ?? wu(), n = e?.liveEnrollment?.deal?.publicHand, r = n?.phase ?? null;
	if (Tu(t) && n && !Eu(n)) return wu();
	if (Eu(t) && Eu(n)) {
		let e = t.phase === "reveal" || t.phase === "decision", r = n?.drawCompletedIds?.length ?? 0, i = t.drawCompletedIds?.length ?? 0, a = ll(n?.tricksByPlayer ?? {}, n?.participantIds ?? []), o = ll(t.tricksByPlayer ?? {}, t.participantIds ?? []);
		return e && n?.phase === "draw" && o === 0 && a === 0 && r > 0 && i === 0 ? t : Ou(t, n);
	}
	if (Eu(t)) return t;
	if (r === "draw" || r === "play" || r === "reveal" || r === "decision") {
		if (Eu(n)) {
			let i = ll(n?.tricksByPlayer ?? {}, n?.participantIds ?? []);
			return Tu(t) && i === 0 && r === "draw" && !e?.liveEnrollment?.active ? wu() : n;
		}
		return n?.phase ? n : ku(t) ? t : Tu(t) ? wu() : t;
	}
	return r && n ? n : t;
}
function ju(e) {
	let t = Au(e), n = t?.phase ?? null;
	if (n === "reveal" || n === "draw" || n === "play") return null;
	if (n === "decision") {
		let e = Oo(t.handDecision ?? null);
		if (e?.active) return e;
	}
	let r = e?.liveEnrollment, i = r?.deal?.publicHand?.phase ?? null;
	return r?.active ? r : i === "draw" || i === "play" || i === "reveal" || i === "decision" ? null : e?.handEnrollment?.active ? e.handEnrollment : e?.handEnrollment ?? null;
}
function Mu(e) {
	return !e.cardsDealt && e.handParticipantCount === 0 && e.enrollmentActive;
}
function Nu(e, t) {
	return e === "decision" && t?.active === !0;
}
function Pu(e) {
	return e.pagatDecisionActive && e.handDecision ? (e.handDecision.orderedPlayerIds ?? [])[e.handDecision.currentIndex ?? 0] ?? null : e.legacyEnrollmentActive && e.enrollment?.active ? (e.enrollment.orderedPlayerIds ?? [])[e.enrollment.currentIndex ?? 0] ?? null : null;
}
function Fu(e) {
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
}, Iu = [
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
], Lu = (e, t) => `${e}:${t}`;
new Map(Iu.map((e) => [Lu(e.from, e.event), e.to]));
function Ru(e) {
	return typeof e == "string" && e.startsWith("bot_");
}
function zu(e, t) {
	return !e || !t ? !1 : e === t ? !0 : Ru(e);
}
function Bu() {
	return {
		tricksByPlayer: {},
		participantIds: []
	};
}
function Vu(e) {
	let t = e.session, n = t ? Au(t) : Bu(), r = n.phase ?? null, i = n.participantIds ?? [], a = n.tricksByPlayer ?? {}, o = ll(a, i), s = i.length > 0 && ul(a, i), c = !!t?.pendingCoWinSettlement?.winnerIds?.length, l = t ? ju(t) : null, u = Nu(r, n.handDecision ?? null), d = Mu({
		cardsDealt: r === Do.REVEAL || r === Do.DECISION || r === Do.DRAW || r === Do.PLAY,
		handParticipantCount: i.length,
		enrollmentActive: !!l?.active
	}), f = d || u, p = Hu({
		sessionStatus: t?.status ?? null,
		handPhase: r,
		participantIds: i,
		trickCount: o,
		handComplete: s,
		pendingCoWin: c,
		enrollmentActive: f,
		handCount: t?.handCount ?? 0,
		clearedHand: Tu(n)
	});
	return {
		phase: p,
		handPhase: r,
		enrollmentActive: f,
		pagatDecisionActive: u,
		participantIds: i,
		turnPlayerId: Uu({
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
function Hu(e) {
	if (e.sessionStatus === "final") return Q.WAITING;
	if (e.pendingCoWin) return Q.SETTLE;
	let t = e.handPhase ?? null, n = e.participantIds ?? [];
	return t === Do.PLAY ? e.handComplete || (e.trickCount ?? 0) >= 5 ? Q.SETTLE : Q.PLAY : t === Do.DRAW ? Q.DRAW : t === Do.REVEAL ? Q.DEAL : t === Do.DECISION || e.enrollmentActive ? Q.ENROLLMENT : e.clearedHand !== !1 && n.length === 0 && (e.handCount ?? 0) > 0 && !e.enrollmentActive ? Q.NEXT_HAND_PREP : Q.WAITING;
}
function Uu(e) {
	let { phase: t, hand: n, enrollment: r, pagatDecisionActive: i, legacyEnrollmentActive: a } = e;
	return t === Q.ENROLLMENT ? Pu({
		pagatDecisionActive: i,
		handDecision: n.handDecision ?? null,
		legacyEnrollmentActive: a,
		enrollment: r
	}) : t === Q.DRAW || t === Q.PLAY ? n.turnPlayerId ?? null : null;
}
function Wu(e) {
	let { snapshot: t, action: n, playerId: r, actorId: i, suppressTurn: a = !1 } = e, o = e.drawCompletedIds ?? [];
	if (!zu(r, i)) return {
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
var Gu = 15e3, Ku = new Set([
	Q.ENROLLMENT,
	Q.DRAW,
	Q.PLAY
]);
function qu(e) {
	return e > 1e4 ? "green" : e > 5e3 ? "yellow" : "red";
}
function Ju(e) {
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
function Yu(e) {
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
function Xu(e) {
	if (e.handComplete || e.suppressTurn) return null;
	let t = Vu({
		session: Yu(e),
		suppressTurn: e.suppressTurn
	});
	return Ku.has(t.phase) ? t.turnPlayerId : null;
}
function Zu(e, t, n) {
	let r = Gu - Math.max(0, n - t) % Gu;
	return {
		playerId: e,
		remainingMs: r,
		progress: r / Gu,
		segment: qu(r)
	};
}
//#endregion
//#region src/table/TurnCountdownRing.tsx
var Qu = 22, $u = 2 * Math.PI * Qu;
function ed({ activityKey: e, startedAtMs: t, reducedMotion: n = Bl() }) {
	let [r, i] = (0, l.useState)(1), [a, o] = (0, l.useState)("green"), s = (0, l.useRef)(null), c = (0, l.useRef)(t);
	c.current = t, (0, l.useEffect)(() => {
		let e = (e) => {
			let t = Zu("local", c.current, e);
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
	let u = $u * (1 - Math.max(0, Math.min(1, r)));
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
			r: Qu,
			fill: "none"
		}), /* @__PURE__ */ (0, C.jsx)("circle", {
			className: `bseat__turn-countdown-progress bseat__turn-countdown-progress--${a}`,
			cx: "24",
			cy: "24",
			r: Qu,
			fill: "none",
			strokeDasharray: $u,
			strokeDashoffset: u,
			transform: "rotate(-90 24 24)"
		})]
	});
}
var td = (0, l.memo)(ed), nd = null, rd = /* @__PURE__ */ new Set();
function id() {
	rd.forEach((e) => e());
}
function ad(e, t) {
	return e === t ? !1 : !e || !t ? !0 : e.playerId !== t.playerId || e.activityKey !== t.activityKey || e.startedAtMs !== t.startedAtMs;
}
function od(e) {
	ad(nd, e) && (nd = e, id());
}
function sd(e) {
	return rd.add(e), () => rd.delete(e);
}
function cd() {
	return nd;
}
function ld(e) {
	let t = Xu(e), n = Ju({
		...e,
		activeActorId: t
	});
	if (!t) {
		od(null);
		return;
	}
	if (!nd || nd.activityKey !== n) {
		od({
			playerId: t,
			activityKey: n,
			startedAtMs: Date.now()
		});
		return;
	}
	nd.playerId !== t && od({
		...nd,
		playerId: t
	});
}
function ud() {
	nd = null, id();
}
//#endregion
//#region src/table/ConnectedTurnCountdownRing.tsx
function dd({ playerId: e }) {
	let t = (0, l.useSyncExternalStore)(sd, cd);
	return !t || t.playerId !== e ? null : /* @__PURE__ */ (0, C.jsx)(td, {
		activityKey: t.activityKey,
		startedAtMs: t.startedAtMs
	});
}
var fd = (0, l.memo)(dd);
//#endregion
//#region src/table/SeatAvatarIdentity.tsx
function pd({ displayName: e, photoURL: t, isDealer: n = !1, dealerMoved: r = !1, inHand: i = !1, bourrePressure: a = !1, bourrePulse: o = !1, countdownPlayerId: s = null, peek: c = !1, onTogglePeek: u, onBlurPeek: d }) {
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
					s && /* @__PURE__ */ (0, C.jsx)(fd, { playerId: s })
				]
			})
		}), /* @__PURE__ */ (0, C.jsx)("span", {
			className: "bseat__avatar-label",
			title: f,
			children: f
		})]
	});
}
var md = (0, l.memo)(pd);
//#endregion
//#region src/table/SeatHoleCards.tsx
function hd({ playerId: e, cardsHeld: t, revealedTrumpIndex: n = null, revealedTrumpUpcard: r = null, seatTrumpMergeActive: i = !1 }) {
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
var gd = (0, l.memo)(hd);
//#endregion
//#region src/table/SeatWonTrickPile.tsx
function _d({ playerId: e, trickCount: t }) {
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
var vd = (0, l.memo)(_d);
//#endregion
//#region src/table/seatPlayerEqual.ts
function $(e, t) {
	return e === t ? !0 : !e || !t ? !e && !t : e.rank === t.rank && e.suit === t.suit;
}
function yd(e, t) {
	return e.playerId === t.playerId && e.displayName === t.displayName && e.photoURL === t.photoURL && e.bankroll === t.bankroll && e.isOut === t.isOut && e.bankrollTick === t.bankrollTick && e.bourreAlert === t.bourreAlert && e.bourrePressure === t.bourrePressure && e.inHand === t.inHand && e.tricksThisHand === t.tricksThisHand && e.isSelf === t.isSelf && e.isDealer === t.isDealer && e.isLeading === t.isLeading && e.isWinner === t.isWinner && e.enrollmentSatOut === t.enrollmentSatOut && e.enrollmentJoined === t.enrollmentJoined && e.canToggleInHand === t.canToggleInHand && e.canPassEnrollment === t.canPassEnrollment && e.decisionPlannedDiscards === t.decisionPlannedDiscards && e.canEditTricks === t.canEditTricks && e.showHoleCards === t.showHoleCards && e.holeCardCount === t.holeCardCount && e.revealedTrumpIndex === t.revealedTrumpIndex && e.seatTrumpMergeActive === t.seatTrumpMergeActive && $(e.revealedTrumpUpcard, t.revealedTrumpUpcard) && e.isOnTurn === t.isOnTurn && e.isActiveActor === t.isActiveActor && e.isTrickCapture === t.isTrickCapture && e.enrollmentPulse === t.enrollmentPulse && e.drawAnimSubPhase === t.drawAnimSubPhase && e.drawDiscardCount === t.drawDiscardCount && e.drawReplaceCount === t.drawReplaceCount && e.apeScore === t.apeScore && e.apeClass === t.apeClass && e.apeStatus === t.apeStatus && e.sessionStreak === t.sessionStreak && e.dealerMoved === t.dealerMoved && e.trumpMerging === t.trumpMerging && e.winnerFlash === t.winnerFlash;
}
//#endregion
//#region src/table/Seat.tsx
function bd({ player: e, region: t, handLane: n = "below", style: r, clockwiseDealing: i = !1, countdownPlayerId: a = null, onToggleInHand: o, onPassEnrollment: s, onTrickDelta: c, onReaction: u }) {
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
								v && /* @__PURE__ */ (0, C.jsx)(vd, {
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
								y && /* @__PURE__ */ (0, C.jsx)(gd, {
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
								/* @__PURE__ */ (0, C.jsx)(md, {
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
						children: /* @__PURE__ */ (0, C.jsx)(Cu, {
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
function xd(e, t) {
	return e.region === t.region && e.handLane === t.handLane && e.clockwiseDealing === t.clockwiseDealing && e.countdownPlayerId === t.countdownPlayerId && e.style.left === t.style.left && e.style.top === t.style.top && e.onToggleInHand === t.onToggleInHand && e.onPassEnrollment === t.onPassEnrollment && e.onTrickDelta === t.onTrickDelta && e.onReaction === t.onReaction && yd(e.player, t.player);
}
var Sd = (0, l.memo)(bd, xd);
//#endregion
//#region src/table/layout/sevenPlayerMobileSeatMap.ts
function Cd(e) {
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
function wd(e) {
	return e === 7;
}
function Td(e, t) {
	return e < 0 || e > 6 ? null : Cd(t)[e] ?? null;
}
function Ed(e, t, n) {
	let r = Td(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: Wd(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 7
		})
	} : null;
}
//#endregion
//#region src/table/layout/eightPlayerMobileSeatMap.ts
function Dd(e) {
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
function Od(e) {
	return e >= 8;
}
function kd(e, t) {
	return e < 0 || e > 7 ? null : Dd(t)[e] ?? null;
}
function Ad(e, t, n) {
	let r = kd(e, t);
	return r ? {
		x: r.x,
		y: r.y,
		region: r.region,
		seatIndex: e,
		handLane: Wd(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 8
		})
	} : null;
}
//#endregion
//#region src/table/layout/fourPlayerMobileSeatMap.ts
function jd(e) {
	return e === 5;
}
function Md(e) {
	let t = sl(e);
	return {
		0: t[0],
		1: t[1],
		2: t[3],
		3: t[5],
		4: t[6]
	};
}
function Nd(e, t, n) {
	if (e < 0 || e > 4) return null;
	let r = Md(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: Wd(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 5
		})
	} : null;
}
//#endregion
//#region src/table/layout/fivePlayerMobileSeatMap.ts
var Pd = {
	min: 8,
	max: 92
};
function Fd(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Id(e, t) {
	let n = t === "landscape" ? 54 : 56;
	return {
		...e,
		x: Fd(e.x, Pd.min, Pd.max),
		y: Fd(e.y, 8, n)
	};
}
function Ld(e) {
	return e === 6;
}
function Rd(e) {
	let t = sl(e), n = [
		2,
		3,
		4
	].map((t) => Id(Dl(t, 6), e));
	return {
		0: t[0],
		1: t[1],
		2: n[0],
		3: n[1],
		4: n[2],
		5: t[6]
	};
}
function zd(e, t, n) {
	if (e < 0 || e > 5) return null;
	let r = Rd(t)[e];
	return r ? {
		...r,
		seatIndex: e,
		handLane: Wd(r, {
			isMobile: !0,
			isSelf: n.isSelf,
			total: 6
		})
	} : null;
}
//#endregion
//#region src/table/layout/seatLayout.ts
var Bd = {
	min: 8,
	max: 92
}, Vd = 56, Hd = 54;
function Ud(e, t, n) {
	return Math.max(t, Math.min(n, e));
}
function Wd(e, t) {
	return t.isSelf || t.isMobile ? "below" : t.total >= 6 && e.region === "left" && e.x < 14 || t.total >= 6 && e.region === "right" && e.x > 86 ? "side" : "below";
}
function Gd(e, t) {
	let n = Ud(e.x, Bd.min, Bd.max), r = t === "portrait" ? Vd : Hd, i = Ud(e.y, 8, r);
	return {
		...e,
		x: n,
		y: i
	};
}
function Kd(e, t, n) {
	if (n.isMobile && n.orientation && jd(t)) {
		let t = Nd(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && Ld(t)) {
		let t = zd(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && wd(t)) {
		let t = Ed(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	if (n.isMobile && n.orientation && Od(t)) {
		let t = Ad(e, n.orientation, { isSelf: n.isSelf });
		if (t) return t;
	}
	let r = Dl(e, t), i = n.isMobile && n.orientation ? Gd(r, n.orientation) : r;
	return {
		...i,
		seatIndex: e,
		handLane: Wd(i, {
			isMobile: n.isMobile,
			isSelf: n.isSelf,
			total: t
		})
	};
}
function qd(e, t, n) {
	return Kd(e + 1, t, {
		isMobile: !0,
		isSelf: !1,
		orientation: n
	});
}
function Jd(e, t = "portrait") {
	if (jd(e)) {
		let e = Nd(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (Ld(e)) {
		let e = zd(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (wd(e)) {
		let e = Ed(0, t, { isSelf: !0 });
		if (e) return e;
	}
	if (Od(e)) {
		let e = Ad(0, t, { isSelf: !0 });
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
function Yd(e, t) {
	return e.seatIndex === t.seatIndex && e.playerCount === t.playerCount && e.isMobile === t.isMobile && e.clockwiseDealing === t.clockwiseDealing && e.seatIndexAttr === t.seatIndexAttr && e.layoutOverride === t.layoutOverride && e.onToggleInHand === t.onToggleInHand && e.onPassEnrollment === t.onPassEnrollment && e.onTrickDelta === t.onTrickDelta && e.onReaction === t.onReaction && e.player.playerId === t.player.playerId && e.player.isSelf === t.player.isSelf && e.player.canToggleInHand === t.player.canToggleInHand && e.player.inHand === t.player.inHand && e.player.canPassEnrollment === t.player.canPassEnrollment && yd(e.seatPlayer, t.seatPlayer);
}
//#endregion
//#region src/table/TableSeatSlot.tsx
function Xd(e) {
	return {
		left: `${e.x}%`,
		top: `${e.y}%`
	};
}
function Zd({ seatIndex: e, player: t, seatPlayer: n, playerCount: r, isMobile: i, clockwiseDealing: a, layoutOverride: o, seatIndexAttr: s, onToggleInHand: c, onPassEnrollment: u, onTrickDelta: d, onReaction: f }) {
	let p = (0, l.useMemo)(() => o ?? Kd(e, r, {
		isMobile: i,
		isSelf: t.isSelf
	}), [
		o,
		e,
		r,
		i,
		t.isSelf
	]), m = (0, l.useMemo)(() => Xd(p), [p.x, p.y]), h = (0, l.useCallback)(() => {
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
		children: /* @__PURE__ */ (0, C.jsx)(Sd, {
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
var Qd = (0, l.memo)(Zd, Yd), $d = 5e3, ef = 1e3, tf = 12e3, nf = 4e3, rf = 9500;
function af(e = Bl()) {
	let t = e ? .55 : 1, n = (e) => Math.max(80, Math.round(e * t));
	return {
		anteChipTravelMs: n(220),
		dealCardStaggerMs: n(130),
		dealFanMs: n(600),
		trumpRevealHoldMs: n($d),
		trumpMergeAnimMs: n(480),
		enrollmentSeatPulseMs: n(480),
		drawDiscardMs: n(400),
		drawReplaceMs: n(700),
		drawReadyBeatMs: n(500),
		settleHoldMs: n(ef),
		nextHandResetMs: n(550),
		handResetMs: n(500)
	};
}
function of(e, t, n = Bl()) {
	let r = af(n), i = Math.max(0, e), a = Math.max(0, t);
	return i === 0 && a === 0 ? Math.max(120, Math.round(r.drawDiscardMs * .6)) : i * r.drawDiscardMs + a * r.drawReplaceMs + 80;
}
//#endregion
//#region src/table/layout/seatOrder.ts
function sf(e, t) {
	let n = [...new Set(e.filter(Boolean))];
	if (!n.length) return [];
	let r = t.seatedIds?.filter((e) => n.includes(e));
	if (r?.length === n.length) return r;
	let i = t.handEnrollment?.orderedPlayerIds?.filter((e) => n.includes(e));
	if (i?.length === n.length) return i;
	let a = To(t.dealerId, n), o = n.filter((e) => !a.includes(e));
	return o.length ? [...a, ...o] : a;
}
function cf(e, t, n) {
	let r = new Map(e.map((e) => [e.playerId, e])), i = sf(e.map((e) => e.playerId), t);
	if (!i.length) return e;
	let a = n ?? e.find((e) => e.isSelf)?.playerId ?? null, o = a ? i.indexOf(a) : 0;
	return (o > 0 ? [...i.slice(o), ...i.slice(0, o)] : i).map((e) => r.get(e)).filter((e) => e != null);
}
//#endregion
//#region src/table/layout/mobileSeatMap.ts
function lf(e, t) {
	let n = Math.max(1, Math.min(7, e || 1));
	return t === "portrait" ? n <= 1 ? .8 : n <= 2 ? .82 : n <= 3 ? .86 : n <= 4 ? .9 : .94 : n <= 1 ? 1.02 : n <= 2 ? .98 : n <= 3 ? 1.02 : n <= 5 ? 1.16 : 1.26;
}
//#endregion
//#region src/table/trumpHolderPresentation.ts
function uf(e) {
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
function df(e) {
	return e <= 0 ? null : e - 1;
}
function ff(e, t, n, r, i) {
	if (i || !t.trumpHolderId || e !== t.trumpHolderId || r <= 0) return {
		revealedTrumpUpcard: null,
		revealedTrumpIndex: null,
		seatTrumpMergeActive: !1
	};
	let a = t.showRevealedTrumpAtHolder ? df(r) : null;
	return {
		revealedTrumpUpcard: t.showRevealedTrumpAtHolder ? n : null,
		revealedTrumpIndex: a,
		seatTrumpMergeActive: t.trumpMergeActive
	};
}
//#endregion
//#region src/table/hooks/useTableSeatModel.ts
function pf({ session: e, players: t, currentUserId: n = null, potMetrics: r, handPresentation: i, microinteractions: a, trumpHolderPresentation: o, mobileOrientation: s = null }) {
	let c = $l(ou, su, du, fu), u = (0, l.useMemo)(() => t.map((e) => ({
		...e,
		isSelf: e.isSelf || n != null && e.playerId === n
	})), [t, n]), d = (0, l.useMemo)(() => cf(u, e, n), [
		u,
		e,
		n
	]), f = d.length, p = (0, l.useMemo)(() => d.filter((e) => !e.isSelf), [d]), m = `btable--p${Math.min(8, Math.max(2, f))}`, h = s == null ? Ol(f) : lf(p.length, s), g = af(), _ = (0, l.useMemo)(() => Object.fromEntries(u.map((e) => [e.playerId, e.displayName])), [u]), v = (0, l.useMemo)(() => new Set(e.participantIds.filter((t) => fl(t, c.displayTricksByPlayer, e.participantIds, e.phase))), [
		e.participantIds,
		e.phase,
		c.displayTricksByPlayer
	]), y = !!(c.suppressTurnPlayerId || i.suppressTurnIndicator), b = (0, l.useMemo)(() => {
		let t = /* @__PURE__ */ new Map();
		for (let n of u) {
			let s = c.displayTricksByPlayer[n.playerId] ?? 0, l = c.trickWinnerSeatId === n.playerId, u = c.phase === "collectTrick" && l, d = i.enrollmentPulse[n.playerId], f = i.animatingDrawPlayerId === n.playerId, p = ff(n.playerId, o, e.trumpUpcard ?? null, n.holeCardCount ?? 0, n.isSelf);
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
function mf(e, t, n) {
	let r = Number.isFinite(e) && e > 0 ? e : 0, i = r > 0 ? Math.max(t, r) : t;
	return {
		height: Math.max(i > 0 ? i : n, n),
		peak: i
	};
}
function hf(e, t, n, r) {
	let i = mf(e, t, n), a = Math.max(152, n);
	return {
		height: i.peak > 0 ? Math.min(i.height, r) : Math.min(a, r),
		peak: i.peak
	};
}
function gf(e, t, n = 72) {
	return mf(e, t, n);
}
function _f(e, t) {
	let n = Math.max(.75, e);
	return t.portrait ? Math.min(n, .98) : Math.min(n, 1.32);
}
function vf(e) {
	let t = Math.max(2, Math.min(8, e || 4));
	return t <= 3 ? .7 : t <= 4 ? .68 : t <= 5 ? .62 : .56;
}
function yf(e) {
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
function bf(e) {
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
function xf(e) {
	return {
		left: e.left,
		top: e.top,
		right: e.right,
		bottom: e.bottom,
		width: e.width,
		height: e.height
	};
}
function Sf(e, t, n = 2) {
	return e.left >= t.left - n && e.top >= t.top - n && e.right <= t.right + n && e.bottom <= t.bottom + n;
}
//#endregion
//#region src/table/presentationMotionBusy.ts
var Cf = !1, wf = !1, Tf = /* @__PURE__ */ new Set();
function Ef() {
	for (let e of Tf) e();
}
function Df(e) {
	Cf !== e && (Cf = e, Ef());
}
function Of() {
	return Cf;
}
function kf(e) {
	wf !== e && (wf = e, Ef());
}
function Af() {
	return wf;
}
function jf(e) {
	return Tf.add(e), () => Tf.delete(e);
}
function Mf() {
	Cf = !1, wf = !1, Ef();
}
//#endregion
//#region src/table/useMobileTable.ts
var Nf = "(max-width: 900px), ((hover: none) and (pointer: coarse))";
function Pf() {
	let [e, t] = (0, l.useState)(() => typeof window < "u" && window.matchMedia("(max-width: 900px), ((hover: none) and (pointer: coarse))").matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Nf), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/table/hooks/useStageFit.ts
function Ff(e, t) {
	if (typeof window > "u") return t;
	let n = document.documentElement, r = getComputedStyle(n).getPropertyValue(e).trim(), i = parseFloat(r);
	return Number.isFinite(i) ? i : t;
}
function If(e, t) {
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
function Lf(e) {
	let t = e.closest(".btable-session")?.querySelector(".btable-desktop");
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return n.width <= 0 || n.height <= 0 ? null : {
		width: n.width,
		height: n.height
	};
}
function Rf(e, t) {
	let n = !!e.closest(".table-play-overlay");
	if (t && n) {
		let t = e.closest(".table-play-overlay__main");
		if (t) return t;
	}
	return e.closest(".btable-desktop__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function zf({ aspect: e, enabled: t = !0, sessionKey: n }) {
	let r = (0, l.useRef)(null), i = (0, l.useRef)(0), a = (0, l.useRef)(0), o = (0, l.useRef)(n), { settings: s } = Hc(), c = Pf();
	return (0, l.useLayoutEffect)(() => {
		if (!t || typeof window > "u") return;
		let l = r.current;
		if (!l) return;
		o.current !== n && (o.current = n, i.current = 0, a.current = 0);
		let u = l.closest(".btable-desktop__viewport") ?? l.closest(".table-play-overlay__main") ?? l.closest(".btable-session"), d = window.visualViewport, f = () => {
			let t = !!l.closest(".table-play-overlay"), n = typeof window < "u" && window.matchMedia("(orientation: portrait)").matches, r = Rf(l, c).getBoundingClientRect(), o = l.querySelector(".hand-panel")?.getBoundingClientRect(), u = t && c && n ? 100 : t && !c ? 120 : c ? 112 : 148, f = t && c && n || t && !c ? 200 : c ? 210 : 280, p = o?.height ?? 0, m = hf(p, i.current, u, f);
			i.current = m.peak;
			let h = m.height, g = c && t ? 12 : c ? 18 : t && !c ? 16 : 28, _ = Ff("--stage-fit-pad-x", c ? 8 : 16) + g, v = Ff("--stage-fit-pad-y", c ? 6 : 12) + g, y = Ff("--stage-fit-gap", c ? 8 : 12), b = d, x = Math.min(r.width, b?.width ?? window.innerWidth), S = Math.min(r.height, b?.height ?? window.innerHeight);
			if (t && c) {
				let e = Lf(l);
				if (e) x = e.width, S = e.height;
				else {
					let e = gf(If(l, c), a.current, 72);
					a.current = e.peak, S = Math.max(160, S - e.height);
				}
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = t && c ? 1 : C, T = c ? _f(e, { portrait: n }) : e, E = parseInt(getComputedStyle(l).getPropertyValue("--player-count").trim(), 10) || 4, D = t && c && !n, O = D ? {
				...yf({
					availWidth: x,
					availHeight: S,
					aspect: T,
					userScale: w,
					padX: _,
					padY: v,
					stageShare: vf(E)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : bf({
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
			let k = c || t, ee = k ? O.displayStageWidth : O.stageWidth, te = k ? O.displayStageHeight : O.stageHeight;
			if (t && c) {
				let e = Math.max(0, x - _ * 2), t = D ? Math.max(0, S - v * 2) : Math.max(120, S - v * 2 - h - y);
				ee = Math.min(ee * C, e), te = Math.min(te * C, t);
			}
			let A = t && !c ? C : c ? 1 : O.effectiveScale;
			if (l.style.setProperty("--stage-fit-width", `${Math.round(ee)}px`), l.style.setProperty("--stage-fit-height", `${Math.round(te)}px`), l.style.setProperty("--stage-fit-scale", String(O.fitScale)), l.style.setProperty("--stage-effective-scale", String(A)), (l.closest(".btable-desktop__scale") ?? l.parentElement)?.style.setProperty("--stage-effective-scale", String(A)), localStorage.getItem("stageFitDebug") === "1") {
				let e = l.querySelector(".table-stage"), a = l.querySelectorAll(".bseat__avatar-wrap"), o = e ? xf(e.getBoundingClientRect()) : null, s = xf(document.documentElement.getBoundingClientRect()), u = [...a].filter((e) => !Sf(xf(e.getBoundingClientRect()), s, 1)).length;
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
			Of() || Af() || (p ??= window.requestAnimationFrame(() => {
				p = null, f();
			}));
		}, h = new ResizeObserver(m), g = l.querySelector(".hand-panel");
		g && h.observe(g);
		let _ = Rf(l, c);
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
function Bf({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r, pileIndexRef: i, onDiscardCommitted: a }) {
	let o = (0, l.useRef)(null);
	(0, l.useLayoutEffect)(() => {
		let s = e.animatingDrawPlayerId, c = e.drawAnimSubPhase, l = e.drawDiscardCount;
		if (c !== "discard" || !s || l <= 0) {
			c !== "discard" && (o.current = null);
			return;
		}
		if (s === n) return;
		let u = `${t}:${s}:${l}`;
		o.current !== u && (o.current = u, Ba({
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
function Vf({ handPresentation: e, handNumber: t, currentUserId: n, tableRootRef: r }) {
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
		i.current !== l && (i.current = l, La({
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
function Hf(e = document) {
	ga(), Pa();
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = e instanceof Document ? t.body : e;
	for (let e of n.querySelectorAll(".discard-fly-ghost, .draw-receive-fly-ghost")) e.remove();
}
//#endregion
//#region src/table/hooks/useTableDrawMotionCleanup.ts
function Uf({ handNumber: e, sessionPhase: t, turnPlayerId: n, drawCompletedIds: r, currentUserId: i, handPresentation: a, tableRootRef: o }) {
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
		s.current !== l && (s.current = l, Hf(c));
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
		e && (Hf(e), s.current = null);
	}, [e, o]);
}
var Wf = /* @__PURE__ */ new Set();
function Gf(e, t = 5) {
	let n = [];
	for (let r = 0; r < t; r += 1) for (let t of e) n.push({
		playerId: t,
		roundIndex: r,
		stepIndex: n.length
	});
	return n;
}
function Kf(e, t = I()) {
	if (e <= 0) return 0;
	let n = t ? .35 : 1, r = Math.round(780 * n), i = Math.round(540 * n);
	return (e - 1) * r + i + Math.round(130 * n);
}
function qf(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		let e = i.querySelector("[data-trump-deal-target]");
		if (e) return na(e);
	}
	let a = i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`) ?? i.querySelector(`[data-deal-seat="${e}"] [data-deal-round="${t}"]`), o = a?.querySelector(".pcard") ?? a;
	return o ? na(o) : null;
}
function Jf(e, t) {
	return {
		midX: e * .45,
		midY: t * .45 - Math.max(28, Math.hypot(e, t) * .24)
	};
}
function Yf(e) {
	let t = document.createElement("div");
	return t.className = "deal-fly-ghost", t.setAttribute("aria-hidden", "true"), t.style.position = "fixed", t.style.left = `${e.left}px`, t.style.top = `${e.top}px`, t.style.width = `${e.width}px`, t.style.height = `${e.height}px`, t.style.pointerEvents = "none", t.style.zIndex = "4", t;
}
function Xf(e, t, n, r) {
	let i = n instanceof Document ? n : n.ownerDocument ?? document;
	if (r && e === r && t === 4) {
		i.querySelector("[data-trump-deal-target]")?.classList.add("deal-card--revealed");
		return;
	}
	i.querySelector(`[data-deal-seat="${e}"][data-deal-round="${t}"]`)?.classList.add("deal-card--revealed");
}
function Zf(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".deal-card--revealed")) e.classList.remove("deal-card--revealed");
	for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
}
function Qf() {
	for (let e of Wf) e.kill();
	Wf.clear();
}
function $f({ steps: e, root: t, trumpHolderId: n = null, onStepComplete: r, onComplete: i }) {
	oa(t), Qf();
	let a = I(), o = F(540 / 1e3, a), s = F(130 / 1e3, a), c = a ? .04 : 110 / 1e3, l = Ca(t), u = G.timeline({
		onComplete: () => {
			Wf.delete(u), i?.();
		},
		onInterrupt: () => {
			Wf.delete(u);
			for (let e of t.querySelectorAll(".deal-fly-ghost")) e.remove();
		}
	});
	if (Wf.add(u), !l || e.length === 0) {
		for (let r of e) Xf(r.playerId, r.roundIndex, t, n);
		return u.call(() => i?.()), u;
	}
	e.forEach((e, i) => {
		let d = i * (o + s + c), f = qf(e.playerId, e.roundIndex, t, n);
		u.call(() => {
			if (!f) {
				Xf(e.playerId, e.roundIndex, t, n), r?.(e);
				return;
			}
			let i = Yf(l);
			t.appendChild(i);
			let c = na(i), { x: u, y: d } = aa(c, l), p = f.left + f.width / 2, m = f.top + f.height / 2, h = c.left + c.width / 2, g = c.top + c.height / 2, _ = p - h, v = m - g, { midX: y, midY: b } = Jf(_, v);
			G.set(i, {
				transformOrigin: "50% 80%",
				willChange: "transform,opacity",
				x: u,
				y: d,
				rotation: -12,
				rotationY: a ? 0 : -68,
				scale: a ? 1 : .62,
				opacity: +!!a
			});
			let x = G.timeline({ onComplete: () => {
				i.remove(), Xf(e.playerId, e.roundIndex, t, n), r?.(e);
			} });
			a ? x.to(i, {
				x: _,
				y: v,
				rotation: 0,
				rotationY: 0,
				scale: 1,
				opacity: 1,
				duration: o,
				ease: M
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
				ease: M
			}), x.to(i, {
				scale: 1.02,
				duration: s * .45,
				yoyo: !0,
				repeat: 1,
				ease: P
			}, o);
		}, void 0, d);
	});
	let d = Kf(e.length, a) + 120, f = window.setTimeout(() => {
		u.progress() < 1 && u.progress(1);
	}, d);
	return u.eventCallback("onComplete", () => window.clearTimeout(f)), u.eventCallback("onInterrupt", () => window.clearTimeout(f)), u;
}
//#endregion
//#region src/table/hooks/useTableDealPresentation.ts
function ep({ session: e, heroCards: t, privateHandReady: n = !1, tableRootRef: r }) {
	let [i, a] = (0, l.useState)(!1), o = (0, l.useRef)(null), s = (0, l.useRef)(e.handNumber);
	return (0, l.useLayoutEffect)(() => {
		let t = r.current;
		t && s.current !== e.handNumber && (s.current = e.handNumber, o.current = null, Qf(), Zf(t), Df(!1), a(!1));
	}, [e.handNumber, r]), (0, l.useLayoutEffect)(() => {
		let i = r.current;
		if (!i) return;
		let s = e.phase === "reveal" || e.phase === "decision" || e.phase === "draw" || e.phase === "play", c = t.length;
		if (!s || !n || c < 5) return;
		let l = `${e.handNumber}:${c}:${e.participantIds.join(",")}`;
		if (o.current === l) return;
		let u = sf(e.participantIds, e), d = Eo(e.dealerId, e.participantIds, u.length ? u : e.participantIds);
		if (d.length < 2) return;
		let f = Gf(d, 5);
		if (!f.length) return;
		o.current = l, Qf(), Zf(i), i.classList.add("btable-wrap--clockwise-dealing"), a(!0), Df(!0);
		let p = Bl(), m = window.requestAnimationFrame(() => {
			$f({
				steps: f,
				root: i,
				trumpHolderId: e.trumpHolderId ?? e.dealerId ?? null,
				onComplete: () => {
					i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), Df(!1);
				}
			});
		}), h = window.setTimeout(() => {
			i.classList.remove("btable-wrap--clockwise-dealing"), a(!1), Df(!1);
		}, Kf(f.length, p) + 400);
		return () => {
			window.cancelAnimationFrame(m), window.clearTimeout(h), Qf(), i.classList.remove("btable-wrap--clockwise-dealing"), Df(!1), a(!1);
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
function tp(e) {
	let t = 2166136261;
	for (let n = 0; n < e.length; n++) t ^= e.charCodeAt(n), t = Math.imul(t, 16777619);
	return t >>> 0;
}
function np(e, t) {
	return (e >>> t & 65535) / 65535;
}
function rp(e, t) {
	let n = tp(`${e}@book${t}`), r = np(n, 0), i = np(n, 9), a = np(n, 17), o = r >= .5 ? 1 : -1, s = i >= .5 ? 1 : -1;
	return {
		offsetX: o * (1.5 + r * 2.5) + t * 2.2,
		offsetY: t * -1.8 + i * 1.2,
		rotation: s * (4 + a * 5) + t * 2.5,
		scale: .88 - t * .02,
		zIndex: t + 1
	};
}
function ip(e) {
	return `${e.playerId}:h${e.handNumber}:t${e.trickNumber}`;
}
//#endregion
//#region src/table/animations/wonTrickPileMotion.ts
var ap = /* @__PURE__ */ new Set(), op = /* @__PURE__ */ new Set(), sp = re.drawDiscard;
function cp(e, t) {
	return {
		midX: e * .5,
		midY: t * .5
	};
}
function lp(e, t = document) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document, r = n.querySelector(`[data-won-trick-pile-anchor="${e}"]`) ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`);
	return r ? na(r) : null;
}
function up() {
	for (let e of op) G.set(e, { clearProps: "opacity,transform,willChange,zIndex" });
	op.clear();
}
function dp(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) e.remove();
}
function fp(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document;
	for (let e of t.querySelectorAll(".bseat--pile-reveal-ready")) e.classList.remove("bseat--pile-reveal-ready");
}
function pp(e = document) {
	for (let e of ap) e.kill();
	ap.clear(), dp(e), up(), fp(e);
}
function mp() {
	for (let e of ap) e.kill();
	ap.clear(), up();
}
function hp(e, t) {
	let n = window.setTimeout(() => {
		e.progress() < 1 && e.progress(1);
	}, t);
	e.eventCallback("onComplete", () => window.clearTimeout(n)), e.eventCallback("onInterrupt", () => window.clearTimeout(n));
}
function gp(e, t) {
	let n = na(e), r = document.createElement("div");
	r.className = "won-trick-fly-ghost", r.setAttribute("aria-hidden", "true"), r.style.position = "fixed", r.style.left = `${n.left}px`, r.style.top = `${n.top}px`, r.style.width = `${n.width}px`, r.style.height = `${n.height}px`, r.style.pointerEvents = "none", r.style.zIndex = "4", r.style.transformOrigin = "50% 50%";
	let i = e.cloneNode(!0);
	return i.style.width = "100%", i.style.height = "100%", r.appendChild(i), t.appendChild(r), r;
}
function _p(e, t) {
	let n = t instanceof Document ? t : t.ownerDocument ?? document;
	(n.querySelector(`[data-won-trick-pile-anchor="${e}"]`)?.closest(".bseat") ?? n.querySelector(`[data-seat-motion-anchor="${e}"]`)?.closest(".bseat"))?.classList.add("bseat--pile-reveal-ready");
}
function vp(e, t) {
	oa(t.root ?? document);
	let n = I(), r = t.root ?? document, i = t.host ?? (r instanceof HTMLElement ? r : document.body), a = lp(t.winnerPlayerId, r), o = n ? .06 : 140 / 1e3, s = F(sp, n), c = n ? .03 : .05, l = [], u = (e) => {
		ap.delete(d);
		for (let e of l) e.remove();
		up(), e && _p(t.winnerPlayerId, r), t.onComplete?.();
	}, d = G.timeline({
		onComplete: () => u(!0),
		onInterrupt: () => u(!1)
	});
	ap.add(d), e.forEach((e, r) => {
		let u = rp(t.trickKey, t.bookIndex), f = gp(e, i);
		l.push(f), op.add(e), G.set(e, { opacity: 0 });
		let p = na(f);
		G.set(f, {
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
		let h = a.left + a.width / 2 + u.offsetX, g = a.top + a.height / 2 + u.offsetY, _ = p.left + p.width / 2, v = p.top + p.height / 2, y = h - _, b = g - v, { midX: x, midY: S } = cp(y, b);
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
	return hp(d, Math.min(760, Math.max(300, f))), d;
}
function yp() {
	return ap.size > 0;
}
function bp(e) {
	let t = e instanceof Document ? e : e.ownerDocument ?? document, n = [...t.querySelectorAll("[data-trick-variant=\"live\"] .btrick__play .pcard, [data-testid=\"trick-row\"] .btrick__play .pcard")].filter((e) => e.closest("[data-trick-variant=\"echo\"]") == null);
	return n.length > 0 ? n : [...t.querySelectorAll("[data-trick-variant=\"echo\"] .btrick__play .pcard")];
}
//#endregion
//#region src/table/hooks/useWonTrickCollection.ts
var xp = new Set(["nextLeadReady", "live"]);
function Sp({ trickCollection: e, handNumber: t, sessionPhase: n = null, handComplete: r = !1, tableRootRef: i }) {
	let a = (0, l.useRef)(null), o = (0, l.useRef)(t), s = (0, l.useRef)(e.phase), c = (0, l.useRef)(null), u = (0, l.useRef)(!1), d = () => {
		c.current != null && (window.clearTimeout(c.current), c.current = null);
	}, f = (e) => {
		d();
		let t = yp() ? 820 : 0;
		c.current = window.setTimeout(() => {
			c.current = null, Cp(e);
		}, t);
	};
	(0, l.useLayoutEffect)(() => {
		let e = i.current;
		if (e) {
			if (o.current !== t) {
				o.current = t, a.current = null, d(), pp(e);
				return;
			}
			(r || n != null && n !== "play") && (a.current = null, d(), pp(e));
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
		if (!o || (n === "collectTrick" && xp.has(r) && (a.current = null, u.current = !1, f(o)), r !== "collectTrick")) return;
		let c = e.trickWinnerSeatId, l = e.frozenTrick;
		if (!c || !l) return;
		let p = `${l.trickNumber}:${c}:${l.plays.length}`;
		if (a.current === p) return;
		a.current = p, u.current = !0, d(), mp(), wp(o);
		let m = bp(o);
		if (!m.length) {
			u.current = !1;
			return;
		}
		let h = Math.max(0, (e.displayTricksByPlayer[c] ?? 1) - 1), g = ip({
			playerId: c,
			handNumber: t,
			trickNumber: l.trickNumber
		});
		kf(!0);
		let _ = window.setTimeout(() => {
			vp(m, {
				winnerPlayerId: c,
				trickKey: g,
				bookIndex: h,
				root: o,
				host: o,
				onComplete: () => {
					u.current = !1, kf(!1);
				}
			});
		}, 240);
		return () => {
			window.clearTimeout(_), u.current = !1, kf(!1);
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
			d(), e ? pp(e) : mp();
		};
	}, [i]);
}
function Cp(e) {
	for (let t of e.querySelectorAll(".bseat--pile-reveal-ready")) t.classList.remove("bseat--pile-reveal-ready");
}
function wp(e) {
	for (let t of e.querySelectorAll(".won-trick-fly-ghost, .won-trick-fly-packet")) t.remove();
}
var Tp;
function Ep() {
	return Tp === void 0 ? !1 : Tp;
}
function Dp() {
	if (Ep()) return !0;
	if (typeof window > "u") return !1;
	try {
		return window.localStorage?.getItem("nbl-table-render-profile") === "1" ? !0 : new URLSearchParams(window.location.search).get("tableProfile") === "1";
	} catch {
		return !1;
	}
}
function Op(e, t, n, r, i, a, o = 8) {
	n <= o || console.log("[PROFILE]", {
		id: e,
		phase: t,
		actualDuration: Number(n.toFixed(2)),
		baseDuration: Number(r.toFixed(2)),
		startTime: Number(i.toFixed(2)),
		commitTime: Number(a.toFixed(2))
	});
}
var kp = (e, t, n, r, i, a) => {
	Dp() && Op(e, t, n, r, i, a);
};
//#endregion
//#region src/table/tableProfiler.tsx
function Ap({ id: e, children: t }) {
	return Dp() ? /* @__PURE__ */ (0, C.jsx)(l.Profiler, {
		id: e,
		onRender: kp,
		children: t
	}) : /* @__PURE__ */ (0, C.jsx)(C.Fragment, { children: t });
}
//#endregion
//#region src/table/CardTable.tsx
function jp({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: g, recommendedDiscardIndices: _ = [], handComplete: v = !1, actionFeedback: y, handPresentation: b, microinteractions: x, instantTrickPlays: S = !1, bigPotEvent: w = null, onDismissTableEvent: T, onToggleInHand: E, onPassEnrollment: D, onTrickDelta: O, onSubmitDraw: k, onPassDraw: ee, onFoldDraw: te, onPlayCard: A, onReaction: ne, onHeroUserActivity: j }) {
	let { rotated: M, playerCount: N, countClass: P, tableAspect: re, handTiming: ie, playerNames: F, displayPlayersById: I, selfPlayer: L, suppressTurn: R, drawCompleted: ae, hasActiveTurn: oe, potMetricsForCenter: se, wrapStyle: ce } = pf({
		session: e,
		players: t,
		currentUserId: m,
		potMetrics: n,
		handPresentation: b,
		microinteractions: x,
		trumpHolderPresentation: f
	}), z = $l(ou, su, hu, gu), le = e.sessionId, B = zf({
		aspect: re,
		sessionKey: le
	}), { cards: ue, pileIndexRef: de, commitDiscardCards: fe } = Ra({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: B
	});
	Bf({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: B,
		pileIndexRef: de,
		onDiscardCommitted: fe
	}), Vf({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: B
	}), Uf({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: b,
		tableRootRef: B
	});
	let pe = ep({
		session: e,
		heroCards: a,
		privateHandReady: p,
		tableRootRef: B
	});
	Sp({
		trickCollection: z,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: v,
		tableRootRef: B
	});
	let me = (0, l.useMemo)(() => ({
		potMetrics: se,
		participantCount: r,
		trumpUpcard: e.trumpUpcard,
		trumpSuit: e.trumpSuit,
		phase: e.phase,
		enrollmentActive: i,
		remainingDeckCount: e.remainingDeckCount,
		trickLeadSuit: e.currentTrick?.leadSuit ?? e.leadSuit ?? null,
		playerNames: F,
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
		discardPileCards: ue
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
		F,
		b,
		u,
		d,
		x.potTick,
		x.trumpReminderPulse,
		S,
		ue
	]);
	return /* @__PURE__ */ (0, C.jsx)(Ap, {
		id: "GameTable",
		children: /* @__PURE__ */ (0, C.jsxs)("div", {
			ref: B,
			className: [
				"btable-wrap btable-wrap--stage-fit",
				P,
				oe ? "btable-wrap--has-active-turn" : "",
				pe ? "btable-wrap--clockwise-dealing" : ""
			].filter(Boolean).join(" "),
			"data-testid": "table-root",
			style: ce,
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
									children: /* @__PURE__ */ (0, C.jsx)(Ap, {
										id: "TrickArea",
										children: /* @__PURE__ */ (0, C.jsx)(xu, { ...me })
									})
								}),
								/* @__PURE__ */ (0, C.jsx)(Ap, {
									id: "PlayerSeats",
									children: /* @__PURE__ */ (0, C.jsx)("div", {
										className: "btable__seats",
										"aria-label": "Players at the table",
										children: M.map((e, t) => /* @__PURE__ */ (0, C.jsx)(Qd, {
											seatIndex: t,
											player: e,
											seatPlayer: I.get(e.playerId) ?? e,
											playerCount: N,
											isMobile: !1,
											clockwiseDealing: pe,
											onToggleInHand: E,
											onPassEnrollment: D,
											onTrickDelta: O,
											onReaction: ne
										}, e.playerId))
									})
								})
							]
						})
					})
				})
			}), /* @__PURE__ */ (0, C.jsx)(Ap, {
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
						isInHand: !!L?.inHand,
						isDealer: !!L?.isDealer,
						signedIn: !!m,
						isMyTurn: !!(m && e.turnPlayerId === m) && !R,
						dealStaggerMs: ie.dealCardStaggerMs,
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
						onSubmitDraw: k,
						onPassDraw: ee,
						onFoldDraw: te,
						onPlayCard: A,
						currentUserId: m,
						revealedTrumpIndex: o,
						trumpMergeActive: s,
						trumpDisabledIndex: c,
						handNumber: e.handNumber,
						tableRootRef: B,
						pileIndexRef: de,
						onDiscardCommitted: fe,
						onUserActivity: j,
						skipHeroDealMotion: pe
					})]
				})
			})]
		})
	});
}
//#endregion
//#region src/table/layout/useTableLayoutMode.ts
var Mp = "(orientation: portrait)";
function Np() {
	let e = Pf(), [t, n] = (0, l.useState)(() => typeof window < "u" && window.matchMedia(Mp).matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Mp), t = () => n(e.matches);
		return t(), e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []), e ? t ? "mobile-portrait" : "mobile-landscape" : "desktop";
}
//#endregion
//#region src/table/hooks/useMobileStageFit.ts
function Pp(e, t) {
	if (typeof window > "u") return t;
	let n = getComputedStyle(document.documentElement).getPropertyValue(e).trim(), r = parseFloat(n);
	return Number.isFinite(r) ? r : t;
}
function Fp(e) {
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
function Ip(e) {
	return e.closest(".btable-mobile__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function Lp({ aspect: e, sessionKey: t }) {
	let n = (0, l.useRef)(null), r = (0, l.useRef)(0), i = (0, l.useRef)(0), a = (0, l.useRef)(t), o = Np(), { settings: s } = Hc(), c = o === "mobile-portrait";
	return (0, l.useLayoutEffect)(() => {
		if (typeof window > "u") return;
		let o = n.current;
		if (!o) return;
		a.current !== t && (a.current = t, r.current = 0, i.current = 0);
		let l = window.visualViewport, u = () => {
			let t = Ip(o).getBoundingClientRect(), n = o.querySelector(".btable-mobile-hero-dock")?.getBoundingClientRect(), a = !!o.closest(".table-play-overlay"), u = c ? 104 : 92, d = c ? 210 : 168, f = hf(n?.height ?? 0, r.current, u, d);
			r.current = f.peak;
			let p = f.height, m = parseInt(getComputedStyle(o).getPropertyValue("--player-count").trim(), 10) || 4, h = m <= 4, g = !c, _ = (g && h ? Pp("--mobile-fit-pad-x", 4) : Pp("--mobile-fit-pad-x", 8)) + (g && a ? 4 : 12), v = (g && h ? Pp("--mobile-fit-pad-y", 2) : Pp("--mobile-fit-pad-y", 6)) + (g && a ? 4 : 10), y = Pp("--mobile-fit-gap", c ? 8 : 6), b = l, x = Math.min(t.width, b?.width ?? window.innerWidth), S = Math.min(t.height, b?.height ?? window.innerHeight);
			if (a) {
				let e = gf(Fp(o), i.current, 72);
				i.current = e.peak, S = Math.max(140, S - e.height);
			}
			let C = Math.max(.85, Math.min(1.35, s.tableScale || 1)), w = g ? {
				...yf({
					availWidth: x,
					availHeight: S,
					aspect: e,
					userScale: 1,
					padX: _,
					padY: v,
					stageShare: vf(m)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : bf({
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
			Of() || Af() || (d ??= window.requestAnimationFrame(() => {
				d = null, u();
			}));
		}, p = new ResizeObserver(f), m = o.querySelector(".btable-mobile-hero-dock");
		m && p.observe(m);
		let h = Ip(o);
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
function Rp({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], revealedTrumpIndex: o = null, trumpMergeActive: s = !1, trumpDisabledIndex: c = null, hideCenterTrump: u = !1, showTrumpSuitReminder: d = !1, trumpHolderPresentation: f, privateHandReady: p = !1, currentUserId: m = null, legalPlayIndices: h, recommendedPlayIndex: g, recommendedDiscardIndices: _ = [], handComplete: v = !1, actionFeedback: y, handPresentation: b, microinteractions: x, instantTrickPlays: S = !1, bigPotEvent: w = null, onDismissTableEvent: T, onToggleInHand: E, onPassEnrollment: D, onTrickDelta: O, onSubmitDraw: k, onPassDraw: ee, onFoldDraw: te, onPlayCard: A, onHeroUserActivity: ne }) {
	let j = Np() === "mobile-landscape" ? "landscape" : "portrait", M = pf({
		session: e,
		players: t,
		currentUserId: m,
		potMetrics: n,
		handPresentation: b,
		microinteractions: x,
		trumpHolderPresentation: f,
		mobileOrientation: j
	}), { rotated: N, opponents: P, playerCount: re, countClass: ie, handTiming: F, playerNames: I, displayPlayersById: L, selfPlayer: R, suppressTurn: ae, drawCompleted: oe, hasActiveTurn: se, potMetricsForCenter: ce, wrapStyle: z } = M, le = (0, l.useMemo)(() => R ? Jd(N.length, j) : null, [
		R,
		N.length,
		j
	]), B = $l(ou, su, hu, gu), ue = e.sessionId, de = Lp({
		aspect: M.tableAspect,
		sessionKey: ue
	}), { cards: fe, pileIndexRef: pe, commitDiscardCards: me } = Ra({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		tableRootRef: de
	});
	Bf({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: de,
		pileIndexRef: pe,
		onDiscardCommitted: me
	}), Vf({
		handPresentation: b,
		handNumber: e.handNumber,
		currentUserId: m,
		tableRootRef: de
	}), Uf({
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		turnPlayerId: e.turnPlayerId,
		drawCompletedIds: e.drawCompletedIds ?? [],
		currentUserId: m,
		handPresentation: b,
		tableRootRef: de
	});
	let he = ep({
		session: e,
		heroCards: a,
		privateHandReady: p,
		tableRootRef: de
	});
	Sp({
		trickCollection: B,
		handNumber: e.handNumber,
		sessionPhase: e.phase,
		handComplete: v,
		tableRootRef: de
	});
	let ge = (0, l.useMemo)(() => ({
		potMetrics: ce,
		participantCount: r,
		trumpUpcard: e.trumpUpcard,
		trumpSuit: e.trumpSuit,
		phase: e.phase,
		enrollmentActive: i,
		remainingDeckCount: e.remainingDeckCount,
		trickLeadSuit: e.currentTrick?.leadSuit ?? e.leadSuit ?? null,
		playerNames: I,
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
		discardPileCards: fe
	}), [
		ce,
		r,
		e.trumpUpcard,
		e.trumpSuit,
		e.phase,
		e.remainingDeckCount,
		e.currentTrick?.leadSuit,
		e.leadSuit,
		i,
		I,
		b,
		u,
		d,
		x.potTick,
		x.trumpReminderPulse,
		S,
		fe
	]);
	return /* @__PURE__ */ (0, C.jsx)(Ap, {
		id: "GameTable",
		children: /* @__PURE__ */ (0, C.jsxs)("div", {
			ref: de,
			className: [
				"btable-mobile-wrap btable-mobile-wrap--stage-fit",
				ie,
				se ? "btable-wrap--has-active-turn" : "",
				he ? "btable-wrap--clockwise-dealing" : ""
			].filter(Boolean).join(" "),
			"data-testid": "table-root",
			"data-layout": j,
			style: z,
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
									children: /* @__PURE__ */ (0, C.jsx)(Ap, {
										id: "TrickArea",
										children: /* @__PURE__ */ (0, C.jsx)(xu, { ...ge })
									})
								}),
								/* @__PURE__ */ (0, C.jsx)(Ap, {
									id: "PlayerSeats",
									children: /* @__PURE__ */ (0, C.jsxs)("div", {
										className: "btable__seats btable-mobile__seats",
										"aria-label": "Players at the table",
										children: [P.map((e, t) => /* @__PURE__ */ (0, C.jsx)(Qd, {
											seatIndex: t,
											player: e,
											seatPlayer: L.get(e.playerId) ?? e,
											playerCount: re,
											isMobile: !0,
											clockwiseDealing: he,
											layoutOverride: qd(t, N.length, j),
											onToggleInHand: E,
											onPassEnrollment: D,
											onTrickDelta: O
										}, e.playerId)), R && le && /* @__PURE__ */ (0, C.jsx)(Qd, {
											seatIndex: 0,
											player: R,
											seatPlayer: L.get(R.playerId) ?? R,
											playerCount: re,
											isMobile: !0,
											clockwiseDealing: he,
											layoutOverride: le,
											seatIndexAttr: 0,
											onToggleInHand: E,
											onPassEnrollment: D,
											onTrickDelta: O
										}, R.playerId)]
									})
								})
							]
						})
					})
				})
			}), /* @__PURE__ */ (0, C.jsx)(Ap, {
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
							isInHand: !!R?.inHand,
							isDealer: !!R?.isDealer,
							signedIn: !!m,
							isMyTurn: !!(m && e.turnPlayerId === m) && !ae,
							dealStaggerMs: F.dealCardStaggerMs,
							drawAnimSubPhase: b.animatingDrawPlayerId === m ? b.drawAnimSubPhase : null,
							drawDiscardCount: b.animatingDrawPlayerId === m ? b.drawDiscardCount : 0,
							drawReplaceCount: b.animatingDrawPlayerId === m ? b.drawReplaceCount : 0,
							drawCompleted: oe,
							maxDrawDiscards: e.maxDrawDiscards ?? 4,
							legalPlayIndices: h ?? void 0,
							recommendedPlayIndex: g ?? void 0,
							recommendedDiscardIndices: _,
							handComplete: v,
							actionFeedback: y,
							onSubmitDraw: k,
							onPassDraw: ee,
							onFoldDraw: te,
							onPlayCard: A,
							currentUserId: m,
							revealedTrumpIndex: o,
							trumpMergeActive: s,
							trumpDisabledIndex: c,
							handNumber: e.handNumber,
							tableRootRef: de,
							pileIndexRef: pe,
							onDiscardCommitted: me,
							onUserActivity: ne,
							skipHeroDealMotion: he
						})]
					}), i && !R?.inHand && /* @__PURE__ */ (0, C.jsx)("p", {
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
var zp = new Set(["pot-cap", "hand-win"]);
function Bp({ events: e, onDismiss: t }) {
	let n = [...e].reverse().find((e) => zp.has(e.kind));
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
function Vp({ children: e }) {
	let { settings: t } = Hc(), n = t.layoutMode === "tiled", r = Pf();
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
function Hp({ children: e }) {
	let t = Np();
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
function Up({ events: e, onDismiss: t }) {
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
function Wp({ compact: e = !1 }) {
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
function Gp({ open: e, onClose: t }) {
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
var Kp = 0;
function qp() {
	return Kp += 1, `evt-${Kp}-${Date.now()}`;
}
function Jp(e, t, n) {
	let r = t.currentPot, i = [];
	return r >= t.potCap && t.limEnabled && r > e.pot ? i.push({
		id: qp(),
		kind: "pot-cap",
		title: "Pot cap reached",
		subtitle: "LmT engaged",
		emoji: "🔒",
		durationMs: 2200
	}) : r >= t.anteAmount * Math.max(n.length, 2) * 2 && r > e.pot && i.push({
		id: qp(),
		kind: "big-pot",
		title: "Big pot brewing",
		emoji: "💰",
		durationMs: 2e3
	}), i;
}
function Yp({ session: e, potMetrics: t, participantIds: n }) {
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
		let o = Jp(r, t, n);
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
				id: qp(),
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
function Xp(e) {
	return !e?.rank || !e?.suit ? "" : `${e.rank}-${e.suit}`;
}
function Zp(e) {
	return e === "handReset" || e === "ante" || e === "trumpReveal" || e === "trumpMerge" || e === "drawPlayer" || e === "drawReady" || e === "settle" || e === "nextHandReset";
}
function Qp(e) {
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
function $p(e) {
	return e.phase === "play" ? "play" : e.phase === "draw" ? "drawPlayer" : e.phase === "decision" ? "decision" : e.phase === "reveal" ? "ante" : e.enrollmentActive ? "enrollment" : "idle";
}
function em(e) {
	return {
		phase: $p(e),
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
function tm(e, t, n = {}) {
	return {
		...e,
		...n,
		phase: t,
		phaseStartedAt: Date.now()
	};
}
function nm(e, t) {
	let n = {};
	for (let r of t.enrolledIds) e.enrolledIds.includes(r) || (n[r] = "join");
	for (let r of t.declinedIds) e.declinedIds.includes(r) || (n[r] = "pass");
	return n;
}
function rm(e, t, n) {
	for (let r of n.drawCompletedIds) if (!im(e, r) && !e.displayDrawCompletedIds.includes(r) && !t.drawCompletedIds.includes(r)) return r;
	return null;
}
function im(e, t) {
	return e.drawPresentationConsumedIds.includes(t);
}
function am(e) {
	return e.phase === "drawPlayer" && e.animatingDrawPlayerId != null && e.drawAnimSubPhase !== "done";
}
function om(e, t) {
	if (t.phase !== "draw" || !am(e)) return null;
	let n = e.animatingDrawPlayerId, r = t.turnPlayerId;
	return !n || !r || t.drawCompletedIds.includes(r) || n === r && !t.drawCompletedIds.includes(n) ? null : (X() && Z("handPresentation", "fast-forward-stale-draw", {
		animating: n,
		turnId: r,
		drawCompleted: t.drawCompletedIds
	}), {
		...fm(e, t),
		pendingSnapshot: t,
		prevSnapshot: t
	});
}
function sm(e, t) {
	return !t || im(e, t) ? e.drawPresentationConsumedIds : [...e.drawPresentationConsumedIds, t];
}
function cm(e, t) {
	return [...new Set([...e.drawPresentationConsumedIds, ...t])];
}
function lm(e, t, n) {
	for (let r of t.actionOrder) if (t.participantIds.includes(r) && t.drawCompletedIds.includes(r) && !n.includes(r) && !im(e, r)) return r;
	return null;
}
function um(e, t, n, r) {
	X() && Z("handPresentation", "draw-candidate-resolve", {
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
function dm(e, t, n) {
	X() && Z("handPresentation", `draw-receive-commit-${e}`, {
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
function fm(e, t) {
	let n = e.animatingDrawPlayerId;
	if (!n) return e.drawAnimSubPhase === "done" ? e : {
		...e,
		drawAnimSubPhase: "done"
	};
	let r = e.displayDrawCompletedIds.includes(n) ? e.displayDrawCompletedIds : [...e.displayDrawCompletedIds, n], i = sm(e, n), a = t == null ? e.prevSnapshot : {
		...t,
		drawCompletedIds: [...r]
	};
	return dm("payload", e, {
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
function pm(e, t) {
	return e > 0 ? "discard" : t > 0 ? "receive" : "done";
}
function mm(e, t, n, r, i, a) {
	return im(e, n) ? (um(e, t, null, `consumed-skip:${n}:${a}`), e) : am(e) && e.animatingDrawPlayerId !== n ? (um(e, t, null, `in-flight-skip:${a}`), e) : (um(e, t, n, a), tm(e, "drawPlayer", {
		animatingDrawPlayerId: n,
		drawAnimSubPhase: pm(r, i),
		drawDiscardCount: r,
		drawReplaceCount: i,
		prevSnapshot: t,
		drawPresentationConsumedIds: sm(e, n)
	}));
}
function hm(e) {
	if (!e.pendingHandSettle || e.phase !== "play") return e;
	let t = e.handSettleSnapshot ?? e.prevSnapshot;
	return t ? tm(e, "settle", {
		pendingHandSettle: !1,
		handSettleSnapshot: null,
		settleAnimActive: !0,
		settleCarryOver: t.carryOverPot > 0,
		prevSnapshot: t,
		displayPotAmount: t.potAmount
	}) : e;
}
function gm(e, t) {
	return tm(e, "ante", {
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
function _m(e, t, n, r) {
	let i = rm(e, {
		...t,
		drawCompletedIds: []
	}, t);
	return i ? mm(e, t, i, n, r, "beginDrawSequence") : tm(e, "drawPlayer", {
		displayDrawCompletedIds: e.displayDrawCompletedIds,
		prevSnapshot: t
	});
}
function vm(e, t) {
	if (e.length !== t.length) return !1;
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function ym(e, t) {
	let n = Object.keys(e), r = Object.keys(t);
	if (n.length !== r.length) return !1;
	for (let r of n) if (e[r] !== t[r]) return !1;
	return !0;
}
function bm(e, t) {
	return e.phase === t.phase && vm(e.displayDrawCompletedIds, t.displayDrawCompletedIds) && e.animatingDrawPlayerId === t.animatingDrawPlayerId && e.drawAnimSubPhase === t.drawAnimSubPhase && e.drawDiscardCount === t.drawDiscardCount && e.drawReplaceCount === t.drawReplaceCount && e.trumpRevealActive === t.trumpRevealActive && e.trumpMergeActive === t.trumpMergeActive && e.trumpMergedIntoHand === t.trumpMergedIntoHand && e.anteAnimActive === t.anteAnimActive && e.dealStaggerCount === t.dealStaggerCount && ym(e.enrollmentPulse, t.enrollmentPulse) && e.settleAnimActive === t.settleAnimActive && e.settleCarryOver === t.settleCarryOver && e.nextHandResetActive === t.nextHandResetActive && e.pendingHandSettle === t.pendingHandSettle && e.displayPotAmount === t.displayPotAmount;
}
function xm(e, t) {
	e.prevSnapshot = t.prevSnapshot, e.pendingSnapshot = t.pendingSnapshot, e.handSettleSnapshot = t.handSettleSnapshot, e.drawPresentationConsumedIds = t.drawPresentationConsumedIds, e.handNumber = t.handNumber;
}
function Sm(e, t) {
	return e === t ? e : bm(e, t) ? (xm(e, t), e) : t;
}
function Cm(e, t) {
	let n = Sm(e, wm(e, t));
	return X() && (e.phase !== n.phase || e.handNumber !== n.handNumber || e.trumpRevealActive !== n.trumpRevealActive || t.type === "serverUpdate") && Z("handPresentation", t.type, {
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
function wm(e, t) {
	switch (t.type) {
		case "reset": return em(t.snapshot);
		case "dealCardRevealed": return {
			...e,
			dealStaggerCount: Math.max(e.dealStaggerCount, t.count)
		};
		case "clearEnrollmentPulse": return Object.keys(e.enrollmentPulse).length ? {
			...e,
			enrollmentPulse: {}
		} : e;
		case "watchdog": return e.pendingHandSettle && e.phase === "play" ? hm(e) : Date.now() - e.phaseStartedAt < 12e3 ? e : Tm({
			...e,
			pendingSnapshot: e.pendingSnapshot ?? e.prevSnapshot
		});
		case "tryBeginHandSettle": return hm(e);
		case "advancePhase": return Tm(e);
		case "serverUpdate": {
			let { snapshot: n, heroDrawDiscardCount: r = 0, heroDrawReplaceCount: i = 0 } = t, a = e.prevSnapshot ?? n;
			if (e.sessionKey !== n.sessionKey) {
				let e = em(n);
				return n.phase === "reveal" ? gm(e, n) : e;
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
				let e = em(n);
				return n.phase === "reveal" ? gm(e, n) : e;
			}
			let o = Xp(a.trumpUpcard), s = Xp(n.trumpUpcard);
			if (o && !s && !e.trumpMergeActive) return {
				...e,
				trumpRevealActive: !1,
				trumpMergeActive: !0,
				trumpMergedIntoHand: !0,
				prevSnapshot: n,
				pendingSnapshot: n,
				phaseStartedAt: Date.now()
			};
			if (n.phase === "play" && e.phase !== "play") return tm(e, "play", {
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
			if (Zp(e.phase) && e.phase !== "drawPlayer" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done") return {
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
			let c = nm(a, n), l = Object.keys(c).length > 0;
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
			if (n.phase === "reveal" && a.phase !== "reveal" && (e.phase === "idle" || e.phase === "nextHandReset" || e.phase === "enrollment" || e.phase === "settle" || e.phase === "play")) return gm(e, n);
			if (n.phase === "draw" && a.enrollmentActive && !n.enrollmentActive && e.phase === "enrollment") {
				let t = !!n.trumpUpcard;
				return tm(e, t ? "trumpReveal" : "ante", {
					trumpRevealActive: t,
					anteAnimActive: !0,
					dealStaggerCount: Math.max(e.dealStaggerCount, n.participantIds.length),
					prevSnapshot: n,
					displayPotAmount: n.potAmount
				});
			}
			if (n.phase === "draw" && (e.phase === "decision" || a.phase === "decision") && e.drawPresentationConsumedIds.length === 0 && e.displayDrawCompletedIds.length === 0 && e.phase !== "drawPlayer" && e.phase !== "drawReady") return _m(e, n, 0, 0);
			if (n.phase === "draw") {
				let t = om(e, n);
				t && (e = t);
				let o = rm(e, a, n);
				if (o && e.phase !== "drawReady") {
					let t = e.phase === "drawPlayer" && e.animatingDrawPlayerId === o && e.drawAnimSubPhase !== "done";
					if (!t && !am(e)) {
						let t = r > 0 || i > 0, a = t ? r : o === n.turnPlayerId ? 0 : 1;
						return mm(e, n, o, a, t ? i : a, "serverUpdate");
					}
					t ? um(e, n, null, "serverUpdate:animating-same-player") : am(e) && um(e, n, null, "serverUpdate:in-flight-other-player");
				} else o || um(e, n, null, "serverUpdate:no-candidate");
				if (n.drawCompletedIds.length === n.participantIds.length && n.participantIds.length > 0 && e.phase === "drawPlayer" && e.drawAnimSubPhase === "done") return tm(e, "drawReady", { prevSnapshot: n });
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
function Tm(e) {
	let t = e.pendingSnapshot ?? e.prevSnapshot;
	switch (e.phase) {
		case "handReset": return tm(e, "ante", {
			anteAnimActive: !0,
			pendingSnapshot: null
		});
		case "ante": return e.trumpRevealActive || t?.trumpUpcard ? tm(e, "trumpReveal", {
			trumpRevealActive: !0,
			anteAnimActive: !1,
			pendingSnapshot: null
		}) : t?.phase === "draw" ? _m(e, t, 0, 0) : tm(e, "drawPlayer", {
			anteAnimActive: !1,
			pendingSnapshot: null
		});
		case "trumpReveal": return t?.phase === "draw" ? {
			..._m(e, t, 0, 0),
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		} : tm(e, "drawPlayer", {
			trumpRevealActive: !1,
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0,
			pendingSnapshot: null
		});
		case "trumpMerge": return t?.phase === "draw" ? {
			..._m(e, t, 0, 0),
			trumpMergeActive: !1,
			trumpMergedIntoHand: !0
		} : tm(e, "drawPlayer", {
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
			dm("before", e);
			let n = e.animatingDrawPlayerId, r = fm(e, t);
			dm("after", r);
			let i = t ?? r.prevSnapshot;
			if (i && r.displayDrawCompletedIds.length >= i.participantIds.length) return tm(r, "drawReady", {
				displayDrawCompletedIds: r.displayDrawCompletedIds,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				pendingSnapshot: null,
				prevSnapshot: {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				},
				drawPresentationConsumedIds: cm(r, r.displayDrawCompletedIds)
			});
			if (i) {
				let e = {
					...i,
					drawCompletedIds: [...r.displayDrawCompletedIds]
				}, t = lm(r, i, r.displayDrawCompletedIds);
				if (dm("after", r, {
					playerId: n,
					nextCompleted: r.displayDrawCompletedIds,
					nextChosen: t
				}), t) return um(r, i, t, "advancePhase:nextPlayer"), mm(r, e, t, 1, 1, "advancePhase:nextPlayer");
				um(r, i, null, "advancePhase:no-next-player");
			}
			return r;
		}
		case "drawReady": return tm(e, "play", { pendingSnapshot: null });
		case "settle": return tm(e, "nextHandReset", {
			settleAnimActive: !1,
			nextHandResetActive: !0,
			pendingSnapshot: null
		});
		case "nextHandReset": return t ? em(t) : tm(e, "idle", { nextHandResetActive: !1 });
		default: return e;
	}
}
function Em(e) {
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
		isPresenting: Zp(e.phase)
	};
}
function Dm(e, t = !1) {
	let n = af(t);
	switch (e.phase) {
		case "handReset": return n.handResetMs;
		case "ante": return n.anteChipTravelMs * Math.max(1, Math.min(e.dealStaggerCount, 8));
		case "trumpReveal": return n.trumpRevealHoldMs;
		case "trumpMerge": return n.trumpMergeAnimMs;
		case "drawPlayer": return e.drawAnimSubPhase === "done" ? 0 : of(e.drawAnimSubPhase === "receive" ? 0 : e.drawDiscardCount, e.drawAnimSubPhase === "receive" ? e.drawReplaceCount : 0, t);
		case "drawReady": return n.drawReadyBeatMs;
		case "settle": return n.settleHoldMs;
		case "nextHandReset": return n.nextHandResetMs;
		default: return 0;
	}
}
//#endregion
//#region src/table/hooks/useHandPresentation.ts
var Om = [], km = [];
function Am(e, t) {
	let n = new Set(e), r = new Set(t);
	return {
		discardCount: [...n].filter((e) => !r.has(e)).length,
		replaceCount: [...r].filter((e) => !n.has(e)).length
	};
}
function jm({ session: e, enrollmentActive: t, potAmount: n, handComplete: r, trickPipelineActive: i = !1, forceTrickHandEndDrain: a, heroCards: o = km, enrolledIds: s = Om, declinedIds: c = Om, actionOrder: u }) {
	let d = (0, l.useMemo)(() => Qp({
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
	]), [f, p] = (0, l.useReducer)(Cm, d, em), m = (0, l.useRef)([]), h = (0, l.useRef)([]), g = (0, l.useRef)(null), _ = (0, l.useRef)(f);
	_.current = f;
	let v = () => {
		for (let e of m.current) window.clearTimeout(e);
		m.current = [], g.current = null;
	}, y = (e, t) => {
		let n = window.setTimeout(e, t);
		m.current.push(n);
	};
	return (0, l.useEffect)(() => () => v(), []), (0, l.useEffect)(() => {
		let e = o.map((e) => `${e.rank}-${e.suit}`), t = Am(h.current, e);
		h.current = e, p({
			type: "serverUpdate",
			snapshot: d,
			heroDrawDiscardCount: t.discardCount,
			heroDrawReplaceCount: t.replaceCount
		}), X() && Z("useHandPresentation", "serverUpdate-effect", {
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
		let e = Bl(), t = `${f.handNumber}:${f.phase}:${f.animatingDrawPlayerId ?? ""}:${f.drawAnimSubPhase}:${f.phaseStartedAt}`;
		if (g.current === t) {
			X() && Z("useHandPresentation", "advancePhase-timer-skip-duplicate", { phaseKey: t });
			return;
		}
		v();
		let n = Dm(f, e);
		if (n <= 0) return;
		let r = {
			handNumber: f.handNumber,
			phase: f.phase,
			animatingDrawPlayerId: f.animatingDrawPlayerId,
			drawAnimSubPhase: f.drawAnimSubPhase,
			phaseStartedAt: f.phaseStartedAt
		};
		g.current = t, X() && Z("useHandPresentation", "advancePhase-timer-armed", {
			phaseKey: t,
			delay: n,
			fromPhase: f.phase,
			drawAnimSubPhase: f.drawAnimSubPhase
		}), y(() => {
			if (g.current !== t) return;
			g.current = null;
			let e = _.current;
			if (e.handNumber !== r.handNumber || e.phase !== r.phase || e.animatingDrawPlayerId !== r.animatingDrawPlayerId || e.drawAnimSubPhase !== r.drawAnimSubPhase || e.phaseStartedAt !== r.phaseStartedAt) {
				X() && Z("useHandPresentation", "advancePhase-timer-stale", {
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
			X() && Z("useHandPresentation", "advancePhase-timer", {
				fromPhase: r.phase,
				delay: n,
				animatingDrawPlayerId: r.animatingDrawPlayerId,
				drawAnimSubPhase: r.drawAnimSubPhase
			}), p({ type: "advancePhase" });
		}, n), y(() => p({ type: "watchdog" }), f.phase === "drawPlayer" || f.phase === "drawReady" ? nf : tf);
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
			e.phase !== "play" || !e.pendingHandSettle || (X() && Z("useHandPresentation", "hand-end-convergence-force", { trickPipelineActive: !0 }), a?.(), p({ type: "tryBeginHandSettle" }));
		}, rf);
		return () => window.clearTimeout(e);
	}, [
		f.phase,
		f.pendingHandSettle,
		i,
		a
	]), (0, l.useMemo)(() => Em(f), [f]);
}
//#endregion
//#region src/table/TurnCountdownSync.tsx
function Mm({ input: e }) {
	return (0, l.useEffect)(() => {
		ld(e);
	}), (0, l.useEffect)(() => () => ud(), []), null;
}
var Nm = {
	pipelineActive: !1,
	revealCatchUp: !1,
	motionGateActive: !1,
	peakPlayCount: 0,
	displayedPlayCount: 0,
	handPresenting: !1,
	handPresentationPhase: "idle",
	dealPresentationActive: !1,
	trickCollectionActive: !1
}, Pm = Nm, Fm = /* @__PURE__ */ new Set(), Im = 0, Lm = null;
function Rm(e, t) {
	return e.pipelineActive === t.pipelineActive && e.revealCatchUp === t.revealCatchUp && e.motionGateActive === t.motionGateActive && e.peakPlayCount === t.peakPlayCount && e.displayedPlayCount === t.displayedPlayCount && e.handPresenting === t.handPresenting && e.handPresentationPhase === t.handPresentationPhase && e.dealPresentationActive === t.dealPresentationActive && e.trickCollectionActive === t.trickCollectionActive;
}
function zm(e) {
	return e.dealPresentationActive ? "dealPresentationActive" : e.trickCollectionActive ? "trickCollectionActive" : e.handPresenting ? "handPresenting" : e.pipelineActive ? "pipelineActive" : e.revealCatchUp ? "revealCatchUp" : e.peakPlayCount > e.displayedPlayCount && e.peakPlayCount > 0 ? "peakPlayCatchUp" : null;
}
function Bm(e) {
	return zm(e) != null;
}
function Vm(e, t, n) {
	return !(!e || n === "play" || n === "draw" && (t === "drawPlayer" || t === "drawReady"));
}
function Hm(e) {
	let t = { ...Pm }, n = Lm ? Date.now() - Lm.since : 0, r = {
		...Pm,
		pipelineActive: !1,
		revealCatchUp: !1,
		handPresenting: !1,
		handPresentationPhase: "idle",
		peakPlayCount: Pm.displayedPlayCount,
		motionGateActive: !1,
		dealPresentationActive: !1,
		trickCollectionActive: !1
	};
	Im = Date.now() + 1500, Lm = null, X() && Z("trickAnimationBridge", "table-presentation-force-release", {
		source: e,
		blockedMs: n,
		from: t,
		to: r
	}), Gm(r);
}
function Um(e = Date.now()) {
	if (e < Im) return {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	let t = zm(Pm);
	if (t == null) return Lm = null, {
		blocked: !1,
		reason: null,
		blockedMs: 0,
		softUnblock: !1,
		forceReleased: !1
	};
	(!Lm || Lm.reason !== t) && (Lm = {
		reason: t,
		since: e,
		blockedLogged: !1
	});
	let n = e - Lm.since;
	return n >= 7e3 ? (X() && !Lm.blockedLogged && Z("trickAnimationBridge", "gate-force-release", {
		reason: t,
		blockedMs: n
	}), Hm("gate-timeout"), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !0
	}) : n >= 5500 ? (X() && !Lm.blockedLogged && (Z("trickAnimationBridge", "gate-soft-unblock", {
		reason: t,
		blockedMs: n
	}), Lm.blockedLogged = !0), {
		blocked: !1,
		reason: t,
		blockedMs: n,
		softUnblock: !0,
		forceReleased: !1
	}) : (X() && !Lm.blockedLogged && (Z("trickAnimationBridge", "gate-blocked", {
		reason: t,
		blockedMs: n
	}), Lm.blockedLogged = !0), {
		blocked: !0,
		reason: t,
		blockedMs: n,
		softUnblock: !1,
		forceReleased: !1
	});
}
function Wm(e = Date.now()) {
	return Um(e).blocked;
}
function Gm(e) {
	if (!Rm(Pm, e)) {
		X() && Z("trickAnimationBridge", "busy-state", {
			from: Pm,
			to: e,
			busy: Bm(e),
			blockReason: zm(e),
			motionGateActive: e.motionGateActive,
			handPresentationPhase: e.handPresentationPhase
		}), Pm = e, zm(e) ?? (Lm = null);
		for (let e of Fm) e();
	}
}
function Km() {
	Im = 0, Lm = null, Gm(Nm);
}
function qm() {
	return Pm;
}
function Jm() {
	return Pm.pipelineActive || Pm.revealCatchUp || Pm.motionGateActive || Pm.trickCollectionActive || Pm.peakPlayCount > Pm.displayedPlayCount && Pm.peakPlayCount > 0;
}
function Ym() {
	return Bm(Pm);
}
function Xm(e) {
	return Fm.add(e), () => Fm.delete(e);
}
//#endregion
//#region src/table/TrickAnimationBusySync.tsx
function Zm(e) {
	return {
		pipelineActive: e.pipelineActive,
		revealCatchUp: e.revealCatchUp,
		motionGateActive: e.motionGateActive,
		peakPlayCount: e.peakPlayCount,
		displayedPlayCount: e.displayedPlayCount,
		handPresenting: e.handPresenting,
		handPresentationPhase: e.handPresentationPhase,
		dealPresentationActive: Of(),
		trickCollectionActive: Af()
	};
}
function Qm(e) {
	Gm(Zm(e));
}
function $m({ input: e }) {
	let t = (0, l.useRef)(e);
	return t.current = e, (0, l.useEffect)(() => {
		Qm(t.current);
	}), (0, l.useEffect)(() => jf(() => {
		Qm(t.current);
	}), []), null;
}
//#endregion
//#region src/table/hooks/useTableMicrointeractions.ts
function eh(e) {
	let [t, n] = (0, l.useState)(yo), r = (0, l.useRef)(null), i = (0, l.useRef)([]), a = () => {
		for (let e of i.current) window.clearTimeout(e);
		i.current = [];
	}, o = (e, t) => {
		let n = window.setTimeout(e, t);
		i.current.push(n);
	};
	(0, l.useEffect)(() => () => a(), []);
	let s = JSON.stringify(e.tricksByPlayer), c = JSON.stringify(e.bankrollByPlayer), u = JSON.stringify(e.bourrePlayerIds);
	return (0, l.useEffect)(() => {
		let t = xo(r.current, e);
		if (r.current = bo(e), !(!t.turnHandoffPlayerId && !t.dealerMovedPlayerId && !t.potTick && Object.keys(t.trickBadgeIncrements).length === 0 && Object.keys(t.bankrollChanges).length === 0 && t.bourrePlayerIds.length === 0 && !t.trumpReminderPulse && !t.feedbackErrorPulse && !t.feedbackSuccessPulse && !t.winnerFlashPlayerId)) {
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
			}, vo.turnHandoff), t.dealerMovedPlayerId && o(() => {
				n((e) => e.dealerMovedPlayerId === t.dealerMovedPlayerId ? {
					...e,
					dealerMovedPlayerId: null
				} : e);
			}, vo.dealerMove), t.winnerFlashPlayerId && o(() => {
				n((e) => e.winnerFlashPlayerId === t.winnerFlashPlayerId ? {
					...e,
					winnerFlashPlayerId: null
				} : e);
			}, vo.winnerFlash);
			for (let [e, r] of Object.entries(t.bankrollChanges)) o(() => {
				n((t) => {
					if (t.bankrollTicks[e] !== r) return t;
					let n = { ...t.bankrollTicks };
					return delete n[e], {
						...t,
						bankrollTicks: n
					};
				});
			}, vo.bankrollTick);
			for (let e of t.bourrePlayerIds) o(() => {
				n((t) => t.bourreAlerts[e] === "pulse" ? {
					...t,
					bourreAlerts: {
						...t.bourreAlerts,
						[e]: "marker"
					}
				} : t);
			}, vo.bourrePulse), o(() => {
				n((t) => {
					if (!t.bourreAlerts[e]) return t;
					let n = { ...t.bourreAlerts };
					return delete n[e], {
						...t,
						bourreAlerts: n
					};
				});
			}, vo.bourreMarker);
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
function th({ active: e, displayName: t }) {
	let [n, r] = (0, l.useState)(!1), i = Bl();
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
var nh = Gu, rh = [
	12e3,
	18e3,
	24e3
];
function ih(e) {
	let [t, n] = (0, l.useState)("hidden"), [r, i] = (0, l.useState)(0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(null), c = (0, l.useRef)(0), u = (0, l.useRef)(e.actionRequired);
	u.current = e.actionRequired;
	let d = () => {
		a.current != null && (window.clearTimeout(a.current), a.current = null), o.current != null && (window.clearTimeout(o.current), o.current = null), s.current != null && (window.clearTimeout(s.current), s.current = null);
	}, f = (0, l.useCallback)(() => {
		let e = c.current;
		if (e === 0) return;
		let t = rh[Math.min(e - 1, rh.length - 1)];
		a.current = window.setTimeout(() => {
			a.current = null, u.current && (i(e), n("pop"), c.current = e + 1);
		}, t);
	}, []);
	return (0, l.useEffect)(() => (d(), c.current = 0, e.actionRequired ? (a.current = window.setTimeout(() => {
		a.current = null, u.current && (i(0), n("pop"), c.current = 1);
	}, nh), d) : (n("hidden"), i(0), d)), [e.activityKey, e.actionRequired]), (0, l.useEffect)(() => {
		if (t !== "pop") return;
		let e = Bl() ? 280 : 420;
		return o.current = window.setTimeout(() => {
			o.current = null, n("exit");
		}, 380 + e), () => {
			o.current != null && (window.clearTimeout(o.current), o.current = null);
		};
	}, [t, r]), (0, l.useEffect)(() => {
		if (t !== "exit") return;
		let e = Bl() ? 240 : 620;
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
function ah() {
	return Bl();
}
//#endregion
//#region src/table/YourTurnAttention.tsx
function oh({ actionRequired: e, activityKey: t }) {
	let { phase: n, beat: r } = ih({
		actionRequired: e,
		activityKey: t
	});
	if (n === "hidden") return null;
	let i = ah(), a = Math.min(r, 5);
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
var sh = 5e3, ch = 1e3;
function lh(e) {
	return e === "draw" ? "Choose discard and then tap" : e === "play" ? "Tap a card to play" : null;
}
function uh(e) {
	let [t, n] = (0, l.useState)(!1), [r, i] = (0, l.useState)(!0), a = (0, l.useRef)(null), o = (0, l.useRef)(null), s = (0, l.useRef)(e.actionRequired);
	s.current = e.actionRequired;
	let c = lh(e.phase), u = e.actionRequired && c != null && !e.hasUserInteracted;
	return (0, l.useEffect)(() => {
		if (a.current != null && (window.clearTimeout(a.current), a.current = null), n(!1), u) return a.current = window.setTimeout(() => {
			a.current = null, !(!s.current || e.hasUserInteracted) && (n(!0), i(!0));
		}, sh), () => {
			a.current != null && (window.clearTimeout(a.current), a.current = null);
		};
	}, [
		e.activityKey,
		u,
		e.hasUserInteracted
	]), (0, l.useEffect)(() => {
		if (o.current != null && (window.clearInterval(o.current), o.current = null), !t || !u || Bl()) {
			i(!0);
			return;
		}
		return o.current = window.setInterval(() => {
			i((e) => !e);
		}, ch), () => {
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
function dh({ actionRequired: e, activityKey: t, phase: n, hasUserInteracted: r }) {
	let { visible: i, text: a, flashOn: o } = uh({
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
function fh(e) {
	let t = e.currentUserId;
	if (!t || e.handComplete) return !1;
	let n = e.selfPlayer, r = Fu({
		phase: e.session.phase,
		participantIds: e.session.participantIds,
		playerId: t
	});
	if (!n || !r && n.isOut || n.actionDeclared) return !1;
	let i = Vu({
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
	let a = Wu({
		snapshot: i,
		action: "submit_draw",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn,
		drawCompletedIds: e.session.drawCompletedIds
	});
	if (i.phase === Q.DRAW && a.ok) return !0;
	let o = Wu({
		snapshot: i,
		action: "play_card",
		playerId: t,
		actorId: t,
		suppressTurn: e.suppressTurn
	});
	return !!(i.phase === Q.PLAY && o.ok);
}
function ph(e) {
	let t = e.session.handEnrollment, n = t?.active ? `${t.currentIndex ?? 0}:${t.turnDeadlineMs ?? 0}` : "off";
	return [
		e.session.phase ?? "",
		e.session.turnPlayerId ?? "",
		n,
		e.selfPlayer?.actionDeclared ? "declared" : "open",
		e.session.drawCompletedIds?.join(",") ?? "",
		e.suppressTurn ? "1" : "0",
		fh(e) ? "act" : "wait"
	].join("|");
}
//#endregion
//#region src/table/hooks/useTrumpTrickMotionGate.ts
var mh = 880;
function hh(e, t, n) {
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
		}, mh);
		return () => window.clearTimeout(n);
	}, [e, t]), (0, l.useEffect)(() => {
		if (!i || t || n === 0) return;
		let e = window.setTimeout(() => {
			a(!1), r.current = !1;
		}, mh);
		return () => window.clearTimeout(e);
	}, [
		i,
		t,
		n
	]), i;
}
//#endregion
//#region src/table/trickPresentationMachine.ts
function gh(e, t) {
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
		peakTrickPlays: q(t),
		displayRevealFloor: 0
	};
}
function _h(e, t) {
	if (t.length < e.length) return !1;
	for (let n = 0; n < e.length; n++) if (io(e[n]) !== io(t[n])) return !1;
	return !0;
}
function vh(e, t, n) {
	let r = t.currentTrick?.trickNumber ?? null, i = e.prevTrick?.trickNumber ?? null, a = r != null && i != null && r !== i ? [] : [...e.peakTrickPlays ?? []];
	for (let t of [
		n,
		q(e.prevTrick),
		e.peakTrickPlays ?? []
	]) t.length > a.length && _h(a, t) && (a = t);
	return a;
}
function yh(e, t) {
	return e.phase === "live" ? e : {
		...e,
		pendingServer: t
	};
}
function bh(e) {
	return Math.max(e.pendingResolution?.frozen.plays.length ?? 0, q(e.prevTrick).length, e.peakTrickPlays?.length ?? 0);
}
function xh(e, t) {
	let n = q(t.currentTrick), r = q(e.prevTrick), i = vh(e, t, n), a = e.phase === "live" && !e.pendingResolution && (n.length < e.revealedCount && r.length >= e.revealedCount || n.length < i.length && r.length >= i.length), o = t.currentTrick?.trickNumber ?? null, s = e.prevTrick?.trickNumber ?? null, c = o != null && s != null && o !== s;
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
function Sh(e, t, n, r) {
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
function Ch(e, t) {
	let n = wh(e, t);
	if (X()) {
		let r = q(e.prevTrick).length, i = q(n.prevTrick).length;
		(e.phase !== n.phase || e.revealedCount !== n.revealedCount || r !== i || !!e.pendingResolution != !!n.pendingResolution || t.type === "serverUpdate") && Z("trickPresentation", t.type, {
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
function wh(e, t) {
	switch (t.type) {
		case "reset":
		case "reinit": return gh(t.type === "reinit" ? t.snapshot.tricksByPlayer : e.displayTricksByPlayer, t.type === "reinit" ? t.snapshot.currentTrick : null);
		case "revealNextCard": {
			if (e.phase !== "live") return e;
			let t = bh(e);
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
			return !t || e.phase !== "live" ? e : Sh({
				...e,
				pendingResolution: null
			}, t.frozen, t.snapshot.tricksByPlayer, t.snapshot.currentTrick);
		}
		case "forceHandEndDrain": {
			let t = e;
			if (t.phase === "live" && t.pendingResolution && (t = Sh({
				...t,
				pendingResolution: null
			}, t.pendingResolution.frozen, t.pendingResolution.snapshot.tricksByPlayer, t.pendingResolution.snapshot.currentTrick)), t.phase === "live" && !t.pendingResolution) return t;
			let n = t.pendingServer, r = n?.tricksByPlayer ?? {}, i = Object.values(r).some((e) => (e ?? 0) > 0), a = i ? { ...r } : { ...t.displayTricksByPlayer }, o = q(n?.currentTrick).length;
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
				peakTrickPlays: q(n?.currentTrick),
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
				let t = e.pendingServer, n = q(t?.currentTrick).length;
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
					peakTrickPlays: q(t?.currentTrick),
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
			if (e.phase !== "live") return yh(e, n);
			let i = zl({
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
			} : xh(e, n);
		}
		default: return e;
	}
}
function Th(e, t) {
	let n = e.pendingResolution?.frozen.plays ?? [];
	if (n.length > 0) return n;
	let r = q(e.prevTrick), i = e.peakTrickPlays ?? [];
	return e.phase === "live" ? i.length > t.length ? i : r.length > t.length ? r : t.length > 0 ? t : r : t.length > 0 ? t : r.length > 0 ? r : i;
}
function Eh(e, t) {
	let n = Th(e, q(t)), r = e.displayRevealFloor, i = n.length >= r ? n : (e.peakTrickPlays?.length ?? 0) >= r ? e.peakTrickPlays : n, a = e.phase === "live" ? e.pendingResolution ? Math.max(e.revealedCount, i.length) : Math.min(e.revealedCount, i.length) : i.length, o = e.phase === "live" && !e.pendingResolution ? Math.max(a, r) : a, s = e.phase === "live" ? i.slice(0, o) : e.frozenTrick?.plays ?? [], c = e.frozenTrick?.plays ?? [], l = e.frozenTrick?.winnerId ?? null, u = e.phase, d = c.length > 0 && s.length === 0 && e.phase !== "live", f = e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null, p = e.showWinnerTag && (e.phase === "winnerReveal" || e.phase === "collectTrick"), m = e.peakTrickPlays?.length ?? 0, h = e.phase === "live" ? bh(e) : e.revealedCount;
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
function Dh({ phase: e, currentTrick: t, tricksByPlayer: n, participantIds: r, trumpSuit: i, playedCards: a, turnPlayerId: o, handComplete: s = !1 }) {
	let [c, u] = (0, l.useReducer)(Ch, n, (e) => gh(e, t)), d = (0, l.useRef)([]), f = (0, l.useRef)(null), p = (0, l.useRef)(/* @__PURE__ */ new Set()), m = (0, l.useRef)(!1), h = (0, l.useRef)(null), g = (0, l.useRef)(0), _ = (0, l.useRef)(!1), v = (0, l.useRef)(c);
	v.current = c;
	let y = c.phase !== "live" || !!c.pendingResolution;
	m.current = y;
	let b = e === "play", x = (e) => {
		for (let t of e) {
			let e = io(t);
			p.current.has(e) || (p.current.add(e), mo(t.playerId, e));
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
			S(), f.current = null, p.current.clear(), _o(), u({
				type: "reinit",
				snapshot: {
					currentTrick: t,
					tricksByPlayer: n,
					playedCards: a
				}
			}), X() && Z("useTrickPresentation", c ? "reinit-play-entry" : "reinit-idle", {
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
			reducedMotion: Bl()
		}), X() && Z("useTrickPresentation", "serverUpdate-effect", {
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
		uo(r), o && uo([o]);
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
		let t = c.frozenTrick, n = t.trickNumber === 5, r = Fl({
			trumpBeat: Y(t.plays, t.leadSuit, i),
			finalTrick: n,
			reducedMotion: Bl()
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
		let t = Bl() ? 308 : 560, n = window.setTimeout(() => u({ type: "commitTrickResolution" }), t);
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
		let n = [];
		return X() && Z("useTrickPresentation", "hand-end-drain-armed", {
			phase: c.phase,
			pendingResolution: !!c.pendingResolution,
			trickNumber: c.frozenTrick?.trickNumber ?? c.pendingResolution?.frozen.trickNumber
		}), ((e, t) => {
			n.push(window.setTimeout(e, t));
		})(() => {
			let e = v.current;
			e.phase === "live" && !e.pendingResolution || (X() && Z("useTrickPresentation", "hand-end-drain-force", {
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
		let e = Bl() ? 369 : 670;
		h.current = window.setTimeout(() => {
			h.current = null, X() && Z("useTrickPresentation", "revealNextCard-timer", {
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
		...Eh(c, t),
		forceHandEndDrain: () => u({ type: "forceHandEndDrain" })
	};
}
//#endregion
//#region src/table/TrickPresentationSync.tsx
function Oh(e) {
	let t = Dh(e), n = (0, l.useRef)(t.forceHandEndDrain);
	return n.current = t.forceHandEndDrain, (0, l.useLayoutEffect)(() => {
		au({
			...t,
			forceHandEndDrain: () => n.current()
		});
	}), (0, l.useEffect)(() => () => cu(), []), null;
}
//#endregion
//#region src/table/settlementCopy.ts
function kh(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function Ah(e, t) {
	return e.map((e) => kh(e, t)).join(" & ");
}
function jh(e, t) {
	return ul(e, t) ? t.filter((t) => (e[t] ?? 0) === 0) : [];
}
function Mh(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: a = {} } = e, o = pl(t, n), s = e.winnerIds?.length ? e.winnerIds : o.winnerIds, c = e.maxTricks ?? o.maxTricks, l = Ah(s, r), u = jh(t, n), d = Ah(u, r), f = ml(i.maxWinThisHand), p = ml(i.currentPot), m = i.carryIn > 0 ? ml(i.carryIn) : null, h = `Pot this hand: ${p} (max win ${f})`;
	m && (h += ` — includes ${m} carried in`), i.limEnabled && i.overflow > 0 && (h += ` · LIM overflow ${ml(i.overflow)} stays out of play`);
	let g = s.map((e) => {
		let n = t[e] ?? 0;
		return `${kh(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), _ = u.length > 0 ? `Bourré: ${d} took 0 tricks — each pays ${f} at settlement (seeds next deal)` : null, v = e.splitSharePerWinner, y = v > 0 && s.length >= 2 ? `If all co-winners agree to split: ${ml(i.maxWinThisHand)} → ${ml(v)} each` : null, b = s.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, x = `If any co-winner declines: full pot ${p} carries to the next hand · non-winners ante up`, S = s.map((e) => {
		let t = a[e], n = kh(e, r);
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
function Nh({ session: e, players: t, potMetrics: n, splitSharePerWinner: r, currentUserId: i, isCoWinner: a, onSettle: o }) {
	let s = Mh({
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
var Ph = 3e3;
function Fh(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function Ih({ session: e, players: t, splitSharePerWinner: n, currentUserId: r, isCoWinner: i, onAgreeSplit: a, onDeclineSplit: o, onCarryover: s }) {
	let c = e.pendingCoWinSettlement?.winnerIds ?? [], u = e.pendingCoWinSettlement?.votes ?? {}, [d, f] = (0, l.useState)(Ph), [p, m] = (0, l.useState)(!1), h = (0, l.useRef)(null), g = (0, l.useRef)(!1), _ = (0, l.useMemo)(() => `${c.join(",")}:${e.handNumber ?? 0}`, [c, e.handNumber]);
	(0, l.useEffect)(() => {
		h.current = Date.now(), g.current = !1, f(Ph), m(!1);
	}, [_]);
	let v = c.length >= 2 && c.every((e) => u[e] === "split"), y = (0, l.useCallback)(() => {
		g.current || (g.current = !0, s());
	}, [s]);
	if ((0, l.useEffect)(() => {
		if (c.length < 2) return;
		let e = window.setInterval(() => {
			let e = h.current ?? Date.now(), t = Date.now() - e, n = Math.max(0, Ph - t);
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
	let b = Math.max(0, Math.ceil(d / 1e3)), x = c.map((e) => Fh(e, t)).join(" & "), S = (e) => {
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
function Lh(e, t) {
	return [...e];
}
function Rh(e, t) {
	return [...e].sort((e, t) => e - t);
}
function zh(e) {
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
	let { trumpMergeActive: i, trumpMergedIntoHand: a } = e.handPresentation, o = uf({
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
var Bh = [], Vh = [], Hh = [];
function Uh({ session: e, players: t, potMetrics: n, mySessionNet: r, leaderLabel: i, showCoWinSettlement: a, splitPotEnabled: o = !1, rebuyEnabled: s = !1, splitSharePerWinner: c = 0, enrollmentActive: u = !1, currentUserId: d, heroCards: f = Vh, rawHeroCards: p = Vh, privateHandReady: m = !1, legalPlayIndices: h, recentBourreIds: g = Hh, handComplete: _ = !1, actionFeedback: v, actions: y }) {
	let { settings: b } = Hc(), x = Pf(), [S, w] = (0, l.useState)(!1), T = e.participantIds.length, { events: E, dismissEvent: D, pushReaction: O } = Yp({
		session: e,
		potMetrics: n,
		participantIds: e.participantIds
	}), k = (0, l.useMemo)(() => [...E].reverse().find((e) => e.kind === "big-pot") ?? null, [E]), ee = d != null && (e.pendingCoWinSettlement?.winnerIds || []).includes(d), te = (0, l.useMemo)(() => ({
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
	]), A = $l(ou, su, vu, yu), ne = A.forceHandEndDrain, j = jm({
		session: e,
		enrollmentActive: u,
		potAmount: n.currentPot,
		handComplete: _,
		trickPipelineActive: A.isPipelineActive,
		forceTrickHandEndDrain: ne,
		heroCards: f,
		enrolledIds: e.handEnrollment?.enrolledIds ?? Bh,
		declinedIds: e.handEnrollment?.declinedIds ?? Bh,
		actionOrder: e.actionOrder ?? e.handEnrollment?.orderedPlayerIds ?? e.participantIds
	}), M = hh(e.phase, e.trumpUpcard, A.displayPlaysLength), N = Vm(j.isPresenting, j.phase, e.phase), P = (0, l.useMemo)(() => ({
		pipelineActive: A.isPipelineActive,
		revealCatchUp: A.phase === "live" && A.revealedCount < A.revealTarget,
		motionGateActive: M,
		peakPlayCount: A.peakPlayCount,
		displayedPlayCount: A.displayPlaysLength,
		handPresenting: N,
		handPresentationPhase: j.phase
	}), [
		A.isPipelineActive,
		A.phase,
		A.revealedCount,
		A.revealTarget,
		A.peakPlayCount,
		A.displayPlaysLength,
		M,
		N,
		j.phase
	]), re = Qa(e.phase), ie = (0, l.useMemo)(() => uf({
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
	]), F = (0, l.useMemo)(() => zh({
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
	]), I = F.displayCards, L = (0, l.useMemo)(() => !h?.length || F.indexMode === "effective" ? h : Lh(h, F.trumpDisabledIndex), [
		h,
		F.indexMode,
		F.trumpDisabledIndex
	]), R = (0, l.useMemo)(() => {
		if (!h?.length || !f.length) return null;
		let t = Jo(f.map(qa), {
			trumpSuit: e.trumpSuit ?? "clubs",
			currentTrick: e.currentTrick ?? null,
			leadSuit: e.leadSuit ?? null,
			cinchEnabled: e.cinchEnabled === !0
		}, h);
		return t == null ? null : F.indexMode === "effective" ? t : Lh([t], F.trumpDisabledIndex)[0] ?? null;
	}, [
		h,
		f,
		e.trumpSuit,
		e.currentTrick,
		e.leadSuit,
		e.cinchEnabled,
		F.indexMode,
		F.trumpDisabledIndex
	]), ae = (0, l.useMemo)(() => {
		if (e.phase !== "draw" || !f.length) return [];
		let t = f.map(qa), n = F.indexMode === "display" && F.trumpDisabledIndex != null ? Rh([F.trumpDisabledIndex], F.trumpDisabledIndex) : F.trumpDisabledIndex == null ? [] : [F.trumpDisabledIndex], r = Yo(t, e.trumpSuit ?? "clubs", e.maxDrawDiscards ?? 4, e.remainingDeckCount ?? Infinity, n);
		return F.indexMode === "effective" ? r : Lh(r, F.trumpDisabledIndex);
	}, [
		e.phase,
		f,
		e.trumpSuit,
		e.maxDrawDiscards,
		e.remainingDeckCount,
		F.indexMode,
		F.trumpDisabledIndex
	]), oe = A.suppressTurnPlayerId || j.suppressTurnIndicator, se = Ja(e.phase, u), ce = oe ? null : to(e.turnPlayerId, t), z = t.find((e) => e.isSelf), le = d != null && e.participantIds.includes(d) && (e.phase === "draw" || e.phase === "play"), B = s && !e.isFinal && !le && !a && z?.isOut === !0 && !!y.onRebuy, ue = !!(d && e.turnPlayerId === d) && !oe, de = fh({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: z,
		session: e,
		suppressTurn: !!oe,
		handComplete: _
	}), fe = de && !_ && (u || e.phase === "decision") ? Ya(e.phase, u) : null, pe = !fe && !oe && !(ce && re && A.phase === "live") ? Xa({
		phase: e.phase,
		enrollmentActive: u,
		isMyTurn: ue,
		handComplete: _,
		cardsDealt: re
	}) : null, me = ph({
		currentUserId: d,
		enrollmentActive: u,
		selfPlayer: z,
		session: e,
		suppressTurn: !!oe,
		handComplete: _
	}), [he, ge] = (0, l.useState)(!1);
	(0, l.useEffect)(() => {
		ge(!1);
	}, [me]);
	let _e = (0, l.useCallback)(() => {
		ge(!0);
	}, []), ve = de && !_ && !he && (e.phase === "draw" || e.phase === "play"), ye = (0, l.useMemo)(() => ({
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
		suppressTurn: !!oe,
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
		oe,
		_
	]), be = ie.showTrumpSuitReminder || !e.trumpUpcard && !!e.trumpSuit && e.phase === "play", xe = (0, l.useMemo)(() => ({ ...A.displayTricksByPlayer }), [A.displayTricksByPlayer]), Se = (0, l.useMemo)(() => Object.fromEntries(t.map((e) => [e.playerId, Math.max(0, Number(e.bankroll) || 0)])), [t]), Ce = eh({
		turnPlayerId: e.turnPlayerId ?? null,
		dealerId: e.dealerId,
		potAmount: j.displayPotAmount,
		tricksByPlayer: xe,
		bankrollByPlayer: Se,
		bourrePlayerIds: g ?? [],
		phase: e.phase ?? null,
		showTrumpSuitReminder: be,
		suppressTurn: !!oe,
		actionFeedbackStatus: v?.status ?? "idle",
		trickWinnerSeatId: A.trickWinnerSeatId,
		trickPhase: A.phase
	}), we = !!z?.playerId && (g ?? []).includes(z.playerId) && Ce.bourreAlerts[z.playerId] === "pulse", Te = (0, l.useRef)(0), Ee = (0, l.useRef)(0);
	(0, l.useEffect)(() => {
		Ce.feedbackErrorPulse > Te.current && Tc(), Te.current = Ce.feedbackErrorPulse;
	}, [Ce.feedbackErrorPulse]), (0, l.useEffect)(() => {
		Ce.feedbackSuccessPulse > Ee.current && Ec(), Ee.current = Ce.feedbackSuccessPulse;
	}, [Ce.feedbackSuccessPulse]);
	let De = (0, l.useCallback)((e) => {
		O(e, d ?? void 0);
	}, [O, d]), Oe = (0, l.useMemo)(() => ({
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
			let t = F.indexMode === "display" ? Rh(e, F.trumpDisabledIndex) : e;
			return y.onSubmitDraw(t);
		},
		onPassDraw: y.onPassDraw,
		onFoldDraw: y.onFoldDraw,
		onPlayCard: (e) => {
			if (!y.onPlayCard) return;
			if (F.indexMode !== "display") return y.onPlayCard(e);
			let t = Rh([e], F.trumpDisabledIndex)[0];
			if (t != null) return y.onPlayCard(t);
		},
		onReaction: De,
		onHeroUserActivity: _e
	}), [
		y,
		De,
		t,
		F.indexMode,
		F.trumpDisabledIndex,
		_e
	]), ke = (0, l.useMemo)(() => ({
		session: e,
		players: t,
		potMetrics: n,
		participantCount: T,
		enrollmentActive: u,
		heroCards: I,
		revealedTrumpIndex: F.revealedTrumpIndex,
		trumpMergeActive: F.trumpMergeActive,
		trumpDisabledIndex: F.trumpDisabledIndex,
		hideCenterTrump: ie.hideCenterTrump,
		showTrumpSuitReminder: be,
		trumpHolderPresentation: ie,
		privateHandReady: m,
		currentUserId: d,
		legalPlayIndices: L,
		recommendedPlayIndex: R,
		recommendedDiscardIndices: ae,
		handComplete: _,
		actionFeedback: v,
		handPresentation: j,
		microinteractions: Ce,
		instantTrickPlays: M,
		bigPotEvent: k,
		onDismissTableEvent: D,
		...Oe
	}), [
		e,
		t,
		n,
		T,
		u,
		I,
		F.revealedTrumpIndex,
		F.trumpMergeActive,
		F.trumpDisabledIndex,
		ie,
		be,
		m,
		d,
		L,
		R,
		ae,
		_,
		v,
		j,
		Ce,
		M,
		k,
		D,
		Oe
	]), Ae = /* @__PURE__ */ (0, C.jsxs)(C.Fragment, { children: [
		/* @__PURE__ */ (0, C.jsx)(Oh, { ...te }),
		/* @__PURE__ */ (0, C.jsx)($m, { input: P }),
		/* @__PURE__ */ (0, C.jsx)(Mm, { input: ye }),
		/* @__PURE__ */ (0, C.jsx)("div", {
			className: "btable-session__attention-layer",
			"aria-live": "polite",
			children: /* @__PURE__ */ (0, C.jsx)(oh, {
				actionRequired: de,
				activityKey: me
			})
		}),
		/* @__PURE__ */ (0, C.jsx)(th, {
			active: we,
			displayName: z?.displayName
		}),
		/* @__PURE__ */ (0, C.jsx)(Up, {
			events: E,
			onDismiss: D
		}),
		/* @__PURE__ */ (0, C.jsx)(Bp, {
			events: E,
			onDismiss: D
		}),
		x ? /* @__PURE__ */ (0, C.jsx)(Rp, { ...ke }) : /* @__PURE__ */ (0, C.jsx)(jp, { ...ke })
	] }), je = (0, l.useRef)(!1);
	return (0, l.useEffect)(() => {
		je.current = !1;
	}, [e.handNumber, e.sessionId]), (0, l.useEffect)(() => {
		if (e.phase !== "reveal" || !j.trumpMergedIntoHand || j.phase !== "drawPlayer" || je.current || !y.onAdvanceReveal) return;
		let t = y.onAdvanceReveal();
		Promise.resolve(t).then(() => {
			je.current = !0;
		}, () => {
			je.current = !1;
		});
	}, [
		e.phase,
		e.handNumber,
		e.sessionId,
		j.trumpMergedIntoHand,
		j.phase,
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
			eo(e.phase) ? "btable-session--reveal-phase" : "",
			$a(e.phase) ? "btable-session--decision-phase" : ""
		].filter(Boolean).join(" "),
		"data-trick-resolving": A.isPipelineActive ? "true" : "false",
		"data-hand-settling": j.settleAnimActive ? "true" : "false",
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
			}, v.status === "error" ? `feedback-error-${Ce.feedbackErrorPulse}` : v.status === "success" ? `feedback-success-${Ce.feedbackSuccessPulse}` : `feedback-${v.status}`),
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
					j.trumpRevealActive && e.phase === "draw" && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Trump revealed — settling into your hand"
					}),
					j.trumpMergeActive && e.phase === "draw" && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Trump joining your hand…"
					}),
					j.phase === "drawReady" && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Draw complete — first lead coming up"
					}),
					/* @__PURE__ */ (0, C.jsxs)("div", {
						className: "btable-session__turn-stack",
						"aria-live": "polite",
						children: [
							j.settleAnimActive && /* @__PURE__ */ (0, C.jsx)("p", {
								className: "btable-session__turn btable-session__turn--settle muted small",
								children: "Settling the pot…"
							}),
							/* @__PURE__ */ (0, C.jsx)("p", {
								className: "btable-session__turn btable-session__turn--trick-resolve muted small",
								children: "Trick won — cards collecting before the next lead"
							}),
							j.settleAnimActive && /* @__PURE__ */ (0, C.jsx)("p", {
								className: "btable-session__turn btable-session__turn--final-trick muted small",
								children: "Final trick — cards collecting before the pot settles"
							})
						]
					}),
					ce && re && A.phase === "live" && /* @__PURE__ */ (0, C.jsx)("p", {
						className: ["btable-session__turn", ue ? "btable-session__turn--yours" : "btable-session__turn--waiting"].join(" "),
						"aria-live": "polite",
						"data-testid": "turn-indicator",
						children: ce
					}),
					fe && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__action-cue",
						"data-testid": "action-cue",
						"aria-live": "polite",
						children: fe
					}),
					/* @__PURE__ */ (0, C.jsx)(dh, {
						actionRequired: ve,
						activityKey: me,
						phase: e.phase,
						hasUserInteracted: he
					}),
					pe && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__hint btable-session__hint--waiting",
						"data-testid": "waiting-cue",
						children: pe
					}),
					eo(e.phase) && /* @__PURE__ */ (0, C.jsx)("p", {
						className: "btable-session__hint muted small",
						"aria-live": "polite",
						children: "Cards dealt — trump revealed. Review your hand…"
					}),
					u && !eo(e.phase) && /* @__PURE__ */ (0, C.jsx)("p", {
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
			x ? /* @__PURE__ */ (0, C.jsx)(Hp, { children: /* @__PURE__ */ (0, C.jsx)("div", {
				className: "btable-stage",
				children: Ae
			}) }) : /* @__PURE__ */ (0, C.jsx)(Vp, { children: /* @__PURE__ */ (0, C.jsx)("div", {
				className: "btable-stage",
				children: Ae
			}) }),
			/* @__PURE__ */ (0, C.jsx)(Gp, {
				open: S,
				onClose: () => w(!1)
			}),
			a && !e.isFinal && o && /* @__PURE__ */ (0, C.jsx)(Ih, {
				session: e,
				players: t,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: ee,
				onAgreeSplit: () => y.onSettle("split"),
				onDeclineSplit: () => y.onSettle("push"),
				onCarryover: () => y.onSettleCarryover?.()
			}),
			a && !e.isFinal && !o && /* @__PURE__ */ (0, C.jsx)(Nh, {
				session: e,
				players: t,
				potMetrics: n,
				splitSharePerWinner: c,
				currentUserId: d,
				isCoWinner: ee,
				onSettle: (e) => y.onSettle(e)
			}),
			/* @__PURE__ */ (0, C.jsxs)("footer", {
				className: "btable-session__foot muted small",
				children: [
					/* @__PURE__ */ (0, C.jsx)(Wp, { compact: !0 }),
					B && /* @__PURE__ */ (0, C.jsxs)("div", {
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
var Wh = null, Gh = null;
function Kh(e, t) {
	vc(), oa(e), Gh !== e && (Wh?.unmount(), Wh = (0, u.createRoot)(e), Gh = e), Wh.render(/* @__PURE__ */ (0, C.jsx)(Vc, { children: /* @__PURE__ */ (0, C.jsx)(Uh, { ...t }) }));
}
function qh() {
	Gh && (pp(Gh), Hf(Gh)), Wh?.unmount(), Wh = null, Gh = null, Km(), Mf();
}
//#endregion
export { Hf as clearDrawFlyGhosts, pp as clearWonTrickCollectionArtifacts, Um as evaluateBotPresentationGate, Hm as forceReleasePresentationForBots, ss as getFeedbackPrefs, zm as getTablePresentationBlockReason, qm as getTrickAnimationBusyState, Vm as handPresentingBlocksBots, vc as initGameFeedback, Ym as isTablePresentationBusy, Wm as isTablePresentationBusyForBots, Jm as isTrickAnimationBusy, Kh as mountTableSession, Sc as playBigWinFeedback, Cc as playBourreFeedback, bc as playDrawFeedback, wc as playGameStartFeedback, yc as playShuffleFeedback, xc as playTrickWinFeedback, cs as saveFeedbackPrefs, ds as subscribeFeedbackPrefs, Xm as subscribeTrickAnimationBusy, qh as unmountTableSession };
