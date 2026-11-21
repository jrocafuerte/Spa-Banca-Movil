import { createHash, createHmac, randomBytes } from 'node:crypto';
import { fromBase64Url, hmacSha256, toBase64Url, utf8 } from './hmac';

const sha256 = async (d: Uint8Array) => new Uint8Array(createHash('sha256').update(d).digest());
const hex = (b: Uint8Array) => Buffer.from(b).toString('hex');

describe('hmacSha256', () => {
  it('cumple el vector de prueba RFC 4231 #2', async () => {
    const mac = await hmacSha256(sha256, utf8('Jefe'), utf8('what do ya want for nothing?'));
    expect(hex(mac)).toBe('5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843');
  });

  it('coincide con node:crypto para claves aleatorias (incl. > 64 bytes)', async () => {
    for (const len of [16, 32, 64, 100]) {
      const key = randomBytes(len);
      const msg = randomBytes(77);
      const ours = await hmacSha256(sha256, key, msg);
      expect(hex(ours)).toBe(createHmac('sha256', key).update(msg).digest('hex'));
    }
  });
});

describe('base64url', () => {
  it('ida y vuelta, compatible con Buffer', () => {
    for (const len of [0, 1, 2, 3, 31, 32, 33]) {
      const b = randomBytes(len);
      const enc = toBase64Url(b);
      expect(enc).toBe(b.toString('base64url'));
      expect(Buffer.from(fromBase64Url(enc)).equals(b)).toBe(true);
    }
  });
});
