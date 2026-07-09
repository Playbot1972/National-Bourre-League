import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'win.booray.app',
  appName: 'Booray',
  /** Social app (Firebase auth, rooms, live table) — not the Vite tutorial at dist root. */
  webDir: 'dist/social',
  ios: {
    /**
     * WKWebView.isInspectable (iOS 16.4+) for Safari Web Inspector.
     * Capacitor SPM ignores the app DEBUG flag — without this, Release/device
     * builds may attach but show an empty or unusable console.
     * Set CAPACITOR_WEB_DEBUG=0 before cap sync to disable for production.
     */
    webContentsDebuggingEnabled: process.env.CAPACITOR_WEB_DEBUG !== '0',
  },
  plugins: {
    SplashScreen: {
      /** Hide manually when app boot completes — avoids auto-timeout warning. */
      launchAutoHide: false,
      backgroundColor: '#000000',
      showSpinner: false,
      launchFadeOutDuration: 300,
    },
    FirebaseAuthentication: {
      authDomain: 'booray.win',
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
  experimental: {
    ios: {
      spm: {
        packageOptions: {
          '@capacitor-firebase/authentication': {
            symlink: true,
          },
        },
      },
    },
  },
};

export default config;
