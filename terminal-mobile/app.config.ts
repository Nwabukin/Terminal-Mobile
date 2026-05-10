import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Terminal',
  slug: 'terminal-mobile',
  scheme: 'terminal',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0C0C0F',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.terminal.mobile',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0C0C0F',
    },
    package: 'com.terminal.mobile',
    edgeToEdgeEnabled: true,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    'expo-secure-store',
    'expo-font',
    'expo-location',
    [
      '@rnmapbox/maps',
      {
        // Must match @rnmapbox/maps package.json `mapbox.android` for this release (SDK APIs used by Kotlin sources).
        RNMapboxMapsVersion: '11.18.2',
        // EAS injects RNMAPBOX_MAPS_DOWNLOAD_TOKEN; local dev may use MAPBOX_DOWNLOAD_TOKEN.
        RNMapboxMapsDownloadToken:
          process.env.RNMAPBOX_MAPS_DOWNLOAD_TOKEN ??
          process.env.MAPBOX_DOWNLOAD_TOKEN ??
          '',
      },
    ],
  ],
});
