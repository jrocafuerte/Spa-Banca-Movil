import * as Crypto from 'expo-crypto';
import { config } from '../config';
import { getDeviceId } from '../security/deviceId';
import { secureStorage } from '../security/secureStorage';
import { useSession } from '../session/sessionStore';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly requestId?: string,
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  /** Para operaciones monetarias: misma clave en reintentos ⇒ sin duplicados. */
  idempotencyKey?: string;
}

let refreshing: Promise<boolean> | undefined;

/** Single-flight: varias peticiones con 401 comparten un solo refresh. */
async function refreshAccessToken(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const refreshToken = await secureStorage.readRefreshToken();
      if (!refreshToken) return false;
      const res = await rawFetch('/v1/auth/refresh', {
        method: 'POST',
        body: { refreshToken, deviceId: await getDeviceId() },
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { accessToken: string; refreshToken: string };
      await secureStorage.saveRefreshToken(data.refreshToken, await secureStorage.hasBiometricSession());
      useSession.getState().setAccessToken(data.accessToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = undefined;
    }
  })();
  return refreshing;
}

async function rawFetch(path: string, opts: RequestOptions, token?: string): Promise<Response> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Request-Id': Crypto.randomUUID(),
    'X-Device-Id': await getDeviceId(),
  };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  if (opts.idempotencyKey) headers['Idempotency-Key'] = opts.idempotencyKey;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
  try {
    return await fetch(`${config.apiUrl}${path}`, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export async function http<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const auth = opts.auth ?? true;
  let res: Response;
  try {
    res = await rawFetch(path, opts, auth ? useSession.getState().accessToken : undefined);
    if (auth && res.status === 401 && (await refreshAccessToken())) {
      res = await rawFetch(path, opts, useSession.getState().accessToken);
    }
  } catch {
    throw new ApiError(0, 'No pudimos conectarnos. Revisa tu conexión.');
  }

  if (auth && res.status === 401) {
    await secureStorage.clearSession();
    useSession.getState().signOut();
    throw new ApiError(401, 'Tu sesión expiró');
  }
  const requestId = res.headers.get('x-request-id') ?? undefined;
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => undefined);
  if (!res.ok) {
    // Se muestra el mensaje del BFF (ya saneado); nunca stack traces.
    throw new ApiError(res.status, (data as { detail?: string })?.detail ?? 'Ocurrió un error', requestId);
  }
  return data as T;
}

export const newIdempotencyKey = () => Crypto.randomUUID();
