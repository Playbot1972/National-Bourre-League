/**
 * Capacitor-native Google sign-in bridge (built to docs/auth-google-native.js).
 * Web builds never import this module.
 */
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";

export async function nativeGoogleSignIn(): Promise<{
  idToken: string;
  accessToken?: string;
}> {
  const result = await FirebaseAuthentication.signInWithGoogle();
  const idToken = result?.credential?.idToken;
  if (!idToken) {
    const err = new Error("Native Google sign-in returned no id token.");
    (err as Error & { code?: string }).code = "auth/native-google-no-token";
    throw err;
  }
  return {
    idToken,
    accessToken: result.credential?.accessToken ?? undefined,
  };
}
