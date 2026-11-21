import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Configuración por ambiente (APP_ENV = development | qa | production).
 * Solo contiene datos NO secretos (URLs y pines de clave pública): todo lo que
 * va en el binario se considera público y es extraíble por ingeniería inversa.
 */
const APP_ENV = (process.env.APP_ENV ?? 'development') as 'development' | 'qa' | 'production';

const ENVS = {
  development: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://10.0.2.2:3000',
    recaudosUrl: process.env.EXPO_PUBLIC_RECAUDOS_URL ?? 'http://10.0.2.2:3002',
    pins: {} as Record<string, string[]>,
  },
  qa: {
    apiUrl: 'https://api-qa.banco.example',
    recaudosUrl: 'https://recaudos-qa.banco.example',
    pins: { 'api-qa.banco.example': ['REEMPLAZAR_PIN_PRIMARIO_BASE64=', 'REEMPLAZAR_PIN_BACKUP_BASE64='] },
  },
  production: {
    apiUrl: 'https://api.banco.example',
    recaudosUrl: 'https://recaudos.banco.example',
    // SPKI SHA-256 (actual + respaldo). Rotar con al menos una versión de antelación.
    pins: { 'api.banco.example': ['REEMPLAZAR_PIN_PRIMARIO_BASE64=', 'REEMPLAZAR_PIN_BACKUP_BASE64='] },
  },
}[APP_ENV];

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: APP_ENV === 'production' ? 'Banca Móvil' : `Banca Móvil (${APP_ENV})`,
  slug: 'spa-banca-movil',
  scheme: 'bancamovil',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  ios: {
    bundleIdentifier: `com.banco.bancamovil${APP_ENV === 'production' ? '' : `.${APP_ENV}`}`,
    supportsTablet: false,
    infoPlist: {
      // ATS activo: sin excepciones de tráfico en claro fuera de desarrollo.
      NSAppTransportSecurity:
        APP_ENV === 'development' ? { NSAllowsLocalNetworking: true } : { NSAllowsArbitraryLoads: false },
      ITSAppUsesNonExemptEncryption: false,
    },
    privacyManifests: {
      NSPrivacyTracking: false,
      NSPrivacyCollectedDataTypes: [],
    },
  },
  android: {
    package: `com.banco.bancamovil${APP_ENV === 'production' ? '' : `.${APP_ENV}`}`,
    allowBackup: false, // evita extracción de datos vía adb backup / cloud backup
    adaptiveIcon: {
      backgroundColor: '#0B5FFF',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    blockedPermissions: [
      'android.permission.SYSTEM_ALERT_WINDOW', // mitiga overlays / tapjacking
      'android.permission.READ_EXTERNAL_STORAGE',
      'android.permission.WRITE_EXTERNAL_STORAGE',
    ],
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    [
      'expo-secure-store',
      { faceIDPermission: 'Usamos Face ID para proteger el acceso a tu banca.', configureAndroidBackup: true },
    ],
    ['expo-local-authentication', { faceIDPermission: 'Usamos Face ID para confirmar tus operaciones.' }],
    'expo-sharing',
  ],
  experiments: { typedRoutes: true },
  extra: {
    appEnv: APP_ENV,
    apiUrl: ENVS.apiUrl,
    recaudosUrl: ENVS.recaudosUrl,
    sslPins: ENVS.pins,
    // Configuración regional del banco (BCP 47), p. ej. 'es-PE', 'es-CO', 'es-EC', 'es-MX'.
    locale: process.env.APP_LOCALE ?? 'es-419',
  },
});
