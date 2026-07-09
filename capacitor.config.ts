import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'win.booray.app',
  appName: 'Booray',
  /** Social app (Firebase auth, rooms, live table) — not the Vite tutorial at dist root. */
  webDir: 'dist/social',
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
