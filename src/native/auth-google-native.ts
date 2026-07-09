/**
 * Capacitor-native Google sign-in bridge (built to docs/auth-google-native.js).
 * Uses window.Capacitor only — do not bundle @capacitor-firebase/authentication
 * (bundling pulls a web fallback that calls signInWithPopup in WKWebView).
 */

type GoogleSignInResult = {
  credential?: { idToken?: string; accessToken?: string };
};

type FirebaseAuthenticationPlugin = {
  signInWithGoogle: () => Promise<GoogleSignInResult>;
};

type CapacitorGlobal = {
  isNativePlatform?: () => boolean;
  isPluginAvailable?: (name: string) => boolean;
  getPlatform?: () => string;
  Plugins?: Record<string, unknown>;
  registerPlugin?: (name: string, impl?: object) => FirebaseAuthenticationPlugin;
};

const PLUGIN_NAME = "FirebaseAuthentication";
const PLUGIN_CALL_TIMEOUT_MS = 45_000;

function logAuth(event: string, detail?: Record<string, unknown>) {
  if (detail !== undefined) {
    console.info("[nbl-auth]", event, detail);
  } else {
    console.info("[nbl-auth]", event);
  }
}

function pluginAvailable(cap: CapacitorGlobal): boolean {
  if (typeof cap.isPluginAvailable === "function") {
    return cap.isPluginAvailable(PLUGIN_NAME);
  }
  const plugin = cap.Plugins?.[PLUGIN_NAME] as FirebaseAuthenticationPlugin | undefined;
  return typeof plugin?.signInWithGoogle === "function";
}

function getFirebaseAuthenticationPlugin(): FirebaseAuthenticationPlugin {
  const cap = (typeof window !== "undefined" ? window.Capacitor : undefined) as
    | CapacitorGlobal
    | undefined;

  if (!cap?.isNativePlatform?.()) {
    const err = new Error("Native Google sign-in requires the Capacitor app.");
    (err as Error & { code?: string }).code = "auth/native-not-capacitor";
    throw err;
  }

  const available = pluginAvailable(cap);
  logAuth("plugin-availability-check", {
    available,
    platform: typeof cap.getPlatform === "function" ? cap.getPlatform() : "unknown",
    hasRegisterPlugin: typeof cap.registerPlugin === "function",
    hasPluginsEntry: Boolean(cap.Plugins?.[PLUGIN_NAME]),
  });

  if (!available) {
    const err = new Error(
      "FirebaseAuthentication native plugin is unavailable. Run npm run build:cap, npx cap sync ios, then rebuild in Xcode.",
    );
    (err as Error & { code?: string }).code = "auth/native-firebase-plugin-unavailable";
    throw err;
  }

  const existing = cap.Plugins?.[PLUGIN_NAME] as FirebaseAuthenticationPlugin | undefined;
  if (typeof existing?.signInWithGoogle === "function") {
    return existing;
  }

  if (typeof cap.registerPlugin !== "function") {
    const err = new Error("Capacitor registerPlugin is unavailable in this WebView.");
    (err as Error & { code?: string }).code = "auth/native-capacitor-register-missing";
    throw err;
  }

  // Native-only proxy — no web implementation (avoids WKWebView popup/redirect no-op).
  return cap.registerPlugin(PLUGIN_NAME);
}

function pluginCallTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error(message);
      (err as Error & { code?: string }).code = "auth/native-google-timeout";
      reject(err);
    }, PLUGIN_CALL_TIMEOUT_MS);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

export async function nativeGoogleSignIn(): Promise<{
  idToken: string;
  accessToken?: string;
}> {
  logAuth("plugin-call-start");
  const plugin = getFirebaseAuthenticationPlugin();

  try {
    const result = await pluginCallTimeout(
      plugin.signInWithGoogle(),
      "Native Google sign-in timed out. In Xcode: add GoogleService-Info.plist to the App target and register the REVERSED_CLIENT_ID URL scheme (see docs/NATIVE_IOS_GOOGLE_AUTH.md).",
    );

    const idToken = result?.credential?.idToken;
    if (!idToken) {
      const err = new Error(
        "Native Google sign-in returned no id token. Verify GoogleService-Info.plist and the REVERSED_CLIENT_ID URL scheme in Xcode.",
      );
      (err as Error & { code?: string }).code = "auth/native-google-no-token";
      logAuth("plugin-call-error", {
        code: err.code,
        message: err.message,
      });
      throw err;
    }

    logAuth("plugin-call-resolved", {
      hasIdToken: true,
      hasAccessToken: Boolean(result.credential?.accessToken),
    });

    return {
      idToken,
      accessToken: result.credential?.accessToken ?? undefined,
    };
  } catch (err) {
    const e = err as Error & { code?: string };
    logAuth("plugin-call-error", {
      code: e?.code ?? null,
      message: e?.message ?? String(err),
    });
    throw err;
  }
}
