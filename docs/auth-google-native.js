//#region src/native/auth-google-native.ts
var e = "FirebaseAuthentication", t = 45e3;
function n() {
	if (!(typeof globalThis > "u")) return globalThis.Capacitor;
}
function r(e, t) {
	t === void 0 ? console.info("[nbl-auth]", e) : console.info("[nbl-auth]", e, t);
}
function i(t) {
	return Array.isArray(t.PluginHeaders) && t.PluginHeaders.some((t) => t?.name === e);
}
function a(t) {
	return typeof t.Plugins?.[e]?.signInWithGoogle == "function" || i(t) ? !0 : typeof t.isPluginAvailable == "function" ? t.isPluginAvailable(e) : !1;
}
function o() {
	let t = n();
	if (!t?.isNativePlatform?.()) {
		let e = /* @__PURE__ */ Error("Native Google sign-in requires the Capacitor app.");
		throw e.code = "auth/native-not-capacitor", e;
	}
	let o = i(t), s = a(t);
	if (r("plugin-availability-check", {
		available: s,
		nativeHeader: o,
		platform: typeof t.getPlatform == "function" ? t.getPlatform() : "unknown",
		hasNativePromise: typeof t.nativePromise == "function",
		hasRegisterPlugin: typeof t.registerPlugin == "function",
		hasPluginsEntry: !!t.Plugins?.[e]
	}), !s) {
		let e = /* @__PURE__ */ Error("FirebaseAuthentication native plugin is unavailable. Run npm run build:cap, npx cap sync ios, then rebuild in Xcode.");
		throw e.code = "auth/native-firebase-plugin-unavailable", e;
	}
	let c = t.Plugins?.[e];
	if (typeof c?.signInWithGoogle == "function") return c;
	if (o && typeof t.nativePromise == "function") return r("plugin-bridge-nativePromise"), { signInWithGoogle: () => t.nativePromise(e, "signInWithGoogle", {}) };
	if (typeof t.registerPlugin == "function") return t.registerPlugin(e);
	let l = /* @__PURE__ */ Error("Capacitor native bridge cannot reach FirebaseAuthentication. Rebuild with npm run build:cap.");
	throw l.code = "auth/native-capacitor-bridge-missing", l;
}
function s(e, n) {
	return new Promise((r, i) => {
		let a = setTimeout(() => {
			let e = Error(n);
			e.code = "auth/native-google-timeout", i(e);
		}, t);
		e.then((e) => {
			clearTimeout(a), r(e);
		}, (e) => {
			clearTimeout(a), i(e);
		});
	});
}
async function c() {
	r("plugin-call-start");
	let e = o();
	try {
		let t = await s(e.signInWithGoogle(), "Native Google sign-in timed out. In Xcode: add GoogleService-Info.plist to the App target and register the REVERSED_CLIENT_ID URL scheme (see docs/NATIVE_IOS_GOOGLE_AUTH.md)."), n = t?.credential?.idToken;
		if (!n) {
			let e = /* @__PURE__ */ Error("Native Google sign-in returned no id token. Verify GoogleService-Info.plist and the REVERSED_CLIENT_ID URL scheme in Xcode.");
			throw e.code = "auth/native-google-no-token", r("plugin-call-error", {
				code: e.code,
				message: e.message
			}), e;
		}
		return r("plugin-call-resolved", {
			hasIdToken: !0,
			hasAccessToken: !!t.credential?.accessToken
		}), {
			idToken: n,
			accessToken: t.credential?.accessToken ?? void 0
		};
	} catch (e) {
		let t = e;
		throw r("plugin-call-error", {
			code: t?.code ?? null,
			message: t?.message ?? String(e)
		}), e;
	}
}
//#endregion
export { c as nativeGoogleSignIn };
