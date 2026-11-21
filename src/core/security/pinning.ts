import {
  addSslPinningErrorListener,
  initializeSslPinning,
  isSslPinningAvailable,
} from 'react-native-ssl-public-key-pinning';
import { config, isProduction } from '../config';

/**
 * Certificate (SPKI) pinning para todas las llamadas fetch hacia el BFF
 * (MASVS-NETWORK-2). Mitiga MITM con CAs instaladas por el usuario o malware.
 */
export async function setupSslPinning(onFailure: (host: string) => void): Promise<void> {
  const domains = Object.entries(config.sslPins);
  if (domains.length === 0) {
    if (isProduction) throw new Error('SSL pinning no configurado');
    return;
  }
  if (!isSslPinningAvailable()) {
    if (isProduction) throw new Error('SSL pinning no disponible');
    return;
  }
  await initializeSslPinning(
    Object.fromEntries(domains.map(([host, pins]) => [host, { includeSubdomains: false, publicKeyHashes: pins }])),
  );
  addSslPinningErrorListener((e) => onFailure(e.serverHostname));
}
