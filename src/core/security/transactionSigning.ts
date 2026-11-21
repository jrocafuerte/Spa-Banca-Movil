import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { hmacSha256, toBase64Url, fromBase64Url, transactionMessage, utf8 } from './hmac';

/**
 * Firma de transacciones ligada a biometría (MASVS-AUTH-2 / MSTG-AUTH-8).
 *
 * La clave de firma vive en Keychain/Keystore con `requireAuthentication`: el
 * sistema operativo solo la descifra tras una biometría válida. Así la
 * aprobación no es un simple booleano (evitable con hooking), sino una prueba
 * criptográfica que el BFF verifica sobre el hash exacto de la operación.
 *
 * Evolución prevista: par de claves asimétricas en Secure Enclave / StrongBox
 * (o passkeys/FIDO2) para que el servidor guarde solo la clave pública.
 */
const KEY_NAME = 'bm.txn_signing_key';
const OPTS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY,
  requireAuthentication: true,
  authenticationPrompt: 'Confirma la operación con tu biometría',
};

const sha256 = async (data: Uint8Array) =>
  new Uint8Array(await Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, data as Uint8Array<ArrayBuffer>));

export const transactionSigning = {
  /** Genera la clave (32 bytes) y la devuelve en base64url para registrarla en el BFF. */
  async enroll(): Promise<string> {
    const key = toBase64Url(Crypto.getRandomBytes(32));
    await SecureStore.setItemAsync(KEY_NAME, key, OPTS);
    return key;
  },

  /** Lee la clave (dispara la biometría del SO) y firma el mensaje canónico de la transacción. */
  async sign(intentHash: string, amount: number, currency: string): Promise<string | undefined> {
    const key = await SecureStore.getItemAsync(KEY_NAME, OPTS).catch(() => null);
    if (!key) return undefined;
    const mac = await hmacSha256(sha256, fromBase64Url(key), utf8(transactionMessage(intentHash, amount, currency)));
    return toBase64Url(mac);
  },

  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(KEY_NAME, { keychainAccessible: OPTS.keychainAccessible });
  },
};
