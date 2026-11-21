import * as Crypto from 'expo-crypto';
import { secureStorage } from './secureStorage';

let cached: string | undefined;

/**
 * Identificador de instalación aleatorio (no deriva de IMEI/IDFA → privacidad).
 * El BFF liga sesión y tokens a este id (device binding).
 */
export async function getDeviceId(): Promise<string> {
  if (cached) return cached;
  const stored = await secureStorage.getDeviceId();
  if (stored) return (cached = stored);
  const id = `dev-${Crypto.randomUUID()}`;
  await secureStorage.setDeviceId(id);
  return (cached = id);
}
