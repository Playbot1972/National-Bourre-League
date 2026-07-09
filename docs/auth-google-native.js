//#region src/native/auth-google-native.ts
var e = "FirebaseAuthentication", t = 45e3;
function n() {
	if (!(typeof globalThis > "u")) return globalThis.Capacitor;
}
function r(e, t) {
	t === void 0 ? console.info("[nbl-auth]", e) : console.info("[nbl-auth]", e, t);
}
function i(t) {
	return typeof t.isPluginAvailable == "function" ? t.isPluginAvailable(e) : typeof t.Plugins?.[e]?.signInWithGoogle == "function";
}
function a() {
	let t = n();
	if (!t?.isNativePlatform?.()) {
		let e = /* @__PURE__ */ Error("Native Google sign-in requires the Capacitor app.");
		throw e.code = "auth/native-not-capacitor", e;
	}
	let a = i(t);
	if (r("plugin-availability-check", {
		available: a,
		platform: typeof t.getPlatform == "function" ? t.getPlatform() : "unknown",
		hasRegisterPlugin: typeof t.registerPlugin == "function",
		hasPluginsEntry: !!t.Plugins?.[e]
	}), !a) {
		let e = /* @__PURE__ */ Error("FirebaseAuthentication native plugin is unavailable. Run npm run build:cap, npx cap sync ios, then rebuild in Xcode.");
		throw e.code = "auth/native-firebase-plugin-unavailable", e;
	}
	let o = t.Plugins?.[e];
	if (typeof o?.signInWithGoogle == "function") return o;
	if (typeof t.registerPlugin != "function") {
		let e = /* @__PURE__ */ Error("Capacitor registerPlugin is unavailable in this WebView.");
		throw e.code = "auth/native-capacitor-register-missing", e;
	}
	return t.registerPlugin(e);
}
function o(e, n) {
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
async function s() {
	r("plugin-call-start");
	let e = a();
	try {
		let t = await o(e.signInWithGoogle(), "Native Google sign-in timed out. In Xcode: add GoogleService-Info.plist to the App target and register the REVERSED_CLIENT_ID URL scheme (see docs/NATIVE_IOS_GOOGLE_AUTH.md)."), n = t?.credential?.idToken;
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
export { s as nativeGoogleSignIn };
