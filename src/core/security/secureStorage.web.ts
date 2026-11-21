/**
 * SOLO para desarrollo/revisión visual en navegador (React Native Web).
 * La web NO es una plataforma soportada de la app: aquí no hay Keychain/Keystore,
 * así que nada se persiste (memoria del proceso) y no hay protección biométrica.
 * Metro usa este archivo únicamente al empaquetar para web.
 */
const memory = new Map<string, string>();

export const secureStorage = {
  async getDeviceId() {
    return memory.get('deviceId') ?? null;
  },
  async setDeviceId(id: string) {
    memory.set('deviceId', id);
  },
  async saveRefreshToken(token: string, _requireBiometrics: boolean) {
    memory.set('refresh', token);
  },
  async readRefreshToken() {
    return memory.get('refresh') ?? null;
  },
  async hasBiometricSession() {
    return false;
  },
  async clearSession() {
    memory.delete('refresh');
  },
};
