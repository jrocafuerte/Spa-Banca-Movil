import Constants from 'expo-constants';

interface Extra {
  appEnv: 'development' | 'qa' | 'production';
  apiUrl: string;
  recaudosUrl: string;
  sslPins: Record<string, string[]>;
}

const extra = (Constants.expoConfig?.extra ?? {}) as Partial<Extra>;

export const config = {
  appEnv: extra.appEnv ?? 'development',
  apiUrl: extra.apiUrl ?? 'http://localhost:3000',
  recaudosUrl: extra.recaudosUrl ?? 'http://localhost:3002',
  sslPins: extra.sslPins ?? {},
  /** Tiempo de inactividad tras el cual se cierra la sesión (PCI / regulación local). */
  inactivityTimeoutMs: 5 * 60 * 1000,
  /** Tiempo máximo en segundo plano antes de exigir re-autenticación. */
  backgroundTimeoutMs: 60 * 1000,
  requestTimeoutMs: 15_000,
} as const;

export const isProduction = config.appEnv === 'production';

/** Orígenes de los micro frontends que la app puede cargar en WebView. */
export const trustedWebOrigins = [new URL(config.recaudosUrl).origin];
