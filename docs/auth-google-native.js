//#region \0rolldown/runtime.js
var e = Object.defineProperty, t = (e, t) => () => (e && (t = e(e = 0)), t), n = (t, n) => {
	let r = {};
	for (var i in t) e(r, i, {
		get: t[i],
		enumerable: !0
	});
	return n || e(r, Symbol.toStringTag, { value: "Module" }), r;
}, r, i, a, o, s, c, l, u, d, f, p, ee, te, ne, m, re, ie, ae, oe, se = t((() => {
	(function(e) {
		e.Unimplemented = "UNIMPLEMENTED", e.Unavailable = "UNAVAILABLE";
	})(r ||= {}), i = class extends Error {
		constructor(e, t, n) {
			super(e), this.message = e, this.code = t, this.data = n;
		}
	}, a = (e) => e?.androidBridge ? "android" : e?.webkit?.messageHandlers?.bridge ? "ios" : "web", o = (e) => {
		let t = e.CapacitorCustomPlatform || null, n = e.Capacitor || {}, o = n.Plugins = n.Plugins || {}, s = () => t === null ? a(e) : t.name, c = () => s() !== "web", l = (e) => !!(f.get(e)?.platforms.has(s()) || u(e)), u = (e) => n.PluginHeaders?.find((t) => t.name === e), d = (t) => e.console.error(t), f = /* @__PURE__ */ new Map();
		return n.convertFileSrc ||= (e) => e, n.getPlatform = s, n.handleError = d, n.isNativePlatform = c, n.isPluginAvailable = l, n.registerPlugin = (e, a = {}) => {
			let c = f.get(e);
			if (c) return console.warn(`Capacitor plugin "${e}" already registered. Cannot register plugins twice.`), c.proxy;
			let l = s(), d = u(e), p, ee = async () => (!p && l in a ? p = p = typeof a[l] == "function" ? await a[l]() : a[l] : t !== null && !p && "web" in a && (p = p = typeof a.web == "function" ? await a.web() : a.web), p), te = (t, a) => {
				if (d) {
					let r = d?.methods.find((e) => a === e.name);
					if (r) return r.rtype === "promise" ? (t) => n.nativePromise(e, a.toString(), t) : (t, r) => n.nativeCallback(e, a.toString(), t, r);
					if (t) return t[a]?.bind(t);
				} else if (t) return t[a]?.bind(t);
				else throw new i(`"${e}" plugin is not implemented on ${l}`, r.Unimplemented);
			}, ne = (t) => {
				let n, a = (...a) => {
					let o = ee().then((o) => {
						let s = te(o, t);
						if (s) {
							let e = s(...a);
							return n = e?.remove, e;
						} else throw new i(`"${e}.${t}()" is not implemented on ${l}`, r.Unimplemented);
					});
					return t === "addListener" && (o.remove = async () => n()), o;
				};
				return a.toString = () => `${t.toString()}() { [capacitor code] }`, Object.defineProperty(a, "name", {
					value: t,
					writable: !1,
					configurable: !1
				}), a;
			}, m = ne("addListener"), re = ne("removeListener"), ie = (e, t) => {
				let n = m({ eventName: e }, t), r = async () => {
					re({
						eventName: e,
						callbackId: await n
					}, t);
				}, i = new Promise((e) => n.then(() => e({ remove: r })));
				return i.remove = async () => {
					console.warn("Using addListener() without 'await' is deprecated."), await r();
				}, i;
			}, ae = new Proxy({}, { get(e, t) {
				switch (t) {
					case "$$typeof": return;
					case "toJSON": return () => ({});
					case "addListener": return d ? ie : m;
					case "removeListener": return re;
					default: return ne(t);
				}
			} });
			return o[e] = ae, f.set(e, {
				name: e,
				proxy: ae,
				platforms: new Set([...Object.keys(a), ...d ? [l] : []])
			}), ae;
		}, n.Exception = i, n.DEBUG = !!n.DEBUG, n.isLoggingEnabled = !!n.isLoggingEnabled, n;
	}, s = (e) => e.Capacitor = o(e), c = /*#__PURE__*/ s(typeof globalThis < "u" ? globalThis : typeof self < "u" ? self : typeof window < "u" ? window : typeof global < "u" ? global : {}), l = c.registerPlugin, u = class {
		constructor() {
			this.listeners = {}, this.retainedEventArguments = {}, this.windowListeners = {};
		}
		addListener(e, t) {
			let n = !1;
			this.listeners[e] || (this.listeners[e] = [], n = !0), this.listeners[e].push(t);
			let r = this.windowListeners[e];
			return r && !r.registered && this.addWindowListener(r), n && this.sendRetainedArgumentsForEvent(e), Promise.resolve({ remove: async () => this.removeListener(e, t) });
		}
		async removeAllListeners() {
			this.listeners = {};
			for (let e in this.windowListeners) this.removeWindowListener(this.windowListeners[e]);
			this.windowListeners = {};
		}
		notifyListeners(e, t, n) {
			let r = this.listeners[e];
			if (!r) {
				if (n) {
					let n = this.retainedEventArguments[e];
					n ||= [], n.push(t), this.retainedEventArguments[e] = n;
				}
				return;
			}
			r.forEach((e) => e(t));
		}
		hasListeners(e) {
			return !!this.listeners[e]?.length;
		}
		registerWindowListener(e, t) {
			this.windowListeners[t] = {
				registered: !1,
				windowEventName: e,
				pluginEventName: t,
				handler: (e) => {
					this.notifyListeners(t, e);
				}
			};
		}
		unimplemented(e = "not implemented") {
			return new c.Exception(e, r.Unimplemented);
		}
		unavailable(e = "not available") {
			return new c.Exception(e, r.Unavailable);
		}
		async removeListener(e, t) {
			let n = this.listeners[e];
			if (!n) return;
			let r = n.indexOf(t);
			this.listeners[e].splice(r, 1), this.listeners[e].length || this.removeWindowListener(this.windowListeners[e]);
		}
		addWindowListener(e) {
			window.addEventListener(e.windowEventName, e.handler), e.registered = !0;
		}
		removeWindowListener(e) {
			e && (window.removeEventListener(e.windowEventName, e.handler), e.registered = !1);
		}
		sendRetainedArgumentsForEvent(e) {
			let t = this.retainedEventArguments[e];
			t && (delete this.retainedEventArguments[e], t.forEach((t) => {
				this.notifyListeners(e, t);
			}));
		}
	}, d = (e) => encodeURIComponent(e).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape), f = (e) => e.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent), p = class extends u {
		async getCookies() {
			let e = document.cookie, t = {};
			return e.split(";").forEach((e) => {
				if (e.length <= 0) return;
				let [n, r] = e.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
				n = f(n).trim(), r = f(r).trim(), t[n] = r;
			}), t;
		}
		async setCookie(e) {
			try {
				let t = d(e.key), n = d(e.value), r = e.expires ? `; expires=${e.expires.replace("expires=", "")}` : "", i = (e.path || "/").replace("path=", ""), a = e.url != null && e.url.length > 0 ? `domain=${e.url}` : "";
				document.cookie = `${t}=${n || ""}${r}; path=${i}; ${a};`;
			} catch (e) {
				return Promise.reject(e);
			}
		}
		async deleteCookie(e) {
			try {
				document.cookie = `${e.key}=; Max-Age=0`;
			} catch (e) {
				return Promise.reject(e);
			}
		}
		async clearCookies() {
			try {
				let e = document.cookie.split(";") || [];
				for (let t of e) document.cookie = t.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
			} catch (e) {
				return Promise.reject(e);
			}
		}
		async clearAllCookies() {
			try {
				await this.clearCookies();
			} catch (e) {
				return Promise.reject(e);
			}
		}
	}, l("CapacitorCookies", { web: () => new p() }), ee = async (e) => new Promise((t, n) => {
		let r = new FileReader();
		r.onload = () => {
			let e = r.result;
			t(e.indexOf(",") >= 0 ? e.split(",")[1] : e);
		}, r.onerror = (e) => n(e), r.readAsDataURL(e);
	}), te = (e = {}) => {
		let t = Object.keys(e);
		return Object.keys(e).map((e) => e.toLocaleLowerCase()).reduce((n, r, i) => (n[r] = e[t[i]], n), {});
	}, ne = (e, t = !0) => e ? Object.entries(e).reduce((e, n) => {
		let [r, i] = n, a, o;
		return Array.isArray(i) ? (o = "", i.forEach((e) => {
			a = t ? encodeURIComponent(e) : e, o += `${r}=${a}&`;
		}), o.slice(0, -1)) : (a = t ? encodeURIComponent(i) : i, o = `${r}=${a}`), `${e}&${o}`;
	}, "").substr(1) : null, m = (e, t = {}) => {
		let n = Object.assign({
			method: e.method || "GET",
			headers: e.headers
		}, t), r = te(e.headers)["content-type"] || "";
		if (typeof e.data == "string") n.body = e.data;
		else if (r.includes("application/x-www-form-urlencoded")) {
			let t = new URLSearchParams();
			for (let [n, r] of Object.entries(e.data || {})) t.set(n, r);
			n.body = t.toString();
		} else if (r.includes("multipart/form-data") || e.data instanceof FormData) {
			let t = new FormData();
			if (e.data instanceof FormData) e.data.forEach((e, n) => {
				t.append(n, e);
			});
			else for (let n of Object.keys(e.data)) t.append(n, e.data[n]);
			n.body = t;
			let r = new Headers(n.headers);
			r.delete("content-type"), n.headers = r;
		} else (r.includes("application/json") || typeof e.data == "object") && (n.body = JSON.stringify(e.data));
		return n;
	}, re = class extends u {
		async request(e) {
			let t = m(e, e.webFetchExtra), n = ne(e.params, e.shouldEncodeUrlParams), r = n ? `${e.url}?${n}` : e.url, i = await fetch(r, t), a = i.headers.get("content-type") || "", { responseType: o = "text" } = i.ok ? e : {};
			a.includes("application/json") && (o = "json");
			let s, c;
			switch (o) {
				case "arraybuffer":
				case "blob":
					c = await i.blob(), s = await ee(c);
					break;
				case "json":
					s = await i.json();
					break;
				default: s = await i.text();
			}
			let l = {};
			return i.headers.forEach((e, t) => {
				l[t] = e;
			}), {
				data: s,
				headers: l,
				status: i.status,
				url: i.url
			};
		}
		async get(e) {
			return this.request(Object.assign(Object.assign({}, e), { method: "GET" }));
		}
		async post(e) {
			return this.request(Object.assign(Object.assign({}, e), { method: "POST" }));
		}
		async put(e) {
			return this.request(Object.assign(Object.assign({}, e), { method: "PUT" }));
		}
		async patch(e) {
			return this.request(Object.assign(Object.assign({}, e), { method: "PATCH" }));
		}
		async delete(e) {
			return this.request(Object.assign(Object.assign({}, e), { method: "DELETE" }));
		}
	}, l("CapacitorHttp", { web: () => new re() }), (function(e) {
		e.Dark = "DARK", e.Light = "LIGHT", e.Default = "DEFAULT";
	})(ie ||= {}), (function(e) {
		e.StatusBar = "StatusBar", e.NavigationBar = "NavigationBar";
	})(ae ||= {}), oe = class extends u {
		async setStyle() {
			this.unavailable("not available for web");
		}
		async setAnimation() {
			this.unavailable("not available for web");
		}
		async show() {
			this.unavailable("not available for web");
		}
		async hide() {
			this.unavailable("not available for web");
		}
	}, l("SystemBars", { web: () => new oe() });
})), ce, h, le = t((() => {
	(function(e) {
		e.IndexedDbLocal = "INDEXED_DB_LOCAL", e.InMemory = "IN_MEMORY", e.BrowserLocal = "BROWSER_LOCAL", e.BrowserSession = "BROWSER_SESSION";
	})(ce ||= {}), (function(e) {
		e.APPLE = "apple.com", e.FACEBOOK = "facebook.com", e.GAME_CENTER = "gc.apple.com", e.GITHUB = "github.com", e.GOOGLE = "google.com", e.MICROSOFT = "microsoft.com", e.PLAY_GAMES = "playgames.google.com", e.TWITTER = "twitter.com", e.YAHOO = "yahoo.com", e.PASSWORD = "password", e.PHONE = "phone";
	})(h ||= {});
})), ue, de = t((() => {
	ue = () => void 0;
}));
//#endregion
//#region node_modules/@firebase/util/dist/index.esm2017.js
function fe() {
	if (typeof self < "u") return self;
	if (typeof window < "u") return window;
	if (typeof global < "u") return global;
	throw Error("Unable to locate global object.");
}
function pe(e) {
	try {
		return (e.startsWith("http://") || e.startsWith("https://") ? new URL(e).hostname : e).endsWith(".cloudworkstations.dev");
	} catch {
		return !1;
	}
}
async function me(e) {
	return (await fetch(e, { credentials: "include" })).ok;
}
function he() {
	let e = {
		prod: [],
		emulator: []
	};
	for (let t of Object.keys(Xe)) Xe[t] ? e.emulator.push(t) : e.prod.push(t);
	return e;
}
function ge(e) {
	let t = document.getElementById(e), n = !1;
	return t || (t = document.createElement("div"), t.setAttribute("id", e), n = !0), {
		created: n,
		element: t
	};
}
function _e(e, t) {
	if (typeof window > "u" || typeof document > "u" || !pe(window.location.host) || Xe[e] === t || Xe[e] || Ze) return;
	Xe[e] = t;
	function n(e) {
		return `__firebase__banner__${e}`;
	}
	let r = "__firebase__banner", i = he().prod.length > 0;
	function a() {
		let e = document.getElementById(r);
		e && e.remove();
	}
	function o(e) {
		e.style.display = "flex", e.style.background = "#7faaf0", e.style.position = "fixed", e.style.bottom = "5px", e.style.left = "5px", e.style.padding = ".5em", e.style.borderRadius = "5px", e.style.alignItems = "center";
	}
	function s(e, t) {
		e.setAttribute("width", "24"), e.setAttribute("id", t), e.setAttribute("height", "24"), e.setAttribute("viewBox", "0 0 24 24"), e.setAttribute("fill", "none"), e.style.marginLeft = "-6px";
	}
	function c() {
		let e = document.createElement("span");
		return e.style.cursor = "pointer", e.style.marginLeft = "16px", e.style.fontSize = "24px", e.innerHTML = " &times;", e.onclick = () => {
			Ze = !0, a();
		}, e;
	}
	function l(e, t) {
		e.setAttribute("id", t), e.innerText = "Learn more", e.href = "https://firebase.google.com/docs/studio/preview-apps#preview-backend", e.setAttribute("target", "__blank"), e.style.paddingLeft = "5px", e.style.textDecoration = "underline";
	}
	function u() {
		let e = ge(r), t = n("text"), a = document.getElementById(t) || document.createElement("span"), u = n("learnmore"), d = document.getElementById(u) || document.createElement("a"), f = n("preprendIcon"), p = document.getElementById(f) || document.createElementNS("http://www.w3.org/2000/svg", "svg");
		if (e.created) {
			let t = e.element;
			o(t), l(d, u);
			let n = c();
			s(p, f), t.append(p, a, d, n), document.body.appendChild(t);
		}
		i ? (a.innerText = "Preview backend disconnected.", p.innerHTML = "<g clip-path=\"url(#clip0_6013_33858)\">\n<path d=\"M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z\" fill=\"#212121\"/>\n</g>\n<defs>\n<clipPath id=\"clip0_6013_33858\">\n<rect width=\"24\" height=\"24\" fill=\"white\"/>\n</clipPath>\n</defs>") : (p.innerHTML = "<g clip-path=\"url(#clip0_6083_34804)\">\n<path d=\"M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z\" fill=\"#212121\"/>\n</g>\n<defs>\n<clipPath id=\"clip0_6083_34804\">\n<rect width=\"24\" height=\"24\" fill=\"white\"/>\n</clipPath>\n</defs>", a.innerText = "Preview backend running in this workspace."), a.setAttribute("id", t);
	}
	document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", u) : u();
}
function g() {
	return typeof navigator < "u" && typeof navigator.userAgent == "string" ? navigator.userAgent : "";
}
function ve() {
	return typeof window < "u" && !!(window.cordova || window.phonegap || window.PhoneGap) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(g());
}
function ye() {
	return typeof navigator < "u" && navigator.userAgent === "Cloudflare-Workers";
}
function be() {
	let e = typeof chrome == "object" ? chrome.runtime : typeof browser == "object" ? browser.runtime : void 0;
	return typeof e == "object" && e.id !== void 0;
}
function xe() {
	return typeof navigator == "object" && navigator.product === "ReactNative";
}
function Se() {
	let e = g();
	return e.indexOf("MSIE ") >= 0 || e.indexOf("Trident/") >= 0;
}
function Ce() {
	try {
		return typeof indexedDB == "object";
	} catch {
		return !1;
	}
}
function we() {
	return new Promise((e, t) => {
		try {
			let n = !0, r = "validate-browser-context-for-indexeddb-analytics-module", i = self.indexedDB.open(r);
			i.onsuccess = () => {
				i.result.close(), n || self.indexedDB.deleteDatabase(r), e(!0);
			}, i.onupgradeneeded = () => {
				n = !1;
			}, i.onerror = () => {
				t(i.error?.message || "");
			};
		} catch (e) {
			t(e);
		}
	});
}
function Te(e, t) {
	return e.replace(et, (e, n) => {
		let r = t[n];
		return r == null ? `<${n}?>` : String(r);
	});
}
function Ee(e) {
	for (let t in e) if (Object.prototype.hasOwnProperty.call(e, t)) return !1;
	return !0;
}
function De(e, t) {
	if (e === t) return !0;
	let n = Object.keys(e), r = Object.keys(t);
	for (let i of n) {
		if (!r.includes(i)) return !1;
		let n = e[i], a = t[i];
		if (Oe(n) && Oe(a)) {
			if (!De(n, a)) return !1;
		} else if (n !== a) return !1;
	}
	for (let e of r) if (!n.includes(e)) return !1;
	return !0;
}
function Oe(e) {
	return typeof e == "object" && !!e;
}
function ke(e) {
	let t = [];
	for (let [n, r] of Object.entries(e)) Array.isArray(r) ? r.forEach((e) => {
		t.push(encodeURIComponent(n) + "=" + encodeURIComponent(e));
	}) : t.push(encodeURIComponent(n) + "=" + encodeURIComponent(r));
	return t.length ? "&" + t.join("&") : "";
}
function Ae(e) {
	let t = {};
	return e.replace(/^\?/, "").split("&").forEach((e) => {
		if (e) {
			let [n, r] = e.split("=");
			t[decodeURIComponent(n)] = decodeURIComponent(r);
		}
	}), t;
}
function je(e) {
	let t = e.indexOf("?");
	if (!t) return "";
	let n = e.indexOf("#", t);
	return e.substring(t, n > 0 ? n : void 0);
}
function Me(e, t) {
	let n = new tt(e, t);
	return n.subscribe.bind(n);
}
function Ne(e, t) {
	if (typeof e != "object" || !e) return !1;
	for (let n of t) if (n in e && typeof e[n] == "function") return !0;
	return !1;
}
function Pe() {}
function _(e) {
	return e && e._delegate ? e._delegate : e;
}
var Fe, Ie, Le, Re, ze, Be, Ve, He, Ue, We, Ge, Ke, qe, Je, Ye, Xe, Ze, Qe, v, $e, et, tt, nt = t((() => {
	de(), Fe = function(e) {
		let t = [], n = 0;
		for (let r = 0; r < e.length; r++) {
			let i = e.charCodeAt(r);
			i < 128 ? t[n++] = i : i < 2048 ? (t[n++] = i >> 6 | 192, t[n++] = i & 63 | 128) : (i & 64512) == 55296 && r + 1 < e.length && (e.charCodeAt(r + 1) & 64512) == 56320 ? (i = 65536 + ((i & 1023) << 10) + (e.charCodeAt(++r) & 1023), t[n++] = i >> 18 | 240, t[n++] = i >> 12 & 63 | 128, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128) : (t[n++] = i >> 12 | 224, t[n++] = i >> 6 & 63 | 128, t[n++] = i & 63 | 128);
		}
		return t;
	}, Ie = function(e) {
		let t = [], n = 0, r = 0;
		for (; n < e.length;) {
			let i = e[n++];
			if (i < 128) t[r++] = String.fromCharCode(i);
			else if (i > 191 && i < 224) {
				let a = e[n++];
				t[r++] = String.fromCharCode((i & 31) << 6 | a & 63);
			} else if (i > 239 && i < 365) {
				let a = e[n++], o = e[n++], s = e[n++], c = ((i & 7) << 18 | (a & 63) << 12 | (o & 63) << 6 | s & 63) - 65536;
				t[r++] = String.fromCharCode(55296 + (c >> 10)), t[r++] = String.fromCharCode(56320 + (c & 1023));
			} else {
				let a = e[n++], o = e[n++];
				t[r++] = String.fromCharCode((i & 15) << 12 | (a & 63) << 6 | o & 63);
			}
		}
		return t.join("");
	}, Le = {
		byteToCharMap_: null,
		charToByteMap_: null,
		byteToCharMapWebSafe_: null,
		charToByteMapWebSafe_: null,
		ENCODED_VALS_BASE: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
		get ENCODED_VALS() {
			return this.ENCODED_VALS_BASE + "+/=";
		},
		get ENCODED_VALS_WEBSAFE() {
			return this.ENCODED_VALS_BASE + "-_.";
		},
		HAS_NATIVE_SUPPORT: typeof atob == "function",
		encodeByteArray(e, t) {
			if (!Array.isArray(e)) throw Error("encodeByteArray takes an array as a parameter");
			this.init_();
			let n = t ? this.byteToCharMapWebSafe_ : this.byteToCharMap_, r = [];
			for (let t = 0; t < e.length; t += 3) {
				let i = e[t], a = t + 1 < e.length, o = a ? e[t + 1] : 0, s = t + 2 < e.length, c = s ? e[t + 2] : 0, l = i >> 2, u = (i & 3) << 4 | o >> 4, d = (o & 15) << 2 | c >> 6, f = c & 63;
				s || (f = 64, a || (d = 64)), r.push(n[l], n[u], n[d], n[f]);
			}
			return r.join("");
		},
		encodeString(e, t) {
			return this.HAS_NATIVE_SUPPORT && !t ? btoa(e) : this.encodeByteArray(Fe(e), t);
		},
		decodeString(e, t) {
			return this.HAS_NATIVE_SUPPORT && !t ? atob(e) : Ie(this.decodeStringToByteArray(e, t));
		},
		decodeStringToByteArray(e, t) {
			this.init_();
			let n = t ? this.charToByteMapWebSafe_ : this.charToByteMap_, r = [];
			for (let t = 0; t < e.length;) {
				let i = n[e.charAt(t++)], a = t < e.length ? n[e.charAt(t)] : 0;
				++t;
				let o = t < e.length ? n[e.charAt(t)] : 64;
				++t;
				let s = t < e.length ? n[e.charAt(t)] : 64;
				if (++t, i == null || a == null || o == null || s == null) throw new Re();
				let c = i << 2 | a >> 4;
				if (r.push(c), o !== 64) {
					let e = a << 4 & 240 | o >> 2;
					if (r.push(e), s !== 64) {
						let e = o << 6 & 192 | s;
						r.push(e);
					}
				}
			}
			return r;
		},
		init_() {
			if (!this.byteToCharMap_) {
				this.byteToCharMap_ = {}, this.charToByteMap_ = {}, this.byteToCharMapWebSafe_ = {}, this.charToByteMapWebSafe_ = {};
				for (let e = 0; e < this.ENCODED_VALS.length; e++) this.byteToCharMap_[e] = this.ENCODED_VALS.charAt(e), this.charToByteMap_[this.byteToCharMap_[e]] = e, this.byteToCharMapWebSafe_[e] = this.ENCODED_VALS_WEBSAFE.charAt(e), this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[e]] = e, e >= this.ENCODED_VALS_BASE.length && (this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(e)] = e, this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(e)] = e);
			}
		}
	}, Re = class extends Error {
		constructor() {
			super(...arguments), this.name = "DecodeBase64StringError";
		}
	}, ze = function(e) {
		let t = Fe(e);
		return Le.encodeByteArray(t, !0);
	}, Be = function(e) {
		return ze(e).replace(/\./g, "");
	}, Ve = function(e) {
		try {
			return Le.decodeString(e, !0);
		} catch (e) {
			console.error("base64Decode failed: ", e);
		}
		return null;
	}, He = () => fe().__FIREBASE_DEFAULTS__, Ue = () => {
		if (typeof process > "u" || process.env === void 0) return;
		let e = process.env.__FIREBASE_DEFAULTS__;
		if (e) return JSON.parse(e);
	}, We = () => {
		if (typeof document > "u") return;
		let e;
		try {
			e = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
		} catch {
			return;
		}
		let t = e && Ve(e[1]);
		return t && JSON.parse(t);
	}, Ge = () => {
		try {
			return ue() || He() || Ue() || We();
		} catch (e) {
			console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
			return;
		}
	}, Ke = (e) => Ge()?.emulatorHosts?.[e], qe = () => Ge()?.config, Je = (e) => Ge()?.[`_${e}`], Ye = class {
		constructor() {
			this.reject = () => {}, this.resolve = () => {}, this.promise = new Promise((e, t) => {
				this.resolve = e, this.reject = t;
			});
		}
		wrapCallback(e) {
			return (t, n) => {
				t ? this.reject(t) : this.resolve(n), typeof e == "function" && (this.promise.catch(() => {}), e.length === 1 ? e(t) : e(t, n));
			};
		}
	}, Xe = {}, Ze = !1, Qe = "FirebaseError", v = class e extends Error {
		constructor(t, n, r) {
			super(n), this.code = t, this.customData = r, this.name = Qe, Object.setPrototypeOf(this, e.prototype), Error.captureStackTrace && Error.captureStackTrace(this, $e.prototype.create);
		}
	}, $e = class {
		constructor(e, t, n) {
			this.service = e, this.serviceName = t, this.errors = n;
		}
		create(e, ...t) {
			let n = t[0] || {}, r = `${this.service}/${e}`, i = this.errors[e], a = i ? Te(i, n) : "Error";
			return new v(r, `${this.serviceName}: ${a} (${r}).`, n);
		}
	}, et = /\{\$([^}]+)}/g, tt = class {
		constructor(e, t) {
			this.observers = [], this.unsubscribes = [], this.observerCount = 0, this.task = Promise.resolve(), this.finalized = !1, this.onNoObservers = t, this.task.then(() => {
				e(this);
			}).catch((e) => {
				this.error(e);
			});
		}
		next(e) {
			this.forEachObserver((t) => {
				t.next(e);
			});
		}
		error(e) {
			this.forEachObserver((t) => {
				t.error(e);
			}), this.close(e);
		}
		complete() {
			this.forEachObserver((e) => {
				e.complete();
			}), this.close();
		}
		subscribe(e, t, n) {
			let r;
			if (e === void 0 && t === void 0 && n === void 0) throw Error("Missing Observer.");
			r = Ne(e, [
				"next",
				"error",
				"complete"
			]) ? e : {
				next: e,
				error: t,
				complete: n
			}, r.next === void 0 && (r.next = Pe), r.error === void 0 && (r.error = Pe), r.complete === void 0 && (r.complete = Pe);
			let i = this.unsubscribeOne.bind(this, this.observers.length);
			return this.finalized && this.task.then(() => {
				try {
					this.finalError ? r.error(this.finalError) : r.complete();
				} catch {}
			}), this.observers.push(r), i;
		}
		unsubscribeOne(e) {
			this.observers === void 0 || this.observers[e] === void 0 || (delete this.observers[e], --this.observerCount, this.observerCount === 0 && this.onNoObservers !== void 0 && this.onNoObservers(this));
		}
		forEachObserver(e) {
			if (!this.finalized) for (let t = 0; t < this.observers.length; t++) this.sendOne(t, e);
		}
		sendOne(e, t) {
			this.task.then(() => {
				if (this.observers !== void 0 && this.observers[e] !== void 0) try {
					t(this.observers[e]);
				} catch (e) {
					typeof console < "u" && console.error && console.error(e);
				}
			});
		}
		close(e) {
			this.finalized || (this.finalized = !0, e !== void 0 && (this.finalError = e), this.task.then(() => {
				this.observers = void 0, this.onNoObservers = void 0;
			}));
		}
	};
}));
//#endregion
//#region node_modules/@firebase/component/dist/esm/index.esm2017.js
function rt(e) {
	return e === b ? void 0 : e;
}
function it(e) {
	return e.instantiationMode === "EAGER";
}
var y, b, at, ot, st = t((() => {
	nt(), y = class {
		constructor(e, t, n) {
			this.name = e, this.instanceFactory = t, this.type = n, this.multipleInstances = !1, this.serviceProps = {}, this.instantiationMode = "LAZY", this.onInstanceCreated = null;
		}
		setInstantiationMode(e) {
			return this.instantiationMode = e, this;
		}
		setMultipleInstances(e) {
			return this.multipleInstances = e, this;
		}
		setServiceProps(e) {
			return this.serviceProps = e, this;
		}
		setInstanceCreatedCallback(e) {
			return this.onInstanceCreated = e, this;
		}
	}, b = "[DEFAULT]", at = class {
		constructor(e, t) {
			this.name = e, this.container = t, this.component = null, this.instances = /* @__PURE__ */ new Map(), this.instancesDeferred = /* @__PURE__ */ new Map(), this.instancesOptions = /* @__PURE__ */ new Map(), this.onInitCallbacks = /* @__PURE__ */ new Map();
		}
		get(e) {
			let t = this.normalizeInstanceIdentifier(e);
			if (!this.instancesDeferred.has(t)) {
				let e = new Ye();
				if (this.instancesDeferred.set(t, e), this.isInitialized(t) || this.shouldAutoInitialize()) try {
					let n = this.getOrInitializeService({ instanceIdentifier: t });
					n && e.resolve(n);
				} catch {}
			}
			return this.instancesDeferred.get(t).promise;
		}
		getImmediate(e) {
			let t = this.normalizeInstanceIdentifier(e?.identifier), n = e?.optional ?? !1;
			if (this.isInitialized(t) || this.shouldAutoInitialize()) try {
				return this.getOrInitializeService({ instanceIdentifier: t });
			} catch (e) {
				if (n) return null;
				throw e;
			}
			else if (n) return null;
			else throw Error(`Service ${this.name} is not available`);
		}
		getComponent() {
			return this.component;
		}
		setComponent(e) {
			if (e.name !== this.name) throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
			if (this.component) throw Error(`Component for ${this.name} has already been provided`);
			if (this.component = e, this.shouldAutoInitialize()) {
				if (it(e)) try {
					this.getOrInitializeService({ instanceIdentifier: b });
				} catch {}
				for (let [e, t] of this.instancesDeferred.entries()) {
					let n = this.normalizeInstanceIdentifier(e);
					try {
						let e = this.getOrInitializeService({ instanceIdentifier: n });
						t.resolve(e);
					} catch {}
				}
			}
		}
		clearInstance(e = b) {
			this.instancesDeferred.delete(e), this.instancesOptions.delete(e), this.instances.delete(e);
		}
		async delete() {
			let e = Array.from(this.instances.values());
			await Promise.all([...e.filter((e) => "INTERNAL" in e).map((e) => e.INTERNAL.delete()), ...e.filter((e) => "_delete" in e).map((e) => e._delete())]);
		}
		isComponentSet() {
			return this.component != null;
		}
		isInitialized(e = b) {
			return this.instances.has(e);
		}
		getOptions(e = b) {
			return this.instancesOptions.get(e) || {};
		}
		initialize(e = {}) {
			let { options: t = {} } = e, n = this.normalizeInstanceIdentifier(e.instanceIdentifier);
			if (this.isInitialized(n)) throw Error(`${this.name}(${n}) has already been initialized`);
			if (!this.isComponentSet()) throw Error(`Component ${this.name} has not been registered yet`);
			let r = this.getOrInitializeService({
				instanceIdentifier: n,
				options: t
			});
			for (let [e, t] of this.instancesDeferred.entries()) n === this.normalizeInstanceIdentifier(e) && t.resolve(r);
			return r;
		}
		onInit(e, t) {
			let n = this.normalizeInstanceIdentifier(t), r = this.onInitCallbacks.get(n) ?? /* @__PURE__ */ new Set();
			r.add(e), this.onInitCallbacks.set(n, r);
			let i = this.instances.get(n);
			return i && e(i, n), () => {
				r.delete(e);
			};
		}
		invokeOnInitCallbacks(e, t) {
			let n = this.onInitCallbacks.get(t);
			if (n) for (let r of n) try {
				r(e, t);
			} catch {}
		}
		getOrInitializeService({ instanceIdentifier: e, options: t = {} }) {
			let n = this.instances.get(e);
			if (!n && this.component && (n = this.component.instanceFactory(this.container, {
				instanceIdentifier: rt(e),
				options: t
			}), this.instances.set(e, n), this.instancesOptions.set(e, t), this.invokeOnInitCallbacks(n, e), this.component.onInstanceCreated)) try {
				this.component.onInstanceCreated(this.container, e, n);
			} catch {}
			return n || null;
		}
		normalizeInstanceIdentifier(e = b) {
			return this.component ? this.component.multipleInstances ? e : b : e;
		}
		shouldAutoInitialize() {
			return !!this.component && this.component.instantiationMode !== "EXPLICIT";
		}
	}, ot = class {
		constructor(e) {
			this.name = e, this.providers = /* @__PURE__ */ new Map();
		}
		addComponent(e) {
			let t = this.getProvider(e.name);
			if (t.isComponentSet()) throw Error(`Component ${e.name} has already been registered with ${this.name}`);
			t.setComponent(e);
		}
		addOrOverwriteComponent(e) {
			this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name), this.addComponent(e);
		}
		getProvider(e) {
			if (this.providers.has(e)) return this.providers.get(e);
			let t = new at(e, this);
			return this.providers.set(e, t), t;
		}
		getProviders() {
			return Array.from(this.providers.values());
		}
	};
})), ct, x, lt, ut, dt, ft, pt, mt = t((() => {
	ct = [], (function(e) {
		e[e.DEBUG = 0] = "DEBUG", e[e.VERBOSE = 1] = "VERBOSE", e[e.INFO = 2] = "INFO", e[e.WARN = 3] = "WARN", e[e.ERROR = 4] = "ERROR", e[e.SILENT = 5] = "SILENT";
	})(x ||= {}), lt = {
		debug: x.DEBUG,
		verbose: x.VERBOSE,
		info: x.INFO,
		warn: x.WARN,
		error: x.ERROR,
		silent: x.SILENT
	}, ut = x.INFO, dt = {
		[x.DEBUG]: "log",
		[x.VERBOSE]: "log",
		[x.INFO]: "info",
		[x.WARN]: "warn",
		[x.ERROR]: "error"
	}, ft = (e, t, ...n) => {
		if (t < e.logLevel) return;
		let r = (/* @__PURE__ */ new Date()).toISOString(), i = dt[t];
		if (i) console[i](`[${r}]  ${e.name}:`, ...n);
		else throw Error(`Attempted to log a message with an invalid logType (value: ${t})`);
	}, pt = class {
		constructor(e) {
			this.name = e, this._logLevel = ut, this._logHandler = ft, this._userLogHandler = null, ct.push(this);
		}
		get logLevel() {
			return this._logLevel;
		}
		set logLevel(e) {
			if (!(e in x)) throw TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
			this._logLevel = e;
		}
		setLogLevel(e) {
			this._logLevel = typeof e == "string" ? lt[e] : e;
		}
		get logHandler() {
			return this._logHandler;
		}
		set logHandler(e) {
			if (typeof e != "function") throw TypeError("Value assigned to `logHandler` must be a function");
			this._logHandler = e;
		}
		get userLogHandler() {
			return this._userLogHandler;
		}
		set userLogHandler(e) {
			this._userLogHandler = e;
		}
		debug(...e) {
			this._userLogHandler && this._userLogHandler(this, x.DEBUG, ...e), this._logHandler(this, x.DEBUG, ...e);
		}
		log(...e) {
			this._userLogHandler && this._userLogHandler(this, x.VERBOSE, ...e), this._logHandler(this, x.VERBOSE, ...e);
		}
		info(...e) {
			this._userLogHandler && this._userLogHandler(this, x.INFO, ...e), this._logHandler(this, x.INFO, ...e);
		}
		warn(...e) {
			this._userLogHandler && this._userLogHandler(this, x.WARN, ...e), this._logHandler(this, x.WARN, ...e);
		}
		error(...e) {
			this._userLogHandler && this._userLogHandler(this, x.ERROR, ...e), this._logHandler(this, x.ERROR, ...e);
		}
	};
}));
//#endregion
//#region node_modules/idb/build/wrap-idb-value.js
function ht() {
	return Ct ||= [
		IDBDatabase,
		IDBObjectStore,
		IDBIndex,
		IDBCursor,
		IDBTransaction
	];
}
function gt() {
	return wt ||= [
		IDBCursor.prototype.advance,
		IDBCursor.prototype.continue,
		IDBCursor.prototype.continuePrimaryKey
	];
}
function _t(e) {
	let t = new Promise((t, n) => {
		let r = () => {
			e.removeEventListener("success", i), e.removeEventListener("error", a);
		}, i = () => {
			t(S(e.result)), r();
		}, a = () => {
			n(e.error), r();
		};
		e.addEventListener("success", i), e.addEventListener("error", a);
	});
	return t.then((t) => {
		t instanceof IDBCursor && Tt.set(t, e);
	}).catch(() => {}), kt.set(t, e), t;
}
function vt(e) {
	if (Et.has(e)) return;
	let t = new Promise((t, n) => {
		let r = () => {
			e.removeEventListener("complete", i), e.removeEventListener("error", a), e.removeEventListener("abort", a);
		}, i = () => {
			t(), r();
		}, a = () => {
			n(e.error || new DOMException("AbortError", "AbortError")), r();
		};
		e.addEventListener("complete", i), e.addEventListener("error", a), e.addEventListener("abort", a);
	});
	Et.set(e, t);
}
function yt(e) {
	At = e(At);
}
function bt(e) {
	return e === IDBDatabase.prototype.transaction && !("objectStoreNames" in IDBTransaction.prototype) ? function(t, ...n) {
		let r = e.call(jt(this), t, ...n);
		return Dt.set(r, t.sort ? t.sort() : [t]), S(r);
	} : gt().includes(e) ? function(...t) {
		return e.apply(jt(this), t), S(Tt.get(this));
	} : function(...t) {
		return S(e.apply(jt(this), t));
	};
}
function xt(e) {
	return typeof e == "function" ? bt(e) : (e instanceof IDBTransaction && vt(e), St(e, ht()) ? new Proxy(e, At) : e);
}
function S(e) {
	if (e instanceof IDBRequest) return _t(e);
	if (Ot.has(e)) return Ot.get(e);
	let t = xt(e);
	return t !== e && (Ot.set(e, t), kt.set(t, e)), t;
}
var St, Ct, wt, Tt, Et, Dt, Ot, kt, At, jt, Mt = t((() => {
	St = (e, t) => t.some((t) => e instanceof t), Tt = /* @__PURE__ */ new WeakMap(), Et = /* @__PURE__ */ new WeakMap(), Dt = /* @__PURE__ */ new WeakMap(), Ot = /* @__PURE__ */ new WeakMap(), kt = /* @__PURE__ */ new WeakMap(), At = {
		get(e, t, n) {
			if (e instanceof IDBTransaction) {
				if (t === "done") return Et.get(e);
				if (t === "objectStoreNames") return e.objectStoreNames || Dt.get(e);
				if (t === "store") return n.objectStoreNames[1] ? void 0 : n.objectStore(n.objectStoreNames[0]);
			}
			return S(e[t]);
		},
		set(e, t, n) {
			return e[t] = n, !0;
		},
		has(e, t) {
			return e instanceof IDBTransaction && (t === "done" || t === "store") ? !0 : t in e;
		}
	}, jt = (e) => kt.get(e);
}));
//#endregion
//#region node_modules/idb/build/index.js
function Nt(e, t, { blocked: n, upgrade: r, blocking: i, terminated: a } = {}) {
	let o = indexedDB.open(e, t), s = S(o);
	return r && o.addEventListener("upgradeneeded", (e) => {
		r(S(o.result), e.oldVersion, e.newVersion, S(o.transaction), e);
	}), n && o.addEventListener("blocked", (e) => n(e.oldVersion, e.newVersion, e)), s.then((e) => {
		a && e.addEventListener("close", () => a()), i && e.addEventListener("versionchange", (e) => i(e.oldVersion, e.newVersion, e));
	}).catch(() => {}), s;
}
function Pt(e, t) {
	if (!(e instanceof IDBDatabase && !(t in e) && typeof t == "string")) return;
	if (Lt.get(t)) return Lt.get(t);
	let n = t.replace(/FromIndex$/, ""), r = t !== n, i = It.includes(n);
	if (!(n in (r ? IDBIndex : IDBObjectStore).prototype) || !(i || Ft.includes(n))) return;
	let a = async function(e, ...t) {
		let a = this.transaction(e, i ? "readwrite" : "readonly"), o = a.store;
		return r && (o = o.index(t.shift())), (await Promise.all([o[n](...t), i && a.done]))[0];
	};
	return Lt.set(t, a), a;
}
var Ft, It, Lt, Rt = t((() => {
	Mt(), Ft = [
		"get",
		"getKey",
		"getAll",
		"getAllKeys",
		"count"
	], It = [
		"put",
		"add",
		"delete",
		"clear"
	], Lt = /* @__PURE__ */ new Map(), yt((e) => ({
		...e,
		get: (t, n, r) => Pt(t, n) || e.get(t, n, r),
		has: (t, n) => !!Pt(t, n) || e.has(t, n)
	}));
}));
//#endregion
//#region node_modules/@firebase/app/dist/esm/index.esm2017.js
function zt(e) {
	return e.getComponent()?.type === "VERSION";
}
function Bt(e, t) {
	try {
		e.container.addComponent(t);
	} catch (n) {
		w.debug(`Component ${t.name} failed to register with FirebaseApp ${e.name}`, n);
	}
}
function Vt(e) {
	let t = e.name;
	if (In.has(t)) return w.debug(`There were multiple attempts to register component ${t}.`), !1;
	In.set(t, e);
	for (let t of Pn.values()) Bt(t, e);
	for (let t of Fn.values()) Bt(t, e);
	return !0;
}
function Ht(e, t) {
	let n = e.container.getProvider("heartbeat").getImmediate({ optional: !0 });
	return n && n.triggerHeartbeat(), e.container.getProvider(t);
}
function C(e) {
	return e == null ? !1 : e.settings !== void 0;
}
function Ut(e, t = {}) {
	let n = e;
	typeof t != "object" && (t = { name: t });
	let r = Object.assign({
		name: Mn,
		automaticDataCollectionEnabled: !0
	}, t), i = r.name;
	if (typeof i != "string" || !i) throw T.create("bad-app-name", { appName: String(i) });
	if (n ||= qe(), !n) throw T.create("no-options");
	let a = Pn.get(i);
	if (a) {
		if (De(n, a.options) && De(r, a.config)) return a;
		throw T.create("duplicate-app", { appName: i });
	}
	let o = new ot(i);
	for (let e of In.values()) o.addComponent(e);
	let s = new Ln(n, r, o);
	return Pn.set(i, s), s;
}
function Wt(e = Mn) {
	let t = Pn.get(e);
	if (!t && e === "[DEFAULT]" && qe()) return Ut();
	if (!t) throw T.create("no-app", { appName: e });
	return t;
}
function Gt(e, t, n) {
	let r = Nn[e] ?? e;
	n && (r += `-${n}`);
	let i = r.match(/\s|\//), a = t.match(/\s|\//);
	if (i || a) {
		let e = [`Unable to register library "${r}" with version "${t}":`];
		i && e.push(`library name "${r}" contains illegal characters (whitespace or "/")`), i && a && e.push("and"), a && e.push(`version name "${t}" contains illegal characters (whitespace or "/")`), w.warn(e.join(" "));
		return;
	}
	Vt(new y(`${r}-version`, () => ({
		library: r,
		version: t
	}), "VERSION"));
}
function Kt() {
	return Hn ||= Nt(zn, Bn, { upgrade: (e, t) => {
		switch (t) {
			case 0: try {
				e.createObjectStore(Vn);
			} catch (e) {
				console.warn(e);
			}
		}
	} }).catch((e) => {
		throw T.create("idb-open", { originalErrorMessage: e.message });
	}), Hn;
}
async function qt(e) {
	try {
		let t = (await Kt()).transaction(Vn), n = await t.objectStore(Vn).get(Yt(e));
		return await t.done, n;
	} catch (e) {
		if (e instanceof v) w.warn(e.message);
		else {
			let t = T.create("idb-get", { originalErrorMessage: e?.message });
			w.warn(t.message);
		}
	}
}
async function Jt(e, t) {
	try {
		let n = (await Kt()).transaction(Vn, "readwrite");
		await n.objectStore(Vn).put(t, Yt(e)), await n.done;
	} catch (e) {
		if (e instanceof v) w.warn(e.message);
		else {
			let t = T.create("idb-set", { originalErrorMessage: e?.message });
			w.warn(t.message);
		}
	}
}
function Yt(e) {
	return `${e.name}!${e.options.appId}`;
}
function Xt() {
	return (/* @__PURE__ */ new Date()).toISOString().substring(0, 10);
}
function Zt(e, t = Un) {
	let n = [], r = e.slice();
	for (let i of e) {
		let e = n.find((e) => e.agent === i.agent);
		if (!e) {
			if (n.push({
				agent: i.agent,
				dates: [i.date]
			}), Qt(n) > t) {
				n.pop();
				break;
			}
		} else if (e.dates.push(i.date), Qt(n) > t) {
			e.dates.pop();
			break;
		}
		r = r.slice(1);
	}
	return {
		heartbeatsToSend: n,
		unsentEntries: r
	};
}
function Qt(e) {
	return Be(JSON.stringify({
		version: 2,
		heartbeats: e
	})).length;
}
function $t(e) {
	if (e.length === 0) return -1;
	let t = 0, n = e[0].date;
	for (let r = 1; r < e.length; r++) e[r].date < n && (n = e[r].date, t = r);
	return t;
}
function en(e) {
	Vt(new y("platform-logger", (e) => new tn(e), "PRIVATE")), Vt(new y("heartbeat", (e) => new Gn(e), "PRIVATE")), Gt(nn, rn, e), Gt(nn, rn, "esm2017"), Gt("fire-js", "");
}
var tn, nn, rn, w, an, on, sn, cn, ln, un, dn, fn, pn, mn, hn, gn, _n, vn, yn, bn, xn, Sn, Cn, wn, Tn, En, Dn, On, kn, An, jn, Mn, Nn, Pn, Fn, In, T, Ln, Rn, zn, Bn, Vn, Hn, Un, Wn, Gn, Kn, qn = t((() => {
	st(), mt(), nt(), Rt(), tn = class {
		constructor(e) {
			this.container = e;
		}
		getPlatformInfoString() {
			return this.container.getProviders().map((e) => {
				if (zt(e)) {
					let t = e.getImmediate();
					return `${t.library}/${t.version}`;
				} else return null;
			}).filter((e) => e).join(" ");
		}
	}, nn = "@firebase/app", rn = "0.13.2", w = new pt("@firebase/app"), an = "@firebase/app-compat", on = "@firebase/analytics-compat", sn = "@firebase/analytics", cn = "@firebase/app-check-compat", ln = "@firebase/app-check", un = "@firebase/auth", dn = "@firebase/auth-compat", fn = "@firebase/database", pn = "@firebase/data-connect", mn = "@firebase/database-compat", hn = "@firebase/functions", gn = "@firebase/functions-compat", _n = "@firebase/installations", vn = "@firebase/installations-compat", yn = "@firebase/messaging", bn = "@firebase/messaging-compat", xn = "@firebase/performance", Sn = "@firebase/performance-compat", Cn = "@firebase/remote-config", wn = "@firebase/remote-config-compat", Tn = "@firebase/storage", En = "@firebase/storage-compat", Dn = "@firebase/firestore", On = "@firebase/ai", kn = "@firebase/firestore-compat", An = "firebase", jn = "11.10.0", Mn = "[DEFAULT]", Nn = {
		[nn]: "fire-core",
		[an]: "fire-core-compat",
		[sn]: "fire-analytics",
		[on]: "fire-analytics-compat",
		[ln]: "fire-app-check",
		[cn]: "fire-app-check-compat",
		[un]: "fire-auth",
		[dn]: "fire-auth-compat",
		[fn]: "fire-rtdb",
		[pn]: "fire-data-connect",
		[mn]: "fire-rtdb-compat",
		[hn]: "fire-fn",
		[gn]: "fire-fn-compat",
		[_n]: "fire-iid",
		[vn]: "fire-iid-compat",
		[yn]: "fire-fcm",
		[bn]: "fire-fcm-compat",
		[xn]: "fire-perf",
		[Sn]: "fire-perf-compat",
		[Cn]: "fire-rc",
		[wn]: "fire-rc-compat",
		[Tn]: "fire-gcs",
		[En]: "fire-gcs-compat",
		[Dn]: "fire-fst",
		[kn]: "fire-fst-compat",
		[On]: "fire-vertex",
		"fire-js": "fire-js",
		[An]: "fire-js-all"
	}, Pn = /* @__PURE__ */ new Map(), Fn = /* @__PURE__ */ new Map(), In = /* @__PURE__ */ new Map(), T = new $e("app", "Firebase", {
		"no-app": "No Firebase App '{$appName}' has been created - call initializeApp() first",
		"bad-app-name": "Illegal App name: '{$appName}'",
		"duplicate-app": "Firebase App named '{$appName}' already exists with different options or config",
		"app-deleted": "Firebase App named '{$appName}' already deleted",
		"server-app-deleted": "Firebase Server App has been deleted",
		"no-options": "Need to provide options, when not being deployed to hosting via source.",
		"invalid-app-argument": "firebase.{$appName}() takes either no argument or a Firebase App instance.",
		"invalid-log-argument": "First argument to `onLog` must be null or a function.",
		"idb-open": "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
		"idb-get": "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
		"idb-set": "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
		"idb-delete": "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
		"finalization-registry-not-supported": "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
		"invalid-server-app-environment": "FirebaseServerApp is not for use in browser environments."
	}), Ln = class {
		constructor(e, t, n) {
			this._isDeleted = !1, this._options = Object.assign({}, e), this._config = Object.assign({}, t), this._name = t.name, this._automaticDataCollectionEnabled = t.automaticDataCollectionEnabled, this._container = n, this.container.addComponent(new y("app", () => this, "PUBLIC"));
		}
		get automaticDataCollectionEnabled() {
			return this.checkDestroyed(), this._automaticDataCollectionEnabled;
		}
		set automaticDataCollectionEnabled(e) {
			this.checkDestroyed(), this._automaticDataCollectionEnabled = e;
		}
		get name() {
			return this.checkDestroyed(), this._name;
		}
		get options() {
			return this.checkDestroyed(), this._options;
		}
		get config() {
			return this.checkDestroyed(), this._config;
		}
		get container() {
			return this._container;
		}
		get isDeleted() {
			return this._isDeleted;
		}
		set isDeleted(e) {
			this._isDeleted = e;
		}
		checkDestroyed() {
			if (this.isDeleted) throw T.create("app-deleted", { appName: this._name });
		}
	}, Rn = jn, zn = "firebase-heartbeat-database", Bn = 1, Vn = "firebase-heartbeat-store", Hn = null, Un = 1024, Wn = 30, Gn = class {
		constructor(e) {
			this.container = e, this._heartbeatsCache = null;
			let t = this.container.getProvider("app").getImmediate();
			this._storage = new Kn(t), this._heartbeatsCachePromise = this._storage.read().then((e) => (this._heartbeatsCache = e, e));
		}
		async triggerHeartbeat() {
			try {
				let e = this.container.getProvider("platform-logger").getImmediate().getPlatformInfoString(), t = Xt();
				if (this._heartbeatsCache?.heartbeats == null && (this._heartbeatsCache = await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null) || this._heartbeatsCache.lastSentHeartbeatDate === t || this._heartbeatsCache.heartbeats.some((e) => e.date === t)) return;
				if (this._heartbeatsCache.heartbeats.push({
					date: t,
					agent: e
				}), this._heartbeatsCache.heartbeats.length > Wn) {
					let e = $t(this._heartbeatsCache.heartbeats);
					this._heartbeatsCache.heartbeats.splice(e, 1);
				}
				return this._storage.overwrite(this._heartbeatsCache);
			} catch (e) {
				w.warn(e);
			}
		}
		async getHeartbeatsHeader() {
			try {
				if (this._heartbeatsCache === null && await this._heartbeatsCachePromise, this._heartbeatsCache?.heartbeats == null || this._heartbeatsCache.heartbeats.length === 0) return "";
				let e = Xt(), { heartbeatsToSend: t, unsentEntries: n } = Zt(this._heartbeatsCache.heartbeats), r = Be(JSON.stringify({
					version: 2,
					heartbeats: t
				}));
				return this._heartbeatsCache.lastSentHeartbeatDate = e, n.length > 0 ? (this._heartbeatsCache.heartbeats = n, await this._storage.overwrite(this._heartbeatsCache)) : (this._heartbeatsCache.heartbeats = [], this._storage.overwrite(this._heartbeatsCache)), r;
			} catch (e) {
				return w.warn(e), "";
			}
		}
	}, Kn = class {
		constructor(e) {
			this.app = e, this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
		}
		async runIndexedDBEnvironmentCheck() {
			return Ce() ? we().then(() => !0).catch(() => !1) : !1;
		}
		async read() {
			if (await this._canUseIndexedDBPromise) {
				let e = await qt(this.app);
				return e?.heartbeats ? e : { heartbeats: [] };
			} else return { heartbeats: [] };
		}
		async overwrite(e) {
			if (await this._canUseIndexedDBPromise) {
				let t = await this.read();
				return Jt(this.app, {
					lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? t.lastSentHeartbeatDate,
					heartbeats: e.heartbeats
				});
			} else return;
		}
		async add(e) {
			if (await this._canUseIndexedDBPromise) {
				let t = await this.read();
				return Jt(this.app, {
					lastSentHeartbeatDate: e.lastSentHeartbeatDate ?? t.lastSentHeartbeatDate,
					heartbeats: [...t.heartbeats, ...e.heartbeats]
				});
			} else return;
		}
	}, en("");
}));
//#endregion
//#region node_modules/tslib/tslib.es6.mjs
function Jn(e, t) {
	var n = {};
	for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
	if (e != null && typeof Object.getOwnPropertySymbols == "function") for (var i = 0, r = Object.getOwnPropertySymbols(e); i < r.length; i++) t.indexOf(r[i]) < 0 && Object.prototype.propertyIsEnumerable.call(e, r[i]) && (n[r[i]] = e[r[i]]);
	return n;
}
var Yn = t((() => {}));
//#endregion
//#region node_modules/@firebase/auth/dist/esm2017/index-35c79a8a.js
function Xn() {
	return { "dependent-sdk-initialized-before-auth": "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK." };
}
function Zn(e, ...t) {
	Oo.logLevel <= x.WARN && Oo.warn(`Auth (${Rn}): ${e}`, ...t);
}
function Qn(e, ...t) {
	Oo.logLevel <= x.ERROR && Oo.error(`Auth (${Rn}): ${e}`, ...t);
}
function E(e, ...t) {
	throw tr(e, ...t);
}
function D(e, ...t) {
	return tr(e, ...t);
}
function $n(e, t, n) {
	return new $e("auth", "Firebase", Object.assign(Object.assign({}, Eo()), { [t]: n })).create(t, { appName: e.name });
}
function O(e) {
	return $n(e, "operation-not-supported-in-this-environment", "Operations that alter the current user are not supported in conjunction with FirebaseServerApp");
}
function er(e, t, n) {
	let r = n;
	if (!(t instanceof r)) throw r.name !== t.constructor.name && E(e, "argument-error"), $n(e, "argument-error", `Type of ${t.constructor.name} does not match expected instance.Did you pass a reference from a different Auth SDK?`);
}
function tr(e, ...t) {
	if (typeof e != "string") {
		let n = t[0], r = [...t.slice(1)];
		return r[0] && (r[0].appName = e.name), e._errorFactory.create(n, ...r);
	}
	return Do.create(e, ...t);
}
function k(e, t, ...n) {
	if (!e) throw tr(t, ...n);
}
function A(e) {
	let t = "INTERNAL ASSERTION FAILED: " + e;
	throw Qn(t), Error(t);
}
function j(e, t) {
	e || A(t);
}
function nr() {
	return typeof self < "u" && self.location?.href || "";
}
function rr() {
	return ir() === "http:" || ir() === "https:";
}
function ir() {
	return typeof self < "u" && self.location?.protocol || null;
}
function ar() {
	return typeof navigator < "u" && navigator && "onLine" in navigator && typeof navigator.onLine == "boolean" && (rr() || be() || "connection" in navigator) ? navigator.onLine : !0;
}
function or() {
	if (typeof navigator > "u") return null;
	let e = navigator;
	return e.languages && e.languages[0] || e.language || null;
}
function sr(e, t) {
	j(e.emulator, "Emulator should always be set here");
	let { url: n } = e.emulator;
	return t ? `${n}${t.startsWith("/") ? t.slice(1) : t}` : n;
}
function M(e, t) {
	return e.tenantId && !t.tenantId ? Object.assign(Object.assign({}, t), { tenantId: e.tenantId }) : t;
}
async function N(e, t, n, r, i = {}) {
	return cr(e, i, async () => {
		let i = {}, a = {};
		r && (t === "GET" ? a = r : i = { body: JSON.stringify(r) });
		let o = ke(Object.assign({ key: e.config.apiKey }, a)).slice(1), s = await e._getAdditionalHeaders();
		s["Content-Type"] = "application/json", e.languageCode && (s["X-Firebase-Locale"] = e.languageCode);
		let c = Object.assign({
			method: t,
			headers: s
		}, i);
		return ye() || (c.referrerPolicy = "no-referrer"), e.emulatorConfig && pe(e.emulatorConfig.host) && (c.credentials = "include"), Ao.fetch()(await lr(e, e.config.apiHost, n, o), c);
	});
}
async function cr(e, t, n) {
	e._canInitEmulator = !1;
	let r = Object.assign(Object.assign({}, jo), t);
	try {
		let t = new Po(e), i = await Promise.race([n(), t.promise]);
		t.clearNetworkTimeout();
		let a = await i.json();
		if ("needConfirmation" in a) throw dr(e, "account-exists-with-different-credential", a);
		if (i.ok && !("errorMessage" in a)) return a;
		{
			let [t, n] = (i.ok ? a.errorMessage : a.error.message).split(" : ");
			if (t === "FEDERATED_USER_ID_ALREADY_LINKED") throw dr(e, "credential-already-in-use", a);
			if (t === "EMAIL_EXISTS") throw dr(e, "email-already-in-use", a);
			if (t === "USER_DISABLED") throw dr(e, "user-disabled", a);
			let o = r[t] || t.toLowerCase().replace(/[_\s]+/g, "-");
			if (n) throw $n(e, o, n);
			E(e, o);
		}
	} catch (t) {
		if (t instanceof v) throw t;
		E(e, "network-request-failed", { message: String(t) });
	}
}
async function P(e, t, n, r, i = {}) {
	let a = await N(e, t, n, r, i);
	return "mfaPendingCredential" in a && E(e, "multi-factor-auth-required", { _serverResponse: a }), a;
}
async function lr(e, t, n, r) {
	let i = `${t}${n}?${r}`, a = e, o = a.config.emulator ? sr(e.config, i) : `${e.config.apiScheme}://${i}`;
	return Mo.includes(n) && (await a._persistenceManagerAvailable, a._getPersistenceType() === "COOKIE") ? a._getPersistence()._getFinalTarget(o).toString() : o;
}
function ur(e) {
	switch (e) {
		case "ENFORCE": return "ENFORCE";
		case "AUDIT": return "AUDIT";
		case "OFF": return "OFF";
		default: return "ENFORCEMENT_STATE_UNSPECIFIED";
	}
}
function dr(e, t, n) {
	let r = { appName: e.name };
	n.email && (r.email = n.email), n.phoneNumber && (r.phoneNumber = n.phoneNumber);
	let i = D(e, t, r);
	return i.customData._tokenResponse = n, i;
}
function fr(e) {
	return e !== void 0 && e.getResponse !== void 0;
}
function pr(e) {
	return e !== void 0 && e.enterprise !== void 0;
}
async function mr(e) {
	return (await N(e, "GET", "/v1/recaptchaParams")).recaptchaSiteKey || "";
}
async function hr(e, t) {
	return N(e, "GET", "/v2/recaptchaConfig", M(e, t));
}
async function gr(e, t) {
	return N(e, "POST", "/v1/accounts:delete", t);
}
async function _r(e, t) {
	return N(e, "POST", "/v1/accounts:update", t);
}
async function vr(e, t) {
	return N(e, "POST", "/v1/accounts:lookup", t);
}
function yr(e) {
	if (e) try {
		let t = new Date(Number(e));
		if (!isNaN(t.getTime())) return t.toUTCString();
	} catch {}
}
async function br(e, t = !1) {
	let n = _(e), r = await n.getIdToken(t), i = Sr(r);
	k(i && i.exp && i.auth_time && i.iat, n.auth, "internal-error");
	let a = typeof i.firebase == "object" ? i.firebase : void 0, o = a?.sign_in_provider;
	return {
		claims: i,
		token: r,
		authTime: yr(xr(i.auth_time)),
		issuedAtTime: yr(xr(i.iat)),
		expirationTime: yr(xr(i.exp)),
		signInProvider: o || null,
		signInSecondFactor: a?.sign_in_second_factor || null
	};
}
function xr(e) {
	return Number(e) * 1e3;
}
function Sr(e) {
	let [t, n, r] = e.split(".");
	if (t === void 0 || n === void 0 || r === void 0) return Qn("JWT malformed, contained fewer than 3 sections"), null;
	try {
		let e = Ve(n);
		return e ? JSON.parse(e) : (Qn("Failed to decode base64 JWT payload"), null);
	} catch (e) {
		return Qn("Caught error parsing JWT payload as JSON", e?.toString()), null;
	}
}
function Cr(e) {
	let t = Sr(e);
	return k(t, "internal-error"), k(t.exp !== void 0, "internal-error"), k(t.iat !== void 0, "internal-error"), Number(t.exp) - Number(t.iat);
}
async function wr(e, t, n = !1) {
	if (n) return t;
	try {
		return await t;
	} catch (t) {
		throw t instanceof v && Tr(t) && e.auth.currentUser === e && await e.auth.signOut(), t;
	}
}
function Tr({ code: e }) {
	return e === "auth/user-disabled" || e === "auth/user-token-expired";
}
async function Er(e) {
	let t = e.auth, n = await wr(e, vr(t, { idToken: await e.getIdToken() }));
	k(n?.users.length, t, "internal-error");
	let r = n.users[0];
	e._notifyReloadListener(r);
	let i = r.providerUserInfo?.length ? kr(r.providerUserInfo) : [], a = Or(e.providerData, i), o = e.isAnonymous, s = !(e.email && r.passwordHash) && !a?.length, c = o ? s : !1, l = {
		uid: r.localId,
		displayName: r.displayName || null,
		photoURL: r.photoUrl || null,
		email: r.email || null,
		emailVerified: r.emailVerified || !1,
		phoneNumber: r.phoneNumber || null,
		tenantId: r.tenantId || null,
		providerData: a,
		metadata: new Lo(r.createdAt, r.lastLoginAt),
		isAnonymous: c
	};
	Object.assign(e, l);
}
async function Dr(e) {
	let t = _(e);
	await Er(t), await t.auth._persistUserIfCurrent(t), t.auth._notifyListenersIfCurrent(t);
}
function Or(e, t) {
	return [...e.filter((e) => !t.some((t) => t.providerId === e.providerId)), ...t];
}
function kr(e) {
	return e.map((e) => {
		var { providerId: t } = e, n = Jn(e, ["providerId"]);
		return {
			providerId: t,
			uid: n.rawId || "",
			displayName: n.displayName || null,
			email: n.email || null,
			phoneNumber: n.phoneNumber || null,
			photoURL: n.photoUrl || null
		};
	});
}
async function Ar(e, t) {
	let n = await cr(e, {}, async () => {
		let n = ke({
			grant_type: "refresh_token",
			refresh_token: t
		}).slice(1), { tokenApiHost: r, apiKey: i } = e.config, a = await lr(e, r, "/v1/token", `key=${i}`), o = await e._getAdditionalHeaders();
		o["Content-Type"] = "application/x-www-form-urlencoded";
		let s = {
			method: "POST",
			headers: o,
			body: n
		};
		return e.emulatorConfig && pe(e.emulatorConfig.host) && (s.credentials = "include"), Ao.fetch()(a, s);
	});
	return {
		accessToken: n.access_token,
		expiresIn: n.expires_in,
		refreshToken: n.refresh_token
	};
}
async function jr(e, t) {
	return N(e, "POST", "/v2/accounts:revokeToken", M(e, t));
}
function F(e, t) {
	k(typeof e == "string" || e === void 0, "internal-error", { appName: t });
}
function I(e) {
	j(e instanceof Function, "Expected a class definition");
	let t = zo.get(e);
	return t ? (j(t instanceof e, "Instance stored in cache mismatched with class"), t) : (t = new e(), zo.set(e, t), t);
}
function Mr(e, t, n) {
	return `firebase:${e}:${t}:${n}`;
}
function Nr(e) {
	let t = e.toLowerCase();
	if (t.includes("opera/") || t.includes("opr/") || t.includes("opios/")) return "Opera";
	if (Lr(t)) return "IEMobile";
	if (t.includes("msie") || t.includes("trident/")) return "IE";
	if (t.includes("edge/")) return "Edge";
	if (Pr(t)) return "Firefox";
	if (t.includes("silk/")) return "Silk";
	if (zr(t)) return "Blackberry";
	if (Br(t)) return "Webos";
	if (Fr(t)) return "Safari";
	if ((t.includes("chrome/") || Ir(t)) && !t.includes("edge/")) return "Chrome";
	if (Rr(t)) return "Android";
	{
		let t = e.match(/([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/);
		if (t?.length === 2) return t[1];
	}
	return "Other";
}
function Pr(e = g()) {
	return /firefox\//i.test(e);
}
function Fr(e = g()) {
	let t = e.toLowerCase();
	return t.includes("safari/") && !t.includes("chrome/") && !t.includes("crios/") && !t.includes("android");
}
function Ir(e = g()) {
	return /crios\//i.test(e);
}
function Lr(e = g()) {
	return /iemobile/i.test(e);
}
function Rr(e = g()) {
	return /android/i.test(e);
}
function zr(e = g()) {
	return /blackberry/i.test(e);
}
function Br(e = g()) {
	return /webos/i.test(e);
}
function Vr(e = g()) {
	return /iphone|ipad|ipod/i.test(e) || /macintosh/i.test(e) && /mobile/i.test(e);
}
function Hr(e = g()) {
	return Vr(e) && !!window.navigator?.standalone;
}
function Ur() {
	return Se() && document.documentMode === 10;
}
function Wr(e = g()) {
	return Vr(e) || Rr(e) || Br(e) || zr(e) || /windows phone/i.test(e) || Lr(e);
}
function Gr(e, t = []) {
	let n;
	switch (e) {
		case "Browser":
			n = Nr(g());
			break;
		case "Worker":
			n = `${Nr(g())}-${e}`;
			break;
		default: n = e;
	}
	let r = t.length ? t.join(",") : "FirebaseCore-web";
	return `${n}/JsCore/${Rn}/${r}`;
}
async function Kr(e, t = {}) {
	return N(e, "GET", "/v2/passwordPolicy", M(e, t));
}
function L(e) {
	return _(e);
}
function qr(e) {
	Jo = e;
}
function Jr(e) {
	return Jo.loadJS(e);
}
function Yr() {
	return Jo.recaptchaV2Script;
}
function Xr() {
	return Jo.recaptchaEnterpriseScript;
}
function Zr() {
	return Jo.gapiScript;
}
function Qr(e) {
	return `__${e}${Math.floor(Math.random() * 1e6)}`;
}
function $r(e) {
	let t = [];
	for (let n = 0; n < e; n++) t.push("1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 62)));
	return t.join("");
}
async function ei(e, t, n, r = !1, i = !1) {
	let a = new is(e), o;
	if (i) o = rs;
	else try {
		o = await a.verify(n);
	} catch {
		o = await a.verify(n, !0);
	}
	let s = Object.assign({}, t);
	if (n === "mfaSmsEnrollment" || n === "mfaSmsSignIn") {
		if ("phoneEnrollmentInfo" in s) {
			let e = s.phoneEnrollmentInfo.phoneNumber, t = s.phoneEnrollmentInfo.recaptchaToken;
			Object.assign(s, { phoneEnrollmentInfo: {
				phoneNumber: e,
				recaptchaToken: t,
				captchaResponse: o,
				clientType: "CLIENT_TYPE_WEB",
				recaptchaVersion: "RECAPTCHA_ENTERPRISE"
			} });
		} else if ("phoneSignInInfo" in s) {
			let e = s.phoneSignInInfo.recaptchaToken;
			Object.assign(s, { phoneSignInInfo: {
				recaptchaToken: e,
				captchaResponse: o,
				clientType: "CLIENT_TYPE_WEB",
				recaptchaVersion: "RECAPTCHA_ENTERPRISE"
			} });
		}
		return s;
	}
	return r ? Object.assign(s, { captchaResp: o }) : Object.assign(s, { captchaResponse: o }), Object.assign(s, { clientType: "CLIENT_TYPE_WEB" }), Object.assign(s, { recaptchaVersion: "RECAPTCHA_ENTERPRISE" }), s;
}
async function R(e, t, n, r, i) {
	return i === "EMAIL_PASSWORD_PROVIDER" ? e._getRecaptchaConfig()?.isProviderEnabled("EMAIL_PASSWORD_PROVIDER") ? r(e, await ei(e, t, n, n === "getOobCode")) : r(e, t).catch(async (i) => i.code === "auth/missing-recaptcha-token" ? (console.log(`${n} is protected by reCAPTCHA Enterprise for this project. Automatically triggering the reCAPTCHA flow and restarting the flow.`), r(e, await ei(e, t, n, n === "getOobCode"))) : Promise.reject(i)) : i === "PHONE_PROVIDER" ? e._getRecaptchaConfig()?.isProviderEnabled("PHONE_PROVIDER") ? r(e, await ei(e, t, n)).catch(async (i) => e._getRecaptchaConfig()?.getProviderEnforcementState("PHONE_PROVIDER") === "AUDIT" && (i.code === "auth/missing-recaptcha-token" || i.code === "auth/invalid-app-credential") ? (console.log(`Failed to verify with reCAPTCHA Enterprise. Automatically triggering the reCAPTCHA v2 flow to complete the ${n} flow.`), r(e, await ei(e, t, n, !1, !0))) : Promise.reject(i)) : r(e, await ei(e, t, n, !1, !0)) : Promise.reject(i + " provider is not supported.");
}
async function ti(e) {
	let t = L(e), n = new Fo(await hr(t, {
		clientType: "CLIENT_TYPE_WEB",
		version: "RECAPTCHA_ENTERPRISE"
	}));
	t.tenantId == null ? t._agentRecaptchaConfig = n : t._tenantRecaptchaConfigs[t.tenantId] = n, n.isAnyProviderEnabled() && new is(t).verify();
}
function ni(e, t) {
	let n = Ht(e, "auth");
	if (n.isInitialized()) {
		let e = n.getImmediate();
		if (De(n.getOptions(), t ?? {})) return e;
		E(e, "already-initialized");
	}
	return n.initialize({ options: t });
}
function ri(e, t) {
	let n = t?.persistence || [], r = (Array.isArray(n) ? n : [n]).map(I);
	t?.errorMap && e._updateErrorMap(t.errorMap), e._initializeWithPersistence(r, t?.popupRedirectResolver);
}
function ii(e, t, n) {
	let r = L(e);
	k(/^https?:\/\//.test(t), r, "invalid-emulator-scheme");
	let i = !!n?.disableWarnings, a = ai(t), { host: o, port: s } = oi(t), c = s === null ? "" : `:${s}`, l = { url: `${a}//${o}${c}/` }, u = Object.freeze({
		host: o,
		port: s,
		protocol: a.replace(":", ""),
		options: Object.freeze({ disableWarnings: i })
	});
	if (!r._canInitEmulator) {
		k(r.config.emulator && r.emulatorConfig, r, "emulator-config-failed"), k(De(l, r.config.emulator) && De(u, r.emulatorConfig), r, "emulator-config-failed");
		return;
	}
	r.config.emulator = l, r.emulatorConfig = u, r.settings.appVerificationDisabledForTesting = !0, pe(o) ? (me(`${a}//${o}${c}`), _e("Auth", !0)) : i || ci();
}
function ai(e) {
	let t = e.indexOf(":");
	return t < 0 ? "" : e.substr(0, t + 1);
}
function oi(e) {
	let t = ai(e), n = /(\/\/)?([^?#/]+)/.exec(e.substr(t.length));
	if (!n) return {
		host: "",
		port: null
	};
	let r = n[2].split("@").pop() || "", i = /^(\[[^\]]+\])(:|$)/.exec(r);
	if (i) {
		let e = i[1];
		return {
			host: e,
			port: si(r.substr(e.length + 1))
		};
	} else {
		let [e, t] = r.split(":");
		return {
			host: e,
			port: si(t)
		};
	}
}
function si(e) {
	if (!e) return null;
	let t = Number(e);
	return isNaN(t) ? null : t;
}
function ci() {
	function e() {
		let e = document.createElement("p"), t = e.style;
		e.innerText = "Running in emulator mode. Do not use with production credentials.", t.position = "fixed", t.width = "100%", t.backgroundColor = "#ffffff", t.border = ".1em solid #000000", t.color = "#b50000", t.bottom = "0px", t.left = "0px", t.margin = "0px", t.zIndex = "10000", t.textAlign = "center", e.classList.add("firebase-emulator-warning"), document.body.appendChild(e);
	}
	typeof console < "u" && typeof console.info == "function" && console.info("WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials."), typeof window < "u" && typeof document < "u" && (document.readyState === "loading" ? window.addEventListener("DOMContentLoaded", e) : e());
}
async function li(e, t) {
	return N(e, "POST", "/v1/accounts:resetPassword", M(e, t));
}
async function ui(e, t) {
	return N(e, "POST", "/v1/accounts:update", t);
}
async function di(e, t) {
	return N(e, "POST", "/v1/accounts:signUp", t);
}
async function fi(e, t) {
	return N(e, "POST", "/v1/accounts:update", M(e, t));
}
async function pi(e, t) {
	return P(e, "POST", "/v1/accounts:signInWithPassword", M(e, t));
}
async function mi(e, t) {
	return N(e, "POST", "/v1/accounts:sendOobCode", M(e, t));
}
async function hi(e, t) {
	return mi(e, t);
}
async function gi(e, t) {
	return mi(e, t);
}
async function _i(e, t) {
	return mi(e, t);
}
async function vi(e, t) {
	return mi(e, t);
}
async function yi(e, t) {
	return P(e, "POST", "/v1/accounts:signInWithEmailLink", M(e, t));
}
async function bi(e, t) {
	return P(e, "POST", "/v1/accounts:signInWithEmailLink", M(e, t));
}
async function xi(e, t) {
	return P(e, "POST", "/v1/accounts:signInWithIdp", M(e, t));
}
async function Si(e, t) {
	return N(e, "POST", "/v1/accounts:sendVerificationCode", M(e, t));
}
async function Ci(e, t) {
	return P(e, "POST", "/v1/accounts:signInWithPhoneNumber", M(e, t));
}
async function wi(e, t) {
	let n = await P(e, "POST", "/v1/accounts:signInWithPhoneNumber", M(e, t));
	if (n.temporaryProof) throw dr(e, "account-exists-with-different-credential", n);
	return n;
}
async function Ti(e, t) {
	return P(e, "POST", "/v1/accounts:signInWithPhoneNumber", M(e, Object.assign(Object.assign({}, t), { operation: "REAUTH" })), cs);
}
function Ei(e) {
	switch (e) {
		case "recoverEmail": return "RECOVER_EMAIL";
		case "resetPassword": return "PASSWORD_RESET";
		case "signIn": return "EMAIL_SIGNIN";
		case "verifyEmail": return "VERIFY_EMAIL";
		case "verifyAndChangeEmail": return "VERIFY_AND_CHANGE_EMAIL";
		case "revertSecondFactorAddition": return "REVERT_SECOND_FACTOR_ADDITION";
		default: return null;
	}
}
function Di(e) {
	let t = Ae(je(e)).link, n = t ? Ae(je(t)).deep_link_id : null, r = Ae(je(e)).deep_link_id;
	return (r ? Ae(je(r)).link : null) || r || n || t || e;
}
async function Oi(e, t) {
	return P(e, "POST", "/v1/accounts:signUp", M(e, t));
}
function ki(e) {
	return e.providerId ? e.providerId : "phoneNumber" in e ? "phone" : null;
}
async function Ai(e) {
	if (C(e.app)) return Promise.reject(O(e));
	let t = L(e);
	if (await t._initializationPromise, t.currentUser?.isAnonymous) return new Z({
		user: t.currentUser,
		providerId: null,
		operationType: "signIn"
	});
	let n = await Oi(t, { returnSecureToken: !0 }), r = await Z._fromIdTokenResponse(t, "signIn", n, !0);
	return await t._updateCurrentUser(r.user), r;
}
function ji(e, t, n, r) {
	return (t === "reauthenticate" ? n._getReauthenticationResolver(e) : n._getIdTokenResponse(e)).catch((n) => {
		throw n.code === "auth/multi-factor-auth-required" ? ds._fromErrorAndOperation(e, n, t, r) : n;
	});
}
function Mi(e) {
	return new Set(e.map(({ providerId: e }) => e).filter((e) => !!e));
}
async function Ni(e, t) {
	let n = _(e);
	await Fi(!0, n, t);
	let { providerUserInfo: r } = await _r(n.auth, {
		idToken: await n.getIdToken(),
		deleteProvider: [t]
	}), i = Mi(r || []);
	return n.providerData = n.providerData.filter((e) => i.has(e.providerId)), i.has("phone") || (n.phoneNumber = null), await n.auth._persistUserIfCurrent(n), n;
}
async function Pi(e, t, n = !1) {
	let r = await wr(e, t._linkToIdToken(e.auth, await e.getIdToken()), n);
	return Z._forOperation(e, "link", r);
}
async function Fi(e, t, n) {
	await Er(t);
	let r = Mi(t.providerData), i = e === !1 ? "provider-already-linked" : "no-such-provider";
	k(r.has(n) === e, t.auth, i);
}
async function Ii(e, t, n = !1) {
	let { auth: r } = e;
	if (C(r.app)) return Promise.reject(O(r));
	let i = "reauthenticate";
	try {
		let a = await wr(e, ji(r, i, t, e), n);
		k(a.idToken, r, "internal-error");
		let o = Sr(a.idToken);
		k(o, r, "internal-error");
		let { sub: s } = o;
		return k(e.uid === s, r, "user-mismatch"), Z._forOperation(e, i, a);
	} catch (e) {
		throw e?.code === "auth/user-not-found" && E(r, "user-mismatch"), e;
	}
}
async function Li(e, t, n = !1) {
	if (C(e.app)) return Promise.reject(O(e));
	let r = "signIn", i = await ji(e, r, t), a = await Z._fromIdTokenResponse(e, r, i);
	return n || await e._updateCurrentUser(a.user), a;
}
async function Ri(e, t) {
	return Li(L(e), t);
}
async function zi(e, t) {
	let n = _(e);
	return await Fi(!1, n, t.providerId), Pi(n, t);
}
async function Bi(e, t) {
	return P(e, "POST", "/v1/accounts:signInWithCustomToken", M(e, t));
}
async function Vi(e, t) {
	if (C(e.app)) return Promise.reject(O(e));
	let n = L(e), r = await Bi(n, {
		token: t,
		returnSecureToken: !0
	}), i = await Z._fromIdTokenResponse(n, "signIn", r);
	return await n._updateCurrentUser(i.user), i;
}
function Hi(e, t, n) {
	k(n.url?.length > 0, e, "invalid-continue-uri"), k(n.dynamicLinkDomain === void 0 || n.dynamicLinkDomain.length > 0, e, "invalid-dynamic-link-domain"), k(n.linkDomain === void 0 || n.linkDomain.length > 0, e, "invalid-hosting-link-domain"), t.continueUrl = n.url, t.dynamicLinkDomain = n.dynamicLinkDomain, t.linkDomain = n.linkDomain, t.canHandleCodeInApp = n.handleCodeInApp, n.iOS && (k(n.iOS.bundleId.length > 0, e, "missing-ios-bundle-id"), t.iOSBundleId = n.iOS.bundleId), n.android && (k(n.android.packageName.length > 0, e, "missing-android-pkg-name"), t.androidInstallApp = n.android.installApp, t.androidMinimumVersionCode = n.android.minimumVersion, t.androidPackageName = n.android.packageName);
}
async function Ui(e) {
	let t = L(e);
	t._getPasswordPolicyInternal() && await t._updatePasswordPolicy();
}
async function Wi(e, t, n) {
	let r = L(e), i = {
		requestType: "PASSWORD_RESET",
		email: t,
		clientType: "CLIENT_TYPE_WEB"
	};
	n && Hi(r, i, n), await R(r, i, "getOobCode", gi, "EMAIL_PASSWORD_PROVIDER");
}
async function Gi(e, t, n) {
	await li(_(e), {
		oobCode: t,
		newPassword: n
	}).catch(async (t) => {
		throw t.code === "auth/password-does-not-meet-requirements" && Ui(e), t;
	});
}
async function Ki(e, t) {
	await fi(_(e), { oobCode: t });
}
async function qi(e, t, n) {
	if (C(e.app)) return Promise.reject(O(e));
	let r = L(e), i = await R(r, {
		returnSecureToken: !0,
		email: t,
		password: n,
		clientType: "CLIENT_TYPE_WEB"
	}, "signUpPassword", Oi, "EMAIL_PASSWORD_PROVIDER").catch((t) => {
		throw t.code === "auth/password-does-not-meet-requirements" && Ui(e), t;
	}), a = await Z._fromIdTokenResponse(r, "signIn", i);
	return await r._updateCurrentUser(a.user), a;
}
function Ji(e, t, n) {
	return C(e.app) ? Promise.reject(O(e)) : Ri(_(e), U.credential(t, n)).catch(async (t) => {
		throw t.code === "auth/password-does-not-meet-requirements" && Ui(e), t;
	});
}
async function Yi(e, t, n) {
	let r = L(e), i = {
		requestType: "EMAIL_SIGNIN",
		email: t,
		clientType: "CLIENT_TYPE_WEB"
	};
	function a(e, t) {
		k(t.handleCodeInApp, r, "argument-error"), t && Hi(r, e, t);
	}
	a(i, n), await R(r, i, "getOobCode", _i, "EMAIL_PASSWORD_PROVIDER");
}
function Xi(e, t) {
	return us.parseLink(t)?.operation === "EMAIL_SIGNIN";
}
async function Zi(e, t, n) {
	if (C(e.app)) return Promise.reject(O(e));
	let r = _(e), i = U.credentialWithLink(t, n || nr());
	return k(i._tenantId === (r.tenantId || null), r, "tenant-id-mismatch"), Ri(r, i);
}
async function Qi(e, t) {
	return N(e, "POST", "/v1/accounts:createAuthUri", M(e, t));
}
async function $i(e, t) {
	let n = {
		identifier: t,
		continueUri: rr() ? nr() : "http://localhost"
	}, { signinMethods: r } = await Qi(_(e), n);
	return r || [];
}
async function ea(e, t) {
	let n = _(e), r = {
		requestType: "VERIFY_EMAIL",
		idToken: await e.getIdToken()
	};
	t && Hi(n.auth, r, t);
	let { email: i } = await hi(n.auth, r);
	i !== e.email && await e.reload();
}
async function ta(e, t, n) {
	let r = _(e), i = {
		requestType: "VERIFY_AND_CHANGE_EMAIL",
		idToken: await e.getIdToken(),
		newEmail: t
	};
	n && Hi(r.auth, i, n);
	let { email: a } = await vi(r.auth, i);
	a !== e.email && await e.reload();
}
async function na(e, t) {
	return N(e, "POST", "/v1/accounts:update", t);
}
async function ra(e, { displayName: t, photoURL: n }) {
	if (t === void 0 && n === void 0) return;
	let r = _(e), i = {
		idToken: await r.getIdToken(),
		displayName: t,
		photoUrl: n,
		returnSecureToken: !0
	}, a = await wr(r, na(r.auth, i));
	r.displayName = a.displayName || null, r.photoURL = a.photoUrl || null;
	let o = r.providerData.find(({ providerId: e }) => e === "password");
	o && (o.displayName = r.displayName, o.photoURL = r.photoURL), await r._updateTokensIfNecessary(a);
}
function ia(e, t) {
	let n = _(e);
	return C(n.auth.app) ? Promise.reject(O(n.auth)) : oa(n, t, null);
}
function aa(e, t) {
	return oa(_(e), null, t);
}
async function oa(e, t, n) {
	let { auth: r } = e, i = {
		idToken: await e.getIdToken(),
		returnSecureToken: !0
	};
	t && (i.email = t), n && (i.password = n);
	let a = await wr(e, ui(r, i));
	await e._updateTokensIfNecessary(a, !0);
}
function sa(e) {
	if (!e) return null;
	let { providerId: t } = e, n = e.rawUserInfo ? JSON.parse(e.rawUserInfo) : {}, r = e.isNewUser || e.kind === "identitytoolkit#SignupNewUserResponse";
	if (!t && e?.idToken) {
		let t = Sr(e.idToken)?.firebase?.sign_in_provider;
		if (t) return new Q(r, t !== "anonymous" && t !== "custom" ? t : null);
	}
	if (!t) return null;
	switch (t) {
		case "facebook.com": return new ps(r, n);
		case "github.com": return new ms(r, n);
		case "google.com": return new hs(r, n);
		case "twitter.com": return new gs(r, n, e.screenName || null);
		case "custom":
		case "anonymous": return new Q(r, null);
		default: return new Q(r, t, n);
	}
}
function ca(e) {
	let { user: t, _tokenResponse: n } = e;
	return t.isAnonymous && !n ? {
		providerId: null,
		isNewUser: !1,
		profile: null
	} : sa(n);
}
function la(e, t) {
	return _(e).setPersistence(t);
}
function ua(e, t, n, r) {
	return _(e).onIdTokenChanged(t, n, r);
}
function da(e, t, n) {
	return _(e).beforeAuthStateChanged(t, n);
}
function fa(e, t) {
	return L(e).revokeAccessToken(t);
}
async function pa(e) {
	return _(e).delete();
}
function ma(e, t) {
	return N(e, "POST", "/v2/accounts/mfaEnrollment:start", M(e, t));
}
function ha(e, t) {
	return N(e, "POST", "/v2/accounts/mfaEnrollment:finalize", M(e, t));
}
function ga(e, t) {
	return N(e, "POST", "/v2/accounts/mfaEnrollment:start", M(e, t));
}
function _a(e, t) {
	return N(e, "POST", "/v2/accounts/mfaEnrollment:finalize", M(e, t));
}
function va(e) {
	let t = e.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&"), n = RegExp(`${t}=([^;]+)`);
	return document.cookie.match(n)?.[1] ?? null;
}
function ya(e) {
	return `${window.location.protocol === "http:" ? "__dev_" : "__HOST-"}FIREBASE_${e.split(":")[3]}`;
}
function ba(e) {
	return Promise.all(e.map(async (e) => {
		try {
			return {
				fulfilled: !0,
				value: await e
			};
		} catch (e) {
			return {
				fulfilled: !1,
				reason: e
			};
		}
	}));
}
function xa(e = "", t = 10) {
	let n = "";
	for (let e = 0; e < t; e++) n += Math.floor(Math.random() * 10);
	return e + n;
}
function z() {
	return window;
}
function Sa(e) {
	z().location.href = e;
}
function Ca() {
	return z().WorkerGlobalScope !== void 0 && typeof z().importScripts == "function";
}
async function wa() {
	if (!(navigator != null && navigator.serviceWorker)) return null;
	try {
		return (await navigator.serviceWorker.ready).active;
	} catch {
		return null;
	}
}
function Ta() {
	return (navigator == null ? void 0 : navigator.serviceWorker)?.controller || null;
}
function Ea() {
	return Ca() ? self : null;
}
function Da(e, t) {
	return e.transaction([js], t ? "readwrite" : "readonly").objectStore(js);
}
function Oa() {
	return new Ns(indexedDB.deleteDatabase(ks)).toPromise();
}
function ka() {
	let e = indexedDB.open(ks, As);
	return new Promise((t, n) => {
		e.addEventListener("error", () => {
			n(e.error);
		}), e.addEventListener("upgradeneeded", () => {
			let t = e.result;
			try {
				t.createObjectStore(js, { keyPath: Ms });
			} catch (e) {
				n(e);
			}
		}), e.addEventListener("success", async () => {
			let n = e.result;
			n.objectStoreNames.contains(js) ? t(n) : (n.close(), await Oa(), t(await ka()));
		});
	});
}
async function Aa(e, t, n) {
	return new Ns(Da(e, !0).put({
		[Ms]: t,
		value: n
	})).toPromise();
}
async function ja(e, t) {
	let n = await new Ns(Da(e, !1).get(t)).toPromise();
	return n === void 0 ? null : n.value;
}
function Ma(e, t) {
	return new Ns(Da(e, !0).delete(t)).toPromise();
}
function Na(e, t) {
	return N(e, "POST", "/v2/accounts/mfaSignIn:start", M(e, t));
}
function Pa(e, t) {
	return N(e, "POST", "/v2/accounts/mfaSignIn:finalize", M(e, t));
}
function Fa(e, t) {
	return N(e, "POST", "/v2/accounts/mfaSignIn:finalize", M(e, t));
}
function Ia(e) {
	return e.length <= 6 && /^\s*[a-zA-Z0-9\-]*\s*$/.test(e);
}
function La() {
	let e = null;
	return new Promise((t) => {
		if (document.readyState === "complete") {
			t();
			return;
		}
		e = () => t(), window.addEventListener("load", e);
	}).catch((t) => {
		throw e && window.removeEventListener("load", e), t;
	});
}
async function Ra(e, t, n) {
	if (C(e.app)) return Promise.reject(O(e));
	let r = L(e);
	return new Gs(await Ba(r, t, _(n)), (e) => Ri(r, e));
}
async function za(e, t, n) {
	let r = _(e);
	return await Fi(!1, r, "phone"), new Gs(await Ba(r.auth, t, _(n)), (e) => zi(r, e));
}
async function Ba(e, t, n) {
	if (!e._getRecaptchaConfig()) try {
		await ti(e);
	} catch {
		console.log("Failed to initialize reCAPTCHA Enterprise config. Triggering the reCAPTCHA v2 verification.");
	}
	try {
		let r;
		if (r = typeof t == "string" ? { phoneNumber: t } : t, "session" in r) {
			let t = r.session;
			if ("phoneNumber" in r) return k(t.type === "enroll", e, "internal-error"), (await R(e, {
				idToken: t.credential,
				phoneEnrollmentInfo: {
					phoneNumber: r.phoneNumber,
					clientType: "CLIENT_TYPE_WEB"
				}
			}, "mfaSmsEnrollment", async (e, t) => t.phoneEnrollmentInfo.captchaResponse === rs ? (k(n?.type === Hs, e, "argument-error"), ma(e, await Va(e, t, n))) : ma(e, t), "PHONE_PROVIDER").catch((e) => Promise.reject(e))).phoneSessionInfo.sessionInfo;
			{
				k(t.type === "signin", e, "internal-error");
				let i = r.multiFactorHint?.uid || r.multiFactorUid;
				return k(i, e, "missing-multi-factor-info"), (await R(e, {
					mfaPendingCredential: t.credential,
					mfaEnrollmentId: i,
					phoneSignInInfo: { clientType: "CLIENT_TYPE_WEB" }
				}, "mfaSmsSignIn", async (e, t) => t.phoneSignInInfo.captchaResponse === rs ? (k(n?.type === Hs, e, "argument-error"), Na(e, await Va(e, t, n))) : Na(e, t), "PHONE_PROVIDER").catch((e) => Promise.reject(e))).phoneResponseInfo.sessionInfo;
			}
		} else return (await R(e, {
			phoneNumber: r.phoneNumber,
			clientType: "CLIENT_TYPE_WEB"
		}, "sendVerificationCode", async (e, t) => t.captchaResponse === rs ? (k(n?.type === Hs, e, "argument-error"), Si(e, await Va(e, t, n))) : Si(e, t), "PHONE_PROVIDER").catch((e) => Promise.reject(e))).sessionInfo;
	} finally {
		n?._reset();
	}
}
async function Va(e, t, n) {
	k(n.type === Hs, e, "argument-error");
	let r = await n.verify();
	k(typeof r == "string", e, "argument-error");
	let i = Object.assign({}, t);
	if ("phoneEnrollmentInfo" in i) {
		let e = i.phoneEnrollmentInfo.phoneNumber, t = i.phoneEnrollmentInfo.captchaResponse, n = i.phoneEnrollmentInfo.clientType, a = i.phoneEnrollmentInfo.recaptchaVersion;
		return Object.assign(i, { phoneEnrollmentInfo: {
			phoneNumber: e,
			recaptchaToken: r,
			captchaResponse: t,
			clientType: n,
			recaptchaVersion: a
		} }), i;
	} else if ("phoneSignInInfo" in i) {
		let e = i.phoneSignInInfo.captchaResponse, t = i.phoneSignInInfo.clientType, n = i.phoneSignInInfo.recaptchaVersion;
		return Object.assign(i, { phoneSignInInfo: {
			recaptchaToken: r,
			captchaResponse: e,
			clientType: t,
			recaptchaVersion: n
		} }), i;
	} else return Object.assign(i, { recaptchaToken: r }), i;
}
function Ha(e, t) {
	return t ? I(t) : (k(e._popupRedirectResolver, e, "argument-error"), e._popupRedirectResolver);
}
function Ua(e) {
	return Li(e.auth, new qs(e), e.bypassAuthState);
}
function Wa(e) {
	let { auth: t, user: n } = e;
	return k(n, t, "internal-error"), Ii(n, new qs(e), e.bypassAuthState);
}
async function Ga(e) {
	let { auth: t, user: n } = e;
	return k(n, t, "internal-error"), Pi(n, new qs(e), e.bypassAuthState);
}
async function Ka(e, t, n) {
	if (C(e.app)) return Promise.reject(D(e, "operation-not-supported-in-this-environment"));
	let r = L(e);
	return er(e, t, W), new Xs(r, "signInViaPopup", t, Ha(r, n)).executeNotNull();
}
async function qa(e, t, n) {
	let r = _(e);
	er(r.auth, t, W);
	let i = Ha(r.auth, n);
	return new Xs(r.auth, "linkViaPopup", t, i, r).executeNotNull();
}
async function Ja(e, t) {
	let n = Qa(t), r = Za(e);
	if (!await r._isAvailable()) return !1;
	let i = await r._get(n) === "true";
	return await r._remove(n), i;
}
async function Ya(e, t) {
	return Za(e)._set(Qa(t), "true");
}
function Xa(e, t) {
	Qs.set(e._key(), t);
}
function Za(e) {
	return I(e._redirectPersistence);
}
function Qa(e) {
	return Mr(Zs, e.config.apiKey, e.name);
}
function $a(e, t, n) {
	return eo(e, t, n);
}
async function eo(e, t, n) {
	if (C(e.app)) return Promise.reject(O(e));
	let r = L(e);
	er(e, t, W), await r._initializationPromise;
	let i = Ha(r, n);
	return await Ya(i, r), i._openRedirect(r, t, "signInViaRedirect");
}
function to(e, t, n) {
	return no(e, t, n);
}
async function no(e, t, n) {
	let r = _(e);
	er(r.auth, t, W), await r.auth._initializationPromise;
	let i = Ha(r.auth, n);
	await Fi(!1, r, t.providerId), await Ya(i, r.auth);
	let a = await ao(r);
	return i._openRedirect(r.auth, t, "linkViaRedirect", a);
}
async function ro(e, t) {
	return await L(e)._initializationPromise, io(e, t, !1);
}
async function io(e, t, n = !1) {
	if (C(e.app)) return Promise.reject(O(e));
	let r = L(e), i = await new $s(r, Ha(r, t), n).execute();
	return i && !n && (delete i.user._redirectEventId, await r._persistUserIfCurrent(i.user), await r._setRedirectUser(null, t)), i;
}
async function ao(e) {
	let t = xa(`${e.uid}:::`);
	return e._redirectEventId = t, await e.auth._setRedirectUser(e), await e.auth._persistUserIfCurrent(e), t;
}
function oo(e) {
	return [
		e.type,
		e.eventId,
		e.sessionId,
		e.tenantId
	].filter((e) => e).join("-");
}
function so({ type: e, error: t }) {
	return e === "unknown" && t?.code === "auth/no-auth-event";
}
function co(e) {
	switch (e.type) {
		case "signInViaRedirect":
		case "linkViaRedirect":
		case "reauthViaRedirect": return !0;
		case "unknown": return so(e);
		default: return !1;
	}
}
async function lo(e, t = {}) {
	return N(e, "GET", "/v1/projects", t);
}
async function uo(e) {
	if (e.config.emulator) return;
	let { authorizedDomains: t } = await lo(e);
	for (let e of t) try {
		if (fo(e)) return;
	} catch {}
	E(e, "unauthorized-domain");
}
function fo(e) {
	let t = nr(), { protocol: n, hostname: r } = new URL(t);
	if (e.startsWith("chrome-extension://")) {
		let i = new URL(e);
		return i.hostname === "" && r === "" ? n === "chrome-extension:" && e.replace("chrome-extension://", "") === t.replace("chrome-extension://", "") : n === "chrome-extension:" && i.hostname === r;
	}
	if (!rc.test(n)) return !1;
	if (nc.test(e)) return r === e;
	let i = e.replace(/\./g, "\\.");
	return RegExp("^(.+\\." + i + "|" + i + ")$", "i").test(r);
}
function po() {
	let e = z().___jsl;
	if (e?.H) {
		for (let t of Object.keys(e.H)) if (e.H[t].r = e.H[t].r || [], e.H[t].L = e.H[t].L || [], e.H[t].r = [...e.H[t].L], e.CP) for (let t = 0; t < e.CP.length; t++) e.CP[t] = null;
	}
}
function mo(e) {
	return new Promise((t, n) => {
		function r() {
			po(), gapi.load("gapi.iframes", {
				callback: () => {
					t(gapi.iframes.getContext());
				},
				ontimeout: () => {
					po(), n(D(e, "network-request-failed"));
				},
				timeout: ic.get()
			});
		}
		if (z().gapi?.iframes?.Iframe) t(gapi.iframes.getContext());
		else if (z().gapi?.load) r();
		else {
			let t = Qr("iframefcb");
			return z()[t] = () => {
				gapi.load ? r() : n(D(e, "network-request-failed"));
			}, Jr(`${Zr()}?onload=${t}`).catch((e) => n(e));
		}
	}).catch((e) => {
		throw ac = null, e;
	});
}
function ho(e) {
	return ac ||= mo(e), ac;
}
function go(e) {
	let t = e.config;
	k(t.authDomain, e, "auth-domain-config-required");
	let n = t.emulator ? sr(t, cc) : `https://${e.config.authDomain}/${sc}`, r = {
		apiKey: t.apiKey,
		appName: e.name,
		v: Rn
	}, i = uc.get(e.config.apiHost);
	i && (r.eid = i);
	let a = e._getFrameworks();
	return a.length && (r.fw = a.join(",")), `${n}?${ke(r).slice(1)}`;
}
async function _o(e) {
	let t = await ho(e), n = z().gapi;
	return k(n, e, "internal-error"), t.open({
		where: document.body,
		url: go(e),
		messageHandlersFilter: n.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
		attributes: lc,
		dontclear: !0
	}, (t) => new Promise(async (n, r) => {
		await t.restyle({ setHideOnLeave: !1 });
		let i = D(e, "network-request-failed"), a = z().setTimeout(() => {
			r(i);
		}, oc.get());
		function o() {
			z().clearTimeout(a), n(t);
		}
		t.ping(o).then(o, () => {
			r(i);
		});
	}));
}
function vo(e, t, n, r = fc, i = pc) {
	let a = Math.max((window.screen.availHeight - i) / 2, 0).toString(), o = Math.max((window.screen.availWidth - r) / 2, 0).toString(), s = "", c = Object.assign(Object.assign({}, dc), {
		width: r.toString(),
		height: i.toString(),
		top: a,
		left: o
	}), l = g().toLowerCase();
	n && (s = Ir(l) ? mc : n), Pr(l) && (t ||= hc, c.scrollbars = "yes");
	let u = Object.entries(c).reduce((e, [t, n]) => `${e}${t}=${n},`, "");
	if (Hr(l) && s !== "_self") return yo(t || "", s), new gc(null);
	let d = window.open(t || "", s, u);
	k(d, e, "popup-blocked");
	try {
		d.focus();
	} catch {}
	return new gc(d);
}
function yo(e, t) {
	let n = document.createElement("a");
	n.href = e, n.target = t;
	let r = document.createEvent("MouseEvent");
	r.initMouseEvent("click", !0, !0, window, 1, 0, 0, 0, 0, !1, !1, !1, !1, 1, null), n.dispatchEvent(r);
}
async function bo(e, t, n, r, i, a) {
	k(e.config.authDomain, e, "auth-domain-config-required"), k(e.config.apiKey, e, "invalid-api-key");
	let o = {
		apiKey: e.config.apiKey,
		appName: e.name,
		authType: n,
		redirectUrl: r,
		v: Rn,
		eventId: i
	};
	if (t instanceof W) {
		t.setDefaultLanguage(e.languageCode), o.providerId = t.providerId || "", Ee(t.getCustomParameters()) || (o.customParameters = JSON.stringify(t.getCustomParameters()));
		for (let [e, t] of Object.entries(a || {})) o[e] = t;
	}
	if (t instanceof G) {
		let e = t.getScopes().filter((e) => e !== "");
		e.length > 0 && (o.scopes = e.join(","));
	}
	e.tenantId && (o.tid = e.tenantId);
	let s = o;
	for (let e of Object.keys(s)) s[e] === void 0 && delete s[e];
	let c = await e._getAppCheckToken(), l = c ? `#${yc}=${encodeURIComponent(c)}` : "";
	return `${xo(e)}?${ke(s).slice(1)}${l}`;
}
function xo({ config: e }) {
	return e.emulator ? sr(e, vc) : `https://${e.authDomain}/${_c}`;
}
function So(e) {
	return e === void 0 || e?.length === 0;
}
function Co(e) {
	switch (e) {
		case "Node": return "node";
		case "ReactNative": return "rn";
		case "Worker": return "webworker";
		case "Cordova": return "cordova";
		case "WebExtension": return "web-extension";
		default: return;
	}
}
function wo(e) {
	Vt(new y("auth", (t, { options: n }) => {
		let r = t.getProvider("app").getImmediate(), i = t.getProvider("heartbeat"), a = t.getProvider("app-check-internal"), { apiKey: o, authDomain: s } = r.options;
		k(o && !o.includes(":"), "invalid-api-key", { appName: r.name });
		let c = new Ko(r, i, a, {
			apiKey: o,
			authDomain: s,
			clientPlatform: e,
			apiHost: "identitytoolkit.googleapis.com",
			tokenApiHost: "securetoken.googleapis.com",
			apiScheme: "https",
			sdkClientVersion: Gr(e)
		});
		return ri(c, n), c;
	}, "PUBLIC").setInstantiationMode("EXPLICIT").setInstanceCreatedCallback((e, t, n) => {
		e.getProvider("auth-internal").initialize();
	})), Vt(new y("auth-internal", (e) => ((e) => new jc(e))(L(e.getProvider("auth").getImmediate())), "PRIVATE").setInstantiationMode("EXPLICIT")), Gt(kc, Ac, Co(e)), Gt(kc, Ac, "esm2017");
}
function B(e = Wt()) {
	let t = Ht(e, "auth");
	if (t.isInitialized()) return t.getImmediate();
	let n = ni(e, {
		popupRedirectResolver: Sc,
		persistence: [
			Ls,
			Ss,
			Es
		]
	}), r = Je("authTokenSyncURL");
	if (r && typeof isSecureContext == "boolean" && isSecureContext) {
		let e = new URL(r, location.origin);
		if (location.origin === e.origin) {
			let t = Pc(e.toString());
			da(n, t, () => t(n.currentUser)), ua(n, (e) => t(e));
		}
	}
	let i = Ke("auth");
	return i && ii(n, `http://${i}`), n;
}
function To() {
	return document.getElementsByTagName("head")?.[0] ?? document;
}
var Eo, Do, Oo, ko, Ao, jo, Mo, No, Po, Fo, Io, Lo, Ro, V, zo, Bo, Vo, Ho, Uo, Wo, Go, Ko, qo, Jo, Yo, Xo, Zo, Qo, $o, es, ts, ns, rs, is, as, os, ss, H, cs, ls, us, U, W, G, K, q, J, Y, X, Z, ds, Q, fs, ps, ms, hs, gs, _s, vs, ys, bs, xs, Ss, Cs, ws, Ts, Es, Ds, Os, ks, As, js, Ms, Ns, Ps, Fs, Is, Ls, Rs, zs, Bs, Vs, Hs, Us, Ws, Gs, Ks, qs, Js, Ys, Xs, Zs, Qs, $s, ec, tc, nc, rc, ic, ac, oc, sc, cc, lc, uc, dc, fc, pc, mc, hc, gc, _c, vc, yc, bc, xc, Sc, Cc, wc, Tc, Ec, Dc, Oc, kc, Ac, jc, Mc, Nc, Pc, Fc = t((() => {
	qn(), nt(), mt(), Yn(), st(), Eo = Xn, Do = new $e("auth", "Firebase", Xn()), Oo = new pt("@firebase/auth"), ko = class {
		constructor(e, t) {
			this.shortDelay = e, this.longDelay = t, j(t > e, "Short delay should be less than long delay!"), this.isMobile = ve() || xe();
		}
		get() {
			return ar() ? this.isMobile ? this.longDelay : this.shortDelay : Math.min(5e3, this.shortDelay);
		}
	}, Ao = class {
		static initialize(e, t, n) {
			this.fetchImpl = e, t && (this.headersImpl = t), n && (this.responseImpl = n);
		}
		static fetch() {
			if (this.fetchImpl) return this.fetchImpl;
			if (typeof self < "u" && "fetch" in self) return self.fetch;
			if (typeof globalThis < "u" && globalThis.fetch) return globalThis.fetch;
			if (typeof fetch < "u") return fetch;
			A("Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
		}
		static headers() {
			if (this.headersImpl) return this.headersImpl;
			if (typeof self < "u" && "Headers" in self) return self.Headers;
			if (typeof globalThis < "u" && globalThis.Headers) return globalThis.Headers;
			if (typeof Headers < "u") return Headers;
			A("Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
		}
		static response() {
			if (this.responseImpl) return this.responseImpl;
			if (typeof self < "u" && "Response" in self) return self.Response;
			if (typeof globalThis < "u" && globalThis.Response) return globalThis.Response;
			if (typeof Response < "u") return Response;
			A("Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill");
		}
	}, jo = {
		CREDENTIAL_MISMATCH: "custom-token-mismatch",
		MISSING_CUSTOM_TOKEN: "internal-error",
		INVALID_IDENTIFIER: "invalid-email",
		MISSING_CONTINUE_URI: "internal-error",
		INVALID_PASSWORD: "wrong-password",
		MISSING_PASSWORD: "missing-password",
		INVALID_LOGIN_CREDENTIALS: "invalid-credential",
		EMAIL_EXISTS: "email-already-in-use",
		PASSWORD_LOGIN_DISABLED: "operation-not-allowed",
		INVALID_IDP_RESPONSE: "invalid-credential",
		INVALID_PENDING_TOKEN: "invalid-credential",
		FEDERATED_USER_ID_ALREADY_LINKED: "credential-already-in-use",
		MISSING_REQ_TYPE: "internal-error",
		EMAIL_NOT_FOUND: "user-not-found",
		RESET_PASSWORD_EXCEED_LIMIT: "too-many-requests",
		EXPIRED_OOB_CODE: "expired-action-code",
		INVALID_OOB_CODE: "invalid-action-code",
		MISSING_OOB_CODE: "internal-error",
		CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "requires-recent-login",
		INVALID_ID_TOKEN: "invalid-user-token",
		TOKEN_EXPIRED: "user-token-expired",
		USER_NOT_FOUND: "user-token-expired",
		TOO_MANY_ATTEMPTS_TRY_LATER: "too-many-requests",
		PASSWORD_DOES_NOT_MEET_REQUIREMENTS: "password-does-not-meet-requirements",
		INVALID_CODE: "invalid-verification-code",
		INVALID_SESSION_INFO: "invalid-verification-id",
		INVALID_TEMPORARY_PROOF: "invalid-credential",
		MISSING_SESSION_INFO: "missing-verification-id",
		SESSION_EXPIRED: "code-expired",
		MISSING_ANDROID_PACKAGE_NAME: "missing-android-pkg-name",
		UNAUTHORIZED_DOMAIN: "unauthorized-continue-uri",
		INVALID_OAUTH_CLIENT_ID: "invalid-oauth-client-id",
		ADMIN_ONLY_OPERATION: "admin-restricted-operation",
		INVALID_MFA_PENDING_CREDENTIAL: "invalid-multi-factor-session",
		MFA_ENROLLMENT_NOT_FOUND: "multi-factor-info-not-found",
		MISSING_MFA_ENROLLMENT_ID: "missing-multi-factor-info",
		MISSING_MFA_PENDING_CREDENTIAL: "missing-multi-factor-session",
		SECOND_FACTOR_EXISTS: "second-factor-already-in-use",
		SECOND_FACTOR_LIMIT_EXCEEDED: "maximum-second-factor-count-exceeded",
		BLOCKING_FUNCTION_ERROR_RESPONSE: "internal-error",
		RECAPTCHA_NOT_ENABLED: "recaptcha-not-enabled",
		MISSING_RECAPTCHA_TOKEN: "missing-recaptcha-token",
		INVALID_RECAPTCHA_TOKEN: "invalid-recaptcha-token",
		INVALID_RECAPTCHA_ACTION: "invalid-recaptcha-action",
		MISSING_CLIENT_TYPE: "missing-client-type",
		MISSING_RECAPTCHA_VERSION: "missing-recaptcha-version",
		INVALID_RECAPTCHA_VERSION: "invalid-recaptcha-version",
		INVALID_REQ_TYPE: "invalid-req-type"
	}, Mo = [
		"/v1/accounts:signInWithCustomToken",
		"/v1/accounts:signInWithEmailLink",
		"/v1/accounts:signInWithIdp",
		"/v1/accounts:signInWithPassword",
		"/v1/accounts:signInWithPhoneNumber",
		"/v1/token"
	], No = new ko(3e4, 6e4), Po = class {
		clearNetworkTimeout() {
			clearTimeout(this.timer);
		}
		constructor(e) {
			this.auth = e, this.timer = null, this.promise = new Promise((e, t) => {
				this.timer = setTimeout(() => t(D(this.auth, "network-request-failed")), No.get());
			});
		}
	}, Fo = class {
		constructor(e) {
			if (this.siteKey = "", this.recaptchaEnforcementState = [], e.recaptchaKey === void 0) throw Error("recaptchaKey undefined");
			this.siteKey = e.recaptchaKey.split("/")[3], this.recaptchaEnforcementState = e.recaptchaEnforcementState;
		}
		getProviderEnforcementState(e) {
			if (!this.recaptchaEnforcementState || this.recaptchaEnforcementState.length === 0) return null;
			for (let t of this.recaptchaEnforcementState) if (t.provider && t.provider === e) return ur(t.enforcementState);
			return null;
		}
		isProviderEnabled(e) {
			return this.getProviderEnforcementState(e) === "ENFORCE" || this.getProviderEnforcementState(e) === "AUDIT";
		}
		isAnyProviderEnabled() {
			return this.isProviderEnabled("EMAIL_PASSWORD_PROVIDER") || this.isProviderEnabled("PHONE_PROVIDER");
		}
	}, Io = class {
		constructor(e) {
			this.user = e, this.isRunning = !1, this.timerId = null, this.errorBackoff = 3e4;
		}
		_start() {
			this.isRunning || (this.isRunning = !0, this.schedule());
		}
		_stop() {
			this.isRunning && (this.isRunning = !1, this.timerId !== null && clearTimeout(this.timerId));
		}
		getInterval(e) {
			if (e) {
				let e = this.errorBackoff;
				return this.errorBackoff = Math.min(this.errorBackoff * 2, 96e4), e;
			} else {
				this.errorBackoff = 3e4;
				let e = (this.user.stsTokenManager.expirationTime ?? 0) - Date.now() - 3e5;
				return Math.max(0, e);
			}
		}
		schedule(e = !1) {
			if (!this.isRunning) return;
			let t = this.getInterval(e);
			this.timerId = setTimeout(async () => {
				await this.iteration();
			}, t);
		}
		async iteration() {
			try {
				await this.user.getIdToken(!0);
			} catch (e) {
				e?.code === "auth/network-request-failed" && this.schedule(!0);
				return;
			}
			this.schedule();
		}
	}, Lo = class {
		constructor(e, t) {
			this.createdAt = e, this.lastLoginAt = t, this._initializeTime();
		}
		_initializeTime() {
			this.lastSignInTime = yr(this.lastLoginAt), this.creationTime = yr(this.createdAt);
		}
		_copy(e) {
			this.createdAt = e.createdAt, this.lastLoginAt = e.lastLoginAt, this._initializeTime();
		}
		toJSON() {
			return {
				createdAt: this.createdAt,
				lastLoginAt: this.lastLoginAt
			};
		}
	}, Ro = class e {
		constructor() {
			this.refreshToken = null, this.accessToken = null, this.expirationTime = null;
		}
		get isExpired() {
			return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
		}
		updateFromServerResponse(e) {
			k(e.idToken, "internal-error"), k(e.idToken !== void 0, "internal-error"), k(e.refreshToken !== void 0, "internal-error");
			let t = "expiresIn" in e && e.expiresIn !== void 0 ? Number(e.expiresIn) : Cr(e.idToken);
			this.updateTokensAndExpiration(e.idToken, e.refreshToken, t);
		}
		updateFromIdToken(e) {
			k(e.length !== 0, "internal-error");
			let t = Cr(e);
			this.updateTokensAndExpiration(e, null, t);
		}
		async getToken(e, t = !1) {
			return !t && this.accessToken && !this.isExpired ? this.accessToken : (k(this.refreshToken, e, "user-token-expired"), this.refreshToken ? (await this.refresh(e, this.refreshToken), this.accessToken) : null);
		}
		clearRefreshToken() {
			this.refreshToken = null;
		}
		async refresh(e, t) {
			let { accessToken: n, refreshToken: r, expiresIn: i } = await Ar(e, t);
			this.updateTokensAndExpiration(n, r, Number(i));
		}
		updateTokensAndExpiration(e, t, n) {
			this.refreshToken = t || null, this.accessToken = e || null, this.expirationTime = Date.now() + n * 1e3;
		}
		static fromJSON(t, n) {
			let { refreshToken: r, accessToken: i, expirationTime: a } = n, o = new e();
			return r && (k(typeof r == "string", "internal-error", { appName: t }), o.refreshToken = r), i && (k(typeof i == "string", "internal-error", { appName: t }), o.accessToken = i), a && (k(typeof a == "number", "internal-error", { appName: t }), o.expirationTime = a), o;
		}
		toJSON() {
			return {
				refreshToken: this.refreshToken,
				accessToken: this.accessToken,
				expirationTime: this.expirationTime
			};
		}
		_assign(e) {
			this.accessToken = e.accessToken, this.refreshToken = e.refreshToken, this.expirationTime = e.expirationTime;
		}
		_clone() {
			return Object.assign(new e(), this.toJSON());
		}
		_performRefresh() {
			return A("not implemented");
		}
	}, V = class e {
		constructor(e) {
			var { uid: t, auth: n, stsTokenManager: r } = e, i = Jn(e, [
				"uid",
				"auth",
				"stsTokenManager"
			]);
			this.providerId = "firebase", this.proactiveRefresh = new Io(this), this.reloadUserInfo = null, this.reloadListener = null, this.uid = t, this.auth = n, this.stsTokenManager = r, this.accessToken = r.accessToken, this.displayName = i.displayName || null, this.email = i.email || null, this.emailVerified = i.emailVerified || !1, this.phoneNumber = i.phoneNumber || null, this.photoURL = i.photoURL || null, this.isAnonymous = i.isAnonymous || !1, this.tenantId = i.tenantId || null, this.providerData = i.providerData ? [...i.providerData] : [], this.metadata = new Lo(i.createdAt || void 0, i.lastLoginAt || void 0);
		}
		async getIdToken(e) {
			let t = await wr(this, this.stsTokenManager.getToken(this.auth, e));
			return k(t, this.auth, "internal-error"), this.accessToken !== t && (this.accessToken = t, await this.auth._persistUserIfCurrent(this), this.auth._notifyListenersIfCurrent(this)), t;
		}
		getIdTokenResult(e) {
			return br(this, e);
		}
		reload() {
			return Dr(this);
		}
		_assign(e) {
			this !== e && (k(this.uid === e.uid, this.auth, "internal-error"), this.displayName = e.displayName, this.photoURL = e.photoURL, this.email = e.email, this.emailVerified = e.emailVerified, this.phoneNumber = e.phoneNumber, this.isAnonymous = e.isAnonymous, this.tenantId = e.tenantId, this.providerData = e.providerData.map((e) => Object.assign({}, e)), this.metadata._copy(e.metadata), this.stsTokenManager._assign(e.stsTokenManager));
		}
		_clone(t) {
			let n = new e(Object.assign(Object.assign({}, this), {
				auth: t,
				stsTokenManager: this.stsTokenManager._clone()
			}));
			return n.metadata._copy(this.metadata), n;
		}
		_onReload(e) {
			k(!this.reloadListener, this.auth, "internal-error"), this.reloadListener = e, this.reloadUserInfo &&= (this._notifyReloadListener(this.reloadUserInfo), null);
		}
		_notifyReloadListener(e) {
			this.reloadListener ? this.reloadListener(e) : this.reloadUserInfo = e;
		}
		_startProactiveRefresh() {
			this.proactiveRefresh._start();
		}
		_stopProactiveRefresh() {
			this.proactiveRefresh._stop();
		}
		async _updateTokensIfNecessary(e, t = !1) {
			let n = !1;
			e.idToken && e.idToken !== this.stsTokenManager.accessToken && (this.stsTokenManager.updateFromServerResponse(e), n = !0), t && await Er(this), await this.auth._persistUserIfCurrent(this), n && this.auth._notifyListenersIfCurrent(this);
		}
		async delete() {
			if (C(this.auth.app)) return Promise.reject(O(this.auth));
			let e = await this.getIdToken();
			return await wr(this, gr(this.auth, { idToken: e })), this.stsTokenManager.clearRefreshToken(), this.auth.signOut();
		}
		toJSON() {
			return Object.assign(Object.assign({
				uid: this.uid,
				email: this.email || void 0,
				emailVerified: this.emailVerified,
				displayName: this.displayName || void 0,
				isAnonymous: this.isAnonymous,
				photoURL: this.photoURL || void 0,
				phoneNumber: this.phoneNumber || void 0,
				tenantId: this.tenantId || void 0,
				providerData: this.providerData.map((e) => Object.assign({}, e)),
				stsTokenManager: this.stsTokenManager.toJSON(),
				_redirectEventId: this._redirectEventId
			}, this.metadata.toJSON()), {
				apiKey: this.auth.config.apiKey,
				appName: this.auth.name
			});
		}
		get refreshToken() {
			return this.stsTokenManager.refreshToken || "";
		}
		static _fromJSON(t, n) {
			let r = n.displayName ?? void 0, i = n.email ?? void 0, a = n.phoneNumber ?? void 0, o = n.photoURL ?? void 0, s = n.tenantId ?? void 0, c = n._redirectEventId ?? void 0, l = n.createdAt ?? void 0, u = n.lastLoginAt ?? void 0, { uid: d, emailVerified: f, isAnonymous: p, providerData: ee, stsTokenManager: te } = n;
			k(d && te, t, "internal-error");
			let ne = Ro.fromJSON(this.name, te);
			k(typeof d == "string", t, "internal-error"), F(r, t.name), F(i, t.name), k(typeof f == "boolean", t, "internal-error"), k(typeof p == "boolean", t, "internal-error"), F(a, t.name), F(o, t.name), F(s, t.name), F(c, t.name), F(l, t.name), F(u, t.name);
			let m = new e({
				uid: d,
				auth: t,
				email: i,
				emailVerified: f,
				displayName: r,
				isAnonymous: p,
				photoURL: o,
				phoneNumber: a,
				tenantId: s,
				stsTokenManager: ne,
				createdAt: l,
				lastLoginAt: u
			});
			return ee && Array.isArray(ee) && (m.providerData = ee.map((e) => Object.assign({}, e))), c && (m._redirectEventId = c), m;
		}
		static async _fromIdTokenResponse(t, n, r = !1) {
			let i = new Ro();
			i.updateFromServerResponse(n);
			let a = new e({
				uid: n.localId,
				auth: t,
				stsTokenManager: i,
				isAnonymous: r
			});
			return await Er(a), a;
		}
		static async _fromGetAccountInfoResponse(t, n, r) {
			let i = n.users[0];
			k(i.localId !== void 0, "internal-error");
			let a = i.providerUserInfo === void 0 ? [] : kr(i.providerUserInfo), o = !(i.email && i.passwordHash) && !a?.length, s = new Ro();
			s.updateFromIdToken(r);
			let c = new e({
				uid: i.localId,
				auth: t,
				stsTokenManager: s,
				isAnonymous: o
			}), l = {
				uid: i.localId,
				displayName: i.displayName || null,
				photoURL: i.photoUrl || null,
				email: i.email || null,
				emailVerified: i.emailVerified || !1,
				phoneNumber: i.phoneNumber || null,
				tenantId: i.tenantId || null,
				providerData: a,
				metadata: new Lo(i.createdAt, i.lastLoginAt),
				isAnonymous: !(i.email && i.passwordHash) && !a?.length
			};
			return Object.assign(c, l), c;
		}
	}, zo = /* @__PURE__ */ new Map(), Bo = class {
		constructor() {
			this.type = "NONE", this.storage = {};
		}
		async _isAvailable() {
			return !0;
		}
		async _set(e, t) {
			this.storage[e] = t;
		}
		async _get(e) {
			let t = this.storage[e];
			return t === void 0 ? null : t;
		}
		async _remove(e) {
			delete this.storage[e];
		}
		_addListener(e, t) {}
		_removeListener(e, t) {}
	}, Bo.type = "NONE", Vo = Bo, Ho = class e {
		constructor(e, t, n) {
			this.persistence = e, this.auth = t, this.userKey = n;
			let { config: r, name: i } = this.auth;
			this.fullUserKey = Mr(this.userKey, r.apiKey, i), this.fullPersistenceKey = Mr("persistence", r.apiKey, i), this.boundEventHandler = t._onStorageEvent.bind(t), this.persistence._addListener(this.fullUserKey, this.boundEventHandler);
		}
		setCurrentUser(e) {
			return this.persistence._set(this.fullUserKey, e.toJSON());
		}
		async getCurrentUser() {
			let e = await this.persistence._get(this.fullUserKey);
			if (!e) return null;
			if (typeof e == "string") {
				let t = await vr(this.auth, { idToken: e }).catch(() => void 0);
				return t ? V._fromGetAccountInfoResponse(this.auth, t, e) : null;
			}
			return V._fromJSON(this.auth, e);
		}
		removeCurrentUser() {
			return this.persistence._remove(this.fullUserKey);
		}
		savePersistenceForRedirect() {
			return this.persistence._set(this.fullPersistenceKey, this.persistence.type);
		}
		async setPersistence(e) {
			if (this.persistence === e) return;
			let t = await this.getCurrentUser();
			if (await this.removeCurrentUser(), this.persistence = e, t) return this.setCurrentUser(t);
		}
		delete() {
			this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
		}
		static async create(t, n, r = "authUser") {
			if (!n.length) return new e(I(Vo), t, r);
			let i = (await Promise.all(n.map(async (e) => {
				if (await e._isAvailable()) return e;
			}))).filter((e) => e), a = i[0] || I(Vo), o = Mr(r, t.config.apiKey, t.name), s = null;
			for (let e of n) try {
				let n = await e._get(o);
				if (n) {
					let r;
					if (typeof n == "string") {
						let e = await vr(t, { idToken: n }).catch(() => void 0);
						if (!e) break;
						r = await V._fromGetAccountInfoResponse(t, e, n);
					} else r = V._fromJSON(t, n);
					e !== a && (s = r), a = e;
					break;
				}
			} catch {}
			let c = i.filter((e) => e._shouldAllowMigration);
			return !a._shouldAllowMigration || !c.length ? new e(a, t, r) : (a = c[0], s && await a._set(o, s.toJSON()), await Promise.all(n.map(async (e) => {
				if (e !== a) try {
					await e._remove(o);
				} catch {}
			})), new e(a, t, r));
		}
	}, Uo = class {
		constructor(e) {
			this.auth = e, this.queue = [];
		}
		pushCallback(e, t) {
			let n = (t) => new Promise((n, r) => {
				try {
					n(e(t));
				} catch (e) {
					r(e);
				}
			});
			n.onAbort = t, this.queue.push(n);
			let r = this.queue.length - 1;
			return () => {
				this.queue[r] = () => Promise.resolve();
			};
		}
		async runMiddleware(e) {
			if (this.auth.currentUser === e) return;
			let t = [];
			try {
				for (let n of this.queue) await n(e), n.onAbort && t.push(n.onAbort);
			} catch (e) {
				t.reverse();
				for (let e of t) try {
					e();
				} catch {}
				throw this.auth._errorFactory.create("login-blocked", { originalMessage: e?.message });
			}
		}
	}, Wo = 6, Go = class {
		constructor(e) {
			let t = e.customStrengthOptions;
			this.customStrengthOptions = {}, this.customStrengthOptions.minPasswordLength = t.minPasswordLength ?? Wo, t.maxPasswordLength && (this.customStrengthOptions.maxPasswordLength = t.maxPasswordLength), t.containsLowercaseCharacter !== void 0 && (this.customStrengthOptions.containsLowercaseLetter = t.containsLowercaseCharacter), t.containsUppercaseCharacter !== void 0 && (this.customStrengthOptions.containsUppercaseLetter = t.containsUppercaseCharacter), t.containsNumericCharacter !== void 0 && (this.customStrengthOptions.containsNumericCharacter = t.containsNumericCharacter), t.containsNonAlphanumericCharacter !== void 0 && (this.customStrengthOptions.containsNonAlphanumericCharacter = t.containsNonAlphanumericCharacter), this.enforcementState = e.enforcementState, this.enforcementState === "ENFORCEMENT_STATE_UNSPECIFIED" && (this.enforcementState = "OFF"), this.allowedNonAlphanumericCharacters = e.allowedNonAlphanumericCharacters?.join("") ?? "", this.forceUpgradeOnSignin = e.forceUpgradeOnSignin ?? !1, this.schemaVersion = e.schemaVersion;
		}
		validatePassword(e) {
			let t = {
				isValid: !0,
				passwordPolicy: this
			};
			return this.validatePasswordLengthOptions(e, t), this.validatePasswordCharacterOptions(e, t), t.isValid &&= t.meetsMinPasswordLength ?? !0, t.isValid &&= t.meetsMaxPasswordLength ?? !0, t.isValid &&= t.containsLowercaseLetter ?? !0, t.isValid &&= t.containsUppercaseLetter ?? !0, t.isValid &&= t.containsNumericCharacter ?? !0, t.isValid &&= t.containsNonAlphanumericCharacter ?? !0, t;
		}
		validatePasswordLengthOptions(e, t) {
			let n = this.customStrengthOptions.minPasswordLength, r = this.customStrengthOptions.maxPasswordLength;
			n && (t.meetsMinPasswordLength = e.length >= n), r && (t.meetsMaxPasswordLength = e.length <= r);
		}
		validatePasswordCharacterOptions(e, t) {
			this.updatePasswordCharacterOptionsStatuses(t, !1, !1, !1, !1);
			let n;
			for (let r = 0; r < e.length; r++) n = e.charAt(r), this.updatePasswordCharacterOptionsStatuses(t, n >= "a" && n <= "z", n >= "A" && n <= "Z", n >= "0" && n <= "9", this.allowedNonAlphanumericCharacters.includes(n));
		}
		updatePasswordCharacterOptionsStatuses(e, t, n, r, i) {
			this.customStrengthOptions.containsLowercaseLetter && (e.containsLowercaseLetter ||= t), this.customStrengthOptions.containsUppercaseLetter && (e.containsUppercaseLetter ||= n), this.customStrengthOptions.containsNumericCharacter && (e.containsNumericCharacter ||= r), this.customStrengthOptions.containsNonAlphanumericCharacter && (e.containsNonAlphanumericCharacter ||= i);
		}
	}, Ko = class {
		constructor(e, t, n, r) {
			this.app = e, this.heartbeatServiceProvider = t, this.appCheckServiceProvider = n, this.config = r, this.currentUser = null, this.emulatorConfig = null, this.operations = Promise.resolve(), this.authStateSubscription = new qo(this), this.idTokenSubscription = new qo(this), this.beforeStateQueue = new Uo(this), this.redirectUser = null, this.isProactiveRefreshEnabled = !1, this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1, this._canInitEmulator = !0, this._isInitialized = !1, this._deleted = !1, this._initializationPromise = null, this._popupRedirectResolver = null, this._errorFactory = Do, this._agentRecaptchaConfig = null, this._tenantRecaptchaConfigs = {}, this._projectPasswordPolicy = null, this._tenantPasswordPolicies = {}, this._resolvePersistenceManagerAvailable = void 0, this.lastNotifiedUid = void 0, this.languageCode = null, this.tenantId = null, this.settings = { appVerificationDisabledForTesting: !1 }, this.frameworks = [], this.name = e.name, this.clientVersion = r.sdkClientVersion, this._persistenceManagerAvailable = new Promise((e) => this._resolvePersistenceManagerAvailable = e);
		}
		_initializeWithPersistence(e, t) {
			return t && (this._popupRedirectResolver = I(t)), this._initializationPromise = this.queue(async () => {
				var n;
				if (!this._deleted && (this.persistenceManager = await Ho.create(this, e), (n = this._resolvePersistenceManagerAvailable) == null || n.call(this), !this._deleted)) {
					if (this._popupRedirectResolver?._shouldInitProactively) try {
						await this._popupRedirectResolver._initialize(this);
					} catch {}
					await this.initializeCurrentUser(t), this.lastNotifiedUid = this.currentUser?.uid || null, !this._deleted && (this._isInitialized = !0);
				}
			}), this._initializationPromise;
		}
		async _onStorageEvent() {
			if (this._deleted) return;
			let e = await this.assertedPersistence.getCurrentUser();
			if (!(!this.currentUser && !e)) {
				if (this.currentUser && e && this.currentUser.uid === e.uid) {
					this._currentUser._assign(e), await this.currentUser.getIdToken();
					return;
				}
				await this._updateCurrentUser(e, !0);
			}
		}
		async initializeCurrentUserFromIdToken(e) {
			try {
				let t = await vr(this, { idToken: e }), n = await V._fromGetAccountInfoResponse(this, t, e);
				await this.directlySetCurrentUser(n);
			} catch (e) {
				console.warn("FirebaseServerApp could not login user with provided authIdToken: ", e), await this.directlySetCurrentUser(null);
			}
		}
		async initializeCurrentUser(e) {
			if (C(this.app)) {
				let e = this.app.settings.authIdToken;
				return e ? new Promise((t) => {
					setTimeout(() => this.initializeCurrentUserFromIdToken(e).then(t, t));
				}) : this.directlySetCurrentUser(null);
			}
			let t = await this.assertedPersistence.getCurrentUser(), n = t, r = !1;
			if (e && this.config.authDomain) {
				await this.getOrInitRedirectPersistenceManager();
				let t = this.redirectUser?._redirectEventId, i = n?._redirectEventId, a = await this.tryRedirectSignIn(e);
				(!t || t === i) && a?.user && (n = a.user, r = !0);
			}
			if (!n) return this.directlySetCurrentUser(null);
			if (!n._redirectEventId) {
				if (r) try {
					await this.beforeStateQueue.runMiddleware(n);
				} catch (e) {
					n = t, this._popupRedirectResolver._overrideRedirectResult(this, () => Promise.reject(e));
				}
				return n ? this.reloadAndSetCurrentUserOrClear(n) : this.directlySetCurrentUser(null);
			}
			return k(this._popupRedirectResolver, this, "argument-error"), await this.getOrInitRedirectPersistenceManager(), this.redirectUser && this.redirectUser._redirectEventId === n._redirectEventId ? this.directlySetCurrentUser(n) : this.reloadAndSetCurrentUserOrClear(n);
		}
		async tryRedirectSignIn(e) {
			let t = null;
			try {
				t = await this._popupRedirectResolver._completeRedirectFn(this, e, !0);
			} catch {
				await this._setRedirectUser(null);
			}
			return t;
		}
		async reloadAndSetCurrentUserOrClear(e) {
			try {
				await Er(e);
			} catch (e) {
				if (e?.code !== "auth/network-request-failed") return this.directlySetCurrentUser(null);
			}
			return this.directlySetCurrentUser(e);
		}
		useDeviceLanguage() {
			this.languageCode = or();
		}
		async _delete() {
			this._deleted = !0;
		}
		async updateCurrentUser(e) {
			if (C(this.app)) return Promise.reject(O(this));
			let t = e ? _(e) : null;
			return t && k(t.auth.config.apiKey === this.config.apiKey, this, "invalid-user-token"), this._updateCurrentUser(t && t._clone(this));
		}
		async _updateCurrentUser(e, t = !1) {
			if (!this._deleted) return e && k(this.tenantId === e.tenantId, this, "tenant-id-mismatch"), t || await this.beforeStateQueue.runMiddleware(e), this.queue(async () => {
				await this.directlySetCurrentUser(e), this.notifyAuthListeners();
			});
		}
		async signOut() {
			return C(this.app) ? Promise.reject(O(this)) : (await this.beforeStateQueue.runMiddleware(null), (this.redirectPersistenceManager || this._popupRedirectResolver) && await this._setRedirectUser(null), this._updateCurrentUser(null, !0));
		}
		setPersistence(e) {
			return C(this.app) ? Promise.reject(O(this)) : this.queue(async () => {
				await this.assertedPersistence.setPersistence(I(e));
			});
		}
		_getRecaptchaConfig() {
			return this.tenantId == null ? this._agentRecaptchaConfig : this._tenantRecaptchaConfigs[this.tenantId];
		}
		async validatePassword(e) {
			this._getPasswordPolicyInternal() || await this._updatePasswordPolicy();
			let t = this._getPasswordPolicyInternal();
			return t.schemaVersion === this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION ? t.validatePassword(e) : Promise.reject(this._errorFactory.create("unsupported-password-policy-schema-version", {}));
		}
		_getPasswordPolicyInternal() {
			return this.tenantId === null ? this._projectPasswordPolicy : this._tenantPasswordPolicies[this.tenantId];
		}
		async _updatePasswordPolicy() {
			let e = new Go(await Kr(this));
			this.tenantId === null ? this._projectPasswordPolicy = e : this._tenantPasswordPolicies[this.tenantId] = e;
		}
		_getPersistenceType() {
			return this.assertedPersistence.persistence.type;
		}
		_getPersistence() {
			return this.assertedPersistence.persistence;
		}
		_updateErrorMap(e) {
			this._errorFactory = new $e("auth", "Firebase", e());
		}
		onAuthStateChanged(e, t, n) {
			return this.registerStateListener(this.authStateSubscription, e, t, n);
		}
		beforeAuthStateChanged(e, t) {
			return this.beforeStateQueue.pushCallback(e, t);
		}
		onIdTokenChanged(e, t, n) {
			return this.registerStateListener(this.idTokenSubscription, e, t, n);
		}
		authStateReady() {
			return new Promise((e, t) => {
				if (this.currentUser) e();
				else {
					let n = this.onAuthStateChanged(() => {
						n(), e();
					}, t);
				}
			});
		}
		async revokeAccessToken(e) {
			if (this.currentUser) {
				let t = {
					providerId: "apple.com",
					tokenType: "ACCESS_TOKEN",
					token: e,
					idToken: await this.currentUser.getIdToken()
				};
				this.tenantId != null && (t.tenantId = this.tenantId), await jr(this, t);
			}
		}
		toJSON() {
			return {
				apiKey: this.config.apiKey,
				authDomain: this.config.authDomain,
				appName: this.name,
				currentUser: this._currentUser?.toJSON()
			};
		}
		async _setRedirectUser(e, t) {
			let n = await this.getOrInitRedirectPersistenceManager(t);
			return e === null ? n.removeCurrentUser() : n.setCurrentUser(e);
		}
		async getOrInitRedirectPersistenceManager(e) {
			if (!this.redirectPersistenceManager) {
				let t = e && I(e) || this._popupRedirectResolver;
				k(t, this, "argument-error"), this.redirectPersistenceManager = await Ho.create(this, [I(t._redirectPersistence)], "redirectUser"), this.redirectUser = await this.redirectPersistenceManager.getCurrentUser();
			}
			return this.redirectPersistenceManager;
		}
		async _redirectUserForId(e) {
			return this._isInitialized && await this.queue(async () => {}), this._currentUser?._redirectEventId === e ? this._currentUser : this.redirectUser?._redirectEventId === e ? this.redirectUser : null;
		}
		async _persistUserIfCurrent(e) {
			if (e === this.currentUser) return this.queue(async () => this.directlySetCurrentUser(e));
		}
		_notifyListenersIfCurrent(e) {
			e === this.currentUser && this.notifyAuthListeners();
		}
		_key() {
			return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
		}
		_startProactiveRefresh() {
			this.isProactiveRefreshEnabled = !0, this.currentUser && this._currentUser._startProactiveRefresh();
		}
		_stopProactiveRefresh() {
			this.isProactiveRefreshEnabled = !1, this.currentUser && this._currentUser._stopProactiveRefresh();
		}
		get _currentUser() {
			return this.currentUser;
		}
		notifyAuthListeners() {
			if (!this._isInitialized) return;
			this.idTokenSubscription.next(this.currentUser);
			let e = this.currentUser?.uid ?? null;
			this.lastNotifiedUid !== e && (this.lastNotifiedUid = e, this.authStateSubscription.next(this.currentUser));
		}
		registerStateListener(e, t, n, r) {
			if (this._deleted) return () => {};
			let i = typeof t == "function" ? t : t.next.bind(t), a = !1, o = this._isInitialized ? Promise.resolve() : this._initializationPromise;
			if (k(o, this, "internal-error"), o.then(() => {
				a || i(this.currentUser);
			}), typeof t == "function") {
				let i = e.addObserver(t, n, r);
				return () => {
					a = !0, i();
				};
			} else {
				let n = e.addObserver(t);
				return () => {
					a = !0, n();
				};
			}
		}
		async directlySetCurrentUser(e) {
			this.currentUser && this.currentUser !== e && this._currentUser._stopProactiveRefresh(), e && this.isProactiveRefreshEnabled && e._startProactiveRefresh(), this.currentUser = e, e ? await this.assertedPersistence.setCurrentUser(e) : await this.assertedPersistence.removeCurrentUser();
		}
		queue(e) {
			return this.operations = this.operations.then(e, e), this.operations;
		}
		get assertedPersistence() {
			return k(this.persistenceManager, this, "internal-error"), this.persistenceManager;
		}
		_logFramework(e) {
			!e || this.frameworks.includes(e) || (this.frameworks.push(e), this.frameworks.sort(), this.clientVersion = Gr(this.config.clientPlatform, this._getFrameworks()));
		}
		_getFrameworks() {
			return this.frameworks;
		}
		async _getAdditionalHeaders() {
			let e = { "X-Client-Version": this.clientVersion };
			this.app.options.appId && (e["X-Firebase-gmpid"] = this.app.options.appId);
			let t = await this.heartbeatServiceProvider.getImmediate({ optional: !0 })?.getHeartbeatsHeader();
			t && (e["X-Firebase-Client"] = t);
			let n = await this._getAppCheckToken();
			return n && (e["X-Firebase-AppCheck"] = n), e;
		}
		async _getAppCheckToken() {
			if (C(this.app) && this.app.settings.appCheckToken) return this.app.settings.appCheckToken;
			let e = await this.appCheckServiceProvider.getImmediate({ optional: !0 })?.getToken();
			return e?.error && Zn(`Error while retrieving App Check token: ${e.error}`), e?.token;
		}
	}, qo = class {
		constructor(e) {
			this.auth = e, this.observer = null, this.addObserver = Me((e) => this.observer = e);
		}
		get next() {
			return k(this.observer, this.auth, "internal-error"), this.observer.next.bind(this.observer);
		}
	}, Jo = {
		async loadJS() {
			throw Error("Unable to load external scripts");
		},
		recaptchaV2Script: "",
		recaptchaEnterpriseScript: "",
		gapiScript: ""
	}, Yo = 500, Xo = 6e4, Zo = 0xe8d4a51000, Qo = class {
		constructor(e) {
			this.auth = e, this.counter = Zo, this._widgets = /* @__PURE__ */ new Map();
		}
		render(e, t) {
			let n = this.counter;
			return this._widgets.set(n, new ts(e, this.auth.name, t || {})), this.counter++, n;
		}
		reset(e) {
			var t;
			let n = e || Zo;
			(t = this._widgets.get(n)) == null || t.delete(), this._widgets.delete(n);
		}
		getResponse(e) {
			let t = e || Zo;
			return this._widgets.get(t)?.getResponse() || "";
		}
		async execute(e) {
			var t;
			let n = e || Zo;
			return (t = this._widgets.get(n)) == null || t.execute(), "";
		}
	}, $o = class {
		constructor() {
			this.enterprise = new es();
		}
		ready(e) {
			e();
		}
		execute(e, t) {
			return Promise.resolve("token");
		}
		render(e, t) {
			return "";
		}
	}, es = class {
		ready(e) {
			e();
		}
		execute(e, t) {
			return Promise.resolve("token");
		}
		render(e, t) {
			return "";
		}
	}, ts = class {
		constructor(e, t, n) {
			this.params = n, this.timerId = null, this.deleted = !1, this.responseToken = null, this.clickHandler = () => {
				this.execute();
			};
			let r = typeof e == "string" ? document.getElementById(e) : e;
			k(r, "argument-error", { appName: t }), this.container = r, this.isVisible = this.params.size !== "invisible", this.isVisible ? this.execute() : this.container.addEventListener("click", this.clickHandler);
		}
		getResponse() {
			return this.checkIfDeleted(), this.responseToken;
		}
		delete() {
			this.checkIfDeleted(), this.deleted = !0, this.timerId &&= (clearTimeout(this.timerId), null), this.container.removeEventListener("click", this.clickHandler);
		}
		execute() {
			this.checkIfDeleted(), !this.timerId && (this.timerId = window.setTimeout(() => {
				this.responseToken = $r(50);
				let { callback: e, "expired-callback": t } = this.params;
				if (e) try {
					e(this.responseToken);
				} catch {}
				this.timerId = window.setTimeout(() => {
					if (this.timerId = null, this.responseToken = null, t) try {
						t();
					} catch {}
					this.isVisible && this.execute();
				}, Xo);
			}, Yo));
		}
		checkIfDeleted() {
			if (this.deleted) throw Error("reCAPTCHA mock was already deleted!");
		}
	}, ns = "recaptcha-enterprise", rs = "NO_RECAPTCHA", is = class {
		constructor(e) {
			this.type = ns, this.auth = L(e);
		}
		async verify(e = "verify", t = !1) {
			async function n(e) {
				if (!t) {
					if (e.tenantId == null && e._agentRecaptchaConfig != null) return e._agentRecaptchaConfig.siteKey;
					if (e.tenantId != null && e._tenantRecaptchaConfigs[e.tenantId] !== void 0) return e._tenantRecaptchaConfigs[e.tenantId].siteKey;
				}
				return new Promise(async (t, n) => {
					hr(e, {
						clientType: "CLIENT_TYPE_WEB",
						version: "RECAPTCHA_ENTERPRISE"
					}).then((r) => {
						if (r.recaptchaKey === void 0) n(/* @__PURE__ */ Error("recaptcha Enterprise site key undefined"));
						else {
							let n = new Fo(r);
							return e.tenantId == null ? e._agentRecaptchaConfig = n : e._tenantRecaptchaConfigs[e.tenantId] = n, t(n.siteKey);
						}
					}).catch((e) => {
						n(e);
					});
				});
			}
			function r(t, n, r) {
				let i = window.grecaptcha;
				pr(i) ? i.enterprise.ready(() => {
					i.enterprise.execute(t, { action: e }).then((e) => {
						n(e);
					}).catch(() => {
						n(rs);
					});
				}) : r(Error("No reCAPTCHA enterprise script loaded."));
			}
			return this.auth.settings.appVerificationDisabledForTesting ? new $o().execute("siteKey", { action: "verify" }) : new Promise((e, i) => {
				n(this.auth).then((n) => {
					if (!t && pr(window.grecaptcha)) r(n, e, i);
					else {
						if (typeof window > "u") {
							i(/* @__PURE__ */ Error("RecaptchaVerifier is only supported in browser"));
							return;
						}
						let t = Xr();
						t.length !== 0 && (t += n), Jr(t).then(() => {
							r(n, e, i);
						}).catch((e) => {
							i(e);
						});
					}
				}).catch((e) => {
					i(e);
				});
			});
		}
	}, as = class {
		constructor(e, t) {
			this.providerId = e, this.signInMethod = t;
		}
		toJSON() {
			return A("not implemented");
		}
		_getIdTokenResponse(e) {
			return A("not implemented");
		}
		_linkToIdToken(e, t) {
			return A("not implemented");
		}
		_getReauthenticationResolver(e) {
			return A("not implemented");
		}
	}, os = class e extends as {
		constructor(e, t, n, r = null) {
			super("password", n), this._email = e, this._password = t, this._tenantId = r;
		}
		static _fromEmailAndPassword(t, n) {
			return new e(t, n, "password");
		}
		static _fromEmailAndCode(t, n, r = null) {
			return new e(t, n, "emailLink", r);
		}
		toJSON() {
			return {
				email: this._email,
				password: this._password,
				signInMethod: this.signInMethod,
				tenantId: this._tenantId
			};
		}
		static fromJSON(e) {
			let t = typeof e == "string" ? JSON.parse(e) : e;
			if (t?.email && t?.password) {
				if (t.signInMethod === "password") return this._fromEmailAndPassword(t.email, t.password);
				if (t.signInMethod === "emailLink") return this._fromEmailAndCode(t.email, t.password, t.tenantId);
			}
			return null;
		}
		async _getIdTokenResponse(e) {
			switch (this.signInMethod) {
				case "password": return R(e, {
					returnSecureToken: !0,
					email: this._email,
					password: this._password,
					clientType: "CLIENT_TYPE_WEB"
				}, "signInWithPassword", pi, "EMAIL_PASSWORD_PROVIDER");
				case "emailLink": return yi(e, {
					email: this._email,
					oobCode: this._password
				});
				default: E(e, "internal-error");
			}
		}
		async _linkToIdToken(e, t) {
			switch (this.signInMethod) {
				case "password": return R(e, {
					idToken: t,
					returnSecureToken: !0,
					email: this._email,
					password: this._password,
					clientType: "CLIENT_TYPE_WEB"
				}, "signUpPassword", di, "EMAIL_PASSWORD_PROVIDER");
				case "emailLink": return bi(e, {
					idToken: t,
					email: this._email,
					oobCode: this._password
				});
				default: E(e, "internal-error");
			}
		}
		_getReauthenticationResolver(e) {
			return this._getIdTokenResponse(e);
		}
	}, ss = "http://localhost", H = class e extends as {
		constructor() {
			super(...arguments), this.pendingToken = null;
		}
		static _fromParams(t) {
			let n = new e(t.providerId, t.signInMethod);
			return t.idToken || t.accessToken ? (t.idToken && (n.idToken = t.idToken), t.accessToken && (n.accessToken = t.accessToken), t.nonce && !t.pendingToken && (n.nonce = t.nonce), t.pendingToken && (n.pendingToken = t.pendingToken)) : t.oauthToken && t.oauthTokenSecret ? (n.accessToken = t.oauthToken, n.secret = t.oauthTokenSecret) : E("argument-error"), n;
		}
		toJSON() {
			return {
				idToken: this.idToken,
				accessToken: this.accessToken,
				secret: this.secret,
				nonce: this.nonce,
				pendingToken: this.pendingToken,
				providerId: this.providerId,
				signInMethod: this.signInMethod
			};
		}
		static fromJSON(t) {
			let n = typeof t == "string" ? JSON.parse(t) : t, { providerId: r, signInMethod: i } = n, a = Jn(n, ["providerId", "signInMethod"]);
			if (!r || !i) return null;
			let o = new e(r, i);
			return o.idToken = a.idToken || void 0, o.accessToken = a.accessToken || void 0, o.secret = a.secret, o.nonce = a.nonce, o.pendingToken = a.pendingToken || null, o;
		}
		_getIdTokenResponse(e) {
			return xi(e, this.buildRequest());
		}
		_linkToIdToken(e, t) {
			let n = this.buildRequest();
			return n.idToken = t, xi(e, n);
		}
		_getReauthenticationResolver(e) {
			let t = this.buildRequest();
			return t.autoCreate = !1, xi(e, t);
		}
		buildRequest() {
			let e = {
				requestUri: ss,
				returnSecureToken: !0
			};
			if (this.pendingToken) e.pendingToken = this.pendingToken;
			else {
				let t = {};
				this.idToken && (t.id_token = this.idToken), this.accessToken && (t.access_token = this.accessToken), this.secret && (t.oauth_token_secret = this.secret), t.providerId = this.providerId, this.nonce && !this.pendingToken && (t.nonce = this.nonce), e.postBody = ke(t);
			}
			return e;
		}
	}, cs = { USER_NOT_FOUND: "user-not-found" }, ls = class e extends as {
		constructor(e) {
			super("phone", "phone"), this.params = e;
		}
		static _fromVerification(t, n) {
			return new e({
				verificationId: t,
				verificationCode: n
			});
		}
		static _fromTokenResponse(t, n) {
			return new e({
				phoneNumber: t,
				temporaryProof: n
			});
		}
		_getIdTokenResponse(e) {
			return Ci(e, this._makeVerificationRequest());
		}
		_linkToIdToken(e, t) {
			return wi(e, Object.assign({ idToken: t }, this._makeVerificationRequest()));
		}
		_getReauthenticationResolver(e) {
			return Ti(e, this._makeVerificationRequest());
		}
		_makeVerificationRequest() {
			let { temporaryProof: e, phoneNumber: t, verificationId: n, verificationCode: r } = this.params;
			return e && t ? {
				temporaryProof: e,
				phoneNumber: t
			} : {
				sessionInfo: n,
				code: r
			};
		}
		toJSON() {
			let e = { providerId: this.providerId };
			return this.params.phoneNumber && (e.phoneNumber = this.params.phoneNumber), this.params.temporaryProof && (e.temporaryProof = this.params.temporaryProof), this.params.verificationCode && (e.verificationCode = this.params.verificationCode), this.params.verificationId && (e.verificationId = this.params.verificationId), e;
		}
		static fromJSON(t) {
			typeof t == "string" && (t = JSON.parse(t));
			let { verificationId: n, verificationCode: r, phoneNumber: i, temporaryProof: a } = t;
			return !r && !n && !i && !a ? null : new e({
				verificationId: n,
				verificationCode: r,
				phoneNumber: i,
				temporaryProof: a
			});
		}
	}, us = class e {
		constructor(e) {
			let t = Ae(je(e)), n = t.apiKey ?? null, r = t.oobCode ?? null, i = Ei(t.mode ?? null);
			k(n && r && i, "argument-error"), this.apiKey = n, this.operation = i, this.code = r, this.continueUrl = t.continueUrl ?? null, this.languageCode = t.lang ?? null, this.tenantId = t.tenantId ?? null;
		}
		static parseLink(t) {
			let n = Di(t);
			try {
				return new e(n);
			} catch {
				return null;
			}
		}
	}, U = class e {
		constructor() {
			this.providerId = e.PROVIDER_ID;
		}
		static credential(e, t) {
			return os._fromEmailAndPassword(e, t);
		}
		static credentialWithLink(e, t) {
			let n = us.parseLink(t);
			return k(n, "argument-error"), os._fromEmailAndCode(e, n.code, n.tenantId);
		}
	}, U.PROVIDER_ID = "password", U.EMAIL_PASSWORD_SIGN_IN_METHOD = "password", U.EMAIL_LINK_SIGN_IN_METHOD = "emailLink", W = class {
		constructor(e) {
			this.providerId = e, this.defaultLanguageCode = null, this.customParameters = {};
		}
		setDefaultLanguage(e) {
			this.defaultLanguageCode = e;
		}
		setCustomParameters(e) {
			return this.customParameters = e, this;
		}
		getCustomParameters() {
			return this.customParameters;
		}
	}, G = class extends W {
		constructor() {
			super(...arguments), this.scopes = [];
		}
		addScope(e) {
			return this.scopes.includes(e) || this.scopes.push(e), this;
		}
		getScopes() {
			return [...this.scopes];
		}
	}, K = class e extends G {
		static credentialFromJSON(e) {
			let t = typeof e == "string" ? JSON.parse(e) : e;
			return k("providerId" in t && "signInMethod" in t, "argument-error"), H._fromParams(t);
		}
		credential(e) {
			return this._credential(Object.assign(Object.assign({}, e), { nonce: e.rawNonce }));
		}
		_credential(e) {
			return k(e.idToken || e.accessToken, "argument-error"), H._fromParams(Object.assign(Object.assign({}, e), {
				providerId: this.providerId,
				signInMethod: this.providerId
			}));
		}
		static credentialFromResult(t) {
			return e.oauthCredentialFromTaggedObject(t);
		}
		static credentialFromError(t) {
			return e.oauthCredentialFromTaggedObject(t.customData || {});
		}
		static oauthCredentialFromTaggedObject({ _tokenResponse: t }) {
			if (!t) return null;
			let { oauthIdToken: n, oauthAccessToken: r, oauthTokenSecret: i, pendingToken: a, nonce: o, providerId: s } = t;
			if (!r && !i && !n && !a || !s) return null;
			try {
				return new e(s)._credential({
					idToken: n,
					accessToken: r,
					nonce: o,
					pendingToken: a
				});
			} catch {
				return null;
			}
		}
	}, q = class e extends G {
		constructor() {
			super("facebook.com");
		}
		static credential(t) {
			return H._fromParams({
				providerId: e.PROVIDER_ID,
				signInMethod: e.FACEBOOK_SIGN_IN_METHOD,
				accessToken: t
			});
		}
		static credentialFromResult(t) {
			return e.credentialFromTaggedObject(t);
		}
		static credentialFromError(t) {
			return e.credentialFromTaggedObject(t.customData || {});
		}
		static credentialFromTaggedObject({ _tokenResponse: t }) {
			if (!t || !("oauthAccessToken" in t) || !t.oauthAccessToken) return null;
			try {
				return e.credential(t.oauthAccessToken);
			} catch {
				return null;
			}
		}
	}, q.FACEBOOK_SIGN_IN_METHOD = "facebook.com", q.PROVIDER_ID = "facebook.com", J = class e extends G {
		constructor() {
			super("google.com"), this.addScope("profile");
		}
		static credential(t, n) {
			return H._fromParams({
				providerId: e.PROVIDER_ID,
				signInMethod: e.GOOGLE_SIGN_IN_METHOD,
				idToken: t,
				accessToken: n
			});
		}
		static credentialFromResult(t) {
			return e.credentialFromTaggedObject(t);
		}
		static credentialFromError(t) {
			return e.credentialFromTaggedObject(t.customData || {});
		}
		static credentialFromTaggedObject({ _tokenResponse: t }) {
			if (!t) return null;
			let { oauthIdToken: n, oauthAccessToken: r } = t;
			if (!n && !r) return null;
			try {
				return e.credential(n, r);
			} catch {
				return null;
			}
		}
	}, J.GOOGLE_SIGN_IN_METHOD = "google.com", J.PROVIDER_ID = "google.com", Y = class e extends G {
		constructor() {
			super("github.com");
		}
		static credential(t) {
			return H._fromParams({
				providerId: e.PROVIDER_ID,
				signInMethod: e.GITHUB_SIGN_IN_METHOD,
				accessToken: t
			});
		}
		static credentialFromResult(t) {
			return e.credentialFromTaggedObject(t);
		}
		static credentialFromError(t) {
			return e.credentialFromTaggedObject(t.customData || {});
		}
		static credentialFromTaggedObject({ _tokenResponse: t }) {
			if (!t || !("oauthAccessToken" in t) || !t.oauthAccessToken) return null;
			try {
				return e.credential(t.oauthAccessToken);
			} catch {
				return null;
			}
		}
	}, Y.GITHUB_SIGN_IN_METHOD = "github.com", Y.PROVIDER_ID = "github.com", X = class e extends G {
		constructor() {
			super("twitter.com");
		}
		static credential(t, n) {
			return H._fromParams({
				providerId: e.PROVIDER_ID,
				signInMethod: e.TWITTER_SIGN_IN_METHOD,
				oauthToken: t,
				oauthTokenSecret: n
			});
		}
		static credentialFromResult(t) {
			return e.credentialFromTaggedObject(t);
		}
		static credentialFromError(t) {
			return e.credentialFromTaggedObject(t.customData || {});
		}
		static credentialFromTaggedObject({ _tokenResponse: t }) {
			if (!t) return null;
			let { oauthAccessToken: n, oauthTokenSecret: r } = t;
			if (!n || !r) return null;
			try {
				return e.credential(n, r);
			} catch {
				return null;
			}
		}
	}, X.TWITTER_SIGN_IN_METHOD = "twitter.com", X.PROVIDER_ID = "twitter.com", Z = class e {
		constructor(e) {
			this.user = e.user, this.providerId = e.providerId, this._tokenResponse = e._tokenResponse, this.operationType = e.operationType;
		}
		static async _fromIdTokenResponse(t, n, r, i = !1) {
			return new e({
				user: await V._fromIdTokenResponse(t, r, i),
				providerId: ki(r),
				_tokenResponse: r,
				operationType: n
			});
		}
		static async _forOperation(t, n, r) {
			return await t._updateTokensIfNecessary(r, !0), new e({
				user: t,
				providerId: ki(r),
				_tokenResponse: r,
				operationType: n
			});
		}
	}, ds = class e extends v {
		constructor(t, n, r, i) {
			super(n.code, n.message), this.operationType = r, this.user = i, Object.setPrototypeOf(this, e.prototype), this.customData = {
				appName: t.name,
				tenantId: t.tenantId ?? void 0,
				_serverResponse: n.customData._serverResponse,
				operationType: r
			};
		}
		static _fromErrorAndOperation(t, n, r, i) {
			return new e(t, n, r, i);
		}
	}, Q = class {
		constructor(e, t, n = {}) {
			this.isNewUser = e, this.providerId = t, this.profile = n;
		}
	}, fs = class extends Q {
		constructor(e, t, n, r) {
			super(e, t, n), this.username = r;
		}
	}, ps = class extends Q {
		constructor(e, t) {
			super(e, "facebook.com", t);
		}
	}, ms = class extends fs {
		constructor(e, t) {
			super(e, "github.com", t, typeof t?.login == "string" ? t?.login : null);
		}
	}, hs = class extends Q {
		constructor(e, t) {
			super(e, "google.com", t);
		}
	}, gs = class extends fs {
		constructor(e, t, n) {
			super(e, "twitter.com", t, n);
		}
	}, _s = "__sak", vs = class {
		constructor(e, t) {
			this.storageRetriever = e, this.type = t;
		}
		_isAvailable() {
			try {
				return this.storage ? (this.storage.setItem(_s, "1"), this.storage.removeItem(_s), Promise.resolve(!0)) : Promise.resolve(!1);
			} catch {
				return Promise.resolve(!1);
			}
		}
		_set(e, t) {
			return this.storage.setItem(e, JSON.stringify(t)), Promise.resolve();
		}
		_get(e) {
			let t = this.storage.getItem(e);
			return Promise.resolve(t ? JSON.parse(t) : null);
		}
		_remove(e) {
			return this.storage.removeItem(e), Promise.resolve();
		}
		get storage() {
			return this.storageRetriever();
		}
	}, ys = 1e3, bs = 10, xs = class extends vs {
		constructor() {
			super(() => window.localStorage, "LOCAL"), this.boundEventHandler = (e, t) => this.onStorageEvent(e, t), this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.fallbackToPolling = Wr(), this._shouldAllowMigration = !0;
		}
		forAllChangedKeys(e) {
			for (let t of Object.keys(this.listeners)) {
				let n = this.storage.getItem(t), r = this.localCache[t];
				n !== r && e(t, r, n);
			}
		}
		onStorageEvent(e, t = !1) {
			if (!e.key) {
				this.forAllChangedKeys((e, t, n) => {
					this.notifyListeners(e, n);
				});
				return;
			}
			let n = e.key;
			t ? this.detachListener() : this.stopPolling();
			let r = () => {
				let e = this.storage.getItem(n);
				!t && this.localCache[n] === e || this.notifyListeners(n, e);
			}, i = this.storage.getItem(n);
			Ur() && i !== e.newValue && e.newValue !== e.oldValue ? setTimeout(r, bs) : r();
		}
		notifyListeners(e, t) {
			this.localCache[e] = t;
			let n = this.listeners[e];
			if (n) for (let e of Array.from(n)) e(t && JSON.parse(t));
		}
		startPolling() {
			this.stopPolling(), this.pollTimer = setInterval(() => {
				this.forAllChangedKeys((e, t, n) => {
					this.onStorageEvent(new StorageEvent("storage", {
						key: e,
						oldValue: t,
						newValue: n
					}), !0);
				});
			}, ys);
		}
		stopPolling() {
			this.pollTimer &&= (clearInterval(this.pollTimer), null);
		}
		attachListener() {
			window.addEventListener("storage", this.boundEventHandler);
		}
		detachListener() {
			window.removeEventListener("storage", this.boundEventHandler);
		}
		_addListener(e, t) {
			Object.keys(this.listeners).length === 0 && (this.fallbackToPolling ? this.startPolling() : this.attachListener()), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this.localCache[e] = this.storage.getItem(e)), this.listeners[e].add(t);
		}
		_removeListener(e, t) {
			this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && (this.detachListener(), this.stopPolling());
		}
		async _set(e, t) {
			await super._set(e, t), this.localCache[e] = JSON.stringify(t);
		}
		async _get(e) {
			let t = await super._get(e);
			return this.localCache[e] = JSON.stringify(t), t;
		}
		async _remove(e) {
			await super._remove(e), delete this.localCache[e];
		}
	}, xs.type = "LOCAL", Ss = xs, Cs = 1e3, ws = class {
		constructor() {
			this.type = "COOKIE", this.listenerUnsubscribes = /* @__PURE__ */ new Map();
		}
		_getFinalTarget(e) {
			let t = new URL(`${window.location.origin}/__cookies__`);
			return t.searchParams.set("finalTarget", e), t;
		}
		async _isAvailable() {
			return typeof isSecureContext == "boolean" && !isSecureContext || typeof navigator > "u" || typeof document > "u" ? !1 : navigator.cookieEnabled ?? !0;
		}
		async _set(e, t) {}
		async _get(e) {
			if (!this._isAvailable()) return null;
			let t = ya(e);
			return window.cookieStore ? (await window.cookieStore.get(t))?.value : va(t);
		}
		async _remove(e) {
			if (!this._isAvailable() || !await this._get(e)) return;
			let t = ya(e);
			document.cookie = `${t}=;Max-Age=34560000;Partitioned;Secure;SameSite=Strict;Path=/;Priority=High`, await fetch("/__cookies__", { method: "DELETE" }).catch(() => void 0);
		}
		_addListener(e, t) {
			if (!this._isAvailable()) return;
			let n = ya(e);
			if (window.cookieStore) {
				let e = ((e) => {
					let r = e.changed.find((e) => e.name === n);
					r && t(r.value), e.deleted.find((e) => e.name === n) && t(null);
				});
				return this.listenerUnsubscribes.set(t, () => window.cookieStore.removeEventListener("change", e)), window.cookieStore.addEventListener("change", e);
			}
			let r = va(n), i = setInterval(() => {
				let e = va(n);
				e !== r && (t(e), r = e);
			}, Cs);
			this.listenerUnsubscribes.set(t, () => clearInterval(i));
		}
		_removeListener(e, t) {
			let n = this.listenerUnsubscribes.get(t);
			n && (n(), this.listenerUnsubscribes.delete(t));
		}
	}, ws.type = "COOKIE", Ts = class extends vs {
		constructor() {
			super(() => window.sessionStorage, "SESSION");
		}
		_addListener(e, t) {}
		_removeListener(e, t) {}
	}, Ts.type = "SESSION", Es = Ts, Ds = class e {
		constructor(e) {
			this.eventTarget = e, this.handlersMap = {}, this.boundEventHandler = this.handleEvent.bind(this);
		}
		static _getInstance(t) {
			let n = this.receivers.find((e) => e.isListeningto(t));
			if (n) return n;
			let r = new e(t);
			return this.receivers.push(r), r;
		}
		isListeningto(e) {
			return this.eventTarget === e;
		}
		async handleEvent(e) {
			let t = e, { eventId: n, eventType: r, data: i } = t.data, a = this.handlersMap[r];
			if (!a?.size) return;
			t.ports[0].postMessage({
				status: "ack",
				eventId: n,
				eventType: r
			});
			let o = await ba(Array.from(a).map(async (e) => e(t.origin, i)));
			t.ports[0].postMessage({
				status: "done",
				eventId: n,
				eventType: r,
				response: o
			});
		}
		_subscribe(e, t) {
			Object.keys(this.handlersMap).length === 0 && this.eventTarget.addEventListener("message", this.boundEventHandler), this.handlersMap[e] || (this.handlersMap[e] = /* @__PURE__ */ new Set()), this.handlersMap[e].add(t);
		}
		_unsubscribe(e, t) {
			this.handlersMap[e] && t && this.handlersMap[e].delete(t), (!t || this.handlersMap[e].size === 0) && delete this.handlersMap[e], Object.keys(this.handlersMap).length === 0 && this.eventTarget.removeEventListener("message", this.boundEventHandler);
		}
	}, Ds.receivers = [], Os = class {
		constructor(e) {
			this.target = e, this.handlers = /* @__PURE__ */ new Set();
		}
		removeMessageHandler(e) {
			e.messageChannel && (e.messageChannel.port1.removeEventListener("message", e.onMessage), e.messageChannel.port1.close()), this.handlers.delete(e);
		}
		async _send(e, t, n = 50) {
			let r = typeof MessageChannel < "u" ? new MessageChannel() : null;
			if (!r) throw Error("connection_unavailable");
			let i, a;
			return new Promise((o, s) => {
				let c = xa("", 20);
				r.port1.start();
				let l = setTimeout(() => {
					s(/* @__PURE__ */ Error("unsupported_event"));
				}, n);
				a = {
					messageChannel: r,
					onMessage(e) {
						let t = e;
						if (t.data.eventId === c) switch (t.data.status) {
							case "ack":
								clearTimeout(l), i = setTimeout(() => {
									s(/* @__PURE__ */ Error("timeout"));
								}, 3e3);
								break;
							case "done":
								clearTimeout(i), o(t.data.response);
								break;
							default:
								clearTimeout(l), clearTimeout(i), s(/* @__PURE__ */ Error("invalid_response"));
								break;
						}
					}
				}, this.handlers.add(a), r.port1.addEventListener("message", a.onMessage), this.target.postMessage({
					eventType: e,
					eventId: c,
					data: t
				}, [r.port2]);
			}).finally(() => {
				a && this.removeMessageHandler(a);
			});
		}
	}, ks = "firebaseLocalStorageDb", As = 1, js = "firebaseLocalStorage", Ms = "fbase_key", Ns = class {
		constructor(e) {
			this.request = e;
		}
		toPromise() {
			return new Promise((e, t) => {
				this.request.addEventListener("success", () => {
					e(this.request.result);
				}), this.request.addEventListener("error", () => {
					t(this.request.error);
				});
			});
		}
	}, Ps = 800, Fs = 3, Is = class {
		constructor() {
			this.type = "LOCAL", this._shouldAllowMigration = !0, this.listeners = {}, this.localCache = {}, this.pollTimer = null, this.pendingWrites = 0, this.receiver = null, this.sender = null, this.serviceWorkerReceiverAvailable = !1, this.activeServiceWorker = null, this._workerInitializationPromise = this.initializeServiceWorkerMessaging().then(() => {}, () => {});
		}
		async _openDb() {
			return this.db ||= await ka(), this.db;
		}
		async _withRetries(e) {
			let t = 0;
			for (;;) try {
				return await e(await this._openDb());
			} catch (e) {
				if (t++ > Fs) throw e;
				this.db &&= (this.db.close(), void 0);
			}
		}
		async initializeServiceWorkerMessaging() {
			return Ca() ? this.initializeReceiver() : this.initializeSender();
		}
		async initializeReceiver() {
			this.receiver = Ds._getInstance(Ea()), this.receiver._subscribe("keyChanged", async (e, t) => ({ keyProcessed: (await this._poll()).includes(t.key) })), this.receiver._subscribe("ping", async (e, t) => ["keyChanged"]);
		}
		async initializeSender() {
			if (this.activeServiceWorker = await wa(), !this.activeServiceWorker) return;
			this.sender = new Os(this.activeServiceWorker);
			let e = await this.sender._send("ping", {}, 800);
			e && e[0]?.fulfilled && e[0]?.value.includes("keyChanged") && (this.serviceWorkerReceiverAvailable = !0);
		}
		async notifyServiceWorker(e) {
			if (!(!this.sender || !this.activeServiceWorker || Ta() !== this.activeServiceWorker)) try {
				await this.sender._send("keyChanged", { key: e }, this.serviceWorkerReceiverAvailable ? 800 : 50);
			} catch {}
		}
		async _isAvailable() {
			try {
				if (!indexedDB) return !1;
				let e = await ka();
				return await Aa(e, _s, "1"), await Ma(e, _s), !0;
			} catch {}
			return !1;
		}
		async _withPendingWrite(e) {
			this.pendingWrites++;
			try {
				await e();
			} finally {
				this.pendingWrites--;
			}
		}
		async _set(e, t) {
			return this._withPendingWrite(async () => (await this._withRetries((n) => Aa(n, e, t)), this.localCache[e] = t, this.notifyServiceWorker(e)));
		}
		async _get(e) {
			let t = await this._withRetries((t) => ja(t, e));
			return this.localCache[e] = t, t;
		}
		async _remove(e) {
			return this._withPendingWrite(async () => (await this._withRetries((t) => Ma(t, e)), delete this.localCache[e], this.notifyServiceWorker(e)));
		}
		async _poll() {
			let e = await this._withRetries((e) => new Ns(Da(e, !1).getAll()).toPromise());
			if (!e || this.pendingWrites !== 0) return [];
			let t = [], n = /* @__PURE__ */ new Set();
			if (e.length !== 0) for (let { fbase_key: r, value: i } of e) n.add(r), JSON.stringify(this.localCache[r]) !== JSON.stringify(i) && (this.notifyListeners(r, i), t.push(r));
			for (let e of Object.keys(this.localCache)) this.localCache[e] && !n.has(e) && (this.notifyListeners(e, null), t.push(e));
			return t;
		}
		notifyListeners(e, t) {
			this.localCache[e] = t;
			let n = this.listeners[e];
			if (n) for (let e of Array.from(n)) e(t);
		}
		startPolling() {
			this.stopPolling(), this.pollTimer = setInterval(async () => this._poll(), Ps);
		}
		stopPolling() {
			this.pollTimer &&= (clearInterval(this.pollTimer), null);
		}
		_addListener(e, t) {
			Object.keys(this.listeners).length === 0 && this.startPolling(), this.listeners[e] || (this.listeners[e] = /* @__PURE__ */ new Set(), this._get(e)), this.listeners[e].add(t);
		}
		_removeListener(e, t) {
			this.listeners[e] && (this.listeners[e].delete(t), this.listeners[e].size === 0 && delete this.listeners[e]), Object.keys(this.listeners).length === 0 && this.stopPolling();
		}
	}, Is.type = "LOCAL", Ls = Is, Rs = Qr("rcb"), zs = new ko(3e4, 6e4), Bs = class {
		constructor() {
			this.hostLanguage = "", this.counter = 0, this.librarySeparatelyLoaded = !!z().grecaptcha?.render;
		}
		load(e, t = "") {
			return k(Ia(t), e, "argument-error"), this.shouldResolveImmediately(t) && fr(z().grecaptcha) ? Promise.resolve(z().grecaptcha) : new Promise((n, r) => {
				let i = z().setTimeout(() => {
					r(D(e, "network-request-failed"));
				}, zs.get());
				z()[Rs] = () => {
					z().clearTimeout(i), delete z()[Rs];
					let a = z().grecaptcha;
					if (!a || !fr(a)) {
						r(D(e, "internal-error"));
						return;
					}
					let o = a.render;
					a.render = (e, t) => {
						let n = o(e, t);
						return this.counter++, n;
					}, this.hostLanguage = t, n(a);
				}, Jr(`${Yr()}?${ke({
					onload: Rs,
					render: "explicit",
					hl: t
				})}`).catch(() => {
					clearTimeout(i), r(D(e, "internal-error"));
				});
			});
		}
		clearedOneInstance() {
			this.counter--;
		}
		shouldResolveImmediately(e) {
			return !!z().grecaptcha?.render && (e === this.hostLanguage || this.counter > 0 || this.librarySeparatelyLoaded);
		}
	}, Vs = class {
		async load(e) {
			return new Qo(e);
		}
		clearedOneInstance() {}
	}, Hs = "recaptcha", Us = {
		theme: "light",
		type: "image"
	}, Ws = class {
		constructor(e, t, n = Object.assign({}, Us)) {
			this.parameters = n, this.type = Hs, this.destroyed = !1, this.widgetId = null, this.tokenChangeListeners = /* @__PURE__ */ new Set(), this.renderPromise = null, this.recaptcha = null, this.auth = L(e), this.isInvisible = this.parameters.size === "invisible", k(typeof document < "u", this.auth, "operation-not-supported-in-this-environment");
			let r = typeof t == "string" ? document.getElementById(t) : t;
			k(r, this.auth, "argument-error"), this.container = r, this.parameters.callback = this.makeTokenCallback(this.parameters.callback), this._recaptchaLoader = this.auth.settings.appVerificationDisabledForTesting ? new Vs() : new Bs(), this.validateStartingState();
		}
		async verify() {
			this.assertNotDestroyed();
			let e = await this.render(), t = this.getAssertedRecaptcha();
			return t.getResponse(e) || new Promise((n) => {
				let r = (e) => {
					e && (this.tokenChangeListeners.delete(r), n(e));
				};
				this.tokenChangeListeners.add(r), this.isInvisible && t.execute(e);
			});
		}
		render() {
			try {
				this.assertNotDestroyed();
			} catch (e) {
				return Promise.reject(e);
			}
			return this.renderPromise ||= this.makeRenderPromise().catch((e) => {
				throw this.renderPromise = null, e;
			}), this.renderPromise;
		}
		_reset() {
			this.assertNotDestroyed(), this.widgetId !== null && this.getAssertedRecaptcha().reset(this.widgetId);
		}
		clear() {
			this.assertNotDestroyed(), this.destroyed = !0, this._recaptchaLoader.clearedOneInstance(), this.isInvisible || this.container.childNodes.forEach((e) => {
				this.container.removeChild(e);
			});
		}
		validateStartingState() {
			k(!this.parameters.sitekey, this.auth, "argument-error"), k(this.isInvisible || !this.container.hasChildNodes(), this.auth, "argument-error"), k(typeof document < "u", this.auth, "operation-not-supported-in-this-environment");
		}
		makeTokenCallback(e) {
			return (t) => {
				if (this.tokenChangeListeners.forEach((e) => e(t)), typeof e == "function") e(t);
				else if (typeof e == "string") {
					let n = z()[e];
					typeof n == "function" && n(t);
				}
			};
		}
		assertNotDestroyed() {
			k(!this.destroyed, this.auth, "internal-error");
		}
		async makeRenderPromise() {
			if (await this.init(), !this.widgetId) {
				let e = this.container;
				if (!this.isInvisible) {
					let t = document.createElement("div");
					e.appendChild(t), e = t;
				}
				this.widgetId = this.getAssertedRecaptcha().render(e, this.parameters);
			}
			return this.widgetId;
		}
		async init() {
			k(rr() && !Ca(), this.auth, "internal-error"), await La(), this.recaptcha = await this._recaptchaLoader.load(this.auth, this.auth.languageCode || void 0);
			let e = await mr(this.auth);
			k(e, this.auth, "internal-error"), this.parameters.sitekey = e;
		}
		getAssertedRecaptcha() {
			return k(this.recaptcha, this.auth, "internal-error"), this.recaptcha;
		}
	}, Gs = class {
		constructor(e, t) {
			this.verificationId = e, this.onConfirmation = t;
		}
		confirm(e) {
			let t = ls._fromVerification(this.verificationId, e);
			return this.onConfirmation(t);
		}
	}, Ks = class e {
		constructor(t) {
			this.providerId = e.PROVIDER_ID, this.auth = L(t);
		}
		verifyPhoneNumber(e, t) {
			return Ba(this.auth, e, _(t));
		}
		static credential(e, t) {
			return ls._fromVerification(e, t);
		}
		static credentialFromResult(t) {
			let n = t;
			return e.credentialFromTaggedObject(n);
		}
		static credentialFromError(t) {
			return e.credentialFromTaggedObject(t.customData || {});
		}
		static credentialFromTaggedObject({ _tokenResponse: e }) {
			if (!e) return null;
			let { phoneNumber: t, temporaryProof: n } = e;
			return t && n ? ls._fromTokenResponse(t, n) : null;
		}
	}, Ks.PROVIDER_ID = "phone", Ks.PHONE_SIGN_IN_METHOD = "phone", qs = class extends as {
		constructor(e) {
			super("custom", "custom"), this.params = e;
		}
		_getIdTokenResponse(e) {
			return xi(e, this._buildIdpRequest());
		}
		_linkToIdToken(e, t) {
			return xi(e, this._buildIdpRequest(t));
		}
		_getReauthenticationResolver(e) {
			return xi(e, this._buildIdpRequest());
		}
		_buildIdpRequest(e) {
			let t = {
				requestUri: this.params.requestUri,
				sessionId: this.params.sessionId,
				postBody: this.params.postBody,
				tenantId: this.params.tenantId,
				pendingToken: this.params.pendingToken,
				returnSecureToken: !0,
				returnIdpCredential: !0
			};
			return e && (t.idToken = e), t;
		}
	}, Js = class {
		constructor(e, t, n, r, i = !1) {
			this.auth = e, this.resolver = n, this.user = r, this.bypassAuthState = i, this.pendingPromise = null, this.eventManager = null, this.filter = Array.isArray(t) ? t : [t];
		}
		execute() {
			return new Promise(async (e, t) => {
				this.pendingPromise = {
					resolve: e,
					reject: t
				};
				try {
					this.eventManager = await this.resolver._initialize(this.auth), await this.onExecution(), this.eventManager.registerConsumer(this);
				} catch (e) {
					this.reject(e);
				}
			});
		}
		async onAuthEvent(e) {
			let { urlResponse: t, sessionId: n, postBody: r, tenantId: i, error: a, type: o } = e;
			if (a) {
				this.reject(a);
				return;
			}
			let s = {
				auth: this.auth,
				requestUri: t,
				sessionId: n,
				tenantId: i || void 0,
				postBody: r || void 0,
				user: this.user,
				bypassAuthState: this.bypassAuthState
			};
			try {
				this.resolve(await this.getIdpTask(o)(s));
			} catch (e) {
				this.reject(e);
			}
		}
		onError(e) {
			this.reject(e);
		}
		getIdpTask(e) {
			switch (e) {
				case "signInViaPopup":
				case "signInViaRedirect": return Ua;
				case "linkViaPopup":
				case "linkViaRedirect": return Ga;
				case "reauthViaPopup":
				case "reauthViaRedirect": return Wa;
				default: E(this.auth, "internal-error");
			}
		}
		resolve(e) {
			j(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.resolve(e), this.unregisterAndCleanUp();
		}
		reject(e) {
			j(this.pendingPromise, "Pending promise was never set"), this.pendingPromise.reject(e), this.unregisterAndCleanUp();
		}
		unregisterAndCleanUp() {
			this.eventManager && this.eventManager.unregisterConsumer(this), this.pendingPromise = null, this.cleanUp();
		}
	}, Ys = new ko(2e3, 1e4), Xs = class e extends Js {
		constructor(t, n, r, i, a) {
			super(t, n, i, a), this.provider = r, this.authWindow = null, this.pollId = null, e.currentPopupAction && e.currentPopupAction.cancel(), e.currentPopupAction = this;
		}
		async executeNotNull() {
			let e = await this.execute();
			return k(e, this.auth, "internal-error"), e;
		}
		async onExecution() {
			j(this.filter.length === 1, "Popup operations only handle one event");
			let e = xa();
			this.authWindow = await this.resolver._openPopup(this.auth, this.provider, this.filter[0], e), this.authWindow.associatedEvent = e, this.resolver._originValidation(this.auth).catch((e) => {
				this.reject(e);
			}), this.resolver._isIframeWebStorageSupported(this.auth, (e) => {
				e || this.reject(D(this.auth, "web-storage-unsupported"));
			}), this.pollUserCancellation();
		}
		get eventId() {
			return this.authWindow?.associatedEvent || null;
		}
		cancel() {
			this.reject(D(this.auth, "cancelled-popup-request"));
		}
		cleanUp() {
			this.authWindow && this.authWindow.close(), this.pollId && window.clearTimeout(this.pollId), this.authWindow = null, this.pollId = null, e.currentPopupAction = null;
		}
		pollUserCancellation() {
			let e = () => {
				if (this.authWindow?.window?.closed) {
					this.pollId = window.setTimeout(() => {
						this.pollId = null, this.reject(D(this.auth, "popup-closed-by-user"));
					}, 8e3);
					return;
				}
				this.pollId = window.setTimeout(e, Ys.get());
			};
			e();
		}
	}, Xs.currentPopupAction = null, Zs = "pendingRedirect", Qs = /* @__PURE__ */ new Map(), $s = class extends Js {
		constructor(e, t, n = !1) {
			super(e, [
				"signInViaRedirect",
				"linkViaRedirect",
				"reauthViaRedirect",
				"unknown"
			], t, void 0, n), this.eventId = null;
		}
		async execute() {
			let e = Qs.get(this.auth._key());
			if (!e) {
				try {
					let t = await Ja(this.resolver, this.auth) ? await super.execute() : null;
					e = () => Promise.resolve(t);
				} catch (t) {
					e = () => Promise.reject(t);
				}
				Qs.set(this.auth._key(), e);
			}
			return this.bypassAuthState || Qs.set(this.auth._key(), () => Promise.resolve(null)), e();
		}
		async onAuthEvent(e) {
			if (e.type === "signInViaRedirect") return super.onAuthEvent(e);
			if (e.type === "unknown") {
				this.resolve(null);
				return;
			}
			if (e.eventId) {
				let t = await this.auth._redirectUserForId(e.eventId);
				if (t) return this.user = t, super.onAuthEvent(e);
				this.resolve(null);
			}
		}
		async onExecution() {}
		cleanUp() {}
	}, ec = 600 * 1e3, tc = class {
		constructor(e) {
			this.auth = e, this.cachedEventUids = /* @__PURE__ */ new Set(), this.consumers = /* @__PURE__ */ new Set(), this.queuedRedirectEvent = null, this.hasHandledPotentialRedirect = !1, this.lastProcessedEventTime = Date.now();
		}
		registerConsumer(e) {
			this.consumers.add(e), this.queuedRedirectEvent && this.isEventForConsumer(this.queuedRedirectEvent, e) && (this.sendToConsumer(this.queuedRedirectEvent, e), this.saveEventToCache(this.queuedRedirectEvent), this.queuedRedirectEvent = null);
		}
		unregisterConsumer(e) {
			this.consumers.delete(e);
		}
		onEvent(e) {
			if (this.hasEventBeenHandled(e)) return !1;
			let t = !1;
			return this.consumers.forEach((n) => {
				this.isEventForConsumer(e, n) && (t = !0, this.sendToConsumer(e, n), this.saveEventToCache(e));
			}), this.hasHandledPotentialRedirect || !co(e) ? t : (this.hasHandledPotentialRedirect = !0, t ||= (this.queuedRedirectEvent = e, !0), t);
		}
		sendToConsumer(e, t) {
			if (e.error && !so(e)) {
				let n = e.error.code?.split("auth/")[1] || "internal-error";
				t.onError(D(this.auth, n));
			} else t.onAuthEvent(e);
		}
		isEventForConsumer(e, t) {
			let n = t.eventId === null || !!e.eventId && e.eventId === t.eventId;
			return t.filter.includes(e.type) && n;
		}
		hasEventBeenHandled(e) {
			return Date.now() - this.lastProcessedEventTime >= ec && this.cachedEventUids.clear(), this.cachedEventUids.has(oo(e));
		}
		saveEventToCache(e) {
			this.cachedEventUids.add(oo(e)), this.lastProcessedEventTime = Date.now();
		}
	}, nc = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/, rc = /^https?/, ic = new ko(3e4, 6e4), ac = null, oc = new ko(5e3, 15e3), sc = "__/auth/iframe", cc = "emulator/auth/iframe", lc = {
		style: {
			position: "absolute",
			top: "-100px",
			width: "1px",
			height: "1px"
		},
		"aria-hidden": "true",
		tabindex: "-1"
	}, uc = new Map([
		["identitytoolkit.googleapis.com", "p"],
		["staging-identitytoolkit.sandbox.googleapis.com", "s"],
		["test-identitytoolkit.sandbox.googleapis.com", "t"]
	]), dc = {
		location: "yes",
		resizable: "yes",
		statusbar: "yes",
		toolbar: "no"
	}, fc = 500, pc = 600, mc = "_blank", hc = "http://localhost", gc = class {
		constructor(e) {
			this.window = e, this.associatedEvent = null;
		}
		close() {
			if (this.window) try {
				this.window.close();
			} catch {}
		}
	}, _c = "__/auth/handler", vc = "emulator/auth/handler", yc = "fac", bc = "webStorageSupport", xc = class {
		constructor() {
			this.eventManagers = {}, this.iframes = {}, this.originValidationPromises = {}, this._redirectPersistence = Es, this._completeRedirectFn = io, this._overrideRedirectResult = Xa;
		}
		async _openPopup(e, t, n, r) {
			return j(this.eventManagers[e._key()]?.manager, "_initialize() not called before _openPopup()"), vo(e, await bo(e, t, n, nr(), r), xa());
		}
		async _openRedirect(e, t, n, r) {
			return await this._originValidation(e), Sa(await bo(e, t, n, nr(), r)), new Promise(() => {});
		}
		_initialize(e) {
			let t = e._key();
			if (this.eventManagers[t]) {
				let { manager: e, promise: n } = this.eventManagers[t];
				return e ? Promise.resolve(e) : (j(n, "If manager is not set, promise should be"), n);
			}
			let n = this.initAndGetManager(e);
			return this.eventManagers[t] = { promise: n }, n.catch(() => {
				delete this.eventManagers[t];
			}), n;
		}
		async initAndGetManager(e) {
			let t = await _o(e), n = new tc(e);
			return t.register("authEvent", (t) => (k(t?.authEvent, e, "invalid-auth-event"), { status: n.onEvent(t.authEvent) ? "ACK" : "ERROR" }), gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER), this.eventManagers[e._key()] = { manager: n }, this.iframes[e._key()] = t, n;
		}
		_isIframeWebStorageSupported(e, t) {
			this.iframes[e._key()].send(bc, { type: bc }, (n) => {
				let r = n?.[0]?.[bc];
				r !== void 0 && t(!!r), E(e, "internal-error");
			}, gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER);
		}
		_originValidation(e) {
			let t = e._key();
			return this.originValidationPromises[t] || (this.originValidationPromises[t] = uo(e)), this.originValidationPromises[t];
		}
		get _shouldInitProactively() {
			return Wr() || Fr() || Vr();
		}
	}, Sc = xc, Cc = class {
		constructor(e) {
			this.factorId = e;
		}
		_process(e, t, n) {
			switch (t.type) {
				case "enroll": return this._finalizeEnroll(e, t.credential, n);
				case "signin": return this._finalizeSignIn(e, t.credential);
				default: return A("unexpected MultiFactorSessionType");
			}
		}
	}, wc = class e extends Cc {
		constructor(e) {
			super("phone"), this.credential = e;
		}
		static _fromCredential(t) {
			return new e(t);
		}
		_finalizeEnroll(e, t, n) {
			return ha(e, {
				idToken: t,
				displayName: n,
				phoneVerificationInfo: this.credential._makeVerificationRequest()
			});
		}
		_finalizeSignIn(e, t) {
			return Pa(e, {
				mfaPendingCredential: t,
				phoneVerificationInfo: this.credential._makeVerificationRequest()
			});
		}
	}, Tc = class {
		constructor() {}
		static assertion(e) {
			return wc._fromCredential(e);
		}
	}, Tc.FACTOR_ID = "phone", Ec = class {
		static assertionForEnrollment(e, t) {
			return Dc._fromSecret(e, t);
		}
		static assertionForSignIn(e, t) {
			return Dc._fromEnrollmentId(e, t);
		}
		static async generateSecret(e) {
			let t = e;
			k(t.user?.auth !== void 0, "internal-error");
			let n = await ga(t.user.auth, {
				idToken: t.credential,
				totpEnrollmentInfo: {}
			});
			return Oc._fromStartTotpMfaEnrollmentResponse(n, t.user.auth);
		}
	}, Ec.FACTOR_ID = "totp", Dc = class e extends Cc {
		constructor(e, t, n) {
			super("totp"), this.otp = e, this.enrollmentId = t, this.secret = n;
		}
		static _fromSecret(t, n) {
			return new e(n, void 0, t);
		}
		static _fromEnrollmentId(t, n) {
			return new e(n, t);
		}
		async _finalizeEnroll(e, t, n) {
			return k(this.secret !== void 0, e, "argument-error"), _a(e, {
				idToken: t,
				displayName: n,
				totpVerificationInfo: this.secret._makeTotpVerificationInfo(this.otp)
			});
		}
		async _finalizeSignIn(e, t) {
			k(this.enrollmentId !== void 0 && this.otp !== void 0, e, "argument-error");
			let n = { verificationCode: this.otp };
			return Fa(e, {
				mfaPendingCredential: t,
				mfaEnrollmentId: this.enrollmentId,
				totpVerificationInfo: n
			});
		}
	}, Oc = class e {
		constructor(e, t, n, r, i, a, o) {
			this.sessionInfo = a, this.auth = o, this.secretKey = e, this.hashingAlgorithm = t, this.codeLength = n, this.codeIntervalSeconds = r, this.enrollmentCompletionDeadline = i;
		}
		static _fromStartTotpMfaEnrollmentResponse(t, n) {
			return new e(t.totpSessionInfo.sharedSecretKey, t.totpSessionInfo.hashingAlgorithm, t.totpSessionInfo.verificationCodeLength, t.totpSessionInfo.periodSec, new Date(t.totpSessionInfo.finalizeEnrollmentTime).toUTCString(), t.totpSessionInfo.sessionInfo, n);
		}
		_makeTotpVerificationInfo(e) {
			return {
				sessionInfo: this.sessionInfo,
				verificationCode: e
			};
		}
		generateQrCodeUrl(e, t) {
			let n = !1;
			return (So(e) || So(t)) && (n = !0), n && (So(e) && (e = this.auth.currentUser?.email || "unknownuser"), So(t) && (t = this.auth.name)), `otpauth://totp/${t}:${e}?secret=${this.secretKey}&issuer=${t}&algorithm=${this.hashingAlgorithm}&digits=${this.codeLength}`;
		}
	}, kc = "@firebase/auth", Ac = "1.10.8", jc = class {
		constructor(e) {
			this.auth = e, this.internalListeners = /* @__PURE__ */ new Map();
		}
		getUid() {
			return this.assertAuthConfigured(), this.auth.currentUser?.uid || null;
		}
		async getToken(e) {
			return this.assertAuthConfigured(), await this.auth._initializationPromise, this.auth.currentUser ? { accessToken: await this.auth.currentUser.getIdToken(e) } : null;
		}
		addAuthTokenListener(e) {
			if (this.assertAuthConfigured(), this.internalListeners.has(e)) return;
			let t = this.auth.onIdTokenChanged((t) => {
				e(t?.stsTokenManager.accessToken || null);
			});
			this.internalListeners.set(e, t), this.updateProactiveRefresh();
		}
		removeAuthTokenListener(e) {
			this.assertAuthConfigured();
			let t = this.internalListeners.get(e);
			t && (this.internalListeners.delete(e), t(), this.updateProactiveRefresh());
		}
		assertAuthConfigured() {
			k(this.auth._initializationPromise, "dependent-sdk-initialized-before-auth");
		}
		updateProactiveRefresh() {
			this.internalListeners.size > 0 ? this.auth._startProactiveRefresh() : this.auth._stopProactiveRefresh();
		}
	}, Mc = Je("authIdTokenMaxAge") || 300, Nc = null, Pc = (e) => async (t) => {
		let n = t && await t.getIdTokenResult(), r = n && ((/* @__PURE__ */ new Date()).getTime() - Date.parse(n.issuedAtTime)) / 1e3;
		if (r && r > Mc) return;
		let i = n?.token;
		Nc !== i && (Nc = i, await fetch(e, {
			method: i ? "POST" : "DELETE",
			headers: i ? { Authorization: `Bearer ${i}` } : {}
		}));
	}, qr({
		loadJS(e) {
			return new Promise((t, n) => {
				let r = document.createElement("script");
				r.setAttribute("src", e), r.onload = t, r.onerror = (e) => {
					let t = D("internal-error");
					t.customData = e, n(t);
				}, r.type = "text/javascript", r.charset = "UTF-8", To().appendChild(r);
			});
		},
		gapiScript: "https://apis.google.com/js/api.js",
		recaptchaV2Script: "https://www.google.com/recaptcha/api.js",
		recaptchaEnterpriseScript: "https://www.google.com/recaptcha/enterprise.js?render="
	}), wo("Browser");
})), Ic = t((() => {
	Fc(), qn(), mt();
})), Lc = t((() => {
	Ic();
})), Rc = /* @__PURE__ */ n({ FirebaseAuthenticationWeb: () => $ }), $, zc = t((() => {
	se(), Lc(), le(), $ = class e extends u {
		constructor() {
			super(), this.lastConfirmationResult = /* @__PURE__ */ new Map();
			let e = B();
			e.onAuthStateChanged((e) => this.handleAuthStateChange(e)), e.onIdTokenChanged((e) => void this.handleIdTokenChange(e));
		}
		async applyActionCode(e) {
			return Ki(B(), e.oobCode);
		}
		async createUserWithEmailAndPassword(e) {
			let t = await qi(B(), e.email, e.password);
			return this.createSignInResult(t, null);
		}
		async confirmPasswordReset(e) {
			return Gi(B(), e.oobCode, e.newPassword);
		}
		async confirmVerificationCode(t) {
			let { verificationCode: n, verificationId: r } = t, i = this.lastConfirmationResult.get(r);
			if (!i) throw Error(e.ERROR_CONFIRMATION_RESULT_MISSING);
			let a = await i.confirm(n);
			return this.createSignInResult(a, null);
		}
		async deleteUser() {
			let t = B().currentUser;
			if (!t) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			return pa(t);
		}
		async fetchSignInMethodsForEmail(e) {
			return { signInMethods: await $i(B(), e.email) };
		}
		async getPendingAuthResult() {
			throw this.unimplemented("Not implemented on web.");
		}
		async getCurrentUser() {
			let e = B();
			return { user: this.createUserResult(e.currentUser) };
		}
		async getIdToken(t) {
			let n = B();
			if (!n.currentUser) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			return { token: await n.currentUser.getIdToken(t?.forceRefresh) || "" };
		}
		async getIdTokenResult(t) {
			let n = B();
			if (!n.currentUser) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			let r = await n.currentUser.getIdTokenResult(t?.forceRefresh);
			return Object.assign(Object.assign({}, r), {
				authTime: Date.parse(r.authTime),
				expirationTime: Date.parse(r.expirationTime),
				issuedAtTime: Date.parse(r.issuedAtTime)
			});
		}
		async getRedirectResult() {
			let e = await ro(B()), t = e ? K.credentialFromResult(e) : null;
			return this.createSignInResult(e, t);
		}
		async getTenantId() {
			return { tenantId: B().tenantId };
		}
		async isSignInWithEmailLink(e) {
			return { isSignInWithEmailLink: Xi(B(), e.emailLink) };
		}
		async linkWithApple(e) {
			let t = new K(h.APPLE);
			this.applySignInOptions(e || {}, t);
			let n = await this.linkCurrentUserWithPopupOrRedirect(t, e?.mode), r = K.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async linkWithEmailAndPassword(e) {
			let t = U.credential(e.email, e.password), n = await this.linkCurrentUserWithCredential(t);
			return this.createSignInResult(n, t);
		}
		async linkWithEmailLink(e) {
			let t = U.credentialWithLink(e.email, e.emailLink), n = await this.linkCurrentUserWithCredential(t);
			return this.createSignInResult(n, t);
		}
		async linkWithFacebook(e) {
			let t = new q();
			this.applySignInOptions(e || {}, t);
			let n = await this.linkCurrentUserWithPopupOrRedirect(t, e?.mode), r = q.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async linkWithGameCenter() {
			throw this.unimplemented("Not implemented on web.");
		}
		async linkWithGithub(e) {
			let t = new Y();
			this.applySignInOptions(e || {}, t);
			let n = await this.linkCurrentUserWithPopupOrRedirect(t, e?.mode), r = Y.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async linkWithGoogle(e) {
			let t = new J();
			this.applySignInOptions(e || {}, t);
			let n = await this.linkCurrentUserWithPopupOrRedirect(t, e?.mode), r = J.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async linkWithMicrosoft(e) {
			let t = new K(h.MICROSOFT);
			this.applySignInOptions(e || {}, t);
			let n = await this.linkCurrentUserWithPopupOrRedirect(t, e?.mode), r = K.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async linkWithOpenIdConnect(e) {
			let t = new K(e.providerId);
			this.applySignInOptions(e, t);
			let n = await this.linkCurrentUserWithPopupOrRedirect(t, e.mode), r = K.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async linkWithPhoneNumber(t) {
			let n = B().currentUser;
			if (!n) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			if (!t.phoneNumber) throw Error(e.ERROR_PHONE_NUMBER_MISSING);
			if (!t.recaptchaVerifier || !(t.recaptchaVerifier instanceof Ws)) throw Error(e.ERROR_RECAPTCHA_VERIFIER_MISSING);
			try {
				let r = await za(n, t.phoneNumber, t.recaptchaVerifier), { verificationId: i } = r;
				this.lastConfirmationResult.set(i, r);
				let a = { verificationId: i };
				this.notifyListeners(e.PHONE_CODE_SENT_EVENT, a);
			} catch (t) {
				let n = { message: this.getErrorMessage(t) };
				this.notifyListeners(e.PHONE_VERIFICATION_FAILED_EVENT, n);
			}
		}
		async linkWithPlayGames() {
			throw this.unimplemented("Not implemented on web.");
		}
		async linkWithTwitter(e) {
			let t = new X();
			this.applySignInOptions(e || {}, t);
			let n = await this.linkCurrentUserWithPopupOrRedirect(t, e?.mode), r = X.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async linkWithYahoo(e) {
			let t = new K(h.YAHOO);
			this.applySignInOptions(e || {}, t);
			let n = await this.linkCurrentUserWithPopupOrRedirect(t, e?.mode), r = K.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async reload() {
			let t = B().currentUser;
			if (!t) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			return Dr(t);
		}
		async revokeAccessToken(e) {
			return fa(B(), e.token);
		}
		async sendEmailVerification(t) {
			let n = B().currentUser;
			if (!n) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			return ea(n, t?.actionCodeSettings);
		}
		async sendPasswordResetEmail(e) {
			return Wi(B(), e.email, e.actionCodeSettings);
		}
		async sendSignInLinkToEmail(e) {
			return Yi(B(), e.email, e.actionCodeSettings);
		}
		async setLanguageCode(e) {
			let t = B();
			t.languageCode = e.languageCode;
		}
		async setPersistence(e) {
			let t = B();
			switch (e.persistence) {
				case ce.BrowserLocal:
					await la(t, Ss);
					break;
				case ce.BrowserSession:
					await la(t, Es);
					break;
				case ce.IndexedDbLocal:
					await la(t, Ls);
					break;
				case ce.InMemory:
					await la(t, Vo);
					break;
			}
		}
		async setTenantId(e) {
			let t = B();
			t.tenantId = e.tenantId;
		}
		async signInAnonymously() {
			let e = await Ai(B());
			return this.createSignInResult(e, null);
		}
		async signInWithApple(e) {
			let t = new K(h.APPLE);
			this.applySignInOptions(e || {}, t);
			let n = await this.signInWithPopupOrRedirect(t, e?.mode), r = K.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async signInWithCustomToken(e) {
			let t = await Vi(B(), e.token);
			return this.createSignInResult(t, null);
		}
		async signInWithEmailAndPassword(e) {
			let t = await Ji(B(), e.email, e.password);
			return this.createSignInResult(t, null);
		}
		async signInWithEmailLink(e) {
			let t = await Zi(B(), e.email, e.emailLink);
			return this.createSignInResult(t, null);
		}
		async signInWithFacebook(e) {
			let t = new q();
			this.applySignInOptions(e || {}, t);
			let n = await this.signInWithPopupOrRedirect(t, e?.mode), r = q.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async signInWithGithub(e) {
			let t = new Y();
			this.applySignInOptions(e || {}, t);
			let n = await this.signInWithPopupOrRedirect(t, e?.mode), r = Y.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async signInWithGoogle(e) {
			let t = new J();
			this.applySignInOptions(e || {}, t);
			let n = await this.signInWithPopupOrRedirect(t, e?.mode), r = J.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async signInWithMicrosoft(e) {
			let t = new K(h.MICROSOFT);
			this.applySignInOptions(e || {}, t);
			let n = await this.signInWithPopupOrRedirect(t, e?.mode), r = K.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async signInWithOpenIdConnect(e) {
			let t = new K(e.providerId);
			this.applySignInOptions(e, t);
			let n = await this.signInWithPopupOrRedirect(t, e.mode), r = K.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async signInWithPhoneNumber(t) {
			if (!t.phoneNumber) throw Error(e.ERROR_PHONE_NUMBER_MISSING);
			if (!t.recaptchaVerifier || !(t.recaptchaVerifier instanceof Ws)) throw Error(e.ERROR_RECAPTCHA_VERIFIER_MISSING);
			let n = B();
			try {
				let r = await Ra(n, t.phoneNumber, t.recaptchaVerifier), { verificationId: i } = r;
				this.lastConfirmationResult.set(i, r);
				let a = { verificationId: i };
				this.notifyListeners(e.PHONE_CODE_SENT_EVENT, a);
			} catch (t) {
				let n = { message: this.getErrorMessage(t) };
				this.notifyListeners(e.PHONE_VERIFICATION_FAILED_EVENT, n);
			}
		}
		async signInWithPlayGames() {
			throw this.unimplemented("Not implemented on web.");
		}
		async signInWithGameCenter() {
			throw this.unimplemented("Not implemented on web.");
		}
		async signInWithTwitter(e) {
			let t = new X();
			this.applySignInOptions(e || {}, t);
			let n = await this.signInWithPopupOrRedirect(t, e?.mode), r = X.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async signInWithYahoo(e) {
			let t = new K(h.YAHOO);
			this.applySignInOptions(e || {}, t);
			let n = await this.signInWithPopupOrRedirect(t, e?.mode), r = K.credentialFromResult(n);
			return this.createSignInResult(n, r);
		}
		async signOut() {
			await B().signOut();
		}
		async unlink(t) {
			let n = B();
			if (!n.currentUser) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			let r = await Ni(n.currentUser, t.providerId);
			return { user: this.createUserResult(r) };
		}
		async updateEmail(t) {
			let n = B().currentUser;
			if (!n) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			return ia(n, t.newEmail);
		}
		async updatePassword(t) {
			let n = B().currentUser;
			if (!n) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			return aa(n, t.newPassword);
		}
		async updateProfile(t) {
			let n = B().currentUser;
			if (!n) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			return ra(n, {
				displayName: t.displayName,
				photoURL: t.photoUrl
			});
		}
		async useAppLanguage() {
			B().useDeviceLanguage();
		}
		async useEmulator(e) {
			let t = B(), n = e.port || 9099, r = e.scheme || "http";
			e.host.includes("://") ? ii(t, `${e.host}:${n}`) : ii(t, `${r}://${e.host}:${n}`);
		}
		async verifyBeforeUpdateEmail(t) {
			let n = B().currentUser;
			if (!n) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			return ta(n, t?.newEmail, t?.actionCodeSettings);
		}
		handleAuthStateChange(t) {
			let n = { user: this.createUserResult(t) };
			this.notifyListeners(e.AUTH_STATE_CHANGE_EVENT, n, !0);
		}
		async handleIdTokenChange(t) {
			if (!t) return;
			let n = { token: await t.getIdToken(!1) };
			this.notifyListeners(e.ID_TOKEN_CHANGE_EVENT, n, !0);
		}
		applySignInOptions(e, t) {
			if (e.customParameters) {
				let n = {};
				e.customParameters.map((e) => {
					n[e.key] = e.value;
				}), t.setCustomParameters(n);
			}
			if (e.scopes) for (let n of e.scopes) t.addScope(n);
		}
		signInWithPopupOrRedirect(e, t) {
			let n = B();
			return t === "redirect" ? $a(n, e) : Ka(n, e);
		}
		linkCurrentUserWithPopupOrRedirect(t, n) {
			let r = B();
			if (!r.currentUser) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			return n === "redirect" ? to(r.currentUser, t) : qa(r.currentUser, t);
		}
		linkCurrentUserWithCredential(t) {
			let n = B();
			if (!n.currentUser) throw Error(e.ERROR_NO_USER_SIGNED_IN);
			return zi(n.currentUser, t);
		}
		requestAppTrackingTransparencyPermission() {
			throw this.unimplemented("Not implemented on web.");
		}
		checkAppTrackingTransparencyPermission() {
			throw this.unimplemented("Not implemented on web.");
		}
		createSignInResult(e, t) {
			return {
				user: this.createUserResult(e?.user || null),
				credential: this.createCredentialResult(t),
				additionalUserInfo: this.createAdditionalUserInfoResult(e)
			};
		}
		createCredentialResult(e) {
			if (!e) return null;
			let t = { providerId: e.providerId };
			return e instanceof H && (t.accessToken = e.accessToken, t.idToken = e.idToken, t.secret = e.secret), t;
		}
		createUserResult(e) {
			return e ? {
				displayName: e.displayName,
				email: e.email,
				emailVerified: e.emailVerified,
				isAnonymous: e.isAnonymous,
				metadata: this.createUserMetadataResult(e.metadata),
				phoneNumber: e.phoneNumber,
				photoUrl: e.photoURL,
				providerData: this.createUserProviderDataResult(e.providerData),
				providerId: e.providerId,
				tenantId: e.tenantId,
				uid: e.uid
			} : null;
		}
		createUserMetadataResult(e) {
			let t = {};
			return e.creationTime && (t.creationTime = Date.parse(e.creationTime)), e.lastSignInTime && (t.lastSignInTime = Date.parse(e.lastSignInTime)), t;
		}
		createUserProviderDataResult(e) {
			return e.map((e) => ({
				displayName: e.displayName,
				email: e.email,
				phoneNumber: e.phoneNumber,
				photoUrl: e.photoURL,
				providerId: e.providerId,
				uid: e.uid
			}));
		}
		createAdditionalUserInfoResult(e) {
			if (!e) return null;
			let t = ca(e);
			if (!t) return null;
			let { isNewUser: n, profile: r, providerId: i, username: a } = t, o = { isNewUser: n };
			return i !== null && (o.providerId = i), r !== null && (o.profile = r), a != null && (o.username = a), o;
		}
		getErrorMessage(e) {
			return e instanceof Object && "message" in e && typeof e.message == "string" ? e.message : JSON.stringify(e);
		}
	}, $.AUTH_STATE_CHANGE_EVENT = "authStateChange", $.ID_TOKEN_CHANGE_EVENT = "idTokenChange", $.PHONE_CODE_SENT_EVENT = "phoneCodeSent", $.PHONE_VERIFICATION_FAILED_EVENT = "phoneVerificationFailed", $.ERROR_NO_USER_SIGNED_IN = "No user is signed in.", $.ERROR_PHONE_NUMBER_MISSING = "phoneNumber must be provided.", $.ERROR_RECAPTCHA_VERIFIER_MISSING = "recaptchaVerifier must be provided and must be an instance of RecaptchaVerifier.", $.ERROR_CONFIRMATION_RESULT_MISSING = "No confirmation result with this verification id was found.";
}));
se(), le();
var Bc = l("FirebaseAuthentication", { web: () => Promise.resolve().then(() => (zc(), Rc)).then((e) => new e.FirebaseAuthenticationWeb()) });
//#endregion
//#region src/native/auth-google-native.ts
async function Vc() {
	console.info("[nbl-auth]", "native-google-plugin-call-start");
	try {
		let e = await Bc.signInWithGoogle(), t = e?.credential?.idToken;
		if (!t) {
			let e = /* @__PURE__ */ Error("Native Google sign-in returned no id token.");
			throw e.code = "auth/native-google-no-token", console.info("[nbl-auth]", "native-google-plugin-error", {
				code: e.code,
				message: e.message
			}), e;
		}
		return console.info("[nbl-auth]", "native-google-plugin-call-resolved", {
			hasIdToken: !0,
			hasAccessToken: !!e.credential?.accessToken
		}), {
			idToken: t,
			accessToken: e.credential?.accessToken ?? void 0
		};
	} catch (e) {
		let t = e;
		throw console.info("[nbl-auth]", "native-google-plugin-error", {
			code: t?.code ?? null,
			message: t?.message ?? String(e)
		}), e;
	}
}
//#endregion
export { Vc as nativeGoogleSignIn };
