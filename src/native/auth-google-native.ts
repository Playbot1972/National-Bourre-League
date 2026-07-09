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
  PluginHeaders?: ReadonlyArray<{ name?: string }>;
  nativePromise?: (
    pluginName: string,
    methodName: string,
    options?: Record<string, unknown>,
  ) => Promise<GoogleSignInResult>;
  registerPlugin?: (name: string, impl?: object) => FirebaseAuthenticationPlugin;
};

type CodedError = Error & { code?: string };

const PLUGIN_NAME = "FirebaseAuthentication";
const PLUGIN_CALL_TIMEOUT_MS = 45_000;

function getWindowCapacitor(): CapacitorGlobal | undefined {
  if (typeof globalThis === "undefined") return undefined;
  return (globalThis as typeof globalThis & { Capacitor?: CapacitorGlobal }).Capacitor;
}

function logAuth(event: string, detail?: Record<string, unknown>) {
  if (detail !== undefined) {
    console.info("[nbl-auth]", event, detail);
  } else {
    console.info("[nbl-auth]", event);
  }
}

function hasNativePluginHeader(cap: CapacitorGlobal): boolean {
  return (
    Array.isArray(cap.PluginHeaders) &&
    cap.PluginHeaders.some((header) => header?.name === PLUGIN_NAME)
  );
}

function pluginAvailable(cap: CapacitorGlobal): boolean {
  const plugin = cap.Plugins?.[PLUGIN_NAME] as FirebaseAuthenticationPlugin | undefined;
  if (typeof plugin?.signInWithGoogle === "function") return true;
  if (hasNativePluginHeader(cap)) return true;
  if (typeof cap.isPluginAvailable === "function") {
    return cap.isPluginAvailable(PLUGIN_NAME);
  }
  return false;
}

function getFirebaseAuthenticationPlugin(): FirebaseAuthenticationPlugin {
  const cap = getWindowCapacitor();

  if (!cap?.isNativePlatform?.()) {
    const err = new Error("Native Google sign-in requires the Capacitor app.");
    (err as CodedError).code = "auth/native-not-capacitor";
    throw err;
  }

  const nativeHeader = hasNativePluginHeader(cap);
  const available = pluginAvailable(cap);
  logAuth("plugin-availability-check", {
    available,
    nativeHeader,
    platform: typeof cap.getPlatform === "function" ? cap.getPlatform() : "unknown",
    hasNativePromise: typeof cap.nativePromise === "function",
    hasRegisterPlugin: typeof cap.registerPlugin === "function",
    hasPluginsEntry: Boolean(cap.Plugins?.[PLUGIN_NAME]),
  });

  if (!available) {
    const err = new Error(
      "FirebaseAuthentication native plugin is unavailable. Run npm run build:cap, npx cap sync ios, then rebuild in Xcode.",
    );
    (err as CodedError).code = "auth/native-firebase-plugin-unavailable";
    throw err;
  }

  const existing = cap.Plugins?.[PLUGIN_NAME] as FirebaseAuthenticationPlugin | undefined;
  if (typeof existing?.signInWithGoogle === "function") {
    return existing;
  }

  // iOS Capacitor runtime exposes nativePromise + PluginHeaders (no registerPlugin).
  if (nativeHeader && typeof cap.nativePromise === "function") {
    logAuth("plugin-bridge-nativePromise");
    return {
      signInWithGoogle: () => cap.nativePromise!(PLUGIN_NAME, "signInWithGoogle", {}),
    };
  }

  if (typeof cap.registerPlugin === "function") {
    return cap.registerPlugin(PLUGIN_NAME);
  }

  const err = new Error(
    "Capacitor native bridge cannot reach FirebaseAuthentication. Rebuild with npm run build:cap.",
  );
  (err as CodedError).code = "auth/native-capacitor-bridge-missing";
  throw err;
}

function pluginCallTimeout<T>(promise: Promise<T>, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err = new Error(message);
      (err as CodedError).code = "auth/native-google-timeout";
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
      const err: CodedError = new Error(
        "Native Google sign-in returned no id token. Verify GoogleService-Info.plist and the REVERSED_CLIENT_ID URL scheme in Xcode.",
      );
      err.code = "auth/native-google-no-token";
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
    const e = err as CodedError;
    logAuth("plugin-call-error", {
      code: e?.code ?? null,
      message: e?.message ?? String(err),
    });
    throw err;
  }
}
