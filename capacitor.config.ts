import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'win.booray.app',
  appName: 'Booray',
  /** Social app (Firebase auth, rooms, live table) — not the Vite tutorial at dist root. */
  webDir: 'dist/social',
  ios: {
    /**
     * WKWebView.isInspectable (iOS 16.4+) for Safari Web Inspector.
     * Off by default for App Store / release builds. Opt in for local device QA:
     *   CAPACITOR_WEB_DEBUG=1 npm run build:cap
     */
    webContentsDebuggingEnabled: process.env.CAPACITOR_WEB_DEBUG === '1',
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
