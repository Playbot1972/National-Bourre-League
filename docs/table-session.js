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
		var ee = new MessageChannel(), k = ee.port2;
		ee.port1.onmessage = D, O = function() {
			k.postMessage(null);
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
	function ee(e) {
		var t = {
			"=": "=0",
			":": "=2"
		};
		return "$" + e.replace(/[=:]/g, function(e) {
			return t[e];
		});
	}
	var k = /\/+/g;
	function A(e, t) {
		return typeof e == "object" && e && e.key != null ? ee("" + e.key) : t.toString(36);
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
		if (c) return o = o(e), c = a === "" ? "." + A(e, 0) : a, S(o) ? (i = "", c != null && (i = c.replace(k, "$&/") + "/"), ne(o, r, i, "", function(e) {
			return e;
		})) : o != null && (O(o) && (o = D(o, i + (o.key == null || e && e.key === o.key ? "" : ("" + o.key).replace(k, "$&/") + "/") + c)), r.push(o)), 1;
		c = 0;
		var l = a === "" ? "." : a + ":";
		if (S(e)) for (var u = 0; u < e.length; u++) a = e[u], s = l + A(a, u), c += ne(a, r, i, s, o);
		else if (u = m(e), typeof u == "function") for (e = u.call(e), u = 0; !(a = e.next()).done;) a = a.value, s = l + A(a, u++), c += ne(a, r, i, s, o);
		else if (s === "object") {
			if (typeof e.then == "function") return ne(te(e), r, i, a, o);
			throw r = String(e), Error("Objects are not valid as a React child (found: " + (r === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : r) + "). If you meant to render a collection of children, use an array instead.");
		}
		return c;
	}
	function re(e, t, n) {
		if (e == null) return e;
		var r = [], i = 0;
		return ne(e, r, "", "", function(e) {
			return t.call(n, e, i++);
		}), r;
	}
	function ie(e) {
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
	var j = typeof reportError == "function" ? reportError : function(e) {
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
	}, M = {
		map: re,
		forEach: function(e, t, n) {
			re(e, function() {
				t.apply(this, arguments);
			}, n);
		},
		count: function(e) {
			var t = 0;
			return re(e, function() {
				t++;
			}), t;
		},
		toArray: function(e) {
			return re(e, function(e) {
				return e;
			}) || [];
		},
		only: function(e) {
			if (!O(e)) throw Error("React.Children.only expected to receive a single React element child.");
			return e;
		}
	};
	e.Activity = f, e.Children = M, e.Component = v, e.Fragment = r, e.Profiler = a, e.PureComponent = b, e.StrictMode = i, e.Suspense = l, e.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = w, e.__COMPILER_RUNTIME = {
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
			_init: ie
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
			i !== null && i(n, r), typeof r == "object" && r && typeof r.then == "function" && r.then(C, j);
		} catch (e) {
			j(e);
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
	var h = Object.assign, g = Symbol.for("react.element"), _ = Symbol.for("react.transitional.element"), v = Symbol.for("react.portal"), y = Symbol.for("react.fragment"), b = Symbol.for("react.strict_mode"), x = Symbol.for("react.profiler"), S = Symbol.for("react.consumer"), C = Symbol.for("react.context"), w = Symbol.for("react.forward_ref"), T = Symbol.for("react.suspense"), E = Symbol.for("react.suspense_list"), D = Symbol.for("react.memo"), O = Symbol.for("react.lazy"), ee = Symbol.for("react.activity"), k = Symbol.for("react.memo_cache_sentinel"), A = Symbol.iterator;
	function te(e) {
		return typeof e != "object" || !e ? null : (e = A && e[A] || e["@@iterator"], typeof e == "function" ? e : null);
	}
	var ne = Symbol.for("react.client.reference");
	function re(e) {
		if (e == null) return null;
		if (typeof e == "function") return e.$$typeof === ne ? null : e.displayName || e.name || null;
		if (typeof e == "string") return e;
		switch (e) {
			case y: return "Fragment";
			case x: return "Profiler";
			case b: return "StrictMode";
			case T: return "Suspense";
			case E: return "SuspenseList";
			case ee: return "Activity";
		}
		if (typeof e == "object") switch (e.$$typeof) {
			case v: return "Portal";
			case C: return e.displayName || "Context";
			case S: return (e._context.displayName || "Context") + ".Consumer";
			case w:
				var t = e.render;
				return e = e.displayName, e ||= (e = t.displayName || t.name || "", e === "" ? "ForwardRef" : "ForwardRef(" + e + ")"), e;
			case D: return t = e.displayName || null, t === null ? re(e.type) || "Memo" : t;
			case O:
				t = e._payload, e = e._init;
				try {
					return re(e(t));
				} catch {}
		}
		return null;
	}
	var ie = Array.isArray, j = r.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, M = a.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, N = {
		pending: !1,
		data: null,
		method: null,
		action: null
	}, ae = [], oe = -1;
	function se(e) {
		return { current: e };
	}
	function P(e) {
		0 > oe || (e.current = ae[oe], ae[oe] = null, oe--);
	}
	function F(e, t) {
		oe++, ae[oe] = e.current, e.current = t;
	}
	var I = se(null), ce = se(null), le = se(null), ue = se(null);
	function de(e, t) {
		switch (F(le, t), F(ce, e), F(I, null), t.nodeType) {
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
		P(I), F(I, e);
	}
	function fe() {
		P(I), P(ce), P(le);
	}
	function pe(e) {
		e.memoizedState !== null && F(ue, e);
		var t = I.current, n = Hd(t, e.type);
		t !== n && (F(ce, e), F(I, n));
	}
	function me(e) {
		ce.current === e && (P(I), P(ce)), ue.current === e && (P(ue), Qf._currentValue = N);
	}
	var he, L;
	function ge(e) {
		if (he === void 0) try {
			throw Error();
		} catch (e) {
			var t = e.stack.trim().match(/\n( *(at )?)/);
			he = t && t[1] || "", L = -1 < e.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < e.stack.indexOf("@") ? "@unknown:0:0" : "";
		}
		return "\n" + he + e + L;
	}
	var _e = !1;
	function ve(e, t) {
		if (!e || _e) return "";
		_e = !0;
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
			_e = !1, Error.prepareStackTrace = n;
		}
		return (n = e ? e.displayName || e.name : "") ? ge(n) : "";
	}
	function ye(e, t) {
		switch (e.tag) {
			case 26:
			case 27:
			case 5: return ge(e.type);
			case 16: return ge("Lazy");
			case 13: return e.child !== t && t !== null ? ge("Suspense Fallback") : ge("Suspense");
			case 19: return ge("SuspenseList");
			case 0:
			case 15: return ve(e.type, !1);
			case 11: return ve(e.type.render, !1);
			case 1: return ve(e.type, !0);
			case 31: return ge("Activity");
			default: return "";
		}
	}
	function be(e) {
		try {
			var t = "", n = null;
			do
				t += ye(e, n), n = e, e = e.return;
			while (e);
			return t;
		} catch (e) {
			return "\nError generating stack: " + e.message + "\n" + e.stack;
		}
	}
	var xe = Object.prototype.hasOwnProperty, Se = t.unstable_scheduleCallback, Ce = t.unstable_cancelCallback, we = t.unstable_shouldYield, Te = t.unstable_requestPaint, Ee = t.unstable_now, De = t.unstable_getCurrentPriorityLevel, Oe = t.unstable_ImmediatePriority, ke = t.unstable_UserBlockingPriority, Ae = t.unstable_NormalPriority, je = t.unstable_LowPriority, Me = t.unstable_IdlePriority, Ne = t.log, Pe = t.unstable_setDisableYieldValue, Fe = null, Ie = null;
	function Le(e) {
		if (typeof Ne == "function" && Pe(e), Ie && typeof Ie.setStrictMode == "function") try {
			Ie.setStrictMode(Fe, e);
		} catch {}
	}
	var Re = Math.clz32 ? Math.clz32 : Ve, ze = Math.log, Be = Math.LN2;
	function Ve(e) {
		return e >>>= 0, e === 0 ? 32 : 31 - (ze(e) / Be | 0) | 0;
	}
	var He = 256, Ue = 262144, We = 4194304;
	function Ge(e) {
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
	function Ke(e, t, n) {
		var r = e.pendingLanes;
		if (r === 0) return 0;
		var i = 0, a = e.suspendedLanes, o = e.pingedLanes;
		e = e.warmLanes;
		var s = r & 134217727;
		return s === 0 ? (s = r & ~a, s === 0 ? o === 0 ? n || (n = r & ~e, n !== 0 && (i = Ge(n))) : i = Ge(o) : i = Ge(s)) : (r = s & ~a, r === 0 ? (o &= s, o === 0 ? n || (n = s & ~e, n !== 0 && (i = Ge(n))) : i = Ge(o)) : i = Ge(r)), i === 0 ? 0 : t !== 0 && t !== i && (t & a) === 0 && (a = i & -i, n = t & -t, a >= n || a === 32 && n & 4194048) ? t : i;
	}
	function qe(e, t) {
		return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0;
	}
	function Je(e, t) {
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
	function Ye() {
		var e = We;
		return We <<= 1, !(We & 62914560) && (We = 4194304), e;
	}
	function Xe(e) {
		for (var t = [], n = 0; 31 > n; n++) t.push(e);
		return t;
	}
	function Ze(e, t) {
		e.pendingLanes |= t, t !== 268435456 && (e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0);
	}
	function Qe(e, t, n, r, i, a) {
		var o = e.pendingLanes;
		e.pendingLanes = n, e.suspendedLanes = 0, e.pingedLanes = 0, e.warmLanes = 0, e.expiredLanes &= n, e.entangledLanes &= n, e.errorRecoveryDisabledLanes &= n, e.shellSuspendCounter = 0;
		var s = e.entanglements, c = e.expirationTimes, l = e.hiddenUpdates;
		for (n = o & ~n; 0 < n;) {
			var u = 31 - Re(n), d = 1 << u;
			s[u] = 0, c[u] = -1;
			var f = l[u];
			if (f !== null) for (l[u] = null, u = 0; u < f.length; u++) {
				var p = f[u];
				p !== null && (p.lane &= -536870913);
			}
			n &= ~d;
		}
		r !== 0 && $e(e, r, 0), a !== 0 && i === 0 && e.tag !== 0 && (e.suspendedLanes |= a & ~(o & ~t));
	}
	function $e(e, t, n) {
		e.pendingLanes |= t, e.suspendedLanes &= ~t;
		var r = 31 - Re(t);
		e.entangledLanes |= t, e.entanglements[r] = e.entanglements[r] | 1073741824 | n & 261930;
	}
	function et(e, t) {
		var n = e.entangledLanes |= t;
		for (e = e.entanglements; n;) {
			var r = 31 - Re(n), i = 1 << r;
			i & t | e[r] & t && (e[r] |= t), n &= ~i;
		}
	}
	function tt(e, t) {
		var n = t & -t;
		return n = n & 42 ? 1 : nt(n), (n & (e.suspendedLanes | t)) === 0 ? n : 0;
	}
	function nt(e) {
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
	function rt(e) {
		return e &= -e, 2 < e ? 8 < e ? e & 134217727 ? 32 : 268435456 : 8 : 2;
	}
	function it() {
		var e = M.p;
		return e === 0 ? (e = window.event, e === void 0 ? 32 : mp(e.type)) : e;
	}
	function at(e, t) {
		var n = M.p;
		try {
			return M.p = e, t();
		} finally {
			M.p = n;
		}
	}
	var ot = Math.random().toString(36).slice(2), st = "__reactFiber$" + ot, ct = "__reactProps$" + ot, lt = "__reactContainer$" + ot, ut = "__reactEvents$" + ot, dt = "__reactListeners$" + ot, ft = "__reactHandles$" + ot, pt = "__reactResources$" + ot, mt = "__reactMarker$" + ot;
	function ht(e) {
		delete e[st], delete e[ct], delete e[ut], delete e[dt], delete e[ft];
	}
	function gt(e) {
		var t = e[st];
		if (t) return t;
		for (var n = e.parentNode; n;) {
			if (t = n[lt] || n[st]) {
				if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = df(e); e !== null;) {
					if (n = e[st]) return n;
					e = df(e);
				}
				return t;
			}
			e = n, n = e.parentNode;
		}
		return null;
	}
	function _t(e) {
		if (e = e[st] || e[lt]) {
			var t = e.tag;
			if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3) return e;
		}
		return null;
	}
	function vt(e) {
		var t = e.tag;
		if (t === 5 || t === 26 || t === 27 || t === 6) return e.stateNode;
		throw Error(s(33));
	}
	function yt(e) {
		var t = e[pt];
		return t ||= e[pt] = {
			hoistableStyles: /* @__PURE__ */ new Map(),
			hoistableScripts: /* @__PURE__ */ new Map()
		}, t;
	}
	function bt(e) {
		e[mt] = !0;
	}
	var xt = /* @__PURE__ */ new Set(), St = {};
	function Ct(e, t) {
		wt(e, t), wt(e + "Capture", t);
	}
	function wt(e, t) {
		for (St[e] = t, e = 0; e < t.length; e++) xt.add(t[e]);
	}
	var Tt = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"), Et = {}, Dt = {};
	function Ot(e) {
		return xe.call(Dt, e) ? !0 : xe.call(Et, e) ? !1 : Tt.test(e) ? Dt[e] = !0 : (Et[e] = !0, !1);
	}
	function kt(e, t, n) {
		if (Ot(t)) if (n === null) e.removeAttribute(t);
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
	function At(e, t, n) {
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
	function jt(e, t, n, r) {
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
	function R(e) {
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
	function Mt(e) {
		var t = e.type;
		return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
	}
	function Nt(e, t, n) {
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
	function Pt(e) {
		if (!e._valueTracker) {
			var t = Mt(e) ? "checked" : "value";
			e._valueTracker = Nt(e, t, "" + e[t]);
		}
	}
	function Ft(e) {
		if (!e) return !1;
		var t = e._valueTracker;
		if (!t) return !0;
		var n = t.getValue(), r = "";
		return e && (r = Mt(e) ? e.checked ? "true" : "false" : e.value), e = r, e === n ? !1 : (t.setValue(e), !0);
	}
	function It(e) {
		if (e ||= typeof document < "u" ? document : void 0, e === void 0) return null;
		try {
			return e.activeElement || e.body;
		} catch {
			return e.body;
		}
	}
	var Lt = /[\n"\\]/g;
	function Rt(e) {
		return e.replace(Lt, function(e) {
			return "\\" + e.charCodeAt(0).toString(16) + " ";
		});
	}
	function zt(e, t, n, r, i, a, o, s) {
		e.name = "", o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" ? e.type = o : e.removeAttribute("type"), t == null ? o !== "submit" && o !== "reset" || e.removeAttribute("value") : o === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + R(t)) : e.value !== "" + R(t) && (e.value = "" + R(t)), t == null ? n == null ? r != null && e.removeAttribute("value") : Vt(e, o, R(n)) : Vt(e, o, R(t)), i == null && a != null && (e.defaultChecked = !!a), i != null && (e.checked = i && typeof i != "function" && typeof i != "symbol"), s != null && typeof s != "function" && typeof s != "symbol" && typeof s != "boolean" ? e.name = "" + R(s) : e.removeAttribute("name");
	}
	function Bt(e, t, n, r, i, a, o, s) {
		if (a != null && typeof a != "function" && typeof a != "symbol" && typeof a != "boolean" && (e.type = a), t != null || n != null) {
			if (!(a !== "submit" && a !== "reset" || t != null)) {
				Pt(e);
				return;
			}
			n = n == null ? "" : "" + R(n), t = t == null ? n : "" + R(t), s || t === e.value || (e.value = t), e.defaultValue = t;
		}
		r ??= i, r = typeof r != "function" && typeof r != "symbol" && !!r, e.checked = s ? e.checked : !!r, e.defaultChecked = !!r, o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.name = o), Pt(e);
	}
	function Vt(e, t, n) {
		t === "number" && It(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n);
	}
	function Ht(e, t, n, r) {
		if (e = e.options, t) {
			t = {};
			for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
			for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
		} else {
			for (n = "" + R(n), t = null, i = 0; i < e.length; i++) {
				if (e[i].value === n) {
					e[i].selected = !0, r && (e[i].defaultSelected = !0);
					return;
				}
				t !== null || e[i].disabled || (t = e[i]);
			}
			t !== null && (t.selected = !0);
		}
	}
	function Ut(e, t, n) {
		if (t != null && (t = "" + R(t), t !== e.value && (e.value = t), n == null)) {
			e.defaultValue !== t && (e.defaultValue = t);
			return;
		}
		e.defaultValue = n == null ? "" : "" + R(n);
	}
	function Wt(e, t, n, r) {
		if (t == null) {
			if (r != null) {
				if (n != null) throw Error(s(92));
				if (ie(r)) {
					if (1 < r.length) throw Error(s(93));
					r = r[0];
				}
				n = r;
			}
			n ??= "", t = n;
		}
		n = R(t), e.defaultValue = n, r = e.textContent, r === n && r !== "" && r !== null && (e.value = r), Pt(e);
	}
	function Gt(e, t) {
		if (t) {
			var n = e.firstChild;
			if (n && n === e.lastChild && n.nodeType === 3) {
				n.nodeValue = t;
				return;
			}
		}
		e.textContent = t;
	}
	var Kt = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
	function qt(e, t, n) {
		var r = t.indexOf("--") === 0;
		n == null || typeof n == "boolean" || n === "" ? r ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : r ? e.setProperty(t, n) : typeof n != "number" || n === 0 || Kt.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px";
	}
	function Jt(e, t, n) {
		if (t != null && typeof t != "object") throw Error(s(62));
		if (e = e.style, n != null) {
			for (var r in n) !n.hasOwnProperty(r) || t != null && t.hasOwnProperty(r) || (r.indexOf("--") === 0 ? e.setProperty(r, "") : r === "float" ? e.cssFloat = "" : e[r] = "");
			for (var i in t) r = t[i], t.hasOwnProperty(i) && n[i] !== r && qt(e, i, r);
		} else for (var a in t) t.hasOwnProperty(a) && qt(e, a, t[a]);
	}
	function Yt(e) {
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
	var Xt = new Map([
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
	]), Zt = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
	function Qt(e) {
		return Zt.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e;
	}
	function $t() {}
	var en = null;
	function tn(e) {
		return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
	}
	var nn = null, rn = null;
	function an(e) {
		var t = _t(e);
		if (t && (e = t.stateNode)) {
			var n = e[ct] || null;
			a: switch (e = t.stateNode, t.type) {
				case "input":
					if (zt(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name), t = n.name, n.type === "radio" && t != null) {
						for (n = e; n.parentNode;) n = n.parentNode;
						for (n = n.querySelectorAll("input[name=\"" + Rt("" + t) + "\"][type=\"radio\"]"), t = 0; t < n.length; t++) {
							var r = n[t];
							if (r !== e && r.form === e.form) {
								var i = r[ct] || null;
								if (!i) throw Error(s(90));
								zt(r, i.value, i.defaultValue, i.defaultValue, i.checked, i.defaultChecked, i.type, i.name);
							}
						}
						for (t = 0; t < n.length; t++) r = n[t], r.form === e.form && Ft(r);
					}
					break a;
				case "textarea":
					Ut(e, n.value, n.defaultValue);
					break a;
				case "select": t = n.value, t != null && Ht(e, !!n.multiple, t, !1);
			}
		}
	}
	var on = !1;
	function sn(e, t, n) {
		if (on) return e(t, n);
		on = !0;
		try {
			return e(t);
		} finally {
			if (on = !1, (nn !== null || rn !== null) && (bu(), nn && (t = nn, e = rn, rn = nn = null, an(t), e))) for (t = 0; t < e.length; t++) an(e[t]);
		}
	}
	function cn(e, t) {
		var n = e.stateNode;
		if (n === null) return null;
		var r = n[ct] || null;
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
	var ln = !(typeof window > "u" || window.document === void 0 || window.document.createElement === void 0), un = !1;
	if (ln) try {
		var dn = {};
		Object.defineProperty(dn, "passive", { get: function() {
			un = !0;
		} }), window.addEventListener("test", dn, dn), window.removeEventListener("test", dn, dn);
	} catch {
		un = !1;
	}
	var fn = null, pn = null, mn = null;
	function hn() {
		if (mn) return mn;
		var e, t = pn, n = t.length, r, i = "value" in fn ? fn.value : fn.textContent, a = i.length;
		for (e = 0; e < n && t[e] === i[e]; e++);
		var o = n - e;
		for (r = 1; r <= o && t[n - r] === i[a - r]; r++);
		return mn = i.slice(e, 1 < r ? 1 - r : void 0);
	}
	function gn(e) {
		var t = e.keyCode;
		return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
	}
	function _n() {
		return !0;
	}
	function vn() {
		return !1;
	}
	function yn(e) {
		function t(t, n, r, i, a) {
			for (var o in this._reactName = t, this._targetInst = r, this.type = n, this.nativeEvent = i, this.target = a, this.currentTarget = null, e) e.hasOwnProperty(o) && (t = e[o], this[o] = t ? t(i) : i[o]);
			return this.isDefaultPrevented = (i.defaultPrevented == null ? !1 === i.returnValue : i.defaultPrevented) ? _n : vn, this.isPropagationStopped = vn, this;
		}
		return h(t.prototype, {
			preventDefault: function() {
				this.defaultPrevented = !0;
				var e = this.nativeEvent;
				e && (e.preventDefault ? e.preventDefault() : typeof e.returnValue != "unknown" && (e.returnValue = !1), this.isDefaultPrevented = _n);
			},
			stopPropagation: function() {
				var e = this.nativeEvent;
				e && (e.stopPropagation ? e.stopPropagation() : typeof e.cancelBubble != "unknown" && (e.cancelBubble = !0), this.isPropagationStopped = _n);
			},
			persist: function() {},
			isPersistent: _n
		}), t;
	}
	var bn = {
		eventPhase: 0,
		bubbles: 0,
		cancelable: 0,
		timeStamp: function(e) {
			return e.timeStamp || Date.now();
		},
		defaultPrevented: 0,
		isTrusted: 0
	}, xn = yn(bn), Sn = h({}, bn, {
		view: 0,
		detail: 0
	}), Cn = yn(Sn), wn, Tn, En, Dn = h({}, Sn, {
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
		getModifierState: Rn,
		button: 0,
		buttons: 0,
		relatedTarget: function(e) {
			return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
		},
		movementX: function(e) {
			return "movementX" in e ? e.movementX : (e !== En && (En && e.type === "mousemove" ? (wn = e.screenX - En.screenX, Tn = e.screenY - En.screenY) : Tn = wn = 0, En = e), wn);
		},
		movementY: function(e) {
			return "movementY" in e ? e.movementY : Tn;
		}
	}), On = yn(Dn), kn = yn(h({}, Dn, { dataTransfer: 0 })), An = yn(h({}, Sn, { relatedTarget: 0 })), jn = yn(h({}, bn, {
		animationName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Mn = yn(h({}, bn, { clipboardData: function(e) {
		return "clipboardData" in e ? e.clipboardData : window.clipboardData;
	} })), Nn = yn(h({}, bn, { data: 0 })), Pn = {
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
	}, Fn = {
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
	}, In = {
		Alt: "altKey",
		Control: "ctrlKey",
		Meta: "metaKey",
		Shift: "shiftKey"
	};
	function Ln(e) {
		var t = this.nativeEvent;
		return t.getModifierState ? t.getModifierState(e) : (e = In[e]) ? !!t[e] : !1;
	}
	function Rn() {
		return Ln;
	}
	var zn = yn(h({}, Sn, {
		key: function(e) {
			if (e.key) {
				var t = Pn[e.key] || e.key;
				if (t !== "Unidentified") return t;
			}
			return e.type === "keypress" ? (e = gn(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Fn[e.keyCode] || "Unidentified" : "";
		},
		code: 0,
		location: 0,
		ctrlKey: 0,
		shiftKey: 0,
		altKey: 0,
		metaKey: 0,
		repeat: 0,
		locale: 0,
		getModifierState: Rn,
		charCode: function(e) {
			return e.type === "keypress" ? gn(e) : 0;
		},
		keyCode: function(e) {
			return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		},
		which: function(e) {
			return e.type === "keypress" ? gn(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
		}
	})), Bn = yn(h({}, Dn, {
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
	})), Vn = yn(h({}, Sn, {
		touches: 0,
		targetTouches: 0,
		changedTouches: 0,
		altKey: 0,
		metaKey: 0,
		ctrlKey: 0,
		shiftKey: 0,
		getModifierState: Rn
	})), Hn = yn(h({}, bn, {
		propertyName: 0,
		elapsedTime: 0,
		pseudoElement: 0
	})), Un = yn(h({}, Dn, {
		deltaX: function(e) {
			return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
		},
		deltaY: function(e) {
			return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
		},
		deltaZ: 0,
		deltaMode: 0
	})), Wn = yn(h({}, bn, {
		newState: 0,
		oldState: 0
	})), Gn = [
		9,
		13,
		27,
		32
	], Kn = ln && "CompositionEvent" in window, qn = null;
	ln && "documentMode" in document && (qn = document.documentMode);
	var Jn = ln && "TextEvent" in window && !qn, Yn = ln && (!Kn || qn && 8 < qn && 11 >= qn), Xn = " ", Zn = !1;
	function Qn(e, t) {
		switch (e) {
			case "keyup": return Gn.indexOf(t.keyCode) !== -1;
			case "keydown": return t.keyCode !== 229;
			case "keypress":
			case "mousedown":
			case "focusout": return !0;
			default: return !1;
		}
	}
	function $n(e) {
		return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
	}
	var er = !1;
	function tr(e, t) {
		switch (e) {
			case "compositionend": return $n(t);
			case "keypress": return t.which === 32 ? (Zn = !0, Xn) : null;
			case "textInput": return e = t.data, e === Xn && Zn ? null : e;
			default: return null;
		}
	}
	function nr(e, t) {
		if (er) return e === "compositionend" || !Kn && Qn(e, t) ? (e = hn(), mn = pn = fn = null, er = !1, e) : null;
		switch (e) {
			case "paste": return null;
			case "keypress":
				if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
					if (t.char && 1 < t.char.length) return t.char;
					if (t.which) return String.fromCharCode(t.which);
				}
				return null;
			case "compositionend": return Yn && t.locale !== "ko" ? null : t.data;
			default: return null;
		}
	}
	var rr = {
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
	function ir(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t === "input" ? !!rr[e.type] : t === "textarea";
	}
	function ar(e, t, n, r) {
		nn ? rn ? rn.push(r) : rn = [r] : nn = r, t = Ed(t, "onChange"), 0 < t.length && (n = new xn("onChange", "change", null, n, r), e.push({
			event: n,
			listeners: t
		}));
	}
	var or = null, sr = null;
	function cr(e) {
		yd(e, 0);
	}
	function lr(e) {
		if (Ft(vt(e))) return e;
	}
	function ur(e, t) {
		if (e === "change") return t;
	}
	var dr = !1;
	if (ln) {
		var fr;
		if (ln) {
			var pr = "oninput" in document;
			if (!pr) {
				var mr = document.createElement("div");
				mr.setAttribute("oninput", "return;"), pr = typeof mr.oninput == "function";
			}
			fr = pr;
		} else fr = !1;
		dr = fr && (!document.documentMode || 9 < document.documentMode);
	}
	function hr() {
		or && (or.detachEvent("onpropertychange", gr), sr = or = null);
	}
	function gr(e) {
		if (e.propertyName === "value" && lr(sr)) {
			var t = [];
			ar(t, sr, e, tn(e)), sn(cr, t);
		}
	}
	function _r(e, t, n) {
		e === "focusin" ? (hr(), or = t, sr = n, or.attachEvent("onpropertychange", gr)) : e === "focusout" && hr();
	}
	function vr(e) {
		if (e === "selectionchange" || e === "keyup" || e === "keydown") return lr(sr);
	}
	function yr(e, t) {
		if (e === "click") return lr(t);
	}
	function br(e, t) {
		if (e === "input" || e === "change") return lr(t);
	}
	function xr(e, t) {
		return e === t && (e !== 0 || 1 / e == 1 / t) || e !== e && t !== t;
	}
	var Sr = typeof Object.is == "function" ? Object.is : xr;
	function Cr(e, t) {
		if (Sr(e, t)) return !0;
		if (typeof e != "object" || !e || typeof t != "object" || !t) return !1;
		var n = Object.keys(e), r = Object.keys(t);
		if (n.length !== r.length) return !1;
		for (r = 0; r < n.length; r++) {
			var i = n[r];
			if (!xe.call(t, i) || !Sr(e[i], t[i])) return !1;
		}
		return !0;
	}
	function wr(e) {
		for (; e && e.firstChild;) e = e.firstChild;
		return e;
	}
	function Tr(e, t) {
		var n = wr(e);
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
			n = wr(n);
		}
	}
	function Er(e, t) {
		return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Er(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
	}
	function Dr(e) {
		e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
		for (var t = It(e.document); t instanceof e.HTMLIFrameElement;) {
			try {
				var n = typeof t.contentWindow.location.href == "string";
			} catch {
				n = !1;
			}
			if (n) e = t.contentWindow;
			else break;
			t = It(e.document);
		}
		return t;
	}
	function Or(e) {
		var t = e && e.nodeName && e.nodeName.toLowerCase();
		return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
	}
	var kr = ln && "documentMode" in document && 11 >= document.documentMode, Ar = null, jr = null, Mr = null, Nr = !1;
	function Pr(e, t, n) {
		var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
		Nr || Ar == null || Ar !== It(r) || (r = Ar, "selectionStart" in r && Or(r) ? r = {
			start: r.selectionStart,
			end: r.selectionEnd
		} : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = {
			anchorNode: r.anchorNode,
			anchorOffset: r.anchorOffset,
			focusNode: r.focusNode,
			focusOffset: r.focusOffset
		}), Mr && Cr(Mr, r) || (Mr = r, r = Ed(jr, "onSelect"), 0 < r.length && (t = new xn("onSelect", "select", null, t, n), e.push({
			event: t,
			listeners: r
		}), t.target = Ar)));
	}
	function Fr(e, t) {
		var n = {};
		return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
	}
	var Ir = {
		animationend: Fr("Animation", "AnimationEnd"),
		animationiteration: Fr("Animation", "AnimationIteration"),
		animationstart: Fr("Animation", "AnimationStart"),
		transitionrun: Fr("Transition", "TransitionRun"),
		transitionstart: Fr("Transition", "TransitionStart"),
		transitioncancel: Fr("Transition", "TransitionCancel"),
		transitionend: Fr("Transition", "TransitionEnd")
	}, Lr = {}, Rr = {};
	ln && (Rr = document.createElement("div").style, "AnimationEvent" in window || (delete Ir.animationend.animation, delete Ir.animationiteration.animation, delete Ir.animationstart.animation), "TransitionEvent" in window || delete Ir.transitionend.transition);
	function zr(e) {
		if (Lr[e]) return Lr[e];
		if (!Ir[e]) return e;
		var t = Ir[e], n;
		for (n in t) if (t.hasOwnProperty(n) && n in Rr) return Lr[e] = t[n];
		return e;
	}
	var Br = zr("animationend"), Vr = zr("animationiteration"), Hr = zr("animationstart"), Ur = zr("transitionrun"), Wr = zr("transitionstart"), Gr = zr("transitioncancel"), Kr = zr("transitionend"), qr = /* @__PURE__ */ new Map(), Jr = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
	Jr.push("scrollEnd");
	function Yr(e, t) {
		qr.set(e, t), Ct(t, [e]);
	}
	var Xr = typeof reportError == "function" ? reportError : function(e) {
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
	}, Zr = [], Qr = 0, $r = 0;
	function ei() {
		for (var e = Qr, t = $r = Qr = 0; t < e;) {
			var n = Zr[t];
			Zr[t++] = null;
			var r = Zr[t];
			Zr[t++] = null;
			var i = Zr[t];
			Zr[t++] = null;
			var a = Zr[t];
			if (Zr[t++] = null, r !== null && i !== null) {
				var o = r.pending;
				o === null ? i.next = i : (i.next = o.next, o.next = i), r.pending = i;
			}
			a !== 0 && ii(n, i, a);
		}
	}
	function ti(e, t, n, r) {
		Zr[Qr++] = e, Zr[Qr++] = t, Zr[Qr++] = n, Zr[Qr++] = r, $r |= r, e.lanes |= r, e = e.alternate, e !== null && (e.lanes |= r);
	}
	function ni(e, t, n, r) {
		return ti(e, t, n, r), ai(e);
	}
	function ri(e, t) {
		return ti(e, null, null, t), ai(e);
	}
	function ii(e, t, n) {
		e.lanes |= n;
		var r = e.alternate;
		r !== null && (r.lanes |= n);
		for (var i = !1, a = e.return; a !== null;) a.childLanes |= n, r = a.alternate, r !== null && (r.childLanes |= n), a.tag === 22 && (e = a.stateNode, e === null || e._visibility & 1 || (i = !0)), e = a, a = a.return;
		return e.tag === 3 ? (a = e.stateNode, i && t !== null && (i = 31 - Re(n), e = a.hiddenUpdates, r = e[i], r === null ? e[i] = [t] : r.push(t), t.lane = n | 536870912), a) : null;
	}
	function ai(e) {
		if (50 < du) throw du = 0, fu = null, Error(s(185));
		for (var t = e.return; t !== null;) e = t, t = e.return;
		return e.tag === 3 ? e.stateNode : null;
	}
	var oi = {};
	function si(e, t, n, r) {
		this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.refCleanup = this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
	}
	function ci(e, t, n, r) {
		return new si(e, t, n, r);
	}
	function li(e) {
		return e = e.prototype, !(!e || !e.isReactComponent);
	}
	function ui(e, t) {
		var n = e.alternate;
		return n === null ? (n = ci(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 65011712, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n.refCleanup = e.refCleanup, n;
	}
	function di(e, t) {
		e.flags &= 65011714;
		var n = e.alternate;
		return n === null ? (e.childLanes = 0, e.lanes = t, e.child = null, e.subtreeFlags = 0, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null) : (e.childLanes = n.childLanes, e.lanes = n.lanes, e.child = n.child, e.subtreeFlags = 0, e.deletions = null, e.memoizedProps = n.memoizedProps, e.memoizedState = n.memoizedState, e.updateQueue = n.updateQueue, e.type = n.type, t = n.dependencies, e.dependencies = t === null ? null : {
			lanes: t.lanes,
			firstContext: t.firstContext
		}), e;
	}
	function fi(e, t, n, r, i, a) {
		var o = 0;
		if (r = e, typeof e == "function") li(e) && (o = 1);
		else if (typeof e == "string") o = Uf(e, n, I.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
		else a: switch (e) {
			case ee: return e = ci(31, n, t, i), e.elementType = ee, e.lanes = a, e;
			case y: return pi(n.children, i, a, t);
			case b:
				o = 8, i |= 24;
				break;
			case x: return e = ci(12, n, t, i | 2), e.elementType = x, e.lanes = a, e;
			case T: return e = ci(13, n, t, i), e.elementType = T, e.lanes = a, e;
			case E: return e = ci(19, n, t, i), e.elementType = E, e.lanes = a, e;
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
		return t = ci(o, n, t, i), t.elementType = e, t.type = r, t.lanes = a, t;
	}
	function pi(e, t, n, r) {
		return e = ci(7, e, r, t), e.lanes = n, e;
	}
	function mi(e, t, n) {
		return e = ci(6, e, null, t), e.lanes = n, e;
	}
	function hi(e) {
		var t = ci(18, null, null, 0);
		return t.stateNode = e, t;
	}
	function gi(e, t, n) {
		return t = ci(4, e.children === null ? [] : e.children, e.key, t), t.lanes = n, t.stateNode = {
			containerInfo: e.containerInfo,
			pendingChildren: null,
			implementation: e.implementation
		}, t;
	}
	var _i = /* @__PURE__ */ new WeakMap();
	function vi(e, t) {
		if (typeof e == "object" && e) {
			var n = _i.get(e);
			return n === void 0 ? (t = {
				value: e,
				source: t,
				stack: be(t)
			}, _i.set(e, t), t) : n;
		}
		return {
			value: e,
			source: t,
			stack: be(t)
		};
	}
	var yi = [], bi = 0, xi = null, Si = 0, Ci = [], wi = 0, Ti = null, Ei = 1, Di = "";
	function Oi(e, t) {
		yi[bi++] = Si, yi[bi++] = xi, xi = e, Si = t;
	}
	function ki(e, t, n) {
		Ci[wi++] = Ei, Ci[wi++] = Di, Ci[wi++] = Ti, Ti = e;
		var r = Ei;
		e = Di;
		var i = 32 - Re(r) - 1;
		r &= ~(1 << i), n += 1;
		var a = 32 - Re(t) + i;
		if (30 < a) {
			var o = i - i % 5;
			a = (r & (1 << o) - 1).toString(32), r >>= o, i -= o, Ei = 1 << 32 - Re(t) + i | n << i | r, Di = a + e;
		} else Ei = 1 << a | n << i | r, Di = e;
	}
	function Ai(e) {
		e.return !== null && (Oi(e, 1), ki(e, 1, 0));
	}
	function ji(e) {
		for (; e === xi;) xi = yi[--bi], yi[bi] = null, Si = yi[--bi], yi[bi] = null;
		for (; e === Ti;) Ti = Ci[--wi], Ci[wi] = null, Di = Ci[--wi], Ci[wi] = null, Ei = Ci[--wi], Ci[wi] = null;
	}
	function Mi(e, t) {
		Ci[wi++] = Ei, Ci[wi++] = Di, Ci[wi++] = Ti, Ei = t.id, Di = t.overflow, Ti = e;
	}
	var Ni = null, z = null, B = !1, Pi = null, Fi = !1, Ii = Error(s(519));
	function Li(e) {
		throw Ui(vi(Error(s(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", "")), e)), Ii;
	}
	function Ri(e) {
		var t = e.stateNode, n = e.type, r = e.memoizedProps;
		switch (t[st] = e, t[ct] = r, n) {
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
				Q("invalid", t), Bt(t, r.value, r.defaultValue, r.checked, r.defaultChecked, r.type, r.name, !0);
				break;
			case "select":
				Q("invalid", t);
				break;
			case "textarea": Q("invalid", t), Wt(t, r.value, r.defaultValue, r.children);
		}
		n = r.children, typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || !0 === r.suppressHydrationWarning || Md(t.textContent, n) ? (r.popover != null && (Q("beforetoggle", t), Q("toggle", t)), r.onScroll != null && Q("scroll", t), r.onScrollEnd != null && Q("scrollend", t), r.onClick != null && (t.onclick = $t), t = !0) : t = !1, t || Li(e, !0);
	}
	function zi(e) {
		for (Ni = e.return; Ni;) switch (Ni.tag) {
			case 5:
			case 31:
			case 13:
				Fi = !1;
				return;
			case 27:
			case 3:
				Fi = !0;
				return;
			default: Ni = Ni.return;
		}
	}
	function Bi(e) {
		if (e !== Ni) return !1;
		if (!B) return zi(e), B = !0, !1;
		var t = e.tag, n;
		if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type, n = !(n !== "form" && n !== "button") || Ud(e.type, e.memoizedProps)), n = !n), n && z && Li(e), zi(e), t === 13) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			z = uf(e);
		} else if (t === 31) {
			if (e = e.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(317));
			z = uf(e);
		} else t === 27 ? (t = z, Zd(e.type) ? (e = lf, lf = null, z = e) : z = t) : z = Ni ? cf(e.stateNode.nextSibling) : null;
		return !0;
	}
	function Vi() {
		z = Ni = null, B = !1;
	}
	function Hi() {
		var e = Pi;
		return e !== null && (Zl === null ? Zl = e : Zl.push.apply(Zl, e), Pi = null), e;
	}
	function Ui(e) {
		Pi === null ? Pi = [e] : Pi.push(e);
	}
	var Wi = se(null), Gi = null, Ki = null;
	function qi(e, t, n) {
		F(Wi, t._currentValue), t._currentValue = n;
	}
	function Ji(e) {
		e._currentValue = Wi.current, P(Wi);
	}
	function Yi(e, t, n) {
		for (; e !== null;) {
			var r = e.alternate;
			if ((e.childLanes & t) === t ? r !== null && (r.childLanes & t) !== t && (r.childLanes |= t) : (e.childLanes |= t, r !== null && (r.childLanes |= t)), e === n) break;
			e = e.return;
		}
	}
	function Xi(e, t, n, r) {
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
						a.lanes |= n, c = a.alternate, c !== null && (c.lanes |= n), Yi(a.return, n, e), r || (o = null);
						break a;
					}
					a = c.next;
				}
			} else if (i.tag === 18) {
				if (o = i.return, o === null) throw Error(s(341));
				o.lanes |= n, a = o.alternate, a !== null && (a.lanes |= n), Yi(o, n, e), o = null;
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
	function Zi(e, t, n, r) {
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
					Sr(i.pendingProps.value, o.value) || (e === null ? e = [c] : e.push(c));
				}
			} else if (i === ue.current) {
				if (o = i.alternate, o === null) throw Error(s(387));
				o.memoizedState.memoizedState !== i.memoizedState.memoizedState && (e === null ? e = [Qf] : e.push(Qf));
			}
			i = i.return;
		}
		e !== null && Xi(t, e, n, r), t.flags |= 262144;
	}
	function Qi(e) {
		for (e = e.firstContext; e !== null;) {
			if (!Sr(e.context._currentValue, e.memoizedValue)) return !0;
			e = e.next;
		}
		return !1;
	}
	function $i(e) {
		Gi = e, Ki = null, e = e.dependencies, e !== null && (e.firstContext = null);
	}
	function ea(e) {
		return na(Gi, e);
	}
	function ta(e, t) {
		return Gi === null && $i(e), na(e, t);
	}
	function na(e, t) {
		var n = t._currentValue;
		if (t = {
			context: t,
			memoizedValue: n,
			next: null
		}, Ki === null) {
			if (e === null) throw Error(s(308));
			Ki = t, e.dependencies = {
				lanes: 0,
				firstContext: t
			}, e.flags |= 524288;
		} else Ki = Ki.next = t;
		return n;
	}
	var ra = typeof AbortController < "u" ? AbortController : function() {
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
	}, ia = t.unstable_scheduleCallback, aa = t.unstable_NormalPriority, oa = {
		$$typeof: C,
		Consumer: null,
		Provider: null,
		_currentValue: null,
		_currentValue2: null,
		_threadCount: 0
	};
	function sa() {
		return {
			controller: new ra(),
			data: /* @__PURE__ */ new Map(),
			refCount: 0
		};
	}
	function ca(e) {
		e.refCount--, e.refCount === 0 && ia(aa, function() {
			e.controller.abort();
		});
	}
	var la = null, ua = 0, da = 0, fa = null;
	function pa(e, t) {
		if (la === null) {
			var n = la = [];
			ua = 0, da = dd(), fa = {
				status: "pending",
				value: void 0,
				then: function(e) {
					n.push(e);
				}
			};
		}
		return ua++, t.then(ma, ma), t;
	}
	function ma() {
		if (--ua === 0 && la !== null) {
			fa !== null && (fa.status = "fulfilled");
			var e = la;
			la = null, da = 0, fa = null;
			for (var t = 0; t < e.length; t++) (0, e[t])();
		}
	}
	function ha(e, t) {
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
	var ga = j.S;
	j.S = function(e, t) {
		eu = Ee(), typeof t == "object" && t && typeof t.then == "function" && pa(e, t), ga !== null && ga(e, t);
	};
	var _a = se(null);
	function va() {
		var e = _a.current;
		return e === null ? K.pooledCache : e;
	}
	function ya(e, t) {
		t === null ? F(_a, _a.current) : F(_a, t.pool);
	}
	function ba() {
		var e = va();
		return e === null ? null : {
			parent: oa._currentValue,
			pool: e
		};
	}
	var xa = Error(s(460)), Sa = Error(s(474)), Ca = Error(s(542)), wa = { then: function() {} };
	function Ta(e) {
		return e = e.status, e === "fulfilled" || e === "rejected";
	}
	function Ea(e, t, n) {
		switch (n = e[n], n === void 0 ? e.push(t) : n !== t && (t.then($t, $t), t = n), t.status) {
			case "fulfilled": return t.value;
			case "rejected": throw e = t.reason, Aa(e), e;
			default:
				if (typeof t.status == "string") t.then($t, $t);
				else {
					if (e = K, e !== null && 100 < e.shellSuspendCounter) throw Error(s(482));
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
					case "rejected": throw e = t.reason, Aa(e), e;
				}
				throw Oa = t, xa;
		}
	}
	function Da(e) {
		try {
			var t = e._init;
			return t(e._payload);
		} catch (e) {
			throw typeof e == "object" && e && typeof e.then == "function" ? (Oa = e, xa) : e;
		}
	}
	var Oa = null;
	function ka() {
		if (Oa === null) throw Error(s(459));
		var e = Oa;
		return Oa = null, e;
	}
	function Aa(e) {
		if (e === xa || e === Ca) throw Error(s(483));
	}
	var ja = null, Ma = 0;
	function Na(e) {
		var t = Ma;
		return Ma += 1, ja === null && (ja = []), Ea(ja, e, t);
	}
	function Pa(e, t) {
		t = t.props.ref, e.ref = t === void 0 ? null : t;
	}
	function Fa(e, t) {
		throw t.$$typeof === g ? Error(s(525)) : (e = Object.prototype.toString.call(t), Error(s(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)));
	}
	function Ia(e) {
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
			return e = ui(e, t), e.index = 0, e.sibling = null, e;
		}
		function a(t, n, r) {
			return t.index = r, e ? (r = t.alternate, r === null ? (t.flags |= 67108866, n) : (r = r.index, r < n ? (t.flags |= 67108866, n) : r)) : (t.flags |= 1048576, n);
		}
		function o(t) {
			return e && t.alternate === null && (t.flags |= 67108866), t;
		}
		function c(e, t, n, r) {
			return t === null || t.tag !== 6 ? (t = mi(n, e.mode, r), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function l(e, t, n, r) {
			var a = n.type;
			return a === y ? d(e, t, n.props.children, r, n.key) : t !== null && (t.elementType === a || typeof a == "object" && a && a.$$typeof === O && Da(a) === t.type) ? (t = i(t, n.props), Pa(t, n), t.return = e, t) : (t = fi(n.type, n.key, n.props, null, e.mode, r), Pa(t, n), t.return = e, t);
		}
		function u(e, t, n, r) {
			return t === null || t.tag !== 4 || t.stateNode.containerInfo !== n.containerInfo || t.stateNode.implementation !== n.implementation ? (t = gi(n, e.mode, r), t.return = e, t) : (t = i(t, n.children || []), t.return = e, t);
		}
		function d(e, t, n, r, a) {
			return t === null || t.tag !== 7 ? (t = pi(n, e.mode, r, a), t.return = e, t) : (t = i(t, n), t.return = e, t);
		}
		function f(e, t, n) {
			if (typeof t == "string" && t !== "" || typeof t == "number" || typeof t == "bigint") return t = mi("" + t, e.mode, n), t.return = e, t;
			if (typeof t == "object" && t) {
				switch (t.$$typeof) {
					case _: return n = fi(t.type, t.key, t.props, null, e.mode, n), Pa(n, t), n.return = e, n;
					case v: return t = gi(t, e.mode, n), t.return = e, t;
					case O: return t = Da(t), f(e, t, n);
				}
				if (ie(t) || te(t)) return t = pi(t, e.mode, n, null), t.return = e, t;
				if (typeof t.then == "function") return f(e, Na(t), n);
				if (t.$$typeof === C) return f(e, ta(e, t), n);
				Fa(e, t);
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
					case O: return n = Da(n), p(e, t, n, r);
				}
				if (ie(n) || te(n)) return i === null ? d(e, t, n, r, null) : null;
				if (typeof n.then == "function") return p(e, t, Na(n), r);
				if (n.$$typeof === C) return p(e, t, ta(e, n), r);
				Fa(e, n);
			}
			return null;
		}
		function m(e, t, n, r, i) {
			if (typeof r == "string" && r !== "" || typeof r == "number" || typeof r == "bigint") return e = e.get(n) || null, c(t, e, "" + r, i);
			if (typeof r == "object" && r) {
				switch (r.$$typeof) {
					case _: return e = e.get(r.key === null ? n : r.key) || null, l(t, e, r, i);
					case v: return e = e.get(r.key === null ? n : r.key) || null, u(t, e, r, i);
					case O: return r = Da(r), m(e, t, n, r, i);
				}
				if (ie(r) || te(r)) return e = e.get(n) || null, d(t, e, r, i, null);
				if (typeof r.then == "function") return m(e, t, n, Na(r), i);
				if (r.$$typeof === C) return m(e, t, n, ta(t, r), i);
				Fa(t, r);
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
			if (h === s.length) return n(i, d), B && Oi(i, h), l;
			if (d === null) {
				for (; h < s.length; h++) d = f(i, s[h], c), d !== null && (o = a(d, o, h), u === null ? l = d : u.sibling = d, u = d);
				return B && Oi(i, h), l;
			}
			for (d = r(d); h < s.length; h++) g = m(d, i, h, s[h], c), g !== null && (e && g.alternate !== null && d.delete(g.key === null ? h : g.key), o = a(g, o, h), u === null ? l = g : u.sibling = g, u = g);
			return e && d.forEach(function(e) {
				return t(i, e);
			}), B && Oi(i, h), l;
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
			if (v.done) return n(i, h), B && Oi(i, g), u;
			if (h === null) {
				for (; !v.done; g++, v = c.next()) v = f(i, v.value, l), v !== null && (o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
				return B && Oi(i, g), u;
			}
			for (h = r(h); !v.done; g++, v = c.next()) v = m(h, i, g, v.value, l), v !== null && (e && v.alternate !== null && h.delete(v.key === null ? g : v.key), o = a(v, o, g), d === null ? u = v : d.sibling = v, d = v);
			return e && h.forEach(function(e) {
				return t(i, e);
			}), B && Oi(i, g), u;
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
									} else if (r.elementType === l || typeof l == "object" && l && l.$$typeof === O && Da(l) === r.type) {
										n(e, r.sibling), c = i(r, a.props), Pa(c, a), c.return = e, e = c;
										break a;
									}
									n(e, r);
									break;
								} else t(e, r);
								r = r.sibling;
							}
							a.type === y ? (c = pi(a.props.children, e.mode, c, a.key), c.return = e, e = c) : (c = fi(a.type, a.key, a.props, null, e.mode, c), Pa(c, a), c.return = e, e = c);
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
							c = gi(a, e.mode, c), c.return = e, e = c;
						}
						return o(e);
					case O: return a = Da(a), b(e, r, a, c);
				}
				if (ie(a)) return h(e, r, a, c);
				if (te(a)) {
					if (l = te(a), typeof l != "function") throw Error(s(150));
					return a = l.call(a), g(e, r, a, c);
				}
				if (typeof a.then == "function") return b(e, r, Na(a), c);
				if (a.$$typeof === C) return b(e, r, ta(e, a), c);
				Fa(e, a);
			}
			return typeof a == "string" && a !== "" || typeof a == "number" || typeof a == "bigint" ? (a = "" + a, r !== null && r.tag === 6 ? (n(e, r.sibling), c = i(r, a), c.return = e, e = c) : (n(e, r), c = mi(a, e.mode, c), c.return = e, e = c), o(e)) : n(e, r);
		}
		return function(e, t, n, r) {
			try {
				Ma = 0;
				var i = b(e, t, n, r);
				return ja = null, i;
			} catch (t) {
				if (t === xa || t === Ca) throw t;
				var a = ci(29, t, null, e.mode);
				return a.lanes = r, a.return = e, a;
			}
		};
	}
	var La = Ia(!0), Ra = Ia(!1), za = !1;
	function Ba(e) {
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
	function Va(e, t) {
		e = e.updateQueue, t.updateQueue === e && (t.updateQueue = {
			baseState: e.baseState,
			firstBaseUpdate: e.firstBaseUpdate,
			lastBaseUpdate: e.lastBaseUpdate,
			shared: e.shared,
			callbacks: null
		});
	}
	function Ha(e) {
		return {
			lane: e,
			tag: 0,
			payload: null,
			callback: null,
			next: null
		};
	}
	function Ua(e, t, n) {
		var r = e.updateQueue;
		if (r === null) return null;
		if (r = r.shared, G & 2) {
			var i = r.pending;
			return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, t = ai(e), ii(e, null, n), t;
		}
		return ti(e, r, t, n), ai(e);
	}
	function Wa(e, t, n) {
		if (t = t.updateQueue, t !== null && (t = t.shared, n & 4194048)) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, et(e, n);
		}
	}
	function Ga(e, t) {
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
	var Ka = !1;
	function qa() {
		if (Ka) {
			var e = fa;
			if (e !== null) throw e;
		}
	}
	function Ja(e, t, n, r) {
		Ka = !1;
		var i = e.updateQueue;
		za = !1;
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
				if (p ? (J & f) === f : (r & f) === f) {
					f !== 0 && f === da && (Ka = !0), u !== null && (u = u.next = {
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
							case 2: za = !0;
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
	function Ya(e, t) {
		if (typeof e != "function") throw Error(s(191, e));
		e.call(t);
	}
	function Xa(e, t) {
		var n = e.callbacks;
		if (n !== null) for (e.callbacks = null, e = 0; e < n.length; e++) Ya(n[e], t);
	}
	var Za = se(null), Qa = se(0);
	function $a(e, t) {
		e = Wl, F(Qa, e), F(Za, t), Wl = e | t.baseLanes;
	}
	function eo() {
		F(Qa, Wl), F(Za, Za.current);
	}
	function to() {
		Wl = Qa.current, P(Za), P(Qa);
	}
	var no = se(null), ro = null;
	function io(e) {
		var t = e.alternate;
		F(lo, lo.current & 1), F(no, e), ro === null && (t === null || Za.current !== null || t.memoizedState !== null) && (ro = e);
	}
	function ao(e) {
		F(lo, lo.current), F(no, e), ro === null && (ro = e);
	}
	function oo(e) {
		e.tag === 22 ? (F(lo, lo.current), F(no, e), ro === null && (ro = e)) : so(e);
	}
	function so() {
		F(lo, lo.current), F(no, no.current);
	}
	function co(e) {
		P(no), ro === e && (ro = null), P(lo);
	}
	var lo = se(0);
	function uo(e) {
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
	var fo = 0, V = null, H = null, po = null, mo = !1, ho = !1, go = !1, _o = 0, vo = 0, yo = null, bo = 0;
	function xo() {
		throw Error(s(321));
	}
	function So(e, t) {
		if (t === null) return !1;
		for (var n = 0; n < t.length && n < e.length; n++) if (!Sr(e[n], t[n])) return !1;
		return !0;
	}
	function Co(e, t, n, r, i, a) {
		return fo = a, V = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, j.H = e === null || e.memoizedState === null ? Bs : Vs, go = !1, a = n(r, i), go = !1, ho && (a = To(t, n, r, i)), wo(e), a;
	}
	function wo(e) {
		j.H = zs;
		var t = H !== null && H.next !== null;
		if (fo = 0, po = H = V = null, mo = !1, vo = 0, yo = null, t) throw Error(s(300));
		e === null || ic || (e = e.dependencies, e !== null && Qi(e) && (ic = !0));
	}
	function To(e, t, n, r) {
		V = e;
		var i = 0;
		do {
			if (ho && (yo = null), vo = 0, ho = !1, 25 <= i) throw Error(s(301));
			if (i += 1, po = H = null, e.updateQueue != null) {
				var a = e.updateQueue;
				a.lastEffect = null, a.events = null, a.stores = null, a.memoCache != null && (a.memoCache.index = 0);
			}
			j.H = Hs, a = t(n, r);
		} while (ho);
		return a;
	}
	function Eo() {
		var e = j.H, t = e.useState()[0];
		return t = typeof t.then == "function" ? No(t) : t, e = e.useState()[0], (H === null ? null : H.memoizedState) !== e && (V.flags |= 1024), t;
	}
	function Do() {
		var e = _o !== 0;
		return _o = 0, e;
	}
	function Oo(e, t, n) {
		t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~n;
	}
	function ko(e) {
		if (mo) {
			for (e = e.memoizedState; e !== null;) {
				var t = e.queue;
				t !== null && (t.pending = null), e = e.next;
			}
			mo = !1;
		}
		fo = 0, po = H = V = null, ho = !1, vo = _o = 0, yo = null;
	}
	function Ao() {
		var e = {
			memoizedState: null,
			baseState: null,
			baseQueue: null,
			queue: null,
			next: null
		};
		return po === null ? V.memoizedState = po = e : po = po.next = e, po;
	}
	function jo() {
		if (H === null) {
			var e = V.alternate;
			e = e === null ? null : e.memoizedState;
		} else e = H.next;
		var t = po === null ? V.memoizedState : po.next;
		if (t !== null) po = t, H = e;
		else {
			if (e === null) throw V.alternate === null ? Error(s(467)) : Error(s(310));
			H = e, e = {
				memoizedState: H.memoizedState,
				baseState: H.baseState,
				baseQueue: H.baseQueue,
				queue: H.queue,
				next: null
			}, po === null ? V.memoizedState = po = e : po = po.next = e;
		}
		return po;
	}
	function Mo() {
		return {
			lastEffect: null,
			events: null,
			stores: null,
			memoCache: null
		};
	}
	function No(e) {
		var t = vo;
		return vo += 1, yo === null && (yo = []), e = Ea(yo, e, t), t = V, (po === null ? t.memoizedState : po.next) === null && (t = t.alternate, j.H = t === null || t.memoizedState === null ? Bs : Vs), e;
	}
	function Po(e) {
		if (typeof e == "object" && e) {
			if (typeof e.then == "function") return No(e);
			if (e.$$typeof === C) return ea(e);
		}
		throw Error(s(438, String(e)));
	}
	function Fo(e) {
		var t = null, n = V.updateQueue;
		if (n !== null && (t = n.memoCache), t == null) {
			var r = V.alternate;
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
		}, n === null && (n = Mo(), V.updateQueue = n), n.memoCache = t, n = t.data[t.index], n === void 0) for (n = t.data[t.index] = Array(e), r = 0; r < e; r++) n[r] = k;
		return t.index++, n;
	}
	function Io(e, t) {
		return typeof t == "function" ? t(e) : t;
	}
	function Lo(e) {
		return Ro(jo(), H, e);
	}
	function Ro(e, t, n) {
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
				if (f === u.lane ? (fo & f) === f : (J & f) === f) {
					var p = u.revertLane;
					if (p === 0) l !== null && (l = l.next = {
						lane: 0,
						revertLane: 0,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}), f === da && (d = !0);
					else if ((fo & p) === p) {
						u = u.next, p === da && (d = !0);
						continue;
					} else f = {
						lane: 0,
						revertLane: u.revertLane,
						gesture: null,
						action: u.action,
						hasEagerState: u.hasEagerState,
						eagerState: u.eagerState,
						next: null
					}, l === null ? (c = l = f, o = a) : l = l.next = f, V.lanes |= p, Gl |= p;
					f = u.action, go && n(a, f), a = u.hasEagerState ? u.eagerState : n(a, f);
				} else p = {
					lane: f,
					revertLane: u.revertLane,
					gesture: u.gesture,
					action: u.action,
					hasEagerState: u.hasEagerState,
					eagerState: u.eagerState,
					next: null
				}, l === null ? (c = l = p, o = a) : l = l.next = p, V.lanes |= f, Gl |= f;
				u = u.next;
			} while (u !== null && u !== t);
			if (l === null ? o = a : l.next = c, !Sr(a, e.memoizedState) && (ic = !0, d && (n = fa, n !== null))) throw n;
			e.memoizedState = a, e.baseState = o, e.baseQueue = l, r.lastRenderedState = a;
		}
		return i === null && (r.lanes = 0), [e.memoizedState, r.dispatch];
	}
	function zo(e) {
		var t = jo(), n = t.queue;
		if (n === null) throw Error(s(311));
		n.lastRenderedReducer = e;
		var r = n.dispatch, i = n.pending, a = t.memoizedState;
		if (i !== null) {
			n.pending = null;
			var o = i = i.next;
			do
				a = e(a, o.action), o = o.next;
			while (o !== i);
			Sr(a, t.memoizedState) || (ic = !0), t.memoizedState = a, t.baseQueue === null && (t.baseState = a), n.lastRenderedState = a;
		}
		return [a, r];
	}
	function Bo(e, t, n) {
		var r = V, i = jo(), a = B;
		if (a) {
			if (n === void 0) throw Error(s(407));
			n = n();
		} else n = t();
		var o = !Sr((H || i).memoizedState, n);
		if (o && (i.memoizedState = n, ic = !0), i = i.queue, ds(Uo.bind(null, r, i, e), [e]), i.getSnapshot !== t || o || po !== null && po.memoizedState.tag & 1) {
			if (r.flags |= 2048, os(9, { destroy: void 0 }, Ho.bind(null, r, i, n, t), null), K === null) throw Error(s(349));
			a || fo & 127 || Vo(r, t, n);
		}
		return n;
	}
	function Vo(e, t, n) {
		e.flags |= 16384, e = {
			getSnapshot: t,
			value: n
		}, t = V.updateQueue, t === null ? (t = Mo(), V.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
	}
	function Ho(e, t, n, r) {
		t.value = n, t.getSnapshot = r, Wo(t) && Go(e);
	}
	function Uo(e, t, n) {
		return n(function() {
			Wo(t) && Go(e);
		});
	}
	function Wo(e) {
		var t = e.getSnapshot;
		e = e.value;
		try {
			var n = t();
			return !Sr(e, n);
		} catch {
			return !0;
		}
	}
	function Go(e) {
		var t = ri(e, 2);
		t !== null && hu(t, e, 2);
	}
	function Ko(e) {
		var t = Ao();
		if (typeof e == "function") {
			var n = e;
			if (e = n(), go) {
				Le(!0);
				try {
					n();
				} finally {
					Le(!1);
				}
			}
		}
		return t.memoizedState = t.baseState = e, t.queue = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: Io,
			lastRenderedState: e
		}, t;
	}
	function qo(e, t, n, r) {
		return e.baseState = n, Ro(e, H, typeof r == "function" ? r : Io);
	}
	function Jo(e, t, n, r, i) {
		if (Is(e)) throw Error(s(485));
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
			j.T === null ? a.isTransition = !1 : n(!0), r(a), n = t.pending, n === null ? (a.next = t.pending = a, Yo(t, a)) : (a.next = n.next, t.pending = n.next = a);
		}
	}
	function Yo(e, t) {
		var n = t.action, r = t.payload, i = e.state;
		if (t.isTransition) {
			var a = j.T, o = {};
			j.T = o;
			try {
				var s = n(i, r), c = j.S;
				c !== null && c(o, s), Xo(e, t, s);
			} catch (n) {
				Qo(e, t, n);
			} finally {
				a !== null && o.types !== null && (a.types = o.types), j.T = a;
			}
		} else try {
			a = n(i, r), Xo(e, t, a);
		} catch (n) {
			Qo(e, t, n);
		}
	}
	function Xo(e, t, n) {
		typeof n == "object" && n && typeof n.then == "function" ? n.then(function(n) {
			Zo(e, t, n);
		}, function(n) {
			return Qo(e, t, n);
		}) : Zo(e, t, n);
	}
	function Zo(e, t, n) {
		t.status = "fulfilled", t.value = n, $o(t), e.state = n, t = e.pending, t !== null && (n = t.next, n === t ? e.pending = null : (n = n.next, t.next = n, Yo(e, n)));
	}
	function Qo(e, t, n) {
		var r = e.pending;
		if (e.pending = null, r !== null) {
			r = r.next;
			do
				t.status = "rejected", t.reason = n, $o(t), t = t.next;
			while (t !== r);
		}
		e.action = null;
	}
	function $o(e) {
		e = e.listeners;
		for (var t = 0; t < e.length; t++) (0, e[t])();
	}
	function es(e, t) {
		return t;
	}
	function ts(e, t) {
		if (B) {
			var n = K.formState;
			if (n !== null) {
				a: {
					var r = V;
					if (B) {
						if (z) {
							b: {
								for (var i = z, a = Fi; i.nodeType !== 8;) {
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
								z = cf(i.nextSibling), r = i.data === "F!";
								break a;
							}
						}
						Li(r);
					}
					r = !1;
				}
				r && (t = n[0]);
			}
		}
		return n = Ao(), n.memoizedState = n.baseState = t, r = {
			pending: null,
			lanes: 0,
			dispatch: null,
			lastRenderedReducer: es,
			lastRenderedState: t
		}, n.queue = r, n = Ns.bind(null, V, r), r.dispatch = n, r = Ko(!1), a = Fs.bind(null, V, !1, r.queue), r = Ao(), i = {
			state: t,
			dispatch: null,
			action: e,
			pending: null
		}, r.queue = i, n = Jo.bind(null, V, i, a, n), i.dispatch = n, r.memoizedState = e, [
			t,
			n,
			!1
		];
	}
	function ns(e) {
		return rs(jo(), H, e);
	}
	function rs(e, t, n) {
		if (t = Ro(e, t, es)[0], e = Lo(Io)[0], typeof t == "object" && t && typeof t.then == "function") try {
			var r = No(t);
		} catch (e) {
			throw e === xa ? Ca : e;
		}
		else r = t;
		t = jo();
		var i = t.queue, a = i.dispatch;
		return n !== t.memoizedState && (V.flags |= 2048, os(9, { destroy: void 0 }, is.bind(null, i, n), null)), [
			r,
			a,
			e
		];
	}
	function is(e, t) {
		e.action = t;
	}
	function as(e) {
		var t = jo(), n = H;
		if (n !== null) return rs(t, n, e);
		jo(), t = t.memoizedState, n = jo();
		var r = n.queue.dispatch;
		return n.memoizedState = e, [
			t,
			r,
			!1
		];
	}
	function os(e, t, n, r) {
		return e = {
			tag: e,
			create: n,
			deps: r,
			inst: t,
			next: null
		}, t = V.updateQueue, t === null && (t = Mo(), V.updateQueue = t), n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e), e;
	}
	function ss() {
		return jo().memoizedState;
	}
	function cs(e, t, n, r) {
		var i = Ao();
		V.flags |= e, i.memoizedState = os(1 | t, { destroy: void 0 }, n, r === void 0 ? null : r);
	}
	function ls(e, t, n, r) {
		var i = jo();
		r = r === void 0 ? null : r;
		var a = i.memoizedState.inst;
		H !== null && r !== null && So(r, H.memoizedState.deps) ? i.memoizedState = os(t, a, n, r) : (V.flags |= e, i.memoizedState = os(1 | t, a, n, r));
	}
	function us(e, t) {
		cs(8390656, 8, e, t);
	}
	function ds(e, t) {
		ls(2048, 8, e, t);
	}
	function fs(e) {
		V.flags |= 4;
		var t = V.updateQueue;
		if (t === null) t = Mo(), V.updateQueue = t, t.events = [e];
		else {
			var n = t.events;
			n === null ? t.events = [e] : n.push(e);
		}
	}
	function ps(e) {
		var t = jo().memoizedState;
		return fs({
			ref: t,
			nextImpl: e
		}), function() {
			if (G & 2) throw Error(s(440));
			return t.impl.apply(void 0, arguments);
		};
	}
	function ms(e, t) {
		return ls(4, 2, e, t);
	}
	function hs(e, t) {
		return ls(4, 4, e, t);
	}
	function gs(e, t) {
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
	function _s(e, t, n) {
		n = n == null ? null : n.concat([e]), ls(4, 4, gs.bind(null, t, e), n);
	}
	function vs() {}
	function ys(e, t) {
		var n = jo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		return t !== null && So(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
	}
	function bs(e, t) {
		var n = jo();
		t = t === void 0 ? null : t;
		var r = n.memoizedState;
		if (t !== null && So(t, r[1])) return r[0];
		if (r = e(), go) {
			Le(!0);
			try {
				e();
			} finally {
				Le(!1);
			}
		}
		return n.memoizedState = [r, t], r;
	}
	function xs(e, t, n) {
		return n === void 0 || fo & 1073741824 && !(J & 261930) ? e.memoizedState = t : (e.memoizedState = n, e = mu(), V.lanes |= e, Gl |= e, n);
	}
	function Ss(e, t, n, r) {
		return Sr(n, t) ? n : Za.current === null ? !(fo & 42) || fo & 1073741824 && !(J & 261930) ? (ic = !0, e.memoizedState = n) : (e = mu(), V.lanes |= e, Gl |= e, t) : (e = xs(e, n, r), Sr(e, t) || (ic = !0), e);
	}
	function Cs(e, t, n, r, i) {
		var a = M.p;
		M.p = a !== 0 && 8 > a ? a : 8;
		var o = j.T, s = {};
		j.T = s, Fs(e, !1, t, n);
		try {
			var c = i(), l = j.S;
			l !== null && l(s, c), typeof c == "object" && c && typeof c.then == "function" ? Ps(e, t, ha(c, r), pu(e)) : Ps(e, t, r, pu(e));
		} catch (n) {
			Ps(e, t, {
				then: function() {},
				status: "rejected",
				reason: n
			}, pu());
		} finally {
			M.p = a, o !== null && s.types !== null && (o.types = s.types), j.T = o;
		}
	}
	function ws() {}
	function Ts(e, t, n, r) {
		if (e.tag !== 5) throw Error(s(476));
		var i = Es(e).queue;
		Cs(e, i, t, N, n === null ? ws : function() {
			return Ds(e), n(r);
		});
	}
	function Es(e) {
		var t = e.memoizedState;
		if (t !== null) return t;
		t = {
			memoizedState: N,
			baseState: N,
			baseQueue: null,
			queue: {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: Io,
				lastRenderedState: N
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
				lastRenderedReducer: Io,
				lastRenderedState: n
			},
			next: null
		}, e.memoizedState = t, e = e.alternate, e !== null && (e.memoizedState = t), t;
	}
	function Ds(e) {
		var t = Es(e);
		t.next === null && (t = e.alternate.memoizedState), Ps(e, t.next.queue, {}, pu());
	}
	function Os() {
		return ea(Qf);
	}
	function ks() {
		return jo().memoizedState;
	}
	function As() {
		return jo().memoizedState;
	}
	function js(e) {
		for (var t = e.return; t !== null;) {
			switch (t.tag) {
				case 24:
				case 3:
					var n = pu();
					e = Ha(n);
					var r = Ua(t, e, n);
					r !== null && (hu(r, t, n), Wa(r, t, n)), t = { cache: sa() }, e.payload = t;
					return;
			}
			t = t.return;
		}
	}
	function Ms(e, t, n) {
		var r = pu();
		n = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, Is(e) ? Ls(t, n) : (n = ni(e, t, n, r), n !== null && (hu(n, e, r), Rs(n, t, r)));
	}
	function Ns(e, t, n) {
		Ps(e, t, n, pu());
	}
	function Ps(e, t, n, r) {
		var i = {
			lane: r,
			revertLane: 0,
			gesture: null,
			action: n,
			hasEagerState: !1,
			eagerState: null,
			next: null
		};
		if (Is(e)) Ls(t, i);
		else {
			var a = e.alternate;
			if (e.lanes === 0 && (a === null || a.lanes === 0) && (a = t.lastRenderedReducer, a !== null)) try {
				var o = t.lastRenderedState, s = a(o, n);
				if (i.hasEagerState = !0, i.eagerState = s, Sr(s, o)) return ti(e, t, i, 0), K === null && ei(), !1;
			} catch {}
			if (n = ni(e, t, i, r), n !== null) return hu(n, e, r), Rs(n, t, r), !0;
		}
		return !1;
	}
	function Fs(e, t, n, r) {
		if (r = {
			lane: 2,
			revertLane: dd(),
			gesture: null,
			action: r,
			hasEagerState: !1,
			eagerState: null,
			next: null
		}, Is(e)) {
			if (t) throw Error(s(479));
		} else t = ni(e, n, r, 2), t !== null && hu(t, e, 2);
	}
	function Is(e) {
		var t = e.alternate;
		return e === V || t !== null && t === V;
	}
	function Ls(e, t) {
		ho = mo = !0;
		var n = e.pending;
		n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
	}
	function Rs(e, t, n) {
		if (n & 4194048) {
			var r = t.lanes;
			r &= e.pendingLanes, n |= r, t.lanes = n, et(e, n);
		}
	}
	var zs = {
		readContext: ea,
		use: Po,
		useCallback: xo,
		useContext: xo,
		useEffect: xo,
		useImperativeHandle: xo,
		useLayoutEffect: xo,
		useInsertionEffect: xo,
		useMemo: xo,
		useReducer: xo,
		useRef: xo,
		useState: xo,
		useDebugValue: xo,
		useDeferredValue: xo,
		useTransition: xo,
		useSyncExternalStore: xo,
		useId: xo,
		useHostTransitionStatus: xo,
		useFormState: xo,
		useActionState: xo,
		useOptimistic: xo,
		useMemoCache: xo,
		useCacheRefresh: xo
	};
	zs.useEffectEvent = xo;
	var Bs = {
		readContext: ea,
		use: Po,
		useCallback: function(e, t) {
			return Ao().memoizedState = [e, t === void 0 ? null : t], e;
		},
		useContext: ea,
		useEffect: us,
		useImperativeHandle: function(e, t, n) {
			n = n == null ? null : n.concat([e]), cs(4194308, 4, gs.bind(null, t, e), n);
		},
		useLayoutEffect: function(e, t) {
			return cs(4194308, 4, e, t);
		},
		useInsertionEffect: function(e, t) {
			cs(4, 2, e, t);
		},
		useMemo: function(e, t) {
			var n = Ao();
			t = t === void 0 ? null : t;
			var r = e();
			if (go) {
				Le(!0);
				try {
					e();
				} finally {
					Le(!1);
				}
			}
			return n.memoizedState = [r, t], r;
		},
		useReducer: function(e, t, n) {
			var r = Ao();
			if (n !== void 0) {
				var i = n(t);
				if (go) {
					Le(!0);
					try {
						n(t);
					} finally {
						Le(!1);
					}
				}
			} else i = t;
			return r.memoizedState = r.baseState = i, e = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: e,
				lastRenderedState: i
			}, r.queue = e, e = e.dispatch = Ms.bind(null, V, e), [r.memoizedState, e];
		},
		useRef: function(e) {
			var t = Ao();
			return e = { current: e }, t.memoizedState = e;
		},
		useState: function(e) {
			e = Ko(e);
			var t = e.queue, n = Ns.bind(null, V, t);
			return t.dispatch = n, [e.memoizedState, n];
		},
		useDebugValue: vs,
		useDeferredValue: function(e, t) {
			return xs(Ao(), e, t);
		},
		useTransition: function() {
			var e = Ko(!1);
			return e = Cs.bind(null, V, e.queue, !0, !1), Ao().memoizedState = e, [!1, e];
		},
		useSyncExternalStore: function(e, t, n) {
			var r = V, i = Ao();
			if (B) {
				if (n === void 0) throw Error(s(407));
				n = n();
			} else {
				if (n = t(), K === null) throw Error(s(349));
				J & 127 || Vo(r, t, n);
			}
			i.memoizedState = n;
			var a = {
				value: n,
				getSnapshot: t
			};
			return i.queue = a, us(Uo.bind(null, r, a, e), [e]), r.flags |= 2048, os(9, { destroy: void 0 }, Ho.bind(null, r, a, n, t), null), n;
		},
		useId: function() {
			var e = Ao(), t = K.identifierPrefix;
			if (B) {
				var n = Di, r = Ei;
				n = (r & ~(1 << 32 - Re(r) - 1)).toString(32) + n, t = "_" + t + "R_" + n, n = _o++, 0 < n && (t += "H" + n.toString(32)), t += "_";
			} else n = bo++, t = "_" + t + "r_" + n.toString(32) + "_";
			return e.memoizedState = t;
		},
		useHostTransitionStatus: Os,
		useFormState: ts,
		useActionState: ts,
		useOptimistic: function(e) {
			var t = Ao();
			t.memoizedState = t.baseState = e;
			var n = {
				pending: null,
				lanes: 0,
				dispatch: null,
				lastRenderedReducer: null,
				lastRenderedState: null
			};
			return t.queue = n, t = Fs.bind(null, V, !0, n), n.dispatch = t, [e, t];
		},
		useMemoCache: Fo,
		useCacheRefresh: function() {
			return Ao().memoizedState = js.bind(null, V);
		},
		useEffectEvent: function(e) {
			var t = Ao(), n = { impl: e };
			return t.memoizedState = n, function() {
				if (G & 2) throw Error(s(440));
				return n.impl.apply(void 0, arguments);
			};
		}
	}, Vs = {
		readContext: ea,
		use: Po,
		useCallback: ys,
		useContext: ea,
		useEffect: ds,
		useImperativeHandle: _s,
		useInsertionEffect: ms,
		useLayoutEffect: hs,
		useMemo: bs,
		useReducer: Lo,
		useRef: ss,
		useState: function() {
			return Lo(Io);
		},
		useDebugValue: vs,
		useDeferredValue: function(e, t) {
			return Ss(jo(), H.memoizedState, e, t);
		},
		useTransition: function() {
			var e = Lo(Io)[0], t = jo().memoizedState;
			return [typeof e == "boolean" ? e : No(e), t];
		},
		useSyncExternalStore: Bo,
		useId: ks,
		useHostTransitionStatus: Os,
		useFormState: ns,
		useActionState: ns,
		useOptimistic: function(e, t) {
			return qo(jo(), H, e, t);
		},
		useMemoCache: Fo,
		useCacheRefresh: As
	};
	Vs.useEffectEvent = ps;
	var Hs = {
		readContext: ea,
		use: Po,
		useCallback: ys,
		useContext: ea,
		useEffect: ds,
		useImperativeHandle: _s,
		useInsertionEffect: ms,
		useLayoutEffect: hs,
		useMemo: bs,
		useReducer: zo,
		useRef: ss,
		useState: function() {
			return zo(Io);
		},
		useDebugValue: vs,
		useDeferredValue: function(e, t) {
			var n = jo();
			return H === null ? xs(n, e, t) : Ss(n, H.memoizedState, e, t);
		},
		useTransition: function() {
			var e = zo(Io)[0], t = jo().memoizedState;
			return [typeof e == "boolean" ? e : No(e), t];
		},
		useSyncExternalStore: Bo,
		useId: ks,
		useHostTransitionStatus: Os,
		useFormState: as,
		useActionState: as,
		useOptimistic: function(e, t) {
			var n = jo();
			return H === null ? (n.baseState = e, [e, n.queue.dispatch]) : qo(n, H, e, t);
		},
		useMemoCache: Fo,
		useCacheRefresh: As
	};
	Hs.useEffectEvent = ps;
	function Us(e, t, n, r) {
		t = e.memoizedState, n = n(r, t), n = n == null ? t : h({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
	}
	var Ws = {
		enqueueSetState: function(e, t, n) {
			e = e._reactInternals;
			var r = pu(), i = Ha(r);
			i.payload = t, n != null && (i.callback = n), t = Ua(e, i, r), t !== null && (hu(t, e, r), Wa(t, e, r));
		},
		enqueueReplaceState: function(e, t, n) {
			e = e._reactInternals;
			var r = pu(), i = Ha(r);
			i.tag = 1, i.payload = t, n != null && (i.callback = n), t = Ua(e, i, r), t !== null && (hu(t, e, r), Wa(t, e, r));
		},
		enqueueForceUpdate: function(e, t) {
			e = e._reactInternals;
			var n = pu(), r = Ha(n);
			r.tag = 2, t != null && (r.callback = t), t = Ua(e, r, n), t !== null && (hu(t, e, n), Wa(t, e, n));
		}
	};
	function Gs(e, t, n, r, i, a, o) {
		return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, a, o) : t.prototype && t.prototype.isPureReactComponent ? !Cr(n, r) || !Cr(i, a) : !0;
	}
	function Ks(e, t, n, r) {
		e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Ws.enqueueReplaceState(t, t.state, null);
	}
	function qs(e, t) {
		var n = t;
		if ("ref" in t) for (var r in n = {}, t) r !== "ref" && (n[r] = t[r]);
		if (e = e.defaultProps) for (var i in n === t && (n = h({}, n)), e) n[i] === void 0 && (n[i] = e[i]);
		return n;
	}
	function Js(e) {
		Xr(e);
	}
	function Ys(e) {
		console.error(e);
	}
	function Xs(e) {
		Xr(e);
	}
	function Zs(e, t) {
		try {
			var n = e.onUncaughtError;
			n(t.value, { componentStack: t.stack });
		} catch (e) {
			setTimeout(function() {
				throw e;
			});
		}
	}
	function Qs(e, t, n) {
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
	function $s(e, t, n) {
		return n = Ha(n), n.tag = 3, n.payload = { element: null }, n.callback = function() {
			Zs(e, t);
		}, n;
	}
	function ec(e) {
		return e = Ha(e), e.tag = 3, e;
	}
	function tc(e, t, n, r) {
		var i = n.type.getDerivedStateFromError;
		if (typeof i == "function") {
			var a = r.value;
			e.payload = function() {
				return i(a);
			}, e.callback = function() {
				Qs(t, n, r);
			};
		}
		var o = n.stateNode;
		o !== null && typeof o.componentDidCatch == "function" && (e.callback = function() {
			Qs(t, n, r), typeof i != "function" && (ru === null ? ru = new Set([this]) : ru.add(this));
			var e = r.stack;
			this.componentDidCatch(r.value, { componentStack: e === null ? "" : e });
		});
	}
	function nc(e, t, n, r, i) {
		if (n.flags |= 32768, typeof r == "object" && r && typeof r.then == "function") {
			if (t = n.alternate, t !== null && Zi(t, n, i, !0), n = no.current, n !== null) {
				switch (n.tag) {
					case 31:
					case 13: return ro === null ? Du() : n.alternate === null && X === 0 && (X = 3), n.flags &= -257, n.flags |= 65536, n.lanes = i, r === wa ? n.flags |= 16384 : (t = n.updateQueue, t === null ? n.updateQueue = new Set([r]) : t.add(r), Gu(e, r, i)), !1;
					case 22: return n.flags |= 65536, r === wa ? n.flags |= 16384 : (t = n.updateQueue, t === null ? (t = {
						transitions: null,
						markerInstances: null,
						retryQueue: new Set([r])
					}, n.updateQueue = t) : (n = t.retryQueue, n === null ? t.retryQueue = new Set([r]) : n.add(r)), Gu(e, r, i)), !1;
				}
				throw Error(s(435, n.tag));
			}
			return Gu(e, r, i), Du(), !1;
		}
		if (B) return t = no.current, t === null ? (r !== Ii && (t = Error(s(423), { cause: r }), Ui(vi(t, n))), e = e.current.alternate, e.flags |= 65536, i &= -i, e.lanes |= i, r = vi(r, n), i = $s(e.stateNode, r, i), Ga(e, i), X !== 4 && (X = 2)) : (!(t.flags & 65536) && (t.flags |= 256), t.flags |= 65536, t.lanes = i, r !== Ii && (e = Error(s(422), { cause: r }), Ui(vi(e, n)))), !1;
		var a = Error(s(520), { cause: r });
		if (a = vi(a, n), Xl === null ? Xl = [a] : Xl.push(a), X !== 4 && (X = 2), t === null) return !0;
		r = vi(r, n), n = t;
		do {
			switch (n.tag) {
				case 3: return n.flags |= 65536, e = i & -i, n.lanes |= e, e = $s(n.stateNode, r, e), Ga(n, e), !1;
				case 1: if (t = n.type, a = n.stateNode, !(n.flags & 128) && (typeof t.getDerivedStateFromError == "function" || a !== null && typeof a.componentDidCatch == "function" && (ru === null || !ru.has(a)))) return n.flags |= 65536, i &= -i, n.lanes |= i, i = ec(i), tc(i, e, n, r), Ga(n, i), !1;
			}
			n = n.return;
		} while (n !== null);
		return !1;
	}
	var rc = Error(s(461)), ic = !1;
	function ac(e, t, n, r) {
		t.child = e === null ? Ra(t, null, n, r) : La(t, e.child, n, r);
	}
	function oc(e, t, n, r, i) {
		n = n.render;
		var a = t.ref;
		if ("ref" in r) {
			var o = {};
			for (var s in r) s !== "ref" && (o[s] = r[s]);
		} else o = r;
		return $i(t), r = Co(e, t, n, o, a, i), s = Do(), e !== null && !ic ? (Oo(e, t, i), Ac(e, t, i)) : (B && s && Ai(t), t.flags |= 1, ac(e, t, r, i), t.child);
	}
	function sc(e, t, n, r, i) {
		if (e === null) {
			var a = n.type;
			return typeof a == "function" && !li(a) && a.defaultProps === void 0 && n.compare === null ? (t.tag = 15, t.type = a, cc(e, t, a, r, i)) : (e = fi(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
		}
		if (a = e.child, !jc(e, i)) {
			var o = a.memoizedProps;
			if (n = n.compare, n = n === null ? Cr : n, n(o, r) && e.ref === t.ref) return Ac(e, t, i);
		}
		return t.flags |= 1, e = ui(a, r), e.ref = t.ref, e.return = t, t.child = e;
	}
	function cc(e, t, n, r, i) {
		if (e !== null) {
			var a = e.memoizedProps;
			if (Cr(a, r) && e.ref === t.ref) if (ic = !1, t.pendingProps = r = a, jc(e, i)) e.flags & 131072 && (ic = !0);
			else return t.lanes = e.lanes, Ac(e, t, i);
		}
		return gc(e, t, n, r, i);
	}
	function lc(e, t, n, r) {
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
				return dc(e, t, a, n, r);
			}
			if (n & 536870912) t.memoizedState = {
				baseLanes: 0,
				cachePool: null
			}, e !== null && ya(t, a === null ? null : a.cachePool), a === null ? eo() : $a(t, a), oo(t);
			else return r = t.lanes = 536870912, dc(e, t, a === null ? n : a.baseLanes | n, n, r);
		} else a === null ? (e !== null && ya(t, null), eo(), so(t)) : (ya(t, a.cachePool), $a(t, a), so(t), t.memoizedState = null);
		return ac(e, t, i, n), t.child;
	}
	function uc(e, t) {
		return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
			_visibility: 1,
			_pendingMarkers: null,
			_retryCache: null,
			_transitions: null
		}), t.sibling;
	}
	function dc(e, t, n, r, i) {
		var a = va();
		return a = a === null ? null : {
			parent: oa._currentValue,
			pool: a
		}, t.memoizedState = {
			baseLanes: n,
			cachePool: a
		}, e !== null && ya(t, null), eo(), oo(t), e !== null && Zi(e, t, r, !0), t.childLanes = i, null;
	}
	function fc(e, t) {
		return t = Tc({
			mode: t.mode,
			children: t.children
		}, e.mode), t.ref = e.ref, e.child = t, t.return = e, t;
	}
	function pc(e, t, n) {
		return La(t, e.child, null, n), e = fc(t, t.pendingProps), e.flags |= 2, co(t), t.memoizedState = null, e;
	}
	function mc(e, t, n) {
		var r = t.pendingProps, i = (t.flags & 128) != 0;
		if (t.flags &= -129, e === null) {
			if (B) {
				if (r.mode === "hidden") return e = fc(t, r), t.lanes = 536870912, uc(null, e);
				if (ao(t), (e = z) ? (e = rf(e, Fi), e = e !== null && e.data === "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ti === null ? null : {
						id: Ei,
						overflow: Di
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = hi(e), n.return = t, t.child = n, Ni = t, z = null)) : e = null, e === null) throw Li(t);
				return t.lanes = 536870912, null;
			}
			return fc(t, r);
		}
		var a = e.memoizedState;
		if (a !== null) {
			var o = a.dehydrated;
			if (ao(t), i) if (t.flags & 256) t.flags &= -257, t = pc(e, t, n);
			else if (t.memoizedState !== null) t.child = e.child, t.flags |= 128, t = null;
			else throw Error(s(558));
			else if (ic || Zi(e, t, n, !1), i = (n & e.childLanes) !== 0, ic || i) {
				if (r = K, r !== null && (o = tt(r, n), o !== 0 && o !== a.retryLane)) throw a.retryLane = o, ri(e, o), hu(r, e, o), rc;
				Du(), t = pc(e, t, n);
			} else e = a.treeContext, z = cf(o.nextSibling), Ni = t, B = !0, Pi = null, Fi = !1, e !== null && Mi(t, e), t = fc(t, r), t.flags |= 4096;
			return t;
		}
		return e = ui(e.child, {
			mode: r.mode,
			children: r.children
		}), e.ref = t.ref, t.child = e, e.return = t, e;
	}
	function hc(e, t) {
		var n = t.ref;
		if (n === null) e !== null && e.ref !== null && (t.flags |= 4194816);
		else {
			if (typeof n != "function" && typeof n != "object") throw Error(s(284));
			(e === null || e.ref !== n) && (t.flags |= 4194816);
		}
	}
	function gc(e, t, n, r, i) {
		return $i(t), n = Co(e, t, n, r, void 0, i), r = Do(), e !== null && !ic ? (Oo(e, t, i), Ac(e, t, i)) : (B && r && Ai(t), t.flags |= 1, ac(e, t, n, i), t.child);
	}
	function _c(e, t, n, r, i, a) {
		return $i(t), t.updateQueue = null, n = To(t, r, n, i), wo(e), r = Do(), e !== null && !ic ? (Oo(e, t, a), Ac(e, t, a)) : (B && r && Ai(t), t.flags |= 1, ac(e, t, n, a), t.child);
	}
	function vc(e, t, n, r, i) {
		if ($i(t), t.stateNode === null) {
			var a = oi, o = n.contextType;
			typeof o == "object" && o && (a = ea(o)), a = new n(r, a), t.memoizedState = a.state !== null && a.state !== void 0 ? a.state : null, a.updater = Ws, t.stateNode = a, a._reactInternals = t, a = t.stateNode, a.props = r, a.state = t.memoizedState, a.refs = {}, Ba(t), o = n.contextType, a.context = typeof o == "object" && o ? ea(o) : oi, a.state = t.memoizedState, o = n.getDerivedStateFromProps, typeof o == "function" && (Us(t, n, o, r), a.state = t.memoizedState), typeof n.getDerivedStateFromProps == "function" || typeof a.getSnapshotBeforeUpdate == "function" || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (o = a.state, typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount(), o !== a.state && Ws.enqueueReplaceState(a, a.state, null), Ja(t, r, a, i), qa(), a.state = t.memoizedState), typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !0;
		} else if (e === null) {
			a = t.stateNode;
			var s = t.memoizedProps, c = qs(n, s);
			a.props = c;
			var l = a.context, u = n.contextType;
			o = oi, typeof u == "object" && u && (o = ea(u));
			var d = n.getDerivedStateFromProps;
			u = typeof d == "function" || typeof a.getSnapshotBeforeUpdate == "function", s = t.pendingProps !== s, u || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (s || l !== o) && Ks(t, a, r, o), za = !1;
			var f = t.memoizedState;
			a.state = f, Ja(t, r, a, i), qa(), l = t.memoizedState, s || f !== l || za ? (typeof d == "function" && (Us(t, n, d, r), l = t.memoizedState), (c = za || Gs(t, n, c, r, f, l, o)) ? (u || typeof a.UNSAFE_componentWillMount != "function" && typeof a.componentWillMount != "function" || (typeof a.componentWillMount == "function" && a.componentWillMount(), typeof a.UNSAFE_componentWillMount == "function" && a.UNSAFE_componentWillMount()), typeof a.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = l), a.props = r, a.state = l, a.context = o, r = c) : (typeof a.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
		} else {
			a = t.stateNode, Va(e, t), o = t.memoizedProps, u = qs(n, o), a.props = u, d = t.pendingProps, f = a.context, l = n.contextType, c = oi, typeof l == "object" && l && (c = ea(l)), s = n.getDerivedStateFromProps, (l = typeof s == "function" || typeof a.getSnapshotBeforeUpdate == "function") || typeof a.UNSAFE_componentWillReceiveProps != "function" && typeof a.componentWillReceiveProps != "function" || (o !== d || f !== c) && Ks(t, a, r, c), za = !1, f = t.memoizedState, a.state = f, Ja(t, r, a, i), qa();
			var p = t.memoizedState;
			o !== d || f !== p || za || e !== null && e.dependencies !== null && Qi(e.dependencies) ? (typeof s == "function" && (Us(t, n, s, r), p = t.memoizedState), (u = za || Gs(t, n, u, r, f, p, c) || e !== null && e.dependencies !== null && Qi(e.dependencies)) ? (l || typeof a.UNSAFE_componentWillUpdate != "function" && typeof a.componentWillUpdate != "function" || (typeof a.componentWillUpdate == "function" && a.componentWillUpdate(r, p, c), typeof a.UNSAFE_componentWillUpdate == "function" && a.UNSAFE_componentWillUpdate(r, p, c)), typeof a.componentDidUpdate == "function" && (t.flags |= 4), typeof a.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = p), a.props = r, a.state = p, a.context = c, r = u) : (typeof a.componentDidUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 4), typeof a.getSnapshotBeforeUpdate != "function" || o === e.memoizedProps && f === e.memoizedState || (t.flags |= 1024), r = !1);
		}
		return a = r, hc(e, t), r = (t.flags & 128) != 0, a || r ? (a = t.stateNode, n = r && typeof n.getDerivedStateFromError != "function" ? null : a.render(), t.flags |= 1, e !== null && r ? (t.child = La(t, e.child, null, i), t.child = La(t, null, n, i)) : ac(e, t, n, i), t.memoizedState = a.state, e = t.child) : e = Ac(e, t, i), e;
	}
	function yc(e, t, n, r) {
		return Vi(), t.flags |= 256, ac(e, t, n, r), t.child;
	}
	var bc = {
		dehydrated: null,
		treeContext: null,
		retryLane: 0,
		hydrationErrors: null
	};
	function xc(e) {
		return {
			baseLanes: e,
			cachePool: ba()
		};
	}
	function Sc(e, t, n) {
		return e = e === null ? 0 : e.childLanes & ~n, t && (e |= Jl), e;
	}
	function Cc(e, t, n) {
		var r = t.pendingProps, i = !1, a = (t.flags & 128) != 0, o;
		if ((o = a) || (o = e !== null && e.memoizedState === null ? !1 : (lo.current & 2) != 0), o && (i = !0, t.flags &= -129), o = (t.flags & 32) != 0, t.flags &= -33, e === null) {
			if (B) {
				if (i ? io(t) : so(t), (e = z) ? (e = rf(e, Fi), e = e !== null && e.data !== "&" ? e : null, e !== null && (t.memoizedState = {
					dehydrated: e,
					treeContext: Ti === null ? null : {
						id: Ei,
						overflow: Di
					},
					retryLane: 536870912,
					hydrationErrors: null
				}, n = hi(e), n.return = t, t.child = n, Ni = t, z = null)) : e = null, e === null) throw Li(t);
				return of(e) ? t.lanes = 32 : t.lanes = 536870912, null;
			}
			var c = r.children;
			return r = r.fallback, i ? (so(t), i = t.mode, c = Tc({
				mode: "hidden",
				children: c
			}, i), r = pi(r, i, n, null), c.return = t, r.return = t, c.sibling = r, t.child = c, r = t.child, r.memoizedState = xc(n), r.childLanes = Sc(e, o, n), t.memoizedState = bc, uc(null, r)) : (io(t), wc(t, c));
		}
		var l = e.memoizedState;
		if (l !== null && (c = l.dehydrated, c !== null)) {
			if (a) t.flags & 256 ? (io(t), t.flags &= -257, t = Ec(e, t, n)) : t.memoizedState === null ? (so(t), c = r.fallback, i = t.mode, r = Tc({
				mode: "visible",
				children: r.children
			}, i), c = pi(c, i, n, null), c.flags |= 2, r.return = t, c.return = t, r.sibling = c, t.child = r, La(t, e.child, null, n), r = t.child, r.memoizedState = xc(n), r.childLanes = Sc(e, o, n), t.memoizedState = bc, t = uc(null, r)) : (so(t), t.child = e.child, t.flags |= 128, t = null);
			else if (io(t), of(c)) {
				if (o = c.nextSibling && c.nextSibling.dataset, o) var u = o.dgst;
				o = u, r = Error(s(419)), r.stack = "", r.digest = o, Ui({
					value: r,
					source: null,
					stack: null
				}), t = Ec(e, t, n);
			} else if (ic || Zi(e, t, n, !1), o = (n & e.childLanes) !== 0, ic || o) {
				if (o = K, o !== null && (r = tt(o, n), r !== 0 && r !== l.retryLane)) throw l.retryLane = r, ri(e, r), hu(o, e, r), rc;
				af(c) || Du(), t = Ec(e, t, n);
			} else af(c) ? (t.flags |= 192, t.child = e.child, t = null) : (e = l.treeContext, z = cf(c.nextSibling), Ni = t, B = !0, Pi = null, Fi = !1, e !== null && Mi(t, e), t = wc(t, r.children), t.flags |= 4096);
			return t;
		}
		return i ? (so(t), c = r.fallback, i = t.mode, l = e.child, u = l.sibling, r = ui(l, {
			mode: "hidden",
			children: r.children
		}), r.subtreeFlags = l.subtreeFlags & 65011712, u === null ? (c = pi(c, i, n, null), c.flags |= 2) : c = ui(u, c), c.return = t, r.return = t, r.sibling = c, t.child = r, uc(null, r), r = t.child, c = e.child.memoizedState, c === null ? c = xc(n) : (i = c.cachePool, i === null ? i = ba() : (l = oa._currentValue, i = i.parent === l ? i : {
			parent: l,
			pool: l
		}), c = {
			baseLanes: c.baseLanes | n,
			cachePool: i
		}), r.memoizedState = c, r.childLanes = Sc(e, o, n), t.memoizedState = bc, uc(e.child, r)) : (io(t), n = e.child, e = n.sibling, n = ui(n, {
			mode: "visible",
			children: r.children
		}), n.return = t, n.sibling = null, e !== null && (o = t.deletions, o === null ? (t.deletions = [e], t.flags |= 16) : o.push(e)), t.child = n, t.memoizedState = null, n);
	}
	function wc(e, t) {
		return t = Tc({
			mode: "visible",
			children: t
		}, e.mode), t.return = e, e.child = t;
	}
	function Tc(e, t) {
		return e = ci(22, e, null, t), e.lanes = 0, e;
	}
	function Ec(e, t, n) {
		return La(t, e.child, null, n), e = wc(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
	}
	function Dc(e, t, n) {
		e.lanes |= t;
		var r = e.alternate;
		r !== null && (r.lanes |= t), Yi(e.return, t, n);
	}
	function Oc(e, t, n, r, i, a) {
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
	function kc(e, t, n) {
		var r = t.pendingProps, i = r.revealOrder, a = r.tail;
		r = r.children;
		var o = lo.current, s = (o & 2) != 0;
		if (s ? (o = o & 1 | 2, t.flags |= 128) : o &= 1, F(lo, o), ac(e, t, r, n), r = B ? Si : 0, !s && e !== null && e.flags & 128) a: for (e = t.child; e !== null;) {
			if (e.tag === 13) e.memoizedState !== null && Dc(e, n, t);
			else if (e.tag === 19) Dc(e, n, t);
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
				for (n = t.child, i = null; n !== null;) e = n.alternate, e !== null && uo(e) === null && (i = n), n = n.sibling;
				n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), Oc(t, !1, i, n, a, r);
				break;
			case "backwards":
			case "unstable_legacy-backwards":
				for (n = null, i = t.child, t.child = null; i !== null;) {
					if (e = i.alternate, e !== null && uo(e) === null) {
						t.child = i;
						break;
					}
					e = i.sibling, i.sibling = n, n = i, i = e;
				}
				Oc(t, !0, n, null, a, r);
				break;
			case "together":
				Oc(t, !1, null, null, void 0, r);
				break;
			default: t.memoizedState = null;
		}
		return t.child;
	}
	function Ac(e, t, n) {
		if (e !== null && (t.dependencies = e.dependencies), Gl |= t.lanes, (n & t.childLanes) === 0) if (e !== null) {
			if (Zi(e, t, n, !1), (n & t.childLanes) === 0) return null;
		} else return null;
		if (e !== null && t.child !== e.child) throw Error(s(153));
		if (t.child !== null) {
			for (e = t.child, n = ui(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null;) e = e.sibling, n = n.sibling = ui(e, e.pendingProps), n.return = t;
			n.sibling = null;
		}
		return t.child;
	}
	function jc(e, t) {
		return (e.lanes & t) === 0 ? (e = e.dependencies, !!(e !== null && Qi(e))) : !0;
	}
	function Mc(e, t, n) {
		switch (t.tag) {
			case 3:
				de(t, t.stateNode.containerInfo), qi(t, oa, e.memoizedState.cache), Vi();
				break;
			case 27:
			case 5:
				pe(t);
				break;
			case 4:
				de(t, t.stateNode.containerInfo);
				break;
			case 10:
				qi(t, t.type, t.memoizedProps.value);
				break;
			case 31:
				if (t.memoizedState !== null) return t.flags |= 128, ao(t), null;
				break;
			case 13:
				var r = t.memoizedState;
				if (r !== null) return r.dehydrated === null ? (n & t.child.childLanes) === 0 ? (io(t), e = Ac(e, t, n), e === null ? null : e.sibling) : Cc(e, t, n) : (io(t), t.flags |= 128, null);
				io(t);
				break;
			case 19:
				var i = (e.flags & 128) != 0;
				if (r = (n & t.childLanes) !== 0, r ||= (Zi(e, t, n, !1), (n & t.childLanes) !== 0), i) {
					if (r) return kc(e, t, n);
					t.flags |= 128;
				}
				if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), F(lo, lo.current), r) break;
				return null;
			case 22: return t.lanes = 0, lc(e, t, n, t.pendingProps);
			case 24: qi(t, oa, e.memoizedState.cache);
		}
		return Ac(e, t, n);
	}
	function Nc(e, t, n) {
		if (e !== null) if (e.memoizedProps !== t.pendingProps) ic = !0;
		else {
			if (!jc(e, n) && !(t.flags & 128)) return ic = !1, Mc(e, t, n);
			ic = !!(e.flags & 131072);
		}
		else ic = !1, B && t.flags & 1048576 && ki(t, Si, t.index);
		switch (t.lanes = 0, t.tag) {
			case 16:
				a: {
					var r = t.pendingProps;
					if (e = Da(t.elementType), t.type = e, typeof e == "function") li(e) ? (r = qs(e, r), t.tag = 1, t = vc(null, t, e, r, n)) : (t.tag = 0, t = gc(null, t, e, r, n));
					else {
						if (e != null) {
							var i = e.$$typeof;
							if (i === w) {
								t.tag = 11, t = oc(null, t, e, r, n);
								break a;
							} else if (i === D) {
								t.tag = 14, t = sc(null, t, e, r, n);
								break a;
							}
						}
						throw t = re(e) || e, Error(s(306, t, ""));
					}
				}
				return t;
			case 0: return gc(e, t, t.type, t.pendingProps, n);
			case 1: return r = t.type, i = qs(r, t.pendingProps), vc(e, t, r, i, n);
			case 3:
				a: {
					if (de(t, t.stateNode.containerInfo), e === null) throw Error(s(387));
					r = t.pendingProps;
					var a = t.memoizedState;
					i = a.element, Va(e, t), Ja(t, r, null, n);
					var o = t.memoizedState;
					if (r = o.cache, qi(t, oa, r), r !== a.cache && Xi(t, [oa], n, !0), qa(), r = o.element, a.isDehydrated) if (a = {
						element: r,
						isDehydrated: !1,
						cache: o.cache
					}, t.updateQueue.baseState = a, t.memoizedState = a, t.flags & 256) {
						t = yc(e, t, r, n);
						break a;
					} else if (r !== i) {
						i = vi(Error(s(424)), t), Ui(i), t = yc(e, t, r, n);
						break a;
					} else {
						switch (e = t.stateNode.containerInfo, e.nodeType) {
							case 9:
								e = e.body;
								break;
							default: e = e.nodeName === "HTML" ? e.ownerDocument.body : e;
						}
						for (z = cf(e.firstChild), Ni = t, B = !0, Pi = null, Fi = !0, n = Ra(t, null, r, n), t.child = n; n;) n.flags = n.flags & -3 | 4096, n = n.sibling;
					}
					else {
						if (Vi(), r === i) {
							t = Ac(e, t, n);
							break a;
						}
						ac(e, t, r, n);
					}
					t = t.child;
				}
				return t;
			case 26: return hc(e, t), e === null ? (n = kf(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : B || (n = t.type, e = t.pendingProps, r = Bd(le.current).createElement(n), r[st] = t, r[ct] = e, Pd(r, n, e), bt(r), t.stateNode = r) : t.memoizedState = kf(t.type, e.memoizedProps, t.pendingProps, e.memoizedState), null;
			case 27: return pe(t), e === null && B && (r = t.stateNode = ff(t.type, t.pendingProps, le.current), Ni = t, Fi = !0, i = z, Zd(t.type) ? (lf = i, z = cf(r.firstChild)) : z = i), ac(e, t, t.pendingProps.children, n), hc(e, t), e === null && (t.flags |= 4194304), t.child;
			case 5: return e === null && B && ((i = r = z) && (r = tf(r, t.type, t.pendingProps, Fi), r === null ? i = !1 : (t.stateNode = r, Ni = t, z = cf(r.firstChild), Fi = !1, i = !0)), i || Li(t)), pe(t), i = t.type, a = t.pendingProps, o = e === null ? null : e.memoizedProps, r = a.children, Ud(i, a) ? r = null : o !== null && Ud(i, o) && (t.flags |= 32), t.memoizedState !== null && (i = Co(e, t, Eo, null, null, n), Qf._currentValue = i), hc(e, t), ac(e, t, r, n), t.child;
			case 6: return e === null && B && ((e = n = z) && (n = nf(n, t.pendingProps, Fi), n === null ? e = !1 : (t.stateNode = n, Ni = t, z = null, e = !0)), e || Li(t)), null;
			case 13: return Cc(e, t, n);
			case 4: return de(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = La(t, null, r, n) : ac(e, t, r, n), t.child;
			case 11: return oc(e, t, t.type, t.pendingProps, n);
			case 7: return ac(e, t, t.pendingProps, n), t.child;
			case 8: return ac(e, t, t.pendingProps.children, n), t.child;
			case 12: return ac(e, t, t.pendingProps.children, n), t.child;
			case 10: return r = t.pendingProps, qi(t, t.type, r.value), ac(e, t, r.children, n), t.child;
			case 9: return i = t.type._context, r = t.pendingProps.children, $i(t), i = ea(i), r = r(i), t.flags |= 1, ac(e, t, r, n), t.child;
			case 14: return sc(e, t, t.type, t.pendingProps, n);
			case 15: return cc(e, t, t.type, t.pendingProps, n);
			case 19: return kc(e, t, n);
			case 31: return mc(e, t, n);
			case 22: return lc(e, t, n, t.pendingProps);
			case 24: return $i(t), r = ea(oa), e === null ? (i = va(), i === null && (i = K, a = sa(), i.pooledCache = a, a.refCount++, a !== null && (i.pooledCacheLanes |= n), i = a), t.memoizedState = {
				parent: r,
				cache: i
			}, Ba(t), qi(t, oa, i)) : ((e.lanes & n) !== 0 && (Va(e, t), Ja(t, null, null, n), qa()), i = e.memoizedState, a = t.memoizedState, i.parent === r ? (r = a.cache, qi(t, oa, r), r !== i.cache && Xi(t, [oa], n, !0)) : (i = {
				parent: r,
				cache: r
			}, t.memoizedState = i, t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = i), qi(t, oa, r))), ac(e, t, t.pendingProps.children, n), t.child;
			case 29: throw t.pendingProps;
		}
		throw Error(s(156, t.tag));
	}
	function Pc(e) {
		e.flags |= 4;
	}
	function Fc(e, t, n, r, i) {
		if ((t = (e.mode & 32) != 0) && (t = !1), t) {
			if (e.flags |= 16777216, (i & 335544128) === i) if (e.stateNode.complete) e.flags |= 8192;
			else if (wu()) e.flags |= 8192;
			else throw Oa = wa, Sa;
		} else e.flags &= -16777217;
	}
	function Ic(e, t) {
		if (t.type !== "stylesheet" || t.state.loading & 4) e.flags &= -16777217;
		else if (e.flags |= 16777216, !Wf(t)) if (wu()) e.flags |= 8192;
		else throw Oa = wa, Sa;
	}
	function Lc(e, t) {
		t !== null && (e.flags |= 4), e.flags & 16384 && (t = e.tag === 22 ? 536870912 : Ye(), e.lanes |= t, Yl |= t);
	}
	function Rc(e, t) {
		if (!B) switch (e.tailMode) {
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
	function U(e) {
		var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
		if (t) for (var i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 65011712, r |= i.flags & 65011712, i.return = e, i = i.sibling;
		else for (i = e.child; i !== null;) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
		return e.subtreeFlags |= r, e.childLanes = n, t;
	}
	function zc(e, t, n) {
		var r = t.pendingProps;
		switch (ji(t), t.tag) {
			case 16:
			case 15:
			case 0:
			case 11:
			case 7:
			case 8:
			case 12:
			case 9:
			case 14: return U(t), null;
			case 1: return U(t), null;
			case 3: return n = t.stateNode, r = null, e !== null && (r = e.memoizedState.cache), t.memoizedState.cache !== r && (t.flags |= 2048), Ji(oa), fe(), n.pendingContext && (n.context = n.pendingContext, n.pendingContext = null), (e === null || e.child === null) && (Bi(t) ? Pc(t) : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Hi())), U(t), null;
			case 26:
				var i = t.type, a = t.memoizedState;
				return e === null ? (Pc(t), a === null ? (U(t), Fc(t, i, null, r, n)) : (U(t), Ic(t, a))) : a ? a === e.memoizedState ? (U(t), t.flags &= -16777217) : (Pc(t), U(t), Ic(t, a)) : (e = e.memoizedProps, e !== r && Pc(t), U(t), Fc(t, i, e, r, n)), null;
			case 27:
				if (me(t), n = le.current, i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Pc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return U(t), null;
					}
					e = I.current, Bi(t) ? Ri(t, e) : (e = ff(i, r, n), t.stateNode = e, Pc(t));
				}
				return U(t), null;
			case 5:
				if (me(t), i = t.type, e !== null && t.stateNode != null) e.memoizedProps !== r && Pc(t);
				else {
					if (!r) {
						if (t.stateNode === null) throw Error(s(166));
						return U(t), null;
					}
					if (a = I.current, Bi(t)) Ri(t, a);
					else {
						var o = Bd(le.current);
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
						a[st] = t, a[ct] = r;
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
						r && Pc(t);
					}
				}
				return U(t), Fc(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n), null;
			case 6:
				if (e && t.stateNode != null) e.memoizedProps !== r && Pc(t);
				else {
					if (typeof r != "string" && t.stateNode === null) throw Error(s(166));
					if (e = le.current, Bi(t)) {
						if (e = t.stateNode, n = t.memoizedProps, r = null, i = Ni, i !== null) switch (i.tag) {
							case 27:
							case 5: r = i.memoizedProps;
						}
						e[st] = t, e = !!(e.nodeValue === n || r !== null && !0 === r.suppressHydrationWarning || Md(e.nodeValue, n)), e || Li(t, !0);
					} else e = Bd(e).createTextNode(r), e[st] = t, t.stateNode = e;
				}
				return U(t), null;
			case 31:
				if (n = t.memoizedState, e === null || e.memoizedState !== null) {
					if (r = Bi(t), n !== null) {
						if (e === null) {
							if (!r) throw Error(s(318));
							if (e = t.memoizedState, e = e === null ? null : e.dehydrated, !e) throw Error(s(557));
							e[st] = t;
						} else Vi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						U(t), e = !1;
					} else n = Hi(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n), e = !0;
					if (!e) return t.flags & 256 ? (co(t), t) : (co(t), null);
					if (t.flags & 128) throw Error(s(558));
				}
				return U(t), null;
			case 13:
				if (r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
					if (i = Bi(t), r !== null && r.dehydrated !== null) {
						if (e === null) {
							if (!i) throw Error(s(318));
							if (i = t.memoizedState, i = i === null ? null : i.dehydrated, !i) throw Error(s(317));
							i[st] = t;
						} else Vi(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
						U(t), i = !1;
					} else i = Hi(), e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = i), i = !0;
					if (!i) return t.flags & 256 ? (co(t), t) : (co(t), null);
				}
				return co(t), t.flags & 128 ? (t.lanes = n, t) : (n = r !== null, e = e !== null && e.memoizedState !== null, n && (r = t.child, i = null, r.alternate !== null && r.alternate.memoizedState !== null && r.alternate.memoizedState.cachePool !== null && (i = r.alternate.memoizedState.cachePool.pool), a = null, r.memoizedState !== null && r.memoizedState.cachePool !== null && (a = r.memoizedState.cachePool.pool), a !== i && (r.flags |= 2048)), n !== e && n && (t.child.flags |= 8192), Lc(t, t.updateQueue), U(t), null);
			case 4: return fe(), e === null && Sd(t.stateNode.containerInfo), U(t), null;
			case 10: return Ji(t.type), U(t), null;
			case 19:
				if (P(lo), r = t.memoizedState, r === null) return U(t), null;
				if (i = (t.flags & 128) != 0, a = r.rendering, a === null) if (i) Rc(r, !1);
				else {
					if (X !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null;) {
						if (a = uo(e), a !== null) {
							for (t.flags |= 128, Rc(r, !1), e = a.updateQueue, t.updateQueue = e, Lc(t, e), t.subtreeFlags = 0, e = n, n = t.child; n !== null;) di(n, e), n = n.sibling;
							return F(lo, lo.current & 1 | 2), B && Oi(t, r.treeForkCount), t.child;
						}
						e = e.sibling;
					}
					r.tail !== null && Ee() > tu && (t.flags |= 128, i = !0, Rc(r, !1), t.lanes = 4194304);
				}
				else {
					if (!i) if (e = uo(a), e !== null) {
						if (t.flags |= 128, i = !0, e = e.updateQueue, t.updateQueue = e, Lc(t, e), Rc(r, !0), r.tail === null && r.tailMode === "hidden" && !a.alternate && !B) return U(t), null;
					} else 2 * Ee() - r.renderingStartTime > tu && n !== 536870912 && (t.flags |= 128, i = !0, Rc(r, !1), t.lanes = 4194304);
					r.isBackwards ? (a.sibling = t.child, t.child = a) : (e = r.last, e === null ? t.child = a : e.sibling = a, r.last = a);
				}
				return r.tail === null ? (U(t), null) : (e = r.tail, r.rendering = e, r.tail = e.sibling, r.renderingStartTime = Ee(), e.sibling = null, n = lo.current, F(lo, i ? n & 1 | 2 : n & 1), B && Oi(t, r.treeForkCount), e);
			case 22:
			case 23: return co(t), to(), r = t.memoizedState !== null, e === null ? r && (t.flags |= 8192) : e.memoizedState !== null !== r && (t.flags |= 8192), r ? n & 536870912 && !(t.flags & 128) && (U(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : U(t), n = t.updateQueue, n !== null && Lc(t, n.retryQueue), n = null, e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), r = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (r = t.memoizedState.cachePool.pool), r !== n && (t.flags |= 2048), e !== null && P(_a), null;
			case 24: return n = null, e !== null && (n = e.memoizedState.cache), t.memoizedState.cache !== n && (t.flags |= 2048), Ji(oa), U(t), null;
			case 25: return null;
			case 30: return null;
		}
		throw Error(s(156, t.tag));
	}
	function Bc(e, t) {
		switch (ji(t), t.tag) {
			case 1: return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 3: return Ji(oa), fe(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
			case 26:
			case 27:
			case 5: return me(t), null;
			case 31:
				if (t.memoizedState !== null) {
					if (co(t), t.alternate === null) throw Error(s(340));
					Vi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 13:
				if (co(t), e = t.memoizedState, e !== null && e.dehydrated !== null) {
					if (t.alternate === null) throw Error(s(340));
					Vi();
				}
				return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 19: return P(lo), null;
			case 4: return fe(), null;
			case 10: return Ji(t.type), null;
			case 22:
			case 23: return co(t), to(), e !== null && P(_a), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
			case 24: return Ji(oa), null;
			case 25: return null;
			default: return null;
		}
	}
	function Vc(e, t) {
		switch (ji(t), t.tag) {
			case 3:
				Ji(oa), fe();
				break;
			case 26:
			case 27:
			case 5:
				me(t);
				break;
			case 4:
				fe();
				break;
			case 31:
				t.memoizedState !== null && co(t);
				break;
			case 13:
				co(t);
				break;
			case 19:
				P(lo);
				break;
			case 10:
				Ji(t.type);
				break;
			case 22:
			case 23:
				co(t), to(), e !== null && P(_a);
				break;
			case 24: Ji(oa);
		}
	}
	function Hc(e, t) {
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
			Z(t, t.return, e);
		}
	}
	function Uc(e, t, n) {
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
								Z(i, c, e);
							}
						}
					}
					r = r.next;
				} while (r !== a);
			}
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function Wc(e) {
		var t = e.updateQueue;
		if (t !== null) {
			var n = e.stateNode;
			try {
				Xa(t, n);
			} catch (t) {
				Z(e, e.return, t);
			}
		}
	}
	function Gc(e, t, n) {
		n.props = qs(e.type, e.memoizedProps), n.state = e.memoizedState;
		try {
			n.componentWillUnmount();
		} catch (n) {
			Z(e, t, n);
		}
	}
	function Kc(e, t) {
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
			Z(e, t, n);
		}
	}
	function qc(e, t) {
		var n = e.ref, r = e.refCleanup;
		if (n !== null) if (typeof r == "function") try {
			r();
		} catch (n) {
			Z(e, t, n);
		} finally {
			e.refCleanup = null, e = e.alternate, e != null && (e.refCleanup = null);
		}
		else if (typeof n == "function") try {
			n(null);
		} catch (n) {
			Z(e, t, n);
		}
		else n.current = null;
	}
	function Jc(e) {
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
			Z(e, e.return, t);
		}
	}
	function Yc(e, t, n) {
		try {
			var r = e.stateNode;
			Fd(r, e.type, n, t), r[ct] = t;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	function Xc(e) {
		return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Zd(e.type) || e.tag === 4;
	}
	function Zc(e) {
		a: for (;;) {
			for (; e.sibling === null;) {
				if (e.return === null || Xc(e.return)) return null;
				e = e.return;
			}
			for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18;) {
				if (e.tag === 27 && Zd(e.type) || e.flags & 2 || e.child === null || e.tag === 4) continue a;
				e.child.return = e, e = e.child;
			}
			if (!(e.flags & 2)) return e.stateNode;
		}
	}
	function Qc(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n, t.appendChild(e), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = $t));
		else if (r !== 4 && (r === 27 && Zd(e.type) && (n = e.stateNode, t = null), e = e.child, e !== null)) for (Qc(e, t, n), e = e.sibling; e !== null;) Qc(e, t, n), e = e.sibling;
	}
	function $c(e, t, n) {
		var r = e.tag;
		if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
		else if (r !== 4 && (r === 27 && Zd(e.type) && (n = e.stateNode), e = e.child, e !== null)) for ($c(e, t, n), e = e.sibling; e !== null;) $c(e, t, n), e = e.sibling;
	}
	function el(e) {
		var t = e.stateNode, n = e.memoizedProps;
		try {
			for (var r = e.type, i = t.attributes; i.length;) t.removeAttributeNode(i[0]);
			Pd(t, r, n), t[st] = e, t[ct] = n;
		} catch (t) {
			Z(e, e.return, t);
		}
	}
	var tl = !1, nl = !1, rl = !1, il = typeof WeakSet == "function" ? WeakSet : Set, al = null;
	function ol(e, t) {
		if (e = e.containerInfo, Rd = sp, e = Dr(e), Or(e)) {
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
		}, sp = !1, al = t; al !== null;) if (t = al, e = t.child, t.subtreeFlags & 1028 && e !== null) e.return = t, al = e;
		else for (; al !== null;) {
			switch (t = al, a = t.alternate, e = t.flags, t.tag) {
				case 0:
					if (e & 4 && (e = t.updateQueue, e = e === null ? null : e.events, e !== null)) for (n = 0; n < e.length; n++) i = e[n], i.ref.impl = i.nextImpl;
					break;
				case 11:
				case 15: break;
				case 1:
					if (e & 1024 && a !== null) {
						e = void 0, n = t, i = a.memoizedProps, a = a.memoizedState, r = n.stateNode;
						try {
							var h = qs(n.type, i);
							e = r.getSnapshotBeforeUpdate(h, a), r.__reactInternalSnapshotBeforeUpdate = e;
						} catch (e) {
							Z(n, n.return, e);
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
				e.return = t.return, al = e;
				break;
			}
			al = t.return;
		}
	}
	function sl(e, t, n) {
		var r = n.flags;
		switch (n.tag) {
			case 0:
			case 11:
			case 15:
				xl(e, n), r & 4 && Hc(5, n);
				break;
			case 1:
				if (xl(e, n), r & 4) if (e = n.stateNode, t === null) try {
					e.componentDidMount();
				} catch (e) {
					Z(n, n.return, e);
				}
				else {
					var i = qs(n.type, t.memoizedProps);
					t = t.memoizedState;
					try {
						e.componentDidUpdate(i, t, e.__reactInternalSnapshotBeforeUpdate);
					} catch (e) {
						Z(n, n.return, e);
					}
				}
				r & 64 && Wc(n), r & 512 && Kc(n, n.return);
				break;
			case 3:
				if (xl(e, n), r & 64 && (e = n.updateQueue, e !== null)) {
					if (t = null, n.child !== null) switch (n.child.tag) {
						case 27:
						case 5:
							t = n.child.stateNode;
							break;
						case 1: t = n.child.stateNode;
					}
					try {
						Xa(e, t);
					} catch (e) {
						Z(n, n.return, e);
					}
				}
				break;
			case 27: t === null && r & 4 && el(n);
			case 26:
			case 5:
				xl(e, n), t === null && r & 4 && Jc(n), r & 512 && Kc(n, n.return);
				break;
			case 12:
				xl(e, n);
				break;
			case 31:
				xl(e, n), r & 4 && fl(e, n);
				break;
			case 13:
				xl(e, n), r & 4 && pl(e, n), r & 64 && (e = n.memoizedState, e !== null && (e = e.dehydrated, e !== null && (n = Ju.bind(null, n), sf(e, n))));
				break;
			case 22:
				if (r = n.memoizedState !== null || tl, !r) {
					t = t !== null && t.memoizedState !== null || nl, i = tl;
					var a = nl;
					tl = r, (nl = t) && !a ? Cl(e, n, (n.subtreeFlags & 8772) != 0) : xl(e, n), tl = i, nl = a;
				}
				break;
			case 30: break;
			default: xl(e, n);
		}
	}
	function cl(e) {
		var t = e.alternate;
		t !== null && (e.alternate = null, cl(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && ht(t)), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
	}
	var W = null, ll = !1;
	function ul(e, t, n) {
		for (n = n.child; n !== null;) dl(e, t, n), n = n.sibling;
	}
	function dl(e, t, n) {
		if (Ie && typeof Ie.onCommitFiberUnmount == "function") try {
			Ie.onCommitFiberUnmount(Fe, n);
		} catch {}
		switch (n.tag) {
			case 26:
				nl || qc(n, t), ul(e, t, n), n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode, n.parentNode.removeChild(n));
				break;
			case 27:
				nl || qc(n, t);
				var r = W, i = ll;
				Zd(n.type) && (W = n.stateNode, ll = !1), ul(e, t, n), pf(n.stateNode), W = r, ll = i;
				break;
			case 5: nl || qc(n, t);
			case 6:
				if (r = W, i = ll, W = null, ul(e, t, n), W = r, ll = i, W !== null) if (ll) try {
					(W.nodeType === 9 ? W.body : W.nodeName === "HTML" ? W.ownerDocument.body : W).removeChild(n.stateNode);
				} catch (e) {
					Z(n, t, e);
				}
				else try {
					W.removeChild(n.stateNode);
				} catch (e) {
					Z(n, t, e);
				}
				break;
			case 18:
				W !== null && (ll ? (e = W, Qd(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode), Np(e)) : Qd(W, n.stateNode));
				break;
			case 4:
				r = W, i = ll, W = n.stateNode.containerInfo, ll = !0, ul(e, t, n), W = r, ll = i;
				break;
			case 0:
			case 11:
			case 14:
			case 15:
				Uc(2, n, t), nl || Uc(4, n, t), ul(e, t, n);
				break;
			case 1:
				nl || (qc(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function" && Gc(n, t, r)), ul(e, t, n);
				break;
			case 21:
				ul(e, t, n);
				break;
			case 22:
				nl = (r = nl) || n.memoizedState !== null, ul(e, t, n), nl = r;
				break;
			default: ul(e, t, n);
		}
	}
	function fl(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null))) {
			e = e.dehydrated;
			try {
				Np(e);
			} catch (e) {
				Z(t, t.return, e);
			}
		}
	}
	function pl(e, t) {
		if (t.memoizedState === null && (e = t.alternate, e !== null && (e = e.memoizedState, e !== null && (e = e.dehydrated, e !== null)))) try {
			Np(e);
		} catch (e) {
			Z(t, t.return, e);
		}
	}
	function ml(e) {
		switch (e.tag) {
			case 31:
			case 13:
			case 19:
				var t = e.stateNode;
				return t === null && (t = e.stateNode = new il()), t;
			case 22: return e = e.stateNode, t = e._retryCache, t === null && (t = e._retryCache = new il()), t;
			default: throw Error(s(435, e.tag));
		}
	}
	function hl(e, t) {
		var n = ml(e);
		t.forEach(function(t) {
			if (!n.has(t)) {
				n.add(t);
				var r = Yu.bind(null, e, t);
				t.then(r, r);
			}
		});
	}
	function gl(e, t) {
		var n = t.deletions;
		if (n !== null) for (var r = 0; r < n.length; r++) {
			var i = n[r], a = e, o = t, c = o;
			a: for (; c !== null;) {
				switch (c.tag) {
					case 27:
						if (Zd(c.type)) {
							W = c.stateNode, ll = !1;
							break a;
						}
						break;
					case 5:
						W = c.stateNode, ll = !1;
						break a;
					case 3:
					case 4:
						W = c.stateNode.containerInfo, ll = !0;
						break a;
				}
				c = c.return;
			}
			if (W === null) throw Error(s(160));
			dl(a, o, i), W = null, ll = !1, a = i.alternate, a !== null && (a.return = null), i.return = null;
		}
		if (t.subtreeFlags & 13886) for (t = t.child; t !== null;) vl(t, e), t = t.sibling;
	}
	var _l = null;
	function vl(e, t) {
		var n = e.alternate, r = e.flags;
		switch (e.tag) {
			case 0:
			case 11:
			case 14:
			case 15:
				gl(t, e), yl(e), r & 4 && (Uc(3, e, e.return), Hc(3, e), Uc(5, e, e.return));
				break;
			case 1:
				gl(t, e), yl(e), r & 512 && (nl || n === null || qc(n, n.return)), r & 64 && tl && (e = e.updateQueue, e !== null && (r = e.callbacks, r !== null && (n = e.shared.hiddenCallbacks, e.shared.hiddenCallbacks = n === null ? r : n.concat(r))));
				break;
			case 26:
				var i = _l;
				if (gl(t, e), yl(e), r & 512 && (nl || n === null || qc(n, n.return)), r & 4) {
					var a = n === null ? null : n.memoizedState;
					if (r = e.memoizedState, n === null) if (r === null) if (e.stateNode === null) {
						a: {
							r = e.type, n = e.memoizedProps, i = i.ownerDocument || i;
							b: switch (r) {
								case "title":
									a = i.getElementsByTagName("title")[0], (!a || a[mt] || a[st] || a.namespaceURI === "http://www.w3.org/2000/svg" || a.hasAttribute("itemprop")) && (a = i.createElement(r), i.head.insertBefore(a, i.querySelector("head > title"))), Pd(a, r, n), a[st] = e, bt(a), r = a;
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
							a[st] = e, bt(a), r = a;
						}
						e.stateNode = r;
					} else Hf(i, e.type, e.stateNode);
					else e.stateNode = If(i, r, e.memoizedProps);
					else a === r ? r === null && e.stateNode !== null && Yc(e, e.memoizedProps, n.memoizedProps) : (a === null ? n.stateNode !== null && (n = n.stateNode, n.parentNode.removeChild(n)) : a.count--, r === null ? Hf(i, e.type, e.stateNode) : If(i, r, e.memoizedProps));
				}
				break;
			case 27:
				gl(t, e), yl(e), r & 512 && (nl || n === null || qc(n, n.return)), n !== null && r & 4 && Yc(e, e.memoizedProps, n.memoizedProps);
				break;
			case 5:
				if (gl(t, e), yl(e), r & 512 && (nl || n === null || qc(n, n.return)), e.flags & 32) {
					i = e.stateNode;
					try {
						Gt(i, "");
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				r & 4 && e.stateNode != null && (i = e.memoizedProps, Yc(e, i, n === null ? i : n.memoizedProps)), r & 1024 && (rl = !0);
				break;
			case 6:
				if (gl(t, e), yl(e), r & 4) {
					if (e.stateNode === null) throw Error(s(162));
					r = e.memoizedProps, n = e.stateNode;
					try {
						n.nodeValue = r;
					} catch (t) {
						Z(e, e.return, t);
					}
				}
				break;
			case 3:
				if (Bf = null, i = _l, _l = gf(t.containerInfo), gl(t, e), _l = i, yl(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
					Np(t.containerInfo);
				} catch (t) {
					Z(e, e.return, t);
				}
				rl && (rl = !1, bl(e));
				break;
			case 4:
				r = _l, _l = gf(e.stateNode.containerInfo), gl(t, e), yl(e), _l = r;
				break;
			case 12:
				gl(t, e), yl(e);
				break;
			case 31:
				gl(t, e), yl(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, hl(e, r)));
				break;
			case 13:
				gl(t, e), yl(e), e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && ($l = Ee()), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, hl(e, r)));
				break;
			case 22:
				i = e.memoizedState !== null;
				var l = n !== null && n.memoizedState !== null, u = tl, d = nl;
				if (tl = u || i, nl = d || l, gl(t, e), nl = d, tl = u, yl(e), r & 8192) a: for (t = e.stateNode, t._visibility = i ? t._visibility & -2 : t._visibility | 1, i && (n === null || l || tl || nl || Sl(e)), n = null, t = e;;) {
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
								Z(l, l.return, e);
							}
						}
					} else if (t.tag === 6) {
						if (n === null) {
							l = t;
							try {
								l.stateNode.nodeValue = i ? "" : l.memoizedProps;
							} catch (e) {
								Z(l, l.return, e);
							}
						}
					} else if (t.tag === 18) {
						if (n === null) {
							l = t;
							try {
								var m = l.stateNode;
								i ? $d(m, !0) : $d(l.stateNode, !1);
							} catch (e) {
								Z(l, l.return, e);
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
				r & 4 && (r = e.updateQueue, r !== null && (n = r.retryQueue, n !== null && (r.retryQueue = null, hl(e, n))));
				break;
			case 19:
				gl(t, e), yl(e), r & 4 && (r = e.updateQueue, r !== null && (e.updateQueue = null, hl(e, r)));
				break;
			case 30: break;
			case 21: break;
			default: gl(t, e), yl(e);
		}
	}
	function yl(e) {
		var t = e.flags;
		if (t & 2) {
			try {
				for (var n, r = e.return; r !== null;) {
					if (Xc(r)) {
						n = r;
						break;
					}
					r = r.return;
				}
				if (n == null) throw Error(s(160));
				switch (n.tag) {
					case 27:
						var i = n.stateNode;
						$c(e, Zc(e), i);
						break;
					case 5:
						var a = n.stateNode;
						n.flags & 32 && (Gt(a, ""), n.flags &= -33), $c(e, Zc(e), a);
						break;
					case 3:
					case 4:
						var o = n.stateNode.containerInfo;
						Qc(e, Zc(e), o);
						break;
					default: throw Error(s(161));
				}
			} catch (t) {
				Z(e, e.return, t);
			}
			e.flags &= -3;
		}
		t & 4096 && (e.flags &= -4097);
	}
	function bl(e) {
		if (e.subtreeFlags & 1024) for (e = e.child; e !== null;) {
			var t = e;
			bl(t), t.tag === 5 && t.flags & 1024 && t.stateNode.reset(), e = e.sibling;
		}
	}
	function xl(e, t) {
		if (t.subtreeFlags & 8772) for (t = t.child; t !== null;) sl(e, t.alternate, t), t = t.sibling;
	}
	function Sl(e) {
		for (e = e.child; e !== null;) {
			var t = e;
			switch (t.tag) {
				case 0:
				case 11:
				case 14:
				case 15:
					Uc(4, t, t.return), Sl(t);
					break;
				case 1:
					qc(t, t.return);
					var n = t.stateNode;
					typeof n.componentWillUnmount == "function" && Gc(t, t.return, n), Sl(t);
					break;
				case 27: pf(t.stateNode);
				case 26:
				case 5:
					qc(t, t.return), Sl(t);
					break;
				case 22:
					t.memoizedState === null && Sl(t);
					break;
				case 30:
					Sl(t);
					break;
				default: Sl(t);
			}
			e = e.sibling;
		}
	}
	function Cl(e, t, n) {
		for (n &&= (t.subtreeFlags & 8772) != 0, t = t.child; t !== null;) {
			var r = t.alternate, i = e, a = t, o = a.flags;
			switch (a.tag) {
				case 0:
				case 11:
				case 15:
					Cl(i, a, n), Hc(4, a);
					break;
				case 1:
					if (Cl(i, a, n), r = a, i = r.stateNode, typeof i.componentDidMount == "function") try {
						i.componentDidMount();
					} catch (e) {
						Z(r, r.return, e);
					}
					if (r = a, i = r.updateQueue, i !== null) {
						var s = r.stateNode;
						try {
							var c = i.shared.hiddenCallbacks;
							if (c !== null) for (i.shared.hiddenCallbacks = null, i = 0; i < c.length; i++) Ya(c[i], s);
						} catch (e) {
							Z(r, r.return, e);
						}
					}
					n && o & 64 && Wc(a), Kc(a, a.return);
					break;
				case 27: el(a);
				case 26:
				case 5:
					Cl(i, a, n), n && r === null && o & 4 && Jc(a), Kc(a, a.return);
					break;
				case 12:
					Cl(i, a, n);
					break;
				case 31:
					Cl(i, a, n), n && o & 4 && fl(i, a);
					break;
				case 13:
					Cl(i, a, n), n && o & 4 && pl(i, a);
					break;
				case 22:
					a.memoizedState === null && Cl(i, a, n), Kc(a, a.return);
					break;
				case 30: break;
				default: Cl(i, a, n);
			}
			t = t.sibling;
		}
	}
	function wl(e, t) {
		var n = null;
		e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool), e = null, t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool), e !== n && (e != null && e.refCount++, n != null && ca(n));
	}
	function Tl(e, t) {
		e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ca(e));
	}
	function El(e, t, n, r) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) Dl(e, t, n, r), t = t.sibling;
	}
	function Dl(e, t, n, r) {
		var i = t.flags;
		switch (t.tag) {
			case 0:
			case 11:
			case 15:
				El(e, t, n, r), i & 2048 && Hc(9, t);
				break;
			case 1:
				El(e, t, n, r);
				break;
			case 3:
				El(e, t, n, r), i & 2048 && (e = null, t.alternate !== null && (e = t.alternate.memoizedState.cache), t = t.memoizedState.cache, t !== e && (t.refCount++, e != null && ca(e)));
				break;
			case 12:
				if (i & 2048) {
					El(e, t, n, r), e = t.stateNode;
					try {
						var a = t.memoizedProps, o = a.id, s = a.onPostCommit;
						typeof s == "function" && s(o, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0);
					} catch (e) {
						Z(t, t.return, e);
					}
				} else El(e, t, n, r);
				break;
			case 31:
				El(e, t, n, r);
				break;
			case 13:
				El(e, t, n, r);
				break;
			case 23: break;
			case 22:
				a = t.stateNode, o = t.alternate, t.memoizedState === null ? a._visibility & 2 ? El(e, t, n, r) : (a._visibility |= 2, Ol(e, t, n, r, (t.subtreeFlags & 10256) != 0 || !1)) : a._visibility & 2 ? El(e, t, n, r) : kl(e, t), i & 2048 && wl(o, t);
				break;
			case 24:
				El(e, t, n, r), i & 2048 && Tl(t.alternate, t);
				break;
			default: El(e, t, n, r);
		}
	}
	function Ol(e, t, n, r, i) {
		for (i &&= (t.subtreeFlags & 10256) != 0 || !1, t = t.child; t !== null;) {
			var a = e, o = t, s = n, c = r, l = o.flags;
			switch (o.tag) {
				case 0:
				case 11:
				case 15:
					Ol(a, o, s, c, i), Hc(8, o);
					break;
				case 23: break;
				case 22:
					var u = o.stateNode;
					o.memoizedState === null ? (u._visibility |= 2, Ol(a, o, s, c, i)) : u._visibility & 2 ? Ol(a, o, s, c, i) : kl(a, o), i && l & 2048 && wl(o.alternate, o);
					break;
				case 24:
					Ol(a, o, s, c, i), i && l & 2048 && Tl(o.alternate, o);
					break;
				default: Ol(a, o, s, c, i);
			}
			t = t.sibling;
		}
	}
	function kl(e, t) {
		if (t.subtreeFlags & 10256) for (t = t.child; t !== null;) {
			var n = e, r = t, i = r.flags;
			switch (r.tag) {
				case 22:
					kl(n, r), i & 2048 && wl(r.alternate, r);
					break;
				case 24:
					kl(n, r), i & 2048 && Tl(r.alternate, r);
					break;
				default: kl(n, r);
			}
			t = t.sibling;
		}
	}
	var Al = 8192;
	function jl(e, t, n) {
		if (e.subtreeFlags & Al) for (e = e.child; e !== null;) Ml(e, t, n), e = e.sibling;
	}
	function Ml(e, t, n) {
		switch (e.tag) {
			case 26:
				jl(e, t, n), e.flags & Al && e.memoizedState !== null && Gf(n, _l, e.memoizedState, e.memoizedProps);
				break;
			case 5:
				jl(e, t, n);
				break;
			case 3:
			case 4:
				var r = _l;
				_l = gf(e.stateNode.containerInfo), jl(e, t, n), _l = r;
				break;
			case 22:
				e.memoizedState === null && (r = e.alternate, r !== null && r.memoizedState !== null ? (r = Al, Al = 16777216, jl(e, t, n), Al = r) : jl(e, t, n));
				break;
			default: jl(e, t, n);
		}
	}
	function Nl(e) {
		var t = e.alternate;
		if (t !== null && (e = t.child, e !== null)) {
			t.child = null;
			do
				t = e.sibling, e.sibling = null, e = t;
			while (e !== null);
		}
	}
	function Pl(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				al = r, Ll(r, e);
			}
			Nl(e);
		}
		if (e.subtreeFlags & 10256) for (e = e.child; e !== null;) Fl(e), e = e.sibling;
	}
	function Fl(e) {
		switch (e.tag) {
			case 0:
			case 11:
			case 15:
				Pl(e), e.flags & 2048 && Uc(9, e, e.return);
				break;
			case 3:
				Pl(e);
				break;
			case 12:
				Pl(e);
				break;
			case 22:
				var t = e.stateNode;
				e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3, Il(e)) : Pl(e);
				break;
			default: Pl(e);
		}
	}
	function Il(e) {
		var t = e.deletions;
		if (e.flags & 16) {
			if (t !== null) for (var n = 0; n < t.length; n++) {
				var r = t[n];
				al = r, Ll(r, e);
			}
			Nl(e);
		}
		for (e = e.child; e !== null;) {
			switch (t = e, t.tag) {
				case 0:
				case 11:
				case 15:
					Uc(8, t, t.return), Il(t);
					break;
				case 22:
					n = t.stateNode, n._visibility & 2 && (n._visibility &= -3, Il(t));
					break;
				default: Il(t);
			}
			e = e.sibling;
		}
	}
	function Ll(e, t) {
		for (; al !== null;) {
			var n = al;
			switch (n.tag) {
				case 0:
				case 11:
				case 15:
					Uc(8, n, t);
					break;
				case 23:
				case 22:
					if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
						var r = n.memoizedState.cachePool.pool;
						r != null && r.refCount++;
					}
					break;
				case 24: ca(n.memoizedState.cache);
			}
			if (r = n.child, r !== null) r.return = n, al = r;
			else a: for (n = e; al !== null;) {
				r = al;
				var i = r.sibling, a = r.return;
				if (cl(r), r === n) {
					al = null;
					break a;
				}
				if (i !== null) {
					i.return = a, al = i;
					break a;
				}
				al = a;
			}
		}
	}
	var Rl = {
		getCacheForType: function(e) {
			var t = ea(oa), n = t.data.get(e);
			return n === void 0 && (n = e(), t.data.set(e, n)), n;
		},
		cacheSignal: function() {
			return ea(oa).controller.signal;
		}
	}, zl = typeof WeakMap == "function" ? WeakMap : Map, G = 0, K = null, q = null, J = 0, Y = 0, Bl = null, Vl = !1, Hl = !1, Ul = !1, Wl = 0, X = 0, Gl = 0, Kl = 0, ql = 0, Jl = 0, Yl = 0, Xl = null, Zl = null, Ql = !1, $l = 0, eu = 0, tu = Infinity, nu = null, ru = null, iu = 0, au = null, ou = null, su = 0, cu = 0, lu = null, uu = null, du = 0, fu = null;
	function pu() {
		return G & 2 && J !== 0 ? J & -J : j.T === null ? it() : dd();
	}
	function mu() {
		if (Jl === 0) if (!(J & 536870912) || B) {
			var e = Ue;
			Ue <<= 1, !(Ue & 3932160) && (Ue = 262144), Jl = e;
		} else Jl = 536870912;
		return e = no.current, e !== null && (e.flags |= 32), Jl;
	}
	function hu(e, t, n) {
		(e === K && (Y === 2 || Y === 9) || e.cancelPendingCommit !== null) && (Su(e, 0), yu(e, J, Jl, !1)), Ze(e, n), (!(G & 2) || e !== K) && (e === K && (!(G & 2) && (Kl |= n), X === 4 && yu(e, J, Jl, !1)), rd(e));
	}
	function gu(e, t, n) {
		if (G & 6) throw Error(s(327));
		var r = !n && (t & 127) == 0 && (t & e.expiredLanes) === 0 || qe(e, t), i = r ? Au(e, t) : Ou(e, t, !0), a = r;
		do {
			if (i === 0) {
				Hl && !r && yu(e, t, 0, !1);
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
								if (Ul && !l) {
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
							yu(r, t, Jl, !Vl);
							break a;
						case 2:
							Zl = null;
							break;
						case 3:
						case 5: break;
						default: throw Error(s(329));
					}
					if ((t & 62914560) === t && (i = $l + 300 - Ee(), 10 < i)) {
						if (yu(r, t, Jl, !Vl), Ke(r, 0, !0) !== 0) break a;
						su = t, r.timeoutHandle = Kd(_u.bind(null, r, n, Zl, nu, Ql, t, Jl, Kl, Yl, Vl, a, "Throttled", -0, 0), i);
						break a;
					}
					_u(r, n, Zl, nu, Ql, t, Jl, Kl, Yl, Vl, a, null, -0, 0);
				}
			}
			break;
		} while (1);
		rd(e);
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
				unsuspend: $t
			}, Ml(t, a, d);
			var m = (a & 62914560) === a ? $l - Ee() : (a & 4194048) === a ? eu - Ee() : 0;
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
					if (!Sr(a(), i)) return !1;
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
			var a = 31 - Re(i), o = 1 << a;
			r[a] = -1, i &= ~o;
		}
		n !== 0 && $e(e, n, t);
	}
	function bu() {
		return G & 6 ? !0 : (id(0, !1), !1);
	}
	function xu() {
		if (q !== null) {
			if (Y === 0) var e = q.return;
			else e = q, Ki = Gi = null, ko(e), ja = null, Ma = 0, e = q;
			for (; e !== null;) Vc(e.alternate, e), e = e.return;
			q = null;
		}
	}
	function Su(e, t) {
		var n = e.timeoutHandle;
		n !== -1 && (e.timeoutHandle = -1, qd(n)), n = e.cancelPendingCommit, n !== null && (e.cancelPendingCommit = null, n()), su = 0, xu(), K = e, q = n = ui(e.current, null), J = t, Y = 0, Bl = null, Vl = !1, Hl = qe(e, t), Ul = !1, Yl = Jl = ql = Kl = Gl = X = 0, Zl = Xl = null, Ql = !1, t & 8 && (t |= t & 32);
		var r = e.entangledLanes;
		if (r !== 0) for (e = e.entanglements, r &= t; 0 < r;) {
			var i = 31 - Re(r), a = 1 << i;
			t |= e[i], r &= ~a;
		}
		return Wl = t, ei(), n;
	}
	function Cu(e, t) {
		V = null, j.H = zs, t === xa || t === Ca ? (t = ka(), Y = 3) : t === Sa ? (t = ka(), Y = 4) : Y = t === rc ? 8 : typeof t == "object" && t && typeof t.then == "function" ? 6 : 1, Bl = t, q === null && (X = 1, Zs(e, vi(t, e.current)));
	}
	function wu() {
		var e = no.current;
		return e === null ? !0 : (J & 4194048) === J ? ro === null : (J & 62914560) === J || J & 536870912 ? e === ro : !1;
	}
	function Tu() {
		var e = j.H;
		return j.H = zs, e === null ? zs : e;
	}
	function Eu() {
		var e = j.A;
		return j.A = Rl, e;
	}
	function Du() {
		X = 4, Vl || (J & 4194048) !== J && no.current !== null || (Hl = !0), !(Gl & 134217727) && !(Kl & 134217727) || K === null || yu(K, J, Jl, !1);
	}
	function Ou(e, t, n) {
		var r = G;
		G |= 2;
		var i = Tu(), a = Eu();
		(K !== e || J !== t) && (nu = null, Su(e, t)), t = !1;
		var o = X;
		a: do
			try {
				if (Y !== 0 && q !== null) {
					var s = q, c = Bl;
					switch (Y) {
						case 8:
							xu(), o = 6;
							break a;
						case 3:
						case 2:
						case 9:
						case 6:
							no.current === null && (t = !0);
							var l = Y;
							if (Y = 0, Bl = null, Pu(e, s, c, l), n && Hl) {
								o = 0;
								break a;
							}
							break;
						default: l = Y, Y = 0, Bl = null, Pu(e, s, c, l);
					}
				}
				ku(), o = X;
				break;
			} catch (t) {
				Cu(e, t);
			}
		while (1);
		return t && e.shellSuspendCounter++, Ki = Gi = null, G = r, j.H = i, j.A = a, q === null && (K = null, J = 0, ei()), o;
	}
	function ku() {
		for (; q !== null;) Mu(q);
	}
	function Au(e, t) {
		var n = G;
		G |= 2;
		var r = Tu(), i = Eu();
		K !== e || J !== t ? (nu = null, tu = Ee() + 500, Su(e, t)) : Hl = qe(e, t);
		a: do
			try {
				if (Y !== 0 && q !== null) {
					t = q;
					var a = Bl;
					b: switch (Y) {
						case 1:
							Y = 0, Bl = null, Pu(e, t, a, 1);
							break;
						case 2:
						case 9:
							if (Ta(a)) {
								Y = 0, Bl = null, Nu(t);
								break;
							}
							t = function() {
								Y !== 2 && Y !== 9 || K !== e || (Y = 7), rd(e);
							}, a.then(t, t);
							break a;
						case 3:
							Y = 7;
							break a;
						case 4:
							Y = 5;
							break a;
						case 7:
							Ta(a) ? (Y = 0, Bl = null, Nu(t)) : (Y = 0, Bl = null, Pu(e, t, a, 7));
							break;
						case 5:
							var o = null;
							switch (q.tag) {
								case 26: o = q.memoizedState;
								case 5:
								case 27:
									var c = q;
									if (o ? Wf(o) : c.stateNode.complete) {
										Y = 0, Bl = null;
										var l = c.sibling;
										if (l !== null) q = l;
										else {
											var u = c.return;
											u === null ? q = null : (q = u, Fu(u));
										}
										break b;
									}
							}
							Y = 0, Bl = null, Pu(e, t, a, 5);
							break;
						case 6:
							Y = 0, Bl = null, Pu(e, t, a, 6);
							break;
						case 8:
							xu(), X = 6;
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
		return Ki = Gi = null, j.H = r, j.A = i, G = n, q === null ? (K = null, J = 0, ei(), X) : 0;
	}
	function ju() {
		for (; q !== null && !we();) Mu(q);
	}
	function Mu(e) {
		var t = Nc(e.alternate, e, Wl);
		e.memoizedProps = e.pendingProps, t === null ? Fu(e) : q = t;
	}
	function Nu(e) {
		var t = e, n = t.alternate;
		switch (t.tag) {
			case 15:
			case 0:
				t = _c(n, t, t.pendingProps, t.type, void 0, J);
				break;
			case 11:
				t = _c(n, t, t.pendingProps, t.type.render, t.ref, J);
				break;
			case 5: ko(t);
			default: Vc(n, t), t = q = di(t, Wl), t = Nc(n, t, Wl);
		}
		e.memoizedProps = e.pendingProps, t === null ? Fu(e) : q = t;
	}
	function Pu(e, t, n, r) {
		Ki = Gi = null, ko(t), ja = null, Ma = 0;
		var i = t.return;
		try {
			if (nc(e, i, t, n, J)) {
				X = 1, Zs(e, vi(n, e.current)), q = null;
				return;
			}
		} catch (t) {
			if (i !== null) throw q = i, t;
			X = 1, Zs(e, vi(n, e.current)), q = null;
			return;
		}
		t.flags & 32768 ? (B || r === 1 ? e = !0 : Hl || J & 536870912 ? e = !1 : (Vl = e = !0, (r === 2 || r === 9 || r === 3 || r === 6) && (r = no.current, r !== null && r.tag === 13 && (r.flags |= 16384))), Iu(t, e)) : Fu(t);
	}
	function Fu(e) {
		var t = e;
		do {
			if (t.flags & 32768) {
				Iu(t, Vl);
				return;
			}
			e = t.return;
			var n = zc(t.alternate, t, Wl);
			if (n !== null) {
				q = n;
				return;
			}
			if (t = t.sibling, t !== null) {
				q = t;
				return;
			}
			q = t = e;
		} while (t !== null);
		X === 0 && (X = 5);
	}
	function Iu(e, t) {
		do {
			var n = Bc(e.alternate, e);
			if (n !== null) {
				n.flags &= 32767, q = n;
				return;
			}
			if (n = e.return, n !== null && (n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null), !t && (e = e.sibling, e !== null)) {
				q = e;
				return;
			}
			q = e = n;
		} while (e !== null);
		X = 6, q = null;
	}
	function Lu(e, t, n, r, i, a, o, c, l) {
		e.cancelPendingCommit = null;
		do
			Hu();
		while (iu !== 0);
		if (G & 6) throw Error(s(327));
		if (t !== null) {
			if (t === e.current) throw Error(s(177));
			if (a = t.lanes | t.childLanes, a |= $r, Qe(e, n, a, o, c, l), e === K && (q = K = null, J = 0), ou = t, au = e, su = n, cu = a, lu = i, uu = r, t.subtreeFlags & 10256 || t.flags & 10256 ? (e.callbackNode = null, e.callbackPriority = 0, Xu(Ae, function() {
				return Uu(), null;
			})) : (e.callbackNode = null, e.callbackPriority = 0), r = (t.flags & 13878) != 0, t.subtreeFlags & 13878 || r) {
				r = j.T, j.T = null, i = M.p, M.p = 2, o = G, G |= 4;
				try {
					ol(e, t, n);
				} finally {
					G = o, M.p = i, j.T = r;
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
				n = j.T, j.T = null;
				var r = M.p;
				M.p = 2;
				var i = G;
				G |= 4;
				try {
					vl(t, e);
					var a = zd, o = Dr(e.containerInfo), s = a.focusedElem, c = a.selectionRange;
					if (o !== s && s && s.ownerDocument && Er(s.ownerDocument.documentElement, s)) {
						if (c !== null && Or(s)) {
							var l = c.start, u = c.end;
							if (u === void 0 && (u = l), "selectionStart" in s) s.selectionStart = l, s.selectionEnd = Math.min(u, s.value.length);
							else {
								var d = s.ownerDocument || document, f = d && d.defaultView || window;
								if (f.getSelection) {
									var p = f.getSelection(), m = s.textContent.length, h = Math.min(c.start, m), g = c.end === void 0 ? h : Math.min(c.end, m);
									!p.extend && h > g && (o = g, g = h, h = o);
									var _ = Tr(s, h), v = Tr(s, g);
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
					G = i, M.p = r, j.T = n;
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
				n = j.T, j.T = null;
				var r = M.p;
				M.p = 2;
				var i = G;
				G |= 4;
				try {
					sl(e, t.alternate, t);
				} finally {
					G = i, M.p = r, j.T = n;
				}
			}
			iu = 3;
		}
	}
	function Bu() {
		if (iu === 4 || iu === 3) {
			iu = 0, Te();
			var e = au, t = ou, n = su, r = uu;
			t.subtreeFlags & 10256 || t.flags & 10256 ? iu = 5 : (iu = 0, ou = au = null, Vu(e, e.pendingLanes));
			var i = e.pendingLanes;
			if (i === 0 && (ru = null), rt(n), t = t.stateNode, Ie && typeof Ie.onCommitFiberRoot == "function") try {
				Ie.onCommitFiberRoot(Fe, t, void 0, (t.current.flags & 128) == 128);
			} catch {}
			if (r !== null) {
				t = j.T, i = M.p, M.p = 2, j.T = null;
				try {
					for (var a = e.onRecoverableError, o = 0; o < r.length; o++) {
						var s = r[o];
						a(s.value, { componentStack: s.stack });
					}
				} finally {
					j.T = t, M.p = i;
				}
			}
			su & 3 && Hu(), rd(e), i = e.pendingLanes, n & 261930 && i & 42 ? e === fu ? du++ : (du = 0, fu = e) : du = 0, id(0, !1);
		}
	}
	function Vu(e, t) {
		(e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache, t != null && (e.pooledCache = null, ca(t)));
	}
	function Hu() {
		return Ru(), zu(), Bu(), Uu();
	}
	function Uu() {
		if (iu !== 5) return !1;
		var e = au, t = cu;
		cu = 0;
		var n = rt(su), r = j.T, i = M.p;
		try {
			M.p = 32 > n ? 32 : n, j.T = null, n = lu, lu = null;
			var a = au, o = su;
			if (iu = 0, ou = au = null, su = 0, G & 6) throw Error(s(331));
			var c = G;
			if (G |= 4, Fl(a.current), Dl(a, a.current, o, n), G = c, id(0, !1), Ie && typeof Ie.onPostCommitFiberRoot == "function") try {
				Ie.onPostCommitFiberRoot(Fe, a);
			} catch {}
			return !0;
		} finally {
			M.p = i, j.T = r, Vu(e, t);
		}
	}
	function Wu(e, t, n) {
		t = vi(n, t), t = $s(e.stateNode, t, 2), e = Ua(e, t, 2), e !== null && (Ze(e, 2), rd(e));
	}
	function Z(e, t, n) {
		if (e.tag === 3) Wu(e, e, n);
		else for (; t !== null;) {
			if (t.tag === 3) {
				Wu(t, e, n);
				break;
			} else if (t.tag === 1) {
				var r = t.stateNode;
				if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (ru === null || !ru.has(r))) {
					e = vi(n, e), n = ec(2), r = Ua(t, n, 2), r !== null && (tc(n, r, t, e), Ze(r, 2), rd(r));
					break;
				}
			}
			t = t.return;
		}
	}
	function Gu(e, t, n) {
		var r = e.pingCache;
		if (r === null) {
			r = e.pingCache = new zl();
			var i = /* @__PURE__ */ new Set();
			r.set(t, i);
		} else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
		i.has(n) || (Ul = !0, i.add(n), e = Ku.bind(null, e, t, n), t.then(e, e));
	}
	function Ku(e, t, n) {
		var r = e.pingCache;
		r !== null && r.delete(t), e.pingedLanes |= e.suspendedLanes & n, e.warmLanes &= ~n, K === e && (J & n) === n && (X === 4 || X === 3 && (J & 62914560) === J && 300 > Ee() - $l ? !(G & 2) && Su(e, 0) : ql |= n, Yl === J && (Yl = 0)), rd(e);
	}
	function qu(e, t) {
		t === 0 && (t = Ye()), e = ri(e, t), e !== null && (Ze(e, t), rd(e));
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
		return Se(e, t);
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
							a = (1 << 31 - Re(42 | e) + 1) - 1, a &= i & ~(o & ~s), a = a & 201326741 ? a & 201326741 | 1 : a ? a | 2 : 0;
						}
						a !== 0 && (n = !0, ld(r, a));
					} else a = J, a = Ke(r, r === K ? a : 0, r.cancelPendingCommit !== null || r.timeoutHandle !== -1), !(a & 3) || qe(r, a) || (n = !0, ld(r, a));
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
		nd !== 0 && Gd() && (e = nd);
		for (var t = Ee(), n = null, r = Zu; r !== null;) {
			var i = r.next, a = sd(r, t);
			a === 0 ? (r.next = null, n === null ? Zu = i : n.next = i, i === null && (Qu = n)) : (n = r, (e !== 0 || a & 3) && (ed = !0)), r = i;
		}
		iu !== 0 && iu !== 5 || id(e, !1), nd !== 0 && (nd = 0);
	}
	function sd(e, t) {
		for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, a = e.pendingLanes & -62914561; 0 < a;) {
			var o = 31 - Re(a), s = 1 << o, c = i[o];
			c === -1 ? ((s & n) === 0 || (s & r) !== 0) && (i[o] = Je(s, t)) : c <= t && (e.expiredLanes |= s), a &= ~s;
		}
		if (t = K, n = J, n = Ke(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r = e.callbackNode, n === 0 || e === t && (Y === 2 || Y === 9) || e.cancelPendingCommit !== null) return r !== null && r !== null && Ce(r), e.callbackNode = null, e.callbackPriority = 0;
		if (!(n & 3) || qe(e, n)) {
			if (t = n & -n, t === e.callbackPriority) return t;
			switch (r !== null && Ce(r), rt(n)) {
				case 2:
				case 8:
					n = ke;
					break;
				case 32:
					n = Ae;
					break;
				case 268435456:
					n = Me;
					break;
				default: n = Ae;
			}
			return r = cd.bind(null, e), n = Se(n, r), e.callbackPriority = t, e.callbackNode = n, t;
		}
		return r !== null && r !== null && Ce(r), e.callbackPriority = 2, e.callbackNode = null, 2;
	}
	function cd(e, t) {
		if (iu !== 0 && iu !== 5) return e.callbackNode = null, e.callbackPriority = 0, null;
		var n = e.callbackNode;
		if (Hu() && e.callbackNode !== n) return null;
		var r = J;
		return r = Ke(e, e === K ? r : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1), r === 0 ? null : (gu(e, r, t), sd(e, Ee()), e.callbackNode != null && e.callbackNode === n ? cd.bind(null, e) : null);
	}
	function ld(e, t) {
		if (Hu()) return null;
		gu(e, t, !0);
	}
	function ud() {
		Yd(function() {
			G & 6 ? Se(Oe, ad) : od();
		});
	}
	function dd() {
		if (nd === 0) {
			var e = da;
			e === 0 && (e = He, He <<= 1, !(He & 261888) && (He = 256)), nd = e;
		}
		return nd;
	}
	function fd(e) {
		return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : Qt("" + e);
	}
	function pd(e, t) {
		var n = t.ownerDocument.createElement("input");
		return n.name = t.name, n.value = t.value, e.id && n.setAttribute("form", e.id), t.parentNode.insertBefore(n, t), e = new FormData(e), n.parentNode.removeChild(n), e;
	}
	function md(e, t, n, r, i) {
		if (t === "submit" && n && n.stateNode === i) {
			var a = fd((i[ct] || null).action), o = r.submitter;
			o && (t = (t = o[ct] || null) ? fd(t.formAction) : o.getAttribute("formAction"), t !== null && (a = t, o = null));
			var s = new xn("action", "action", null, r, i);
			e.push({
				event: s,
				listeners: [{
					instance: null,
					listener: function() {
						if (r.defaultPrevented) {
							if (nd !== 0) {
								var e = o ? pd(i, o) : new FormData(i);
								Ts(n, {
									pending: !0,
									data: e,
									method: i.method,
									action: a
								}, null, e);
							}
						} else typeof a == "function" && (s.preventDefault(), e = o ? pd(i, o) : new FormData(i), Ts(n, {
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
	for (var hd = 0; hd < Jr.length; hd++) {
		var gd = Jr[hd];
		Yr(gd.toLowerCase(), "on" + (gd[0].toUpperCase() + gd.slice(1)));
	}
	Yr(Br, "onAnimationEnd"), Yr(Vr, "onAnimationIteration"), Yr(Hr, "onAnimationStart"), Yr("dblclick", "onDoubleClick"), Yr("focusin", "onFocus"), Yr("focusout", "onBlur"), Yr(Ur, "onTransitionRun"), Yr(Wr, "onTransitionStart"), Yr(Gr, "onTransitionCancel"), Yr(Kr, "onTransitionEnd"), wt("onMouseEnter", ["mouseout", "mouseover"]), wt("onMouseLeave", ["mouseout", "mouseover"]), wt("onPointerEnter", ["pointerout", "pointerover"]), wt("onPointerLeave", ["pointerout", "pointerover"]), Ct("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), Ct("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), Ct("onBeforeInput", [
		"compositionend",
		"keypress",
		"textInput",
		"paste"
	]), Ct("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), Ct("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), Ct("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
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
						Xr(e);
					}
					i.currentTarget = null, a = c;
				}
				else for (o = 0; o < r.length; o++) {
					if (s = r[o], c = s.instance, l = s.currentTarget, s = s.listener, c !== a && i.isPropagationStopped()) break a;
					a = s, i.currentTarget = l;
					try {
						a(i);
					} catch (e) {
						Xr(e);
					}
					i.currentTarget = null, a = c;
				}
			}
		}
	}
	function Q(e, t) {
		var n = t[ut];
		n === void 0 && (n = t[ut] = /* @__PURE__ */ new Set());
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
			e[xd] = !0, xt.forEach(function(t) {
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
		n = i.bind(null, t, n, e), i = void 0, !un || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i === void 0 ? e.addEventListener(t, n, !0) : e.addEventListener(t, n, {
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
					if (o = gt(s), o === null) return;
					if (c = o.tag, c === 5 || c === 6 || c === 26 || c === 27) {
						r = a = o;
						continue a;
					}
					s = s.parentNode;
				}
			}
			r = r.return;
		}
		sn(function() {
			var r = a, i = tn(n), o = [];
			a: {
				var s = qr.get(e);
				if (s !== void 0) {
					var c = xn, u = e;
					switch (e) {
						case "keypress": if (gn(n) === 0) break a;
						case "keydown":
						case "keyup":
							c = zn;
							break;
						case "focusin":
							u = "focus", c = An;
							break;
						case "focusout":
							u = "blur", c = An;
							break;
						case "beforeblur":
						case "afterblur":
							c = An;
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
							c = On;
							break;
						case "drag":
						case "dragend":
						case "dragenter":
						case "dragexit":
						case "dragleave":
						case "dragover":
						case "dragstart":
						case "drop":
							c = kn;
							break;
						case "touchcancel":
						case "touchend":
						case "touchmove":
						case "touchstart":
							c = Vn;
							break;
						case Br:
						case Vr:
						case Hr:
							c = jn;
							break;
						case Kr:
							c = Hn;
							break;
						case "scroll":
						case "scrollend":
							c = Cn;
							break;
						case "wheel":
							c = Un;
							break;
						case "copy":
						case "cut":
						case "paste":
							c = Mn;
							break;
						case "gotpointercapture":
						case "lostpointercapture":
						case "pointercancel":
						case "pointerdown":
						case "pointermove":
						case "pointerout":
						case "pointerover":
						case "pointerup":
							c = Bn;
							break;
						case "toggle":
						case "beforetoggle": c = Wn;
					}
					var d = (t & 4) != 0, f = !d && (e === "scroll" || e === "scrollend"), p = d ? s === null ? null : s + "Capture" : s;
					d = [];
					for (var m = r, h; m !== null;) {
						var g = m;
						if (h = g.stateNode, g = g.tag, g !== 5 && g !== 26 && g !== 27 || h === null || p === null || (g = cn(m, p), g != null && d.push(Td(m, g, h))), f) break;
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
					if (s = e === "mouseover" || e === "pointerover", c = e === "mouseout" || e === "pointerout", s && n !== en && (u = n.relatedTarget || n.fromElement) && (gt(u) || u[lt])) break a;
					if ((c || s) && (s = i.window === i ? i : (s = i.ownerDocument) ? s.defaultView || s.parentWindow : window, c ? (u = n.relatedTarget || n.toElement, c = r, u = u ? gt(u) : null, u !== null && (f = l(u), d = u.tag, u !== f || d !== 5 && d !== 27 && d !== 6) && (u = null)) : (c = null, u = r), c !== u)) {
						if (d = On, g = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (d = Bn, g = "onPointerLeave", p = "onPointerEnter", m = "pointer"), f = c == null ? s : vt(c), h = u == null ? s : vt(u), s = new d(g, m + "leave", c, n, i), s.target = f, s.relatedTarget = h, g = null, gt(i) === r && (d = new d(p, m + "enter", u, n, i), d.target = h, d.relatedTarget = f, g = d), f = g, c && u) b: {
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
					if (s = r ? vt(r) : window, c = s.nodeName && s.nodeName.toLowerCase(), c === "select" || c === "input" && s.type === "file") var v = ur;
					else if (ir(s)) if (dr) v = br;
					else {
						v = vr;
						var y = _r;
					}
					else c = s.nodeName, !c || c.toLowerCase() !== "input" || s.type !== "checkbox" && s.type !== "radio" ? r && Yt(r.elementType) && (v = ur) : v = yr;
					if (v &&= v(e, r)) {
						ar(o, v, n, i);
						break a;
					}
					y && y(e, s, r), e === "focusout" && r && s.type === "number" && r.memoizedProps.value != null && Vt(s, "number", s.value);
				}
				switch (y = r ? vt(r) : window, e) {
					case "focusin":
						(ir(y) || y.contentEditable === "true") && (Ar = y, jr = r, Mr = null);
						break;
					case "focusout":
						Mr = jr = Ar = null;
						break;
					case "mousedown":
						Nr = !0;
						break;
					case "contextmenu":
					case "mouseup":
					case "dragend":
						Nr = !1, Pr(o, n, i);
						break;
					case "selectionchange": if (kr) break;
					case "keydown":
					case "keyup": Pr(o, n, i);
				}
				var b;
				if (Kn) b: {
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
				else er ? Qn(e, n) && (x = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (x = "onCompositionStart");
				x && (Yn && n.locale !== "ko" && (er || x !== "onCompositionStart" ? x === "onCompositionEnd" && er && (b = hn()) : (fn = i, pn = "value" in fn ? fn.value : fn.textContent, er = !0)), y = Ed(r, x), 0 < y.length && (x = new Nn(x, e, null, n, i), o.push({
					event: x,
					listeners: y
				}), b ? x.data = b : (b = $n(n), b !== null && (x.data = b)))), (b = Jn ? tr(e, n) : nr(e, n)) && (x = Ed(r, "onBeforeInput"), 0 < x.length && (y = new Nn("onBeforeInput", "beforeinput", null, n, i), o.push({
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
			if (i = i.tag, i !== 5 && i !== 26 && i !== 27 || a === null || (i = cn(e, n), i != null && r.unshift(Td(e, i, a)), i = cn(e, t), i != null && r.push(Td(e, i, a))), e.tag === 3) return r;
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
			s !== 5 && s !== 26 && s !== 27 || l === null || (c = l, i ? (l = cn(n, a), l != null && o.unshift(Td(n, l, c))) : i || (l = cn(n, a), l != null && o.push(Td(n, l, c)))), n = n.return;
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
	function $(e, t, n, r, i, a) {
		switch (n) {
			case "children":
				typeof r == "string" ? t === "body" || t === "textarea" && r === "" || Gt(e, r) : (typeof r == "number" || typeof r == "bigint") && t !== "body" && Gt(e, "" + r);
				break;
			case "className":
				At(e, "class", r);
				break;
			case "tabIndex":
				At(e, "tabindex", r);
				break;
			case "dir":
			case "role":
			case "viewBox":
			case "width":
			case "height":
				At(e, n, r);
				break;
			case "style":
				Jt(e, r, a);
				break;
			case "data": if (t !== "object") {
				At(e, "data", r);
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
				r = Qt("" + r), e.setAttribute(n, r);
				break;
			case "action":
			case "formAction":
				if (typeof r == "function") {
					e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
					break;
				} else typeof a == "function" && (n === "formAction" ? (t !== "input" && $(e, t, "name", i.name, i, null), $(e, t, "formEncType", i.formEncType, i, null), $(e, t, "formMethod", i.formMethod, i, null), $(e, t, "formTarget", i.formTarget, i, null)) : ($(e, t, "encType", i.encType, i, null), $(e, t, "method", i.method, i, null), $(e, t, "target", i.target, i, null)));
				if (r == null || typeof r == "symbol" || typeof r == "boolean") {
					e.removeAttribute(n);
					break;
				}
				r = Qt("" + r), e.setAttribute(n, r);
				break;
			case "onClick":
				r != null && (e.onclick = $t);
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
				n = Qt("" + r), e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
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
				Q("beforetoggle", e), Q("toggle", e), kt(e, "popover", r);
				break;
			case "xlinkActuate":
				jt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", r);
				break;
			case "xlinkArcrole":
				jt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", r);
				break;
			case "xlinkRole":
				jt(e, "http://www.w3.org/1999/xlink", "xlink:role", r);
				break;
			case "xlinkShow":
				jt(e, "http://www.w3.org/1999/xlink", "xlink:show", r);
				break;
			case "xlinkTitle":
				jt(e, "http://www.w3.org/1999/xlink", "xlink:title", r);
				break;
			case "xlinkType":
				jt(e, "http://www.w3.org/1999/xlink", "xlink:type", r);
				break;
			case "xmlBase":
				jt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", r);
				break;
			case "xmlLang":
				jt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", r);
				break;
			case "xmlSpace":
				jt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", r);
				break;
			case "is":
				kt(e, "is", r);
				break;
			case "innerText":
			case "textContent": break;
			default: (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = Xt.get(n) || n, kt(e, n, r));
		}
	}
	function Nd(e, t, n, r, i, a) {
		switch (n) {
			case "style":
				Jt(e, r, a);
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
				typeof r == "string" ? Gt(e, r) : (typeof r == "number" || typeof r == "bigint") && Gt(e, "" + r);
				break;
			case "onScroll":
				r != null && Q("scroll", e);
				break;
			case "onScrollEnd":
				r != null && Q("scrollend", e);
				break;
			case "onClick":
				r != null && (e.onclick = $t);
				break;
			case "suppressContentEditableWarning":
			case "suppressHydrationWarning":
			case "innerHTML":
			case "ref": break;
			case "innerText":
			case "textContent": break;
			default: if (!St.hasOwnProperty(n)) a: {
				if (n[0] === "o" && n[1] === "n" && (i = n.endsWith("Capture"), t = n.slice(2, i ? n.length - 7 : void 0), a = e[ct] || null, a = a == null ? null : a[n], typeof a == "function" && e.removeEventListener(t, a, i), typeof r == "function")) {
					typeof a != "function" && a !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)), e.addEventListener(t, r, i);
					break a;
				}
				n in e ? e[n] = r : !0 === r ? e.setAttribute(n, "") : kt(e, n, r);
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
						default: $(e, t, a, o, n, null);
					}
				}
				i && $(e, t, "srcSet", n.srcSet, n, null), r && $(e, t, "src", n.src, n, null);
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
						default: $(e, t, r, d, n, null);
					}
				}
				Bt(e, a, c, l, u, o, i, !1);
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
					default: $(e, t, i, c, n, null);
				}
				t = a, n = o, e.multiple = !!r, t == null ? n != null && Ht(e, !!r, n, !0) : Ht(e, !!r, t, !1);
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
					default: $(e, t, o, c, n, null);
				}
				Wt(e, r, i, a);
				return;
			case "option":
				for (l in n) if (n.hasOwnProperty(l) && (r = n[l], r != null)) switch (l) {
					case "selected":
						e.selected = r && typeof r != "function" && typeof r != "symbol";
						break;
					default: $(e, t, l, r, n, null);
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
					default: $(e, t, u, r, n, null);
				}
				return;
			default: if (Yt(t)) {
				for (d in n) n.hasOwnProperty(d) && (r = n[d], r !== void 0 && Nd(e, t, d, r, n, void 0));
				return;
			}
		}
		for (c in n) n.hasOwnProperty(c) && (r = n[c], r != null && $(e, t, c, r, n, null));
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
						default: r.hasOwnProperty(m) || $(e, t, m, null, r, f);
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
						default: m !== f && $(e, t, p, m, r, f);
					}
				}
				zt(e, o, c, l, u, d, a, i);
				return;
			case "select":
				for (a in m = o = c = p = null, n) if (l = n[a], n.hasOwnProperty(a) && l != null) switch (a) {
					case "value": break;
					case "multiple": m = l;
					default: r.hasOwnProperty(a) || $(e, t, a, null, r, l);
				}
				for (i in r) if (a = r[i], l = n[i], r.hasOwnProperty(i) && (a != null || l != null)) switch (i) {
					case "value":
						p = a;
						break;
					case "defaultValue":
						c = a;
						break;
					case "multiple": o = a;
					default: a !== l && $(e, t, i, a, r, l);
				}
				t = c, n = o, r = m, p == null ? !!r != !!n && (t == null ? Ht(e, !!n, n ? [] : "", !1) : Ht(e, !!n, t, !0)) : Ht(e, !!n, p, !1);
				return;
			case "textarea":
				for (c in m = p = null, n) if (i = n[c], n.hasOwnProperty(c) && i != null && !r.hasOwnProperty(c)) switch (c) {
					case "value": break;
					case "children": break;
					default: $(e, t, c, null, r, i);
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
					default: i !== a && $(e, t, o, i, r, a);
				}
				Ut(e, p, m);
				return;
			case "option":
				for (var h in n) if (p = n[h], n.hasOwnProperty(h) && p != null && !r.hasOwnProperty(h)) switch (h) {
					case "selected":
						e.selected = !1;
						break;
					default: $(e, t, h, null, r, p);
				}
				for (l in r) if (p = r[l], m = n[l], r.hasOwnProperty(l) && p !== m && (p != null || m != null)) switch (l) {
					case "selected":
						e.selected = p && typeof p != "function" && typeof p != "symbol";
						break;
					default: $(e, t, l, p, r, m);
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
				for (var g in n) p = n[g], n.hasOwnProperty(g) && p != null && !r.hasOwnProperty(g) && $(e, t, g, null, r, p);
				for (u in r) if (p = r[u], m = n[u], r.hasOwnProperty(u) && p !== m && (p != null || m != null)) switch (u) {
					case "children":
					case "dangerouslySetInnerHTML":
						if (p != null) throw Error(s(137, t));
						break;
					default: $(e, t, u, p, r, m);
				}
				return;
			default: if (Yt(t)) {
				for (var _ in n) p = n[_], n.hasOwnProperty(_) && p !== void 0 && !r.hasOwnProperty(_) && Nd(e, t, _, void 0, r, p);
				for (d in r) p = r[d], m = n[d], !r.hasOwnProperty(d) || p === m || p === void 0 && m === void 0 || Nd(e, t, d, p, r, m);
				return;
			}
		}
		for (var v in n) p = n[v], n.hasOwnProperty(v) && p != null && !r.hasOwnProperty(v) && $(e, t, v, null, r, p);
		for (f in r) p = r[f], m = n[f], !r.hasOwnProperty(f) || p === m || p == null && m == null || $(e, t, f, p, r, m);
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
					a[mt] || s === "SCRIPT" || s === "STYLE" || s === "LINK" && a.rel.toLowerCase() === "stylesheet" || n.removeChild(a), a = o;
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
					ef(n), ht(n);
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
			else if (!e[mt]) switch (t) {
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
		ht(e);
	}
	var mf = /* @__PURE__ */ new Map(), hf = /* @__PURE__ */ new Set();
	function gf(e) {
		return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument;
	}
	var _f = M.d;
	M.d = {
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
		var e = _f.f(), t = bu();
		return e || t;
	}
	function yf(e) {
		var t = _t(e);
		t !== null && t.tag === 5 && t.type === "form" ? Ds(t) : _f.r(e);
	}
	var bf = typeof document > "u" ? null : document;
	function xf(e, t, n) {
		var r = bf;
		if (r && typeof t == "string" && t) {
			var i = Rt(t);
			i = "link[rel=\"" + e + "\"][href=\"" + i + "\"]", typeof n == "string" && (i += "[crossorigin=\"" + n + "\"]"), hf.has(i) || (hf.add(i), e = {
				rel: e,
				crossOrigin: n,
				href: t
			}, r.querySelector(i) === null && (t = r.createElement("link"), Pd(t, "link", e), bt(t), r.head.appendChild(t)));
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
			var i = "link[rel=\"preload\"][as=\"" + Rt(t) + "\"]";
			t === "image" && n && n.imageSrcSet ? (i += "[imagesrcset=\"" + Rt(n.imageSrcSet) + "\"]", typeof n.imageSizes == "string" && (i += "[imagesizes=\"" + Rt(n.imageSizes) + "\"]")) : i += "[href=\"" + Rt(e) + "\"]";
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
			}, n), mf.set(a, e), r.querySelector(i) !== null || t === "style" && r.querySelector(jf(a)) || t === "script" && r.querySelector(Ff(a)) || (t = r.createElement("link"), Pd(t, "link", e), bt(t), r.head.appendChild(t)));
		}
	}
	function Tf(e, t) {
		_f.m(e, t);
		var n = bf;
		if (n && e) {
			var r = t && typeof t.as == "string" ? t.as : "script", i = "link[rel=\"modulepreload\"][as=\"" + Rt(r) + "\"][href=\"" + Rt(e) + "\"]", a = i;
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
				r = n.createElement("link"), Pd(r, "link", e), bt(r), n.head.appendChild(r);
			}
		}
	}
	function Ef(e, t, n) {
		_f.S(e, t, n);
		var r = bf;
		if (r && e) {
			var i = yt(r).hoistableStyles, a = Af(e);
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
					bt(c), Pd(c, "link", e), c._p = new Promise(function(e, t) {
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
			var r = yt(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
				src: e,
				async: !0
			}, t), (t = mf.get(i)) && zf(e, t), a = n.createElement("script"), bt(a), Pd(a, "link", e), n.head.appendChild(a)), a = {
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
			var r = yt(n).hoistableScripts, i = Pf(e), a = r.get(i);
			a || (a = n.querySelector(Ff(i)), a || (e = h({
				src: e,
				async: !0,
				type: "module"
			}, t), (t = mf.get(i)) && zf(e, t), a = n.createElement("script"), bt(a), Pd(a, "link", e), n.head.appendChild(a)), a = {
				type: "script",
				instance: a,
				count: 1,
				state: null
			}, r.set(i, a));
		}
	}
	function kf(e, t, n, r) {
		var i = (i = le.current) ? gf(i) : null;
		if (!i) throw Error(s(446));
		switch (e) {
			case "meta":
			case "title": return null;
			case "style": return typeof n.precedence == "string" && typeof n.href == "string" ? (t = Af(n.href), n = yt(i).hoistableStyles, r = n.get(t), r || (r = {
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
					var a = yt(i).hoistableStyles, o = a.get(e);
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
			case "script": return t = n.async, n = n.src, typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = Pf(n), n = yt(i).hoistableScripts, r = n.get(t), r || (r = {
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
		return "href=\"" + Rt(e) + "\"";
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
		}), Pd(t, "link", n), bt(t), e.head.appendChild(t));
	}
	function Pf(e) {
		return "[src=\"" + Rt(e) + "\"]";
	}
	function Ff(e) {
		return "script[async]" + e;
	}
	function If(e, t, n) {
		if (t.count++, t.instance === null) switch (t.type) {
			case "style":
				var r = e.querySelector("style[data-href~=\"" + Rt(n.href) + "\"]");
				if (r) return t.instance = r, bt(r), r;
				var i = h({}, n, {
					"data-href": n.href,
					"data-precedence": n.precedence,
					href: null,
					precedence: null
				});
				return r = (e.ownerDocument || e).createElement("style"), bt(r), Pd(r, "style", i), Lf(r, n.precedence, e), t.instance = r;
			case "stylesheet":
				i = Af(n.href);
				var a = e.querySelector(jf(i));
				if (a) return t.state.loading |= 4, t.instance = a, bt(a), a;
				r = Mf(n), (i = mf.get(i)) && Rf(r, i), a = (e.ownerDocument || e).createElement("link"), bt(a);
				var o = a;
				return o._p = new Promise(function(e, t) {
					o.onload = e, o.onerror = t;
				}), Pd(a, "link", r), t.state.loading |= 4, Lf(a, n.precedence, e), t.instance = a;
			case "script": return a = Pf(n.src), (i = e.querySelector(Ff(a))) ? (t.instance = i, bt(i), i) : (r = n, (i = mf.get(a)) && (r = h({}, n), zf(r, i)), e = e.ownerDocument || e, i = e.createElement("script"), bt(i), Pd(i, "link", r), e.head.appendChild(i), t.instance = i);
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
			if (!(a[mt] || a[st] || e === "link" && a.getAttribute("rel") === "stylesheet") && a.namespaceURI !== "http://www.w3.org/2000/svg") {
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
					t = a._p, typeof t == "object" && t && typeof t.then == "function" && (e.count++, e = Jf.bind(e), t.then(e, e)), n.state.loading |= 4, n.instance = a, bt(a);
					return;
				}
				a = t.ownerDocument || t, r = Mf(r), (i = mf.get(i)) && Rf(r, i), a = a.createElement("link"), bt(a);
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
		_currentValue: N,
		_currentValue2: N,
		_threadCount: 0
	};
	function $f(e, t, n, r, i, a, o, s, c) {
		this.tag = 1, this.containerInfo = e, this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null, this.callbackPriority = 0, this.expirationTimes = Xe(-1), this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Xe(0), this.hiddenUpdates = Xe(null), this.identifierPrefix = r, this.onUncaughtError = i, this.onCaughtError = a, this.onRecoverableError = o, this.pooledCache = null, this.pooledCacheLanes = 0, this.formState = c, this.incompleteTransitions = /* @__PURE__ */ new Map();
	}
	function ep(e, t, n, r, i, a, o, s, c, l, u, d) {
		return e = new $f(e, t, n, o, c, l, u, d, s), t = 1, !0 === a && (t |= 24), a = ci(3, null, null, t), e.current = a, a.stateNode = e, t = sa(), t.refCount++, e.pooledCache = t, t.refCount++, a.memoizedState = {
			element: r,
			isDehydrated: n,
			cache: t
		}, Ba(a), e;
	}
	function tp(e) {
		return e ? (e = oi, e) : oi;
	}
	function np(e, t, n, r, i, a) {
		i = tp(i), r.context === null ? r.context = i : r.pendingContext = i, r = Ha(t), r.payload = { element: n }, a = a === void 0 ? null : a, a !== null && (r.callback = a), n = Ua(e, r, t), n !== null && (hu(n, e, t), Wa(n, e, t));
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
			var t = ri(e, 67108864);
			t !== null && hu(t, e, 67108864), ip(e, 67108864);
		}
	}
	function op(e) {
		if (e.tag === 13 || e.tag === 31) {
			var t = pu();
			t = nt(t);
			var n = ri(e, t);
			n !== null && hu(n, e, t), ip(e, t);
		}
	}
	var sp = !0;
	function cp(e, t, n, r) {
		var i = j.T;
		j.T = null;
		var a = M.p;
		try {
			M.p = 2, up(e, t, n, r);
		} finally {
			M.p = a, j.T = i;
		}
	}
	function lp(e, t, n, r) {
		var i = j.T;
		j.T = null;
		var a = M.p;
		try {
			M.p = 8, up(e, t, n, r);
		} finally {
			M.p = a, j.T = i;
		}
	}
	function up(e, t, n, r) {
		if (sp) {
			var i = dp(r);
			if (i === null) wd(e, t, r, fp, n), Cp(e, r);
			else if (Tp(i, e, t, n, r)) r.stopPropagation();
			else if (Cp(e, r), t & 4 && -1 < Sp.indexOf(e)) {
				for (; i !== null;) {
					var a = _t(i);
					if (a !== null) switch (a.tag) {
						case 3:
							if (a = a.stateNode, a.current.memoizedState.isDehydrated) {
								var o = Ge(a.pendingLanes);
								if (o !== 0) {
									var s = a;
									for (s.pendingLanes |= 2, s.entangledLanes |= 2; o;) {
										var c = 1 << 31 - Re(o);
										s.entanglements[1] |= c, o &= ~c;
									}
									rd(a), !(G & 6) && (tu = Ee() + 500, id(0, !1));
								}
							}
							break;
						case 31:
						case 13: s = ri(a, 2), s !== null && hu(s, a, 2), bu(), ip(a, 2);
					}
					if (a = dp(r), a === null && wd(e, t, r, fp, n), a === i) break;
					i = a;
				}
				i !== null && r.stopPropagation();
			} else wd(e, t, r, null, n);
		}
	}
	function dp(e) {
		return e = tn(e), pp(e);
	}
	var fp = null;
	function pp(e) {
		if (fp = null, e = gt(e), e !== null) {
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
			case "message": switch (De()) {
				case Oe: return 2;
				case ke: return 8;
				case Ae:
				case je: return 32;
				case Me: return 268435456;
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
		}, t !== null && (t = _t(t), t !== null && ap(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
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
		var t = gt(e.target);
		if (t !== null) {
			var n = l(t);
			if (n !== null) {
				if (t = n.tag, t === 13) {
					if (t = u(n), t !== null) {
						e.blockedOn = t, at(e.priority, function() {
							op(n);
						});
						return;
					}
				} else if (t === 31) {
					if (t = d(n), t !== null) {
						e.blockedOn = t, at(e.priority, function() {
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
				en = r, n.target.dispatchEvent(r), en = null;
			} else return t = _t(n), t !== null && ap(t), e.blockedOn = n, !1;
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
				var a = _t(n);
				a !== null && (e.splice(t, 3), t -= 3, Ts(a, {
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
			var i = n[r], a = n[r + 1], o = i[ct] || null;
			if (typeof a == "function") o || Mp(n);
			else if (o) {
				var s = null;
				if (a && a.hasAttribute("formAction")) {
					if (i = a, o = a[ct] || null) s = o.formAction;
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
			np(e.current, 2, null, e, null, null), bu(), t[lt] = null;
		}
	};
	function Ip(e) {
		this._internalRoot = e;
	}
	Ip.prototype.unstable_scheduleHydration = function(e) {
		if (e) {
			var t = it();
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
	M.findDOMNode = function(e) {
		var t = e._reactInternals;
		if (t === void 0) throw typeof e.render == "function" ? Error(s(188)) : (e = Object.keys(e).join(","), Error(s(268, e)));
		return e = p(t), e = e === null ? null : m(e), e = e === null ? null : e.stateNode, e;
	};
	var Rp = {
		bundleType: 0,
		version: "19.2.7",
		rendererPackageName: "react-dom",
		currentDispatcherRef: j,
		reconcilerVersion: "19.2.7"
	};
	if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
		var zp = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		if (!zp.isDisabled && zp.supportsFiber) try {
			Fe = zp.inject(Rp), Ie = zp;
		} catch {}
	}
	e.createRoot = function(e, t) {
		if (!c(e)) throw Error(s(299));
		var n = !1, r = "", i = Js, a = Ys, o = Xs;
		return t != null && (!0 === t.unstable_strictMode && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onUncaughtError !== void 0 && (i = t.onUncaughtError), t.onCaughtError !== void 0 && (a = t.onCaughtError), t.onRecoverableError !== void 0 && (o = t.onRecoverableError)), t = ep(e, 1, !1, null, null, n, r, null, i, a, o, Pp), e[lt] = t.current, Sd(e), new Fp(t);
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
		children: /* @__PURE__ */ (0, g.jsx)("div", { className: "pcard__back-pattern" })
	});
	let w = m(e.suit), T = d[e.suit], E = _ ?? `${e.rank} of ${f[e.suit]}`, D = `pcard--suit-${e.suit}`, O = /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
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
	] });
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
function ee(e) {
	return e === "lg" ? 96 : e === "md" ? 72 : 52;
}
//#endregion
//#region src/components/Hand.tsx
var k = (e) => T(e);
function A({ card: e, index: t, size: n, state: r, badge: i, cardTestId: a, cardInteraction: o, onCardClick: s, onCardPeek: c, peekActive: u, style: d }) {
	let [f, p] = (0, l.useState)(!1), m = o, h = m?.mode === "play", v = m?.mode === "draw-select", y = m?.mode === "peek", b = m?.isMyTurn === !0, x = !m?.legalPlayIndices || m.legalPlayIndices.includes(t), S = h && b && x && !m?.busy, C = m?.playingIndex === t, T = h && b && !x && !m?.busy && !C, E = v && r === "draw-selected", D = !!m?.busy || C || h && !b || v && !b, O = D || h && !x || v && !b, ee = w({
		disabled: D || !S && !v && !y && !T,
		mode: T ? "draw-select" : m?.mode ?? "none",
		onPlay: S ? () => m?.onPlayCard?.(t) : void 0,
		onSelect: v && b ? () => m?.onSelectCard?.(t) : T ? () => m?.onIllegalPlay?.(t) : void 0,
		onPeekStart: y ? () => c?.(t) : void 0,
		onPeekEnd: y ? () => c?.(null) : void 0,
		onPressChange: p
	}), k = !!m && (m?.mode !== "none" || T), A = h && b ? S ? a : "play-button-disabled" : a;
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: [
			"hand__slot",
			u ? "hand__slot--peek" : "",
			E ? "hand__slot--draw-selected" : ""
		].filter(Boolean).join(" "),
		style: d,
		"aria-selected": E ? !0 : void 0,
		"data-trick-play-origin-active": m?.playingIndex === t && m.trickPlayOriginPlayerId ? m.trickPlayOriginPlayerId : void 0,
		children: /* @__PURE__ */ (0, g.jsx)(_, {
			card: e,
			size: n,
			state: O && h && !T ? "disabled" : r,
			badge: i,
			onClick: !k && s ? () => s(e, t) : void 0,
			onPlayClick: k && S ? () => m?.onPlayCard?.(t) : void 0,
			pointerHandlers: k ? ee : void 0,
			pressed: f,
			playing: C,
			playable: S,
			illegalShake: m?.illegalShakeIndex === t,
			disabled: D && (h || v) && !T,
			"data-testid": A,
			"data-card-index": t,
			"data-playable": h ? S ? "true" : "false" : void 0
		})
	});
}
function te({ cards: e, size: t = "md", stateFor: n, badgeFor: r, onCardClick: i, onCardPeek: a, peekIndex: o = null, fan: s = !1, cardTestId: c, cardInteraction: u }) {
	let d = (0, l.useRef)(null);
	return (0, l.useLayoutEffect)(() => {
		if (!s || typeof window > "u") return;
		let n = d.current;
		if (!n) return;
		let r = ee(t), i = () => {
			let t = O(n.clientWidth, e.length, r);
			n.style.setProperty("--hand-fan-overlap", `${t}px`), n.style.setProperty("--hand-card-w", `${r}px`);
		}, a = new ResizeObserver(i);
		return a.observe(n), i(), () => a.disconnect();
	}, [
		s,
		e.length,
		t
	]), /* @__PURE__ */ (0, g.jsx)("div", {
		ref: d,
		className: `hand ${s ? "hand--fan" : ""} ${u ? "hand--pointer" : ""}`,
		style: s ? { "--hand-count": e.length } : void 0,
		children: e.map((e, l) => /* @__PURE__ */ (0, g.jsx)(A, {
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
			peekActive: o === l
		}, k(e)))
	});
}
//#endregion
//#region src/table/handUi.ts
function ne(e) {
	return {
		rank: e.rank,
		suit: e.suit
	};
}
function re(e, t) {
	if (t) return "Join window";
	switch (e) {
		case "draw": return "Draw round";
		case "play": return "Trick play";
		default: return "Waiting to deal";
	}
}
function ie(e) {
	return {
		spades: "Spades",
		hearts: "Hearts",
		diamonds: "Diamonds",
		clubs: "Clubs"
	}[e ?? ""] ?? e ?? "—";
}
function j(e) {
	return e === "draw" || e === "play";
}
function M(e, t) {
	if (!e) return null;
	let n = t.find((t) => t.playerId === e);
	return n ? n.isSelf ? "Your turn" : `${n.displayName}'s turn` : null;
}
//#endregion
//#region src/table/trickPlayFly.ts
var N = /* @__PURE__ */ new Map();
function ae(e) {
	return `${e.playerId}:${e.card.rank}:${e.card.suit}`;
}
function oe(e) {
	return document.querySelector(`[data-trick-play-origin-active="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin-active="${e}"]`) ?? document.querySelector(`[data-trick-play-origin="${e}"] .pcard`) ?? document.querySelector(`[data-trick-play-origin="${e}"]`);
}
function se(e) {
	let t = oe(e);
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return {
		left: n.left,
		top: n.top,
		width: n.width,
		height: n.height
	};
}
function P(e, t) {
	let n = se(e);
	return n && N.set(t, n), n;
}
function F(e, t, n) {
	let r = document.querySelector("[data-testid=\"hero-hand\"]")?.querySelectorAll(".hand__slot .pcard")[n];
	if (r) {
		let e = r.getBoundingClientRect(), n = {
			left: e.left,
			top: e.top,
			width: e.width,
			height: e.height
		};
		return N.set(t, n), n;
	}
	return P(e, t);
}
function I(e) {
	return N.get(e);
}
function ce(e, t, n) {
	let r = e.left + e.width / 2, i = e.top + e.height / 2, a = n.left + n.width / 2, o = n.top + n.height / 2;
	return {
		dx: r - a,
		dy: i - o
	};
}
function le() {
	N.clear();
}
//#endregion
//#region src/table/tableMicrointeractions.ts
var ue = {
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
}, de = {
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
function fe(e) {
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
function pe(e, t) {
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
var me = {
	shuffle: "./sounds/shuffle.mp3",
	trickWin: "./sounds/trick-win.mp3",
	bigWin: "./sounds/big-win.mp3"
}, he = null, L = null, ge = !1, _e = /* @__PURE__ */ new Map(), ve = /* @__PURE__ */ new Map();
function ye() {
	if (typeof window > "u") return null;
	try {
		let e = window.AudioContext ?? window.webkitAudioContext;
		return e ? (he || (he = new e(), L = he.createGain(), L.gain.value = .55, L.connect(he.destination)), he) : null;
	} catch {
		return null;
	}
}
async function be() {
	ge = !0;
	let e = ye();
	if (e) {
		if (e.state === "suspended") try {
			await e.resume();
		} catch {}
		Ce();
	}
}
function xe(e) {
	if (typeof window > "u") return null;
	try {
		let t = _e.get(e);
		return t || (t = new Audio(e), t.preload = "auto", _e.set(e, t)), t;
	} catch {
		return null;
	}
}
async function Se(e) {
	if (ve.has(e)) return ve.get(e) === !0;
	if (typeof window > "u") return !1;
	try {
		let t = (await fetch(e, { method: "HEAD" })).ok;
		return ve.set(e, t), t;
	} catch {
		return ve.set(e, !1), !1;
	}
}
async function Ce() {
	ge && await Promise.all(Object.values(me).map(async (e) => {
		if (!await Se(e)) return;
		let t = xe(e);
		if (t) try {
			t.load();
		} catch {}
	}));
}
async function we(e, t = .55) {
	if (!ge || !await Se(e)) return !1;
	let n = xe(e);
	if (!n) return !1;
	try {
		return n.volume = t, n.currentTime = 0, await n.play(), !0;
	} catch {
		return !1;
	}
}
function Te(e, t, n, r, i, a, o = "sine") {
	let s = e.createOscillator(), c = e.createGain();
	s.type = o, s.frequency.setValueAtTime(n, r), c.gain.setValueAtTime(1e-4, r), c.gain.exponentialRampToValueAtTime(a, r + .008), c.gain.exponentialRampToValueAtTime(1e-4, r + i), s.connect(c), c.connect(t), s.start(r), s.stop(r + i + .02);
}
function Ee(e, t, n, r, i) {
	let a = Math.max(256, Math.floor(e.sampleRate * r)), o = e.createBuffer(1, a, e.sampleRate), s = o.getChannelData(0);
	for (let e = 0; e < a; e += 1) s[e] = (Math.random() * 2 - 1) * (1 - e / a);
	let c = e.createBufferSource();
	c.buffer = o;
	let l = e.createBiquadFilter();
	l.type = "bandpass", l.frequency.value = 1400, l.Q.value = .6;
	let u = e.createGain();
	u.gain.setValueAtTime(i, n), u.gain.exponentialRampToValueAtTime(1e-4, n + r), c.connect(l), l.connect(u), u.connect(t), c.start(n), c.stop(n + r + .01);
}
function De() {
	let e = ye();
	if (!e || !L) return;
	let t = e.currentTime;
	for (let n of [
		0,
		.06,
		.12,
		.2,
		.28
	]) Ee(e, L, t + n, .05, .08 + Math.random() * .04);
}
function Oe() {
	let e = ye();
	if (!e || !L) return;
	let t = e.currentTime;
	Te(e, L, 880, t, .12, .09, "sine"), Te(e, L, 1174.66, t + .07, .16, .07, "triangle"), Te(e, L, 1760, t + .14, .1, .04, "sine");
}
function ke() {
	let e = ye();
	if (!e || !L) return;
	let t = e.currentTime;
	Te(e, L, 659.25, t, .14, .08, "sine"), Te(e, L, 830.61, t + .1, .18, .09, "triangle"), Te(e, L, 987.77, t + .22, .22, .1, "sine"), Te(e, L, 1318.51, t + .34, .28, .06, "triangle");
}
async function Ae(e, t, n, r) {
	if (!n.current) {
		n.current = !0;
		try {
			await we(e) || ge && t();
		} catch {} finally {
			window.setTimeout(() => {
				n.current = !1;
			}, r);
		}
	}
}
var je = { current: !1 }, Me = { current: !1 }, Ne = { current: !1 };
function Pe() {
	Ae(me.shuffle, De, je, 360);
}
function Fe() {
	Ae(me.trickWin, Oe, Me, 320);
}
function Ie() {
	Ae(me.bigWin, ke, Ne, 580);
}
function Le() {
	return typeof window < "u" && !!(window.AudioContext ?? window.webkitAudioContext ?? typeof Audio < "u");
}
//#endregion
//#region src/table/feedback/haptics.ts
function Re() {
	return typeof navigator < "u" && typeof navigator.vibrate == "function";
}
function ze(e) {
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
var Be = {
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
function Ve(e) {
	try {
		return ze(e) ? !0 : Re() ? navigator.vibrate(Be[e]) ?? !1 : !1;
	} catch {
		return !1;
	}
}
function He() {
	return Re() || !!(typeof window < "u" && window.BourreHaptics);
}
//#endregion
//#region src/table/feedback/prefs.ts
var Ue = "nbl-feedback", We = {
	soundEnabled: !0,
	hapticsMode: "on"
};
function Ge(e) {
	if (!e || typeof e != "object") return { ...We };
	let t = e, n = t.hapticsMode, r = n === "off" || n === "minimal" || n === "on" ? n : t.hapticsEnabled === !1 ? "off" : "on";
	return {
		soundEnabled: t.soundEnabled !== !1,
		hapticsMode: r
	};
}
function Ke() {
	try {
		let e = localStorage.getItem(Ue);
		return e ? Ge(JSON.parse(e)) : { ...We };
	} catch {
		return { ...We };
	}
}
function qe(e) {
	let t = {
		...Ke(),
		...e
	};
	try {
		localStorage.setItem(Ue, JSON.stringify(t));
	} catch {}
	return Xe(t), t;
}
var Je = /* @__PURE__ */ new Set();
function Ye(e) {
	return Je.add(e), () => Je.delete(e);
}
function Xe(e) {
	for (let t of Je) t(e);
}
function Ze() {
	return typeof window > "u" || !window.matchMedia ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
function Qe(e, t) {
	return !(e === "off" || e === "minimal" && t === "light" || Ze() && t === "light");
}
var $e = 700, et = 450, tt = 1200, nt = 280, rt = 0, it = 0, at = 0, ot = 0, st = null, ct = !1;
function lt() {
	return Ke();
}
function ut(e) {
	Qe(lt().hapticsMode, e) && Ve(e);
}
function dt() {
	if (ct || typeof window > "u") return;
	ct = !0;
	let e = () => {
		be();
	};
	window.addEventListener("pointerdown", e, {
		once: !0,
		passive: !0
	}), window.addEventListener("keydown", e, { once: !0 });
}
function ft(e = {}) {
	let t = lt();
	if (Date.now() - rt < $e) return;
	st &&= (clearTimeout(st), null);
	let n = e.delayMs ?? (Ze() ? 0 : 40);
	st = window.setTimeout(() => {
		st = null, rt = Date.now(), t.soundEnabled && Pe(), ut("light");
	}, n);
}
function pt() {
	let e = lt(), t = Date.now();
	t - it < et || (it = t, e.soundEnabled && Fe(), ut("medium"));
}
function mt() {
	let e = lt(), t = Date.now();
	t - at < tt || (at = t, e.soundEnabled && Ie(), ut("strong"));
}
function ht() {
	let e = Date.now();
	e - ot < nt || (ot = e, ut("light"));
}
function gt() {
	ut("light");
}
//#endregion
//#region src/table/theme/settings.ts
var _t = "nbl-table-settings", vt = {
	focusTable: "F",
	toggleSettings: ",",
	standPat: "P",
	nextTable: "Tab"
}, yt = {
	themeId: "night-felt",
	deckMode: "classic",
	cardScale: "md",
	highContrast: !1,
	tableScale: 1,
	layoutMode: "single",
	hotkeys: { ...vt }
}, bt = {
	carbon: "Carbon",
	simple: "Simple",
	"night-felt": "Night Felt",
	arena: "Arena"
};
function xt(e) {
	return Math.max(.85, Math.min(1.35, e));
}
function St() {
	try {
		let e = localStorage.getItem(_t);
		if (!e) return {
			...yt,
			hotkeys: { ...vt }
		};
		let t = JSON.parse(e);
		return {
			...yt,
			...t,
			tableScale: xt(t.tableScale ?? yt.tableScale),
			hotkeys: {
				...vt,
				...t.hotkeys
			}
		};
	} catch {
		return {
			...yt,
			hotkeys: { ...vt }
		};
	}
}
function Ct(e) {
	try {
		localStorage.setItem(_t, JSON.stringify(e));
	} catch {}
}
function wt(e, t) {
	e.dataset.tableTheme = t.themeId, e.dataset.deckMode = t.deckMode, e.dataset.cardScale = t.cardScale, e.dataset.highContrast = t.highContrast ? "true" : "false", e.dataset.layoutMode = t.layoutMode, e.style.setProperty("--table-scale", String(t.tableScale));
}
//#endregion
//#region src/table/theme/TableThemeContext.tsx
var Tt = (0, l.createContext)(null);
function Et({ settings: e, children: t }) {
	let n = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		n.current && wt(n.current, e);
	}, [e]), /* @__PURE__ */ (0, g.jsx)("div", {
		ref: n,
		className: "btable-room",
		children: t
	});
}
function Dt({ children: e }) {
	let [t, n] = (0, l.useState)(() => St()), r = (0, l.useCallback)((e) => {
		n((t) => {
			let n = {
				...t,
				...e,
				hotkeys: {
					...t.hotkeys,
					...e.hotkeys
				}
			};
			return Ct(n), n;
		});
	}, []), i = (0, l.useCallback)(() => {
		let e = {
			...yt,
			hotkeys: { ...yt.hotkeys }
		};
		Ct(e), n(e);
	}, []), a = (0, l.useMemo)(() => ({
		settings: t,
		updateSettings: r,
		resetSettings: i
	}), [
		t,
		r,
		i
	]);
	return /* @__PURE__ */ (0, g.jsx)(Tt.Provider, {
		value: a,
		children: /* @__PURE__ */ (0, g.jsx)(Et, {
			settings: t,
			children: e
		})
	});
}
//#endregion
//#region src/table/theme/useTableTheme.ts
function Ot() {
	let e = (0, l.useContext)(Tt);
	if (!e) throw Error("useTableTheme must be used within TableThemeProvider");
	return e;
}
//#endregion
//#region src/table/HeroHand.tsx
function kt({ cards: e, phase: t, enrollmentActive: n = !1, isInHand: r = !1, isDealer: i = !1, signedIn: a = !1, isMyTurn: o = !1, drawCompleted: s = !1, maxDrawDiscards: c = 4, legalPlayIndices: u, handComplete: d = !1, actionFeedback: f, onSubmitDraw: p, onPassDraw: m, onPlayCard: h, privateHandReady: _ = !1, className: v = "", dealStaggerMs: y = 120, drawAnimSubPhase: b = null, currentUserId: x = null }) {
	let { settings: S } = Ot(), [C, w] = (0, l.useState)(/* @__PURE__ */ new Set()), [T, E] = (0, l.useState)(null), [D, O] = (0, l.useState)(null), [ee, k] = (0, l.useState)(null), [A, ie] = (0, l.useState)(!1), [M, N] = (0, l.useState)(null), [oe, se] = (0, l.useState)(null), [P, I] = (0, l.useState)(!1), ce = (0, l.useRef)(/* @__PURE__ */ new Set()), le = (0, l.useRef)(!1), de = j(t), fe = (0, l.useMemo)(() => e.map(ne), [e]);
	(0, l.useEffect)(() => {
		if (!de || e.length === 0) return;
		let t = new Set(e.map((e) => `${e.rank}-${e.suit}`)), n = ce.current, r = [...t].some((e) => !n.has(e));
		if (ce.current = t, !r || n.size > 0) return;
		I(!0), O(null), E(null);
		let i = window.setTimeout(() => I(!1), 520);
		return () => window.clearTimeout(i);
	}, [e, de]), (0, l.useEffect)(() => {
		(f?.status === "success" || f?.status === "error") && (O(null), le.current = !1);
	}, [f?.status]);
	let pe = t === "draw", me = t === "play", he = S.cardScale === "lg" ? "md" : "sm", L = A || f?.status === "loading" || D !== null, ge = f?.status === "error" ? f.message : M, _e = (0, l.useCallback)((e) => {
		L || (N(null), w((t) => {
			let n = new Set(t);
			return n.has(e) ? n.delete(e) : n.size < c ? n.add(e) : N(`You may discard at most ${c} cards`), n;
		}));
	}, [L, c]), ve = (0, l.useCallback)(async (e) => {
		if (le.current || L || !h) return;
		if (u && !u.includes(e)) {
			ht(), se(e), window.setTimeout(() => se(null), ue.illegalShake), N("That card can't be played now");
			return;
		}
		le.current = !0, E(e), O(e), N(null);
		let t = fe[e];
		x && t && F(x, ae({
			playerId: x,
			card: {
				rank: String(t.rank),
				suit: String(t.suit)
			}
		}), e);
		try {
			await Promise.resolve(h(e)), O(null), le.current = !1;
		} catch (e) {
			N(e instanceof Error ? e.message : "Could not play card"), O(null), le.current = !1;
		}
	}, [
		L,
		u,
		h,
		x,
		fe
	]), ye = (0, l.useCallback)(async (e) => {
		if (!(!p || L)) {
			if (e.length > c) {
				N(`You may discard at most ${c} cards`);
				return;
			}
			ie(!0), N(null);
			try {
				await p(e), w(/* @__PURE__ */ new Set());
			} catch (e) {
				N(e instanceof Error ? e.message : "Draw failed");
			} finally {
				ie(!1);
			}
		}
	}, [
		p,
		L,
		c
	]), be = (0, l.useCallback)(async () => {
		if (!(!m || L)) {
			ie(!0), N(null);
			try {
				await m(), w(/* @__PURE__ */ new Set());
			} catch (e) {
				N(e instanceof Error ? e.message : "Could not stand pat");
			} finally {
				ie(!1);
			}
		}
	}, [m, L]), xe = (0, l.useCallback)((e) => {
		ht(), se(e), window.setTimeout(() => se(null), ue.illegalShake), N("That card can't be played now");
	}, []);
	if (!a) return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: `btable-hero ${v}`.trim(),
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__label muted small",
			children: "Your hand"
		}), /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "Sign in to see your dealt cards."
		})]
	});
	if (!r && !n && !de) return null;
	if (de && r && e.length === 0) return d ? n ? null : /* @__PURE__ */ (0, g.jsxs)("div", {
		className: `btable-hero ${v}`.trim(),
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__label muted small",
			children: "Your hand"
		}), /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__hint muted small",
			children: "Hand complete — settling and opening the next deal…"
		})]
	}) : /* @__PURE__ */ (0, g.jsxs)("div", {
		className: `btable-hero ${v}`.trim(),
		"aria-live": "polite",
		children: [/* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__label muted small",
			children: "Your hand"
		}), /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: _ ? "Cards not available — leave and re-open the session, or refresh the page." : "Loading your cards…"
		})]
	});
	if (de && !r) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: `btable-hero ${v}`.trim(),
		children: /* @__PURE__ */ (0, g.jsx)("p", {
			className: "btable-hero__fallback muted small",
			children: "You sat out this hand."
		})
	});
	if (e.length === 0 && !i) return null;
	let Se = (e, t) => D === t ? "selected" : pe && C.has(t) ? "draw-selected" : me && T === t ? "selected" : me && !o ? "disabled" : me && u && !u.includes(t) ? "muted" : "default", Ce = de && r && !(me && o), we = "none";
	me && o ? we = "play" : pe && o && !s ? we = "draw-select" : Ce && (we = "peek");
	let Te = C.size;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: [
			`btable-hero btable-hero--scale-${S.cardScale}`,
			P ? "btable-hero--dealing" : "",
			pe && o && !s ? "btable-hero--draw-select" : "",
			b === "discard" ? "btable-hero--draw-discard" : "",
			b === "receive" ? "btable-hero--draw-receive" : "",
			v
		].filter(Boolean).join(" "),
		style: { "--deal-card-stagger-ms": `${y}ms` },
		"data-testid": "hero-hand",
		"aria-label": "Your dealt cards",
		children: [
			/* @__PURE__ */ (0, g.jsxs)("p", {
				className: "btable-hero__label muted small",
				children: [
					"Your hand · ",
					re(t, n),
					pe && !s && o && " · tap cards to discard",
					me && o && " · click or flick a legal card to play",
					Ce && " · press and hold to peek"
				]
			}),
			i && pe && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-hero__trump-note muted small",
				children: "Your trump upcard is on the table — not duplicated here"
			}),
			/* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-hero__hand-3d",
				"data-trick-play-origin": x ?? void 0,
				children: /* @__PURE__ */ (0, g.jsx)(te, {
					cards: fe,
					size: he,
					fan: !0,
					stateFor: Se,
					peekIndex: ee,
					onCardPeek: Ce ? k : void 0,
					cardTestId: me && o ? "play-button" : void 0,
					cardInteraction: {
						mode: we,
						isMyTurn: o,
						legalPlayIndices: u,
						playingIndex: D,
						illegalShakeIndex: oe,
						busy: L,
						trickPlayOriginPlayerId: x,
						onPlayCard: ve,
						onSelectCard: _e,
						onIllegalPlay: xe,
						onPeek: k
					}
				})
			}),
			ge && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-hero__error",
				role: "alert",
				children: ge
			}),
			f?.status === "success" && f.message && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-hero__success muted small",
				role: "status",
				children: f.message
			}),
			pe && !s && o && /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btable-hero__actions",
				children: [
					/* @__PURE__ */ (0, g.jsx)("button", {
						type: "button",
						className: "btn btn--sm btn--primary",
						"data-testid": "draw-button",
						disabled: L,
						"aria-busy": L,
						onClick: () => ye([...C].sort((e, t) => e - t)),
						children: L ? "Drawing…" : `Draw${Te > 0 ? ` (${Te})` : ""}`
					}),
					/* @__PURE__ */ (0, g.jsx)("button", {
						type: "button",
						className: "btn btn--sm",
						"data-testid": "pass-draw-button",
						disabled: L,
						onClick: () => be(),
						children: "Stand pat"
					}),
					/* @__PURE__ */ (0, g.jsxs)("span", {
						className: "muted small",
						children: [
							Te,
							"/",
							c,
							" selected"
						]
					})
				]
			}),
			pe && s && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-hero__hint muted small",
				children: "Draw complete — waiting for others"
			}),
			pe && !s && !o && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-hero__hint muted small",
				children: "Waiting for your turn to draw"
			}),
			me && !o && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-hero__hint muted small",
				children: "Waiting for your turn to play"
			})
		]
	});
}
//#endregion
//#region src/table/logic.ts
function At(e, t) {
	return t.reduce((t, n) => t + (e[n] || 0), 0);
}
function jt(e, t) {
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
function R(e) {
	return `$${e.toLocaleString("en-US")}`;
}
function Mt(e) {
	let t = Number(e) || 0;
	return t > 0 ? `+${R(t)}` : t < 0 ? `−${R(Math.abs(t))}` : R(0);
}
function Nt(e) {
	return R(Math.max(0, Number(e) || 0));
}
function Pt(e) {
	return (e || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((e) => e[0]?.toUpperCase() || "").join("") || "?";
}
function Ft(e) {
	let t = Math.max(2, Math.min(8, e || 2));
	return t >= 7 ? {
		rx: 42,
		ry: 40,
		outset: 4
	} : t >= 5 ? {
		rx: 44,
		ry: 42,
		outset: 4
	} : t <= 4 ? {
		rx: 48,
		ry: 46,
		outset: 6
	} : {
		rx: 46,
		ry: 44,
		outset: 5
	};
}
function It(e) {
	let t = (e * 180 / Math.PI % 360 + 360) % 360;
	return t >= 55 && t <= 125 ? "bottom" : t >= 235 && t <= 305 ? "left" : t >= 145 && t <= 215 ? "top" : "right";
}
function Lt(e, t) {
	let n = Math.max(2, Math.min(8, t || 2));
	if (n <= 0) return {
		x: 50,
		y: 50,
		region: "bottom"
	};
	let { rx: r, ry: i, outset: a } = Ft(n), o = -(e / n * Math.PI * 2) + Math.PI / 2, s = Math.cos(o), c = Math.sin(o);
	return {
		x: 50 + r * s + s * a,
		y: 50 + i * c + c * a,
		region: It(o)
	};
}
function Rt(e) {
	let t = Math.max(2, Math.min(8, e || 2));
	return t === 2 ? 1.04 : t === 3 ? .94 : t === 4 ? .98 : t === 5 ? 1.08 : t === 6 ? 1.12 : t === 7 ? 1.16 : 1.2;
}
//#endregion
//#region src/table/TrickPlaySlot.tsx
function zt({ play: e, index: t, presentationPhase: n, displayCount: r, playerName: i, winnerPlayerId: a = null }) {
	let o = (0, l.useRef)(null), [s, c] = (0, l.useState)(null), [u, d] = (0, l.useState)(!1), f = a != null && e.playerId === a, p = t === r - 1 && n === "live", m = f && n !== "live" && n !== "trickComplete";
	(0, l.useLayoutEffect)(() => {
		if (!p || typeof document > "u") {
			d(!0), c(null);
			return;
		}
		let t = o.current;
		if (!t) return;
		let n = t.querySelector(".pcard");
		if (!n) return;
		let r = I(ae(e)) ?? se(e.playerId);
		if (d(!0), !r) {
			c(null);
			return;
		}
		let i = n.getBoundingClientRect(), { dx: a, dy: s } = ce(r, t.getBoundingClientRect(), i);
		c({
			"--fly-dx": `${a}px`,
			"--fly-dy": `${s}px`
		});
	}, [p, e]);
	let h = p && u && s != null;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: o,
		className: [
			"btrick__play",
			h ? "btrick__play--fly-from-hand" : "",
			p && !u ? "btrick__play--fly-pending" : "",
			f && m ? "btrick__play--winner" : ""
		].filter(Boolean).join(" "),
		style: h ? s ?? void 0 : void 0,
		children: [/* @__PURE__ */ (0, g.jsx)(_, {
			card: ne(e.card),
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
function Bt({ displayPlays: e = [], winnerPlayerId: t = null, showWinnerTag: n = !1, presentationPhase: r = "live", playerNames: i = {} }) {
	if (e.length === 0) return /* @__PURE__ */ (0, g.jsx)("div", {
		className: "btrick btrick--empty muted small",
		"aria-hidden": "true",
		"data-testid": "trick-row",
		"data-trick-phase": r,
		"data-trick-card-count": "0",
		children: "Trick"
	});
	let a = t ? i[t] ?? "Player" : null;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: [
			"btrick",
			r === "trickComplete" || r === "winnerReveal" ? "btrick--hold" : "",
			r === "collectTrick" ? "btrick--sweep" : ""
		].filter(Boolean).join(" "),
		"aria-label": "Current trick",
		"aria-live": "polite",
		"data-testid": "trick-row",
		"data-trick-phase": r,
		"data-trick-card-count": e.length,
		children: [n && a && /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "btrick__winner-tag",
			"data-testid": "trick-winner-tag",
			children: [a, " takes it"]
		}), e.map((n, a) => /* @__PURE__ */ (0, g.jsx)(zt, {
			play: n,
			index: a,
			presentationPhase: r,
			displayCount: e.length,
			playerName: i[n.playerId] ?? "Player",
			winnerPlayerId: t
		}, `${n.playerId}-${n.card.rank}-${n.card.suit}-${a}`))]
	});
}
//#endregion
//#region src/table/PotCenter.tsx
function Vt({ potMetrics: e, participantCount: t, trumpUpcard: n, trumpSuit: r, phase: i, enrollmentActive: a = !1, remainingDeckCount: o, trickDisplayPlays: s = [], trickWinnerPlayerId: c = null, trickShowWinnerTag: l = !1, trickPresentationPhase: u = "live", playerNames: f = {}, anteAnimActive: p = !1, trumpRevealActive: m = !1, drawAnimPlayerId: h = null, drawAnimSubPhase: v = "done", drawDiscardCount: y = 0, settleAnimActive: b = !1, settleCarryOver: x = !1, potTick: S = 0, trumpReminderPulse: C = 0 }) {
	let w = re(i, a), T = !!n, E = !T && !!r && i === "play", D = T ? `${n.rank}-${n.suit}` : "none";
	return /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [/* @__PURE__ */ (0, g.jsxs)("div", {
		className: "deck-stack",
		"aria-label": "Deck and trump",
		children: [T ? /* @__PURE__ */ (0, g.jsxs)("div", {
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
		}, D) : E ? /* @__PURE__ */ (0, g.jsxs)("div", {
			className: [
				"deck-stack__trump",
				"deck-stack__trump--suit-reminder",
				C > 0 ? "deck-stack__trump--suit-reminder-pulse" : ""
			].filter(Boolean).join(" "),
			"data-testid": "trump-suit-reminder",
			"aria-label": `Trump suit: ${ie(r)}`,
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
			x ? "center-play--carry" : ""
		].filter(Boolean).join(" "),
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
						children: w
					}),
					T && r && /* @__PURE__ */ (0, g.jsx)("span", {
						className: "center-play__trump-suit muted small",
						children: ie(r)
					}),
					E && /* @__PURE__ */ (0, g.jsxs)("span", {
						className: "center-play__trump-suit center-play__trump-suit--reminder muted small",
						children: [ie(r), " trump"]
					})
				]
			}),
			/* @__PURE__ */ (0, g.jsx)("div", {
				className: "center-play__trick",
				children: /* @__PURE__ */ (0, g.jsx)(Bt, {
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
						children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Pot" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: R(e.currentPot) })]
					}, S > 0 ? `pot-${S}` : "pot-static"),
					/* @__PURE__ */ (0, g.jsxs)("div", {
						className: "bpot__stat",
						"data-testid": "ante-display",
						children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Ante" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: R(e.anteAmount) })]
					}),
					e.limEnabled && /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [/* @__PURE__ */ (0, g.jsxs)("div", {
						className: "bpot__stat",
						children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Cap" }), /* @__PURE__ */ (0, g.jsxs)("dd", { children: [R(e.potCap), /* @__PURE__ */ (0, g.jsx)("span", {
							className: "bpot__lim-tag",
							children: "LmT"
						})] })]
					}), /* @__PURE__ */ (0, g.jsxs)("div", {
						className: "bpot__stat bpot__stat--highlight",
						children: [/* @__PURE__ */ (0, g.jsx)("dt", { children: "Max win" }), /* @__PURE__ */ (0, g.jsx)("dd", { children: R(e.maxWinThisHand) })]
					})] })
				]
			}),
			e.limEnabled && e.overflow > 0 && /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "center-play__carry muted small",
				children: [
					"+",
					R(e.overflow),
					" carry"
				]
			}),
			/* @__PURE__ */ (0, g.jsxs)("div", {
				className: "center-play__meta muted small",
				children: [t, " in hand"]
			})
		]
	})] });
}
//#endregion
//#region src/table/SmartHud.tsx
function Ht({ label: e, value: t, accent: n, title: r }) {
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
function Ut({ player: e, compact: t = !1 }) {
	let n = e.apeScore != null && !e.isRobot;
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		className: `bhud${t ? " bhud--compact" : ""}`,
		"aria-label": `${e.displayName} stats`,
		children: [n && /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
			/* @__PURE__ */ (0, g.jsx)(Ht, {
				label: "Ape",
				value: e.apeScore ?? 0,
				accent: !0,
				title: "Ape Score"
			}),
			e.apeClass && !t && /* @__PURE__ */ (0, g.jsx)(Ht, {
				label: "Class",
				value: e.apeClass,
				title: "Ape Class"
			}),
			e.apeStatus && !t && /* @__PURE__ */ (0, g.jsx)(Ht, {
				label: "Status",
				value: e.apeStatus,
				title: "Ape Status"
			})
		] }), e.sessionStreak != null && e.sessionStreak > 0 && /* @__PURE__ */ (0, g.jsx)(Ht, {
			label: "Streak",
			value: e.sessionStreak,
			title: "Hands won this session"
		})]
	});
}
//#endregion
//#region src/table/Seat.tsx
function Wt({ fraction: e }) {
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
function Gt({ player: e, region: t, style: n, onToggleInHand: r, onTrickDelta: i, onReaction: a }) {
	let [o, s] = (0, l.useState)(!1), c = (0, l.useCallback)(() => {
		typeof window > "u" || window.matchMedia("(hover: none), (pointer: coarse)").matches && s((e) => !e);
	}, []), u = e.tricksThisHand, d = Math.max(0, e.holeCardCount ?? 0), f = !!(e.showHoleCards && !e.isSelf && e.inHand && d > 0), p = e.bankroll != null, m = e.bourreAlert === "pulse", h = e.bourreAlert === "marker" || e.bourreAlert === "pulse";
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		"data-testid": e.isSelf ? "seat-bottom-self" : t === "top" ? "seat-top" : t === "left" ? "seat-left" : t === "right" ? "seat-right" : "seat-bottom",
		className: [
			"bseat",
			`bseat--${t}`,
			`player-${t}`,
			e.inHand ? "bseat--in-hand" : "",
			e.isSelf ? "bseat--self" : "",
			e.isLeading ? "bseat--leading" : "",
			e.isWinner ? "bseat--winner" : "",
			e.enrollmentOnClock ? "bseat--enroll-clock" : "",
			e.enrollmentSatOut ? "bseat--sat-out" : "",
			e.isOut ? "bseat--out" : "",
			e.isDealer ? "bseat--dealer" : "",
			e.isOnTurn ? "bseat--on-turn" : "",
			e.turnHandoff ? "bseat--turn-handoff" : "",
			e.isTrickCapture ? "bseat--trick-capture" : "",
			e.winnerFlash ? "bseat--winner-flash" : "",
			e.enrollmentPulse === "join" ? "bseat--enroll-join" : "",
			e.enrollmentPulse === "pass" ? "bseat--enroll-pass" : "",
			e.drawAnimSubPhase === "discard" ? "bseat--draw-discard" : "",
			e.drawAnimSubPhase === "receive" ? "bseat--draw-receive" : "",
			m ? "bseat--bourre-pulse" : "",
			h ? "bseat--bourre" : "",
			e.bankrollTick === "up" ? "bseat--bankroll-up" : "",
			e.bankrollTick === "down" ? "bseat--bankroll-down" : ""
		].filter(Boolean).join(" "),
		style: n,
		children: [/* @__PURE__ */ (0, g.jsxs)("div", {
			className: "bseat__core",
			children: [f && /* @__PURE__ */ (0, g.jsx)("div", {
				className: "bseat__hole-cards",
				"aria-label": `${d} cards in hand`,
				"data-trick-play-origin": e.playerId,
				children: Array.from({ length: d }, (e, t) => /* @__PURE__ */ (0, g.jsx)("div", {
					className: "bseat__hole-card",
					style: { "--hole-i": t },
					children: /* @__PURE__ */ (0, g.jsx)(_, {
						faceDown: !0,
						size: "xs"
					})
				}, t))
			}), /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "bseat__avatar-stage",
				children: [
					/* @__PURE__ */ (0, g.jsxs)("div", {
						className: "bseat__avatar-stack",
						"data-trick-play-origin": !e.isSelf && e.inHand && !f ? e.playerId : void 0,
						children: [
							e.enrollmentOnClock && e.enrollmentTimeLeft != null && /* @__PURE__ */ (0, g.jsx)(Wt, { fraction: e.enrollmentTimeLeft }),
							h && /* @__PURE__ */ (0, g.jsx)("span", {
								className: "bseat__bourre-badge",
								"aria-label": "Bourré",
								title: "Bourré",
								children: "Bourré"
							}),
							/* @__PURE__ */ (0, g.jsxs)("div", {
								className: `bseat__avatar-wrap${o ? " bseat__avatar-wrap--peek" : ""}`,
								role: "button",
								tabIndex: 0,
								"aria-label": `${e.displayName} seat`,
								"aria-expanded": o,
								onClick: (e) => {
									e.stopPropagation(), c();
								},
								onKeyDown: (e) => {
									(e.key === "Enter" || e.key === " ") && (e.preventDefault(), c());
								},
								onBlur: () => s(!1),
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
										children: Pt(e.displayName)
									}),
									e.inHand && /* @__PURE__ */ (0, g.jsx)("span", {
										className: "bseat__in-badge",
										title: "In this hand"
									}),
									m && /* @__PURE__ */ (0, g.jsx)("span", {
										className: "bseat__bourre-ring",
										"aria-hidden": "true"
									})
								]
							})
						]
					}),
					p && /* @__PURE__ */ (0, g.jsx)("span", {
						className: `bseat__stack${e.isOut ? " bseat__stack--out" : ""}`,
						"aria-label": `Bankroll ${Nt(e.bankroll ?? 0)}`,
						title: `Stack ${Nt(e.bankroll ?? 0)}`,
						children: Nt(e.bankroll ?? 0)
					}),
					e.isSelf && a && /* @__PURE__ */ (0, g.jsx)("div", {
						className: "bseat__react-bar",
						children: [
							"👏",
							"😮",
							"🔥"
						].map((e) => /* @__PURE__ */ (0, g.jsx)("button", {
							type: "button",
							className: "bseat__react-btn",
							"aria-label": `React ${e}`,
							onClick: () => a(e),
							children: e
						}, e))
					})
				]
			})]
		}), /* @__PURE__ */ (0, g.jsxs)("div", {
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
							children: "Joined"
						})
					]
				}),
				/* @__PURE__ */ (0, g.jsx)(Ut, {
					player: e,
					compact: t === "left" || t === "right"
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
					onClick: r,
					children: "I'm in"
				}),
				e.canEditTricks && /* @__PURE__ */ (0, g.jsx)("div", {
					className: "bseat__controls",
					children: /* @__PURE__ */ (0, g.jsx)("button", {
						type: "button",
						className: "bseat__trick-btn bseat__trick-btn--plus",
						"aria-label": "Won a trick",
						disabled: u >= 5,
						onClick: () => i(1),
						children: "+"
					})
				})
			]
		})]
	});
}
//#endregion
//#region src/game/trick.ts
function Kt(e, t, n) {
	if (!e.length) throw Error("No plays in trick");
	let r = e.filter((e) => D(e.card, n));
	if (r.length) return r.reduce((e, t) => E(t.card) > E(e.card) ? t : e).playerId;
	let i = e.filter((e) => e.card.suit === t);
	return (i.length ? i : e).reduce((e, t) => E(t.card) > E(e.card) ? t : e).playerId;
}
var qt = 1600, Jt = 1800;
function Yt(e) {
	return e !== "live";
}
function Xt(e = !1) {
	let t = e ? .55 : 1;
	return {
		cardLandMs: Math.round(220 * t),
		postTrickReadMs: Math.round(qt * t),
		winnerRevealMs: Math.round(400 * t),
		trickSweepMs: Math.round(300 * t),
		nextLeadGapMs: Math.round(200 * t),
		trumpBeatReadMs: Math.round(Jt * t)
	};
}
function Zt(e) {
	let t = Xt(e.reducedMotion), n = e.trumpBeat ? t.trumpBeatReadMs : t.postTrickReadMs, r = Math.min(t.winnerRevealMs, n - 200), i = Math.max(200, n - r), a = t.trickSweepMs, o = t.nextLeadGapMs;
	return {
		readBeforeWinnerMs: i,
		winnerRevealMs: r,
		readTotalMs: n,
		sweepMs: a,
		nextLeadGapMs: o,
		pipelineMs: n + a + o
	};
}
function Qt(e, t, n) {
	for (let r of n) if ((t[r] ?? 0) > (e[r] ?? 0)) return r;
	return null;
}
function $t(e) {
	return e?.plays?.map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
}
function en(e) {
	let t = $t(e.prevTrick), n = e.playedCards?.filter((t) => t.trickNumber === e.trickNumber).map((e) => ({
		playerId: e.playerId,
		card: e.card
	})) ?? [];
	return n.length > t.length ? n : t;
}
function tn(e, t, n) {
	if (!e.length || !t || !n || t === n) return !1;
	let r = Kt(e.map((e) => ({
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
function nn(e) {
	let { prevTricks: t, nextTricks: n, participantIds: r, prevTrick: i, playedCards: a } = e, o = At(t, r), s = At(n, r);
	if (s <= o) return null;
	let c = Qt(t, n, r), l = i?.trickNumber ?? s, u = en({
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
function rn() {
	return typeof window > "u" ? !1 : window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
var an = 1e3, on = 12e3;
function sn(e = rn()) {
	let t = e ? .55 : 1, n = (e) => Math.max(80, Math.round(e * t));
	return {
		anteChipTravelMs: n(220),
		dealCardStaggerMs: n(120),
		dealFanMs: n(520),
		trumpRevealHoldMs: n(600),
		enrollmentSeatPulseMs: n(480),
		drawDiscardMs: n(180),
		drawReplaceMs: n(130),
		drawReadyBeatMs: n(500),
		settleHoldMs: n(an),
		nextHandResetMs: n(550),
		handResetMs: n(500)
	};
}
function cn(e, t, n = rn()) {
	let r = sn(n), i = Math.max(0, e), a = Math.max(0, t);
	return i === 0 && a === 0 ? Math.max(120, Math.round(r.drawDiscardMs * .6)) : i * r.drawDiscardMs + a * r.drawReplaceMs + 80;
}
//#endregion
//#region src/table/stageFit.ts
function ln(e, t, n) {
	let r = Number.isFinite(e) && e > 0 ? e : 0, i = r > 0 ? Math.max(t, r) : t;
	return {
		height: Math.max(i > 0 ? i : n, n),
		peak: i
	};
}
function un(e, t) {
	let n = Math.max(.75, e);
	return t.portrait ? Math.min(n, .98) : Math.min(n, 1.32);
}
function dn(e) {
	let t = Math.max(2, Math.min(8, e || 4));
	return t <= 3 ? .7 : t <= 4 ? .68 : t <= 5 ? .62 : .56;
}
function fn(e) {
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
function pn(e) {
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
function mn(e) {
	return {
		left: e.left,
		top: e.top,
		right: e.right,
		bottom: e.bottom,
		width: e.width,
		height: e.height
	};
}
function hn(e, t, n = 2) {
	return e.left >= t.left - n && e.top >= t.top - n && e.right <= t.right + n && e.bottom <= t.bottom + n;
}
//#endregion
//#region src/table/useMobileTable.ts
var gn = "(max-width: 900px), ((hover: none) and (pointer: coarse))";
function _n() {
	let [e, t] = (0, l.useState)(() => typeof window < "u" && window.matchMedia("(max-width: 900px), ((hover: none) and (pointer: coarse))").matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(gn), n = () => t(e.matches);
		return n(), e.addEventListener("change", n), () => e.removeEventListener("change", n);
	}, []), e;
}
//#endregion
//#region src/table/hooks/useStageFit.ts
function vn(e, t) {
	if (typeof window > "u") return t;
	let n = document.documentElement, r = getComputedStyle(n).getPropertyValue(e).trim(), i = parseFloat(r);
	return Number.isFinite(i) ? i : t;
}
function yn(e, t) {
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
function bn(e) {
	let t = e.closest(".btable-session")?.querySelector(".btable-desktop");
	if (!t) return null;
	let n = t.getBoundingClientRect();
	return n.width <= 0 || n.height <= 0 ? null : {
		width: n.width,
		height: n.height
	};
}
function xn(e, t) {
	let n = !!e.closest(".table-play-overlay");
	if (t && n) {
		let t = e.closest(".table-play-overlay__main");
		if (t) return t;
	}
	return e.closest(".btable-desktop__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function Sn({ aspect: e, enabled: t = !0, sessionKey: n }) {
	let r = (0, l.useRef)(null), i = (0, l.useRef)(0), a = (0, l.useRef)(n), { settings: o } = Ot(), s = _n();
	return (0, l.useLayoutEffect)(() => {
		if (!t || typeof window > "u") return;
		let c = r.current;
		if (!c) return;
		a.current !== n && (a.current = n, i.current = 0);
		let l = c.closest(".btable-desktop__viewport") ?? c.closest(".table-play-overlay__main") ?? c.closest(".btable-session"), u = window.visualViewport, d = () => {
			let t = !!c.closest(".table-play-overlay"), n = typeof window < "u" && window.matchMedia("(orientation: portrait)").matches, r = xn(c, s).getBoundingClientRect(), a = c.querySelector(".hand-panel")?.getBoundingClientRect(), l = t && s && n ? 100 : t && !s ? 120 : s ? 112 : 148, d = t && s && n || t && !s ? 200 : s ? 210 : 280, f = a?.height ?? 0, p = ln(f, i.current, l);
			i.current = p.peak;
			let m = Math.min(t && s && f > 0 ? Math.max(f, l) : p.height, d), h = s && t ? 12 : s ? 18 : t && !s ? 16 : 28, g = vn("--stage-fit-pad-x", s ? 8 : 16) + h, _ = vn("--stage-fit-pad-y", s ? 6 : 12) + h, v = vn("--stage-fit-gap", s ? 8 : 12), y = u, b = Math.min(r.width, y?.width ?? window.innerWidth), x = Math.min(r.height, y?.height ?? window.innerHeight);
			if (t && s) {
				let e = bn(c);
				if (e) b = e.width, x = e.height;
				else {
					let e = yn(c, s);
					x = Math.max(160, x - e);
				}
			}
			let S = Math.max(.85, Math.min(1.35, o.tableScale || 1)), C = t && s ? 1 : S, w = s ? un(e, { portrait: n }) : e, T = parseInt(getComputedStyle(c).getPropertyValue("--player-count").trim(), 10) || 4, E = t && s && !n, D = E ? {
				...fn({
					availWidth: b,
					availHeight: x,
					aspect: w,
					userScale: C,
					padX: g,
					padY: _,
					stageShare: dn(T)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : pn({
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
			let O = s || t, ee = O ? D.displayStageWidth : D.stageWidth, k = O ? D.displayStageHeight : D.stageHeight;
			if (t && s) {
				let e = Math.max(0, b - g * 2), t = E ? Math.max(0, x - _ * 2) : Math.max(120, x - _ * 2 - m - v);
				ee = Math.min(ee * S, e), k = Math.min(k * S, t);
			}
			let A = t && !s ? S : s ? 1 : D.effectiveScale;
			if (c.style.setProperty("--stage-fit-width", `${Math.round(ee)}px`), c.style.setProperty("--stage-fit-height", `${Math.round(k)}px`), c.style.setProperty("--stage-fit-scale", String(D.fitScale)), c.style.setProperty("--stage-effective-scale", String(A)), (c.closest(".btable-desktop__scale") ?? c.parentElement)?.style.setProperty("--stage-effective-scale", String(A)), localStorage.getItem("stageFitDebug") === "1") {
				let e = c.querySelector(".table-stage"), a = c.querySelectorAll(".bseat__avatar-wrap"), o = e ? mn(e.getBoundingClientRect()) : null, l = mn(document.documentElement.getBoundingClientRect()), u = [...a].filter((e) => !hn(mn(e.getBoundingClientRect()), l, 1)).length;
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
//#region src/table/CardTable.tsx
function Cn({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], privateHandReady: o = !1, currentUserId: s = null, legalPlayIndices: c, handComplete: l = !1, actionFeedback: u, trickPresentation: d, handPresentation: f, microinteractions: p, onToggleInHand: m, onTrickDelta: h, onSubmitDraw: _, onPassDraw: v, onPlayCard: y, onReaction: b }) {
	let x = [...t].sort((e, t) => e.isSelf ? -1 : t.isSelf ? 1 : e.displayName.localeCompare(t.displayName)), S = x.findIndex((e) => e.isSelf), C = S > 0 ? [...x.slice(S), ...x.slice(0, S)] : x, w = C.length, T = `btable--p${Math.min(8, Math.max(2, w))}`, E = Rt(w), D = Object.fromEntries(t.map((e) => [e.playerId, e.displayName])), O = sn(), ee = Sn({
		aspect: E,
		sessionKey: `${e.sessionId}:${e.handNumber}`
	}), k = t.map((e) => {
		let t = d.displayTricksByPlayer[e.playerId] ?? 0, n = d.trickWinnerSeatId === e.playerId, r = d.suppressTurnPlayerId || f.suppressTurnIndicator, i = d.phase === "collectTrick" && n, a = f.enrollmentPulse[e.playerId], o = f.animatingDrawPlayerId === e.playerId;
		return {
			...e,
			tricksThisHand: t,
			isOnTurn: r ? !1 : e.isOnTurn,
			isLeading: n && (d.phase === "winnerReveal" || d.phase === "collectTrick") ? !0 : r ? !1 : e.isLeading,
			isTrickCapture: i,
			enrollmentPulse: a,
			drawAnimSubPhase: o ? f.drawAnimSubPhase : null,
			drawDiscardCount: o ? f.drawDiscardCount : 0,
			drawReplaceCount: o ? f.drawReplaceCount : 0,
			turnHandoff: p.turnHandoffPlayerId === e.playerId,
			dealerMoved: p.dealerMovedPlayerId === e.playerId,
			winnerFlash: p.winnerFlashPlayerId === e.playerId,
			bankrollTick: p.bankrollTicks[e.playerId] ?? null,
			bourreAlert: p.bourreAlerts[e.playerId] ?? null
		};
	}), A = t.find((e) => e.isSelf), te = d.suppressTurnPlayerId || f.suppressTurnIndicator, ne = !!(s && e.drawCompletedIds?.includes(s));
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: ee,
		className: `btable-wrap btable-wrap--stage-fit ${T}`,
		"data-testid": "table-root",
		style: {
			"--player-count": w,
			"--table-aspect": E,
			"--trick-card-land-ms": "220ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": "300ms",
			"--deal-card-stagger-ms": `${O.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${O.drawDiscardMs}ms`,
			"--draw-replace-ms": `${O.drawReplaceMs}ms`
		},
		children: [/* @__PURE__ */ (0, g.jsx)("div", {
			className: "table-stage-fit",
			children: /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "table-stage",
				children: [
					/* @__PURE__ */ (0, g.jsxs)("div", {
						className: "table-oval",
						"aria-hidden": "true",
						children: [/* @__PURE__ */ (0, g.jsx)("div", { className: "btable__rail" }), /* @__PURE__ */ (0, g.jsx)("div", {
							className: "btable__felt",
							"data-testid": "table-felt"
						})]
					}),
					/* @__PURE__ */ (0, g.jsx)(Vt, {
						potMetrics: {
							...n,
							currentPot: f.displayPotAmount
						},
						participantCount: r,
						trumpUpcard: e.trumpUpcard,
						trumpSuit: e.trumpSuit,
						phase: e.phase,
						enrollmentActive: i,
						remainingDeckCount: e.remainingDeckCount,
						trickDisplayPlays: d.displayPlays,
						trickWinnerPlayerId: d.winnerPlayerId,
						trickShowWinnerTag: d.showWinnerTag,
						trickPresentationPhase: d.phase,
						playerNames: D,
						anteAnimActive: f.anteAnimActive,
						trumpRevealActive: f.trumpRevealActive,
						drawAnimPlayerId: f.animatingDrawPlayerId,
						drawAnimSubPhase: f.drawAnimSubPhase,
						drawDiscardCount: f.drawDiscardCount,
						settleAnimActive: f.settleAnimActive,
						settleCarryOver: f.settleCarryOver,
						potTick: p.potTick,
						trumpReminderPulse: p.trumpReminderPulse
					}),
					/* @__PURE__ */ (0, g.jsx)("div", {
						className: "btable__seats",
						"aria-label": "Players at the table",
						children: C.map((e, t) => {
							let n = Lt(t, C.length);
							return /* @__PURE__ */ (0, g.jsx)(Gt, {
								player: k.find((t) => t.playerId === e.playerId) ?? e,
								region: n.region,
								style: {
									left: `${n.x}%`,
									top: `${n.y}%`
								},
								onToggleInHand: () => m(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
								onTrickDelta: (t) => h(e.playerId, t),
								onReaction: e.isSelf ? b : void 0
							}, e.playerId);
						})
					})
				]
			})
		}), /* @__PURE__ */ (0, g.jsx)(kt, {
			className: "hand-panel",
			cards: a,
			privateHandReady: o,
			phase: e.phase,
			enrollmentActive: i,
			isInHand: !!A?.inHand,
			isDealer: !!A?.isDealer,
			signedIn: !!s,
			isMyTurn: !!(s && e.turnPlayerId === s) && !te,
			dealStaggerMs: O.dealCardStaggerMs,
			drawAnimSubPhase: f.animatingDrawPlayerId === s ? f.drawAnimSubPhase : null,
			drawCompleted: ne,
			maxDrawDiscards: e.maxDrawDiscards ?? 4,
			legalPlayIndices: c ?? void 0,
			handComplete: l,
			actionFeedback: u,
			onSubmitDraw: _,
			onPassDraw: v,
			onPlayCard: y,
			currentUserId: s
		})]
	});
}
//#endregion
//#region src/table/layout/mobileSeatMap.ts
function wn(e, t) {
	let n = Math.max(1, Math.min(7, e || 1));
	return t === "portrait" ? n <= 1 ? .8 : n <= 2 ? .82 : n <= 3 ? .86 : n <= 4 ? .9 : .94 : n <= 1 ? 1.02 : n <= 2 ? .98 : n <= 3 ? 1.02 : n <= 5 ? 1.16 : 1.26;
}
function Tn(e) {
	let t = (e % 360 + 360) % 360;
	return t >= 30 && t <= 150 ? "top" : t >= 210 && t <= 330 ? "bottom" : t >= 150 && t < 210 ? "left" : "right";
}
function En(e, t, n) {
	let r = Math.max(1, Math.min(7, t || 1)), i = Math.max(0, Math.min(r - 1, e));
	if (n === "portrait") {
		let e = 205 + 130 * (r === 1 ? .5 : i / (r - 1)), t = e * Math.PI / 180, n = r <= 2 ? 40 : 38, a = r <= 2 ? 26 : 28, o = Math.cos(t), s = Math.sin(t);
		return {
			x: 50 + n * o,
			y: 50 + a * s,
			region: Tn(e)
		};
	}
	let a = 160 + 220 * (r === 1 ? .5 : i / (r - 1)), o = a * Math.PI / 180, s = Math.cos(o), c = Math.sin(o);
	return {
		x: 50 + 40 * s,
		y: 50 + 36 * c,
		region: Tn(a)
	};
}
//#endregion
//#region src/table/layout/useTableLayoutMode.ts
var Dn = "(orientation: portrait)";
function On() {
	let e = _n(), [t, n] = (0, l.useState)(() => typeof window < "u" && window.matchMedia(Dn).matches);
	return (0, l.useEffect)(() => {
		let e = window.matchMedia(Dn), t = () => n(e.matches);
		return t(), e.addEventListener("change", t), () => e.removeEventListener("change", t);
	}, []), e ? t ? "mobile-portrait" : "mobile-landscape" : "desktop";
}
//#endregion
//#region src/table/hooks/useMobileStageFit.ts
function kn(e, t) {
	if (typeof window > "u") return t;
	let n = getComputedStyle(document.documentElement).getPropertyValue(e).trim(), r = parseFloat(n);
	return Number.isFinite(r) ? r : t;
}
function An(e) {
	let t = e.closest(".btable-session");
	if (!t) return 0;
	let n = t.querySelector(".btable-mobile");
	if (!n) return 0;
	let r = t.getBoundingClientRect(), i = n.getBoundingClientRect();
	return Math.max(0, i.top - r.top) + Math.max(0, r.bottom - i.bottom);
}
function jn(e) {
	return e.closest(".btable-mobile__viewport") || e.closest(".table-play-overlay__main") || (e.closest(".btable-session") ?? e);
}
function Mn({ aspect: e, sessionKey: t }) {
	let n = (0, l.useRef)(null), r = (0, l.useRef)(0), i = (0, l.useRef)(t), a = On(), { settings: o } = Ot(), s = a === "mobile-portrait";
	return (0, l.useLayoutEffect)(() => {
		if (typeof window > "u") return;
		let a = n.current;
		if (!a) return;
		i.current !== t && (i.current = t, r.current = 0);
		let c = window.visualViewport, l = () => {
			let t = jn(a).getBoundingClientRect(), n = a.querySelector(".btable-mobile-hero-dock")?.getBoundingClientRect(), i = !!a.closest(".table-play-overlay"), l = s ? 104 : 92, u = s ? 210 : 168, d = n?.height ?? 0, f = ln(d, r.current, l);
			r.current = f.peak;
			let p = Math.min(d > 0 ? Math.max(d, l) : f.height, u), m = parseInt(getComputedStyle(a).getPropertyValue("--player-count").trim(), 10) || 4, h = m <= 4, g = !s, _ = (g && h ? kn("--mobile-fit-pad-x", 4) : kn("--mobile-fit-pad-x", 8)) + (g && i ? 4 : 12), v = (g && h ? kn("--mobile-fit-pad-y", 2) : kn("--mobile-fit-pad-y", 6)) + (g && i ? 4 : 10), y = kn("--mobile-fit-gap", s ? 8 : 6), b = c, x = Math.min(t.width, b?.width ?? window.innerWidth), S = Math.min(t.height, b?.height ?? window.innerHeight);
			if (i) {
				let e = An(a);
				S = Math.max(140, S - e);
			}
			let C = Math.max(.85, Math.min(1.35, o.tableScale || 1)), w = g ? {
				...fn({
					availWidth: x,
					availHeight: S,
					aspect: e,
					userScale: 1,
					padX: _,
					padY: v,
					stageShare: dn(m)
				}),
				stageWidth: 0,
				stageHeight: 0
			} : pn({
				availWidth: x,
				availHeight: S,
				aspect: e,
				userScale: 1,
				padX: _,
				padY: v,
				heroMinHeight: p,
				gap: y
			}), T = Math.max(0, x - _ * 2), E = g ? Math.max(0, S - v * 2) : Math.max(120, S - v * 2 - p - y), D = Math.min(w.displayStageWidth * C, T), O = Math.min(w.displayStageHeight * C, E);
			a.classList.toggle("btable-mobile-wrap--landscape-row", g), a.classList.toggle("btable-mobile-wrap--low-count", h), a.dataset.layout = s ? "portrait" : "landscape", a.style.setProperty("--stage-fit-width", `${Math.round(D)}px`), a.style.setProperty("--stage-fit-height", `${Math.round(O)}px`), a.style.setProperty("--stage-fit-scale", String(w.fitScale)), a.style.setProperty("--stage-effective-scale", "1");
		}, u = new ResizeObserver(l);
		u.observe(a);
		let d = a.querySelector(".btable-mobile-hero-dock");
		d && u.observe(d);
		let f = jn(a);
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
function Nn({ session: e, players: t, potMetrics: n, participantCount: r, enrollmentActive: i = !1, heroCards: a = [], privateHandReady: o = !1, currentUserId: s = null, legalPlayIndices: c, handComplete: l = !1, actionFeedback: u, trickPresentation: d, handPresentation: f, microinteractions: p, onToggleInHand: m, onTrickDelta: h, onSubmitDraw: _, onPassDraw: v, onPlayCard: y }) {
	let b = On() === "mobile-landscape" ? "landscape" : "portrait", x = [...t].sort((e, t) => e.isSelf ? -1 : t.isSelf ? 1 : e.displayName.localeCompare(t.displayName)), S = x.findIndex((e) => e.isSelf), C = S > 0 ? [...x.slice(S), ...x.slice(0, S)] : x, w = C.filter((e) => !e.isSelf), T = C.length, E = `btable--p${Math.min(8, Math.max(2, T))}`, D = wn(w.length, b), O = Object.fromEntries(t.map((e) => [e.playerId, e.displayName])), ee = sn(), k = Mn({
		aspect: D,
		sessionKey: `${e.sessionId}:${e.handNumber}`
	}), A = t.map((e) => {
		let t = d.displayTricksByPlayer[e.playerId] ?? 0, n = d.trickWinnerSeatId === e.playerId, r = d.suppressTurnPlayerId || f.suppressTurnIndicator, i = d.phase === "collectTrick" && n, a = f.enrollmentPulse[e.playerId], o = f.animatingDrawPlayerId === e.playerId;
		return {
			...e,
			tricksThisHand: t,
			isOnTurn: r ? !1 : e.isOnTurn,
			isLeading: n && (d.phase === "winnerReveal" || d.phase === "collectTrick") ? !0 : r ? !1 : e.isLeading,
			isTrickCapture: i,
			enrollmentPulse: a,
			drawAnimSubPhase: o ? f.drawAnimSubPhase : null,
			drawDiscardCount: o ? f.drawDiscardCount : 0,
			drawReplaceCount: o ? f.drawReplaceCount : 0,
			turnHandoff: p.turnHandoffPlayerId === e.playerId,
			dealerMoved: p.dealerMovedPlayerId === e.playerId,
			winnerFlash: p.winnerFlashPlayerId === e.playerId,
			bankrollTick: p.bankrollTicks[e.playerId] ?? null,
			bourreAlert: p.bourreAlerts[e.playerId] ?? null
		};
	}), te = t.find((e) => e.isSelf), ne = d.suppressTurnPlayerId || f.suppressTurnIndicator, re = !!(s && e.drawCompletedIds?.includes(s));
	return /* @__PURE__ */ (0, g.jsxs)("div", {
		ref: k,
		className: `btable-mobile-wrap btable-mobile-wrap--stage-fit ${E}`,
		"data-testid": "table-root",
		"data-layout": b,
		style: {
			"--player-count": T,
			"--table-aspect": D,
			"--trick-card-land-ms": "220ms",
			"--trick-winner-highlight-ms": "400ms",
			"--trick-sweep-ms": "300ms",
			"--deal-card-stagger-ms": `${ee.dealCardStaggerMs}ms`,
			"--draw-discard-ms": `${ee.drawDiscardMs}ms`,
			"--draw-replace-ms": `${ee.drawReplaceMs}ms`
		},
		children: [/* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-mobile-stage-fit",
			children: /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "btable-mobile-stage table-stage",
				children: [
					/* @__PURE__ */ (0, g.jsxs)("div", {
						className: "table-oval btable-mobile-oval",
						"aria-hidden": "true",
						children: [/* @__PURE__ */ (0, g.jsx)("div", { className: "btable__rail" }), /* @__PURE__ */ (0, g.jsx)("div", {
							className: "btable__felt",
							"data-testid": "table-felt"
						})]
					}),
					/* @__PURE__ */ (0, g.jsx)(Vt, {
						potMetrics: {
							...n,
							currentPot: f.displayPotAmount
						},
						participantCount: r,
						trumpUpcard: e.trumpUpcard,
						trumpSuit: e.trumpSuit,
						phase: e.phase,
						enrollmentActive: i,
						remainingDeckCount: e.remainingDeckCount,
						trickDisplayPlays: d.displayPlays,
						trickWinnerPlayerId: d.winnerPlayerId,
						trickShowWinnerTag: d.showWinnerTag,
						trickPresentationPhase: d.phase,
						playerNames: O,
						anteAnimActive: f.anteAnimActive,
						trumpRevealActive: f.trumpRevealActive,
						drawAnimPlayerId: f.animatingDrawPlayerId,
						drawAnimSubPhase: f.drawAnimSubPhase,
						drawDiscardCount: f.drawDiscardCount,
						settleAnimActive: f.settleAnimActive,
						settleCarryOver: f.settleCarryOver,
						potTick: p.potTick,
						trumpReminderPulse: p.trumpReminderPulse
					}),
					/* @__PURE__ */ (0, g.jsx)("div", {
						className: "btable__seats btable-mobile__seats",
						"aria-label": "Players at the table",
						children: w.map((e, t) => {
							let n = En(t, w.length, b);
							return /* @__PURE__ */ (0, g.jsx)(Gt, {
								player: A.find((t) => t.playerId === e.playerId) ?? e,
								region: n.region,
								style: {
									left: `${n.x}%`,
									top: `${n.y}%`
								},
								onToggleInHand: () => m(e.playerId, e.canToggleInHand ? !0 : !e.inHand),
								onTrickDelta: (t) => h(e.playerId, t),
								onReaction: void 0
							}, e.playerId);
						})
					})
				]
			})
		}), /* @__PURE__ */ (0, g.jsxs)("div", {
			className: "btable-mobile-hero-dock hand-panel",
			"data-testid": "hero-hand",
			children: [/* @__PURE__ */ (0, g.jsx)(kt, {
				cards: a,
				privateHandReady: o,
				phase: e.phase,
				enrollmentActive: i,
				isInHand: !!te?.inHand,
				isDealer: !!te?.isDealer,
				signedIn: !!s,
				isMyTurn: !!(s && e.turnPlayerId === s) && !ne,
				dealStaggerMs: ee.dealCardStaggerMs,
				drawAnimSubPhase: f.animatingDrawPlayerId === s ? f.drawAnimSubPhase : null,
				drawCompleted: re,
				maxDrawDiscards: e.maxDrawDiscards ?? 4,
				legalPlayIndices: c ?? void 0,
				handComplete: l,
				actionFeedback: u,
				onSubmitDraw: _,
				onPassDraw: v,
				onPlayCard: y,
				currentUserId: s
			}), i && !te?.inHand && /* @__PURE__ */ (0, g.jsx)("p", {
				className: "btable-mobile-hero-dock__hint muted small",
				children: "Tap I'm in above to join this hand"
			})]
		})]
	});
}
//#endregion
//#region src/table/CinematicSplash.tsx
var Pn = new Set([
	"big-pot",
	"pot-cap",
	"bourre",
	"hand-win"
]);
function Fn({ events: e, onDismiss: t }) {
	let n = [...e].reverse().find((e) => Pn.has(e.kind));
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
function In({ children: e }) {
	let { settings: t } = Ot(), n = t.layoutMode === "tiled", r = _n();
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
function Ln({ children: e }) {
	let t = On();
	return /* @__PURE__ */ (0, g.jsx)("div", {
		className: ["btable-mobile", `btable-mobile--${t === "mobile-landscape" ? "landscape" : "portrait"}`].join(" "),
		"data-layout-mode": t,
		children: /* @__PURE__ */ (0, g.jsx)("div", {
			className: "btable-mobile__viewport",
			children: e
		})
	});
}
//#endregion
//#region src/table/EventReactions.tsx
function Rn({ events: e, players: t, onDismiss: n }) {
	let r = e.filter((e) => e.emoji && (e.kind === "reaction" || e.kind === "trick-win"));
	return (0, l.useEffect)(() => {
		let e = r.map((e) => window.setTimeout(() => n(e.id), e.durationMs ?? 1600));
		return () => e.forEach((e) => window.clearTimeout(e));
	}, [r, n]), r.length ? /* @__PURE__ */ (0, g.jsx)("div", {
		className: "breactions",
		"aria-hidden": "true",
		children: r.map((e, n) => {
			let r = t.find((t) => t.playerId === e.playerId)?.displayName;
			return /* @__PURE__ */ (0, g.jsxs)("div", {
				className: "breactions__burst",
				style: { "--burst-i": n },
				children: [/* @__PURE__ */ (0, g.jsx)("span", {
					className: "breactions__emoji",
					children: e.emoji
				}), r && e.kind === "trick-win" && /* @__PURE__ */ (0, g.jsx)("span", {
					className: "breactions__name",
					children: r.split(" ")[0]
				})]
			}, e.id);
		})
	}) : null;
}
//#endregion
//#region src/table/FeedbackSettings.tsx
function zn({ compact: e = !1 }) {
	let [t, n] = (0, l.useState)(() => Ke()), [r, i] = (0, l.useState)(!1);
	(0, l.useEffect)(() => Ye(n), []);
	let a = Le(), o = He();
	function s(e) {
		qe({ soundEnabled: e });
	}
	function c(e) {
		qe({ hapticsMode: e });
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
function Bn({ open: e, onClose: t }) {
	let { settings: n, updateSettings: r, resetSettings: i } = Ot();
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
						children: Object.keys(bt).map((e) => /* @__PURE__ */ (0, g.jsx)("option", {
							value: e,
							children: bt[e]
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
var Vn = 0;
function Hn() {
	return Vn += 1, `evt-${Vn}-${Date.now()}`;
}
function Un(e, t, n, r) {
	let i = t.tricksByPlayer ?? {}, a = t.currentTrick?.plays?.length ?? 0, o = t.phase, s = n.currentPot, c = [];
	for (let t of r) {
		let n = e.tricks[t] ?? 0;
		(i[t] ?? 0) > n && c.push({
			id: Hn(),
			kind: "trick-win",
			title: "Trick captured",
			emoji: "🃏",
			playerId: t,
			durationMs: qt
		});
	}
	return s >= n.potCap && n.limEnabled && s > e.pot ? c.push({
		id: Hn(),
		kind: "pot-cap",
		title: "Pot cap reached",
		subtitle: "LmT engaged",
		emoji: "🔒",
		durationMs: 2200
	}) : s >= n.anteAmount * Math.max(r.length, 2) * 2 && s > e.pot && c.push({
		id: Hn(),
		kind: "big-pot",
		title: "Big pot brewing",
		emoji: "💰",
		durationMs: 2e3
	}), o === "play" && e.phase === "play" && Object.values(i).reduce((e, t) => e + (t || 0), 0) >= 4 && a === 0 && e.trickPlays > 0 && r.filter((e) => (i[e] ?? 0) === 0).length && c.push({
		id: Hn(),
		kind: "bourre",
		title: "Bourré pressure",
		subtitle: "Zero tricks on the line",
		emoji: "😬",
		durationMs: 2400
	}), c;
}
function Wn({ session: e, potMetrics: t, participantIds: n }) {
	let [r, i] = (0, l.useState)([]), a = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		let r = e.tricksByPlayer ?? {}, o = e.currentTrick?.plays?.length ?? 0, s = e.phase, c = t.currentPot, l = a.current;
		if (a.current = {
			tricks: { ...r },
			pot: c,
			trickPlays: o,
			phase: s
		}, !l) return;
		let u = Un(l, e, t, n);
		if (!u.length) return;
		let d = requestAnimationFrame(() => {
			i((e) => [...e, ...u]);
		});
		return () => cancelAnimationFrame(d);
	}, [
		JSON.stringify({
			tricks: e.tricksByPlayer,
			pot: t.currentPot,
			trickPlays: e.currentTrick?.plays?.length ?? 0,
			phase: e.phase,
			cap: t.potCap,
			lim: t.limEnabled,
			participants: n
		}),
		e,
		t,
		n
	]), {
		events: r,
		dismissEvent: (e) => {
			i((t) => t.filter((t) => t.id !== e));
		},
		pushReaction: (e, t) => {
			i((n) => [...n, {
				id: Hn(),
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
function Gn(e) {
	return e === "handReset" || e === "ante" || e === "trumpReveal" || e === "drawPlayer" || e === "drawReady" || e === "settle" || e === "nextHandReset";
}
function Kn(e) {
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
function qn(e) {
	return e.phase === "play" ? "play" : e.phase === "draw" ? "drawPlayer" : e.enrollmentActive ? "enrollment" : "idle";
}
function Jn(e) {
	return {
		phase: qn(e),
		sessionKey: e.sessionKey,
		handNumber: e.handNumber,
		displayDrawCompletedIds: [],
		animatingDrawPlayerId: null,
		drawAnimSubPhase: "done",
		drawDiscardCount: 0,
		drawReplaceCount: 0,
		trumpRevealActive: !1,
		anteAnimActive: !1,
		dealStaggerCount: 0,
		enrollmentPulse: {},
		settleAnimActive: !1,
		settleCarryOver: !1,
		nextHandResetActive: !1,
		displayPotAmount: e.potAmount,
		prevSnapshot: e,
		pendingSnapshot: null,
		phaseStartedAt: Date.now()
	};
}
function Yn(e, t, n = {}) {
	return {
		...e,
		...n,
		phase: t,
		phaseStartedAt: Date.now()
	};
}
function Xn(e, t) {
	let n = {};
	for (let r of t.enrolledIds) e.enrolledIds.includes(r) || (n[r] = "join");
	for (let r of t.declinedIds) e.declinedIds.includes(r) || (n[r] = "pass");
	return n;
}
function Zn(e, t) {
	for (let n of t.drawCompletedIds) if (!e.drawCompletedIds.includes(n)) return n;
	return null;
}
function Qn(e, t, n, r, i) {
	return Yn(e, "drawPlayer", {
		animatingDrawPlayerId: n,
		drawAnimSubPhase: "discard",
		drawDiscardCount: r,
		drawReplaceCount: i,
		prevSnapshot: t
	});
}
function $n(e, t, n, r) {
	let i = Zn({
		...t,
		drawCompletedIds: []
	}, t);
	return i ? Qn(e, t, i, n, r) : Yn(e, "drawPlayer", {
		displayDrawCompletedIds: [],
		prevSnapshot: t
	});
}
function er(e, t) {
	switch (t.type) {
		case "reset": return Jn(t.snapshot);
		case "dealCardRevealed": return {
			...e,
			dealStaggerCount: Math.max(e.dealStaggerCount, t.count)
		};
		case "watchdog": return Date.now() - e.phaseStartedAt < 12e3 ? e : tr({
			...e,
			pendingSnapshot: e.pendingSnapshot ?? e.prevSnapshot
		});
		case "advancePhase": return tr(e);
		case "serverUpdate": {
			let { snapshot: n, heroDrawDiscardCount: r = 0, heroDrawReplaceCount: i = 0 } = t, a = e.prevSnapshot ?? n;
			if (e.sessionKey !== n.sessionKey) return Jn(n);
			if (n.phase === "play" && e.phase !== "play") return Yn(e, "play", {
				displayDrawCompletedIds: [...n.drawCompletedIds],
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				trumpRevealActive: !1,
				anteAnimActive: !1,
				prevSnapshot: n,
				pendingSnapshot: null
			});
			if (Gn(e.phase) && e.phase !== "drawPlayer" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done") return {
				...e,
				pendingSnapshot: n
			};
			let o = Xn(a, n), s = Object.keys(o).length > 0;
			if (n.enrollmentActive) return {
				...e,
				phase: "enrollment",
				enrollmentPulse: s ? {
					...e.enrollmentPulse,
					...o
				} : e.enrollmentPulse,
				prevSnapshot: n,
				displayPotAmount: n.potAmount
			};
			if (n.phase === "draw" && a.enrollmentActive && !n.enrollmentActive && e.phase === "enrollment") {
				let t = !!n.trumpUpcard;
				return Yn(e, t ? "trumpReveal" : "ante", {
					trumpRevealActive: t,
					anteAnimActive: !0,
					dealStaggerCount: Math.max(e.dealStaggerCount, n.participantIds.length),
					prevSnapshot: n,
					displayPotAmount: n.potAmount
				});
			}
			if (n.phase === "draw") {
				let t = Zn(a, n);
				if (t && e.phase !== "drawReady") {
					let a = r > 0 || i > 0, o = a ? r : t === n.turnPlayerId ? 0 : 1;
					return Qn(e, n, t, o, a ? i : o);
				}
				if (n.drawCompletedIds.length === n.participantIds.length && n.participantIds.length > 0 && e.phase === "drawPlayer" && e.drawAnimSubPhase === "done") return Yn(e, "drawReady", { prevSnapshot: n });
			}
			return n.handComplete && n.phase === "play" && e.phase === "play" ? Yn(e, "settle", {
				settleAnimActive: !0,
				settleCarryOver: n.carryOverPot > 0,
				prevSnapshot: n,
				displayPotAmount: n.potAmount
			}) : {
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
function tr(e) {
	let t = e.pendingSnapshot ?? e.prevSnapshot;
	switch (e.phase) {
		case "handReset": return Yn(e, "ante", {
			anteAnimActive: !0,
			pendingSnapshot: null
		});
		case "ante": return e.trumpRevealActive || t?.trumpUpcard ? Yn(e, "trumpReveal", {
			trumpRevealActive: !0,
			anteAnimActive: !1,
			pendingSnapshot: null
		}) : t?.phase === "draw" ? $n(e, t, 0, 0) : Yn(e, "drawPlayer", {
			anteAnimActive: !1,
			pendingSnapshot: null
		});
		case "trumpReveal": return t?.phase === "draw" ? $n(e, t, 0, 0) : Yn(e, "drawPlayer", {
			trumpRevealActive: !1,
			pendingSnapshot: null
		});
		case "drawPlayer": {
			if (e.drawAnimSubPhase === "discard" && e.drawReplaceCount > 0) return {
				...e,
				drawAnimSubPhase: "receive"
			};
			let n = e.animatingDrawPlayerId, r = n ? [...e.displayDrawCompletedIds, n] : e.displayDrawCompletedIds, i = t ?? e.prevSnapshot;
			if (i && r.length >= i.participantIds.length) return Yn(e, "drawReady", {
				displayDrawCompletedIds: r,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done",
				pendingSnapshot: null
			});
			if (i) {
				({ ...i });
				let t = i.actionOrder.find((e) => i.participantIds.includes(e) && !r.includes(e));
				if (t && i.drawCompletedIds.includes(t)) return Qn(e, i, t, 1, 1);
			}
			return {
				...e,
				displayDrawCompletedIds: r,
				animatingDrawPlayerId: null,
				drawAnimSubPhase: "done"
			};
		}
		case "drawReady": return Yn(e, "play", { pendingSnapshot: null });
		case "settle": return Yn(e, "nextHandReset", {
			settleAnimActive: !1,
			nextHandResetActive: !0,
			pendingSnapshot: null
		});
		case "nextHandReset": return t ? Jn(t) : Yn(e, "idle", { nextHandResetActive: !1 });
		default: return e;
	}
}
function nr(e) {
	return {
		phase: e.phase,
		displayDrawCompletedIds: e.displayDrawCompletedIds,
		animatingDrawPlayerId: e.animatingDrawPlayerId,
		drawAnimSubPhase: e.drawAnimSubPhase,
		drawDiscardCount: e.drawDiscardCount,
		drawReplaceCount: e.drawReplaceCount,
		trumpRevealActive: e.trumpRevealActive,
		anteAnimActive: e.anteAnimActive,
		dealStaggerCount: e.dealStaggerCount,
		enrollmentPulse: e.enrollmentPulse,
		settleAnimActive: e.settleAnimActive,
		settleCarryOver: e.settleCarryOver,
		nextHandResetActive: e.nextHandResetActive,
		suppressTurnIndicator: e.phase === "trumpReveal" || e.phase === "ante" || e.phase === "drawReady" || e.phase === "settle" || e.phase === "nextHandReset" || e.phase === "handReset" || e.phase === "drawPlayer" && e.drawAnimSubPhase !== "done",
		displayPotAmount: e.displayPotAmount,
		isPresenting: Gn(e.phase)
	};
}
function rr(e, t = !1) {
	let n = sn(t);
	switch (e.phase) {
		case "handReset": return n.handResetMs;
		case "ante": return n.anteChipTravelMs * Math.max(1, Math.min(e.dealStaggerCount, 8));
		case "trumpReveal": return n.trumpRevealHoldMs;
		case "drawPlayer": return cn(e.drawAnimSubPhase === "receive" ? 0 : e.drawDiscardCount, e.drawAnimSubPhase === "receive" ? e.drawReplaceCount : 0, t);
		case "drawReady": return n.drawReadyBeatMs;
		case "settle": return n.settleHoldMs;
		case "nextHandReset": return n.nextHandResetMs;
		default: return 0;
	}
}
//#endregion
//#region src/table/hooks/useHandPresentation.ts
var ir = [], ar = [];
function or(e, t) {
	let n = new Set(e), r = new Set(t);
	return {
		discardCount: [...n].filter((e) => !r.has(e)).length,
		replaceCount: [...r].filter((e) => !n.has(e)).length
	};
}
function sr({ session: e, enrollmentActive: t, potAmount: n, handComplete: r, heroCards: i = ar, enrolledIds: a = ir, declinedIds: o = ir, actionOrder: s }) {
	let c = (0, l.useMemo)(() => Kn({
		sessionId: e.sessionId,
		handNumber: e.handNumber,
		phase: e.phase,
		enrollmentActive: t,
		participantIds: e.participantIds,
		actionOrder: s ?? e.participantIds,
		drawCompletedIds: e.drawCompletedIds,
		turnPlayerId: e.turnPlayerId,
		trumpUpcard: e.trumpUpcard,
		dealerId: e.dealerId,
		handComplete: r,
		potAmount: n,
		carryOverPot: e.carryOverPot,
		enrolledIds: a,
		declinedIds: o
	}), [
		e,
		t,
		n,
		r,
		a,
		o,
		s
	]), [u, d] = (0, l.useReducer)(er, c, Jn), f = (0, l.useRef)([]), p = (0, l.useRef)([]), m = (0, l.useRef)(""), h = () => {
		for (let e of f.current) window.clearTimeout(e);
		f.current = [];
	}, g = (e, t) => {
		let n = window.setTimeout(e, t);
		f.current.push(n);
	};
	return (0, l.useEffect)(() => () => h(), []), (0, l.useEffect)(() => {
		let e = i.map((e) => `${e.rank}-${e.suit}`), t = or(p.current, e);
		p.current = e, d({
			type: "serverUpdate",
			snapshot: c,
			heroDrawDiscardCount: t.discardCount,
			heroDrawReplaceCount: t.replaceCount
		});
	}, [c, i]), (0, l.useEffect)(() => {
		let e = rn(), t = `${u.phase}:${u.animatingDrawPlayerId ?? ""}:${u.drawAnimSubPhase}:${u.phaseStartedAt}`;
		if (m.current === t) return;
		m.current = t, h();
		let n = rr(u, e);
		n <= 0 || (g(() => d({ type: "advancePhase" }), n), g(() => d({ type: "watchdog" }), on));
	}, [
		u.phase,
		u.animatingDrawPlayerId,
		u.drawAnimSubPhase,
		u.phaseStartedAt
	]), (0, l.useEffect)(() => {
		if (e.phase === "draw" || e.phase === "play") {
			let e = i.length;
			e > 0 && d({
				type: "dealCardRevealed",
				count: e
			});
		}
	}, [i.length, e.phase]), nr(u);
}
//#endregion
//#region src/table/hooks/useTableMicrointeractions.ts
function cr(e) {
	let [t, n] = (0, l.useState)(de), r = (0, l.useRef)(null), i = (0, l.useRef)([]), a = () => {
		for (let e of i.current) window.clearTimeout(e);
		i.current = [];
	}, o = (e, t) => {
		let n = window.setTimeout(e, t);
		i.current.push(n);
	};
	(0, l.useEffect)(() => () => a(), []);
	let s = JSON.stringify(e.tricksByPlayer), c = JSON.stringify(e.bankrollByPlayer), u = JSON.stringify(e.bourrePlayerIds);
	return (0, l.useEffect)(() => {
		let t = pe(r.current, e);
		if (r.current = fe(e), !(!t.turnHandoffPlayerId && !t.dealerMovedPlayerId && !t.potTick && Object.keys(t.trickBadgeIncrements).length === 0 && Object.keys(t.bankrollChanges).length === 0 && t.bourrePlayerIds.length === 0 && !t.trumpReminderPulse && !t.feedbackErrorPulse && !t.feedbackSuccessPulse && !t.winnerFlashPlayerId)) {
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
			}, ue.turnHandoff), t.dealerMovedPlayerId && o(() => {
				n((e) => e.dealerMovedPlayerId === t.dealerMovedPlayerId ? {
					...e,
					dealerMovedPlayerId: null
				} : e);
			}, ue.dealerMove), t.winnerFlashPlayerId && o(() => {
				n((e) => e.winnerFlashPlayerId === t.winnerFlashPlayerId ? {
					...e,
					winnerFlashPlayerId: null
				} : e);
			}, ue.winnerFlash);
			for (let [e, r] of Object.entries(t.bankrollChanges)) o(() => {
				n((t) => {
					if (t.bankrollTicks[e] !== r) return t;
					let n = { ...t.bankrollTicks };
					return delete n[e], {
						...t,
						bankrollTicks: n
					};
				});
			}, ue.bankrollTick);
			for (let e of t.bourrePlayerIds) o(() => {
				n((t) => t.bourreAlerts[e] === "pulse" ? {
					...t,
					bourreAlerts: {
						...t.bourreAlerts,
						[e]: "marker"
					}
				} : t);
			}, ue.bourrePulse), o(() => {
				n((t) => {
					if (!t.bourreAlerts[e]) return t;
					let n = { ...t.bourreAlerts };
					return delete n[e], {
						...t,
						bourreAlerts: n
					};
				});
			}, ue.bourreMarker);
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
//#region src/table/hooks/useYourTurnAttention.ts
var lr = 15e3;
function ur(e) {
	let [t, n] = (0, l.useState)(!1), r = (0, l.useRef)(null);
	return (0, l.useEffect)(() => {
		if (r.current != null && (window.clearTimeout(r.current), r.current = null), n(!1), e.isMyTurn && e.phase === "play" && !e.suppressTurn && e.turnPlayerId) return r.current = window.setTimeout(() => {
			n(!0), r.current = null;
		}, lr), () => {
			r.current != null && (window.clearTimeout(r.current), r.current = null);
		};
	}, [
		[
			e.turnPlayerId ?? "",
			e.trickNumber,
			e.trickPlaysCount,
			e.phase ?? ""
		].join(":"),
		e.isMyTurn,
		e.phase,
		e.suppressTurn,
		e.turnPlayerId
	]), t;
}
function dr() {
	return rn();
}
//#endregion
//#region src/table/YourTurnAttention.tsx
function fr({ visible: e }) {
	return e ? /* @__PURE__ */ (0, g.jsx)("div", {
		className: ["byour-turn", dr() ? "byour-turn--reduced" : "byour-turn--pop"].join(" "),
		"data-testid": "your-turn-attention",
		role: "status",
		"aria-live": "polite",
		"aria-label": "Your turn to play",
		children: /* @__PURE__ */ (0, g.jsx)("span", {
			className: "byour-turn__text",
			children: "Your Turn!"
		})
	}) : null;
}
//#endregion
//#region src/table/trickPresentationMachine.ts
function pr(e, t) {
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
function mr(e, t) {
	return e.phase === "live" ? e : {
		...e,
		pendingServer: t
	};
}
function hr(e, t) {
	let n = $t(t.currentTrick), r = e.pendingResolution?.frozen.plays.length ?? n.length, i = e.phase === "live" && !e.pendingResolution ? Math.min(e.revealedCount, r) : e.revealedCount;
	return {
		...e,
		revealedCount: i,
		prevTricks: { ...t.tricksByPlayer },
		prevTrick: t.currentTrick,
		displayTricksByPlayer: { ...t.tricksByPlayer },
		pendingServer: null,
		resolvedTricks: null
	};
}
function gr(e, t, n, r) {
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
function _r(e, t) {
	switch (t.type) {
		case "reset":
		case "reinit": return pr(t.type === "reinit" ? t.snapshot.tricksByPlayer : e.displayTricksByPlayer, t.type === "reinit" ? t.snapshot.currentTrick : null);
		case "revealNextCard": {
			if (e.phase !== "live") return e;
			let t = e.pendingResolution?.frozen.plays.length ?? $t(e.prevTrick).length;
			return e.revealedCount >= t ? e : {
				...e,
				revealedCount: e.revealedCount + 1
			};
		}
		case "clampRevealedCount": return e.phase !== "live" || e.revealedCount <= t.target ? e : {
			...e,
			revealedCount: t.target
		};
		case "commitTrickResolution": {
			let t = e.pendingResolution;
			return !t || e.phase !== "live" ? e : gr({
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
				let t = e.pendingServer, n = $t(t?.currentTrick).length;
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
			if (e.phase !== "live") return mr(e, n);
			let i = nn({
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
			} : hr(e, n);
		}
		default: return e;
	}
}
function vr(e, t) {
	let n = $t(t), r = n.length > 0 ? n : e.pendingResolution?.frozen.plays ?? $t(e.prevTrick), i = e.phase === "live" ? r.slice(0, e.revealedCount) : e.frozenTrick?.plays ?? [], a = e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null, o = e.showWinnerTag && (e.phase === "winnerReveal" || e.phase === "collectTrick");
	return {
		phase: e.phase,
		displayPlays: i,
		winnerPlayerId: a,
		showWinnerTag: o,
		displayTricksByPlayer: e.displayTricksByPlayer,
		suppressTurnPlayerId: Yt(e.phase),
		trickWinnerSeatId: e.phase === "live" || e.phase === "trickComplete" ? null : e.frozenTrick?.winnerId ?? null,
		revealedCount: e.revealedCount,
		isResolving: e.phase !== "live"
	};
}
//#endregion
//#region src/table/hooks/useTrickPresentation.ts
function yr({ phase: e, currentTrick: t, tricksByPlayer: n, participantIds: r, trumpSuit: i, playedCards: a }) {
	let [o, s] = (0, l.useReducer)(_r, n, (e) => pr(e, t)), c = (0, l.useRef)([]), u = (0, l.useRef)(null), d = (0, l.useRef)(/* @__PURE__ */ new Set()), f = (e) => {
		for (let t of e) {
			let e = ae(t);
			d.current.has(e) || (d.current.add(e), P(t.playerId, e));
		}
	}, p = () => {
		for (let e of c.current) window.clearTimeout(e);
		c.current = [];
	}, m = (e, t) => {
		let n = window.setTimeout(e, t);
		c.current.push(n);
	};
	(0, l.useEffect)(() => () => p(), []), (0, l.useEffect)(() => {
		if (e !== "play") {
			p(), u.current = null, d.current.clear(), le(), s({
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
			reducedMotion: rn()
		});
	}, [
		e,
		t,
		n,
		r,
		i,
		a
	]), (0, l.useLayoutEffect)(() => {
		if (e !== "play") return;
		let n = t?.plays ?? [];
		n.length > 0 && f(n);
		let r = o.pendingResolution?.frozen.plays ?? [];
		r.length > 0 && f(r);
	}, [
		e,
		t?.plays,
		o.pendingResolution?.frozen.plays
	]), (0, l.useEffect)(() => {
		if (e !== "play" || o.phase !== "trickComplete" || !o.frozenTrick) return;
		let t = `${o.frozenTrick.trickNumber}:${o.frozenTrick.winnerId}:${o.frozenTrick.plays.length}`;
		if (u.current === t) return;
		u.current = t, p();
		let n = o.frozenTrick, r = Zt({
			trumpBeat: tn(n.plays, n.leadSuit, i),
			reducedMotion: rn()
		});
		m(() => s({ type: "advancePhase" }), r.readBeforeWinnerMs), m(() => s({ type: "advancePhase" }), r.readTotalMs), m(() => s({ type: "advancePhase" }), r.readTotalMs + r.sweepMs), m(() => s({ type: "advancePhase" }), r.pipelineMs);
	}, [
		e,
		o.phase,
		o.frozenTrick,
		i
	]), (0, l.useEffect)(() => {
		if (e !== "play" || o.phase !== "live" || !o.pendingResolution) return;
		let t = o.pendingResolution.frozen.plays.length;
		if (o.revealedCount < t) return;
		let n = rn() ? 121 : 220, r = window.setTimeout(() => s({ type: "commitTrickResolution" }), n);
		return () => window.clearTimeout(r);
	}, [
		e,
		o.phase,
		o.pendingResolution,
		o.revealedCount
	]), (0, l.useEffect)(() => {
		o.phase === "live" && (u.current = null);
	}, [o.phase]);
	let h = o.phase === "live" ? o.pendingResolution?.frozen.plays.length ?? t?.plays?.length ?? 0 : o.revealedCount;
	return (0, l.useEffect)(() => {
		if (e !== "play" || o.phase !== "live" || o.revealedCount >= h) return;
		let t = rn() ? 121 : 220, n = window.setTimeout(() => s({ type: "revealNextCard" }), t);
		return () => window.clearTimeout(n);
	}, [
		e,
		o.phase,
		o.revealedCount,
		h
	]), (0, l.useEffect)(() => {
		e !== "play" || o.phase !== "live" || o.revealedCount <= h || s({
			type: "clampRevealedCount",
			target: h
		});
	}, [
		e,
		o.phase,
		h,
		o.revealedCount
	]), vr(o, t);
}
//#endregion
//#region src/table/settlementCopy.ts
function br(e, t) {
	return t.find((t) => t.playerId === e)?.displayName || e;
}
function xr(e, t) {
	return e.map((e) => br(e, t)).join(" & ");
}
function Sr(e, t) {
	return t.filter((t) => (e[t] ?? 0) === 0);
}
function Cr(e) {
	let { tricksByPlayer: t, participantIds: n, players: r, pot: i, pendingVotes: a = {} } = e, o = jt(t, n), s = e.winnerIds?.length ? e.winnerIds : o.winnerIds, c = e.maxTricks ?? o.maxTricks, l = xr(s, r), u = Sr(t, n), d = xr(u, r), f = R(i.maxWinThisHand), p = R(i.currentPot), m = i.carryIn > 0 ? R(i.carryIn) : null, h = `Pot this hand: ${p} (max win ${f})`;
	m && (h += ` — includes ${m} carried in`), i.limEnabled && i.overflow > 0 && (h += ` · LIM overflow ${R(i.overflow)} stays out of play`);
	let g = s.map((e) => {
		let n = t[e] ?? 0;
		return `${br(e, r)} — ${n} trick${n === 1 ? "" : "s"}`;
	}), _ = u.length > 0 ? `Bourré: ${d} took 0 tricks (extra penalty applies on settlement)` : null, v = e.splitSharePerWinner, y = v > 0 && s.length >= 2 ? `If all co-winners agree to split: ${R(i.maxWinThisHand)} → ${R(v)} each` : null, b = s.length >= 2 ? "If split: pot is divided; no carryover to next hand" : null, x = `If any co-winner declines: full pot ${p} carries to the next hand · non-winners ante up`, S = s.map((e) => {
		let t = a[e], n = br(e, r);
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
function wr({ session: e, players: t, potMetrics: n, splitSharePerWinner: r, currentUserId: i, isCoWinner: a, onSettle: o }) {
	let s = Cr({
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
						R(r),
						" each"
					]
				})]
			})
		]
	});
}
//#endregion
//#region src/table/TableSessionView.tsx
var Tr = [], Er = [], Dr = [];
function Or({ session: e, players: t, potMetrics: n, mySessionNet: r, myHandContribution: i, leaderLabel: a, showCoWinSettlement: o, splitSharePerWinner: s = 0, enrollmentActive: c = !1, enrollmentSecondsLeft: u = 0, currentUserId: d, heroCards: f = Er, privateHandReady: p = !1, legalPlayIndices: m, recentBourreIds: h = Dr, handComplete: _ = !1, actionFeedback: v, actions: y }) {
	let { settings: b } = Ot(), x = _n(), [S, C] = (0, l.useState)(!1), w = e.participantIds.length, { events: T, dismissEvent: E, pushReaction: D } = Wn({
		session: e,
		potMetrics: n,
		participantIds: e.participantIds
	}), O = d != null && (e.pendingCoWinSettlement?.winnerIds || []).includes(d), ee = t.find((e) => e.isSelf && e.canToggleInHand), k = yr({
		phase: e.phase,
		currentTrick: e.currentTrick,
		tricksByPlayer: e.tricksByPlayer,
		participantIds: e.participantIds,
		trumpSuit: e.trumpSuit,
		playedCards: e.playedCards
	}), A = sr({
		session: e,
		enrollmentActive: c,
		potAmount: n.currentPot,
		handComplete: _,
		heroCards: f,
		enrolledIds: e.handEnrollment?.enrolledIds ?? Tr,
		declinedIds: e.handEnrollment?.declinedIds ?? Tr,
		actionOrder: e.handEnrollment?.orderedPlayerIds ?? e.participantIds
	}), te = k.suppressTurnPlayerId || A.suppressTurnIndicator, ne = re(e.phase, c), ie = te ? null : M(e.turnPlayerId, t), N = j(e.phase), ae = !!(d && e.turnPlayerId === d) && !te, oe = ur({
		isMyTurn: ae,
		phase: e.phase,
		suppressTurn: !!te,
		turnPlayerId: e.turnPlayerId,
		trickNumber: e.currentTrick?.trickNumber ?? 0,
		trickPlaysCount: e.currentTrick?.plays?.length ?? 0
	}), se = !e.trumpUpcard && !!e.trumpSuit && e.phase === "play", P = (0, l.useMemo)(() => ({ ...k.displayTricksByPlayer }), [k.displayTricksByPlayer]), F = (0, l.useMemo)(() => Object.fromEntries(t.map((e) => [e.playerId, Math.max(0, Number(e.bankroll) || 0)])), [t]), I = cr({
		turnPlayerId: e.turnPlayerId ?? null,
		dealerId: e.dealerId,
		potAmount: A.displayPotAmount,
		tricksByPlayer: P,
		bankrollByPlayer: F,
		bourrePlayerIds: h ?? [],
		phase: e.phase ?? null,
		showTrumpSuitReminder: se,
		suppressTurn: !!te,
		actionFeedbackStatus: v?.status ?? "idle",
		trickWinnerSeatId: k.trickWinnerSeatId,
		trickPhase: k.phase
	}), ce = (0, l.useRef)(0), le = (0, l.useRef)(0);
	(0, l.useEffect)(() => {
		I.feedbackErrorPulse > ce.current && ht(), ce.current = I.feedbackErrorPulse;
	}, [I.feedbackErrorPulse]), (0, l.useEffect)(() => {
		I.feedbackSuccessPulse > le.current && gt(), le.current = I.feedbackSuccessPulse;
	}, [I.feedbackSuccessPulse]);
	let ue = {
		currentPot: n.currentPot,
		maxWinThisHand: n.maxWinThisHand,
		limEnabled: n.limEnabled,
		overflow: n.overflow,
		carryIn: e.carryOverPot ?? 0
	}, de = (0, l.useCallback)((e) => {
		D(e, d ?? void 0);
	}, [D, d]), fe = {
		session: e,
		players: t,
		potMetrics: n,
		participantCount: w,
		enrollmentActive: c,
		heroCards: f,
		privateHandReady: p,
		currentUserId: d,
		legalPlayIndices: m,
		handComplete: _,
		actionFeedback: v,
		trickPresentation: k,
		handPresentation: A,
		microinteractions: I,
		...(0, l.useMemo)(() => ({
			onToggleInHand: (e, n) => {
				t.find((t) => t.playerId === e)?.isSelf && y.onToggleInHand(n);
			},
			onTrickDelta: (e, n) => {
				t.find((t) => t.playerId === e)?.isSelf && y.onTrickDelta(n);
			},
			onSubmitDraw: y.onSubmitDraw,
			onPassDraw: y.onPassDraw,
			onPlayCard: y.onPlayCard,
			onReaction: de
		}), [
			y,
			de,
			t
		])
	}, pe = /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
		/* @__PURE__ */ (0, g.jsx)(fr, { visible: oe }),
		/* @__PURE__ */ (0, g.jsx)(Rn, {
			events: T,
			players: t,
			onDismiss: E
		}),
		/* @__PURE__ */ (0, g.jsx)(Fn, {
			events: T,
			onDismiss: E
		}),
		x ? /* @__PURE__ */ (0, g.jsx)(Nn, { ...fe }) : /* @__PURE__ */ (0, g.jsx)(Cn, { ...fe })
	] });
	return (0, l.useEffect)(() => {
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
			S ? "btable-session--settings-open" : ""
		].filter(Boolean).join(" "),
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
			}, v.status === "error" ? `feedback-error-${I.feedbackErrorPulse}` : v.status === "success" ? `feedback-success-${I.feedbackSuccessPulse}` : `feedback-${v.status}`),
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
								children: ne
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
						children: a
					}),
					A.trumpRevealActive && e.phase === "draw" && /* @__PURE__ */ (0, g.jsxs)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: ["Trump revealed — ", re("draw", !1)]
					}),
					A.phase === "drawReady" && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Draw complete — first lead coming up"
					}),
					A.settleAnimActive && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Settling the pot…"
					}),
					k.isResolving && e.phase === "play" && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: "Trick won — cards collecting before the next lead"
					}),
					ie && N && k.phase === "live" && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__turn muted small",
						"aria-live": "polite",
						children: ie
					}),
					e.phase === "draw" && ae && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__hint muted small",
						children: "Select cards to discard (up to 5), then Draw — or Stand pat"
					}),
					e.phase === "play" && /* @__PURE__ */ (0, g.jsx)("p", {
						className: "btable-session__hint muted small",
						children: "Follow suit · trump when void · beat the trick when you can"
					}),
					ee && /* @__PURE__ */ (0, g.jsx)("div", {
						className: "btable-session__enroll-cta",
						children: /* @__PURE__ */ (0, g.jsxs)("button", {
							type: "button",
							className: "btn btn--primary btn--sm btable-session__enroll-btn",
							"data-testid": "join-button",
							onClick: () => y.onToggleInHand(!0),
							children: [
								"I'm in · ",
								u,
								"s"
							]
						})
					}),
					c && !ee && /* @__PURE__ */ (0, g.jsxs)("p", {
						className: "btable-session__enroll muted small",
						children: [
							"Join window: ",
							u,
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
			x ? /* @__PURE__ */ (0, g.jsx)(Ln, { children: /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-stage",
				children: pe
			}) }) : /* @__PURE__ */ (0, g.jsx)(In, { children: /* @__PURE__ */ (0, g.jsx)("div", {
				className: "btable-stage",
				children: pe
			}) }),
			/* @__PURE__ */ (0, g.jsx)(Bn, {
				open: S,
				onClose: () => C(!1)
			}),
			o && !e.isFinal && /* @__PURE__ */ (0, g.jsx)(wr, {
				session: e,
				players: t,
				potMetrics: ue,
				splitSharePerWinner: s,
				currentUserId: d,
				isCoWinner: O,
				onSettle: y.onSettle
			}),
			/* @__PURE__ */ (0, g.jsxs)("footer", {
				className: "btable-session__foot muted small",
				children: [/* @__PURE__ */ (0, g.jsx)(zn, { compact: !0 }), r == null ? /* @__PURE__ */ (0, g.jsx)(g.Fragment, { children: "Shared pot and game state only · sign in to track your ledger" }) : /* @__PURE__ */ (0, g.jsxs)(g.Fragment, { children: [
					"Your contribution this hand",
					" ",
					Mt(i ?? 0),
					" · ",
					"Your session net ",
					Mt(r)
				] })]
			})
		]
	});
}
//#endregion
//#region src/table/mount.tsx
var kr = null, Ar = null;
function jr(e, t) {
	dt(), Ar !== e && (kr?.unmount(), kr = (0, u.createRoot)(e), Ar = e), kr.render(/* @__PURE__ */ (0, g.jsx)(Dt, { children: /* @__PURE__ */ (0, g.jsx)(Or, { ...t }) }));
}
function Mr() {
	kr?.unmount(), kr = null, Ar = null;
}
//#endregion
export { Ke as getFeedbackPrefs, dt as initGameFeedback, jr as mountTableSession, mt as playBigWinFeedback, ft as playShuffleFeedback, pt as playTrickWinFeedback, qe as saveFeedbackPrefs, Ye as subscribeFeedbackPrefs, Mr as unmountTableSession };
