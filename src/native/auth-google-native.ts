/**
 * Capacitor-native Google sign-in bridge (built to docs/auth-google-native.js).
 * Web builds never import this module.
 */
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

export async function nativeGoogleSignIn(): Promise<{
  idToken: string;
  accessToken?: string;
}> {
  console.info("[nbl-auth]", "native-google-plugin-call-start");
  try {
    const result = await FirebaseAuthentication.signInWithGoogle();
    const idToken = result?.credential?.idToken;
    if (!idToken) {
      const err = new Error("Native Google sign-in returned no id token.");
      (err as Error & { code?: string }).code = "auth/native-google-no-token";
      console.info("[nbl-auth]", "native-google-plugin-error", {
        code: err.code,
        message: err.message,
      });
      throw err;
    }
    console.info("[nbl-auth]", "native-google-plugin-call-resolved", {
      hasIdToken: true,
      hasAccessToken: Boolean(result.credential?.accessToken),
    });
    return {
      idToken,
      accessToken: result.credential?.accessToken ?? undefined,
    };
  } catch (err) {
    const e = err as Error & { code?: string };
    console.info("[nbl-auth]", "native-google-plugin-error", {
      code: e?.code ?? null,
      message: e?.message ?? String(err),
    });
    throw err;
  }
}
