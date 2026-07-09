import CapacitorFirebaseAuthentication

public let isCapacitorApp = true

// Force-link FirebaseAuthenticationPlugin for Capacitor packageClassList registration (SPM).
enum NBLCapPluginLinker {
    static let firebaseAuthentication = FirebaseAuthenticationPlugin.self
}
