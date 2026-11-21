/** HMAC-SHA256 (RFC 2104) sobre una función SHA-256 inyectable (expo-crypto en la app, node:crypto en tests). */
export type Sha256 = (data: Uint8Array) => Promise<Uint8Array>;

const BLOCK = 64;

export async function hmacSha256(sha256: Sha256, key: Uint8Array, message: Uint8Array): Promise<Uint8Array> {
  let k = key.length > BLOCK ? await sha256(key) : key;
  const padded = new Uint8Array(BLOCK);
  padded.set(k);
  k = padded;
  const ipad = new Uint8Array(BLOCK + message.length);
  const opadKey = new Uint8Array(BLOCK);
  for (let i = 0; i < BLOCK; i++) {
    ipad[i] = k[i]! ^ 0x36;
    opadKey[i] = k[i]! ^ 0x5c;
  }
  ipad.set(message, BLOCK);
  const inner = await sha256(ipad);
  const outer = new Uint8Array(BLOCK + inner.length);
  outer.set(opadKey);
  outer.set(inner, BLOCK);
  return sha256(outer);
}

const B64URL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export function toBase64Url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const n = (bytes[i]! << 16) | ((bytes[i + 1] ?? 0) << 8) | (bytes[i + 2] ?? 0);
    out += B64URL[(n >> 18) & 63]! + B64URL[(n >> 12) & 63]!;
    if (i + 1 < bytes.length) out += B64URL[(n >> 6) & 63]!;
    if (i + 2 < bytes.length) out += B64URL[n & 63]!;
  }
  return out;
}

export function fromBase64Url(s: string): Uint8Array {
  const clean = s.replace(/[^A-Za-z0-9\-_]/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 4) {
    const chunk = clean.slice(i, i + 4);
    const n = [...chunk].reduce((acc, c, j) => acc | (B64URL.indexOf(c) << (18 - 6 * j)), 0);
    bytes.push((n >> 16) & 255);
    if (chunk.length > 2) bytes.push((n >> 8) & 255);
    if (chunk.length > 3) bytes.push(n & 255);
  }
  return Uint8Array.from(bytes);
}

export const utf8 = (s: string) => new TextEncoder().encode(s);

/** Mensaje canónico firmado para autorizar una transacción (idéntico en el BFF). */
export const transactionMessage = (intentHash: string, amount: number, currency: string) =>
  `${intentHash}|${amount.toFixed(2)}|${currency}`;
