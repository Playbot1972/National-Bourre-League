//#region src/native/auth-google-native.ts
var e = "FirebaseAuthentication", t = 45e3;
function n(e, t) {
	t === void 0 ? console.info("[nbl-auth]", e) : console.info("[nbl-auth]", e, t);
}
function r(t) {
	return typeof t.isPluginAvailable == "function" ? t.isPluginAvailable(e) : typeof t.Plugins?.[e]?.signInWithGoogle == "function";
}
function i() {
	let t = typeof window < "u" ? window.Capacitor : void 0;
	if (!t?.isNativePlatform?.()) {
		let e = /* @__PURE__ */ Error("Native Google sign-in requires the Capacitor app.");
		throw e.code = "auth/native-not-capacitor", e;
	}
	let i = r(t);
	if (n("plugin-availability-check", {
		available: i,
		platform: typeof t.getPlatform == "function" ? t.getPlatform() : "unknown",
		hasRegisterPlugin: typeof t.registerPlugin == "function",
		hasPluginsEntry: !!t.Plugins?.[e]
	}), !i) {
		let e = /* @__PURE__ */ Error("FirebaseAuthentication native plugin is unavailable. Run npm run build:cap, npx cap sync ios, then rebuild in Xcode.");
		throw e.code = "auth/native-firebase-plugin-unavailable", e;
	}
	let a = t.Plugins?.[e];
	if (typeof a?.signInWithGoogle == "function") return a;
	if (typeof t.registerPlugin != "function") {
		let e = /* @__PURE__ */ Error("Capacitor registerPlugin is unavailable in this WebView.");
		throw e.code = "auth/native-capacitor-register-missing", e;
	}
	return t.registerPlugin(e);
}
function a(e, n) {
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
async function o() {
	n("plugin-call-start");
	let e = i();
	try {
		let t = await a(e.signInWithGoogle(), "Native Google sign-in timed out. In Xcode: add GoogleService-Info.plist to the App target and register the REVERSED_CLIENT_ID URL scheme (see docs/NATIVE_IOS_GOOGLE_AUTH.md)."), r = t?.credential?.idToken;
		if (!r) {
			let e = /* @__PURE__ */ Error("Native Google sign-in returned no id token. Verify GoogleService-Info.plist and the REVERSED_CLIENT_ID URL scheme in Xcode.");
			throw e.code = "auth/native-google-no-token", n("plugin-call-error", {
				code: e.code,
				message: e.message
			}), e;
		}
		return n("plugin-call-resolved", {
			hasIdToken: !0,
			hasAccessToken: !!t.credential?.accessToken
		}), {
			idToken: r,
			accessToken: t.credential?.accessToken ?? void 0
		};
	} catch (e) {
		let t = e;
		throw n("plugin-call-error", {
			code: t?.code ?? null,
			message: t?.message ?? String(e)
		}), e;
	}
}
//#endregion
export { o as nativeGoogleSignIn };
