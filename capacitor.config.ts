import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'win.booray.app',
  appName: 'Booray',
  /** Social app (Firebase auth, rooms, live table) — not the Vite tutorial at dist root. */
  webDir: 'dist/social',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#000000',
      showSpinner: false,
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
